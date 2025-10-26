/**
 * ALBO Solutions - Adaptive Artikel Renderer
 * 
 * Dynamically renders artikel detail forms based on type
 * Integrates with existing artikel.js and revenue-models.js
 */

import RevenueModels from './revenue-models.js';
import * as helpers from '../../helpers.js';

// ============================================
// ADAPTIVE FINANZ-PARAMETER SECTION
// ============================================

/**
 * Render type-specific Finanz-Parameter section
 * Replaces the static Menge/Preis/HK fields
 */
export function renderFinanzParameterByType(artikel) {
  const typ = artikel.typ || 'Hardware';
  const model = RevenueModels.getRevenueModel(typ);
  
  if (!model) {
    console.error('Unknown artikel type:', typ);
    return renderFallbackFinanzParameter();
  }
  
  console.log('📊 Rendering Finanz-Parameter for type:', typ);
  
  return `
    <div class="section" style="background:white;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 20px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:24px;">${model.icon}</span>
        💰 Finanz-Parameter & Entwicklungsmodelle
      </h3>
      
      <div style="background:#eff6ff;border:2px solid#3b82f6;border-radius:8px;padding:12px;margin-bottom:20px;">
        <div style="font-size:14px;color:#1e40af;display:flex;align-items:center;gap:8px;">
          <span>ℹ️</span>
          <strong>Artikel-Typ: ${model.name}</strong> - ${model.description}
        </div>
      </div>
      
      <!-- Release & Zeitraum -->
      ${renderReleaseAndZeitraum(artikel)}
      
      <!-- Type-specific Startwerte -->
      ${renderStartwerteByType(model, artikel)}
      
      <!-- Entwicklungsmodelle -->
      ${renderEntwicklungsmodelle(model, artikel)}
      
      <!-- Ergebnis-Vorschau Button -->
      <div style="margin-top:24px;text-align:center;">
        <button 
          class="btn btn-primary" 
          onclick="berechneErgebnisVorschau()" 
          style="padding:14px 32px;font-size:16px;"
        >
          📊 Berechnen & Vorschau aktualisieren
        </button>
      </div>
    </div>
    
    <!-- Ergebnis-Vorschau -->
    <div id="ergebnis-vorschau-container">
      ${renderErgebnisVorschauByType(model, artikel)}
    </div>
  `;
}

// ============================================
// RELEASE & ZEITRAUM (Universal)
// ============================================

function renderReleaseAndZeitraum(artikel) {
  return `
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;margin-bottom:32px;">
      
      <!-- Release/Startdatum -->
      <div>
        <label style="display:block;margin-bottom:8px;font-weight:500;color:var(--text);">
          📅 RELEASE / STARTDATUM
        </label>
        <input 
          type="month" 
          id="release-datum" 
          value="${artikel.release_datum ? artikel.release_datum.substring(0, 7) : ''}"
          onchange="updateTabellenSpalten(); updateErsteZeile();"
          style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:8px;font-size:15px;"
        />
      </div>
      
      <!-- Zeithorizont -->
      <div>
        <label style="display:block;margin-bottom:8px;font-weight:500;color:var(--text);">
          ZEITHORIZONT
        </label>
        <div style="display:flex;gap:12px;">
          <button 
            id="zeitraum-btn-3" 
            class="zeitraum-btn" 
            onclick="setzeZeitraum(3)"
            style="flex:1;padding:12px;border:2px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;font-weight:500;"
          >
            3 Jahre
          </button>
          <button 
            id="zeitraum-btn-5" 
            class="zeitraum-btn active" 
            onclick="setzeZeitraum(5)"
            style="flex:1;padding:12px;border:2px solid #1e3a8a;border-radius:8px;background:#1e3a8a;color:white;cursor:pointer;font-weight:600;"
          >
            5 Jahre
          </button>
          <button 
            id="zeitraum-btn-7" 
            class="zeitraum-btn" 
            onclick="setzeZeitraum(7)"
            style="flex:1;padding:12px;border:2px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;font-weight:500;"
          >
            7 Jahre
          </button>
        </div>
      </div>
      
    </div>
  `;
}

