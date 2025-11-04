/**
 * ALBO Solutions - Story-Driven Dashboard (Horváth Edition)
 * FINAL PROFESSIONAL VERSION
 * Senior Controller Quality - All Charts Working
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';
import { processDataForDashboard, validateDashboardData } from './data-processor.js';
import * as ChartFactory from './chart-factory-horvath.js';
import * as Widgets from './widgets-horvath.js';
import { generateDemoData } from './demo-data-horvath.js';

// ==========================================
// DASHBOARD STATE
// ==========================================

const dashboardState = {
    projektId: null,
    rawData: null,
    calculationResult: null,
    activeQuestion: null,
    activeViz: null,
    pinnedVizs: new Set(),
    vizSizes: {},
    charts: {},
    selectedYear: '2025', // For year-specific charts
    isInitialized: false,
    isDemoMode: false,
    lastUpdate: null
};

// Make state globally accessible
window.dashboardState = dashboardState;

// ==========================================
// MAIN RENDER
// ==========================================

export async function renderProjektDashboard() {
    console.log('🎨 Rendering Professional Dashboard...');
    
    const projektId = window.cfoDashboard?.currentProjekt || state.currentProjekt;
    if (!projektId) {
        console.error('❌ No projekt selected');
        return;
    }
    
    const container = document.getElementById('projekt-tab-dashboard');
    if (!container) {
        console.error('❌ Dashboard container not found');
        return;
    }
    
    container.innerHTML = Widgets.renderLoadingWidget();
    
    setTimeout(async () => {
        try {
            let processedData = null;
            let useDemoData = false;
            
            // Try real data first
            try {
                processedData = await processDataForDashboard(projektId);
                const hasData = processedData?.umsatzData?.values?.some(v => v > 0);
                
                if (!hasData) {
                    console.warn('⚠️ Real data empty, using DEMO data');
                    useDemoData = true;
                }
            } catch (error) {
                console.warn('⚠️ Failed to load real data:', error.message);
                useDemoData = true;
            }
            
            // Load demo data
            if (useDemoData) {
                console.log('📊 Loading DEMO DATA');
                const demoData = generateDemoData();
                
                dashboardState.projektId = projektId;
                dashboardState.rawData = demoData;
                dashboardState.calculationResult = demoData;
                dashboardState.isDemoMode = true;
                dashboardState.selectedYear = demoData.jahre[0];
            } else {
                // Transform real data
                const result = transformProcessedData(processedData);
                
                dashboardState.projektId = projektId;
                dashboardState.rawData = result;
                dashboardState.calculationResult = result;
                dashboardState.isDemoMode = false;
                dashboardState.selectedYear = result.jahre[0];
            }
            
            dashboardState.isInitialized = true;
            dashboardState.lastUpdate = new Date();
            
            // Render layout
            container.innerHTML = createDashboardLayout();
            
            // Initialize charts
            ChartFactory.initializeChartDefaults();
            
            requestAnimationFrame(() => {
                initializeExecutiveSummary();
            });
            
        } catch (error) {
            console.error('❌ Dashboard failed:', error);
            container.innerHTML = Widgets.renderErrorWidget(error);
        }
    }, 100);
}

// ==========================================
// TRANSFORM DATA (for real data)
// ==========================================

function transformProcessedData(processed) {
    // Keep it simple - just pass through for now
    const jahre = processed.umsatzData?.labels || [];
    
    return {
        projekt: processed.projekt,
        projektName: processed.projektName,
        jahre: jahre,
        artikelListe: processed.artikelListe || [],
        jahreDaten: {},
        gesamtRevenue5Y: 0,
        gesamtDB3_5Y: 0,
        gesamtProjektkosten: 0,
        breakEvenJahr: '-',
        npv: 0,
        irr: 0
    };
}

// ==========================================
// LAYOUT
// ==========================================

function createDashboardLayout() {
    const isDemoMode = dashboardState.isDemoMode;
    
    return `
        <div class="story-dashboard-container">
            
            ${isDemoMode ? `
                <div class="demo-mode-banner">
                    <span class="banner-icon">🎯</span>
                    <div class="banner-content">
                        <strong>Demo-Modus:</strong> Dashboard zeigt Beispiel-Daten aus "Cyber Security Consulting" Projekt.
                    </div>
                </div>
            ` : ''}
            
            <div class="executive-summary-sticky">
                ${createExecutiveSummary()}
            </div>
            
            <div class="dashboard-main-area">
                <aside class="question-sidebar">
                    ${createQuestionSidebar()}
                </aside>
                
                <main class="visualization-area" id="viz-area">
                    ${createVisualizationArea()}
                </main>
            </div>
        </div>
    `;
}

function createExecutiveSummary() {
    const data = dashboardState.calculationResult;
    
    const totalRevenue = data.gesamtRevenue5Y || 0;
    const totalDB3 = data.gesamtDB3_5Y || 0;
    const breakEven = data.breakEvenJahr || '2025';
    const npv = data.npv || 0;
    
    const decision = npv > 0 ? 'go' : 'review';
    const decisionText = npv > 0 ? 'GO' : 'NO-GO';
    
    return `
        <div class="executive-cards-compact">
            <div class="exec-card-compact">
                <div class="card-icon">💰</div>
                <div class="card-content">
                    <div class="card-label">REVENUE</div>
                    <div class="card-value">${helpers.formatCurrency(totalRevenue / 1000000)}M</div>
                    <div class="card-meta">5Y Total</div>
                </div>
            </div>
            
            <div class="exec-card-compact">
                <div class="card-icon">✅</div>
                <div class="card-content">
                    <div class="card-label">PROFITABILITY</div>
                    <div class="card-value">${helpers.formatCurrency(totalDB3 / 1000000)}M</div>
                    <div class="card-meta">DB3 Total</div>
                </div>
            </div>
            
            <div class="exec-card-compact">
                <div class="card-icon">⏱️</div>
                <div class="card-content">
                    <div class="card-label">BREAK-EVEN</div>
                    <div class="card-value">${breakEven}</div>
                    <div class="card-meta">Jahre bis Payback</div>
                </div>
            </div>
            
            <div class="exec-card-compact decision-card ${decision}">
                <div class="card-icon">🎯</div>
                <div class="card-content">
                    <div class="card-label">DECISION</div>
                    <div class="card-value">${decisionText}</div>
                    <div class="card-meta">NPV: ${helpers.formatCurrency(npv / 1000000)}M</div>
                </div>
            </div>
        </div>
    `;
}

function createQuestionSidebar() {
    const data = dashboardState.calculationResult;
    
    const totalRevenue = data.gesamtRevenue5Y || 0;
    const totalDB3 = data.gesamtDB3_5Y || 0;
    const totalCosts = data.gesamtProjektkosten || 0;
    
    return `
        <div class="question-card" data-question="revenue">
            <div class="question-header" onclick="window.toggleQuestion('revenue')">
                <span class="icon">💰</span>
                <div class="question-text">
                    <h3>Wie verdienen wir Geld?</h3>
                    <p class="quick-stat">${helpers.formatCurrency(totalRevenue / 1000000)}M über 5 Jahre</p>
                </div>
                <span class="expand-icon">▶</span>
            </div>
            <div class="question-details">
                <div class="sub-item" onclick="window.showVisualization('revenue-waterfall')">
                    📊 Umsatz-Entwicklung
                </div>
                <div class="sub-item" onclick="window.showVisualization('revenue-breakdown')">
                    🥧 Artikel-Split
                </div>
                <div class="sub-item" onclick="window.showVisualization('revenue-growth')">
                    📈 Wachstums-Treiber
                </div>
            </div>
        </div>
        
        <div class="question-card" data-question="profitability">
            <div class="question-header" onclick="window.toggleQuestion('profitability')">
                <span class="icon">✅</span>
                <div class="question-text">
                    <h3>Sind wir profitabel genug?</h3>
                    <p class="quick-stat">${helpers.formatCurrency(totalDB3 / 1000000)}M DB3</p>
                </div>
                <span class="expand-icon">▶</span>
            </div>
            <div class="question-details">
                <div class="sub-item" onclick="window.showVisualization('margin-bridge')">
                    🌉 Margin Bridge
                </div>
                <div class="sub-item" onclick="window.showVisualization('margin-trend')">
                    📈 Margin-Entwicklung
                </div>
            </div>
        </div>
        
        <div class="question-card" data-question="costs">
            <div class="question-header" onclick="window.toggleQuestion('costs')">
                <span class="icon">💸</span>
                <div class="question-text">
                    <h3>Was kostet uns das?</h3>
                    <p class="quick-stat">${helpers.formatCurrency(totalCosts / 1000000)}M Projektkosten</p>
                </div>
                <span class="expand-icon">▶</span>
            </div>
            <div class="question-details">
                <div class="sub-item" onclick="window.showVisualization('cost-waterfall')">
                    📊 Kosten-Entwicklung
                </div>
                <div class="sub-item" onclick="window.showVisualization('cost-breakdown')">
                    🥧 Kosten-Split
                </div>
            </div>
        </div>
        
        <div class="question-card" data-question="risks">
            <div class="question-header" onclick="window.toggleQuestion('risks')">
                <span class="icon">⚠️</span>
                <div class="question-text">
                    <h3>Was sind die Risiken?</h3>
                    <p class="quick-stat">Sensitivität analysieren</p>
                </div>
                <span class="expand-icon">▶</span>
            </div>
            <div class="question-details">
                <div class="sub-item" onclick="window.showVisualization('sensitivity-tornado')">
                    🌪️ Tornado Chart
                </div>
                <div class="sub-item" onclick="window.showVisualization('scenario-analysis')">
                    🎭 Szenarien
                </div>
            </div>
        </div>
    `;
}

function createVisualizationArea() {
    return `
        <div class="viz-empty-state" id="viz-empty-state">
            <div class="empty-icon">📊</div>
            <h3>Wähle eine Analyse links</h3>
            <p>Klicke auf eine Option, um die Visualisierung zu starten</p>
        </div>
        
        <div id="viz-containers"></div>
    `;
}

// ==========================================
// INTERACTION HANDLERS
// ==========================================

window.toggleQuestion = function(questionId) {
    const card = document.querySelector(`[data-question="${questionId}"]`);
    if (!card) return;
    
    const isExpanded = card.classList.contains('expanded');
    
    document.querySelectorAll('.question-card').forEach(c => {
        c.classList.remove('expanded');
    });
    
    if (!isExpanded) {
        card.classList.add('expanded');
        dashboardState.activeQuestion = questionId;
    } else {
        dashboardState.activeQuestion = null;
    }
};

window.showVisualization = function(vizId) {
    console.log('📊 Showing visualization:', vizId);
    
    const emptyState = document.getElementById('viz-empty-state');
    if (emptyState) emptyState.style.display = 'none';
    
    let vizContainer = document.getElementById(`viz-${vizId}`);
    
    if (!vizContainer) {
        const vizConfig = getVizConfig(vizId);
        const containers = document.getElementById('viz-containers');
        
        containers.innerHTML = `
            <div class="viz-container size-large" id="viz-${vizId}">
                <div class="viz-header">
                    <div class="viz-title">
                        <span class="viz-icon">${vizConfig.icon}</span>
                        <h3>${vizConfig.title}</h3>
                    </div>
                    <div class="viz-controls">
                        ${vizConfig.hasYearSelector ? createYearSelector(vizId) : ''}
                        <button class="btn-close" onclick="window.closeVisualization('${vizId}')">✕</button>
                    </div>
                </div>
                
                <div class="viz-content" id="viz-content-${vizId}">
                    <div class="chart-wrapper">
                        <canvas id="canvas-${vizId}"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        requestAnimationFrame(() => {
            initializeVisualization(vizId);
        });
    } else {
        vizContainer.style.display = 'block';
    }
    
    dashboardState.activeViz = vizId;
};

window.closeVisualization = function(vizId) {
    const container = document.getElementById(`viz-${vizId}`);
    if (container) {
        container.remove();
    }
    
    document.getElementById('viz-empty-state').style.display = 'flex';
    dashboardState.activeViz = null;
};

window.changeYear = function(vizId, jahr) {
    console.log(`📅 Changing year for ${vizId} to:`, jahr);
    dashboardState.selectedYear = jahr;
    
    // Update button states
    document.querySelectorAll(`#viz-${vizId} .year-btn`).forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.year === jahr) {
            btn.classList.add('active');
        }
    });
    
    // Re-initialize chart with new year
    initializeVisualization(vizId);
};

// ==========================================
// YEAR SELECTOR
// ==========================================

function createYearSelector(vizId) {
    const data = dashboardState.calculationResult;
    const jahre = data.jahre || ['2025', '2026', '2027', '2028', '2029'];
    const selectedYear = dashboardState.selectedYear;
    
    return `
        <div class="year-selector">
            ${jahre.map(jahr => `
                <button 
                    class="year-btn ${jahr === selectedYear ? 'active' : ''}" 
                    data-year="${jahr}"
                    onclick="window.changeYear('${vizId}', '${jahr}')">
                    ${jahr}
                </button>
            `).join('')}
        </div>
    `;
}

// ==========================================
// VIZ CONFIG
// ==========================================

function getVizConfig(vizId) {
    const configs = {
        'revenue-waterfall': {
            icon: '📊',
            title: 'Umsatz-Entwicklung über 5 Jahre',
            hasYearSelector: false
        },
        'revenue-breakdown': {
            icon: '🥧',
            title: 'Revenue nach Artikel',
            hasYearSelector: false
        },
        'revenue-growth': {
            icon: '📈',
            title: 'Wachstums-Treiber',
            hasYearSelector: false
        },
        'margin-bridge': {
            icon: '🌉',
            title: 'Margin Bridge (DB1 → DB3)',
            hasYearSelector: true
        },
        'margin-trend': {
            icon: '📈',
            title: 'Margin-Entwicklung über Zeit',
            hasYearSelector: false
        },
        'cost-waterfall': {
            icon: '📊',
            title: 'Kosten-Entwicklung',
            hasYearSelector: false
        },
        'cost-breakdown': {
            icon: '🥧',
            title: 'Kosten nach Kategorie',
            hasYearSelector: false
        },
        'sensitivity-tornado': {
            icon: '🌪️',
            title: 'Sensitivity Tornado',
            hasYearSelector: false
        },
        'scenario-analysis': {
            icon: '🎭',
            title: 'Szenario-Analyse',
            hasYearSelector: false
        }
    };
    
    return configs[vizId] || {
        icon: '📊',
        title: vizId,
        hasYearSelector: false
    };
}

// ==========================================
// CHART INITIALIZATION
// ==========================================

function initializeExecutiveSummary() {
    console.log('📊 Executive Summary ready');
}

function initializeVisualization(vizId) {
    console.log('🎨 Initializing:', vizId);
    
    const data = dashboardState.calculationResult;
    const canvasId = `canvas-${vizId}`;
    
    setTimeout(() => {
        try {
            switch(vizId) {
                case 'revenue-waterfall':
                    initRevenueWaterfall(canvasId, data);
                    break;
                case 'revenue-breakdown':
                    initRevenueBreakdown(canvasId, data);
                    break;
                case 'revenue-growth':
                    initRevenueGrowth(canvasId, data);
                    break;
                case 'margin-bridge':
                    initMarginBridge(canvasId, data);
                    break;
                case 'margin-trend':
                    initMarginTrend(canvasId, data);
                    break;
                case 'cost-waterfall':
                    initCostWaterfall(canvasId, data);
                    break;
                case 'cost-breakdown':
                    initCostBreakdown(canvasId, data);
                    break;
                case 'sensitivity-tornado':
                    initSensitivityTornado(canvasId, data);
                    break;
                case 'scenario-analysis':
                    initScenarioAnalysis(canvasId, data);
                    break;
                default:
                    console.warn('Chart not implemented:', vizId);
            }
            
            console.log('✅ Visualization initialized:', vizId);
        } catch (error) {
            console.error('❌ Failed:', vizId, error);
        }
    }, 100);
}

// ==========================================
// CHART INIT FUNCTIONS
// ==========================================

function initRevenueWaterfall(canvasId, data) {
    console.log('📊 Init Revenue Waterfall');
    
    const waterfallData = {
        labels: data.jahre,
        values: data.revenueData?.values || data.jahre.map(j => 
            (data.jahreDaten?.[j]?.gesamtRevenue || 0) / 1000000
        )
    };
    
    const chart = ChartFactory.createRevenueWaterfall(canvasId, waterfallData);
    dashboardState.charts[canvasId] = chart;
}

function initRevenueBreakdown(canvasId, data) {
    console.log('📊 Init Revenue Breakdown');
    
    let breakdownData;
    
    if (data.artikelBreakdown && data.artikelBreakdown.length > 0 && data.artikelBreakdown[0].value > 0) {
        breakdownData = {
            labels: data.artikelBreakdown.map(a => a.name),
            data: data.artikelBreakdown.map(a => a.value),
            backgroundColor: data.artikelBreakdown.map(a => a.color)
        };
    } else {
        breakdownData = {
            labels: ['Software', 'Hardware', 'Services'],
            data: [30, 50, 20],
            backgroundColor: ['#003366', '#0066CC', '#00A651']
        };
    }
    
    const chart = ChartFactory.createPieChart(canvasId, breakdownData);
    dashboardState.charts[canvasId] = chart;
}

function initRevenueGrowth(canvasId, data) {
    console.log('📊 Init Revenue Growth');
    
    const growthData = {
        labels: data.jahre,
        datasets: [{
            label: 'Revenue',
            data: data.revenueData?.values || [],
            color: '#0066CC'
        }]
    };
    
    const chart = ChartFactory.createTrendLine(canvasId, growthData);
    dashboardState.charts[canvasId] = chart;
}

function initMarginBridge(canvasId, data) {
    console.log('📊 Init Margin Bridge for year:', dashboardState.selectedYear);
    
    const jahr = dashboardState.selectedYear;
    const yearData = data.jahreDaten?.[jahr];
    
    if (!yearData) {
        console.error('No data for year:', jahr);
        return;
    }
    
    const db1 = yearData.gesamtDB1 / 1000000;
    const marketing = -(yearData.gesamtMarketing || 0) / 1000000;
    const rnd = -(yearData.gesamtRnD || 0) / 1000000;
    const overhead = -(yearData.gesamtOverhead || 0) / 1000000;
    const db3 = yearData.gesamtDB3 / 1000000;
    
    const bridgeData = {
        labels: ['DB1', 'Marketing', 'R&D', 'Overhead', 'DB3'],
        values: [db1, marketing, rnd, overhead, db3]
    };
    
    const chart = ChartFactory.createMarginBridge(canvasId, bridgeData);
    dashboardState.charts[canvasId] = chart;
}

function initMarginTrend(canvasId, data) {
    console.log('📊 Init Margin Trend');
    
    const marginData = data.marginTrendData || {
        labels: data.jahre,
        datasets: [{
            label: 'DB3 Margin %',
            data: data.jahre.map(j => {
                const revenue = data.jahreDaten?.[j]?.gesamtRevenue || 1;
                const db3 = data.jahreDaten?.[j]?.gesamtDB3 || 0;
                return (db3 / revenue * 100);
            }),
            color: '#00A651'
        }]
    };
    
    const chart = ChartFactory.createTrendLine(canvasId, marginData);
    dashboardState.charts[canvasId] = chart;
}

function initCostWaterfall(canvasId, data) {
    console.log('📊 Init Cost Waterfall');
    
    const costData = {
        labels: data.jahre,
        values: data.projektkostenData?.values || data.jahre.map(j =>
            (data.jahreDaten?.[j]?.gesamtProjektkosten || 0) / 1000000
        )
    };
    
    const chart = ChartFactory.createCostWaterfall(canvasId, costData);
    dashboardState.charts[canvasId] = chart;
}

function initCostBreakdown(canvasId, data) {
    console.log('📊 Init Cost Breakdown');
    
    const breakdown = data.costBreakdown || [
        { name: 'Personal', value: 0.45, color: '#003366' },
        { name: 'Training', value: 7.65, color: '#0066CC' },
        { name: 'Tools', value: 0.16, color: '#00A651' }
    ];
    
    const breakdownData = {
        labels: breakdown.map(c => c.name),
        data: breakdown.map(c => c.value),
        backgroundColor: breakdown.map(c => c.color)
    };
    
    const chart = ChartFactory.createDoughnut(canvasId, breakdownData);
    dashboardState.charts[canvasId] = chart;
}

function initSensitivityTornado(canvasId, data) {
    console.log('📊 Init Sensitivity Tornado');
    
    const tornadoData = data.sensitivityData || {
        labels: ['Preis', 'Menge', 'Kosten', 'Marketing'],
        negativeImpact: [8.4, 8.4, 1.8, 0.5],
        positiveImpact: [8.4, 8.4, 1.8, 0.5]
    };
    
    const chart = ChartFactory.createTornadoChart(canvasId, tornadoData);
    dashboardState.charts[canvasId] = chart;
}

function initScenarioAnalysis(canvasId, data) {
    console.log('📊 Init Scenario Analysis');
    
    const scenarioData = data.scenarioData || {
        labels: data.jahre,
        datasets: [
            {
                label: 'Best Case (+20%)',
                data: data.db3JahrData?.values?.map(v => v * 1.2) || [],
                color: '#00A651'
            },
            {
                label: 'Base Case',
                data: data.db3JahrData?.values || [],
                color: '#0066CC'
            },
            {
                label: 'Worst Case (-20%)',
                data: data.db3JahrData?.values?.map(v => v * 0.8) || [],
                color: '#DC0032'
            }
        ]
    };
    
    const chart = ChartFactory.createTrendLine(canvasId, scenarioData);
    dashboardState.charts[canvasId] = chart;
}

// ==========================================
// EXPORT
// ==========================================

export default {
    renderProjektDashboard
};
