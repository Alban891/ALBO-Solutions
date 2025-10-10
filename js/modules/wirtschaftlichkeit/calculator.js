/**
 * CFO Dashboard - Wirtschaftlichkeit Module
 * Calculator - Business Logic Layer
 * 
 * @module wirtschaftlichkeit/calculator
 * @description Core calculation engine for contribution margin scheme and KPIs
 * @author Senior Development Team
 * @version 2.0.0
 */

import { state } from '../../state.js';  // Ein Level höher!
import * as helpers from '../../helpers.js';  // Ein Level höher!
import {
    HK_DEFAULTS,
    KOSTEN_MAPPING,
    OVERHEAD_DEFAULTS,
    CALCULATION_CONSTANTS,
    BRANCHEN_BENCHMARKS
} from './constants.js';  // Kein Prefix!

/**
 * Main calculation engine for project profitability
 * Implements full DB1-DB5 contribution margin scheme
 * 
 * @param {string} projektId - Project ID
 * @param {import('./types').CalculationOptions} [options={}] - Calculation options
 * @returns {import('./types').WirtschaftlichkeitResult} Complete profitability analysis
 * 
 * @example
 * const result = calculateProjektWirtschaftlichkeit('projekt-123', {
 *   wacc: 0.10,
 *   validateInputs: true
 * });
 * console.log(result.kpis.ebit_margin);
 */
