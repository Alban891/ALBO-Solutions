/**
 * CFO Dashboard - Wirtschaftlichkeit Module
 * Calculator - Business Logic Layer
 * 
 * @module wirtschaftlichkeit/calculator
 * @description Core calculation engine for contribution margin scheme and KPIs
 * @author Senior Development Team
 * @version 4.0.0 - DATABASE INTEGRATION
 * 
 * ✅ ÄNDERUNGEN v4.0:
 * - Forecasts aus ALBO_Revenue_Forecasts Tabelle laden (nicht mehr aus artikel.hardware_model_data)
 * - Async/Await Support für Datenbankzugriffe
 * - Forecast-Cache für Performance
 * - Rückwärts-kompatibel: Fallback auf alte Struktur
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';
import {
    HK_DEFAULTS,
    KOSTEN_MAPPING,
    OVERHEAD_DEFAULTS,
    CALCULATION_CONSTANTS,
    BRANCHEN_BENCHMARKS
} from './constants.js';

// Import API functions for forecast loading
import { loadAllForecasts } from '../../api.js';

// ==========================================
// FORECAST CACHE
// ==========================================

/**
 * In-memory cache for loaded forecasts
 * Avoids repeated database calls during calculation
 */
const forecastCache = new Map();

/**
 * Clear forecast cache
 * Call this when forecasts are updated
 */
export function clearForecastCache() {
    forecastCache.clear();
    console.log('🗑️ Forecast cache cleared');
}

/**
 * Preload all forecasts for articles
 * 
 * @param {Array} artikelListe - List of articles
 * @returns {Promise<void>}
 * 
 * @private
 */
async function preloadForecasts(artikelListe) {
    console.log(`📥 Preloading forecasts for ${artikelListe.length} articles...`);
    
    const loadPromises = artikelListe.map(async (artikel) => {
        try {
            const forecasts = await loadAllForecasts(artikel.id, true);
            
            if (forecasts && forecasts.length > 0) {
                // Store forecasts in cache by artikel_id
                forecastCache.set(artikel.id, forecasts);
                console.log(`  ✅ ${artikel.name}: Loaded ${forecasts.length} forecast(s)`);
            } else {
                console.log(`  ℹ️ ${artikel.name}: No forecasts found`);
            }
        } catch (error) {
            console.error(`  ❌ ${artikel.name}: Failed to load forecasts:`, error);
        }
    });
    
    await Promise.all(loadPromises);
    console.log(`✅ Forecast preload complete`);
}

/**
 * Get forecast data for an artikel from cache
 * 
 * @param {Object} artikel - Article object
 * @returns {Object|null} Forecast data or null
 * 
 * @private
 */
function getForecastDataFromCache(artikel) {
    const forecasts = forecastCache.get(artikel.id);
    
    if (!forecasts || forecasts.length === 0) {
        return null;
    }
    
    // Find the first active forecast (any model type)
    // Priority: hardware > software > service > package
    const modelPriority = ['hardware', 'software', 'service', 'package'];
    
    for (const modelType of modelPriority) {
        const forecast = forecasts.find(f => 
            f.model_type === modelType && 
            f.is_active === true
        );
        
        if (forecast && forecast.forecast_data) {
            console.log(`  📊 ${artikel.name}: Using ${modelType} forecast`);
            return forecast.forecast_data;
        }
    }
    
    return null;
}

// ==========================================
// MAIN CALCULATION FUNCTION (NOW ASYNC!)
// ==========================================

/**
 * Main calculation engine for project profitability
 * Implements full DB1-DB5 contribution margin scheme
 * 
 * ⚠️ NOW ASYNC! Must be called with await
 * 
 * @param {string} projektId - Project ID
 * @param {import('./types').CalculationOptions} [options={}] - Calculation options
 * @returns {Promise<import('./types').WirtschaftlichkeitResult>} Complete profitability analysis
 * 
 * @example
 * const result = await calculateProjektWirtschaftlichkeit('projekt-123', {
 *   wacc: 0.10,
 *   validateInputs: true,
 *   filteredArtikel: [artikel1, artikel2]
 * });
 * console.log(result.kpis.ebit_margin);
 */
