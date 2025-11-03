/**
 * ALBO Solutions - Chart Factory (Horváth Edition)
 * Professional Chart.js implementations with Horváth design system
 * 
 * Chart Types:
 * - Waterfall Charts (Revenue, Costs)
 * - Margin Bridge (DB1 → DB2 → DB3)
 * - Sensitivity Tornado
 * - Sparklines (Executive Summary)
 * - Stacked Bars (Artikel Breakdown)
 */

const Chart = window.Chart;

// ==========================================
// CHART REGISTRY
// ==========================================

const chartInstances = {};

// ==========================================
// HORVÁTH COLOR SYSTEM
// ==========================================

const HORVATH_COLORS = {
    // Primary
    navy: '#003366',
    blue: '#0066CC',
    
    // Status
    success: '#00A651',
    warning: '#FF6600',
    danger: '#DC0032',
    neutral: '#8C9BA5',
    
    // Chart Specific
    hardware: '#003366',
    software: '#0066CC',
    services: '#00A651',
    
    // Backgrounds
    lightBlue: 'rgba(0, 102, 204, 0.1)',
    lightGreen: 'rgba(0, 166, 81, 0.1)',
    lightRed: 'rgba(220, 0, 50, 0.1)',
    
    // Grid
    gridLight: '#E2E8F0',
    gridMedium: '#CBD5E0'
};

// ==========================================
// CHART.JS DEFAULTS
// ==========================================

export function initializeChartDefaults() {
    if (!Chart) {
        console.error('❌ Chart.js not loaded');
        return false;
    }
    
    // Global defaults
    Chart.defaults.font.family = "'Roboto', -apple-system, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = '#4A5568';
    
    // Plugin defaults
    Chart.defaults.plugins.legend.display = true;
    Chart.defaults.plugins.legend.position = 'bottom';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 15;
    Chart.defaults.plugins.legend.labels.font = { size: 10, weight: 500 };
    
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 51, 102, 0.95)';
    Chart.defaults.plugins.tooltip.titleFont = { size: 11, weight: 600 };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 10 };
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 6;
    
    console.log('✅ Horváth Chart defaults initialized');
    return true;
}

// ==========================================
// STANDARD OPTIONS
// ==========================================

function getStandardOptions(customOptions = {}) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        layout: { 
            padding: { top: 10, bottom: 10, left: 10, right: 10 }
        },
        plugins: {
            legend: {
                display: customOptions.showLegend !== false,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 10, weight: 500 }
                }
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        
                        const value = context.parsed.y || context.parsed;
                        label += new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        }).format(value) + 'M';
                        
                        return label;
                    }
                }
            }
        },
        scales: customOptions.scales || {
            x: getStandardXScale(),
            y: getStandardYScale()
        },
        ...customOptions
    };
}

function getStandardXScale() {
    return {
        grid: { 
            display: false,
            drawBorder: false
        },
        ticks: { 
            font: { size: 10, weight: 500 },
            color: '#4A5568'
        }
    };
}

function getStandardYScale() {
    return {
        grid: { 
            color: HORVATH_COLORS.gridLight,
            drawBorder: false
        },
        ticks: { 
            font: { size: 10 },
            color: '#718096',
            callback: function(value) {
                return value.toFixed(1) + 'M';
            }
        }
    };
}

// ==========================================
// SPARKLINES (Executive Summary)
// ==========================================

