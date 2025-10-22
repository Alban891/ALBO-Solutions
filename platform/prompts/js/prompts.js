/* ========================================== */
/* ALBO PROMPTS - TRANSPARENCY & EXPLAINABILITY */
/* Full visibility into AI prompts and execution */
/* ========================================== */

class PromptsEngine {
    constructor() {
        this.taskQueue = [];
        this.allPrompts = this.getAllPrompts();
        this.currentView = 'library';
        this.currentMode = 'templates';
        this.currentPrompt = null;
        this.userAnswers = {};
        this.searchQuery = '';
        this.activeCategory = 'all';
        this.showTransparency = true; // Always show full transparency
        this.expandedCategories = []; // Track which categories are expanded
        
        console.log('💡 Prompts Engine initialized with Transparency Mode');
        console.log(`📚 Loaded ${this.allPrompts.length} prompts`);
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
        this.renderMainView();
    }

    renderTemplateMode() {
        return `
            <!-- Task Queue Section -->
            <div class="task-queue-section">
                <div class="task-queue-header">
                    <div class="task-queue-title">
                        📋 Deine Aufgaben
                        ${this.taskQueue.length > 0 ? `<span class="task-count-badge">${this.taskQueue.length}</span>` : ''}
                    </div>
                </div>
                <div id="task-queue-container">
                    ${this.renderTaskQueue()}
                </div>
            </div>
            
            <!-- Prompt Library Section -->
            <div class="prompt-library-section">
                <div class="library-header">
                    <div class="library-header-top">
                        <div>
                            <div class="library-title">
                                🔍 Alle Prompts
                                <span class="library-count">(${this.getFilteredPrompts().length} verfügbar)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="library-controls">
                        <div class="search-box">
                            <span class="search-icon">🔍</span>
                            <input 
                                type="text" 
                                class="search-input" 
                                id="prompt-search"
                                placeholder="Suche nach Prompts..."
                                value="${this.searchQuery}"
                            >
                        </div>
                        
                        <div class="category-filters">
                            ${this.renderCategoryFilters()}
                        </div>
                    </div>
                </div>
                
                <div class="library-body" id="library-body">
                    ${this.renderPromptLibrary()}
                </div>
            </div>
        `;
    }

