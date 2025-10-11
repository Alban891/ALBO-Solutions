/**
 * Plausibility Checker
 * Validates user inputs against playbook benchmarks
 * Provides warnings for unrealistic values
 */

export class PlausibilityChecker {
    constructor(playbook = null) {
        this.playbook = playbook;
        this.warnings = [];
        this.errors = [];
        
        // Validation thresholds
        this.thresholds = {
            warning: 0.20,  // 20% deviation
            error: 0.50     // 50% deviation
        };
    }
    
    /**
     * Set active playbook
     */
    setPlaybook(playbook) {
        this.playbook = playbook;
        console.log(`📋 Playbook set: ${playbook?.name || 'None'}`);
    }
    
    /**
     * Validate EBIT margin
     */
    validateEBIT(ebit, projectData = {}) {
        if (!this.playbook) return this.noPlaybookResult('EBIT');
        
        const benchmark = this.playbook.benchmarks?.ebit_margin;
        if (!benchmark) return this.noBenchmarkResult('EBIT');
        
        const result = {
            field: 'ebit_margin',
            value: ebit,
            benchmark: benchmark,
            status: 'ok',
            severity: null,
            message: null,
            deviation: 0,
            recommendation: null
        };
        
        // Calculate deviation
        const deviation = Math.abs(ebit - benchmark.typical) / benchmark.typical;
        result.deviation = deviation;
        
        // Check against ranges
        if (ebit < benchmark.min) {
            result.status = 'error';
            result.severity = 'high';
            result.message = `EBIT-Marge ${ebit.toFixed(1)}% ist unrealistisch niedrig.`;
            result.recommendation = `Branchenüblich: ${benchmark.min}-${benchmark.max}%. Prüfe Kostenstruktur und Preisgestaltung.`;
        } else if (ebit > benchmark.max) {
            result.status = 'warning';
            result.severity = 'high';
            result.message = `⚠️ EBIT-Marge ${ebit.toFixed(1)}% ist unrealistisch hoch!`;
            result.recommendation = this.getEBITRecommendation(ebit, benchmark, projectData);
        } else if (ebit < benchmark.realistic_min) {
            result.status = 'warning';
            result.severity = 'medium';
            result.message = `EBIT-Marge ${ebit.toFixed(1)}% ist niedrig, aber möglich.`;
            result.recommendation = `Typisch: ${benchmark.typical}%. Prüfe ob alle Kosten erfasst sind.`;
        } else if (ebit > benchmark.realistic_max) {
            result.status = 'warning';
            result.severity = 'medium';
            result.message = `EBIT-Marge ${ebit.toFixed(1)}% ist ambitioniert.`;
            result.recommendation = `Typisch: ${benchmark.typical}%. Validiere Annahmen kritisch.`;
        } else {
            result.status = 'ok';
            result.message = `✅ EBIT-Marge ${ebit.toFixed(1)}% liegt im realistischen Bereich.`;
        }
        
        return result;
    }
    
    /**
     * Get detailed EBIT recommendation
     */
    getEBITRecommendation(ebit, benchmark, projectData) {
        const reasons = [];
        
        // Check cost structure
        if (projectData.material_cost_ratio < 0.30) {
            reasons.push('Materialkosten erscheinen zu niedrig');
        }
        
        if (projectData.personnel_cost_ratio < 0.20) {
            reasons.push('Personalkosten könnten fehlen');
        }
        
        if (!projectData.overhead_included) {
            reasons.push('Gemeinkosten möglicherweise nicht berücksichtigt');
        }
        
        let recommendation = `Benchmark: ${benchmark.typical}%\n\nMögliche Ursachen:\n`;
        
        if (reasons.length > 0) {
            recommendation += reasons.map(r => `• ${r}`).join('\n');
        } else {
            recommendation += `• Projektkosten unvollständig erfasst\n`;
            recommendation += `• Herstellkosten zu niedrig kalkuliert\n`;
            recommendation += `• Overheadkosten fehlen\n`;
        }
        
        recommendation += `\n\nEmpfehlung:\n`;
        recommendation += `→ Projektkosten-Tab durchgehen\n`;
        recommendation += `→ HK-Struktur prüfen (Soll: ${this.playbook.benchmarks.cost_structure.material}% Material)\n`;
        recommendation += `→ Realistisches EBIT-Ziel: ${benchmark.typical}%`;
        
        return recommendation;
    }
    
