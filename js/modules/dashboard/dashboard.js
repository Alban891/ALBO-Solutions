/**
 * ALBO Solutions - Story-Driven Dashboard (Horváth Edition)
 * Interactive Question-Based Analysis with Split-View Layout
 * 
 * Layout:
 * - Top: Sticky Executive Summary
 * - Left: Question Sidebar (expandable cards)
 * - Right: Dynamic Visualization Area (pinnable, resizable)
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';
import { processDataForDashboard, validateDashboardData } from './data-processor.js';
import * as ChartFactory from './chart-factory-horvath.js';
import * as Widgets from './widgets-horvath.js';

// ==========================================
// DASHBOARD STATE
// ==========================================

const dashboardState = {
    // Data
    projektId: null,
    rawData: null,
    calculationResult: null,
    
    // UI State
    activeQuestion: null,        // Currently expanded question
    activeViz: null,             // Currently shown visualization
    pinnedVizs: new Set(),       // Pinned visualizations
    vizSizes: {},                // Size settings per viz
    
    // Charts
    charts: {},
    
    // Init
    isInitialized: false,
    lastUpdate: null
};

// ==========================================
// MOCK DATA (FALLBACK)
// ==========================================

/**
 * Transform processed data to our dashboard format
 */
function transformProcessedData(processed) {
    console.log('🔄 Transforming processed data to dashboard format...');
    console.log('📊 Input data:', processed);
    
    // Extract years from labels
    const jahre = processed.umsatzData?.labels || [];
    
    // Build jahreDaten from chart data
    const jahreDaten = {};
    jahre.forEach((jahr, index) => {
        // Data is ALREADY in millions from data-processor!
        const revenueInMio = processed.umsatzData?.datasets?.[0]?.data?.[index] || 0;
        const db2InMio = processed.db2Data?.datasets?.[0]?.data?.[index] || 0;
        const db3JahrInMio = processed.db3JahrData?.datasets?.[0]?.data?.[index] || 0;
        const projektkostenInMio = processed.projektkostenData?.datasets?.[0]?.data?.[index] || 0;
        
        console.log(`📅 Jahr ${jahr}:`, {
            revenue: revenueInMio + 'M',
            db2: db2InMio + 'M',
            db3: db3JahrInMio + 'M',
            kosten: projektkostenInMio + 'M'
        });
        
        jahreDaten[jahr] = {
            gesamtRevenue: revenueInMio * 1000000,  // Convert to actual value
            gesamtDB1: db2InMio * 1000000,
            gesamtDB3: db3JahrInMio * 1000000,
            gesamtProjektkosten: projektkostenInMio * 1000000,
            gesamtMarketing: 0,
            gesamtRnD: 0,
            gesamtOverhead: 0
        };
    });
    
    // Calculate totals
    let gesamtRevenue5Y = 0;
    let gesamtDB3_5Y = 0;
    let gesamtProjektkosten = 0;
    
    Object.values(jahreDaten).forEach(jahresDaten => {
        gesamtRevenue5Y += jahresDaten.gesamtRevenue;
        gesamtDB3_5Y += jahresDaten.gesamtDB3;
        gesamtProjektkosten += jahresDaten.gesamtProjektkosten;
    });
    
    console.log('💰 Totals:', {
        revenue: (gesamtRevenue5Y / 1000000).toFixed(2) + 'M',
        db3: (gesamtDB3_5Y / 1000000).toFixed(2) + 'M',
        kosten: (gesamtProjektkosten / 1000000).toFixed(2) + 'M'
    });
    
    // Find break-even from kumuliert data
    let breakEvenJahr = '-';
    if (processed.db3KumuliertData?.datasets?.[0]?.data) {
        const kumuliertData = processed.db3KumuliertData.datasets[0].data;
        for (let i = 0; i < kumuliertData.length; i++) {
            if (kumuliertData[i] > 0) {
                breakEvenJahr = jahre[i];
                console.log('🎯 Break-Even found in:', breakEvenJahr);
                break;
            }
        }
    }
    
    // Calculate NPV (simplified)
    const npv = gesamtDB3_5Y - gesamtProjektkosten;
    
    // Get artikel from state
    const projektId = window.cfoDashboard?.currentProjekt;
    const artikelListe = state.getArtikelByProjekt(projektId) || [];
    
    const result = {
        projekt: state.getProjekt(projektId),
        projektName: processed.projektName,
        jahre: jahre,
        artikelListe: artikelListe.map(a => ({
            ...a,
            gesamtRevenue5Y: 0 // TODO: Calculate from revenueModel
        })),
        jahreDaten: jahreDaten,
        gesamtRevenue5Y: gesamtRevenue5Y,
        gesamtDB3_5Y: gesamtDB3_5Y,
        gesamtProjektkosten: gesamtProjektkosten,
        breakEvenJahr: breakEvenJahr,
        npv: npv,
        irr: npv > 0 ? 0.15 : 0.05
    };
    
    console.log('✅ Final transformed data:', result);
    
    return result;
}

