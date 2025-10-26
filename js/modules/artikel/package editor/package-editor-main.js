/**
 * PACKAGE EDITOR - MAIN
 * Complete package article creation with multi-step wizard
 * 
 * INTEGRATION: Import this in artikel-creation-modal.js
 * import { openPackageEditor } from './package-editor-main.js';
 */

import { calculatePackageForecast } from './package-calculation.js';
import { saveArticle } from '../../api.js';

// ==========================================
// PACKAGE EDITOR STATE
// ==========================================

window.packageEditorState = {
  projektId: null,
  currentStep: 1,
  totalSteps: 5,
  
  // Configuration
  packageCount: 3,
  packageNames: ['Small', 'Medium', 'Large'],
  packages: [],
  
  // Customer Journey
  newCustomersYear1: 100,
  customerGrowth: 'linear-10',
  mixDistribution: [50, 35, 15],
  upsellRates: { '0_to_1': 15, '1_to_2': 10 },
  churnRates: [15, 8, 5],
  
  // Base data
  artikelName: '',
  artikelTyp: 'Service',
  
  // Calculated forecast
  forecast: null
};

// ==========================================
// MAIN ENTRY POINT
// ==========================================

/**
 * Open Package Editor Modal
 */
export function openPackageEditor(projektId, initialData = {}) {
  console.log('📦 Opening Package Editor for projekt:', projektId);
  
  // Reset state
  window.packageEditorState.projektId = projektId;
  window.packageEditorState.currentStep = 1;
  
  // Apply initial data if provided (from AI analysis)
  if (initialData.artikel_name) {
    window.packageEditorState.artikelName = initialData.artikel_name;
  }
  if (initialData.artikel_typ) {
    window.packageEditorState.artikelTyp = initialData.artikel_typ;
  }
  
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'package-editor-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = renderPackageEditorModal();
  
  document.body.appendChild(modal);
  
  // Initialize
  renderCurrentStep();
}

/**
 * Close Package Editor
 */
window.closePackageEditor = function() {
  const modal = document.getElementById('package-editor-modal');
  if (modal) modal.remove();
};

// ==========================================
// MODAL STRUCTURE
// ==========================================

function renderPackageEditorModal() {
  return `
    <div class="modal-container" style="max-width: 900px;">
      
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title">
          <span class="modal-icon">📦</span>
          <h2>Package-Artikel konfigurieren</h2>
        </div>
        <button class="modal-close" onclick="closePackageEditor()">×</button>
      </div>
      
      <!-- Progress Steps -->
      <div id="package-progress" style="padding: 20px 30px; border-bottom: 1px solid #e5e7eb;">
        ${renderProgressSteps()}
      </div>
      
      <!-- Step Content -->
      <div class="modal-body" style="padding: 30px; min-height: 400px;">
        <div id="package-step-content">
          <!-- Dynamic content -->
        </div>
      </div>
      
      <!-- Footer Navigation -->
      <div class="modal-footer" style="display: flex; justify-content: space-between; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
        <button class="btn btn-secondary" id="package-back-btn" onclick="packageEditorPrevStep()" style="display: none;">
          ← Zurück
        </button>
        <div style="flex: 1;"></div>
        <button class="btn btn-primary" id="package-next-btn" onclick="packageEditorNextStep()">
          Weiter →
        </button>
      </div>
      
    </div>
    
    <style>
      .package-step {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #6b7280;
        background: white;
        border: 2px solid #e5e7eb;
      }
      
      .package-step.active {
        background: #eff6ff;
        color: #2563eb;
        border-color: #2563eb;
      }
      
      .package-step.completed {
        background: #f0fdf4;
        color: #16a34a;
        border-color: #16a34a;
      }
      
      .package-step-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #e5e7eb;
        color: #6b7280;
        font-weight: 600;
        font-size: 12px;
      }
      
      .package-step.active .package-step-number {
        background: #2563eb;
        color: white;
      }
      
      .package-step.completed .package-step-number {
        background: #16a34a;
        color: white;
      }
      
      .package-config-card {
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        background: white;
        margin-bottom: 16px;
      }
      
      .package-config-card:hover {
        border-color: #d1d5db;
      }
      
      .component-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f9fafb;
        border-radius: 8px;
        margin-bottom: 8px;
      }
      
      .component-item:hover {
        background: #f3f4f6;
      }
    </style>
  `;
}

