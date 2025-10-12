/**
 * ALBO Solutions - Portfolio Cockpit Module (Standalone)
 * Senior Controller Dashboard: Portfolio Overview without Charts
 * Horváth & Partners Style
 * 
 * Shows: Portfolio KPIs + Project Table + Drill-Down to Details
 * Charts are in individual project detail pages
 */

import { state } from '../state.js';

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
    
    // Render Content (Portfolio Table or Projekt Detail)
    if (currentView === 'portfolio') {
        renderPortfolioTable();
    } else {
        renderProjektDetail(selectedProjektId);
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
        
        // Simple NPV calculation
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
        
        // Simple NPV (no discounting for now)
        const npv = Object.values(jahre).reduce((sum, j) => sum + j.db3, 0);
        const irr = npv > 0 ? 15 : 0; // Placeholder
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
    
    // Update KPI values in metric cards
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
    const dashboardMain = document.querySelector('.dashboard-main');
    if (!dashboardMain) return;
    
    const projects = state.getAllProjekte();
    
    // Create selector HTML
    const selectorHTML = `
        <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 4px solid #2563eb;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                        🎯 Projekt-Ansicht
                    </h3>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">
                        Wähle ein Projekt für Details oder zeige das gesamte Portfolio
                    </p>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <select id="cockpit-projekt-selector" 
                            onchange="window.cockpitModule.onProjektSelect(this.value)"
                            style="padding: 10px 16px; border: 1px solid #e5e7eb; border-radius: 6px; 
                                   font-size: 14px; font-weight: 500; cursor: pointer; min-width: 250px;
                                   background: white;">
                        <option value="portfolio">📊 Portfolio-Übersicht</option>
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
                <div style="padding: 12px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #3b82f6;">
                    <div style="font-size: 12px; color: #1e40af; font-weight: 600;">
                        📌 Projekt-Detail: ${getProjectName(selectedProjektId)}
                    </div>
                    <div style="font-size: 11px; color: #3b82f6; margin-top: 4px;">
                        Details und Executive Summary für dieses Projekt
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Insert or update selector
    const existing = document.getElementById('cockpit-projekt-selector-container');
    if (existing) {
        existing.innerHTML = selectorHTML;
    } else {
        const container = document.createElement('div');
        container.id = 'cockpit-projekt-selector-container';
        container.innerHTML = selectorHTML;
        
        // Insert after metrics-grid
        const metricsGrid = document.querySelector('.metrics-grid');
        if (metricsGrid) {
            metricsGrid.parentNode.insertBefore(container, metricsGrid.nextSibling);
        } else {
            dashboardMain.insertBefore(container, dashboardMain.firstChild);
        }
    }
}

// ==========================================
// PORTFOLIO TABLE
// ==========================================

/**
 * Render Portfolio Overview Table
 */
function renderPortfolioTable() {
    const projects = state.getAllProjekte();
    
    const tableHTML = `
        <div id="cockpit-content-area" style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <div>
                    <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">
                        Portfolio-Übersicht
                    </h2>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">
                        Alle Projekte im Überblick - Klicke für Details
                    </p>
                </div>
            </div>
            
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Projekt</th>
                            <th>Division</th>
                            <th>Start</th>
                            <th>NPV</th>
                            <th>IRR</th>
                            <th>Revenue</th>
                            <th>Marge</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${projects.map(p => {
                            const calc = calculateProjektWirtschaftlichkeit(p.id);
                            const npv = calc?.kpis?.npv || 0;
                            const irr = calc?.kpis?.irr || 0;
                            const revenue = calc?.totals?.sales_revenue || 0;
                            const margin = calc?.kpis?.avg_ebit_margin || 0;
                            
                            return `
                                <tr style="cursor: pointer;" onclick="window.cockpitModule.onProjektSelect('${p.id}')">
                                    <td>
                                        <span class="status-badge status-${p.status?.toLowerCase().replace(' ', '-')}">
                                            ${getProjectIcon(p)} ${p.status}
                                        </span>
                                    </td>
                                    <td>
                                        <strong style="color: #111827;">${p.name}</strong>
                                    </td>
                                    <td style="color: #6b7280;">${p.division || 'R&D'}</td>
                                    <td style="color: #6b7280;">${p.startDate || '2025'}</td>
                                    <td>
                                        <strong style="color: ${npv > 0 ? '#10b981' : '#ef4444'};">
                                            ${(npv / 1000000).toFixed(1)} M€
                                        </strong>
                                    </td>
                                    <td>
                                        <strong style="color: ${irr > 15 ? '#10b981' : '#6b7280'};">
                                            ${irr.toFixed(1)}%
                                        </strong>
                                    </td>
                                    <td style="color: #6b7280;">
                                        ${(revenue / 1000000).toFixed(1)} M€
                                    </td>
                                    <td style="color: #6b7280;">
                                        ${margin.toFixed(1)}%
                                    </td>
                                    <td>
                                        <button onclick="event.stopPropagation(); window.cockpitModule.onProjektSelect('${p.id}')"
                                                class="btn btn-primary btn-sm">
                                            Details →
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Insert or update table
    const existing = document.getElementById('cockpit-content-area');
    if (existing) {
        existing.outerHTML = tableHTML;
    } else {
        const container = document.getElementById('cockpit-projekt-selector-container');
        if (container) {
            container.insertAdjacentHTML('afterend', tableHTML);
        }
    }
}

// ==========================================
// PROJECT DETAIL
// ==========================================

/**
 * Render Individual Project Detail
 */
function renderProjektDetail(projektId) {
    const projekt = state.getProjekt(projektId);
    if (!projekt) {
        console.error('Projekt not found:', projektId);
        return;
    }
    
    const calc = calculateProjektWirtschaftlichkeit(projektId);
    const artikel = state.getArtikelByProjekt(projektId);
    
    const detailHTML = `
        <div id="cockpit-content-area" style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="margin-bottom: 32px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <span style="font-size: 32px;">${getProjectIcon(projekt)}</span>
                    <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
                        ${projekt.name}
                    </h2>
                    <span class="status-badge status-${projekt.status?.toLowerCase().replace(' ', '-')}">
                        ${projekt.status}
                    </span>
                </div>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    ${projekt.division || 'R&D'} • Start: ${projekt.startDate || '2025'}
                </p>
            </div>
            
            <!-- KPIs Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px;">
                <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #10b981;">
                    <div style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                        NPV
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${calc?.kpis?.npv > 0 ? '#10b981' : '#ef4444'};">
                        ${((calc?.kpis?.npv || 0) / 1000000).toFixed(1)} M€
                    </div>
                </div>
                
                <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #3b82f6;">
                    <div style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                        IRR
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">
                        ${(calc?.kpis?.irr || 0).toFixed(1)}%
                    </div>
                </div>
                
                <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #f59e0b;">
                    <div style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                        Total Revenue
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">
                        ${((calc?.totals?.sales_revenue || 0) / 1000000).toFixed(1)} M€
                    </div>
                </div>
                
                <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #8b5cf6;">
                    <div style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                        Ø EBIT-Marge
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">
                        ${(calc?.kpis?.avg_ebit_margin || 0).toFixed(1)}%
                    </div>
                </div>
            </div>
            
            <!-- Artikel Section -->
            <div style="margin-bottom: 32px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px;">
                    Artikel in diesem Projekt (${artikel?.length || 0})
                </h3>
                
                ${artikel && artikel.length > 0 ? `
                    <div style="display: grid; gap: 12px;">
                        ${artikel.map(art => `
                            <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #2563eb;">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div>
                                        <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">
                                            ${art.name || 'Artikel'}
                                        </div>
                                        <div style="font-size: 13px; color: #6b7280;">
                                            HK: ${art.hk || 0}€ • VK: ${art.vk || 0}€
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 13px; color: #6b7280;">Status</div>
                                        <div style="font-weight: 600; color: #10b981;">Aktiv</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="padding: 32px; text-align: center; color: #6b7280; background: #f9fafb; border-radius: 8px;">
                        Keine Artikel zugeordnet
                    </div>
                `}
            </div>
            
            <!-- Actions -->
            <div style="display: flex; gap: 12px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <button onclick="window.projekte.openProjektDetail('${projektId}')" class="btn btn-primary">
                    Vollständige Details öffnen →
                </button>
                <button onclick="window.cockpitModule.resetToPortfolio()" class="btn btn-secondary">
                    ← Zurück zu Portfolio
                </button>
            </div>
        </div>
    `;
    
    // Insert or update detail
    const existing = document.getElementById('cockpit-content-area');
    if (existing) {
        existing.outerHTML = detailHTML;
    } else {
        const container = document.getElementById('cockpit-projekt-selector-container');
        if (container) {
            container.insertAdjacentHTML('afterend', detailHTML);
        }
    }
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
        renderProjektDetail(value);
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
    renderPortfolioTable();
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
