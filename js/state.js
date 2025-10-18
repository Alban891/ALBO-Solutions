/**
 * CFO Dashboard – State Management (v3.2)
 * ========================================
 * Centralized state with localStorage persistence.
 * Handles full navigation restore, data caching, and validation.
 * Compatible with main.js v3.2 and index.html v3.2.
 */

class DashboardState {
  constructor() {
    // ==========================================
    // BASE STATE CONFIGURATION
    // ==========================================
    this.version = '3.2';
    this.debug = true; // set false for production builds
    this.initialized = false;

    // ==========================================
    // NAVIGATION STATE
    // ==========================================
    this.currentTab = 'cockpit';          // active main tab
    this.currentProjekt = null;           // selected project ID
    this.projektViewMode = 'overview';    // 'overview' | 'detail'
    this.projektListView = 'liste';       // 'liste' | 'karten' | 'kompakt'
    this.currentProjektTab = null;        // project sub-tab (uebersicht, artikel, etc.)

    this.currentArtikel = null;           // selected article ID
    this.artikelViewMode = 'list';        // 'list' | 'detail'
    this.artikelDetailScroll = 0;         // scroll pos inside detail

    // Legacy compatibility
    this.currentDetailTab = 'artikel';

    // ==========================================
    // DATA STORAGE
    // ==========================================
    this.projektData = {};
    this.artikelData = {};
    this.personalDetails = {};

    // ==========================================
    // DASHBOARD VALUES (adjustable KPIs)
    // ==========================================
    this.currentValues = {
      marketVolume: 100,
      pricePremium: 100,
      capexRisk: 100,
      revenue: 174.0,
      payback: 3.4,
      npv: 44.7,
      db2Margin: 34
    };

    // ==========================================
    // LOAD / ERROR MANAGEMENT
    // ==========================================
    this.isLoading = false;
    this.loadingResources = {};
    this.errors = [];

    if (this.debug) {
      console.log('✅ DashboardState initialized', {
        tab: this.currentTab,
        projektViewMode: this.projektViewMode,
        artikelViewMode: this.artikelViewMode,
        projektListView: this.projektListView
      });
    }
  }

  // ==========================================================
  // LOADING & ERROR HANDLING
  // ==========================================================
  setLoading(resource, loading = true) {
    this.loadingResources[resource] = loading;
    this.isLoading = Object.values(this.loadingResources).some(v => v === true);
    if (this.debug) console.log(`⏳ Loading [${resource}] = ${loading}`);
  }