    /**
     * Validate DB2 (Deckungsbeitrag 2)
     */
    validateDB2(db2) {
        if (!this.playbook) return this.noPlaybookResult('DB2');
        
        const benchmark = this.playbook.benchmarks?.db2_margin;
        if (!benchmark) return this.noBenchmarkResult('DB2');
        
        const result = {
            field: 'db2_margin',
            value: db2,
            benchmark: benchmark,
            status: 'ok',
            severity: null,
            message: null
        };
        
        if (db2 < benchmark.min) {
            result.status = 'error';
            result.severity = 'high';
            result.message = `DB2 ${db2.toFixed(1)}% ist kritisch niedrig. Projekt wahrscheinlich nicht profitabel.`;
        } else if (db2 > benchmark.max) {
            result.status = 'warning';
            result.severity = 'medium';
            result.message = `DB2 ${db2.toFixed(1)}% ist sehr hoch. Validiere Preisgestaltung.`;
        } else if (db2 < benchmark.realistic_min) {
            result.status = 'warning';
            result.severity = 'low';
            result.message = `DB2 ${db2.toFixed(1)}% ist knapp. Typisch: ${benchmark.typical}%.`;
        } else {
            result.status = 'ok';
            result.message = `✅ DB2 ${db2.toFixed(1)}% im realistischen Bereich.`;
        }
        
        return result;
    }
    
    /**
     * Validate Break-Even period
     */
    validateBreakEven(breakEvenYear, zeithorizont) {
        if (!this.playbook) return this.noPlaybookResult('Break-Even');
        
        const benchmark = this.playbook.benchmarks?.break_even_year;
        if (!benchmark) return this.noBenchmarkResult('Break-Even');
        
        const result = {
            field: 'break_even',
            value: breakEvenYear,
            benchmark: benchmark,
            status: 'ok',
            severity: null,
            message: null
        };
        
        if (breakEvenYear > zeithorizont) {
            result.status = 'error';
            result.severity = 'high';
            result.message = `⚠️ Break-Even nicht innerhalb Zeithorizont (${zeithorizont} Jahre)!`;
            result.recommendation = 'Projekt ist nicht wirtschaftlich. Kosten senken oder Preise erhöhen.';
        } else if (breakEvenYear > benchmark.typical) {
            result.status = 'warning';
            result.severity = 'medium';
            result.message = `Break-Even in Jahr ${breakEvenYear} ist spät. Typisch: Jahr ${benchmark.typical}.`;
            result.recommendation = 'Prüfe ob Anlaufkosten zu hoch oder Mengenplanung zu konservativ.';
        } else if (breakEvenYear <= benchmark.min) {
            result.status = 'warning';
            result.severity = 'low';
            result.message = `Break-Even in Jahr ${breakEvenYear} ist sehr früh. Validiere Annahmen.`;
        } else {
            result.status = 'ok';
            result.message = `✅ Break-Even in Jahr ${breakEvenYear} ist realistisch.`;
        }
        
        return result;
    }
    
