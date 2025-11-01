/**
 * SOFTWARE MODEL - COMPACT VERSION
 * Beide Modi: Perpetual + SaaS
 * Kompaktes Design, Auto-Calculate, Always-Visible Forecast
 */

import { renderForecastTable } from './forecast-table.js';
import * as api from '../../api.js';

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export async function renderSoftwareModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('💿 Rendering Software Model (Compact) for:', artikel.name);
  
  // Initialize data
  if (!artikel.software_model_data) {
    artikel.software_model_data = initializeSoftwareData(artikel);
  }
  
  // ✅ LOAD SAVED DATA FROM DATABASE
await loadSavedForecast(artikel);

// ✅ Determine which modes to show based on revenue streams
const revenueStreams = artikel.revenue_streams || [];
const hasOneTimeSale = revenueStreams.includes('one_time_sale');
const hasSubscription = revenueStreams.includes('subscription');

console.log('📊 Revenue Streams:', revenueStreams);
console.log('   One-Time Sale:', hasOneTimeSale);
console.log('   Subscription:', hasSubscription);

// ✅ Set mode based on revenue streams
const data = artikel.software_model_data;

if (revenueStreams.length === 0) {
  // NO STREAMS → Default to Perpetual only
  data.license_mode = 'perpetual';
  data.show_toggle = false;  // ✅ KEIN Toggle!
  console.log('   → No streams defined, default to PERPETUAL only');
  
} else if (hasOneTimeSale && hasSubscription) {
  // BOTH STREAMS → Show toggle
  data.show_toggle = true;
  console.log('   → Both streams available, showing toggle');
  
} else if (hasOneTimeSale) {
  // ONLY ONE-TIME → Perpetual only
  data.license_mode = 'perpetual';
  data.show_toggle = false;
  console.log('   → Only One-Time Sale, PERPETUAL only');
  
} else if (hasSubscription) {
  // ONLY SUBSCRIPTION → SaaS only
  data.license_mode = 'saas';
  data.show_toggle = false;
  console.log('   → Only Subscription, SAAS only');
  
} else {
  // FALLBACK (sollte nie erreicht werden)
  data.license_mode = 'perpetual';
  data.show_toggle = false;
  console.log('   → Fallback: PERPETUAL only');
}

console.log('   → Final: mode=' + data.license_mode + ', show_toggle=' + data.show_toggle);

container.innerHTML = `
  <div class="software-model-compact">
      
      <!-- Zeitliche Rahmendaten -->
      <div class="section-compact">
        <h3 class="section-title-compact">📅 Zeitliche Rahmendaten</h3>
        <div class="input-row-compact">
          <div class="input-group-compact">
            <label>Release / Startdatum</label>
            <input type="month" id="sw-date" value="${data.release_date}" class="input-compact">
          </div>
          <div class="input-group-compact">
            <label>Zeithorizont</label>
            <div class="horizon-compact">
              <button class="btn-horizon ${data.time_horizon === 3 ? 'active' : ''}" data-years="3">3J</button>
              <button class="btn-horizon ${data.time_horizon === 5 ? 'active' : ''}" data-years="5">5J</button>
              <button class="btn-horizon ${data.time_horizon === 7 ? 'active' : ''}" data-years="7">7J</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Lizenzmodell -->
        <div class="section-compact">
        <h3 class="section-title-compact">💿 Lizenzmodell</h3>
        
        ${data.show_toggle ? `
            <!-- Multi-Stream: Show Toggle -->
            <div class="license-mode-toggle">
            <button class="mode-btn ${data.license_mode === 'perpetual' ? 'active' : ''}" data-mode="perpetual">
                Perpetual License
            </button>
            <button class="mode-btn ${data.license_mode === 'saas' ? 'active' : ''}" data-mode="saas">
                SaaS / Subscription
            </button>
            </div>
        ` : `
            <!-- Single-Stream: Show Info Only -->
            <div style="padding: 10px 12px; background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 6px; font-size: 13px; color: #1e40af;">
            <strong>${data.license_mode === 'perpetual' ? '📦 Perpetual License' : '🔄 SaaS / Subscription'}</strong>
            <span style="margin-left: 8px; font-size: 11px; opacity: 0.8;">(Single Revenue Stream)</span>
            </div>
        `}
        </div>
      
      <!-- Dynamic Content Area -->
      <div id="sw-mode-content">
        ${renderModeContent(data)}
      </div>
      
    </div>

     <!-- ✅ SPEICHERN-BUTTON SECTION -->
      <div class="section-compact save-section">
        <div class="save-button-container">
          <button id="btn-save-software-forecast" class="btn-save-forecast-modern">
            Speichern
          </button>
          <div id="save-status-software" class="save-status" style="display: none;">
            <span class="status-icon success">✓</span>
            <span class="status-text">Erfolgreich gespeichert</span>
          </div>
          <div id="save-error-software" class="save-status error" style="display: none;">
            <span class="status-icon">⚠️</span>
            <span class="error-text">Fehler beim Speichern</span>
          </div>
        </div>
        <div class="save-info">
          💡 <em>Speichert Input-Parameter und berechnete Forecast-Daten in der Datenbank</em>
        </div>
      </div>
      
    </div>
    
    ${renderCompactStyles()}
  `;
  
  // Attach event listeners
  attachSoftwareEventListeners(artikel, data.show_toggle);
  
  // Store artikel reference
  window._currentArtikel = artikel;
  
  // AUTO-CALCULATE
  autoCalculateForecast();
}

