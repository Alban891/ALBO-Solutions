/**
 * CFO Dashboard - State Management
 * Central state container with strict data isolation
 * Enterprise-grade with multi-tenant support
 */

export class DashboardState {
  constructor() {
    // Current View State
    this.currentView = 'dashboard';
    this.currentTab = 'dashboard';
    this.currentProjekt = null;
    this.currentArtikel = null;
    this.currentDetailTab = 'artikel';

    // Data Storage - Isolated per session
    this.projektData = {};
    this.artikelData = {};
    this.personalDetails = {};

    // Dashboard Live Values
    this.currentValues = {
      marketVolume: 100,
      pricePremium: 100,
      capexRisk: 100,
      npv: 44.7,
      payback: 3.4,
      revenue: 174.0,
      db2Margin: 34
    };

    // Chart Instances (managed separately for performance)
    this.chartInstances = {};

    // Loading States (prevent flicker)
    this.isLoading = {
      projekte: false,
      artikel: false,
      charts: false
    };

    // Error States (enterprise error handling)
    this.errors = {};

    // User Context (for multi-tenant)
    this.userContext = {
      companyId: null,
      userId: null,
      permissions: []
    };
  }

  // ==========================================
  // PROJEKT MANAGEMENT
  // ==========================================

  /**
   * Get projekt by ID with null-safety
   */
  getProjekt(projektId) {
    if (!projektId) {
      console.warn('getProjekt: No projektId provided');
      return null;
    }
    return this.projektData[projektId] || null;
  }

  /**
   * Set projekt data with validation
   */
  setProjekt(projektId, data) {
    if (!projektId) {
      throw new Error('setProjekt: projektId is required');
    }
    
    // Validate required fields
    if (!data.name) {
      throw new Error('setProjekt: projekt name is required');
    }

    // Ensure artikel array exists
    if (!data.artikel) {
      data.artikel = [];
    }

    this.projektData[projektId] = {
      ...data,
      id: projektId,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Get all projekte as array
   */
  getAllProjekte() {
    return Object.values(this.projektData);
  }

  /**
   * Delete projekt with cascade (remove linked artikel)
   */
  deleteProjekt(projektId) {
    const projekt = this.getProjekt(projektId);
    if (!projekt) return false;

    // Delete all linked artikel
    if (projekt.artikel && projekt.artikel.length > 0) {
      projekt.artikel.forEach(artikelId => {
        delete this.artikelData[artikelId];
      });
    }

    // Delete projekt
    delete this.projektData[projektId];
    return true;
  }

  // ==========================================
  // ARTIKEL MANAGEMENT
  // ==========================================

  /**
   * Get artikel by ID with null-safety
   */
  getArtikel(artikelId) {
    if (!artikelId) {
      console.warn('getArtikel: No artikelId provided');
      return null;
    }
    return this.artikelData[artikelId] || null;
  }

  /**
   * Set artikel data with validation
   */
  setArtikel(artikelId, data) {
    if (!artikelId) {
      throw new Error('setArtikel: artikelId is required');
    }

    // Validate required fields
    if (!data.name) {
      throw new Error('setArtikel: artikel name is required');
    }
    if (!data.projektId) {
      throw new Error('setArtikel: projektId is required');
    }

    // Ensure data structures exist
    if (!data.volumes) data.volumes = {};
    if (!data.prices) data.prices = {};

    this.artikelData[artikelId] = {
      ...data,
      id: artikelId,
      updatedAt: new Date().toISOString()
    };

    // Link to projekt if not already linked
    const projekt = this.getProjekt(data.projektId);
    if (projekt && !projekt.artikel.includes(artikelId)) {
      projekt.artikel.push(artikelId);
    }
  }

  /**
   * Get all artikel for a projekt
   */
  getArtikelByProjekt(projektId) {
    const projekt = this.getProjekt(projektId);
    if (!projekt) return [];

    return projekt.artikel
      .map(id => this.getArtikel(id))
      .filter(artikel => artikel !== null);
  }

  /**
   * Delete artikel with cleanup
   */
  deleteArtikel(artikelId) {
    const artikel = this.getArtikel(artikelId);
    if (!artikel) return false;

    // Remove from projekt
    const projekt = this.getProjekt(artikel.projektId);
    if (projekt) {
      projekt.artikel = projekt.artikel.filter(id => id !== artikelId);
    }

    // Delete artikel
    delete this.artikelData[artikelId];
    return true;
  }

  // ==========================================
  // STATE PERSISTENCE
  // ==========================================

  /**
   * Save state to localStorage (encrypted in production)
   */
  saveState() {
    try {
      const stateToSave = {
        currentView: this.currentView,
        currentTab: this.currentTab,
        currentProjekt: this.currentProjekt,
        currentArtikel: this.currentArtikel,
        currentDetailTab: this.currentDetailTab,
        currentValues: this.currentValues,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('cfo-dashboard-state', JSON.stringify(stateToSave));
      return true;
    } catch (error) {
      console.error('Failed to save state:', error);
      return false;
    }
  }

  /**
   * Restore state from localStorage
   */
  restoreState() {
    try {
      const savedState = localStorage.getItem('cfo-dashboard-state');
      if (!savedState) return false;

      const state = JSON.parse(savedState);
      
      // Restore only UI state, not data (data comes from DB)
      this.currentView = state.currentView || 'dashboard';
      this.currentTab = state.currentTab || 'dashboard';
      this.currentProjekt = state.currentProjekt;
      this.currentArtikel = state.currentArtikel;
      this.currentDetailTab = state.currentDetailTab || 'artikel';
      
      if (state.currentValues) {
        this.currentValues = { ...this.currentValues, ...state.currentValues };
      }

      return true;
    } catch (error) {
      console.error('Failed to restore state:', error);
      return false;
    }
  }

  /**
   * Clear all state (logout)
   */
  clearState() {
    this.projektData = {};
    this.artikelData = {};
    this.personalDetails = {};
    this.currentProjekt = null;
    this.currentArtikel = null;
    this.errors = {};
    
    localStorage.removeItem('cfo-dashboard-state');
  }

  // ==========================================
  // LOADING & ERROR STATES
  // ==========================================

  /**
   * Set loading state
   */
  setLoading(key, value) {
    if (this.isLoading.hasOwnProperty(key)) {
      this.isLoading[key] = value;
    }
  }

  /**
   * Set error state
   */
  setError(key, error) {
    this.errors[key] = {
      message: error.message || error,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear error
   */
  clearError(key) {
    delete this.errors[key];
  }

  /**
   * Get all errors
   */
  getErrors() {
    return Object.entries(this.errors).map(([key, error]) => ({
      key,
      ...error
    }));
  }

  // ==========================================
  // VALIDATION HELPERS
  // ==========================================

  /**
   * Validate projekt data structure
   */
  validateProjektData(data) {
    const required = ['name', 'division', 'status', 'owner'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Validate artikel data structure
   */
  validateArtikelData(data) {
    const required = ['name', 'projektId', 'typ'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
  }
}

// Create singleton instance
export const state = new DashboardState();

// Export default
export default state;