    /**
     * Validate quantity planning
     */
    validateQuantities(quantities, artikelType, zeithorizont) {
        if (!this.playbook) return this.noPlaybookResult('Mengen');
        
        const benchmark = this.playbook.benchmarks?.typical_quantities?.[artikelType];
        if (!benchmark) return this.noBenchmarkResult('Mengen');
        
        const results = [];
        
        quantities.forEach((qty, year) => {
            const result = {
                field: 'quantity',
                year: year + 1,
                value: qty,
                benchmark: benchmark,
                status: 'ok',
                severity: null,
                message: null
            };
            
            // Check first year
            if (year === 0) {
                if (qty < benchmark.year1_min) {
                    result.status = 'warning';
                    result.severity = 'medium';
                    result.message = `Menge ${qty} im Jahr 1 ist niedrig. Typisch: ${benchmark.year1_min}-${benchmark.year1_max}.`;
                } else if (qty > benchmark.year1_max) {
                    result.status = 'warning';
                    result.severity = 'high';
                    result.message = `⚠️ Menge ${qty} im Jahr 1 ist sehr hoch! Realistisch: max ${benchmark.year1_max}.`;
                    result.recommendation = 'Gibt es Vorverträge? Ist Produktionskapazität vorhanden?';
                }
            }
            
            // Check growth rate
            if (year > 0) {
                const growth = (qty - quantities[year - 1]) / quantities[year - 1];
                
                if (growth > benchmark.max_yearly_growth) {
                    result.status = 'warning';
                    result.severity = 'medium';
                    result.message = `Wachstum ${(growth * 100).toFixed(0)}% von Jahr ${year} zu ${year + 1} ist ambitioniert.`;
                    result.recommendation = `Typisches Wachstum: max ${(benchmark.max_yearly_growth * 100).toFixed(0)}% p.a.`;
                }
            }
            
            if (result.status !== 'ok') {
                results.push(result);
            }
        });
        
        return results.length > 0 ? results : [{
            field: 'quantity',
            status: 'ok',
            message: '✅ Mengenplanung liegt im realistischen Bereich.'
        }];
    }
    
    /**
     * Validate cost structure
     */
    validateCostStructure(costStructure) {
        if (!this.playbook) return this.noPlaybookResult('Kostenstruktur');
        
        const benchmark = this.playbook.benchmarks?.cost_structure;
        if (!benchmark) return this.noBenchmarkResult('Kostenstruktur');
        
        const results = [];
        
        // Material costs
        if (costStructure.material) {
            const deviation = Math.abs(costStructure.material - benchmark.material) / benchmark.material;
            
            if (deviation > this.thresholds.warning) {
                results.push({
                    field: 'material_cost',
                    value: costStructure.material,
                    benchmark: benchmark.material,
                    status: deviation > this.thresholds.error ? 'error' : 'warning',
                    severity: deviation > this.thresholds.error ? 'high' : 'medium',
                    message: `Materialkosten ${(costStructure.material * 100).toFixed(0)}% weichen stark ab. Typisch: ${(benchmark.material * 100).toFixed(0)}%.`
                });
            }
        }
        
        // Personnel costs
        if (costStructure.personnel) {
            const deviation = Math.abs(costStructure.personnel - benchmark.personnel) / benchmark.personnel;
            
            if (deviation > this.thresholds.warning) {
                results.push({
                    field: 'personnel_cost',
                    value: costStructure.personnel,
                    benchmark: benchmark.personnel,
                    status: deviation > this.thresholds.error ? 'error' : 'warning',
                    severity: deviation > this.thresholds.error ? 'high' : 'medium',
                    message: `Personalkosten ${(costStructure.personnel * 100).toFixed(0)}% weichen ab. Typisch: ${(benchmark.personnel * 100).toFixed(0)}%.`
                });
            }
        }
        
        return results.length > 0 ? results : [{
            field: 'cost_structure',
            status: 'ok',
            message: '✅ Kostenstruktur ist plausibel.'
        }];
    }
    
    /**
     * Validate pricing
     */
    validatePricing(price, artikelType, costPerUnit) {
        if (!this.playbook) return this.noPlaybookResult('Preisgestaltung');
        
        const benchmark = this.playbook.benchmarks?.typical_prices?.[artikelType];
        if (!benchmark) {
            // Fallback: Check markup
            return this.validateMarkup(price, costPerUnit);
        }
        
        const result = {
            field: 'pricing',
            value: price,
            benchmark: benchmark,
            status: 'ok',
            severity: null,
            message: null
        };
        
        if (price < benchmark.min) {
            result.status = 'warning';
            result.severity = 'high';
            result.message = `Preis €${price} ist sehr niedrig. Marktüblich: €${benchmark.min}-${benchmark.max}.`;
            result.recommendation = 'Prüfe ob Preis kostendeckend ist.';
        } else if (price > benchmark.max) {
            result.status = 'warning';
            result.severity = 'medium';
            result.message = `Preis €${price} ist sehr hoch. Marktüblich: €${benchmark.min}-${benchmark.max}.`;
            result.recommendation = 'Ist dieser Premium-Preis am Markt durchsetzbar?';
        } else {
            result.status = 'ok';
            result.message = `✅ Preis €${price} liegt im Marktüblichen Bereich.`;
        }
        
        return result;
    }
    
