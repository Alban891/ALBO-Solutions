/**
 * CFO Dashboard - Main Application Controller
 * Orchestrates initialization, event handling, and navigation
 * Enterprise entry point with proper error handling
 */

import CONFIG from './config.js';
import { state } from './state.js';
import * as helpers from './helpers.js';
import * as api from './api.js';
import * as charts from './charts.js';
import * as projekte from './modules/projekte.js';
import * as artikel from './modules/artikel.js';
import * as projektkosten from './modules/projektkosten.js';

// ==========================================
// APPLICATION STATE
// ==========================================

window.cfoDashboard = {
  // Expose state globally for backward compatibility
  currentValues: state.currentValues,
  currentArtikel: null,
  currentProjekt: null,
  
  // Data references
  projektData: state.projektData,
  artikelData: state.artikelData,
  
  // AI Controller (will be initialized later)
  aiController: null
};

// ==========================================
// INITIALIZATION SEQUENCE
// ==========================================

/**
 * Main application initialization
 * Called on DOMContentLoaded
 */
async function initializeApplication() {
  console.log('🚀 CFO Dashboard initializing...');
  
  try {
    // Step 1: Restore previous state
    const stateRestored = state.restoreState();
    if (stateRestored) {
      console.log('✅ Previous state restored');
    }

    // Step 2: Initialize Charts
    await charts.initializeCharts();

    // Step 3: Initialize AI Controller
    initializeAI();

    // Step 4: Initialize Supabase
    const supabaseReady = await api.initializeSupabase();
    
    if (supabaseReady) {
      // Step 5: Load data from database
      await loadInitialData();
    } else {
      console.warn('⚠️ Running in offline mode');
    }

    // Step 6: Setup event listeners
    setupEventListeners();

    // Step 7: Restore UI state
    restoreUIState();

    // Step 8: Start AI insights timer
    startAIInsightsTimer();

    console.log('✅ CFO Dashboard ready!');

  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    showErrorNotification('Anwendung konnte nicht gestartet werden. Bitte Seite neu laden.');
  }
}

    // NEU - Module global verfügbar machen (HIER nach Zeile 82)
    window.projekte = projekte;
    window.artikel = artikel; 
    window.projektkosten = projektkosten;
    window.renderProjektOverview = projekte.renderProjektOverview;
    window.updateProjektStats = projekte.updateProjektStats;

/**
 * Load initial data from database
 */
async function loadInitialData() {
  try {
    // Show loading indicator
    showLoadingIndicator();

    // Load projects
    console.log('📦 Loading projects...');
    await api.loadProjects();

    // Load articles for each project
    const projekte = state.getAllProjekte();
    console.log(`📊 Found ${projekte.length} projects to load articles for`);
    
    for (const projekt of projekte) {
      await api.loadArticles(projekt.id);
    }

    console.log('✅ Initial data loaded');

    // Update charts with loaded data
    charts.updateAllCharts();

    // CRITICAL: Render UI after loading data
    // Import and call the render functions from projekte module
    if (window.renderProjektOverview) {
      console.log('🎨 Rendering project overview...');
      window.renderProjektOverview();
    }
    
    if (window.updateProjektStats) {
      console.log('📈 Updating project stats...');
      window.updateProjektStats();
    }

  } catch (error) {
    console.error('❌ Failed to load initial data:', error);
  } finally {
    hideLoadingIndicator();
  }
}

// ==========================================
// UI STATE MANAGEMENT
// ==========================================

/**
 * Restore UI state from saved state
 */
function restoreUIState() {
  // Map old tab names to new names
  const tabMapping = {
    'dashboard': 'cockpit',
    'assumptions': 'projekte',
    'insights': 'performance'
  };
  
  let targetTab = state.currentTab || 'cockpit';
  
  // Convert old tab name to new name
  if (tabMapping[targetTab]) {
    targetTab = tabMapping[targetTab];
  }
  
  console.log('🔄 Restoring UI to tab:', targetTab);

  // Set active tab
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // Activate target tab
  const targetButton = document.querySelector(`[onclick="switchTab('${targetTab}')"]`);
  const targetContent = document.getElementById(`tab-${targetTab}`);

  if (targetButton) targetButton.classList.add('active');
  if (targetContent) targetContent.classList.add('active');
}