export function createSparkline(elementId, data) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Sparkline element ${elementId} not found`);
        return null;
    }
    
    // Create mini canvas
    element.innerHTML = '<canvas style="width: 100%; height: 30px;"></canvas>';
    const canvas = element.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    // Destroy existing
    const chartId = `sparkline-${elementId}`;
    destroyChart(chartId);
    
    // Create sparkline
    chartInstances[chartId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                borderColor: HORVATH_COLORS.blue,
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 3,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
    
    return chartInstances[chartId];
}

// ==========================================
// WATERFALL CHART (Revenue)
// ==========================================

export function createRevenueWaterfall(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart('revenueWaterfall');
    
    // Prepare waterfall data
    const waterfallData = prepareWaterfallData(data);
    
    const ctx = canvas.getContext('2d');
    chartInstances.revenueWaterfall = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: waterfallData.labels,
            datasets: [{
                label: 'Revenue',
                data: waterfallData.values,
                backgroundColor: waterfallData.colors,
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: getStandardOptions({
            showLegend: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return 'Revenue: ' + new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 1
                            }).format(value) + 'M';
                        },
                        afterLabel: function(context) {
                            // Show delta for growth years
                            if (context.dataIndex > 0) {
                                const delta = waterfallData.deltas[context.dataIndex];
                                if (delta) {
                                    return 'Wachstum: +' + new Intl.NumberFormat('de-DE', {
                                        style: 'currency',
                                        currency: 'EUR',
                                        minimumFractionDigits: 1
                                    }).format(delta) + 'M';
                                }
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                x: getStandardXScale(),
                y: getStandardYScale()
            }
        })
    });
    
    return chartInstances.revenueWaterfall;
}

/**
 * Prepare waterfall data structure
 */
function prepareWaterfallData(data) {
    const labels = [];
    const values = [];
    const colors = [];
    const deltas = [];
    
    data.labels.forEach((label, idx) => {
        labels.push(label);
        values.push(data.values[idx]);
        
        // First year: Navy, others: Green (growth)
        colors.push(idx === 0 ? HORVATH_COLORS.navy : HORVATH_COLORS.success);
        
        // Calculate delta
        if (idx > 0) {
            deltas.push(data.values[idx] - data.values[idx - 1]);
        } else {
            deltas.push(null);
        }
    });
    
    return { labels, values, colors, deltas };
}

// ==========================================
// MARGIN BRIDGE (DB1 → DB2 → DB3)
// ==========================================

export function createMarginBridge(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart('marginBridge');
    
    const ctx = canvas.getContext('2d');
    chartInstances.marginBridge = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Margin Bridge',
                data: data.values,
                backgroundColor: data.values.map(v => v >= 0 ? HORVATH_COLORS.success : HORVATH_COLORS.danger),
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: getStandardOptions({
            showLegend: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = Math.abs(context.parsed.y);
                            const prefix = context.parsed.y >= 0 ? '+' : '-';
                            return context.label + ': ' + prefix + new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 1
                            }).format(value) + 'M';
                        }
                    }
                }
            },
            scales: {
                x: getStandardXScale(),
                y: {
                    ...getStandardYScale(),
                    beginAtZero: false
                }
            }
        })
    });
    
    return chartInstances.marginBridge;
}

// ==========================================
// COST WATERFALL
// ==========================================

export function createCostWaterfall(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart('costWaterfall');
    
    const ctx = canvas.getContext('2d');
    chartInstances.costWaterfall = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Projektkosten',
                data: data.values,
                backgroundColor: HORVATH_COLORS.neutral,
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: getStandardOptions({
            showLegend: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return 'Kosten: ' + new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 1
                            }).format(value) + 'M';
                        }
                    }
                }
            },
            scales: {
                x: getStandardXScale(),
                y: getStandardYScale()
            }
        })
    });
    
    return chartInstances.costWaterfall;
}

// ==========================================
// SENSITIVITY TORNADO
// ==========================================

export function createSensitivityTornado(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart('sensitivityTornado');
    
    const ctx = canvas.getContext('2d');
    chartInstances.sensitivityTornado = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Negative Impact',
                    data: data.negativeImpact.map(v => -v),
                    backgroundColor: HORVATH_COLORS.danger,
                    borderWidth: 0,
                    borderRadius: 4
                },
                {
                    label: 'Positive Impact',
                    data: data.positiveImpact,
                    backgroundColor: HORVATH_COLORS.success,
                    borderWidth: 0,
                    borderRadius: 4
                }
            ]
        },
        options: getStandardOptions({
            indexAxis: 'y',  // Horizontal bars!
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = Math.abs(context.parsed.x);
                            return context.dataset.label + ': ±' + new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 1
                            }).format(value) + 'M';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { 
                        color: HORVATH_COLORS.gridLight,
                        drawBorder: false
                    },
                    ticks: {
                        font: { size: 10 },
                        callback: function(value) {
                            return Math.abs(value).toFixed(1) + 'M';
                        }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 10, weight: 500 }
                    }
                }
            }
        })
    });
    
    return chartInstances.sensitivityTornado;
}

// ==========================================
// STACKED BAR (Artikel Breakdown)
// ==========================================

export function createStackedBar(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart(`stacked-${canvasId}`);
    
    const ctx = canvas.getContext('2d');
    chartInstances[`stacked-${canvasId}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: data.datasets.map((ds, idx) => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: ds.color || HORVATH_COLORS.blue,
                borderWidth: 0,
                borderRadius: 4
            }))
        },
        options: getStandardOptions({
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                x: getStandardXScale(),
                y: {
                    ...getStandardYScale(),
                    stacked: true
                },
                x: {
                    ...getStandardXScale(),
                    stacked: true
                }
            }
        })
    });
    
    return chartInstances[`stacked-${canvasId}`];
}

