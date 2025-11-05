// ═══════════════════════════════════════════════════════════════════
// ALBO MODULE RENDERER - PHASE 2: JSON → INTERACTIVE MODULES
// Rendert strukturierte JSON Outputs als interaktive Software-Module
// ═══════════════════════════════════════════════════════════════════

class ALBOModuleRenderer {
    
    constructor() {
        this.activeModule = null;
        this.jsonData = null;
        console.log('✅ ALBO Module Renderer initialized');
    }

    /**
     * Hauptmethode: Render JSON als Module-View
     */
    renderModules(jsonData, containerId) {
        console.log('🎨 Rendering modules from JSON...', jsonData);
        
        this.jsonData = jsonData;
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error('❌ Container not found:', containerId);
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Build module interface
        const moduleHTML = this.buildModuleInterface(jsonData);
        container.innerHTML = moduleHTML;
        
        // Initialize first module
        this.switchToModule(Object.keys(jsonData.modules)[0]);
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Modules rendered successfully');
    }

    /**
     * Build complete module interface HTML
     */
    buildModuleInterface(jsonData) {
        const modules = jsonData.modules;
        const moduleIds = Object.keys(modules);
        
        return `
            <!-- App Header -->
            <div class="albo-app-header">
                <div class="albo-header-left">
                    <div class="albo-logo">🤖</div>
                    <div class="albo-title">
                        <h1>Business Case Analyse</h1>
                        <div class="albo-subtitle">Generiert: ${new Date().toLocaleString('de-DE')}</div>
                    </div>
                </div>
                <div class="albo-header-right">
                    <button class="albo-btn-header albo-btn-secondary" onclick="window.alboRenderer.copyAll()">
                        📋 Kopieren
                    </button>
                    <button class="albo-btn-header albo-btn-secondary" onclick="window.alboRenderer.exportAll()">
                        📥 Export
                    </button>
                    <button class="albo-btn-header albo-btn-primary" onclick="window.promptsEngine.goBackToPrompts()">
                        ← Zurück
                    </button>
                </div>
            </div>

            <!-- Module Tabs -->
            <div class="albo-module-tabs">
                ${moduleIds.map(id => this.renderModuleTab(modules[id], id)).join('')}
            </div>

            <!-- Module Toolbar -->
            <div class="albo-module-toolbar">
                <div class="albo-toolbar-left">
                    <button class="albo-btn-toolbar" onclick="window.alboRenderer.saveModule()">
                        💾 Speichern
                    </button>
                    <button class="albo-btn-toolbar" onclick="window.alboRenderer.exportModule()">
                        📥 Exportieren
                    </button>
                    <button class="albo-btn-toolbar" onclick="window.alboRenderer.refreshModule()">
                        🔄 Aktualisieren
                    </button>
                </div>
                <div class="albo-toolbar-right">
                    <button class="albo-btn-toolbar albo-btn-toolbar-primary" onclick="window.alboRenderer.askAI()">
                        💬 Mit AI weiter sprechen
                    </button>
                    <button class="albo-btn-toolbar" onclick="window.alboRenderer.settings()">
                        ⚙️ Einstellungen
                    </button>
                </div>
            </div>

            <!-- Module Content -->
            <div class="albo-module-content">
                ${moduleIds.map(id => this.renderModuleContent(modules[id], id)).join('')}
            </div>

            <!-- Status Bar -->
            <div class="albo-status-bar">
                <div class="albo-status-left">
                    <div class="albo-status-item">
                        <div class="albo-status-indicator"></div>
                        <span>Ready</span>
                    </div>
                    <div class="albo-status-item">
                        <span>Zuletzt gespeichert: vor 2 Min</span>
                    </div>
                    <div class="albo-status-item">
                        <span>${moduleIds.length} Module geladen</span>
                    </div>
                </div>
                <div class="albo-status-right">
                    <span>ALBO v2.0 • Claude Sonnet 4</span>
                </div>
            </div>
        `;
    }

    /**
     * Render einzelnen Module Tab
     */
    renderModuleTab(moduleData, moduleId) {
        const icons = {
            'validation_table': '📊',
            'scorecard': '💰',
            'capital_structure': '📈',
            'timeline': '⏱️',
            'approval_template': '📄'
        };
        
        const labels = {
            'validation_table': 'Validierung',
            'scorecard': 'Scorecard',
            'capital_structure': 'Kapitalstruktur',
            'timeline': 'Timeline',
            'approval_template': 'CFO-Template'
        };
        
        return `
            <button class="albo-module-tab" data-module="${moduleId}" onclick="window.alboRenderer.switchToModule('${moduleId}')">
                <span class="albo-tab-icon">${icons[moduleId] || '📄'}</span>
                <span>${labels[moduleId] || moduleId}</span>
            </button>
        `;
    }