    /**
     * Validate markup (fallback if no price benchmark)
     */
    validateMarkup(price, cost) {
        const markup = (price - cost) / cost;
        
        const result = {
            field: 'markup',
            value: markup,
            status: 'ok',
            severity: null,
            message: null
        };
        
        if (markup < 0.5) {
            result.status = 'warning';
            result.severity = 'high';
            result.message = `⚠️ Aufschlag ${(markup * 100).toFixed(0)}% ist zu niedrig. Mindestens 50% empfohlen.`;
        } else if (markup > 3.0) {
            result.status = 'warning';
            result.severity = 'low';
            result.message = `Aufschlag ${(markup * 100).toFixed(0)}% ist sehr hoch. Ist das marktfähig?`;
        } else {
            result.status = 'ok';
            result.message = `✅ Aufschlag ${(markup * 100).toFixed(0)}% ist angemessen.`;
        }
        
        return result;
    }
    
    /**
     * Validate entire project
     */
    validateProject(projectData) {
        if (!this.playbook) {
            return {
                status: 'no_playbook',
                message: 'Kein Playbook aktiv. Validierung nicht möglich.',
                results: []
            };
        }
        
        const results = [];
        
        // EBIT
        if (projectData.ebit !== undefined) {
            results.push(this.validateEBIT(projectData.ebit, projectData));
        }
        
        // DB2
        if (projectData.db2 !== undefined) {
            results.push(this.validateDB2(projectData.db2));
        }
        
        // Break-Even
        if (projectData.breakEven !== undefined && projectData.zeithorizont) {
            results.push(this.validateBreakEven(projectData.breakEven, projectData.zeithorizont));
        }
        
        // Cost structure
        if (projectData.costStructure) {
            results.push(...this.validateCostStructure(projectData.costStructure));
        }
        
        // Quantities (if provided)
        if (projectData.quantities && projectData.artikelType) {
            results.push(...this.validateQuantities(
                projectData.quantities,
                projectData.artikelType,
                projectData.zeithorizont
            ));
        }
        
        // Aggregate status
        const hasErrors = results.some(r => r.status === 'error');
        const hasWarnings = results.some(r => r.status === 'warning');
        
        return {
            status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
            results: results,
            summary: this.generateSummary(results)
        };
    }
    
    /**
     * Generate summary of validation results
     */
    generateSummary(results) {
        const errors = results.filter(r => r.status === 'error');
        const warnings = results.filter(r => r.status === 'warning');
        const ok = results.filter(r => r.status === 'ok');
        
        let summary = '';
        
        if (errors.length > 0) {
            summary += `❌ ${errors.length} kritische Probleme gefunden.\n`;
        }
        
        if (warnings.length > 0) {
            summary += `⚠️ ${warnings.length} Warnungen.\n`;
        }
        
        if (errors.length === 0 && warnings.length === 0) {
            summary = '✅ Alle Werte sind plausibel!';
        }
        
        return summary;
    }
    
    /**
     * No playbook result
     */
    noPlaybookResult(field) {
        return {
            field: field.toLowerCase(),
            status: 'no_playbook',
            message: 'Kein Playbook aktiv. Validierung nicht möglich.'
        };
    }
    
    /**
     * No benchmark result
     */
    noBenchmarkResult(field) {
        return {
            field: field.toLowerCase(),
            status: 'no_benchmark',
            message: `Kein Benchmark für ${field} im Playbook definiert.`
        };
    }
    
    /**
     * Get all warnings
     */
    getWarnings() {
        return this.warnings;
    }
    
    /**
     * Get all errors
     */
    getErrors() {
        return this.errors;
    }
    
    /**
     * Clear warnings and errors
     */
    clear() {
        this.warnings = [];
        this.errors = [];
    }
}

// Export singleton (can be re-instantiated with different playbook)
export const plausibilityChecker = new PlausibilityChecker();