/**
 * ALBO AI Advisor - Context-Aware Intelligence Panel
 * McKinsey-Style Decision Support
 * 
 * Features:
 * - Auto-detects current case context
 * - Proactive risk analysis
 * - Structured recommendations (Pyramid Principle)
 * - Similar cases from vector DB
 * - Chat for deep dive
 */

const AI_ADVISOR_CONFIG = {
    apiUrl: window.location.origin,
    customerId: 'demo_customer',
    refreshInterval: 5000, // Auto-refresh every 5s
    riskThresholds: {
        high: 0.7,
        medium: 0.4,
        low: 0.2
    }
};

class AIAdvisor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentContext = null;
        this.analysisCache = {};
        this.isAnalyzing = false;
        
        this.init();
    }

    init() {
        this.render();
        this.detectContext();
        this.startContextMonitoring();
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-advisor-panel">
                <!-- Header -->
                <div class="ai-advisor-header">
                    <div class="advisor-branding">
                        <span class="advisor-icon">🤖</span>
                        <div>
                            <h3>AI Advisor</h3>
                            <p class="advisor-tagline">Context-Aware Intelligence</p>
                        </div>
                    </div>
                    <div class="context-indicator" id="context-indicator">
                        <span class="context-pulse"></span>
                        Analyzing...
                    </div>
                </div>

                <!-- Content Area -->
                <div class="ai-advisor-content" id="ai-advisor-content">
                    <!-- Will be populated dynamically -->
                    <div class="advisor-welcome">
                        <div class="welcome-icon">🎯</div>
                        <h4>Ready to Assist</h4>
                        <p>Open a Business Case to get context-aware insights</p>
                    </div>
                </div>
            </div>
        `;
    }

    async detectContext() {
        // Detect what the user is currently viewing
        // This would integrate with your existing app state
        
        console.log('🔍 Detecting context...');

        // DEMO: Check URL params or app state
        const urlParams = new URLSearchParams(window.location.search);
        const caseId = urlParams.get('case_id') || this.getCurrentCaseFromDOM();

        if (caseId) {
            await this.analyzeCase(caseId);
        } else {
            this.showIdleState();
        }
    }

    getCurrentCaseFromDOM() {
        // Try to detect current case from DOM
        // This is a placeholder - adapt to your actual DOM structure
        
        const titleEl = document.querySelector('[data-case-id]');
        if (titleEl) {
            return titleEl.dataset.caseId;
        }

        // Alternative: Check for active case in breadcrumb or header
        const breadcrumb = document.querySelector('.breadcrumb-active');
        if (breadcrumb && breadcrumb.dataset.caseId) {
            return breadcrumb.dataset.caseId;
        }

        return null;
    }

    async analyzeCase(caseId) {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.updateContextIndicator('analyzing');

        console.log(`🔍 Analyzing case: ${caseId}`);

        try {
            // STEP 1: Get case details
            const caseData = await this.fetchCaseDetails(caseId);
            
            if (!caseData) {
                throw new Error('Case not found');
            }

            this.currentContext = {
                case_id: caseId,
                case_name: caseData.case_name,
                case_type: caseData.business_unit,
                investment: caseData.costs_planned,
                roi_planned: caseData.roi_planned,
                status: caseData.status
            };

            // STEP 2: Generate analysis query
            const analysisQuery = this.buildAnalysisQuery(caseData);

            // STEP 3: Get AI Analysis (RAG)
            const analysis = await this.fetchAIAnalysis(analysisQuery);

            // STEP 4: Render structured output
            this.renderAnalysis(caseData, analysis);

            this.updateContextIndicator('ready', caseData.case_name);

        } catch (error) {
            console.error('❌ Analysis error:', error);
            this.showError(error.message);
            this.updateContextIndicator('error');
        } finally {
            this.isAnalyzing = false;
        }
    }

    buildAnalysisQuery(caseData) {
        // Build smart query based on case context
        const investment = caseData.costs_planned || caseData.revenue_planned || 0;
        const investmentStr = investment > 0 ? `€${(investment/1000000).toFixed(1)}M` : '';

        return `Analysiere diesen Business Case und gib strukturierte Empfehlungen:

Case: ${caseData.case_name}
Type: ${caseData.business_unit}
Investment: ${investmentStr}
ROI Plan: ${caseData.roi_planned ? (caseData.roi_planned * 100).toFixed(0) + '%' : 'N/A'}
Status: ${caseData.status}

Bitte gib mir:
1. BOTTOM LINE: Hauptrisiko in einem Satz
2. TOP 3 RISKS: Konkrete Risiken mit Wahrscheinlichkeit
3. KEY RECOMMENDATIONS: Was JETZT tun?

Basiere die Analyse auf ähnlichen historischen Cases.`;
    }

    async fetchCaseDetails(caseId) {
        // Fetch from Supabase or your API
        // For now, return mock data
        
        // TODO: Replace with actual API call
        return {
            case_id: caseId,
            case_name: 'ERP-Digitalisierung 2025',
            business_unit: 'digitalization',
            costs_planned: 2000000,
            roi_planned: 0.35,
            status: 'planning'
        };
    }

    async fetchAIAnalysis(query) {
        const response = await fetch(`${AI_ADVISOR_CONFIG.apiUrl}/api/cases/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': 'admin'
            },
            body: JSON.stringify({
                question: query,
                customerId: AI_ADVISOR_CONFIG.customerId
            })
        });

        if (!response.ok) {
            throw new Error('AI Analysis failed');
        }

        return await response.json();
    }

    renderAnalysis(caseData, analysis) {
        const contentDiv = document.getElementById('ai-advisor-content');
        
        contentDiv.innerHTML = `
            <!-- Case Context -->
            <div class="analysis-section context-section">
                <div class="section-header">
                    <span class="section-icon">📊</span>
                    <h4>Current Case</h4>
                </div>
                <div class="case-context">
                    <div class="context-item">
                        <span class="context-label">Name</span>
                        <span class="context-value">${caseData.case_name}</span>
                    </div>
                    <div class="context-item">
                        <span class="context-label">Type</span>
                        <span class="context-value">${caseData.business_unit}</span>
                    </div>
                    <div class="context-item">
                        <span class="context-label">Investment</span>
                        <span class="context-value">€${(caseData.costs_planned/1000000).toFixed(1)}M</span>
                    </div>
                    <div class="context-item">
                        <span class="context-label">ROI Target</span>
                        <span class="context-value">${(caseData.roi_planned * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            <!-- AI Analysis -->
            <div class="analysis-section ai-insights-section">
                <div class="section-header">
                    <span class="section-icon">🤖</span>
                    <h4>AI Analysis</h4>
                </div>
                <div class="ai-insights">
                    <div class="insight-content">
                        ${this.formatAIResponse(analysis.answer)}
                    </div>
                </div>
            </div>

            <!-- Similar Cases -->
            ${analysis.sources && analysis.sources.length > 0 ? `
                <div class="analysis-section sources-section">
                    <div class="section-header">
                        <span class="section-icon">📚</span>
                        <h4>Similar Cases (${analysis.sources.length})</h4>
                    </div>
                    <div class="sources-list">
                        ${analysis.sources.map(s => `
                            <div class="source-card">
                                <div class="source-match">${s.similarity}%</div>
                                <div class="source-info">
                                    <div class="source-name">${s.case_name}</div>
                                    <div class="source-meta">
                                        <span class="source-status status-${s.status}">${s.status}</span>
                                        ${s.roi_actual ? `<span class="source-roi">ROI: ${(s.roi_actual * 100).toFixed(0)}%</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Deep Dive Chat -->
            <div class="analysis-section chat-section">
                <div class="section-header">
                    <span class="section-icon">💬</span>
                    <h4>Ask Follow-up Questions</h4>
                </div>
                <div class="chat-quick-actions">
                    <button class="quick-question-btn" data-question="Was sind die größten Risiken?">
                        Was sind die größten Risiken?
                    </button>
                    <button class="quick-question-btn" data-question="Wie kann ich das Budget optimieren?">
                        Wie kann ich das Budget optimieren?
                    </button>
                    <button class="quick-question-btn" data-question="Welche Lessons Learned gibt es?">
                        Welche Lessons Learned?
                    </button>
                </div>
                <div class="chat-input-area">
                    <textarea 
                        id="ai-follow-up-input" 
                        placeholder="Ask specific questions about this case..."
                        rows="2"
                    ></textarea>
                    <button class="ai-send-btn" id="ai-send-follow-up">
                        📤 Ask
                    </button>
                </div>
                <div id="ai-chat-history"></div>
            </div>
        `;

        this.attachChatListeners();
    }

    formatAIResponse(text) {
        // Format markdown-style text for display
        let formatted = text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^### (.+)$/gm, '<h4 class="insight-heading">$1</h4>')
            .replace(/^## (.+)$/gm, '<h3 class="insight-heading">$1</h3>')
            .replace(/^# (.+)$/gm, '<h2 class="insight-heading">$1</h2>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        return `<div class="formatted-content">${formatted}</div>`;
    }

    attachChatListeners() {
        // Quick question buttons
        const quickBtns = document.querySelectorAll('.quick-question-btn');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const question = btn.dataset.question;
                await this.askFollowUp(question);
            });
        });

        // Send button
        const sendBtn = document.getElementById('ai-send-follow-up');
        const input = document.getElementById('ai-follow-up-input');
        
        if (sendBtn && input) {
            sendBtn.addEventListener('click', async () => {
                const question = input.value.trim();
                if (question) {
                    await this.askFollowUp(question);
                    input.value = '';
                }
            });

            input.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const question = input.value.trim();
                    if (question) {
                        await this.askFollowUp(question);
                        input.value = '';
                    }
                }
            });
        }
    }

    async askFollowUp(question) {
        const historyDiv = document.getElementById('ai-chat-history');
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user-message';
        userMsg.innerHTML = `<div class="message-bubble">${this.escapeHtml(question)}</div>`;
        historyDiv.appendChild(userMsg);

        // Show loading
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'chat-message ai-message loading';
        loadingMsg.innerHTML = `<div class="message-bubble"><span class="typing-indicator">●●●</span></div>`;
        historyDiv.appendChild(loadingMsg);
        historyDiv.scrollTop = historyDiv.scrollHeight;

        try {
            const contextualQuestion = `
Context: ${this.currentContext.case_name} (${this.currentContext.case_type})

Question: ${question}
`;

            const response = await fetch(`${AI_ADVISOR_CONFIG.apiUrl}/api/cases/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': 'admin'
                },
                body: JSON.stringify({
                    question: contextualQuestion,
                    customerId: AI_ADVISOR_CONFIG.customerId
                })
            });

            const data = await response.json();

            // Remove loading
            loadingMsg.remove();

            // Add AI response
            const aiMsg = document.createElement('div');
            aiMsg.className = 'chat-message ai-message';
            aiMsg.innerHTML = `<div class="message-bubble">${this.formatAIResponse(data.answer)}</div>`;
            historyDiv.appendChild(aiMsg);
            historyDiv.scrollTop = historyDiv.scrollHeight;

        } catch (error) {
            loadingMsg.remove();
            console.error('Follow-up error:', error);
        }
    }

    updateContextIndicator(state, contextName = '') {
        const indicator = document.getElementById('context-indicator');
        if (!indicator) return;

        switch(state) {
            case 'analyzing':
                indicator.innerHTML = '<span class="context-pulse"></span> Analyzing...';
                indicator.className = 'context-indicator analyzing';
                break;
            case 'ready':
                indicator.innerHTML = `<span class="context-pulse active"></span> ${contextName}`;
                indicator.className = 'context-indicator ready';
                break;
            case 'error':
                indicator.innerHTML = '<span class="context-pulse error"></span> Error';
                indicator.className = 'context-indicator error';
                break;
        }
    }

    showIdleState() {
        const contentDiv = document.getElementById('ai-advisor-content');
        contentDiv.innerHTML = `
            <div class="advisor-welcome">
                <div class="welcome-icon">🎯</div>
                <h4>Ready to Assist</h4>
                <p>Open a Business Case to get context-aware insights</p>
                <div class="welcome-features">
                    <div class="feature-item">⚠️ Automatic Risk Analysis</div>
                    <div class="feature-item">📊 Similar Case Matching</div>
                    <div class="feature-item">💡 McKinsey-Style Recommendations</div>
                </div>
            </div>
        `;
        this.updateContextIndicator('ready', 'Waiting for context');
    }

    showError(message) {
        const contentDiv = document.getElementById('ai-advisor-content');
        contentDiv.innerHTML = `
            <div class="advisor-error">
                <div class="error-icon">⚠️</div>
                <h4>Analysis Error</h4>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
    }

    startContextMonitoring() {
        // Monitor for context changes
        // This would listen to your app's state changes
        
        setInterval(() => {
            const newCaseId = this.getCurrentCaseFromDOM();
            if (newCaseId && (!this.currentContext || newCaseId !== this.currentContext.case_id)) {
                console.log('🔄 Context changed, re-analyzing...');
                this.analyzeCase(newCaseId);
            }
        }, AI_ADVISOR_CONFIG.refreshInterval);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in index.html
export function renderAIAdvisor(containerId = 'ai-advisor-container') {
    const advisor = new AIAdvisor(containerId);
    console.log('✅ AI Advisor initialized');
    return advisor;
}