export async function calculateProjektWirtschaftlichkeit(projektId, options = {}) {
    const {
        includeKI = true,
        validateInputs = true,
        wacc = CALCULATION_CONSTANTS.DEFAULT_WACC,
        aggregated = false,
        filteredArtikel = null  // Accept pre-filtered article list
    } = options;
    
    try {
        // 1. Load data
        const projekt = state.getProjekt(projektId);
        if (!projekt) {
            throw new Error(`Projekt ${projektId} nicht gefunden`);
        }
        
        // Use filtered articles if provided, otherwise get all
        const artikelListe = filteredArtikel || state.getArtikelByProjekt(projektId);
        
        if (!artikelListe || artikelListe.length === 0) {
            return createEmptyResult(projektId, 'Keine Artikel vorhanden');
        }
        
        // ✅ NEW: Preload all forecasts from database
        await preloadForecasts(artikelListe);
        
        const projektkosten = getProjektkosten(projektId);
        
        // 2. Validate inputs if required
        if (validateInputs) {
            const validation = validateCalculationInputs(artikelListe, projektkosten);
            if (!validation.isValid) {
                console.warn('Validation warnings:', validation.warnings);
            }
        }
        
        // 3. Determine year range
        const jahre = determineYearRange(artikelListe, projektkosten);
        
        // 4. Calculate per year
        const jahresErgebnisse = {};
        
        jahre.forEach(jahr => {
            jahresErgebnisse[jahr] = calculateJahresWirtschaftlichkeit(
                artikelListe,
                projektkosten,
                jahr,
                options
            );
        });
        
        // 5. Calculate totals
        const totals = calculateTotals(jahresErgebnisse);
        
        // 6. Calculate KPIs
        const kpis = calculateKPIs(jahresErgebnisse, totals, wacc, artikelListe[0]?.typ);
        
        // 7. Create metadata
        const metadata = createMetadata(projektId, artikelListe, projektkosten, jahre);
        
        return {
            jahre: jahresErgebnisse,
            totals,
            kpis,
            metadata
        };
        
    } catch (error) {
        console.error('Fehler in calculateProjektWirtschaftlichkeit:', error);
        return createEmptyResult(projektId, error.message);
    }
}

/**
 * Calculate profitability for a single year
 * Core calculation logic implementing DB1-DB5 scheme
 * 
 * ✅ NEUE VERSION: Verwendet Forecast-Daten aus Datenbank-Cache
 * 
 * @param {import('./types').ArtikelExtended[]} artikelListe - List of articles
 * @param {import('./types').Kostenblock[]} projektkosten - Project cost blocks
 * @param {string} jahr - Year to calculate (YYYY)
 * @param {import('./types').CalculationOptions} options - Calculation options
 * @returns {import('./types').JahresWirtschaftlichkeit} Year profitability
 * 
 * @private
 */
