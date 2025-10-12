/**
 * ALBO Solutions - Portfolio Cockpit Module
 * Senior Controller Dashboard with Chart Integration
 * Horváth & Partners Style
 * 
 * Uses charts.js to display portfolio/project data
 */

import { state } from '../state.js';
import * as charts from '../charts.js';

// ==========================================
// STATE
// ==========================================

let currentView = 'portfolio'; // 'portfolio' | 'projekt'
let selectedProjektId = null;

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

/**
 * Render Portfolio Cockpit
 * @public
 */
export function renderCockpit() {
    console.log('📊 Rendering Portfolio Cockpit...');
    
    // Render Portfolio KPIs
    renderPortfolioKPIs();
    
    // Render Projekt Selector
    renderProjektSelector();
    
    // Render Charts (Portfolio or Projekt)
    if (currentView === 'portfolio') {
        renderPortfolioCharts();
    } else {
        renderProjektCharts(selectedProjektId);
    }
}

// ==========================================
// PORTFOLIO KPIs
// ==========================================

/**
 * Calculate Portfolio-Level KPIs
 */
function calculatePortfolioKPIs() {
    const projects = state.getAllProjekte();
    
    if (!projects || projects.length === 0) {
        return {
            totalProjects: 0,
            activeProjects: 0,
            totalNPV: 0,
            avgIRR: 0,
            totalRevenue: 0,
            avgMargin: 0,
            riskProjects: 0
        };
    }
    
    // Calculate aggregated KPIs
    const totalNPV = projects.reduce((sum, p) => {
        const calc = calculateProjektWirtschaftlichkeit(p.id);
        return sum + (calc?.kpis?.npv || 0);
    }, 0);
    
    const totalRevenue = projects.reduce((sum, p) => {
        const calc = calculateProjektWirtschaftlichkeit(p.id);
        return sum + (calc?.totals?.sales_revenue || 0);
    }, 0);
    
    const avgIRR = projects.reduce((sum, p) => {
        const calc = calculateProjektWirtschaftlichkeit(p.id);
        return sum + (calc?.kpis?.irr || 0);
    }, 0) / (projects.length || 1);
    
    const avgMargin = projects.reduce((sum, p) => {
        const calc = calculateProjektWirtschaftlichkeit(p.id);
        return sum + (calc?.kpis?.avg_ebit_margin || 0);
    }, 0) / (projects.length || 1);
    
    return {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'Aktiv').length,
        totalNPV: totalNPV / 1000000, // Convert to M€
        avgIRR: avgIRR,
        totalRevenue: totalRevenue / 1000000, // Convert to M€
        avgMargin: avgMargin,
        riskProjects: projects.filter(p => p.status === 'On Hold').length
    };
}

/**
 * Helper function to calculate projekt wirtschaftlichkeit
 */
function calculateProjektWirtschaftlichkeit(projektId) {
    try {
        const projekt = state.getProjekt(projektId);
        if (!projekt) return null;
        
        const artikel = state.getArtikelByProjekt(projektId);
        if (!artikel || artikel.length === 0) return null;
        
        const jahre = {};
        let totalRevenue = 0;
        
        // Calculate per year
        for (let year = 2025; year <= 2031; year++) {
            let yearRevenue = 0;
            let yearCosts = 0;
            
            artikel.forEach(art => {
                const volume = art.volumes?.[year] || 0;
                const price = art.prices?.[year] || 0;
                const hk = art.hk || 0;
                
                yearRevenue += volume * price;
                yearCosts += volume * hk;
            });
            
            jahre[year] = {
                sales_revenue: yearRevenue,
                db3: yearRevenue - yearCosts
            };
            
            totalRevenue += yearRevenue;
        }
        
        // Simple NPV
        const npv = Object.values(jahre).reduce((sum, j) => sum + j.db3, 0);
        const irr = npv > 0 ? 15 : 0;
        const avgMargin = totalRevenue > 0 ? (npv / totalRevenue * 100) : 0;
        
        return {
            kpis: {
                npv: npv,
                irr: irr,
                avg_ebit_margin: avgMargin
            },
            totals: {
                sales_revenue: totalRevenue
            },
            jahre: jahre
        };
        
    } catch (error) {
        console.error('Error calculating wirtschaftlichkeit:', error);
        return null;
    }
}

/**
 * Render Portfolio KPI Cards
 */
