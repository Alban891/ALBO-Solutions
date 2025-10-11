/**
 * CFO Dashboard - Main Controller
 * Orchestrates data processing, chart creation, and widget rendering
 * Professional modular architecture for scalability
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';
import { processDataForDashboard, validateDashboardData } from './data-processor.js';
import * as ChartFactory from './chart-factory.js';
import * as Widgets from './widgets.js';

// ==========================================
// HELPER: Ensure Kosten Data is Loaded
// ==========================================

/**
 * Ensure kostenWerte exists and is populated
 * If DB projekt, trigger load from external module
 */
async function ensureKostenDataLoaded(projektId) {
    if (!projektId) return;
    
    console.log('📥 Ensuring Kosten data for:', projektId);
    
    const projekt = state.getProjekt(projektId);
    if (!projekt) {
        console.warn('⚠️ No projekt found');
        return;
    }
    
    // Initialize kostenWerte if it doesn't exist
    if (!projekt.kostenWerte) {
        console.log('⚠️ Initializing empty kostenWerte');
        projekt.kostenWerte = {};
        state.setProjekt(projektId, projekt);
    }
    
    // If DB projekt and kostenWerte is empty, try to load from DB
    if (projektId.startsWith('projekt-db-') && Object.keys(projekt.kostenWerte).length === 0) {
        console.log('📥 DB-Projekt with empty kostenWerte - triggering external load');
        
        // Try to call projektkosten module's load function if available
        if (window.projektkostenModule && typeof window.projektkostenModule.ensureKostenDataLoaded === 'function') {
            await window.projektkostenModule.ensureKostenDataLoaded(projektId);
            console.log('✅ External load completed');
        } else {
            console.warn('⚠️ projektkostenModule not available - data may be incomplete');
        }
    }
    
    console.log('✅ Kosten data ready:', Object.keys(projekt.kostenWerte).length, 'blocks');
}

// ==========================================
// DASHBOARD STATE
// ==========================================

let dashboardState = {
    data: null,
    editMode: false,
    lastUpdate: null,
    isInitialized: false
};

// ==========================================
// MAIN RENDER
// ==========================================

/**
 * Main dashboard render function
 * Entry point for dashboard display
 * 
 * @public
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
    
    console.log('📊 Rendering dashboard for projekt:', projektId);
    
    // Show loading
    container.innerHTML = createLoadingScreen();
    
    try {
        // CRITICAL: Ensure Kosten data is loaded from DB FIRST!
        console.log('📥 Loading Kosten data before dashboard render...');
        await ensureKostenDataLoaded(projektId);
        console.log('✅ Kosten data loaded');
        
        // Process data
        dashboardState.data = processDataForDashboard(projektId);
        dashboardState.lastUpdate = new Date();
        
        // Validate
        const validation = validateDashboardData(dashboardState.data);
        if (validation.hasWarnings) {
            console.warn('⚠️ Dashboard warnings:', validation.warnings);
        }
        
        // Render UI
        container.innerHTML = createDashboardLayout();
        
        // Initialize charts immediately (not async)
        // Wait for next frame to ensure DOM is painted
        requestAnimationFrame(() => {
            initializeAllCharts();
            dashboardState.isInitialized = true;
            console.log('✅ Dashboard charts initialized');
        });
        
        console.log('✅ Dashboard rendered successfully');
        
    } catch (error) {
        console.error('❌ Dashboard render failed:', error);
        container.innerHTML = Widgets.renderErrorWidget(error);
    }
}

// ==========================================
// LAYOUT CREATION
// ==========================================

/**
 * Create complete dashboard layout
 * 3x3 grid with all charts and widgets
 */
function createDashboardLayout() {
    const viewportHeight = window.innerHeight - 200;
    const rowHeight = Math.floor(viewportHeight / 3);
    
    return `
        <div class="dashboard-wrapper" style="height: 100%; overflow: hidden;">
            ${createDashboardHeader()}
            
            <!-- Dashboard Grid (3x3) -->
            <div style="
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(3, ${rowHeight}px);
                gap: 12px;
                padding: 0 12px;
                height: calc(100% - 70px);
            ">
                ${createChartGrid()}
            </div>
            
            ${createDashboardFooter()}
        </div>
    `;
}

