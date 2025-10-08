/**
 * CFO Dashboard - Chart Management
 * Enterprise Chart.js wrapper with performance optimization,
 * data aggregation, and responsive updates
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
    Chart.defaults.color = CONFIG.colors.gray;

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
    state.setError('charts', error);
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
  if (!ctx) return;

  // Destroy existing chart if present
  if (chartRegistry.umsatzChart) {
    chartRegistry.umsatzChart.destroy();
  }

  chartRegistry.umsatzChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: CONFIG.years.map(y => y.toString()),
      datasets: [{
        label: 'Umsatz (k€)',
        data: [0, 2.9, 10.8, 24.2, 42.3, 47.0, 48.8],
        backgroundColor: CONFIG.colors.primary,
        borderColor: CONFIG.colors.primary,
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y.toFixed(1) + 'k€';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value + 'k€';
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
  if (!ctx) return;

  if (chartRegistry.absatzChart) {
    chartRegistry.absatzChart.destroy();
  }

  chartRegistry.absatzChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: CONFIG.years.map(y => y.toString()),
      datasets: [{
        label: 'Absatz (Tsd. Stück)',
        data: [0.0, 0.2, 1.1, 2.8, 5.5, 5.6, 5.6],
        backgroundColor: CONFIG.colors.gray,
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
              return value.toFixed(1) + 'k';
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
  if (!ctx) return;

  if (chartRegistry.db2Chart) {
    chartRegistry.db2Chart.destroy();
  }

  chartRegistry.db2Chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: CONFIG.years.map(y => y.toString()),
      datasets: [
        {
          label: 'DB2 (k€)',
          data: [0.0, 1.0, 3.7, 8.5, 15.4, 17.1, 17.8],
          backgroundColor: CONFIG.colors.gray,
          borderColor: '#4b5563',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y'
        },
        {
          label: 'DB2 Marge (%)',
          data: [0, 33, 34, 35, 36, 36, 36],
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
              return value + 'k€';
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
  if (!ctx) return;

  if (chartRegistry.projektkostenChart) {
    chartRegistry.projektkostenChart.destroy();
  }

  chartRegistry.projektkostenChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: CONFIG.years.map(y => y.toString()),
      datasets: [{
        label: 'Projektkosten (k€)',
        data: [1.6, 2.5, 3.2, 2.9, 2.9, 3.1, 2.5],
        backgroundColor: CONFIG.colors.warning,
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
              return value + 'k€';
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
  if (!ctx) return;

  if (chartRegistry.db3JahrChart) {
    chartRegistry.db3JahrChart.destroy();
  }

  chartRegistry.db3JahrChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: CONFIG.years.map(y => y.toString()),
      datasets: [{
        label: 'DB3 (k€)',
        data: [-1.6, -1.6, 0.5, 5.6, 12.4, 14.0, 15.3],
        backgroundColor: function(context) {
          const value = context.parsed.y;
          return value < 0 ? CONFIG.colors.danger : CONFIG.colors.success;
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
              return value + 'k€';
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
  if (!ctx) return;

  if (chartRegistry.db3KumuliertChart) {
    chartRegistry.db3KumuliertChart.destroy();
  }

  chartRegistry.db3KumuliertChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: CONFIG.years.map(y => y.toString()),
      datasets: [{
        label: 'DB3 Kumuliert (k€)',
        data: [-1.6, -3.2, -2.7, 2.9, 15.3, 29.3, 44.6],
        borderColor: CONFIG.colors.success,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: CONFIG.colors.success,
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
              return value + 'k€';
            }
          }
        }
      }
    }
  });
}

// ==========================================
// DATA CALCULATION ENGINE
// ==========================================

/**
 * Calculate aggregated dashboard data from all articles
 * @returns {object} Aggregated data for all charts
 */
