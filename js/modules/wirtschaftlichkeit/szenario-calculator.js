/**
 * CFO Dashboard - Szenario-Analyse Module
 * Calculator - Szenario Application Logic
 * 
 * @module wirtschaftlichkeit/szenario-calculator
 * @description Applies scenario adjustments to base calculation
 * @author Senior Development Team
 * @version 1.0.0
 */

import { SZENARIO_MODES } from './szenario-constants.js';

/**
 * Apply scenario adjustments to base calculation result
 * 
 * @param {Object} baseResult - Base case calculation result
 * @param {Object} szenarioConfig - Scenario configuration
 * @returns {Object} Adjusted calculation result
 * 
 * @public
 */
export function applySzenario(baseResult, szenarioConfig) {
    if (!baseResult || !baseResult.jahre) {
        throw new Error('Invalid base result');
    }
    
    // Clone base result
    const adjustedResult = JSON.parse(JSON.stringify(baseResult));
    
    // Apply adjustments to each year
    Object.keys(adjustedResult.jahre).forEach(jahr => {
        const yearData = adjustedResult.jahre[jahr];
        const baseYearData = baseResult.jahre[jahr];
        
        // Step 1: Adjust Revenue
        const revenueAdjustment = getAdjustmentValue(szenarioConfig.revenue);
        yearData.sales_revenue = baseYearData.sales_revenue * (1 + revenueAdjustment);
        
        // Step 2: Calculate revenue change ratio (for auto-mode costs)
        const revenueChangeRatio = revenueAdjustment + 1;
        
        // Step 3: Adjust Variable Costs
        yearData.material_costs = adjustCostItem(
            baseYearData.material_costs,
            szenarioConfig.material_costs,
            revenueChangeRatio
        );
        
        yearData.direct_labour = adjustCostItem(
            baseYearData.direct_labour,
            szenarioConfig.direct_labour,
            revenueChangeRatio
        );
        
        // Step 4: Recalculate DB1
        yearData.db1 = yearData.sales_revenue - yearData.material_costs - yearData.direct_labour;
        
        // Step 5: Adjust Semi-Variable Costs
        yearData.material_overhead = adjustCostItem(
            baseYearData.material_overhead,
            szenarioConfig.material_overhead,
            revenueChangeRatio
        );
        
        yearData.manufacturing_overhead = adjustCostItem(
            baseYearData.manufacturing_overhead,
            szenarioConfig.manufacturing_overhead,
            revenueChangeRatio
        );
        
        // Step 6: Recalculate DB2
        yearData.db2 = yearData.db1 - yearData.material_overhead - yearData.manufacturing_overhead;
        yearData.db2_margin_prozent = yearData.sales_revenue > 0 
            ? (yearData.db2 / yearData.sales_revenue * 100) 
            : 0;
        yearData.manufacturing_margin = yearData.db2;
        yearData.manufacturing_margin_percent = yearData.db2_margin_prozent;
        
        // Step 7: Adjust Fixed Costs
        yearData.development_overhead = adjustCostItem(
            baseYearData.development_overhead,
            szenarioConfig.development_overhead,
            revenueChangeRatio
        );
        
        yearData.db3 = yearData.db2 - yearData.development_overhead;
        
        yearData.selling_overhead = adjustCostItem(
            baseYearData.selling_overhead,
            szenarioConfig.selling_overhead,
            revenueChangeRatio
        );
        
        yearData.marketing_overhead = adjustCostItem(
            baseYearData.marketing_overhead,
            szenarioConfig.marketing_overhead,
            revenueChangeRatio
        );
        
        yearData.db4 = yearData.db3 - yearData.selling_overhead - yearData.marketing_overhead;
        
        yearData.distribution_overhead = adjustCostItem(
            baseYearData.distribution_overhead,
            szenarioConfig.distribution_overhead,
            revenueChangeRatio
        );
        
        yearData.admin_overhead = adjustCostItem(
            baseYearData.admin_overhead,
            szenarioConfig.admin_overhead,
            revenueChangeRatio
        );
        
        yearData.db5 = yearData.db4 - yearData.distribution_overhead - yearData.admin_overhead;
        
        // Step 8: Recalculate EBIT
        yearData.ebit = yearData.db5;
        yearData.ebit_margin_prozent = yearData.sales_revenue > 0 
            ? (yearData.ebit / yearData.sales_revenue * 100) 
            : 0;
    });
    
    // Recalculate totals
    adjustedResult.totals = recalculateTotals(adjustedResult.jahre);
    
    // Recalculate KPIs
    adjustedResult.kpis = recalculateKPIs(adjustedResult.jahre, adjustedResult.totals, baseResult.kpis.wacc || 0.08);
    
    // Add scenario metadata
    adjustedResult.metadata = {
        ...adjustedResult.metadata,
        szenario_angewendet: true,
        szenario_timestamp: new Date().toISOString()
    };
    
    return adjustedResult;
}

