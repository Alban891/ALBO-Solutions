/* ========================================== */
/* ALBO PROMPTS - MULTI-ROLE SUPPORT */
/* Loads prompts from multiple role-specific files */
/* ========================================== */

class PromptsEngine {
    constructor() {
        this.taskQueue = [];
        this.allPrompts = this.getAllPrompts();
        this.currentView = 'roles';
        this.currentMode = 'templates';
        this.currentRole = null;
        this.currentPrompt = null;
        this.userAnswers = {};
        this.searchQuery = '';
        
        console.log('💡 Prompts Engine initialized (Multi-Role)');
        console.log(`📚 Loaded ${this.allPrompts.length} prompts across ${this.getRoleCount()} roles`);
    }

    getRoleCount() {
        const roles = new Set(this.allPrompts.map(p => p.category));
        return roles.size;
    }

    init(context = null) {
        if (context) {
            this.addTaskFromCommandCenter(context);
        }
        this.renderMainView();
        console.log('✅ Prompts Engine ready');
    }

    addTaskFromCommandCenter(context) {
        const task = {
            id: Date.now(),
            title: context.task,
            agent: this.getAgentName(context.agentId),
            agentId: context.agentId,
            matchScore: context.matchScore || 98,
            source: context.email ? 'email' : 'manual',
            email: context.email,
            attachments: context.attachments || [],
            timestamp: new Date().toISOString()
        };
        
        const exists = this.taskQueue.find(t => 
            t.title === task.title && t.agentId === task.agentId
        );
        
        if (!exists) {
            this.taskQueue.push(task);
            console.log('✅ Task added to queue:', task);
        }
    }

    /* ========================================== */
    /* MAIN VIEW RENDERING */
    /* ========================================== */

    renderMainView() {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        container.innerHTML = `
            <!-- Mode Switcher -->
            <div class="mode-switcher">
                <button 
                    class="mode-btn ${this.currentMode === 'templates' ? 'active' : ''}"
                    onclick="window.promptsEngine.switchMode('templates')"
                >
                    📚 Expert Templates
                </button>
                <button 
                    class="mode-btn ${this.currentMode === 'freeform' ? 'active' : ''}"
                    onclick="window.promptsEngine.switchMode('freeform')"
                >
                    🆓 Custom Builder
                </button>
            </div>
            
            ${this.currentMode === 'templates' ? this.renderTemplateMode() : this.renderFreeFormMode()}
        `;
        
        this.setupEventListeners();
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.currentView = 'roles';
        this.currentRole = null;
        this.currentPrompt = null;
        this.renderMainView();
    }

    renderTemplateMode() {
        return `
            <!-- Task Queue Section -->
            ${this.taskQueue.length > 0 ? `
                <div class="task-queue-section">
                    <div class="task-queue-header">
                        <div class="task-queue-title">
                            📋 Deine Aufgaben
                            <span class="task-count-badge">${this.taskQueue.length}</span>
                        </div>
                    </div>
                    <div id="task-queue-container">
                        ${this.renderTaskQueue()}
                    </div>
                </div>
            ` : ''}
            
            <!-- Main Content Area -->
            <div class="prompt-library-section">
                ${this.renderCurrentView()}
            </div>
        `;
    }

    renderCurrentView() {
        switch(this.currentView) {
            case 'roles':
                return this.renderRolesOverview();
            case 'titleList':
                return this.renderTitleList();
            case 'splitDetail':
                return this.renderSplitDetail();
            default:
                return this.renderRolesOverview();
        }
    }

    /* ========================================== */
    /* LEVEL 1: ROLES OVERVIEW */
    /* ========================================== */

