/**
 * ALBO System - Standalone Version
 * NO ES6 MODULES - Direct browser execution
 * Works with window.state and window.helpers
 * Version: 2.0 - Production Ready
 */

(function() {
    'use strict';

    console.log('🤖 ALBO System (Standalone) initializing...');

    // ═══════════════════════════════════════════════════════
    // CHECK DEPENDENCIES
    // ═══════════════════════════════════════════════════════

    if (!window.state) {
        console.error('❌ window.state not found! State module must load first.');
        return;
    }

    if (!window.helpers) {
        console.error('❌ window.helpers not found! Helpers module must load first.');
        return;
    }

    console.log('✅ State available:', window.state.constructor.name);
    console.log('✅ Helpers available:', typeof window.helpers);

    // ═══════════════════════════════════════════════════════
    // ALBO SYSTEM CLASS
    // ═══════════════════════════════════════════════════════

    class ALBOSystem {
        constructor() {
            this.state = window.state;
            this.helpers = window.helpers;
            this.isInitialized = false;
            this.currentTab = 'analysis';
            this.currentArtikel = null;
            this.currentProjekt = null;
            
            console.log('🤖 ALBO System instance created');
        }

        // ═══════════════════════════════════════════════════════
        // INITIALIZATION
        // ═══════════════════════════════════════════════════════

        init() {
            if (this.isInitialized) {
                console.warn('⚠️ ALBO already initialized');
                return;
            }

            console.log('🚀 Starting ALBO initialization...');

            try {
                // Setup event listeners
                this._setupEventListeners();

                // Setup UI handlers (already in HTML, just verify)
                this._verifyUIElements();

                this.isInitialized = true;
                console.log('✅ ALBO System initialized successfully');

                // Show welcome message
                this._showWelcomeMessage();

            } catch (error) {
                console.error('❌ ALBO initialization failed:', error);
            }
        }

        // ═══════════════════════════════════════════════════════
        // EVENT LISTENERS SETUP
        // ═══════════════════════════════════════════════════════

        _setupEventListeners() {
            console.log('📡 Setting up event listeners...');

            // 1. Projekt Created
            document.addEventListener('projekt-created', (e) => {
                console.log('🆕 Event: projekt-created', e.detail);
                this._handleProjektCreated(e.detail);
            });

            // 2. Projekt Updated
            document.addEventListener('projekt-updated', (e) => {
                console.log('🆕 Event: projekt-updated', e.detail);
                this._handleProjektUpdated(e.detail);
            });

            // 3. Projekt Deleted
            document.addEventListener('projekt-deleted', (e) => {
                console.log('🆕 Event: projekt-deleted', e.detail);
                this._handleProjektDeleted(e.detail);
            });

            // 4. Artikel Saved
            document.addEventListener('artikel-saved', (e) => {
                console.log('🆕 Event: artikel-saved', e.detail);
                this._handleArtikelSaved(e.detail);
            });

            // 5. Artikel Updated
            document.addEventListener('artikel-updated', (e) => {
                console.log('🆕 Event: artikel-updated', e.detail);
                this._handleArtikelUpdated(e.detail);
            });

            // 6. Basisannahmen Complete
            document.addEventListener('basisannahmen-complete', (e) => {
                console.log('🆕 Event: basisannahmen-complete', e.detail);
                this._handleBasisannahmenComplete(e.detail);
            });

            // 7. Modelle Berechnet
            document.addEventListener('modelle-berechnet', (e) => {
                console.log('🆕 Event: modelle-berechnet', e.detail);
                this._handleModelleBerechnet(e.detail);
            });

            // 8. Tab Changed
            document.addEventListener('tab-changed', (e) => {
                console.log('🆕 Event: tab-changed', e.detail);
                this._handleTabChanged(e.detail);
            });

            console.log('✅ Event listeners registered (8 events)');
        }

        // ═══════════════════════════════════════════════════════
        // EVENT HANDLERS
        // ═══════════════════════════════════════════════════════

        _handleProjektCreated(data) {
            const projektName = data.projekt?.project_name || data.projekt?.name || 'Projekt';
            console.log('✅ Projekt created:', projektName);

            this.currentProjekt = data.projekt;

            // Show in chat
            this._addChatMessage('assistant', `✅ Projekt "${projektName}" wurde erfolgreich erstellt!`);

            // Show in analysis tab
            this._showQuickWin(`Neues Projekt "${projektName}" angelegt`);
        }

        _handleProjektUpdated(data) {
            console.log('📝 Projekt updated');
            this.currentProjekt = data.projekt || data;
        }

        _handleProjektDeleted(data) {
            const projektName = data.projektName || 'Projekt';
            console.log('🗑️ Projekt deleted:', projektName);

            // Clear current projekt if it was deleted
            if (this.currentProjekt?.id === data.projektId) {
                this.currentProjekt = null;
            }

            // Show in chat
            this._addChatMessage('assistant', `🗑️ Projekt "${projektName}" wurde gelöscht.`);
        }

        _handleArtikelSaved(data) {
            console.log('💾 Artikel saved:', data);
            this.currentArtikel = data.artikel || data;

            const artikelName = this.currentArtikel?.name || 'Artikel';
            this._addChatMessage('assistant', `💾 Artikel "${artikelName}" wurde gespeichert.`);
        }

        _handleArtikelUpdated(data) {
            console.log('📝 Artikel updated');
            this.currentArtikel = data.artikel || data;
        }

        _handleBasisannahmenComplete(data) {
            console.log('✅ Basisannahmen complete:', data);

            // Run quick check
            const artikel = data.artikel || this.currentArtikel;
            if (artikel) {
                this._runQuickCheck(artikel);
            }
        }

        _handleModelleBerechnet(data) {
            console.log('📊 Modelle berechnet:', data);

            // Show analysis complete
            this._addChatMessage('assistant', '📊 Modelle wurden berechnet! Analyse läuft...');

            // Run full analysis (simplified version)
            const artikel = data.artikel || this.currentArtikel;
            if (artikel) {
                this._runSimpleAnalysis(artikel);
            }
        }

        _handleTabChanged(data) {
            console.log('📑 Tab changed:', data.tab);
        }

        // ═══════════════════════════════════════════════════════
        // ANALYSIS FUNCTIONS (Simplified - No AI yet)
        // ═══════════════════════════════════════════════════════

        _runQuickCheck(artikel) {
            console.log('⚡ Running Quick Check...', artikel);

            try {
                // Get values
                const menge = parseFloat(artikel.start_menge) || 0;
                const preis = parseFloat(artikel.start_preis) || 0;
                const hk = parseFloat(artikel.start_hk) || 0;

                if (menge === 0 || preis === 0) {
                    console.log('⚠️ Incomplete data for quick check');
                    return;
                }

                // Calculate DB1
                const db1 = ((preis - hk) / preis) * 100;
                
                console.log('📊 Quick Check Results:', { menge, preis, hk, db1 });

                // Determine status
                let status = 'warning';
                let message = '';

                if (db1 > 50) {
                    status = 'good';
                    message = `💡 Quick Check: DB1 Marge ${db1.toFixed(1)}% - Sieht sehr gut aus! 👍`;
                } else if (db1 > 30) {
                    status = 'good';
                    message = `💡 Quick Check: DB1 Marge ${db1.toFixed(1)}% - Sieht gut aus! ✅`;
                } else if (db1 > 15) {
                    status = 'warning';
                    message = `💡 Quick Check: DB1 Marge ${db1.toFixed(1)}% - OK, könnte besser sein.`;
                } else {
                    status = 'critical';
                    message = `⚠️ Quick Check: DB1 Marge ${db1.toFixed(1)}% - Kritisch niedrig!`;
                }

                // Show in chat
                this._addChatMessage('assistant', message);

                // Update status badge
                this._updateStatusBadge(status, db1);

            } catch (error) {
                console.error('❌ Quick Check failed:', error);
            }
        }

        _runSimpleAnalysis(artikel) {
            console.log('🔍 Running Simple Analysis...', artikel);

            try {
                // Get values
                const menge = parseFloat(artikel.start_menge) || 0;
                const preis = parseFloat(artikel.start_preis) || 0;
                const hk = parseFloat(artikel.start_hk) || 0;

                if (menge === 0 || preis === 0) {
                    this._addChatMessage('assistant', '⚠️ Bitte erst Menge und Preis eingeben!');
                    return;
                }

                // Calculate metrics
                const umsatz = menge * preis;
                const kosten = menge * hk;
                const db1 = umsatz - kosten;
                const db1Prozent = (db1 / umsatz) * 100;

                console.log('📊 Analysis Results:', { umsatz, kosten, db1, db1Prozent });

                // Update status badge
                const status = db1Prozent > 30 ? 'good' : db1Prozent > 15 ? 'warning' : 'critical';
                this._updateStatusBadge(status, db1Prozent);

                // Show findings
                this._showFindings(db1Prozent, umsatz, kosten);

                // Show in chat
                this._addChatMessage('assistant', `✅ Analyse komplett! DB1: ${db1Prozent.toFixed(1)}%, Umsatz: ${this.helpers.formatCurrency(umsatz)}`);

            } catch (error) {
                console.error('❌ Analysis failed:', error);
                this._addChatMessage('assistant', '❌ Analyse fehlgeschlagen. Bitte Console prüfen.');
            }
        }

        // ═══════════════════════════════════════════════════════
        // UI UPDATE FUNCTIONS
        // ═══════════════════════════════════════════════════════

        _updateStatusBadge(status, db1Value) {
            const badge = document.querySelector('.albo-status-badge');
            if (!badge) {
                console.warn('⚠️ Status badge not found');
                return;
            }

            const badgeValue = badge.querySelector('.badge-value');
            if (!badgeValue) return;

            // Update text and class
            switch (status) {
                case 'good':
                    badgeValue.textContent = 'Excellent';
                    badgeValue.className = 'badge-value positive';
                    badge.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
                    break;
                case 'warning':
                    badgeValue.textContent = 'Review Needed';
                    badgeValue.className = 'badge-value warning';
                    badge.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                    break;
                case 'critical':
                    badgeValue.textContent = 'Critical';
                    badgeValue.className = 'badge-value negative';
                    badge.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                    break;
            }

            console.log('✅ Status badge updated:', status);
        }

        _showFindings(db1Prozent, umsatz, kosten) {
            const container = document.getElementById('albo-findings');
            if (!container) {
                console.warn('⚠️ Findings container not found');
                return;
            }

            let findings = [];

            // Check DB1
            if (db1Prozent < 20) {
                findings.push({
                    severity: 'critical',
                    title: 'DB1 Marge zu niedrig',
                    recommendation: `Mit ${db1Prozent.toFixed(1)}% liegt die Marge unter dem Minimum von 20%. Preiserhöhung oder Kostensenkung erforderlich.`
                });
            } else if (db1Prozent < 30) {
                findings.push({
                    severity: 'warning',
                    title: 'DB1 Marge ausbaufähig',
                    recommendation: `${db1Prozent.toFixed(1)}% ist OK, aber Potenzial für Verbesserung vorhanden.`
                });
            }

            // Check volume
            if (umsatz < 50000) {
                findings.push({
                    severity: 'info',
                    title: 'Geringes Umsatzvolumen',
                    recommendation: 'Prüfen Sie Skalierungspotenziale oder Premium-Positioning.'
                });
            }

            // Render findings
            if (findings.length === 0) {
                container.innerHTML = '<div class="albo-placeholder">✅ Keine kritischen Punkte gefunden!</div>';
            } else {
                container.innerHTML = findings.map(f => `
                    <div class="albo-finding">
                        <div class="finding-title">${this._getSeverityIcon(f.severity)} ${f.title}</div>
                        <div class="finding-recommendation">${f.recommendation}</div>
                    </div>
                `).join('');
            }

            console.log('✅ Findings displayed:', findings.length);
        }

        _showQuickWin(text) {
            const container = document.getElementById('albo-quick-wins');
            if (!container) return;

            container.innerHTML = `
                <div class="albo-quick-win">
                    ✨ ${text}
                </div>
            `;
        }

        _getSeverityIcon(severity) {
            switch (severity) {
                case 'critical': return '🔴';
                case 'warning': return '⚠️';
                case 'info': return 'ℹ️';
                default: return '•';
            }
        }

        // ═══════════════════════════════════════════════════════
        // CHAT FUNCTIONS
        // ═══════════════════════════════════════════════════════

        _addChatMessage(role, text) {
            const container = document.getElementById('albo-chat-messages');
            if (!container) {
                console.warn('⚠️ Chat container not found');
                return;
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = `albo-chat-message ${role}`;
            messageDiv.textContent = text;

            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;

            console.log('💬 Chat message added:', role, text.substring(0, 50));
        }

        // ═══════════════════════════════════════════════════════
        // UI VERIFICATION
        // ═══════════════════════════════════════════════════════

        _verifyUIElements() {
            const elements = {
                'albo-sidebar': document.getElementById('albo-sidebar'),
                'albo-findings': document.getElementById('albo-findings'),
                'albo-quick-wins': document.getElementById('albo-quick-wins'),
                'albo-chat-messages': document.getElementById('albo-chat-messages'),
                'status-badge': document.querySelector('.albo-status-badge')
            };

            let allFound = true;
            for (const [name, el] of Object.entries(elements)) {
                if (!el) {
                    console.warn(`⚠️ Element not found: ${name}`);
                    allFound = false;
                } else {
                    console.log(`✅ Element found: ${name}`);
                }
            }

            return allFound;
        }

        _showWelcomeMessage() {
            this._addChatMessage('assistant', '👋 Hi! Ich bin ALBO. Ich beobachte deine Business Cases und gebe dir Feedback!');
        }

        // ═══════════════════════════════════════════════════════
        // PUBLIC API
        // ═══════════════════════════════════════════════════════

        getStatus() {
            return {
                initialized: this.isInitialized,
                currentTab: this.currentTab,
                currentProjekt: this.currentProjekt?.name || null,
                currentArtikel: this.currentArtikel?.name || null
            };
        }
    }

    // ═══════════════════════════════════════════════════════
    // CREATE AND INITIALIZE
    // ═══════════════════════════════════════════════════════

    const alboSystem = new ALBOSystem();

    // Make globally available
    window.alboSystem = alboSystem;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            alboSystem.init();
        });
    } else {
        alboSystem.init();
    }

    console.log('✅ ALBO System ready!');

})();
