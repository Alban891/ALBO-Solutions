/**
 * CFO Dashboard - Chart Factory
 * Centralized Chart.js management and configuration
 * All chart types, styles, and update logic in one place
 */

import { state } from '../../state.js';

const Chart = window.Chart;

// ==========================================
// CHART REGISTRY
// ==========================================

const chartInstances = {};

// ==========================================
// CHART.JS DEFAULTS
// ==========================================

/**
 * Initialize Chart.js global defaults
 */
export function initializeChartDefaults() {
    if (!Chart) {
        console.error('❌ Chart.js not loaded');
        return false;
    }
    
    // Global font settings
    Chart.defaults.font.size = 9;
    Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
    Chart.defaults.color = '#6b7280';
    
    // Global legend settings
    Chart.defaults.plugins.legend.display = false;
    
    // Global tooltip settings
    Chart.defaults.plugins.tooltip.titleFont = { size: 10 };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 10 };
    
    console.log('✅ Chart.js defaults initialized');
    return true;
}

// ==========================================
// STANDARD OPTIONS
// ==========================================

/**
 * Get standard chart options
 * Applies to all charts for consistency
 */
function getStandardOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 0 },
        plugins: {
            legend: { display: false },
            tooltip: { 
                enabled: true,
                titleFont: { size: 10 },
                bodyFont: { size: 10 }
            }
        },
        scales: {
            x: getStandardXScale(),
            y: getStandardYScale()
        }
    };
}

/**
 * Standard X-Axis configuration
 */
function getStandardXScale() {
    return {
        grid: { display: false },
        ticks: { 
            font: { size: 8 },
            autoSkip: true,
            maxTicksLimit: 10
        }
    };
}

/**
 * Standard Y-Axis configuration
 */
function getStandardYScale() {
    return {
        grid: { color: '#f3f4f6' },
        ticks: { 
            font: { size: 8 },
            callback: function(value) {
                return value.toFixed(1);
            }
        }
    };
}

// ==========================================
// CHART CREATORS
// ==========================================

/**
 * Create Umsatz (Revenue) Bar Chart
 */
export function createUmsatzChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }
    
    // Destroy existing chart
    destroyChart('umsatz');
    
    const ctx = canvas.getContext('2d');
    chartInstances.umsatz = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: data.color || '#9ca3af',
                borderRadius: 4
            }]
        },
        options: getStandardOptions()
    });
    
    return chartInstances.umsatz;
}

/**
 * Create Absatz (Volume) Bar Chart
 */
export function createAbsatzChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    destroyChart('absatz');
    
    const ctx = canvas.getContext('2d');
    chartInstances.absatz = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: data.color || '#9ca3af',
                borderRadius: 4
            }]
        },
        options: getStandardOptions()
    });
    
    return chartInstances.absatz;
}

/**
 * Create DB2 Combo Chart (Bar + Line)
 * Dual-axis: absolute values (bar) + percentage (line)
 */
export function createDB2Chart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    destroyChart('db2');
    
    const ctx = canvas.getContext('2d');
    chartInstances.db2 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'DB2 (Mio. €)',
                    data: data.absolute,
                    backgroundColor: data.colors.bar || '#9ca3af',
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    type: 'line',
                    label: 'DB2 (%)',
                    data: data.percent,
                    borderColor: data.colors.line || '#374151',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: data.colors.line || '#374151',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...getStandardOptions(),
            scales: {
                x: getStandardXScale(),
                y: {
                    ...getStandardYScale(),
                    type: 'linear',
                    display: true,
                    position: 'left'
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: {
                        font: { size: 8 },
                        callback: function(value) {
                            return value.toFixed(0) + '%';
                        }
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
    
    return chartInstances.db2;
}

/**
 * Create Projektkosten Bar Chart
 */
export function createProjektkostenChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    destroyChart('projektkosten');
    
    console.log('📊 Creating Projektkosten chart');
    console.log('  Initial data source:', data.source || 'unknown');
    console.log('  Initial values:', data.values);
    
    // ALWAYS try to get from state first (most accurate)
    const projektId = window.cfoDashboard?.currentProjekt;
    if (projektId) {
        const stateData = getProjektkostenFromState(projektId, data.labels);
        if (stateData) {
            console.log('✅ Using STATE data (overriding calculator)');
            data = stateData;
        } else {
            console.warn('⚠️ State data unavailable, using provided data');
        }
    }
    
    const ctx = canvas.getContext('2d');
    chartInstances.projektkosten = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: data.color || '#9ca3af',
                borderRadius: 4
            }]
        },
        options: getStandardOptions()
    });
    
    return chartInstances.projektkosten;
}

/**
 * Helper: Get Projektkosten directly from State
 * Uses projekt.kostenWerte structure
 */
