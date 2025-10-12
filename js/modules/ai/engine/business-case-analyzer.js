/**
 * Business Case Analyzer
 * Deep analysis of business cases using Claude AI
 * Version: 1.0.0
 */

import { AIRouter } from '../router/ai-router.js';
import { getSystemPrompt } from '../prompts/system-prompts.js';

export class BusinessCaseAnalyzer {
    constructor() {
        this.router = new AIRouter();
        console.log('📊 Business Case Analyzer initialized');
    }
    
    // ═══════════════════════════════════════════════════════
    // MAIN ANALYSIS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Analyze complete business case
     * @param {Object} artikel - Article data
     * @param {Object} projekt - Project data
     * @returns {Promise<Object>} Analysis results
     */
    async analyze(artikel, projekt) {
        console.log('🔍 Analyzing Business Case...');
        
        try {
            // Build comprehensive prompt
            const prompt = this._buildAnalysisPrompt(artikel, projekt);
            
            // Route to Claude (best for analysis)
            const response = await this.router.route(prompt, {
                ai: 'claude',
                context: 'business_case_analysis',
                temperature: 0.7,
                max_tokens: 2000
            });
            
            // Parse and structure response
            const analysis = this._parseAnalysisResponse(response.text);
            
            return {
                ...analysis,
                aiUsed: 'claude',
                timestamp: new Date().toISOString(),
                confidence: response.confidence || 0.85
            };
            
        } catch (error) {
            console.error('❌ Business Case Analysis failed:', error);
            return {
                error: error.message,
                status: 'error'
            };
        }
    }
    
