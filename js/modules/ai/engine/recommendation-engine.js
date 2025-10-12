/**
 * Recommendation Engine
 * Generates findings, quick wins, and actionable recommendations
 * Version: 1.0.0
 */

import { AIRouter } from '../router/ai-router.js';
import { MetricsCalculator } from './metrics-calculator.js';

export class RecommendationEngine {
    constructor() {
        this.router = new AIRouter();
        this.metricsCalc = new MetricsCalculator();
        console.log('💡 Recommendation Engine initialized');
    }
    
    // ═══════════════════════════════════════════════════════
    // MAIN GENERATION
    // ═══════════════════════════════════════════════════════
    
    /**
     * Generate all recommendations
     * @param {Object} artikel - Article data
     * @param {Object} projekt - Project data
     * @returns {Promise<Object>} Recommendations
     */
    async generate(artikel, projekt) {
        console.log('💡 Generating Recommendations...');
        
        try {
            // Calculate metrics first
            const metrics = await this.metricsCalc.calculate(artikel, projekt);
            
            // Run parallel generation
            const [findings, quickWins, detailed] = await Promise.all([
                this._generateFindings(artikel, projekt, metrics),
                this._generateQuickWins(artikel, projekt, metrics),
                this._generateDetailedRecommendations(artikel, projekt, metrics)
            ]);
            
            return {
                findings: findings || [],
                quickWins: quickWins || [],
                detailed: detailed || [],
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Recommendation generation failed:', error);
            return {
                findings: [],
                quickWins: [],
                detailed: [],
                error: error.message
            };
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // FINDINGS GENERATION
    // ═══════════════════════════════════════════════════════
    
    /**
     * Generate findings (problems/issues)
     * @private
     */
    async _generateFindings(artikel, projekt, metrics) {
        console.log('🔍 Generating Findings...');
        
        const findings = [];
        
        // Check ROI
        if (metrics.roi?.value < 0.15) {
            findings.push({
                id: 'low_roi',
                severity: metrics.roi.value < 0.10 ? 'critical' : 'warning',
                title: 'ROI unter Branchen-Benchmark',
                description: `ROI von ${(metrics.roi.value * 100).toFixed(1)}% liegt unter dem typischen Benchmark von 15-25% für IT-Projekte.`,
                impact: 'high',
                recommendation: 'Prüfe Preisgestaltung oder reduziere Projektkosten um mindestens 15%.',
                action: {
                    type: 'adjust_pricing',
                    target: 'start_preis',
                    suggestion: Math.round(artikel.start_preis * 1.15)
                }
            });
        }
        
        // Check Break-Even
        if (metrics.breakEven?.months > 24) {
            findings.push({
                id: 'long_breakeven',
                severity: metrics.breakEven.months > 36 ? 'critical' : 'warning',
                title: 'Break-Even zu spät',
                description: `Break-Even erst nach ${metrics.breakEven.months} Monaten. Ziel sollte <24 Monate sein.`,
                impact: 'high',
                recommendation: 'Erhöhe Startmengen oder senke Projektkosten, um schneller profitabel zu werden.',
                action: {
                    type: 'adjust_volumes',
                    target: 'start_menge',
                    suggestion: Math.round(artikel.start_menge * 1.3)
                }
            });
        }
        
        // Check DB1 Margin
        const db1Percent = ((artikel.start_preis - artikel.start_hk) / artikel.start_preis) * 100;
        if (db1Percent < 30) {
            findings.push({
                id: 'low_margin',
                severity: db1Percent < 20 ? 'critical' : 'warning',
                title: 'Deckungsbeitrag zu niedrig',
                description: `DB1 von ${db1Percent.toFixed(1)}% ist für Software/IT-Services zu niedrig. Ziel: >40%.`,
                impact: 'high',
                recommendation: 'Optimiere HK-Struktur oder erhöhe Verkaufspreise um 15-20%.',
                action: {
                    type: 'adjust_costs',
                    target: 'start_hk',
                    suggestion: Math.round(artikel.start_hk * 0.85)
                }
            });
        }
        
        // Check HK Ratio
        const hkPercent = (artikel.start_hk / artikel.start_preis) * 100;
        if (hkPercent > 70) {
            findings.push({
                id: 'high_cost_ratio',
                severity: 'warning',
                title: 'HK-Anteil zu hoch',
                description: `Herstellkosten machen ${hkPercent.toFixed(1)}% des Preises aus. Das lässt wenig Marge für Overhead und Gewinn.`,
                impact: 'medium',
                recommendation: 'Analysiere die Kostenstruktur im Detail. Gibt es Optimierungspotential bei Material oder Personal?',
                action: {
                    type: 'review_costs',
                    target: 'cost_structure'
                }
            });
        }
        
        // Check NPV
        if (metrics.npv?.value < 0) {
            findings.push({
                id: 'negative_npv',
                severity: 'critical',
                title: 'Negativer Kapitalwert',
                description: `NPV von €${metrics.npv.value.toLocaleString('de-DE')} bedeutet: Das Projekt vernichtet Wert.`,
                impact: 'critical',
                recommendation: 'Projekt grundlegend überdenken oder Parameter drastisch anpassen.',
                action: {
                    type: 'fundamental_review',
                    target: 'all'
                }
            });
        }
        
        // Check missing data
        if (!artikel.start_menge || artikel.start_menge === 0) {
            findings.push({
                id: 'missing_volume',
                severity: 'warning',
                title: 'Keine Mengenplanung',
                description: 'Startmenge fehlt oder ist 0. Wirtschaftlichkeit kann nicht berechnet werden.',
                impact: 'high',
                recommendation: 'Trage realistische Mengen ein basierend auf Marktgröße und Kapazität.',
                action: {
                    type: 'input_required',
                    target: 'start_menge'
                }
            });
        }
        
        if (!artikel.start_preis || artikel.start_preis === 0) {
            findings.push({
                id: 'missing_price',
                severity: 'warning',
                title: 'Keine Preisgestaltung',
                description: 'Verkaufspreis fehlt oder ist 0.',
                impact: 'high',
                recommendation: 'Recherchiere Marktpreise und trage einen realistischen Verkaufspreis ein.',
                action: {
                    type: 'input_required',
                    target: 'start_preis'
                }
            });
        }
        
        // Check growth model
        if (!artikel.wachstum_menge?.modell) {
            findings.push({
                id: 'no_growth_model',
                severity: 'info',
                title: 'Kein Wachstumsmodell definiert',
                description: 'Ohne Wachstumsmodell bleibt die Menge über alle Jahre gleich.',
                impact: 'medium',
                recommendation: 'Definiere ein realistisches Wachstumsmodell (z.B. Linear 10-20% p.a.).',
                action: {
                    type: 'configure_growth',
                    target: 'wachstum_menge'
                }
            });
        }
        
        // Use AI for additional findings if we have enough data
        if (artikel.start_menge && artikel.start_preis && artikel.start_hk) {
            const aiFindings = await this._getAIFindings(artikel, projekt, metrics);
            if (aiFindings && aiFindings.length > 0) {
                findings.push(...aiFindings);
            }
        }
        
        // Sort by severity and limit to top 5
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        
        return findings.slice(0, 5);
    }
    
    /**
     * Get AI-generated findings
     * @private
     */
    async _getAIFindings(artikel, projekt, metrics) {
        try {
            const prompt = `
Analysiere diesen Business Case und finde weitere Probleme:

Artikel: ${artikel.artikel_name}
- Menge: ${artikel.start_menge}/Jahr
- Preis: €${artikel.start_preis}
- HK: €${artikel.start_hk}
- DB1: ${(((artikel.start_preis - artikel.start_hk) / artikel.start_preis) * 100).toFixed(1)}%

Metriken:
- ROI: ${(metrics.roi?.value * 100).toFixed(1)}%
- Break-Even: ${metrics.breakEven?.months} Monate
- NPV: €${metrics.npv?.value.toLocaleString('de-DE')}

Branche: ${projekt.branche || 'N/A'}

Finde 1-2 zusätzliche kritische Punkte, die noch nicht offensichtlich sind.
Format: Nur die Probleme, kurz und prägnant (je 1-2 Sätze).
            `.trim();
            
            const response = await this.router.route(prompt, {
                ai: 'claude',
                context: 'finding_generation',
                temperature: 0.8,
                max_tokens: 500
            });
            
            // Parse AI response into findings
            const lines = response.text.split('\n').filter(l => l.trim().length > 20);
            
            return lines.slice(0, 2).map((line, idx) => ({
                id: `ai_finding_${idx}`,
                severity: 'info',
                title: 'Weitere Analyse',
                description: line.replace(/^[-•*]\s*/, '').trim(),
                impact: 'medium',
                recommendation: 'Prüfe diesen Aspekt genauer.',
                source: 'ai'
            }));
            
        } catch (error) {
            console.error('❌ AI findings failed:', error);
            return [];
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // QUICK WINS GENERATION
    // ═══════════════════════════════════════════════════════
    
    /**
     * Generate quick wins (easy improvements)
     * @private
     */
    async _generateQuickWins(artikel, projekt, metrics) {
        console.log('⚡ Generating Quick Wins...');
        
        const quickWins = [];
        
        // Price optimization
        const db1Percent = ((artikel.start_preis - artikel.start_hk) / artikel.start_preis) * 100;
        if (db1Percent < 40) {
            const targetPrice = artikel.start_hk / 0.60; // Target: 40% DB1
            const increase = ((targetPrice - artikel.start_preis) / artikel.start_preis * 100).toFixed(1);
            
            quickWins.push({
                id: 'qw_price_increase',
                title: `Preis um ${increase}% erhöhen`,
                description: `Preiserhöhung von €${artikel.start_preis} auf €${Math.round(targetPrice)} bringt DB1 auf 40%.`,
                impact: 'Verbessert ROI um ca. 5-8 Prozentpunkte',
                effort: 'low',
                action: {
                    type: 'set_value',
                    field: 'start_preis',
                    value: Math.round(targetPrice)
                }
            });
        }
        
        // Cost reduction
        if (artikel.start_hk > artikel.start_preis * 0.6) {
            const targetHK = artikel.start_preis * 0.55; // Target: 55% HK
            const reduction = ((artikel.start_hk - targetHK) / artikel.start_hk * 100).toFixed(1);
            
            quickWins.push({
                id: 'qw_cost_reduction',
                title: `HK um ${reduction}% senken`,
                description: `Kostenoptimierung von €${artikel.start_hk} auf €${Math.round(targetHK)} verbessert Marge deutlich.`,
                impact: 'Erreicht Break-Even ~6 Monate früher',
                effort: 'medium',
                action: {
                    type: 'set_value',
                    field: 'start_hk',
                    value: Math.round(targetHK)
                }
            });
        }
        
        // Volume increase
        if (artikel.start_menge < 100 && metrics.breakEven?.months > 18) {
            const targetMenge = Math.round(artikel.start_menge * 1.5);
            
            quickWins.push({
                id: 'qw_volume_increase',
                title: `Startmenge auf ${targetMenge} erhöhen`,
                description: `Mehr Volumen im ersten Jahr beschleunigt Break-Even signifikant.`,
                impact: 'Break-Even 4-6 Monate früher',
                effort: 'medium',
                action: {
                    type: 'set_value',
                    field: 'start_menge',
                    value: targetMenge
                }
            });
        }
        
        // Growth model
        if (!artikel.wachstum_menge?.modell || artikel.wachstum_menge.modell === 'konstant') {
            quickWins.push({
                id: 'qw_add_growth',
                title: 'Lineares Wachstum 15% definieren',
                description: 'Realistisches Mengenwachstum verbessert Langzeit-Rentabilität erheblich.',
                impact: 'NPV steigt um 20-30%',
                effort: 'low',
                action: {
                    type: 'configure_growth',
                    field: 'wachstum_menge',
                    model: 'linear',
                    rate: 15
                }
            });
        }
        
        // Project cost reduction
        const projektkosten = projekt.kosten?.reduce((sum, k) => sum + (k.betrag || 0), 0) || 0;
        if (projektkosten > artikel.start_preis * artikel.start_menge * 0.5) {
            quickWins.push({
                id: 'qw_reduce_project_costs',
                title: 'Projektkosten um 20% senken',
                description: `Projektkosten von €${projektkosten.toLocaleString('de-DE')} sind sehr hoch. Prüfe Optimierungspotential.`,
                impact: 'ROI verbessert sich um 3-5 Prozentpunkte',
                effort: 'medium',
                action: {
                    type: 'review_costs',
                    target: 'projektkosten'
                }
            });
        }
        
        // Limit to top 3 quick wins
        return quickWins.slice(0, 3);
    }
    
    // ═══════════════════════════════════════════════════════
    // DETAILED RECOMMENDATIONS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Generate detailed recommendations
     * @private
     */
    async _generateDetailedRecommendations(artikel, projekt, metrics) {
        console.log('📋 Generating Detailed Recommendations...');
        
        try {
            const prompt = this._buildRecommendationPrompt(artikel, projekt, metrics);
            
            const response = await this.router.route(prompt, {
                ai: 'claude',
                context: 'recommendations',
                temperature: 0.7,
                max_tokens: 1500
            });
            
            // Parse response into structured recommendations
            return this._parseRecommendations(response.text);
            
        } catch (error) {
            console.error('❌ Detailed recommendations failed:', error);
            return [];
        }
    }
    
    /**
     * Build recommendation prompt
     * @private
     */
    _buildRecommendationPrompt(artikel, projekt, metrics) {
        return `
Gib detaillierte Handlungsempfehlungen für diesen Business Case:

# AKTUELLER STAND
Artikel: ${artikel.artikel_name}
- Menge: ${artikel.start_menge}/Jahr
- Preis: €${artikel.start_preis}
- HK: €${artikel.start_hk}
- DB1: ${(((artikel.start_preis - artikel.start_hk) / artikel.start_preis) * 100).toFixed(1)}%

# METRIKEN
- ROI: ${(metrics.roi?.value * 100).toFixed(1)}%
- Break-Even: ${metrics.breakEven?.months} Monate
- NPV: €${metrics.npv?.value.toLocaleString('de-DE')}

# PROJEKT
Branche: ${projekt.branche || 'N/A'}
Zeithorizont: ${projekt.zeithorizont || 3} Jahre

---

Gib 3-5 konkrete Handlungsempfehlungen:

Für jede Empfehlung:
1. Titel (kurz, actionable)
2. Begründung (warum wichtig?)
3. Konkreter Vorschlag (was genau tun?)
4. Erwarteter Impact (welche Verbesserung?)
5. Priorität (hoch/mittel/niedrig)

Format: Nummerierte Liste, prägnant.
        `.trim();
    }
    
    /**
     * Parse recommendations from AI response
     * @private
     */
    _parseRecommendations(text) {
        const recommendations = [];
        
        // Split by numbered items
        const items = text.split(/\n\d+\.\s+/).filter(s => s.trim());
        
        items.forEach((item, idx) => {
            if (idx === 0 && !item.match(/^[A-Z]/)) return; // Skip preamble
            
            const lines = item.split('\n').filter(l => l.trim());
            
            if (lines.length > 0) {
                recommendations.push({
                    id: `rec_${idx}`,
                    title: lines[0].replace(/^\*\*/, '').replace(/\*\*$/, '').trim(),
                    details: lines.slice(1).join('\n').trim(),
                    priority: this._extractPriority(item),
                    source: 'ai'
                });
            }
        });
        
        return recommendations.slice(0, 5);
    }
    
    /**
     * Extract priority from text
     * @private
     */
    _extractPriority(text) {
        const lower = text.toLowerCase();
        
        if (lower.includes('priorität: hoch') || lower.includes('kritisch')) {
            return 'high';
        }
        if (lower.includes('priorität: niedrig')) {
            return 'low';
        }
        return 'medium';
    }
    
    // ═══════════════════════════════════════════════════════
    // APPLY RECOMMENDATIONS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Apply a recommendation/quick win automatically
     * @param {string} id - Recommendation ID
     * @param {Object} artikel - Current artikel data
     * @returns {Object} Updated artikel data
     */
    applyRecommendation(id, artikel) {
        console.log(`✨ Applying recommendation: ${id}`);
        
        const updated = { ...artikel };
        
        // Find the recommendation action
        // This would be implemented based on the action type
        // For now, just return the original
        
        return updated;
    }
}