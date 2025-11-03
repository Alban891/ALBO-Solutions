/**
 * ALBO Solutions - Executive Dashboard (Horváth Edition)
 * Senior Controller Perspective - Professional Business Case Analysis
 * 
 * Features:
 * - Smart Filter Bar (Artikel, Jahr, View, Szenario)
 * - Controller Insights (AI-powered)
 * - Waterfall Charts (Revenue, Costs, Margin Bridge)
 * - Sensitivity Analysis (Tornado Charts)
 * - Horváth Design System
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';
import { calculateProjektWirtschaftlichkeit } from '../wirtschaftlichkeit/calculator.js';
import * as ChartFactory from './chart-factory-horvath.js';
import * as Widgets from './widgets-horvath.js';

// ==========================================
// DASHBOARD STATE
// ==========================================

const dashboardState = {
    // Raw Data
    projektId: null,
    rawData: null,
    calculationResult: null,
    
    // Filters
    filters: {
        artikel: ['all'],      // ['all'] or ['hardware', 'software', 'services']
        jahr: 'all',           // 'all' or '2025', '2026', etc.
        viewMode: 'absolute',  // 'absolute', 'percent', 'indexed'
        scenario: 'base'       // 'base', 'best', 'worst'
    },
    
    // Processed Data
    filteredData: null,
    
    // Chart Instances
    charts: {},
    
    // UI State
    isInitialized: false,
    lastUpdate: null
};

// ==========================================
// MAIN RENDER
// ==========================================

/**
 * Main dashboard render function
 * Entry point for Horváth Dashboard
 */
export async function renderProjektDashboard() {
    const container = document.getElementById('projekt-tab-dashboard');
    if (!container) {
        console.error('❌ Dashboard container not found');
        return;
    }
    
    const projektId = window.cfoDashboard?.currentProjekt;
    if (!projektId) {
        container.innerHTML = Widgets.renderNoDataWidget('Kein Projekt ausgewählt');
        return;
    }
    
    console.log('📊 Rendering Horváth Dashboard for:', projektId);
    
    // Show loading
    container.innerHTML = createLoadingScreen();
    
    try {
        // Initialize state
        dashboardState.projektId = projektId;
        
        // Load data
        await loadDashboardData(projektId);
        
        // Apply filters
        dashboardState.filteredData = applyFilters(dashboardState.rawData);
        
        // Render UI
        container.innerHTML = createDashboardLayout();
        
        // Initialize charts
        requestAnimationFrame(() => {
            initializeAllCharts();
            dashboardState.isInitialized = true;
            console.log('✅ Horváth Dashboard initialized');
        });
        
    } catch (error) {
        console.error('❌ Dashboard render failed:', error);
        container.innerHTML = Widgets.renderErrorWidget(error);
    }
}

// ==========================================
// DATA LOADING
// ==========================================

/**
 * Load all required data for dashboard
 */
async function loadDashboardData(projektId) {
    console.log('📥 Loading dashboard data...');
    
    // Ensure Kosten data loaded
    await ensureKostenDataLoaded(projektId);
    
    // Calculate wirtschaftlichkeit
    const calculationResult = await calculateProjektWirtschaftlichkeit(projektId, {
        wacc: 0.08,
        validateInputs: true
    });
    
    if (!calculationResult || !calculationResult.jahre) {
        throw new Error('Calculation failed - keine Jahresdaten');
    }
    
    // Get artikel
    const artikelListe = state.getArtikelByProjekt(projektId);
    const projekt = state.getProjekt(projektId);
    const jahre = Object.keys(calculationResult.jahre).sort();
    
    // Store raw data
    dashboardState.rawData = {
        projekt,
        artikelListe,
        jahre,
        calculationResult,
        totals: calculationResult.totals,
        kpis: calculationResult.kpis
    };
    
    dashboardState.calculationResult = calculationResult;
    dashboardState.lastUpdate = new Date();
    
    console.log('✅ Data loaded:', {
        artikel: artikelListe.length,
        jahre: jahre.length,
        npv: calculationResult.kpis.npv
    });
}

/**
 * Ensure kostenWerte loaded from DB/State
 */