/**
 * Create mock data for demo purposes when no real data available
 */
function createMockData(projektId) {
    const projekt = state.getProjekt(projektId) || { name: 'Demo Projekt', id: projektId };
    
    return {
        projekt: projekt,
        jahre: [2025, 2026, 2027, 2028, 2029],
        artikelListe: [
            {
                id: 'mock-hw-1',
                name: 'Hardware Produkt',
                typ: 'Hardware',
                gesamtRevenue5Y: 25000000
            },
            {
                id: 'mock-sw-1',
                name: 'Software Lizenz',
                typ: 'Software',
                gesamtRevenue5Y: 25000000
            }
        ],
        jahreDaten: {
            2025: {
                gesamtRevenue: 4000000,
                gesamtDB1: 2400000,
                gesamtDB3: 1200000,
                gesamtProjektkosten: 3000000,
                gesamtMarketing: 400000,
                gesamtRnD: 600000,
                gesamtOverhead: 200000
            },
            2026: {
                gesamtRevenue: 8000000,
                gesamtDB1: 4800000,
                gesamtDB3: 2400000,
                gesamtProjektkosten: 2000000,
                gesamtMarketing: 800000,
                gesamtRnD: 1200000,
                gesamtOverhead: 400000
            },
            2027: {
                gesamtRevenue: 12000000,
                gesamtDB1: 7200000,
                gesamtDB3: 3600000,
                gesamtProjektkosten: 1500000,
                gesamtMarketing: 1200000,
                gesamtRnD: 1800000,
                gesamtOverhead: 600000
            },
            2028: {
                gesamtRevenue: 14000000,
                gesamtDB1: 8400000,
                gesamtDB3: 4200000,
                gesamtProjektkosten: 1000000,
                gesamtMarketing: 1400000,
                gesamtRnD: 2100000,
                gesamtOverhead: 700000
            },
            2029: {
                gesamtRevenue: 16000000,
                gesamtDB1: 9600000,
                gesamtDB3: 4800000,
                gesamtProjektkosten: 500000,
                gesamtMarketing: 1600000,
                gesamtRnD: 2400000,
                gesamtOverhead: 800000
            }
        },
        gesamtRevenue5Y: 54000000,
        gesamtDB3_5Y: 16200000,
        gesamtProjektkosten: 8000000,
        breakEvenJahr: 2,
        npv: 2500000,
        irr: 0.18
    };
}

/**
 * Build data structure from state when calculator is not available
 */
