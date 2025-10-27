/**
 * REVENUE MODEL STATE MANAGER
 * Zentraler State für alle Artikel-Forecasts
 * Ermöglicht aggregierte Wirtschaftlichkeits-Ansicht
 */

// ==========================================
// GLOBAL STATE
// ==========================================

window.revenueModelState = {
  artikelForecasts: {},  // { artikelId: forecastData }
  observers: [],         // Callbacks für Updates
  lastUpdate: null
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

/**
 * Set forecast for an artikel
 * @param {string} artikelId - Unique artikel ID
 * @param {Object} forecastData - Calculated forecast data
 */
export function setArtikelForecast(artikelId, forecastData) {
  console.log('📊 Setting forecast for:', artikelId);
  
  // Validate forecast data
  if (!forecastData || !forecastData.years || !forecastData.revenue) {
    console.error('❌ Invalid forecast data:', forecastData);
    return;
  }
  
  // Store forecast
  window.revenueModelState.artikelForecasts[artikelId] = {
    ...forecastData,
    lastUpdated: new Date().toISOString()
  };
  
  window.revenueModelState.lastUpdate = new Date().toISOString();
  
  // Notify observers
  notifyObservers();
  
  console.log('✅ Forecast stored. Total artikel:', Object.keys(window.revenueModelState.artikelForecasts).length);
}

/**
 * Get forecast for an artikel
 * @param {string} artikelId - Unique artikel ID
 * @returns {Object|null} Forecast data or null
 */
export function getArtikelForecast(artikelId) {
  return window.revenueModelState.artikelForecasts[artikelId] || null;
}

/**
 * Get all artikel forecasts
 * @returns {Object} All forecasts
 */
export function getAllForecasts() {
  return window.revenueModelState.artikelForecasts;
}

/**
 * Remove forecast for an artikel
 * @param {string} artikelId - Unique artikel ID
 */
export function removeArtikelForecast(artikelId) {
  if (window.revenueModelState.artikelForecasts[artikelId]) {
    delete window.revenueModelState.artikelForecasts[artikelId];
    notifyObservers();
    console.log('🗑️ Removed forecast for:', artikelId);
  }
}

/**
 * Clear all forecasts
 */
export function clearAllForecasts() {
  window.revenueModelState.artikelForecasts = {};
  notifyObservers();
  console.log('🗑️ Cleared all forecasts');
}

// ==========================================
// OBSERVER PATTERN
// ==========================================

/**
 * Subscribe to state changes
 * @param {Function} callback - Callback function(state)
 * @returns {Function} Unsubscribe function
 */
export function subscribeToStateChanges(callback) {
  window.revenueModelState.observers.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = window.revenueModelState.observers.indexOf(callback);
    if (index > -1) {
      window.revenueModelState.observers.splice(index, 1);
    }
  };
}

/**
 * Notify all observers of state change
 */
function notifyObservers() {
  const state = {
    artikelForecasts: window.revenueModelState.artikelForecasts,
    artikelCount: Object.keys(window.revenueModelState.artikelForecasts).length,
    lastUpdate: window.revenueModelState.lastUpdate
  };
  
  window.revenueModelState.observers.forEach(callback => {
    try {
      callback(state);
    } catch (error) {
      console.error('❌ Observer callback error:', error);
    }
  });
}

// ==========================================
// AGGREGATION HELPERS
// ==========================================

/**
 * Get aggregated forecast for all artikel
 * @returns {Object} Aggregated forecast data
 */
export function getAggregatedForecast() {
  const forecasts = Object.values(window.revenueModelState.artikelForecasts);
  
  if (forecasts.length === 0) {
    return null;
  }
  
  // Get common years (assume all forecasts have same years)
  const years = forecasts[0].years;
  
  // Initialize aggregated data
  const aggregated = {
    years: years,
    totalRevenue: new Array(years.length).fill(0),
    totalCost: new Array(years.length).fill(0),
    totalDB2: new Array(years.length).fill(0),
    avgDB2Margin: new Array(years.length).fill(0)
  };
  
  // Sum up all artikel
  forecasts.forEach(forecast => {
    forecast.revenue.forEach((value, i) => {
      aggregated.totalRevenue[i] += value;
    });
    forecast.totalCost.forEach((value, i) => {
      aggregated.totalCost[i] += value;
    });
    forecast.db2.forEach((value, i) => {
      aggregated.totalDB2[i] += value;
    });
  });
  
  // Calculate weighted average margin
  aggregated.avgDB2Margin = aggregated.totalRevenue.map((rev, i) => {
    return rev > 0 ? (aggregated.totalDB2[i] / rev) * 100 : 0;
  });
  
  return aggregated;
}

/**
 * Get forecast summary statistics
 * @returns {Object} Summary statistics
 */
