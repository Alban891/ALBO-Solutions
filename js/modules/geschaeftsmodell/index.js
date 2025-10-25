/**
 * CFO Dashboard - Geschäftsmodell Module (Modular Structure)
 * Entry Point - UPDATED WITH API INTEGRATION
 * 
 * Version: 3.1 - Supabase Integration
 * Sections: 8 (Kundenproblem, Markt, Zielkunden, Wettbewerb, Revenue, GTM, Lösung, Annahmen)
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';
import * as api from '../../api.js';  // ← API Import hinzugefügt
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
// MAIN RENDER
// ==========================================

/**
 * Main render function for Geschäftsmodell tab
 */
export async function renderGeschaeftsmodell() {  // ← async hinzugefügt
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) {
    console.warn('No projekt selected');
    return;
  }

  const projekt = state.getProjekt(projektId);
  if (!projekt) {
    console.error('Projekt not found:', projektId);
    return;
  }

  console.log('�️ Rendering Geschäftsmodell (Modular) for:', projekt.name);

  const container = document.getElementById('projekt-tab-geschaeftsmodell');
  if (!container) {
    console.error('Geschäftsmodell container not found');
    return;
  }

  // ← NEU: Load from database
  container.innerHTML = '<div style="padding: 40px; text-align: center;">⏳ Lade Geschäftsmodell...</div>';
  
  const geschaeftsmodell = await api.loadGeschaeftsmodell(projektId) || {};
  
  // Store in state for backward compatibility
  state.updateGeschaeftsmodell(projektId, geschaeftsmodell);

  // Reset state
  currentSectionAnalysis = {};
  completedSections = new Set();

  // Render main structure
  container.innerHTML = `
    <div class="geschaeftsmodell-container">
      
      <!-- Header -->
      <div class="section-header" style="margin-bottom: 32px;">
        <div>
          <h3>�️ Geschäftsmodell</h3>
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
 * Save Geschäftsmodell data
 */
export async function saveGeschaeftsmodell() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) {
    alert('Kein Projekt ausgewählt');
    return;
  }

  helpers.showToast('⏳ Speichere Geschäftsmodell...', 'info');

  const formData = collectFormData();
  
  // ← DETAILED ERROR LOGGING
  console.log('💾 Attempting to save:', {
    projektId,
    formData,
    apiExists: typeof api.saveGeschaeftsmodell
  });
  
  try {
    const success = await api.saveGeschaeftsmodell(projektId, formData);
    
    if (success) {
      state.updateGeschaeftsmodell(projektId, formData);
      helpers.showToast('✅ Geschäftsmodell gespeichert', 'success');
      
      const progress = api.calculateGeschaeftsmodellProgress(formData);
      const progressBar = document.getElementById('gm-progress-bar');
      const progressText = document.getElementById('gm-progress-text');
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (progressText) progressText.textContent = `${progress}%`;
      
      console.log('💾 Geschäftsmodell saved:', formData);
    } else {
      helpers.showToast('❌ Fehler beim Speichern', 'error');
    }
  } catch (error) {
    console.error('❌❌❌ SAVE ERROR DETAILS:', error);
    helpers.showToast('❌ Fehler: ' + error.message, 'error');
  }
}

/**
 * Reset form
 */
export async function resetForm() {  // ← async hinzugefügt
  if (!confirm('Alle Eingaben zurücksetzen?')) return;
  
  const projektId = window.cfoDashboard.currentProjekt;
  
  // ← NEU: Delete from database
  if (confirm('Auch aus Datenbank löschen?')) {
    await api.deleteGeschaeftsmodell(projektId);
  }
  
  resetFormState();
  await renderGeschaeftsmodell();  // ← await hinzugefügt
  
  helpers.showToast('🔄 Formular zurückgesetzt', 'info');
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

console.log('📦 Geschäftsmodell Module (Modular + API) loaded');
