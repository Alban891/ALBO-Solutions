/**
 * UI für Artikel-Vorschläge mit 3 Tabs
 * Tab 1: Schnell (aus Section 5 Checkboxen)
 * Tab 2: KI-Assist (Deep Analysis)
 * Tab 3: Manuell (Freie Eingabe)
 * 
 * PRODUCTION VERSION - Integriert mit bestehender API
 */

import { suggestArtikelFromGeschaeftsmodell } from './artikel-ai-complete.js';
import { state } from '../../state.js';
import * as api from '../../api.js';

// ==========================================
// MAIN ENTRY POINT
// ==========================================

/**
 * Öffne Artikel-Erstellungs-Modal mit 3 Tabs
 * @param {string} projektId - ID des aktuellen Projekts
 */
export async function openArtikelCreationModal(projektId) {
  console.log('🤖 Öffne Artikel-Erstellung für Projekt:', projektId);
  
  const projekt = state.getProjekt(projektId);
  if (!projekt) {
    alert('Projekt nicht gefunden!');
    return;
  }
  
  const geschaeftsmodell = projekt.geschaeftsmodell || {};
  
  // Check ob Section 5 ausgefüllt ist
  if (!geschaeftsmodell.revenue_streams || geschaeftsmodell.revenue_streams.length === 0) {
    const goToGM = confirm(
      '⚠️ Section 5 "Geschäftsmodell & Revenue" ist noch nicht ausgefüllt.\n\n' +
      'Die KI kann bessere Vorschläge machen, wenn du zuerst das Geschäftsmodell ausfüllst.\n\n' +
      'Möchtest du jetzt zum Geschäftsmodell wechseln?'
    );
    
    if (goToGM) {
      // Switch to Geschäftsmodell tab
      const gmTab = document.querySelector('[data-tab="geschaeftsmodell"]');
      if (gmTab) gmTab.click();
      return;
    }
  }
  
  // Analysiere Geschäftsmodell
  const analysis = await suggestArtikelFromGeschaeftsmodell(geschaeftsmodell);
  
  // Zeige Modal
  showArtikelModal(projektId, geschaeftsmodell, analysis);
}

// ==========================================
// MODAL RENDERING
// ==========================================

function showArtikelModal(projektId, gm, analysis) {
  // Speichere Analysis für späteren Zugriff
  window.modalAnalysis = analysis;
  window.modalProjektId = projektId;
  window.selectedArtikel = [];
  window.manualArtikel = [];
  
  const modal = document.createElement('div');
  modal.id = 'artikel-creation-modal';
  modal.className = 'modal-overlay';
  modal.style.cssText = `
    display: flex;
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    padding: 20px;
  `;
  
  modal.innerHTML = `
    <div class="modal-container" style="
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 1200px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin: auto;
    ">
      <div class="modal-header" style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px;
        border-bottom: 2px solid #e2e8f0;
      ">
        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1e3a8a;">
          🤖 Neuer Artikel
        </h2>
        <button class="btn-close" onclick="closeArtikelCreationModal()" style="
          background: transparent;
          border: none;
          font-size: 28px;
          color: #64748b;
          cursor: pointer;
          padding: 4px 8px;
          line-height: 1;
        ">✕</button>
      </div>
      
      <!-- TABS -->
      <div class="modal-tabs" style="
        display: flex;
        border-bottom: 2px solid #e2e8f0;
        background: #f8fafc;
      ">
        <button class="tab-button active" data-tab="schnell" onclick="switchArtikelTab('schnell')" style="
          flex: 1;
          padding: 16px;
          border: none;
          background: white;
          font-size: 15px;
          font-weight: 600;
          color: #1e3a8a;
          cursor: pointer;
          border-bottom: 3px solid #1e3a8a;
        ">
          ⚡ Schnell
        </button>
        <button class="tab-button" data-tab="ki-assist" onclick="switchArtikelTab('ki-assist')" style="
          flex: 1;
          padding: 16px;
          border: none;
          background: transparent;
          font-size: 15px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          border-bottom: 3px solid transparent;
        ">
          🤖 KI-Assist
        </button>
        <button class="tab-button" data-tab="manuell" onclick="switchArtikelTab('manuell')" style="
          flex: 1;
          padding: 16px;
          border: none;
          background: transparent;
          font-size: 15px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          border-bottom: 3px solid transparent;
        ">
          ✏️ Manuell
        </button>
      </div>
      
      <div class="modal-body" style="
        padding: 24px;
        overflow-y: auto;
        flex: 1;
        max-height: calc(90vh - 200px);
      ">
        <!-- TAB 1: SCHNELL -->
        ${renderSchnellTab(gm, analysis)}
        
        <!-- TAB 2: KI-ASSIST -->
        ${renderKIAssistTab(analysis)}
        
        <!-- TAB 3: MANUELL -->
        ${renderManuellTab()}
      </div>
      
      <div class="modal-footer" style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 20px 24px;
        border-top: 2px solid #e2e8f0;
        background: #f8fafc;
      ">
        <div style="color: #64748b; font-size: 14px;">
          <span id="artikel-count" style="font-weight: 700; color: #1e3a8a;">0</span> Artikel ausgewählt
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" onclick="closeArtikelCreationModal()" style="
            padding: 12px 24px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            background: white;
            color: #64748b;
            font-weight: 600;
            cursor: pointer;
          ">
            Abbrechen
          </button>
          <button class="btn btn-primary" onclick="createSelectedArtikel()" style="
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            background: #1e3a8a;
            color: white;
            font-weight: 600;
            cursor: pointer;
          ">
            <span id="artikel-count-btn">0</span> Artikel anlegen
          </button>
        </div>
      </div>
    </div>
    
    ${renderModalStyles()}
  `;
  
  document.body.appendChild(modal);
  
  // Activate modal animation
  setTimeout(() => modal.classList.add('active'), 10);
  
  // Auto-select mandatory suggestions
  autoSelectMandatory(analysis);
}