function getProjektkostenFromState(projektId, jahre) {
    try {
        // Get projekt from state
        const projekt = state.getProjekt(projektId);
        
        if (!projekt) {
            console.warn('No projekt found');
            return null;
        }
        
        // Initialize kostenWerte if it doesn't exist
        if (!projekt.kostenWerte) {
            console.log('⚠️ Initializing kostenWerte (was undefined)');
            projekt.kostenWerte = {};
            state.setProjekt(projektId, projekt);
        }
        
        const blockIds = Object.keys(projekt.kostenWerte);
        console.log(`✅ Found ${blockIds.length} cost blocks in projekt.kostenWerte`);
        
        if (blockIds.length === 0) {
            console.warn('⚠️ No cost blocks yet - returning zeros');
            // Return zeros for all years
            return {
                labels: jahre,
                values: jahre.map(() => 0),
                color: '#9ca3af',
                source: 'state-empty'
            };
        }
        
        // Calculate costs per year
        const values = jahre.map(jahr => {
            let yearTotal = 0;
            
            blockIds.forEach(blockId => {
                const value = parseFloat(projekt.kostenWerte[blockId]?.[jahr]) || 0;
                yearTotal += value;
            });
            
            console.log(`  ${jahr}: ${yearTotal.toLocaleString('de-DE')}€ = ${(yearTotal/1000000).toFixed(2)} Mio.`);
            return yearTotal / 1000000; // Convert to Mio
        });
        
        console.log('✅ Values from projekt.kostenWerte:', values.map(v => v.toFixed(2)));
        
        return {
            labels: jahre,
            values,
            color: '#9ca3af',
            source: 'state'
        };
    } catch (error) {
        console.error('❌ Failed to get Projektkosten from state:', error);
        return null;
    }
}

/**
 * Create DB3 Jahr Bar Chart
 * Supports negative values with red coloring
 */
export function createDB3JahrChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    destroyChart('db3Jahr');
    
    const ctx = canvas.getContext('2d');
    chartInstances.db3Jahr = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: function(context) {
                    const value = context.parsed.y;
                    return data.colorFunction ? data.colorFunction(value) : '#9ca3af';
                },
                borderRadius: 4
            }]
        },
        options: {
            ...getStandardOptions(),
            scales: {
                x: getStandardXScale(),
                y: {
                    ...getStandardYScale(),
                    beginAtZero: false
                }
            }
        }
    });
    
    return chartInstances.db3Jahr;
}

/**
 * Create DB3 Kumuliert Line Chart
 * Shows cumulative profitability over time
 */
export function createDB3KumuliertChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    destroyChart('db3Kumuliert');
    
    const ctx = canvas.getContext('2d');
    chartInstances.db3Kumuliert = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                borderColor: data.colors.line || '#374151',
                backgroundColor: data.colors.fill || 'rgba(55, 65, 81, 0.1)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: data.colors.line || '#374151',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            ...getStandardOptions(),
            scales: {
                x: getStandardXScale(),
                y: {
                    ...getStandardYScale(),
                    beginAtZero: false
                }
            }
        }
    });
    
    return chartInstances.db3Kumuliert;
}

// ==========================================
// CHART UPDATES
// ==========================================

/**
 * Update chart data without destroying
 * Performance optimized with 'none' animation mode
 */
export function updateChart(chartName, newData) {
    const chart = chartInstances[chartName];
    if (!chart) {
        console.warn(`Chart ${chartName} not found`);
        return false;
    }
    
    // Update labels if provided
    if (newData.labels) {
        chart.data.labels = newData.labels;
    }
    
    // Update datasets
    if (newData.values) {
        chart.data.datasets[0].data = newData.values;
    }
    
    // For dual-axis charts (DB2)
    if (newData.absolute && newData.percent) {
        chart.data.datasets[0].data = newData.absolute;
        chart.data.datasets[1].data = newData.percent;
    }
    
    // Update without animation for performance
    chart.update('none');
    
    return true;
}

/**
 * Update all dashboard charts
 */
export function updateAllCharts(processedData) {
    console.log('🔄 Updating all charts...');
    
    const updates = [
        { name: 'umsatz', data: processedData.umsatzData },
        { name: 'absatz', data: processedData.absatzData },
        { name: 'db2', data: processedData.db2Data },
        { name: 'projektkosten', data: processedData.projektkostenData },
        { name: 'db3Jahr', data: processedData.db3JahrData },
        { name: 'db3Kumuliert', data: processedData.db3KumuliertData }
    ];
    
    let successCount = 0;
    updates.forEach(update => {
        if (updateChart(update.name, update.data)) {
            successCount++;
        }
    });
    
    console.log(`✅ Updated ${successCount}/${updates.length} charts`);
}

// ==========================================
// CHART CLEANUP
// ==========================================

/**
 * Destroy specific chart instance
 */
export function destroyChart(chartName) {
    if (chartInstances[chartName]) {
        chartInstances[chartName].destroy();
        delete chartInstances[chartName];
    }
}

/**
 * Destroy all chart instances
 * Use before re-rendering dashboard
 */
export function destroyAllCharts() {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
        }
    });
    
    // Clear registry
    Object.keys(chartInstances).forEach(key => delete chartInstances[key]);
    
    console.log('🧹 All charts destroyed');
}

/**
 * Get chart instance by name
 */
export function getChart(chartName) {
    return chartInstances[chartName] || null;
}

/**
 * Check if all charts are initialized
 */
export function areChartsInitialized() {
    return Object.keys(chartInstances).length > 0;
}

// ==========================================
// CHART UTILITIES
// ==========================================

/**
 * Resize all charts (for responsive behavior)
 */
export function resizeAllCharts() {
    Object.values(chartInstances).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

/**
 * Download chart as image
 */
export function downloadChartAsImage(chartName, filename = 'chart.png') {
    const chart = chartInstances[chartName];
    if (!chart) {
        console.error(`Chart ${chartName} not found`);
        return false;
    }
    
    const url = chart.toBase64Image();
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    
    return true;
}

// ==========================================
// EXPORT
// ==========================================

export default {
    initializeChartDefaults,
    createUmsatzChart,
    createAbsatzChart,
    createDB2Chart,
    createProjektkostenChart,
    createDB3JahrChart,
    createDB3KumuliertChart,
    updateChart,
    updateAllCharts,
    destroyChart,
    destroyAllCharts,
    getChart,
    areChartsInitialized,
    resizeAllCharts,
    downloadChartAsImage
};