function buildDataFromState(projektId, projekt, artikelListe) {
    console.log('🔨 Building data from state...');
    
    // Extract years from artikel
    const alleJahre = new Set();
    artikelListe.forEach(artikel => {
        if (artikel.revenueModel?.jahre) {
            Object.keys(artikel.revenueModel.jahre).forEach(jahr => alleJahre.add(jahr));
        }
    });
    
    const jahre = Array.from(alleJahre).sort();
    console.log('📅 Found years:', jahre);
    
    if (jahre.length === 0) {
        jahre.push('2025', '2026', '2027', '2028', '2029');
    }
    
    // Calculate totals per year
    const jahreDaten = {};
    let gesamtRevenue5Y = 0;
    let gesamtDB3_5Y = 0;
    
    jahre.forEach(jahr => {
        let jahresRevenue = 0;
        let jahresDB1 = 0;
        let jahresDB3 = 0;
        
        artikelListe.forEach(artikel => {
            const menge = artikel.revenueModel?.jahre?.[jahr]?.menge || 0;
            const preis = artikel.revenueModel?.jahre?.[jahr]?.preis || 0;
            const hk = artikel.revenueModel?.jahre?.[jahr]?.hk || 0;
            
            const revenue = menge * preis;
            const db1 = menge * (preis - hk);
            
            jahresRevenue += revenue;
            jahresDB1 += db1;
        });
        
        // Simplified: DB3 = 50% of DB1 (without real cost data)
        jahresDB3 = jahresDB1 * 0.5;
        
        jahreDaten[jahr] = {
            gesamtRevenue: jahresRevenue,
            gesamtDB1: jahresDB1,
            gesamtDB3: jahresDB3,
            gesamtProjektkosten: 0, // TODO: Get from projekt
            gesamtMarketing: jahresDB1 * 0.1,
            gesamtRnD: jahresDB1 * 0.15,
            gesamtOverhead: jahresDB1 * 0.05
        };
        
        gesamtRevenue5Y += jahresRevenue;
        gesamtDB3_5Y += jahresDB3;
    });
    
    console.log('💰 Calculated totals:', {
        revenue: gesamtRevenue5Y,
        db3: gesamtDB3_5Y,
        jahre: jahre.length
    });
    
    return {
        projekt: projekt,
        jahre: jahre,
        artikelListe: artikelListe.map(a => ({
            ...a,
            gesamtRevenue5Y: Object.values(a.revenueModel?.jahre || {}).reduce((sum, j) => 
                sum + (j.menge * j.preis), 0)
        })),
        jahreDaten: jahreDaten,
        gesamtRevenue5Y: gesamtRevenue5Y,
        gesamtDB3_5Y: gesamtDB3_5Y,
        gesamtProjektkosten: 0,
        breakEvenJahr: '-',
        npv: gesamtDB3_5Y - gesamtRevenue5Y * 0.3, // Simplified
        irr: 0.15
    };
}

// ==========================================
// MAIN RENDER
// ==========================================

/**
 * Main entry point - renders complete dashboard
 */
