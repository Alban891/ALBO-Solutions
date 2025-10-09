/**
 * CFO Dashboard - State Management
 * Centralized state with localStorage persistence
 */

class DashboardState {
  constructor() {
    // ==========================================
    // COMPLETE NAVIGATION STATE
    // ==========================================
    
    // Level 1: Main Tab
    this.currentView = 'dashboard';
    this.currentTab = 'cockpit';
    
    // Level 2: Projekt Navigation
    this.currentProjekt = null;           // Which projekt is open?
    this.projektViewMode = 'overview';    // 'overview' | 'detail'
    this.projektListView = 'liste';       // 'liste' | 'karten' | 'kompakt'
    
    // Level 3: Projekt-Detail Tabs
    this.currentProjektTab = null;        // 'uebersicht' | 'artikel' | 'projektkosten' | 'wirtschaftlichkeit' | 'dashboard'
    
    // Level 4: Artikel Navigation
    this.currentArtikel = null;           // Which artikel is open?
    this.artikelViewMode = 'list';        // 'list' | 'detail'
    
    // Level 5: Artikel-Detail
    this.artikelDetailScroll = 0;         // Scroll position in artikel detail
    
    // Legacy (for compatibility)
    this.currentDetailTab = 'artikel';

    // Data Storage - Isolated per session
    this.projektData = {};
    this.artikelData = {};
    this.personalDetails = {};

    // Current Dashboard Values
    this.currentValues = {
      marketVolume: 100,
      pricePremium: 100,
      capexRisk: 100,
      revenue: 174.0,
      payback: 3.4,
      npv: 44.7,
      db2Margin: 34
    };
  }

  // ==========================================
  // PROJEKT MANAGEMENT
  // ==========================================

  getAllProjekte() {
    return Object.values(this.projektData);
  }

  getProjekt(projektId) {
    return this.projektData[projektId];
  }

  addProjekt(projekt) {
    const id = projekt.id || `projekt-${Date.now()}`;
    this.projektData[id] = {
      ...projekt,
      id,
      created_at: projekt.created_at || new Date().toISOString()
    };
    this.saveState();
    return id;
  }

  updateProjekt(projektId, updates) {
    if (this.projektData[projektId]) {
      this.projektData[projektId] = {
        ...this.projektData[projektId],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.saveState();
      return true;
    }
    return false;
  }

  deleteProjekt(projektId) {
    if (this.projektData[projektId]) {
      delete this.projektData[projektId];
      
      // Also delete associated articles
      Object.keys(this.artikelData).forEach(artikelId => {
        if (this.artikelData[artikelId].projekt_id === projektId) {
          delete this.artikelData[artikelId];
        }
      });
      
      this.saveState();
      return true;
    }
    return false;
  }

  // ==========================================
  // ARTIKEL MANAGEMENT
  // ==========================================

  getAllArtikel() {
    return Object.values(this.artikelData);
  }

  getArtikel(artikelId) {
    return this.artikelData[artikelId];
  }

  getArtikelByProjekt(projektId) {
    return Object.values(this.artikelData).filter(
      artikel => artikel.projekt_id === projektId
    );
  }

  addArtikel(artikel) {
    const id = artikel.id || `artikel-${Date.now()}`;
    this.artikelData[id] = {
      ...artikel,
      id,
      created_at: artikel.created_at || new Date().toISOString()
    };
    this.saveState();
    return id;
  }

  updateArtikel(artikelId, updates) {
    if (this.artikelData[artikelId]) {
      this.artikelData[artikelId] = {
        ...this.artikelData[artikelId],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.saveState();
      return true;
    }
    return false;
  }

  deleteArtikel(artikelId) {
    if (this.artikelData[artikelId]) {
      delete this.artikelData[artikelId];
      this.saveState();
      return true;
    }
    return false;
  }

  // ==========================================
  // BULK OPERATIONS
  // ==========================================

  setProjekte(projekte) {
    projekte.forEach(projekt => {
      this.projektData[projekt.id] = projekt;
    });
    this.saveState();
  }

  setArtikel(artikel) {
    artikel.forEach(art => {
      this.artikelData[art.id] = art;
    });
    this.saveState();
  }

  // ==========================================
  // PERSISTENCE
  // ==========================================

  /**
   * Save COMPLETE navigation state to localStorage
   * This ensures user stays on exact page after refresh
   */
  saveState() {
    try {
      const stateToSave = {
        // Level 1: Main Tab
        currentView: this.currentView,
        currentTab: this.currentTab,
        
        // Level 2: Projekt Navigation
        currentProjekt: this.currentProjekt,
        projektViewMode: this.projektViewMode,
        projektListView: this.projektListView,
        
        // Level 3: Projekt-Detail Tabs
        currentProjektTab: this.currentProjektTab,
        
        // Level 4: Artikel Navigation
        currentArtikel: this.currentArtikel,
        artikelViewMode: this.artikelViewMode,
        
        // Level 5: Artikel-Detail
        artikelDetailScroll: this.artikelDetailScroll,
        
        // Legacy
        currentDetailTab: this.currentDetailTab,
        
        // Dashboard Values
        currentValues: this.currentValues,
        
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('cfo-dashboard-state', JSON.stringify(stateToSave));
      
      // ✓ DEBUG OUTPUT
      console.log('💾 State saved to localStorage:', stateToSave);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to save state:', error);
      return false;
    }
  }

  /**
   * Restore COMPLETE navigation state from localStorage
   * This ensures user returns to exact page after refresh
   */
  restoreState() {
    try {
      const savedState = localStorage.getItem('cfo-dashboard-state');
      if (!savedState) {
        console.log('ℹ️ No saved state found - using defaults');
        return false;
      }

      const state = JSON.parse(savedState);
      
      // Level 1: Main Tab
      this.currentView = state.currentView || 'dashboard';
      this.currentTab = state.currentTab || 'cockpit';
      
      // Level 2: Projekt Navigation
      this.currentProjekt = state.currentProjekt || null;
      this.projektViewMode = state.projektViewMode || 'overview';
      this.projektListView = state.projektListView || 'liste';
      
      // Level 3: Projekt-Detail Tabs
      this.currentProjektTab = state.currentProjektTab || null;
      
      // Level 4: Artikel Navigation
      this.currentArtikel = state.currentArtikel || null;
      this.artikelViewMode = state.artikelViewMode || 'list';
      
      // Level 5: Artikel-Detail
      this.artikelDetailScroll = state.artikelDetailScroll || 0;
      
      // Legacy
      this.currentDetailTab = state.currentDetailTab || 'artikel';
      
      // Dashboard Values
      if (state.currentValues) {
        this.currentValues = { ...this.currentValues, ...state.currentValues };
      }

      console.log('✅ State restored:', {
        tab: this.currentTab,
        projekt: this.currentProjekt,
        projektTab: this.currentProjektTab,
        artikel: this.currentArtikel,
        viewMode: this.projektViewMode
      });
      
      return true;
    } catch (error) {
      console.error('Failed to restore state:', error);
      return false;
    }
  }

  clearState() {
    localStorage.removeItem('cfo-dashboard-state');
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  getStatistics() {
    const projekte = this.getAllProjekte();
    const artikel = this.getAllArtikel();

    return {
      totalProjekte: projekte.length,
      totalArtikel: artikel.length,
      artikelByProjekt: projekte.map(p => ({
        projektId: p.id,
        projektName: p.name,
        artikelCount: this.getArtikelByProjekt(p.id).length
      }))
    };
  }
}

// Create singleton instance
export const state = new DashboardState();

// Expose for debugging
window.dashboardState = state;

console.log('📦 State module loaded');