function calculateJahresWirtschaftlichkeit(artikelListe, projektkosten, jahr, options = {}) {
    // Step 1: Calculate Sales Revenue FROM FORECAST DATABASE
    const sales_revenue = calculateSalesRevenueFromForecast(artikelListe, jahr);
    
    // Step 2: Calculate HK components FROM FORECAST DATABASE
    const hk_components = calculateHKComponentsFromForecast(artikelListe, jahr);
    
    // Step 3: DB1 = Sales - Material - Direct Labour
    const material_costs = hk_components.material;
    const direct_labour = hk_components.labour;
    const db1 = sales_revenue - material_costs - direct_labour;
    
    // Step 4: Calculate Manufacturing Overheads
    const material_overhead = hk_components.material_overhead;
    const manufacturing_overhead = hk_components.manufacturing_overhead;
    
    // Step 5: DB2 = DB1 - Material Overhead - Manufacturing Overhead
    // ✅ OPTION: Use DB2 directly from forecast if available
    let db2;
    const directDB2 = calculateDB2FromForecast(artikelListe, jahr);
    
    if (directDB2 !== null) {
        // Use pre-calculated DB2 from forecast
        db2 = directDB2;
        console.log(`✅ Using DB2 from forecast: ${db2.toFixed(2)}`);
    } else {
        // Calculate DB2 from components
        db2 = db1 - material_overhead - manufacturing_overhead;
        console.log(`⚙️ Calculating DB2 from components: ${db2.toFixed(2)}`);
    }
    
    const db2_margin_prozent = sales_revenue > 0 ? (db2 / sales_revenue * 100) : 0;
    
    // Step 6: Get Development Costs from Project Costs (DB3)
    const development_overhead = sumProjectCostsByCategory(
        projektkosten, 
        KOSTEN_MAPPING.development, 
        jahr
    );
    const db3 = db2 - development_overhead;
    
    // Step 7: Get Selling & Marketing Costs (DB4)
    const selling_marketing_costs = sumProjectCostsByCategory(
        projektkosten,
        KOSTEN_MAPPING.selling_marketing,
        jahr
    );
    // Split into selling and marketing for detailed view
    const selling_overhead = selling_marketing_costs * 0.6;  // 60% selling
    const marketing_overhead = selling_marketing_costs * 0.4;  // 40% marketing
    
    const db4 = db3 - selling_overhead - marketing_overhead;
    
    // Step 8: Get Admin & Distribution Costs (DB5)
    const admin_distribution_costs = sumProjectCostsByCategory(
        projektkosten,
        KOSTEN_MAPPING.admin_distribution,
        jahr
    );
    // Split into distribution and admin for detailed view
    const distribution_overhead = admin_distribution_costs * 0.4;  // 40% distribution
    const admin_overhead = admin_distribution_costs * 0.6;  // 60% admin
    
    const db5 = db4 - distribution_overhead - admin_overhead;
    
    // Step 9: EBIT = DB5 (no other adjustments for now)
    const ebit = db5;
    const ebit_margin_prozent = sales_revenue > 0 ? (ebit / sales_revenue * 100) : 0;
    
    return {
        sales_revenue,
        material_costs,
        direct_labour,
        db1,
        material_overhead,
        manufacturing_overhead,
        db2,
        db2_margin_prozent,
        manufacturing_margin: db2,  // Alias for dashboard
        manufacturing_margin_percent: db2_margin_prozent,  // Alias for dashboard
        development_overhead,
        db3,
        selling_overhead,
        marketing_overhead,
        db4,
        distribution_overhead,
        admin_overhead,
        db5,
        ebit,
        ebit_margin_prozent
    };
}

// ========================================
// ✅ ANGEPASSTE FUNKTIONEN - DATABASE INTEGRATION
// ========================================

/**
 * Calculate sales revenue from Revenue Model forecasts (DATABASE VERSION)
 * 
 * Priority:
 * 1. Database: ALBO_Revenue_Forecasts.forecast_data.revenue (PRIMÄR)
 * 2. Fallback: artikel.hardware_model_data.forecast.revenue (Legacy)
 * 3. Fallback: mengen * preise (Old structure)
 * 
 * @param {import('./types').ArtikelExtended[]} artikelListe - List of articles
 * @param {string} jahr - Year (YYYY)
 * @returns {number} Total sales revenue
 * 
 * @private
 */
function calculateSalesRevenueFromForecast(artikelListe, jahr) {
    console.log(`💰 [DB-FORECAST] Calculating sales for ${jahr} with ${artikelListe.length} articles`);
    
    const total = artikelListe.reduce((sum, artikel) => {
        // ✅ NEW: Get forecast data from DATABASE CACHE
        const forecast = getForecastDataFromCache(artikel);
        
        if (forecast && forecast.years && forecast.revenue) {
            const jahrIndex = forecast.years.indexOf(parseInt(jahr));
            
            if (jahrIndex !== -1 && forecast.revenue[jahrIndex] !== undefined) {
                const revenue = forecast.revenue[jahrIndex];
                console.log(`  ✅ ${artikel.name}: DB forecast.revenue[${jahr}] = ${revenue.toFixed(2)}`);
                return sum + revenue;
            }
        }
        
        // FALLBACK 1: Try old artikel structure (for backward compatibility)
        const legacyForecast = getForecastDataLegacy(artikel);
        if (legacyForecast && legacyForecast.years && legacyForecast.revenue) {
            const jahrIndex = legacyForecast.years.indexOf(parseInt(jahr));
            if (jahrIndex !== -1 && legacyForecast.revenue[jahrIndex] !== undefined) {
                const revenue = legacyForecast.revenue[jahrIndex];
                console.log(`  ⚠️ ${artikel.name}: Legacy forecast.revenue[${jahr}] = ${revenue.toFixed(2)}`);
                return sum + revenue;
            }
        }
        
        // FALLBACK 2: Use old structure (mengen * preise)
        console.warn(`  ⚠️ ${artikel.name}: No forecast data, using fallback`);
        const menge = getArtikelValueForYear(artikel, 'menge', jahr);
        const preis = getArtikelValueForYear(artikel, 'preis', jahr);
        
        if (menge > 0 && preis > 0) {
            const revenue = menge * preis;
            console.log(`  📦 ${artikel.name}: fallback (${menge} × ${preis}) = ${revenue.toFixed(2)}`);
            return sum + revenue;
        }
        
        console.log(`  ❌ ${artikel.name}: NO DATA for ${jahr}`);
        return sum;
    }, 0);
    
    console.log(`💰 [DB-FORECAST] Total sales ${jahr}: ${total.toFixed(2)}`);
    return total;
}