export async function renderProjektDashboard() {
    console.log('🎨 Rendering Story-Driven Dashboard...');
    
    const projektId = window.cfoDashboard?.currentProjekt || state.currentProjekt;
    if (!projektId) {
        console.error('❌ No projekt selected');
        return;
    }
    
    // Get container
    const container = document.getElementById('projekt-tab-dashboard');
    if (!container) {
        console.error('❌ Dashboard container not found');
        return;
    }
    
    // Show loading
    container.innerHTML = Widgets.renderLoadingWidget();
    
    // Fetch and calculate data
    setTimeout(async () => {
        try {
            console.log('🔍 DEBUG: Starting dashboard calculation for projekt:', projektId);
            console.log('🔍 DEBUG: Current state:', window.state);
            
            // Get raw projekt data
            const projekt = state.getProjekt(projektId);
            console.log('🔍 DEBUG: Raw projekt:', projekt);
            
            // Get artikel
            const artikelListe = state.getArtikelByProjekt(projektId);
            console.log('🔍 DEBUG: Artikel list:', artikelListe);
            console.log('🔍 DEBUG: Artikel count:', artikelListe?.length || 0);
            
            // Try data processor
            console.log('📊 Calling processDataForDashboard...');
            const processedData = await processDataForDashboard(projektId);
            console.log('📊 Processed data received:', processedData);
            console.log('📊 Processed data keys:', Object.keys(processedData || {}));
            
            // Log chart data details
            if (processedData) {
                console.log('📊 umsatzData:', processedData.umsatzData);
                console.log('📊 db2Data:', processedData.db2Data);
                console.log('📊 db3JahrData:', processedData.db3JahrData);
                console.log('📊 projektkostenData:', processedData.projektkostenData);
                console.log('📊 db3KumuliertData:', processedData.db3KumuliertData);
            }
            
            // Validate
            const validation = validateDashboardData(processedData);
            console.log('✅ Validation result:', validation);
            if (validation.hasWarnings) {
                console.warn('⚠️ Dashboard warnings:', validation.warnings);
            }
            
            // Transform to our format
            console.log('🔄 Starting transformation...');
            const result = transformProcessedData(processedData);
            console.log('✅ Transformation complete:', result);
            
            // Store in state
            dashboardState.projektId = projektId;
            dashboardState.rawData = result;
            dashboardState.calculationResult = result;
            dashboardState.lastUpdate = new Date();
            dashboardState.isInitialized = true;
            
            console.log('💾 Stored in dashboardState');
            
            // Render layout
            container.innerHTML = createDashboardLayout();
            console.log('🎨 Layout rendered');
            
            // Initialize charts in executive summary
            requestAnimationFrame(() => {
                console.log('🎨 Initializing charts...');
                initializeExecutiveSummaryCharts();
                console.log('✅ Charts initialized');
            });
            
        } catch (error) {
            console.error('❌ Dashboard calculation failed:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);
            
            container.innerHTML = Widgets.renderErrorWidget(error);
        }
    }, 100);
}

// ==========================================
// LAYOUT CREATION
// ==========================================

/**
 * Create complete dashboard layout
 */
function createDashboardLayout() {
    const isMockData = !dashboardState.calculationResult.artikelListe || 
                       dashboardState.calculationResult.artikelListe.length === 0 ||
                       dashboardState.calculationResult.artikelListe[0]?.id?.startsWith('mock');
    
    return `
        <div class="story-dashboard-container">
            
            ${isMockData ? `
                <div class="mock-data-banner">
                    <span class="banner-icon">ℹ️</span>
                    <div class="banner-content">
                        <strong>Demo-Modus:</strong> Es werden Beispiel-Daten angezeigt. 
                        Bitte legen Sie Artikel und Projektkosten an, um echte Daten zu sehen.
                    </div>
                    <button class="banner-btn" onclick="window.switchProjektTab('artikel')">
                        📦 Artikel anlegen
                    </button>
                </div>
            ` : ''}
            
            <!-- Sticky Executive Summary -->
            <div class="executive-summary-sticky">
                ${createExecutiveSummary()}
            </div>
            
            <!-- Main Content Area: Sidebar + Viz -->
            <div class="dashboard-main-area">
                
                <!-- Left: Question Sidebar -->
                <aside class="question-sidebar">
                    ${createQuestionSidebar()}
                </aside>
                
                <!-- Right: Visualization Area -->
                <main class="visualization-area">
                    ${createVisualizationArea()}
                </main>
                
            </div>
        </div>
    `;
}

/**
 * Create executive summary (sticky top)
 */
function createExecutiveSummary() {
    const data = dashboardState.calculationResult;
    
    // Calculate totals
    const totalRevenue = data.gesamtRevenue5Y || 0;
    const totalDB3 = data.gesamtDB3_5Y || 0;
    const breakEvenJahr = data.breakEvenJahr || '-';
    const npv = data.npv || 0;
    const irr = data.irr || 0;
    
    // Decision
    const decision = npv > 0 ? 'go' : npv > -1000000 ? 'review' : 'no-go';
    const decisionText = decision === 'go' ? 'GO' : decision === 'review' ? 'REVIEW' : 'NO-GO';
    const decisionColor = decision === 'go' ? 'success' : decision === 'review' ? 'warning' : 'danger';
    
    return `
        <div class="executive-cards-compact">
            
            <!-- Card 1: Revenue -->
            <div class="exec-card-compact">
                <div class="card-icon">💰</div>
                <div class="card-content">
                    <div class="card-label">REVENUE</div>
                    <div class="card-value">${helpers.formatCurrency(totalRevenue / 1000000)}M</div>
                    <div class="card-meta">5Y Total</div>
                </div>
                <div class="card-sparkline" id="sparkline-revenue"></div>
            </div>
            
            <!-- Card 2: Profitability -->
            <div class="exec-card-compact">
                <div class="card-icon">✅</div>
                <div class="card-content">
                    <div class="card-label">PROFITABILITY</div>
                    <div class="card-value">${helpers.formatCurrency(totalDB3 / 1000000)}M</div>
                    <div class="card-meta">DB3 Total</div>
                </div>
                <div class="card-sparkline" id="sparkline-profitability"></div>
            </div>
            
            <!-- Card 3: Break-Even -->
            <div class="exec-card-compact">
                <div class="card-icon">⏱️</div>
                <div class="card-content">
                    <div class="card-label">BREAK-EVEN</div>
                    <div class="card-value">${breakEvenJahr}</div>
                    <div class="card-meta">Jahre bis Payback</div>
                </div>
            </div>
            
            <!-- Card 4: Decision -->
            <div class="exec-card-compact decision-card ${decision}">
                <div class="card-icon">🎯</div>
                <div class="card-content">
                    <div class="card-label">DECISION</div>
                    <div class="card-value decision-badge ${decisionColor}">${decisionText}</div>
                    <div class="card-meta">NPV: ${helpers.formatCurrency(npv / 1000000)}M</div>
                </div>
            </div>
            
        </div>
    `;
}

/**
 * Create question sidebar (left)
 */
function createQuestionSidebar() {
    const data = dashboardState.calculationResult;
    
    const totalRevenue = data.gesamtRevenue5Y || 0;
    const totalDB3 = data.gesamtDB3_5Y || 0;
    const totalCosts = data.gesamtProjektkosten || 0;
    
    return `
        <!-- Question 1: Revenue Story -->
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
                    📊 Waterfall Analyse
                </div>
                <div class="sub-item" onclick="window.showVisualization('revenue-breakdown')">
                    📦 Artikel-Split
                </div>
                <div class="sub-item" onclick="window.showVisualization('revenue-growth')">
                    📈 Wachstums-Treiber
                </div>
            </div>
        </div>
        
        <!-- Question 2: Profitability -->
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
                    📈 Margin Entwicklung
                </div>
                <div class="sub-item" onclick="window.showVisualization('margin-drivers')">
                    🎯 Verbesserungs-Potenzial
                </div>
            </div>
        </div>
        
        <!-- Question 3: Costs -->
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
                    📊 Cost Waterfall
                </div>
                <div class="sub-item" onclick="window.showVisualization('cost-breakdown')">
                    💰 Cost Driver
                </div>
                <div class="sub-item" onclick="window.showVisualization('cost-savings')">
                    💡 Einsparpotenziale
                </div>
            </div>
        </div>
        
        <!-- Question 4: Risks -->
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
                <div class="sub-item" onclick="window.showVisualization('risk-mitigation')">
                    🛡️ Maßnahmen
                </div>
            </div>
        </div>
    `;
}

/**
 * Create visualization area (right)
 */
function createVisualizationArea() {
    return `
        <!-- Empty State -->
        <div class="viz-empty-state" id="viz-empty-state">
            <div class="empty-icon">📊</div>
            <h3>Wähle eine Frage links</h3>
            <p>Klicke auf eine Analyse-Option, um die Visualisierung zu starten</p>
        </div>
        
        <!-- Visualization Containers (hidden initially) -->
        <div id="viz-containers">
            <!-- Will be populated dynamically -->
        </div>
    `;
}

// ==========================================
// INTERACTION HANDLERS
// ==========================================

/**
 * Toggle question card (expand/collapse)
 */
window.toggleQuestion = function(questionId) {
    console.log('🔄 Toggle question:', questionId);
    
    const card = document.querySelector(`[data-question="${questionId}"]`);
    if (!card) return;
    
    const isExpanded = card.classList.contains('expanded');
    
    // Collapse all questions first
    document.querySelectorAll('.question-card').forEach(c => {
        c.classList.remove('expanded');
    });
    
    // Expand clicked question if it wasn't expanded
    if (!isExpanded) {
        card.classList.add('expanded');
        dashboardState.activeQuestion = questionId;
    } else {
        dashboardState.activeQuestion = null;
    }
};

/**
 * Show visualization
 */
window.showVisualization = function(vizId) {
    console.log('📊 Show visualization:', vizId);
    
    // Hide empty state
    const emptyState = document.getElementById('viz-empty-state');
    if (emptyState) emptyState.style.display = 'none';
    
    // Get or create viz container
    let vizContainer = document.getElementById(`viz-${vizId}`);
    
    if (!vizContainer) {
        // Create new viz container
        vizContainer = createVizContainer(vizId);
        document.getElementById('viz-containers').insertAdjacentHTML('beforeend', vizContainer);
        
        // Initialize chart
        requestAnimationFrame(() => {
            initializeVisualization(vizId);
        });
    } else {
        // Show existing container
        vizContainer.style.display = 'block';
    }
    
    // Update active viz
    dashboardState.activeViz = vizId;
    
    // Update sub-item active states
    document.querySelectorAll('.sub-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[onclick*="${vizId}"]`)?.classList.add('active');
    
    // Scroll to viz
    vizContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

/**
 * Pin visualization
 */
window.pinVisualization = function(vizId) {
    console.log('📌 Pin visualization:', vizId);
    
    const container = document.getElementById(`viz-${vizId}`);
    if (!container) return;
    
    if (dashboardState.pinnedVizs.has(vizId)) {
        // Unpin
        dashboardState.pinnedVizs.delete(vizId);
        container.classList.remove('pinned');
    } else {
        // Pin
        dashboardState.pinnedVizs.add(vizId);
        container.classList.add('pinned');
    }
};

/**
 * Resize visualization
 */
window.resizeVisualization = function(vizId, size) {
    console.log(`📏 Resize ${vizId} to: ${size}`);
    
    const container = document.getElementById(`viz-${vizId}`);
    if (!container) return;
    
    // Remove all size classes
    container.classList.remove('size-small', 'size-medium', 'size-large');
    
    // Add new size class
    container.classList.add(`size-${size}`);
    
    // Store size
    dashboardState.vizSizes[vizId] = size;
    
    // Update button states
    container.querySelectorAll('.btn-resize').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-size') === size) {
            btn.classList.add('active');
        }
    });
    
    // Re-render chart to fit new size
    setTimeout(() => {
        const chart = dashboardState.charts[vizId];
        if (chart) {
            chart.resize();
        }
    }, 300);
};