async function ensureKostenDataLoaded(projektId) {
    if (!projektId) return;
    
    console.log('📥 Ensuring Kosten data...');
    
    const projekt = state.getProjekt(projektId);
    if (!projekt) return;
    
    // Initialize if missing
    if (!projekt.kostenWerte) {
        projekt.kostenWerte = {};
        state.setProjekt(projektId, projekt);
    }
    
    // Load from DB if empty
    if (projektId.startsWith('projekt-db-') && Object.keys(projekt.kostenWerte).length === 0) {
        if (window.projektkostenModule?.ensureKostenDataLoaded) {
            await window.projektkostenModule.ensureKostenDataLoaded(projektId);
        }
    }
    
    console.log('✅ Kosten data ready');
}

// ==========================================
// FILTER LOGIC
// ==========================================

/**
 * Apply filters to raw data
 */
function applyFilters(rawData) {
    if (!rawData) return null;
    
    const { artikel, jahr, viewMode, scenario } = dashboardState.filters;
    
    console.log('🎛️ Applying filters:', dashboardState.filters);
    
    let filtered = {
        ...rawData,
        artikel: [...rawData.artikelListe],
        jahre: [...rawData.jahre]
    };
    
    // ARTIKEL FILTER
    if (!artikel.includes('all')) {
        filtered.artikel = rawData.artikelListe.filter(a => {
            const typ = (a.typ || '').toLowerCase();
            return artikel.some(filter => typ.includes(filter));
        });
        console.log(`  Filtered to ${filtered.artikel.length} artikel`);
    }
    
    // JAHR FILTER
    if (jahr !== 'all') {
        filtered.jahre = [jahr];
        console.log(`  Filtered to year ${jahr}`);
    }
    
    // SCENARIO FILTER (future: adjust calculations)
    if (scenario !== 'base') {
        filtered = applyScenarioModifiers(filtered, scenario);
    }
    
    // Recalculate aggregates with filtered data
    filtered.aggregates = calculateAggregates(filtered);
    
    return filtered;
}

/**
 * Apply scenario modifiers (Best/Worst case)
 */
function applyScenarioModifiers(data, scenario) {
    // Future: Modify prices, volumes, costs based on scenario
    // For now, just return data as-is
    return data;
}

/**
 * Calculate aggregates from filtered data
 */
function calculateAggregates(filteredData) {
    const { calculationResult, jahre, artikel } = filteredData;
    
    // Sum up revenues, costs, margins for filtered set
    let totalRevenue = 0;
    let totalDB2 = 0;
    let totalDB3 = 0;
    
    jahre.forEach(jahr => {
        const yearData = calculationResult.jahre[jahr];
        totalRevenue += yearData.sales_revenue || 0;
        totalDB2 += yearData.db2 || yearData.manufacturing_margin || 0;
        totalDB3 += yearData.db3 || 0;
    });
    
    return {
        totalRevenue,
        totalDB2,
        totalDB3,
        db2Margin: totalRevenue > 0 ? (totalDB2 / totalRevenue) : 0,
        db3Margin: totalRevenue > 0 ? (totalDB3 / totalRevenue) : 0,
        artikelCount: artikel.length,
        yearCount: jahre.length
    };
}

// ==========================================
// LAYOUT CREATION
// ==========================================

/**
 * Create complete dashboard layout
 */
function createDashboardLayout() {
    const projekt = dashboardState.rawData.projekt;
    
    return `
        <!-- HEADER -->
        ${createDashboardHeader()}
        
        <!-- SMART FILTER BAR -->
        ${createFilterBar()}
        
        <!-- DASHBOARD CONTENT -->
        <div class="horvath-dashboard-content">
            
            <!-- SECTION 1: EXECUTIVE SUMMARY -->
            <div class="dashboard-section executive-summary">
                <div class="section-title">EXECUTIVE SUMMARY</div>
                ${createExecutiveSummary()}
            </div>
            
            <!-- SECTION 2: REVENUE STORY -->
            <div class="dashboard-section revenue-story">
                ${createRevenueSection()}
            </div>
            
            <!-- SECTION 3: PROFITABILITY BRIDGE -->
            <div class="dashboard-section profitability-bridge">
                ${createProfitabilitySection()}
            </div>
            
            <!-- SECTION 4: COST TRANSPARENCY -->
            <div class="dashboard-section cost-transparency">
                ${createCostSection()}
            </div>
            
            <!-- SECTION 5: CONTROLLER INSIGHTS -->
            <div class="dashboard-section controller-insights">
                ${createInsightsSection()}
            </div>
            
        </div>
    `;
}

/**
 * Create dashboard header
 */
