/* ========================================== */
/* ALBO PROMPTS - 3-LEVEL HIERARCHY */
/* Multi-Role with MECE Theme Structure */
/* ========================================== */

class PromptsEngine {
    constructor() {
        this.taskQueue = [];
        this.allPrompts = this.getAllPrompts();
        this.currentView = 'roles';  // 'roles' | 'themes' | 'prompts'
        this.currentMode = 'templates';
        this.currentRole = null;
        this.currentTheme = null;
        this.currentPrompt = null;
        this.userAnswers = {};
        this.searchQuery = '';
        
        // MECE Theme Mapping
        this.themeMapping = this.getThemeMapping();
        
        console.log('💡 Prompts Engine initialized (3-Level Hierarchy)');
        console.log(`📚 Loaded ${this.allPrompts.length} prompts across ${this.getRoleCount()} roles`);
    }

    getThemeMapping() {
        return {
            "Controller": {
                "icon": "📊",
                "themes": [
                    {"id": "kostenrechnung", "name": "💰 Kostenrechnung", "keywords": ["Kostenartenrechnung", "Kostenstellenrechnung", "Kostenträgerrechnung"]},
                    {"id": "kalkulation", "name": "📐 Kalkulation", "keywords": ["Zuschlagskalkulation", "Maschinenstundensatz", "Herstellkosten", "Kalkulation für"]},
                    {"id": "deckungsbeitrag", "name": "📊 Deckungsbeitragsrechnung", "keywords": ["Deckungsbeitrag", "Break-Even"]},
                    {"id": "budgetierung", "name": "📈 Budgetierung & Planung", "keywords": ["Budget", "Planung", "Bottom-Up", "Top-Down"]},
                    {"id": "forecasting", "name": "🔮 Forecasting & Rolling", "keywords": ["Forecast", "Rolling", "Hochrechnung", "Prognose"]},
                    {"id": "variance", "name": "📉 Variance & Abweichungsanalyse", "keywords": ["Abweichung", "Variance", "Plan-Ist"]},
                    {"id": "reporting", "name": "💼 Management Reporting", "keywords": ["Report", "Reporting", "Dashboard", "KPI"]},
                    {"id": "prozesse", "name": "🔄 Prozessoptimierung", "keywords": ["Prozess", "Digitalisierung", "Agile", "Activity-Based"]}
                ]
            },
            "Treasury": {
                "icon": "🏦",
                "themes": [
                    {"id": "cash", "name": "💵 Cash & Liquiditätsmanagement", "keywords": ["Cash", "Liquidität", "Working Capital"]},
                    {"id": "banking", "name": "🏦 Banking & Bankbeziehungen", "keywords": ["Bank", "Konto", "KYC"]},
                    {"id": "fx", "name": "💱 FX & Currency Management", "keywords": ["FX", "Währung", "Currency", "Hedging"]},
                    {"id": "financing", "name": "💰 Financing & Debt", "keywords": ["Finanzierung", "Kredit", "Debt", "Darlehen"]},
                    {"id": "risk", "name": "📊 Financial Risk Management", "keywords": ["Risiko", "Risk", "Exposure"]},
                    {"id": "esg", "name": "🌱 ESG & Sustainable Finance", "keywords": ["ESG", "Sustainability", "Green", "CSRD"]},
                    {"id": "compliance", "name": "⚖️ Compliance & Regulatory", "keywords": ["Compliance", "AML", "KYC", "Regulatory"]},
                    {"id": "analytics", "name": "📈 Treasury Analytics", "keywords": ["Analytics", "Reporting", "Performance"]},
                    {"id": "payments", "name": "💳 Payment Management", "keywords": ["Payment", "Zahlung", "SEPA", "Transaction"]},
                    {"id": "operations", "name": "🔧 Treasury Operations", "keywords": ["TMS", "System", "Process", "Organisation"]}
                ]
            },
            "CFO": {
                "icon": "📈",
                "themes": [
                    {"id": "strategy", "name": "🎯 Strategische Finanzführung", "keywords": ["Strategie", "Strategic", "Kapitalallokation"]},
                    {"id": "ma", "name": "🤝 M&A & Corporate Development", "keywords": ["M&A", "Deal", "Akquisition", "Carve"]},
                    {"id": "partnering", "name": "💼 Business Partnering", "keywords": ["Business Partner", "Stakeholder", "Cross-functional"]},
                    {"id": "ir", "name": "📊 Investor Relations", "keywords": ["Investor", "IR", "Capital Market", "Shareholder"]},
                    {"id": "finance", "name": "🏗️ Corporate Finance", "keywords": ["Finanzierung", "Kapitalstruktur", "Rating"]},
                    {"id": "transformation", "name": "🌍 Transformation & Digitalisierung", "keywords": ["Transformation", "Digital", "Change"]},
                    {"id": "people", "name": "👥 People & Organization", "keywords": ["People", "Talent", "Team", "Organization"]}
                ]
            },
            "M&A": {
                "icon": "🤝",
                "themes": [
                    {"id": "origination", "name": "🎯 Deal Origination & Strategie", "keywords": ["Target", "Screening", "Pipeline", "Origination"]},
                    {"id": "dd", "name": "🔍 Due Diligence", "keywords": ["Due Diligence", "DD", "Prüfung"]},
                    {"id": "valuation", "name": "💰 Valuation & Pricing", "keywords": ["Bewertung", "Valuation", "DCF", "Multiple"]},
                    {"id": "structuring", "name": "📄 Transaction Structuring", "keywords": ["Struktur", "SPA", "Earn-Out", "Deal Structure"]},
                    {"id": "pmi", "name": "🏗️ Post-Merger Integration", "keywords": ["Integration", "PMI", "Day-1", "Synergien"]},
                    {"id": "carveout", "name": "🔄 Carve-Outs & Divestments", "keywords": ["Carve-Out", "Divestment", "Separation", "Exit"]},
                    {"id": "governance", "name": "💼 M&A Governance", "keywords": ["Governance", "Prozess", "Risk Management"]},
                    {"id": "analytics", "name": "📊 M&A Analytics", "keywords": ["Analytics", "Performance", "Tracking", "Lessons"]}
                ]
            },
            "Bilanzbuchhalter": {
                "icon": "📚",
                "themes": [
                    {"id": "hgb", "name": "💼 HGB-Bilanzierung", "keywords": ["HGB", "§ 247", "§ 253", "Anlagevermögen nach HGB", "Umlaufvermögen nach HGB"]},
                    {"id": "ifrs", "name": "🌍 IFRS-Bilanzierung", "keywords": ["IFRS", "IAS", "Fair Value", "Impairment"]},
                    {"id": "jahresabschluss", "name": "📊 Jahresabschluss", "keywords": ["Jahresabschluss", "Bilanz erstellen", "GuV", "Abschluss"]},
                    {"id": "rueckstellungen", "name": "💰 Rückstellungen", "keywords": ["Rückstellung", "Pension", "Drohverlust"]},
                    {"id": "anhang", "name": "📄 Anhang & Lagebericht", "keywords": ["Anhang", "Lagebericht", "§ 285", "Nachtrag"]},
                    {"id": "konzern", "name": "🏢 Konzernabschluss", "keywords": ["Konzern", "Konsolidierung", "Kapitalkonsolidierung"]},
                    {"id": "analyse", "name": "📈 Bilanzanalyse", "keywords": ["Analyse", "Kennzahl", "Bilanzstruktur", "Rating"]},
                    {"id": "sonder", "name": "🔄 Sonderthemen", "keywords": ["Währung", "Latente Steuer", "Kapitalfluss", "Eigenkapitalspiegel"]}
                ]
            },
            "Business Developer": {
                "icon": "🚀",
                "themes": [
                    {"id": "market", "name": "🎯 Market Analysis & Research", "keywords": ["Markt", "Wettbewerb", "Market", "Analyse"]},
                    {"id": "gtm", "name": "🚀 Go-to-Market Strategy", "keywords": ["Go-to-Market", "GTM", "Market Entry", "Launch"]},
                    {"id": "sales", "name": "💼 Sales & Business Development", "keywords": ["Sales", "Lead", "Funnel", "Pitch"]},
                    {"id": "partnerships", "name": "🤝 Partnerships & Alliances", "keywords": ["Partner", "Alliance", "Co-Marketing", "Channel"]},
                    {"id": "expansion", "name": "🌍 Expansion & Growth", "keywords": ["Expansion", "Growth", "Scaling", "International"]},
                    {"id": "product", "name": "💎 Product & Value Proposition", "keywords": ["Produkt", "Product", "USP", "Value Proposition", "Leistung"]},
                    {"id": "customer", "name": "😊 Customer Success", "keywords": ["Customer", "Retention", "Journey", "NPS"]}
                ]
            },
            "Fachanwalt Gesellschaftsrecht": {
                "icon": "⚖️",
                "themes": [
                    {"id": "einzelunternehmen", "name": "👤 Einzelunternehmen", "keywords": ["Einzelunternehmen", "Einzelunternehmer", "Gewerbe"]},
                    {"id": "gmbh", "name": "🏢 GmbH-Recht", "keywords": ["GmbH", "Gesellschaft mit beschränkter"]},
                    {"id": "ag", "name": "📈 AG-Recht", "keywords": ["AG", "Aktiengesellschaft", "Vorstand", "Aufsichtsrat"]},
                    {"id": "personen", "name": "🤝 Personengesellschaften", "keywords": ["KG", "OHG", "Personengesellschaft"]},
                    {"id": "umwandlung", "name": "🔄 Umwandlungsrecht", "keywords": ["Umwandlung", "Verschmelzung", "Formwechsel", "Spaltung"]},
                    {"id": "governance", "name": "⚖️ Corporate Governance & Compliance", "keywords": ["Governance", "Compliance", "ESG", "Hinweisgeber", "DSGVO"]},
                    {"id": "vertrag", "name": "📄 Vertragsrecht", "keywords": ["Vertrag", "Vereinbarung", "Contract", "Agreement"]},
                    {"id": "konzern", "name": "🏢 Konzernrecht", "keywords": ["Konzern", "Beherrschung", "Squeeze"]}
                ]
            }
        };
    }

