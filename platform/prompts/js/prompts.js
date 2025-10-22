/* ========================================== */
/* PROMPTS ENGINE - COMPLETE MERGED VERSION */
/* Your Features + 126 Notion Prompts        */
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
        
        console.log('💡 Prompts Engine initialized (Hybrid + Free-Form + 126 Notion Prompts)');
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
                        onclick="window.promptsEngine.startTaskFromQueue(${task.id})"
                    >
                        ▶️ Starten
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
        
        // Add categories with counts
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
        
        return Object.entries(grouped).map(([category, prompts]) => `
            <div class="category-section">
                <div class="category-header">
                    <span class="category-icon">${this.getCategoryIcon(category)}</span>
                    <span class="category-title">${category}</span>
                    <span class="category-count">${prompts.length}</span>
                </div>
                <div class="prompts-grid">
                    ${prompts.map(prompt => this.renderPromptCard(prompt)).join('')}
                </div>
            </div>
        `).join('');
    }

    renderPromptCard(prompt) {
        return `
            <div class="prompt-card" onclick="window.promptsEngine.startPrompt('${prompt.id}')">
                <div class="prompt-card-header">
                    <span class="prompt-icon">${prompt.icon || this.getCategoryIcon(prompt.category)}</span>
                    <h3 class="prompt-name">${prompt.name}</h3>
                </div>
                <p class="prompt-description">${prompt.description}</p>
                <div class="prompt-tags">
                    ${(prompt.tags || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="prompt-footer">
                    <span class="prompt-duration">⏱️ ${prompt.duration || 20} Min</span>
                    <button class="btn-start-small">▶️ Starten</button>
                </div>
            </div>
        `;
    }

    /* ========================================== */
    /* FREE-FORM MODE */
    /* ========================================== */

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
                        ${this.renderFreeFormExamples()}
                    </div>
                </div>
            </div>
        `;
    }

    renderFreeFormExamples() {
        const examples = [
            {
                id: 'workingcapital',
                icon: '💰',
                title: 'Working Capital Tool',
                description: 'DSO, DIO, DPO Tracking + CCC Optimization'
            },
            {
                id: 'fxrisk',
                icon: '💱',
                title: 'FX Risk Calculator',
                description: 'Exposure Tracking + Hedging Recommendations'
            },
            {
                id: 'procurement',
                icon: '📦',
                title: 'Procurement Savings',
                description: 'Budget Tracking + Supplier Performance'
            },
            {
                id: 'costallocation',
                icon: '🧮',
                title: 'Cost Allocation Engine',
                description: 'Multi-Key Distribution + Automated Reports'
            }
        ];

        return examples.map(ex => `
            <div class="example-card" onclick="window.promptsEngine.useFreeFormExample('${ex.id}')">
                <div class="example-icon">${ex.icon}</div>
                <div class="example-title">${ex.title}</div>
                <div class="example-description">${ex.description}</div>
            </div>
        `).join('');
    }

    useFreeFormExample(exampleId) {
        const examples = {
            workingcapital: 'Ich brauche ein Working Capital Management Tool für 5 Gesellschaften. Ich will DSO, DIO, DPO tracken und den Cash Conversion Cycle optimieren. Zeige mir Trends über die letzten 12 Monate und gib mir Empfehlungen zur Verbesserung.',
            fxrisk: 'Erstelle mir einen FX Risk Calculator der automatisch meine Währungs-Exposures berechnet und Hedging-Empfehlungen gibt. Ich habe Transaktionen in EUR, USD, GBP und CHF.',
            procurement: 'Ich brauche ein Procurement Savings Tracking Tool mit Budget vs. Actual Vergleich und automatischer Lieferanten-Performance Analyse. Zeige Top 10 Lieferanten und Savings-Potenziale.',
            costallocation: 'Baue mir eine Cost Allocation Engine die Kosten nach verschiedenen Schlüsseln (FTE, Revenue, Square Meters) verteilt und automatisch Reports für 8 Kostenstellen generiert.'
        };

        const textarea = document.getElementById('freeform-input');
        if (textarea && examples[exampleId]) {
            textarea.value = examples[exampleId];
        }
    }

    startFreeFormGeneration() {
        const input = document.getElementById('freeform-input');
        const description = input?.value?.trim();
        
        if (!description) {
            this.showToast('⚠️ Bitte beschreibe dein Tool');
            return;
        }

        console.log('🚀 Starting free-form generation:', description);
        this.renderAppGenerationProgress();
        
        // Simulate app generation (replace with actual API call)
        setTimeout(() => {
            const mockReactCode = this.generateMockReactApp(description);
            this.renderGeneratedApp(mockReactCode);
        }, 3000);
    }

    generateMockReactApp(description) {
        // This would be replaced with actual API call to Claude/GPT
        return `