    renderRolesOverview() {
        const roleGroups = this.groupPromptsByRole();
        const roles = Object.keys(roleGroups).sort();
        
        return `
            <div class="library-header">
                <div class="library-title">
                    💼 Wähle deine Rolle
                </div>
                <div class="library-subtitle">
                    ${this.allPrompts.length} Prompts in ${roles.length} Rollen verfügbar
                </div>
            </div>
            
            <div class="roles-grid">
                ${roles.map(role => {
                    const count = roleGroups[role].length;
                    const icon = this.getRoleIcon(role);
                    return `
                        <div class="role-card" onclick="window.promptsEngine.selectRole('${role}')">
                            <div class="role-card-icon">${icon}</div>
                            <div class="role-card-content">
                                <h3 class="role-card-title">${role}</h3>
                                <p class="role-card-count">${count} Prompts verfügbar</p>
                            </div>
                            <div class="role-card-arrow">→</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getRoleIcon(role) {
        const icons = {
            'Controller': '📊',
            'Treasury': '🏦',
            'Tax': '💰',
            'CFO': '📈',
            'M&A': '🤝',
            'Bilanzbuchhalter': '📚',
            'Business Developer': '🚀',
            'Fachanwalt Gesellschaftsrecht': '⚖️',
            'Accountant': '💼',
            'Finance Manager': '💵',
            'Auditor': '🔍'
        };
        return icons[role] || '💼';
    }

    selectRole(role) {
        this.currentRole = role;
        this.currentView = 'titleList';
        this.currentPrompt = null;
        this.renderMainView();
    }

    /* ========================================== */
    /* LEVEL 2: TITLE LIST */
    /* ========================================== */

    renderTitleList() {
        const prompts = this.getPromptsByRole(this.currentRole);
        const filtered = this.searchQuery.trim() 
            ? prompts.filter(p => 
                p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
              )
            : prompts;
        
        return `
            <div class="title-list-container">
                <div class="title-list-header">
                    <button class="btn-back-to-roles" onclick="window.promptsEngine.backToRoles()">
                        ← Zurück zu Rollen
                    </button>
                    <div class="title-list-header-content">
                        <h2 class="title-list-role">
                            ${this.getRoleIcon(this.currentRole)} ${this.currentRole}
                        </h2>
                        <p class="title-list-count">${filtered.length} Prompts</p>
                    </div>
                    
                    <div class="title-list-search">
                        <input 
                            type="text" 
                            class="title-search-input"
                            id="title-search-input"
                            placeholder="Suche in ${this.currentRole} Prompts..."
                            value="${this.searchQuery}"
                        >
                    </div>
                </div>
                
                <div class="title-list-body">
                    ${filtered.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon">🔍</div>
                            <h3>Keine Prompts gefunden</h3>
                            <p>Versuche einen anderen Suchbegriff</p>
                        </div>
                    ` : `
                        <div class="prompt-titles-list">
                            ${filtered.map(prompt => `
                                <div 
                                    class="prompt-title-item ${this.currentPrompt?.id === prompt.id ? 'active' : ''}"
                                    onclick="window.promptsEngine.selectPrompt('${prompt.id}')"
                                >
                                    <span class="prompt-title-icon">${prompt.icon || '📄'}</span>
                                    <span class="prompt-title-text">${prompt.name}</span>
                                    <span class="prompt-title-duration">⏱️ ${prompt.duration || 20}min</span>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    backToRoles() {
        this.currentView = 'roles';
        this.currentRole = null;
        this.currentPrompt = null;
        this.searchQuery = '';
        this.renderMainView();
    }

    /* ========================================== */
    /* LEVEL 3: SPLIT-SCREEN DETAIL */
    /* ========================================== */

    selectPrompt(promptId) {
        const prompt = this.getPromptById(promptId);
        if (!prompt) return;
        
        this.currentPrompt = prompt;
        this.currentView = 'splitDetail';
        this.renderMainView();
    }

    renderSplitDetail() {
        const prompts = this.getPromptsByRole(this.currentRole);
        const prompt = this.currentPrompt;
        
        if (!prompt) {
            this.currentView = 'titleList';
            return this.renderTitleList();
        }
        
        return `
            <div class="split-detail-container">
                <!-- LEFT: Title List -->
                <div class="split-left">
                    <div class="split-left-header">
                        <button class="btn-back-to-roles" onclick="window.promptsEngine.backToRoles()">
                            ← Zurück
                        </button>
                        <div class="split-left-title">
                            ${this.getRoleIcon(this.currentRole)} ${this.currentRole}
                        </div>
                    </div>
                    
                    <div class="prompt-titles-list">
                        ${prompts.map(p => `
                            <div 
                                class="prompt-title-item ${p.id === prompt.id ? 'active' : ''}"
                                onclick="window.promptsEngine.selectPrompt('${p.id}')"
                            >
                                <span class="prompt-title-icon">${p.icon || '📄'}</span>
                                <span class="prompt-title-text">${p.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- RIGHT: Prompt Detail -->
                <div class="split-right">
                    ${this.renderPromptDetail(prompt)}
                </div>
            </div>
        `;
    }

    renderPromptDetail(prompt) {
        return `
            <div class="prompt-detail-view">
                <div class="prompt-detail-header">
                    <div class="prompt-detail-title-section">
                        <span class="prompt-detail-icon">${prompt.icon || this.getRoleIcon(this.currentRole)}</span>
                        <div>
                            <h2 class="prompt-detail-title">${prompt.name}</h2>
                            <p class="prompt-detail-meta">
                                ${this.currentRole} • ${prompt.duration || 20} Min
                            </p>
                        </div>
                    </div>
                    <button class="btn-close-detail" onclick="window.promptsEngine.closeDetail()">✕</button>
                </div>
                
                <div class="prompt-detail-body">
                    <div class="detail-section">
                        <h3 class="detail-section-title">🎯 Ziel</h3>
                        <p class="detail-section-text">${prompt.goal || prompt.description}</p>
                    </div>
                    
                    ${prompt.fullPromptText ? `
                        <div class="detail-section transparency-section">
                            <div class="transparency-header-inline">
                                <h3 class="detail-section-title">📋 Vollständiger Prompt</h3>
                                <button class="btn-copy-inline" onclick="window.promptsEngine.copyPromptText()">
                                    📋 Kopieren
                                </button>
                            </div>
                            <div class="prompt-code-block">
                                ${this.formatPromptText(prompt.fullPromptText)}
                            </div>
                            <div class="transparency-note">
                                💡 <strong>100% Transparenz:</strong> Das ist exakt der Prompt, der an die AI gesendet wird.
                            </div>
                        </div>
                    ` : ''}
                    
                    ${prompt.questions && prompt.questions.length > 0 ? `
                        <div class="detail-section">
                            <h3 class="detail-section-title">🔍 Deine Eingaben</h3>
                            <div class="questions-list-detail">
                                ${prompt.questions.map((q, i) => `
                                    <div class="question-item-detail">
                                        <label class="question-label-detail">
                                            ${i + 1}. ${q.question}
                                        </label>
                                        <input 
                                            type="text" 
                                            class="question-input-detail"
                                            id="answer-${i}"
                                            placeholder="${q.placeholder || q.example || ''}"
                                        />
                                        ${q.example ? `<span class="question-example-detail">💡 Beispiel: ${q.example}</span>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <h3 class="detail-section-title">ℹ️ Details</h3>
                        <div class="detail-meta-grid">
                            ${(prompt.tags || []).length > 0 ? `
                                <div class="meta-item-detail">
                                    <strong>🏷️ Tags:</strong>
                                    <div class="tags-inline">
                                        ${prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${prompt.outputs ? `
                                <div class="meta-item-detail">
                                    <strong>📄 Outputs:</strong> ${prompt.outputs.join(', ')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="prompt-detail-footer">
                    <button class="btn-secondary-large" onclick="window.promptsEngine.closeDetail()">
                        Abbrechen
                    </button>
                    <button class="btn-primary-large" onclick="window.promptsEngine.executePrompt()">
                        ▶️ Analyse starten
                    </button>
                </div>
            </div>
        `;
    }

    closeDetail() {
        this.currentView = 'titleList';
        this.currentPrompt = null;
        this.renderMainView();
    }

    formatPromptText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    copyPromptText() {
        if (!this.currentPrompt?.fullPromptText) return;
        navigator.clipboard.writeText(this.currentPrompt.fullPromptText)
            .then(() => this.showToast('✅ Prompt kopiert!'))
            .catch(err => console.error('Copy error:', err));
    }

    executePrompt() {
        const answers = {};
        const inputs = document.querySelectorAll('.question-input-detail');
        inputs.forEach((input, i) => { answers[i] = input.value; });
        this.userAnswers = answers;
        this.showExecutionView();
    }

    showExecutionView() {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        container.innerHTML = `
            <div class="execution-view-container">
                <div class="execution-header">
                    <button class="btn-back" onclick="window.promptsEngine.backToDetail()">← Zurück</button>
                    <h2>🚀 Analyse läuft</h2>
                </div>
                <div class="execution-result">
                    <p>⏳ Mock Execution - Integration mit AI API erforderlich</p>
                </div>
            </div>
        `;
        setTimeout(() => this.backToDetail(), 3000);
    }

    backToDetail() {
        this.currentView = 'splitDetail';
        this.renderMainView();
    }

    /* ========================================== */
    /* TASK QUEUE */
    /* ========================================== */

    renderTaskQueue() {
        if (this.taskQueue.length === 0) return '';
        return this.taskQueue.map(task => `
            <div class="task-card">
                <div class="task-icon">${this.getRoleIcon(this.getPromptById(task.agentId)?.category || 'Controller')}</div>
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span class="task-agent">${task.agent}</span>
                        <span class="task-score">${task.matchScore}% Match</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-task-start" onclick="window.promptsEngine.startTaskFromQueue('${task.agentId}')">
                        Starten
                    </button>
                    <button class="btn-task-remove" onclick="window.promptsEngine.removeTask(${task.id})">✕</button>
                </div>
            </div>
        `).join('');
    }

    startTaskFromQueue(promptId) {
        const prompt = this.getPromptById(promptId);
        if (prompt) {
            this.currentRole = prompt.category;
            this.selectPrompt(promptId);
        }
    }

    removeTask(taskId) {
        this.taskQueue = this.taskQueue.filter(t => t.id !== taskId);
        const container = document.getElementById('task-queue-container');
        if (container) container.innerHTML = this.renderTaskQueue();
        this.showToast('✅ Task entfernt');
    }

    /* ========================================== */
    /* FREE-FORM MODE */
    /* ========================================== */

    renderFreeFormMode() {
        return `
            <div class="freeform-builder">
                <div class="freeform-header">
                    <div class="freeform-icon">🆓</div>
                    <div class="freeform-content">
                        <h2 class="freeform-title">Custom App Builder</h2>
                        <p class="freeform-subtitle">Beschreibe frei was du brauchst</p>
                    </div>
                </div>
                <div class="freeform-input-section">
                    <textarea id="freeform-input" class="freeform-textarea" placeholder="Beschreibe dein Tool..."></textarea>
                    <button class="btn-freeform-generate" onclick="window.promptsEngine.startFreeForm()">
                        🚀 App generieren
                    </button>
                </div>
            </div>
        `;
    }

    startFreeForm() {
        alert('Free-Form Generation - Integration folgt');
    }

    /* ========================================== */
    /* UTILITY METHODS */
    /* ========================================== */

    setupEventListeners() {
        const searchInput = document.getElementById('title-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderMainView();
            });
        }
    }

    groupPromptsByRole() {
        const grouped = {};
        this.allPrompts.forEach(prompt => {
            const role = prompt.category || 'Andere';
            if (!grouped[role]) grouped[role] = [];
            grouped[role].push(prompt);
        });
        return grouped;
    }

    getPromptsByRole(role) {
        return this.allPrompts.filter(p => p.category === role);
    }

    getPromptById(id) {
        return this.allPrompts.find(p => p.id === id);
    }

    getAgentName(agentId) {
        const prompt = this.getPromptById(agentId);
        return prompt ? prompt.name : 'Agent';
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#1e293b;color:white;padding:1rem 1.5rem;border-radius:8px;z-index:10000;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    /* ========================================== */
    /* DATA LOADING - MULTI-ROLE SUPPORT */
    /* ========================================== */

    getAllPrompts() {
        const builtinPrompts = [
            {
                id: 'treasury_demo',
                name: 'Cash Pooling Konzept',
                category: 'Treasury',
                icon: '🏦',
                description: 'Cash Pooling optimieren.',
                tags: ['Liquidität'],
                duration: 30,
                role: 'Treasurer',
                goal: 'Liquidität steuern',
                outputs: ['Business Case'],
                fullPromptText: 'Du bist ein Treasurer...',
                questions: [{ question: 'Gesellschaften?', example: '7' }]
            },
            {
                id: 'controller_demo',
                name: 'Budget Variance Analysis',
                category: 'Controller',
                icon: '📊',
                description: 'Budget vs. Ist.',
                tags: ['Budget'],
                duration: 25,
                role: 'Controller',
                goal: 'Budget Review',
                outputs: ['Variance'],
                fullPromptText: 'Du bist ein Controller...',
                questions: [{ question: 'Jahr?', example: '2026' }]
            }
        ];

        // Load Controller Prompts
        const controllerPrompts = (typeof NOTION_PROMPTS !== 'undefined' && Array.isArray(NOTION_PROMPTS)) 
            ? NOTION_PROMPTS 
            : [];

        // Load Treasury Prompts
        const treasuryPrompts = (typeof TREASURY_PROMPTS !== 'undefined' && Array.isArray(TREASURY_PROMPTS)) 
            ? TREASURY_PROMPTS 
            : [];

        // Load CFO Prompts
        const cfoPrompts = (typeof CFO_PROMPTS !== 'undefined' && Array.isArray(CFO_PROMPTS)) 
            ? CFO_PROMPTS 
            : [];

        // Load M&A Prompts
        const maPrompts = (typeof MA_PROMPTS !== 'undefined' && Array.isArray(MA_PROMPTS)) 
            ? MA_PROMPTS 
            : [];

        // Load Bilanzbuchhalter Prompts
        const bilanzPrompts = (typeof BILANZ_PROMPTS !== 'undefined' && Array.isArray(BILANZ_PROMPTS)) 
            ? BILANZ_PROMPTS 
            : [];

        // Load Business Developer Prompts
        const bizdevPrompts = (typeof BIZDEV_PROMPTS !== 'undefined' && Array.isArray(BIZDEV_PROMPTS)) 
            ? BIZDEV_PROMPTS 
            : [];

        // Load Fachanwalt Prompts
        const lawyerPrompts = (typeof LAWYER_PROMPTS !== 'undefined' && Array.isArray(LAWYER_PROMPTS)) 
            ? LAWYER_PROMPTS 
            : [];

        console.log(`📦 Loaded ${controllerPrompts.length} Controller prompts`);
        console.log(`🏦 Loaded ${treasuryPrompts.length} Treasury prompts`);
        console.log(`📈 Loaded ${cfoPrompts.length} CFO prompts`);
        console.log(`🤝 Loaded ${maPrompts.length} M&A prompts`);
        console.log(`📚 Loaded ${bilanzPrompts.length} Bilanzbuchhalter prompts`);
        console.log(`🚀 Loaded ${bizdevPrompts.length} Business Developer prompts`);
        console.log(`⚖️ Loaded ${lawyerPrompts.length} Fachanwalt prompts`);

        return [...builtinPrompts, ...controllerPrompts, ...treasuryPrompts, ...cfoPrompts, ...maPrompts, ...bilanzPrompts, ...bizdevPrompts, ...lawyerPrompts];
    }
}

// Initialize
window.promptsEngine = new PromptsEngine();
console.log('✅ Prompts Engine loaded (Multi-Role Support)');