    /**
     * Render Module Content basierend auf Type
     */
    renderModuleContent(moduleData, moduleId) {
        const content = `
            <div class="albo-module-view" id="albo-module-${moduleId}">
                ${this.renderModuleByType(moduleData, moduleId)}
            </div>
        `;
        return content;
    }

    /**
     * Render basierend auf Modul-Type
     */
    renderModuleByType(moduleData, moduleId) {
        switch(moduleData.type) {
            case 'datagrid':
                return this.renderDataGrid(moduleData);
            case 'scorecard':
                return this.renderScorecard(moduleData);
            case 'capital_optimizer':
                return this.renderCapitalOptimizer(moduleData);
            case 'gantt':
                return this.renderTimeline(moduleData);
            case 'document':
                return this.renderDocument(moduleData);
            default:
                return `<div class="albo-error">Unknown module type: ${moduleData.type}</div>`;
        }
    }

    /**
     * MODUL 1: DATAGRID (Excel-like)
     */
    renderDataGrid(data) {
        return `
            <div class="albo-datagrid-container">
                <div class="albo-datagrid-header">
                    <div class="albo-datagrid-title">
                        <span>📊</span>
                        <span>${data.title || 'Validierungsstatus-Tabelle'}</span>
                    </div>
                </div>

                <!-- Overall Score -->
                ${this.renderOverallScore(data)}

                <!-- Table -->
                <table class="albo-excel-table">
                    <thead>
                        <tr>
                            <th style="width: 80px;">Stufe</th>
                            <th style="width: 200px;">Zielfrage</th>
                            <th style="width: 250px;">Hypothese / Test</th>
                            <th style="width: 140px;">Status</th>
                            <th style="width: 120px;">CFO-Risiko</th>
                            <th style="width: 120px;">Kapitalbedarf</th>
                            <th style="width: 120px;">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(row => this.renderDataGridRow(row)).join('')}
                    </tbody>
                </table>

                <!-- Learning Panel -->
                ${this.renderLearningPanel()}
            </div>
        `;
    }

    renderOverallScore(data) {
        return `
            <div class="albo-overall-score">
                <div class="albo-overall-score-header">Gesamt-Score Validierung</div>
                <div class="albo-progress-bar-wrapper">
                    <div class="albo-progress-bar-fill" style="width: ${data.overall_score || 0}%;">
                        ${data.overall_score || 0}%
                    </div>
                </div>
                <div class="albo-overall-score-text">
                    ${data.recommendation || 'Validierung läuft...'}
                </div>
            </div>
        `;
    }

