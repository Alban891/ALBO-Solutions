/**
 * CFO Dashboard - State Management
 * Centralized state with localStorage persistence
 * COMPLETE VERSION with all navigation state variables and API methods
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
    
    // Loading and Error States
    this.isLoading = false;
    this.loadingResources = {};
    this.errors = [];
    
    console.log('✅ DashboardState initialized with navigation variables:', {
      currentProjektTab: this.currentProjektTab,
      projektViewMode: this.projektViewMode,
      artikelViewMode: this.artikelViewMode,
      projektListView: this.projektListView
    });
  }

  // ==========================================
  // LOADING & ERROR MANAGEMENT
  // ==========================================

  /**
   * Set loading state for a specific resource
   * @param {string} resource - Resource name (e.g., 'projekte', 'artikel')
   * @param {boolean} loading - Loading state
   */
  setLoading(resource, loading = true) {
    this.loadingResources[resource] = loading;
    this.isLoading = Object.values(this.loadingResources).some(l => l === true);
    console.log(`⏳ Loading ${resource}: ${loading}`);
  }

  /**
   * Add error to error log
   * @param {string} context - Context where error occurred
   * @param {Error} error - Error object
   */
  setError(context, error) {
    this.errors.push({ 
      context, 
      error, 
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error'
    });
    console.error(`❌ Error in ${context}:`, error);
  }

  /**
   * Get all errors
   * @returns {Array} Array of errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = [];
  }

  // ==========================================
  // DATA VALIDATION
  // ==========================================

  /**
   * Validate project data before save
   * @param {object} projektData - Project data to validate
   * @returns {boolean} Is valid
   * @throws {Error} If validation fails
   */
  validateProjektData(projektData) {
    if (!projektData.name || projektData.name.trim() === '') {
      throw new Error('Projektname ist erforderlich');
    }
    if (!projektData.status) {
      throw new Error('Projektstatus ist erforderlich');
    }
    return true;
  }

  /**
   * Validate artikel data before save
   * @param {object} artikelData - Artikel data to validate
   * @returns {boolean} Is valid
   * @throws {Error} If validation fails
   */
  validateArtikelData(artikelData) {
    if (!artikelData.name || artikelData.name.trim() === '') {
      throw new Error('Artikelname ist erforderlich');
    }
    if (!artikelData.projektId) {
      throw new Error('Projekt-ID ist erforderlich');
    }
    return true;
  }

  // ==========================================
  // PROJEKT MANAGEMENT
  // ==========================================

  /**
   * Get all projects
   * @returns {Array} Array of projects
   */
  getAllProjekte() {
    return Object.values(this.projektData);
  }

  /**
   * Get single project
   * @param {string} projektId - Project ID
   * @returns {object|null} Project or null
   */
  getProjekt(projektId) {
    return this.projektData[projektId] || null;
  }

  /**
   * Set/Update project (used by API)
   * @param {string} projektId - Project ID
   * @param {object} projektData - Project data
   */
  setProjekt(projektId, projektData) {
    this.projektData[projektId] = {
      ...projektData,
      id: projektId,
      updated_at: new Date().toISOString()
    };
    this.saveState();
  }

  /**
   * Add new project
   * @param {object} projekt - Project data
   * @returns {string} Project ID
   */
  addProjekt(projekt) {
    const id = projekt.id || `projekt-${Date.now()}`;
    this.setProjekt(id, {
      ...projekt,
      created_at: projekt.created_at || new Date().toISOString()
    });
    return id;
  }

  /**
   * Update existing project
   * @param {string} projektId - Project ID
   * @param {object} updates - Updates to apply
   * @returns {boolean} Success
   */
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

  /**
   * Delete project
   * @param {string} projektId - Project ID
   * @returns {boolean} Success
   */
  deleteProjekt(projektId) {
    if (this.projektData[projektId]) {
      delete this.projektData[projektId];
      
      // Also delete associated articles
      Object.keys(this.artikelData).forEach(artikelId => {
        if (this.artikelData[artikelId].projektId === projektId) {
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

  /**
   * Get all articles
   * @returns {Array} Array of articles
   */
  getAllArtikel() {
    return Object.values(this.artikelData);
  }

  /**
   * Get single article
   * @param {string} artikelId - Article ID
   * @returns {object|null} Article or null
   */
  getArtikel(artikelId) {
    return this.artikelData[artikelId] || null;
  }

  /**
   * Get articles by project
   * @param {string} projektId - Project ID
   * @returns {Array} Array of articles
   */
  getArtikelByProjekt(projektId) {
    return Object.values(this.artikelData).filter(
      artikel => artikel.projektId === projektId
    );
  }

  /**
   * Set/Update article (used by API)
   * @param {string} artikelId - Article ID
   * @param {object} artikelData - Article data
   */
  setArtikel(artikelId, artikelData) {
    this.artikelData[artikelId] = {
      ...artikelData,
      id: artikelId,
      updated_at: new Date().toISOString()
    };
    
    // Also update the projekt's artikel array
    if (artikelData.projektId) {
      const projekt = this.getProjekt(artikelData.projektId);
      if (projekt) {
        if (!projekt.artikel) {
          projekt.artikel = [];
        }
        // Remove old version if exists
        projekt.artikel = projekt.artikel.filter(a => a.id !== artikelId);
        // Add new version
        projekt.artikel.push(this.artikelData[artikelId]);
      }
    }
    
    this.saveState();
  }

  /**
   * Add new article
   * @param {object} artikel - Article data
   * @returns {string} Article ID
   */
  addArtikel(artikel) {
    const id = artikel.id || `artikel-${Date.now()}`;
    this.setArtikel(id, {
      ...artikel,
      created_at: artikel.created_at || new Date().toISOString()
    });
    return id;
  }

  /**
   * Update existing article
   * @param {string} artikelId - Article ID
   * @param {object} updates - Updates to apply
   * @returns {boolean} Success
   */
  updateArtikel(artikelId, updates) {
    if (this.artikelData[artikelId]) {
      const currentArtikel = this.artikelData[artikelId];
      this.setArtikel(artikelId, {
        ...currentArtikel,
        ...updates
      });
      return true;
    }
    return false;
  }

  /**
   * Delete article
   * @param {string} artikelId - Article ID
   * @returns {boolean} Success
   */
  deleteArtikel(artikelId) {
    if (this.artikelData[artikelId]) {
      const projektId = this.artikelData[artikelId].projektId;
      
      // Remove from artikel data
      delete this.artikelData[artikelId];
      
      // Remove from projekt's artikel array
      if (projektId) {
        const projekt = this.getProjekt(projektId);
        if (projekt && projekt.artikel) {
          projekt.artikel = projekt.artikel.filter(a => a.id !== artikelId);
        }
      }
      
      this.saveState();
      return true;
    }
    return false;
  }

  // ==========================================
  // BULK OPERATIONS
  // ==========================================

  /**
   * Set multiple projects at once
   * @param {Array} projekte - Array of projects
   */
  setProjekte(projekte) {
    projekte.forEach(projekt => {
      this.projektData[projekt.id] = projekt;
    });
    this.saveState();
  }

  /**
   * Set multiple articles at once
   * @param {Array} artikel - Array of articles
   */
  setArtikelList(artikel) {
    artikel.forEach(art => {
      this.artikelData[art.id] = art;
    });
    this.saveState();
  }

  // ==========================================
  // PERSISTENCE
  // ==========================================

  /**
   * Save COMPLETE state to localStorage
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
        
        // Data (optional - can be large)
        // projektData: this.projektData,
        // artikelData: this.artikelData,
        
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('cfo-dashboard-state', JSON.stringify(stateToSave));
      
      // ✓ DEBUG OUTPUT
      console.log('💾 State saved to localStorage:', {
        tab: stateToSave.currentTab,
        projekt: stateToSave.currentProjekt,
        projektTab: stateToSave.currentProjektTab
      });
      
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
      
      // Data (if saved)
      // if (state.projektData) {
      //   this.projektData = state.projektData;
      // }
      // if (state.artikelData) {
      //   this.artikelData = state.artikelData;
      // }

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

  /**
   * Clear all saved state
   */
  clearState() {
    localStorage.removeItem('cfo-dashboard-state');
    this.errors = [];
    this.loadingResources = {};
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  /**
   * Get statistics about current data
   * @returns {object} Statistics object
   */
  getStatistics() {
    const projekte = this.getAllProjekte();
    const artikel = this.getAllArtikel();

    return {
      totalProjekte: projekte.length,
      totalArtikel: artikel.length,
      aktiveProjekte: projekte.filter(p => p.status === 'Aktiv').length,
      onHoldProjekte: projekte.filter(p => p.status === 'On Hold').length,
      abgeschlosseneProjekte: projekte.filter(p => p.status === 'Abgeschlossen').length,
      artikelByProjekt: projekte.map(p => ({
        projektId: p.id,
        projektName: p.name,
        artikelCount: this.getArtikelByProjekt(p.id).length
      }))
    };
  }
}

// ==========================================
// GESCHÄFTSMODELL HELPERS
// ==========================================

/**
 * Create default geschaeftsmodell structure based on artikel type
 */
export function createDefaultGeschaeftsmodell(artikelTyp, zielmarkt = 'B2B') {
  // Default: Einfaches Modell
  let komponenten = [
    {
      id: 1,
      name: "Einmaliger Verkauf",
      typ: "einmalig",
      preis: 0,
      jahre: [1],
      wachstum: 0,
      optional: false
    }
  ];

  // ALBO's Empfehlungen basierend auf Typ
  if (artikelTyp === 'Software') {
    komponenten = [
      {
        id: 1,
        name: "Software-Lizenz",
        typ: "einmalig",
        preis: 50000,
        jahre: [1],
        wachstum: 0,
        optional: false,
        beschreibung: "Einmalige Lizenzgebühr für unbegrenzte Nutzung"
      },
      {
        id: 2,
        name: "Support & Updates",
        typ: "wiederkehrend",
        preis: 8000,
        jahre: [1,2,3,4,5,6,7],
        wachstum: 2,
        optional: false,
        beschreibung: "Jährlicher Support-Vertrag inkl. Updates"
      },
      {
        id: 3,
        name: "Cloud Hosting",
        typ: "wiederkehrend",
        preis: 2000,
        jahre: [1,2,3,4,5,6,7],
        wachstum: 3,
        optional: true,
        beschreibung: "Optionales Cloud-Hosting mit Skalierung"
      }
    ];
  } else if (artikelTyp === 'Hardware') {
    komponenten = [
      {
        id: 1,
        name: "Hardware-Verkauf",
        typ: "einmalig",
        preis: 0,
        jahre: [1],
        wachstum: 0,
        optional: false,
        beschreibung: "Einmaliger Hardware-Verkauf"
      },
      {
        id: 2,
        name: "Service-Vertrag",
        typ: "wiederkehrend",
        preis: 0,
        jahre: [1,2,3,4,5],
        wachstum: 2,
        optional: true,
        beschreibung: "Optionaler Wartungs- und Service-Vertrag"
      }
    ];
  } else if (artikelTyp === 'Service') {
    komponenten = [
      {
        id: 1,
        name: "Service-Leistung",
        typ: "wiederkehrend",
        preis: 0,
        jahre: [1,2,3,4,5],
        wachstum: 2,
        optional: false,
        beschreibung: "Monatliche/Jährliche Service-Gebühr"
      }
    ];
  }

  return {
    typ: komponenten.length > 1 ? "hybrid" : "einfach",
    komponenten: komponenten,
    albo_empfohlen: true,
    erstellt_am: new Date().toISOString()
  };
}

/**
 * Calculate revenue from geschaeftsmodell for a specific year
 */
export function calculateGeschaeftsmodellRevenue(geschaeftsmodell, jahr, menge = 1) {
  if (!geschaeftsmodell || !geschaeftsmodell.komponenten) return 0;
  
  let revenue = 0;
  
  geschaeftsmodell.komponenten.forEach(komponente => {
    // Skip optional components that are disabled
    if (komponente.optional && komponente.deaktiviert) return;
    
    // Check if this component applies to this year
    if (komponente.jahre.includes(jahr)) {
      let preis = komponente.preis;
      
      // Apply growth rate
      const jahreSeitStart = jahr - komponente.jahre[0];
      if (jahreSeitStart > 0 && komponente.wachstum) {
        preis = preis * Math.pow(1 + (komponente.wachstum / 100), jahreSeitStart);
      }
      
      revenue += preis * menge;
    }
  });
  
  return revenue;
}

/**
 * Calculate total revenue across all years
 */
export function calculateGeschaeftsmodellTotalRevenue(geschaeftsmodell, zeitraum = 5, mengen = {}) {
  let total = 0;
  
  for (let jahr = 1; jahr <= zeitraum; jahr++) {
    const menge = mengen[jahr] || 1;
    total += calculateGeschaeftsmodellRevenue(geschaeftsmodell, jahr, menge);
  }
  
  return total;
}

/**
 * Calculate ARR (Annual Recurring Revenue) from year 2 onwards
 */
export function calculateARR(geschaeftsmodell, menge = 1) {
  if (!geschaeftsmodell || !geschaeftsmodell.komponenten) return 0;
  
  let arr = 0;
  
  geschaeftsmodell.komponenten.forEach(komponente => {
    if (komponente.typ === 'wiederkehrend' && !komponente.optional) {
      arr += komponente.preis * menge;
    }
  });
  
  return arr;
}

// Create singleton instance
export const state = new DashboardState();

// Expose for debugging
window.dashboardState = state;

console.log('📦 State module loaded with complete navigation and API support');