// ============================================
// TYPE-SPECIFIC STARTWERTE
// ============================================

function renderStartwerteByType(model, artikel) {
  const metriken = model.metriken;
  
  return `
    <div style="margin-bottom:32px;">
      <h4 style="display:flex;align-items:center;gap:8px;margin:0 0 16px;">
        📊 Startwerte (Jahr 1)
      </h4>
      
      <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:#92400e;">
          <span>💡</span>
          <strong>Tipp:</strong> Tragen Sie hier Ihre Annahmen für das erste Jahr ein. Diese Werte dienen als Basis für die automatischen Entwicklungsmodelle.
        </div>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(${Math.min(metriken.length, 3)}, 1fr);gap:16px;">
        ${metriken.map(metrik => renderMetrikInput(metrik, artikel)).join('')}
      </div>
    </div>
  `;
}

function renderMetrikInput(metrik, artikel) {
  // Get existing value from artikel data
  const existingValue = artikel[`start_${metrik.id}`];
  let displayValue = '';
  let textColor = '#6b7280'; // Gray for placeholder
  
  if (existingValue !== undefined && existingValue !== null && existingValue !== 0) {
    // Format based on type
    if (metrik.typ === 'currency') {
      displayValue = helpers.formatDecimal(existingValue, 2);
    } else if (metrik.typ === 'percent') {
      displayValue = helpers.formatDecimal(existingValue, 1);
    } else {
      displayValue = helpers.formatThousands(existingValue);
    }
    textColor = '#111827'; // Black for actual value
  } else {
    displayValue = metrik.placeholder;
  }
  
  return `
    <div>
      <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:500;color:var(--text);">
        ${metrik.label}${metrik.required ? ' *' : ''}
      </label>
      <div style="position:relative;">
        <input 
          type="text" 
          id="start-${metrik.id}"
          data-metrik-id="${metrik.id}"
          data-metrik-typ="${metrik.typ}"
          value="${displayValue}"
          placeholder="${metrik.placeholder}"
          onfocus="clearPlaceholder(this)"
          onblur="updateErsteZeile()"
          style="width:100%;padding:10px 12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;color:${textColor};"
          title="${metrik.tooltip || ''}"
        />
        <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:12px;color:#9ca3af;">
          ${metrik.einheit}
        </span>
      </div>
    </div>
  `;
}

// ============================================
// ENTWICKLUNGSMODELLE
// ============================================

function renderEntwicklungsmodelle(model, artikel) {
  const mengenModelle = model.mengenentwicklung || [];
  
  return `
    <div style="margin-bottom:24px;">
      <h4 style="display:flex;align-items:center;gap:8px;margin:0 0 16px;">
        📈 ENTWICKLUNGSMODELLE
      </h4>
      
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;">
        
        <!-- Mengenentwicklung (Type-specific) -->
        <div class="model-group">
          <h5 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;">
            ${model.metriken[0].label.toUpperCase()} ENTWICKLUNG
          </h5>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${mengenModelle.map(m => renderModelRadio('mengen-modell', m, artikel.mengen_modell)).join('')}
          </div>
        </div>
        
        <!-- Preisentwicklung (Universal) -->
        <div class="model-group">
          <h5 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;">
            PREISENTWICKLUNG
          </h5>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${RevenueModels.UNIVERSAL_PRICE_MODELS.map(m => renderModelRadio('preis-modell', m, artikel.preis_modell)).join('')}
          </div>
        </div>
        
        <!-- Kostenentwicklung (Universal) -->
        <div class="model-group">
          <h5 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;">
            KOSTENENTWICKLUNG
          </h5>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${RevenueModels.UNIVERSAL_COST_MODELS.map(m => renderModelRadio('kosten-modell', m, artikel.kosten_modell)).join('')}
          </div>
        </div>
        
      </div>
    </div>
  `;
}