function renderPortfolioKPIs() {
    const kpis = calculatePortfolioKPIs();
    
    const metricsGrid = document.querySelector('.metrics-grid');
    if (!metricsGrid) return;
    
    metricsGrid.innerHTML = `
        <!-- NPV -->
        <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
                <div class="metric-label">Portfolio NPV</div>
                <div class="metric-value">${kpis.totalNPV.toFixed(1)} M€</div>
                <div class="metric-change positive">
                    ${kpis.totalProjects} Projekte
                </div>
            </div>
        </div>

        <!-- IRR -->
        <div class="metric-card">
            <div class="metric-icon">📈</div>
            <div class="metric-content">
                <div class="metric-label">Ø IRR</div>
                <div class="metric-value">${kpis.avgIRR.toFixed(1)}%</div>
                <div class="metric-change ${kpis.avgIRR > 15 ? 'positive' : 'neutral'}">
                    ${kpis.avgIRR > 15 ? 'Über Benchmark' : 'Im Zielbereich'}
                </div>
            </div>
        </div>

        <!-- Revenue -->
        <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
                <div class="metric-label">Total Revenue</div>
                <div class="metric-value">${kpis.totalRevenue.toFixed(1)} M€</div>
                <div class="metric-change neutral">
                    Portfolio 2025-2031
                </div>
            </div>
        </div>

        <!-- Status -->
        <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
                <div class="metric-label">Status</div>
                <div class="metric-value">${kpis.activeProjects}/${kpis.totalProjects}</div>
                <div class="metric-change ${kpis.riskProjects > 0 ? 'warning' : 'positive'}">
                    ${kpis.riskProjects > 0 ? `${kpis.riskProjects} Risiko` : 'Alle on Track'}
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// PROJECT SELECTOR
// ==========================================

/**
 * Render Project Selector Dropdown
 */
function renderProjektSelector() {
    // Find control panel or create container
    let container = document.getElementById('cockpit-projekt-selector-container');
    
    if (!container) {
        const metricsGrid = document.querySelector('.metrics-grid');
        if (!metricsGrid) return;
        
        container = document.createElement('div');
        container.id = 'cockpit-projekt-selector-container';
        metricsGrid.parentNode.insertBefore(container, metricsGrid.nextSibling);
    }
    
    const projects = state.getAllProjekte();
    
    container.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 24px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 4px solid #2563eb;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                        🎯 Projekt-Ansicht
                    </h3>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">
                        Wähle ein Projekt für detaillierte Charts oder zeige das gesamte Portfolio
                    </p>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <select id="cockpit-projekt-selector" 
                            onchange="window.cockpitModule.onProjektSelect(this.value)"
                            style="padding: 10px 16px; border: 1px solid #e5e7eb; border-radius: 6px; 
                                   font-size: 14px; font-weight: 500; cursor: pointer; min-width: 250px;
                                   background: white;">
                        <option value="portfolio">📊 Gesamtes Portfolio</option>
                        ${projects.map(p => `
                            <option value="${p.id}" ${selectedProjektId === p.id ? 'selected' : ''}>
                                ${getProjectIcon(p)} ${p.name}
                            </option>
                        `).join('')}
                    </select>
                    
                    ${currentView === 'projekt' ? `
                        <button onclick="window.cockpitModule.resetToPortfolio()" 
                                class="btn btn-secondary btn-sm"
                                style="white-space: nowrap;">
                            ← Portfolio
                        </button>
                    ` : ''}
                </div>
            </div>
            
            ${currentView === 'projekt' && selectedProjektId ? `
                <div style="padding: 12px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #3b82f6; margin-top: 16px;">
                    <div style="font-size: 12px; color: #1e40af; font-weight: 600;">
                        📌 Projekt-Fokus: ${getProjectName(selectedProjektId)}
                    </div>
                    <div style="font-size: 11px; color: #3b82f6; margin-top: 4px;">
                        Die Charts zeigen nur Daten für dieses spezifische Projekt
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// ==========================================
// CHARTS RENDERING
// ==========================================

/**
 * Render Portfolio Charts (aggregated)
 */
function renderPortfolioCharts() {
    console.log('📊 Rendering Portfolio Charts...');
    
    const projects = state.getAllProjekte();
    const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031];
    
    // Aggregate data from all projects
    const portfolioData = {
        umsatz: years.map(() => 0),
        absatz: years.map(() => 0),
        db2: years.map(() => 0),
        db2Percent: years.map(() => 0),
        projektkosten: years.map(() => 2.5),
        db3Jahr: years.map(() => 0),
        db3Kumuliert: []
    };
    
    // Sum up all projects
    projects.forEach(projekt => {
        const artikel = state.getArtikelByProjekt(projekt.id);
        
        artikel.forEach(art => {
            years.forEach((year, index) => {
                const volume = art.volumes?.[year] || 0;
                const price = art.prices?.[year] || 0;
                const hk = art.hk || 0;
                
                const revenue = (volume * price) / 1000; // k€
                const costs = (volume * hk) / 1000; // k€
                
                portfolioData.umsatz[index] += revenue;
                portfolioData.absatz[index] += volume / 1000; // Tsd.
                portfolioData.db2[index] += (revenue - costs);
            });
        });
    });
    
    // Calculate DB2 percent
    portfolioData.db2Percent = portfolioData.umsatz.map((u, i) => 
        u > 0 ? (portfolioData.db2[i] / u * 100) : 0
    );
    
    // Calculate DB3
    portfolioData.db3Jahr = portfolioData.db2.map((db2, i) => db2 - portfolioData.projektkosten[i]);
    
    // Calculate cumulative
    let cumulative = 0;
    portfolioData.db3Kumuliert = portfolioData.db3Jahr.map(db3 => {
        cumulative += db3;
        return cumulative;
    });
    
    // Update charts using charts.js API
    charts.updateChartData('umsatzChart', portfolioData.umsatz, 'Portfolio Umsatz (k€)');
    charts.updateChartData('absatzChart', portfolioData.absatz, 'Portfolio Absatz (Tsd.)');
    charts.updateDB2ChartData(portfolioData.db2, portfolioData.db2Percent);
    charts.updateChartData('projektkostenChart', portfolioData.projektkosten, 'Projektkosten (k€)');
    charts.updateChartData('db3JahrChart', portfolioData.db3Jahr, 'Portfolio DB3 (k€)');
    charts.updateChartData('db3KumuliertChart', portfolioData.db3Kumuliert, 'Portfolio DB3 Kumuliert (k€)');
    
    console.log('✅ Portfolio charts updated');
}