/**
 * Close visualization
 */
window.closeVisualization = function(vizId) {
    console.log('❌ Close visualization:', vizId);
    
    // Don't close if pinned
    if (dashboardState.pinnedVizs.has(vizId)) {
        alert('📌 Bitte erst Unpin, bevor Sie schließen');
        return;
    }
    
    const container = document.getElementById(`viz-${vizId}`);
    if (container) {
        container.style.display = 'none';
    }
    
    // Show empty state if no viz visible
    const visibleVizs = document.querySelectorAll('.viz-container[style*="display: block"]');
    if (visibleVizs.length === 0) {
        document.getElementById('viz-empty-state').style.display = 'flex';
    }
    
    // Update active viz
    if (dashboardState.activeViz === vizId) {
        dashboardState.activeViz = null;
    }
};

// ==========================================
// VIZ CONTAINER CREATION
// ==========================================

/**
 * Create visualization container HTML
 */
function createVizContainer(vizId) {
    const vizConfig = getVizConfig(vizId);
    
    return `
        <div class="viz-container size-large" id="viz-${vizId}">
            <div class="viz-header">
                <div class="viz-title">
                    <span class="viz-icon">${vizConfig.icon}</span>
                    <h3>${vizConfig.title}</h3>
                </div>
                <div class="viz-controls">
                    <button class="btn-resize" data-size="small" onclick="window.resizeVisualization('${vizId}', 'small')">
                        S
                    </button>
                    <button class="btn-resize" data-size="medium" onclick="window.resizeVisualization('${vizId}', 'medium')">
                        M
                    </button>
                    <button class="btn-resize active" data-size="large" onclick="window.resizeVisualization('${vizId}', 'large')">
                        L
                    </button>
                    <button class="btn-pin" onclick="window.pinVisualization('${vizId}')">
                        🔒
                    </button>
                    <button class="btn-close" onclick="window.closeVisualization('${vizId}')">
                        ✕
                    </button>
                </div>
            </div>
            
            <div class="viz-content" id="viz-content-${vizId}">
                <!-- Will be populated by initializeVisualization -->
            </div>
        </div>
    `;
}

