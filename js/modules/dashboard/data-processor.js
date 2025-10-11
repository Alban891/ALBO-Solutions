/**
 * CFO Dashboard - Data Processor
 * Transforms raw calculator results into chart-ready data
 * Enterprise-grade data pipeline with validation
 */

import { state } from '../../state.js';
import { calculateProjektWirtschaftlichkeit } from '../wirtschaftlichkeit/calculator.js';

// ==========================================
// DATA EXTRACTION
// ==========================================

/**
 * Main data processor - orchestrates all data extraction
 * 
 * @param {string} projektId - Project ID
 * @returns {Object} Complete dashboard data
 */
export function processDataForDashboard(projektId) {
    console.log('📊 Processing dashboard data for projekt:', projektId);
    
    try {
        // Calculate wirtschaftlichkeit
        const calculationResult = calculateProjektWirtschaftlichkeit(projektId, {
            wacc: 0.08,
            validateInputs: true
        });
        
        if (!calculationResult || !calculationResult.jahre) {
            throw new Error('Invalid calculation result');
        }
        
        const jahre = Object.keys(calculationResult.jahre).sort();
        const artikelListe = state.getArtikelByProjekt(projektId);
        
        return {
            jahre,
            calculationResult,
            artikelListe,
            
            // Pre-processed chart data
            umsatzData: extractUmsatzData(calculationResult, jahre),
            absatzData: extractAbsatzData(artikelListe, jahre),
            db2Data: extractDB2Data(calculationResult, jahre),
            projektkostenData: extractProjektkostenData(calculationResult, jahre),
            db3JahrData: extractDB3JahrData(calculationResult, jahre),
            db3KumuliertData: extractDB3KumuliertData(calculationResult, jahre),
            
            // KPI data
            kpis: extractKPIs(calculationResult),
            
            // Metadata
            lastUpdate: new Date(),
            projektName: state.getProjekt(projektId)?.name || 'Projekt'
        };
        
    } catch (error) {
        console.error('❌ Data processing failed:', error);
        throw error;
    }
}

// ==========================================
// CHART DATA EXTRACTORS
// ==========================================

/**
 * Extract Umsatz (Sales Revenue) data
 * Convert to Mio. € for better readability
 */
function extractUmsatzData(result, jahre) {
    return {
        labels: jahre,
        values: jahre.map(jahr => (result.jahre[jahr].sales_revenue || 0) / 1000000),
        unit: 'Mio. €',
        color: '#9ca3af'
    };
}

/**
 * Extract Absatz (Volume) data
 * Aggregate all articles, convert to Tausend
 */
function extractAbsatzData(artikelListe, jahre) {
    const values = jahre.map(jahr => {
        let totalVolume = 0;
        artikelListe.forEach(artikel => {
            const yearNum = parseInt(jahr);
            totalVolume += artikel.volumes?.[yearNum] || 0;
        });
        return totalVolume / 1000; // Convert to Tsd
    });
    
    return {
        labels: jahre,
        values,
        unit: 'Tsd. Stück',
        color: '#9ca3af'
    };
}

/**
 * Extract DB2 (Manufacturing Margin) data
 * Includes both absolute and percentage values for dual-axis chart
 */
function extractDB2Data(result, jahre) {
    return {
        labels: jahre,
        absolute: jahre.map(jahr => (result.jahre[jahr].manufacturing_margin || 0) / 1000000),
        percent: jahre.map(jahr => result.jahre[jahr].manufacturing_margin_percent || 0),
        unit: {
            absolute: 'Mio. €',
            percent: '%'
        },
        colors: {
            bar: '#9ca3af',
            line: '#374151'
        }
    };
}

/**
 * Extract Projektkosten (Project Costs) data
 * Aggregates all overhead categories
 */
function extractProjektkostenData(result, jahre) {
    // Get projekt ID from result metadata
    const projektId = result.metadata?.projekt_id;
    
    if (projektId) {
        // Try to get costs directly from state (matches Projektkosten tab)
        const projektKosten = Object.values(state.projektKostenData || {})
            .filter(k => k.projektId === projektId);
        
        if (projektKosten.length > 0) {
            // Calculate costs per year from state
            const values = jahre.map(jahr => {
                let yearTotal = 0;
                projektKosten.forEach(block => {
                    const jahrIndex = parseInt(jahr) - 2024; // 2025 = jahr_1
                    const jahrKey = `jahr_${jahrIndex}`;
                    if (block.kostenWerte && block.kostenWerte[jahrKey]) {
                        yearTotal += parseFloat(block.kostenWerte[jahrKey]) || 0;
                    }
                });
                return yearTotal / 1000000; // Convert to Mio. €
            });
            
            const total = values.reduce((sum, val) => sum + val, 0);
            
            return {
                labels: jahre,
                values,
                total,
                unit: 'Mio. €',
                color: '#9ca3af'
            };
        }
    }
    
    // FALLBACK: Use calculator overhead values
    const values = jahre.map(jahr => {
        const year = result.jahre[jahr];
        return (
            (year.development_overhead || 0) +
            (year.selling_overhead || 0) +
            (year.marketing_overhead || 0) +
            (year.distribution_overhead || 0) +
            (year.administration_overhead || 0)
        ) / 1000000;
    });
    
    // Calculate cumulative total
    const total = values.reduce((sum, val) => sum + val, 0);
    
    return {
        labels: jahre,
        values,
        total,
        unit: 'Mio. €',
        color: '#9ca3af'
    };
}

