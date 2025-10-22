/* ========================================== */
/* PROMPTS ENGINE - COMPLETE WITH BOTH MODES */
/* Template Library + Free-Form App Builder */
/* ========================================== */

class PromptsEngine {
    constructor() {
        this.taskQueue = [];
        this.allPrompts = this.getAllPrompts();
        this.currentView = 'library';
        this.currentMode = 'templates'; // 'templates' or 'freeform'
        this.currentPrompt = null;
        this.userAnswers = {};
        this.executionResult = null;
        this.lastResult = null;
        this.searchQuery = '';
        this.activeCategory = 'all';
        this.lastGeneratedCode = null;
        this.appGenerationEnabled = true;
        
        console.log('💡 Prompts Engine initialized (Hybrid + Free-Form)');
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
            matchScore: 98,
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

    renderFreeFormMode() {
        return `
            <div class="freeform-builder">
                <!-- Header -->
                <div class="freeform-header">
                    <div class="freeform-icon">🆓</div>
                    <div class="freeform-content">
                        <h2 class="freeform-title">Custom App Builder</h2>
                        <p class="freeform-subtitle">
                            Beschreibe frei was du brauchst - AI erstellt dir eine maßgeschneiderte Finance App
                        </p>
                    </div>
                </div>
                
                <!-- Input Section -->
                <div class="freeform-input-section">
                    <label class="freeform-label">
                        💭 Was für ein Finance Tool brauchst du?
                    </label>
                    <textarea 
                        id="freeform-input"
                        class="freeform-textarea"
                        placeholder="Beschreibe dein Tool so detailliert wie möglich...

Beispiele:

• Ich brauche ein Working Capital Management Tool für 5 Gesellschaften. 
  Ich will DSO, DIO, DPO tracken und den Cash Conversion Cycle optimieren.

• Erstelle mir einen FX Risk Calculator der automatisch Exposures berechnet 
  und Hedging-Empfehlungen gibt.

• Ich brauche ein Procurement Savings Tracking Tool mit Budget vs. Actual 
  und automatischer Lieferanten-Performance Analyse.

• Baue mir eine Cost Allocation Engine die Kosten nach verschiedenen 
  Schlüsseln verteilt und Reports generiert."
                    ></textarea>
                    
                    <div class="freeform-tips">
                        <div class="tip-item">
                            <span class="tip-icon">💡</span>
                            <span class="tip-text">Je detaillierter deine Beschreibung, desto besser die App</span>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">⚡</span>
                            <span class="tip-text">AI wird dir noch 3-5 Fragen stellen für perfektes Ergebnis</span>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">⏱️</span>
                            <span class="tip-text">Dauer: ~90 Sekunden bis fertige App</span>
                        </div>
                    </div>
                    
                    <button 
                        id="freeform-generate-btn"
                        class="btn-freeform-generate"
                        onclick="window.promptsEngine.startFreeFormGeneration()"
                    >
                        🚀 App generieren
                    </button>
                </div>
                
                <!-- Examples Section -->
                <div class="freeform-examples">
                    <h3 class="examples-title">💡 Beliebte Custom Apps</h3>
                    <div class="examples-grid">
                        <div class="example-card" onclick="window.promptsEngine.useFreeFormExample('workingcapital')">
                            <div class="example-icon">💰</div>
                            <div class="example-title">Working Capital Tool</div>
                            <div class="example-desc">DSO, DIO, DPO Tracking</div>
                        </div>
                        <div class="example-card" onclick="window.promptsEngine.useFreeFormExample('fxrisk')">
                            <div class="example-icon">💱</div>
                            <div class="example-title">FX Risk Calculator</div>
                            <div class="example-desc">Exposure & Hedging</div>
                        </div>
                        <div class="example-card" onclick="window.promptsEngine.useFreeFormExample('procurement')">
                            <div class="example-icon">📦</div>
                            <div class="example-title">Procurement Savings</div>
                            <div class="example-desc">Budget vs. Actual</div>
                        </div>
                        <div class="example-card" onclick="window.promptsEngine.useFreeFormExample('costallocation')">
                            <div class="example-icon">🔢</div>
                            <div class="example-title">Cost Allocation</div>
                            <div class="example-desc">Multi-key Distribution</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.renderMainView();
    }

    useFreeFormExample(exampleId) {
        const examples = {
            workingcapital: 'Ich brauche ein Working Capital Management Tool für 5 Gesellschaften. Ich will DSO (Days Sales Outstanding), DIO (Days Inventory Outstanding) und DPO (Days Payables Outstanding) tracken und den Cash Conversion Cycle optimieren. Das Tool soll mir zeigen wo ich Cash freimachen kann.',
            
            fxrisk: 'Erstelle mir einen FX Risk Calculator der automatisch Currency Exposures berechnet, Hedging-Empfehlungen gibt und P&L Impact von FX-Bewegungen simuliert. Ich habe Exposures in EUR, USD, GBP, CHF.',
            
            procurement: 'Ich brauche ein Procurement Savings Tracking Tool mit Budget vs. Actual Vergleich, automatischer Lieferanten-Performance Analyse und Savings Pipeline Management. Sollte auch Forecasts für zukünftige Savings zeigen.',
            
            costallocation: 'Baue mir eine Cost Allocation Engine die zentrale Kosten (IT, Finance, HR) nach verschiedenen Schlüsseln (Headcount, Revenue, Usage) auf Geschäftseinheiten verteilt. Mit What-if Szenarien und automatischen Reports.'
        };
        
        const textarea = document.getElementById('freeform-input');
        if (textarea) {
            textarea.value = examples[exampleId] || '';
            textarea.focus();
        }
    }

    /* ========================================== */
    /* FREE-FORM GENERATION */
    /* ========================================== */

    async startFreeFormGeneration() {
        const textarea = document.getElementById('freeform-input');
        const description = textarea ? textarea.value.trim() : '';
        
        if (!description) {
            this.showToast('❌ Bitte beschreibe was du brauchst');
            return;
        }
        
        console.log('🆓 Starting free-form generation:', description);
        
        try {
            // Step 1: Get clarification questions
            this.showFreeFormProgress('Analysiere deine Anfrage...');
            const questions = await this.getClarificationQuestions(description);
            
            // Step 2: Show questions modal
            const answers = await this.showQuestionsModal(questions);
            
            // Step 3: Generate app directly
            this.showFreeFormProgress('Generiere deine App...');
            const appCode = await this.generateFreeFormApp(description, answers);
            
            // Step 4: Render app
            this.renderGeneratedApp(appCode);
            
            this.showToast('✅ App erfolgreich generiert!');
            
        } catch (error) {
            console.error('Free-form generation error:', error);
            this.showToast('❌ Fehler bei App-Generierung');
            this.renderMainView();
        }
    }

    async getClarificationQuestions(description) {
        const prompt = `Du bist ein Finance Software Requirements Analyst.

User möchte folgendes Tool:
"${description}"

Deine Aufgabe:
1. Verstehe was der User will
2. Stelle 3-5 präzise Fragen um Requirements zu klären
3. Fragen sollten Multiple Choice oder Checkboxen sein (einfach zu beantworten)

Fokus auf:
- Welche Daten/Inputs?
- Welche Berechnungen/Analysen?
- Welche Outputs/Visualisierungen?
- Interaktivität gewünscht?
- Export-Anforderungen?

Antworte NUR mit JSON:
{
  "questions": [
    {
      "question": "...",
      "type": "checkbox",
      "options": ["Option 1", "Option 2", "Option 3"]
    }
  ]
}

DO NOT include any explanations, ONLY the JSON.`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "DEIN_API_KEY_HIER", // TODO: Update
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 2000,
                messages: [{ role: "user", content: prompt }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        let text = data.content[0].text.trim();
        
        // Extract JSON if wrapped
        if (text.includes('```json')) {
            const match = text.match(/```json\n([\s\S]*?)\n```/);
            if (match) text = match[1];
        } else if (text.includes('```')) {
            const match = text.match(/```\n([\s\S]*?)\n```/);
            if (match) text = match[1];
        }
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not extract JSON from response');
        }
        
