/* ========================================== */
/* COMMAND CENTER - MAIN LOGIC */
/* ========================================== */

class CommandCenter {
    constructor() {
        this.tasks = [];
        this.emails = [];
        this.currentFilter = 'all';
        this.currentEmailContext = null;
        this.currentAttachments = [];
        
        console.log('🎯 Command Center initialized');
    }

    /**
     * Initialize Command Center
     */
    init() {
        // Load mock data
        this.emails = this.getMockEmails();
        this.tasks = [];
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render initial state
        this.renderEmailList();
        this.renderTaskQueue();
        this.updateStats();
        
        console.log('✅ Command Center ready');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Manual task input
        const analyzeBtn = document.getElementById('analyze-task-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeManualTask());
        }

        // Example tags
        const exampleTags = document.querySelectorAll('.example-tag');
        exampleTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const taskInput = document.getElementById('task-input');
                if (taskInput) {
                    taskInput.value = e.target.textContent;
                }
            });
        });

        // Email refresh
        const refreshBtn = document.getElementById('refresh-emails-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshEmails());
        }

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderTaskQueue();
            });
        });

        // Close modal
        const closeModalBtn = document.getElementById('close-modal-btn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeMatchingModal());
        }
    }

    /**
     * Analyze manual task input
     */
    analyzeManualTask() {
        const taskInput = document.getElementById('task-input');
        if (!taskInput || !taskInput.value.trim()) {
            alert('Bitte gib eine Aufgabe ein!');
            return;
        }

        const taskText = taskInput.value.trim();
        
        // Show loading
        this.showMatchingModal('Analysiere Aufgabe...');
        
        // Simulate AI analysis (in reality: Claude API call)
        setTimeout(() => {
            const matches = this.performAIMatching(taskText);
            this.showMatchingResults(taskText, matches);
            
            // Clear input
            taskInput.value = '';
        }, 1500);
    }

    /**
     * Perform AI matching (Mock)
     */
    performAIMatching(text) {
        const lowerText = text.toLowerCase();
        
        // Simple keyword matching (in reality: Claude API)
        const matches = [];
        
        // Treasury
        if (lowerText.includes('cash pool') || lowerText.includes('liquidität')) {
            matches.push({
                agent: 'Treasury Manager - Cash Pooling',
                category: 'Treasury',
                confidence: 98,
                prompt: 'Analysiere Cash Pooling Struktur und erstelle Optimierungsvorschläge mit Kostenrechnung',
                capabilities: [
                    'Cash Pool Struktur analysieren',
                    'Optimierungspotenziale identifizieren',
                    'Kostenrechnung durchführen',
                    'Reporting erstellen'
                ]
            });
            matches.push({
                agent: 'Liquiditätsplanung Expert',
                category: 'Treasury',
                confidence: 87,
                prompt: 'Erstelle detaillierte Liquiditätsplanung mit Szenarien',
                capabilities: [
                    'Cash Flow Forecasting',
                    'Szenario-Analysen',
                    'Liquiditätsreserven planen'
                ]
            });
        }
        
        // Tax
        else if (lowerText.includes('steuer') || lowerText.includes('tax')) {
            matches.push({
                agent: 'Tax Manager - Optimierung',
                category: 'Tax',
                confidence: 95,
                prompt: 'Analysiere Steueroptimierungspotenziale und erstelle Handlungsempfehlungen',
                capabilities: [
                    'Steueroptimierung identifizieren',
                    'Compliance prüfen',
                    'Einsparungspotenziale berechnen'
                ]
            });
        }
        
        // M&A
        else if (lowerText.includes('m&a') || lowerText.includes('übernahme') || lowerText.includes('bewertung')) {
            matches.push({
                agent: 'M&A Analyst - Valuation',
                category: 'M&A',
                confidence: 96,
                prompt: 'Führe Unternehmensbewertung durch mit DCF, Multiples und Vergleichsanalyse',
                capabilities: [
                    'DCF Bewertung',
                    'Multiple Analyse',
                    'Due Diligence Support',
                    'Synergieanalyse'
                ]
            });
        }
        
        // Controlling
        else if (lowerText.includes('budget') || lowerText.includes('forecast') || lowerText.includes('plan')) {
            matches.push({
                agent: 'Controller - Budget & Planning',
                category: 'Controlling',
                confidence: 92,
                prompt: 'Erstelle Budget-Analyse mit Abweichungsanalyse und Forecasting',
                capabilities: [
                    'Budget vs. Ist Analyse',
                    'Forecasting',
                    'Abweichungsanalyse',
                    'KPI Tracking'
                ]
            });
        }
        
        // CSRD / ESG
        else if (lowerText.includes('csrd') || lowerText.includes('esg') || lowerText.includes('nachhaltig')) {
            matches.push({
                agent: 'CSRD Reporting Specialist',
                category: 'Compliance',
                confidence: 94,
                prompt: 'Erstelle CSRD-konformes Reporting mit ESG-Kennzahlen',
                capabilities: [
                    'CSRD Requirements analysieren',
                    'ESG Daten sammeln',
                    'Reporting erstellen',
                    'Compliance sicherstellen'
                ]
            });
        }
        
        // Generic fallback
        else {
            matches.push({
                agent: 'Financial Analyst - General',
                category: 'Finance',
                confidence: 75,
                prompt: 'Analysiere finanzielle Fragestellung und erstelle Empfehlung',
                capabilities: [
                    'Datenanalyse',
                    'Reporting',
                    'Empfehlungen ableiten'
                ]
            });
        }
        
        return matches;
    }

    /**
     * Show matching modal with loading
     */
    showMatchingModal(loadingText = 'Analysiere...') {
        const modal = document.getElementById('matching-modal');
        const modalBody = document.getElementById('modal-body');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner">🤖</div>
                    <div class="loading-text">${loadingText}</div>
                </div>
            `;
            modal.classList.remove('hidden');
        }
    }

    /**
     * Show matching results in modal
     */
    showMatchingResults(taskText, matches) {
        const modalBody = document.getElementById('modal-body');
        
        if (!modalBody || matches.length === 0) return;
        
        let html = `
            <div class="user-task-display">
                <div class="user-task-label">Deine Aufgabe:</div>
                <div class="user-task-text">"${taskText}"</div>
            </div>
            
            <div class="match-results">
        `;
        
        matches.forEach((match, index) => {
            const isBest = index === 0;
            html += `
                <div class="match-result-card ${isBest ? 'best' : ''}">
                    <div class="match-result-header">
                        <div>
                            <div class="match-result-title">
                                ${isBest ? '🏆 ' : ''}${match.agent}
                            </div>
                            <div class="match-result-category">${match.category}</div>
                        </div>
                        <div class="match-score">
                            <div class="score-badge">${match.confidence}%</div>
                            <div class="score-label">Match</div>
                        </div>
                    </div>
                    
                    <div class="match-capabilities">
                        <div class="capabilities-title">✅ Kann:</div>
                        <ul class="capabilities-list">
                            ${match.capabilities.map(cap => `<li>${cap}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="match-result-actions">
                        <button 
                            class="btn-sm btn-primary start-agent-btn" 
                            data-agent="${match.agent}" 
                            data-task="${taskText.replace(/"/g, '&quot;')}"
                        >
                            🚀 Jetzt starten
                        </button>
                        <button class="btn-sm btn-secondary" onclick="window.commandCenter.addToQueue('${taskText}', ${JSON.stringify(match).replace(/"/g, '&quot;')})">
                            📋 Zu Queue hinzufügen
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        modalBody.innerHTML = html;
        
        // Attach event listeners to start buttons
        setTimeout(() => {
            const startButtons = modalBody.querySelectorAll('.start-agent-btn');
            startButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const agent = btn.dataset.agent;
                    const task = btn.dataset.task;
                    this.startAgent(agent, task);
                });
            });
        }, 10);
    }

    /**
     * Close matching modal
     */
    closeMatchingModal() {
        const modal = document.getElementById('matching-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Add task to queue
     */
    addToQueue(taskText, match) {
        const task = {
            id: Date.now(),
            description: taskText,
            source: 'manual',
            status: 'matched',
            match: match,
            date: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.renderTaskQueue();
        this.updateStats();
        this.closeMatchingModal();
        
        this.showToast('✅ Aufgabe zur Queue hinzugefügt!');
    }

    /**
     * Start agent (Routes to Prompts Tab)
     */
    startAgent(agentName, taskContext) {
        console.log(`🚀 Starting agent: ${agentName}`);
        console.log(`📝 Context: ${taskContext}`);
        
        this.closeMatchingModal();
        
        // Build context for Prompts Tab
        const promptContext = {
            agentId: this.getAgentIdFromName(agentName),
            task: taskContext,
            email: this.currentEmailContext || null,
            attachments: this.currentAttachments || []
        };
        
        console.log('📦 Prompt Context:', promptContext);
        
        // Route to Prompts Tab with context
        if (window.mainNav && window.mainNav.loadPromptsWithContext) {
            window.mainNav.loadPromptsWithContext(promptContext);
        } else {
            console.error('❌ mainNav.loadPromptsWithContext not found!');
        }
    }
    
    /**
     * Get agent ID from agent name (simple mapping)
     */
    getAgentIdFromName(agentName) {
        const mapping = {
            'Treasury Manager - Cash Pooling': 'treasury_cashpool',
            'Liquiditätsplanung Expert': 'treasury_liquidity',
            'Tax Manager - Optimierung': 'tax_optimization',
            'Controller - Budget & Planning': 'controller_budget',
            'M&A Analyst - Valuation': 'ma_valuation',
            'CSRD Reporting Specialist': 'compliance_csrd'
        };
        
        return mapping[agentName] || 'treasury_cashpool';
    }

    /**
     * Refresh emails (Mock)
     */
    refreshEmails() {
        this.showToast('🔄 Aktualisiere E-Mails...');
        
        setTimeout(() => {
            this.emails = this.getMockEmails();
            this.renderEmailList();
            this.updateStats();
            this.showToast('✅ E-Mails aktualisiert!');
        }, 1000);
    }

    /**
     * Process email (analyze and match)
     */
    processEmail(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email) return;
        
        // Store current email context for later use
        this.currentEmailContext = {
            from: email.from,
            subject: email.subject,
            date: email.time,
            body: email.snippet
        };
        
        this.showMatchingModal('Analysiere E-Mail...');
        
        setTimeout(() => {
            const taskText = `${email.subject} - ${email.snippet}`;
            const matches = this.performAIMatching(taskText);
            this.showMatchingResults(taskText, matches);
        }, 1500);
    }

    /**
     * Render email list
     */
    renderEmailList() {
        const container = document.getElementById('email-list');
        if (!container) return;
        
        if (this.emails.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <div class="empty-title">Keine E-Mails</div>
                    <div class="empty-description">Aktuell sind keine neuen E-Mails vorhanden</div>
                </div>
            `;
            return;
        }
        
        const html = this.emails.map(email => `
            <div class="email-preview ${email.unread ? 'unread' : ''}" onclick="window.commandCenter.processEmail(${email.id})">
                <div class="email-meta">
                    <div class="email-from">${email.from}</div>
                    <div class="email-time">${email.time}</div>
                </div>
                <div class="email-subject">${email.subject}</div>
                <div class="email-snippet">${email.snippet}</div>
                <div class="email-tags">
                    <span class="email-tag category">${email.category}</span>
                    <span class="email-tag status">Neu</span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }

    /**
     * Render task queue
     */
    renderTaskQueue() {
        const container = document.getElementById('task-list');
        if (!container) return;
        
        let filteredTasks = this.tasks;
        
        if (this.currentFilter === 'manual') {
            filteredTasks = this.tasks.filter(t => t.source === 'manual');
        } else if (this.currentFilter === 'email') {
            filteredTasks = this.tasks.filter(t => t.source === 'email');
        }
        
        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <div class="empty-title">Keine Aufgaben</div>
                    <div class="empty-description">Erstelle eine neue Aufgabe oder warte auf E-Mails</div>
                </div>
            `;
            return;
        }
        
        const html = filteredTasks.map(task => {
            const statusClass = task.status === 'matched' ? 'matched' : '';
            const statusText = task.status === 'matched' ? 'Matched' : task.status === 'analyzing' ? 'Analysiere...' : 'Neu';
            const statusBadge = task.status === 'matched' ? 'matched' : task.status === 'analyzing' ? 'analyzing' : 'new';
            
            return `
                <div class="task-card ${statusClass}">
                    <div class="task-card-header">
                        <div>
                            <div class="task-title">${task.description.substring(0, 60)}...</div>
                            <div class="task-source">Quelle: ${task.source === 'manual' ? 'Manuelle Eingabe' : 'E-Mail'}</div>
                        </div>
                        <span class="task-status-badge ${statusBadge}">${statusText}</span>
                    </div>
                    
                    ${task.match ? `
                        <div class="task-match">
                            <div class="match-header">
                                <div class="match-agent">🤖 ${task.match.agent}</div>
                                <div class="match-confidence">${task.match.confidence}% Match</div>
                            </div>
                            <div class="match-prompt">${task.match.prompt}</div>
                        </div>
                        
                        <div class="task-actions">
                            <button 
                                class="btn-sm btn-primary start-agent-btn" 
                                data-agent="${task.match.agent}" 
                                data-task="${task.description.replace(/"/g, '&quot;')}"
                            >
                                🚀 Agent starten
                            </button>
                            <button class="btn-sm btn-secondary" onclick="window.commandCenter.removeTask(${task.id})">
                                🗑️ Löschen
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
        
        // Attach event listeners to start buttons
        setTimeout(() => {
            const startButtons = container.querySelectorAll('.start-agent-btn');
            startButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const agent = btn.dataset.agent;
                    const task = btn.dataset.task;
                    this.startAgent(agent, task);
                });
            });
        }, 10);
    }

    /**
     * Remove task
     */
    removeTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.renderTaskQueue();
        this.updateStats();
        this.showToast('✅ Aufgabe gelöscht');
    }

    /**
     * Update stats
     */
    updateStats() {
        const newEmailsEl = document.getElementById('stat-new-emails');
        const analyzingEl = document.getElementById('stat-analyzing');
        const matchedEl = document.getElementById('stat-matched');
        const totalEl = document.getElementById('stat-total');
        
        if (newEmailsEl) newEmailsEl.textContent = this.emails.length;
        if (analyzingEl) analyzingEl.textContent = this.tasks.filter(t => t.status === 'analyzing').length;
        if (matchedEl) matchedEl.textContent = this.tasks.filter(t => t.status === 'matched').length;
        if (totalEl) totalEl.textContent = this.tasks.length;
    }

    /**
     * Show toast notification
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    /**
     * Get mock emails
     */
    getMockEmails() {
        return [
            {
                id: 1,
                from: 'CFO Hans Müller',
                subject: 'Urgent: Cash Pooling Analyse benötigt',
                snippet: 'Können Sie bitte eine Analyse unserer Cash Pooling Struktur erstellen? Wir müssen bis Ende der Woche Optimierungspotenziale identifizieren...',
                time: 'Vor 15 Min',
                category: 'Treasury',
                unread: true
            },
            {
                id: 2,
                from: 'Tax Manager Sarah Schmidt',
                subject: 'Steueroptimierung Q4 - Dringend',
                snippet: 'Für das Q4 benötigen wir eine Analyse der Steueroptimierungspotenziale. Bitte prüfen Sie alle Möglichkeiten zur Minimierung...',
                time: 'Vor 1 Std',
                category: 'Tax',
                unread: true
            },
            {
                id: 3,
                from: 'M&A Team',
                subject: 'Due Diligence für Target XYZ',
                snippet: 'Wir benötigen eine vollständige Financial Due Diligence für unser Akquisitionsziel. Budget €50M, Timeline 4 Wochen...',
                time: 'Vor 3 Std',
                category: 'M&A',
                unread: true
            }
        ];
    }
}

// Create global instance
window.commandCenter = new CommandCenter();

// Toast CSS (inline for simplicity)
const style = document.createElement('style');
style.textContent = `
    .toast-notification {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #1e293b;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-size: 0.875rem;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s;
        z-index: 2000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .toast-notification.show {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

console.log('✅ Command Center JS loaded');