/**
 * Calculate HK components from Revenue Model forecasts (DATABASE VERSION)
 * 
 * Uses forecast.totalCost from database and applies HK-Aufteilung to split into:
 * - Material costs
 * - Direct labour
 * - Material overhead
 * - Manufacturing overhead
 * 
 * @param {import('./types').ArtikelExtended[]} artikelListe - List of articles
 * @param {string} jahr - Year (YYYY)
 * @returns {Object} HK components
 * 
 * @private
 */
function calculateHKComponentsFromForecast(artikelListe, jahr) {
    console.log(`🏭 [DB-FORECAST] Calculating HK components for ${jahr}`);
    
    let totalMaterial = 0;
    let totalLabour = 0;
    let totalMaterialOverhead = 0;
    let totalManufacturingOverhead = 0;
    
    artikelListe.forEach(artikel => {
        // ✅ NEW: Get forecast data from DATABASE CACHE
        const forecast = getForecastDataFromCache(artikel);
        
        if (forecast && forecast.years && forecast.totalCost) {
            const jahrIndex = forecast.years.indexOf(parseInt(jahr));
            
            if (jahrIndex !== -1 && forecast.totalCost[jahrIndex] !== undefined) {
                const totalCost = forecast.totalCost[jahrIndex];
                
                // Get HK-Aufteilung (or use defaults)
                const hkAufteilung = getHKAufteilung(artikel);
                
                // Split totalCost according to HK-Aufteilung
                const material = totalCost * (hkAufteilung.material_prozent / 100);
                const labour = totalCost * (hkAufteilung.fertigung_prozent / 100);
                const overhead = totalCost * (hkAufteilung.overhead_prozent / 100);
                
                // Further split overhead into material_overhead and manufacturing_overhead
                // (Typical split: 40% material, 60% manufacturing)
                const materialOverhead = overhead * 0.4;
                const manufacturingOverhead = overhead * 0.6;
                
                totalMaterial += material;
                totalLabour += labour;
                totalMaterialOverhead += materialOverhead;
                totalManufacturingOverhead += manufacturingOverhead;
                
                console.log(`  ✅ ${artikel.name}: DB totalCost=${totalCost.toFixed(2)} → ` +
                           `M=${material.toFixed(2)} L=${labour.toFixed(2)} OH=${overhead.toFixed(2)}`);
                return;
            }
        }
        
        // FALLBACK: Use old structure
        console.warn(`  ⚠️ ${artikel.name}: No forecast data, using fallback`);
        const fallback = calculateHKComponentsFallback(artikel, jahr);
        totalMaterial += fallback.material;
        totalLabour += fallback.labour;
        totalMaterialOverhead += fallback.material_overhead;
        totalManufacturingOverhead += fallback.manufacturing_overhead;
    });
    
    console.log(`🏭 [DB-FORECAST] Total HK: M=${totalMaterial.toFixed(2)} ` +
               `L=${totalLabour.toFixed(2)} MOH=${totalMaterialOverhead.toFixed(2)} ` +
               `MFOH=${totalManufacturingOverhead.toFixed(2)}`);
    
    return {
        material: totalMaterial,
        labour: totalLabour,
        material_overhead: totalMaterialOverhead,
        manufacturing_overhead: totalManufacturingOverhead
    };
}

