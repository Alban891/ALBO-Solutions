/**
 * HARDWARE REVENUE MODEL
 * Horvath & Partners Best Practice Implementation
 * 
 * Transactional Model: Menge × Preis - Kosten
 * Optimiert für: Hardware, Einmalverkäufe, physische Produkte
 */

// ==========================================
// RENDER MAIN UI
// ==========================================

/**
 * Render Hardware Revenue Model UI
 * @param {Object} artikel - Artikel object from state
 * @param {string} containerId - DOM container ID
 */
export function renderHardwareModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('📦 Rendering Hardware Revenue Model for:', artikel.name);
  
  // Get existing data or initialize
  const modelData = artikel.revenue_model_data || initializeHardwareData(artikel);
  
  container.innerHTML = `
    <div class="revenue-model-container" style="padding: 30px; background: white; border-radius: 12px;">
      
      <!-- SECTION 1: Zeitliche Rahmendaten -->
      ${renderTimeFrame(modelData)}
      
      <!-- SECTION 2: Startwerte Jahr 1 -->
      ${renderStartValues(modelData)}
      
      <!-- SECTION 3: Entwicklungsmodelle -->
      ${renderDevelopmentModels(modelData)}
      
      <!-- SECTION 4: Action Buttons -->
      ${renderActionButtons(artikel.id)}
      
      <!-- SECTION 5: Ergebnis-Vorschau -->
      <div id="hardware-preview-container"></div>
      
    </div>
    
    ${renderStyles()}
  `;
  
  // Attach event listeners
  attachEventListeners(artikel);
  
  // Initial calculation if data exists
  if (modelData.calculated) {
    calculateAndRender(artikel);
  }
}

// ==========================================
// INITIALIZE DATA
// ==========================================

function initializeHardwareData(artikel) {
  return {
    // Zeitrahmen
    release_date: artikel.release_datum || '2025-01',
    time_horizon: artikel.zeitraum || 5,
    
    // Startwerte
    start_menge: artikel.start_menge || 0,
    start_preis: artikel.start_preis || 0,
    start_hk: artikel.start_hk || 0,
    
    // Entwicklungsmodelle
    mengen_modell: artikel.mengen_modell || 'realistisch',
    preis_modell: artikel.preis_modell || 'konstant',
    kosten_modell: artikel.kosten_modell || 'lernkurve',
    
    // Berechnete Werte
    calculated: false,
    forecast: null
  };
}

// ==========================================
// RENDER SECTIONS
// ==========================================

