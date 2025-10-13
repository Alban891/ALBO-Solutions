/**
 * ALBO Solutions - Portfolio Cockpit Module
 * Horváth & Partners Style - Division-Based Portfolio Overview
 * 
 * NEW CONCEPT:
 * - 7 Divisions Overview
 * - Projects grouped by Division
 * - Portfolio KPIs
 * - NO BCG Matrix (too academic for CFO cockpit)
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';

// ==========================================
// CONFIGURATION
// ==========================================

const DIVISIONS = [
    'Automotive',
    'Industrial',
    'Healthcare',
    'Energy',
    'Consumer Goods',
    'Technology',
    'Services'
];

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

/**
 * Render Portfolio Cockpit - Horvath Style
 * @public
 */
export function renderCockpit() {
    console.log('📊 Rendering Horváth Portfolio Cockpit (Division View)...');
    
    // 1. Render Portfolio-Level KPIs
    renderPortfolioKPIs();
    
    // 2. Render Division Overview with Projects
    renderDivisionOverview();
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
            totalRevenue: 0,
            totalNPV: 0,
            avgDB3: 0,
            avgPayback: 0
        };
    }
    
    let totalRevenue = 0;
    let totalDB3 = 0;
    let totalNPV = 0;
    let totalPayback = 0;
    let projectsWithPayback = 0;
    
    projects.forEach(function(projekt) {
        const artikel = state.getArtikelByProjekt(projekt.id);
        
        let projektRevenue = 0;
        let projektDB3 = 0;
        
        artikel.forEach(function(art) {
            for (let year = 2025; year <= 2031; year++) {
                const volume = art.volumes && art.volumes[year] ? art.volumes[year] : 0;
                const price = art.prices && art.prices[year] ? art.prices[year] : 0;
                const hk = art.hk || 0;
                
                const revenue = volume * price;
                const costs = volume * hk;
                
                projektRevenue += revenue;
                projektDB3 += (revenue - costs);
            }
        });
        
        totalRevenue += projektRevenue;
        totalDB3 += projektDB3;
        
        // NPV & Payback (simplified - should come from projekt data)
        if (projekt.npv) {
            totalNPV += projekt.npv;
        }
        if (projekt.payback) {
            totalPayback += projekt.payback;
            projectsWithPayback++;
        }
    });
    
    const avgDB3Percent = totalRevenue > 0 ? (totalDB3 / totalRevenue * 100) : 0;
    const avgPaybackYears = projectsWithPayback > 0 ? (totalPayback / projectsWithPayback) : 0;
    
    return {
        totalProjects: projects.length,
        activeProjects: projects.filter(function(p) { return p.status === 'Aktiv'; }).length,
        totalRevenue: totalRevenue / 1000000, // M€
        totalNPV: totalNPV / 1000000, // M€
        avgDB3: avgDB3Percent,
        avgPayback: avgPaybackYears
    };
}

/**
 * Render Portfolio KPI Cards
 */