    // Map prompt to theme based on keywords
    getPromptTheme(prompt, role) {
        const roleThemes = this.themeMapping[role];
        if (!roleThemes) return null;

        for (const theme of roleThemes.themes) {
            for (const keyword of theme.keywords) {
                if (prompt.name.toLowerCase().includes(keyword.toLowerCase())) {
                    return theme.id;
                }
            }
        }
        
        // Fallback: return first theme
        return roleThemes.themes[0].id;
    }

    // Get prompts for a specific theme
    getPromptsForTheme(role, themeId) {
        return this.allPrompts.filter(p => {
            if (p.category !== role) return false;
            const promptTheme = this.getPromptTheme(p, role);
            return promptTheme === themeId;
        });
    }

    // Get theme statistics
    getThemeStats(role, themeId) {
        const prompts = this.getPromptsForTheme(role, themeId);
        return {
            total: prompts.length,
            fundamental: prompts.filter(p => p.tags?.includes('Fundamental')).length,
            erweitert: prompts.filter(p => p.tags?.includes('Erweitert')).length,
            premium: prompts.filter(p => p.tags?.includes('Premium')).length
        };
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
        console.log('✅ Prompts Engine ready (3-Level)');
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
        this.currentTheme = null;
        this.currentPrompt = null;
        this.renderMainView();
    }

