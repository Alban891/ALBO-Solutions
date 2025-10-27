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
    <div class="section-card">
      <h3 class="section-title">📅 Zeitliche Rahmendaten</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label>Release / Startdatum</label>
          <input 
            type="month" 
            id="hw-release-date" 
            value="${data.release_date}"
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label>Zeithorizont</label>
          <div class="horizon-buttons">
            <button 
              class="horizon-btn ${data.time_horizon === 3 ? 'active' : ''}" 
              data-years="3"
            >3 Jahre</button>
            <button 
              class="horizon-btn ${data.time_horizon === 5 ? 'active' : ''}" 
              data-years="5"
            >5 Jahre</button>
            <button 
              class="horizon-btn ${data.time_horizon === 7 ? 'active' : ''}" 
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
    <div class="section-card">
      <h3 class="section-title">📊 Startwerte (Jahr 1)</h3>
      
      <div class="info-box">
        <div class="info-icon">💡</div>
        <div class="info-text">
          <strong>Tipp:</strong> Tragen Sie hier Ihre Annahmen für das erste Jahr ein. 
          Diese Werte dienen als Basis für die automatischen Entwicklungsmodelle.
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Menge (Stück)</label>
          <input 
            type="number" 
            id="hw-start-menge" 
            value="${data.start_menge}"
            placeholder="z.B. 1.000"
            class="form-input"
            min="0"
          >
        </div>
        
        <div class="form-group">
          <label>Preis (€/Stück)</label>
          <input 
            type="number" 
            id="hw-start-preis" 
            value="${data.start_preis}"
            placeholder="z.B. 50,00"
            class="form-input"
            min="0"
            step="0.01"
          >
        </div>
        
        <div class="form-group">
          <label>HK (€/Stück)</label>
          <input 
            type="number" 
            id="hw-start-hk" 
            value="${data.start_hk}"
            placeholder="z.B. 20,00"
            class="form-input"
            min="0"
            step="0.01"
          >
        </div>
      </div>
      
      <!-- KPI Preview -->
      <div class="kpi-preview">
        <div class="kpi-card">
          <div class="kpi-label">Umsatz Jahr 1</div>
          <div class="kpi-value">${formatCurrency(umsatzYear1)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Kosten Jahr 1</div>
          <div class="kpi-value" style="color: #dc2626;">${formatCurrency(kostenYear1)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">DB2 Jahr 1</div>
          <div class="kpi-value" style="color: #059669;">${formatCurrency(db2Year1)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">DB2 Marge</div>
          <div class="kpi-value" style="color: #059669;">${db2Percent}%</div>
        </div>
      </div>
    </div>
  `;
}

function renderDevelopmentModels(data) {
  return `
    <div class="section-card">
      <h3 class="section-title">📈 Entwicklungsmodelle</h3>
      
      <!-- Mengenentwicklung -->
      <div class="model-group">
        <label class="model-label">Mengenentwicklung</label>
        <div class="model-options">
          ${renderRadioOption('menge', 'konservativ', 'Konservativ', '+5% p.a.', data.mengen_modell)}
          ${renderRadioOption('menge', 'realistisch', 'Realistisch', 'S-Kurve (Produktlebenszyklus)', data.mengen_modell)}
          ${renderRadioOption('menge', 'optimistisch', 'Optimistisch', '+20% p.a.', data.mengen_modell)}
          ${renderRadioOption('menge', 'hockey-stick', 'Hockey-Stick', 'J1-2: +10%, ab J3: +50%', data.mengen_modell)}
          ${renderRadioOption('menge', 'manuell', 'Manuell', 'Jahr für Jahr eingeben', data.mengen_modell)}
        </div>
      </div>
      
      <!-- Preisentwicklung -->
      <div class="model-group">
        <label class="model-label">Preisentwicklung</label>
        <div class="model-options">
          ${renderRadioOption('preis', 'konstant', 'Konstant', '0% p.a.', data.preis_modell)}
          ${renderRadioOption('preis', 'inflation', 'Inflation', '+2% p.a.', data.preis_modell)}
          ${renderRadioOption('preis', 'premium', 'Premium', '+5% p.a. (Value-Based)', data.preis_modell)}
          ${renderRadioOption('preis', 'skimming', 'Skimming', '-3% p.a. (Wettbewerb)', data.preis_modell)}
          ${renderRadioOption('preis', 'manuell', 'Manuell', 'Jahr für Jahr eingeben', data.preis_modell)}
        </div>
      </div>
      
      <!-- Kostenentwicklung -->
      <div class="model-group">
        <label class="model-label">Kostenentwicklung</label>
        <div class="model-options">
          ${renderRadioOption('kosten', 'konstant', 'Konstant', '0% p.a.', data.kosten_modell)}
          ${renderRadioOption('kosten', 'lernkurve', 'Lernkurve', '-5% bis 2x Menge', data.kosten_modell)}
          ${renderRadioOption('kosten', 'inflation', 'Inflation', '+3% p.a.', data.kosten_modell)}
          ${renderRadioOption('kosten', 'skaleneffekte', 'Skaleneffekte', 'Stufen bei 5k, 10k', data.kosten_modell)}
          ${renderRadioOption('kosten', 'manuell', 'Manuell', 'Jahr für Jahr eingeben', data.kosten_modell)}
        </div>
      </div>
    </div>
  `;
}

function renderRadioOption(type, value, label, description, currentValue) {
  const checked = currentValue === value ? 'checked' : '';
  return `
    <label class="radio-option">
      <input 
        type="radio" 
        name="hw-${type}-model" 
        value="${value}"
        ${checked}
      >
      <div class="radio-content">
        <div class="radio-label">${label}</div>
        <div class="radio-description">${description}</div>
      </div>
    </label>
  `;
}

function renderActionButtons(artikelId) {
  return `
    <div class="action-buttons">
      <button 
        class="btn btn-secondary" 
        onclick="window.resetHardwareModel('${artikelId}')"
      >
        🔄 Zurücksetzen
      </button>
      <button 
        class="btn btn-primary btn-large" 
        onclick="window.calculateHardwareModel('${artikelId}')"
      >
        📊 Berechnen & Vorschau aktualisieren
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
    <div class="section-card" style="margin-top: 30px;">
      <h3 class="section-title">📊 Ergebnis-Vorschau</h3>
      
      <div class="preview-table-container">
        <table class="preview-table">
          <thead>
            <tr>
              <th>Parameter</th>
              ${forecast.years.map(year => `<th>${year}</th>`).join('')}
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
          <div class="kpi-summary-value" style="color: #059669;">${formatCurrency(forecast.db2_values.reduce((a,b) => a+b, 0))}</div>
        </div>
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">Ø DB2-Marge</div>
          <div class="kpi-summary-value" style="color: #059669;">
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
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .section-card {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 30px;
        margin-bottom: 24px;
      }
      
      .section-title {
        margin: 0 0 20px;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
      
      .form-input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 15px;
        transition: all 0.2s;
      }
      
      .form-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .horizon-buttons {
        display: flex;
        gap: 8px;
      }
      
      .horizon-btn {
        flex: 1;
        padding: 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        background: white;
        font-size: 15px;
        font-weight: 500;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .horizon-btn:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .horizon-btn.active {
        border-color: #2563eb;
        background: #2563eb;
        color: white;
      }
      
      .info-box {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: #fef3c7;
        border: 2px solid #f59e0b;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      
      .info-icon {
        font-size: 20px;
      }
      
      .info-text {
        font-size: 14px;
        color: #92400e;
        line-height: 1.6;
      }
      
      .kpi-preview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }
      
      .kpi-card {
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
        text-align: center;
      }
      
      .kpi-label {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 8px;
      }
      
      .kpi-value {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .model-group {
        margin-bottom: 30px;
      }
      
      .model-label {
        display: block;
        margin-bottom: 12px;
        font-size: 15px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .model-options {
        display: grid;
        gap: 10px;
      }
      
      .radio-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .radio-option:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .radio-option input[type="radio"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
      
      .radio-option input[type="radio"]:checked ~ .radio-content {
        color: #2563eb;
      }
      
      .radio-content {
        flex: 1;
      }
      
      .radio-label {
        font-size: 15px;
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .radio-description {
        font-size: 13px;
        color: #6b7280;
      }
      
      .action-buttons {
        display: flex;
        gap: 16px;
        justify-content: flex-end;
        margin: 30px 0;
      }
      
      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }
      
      .btn-secondary:hover {
        background: #e5e7eb;
      }
      
      .btn-primary {
        background: #2563eb;
        color: white;
      }
      
      .btn-primary:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }
      
      .btn-large {
        padding: 14px 32px;
        font-size: 16px;
      }
      
      .preview-table-container {
        overflow-x: auto;
        margin: 20px 0;
      }
      
      .preview-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      
      .preview-table th {
        padding: 12px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        font-weight: 600;
        text-align: left;
      }
      
      .preview-table td {
        padding: 12px;
        border: 1px solid #e5e7eb;
        text-align: right;
      }
      
      .preview-table .row-label {
        text-align: left;
        font-weight: 500;
        background: #f9fafb;
      }
      
      .preview-table .highlight-row {
        background: #fffbeb;
      }
      
      .preview-table .separator-row td {
        padding: 4px;
        border: none;
      }
      
      .kpi-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }
      
      .kpi-summary-card {
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        text-align: center;
        color: white;
      }
      
      .kpi-summary-label {
        font-size: 13px;
        opacity: 0.9;
        margin-bottom: 8px;
      }
      
      .kpi-summary-value {
        font-size: 24px;
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
