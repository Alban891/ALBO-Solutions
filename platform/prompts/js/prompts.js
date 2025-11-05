/* ========================================== */
/* ALBO PROMPTS - WITH PROMPT DISPLAY TAB */
/* Option 1: Prompt als Tab + strukturierte Ansicht */
/* ========================================== */

class PromptsEngine {
    constructor() {
        this.taskQueue = [];
        this.allPrompts = this.getAllPrompts();
        this.currentView = 'roles';
        this.currentMode = 'templates';
        this.currentRole = null;
        this.currentTheme = null;
        this.currentPrompt = null;
        this.userAnswers = {};
        this.searchQuery = '';
        this.isWorkspaceMode = false;
        this.currentWorkspaceData = null; // 🆕 Store workspace data
        this.usedPromptText = null; // 🆕 Store original prompt
        
        this.themeMapping = this.getThemeMapping();
        
        console.log('💡 Prompts Engine initialized');
        console.log(`📚 Loaded ${this.allPrompts.length} prompts across ${this.getRoleCount()} roles`);

        this.injectSplitScreenCSS();
        this.promptEnhancer = new ALBOPromptEnhancer();
        this.moduleRenderer = window.alboRenderer;
        
        console.log('✅ ALBO Module System ready');
    }

    // ... [KEEP getThemeMapping() - genau wie vorher]
    getThemeMapping() {
        return {
    "Controller": {
        "icon": "📊",
        "themes": [
            {"id": "kostenrechnung", "name": "💰 Kostenrechnung", "keywords": ["Kostenartenrechnung"]},
            {"id": "kalkulation", "name": "📐 Kalkulation", "keywords": ["Zuschlagskalkulation"]},
            {"id": "budgetierung", "name": "📈 Budgetierung & Forecasting", "keywords": ["Integrierte Budgetierung"]},
            {"id": "investition", "name": "💼 Investitionsplanung", "keywords": ["Kostenvergleichsrechnung"]},
            {"id": "kennzahlen", "name": "📊 Kennzahlensysteme", "keywords": ["Analyse der Vermögensstruktur"]},
            {"id": "berichterstattung", "name": "📄 Finanzberichterstattung", "keywords": ["Monats-"]},
            {"id": "konzern", "name": "🏢 Konzerncontrolling", "keywords": ["Konzernreporting"]},
            {"id": "projekt", "name": "🎯 Projektcontrolling", "keywords": ["Projektkostenplanung"]},
            {"id": "businesscase", "name": "💡 Business Case Controlling", "keywords": ["Klassischer Business Case"]},
            {"id": "digital", "name": "🚀 Digitale Geschäftsmodelle", "keywords": ["KPI-Entwicklung"]},
            {"id": "startup", "name": "🌱 Controlling für Start-ups", "keywords": ["Wie behalte ich"]},
            {"id": "kalkulation_gruender", "name": "🧮 Kalkulation für Gründer", "keywords": ["Einfach kalkulieren"]}
        ]
    },
    "Treasury": {
        "icon": "🏦",
        "themes": [
            {"id": "cash_liquiditaet", "name": "💵 Cash- & Liquiditätsplanung", "keywords": ["Tagesbasierte"]},
            {"id": "finanzplanung_budgetierung", "name": "📈 Finanzplanung", "keywords": ["Treasury-Budget"]},
            {"id": "finanzierung_kapitalbeschaffung", "name": "💰 Finanzierung", "keywords": ["Strukturierung"]},
            {"id": "banking_zahlungsverkehr", "name": "🏦 Banking", "keywords": ["Optimierung"]},
            {"id": "hedging_absicherung", "name": "🛡️ Hedging", "keywords": ["Entwicklung einer Hedging"]},
            {"id": "compliance_regulatory", "name": "⚖️ Compliance", "keywords": ["Überprüfung"]},
            {"id": "treasury_strategie", "name": "🎯 Treasury Strategie", "keywords": ["Entwicklung einer konzernweiten"]},
            {"id": "finanzierung_kapitalstruktur", "name": "💼 Finanzierung", "keywords": ["Optimierung des Finanzierungsmix"]},
            {"id": "esg_sustainable", "name": "🌱 ESG", "keywords": ["Entwicklung einer ESG"]},
            {"id": "treasury_operating", "name": "🔧 Treasury Operating Model", "keywords": ["Entwicklung einer Innovationsstrategie"]}
        ]
    },
    "CFO": {
        "icon": "📈",
        "themes": [
            {"id": "strategie_vision", "name": "🎯 Strategie & Vision", "keywords": ["Finanzielle Vision"]},
            {"id": "global_strategy", "name": "🌍 Global Strategy", "keywords": ["Länderscoring"]},
            {"id": "ki_entscheidung", "name": "🤖 KI", "keywords": ["Forecasting mit generativer"]},
            {"id": "transformation_operating", "name": "🔄 Transformation", "keywords": ["Target Operating Model"]},
            {"id": "digitale_transformation", "name": "💻 Digitale Transformation", "keywords": ["Digitale Vision"]},
            {"id": "finance_excellence", "name": "⭐ Finance Excellence", "keywords": ["Finance Operating Model"]},
            {"id": "finanzierung_kapitalstruktur_cfo", "name": "💼 Finanzierung", "keywords": ["Kapitalstruktur analysieren"]},
            {"id": "ma_beteiligung", "name": "🤝 M&A", "keywords": ["Ist der geplante Deal"]},
            {"id": "strategisches_kostenmanagement", "name": "📊 Strategisches Kostenmanagement", "keywords": ["Strategische Prinzipien"]},
            {"id": "capital_allocation", "name": "💡 Capital Allocation", "keywords": ["Capital Allocation Strategy"]},
            {"id": "geopolitische_resilienz", "name": "🌍 Geopolitische Resilienz", "keywords": ["Integriertes Enterprise"]}
        ]
    },
    "M&A": {"icon": "🤝", "themes": [{"id": "prozesse_rollen", "name": "⚙️ M&A Prozesse", "keywords": ["M&A Prozessüberblick"]}]},
    "Bilanzbuchhalter": {"icon": "📚", "themes": [{"id": "zwecke_grundsaetze", "name": "📋 Zwecke", "keywords": ["Zwecke des Jahresabschlusses"]}]},
    "Fachanwalt Gesellschaftsrecht": {"icon": "⚖️", "themes": [{"id": "rechtsformen_haftung", "name": "⚖️ Rechtsformen", "keywords": ["Vergleich der Gesellschaftsformen"]}]}
        }
    }