function renderPortfolioKPIs() {
    const kpis = calculatePortfolioKPIs();
    
    const container = document.querySelector('.portfolio-kpis');
    if (!container) return;
    
    container.innerHTML = 
        '<div class="cockpit-header">' +
            '<div class="cockpit-title">' +
                '<h1>📊 Portfolio Cockpit</h1>' +
                '<p>Divisionen-Übersicht & Projekt-Portfolio</p>' +
            '</div>' +
        '</div>' +
        
        '<div class="kpi-grid">' +
            '<div class="kpi-card">' +
                '<div class="kpi-label">Projekte</div>' +
                '<div class="kpi-value">' + kpis.totalProjects + '</div>' +
                '<div class="kpi-sub positive">' + kpis.activeProjects + ' aktiv</div>' +
            '</div>' +

            '<div class="kpi-card">' +
                '<div class="kpi-label">Gesamt-Umsatz</div>' +
                '<div class="kpi-value">' + helpers.formatCurrency(kpis.totalRevenue * 1000000) + '</div>' +
                '<div class="kpi-sub">Portfolio 2025-2031</div>' +
            '</div>' +

            '<div class="kpi-card">' +
                '<div class="kpi-label">NPV (9 Jahre)</div>' +
                '<div class="kpi-value ' + (kpis.totalNPV > 0 ? 'positive' : 'negative') + '">' +
                    helpers.formatCurrency(kpis.totalNPV * 1000000) +
                '</div>' +
                '<div class="kpi-sub">Barwert gesamt</div>' +
            '</div>' +

            '<div class="kpi-card">' +
                '<div class="kpi-label">Ø DB3-Marge</div>' +
                '<div class="kpi-value ' + (kpis.avgDB3 > 30 ? 'positive' : 'neutral') + '">' +
                    helpers.formatPercentage(kpis.avgDB3) +
                '</div>' +
                '<div class="kpi-sub ' + (kpis.avgDB3 > 30 ? 'positive' : '') + '">' +
                    (kpis.avgDB3 > 30 ? 'Exzellent' : 'Solide') +
                '</div>' +
            '</div>' +

            '<div class="kpi-card">' +
                '<div class="kpi-label">Ø Payback</div>' +
                '<div class="kpi-value ' + (kpis.avgPayback < 3 ? 'positive' : 'neutral') + '">' +
                    kpis.avgPayback.toFixed(1) + 'J' +
                '</div>' +
                '<div class="kpi-sub">Jahre bis Break-Even</div>' +
            '</div>' +

            '<div class="kpi-card">' +
                '<div class="kpi-label">Divisionen</div>' +
                '<div class="kpi-value">' + DIVISIONS.length + '</div>' +
                '<div class="kpi-sub">Geschäftsbereiche</div>' +
            '</div>' +
        '</div>';
}

// ==========================================
// DIVISION OVERVIEW
// ==========================================

/**
 * Get projects grouped by division
 */
function getProjectsByDivision() {
    const projects = state.getAllProjekte();
    const grouped = {};
    
    // Initialize all divisions
    DIVISIONS.forEach(function(div) {
        grouped[div] = [];
    });
    
    // Group projects by division
    projects.forEach(function(projekt) {
        const division = projekt.division || 'Services'; // Default fallback
        if (grouped[division]) {
            grouped[division].push(projekt);
        } else {
            // If division not in predefined list, add to Services
            grouped['Services'].push(projekt);
        }
    });
    
    return grouped;
}

/**
 * Calculate division-level KPIs
 */
function calculateDivisionKPIs(projects) {
    if (!projects || projects.length === 0) {
        return {
            count: 0,
            revenue: 0,
            db3Margin: 0,
            status: 'empty'
        };
    }
    
    let totalRevenue = 0;
    let totalDB3 = 0;
    let activeCount = 0;
    
    projects.forEach(function(projekt) {
        if (projekt.status === 'Aktiv') activeCount++;
        
        const artikel = state.getArtikelByProjekt(projekt.id);
        
        artikel.forEach(function(art) {
            for (let year = 2025; year <= 2031; year++) {
                const volume = art.volumes && art.volumes[year] ? art.volumes[year] : 0;
                const price = art.prices && art.prices[year] ? art.prices[year] : 0;
                const hk = art.hk || 0;
                
                const revenue = volume * price;
                const costs = volume * hk;
                
                totalRevenue += revenue;
                totalDB3 += (revenue - costs);
            }
        });
    });
    
    const db3Margin = totalRevenue > 0 ? (totalDB3 / totalRevenue * 100) : 0;
    
    return {
        count: projects.length,
        activeCount: activeCount,
        revenue: totalRevenue / 1000000,
        db3Margin: db3Margin,
        status: activeCount > 0 ? 'active' : 'inactive'
    };
}

/**
 * Render Division Overview with Projects
 */