    renderDataGridRow(row) {
        const statusClass = row.validiert === 'validated' ? 'validated' : 
                           row.validiert === 'warning' ? 'warning' : 'critical';
        const riskClass = row.cfo_risiko === 'NIEDRIG' ? 'low' : 
                         row.cfo_risiko === 'MITTEL' ? 'medium' : 'high';
        
        return `
            <tr>
                <td><div class="albo-stage-number">${row.stufe}</div></td>
                <td>
                    <strong>${row.stage_name || `Stage ${row.stufe}`}</strong><br>
                    <small style="color: #64748b;">${row.zielfrage}</small>
                </td>
                <td>${row.hypothese_test}</td>
                <td>
                    <span class="albo-status-badge albo-status-${statusClass}">
                        ${row.validiert === 'validated' ? '✅' : row.validiert === 'warning' ? '⚠️' : '❌'}
                        ${row.status_percent}%
                    </span>
                </td>
                <td><span class="albo-risk-badge albo-risk-${riskClass}">${row.cfo_risiko}</span></td>
                <td><strong>${this.formatCurrency(row.kapitalbedarf)}</strong></td>
                <td>
                    <div class="albo-row-actions">
                        <button class="albo-btn-row-action" onclick="window.alboRenderer.showDetails(${row.stufe})">📋</button>
                        <button class="albo-btn-row-action" onclick="window.alboRenderer.askAboutStage(${row.stufe})">💬</button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderLearningPanel() {
        return `
            <div class="albo-learning-panel">
                <div class="albo-learning-title">
                    <span>💡</span>
                    <span>Junior → Senior: Lern-Modus</span>
                </div>
                <div class="albo-learning-actions">
                    <button class="albo-btn-learning" onclick="window.alboRenderer.askAI('explain')">
                        🎓 "Warum ist Stufe X kritisch?"
                    </button>
                    <button class="albo-btn-learning" onclick="window.alboRenderer.askAI('best-practice')">
                        📚 "Zeig Best Practice"
                    </button>
                    <button class="albo-btn-learning" onclick="window.alboRenderer.askAI('improve')">
                        🎯 "Wie verbessere ich das?"
                    </button>
                    <button class="albo-btn-learning" onclick="window.alboRenderer.askAI('cfo')">
                        💼 "Was würde ein CFO fragen?"
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * MODUL 2: SCORECARD
     */
    renderScorecard(data) {
        const statusClass = data.overall_status === 'green' ? 'green' : 
                          data.overall_status === 'yellow' ? 'yellow' : 'red';
        
        return `
            <div class="albo-scorecard-container">
                <!-- Status Hero -->
                <div class="albo-status-hero albo-status-${statusClass}">
                    <div class="albo-status-indicator-large">
                        ${data.overall_status === 'green' ? '🟢' : data.overall_status === 'yellow' ? '🟡' : '🔴'}
                    </div>
                    <div class="albo-status-text-large">
                        ${data.overall_status === 'green' ? 'Business Case GRÜN' : 
                          data.overall_status === 'yellow' ? 'Business Case GELB' : 'Business Case ROT'}
                    </div>
                    <div class="albo-status-subtext">
                        ${data.validated_stages} von 4 Stufen validiert • ${data.cfo_recommendation}
                    </div>
                </div>

                <!-- Cards Grid -->
                <div class="albo-scorecard-grid">
                    ${this.renderScorecardCards(data)}
                </div>
            </div>
        `;
    }

    renderScorecardCards(data) {
        return `
            <!-- CFO Recommendation -->
            <div class="albo-scorecard-card">
                <div class="albo-scorecard-card-header">
                    <div class="albo-card-icon">💼</div>
                    <div class="albo-card-title">CFO-Empfehlung</div>
                </div>
                <div class="albo-recommendation-text">
                    ${data.cfo_recommendation}
                    ${data.recommendation_amount ? `<br><strong>${this.formatCurrency(data.recommendation_amount)} Budget</strong>` : ''}
                </div>
            </div>

            <!-- Next Milestones -->
            <div class="albo-scorecard-card">
                <div class="albo-scorecard-card-header">
                    <div class="albo-card-icon">📅</div>
                    <div class="albo-card-title">Nächste Meilensteine</div>
                </div>
                <div class="albo-next-milestones">
                    ${(data.next_milestones || []).map(m => `
                        <div class="albo-milestone-item">
                            <div>
                                <div class="albo-milestone-title">${m.title}</div>
                                <div class="albo-milestone-meta">
                                    <span class="albo-milestone-due">Due: ${m.due}</span>
                                    <span>👤 ${m.owner}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Risk Assessment -->
            <div class="albo-scorecard-card">
                <div class="albo-scorecard-card-header">
                    <div class="albo-card-icon">⚠️</div>
                    <div class="albo-card-title">Risiko-Assessment</div>
                </div>
                <div style="margin-bottom: 12px;">
                    <strong>Gesamtrisiko: ${data.risk_assessment}</strong>
                </div>
                <ul class="albo-concern-list">
                    ${(data.key_concerns || []).map(c => `
                        <li class="albo-concern-item">${c}</li>
                    `).join('')}
                </ul>
            </div>

            <!-- Key Findings -->
            <div class="albo-scorecard-card">
                <div class="albo-scorecard-card-header">
                    <div class="albo-card-icon">🔍</div>
                    <div class="albo-card-title">Key Findings</div>
                </div>
                <ul class="albo-finding-list">
                    ${(data.key_findings || []).map(f => `
                        <li class="albo-finding-item">✅ ${f}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * MODUL 3: CAPITAL OPTIMIZER
     */
    renderCapitalOptimizer(data) {
        return `
            <div class="albo-capital-container">
                <h2 class="albo-capital-title">
                    <span>📈</span>
                    <span>${data.title || 'Kapitalstruktur & Stufenbudget'}</span>
                </h2>

                <!-- Stage Budget Cards -->
                <div class="albo-capital-stages-grid">
                    ${(data.stages || []).map(stage => this.renderCapitalStageCard(stage)).join('')}
                </div>

                <!-- Summary -->
                <div class="albo-capital-summary">
                    <div class="albo-summary-item">
                        <div class="albo-summary-label">Gesamt Committed</div>
                        <div class="albo-summary-value">${this.formatCurrency(data.total_committed)}</div>
                    </div>
                    <div class="albo-summary-item">
                        <div class="albo-summary-label">Gesamt Benötigt</div>
                        <div class="albo-summary-value">${this.formatCurrency(data.total_required)}</div>
                    </div>
                    <div class="albo-summary-item">
                        <div class="albo-summary-label">Nächste Freigabe</div>
                        <div class="albo-summary-value albo-primary">${this.formatCurrency(data.funding_recommendation?.immediate)}</div>
                    </div>
                </div>

                <!-- Calculator -->
                ${this.renderCapitalCalculator(data.funding_recommendation)}
            </div>
        `;
    }

    renderCapitalStageCard(stage) {
        const statusClass = stage.status === 'spent' ? 'spent' : 
                          stage.status === 'allocated' ? 'allocated' : 
                          stage.status === 'pending' ? 'pending' : 'not-approved';
        
        return `
            <div class="albo-capital-stage-card albo-stage-${statusClass}">
                <div class="albo-stage-label">Stufe ${stage.stage} • ${stage.stage_name || 'Stage'}</div>
                <div class="albo-stage-amount">${this.formatCurrency(stage.budget)}</div>
                <div class="albo-stage-status-text">${this.getStatusLabel(stage.status)}</div>
                <div class="albo-stage-roi">${stage.roi_expectation || ''}</div>
            </div>
        `;
    }

    renderCapitalCalculator(funding) {
        if (!funding) return '';
        
        return `
            <div class="albo-calculator-section">
                <div class="albo-calculator-title">
                    <span>🧮</span>
                    <span>Finanzierungsstruktur-Rechner</span>
                </div>

                <div class="albo-slider-group">
                    <div class="albo-slider-label">
                        <span>Eigenkapital-Quote</span>
                        <span class="albo-slider-value" id="albo-equity-value">${funding.equity_ratio}%</span>
                    </div>
                    <input type="range" min="30" max="90" value="${funding.equity_ratio}" 
                           class="albo-slider" id="albo-equity-slider"
                           oninput="window.alboRenderer.updateCapitalCalculation(this.value)">
                </div>

                <div class="albo-calculation-results" id="albo-calc-results">
                    <div class="albo-result-row">
                        <div class="albo-result-label">Eigenkapital (gesamt)</div>
                        <div class="albo-result-value">${this.formatCurrency(funding.immediate * funding.equity_ratio / 100)}</div>
                    </div>
                    <div class="albo-result-row">
                        <div class="albo-result-label">Fremdkapital (gesamt)</div>
                        <div class="albo-result-value">${this.formatCurrency(funding.immediate * funding.debt_ratio / 100)}</div>
                    </div>
                    <div class="albo-result-row">
                        <div class="albo-result-label">WACC</div>
                        <div class="albo-result-value">${funding.wacc}%</div>
                    </div>
                    <div class="albo-result-highlight">
                        <div class="albo-result-label">💡 Kapitalkosteneinsparung p.a.</div>
                        <div class="albo-result-value">${this.formatCurrency(funding.savings_vs_baseline)}</div>
                    </div>
                </div>

                <div class="albo-calculator-note">
                    📊 ${funding.structure_rationale || 'Optimale Struktur empfohlen'}
                </div>
            </div>
        `;
    }

    /**
     * MODUL 4: TIMELINE (Gantt)
     */
    renderTimeline(data) {
        return `
            <div class="albo-timeline-container">
                <div class="albo-timeline-header">
                    <h2 class="albo-timeline-title">
                        <span>⏱️</span>
                        <span>${data.title || 'Validierungsprozess-Timeline'}</span>
                    </h2>
                </div>

                ${(data.milestones || []).map(m => this.renderTimelineItem(m)).join('')}

                ${data.delays && data.delays.length > 0 ? this.renderTimelineWarnings(data.delays) : ''}
            </div>
        `;
    }

    renderTimelineItem(milestone) {
        const statusClass = milestone.status === 'completed' ? 'completed' : 
                          milestone.status === 'in-progress' ? 'in-progress' : 'planned';
        
        return `
            <div class="albo-timeline-item">
                <div class="albo-timeline-info">
                    <div class="albo-timeline-milestone-title">${milestone.title}</div>
                    <div class="albo-timeline-dates">${milestone.start} - ${milestone.end}</div>
                    <div class="albo-timeline-owner">👤 ${milestone.owner}</div>
                </div>
                <div class="albo-timeline-bar-container">
                    <div class="albo-timeline-bar albo-timeline-${statusClass}" style="width: ${milestone.progress || 50}%;">
                        ${this.getTimelineLabel(milestone.status, milestone.progress)}
                    </div>
                </div>
            </div>
        `;
    }

    renderTimelineWarnings(delays) {
        return `
            <div class="albo-timeline-warning">
                <div class="albo-warning-title">⚠️ Kritischer Pfad</div>
                ${delays.map(d => `<div class="albo-warning-text">${d}</div>`).join('')}
            </div>
        `;
    }

    /**
     * MODUL 5: DOCUMENT
     */
    renderDocument(data) {
        const content = data.content || {};
        
        return `
            <div class="albo-template-container">
                <div class="albo-document-header">
                    <div class="albo-document-title">${data.title || 'CFO-Freigabe Vorlage'}</div>
                    <div class="albo-document-meta">Erstellt: ${new Date().toLocaleDateString('de-DE')}</div>
                </div>

                <div class="albo-document-section">
                    <div class="albo-document-section-title">1. Executive Summary</div>
                    <div class="albo-document-content">${content.executive_summary || ''}</div>
                </div>

                <div class="albo-document-section">
                    <div class="albo-document-section-title">2. CFO-Empfehlung</div>
                    <div class="albo-document-content">${content.recommendation || ''}</div>
                    ${content.conditions ? `
                        <ul class="albo-document-list">
                            ${content.conditions.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>

                <div class="albo-document-section">
                    <div class="albo-document-section-title">3. Kapitalstruktur</div>
                    <div class="albo-document-content">${content.capital_structure || ''}</div>
                </div>

                <div class="albo-document-section">
                    <div class="albo-document-section-title">4. Risiko-Assessment</div>
                    <div class="albo-document-content">${content.risk_assessment || ''}</div>
                </div>

                ${content.approval_required_from ? `
                    <div class="albo-signature-section">
                        ${content.approval_required_from.map(role => `
                            <div class="albo-signature-block">
                                <div class="albo-signature-title">${role}</div>
                                <div style="height: 60px;"></div>
                                <div class="albo-signature-line">Unterschrift & Datum</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Helper Methods
     */
    switchToModule(moduleId) {
        console.log('🔀 Switching to module:', moduleId);
        
        // Update tabs
        document.querySelectorAll('.albo-module-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.module === moduleId) {
                tab.classList.add('active');
            }
        });
        
        // Update content
        document.querySelectorAll('.albo-module-view').forEach(view => {
            view.classList.remove('active');
        });
        
        const moduleView = document.getElementById(`albo-module-${moduleId}`);
        if (moduleView) {
            moduleView.classList.add('active');
        }
        
        this.activeModule = moduleId;
    }

    formatCurrency(value) {
        if (!value) return '-';
        return new Intl.NumberFormat('de-DE', { 
            style: 'currency', 
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(value);
    }

    getStatusLabel(status) {
        const labels = {
            'spent': '✅ Ausgegeben',
            'allocated': '⏳ Allokiert',
            'pending': '📋 Pending',
            'not_approved': '⏸️ Nicht genehmigt'
        };
        return labels[status] || status;
    }

    getTimelineLabel(status, progress) {
        if (status === 'completed') return '✅ Abgeschlossen';
        if (status === 'in-progress') return `⏳ ${progress}% - In Progress`;
        return '📅 Geplant';
    }

    setupEventListeners() {
        // Add any global event listeners here
        console.log('✅ Event listeners setup');
    }

    // Placeholder methods for toolbar actions
    saveModule() { console.log('💾 Save module'); }
    exportModule() { console.log('📥 Export module'); }
    refreshModule() { console.log('🔄 Refresh module'); }
    askAI(type) { console.log('💬 Ask AI:', type); }
    settings() { console.log('⚙️ Settings'); }
    copyAll() { console.log('📋 Copy all'); }
    exportAll() { console.log('📥 Export all'); }
    showDetails(stage) { console.log('📋 Show details for stage:', stage); }
    askAboutStage(stage) { console.log('💬 Ask about stage:', stage); }
    updateCapitalCalculation(value) { 
        console.log('🧮 Update capital calculation:', value);
        // TODO: Implement live calculation
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    window.ALBOModuleRenderer = ALBOModuleRenderer;
    window.alboRenderer = new ALBOModuleRenderer();
    console.log('✅ ALBOModuleRenderer loaded and initialized');
}