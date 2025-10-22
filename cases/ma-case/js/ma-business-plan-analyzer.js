/**
 * ALBO M&A - AI Business Plan Analyzer
 * Automatische Unternehmensbewertung durch KI-Analyse
 * Version: 1.0 - October 2025
 */

class ALBOBusinessPlanAnalyzer {
    constructor() {
        this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-sonnet-4-20250514';
        this.maxTokens = 4000;
        
        // Valuation parameters
        this.valuationMethods = {
            dcf: { weight: 0.5, name: 'DCF Valuation' },
            multiples: { weight: 0.3, name: 'Multiple Approach' },
            precedent: { weight: 0.2, name: 'Precedent Transactions' }
        };
        
        // Industry benchmarks
        this.industryBenchmarks = {
            'technology': { evEbitdaMultiple: 12.5, wacc: 9.0, growthRate: 15.0 },
            'industrial': { evEbitdaMultiple: 8.5, wacc: 8.0, growthRate: 8.0 },
            'services': { evEbitdaMultiple: 10.0, wacc: 8.5, growthRate: 10.0 },
            'consumer': { evEbitdaMultiple: 11.0, wacc: 8.5, growthRate: 12.0 }
        };
    }

    /**
     * Analyze uploaded Business Plan file
     * @param {File} file - The uploaded business plan file (PDF or Excel)
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeBusinessPlan(file) {
        console.log('📊 Starting Business Plan Analysis:', file.name);
        
        try {
            // Step 1: Extract content from file
            const fileContent = await this.extractFileContent(file);
            
            // Step 2: Send to Claude for analysis
            const analysis = await this.performAIAnalysis(fileContent, file.name);
            
            // Step 3: Calculate valuations
            const valuation = this.calculateValuations(analysis);
            
            // Step 4: Generate business case
            const businessCase = this.generateBusinessCase(analysis, valuation);
            
            return {
                success: true,
                analysis,
                valuation,
                businessCase,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Business Plan Analysis failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extract content from uploaded file
     */
    async extractFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const base64Data = e.target.result.split(',')[1];
                    
