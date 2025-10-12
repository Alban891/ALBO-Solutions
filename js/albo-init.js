/**
 * ALBO Initialization
 * Connects all ALBO components and initializes the system
 * Version: 1.0.0
 */

import { alboEngine } from './modules/ai/engine/albo-engine.js';
import { AI_CONFIG } from './modules/ai/config/ai-config.js';

/**
 * ALBO System Manager
 * Handles initialization and lifecycle
 */
class ALBOSystem {
    constructor() {
        this.engine = alboEngine;
        this.sidebar = null;
        this.isInitialized = false;
        this.currentTab = null;
        this.currentArtikel = null;
        this.currentProjekt = null;
        
        console.log('🤖 ALBO System starting...');
    }
    
    // ═══════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════
    
    /**
     * Initialize ALBO System
     */
    async init() {
        if (this.isInitialized) {
            console.warn('⚠️ ALBO already initialized');
            return;
        }
        
        console.log('🚀 Initializing ALBO System...');
        
        try {
            // 1. Check if ALBO is enabled
            if (!AI_CONFIG.features.sidebar_enabled) {
                console.log('ℹ️ ALBO Sidebar is disabled in config');
                return;
            }
            
            // 2. Find sidebar element
            this.sidebar = document.querySelector('.sidebar');
            if (!this.sidebar) {
                console.error('❌ ALBO Sidebar element not found');
                return;
            }
            
            // 3. Initialize UI components
            this._initializeTabs();
            this._initializeChat();
            this._initializeActions();
            
            // 4. Set up event listeners
            this._setupEventListeners();
            
            // 5. Load initial state
            await this._loadInitialState();
            
            this.isInitialized = true;
            console.log('✅ ALBO System initialized successfully');
            
            // Show welcome message
            this._showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ ALBO initialization failed:', error);
        }
    }
    