    renderTemplateMode() {
        // Render based on current view
        if (this.currentView === 'roles') {
            return this.renderRolesView();
        } else if (this.currentView === 'themes') {
            return this.renderThemesView();
        } else if (this.currentView === 'prompts') {
            return this.renderPromptsView();
        }
    }

    /* ========================================== */
    /* LEVEL 1: ROLES VIEW */
    /* ========================================== */

    renderRolesView() {
        const roles = this.getRoles();
        
        return `
            <div class="prompts-template-section">
                <h2 class="section-title">💼 Wähle deine Rolle</h2>
                <p class="section-subtitle">${this.allPrompts.length} Prompts in ${roles.length} Rollen verfügbar</p>
                
                <div class="roles-grid">
                    ${roles.map(role => this.renderRoleCard(role)).join('')}
                </div>
            </div>
        `;
    }

    renderRoleCard(role) {
        const roleIcon = this.getRoleIcon(role.name);
        return `
            <div class="role-card" onclick="window.promptsEngine.selectRole('${role.name}')">
                <div class="role-icon">${roleIcon}</div>
                <div class="role-info">
                    <h3 class="role-name">${role.name}</h3>
                    <p class="role-count">${role.count} Prompts verfügbar</p>
                </div>
                <div class="role-arrow">→</div>
            </div>
        `;
    }

    /* ========================================== */
    /* LEVEL 2: THEMES VIEW */
    /* ========================================== */