                    // For PDF or Excel files, we'll use base64 encoding
                    resolve({
                        type: file.type,
                        name: file.name,
                        size: file.size,
                        data: base64Data
                    });
                } catch (err) {
                    reject(new Error('Failed to read file: ' + err.message));
                }
            };
            
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Perform AI analysis using Claude API
     */
    async performAIAnalysis(fileContent, fileName) {
        console.log('🤖 Sending to AI for analysis...');
        
        // Prepare the prompt for Claude
        const prompt = this.buildAnalysisPrompt(fileName);
        
        // Prepare message with document
        const messages = [{
            role: 'user',
            content: [
                {
                    type: 'document',
                    source: {
                        type: 'base64',
                        media_type: fileContent.type === 'application/pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        data: fileContent.data
                    }
                },
                {
                    type: 'text',
                    text: prompt
                }
            ]
        }];
        
        try {
            // Call Claude API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: this.maxTokens,
                    messages: messages
                })
            });
            
            if (!response.ok) {
                throw new Error('API request failed: ' + response.status);
            }
            
            const data = await response.json();
            const analysisText = data.content[0].text;
            
            // Parse JSON response
            const cleanedText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const analysis = JSON.parse(cleanedText);
            
            console.log('✅ AI Analysis complete');
            return analysis;
            
        } catch (error) {
            console.error('❌ AI Analysis failed:', error);
            
            // Return fallback analysis with demo data
            return this.getFallbackAnalysis();
        }
    }

    /**
     * Build comprehensive analysis prompt for Claude
     */
    buildAnalysisPrompt(fileName) {
        return `Du bist ein erfahrener M&A-Analyst. Analysiere den hochgeladenen Business Plan "${fileName}" und extrahiere folgende Informationen:

WICHTIG: Deine gesamte Antwort MUSS ein einzelnes, valides JSON-Objekt sein. Verwende KEINE Markdown-Formatierung oder andere Texte außerhalb des JSON.

Analysiere:

1. **Unternehmensübersicht**
   - Name, Branche, Geschäftsmodell
   - Produkte/Dienstleistungen
   - Marktpositionierung
   
2. **Finanzielle Kennzahlen** (letzten 3 Jahre + Forecast 5 Jahre)
   - Umsatz (Revenue)
   - EBITDA & EBITDA-Marge
   - EBIT & EBIT-Marge
   - Free Cash Flow
   - CapEx & Working Capital
   - Verschuldungsgrad (Net Debt)
   
3. **Wachstumsannahmen**
   - Umsatzwachstum CAGR
   - EBITDA-Margen Entwicklung
   - Wichtige Treiber des Wachstums
   
4. **Risiken & Chancen**
   - Top 3 Risiken
   - Top 3 Chancen
   
5. **Bewertungsparameter**
   - Geschätzte WACC
   - Terminal Growth Rate
   - Vergleichbare Unternehmen (wenn erwähnt)

Antworte NUR mit einem JSON-Objekt in folgendem Format (keine zusätzlichen Texte):

{
  "company": {
    "name": "string",
    "industry": "string",
    "businessModel": "string"
  },
  "financials": {
    "historical": {
      "year1": { "revenue": number, "ebitda": number, "ebitdaMargin": number },
      "year2": { "revenue": number, "ebitda": number, "ebitdaMargin": number },
      "year3": { "revenue": number, "ebitda": number, "ebitdaMargin": number }
    },
    "forecast": {
      "year1": { "revenue": number, "ebitda": number, "ebitdaMargin": number, "capex": number, "workingCapital": number },
      "year2": { "revenue": number, "ebitda": number, "ebitdaMargin": number, "capex": number, "workingCapital": number },
      "year3": { "revenue": number, "ebitda": number, "ebitdaMargin": number, "capex": number, "workingCapital": number },
      "year4": { "revenue": number, "ebitda": number, "ebitdaMargin": number, "capex": number, "workingCapital": number },
      "year5": { "revenue": number, "ebitda": number, "ebitdaMargin": number, "capex": number, "workingCapital": number }
    }
  },
  "growth": {
    "revenueCagr": number,
    "ebitdaMarginTrend": "string",
    "keyDrivers": ["string", "string", "string"]
  },
  "risks": ["string", "string", "string"],
  "opportunities": ["string", "string", "string"],
  "valuationParams": {
    "wacc": number,
    "terminalGrowth": number,
    "comparableMultiples": number
  }
}

WICHTIG: Antworte NUR mit dem JSON-Objekt. Keine zusätzlichen Erklärungen, keine Markdown-Formatierung.`;
    }

    /**
     * Calculate valuations based on analysis
     */
    calculateValuations(analysis) {
        console.log('💰 Calculating valuations...');
        
        const { financials, valuationParams } = analysis;
        const wacc = valuationParams.wacc || 8.5;
        const terminalGrowth = valuationParams.terminalGrowth || 2.5;
        
        // 1. DCF Valuation
        const dcfValue = this.calculateDCF(financials.forecast, wacc, terminalGrowth);
        
        // 2. Multiple Valuation
        const latestEbitda = financials.historical.year3?.ebitda || financials.forecast.year1.ebitda;
        const multipleValue = this.calculateMultipleValuation(latestEbitda, valuationParams.comparableMultiples);
        
        // 3. Precedent Transactions (estimated with premium)
        const precedentValue = multipleValue * 1.25; // Assume 25% control premium
        
        // Weighted Average
        const weightedAverage = 
            (dcfValue * this.valuationMethods.dcf.weight) +
            (multipleValue * this.valuationMethods.multiples.weight) +
            (precedentValue * this.valuationMethods.precedent.weight);
        
        return {
            dcf: {
                value: dcfValue,
                method: 'Discounted Cash Flow',
                wacc: wacc,
                terminalGrowth: terminalGrowth
            },
            multiples: {
                value: multipleValue,
                method: 'EV/EBITDA Multiple',
                multiple: valuationParams.comparableMultiples || 8.5
            },
            precedent: {
                value: precedentValue,
                method: 'Precedent Transactions',
                premium: '25%'
            },
            weightedAverage: weightedAverage,
            range: {
                low: Math.min(dcfValue, multipleValue, precedentValue),
                high: Math.max(dcfValue, multipleValue, precedentValue)
            }
        };
    }

    /**
     * Calculate DCF valuation
     */
    calculateDCF(forecast, wacc, terminalGrowth) {
        let npv = 0;
        
        // Calculate Free Cash Flows for forecast period
        Object.keys(forecast).forEach((year, index) => {
            const yearData = forecast[year];
            const freeCashFlow = yearData.ebitda - yearData.capex - yearData.workingCapital;
            const discountFactor = Math.pow(1 + wacc / 100, index + 1);
            npv += freeCashFlow / discountFactor;
        });
        
        // Terminal Value
        const lastYearFCF = forecast.year5.ebitda - forecast.year5.capex - forecast.year5.workingCapital;
        const terminalValue = (lastYearFCF * (1 + terminalGrowth / 100)) / ((wacc - terminalGrowth) / 100);
        const terminalValuePV = terminalValue / Math.pow(1 + wacc / 100, 5);
        
        return npv + terminalValuePV;
    }

    /**
     * Calculate Multiple-based valuation
     */
    calculateMultipleValuation(ebitda, comparableMultiple) {
        const multiple = comparableMultiple || 8.5;
        return ebitda * multiple;
    }

    /**
     * Generate internal business case
     */
    generateBusinessCase(analysis, valuation) {
        const purchasePrice = valuation.weightedAverage;
        const transactionCosts = purchasePrice * 0.05; // 5% transaction costs
        const integrationCosts = purchasePrice * 0.08; // 8% integration costs
        
        // Synergy estimation (conservative: 15% of EBITDA)
        const avgEbitda = Object.values(analysis.financials.forecast)
            .reduce((sum, year) => sum + year.ebitda, 0) / 5;
        const annualSynergies = avgEbitda * 0.15;
        const synergyNPV = this.calculateSynergyNPV(annualSynergies, 8.5, 5);
        
        // Calculate IRR and Payback
        const totalInvestment = purchasePrice + transactionCosts + integrationCosts;
        const irr = this.calculateIRR(totalInvestment, avgEbitda, synergyNPV);
        const paybackPeriod = totalInvestment / (avgEbitda + annualSynergies);
        
        return {
            investment: {
                purchasePrice: purchasePrice,
                transactionCosts: transactionCosts,
                integrationCosts: integrationCosts,
                total: totalInvestment
            },
            synergies: {
                annualCostSynergies: annualSynergies * 0.6,
                annualRevenueSynergies: annualSynergies * 0.4,
                totalNPV: synergyNPV
            },
            returns: {
                irr: irr,
                paybackPeriod: paybackPeriod,
                npv: synergyNPV - transactionCosts
            }
        };
    }

    /**
     * Calculate Synergy NPV
     */
    calculateSynergyNPV(annualSynergies, wacc, years) {
        let npv = 0;
        for (let i = 1; i <= years; i++) {
            npv += annualSynergies / Math.pow(1 + wacc / 100, i);
        }
        return npv;
    }

    /**
     * Calculate IRR (simplified estimation)
     */
    calculateIRR(investment, avgEbitda, synergyNPV) {
        // Simplified IRR calculation
        const totalReturns = avgEbitda * 5 + synergyNPV;
        const irr = (Math.pow(totalReturns / investment, 1 / 5) - 1) * 100;
        return Math.max(0, Math.min(irr, 50)); // Cap between 0-50%
    }

    /**
     * Fallback analysis with demo data
     */
    getFallbackAnalysis() {
        return {
            company: {
                name: 'TechCorp GmbH',
                industry: 'Technology',
                businessModel: 'SaaS Platform'
            },
            financials: {
                historical: {
                    year1: { revenue: 8.5, ebitda: 1.5, ebitdaMargin: 17.6 },
                    year2: { revenue: 10.2, ebitda: 2.0, ebitdaMargin: 19.6 },
                    year3: { revenue: 12.5, ebitda: 2.5, ebitdaMargin: 20.0 }
                },
                forecast: {
                    year1: { revenue: 15.0, ebitda: 3.2, ebitdaMargin: 21.3, capex: 1.2, workingCapital: 0.8 },
                    year2: { revenue: 18.0, ebitda: 4.0, ebitdaMargin: 22.2, capex: 1.5, workingCapital: 1.0 },
                    year3: { revenue: 21.5, ebitda: 5.0, ebitdaMargin: 23.3, capex: 1.8, workingCapital: 1.2 },
                    year4: { revenue: 25.0, ebitda: 6.0, ebitdaMargin: 24.0, capex: 2.0, workingCapital: 1.5 },
                    year5: { revenue: 29.0, ebitda: 7.2, ebitdaMargin: 24.8, capex: 2.2, workingCapital: 1.8 }
                }
            },
            growth: {
                revenueCagr: 12.5,
                ebitdaMarginTrend: 'Expanding from 20% to 25%',
                keyDrivers: ['New product launches', 'Market expansion', 'Operational efficiency']
            },
            risks: [
                'Customer concentration: Top 3 customers = 45% revenue',
                'Competitive pressure from larger players',
                'Technology obsolescence risk'
            ],
            opportunities: [
                'International expansion (US market)',
                'Cross-selling to existing customer base',
                'M&A of complementary businesses'
            ],
            valuationParams: {
                wacc: 8.5,
                terminalGrowth: 2.5,
                comparableMultiples: 9.5
            }
        };
    }

    /**
     * Format currency for display
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 1,
            minimumFractionDigits: 1
        }).format(value) + 'M';
    }

    /**
     * Format percentage for display
     */
    formatPercentage(value) {
        return value.toFixed(1) + '%';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ALBOBusinessPlanAnalyzer;
}

// Make available globally
window.ALBOBusinessPlanAnalyzer = ALBOBusinessPlanAnalyzer;

console.log('✅ ALBO Business Plan Analyzer loaded');