    /**
     * Initialize tab switching
     * @private
     */
    _initializeTabs() {
        const tabs = document.querySelectorAll('.albo-tab');
        const tabContents = document.querySelectorAll('.albo-tab-content');
        
        if (tabs.length === 0) {
            console.warn('⚠️ No ALBO tabs found');
            return;
        }
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this._switchTab(tabName);
            });
        });
        
        // Activate default tab
        const defaultTab = AI_CONFIG.ui.default_tab || 'analysis';
        this._switchTab(defaultTab);
        
        console.log('✅ Tabs initialized');
    }
    
    /**
     * Initialize chat interface
     * @private
     */
    _initializeChat() {
        const chatInput = document.getElementById('albo-chat-input');
        const chatSend = document.getElementById('albo-chat-send');
        
        if (!chatInput || !chatSend) {
            console.warn('⚠️ Chat elements not found');
            return;
        }
        
        // Send on button click
        chatSend.addEventListener('click', () => {
            this._handleChatMessage(chatInput.value);
        });
        
        // Send on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._handleChatMessage(chatInput.value);
            }
        });
        
        console.log('✅ Chat initialized');
    }
    
    /**
     * Initialize action buttons
     * @private
     */
    _initializeActions() {
        // Full Analysis button
        const fullAnalysisBtn = document.getElementById('albo-full-analysis');
        if (fullAnalysisBtn) {
            fullAnalysisBtn.addEventListener('click', () => {
                this._runFullAnalysis();
            });
        }
        
        // Quick Analysis button
        const quickAnalysisBtn = document.getElementById('albo-quick-analysis');
        if (quickAnalysisBtn) {
            quickAnalysisBtn.addEventListener('click', () => {
                this._runQuickAnalysis();
            });
        }
        
        // Apply recommendations buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-apply')) {
                const findingId = e.target.dataset.findingId;
                this._applyRecommendation(findingId);
            }
        });
        
        console.log('✅ Action buttons initialized');
    }
    
    /**
     * Set up event listeners for app events
     * @private
     */
    _setupEventListeners() {
        // Listen for artikel changes
        document.addEventListener('artikel-updated', (e) => {
            this._handleArtikelUpdate(e.detail);
        });
        
        // Listen for artikel saved
        document.addEventListener('artikel-saved', (e) => {
            this._handleArtikelSaved(e.detail);
        });
        
        // Listen for projekt changes
        document.addEventListener('projekt-updated', (e) => {
            this._handleProjektUpdate(e.detail);
        });
        
        // Listen for tab changes in main app
        document.addEventListener('tab-changed', (e) => {
            this._handleMainTabChange(e.detail);
        });
        
        console.log('✅ Event listeners set up');
    }
    
    /**
     * Load initial state
     * @private
     */
    async _loadInitialState() {
        // Try to load current artikel from app state
        const artikelName = document.getElementById('artikel-name')?.value;
        
        if (artikelName) {
            console.log('📄 Initial artikel detected:', artikelName);
            // Initial context is set, but don't auto-analyze yet
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // TAB MANAGEMENT
    // ═══════════════════════════════════════════════════════
    
    /**
     * Switch ALBO tab
     * @private
     */
    _switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.albo-tab').forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update tab contents
        document.querySelectorAll('.albo-tab-content').forEach(content => {
            if (content.id === `albo-${tabName}-content`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        this.currentTab = tabName;
        console.log(`📑 Switched to tab: ${tabName}`);
        
        // Load tab content if needed
        this._loadTabContent(tabName);
    }
    
    /**
     * Load content for specific tab
     * @private
     */
    async _loadTabContent(tabName) {
        switch (tabName) {
            case 'analysis':
                // Analysis tab is loaded on-demand via button
                break;
            
            case 'metrics':
                await this._loadMetrics();
                break;
            
            case 'chat':
                // Chat is always ready
                break;
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // ANALYSIS FUNCTIONS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Run full business case analysis
     * @private
     */
    async _runFullAnalysis() {
        console.log('🔍 Running full analysis...');
        
        // Get current artikel and projekt
        const artikel = this._getCurrentArtikel();
        const projekt = this._getCurrentProjekt();
        
        if (!artikel || !projekt) {
            this._showError('Bitte wähle einen Artikel aus');
            return;
        }
        
        // Show loading
        this._showLoading('analysis');
        
        try {
            // Run analysis
            const results = await this.engine.analyzeBusinessCase(artikel, projekt);
            
            // Display results
            this._displayAnalysisResults(results);
            
            console.log('✅ Analysis complete', results);
            
        } catch (error) {
            console.error('❌ Analysis failed:', error);
            this._showError('Analyse fehlgeschlagen: ' + error.message);
        } finally {
            this._hideLoading('analysis');
        }
    }
    
    /**
     * Run quick analysis
     * @private
     */
    async _runQuickAnalysis() {
        console.log('⚡ Running quick analysis...');
        
        const artikel = this._getCurrentArtikel();
        const projekt = this._getCurrentProjekt();
        
        if (!artikel || !projekt) {
            this._showError('Bitte wähle einen Artikel aus');
            return;
        }
        
        this._showLoading('analysis');
        
        try {
            const results = this.engine.quickAnalysis(artikel, projekt);
            this._displayQuickResults(results);
            
        } catch (error) {
            console.error('❌ Quick analysis failed:', error);
            this._showError('Analyse fehlgeschlagen');
        } finally {
            this._hideLoading('analysis');
        }
    }
    
    /**
     * Load metrics
     * @private
     */
    async _loadMetrics() {
        const artikel = this._getCurrentArtikel();
        const projekt = this._getCurrentProjekt();
        
        if (!artikel || !projekt) {
            return;
        }
        
        this._showLoading('metrics');
        
        try {
            const results = await this.engine.analyzeBusinessCase(artikel, projekt);
            this._displayMetrics(results.metrics);
            
        } catch (error) {
            console.error('❌ Metrics loading failed:', error);
        } finally {
            this._hideLoading('metrics');
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // CHAT FUNCTIONS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Handle chat message
     * @private
     */
    async _handleChatMessage(message) {
        if (!message || message.trim() === '') return;
        
        const chatInput = document.getElementById('albo-chat-input');
        const chatMessages = document.getElementById('albo-chat-messages');
        
        // Clear input
        chatInput.value = '';
        
        // Add user message to UI
        this._addChatMessage('user', message);
        
        // Show typing indicator
        this._showTypingIndicator();
        
        try {
            // Get chat history
            const history = this._getChatHistory();
            
            // Send to ALBO engine
            const response = await this.engine.chat(message, history);
            
            // Hide typing indicator
            this._hideTypingIndicator();
            
            // Add assistant message
            this._addChatMessage('assistant', response.message);
            
        } catch (error) {
            console.error('❌ Chat failed:', error);
            this._hideTypingIndicator();
            this._addChatMessage('assistant', 'Entschuldigung, ich konnte deine Nachricht nicht verarbeiten.');
        }
    }
    
    /**
     * Add message to chat
     * @private
     */
    _addChatMessage(role, text) {
        const chatMessages = document.getElementById('albo-chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `albo-chat-message ${role}`;
        messageDiv.textContent = text;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Get chat history
     * @private
     */
    _getChatHistory() {
        const messages = document.querySelectorAll('.albo-chat-message');
        return Array.from(messages).map(msg => ({
            role: msg.classList.contains('user') ? 'user' : 'assistant',
            content: msg.textContent
        }));
    }
    
    /**
     * Show typing indicator
     * @private
     */
    _showTypingIndicator() {
        const chatMessages = document.getElementById('albo-chat-messages');
        if (!chatMessages) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'loading-spinner';
        indicator.id = 'typing-indicator';
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Hide typing indicator
     * @private
     */
    _hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // EVENT HANDLERS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Handle artikel update
     * @private
     */
    _handleArtikelUpdate(artikel) {
        console.log('📝 Artikel updated', artikel);
        this.currentArtikel = artikel;
        this.engine.setContext(artikel, this.currentProjekt);
    }
    
    /**
     * Handle artikel saved
     * @private
     */
    async _handleArtikelSaved(artikel) {
        console.log('💾 Artikel saved', artikel);
        this.currentArtikel = artikel;
        
        // Auto-analyze if enabled
        if (AI_CONFIG.albo?.auto_analyze_on_save) {
            console.log('🔄 Auto-analyzing...');
            await this._runQuickAnalysis();
        }
    }
    
    /**
     * Handle projekt update
     * @private
     */
    _handleProjektUpdate(projekt) {
        console.log('📁 Projekt updated', projekt);
        this.currentProjekt = projekt;
        this.engine.setContext(this.currentArtikel, projekt);
    }
    
    /**
     * Handle main tab change
     * @private
     */
    _handleMainTabChange(tabName) {
        console.log('📑 Main tab changed:', tabName);
        
        // If switched to artikel detail view, update context
        if (tabName === 'artikel-detail') {
            const artikel = this._getCurrentArtikel();
            if (artikel) {
                this.engine.setContext(artikel, this.currentProjekt);
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // UI DISPLAY FUNCTIONS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Display analysis results
     * @private
     */
    _displayAnalysisResults(results) {
        // Update status badge
        this._updateStatusBadge(results.status);
        
        // Display findings
        this._displayFindings(results.findings || []);
        
        // Display quick wins
        this._displayQuickWins(results.quickWins || []);
        
        // Update metrics panel
        if (results.metrics) {
            this._updateMetricsPanel(results.metrics);
        }
    }
    
    /**
     * Display quick results
     * @private
     */
    _displayQuickResults(results) {
        this._updateStatusBadge(results.status);
        
        if (results.metrics) {
            this._updateMetricsPanel(results.metrics);
        }
        
        // Show note about full analysis
        const placeholder = document.querySelector('.albo-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <p style="color: var(--text-light); font-size: 13px;">
                    Quick Analysis abgeschlossen. 
                    Für detaillierte Insights klicke "Vollständige Analyse".
                </p>
            `;
        }
    }
    
    /**
     * Update status badge
     * @private
     */
    _updateStatusBadge(status) {
        const badge = document.querySelector('.albo-status-badge');
        if (!badge) return;
        
        // Update badge colors based on status
        badge.className = 'albo-status-badge';
        
        const badgeValue = badge.querySelector('.badge-value');
        if (badgeValue) {
            switch (status) {
                case 'good':
                    badgeValue.textContent = 'Excellent';
                    badgeValue.className = 'badge-value positive';
                    badge.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
                    break;
                case 'approved':
                    badgeValue.textContent = 'Approved';
                    badgeValue.className = 'badge-value positive';
                    badge.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                    break;
                case 'warning':
                    badgeValue.textContent = 'Review Needed';
                    badgeValue.className = 'badge-value warning';
                    badge.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                    break;
                case 'critical':
                    badgeValue.textContent = 'Critical Issues';
                    badgeValue.className = 'badge-value negative';
                    badge.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                    break;
            }
        }
    }
    
    /**
     * Display findings
     * @private
     */
    _displayFindings(findings) {
        const container = document.querySelector('.albo-findings');
        if (!container) return;
        
        if (findings.length === 0) {
            container.innerHTML = '<p class="albo-placeholder">Keine kritischen Punkte gefunden ✅</p>';
            return;
        }
        
        container.innerHTML = '';
        
        findings.forEach(finding => {
            const findingEl = document.createElement('div');
            findingEl.className = 'albo-finding';
            findingEl.innerHTML = `
                <div class="finding-title">${this._getSeverityIcon(finding.severity)} ${finding.title}</div>
                <div class="finding-recommendation">${finding.recommendation}</div>
                ${finding.action ? `
                    <div class="finding-actions">
                        <button class="btn-finding btn-apply" data-finding-id="${finding.id}">
                            Anwenden
                        </button>
                        <button class="btn-finding btn-explain">
                            Erklärung
                        </button>
                    </div>
                ` : ''}
            `;
            container.appendChild(findingEl);
        });
    }
    
    /**
     * Display quick wins
     * @private
     */
    _displayQuickWins(quickWins) {
        const container = document.querySelector('.albo-quick-wins');
        if (!container) return;
        
        if (quickWins.length === 0) {
            container.innerHTML = '<p class="albo-placeholder">Keine Quick Wins verfügbar</p>';
            return;
        }
        
        container.innerHTML = '';
        
        quickWins.forEach(qw => {
            const qwEl = document.createElement('div');
            qwEl.className = 'albo-quick-win';
            qwEl.innerHTML = `✨ ${qw.title} - ${qw.impact}`;
            qwEl.dataset.qwId = qw.id;
            qwEl.style.cursor = 'pointer';
            qwEl.addEventListener('click', () => {
                this._applyRecommendation(qw.id);
            });
            container.appendChild(qwEl);
        });
    }
    
    /**
     * Update metrics panel
     * @private
     */
    _updateMetricsPanel(metrics) {
        // Update ROI
        this._updateMetricRow('roi', metrics.roi?.percent.toFixed(1) + '%', metrics.roi?.status);
        
        // Update Break-Even
        this._updateMetricRow('breakeven', metrics.breakEven?.months + ' Monate', metrics.breakEven?.status);
        
        // Update NPV
        this._updateMetricRow('npv', '€' + (metrics.npv?.value || 0).toLocaleString('de-DE'), metrics.npv?.status);
        
        // Update DB1
        this._updateMetricRow('db1', metrics.db1?.percent.toFixed(1) + '%', metrics.db1?.status);
    }
    
    /**
     * Update single metric row
     * @private
     */
    _updateMetricRow(metric, value, status) {
        const row = document.querySelector(`.ai-metric-row[data-metric="${metric}"]`);
        if (!row) return;
        
        const valueEl = row.querySelector('.ai-metric-value');
        if (valueEl) {
            valueEl.textContent = value;
            valueEl.className = 'ai-metric-value ' + (status || '');
        }
    }
    
    /**
     * Display metrics in metrics tab
     * @private
     */
    _displayMetrics(metrics) {
        // This would populate the metrics tab with detailed charts/tables
        // For now, just update the panel
        this._updateMetricsPanel(metrics);
    }
    
    // ═══════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════
    
    /**
     * Get current artikel from form
     * @private
     */
    _getCurrentArtikel() {
        // Try to get from stored state first
        if (this.currentArtikel) {
            return this.currentArtikel;
        }
        
        // Otherwise extract from form fields
        const artikelName = document.getElementById('artikel-name')?.value;
        if (!artikelName) return null;
        
        return {
            artikel_name: artikelName,
            beschreibung: document.getElementById('artikel-beschreibung')?.value,
            start_menge: parseInt(document.getElementById('start-menge')?.value) || 0,
            start_preis: parseFloat(document.getElementById('start-preis')?.value) || 0,
            start_hk: parseFloat(document.getElementById('start-hk')?.value) || 0,
            wachstum_menge: this._getWachstumData('menge'),
            wachstum_preis: this._getWachstumData('preis')
        };
    }
    
    /**
     * Get current projekt
     * @private
     */
    _getCurrentProjekt() {
        if (this.currentProjekt) {
            return this.currentProjekt;
        }
        
        // Extract from app state or form
        return {
            name: 'Current Project', // TODO: Get from state
            branche: 'IT/Software', // TODO: Get from state
            zeithorizont: 3,
            kosten: [] // TODO: Get from state
        };
    }
    
    /**
     * Get wachstum data from form
     * @private
     */
    _getWachstumData(type) {
        // TODO: Extract from form based on selected model
        return {
            modell: 'konstant'
        };
    }
    
    /**
     * Get severity icon
     * @private
     */
    _getSeverityIcon(severity) {
        switch (severity) {
            case 'critical': return '🔴';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '•';
        }
    }
    
    /**
     * Apply recommendation
     * @private
     */
    _applyRecommendation(id) {
        console.log('✨ Applying recommendation:', id);
        // TODO: Implement apply logic
        alert('Recommendation apply coming soon!');
    }
    
    /**
     * Show loading state
     * @private
     */
    _showLoading(section) {
        const content = document.getElementById(`albo-${section}-content`);
        if (!content) return;
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.id = `loading-${section}`;
        content.appendChild(spinner);
    }
    
    /**
     * Hide loading state
     * @private
     */
    _hideLoading(section) {
        const spinner = document.getElementById(`loading-${section}`);
        if (spinner) {
            spinner.remove();
        }
    }
    
    /**
     * Show error message
     * @private
     */
    _showError(message) {
        // TODO: Implement proper error UI
        alert(message);
    }
    
    /**
     * Show welcome message
     * @private
     */
    _showWelcomeMessage() {
        const placeholder = document.querySelector('.albo-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 12px;">🤖</div>
                    <h3 style="margin-bottom: 8px;">ALBO bereit!</h3>
                    <p style="color: var(--text-light); font-size: 13px;">
                        Wähle einen Artikel aus und starte die Analyse.
                    </p>
                </div>
            `;
        }
    }
}

// ═══════════════════════════════════════════════════════
// EXPORT & AUTO-INIT
// ═══════════════════════════════════════════════════════

export const alboSystem = new ALBOSystem();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        alboSystem.init();
    });
} else {
    alboSystem.init();
}

console.log('🤖 ALBO Init loaded');
