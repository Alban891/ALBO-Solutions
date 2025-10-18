/**
 * CFO Dashboard - Geschäftsmodell Module
 * Business Model Canvas für Controller - Tiefes Verständnis des Projekts
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';

// ==========================================
// RENDER GESCHÄFTSMODELL TAB
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

  console.log('🏗️ Rendering Geschäftsmodell for:', projekt.name);

  const container = document.getElementById('projekt-tab-geschaeftsmodell');
  if (!container) {
    console.error('Geschäftsmodell container not found');
    return;
  }

  // Load existing Geschäftsmodell data
  const geschaeftsmodell = state.getGeschaeftsmodell(projektId) || {};

  container.innerHTML = `
    <div class="geschaeftsmodell-container">
      
      <!-- Header -->
      <div class="section-header" style="margin-bottom: 32px;">
        <div>
          <h3>🏗️ Geschäftsmodell</h3>
          <p style="color: var(--gray); margin-top: 8px;">
            Verstehen Sie das Projekt im Detail - als Basis für fundierte Beratung
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

        <!-- 1. KUNDENPROBLEM & KONTEXT -->
        <div class="form-section gm-section" data-section="1">
          <div class="section-header-small">
            <h4>1️⃣ Kundenproblem & Kontext</h4>
          </div>

          <div class="form-group">
            <label>🎯 Welches Problem lösen wir? *</label>
            <textarea 
              id="gm-kundenproblem" 
              rows="4" 
              placeholder="z.B. 'Mittelständische Fertigungsbetriebe haben massive Probleme mit Fachkräftemangel. Manuelle Prozesse sind zu langsam und fehleranfällig...'"
              required
            >${geschaeftsmodell.kundenproblem || ''}</textarea>
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              Beschreiben Sie das konkrete Problem, das Ihre Kunden haben (3-5 Sätze)
            </small>
          </div>

          <div class="form-group">
            <label>💰 Was kostet dieses Problem den Kunden heute?</label>
            <textarea 
              id="gm-problemkosten" 
              rows="3" 
              placeholder="z.B. 'Durchschnittlicher Mittelständler verliert ca. 400k€/Jahr durch Ineffizienzen, Ausschuss und Produktionsausfälle'"
            >${geschaeftsmodell.problemkosten || ''}</textarea>
          </div>

          <div class="form-group">
            <label>⚡ Wie dringend ist das Problem?</label>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="urgency" value="akut" ${geschaeftsmodell.urgency === 'akut' ? 'checked' : ''}>
                <span>Akut (sofortiger Handlungsbedarf)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="urgency" value="hoch" ${geschaeftsmodell.urgency === 'hoch' ? 'checked' : ''}>
                <span>Hoch (innerhalb 6-12 Monate lösen)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="urgency" value="mittel" ${geschaeftsmodell.urgency === 'mittel' ? 'checked' : ''}>
                <span>Mittel (Nice-to-have, Budget vorhanden)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="urgency" value="niedrig" ${geschaeftsmodell.urgency === 'niedrig' ? 'checked' : ''}>
                <span>Niedrig (Visionär, kein Druck)</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 2. ZIELKUNDEN -->
        <div class="form-section gm-section" data-section="2">
          <div class="section-header-small">
            <h4>2️⃣ Zielkunden</h4>
          </div>

          <div class="form-group">
            <label>👥 Kundentyp *</label>
            <div style="display: flex; gap: 16px; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="kundentyp" value="b2b" ${geschaeftsmodell.kundentyp?.includes('b2b') ? 'checked' : ''}>
                <span>B2B</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="kundentyp" value="b2c" ${geschaeftsmodell.kundentyp?.includes('b2c') ? 'checked' : ''}>
                <span>B2C</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="kundentyp" value="b2g" ${geschaeftsmodell.kundentyp?.includes('b2g') ? 'checked' : ''}>
                <span>B2G</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>📊 Unternehmensgröße (Zielkunden)</label>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="unternehmensgroesse" value="konzerne" ${geschaeftsmodell.unternehmensgroesse?.includes('konzerne') ? 'checked' : ''}>
                <span>Konzerne (>5000 MA)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="unternehmensgroesse" value="grossmittelstand" ${geschaeftsmodell.unternehmensgroesse?.includes('grossmittelstand') ? 'checked' : ''}>
                <span>Großer Mittelstand (500-5000 MA)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="unternehmensgroesse" value="mittelstand" ${geschaeftsmodell.unternehmensgroesse?.includes('mittelstand') ? 'checked' : ''}>
                <span>Mittelstand (50-500 MA)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="unternehmensgroesse" value="kmu" ${geschaeftsmodell.unternehmensgroesse?.includes('kmu') ? 'checked' : ''}>
                <span>KMU (<50 MA)</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>🏭 Branchen</label>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="branchen" value="automotive" ${geschaeftsmodell.branchen?.includes('automotive') ? 'checked' : ''}>
                <span>Automotive</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="branchen" value="maschinenbau" ${geschaeftsmodell.branchen?.includes('maschinenbau') ? 'checked' : ''}>
                <span>Maschinenbau</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="branchen" value="elektronik" ${geschaeftsmodell.branchen?.includes('elektronik') ? 'checked' : ''}>
                <span>Elektronik</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="branchen" value="pharma" ${geschaeftsmodell.branchen?.includes('pharma') ? 'checked' : ''}>
                <span>Pharma</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="branchen" value="lebensmittel" ${geschaeftsmodell.branchen?.includes('lebensmittel') ? 'checked' : ''}>
                <span>Lebensmittel</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="branchen" value="chemie" ${geschaeftsmodell.branchen?.includes('chemie') ? 'checked' : ''}>
                <span>Chemie</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>🌍 Geografischer Fokus</label>
            <div style="display: flex; gap: 16px; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="geografie" value="dach" ${geschaeftsmodell.geografie?.includes('dach') ? 'checked' : ''}>
                <span>DACH</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="geografie" value="europa" ${geschaeftsmodell.geografie?.includes('europa') ? 'checked' : ''}>
                <span>Europa</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="geografie" value="usa" ${geschaeftsmodell.geografie?.includes('usa') ? 'checked' : ''}>
                <span>USA</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="geografie" value="global" ${geschaeftsmodell.geografie?.includes('global') ? 'checked' : ''}>
                <span>Global</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>💬 Typisches Kundenprofil (Beschreibung)</label>
            <textarea 
              id="gm-kundenprofil" 
              rows="3" 
              placeholder="z.B. 'Mittelständischer Automobilzulieferer, 200-800 Mitarbeiter, 30-80M€ Umsatz...'"
            >${geschaeftsmodell.kundenprofil || ''}</textarea>
          </div>

          <div class="form-group">
            <label>🎯 Buying Center - Wer entscheidet?</label>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="buying_center" value="geschaeftsfuehrung" ${geschaeftsmodell.buying_center?.includes('geschaeftsfuehrung') ? 'checked' : ''}>
                <span>Geschäftsführung</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="buying_center" value="coo" ${geschaeftsmodell.buying_center?.includes('coo') ? 'checked' : ''}>
                <span>COO / Produktionsleiter</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="buying_center" value="cto" ${geschaeftsmodell.buying_center?.includes('cto') ? 'checked' : ''}>
                <span>CTO</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="buying_center" value="einkauf" ${geschaeftsmodell.buying_center?.includes('einkauf') ? 'checked' : ''}>
                <span>Einkauf</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 3. GESCHÄFTSMODELL-TYP -->
        <div class="form-section gm-section" data-section="3">
          <div class="section-header-small">
            <h4>3️⃣ Geschäftsmodell-Typ</h4>
          </div>

          <div class="form-group">
            <label>💼 Wie verdienen wir Geld? (Primary Revenue Model) *</label>
            <select id="gm-revenue-model" required style="margin-top: 8px;">
              <option value="">Bitte wählen...</option>
              <option value="einmalverkauf" ${geschaeftsmodell.revenue_model === 'einmalverkauf' ? 'selected' : ''}>Einmalverkauf (Hardware, Software-Lizenz)</option>
              <option value="subscription" ${geschaeftsmodell.revenue_model === 'subscription' ? 'selected' : ''}>Subscription / SaaS</option>
              <option value="hybrid" ${geschaeftsmodell.revenue_model === 'hybrid' ? 'selected' : ''}>Hybrid (Hardware + Subscription)</option>
              <option value="usage_based" ${geschaeftsmodell.revenue_model === 'usage_based' ? 'selected' : ''}>Usage-Based / Pay-per-Use</option>
              <option value="freemium" ${geschaeftsmodell.revenue_model === 'freemium' ? 'selected' : ''}>Freemium</option>
              <option value="marketplace" ${geschaeftsmodell.revenue_model === 'marketplace' ? 'selected' : ''}>Marketplace / Platform</option>
              <option value="services" ${geschaeftsmodell.revenue_model === 'services' ? 'selected' : ''}>Professional Services / Beratung</option>
              <option value="licensing" ${geschaeftsmodell.revenue_model === 'licensing' ? 'selected' : ''}>Lizenzierung / IP Licensing</option>
            </select>
          </div>

          <div class="form-group">
            <label>💡 Zusätzliche Revenue Streams (Optional)</label>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="additional_streams" value="maintenance" ${geschaeftsmodell.additional_streams?.includes('maintenance') ? 'checked' : ''}>
                <span>Wartung & Support (jährlicher Vertrag)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="additional_streams" value="services" ${geschaeftsmodell.additional_streams?.includes('services') ? 'checked' : ''}>
                <span>Professional Services (Consulting, Training)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="additional_streams" value="spare_parts" ${geschaeftsmodell.additional_streams?.includes('spare_parts') ? 'checked' : ''}>
                <span>Spare Parts / Verbrauchsmaterial</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="additional_streams" value="upselling" ${geschaeftsmodell.additional_streams?.includes('upselling') ? 'checked' : ''}>
                <span>Upselling / Zusatzmodule</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="additional_streams" value="data_analytics" ${geschaeftsmodell.additional_streams?.includes('data_analytics') ? 'checked' : ''}>
                <span>Data Analytics / Insights</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>📝 Geschäftsmodell-Erläuterung</label>
            <textarea 
              id="gm-revenue-erklaerung" 
              rows="4" 
              placeholder="z.B. 'Wir verkaufen Hardware-Roboter als Einmalverkauf (150k€), dazu kommt eine Software-Subscription (1.200€/Monat)...'"
            >${geschaeftsmodell.revenue_erklaerung || ''}</textarea>
          </div>
        </div>

        <!-- 4. UNSERE LÖSUNG -->
        <div class="form-section gm-section" data-section="4">
          <div class="section-header-small">
            <h4>4️⃣ Unsere Lösung</h4>
          </div>

          <div class="form-group">
            <label>🚀 Was bieten wir konkret an? *</label>
            <select id="gm-produktkategorie" required style="margin-top: 8px;">
              <option value="">Bitte wählen...</option>
              <option value="hardware" ${geschaeftsmodell.produktkategorie === 'hardware' ? 'selected' : ''}>Hardware (physisches Produkt)</option>
              <option value="software" ${geschaeftsmodell.produktkategorie === 'software' ? 'selected' : ''}>Software (Cloud/On-Premise)</option>
              <option value="hardware_software" ${geschaeftsmodell.produktkategorie === 'hardware_software' ? 'selected' : ''}>Hardware + Software (kombiniert)</option>
              <option value="service" ${geschaeftsmodell.produktkategorie === 'service' ? 'selected' : ''}>Service / Dienstleistung</option>
              <option value="platform" ${geschaeftsmodell.produktkategorie === 'platform' ? 'selected' : ''}>Platform / Marketplace</option>
            </select>
          </div>

          <div class="form-group">
            <label>💎 Value Proposition (Unser Nutzenversprechen) *</label>
            <textarea 
              id="gm-value-proposition" 
              rows="4" 
              placeholder="z.B. 'Flexibles Robotik-System mit 70% geringeren Implementierungskosten als traditionelle Lösungen...'"
              required
            >${geschaeftsmodell.value_proposition || ''}</textarea>
          </div>

          <div class="form-group">
            <label>⚡ Hauptmerkmale / Key Features</label>
            <div id="gm-features-container">
              ${renderFeaturesList(geschaeftsmodell.features || [])}
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="geschaeftsmodellModule.addFeature()" style="margin-top: 8px;">
              ➕ Feature hinzufügen
            </button>
          </div>

          <div class="form-group">
            <label>🏆 Wettbewerbsvorteil / Differenzierung</label>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="wettbewerbsvorteil" value="preis" ${geschaeftsmodell.wettbewerbsvorteil?.includes('preis') ? 'checked' : ''}>
                <span>Preis (günstiger)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="wettbewerbsvorteil" value="technologie" ${geschaeftsmodell.wettbewerbsvorteil?.includes('technologie') ? 'checked' : ''}>
                <span>Technologie (innovativ)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="wettbewerbsvorteil" value="speed" ${geschaeftsmodell.wettbewerbsvorteil?.includes('speed') ? 'checked' : ''}>
                <span>Speed-to-Market</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="wettbewerbsvorteil" value="marke" ${geschaeftsmodell.wettbewerbsvorteil?.includes('marke') ? 'checked' : ''}>
                <span>Marke / Reputation</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="wettbewerbsvorteil" value="netzwerk" ${geschaeftsmodell.wettbewerbsvorteil?.includes('netzwerk') ? 'checked' : ''}>
                <span>Netzwerk / Ökosystem</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="wettbewerbsvorteil" value="flexibilitaet" ${geschaeftsmodell.wettbewerbsvorteil?.includes('flexibilitaet') ? 'checked' : ''}>
                <span>Flexibilität / Customization</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="wettbewerbsvorteil" value="support" ${geschaeftsmodell.wettbewerbsvorteil?.includes('support') ? 'checked' : ''}>
                <span>Support / Service</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 5. ZUSÄTZLICHE NOTIZEN -->
        <div class="form-section gm-section" data-section="5">
          <div class="section-header-small">
            <h4>5️⃣ Zusätzliche Notizen (Optional)</h4>
          </div>

          <div class="form-group">
            <textarea 
              id="gm-notizen" 
              rows="4" 
              placeholder="z.B. 'Wichtig: Kunde braucht CE-Zertifizierung. Launch-Kunde bereits identifiziert...'"
            >${geschaeftsmodell.notizen || ''}</textarea>
          </div>
        </div>

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

  // Initialize progress tracking
  updateProgress();
  
  // Add change listeners for auto-progress update
  const form = document.getElementById('geschaeftsmodell-form');
  if (form) {
    form.addEventListener('input', updateProgress);
    form.addEventListener('change', updateProgress);
  }
}

// ==========================================
// RENDER HELPERS
// ==========================================

/**
 * Render features list
 */