/**
 * Get visualization configuration
 */
function getVizConfig(vizId) {
    const configs = {
        'revenue-waterfall': {
            icon: '📊',
            title: 'Revenue Waterfall Analyse',
            description: 'Wie entwickelt sich unser Umsatz über die Jahre?'
        },
        'revenue-breakdown': {
            icon: '📦',
            title: 'Revenue nach Artikel',
            description: 'Welche Artikel tragen wie viel bei?'
        },
        'revenue-growth': {
            icon: '📈',
            title: 'Wachstums-Treiber',
            description: 'Was treibt das Umsatzwachstum?'
        },
        'margin-bridge': {
            icon: '🌉',
            title: 'Margin Bridge Analyse',
            description: 'Von DB1 zu DB3 - wo geht die Marge hin?'
        },
        'margin-trend': {
            icon: '📈',
            title: 'Margin-Entwicklung',
            description: 'Wie entwickelt sich die Profitabilität?'
        },
        'margin-drivers': {
            icon: '🎯',
            title: 'Margin-Verbesserung',
            description: 'Wo können wir die Marge optimieren?'
        },
        'cost-waterfall': {
            icon: '📊',
            title: 'Cost Waterfall',
            description: 'Wie verteilen sich die Projektkosten?'
        },
        'cost-breakdown': {
            icon: '💰',
            title: 'Cost Driver Analyse',
            description: 'Welche Kostentreiber sind am wichtigsten?'
        },
        'cost-savings': {
            icon: '💡',
            title: 'Einsparpotenziale',
            description: 'Wo können wir Kosten reduzieren?'
        },
        'sensitivity-tornado': {
            icon: '🌪️',
            title: 'Sensitivity Tornado',
            description: 'Welche Parameter haben den größten Einfluss?'
        },
        'scenario-analysis': {
            icon: '🎭',
            title: 'Szenario-Analyse',
            description: 'Best Case, Base Case, Worst Case'
        },
        'risk-mitigation': {
            icon: '🛡️',
            title: 'Risiko-Maßnahmen',
            description: 'Empfohlene Aktionen zur Risiko-Minimierung'
        }
    };
    
    return configs[vizId] || {
        icon: '📊',
        title: vizId,
        description: ''
    };
}

