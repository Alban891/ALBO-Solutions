/**
 * PACKAGE EDITOR - COMPLETE
 * All-in-one package article editor
 */

import { saveArticle } from '../../api.js';

// ==========================================
// PACKAGE EDITOR STATE
// ==========================================

window.packageEditorState = {
  projektId: null,
  currentStep: 2,
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

export function openPackageEditor(projektId, initialData = {}) {
  console.log('📦 Opening Package Editor for projekt:', projektId);
  
  // Reset state
  window.packageEditorState.projektId = projektId;
  window.packageEditorState.currentStep = 2;  // ← START BEI STEP 2!
  
  // Store initial data from manual form
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
      
      <div class="modal-header">
        <div class="modal-title">
          <span class="modal-icon">📦</span>
          <h2>Package-Artikel konfigurieren</h2>
        </div>
        <button class="modal-close" onclick="closePackageEditor()">×</button>
      </div>
      
      <div id="package-progress" style="padding: 20px 30px; border-bottom: 1px solid #e5e7eb;">
        ${renderProgressSteps()}
      </div>
      
      <div class="modal-body" style="padding: 30px; min-height: 400px;">
        <div id="package-step-content"></div>
      </div>
      
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
      
      .package-config-card {
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        background: white;
        margin-bottom: 16px;
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
    </style>
  `;
}

function renderProgressSteps() {
  const state = window.packageEditorState;
  const steps = [
    { num: 2, label: 'Pakete' },       // ← Start hier!
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
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: ${step.num === state.currentStep ? '#2563eb' : step.num < state.currentStep ? '#16a34a' : '#e5e7eb'}; color: ${step.num <= state.currentStep ? 'white' : '#6b7280'}; font-weight: 600; font-size: 12px;">${step.num}</span>
            <span>${step.label}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ==========================================
// NAVIGATION
// ==========================================

window.packageEditorNextStep = function() {
  const state = window.packageEditorState;
  
  if (!validateCurrentStep()) return;
  
  if (state.currentStep < state.totalSteps) {
    state.currentStep++;
    renderCurrentStep();
  } else {
    savePackageArtikel();
  }
};

window.packageEditorPrevStep = function() {
  const state = window.packageEditorState;
  
  if (state.currentStep > 2) {
    state.currentStep--;
    renderCurrentStep();
  } else {
    // Bei Step 2: Modal schließen und zurück zur Artikel-Auswahl
    closePackageEditor();
  }
};

function renderCurrentStep() {
  const state = window.packageEditorState;
  const contentDiv = document.getElementById('package-step-content');
  const backBtn = document.getElementById('package-back-btn');
  const nextBtn = document.getElementById('package-next-btn');
  
  if (!contentDiv) return;
  
  const progressDiv = document.getElementById('package-progress');
  if (progressDiv) progressDiv.innerHTML = renderProgressSteps();
  
  backBtn.style.display = state.currentStep > 2 ? 'block' : 'none';  // ← STEP 2 ist jetzt der erste!
  nextBtn.textContent = state.currentStep === state.totalSteps ? '✓ Artikel erstellen' : 'Weiter →';
  
  switch (state.currentStep) {
    case 2: contentDiv.innerHTML = renderStep2_Packages(); break;
    case 3: contentDiv.innerHTML = renderStep3_Components(); break;
    case 4: contentDiv.innerHTML = renderStep4_Pricing(); break;
    case 5: 
      contentDiv.innerHTML = renderStep5_Preview();
      calculateAndShowForecast();
      break;
  }
}

// ==========================================
// STEP 1: BASICS
// ==========================================

function renderStep1_Basics() {
  const state = window.packageEditorState;
  
  return `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3 style="margin: 0 0 8px;">📋 Artikel Basis-Informationen</h3>
      <p style="margin: 0 0 32px; color: #6b7280;">Grundlegende Informationen für deinen Package-Artikel</p>
      
      <div style="display: grid; gap: 24px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Artikel-Name *</label>
          <input type="text" id="package-artikel-name" value="${state.artikelName}" placeholder="z.B. Cybersecurity Consulting Packages" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Haupt-Kategorie *</label>
          <select id="package-artikel-typ" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;">
            <option value="Service" ${state.artikelTyp === 'Service' ? 'selected' : ''}>Service</option>
            <option value="Software" ${state.artikelTyp === 'Software' ? 'selected' : ''}>Software</option>
            <option value="Consulting" ${state.artikelTyp === 'Consulting' ? 'selected' : ''}>Consulting</option>
            <option value="Subscription" ${state.artikelTyp === 'Subscription' ? 'selected' : ''}>Subscription</option>
          </select>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// STEP 2: PACKAGES
// ==========================================

function renderStep2_Packages() {
  const state = window.packageEditorState;
  
  return `
    <div style="max-width: 700px; margin: 0 auto;">
      <h3 style="margin: 0 0 8px;">📊 Package-Struktur definieren</h3>
      <p style="margin: 0 0 32px; color: #6b7280;">Wie viele Pakete bietest du an?</p>
      
      <div style="margin-bottom: 32px;">
        <label style="display: block; margin-bottom: 12px; font-weight: 600;">Anzahl Pakete</label>
        <div style="display: flex; gap: 12px;">
          ${[2, 3, 4, 5].map(count => `
            <button onclick="updatePackageCount(${count})" style="flex: 1; padding: 16px; border: 2px solid ${state.packageCount === count ? '#2563eb' : '#e5e7eb'}; background: ${state.packageCount === count ? '#eff6ff' : 'white'}; border-radius: 12px; font-size: 18px; font-weight: 600; color: ${state.packageCount === count ? '#2563eb' : '#6b7280'}; cursor: pointer;">
              ${count}
            </button>
          `).join('')}
        </div>
      </div>
      
      <div id="package-names-container">${renderPackageNameInputs()}</div>
    </div>
  `;
}

function renderPackageNameInputs() {
  const state = window.packageEditorState;
  const count = state.packageCount;
  const defaultNames = {
    2: ['Basic', 'Premium'],
    3: ['Small', 'Medium', 'Large'],
    4: ['Starter', 'Professional', 'Business', 'Enterprise'],
    5: ['Starter', 'Basic', 'Professional', 'Business', 'Enterprise']
  };
  const names = state.packageNames.length === count ? state.packageNames : defaultNames[count];
  
  return `
    <div style="display: grid; gap: 16px;">
      ${Array.from({ length: count }, (_, i) => `
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Paket ${i + 1}</label>
          <input type="text" id="package-name-${i}" value="${names[i] || ''}" placeholder="z.B. ${defaultNames[count][i]}" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
        </div>
      `).join('')}
    </div>
  `;
}

window.updatePackageCount = function(count) {
  window.packageEditorState.packageCount = count;
  const container = document.getElementById('package-names-container');
  if (container) container.innerHTML = renderPackageNameInputs();
};

// ==========================================
// STEP 3: COMPONENTS
// ==========================================

function renderStep3_Components() {
  const state = window.packageEditorState;
  
  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <h3 style="margin: 0 0 8px;">🧩 Komponenten pro Paket</h3>
      <p style="margin: 0 0 24px; color: #6b7280;">Welche Komponenten sind in jedem Paket enthalten?</p>
      
      ${state.packages.map((pkg, index) => `
        <div class="package-config-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <div>
              <div style="font-weight: 600; font-size: 16px;">${pkg.name}</div>
              <div style="font-size: 13px; color: #6b7280;">${pkg.components.length} Komponenten</div>
            </div>
            <button onclick="addComponentToPackage(${index})" class="btn btn-secondary" style="padding: 8px 16px;">➕ Komponente</button>
          </div>
          <div id="package-${index}-components">${renderComponentsList(index)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderComponentsList(packageIndex) {
  const state = window.packageEditorState;
  const components = state.packages[packageIndex].components;
  
  if (components.length === 0) {
    return `<div style="padding: 40px; text-align: center; color: #9ca3af; background: #f9fafb; border-radius: 8px; border: 2px dashed #e5e7eb;">Noch keine Komponenten</div>`;
  }
  
  return components.map((comp, compIndex) => `
    <div class="component-item">
      <div style="flex: 1;">
        <div style="font-weight: 600;">${comp.name}</div>
        <div style="font-size: 12px; color: #6b7280;">${comp.type} • ${formatCurrency(comp.price)}</div>
      </div>
      <button onclick="removeComponent(${packageIndex}, ${compIndex})" style="padding: 6px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer;">🗑️</button>
    </div>
  `).join('');
}

window.addComponentToPackage = function(packageIndex) {
  const state = window.packageEditorState;
  const name = prompt('Komponenten-Name:', 'z.B. Basis-Analyse');
  if (!name) return;
  
  const type = prompt('Typ:', 'Service');
  const price = parseFloat(prompt('Preis in EUR:', '5000'));
  
  state.packages[packageIndex].components.push({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name: name,
    type: type,
    pricing_type: 'one-time',
    price: price || 0
  });
  
  document.getElementById(`package-${packageIndex}-components`).innerHTML = renderComponentsList(packageIndex);
};

window.removeComponent = function(packageIndex, componentIndex) {
  window.packageEditorState.packages[packageIndex].components.splice(componentIndex, 1);
  document.getElementById(`package-${packageIndex}-components`).innerHTML = renderComponentsList(packageIndex);
};

// ==========================================
// STEP 4: PRICING
// ==========================================

function renderStep4_Pricing() {
  const state = window.packageEditorState;
  
  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <h3 style="margin: 0 0 8px;">💰 Pricing & Customer Journey</h3>
      <p style="margin: 0 0 32px; color: #6b7280;">Konfiguriere Kundenzahlen und Mix-Verteilung</p>
      
      <div class="package-config-card">
        <h4 style="margin: 0 0 16px;">👥 Kundenbasis</h4>
        <div>
          <label style="display: block; margin-bottom: 8px;">Neukunden im ersten Jahr</label>
          <input type="number" id="new-customers-year1" value="${state.newCustomersYear1}" min="10" style="width: 200px; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px;">
        </div>
      </div>
      
      <div class="package-config-card">
        <h4 style="margin: 0 0 16px;">🎯 Mix-Verteilung</h4>
        ${state.packages.map((pkg, index) => `
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <label>${pkg.name}</label>
              <span id="mix-${index}-value" style="font-weight: 600;">${state.mixDistribution[index] || 0}%</span>
            </div>
            <input type="range" id="mix-${index}" min="0" max="100" value="${state.mixDistribution[index] || 0}" oninput="updateMixDistribution(${index}, this.value)" style="width: 100%;">
          </div>
        `).join('')}
        <div id="mix-total" style="padding: 12px; background: #f9fafb; border-radius: 8px; font-weight: 600;">Gesamt: ${getMixTotal()}%</div>
      </div>
    </div>
  `;
}

function getMixTotal() {
  return window.packageEditorState.mixDistribution.reduce((sum, val) => sum + (val || 0), 0);
}

window.updateMixDistribution = function(index, value) {
  window.packageEditorState.mixDistribution[index] = parseInt(value);
  document.getElementById(`mix-${index}-value`).textContent = value + '%';
  document.getElementById('mix-total').innerHTML = `Gesamt: ${getMixTotal()}%`;
};

// ==========================================
// STEP 5: PREVIEW
// ==========================================

function renderStep5_Preview() {
  const state = window.packageEditorState;
  
  return `
    <div style="max-width: 900px; margin: 0 auto;">
      <h3 style="margin: 0 0 8px;">📊 Vorschau & Zusammenfassung</h3>
      <p style="margin: 0 0 32px; color: #6b7280;">Überprüfe deine Konfiguration</p>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px;">
          <div style="font-size: 32px; font-weight: 700;">${state.packages.length}</div>
          <div style="opacity: 0.9;">Pakete</div>
        </div>
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px;">
          <div style="font-size: 32px; font-weight: 700;">${state.packages.reduce((sum, pkg) => sum + pkg.components.length, 0)}</div>
          <div style="opacity: 0.9;">Komponenten</div>
        </div>
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 12px;">
          <div style="font-size: 32px; font-weight: 700;">${state.newCustomersYear1}</div>
          <div style="opacity: 0.9;">Neukunden</div>
        </div>
      </div>
      
      <div id="forecast-preview" style="text-align: center; padding: 40px; color: #6b7280;">
        <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
        <div>Berechne Forecast...</div>
      </div>
    </div>
  `;
}

function calculateAndShowForecast() {
  setTimeout(() => {
    const container = document.getElementById('forecast-preview');
    if (container) {
      container.innerHTML = `
        <div class="package-config-card">
          <h4>📈 Bereit zum Speichern!</h4>
          <p style="color: #6b7280;">Klicke "Artikel erstellen" um fortzufahren.</p>
        </div>
      `;
    }
  }, 500);
}

// ==========================================
// VALIDATION
// ==========================================

function validateCurrentStep() {
  const state = window.packageEditorState;
  
  switch (state.currentStep) {
    case 2:
      const names = [];
      for (let i = 0; i < state.packageCount; i++) {
        const name = document.getElementById(`package-name-${i}`)?.value;
        if (!name) { alert(`Bitte Namen für Paket ${i + 1} eingeben!`); return false; }
        names.push(name);
      }
      state.packageNames = names;
      state.packages = names.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        short: name.charAt(0).toUpperCase(),
        components: []
      }));
      return true;
      
    case 3:
      const hasComponents = state.packages.every(pkg => pkg.components.length > 0);
      if (!hasComponents) { alert('Jedes Paket braucht min. 1 Komponente!'); return false; }
      return true;
      
    case 4:
      if (getMixTotal() !== 100) { alert('Mix-Verteilung muss 100% ergeben!'); return false; }
      state.newCustomersYear1 = parseInt(document.getElementById('new-customers-year1')?.value) || 100;
      return true;
      
    case 5:
      return true;
  }
  return true;
}

// ==========================================
// SAVE
// ==========================================

async function savePackageArtikel() {
  const state = window.packageEditorState;
  
  console.log('💾 Saving package artikel...');
  
  let cleanProjektId = state.projektId;
  if (typeof state.projektId === 'string' && state.projektId.includes('projekt-db-')) {
    cleanProjektId = state.projektId.replace('projekt-db-', '');
  }
  
  const packageConfig = {
    package_count: state.packageCount,
    package_names: state.packageNames,
    packages: state.packages,
    mix_distribution: state.mixDistribution,
    new_customers_year1: state.newCustomersYear1
  };
  
  const artikelData = {
    name: state.artikelName,
    typ: state.artikelTyp,
    projektId: state.projektId,
    projekt_id: cleanProjektId,
    artikel_mode: 'package',
    package_config: packageConfig,
    release_datum: '2025-01',
    zeitraum: 5,
    volumes: {},
    prices: {},
    start_menge: state.newCustomersYear1
  };
  
  try {
    const nextBtn = document.getElementById('package-next-btn');
    nextBtn.textContent = 'Speichere...';
    nextBtn.disabled = true;
    
    await saveArticle(artikelData);
    
    closePackageEditor();
    alert('✅ Package-Artikel erfolgreich erstellt!');
    
    setTimeout(() => window.location.reload(), 500);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Fehler: ' + error.message);
  }
}

// ==========================================
// HELPER
// ==========================================

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(value);
}

// ==========================================
// EXPORT
// ==========================================

export default { openPackageEditor };