function renderFeaturesList(features) {
  if (!features || features.length === 0) {
    return `
      <div class="feature-item">
        <input type="text" class="feature-input" placeholder="z.B. KI-gestützte Prozessoptimierung" />
        <button type="button" class="btn-icon btn-danger" onclick="this.parentElement.remove()">🗑️</button>
      </div>
    `;
  }

  return features.map((feature, index) => `
    <div class="feature-item">
      <input type="text" class="feature-input" value="${helpers.escapeHtml(feature)}" />
      <button type="button" class="btn-icon btn-danger" onclick="this.parentElement.remove()">🗑️</button>
    </div>
  `).join('');
}

// ==========================================
// FORM ACTIONS
// ==========================================

/**
 * Add feature to list
 */
export function addFeature() {
  const container = document.getElementById('gm-features-container');
  if (!container) return;

  const featureHtml = `
    <div class="feature-item">
      <input type="text" class="feature-input" placeholder="z.B. Cloud-Anbindung" />
      <button type="button" class="btn-icon btn-danger" onclick="this.parentElement.remove()">🗑️</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', featureHtml);
}

// ==========================================
// PROGRESS TRACKING
// ==========================================

/**
 * Update progress bar based on filled fields
 */
function updateProgress() {
  const form = document.getElementById('geschaeftsmodell-form');
  if (!form) return;

  // Count required fields
  const requiredFields = form.querySelectorAll('[required]');
  let filledCount = 0;

  requiredFields.forEach(field => {
    if (field.value && field.value.trim() !== '') {
      filledCount++;
    }
  });

  // Count checkboxes and radios (at least one checked per group)
  const checkboxGroups = ['kundentyp', 'urgency'];
  checkboxGroups.forEach(groupName => {
    const checked = form.querySelector(`input[name="${groupName}"]:checked`);
    if (checked) filledCount++;
  });

  const totalRequired = requiredFields.length + checkboxGroups.length;
  const percentage = Math.round((filledCount / totalRequired) * 100);

  // Update progress bar
  const progressBar = document.getElementById('gm-progress-bar');
  const progressText = document.getElementById('gm-progress-text');

  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (progressText) progressText.textContent = `${percentage}%`;
}

// ==========================================
// SAVE & LOAD
// ==========================================

/**
 * Collect form data
 */
function collectFormData() {
  const form = document.getElementById('geschaeftsmodell-form');
  if (!form) return null;

  // Helper function to get checkbox values
  const getCheckboxValues = (name) => {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`))
      .map(cb => cb.value);
  };

  // Helper function to get radio value
  const getRadioValue = (name) => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
  };

  // Collect features
  const features = Array.from(document.querySelectorAll('.feature-input'))
    .map(input => input.value.trim())
    .filter(val => val !== '');

  return {
    // Section 1
    kundenproblem: document.getElementById('gm-kundenproblem')?.value || '',
    problemkosten: document.getElementById('gm-problemkosten')?.value || '',
    urgency: getRadioValue('urgency'),

    // Section 2
    kundentyp: getCheckboxValues('kundentyp'),
    unternehmensgroesse: getCheckboxValues('unternehmensgroesse'),
    branchen: getCheckboxValues('branchen'),
    geografie: getCheckboxValues('geografie'),
    kundenprofil: document.getElementById('gm-kundenprofil')?.value || '',
    buying_center: getCheckboxValues('buying_center'),

    // Section 3
    revenue_model: document.getElementById('gm-revenue-model')?.value || '',
    additional_streams: getCheckboxValues('additional_streams'),
    revenue_erklaerung: document.getElementById('gm-revenue-erklaerung')?.value || '',

    // Section 4
    produktkategorie: document.getElementById('gm-produktkategorie')?.value || '',
    value_proposition: document.getElementById('gm-value-proposition')?.value || '',
    features: features,
    wettbewerbsvorteil: getCheckboxValues('wettbewerbsvorteil'),

    // Section 5
    notizen: document.getElementById('gm-notizen')?.value || ''
  };
}