/**
 * Create dashboard header with title and controls
 */
function createDashboardHeader() {
    return `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: linear-gradient(135deg, #f0f9ff, #e0e7ff);
            border-bottom: 2px solid #dbeafe;
            margin-bottom: 12px;
        ">
            <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--primary);">
                    📊 Business Case: ${helpers.escapeHtml(dashboardState.data.projektName)}
                </h3>
                <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
                    Letzte Aktualisierung: ${dashboardState.lastUpdate.toLocaleTimeString('de-DE')}
                </div>
            </div>
            
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm btn-secondary"
                        onclick="window.exportDashboard()"
                        style="font-size: 11px; padding: 6px 12px;">
                    📥 Export
                </button>
                <button class="btn btn-sm btn-primary"
                        onclick="window.refreshDashboard()"
                        style="font-size: 11px; padding: 6px 12px;">
                    🔄 Aktualisieren
                </button>
            </div>
        </div>
    `;
}

/**
 * Create 3x3 chart grid
 */
function createChartGrid() {
    const charts = [
        // Row 1: Artikel-Metriken
        { id: 'umsatz', name: 'Umsatz', subtitle: 'in Mio. €', type: 'chart' },
        { id: 'absatz', name: 'Absatz', subtitle: 'in Tausend Stück', type: 'chart' },
        { id: 'db2', name: 'DB 2*', subtitle: 'in Mio. €', type: 'chart' },
        
        // Row 2: Projektkosten
        { id: 'projektkosten', name: 'Projektkosten', subtitle: 'in Mio. €', type: 'chart' },
        { id: 'projektkosten-kum', name: 'Projektkosten', subtitle: 'kumuliert', type: 'kpi-box' },
        { id: 'projekte-table', name: 'Projekte', type: 'table' },
        
        // Row 3: Wirtschaftlichkeit
        { id: 'db3-jahr', name: 'DB 3 pro Jahr**', subtitle: 'in Mio. €', type: 'chart' },
        { id: 'db3-kumuliert', name: 'DB 3 kumuliert**', subtitle: 'in Mio. €', type: 'chart' },
        { id: 'amortisation', name: 'Amortisation***', subtitle: 'Break-Even', type: 'kpi-amortisation' }
    ];
    
    return charts.map(chart => createChartContainer(chart)).join('');
}

/**
 * Create individual chart container
 */
function createChartContainer(chart) {
    let content;
    
    switch(chart.type) {
        case 'chart':
            content = Widgets.renderChartCanvas(chart.id);
            break;
        case 'kpi-box':
            content = Widgets.renderProjektkostenKPI(dashboardState.data);
            break;
        case 'kpi-amortisation':
            content = Widgets.renderAmortisationKPI(dashboardState.data);
            break;
        case 'table':
            content = Widgets.renderProjekteTable(dashboardState.data);
            break;
        default:
            content = '<div>-</div>';
    }
    
    return Widgets.renderWidgetContainer(chart.id, chart.name, chart.subtitle, content);
}

/**
 * Create dashboard footer with legends
 */
function createDashboardFooter() {
    return `
        <div style="padding: 8px 16px; background: #f9fafb; border-top: 1px solid #e5e7eb; 
                    font-size: 9px; color: #6b7280; text-align: center;">
            <div style="margin-bottom: 2px;">
                * DB2 = Deckungsbeitrag II (Manufacturing Margin)
            </div>
            <div style="margin-bottom: 2px;">
                ** DB3 = Deckungsbeitrag III (nach Entwicklungskosten, Marketing, Vertrieb)
            </div>
            <div>
                *** Amortisation = Break-Even Punkt (Jahre bis kumulierte DB3 > 0)
            </div>
        </div>
    `;
}

/**
 * Create loading screen
 */
