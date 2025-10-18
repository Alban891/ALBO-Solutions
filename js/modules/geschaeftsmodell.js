/**
 * CFO Dashboard - Geschäftsmodell Module V2
 * Business Model Canvas für Controller - mit KI-Unterstützung
 * 
 * Features:
 * - Section-basierte Validierung
 * - Inline-Badges für KI-Feedback
 * - Flexible Revenue Models (Multi-Select + Custom)
 * - Vorbereitet für KI-Panel Integration
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';
import { analyzeSection, validateGeschaeftsmodell } from './geschaeftsmodell-ki.js';

// ==========================================
// STATE
// ==========================================

let currentSectionAnalysis = {};
let completedSections = new Set();

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

  // Reset state
  currentSectionAnalysis = {};
  completedSections = new Set();

  container.innerHTML = `
    <div class="geschaeftsmodell-container">
      
      <!-- Header -->
      <div class="section-header" style="margin-bottom: 32px;">
        <div>
          <h3>🏗️ Geschäftsmodell</h3>
          <p style="color: var(--gray); margin-top: 8px;">
            Business Model Canvas - Verstehen Sie das Projekt strategisch
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

        <!-- ========================================== -->
        <!-- 1. KUNDENPROBLEM & KONTEXT -->
        <!-- ========================================== -->
        <div class="form-section gm-section" data-section="1" id="section-1">
          <div class="section-header-small">
            <h4>1️⃣ Kundenproblem & Kontext</h4>
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              💡 Warum ist das wichtig? Ein Senior Controller versteht: Ohne echten Schmerzpunkt keine Zahlungsbereitschaft.
            </small>
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
              Beschreiben Sie das konkrete Problem quantifizierbar (3-5 Sätze)
            </small>
          </div>

          <div class="form-group">
            <label>💰 Was kostet dieses Problem den Kunden heute?</label>
            <textarea 
              id="gm-problemkosten" 
              rows="3" 
              placeholder="z.B. 'Durchschnittlicher Mittelständler verliert ca. 400k€/Jahr durch Ineffizienzen, Ausschuss und Produktionsausfälle'"
            >${geschaeftsmodell.problemkosten || ''}</textarea>
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              💡 Tipp: Je höher die Kosten, desto höher die Zahlungsbereitschaft
            </small>
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

          <!-- Section Completion -->
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
            <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(1)">
              Abschnitt 1 abschließen & KI-Analyse →
            </button>
          </div>

          <!-- Inline Badge (wird dynamisch eingefügt) -->
          <div id="section-1-badge"></div>
        </div>

        <!-- ========================================== -->
        <!-- 2. ZIELKUNDEN -->
        <!-- ========================================== -->
        <div class="form-section gm-section" data-section="2" id="section-2">
          <div class="section-header-small">
            <h4>2️⃣ Zielkunden</h4>
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              💡 Warum ist das wichtig? Klar definierte Zielgruppe = fokussierte GTM-Strategie
            </small>
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
                <input type="checkbox" name="buying_center" value="cfo" ${geschaeftsmodell.buying_center?.includes('cfo') ? 'checked' : ''}>
                <span>CFO</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="buying_center" value="einkauf" ${geschaeftsmodell.buying_center?.includes('einkauf') ? 'checked' : ''}>
                <span>Einkauf</span>
              </label>
            </div>
            <small style="color: var(--gray); display: block; margin-top: 8px;">
              💡 Tipp: Bei Investments >100k€ ist typischerweise GF/CFO-Ebene involviert
            </small>
          </div>

          <!-- Section Completion -->
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
            <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(2)">
              Abschnitt 2 abschließen & KI-Analyse →
            </button>
          </div>

          <!-- Inline Badge -->
          <div id="section-2-badge"></div>
        </div>

        <!-- ========================================== -->
        <!-- 3. GESCHÄFTSMODELL & REVENUE STREAMS -->
        <!-- ========================================== -->
        <div class="form-section gm-section" data-section="3" id="section-3">
          <div class="section-header-small">
            <h4>3️⃣ Geschäftsmodell & Revenue Streams</h4>
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              💡 Warum ist das wichtig? Revenue Model bestimmt Planbarkeit, Skalierbarkeit und Bewertung
            </small>
          </div>

          <div class="form-group">
            <label>💼 Revenue Streams (Mehrfachauswahl möglich) *</label>
            <small style="color: var(--gray); display: block; margin-bottom: 8px;">
              Wählen Sie alle Umsatzquellen, die zum Geschäftsmodell gehören
            </small>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px;">
                <input type="checkbox" name="revenue_streams" value="software_license" ${geschaeftsmodell.revenue_streams?.includes('software_license') ? 'checked' : ''}>
                <span>Software-Lizenz (Einmalverkauf)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px;">
                <input type="checkbox" name="revenue_streams" value="hardware" ${geschaeftsmodell.revenue_streams?.includes('hardware') ? 'checked' : ''}>
                <span>Hardware-Komponenten (Einmalverkauf)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px;">
                <input type="checkbox" name="revenue_streams" value="subscription" ${geschaeftsmodell.revenue_streams?.includes('subscription') ? 'checked' : ''}>
                <span>Subscription / SaaS (wiederkehrend)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px;">
                <input type="checkbox" name="revenue_streams" value="usage_based" ${geschaeftsmodell.revenue_streams?.includes('usage_based') ? 'checked' : ''}>
                <span>Usage-Based / Pay-per-Use</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px;">
                <input type="checkbox" name="revenue_streams" value="maintenance" ${geschaeftsmodell.revenue_streams?.includes('maintenance') ? 'checked' : ''}>
                <span>Wartung & Support (jährlich)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px;">
                <input type="checkbox" name="revenue_streams" value="services" ${geschaeftsmodell.revenue_streams?.includes('services') ? 'checked' : ''}>
                <span>Professional Services (Consulting, Training)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px;">
                <input type="checkbox" name="revenue_streams" value="marketplace" ${geschaeftsmodell.revenue_streams?.includes('marketplace') ? 'checked' : ''}>
                <span>Marketplace / Platform (Commission)</span>
              </label>
            </div>
          </div>

          <!-- Custom Revenue Stream -->
          <div class="form-group">
            <label>➕ Weitere Revenue Streams (Custom)</label>
            <div id="custom-streams-container">
              ${renderCustomStreams(geschaeftsmodell.custom_streams || [])}
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="geschaeftsmodellModule.addCustomStream()" style="margin-top: 8px;">
              ➕ Eigenen Stream hinzufügen
            </button>
          </div>

          <!-- Revenue Model Summary -->
          <div class="form-group">
            <label>📝 Revenue Model Beschreibung *</label>
            <textarea 
              id="gm-revenue-erklaerung" 
              rows="4" 
              placeholder="Beispiel: 'Wir verkaufen eine Software-Lizenz einmalig (80k€), plus Hardware-Komponenten als Cross-Sell (30k€), plus eine jährliche Subscription für Updates & Support (12k€/Jahr). Gesamtumsatz im ersten Jahr: 122k€, danach 12k€/Jahr recurring.'"
              required
            >${geschaeftsmodell.revenue_erklaerung || ''}</textarea>
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              💡 Beschreiben Sie konkret: Was wird wann wie verkauft? Welche Preise? Welche Laufzeiten?
            </small>
          </div>

          <!-- Key Metrics für Revenue Model -->
          <div class="form-group">
            <label>📊 Wichtige Kennzahlen (falls bekannt)</label>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 8px;">
              <div>
                <label style="font-size: 13px; color: var(--gray);">Durchschn. Deal Size (k€)</label>
                <input type="number" id="gm-deal-size" placeholder="z.B. 150" value="${geschaeftsmodell.deal_size || ''}" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 13px; color: var(--gray);">Sales Cycle (Monate)</label>
                <input type="number" id="gm-sales-cycle" placeholder="z.B. 6" value="${geschaeftsmodell.sales_cycle || ''}" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 13px; color: var(--gray);">Vertragslaufzeit (Monate)</label>
                <input type="number" id="gm-contract-length" placeholder="z.B. 24" value="${geschaeftsmodell.contract_length || ''}" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 13px; color: var(--gray);">Erwartete Churn Rate (%)</label>
                <input type="number" id="gm-churn-rate" placeholder="z.B. 15" value="${geschaeftsmodell.churn_rate || ''}" style="width: 100%;">
              </div>
            </div>
          </div>

          <!-- Section Completion -->
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
            <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(3)">
              Abschnitt 3 abschließen & KI-Analyse →
            </button>
          </div>

          <!-- Inline Badge -->
          <div id="section-3-badge"></div>
        </div>

        <!-- ========================================== -->
        <!-- 4. UNSERE LÖSUNG -->
        <!-- ========================================== -->
        <div class="form-section gm-section" data-section="4" id="section-4">
          <div class="section-header-small">
            <h4>4️⃣ Unsere Lösung</h4>
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              💡 Warum ist das wichtig? Value Proposition muss zum Problem passen und differenziert sein
            </small>
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
              placeholder="z.B. 'Flexibles Robotik-System mit 70% geringeren Implementierungskosten als traditionelle Lösungen. Plug-and-Play Installation in 2 Wochen statt 6 Monaten. KI-gesteuerte Prozessoptimierung steigert Produktivität um 40%.'"
              required
            >${geschaeftsmodell.value_proposition || ''}</textarea>
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              💡 Quantifizieren Sie den Nutzen! Prozente, Zeitersparnis, Kostenreduktion
            </small>
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

          <!-- Section Completion -->
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
            <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(4)">
              Abschnitt 4 abschließen & KI-Analyse →
            </button>
          </div>

          <!-- Inline Badge -->
          <div id="section-4-badge"></div>
        </div>

        <!-- ========================================== -->
        <!-- 5. ZUSÄTZLICHE NOTIZEN -->
        <!-- ========================================== -->
        <div class="form-section gm-section" data-section="5" id="section-5">
          <div class="section-header-small">
            <h4>5️⃣ Zusätzliche Notizen (Optional)</h4>
          </div>

          <div class="form-group">
            <textarea 
              id="gm-notizen" 
              rows="4" 
              placeholder="z.B. 'Wichtig: Kunde braucht CE-Zertifizierung. Launch-Kunde bereits identifiziert (Firma XYZ). Patent-Anmeldung läuft.'"
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

/**
 * Render custom revenue streams
 */