/**
 * Save current navigation state
 */
export function saveNavigationState() {
  state.currentTab = getCurrentActiveTab();
  state.currentProjekt = window.cfoDashboard.currentProjekt;
  state.currentArtikel = window.cfoDashboard.currentArtikel;
  state.saveState();
}

/**
 * Get currently active tab
 */
function getCurrentActiveTab() {
  const activeTab = document.querySelector('.tab-btn.active');
  if (!activeTab) return 'dashboard';
  
  const onclick = activeTab.getAttribute('onclick');
  const match = onclick?.match(/switchTab\('(.+?)'\)/);
  return match ? match[1] : 'dashboard';
}

// ==========================================
// GLOBAL FUNCTIONS (Exposed for HTML onclick)
// ==========================================

/**
 * Switch main tab
 */
window.switchTab = function(tabName) {
  console.log('📑 Switching to tab:', tabName);

  // Update UI
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  const targetButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
  const targetContent = document.getElementById(`tab-${tabName}`);

  if (targetButton) targetButton.classList.add('active');
  if (targetContent) targetContent.classList.add('active');

  // Reset views when switching tabs
  if (tabName === 'projekte') {
    const projektOverview = document.getElementById('projekt-overview');
    const artikelOverview = document.getElementById('artikel-overview');
    
    if (projektOverview) projektOverview.style.display = 'block';
    if (artikelOverview) artikelOverview.style.display = 'none';
    
    window.cfoDashboard.currentProjekt = null;
    window.cfoDashboard.currentArtikel = null;
  }

  // Save state
  state.currentTab = tabName;
  saveNavigationState();

  // AI Feedback
  if (window.cfoDashboard.aiController) {
    window.cfoDashboard.aiController.addAIMessage({
      level: 'info',
      title: '📑 Tab gewechselt',
      text: `Ansicht "${getTabDisplayName(tabName)}" aktiviert.`,
      timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
    });
  }
};

/**
 * Adjust dashboard assumptions (sliders)
 */
window.adjustAssumption = function(type, value) {
  console.log(`🎚️ Adjusting ${type} to ${value}`);

  switch(type) {
    case 'market':
      state.currentValues.marketVolume = value;
      helpers.setInputValue('market-value', value + '%');
      break;
      
    case 'price':
      state.currentValues.pricePremium = value;
      const priceDiff = value - 100;
      helpers.setInputValue('price-value', (priceDiff >= 0 ? '+' : '') + priceDiff + '%');
      break;
      
    case 'capex':
      state.currentValues.capexRisk = value;
      const capexText = value > 110 ? 'Überschreitung' : value < 90 ? 'Einsparung' : 'Plan';
      helpers.setInputValue('capex-value', capexText);
      break;
  }

  // Update all charts with new values
  charts.updateAllCharts();

  // Save state
  state.saveState();

  // AI Feedback
  if (window.cfoDashboard.aiController) {
    window.cfoDashboard.aiController.addAIMessage({
      level: 'info',
      title: '📊 Dashboard aktualisiert',
      text: `${type === 'market' ? 'Marktvolumen' : type === 'price' ? 'Preis-Premium' : 'CAPEX-Risiko'} angepasst auf ${value}%`,
      timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
    });
  }
};

// ==========================================
// LOADING & ERROR UI
// ==========================================

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
  const indicator = document.getElementById('projekt-loading-indicator');
  const tbody = document.getElementById('projekt-list-tbody');

  if (indicator) {
    indicator.style.display = 'flex';
    indicator.style.opacity = '1';
  }
  
  if (tbody) {
    tbody.style.display = 'none';
  }
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
  const indicator = document.getElementById('projekt-loading-indicator');
  const tbody = document.getElementById('projekt-list-tbody');

  if (indicator) {
    indicator.style.opacity = '0';
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 300);
  }
  
  if (tbody) {
    tbody.style.display = '';
  }
}