// ==========================================
// MODE CONTENT RENDERING
// ==========================================

function renderModeContent(data) {
  if (data.license_mode === 'perpetual') {
    return renderPerpetualContent(data);
  } else {
    return renderSaaSContent(data);
  }
}

function renderPerpetualContent(data) {
  return `
    <!-- Perpetual Mode -->
    <div class="section-compact">
      <h3 class="section-title-compact">📊 Startwerte (Jahr 1)</h3>
      <div class="input-row-compact">
        <div class="input-group-compact">
          <label>Neue Lizenzen</label>
          <input type="number" id="sw-licenses" value="${data.licenses_year1}" class="input-compact" placeholder="100">
        </div>
        <div class="input-group-compact">
          <label>Lizenzpreis (€)</label>
          <input type="number" id="sw-price" value="${data.license_price}" class="input-compact" placeholder="5000">
        </div>
        <div class="input-group-compact">
          <label>Lizenzkosten (€)</label>
          <input type="number" id="sw-cost" value="${data.license_cost}" class="input-compact" placeholder="500">
        </div>
      </div>
      
      <div class="input-row-compact" style="margin-top: 10px;">
        <div class="input-group-compact">
          <label>
            Maintenance Rate (%)
            <span class="tooltip-icon" title="Jährlicher Wartungsvertrag als % vom Lizenzpreis. Typisch: 15-25%">ℹ️</span>
          </label>
          <input type="number" id="sw-maint-rate" value="${data.maintenance_rate}" class="input-compact" placeholder="20" max="100">
          <small style="font-size: 10px; color: #6b7280; margin-top: 2px;">z.B. 20% von 5.000€ = 1.000€/Jahr</small>
        </div>
        <div class="input-group-compact">
          <label>
            Maintenance Marge (%)
            <span class="tooltip-icon" title="Gewinnmarge auf Wartungsverträge. Typisch: 80-90% (niedrige Kosten)">ℹ️</span>
          </label>
          <input type="number" id="sw-maint-margin" value="${data.maintenance_margin}" class="input-compact" placeholder="85" max="100">
          <small style="font-size: 10px; color: #6b7280; margin-top: 2px;">Hohe Marge, da geringe Kosten</small>
        </div>
      </div>
      
      <!-- Quick KPIs -->
      <div class="kpis-inline">
        <span class="kpi-inline">
          <strong>License Rev J1:</strong> 
          <span id="kpi-license-revenue">-</span>
        </span>
        <span class="kpi-inline">
          <strong>Maint Rev J1:</strong> 
          <span id="kpi-maint-revenue">-</span>
        </span>
        <span class="kpi-inline">
          <strong>Total Rev J1:</strong> 
          <span id="kpi-total-revenue" class="kpi-positive">-</span>
        </span>
      </div>
    </div>
    
    <!-- Entwicklungsmodelle -->
    <div class="section-compact">
      <h3 class="section-title-compact">📈 ENTWICKLUNGSMODELLE</h3>
      
      <div class="models-grid">
        <!-- Lizenzentwicklung -->
        <div class="model-column">
          <div class="model-header">LIZENZENTWICKLUNG</div>
          <label class="model-option">
            <input type="radio" name="sw-license-model" value="konstant" ${data.license_model === 'konstant' ? 'checked' : ''}>
            <span>Konstant <small>(+0% p.a.)</small></span>
          </label>
          <label class="model-option">
            <input type="radio" name="sw-license-model" value="konservativ" ${data.license_model === 'konservativ' ? 'checked' : ''}>
            <span>Konservativ <small>(+5% p.a.)</small></span>
          </label>
          <label class="model-option">
            <input type="radio" name="sw-license-model" value="optimistisch" ${data.license_model === 'optimistisch' ? 'checked' : ''}>
            <span>Optimistisch <small>(+15% p.a.)</small></span>
          </label>
          <label class="model-option">
            <input type="radio" name="sw-license-model" value="manuell" ${data.license_model === 'manuell' ? 'checked' : ''}>
            <span style="color: #6b7280;">Manuell</span>
          </label>
        </div>
        
        <!-- Preisentwicklung -->
        <div class="model-column">
          <div class="model-header">PREISENTWICKLUNG</div>
          <label class="model-option">
            <input type="radio" name="sw-price-model" value="konstant" ${data.price_model === 'konstant' ? 'checked' : ''}>
            <span>Konstant <small>(0% p.a.)</small></span>
          </label>
          <label class="model-option">
            <input type="radio" name="sw-price-model" value="inflation" ${data.price_model === 'inflation' ? 'checked' : ''}>
            <span>Inflation <small>(+2% p.a.)</small></span>
          </label>
          <label class="model-option">
            <input type="radio" name="sw-price-model" value="premium" ${data.price_model === 'premium' ? 'checked' : ''}>
            <span>Premium <small>(+5% p.a.)</small></span>
          </label>
          <label class="model-option">
            <input type="radio" name="sw-price-model" value="manuell" ${data.price_model === 'manuell' ? 'checked' : ''}>
            <span style="color: #6b7280;">Manuell</span>
          </label>
        </div>
        
        <!-- Kostenentwicklung -->
        <div class="model-column">
          <div class="model-header">KOSTENENTWICKLUNG</div>
          <label class="model-option">
            <input type="radio" name="sw-cost-model" value="konstant" checked>
            <span>Konstant <small>(0% p.a.)</small></span>
          </label>
          <label class="model-option disabled">
            <input type="radio" name="sw-cost-model" value="lernkurve" disabled>
            <span style="color: #9ca3af;">Lernkurve <small>(-5% bei 2x)</small></span>
          </label>
          <label class="model-option disabled">
            <input type="radio" name="sw-cost-model" value="inflation" disabled>
            <span style="color: #9ca3af;">Inflation <small>(+3% p.a.)</small></span>
          </label>
          <label class="model-option disabled">
            <input type="radio" name="sw-cost-model" value="manuell" disabled>
            <span style="color: #9ca3af;">Manuell</span>
          </label>
        </div>
      </div>
    </div>
  `;
}