/**
 * Get DB2 directly from forecast (DATABASE VERSION)
 * 
 * @param {import('./types').ArtikelExtended[]} artikelListe - List of articles
 * @param {string} jahr - Year (YYYY)
 * @returns {number|null} DB2 or null if not available
 * 
 * @private
 */
function calculateDB2FromForecast(artikelListe, jahr) {
    let hasAnyForecast = false;
    let totalDB2 = 0;
    
    artikelListe.forEach(artikel => {
        // ✅ NEW: Get forecast data from DATABASE CACHE
        const forecast = getForecastDataFromCache(artikel);
        
        if (forecast && forecast.years && forecast.db2) {
            hasAnyForecast = true;
            const jahrIndex = forecast.years.indexOf(parseInt(jahr));
            
            if (jahrIndex !== -1 && forecast.db2[jahrIndex] !== undefined) {
                totalDB2 += forecast.db2[jahrIndex];
            }
        }
    });
    
    return hasAnyForecast ? totalDB2 : null;
}

/**
 * Get forecast data from artikel (LEGACY - for backward compatibility)
 * Checks old struktur: artikel.hardware_model_data.forecast
 * 
 * @param {Object} artikel - Article data
 * @returns {Object|null} Forecast data or null
 * 
 * @private
 */
function getForecastDataLegacy(artikel) {
    // Check all possible model types (old structure)
    const modelTypes = [
        'hardware_model_data',
        'software_model_data',
        'service_model_data',
        'package_model_data'
    ];
    
    for (const modelType of modelTypes) {
        if (artikel[modelType] && artikel[modelType].forecast) {
            return artikel[modelType].forecast;
        }
    }
    
    return null;
}

/**
 * Get HK-Aufteilung for artikel (or use defaults)
 * 
 * @param {Object} artikel - Article data
 * @returns {Object} HK-Aufteilung {material_prozent, fertigung_prozent, overhead_prozent}
 * 
 * @private
 */
function getHKAufteilung(artikel) {
    // Priority 1: Use artikel.hk_aufteilung if exists
    if (artikel.hk_aufteilung && 
        artikel.hk_aufteilung.material_prozent !== undefined) {
        return artikel.hk_aufteilung;
    }
    
    // Priority 2: Use defaults based on typ
    const defaults = HK_DEFAULTS[artikel.typ] || HK_DEFAULTS['Default'];
    
    return {
        material_prozent: defaults.material,
        fertigung_prozent: defaults.fertigung,
        overhead_prozent: defaults.overhead,
        quelle: 'default'
    };
}

/**
 * Fallback: Calculate HK components from old structure
 * 
 * @param {Object} artikel - Article data
 * @param {string} jahr - Year
 * @returns {Object} HK components
 * 
 * @private
 */
function calculateHKComponentsFallback(artikel, jahr) {
    const menge = getArtikelValueForYear(artikel, 'menge', jahr);
    const hkGesamt = artikel.hk_gesamt || 0;
    const totalCost = menge * hkGesamt;
    
    const hkAufteilung = getHKAufteilung(artikel);
    
    const material = totalCost * (hkAufteilung.material_prozent / 100);
    const labour = totalCost * (hkAufteilung.fertigung_prozent / 100);
    const overhead = totalCost * (hkAufteilung.overhead_prozent / 100);
    
    return {
        material: material,
        labour: labour,
        material_overhead: overhead * 0.4,
        manufacturing_overhead: overhead * 0.6
    };
}

// ========================================
// HELPER FUNCTIONS (unchanged)
// ========================================

/**
 * Get artikel value for a specific year
 * Supports multiple data structures
 * 
 * @param {Object} artikel - Article data
 * @param {string} field - Field name ('menge' or 'preis')
 * @param {string} jahr - Year (YYYY)
 * @returns {number} Value
 * 
 * @private
 */