function renderTimeFrame(data) {
  return `
    <div class="section-card-compact">
      <h3 class="section-title-compact">📅 Zeitliche Rahmendaten</h3>
      
      <div class="form-row-compact">
        <div class="form-group-compact">
          <label class="label-compact">Release / Startdatum</label>
          <input 
            type="month" 
            id="hw-release-date" 
            value="${data.release_date}"
            class="form-input-compact"
          >
        </div>
        
        <div class="form-group-compact">
          <label class="label-compact">Zeithorizont</label>
          <div class="horizon-buttons-compact">
            <button 
              class="horizon-btn-compact ${data.time_horizon === 3 ? 'active' : ''}" 
              data-years="3"
            >3 Jahre</button>
            <button 
              class="horizon-btn-compact ${data.time_horizon === 5 ? 'active' : ''}" 
              data-years="5"
            >5 Jahre</button>
            <button 
              class="horizon-btn-compact ${data.time_horizon === 7 ? 'active' : ''}" 
              data-years="7"
            >7 Jahre</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStartValues(data) {
  const umsatzYear1 = data.start_menge * data.start_preis;
  const kostenYear1 = data.start_menge * data.start_hk;
  const db2Year1 = umsatzYear1 - kostenYear1;
  const db2Percent = umsatzYear1 > 0 ? (db2Year1 / umsatzYear1 * 100).toFixed(1) : 0;
  
  return `
    <div class="section-card-compact">
      <h3 class="section-title-compact">📊 Startwerte (Jahr 1)</h3>
      
      <div class="form-row-compact" style="grid-template-columns: repeat(3, 1fr);">
        <div class="form-group-compact">
          <label class="label-compact">Menge (Stück)</label>
          <input 
            type="number" 
            id="hw-start-menge" 
            value="${data.start_menge}"
            placeholder="z.B. 1.000"
            class="form-input-compact"
            min="0"
          >
        </div>
        
        <div class="form-group-compact">
          <label class="label-compact">Preis (€/Stück)</label>
          <input 
            type="number" 
            id="hw-start-preis" 
            value="${data.start_preis}"
            placeholder="z.B. 50,00"
            class="form-input-compact"
            min="0"
            step="0.01"
          >
        </div>
        
        <div class="form-group-compact">
          <label class="label-compact">HK (€/Stück)</label>
          <input 
            type="number" 
            id="hw-start-hk" 
            value="${data.start_hk}"
            placeholder="z.B. 20,00"
            class="form-input-compact"
            min="0"
            step="0.01"
          >
        </div>
      </div>
      
      <!-- KPI Preview INLINE -->
      <div class="kpi-preview-compact">
        <div class="kpi-card-compact">
          <div class="kpi-label-compact">Umsatz J1</div>
          <div class="kpi-value-compact">${formatCurrency(umsatzYear1)}</div>
        </div>
        <div class="kpi-card-compact">
          <div class="kpi-label-compact">DB2 J1</div>
          <div class="kpi-value-compact" style="color: #059669;">${formatCurrency(db2Year1)}</div>
        </div>
        <div class="kpi-card-compact">
          <div class="kpi-label-compact">Marge</div>
          <div class="kpi-value-compact" style="color: #059669;">${db2Percent}%</div>
        </div>
      </div>
    </div>
  `;
}

function renderDevelopmentModels(data) {
  return `
    <div class="section-card-compact">
      <h3 class="section-title-compact">📈 Entwicklungsmodelle</h3>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        
        <!-- Mengenentwicklung -->
        <div class="model-group-compact">
          <label class="model-label-compact">Mengenentwicklung</label>
          <div class="model-options-compact">
            ${renderRadioOptionCompact('menge', 'konservativ', 'Konservativ (+5%)', data.mengen_modell)}
            ${renderRadioOptionCompact('menge', 'realistisch', 'Realistisch (S-Kurve)', data.mengen_modell)}
            ${renderRadioOptionCompact('menge', 'optimistisch', 'Optimistisch (+20%)', data.mengen_modell)}
            ${renderRadioOptionCompact('menge', 'hockey-stick', 'Hockey-Stick', data.mengen_modell)}
            ${renderRadioOptionCompact('menge', 'manuell', 'Manuell', data.mengen_modell)}
          </div>
        </div>
        
        <!-- Preisentwicklung -->
        <div class="model-group-compact">
          <label class="model-label-compact">Preisentwicklung</label>
          <div class="model-options-compact">
            ${renderRadioOptionCompact('preis', 'konstant', 'Konstant (0%)', data.preis_modell)}
            ${renderRadioOptionCompact('preis', 'inflation', 'Inflation (+2%)', data.preis_modell)}
            ${renderRadioOptionCompact('preis', 'premium', 'Premium (+5%)', data.preis_modell)}
            ${renderRadioOptionCompact('preis', 'skimming', 'Skimming (-3%)', data.preis_modell)}
            ${renderRadioOptionCompact('preis', 'manuell', 'Manuell', data.preis_modell)}
          </div>
        </div>
        
        <!-- Kostenentwicklung -->
        <div class="model-group-compact">
          <label class="model-label-compact">Kostenentwicklung</label>
          <div class="model-options-compact">
            ${renderRadioOptionCompact('kosten', 'konstant', 'Konstant (0%)', data.kosten_modell)}
            ${renderRadioOptionCompact('kosten', 'lernkurve', 'Lernkurve (-5%)', data.kosten_modell)}
            ${renderRadioOptionCompact('kosten', 'inflation', 'Inflation (+3%)', data.kosten_modell)}
            ${renderRadioOptionCompact('kosten', 'skaleneffekte', 'Skaleneffekte', data.kosten_modell)}
            ${renderRadioOptionCompact('kosten', 'manuell', 'Manuell', data.kosten_modell)}
          </div>
        </div>
        
      </div>
    </div>
  `;
}

function renderRadioOptionCompact(type, value, label, currentValue) {
  const checked = currentValue === value ? 'checked' : '';
  return `
    <label class="radio-option-compact">
      <input 
        type="radio" 
        name="hw-${type}-model" 
        value="${value}"
        ${checked}
      >
      <span class="radio-label-compact">${label}</span>
    </label>
  `;
}
// ==========================================
// CALCULATION ENGINE
// ==========================================

/**
 * Calculate forecast based on models
 */
function calculateForecast(data) {
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    years: [],
    mengen: [],
    preise: [],
    kosten: [],
    umsaetze: [],
    db2_values: [],
    db2_percents: []
  };
  
  // Calculate for each year
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    forecast.years.push(year);
    
    // Menge
    const menge = calculateMenge(data, i);
    forecast.mengen.push(menge);
    
    // Preis
    const preis = calculatePreis(data, i);
    forecast.preise.push(preis);
    
    // Kosten
    const kosten = calculateKosten(data, i, menge);
    forecast.kosten.push(kosten);
    
    // Umsatz
    const umsatz = menge * preis;
    forecast.umsaetze.push(umsatz);
    
    // DB2
    const kostenTotal = menge * kosten;
    const db2 = umsatz - kostenTotal;
    forecast.db2_values.push(db2);
    
    const db2Percent = umsatz > 0 ? (db2 / umsatz * 100) : 0;
    forecast.db2_percents.push(db2Percent);
  }
  
  return forecast;
}

/**
 * Calculate Menge for year
 */
function calculateMenge(data, yearIndex) {
  const startMenge = data.start_menge;
  
  switch (data.mengen_modell) {
    case 'konservativ':
      return startMenge * Math.pow(1.05, yearIndex);
    
    case 'realistisch':
      // S-Curve (Logistic Growth)
      const t = yearIndex;
      const maxYears = data.time_horizon;
      const growthPhase = Math.min(t / (maxYears * 0.4), 1);
      const maturePhase = t > (maxYears * 0.4) ? (t - maxYears * 0.4) / (maxYears * 0.3) : 0;
      const declinePhase = t > (maxYears * 0.7) ? (t - maxYears * 0.7) / (maxYears * 0.3) : 0;
      
      let multiplier = 1;
      if (growthPhase < 1) {
        multiplier = 1 + growthPhase * 0.8;
      } else if (maturePhase < 1) {
        multiplier = 1.8 + maturePhase * 0.2;
      } else {
        multiplier = 2.0 - declinePhase * 0.3;
      }
      return startMenge * multiplier;
    
    case 'optimistisch':
      return startMenge * Math.pow(1.20, yearIndex);
    
    case 'hockey-stick':
      if (yearIndex <= 1) {
        return startMenge * Math.pow(1.10, yearIndex);
      } else {
        return startMenge * 1.10 * Math.pow(1.50, yearIndex - 1);
      }
    
    case 'manuell':
      return startMenge;
    
    default:
      return startMenge;
  }
}

/**
 * Calculate Preis for year
 */
function calculatePreis(data, yearIndex) {
  const startPreis = data.start_preis;
  
  switch (data.preis_modell) {
    case 'konstant':
      return startPreis;
    
    case 'inflation':
      return startPreis * Math.pow(1.02, yearIndex);
    
    case 'premium':
      return startPreis * Math.pow(1.05, yearIndex);
    
    case 'skimming':
      return startPreis * Math.pow(0.97, yearIndex);
    
    case 'manuell':
      return startPreis;
    
    default:
      return startPreis;
  }
}

/**
 * Calculate Kosten for year
 */
function calculateKosten(data, yearIndex, currentMenge) {
  const startHK = data.start_hk;
  const startMenge = data.start_menge;
  
  switch (data.kosten_modell) {
    case 'konstant':
      return startHK;
    
    case 'lernkurve':
      const cumulativeMenge = currentMenge;
      const doublings = Math.log2(cumulativeMenge / startMenge);
      return startHK * Math.pow(0.95, doublings);
    
    case 'inflation':
      return startHK * Math.pow(1.03, yearIndex);
    
    case 'skaleneffekte':
      if (currentMenge < 5000) {
        return startHK;
      } else if (currentMenge < 10000) {
        return startHK * 0.90;
      } else {
        return startHK * 0.80;
      }
    
    case 'manuell':
      return startHK;
    
    default:
      return startHK;
  }
}

// ==========================================
// RENDER PREVIEW TABLE
// ==========================================

function renderPreviewTable(forecast) {
  return `
    <div class="section-card-compact" style="margin-top: 12px;">
      <h3 class="section-title-compact">📊 Ergebnis-Vorschau</h3>
      
      <div class="preview-table-container">
        <table class="preview-table">
          <thead>
            <tr>
              <th style="width: 140px;">Parameter</th>
              ${forecast.years.map(year => `<th style="text-align: center;">${year}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="row-label">Menge (Stück)</td>
              ${forecast.mengen.map(m => `<td>${formatNumber(m, 0)}</td>`).join('')}
            </tr>
            <tr>
              <td class="row-label">Preis (€/Stück)</td>
              ${forecast.preise.map(p => `<td>${formatNumber(p, 2)}</td>`).join('')}
            </tr>
            <tr>
              <td class="row-label">HK (€/Stück)</td>
              ${forecast.kosten.map(k => `<td>${formatNumber(k, 2)}</td>`).join('')}
            </tr>
            <tr class="separator-row">
              <td colspan="${forecast.years.length + 1}"></td>
            </tr>
            <tr class="highlight-row">
              <td class="row-label"><strong>Umsatz (T€)</strong></td>
              ${forecast.umsaetze.map(u => `<td><strong>${formatNumber(u/1000, 0)}</strong></td>`).join('')}
            </tr>
            <tr class="highlight-row">
              <td class="row-label"><strong>DB2 (T€)</strong></td>
              ${forecast.db2_values.map(db => `<td style="color: #059669;"><strong>${formatNumber(db/1000, 0)}</strong></td>`).join('')}
            </tr>
            <tr>
              <td class="row-label">DB2 (%)</td>
              ${forecast.db2_percents.map(pct => `<td style="color: #059669;">${formatNumber(pct, 1)}%</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- KPI Summary -->
      <div class="kpi-summary">
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">Gesamt-Umsatz</div>
          <div class="kpi-summary-value">${formatCurrency(forecast.umsaetze.reduce((a,b) => a+b, 0))}</div>
        </div>
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">Gesamt-DB2</div>
          <div class="kpi-summary-value">${formatCurrency(forecast.db2_values.reduce((a,b) => a+b, 0))}</div>
        </div>
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">Ø DB2-Marge</div>
          <div class="kpi-summary-value">
            ${formatNumber(
              (forecast.db2_values.reduce((a,b) => a+b, 0) / forecast.umsaetze.reduce((a,b) => a+b, 0) * 100),
              1
            )}%
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function attachEventListeners(artikel) {
  // Horizon buttons
  document.querySelectorAll('.horizon-btn-compact').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.horizon-btn-compact').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Real-time KPI update for start values
  ['hw-start-menge', 'hw-start-preis', 'hw-start-hk'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', updateStartValuesKPI);
    }
  });
}

function updateStartValuesKPI() {
  const menge = parseFloat(document.getElementById('hw-start-menge')?.value) || 0;
  const preis = parseFloat(document.getElementById('hw-start-preis')?.value) || 0;
  const hk = parseFloat(document.getElementById('hw-start-hk')?.value) || 0;
  
  const umsatz = menge * preis;
  const kosten = menge * hk;
  const db2 = umsatz - kosten;
  const db2Percent = umsatz > 0 ? (db2 / umsatz * 100).toFixed(1) : 0;
  
  // Update KPI cards
  const kpiCards = document.querySelectorAll('.kpi-card-compact .kpi-value-compact');
  if (kpiCards.length >= 3) {
    kpiCards[0].textContent = formatCurrency(umsatz);
    kpiCards[1].textContent = formatCurrency(db2);
    kpiCards[2].textContent = `${db2Percent}%`;
  }
}

// ==========================================
// WINDOW FUNCTIONS (Called from UI)
// ==========================================

window.calculateHardwareModel = async function(artikelId) {
  console.log('📊 Calculating Hardware Model for:', artikelId);
  
  // Get artikel from state
  const artikel = window.revenueModelArtikel?.find(a => a.id === artikelId);
  if (!artikel) {
    console.error('❌ Artikel not found:', artikelId);
    return;
  }
  
  // Collect data from form
  const data = {
    release_date: document.getElementById('hw-release-date')?.value,
    time_horizon: parseInt(document.querySelector('.horizon-btn-compact.active')?.dataset.years) || 5,
    start_menge: parseFloat(document.getElementById('hw-start-menge')?.value) || 0,
    start_preis: parseFloat(document.getElementById('hw-start-preis')?.value) || 0,
    start_hk: parseFloat(document.getElementById('hw-start-hk')?.value) || 0,
    mengen_modell: document.querySelector('input[name="hw-menge-model"]:checked')?.value || 'realistisch',
    preis_modell: document.querySelector('input[name="hw-preis-model"]:checked')?.value || 'konstant',
    kosten_modell: document.querySelector('input[name="hw-kosten-model"]:checked')?.value || 'lernkurve'
  };
  
  // Validate
  if (!data.start_menge || !data.start_preis) {
    alert('Bitte Startwerte für Menge und Preis eingeben!');
    return;
  }
  
  // Calculate forecast
  const forecast = calculateForecast(data);
  data.calculated = true;
  data.forecast = forecast;
  
  console.log('✅ Forecast calculated:', forecast);
  
  // Render preview
  const previewContainer = document.getElementById('hardware-preview-container');
  if (previewContainer) {
    previewContainer.innerHTML = renderPreviewTable(forecast);
  }
  
  // Save to artikel
  artikel.revenue_model_data = data;
  artikel.release_datum = data.release_date;
  artikel.zeitraum = data.time_horizon;
  artikel.start_menge = data.start_menge;
  artikel.start_preis = data.start_preis;
  artikel.start_hk = data.start_hk;
  artikel.mengen_modell = data.mengen_modell;
  artikel.preis_modell = data.preis_modell;
  artikel.kosten_modell = data.kosten_modell;
  
  // Save to backend
  if (window.api && window.api.saveArticle) {
    try {
      await window.api.saveArticle(artikel);
      console.log('✅ Hardware model saved to database');
    } catch (error) {
      console.error('❌ Error saving:', error);
    }
  }
};

window.resetHardwareModel = function(artikelId) {
  const confirmed = confirm('Möchten Sie alle Eingaben zurücksetzen?');
  if (!confirmed) return;
  
  const artikel = window.revenueModelArtikel?.find(a => a.id === artikelId);
  if (!artikel) return;
  
  // Reset data
  artikel.revenue_model_data = null;
  
  // Re-render
  if (window.renderHardwareModel) {
    renderHardwareModel(artikel, 'detail-container');
  }
};

function calculateAndRender(artikel) {
  const data = artikel.revenue_model_data;
  if (!data || !data.forecast) return;
  
  const previewContainer = document.getElementById('hardware-preview-container');
  if (previewContainer) {
    previewContainer.innerHTML = renderPreviewTable(data.forecast);
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

function renderActionButtons(artikelId) {
  return `
    <div class="action-buttons-compact">
      <button 
        class="btn btn-secondary-compact" 
        onclick="window.resetHardwareModel('${artikelId}')"
      >
        🔄 Zurücksetzen
      </button>
      <button 
        class="btn btn-primary-compact" 
        onclick="window.calculateHardwareModel('${artikelId}')"
      >
        📊 Berechnen & Vorschau
      </button>
    </div>
  `;
}

// ==========================================
// CALCULATION ENGINE
// ==========================================

/**
 * Calculate forecast based on models
 */
function calculateForecast(data) {
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    years: [],
    mengen: [],
    preise: [],
    kosten: [],
    umsaetze: [],
    db2_values: [],
    db2_percents: []
  };
  
  // Calculate for each year
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    forecast.years.push(year);
    
    // Menge
    const menge = calculateMenge(data, i);
    forecast.mengen.push(menge);
    
    // Preis
    const preis = calculatePreis(data, i);
    forecast.preise.push(preis);
    
    // Kosten
    const kosten = calculateKosten(data, i, menge);
    forecast.kosten.push(kosten);
    
    // Umsatz
    const umsatz = menge * preis;
    forecast.umsaetze.push(umsatz);
    
    // DB2
    const kostenTotal = menge * kosten;
    const db2 = umsatz - kostenTotal;
    forecast.db2_values.push(db2);
    
    const db2Percent = umsatz > 0 ? (db2 / umsatz * 100) : 0;
    forecast.db2_percents.push(db2Percent);
  }
  
  return forecast;
}

/**
 * Calculate Menge for year
 */
function calculateMenge(data, yearIndex) {
  const startMenge = data.start_menge;
  
  switch (data.mengen_modell) {
    case 'konservativ':
      return startMenge * Math.pow(1.05, yearIndex);
    
    case 'realistisch':
      // S-Curve (Logistic Growth)
      // Peak in middle years, then decline
      const t = yearIndex;
      const maxYears = data.time_horizon;
      const growthPhase = Math.min(t / (maxYears * 0.4), 1); // Growth until 40% of timeline
      const maturePhase = t > (maxYears * 0.4) ? (t - maxYears * 0.4) / (maxYears * 0.3) : 0;
      const declinePhase = t > (maxYears * 0.7) ? (t - maxYears * 0.7) / (maxYears * 0.3) : 0;
      
      let multiplier = 1;
      if (growthPhase < 1) {
        // Growth phase: exponential
        multiplier = 1 + growthPhase * 0.8; // Up to 80% growth
      } else if (maturePhase < 1) {
        // Mature phase: stable
        multiplier = 1.8 + maturePhase * 0.2; // 1.8 to 2.0
      } else {
        // Decline phase
        multiplier = 2.0 - declinePhase * 0.3; // Down to 1.7
      }
      return startMenge * multiplier;
    
    case 'optimistisch':
      return startMenge * Math.pow(1.20, yearIndex);
    
    case 'hockey-stick':
      if (yearIndex <= 1) {
        return startMenge * Math.pow(1.10, yearIndex);
      } else {
        return startMenge * 1.10 * Math.pow(1.50, yearIndex - 1);
      }
    
    case 'manuell':
      // TODO: Manual input per year
      return startMenge;
    
    default:
      return startMenge;
  }
}

/**
 * Calculate Preis for year
 */
function calculatePreis(data, yearIndex) {
  const startPreis = data.start_preis;
  
  switch (data.preis_modell) {
    case 'konstant':
      return startPreis;
    
    case 'inflation':
      return startPreis * Math.pow(1.02, yearIndex);
    
    case 'premium':
      return startPreis * Math.pow(1.05, yearIndex);
    
    case 'skimming':
      return startPreis * Math.pow(0.97, yearIndex);
    
    case 'manuell':
      return startPreis;
    
    default:
      return startPreis;
  }
}

/**
 * Calculate Kosten for year
 */
function calculateKosten(data, yearIndex, currentMenge) {
  const startHK = data.start_hk;
  const startMenge = data.start_menge;
  
  switch (data.kosten_modell) {
    case 'konstant':
      return startHK;
    
    case 'lernkurve':
      // Learning Curve: -5% per doubling
      const cumulativeMenge = currentMenge;
      const doublings = Math.log2(cumulativeMenge / startMenge);
      return startHK * Math.pow(0.95, doublings);
    
    case 'inflation':
      return startHK * Math.pow(1.03, yearIndex);
    
    case 'skaleneffekte':
      // Step function at 5k and 10k
      if (currentMenge < 5000) {
        return startHK;
      } else if (currentMenge < 10000) {
        return startHK * 0.90; // 10% reduction
      } else {
        return startHK * 0.80; // 20% reduction
      }
    
    case 'manuell':
      return startHK;
    
    default:
      return startHK;
  }
}

// ==========================================
// RENDER PREVIEW TABLE
// ==========================================

function renderPreviewTable(forecast) {
  return `
    <div class="section-card-compact" style="margin-top: 12px;">
      <h3 class="section-title-compact">📊 Ergebnis-Vorschau</h3>
      
      <div class="preview-table-container">
        <table class="preview-table">
          <thead>
            <tr>
              <th style="width: 140px;">Parameter</th>
              ${forecast.years.map(year => `<th style="text-align: center;">${year}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="row-label">Menge (Stück)</td>
              ${forecast.mengen.map(m => `<td>${formatNumber(m, 0)}</td>`).join('')}
            </tr>
            <tr>
              <td class="row-label">Preis (€/Stück)</td>
              ${forecast.preise.map(p => `<td>${formatNumber(p, 2)}</td>`).join('')}
            </tr>
            <tr>
              <td class="row-label">HK (€/Stück)</td>
              ${forecast.kosten.map(k => `<td>${formatNumber(k, 2)}</td>`).join('')}
            </tr>
            <tr class="separator-row">
              <td colspan="${forecast.years.length + 1}"></td>
            </tr>
            <tr class="highlight-row">
              <td class="row-label"><strong>Umsatz (T€)</strong></td>
              ${forecast.umsaetze.map(u => `<td><strong>${formatNumber(u/1000, 0)}</strong></td>`).join('')}
            </tr>
            <tr class="highlight-row">
              <td class="row-label"><strong>DB2 (T€)</strong></td>
              ${forecast.db2_values.map(db => `<td style="color: #059669;"><strong>${formatNumber(db/1000, 0)}</strong></td>`).join('')}
            </tr>
            <tr>
              <td class="row-label">DB2 (%)</td>
              ${forecast.db2_percents.map(pct => `<td style="color: #059669;">${formatNumber(pct, 1)}%</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- KPI Summary -->
      <div class="kpi-summary">
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">Gesamt-Umsatz</div>
          <div class="kpi-summary-value">${formatCurrency(forecast.umsaetze.reduce((a,b) => a+b, 0))}</div>
        </div>
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">Gesamt-DB2</div>
          <div class="kpi-summary-value">${formatCurrency(forecast.db2_values.reduce((a,b) => a+b, 0))}</div>
        </div>
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">Ø DB2-Marge</div>
          <div class="kpi-summary-value">
            ${formatNumber(
              (forecast.db2_values.reduce((a,b) => a+b, 0) / forecast.umsaetze.reduce((a,b) => a+b, 0) * 100),
              1
            )}%
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function attachEventListeners(artikel) {
  // Horizon buttons
  document.querySelectorAll('.horizon-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.horizon-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Real-time KPI update for start values
  ['hw-start-menge', 'hw-start-preis', 'hw-start-hk'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', updateStartValuesKPI);
    }
  });
}

function updateStartValuesKPI() {
  const menge = parseFloat(document.getElementById('hw-start-menge')?.value) || 0;
  const preis = parseFloat(document.getElementById('hw-start-preis')?.value) || 0;
  const hk = parseFloat(document.getElementById('hw-start-hk')?.value) || 0;
  
  const umsatz = menge * preis;
  const kosten = menge * hk;
  const db2 = umsatz - kosten;
  const db2Percent = umsatz > 0 ? (db2 / umsatz * 100).toFixed(1) : 0;
  
  // Update KPI cards
  const kpiCards = document.querySelectorAll('.kpi-card .kpi-value');
  if (kpiCards.length >= 4) {
    kpiCards[0].textContent = formatCurrency(umsatz);
    kpiCards[1].textContent = formatCurrency(kosten);
    kpiCards[2].textContent = formatCurrency(db2);
    kpiCards[3].textContent = `${db2Percent}%`;
  }
}

// ==========================================
// WINDOW FUNCTIONS (Called from UI)
// ==========================================

window.calculateHardwareModel = async function(artikelId) {
  console.log('📊 Calculating Hardware Model for:', artikelId);
  
  // Get artikel from state
  const artikel = window.state?.getArtikel(artikelId);
  if (!artikel) {
    console.error('❌ Artikel not found:', artikelId);
    return;
  }
  
  // Collect data from form
  const data = {
    release_date: document.getElementById('hw-release-date')?.value,
    time_horizon: parseInt(document.querySelector('.horizon-btn.active')?.dataset.years) || 5,
    start_menge: parseFloat(document.getElementById('hw-start-menge')?.value) || 0,
    start_preis: parseFloat(document.getElementById('hw-start-preis')?.value) || 0,
    start_hk: parseFloat(document.getElementById('hw-start-hk')?.value) || 0,
    mengen_modell: document.querySelector('input[name="hw-menge-model"]:checked')?.value || 'realistisch',
    preis_modell: document.querySelector('input[name="hw-preis-model"]:checked')?.value || 'konstant',
    kosten_modell: document.querySelector('input[name="hw-kosten-model"]:checked')?.value || 'lernkurve'
  };
  
  // Validate
  if (!data.start_menge || !data.start_preis) {
    alert('Bitte Startwerte für Menge und Preis eingeben!');
    return;
  }
  
  // Calculate forecast
  const forecast = calculateForecast(data);
  data.calculated = true;
  data.forecast = forecast;
  
  console.log('✅ Forecast calculated:', forecast);
  
  // Render preview
  const previewContainer = document.getElementById('hardware-preview-container');
  if (previewContainer) {
    previewContainer.innerHTML = renderPreviewTable(forecast);
  }
  
  // Save to artikel
  artikel.revenue_model_data = data;
  artikel.release_datum = data.release_date;
  artikel.zeitraum = data.time_horizon;
  artikel.start_menge = data.start_menge;
  artikel.start_preis = data.start_preis;
  artikel.start_hk = data.start_hk;
  artikel.mengen_modell = data.mengen_modell;
  artikel.preis_modell = data.preis_modell;
  artikel.kosten_modell = data.kosten_modell;
  
  // Save to backend
  if (window.api && window.api.saveArticle) {
    try {
      await window.api.saveArticle(artikel);
      console.log('✅ Hardware model saved to database');
    } catch (error) {
      console.error('❌ Error saving:', error);
    }
  }
};

window.resetHardwareModel = function(artikelId) {
  const confirmed = confirm('Möchten Sie alle Eingaben zurücksetzen?');
  if (!confirmed) return;
  
  const artikel = window.state?.getArtikel(artikelId);
  if (!artikel) return;
  
  // Reset data
  artikel.revenue_model_data = null;
  
  // Re-render
  if (window.renderHardwareModel) {
    renderHardwareModel(artikel, 'revenue-model-content');
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// ==========================================
// STYLES
// ==========================================

function renderStyles() {
  return `
    <style>
      .revenue-model-container {
        max-width: 100%;
        margin: 0;
        padding: 0;
      }
      
      /* ===== COMPACT SECTIONS ===== */
      .section-card-compact {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      }
      
      .section-title-compact {
        margin: 0 0 10px;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
      }
      
      /* ===== COMPACT FORMS ===== */
      .form-row-compact {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-bottom: 10px;
      }
      
      .form-group-compact {
        display: flex;
        flex-direction: column;
      }
      
      .label-compact {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        font-weight: 500;
        color: #374151;
      }
      
      .form-input-compact {
        width: 100%;
        padding: 6px 10px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 13px;
        transition: all 0.2s;
      }
      
      .form-input-compact:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }
      
      /* ===== HORIZON BUTTONS ===== */
      .horizon-buttons-compact {
        display: flex;
        gap: 6px;
      }
      
      .horizon-btn-compact {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        font-size: 12px;
        font-weight: 500;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .horizon-btn-compact:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .horizon-btn-compact.active {
        border-color: #2563eb;
        background: #2563eb;
        color: white;
      }
      
      /* ===== COMPACT KPI CARDS ===== */
      .kpi-preview-compact {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 10px;
      }
      
      .kpi-card-compact {
        padding: 8px;
        background: #f9fafb;
        border-radius: 6px;
        text-align: center;
      }
      
      .kpi-label-compact {
        font-size: 11px;
        color: #6b7280;
        margin-bottom: 4px;
      }
      
      .kpi-value-compact {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
      }
      
      /* ===== COMPACT DEVELOPMENT MODELS ===== */
      .model-group-compact {
        display: flex;
        flex-direction: column;
      }
      
      .model-label-compact {
        display: block;
        margin-bottom: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .model-options-compact {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .radio-option-compact {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
      }
      
      .radio-option-compact:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .radio-option-compact input[type="radio"] {
        width: 14px;
        height: 14px;
        margin: 0;
        cursor: pointer;
        flex-shrink: 0;
      }
      
      .radio-option-compact input[type="radio"]:checked ~ .radio-label-compact {
        color: #2563eb;
        font-weight: 600;
      }
      
      .radio-label-compact {
        font-size: 12px;
        color: #374151;
      }
      
      /* ===== COMPACT ACTION BUTTONS ===== */
      .action-buttons-compact {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin: 12px 0;
      }
      
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-secondary-compact {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
      }
      
      .btn-secondary-compact:hover {
        background: #e5e7eb;
      }
      
      .btn-primary-compact {
        background: #2563eb;
        color: white;
      }
      
      .btn-primary-compact:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
      }
      
      /* ===== PREVIEW TABLE (auch kompakt!) ===== */
      .preview-table-container {
        overflow-x: auto;
        margin: 12px 0;
      }
      
      .preview-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      
      .preview-table th {
        padding: 8px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        font-weight: 600;
        text-align: left;
        font-size: 11px;
      }
      
      .preview-table td {
        padding: 6px 8px;
        border: 1px solid #e5e7eb;
        text-align: right;
      }
      
      .preview-table .row-label {
        text-align: left;
        font-weight: 500;
        background: #f9fafb;
        font-size: 12px;
      }
      
      .preview-table .highlight-row {
        background: #fffbeb;
      }
      
      .preview-table .separator-row td {
        padding: 2px;
        border: none;
      }
      
      /* ===== KPI SUMMARY (kompakt) ===== */
      .kpi-summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 12px;
      }
      
      .kpi-summary-card {
        padding: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        text-align: center;
        color: white;
      }
      
      .kpi-summary-label {
        font-size: 11px;
        opacity: 0.9;
        margin-bottom: 4px;
      }
      
      .kpi-summary-value {
        font-size: 16px;
        font-weight: 700;
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderHardwareModel,
  calculateForecast
};
