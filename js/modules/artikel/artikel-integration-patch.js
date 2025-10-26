/**
 * ALBO Solutions - Artikel Integration Patch (FIXED)
 * 
 * This file contains the updated functions to integrate
 * the new adaptive revenue models into existing artikel.js
 * 
 * FIX: Makes AdaptiveRenderer and RevenueModels globally available
 */

import RevenueModels from './revenue-models.js';
import AdaptiveRenderer from './artikel-adaptive-renderer.js';
import Calculator from './artikel-calculator.js';
import * as helpers from '../../helpers.js';
import { state } from '../../state.js';

// ============================================
// UPDATED: LOAD ARTIKEL INTO FORM (ADAPTIVE)
// ============================================

/**
 * REPLACES the existing loadArtikelIntoForm function
 * Now renders adaptive UI based on artikel type
 */
export function loadArtikelIntoFormAdaptive(artikel) {
  console.log('📝 Loading artikel (ADAPTIVE):', artikel.name, '- Type:', artikel.typ);
  
  // Zeige "Zuletzt gespeichert" Info
  if (artikel.updatedAt) {
    const updateInfo = document.getElementById('artikel-update-info');
    if (updateInfo) {
      const dateStr = new Date(artikel.updatedAt).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      updateInfo.innerHTML = '<span style="color: var(--success);">✓</span> Zuletzt gespeichert: ' + dateStr;
      updateInfo.style.display = 'block';
    }
  }

  // ==========================================
  // BASIC INFO (unchanged)
  // ==========================================
  helpers.setInputValue('artikel-name', artikel.name);
  helpers.setInputValue('artikel-typ', artikel.typ || 'Hardware');
  helpers.setInputValue('kategorie', artikel.kategorie || artikel.effekt_typ || '');
  helpers.setInputValue('geschaeftsmodell', artikel.geschaeftsmodell);
  helpers.setInputValue('zielmarkt', artikel.zielmarkt);
  helpers.setInputValue('strategie', artikel.strategie);
  helpers.setInputValue('investment-typ', artikel.investment_typ);
  helpers.setInputValue('artikel-beschreibung', artikel.beschreibung);

  // ==========================================
  // RENDER ADAPTIVE FINANZ-PARAMETER SECTION
  // ==========================================
  renderAdaptiveFinanzSection(artikel);
  
  // ==========================================
  // SETUP TYPE CHANGE LISTENER
  // ==========================================
  setupTypeChangeListener();
}

// ============================================
// RENDER ADAPTIVE FINANZ SECTION
// ============================================

function renderAdaptiveFinanzSection(artikel) {
  // Find the Finanz-Parameter section in HTML
  const finanzSections = document.querySelectorAll('.form-section');
  let finanzSection = null;
  
  for (const section of finanzSections) {
    const h3 = section.querySelector('h3');
    if (h3 && h3.textContent.includes('Finanz-Parameter')) {
      finanzSection = section;
      break;
    }
  }
  
  if (!finanzSection) {
    console.error('❌ Finanz-Parameter section not found in HTML!');
    console.log('Available sections:', finanzSections.length);
    return;
  }
  
  console.log('🎨 Rendering adaptive Finanz-Parameter section...');
  
  // Replace content with adaptive renderer
  try {
    // Use global AdaptiveRenderer if available, otherwise use imported one
    const renderer = window.AdaptiveRenderer || AdaptiveRenderer;
    const adaptiveHTML = renderer.renderFinanzParameterByType(artikel);
    finanzSection.outerHTML = adaptiveHTML;
    console.log('✅ Adaptive UI rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering adaptive UI:', error);
    return;
  }
  
  // After rendering, calculate and update preview
  setTimeout(function() {
    if (window.berechneErgebnisVorschau) {
      window.berechneErgebnisVorschau();
    }
  }, 100);
}

// ============================================
// SETUP TYPE CHANGE LISTENER
// ============================================

