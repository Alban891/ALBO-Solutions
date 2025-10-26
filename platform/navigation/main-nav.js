/* ========================================== */
/* ALBO SOLUTIONS - PLATFORM NAVIGATION */
/* Handles tab switching and content rendering */
/* ========================================== */

class PlatformNavigation {
    constructor() {
        this.currentSection = 'landing';
        this.contentArea = null;
        
        console.log('🎯 Platform Navigation initialized');
    }

    /**
     * Initialize navigation
     */
    init() {
        // Get content area
        this.contentArea = document.getElementById('platform-content');
        
        if (!this.contentArea) {
            console.error('❌ Content area not found!');
            return;
        }

        // Setup tab listeners
        this.setupTabListeners();

        // Register routes
        this.registerRoutes();

        // Load initial section from URL or default
        window.platformRouter.initFromURL();
    }

    /**
     * Setup tab click listeners
     */
    setupTabListeners() {
        const tabs = document.querySelectorAll('.nav-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        console.log(`✅ Setup ${tabs.length} tab listeners`);
    }

    /**
     * Register all routes
     */
    registerRoutes() {
        window.platformRouter.register('landing', () => this.loadLanding());
        window.platformRouter.register('command-center', () => this.loadCommandCenter());
        window.platformRouter.register('agents', () => this.loadAgents());
        window.platformRouter.register('workflows', () => this.loadWorkflows());
        window.platformRouter.register('prompts', () => this.loadPrompts());
        window.platformRouter.register('cases', () => this.loadCases());
    }

    /**
     * Switch to a section
     */
    switchSection(section) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === section);
        });

        // Navigate via router
        window.platformRouter.navigate(section);
    }

    /* ========================================== */
    /* SECTION LOADERS */
    /* ========================================== */

    loadLanding() {
        const greeting = this.getGreeting();
        const currentDate = this.getCurrentDate();
        
        this.contentArea.innerHTML = `
            <div class="landing-page-v2">
                <!-- Hero Section -->
                <div class="landing-hero-v2">
                    <h1>${greeting} 👋</h1>
                    <div class="hero-badges">
                        <span class="badge badge-primary">3 neue Aufgaben</span>
                        <span class="badge badge-warning">8 relevante Nachrichten</span>
                    </div>
                </div>

                <!-- Main Content: Calendar + News -->
                <div class="landing-main-grid">
                    <!-- Calendar Widget (25%) -->
                    <div class="calendar-widget">
                        <div class="widget-header">
                            <h3>📅 Kalender</h3>
                        </div>
                        
                        <div class="calendar-container">
                            <div class="calendar-nav">
                                <button class="btn-icon" onclick="window.landingPageUtils.prevMonth()">◀</button>
                                <h4 id="calendar-month">Oktober 2025</h4>
                                <button class="btn-icon" onclick="window.landingPageUtils.nextMonth()">▶</button>
                            </div>
                            
                            <div class="calendar-grid" id="calendar-grid">
                                <!-- Will be populated by JS -->
                            </div>
                        </div>
                        
                        <div class="calendar-notes">
                            <h4>📝 Notizen</h4>
                            <textarea 
                                id="calendar-note" 
                                placeholder="Notiz für heute..."
                                class="note-input"
                            ></textarea>
                            <button class="btn-sm btn-primary" onclick="window.landingPageUtils.saveNote()">
                                Speichern
                            </button>
                        </div>
                        
                        <div class="calendar-reminders">
                            <h4>⏰ Erinnerungen</h4>
                            <ul class="reminder-list" id="reminder-list">
                                <li class="reminder-item">
                                    <input type="checkbox" />
                                    <span>Q4 Forecast Review</span>
                                    <button class="btn-icon-sm" onclick="window.landingPageUtils.removeReminder(0)">🗑️</button>
                                </li>
                                <li class="reminder-item">
                                    <input type="checkbox" />
                                    <span>Bank Meeting vorbereiten</span>
                                    <button class="btn-icon-sm" onclick="window.landingPageUtils.removeReminder(1)">🗑️</button>
                                </li>
                            </ul>
                            <button class="btn-link" onclick="window.landingPageUtils.addReminder()">
                                + Erinnerung hinzufügen
                            </button>
                        </div>
                    </div>

                    <!-- News Feed (75%) -->
                    <div class="news-widget">
                        <div class="widget-header">
                            <h3>📰 Wirtschaftsnachrichten</h3>
                            <button class="btn-icon" onclick="window.landingPageUtils.refreshNews()">🔄</button>
                        </div>
                        
                        <!-- News Categories -->
                        <div class="news-categories">
                            <button class="category-tab active" data-category="wirtschaft" onclick="window.landingPageUtils.switchCategory('wirtschaft')">
                                💼 Wirtschaft
                            </button>
                            <button class="category-tab" data-category="politik" onclick="window.landingPageUtils.switchCategory('politik')">
                                🏛️ Politik
                            </button>
                            <button class="category-tab" data-category="unternehmen" onclick="window.landingPageUtils.switchCategory('unternehmen')">
                                🏢 Unternehmen
                            </button>
                            <button class="category-tab" data-category="maerkte" onclick="window.landingPageUtils.switchCategory('maerkte')">
                                📈 Märkte
                            </button>
                            <button class="category-tab" data-category="technologie" onclick="window.landingPageUtils.switchCategory('technologie')">
                                💻 Technologie
                            </button>
                            <button class="category-tab" data-category="boerse" onclick="window.landingPageUtils.switchCategory('boerse')">
                                💹 Börse
                            </button>
                        </div>
                        
                        <!-- News Feed Container -->
                        <div class="news-feed" id="news-feed">
                            <!-- Will be populated by JS -->
                        </div>
                    </div>
                </div>

                <!-- Task Queue -->
                <div class="task-section">
                    <div class="section-header">
                        <h3>🎯 Deine Aufgaben heute</h3>
                        <button class="btn-secondary btn-sm">Alle anzeigen (5)</button>
                    </div>
                    
                    <div class="task-grid">
                        <div class="task-card task-new">
                            <div class="task-header">
                                <div class="task-icon">📧</div>
                                <div class="task-meta">
                                    <span class="task-badge new">NEU</span>
                                    <span class="task-time">Vor 15 Min</span>
                                </div>
                            </div>
                            <h4>Cash Pooling Analyse erstellen</h4>
                            <div class="task-details">
                                <div class="detail-row">
                                    <span class="label">Von:</span>
                                    <span class="value">CFO (Hans Müller)</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Priorität:</span>
                                    <span class="value priority-high">⚠️ Hoch</span>
                                </div>
                            </div>
                            <div class="ai-match">
                                <span class="match-icon">🤖</span>
                                <span class="match-score">AI Match: 95%</span>
                                <p class="match-prompt">"Treasury Manager - Cash Pooling"</p>
                            </div>
                            <div class="task-actions">
                                <button class="btn-primary btn-sm">Jetzt starten →</button>
                                <button class="btn-secondary btn-sm">Später</button>
                            </div>
                        </div>

                        <div class="task-card task-urgent">
                            <div class="task-header">
                                <div class="task-icon">⏰</div>
                                <div class="task-meta">
                                    <span class="task-badge deadline">DEADLINE</span>
                                    <span class="task-time">In 3 Tagen</span>
                                </div>
                            </div>
                            <h4>Q4 Forecast Finalisierung</h4>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 65%">65%</div>
                            </div>
                            <div class="task-actions">
                                <button class="btn-primary btn-sm">Weiter bearbeiten →</button>
                            </div>
                        </div>

                        <div class="task-card task-progress">
                            <div class="task-header">
                                <div class="task-icon">📝</div>
                                <div class="task-meta">
                                    <span class="task-badge progress">IN ARBEIT</span>
                                    <span class="task-time">Seit gestern</span>
                                </div>
                            </div>
                            <h4>Budget Review 2026</h4>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 40%">40%</div>
                            </div>
                            <div class="task-actions">
                                <button class="btn-primary btn-sm">Fortsetzen →</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="stats-bar">
                    <div class="stat-item">
                        <span class="stat-icon">📋</span>
                        <div class="stat-content">
                            <span class="stat-value">5</span>
                            <span class="stat-label">Offene Tasks</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🔄</span>
                        <div class="stat-content">
                            <span class="stat-value">3</span>
                            <span class="stat-label">In Arbeit</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">✅</span>
                        <div class="stat-content">
                            <span class="stat-value">12</span>
                            <span class="stat-label">Abgeschlossen</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">⏱️</span>
                        <div class="stat-content">
                            <span class="stat-value">18h</span>
                            <span class="stat-label">Zeit gespart</span>
                        </div>
                    </div>
                </div>

                <!-- Trending Topics -->
                <div class="trending-section">
                    <h3>🔥 Trending Topics in Finance</h3>
                    <div class="trending-grid">
                        <div class="trending-card">
                            <div class="trending-icon">🏦</div>
                            <h4>Basel III/IV</h4>
                            <p class="trending-count">15 Prompts</p>
                            <button class="btn-link">Erkunden →</button>
                        </div>
                        <div class="trending-card">
                            <div class="trending-icon">📊</div>
                            <h4>CSRD Reporting</h4>
                            <p class="trending-count">23 Prompts</p>
                            <button class="btn-link">Erkunden →</button>
                        </div>
                        <div class="trending-card">
                            <div class="trending-icon">🌱</div>
                            <h4>ESG Ratings</h4>
                            <p class="trending-count">18 Prompts</p>
                            <button class="btn-link">Erkunden →</button>
                        </div>
                        <div class="trending-card">
                            <div class="trending-icon">🤖</div>
                            <h4>AI/Automation</h4>
                            <p class="trending-count">31 Prompts</p>
                            <button class="btn-link">Erkunden →</button>
                        </div>
                        <div class="trending-card">
                            <div class="trending-icon">💰</div>
                            <h4>Cryptocurrency</h4>
                            <p class="trending-count">12 Prompts</p>
                            <button class="btn-link">Erkunden →</button>
                        </div>
                        <div class="trending-card">
                            <div class="trending-icon">📦</div>
                            <h4>Supply Chain</h4>
                            <p class="trending-count">19 Prompts</p>
                            <button class="btn-link">Erkunden →</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize dynamic content
        setTimeout(() => {
            window.landingPageUtils.initCalendar();
            window.landingPageUtils.loadNews('wirtschaft');
        }, 100);
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Guten Morgen';
        if (hour < 18) return 'Guten Tag';
        return 'Guten Abend';
    }

    getCurrentDate() {
        return new Date().toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    loadCommandCenter() {
        this.contentArea.innerHTML = `
            <div class="command-center">
                <!-- Header -->
                <div class="command-center-header">
                    <h1 class="command-center-title">🎯 Command Center</h1>
                    <p class="command-center-subtitle">
                        Email Intelligence Hub - KI-gestützte Aufgabenerkennung und Agent-Routing
                    </p>
                </div>

                <!-- Quick Stats -->
                <div class="command-stats">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-icon">📧</span>
                            <span class="stat-badge new">NEU</span>
                        </div>
                        <div class="stat-value" id="stat-new-emails">0</div>
                        <div class="stat-label">Neue E-Mails</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-icon">🤖</span>
                            <span class="stat-badge active">AKTIV</span>
                        </div>
                        <div class="stat-value" id="stat-analyzing">0</div>
                        <div class="stat-label">In Analyse</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-icon">✅</span>
                            <span class="stat-badge">BEREIT</span>
                        </div>
                        <div class="stat-value" id="stat-matched">0</div>
                        <div class="stat-label">Gematched</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-icon">📋</span>
                        </div>
                        <div class="stat-value" id="stat-total">0</div>
                        <div class="stat-label">Gesamt Tasks</div>
                    </div>
                </div>

                <!-- Main Grid -->
                <div class="command-main-grid">
                    <!-- Manual Input Widget -->
                    <div class="input-widget">
                        <div class="widget-header">
                            <h2 class="widget-title">
                                ➕ Neue Aufgabe
                            </h2>
                            <span class="widget-badge">Manuell</span>
                        </div>

                        <div class="task-input-area">
                            <label class="task-input-label">
                                Was möchtest du mit KI lösen?
                            </label>
                            <textarea 
                                id="task-input"
                                class="task-input" 
                                placeholder="z.B. 'Cash Pooling Struktur optimieren'
z.B. 'Steueroptimierung für Q4 analysieren'
z.B. 'M&A Bewertung für Target erstellen'"
                            ></textarea>
                        </div>

                        <div class="task-examples">
                            <div class="examples-title">💡 Häufige Aufgaben</div>
                            <div class="example-tags">
                                <span class="example-tag">Cash Pooling optimieren</span>
                                <span class="example-tag">Steueroptimierung Q4</span>
                                <span class="example-tag">Budget Review 2026</span>
                                <span class="example-tag">CSRD Reporting</span>
                                <span class="example-tag">M&A Valuation</span>
                                <span class="example-tag">Liquiditätsplanung</span>
                            </div>
                        </div>

                        <div class="input-actions">
                            <button id="analyze-task-btn" class="btn-primary">
                                🤖 AI Matching starten
                            </button>
                            <button class="btn-secondary">
                                Zurücksetzen
                            </button>
                        </div>
                    </div>

                    <!-- Email Intelligence Widget -->
                    <div class="email-widget">
                        <div class="widget-header">
                            <h2 class="widget-title">
                                📧 Email Intelligence
                            </h2>
                            <div class="email-header">
                                <span class="email-count" id="email-count">0 neue E-Mails</span>
                                <button id="refresh-emails-btn" class="btn-icon">🔄 Aktualisieren</button>
                            </div>
                        </div>

                        <div class="email-list" id="email-list">
                            <!-- Populated by JS -->
                        </div>
                    </div>
                </div>

                <!-- Task Queue -->
                <div class="task-queue">
                    <div class="queue-header">
                        <h2 class="widget-title">📋 Aktive Aufgaben</h2>
                        <div class="queue-filters">
                            <button class="filter-btn active" data-filter="all">Alle</button>
                            <button class="filter-btn" data-filter="manual">Manuelle Tasks</button>
                            <button class="filter-btn" data-filter="email">Email Tasks</button>
                        </div>
                    </div>

                    <div class="task-list" id="task-list">
                        <!-- Populated by JS -->
                    </div>
                </div>
            </div>

            <!-- AI Matching Modal -->
            <div id="matching-modal" class="matching-modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">🤖 AI Matching Results</h2>
                        <p class="modal-subtitle">Die besten Agents für deine Aufgabe</p>
                    </div>
                    <div class="modal-body" id="modal-body">
                        <!-- Populated by JS -->
                    </div>
                    <div class="modal-footer">
                        <button id="close-modal-btn" class="btn-secondary">Schließen</button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize Command Center
        setTimeout(() => {
            if (window.commandCenter) {
                window.commandCenter.init();
            }
        }, 100);
    }

    loadAgents() {
        this.contentArea.innerHTML = `
            <div class="section-placeholder">
                <div class="icon">🤖</div>
                <h2>AI Agents</h2>
                <p>
                    1.400 spezialisierte KI-Assistenten.<br>
                    Von Financial Analysis bis Prozessoptimierung.
                </p>
                <span class="coming-soon">In Entwicklung</span>
            </div>
        `;
    }

    loadWorkflows() {
        this.contentArea.innerHTML = `
            <div class="section-placeholder">
                <div class="icon">⚙️</div>
                <h2>Workflows</h2>
                <p>
                    Automatisierte Prozesse und Analysen.<br>
                    Von Datenerfassung bis Reporting.
                </p>
                <span class="coming-soon">In Entwicklung</span>
            </div>
        `;
    }

    loadPrompts(context = null) {
        this.contentArea.innerHTML = `
            <div class="prompts-container">
                <!-- Header -->
                <div class="prompts-header">
                    <h1 class="prompts-title">💡 Prompts</h1>
                    <p class="prompts-subtitle">
                        Deine fertigen Prompts - bereit zur Ausführung mit automatischem Context
                    </p>
                </div>

                <!-- Content (populated by prompts.js) -->
                <div id="prompts-content">
                    <!-- Populated by PromptsEngine -->
                </div>
            </div>
        `;
        
        // ✅ FIX: Call initPromptsTab() to create AND initialize the engine
        setTimeout(() => {
            if (window.initPromptsTab) {
                console.log('🎯 Calling initPromptsTab() from main-nav.js');
                window.initPromptsTab();
                
                // If context provided, apply it after initialization
                if (context) {
                    setTimeout(() => {
                        if (window.promptsEngine) {
                            console.log('📝 Applying context to PromptsEngine:', context);
                            window.promptsEngine.applyContext(context);
                        }
                    }, 50);
                }
            } else {
                console.error('❌ initPromptsTab() function not found! Make sure prompts.js is loaded.');
            }
        }, 100);
    }
    
    /**
     * Load Prompts with Context (direct call from Command Center)
     */
    loadPromptsWithContext(context) {
        // First switch to prompts tab
        this.switchSection('prompts');
        
        // ✅ FIX: Call initPromptsTab() and then apply context
        setTimeout(() => {
            if (window.initPromptsTab) {
                console.log('🎯 Calling initPromptsTab() with context:', context);
                window.initPromptsTab();
                
                // Apply context after initialization
                setTimeout(() => {
                    if (window.promptsEngine && context) {
                        console.log('📝 Applying context to PromptsEngine');
                        window.promptsEngine.applyContext(context);
                    }
                }, 50);
            } else {
                console.error('❌ initPromptsTab() function not found!');
            }
        }, 200);
    }

    loadCases() {
        this.contentArea.innerHTML = `
            <div class="cases-overview">
                <h2>📊 Cases</h2>
                <p>Wähle einen Case-Type für deine Analyse:</p>
                
                <div class="case-types-grid">
                    <div class="case-type-card">
                        <h3>💼 Business Case Controller</h3>
                        <p>KI-gestützte Business Case Analyse mit Geschäftsmodell, Finanzplanung und Wirtschaftlichkeit</p>
                        <button onclick="window.openCase('business-case-controller')">
                            Case öffnen
                        </button>
                    </div>

                    <div class="case-type-card">
                        <h3>🤝 M&A Analysis</h3>
                        <p>Merger & Acquisition Cases mit Valuation, Due Diligence und Synergieanalyse</p>
                        <button onclick="window.openCase('ma-analysis')">
                            Case öffnen
                        </button>
                    </div>

                    <div class="case-type-card">
                        <h3>📈 Financial Statements</h3>
                        <p>Bilanz, GuV, Cash Flow Analyse mit automatischer KI-Bewertung</p>
                        <button onclick="window.openCase('financial-statements')">
                            Case öffnen
                        </button>
                    </div>

                    <div class="case-type-card">
                        <h3>💰 Cash Flow Planning</h3>
                        <p>Liquiditätsplanung und Working Capital Management</p>
                        <button onclick="window.openCase('cash-flow')">
                            Case öffnen
                        </button>
                    </div>

                    <div class="case-type-card">
                        <h3>📊 Controlling Dashboard</h3>
                        <p>Monatliches Controlling, KPI-Tracking und Abweichungsanalyse</p>
                        <button onclick="window.openCase('controlling')">
                            Case öffnen
                        </button>
                    </div>

                    <div class="case-type-card">
                        <h3>🎯 Business Planning</h3>
                        <p>Strategische Planung, Budget-Szenarien und Forecasting</p>
                        <button onclick="window.openCase('business-planning')">
                            Case öffnen
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

/* ========================================== */
/* CASE OPENER FUNCTION */
/* ========================================== */

window.openCase = function(caseType) {
    console.log(`🔗 Opening case: ${caseType}`);
    
    switch(caseType) {
        case 'business-case-controller':
            // Öffne den aktuellen Business Case
            window.location.href = 'index.html';
            break;
        
        case 'ma-analysis':
            window.location.href = 'cases/ma-case/index.html';
            break;
        
        case 'financial-statements':
            alert('🚧 Financial Statements Case in Entwicklung');
            break;
        
        case 'cash-flow':
            alert('🚧 Cash Flow Planning Case in Entwicklung');
            break;
        
        case 'controlling':
            alert('🚧 Controlling Dashboard Case in Entwicklung');
            break;
        
        case 'business-planning':
            alert('🚧 Business Planning Case in Entwicklung');
            break;
        
        default:
            console.error('Unknown case type:', caseType);
    }
};

// Create global instance
window.platformNavigation = new PlatformNavigation();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.platformNavigation.init();
    });
} else {
    window.platformNavigation.init();
}

console.log('✅ Platform Navigation loaded');