function createLoadingScreen() {
    return `
        <div style="display: flex; align-items: center; justify-content: center; 
                    height: 500px; background: white; border-radius: 8px;">
            ${Widgets.renderLoadingWidget()}
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
    console.log('🎨 Initializing dashboard charts...');
    
    if (!dashboardState.data) {
        console.error('❌ No data available for charts');
        return false;
    }
    
    // Initialize Chart.js defaults
    ChartFactory.initializeChartDefaults();
    
    // Create all charts
    ChartFactory.createUmsatzChart('canvas-umsatz', dashboardState.data.umsatzData);
    ChartFactory.createAbsatzChart('canvas-absatz', dashboardState.data.absatzData);
    ChartFactory.createDB2Chart('canvas-db2', dashboardState.data.db2Data);
    ChartFactory.createProjektkostenChart('canvas-projektkosten', dashboardState.data.projektkostenData);
    ChartFactory.createDB3JahrChart('canvas-db3-jahr', dashboardState.data.db3JahrData);
    ChartFactory.createDB3KumuliertChart('canvas-db3-kumuliert', dashboardState.data.db3KumuliertData);
    
    console.log('✅ All charts initialized');
    return true;
}

// ==========================================
// WINDOW FUNCTIONS
// ==========================================

/**
 * Refresh dashboard with latest data
 * 
 * @public
 */
window.refreshDashboard = function() {
    console.log('🔄 Refreshing dashboard...');
    
    // Destroy old charts
    ChartFactory.destroyAllCharts();
    
    // Re-render
    renderProjektDashboard();
    
    // Show success message
    if (window.cfoDashboard?.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
            level: 'success',
            title: '✅ Dashboard aktualisiert',
            text: 'Alle Daten und Charts wurden neu geladen.',
            timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
    }
};

/**
 * Export dashboard data
 * 
 * @public
 */
window.exportDashboard = function() {
    console.log('📥 Exporting dashboard...');
    
    if (!dashboardState.data) {
        alert('Keine Daten zum Exportieren vorhanden');
        return;
    }
    
    // TODO: Implement Excel/PDF export
    alert('Export-Funktion wird implementiert...');
    
    /* Future implementation:
    import { prepareExportData } from './data-processor.js';
    const exportData = prepareExportData(dashboardState.data);
    downloadAsExcel(exportData);
    */
};

/**
 * Toggle dashboard edit mode
 * 
 * @public
 */
window.toggleDashboardEdit = function() {
    dashboardState.editMode = !dashboardState.editMode;
    console.log('⚙️ Edit mode:', dashboardState.editMode);
    
    // Future: Show/hide edit controls
    alert('Edit-Modus wird implementiert...');
};

/**
 * Update scenario parameters
 * 
 * @public
 */
window.updateSzenario = function(parameter, value) {
    console.log(`🎯 Szenario update: ${parameter} = ${value}`);
    // Store for later calculation
};

/**
 * Apply scenario changes
 * 
 * @public
 */
window.applySzenario = function() {
    console.log('🔄 Applying scenario...');
    alert('Szenario-Analyse wird implementiert...');
    // TODO: Recalculate with adjusted parameters
};

/**
 * Reset scenario to defaults
 * 
 * @public
 */
window.resetSzenario = function() {
    console.log('↩️ Resetting scenario...');
    document.getElementById('scenario-preis').value = '+/-0%';
    document.getElementById('scenario-menge').value = '+/-0%';
    document.getElementById('scenario-hk').value = '+/-0%';
    document.getElementById('scenario-kosten').value = '+/-0%';
};

// ==========================================
// LIFECYCLE
// ==========================================

/**
 * Cleanup on component unmount
 */
export function destroyDashboard() {
    ChartFactory.destroyAllCharts();
    dashboardState = {
        data: null,
        editMode: false,
        lastUpdate: null,
        isInitialized: false
    };
    console.log('🧹 Dashboard destroyed');
}

/**
 * Get current dashboard state
 */
export function getDashboardState() {
    return dashboardState;
}

// ==========================================
// EXPORT
// ==========================================

export default { 
    renderProjektDashboard,
    destroyDashboard,
    getDashboardState
};