    renderThemesView() {
        const roleData = this.themeMapping[this.currentRole];
        if (!roleData) return '';

        const roleIcon = this.getRoleIcon(this.currentRole);
        const totalPrompts = this.allPrompts.filter(p => p.category === this.currentRole).length;

        return `
            <div class="prompts-template-section">
                <!-- Breadcrumb Navigation -->
                <div class="breadcrumb-nav">
                    <button onclick="window.promptsEngine.goBackToRoles()" class="breadcrumb-back">
                        ← Zurück zu Rollen
                    </button>
                </div>

                <h2 class="section-title">${roleIcon} ${this.currentRole}</h2>
                <p class="section-subtitle">${totalPrompts} Prompts in ${roleData.themes.length} Hauptthemen</p>
                
                <div class="themes-grid">
                    ${roleData.themes.map(theme => this.renderThemeCard(theme)).join('')}
                </div>
            </div>
        `;
    }

    renderThemeCard(theme) {
        const stats = this.getThemeStats(this.currentRole, theme.id);
        
        return `
            <div class="theme-card" onclick="window.promptsEngine.selectTheme('${theme.id}')">
                <div class="theme-header">
                    <h3 class="theme-name">${theme.name}</h3>
                    <div class="theme-arrow">→</div>
                </div>
                <div class="theme-stats">
                    <span class="theme-count">${stats.total} Prompts</span>
                    ${stats.fundamental > 0 ? `<span class="badge badge-fundamental">${stats.fundamental} Fundamental</span>` : ''}
                    ${stats.erweitert > 0 ? `<span class="badge badge-erweitert">${stats.erweitert} Erweitert</span>` : ''}
                    ${stats.premium > 0 ? `<span class="badge badge-premium">${stats.premium} Premium</span>` : ''}
                </div>
            </div>
        `;
    }

    /* ========================================== */
    /* LEVEL 3: PROMPTS VIEW */
    /* ========================================== */

    renderPromptsView() {
        const prompts = this.getPromptsForTheme(this.currentRole, this.currentTheme);
        const roleData = this.themeMapping[this.currentRole];
        const theme = roleData.themes.find(t => t.id === this.currentTheme);
        
        if (!theme) return '';

        return `
            <div class="prompts-template-section">
                <!-- Breadcrumb Navigation -->
                <div class="breadcrumb-nav">
                    <button onclick="window.promptsEngine.goBackToThemes()" class="breadcrumb-back">
                        ← Zurück zu ${this.currentRole}
                    </button>
                </div>

                <h2 class="section-title">${theme.name}</h2>
                <p class="section-subtitle">${prompts.length} Prompts verfügbar</p>
                
                <!-- Prompt List -->
                <div class="prompt-list-simple">
                    ${prompts.map(prompt => this.renderPromptListItem(prompt)).join('')}
                </div>
            </div>
        `;
    }

    renderPromptListItem(prompt) {
        const impactClass = prompt.tags?.includes('Premium') ? 'premium' : 
                          prompt.tags?.includes('Erweitert') ? 'erweitert' : 'fundamental';
        
        return `
            <div class="prompt-list-item" onclick="window.promptsEngine.selectPrompt('${prompt.id}')">
                <div class="prompt-icon">${prompt.icon || '📄'}</div>
                <div class="prompt-details">
                    <h4 class="prompt-name">${prompt.name}</h4>
                    <div class="prompt-meta">
                        <span class="badge badge-${impactClass}">${prompt.tags?.[0] || 'Standard'}</span>
                        <span class="prompt-duration">⏱️ ${prompt.duration || 30} Min</span>
                    </div>
                </div>
                <div class="prompt-arrow">→</div>
            </div>
        `;
    }

    /* ========================================== */
    /* NAVIGATION METHODS */
    /* ========================================== */

    selectRole(roleName) {
        this.currentRole = roleName;
        this.currentView = 'themes';
        this.currentTheme = null;
        this.currentPrompt = null;
        this.renderMainView();
    }

    selectTheme(themeId) {
        this.currentTheme = themeId;
        this.currentView = 'prompts';
        this.currentPrompt = null;
        this.renderMainView();
    }

    selectPrompt(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;
        
        this.currentPrompt = prompt;
        this.renderPromptDetail(prompt);
    }