    renderTaskQueue() {
        if (this.taskQueue.length === 0) {
            return `
                <div class="empty-queue">
                    <div class="empty-icon">📭</div>
                    <p class="empty-text">Keine Aufgaben in der Queue.</p>
                    <p class="empty-hint">Tasks vom Command Center erscheinen hier</p>
                </div>
            `;
        }
        
        return this.taskQueue.map(task => `
            <div class="task-card">
                <div class="task-icon">${this.getCategoryIcon(this.getPromptById(task.agentId)?.category || 'Controller')}</div>
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span class="task-agent">${task.agent}</span>
                        <span class="task-score">${task.matchScore}% Match</span>
                        <span class="task-source">📧 ${task.source === 'email' ? 'aus Email' : 'Manuell'}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button 
                        class="btn-task-start"
                        onclick="window.promptsEngine.showPromptDetailModal('${task.agentId}')"
                    >
                        🔍 Details ansehen
                    </button>
                    <button 
                        class="btn-task-remove"
                        onclick="window.promptsEngine.removeTaskFromQueue(${task.id})"
                    >
                        ✕
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCategoryFilters() {
        const categories = this.getCategoryCounts();
        const filters = [
            { id: 'all', label: 'Alle', count: this.allPrompts.length }
        ];
        
        Object.keys(categories).forEach(cat => {
            filters.push({
                id: cat.toLowerCase(),
                label: cat,
                count: categories[cat]
            });
        });
        
        return filters.map(filter => `
            <button 
                class="category-filter-btn ${this.activeCategory === filter.id ? 'active' : ''}"
                data-category="${filter.id}"
                onclick="window.promptsEngine.setCategory('${filter.id}')"
            >
                ${this.getCategoryIcon(filter.label)} ${filter.label} (${filter.count})
            </button>
        `).join('');
    }

    getCategoryCounts() {
        const counts = {};
        this.allPrompts.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
        return counts;
    }

    renderPromptLibrary() {
        const prompts = this.getFilteredPrompts();
        
        if (prompts.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>Keine Prompts gefunden</h3>
                    <p>Versuche es mit anderen Suchbegriffen oder Filtern</p>
                </div>
            `;
        }
        
        const grouped = this.groupPromptsByCategory(prompts);
        
        return Object.entries(grouped).map(([category, categoryPrompts]) => {
            const isExpanded = this.expandedCategories.includes(category);
            const displayPrompts = isExpanded ? categoryPrompts : categoryPrompts.slice(0, 6);
            const hasMore = categoryPrompts.length > 6;
            
            return `
                <div class="category-section">
                    <div class="category-header">
                        <span class="category-icon">${this.getCategoryIcon(category)}</span>
                        <span class="category-title">${category}</span>
                        <span class="category-count">${categoryPrompts.length}</span>
                    </div>
                    <div class="prompts-grid">
                        ${displayPrompts.map(prompt => this.renderCompactPromptCard(prompt)).join('')}
                    </div>
                    ${hasMore && !isExpanded ? `
                        <div class="show-more-container">
                            <button 
                                class="btn-show-more"
                                onclick="window.promptsEngine.expandCategory('${category}')"
                            >
                                ⬇️ Zeige ${categoryPrompts.length - 6} weitere ${category} Prompts
                            </button>
                        </div>
                    ` : ''}
                    ${isExpanded ? `
                        <div class="show-more-container">
                            <button 
                                class="btn-show-more"
                                onclick="window.promptsEngine.collapseCategory('${category}')"
                            >
                                ⬆️ Weniger anzeigen
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    expandCategory(category) {
        if (!this.expandedCategories.includes(category)) {
            this.expandedCategories.push(category);
        }
        this.updateLibrary();
    }

    collapseCategory(category) {
        this.expandedCategories = this.expandedCategories.filter(c => c !== category);
        this.updateLibrary();
    }

    renderCompactPromptCard(prompt) {
        return `
            <div class="prompt-card compact" onclick="window.promptsEngine.showPromptDetailModal('${prompt.id}')">
                <div class="prompt-card-header">
                    <span class="prompt-icon">${prompt.icon || this.getCategoryIcon(prompt.category)}</span>
                    <h3 class="prompt-name">${prompt.name}</h3>
                </div>
                <p class="prompt-description">${prompt.description.substring(0, 120)}${prompt.description.length > 120 ? '...' : ''}</p>
                <div class="prompt-tags">
                    ${(prompt.tags || []).slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="prompt-footer">
                    <span class="prompt-duration">⏱️ ${prompt.duration || 20} Min</span>
                    <button class="btn-details-small" onclick="event.stopPropagation(); window.promptsEngine.showPromptDetailModal('${prompt.id}')">
                        🔍 Details
                    </button>
                </div>
            </div>
        `;
    }

    /* ========================================== */
    /* TRANSPARENCY: PROMPT DETAIL MODAL */
    /* ========================================== */

    showPromptDetailModal(promptId) {
        const prompt = this.getPromptById(promptId);
        if (!prompt) return;

        this.currentPrompt = prompt;

        const modal = document.createElement('div');
        modal.id = 'prompt-detail-modal';
        modal.className = 'modal-overlay';
        modal.onclick = (e) => {
            if (e.target === modal) this.closePromptDetailModal();
        };

        modal.innerHTML = `
            <div class="modal-content modal-large" onclick="event.stopPropagation()">
                <!-- Header -->
                <div class="modal-header">
                    <div class="modal-title-section">
                        <span class="modal-icon">${prompt.icon || this.getCategoryIcon(prompt.category)}</span>
                        <div>
                            <h2 class="modal-title">${prompt.name}</h2>
                            <p class="modal-category">${prompt.category} • ${prompt.duration || 20} Min</p>
                        </div>
                    </div>
                    <button class="modal-close" onclick="window.promptsEngine.closePromptDetailModal()">✕</button>
                </div>

                <!-- Body -->
                <div class="modal-body">
                    <!-- Goal -->
                    <div class="prompt-goal-section">
                        <h3>🎯 Ziel</h3>
                        <p>${prompt.goal || prompt.description}</p>
                    </div>

                    <!-- Full Prompt Text (TRANSPARENCY!) -->
                    ${prompt.fullPromptText ? `
                        <div class="prompt-transparency-section">
                            <div class="transparency-header">
                                <h3>📋 Vollständiger Prompt (100% Transparenz)</h3>
                                <button 
                                    class="btn-copy-prompt" 
                                    onclick="window.promptsEngine.copyPromptText()"
                                >
                                    📋 Kopieren
                                </button>
                            </div>
                            <div class="prompt-full-text">
                                ${this.formatPromptText(prompt.fullPromptText)}
                            </div>
                            <div class="transparency-note">
                                💡 <strong>Das ist exakt der Prompt</strong>, der an die AI gesendet wird. 
                                Volle Transparenz für dich!
                            </div>
                        </div>
                    ` : ''}

                    <!-- Questions -->
                    ${prompt.questions && prompt.questions.length > 0 ? `
                        <div class="questions-section">
                            <h3>🔍 Deine Inputs</h3>
                            <p class="questions-intro">Diese Informationen werden in den Prompt eingefügt:</p>
                            ${prompt.questions.map((q, i) => `
                                <div class="question-item">
                                    <label class="question-label">
                                        ${i + 1}. ${q.question}
                                    </label>
                                    <input 
                                        type="text" 
                                        class="question-input"
                                        id="answer-${i}"
                                        placeholder="${q.placeholder || q.example}"
                                        data-question-index="${i}"
                                    />
                                    ${q.example ? `<span class="question-example">💡 Beispiel: ${q.example}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Tags & Meta -->
                    <div class="prompt-meta-section">
                        ${(prompt.tags || []).length > 0 ? `
                            <div class="meta-item">
                                <strong>🏷️ Tags:</strong>
                                ${prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${prompt.outputs ? `
                            <div class="meta-item">
                                <strong>📄 Outputs:</strong> ${prompt.outputs.join(', ')}
                            </div>
                        ` : ''}
                        ${prompt.role ? `
                            <div class="meta-item">
                                <strong>👤 Rolle:</strong> ${prompt.role}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="modal-footer">
                    <button 
                        class="btn-secondary" 
                        onclick="window.promptsEngine.closePromptDetailModal()"
                    >
                        Abbrechen
                    </button>
                    <button 
                        class="btn-execute-prompt"
                        onclick="window.promptsEngine.executePromptWithTransparency()"
                    >
                        ▶️ Analyse starten (mit voller Transparenz)
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    closePromptDetailModal() {
        const modal = document.getElementById('prompt-detail-modal');
        if (modal) modal.remove();
    }

    formatPromptText(text) {
        // Format the prompt text for display
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    copyPromptText() {
        if (!this.currentPrompt?.fullPromptText) return;

        navigator.clipboard.writeText(this.currentPrompt.fullPromptText)
            .then(() => {
                this.showToast('✅ Prompt in Zwischenablage kopiert!');
            })
            .catch(err => {
                console.error('Fehler beim Kopieren:', err);
            });
    }

    /* ========================================== */
    /* TRANSPARENT EXECUTION */
    /* ========================================== */

    executePromptWithTransparency() {
        const answers = {};
        const inputs = document.querySelectorAll('.question-input');
        
        inputs.forEach((input, i) => {
            answers[i] = input.value;
        });

        this.userAnswers = answers;
        
        // Close modal
        this.closePromptDetailModal();
        
        // Show transparency execution view
        this.renderTransparentExecution();
    }

    renderTransparentExecution() {
        const container = document.getElementById('prompts-content');
        if (!container) return;

        const prompt = this.currentPrompt;
        const filledPrompt = this.fillPromptWithAnswers(prompt, this.userAnswers);

        container.innerHTML = `
            <div class="execution-transparency-container">
                <!-- Header -->
                <div class="execution-header">
                    <button class="btn-back" onclick="window.promptsEngine.backToLibrary()">← Zurück</button>
                    <h2>🚀 Analyse läuft mit voller Transparenz</h2>
                </div>

                <!-- Transparency Timeline -->
                <div class="transparency-timeline">
                    <div class="timeline-step active">
                        <div class="step-icon">✅</div>
                        <div class="step-content">
                            <h4>1. Prompt vorbereitet</h4>
                            <p>Deine Inputs wurden in den Prompt eingefügt</p>
                        </div>
                    </div>

                    <div class="timeline-step active">
                        <div class="step-icon">📤</div>
                        <div class="step-content">
                            <h4>2. An AI gesendet</h4>
                            <p>Prompt wird an Claude Sonnet 4 gesendet</p>
                        </div>
                    </div>

                    <div class="timeline-step processing">
                        <div class="step-icon spinner-small"></div>
                        <div class="step-content">
                            <h4>3. AI verarbeitet</h4>
                            <p>Claude analysiert deine Anfrage...</p>
                        </div>
                    </div>

                    <div class="timeline-step">
                        <div class="step-icon">📥</div>
                        <div class="step-content">
                            <h4>4. Ergebnis wird angezeigt</h4>
                            <p>Warte auf Antwort...</p>
                        </div>
                    </div>
                </div>

                <!-- Your Inputs -->
                <div class="transparency-section">
                    <h3>📝 Deine Eingaben</h3>
                    <div class="inputs-display">
                        ${Object.entries(this.userAnswers).map(([idx, answer]) => {
                            const question = prompt.questions[idx];
                            return `
                                <div class="input-item">
                                    <strong>${question.question}</strong>
                                    <span class="input-value">${answer || '(nicht angegeben)'}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Sent Prompt (Full Transparency) -->
                <div class="transparency-section">
                    <h3>🤖 Exakter Prompt an AI gesendet</h3>
                    <div class="sent-prompt-display">
                        ${filledPrompt}
                    </div>
                    <button class="btn-copy-sent" onclick="window.promptsEngine.copySentPrompt()">
                        📋 Diesen Prompt kopieren
                    </button>
                </div>

                <!-- Progress -->
                <div class="execution-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="exec-progress-fill"></div>
                    </div>
                    <p class="progress-text">Warte auf AI Antwort...</p>
                </div>
            </div>
        `;

        // Animate progress
        this.animateExecutionProgress();

        // Simulate execution (replace with actual API call)
        setTimeout(() => {
            this.showExecutionResult();
        }, 4000);
    }

    fillPromptWithAnswers(prompt, answers) {
        let filledPrompt = prompt.fullPromptText || prompt.description;
        
        // Replace placeholders with actual answers
        Object.entries(answers).forEach(([idx, answer]) => {
            const question = prompt.questions?.[idx];
            if (question && answer) {
                const placeholder = `{${question.question}}`;
                filledPrompt = filledPrompt.replace(placeholder, `<mark>${answer}</mark>`);
            }
        });

        return this.formatPromptText(filledPrompt);
    }

    copySentPrompt() {
        const prompt = this.fillPromptWithAnswers(this.currentPrompt, this.userAnswers);
        const textOnly = prompt.replace(/<[^>]*>/g, '');
        
        navigator.clipboard.writeText(textOnly)
            .then(() => this.showToast('✅ Gesendeter Prompt kopiert!'))
            .catch(err => console.error('Copy error:', err));
    }

    animateExecutionProgress() {
        const fill = document.getElementById('exec-progress-fill');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            if (fill) fill.style.width = progress + '%';
            if (progress >= 100) clearInterval(interval);
        }, 80);
    }

    showExecutionResult() {
        const container = document.getElementById('prompts-content');
        if (!container) return;

        container.innerHTML = `
            <div class="execution-result-container">
                <div class="result-header">
                    <button class="btn-back" onclick="window.promptsEngine.backToLibrary()">← Zurück</button>
                    <h2>✅ Analyse abgeschlossen</h2>
                </div>

                <div class="result-body">
                    <div class="result-section">
                        <h3>📊 Ergebnis</h3>
                        <div class="result-content">
                            <p><strong>Mock Ergebnis:</strong> Die Analyse wurde erfolgreich durchgeführt.</p>
                            <p>In der Produktivversion würde hier die echte AI-Antwort erscheinen.</p>
                            <p><em>Integration mit Anthropic API oder OpenAI API erforderlich.</em></p>
                        </div>
                    </div>

                    <div class="transparency-note">
                        💡 <strong>Volle Transparenz:</strong> Du konntest sehen, welcher Prompt an die AI gesendet wurde 
                        und welche Inputs verwendet wurden. Explainable AI in Action!
                    </div>
                </div>

                <div class="result-actions">
                    <button class="btn-secondary" onclick="window.promptsEngine.backToLibrary()">
                        Zurück zur Übersicht
                    </button>
                    <button class="btn-primary" onclick="alert('Download-Funktion folgt')">
                        📥 Ergebnis herunterladen
                    </button>
                </div>
            </div>
        `;
    }

    /* ========================================== */
    /* FREE-FORM MODE (kept from original) */
    /* ========================================== */

    renderFreeFormMode() {
        return `
            <div class="freeform-builder">
                <div class="freeform-header">
                    <div class="freeform-icon">🆓</div>
                    <div class="freeform-content">
                        <h2 class="freeform-title">Custom App Builder</h2>
                        <p class="freeform-subtitle">
                            Beschreibe frei was du brauchst - AI erstellt dir eine maßgeschneiderte Finance App
                        </p>
                    </div>
                </div>
                
                <div class="freeform-input-section">
                    <label class="freeform-label">
                        💭 Was für ein Finance Tool brauchst du?
                    </label>
                    <textarea 
                        id="freeform-input"
                        class="freeform-textarea"
                        placeholder="Beschreibe dein Tool..."
                    ></textarea>
                    
                    <button 
                        id="freeform-generate-btn"
                        class="btn-freeform-generate"
                        onclick="window.promptsEngine.startFreeFormGeneration()"
                    >
                        🚀 App generieren
                    </button>
                </div>
            </div>
        `;
    }

    startFreeFormGeneration() {
        alert('Free-Form Generation - Integration folgt');
    }

    /* ========================================== */
    /* UTILITY METHODS */
    /* ========================================== */

    setupEventListeners() {
        const searchInput = document.getElementById('prompt-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.expandedCategories = []; // Reset expanded state on search
                this.updateLibrary();
            });
        }
    }

    backToLibrary() {
        this.currentView = 'library';
        this.currentPrompt = null;
        this.currentMode = 'templates';
        this.expandedCategories = [];
        this.renderMainView();
    }

    setCategory(category) {
        this.activeCategory = category;
        this.expandedCategories = []; // Reset expanded state on category change
        this.updateFilters();
        this.updateLibrary();
    }

    removeTaskFromQueue(taskId) {
        this.taskQueue = this.taskQueue.filter(t => t.id !== taskId);
        const container = document.getElementById('task-queue-container');
        if (container) container.innerHTML = this.renderTaskQueue();
        this.showToast('✅ Task entfernt');
    }

    updateFilters() {
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.activeCategory);
        });
    }

    updateLibrary() {
        const body = document.getElementById('library-body');
        if (body) {
            body.innerHTML = this.renderPromptLibrary();
        }
        
        const count = document.querySelector('.library-count');
        if (count) {
            count.textContent = `(${this.getFilteredPrompts().length} verfügbar)`;
        }
    }

    getFilteredPrompts() {
        let prompts = this.allPrompts;
        
        if (this.activeCategory !== 'all') {
            prompts = prompts.filter(p => p.category.toLowerCase() === this.activeCategory);
        }
        
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            prompts = prompts.filter(p => 
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)))
            );
        }
        
        return prompts;
    }

    groupPromptsByCategory(prompts) {
        const grouped = {};
        prompts.forEach(prompt => {
            if (!grouped[prompt.category]) grouped[prompt.category] = [];
            grouped[prompt.category].push(prompt);
        });
        return grouped;
    }

    getPromptById(id) {
        return this.allPrompts.find(p => p.id === id);
    }

    getAgentName(agentId) {
        const prompt = this.getPromptById(agentId);
        return prompt ? prompt.name : 'Agent';
    }

    getCategoryIcon(category) {
        const icons = { 
            'Treasury': '🏦', 
            'Controller': '📊', 
            'Tax': '💰',
            'Controlling': '📊',
            'Finance': '💰'
        };
        return icons[category] || '📚';
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#1e293b;color:white;padding:1rem 1.5rem;border-radius:8px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    /* ========================================== */
    /* DATA LOADING */
    /* ========================================== */

    getAllPrompts() {
        const builtinPrompts = [
            {
                id: 'treasury_cashpool',
                name: 'Cash Pooling Konzept',
                category: 'Treasury',
                icon: '🏦',
                description: 'Cash Pooling optimieren mit ROI.',
                tags: ['Liquidität', 'Optimierung'],
                duration: 30,
                role: 'Treasury Manager',
                goal: 'Liquidität steuern',
                outputs: ['IST-Analyse', 'Business Case'],
                fullPromptText: 'Du bist ein erfahrener Treasury Manager. Erstelle ein optimiertes Cash Pooling Konzept...',
                questions: [
                    { question: 'Gesellschaften?', example: '7 Gesellschaften', placeholder: 'Struktur...' },
                    { question: 'Banken?', example: 'Deutsche Bank', placeholder: 'Systeme...' },
                    { question: 'Constraints?', example: 'CZ nur virtuell', placeholder: 'Limits...' },
                    { question: 'Ziele?', example: 'Zinsoptimierung', placeholder: 'Goals...' },
                    { question: 'Timeline?', example: 'Q3 2025', placeholder: 'Zeitplan...' }
                ]
            },
            {
                id: 'controller_budget',
                name: 'Budget Variance Analysis',
                category: 'Controller',
                icon: '📊',
                description: 'Budget vs. Ist Analyse.',
                tags: ['Budget', 'Variance'],
                duration: 25,
                role: 'Controller',
                goal: 'Budget Review',
                outputs: ['Variance', 'Forecast'],
                fullPromptText: 'Du bist ein Controller. Führe eine Budget Variance Analysis durch...',
                questions: [
                    { question: 'Jahr?', example: '2026', placeholder: 'Jahr...' },
                    { question: 'Kostenstellen?', example: '15', placeholder: 'Anzahl...' }
                ]
            }
        ];

        const notionPrompts = (typeof NOTION_PROMPTS !== 'undefined' && Array.isArray(NOTION_PROMPTS)) 
            ? NOTION_PROMPTS 
            : [];

        if (notionPrompts.length > 0) {
            console.log(`📦 Loaded ${notionPrompts.length} Notion prompts`);
        }

        return [...builtinPrompts, ...notionPrompts];
    }
}

// Initialize
window.promptsEngine = new PromptsEngine();
console.log('✅ Prompts Engine loaded with Transparency & Explainability');
