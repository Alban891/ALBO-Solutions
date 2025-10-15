/**
 * CFO Dashboard - Main Application Controller
 * Orchestrates initialization, event handling, and navigation
 * Enterprise entry point with proper error handling
 * 
 * Version: 3.1 - October 2025
 * Features: Tutorial System, Deep Navigation Restore, AI Controller
 * FIXED: Export conflicts, function hoisting, state references
 */

import CONFIG from './config.js';
import { state } from './state.js';
import * as helpers from './helpers.js';
import * as api from './api.js';
import * as charts from './charts.js';
import * as cockpit from './modules/cockpit.js';
import * as projekte from './modules/projekte.js';
import * as artikel from './modules/artikel.js';
import * as projektkosten from './modules/projektkosten.js';
import tutorialController from './modules/tutorial-controller.js';

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
// GLOBAL FUNCTIONS (Exposed for HTML onclick)
// ⚠️ MUST BE DEFINED BEFORE INITIALIZATION
// ==========================================

/**
 * Switch main tab
 */
window.switchTab = function(tabName) {
  // Check if already on this tab
  const currentTab = state.currentTab;
  if (currentTab === tabName) {
    console.log('ℹ️ Already on tab:', tabName);
    return; // ✓ EXIT EARLY - no need to switch
  }

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

  // Handle tab-specific rendering
  if (tabName === 'cockpit') {
    // ✅ RENDER COCKPIT!
    console.log('📊 Rendering cockpit...');
    setTimeout(() => {
      if (cockpit && typeof cockpit.renderCockpit === 'function') {
        cockpit.renderCockpit();
      } else {
        console.error('❌ cockpit.renderCockpit is not a function!', cockpit);
      }
    }, 100);
    
  } else if (tabName === 'projekte') {
    // Reset views when switching to projekte
    const projektOverview = document.getElementById('projekt-overview');
    const artikelOverview = document.getElementById('artikel-overview');
    
    if (projektOverview) projektOverview.style.display = 'block';
    if (artikelOverview) artikelOverview.style.display = 'none';
    
    window.cfoDashboard.currentProjekt = null;
    window.cfoDashboard.currentArtikel = null;
    
    // ✓ Render projekt overview (only if switching TO projekte)
    if (window.renderProjektOverview) {
      window.renderProjektOverview();
    }
    if (window.updateProjektStats) {
      window.updateProjektStats();
    }
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
// INITIALIZATION SEQUENCE
// ==========================================

/**
 * Main application initialization
 * Called on DOMContentLoaded
 */
async function initializeApplication() {
  console.log('🚀 CFO Dashboard initializing...');
  
  try {
    // ==========================================
    // Step 1: Restore previous state FIRST (before any UI changes)
    // ==========================================
    const stateRestored = state.restoreState();
    
    if (stateRestored) {
      console.log('✅ Previous state restored');
      applyRestoredTab();
    } else {
      console.log('ℹ️ No previous state - using default (cockpit)');
      state.currentTab = 'cockpit';
      applyRestoredTab();
    }

    // ==========================================
    // Step 2: Make modules globally available
    // ==========================================
    window.projekte = projekte;
    window.artikel = artikel;
    window.projektkosten = projektkosten;
    window.cockpitModule = cockpit;
    window.renderProjektOverview = projekte.renderProjektOverview;
    window.updateProjektStats = projekte.updateProjektStats;

    // ==========================================
    // Step 3: Initialize Charts
    // ==========================================
    await charts.initializeCharts();

    // ==========================================
    // Step 4: Initialize AI Controller
    // ==========================================
    initializeAI();

    // ==========================================
    // Step 5: Initialize Supabase
    // ==========================================
    const supabaseReady = await api.initializeSupabase();
    
    if (supabaseReady) {
      // Step 6: Load data from database
      await loadInitialData();
    } else {
      console.warn('⚠️ Running in offline mode');
    }

    // ==========================================
    // Step 7: Setup event listeners
    // ==========================================
    setupEventListeners();

    // ==========================================
    // Step 8: Start AI insights timer
    // ==========================================
    startAIInsightsTimer();

    // ==========================================
    // Step 9: Tutorial starten wenn Erstnutzer
    // ==========================================
    console.log('9️⃣ Checking tutorial state...');
    const hasCompletedTutorial = state.tutorialState?.completed?.length > 0;
    const tutorialDismissed = state.tutorialState?.dismissed;
    
    if (!hasCompletedTutorial && !tutorialDismissed) {
      // Warte bis UI fertig geladen ist
      setTimeout(() => {
        console.log('🎓 Starting tutorial for first-time user...');
        tutorialController.start();
      }, 1500); // 1.5 Sekunden Verzögerung
    } else {
      console.log('ℹ️ Tutorial already completed or dismissed');
    }

    console.log('✅ CFO Dashboard ready!');

  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    showErrorNotification('Anwendung konnte nicht gestartet werden. Bitte Seite neu laden.');
  }
}

// ==========================================
// TAB STATE RESTORATION
// ==========================================

/**
 * Apply restored tab state immediately (before any rendering)
 * This prevents visual "jumping" between tabs
 */
function applyRestoredTab() {
  const targetTab = state.currentTab || 'cockpit';
  
  console.log('🔄 Applying tab:', targetTab);

  // Map old tab names to new names
  const tabMapping = {
    'dashboard': 'cockpit',
    'assumptions': 'projekte',
    'insights': 'performance'
  };
  
  const mappedTab = tabMapping[targetTab] || targetTab;

  // Update UI synchronously (NO animations, instant switch)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // Activate target tab
  const targetButton = document.querySelector(`[onclick="switchTab('${mappedTab}')"]`);
  const targetContent = document.getElementById(`tab-${mappedTab}`);

  if (targetButton) {
    targetButton.classList.add('active');
    console.log('✅ Tab button activated:', mappedTab);
  } else {
    console.error('❌ Tab button not found:', mappedTab);
  }
  
  if (targetContent) {
    targetContent.classList.add('active');
    console.log('✅ Tab content activated:', mappedTab);
  } else {
    console.error('❌ Tab content not found:', mappedTab);
  }
}

// ==========================================
// DATA LOADING
// ==========================================

/**
 * Load initial data from database
 * FIXED: Render cockpit after data load
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

    // ==========================================
    // CRITICAL: Render cockpit or restore navigation
    // ==========================================
    const currentTab = state.currentTab || 'cockpit';
    
    if (currentTab === 'cockpit') {
      // ✅ RENDER COCKPIT!
      console.log('📊 Rendering cockpit after data load...');
      setTimeout(() => {
        if (cockpit && typeof cockpit.renderCockpit === 'function') {
          cockpit.renderCockpit();
        } else {
          console.error('❌ cockpit.renderCockpit is not a function!', cockpit);
        }
      }, 100);
      
    } else if (currentTab === 'projekte') {
      // Check if we need to restore deep navigation (user was in a projekt)
      if (state.currentProjekt) {
        console.log('🔄 User was in projekt detail - calling restoreDeepNavigation...');
        console.log('   → Projekt:', state.currentProjekt);
        console.log('   → Tab:', state.currentProjektTab);
        
        // ✓✓✓ Restore the exact state ✓✓✓
        await restoreDeepNavigation();
        
      } else {
        console.log('📋 User was in projekt overview - rendering overview...');
        
        // User was on overview - just render the list
        if (window.renderProjektOverview) {
          window.renderProjektOverview();
        }
        if (window.updateProjektStats) {
          window.updateProjektStats();
        }
      }
    } else {
      console.log(`ℹ️ Not on cockpit or projekte tab (current: ${currentTab})`);
    }

  } catch (error) {
    console.error('❌ Failed to load initial data:', error);
  } finally {
    hideLoadingIndicator();
  }
}

// ==========================================
// DEEP NAVIGATION RESTORATION
// ==========================================

/**
 * Restore COMPLETE deep navigation state
 * Handles ALL navigation levels: Projekte → Projekt-Detail → Artikel-Detail
 * Called AFTER data is loaded
 */
async function restoreDeepNavigation() {
  console.log('🔍 Restoring COMPLETE navigation state...');
  console.log('📊 State to restore:', {
    tab: state.currentTab,
    projekt: state.currentProjekt,
    projektTab: state.currentProjektTab,
    projektViewMode: state.projektViewMode,
    artikel: state.currentArtikel,
    artikelViewMode: state.artikelViewMode
  });
  
  const currentTab = state.currentTab;
  
  // Check if we're on projekte tab
  if (currentTab !== 'projekte') {
    console.log('ℹ️ Not on projekte tab, skipping deep navigation');
    return;
  }
  
  const currentProjekt = state.currentProjekt;
  const projektViewMode = state.projektViewMode;
  
  // ==========================================
  // LEVEL 1: Check if user was in projekt overview
  // ==========================================
  if (!currentProjekt || projektViewMode === 'overview') {
    console.log('📋 User was in projekt overview');
    
    const projektOverview = document.getElementById('projekt-overview');
    const projektDetail = document.getElementById('projekt-detail-view');
    
    if (projektOverview) projektOverview.style.display = 'block';
    if (projektDetail) projektDetail.style.display = 'none';
    
    if (window.renderProjektOverview) {
      window.renderProjektOverview();
    }
    if (window.updateProjektStats) {
      window.updateProjektStats();
    }
    
    console.log('✅ Projekt overview restored');
    return;
  }
  
  // ==========================================
  // LEVEL 2: User was in projekt detail
  // ==========================================
  const projekt = state.getProjekt(currentProjekt);
  if (!projekt) {
    console.warn('⚠️ Projekt not found:', currentProjekt);
    state.currentProjekt = null;
    state.projektViewMode = 'overview';
    state.currentProjektTab = null;
    state.saveState();
    
    if (window.renderProjektOverview) {
      window.renderProjektOverview();
    }
    return;
  }
  
  console.log('📂 Restoring projekt detail:', projekt.name);
  
  // Set current projekt globally
  window.cfoDashboard.currentProjekt = currentProjekt;
  
  // ==========================================
  // LEVEL 3: Show Projekt-Detail View
  // ==========================================
  const projektOverview = document.getElementById('projekt-overview');
  const projektDetail = document.getElementById('projekt-detail-view');
  const artikelOverview = document.getElementById('artikel-overview');
  const artikelDetail = document.getElementById('artikel-detail-view');
  
  if (projektOverview) projektOverview.style.display = 'none';
  if (projektDetail) projektDetail.style.display = 'block';
  if (artikelOverview) artikelOverview.style.display = 'none';
  if (artikelDetail) artikelDetail.style.display = 'none';
  
  // Update breadcrumb & title
  const breadcrumb = document.getElementById('projekt-detail-breadcrumb');
  const title = document.getElementById('projekt-detail-title');
  if (breadcrumb) breadcrumb.textContent = projekt.name;
  if (title) title.textContent = projekt.name;
  
  // ==========================================
  // LEVEL 4: Restore Projekt-Detail Tab
  // ==========================================
  const currentProjektTab = state.currentProjektTab || 'uebersicht';
  console.log('📑 Restoring projekt tab:', currentProjektTab);
  
  // Wait for DOM to be ready
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Switch to the saved projekt tab
  if (window.switchProjektTab) {
    window.switchProjektTab(currentProjektTab);
  } else {
    console.error('❌ switchProjektTab function not available!');
  }
  
  // ==========================================
  // LEVEL 5: Restore Artikel-Detail (if applicable)
  // ==========================================
  const currentArtikel = state.currentArtikel;
  const artikelViewMode = state.artikelViewMode;
  
  if (currentArtikel && artikelViewMode === 'detail' && currentProjektTab === 'artikel') {
    console.log('📦 Restoring artikel detail:', currentArtikel);
    
    // Check if artikel exists
    const artikel = state.getArtikel(currentArtikel);
    if (!artikel) {
      console.warn('⚠️ Artikel not found:', currentArtikel);
      state.currentArtikel = null;
      state.artikelViewMode = 'list';
      state.saveState();
      return;
    }
    
    // Wait for artikel list to potentially render
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Open artikel detail
    if (window.openArtikelDetail) {
      window.openArtikelDetail(currentArtikel);
      
      // Restore scroll position
      if (state.artikelDetailScroll > 0) {
        setTimeout(() => {
          const artikelDetailView = document.getElementById('artikel-detail-view');
          if (artikelDetailView) {
            artikelDetailView.scrollTop = state.artikelDetailScroll;
          }
        }, 300);
      }
    }
  }
  
  console.log('✅ COMPLETE navigation state restored');
}

// ==========================================
// UI STATE MANAGEMENT
// ==========================================

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
  if (!activeTab) return 'cockpit';
  
  const onclick = activeTab.getAttribute('onclick');
  const match = onclick?.match(/switchTab\('(.+?)'\)/);
  return match ? match[1] : 'cockpit';
}

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
    
    // ESC - Close detail views
    if (e.key === 'Escape') {
      if (window.cfoDashboard.currentArtikel) {
        window.closeArtikelDetail?.();
      } else if (window.cfoDashboard.currentProjekt) {
        window.closeProjektDetail?.();
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
    text: 'System bereit. Portfolio geladen.',
    timestamp: 'System-Start'
  });

  console.log('✅ AI Controller initialized');
}

