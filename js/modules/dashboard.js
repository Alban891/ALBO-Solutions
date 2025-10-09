/**
 * CFO Dashboard - Projekt Dashboard 
 * Exakte Excel-Struktur: 3 Zeilen x 3 Spalten, kompakte Ansicht
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';

const Chart = window.Chart;

// ========================================
// DASHBOARD LAYOUT (Excel-Struktur)
// ========================================

const DASHBOARD_LAYOUT = {
    gridColumns: 3,
    gridRows: 3,
    compactMode: true // Alles auf einen Blick
};

// Standard-Charts (exakt wie Excel)
const STANDARD_CHARTS = [
    // Zeile 1: Artikel-Metriken
    {
        id: 'umsatz',
        name: 'Umsatz',
        subtitle: 'in Mio. €',
        type: 'bar',
        position: { row: 0, col: 0 },
        locked: true
    },
    {
        id: 'absatz',
        name: 'Absatz',
        subtitle: 'in Stück',
        type: 'bar',
        position: { row: 0, col: 1 },
        locked: true
    },
    {
        id: 'db2',
        name: 'DB 2*',
        subtitle: 'in Mio. €',
        type: 'combo', // Balken + Linie für %
        position: { row: 0, col: 2 },
        locked: true
    },
    
    // Zeile 2: Projektkosten
    {
        id: 'projektkosten',
        name: 'Projektkosten',
        subtitle: 'in Mio. €',
        type: 'bar',
        position: { row: 1, col: 0 },
        locked: true
    },
    {
        id: 'projektkosten-kum',
        name: 'Projektkosten',
        subtitle: 'in Mio. €',
        type: 'kpi-box',
        position: { row: 1, col: 1 },
        locked: true
    },
    {
        id: 'projekte-table',
        name: 'Projekte',
        type: 'table',
        position: { row: 1, col: 2 },
        locked: true
    },
    
    // Zeile 3: Wirtschaftlichkeit
    {
        id: 'db3-jahr',
        name: 'DB 3 pro Jahr**',
        subtitle: 'in Mio. €',
        type: 'bar',
        position: { row: 2, col: 0 },
        locked: true
    },
    {
        id: 'db3-kumuliert',
        name: 'DB 3 kumuliert**',
        subtitle: 'in Mio. €',
        type: 'line',
        position: { row: 2, col: 1 },
        locked: true
    },
    {
        id: 'amortisation',
        name: 'Amortisation***',
        subtitle: 'in Jahren',
        type: 'kpi-szenarien',
        position: { row: 2, col: 2 },
        locked: true
    }
];

// ========================================
// STATE
// ========================================

let dashboardState = {
    charts: [...STANDARD_CHARTS],
    editMode: false,
    customCharts: []
};

// ========================================
// MAIN RENDER
// ========================================

export function renderProjektDashboard() {
    const container = document.getElementById('projekt-tab-dashboard');
    if (!container) return;
    
    const projekt = state.getProjekt(window.cfoDashboard?.currentProjekt);
    const projektName = projekt?.name || 'Projekt';
    
    // Viewport-Höhe für kompakte Ansicht
    const viewportHeight = window.innerHeight - 200; // Abzug für Header
    const rowHeight = Math.floor(viewportHeight / 3);
    
    container.innerHTML = `
        <div class="dashboard-wrapper" style="height: 100%; overflow: hidden;">
            <!-- Dashboard Header -->
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: #f9fafb;
                border-bottom: 2px solid #e5e7eb;
                margin-bottom: 12px;
            ">
                <div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 700;">
                        Business Case: ${projektName}
                    </h3>
                    <div style="display: flex; gap: 24px; margin-top: 4px; font-size: 12px; color: #6b7280;">
                        <span>SGF: 1. Schaltschrankkomponenten</span>
                        <span>| Artikel: 5</span>
                        <span>SGE: Übergreifend</span>
                        <span>| Projekte: 1</span>
                    </div>
                </div>
                
                <button class="btn btn-sm ${dashboardState.editMode ? 'btn-primary' : 'btn-secondary'}"
                        onclick="window.toggleDashboardEdit()"
                        style="font-size: 12px; padding: 6px 12px;">
                    ${dashboardState.editMode ? '✓ Fertig' : '⚙️ Anpassen'}
                </button>
            </div>
            
            <!-- Dashboard Grid (Kompakt) -->
            <div style="
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(3, ${rowHeight}px);
                gap: 12px;
                padding: 0 12px;
                height: calc(100% - 60px);
            ">
                ${renderAllCharts()}
            </div>
            
            <!-- Edit Mode Panel -->
            ${dashboardState.editMode ? renderEditPanel() : ''}
        </div>
    `;
    
    // Charts initialisieren
    setTimeout(initializeCharts, 100);
}

// ========================================
// RENDER CHARTS
// ========================================

function renderAllCharts() {
    return dashboardState.charts.map(chart => {
        const style = `
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        `;
        
        return `
            <div id="chart-${chart.id}" style="${style}">
                ${dashboardState.editMode && !chart.locked ? `
                    <button onclick="window.removeChart('${chart.id}')"
                            style="position: absolute; top: 4px; right: 4px; 
                                   background: #ef4444; color: white; border: none;
                                   width: 18px; height: 18px; border-radius: 3px; 
                                   font-size: 10px; cursor: pointer; z-index: 10;">
                        ✕
                    </button>
                ` : ''}
                
                <div style="margin-bottom: 8px;">
                    <div style="font-size: 11px; font-weight: 600; color: #111827;">
                        ${chart.name}
                    </div>
                    ${chart.subtitle ? `
                        <div style="font-size: 9px; color: #6b7280; margin-top: 1px;">
                            ${chart.subtitle}
                        </div>
                    ` : ''}
                </div>
                
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    ${renderChartContent(chart)}
                </div>
            </div>
        `;
    }).join('');
}

function renderChartContent(chart) {
    switch(chart.type) {
        case 'bar':
        case 'line':
        case 'combo':
            return `<canvas id="canvas-${chart.id}" style="max-width: 100%; max-height: 100%;"></canvas>`;
            
        case 'kpi-box':
            return `
                <div style="
                    border: 3px solid #3b82f6;
                    border-radius: 8px;
                    padding: 20px;
                    background: #eff6ff;
                    text-align: center;
                    width: 80%;
                ">
                    <div style="font-size: 36px; font-weight: bold; color: #1e40af;">
                        20,4
                    </div>
                    <div style="font-size: 12px; color: #3b82f6; margin-top: 4px;">
                        kumuliert
                    </div>
                </div>
            `;
            
        case 'kpi-szenarien':
            return `
                <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
                    <div style="font-size: 48px; font-weight: bold; color: #059669; margin-bottom: 16px;">
                        5,7
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        Szenarien****
                    </div>
                    <table style="width: 100%; max-width: 180px; font-size: 11px;">
                        <tr>
                            <td style="padding: 3px;">Preise</td>
                            <td style="text-align: right; padding: 3px;">
                                <input type="text" value="+/-0%" style="width: 50px; text-align: right; border: 1px solid #d1d5db; border-radius: 2px; padding: 2px; font-size: 10px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 3px;">Mengen</td>
                            <td style="text-align: right; padding: 3px;">
                                <input type="text" value="+/-0%" style="width: 50px; text-align: right; border: 1px solid #d1d5db; border-radius: 2px; padding: 2px; font-size: 10px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 3px;">HK</td>
                            <td style="text-align: right; padding: 3px;">
                                <input type="text" value="+/-0%" style="width: 50px; text-align: right; border: 1px solid #d1d5db; border-radius: 2px; padding: 2px; font-size: 10px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 3px;">Projektkosten</td>
                            <td style="text-align: right; padding: 3px;">
                                <input type="text" value="+/-0%" style="width: 50px; text-align: right; border: 1px solid #d1d5db; border-radius: 2px; padding: 2px; font-size: 10px;">
                            </td>
                        </tr>
                    </table>
                </div>
            `;
            
        case 'table':
            return `
                <div style="width: 100%; font-size: 10px;">
                    <table style="width: 100%;">
                        <thead>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <th style="text-align: left; padding: 4px; font-weight: 600;">Projektstart</th>
                                <th style="text-align: left; padding: 4px; font-weight: 600;">Projektende</th>
                                <th style="text-align: right; padding: 4px; font-weight: 600;">Kosten [T€]</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="3" style="padding: 8px 4px; font-weight: 600;">
                                    WCAR_V_BM | WCAR | Verdrahtung Best Match
                                </td>
                            </tr>
                            <tr style="color: #6b7280;">
                                <td style="padding: 2px 4px;">Dez 24</td>
                                <td style="padding: 2px 4px;">-</td>
                                <td style="text-align: right; padding: 2px 4px;">12.122</td>
                            </tr>
                            <tr style="color: #6b7280;">
                                <td style="padding: 2px 4px;">-</td>
                                <td style="padding: 2px 4px;">-</td>
                                <td style="text-align: right; padding: 2px 4px;">1.180</td>
                            </tr>
                            <tr style="color: #6b7280;">
                                <td style="padding: 2px 4px;">-</td>
                                <td style="padding: 2px 4px;">-</td>
                                <td style="text-align: right; padding: 2px 4px;">5.100</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            
        default:
            return '<div>-</div>';
    }
}

// ========================================
// INITIALIZE CHARTS
// ========================================

function initializeCharts() {
    if (!Chart) return;
    
    // Chart.js Default-Einstellungen für kompakte Darstellung
    Chart.defaults.font.size = 9;
    Chart.defaults.plugins.legend.display = false;
    
    dashboardState.charts.forEach(chart => {
        if (chart.type === 'bar' || chart.type === 'line' || chart.type === 'combo') {
            createChart(chart);
        }
    });
}

function createChart(chart) {
    const canvas = document.getElementById(`canvas-${chart.id}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032'];
    
    let config = {
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 0 },
            plugins: {
                legend: { display: false },
                tooltip: { 
                    enabled: true,
                    titleFont: { size: 10 },
                    bodyFont: { size: 10 }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { 
                        font: { size: 8 },
                        autoSkip: true,
                        maxTicksLimit: 9
                    }
                },
                y: {
                    grid: { color: '#f3f4f6' },
                    ticks: { 
                        font: { size: 8 },
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                }
            }
        }
    };
    
    // Chart-spezifische Konfiguration
    switch(chart.id) {
        case 'umsatz':
            config.type = 'bar';
            config.data = {
                labels: years,
                datasets: [{
                    data: [0, 1.6, 3.0, 6.5, 9.6, 13.0, 16.0, 16.0, 16.0],
                    backgroundColor: '#9ca3af'
                }]
            };
            break;
            
        case 'absatz':
            config.type = 'bar';
            config.data = {
                labels: years,
                datasets: [{
                    data: [0, 8, 14, 26, 43, 62, 75, 75, 75],
                    backgroundColor: '#9ca3af'
                }]
            };
            break;
            
        case 'db2':
            config.type = 'bar';
            config.data = {
                labels: years,
                datasets: [
                    {
                        type: 'bar',
                        data: [0, 0.5, 1.0, 3.0, 4.3, 6.6, 8.1, 8.1, 8.1],
                        backgroundColor: '#9ca3af',
                        yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        data: [0, 32, 32, 46, 45, 51, 51, 51, 51],
                        borderColor: '#374151',
                        borderWidth: 2,
                        pointRadius: 3,
                        yAxisID: 'y1'
                    }
                ]
            };
            config.options.scales.y1 = {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: {
                    font: { size: 8 },
                    callback: function(value) {
                        return value + '%';
                    }
                },
                min: 0,
                max: 60
            };
            break;
            
        case 'projektkosten':
            config.type = 'bar';
            config.data = {
                labels: years.slice(0, 9),
                datasets: [{
                    data: [1.0, 2.6, 2.6, 2.7, 2.7, 2.8, 2.0, 2.0, 2.0],
                    backgroundColor: '#9ca3af'
                }]
            };
            break;
            
        case 'db3-jahr':
            config.type = 'bar';
            config.data = {
                labels: years.slice(0, 9),
                datasets: [{
                    data: [-1.0, -2.1, -1.7, 0.3, 1.6, 3.8, 6.1, 6.1, 6.1],
                    backgroundColor: function(context) {
                        return context.parsed.y < 0 ? '#ef4444' : '#9ca3af';
                    }
                }]
            };
            config.options.scales.y.beginAtZero = false;
            break;
            
        case 'db3-kumuliert':
            config.type = 'line';
            config.data = {
                labels: years,
                datasets: [{
                    data: [-1.0, -3.1, -4.7, -4.4, -2.8, 1.0, 7.1, 13.2, 19.3],
                    borderColor: '#374151',
                    backgroundColor: 'rgba(55, 65, 81, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            };
            config.options.scales.y.beginAtZero = false;
            break;
    }
    
    new Chart(ctx, config);
}

// ========================================
// EDIT MODE
// ========================================

function renderEditPanel() {
    return `
        <div style="
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
        ">
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px;">
                Charts hinzufügen/entfernen:
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm btn-secondary" onclick="window.addChart('umsatz-trend')">
                    + Umsatz-Trend
                </button>
                <button class="btn btn-sm btn-secondary" onclick="window.addChart('npv')">
                    + NPV
                </button>
                <button class="btn btn-sm btn-secondary" onclick="window.addChart('irr')">
                    + IRR
                </button>
                <button class="btn btn-sm btn-secondary" onclick="window.resetDashboard()">
                    🔄 Zurücksetzen
                </button>
            </div>
        </div>
    `;
}

// ========================================
// WINDOW FUNCTIONS
// ========================================

window.toggleDashboardEdit = function() {
    dashboardState.editMode = !dashboardState.editMode;
    renderProjektDashboard();
};

window.removeChart = function(chartId) {
    dashboardState.charts = dashboardState.charts.filter(c => c.id !== chartId || c.locked);
    renderProjektDashboard();
};

window.addChart = function(chartId) {
    // Hier würden zusätzliche Charts hinzugefügt
    console.log('Chart hinzufügen:', chartId);
};

window.resetDashboard = function() {
    dashboardState.charts = [...STANDARD_CHARTS];
    dashboardState.editMode = false;
    renderProjektDashboard();
};

// ========================================
// EXPORT
// ========================================

export default { renderProjektDashboard };
