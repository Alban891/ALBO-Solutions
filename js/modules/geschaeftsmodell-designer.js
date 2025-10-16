/**
 * Geschäftsmodell Designer
 * Smart revenue model builder with ALBO AI suggestions
 */

import { state, createDefaultGeschaeftsmodell, calculateGeschaeftsmodellRevenue, calculateGeschaeftsmodellTotalRevenue, calculateARR } from '../state.js';
import * as helpers from '../helpers.js';

// ==========================================
// MAIN FUNCTION: Open Designer
// ==========================================

/**
 * Open Geschaeftsmodell Designer Modal
 */
export function openGeschaeftsmodellDesigner(artikelId) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) {
    console.error('Artikel not found');
    return;
  }

  console.log('🎯 Opening Geschaeftsmodell Designer for:', artikel.name);

  // Create modal
  const modal = createDesignerModal(artikel);
  document.body.appendChild(modal);

  // Show ALBO recommendation if no model exists yet
  if (!artikel.geschaeftsmodell || !artikel.geschaeftsmodell.komponenten) {
    setTimeout(() => showAlboRecommendation(artikel), 500);
  } else {
    // Load existing model
    renderKomponenten(artikel.geschaeftsmodell);
    updateRevenuePreview(artikel);
  }
}

/**
 * Create designer modal HTML
 */