// ==========================================
// LINE CHART (Trend)
// ==========================================

export function createTrendLine(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart(`trend-${canvasId}`);
    
    const ctx = canvas.getContext('2d');
    chartInstances[`trend-${canvasId}`] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: data.datasets.map(ds => ({
                label: ds.label,
                data: ds.data,
                borderColor: ds.color || HORVATH_COLORS.blue,
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: ds.color || HORVATH_COLORS.blue,
                tension: 0.3
            }))
        },
        options: getStandardOptions({
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                x: getStandardXScale(),
                y: getStandardYScale()
            }
        })
    });
    
    return chartInstances[`trend-${canvasId}`];
}

// ==========================================
// COMBO CHART (Bar + Line)
// ==========================================

export function createComboChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart(`combo-${canvasId}`);
    
    const ctx = canvas.getContext('2d');
    chartInstances[`combo-${canvasId}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    type: 'bar',
                    label: data.barLabel || 'Absolute',
                    data: data.barData,
                    backgroundColor: HORVATH_COLORS.navy,
                    borderWidth: 0,
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    type: 'line',
                    label: data.lineLabel || 'Percent',
                    data: data.lineData,
                    borderColor: HORVATH_COLORS.warning,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: HORVATH_COLORS.warning,
                    yAxisID: 'y1'
                }
            ]
        },
        options: getStandardOptions({
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                x: getStandardXScale(),
                y: {
                    ...getStandardYScale(),
                    type: 'linear',
                    position: 'left'
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: {
                        font: { size: 10 },
                        callback: function(value) {
                            return value.toFixed(0) + '%';
                        }
                    },
                    min: 0,
                    max: 100
                }
            }
        })
    });
    
    return chartInstances[`combo-${canvasId}`];
}

// ==========================================
// DOUGHNUT CHART (Breakdown)
// ==========================================

export function createDoughnut(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart(`doughnut-${canvasId}`);
    
    const ctx = canvas.getContext('2d');
    chartInstances[`doughnut-${canvasId}`] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: data.colors || [
                    HORVATH_COLORS.navy,
                    HORVATH_COLORS.blue,
                    HORVATH_COLORS.success,
                    HORVATH_COLORS.neutral
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 10 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return label + ': ' + new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 1
                            }).format(value) + 'M (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });
    
    return chartInstances[`doughnut-${canvasId}`];
}

// ==========================================
// CHART UPDATES
// ==========================================

export function updateChart(chartName, newData) {
    const chart = chartInstances[chartName];
    if (!chart) {
        console.warn(`Chart ${chartName} not found`);
        return false;
    }
    
    // Update labels
    if (newData.labels) {
        chart.data.labels = newData.labels;
    }
    
    // Update datasets
    if (newData.values) {
        chart.data.datasets[0].data = newData.values;
    }
    
    if (newData.datasets) {
        newData.datasets.forEach((ds, idx) => {
            if (chart.data.datasets[idx]) {
                chart.data.datasets[idx].data = ds.data;
            }
        });
    }
    
    // Update without animation
    chart.update('none');
    return true;
}

// ==========================================
// CHART CLEANUP
// ==========================================

export function destroyChart(chartName) {
    if (chartInstances[chartName]) {
        chartInstances[chartName].destroy();
        delete chartInstances[chartName];
    }
}

export function destroyAllCharts() {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
        }
    });
    
    Object.keys(chartInstances).forEach(key => delete chartInstances[key]);
    console.log('🧹 All Horváth charts destroyed');
}

export function getChart(chartName) {
    return chartInstances[chartName] || null;
}

// ==========================================
// CHART UTILITIES
// ==========================================

export function resizeAllCharts() {
    Object.values(chartInstances).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

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

export function areChartsInitialized() {
    return Object.keys(chartInstances).length > 0;
}

// ==========================================
// EXPORT ALL
// ==========================================

export default {
    // Initialization
    initializeChartDefaults,
    
    // Chart Creators
    createSparkline,
    createRevenueWaterfall,
    createMarginBridge,
    createCostWaterfall,
    createSensitivityTornado,
    createStackedBar,
    createTrendLine,
    createComboChart,
    createDoughnut,
    
    // Chart Management
    updateChart,
    destroyChart,
    destroyAllCharts,
    getChart,
    areChartsInitialized,
    
    // Utilities
    resizeAllCharts,
    downloadChartAsImage,
    
    // Colors
    HORVATH_COLORS
};