function renderDivisionOverview() {
    const projectsByDivision = getProjectsByDivision();
    
    const container = document.querySelector('.bcg-matrix-container');
    if (!container) return;
    
    // Clear BCG matrix (not needed anymore)
    container.innerHTML = '';
    container.className = 'division-overview-container';
    
    let html = '<div class="division-overview">' +
        '<div class="division-header">' +
            '<h2>Divisionen & Projekte</h2>' +
            '<p>Portfolio nach Geschäftsbereichen</p>' +
        '</div>';
    
    DIVISIONS.forEach(function(divisionName) {
        const projects = projectsByDivision[divisionName] || [];
        const kpis = calculateDivisionKPIs(projects);
        
        const icon = getDivisionIcon(divisionName);
        const color = getDivisionColor(divisionName);
        const divId = 'division-' + divisionName.replace(/\s+/g, '-');
        
        html += '<div class="division-card" style="border-left: 4px solid ' + color + ';">' +
            '<div class="division-card-header" onclick="toggleDivision(\'' + divisionName + '\')">' +
                '<div class="division-info">' +
                    '<div class="division-name">' +
                        '<span class="division-icon">' + icon + '</span>' +
                        '<h3>' + divisionName + '</h3>' +
                    '</div>' +
                    '<div class="division-meta">' +
                        '<span class="division-count">' + kpis.count + ' Projekt' + (kpis.count !== 1 ? 'e' : '') + '</span>' +
                        '<span class="division-badge ' + kpis.status + '">' +
                            kpis.activeCount + ' aktiv' +
                        '</span>' +
                    '</div>' +
                '</div>' +
                
                '<div class="division-kpis">' +
                    '<div class="division-kpi">' +
                        '<div class="division-kpi-label">Umsatz</div>' +
                        '<div class="division-kpi-value">' + helpers.formatCurrency(kpis.revenue * 1000000) + '</div>' +
                    '</div>' +
                    '<div class="division-kpi">' +
                        '<div class="division-kpi-label">DB3-Marge</div>' +
                        '<div class="division-kpi-value ' + (kpis.db3Margin > 30 ? 'positive' : 'neutral') + '">' +
                            helpers.formatPercentage(kpis.db3Margin) +
                        '</div>' +
                    '</div>' +
                '</div>' +
                
                '<div class="division-toggle">' +
                    '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">' +
                        '<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>' +
                    '</svg>' +
                '</div>' +
            '</div>' +
            
            '<div class="division-projects" id="' + divId + '" style="display: none;">';
        
        if (projects.length > 0) {
            html += renderProjectTable(projects);
        } else {
            html += '<div class="no-projects">' +
                '<span class="no-projects-icon">📭</span>' +
                '<p>Keine Projekte in dieser Division</p>' +
            '</div>';
        }
        
        html += '</div>' + '</div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add strategic recommendations below
    renderStrategicSummary();
}

/**
 * Render project table for a division
 */
function renderProjectTable(projects) {
    let html = '<table class="division-project-table">' +
        '<thead>' +
            '<tr>' +
                '<th>Projekt</th>' +
                '<th>Owner</th>' +
                '<th>Start</th>' +
                '<th>Status</th>' +
                '<th>Umsatz</th>' +
                '<th>DB3</th>' +
                '<th>Aktionen</th>' +
            '</tr>' +
        '</thead>' +
        '<tbody>';
    
    projects.forEach(function(projekt) {
        const artikel = state.getArtikelByProjekt(projekt.id);
        
        let revenue = 0;
        let db3 = 0;
        
        artikel.forEach(function(art) {
            for (let year = 2025; year <= 2031; year++) {
                const volume = art.volumes && art.volumes[year] ? art.volumes[year] : 0;
                const price = art.prices && art.prices[year] ? art.prices[year] : 0;
                const hk = art.hk || 0;
                
                const yearRevenue = volume * price;
                const yearCosts = volume * hk;
                
                revenue += yearRevenue;
                db3 += (yearRevenue - yearCosts);
            }
        });
        
        const db3Margin = revenue > 0 ? (db3 / revenue * 100) : 0;
        const statusClass = 'status-' + (projekt.status || 'unbekannt').toLowerCase().replace(/\s+/g, '-');
        
        html += '<tr class="division-project-row" onclick="openProjektDetail(\'' + projekt.id + '\')">' +
            '<td><strong>' + helpers.escapeHtml(projekt.name) + '</strong></td>' +
            '<td>' + helpers.escapeHtml(projekt.owner || '-') + '</td>' +
            '<td>' + helpers.formatDateSafe(projekt.startDate) + '</td>' +
            '<td><span class="status-badge ' + statusClass + '">' +
                helpers.escapeHtml(projekt.status || 'Unbekannt') +
            '</span></td>' +
            '<td>' + helpers.formatCurrency(revenue) + '</td>' +
            '<td><span class="' + (db3Margin > 30 ? 'positive' : 'neutral') + '">' +
                helpers.formatPercentage(db3Margin) +
            '</span></td>' +
            '<td>' +
                '<button class="btn-icon" onclick="event.stopPropagation(); openProjektDetail(\'' + projekt.id + '\')" title="Öffnen">👁️</button>' +
            '</td>' +
        '</tr>';
    });
    
    html += '</tbody></table>';
    
    return html;
}

/**
 * Render strategic summary at the bottom
 */
function renderStrategicSummary() {
    const container = document.querySelector('.strategic-recommendations');
    if (!container) return;
    
    const projects = state.getAllProjekte();
    const activeProjects = projects.filter(function(p) { return p.status === 'Aktiv'; });
    const onHoldProjects = projects.filter(function(p) { return p.status === 'On Hold'; });
    const completedProjects = projects.filter(function(p) { return p.status === 'Abgeschlossen'; });
    
    let html = '<div class="strategic-summary">' +
        '<h2>📊 Portfolio Status</h2>' +
        '<div class="summary-grid">' +
            '<div class="summary-card positive">' +
                '<div class="summary-icon">✅</div>' +
                '<div class="summary-content">' +
                    '<div class="summary-value">' + activeProjects.length + '</div>' +
                    '<div class="summary-label">Aktive Projekte</div>' +
                    '<div class="summary-desc">In Execution</div>' +
                '</div>' +
            '</div>';

    if (onHoldProjects.length > 0) {
        html += '<div class="summary-card warning">' +
            '<div class="summary-icon">⚠️</div>' +
            '<div class="summary-content">' +
                '<div class="summary-value">' + onHoldProjects.length + '</div>' +
                '<div class="summary-label">On Hold</div>' +
                '<div class="summary-desc">Entscheidung erforderlich</div>' +
            '</div>' +
        '</div>';
    }

    html += '<div class="summary-card neutral">' +
                '<div class="summary-icon">🏁</div>' +
                '<div class="summary-content">' +
                    '<div class="summary-value">' + completedProjects.length + '</div>' +
                    '<div class="summary-label">Abgeschlossen</div>' +
                    '<div class="summary-desc">Erfolgreich</div>' +
                '</div>' +
            '</div>' +

            '<div class="summary-card info">' +
                '<div class="summary-icon">📈</div>' +
                '<div class="summary-content">' +
                    '<div class="summary-value">' + DIVISIONS.length + '</div>' +
                    '<div class="summary-label">Divisionen</div>' +
                    '<div class="summary-desc">Geschäftsbereiche</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
    
    container.innerHTML = html;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get icon for division
 */
function getDivisionIcon(division) {
    const icons = {
        'Automotive': '🚗',
        'Industrial': '🏭',
        'Healthcare': '🏥',
        'Energy': '⚡',
        'Consumer Goods': '🛒',
        'Technology': '💻',
        'Services': '🔧'
    };
    return icons[division] || '📁';
}

/**
 * Get color for division
 */
function getDivisionColor(division) {
    const colors = {
        'Automotive': '#3b82f6',
        'Industrial': '#8b5cf6',
        'Healthcare': '#ec4899',
        'Energy': '#f59e0b',
        'Consumer Goods': '#10b981',
        'Technology': '#6366f1',
        'Services': '#14b8a6'
    };
    return colors[division] || '#64748b';
}

/**
 * Toggle division expansion
 */
window.toggleDivision = function(divisionName) {
    const id = 'division-' + divisionName.replace(/\s+/g, '-');
    const element = document.getElementById(id);
    
    if (!element) return;
    
    const isVisible = element.style.display !== 'none';
    element.style.display = isVisible ? 'none' : 'block';
    
    // Rotate arrow
    const card = element.closest('.division-card');
    const toggle = card.querySelector('.division-toggle');
    if (toggle) {
        toggle.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
    }
};

// ==========================================
// EXPORTS
// ==========================================

export default {
    renderCockpit
};
