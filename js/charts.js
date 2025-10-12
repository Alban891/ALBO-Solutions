/**
 * CFO Dashboard - Chart Management
 * Enterprise Chart.js wrapper with performance optimization
 * Provides API for cockpit.js to render portfolio/project charts
 */

import CONFIG from './config.js';
import { state } from './state.js';

// ==========================================
// CHART INSTANCES REGISTRY
// ==========================================

const chartRegistry = {
  umsatzChart: null,
  absatzChart: null,
  db2Chart: null,
  projektkostenChart: null,
  db3JahrChart: null,
  db3KumuliertChart: null
};

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize all dashboard charts
 * @returns {Promise<boolean>} Success status
 */
export async function initializeCharts() {
  try {
    console.log('🎨 Initializing charts...');

    // Wait for Chart.js library
    if (typeof Chart === 'undefined') {
      console.error('❌ Chart.js library not loaded');
      return false;
    }

    // Set global Chart.js defaults
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    Chart.defaults.color = '#6b7280';

    // Initialize each chart
    initUmsatzChart();
    initAbsatzChart();
    initDB2Chart();
    initProjektkostenChart();
    initDB3JahrChart();
    initDB3KumuliertChart();

    console.log('✅ All charts initialized');
    return true;

  } catch (error) {
    console.error('❌ Chart initialization failed:', error);
    return false;
  }
}

// ==========================================
// INDIVIDUAL CHART INITIALIZERS
// ==========================================

/**
 * Initialize Umsatz (Revenue) Chart
 */
function initUmsatzChart() {
  const ctx = document.getElementById('umsatz-chart')?.getContext('2d');
  if (!ctx) {
    console.warn('⚠️ umsatz-chart element not found');
    return;
  }

  if (chartRegistry.umsatzChart) {
    chartRegistry.umsatzChart.destroy();
  }

  const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031];

  chartRegistry.umsatzChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years.map(y => y.toString()),
      datasets: [{
        label: 'Umsatz (k€)',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
        borderWidth: 1,
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
              return context.parsed.y.toFixed(1) + ' k€';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value + ' k€';
            }
          }
        }
      }
    }
  });
}

/**
 * Initialize Absatz (Volume) Chart
 */
function initAbsatzChart() {
  const ctx = document.getElementById('absatz-chart')?.getContext('2d');
  if (!ctx) {
    console.warn('⚠️ absatz-chart element not found');
    return;
  }

  if (chartRegistry.absatzChart) {
    chartRegistry.absatzChart.destroy();
  }

  const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031];

  chartRegistry.absatzChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years.map(y => y.toString()),
      datasets: [{
        label: 'Absatz (Tsd. Stück)',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#6b7280',
        borderColor: '#4b5563',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toFixed(1) + ' k';
            }
          }
        }
      }
    }
  });
}

/**
 * Initialize DB2 (Margin) Chart - Dual Axis
 */
function initDB2Chart() {
  const ctx = document.getElementById('db2-chart')?.getContext('2d');
  if (!ctx) {
    console.warn('⚠️ db2-chart element not found');
    return;
  }

  if (chartRegistry.db2Chart) {
    chartRegistry.db2Chart.destroy();
  }

  const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031];

  chartRegistry.db2Chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years.map(y => y.toString()),
      datasets: [
        {
          label: 'DB2 (k€)',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: '#6b7280',
          borderColor: '#4b5563',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y'
        },
        {
          label: 'DB2 Marge (%)',
          data: [0, 0, 0, 0, 0, 0, 0],
          type: 'line',
          borderColor: '#4b5563',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#4b5563',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value + ' k€';
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          max: 50,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

/**
 * Initialize Projektkosten Chart
 */
function initProjektkostenChart() {
  const ctx = document.getElementById('projektkosten-chart')?.getContext('2d');
  if (!ctx) {
    console.warn('⚠️ projektkosten-chart element not found');
    return;
  }

  if (chartRegistry.projektkostenChart) {
    chartRegistry.projektkostenChart.destroy();
  }

  const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031];

  chartRegistry.projektkostenChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years.map(y => y.toString()),
      datasets: [{
        label: 'Projektkosten (k€)',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value + ' k€';
            }
          }
        }
      }
    }
  });
}