/**
 * Render Project-Specific Charts
 */
function renderProjektCharts(projektId) {
    console.log('📊 Rendering Charts for Projekt:', projektId);
    
    const projekt = state.getProjekt(projektId);
    if (!projekt) {
        console.error('Projekt not found:', projektId);
        return;
    }
    
    const artikel = state.getArtikelByProjekt(projektId);
    const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031];
    
    // Calculate projekt-specific data
    const projektData = {
        umsatz: years.map(() => 0),
        absatz: years.map(() => 0),
        db2: years.map(() => 0),
        db2Percent: years.map(() => 0),
        projektkosten: years.map(() => 2.5),
        db3Jahr: years.map(() => 0),
        db3Kumuliert: []
    };
    
    // Calculate from artikel
    artikel.forEach(art => {
        years.forEach((year, index) => {
            const volume = art.volumes?.[year] || 0;
            const price = art.prices?.[year] || 0;
            const hk = art.hk || 0;
            
            const revenue = (volume * price) / 1000; // k€
            const costs = (volume * hk) / 1000; // k€
            
            projektData.umsatz[index] += revenue;
            projektData.absatz[index] += volume / 1000; // Tsd.
            projektData.db2[index] += (revenue - costs);
        });
    });
    
    // Calculate DB2 percent
    projektData.db2Percent = projektData.umsatz.map((u, i) => 
        u > 0 ? (projektData.db2[i] / u * 100) : 0
    );
    
    // Calculate DB3
    projektData.db3Jahr = projektData.db2.map((db2, i) => db2 - projektData.projektkosten[i]);
    
    // Calculate cumulative
    let cumulative = 0;
    projektData.db3Kumuliert = projektData.db3Jahr.map(db3 => {
        cumulative += db3;
        return cumulative;
    });
    
    // Update charts with projekt data
    charts.updateChartData('umsatzChart', projektData.umsatz, `${projekt.name} - Umsatz (k€)`);
    charts.updateChartData('absatzChart', projektData.absatz, `${projekt.name} - Absatz (Tsd.)`);
    charts.updateDB2ChartData(projektData.db2, projektData.db2Percent);
    charts.updateChartData('projektkostenChart', projektData.projektkosten, 'Projektkosten (k€)');
    charts.updateChartData('db3JahrChart', projektData.db3Jahr, `${projekt.name} - DB3 (k€)`);
    charts.updateChartData('db3KumuliertChart', projektData.db3Kumuliert, `${projekt.name} - DB3 Kumuliert (k€)`);
    
    console.log('✅ Projekt charts updated');
}

// ==========================================
// INTERACTION HANDLERS
// ==========================================

/**
 * Handle projekt selection
 */
export function onProjektSelect(value) {
    console.log('🎯 Projekt selected:', value);
    
    if (value === 'portfolio') {
        resetToPortfolio();
    } else {
        currentView = 'projekt';
        selectedProjektId = value;
        
        // Re-render
        renderProjektSelector();
        renderProjektCharts(value);
    }
}

/**
 * Reset to portfolio view
 */
export function resetToPortfolio() {
    console.log('📊 Resetting to portfolio view');
    
    currentView = 'portfolio';
    selectedProjektId = null;
    
    // Re-render
    renderProjektSelector();
    renderPortfolioCharts();
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Get project icon based on status
 */
function getProjectIcon(projekt) {
    const icons = {
        'Aktiv': '🟢',
        'Planung': '🔵',
        'On Hold': '🟡',
        'Abgeschlossen': '⚫',
        'Konzept': '💡'
    };
    return icons[projekt.status] || '📁';
}

/**
 * Get project name by ID
 */
function getProjectName(projektId) {
    const projekt = state.getProjekt(projektId);
    return projekt ? projekt.name : 'Unbekannt';
}

// ==========================================
// EXPORTS
// ==========================================

export default {
    renderCockpit,
    onProjektSelect,
    resetToPortfolio
};