function getArtikelValueForYear(artikel, field, jahr) {
    // Try jahr_X structure first (e.g., jahr_1 for 2025)
    const jahrIndex = parseInt(jahr) - 2024;
    const jahrKey = `jahr_${jahrIndex}`;
    
    if (artikel[jahrKey] && artikel[jahrKey][field] !== undefined) {
        return parseFloat(artikel[jahrKey][field]) || 0;
    }
    
    // Try mengen/preise object structure
    if (artikel[field + 'n'] && artikel[field + 'n'][jahr] !== undefined) {
        return parseFloat(artikel[field + 'n'][jahr]) || 0;
    }
    
    // Try direct field_{jahr} structure
    const directField = `${field}_${jahr}`;
    if (artikel[directField] !== undefined) {
        return parseFloat(artikel[directField]) || 0;
    }
    
    return 0;
}

/**
 * Get project costs (Kostenblöcke)
 * 
 * @param {string} projektId - Project ID
 * @returns {Array} Cost blocks
 * 
 * @private
 */
function getProjektkosten(projektId) {
    const projekt = state.getProjekt(projektId);
    
    if (!projekt || !projekt.kostenblöcke) {
        return [];
    }
    
    // Return active cost blocks
    return projekt.kostenblöcke.filter(block => block.isActive);
}

/**
 * Sum project costs by category for a specific year
 * 
 * @param {Array} projektkosten - Cost blocks
 * @param {Array} categoryIds - Category IDs to sum
 * @param {string} jahr - Year
 * @returns {number} Total costs
 * 
 * @private
 */
function sumProjectCostsByCategory(projektkosten, categoryIds, jahr) {
    return projektkosten.reduce((sum, block) => {
        // Check if block matches any of the category IDs
        const blockId = block.id || block.name.toLowerCase().replace(/\s+/g, '-');
        
        if (categoryIds.includes(blockId)) {
            const value = block.kostenWerte && block.kostenWerte[jahr];
            if (value !== undefined) {
                return sum + parseFloat(value);
            }
        }
        
        return sum;
    }, 0);
}

/**
 * Determine year range from articles and cost blocks
 * 
 * @param {Array} artikelListe - Articles
 * @param {Array} projektkosten - Cost blocks
 * @returns {Array} Array of years (strings)
 * 
 * @private
 */
function determineYearRange(artikelListe, projektkosten) {
    const jahre = new Set();
    
    // Get years from forecast cache
    artikelListe.forEach(artikel => {
        const forecast = getForecastDataFromCache(artikel);
        if (forecast && forecast.years) {
            forecast.years.forEach(jahr => jahre.add(jahr.toString()));
        }
        
        // Fallback: Check jahr_X structure
        for (let i = 1; i <= 10; i++) {
            if (artikel[`jahr_${i}`]) {
                jahre.add((2024 + i).toString());
            }
        }
    });
    
    // Get years from cost blocks
    projektkosten.forEach(block => {
        if (block.kostenWerte) {
            Object.keys(block.kostenWerte).forEach(jahr => jahre.add(jahr));
        }
    });
    
    // If no years found, default to 2025-2029
    if (jahre.size === 0) {
        return ['2025', '2026', '2027', '2028', '2029'];
    }
    
    // Convert to sorted array
    return Array.from(jahre).sort();
}

/**
 * Calculate totals across all years
 * 
 * @param {Object} jahresErgebnisse - Year results
 * @returns {Object} Totals
 * 
 * @private
 */
function calculateTotals(jahresErgebnisse) {
    const jahre = Object.keys(jahresErgebnisse);
    
    const totals = {
        sales_revenue_total: 0,
        db1_total: 0,
        db2_total: 0,
        db3_total: 0,
        db4_total: 0,
        db5_total: 0,
        ebit_total: 0
    };
    
    jahre.forEach(jahr => {
        const result = jahresErgebnisse[jahr];
        totals.sales_revenue_total += result.sales_revenue || 0;
        totals.db1_total += result.db1 || 0;
        totals.db2_total += result.db2 || 0;
        totals.db3_total += result.db3 || 0;
        totals.db4_total += result.db4 || 0;
        totals.db5_total += result.db5 || 0;
        totals.ebit_total += result.ebit || 0;
    });
    
    return totals;
}

/**
 * Calculate KPIs (NPV, IRR, Break-even, etc.)
 * 
 * @param {Object} jahresErgebnisse - Year results
 * @param {Object} totals - Totals
 * @param {number} wacc - Discount rate
 * @param {string} artikelTyp - Article type for benchmarks
 * @returns {Object} KPIs
 * 
 * @private
 */