/**
 * Adjust a single cost item based on mode
 * 
 * @param {number} baseValue - Base value
 * @param {Object} config - Cost item config {mode, adjustment}
 * @param {number} revenueChangeRatio - Revenue change ratio (1.0 = no change)
 * @returns {number} Adjusted value
 * 
 * @private
 */
function adjustCostItem(baseValue, config, revenueChangeRatio) {
    if (!config) {
        return baseValue;
    }
    
    switch (config.mode) {
        case SZENARIO_MODES.FIXED:
            // Fixed: No change
            return baseValue;
            
        case SZENARIO_MODES.AUTO:
            // Auto: Follow revenue change
            return baseValue * revenueChangeRatio * (1 + (config.adjustment || 0));
            
        case SZENARIO_MODES.MANUAL:
            // Manual: Apply adjustment
            return baseValue * (1 + (config.adjustment || 0));
            
        default:
            return baseValue;
    }
}

/**
 * Get adjustment value from config
 * 
 * @param {Object} config - Configuration object
 * @returns {number} Adjustment value as decimal (e.g., 0.30 for +30%)
 * 
 * @private
 */
function getAdjustmentValue(config) {
    if (!config) {
        return 0;
    }
    return config.adjustment || 0;
}

/**
 * Recalculate totals across all years
 * 
 * @param {Object} jahre - Years data
 * @returns {Object} Totals
 * 
 * @private
 */
function recalculateTotals(jahre) {
    const totals = {
        sales_revenue_total: 0,
        db1_total: 0,
        db2_total: 0,
        db3_total: 0,
        db4_total: 0,
        db5_total: 0,
        ebit_total: 0
    };
    
    Object.values(jahre).forEach(yearData => {
        totals.sales_revenue_total += yearData.sales_revenue || 0;
        totals.db1_total += yearData.db1 || 0;
        totals.db2_total += yearData.db2 || 0;
        totals.db3_total += yearData.db3 || 0;
        totals.db4_total += yearData.db4 || 0;
        totals.db5_total += yearData.db5 || 0;
        totals.ebit_total += yearData.ebit || 0;
    });
    
    return totals;
}

/**
 * Recalculate KPIs
 * 
 * @param {Object} jahre - Years data
 * @param {Object} totals - Totals
 * @param {number} wacc - Discount rate
 * @returns {Object} KPIs
 * 
 * @private
 */
function recalculateKPIs(jahre, totals, wacc) {
    const jahreArray = Object.keys(jahre).sort();
    
    // Calculate average margins
    let sumDB2Margin = 0;
    let sumEBITMargin = 0;
    let validYears = 0;
    
    jahreArray.forEach(jahr => {
        const yearData = jahre[jahr];
        if (yearData.sales_revenue > 0) {
            sumDB2Margin += yearData.db2_margin_prozent || 0;
            sumEBITMargin += yearData.ebit_margin_prozent || 0;
            validYears++;
        }
    });
    
    const avg_manufacturing_margin = validYears > 0 ? sumDB2Margin / validYears : 0;
    const avg_ebit_margin = validYears > 0 ? sumEBITMargin / validYears : 0;
    
    // Find break-even year
    let cumulativeEBIT = 0;
    let break_even_year = null;
    
    for (const jahr of jahreArray) {
        cumulativeEBIT += jahre[jahr].ebit || 0;
        if (cumulativeEBIT >= 0 && break_even_year === null) {
            break_even_year = jahr;
        }
    }
    
    // Calculate NPV
    const cashflows = jahreArray.map(jahr => jahre[jahr].ebit || 0);
    const npv = calculateNPV(cashflows, wacc);
    
    // Calculate IRR
    const irrResult = calculateIRR(cashflows);
    
    // Calculate payback period
    const payback_period = calculatePaybackPeriod(cashflows);
    
    return {
        avg_manufacturing_margin,
        avg_ebit_margin,
        break_even_year,
        npv,
        irr: irrResult.irr,
        payback_period,
        wacc
    };
}

