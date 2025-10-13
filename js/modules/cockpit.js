/**
 * ALBO Solutions - Portfolio Cockpit Module
 * KOMPAKTES DESIGN - Horváth Style
 * 
 * REDESIGN:
 * - Kompakte KPI-Bar (eine Zeile)
 * - Divisionen als Table
 * - Projekte als expandierbare Rows
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

export function renderCockpit() {
    console.log('📊 Rendering Compact Cockpit...');
    
    renderCompactHeader();
    renderDivisionTable();
    renderPortfolioSummary();
}

// ==========================================
// COMPACT HEADER WITH KPI BAR
// ==========================================

function renderCompactHeader() {
    const kpis = calculatePortfolioKPIs();
    
    const container = document.querySelector('.portfolio-kpis');
    if (!container) return;
    
    container.innerHTML = 
        '<div class="compact-cockpit-header">' +
            '<div class="compact-title">' +
                '<h1>📊 Portfolio Cockpit</h1>' +
            '</div>' +
            '<div class="compact-kpi-bar">' +
                '<div class="compact-kpi">' +
                    '<span class="compact-kpi-label">Projekte</span>' +
                    '<span class="compact-kpi-value">' + kpis.totalProjects + '</span>' +
                    '<span class="compact-kpi-sub">(' + kpis.activeProjects + ' aktiv)</span>' +
                '</div>' +
                '<div class="compact-kpi-divider"></div>' +
                '<div class="compact-kpi">' +
                    '<span class="compact-kpi-label">Umsatz</span>' +
                    '<span class="compact-kpi-value">' + helpers.formatCurrency(kpis.totalRevenue * 1000000) + '</span>' +
                '</div>' +
                '<div class="compact-kpi-divider"></div>' +
                '<div class="compact-kpi">' +
                    '<span class="compact-kpi-label">NPV</span>' +
                    '<span class="compact-kpi-value ' + (kpis.totalNPV > 0 ? 'positive' : 'negative') + '">' +
                        helpers.formatCurrency(kpis.totalNPV * 1000000) +
                    '</span>' +
                '</div>' +
                '<div class="compact-kpi-divider"></div>' +
                '<div class="compact-kpi">' +
                    '<span class="compact-kpi-label">Ø DB3</span>' +
                    '<span class="compact-kpi-value ' + (kpis.avgDB3 > 30 ? 'positive' : 'neutral') + '">' +
                        helpers.formatPercentage(kpis.avgDB3) +
                    '</span>' +
                '</div>' +
                '<div class="compact-kpi-divider"></div>' +
                '<div class="compact-kpi">' +
                    '<span class="compact-kpi-label">Payback</span>' +
                    '<span class="compact-kpi-value">' + kpis.avgPayback.toFixed(1) + 'J</span>' +
                '</div>' +
            '</div>' +
        '</div>';
}

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
        
        if (projekt.npv) totalNPV += projekt.npv;
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
        totalRevenue: totalRevenue / 1000000,
        totalNPV: totalNPV / 1000000,
        avgDB3: avgDB3Percent,
        avgPayback: avgPaybackYears
    };
}

// ==========================================
// DIVISION TABLE
// ==========================================

function renderDivisionTable() {
    const projectsByDivision = getProjectsByDivision();
    
    const container = document.querySelector('.bcg-matrix-container');
    if (!container) return;
    
    container.innerHTML = '';
    container.className = 'compact-division-container';
    
    let html = '<table class="division-table">' +
        '<thead>' +
            '<tr>' +
                '<th>Division</th>' +
                '<th>Projekte</th>' +
                '<th>Umsatz</th>' +
                '<th>DB3</th>' +
                '<th></th>' +
            '</tr>' +
        '</thead>' +
        '<tbody>';
    
    DIVISIONS.forEach(function(divisionName) {
        const projects = projectsByDivision[divisionName] || [];
        const kpis = calculateDivisionKPIs(projects);
        const icon = getDivisionIcon(divisionName);
        const color = getDivisionColor(divisionName);
        const divId = 'div-' + divisionName.replace(/\s+/g, '-');
        
        html += '<tr class="division-row" onclick="toggleDivisionRow(\'' + divisionName + '\')">' +
            '<td>' +
                '<span class="division-icon">' + icon + '</span>' +
                '<strong style="color: ' + color + ';">' + divisionName + '</strong>' +
            '</td>' +
            '<td>' +
                '<span class="badge">' + kpis.count + '</span>' +
                '<span class="badge-active">' + kpis.activeCount + ' aktiv</span>' +
            '</td>' +
            '<td><strong>' + helpers.formatCurrency(kpis.revenue * 1000000) + '</strong></td>' +
            '<td><span class="' + (kpis.db3Margin > 30 ? 'positive' : 'neutral') + '">' +
                helpers.formatPercentage(kpis.db3Margin) +
            '</span></td>' +
            '<td class="toggle-cell">' +
                '<span class="toggle-arrow">▼</span>' +
            '</td>' +
        '</tr>';
        
        html += '<tr class="project-rows" id="' + divId + '" style="display: none;">' +
            '<td colspan="5">';
        
        if (projects.length > 0) {
            html += '<table class="project-subtable">' +
                '<tr>' +
                    '<th>Projekt</th>' +
                    '<th>Owner</th>' +
                    '<th>Status</th>' +
                    '<th>Umsatz</th>' +
                    '<th>DB3</th>' +
                    '<th></th>' +
                '</tr>';
            
            projects.forEach(function(projekt) {
                const projektKPIs = calculateProjectKPIs(projekt);
                const statusClass = 'status-' + (projekt.status || 'unbekannt').toLowerCase().replace(/\s+/g, '-');
                
                html += '<tr class="project-subrow" onclick="openProjektDetail(\'' + projekt.id + '\')">' +
                    '<td>→ ' + helpers.escapeHtml(projekt.name) + '</td>' +
                    '<td>' + helpers.escapeHtml(projekt.owner || '-') + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' +
                        helpers.escapeHtml(projekt.status || 'Unbekannt') +
                    '</span></td>' +
                    '<td>' + helpers.formatCurrency(projektKPIs.revenue) + '</td>' +
                    '<td><span class="' + (projektKPIs.db3Margin > 30 ? 'positive' : 'neutral') + '">' +
                        helpers.formatPercentage(projektKPIs.db3Margin) +
                    '</span></td>' +
                    '<td>' +
                        '<button class="btn-icon" onclick="event.stopPropagation(); openProjektDetail(\'' + projekt.id + '\')" title="Öffnen">👁️</button>' +
                    '</td>' +
                '</tr>';
            });
            
            html += '</table>';
        } else {
            html += '<div class="no-projects-compact">Keine Projekte</div>';
        }
        
        html += '</td></tr>';
    });
    
    html += '</tbody></table>';
    
    container.innerHTML = html;
}

function getProjectsByDivision() {
    const projects = state.getAllProjekte();
    const grouped = {};
    
    DIVISIONS.forEach(function(div) {
        grouped[div] = [];
    });
    
    projects.forEach(function(projekt) {
        const division = projekt.division || 'Services';
        if (grouped[division]) {
            grouped[division].push(projekt);
        } else {
            grouped['Services'].push(projekt);
        }
    });
    
    return grouped;
}

function calculateDivisionKPIs(projects) {
    if (!projects || projects.length === 0) {
        return { count: 0, activeCount: 0, revenue: 0, db3Margin: 0 };
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
        db3Margin: db3Margin
    };
}

function calculateProjectKPIs(projekt) {
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
    
    return { revenue: revenue, db3Margin: db3Margin };
}

// ==========================================
// PORTFOLIO SUMMARY
// ==========================================

function renderPortfolioSummary() {
    const container = document.querySelector('.strategic-recommendations');
    if (!container) return;
    
    const projects = state.getAllProjekte();
    const activeProjects = projects.filter(function(p) { return p.status === 'Aktiv'; });
    const onHoldProjects = projects.filter(function(p) { return p.status === 'On Hold'; });
    
    container.innerHTML = 
        '<div class="portfolio-status-bar">' +
            '<div class="status-item positive">' +
                '<span class="status-icon">✅</span>' +
                '<span class="status-value">' + activeProjects.length + '</span>' +
                '<span class="status-label">Aktiv</span>' +
            '</div>' +
            (onHoldProjects.length > 0 ? 
                '<div class="status-item warning">' +
                    '<span class="status-icon">⚠️</span>' +
                    '<span class="status-value">' + onHoldProjects.length + '</span>' +
                    '<span class="status-label">On Hold</span>' +
                '</div>' : '') +
            '<div class="status-item info">' +
                '<span class="status-icon">📊</span>' +
                '<span class="status-value">' + DIVISIONS.length + '</span>' +
                '<span class="status-label">Divisionen</span>' +
            '</div>' +
        '</div>';
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

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

window.toggleDivisionRow = function(divisionName) {
    const id = 'div-' + divisionName.replace(/\s+/g, '-');
    const element = document.getElementById(id);
    
    if (!element) return;
    
    const isVisible = element.style.display !== 'none';
    element.style.display = isVisible ? 'none' : 'table-row';
    
    const row = element.previousElementSibling;
    const arrow = row.querySelector('.toggle-arrow');
    if (arrow) {
        arrow.textContent = isVisible ? '▼' : '▲';
    }
};

export default {
    renderCockpit
};