function calculateKPIs(jahresErgebnisse, totals, wacc, artikelTyp) {
    const jahre = Object.keys(jahresErgebnisse).sort();
    
    // Calculate average margins
    let sumDB2Margin = 0;
    let sumEBITMargin = 0;
    let validYears = 0;
    
    jahre.forEach(jahr => {
        const result = jahresErgebnisse[jahr];
        if (result.sales_revenue > 0) {
            sumDB2Margin += result.db2_margin_prozent;
            sumEBITMargin += result.ebit_margin_prozent;
            validYears++;
        }
    });
    
    const avg_manufacturing_margin = validYears > 0 ? sumDB2Margin / validYears : 0;
    const avg_ebit_margin = validYears > 0 ? sumEBITMargin / validYears : 0;
    
    // Find break-even year
    let cumulativeEBIT = 0;
    let break_even_year = null;
    
    for (const jahr of jahre) {
        cumulativeEBIT += jahresErgebnisse[jahr].ebit || 0;
        if (cumulativeEBIT >= 0 && break_even_year === null) {
            break_even_year = jahr;
        }
    }
    
    // Calculate NPV and IRR
    const cashflows = jahre.map(jahr => jahresErgebnisse[jahr].ebit || 0);
    const npv = calculateNPV(cashflows, wacc);
    const irrResult = calculateIRR(cashflows);
    const payback_period = calculatePaybackPeriod(cashflows);
    
    return {
        avg_manufacturing_margin,
        avg_ebit_margin,
        break_even_year,
        npv,
        irr: irrResult.irr,
        payback_period
    };
}

/**
 * Calculate Net Present Value
 * 
 * @param {number[]} cashflows - Cashflows
 * @param {number} discountRate - Discount rate (WACC)
 * @param {number} [initialInvestment=0] - Initial investment at t=0
 * @returns {number} NPV
 * 
 * @private
 */
function calculateNPV(cashflows, discountRate, initialInvestment = 0) {
    if (!Array.isArray(cashflows) || cashflows.length === 0) {
        return 0;
    }
    
    let npv = -initialInvestment;
    
    cashflows.forEach((cf, index) => {
        const period = index + 1;
        npv += cf / Math.pow(1 + discountRate, period);
    });
    
    return Math.round(npv * 100) / 100;
}

/**
 * Calculate Internal Rate of Return using Newton-Raphson method
 * 
 * @param {number[]} cashflows - Array of cashflows per period
 * @param {number} [initialGuess=0.1] - Initial guess for IRR
 * @returns {import('./types').IRRResult} IRR result
 * 
 * @private
 */
function calculateIRR(cashflows, initialGuess = 0.1) {
    const maxIterations = CALCULATION_CONSTANTS.IRR_MAX_ITERATIONS;
    const precision = CALCULATION_CONSTANTS.IRR_PRECISION;
    
    let irr = initialGuess;
    let iteration = 0;
    
    while (iteration < maxIterations) {
        const npv = calculateNPVForIRR(cashflows, irr);
        const derivative = calculateNPVDerivative(cashflows, irr);
        
        if (Math.abs(npv) < precision) {
            return {
                irr: Math.round(irr * 10000) / 100,
                iterations: iteration,
                converged: true
            };
        }
        
        if (Math.abs(derivative) < 1e-10) {
            break;
        }
        
        irr = irr - (npv / derivative);
        iteration++;
    }
    
    return {
        irr: 0,
        iterations: iteration,
        converged: false
    };
}

/**
 * Calculate NPV for IRR calculation (without initial investment)
 * 
 * @param {number[]} cashflows - Cashflows
 * @param {number} rate - Discount rate
 * @returns {number} NPV
 * 
 * @private
 */
function calculateNPVForIRR(cashflows, rate) {
    return cashflows.reduce((sum, cf, index) => {
        return sum + cf / Math.pow(1 + rate, index + 1);
    }, 0);
}

/**
 * Calculate derivative of NPV for Newton-Raphson method
 * 
 * @param {number[]} cashflows - Cashflows
 * @param {number} rate - Discount rate
 * @returns {number} Derivative
 * 
 * @private
 */
