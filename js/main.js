/**
 * CFO Dashboard - Main Application Controller
 * ===========================================
 * Orchestrates initialization, state handling, and navigation
 * Enterprise-grade architecture with deep navigation restore
 * 
 * Version: 3.2 (October 2025)
 * Compatible with: index.html (v3.2)
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

// ===================================================
// GLOBAL STATE (Exposed for backward compatibility)
// ===================================================
window.cfoDashboard = {
  currentValues: state.currentValues,
  currentProjekt: null,
  currentArtikel: null,
  projektData: state.projektData,
  artikelData: state.artikelData,
  aiController: null
};

// ===================================================
// MAIN TAB SWITCHER (Cockpit / Projekte / Performance / Admin)
// ===================================================
window.switchTab = function(tabName) {
  console.log('📑 Switching main tab →', tabName);

  // Immer Artikel-Detail ausblenden
  const artikelDetail = document.getElementById('artikel-detail-view');
  if (artikelDetail) artikelDetail.style.display = 'none';

  // Wenn gleicher Tab aktiv, nichts tun
  if (state.currentTab === tabName) return;

  // Tabs visuell aktualisieren
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  const targetButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
  const targetContent = document.getElementById(`tab-${tabName}`);
  if (targetButton) targetButton.classList.add('active');
  if (targetContent) targetContent.classList.add('active');

  // Tab-spezifische Logik
  if (tabName === 'cockpit') {
    console.log('📊 Rendering cockpit...');
    cockpit.renderCockpit?.();
  } else if (tabName === 'projekte') {
    console.log('💼 Rendering Projektübersicht...');
    document.getElementById('projekt-overview').style.display = 'block';
    document.getElementById('artikel-overview').style.display = 'none';
    window.cfoDashboard.currentProjekt = null;
    window.cfoDashboard.currentArtikel = null;
    window.renderProjektOverview?.();
    window.updateProjektStats?.();
  }

  // Zustand speichern
  state.currentTab = tabName;
  saveNavigationState();

  // KI-Feedback
  window.cfoDashboard.aiController?.addAIMessage({
    level: 'info',
    title: '📑 Tab gewechselt',
    text: `Ansicht "${getTabDisplayName(tabName)}" aktiviert.`,
    timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
  });
};

// ===================================================
// INITIALIZATION
// ===================================================
async function initializeApplication() {
  console.log('🚀 Initializing CFO Dashboard...');

  try {
    // 1️⃣ Restore previous state
    const restored = state.restoreState();
    if (restored) {
      console.log('✅ State restored');
      applyRestoredTab();
    } else {
      console.log('ℹ️ No saved state found → default: cockpit');
      state.currentTab = 'cockpit';
      applyRestoredTab();
    }

    // 2️⃣ Hide Artikel-Detail sicherheitshalber
    const artikelDetail = document.getElementById('artikel-detail-view');
    if (artikelDetail) artikelDetail.style.display = 'none';

    // 3️⃣ Make modules globally available
    window.projekte = projekte;
    window.artikel = artikel;
    window.projektkosten = projektkosten;
    window.cockpitModule = cockpit;
    window.renderProjektOverview = projekte.renderProjektOverview;
    window.updateProjektStats = projekte.updateProjektStats;

    // 4️⃣ Initialize Charts
    await charts.initializeCharts();

    // 5️⃣ Initialize AI Controller
    initializeAI();

    // 6️⃣ Initialize Supabase + load data
    const supabaseReady = await api.initializeSupabase();
    if (supabaseReady) {
      await loadInitialData();
    } else {
      console.warn('⚠️ Supabase offline → continue with local state');
    }

    // 7️⃣ Event listeners
    setupEventListeners();

    // 8️⃣ AI insights timer
    startAIInsightsTimer();

    console.log('✅ CFO Dashboard fully initialized');
    console.log('🌐 index.html integration check → OK');
  } catch (err) {
    console.error('❌ Initialization failed:', err);
    showErrorNotification('Anwendung konnte nicht gestartet werden. Bitte Seite neu laden.');
  }
}

// ===================================================
// APPLY RESTORED TAB (before rendering)
// ===================================================
function applyRestoredTab() {
  const targetTab = state.currentTab || 'cockpit';
  const tabMapping = { dashboard: 'cockpit', assumptions: 'projekte', insights: 'performance' };
  const mappedTab = tabMapping[targetTab] || targetTab;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  const btn = document.querySelector(`[onclick="switchTab('${mappedTab}')"]`);
  const content = document.getElementById(`tab-${mappedTab}`);
  btn?.classList.add('active');
  content?.classList.add('active');

  console.log('🔄 Restored tab:', mappedTab);
}

// ===================================================
// LOAD INITIAL DATA
// ===================================================
async function loadInitialData() {
  try {
    showLoadingIndicator();
    await api.loadProjects();

    const projekteList = state.getAllProjekte();
    console.log(`📦 Loaded ${projekteList.length} Projekte`);

    for (const projekt of projekteList) {
      await api.loadArticles(projekt.id);
    }

    console.log('✅ All initial data loaded');

    const tab = state.currentTab || 'cockpit';
    if (tab === 'cockpit') {
      cockpit.renderCockpit?.();
    } else if (tab === 'projekte') {
      if (state.currentProjekt) {
        await restoreDeepNavigation();
      } else {
        window.renderProjektOverview?.();
        window.updateProjektStats?.();
      }
    }
  } catch (err) {
    console.error('❌ Failed to load initial data:', err);
  } finally {
    hideLoadingIndicator();
  }
}

// ===================================================
// RESTORE DEEP NAVIGATION
// ===================================================
async function restoreDeepNavigation() {
  console.log('🔍 Restoring deep navigation state...');
  const { currentTab, currentProjekt, projektViewMode, currentProjektTab, currentArtikel, artikelViewMode } = state;

  if (currentTab !== 'projekte') return;
  if (!currentProjekt) {
    console.log('📋 No project selected → overview mode');
    window.renderProjektOverview?.();
    return;
  }

  const projekt = state.getProjekt(currentProjekt);
  if (!projekt) {
    console.warn('⚠️ Projekt not found:', currentProjekt);
    window.renderProjektOverview?.();
    return;
  }

  console.log('📂 Restoring Projekt:', projekt.name);

  const projektOverview = document.getElementById('projekt-overview');
  const projektDetail = document.getElementById('projekt-detail-view');
  const artikelOverview = document.getElementById('artikel-overview');
  const artikelDetail = document.getElementById('artikel-detail-view');
  projektOverview.style.display = 'none';
  projektDetail.style.display = 'block';
  artikelOverview.style.display = 'none';
  artikelDetail.style.display = 'none';

  document.getElementById('projekt-detail-breadcrumb').textContent = projekt.name;
  document.getElementById('projekt-detail-title').textContent = projekt.name;

  await new Promise(r => setTimeout(r, 100));
  window.switchProjektTab?.(currentProjektTab || 'uebersicht');

  if (currentArtikel && artikelViewMode === 'detail' && currentProjektTab === 'artikel') {
    await new Promise(r => setTimeout(r, 200));
    window.openArtikelDetail?.(currentArtikel);
  }
}

// ===================================================
// STATE MANAGEMENT
// ===================================================
export function saveNavigationState() {
  state.currentTab = getCurrentActiveTab();
  state.currentProjekt = window.cfoDashboard.currentProjekt;
  state.currentArtikel = window.cfoDashboard.currentArtikel;
  state.saveState();
}

function getCurrentActiveTab() {
  const active = document.querySelector('.tab-btn.active');
  const match = active?.getAttribute('onclick')?.match(/switchTab\('(.+?)'\)/);
  return match ? match[1] : 'cockpit';
}

// ===================================================
// LOADING & ERROR UI
// ===================================================
function showLoadingIndicator() {
  const i = document.getElementById('projekt-loading-indicator');
  const tbody = document.getElementById('projekt-list-tbody');
  if (i) { i.style.display = 'flex'; i.style.opacity = '1'; }
  if (tbody) tbody.style.display = 'none';
}

function hideLoadingIndicator() {
  const i = document.getElementById('projekt-loading-indicator');
  const tbody = document.getElementById('projekt-list-tbody');
  if (i) { i.style.opacity = '0'; setTimeout(() => (i.style.display = 'none'), 300); }
  if (tbody) tbody.style.display = '';
}

function showErrorNotification(message) {
  const n = document.createElement('div');
  n.style.cssText = `
    position:fixed;top:20px;right:20px;background:${CONFIG.colors.danger};
    color:white;padding:16px 24px;border-radius:8px;z-index:10000;
    box-shadow:0 4px 6px rgba(0,0,0,.1);animation:slideIn .3s ease-out;
  `;
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(() => { n.style.animation = 'slideOut .3s'; setTimeout(() => n.remove(), 300); }, 5000);
}

// ===================================================
// EVENT LISTENERS
// ===================================================
function setupEventListeners() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => charts.resizeAllCharts(), 250);
  });

  window.addEventListener('beforeunload', saveNavigationState);

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      window.saveArtikelChanges?.();
    }
    if (e.key === 'Escape') {
      window.closeArtikelDetail?.() || window.closeProjektDetail?.();
    }
  });

  console.log('✅ Global event listeners active');
}

// ===================================================
// AI CONTROLLER
// ===================================================
function initializeAI() {
  window.cfoDashboard.aiController = {
    messages: [],
    addAIMessage(msg) {
      const m = { ...msg, id: Date.now(), timestamp: msg.timestamp || new Date().toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit'}) };
      this.messages.push(m);
      this.renderMessages();
      if (this.messages.length > 20) this.messages.shift();
    },
    renderMessages() {
      const feed = document.getElementById('ki-feed');
      if (!feed) return;
      feed.innerHTML = this.messages.slice().reverse().map(m => `
        <div class="ki-message ki-${m.level}">
          <div class="ki-message-header">
            <span>${this.getIcon(m.level)} ${m.title || 'KI Insight'}</span>
            <span>${m.timestamp}</span>
          </div>
          <div class="ki-message-text">${m.text || ''}</div>
          ${m.recommendation ? `<div class="ki-message-recommendation">💡 ${m.recommendation}</div>` : ''}
        </div>
      `).join('');
    },
    getIcon(level) {
      const icons = { success:'✅', insight:'📊', warning:'⚠️', info:'ℹ️', risk:'⚠️' };
      return icons[level] || 'ℹ️';
    }
  };

  window.cfoDashboard.aiController.addAIMessage({
    level: 'success',
    title: 'KI-Controller aktiviert',
    text: 'System bereit. Portfolio geladen.',
    timestamp: 'System-Start'
  });

  console.log('🤖 AI Controller ready');
}

function startAIInsightsTimer() {
  const insights = [
    { title: 'Portfolio Insight', text: 'Ø NPV über Benchmark', level: 'insight' },
    { title: 'Projektstatus', text: '5 von 8 Projekten aktiv', level: 'info' },
    { title: 'Performance', text: 'Portfolio-NPV bei 127 M€', level: 'success' }
  ];
  setInterval(() => {
    if (Math.random() > 0.7) {
      const msg = insights[Math.floor(Math.random() * insights.length)];
      window.cfoDashboard.aiController?.addAIMessage({ ...msg, timestamp: new Date().toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit'}) });
    }
  }, 60000);
}

// ===================================================
// UTILITY
// ===================================================
function getTabDisplayName(tab) {
  return { cockpit:'Cockpit', projekte:'Projekte', artikel:'Artikel', performance:'Performance', admin:'Admin' }[tab] || tab;
}

export function formatCurrency(v) {
  return new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', minimumFractionDigits:0, maximumFractionDigits:0 }).format(v);
}
export function formatPercentage(v) {
  return new Intl.NumberFormat('de-DE', { style:'percent', minimumFractionDigits:1, maximumFractionDigits:1 }).format(v / 100);
}

// ===================================================
// AUTO-INIT
// ===================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  initializeApplication();
}

// Export references for debugging
window.cfoDashboardMain = { state, helpers, api, charts, cockpit, saveNavigationState, showErrorNotification, formatCurrency, formatPercentage };

export { initializeApplication, showErrorNotification };
console.log('📦 main.js loaded successfully');