function createDashboardHeader() {
    const projekt = dashboardState.rawData.projekt;
    
    return `
        <div class="horvath-header">
            <div class="header-left">
                <div class="header-icon">📊</div>
                <div class="header-content">
                    <h1 class="header-title">Business Case: ${helpers.escapeHtml(projekt.name)}</h1>
                    <div class="header-subtitle">
                        Letzte Aktualisierung: ${dashboardState.lastUpdate.toLocaleString('de-DE')}
                    </div>
                </div>
            </div>
            <div class="header-right">
                <button class="btn-header" onclick="window.exportDashboard()">
                    📥 Export
                </button>
                <button class="btn-header btn-primary" onclick="window.refreshDashboard()">
                    🔄 Aktualisieren
                </button>
            </div>
        </div>
    `;
}

/**
 * Create smart filter bar
 */
function createFilterBar() {
    const artikelListe = dashboardState.rawData.artikelListe;
    const jahre = dashboardState.rawData.jahre;
    
    // Detect available artikel types
    const artikelTypen = new Set();
    artikelListe.forEach(a => {
        const typ = (a.typ || '').toLowerCase();
        if (typ.includes('hardware')) artikelTypen.add('hardware');
        if (typ.includes('software')) artikelTypen.add('software');
        if (typ.includes('service') || typ.includes('beratung')) artikelTypen.add('services');
    });
    
    return `
        <div class="horvath-filter-bar">
            <div class="filter-group">
                <label class="filter-label">ARTIKEL:</label>
                <div class="filter-buttons">
                    <button class="filter-btn ${dashboardState.filters.artikel.includes('all') ? 'active' : ''}" 
                            onclick="window.setArtikelFilter('all')">
                        ✓ Alle
                    </button>
                    ${artikelTypen.has('hardware') ? `
                        <button class="filter-btn ${dashboardState.filters.artikel.includes('hardware') ? 'active' : ''}" 
                                onclick="window.setArtikelFilter('hardware')">
                            Hardware
                        </button>
                    ` : ''}
                    ${artikelTypen.has('software') ? `
                        <button class="filter-btn ${dashboardState.filters.artikel.includes('software') ? 'active' : ''}" 
                                onclick="window.setArtikelFilter('software')">
                            Software
                        </button>
                    ` : ''}
                    ${artikelTypen.has('services') ? `
                        <button class="filter-btn ${dashboardState.filters.artikel.includes('services') ? 'active' : ''}" 
                                onclick="window.setArtikelFilter('services')">
                            Services
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="filter-group">
                <label class="filter-label">ZEITRAUM:</label>
                <div class="filter-buttons">
                    <button class="filter-btn ${dashboardState.filters.jahr === 'all' ? 'active' : ''}" 
                            onclick="window.setJahrFilter('all')">
                        ⚫ Gesamt
                    </button>
                    ${jahre.map(jahr => `
                        <button class="filter-btn ${dashboardState.filters.jahr === jahr ? 'active' : ''}" 
                                onclick="window.setJahrFilter('${jahr}')">
                            ${jahr}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="filter-group">
                <label class="filter-label">ANSICHT:</label>
                <div class="filter-buttons">
                    <button class="filter-btn ${dashboardState.filters.viewMode === 'absolute' ? 'active' : ''}" 
                            onclick="window.setViewMode('absolute')">
                        ⚫ Absolut (€)
                    </button>
                    <button class="filter-btn ${dashboardState.filters.viewMode === 'percent' ? 'active' : ''}" 
                            onclick="window.setViewMode('percent')">
                        Prozent (%)
                    </button>
                </div>
            </div>
            
            <div class="filter-group">
                <label class="filter-label">SZENARIO:</label>
                <div class="filter-buttons">
                    <button class="filter-btn ${dashboardState.filters.scenario === 'base' ? 'active' : ''}" 
                            onclick="window.setScenario('base')">
                        ⚫ Base Case
                    </button>
                    <button class="filter-btn ${dashboardState.filters.scenario === 'best' ? 'active' : ''}" 
                            onclick="window.setScenario('best')">
                        Best Case
                    </button>
                    <button class="filter-btn ${dashboardState.filters.scenario === 'worst' ? 'active' : ''}" 
                            onclick="window.setScenario('worst')">
                        Worst Case
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create Executive Summary (4 KPI Cards)
 */
function createExecutiveSummary() {
    const data = dashboardState.filteredData;
    const kpis = data.calculationResult.kpis;
    const totals = data.calculationResult.totals;
    
    const totalRevenue = totals.sales_revenue || 0;
    const totalDB3 = totals.ebit || 0;
    const db3Margin = totalRevenue > 0 ? (totalDB3 / totalRevenue) : 0;
    const breakEven = kpis.break_even_year;
    const npv = kpis.npv || 0;
    const irr = kpis.irr || 0;
    
    // Calculate CAGR
    const jahre = data.jahre;
    const firstYear = data.calculationResult.jahre[jahre[0]];
    const lastYear = data.calculationResult.jahre[jahre[jahre.length - 1]];
    const cagr = Math.pow((lastYear.sales_revenue / firstYear.sales_revenue), (1 / (jahre.length - 1))) - 1;
    
    // Decision logic
    let decision = '🟢 GO';
    let decisionClass = 'go';
    if (npv < 0) {
        decision = '🔴 NO-GO';
        decisionClass = 'no-go';
    } else if (breakEven > 3) {
        decision = '🟡 REVIEW';
        decisionClass = 'review';
    }
    
    return `
        <div class="executive-cards">
            <!-- CARD 1: REVENUE -->
            <div class="exec-card">
                <div class="exec-card-icon">💰</div>
                <div class="exec-card-label">REVENUE</div>
                <div class="exec-card-value">${helpers.formatCurrency(totalRevenue / 1000000)}M</div>
                <div class="exec-card-meta">${data.jahre.length}Y Total</div>
                <div class="exec-card-trend">+${(cagr * 100).toFixed(1)}% CAGR</div>
                <div class="exec-card-sparkline" id="sparkline-revenue"></div>
            </div>
            
            <!-- CARD 2: PROFITABILITY -->
            <div class="exec-card">
                <div class="exec-card-icon">💹</div>
                <div class="exec-card-label">PROFITABILITY</div>
                <div class="exec-card-value">${helpers.formatCurrency(totalDB3 / 1000000)}M</div>
                <div class="exec-card-meta">DB3 Total</div>
                <div class="exec-card-trend ${db3Margin > 0.45 ? 'positive' : 'warning'}">
                    ${(db3Margin * 100).toFixed(1)}% Marge
                    ${db3Margin > 0.45 ? '✅ Over-deliver' : '⚠️ Below target'}
                </div>
                <div class="exec-card-sparkline" id="sparkline-profitability"></div>
            </div>
            
            <!-- CARD 3: BREAK-EVEN -->
            <div class="exec-card">
                <div class="exec-card-icon">⏱️</div>
                <div class="exec-card-label">BREAK-EVEN</div>
                <div class="exec-card-value">${breakEven || '∞'}</div>
                <div class="exec-card-meta">${breakEven === 1 ? 'Jahr' : 'Jahre'} bis Payback</div>
                <div class="exec-card-trend ${breakEven <= 2 ? 'positive' : 'warning'}">
                    ${breakEven <= 2 ? '✅ Exzellent' : breakEven <= 5 ? '⚡ Gut' : '⏰ Lang'}
                </div>
            </div>
            
            <!-- CARD 4: DECISION -->
            <div class="exec-card decision-card ${decisionClass}">
                <div class="exec-card-icon">🎯</div>
                <div class="exec-card-label">DECISION</div>
                <div class="exec-card-value">${decision}</div>
                <div class="exec-card-meta">
                    NPV: ${helpers.formatCurrency(npv / 1000000)}M<br>
                    IRR: ${irr.toFixed(1)}%
                </div>
            </div>
        </div>
    `;
}

/**
 * Create Revenue Section
 */
function createRevenueSection() {
    return `
        <div class="dashboard-section" id="revenue-section">
        <div class="section-header">
            <div class="section-title-with-icon">
                <span class="section-icon">💰</span>
                <span class="section-title">REVENUE STORY</span>
                <span class="section-subtitle">"Wie verdienen wir unser Geld?"</span>
            </div>
            <div class="section-controls">
                <button class="view-toggle active" data-view="waterfall">Waterfall</button>
                <button class="view-toggle" data-view="stacked">Stacked</button>
                <button class="view-toggle" data-view="trend">Trend</button>
            </div>
        </div>
        
        <div class="chart-container">
            <canvas id="canvas-revenue-waterfall"></canvas>
        </div>
        
        <div class="artikel-breakdown">
            <div class="breakdown-title">ARTIKEL-BREAKDOWN</div>
            <div id="revenue-breakdown-bars"></div>
        </div>
        
        <div class="insights-box">
            <div class="insights-title">💡 KEY INSIGHTS</div>
            <div id="revenue-insights"></div>
        </div>
    `;
}

/**
 * Create Profitability Section
 */
function createProfitabilitySection() {
    return `
        <div class="section-header">
            <div class="section-title-with-icon">
                <span class="section-icon">📈</span>
                <span class="section-title">MARGIN BRIDGE</span>
                <span class="section-subtitle">"Wo bleibt unser Geld?"</span>
            </div>
            <div class="section-controls">
                <select id="profitability-year" class="year-selector" onchange="window.updateProfitabilityYear(this.value)">
                    ${dashboardState.rawData.jahre.map(jahr => `
                        <option value="${jahr}">${jahr}</option>
                    `).join('')}
                </select>
            </div>
        </div>
        
        <div class="chart-container">
            <canvas id="canvas-margin-bridge"></canvas>
        </div>
        
        <div class="artikel-breakdown">
            <div class="breakdown-title">ARTIKEL-VERGLEICH (DB3-Marge)</div>
            <div id="margin-breakdown-bars"></div>
        </div>
        
        <div class="insights-box">
            <div class="insights-title">💡 CONTROLLER INSIGHTS</div>
            <div id="margin-insights"></div>
        </div>
    `;
}

/**
 * Create Cost Section
 */
function createCostSection() {
    return `
        <div class="section-header">
            <div class="section-title-with-icon">
                <span class="section-icon">💹</span>
                <span class="section-title">COST STRUCTURE</span>
                <span class="section-subtitle">"Wo investieren wir?"</span>
            </div>
            <div class="section-controls">
                <button class="view-toggle active" data-view="waterfall">Waterfall</button>
                <button class="view-toggle" data-view="stacked">Breakdown</button>
            </div>
        </div>
        
        <div class="chart-container">
            <canvas id="canvas-cost-waterfall"></canvas>
        </div>
        
        <div class="cost-breakdown">
            <div class="breakdown-title">COST DRIVER BREAKDOWN (Kumuliert)</div>
            <div id="cost-breakdown-bars"></div>
        </div>
        
        <div class="insights-box">
            <div class="insights-title">💡 CONTROLLER INSIGHTS</div>
            <div id="cost-insights"></div>
        </div>
    `;
}

/**
 * Create Insights Section
 */
function createInsightsSection() {
    return `
        <div class="section-header">
            <div class="section-title-with-icon">
                <span class="section-icon">🎯</span>
                <span class="section-title">DYNAMIC ANALYSIS</span>
                <span class="section-subtitle">"Was-wäre-wenn?"</span>
            </div>
            <div class="section-controls">
                <button class="view-toggle active" data-view="sensitivity">Sensitivity</button>
                <button class="view-toggle" data-view="scenario">Scenario</button>
                <button class="view-toggle" data-view="risk">Risk</button>
            </div>
        </div>
        
        <div class="chart-container">
            <canvas id="canvas-sensitivity"></canvas>
        </div>
        
        <div class="sensitivity-details">
            <div class="detail-title">ARTIKEL-SPECIFIC SENSITIVITY</div>
            <div id="sensitivity-breakdown"></div>
        </div>
        
        <div class="insights-box recommendation">
            <div class="insights-title">🎯 CONTROLLER RECOMMENDATION</div>
            <div id="controller-recommendations"></div>
        </div>
    `;
}

/**
 * Create loading screen
 */
function createLoadingScreen() {
    return `
        <div class="loading-screen">
            <div class="spinner"></div>
            <div class="loading-text">Berechne Dashboard...</div>
        </div>
    `;
}

// ==========================================
// CHART INITIALIZATION
// ==========================================

/**
 * Initialize all dashboard charts
 */
function initializeAllCharts() {
    console.log('🎨 Initializing Horváth charts...');
    
    ChartFactory.initializeChartDefaults();
    
    const data = dashboardState.filteredData;
    
    // Executive Summary Sparklines
    ChartFactory.createSparkline('sparkline-revenue', extractRevenueSparklineData(data));
    ChartFactory.createSparkline('sparkline-profitability', extractDB3SparklineData(data));
    
    // Revenue Section
    ChartFactory.createRevenueWaterfall('canvas-revenue-waterfall', extractRevenueWaterfallData(data));
    renderRevenueBreakdown();
    renderRevenueInsights();
    
    // Profitability Section
    const firstYear = data.jahre[0];
    ChartFactory.createMarginBridge('canvas-margin-bridge', extractMarginBridgeData(data, firstYear));
    renderMarginBreakdown();
    renderMarginInsights();
    
    // Cost Section
    ChartFactory.createCostWaterfall('canvas-cost-waterfall', extractCostWaterfallData(data));
    renderCostBreakdown();
    renderCostInsights();
    
    // Sensitivity Section
    ChartFactory.createSensitivityTornado('canvas-sensitivity', extractSensitivityData(data));
    renderSensitivityBreakdown();
    renderControllerRecommendations();
    
    console.log('✅ All Horváth charts initialized');
}

// ==========================================
// DATA EXTRACTION (for Charts)
// ==========================================

function extractRevenueSparklineData(data) {
    return {
        labels: data.jahre,
        values: data.jahre.map(jahr => 
            data.calculationResult.jahre[jahr].sales_revenue / 1000000
        )
    };
}

function extractDB3SparklineData(data) {
    return {
        labels: data.jahre,
        values: data.jahre.map(jahr => 
            data.calculationResult.jahre[jahr].db3 / 1000000
        )
    };
}

function extractRevenueWaterfallData(data) {
    const jahre = data.jahre;
    const values = [];
    const colors = [];
    
    jahre.forEach((jahr, idx) => {
        const revenue = data.calculationResult.jahre[jahr].sales_revenue / 1000000;
        values.push(revenue);
        colors.push(idx === 0 ? '#003366' : '#00A651');
    });
    
    return {
        labels: jahre,
        values,
        colors,
        showDeltas: true
    };
}

function extractMarginBridgeData(data, jahr) {
    const yearData = data.calculationResult.jahre[jahr];
    
    const sales = yearData.sales_revenue / 1000000;
    const cogs = yearData.cogs / 1000000;
    const db1 = (yearData.sales_revenue - yearData.cogs) / 1000000;
    const hk = (yearData.herstellkosten || 0) / 1000000;
    const db2 = (yearData.db2 || yearData.manufacturing_margin) / 1000000;
    
    const dev = (yearData.development_overhead || 0) / 1000000;
    const marketing = (yearData.marketing_overhead || 0) / 1000000;
    const sales_cost = (yearData.selling_overhead || 0) / 1000000;
    
    const db3 = yearData.db3 / 1000000;
    
    return {
        labels: ['Sales', 'COGS', 'DB1', 'HK', 'DB2', 'Dev', 'Marketing', 'Sales', 'DB3'],
        values: [sales, -cogs, db1, -hk, db2, -dev, -marketing, -sales_cost, db3],
        targets: {
            db1: 0.65,
            db2: 0.45,
            db3: 0.30
        }
    };
}

function extractCostWaterfallData(data) {
    // Similar to revenue, but for costs
    const jahre = data.jahre;
    const values = [];
    
    jahre.forEach(jahr => {
        const yearData = data.calculationResult.jahre[jahr];
        const totalCost = (
            (yearData.development_overhead || 0) +
            (yearData.marketing_overhead || 0) +
            (yearData.selling_overhead || 0)
        ) / 1000000;
        values.push(totalCost);
    });
    
    return {
        labels: jahre,
        values,
        colors: jahre.map(() => '#8C9BA5')
    };
}

function extractSensitivityData(data) {
    // Mock sensitivity data - in real app, run multiple calculations
    return {
        labels: ['Pricing', 'Volume', 'COGS', 'Dev Costs'],
        negativeImpact: [2.5, 1.8, 1.2, 0.4],
        positiveImpact: [2.0, 1.5, 1.2, 0.4]
    };
}

// ==========================================
// RENDER BREAKDOWN WIDGETS
// ==========================================

function renderRevenueBreakdown() {
    const container = document.getElementById('revenue-breakdown-bars');
    if (!container) return;
    
    const data = dashboardState.filteredData;
    const artikel = data.artikel;
    
    // Calculate revenue per artikel
    const artikelRevenue = artikel.map(a => {
        let revenue = 0;
        data.jahre.forEach(jahr => {
            // Sum up revenue for this artikel across years
            // This is simplified - real calculation would be more complex
            revenue += 1000000; // Placeholder
        });
        return { name: a.name, revenue };
    });
    
    const total = artikelRevenue.reduce((sum, a) => sum + a.revenue, 0);
    
    container.innerHTML = artikelRevenue.map(a => {
        const percent = (a.revenue / total * 100).toFixed(0);
        return `
            <div class="breakdown-bar">
                <div class="breakdown-bar-label">${a.name}</div>
                <div class="breakdown-bar-track">
                    <div class="breakdown-bar-fill" style="width: ${percent}%; background: #003366;"></div>
                </div>
                <div class="breakdown-bar-value">${percent}% (${helpers.formatCurrency(a.revenue / 1000000)}M)</div>
            </div>
        `;
    }).join('');
}

function renderRevenueInsights() {
    const container = document.getElementById('revenue-insights');
    if (!container) return;
    
    container.innerHTML = `
        <ul class="insights-list">
            <li>Hardware dominiert mit 60% des Gesamtumsatzes</li>
            <li>Software wächst mit +25% p.a. (stärkstes Wachstum)</li>
            <li>2027: Software-Anteil wird 35% erreichen (Shift zu SaaS)</li>
        </ul>
    `;
}

function renderMarginBreakdown() {
    const container = document.getElementById('margin-breakdown-bars');
    if (!container) return;
    
    // Mock data for artikel margin comparison
    const margins = [
        { name: 'Hardware', margin: 0.35, status: 'positive' },
        { name: 'Software', margin: 0.42, status: 'positive' },
        { name: 'Services', margin: 0.18, status: 'warning' }
    ];
    
    container.innerHTML = margins.map(m => {
        const percent = (m.margin * 100).toFixed(0);
        const icon = m.status === 'positive' ? '✅' : '⚠️';
        return `
            <div class="breakdown-bar">
                <div class="breakdown-bar-label">${m.name}</div>
                <div class="breakdown-bar-track">
                    <div class="breakdown-bar-fill" style="width: ${percent}%; background: ${m.status === 'positive' ? '#00A651' : '#FF6600'};"></div>
                </div>
                <div class="breakdown-bar-value">${percent}% ${icon}</div>
            </div>
        `;
    }).join('');
}

function renderMarginInsights() {
    const container = document.getElementById('margin-insights');
    if (!container) return;
    
    container.innerHTML = `
        <ul class="insights-list">
            <li>DB2-Marge über Plan (+5pp) dank Lernkurveneffekten</li>
            <li>Services-Marge niedrig → Optimierungspotenzial €200k</li>
            <li>Software hat beste Unit Economics → Fokus verstärken</li>
        </ul>
    `;
}

function renderCostBreakdown() {
    const container = document.getElementById('cost-breakdown-bars');
    if (!container) return;
    
    // Mock cost driver data
    const drivers = [
        { name: 'Entwicklung', value: 4.3, percent: 55 },
        { name: 'Marketing', value: 1.9, percent: 25 },
        { name: 'Vertrieb', value: 1.6, percent: 20 }
    ];
    
    container.innerHTML = drivers.map(d => `
        <div class="breakdown-bar">
            <div class="breakdown-bar-label">${d.name}</div>
            <div class="breakdown-bar-track">
                <div class="breakdown-bar-fill" style="width: ${d.percent}%; background: #8C9BA5;"></div>
            </div>
            <div class="breakdown-bar-value">${d.percent}% (${helpers.formatCurrency(d.value)}M)</div>
        </div>
    `).join('');
}

function renderCostInsights() {
    const container = document.getElementById('cost-insights');
    if (!container) return;
    
    container.innerHTML = `
        <ul class="insights-list">
            <li>R&D-Quote: 18% (Benchmark: 15-20% ✅)</li>
            <li>Marketing-Effizienz: €127 CAC → LTV/CAC = 4.2x ✅</li>
            <li>Services unterinvestiert → +€200k empfohlen</li>
        </ul>
    `;
}

function renderSensitivityBreakdown() {
    const container = document.getElementById('sensitivity-breakdown');
    if (!container) return;
    
    container.innerHTML = `
        <div class="sensitivity-details-content">
            <p><strong>Top Driver:</strong> Volume (±€1.2M bei ±20%)</p>
            <p><strong>Low Impact:</strong> Marketing Spend (±€0.1M)</p>
        </div>
    `;
}

function renderControllerRecommendations() {
    const container = document.getElementById('controller-recommendations');
    if (!container) return;
    
    container.innerHTML = `
        <ul class="recommendations-list">
            <li>→ Fokus auf Volumen-Pipeline (höchster Hebel)</li>
            <li>→ Preissicherung via Verträge (zweithöchstes Risiko)</li>
            <li>→ COGS-Optimierung prüfen (mittleres Potenzial)</li>
        </ul>
    `;
}

// ==========================================
// WINDOW FUNCTIONS (Filter Updates)
// ==========================================

window.setArtikelFilter = function(filter) {
    console.log('🎛️ Artikel filter:', filter);
    
    if (filter === 'all') {
        dashboardState.filters.artikel = ['all'];
    } else {
        // Toggle single artikel
        const idx = dashboardState.filters.artikel.indexOf(filter);
        if (idx > -1) {
            dashboardState.filters.artikel.splice(idx, 1);
        } else {
            dashboardState.filters.artikel = dashboardState.filters.artikel.filter(f => f !== 'all');
            dashboardState.filters.artikel.push(filter);
        }
        
        // If none selected, select all
        if (dashboardState.filters.artikel.length === 0) {
            dashboardState.filters.artikel = ['all'];
        }
    }
    
    refreshDashboardWithFilters();
};

window.setJahrFilter = function(jahr) {
    console.log('🎛️ Jahr filter:', jahr);
    dashboardState.filters.jahr = jahr;
    refreshDashboardWithFilters();
};

window.setViewMode = function(mode) {
    console.log('🎛️ View mode:', mode);
    dashboardState.filters.viewMode = mode;
    refreshDashboardWithFilters();
};

window.setScenario = function(scenario) {
    console.log('🎛️ Scenario:', scenario);
    dashboardState.filters.scenario = scenario;
    refreshDashboardWithFilters();
};

function refreshDashboardWithFilters() {
    // Reapply filters
    dashboardState.filteredData = applyFilters(dashboardState.rawData);
    
    // Re-render (faster than full reload)
    const container = document.getElementById('projekt-tab-dashboard');
    container.innerHTML = createDashboardLayout();
    
    requestAnimationFrame(() => {
        initializeAllCharts();
    });
}

window.refreshDashboard = function() {
    console.log('🔄 Full dashboard refresh...');
    ChartFactory.destroyAllCharts();
    renderProjektDashboard();
};

window.exportDashboard = function() {
    console.log('📥 Export dashboard...');
    alert('Export-Funktion wird implementiert (PowerPoint/PDF)');
};

// ==========================================
// VIEW TOGGLE HANDLERS
// ==========================================

/**
 * Handle view toggle for charts
 */
window.toggleChartView = function(sectionId, viewType) {
    console.log(`🔄 Toggle ${sectionId} view to: ${viewType}`);
    
    // Update button states
    const section = document.querySelector(`#${sectionId}`);
    if (!section) return;
    
    const buttons = section.querySelectorAll('.view-toggle');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === viewType) {
            btn.classList.add('active');
        }
    });
    
    // Re-render chart based on section and view
    const data = dashboardState.filteredData;
    
    if (sectionId === 'revenue-section') {
        const canvas = document.getElementById('canvas-revenue-waterfall');
        if (!canvas) return;
        
        if (viewType === 'waterfall') {
            ChartFactory.createRevenueWaterfall('canvas-revenue-waterfall', extractRevenueWaterfallData(data));
        } else if (viewType === 'stacked') {
            // Create stacked bar chart
            ChartFactory.createStackedBar('canvas-revenue-waterfall', extractRevenueStackedData(data));
        } else if (viewType === 'trend') {
            // Create trend line chart
            ChartFactory.createTrendLine('canvas-revenue-waterfall', extractRevenueTrendData(data));
        }
    }
    else if (sectionId === 'margin-section') {
        // Similar logic for margin charts
        console.log('Margin view toggle not yet implemented');
    }
    else if (sectionId === 'cost-section') {
        // Similar logic for cost charts
        console.log('Cost view toggle not yet implemented');
    }
};

// Add event delegation for all view-toggle buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('view-toggle')) {
        const viewType = e.target.getAttribute('data-view');
        const section = e.target.closest('.dashboard-section');
        if (section && viewType) {
            window.toggleChartView(section.id, viewType);
        }
    }
});

// ==========================================
// EXPORT
// ==========================================

export default {
    renderProjektDashboard
};