function createDesignerModal(artikel) {
  const modal = document.createElement('div');
  modal.id = 'geschaeftsmodell-designer-modal';
  modal.className = 'modal';
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 900px; max-height: 90vh;">
      
      <!-- Header -->
      <div class="modal-header">
        <h2>🎯 Geschäftsmodell Designer</h2>
        <button class="btn-close" onclick="closeGeschaeftsmodellDesigner()">×</button>
      </div>
      
      <!-- Body -->
      <div class="modal-body" style="display: grid; grid-template-columns: 1fr 350px; gap: 24px;">
        
        <!-- LEFT: Komponenten -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0;">Revenue-Komponenten</h3>
            <button class="btn btn-secondary btn-sm" onclick="window.geschaeftsmodellDesigner.addKomponente()">
              ➕ Komponente hinzufügen
            </button>
          </div>
          
          <!-- ALBO Recommendation Box -->
          <div id="albo-recommendation-box" style="display: none;">
            <!-- Will be filled by showAlboRecommendation() -->
          </div>
          
          <!-- Komponenten List -->
          <div id="komponenten-list" style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Will be filled by renderKomponenten() -->
          </div>
        </div>
        
        <!-- RIGHT: Preview & Stats -->
        <div style="position: sticky; top: 20px; height: fit-content;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%); 
                      color: white; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.9;">📊 UMSATZ-VORSCHAU</h4>
            <div id="revenue-preview-list" style="display: flex; flex-direction: column; gap: 8px;">
              <!-- Will be filled by updateRevenuePreview() -->
            </div>
            
            <div style="border-top: 1px solid rgba(255,255,255,0.2); margin: 16px 0; padding-top: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="opacity: 0.9;">Total (5 Jahre):</span>
                <span id="total-revenue" style="font-weight: 700; font-size: 18px;">0€</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="opacity: 0.9;">ARR (ab Jahr 2):</span>
                <span id="arr-value" style="font-weight: 700; font-size: 18px;">0€</span>
              </div>
            </div>
          </div>
          
          <!-- ALBO Insights -->
          <div id="albo-insights" style="background: #f8fafc; padding: 16px; border-radius: 8px; 
                                         border-left: 3px solid #3b82f6;">
            <div style="font-weight: 600; margin-bottom: 8px; color: #1e40af;">💡 ALBO Insights</div>
            <div id="albo-insights-text" style="font-size: 13px; color: #475569; line-height: 1.5;">
              Definiere Komponenten, um Insights zu erhalten.
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeGeschaeftsmodellDesigner()">
          Abbrechen
        </button>
        <button class="btn btn-primary" onclick="window.geschaeftsmodellDesigner.saveGeschaeftsmodell()">
          💾 Speichern
        </button>
      </div>
      
    </div>
  `;
  
  return modal;
}

// ==========================================
// ALBO RECOMMENDATION
// ==========================================

/**
 * Show ALBO's intelligent recommendation
 */
function showAlboRecommendation(artikel) {
  const box = document.getElementById('albo-recommendation-box');
  if (!box) return;
  
  const artikelTyp = artikel.typ || 'Software';
  const defaultModel = createDefaultGeschaeftsmodell(artikelTyp);
  
  // Calculate preview
  const totalRevenue = calculateGeschaeftsmodellTotalRevenue(defaultModel, 5, {1:1,2:1,3:1,4:1,5:1});
  const arr = calculateARR(defaultModel, 1);
  
  box.style.display = 'block';
  box.innerHTML = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                padding: 20px; border-radius: 12px; color: white; margin-bottom: 24px;">
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="font-size: 32px;">🤖</div>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px;">
            ALBO empfiehlt für ${artikelTyp}:
          </div>
          <div style="font-size: 14px; line-height: 1.6; margin-bottom: 16px; opacity: 0.95;">
            Ich habe ein optimales Geschäftsmodell für dich vorbereitet.
            ${artikelTyp === 'Software' ? 'Hybrid-Modell mit Lizenz und wiederkehrenden Support-Einnahmen.' : ''}
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
            ${defaultModel.komponenten.map(k => `
              <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                <span>${k.optional ? '○' : '✓'} ${k.name}</span>
                <span style="font-weight: 600;">${helpers.formatCurrency(k.preis)}${k.typ === 'wiederkehrend' ? '/Jahr' : ''}</span>
              </div>
            `).join('')}
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button onclick="window.geschaeftsmodellDesigner.acceptAlboRecommendation()" 
                    style="flex: 1; padding: 10px 16px; background: white; color: #667eea; 
                           border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
              ✅ Übernehmen & Ausfüllen
            </button>
            <button onclick="window.geschaeftsmodellDesigner.declineAlboRecommendation()" 
                    style="padding: 10px 16px; background: rgba(255,255,255,0.2); color: white; 
                           border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; cursor: pointer;">
              ❌ Selbst erstellen
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * User accepts ALBO recommendation
 */
window.geschaeftsmodellDesigner = {
  acceptAlboRecommendation: function() {
    console.log('✅ User accepted ALBO recommendation');
    
    const artikelId = window.cfoDashboard.currentArtikel;
    const artikel = state.getArtikel(artikelId);
    
    if (!artikel) return;
    
    // Create default model
    const defaultModel = createDefaultGeschaeftsmodell(artikel.typ || 'Software');
    
    // Save to artikel
    artikel.geschaeftsmodell = defaultModel;
    state.setArtikel(artikelId, artikel);
    
    // Hide recommendation box
    const box = document.getElementById('albo-recommendation-box');
    if (box) box.style.display = 'none';
    
    // Render komponenten
    renderKomponenten(defaultModel);
    updateRevenuePreview(artikel);
    
    // ALBO Feedback
    if (window.cfoDashboard.aiController) {
      window.cfoDashboard.aiController.addAIMessage({
        level: 'success',
        title: '✅ Geschäftsmodell erstellt',
        text: `Ich habe ein ${defaultModel.typ} Modell mit ${defaultModel.komponenten.length} Komponenten für dich erstellt.`,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  },
  
  declineAlboRecommendation: function() {
    console.log('❌ User declined ALBO recommendation');
    
    const box = document.getElementById('albo-recommendation-box');
    if (box) box.style.display = 'none';
    
    // Show empty state
    const list = document.getElementById('komponenten-list');
    if (list) {
      list.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #6b7280;">
          <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
          <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">
            Noch keine Komponenten
          </div>
          <div style="font-size: 14px; margin-bottom: 20px;">
            Füge deine erste Revenue-Komponente hinzu
          </div>
          <button class="btn btn-primary" onclick="window.geschaeftsmodellDesigner.addKomponente()">
            ➕ Erste Komponente erstellen
          </button>
        </div>
      `;
    }
  },
  
  addKomponente: function() {
    console.log('➕ Adding new component');
    
    const artikelId = window.cfoDashboard.currentArtikel;
    const artikel = state.getArtikel(artikelId);
    if (!artikel) return;
    
    // Initialize geschaeftsmodell if needed
    if (!artikel.geschaeftsmodell) {
      artikel.geschaeftsmodell = {
        typ: 'einfach',
        komponenten: []
      };
    }
    
    // Add new empty component
    const newId = (artikel.geschaeftsmodell.komponenten.length > 0)
      ? Math.max(...artikel.geschaeftsmodell.komponenten.map(k => k.id)) + 1
      : 1;
    
    const newKomponente = {
      id: newId,
      name: `Komponente ${newId}`,
      typ: 'einmalig',
      preis: 0,
      jahre: [1],
      wachstum: 0,
      optional: false,
      beschreibung: ''
    };
    
    artikel.geschaeftsmodell.komponenten.push(newKomponente);
    state.setArtikel(artikelId, artikel);
    
    // Re-render
    renderKomponenten(artikel.geschaeftsmodell);
    updateRevenuePreview(artikel);
  },
  
  saveGeschaeftsmodell: async function() {
    console.log('💾 Saving Geschaeftsmodell...');
    
    const artikelId = window.cfoDashboard.currentArtikel;
    const artikel = state.getArtikel(artikelId);
    if (!artikel) return;
    
    // Validate
    if (!artikel.geschaeftsmodell || artikel.geschaeftsmodell.komponenten.length === 0) {
      alert('Bitte mindestens eine Komponente definieren!');
      return;
    }
    
    // Save to state
    state.setArtikel(artikelId, artikel);
    state.saveState();
    
    // Close modal
    closeGeschaeftsmodellDesigner();
    
    // Success message
    if (window.cfoDashboard.aiController) {
      window.cfoDashboard.aiController.addAIMessage({
        level: 'success',
        title: '✅ Geschäftsmodell gespeichert',
        text: `${artikel.geschaeftsmodell.komponenten.length} Komponenten erfolgreich gespeichert.`,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  }
};

// ==========================================
// RENDER KOMPONENTEN
// ==========================================

/**
 * Render komponenten list
 */
function renderKomponenten(geschaeftsmodell) {
  const list = document.getElementById('komponenten-list');
  if (!list || !geschaeftsmodell) return;
  
  if (geschaeftsmodell.komponenten.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #6b7280;">
        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
        <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">
          Noch keine Komponenten
        </div>
        <button class="btn btn-primary" onclick="window.geschaeftsmodellDesigner.addKomponente()">
          ➕ Erste Komponente erstellen
        </button>
      </div>
    `;
    return;
  }
  
  list.innerHTML = geschaeftsmodell.komponenten.map(komponente => `
    <div class="komponente-card" data-id="${komponente.id}" style="
      background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;
      ${komponente.optional ? 'border-left: 3px solid #f59e0b;' : 'border-left: 3px solid #10b981;'}
    ">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <input type="text" value="${komponente.name}" 
               onchange="window.geschaeftsmodellDesigner.updateKomponenteName(${komponente.id}, this.value)"
               style="font-weight: 600; font-size: 15px; border: none; border-bottom: 1px solid transparent;
                      padding: 4px 0; flex: 1; margin-right: 12px;"
               onfocus="this.style.borderBottom='1px solid #3b82f6'"
               onblur="this.style.borderBottom='1px solid transparent'">
        <button onclick="window.geschaeftsmodellDesigner.deleteKomponente(${komponente.id})"
                style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 18px;">
          🗑️
        </button>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div>
          <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 600;">TYP</label>
          <select onchange="window.geschaeftsmodellDesigner.updateKomponenteTyp(${komponente.id}, this.value)"
                  style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 14px;">
            <option value="einmalig" ${komponente.typ === 'einmalig' ? 'selected' : ''}>Einmalig</option>
            <option value="wiederkehrend" ${komponente.typ === 'wiederkehrend' ? 'selected' : ''}>Wiederkehrend (ARR)</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 600;">PREIS</label>
          <input type="text" value="${helpers.formatCurrency(komponente.preis)}"
                 onchange="window.geschaeftsmodellDesigner.updateKomponentePreis(${komponente.id}, this.value)"
                 onfocus="if(this.value==='0€') this.value=''"
                 style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 14px; text-align: right; font-weight: 600;">
        </div>
      </div>
      
      ${komponente.typ === 'wiederkehrend' ? `
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 600;">
            PREISSTEIGERUNG (% p.a.)
          </label>
          <input type="number" value="${komponente.wachstum || 0}" step="0.5"
                 onchange="window.geschaeftsmodellDesigner.updateKomponenteWachstum(${komponente.id}, this.value)"
                 style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 14px;">
        </div>
      ` : ''}
      
      <div>
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
          <input type="checkbox" ${komponente.optional ? 'checked' : ''}
                 onchange="window.geschaeftsmodellDesigner.updateKomponenteOptional(${komponente.id}, this.checked)"
                 style="width: 16px; height: 16px;">
          <span>Optional (Kunde kann wählen)</span>
        </label>
      </div>
      
      ${komponente.beschreibung ? `
        <div style="margin-top: 12px; padding: 8px; background: #f8fafc; border-radius: 4px; font-size: 12px; color: #475569;">
          ${komponente.beschreibung}
        </div>
      ` : ''}
    </div>
  `).join('');
}

// ==========================================
// UPDATE FUNCTIONS
// ==========================================

window.geschaeftsmodellDesigner.updateKomponenteName = function(id, name) {
  const artikelId = window.cfoDashboard.currentArtikel;
  const artikel = state.getArtikel(artikelId);
  if (!artikel || !artikel.geschaeftsmodell) return;
  
  const komponente = artikel.geschaeftsmodell.komponenten.find(k => k.id === id);
  if (komponente) {
    komponente.name = name;
    state.setArtikel(artikelId, artikel);
    updateRevenuePreview(artikel);
  }
};

window.geschaeftsmodellDesigner.updateKomponenteTyp = function(id, typ) {
  const artikelId = window.cfoDashboard.currentArtikel;
  const artikel = state.getArtikel(artikelId);
  if (!artikel || !artikel.geschaeftsmodell) return;
  
  const komponente = artikel.geschaeftsmodell.komponenten.find(k => k.id === id);
  if (komponente) {
    komponente.typ = typ;
    
    // Update jahre based on type
    if (typ === 'wiederkehrend') {
      komponente.jahre = [1,2,3,4,5,6,7];
      komponente.wachstum = 2; // Default 2% p.a.
    } else {
      komponente.jahre = [1];
      komponente.wachstum = 0;
    }
    
    state.setArtikel(artikelId, artikel);
    renderKomponenten(artikel.geschaeftsmodell);
    updateRevenuePreview(artikel);
  }
};

window.geschaeftsmodellDesigner.updateKomponentePreis = function(id, value) {
  const artikelId = window.cfoDashboard.currentArtikel;
  const artikel = state.getArtikel(artikelId);
  if (!artikel || !artikel.geschaeftsmodell) return;
  
  const komponente = artikel.geschaeftsmodell.komponenten.find(k => k.id === id);
  if (komponente) {
    komponente.preis = helpers.parseFormattedNumber(value) || 0;
    state.setArtikel(artikelId, artikel);
    updateRevenuePreview(artikel);
  }
};

window.geschaeftsmodellDesigner.updateKomponenteWachstum = function(id, value) {
  const artikelId = window.cfoDashboard.currentArtikel;
  const artikel = state.getArtikel(artikelId);
  if (!artikel || !artikel.geschaeftsmodell) return;
  
  const komponente = artikel.geschaeftsmodell.komponenten.find(k => k.id === id);
  if (komponente) {
    komponente.wachstum = parseFloat(value) || 0;
    state.setArtikel(artikelId, artikel);
    updateRevenuePreview(artikel);
  }
};

window.geschaeftsmodellDesigner.updateKomponenteOptional = function(id, optional) {
  const artikelId = window.cfoDashboard.currentArtikel;
  const artikel = state.getArtikel(artikelId);
  if (!artikel || !artikel.geschaeftsmodell) return;
  
  const komponente = artikel.geschaeftsmodell.komponenten.find(k => k.id === id);
  if (komponente) {
    komponente.optional = optional;
    state.setArtikel(artikelId, artikel);
    renderKomponenten(artikel.geschaeftsmodell);
    updateRevenuePreview(artikel);
  }
};

window.geschaeftsmodellDesigner.deleteKomponente = function(id) {
  if (!confirm('Komponente wirklich löschen?')) return;
  
  const artikelId = window.cfoDashboard.currentArtikel;
  const artikel = state.getArtikel(artikelId);
  if (!artikel || !artikel.geschaeftsmodell) return;
  
  artikel.geschaeftsmodell.komponenten = artikel.geschaeftsmodell.komponenten.filter(k => k.id !== id);
  state.setArtikel(artikelId, artikel);
  
  renderKomponenten(artikel.geschaeftsmodell);
  updateRevenuePreview(artikel);
};

// ==========================================
// REVENUE PREVIEW
// ==========================================

/**
 * Update revenue preview in sidebar
 */
function updateRevenuePreview(artikel) {
  if (!artikel || !artikel.geschaeftsmodell) return;
  
  const previewList = document.getElementById('revenue-preview-list');
  const totalEl = document.getElementById('total-revenue');
  const arrEl = document.getElementById('arr-value');
  const insightsEl = document.getElementById('albo-insights-text');
  
  if (!previewList) return;
  
  // Calculate for each year
  const zeitraum = artikel.zeitraum || 5;
  let total = 0;
  const yearRevenues = [];
  
  for (let jahr = 1; jahr <= zeitraum; jahr++) {
    const revenue = calculateGeschaeftsmodellRevenue(artikel.geschaeftsmodell, jahr, 1);
    yearRevenues.push({ jahr, revenue });
    total += revenue;
  }
  
  // Render years
  previewList.innerHTML = yearRevenues.map(yr => `
    <div style="display: flex; justify-content: space-between; padding: 6px 0;">
      <span style="opacity: 0.9;">Jahr ${yr.jahr}:</span>
      <span style="font-weight: 600;">${helpers.formatCurrency(yr.revenue)}</span>
    </div>
  `).join('');
  
  // Total
  if (totalEl) totalEl.textContent = helpers.formatCurrency(total);
  
  // ARR
  const arr = calculateARR(artikel.geschaeftsmodell, 1);
  if (arrEl) arrEl.textContent = helpers.formatCurrency(arr);
  
  // ALBO Insights
  if (insightsEl) {
    const arrPercent = total > 0 ? (arr * (zeitraum - 1) / total) * 100 : 0;
    
    let insight = '';
    if (artikel.geschaeftsmodell.komponenten.length === 0) {
      insight = 'Definiere Komponenten, um Insights zu erhalten.';
    } else if (arrPercent < 20) {
      insight = `⚠️ Dein ARR-Anteil ist sehr niedrig (${arrPercent.toFixed(0)}%). Erwäge mehr wiederkehrende Umsätze für stabilere Einnahmen.`;
    } else if (arrPercent > 60) {
      insight = `✅ Exzellent! Hoher ARR-Anteil (${arrPercent.toFixed(0)}%) sorgt für planbare, wiederkehrende Einnahmen.`;
    } else {
      insight = `👍 Guter Mix! ARR-Anteil von ${arrPercent.toFixed(0)}% ist solide für ein Hybrid-Modell.`;
    }
    
    insightsEl.textContent = insight;
  }
}

// ==========================================
// CLOSE MODAL
// ==========================================

window.closeGeschaeftsmodellDesigner = function() {
  const modal = document.getElementById('geschaeftsmodell-designer-modal');
  if (modal) modal.remove();
};

// ==========================================
// EXPORTS
// ==========================================

export default {
  openGeschaeftsmodellDesigner
};