function renderProgressSteps() {
  const state = window.packageEditorState;
  const steps = [
    { num: 1, label: 'Basis' },
    { num: 2, label: 'Pakete' },
    { num: 3, label: 'Komponenten' },
    { num: 4, label: 'Pricing' },
    { num: 5, label: 'Vorschau' }
  ];
  
  return `
    <div style="display: flex; gap: 12px; justify-content: center;">
      ${steps.map(step => {
        let className = 'package-step';
        if (step.num === state.currentStep) className += ' active';
        if (step.num < state.currentStep) className += ' completed';
        
        return `
          <div class="${className}">
            <span class="package-step-number">${step.num}</span>
            <span>${step.label}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ==========================================
// STEP NAVIGATION
// ==========================================

window.packageEditorNextStep = function() {
  const state = window.packageEditorState;
  
  // Validate current step
  if (!validateCurrentStep()) {
    return;
  }
  
  // Move to next step
  if (state.currentStep < state.totalSteps) {
    state.currentStep++;
    renderCurrentStep();
  } else {
    // Final step - save
    savePackageArtikel();
  }
};

window.packageEditorPrevStep = function() {
  const state = window.packageEditorState;
  
  if (state.currentStep > 1) {
    state.currentStep--;
    renderCurrentStep();
  }
};

function renderCurrentStep() {
  const state = window.packageEditorState;
  const contentDiv = document.getElementById('package-step-content');
  const backBtn = document.getElementById('package-back-btn');
  const nextBtn = document.getElementById('package-next-btn');
  
  if (!contentDiv) return;
  
  // Update progress
  const progressDiv = document.getElementById('package-progress');
  if (progressDiv) progressDiv.innerHTML = renderProgressSteps();
  
  // Update back button
  backBtn.style.display = state.currentStep > 1 ? 'block' : 'none';
  
  // Update next button text
  nextBtn.textContent = state.currentStep === state.totalSteps ? '✓ Artikel erstellen' : 'Weiter →';
  
  // Render step content
  switch (state.currentStep) {
    case 1:
      contentDiv.innerHTML = renderStep1_Basics();
      break;
    case 2:
      contentDiv.innerHTML = renderStep2_Packages();
      break;
    case 3:
      contentDiv.innerHTML = renderStep3_Components();
      initializeComponentEditor();
      break;
    case 4:
      contentDiv.innerHTML = renderStep4_Pricing();
      break;
    case 5:
      contentDiv.innerHTML = renderStep5_Preview();
      calculateAndShowForecast();
      break;
  }
}

// ==========================================
// VALIDATION
// ==========================================

function validateCurrentStep() {
  const state = window.packageEditorState;
  
  switch (state.currentStep) {
    case 1:
      // Validate basics
      const name = document.getElementById('package-artikel-name')?.value;
      const typ = document.getElementById('package-artikel-typ')?.value;
      
      if (!name || name.trim() === '') {
        alert('❌ Bitte gib einen Artikel-Namen ein!');
        return false;
      }
      
      state.artikelName = name;
      state.artikelTyp = typ;
      return true;
      
    case 2:
      // Validate packages
      const count = parseInt(document.getElementById('package-count')?.value);
      
      if (!count || count < 2 || count > 5) {
        alert('❌ Bitte wähle 2-5 Pakete!');
        return false;
      }
      
      // Collect package names
      const names = [];
      for (let i = 0; i < count; i++) {
        const name = document.getElementById(`package-name-${i}`)?.value;
        if (!name || name.trim() === '') {
          alert(`❌ Bitte gib einen Namen für Paket ${i + 1} ein!`);
          return false;
        }
        names.push(name);
      }
      
      state.packageCount = count;
      state.packageNames = names;
      
      // Initialize packages if not exist
      if (state.packages.length === 0) {
        state.packages = names.map((name, index) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          short: name.charAt(0).toUpperCase(),
          description: '',
          components: []
        }));
      }
      
      return true;
      
    case 3:
      // Validate components
      const hasComponents = state.packages.every(pkg => pkg.components.length > 0);
      if (!hasComponents) {
        alert('❌ Jedes Paket braucht mindestens 1 Komponente!');
        return false;
      }
      return true;
      
    case 4:
      // Validate pricing
      return true;
      
    case 5:
      // Preview - always valid
      return true;
  }
  
  return true;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  openPackageEditor
};