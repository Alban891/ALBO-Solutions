/**
 * CFO Dashboard - Geschäftsmodell Module (Modular Structure)
 * Entry Point with Supabase Integration
 * 
 * Version: 3.1 - Database Integration
 * Sections: 8 (Kundenproblem, Markt, Zielkunden, Wettbewerb, Revenue, GTM, Lösung, Annahmen)
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';
import * as api from '../../api.js';
import { analyzeSection, validateGeschaeftsmodell } from './ki-analysis.js';
import { renderAllSections } from './sections/index.js';
import { 
  collectFormData, 
  updateProgress, 
  resetFormState,
  initializeEventListeners 
} from './form-handler.js';
import * as marketModal from './modals/market-detail.js';
import * as competitorModule from './components/competitors.js';
import * as assumptionsModule from './components/assumptions.js';

// ==========================================
// STATE
// ==========================================

let currentSectionAnalysis = {};
let completedSections = new Set();

// ==========================================
// HELPER: CLEAN PROJEKT ID
// ==========================================

/**
 * Strip 'projekt-db-' prefix for database FK constraint
 * @param {string} projektId - Original projekt ID (may have prefix)
 * @returns {string} Clean UUID for database
 */
function cleanProjektId(projektId) {
  if (!projektId) return null;
  
  // Remove 'projekt-db-' prefix if exists
  if (projektId.includes('projekt-db-')) {
    return projektId.replace('projekt-db-', '');
  }
  
  return projektId;
}

// ==========================================
// MAIN RENDER
// ==========================================

/**
 * Main render function for Geschäftsmodell tab
 * Loads data from Supabase database
 */
export async function renderGeschaeftsmodell() {
  const projektIdRaw = window.cfoDashboard.currentProjekt;
  if (!projektIdRaw) {
    console.warn('No projekt selected');
    return;
  }

  const projekt = state.getProjekt(projektIdRaw);
  if (!projekt) {
    console.error('Projekt not found:', projektIdRaw);
    return;
  }

  console.log('🏗️ Rendering Geschäftsmodell (Modular) for:', projekt.name);

  const container = document.getElementById('projekt-tab-geschaeftsmodell');
  if (!container) {
    console.error('Geschäftsmodell container not found');
    return;
  }

  // Show loading
  container.innerHTML = '<div style="padding: 40px; text-align: center;">⏳ Lade Geschäftsmodell...</div>';

  // Clean projekt ID for database query
  const projektId = cleanProjektId(projektIdRaw);
  console.log('🔍 Original ID:', projektIdRaw);
  console.log('🔍 Cleaned ID for DB:', projektId);

  // Load from database
  let geschaeftsmodell = null;
  try {
    geschaeftsmodell = await api.loadGeschaeftsmodell(projektId);
    console.log('📥 Loaded from DB:', geschaeftsmodell);
  } catch (error) {
    console.error('❌ Error loading Geschäftsmodell:', error);
    helpers.showToast('⚠️ Fehler beim Laden', 'error');
  }

  // Fallback to empty object if nothing loaded
  if (!geschaeftsmodell) {
    geschaeftsmodell = {};
    console.log('ℹ️ No existing data, starting fresh');
  }

  // Reset state
  currentSectionAnalysis = {};
  completedSections = new Set();

  // Render main structure
  container.innerHTML = `
    <div class="geschaeftsmodell-container">
      
      <!-- Header -->
      <div class="section-header" style="margin-bottom: 32px;">
        <div>
          <h3>🏗️ Geschäftsmodell</h3>
          <p style="color: var(--gray); margin-top: 8px;">
            Business Model Canvas - 8 Sections für strategisches Verständnis
          </p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" onclick="geschaeftsmodellModule.resetForm()">
            🔄 Zurücksetzen
          </button>
          <button class="btn btn-primary" onclick="geschaeftsmodellModule.saveGeschaeftsmodell()">
            💾 Speichern
          </button>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div style="margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: var(--gray);">
          <span>Fortschritt</span>
          <span id="gm-progress-text">${geschaeftsmodell.progress || 0}%</span>
        </div>
        <div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
          <div id="gm-progress-bar" style="height: 100%; background: var(--primary); width: ${geschaeftsmodell.progress || 0}%; transition: width 0.3s ease;"></div>
        </div>
      </div>

      <!-- Main Form -->
      <form id="geschaeftsmodell-form" style="display: flex; flex-direction: column; gap: 32px;">
        ${renderAllSections(geschaeftsmodell)}
      </form>

      <!-- Bottom Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border);">
        <button class="btn btn-secondary" onclick="geschaeftsmodellModule.resetForm()">
          🔄 Zurücksetzen
        </button>
        <button class="btn btn-primary" onclick="geschaeftsmodellModule.saveGeschaeftsmodell()">
          💾 Speichern
        </button>
      </div>

    </div>
  `;

  // Initialize
  initializeEventListeners();
  updateProgress();
}

// ==========================================
// SAVE & RESET
// ==========================================

/**
 * Save Geschäftsmodell data to database
 */
