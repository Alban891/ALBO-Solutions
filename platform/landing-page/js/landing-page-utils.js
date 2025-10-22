/* ========================================== */
/* LANDING PAGE UTILITIES */
/* Handles calendar, news, and interactive features */
/* ========================================== */

class LandingPageUtils {
    constructor() {
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.selectedDate = new Date();
        this.currentCategory = 'wirtschaft';
        
        console.log('📅 Landing Page Utils initialized');
    }

    /* ========================================== */
    /* CALENDAR FUNCTIONS */
    /* ========================================== */

    initCalendar() {
        this.renderCalendar();
        this.loadNoteFromStorage();
        this.loadRemindersFromStorage();
    }

    renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        if (!grid) return;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Month/Year header
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        document.getElementById('calendar-month').textContent = 
            `${monthNames[this.currentMonth]} ${this.currentYear}`;

        let html = '';

        // Weekday headers
        const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        weekdays.forEach(day => {
            html += `<div class="weekday-header">${day}</div>`;
        });

        // Empty cells before first day (Monday = 0)
        const startDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
        for (let i = 0; i < startDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Calendar days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate() && 
                           this.currentMonth === today.getMonth() && 
                           this.currentYear === today.getFullYear();
            
            const classes = ['calendar-day'];
            if (isToday) classes.push('today');

            html += `<div class="${classes.join(' ')}" onclick="window.landingPageUtils.selectDay(${day})">${day}</div>`;
        }