function calculateNPVDerivative(cashflows, rate) {
    return cashflows.reduce((sum, cf, index) => {
        const period = index + 1;
        return sum - (period * cf) / Math.pow(1 + rate, period + 1);
    }, 0);
}

/**
 * Calculate payback period (years until cumulative cashflow is positive)
 * 
 * @param {number[]} cashflows - Cashflows
 * @returns {number} Payback period in years
 * 
 * @private
 */
function calculatePaybackPeriod(cashflows) {
    let cumulative = 0;
    
    for (let i = 0; i < cashflows.length; i++) {
        cumulative += cashflows[i];
        if (cumulative >= 0) {
            return i + 1;
        }
    }
    
    return cashflows.length;
}

/**
 * Validate calculation inputs
 * 
 * @param {import('./types').ArtikelExtended[]} artikelListe - Articles
 * @param {import('./types').Kostenblock[]} projektkosten - Cost blocks
 * @returns {import('./types').ValidationResult} Validation result
 * 
 * @private
 */
function validateCalculationInputs(artikelListe, projektkosten) {
    const errors = [];
    const warnings = [];
    
    // Check articles
    if (!artikelListe || artikelListe.length === 0) {
        errors.push({
            field: 'artikel',
            message: 'Keine Artikel vorhanden',
            code: 'NO_ARTICLES'
        });
    }
    
    // Check HK-Aufteilung
    artikelListe.forEach((artikel, index) => {
        if (artikel.hk_aufteilung) {
            const sum = artikel.hk_aufteilung.material_prozent +
                       artikel.hk_aufteilung.fertigung_prozent +
                       artikel.hk_aufteilung.overhead_prozent;
            
            if (Math.abs(sum - 100) > 0.1) {
                errors.push({
                    field: `artikel[${index}].hk_aufteilung`,
                    message: `HK-Aufteilung ergibt ${sum}% statt 100%`,
                    code: 'HK_SUM_NOT_100'
                });
            }
        }
    });
    
    // Check project costs
    if (!projektkosten || projektkosten.length === 0) {
        warnings.push({
            field: 'projektkosten',
            message: 'Keine Projektkosten definiert - DB3-DB5 werden 0 sein',
            recommendation: 'Projektkosten im Projektkosten-Tab erfassen'
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Create metadata for calculation result
 * 
 * @param {string} projektId - Project ID
 * @param {import('./types').ArtikelExtended[]} artikelListe - Articles
 * @param {import('./types').Kostenblock[]} projektkosten - Cost blocks
 * @param {string[]} jahre - Years
 * @returns {import('./types').WirtschaftlichkeitMetadata} Metadata
 * 
 * @private
 */
function createMetadata(projektId, artikelListe, projektkosten, jahre) {
    return {
        berechnet_am: new Date().toISOString(),
        artikel_id: 'projekt-aggregiert',
        projekt_id: projektId,
        anzahl_artikel: artikelListe.length,
        verwendete_kostenblöcke: projektkosten.map(b => b.id),
        hk_aufteilungs_faktoren: {},
        version: '4.0.0 - Database Integration'
    };
}

/**
 * Create empty result structure for error cases
 * 
 * @param {string} projektId - Project ID
 * @param {string} reason - Reason for empty result
 * @returns {import('./types').WirtschaftlichkeitResult} Empty result
 * 
 * @private
 */
function createEmptyResult(projektId, reason) {
    return {
        jahre: {},
        totals: {
            sales_revenue_total: 0,
            db1_total: 0,
            db2_total: 0,
            db3_total: 0,
            ebit_total: 0
        },
        kpis: {
            avg_manufacturing_margin: 0,
            avg_ebit_margin: 0,
            break_even_year: null,
            npv: 0,
            irr: 0,
            payback_period: 0
        },
        metadata: {
            berechnet_am: new Date().toISOString(),
            artikel_id: null,
            projekt_id: projektId,
            anzahl_artikel: 0,
            verwendete_kostenblöcke: [],
            hk_aufteilungs_faktoren: {},
            error: reason,
            version: '4.0.0 - Database Integration'
        }
    };
}

/**
 * Export public API
 */
export default {
    calculateProjektWirtschaftlichkeit,
    calculateNPV,
    calculateIRR,
    clearForecastCache
};