// Auto-select empfohlene (nicht optionale) Artikel
function autoSelectMandatory(analysis) {
  const mandatory = analysis.suggestions.filter(s => !s.optional);
  mandatory.forEach(s => {
    window.selectedArtikel.push(s.id);
    const checkbox = document.getElementById(`checkbox-${s.id}`);
    if (checkbox) checkbox.checked = true;
  });
  updateArtikelCount();
}

// ==========================================
// TAB 1: SCHNELL
// ==========================================

function renderSchnellTab(gm, analysis) {
  const quickSuggestions = analysis.suggestions.filter(s => 
    s.source === 'section5-checkbox' || s.source === 'section5-custom'
  );
  
  return `
    <div class="tab-content active" data-tab-content="schnell">
      <div style="padding: 24px;">
        ${quickSuggestions.length === 0 ? `
          <div style="text-align: center; padding: 60px 20px; color: #64748b;">
            <div style="font-size: 64px; margin-bottom: 16px;">📋</div>
            <h3 style="margin-bottom: 8px; color: #1e3a8a;">Keine Revenue Streams definiert</h3>
            <p>Bitte fülle Section 5 "Geschäftsmodell & Revenue" im Geschäftsmodell aus.</p>
            <button class="btn btn-secondary" onclick="goToGeschaeftsmodell()" style="
              margin-top: 16px;
              padding: 12px 24px;
              border-radius: 8px;
              border: 2px solid #1e3a8a;
              background: white;
              color: #1e3a8a;
              font-weight: 600;
              cursor: pointer;
            ">
              Zum Geschäftsmodell →
            </button>
          </div>
        ` : `
          <div style="
            background: linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
          ">
            <h4 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 18px;">
              💡 Aus deinem Geschäftsmodell erkannt:
            </h4>
            <p style="margin: 0; color: #64748b;">
              Basierend auf Section 5 "Geschäftsmodell & Revenue"
            </p>
          </div>
          
          <div class="quick-suggestions-list" style="display: flex; flex-direction: column; gap: 16px;">
            ${quickSuggestions.map(s => renderQuickSuggestionCard(s)).join('')}
          </div>
          
          <div style="
            margin-top: 24px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
          ">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              💡 <strong>Tipp:</strong> Für intelligente Zusatzvorschläge wechsel zum Tab "KI-Assist".
            </p>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderQuickSuggestionCard(suggestion) {
  return `
    <div class="quick-card" data-suggestion-id="${suggestion.id}" style="
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s ease;
      cursor: pointer;
    " onmouseover="this.style.borderColor='#1e3a8a'; this.style.boxShadow='0 4px 12px rgba(30, 58, 138, 0.1)'"
       onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
      <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
        <input type="checkbox" 
               class="suggestion-checkbox" 
               onchange="toggleArtikelSelection('${suggestion.id}')"
               id="checkbox-${suggestion.id}"
               style="width: 20px; height: 20px; cursor: pointer;">
        <label for="checkbox-${suggestion.id}" style="flex: 1; cursor: pointer;">
          <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px;">
            ${suggestion.name}
          </div>
          <div style="font-size: 14px; color: #64748b;">
            ${suggestion.reasoning}
          </div>
        </label>
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      ">
        ${renderValueBox('Menge (J1)', formatNumber(suggestion.suggested_values.start_menge))}
        ${renderValueBox('Preis', formatCurrency(suggestion.suggested_values.start_preis))}
        ${renderValueBox('HK', formatCurrency(suggestion.suggested_values.start_hk))}
      </div>
    </div>
  `;
}

// ==========================================
// TAB 2: KI-ASSIST
// ==========================================

function renderKIAssistTab(analysis) {
  const mandatory = analysis.suggestions.filter(s => !s.optional);
  const optional = analysis.suggestions.filter(s => s.optional);
  
  return `
    <div class="tab-content" data-tab-content="ki-assist" style="display: none;">
      <div style="padding: 24px;">
        <!-- Context Summary -->
        <div style="
          background: linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 100%);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
        ">
          <h4 style="margin: 0 0 16px 0; font-size: 18px; color: #1e3a8a;">
            🧠 Vollständige Geschäftsmodell-Analyse
          </h4>
          <div style="
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          ">
            ${renderContextItem('SOM (3 Jahre)', analysis.reasoning.context_highlights?.som || 'N/A')}
            ${renderContextItem('Durchschn. Deal Size', analysis.reasoning.context_highlights?.dealSize || 'N/A')}
            ${renderContextItem('Sales Cycle', analysis.reasoning.context_highlights?.salesCycle || 'N/A')}
            ${renderContextItem('Positionierung', formatPositioning(analysis.reasoning.context_highlights?.positioning))}
          </div>
        </div>
        
        ${mandatory.length > 0 ? `
          <!-- Mandatory Suggestions -->
          <div>
            <h4 style="margin-bottom: 16px; color: #1e3a8a;">
              ✅ Empfohlene Artikel (${mandatory.length})
            </h4>
            <p style="color: #64748b; margin-bottom: 16px; font-size: 14px;">
              Diese Artikel sind aus deinem Geschäftsmodell abgeleitet:
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${mandatory.map(s => renderAISuggestionCard(s, false)).join('')}
            </div>
          </div>
        ` : ''}
        
        ${optional.length > 0 ? `
          <!-- Optional Suggestions -->
          <div style="margin-top: 32px;">
            <h4 style="margin-bottom: 16px; color: #1e3a8a;">
              🤔 Optionale Artikel (${optional.length})
            </h4>
            <p style="color: #64748b; margin-bottom: 16px; font-size: 14px;">
              Zusätzliche Vorschläge basierend auf intelligenter Analyse:
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${optional.map(s => renderAISuggestionCard(s, true)).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Add More Button -->
        <div style="margin-top: 24px; text-align: center;">
          <button class="btn btn-secondary" onclick="switchArtikelTab('manuell')" style="
            padding: 12px 24px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            background: white;
            color: #64748b;
            font-weight: 600;
            cursor: pointer;
          ">
            ➕ Weiteren Artikel manuell hinzufügen
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderAISuggestionCard(suggestion, isOptional) {
  return `
    <div class="ai-card ${isOptional ? 'optional' : ''}" data-suggestion-id="${suggestion.id}" style="
      background: white;
      border: 2px ${isOptional ? 'dashed' : 'solid'} #e2e8f0;
      border-radius: 12px;
      padding: 20px;
    ">
      <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <input type="checkbox" 
               class="suggestion-checkbox" 
               ${!isOptional ? 'checked' : ''}
               onchange="toggleArtikelSelection('${suggestion.id}')"
               id="checkbox-${suggestion.id}"
               style="width: 20px; height: 20px; cursor: pointer;">
        <div style="flex: 1;">
          <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px;">
            ${getIcon(suggestion.typ)} ${suggestion.name}
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span style="
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              background: #fee2e2;
              color: #991b1b;
            ">Priorität ${suggestion.priority}</span>
            <span style="
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              background: #dcfce7;
              color: #166534;
            ">${Math.round(suggestion.confidence * 100)}% Konfidenz</span>
            ${isOptional ? `<span style="
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              background: #fef3c7;
              color: #92400e;
            ">Optional</span>` : ''}
          </div>
        </div>
      </div>
      
      <div style="
        margin: 16px 0;
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;
        font-size: 14px;
        color: #111827;
      ">
        💡 ${suggestion.reasoning}
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      ">
        ${renderValueBox('Menge (J1)', formatNumber(suggestion.suggested_values.start_menge))}
        ${renderValueBox('Preis', formatCurrency(suggestion.suggested_values.start_preis))}
        ${renderValueBox('HK', formatCurrency(suggestion.suggested_values.start_hk))}
        ${renderValueBox('Marge', calculateMargin(suggestion.suggested_values) + '%')}
      </div>
    </div>
  `;
}

// ==========================================
// TAB 3: MANUELL
// ==========================================

function renderManuellTab() {
  return `
    <div class="tab-content" data-tab-content="manuell" style="display: none;">
      <div style="padding: 24px;">
        <div style="
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        ">
          <h4 style="margin: 0 0 8px 0; color: #1e3a8a;">✏️ Manueller Artikel</h4>
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            Für Cross-Selling-Potenziale oder spezielle Artikel, die nicht aus dem Geschäftsmodell erkennbar sind.
          </p>
        </div>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #111827;">
            Artikel-Name *
          </label>
          <input 
            type="text" 
            id="manual-artikel-name" 
            placeholder="z.B. Spezial-Greifer für Automotive"
            required
            style="
              width: 100%;
              padding: 12px;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              font-size: 14px;
            "
          />
        </div>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #111827;">
            Typ *
          </label>
          <select id="manual-artikel-typ" required style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
          ">
            <option value="">Bitte wählen...</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Lizenz">Lizenz</option>
            <option value="Subscription">Subscription</option>
            <option value="Service">Service</option>
            <option value="Training">Training</option>
            <option value="Cross-Selling">Cross-Selling</option>
            <option value="Add-On">Add-On</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #111827;">
            Beschreibung / Warum ist dieser Artikel wichtig?
          </label>
          <textarea 
            id="manual-artikel-beschreibung" 
            rows="3"
            placeholder="z.B. 'Cross-Selling-Potenzial mit bestehenden Automotive-Kunden für spezielle Greifer-Systeme...'"
            style="
              width: 100%;
              padding: 12px;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              font-size: 14px;
              font-family: inherit;
            "
          ></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px;">
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #111827;">
              Menge (Jahr 1)
            </label>
            <input type="number" id="manual-menge" placeholder="z.B. 50" style="
              width: 100%;
              padding: 12px;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              font-size: 14px;
            " />
          </div>
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #111827;">
              Preis (€)
            </label>
            <input type="number" id="manual-preis" placeholder="z.B. 25000" style="
              width: 100%;
              padding: 12px;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              font-size: 14px;
            " />
          </div>
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #111827;">
              HK (€)
            </label>
            <input type="number" id="manual-hk" placeholder="z.B. 15000" style="
              width: 100%;
              padding: 12px;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              font-size: 14px;
            " />
          </div>
        </div>
        
        <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
          <button type="button" class="btn btn-primary" onclick="addManualArtikel()" style="
            width: 100%;
            padding: 14px;
            border-radius: 8px;
            border: none;
            background: #1e3a8a;
            color: white;
            font-weight: 600;
            cursor: pointer;
            font-size: 15px;
          ">
            ✅ Artikel zur Liste hinzufügen
          </button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// HELPER RENDERERS
// ==========================================

function renderValueBox(label, value) {
  return `
    <div style="
      text-align: center;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    ">
      <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">
        ${label}
      </div>
      <div style="font-size: 16px; font-weight: 700; color: #1e3a8a;">
        ${value}
      </div>
    </div>
  `;
}

function renderContextItem(label, value) {
  return `
    <div style="
      background: white;
      border-radius: 8px;
      padding: 12px;
    ">
      <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
        ${label}
      </div>
      <div style="font-size: 16px; font-weight: 600; color: #111827;">
        ${value}
      </div>
    </div>
  `;
}

// ==========================================
// TAB SWITCHING
// ==========================================

window.switchArtikelTab = function(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.style.background = isActive ? 'white' : 'transparent';
    btn.style.color = isActive ? '#1e3a8a' : '#64748b';
    btn.style.borderBottomColor = isActive ? '#1e3a8a' : 'transparent';
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = content.dataset.tabContent === tabName ? 'block' : 'none';
  });
};

// ==========================================
// SELECTION MANAGEMENT
// ==========================================

window.toggleArtikelSelection = function(suggestionId) {
  const checkbox = document.getElementById(`checkbox-${suggestionId}`);
  if (!checkbox) return;
  
  if (checkbox.checked) {
    if (!window.selectedArtikel.includes(suggestionId)) {
      window.selectedArtikel.push(suggestionId);
    }
  } else {
    window.selectedArtikel = window.selectedArtikel.filter(id => id !== suggestionId);
  }
  
  updateArtikelCount();
};

window.addManualArtikel = function() {
  const name = document.getElementById('manual-artikel-name').value;
  const typ = document.getElementById('manual-artikel-typ').value;
  const beschreibung = document.getElementById('manual-artikel-beschreibung').value;
  const menge = document.getElementById('manual-artikel-menge').value;
  const preis = document.getElementById('manual-artikel-preis').value;
  const hk = document.getElementById('manual-artikel-hk').value;
  
  if (!name || !typ) {
    alert('Bitte Name und Typ eingeben!');
    return;
  }
  
  const manualArtikel = {
    id: `manual-${Date.now()}`,
    name: name,
    typ: typ,
    beschreibung: beschreibung,
    source: 'manual',
    suggested_values: {
      start_menge: parseInt(menge) || 100,
      start_preis: parseFloat(preis) || 10000,
      start_hk: parseFloat(hk) || 5000,
      mengen_modell: 'realistisch',
      preis_modell: 'konstant',
      kosten_modell: 'konstant',
      zeitraum: 5
    }
  };
  
  // Add to global state
  if (!window.manualArtikel) window.manualArtikel = [];
  window.manualArtikel.push(manualArtikel);
  
  // Add to selection
  window.selectedArtikel.push(manualArtikel.id);
  
  // Show success
  alert(`✅ "${name}" zur Liste hinzugefügt!`);
  
  // Clear form
  document.getElementById('manual-artikel-name').value = '';
  document.getElementById('manual-artikel-typ').value = '';
  document.getElementById('manual-artikel-beschreibung').value = '';
  document.getElementById('manual-artikel-menge').value = '';
  document.getElementById('manual-artikel-preis').value = '';
  document.getElementById('manual-artikel-hk').value = '';
  
  // Update count
  updateArtikelCount();
};

function updateArtikelCount() {
  const count = window.selectedArtikel.length;
  const countEl = document.getElementById('artikel-count');
  const countBtnEl = document.getElementById('artikel-count-btn');
  if (countEl) countEl.textContent = count;
  if (countBtnEl) countBtnEl.textContent = count;
}

// ==========================================
// CREATE ARTICLES (PRODUCTION)
// ==========================================

window.createSelectedArtikel = async function() {
  const projektId = window.modalProjektId;
  
  if (window.selectedArtikel.length === 0) {
    alert('Bitte wähle mindestens einen Artikel aus!');
    return;
  }
  
  console.log('📝 Erstelle', window.selectedArtikel.length, 'Artikel...');
  
  // Hole die Analyse aus dem Modal-State
  const analysis = window.modalAnalysis;
  const allSuggestions = [
    ...analysis.suggestions,
    ...(window.manualArtikel || [])
  ];
  
  try {
    // Erstelle jeden ausgewählten Artikel
    let successCount = 0;
    
    for (const suggestionId of window.selectedArtikel) {
      const suggestion = allSuggestions.find(s => s.id === suggestionId);
      if (!suggestion) {
        console.warn('Suggestion not found:', suggestionId);
        continue;
      }
      
      // ✅ NUTZE BESTEHENDE STRUKTUR
      const newArtikel = {
        name: suggestion.name,
        projektId: projektId,
        projekt_id: projektId,
        typ: suggestion.typ || '',
        kategorie: suggestion.typ || '',
        geschaeftsmodell: '',
        zielmarkt: '',
        strategie: '',
        investment_typ: '',
        beschreibung: suggestion.reasoning || suggestion.beschreibung || '',
        release_datum: new Date().toISOString().substring(0, 7), // YYYY-MM format
        annahmen: '',
        
        // Finanz-Parameter aus KI
        start_menge: suggestion.suggested_values.start_menge || 100,
        start_preis: suggestion.suggested_values.start_preis || 1000,
        start_hk: suggestion.suggested_values.start_hk || 600,
        
        // Modelle aus KI
        mengen_modell: suggestion.suggested_values.mengen_modell || 'realistisch',
        preis_modell: suggestion.suggested_values.preis_modell || 'konstant',
        kosten_modell: suggestion.suggested_values.kosten_modell || 'lernkurve',
        zeitraum: suggestion.suggested_values.zeitraum || 5,
        
        volumes: {},
        prices: {},
        hk: suggestion.suggested_values.start_hk || 600
      };
      
      console.log('💾 Saving artikel:', newArtikel.name);
      
      // ✅ NUTZE BESTEHENDE API
      const saved = await api.saveArticle(newArtikel);
      
      if (saved) {
        console.log('✅ Artikel created:', newArtikel.name);
        successCount++;
      } else {
        console.error('❌ Failed to create:', newArtikel.name);
      }
    }
    
    // Close modal
    closeArtikelCreationModal();
    
    // ✅ RELOAD & RE-RENDER
    console.log('🔄 Reloading articles...');
    await api.loadArticles(projektId);
    
    // ✅ NUTZE BESTEHENDE RENDER-FUNKTION
    if (window.renderArtikelListByProjekt) {
      window.renderArtikelListByProjekt();
    }
    
    // Success message
    setTimeout(() => {
      alert(`✅ ${successCount} von ${window.selectedArtikel.length} Artikel erfolgreich angelegt!`);
      
      // AI Feedback
      if (window.cfoDashboard?.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
          level: 'success',
          title: '✅ Artikel erstellt',
          text: `${successCount} Artikel wurden erfolgreich angelegt.`,
          timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
      }
    }, 100);
    
  } catch (error) {
    console.error('❌ Create failed:', error);
    alert('Fehler beim Erstellen: ' + error.message);
  }
};

window.closeArtikelCreationModal = function() {
  const modal = document.getElementById('artikel-creation-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
      window.selectedArtikel = [];
      window.manualArtikel = [];
      window.modalAnalysis = null;
      window.modalProjektId = null;
    }, 300);
  }
};