export async function saveGeschaeftsmodell() {
  const projektIdRaw = window.cfoDashboard.currentProjekt;
  if (!projektIdRaw) {
    alert('Kein Projekt ausgewählt');
    return;
  }

  // Clean projekt ID for database FK
  const projektId = cleanProjektId(projektIdRaw);
  
  console.log('💾 Saving Geschäftsmodell...');
  console.log('💾 Original ID:', projektIdRaw);
  console.log('💾 Cleaned ID for DB:', projektId);

  // Show loading toast
  helpers.showToast('⏳ Speichere Geschäftsmodell...', 'info');

  // Collect form data
  const formData = collectFormData();
  console.log('📦 Form data collected:', formData);
  
  try {
    // Save to database
    const success = await api.saveGeschaeftsmodell(projektId, formData);
    
    if (success) {
      // Update local state (with original ID for state management)
      state.updateGeschaeftsmodell(projektIdRaw, formData);
      
      // Show success
      helpers.showToast('✅ Geschäftsmodell gespeichert', 'success');
      
      // Update progress bar
      const progress = api.calculateGeschaeftsmodellProgress(formData);
      const progressBar = document.getElementById('gm-progress-bar');
      const progressText = document.getElementById('gm-progress-text');
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (progressText) progressText.textContent = `${progress}%`;
      
      console.log('✅ Geschäftsmodell saved successfully');
    } else {
      helpers.showToast('❌ Fehler beim Speichern', 'error');
      console.error('❌ Save returned false');
    }
  } catch (error) {
    console.error('❌ Error saving Geschäftsmodell:', error);
    helpers.showToast('❌ Fehler: ' + (error.message || 'Unbekannter Fehler'), 'error');
  }
}

/**
 * Reset form
 */
export async function resetForm() {
  if (!confirm('Alle Eingaben zurücksetzen?')) return;
  
  const projektIdRaw = window.cfoDashboard.currentProjekt;
  if (!projektIdRaw) return;

  const projektId = cleanProjektId(projektIdRaw);
  
  try {
    // Delete from database
    await api.deleteGeschaeftsmodell(projektId);
    
    // Reset local state
    resetFormState();
    
    // Re-render
    await renderGeschaeftsmodell();
    
    helpers.showToast('🔄 Formular zurückgesetzt', 'info');
  } catch (error) {
    console.error('❌ Error resetting:', error);
    helpers.showToast('⚠️ Fehler beim Zurücksetzen', 'error');
  }
}

// ==========================================
// SECTION COMPLETION
// ==========================================

/**
 * Complete section and trigger AI analysis
 */
export function completeSection(sectionNumber) {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) return;

  // Collect section data
  const sectionData = collectFormData(sectionNumber);
  
  // Mark as completed
  completedSections.add(sectionNumber);
  
  // Trigger AI analysis
  analyzeSection(sectionNumber, sectionData).then(analysis => {
    currentSectionAnalysis[sectionNumber] = analysis;
    displaySectionAnalysis(sectionNumber, analysis);
    updateProgress();
  });
}

/**
 * Display inline analysis badge
 */
function displaySectionAnalysis(sectionNumber, analysis) {
  const badge = document.getElementById(`section-${sectionNumber}-badge`);
  if (!badge) return;

  let statusIcon = '✅';
  let statusColor = 'var(--success)';
  
  if (analysis.warnings && analysis.warnings.length > 0) {
    statusIcon = '⚠️';
    statusColor = 'var(--warning)';
  }
  
  badge.innerHTML = `
    <div style="padding: 16px; background: var(--bg-secondary); border-radius: 8px; margin-top: 16px; border-left: 4px solid ${statusColor};">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 20px;">${statusIcon}</span>
        <strong>KI-Analyse</strong>
      </div>
      <div style="color: var(--gray); font-size: 14px;">
        ${analysis.summary || 'Abschnitt analysiert'}
      </div>
      ${analysis.warnings && analysis.warnings.length > 0 ? `
        <div style="margin-top: 12px; padding: 12px; background: var(--warning-light); border-radius: 6px;">
          <strong style="color: var(--warning);">⚠️ Hinweise:</strong>
          <ul style="margin: 8px 0 0 20px; color: var(--text);">
            ${analysis.warnings.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

// ==========================================
// PUBLIC API
// ==========================================

export default {
  // Core
  renderGeschaeftsmodell,
  saveGeschaeftsmodell,
  resetForm,
  completeSection,
  
  // Market Modal (delegated)
  openMarketDetailModal: marketModal.openModal,
  closeMarketModal: marketModal.closeModal,
  switchTAMMethod: marketModal.switchTAMMethod,
  calculateTAM: marketModal.calculateTAM,
  calculateSAM: marketModal.calculateSAM,
  calculateSOM: marketModal.calculateSOM,
  saveTAMCalculation: marketModal.saveTAM,
  saveSAMCalculation: marketModal.saveSAM,
  saveSOMCalculation: marketModal.saveSOM,
  
  // Competitors (delegated)
  addCompetitor: competitorModule.addCompetitor,
  
  // Assumptions (delegated)
  addAssumption: assumptionsModule.addAssumption,
  addRisk: assumptionsModule.addRisk,
  addSuccessFactor: assumptionsModule.addSuccessFactor,
  
  // Features & Streams (from sections)
  addFeature: () => {
    const container = document.getElementById('features-container');
    if (!container) return;
    const count = container.querySelectorAll('.feature-item').length + 1;
    const html = `
      <div class="feature-item" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
        <span style="font-weight: 600; color: var(--primary);">${count}.</span>
        <input type="text" class="feature-input" placeholder="z.B. KI-basierte Fehlerkennung" style="flex: 1;" />
        <button type="button" class="btn-icon btn-danger" onclick="this.closest('.feature-item').remove()">🗑️</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  addCustomStream: () => {
    const container = document.getElementById('custom-streams-container');
    if (!container) return;
    const html = `
      <div class="custom-stream" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
        <input type="text" class="custom-stream-input" placeholder="z.B. Professional Services" style="flex: 1;" />
        <button type="button" class="btn-icon btn-danger" onclick="this.closest('.custom-stream').remove()">🗑️</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  }
};

console.log('📦 Geschäftsmodell Module (Modular + DB) loaded');