function App() {
    const [data, setData] = useState([
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 150 },
        { name: 'Mar', value: 120 }
    ]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Custom Finance App</h1>
            <p className="text-gray-600 mb-6">${description.substring(0, 100)}...</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="text-2xl font-bold">370</div>
                </div>
                <div className="bg-green-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Average</div>
                    <div className="text-2xl font-bold">123</div>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Growth</div>
                    <div className="text-2xl font-bold">+20%</div>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded">
                <h2 className="font-semibold mb-4">Data Overview</h2>
                <div className="space-y-2">
                    {data.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white rounded">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-blue-600">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
        `;
    }

    renderAppGenerationProgress() {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="app-generation-container">
                <div class="generation-icon">🚀</div>
                <h2 class="generation-title">Deine App wird generiert...</h2>
                <p class="generation-subtitle">AI erstellt gerade deine maßgeschneiderte Finance App</p>
                
                <div class="generation-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="app-progress-fill"></div>
                    </div>
                </div>
                
                <div class="generation-steps">
                    <div class="step active">
                        <div class="step-icon">✅</div>
                        <div class="step-text">Anforderungen analysiert</div>
                    </div>
                    <div class="step active">
                        <div class="step-icon">⚙️</div>
                        <div class="step-text">React Components generieren...</div>
                    </div>
                    <div class="step">
                        <div class="step-icon">🎨</div>
                        <div class="step-text">UI Design optimieren...</div>
                    </div>
                    <div class="step">
                        <div class="step-icon">🧪</div>
                        <div class="step-text">App testen...</div>
                    </div>
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
                    <button class="btn-primary" onclick="window.promptsEngine.downloadApp()">💾 Herunterladen</button>
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
        iframe.style.cssText = 'width:100%;height:600px;border:none;border-radius:12px;';
        
        preview.innerHTML = '';
        preview.appendChild(iframe);
        
        const doc = iframe.contentDocument;
        doc.open();
        doc.write(html);
        doc.close();
    }

    downloadApp() {
        if (!this.lastGeneratedCode) return;
        
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ALBO Finance App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState } = React;
        ${this.lastGeneratedCode}
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'albo-finance-app.html';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('✅ App heruntergeladen!');
    }

    /* ========================================== */
    /* PROMPT EXECUTION */
    /* ========================================== */

    startPrompt(promptId, context = null) {
        const prompt = this.getPromptById(promptId);
        if (!prompt) return;
        
        this.currentPrompt = prompt;
        this.currentView = 'execution';
        this.userAnswers = {};
        
        this.renderPromptExecution(context);
    }

    renderPromptExecution(context) {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        const prompt = this.currentPrompt;
        
        container.innerHTML = `
            <div class="prompt-execution-container">
                <div class="execution-header">
                    <button class="btn-back" onclick="window.promptsEngine.backToLibrary()">← Zurück</button>
                    <div class="execution-title">
                        <span class="execution-icon">${prompt.icon || this.getCategoryIcon(prompt.category)}</span>
                        <h2>${prompt.name}</h2>
                    </div>
                </div>
                
                <div class="execution-body">
                    <div class="prompt-meta-info">
                        <p class="prompt-goal"><strong>Ziel:</strong> ${prompt.goal || prompt.description}</p>
                        <div class="prompt-stats">
                            <span>⏱️ ~${prompt.duration || 20} Minuten</span>
                            <span>👤 ${prompt.role || prompt.category}</span>
                            ${prompt.outputs ? `<span>📄 ${prompt.outputs.join(', ')}</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="questions-section">
                        <h3>🔍 Deine Inputs</h3>
                        ${(prompt.questions || []).map((q, i) => `
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
                                ${q.example ? `<span class="question-example">Beispiel: ${q.example}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="execution-actions">
                        <button 
                            class="btn-execute-prompt"
                            onclick="window.promptsEngine.executePrompt()"
                        >
                            ▶️ Analyse starten
                        </button>
                        ${this.appGenerationEnabled ? `
                            <button 
                                class="btn-generate-app"
                                onclick="window.promptsEngine.generateAppFromPrompt()"
                            >
                                💻 Als App generieren
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    executePrompt() {
        const answers = {};
        const inputs = document.querySelectorAll('.question-input');
        
        inputs.forEach((input, i) => {
            answers[i] = input.value;
        });
        
        this.userAnswers = answers;
        console.log('🚀 Executing prompt:', this.currentPrompt.name, 'with answers:', answers);
        
        // TODO: Send to backend
        this.showToast('🚀 Prompt wird ausgeführt...');
        
        // Simulate execution
        setTimeout(() => {
            this.showToast('✅ Analyse abgeschlossen!');
        }, 2000);
    }

    generateAppFromPrompt() {
        console.log('💻 Generating app from prompt:', this.currentPrompt.name);
        
        this.renderAppGenerationProgress();
        
        setTimeout(() => {
            const mockCode = this.generateMockReactApp(this.currentPrompt.name);
            this.renderGeneratedApp(mockCode);
        }, 3000);
    }

    /* ========================================== */
    /* UTILITY METHODS */
    /* ========================================== */

    setupEventListeners() {
        const searchInput = document.getElementById('prompt-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.updateLibrary();
            });
        }
    }

    backToLibrary() {
        this.currentView = 'library';
        this.currentPrompt = null;
        this.currentMode = 'templates';
        this.renderMainView();
    }

    setCategory(category) {
        this.activeCategory = category;
        this.updateFilters();
        this.updateLibrary();
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
        
        // Update count
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
    /* PROMPTS DATA - MERGED VERSION */
    /* Your 2 prompts + 126 Notion prompts */
    /* ========================================== */

    getAllPrompts() {
        // Your existing prompts
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

        // Import 126 Notion prompts if available
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
console.log('✅ Prompts Engine loaded (Merged: Your Features + 126 Notion Prompts)');