/**
 * Initialize DB3 Jahreswerte Chart
 */
function initDB3JahrChart() {
  const ctx = document.getElementById('db3-jahr-chart')?.getContext('2d');
  if (!ctx) {
    console.warn('⚠️ db3-jahr-chart element not found');
    return;
  }

  if (chartRegistry.db3JahrChart) {
    chartRegistry.db3JahrChart.destroy();
  }

  const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031];

  chartRegistry.db3JahrChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years.map(y => y.toString()),
      datasets: [{
        label: 'DB3 (k€)',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: function(context) {
          const value = context.parsed?.y || 0;
          return value < 0 ? '#ef4444' : '#10b981';
        },
        borderColor: '#4b5563',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return value + ' k€';
            }
          }
        }
      }
    }
  });
}

/**
 * Initialize DB3 Kumuliert Chart
 */
function initDB3KumuliertChart() {
  const ctx = document.getElementById('db3-kumuliert-chart')?.getContext('2d');
  if (!ctx) {
    console.warn('⚠️ db3-kumuliert-chart element not found');
    return;
  }

  if (chartRegistry.db3KumuliertChart) {
    chartRegistry.db3KumuliertChart.destroy();
  }

  const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031];

  chartRegistry.db3KumuliertChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years.map(y => y.toString()),
      datasets: [{
        label: 'DB3 Kumuliert (k€)',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#10b981',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return value + ' k€';
            }
          }
        }
      }
    }
  });
}

// ==========================================
// CHART UPDATE API (for cockpit.js)
// ==========================================

/**
 * Update specific chart with custom data
 * Used by cockpit.js for portfolio/project specific updates
 * @param {string} chartName - Name of chart (e.g., 'umsatzChart')
 * @param {Array} data - Array of data values
 * @param {string} label - Optional label for dataset
 */
export function updateChartData(chartName, data, label) {
  const chart = chartRegistry[chartName];
  if (!chart) {
    console.warn(`⚠️ Chart ${chartName} not found`);
    return;
  }

  chart.data.datasets[0].data = data;
  if (label) {
    chart.data.datasets[0].label = label;
  }
  chart.update('none'); // No animation for performance
}

/**
 * Update DB2 Chart (dual axis - special case)
 */
export function updateDB2ChartData(dataAbsolute, dataPercent) {
  const chart = chartRegistry.db2Chart;
  if (!chart) {
    console.warn('⚠️ db2Chart not found');
    return;
  }

  chart.data.datasets[0].data = dataAbsolute;
  chart.data.datasets[1].data = dataPercent;
  chart.update('none');
}

// ==========================================
// CHART UTILITIES
// ==========================================

/**
 * Get specific chart instance
 * @param {string} chartName - Chart name (e.g., 'umsatzChart')
 * @returns {Chart|null} Chart instance
 */
export function getChart(chartName) {
  return chartRegistry[chartName] || null;
}

/**
 * Check if charts are initialized
 * @returns {boolean} Initialization status
 */
export function areChartsInitialized() {
  return Object.values(chartRegistry).some(chart => chart !== null);
}

/**
 * Resize all charts (for responsive behavior)
 */
export function resizeAllCharts() {
  Object.values(chartRegistry).forEach(chart => {
    if (chart) {
      chart.resize();
    }
  });
}

/**
 * Destroy all charts (cleanup)
 */
export function destroyAllCharts() {
  Object.keys(chartRegistry).forEach(key => {
    if (chartRegistry[key]) {
      chartRegistry[key].destroy();
      chartRegistry[key] = null;
    }
  });
  
  console.log('🧹 All charts destroyed');
}

// ==========================================
// EXPORTS
// ==========================================

export default {
  initializeCharts,
  updateChartData,
  updateDB2ChartData,
  getChart,
  areChartsInitialized,
  resizeAllCharts,
  destroyAllCharts
};