/**
 * Extract DB3 pro Jahr (Annual DB3) data
 * Negative values will be colored red in chart
 */
function extractDB3JahrData(result, jahre) {
    return {
        labels: jahre,
        values: jahre.map(jahr => (result.jahre[jahr].db3 || 0) / 1000000),
        unit: 'Mio. €',
        colorFunction: (value) => value < 0 ? '#ef4444' : '#9ca3af'
    };
}

/**
 * Extract DB3 kumuliert (Cumulative DB3) data
 * Shows break-even point trajectory
 */
function extractDB3KumuliertData(result, jahre) {
    let cumulative = 0;
    const values = jahre.map(jahr => {
        cumulative += (result.jahre[jahr].db3 || 0) / 1000000;
        return cumulative;
    });
    
    return {
        labels: jahre,
        values,
        unit: 'Mio. €',
        colors: {
            line: '#374151',
            fill: 'rgba(55, 65, 81, 0.1)'
        }
    };
}

// ==========================================
// KPI EXTRACTORS
// ==========================================

/**
 * Extract all KPIs for dashboard widgets
 */
function extractKPIs(result) {
    return {
        breakEven: result.kpis.break_even_year || null,
        npv: result.kpis.npv || 0,
        irr: result.kpis.irr || 0,
        avgManufacturingMargin: result.kpis.avg_manufacturing_margin || 0,
        avgEbitMargin: result.kpis.avg_ebit_margin || 0,
        totalRevenue: result.totals.sales_revenue || 0,
        totalEbit: result.totals.ebit || 0
    };
}

// ==========================================
// DATA VALIDATION
// ==========================================

/**
 * Validate processed data before rendering
 * 
 * @param {Object} data - Processed data
 * @returns {Object} Validation result
 */
export function validateDashboardData(data) {
    const warnings = [];
    const errors = [];
    
    // Check for empty data
    if (!data.jahre || data.jahre.length === 0) {
        errors.push('Keine Jahre vorhanden');
    }
    
    // Check for missing articles
    if (!data.artikelListe || data.artikelListe.length === 0) {
        warnings.push('Keine Artikel vorhanden - Charts werden leer sein');
    }
    
    // Check for zero revenue
    const totalRevenue = data.umsatzData?.values.reduce((sum, v) => sum + v, 0) || 0;
    if (totalRevenue === 0) {
        warnings.push('Kein Umsatz vorhanden - prüfen Sie Artikel-Daten');
    }
    
    // Check for invalid KPIs
    if (data.kpis?.irr && (data.kpis.irr < -100 || data.kpis.irr > 1000)) {
        warnings.push('IRR außerhalb plausibler Grenzen');
    }
    
    return {
        isValid: errors.length === 0,
        hasWarnings: warnings.length > 0,
        errors,
        warnings
    };
}

// ==========================================
// EXPORT HELPERS
// ==========================================

/**
 * Prepare data for Excel export
 * 
 * @param {Object} data - Dashboard data
 * @returns {Object} Excel-ready data
 */
export function prepareExportData(data) {
    return {
        summary: {
            projekt: data.projektName,
            lastUpdate: data.lastUpdate.toISOString(),
            jahre: data.jahre,
            totalRevenue: data.kpis.totalRevenue,
            totalEbit: data.kpis.totalEbit,
            breakEven: data.kpis.breakEven,
            npv: data.kpis.npv,
            irr: data.kpis.irr
        },
        
        umsatz: {
            jahre: data.umsatzData.labels,
            werte: data.umsatzData.values
        },
        
        absatz: {
            jahre: data.absatzData.labels,
            werte: data.absatzData.values
        },
        
        db2: {
            jahre: data.db2Data.labels,
            absolute: data.db2Data.absolute,
            prozent: data.db2Data.percent
        },
        
        projektkosten: {
            jahre: data.projektkostenData.labels,
            werte: data.projektkostenData.values,
            gesamt: data.projektkostenData.total
        },
        
        db3: {
            jahre: data.db3JahrData.labels,
            jahr: data.db3JahrData.values,
            kumuliert: data.db3KumuliertData.values
        }
    };
}

// ==========================================
// EXPORT
// ==========================================

export default {
    processDataForDashboard,
    validateDashboardData,
    prepareExportData
};