export function calculateProjektWirtschaftlichkeit(projektId, options = {}) {
    const {
        includeKI = true,
        validateInputs = true,
        wacc = CALCULATION_CONSTANTS.DEFAULT_WACC,
        aggregated = false
    } = options;
    
    try {
        // 1. Load data
        const projekt = state.getProjekt(projektId);
        if (!projekt) {
            throw new Error(`Projekt ${projektId} nicht gefunden`);
        }
        
        const artikelListe = state.getArtikelByProjekt(projektId);
        if (!artikelListe || artikelListe.length === 0) {
            return createEmptyResult(projektId, 'Keine Artikel vorhanden');
        }
        
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
 * @param {import('./types').ArtikelExtended[]} artikelListe - List of articles
 * @param {import('./types').Kostenblock[]} projektkosten - Project cost blocks
 * @param {string} jahr - Year to calculate (YYYY)
 * @param {import('./types').CalculationOptions} options - Calculation options
 * @returns {import('./types').JahresWirtschaftlichkeit} Year profitability
 * 
 * @private
 */
function calculateJahresWirtschaftlichkeit(artikelListe, projektkosten, jahr, options = {}) {
    // Step 1: Calculate Sales Revenue
    const sales_revenue = calculateSalesRevenue(artikelListe, jahr);
    
    // Step 2: Calculate HK components (Material, Labour, Overhead)
    const hk_components = calculateHKComponents(artikelListe, jahr);
    
    // Step 3: DB1 = Sales - Material - Direct Labour
    const material_costs = hk_components.material;
    const direct_labour = hk_components.labour;
    const db1 = sales_revenue - material_costs - direct_labour;
    
    // Step 4: Calculate Manufacturing Overheads
    const material_overhead = hk_components.material_overhead;
    const manufacturing_overhead = hk_components.manufacturing_overhead;
    
    // Step 5: DB2 = DB1 - Material Overhead - Manufacturing Overhead
    const db2 = db1 - material_overhead - manufacturing_overhead;
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

/**
 * Calculate sales revenue for all articles in a given year
 * 
 * @param {import('./types').ArtikelExtended[]} artikelListe - List of articles
 * @param {string} jahr - Year (YYYY)
 * @returns {number} Total sales revenue
 * 
 * @private
 */
function calculateSalesRevenue(artikelListe, jahr) {
    return artikelListe.reduce((sum, artikel) => {
        const menge = getArtikelValueForYear(artikel, 'menge', jahr);
        const preis = getArtikelValueForYear(artikel, 'preis', jahr);
        return sum + (menge * preis);
    }, 0);
}

/**
 * Calculate HK components (Material, Labour, Overhead) for all articles
 * Uses HK-Aufteilung from article or defaults
 * 
 * @param {import('./types').ArtikelExtended[]} artikelListe - List of articles
 * @param {string} jahr - Year (YYYY)
 * @returns {Object} HK components {material, labour, material_overhead, manufacturing_overhead}
 * 
 * @private
 */
function calculateHKComponents(artikelListe, jahr) {
    const result = {
        material: 0,
        labour: 0,
        material_overhead: 0,
        manufacturing_overhead: 0
    };
    
    artikelListe.forEach(artikel => {
        const menge = getArtikelValueForYear(artikel, 'menge', jahr);
        const hk_pro_stueck = artikel.hk_gesamt || 0;
        const total_hk = menge * hk_pro_stueck;
        
        // Get HK-Aufteilung (from article or defaults)
        const aufteilung = getHKAufteilung(artikel);
        
        // Calculate components
        result.material += total_hk * (aufteilung.material_prozent / 100);
        result.labour += total_hk * (aufteilung.fertigung_prozent / 100);
        
        // Overhead split from HK overhead portion
        const overhead_total = total_hk * (aufteilung.overhead_prozent / 100);
        // Assume 40% material overhead, 60% manufacturing overhead
        result.material_overhead += overhead_total * 0.4;
        result.manufacturing_overhead += overhead_total * 0.6;
    });
    
    return result;
}

/**
 * Get HK-Aufteilung for an article (from article data or defaults)
 * 
 * @param {import('./types').ArtikelExtended} artikel - Article
 * @returns {import('./types').HKAufteilung} HK split
 * 
 * @private
 */
function getHKAufteilung(artikel) {
    // If article has explicit HK-Aufteilung, use it
    if (artikel.hk_aufteilung && 
        artikel.hk_aufteilung.material_prozent !== undefined) {
        return artikel.hk_aufteilung;
    }
    
    // Otherwise, use defaults based on article type
    const typ = artikel.typ || 'Default';
    const defaults = HK_DEFAULTS[typ] || HK_DEFAULTS['Default'];
    
    return {
        material_prozent: defaults.material,
        fertigung_prozent: defaults.fertigung,
        overhead_prozent: defaults.overhead,
        quelle: 'ki-default',
        letzteAenderung: new Date().toISOString()
    };
}

/**
 * Get artikel value for a specific year
 * Handles different data structures (mengen/preise objects or jahr_X properties)
 * 
 * @param {import('./types').ArtikelExtended} artikel - Article
 * @param {string} field - Field name ('menge' or 'preis')
 * @param {string} jahr - Year (YYYY)
 * @returns {number} Value for the year
 * 
 * @private
 */
function getArtikelValueForYear(artikel, field, jahr) {
    // Try mengen/preise object structure first
    if (artikel.mengen && artikel.mengen[jahr] !== undefined) {
        return parseFloat(artikel.mengen[jahr]) || 0;
    }
    if (artikel.preise && artikel.preise[jahr] !== undefined) {
        return parseFloat(artikel.preise[jahr]) || 0;
    }
    
    // Fallback to jahr_X structure
    const jahrIndex = parseInt(jahr) - 2023;  // Assuming 2024 = jahr_1
    const yearData = artikel[`jahr_${jahrIndex}`];
    
    if (yearData && yearData[field] !== undefined) {
        return parseFloat(yearData[field]) || 0;
    }
    
    // Last fallback: Direct property
    if (field === 'preis' && artikel.preis !== undefined) {
        return parseFloat(artikel.preis) || 0;
    }
    
    return 0;
}

/**
 * Sum project costs by category (development, selling_marketing, admin_distribution)
 * 
 * @param {import('./types').Kostenblock[]} projektkosten - Cost blocks
 * @param {string[]} blockIds - IDs of cost blocks in this category
 * @param {string} jahr - Year (YYYY)
 * @returns {number} Sum of costs
 * 
 * @private
 */
function sumProjectCostsByCategory(projektkosten, blockIds, jahr) {
    if (!projektkosten || !Array.isArray(blockIds)) {
        return 0;
    }
    
    return blockIds.reduce((sum, blockId) => {
        const block = projektkosten.find(b => b.id === blockId);
        if (!block || !block.isActive) {
            return sum;
        }
        
        const wert = block.kostenWerte && block.kostenWerte[jahr] 
            ? parseFloat(block.kostenWerte[jahr]) || 0
            : 0;
            
        return sum + wert;
    }, 0);
}

/**
 * Load project costs from state
 * 
 * @param {string} projektId - Project ID
 * @returns {import('./types').Kostenblock[]} Array of cost blocks
 * 
 * @private
 */
function getProjektkosten(projektId) {
    const projekt = state.getProjekt(projektId);
    if (!projekt) {
        return [];
    }
    
    // Get active cost blocks
    const aktiveBlöcke = projekt.aktiveKostenblöcke || [];
    const kostenWerte = projekt.kostenWerte || {};
    
    // Transform to Kostenblock structure
    return aktiveBlöcke.map(blockId => ({
        id: blockId,
        name: blockId,  // TODO: Get from metadata
        icon: '📦',
        isActive: true,
        kostenWerte: kostenWerte[blockId] || {},
        kategorisierung: null  // Will be filled by KI if available
    }));
}

/**
 * Determine year range from articles and project costs
 * 
 * @param {import('./types').ArtikelExtended[]} artikelListe - Articles
 * @param {import('./types').Kostenblock[]} projektkosten - Cost blocks
 * @returns {string[]} Array of years (YYYY)
 * 
 * @private
 */
function determineYearRange(artikelListe, projektkosten) {
    const jahre = new Set();
    
    // From articles
    artikelListe.forEach(artikel => {
        if (artikel.mengen) {
            Object.keys(artikel.mengen).forEach(jahr => jahre.add(jahr));
        }
        // Also check jahr_X structure
        for (let i = 1; i <= 10; i++) {
            if (artikel[`jahr_${i}`]) {
                jahre.add((2023 + i).toString());
            }
        }
    });
    
    // From project costs
    projektkosten.forEach(block => {
        if (block.kostenWerte) {
            Object.keys(block.kostenWerte).forEach(jahr => jahre.add(jahr));
        }
    });
    
    // Default range if nothing found
    if (jahre.size === 0) {
        return ['2024', '2025', '2026', '2027', '2028'];
    }
    
    return Array.from(jahre).sort();
}

/**
 * Calculate totals across all years
 * 
 * @param {Object.<string, import('./types').JahresWirtschaftlichkeit>} jahresErgebnisse - Results per year
 * @returns {import('./types').WirtschaftlichkeitTotals} Totals
 * 
 * @private
 */
function calculateTotals(jahresErgebnisse) {
    const jahre = Object.keys(jahresErgebnisse);
    
    const totals = {
        sales_revenue_total: 0,
        material_costs_total: 0,
        direct_labour_total: 0,
        db1_total: 0,
        db2_total: 0,
        db3_total: 0,
        db4_total: 0,
        db5_total: 0,
        ebit_total: 0
    };
    
    jahre.forEach(jahr => {
        const j = jahresErgebnisse[jahr];
        totals.sales_revenue_total += j.sales_revenue;
        totals.material_costs_total += j.material_costs;
        totals.direct_labour_total += j.direct_labour;
        totals.db1_total += j.db1;
        totals.db2_total += j.db2;
        totals.db3_total += j.db3;
        totals.db4_total += j.db4;
        totals.db5_total += j.db5;
        totals.ebit_total += j.ebit;
    });
    
    return totals;
}

/**
 * Calculate Key Performance Indicators
 * Includes margins, break-even, NPV, IRR
 * 
 * @param {Object.<string, import('./types').JahresWirtschaftlichkeit>} jahresErgebnisse - Results per year
 * @param {import('./types').WirtschaftlichkeitTotals} totals - Totals
 * @param {number} wacc - Weighted Average Cost of Capital
 * @param {string} [artikelTyp] - Article type for benchmarking
 * @returns {import('./types').WirtschaftlichkeitKPIs} KPIs
 * 
 * @private
 */
function calculateKPIs(jahresErgebnisse, totals, wacc, artikelTyp) {
    const jahre = Object.keys(jahresErgebnisse).sort();
    
    // Average margins
    const avg_manufacturing_margin = calculateAverageMargin(
        jahresErgebnisse,
        'db2',
        'db2_margin_prozent'
    );
    
    const avg_ebit_margin = calculateAverageMargin(
        jahresErgebnisse,
        'ebit',
        'ebit_margin_prozent'
    );
    
    // Break-even calculation
    const break_even_year = calculateBreakEvenYear(jahresErgebnisse);
    
    // NPV calculation
    const cashflows = jahre.map(jahr => jahresErgebnisse[jahr].ebit);
    const npv = calculateNPV(cashflows, wacc);
    
    // IRR calculation
    const irrResult = calculateIRR(cashflows);
    const irr = irrResult.converged ? irrResult.irr : null;
    
    // Payback period
    const payback_period = calculatePaybackPeriod(cashflows);
    
    return {
        avg_manufacturing_margin,
        avg_ebit_margin,
        break_even_year,
        npv,
        irr,
        payback_period
    };
}

/**
 * Calculate average margin across years
 * 
 * @param {Object} jahresErgebnisse - Results per year
 * @param {string} absoluteField - Field name for absolute values
 * @param {string} percentField - Field name for percentage values
 * @returns {number} Average margin in percent
 * 
 * @private
 */
function calculateAverageMargin(jahresErgebnisse, absoluteField, percentField) {
    const jahre = Object.keys(jahresErgebnisse);
    
    if (jahre.length === 0) return 0;
    
    // Calculate weighted average by revenue
    let weightedSum = 0;
    let totalRevenue = 0;
    
    jahre.forEach(jahr => {
        const result = jahresErgebnisse[jahr];
        const revenue = result.sales_revenue;
        const margin = result[percentField] || 0;
        
        weightedSum += margin * revenue;
        totalRevenue += revenue;
    });
    
    return totalRevenue > 0 ? (weightedSum / totalRevenue) : 0;
}

/**
 * Calculate break-even year (first year with positive cumulative EBIT)
 * 
 * @param {Object} jahresErgebnisse - Results per year
 * @returns {string|null} Break-even year or null if not reached
 * 
 * @private
 */
function calculateBreakEvenYear(jahresErgebnisse) {
    const jahre = Object.keys(jahresErgebnisse).sort();
    let cumulativeEBIT = 0;
    
    for (const jahr of jahre) {
        cumulativeEBIT += jahresErgebnisse[jahr].ebit;
        if (cumulativeEBIT >= 0) {
            return jahr;
        }
    }
    
    return null;  // Not reached within project period
}

/**
 * Calculate Net Present Value
 * 
 * @param {number[]} cashflows - Array of cashflows per period
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
        const period = index + 1;  // Periods start at 1
        npv += cf / Math.pow(1 + discountRate, period);
    });
    
    return Math.round(npv * 100) / 100;  // Round to 2 decimals
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
                irr: Math.round(irr * 10000) / 100,  // Convert to percentage
                iterations: iteration,
                converged: true
            };
        }
        
        if (Math.abs(derivative) < 1e-10) {
            // Derivative too small, algorithm won't converge
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
    
    return cashflows.length;  // Not recovered within period
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
        hk_aufteilungs_faktoren: {}  // TODO: Add details
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
            error: reason
        }
    };
}

/**
 * Export public API
 */
export default {
    calculateProjektWirtschaftlichkeit,
    calculateNPV,
    calculateIRR
};
