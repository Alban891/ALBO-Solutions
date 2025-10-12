/**
 * Metrics Calculator
 * Calculates financial KPIs: ROI, NPV, Break-Even, IRR, etc.
 * Version: 1.0.0
 */

export class MetricsCalculator {
    constructor() {
        this.defaultDiscountRate = 0.08; // 8% WACC
        this.defaultYears = 3;
        console.log('📊 Metrics Calculator initialized');
    }
    
    // ═══════════════════════════════════════════════════════
    // MAIN CALCULATION (ASYNC)
    // ═══════════════════════════════════════════════════════
    
    /**
     * Calculate all metrics (async version for consistency)
     * @param {Object} artikel - Article data
     * @param {Object} projekt - Project data
     * @returns {Promise<Object>} All metrics
     */
    async calculate(artikel, projekt) {
        return this.calculateSync(artikel, projekt);
    }
    
    /**
     * Calculate all metrics (synchronous)
     * @param {Object} artikel - Article data
     * @param {Object} projekt - Project data
     * @returns {Object} All metrics
     */
    calculateSync(artikel, projekt) {
        console.log('🔢 Calculating metrics...');
        
        try {
            // Get time horizon
            const years = projekt.zeithorizont || this.defaultYears;
            
            // Calculate cash flows over time
            const cashFlows = this._calculateCashFlows(artikel, projekt, years);
            
            // Calculate project costs
            const projektkosten = this._calculateProjektkosten(projekt);
            
            // Calculate all KPIs
            const roi = this._calculateROI(cashFlows, projektkosten);
            const npv = this._calculateNPV(cashFlows, projektkosten);
            const breakEven = this._calculateBreakEven(cashFlows, projektkosten);
            const irr = this._calculateIRR(cashFlows, projektkosten);
            const payback = this._calculatePaybackPeriod(cashFlows, projektkosten);
            
            // Additional metrics
            const db1 = this._calculateDB1(artikel);
            const db2 = this._calculateDB2(artikel, projekt);
            const ebit = this._calculateEBIT(cashFlows, projektkosten, years);
            
            return {
                roi,
                npv,
                breakEven,
                irr,
                payback,
                db1,
                db2,
                ebit,
                cashFlows,
                projektkosten,
                years,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Metrics calculation failed:', error);
            return {
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // CASH FLOW CALCULATION
    // ═══════════════════════════════════════════════════════
    
    /**
     * Calculate cash flows for all years
     * @private
     */
    _calculateCashFlows(artikel, projekt, years) {
        const flows = [];
        
        for (let year = 1; year <= years; year++) {
            // Get volume for this year
            const menge = this._getVolumeForYear(artikel, year);
            
            // Get price for this year
            const preis = this._getPriceForYear(artikel, year);
            
            // Get HK for this year
            const hk = this._getHKForYear(artikel, year);
            
            // Calculate revenues and costs
            const revenue = menge * preis;
            const costs = menge * hk;
            const db1 = revenue - costs;
            
            flows.push({
                year,
                menge,
                preis,
                hk,
                revenue,
                costs,
                db1,
                db1Percent: revenue > 0 ? (db1 / revenue * 100) : 0
            });
        }
        
        return flows;
    }
    
    /**
     * Get volume for specific year based on growth model
     * @private
     */
    _getVolumeForYear(artikel, year) {
        const startMenge = artikel.start_menge || 0;
        const wachstum = artikel.wachstum_menge || {};
        
        if (year === 1) return startMenge;
        
        switch (wachstum.modell) {
            case 'linear':
                return this._applyLinearGrowth(startMenge, wachstum.werte?.rate || 0, year);
            
            case 'exponentiell':
                return this._applyExponentialGrowth(startMenge, wachstum.werte || {}, year);
            
            case 'stufen':
                return this._applyStepGrowth(startMenge, wachstum.werte?.stufen || [], year);
            
            case 'custom':
                return wachstum.werte?.jahre?.[year] || startMenge;
            
            default:
                return startMenge; // Konstant
        }
    }
    
    /**
     * Get price for specific year
     * @private
     */
    _getPriceForYear(artikel, year) {
        const startPreis = artikel.start_preis || 0;
        const wachstum = artikel.wachstum_preis || {};
        
        if (year === 1) return startPreis;
        
        switch (wachstum.modell) {
            case 'linear':
                return this._applyLinearGrowth(startPreis, wachstum.werte?.rate || 0, year);
            
            case 'exponentiell':
                return this._applyExponentialGrowth(startPreis, wachstum.werte || {}, year);
            
            case 'stufen':
                return this._applyStepGrowth(startPreis, wachstum.werte?.stufen || [], year);
            
            case 'custom':
                return wachstum.werte?.jahre?.[year] || startPreis;
            
            default:
                return startPreis;
        }
    }
    
    /**
     * Get HK for specific year
     * @private
     */
    _getHKForYear(artikel, year) {
        // For now, HK follows price growth (maintaining ratio)
        const startHK = artikel.start_hk || 0;
        const startPreis = artikel.start_preis || 1;
        const currentPreis = this._getPriceForYear(artikel, year);
        
        // Maintain HK ratio
        return startHK * (currentPreis / startPreis);
    }
    
    // ═══════════════════════════════════════════════════════
    // GROWTH MODEL HELPERS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Apply linear growth
     * @private
     */
    _applyLinearGrowth(startValue, rate, year) {
        return startValue * Math.pow(1 + (rate / 100), year - 1);
    }
    
    /**
     * Apply exponential growth
     * @private
     */
    _applyExponentialGrowth(startValue, werte, year) {
        const startRate = werte.start || 0;
        const endRate = werte.end || startRate;
        const duration = werte.duration || 3;
        
        // Interpolate rate
        const currentRate = startRate + ((endRate - startRate) / duration) * (year - 1);
        
        return startValue * Math.pow(1 + (currentRate / 100), year - 1);
    }
    
    /**
     * Apply step growth
     * @private
     */
    _applyStepGrowth(startValue, stufen, year) {
        let value = startValue;
        
        stufen.forEach(stufe => {
            if (year >= stufe.von && year <= stufe.bis) {
                value *= (1 + (stufe.rate / 100));
            }
        });
        
        return value;
    }
    
    // ═══════════════════════════════════════════════════════
    // KPI CALCULATIONS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Calculate ROI
     * @private
     */
    _calculateROI(cashFlows, projektkosten) {
        const totalDB1 = cashFlows.reduce((sum, cf) => sum + cf.db1, 0);
        const totalInvestment = projektkosten.gesamt;
        
        if (totalInvestment === 0) {
            return {
                value: 0,
                percent: 0,
                status: 'no_investment',
                label: 'ROI'
            };
        }
        
        const roi = (totalDB1 - totalInvestment) / totalInvestment;
        
        return {
            value: roi,
            percent: roi * 100,
            investment: totalInvestment,
            returns: totalDB1,
            netGain: totalDB1 - totalInvestment,
            status: roi >= 0.20 ? 'good' : roi >= 0.15 ? 'ok' : 'low',
            label: 'ROI'
        };
    }
    
    /**
     * Calculate NPV (Net Present Value)
     * @private
     */
    _calculateNPV(cashFlows, projektkosten) {
        const discountRate = this.defaultDiscountRate;
        let npv = -projektkosten.gesamt; // Initial investment
        
        cashFlows.forEach((cf, idx) => {
            const year = idx + 1;
            const discountedCF = cf.db1 / Math.pow(1 + discountRate, year);
            npv += discountedCF;
        });
        
        return {
            value: npv,
            discountRate: discountRate * 100,
            status: npv > 0 ? 'positive' : 'negative',
            label: 'NPV'
        };
    }
    
    /**
     * Calculate Break-Even point
     * @private
     */
    _calculateBreakEven(cashFlows, projektkosten) {
        let cumulativeDB1 = 0;
        let breakEvenMonth = null;
        
        for (let i = 0; i < cashFlows.length; i++) {
            const cf = cashFlows[i];
            const monthlyDB1 = cf.db1 / 12;
            
            for (let month = 1; month <= 12; month++) {
                cumulativeDB1 += monthlyDB1;
                
                if (cumulativeDB1 >= projektkosten.gesamt && breakEvenMonth === null) {
                    breakEvenMonth = (i * 12) + month;
                    break;
                }
            }
            
            if (breakEvenMonth !== null) break;
        }
        
        // If not reached, estimate
        if (breakEvenMonth === null) {
            const totalDB1 = cashFlows.reduce((sum, cf) => sum + cf.db1, 0);
            if (totalDB1 < projektkosten.gesamt) {
                breakEvenMonth = 999; // Not reached
            } else {
                breakEvenMonth = Math.ceil((projektkosten.gesamt / totalDB1) * cashFlows.length * 12);
            }
        }
        
        return {
            months: breakEvenMonth,
            years: (breakEvenMonth / 12).toFixed(1),
            status: breakEvenMonth <= 18 ? 'good' : breakEvenMonth <= 24 ? 'ok' : 'slow',
            reached: breakEvenMonth < 999,
            label: 'Break-Even'
        };
    }
    
    /**
     * Calculate IRR (Internal Rate of Return)
     * Simplified approximation
     * @private
     */
    _calculateIRR(cashFlows, projektkosten) {
        // Simplified IRR calculation using NPV approximation
        // For production, use proper IRR algorithm
        
        const totalDB1 = cashFlows.reduce((sum, cf) => sum + cf.db1, 0);
        const avgAnnualReturn = totalDB1 / cashFlows.length;
        const investment = projektkosten.gesamt;
        
        if (investment === 0) {
            return {
                value: 0,
                percent: 0,
                status: 'unknown',
                label: 'IRR'
            };
        }
        
        // Simplified IRR approximation
        const irr = (avgAnnualReturn / investment) - 1;
        
        return {
            value: irr,
            percent: irr * 100,
            status: irr >= 0.15 ? 'good' : irr >= 0.10 ? 'ok' : 'low',
            label: 'IRR',
            note: 'Vereinfachte Berechnung'
        };
    }
    
    /**
     * Calculate Payback Period
     * @private
     */
    _calculatePaybackPeriod(cashFlows, projektkosten) {
        let cumulative = 0;
        let paybackYear = null;
        
        for (let i = 0; i < cashFlows.length; i++) {
            cumulative += cashFlows[i].db1;
            
            if (cumulative >= projektkosten.gesamt && paybackYear === null) {
                paybackYear = i + 1;
                break;
            }
        }
        
        if (paybackYear === null) {
            paybackYear = cashFlows.length + 1; // Beyond horizon
        }
        
        return {
            years: paybackYear,
            months: paybackYear * 12,
            reached: paybackYear <= cashFlows.length,
            status: paybackYear <= 2 ? 'good' : paybackYear <= 3 ? 'ok' : 'slow',
            label: 'Payback Period'
        };
    }
    
    /**
     * Calculate DB1 (Deckungsbeitrag 1)
     * @private
     */
    _calculateDB1(artikel) {
        const preis = artikel.start_preis || 0;
        const hk = artikel.start_hk || 0;
        const db1 = preis - hk;
        const db1Percent = preis > 0 ? (db1 / preis * 100) : 0;
        
        return {
            value: db1,
            percent: db1Percent,
            perUnit: db1,
            status: db1Percent >= 40 ? 'good' : db1Percent >= 30 ? 'ok' : 'low',
            label: 'DB1'
        };
    }
    
    /**
     * Calculate DB2 (after project costs)
     * @private
     */
    _calculateDB2(artikel, projekt) {
        const menge = artikel.start_menge || 0;
        const preis = artikel.start_preis || 0;
        const hk = artikel.start_hk || 0;
        
        const revenue = menge * preis;
        const costs = menge * hk;
        const db1 = revenue - costs;
        
        // Get project costs allocated to first year
        const projektkosten = this._calculateProjektkosten(projekt);
        const yearlyProjectCosts = projektkosten.gesamt / (projekt.zeithorizont || 3);
        
        const db2 = db1 - yearlyProjectCosts;
        const db2Percent = revenue > 0 ? (db2 / revenue * 100) : 0;
        
        return {
            value: db2,
            percent: db2Percent,
            db1: db1,
            projectCosts: yearlyProjectCosts,
            status: db2Percent >= 20 ? 'good' : db2Percent >= 10 ? 'ok' : 'low',
            label: 'DB2'
        };
    }
    
    /**
     * Calculate EBIT
     * @private
     */
    _calculateEBIT(cashFlows, projektkosten, years) {
        const totalDB1 = cashFlows.reduce((sum, cf) => sum + cf.db1, 0);
        const totalRevenue = cashFlows.reduce((sum, cf) => sum + cf.revenue, 0);
        const avgYearlyProjectCosts = projektkosten.gesamt / years;
        
        const ebit = totalDB1 - projektkosten.gesamt;
        const ebitPercent = totalRevenue > 0 ? (ebit / totalRevenue * 100) : 0;
        
        return {
            value: ebit,
            percent: ebitPercent,
            yearly: ebit / years,
            status: ebitPercent >= 15 ? 'good' : ebitPercent >= 10 ? 'ok' : 'low',
            label: 'EBIT'
        };
    }
    
    // ═══════════════════════════════════════════════════════
    // PROJECT COSTS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Calculate total project costs
     * @private
     */
    _calculateProjektkosten(projekt) {
        const kosten = projekt.kosten || [];
        
        const byCategory = {};
        let gesamt = 0;
        
        kosten.forEach(k => {
            const kategorie = k.kategorie || 'Sonstige';
            const betrag = k.betrag || 0;
            
            byCategory[kategorie] = (byCategory[kategorie] || 0) + betrag;
            gesamt += betrag;
        });
        
        return {
            gesamt,
            byCategory,
            count: kosten.length
        };
    }
    
    // ═══════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Format currency
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    }
    
    /**
     * Format percent
     */
    formatPercent(value) {
        return `${(value * 100).toFixed(1)}%`;
    }
}