function renderSaaSContent(data) {
  return `
    <!-- SaaS Mode -->
    <div class="section-compact">
      <h3 class="section-title-compact">📊 Startwerte (Jahr 1)</h3>
      <div class="input-row-compact">
        <div class="input-group-compact">
          <label>Start Customers</label>
          <input type="number" id="saas-customers" value="${data.saas_customers_start}" class="input-compact" placeholder="1000">
        </div>
        <div class="input-group-compact">
          <label>ARR per Customer (€)</label>
          <input type="number" id="saas-arr" value="${data.saas_arr}" class="input-compact" placeholder="600">
        </div>
        <div class="input-group-compact">
          <label>Cost per Customer (€)</label>
          <input type="number" id="saas-cost" value="${data.saas_cost}" class="input-compact" placeholder="108">
        </div>
      </div>
      
      <div class="input-row-compact" style="margin-top: 10px;">
        <div class="input-group-compact">
          <label>New Customers p.a.</label>
          <input type="number" id="saas-new" value="${data.saas_new_customers}" class="input-compact" placeholder="800">
        </div>
        <div class="input-group-compact">
          <label>Churn Rate (% p.a.)</label>
          <input type="number" id="saas-churn" value="${data.saas_churn_rate}" class="input-compact" placeholder="15" step="0.1">
        </div>
        <div class="input-group-compact">
          <label>Expansion Rate (% p.a.)</label>
          <input type="number" id="saas-expansion" value="${data.saas_expansion_rate}" class="input-compact" placeholder="5" step="0.1">
        </div>
      </div>
      
      <!-- Quick KPIs -->
      <div class="kpis-inline">
        <span class="kpi-inline">
          <strong>ARR J1:</strong> 
          <span id="kpi-arr">-</span>
        </span>
        <span class="kpi-inline">
          <strong>Customers J1:</strong> 
          <span id="kpi-customers">-</span>
        </span>
        <span class="kpi-inline">
          <strong>Marge J1:</strong> 
          <span id="kpi-margin" class="kpi-positive">-</span>
        </span>
      </div>
    </div>
    
    <!-- Entwicklungsmodelle -->
    <div class="section-compact">
      <h3 class="section-title-compact">📈 Entwicklungsmodelle</h3>
      <div class="models-compact">
        <div class="model-row">
          <label class="model-label-compact">Customer Growth</label>
          <div class="model-radios">
            <label><input type="radio" name="saas-growth-model" value="linear" ${data.saas_growth_model === 'linear' ? 'checked' : ''}> Linear</label>
            <label><input type="radio" name="saas-growth-model" value="degressiv" ${data.saas_growth_model === 'degressiv' ? 'checked' : ''}> Degressiv</label>
            <label><input type="radio" name="saas-growth-model" value="aggressiv" ${data.saas_growth_model === 'aggressiv' ? 'checked' : ''}> Aggressiv</label>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializeSoftwareData(artikel) {
  return {
    release_date: artikel.release_datum || new Date().toISOString().slice(0, 7),
    time_horizon: artikel.zeitraum || 5,
    license_mode: 'perpetual', // or 'saas'
    
    // Perpetual Mode
    licenses_year1: 100,
    license_price: 5000,
    license_cost: 500,
    maintenance_rate: 20,
    maintenance_margin: 85,
    license_model: 'konservativ',
    price_model: 'konstant',
    
    // SaaS Mode
    saas_customers_start: 1000,
    saas_arr: 600,
    saas_cost: 108,
    saas_new_customers: 800,
    saas_churn_rate: 15,
    saas_expansion_rate: 5,
    saas_growth_model: 'linear',
    
    calculated: false
  };
}

// ==========================================
// LOAD SAVED DATA
// ==========================================

async function loadSavedForecast(artikel) {
  try {
    console.log('📥 Loading saved software forecast for:', artikel.id);
    
    const savedForecast = await api.loadForecast(artikel.id, 'software', 'base');
    
    if (savedForecast && savedForecast.parameters) {
      console.log('✅ Found saved forecast, applying parameters...');
      
      // Apply saved parameters to artikel.software_model_data
      Object.assign(artikel.software_model_data, savedForecast.parameters);
      
      return true;
    } else {
      console.log('ℹ️ No saved forecast found, using defaults');
      return false;
    }
  } catch (error) {
    console.error('❌ Error loading forecast:', error);
    return false;
  }
}

// ==========================================
// AUTO-CALCULATE
// ==========================================

function autoCalculateForecast() {
  setTimeout(() => {
    window.calculateSoftwareForecast();
  }, 100);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachSoftwareEventListeners(artikel, showToggle = true) {  // ← GEÄNDERT
  // Horizon buttons
  document.querySelectorAll('.btn-horizon').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.btn-horizon').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      window.calculateSoftwareForecast();
    });
  });
  
  // ✅ Mode toggle - ONLY if multi-stream  ← NEU: if (showToggle) { ... }
  if (showToggle) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const mode = this.dataset.mode;
        
        console.log(`🔄 Switching to ${mode} mode`);
        
        // Update mode
        artikel.software_model_data.license_mode = mode;
        
        // Update UI - toggle active state
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Re-render mode content
        const modeContentContainer = document.getElementById('sw-mode-content');
        if (modeContentContainer) {
          modeContentContainer.innerHTML = renderModeContent(artikel.software_model_data);
          
          // Re-attach listeners for new inputs
          if (mode === 'perpetual') {
            attachPerpetualListeners();
          } else {
            attachSaaSListeners();
          }
          
          // Radio buttons
          document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => window.calculateSoftwareForecast());
          });
          
          // Recalculate forecast
          window.calculateSoftwareForecast();
        }
      });
    });
  }  // ← NEU: schließende Klammer für if (showToggle)
  
  // Attach input listeners based on mode
  const mode = artikel.software_model_data.license_mode;
  
  if (mode === 'perpetual') {
    attachPerpetualListeners();
  } else {
    attachSaaSListeners();
  }
  
  // Radio buttons
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => window.calculateSoftwareForecast());
  });
  
  // ✅ SAVE BUTTON EVENT LISTENER
  const saveButton = document.getElementById('btn-save-software-forecast');
  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      await saveSoftwareForecast();
    });
  }
}

function attachPerpetualListeners() {
  const inputs = ['sw-licenses', 'sw-price', 'sw-cost', 'sw-maint-rate', 'sw-maint-margin'];
  
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', updatePerpetualKPIs);
      input.addEventListener('blur', () => window.calculateSoftwareForecast());
    }
  });
  
  updatePerpetualKPIs();
}

function attachSaaSListeners() {
  const inputs = ['saas-customers', 'saas-arr', 'saas-cost', 'saas-new', 'saas-churn', 'saas-expansion'];
  
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', updateSaaSKPIs);
      input.addEventListener('blur', () => window.calculateSoftwareForecast());
    }
  });
  
  updateSaaSKPIs();
}

function updatePerpetualKPIs() {
  const licenses = parseFloat(document.getElementById('sw-licenses')?.value) || 0;
  const price = parseFloat(document.getElementById('sw-price')?.value) || 0;
  const maintRate = parseFloat(document.getElementById('sw-maint-rate')?.value) || 0;
  
  const licenseRev = licenses * price;
  const maintRev = licenseRev * (maintRate / 100);
  const totalRev = licenseRev + maintRev;
  
  document.getElementById('kpi-license-revenue').textContent = formatCurrency(licenseRev);
  document.getElementById('kpi-maint-revenue').textContent = formatCurrency(maintRev);
  document.getElementById('kpi-total-revenue').textContent = formatCurrency(totalRev);
}

function updateSaaSKPIs() {
  const customers = parseFloat(document.getElementById('saas-customers')?.value) || 0;
  const arr = parseFloat(document.getElementById('saas-arr')?.value) || 0;
  const cost = parseFloat(document.getElementById('saas-cost')?.value) || 0;
  
  const totalARR = customers * arr;
  const totalCost = customers * cost;
  const margin = totalARR > 0 ? ((totalARR - totalCost) / totalARR) * 100 : 0;
  
  document.getElementById('kpi-arr').textContent = formatCurrency(totalARR);
  document.getElementById('kpi-customers').textContent = formatNumber(customers, 0);
  document.getElementById('kpi-margin').textContent = formatNumber(margin, 1) + '%';
}

// ==========================================
// CALCULATION
// ==========================================

window.calculateSoftwareForecast = function() {
  const artikel = window._currentArtikel;
  if (!artikel) return;
  
  const mode = artikel.software_model_data.license_mode;
  
  let forecast;
  if (mode === 'perpetual') {
    forecast = calculatePerpetualForecast(artikel);
  } else {
    forecast = calculateSaaSForecast(artikel);
  }
  
  if (forecast) {
    // ✅ Add model info to forecast (for manual mode detection)
    forecast.volume_model = artikel.software_model_data.license_model;
    forecast.price_model = artikel.software_model_data.price_model;
    forecast.cost_model = 'konstant'; // Software hat nur konstante Kosten
    
    renderForecastTable(forecast, 'forecast-table-container');
    artikel.software_model_data.forecast = forecast;
  }
};

// ==========================================
// ✅ SAVE FORECAST FUNCTION
// ==========================================

async function saveSoftwareForecast() {
  const artikel = window._currentArtikel;
  if (!artikel) {
    showSaveError('Kein Artikel ausgewählt');
    return;
  }
  
  if (!artikel.software_model_data || !artikel.software_model_data.forecast) {
    showSaveError('Bitte zuerst Forecast berechnen');
    return;
  }
  
  const forecast = artikel.software_model_data.forecast;
  const data = artikel.software_model_data;
  
  const parameters = {
    release_date: data.release_date,
    time_horizon: data.time_horizon,
    license_mode: data.license_mode
  };
  
  if (data.license_mode === 'perpetual') {
    parameters.licenses_year1 = data.licenses_year1;
    parameters.license_price = data.license_price;
    parameters.license_cost = data.license_cost;
    parameters.maintenance_rate = data.maintenance_rate;
    parameters.maintenance_margin = data.maintenance_margin;
    parameters.license_model = data.license_model;
    parameters.price_model = data.price_model;
  } else {
    parameters.saas_customers_start = data.saas_customers_start;
    parameters.saas_arr = data.saas_arr;
    parameters.saas_cost = data.saas_cost;
    parameters.saas_new_customers = data.saas_new_customers;
    parameters.saas_churn_rate = data.saas_churn_rate;
    parameters.saas_expansion_rate = data.saas_expansion_rate;
    parameters.saas_growth_model = data.saas_growth_model;
  }
  
  const forecastData = {
    years: forecast.years,
    revenue: forecast.revenue,
    totalCost: forecast.totalCost,
    db2: forecast.db2,
    db2Margin: forecast.db2Margin,
    volume: forecast.volume,
    price: forecast.price,
    cost: forecast.cost
  };
  
  console.log('💾 Speichere Software Forecast:', {
    artikelId: artikel.id,
    license_mode: data.license_mode,
    parameters,
    forecastData
  });
  
  const saveButton = document.getElementById('btn-save-software-forecast');
  const originalText = saveButton.innerHTML;
  saveButton.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Speichert...</span>';
  saveButton.disabled = true;
  
  try {
    await api.saveForecast(artikel.id, 'software', forecastData, parameters);
    showSaveSuccess();
    console.log('✅ Software Forecast erfolgreich gespeichert');
  } catch (error) {
    console.error('❌ Fehler beim Speichern:', error);
    showSaveError(error.message || 'Unbekannter Fehler');
  } finally {
    saveButton.innerHTML = originalText;
    saveButton.disabled = false;
  }
}

function showSaveSuccess() {
  const successDiv = document.getElementById('save-status-software');
  const errorDiv = document.getElementById('save-error-software');
  
  if (successDiv) {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'flex';
    setTimeout(() => { successDiv.style.display = 'none'; }, 3000);
  }
}

function showSaveError(message) {
  const successDiv = document.getElementById('save-status-software');
  const errorDiv = document.getElementById('save-error-software');
  
  if (errorDiv) {
    successDiv.style.display = 'none';
    const errorText = errorDiv.querySelector('.error-text');
    if (errorText) errorText.textContent = message;
    errorDiv.style.display = 'flex';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
  }
}

function calculatePerpetualForecast(artikel) {
  const data = {
    release_date: document.getElementById('sw-date')?.value || '2025-01',
    time_horizon: parseInt(document.querySelector('.btn-horizon.active')?.dataset.years) || 5,
    licenses_year1: parseFloat(document.getElementById('sw-licenses')?.value) || 0,
    license_price: parseFloat(document.getElementById('sw-price')?.value) || 0,
    license_cost: parseFloat(document.getElementById('sw-cost')?.value) || 0,
    maintenance_rate: parseFloat(document.getElementById('sw-maint-rate')?.value) || 0,
    maintenance_margin: parseFloat(document.getElementById('sw-maint-margin')?.value) || 0,
    license_model: document.querySelector('input[name="sw-license-model"]:checked')?.value || 'konstant',
    price_model: document.querySelector('input[name="sw-price-model"]:checked')?.value || 'konstant'
  };
  
  // ✅ WICHTIG: Speichere aktuelle Werte zurück in artikel.software_model_data
  Object.assign(artikel.software_model_data, data);
  
  if (!data.licenses_year1) return null;
  
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    name: artikel.name || 'Software',
    type: 'software',
    volume_model: data.license_model,  // ✅ NEU
    price_model: data.price_model,      // ✅ NEU
    cost_model: 'konstant',             // ✅ NEU
    years: [],
    volume: [],
    price: [],
    cost: [],
    revenue: [],
    totalCost: [],
    db2: [],
    db2Margin: []
  };
  
  let installedBase = 0;
  
  for (let i = 0; i < years; i++) {
    forecast.years.push(startYear + i);
    
    // New licenses
    const newLicenses = calculateLicenses(data.licenses_year1, data.license_model, i);
    const licensePrice = calculatePrice(data.license_price, data.price_model, i);
    
    // License revenue
    const licenseRevenue = newLicenses * licensePrice;
    
    // Maintenance revenue (from installed base)
    installedBase += newLicenses;
    const maintPrice = licensePrice * (data.maintenance_rate / 100);
    const maintRevenue = installedBase * maintPrice;
    
    // Total revenue
    const totalRevenue = licenseRevenue + maintRevenue;
    
    // Costs
    const licenseCost = newLicenses * data.license_cost;
    const maintCost = maintRevenue * (1 - data.maintenance_margin / 100);
    const totalCost = licenseCost + maintCost;
    
    // DB2
    const db2 = totalRevenue - totalCost;
    const db2Margin = totalRevenue > 0 ? (db2 / totalRevenue) * 100 : 0;
    
    forecast.volume.push(newLicenses);
    forecast.price.push(licensePrice);
    forecast.cost.push(data.license_cost);
    forecast.revenue.push(totalRevenue);
    forecast.totalCost.push(totalCost);
    forecast.db2.push(db2);
    forecast.db2Margin.push(db2Margin);
  }
  
  return forecast;
}

function calculateSaaSForecast(artikel) {
  const data = {
    release_date: document.getElementById('sw-date')?.value || '2025-01',
    time_horizon: parseInt(document.querySelector('.btn-horizon.active')?.dataset.years) || 5,
    saas_customers_start: parseFloat(document.getElementById('saas-customers')?.value) || 0,
    saas_arr: parseFloat(document.getElementById('saas-arr')?.value) || 0,
    saas_cost: parseFloat(document.getElementById('saas-cost')?.value) || 0,
    saas_new_customers: parseFloat(document.getElementById('saas-new')?.value) || 0,
    saas_churn_rate: parseFloat(document.getElementById('saas-churn')?.value) || 0,
    saas_expansion_rate: parseFloat(document.getElementById('saas-expansion')?.value) || 0,
    saas_growth_model: document.querySelector('input[name="saas-growth-model"]:checked')?.value || 'linear'
  };
  
  // ✅ WICHTIG: Speichere aktuelle Werte zurück in artikel.software_model_data
  Object.assign(artikel.software_model_data, data);
  
  if (!data.saas_customers_start) return null;
  
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    name: artikel.name || 'SaaS',
    type: 'subscription',
    volume_model: 'konstant',           // ✅ NEU - SaaS hat Customer Growth Model
    price_model: 'konstant',            // ✅ NEU - ARR per Customer
    cost_model: 'konstant',             // ✅ NEU
    years: [],
    volume: [],
    price: [],
    cost: [],
    revenue: [],
    totalCost: [],
    db2: [],
    db2Margin: []
  };
  
  let totalCustomers = data.saas_customers_start;
  let currentARR = data.saas_arr;
  
  for (let i = 0; i < years; i++) {
    forecast.years.push(startYear + i);
    
    // New customers (apply growth model)
    const newCustomers = calculateNewCustomers(data.saas_new_customers, data.saas_growth_model, i);
    
    // Churn
    const churnedCustomers = totalCustomers * (data.saas_churn_rate / 100);
    
    // Net new customers
    totalCustomers = totalCustomers + newCustomers - churnedCustomers;
    
    // ARR expansion
    currentARR = currentARR * (1 + data.saas_expansion_rate / 100);
    
    // Revenue & Costs
    const revenue = totalCustomers * currentARR;
    const totalCost = totalCustomers * data.saas_cost;
    const db2 = revenue - totalCost;
    const db2Margin = revenue > 0 ? (db2 / revenue) * 100 : 0;
    
    forecast.volume.push(Math.round(totalCustomers));
    forecast.price.push(currentARR);
    forecast.cost.push(data.saas_cost);
    forecast.revenue.push(revenue);
    forecast.totalCost.push(totalCost);
    forecast.db2.push(db2);
    forecast.db2Margin.push(db2Margin);
  }
  
  return forecast;
}

function calculateLicenses(startLicenses, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return startLicenses;
    case 'konservativ':
      return startLicenses * Math.pow(1.05, yearIndex);
    case 'optimistisch':
      return startLicenses * Math.pow(1.15, yearIndex);
    default:
      return startLicenses;
  }
}

function calculatePrice(startPrice, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return startPrice;
    case 'inflation':
      return startPrice * Math.pow(1.02, yearIndex);
    case 'premium':
      return startPrice * Math.pow(1.05, yearIndex);
    default:
      return startPrice;
  }
}

function calculateNewCustomers(baseNew, model, yearIndex) {
  switch (model) {
    case 'linear':
      return baseNew;
    case 'degressiv':
      return baseNew * Math.pow(0.9, yearIndex);
    case 'aggressiv':
      return baseNew * Math.pow(1.2, yearIndex);
    default:
      return baseNew;
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

// ==========================================
// STYLES
// ==========================================

function renderCompactStyles() {
  return `
    <style>
      .software-model-compact {
        padding: 12px;
        background: #f9fafb;
      }
      
      .section-compact {
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
      
      .input-row-compact {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
      }
      
      .input-group-compact {
        display: flex;
        flex-direction: column;
      }
      
      .input-group-compact label {
        margin-bottom: 4px;
        font-size: 11px;
        font-weight: 600;
        color: #374151;
      }
      
      .input-compact {
        padding: 6px 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 13px;
      }
      
      .input-compact:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }
      
      .horizon-compact {
        display: flex;
        gap: 4px;
      }
      
      .btn-horizon {
        flex: 1;
        padding: 6px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-horizon:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .btn-horizon.active {
        border-color: #2563eb;
        background: #2563eb;
        color: white;
      }
      
      /* License Mode Toggle */
      .license-mode-toggle {
        display: flex;
        gap: 8px;
      }
      
      .mode-btn {
        flex: 1;
        padding: 10px;
        border: 2px solid #d1d5db;
        border-radius: 6px;
        background: white;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .mode-btn:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .mode-btn.active {
        border-color: #2563eb;
        background: #2563eb;
        color: white;
      }
      
      /* KPIs */
      .kpis-inline {
        display: flex;
        gap: 16px;
        padding: 8px 0;
        margin-top: 8px;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
      }
      
      .kpi-inline strong {
        color: #6b7280;
        font-weight: 600;
      }
      
      .kpi-positive {
        color: #059669;
        font-weight: 600;
      }
      
      /* Models */
      .models-compact {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .model-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .model-label-compact {
        min-width: 140px;
        font-size: 12px;
        font-weight: 600;
        color: #374151;
      }
      
      .model-radios {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      
      .model-radios label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: #1f2937;
        cursor: pointer;
        white-space: nowrap;
      }
      
      .model-radios input[type="radio"] {
        cursor: pointer;
      }
      
      @media (max-width: 768px) {
        .input-row-compact {
          grid-template-columns: 1fr;
        }
        
        .kpis-inline {
          flex-direction: column;
          gap: 6px;
        }
        
        .model-row {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .license-mode-toggle {
          flex-direction: column;
        }
      }
      
      /* ✅ SAVE SECTION STYLES */
      .save-section {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 2px solid #3b82f6;
      }
      
      .save-button-container {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      
          .btn-save-forecast-modern {
        padding: 12px 32px;
        background: #1e3a8a;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
     .btn-save-forecast-modern:hover {
        background: #1e40af;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
      
      .btn-save-forecast:active {
        transform: translateY(0);
      }
      
      .btn-save-forecast-modern:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      
      .btn-icon {
        font-size: 18px;
      }
      
      .save-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
      }
      
      .save-status.success {
        background: #d1fae5;
        color: #065f46;
      }
      
      .save-status.error {
        background: #fee2e2;
        color: #991b1b;
      }
      
      .status-icon.success {
        color: #10b981;
        font-size: 16px;
      }
      
      .save-info {
        font-size: 12px;
        color: #1e40af;
        font-style: italic;
      }

      /* Models Grid */
      .models-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 12px;
    }
    
    .model-column {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
    }
    
    .model-header {
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .model-option {
      display: block;
      padding: 8px 0;
      cursor: pointer;
      font-size: 11px;
    }
    
    .model-option input[type="radio"] {
      margin-right: 8px;
      cursor: pointer;
    }
    
    .model-option small {
      color: #6b7280;
      font-weight: normal;
    }
    
    .model-option.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .tooltip-icon {
      cursor: help;
      font-size: 12px;
      margin-left: 4px;
    }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderSoftwareModel
};