function renderModelRadio(name, model, selectedValue) {
  const isChecked = selectedValue === model.id || (!selectedValue && model.default);
  
  return `
    <label style="display:flex;align-items:start;gap:8px;padding:10px;border:2px solid ${isChecked ? '#2563eb' : '#e5e7eb'};border-radius:8px;cursor:pointer;background:${isChecked ? '#eff6ff' : 'white'};transition:all 0.2s;"
           onmouseover="this.style.borderColor='#d1d5db'"
           onmouseout="this.style.borderColor='${isChecked ? '#2563eb' : '#e5e7eb'}'"
    >
      <input 
        type="radio" 
        name="${name}" 
        value="${model.id}"
        ${isChecked ? 'checked' : ''}
        style="margin-top:2px;width:16px;height:16px;cursor:pointer;"
      />
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:500;color:${isChecked ? '#2563eb' : '#374151'};margin-bottom:2px;">
          ${model.icon} ${model.name}
        </div>
        ${model.description ? `
          <div style="font-size:11px;color:#6b7280;line-height:1.4;">
            ${model.description}
          </div>
        ` : ''}
      </div>
    </label>
  `;
}

// ============================================
// ERGEBNIS-VORSCHAU
// ============================================

function renderErgebnisVorschauByType(model, artikel) {
  const zeitraum = artikel.zeitraum || 5;
  const startYear = artikel.release_datum ? parseInt(artikel.release_datum.split('-')[0]) : new Date().getFullYear();
  
  // Get metric labels from model
  const metriken = model.metriken;
  const metrik1 = metriken[0]; // e.g. "Menge" or "Users" or "Personentage"
  const metrik2 = metriken[1]; // e.g. "Preis" or "MRR" or "Tagessatz"
  const metrik3 = metriken[2]; // e.g. "HK" or "COGS" or "Kostensatz"
  
  return `
    <div class="section" style="background:white;border-radius:12px;padding:24px;">
      <h3 style="margin:0 0 16px;display:flex;align-items:center;gap:10px;">
        📊 ERGEBNIS-VORSCHAU
      </h3>
      
      <div style="overflow-x:auto;">
        <table class="ergebnis-tabelle" style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
              <th style="padding:12px;text-align:left;font-weight:600;color:#6b7280;font-size:13px;">
                Parameter
              </th>
              ${Array.from({length: zeitraum}, (_, i) => {
                const year = startYear + i;
                const yearLabel = i === 0 ? `${year} (Start)` : year;
                return `
                  <th class="jahr-col jahr-${i + 1}" style="padding:12px;text-align:right;font-weight:600;color:#6b7280;font-size:13px;">
                    ${yearLabel}
                  </th>
                `;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            
            <!-- Metrik 1: z.B. Menge, Users, PT -->
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:12px;font-weight:500;">${metrik1.label} (${metrik1.einheit})</td>
              ${Array.from({length: zeitraum}, (_, i) => `
                <td class="jahr-col jahr-${i + 1}" style="padding:12px;text-align:right;">
                  <input 
                    type="text" 
                    id="${metrik1.id}-jahr-${i + 1}"
                    ${i === 0 ? 'readonly' : ''}
                    style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:6px;text-align:right;background:${i === 0 ? '#f9fafb' : 'white'};"
                  />
                </td>
              `).join('')}
            </tr>
            
            <!-- Metrik 2: z.B. Preis, MRR, Tagessatz -->
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:12px;font-weight:500;">${metrik2.label} (${metrik2.einheit})</td>
              ${Array.from({length: zeitraum}, (_, i) => `
                <td class="jahr-col jahr-${i + 1}" style="padding:12px;text-align:right;">
                  <input 
                    type="text" 
                    id="${metrik2.id}-jahr-${i + 1}"
                    ${i === 0 ? 'readonly' : ''}
                    style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:6px;text-align:right;background:${i === 0 ? '#f9fafb' : 'white'};"
                  />
                </td>
              `).join('')}
            </tr>
            
            <!-- Metrik 3: z.B. HK, COGS, Kostensatz -->
            <tr style="border-bottom:2px solid #e5e7eb;">
              <td style="padding:12px;font-weight:500;">${metrik3.label} (${metrik3.einheit})</td>
              ${Array.from({length: zeitraum}, (_, i) => `
                <td class="jahr-col jahr-${i + 1}" style="padding:12px;text-align:right;">
                  <input 
                    type="text" 
                    id="${metrik3.id}-jahr-${i + 1}"
                    ${i === 0 ? 'readonly' : ''}
                    style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:6px;text-align:right;background:${i === 0 ? '#f9fafb' : 'white'};"
                  />
                </td>
              `).join('')}
            </tr>
            
            <!-- Revenue Row (calculated) -->
            <tr style="background:#f0fdf4;border-bottom:1px solid #10b981;">
              <td style="padding:12px;font-weight:600;color:#059669;">💰 Revenue</td>
              ${Array.from({length: zeitraum}, (_, i) => `
                <td class="jahr-col jahr-${i + 1}" style="padding:12px;text-align:right;font-weight:600;color:#059669;">
                  <span id="revenue-jahr-${i + 1}">-</span>
                </td>
              `).join('')}
            </tr>
            
            <!-- COGS Row (calculated) -->
            <tr style="background:#fef2f2;border-bottom:1px solid #ef4444;">
              <td style="padding:12px;font-weight:600;color:#dc2626;">📉 COGS</td>
              ${Array.from({length: zeitraum}, (_, i) => `
                <td class="jahr-col jahr-${i + 1}" style="padding:12px;text-align:right;font-weight:600;color:#dc2626;">
                  <span id="cogs-jahr-${i + 1}">-</span>
                </td>
              `).join('')}
            </tr>
            
            <!-- DB2 Row (calculated) -->
            <tr style="background:#eff6ff;border-bottom:1px solid #3b82f6;">
              <td style="padding:12px;font-weight:600;color:#2563eb;">✨ DB2</td>
              ${Array.from({length: zeitraum}, (_, i) => `
                <td class="jahr-col jahr-${i + 1}" style="padding:12px;text-align:right;font-weight:600;color:#2563eb;">
                  <span id="db2-jahr-${i + 1}">-</span>
                </td>
              `).join('')}
            </tr>
            
            <!-- DB2% Row (calculated) -->
            <tr style="background:#eff6ff;">
              <td style="padding:12px;font-weight:600;color:#2563eb;">📊 DB2 %</td>
              ${Array.from({length: zeitraum}, (_, i) => `
                <td class="jahr-col jahr-${i + 1}" style="padding:12px;text-align:right;font-weight:600;color:#2563eb;">
                  <span id="db2-percent-jahr-${i + 1}">-</span>
                </td>
              `).join('')}
            </tr>
            
          </tbody>
        </table>
      </div>
      
      <div style="margin-top:16px;padding:12px;background:#f3f4f6;border-radius:8px;font-size:13px;color:#6b7280;">
        💡 <strong>Hinweis:</strong> Die Werte für Jahr 1 werden automatisch aus den Startwerten übernommen. 
        Wähle ein Entwicklungsmodell oder bearbeite die Werte manuell für die Folgejahre.
      </div>
    </div>
  `;
}

// ============================================
// FALLBACK
// ============================================

function renderFallbackFinanzParameter() {
  return `
    <div class="section" style="background:white;border-radius:12px;padding:24px;">
      <h3>⚠️ Unbekannter Artikel-Typ</h3>
      <p>Bitte wähle einen gültigen Artikel-Typ aus.</p>
    </div>
  `;
}

// ============================================
// HELPER: CLEAR PLACEHOLDER
// ============================================

window.clearPlaceholder = function(input) {
  if (input.value.startsWith('z.B.')) {
    input.value = '';
    input.style.color = '#111827';
  }
};

export default {
  renderFinanzParameterByType,
  renderErgebnisVorschauByType
};