/**
 * Show error notification
 */
function showErrorNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${CONFIG.colors.danger};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

/**
 * Setup global event listeners
 */
function setupEventListeners() {
  // Window resize - update charts
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      charts.resizeAllCharts();
    }, 250);
  });

  // Before unload - save state
  window.addEventListener('beforeunload', () => {
    saveNavigationState();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+S - Save (prevent default browser save)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (window.cfoDashboard.currentArtikel) {
        window.saveArtikelChanges?.();
      }
    }
  });

  console.log('✅ Event listeners registered');
}

// ==========================================
// AI CONTROLLER
// ==========================================

/**
 * Initialize AI Controller
 */
function initializeAI() {
  window.cfoDashboard.aiController = {
    messages: [],
    
    addAIMessage: function(message) {
      this.messages.push({
        ...message,
        id: Date.now(),
        timestamp: message.timestamp || new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });

      this.renderMessages();

      if (this.messages.length > 20) {
        this.messages.shift();
      }
    },

    renderMessages: function() {
      const feedContainer = document.getElementById('ki-feed');
      if (!feedContainer) return;

      const messagesHtml = this.messages.slice().reverse().map(msg => {
        const icon = this.getIcon(msg.level);
        const title = msg.title || 'KI Insight';
        const text = msg.text || '';
        const time = msg.timestamp || '';
        const level = msg.level || 'info';
        
        let html = '<div class="ki-message ki-' + level + '">';
        html += '<div class="ki-message-header">';
        html += '<span class="ki-message-title">' + icon + ' ' + title + '</span>';
        html += '<span class="ki-message-time">' + time + '</span>';
        html += '</div>';
        html += '<div class="ki-message-text">' + text + '</div>';
        
        if (msg.recommendation) {
          html += '<div class="ki-message-recommendation">💡 ' + msg.recommendation + '</div>';
        }
        
        html += '</div>';
        return html;
      }).join('');

      feedContainer.innerHTML = messagesHtml;
    },

    getIcon: function(level) {
      const icons = {
        'success': '✅',
        'insight': '📊',
        'risk': '⚠️',
        'warning': '⚠️',
        'info': 'ℹ️'
      };
      return icons[level] || 'ℹ️';
    }
  };

  // Initial welcome message
  window.cfoDashboard.aiController.addAIMessage({
    level: 'success',
    title: 'KI-Controller aktiviert',
    text: 'System bereit. Business Case geladen.',
    timestamp: 'System-Start'
  });

  console.log('✅ AI Controller initialized');
}

/**
 * Start AI insights timer (periodic insights)
 */
function startAIInsightsTimer() {
  const insights = [
    { title: 'Markt-Insight', text: 'DB2-Marge liegt über Benchmark.', level: 'insight' },
    { title: 'Risiko-Hinweis', text: 'CAPEX-Auslastung bei 89%.', level: 'risk' },
    { title: 'Optimierung', text: 'Mengenmodell für Artikel X prüfen.', level: 'info' },
    { title: 'Performance', text: 'Projekt Y hat Payback erreicht.', level: 'success' }
  ];

  setInterval(() => {
    if (window.cfoDashboard.aiController) {
      const randomInsight = insights[Math.floor(Math.random() * insights.length)];
      window.cfoDashboard.aiController.addAIMessage({
        ...randomInsight,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  }, 60000); // Every 60 seconds
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get display name for tab
 */
function getTabDisplayName(tabName) {
  const names = {
    'cockpit': 'Cockpit',
    'projekte': 'Projekte',
    'performance': 'Performance',
    'admin': 'Admin'
  };
  return names[tabName] || tabName;
}

// ==========================================
// EXPORTS
// ==========================================

export {
  initializeApplication,
  showErrorNotification,
};

// ==========================================
// AUTO-INITIALIZATION
// ==========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  initializeApplication();
}

// Export to window for debugging
window.cfoDashboardMain = {
  state,
  helpers,
  api,
  charts,
  saveNavigationState,
  showErrorNotification
};

console.log('📦 Main module loaded');
