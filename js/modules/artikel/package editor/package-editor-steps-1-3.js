/**
 * PACKAGE EDITOR - STEPS 1-3
 * Step content rendering functions
 * 
 * ADD TO: package-editor-main.js (or import)
 */

// ==========================================
// STEP 1: BASICS
// ==========================================

function renderStep1_Basics() {
  const state = window.packageEditorState;
  
  return `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3 style="margin: 0 0 8px;">📋 Artikel Basis-Informationen</h3>
      <p style="margin: 0 0 32px; color: #6b7280;">
        Grundlegende Informationen für deinen Package-Artikel
      </p>
      
      <div style="display: grid; gap: 24px;">
        
        <!-- Name -->
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">
            Artikel-Name *
          </label>
          <input 
            type="text" 
            id="package-artikel-name" 
            value="${state.artikelName}"
            placeholder="z.B. Cybersecurity Consulting Packages"
            style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;"
          >
          <div style="margin-top: 6px; font-size: 13px; color: #6b7280;">
            💡 Wähle einen beschreibenden Namen für dein Package-Angebot
          </div>
        </div>
        
        <!-- Typ -->
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">
            Haupt-Kategorie *
          </label>
          <select 
            id="package-artikel-typ" 
            style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;"
          >
            <option value="Service" ${state.artikelTyp === 'Service' ? 'selected' : ''}>Service</option>
            <option value="Software" ${state.artikelTyp === 'Software' ? 'selected' : ''}>Software</option>
            <option value="Consulting" ${state.artikelTyp === 'Consulting' ? 'selected' : ''}>Consulting</option>
            <option value="Subscription" ${state.artikelTyp === 'Subscription' ? 'selected' : ''}>Subscription</option>
            <option value="Hardware" ${state.artikelTyp === 'Hardware' ? 'selected' : ''}>Hardware</option>
          </select>
          <div style="margin-top: 6px; font-size: 13px; color: #6b7280;">
            💡 Die Hauptkategorie hilft bei der Modell-Auswahl
          </div>
        </div>
        
        <!-- Info Box -->
        <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px;">
          <div style="display: flex; gap: 12px; align-items: start;">
            <div style="font-size: 24px;">💡</div>
            <div>
              <div style="font-weight: 600; color: #1e40af; margin-bottom: 8px;">
                Package-Artikel Vorteile
              </div>
              <ul style="margin: 0; padding-left: 20px; color: #1e40af; line-height: 1.8;">
                <li>Automatische Upsell-Berechnung</li>
                <li>Mix-Verteilung über verschiedene Pakete</li>
                <li>Customer Journey Simulation</li>
                <li>Churn & Retention Tracking</li>
              </ul>
            </div>
          </div>
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
      <p style="margin: 0 0 32px; color: #6b7280;">
        Wie viele Pakete bietest du an und wie heißen sie?
      </p>
      
      <!-- Package Count -->
      <div style="margin-bottom: 32px;">
        <label style="display: block; margin-bottom: 12px; font-weight: 600;">
          Anzahl Pakete
        </label>
        <div style="display: flex; gap: 12px;">
          ${[2, 3, 4, 5].map(count => `
            <button 
              class="package-count-btn ${state.packageCount === count ? 'active' : ''}"
              onclick="updatePackageCount(${count})"
              style="
                flex: 1;
                padding: 16px;
                border: 2px solid ${state.packageCount === count ? '#2563eb' : '#e5e7eb'};
                background: ${state.packageCount === count ? '#eff6ff' : 'white'};
                border-radius: 12px;
                font-size: 18px;
                font-weight: 600;
                color: ${state.packageCount === count ? '#2563eb' : '#6b7280'};
                cursor: pointer;
                transition: all 0.2s;
              "
            >
              ${count}
            </button>
          `).join('')}
        </div>
        <div style="margin-top: 8px; font-size: 13px; color: #6b7280;">
          💡 Die meisten Angebote haben 3 Pakete (z.B. Small/Medium/Large)
        </div>
      </div>
      
      <!-- Package Names -->
      <div id="package-names-container">
        ${renderPackageNameInputs()}
      </div>
      
      <!-- Examples -->
      <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">
          📚 Beispiele für Package-Namen:
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 13px; color: #6b7280;">
          <div>• Starter, Professional, Enterprise</div>
          <div>• Small, Medium, Large</div>
          <div>• Basic, Advanced, Premium</div>
          <div>• Essential, Plus, Ultimate</div>
        </div>
      </div>
      
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
  
  // Use existing names or defaults
  const names = state.packageNames.length === count 
    ? state.packageNames 
    : defaultNames[count];
  
  return `
    <div style="display: grid; gap: 16px;">
      ${Array.from({ length: count }, (_, i) => `
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">
            Paket ${i + 1}
          </label>
          <input 
            type="text" 
            id="package-name-${i}" 
            value="${names[i] || ''}"
            placeholder="z.B. ${defaultNames[count][i]}"
            style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;"
          >
        </div>
      `).join('')}
    </div>
  `;
}

window.updatePackageCount = function(count) {
  window.packageEditorState.packageCount = count;
  
  // Re-render package names section
  const container = document.getElementById('package-names-container');
  if (container) {
    container.innerHTML = renderPackageNameInputs();
  }
  
  // Update button styles
  document.querySelectorAll('.package-count-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.borderColor = '#e5e7eb';
    btn.style.background = 'white';
    btn.style.color = '#6b7280';
  });
  
  const activeBtn = Array.from(document.querySelectorAll('.package-count-btn')).find(
    btn => btn.textContent.trim() === count.toString()
  );
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.borderColor = '#2563eb';
    activeBtn.style.background = '#eff6ff';
    activeBtn.style.color = '#2563eb';
  }
};

// ==========================================
// STEP 3: COMPONENTS
// ==========================================

function renderStep3_Components() {
  const state = window.packageEditorState;
  
  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <h3 style="margin: 0 0 8px;">🧩 Komponenten pro Paket</h3>
      <p style="margin: 0 0 24px; color: #6b7280;">
        Welche Komponenten sind in jedem Paket enthalten?
      </p>
      
      <div id="package-components-container">
        ${state.packages.map((pkg, index) => `
          <div class="package-config-card" style="margin-bottom: 24px;">
            
            <!-- Package Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 700;
                  font-size: 18px;
                ">
                  ${pkg.short}
                </div>
                <div>
                  <div style="font-weight: 600; font-size: 16px;">${pkg.name}</div>
                  <div style="font-size: 13px; color: #6b7280;">Paket ${index + 1} von ${state.packages.length}</div>
                </div>
              </div>
              <button 
                onclick="addComponentToPackage(${index})"
                class="btn btn-secondary"
                style="padding: 8px 16px; font-size: 14px;"
              >
                ➕ Komponente
              </button>
            </div>
            
            <!-- Components List -->
            <div id="package-${index}-components">
              ${renderComponentsList(index)}
            </div>
            
          </div>
        `).join('')}
      </div>
      
      <!-- Info -->
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; margin-top: 24px;">
        <div style="display: flex; gap: 12px; align-items: start;">
          <div style="font-size: 20px;">💡</div>
          <div style="font-size: 14px; color: #92400e; line-height: 1.6;">
            <strong>Tipp:</strong> Höhere Pakete sollten alle Komponenten der niedrigeren Pakete enthalten + zusätzliche Features.
          </div>
        </div>
      </div>
      
    </div>
  `;
}

