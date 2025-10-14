/**
 * CFO Dashboard - Charts Module
 * Manages all Chart.js instances and data visualization
 */

import { state } from './state.js';
import * as helpers from './helpers.js';

// Store chart instances globally
window.dashboardCharts = window.dashboardCharts || {};

/**
 * Initialize charts module on application start
 */
export function initializeCharts() {
    console.log('📊 Initializing charts module...');
    
    // Initialize empty chart storage
    window.dashboardCharts = {};
    
    console.log('✅ Charts module ready');
    return true;
}

/**
 * Update all charts after data changes
 * Called when artikel/projekt is saved
 */
export function updateAllCharts() {
    console.log('📊 Updating all charts...');
    
    try {
        // Recalculate portfolio metrics
        const projekte = state.getAllProjekte();
        
        let totalNPV = 0;
        let totalRevenue = 0;
        let totalDB2 = 0;
        let projektCount = projekte.length;
        
        // Calculate totals from all projects
        projekte.forEach(projekt => {
            const artikel = state.getArtikelByProjekt(projekt.id);
            
            artikel.forEach(art => {
                // Calculate revenue for each year
                Object.keys(art.volumes || {}).forEach(year => {
                    const volume = art.volumes[year] || 0;
                    const price = art.prices[year] || 0;
                    const hk = art.hk || 0;
                    
                    const revenue = (volume * price) / 1000; // Convert to k€
                    const costs = (volume * hk) / 1000;
                    const db2 = revenue - costs;
                    
                    totalRevenue += revenue;
                    totalDB2 += db2;
                });
            });
        });
        
        // Calculate NPV (simplified - without discounting for now)
        totalNPV = totalDB2;
        
        // Calculate average margin
        const avgMargin = totalRevenue > 0 ? (totalDB2 / totalRevenue) * 100 : 0;
        
        // Calculate payback (simplified)
        const payback = totalRevenue > 0 ? (totalRevenue / (totalRevenue / 5)) : 0;
        
        // Update header stats
        updateHeaderStats({
            npv: totalNPV,
            payback: payback,
            revenue: totalRevenue,
            margin: avgMargin
        });
        
        // Update Chart.js instances if they exist
        if (window.dashboardCharts) {
            Object.values(window.dashboardCharts).forEach(chartInstance => {
                if (chartInstance && typeof chartInstance.update === 'function') {
                    try {
                        chartInstance.update();
                    } catch (e) {
                        console.warn('Failed to update chart:', e);
                    }
                }
            });
        }
        
        console.log('✅ Charts updated', {
            totalNPV: helpers.formatRevenue(totalNPV),
            totalRevenue: helpers.formatRevenue(totalRevenue),
            avgMargin: helpers.formatPercentage(avgMargin),
            projektCount: projektCount
        });
        
    } catch (error) {
        console.error('❌ Error updating charts:', error);
    }
}

/**
 * Update header statistics
 */
function updateHeaderStats(stats) {
    const npvEl = document.getElementById('npv-value');
    const paybackEl = document.getElementById('payback-value');
    const revenueEl = document.getElementById('revenue-value');
    const marginEl = document.getElementById('margin-value');
    
    if (npvEl) {
        npvEl.textContent = formatHeaderValue(stats.npv, 'M€');
    }
    
    if (paybackEl) {
        paybackEl.textContent = stats.payback.toFixed(1) + 'J';
    }
    
    if (revenueEl) {
        revenueEl.textContent = formatHeaderValue(stats.revenue, 'M€');
    }
    
    if (marginEl) {
        marginEl.textContent = Math.round(stats.margin) + '%';
    }
}

/**
 * Format value for header display
 */
function formatHeaderValue(value, unit) {
    if (value >= 1000) {
        return '+' + (value / 1000).toFixed(1) + unit;
    }
    return '+' + value.toFixed(1) + unit;
}

/**
 * Initialize a Chart.js chart
 */
export function initChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn('Canvas not found:', canvasId);
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.dashboardCharts[canvasId]) {
        window.dashboardCharts[canvasId].destroy();
    }
    
    // Create new chart
    const chart = new Chart(ctx, config);
    window.dashboardCharts[canvasId] = chart;
    
    return chart;
}

/**
 * Destroy all charts
 */
export function destroyAllCharts() {
    Object.values(window.dashboardCharts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    window.dashboardCharts = {};
}

// Export default
export default {
    updateAllCharts,
    initChart,
    destroyAllCharts
};
