/**
 * CFO Dashboard - Cockpit Module
 * Portfolio Analytics by Division
 * Version 3.0 - Compact & Professional
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';

/**
 * Render complete portfolio cockpit
 */
export function renderPortfolioCockpit() {
    console.log('📊 Rendering Portfolio Cockpit...');
    
    const container = document.querySelector('#tab-cockpit');
    if (!container) {
        console.error('Cockpit container not found');
        return;
    }
    
    // Get all projects
    const projekte = state.getAllProjekte();
    
    if (projekte.length === 0) {
        container.innerHTML = renderEmptyState();
        return;
    }
    
    // Calculate KPIs
    const kpis = calculatePortfolioKPIs(projekte);
    
    // Group by division
    const divisions = groupByDivision(projekte);
    
    // Render HTML
    container.innerHTML = `
        <div class="portfolio-cockpit">
            ${renderCockpitHeader(kpis)}
            ${renderDivisionTable(divisions, kpis)}
        </div>
    `;
    
    console.log('✅ Cockpit rendered', kpis);
}

/**
 * Calculate portfolio-wide KPIs
 */
function calculatePortfolioKPIs(projekte) {
    let totalProjects = projekte.length;
    let totalRevenue = 0;
    let totalCosts = 0;
    let totalDB2 = 0;
    
    projekte.forEach(projekt => {
        const artikel = state.getArtikelByProjekt(projekt.id);
        
        // Calculate artikel revenue & costs
        artikel.forEach(art => {
            Object.keys(art.volumes || {}).forEach(year => {
                const volume = art.volumes[year] || 0;
                const price = art.prices[year] || 0;
                const hk = art.hk || 0;
                
                const revenue = (volume * price) / 1000; // k€
                const costs = (volume * hk) / 1000;
                
                totalRevenue += revenue;
                totalCosts += costs;
            });
        });
    });
    
    totalDB2 = totalRevenue - totalCosts;
    
    // Calculate DB2 percentage
    const db2Percent = totalRevenue > 0 ? (totalDB2 / totalRevenue) * 100 : 0;
    
    return {
        projects: totalProjects,
        revenue: totalRevenue,
        costs: totalCosts,
        db2: totalDB2,
        db2Percent: db2Percent
    };
}

/**
 * Group projects by division
 */
function groupByDivision(projekte) {
    const divisions = {};
    
    projekte.forEach(projekt => {
        const division = projekt.division || 'Sonstige';
        
        if (!divisions[division]) {
            divisions[division] = {
                name: division,
                projects: [],
                revenue: 0,
                costs: 0,
                db2: 0
            };
        }
        
        // Calculate projekt metrics
        const artikel = state.getArtikelByProjekt(projekt.id);
        let projektRevenue = 0;
        let projektCosts = 0;
        
        artikel.forEach(art => {
            Object.keys(art.volumes || {}).forEach(year => {
                const volume = art.volumes[year] || 0;
                const price = art.prices[year] || 0;
                const hk = art.hk || 0;
                
                const revenue = (volume * price) / 1000;
                const costs = (volume * hk) / 1000;
                
                projektRevenue += revenue;
                projektCosts += costs;
            });
        });
        
        divisions[division].projects.push({
            ...projekt,
            revenue: projektRevenue,
            costs: projektCosts,
            db2: projektRevenue - projektCosts
        });
        
        divisions[division].revenue += projektRevenue;
        divisions[division].costs += projektCosts;
        divisions[division].db2 += (projektRevenue - projektCosts);
    });
    
    return divisions;
}

/**
 * Render cockpit header with KPIs
 */