function renderComponentsList(packageIndex) {
  const state = window.packageEditorState;
  const components = state.packages[packageIndex].components;
  
  if (components.length === 0) {
    return `
      <div style="padding: 40px; text-align: center; color: #9ca3af; background: #f9fafb; border-radius: 8px; border: 2px dashed #e5e7eb;">
        <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
        <div style="font-weight: 500;">Noch keine Komponenten</div>
        <div style="font-size: 13px; margin-top: 4px;">Klicke "➕ Komponente" um zu starten</div>
      </div>
    `;
  }
  
  return components.map((comp, compIndex) => `
    <div class="component-item">
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 14px;">${comp.name}</div>
        <div style="font-size: 12px; color: #6b7280;">
          ${comp.type} • ${comp.pricing_type === 'one-time' ? 'Einmalig' : comp.pricing_type === 'monthly' ? 'Monatlich' : 'Jährlich'} • ${formatCurrency(comp.price)}
        </div>
      </div>
      <button 
        onclick="removeComponent(${packageIndex}, ${compIndex})"
        style="padding: 6px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;"
      >
        🗑️ Löschen
      </button>
    </div>
  `).join('');
}

function initializeComponentEditor() {
  // Called when step 3 is rendered
  console.log('✅ Component editor initialized');
}

window.addComponentToPackage = function(packageIndex) {
  const state = window.packageEditorState;
  
  // Simple prompt-based component addition
  const name = prompt('Komponenten-Name:', 'z.B. Basis-Analyse');
  if (!name) return;
  
  const type = prompt('Typ (Service/Software/Hardware):', 'Service');
  const pricingType = prompt('Pricing (one-time/monthly/annual):', 'one-time');
  const price = parseFloat(prompt('Preis in EUR:', '5000'));
  
  const component = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name: name,
    type: type,
    pricing_type: pricingType,
    price: price || 0,
    occurs_once: pricingType === 'one-time'
  };
  
  state.packages[packageIndex].components.push(component);
  
  // Re-render components list
  const container = document.getElementById(`package-${packageIndex}-components`);
  if (container) {
    container.innerHTML = renderComponentsList(packageIndex);
  }
};

window.removeComponent = function(packageIndex, componentIndex) {
  const state = window.packageEditorState;
  state.packages[packageIndex].components.splice(componentIndex, 1);
  
  // Re-render
  const container = document.getElementById(`package-${packageIndex}-components`);
  if (container) {
    container.innerHTML = renderComponentsList(packageIndex);
  }
};

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(value);
}