export function getForecastSummary() {
  const forecasts = Object.values(window.revenueModelState.artikelForecasts);
  
  if (forecasts.length === 0) {
    return {
      artikelCount: 0,
      totalRevenue: 0,
      totalDB2: 0,
      avgMargin: 0,
      peakRevenue: 0,
      peakYear: null
    };
  }
  
  const aggregated = getAggregatedForecast();
  
  const totalRevenue = aggregated.totalRevenue.reduce((a, b) => a + b, 0);
  const totalDB2 = aggregated.totalDB2.reduce((a, b) => a + b, 0);
  const avgMargin = totalRevenue > 0 ? (totalDB2 / totalRevenue) * 100 : 0;
  
  const peakRevenue = Math.max(...aggregated.totalRevenue);
  const peakIndex = aggregated.totalRevenue.indexOf(peakRevenue);
  const peakYear = aggregated.years[peakIndex];
  
  return {
    artikelCount: forecasts.length,
    totalRevenue: totalRevenue,
    totalDB2: totalDB2,
    avgMargin: avgMargin,
    peakRevenue: peakRevenue,
    peakYear: peakYear
  };
}

/**
 * Get forecast data formatted for export
 * @returns {Array} Array of artikel with forecast data
 */
export function getExportData() {
  const forecasts = window.revenueModelState.artikelForecasts;
  
  return Object.entries(forecasts).map(([artikelId, forecast]) => {
    return {
      artikelId: artikelId,
      name: forecast.name,
      type: forecast.type,
      years: forecast.years,
      revenue: forecast.revenue,
      totalCost: forecast.totalCost,
      db2: forecast.db2,
      db2Margin: forecast.db2Margin,
      lastUpdated: forecast.lastUpdated
    };
  });
}

// ==========================================
// PERSISTENCE (Optional)
// ==========================================

/**
 * Save state to localStorage
 */
export function saveStateToLocalStorage() {
  try {
    const state = {
      artikelForecasts: window.revenueModelState.artikelForecasts,
      lastUpdate: window.revenueModelState.lastUpdate
    };
    localStorage.setItem('revenueModelState', JSON.stringify(state));
    console.log('💾 State saved to localStorage');
  } catch (error) {
    console.error('❌ Failed to save state:', error);
  }
}

/**
 * Load state from localStorage
 */
export function loadStateFromLocalStorage() {
  try {
    const saved = localStorage.getItem('revenueModelState');
    if (saved) {
      const state = JSON.parse(saved);
      window.revenueModelState.artikelForecasts = state.artikelForecasts || {};
      window.revenueModelState.lastUpdate = state.lastUpdate;
      notifyObservers();
      console.log('📂 State loaded from localStorage');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to load state:', error);
  }
  return false;
}

/**
 * Clear saved state from localStorage
 */
export function clearSavedState() {
  localStorage.removeItem('revenueModelState');
  console.log('🗑️ Saved state cleared');
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize state manager
 */
export function initializeStateManager() {
  console.log('🚀 Initializing Revenue Model State Manager');
  
  // Try to load saved state
  loadStateFromLocalStorage();
  
  // Auto-save on changes (debounced)
  let saveTimeout;
  subscribeToStateChanges(() => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveStateToLocalStorage();
    }, 1000); // Save 1 second after last change
  });
  
  console.log('✅ State Manager initialized');
}

// ==========================================
// DEBUG HELPERS
// ==========================================

/**
 * Get debug info
 */
export function getDebugInfo() {
  return {
    artikelCount: Object.keys(window.revenueModelState.artikelForecasts).length,
    observerCount: window.revenueModelState.observers.length,
    lastUpdate: window.revenueModelState.lastUpdate,
    artikelIds: Object.keys(window.revenueModelState.artikelForecasts),
    state: window.revenueModelState
  };
}

/**
 * Log state to console
 */
export function logState() {
  console.log('📊 Revenue Model State:', getDebugInfo());
  console.table(getExportData());
}

// ==========================================
// GLOBAL ACCESS (for debugging)
// ==========================================

window.revenueState = {
  get: getAllForecasts,
  set: setArtikelForecast,
  remove: removeArtikelForecast,
  clear: clearAllForecasts,
  summary: getForecastSummary,
  aggregated: getAggregatedForecast,
  debug: getDebugInfo,
  log: logState
};

// ==========================================
// EXPORT
// ==========================================

export default {
  // Core functions
  setArtikelForecast,
  getArtikelForecast,
  getAllForecasts,
  removeArtikelForecast,
  clearAllForecasts,
  
  // Observer pattern
  subscribeToStateChanges,
  
  // Aggregation
  getAggregatedForecast,
  getForecastSummary,
  getExportData,
  
  // Persistence
  saveStateToLocalStorage,
  loadStateFromLocalStorage,
  clearSavedState,
  
  // Initialization
  initializeStateManager,
  
  // Debug
  getDebugInfo,
  logState
};