  setError(context, error) {
    this.errors.push({
      context,
      error,
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
    console.error(`❌ Error in ${context}:`, error);
  }

  getErrors() { return this.errors; }
  clearErrors() { this.errors = []; }

  // ==========================================================
  // VALIDATION
  // ==========================================================
  validateProjektData(data) {
    if (!data.name?.trim()) throw new Error('Projektname ist erforderlich');
    if (!data.status) throw new Error('Projektstatus ist erforderlich');
    return true;
  }

  validateArtikelData(data) {
    if (!data.name?.trim()) throw new Error('Artikelname ist erforderlich');
    if (!data.projektId) throw new Error('Projekt-ID ist erforderlich');
    return true;
  }

  // ==========================================================
  // PROJEKT MANAGEMENT
  // ==========================================================
  getAllProjekte() { return Object.values(this.projektData); }
  getProjekt(id) { return this.projektData[id] || null; }

  setProjekt(id, data) {
    this.projektData[id] = { ...data, id, updated_at: new Date().toISOString() };
    this.saveState();
  }

  addProjekt(projekt) {
    const id = projekt.id || `projekt-${Date.now()}`;
    this.setProjekt(id, { ...projekt, created_at: projekt.created_at || new Date().toISOString() });
    return id;
  }

  updateProjekt(id, updates) {
    if (!this.projektData[id]) return false;
    this.projektData[id] = {
      ...this.projektData[id],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveState();
    return true;
  }

  deleteProjekt(id) {
    if (!this.projektData[id]) return false;
    delete this.projektData[id];

    // Remove related articles
    Object.keys(this.artikelData).forEach(aid => {
      if (this.artikelData[aid].projektId === id) delete this.artikelData[aid];
    });

    this.saveState();
    return true;
  }

  // ==========================================================
  // ARTIKEL MANAGEMENT
  // ==========================================================
  getAllArtikel() { return Object.values(this.artikelData); }
  getArtikel(id) { return this.artikelData[id] || null; }

  getArtikelByProjekt(pid) {
    return Object.values(this.artikelData).filter(a => a.projektId === pid);
  }

  setArtikel(id, data) {
    this.artikelData[id] = { ...data, id, updated_at: new Date().toISOString() };

    // also update reference in project
    if (data.projektId) {
      const projekt = this.getProjekt(data.projektId);
      if (projekt) {
        projekt.artikel = projekt.artikel || [];
        projekt.artikel = projekt.artikel.filter(a => a.id !== id);
        projekt.artikel.push(this.artikelData[id]);
      }
    }
    this.saveState();
  }

  addArtikel(data) {
    const id = data.id || `artikel-${Date.now()}`;
    this.setArtikel(id, { ...data, created_at: data.created_at || new Date().toISOString() });
    return id;
  }

  updateArtikel(id, updates) {
    if (!this.artikelData[id]) return false;
    const current = this.artikelData[id];
    this.setArtikel(id, { ...current, ...updates });
    return true;
  }

  deleteArtikel(id) {
    if (!this.artikelData[id]) return false;
    const pid = this.artikelData[id].projektId;
    delete this.artikelData[id];

    if (pid) {
      const projekt = this.getProjekt(pid);
      if (projekt?.artikel) {
        projekt.artikel = projekt.artikel.filter(a => a.id !== id);
      }
    }

    this.saveState();
    return true;
  }

  // ==========================================================
  // BULK SETTERS
  // ==========================================================
  setProjekte(arr) {
    arr.forEach(p => { this.projektData[p.id] = p; });
    this.saveState();
  }

  setArtikelList(arr) {
    arr.forEach(a => { this.artikelData[a.id] = a; });
    this.saveState();
  }

  // ==========================================================
  // PERSISTENCE (localStorage)
  // ==========================================================
  saveState() {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('⚠️ localStorage not available — skipping save');
        return false;
      }

      const stateToSave = {
        _version: this.version,
        currentTab: this.currentTab,
        currentProjekt: this.currentProjekt,
        projektViewMode: this.projektViewMode,
        projektListView: this.projektListView,
        currentProjektTab: this.currentProjektTab,
        currentArtikel: this.currentArtikel,
        artikelViewMode: this.artikelViewMode,
        artikelDetailScroll: this.artikelDetailScroll,
        currentDetailTab: this.currentDetailTab,
        currentValues: this.currentValues,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('cfo-dashboard-state', JSON.stringify(stateToSave));

      if (this.debug)
        console.log('💾 State saved', {
          tab: stateToSave.currentTab,
          projekt: stateToSave.currentProjekt,
          projektTab: stateToSave.currentProjektTab
        });

      return true;
    } catch (err) {
      console.error('❌ Failed to save state:', err);
      return false;
    }
  }

  restoreState() {
    try {
      const saved = localStorage.getItem('cfo-dashboard-state');
      if (!saved) {
        if (this.debug) console.log('ℹ️ No saved state found → using defaults');
        return false;
      }

      const s = JSON.parse(saved);

      this.currentTab = s.currentTab || 'cockpit';
      this.currentProjekt = s.currentProjekt || null;
      this.projektViewMode = s.projektViewMode || 'overview';
      this.projektListView = s.projektListView || 'liste';
      this.currentProjektTab = s.currentProjektTab || null;
      this.currentArtikel = s.currentArtikel || null;
      this.artikelViewMode = s.artikelViewMode || 'list';
      this.artikelDetailScroll = s.artikelDetailScroll || 0;
      this.currentDetailTab = s.currentDetailTab || 'artikel';
      if (s.currentValues) this.currentValues = { ...this.currentValues, ...s.currentValues };
      this.projektData = s.projektData || this.projektData || {};
      this.artikelData = s.artikelData || this.artikelData || {};
      this.version = s._version || 'legacy';
      this.initialized = true;

      if (this.debug)
        console.log('✅ State restored', {
          tab: this.currentTab,
          projekt: this.currentProjekt,
          projektTab: this.currentProjektTab,
          artikel: this.currentArtikel
        });

      return true;
    } catch (err) {
      console.error('❌ Failed to restore state:', err);
      return false;
    }
  }

  clearState() {
    localStorage.removeItem('cfo-dashboard-state');
    this.errors = [];
    this.loadingResources = {};
    if (this.debug) console.log('🧹 State cleared');
  }

  resetNavigation() {
    this.currentTab = 'cockpit';
    this.currentProjekt = null;
    this.projektViewMode = 'overview';
    this.currentProjektTab = null;
    this.currentArtikel = null;
    this.artikelViewMode = 'list';
    this.artikelDetailScroll = 0;
    this.saveState();
    if (this.debug) console.log('🔄 Navigation reset');
  }

  // ==========================================================
  // STATISTICS
  // ==========================================================
  getStatistics() {
    const projekte = this.getAllProjekte();
    const artikel = this.getAllArtikel();

    return {
      totalProjekte: projekte.length,
      totalArtikel: artikel.length,
      aktiveProjekte: projekte.filter(p => p.status?.toLowerCase() === 'aktiv').length,
      onHoldProjekte: projekte.filter(p => p.status?.toLowerCase() === 'on hold').length,
      abgeschlosseneProjekte: projekte.filter(p => p.status?.toLowerCase() === 'abgeschlossen').length,
      artikelByProjekt: projekte.map(p => ({
        projektId: p.id,
        projektName: p.name,
        artikelCount: this.getArtikelByProjekt(p.id).length
      }))
    };
  }
}

// Singleton export
export const state = new DashboardState();
window.dashboardState = state;

console.log('📦 state.js v3.2 loaded and ready');