window.goToGeschaeftsmodell = function() {
  closeArtikelCreationModal();
  // Switch to Geschäftsmodell tab
  const geschaeftsmodellTab = document.querySelector('[data-tab="geschaeftsmodell"]');
  if (geschaeftsmodellTab) {
    geschaeftsmodellTab.click();
  }
};

// ==========================================
// HELPERS
// ==========================================

function formatCurrency(value) {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value) {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('de-DE').format(value);
}

function formatPositioning(pos) {
  const map = {
    'premium': '⭐ Premium',
    'midmarket': '🎯 Mid-Market',
    'budget': '💰 Budget'
  };
  return map[pos] || pos || 'N/A';
}

function getIcon(typ) {
  const icons = {
    'Hardware': '🔩',
    'Software': '💻',
    'Lizenz': '📄',
    'Subscription': '🔄',
    'Service': '🔧',
    'Training': '🎓',
    'Cross-Selling': '🔗',
    'Add-On': '➕'
  };
  return icons[typ] || '📦';
}

function calculateMargin(values) {
  const revenue = values.start_preis || 0;
  const cost = values.start_hk || 0;
  if (revenue === 0) return 0;
  return Math.round(((revenue - cost) / revenue) * 100);
}

// ==========================================
// STYLES
// ==========================================

function renderModalStyles() {
  return `
    <style>
      #artikel-creation-modal .modal-overlay {
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      #artikel-creation-modal .modal-container {
        animation: slideUp 0.3s ease;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      #artikel-creation-modal .btn-close:hover {
        background: #f1f5f9 !important;
        border-radius: 4px;
        color: #1e3a8a !important;
      }
      
      #artikel-creation-modal .tab-button:hover {
        background: rgba(255,255,255,0.5);
        color: #111827;
      }
      
      #artikel-creation-modal .btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        transition: all 0.2s ease;
      }
      
      #artikel-creation-modal input:focus,
      #artikel-creation-modal select:focus,
      #artikel-creation-modal textarea:focus {
        outline: none;
        border-color: #1e3a8a;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  openArtikelCreationModal
};