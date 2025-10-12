/**
 * ALBO System - Chat-Only Version
 * All feedback goes to Chat Tab
 * Simple & Clean
 */

(function() {
    'use strict';

    console.log('🤖 ALBO System (Chat-Only) initializing...');

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

    console.log('✅ Dependencies ready');

    // ═══════════════════════════════════════════════════════
    // ALBO SYSTEM CLASS
    // ═══════════════════════════════════════════════════════

    class ALBOSystem {
        constructor() {
            this.state = window.state;
            this.helpers = window.helpers;
            this.isInitialized = false;
        }

        // ═══════════════════════════════════════════════════════
        // INITIALIZATION
        // ═══════════════════════════════════════════════════════

        init() {
            if (this.isInitialized) return;

            console.log('🚀 Starting ALBO initialization...');

            try {
                this._setupEventListeners();
                this._hideUnusedTabs();
                this._showWelcomeMessage();
                
                this.isInitialized = true;
                console.log('✅ ALBO System ready!');

            } catch (error) {
                console.error('❌ ALBO init failed:', error);
            }
        }

        // ═══════════════════════════════════════════════════════
        // HIDE UNUSED TABS
        // ═══════════════════════════════════════════════════════

        _hideUnusedTabs() {
            // Hide Analysis and Metrics tabs
            const tabs = document.querySelectorAll('.albo-tab');
            tabs.forEach(tab => {
                const text = tab.textContent.trim();
                if (text.includes('Analysis') || text.includes('Metrics')) {
                    tab.style.display = 'none';
                }
            });

            // Auto-switch to Chat
            const chatTab = document.querySelector('.albo-tab:not([style*="display: none"])');
            if (chatTab) {
                chatTab.classList.add('active');
            }

            // Show only chat content
            const chatContent = document.getElementById('albo-tab-chat');
            if (chatContent) {
                chatContent.classList.add('active');
            }

            // Hide other content
            const analysisContent = document.getElementById('albo-tab-analysis');
            const metricsContent = document.getElementById('albo-tab-metrics');
            if (analysisContent) analysisContent.classList.remove('active');
            if (metricsContent) metricsContent.classList.remove('active');

            console.log('✅ Unused tabs hidden');
        }

        // ═══════════════════════════════════════════════════════
        // EVENT LISTENERS
        // ═══════════════════════════════════════════════════════

        _setupEventListeners() {
            console.log('📡 Setting up event listeners...');

            // 1. Projekt Created
            document.addEventListener('projekt-created', (e) => {
                const name = e.detail.projekt?.project_name || e.detail.projekt?.name || 'Projekt';
                this._chat(`✅ Projekt "${name}" wurde erfolgreich erstellt!`);
            });

            // 2. Projekt Updated
            document.addEventListener('projekt-updated', (e) => {
                const name = e.detail.projekt?.project_name || e.detail.projekt?.name || 'Projekt';
                this._chat(`📝 Projekt "${name}" wurde aktualisiert.`);
            });

            // 3. Projekt Deleted
            document.addEventListener('projekt-deleted', (e) => {
                const name = e.detail.projektName || 'Projekt';
                this._chat(`🗑️ Projekt "${name}" wurde gelöscht.`);
            });

            // 4. Artikel Saved
            document.addEventListener('artikel-saved', (e) => {
                const name = e.detail.artikel?.name || 'Artikel';
                this._chat(`💾 Artikel "${name}" wurde gespeichert.`);
            });

            // 5. Artikel Updated
            document.addEventListener('artikel-updated', (e) => {
                const name = e.detail.artikel?.name || 'Artikel';
                this._chat(`📝 Artikel "${name}" wurde aktualisiert.`);
            });

            // 6. Basisannahmen Complete
            document.addEventListener('basisannahmen-complete', (e) => {
                const artikel = e.detail.artikel;
                if (artikel) {
                    this._analyzeAndChat(artikel);
                }
            });

            // 7. Modelle Berechnet
            document.addEventListener('modelle-berechnet', (e) => {
                const artikel = e.detail.artikel;
                if (artikel) {
                    this._chat(`📊 Modelle wurden berechnet! Analysiere...`);
                    setTimeout(() => this._analyzeAndChat(artikel), 500);
                }
            });

            // 8. Tab Changed
            document.addEventListener('tab-changed', (e) => {
                console.log('📑 Tab changed:', e.detail.tab);
            });

            console.log('✅ Event listeners registered (8 events)');
        }

        // ═══════════════════════════════════════════════════════
        // ANALYSIS & CHAT
        // ═══════════════════════════════════════════════════════

        _analyzeAndChat(artikel) {
            try {
                const menge = parseFloat(artikel.start_menge) || 0;
                const preis = parseFloat(artikel.start_preis) || 0;
                const hk = parseFloat(artikel.start_hk) || 0;

                if (menge === 0 || preis === 0) {
                    this._chat('⚠️ Bitte erst Menge und Preis eingeben!');
                    return;
                }

                // Calculate DB1
                const umsatz = menge * preis;
                const kosten = menge * hk;
                const db1Prozent = ((preis - hk) / preis) * 100;

                console.log('📊 Analysis:', { menge, preis, hk, db1Prozent });

                // Generate message based on DB1
                let message = '';
                let emoji = '';

                if (db1Prozent > 50) {
                    emoji = '🎉';
                    message = `Exzellent! DB1 Marge von ${db1Prozent.toFixed(1)}% ist sehr stark. Umsatz: ${this.helpers.formatCurrency(umsatz)}`;
                } else if (db1Prozent > 30) {
                    emoji = '✅';
                    message = `Gut! DB1 Marge von ${db1Prozent.toFixed(1)}% ist solide. Umsatz: ${this.helpers.formatCurrency(umsatz)}`;
                } else if (db1Prozent > 15) {
                    emoji = '⚠️';
                    message = `OK. DB1 Marge von ${db1Prozent.toFixed(1)}% - könnte besser sein. Umsatz: ${this.helpers.formatCurrency(umsatz)}`;
                } else {
                    emoji = '🔴';
                    message = `Kritisch! DB1 Marge von ${db1Prozent.toFixed(1)}% ist zu niedrig. Umsatz: ${this.helpers.formatCurrency(umsatz)}. Preiserhöhung oder Kostensenkung erforderlich.`;
                }

                this._chat(`${emoji} ${message}`);

                // Additional insights
                if (umsatz < 50000) {
                    this._chat(`💡 Tipp: Mit ${this.helpers.formatCurrency(umsatz)} Umsatz ist das Volumen noch gering. Skalierungspotenzial prüfen!`);
                }

                if (db1Prozent < 30) {
                    const targetPreis = hk / (1 - 0.30);
                    const preisErhoehung = ((targetPreis - preis) / preis * 100).toFixed(1);
                    this._chat(`💡 Tipp: Für 30% DB1 bräuchtest du einen Preis von ${this.helpers.formatCurrency(targetPreis)} (+${preisErhoehung}%)`);
                }

            } catch (error) {
                console.error('❌ Analysis failed:', error);
                this._chat('❌ Analyse fehlgeschlagen. Bitte Console prüfen (F12).');
            }
        }

        // ═══════════════════════════════════════════════════════
        // CHAT HELPER
        // ═══════════════════════════════════════════════════════

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
            this._chat('💡 Ich beobachte deine Projekte und Artikel und gebe dir automatisch Feedback!');
            this._chat('🚀 Erstelle ein Projekt oder bearbeite einen Artikel - ich melde mich sofort.');
        }

        // ═══════════════════════════════════════════════════════
        // PUBLIC API
        // ═══════════════════════════════════════════════════════

        getStatus() {
            return {
                initialized: this.isInitialized,
                version: 'Chat-Only 1.0'
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

    console.log('✅ ALBO System loaded');

})();