function setupTypeChangeListener() {
  const typSelect = document.getElementById('artikel-typ');
  
  if (!typSelect) {
    console.warn('artikel-typ select not found');
    return;
  }
  
  // Remove existing listeners
  const newTypSelect = typSelect.cloneNode(true);
  typSelect.parentNode.replaceChild(newTypSelect, typSelect);
  
  // Add new listener
  newTypSelect.addEventListener('change', function(e) {
    const newType = e.target.value;
    console.log('🔄 Artikel type changed to:', newType);
    
    // Get current artikel
    const artikelId = window.cfoDashboard?.currentArtikel;
    if (!artikelId) return;
    
    const artikel = state.getArtikel(artikelId);
    if (!artikel) return;
    
    // Update type
    artikel.typ = newType;
    
    // Re-render Finanz section with new type
    renderAdaptiveFinanzSection(artikel);
    
    // Show info message
    if (window.cfoDashboard?.aiController) {
      const models = window.RevenueModels || RevenueModels;
      const model = models.getRevenueModel(newType);
      window.cfoDashboard.aiController.addAIMessage({
        level: 'info',
        title: '🔄 Artikel-Typ geändert',
        text: 'Die Finanz-Parameter wurden an den Typ "' + model.name + '" angepasst.',
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  });
  
  console.log('✅ Type change listener setup complete');
}

// ============================================
// UPDATED: SAVE ARTIKEL CHANGES
// ============================================

/**
 * UPDATED version that collects type-specific data
 */
export function saveArtikelChangesAdaptive() {
  const artikelId = window.cfoDashboard.currentArtikel;
  if (!artikelId) {
    console.error('No artikel selected');
    return;
  }

  const artikel = state.getArtikel(artikelId);
  if (!artikel) {
    console.error('Artikel not found:', artikelId);
    return;
  }

  console.log('💾 Saving artikel (ADAPTIVE):', artikel.name);

  // Collect basic info
  artikel.name = helpers.getInputValue('artikel-name');
  artikel.typ = helpers.getInputValue('artikel-typ');
  artikel.kategorie = helpers.getInputValue('kategorie');
  artikel.geschaeftsmodell = helpers.getInputValue('geschaeftsmodell');
  artikel.zielmarkt = helpers.getInputValue('zielmarkt');
  artikel.strategie = helpers.getInputValue('strategie');
  artikel.investment_typ = helpers.getInputValue('investment-typ');
  artikel.beschreibung = helpers.getInputValue('artikel-beschreibung');
  artikel.release_datum = helpers.getInputValue('release-datum');

  // Get revenue model for this type
  const models = window.RevenueModels || RevenueModels;
  const model = models.getRevenueModel(artikel.typ);
  
  // Collect type-specific start values
  model.metriken.forEach(function(metrik) {
    const input = document.getElementById('start-' + metrik.id);
    if (input && input.value && !input.value.startsWith('z.B.')) {
      artikel['start_' + metrik.id] = helpers.parseFormattedNumber(input.value);
    }
  });
  
  // Collect selected models
  const mengenRadio = document.querySelector('input[name="mengen-modell"]:checked');
  if (mengenRadio) artikel.mengen_modell = mengenRadio.value;
  
  const preisRadio = document.querySelector('input[name="preis-modell"]:checked');
  if (preisRadio) artikel.preis_modell = preisRadio.value;
  
  const kostenRadio = document.querySelector('input[name="kosten-modell"]:checked');
  if (kostenRadio) artikel.kosten_modell = kostenRadio.value;
  
  // Collect zeitraum
  const zeitraumBtn = document.querySelector('.zeitraum-btn.active');
  if (zeitraumBtn) {
    const text = zeitraumBtn.textContent;
    const match = text.match(/(\d+)/);
    if (match) artikel.zeitraum = parseInt(match[1]);
  }
  
  // Collect forecast data from table
  collectForecastData(artikel, model);
  
  // Update timestamp
  artikel.updatedAt = new Date().toISOString();

  // Save to state
  state.setArtikel(artikelId, artikel);
  state.saveState();

  // Save to Supabase (if API available)
  if (window.saveArticle) {
    window.saveArticle(artikel).then(function() {
      console.log('✅ Saved to Supabase');
    }).catch(function(err) {
      console.error('❌ Supabase save failed:', err);
    });
  }

  // Show success message
  const updateInfo = document.getElementById('artikel-update-info');
  if (updateInfo) {
    const dateStr = new Date(artikel.updatedAt).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    updateInfo.innerHTML = '<span style="color: var(--success);">✓</span> Zuletzt gespeichert: ' + dateStr;
    updateInfo.style.display = 'block';
  }

  if (window.cfoDashboard?.aiController) {
    window.cfoDashboard.aiController.addAIMessage({
      level: 'success',
      title: '💾 Artikel gespeichert',
      text: 'Änderungen an "' + artikel.name + '" wurden erfolgreich gespeichert.',
      timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
    });
  }

  console.log('✅ Artikel saved:', artikel);
}

// ============================================
// COLLECT FORECAST DATA FROM TABLE
// ============================================

function collectForecastData(artikel, model) {
  const zeitraum = artikel.zeitraum || 5;
  const metriken = model.metriken;
  
  // Initialize data objects
  metriken.forEach(function(metrik) {
    if (!artikel[metrik.id]) artikel[metrik.id] = {};
  });
  
  // Collect values from table
  for (let i = 1; i <= zeitraum; i++) {
    metriken.forEach(function(metrik) {
      const input = document.getElementById(metrik.id + '-jahr-' + i);
      if (input && input.value) {
        const year = artikel.release_datum ? 
          parseInt(artikel.release_datum.split('-')[0]) + i - 1 : 
          new Date().getFullYear() + i - 1;
        artikel[metrik.id][year] = helpers.parseFormattedNumber(input.value);
      }
    });
  }
  
  console.log('📊 Collected forecast data:', artikel);
}

// ============================================
// INTEGRATION FUNCTION (FIXED!)
// ============================================

/**
 * Call this to integrate the adaptive system into existing artikel.js
 * FIXED: Now makes all dependencies globally available
 */
export function integrateAdaptiveSystem() {
  console.log('🔧 Integrating adaptive artikel system...');
  
  // Store original functions
  const originalLoadArtikelIntoForm = window.loadArtikelIntoForm;
  const originalSaveArtikelChanges = window.saveArtikelChanges;
  
  // Replace global functions
  window.loadArtikelIntoForm = loadArtikelIntoFormAdaptive;
  console.log('✅ Replaced loadArtikelIntoForm');
  
  window.saveArtikelChanges = saveArtikelChangesAdaptive;
  console.log('✅ Replaced saveArtikelChanges');
  
  // Make calculator globally available
  window.berechneErgebnisVorschau = Calculator.calculateArtikelForecast;
  console.log('✅ Made berechneErgebnisVorschau global');
  
  // ⭐ NEW: Make AdaptiveRenderer globally available
  window.AdaptiveRenderer = AdaptiveRenderer;
  console.log('✅ Made AdaptiveRenderer global');
  
  // ⭐ NEW: Make RevenueModels globally available
  window.RevenueModels = RevenueModels;
  console.log('✅ Made RevenueModels global');
  
  // ⭐ NEW: Make Calculator globally available
  window.Calculator = Calculator;
  console.log('✅ Made Calculator global');
  
  console.log('🎉 Adaptive system integration complete!');
  console.log('📦 Global objects available:', {
    loadArtikelIntoForm: typeof window.loadArtikelIntoForm,
    saveArtikelChanges: typeof window.saveArtikelChanges,
    berechneErgebnisVorschau: typeof window.berechneErgebnisVorschau,
    AdaptiveRenderer: typeof window.AdaptiveRenderer,
    RevenueModels: typeof window.RevenueModels,
    Calculator: typeof window.Calculator
  });
}

export default {
  loadArtikelIntoFormAdaptive,
  saveArtikelChangesAdaptive,
  integrateAdaptiveSystem
};