// ==========================================
// CHART INITIALIZATION
// ==========================================

/**
 * Initialize executive summary charts (sparklines)
 */
function initializeExecutiveSummaryCharts() {
    console.log('🎨 Initializing executive summary charts...');
    
    ChartFactory.initializeChartDefaults();
    
    const data = dashboardState.calculationResult;
    
    // Revenue sparkline
    const revenueData = data.jahre.map(jahr => {
        return data.jahreDaten[jahr]?.gesamtRevenue || 0;
    });
    ChartFactory.createSparkline('sparkline-revenue', revenueData);
    
    // Profitability sparkline
    const db3Data = data.jahre.map(jahr => {
        return data.jahreDaten[jahr]?.gesamtDB3 || 0;
    });
    ChartFactory.createSparkline('sparkline-profitability', db3Data);
}

/**
 * Initialize specific visualization
 */
function initializeVisualization(vizId) {
    console.log('🎨 Initializing visualization:', vizId);
    
    const content = document.getElementById(`viz-content-${vizId}`);
    if (!content) return;
    
    const data = dashboardState.calculationResult;
    
    // Create canvas for chart
    const canvasId = `canvas-${vizId}`;
    content.innerHTML = `
        <div class="chart-wrapper">
            <canvas id="${canvasId}"></canvas>
        </div>
        <div class="viz-insights" id="insights-${vizId}">
            <!-- Insights will be added here -->
        </div>
    `;
    
    // Initialize specific chart
    setTimeout(() => {
        switch(vizId) {
            case 'revenue-waterfall':
                initRevenueWaterfall(canvasId, data);
                break;
            case 'revenue-breakdown':
                initRevenueBreakdown(canvasId, data);
                break;
            case 'margin-bridge':
                initMarginBridge(canvasId, data);
                break;
            case 'cost-waterfall':
                initCostWaterfall(canvasId, data);
                break;
            case 'sensitivity-tornado':
                initSensitivityTornado(canvasId, data);
                break;
            default:
                content.innerHTML += `<p class="coming-soon">📊 Chart wird implementiert: ${vizId}</p>`;
        }
    }, 100);
}

