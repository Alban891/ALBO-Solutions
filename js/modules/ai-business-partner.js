/**
 * ALBO AI Business Partner
 * Focused, Clean, Actionable
 * 
 * Design: 380px wide, Progressive Disclosure
 */

const AI_PARTNER_CONFIG = {
    apiUrl: window.location.origin,
    customerId: 'demo_customer',
    debounceDelay: 500,
    criticalFields: ['geschaeftsmodell', 'investment', 'roi_planned']
};

class AIBusinessPartner {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentContext = null;
        this.activeInsights = {
            alert: null,
            similarCase: null,
            recommendation: null
        };
        this.isAnalyzing = false;
        this.debounceTimer = null;
        
        this.init();
    }

    init() {
        this.render();
        this.detectInitialContext();
        this.attachFieldListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-partner-panel">
                
                <!-- Header: Compact -->
                <div class="ai-partner-header">
                    <div class="header-info">
                        <span class="ai-icon">🤖</span>
                        <div>
                            <div class="ai-title">AI Partner</div>
                            <div class="ai-status" id="ai-status">Ready</div>
                        </div>
                    </div>
                </div>

                <!-- Content: Scrollable -->
                <div class="ai-partner-content" id="ai-content">
                    
                    <!-- Welcome State -->
                    <div id="ai-welcome" class="welcome-state">
                        <div class="welcome-icon">🎯</div>
                        <p>I'll analyze your case as you work</p>
                    </div>

                    <!-- Zone 1: Alert (Hidden by default) -->
                    <div id="ai-alert" class="insight-card alert-card" style="display: none;">
                        <div class="card-header" onclick="aiPartner.toggleCard('alert')">
                            <span class="card-icon">⚠️</span>
                            <span class="card-title" id="alert-title">Alert</span>
                            <span class="card-toggle">▼</span>
                        </div>
                        <div class="card-body" id="alert-body">
                            <!-- Content here -->
                        </div>
                    </div>

                    <!-- Zone 2: Similar Case (Hidden by default) -->
                    <div id="ai-similar" class="insight-card similar-card" style="display: none;">
                        <div class="card-header" onclick="aiPartner.toggleCard('similar')">
                            <span class="card-icon">📊</span>
                            <span class="card-title" id="similar-title">Similar Case</span>
                            <span class="card-toggle">▼</span>
                        </div>
                        <div class="card-body" id="similar-body">
                            <!-- Content here -->
                        </div>
                    </div>

                    <!-- Zone 3: Recommendation (Hidden by default) -->
                    <div id="ai-recommendation" class="insight-card rec-card" style="display: none;">
                        <div class="card-header" onclick="aiPartner.toggleCard('recommendation')">
                            <span class="card-icon">💡</span>
                            <span class="card-title" id="rec-title">Suggestion</span>
                            <span class="card-toggle">▼</span>
                        </div>
                        <div class="card-body" id="rec-body">
                            <!-- Content here -->
                        </div>
                    </div>

                    <!-- Zone 4: Chat (Collapsed by default) -->
                    <div id="ai-chat" class="insight-card chat-card">
                        <div class="card-header" onclick="aiPartner.toggleCard('chat')">
                            <span class="card-icon">💬</span>
                            <span class="card-title">Ask me anything</span>
                            <span class="card-toggle">▼</span>
                        </div>
                        <div class="card-body collapsed" id="chat-body">
                            <div class="chat-messages" id="chat-messages"></div>
                            <div class="chat-input-wrapper">
                                <input 
                                    type="text" 
                                    id="chat-input" 
                                    placeholder="Ask about this case..."
                                    onkeypress="if(event.key==='Enter') aiPartner.sendChat()"
                                >
                                <button onclick="aiPartner.sendChat()">→</button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        `;
    }

    detectInitialContext() {
        // Detect if user is on a case page
        // For now, show welcome state
        this.updateStatus('Waiting for input...');
    }

    attachFieldListeners() {
        // Attach to ALL input fields in the main form
        const allInputs = document.querySelectorAll('input[type="text"], textarea, select');
        
        allInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleFieldChange(e));
            input.addEventListener('blur', (e) => this.handleFieldChange(e));
        });

        console.log(`✅ Attached listeners to ${allInputs.length} fields`);
    }

    handleFieldChange(event) {
        const field = event.target;
        const fieldName = field.name || field.id || 'unknown';
        const value = field.value;

        console.log(`📝 Field changed: ${fieldName} = ${value}`);

        // Debounce: Wait 500ms before analyzing
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.analyzeContext(fieldName, value);
        }, AI_PARTNER_CONFIG.debounceDelay);
    }

    async analyzeContext(fieldName, value) {
        if (this.isAnalyzing) return;
        
        // Skip if empty or too short
        if (!value || value.length < 3) return;

        this.isAnalyzing = true;
        this.updateStatus('Analyzing...');
        
        // Hide welcome
        const welcome = document.getElementById('ai-welcome');
        if (welcome) welcome.style.display = 'none';

        try {
            // Build analysis query
            const query = this.buildContextQuery(fieldName, value);
            
            // Call RAG API
            const response = await fetch(`${AI_PARTNER_CONFIG.apiUrl}/api/cases/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': 'admin'
                },
                body: JSON.stringify({
                    question: query,
                    customerId: AI_PARTNER_CONFIG.customerId
                })
            });

            const data = await response.json();
            
            // Parse and display insights
            this.displayInsights(data, fieldName, value);
            
            this.updateStatus('Analysis complete');

        } catch (error) {
            console.error('❌ Analysis error:', error);
            this.updateStatus('Analysis failed');
        } finally {
            this.isAnalyzing = false;
        }
    }

    buildContextQuery(fieldName, value) {
        // Smart query building based on field
        if (fieldName.includes('geschaefts') || fieldName.includes('model')) {
            return `Analysiere dieses Geschäftsmodell: "${value}"

Gib mir:
1. RISK LEVEL (High/Medium/Low) in einem Satz
2. TOP 1 SIMILAR CASE mit ROI und Key Metric
3. TOP 1 RECOMMENDATION (konkret, umsetzbar)

Halte es KURZ und PRÄGNANT (max 3 Sätze pro Punkt).`;
        }
        
        if (fieldName.includes('roi') || fieldName.includes('investment')) {
            return `Der User hat eingegeben: ${fieldName} = ${value}

Bewerte:
1. Ist das realistisch im Vergleich zu ähnlichen Cases?
2. Was ist der Benchmark?
3. Was empfiehlst du?

KURZ und KONKRET bitte.`;
        }

        // Default query
        return `Analysiere diesen Business Case Input:
${fieldName}: ${value}

Gib mir die wichtigste Erkenntnis in 1-2 Sätzen.`;
    }

    displayInsights(data, fieldName, value) {
        const answer = data.answer || '';
        const sources = data.sources || [];

        // ALERT: Extract risk level
        if (answer.toLowerCase().includes('risk') || answer.toLowerCase().includes('risiko')) {
            const alertCard = document.getElementById('ai-alert');
            const alertBody = document.getElementById('alert-body');
            const alertTitle = document.getElementById('alert-title');
            
            // Determine risk level
            let riskLevel = 'Medium';
            let riskIcon = '⚠️';
            if (answer.toLowerCase().includes('high') || answer.toLowerCase().includes('hoch')) {
                riskLevel = 'High';
                riskIcon = '🔴';
            } else if (answer.toLowerCase().includes('low') || answer.toLowerCase().includes('niedrig')) {
                riskLevel = 'Low';
                riskIcon = '🟢';
            }
            
            alertTitle.textContent = `Risk: ${riskLevel}`;
            alertCard.querySelector('.card-icon').textContent = riskIcon;
            
            // Extract first paragraph as alert
            const firstPara = answer.split('\n\n')[0];
            alertBody.innerHTML = `<p class="alert-text">${this.escapeHtml(firstPara)}</p>`;
            
            alertCard.style.display = 'block';
        }

        // SIMILAR CASE: Show top match
        if (sources.length > 0) {
            const topCase = sources[0];
            const similarCard = document.getElementById('ai-similar');
            const similarBody = document.getElementById('similar-body');
            const similarTitle = document.getElementById('similar-title');
            
            similarTitle.textContent = `${topCase.case_name} (${topCase.similarity}%)`;
            
            similarBody.innerHTML = `
                <div class="similar-stats">
                    <div class="stat-item">
                        <span class="stat-label">Match</span>
                        <span class="stat-value">${topCase.similarity}%</span>
                    </div>
                    ${topCase.roi_actual ? `
                    <div class="stat-item">
                        <span class="stat-label">ROI</span>
                        <span class="stat-value">${(topCase.roi_actual * 100).toFixed(0)}%</span>
                    </div>
                    ` : ''}
                </div>
                <button class="btn-small" onclick="alert('Compare feature coming soon!')">
                    Compare Details →
                </button>
            `;
            
            similarCard.style.display = 'block';
        }

        // RECOMMENDATION: Extract from answer
        if (answer.includes('empfehlung') || answer.includes('recommendation') || answer.includes('sollte')) {
            const recCard = document.getElementById('ai-recommendation');
            const recBody = document.getElementById('rec-body');
            
            // Try to extract recommendation section
            const sections = answer.split('\n\n');
            const recSection = sections.find(s => 
                s.toLowerCase().includes('empfehlung') || 
                s.toLowerCase().includes('recommendation')
            ) || sections[sections.length - 1];
            
            recBody.innerHTML = `
                <p class="rec-text">${this.escapeHtml(recSection)}</p>
                <button class="btn-primary btn-small" onclick="alert('Apply feature coming soon!')">
                    Apply Suggestion
                </button>
            `;
            
            recCard.style.display = 'block';
        }
    }

    async sendChat() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        const messagesDiv = document.getElementById('chat-messages');
        
        // Add user message
        messagesDiv.innerHTML += `
            <div class="chat-msg user-msg">${this.escapeHtml(message)}</div>
        `;
        
        input.value = '';
        
        // Show loading
        messagesDiv.innerHTML += `
            <div class="chat-msg ai-msg loading">Thinking...</div>
        `;
        
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        try {
            const response = await fetch(`${AI_PARTNER_CONFIG.apiUrl}/api/cases/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': 'admin'
                },
                body: JSON.stringify({
                    question: message,
                    customerId: AI_PARTNER_CONFIG.customerId
                })
            });
            
            const data = await response.json();
            
            // Remove loading
            const loadingMsg = messagesDiv.querySelector('.loading');
            if (loadingMsg) loadingMsg.remove();
            
            // Add AI response
            messagesDiv.innerHTML += `
                <div class="chat-msg ai-msg">${this.formatText(data.answer)}</div>
            `;
            
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
        } catch (error) {
            console.error('Chat error:', error);
        }
    }

    toggleCard(cardName) {
        const card = document.getElementById(`${cardName === 'similar' ? 'ai-similar' : cardName === 'alert' ? 'ai-alert' : cardName === 'recommendation' ? 'ai-recommendation' : 'ai-chat'}`);
        const body = document.getElementById(`${cardName === 'similar' ? 'similar' : cardName === 'alert' ? 'alert' : cardName === 'recommendation' ? 'rec' : 'chat'}-body`);
        const toggle = card.querySelector('.card-toggle');
        
        if (body.classList.contains('collapsed')) {
            body.classList.remove('collapsed');
            toggle.textContent = '▲';
        } else {
            body.classList.add('collapsed');
            toggle.textContent = '▼';
        }
    }

    updateStatus(status) {
        const statusEl = document.getElementById('ai-status');
        if (statusEl) statusEl.textContent = status;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatText(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }
}

// Export
export function renderAIBusinessPartner(containerId = 'ai-partner-container') {
    window.aiPartner = new AIBusinessPartner(containerId);
    console.log('✅ AI Business Partner initialized');
    return window.aiPartner;
}