/**
 * Calculate Net Present Value
 * 
 * @param {number[]} cashflows - Cashflows
 * @param {number} discountRate - Discount rate
 * @returns {number} NPV
 * 
 * @private
 */
function calculateNPV(cashflows, discountRate) {
    let npv = 0;
    cashflows.forEach((cf, index) => {
        const period = index + 1;
        npv += cf / Math.pow(1 + discountRate, period);
    });
    return Math.round(npv * 100) / 100;
}

/**
 * Calculate Internal Rate of Return
 * 
 * @param {number[]} cashflows - Cashflows
 * @param {number} [initialGuess=0.1] - Initial guess
 * @returns {Object} IRR result
 * 
 * @private
 */
function calculateIRR(cashflows, initialGuess = 0.1) {
    const maxIterations = 100;
    const precision = 0.0001;
    
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
 * Calculate NPV for IRR
 * 
 * @param {number[]} cashflows - Cashflows
 * @param {number} rate - Rate
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
 * Calculate NPV derivative
 * 
 * @param {number[]} cashflows - Cashflows
 * @param {number} rate - Rate
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
 * Calculate payback period
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
 * Calculate sensitivity analysis
 * Tornado chart data showing impact of each parameter on EBIT
 * 
 * @param {Object} baseResult - Base case result
 * @param {Object} szenarioConfig - Base scenario config
 * @param {Array} parameters - Parameters to analyze
 * @returns {Array} Sensitivity data
 * 
 * @public
 */
export function calculateSensitivity(baseResult, szenarioConfig, parameters) {
    const sensitivityData = [];
    
    parameters.forEach(param => {
        // Calculate impact of +/- change
        const positiveConfig = JSON.parse(JSON.stringify(szenarioConfig));
        const negativeConfig = JSON.parse(JSON.stringify(szenarioConfig));
        
        // Apply +20% change
        positiveConfig[param.key].mode = SZENARIO_MODES.MANUAL;
        positiveConfig[param.key].adjustment = 0.20;
        
        // Apply -20% change
        negativeConfig[param.key].mode = SZENARIO_MODES.MANUAL;
        negativeConfig[param.key].adjustment = -0.20;
        
        const positiveResult = applySzenario(baseResult, positiveConfig);
        const negativeResult = applySzenario(baseResult, negativeConfig);
        
        const baseEBIT = baseResult.totals.ebit_total;
        const positiveEBIT = positiveResult.totals.ebit_total;
        const negativeEBIT = negativeResult.totals.ebit_total;
        
        const positiveImpact = ((positiveEBIT - baseEBIT) / baseEBIT) * 100;
        const negativeImpact = ((negativeEBIT - baseEBIT) / baseEBIT) * 100;
        
        sensitivityData.push({
            parameter: param.label,
            key: param.key,
            positiveImpact,
            negativeImpact,
            maxImpact: Math.max(Math.abs(positiveImpact), Math.abs(negativeImpact))
        });
    });
    
    // Sort by max impact descending
    sensitivityData.sort((a, b) => b.maxImpact - a.maxImpact);
    
    return sensitivityData;
}

/**
 * Compare multiple scenarios
 * 
 * @param {Object} baseResult - Base calculation result
 * @param {Array} scenarios - Array of scenario configs
 * @returns {Object} Comparison data
 * 
 * @public
 */
export function compareScenarios(baseResult, scenarios) {
    const comparison = {
        scenarios: [],
        metrics: {}
    };
    
    scenarios.forEach(scenario => {
        const result = applySzenario(baseResult, scenario.config);
        
        comparison.scenarios.push({
            id: scenario.id,
            name: scenario.name,
            color: scenario.color,
            result: result,
            summary: {
                total_revenue: result.totals.sales_revenue_total,
                total_ebit: result.totals.ebit_total,
                avg_ebit_margin: result.kpis.avg_ebit_margin,
                npv: result.kpis.npv,
                irr: result.kpis.irr
            }
        });
    });
    
    return comparison;
}

/**
 * Export public API
 */
export default {
    applySzenario,
    calculateSensitivity,
    compareScenarios
};