/**
 * Initialize revenue waterfall chart
 */
function initRevenueWaterfall(canvasId, data) {
    const waterfallData = {
        labels: data.jahre,
        datasets: [{
            label: 'Revenue',
            data: data.jahre.map(jahr => data.jahreDaten[jahr]?.gesamtRevenue || 0),
            backgroundColor: '#00A651'
        }]
    };
    
    const chart = ChartFactory.createRevenueWaterfall(canvasId, waterfallData);
    dashboardState.charts[canvasId] = chart;
    
    // Add insights
    const insights = document.getElementById(`insights-revenue-waterfall`);
    if (insights) {
        insights.innerHTML = `
            <div class="insight-box">
                <h4>💡 Key Insights</h4>
                <ul>
                    <li>Stärkstes Wachstum in Jahr 2-3</li>
                    <li>Hardware trägt 50% zum Gesamtumsatz bei</li>
                    <li>Software-Anteil steigt kontinuierlich</li>
                </ul>
            </div>
        `;
    }
}

/**
 * Initialize revenue breakdown
 */
function initRevenueBreakdown(canvasId, data) {
    // Group by artikel type
    const breakdown = {};
    data.artikelListe.forEach(artikel => {
        const typ = artikel.typ || 'Sonstige';
        if (!breakdown[typ]) breakdown[typ] = 0;
        breakdown[typ] += artikel.gesamtRevenue5Y || 0;
    });
    
    const breakdownData = {
        labels: Object.keys(breakdown),
        datasets: [{
            data: Object.values(breakdown),
            backgroundColor: ['#003366', '#0066CC', '#00A651', '#FF6600']
        }]
    };
    
    const chart = ChartFactory.createPieChart(canvasId, breakdownData);
    dashboardState.charts[canvasId] = chart;
}

/**
 * Initialize margin bridge
 */
function initMarginBridge(canvasId, data) {
    const firstYear = data.jahre[0];
    const yearData = data.jahreDaten[firstYear];
    
    if (!yearData) return;
    
    const bridgeData = {
        labels: ['DB1', 'Marketing', 'R&D', 'Overhead', 'DB3'],
        datasets: [{
            data: [
                yearData.gesamtDB1 || 0,
                -(yearData.gesamtMarketing || 0),
                -(yearData.gesamtRnD || 0),
                -(yearData.gesamtOverhead || 0),
                yearData.gesamtDB3 || 0
            ],
            backgroundColor: ['#00A651', '#FF6600', '#FF6600', '#FF6600', '#003366']
        }]
    };
    
    const chart = ChartFactory.createMarginBridge(canvasId, bridgeData);
    dashboardState.charts[canvasId] = chart;
}

/**
 * Initialize cost waterfall
 */
function initCostWaterfall(canvasId, data) {
    const costData = {
        labels: data.jahre,
        datasets: [{
            label: 'Projektkosten',
            data: data.jahre.map(jahr => data.jahreDaten[jahr]?.gesamtProjektkosten || 0),
            backgroundColor: '#DC0032'
        }]
    };
    
    const chart = ChartFactory.createCostWaterfall(canvasId, costData);
    dashboardState.charts[canvasId] = chart;
}

/**
 * Initialize sensitivity tornado
 */
function initSensitivityTornado(canvasId, data) {
    const tornadoData = {
        labels: ['Preis', 'Menge', 'Kosten', 'Marketing'],
        datasets: [{
            label: 'Impact auf NPV',
            data: [5000000, 3500000, -2000000, -1500000],
            backgroundColor: ['#00A651', '#00A651', '#DC0032', '#DC0032']
        }]
    };
    
    const chart = ChartFactory.createTornadoChart(canvasId, tornadoData);
    dashboardState.charts[canvasId] = chart;
}

// ==========================================
// EXPORT
// ==========================================

export default {
    renderProjektDashboard
};