/**
 * Start AI insights timer (periodic insights)
 */
function startAIInsightsTimer() {
  const insights = [
    { title: 'Portfolio-Insight', text: 'Durchschnittlicher NPV über Benchmark.', level: 'insight' },
    { title: 'Projekt-Status', text: '5 von 8 Projekten aktiv.', level: 'info' },
    { title: 'Performance', text: 'Portfolio-NPV bei 127M€.', level: 'success' }
  ];

  setInterval(() => {
    if (window.cfoDashboard.aiController && Math.random() > 0.7) {
      const randomInsight = insights[Math.floor(Math.random() * insights.length)];
      window.cfoDashboard.aiController.addAIMessage({
        ...randomInsight,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  }, 60000); // Every 60 seconds with 30% chance
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
    'artikel': 'Artikel',
    'performance': 'Performance',
    'admin': 'Admin'
  };
  return names[tabName] || tabName;
}

/**
 * Format currency
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

// ==========================================
// AUTO-INITIALIZATION
// ==========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  initializeApplication();
}

// ==========================================
// GLOBAL EXPORTS
// ==========================================

// Tutorial Controller global verfügbar machen
window.tutorialController = tutorialController;

// Export to window for debugging
window.cfoDashboardMain = {
  state,
  helpers,
  api,
  charts,
  cockpit,
  saveNavigationState,
  showErrorNotification,
  formatCurrency,
  formatPercentage
};

// ==========================================
// EXPORTS FOR MODULES
// ==========================================

export {
  initializeApplication,
  showErrorNotification,
};

console.log('📦 Main module loaded');