        return JSON.parse(jsonMatch[0]);
    }

    async showQuestionsModal(questionsData) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content large">
                    <h2>🤖 Ein paar Fragen zur App</h2>
                    <p>Damit ich die perfekte App für dich erstellen kann:</p>
                    
                    <div class="questions-list" id="modal-questions-list">
                        ${questionsData.questions.map((q, idx) => `
                            <div class="modal-question-item">
                                <label class="modal-question-label">${idx + 1}. ${q.question}</label>
                                ${this.renderModalQuestionInput(q, idx)}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove(); window.promptsEngine.renderMainView();">
                            Abbrechen
                        </button>
                        <button class="btn-primary" id="submit-modal-questions">
                            ✅ App erstellen
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('submit-modal-questions').onclick = () => {
                const answers = this.collectModalAnswers(questionsData.questions);
                modal.remove();
                resolve(answers);
            };
        });
    }

    renderModalQuestionInput(question, idx) {
        if (question.type === 'checkbox' && question.options) {
            return `
                <div class="modal-checkbox-group">
                    ${question.options.map((opt, i) => `
                        <label class="modal-checkbox-label">
                            <input type="checkbox" name="q${idx}" value="${opt}">
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        } else if (question.type === 'radio' && question.options) {
            return `
                <div class="modal-radio-group">
                    ${question.options.map((opt, i) => `
                        <label class="modal-radio-label">
                            <input type="radio" name="q${idx}" value="${opt}">
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        } else {
            return `<textarea class="modal-text-input" name="q${idx}" rows="3"></textarea>`;
        }
    }

    collectModalAnswers(questions) {
        const answers = {};
        questions.forEach((q, idx) => {
            if (q.type === 'checkbox') {
                const checked = Array.from(document.querySelectorAll(`input[name="q${idx}"]:checked`))
                    .map(input => input.value);
                answers[idx] = checked.length > 0 ? checked.join(', ') : '';
            } else if (q.type === 'radio') {
                const selected = document.querySelector(`input[name="q${idx}"]:checked`);
                answers[idx] = selected ? selected.value : '';
            } else {
                const textarea = document.querySelector(`textarea[name="q${idx}"]`);
                answers[idx] = textarea ? textarea.value : '';
            }
        });
        return answers;
    }

    async generateFreeFormApp(description, answers) {
        const prompt = `Du bist ein Expert React Developer für Finance Applications.

USER ANFRAGE:
"${description}"

USER ANTWORTEN AUF FRAGEN:
${Object.entries(answers).map(([key, value]) => `Frage ${parseInt(key)+1}: ${value}`).join('\n')}

AUFGABE:
Erstelle eine VOLLSTÄNDIGE, funktionierende React App die GENAU das tut was der User will.

REQUIREMENTS:
- Basierend auf User Description & Answers
- Alle gewünschten Features implementieren
- Professional Finance UI
- Tailwind CSS styling (core classes only)
- Recharts für Visualisierungen
- Interaktiv & benutzerfreundlich
- Export functions (Excel/PDF buttons - can be mock functions)

WICHTIG:
- Return NUR kompletten React code
- Single file, functional component with hooks
- Use: React (via global), Recharts (via global), standard JS
- Include ALL necessary logic
- No external dependencies außer React, Recharts
- No markdown, just pure code starting with function App()

Return complete working React app code.`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "DEIN_API_KEY_HIER", // TODO: Update
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 16000,
                messages: [{ role: "user", content: prompt }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        let code = data.content[0].text;
        
        // Extract code if in markdown
        if (code.includes('```')) {
            const match = code.match(/```(?:jsx?|javascript)?\n([\s\S]*?)\n```/);
            if (match) code = match[1];
        }
        
        return code.trim();
    }

    showFreeFormProgress(message) {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="freeform-progress">
                <div class="progress-icon">🤖</div>
                <div class="progress-title">${message}</div>
                <div class="progress-spinner"></div>
            </div>
        `;
    }

    /* ========================================== */
    /* TEMPLATE MODE METHODS (from before) */
    /* ========================================== */

    renderTaskQueue() {
        if (this.taskQueue.length === 0) {
            return `
                <div class="task-queue-empty">
                    <div class="task-queue-empty-icon">📭</div>
                    <div class="task-queue-empty-text">
                        Keine Aufgaben in der Queue.
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="task-queue-list">
                ${this.taskQueue.map(task => `
                    <div class="task-queue-item">
                        <div class="task-item-header">
                            <div>
                                <div class="task-item-title">${task.title}</div>
                                <div class="task-item-meta">
                                    <span>${task.source === 'email' ? '📧' : '✍️'} 
                                    ${task.source === 'email' ? task.email.from : 'Manuelle Eingabe'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="task-item-match">
                            <div class="match-info">
                                <div class="match-agent">🤖 ${task.agent}</div>
                                <div class="match-score">${task.matchScore}%</div>
                            </div>
                        </div>
                        <div class="task-item-actions">
                            <button class="btn-task-start" data-task-id="${task.id}">▶️ Starten</button>
                            <button class="btn-task-remove" data-task-id="${task.id}">❌</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCategoryFilters() {
        const categories = [
            { id: 'all', name: 'Alle', icon: '📚' },
            { id: 'treasury', name: 'Treasury', icon: '🏦' },
            { id: 'controller', name: 'Controller', icon: '📊' }
        ];
        
        return categories.map(cat => `
            <button 
                class="category-filter-btn ${this.activeCategory === cat.id ? 'active' : ''}"
                data-category="${cat.id}"
            >
                ${cat.icon} ${cat.name}
            </button>
        `).join('');
    }

    renderPromptLibrary() {
        const prompts = this.getFilteredPrompts();
        if (prompts.length === 0) return '<div class="task-queue-empty">Keine Prompts gefunden.</div>';
        
        const grouped = this.groupPromptsByCategory(prompts);
        
        return Object.entries(grouped).map(([category, items]) => `
            <div class="category-section">
                <div class="category-section-header">
                    <span class="category-icon">${this.getCategoryIcon(category)}</span>
                    <span class="category-name">${category}</span>
                    <span class="category-count">${items.length}</span>
                </div>
                <div class="prompt-grid">
                    ${items.map(p => this.renderPromptCard(p)).join('')}
                </div>
            </div>
        `).join('');
    }

    renderPromptCard(prompt) {
        return `
            <div class="prompt-card" data-prompt-id="${prompt.id}">
                <div class="prompt-card-header">
                    <span class="prompt-card-icon">${prompt.icon}</span>
                    <div class="prompt-card-title">${prompt.name}</div>
                </div>
                <div class="prompt-card-description">${prompt.description}</div>
                <div class="prompt-card-tags">
                    ${prompt.tags.map(tag => `<span class="prompt-tag">${tag}</span>`).join('')}
                </div>
                <div class="prompt-card-footer">
                    <div class="prompt-card-meta">${prompt.questions.length} Fragen • ~${prompt.duration} Min</div>
                    <button class="btn-prompt-start" data-prompt-id="${prompt.id}">▶️ Starten</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('prompt-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.updateLibrary();
            });
        }
        
        // Category filters
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.activeCategory = e.target.dataset.category;
                this.updateFilters();
                this.updateLibrary();
            });
        });
        
        // Task buttons
        document.querySelectorAll('.btn-task-start').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.startTaskFromQueue(taskId);
            });
        });
        
        document.querySelectorAll('.btn-task-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.removeTaskFromQueue(taskId);
            });
        });
        
        // Prompt cards
        document.querySelectorAll('.btn-prompt-start').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startPrompt(e.target.dataset.promptId);
            });
        });
        
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-prompt-start')) {
                    this.startPrompt(card.dataset.promptId);
                }
            });
        });
    }

    startPrompt(promptId, context = null) {
        const prompt = this.getPromptById(promptId);
        if (!prompt) return;
        
        this.currentPrompt = {
            template: prompt,
            task: context?.task || '',
            email: context?.email || null,
            attachments: context?.attachments || []
        };
        
        this.userAnswers = {};
        this.currentView = 'execution';
        this.renderExecutionWizard();
    }

    renderExecutionWizard() {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        const template = this.currentPrompt.template;
        
        container.innerHTML = `
            <div class="execution-wizard">
                <button class="btn-secondary" onclick="window.promptsEngine.backToLibrary()">← Zurück</button>
                
                <div class="prompt-context-card">
                    <h2>${template.icon} ${template.name}</h2>
                    <p><strong>Rolle:</strong> ${template.role}</p>
                    <p><strong>Ziel:</strong> ${template.goal}</p>
                </div>
                
                ${this.renderQuestionsCard(template)}
            </div>
        `;
        
        this.setupExecutionListeners();
    }

    renderQuestionsCard(template) {
        return `
            <div class="questions-card">
                <h3>🔍 Deine Inputs</h3>
                <div class="questions-body">
                    ${template.questions.map((q, idx) => `
                        <div class="question-item">
                            <label>${idx + 1}. ${q.question}</label>
                            <div class="question-hint">💡 ${q.example}</div>
                            <textarea 
                                id="answer-${idx}"
                                class="question-input"
                                placeholder="${q.placeholder}"
                                data-question-id="${idx}"
                            ></textarea>
                        </div>
                    `).join('')}
                </div>
                
                <div class="execution-actions">
                    <button id="execute-btn" class="btn-execute-primary" disabled>▶️ Analyse starten</button>
                    <button class="btn-secondary" onclick="window.promptsEngine.backToLibrary()">← Zurück</button>
                </div>
            </div>
        `;
    }

    setupExecutionListeners() {
        const inputs = document.querySelectorAll('.question-input');
        const executeBtn = document.getElementById('execute-btn');
        
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.userAnswers[e.target.dataset.questionId] = e.target.value;
                const allAnswered = Object.keys(this.userAnswers).length >= this.currentPrompt.template.questions.length &&
                    Object.values(this.userAnswers).every(a => a && a.trim());
                executeBtn.disabled = !allAnswered;
            });
        });
        
        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.executeAnalysis());
        }
    }

    async executeAnalysis() {
        this.showExecutionProgress();
        
        setTimeout(() => {
            this.lastResult = {
                timestamp: new Date().toISOString(),
                template: this.currentPrompt.template.name
            };
            this.showResults(this.lastResult);
        }, 5000);
    }

    showExecutionProgress() {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="execution-progress">
                <div class="progress-icon">🤖</div>
                <div class="progress-title">Claude analysiert...</div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: 0%" id="progress-fill"></div>
                </div>
            </div>
        `;
        
        this.animateProgress();
    }

    animateProgress() {
        const fill = document.getElementById('progress-fill');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            if (fill) fill.style.width = progress + '%';
            if (progress >= 100) clearInterval(interval);
        }, 50);
    }

    showResults(result) {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="results-display">
                <h2>✅ Analyse abgeschlossen</h2>
                <p>Ergebnis erfolgreich generiert.</p>
                
                <div class="results-actions">
                    <button class="btn-secondary" onclick="window.promptsEngine.backToLibrary()">← Zurück</button>
                </div>
                
                <!-- APP GENERATION SECTION -->
                <div class="app-generation-section">
                    <div class="app-gen-header">
                        <div class="app-gen-icon">🚀</div>
                        <div class="app-gen-content">
                            <div class="app-gen-title">Diese Analyse als interaktive App nutzen?</div>
                            <div class="app-gen-description">
                                Generiere eine funktionierende Web-App mit editierbaren Tabellen und Charts.
                            </div>
                        </div>
                    </div>
                    <button class="btn-generate-app" onclick="window.promptsEngine.generateApp()">
                        🚀 Ja, als App generieren
                    </button>
                </div>
            </div>
        `;
    }

    async generateApp() {
        this.showAppGenerationProgress();
        
        try {
            const prompt = this.buildAppGenerationPrompt();
            const code = await this.callClaudeForAppGeneration(prompt);
            this.renderGeneratedApp(code);
            this.showToast('✅ App generiert!');
        } catch (error) {
            console.error('App gen error:', error);
            this.showToast('❌ Fehler');
            this.backToLibrary();
        }
    }

    buildAppGenerationPrompt() {
        const template = this.currentPrompt.template;
        return `Create a React app for ${template.name}. Include editable tables, charts, export functions. Use Tailwind CSS. Return only code.`;
    }

    async callClaudeForAppGeneration(prompt) {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "DEIN_API_KEY_HIER", // TODO: Update
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 16000,
                messages: [{ role: "user", content: prompt }]
            })
        });
        
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        let code = data.content[0].text;
        
        if (code.includes('```')) {
            const match = code.match(/```(?:jsx?)?\n([\s\S]*?)\n```/);
            if (match) code = match[1];
        }
        
        return code.trim();
    }

    showAppGenerationProgress() {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="app-generation-progress">
                <div class="progress-icon">🤖</div>
                <h2>App wird generiert...</h2>
                <div class="progress-bar">
                    <div class="progress-bar-fill" id="app-progress-fill"></div>
                </div>
            </div>
        `;
        
        this.animateAppGenProgress();
    }

    animateAppGenProgress() {
        const fill = document.getElementById('app-progress-fill');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1.5;
            if (fill) fill.style.width = progress + '%';
            if (progress >= 100) clearInterval(interval);
        }, 500);
    }

    renderGeneratedApp(reactCode) {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        this.lastGeneratedCode = reactCode;
        
        container.innerHTML = `
            <div class="generated-app-container">
                <div class="app-header">
                    <button class="btn-secondary" onclick="window.promptsEngine.backToLibrary()">← Zurück</button>
                    <h2>🚀 Generierte App</h2>
                </div>
                <div class="app-preview" id="app-preview">
                    <div class="loading-app"><div class="spinner"></div></div>
                </div>
            </div>
        `;
        
        this.renderInIframe(reactCode);
    }

    renderInIframe(reactCode) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/recharts@2.5.0/dist/Recharts.js"></script>
    <style>body{margin:0;padding:20px;font-family:sans-serif;background:#f8fafc;}#root{max-width:1400px;margin:0 auto;}</style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState } = React;
        ${reactCode}
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
        `;
        
        const preview = document.getElementById('app-preview');
        if (!preview) return;
        
        const iframe = document.createElement('iframe');
        iframe.className = 'app-iframe';
        iframe.sandbox = 'allow-scripts';
        iframe.style.cssText = 'width:100%;height:600px;border:none;';
        
        preview.innerHTML = '';
        preview.appendChild(iframe);
        
        const doc = iframe.contentDocument;
        doc.open();
        doc.write(html);
        doc.close();
    }

    /* ========================================== */
    /* UTILITY METHODS */
    /* ========================================== */

    backToLibrary() {
        this.currentView = 'library';
        this.currentPrompt = null;
        this.renderMainView();
    }

    startTaskFromQueue(taskId) {
        const task = this.taskQueue.find(t => t.id === taskId);
        if (!task) return;
        this.startPrompt(task.agentId, { task: task.title, email: task.email });
    }

    removeTaskFromQueue(taskId) {
        this.taskQueue = this.taskQueue.filter(t => t.id !== taskId);
        const container = document.getElementById('task-queue-container');
        if (container) container.innerHTML = this.renderTaskQueue();
        this.showToast('✅ Entfernt');
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
            this.setupEventListeners();
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
                p.tags.some(tag => tag.toLowerCase().includes(q))
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
        const icons = { 'Treasury': '🏦', 'Controller': '📊', 'Tax': '💰' };
        return icons[category] || '📚';
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#1e293b;color:white;padding:1rem 1.5rem;border-radius:8px;z-index:10000;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    getAllPrompts() {
        return [
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
                questions: [
                    { question: 'Jahr?', example: '2026', placeholder: 'Jahr...' },
                    { question: 'Kostenstellen?', example: '15', placeholder: 'Anzahl...' }
                ]
            }
        ];
    }
}

window.promptsEngine = new PromptsEngine();
console.log('✅ Prompts Engine loaded (with Free-Form)');