/**
 * CFO Dashboard - Modulares Dashboard System
 * Konfigurierbares Widget-basiertes Dashboard für Projekt-Analysen
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';
import * as charts from '../charts.js';

// ========================================
// WIDGET DEFINITIONEN
// ========================================

const WIDGET_LIBRARY = {
    // KPI Widgets (klein)
    npv: {
        id: 'npv',
        name: 'NPV',
        category: 'kpi',
        defaultSize: 'small',
        icon: '💰',
        render: renderNPVWidget
    },
    irr: {
        id: 'irr',
        name: 'IRR',
        category: 'kpi',
        defaultSize: 'small',
        icon: '📈',
        render: renderIRRWidget
    },
    payback: {
        id: 'payback',
        name: 'Payback',
        category: 'kpi',
        defaultSize: 'small',
        icon: '📅',
        render: renderPaybackWidget
    },
    margin: {
        id: 'margin',
        name: 'DB2-Marge Ø',
        category: 'kpi',
        defaultSize: 'small',
        icon: '💎',
        render: renderMarginWidget
    },
    
    // Chart Widgets (mittel/groß)
    umsatzChart: {
        id: 'umsatzChart',
        name: 'Umsatzentwicklung',
        category: 'charts',
        defaultSize: 'medium',
        icon: '📊',
        render: renderUmsatzChart
    },
    projektkostenChart: {
        id: 'projektkostenChart',
        name: 'Projektkosten',
        category: 'charts',
        defaultSize: 'medium',
        icon: '💰',
        render: renderProjektkostenChart
    },
    projektkostenKumuliert: {
        id: 'projektkostenKumuliert',
        name: 'Projektkosten kumuliert',
        category: 'charts',
        defaultSize: 'medium',
        icon: '📈',
        render: renderProjektkostenKumuliert
    },
    db3Chart: {
        id: 'db3Chart',
        name: 'DB3 pro Jahr',
        category: 'charts',
        defaultSize: 'medium',
        icon: '💵',
        render: renderDB3Chart
    },
    db3Kumuliert: {
        id: 'db3Kumuliert',
        name: 'DB3 kumuliert',
        category: 'charts',
        defaultSize: 'medium',
        icon: '📈',
        render: renderDB3Kumuliert
    },
    amortisation: {
        id: 'amortisation',
        name: 'Amortisation',
        category: 'charts',
        defaultSize: 'large',
        icon: '⏱️',
        render: renderAmortisationChart
    }
};

// ========================================
// DASHBOARD TEMPLATES
// ========================================

const DASHBOARD_TEMPLATES = {
    starter: {
        name: 'Starter View',
        description: 'Einfache Übersicht mit den wichtigsten KPIs',
        widgets: ['npv', 'payback', 'umsatzChart']
    },
    cfo: {
        name: 'CFO View',
        description: 'Executive Dashboard mit Fokus auf Wertschöpfung',
        widgets: ['npv', 'irr', 'payback', 'margin', 'db3Kumuliert', 'amortisation']
    },
    controller: {
        name: 'Controller View',
        description: 'Detaillierte Kosten- und Profitabilitätsanalyse',
        widgets: ['margin', 'projektkostenChart', 'projektkostenKumuliert', 'db3Chart', 'db3Kumuliert']
    },
    projektmanager: {
        name: 'Projekt Manager View',
        description: 'Projekt-Status und Fortschritt',
        widgets: ['payback', 'projektkostenChart', 'umsatzChart', 'db3Chart']
    }
};

// ========================================
// DASHBOARD STATE
// ========================================

let dashboardState = {
    editMode: false,
    currentTemplate: 'starter',
    activeWidgets: [],
    layout: 'grid', // grid oder flex
    gridColumns: 4
};

// ========================================
// RENDER MAIN DASHBOARD
// ========================================

export function renderProjektDashboard() {
    const container = document.getElementById('projekt-tab-dashboard');
    if (!container) return;
    
    // Load saved configuration
    loadDashboardConfig();
    
    container.innerHTML = `
        <div class="dashboard-wrapper">
            <!-- Dashboard Header mit Controls -->
            <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: white; border-radius: 8px; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0;">📊 Projekt-Dashboard</h3>
                    <p style="margin: 4px 0 0 0; color: var(--gray); font-size: 12px;">
                        ${dashboardState.editMode ? 'Bearbeitungsmodus - Widgets hinzufügen oder entfernen' : 'Interaktives Dashboard mit anpassbaren Widgets'}
                    </p>
                </div>
                
                <div style="display: flex; gap: 12px; align-items: center;">
                    <!-- Template Selector -->
                    <select id="dashboard-template" onchange="window.loadDashboardTemplate(this.value)"
                            style="padding: 8px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 12px;">
                        <option value="">-- Template wählen --</option>
                        ${Object.entries(DASHBOARD_TEMPLATES).map(([key, template]) => `
                            <option value="${key}" ${dashboardState.currentTemplate === key ? 'selected' : ''}>
                                ${template.name}
                            </option>
                        `).join('')}
                    </select>
                    
                    <!-- Edit Mode Toggle -->
                    <button class="btn ${dashboardState.editMode ? 'btn-primary' : 'btn-secondary'}"
                            onclick="window.toggleDashboardEditMode()">
                        ${dashboardState.editMode ? '✅ Fertig' : '✏️ Bearbeiten'}
                    </button>
                    
                    <!-- Reset Button -->
                    <button class="btn btn-secondary" onclick="window.resetDashboard()">
                        🔄 Zurücksetzen
                    </button>
                </div>
            </div>
            
            <!-- Widget Selector (nur im Edit Mode) -->
            ${dashboardState.editMode ? renderWidgetSelector() : ''}
            
            <!-- Dashboard Grid -->
            <div id="dashboard-grid" class="dashboard-grid" style="
                display: grid;
                grid-template-columns: repeat(${dashboardState.gridColumns}, 1fr);
                gap: 16px;
                min-height: 400px;
                ${dashboardState.editMode ? 'border: 2px dashed var(--border); padding: 20px; border-radius: 8px;' : ''}
            ">
                ${renderActiveWidgets()}
            </div>
            
            <!-- Empty State -->
            ${dashboardState.activeWidgets.length === 0 ? `
                <div style="text-align: center; padding: 60px 20px; background: var(--bg-secondary); border-radius: 8px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <h4>Dashboard ist leer</h4>
                    <p style="color: var(--gray); margin: 8px 0 20px;">
                        Klicken Sie auf "Bearbeiten" und fügen Sie Widgets hinzu oder wählen Sie ein Template.
                    </p>
                    <button class="btn btn-primary" onclick="window.loadDashboardTemplate('starter')">
                        Starter Template laden
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    // Initialize charts after DOM is ready
    setTimeout(() => {
        dashboardState.activeWidgets.forEach(widgetId => {
            const widget = WIDGET_LIBRARY[widgetId];
            if (widget && widget.category === 'charts') {
                initializeWidgetChart(widgetId);
            }
        });
    }, 100);
}

// ========================================
// WIDGET SELECTOR (Edit Mode)
// ========================================

function renderWidgetSelector() {
    const categories = {
        kpi: 'KPI Kacheln',
        charts: 'Diagramme',
        analysis: 'Analysen'
    };
    
    return `
        <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; border: 2px solid var(--primary);">
            <h4 style="margin: 0 0 12px 0;">🎯 Widgets hinzufügen</h4>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                ${Object.entries(categories).map(([category, label]) => `
                    <div>
                        <div style="font-size: 11px; font-weight: 600; color: var(--gray); margin-bottom: 8px; text-transform: uppercase;">
                            ${label}
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${Object.values(WIDGET_LIBRARY)
                                .filter(w => w.category === category)
                                .map(widget => `
                                    <button 
                                        class="widget-selector-btn ${dashboardState.activeWidgets.includes(widget.id) ? 'active' : ''}"
                                        onclick="window.toggleWidget('${widget.id}')"
                                        style="
                                            padding: 8px 12px;
                                            border: 1px solid ${dashboardState.activeWidgets.includes(widget.id) ? 'var(--success)' : 'var(--border)'};
                                            background: ${dashboardState.activeWidgets.includes(widget.id) ? 'var(--success-bg)' : 'white'};
                                            border-radius: 4px;
                                            font-size: 12px;
                                            cursor: pointer;
                                            transition: all 0.2s;
                                        ">
                                        ${widget.icon} ${widget.name}
                                        ${dashboardState.activeWidgets.includes(widget.id) ? '✓' : '+'}
                                    </button>
                                `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ========================================
// RENDER ACTIVE WIDGETS
// ========================================

function renderActiveWidgets() {
    if (dashboardState.activeWidgets.length === 0) {
        return '';
    }
    
    return dashboardState.activeWidgets.map(widgetId => {
        const widget = WIDGET_LIBRARY[widgetId];
        if (!widget) return '';
        
        const gridSize = getGridSize(widget.defaultSize);
        
        return `
            <div class="dashboard-widget ${widget.defaultSize}" 
                 id="widget-${widget.id}"
                 style="
                     grid-column: span ${gridSize};
                     background: white;
                     border-radius: 8px;
                     padding: 16px;
                     border: 1px solid var(--border);
                     position: relative;
                     ${dashboardState.editMode ? 'cursor: move;' : ''}
                 ">
                ${dashboardState.editMode ? `
                    <button onclick="window.removeWidget('${widget.id}')" 
                            style="position: absolute; top: 8px; right: 8px; background: var(--danger); color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 10px; cursor: pointer;">
                        ✕
                    </button>
                ` : ''}
                ${widget.render()}
            </div>
        `;
    }).join('');
}

function getGridSize(size) {
    switch(size) {
        case 'small': return 1;
        case 'medium': return 2;
        case 'large': return 3;
        case 'xlarge': return 4;
        default: return 2;
    }
}

// ========================================
// WIDGET RENDER FUNCTIONS
// ========================================

function renderNPVWidget() {
    const npv = calculateProjectNPV();
    return `
        <div class="kpi-widget">
            <div style="font-size: 12px; color: var(--gray); margin-bottom: 8px;">💰 NPV (8% WACC)</div>
            <div style="font-size: 28px; font-weight: bold; color: var(--primary);">${npv}M€</div>
            <div style="font-size: 11px; color: var(--success);">↑ +12% vs. Plan</div>
        </div>
    `;
}

function renderIRRWidget() {
    return `
        <div class="kpi-widget">
            <div style="font-size: 12px; color: var(--gray); margin-bottom: 8px;">📈 IRR</div>
            <div style="font-size: 28px; font-weight: bold; color: var(--success);">28%</div>
            <div style="font-size: 11px; color: var(--gray);">Hurdle: 15%</div>
        </div>
    `;
}

function renderPaybackWidget() {
    return `
        <div class="kpi-widget">
            <div style="font-size: 12px; color: var(--gray); margin-bottom: 8px;">📅 Payback Period</div>
            <div style="font-size: 28px; font-weight: bold; color: var(--warning);">3,4 Jahre</div>
            <div style="font-size: 11px; color: var(--success);">✓ < 4 Jahre</div>
        </div>
    `;
}

function renderMarginWidget() {
    return `
        <div class="kpi-widget">
            <div style="font-size: 12px; color: var(--gray); margin-bottom: 8px;">💎 Ø DB2-Marge</div>
            <div style="font-size: 28px; font-weight: bold; color: var(--info);">34%</div>
            <div style="font-size: 11px; color: var(--success);">Über Benchmark</div>
        </div>
    `;
}

function renderUmsatzChart() {
    return `
        <div class="chart-widget">
            <h4 style="margin: 0 0 12px 0; font-size: 14px;">📊 Umsatzentwicklung</h4>
            <canvas id="widget-umsatz-chart" style="max-height: 200px;"></canvas>
        </div>
    `;
}

function renderProjektkostenChart() {
    return `
        <div class="chart-widget">
            <h4 style="margin: 0 0 12px 0; font-size: 14px;">💰 Projektkosten pro Jahr</h4>
            <canvas id="widget-projektkosten-chart" style="max-height: 200px;"></canvas>
        </div>
    `;
}

function renderProjektkostenKumuliert() {
    return `
        <div class="chart-widget">
            <h4 style="margin: 0 0 12px 0; font-size: 14px;">📈 Kumulierte Projektkosten</h4>
            <div style="text-align: center; padding: 40px 0;">
                <div style="font-size: 36px; font-weight: bold; color: var(--primary);">18,8M€</div>
                <div style="font-size: 12px; color: var(--gray);">Gesamt über Projektlaufzeit</div>
            </div>
        </div>
    `;
}

function renderDB3Chart() {
    return `
        <div class="chart-widget">
            <h4 style="margin: 0 0 12px 0; font-size: 14px;">💵 DB3 pro Jahr</h4>
            <canvas id="widget-db3-chart" style="max-height: 200px;"></canvas>
        </div>
    `;
}

function renderDB3Kumuliert() {
    return `
        <div class="chart-widget">
            <h4 style="margin: 0 0 12px 0; font-size: 14px;">📈 DB3 kumuliert</h4>
            <canvas id="widget-db3-kum-chart" style="max-height: 200px;"></canvas>
        </div>
    `;
}

function renderAmortisationChart() {
    return `
        <div class="chart-widget">
            <h4 style="margin: 0 0 12px 0; font-size: 14px;">⏱️ Amortisation</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: var(--success);">3,4</div>
                    <div style="font-size: 12px; color: var(--gray);">Jahre</div>
                </div>
                <div>
                    <div style="font-size: 11px; color: var(--gray); margin-bottom: 4px;">Szenarien:</div>
                    <div style="font-size: 12px;">Best Case: 2,8 Jahre</div>
                    <div style="font-size: 12px;">Base Case: 3,4 Jahre</div>
                    <div style="font-size: 12px;">Worst Case: 4,2 Jahre</div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// CHART INITIALIZATION
// ========================================

function initializeWidgetChart(widgetId) {
    const projektId = window.cfoDashboard.currentProjekt;
    const artikel = state.getArtikelByProjekt(projektId);
    
    switch(widgetId) {
        case 'umsatzChart':
            initUmsatzChart(artikel);
            break;
        case 'projektkostenChart':
            initProjektkostenChart();
            break;
        case 'db3Chart':
            initDB3Chart(artikel);
            break;
        case 'db3Kumuliert':
            initDB3KumuliertChart(artikel);
            break;
    }
}

function initUmsatzChart(artikel) {
    const canvas = document.getElementById('widget-umsatz-chart');
    if (!canvas) return;
    
    const jahre = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
    const umsatzData = jahre.map(jahr => {
        let sum = 0;
        artikel?.forEach(a => {
            const yearData = a[`jahr_${jahr - 2023}`];
            if (yearData) {
                sum += (parseFloat(yearData.menge) || 0) * (parseFloat(yearData.preis) || 0);
            }
        });
        return sum / 1000; // in M€
    });
    
    new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: jahre,
            datasets: [{
                label: 'Umsatz',
                data: umsatzData,
                backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => value + 'M€'
                    }
                }
            }
        }
    });
}

// ========================================
// WINDOW FUNCTIONS
// ========================================

window.toggleDashboardEditMode = function() {
    dashboardState.editMode = !dashboardState.editMode;
    saveDashboardConfig();
    renderProjektDashboard();
};

window.toggleWidget = function(widgetId) {
    const index = dashboardState.activeWidgets.indexOf(widgetId);
    if (index > -1) {
        dashboardState.activeWidgets.splice(index, 1);
    } else {
        dashboardState.activeWidgets.push(widgetId);
    }
    saveDashboardConfig();
    renderProjektDashboard();
};

window.removeWidget = function(widgetId) {
    const index = dashboardState.activeWidgets.indexOf(widgetId);
    if (index > -1) {
        dashboardState.activeWidgets.splice(index, 1);
        saveDashboardConfig();
        renderProjektDashboard();
    }
};

window.loadDashboardTemplate = function(templateName) {
    const template = DASHBOARD_TEMPLATES[templateName];
    if (template) {
        dashboardState.currentTemplate = templateName;
        dashboardState.activeWidgets = [...template.widgets];
        saveDashboardConfig();
        renderProjektDashboard();
    }
};

window.resetDashboard = function() {
    if (confirm('Dashboard zurücksetzen? Alle Anpassungen gehen verloren.')) {
        dashboardState = {
            editMode: false,
            currentTemplate: 'starter',
            activeWidgets: [...DASHBOARD_TEMPLATES.starter.widgets],
            layout: 'grid',
            gridColumns: 4
        };
        localStorage.removeItem(getDashboardConfigKey());
        renderProjektDashboard();
    }
};

// ========================================
// PERSISTENCE
// ========================================

function getDashboardConfigKey() {
    const projektId = window.cfoDashboard.currentProjekt;
    return `dashboard_config_${projektId}`;
}

function saveDashboardConfig() {
    localStorage.setItem(getDashboardConfigKey(), JSON.stringify(dashboardState));
}

function loadDashboardConfig() {
    const saved = localStorage.getItem(getDashboardConfigKey());
    if (saved) {
        dashboardState = JSON.parse(saved);
    } else {
        // Load default template
        dashboardState.activeWidgets = [...DASHBOARD_TEMPLATES.starter.widgets];
    }
}

// ========================================
// CALCULATIONS
// ========================================

function calculateProjectNPV() {
    // Placeholder - später mit echten Daten
    return "44,7";
}

// ========================================
// EXPORTS
// ========================================

export default {
    renderProjektDashboard
};