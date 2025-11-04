/**
 * ALBO Solutions - Chart Factory (Horváth Edition) - COMPLETE VERSION
 * Professional Chart.js implementations with Horváth design system
 * 
 * Chart Types:
 * - TRUE Waterfall Charts (floating bars)
 * - Margin Bridge (DB1 → DB3)
 * - Sensitivity Tornado (horizontal)
 * - Doughnut Charts
 * - Line Charts
 * - Combo Charts
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
// HELPER FUNCTIONS
// ==========================================

function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value) + 'M';
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
// WATERFALL CHART (TRUE FLOATING BARS)
// ==========================================

export function createRevenueWaterfall(canvasId, data) {
    console.log('📊 Creating TRUE Revenue Waterfall');
    console.log('📊 Input data:', data);
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart('revenueWaterfall');
    
    const labels = data.labels || [];
    const values = data.values || [];
    
    // Calculate waterfall structure
    const waterfallData = [];
    const colors = [];
    let cumulative = 0;
    
    values.forEach((value, index) => {
        if (index === 0) {
            // First bar starts at 0
            waterfallData.push([0, value]);
            colors.push(HORVATH_COLORS.navy);
            cumulative = value;
        } else {
            // Growth bars start at previous cumulative
            const delta = value - values[index - 1];
            waterfallData.push([cumulative, value]);
            colors.push(delta >= 0 ? HORVATH_COLORS.success : HORVATH_COLORS.danger);
            cumulative = value;
        }
    });
    
    console.log('📊 Waterfall structure:', waterfallData);
    
    const ctx = canvas.getContext('2d');
    chartInstances.revenueWaterfall = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: waterfallData,
                backgroundColor: colors,
                borderWidth: 0,
                borderRadius: 4,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = context.parsed.y;
                            const index = context.dataIndex;
                            
                            if (index === 0) {
                                return 'Start: ' + formatCurrency(data);
                            } else {
                                const prevValue = values[index - 1];
                                const delta = values[index] - prevValue;
                                const sign = delta >= 0 ? '+' : '';
                                return [
                                    'Revenue: ' + formatCurrency(values[index]),
                                    'Wachstum: ' + sign + formatCurrency(delta)
                                ];
                            }
                        }
                    }
                }
            },
            scales: {
                x: getStandardXScale(),
                y: getStandardYScale()
            }
        }
    });
    
    console.log('✅ TRUE Waterfall Chart created');
    return chartInstances.revenueWaterfall;
}

// ==========================================
// MARGIN BRIDGE (DB1 → DB3 WATERFALL)
// ==========================================

export function createMarginBridge(canvasId, data) {
    console.log('📊 Creating Margin Bridge');
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart('marginBridge');
    
    const labels = data.labels || [];
    const values = data.values || [];
    
    // Build waterfall from DB1 to DB3
    const waterfallData = [];
    const colors = [];
    let cumulative = 0;
    
    values.forEach((value, index) => {
        if (index === 0) {
            // DB1 starts at 0
            waterfallData.push([0, value]);
            colors.push(HORVATH_COLORS.success);
            cumulative = value;
        } else if (index === values.length - 1) {
            // DB3 is final
            waterfallData.push([0, value]);
            colors.push(HORVATH_COLORS.navy);
        } else {
            // Costs reduce margin
            const newCumulative = cumulative + value;
            waterfallData.push([cumulative, newCumulative]);
            colors.push(value < 0 ? HORVATH_COLORS.danger : HORVATH_COLORS.success);
            cumulative = newCumulative;
        }
    });
    
    const ctx = canvas.getContext('2d');
    chartInstances.marginBridge = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Margin Bridge',
                data: waterfallData,
                backgroundColor: colors,
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = Math.abs(values[context.dataIndex]);
                            const label = context.label;
                            return label + ': ' + formatCurrency(value);
                        }
                    }
                }
            },
            scales: {
                x: getStandardXScale(),
                y: getStandardYScale()
            }
        }
    });
    
    console.log('✅ Margin Bridge created');
    return chartInstances.marginBridge;
}

// ==========================================
// COST WATERFALL
// ==========================================

export function createCostWaterfall(canvasId, data) {
    console.log('📊 Creating Cost Waterfall');
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas ${canvasId} not found`);
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
                backgroundColor: HORVATH_COLORS.danger,
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Kosten: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: getStandardXScale(),
                y: getStandardYScale()
            }
        }
    });
    
    console.log('✅ Cost Waterfall created');
    return chartInstances.costWaterfall;
}

// ==========================================
// PIE CHART
// ==========================================

export function createPieChart(canvasId, data) {
    console.log('📊 Creating Pie Chart');
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart(`pie-${canvasId}`);
    
    const ctx = canvas.getContext('2d');
    chartInstances[`pie-${canvasId}`] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data || data.values,
                backgroundColor: data.backgroundColor || [
                    HORVATH_COLORS.navy,
                    HORVATH_COLORS.blue,
                    HORVATH_COLORS.success,
                    HORVATH_COLORS.neutral
                ],
                borderWidth: 2,
                borderColor: '#fff'
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
                            return label + ': ' + formatCurrency(value) + ' (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });
    
    console.log('✅ Pie Chart created');
    return chartInstances[`pie-${canvasId}`];
}

// ==========================================
// DOUGHNUT CHART
// ==========================================

export function createDoughnut(canvasId, data) {
    console.log('📊 Creating Doughnut Chart');
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart(`doughnut-${canvasId}`);
    
    const ctx = canvas.getContext('2d');
    chartInstances[`doughnut-${canvasId}`] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data || data.values,
                backgroundColor: data.backgroundColor || data.colors || [
                    HORVATH_COLORS.navy,
                    HORVATH_COLORS.blue,
                    HORVATH_COLORS.success,
                    HORVATH_COLORS.neutral
                ],
                borderWidth: 2,
                borderColor: '#fff'
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
                            return label + ': ' + formatCurrency(value) + ' (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });
    
    console.log('✅ Doughnut Chart created');
    return chartInstances[`doughnut-${canvasId}`];
}

// ==========================================
// TORNADO CHART (SENSITIVITY)
// ==========================================

export function createTornadoChart(canvasId, data) {
    console.log('📊 Creating Tornado Chart');
    console.log('📊 Tornado data:', data);
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart(`tornado-${canvasId}`);
    
    const ctx = canvas.getContext('2d');
    chartInstances[`tornado-${canvasId}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Negative Impact',
                    data: data.negativeImpact ? data.negativeImpact.map(v => -Math.abs(v)) : [],
                    backgroundColor: HORVATH_COLORS.danger,
                    borderWidth: 0,
                    borderRadius: 4
                },
                {
                    label: 'Positive Impact',
                    data: data.positiveImpact || [],
                    backgroundColor: HORVATH_COLORS.success,
                    borderWidth: 0,
                    borderRadius: 4
                }
            ]
        },
        options: {
            indexAxis: 'y', // HORIZONTAL!
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 10, weight: 500 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = Math.abs(context.parsed.x);
                            return context.dataset.label + ': ±' + formatCurrency(value);
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
        }
    });
    
    console.log('✅ Tornado Chart created');
    return chartInstances[`tornado-${canvasId}`];
}

// ==========================================
// LINE CHART (TREND)
// ==========================================

export function createTrendLine(canvasId, data) {
    console.log('📊 Creating Trend Line');
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart(`trend-${canvasId}`);
    
    const datasets = (data.datasets || []).map(ds => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.color || HORVATH_COLORS.blue,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: ds.color || HORVATH_COLORS.blue,
        tension: 0.3
    }));
    
    const ctx = canvas.getContext('2d');
    chartInstances[`trend-${canvasId}`] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: datasets.length > 1,
                    position: 'bottom'
                }
            },
            scales: {
                x: getStandardXScale(),
                y: getStandardYScale()
            }
        }
    });
    
    console.log('✅ Trend Line created');
    return chartInstances[`trend-${canvasId}`];
}

// ==========================================
// SPARKLINES (MINI)
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
    
    // Support both array and object with labels/values
    const values = Array.isArray(data) ? data : (data.values || data.data || []);
    const labels = Array.isArray(data) ? values.map((v, i) => String(i)) : (data.labels || []);
    
    // Create sparkline
    chartInstances[chartId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: values,
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
// STACKED BAR
// ==========================================

export function createStackedBar(canvasId, data) {
    console.log('📊 Creating Stacked Bar');
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas ${canvasId} not found`);
        return null;
    }
    
    destroyChart(`stacked-${canvasId}`);
    
    const ctx = canvas.getContext('2d');
    chartInstances[`stacked-${canvasId}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: data.datasets.map(ds => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: ds.color || HORVATH_COLORS.blue,
                borderWidth: 0,
                borderRadius: 4
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    ...getStandardXScale(),
                    stacked: true
                },
                y: {
                    ...getStandardYScale(),
                    stacked: true
                }
            }
        }
    });
    
    console.log('✅ Stacked Bar created');
    return chartInstances[`stacked-${canvasId}`];
}

// ==========================================
// CHART MANAGEMENT
// ==========================================

export function updateChart(chartName, newData) {
    const chart = chartInstances[chartName];
    if (!chart) {
        console.warn(`Chart ${chartName} not found`);
        return false;
    }
    
    if (newData.labels) {
        chart.data.labels = newData.labels;
    }
    
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
    
    chart.update('none');
    return true;
}

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
    console.log('🧹 All charts destroyed');
}

export function getChart(chartName) {
    return chartInstances[chartName] || null;
}

export function resizeAllCharts() {
    Object.values(chartInstances).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

// ==========================================
// EXPORT
// ==========================================

export default {
    initializeChartDefaults,
    createRevenueWaterfall,
    createMarginBridge,
    createCostWaterfall,
    createPieChart,
    createDoughnut,
    createTornadoChart,
    createTrendLine,
    createSparkline,
    createStackedBar,
    updateChart,
    destroyChart,
    destroyAllCharts,
    getChart,
    resizeAllCharts,
    HORVATH_COLORS
};
