/**
 * ALBO Engine - Main Orchestrator
 * Coordinates multi-AI analysis, recommendations, and insights
 * Version: 1.0.0
 */

import { AI_CONFIG, MODEL_CONFIG } from '../config/ai-config.js';
import { AIRouter } from '../router/ai-router.js';
import { BusinessCaseAnalyzer } from './business-case-analyzer.js';
import { RecommendationEngine } from './recommendation-engine.js';
import { MetricsCalculator } from './metrics-calculator.js';

export class ALBOEngine {
    constructor() {
        this.router = new AIRouter();
        this.bcAnalyzer = new BusinessCaseAnalyzer();
        this.recommendationEngine = new RecommendationEngine();
        this.metricsCalculator = new MetricsCalculator();
        
        this.currentArtikel = null;
        this.currentProjekt = null;
        this.analysisCache = new Map();
        this.isAnalyzing = false;
        
        console.log('🤖 ALBO Engine initialized');
    }
    
    // ═══════════════════════════════════════════════════════
    // MAIN ANALYSIS METHODS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Analyze complete business case
     * @param {Object} artikel - Article data
     * @param {Object} projekt - Project data
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeBusinessCase(artikel, projekt) {
        if (this.isAnalyzing) {
            console.warn('⚠️ Analysis already in progress');
            return null;
        }
        
        console.log('🔍 Starting Business Case Analysis...', { artikel, projekt });
        this.isAnalyzing = true;
        
        try {
            // Store current context
            this.currentArtikel = artikel;
            this.currentProjekt = projekt;
            
            // Check cache first
            const cacheKey = this._getCacheKey(artikel, projekt);
            if (this.analysisCache.has(cacheKey)) {
                console.log('📦 Returning cached analysis');
                return this.analysisCache.get(cacheKey);
            }
            
            // Run parallel analysis
            const [
                bcAnalysis,
                metrics,
                recommendations
            ] = await Promise.all([
                this.bcAnalyzer.analyze(artikel, projekt),
                this.metricsCalculator.calculate(artikel, projekt),
                this.recommendationEngine.generate(artikel, projekt)
            ]);
            
            // Combine results
            const results = {
                status: this._determineStatus(bcAnalysis, metrics),
                confidence: this._calculateConfidence(bcAnalysis, metrics),
                timestamp: new Date().toISOString(),
                
                // Core Analysis
                analysis: bcAnalysis,
                
                // Metrics
                metrics: metrics,
                
                // Recommendations
                findings: recommendations.findings || [],
                quickWins: recommendations.quickWins || [],
                recommendations: recommendations.detailed || [],
                
                // Meta
                analysisType: 'full',
                aiUsed: bcAnalysis.aiUsed || 'claude'
            };
            
            // Cache results
            this.analysisCache.set(cacheKey, results);
            
            console.log('✅ Business Case Analysis complete', results);
            return results;
            
        } catch (error) {
            console.error('❌ Business Case Analysis failed:', error);
            return {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        } finally {
            this.isAnalyzing = false;
        }
    }
    
    /**
     * Quick analysis (lightweight, no AI calls)
     * @param {Object} artikel - Article data
     * @param {Object} projekt - Project data
     * @returns {Object} Quick analysis results
     */
    quickAnalysis(artikel, projekt) {
        console.log('⚡ Running Quick Analysis...');
        
        try {
            // Calculate metrics only (no AI)
            const metrics = this.metricsCalculator.calculateSync(artikel, projekt);
            
            // Simple status determination
            const status = this._determineStatusFromMetrics(metrics);
            
            return {
                status,
                metrics,
                timestamp: new Date().toISOString(),
                analysisType: 'quick',
                note: 'Quick analysis - for full insights run full analysis'
            };
            
        } catch (error) {
            console.error('❌ Quick Analysis failed:', error);
            return {
                status: 'error',
                error: error.message
            };
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // SPECIFIC ANALYSIS METHODS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Analyze specific aspect (ROI, NPV, etc.)
     * @param {string} aspect - What to analyze
     * @param {Object} artikel - Article data
     * @param {Object} projekt - Project data
     * @returns {Promise<Object>} Aspect analysis
     */
    async analyzeAspect(aspect, artikel, projekt) {
        console.log(`🔍 Analyzing aspect: ${aspect}`);
        
        switch (aspect.toLowerCase()) {
            case 'roi':
                return await this._analyzeROI(artikel, projekt);
            
            case 'npv':
                return await this._analyzeNPV(artikel, projekt);
            
            case 'break-even':
            case 'breakeven':
                return await this._analyzeBreakEven(artikel, projekt);
            
            case 'pricing':
                return await this._analyzePricing(artikel, projekt);
            
            case 'volumes':
            case 'mengen':
                return await this._analyzeVolumes(artikel, projekt);
            
            case 'costs':
            case 'kosten':
                return await this._analyzeCosts(artikel, projekt);
            
            default:
                console.warn(`⚠️ Unknown aspect: ${aspect}`);
                return { error: 'Unknown aspect' };
        }
    }
    
    /**
     * Get real-time suggestions while user is editing
     * @param {string} field - Field being edited
     * @param {*} value - Current value
     * @param {Object} context - Current artikel/projekt context
     * @returns {Promise<Object>} Real-time suggestions
     */
    async getRealtimeSuggestions(field, value, context) {
        console.log(`💡 Getting suggestions for: ${field} = ${value}`);
        
        // Check if we should analyze
        if (!this._shouldAnalyze(field, value)) {
            return null;
        }
        
        try {
            // Use appropriate AI based on field
            const ai = this._getAIForField(field);
            
            // Generate contextual prompt
            const prompt = this._buildFieldPrompt(field, value, context);
            
            // Get AI response
            const response = await this.router.route(prompt, {
                ai,
                context: 'realtime_suggestion',
                fast: true
            });
            
            return {
                field,
                value,
                suggestion: response.text,
                confidence: response.confidence || 0.8,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Realtime suggestions failed:', error);
            return null;
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // CHAT INTERFACE
    // ═══════════════════════════════════════════════════════
    
    /**
     * Handle chat message from user
     * @param {string} message - User message
     * @param {Array} history - Chat history
     * @returns {Promise<Object>} AI response
     */
    async chat(message, history = []) {
        console.log('💬 ALBO Chat:', message);
        
        try {
            // Build context from current artikel/projekt
            const context = {
                artikel: this.currentArtikel,
                projekt: this.currentProjekt,
                history: history.slice(-5) // Last 5 messages
            };
            
            // Route to appropriate AI
            const response = await this.router.route(message, {
                context: 'albo_chat',
                additionalContext: context,
                stream: false
            });
            
            return {
                message: response.text,
                ai: response.aiUsed,
                timestamp: new Date().toISOString(),
                confidence: response.confidence
            };
            
        } catch (error) {
            console.error('❌ Chat failed:', error);
            return {
                message: 'Entschuldigung, ich konnte deine Frage nicht verarbeiten. Versuche es nochmal oder formuliere anders.',
                error: true,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Determine overall business case status
     */
    _determineStatus(analysis, metrics) {
        // Check critical thresholds
        const roi = metrics.roi?.value || 0;
        const breakEven = metrics.breakEven?.months || 999;
        const npv = metrics.npv?.value || 0;
        
        // Critical issues
        if (roi < 0.05 || breakEven > 36 || npv < 0) {
            return 'critical';
        }
        
        // Warnings
        if (roi < 0.15 || breakEven > 24) {
            return 'warning';
        }
        
        // Good
        if (roi >= 0.20 && breakEven <= 18 && npv > 0) {
            return 'good';
        }
        
        // Approved (realistic targets)
        return 'approved';
    }
    
    /**
     * Determine status from metrics only (no AI analysis)
     */
    _determineStatusFromMetrics(metrics) {
        const roi = metrics.roi?.value || 0;
        const breakEven = metrics.breakEven?.months || 999;
        
        if (roi < 0.10 || breakEven > 30) return 'warning';
        if (roi >= 0.20 && breakEven <= 18) return 'good';
        return 'approved';
    }
    
    /**
     * Calculate confidence score
     */
    _calculateConfidence(analysis, metrics) {
        let score = 0.5; // Base
        
        // More complete data = higher confidence
        if (metrics.roi) score += 0.15;
        if (metrics.npv) score += 0.15;
        if (metrics.breakEven) score += 0.10;
        
        // Analysis quality
        if (analysis.findings?.length > 0) score += 0.10;
        
        return Math.min(0.95, score);
    }
    
    /**
     * Generate cache key
     */
    _getCacheKey(artikel, projekt) {
        const artikelData = JSON.stringify({
            name: artikel?.artikel_name,
            menge: artikel?.start_menge,
            preis: artikel?.start_preis,
            hk: artikel?.start_hk
        });
        
        const projektData = JSON.stringify({
            id: projekt?.id,
            name: projekt?.name
        });
        
        return `${artikelData}_${projektData}`;
    }
    
    /**
     * Check if field change should trigger analysis
     */
    _shouldAnalyze(field, value) {
        // Key fields that impact analysis
        const keyFields = [
            'start_menge', 'start_preis', 'start_hk',
            'wachstum_menge', 'wachstum_preis',
            'entwicklungsmodell'
        ];
        
        return keyFields.includes(field) && value != null && value !== '';
    }
    
    /**
     * Get appropriate AI for field
     */
    _getAIForField(field) {
        // Pricing → Perplexity (market research)
        if (field.includes('preis')) return 'perplexity';
        
        // Complex planning → Claude
        if (field.includes('wachstum') || field.includes('entwicklung')) return 'claude';
        
        // Quick lookups → GPT-4
        return 'gpt4o';
    }
    
    /**
     * Build prompt for specific field
     */
    _buildFieldPrompt(field, value, context) {
        const artikel = context.artikel || {};
        const projekt = context.projekt || {};
        
        return `
Artikel: ${artikel.artikel_name || 'N/A'}
Projekt: ${projekt.name || 'N/A'}

User ändert: ${field} → ${value}

Gib eine kurze Einschätzung (max 2 Sätze):
- Ist der Wert realistisch?
- Gibt es Risiken oder Chancen?
- Kurze Empfehlung falls nötig
        `.trim();
    }
    
    // ═══════════════════════════════════════════════════════
    // SPECIFIC ASPECT ANALYZERS
    // ═══════════════════════════════════════════════════════
    
    async _analyzeROI(artikel, projekt) {
        const metrics = await this.metricsCalculator.calculate(artikel, projekt);
        const roi = metrics.roi;
        
        return {
            aspect: 'roi',
            value: roi?.value,
            status: roi?.value >= 0.20 ? 'good' : roi?.value >= 0.15 ? 'approved' : 'warning',
            explanation: `ROI von ${(roi?.value * 100).toFixed(1)}% bedeutet: Pro investiertem Euro verdienst du ${roi?.value.toFixed(2)}€.`,
            benchmark: 'Typisch für IT-Projekte: 15-25%'
        };
    }
    
    async _analyzeNPV(artikel, projekt) {
        const metrics = await this.metricsCalculator.calculate(artikel, projekt);
        const npv = metrics.npv;
        
        return {
            aspect: 'npv',
            value: npv?.value,
            status: npv?.value > 0 ? 'good' : 'critical',
            explanation: `Kapitalwert von €${npv?.value.toLocaleString('de-DE')} zeigt den Gesamtwert des Investments.`,
            benchmark: 'NPV > 0 bedeutet: Projekt ist wirtschaftlich sinnvoll'
        };
    }
    
    async _analyzeBreakEven(artikel, projekt) {
        const metrics = await this.metricsCalculator.calculate(artikel, projekt);
        const breakEven = metrics.breakEven;
        
        return {
            aspect: 'break-even',
            value: breakEven?.months,
            status: breakEven?.months <= 18 ? 'good' : breakEven?.months <= 24 ? 'approved' : 'warning',
            explanation: `Break-Even nach ${breakEven?.months} Monaten.`,
            benchmark: 'Typisch für Software: 12-24 Monate'
        };
    }
    
    async _analyzePricing(artikel, projekt) {
        // Use Perplexity for market research
        const prompt = `
Artikel: ${artikel.artikel_name}
Aktueller Preis: €${artikel.start_preis}

Recherchiere:
- Marktübliche Preise für dieses Produkt/Service
- Wettbewerber-Pricing
- Pricing-Strategien

Gib kurze Einschätzung: Ist der Preis marktgerecht?
        `.trim();
        
        const response = await this.router.route(prompt, {
            ai: 'perplexity',
            context: 'pricing_analysis'
        });
        
        return {
            aspect: 'pricing',
            currentPrice: artikel.start_preis,
            analysis: response.text,
            aiUsed: 'perplexity'
        };
    }
    
    async _analyzeVolumes(artikel, projekt) {
        const prompt = `
Artikel: ${artikel.artikel_name}
Geplante Menge: ${artikel.start_menge} / Jahr

Bewerte:
- Ist die Menge realistisch?
- Kapazitätsplanung ausreichend?
- Marktgröße berücksichtigt?
        `.trim();
        
        const response = await this.router.route(prompt, {
            ai: 'claude',
            context: 'volumes_analysis'
        });
        
        return {
            aspect: 'volumes',
            plannedVolume: artikel.start_menge,
            analysis: response.text,
            aiUsed: 'claude'
        };
    }
    
    async _analyzeCosts(artikel, projekt) {
        const metrics = await this.metricsCalculator.calculate(artikel, projekt);
        
        return {
            aspect: 'costs',
            hkPercent: ((artikel.start_hk / artikel.start_preis) * 100).toFixed(1),
            dbPercent: (((artikel.start_preis - artikel.start_hk) / artikel.start_preis) * 100).toFixed(1),
            metrics: metrics,
            status: 'calculated'
        };
    }
    
    // ═══════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════
    
    /**
     * Clear analysis cache
     */
    clearCache() {
        this.analysisCache.clear();
        console.log('🗑️ Analysis cache cleared');
    }
    
    /**
     * Get current analysis status
     */
    getStatus() {
        return {
            isAnalyzing: this.isAnalyzing,
            hasCache: this.analysisCache.size > 0,
            cacheSize: this.analysisCache.size,
            currentArtikel: this.currentArtikel?.artikel_name || null,
            currentProjekt: this.currentProjekt?.name || null
        };
    }
    
    /**
     * Set current context
     */
    setContext(artikel, projekt) {
        this.currentArtikel = artikel;
        this.currentProjekt = projekt;
        console.log('📝 Context updated', { artikel: artikel?.artikel_name, projekt: projekt?.name });
    }
}

// Export singleton instance
export const alboEngine = new ALBOEngine();