    goBackToRoles() {
        this.currentView = 'roles';
        this.currentRole = null;
        this.currentTheme = null;
        this.currentPrompt = null;
        this.renderMainView();
    }

    goBackToThemes() {
        this.currentView = 'themes';
        this.currentTheme = null;
        this.currentPrompt = null;
        this.renderMainView();
    }

    goBackToPrompts() {
        this.currentPrompt = null;
        this.renderMainView();
    }

    /* ========================================== */
    /* PROMPT DETAIL VIEW */
    /* ========================================== */

    renderPromptDetail(prompt) {
        const container = document.getElementById('prompts-content');
        if (!container) return;

        container.innerHTML = `
            <div class="prompt-detail-view">
                <!-- Breadcrumb -->
                <div class="breadcrumb-nav">
                    <button onclick="window.promptsEngine.goBackToPrompts()" class="breadcrumb-back">
                        ← Zurück
                    </button>
                </div>

                <!-- Prompt Header -->
                <div class="prompt-detail-header">
                    <div class="prompt-icon-large">${prompt.icon || '📄'}</div>
                    <div>
                        <h2 class="prompt-detail-title">${prompt.name}</h2>
                        <p class="prompt-detail-meta">${prompt.category} • ⏱️ ${prompt.duration || 30} Min</p>
                    </div>
                </div>

                <!-- Goal -->
                <div class="prompt-section">
                    <h3 class="prompt-section-title">🎯 Ziel</h3>
                    <p class="prompt-section-content">${prompt.goal || prompt.name}</p>
                </div>

                <!-- Full Prompt -->
                <div class="prompt-section">
                    <h3 class="prompt-section-title">📋 Vollständiger Prompt</h3>
                    <div class="prompt-code-box">
                        <button class="copy-btn" onclick="window.promptsEngine.copyPromptCode('${prompt.id}')">
                            📋 Kopieren
                        </button>
                        <pre class="prompt-code" id="prompt-code-${prompt.id}">${this.escapeHtml(prompt.fullPromptText || 'Kein Prompt-Text verfügbar')}</pre>
                    </div>
                    <p class="prompt-transparency-note">💡 <strong>100% Transparenz:</strong> Das ist exakt der Prompt, der an die AI gesendet wird.</p>
                </div>

                <!-- Questions/Inputs -->
                ${prompt.questions && prompt.questions.length > 0 ? `
                <div class="prompt-section">
                    <h3 class="prompt-section-title">🔍 Deine Eingaben</h3>
                    <div class="prompt-questions">
                        ${prompt.questions.map((q, idx) => `
                            <div class="question-group">
                                <label class="question-label">
                                    ${idx + 1}. ${q.question}
                                </label>
                                <input 
                                    type="text" 
                                    class="question-input"
                                    placeholder="${q.example || 'Ihre Antwort'}"
                                    id="answer-${prompt.id}-${idx}"
                                    onchange="window.promptsEngine.updateAnswer('${prompt.id}', ${idx}, this.value)"
                                />
                                <p class="question-example">💡 Beispiel: ${q.example}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Actions -->
                <div class="prompt-actions">
                    <button class="btn btn-primary" onclick="window.promptsEngine.executePrompt('${prompt.id}')">
                        ▶️ Prompt ausführen
                    </button>
                    <button class="btn btn-secondary" onclick="window.promptsEngine.addToQueue('${prompt.id}')">
                        ➕ Zur Task Queue
                    </button>
                </div>
            </div>
        `;
    }

    updateAnswer(promptId, questionIndex, value) {
        if (!this.userAnswers[promptId]) {
            this.userAnswers[promptId] = {};
        }
        this.userAnswers[promptId][questionIndex] = value;
    }

    copyPromptCode(promptId) {
        const codeElement = document.getElementById(`prompt-code-${promptId}`);
        if (codeElement) {
            navigator.clipboard.writeText(codeElement.textContent);
            alert('✅ Prompt kopiert!');
        }
    }

    executePrompt(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        // Get user answers
        const answers = this.userAnswers[promptId] || {};
        
        console.log('🚀 Executing prompt:', prompt.name);
        console.log('📝 User answers:', answers);
        
        // TODO: Integrate with AI execution
        alert(`✅ Prompt "${prompt.name}" wird ausgeführt!\n\n(AI-Integration folgt)`);
    }

    addToQueue(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        const task = {
            id: Date.now(),
            title: prompt.name,
            agent: prompt.role || prompt.category,
            agentId: prompt.id,
            matchScore: 100,
            source: 'manual',
            timestamp: new Date().toISOString()
        };

        this.taskQueue.push(task);
        console.log('✅ Added to queue:', task);
        alert(`✅ "${prompt.name}" zur Task Queue hinzugefügt!`);
    }

    /* ========================================== */
    /* FREE-FORM MODE */
    /* ========================================== */

    renderFreeFormMode() {
        return `
            <div class="prompts-freeform-section">
                <h2 class="section-title">🆓 Custom Prompt Builder</h2>
                <p class="section-subtitle">Erstelle deinen eigenen Prompt</p>
                
                <div class="freeform-builder">
                    <div class="form-group">
                        <label>Rolle / Agent</label>
                        <select class="form-control" id="freeform-role">
                            <option>Controller</option>
                            <option>Treasury</option>
                            <option>CFO</option>
                            <option>M&A</option>
                            <option>Bilanzbuchhalter</option>
                            <option>Business Developer</option>
                            <option>Fachanwalt</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Aufgabe / Ziel</label>
                        <textarea 
                            class="form-control" 
                            id="freeform-task" 
                            rows="3"
                            placeholder="Was möchtest du erreichen?"
                        ></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Context / Details</label>
                        <textarea 
                            class="form-control" 
                            id="freeform-context" 
                            rows="5"
                            placeholder="Gib relevante Details und Kontext..."
                        ></textarea>
                    </div>
                    
                    <button class="btn btn-primary" onclick="window.promptsEngine.executeFreeForm()">
                        ▶️ Prompt ausführen
                    </button>
                </div>
            </div>
        `;
    }

    executeFreeForm() {
        const role = document.getElementById('freeform-role')?.value;
        const task = document.getElementById('freeform-task')?.value;
        const context = document.getElementById('freeform-context')?.value;

        if (!task) {
            alert('⚠️ Bitte gib eine Aufgabe ein');
            return;
        }

        console.log('🚀 Executing custom prompt:', { role, task, context });
        alert(`✅ Custom Prompt wird ausgeführt!\n\n(AI-Integration folgt)`);
    }

    /* ========================================== */
    /* HELPER METHODS */
    /* ========================================== */

    getRoles() {
        const roleMap = new Map();
        
        this.allPrompts.forEach(prompt => {
            const role = prompt.category;
            if (!roleMap.has(role)) {
                roleMap.set(role, { name: role, count: 0 });
            }
            roleMap.get(role).count++;
        });
        
        return Array.from(roleMap.values()).sort((a, b) => b.count - a.count);
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

    getAgentName(agentId) {
        const agents = {
            'controller': 'Controller',
            'treasury': 'Treasury Manager',
            'cfo': 'CFO',
            'ma': 'M&A Specialist',
            'accountant': 'Bilanzbuchhalter'
        };
        return agents[agentId] || 'Finance Expert';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupEventListeners() {
        // Event listeners können hier hinzugefügt werden
    }

    /* ========================================== */
    /* DATA LOADING */
    /* ========================================== */

    getAllPrompts() {
        const builtinPrompts = [];

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

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.PromptsEngine = PromptsEngine;
    console.log('✅ PromptsEngine (3-Level) class loaded');
    
    // Global init function for navigation
    window.initPromptsTab = function() {
        console.log('🎯 initPromptsTab() called');
        
        if (!window.promptsEngine) {
            console.log('📦 Creating new PromptsEngine instance...');
            window.promptsEngine = new PromptsEngine();
        }
        
        window.promptsEngine.init();
        console.log('✅ Prompts Engine initialized and rendered');
    };
    
    // Auto-initialize when prompts container exists
    document.addEventListener('DOMContentLoaded', function() {
        const promptsContainer = document.getElementById('prompts-content');
        if (promptsContainer) {
            console.log('🎯 Auto-initializing Prompts Engine (DOMContentLoaded)...');
            window.initPromptsTab();
        }
    });
    
    // Also check after a short delay (for dynamic content loading)
    setTimeout(function() {
        if (!window.promptsEngine) {
            const promptsContainer = document.getElementById('prompts-content');
            if (promptsContainer) {
                console.log('🎯 Auto-initializing Prompts Engine (delayed)...');
                window.initPromptsTab();
            }
        }
    }, 500);
}