    // ... [KEEP all navigation methods - nicht ändern]
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
        return roleThemes.themes[0].id;
    }

    getPromptsForTheme(role, themeId) {
        return this.allPrompts.filter(p => {
            if (p.category !== role) return false;
            const promptTheme = this.getPromptTheme(p, role);
            return promptTheme === themeId;
        });
    }

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

    renderMainView() {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        container.innerHTML = `
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
        if (this.currentView === 'roles') {
            return this.renderRolesView();
        } else if (this.currentView === 'themes') {
            return this.renderThemesView();
        } else if (this.currentView === 'prompts') {
            return this.renderPromptsView();
        }
    }

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

    renderThemesView() {
        const roleData = this.themeMapping[this.currentRole];
        if (!roleData) return '';
        const roleIcon = this.getRoleIcon(this.currentRole);
        const totalPrompts = this.allPrompts.filter(p => p.category === this.currentRole).length;
        return `
            <div class="prompts-template-section">
                <div class="breadcrumb-nav">
                    <button onclick="window.promptsEngine.goBackToRoles()" class="breadcrumb-back">← Zurück zu Rollen</button>
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

    renderPromptsView() {
        const prompts = this.getPromptsForTheme(this.currentRole, this.currentTheme);
        const roleData = this.themeMapping[this.currentRole];
        const theme = roleData.themes.find(t => t.id === this.currentTheme);
        if (!theme) return '';
        return `
            <div class="prompts-template-section">
                <div class="breadcrumb-nav">
                    <button onclick="window.promptsEngine.goBackToThemes()" class="breadcrumb-back">← Zurück zu ${this.currentRole}</button>
                </div>
                <h2 class="section-title">${theme.name}</h2>
                <p class="section-subtitle">${prompts.length} Prompts verfügbar</p>
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
        this.isWorkspaceMode = false;
        this.renderMainView();
    }

    goBackToThemes() {
        this.currentView = 'themes';
        this.currentTheme = null;
        this.currentPrompt = null;
        this.isWorkspaceMode = false;
        this.renderMainView();
    }

    goBackToPrompts() {
        this.currentPrompt = null;
        this.isWorkspaceMode = false;
        this.renderMainView();
    }

    renderPromptDetail(prompt) {
        const container = document.getElementById('prompts-content');
        if (!container) return;

        const extractedQuestions = this.extractQuestionsFromPrompt(prompt);
        let fullPromptText = prompt.fullPromptText || this.buildPromptText(prompt, extractedQuestions);

        container.innerHTML = `
            <div class="breadcrumb-nav">
                <button onclick="window.promptsEngine.goBackToPrompts()" class="breadcrumb-back">← Zurück</button>
            </div>

            <div class="prompt-header-bar" style="background: white; padding: 16px 24px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                <div class="prompt-header-info" style="display: flex; align-items: center; gap: 12px;">
                    <div class="prompt-icon" style="font-size: 24px;">${prompt.icon || '📄'}</div>
                    <div>
                        <h2 style="margin: 0; font-size: 20px; font-weight: 600;">${prompt.name}</h2>
                        <div class="prompt-meta" style="font-size: 12px; color: #64748b;">${prompt.category} • ⏱️ ${prompt.duration || 30} Min</div>
                    </div>
                </div>
            </div>

            <div class="clean-split-container" style="display: grid; grid-template-columns: 45% 55%; gap: 2px; height: calc(100vh - 240px); width: 100%; max-width: 100%; margin: 0 auto; background: #e2e8f0; overflow: hidden;">
                
                <div class="questions-panel" id="questions-panel-${prompt.id}" style="background: #ffffff; padding: 20px; overflow-y: auto; height: 100%;">
                    <div class="panel-header" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0;">
                        <div class="panel-title" style="font-size: 15px; font-weight: 600; color: #1e293b;">📝 Deine Eingaben</div>
                        <div class="panel-subtitle" style="font-size: 11px; color: #64748b;">${extractedQuestions.length} Fragen für optimalen Output</div>
                    </div>

                    ${extractedQuestions.map((q, idx) => `
                        <div class="question-item" style="margin-bottom: 20px; padding: 14px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
                            <div class="question-label" style="font-size: 13px; font-weight: 500; color: #1e293b; margin-bottom: 8px; display: flex; align-items: center;">
                                <span class="question-number" style="display: inline-block; width: 22px; height: 22px; background: #3b82f6; color: white; border-radius: 50%; text-align: center; line-height: 22px; font-weight: 600; font-size: 11px; margin-right: 10px;">${idx + 1}</span>
                                ${this.escapeHtml(q.question)}
                            </div>
                            <input 
                                type="text" 
                                class="question-input"
                                style="width: 100%; padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 4px; font-size: 12px; background: white;"
                                id="input-${prompt.id}-${idx}"
                                placeholder="${q.example ? this.escapeHtml(q.example) : 'Deine Antwort...'}"
                                oninput="window.promptsEngine.updateCleanPreview('${prompt.id}', ${idx}, this.value)"
                            />
                            ${q.example ? `<div class="question-example" style="font-size: 10px; color: #64748b; margin-top: 4px; padding-left: 32px; font-style: italic;">💡 Beispiel: ${this.escapeHtml(q.example)}</div>` : ''}
                        </div>
                    `).join('')}

                    <div class="additional-context" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                        <div class="question-label" style="font-size: 13px; font-weight: 500; color: #1e293b; margin-bottom: 8px; display: flex; align-items: center;">
                            <span class="question-number" style="display: inline-block; width: 22px; height: 22px; background: #3b82f6; color: white; border-radius: 50%; text-align: center; line-height: 22px; font-weight: 600; font-size: 11px; margin-right: 10px;">+</span>
                            Zusätzliche Hinweise (optional)
                        </div>
                        <textarea
                            class="additional-textarea"
                            style="width: 100%; min-height: 80px; padding: 10px; border: 1.5px solid #e2e8f0; border-radius: 4px; font-size: 12px; font-family: inherit; resize: vertical;"
                            id="additional-${prompt.id}"
                            placeholder="Weitere Details, spezifische Anforderungen, Kontext..."
                            oninput="window.promptsEngine.updateAdditionalClean('${prompt.id}', this.value)"
                        ></textarea>
                    </div>
                </div>

                <div class="code-panel" id="code-panel-${prompt.id}" style="background: #1e293b; padding: 20px; overflow-y: auto; height: 100%;">
                    <div class="panel-header" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #334155;">
                        <div class="panel-title" style="font-size: 15px; font-weight: 600; color: #f1f5f9;">💻 Live Prompt Preview</div>
                        <div class="panel-subtitle" style="font-size: 11px; color: #94a3b8;">Echtzeit-Vorschau deines fertigen Prompts</div>
                    </div>
                    <div class="code-preview" style="font-family: 'Fira Code', 'Monaco', monospace; font-size: 12px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; word-wrap: break-word;" id="code-preview-${prompt.id}">
                        ${this.renderCleanPreview(prompt, fullPromptText, extractedQuestions)}
                    </div>
                </div>
            </div>

            <div class="action-bar" style="position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 2px solid #e2e8f0; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 100;">
                <div class="action-info">
                    <div id="completion-status-${prompt.id}" class="completion-badge" style="padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 500; background: #fef3c7; color: #92400e;">
                        0/${extractedQuestions.length} Fragen beantwortet
                    </div>
                </div>
                <div class="action-buttons" style="display: flex; gap: 8px;">
                    <button class="btn-action btn-copy" style="padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 500; cursor: pointer; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e0;" onclick="window.promptsEngine.copyPrompt('${prompt.id}')">
                        📋 Kopieren
                    </button>
                    <button class="btn-action btn-execute" 
                        style="padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 500; cursor: pointer; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; opacity: 0.5;" 
                        id="execute-btn-${prompt.id}" 
                        onclick="window.promptsEngine.executePrompt('${prompt.id}')"
                        disabled>
                        ⚡ Ausführen
                    </button>
                </div>
            </div>
        `;

        this.updateProgress(prompt.id, extractedQuestions.length);
    }

    renderCleanPreview(prompt, fullPromptText, extractedQuestions) {
        let preview = this.escapeHtml(fullPromptText);
        extractedQuestions.forEach((q, idx) => {
            const questionText = this.escapeHtml(q.question);
            const placeholder = `<span style="color: #64748b; font-style: italic;" id="placeholder-${prompt.id}-${idx}">[Antwort ausstehend]</span>`;
            const patterns = [`${idx + 1}. ${questionText}`, questionText];
            for (const pattern of patterns) {
                if (preview.includes(pattern)) {
                    preview = preview.replace(pattern, `${pattern}\n→ ${placeholder}`);
                    break;
                }
            }
        });
        if (extractedQuestions.length > 0) {
            const additionalPlaceholder = `<span style="color: #64748b; font-style: italic;" id="additional-placeholder-${prompt.id}">[Keine zusätzlichen Hinweise]</span>`;
            preview += `\n\n<strong>Zusätzliche Hinweise:</strong>\n${additionalPlaceholder}`;
        }
        return preview;
    }

    updateCleanPreview(promptId, fieldIndex, value) {
        const placeholder = document.getElementById(`placeholder-${promptId}-${fieldIndex}`);
        if (placeholder) {
            if (value && value.trim() !== '') {
                placeholder.style.color = '#22d3ee';
                placeholder.style.fontStyle = 'normal';
                placeholder.style.fontWeight = '600';
                placeholder.textContent = value;
            } else {
                placeholder.style.color = '#64748b';
                placeholder.style.fontStyle = 'italic';
                placeholder.style.fontWeight = 'normal';
                placeholder.textContent = '[Antwort ausstehend]';
            }
        }
        if (!this.userAnswers[promptId]) {
            this.userAnswers[promptId] = {};
        }
        this.userAnswers[promptId][fieldIndex] = value;
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (prompt) {
            const extractedQuestions = this.extractQuestionsFromPrompt(prompt);
            this.updateProgress(promptId, extractedQuestions.length);
        }
    }

    updateProgress(promptId, totalQuestions) {
        let filledCount = 0;
        for (let i = 0; i < totalQuestions; i++) {
            const input = document.getElementById(`input-${promptId}-${i}`);
            if (input && input.value.trim() !== '') {
                filledCount++;
            }
        }
        const completionStatus = document.getElementById(`completion-status-${promptId}`);
        if (completionStatus) {
            completionStatus.textContent = `${filledCount}/${totalQuestions} Fragen beantwortet`;
            if (filledCount === totalQuestions) {
                completionStatus.style.background = '#d1fae5';
                completionStatus.style.color = '#065f46';
            } else {
                completionStatus.style.background = '#fef3c7';
                completionStatus.style.color = '#92400e';
            }
        }
        const executeBtn = document.getElementById(`execute-btn-${promptId}`);
        if (executeBtn) {
            if (filledCount === totalQuestions) {
                executeBtn.disabled = false;
                executeBtn.style.opacity = '1';
                executeBtn.style.cursor = 'pointer';
            } else {
                executeBtn.disabled = true;
                executeBtn.style.opacity = '0.5';
                executeBtn.style.cursor = 'not-allowed';
            }
        }
    }

    updateAdditionalClean(promptId, value) {
        const placeholder = document.getElementById(`additional-placeholder-${promptId}`);
        if (placeholder) {
            if (value && value.trim() !== '') {
                placeholder.style.color = '#22d3ee';
                placeholder.style.fontStyle = 'normal';
                placeholder.style.fontWeight = '600';
                placeholder.textContent = value;
            } else {
                placeholder.style.color = '#64748b';
                placeholder.style.fontStyle = 'italic';
                placeholder.style.fontWeight = 'normal';
                placeholder.textContent = '[Keine zusätzlichen Hinweise]';
            }
        }
        if (!this.userAnswers[promptId]) {
            this.userAnswers[promptId] = {};
        }
        this.userAnswers[promptId]['additional'] = value;
    }

    buildPromptText(prompt, questions) {
        let text = prompt.goal || prompt.name || '';
        if (questions && questions.length > 0) {
            text += '\n\n**🔍 Bitte frage den Nutzer vorab**\n\n';
            questions.forEach((q, idx) => {
                text += `${idx + 1}. ${q.question}\n`;
                if (q.example) text += `   → z.B.: ${q.example}\n`;
                text += '\n';
            });
        }
        return text;
    }

    /* ========================================== */
    /* 🆕 EXECUTE WITH AI - WORKSPACE MODE */
    /* ========================================== */

    async executePrompt(promptId) {
        console.log('🚀 executePrompt called with ID:', promptId);
        this.isWorkspaceMode = true;
        
        const previewContent = document.getElementById('code-preview-' + promptId);
        if (!previewContent) {
            console.error('❌ Preview content not found!');
            return;
        }
        
        let promptText = previewContent.textContent;
        console.log('📝 Original prompt length:', promptText.length);
        
        // 🆕 STORE original prompt + user answers
        const prompt = this.allPrompts.find(p => p.id === promptId);
        const extractedQuestions = this.extractQuestionsFromPrompt(prompt);
        this.usedPromptText = promptText;
        this.currentUserAnswers = {};
        extractedQuestions.forEach((q, idx) => {
            const input = document.getElementById(`input-${promptId}-${idx}`);
            if (input) {
                this.currentUserAnswers[idx] = {
                    question: q.question,
                    answer: input.value,
                    example: q.example
                };
            }
        });
        const additionalInput = document.getElementById(`additional-${promptId}`);
        if (additionalInput && additionalInput.value.trim()) {
            this.currentUserAnswers['additional'] = additionalInput.value;
        }
        
        promptText = this.promptEnhancer.enhancePromptForModules(promptText, promptId);
        console.log('✨ Enhanced prompt with JSON structure');
        
        this.showFullWidthWorkspace(promptId, 'loading');
        
        try {
            console.log('📤 Sending request to API...');
            const response = await fetch('/api/claude', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 4000,
                    messages: [{
                        role: 'user',
                        content: promptText
                    }]
                })
            });
            
            console.log('📥 Response status:', response.status);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error?.message || 'API Error');
            }
            
            const resultText = data.content[0].text;
            console.log('✅ Got result, length:', resultText.length);
            
            try {
                let jsonText = resultText.trim();
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                const jsonData = JSON.parse(jsonText);
                
                if (jsonData.modules) {
                    console.log('🎨 Rendering as structured modules...');
                    this.currentWorkspaceData = jsonData; // 🆕 Store data
                    this.showFullWidthWorkspace(promptId, 'modules', jsonData);
                } else {
                    throw new Error('No modules in JSON');
                }
            } catch (parseError) {
                console.warn('⚠️ Not valid JSON, showing as text:', parseError);
                this.showFullWidthWorkspace(promptId, 'text', resultText);
            }
            
        } catch (error) {
            console.error('❌ AI Execution Error:', error);
            this.showFullWidthWorkspace(promptId, 'error', error.message);
        }
    }

    /* ========================================== */
    /* 🆕 FULL-WIDTH WORKSPACE WITH PROMPT TAB */
    /* ========================================== */

    showFullWidthWorkspace(promptId, mode, content = null) {
        const container = document.getElementById('prompts-content');
        if (!container) return;

        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        let workspaceHTML = '';

        // Header
        workspaceHTML += `
            <div class="workspace-header" style="background: white; padding: 16px 24px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button onclick="window.promptsEngine.goBackToPrompts()" style="padding: 8px 12px; background: #f1f5f9; border: 1px solid #cbd5e0; border-radius: 4px; cursor: pointer; font-size: 13px;">
                        ← Zurück
                    </button>
                    <div class="prompt-icon" style="font-size: 24px;">${prompt.icon || '📄'}</div>
                    <div>
                        <h2 style="margin: 0; font-size: 20px; font-weight: 600;">${prompt.name}</h2>
                        <div style="font-size: 12px; color: #64748b;">${prompt.category} • Generiert: ${new Date().toLocaleString('de-DE')}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    ${mode === 'modules' ? `
                        <button onclick="window.promptsEngine.saveWorkspace('${promptId}')" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">
                            💾 Speichern
                        </button>
                        <button onclick="window.promptsEngine.exportWorkspace('${promptId}', 'pdf')" style="padding: 8px 16px; background: #f1f5f9; border: 1px solid #cbd5e0; border-radius: 4px; cursor: pointer; font-size: 13px;">
                            📤 Export PDF
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // 🆕 TAB NAVIGATION (including Prompt tab)
        if (mode === 'modules') {
            workspaceHTML += `
                <div class="workspace-tabs" style="background: white; border-bottom: 2px solid #e2e8f0; display: flex; gap: 4px; padding: 0 24px;">
                    <button class="workspace-tab active" data-tab="validation" onclick="window.promptsEngine.switchWorkspaceTab('${promptId}', 'validation')" style="padding: 12px 20px; background: transparent; border: none; border-bottom: 3px solid #3b82f6; cursor: pointer; font-size: 14px; font-weight: 600; color: #3b82f6;">
                        📊 Validierung
                    </button>
                    <button class="workspace-tab" data-tab="scorecard" onclick="window.promptsEngine.switchWorkspaceTab('${promptId}', 'scorecard')" style="padding: 12px 20px; background: transparent; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-size: 14px; font-weight: 500; color: #64748b;">
                        💰 Scorecard
                    </button>
                    <button class="workspace-tab" data-tab="capital" onclick="window.promptsEngine.switchWorkspaceTab('${promptId}', 'capital')" style="padding: 12px 20px; background: transparent; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-size: 14px; font-weight: 500; color: #64748b;">
                        📈 Kapital
                    </button>
                    <button class="workspace-tab" data-tab="prompt" onclick="window.promptsEngine.switchWorkspaceTab('${promptId}', 'prompt')" style="padding: 12px 20px; background: transparent; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-size: 14px; font-weight: 500; color: #64748b;">
                        💬 Prompt
                    </button>
                </div>
            `;
        }

        // Content Area
        workspaceHTML += `<div class="workspace-content" id="workspace-content-${promptId}" style="width: 100%; min-height: calc(100vh - 180px); background: #f8fafc; padding: 24px;">`;

        if (mode === 'loading') {
            workspaceHTML += `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px;">
                    <div style="width: 60px; height: 60px; border: 4px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                    <h3 style="color: #1e293b; margin: 0 0 8px 0; font-size: 20px;">🤖 Claude analysiert...</h3>
                    <p style="color: #64748b; margin: 0; font-size: 14px;">Strukturierte Business Case Analyse wird erstellt...</p>
                </div>
            `;
        } else if (mode === 'modules') {
            workspaceHTML += `<div id="albo-workspace-modules"></div>`;
        } else if (mode === 'text') {
            workspaceHTML += `
                <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin-top: 0;">📄 Analyse Ergebnis</h3>
                    <pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6;">${this.escapeHtml(content)}</pre>
                </div>
            `;
        } else if (mode === 'error') {
            workspaceHTML += `
                <div style="background: #fee2e2; padding: 32px; border-radius: 12px; border: 2px solid #ef4444; text-align: center;">
                    <h3 style="color: #dc2626; margin: 0 0 16px 0;">❌ Fehler bei der Ausführung</h3>
                    <p style="color: #991b1b; margin: 0;">${this.escapeHtml(content)}</p>
                    <button onclick="window.promptsEngine.goBackToPrompts()" style="margin-top: 24px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
                        ← Zurück zu Prompts
                    </button>
                </div>
            `;
        }

        workspaceHTML += `</div>`;

        container.innerHTML = workspaceHTML;

        if (mode === 'modules' && content) {
            setTimeout(() => {
                this.moduleRenderer.renderModules(content, 'albo-workspace-modules');
            }, 100);
        }
    }

    /* ========================================== */
    /* 🆕 TAB SWITCHING */
    /* ========================================== */

    switchWorkspaceTab(promptId, tab) {
        console.log('🔄 Switching to tab:', tab);
        
        // Update tab styling
        const tabs = document.querySelectorAll('.workspace-tab');
        tabs.forEach(t => {
            const tabName = t.getAttribute('data-tab');
            if (tabName === tab) {
                t.style.borderBottomColor = '#3b82f6';
                t.style.color = '#3b82f6';
                t.style.fontWeight = '600';
                t.classList.add('active');
            } else {
                t.style.borderBottomColor = 'transparent';
                t.style.color = '#64748b';
                t.style.fontWeight = '500';
                t.classList.remove('active');
            }
        });

        // Update content
        const contentArea = document.getElementById('workspace-content-' + promptId);
        if (!contentArea) return;

        if (tab === 'prompt') {
            this.renderPromptTab(contentArea, promptId);
        } else {
            // Re-render modules for other tabs
            contentArea.innerHTML = '<div id="albo-workspace-modules"></div>';
            setTimeout(() => {
                if (this.currentWorkspaceData) {
                    this.moduleRenderer.renderModules(this.currentWorkspaceData, 'albo-workspace-modules');
                }
            }, 50);
        }
    }

    /* ========================================== */
    /* 🆕 RENDER PROMPT TAB */
    /* ========================================== */

    renderPromptTab(container, promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        const extractedQuestions = this.extractQuestionsFromPrompt(prompt);
        
        let html = `
            <div style="max-width: 1200px; margin: 0 auto;">
                <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #1e293b;">💬 Verwendeter Prompt</h2>
                <p style="color: #64748b; margin-bottom: 32px;">Hier siehst du den kompletten Prompt, der an Claude gesendet wurde.</p>

                <!-- Quick Actions -->
                <div style="display: flex; gap: 12px; margin-bottom: 32px;">
                    <button onclick="window.promptsEngine.copyUserAnswers('${promptId}')" style="padding: 12px 24px; background: #f1f5f9; border: 1px solid #cbd5e0; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                        📋 Nur Fragen & Antworten kopieren
                    </button>
                    <button onclick="window.promptsEngine.copyFullPrompt('${promptId}')" style="padding: 12px 24px; background: #f1f5f9; border: 1px solid #cbd5e0; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                        📋 Vollständigen Prompt kopieren
                    </button>
                    <button onclick="window.promptsEngine.editAndRerun('${promptId}')" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                        🔄 Prompt bearbeiten & neu ausführen
                    </button>
                </div>

                <div style="border-top: 1px solid #e2e8f0; margin: 32px 0;"></div>

                <!-- User Inputs Section -->
                <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 24px;">
                    <h3 style="margin-top: 0; font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">📝 Deine Eingaben</h3>
                    ${this.currentUserAnswers ? Object.entries(this.currentUserAnswers).map(([key, value]) => {
                        if (key === 'additional') {
                            return `
                                <div style="margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                                    <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">
                                        ➕ Zusätzliche Hinweise:
                                    </div>
                                    <div style="font-size: 14px; color: #475569; line-height: 1.6;">
                                        ${this.escapeHtml(value)}
                                    </div>
                                </div>
                            `;
                        }
                        return `
                            <div style="margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                                <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">
                                    ${parseInt(key) + 1}️⃣ ${this.escapeHtml(value.question)}
                                </div>
                                <div style="font-size: 14px; color: #475569; padding-left: 16px;">
                                    → ${this.escapeHtml(value.answer)}
                                </div>
                                ${value.example ? `<div style="font-size: 12px; color: #94a3b8; padding-left: 16px; margin-top: 4px; font-style: italic;">💡 Beispiel: ${this.escapeHtml(value.example)}</div>` : ''}
                            </div>
                        `;
                    }).join('') : '<p>Keine Antworten gespeichert</p>'}
                </div>

                <div style="border-top: 1px solid #e2e8f0; margin: 32px 0;"></div>

                <!-- Full Prompt Section -->
                <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin-top: 0; font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px;">💻 Vollständiger Prompt (${this.usedPromptText ? this.usedPromptText.length.toLocaleString() : '0'} Zeichen)</h3>
                    <div style="background: #1e293b; padding: 20px; border-radius: 8px; overflow-x: auto;">
                        <pre style="margin: 0; font-family: 'Fira Code', 'Monaco', monospace; font-size: 12px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; word-wrap: break-word;">${this.usedPromptText ? this.escapeHtml(this.usedPromptText) : 'Prompt nicht verfügbar'}</pre>
                    </div>
                </div>

                <div style="border-top: 1px solid #e2e8f0; margin: 32px 0;"></div>

                <!-- Technical Details -->
                <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin-top: 0; font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px;">🔧 Technische Details</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Model</div>
                            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">Claude Sonnet 4</div>
                            <div style="font-size: 11px; color: #94a3b8;">claude-sonnet-4-20250514</div>
                        </div>
                        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Input Tokens</div>
                            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">${this.usedPromptText ? Math.ceil(this.usedPromptText.length / 4).toLocaleString() : '0'}</div>
                            <div style="font-size: 11px; color: #94a3b8;">~${this.usedPromptText ? (this.usedPromptText.length / 4 * 0.003 / 1000).toFixed(2) : '0.00'} € Input</div>
                        </div>
                        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Template</div>
                            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">business_case_validation</div>
                            <div style="font-size: 11px; color: #94a3b8;">Mit JSON Enhancement</div>
                        </div>
                        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Generiert</div>
                            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">${new Date().toLocaleString('de-DE')}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /* ========================================== */
    /* PROMPT TAB ACTIONS */
    /* ========================================== */

    copyUserAnswers(promptId) {
        if (!this.currentUserAnswers) {
            alert('❌ Keine Antworten verfügbar');
            return;
        }

        let text = '📝 Fragen & Antworten:\n\n';
        Object.entries(this.currentUserAnswers).forEach(([key, value]) => {
            if (key === 'additional') {
                text += `➕ Zusätzliche Hinweise:\n${value}\n\n`;
            } else {
                text += `${parseInt(key) + 1}. ${value.question}\n→ ${value.answer}\n\n`;
            }
        });

        navigator.clipboard.writeText(text).then(() => {
            alert('✅ Fragen & Antworten kopiert!');
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('❌ Kopieren fehlgeschlagen');
        });
    }

    copyFullPrompt(promptId) {
        if (!this.usedPromptText) {
            alert('❌ Prompt nicht verfügbar');
            return;
        }

        navigator.clipboard.writeText(this.usedPromptText).then(() => {
            alert('✅ Vollständiger Prompt kopiert!');
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('❌ Kopieren fehlgeschlagen');
        });
    }

    editAndRerun(promptId) {
        alert('🔄 Feature "Bearbeiten & Neu ausführen" kommt in Phase 2!\n\nAktuell: Gehe zurück zu Prompts und fülle neu aus.');
    }

    saveWorkspace(promptId) {
        alert('💾 Workspace Speichern - Feature kommt in Phase 3!');
        console.log('Save workspace:', promptId);
    }

    exportWorkspace(promptId, format) {
        alert(`📤 Export als ${format.toUpperCase()} - Feature kommt in Phase 1!`);
        console.log('Export workspace:', promptId, format);
    }

    // ... [KEEP ALL extractQuestionsFromPrompt, copyPrompt, getRoles, etc.]
    
    extractQuestionsFromPrompt(prompt) {
        const fullText = prompt.fullPromptText || '';
        const frageMatch = fullText.match(/(?:🔍\s*Bitte beantworte vorab|💬\s*Bitte beantworte vorab)(?:\s*\(inkl\.\s*Beispielantworten\))?:?\s*\n([\s\S]*?)(?=\n\n(?:✅|📝|💡)|$)/);
        if (!frageMatch) {
            const lines = fullText.split('\n');
            const extractedQuestions = [];
            let inQuestionSection = false;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.includes('Bitte beantworte') || line.includes('Welche')) {
                    inQuestionSection = true;
                }
                const questionMatch = line.match(/^(\d+)\.\s+(.+?)$/);
                if (inQuestionSection && questionMatch) {
                    const question = {
                        number: parseInt(questionMatch[1]),
                        question: questionMatch[2],
                        example: ''
                    };
                    if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1].trim();
                        if (nextLine.startsWith('→') || nextLine.includes('z.B.') || nextLine.includes('Beispiel:')) {
                            question.example = nextLine.replace(/^→\s*z\.\s*B\.\s*[„"]?|^→\s*|Beispiel:\s*/i, '').replace(/[""]$/, '');
                        }
                    }
                    extractedQuestions.push(question);
                }
                if (line.includes('Pflichtinhalte') || line.includes('✅') || (inQuestionSection && line.startsWith('**') && !line.includes('Bitte'))) {
                    break;
                }
            }
            return extractedQuestions;
        }
        const frageSection = frageMatch[1];
        const lines = frageSection.split('\n');
        const extractedQuestions = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const questionMatch = line.match(/^(\d+)\.\s+(.+?)$/);
            if (questionMatch) {
                const question = {
                    number: parseInt(questionMatch[1]),
                    question: questionMatch[2],
                    example: ''
                };
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine.startsWith('→') || nextLine.includes('z.B.')) {
                        question.example = nextLine.replace(/^→\s*z\.\s*B\.\s*[„"]?|^→\s*/i, '').replace(/[""]$/, '');
                    }
                }
                extractedQuestions.push(question);
            }
        }
        return extractedQuestions;
    }

    copyPrompt(promptId) {
        const previewContent = document.getElementById(`code-preview-${promptId}`);
        if (!previewContent) return;
        const text = previewContent.textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ Prompt wurde in die Zwischenablage kopiert!');
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('❌ Kopieren fehlgeschlagen.');
        });
    }

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
            'Fachanwalt Gesellschaftsrecht': '⚖️'
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

    setupEventListeners() {}

    getAllPrompts() {
        const builtinPrompts = [];
        const controllerPrompts = (typeof NOTION_PROMPTS !== 'undefined' && Array.isArray(NOTION_PROMPTS)) ? NOTION_PROMPTS : [];
        const treasuryPrompts = (typeof TREASURY_PROMPTS !== 'undefined' && Array.isArray(TREASURY_PROMPTS)) ? TREASURY_PROMPTS : [];
        const cfoPrompts = (typeof CFO_PROMPTS !== 'undefined' && Array.isArray(CFO_PROMPTS)) ? CFO_PROMPTS : [];
        const maPrompts = (typeof MA_PROMPTS !== 'undefined' && Array.isArray(MA_PROMPTS)) ? MA_PROMPTS : [];
        const bilanzPrompts = (typeof BILANZ_PROMPTS !== 'undefined' && Array.isArray(BILANZ_PROMPTS)) ? BILANZ_PROMPTS : [];
        const bizdevPrompts = (typeof BIZDEV_PROMPTS !== 'undefined' && Array.isArray(BIZDEV_PROMPTS)) ? BIZDEV_PROMPTS : [];
        const lawyerPrompts = (typeof LAWYER_PROMPTS !== 'undefined' && Array.isArray(LAWYER_PROMPTS)) ? LAWYER_PROMPTS : [];
        return [...builtinPrompts, ...controllerPrompts, ...treasuryPrompts, ...cfoPrompts, ...maPrompts, ...bilanzPrompts, ...bizdevPrompts, ...lawyerPrompts];
    }

    injectSplitScreenCSS() {
        if (document.getElementById('split-screen-styles')) return;
        const style = document.createElement('style');
        style.id = 'split-screen-styles';
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    renderFreeFormMode() {
        return `
            <div class="prompts-freeform-section">
                <h2 class="section-title">🆓 Custom Prompt Builder</h2>
                <p class="section-subtitle">Erstelle deinen eigenen Prompt</p>
            </div>
        `;
    }
}

if (typeof window !== 'undefined') {
    window.PromptsEngine = PromptsEngine;
    console.log('✅ PromptsEngine (with Prompt Tab) class loaded');
    
    window.initPromptsTab = function() {
        console.log('🎯 initPromptsTab() called');
        if (!window.promptsEngine) {
            console.log('📦 Creating new PromptsEngine instance...');
            window.promptsEngine = new PromptsEngine();
        }
        window.promptsEngine.init();
        console.log('✅ Prompts Engine initialized and rendered');
    };
    
    document.addEventListener('DOMContentLoaded', function() {
        const promptsContainer = document.getElementById('prompts-content');
        if (promptsContainer) {
            console.log('🎯 Auto-initializing Prompts Engine (DOMContentLoaded)...');
            window.initPromptsTab();
        }
    });
    
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