        grid.innerHTML = html;
    }

    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.renderCalendar();
    }

    selectDay(day) {
        this.selectedDate = new Date(this.currentYear, this.currentMonth, day);
        console.log('Selected date:', this.selectedDate);
        // Could load notes for this specific day
    }

    saveNote() {
        const noteInput = document.getElementById('calendar-note');
        if (!noteInput) return;

        const note = noteInput.value.trim();
        if (note) {
            localStorage.setItem('calendar-note', note);
            this.showToast('Notiz gespeichert! ✅');
        }
    }

    loadNoteFromStorage() {
        const note = localStorage.getItem('calendar-note');
        const noteInput = document.getElementById('calendar-note');
        if (noteInput && note) {
            noteInput.value = note;
        }
    }

    addReminder() {
        const reminderText = prompt('Neue Erinnerung:');
        if (reminderText && reminderText.trim()) {
            const reminders = this.getReminders();
            reminders.push({
                text: reminderText.trim(),
                completed: false,
                date: new Date().toISOString()
            });
            this.saveReminders(reminders);
            this.renderReminders();
        }
    }

    removeReminder(index) {
        const reminders = this.getReminders();
        reminders.splice(index, 1);
        this.saveReminders(reminders);
        this.renderReminders();
    }

    getReminders() {
        const stored = localStorage.getItem('calendar-reminders');
        return stored ? JSON.parse(stored) : [
            { text: 'Q4 Forecast Review', completed: false },
            { text: 'Bank Meeting vorbereiten', completed: false }
        ];
    }

    saveReminders(reminders) {
        localStorage.setItem('calendar-reminders', JSON.stringify(reminders));
    }

    loadRemindersFromStorage() {
        this.renderReminders();
    }

    renderReminders() {
        const list = document.getElementById('reminder-list');
        if (!list) return;

        const reminders = this.getReminders();
        list.innerHTML = reminders.map((reminder, index) => `
            <li class="reminder-item">
                <input type="checkbox" ${reminder.completed ? 'checked' : ''} 
                       onchange="window.landingPageUtils.toggleReminder(${index})"/>
                <span style="${reminder.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${reminder.text}</span>
                <button class="btn-icon-sm" onclick="window.landingPageUtils.removeReminder(${index})">🗑️</button>
            </li>
        `).join('');
    }

    toggleReminder(index) {
        const reminders = this.getReminders();
        reminders[index].completed = !reminders[index].completed;
        this.saveReminders(reminders);
        this.renderReminders();
    }

    /* ========================================== */
    /* NEWS FUNCTIONS */
    /* ========================================== */

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update tab active state
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        this.loadNews(category);
    }

    loadNews(category) {
        const feed = document.getElementById('news-feed');
        if (!feed) return;

        feed.innerHTML = '<div class="loading">Lade Nachrichten...</div>';

        setTimeout(() => {
            const newsData = this.getMockNews(category);
            this.renderNews(newsData);
        }, 500);
    }

    refreshNews() {
        this.showToast('Aktualisiere Nachrichten...');
        this.loadNews(this.currentCategory);
    }

    getMockNews(category) {
        const newsDatabase = {
            wirtschaft: [
                {
                    badge: '🔴 BREAKING',
                    time: 'Vor 2 Stunden',
                    title: 'Trump verschärft Zölle auf EU-Importe um 25%',
                    summary: 'US-Präsident Donald Trump kündigte neue Zölle auf europäische Importe an. Stahl +25%, Automobile +15%. Wirkung ab 1. November 2025.',
                    source: 'Reuters',
                    featured: true,
                    analysis: {
                        impacts: [
                            'Höhere Einkaufspreise: EU-Importe werden 12-18% teurer',
                            'Margin Druck: Deckungsbeiträge sinken um 2-3 Prozentpunkte',
                            'FX Volatilität: EUR/USD Wechselkurs unter Druck',
                            'Lieferketten: Alternative Sourcing notwendig'
                        ],
                        roles: [
                            {
                                name: 'Treasury Manager',
                                icon: '🏦',
                                tasks: [
                                    'FX Hedging Strategy überprüfen',
                                    'Liquidität für höhere Zahlungen sichern',
                                    'Cash Flow Forecast anpassen'
                                ]
                            },
                            {
                                name: 'Bilanzbuchhalter',
                                icon: '📊',
                                tasks: [
                                    'Neue Zollbuchungen einrichten',
                                    'Inventory Valuation prüfen',
                                    'Deferred Tax Positionen anpassen'
                                ]
                            },
                            {
                                name: 'Einkauf & Supply Chain',
                                icon: '📦',
                                tasks: [
                                    'Lieferanten-Kalkulation updaten',
                                    'Alternative Lieferanten evaluieren',
                                    'Vertragsanpassungen initiieren'
                                ]
                            }
                        ],
                        prompts: [
                            'FX Hedging Strategy entwickeln',
                            'Zollkalkulation für Importe',
                            'Alternative Lieferanten evaluieren',
                            'Margin Impact Analyse',
                            'Cash Flow Forecast Update'
                        ]
                    }
                },
                {
                    badge: '📊',
                    time: 'Vor 5 Stunden',
                    title: 'EZB senkt Leitzins um 0,25 Prozentpunkte',
                    summary: 'Die Europäische Zentralbank reduziert den Hauptrefinanzierungssatz auf 3,75%. Experten erwarten weitere Senkungen in Q1 2026.',
                    source: 'Bloomberg',
                    relevance: 'medium'
                },
                {
                    badge: '💼',
                    time: 'Vor 8 Stunden',
                    title: 'Deutsche Wirtschaft wächst unerwartet stark',
                    summary: 'BIP-Wachstum im Q3 2025 bei 0,6% - deutlich über den Erwartungen von 0,3%. Haupttreiber: Exporte und Investitionen.',
                    source: 'Handelsblatt',
                    relevance: 'high'
                }
            ],
            politik: [
                {
                    badge: '🏛️',
                    time: 'Vor 3 Stunden',
                    title: 'EU plant neue Regulierung für Finanztransparenz',
                    summary: 'Strengere Reporting-Pflichten für Unternehmen ab 2026. CSRD wird auf kleinere Unternehmen ausgeweitet.',
                    source: 'Financial Times',
                    relevance: 'high'
                },
                {
                    badge: '⚖️',
                    time: 'Vor 6 Stunden',
                    title: 'Bundesregierung beschließt Steuerreform',
                    summary: 'Körperschaftsteuer bleibt bei 15%, aber neue Abzugsmöglichkeiten für F&E-Investitionen.',
                    source: 'Reuters',
                    relevance: 'high'
                }
            ],
            unternehmen: [
                {
                    badge: '🏢',
                    time: 'Vor 1 Stunde',
                    title: 'Siemens übernimmt US-Softwarefirma für $2,5 Mrd',
                    summary: 'Siemens Energy gibt Übernahme von Brightly Software bekannt. Strategischer Schritt in Richtung Digitalisierung.',
                    source: 'Manager Magazin',
                    relevance: 'high'
                },
                {
                    badge: '📈',
                    time: 'Vor 4 Stunden',
                    title: 'SAP überrascht mit starken Q3-Zahlen',
                    summary: 'Cloud-Umsatz +28%, Gesamtumsatz €8,5 Mrd. Prognose für 2025 angehoben.',
                    source: 'Handelsblatt',
                    relevance: 'medium'
                }
            ],
            maerkte: [
                {
                    badge: '📈',
                    time: 'Vor 30 Minuten',
                    title: 'Ölpreis steigt auf $85 pro Barrel',
                    summary: 'OPEC-Förderkürzungen und geopolitische Spannungen treiben Preis. Analysten erwarten weiteren Anstieg.',
                    source: 'Bloomberg Markets',
                    relevance: 'high'
                },
                {
                    badge: '💱',
                    time: 'Vor 2 Stunden',
                    title: 'EUR/USD fällt unter 1,08',
                    summary: 'Euro schwächelt nach US-Zinssignalen. Weitere Abwertung möglich.',
                    source: 'Reuters',
                    relevance: 'high'
                }
            ],
            technologie: [
                {
                    badge: '💻',
                    time: 'Vor 4 Stunden',
                    title: 'OpenAI launcht GPT-5 mit revolutionären Features',
                    summary: 'Neue KI-Funktionen für Enterprise: Multi-Modal, besseres Reasoning, native Excel-Integration.',
                    source: 'TechCrunch',
                    relevance: 'high'
                },
                {
                    badge: '🤖',
                    time: 'Vor 7 Stunden',
                    title: 'KI-Adoption in Finance steigt auf 67%',
                    summary: 'Studie zeigt: Zwei Drittel aller CFOs nutzen KI-Tools für Forecasting und Analyse.',
                    source: 'Bloomberg Tech',
                    relevance: 'high'
                }
            ],
            boerse: [
                {
                    badge: '💹',
                    time: 'Vor 20 Minuten',
                    title: 'DAX erreicht neues Allzeithoch bei 19.500',
                    summary: 'Deutsche Aktien profitieren von starken Unternehmenszahlen und Zinssenkungen.',
                    source: 'Börse Online',
                    relevance: 'medium'
                },
                {
                    badge: '📊',
                    time: 'Vor 3 Stunden',
                    title: 'Volkswagen IPO für Software-Sparte geplant',
                    summary: 'Cariad soll 2026 an die Börse. Bewertung: €10-15 Mrd.',
                    source: 'Manager Magazin',
                    relevance: 'medium'
                }
            ]
        };

        return newsDatabase[category] || [];
    }

    renderNews(newsArray) {
        const feed = document.getElementById('news-feed');
        if (!feed) return;

        if (newsArray.length === 0) {
            feed.innerHTML = '<div class="no-news">Keine Nachrichten in dieser Kategorie.</div>';
            return;
        }

        let html = '';

        newsArray.forEach((news, index) => {
            if (news.featured) {
                html += this.renderFeaturedNews(news);
            } else {
                html += this.renderCompactNews(news, index);
            }
        });

        feed.innerHTML = html;
    }

    renderFeaturedNews(news) {
        return `
            <div class="news-card featured">
                <div class="news-header">
                    <span class="news-badge breaking">${news.badge}</span>
                    <span class="news-time">${news.time}</span>
                </div>
                
                <h3 class="news-title">${news.title}</h3>
                <p class="news-summary">${news.summary}</p>
                
                <div class="news-source">
                    <span>📰 ${news.source}</span>
                </div>
                
                ${news.analysis ? this.renderAnalysis(news.analysis) : ''}
            </div>
        `;
    }

    renderAnalysis(analysis) {
        return `
            <div class="ai-analysis">
                <div class="analysis-header">
                    <span class="ai-icon">🤖</span>
                    <strong>ALBO Analyse</strong>
                    <span class="confidence-badge">92% Confidence</span>
                </div>
                
                <div class="analysis-section">
                    <h5>💡 Was bedeutet das?</h5>
                    <ul class="impact-list">
                        ${analysis.impacts.map(impact => `<li>${impact}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="analysis-section">
                    <h5>👥 Wen tangiert das?</h5>
                    ${analysis.roles.map(role => `
                        <div class="affected-role">
                            <div class="role-header">
                                <span class="role-icon">${role.icon}</span>
                                <strong>${role.name}</strong>
                            </div>
                            <ul class="task-list">
                                ${role.tasks.map(task => `<li>${task}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
                
                <div class="analysis-section">
                    <h5>🎯 Relevante Prompts</h5>
                    <div class="prompt-tags">
                        ${analysis.prompts.map(prompt => `
                            <button class="prompt-tag">→ ${prompt}</button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="news-actions">
                    <button class="btn-primary btn-sm">Vollständige Analyse</button>
                    <button class="btn-secondary btn-sm">Zu Tasks hinzufügen</button>
                </div>
            </div>
        `;
    }

    renderCompactNews(news, index) {
        return `
            <div class="news-card compact" id="news-${index}">
                <div class="news-header">
                    <span class="news-badge">${news.badge}</span>
                    <span class="news-time">${news.time}</span>
                </div>
                
                <h4 class="news-title">${news.title}</h4>
                <p class="news-snippet">${news.summary}</p>
                
                <div class="news-preview">
                    <span class="relevance-badge ${news.relevance}">
                        Relevanz: ${news.relevance === 'high' ? 'Hoch' : news.relevance === 'medium' ? 'Mittel' : 'Niedrig'}
                    </span>
                    <button class="btn-expand" onclick="window.landingPageUtils.expandNews(${index})">
                        Analyse anzeigen →
                    </button>
                </div>
            </div>
        `;
    }

    expandNews(index) {
        // TODO: Load full analysis for this news item
        this.showToast('Analyse wird geladen...');
    }

    /* ========================================== */
    /* UTILITY FUNCTIONS */
    /* ========================================== */

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Create global instance
window.landingPageUtils = new LandingPageUtils();

console.log('✅ Landing Page Utils loaded');