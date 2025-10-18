/**
 * CFO Dashboard - Geschäftsmodell Module (Modular Structure)
 * Entry Point
 * 
 * Version: 3.0 Modular
 * Sections: 8 (Kundenproblem, Markt, Zielkunden, Wettbewerb, Revenue, GTM, Lösung, Annahmen)
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';
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
export function renderGeschaeftsmodell() {
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

  console.log('🏗️ Rendering Geschäftsmodell (Modular) for:', projekt.name);

  const container = document.getElementById('projekt-tab-geschaeftsmodell');
  if (!container) {
    console.error('Geschäftsmodell container not found');
    return;
  }

  // Load existing data
  const geschaeftsmodell = state.getGeschaeftsmodell(projektId) || {};

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
          <span id="gm-progress-text">0%</span>
        </div>
        <div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
          <div id="gm-progress-bar" style="height: 100%; background: var(--primary); width: 0%; transition: width 0.3s ease;"></div>
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
export function saveGeschaeftsmodell() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) {
    alert('Kein Projekt ausgewählt');
    return;
  }

  const formData = collectFormData();
  
  // Save to state
  state.updateGeschaeftsmodell(projektId, formData);
  
  // Show success
  helpers.showToast('✅ Geschäftsmodell gespeichert', 'success');
  
  console.log('💾 Geschäftsmodell saved:', formData);
}

/**
 * Reset form
 */
export function resetForm() {
  if (!confirm('Alle Eingaben zurücksetzen?')) return;
  
  resetFormState();
  renderGeschaeftsmodell();
  
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
  
  // Legacy (for backwards compatibility)
  addFeature: () => console.warn('addFeature deprecated, use sections/section-7.js'),
  addCustomStream: () => console.warn('addCustomStream deprecated, use sections/section-5.js')
};

console.log('📦 Geschäftsmodell Module (Modular) loaded');