function renderCockpitHeader(kpis) {
    return `
        <div class="cockpit-header">
            <div class="cockpit-title">
                <div class="cockpit-title-icon">📊</div>
                <h2>Portfolio Cockpit</h2>
            </div>
            
            <div class="cockpit-kpis">
                <div class="cockpit-kpi kpi-projects">
                    <div class="cockpit-kpi-value">${kpis.projects}</div>
                    <div class="cockpit-kpi-label">Projekte</div>
                </div>
                
                <div class="cockpit-kpi kpi-revenue">
                    <div class="cockpit-kpi-value">${helpers.formatRevenue(kpis.revenue)}</div>
                    <div class="cockpit-kpi-label">Umsatz (Plan)</div>
                </div>
                
                <div class="cockpit-kpi kpi-costs">
                    <div class="cockpit-kpi-value">${helpers.formatRevenue(kpis.costs)}</div>
                    <div class="cockpit-kpi-label">Projektkosten</div>
                </div>
                
                <div class="cockpit-kpi kpi-db2">
                    <div class="cockpit-kpi-value">${helpers.formatPercentage(kpis.db2Percent)}</div>
                    <div class="cockpit-kpi-label">Ø DB2</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render division table
 */
function renderDivisionTable(divisions, totals) {
    const divisionNames = Object.keys(divisions).sort();
    
    return `
        <div class="division-table-container">
            <table class="division-table">
                <thead>
                    <tr>
                        <th>DIVISION</th>
                        <th class="text-center">PROJEKTE</th>
                        <th class="text-right">UMSATZ</th>
                        <th class="text-right">DB2</th>
                        <th style="width: 40px;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${divisionNames.map(name => renderDivisionRow(divisions[name])).join('')}
                    ${renderTotalsRow(totals)}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Render single division row
 */
function renderDivisionRow(division) {
    const divisionClass = getDivisionClass(division.name);
    const aktiveProjekte = division.projects.filter(p => 
        (p.status || 'aktiv').toLowerCase() === 'aktiv'
    ).length;
    
    const db2Percent = division.revenue > 0 ? (division.db2 / division.revenue) * 100 : 0;
    const db2Class = division.db2 > 0 ? 'db2-positive' : 
                     division.db2 < 0 ? 'db2-negative' : 'db2-neutral';
    
    const rowId = `division-row-${divisionClass}`;
    
    return `
        <tr data-division="${divisionClass}">
            <td>
                <div class="division-name ${divisionClass}">
                    ${helpers.escapeHtml(division.name)}
                </div>
            </td>
            <td class="text-center">
                <div class="project-count">
                    <span class="project-count-total">${division.projects.length}</span>
                    <span class="project-count-active">${aktiveProjekte} aktiv</span>
                </div>
            </td>
            <td class="text-right">
                <div class="revenue-value">${helpers.formatRevenue(division.revenue)}</div>
            </td>
            <td class="text-right">
                <div class="db2-value ${db2Class}">${helpers.formatPercentage(db2Percent)}</div>
            </td>
            <td class="text-center">
                <button class="expand-button" onclick="toggleDivision('${divisionClass}')">
                    ▼
                </button>
            </td>
        </tr>
        <tr id="${rowId}" class="division-projects" style="display: none;">
            <td colspan="5">
                ${renderProjectsList(division.projects)}
            </td>
        </tr>
    `;
}

/**
 * Render projects list for expanded division
 */
function renderProjectsList(projects) {
    return `
        <div class="projects-list">
            ${projects.map(projekt => `
                <div class="project-item">
                    <div class="project-item-name">${helpers.escapeHtml(projekt.name)}</div>
                    <div class="project-item-meta">
                        <div class="project-item-revenue">${helpers.formatRevenue(projekt.revenue)}</div>
                        <div class="project-item-status status-${(projekt.status || 'aktiv').toLowerCase().replace(/\s/g, '-')}">
                            ${helpers.escapeHtml(projekt.status || 'aktiv')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Render totals row
 */
function renderTotalsRow(totals) {
    const db2Class = totals.db2 > 0 ? 'db2-positive' : 
                     totals.db2 < 0 ? 'db2-negative' : 'db2-neutral';
    
    return `
        <tr class="totals-row">
            <td>
                <div class="division-name">GESAMT</div>
            </td>
            <td class="text-center">
                <div class="project-count">
                    <span class="project-count-total">${totals.projects}</span>
                </div>
            </td>
            <td class="text-right">
                <div class="revenue-value">${helpers.formatRevenue(totals.revenue)}</div>
            </td>
            <td class="text-right">
                <div class="db2-value ${db2Class}">${helpers.formatPercentage(totals.db2Percent)}</div>
            </td>
            <td></td>
        </tr>
    `;
}

/**
 * Render empty state
 */
function renderEmptyState() {
    return `
        <div class="portfolio-cockpit">
            <div class="cockpit-header">
                <div class="cockpit-title">
                    <div class="cockpit-title-icon">📊</div>
                    <h2>Portfolio Cockpit</h2>
                </div>
            </div>
            <div class="cockpit-empty">
                <div class="cockpit-empty-icon">📊</div>
                <h3>Noch keine Projekte vorhanden</h3>
                <p>Erstelle dein erstes Projekt um das Portfolio-Cockpit zu nutzen</p>
            </div>
        </div>
    `;
}

/**
 * Get CSS class for division
 */
function getDivisionClass(divisionName) {
    const normalized = divisionName.toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]/g, '-');
    
    return `division-${normalized}`;
}

/**
 * Toggle division expansion
 */
window.toggleDivision = function(divisionClass) {
    const row = document.getElementById(`division-row-${divisionClass}`);
    const button = document.querySelector(`[data-division="${divisionClass}"] .expand-button`);
    
    if (!row || !button) return;
    
    const isVisible = row.style.display !== 'none';
    
    if (isVisible) {
        row.style.display = 'none';
        button.classList.remove('expanded');
    } else {
        row.style.display = 'table-row';
        button.classList.add('expanded');
    }
};

// Export
export default {
    renderPortfolioCockpit
};