function renderCustomStreams(streams) {
  if (!streams || streams.length === 0) {
    return '';
  }

  return streams.map((stream, index) => `
    <div class="custom-stream-item" style="display: flex; gap: 8px; margin-bottom: 8px;">
      <input type="text" class="custom-stream-input" value="${helpers.escapeHtml(stream)}" placeholder="z.B. Daten-Monetarisierung" style="flex: 1;" />
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

/**
 * Add custom revenue stream
 */
export function addCustomStream() {
  const container = document.getElementById('custom-streams-container');
  if (!container) return;

  const streamHtml = `
    <div class="custom-stream-item" style="display: flex; gap: 8px; margin-bottom: 8px;">
      <input type="text" class="custom-stream-input" placeholder="z.B. Daten-Monetarisierung" style="flex: 1;" />
      <button type="button" class="btn-icon btn-danger" onclick="this.parentElement.remove()">🗑️</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', streamHtml);
}

// ==========================================
// SECTION VALIDATION
// ==========================================

/**
 * Complete section and trigger KI analysis
 */
export function completeSection(sectionNumber) {
  console.log('🔍 Completing section:', sectionNumber);

  // Collect data for this section
  const sectionData = collectSectionData(sectionNumber);
  
  // Analyze with KI
  const analysis = analyzeSection(sectionNumber, sectionData);
  
  // Store analysis
  currentSectionAnalysis[sectionNumber] = analysis;
  completedSections.add(sectionNumber);
  
  // Display inline badge
  displayInlineBadge(sectionNumber, analysis);
  
  // TODO: Later - send to KI Panel
  // updateKIPanel(analysis);
  
  // Scroll to next section
  scrollToNextSection(sectionNumber);
  
  console.log('✅ Section analysis:', analysis);
}

/**
 * Collect data for specific section
 */
function collectSectionData(sectionNumber) {
  const form = document.getElementById('geschaeftsmodell-form');
  if (!form) return {};

  const getCheckboxValues = (name) => {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`))
      .map(cb => cb.value);
  };

  const getRadioValue = (name) => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
  };

  switch (sectionNumber) {
    case 1:
      return {
        kundenproblem: document.getElementById('gm-kundenproblem')?.value || '',
        problemkosten: document.getElementById('gm-problemkosten')?.value || '',
        urgency: getRadioValue('urgency')
      };
    
    case 2:
      return {
        kundentyp: getCheckboxValues('kundentyp'),
        unternehmensgroesse: getCheckboxValues('unternehmensgroesse'),
        branchen: getCheckboxValues('branchen'),
        geografie: getCheckboxValues('geografie'),
        kundenprofil: document.getElementById('gm-kundenprofil')?.value || '',
        buying_center: getCheckboxValues('buying_center')
      };
    
    case 3:
      const customStreams = Array.from(document.querySelectorAll('.custom-stream-input'))
        .map(input => input.value.trim())
        .filter(val => val !== '');
      
      return {
        revenue_streams: getCheckboxValues('revenue_streams'),
        custom_streams: customStreams,
        revenue_erklaerung: document.getElementById('gm-revenue-erklaerung')?.value || '',
        deal_size: document.getElementById('gm-deal-size')?.value || '',
        sales_cycle: document.getElementById('gm-sales-cycle')?.value || '',
        contract_length: document.getElementById('gm-contract-length')?.value || '',
        churn_rate: document.getElementById('gm-churn-rate')?.value || ''
      };
    
    case 4:
      const features = Array.from(document.querySelectorAll('.feature-input'))
        .map(input => input.value.trim())
        .filter(val => val !== '');
      
      return {
        produktkategorie: document.getElementById('gm-produktkategorie')?.value || '',
        value_proposition: document.getElementById('gm-value-proposition')?.value || '',
        features: features,
        wettbewerbsvorteil: getCheckboxValues('wettbewerbsvorteil')
      };
    
    default:
      return {};
  }
}

/**
 * Display inline badge with analysis results
 */
function displayInlineBadge(sectionNumber, analysis) {
  const badgeContainer = document.getElementById(`section-${sectionNumber}-badge`);
  if (!badgeContainer) return;

  const issueCount = analysis.issues.length;
  const tipCount = analysis.tips.length;

  if (issueCount === 0 && tipCount === 0) {
    // All good
    badgeContainer.innerHTML = `
      <div class="inline-badge badge-success" style="margin-top: 16px;">
        <span style="font-size: 20px;">✅</span>
        <div>
          <strong>Abschnitt ${sectionNumber} vollständig</strong>
          <div style="font-size: 13px; margin-top: 2px;">Keine kritischen Punkte gefunden</div>
        </div>
      </div>
    `;
  } else {
    // Has issues or tips
    badgeContainer.innerHTML = `
      <div class="inline-badge badge-warning" style="margin-top: 16px;">
        <span style="font-size: 20px;">⚠️</span>
        <div style="flex: 1;">
          <strong>${issueCount} ${issueCount === 1 ? 'Hinweis' : 'Hinweise'} zur Prüfung</strong>
          <div style="font-size: 13px; margin-top: 4px;">
            ${analysis.issues.map(issue => `• ${issue.title}`).join('<br>')}
          </div>
          ${tipCount > 0 ? `<div style="font-size: 13px; margin-top: 8px; color: var(--primary);">💡 ${tipCount} Verbesserungsvorschläge verfügbar</div>` : ''}
        </div>
        <button class="btn btn-sm btn-secondary" onclick="geschaeftsmodellModule.showSectionDetails(${sectionNumber})">
          Details anzeigen
        </button>
      </div>
    `;
  }

  // Scroll badge into view
  badgeContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Show section details in modal
 */
export function showSectionDetails(sectionNumber) {
  const analysis = currentSectionAnalysis[sectionNumber];
  if (!analysis) return;

  let detailsHtml = `
    <div style="max-width: 600px;">
      <h3 style="margin-bottom: 16px;">🤖 KI-Analyse: Abschnitt ${sectionNumber}</h3>
  `;

  // Critical issues
  if (analysis.issues.length > 0) {
    detailsHtml += `
      <div style="margin-bottom: 20px;">
        <h4 style="color: var(--danger); margin-bottom: 12px;">⚠️ Zu prüfen:</h4>
        ${analysis.issues.map(issue => `
          <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid var(--danger); border-radius: 4px; margin-bottom: 8px;">
            <strong>${issue.title}</strong>
            <div style="margin-top: 4px; font-size: 14px;">${issue.message}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Tips
  if (analysis.tips.length > 0) {
    detailsHtml += `
      <div style="margin-bottom: 20px;">
        <h4 style="color: var(--primary); margin-bottom: 12px;">💡 Verbesserungsvorschläge:</h4>
        ${analysis.tips.map(tip => `
          <div style="padding: 12px; background: rgba(37, 99, 235, 0.1); border-left: 3px solid var(--primary); border-radius: 4px; margin-bottom: 8px;">
            <strong>${tip.title}</strong>
            <div style="margin-top: 4px; font-size: 14px;">${tip.message}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Quality score
  detailsHtml += `
    <div style="padding: 16px; background: var(--bg-secondary); border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600;">Qualitäts-Score:</span>
        <span style="font-size: 24px; font-weight: 700; color: ${getScoreColor(analysis.quality_score)};">
          ${analysis.quality_score}/10
        </span>
      </div>
    </div>
  `;

  detailsHtml += `</div>`;

  // Show in alert (später: Modal oder KI-Panel)
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = detailsHtml;
  tempDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 24px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); z-index: 10000; max-height: 80vh; overflow-y: auto;';
  
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;';
  overlay.onclick = () => {
    document.body.removeChild(overlay);
    document.body.removeChild(tempDiv);
  };
  
  document.body.appendChild(overlay);
  document.body.appendChild(tempDiv);
}

/**
 * Get color for score
 */
function getScoreColor(score) {
  if (score >= 8) return 'var(--success)';
  if (score >= 6) return 'var(--warning)';
  return 'var(--danger)';
}

/**
 * Scroll to next section
 */
function scrollToNextSection(currentSection) {
  const nextSection = document.getElementById(`section-${currentSection + 1}`);
  if (nextSection) {
    setTimeout(() => {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
  }
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
  const checkboxGroups = ['kundentyp', 'urgency', 'revenue_streams'];
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
 * Collect complete form data
 */
function collectFormData() {
  const form = document.getElementById('geschaeftsmodell-form');
  if (!form) return null;

  const getCheckboxValues = (name) => {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`))
      .map(cb => cb.value);
  };

  const getRadioValue = (name) => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
  };

  // Collect features
  const features = Array.from(document.querySelectorAll('.feature-input'))
    .map(input => input.value.trim())
    .filter(val => val !== '');

  // Collect custom streams
  const customStreams = Array.from(document.querySelectorAll('.custom-stream-input'))
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
    revenue_streams: getCheckboxValues('revenue_streams'),
    custom_streams: customStreams,
    revenue_erklaerung: document.getElementById('gm-revenue-erklaerung')?.value || '',
    deal_size: document.getElementById('gm-deal-size')?.value || '',
    sales_cycle: document.getElementById('gm-sales-cycle')?.value || '',
    contract_length: document.getElementById('gm-contract-length')?.value || '',
    churn_rate: document.getElementById('gm-churn-rate')?.value || '',

    // Section 4
    produktkategorie: document.getElementById('gm-produktkategorie')?.value || '',
    value_proposition: document.getElementById('gm-value-proposition')?.value || '',
    features: features,
    wettbewerbsvorteil: getCheckboxValues('wettbewerbsvorteil'),

    // Section 5
    notizen: document.getElementById('gm-notizen')?.value || '',

    // Meta
    completed_sections: Array.from(completedSections),
    section_analysis: currentSectionAnalysis
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

  if (!data.revenue_streams || data.revenue_streams.length === 0) {
    alert('Bitte wählen Sie mindestens einen Revenue Stream');
    return;
  }

  if (!data.revenue_erklaerung || data.revenue_erklaerung.trim() === '') {
    alert('Bitte beschreiben Sie das Revenue Model');
    return;
  }

  // Perform full validation
  const validation = validateGeschaeftsmodell(data);
  
  if (validation.critical_issues.length > 0) {
    const proceed = confirm(
      `KI hat ${validation.critical_issues.length} kritische Punkte identifiziert:\n\n` +
      validation.critical_issues.map(issue => `• ${issue.title}`).join('\n') +
      '\n\nTrotzdem speichern?'
    );
    
    if (!proceed) return;
  }

  // Save to state
  state.setGeschaeftsmodell(projektId, data);

  console.log('✅ Geschäftsmodell saved:', data);

  // Show success message
  if (window.cfoDashboard.aiController) {
    window.cfoDashboard.aiController.addAIMessage({
      level: 'success',
      title: '✅ Geschäftsmodell gespeichert',
      text: `Business Model erfolgreich dokumentiert. Qualitäts-Score: ${validation.overall_score}/10`,
      timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
    });
  }

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

    const customStreamsContainer = document.getElementById('custom-streams-container');
    if (customStreamsContainer) {
      customStreamsContainer.innerHTML = '';
    }

    // Clear badges
    for (let i = 1; i <= 5; i++) {
      const badge = document.getElementById(`section-${i}-badge`);
      if (badge) badge.innerHTML = '';
    }

    // Reset state
    currentSectionAnalysis = {};
    completedSections = new Set();
    
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
  addFeature,
  addCustomStream,
  completeSection,
  showSectionDetails
};

console.log('📦 Geschäftsmodell module V2 loaded');
