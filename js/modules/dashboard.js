/**
 * CFO Dashboard - Projekt Dashboard mit Standard-Charts
 * Basiert auf bewährten Excel-Visualisierungen
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';

// Chart.js global
const Chart = window.Chart;

// ========================================
// DASHBOARD CONFIGURATION
// ========================================

const DASHBOARD_CONFIG = {
    mode: 'standard', // 'standard', 'custom', 'edit'
    gridColumns: 3,
    gridRows: 2
};

// Standard-Charts (aus Excel, immer vorhanden)
const STANDARD_CHARTS = [
    // Zeile 1
    {
        id: 'projektkosten-jahr',
        name: 'Projektkosten',
        type: 'bar',
        position: { row: 0, col: 0 },
        size: { width: 1, height: 1 },
        locked: true,
        data: 'projektkosten'
    },
    {
        id: 'projektkosten-kum',
        name: 'Projektkosten kumuliert',
        type: 'kpi',
        position: { row: 0, col: 1 },
        size: { width: 1, height: 1 },
        locked: true,
        data: 'projektkosten_total'
    },
    {
        id: 'projekte-table',
        name: 'Projekte',
        type: 'table',
        position: { row: 0, col: 2 },
        size: { width: 1, height: 1 },
        locked: true,
        data: 'projekte_liste'
    },
    // Zeile 2
    {
        id: 'db3-jahr',
        name: 'DB 3 pro Jahr',
        type: 'bar',
        position: { row: 1, col: 0 },
        size: { width: 1, height: 1 },
        locked: true,
        data: 'db3_jahr'
    },
    {
        id: 'db3-kumuliert',
        name: 'DB 3 kumuliert',
        type: 'line',
        position: { row: 1, col: 1 },
        size: { width: 1, height: 1 },
        locked: true,
        data: 'db3_kumuliert'
    },
    {
        id: 'amortisation',
        name: 'Amortisation',
        type: 'kpi',
        position: { row: 1, col: 2 },
        size: { width: 1, height: 1 },
        locked: true,
        data: 'payback'
    }
];

// Zusätzliche Charts (können hinzugefügt werden)
const AVAILABLE_CHARTS = {
    revenue: [
        { id: 'umsatz-jahr', name: 'Umsatzentwicklung', type: 'bar', data: 'umsatz' },
        { id: 'absatz-jahr', name: 'Absatzentwicklung', type: 'bar', data: 'absatz' },
        { id: 'preis-trend', name: 'Preisentwicklung', type: 'line', data: 'preise' }
    ],
    profitability: [
        { id: 'db1-chart', name: 'DB1 Entwicklung', type: 'bar', data: 'db1' },
        { id: 'db2-chart', name: 'DB2 & Marge', type: 'combo', data: 'db2' },
        { id: 'waterfall', name: 'Profitability Bridge', type: 'waterfall', data: 'waterfall' }
    ],
    analysis: [
        { id: 'npv-kpi', name: 'NPV', type: 'kpi', data: 'npv' },
        { id: 'irr-kpi', name: 'IRR', type: 'kpi', data: 'irr' },
        { id: 'sensitivity', name: 'Sensitivität', type: 'tornado', data: 'sensitivity' }
    ]
};

// ========================================
// STATE MANAGEMENT
// ========================================

let dashboardState = {
    charts: [...STANDARD_CHARTS],
    customCharts: [],
    editMode: false,
    selectedView: 'standard'
};

// ========================================
// MAIN RENDER FUNCTION
// ========================================

export function renderProjektDashboard() {
    const container = document.getElementById('projekt-tab-dashboard');
    if (!container) return;
    
    // Load saved state
    loadDashboardState();
    
    container.innerHTML = `
        <div class="dashboard-wrapper">
            <!-- Dashboard Header -->
            <div class="dashboard-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: white;
                border-radius: 8px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            ">
                <div>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">
                        📊 Projekt-Dashboard
                    </h3>
                    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">
                        Standard-Ansicht mit Kernmetriken aus Excel
                    </p>
                </div>
                
                <div style="display: flex; gap: 12px; align-items: center;">
                    <!-- View Selector -->
                    <select id="view-selector" 
                            onchange="window.switchDashboardView(this.value)"
                            style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;">
                        <option value="standard" selected>Standard-Ansicht</option>
                        <option value="extended">Erweiterte Ansicht</option>
                        <option value="custom">Benutzerdefiniert</option>
                    </select>
                    
                    <!-- Edit Mode Toggle -->
                    <button class="btn btn-secondary" 
                            onclick="window.toggleDashboardEdit()"
                            style="font-size: 13px;">
                        ${dashboardState.editMode ? '✓ Speichern' : '⚙️ Anpassen'}
                    </button>
                    
                    <!-- Add Chart Button (nur im Edit Mode) -->
                    ${dashboardState.editMode ? `
                        <button class="btn btn-primary" 
                                onclick="window.openChartSelector()"
                                style="font-size: 13px;">
                            + Chart hinzufügen
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <!-- Dashboard Grid -->
            <div class="dashboard-grid" style="
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(2, 400px);
                gap: 16px;
                padding: ${dashboardState.editMode ? '16px' : '0'};
                ${dashboardState.editMode ? 'border: 2px dashed #3b82f6; border-radius: 8px;' : ''}
            ">
                ${renderCharts()}
            </div>
            
            <!-- Custom Charts Area (wenn vorhanden) -->
            ${dashboardState.customCharts.length > 0 ? `
                <div style="margin-top: 24px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">
                        Zusätzliche Charts
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 16px;">
                        ${renderCustomCharts()}
                    </div>
                </div>
            ` : ''}
        </div>
        
        <!-- Chart Selector Modal (hidden by default) -->
        <div id="chart-selector-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: white; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%;">
                <h3 style="margin: 0 0 16px 0;">Chart hinzufügen</h3>
                ${renderChartSelector()}
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="window.closeChartSelector()">Abbrechen</button>
                </div>
            </div>
        </div>
    `;
    
    // Initialize charts after DOM is ready
    setTimeout(() => initializeAllCharts(), 100);
}

// ========================================
// RENDER CHARTS
// ========================================

function renderCharts() {
    return dashboardState.charts.map(chart => {
        const style = `
            grid-column: ${chart.position.col + 1} / span ${chart.size.width};
            grid-row: ${chart.position.row + 1} / span ${chart.size.height};
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            position: relative;
        `;
        
        return `
            <div class="dashboard-chart" id="chart-${chart.id}" style="${style}">
                ${dashboardState.editMode && !chart.locked ? `
                    <button onclick="window.removeChart('${chart.id}')" 
                            style="position: absolute; top: 8px; right: 8px; 
                                   background: #ef4444; color: white; border: none; 
                                   border-radius: 4px; padding: 2px 6px; font-size: 10px;">
                        ✕
                    </button>
                ` : ''}
                <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: #374151;">
                    ${chart.name}
                </h4>
                ${renderChartContent(chart)}
            </div>
        `;
    }).join('');
}

function renderChartContent(chart) {
    switch(chart.type) {
        case 'bar':
            return `<canvas id="canvas-${chart.id}" style="max-height: 320px;"></canvas>`;
        
        case 'line':
            return `<canvas id="canvas-${chart.id}" style="max-height: 320px;"></canvas>`;
        
        case 'combo':
            return `<canvas id="canvas-${chart.id}" style="max-height: 320px;"></canvas>`;
        
        case 'kpi':
            return renderKPIContent(chart);
        
        case 'table':
            return renderTableContent(chart);
        
        default:
            return '<div>Chart-Typ nicht unterstützt</div>';
    }
}

function renderKPIContent(chart) {
    let value = '0';
    let subtitle = '';
    
    switch(chart.data) {
        case 'projektkosten_total':
            value = '18,8';
            subtitle = 'kumuliert';
            break;
        case 'payback':
            value = '3,4';
            subtitle = 'Jahre';
            break;
        case 'npv':
            value = '44,7';
            subtitle = 'M€ (8% WACC)';
            break;
        case 'irr':
            value = '28';
            subtitle = '% IRR';
            break;
    }
    
    const fontSize = chart.data === 'projektkosten_total' ? '48px' : '64px';
    
    return `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: calc(100% - 40px);
            ${chart.data === 'projektkosten_total' ? 'border: 3px solid #3b82f6; border-radius: 12px; background: #eff6ff;' : ''}
        ">
            <div style="font-size: ${fontSize}; font-weight: bold; color: ${chart.data === 'payback' ? '#10b981' : '#3b82f6'};">
                ${value}${chart.data === 'projektkosten_total' ? 'M€' : ''}
            </div>
            <div style="font-size: 16px; color: #6b7280; margin-top: 8px;">
                ${subtitle}
            </div>
            ${chart.data === 'payback' ? `
                <div style="margin-top: 24px; width: 100%; max-width: 200px;">
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 12px; font-weight: 600;">
                        Szenarien****
                    </div>
                    <div style="display: grid; gap: 6px; font-size: 12px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>Preise</span>
                            <span>+/-0%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Mengen</span>
                            <span>+/-0%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>HK</span>
                            <span>+/-0%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Projektkosten</span>
                            <span>+/-0%</span>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderTableContent(chart) {
    return `
        <div style="font-size: 11px;">
            <div style="display: grid; gap: 4px; margin-bottom: 12px;">
                <div>Projektstart</div>
                <div>Projektende</div>
                <div style="font-weight: 600;">Kosten [T€]</div>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
                <div style="margin-bottom: 8px;">
                    <div style="font-weight: 600;">WCAR_V_BM | WCAR | Verdrättung Best Match</div>
                    <div style="color: #6b7280; margin-top: 2px;">Dez 24</div>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>-</span>
                        <span>10.317</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>-</span>
                        <span>785</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>-</span>
                        <span>5.900</span>
                    </div>
                </div>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
                    <div style="font-weight: 600;">WCAR_V_Z | WCAR | Verdrättung Zeitstand</div>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>-</span>
                        <span>-</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// INITIALIZE CHARTS
// ========================================

function initializeAllCharts() {
    dashboardState.charts.forEach(chart => {
        if (chart.type === 'bar' || chart.type === 'line' || chart.type === 'combo') {
            initializeChart(chart);
        }
    });
}

function initializeChart(chart) {
    const canvas = document.getElementById(`canvas-${chart.id}`);
    if (!canvas || !Chart) return;
    
    const ctx = canvas.getContext('2d');
    const chartData = getChartData(chart.data);
    
    let config = {};
    
    switch(chart.id) {
        case 'projektkosten-jahr':
            config = {
                type: 'bar',
                data: {
                    labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
                    datasets: [{
                        data: [1.6, 2.5, 3.2, 2.9, 2.9, 3.1, 2.5],
                        backgroundColor: '#6b7280',
                        borderRadius: 4
                    }]
                },
                options: getChartOptions('Mio. €', false)
            };
            break;
            
        case 'db3-jahr':
            config = {
                type: 'bar',
                data: {
                    labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
                    datasets: [{
                        data: [-1.6, -1.5, 0.5, 5.0, 12.5, 14.0, 15.2],
                        backgroundColor: function(context) {
                            return context.parsed.y < 0 ? '#ef4444' : '#6b7280';
                        },
                        borderRadius: 4
                    }]
                },
                options: getChartOptions('Mio. €', true)
            };
            break;
            
        case 'db3-kumuliert':
            config = {
                type: 'line',
                data: {
                    labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
                    datasets: [{
                        data: [-1.6, -3.1, -2.6, 2.4, 14.9, 28.9, 44.1],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#3b82f6'
                    }]
                },
                options: getChartOptions('Mio. €', true)
            };
            break;
    }
    
    if (config.type) {
        new Chart(ctx, config);
    }
}

function getChartOptions(unit, showNegative) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y.toFixed(1)} ${unit}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: !showNegative,
                grid: {
                    color: '#e5e7eb'
                },
                ticks: {
                    font: { size: 11 },
                    color: '#6b7280',
                    callback: (value) => `${value}`
                }
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 11 },
                    color: '#6b7280'
                }
            }
        }
    };
}

function getChartData(dataType) {
    // Hier würden die echten Daten aus state geholt
    // Placeholder für jetzt
    return [];
}

// ========================================
// CHART SELECTOR
// ========================================

function renderChartSelector() {
    return Object.entries(AVAILABLE_CHARTS).map(([category, charts]) => `
        <div style="margin-bottom: 16px;">
            <h4 style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px; text-transform: uppercase;">
                ${category === 'revenue' ? 'Umsatz & Absatz' : category === 'profitability' ? 'Profitabilität' : 'Analyse'}
            </h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                ${charts.map(chart => `
                    <button class="btn btn-secondary" 
                            onclick="window.addChart('${chart.id}')"
                            style="font-size: 12px; padding: 8px;">
                        + ${chart.name}
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ========================================
// WINDOW FUNCTIONS
// ========================================

window.toggleDashboardEdit = function() {
    dashboardState.editMode = !dashboardState.editMode;
    saveDashboardState();
    renderProjektDashboard();
};

window.switchDashboardView = function(view) {
    dashboardState.selectedView = view;
    
    if (view === 'extended') {
        // Füge zusätzliche Charts hinzu
        dashboardState.customCharts = [
            { id: 'umsatz-jahr', name: 'Umsatzentwicklung', type: 'bar', data: 'umsatz' },
            { id: 'db2-chart', name: 'DB2 & Marge', type: 'combo', data: 'db2' }
        ];
    } else if (view === 'custom') {
        dashboardState.editMode = true;
    }
    
    saveDashboardState();
    renderProjektDashboard();
};

window.openChartSelector = function() {
    const modal = document.getElementById('chart-selector-modal');
    if (modal) modal.style.display = 'block';
};

window.closeChartSelector = function() {
    const modal = document.getElementById('chart-selector-modal');
    if (modal) modal.style.display = 'none';
};

window.addChart = function(chartId) {
    // Find chart in available charts
    let chartToAdd = null;
    Object.values(AVAILABLE_CHARTS).forEach(category => {
        const found = category.find(c => c.id === chartId);
        if (found) chartToAdd = found;
    });
    
    if (chartToAdd) {
        dashboardState.customCharts.push(chartToAdd);
        saveDashboardState();
        renderProjektDashboard();
        closeChartSelector();
    }
};

window.removeChart = function(chartId) {
    dashboardState.customCharts = dashboardState.customCharts.filter(c => c.id !== chartId);
    saveDashboardState();
    renderProjektDashboard();
};

// ========================================
// PERSISTENCE
// ========================================

function saveDashboardState() {
    const key = `dashboard_${window.cfoDashboard?.currentProjekt || 'default'}`;
    localStorage.setItem(key, JSON.stringify(dashboardState));
}

function loadDashboardState() {
    const key = `dashboard_${window.cfoDashboard?.currentProjekt || 'default'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            dashboardState = { ...dashboardState, ...parsed };
        } catch(e) {
            console.error('Failed to load dashboard state:', e);
        }
    }
}

function renderCustomCharts() {
    return dashboardState.customCharts.map(chart => `
        <div style="background: white; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600;">
                ${chart.name}
            </h4>
            <canvas id="custom-canvas-${chart.id}"></canvas>
        </div>
    `).join('');
}

// ========================================
// EXPORTS
// ========================================

export default { renderProjektDashboard };
