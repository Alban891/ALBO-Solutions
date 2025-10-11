/**
 * CFO Dashboard - Data Processor
 * Transforms raw calculator results into chart-ready data
 * Enterprise-grade data pipeline with validation
 * 
 * FIXED VERSION: Reads Projektkosten directly from State (not Calculator)
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
            projektkostenData: extractProjektkostenDataFromState(projektId, jahre, calculationResult),  // NEW: Use state
            db3JahrData: extractDB3JahrData(calculationResult, jahre),
            db3KumuliertData: extractDB3KumuliertData(calculationResult, jahre),
            
            // KPI data
            kpis: extractKPIs(calculationResult),
            
            // Widget data
            projekteTableData: extractProjekteTableData(projektId),
            
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
 * Aggregates volumes from all articles
 */
function extractAbsatzData(artikelListe, jahre) {
    return {
        labels: jahre,
        values: jahre.map(jahr => {
            const yearNum = parseInt(jahr);
            let totalVolume = 0;
            
            artikelListe.forEach(artikel => {
                // Try different data structures
                if (artikel.volumes && artikel.volumes[yearNum]) {
                    totalVolume += artikel.volumes[yearNum];
                } else if (artikel.mengen && artikel.mengen[jahr]) {
                    totalVolume += artikel.mengen[jahr];
                } else {
                    const jahrIndex = yearNum - 2024;
                    const jahrKey = `jahr_${jahrIndex}`;
                    if (artikel[jahrKey] && artikel[jahrKey].menge) {
                        totalVolume += artikel[jahrKey].menge;
                    }
                }
            });
            
            return totalVolume / 1000; // Convert to thousands
        }),
        unit: 'Tausend Stück',
        color: '#9ca3af'
    };
}

/**
 * Extract DB2 (Manufacturing Margin) data
 * Includes both absolute values and percentage
 */
function extractDB2Data(result, jahre) {
    return {
        labels: jahre,
        absolute: jahre.map(jahr => (result.jahre[jahr].db2 || result.jahre[jahr].manufacturing_margin || 0) / 1000000),
        percent: jahre.map(jahr => result.jahre[jahr].db2_margin_prozent || result.jahre[jahr].manufacturing_margin_percent || 0),
        unit: 'Mio. €',
        colors: {
            bars: '#9ca3af',
            line: '#374151'
        }
    };
}

/**
 * Extract Projektkosten directly from State
 * Matches the Projektkosten tab exactly!
 * 
 * @param {string} projektId - Project ID
 * @param {string[]} jahre - Years array
 * @param {Object} calculationResult - Fallback if state unavailable
 * @returns {Object} Projektkosten data
 */
function extractProjektkostenDataFromState(projektId, jahre, calculationResult) {
    console.log('💰 Extracting Projektkosten from STATE for projekt:', projektId);
    
    // Try to get costs from State (primary source - matches Projektkosten tab)
    if (state.projektKostenData) {
        const allBlocks = Object.values(state.projektKostenData);
        const projektBlocks = allBlocks.filter(block => block.projektId === projektId);
        
        console.log(`  Found ${projektBlocks.length} cost blocks in state`);
        
        if (projektBlocks.length > 0) {
            // Calculate per year from state
            const values = jahre.map(jahr => {
                const jahrIndex = parseInt(jahr) - 2024; // 2025 = jahr_1
                const jahrKey = `jahr_${jahrIndex}`;
                
                let yearTotal = 0;
                projektBlocks.forEach(block => {
                    const value = parseFloat(block.kostenWerte?.[jahrKey]) || 0;
                    yearTotal += value;
                });
                
                const mio = yearTotal / 1000000;
                console.log(`  ${jahr}: ${yearTotal.toLocaleString('de-DE')}€ = ${mio.toFixed(2)} Mio.`);
                return mio;
            });
            
            const total = values.reduce((sum, val) => sum + val, 0);
            console.log(`✅ Total from STATE: ${total.toFixed(2)} Mio. €`);
            
            return {
                labels: jahre,
                values,
                total,
                unit: 'Mio. €',
                color: '#9ca3af',
                source: 'state'
            };
        }
    }
    
    // FALLBACK: Use calculator (if state unavailable)
    console.warn('⚠️ Using calculator fallback for Projektkosten');
    return extractProjektkostenDataFromCalculator(calculationResult, jahre);
}

/**
 * Extract Projektkosten from Calculator (fallback)
 */
function extractProjektkostenDataFromCalculator(result, jahre) {
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
    
    const total = values.reduce((sum, val) => sum + val, 0);
    
    return {
        labels: jahre,
        values,
        total,
        unit: 'Mio. €',
        color: '#9ca3af',
        source: 'calculator'
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

/**
 * Extract KPIs (NPV, IRR, Break-Even, etc.)
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

/**
 * Extract Projekte Table Data
 * Shows cost blocks for the project
 */
function extractProjekteTableData(projektId) {
    const projekt = state.getProjekt(projektId);
    if (!projekt) return null;
    
    // Get cost blocks
    const kostenBloecke = Object.values(state.projektKostenData || {})
        .filter(k => k.projektId === projektId)
        .slice(0, 5); // Max 5 for space
    
    return {
        projektName: projekt.name,
        kostenBloecke,
        artikelCount: state.getArtikelByProjekt(projektId).length
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
        warnings.push('Kein Umsatz - prüfen Sie Artikel-Daten');
    }
    
    // Check projektkosten source
    if (data.projektkostenData?.source === 'calculator') {
        warnings.push('Projektkosten aus Calculator - möglicherweise nicht exakt');
    }
    
    return {
        isValid: errors.length === 0,
        warnings,
        errors
    };
}
