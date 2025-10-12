/**
 * ALBO System - Production Version
 * Uses existing AI infrastructure (claude-service.js)
 * Graceful fallback to basic analysis if AI unavailable
 */

(function() {
    'use strict';

    console.log('🤖 ALBO System initializing...');

    // ═══════════════════════════════════════════════════════
    // CHECK DEPENDENCIES
    // ═══════════════════════════════════════════════════════

    if (!window.state) {
        console.error('❌ window.state not found!');
        return;
    }

    if (!window.helpers) {
        console.error('❌ window.helpers not found!');
        return;
    }

    console.log('✅ Core dependencies ready');

    // ═══════════════════════════════════════════════════════
    // ALBO SYSTEM CLASS
    // ═══════════════════════════════════════════════════════

    class ALBOSystem {
        constructor() {
            this.state = window.state;
            this.helpers = window.helpers;
            this.isInitialized = false;
            this.claudeService = null;
            this.aiAvailable = false;
        }

        // ═══════════════════════════════════════════════════════
        // INITIALIZATION
        // ═══════════════════════════════════════════════════════

        async init() {
            if (this.isInitialized) return;

            console.log('🚀 Starting ALBO initialization...');

            try {
                // Try to load AI modules
                await this._loadAIModules();
                
                // Setup event listeners
                this._setupEventListeners();
                
                // Show welcome
                this._showWelcomeMessage();
                
                this.isInitialized = true;
                console.log('✅ ALBO System ready!');

            } catch (error) {
                console.error('❌ ALBO init failed:', error);
                this._chat('⚠️ ALBO läuft im Basic-Modus (ohne KI).');
            }
        }

        // ═══════════════════════════════════════════════════════
        // LOAD AI MODULES
        // ═══════════════════════════════════════════════════════

        async _loadAIModules() {
            try {
                console.log('📦 Loading Claude Service...');

                // Import ClaudeService
                const { ClaudeService } = await import('./modules/ai/services/claude-service.js');
                
                // Create instance
                this.claudeService = new ClaudeService();
                
                // Initialize (health check)
                this.aiAvailable = await this.claudeService.initialize();
                
                if (this.aiAvailable) {
                    console.log('✅ Claude AI available');
                } else {
                    console.warn('⚠️ Claude AI unavailable (API key missing?)');
                }

            } catch (error) {
                console.warn('⚠️ AI modules not loaded:', error.message);
                console.log('ℹ️ Running in basic mode (calculations only)');
                this.aiAvailable = false;
            }
        }

        // ═══════════════════════════════════════════════════════
        // EVENT LISTENERS
        // ═══════════════════════════════════════════════════════

        _setupEventListeners() {
            console.log('📡 Setting up event listeners...');

            // Projekt Created
            document.addEventListener('projekt-created', (e) => {
                const name = e.detail.projekt?.project_name || e.detail.projekt?.name || 'Projekt';
                this._chat(`✅ Projekt "${name}" wurde erfolgreich erstellt!`);
            });

            // Projekt Updated
            document.addEventListener('projekt-updated', (e) => {
                const name = e.detail.projekt?.project_name || e.detail.projekt?.name || 'Projekt';
                this._chat(`📝 Projekt "${name}" wurde aktualisiert.`);
            });

            // Projekt Deleted
            document.addEventListener('projekt-deleted', (e) => {
                const name = e.detail.projektName || 'Projekt';
                this._chat(`🗑️ Projekt "${name}" wurde gelöscht.`);
            });

            // Artikel Saved
            document.addEventListener('artikel-saved', (e) => {
                const name = e.detail.artikel?.name || 'Artikel';
                this._chat(`💾 Artikel "${name}" wurde gespeichert.`);
            });

            // Artikel Updated
            document.addEventListener('artikel-updated', (e) => {
                const name = e.detail.artikel?.name || 'Artikel';
                this._chat(`📝 Artikel "${name}" wurde aktualisiert.`);
            });

            // Basisannahmen Complete
            document.addEventListener('basisannahmen-complete', (e) => {
                const artikel = e.detail.artikel;
                if (artikel) {
                    this._analyzeArtikel(artikel);
                }
            });

            // Modelle Berechnet
            document.addEventListener('modelle-berechnet', (e) => {
                const artikel = e.detail.artikel;
                if (artikel) {
                    this._chat(`📊 Modelle wurden berechnet!`);
                    setTimeout(() => this._analyzeArtikel(artikel), 500);
                }
            });

            // Tab Changed
            document.addEventListener('tab-changed', (e) => {
                console.log('📑 Tab changed:', e.detail.tab);
            });

            console.log('✅ Event listeners registered (8 events)');
        }

        // ═══════════════════════════════════════════════════════
        // ANALYSIS
        // ═══════════════════════════════════════════════════════

        async _analyzeArtikel(artikel) {
            try {
                const menge = parseFloat(artikel.start_menge) || 0;
                const preis = parseFloat(artikel.start_preis) || 0;
                const hk = parseFloat(artikel.start_hk) || 0;

                if (menge === 0 || preis === 0) {
                    this._chat('⚠️ Bitte erst Menge und Preis eingeben!');
                    return;
                }

                // Calculate basic metrics
                const umsatz = menge * preis;
                const kosten = menge * hk;
                const db1 = umsatz - kosten;
                const db1Prozent = ((preis - hk) / preis) * 100;

                console.log('📊 Metrics:', { menge, preis, hk, db1Prozent });

                // Use AI if available, otherwise basic analysis
                if (this.aiAvailable && this.claudeService) {
                    await this._analyzeWithClaude(artikel, { umsatz, kosten, db1, db1Prozent });
                } else {
                    this._analyzeBasic(artikel, { umsatz, kosten, db1, db1Prozent });
                }

            } catch (error) {
                console.error('❌ Analysis failed:', error);
                this._chat('❌ Analyse fehlgeschlagen. Siehe Console (F12).');
            }
        }

        // ═══════════════════════════════════════════════════════
        // AI ANALYSIS (Claude)
        // ═══════════════════════════════════════════════════════

        async _analyzeWithClaude(artikel, metrics) {
            try {
                this._chat('🤖 Analysiere mit Claude AI...');

                // Build system prompt
                const systemPrompt = `Du bist ALBO, ein Senior Controller mit 15+ Jahren Erfahrung.

ANALYSE-FOKUS:
1. Wirtschaftlichkeit (DB1, Marge, Volumen)
2. Markt-Fit (Strategie, Pricing)
3. Risiken & Chancen
4. Quick Wins

OUTPUT-FORMAT (JSON):
{
  "status": "good"|"warning"|"critical",
  "hauptbewertung": "Ein Satz Zusammenfassung",
  "findings": [
    {
      "severity": "critical"|"warning"|"info",
      "title": "Kurzer Titel",
      "message": "Detaillierte Erklärung",
      "recommendation": "Konkrete Handlung"
    }
  ],
  "quick_wins": ["Maßnahme 1", "Maßnahme 2"]
}

WICHTIG: Antworte NUR mit validem JSON, keine Markdown-Blöcke!`;

                // Build user prompt
                const userPrompt = `Analysiere diesen Business Case:

ARTIKEL: ${artikel.name || 'Unbekannt'}
- Typ: ${artikel.typ || '-'}
- Kategorie: ${artikel.kategorie || '-'}
- Geschäftsmodell: ${artikel.geschaeftsmodell || '-'}
- Strategie: ${artikel.strategie || '-'}
- Zielmarkt: ${artikel.zielmarkt || '-'}

FINANZ-PARAMETER (Jahr 1):
- Menge: ${artikel.start_menge || 0} Stück
- Preis: ${artikel.start_preis || 0}€
- HK: ${artikel.start_hk || 0}€
- Zeithorizont: ${artikel.zeithorizont || 5} Jahre

BERECHNETE WERTE:
- Umsatz: ${this.helpers.formatCurrency(metrics.umsatz)}
- Kosten: ${this.helpers.formatCurrency(metrics.kosten)}
- DB1: ${this.helpers.formatCurrency(metrics.db1)}
- DB1%: ${metrics.db1Prozent.toFixed(1)}%

Führe eine vollständige Bewertung durch und gib JSON zurück.`;

                // Call Claude Service
                const response = await this.claudeService.query(
                    userPrompt,
                    { systemPrompt: systemPrompt },
                    { max_tokens: 2000, temperature: 0.7 }
                );

                if (!response.success) {
                    throw new Error(response.error || 'Claude API failed');
                }

                console.log('📥 Raw Claude Response:', response.content);

                // Parse JSON response
                let analysis;
                try {
                    // Remove markdown code blocks if present
                    let cleanContent = response.content.trim();
                    cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                    
                    analysis = JSON.parse(cleanContent);
                } catch (parseError) {
                    console.error('❌ JSON Parse Error:', parseError);
                    // Fallback: Show raw response
                    this._chat(`🤖 ${response.content}`);
                    return;
                }

                console.log('✅ Parsed Analysis:', analysis);

                // Display results
                this._displayAnalysis(analysis, metrics);

                // Log cost
                if (response.metadata?.cost) {
                    console.log(`💰 Cost: $${response.metadata.cost.toFixed(4)}`);
                }

            } catch (error) {
                console.error('❌ Claude Analysis failed:', error);
                this._chat('⚠️ KI-Analyse fehlgeschlagen, nutze Basic-Analyse...');
                this._analyzeBasic(artikel, metrics);
            }
        }

        // ═══════════════════════════════════════════════════════
        // DISPLAY ANALYSIS RESULTS
        // ═══════════════════════════════════════════════════════

        _displayAnalysis(analysis, metrics) {
            // Main assessment
            const statusEmoji = this._getStatusEmoji(analysis.status);
            this._chat(`${statusEmoji} ${analysis.hauptbewertung}`);

            // Findings
            if (analysis.findings && analysis.findings.length > 0) {
                analysis.findings.forEach(finding => {
                    const emoji = finding.severity === 'critical' ? '🔴' : 
                                 finding.severity === 'warning' ? '⚠️' : 'ℹ️';
                    this._chat(`${emoji} ${finding.title}`);
                    if (finding.message) {
                        this._chat(`   ${finding.message}`);
                    }
                    if (finding.recommendation) {
                        this._chat(`   💡 ${finding.recommendation}`);
                    }
                });
            }

            // Quick Wins
            if (analysis.quick_wins && analysis.quick_wins.length > 0) {
                this._chat('⚡ Quick Wins:');
                analysis.quick_wins.forEach(win => {
                    this._chat(`  • ${win}`);
                });
            }
        }

        // ═══════════════════════════════════════════════════════
        // BASIC ANALYSIS (Fallback)
        // ═══════════════════════════════════════════════════════

        _analyzeBasic(artikel, metrics) {
            const { umsatz, kosten, db1Prozent } = metrics;

            let emoji = '';
            let message = '';

            if (db1Prozent > 50) {
                emoji = '🎉';
                message = `Exzellent! DB1 Marge von ${db1Prozent.toFixed(1)}% ist sehr stark.`;
            } else if (db1Prozent > 30) {
                emoji = '✅';
                message = `Gut! DB1 Marge von ${db1Prozent.toFixed(1)}% ist solide.`;
            } else if (db1Prozent > 15) {
                emoji = '⚠️';
                message = `OK. DB1 Marge von ${db1Prozent.toFixed(1)}% - Potenzial vorhanden.`;
            } else {
                emoji = '🔴';
                message = `Kritisch! DB1 Marge von ${db1Prozent.toFixed(1)}% ist zu niedrig.`;
            }

            this._chat(`${emoji} ${message}`);
            this._chat(`📊 Umsatz: ${this.helpers.formatCurrency(umsatz)}`);

            // Tips
            if (umsatz < 50000) {
                this._chat(`💡 Geringes Volumen - Skalierung prüfen!`);
            }

            if (db1Prozent < 30) {
                const targetPreis = artikel.start_hk / 0.7;
                this._chat(`💡 Für 30% DB1: Preis auf ${this.helpers.formatCurrency(targetPreis)} erhöhen`);
            }
        }

        // ═══════════════════════════════════════════════════════
        // HELPERS
        // ═══════════════════════════════════════════════════════

        _getStatusEmoji(status) {
            switch(status) {
                case 'good': return '✅';
                case 'warning': return '⚠️';
                case 'critical': return '🔴';
                default: return '📊';
            }
        }

        _chat(text) {
            const container = document.getElementById('albo-chat-messages');
            if (!container) {
                console.warn('⚠️ Chat container not found');
                return;
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = 'albo-chat-message assistant';
            messageDiv.textContent = text;

            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;

            console.log('💬', text);
        }

        _showWelcomeMessage() {
            this._chat('👋 Hi! Ich bin ALBO, dein KI-Controller.');
            
            if (this.aiAvailable) {
                this._chat('🤖 Claude AI aktiv - ich nutze intelligente Analysen!');
            } else {
                this._chat('📊 Basic-Modus aktiv. Für KI-Features: API Keys in Vercel prüfen.');
            }
            
            this._chat('💡 Erstelle ein Projekt oder bearbeite einen Artikel - ich melde mich sofort!');
        }

        getStatus() {
            return {
                initialized: this.isInitialized,
                aiAvailable: this.aiAvailable,
                claudeService: !!this.claudeService,
                version: '2.0 Production'
            };
        }
    }

    // ═══════════════════════════════════════════════════════
    // CREATE AND INITIALIZE
    // ═══════════════════════════════════════════════════════

    const alboSystem = new ALBOSystem();
    window.alboSystem = alboSystem;

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => alboSystem.init());
    } else {
        alboSystem.init();
    }

    console.log('✅ ALBO System module loaded');

})();