/**
 * Save Geschäftsmodell
 */
export function saveGeschaeftsmodell() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) {
    alert('Kein Projekt ausgewählt');
    return;
  }

  const data = collectFormData();
  if (!data) {
    alert('Fehler beim Sammeln der Daten');
    return;
  }

  // Validate required fields
  if (!data.kundenproblem || data.kundenproblem.trim() === '') {
    alert('Bitte beschreiben Sie das Kundenproblem');
    return;
  }

  if (!data.revenue_model) {
    alert('Bitte wählen Sie ein Revenue Model');
    return;
  }

  // Save to state
  state.setGeschaeftsmodell(projektId, data);

  console.log('✅ Geschäftsmodell saved:', data);

  // Show success message
  if (window.cfoDashboard.aiController) {
    window.cfoDashboard.aiController.addAIMessage({
      level: 'success',
      title: '✅ Geschäftsmodell gespeichert',
      text: 'Business Model erfolgreich dokumentiert.',
      timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
    });
  }

  // Optional: Show toast notification
  showSuccessToast('Geschäftsmodell gespeichert');
}

/**
 * Reset form
 */
export function resetForm() {
  const confirm = window.confirm('Wirklich alle Eingaben zurücksetzen?');
  if (!confirm) return;

  const form = document.getElementById('geschaeftsmodell-form');
  if (form) {
    form.reset();
    
    // Clear dynamically added items
    const featuresContainer = document.getElementById('gm-features-container');
    if (featuresContainer) {
      featuresContainer.innerHTML = renderFeaturesList([]);
    }
    
    updateProgress();
  }
}

// ==========================================
// UTILITY
// ==========================================

/**
 * Show success toast
 */
function showSuccessToast(message) {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background: var(--success);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = `✅ ${message}`;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// EXPORTS
// ==========================================

export default {
  renderGeschaeftsmodell,
  saveGeschaeftsmodell,
  resetForm,
  addFeature
};

console.log('📦 Geschäftsmodell module loaded');