export function calculateDashboardData() {
  const years = CONFIG.years;
  
  const dashboardData = {
    umsatz: [],
    absatz: [],
    db2: [],
    db2Percent: [],
    projektkosten: [],
    db3Jahr: [],
    db3Kumuliert: []
  };

  // Calculate for each year
  years.forEach(year => {
    let yearUmsatz = 0;
    let yearAbsatz = 0;
    let yearHK = 0;

    // Aggregate ALL active articles
    Object.keys(state.artikelData).forEach(artikelId => {
      const artikel = state.artikelData[artikelId];
      
      if (artikel && artikel.active !== false) {
        const volume = artikel.volumes?.[year] || 0;
        const price = artikel.prices?.[year] || 0;
        const hk = artikel.hk || 0;

        yearUmsatz += (volume * price) / 1000; // Convert to k€
        yearAbsatz += volume / 1000; // Convert to Tsd.
        yearHK += (volume * hk) / 1000;
      }
    });

    // Apply market adjustments from sliders
    const marketFactor = state.currentValues.marketVolume / 100;
    const priceFactor = state.currentValues.pricePremium / 100;

    yearUmsatz = yearUmsatz * marketFactor * priceFactor;
    yearAbsatz = yearAbsatz * marketFactor;
    yearHK = yearHK * marketFactor;

    const yearDB2 = yearUmsatz - yearHK;
    const yearDB2Percent = yearUmsatz > 0 ? (yearDB2 / yearUmsatz * 100) : 0;
    
    // Projektkosten (placeholder - will be calculated from project data later)
    const yearProjektkosten = 2.5;
    const yearDB3 = yearDB2 - yearProjektkosten;

    // Store results
    dashboardData.umsatz.push(parseFloat(yearUmsatz.toFixed(1)));
    dashboardData.absatz.push(parseFloat(yearAbsatz.toFixed(1)));
    dashboardData.db2.push(parseFloat(yearDB2.toFixed(1)));
    dashboardData.db2Percent.push(parseFloat(yearDB2Percent.toFixed(1)));
    dashboardData.projektkosten.push(yearProjektkosten);
    dashboardData.db3Jahr.push(parseFloat(yearDB3.toFixed(1)));
  });

  // Calculate cumulative DB3
  let cumulative = 0;
  dashboardData.db3Jahr.forEach(value => {
    cumulative += value;
    dashboardData.db3Kumuliert.push(parseFloat(cumulative.toFixed(1)));
  });

  return dashboardData;
}

// ==========================================
// CHART UPDATE FUNCTIONS
// ==========================================

/**
 * Update all charts with fresh data
 * Performance-optimized with batched updates
 */
export function updateAllCharts() {
  try {
    // Calculate new data
    const data = calculateDashboardData();

    // Update each chart (Chart.js batches internally)
    updateUmsatzChart(data.umsatz);
    updateAbsatzChart(data.absatz);
    updateDB2Chart(data.db2, data.db2Percent);
    updateProjektkostenChart(data.projektkosten);
    updateDB3JahrChart(data.db3Jahr);
    updateDB3KumuliertChart(data.db3Kumuliert);

    console.log('✅ All charts updated');

  } catch (error) {
    console.error('❌ Failed to update charts:', error);
    state.setError('updateCharts', error);
  }
}

/**
 * Update Umsatz Chart
 */
function updateUmsatzChart(data) {
  if (!chartRegistry.umsatzChart) return;
  
  chartRegistry.umsatzChart.data.datasets[0].data = data;
  chartRegistry.umsatzChart.update('none'); // 'none' = no animation for performance
}

/**
 * Update Absatz Chart
 */
function updateAbsatzChart(data) {
  if (!chartRegistry.absatzChart) return;
  
  chartRegistry.absatzChart.data.datasets[0].data = data;
  chartRegistry.absatzChart.update('none');
}

/**
 * Update DB2 Chart (dual axis)
 */
function updateDB2Chart(dataAbsolute, dataPercent) {
  if (!chartRegistry.db2Chart) return;
  
  chartRegistry.db2Chart.data.datasets[0].data = dataAbsolute;
  chartRegistry.db2Chart.data.datasets[1].data = dataPercent;
  chartRegistry.db2Chart.update('none');
}

/**
 * Update Projektkosten Chart
 */
function updateProjektkostenChart(data) {
  if (!chartRegistry.projektkostenChart) return;
  
  chartRegistry.projektkostenChart.data.datasets[0].data = data;
  chartRegistry.projektkostenChart.update('none');
}

/**
 * Update DB3 Jahr Chart
 */
function updateDB3JahrChart(data) {
  if (!chartRegistry.db3JahrChart) return;
  
  chartRegistry.db3JahrChart.data.datasets[0].data = data;
  chartRegistry.db3JahrChart.update('none');
}

/**
 * Update DB3 Kumuliert Chart
 */
function updateDB3KumuliertChart(data) {
  if (!chartRegistry.db3KumuliertChart) return;
  
  chartRegistry.db3KumuliertChart.data.datasets[0].data = data;
  chartRegistry.db3KumuliertChart.update('none');
}

// ==========================================
// CHART UTILITIES
// ==========================================

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

/**
 * Get specific chart instance
 * @param {string} chartName - Chart name
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

// Export default object
export default {
  initializeCharts,
  updateAllCharts,
  calculateDashboardData,
  destroyAllCharts,
  getChart,
  areChartsInitialized,
  resizeAllCharts
};