    /**
     * Quick plausibility check (faster, less detailed)
     * @param {Object} artikel - Article data
     * @param {Object} projekt - Project data
     * @returns {Promise<Object>} Quick check results
     */
    async quickCheck(artikel, projekt) {
        console.log('⚡ Quick Plausibility Check...');
        
        try {
            const prompt = this._buildQuickCheckPrompt(artikel, projekt);
            
            const response = await this.router.route(prompt, {
                ai: 'claude',
                context: 'quick_check',
                temperature: 0.5,
                max_tokens: 500
            });
            
            return {
                status: this._extractStatus(response.text),
                summary: response.text,
                aiUsed: 'claude',
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Quick Check failed:', error);
            return { error: error.message };
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // PROMPT BUILDERS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Build comprehensive analysis prompt
     */
    _buildAnalysisPrompt(artikel, projekt) {
        // Calculate basic metrics
        const db1 = artikel.start_preis - artikel.start_hk;
        const db1Percent = (db1 / artikel.start_preis * 100).toFixed(1);
        const hkPercent = (artikel.start_hk / artikel.start_preis * 100).toFixed(1);
        
        // Get growth data
        const mengeWachstum = artikel.wachstum_menge || {};
        const preisWachstum = artikel.wachstum_preis || {};
        
        return `
Analysiere diesen Business Case im Detail:

# ARTIKEL
Name: ${artikel.artikel_name || 'N/A'}
Beschreibung: ${artikel.beschreibung || 'N/A'}

# STARTWERTE (Jahr 1)
- Menge: ${artikel.start_menge || 0} Stück/Jahr
- Verkaufspreis: €${artikel.start_preis || 0}
- Herstellkosten: €${artikel.start_hk || 0} (${hkPercent}%)
- DB1: €${db1.toFixed(2)} (${db1Percent}%)

# WACHSTUMSMODELLE
Mengen-Entwicklung: ${mengeWachstum.modell || 'N/A'}
${this._formatWachstum(mengeWachstum)}

Preis-Entwicklung: ${preisWachstum.modell || 'N/A'}
${this._formatWachstum(preisWachstum)}

# PROJEKTKOSTEN
${this._formatProjektkosten(projekt)}

# PROJEKT-KONTEXT
Name: ${projekt.name || 'N/A'}
Branche: ${projekt.branche || 'N/A'}
Zeithorizont: ${projekt.zeithorizont || 3} Jahre

---

Bitte analysiere:

1. **PLAUSIBILITÄT**
   - Sind Startmengen realistisch?
   - Ist die Preisgestaltung marktgerecht?
   - HK-Anteil plausibel für die Branche?

2. **WACHSTUMSPROGNOSEN**
   - Sind die Wachstumsmodelle angemessen?
   - Marktpotential ausreichend?
   - Kapazitäten berücksichtigt?

3. **RENTABILITÄT**
   - DB1-Marge ausreichend?
   - Break-Even realistisch?
   - Risiken identifiziert?

4. **KRITISCHE PUNKTE**
   - Was sind die 3 größten Risiken?
   - Wo ist Optimierungspotential?
   - Was fehlt?

Antworte strukturiert und konkret. Nutze ⚠️ für Warnings, ✅ für OK, 🔴 für kritisch.
        `.trim();
    }
    
    /**
     * Build quick check prompt (shorter)
     */
    _buildQuickCheckPrompt(artikel, projekt) {
        const db1Percent = ((artikel.start_preis - artikel.start_hk) / artikel.start_preis * 100).toFixed(1);
        
        return `
Quick-Check für Business Case:

Artikel: ${artikel.artikel_name}
- Menge: ${artikel.start_menge}/Jahr
- Preis: €${artikel.start_preis}
- HK: €${artikel.start_hk}
- DB1: ${db1Percent}%

Branche: ${projekt.branche || 'N/A'}

Gib eine kurze Einschätzung (3-4 Sätze):
- Status: ✅ OK / ⚠️ Warning / 🔴 Kritisch
- Hauptproblem falls vorhanden
- Schnellste Verbesserung
        `.trim();
    }
    
    /**
     * Format growth data
     */
    _formatWachstum(wachstum) {
        if (!wachstum || !wachstum.modell) return 'Keine Angaben';
        
        const modell = wachstum.modell;
        const werte = wachstum.werte || {};
        
        switch (modell) {
            case 'linear':
                return `Linear: ${werte.rate || 0}% pro Jahr`;
            
            case 'exponentiell':
                return `Exponentiell: Start ${werte.start || 0}%, Ende ${werte.end || 0}%`;
            
            case 'stufen':
                return `Stufen: ${JSON.stringify(werte.stufen || [])}`;
            
            case 'custom':
                return `Custom: ${JSON.stringify(werte.jahre || {})}`;
            
            default:
                return `${modell}: Details siehe Daten`;
        }
    }
    
    /**
     * Format project costs
     */
    _formatProjektkosten(projekt) {
        if (!projekt.kosten || projekt.kosten.length === 0) {
            return 'Keine Projektkosten erfasst';
        }
        
        const kosten = projekt.kosten || [];
        const gesamt = kosten.reduce((sum, k) => sum + (k.betrag || 0), 0);
        
        let output = `Gesamtkosten: €${gesamt.toLocaleString('de-DE')}\n`;
        
        // Group by category
        const grouped = {};
        kosten.forEach(k => {
            const cat = k.kategorie || 'Sonstige';
            grouped[cat] = (grouped[cat] || 0) + (k.betrag || 0);
        });
        
        Object.entries(grouped).forEach(([cat, betrag]) => {
            output += `- ${cat}: €${betrag.toLocaleString('de-DE')}\n`;
        });
        
        return output;
    }
    
    // ═══════════════════════════════════════════════════════
    // RESPONSE PARSING
    // ═══════════════════════════════════════════════════════
    
    /**
     * Parse AI response into structured format
     */
    _parseAnalysisResponse(text) {
        // Extract key sections
        const plausibility = this._extractSection(text, 'PLAUSIBILITÄT');
        const growth = this._extractSection(text, 'WACHSTUMSPROGNOSEN');
        const profitability = this._extractSection(text, 'RENTABILITÄT');
        const critical = this._extractSection(text, 'KRITISCHE PUNKTE');
        
        // Extract status indicators
        const warnings = this._extractWarnings(text);
        const risks = this._extractRisks(text);
        const opportunities = this._extractOpportunities(text);
        
        return {
            summary: this._extractFirstParagraph(text),
            plausibility,
            growth,
            profitability,
            critical,
            warnings,
            risks,
            opportunities,
            fullText: text
        };
    }
    
    /**
     * Extract section from text
     */
    _extractSection(text, heading) {
        const regex = new RegExp(`\\*\\*${heading}\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : null;
    }
    
    /**
     * Extract warnings (lines with ⚠️)
     */
    _extractWarnings(text) {
        const lines = text.split('\n');
        return lines
            .filter(line => line.includes('⚠️'))
            .map(line => line.replace(/⚠️/g, '').trim());
    }
    
    /**
     * Extract risks (lines with 🔴 or "Risiko")
     */
    _extractRisks(text) {
        const lines = text.split('\n');
        return lines
            .filter(line => line.includes('🔴') || line.toLowerCase().includes('risiko'))
            .map(line => line.replace(/🔴/g, '').trim())
            .filter(line => line.length > 10); // Filter out short lines
    }
    
    /**
     * Extract opportunities (lines with ✅ or "Chance")
     */
    _extractOpportunities(text) {
        const lines = text.split('\n');
        return lines
            .filter(line => (line.includes('✅') || line.toLowerCase().includes('chance')) 
                         && !line.toLowerCase().includes('risiko'))
            .map(line => line.replace(/✅/g, '').trim())
            .filter(line => line.length > 10);
    }
    
    /**
     * Extract first paragraph as summary
     */
    _extractFirstParagraph(text) {
        const paragraphs = text.split('\n\n');
        return paragraphs[0].trim();
    }
    
    /**
     * Extract overall status
     */
    _extractStatus(text) {
        const lower = text.toLowerCase();
        
        if (lower.includes('🔴') || lower.includes('kritisch')) {
            return 'critical';
        }
        
        if (lower.includes('⚠️') || lower.includes('warning')) {
            return 'warning';
        }
        
        if (lower.includes('✅') || lower.includes('gut') || lower.includes('ok')) {
            return 'good';
        }
        
        return 'neutral';
    }
    
    // ═══════════════════════════════════════════════════════
    // SPECIALIZED ANALYSES
    // ═══════════════════════════════════════════════════════
    
    /**
     * Analyze pricing specifically
     */
    async analyzePricing(artikel, projekt) {
        const prompt = `
Artikel: ${artikel.artikel_name}
Preis: €${artikel.start_preis}
HK: €${artikel.start_hk}
Branche: ${projekt.branche || 'N/A'}

Bewerte die Preisgestaltung:
1. Ist der Preis marktgerecht?
2. DB1-Marge ausreichend?
3. Pricing-Strategie erkennbar?
4. Empfehlung?
        `.trim();
        
        const response = await this.router.route(prompt, {
            ai: 'claude',
            context: 'pricing_analysis'
        });
        
        return {
            analysis: response.text,
            currentPrice: artikel.start_preis,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Analyze volume planning
     */
    async analyzeVolumes(artikel, projekt) {
        const prompt = `
Artikel: ${artikel.artikel_name}
Geplante Menge: ${artikel.start_menge}/Jahr
Wachstum: ${artikel.wachstum_menge?.modell || 'N/A'}
Zeithorizont: ${projekt.zeithorizont || 3} Jahre

Bewerte die Mengenplanung:
1. Sind die Mengen realistisch?
2. Ist das Wachstum erreichbar?
3. Marktpotential ausreichend?
4. Kapazitäten bedacht?
        `.trim();
        
        const response = await this.router.route(prompt, {
            ai: 'claude',
            context: 'volume_analysis'
        });
        
        return {
            analysis: response.text,
            plannedVolume: artikel.start_menge,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Analyze cost structure
     */
    async analyzeCosts(artikel, projekt) {
        const hkPercent = (artikel.start_hk / artikel.start_preis * 100).toFixed(1);
        
        const prompt = `
Artikel: ${artikel.artikel_name}
HK-Anteil: ${hkPercent}% (€${artikel.start_hk} von €${artikel.start_preis})
Branche: ${projekt.branche || 'N/A'}

Bewerte die Kostenstruktur:
1. Ist der HK-Anteil branchenüblich?
2. Ist die Marge ausreichend?
3. Wo sind Optimierungspotentiale?
4. Kostenrisiken?
        `.trim();
        
        const response = await this.router.route(prompt, {
            ai: 'claude',
            context: 'cost_analysis'
        });
        
        return {
            analysis: response.text,
            hkPercent: parseFloat(hkPercent),
            timestamp: new Date().toISOString()
        };
    }
}