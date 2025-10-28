/**
 * SERVICE MODEL - COMPACT VERSION
 * FTE-basierte Berechnung
 * Kompaktes Design, Auto-Calculate, Always-Visible Forecast
 */

import { renderForecastTable } from './forecast-table.js';
import * as api from '../../api.js';

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export async function renderServiceModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('👔 Rendering Service Model (Compact) for:', artikel.name);
  
  // Initialize data
  if (!artikel.service_model_data) {
    artikel.service_model_data = initializeServiceData(artikel);
  }
  
  const data = artikel.service_model_data;
  // ✅ LOAD SAVED DATA FROM DATABASE
  await loadSavedForecast(artikel);
  
  container.innerHTML = `
    <div class="service-model-compact">
      
      <!-- Zeitliche Rahmendaten -->
      <div class="section-compact">
        <h3 class="section-title-compact">📅 Zeitliche Rahmendaten</h3>
        <div class="input-row-compact">
          <div class="input-group-compact">
            <label>Release / Startdatum</label>
            <input type="month" id="svc-date" value="${data.release_date}" class="input-compact">
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
      
      <!-- FTE & Utilization -->
      <div class="section-compact">
        <h3 class="section-title-compact">👥 Startwerte (Jahr 1)</h3>
        <div class="input-row-compact">
          <div class="input-group-compact">
            <label>FTE (Full-Time Equivalents)</label>
            <input type="number" id="svc-fte" value="${data.fte_year1}" class="input-compact" placeholder="10" step="0.5">
          </div>
          <div class="input-group-compact">
            <label>Utilization Rate (%)</label>
            <input type="number" id="svc-utilization" value="${data.utilization_rate}" class="input-compact" placeholder="75" max="100" step="0.1">
          </div>
          <div class="input-group-compact">
            <label>Working Days (p.a.)</label>
            <input type="number" id="svc-workdays" value="${data.working_days}" class="input-compact" placeholder="220">
          </div>
        </div>
      </div>
      
      <!-- Pricing & Costs -->
      <div class="section-compact">
        <h3 class="section-title-compact">💰 Pricing & Kosten</h3>
        <div class="input-row-compact">
          <div class="input-group-compact">
            <label>Tagessatz (€/Tag)</label>
            <input type="number" id="svc-day-rate" value="${data.day_rate}" class="input-compact" placeholder="1500">
          </div>
          <div class="input-group-compact">
            <label>Personnel Cost per FTE (€ p.a.)</label>
            <input type="number" id="svc-fte-cost" value="${data.fte_cost}" class="input-compact" placeholder="80000">
          </div>
          <div class="input-group-compact">
            <label>Overhead Rate (%)</label>
            <input type="number" id="svc-overhead" value="${data.overhead_rate}" class="input-compact" placeholder="25" max="100">
          </div>
        </div>
        
        <!-- Quick KPIs -->
        <div class="kpis-inline">
          <span class="kpi-inline">
            <strong>Rev per FTE:</strong> 
            <span id="kpi-rev-per-fte">-</span>
          </span>
          <span class="kpi-inline">
            <strong>Total Rev J1:</strong> 
            <span id="kpi-total-revenue">-</span>
          </span>
          <span class="kpi-inline">
            <strong>DB2 J1:</strong> 
            <span id="kpi-db2" class="kpi-positive">-</span>
          </span>
          <span class="kpi-inline">
            <strong>Marge:</strong> 
            <span id="kpi-margin">-</span>
          </span>
        </div>
      </div>
      
      <!-- Entwicklungsmodelle -->
      <div class="section-compact">
        <h3 class="section-title-compact">📈 Entwicklungsmodelle</h3>
        
        <div class="models-compact">
          <!-- FTE Entwicklung -->
          <div class="model-row">
            <label class="model-label-compact">FTE-Entwicklung</label>
            <div class="model-radios">
              <label><input type="radio" name="svc-fte-model" value="konstant" ${data.fte_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="svc-fte-model" value="moderat" ${data.fte_model === 'moderat' ? 'checked' : ''}> Moderat (+10%)</label>
              <label><input type="radio" name="svc-fte-model" value="wachstum" ${data.fte_model === 'wachstum' ? 'checked' : ''}> Wachstum (+20%)</label>
              <label><input type="radio" name="svc-fte-model" value="aggressiv" ${data.fte_model === 'aggressiv' ? 'checked' : ''}> Aggressiv (+30%)</label>
            </div>
          </div>
          
          <!-- Rate Entwicklung -->
          <div class="model-row">
            <label class="model-label-compact">Tagessatz-Entwicklung</label>
            <div class="model-radios">
              <label><input type="radio" name="svc-rate-model" value="konstant" ${data.rate_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="svc-rate-model" value="inflation" ${data.rate_model === 'inflation' ? 'checked' : ''}> Inflation (+2%)</label>
              <label><input type="radio" name="svc-rate-model" value="premium" ${data.rate_model === 'premium' ? 'checked' : ''}> Premium (+5%)</label>
            </div>
          </div>
          
          <!-- Utilization Entwicklung -->
          <div class="model-row">
            <label class="model-label-compact">Utilization-Entwicklung</label>
            <div class="model-radios">
              <label><input type="radio" name="svc-util-model" value="konstant" ${data.utilization_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="svc-util-model" value="steigend" ${data.utilization_model === 'steigend' ? 'checked' : ''}> Steigend</label>
              <label><input type="radio" name="svc-util-model" value="optimierung" ${data.utilization_model === 'optimierung' ? 'checked' : ''}> Optimierung</label>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    <!-- ✅ SPEICHERN-BUTTON SECTION -->
      <div class="section-compact save-section">
        <div class="save-button-container">
          <button id="btn-save-service-forecast" class="btn-save-forecast-modern">
            💾 Speichern
          </button>
          <div id="save-status-service" class="save-status" style="display: none;">
            <span class="status-icon success">✓</span>
            <span class="status-text">Erfolgreich gespeichert</span>
          </div>
          <div id="save-error-service" class="save-status error" style="display: none;">
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
  attachServiceEventListeners(artikel);
  
  // Store artikel reference
  window._currentArtikel = artikel;
  
  // AUTO-CALCULATE
  autoCalculateForecast();
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializeServiceData(artikel) {
  return {
    release_date: artikel.release_datum || new Date().toISOString().slice(0, 7),
    time_horizon: artikel.zeitraum || 5,
    
    fte_year1: 10,
    utilization_rate: 75,
    working_days: 220,
    day_rate: 1500,
    fte_cost: 80000,
    overhead_rate: 25,
    
    fte_model: 'moderat',
    rate_model: 'inflation',
    utilization_model: 'konstant',
    
    calculated: false
  };
}
// ==========================================
// LOAD SAVED DATA
// ==========================================

async function loadSavedForecast(artikel) {
  try {
    console.log('📥 Loading saved service forecast for:', artikel.id);
    
    const savedForecast = await api.loadForecast(artikel.id, 'service', 'base');
    
    if (savedForecast && savedForecast.parameters) {
      console.log('✅ Found saved forecast, applying parameters...');
      
      // Apply saved parameters to artikel.service_model_data
      Object.assign(artikel.service_model_data, savedForecast.parameters);
      
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
// ✅ SAVE FORECAST FUNCTION
// ==========================================

async function saveServiceForecast() {
  const artikel = window._currentArtikel;
  if (!artikel) {
    showSaveError('Kein Artikel ausgewählt');
    return;
  }
  
  if (!artikel.service_model_data || !artikel.service_model_data.forecast) {
    showSaveError('Bitte zuerst Forecast berechnen');
    return;
  }
  
  const forecast = artikel.service_model_data.forecast;
  const data = artikel.service_model_data;
  
  const parameters = {
    release_date: data.release_date,
    time_horizon: data.time_horizon,
    fte_year1: data.fte_year1,
    utilization_rate: data.utilization_rate,
    working_days: data.working_days,
    day_rate: data.day_rate,
    fte_cost: data.fte_cost,
    overhead_rate: data.overhead_rate,
    fte_model: data.fte_model,
    rate_model: data.rate_model,
    utilization_model: data.utilization_model
  };
  
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
  
  console.log('💾 Speichere Service Forecast:', {
    artikelId: artikel.id,
    parameters,
    forecastData
  });
  
  const saveButton = document.getElementById('btn-save-service-forecast');
  const originalText = saveButton.innerHTML;
  saveButton.innerHTML = '⏳ Speichert...';
  saveButton.disabled = true;
  
  try {
    await api.saveForecast(artikel.id, 'service', forecastData, parameters);
    showSaveSuccess();
    console.log('✅ Service Forecast erfolgreich gespeichert');
  } catch (error) {
    console.error('❌ Fehler beim Speichern:', error);
    showSaveError(error.message || 'Unbekannter Fehler');
  } finally {
    saveButton.innerHTML = originalText;
    saveButton.disabled = false;
  }
}

function showSaveSuccess() {
  const successDiv = document.getElementById('save-status-service');
  const errorDiv = document.getElementById('save-error-service');
  
  if (successDiv) {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'flex';
    setTimeout(() => { successDiv.style.display = 'none'; }, 3000);
  }
}

function showSaveError(message) {
  const successDiv = document.getElementById('save-status-service');
  const errorDiv = document.getElementById('save-error-service');
  
  if (errorDiv) {
    successDiv.style.display = 'none';
    const errorText = errorDiv.querySelector('.error-text');
    if (errorText) errorText.textContent = message;
    errorDiv.style.display = 'flex';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
  }
}

// ==========================================
// AUTO-CALCULATE
// ==========================================

function autoCalculateForecast() {
  setTimeout(() => {
    window.calculateServiceForecast();
  }, 100);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachServiceEventListeners(artikel) {
  // Horizon buttons
  document.querySelectorAll('.btn-horizon').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.btn-horizon').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      window.calculateServiceForecast();
    });
  });
  
  // Real-time KPI updates
  const inputs = [
    'svc-fte', 'svc-utilization', 'svc-workdays',
    'svc-day-rate', 'svc-fte-cost', 'svc-overhead'
  ];
  
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', updateKPIs);
      input.addEventListener('blur', () => window.calculateServiceForecast());
    }
  });
  
  // Radio buttons - auto-recalculate
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => window.calculateServiceForecast());
  });
  
 // Initial KPI update
  updateKPIs();
  
  // ✅ SAVE BUTTON EVENT LISTENER
  const saveButton = document.getElementById('btn-save-service-forecast');
  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      await saveServiceForecast();
    });
  }
}

function updateKPIs() {
  const fte = parseFloat(document.getElementById('svc-fte')?.value) || 0;
  const utilization = parseFloat(document.getElementById('svc-utilization')?.value) || 0;
  const workdays = parseFloat(document.getElementById('svc-workdays')?.value) || 0;
  const dayRate = parseFloat(document.getElementById('svc-day-rate')?.value) || 0;
  const fteCost = parseFloat(document.getElementById('svc-fte-cost')?.value) || 0;
  const overheadRate = parseFloat(document.getElementById('svc-overhead')?.value) || 0;
  
  // Revenue calculation
  const billableDays = workdays * (utilization / 100);
  const revPerFTE = billableDays * dayRate;
  const totalRevenue = fte * revPerFTE;
  
  // Cost calculation
  const personnelCost = fte * fteCost;
  const overheadCost = personnelCost * (overheadRate / 100);
  const totalCost = personnelCost + overheadCost;
  
  // DB2
  const db2 = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (db2 / totalRevenue) * 100 : 0;
  
  document.getElementById('kpi-rev-per-fte').textContent = formatCurrency(revPerFTE);
  document.getElementById('kpi-total-revenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('kpi-db2').textContent = formatCurrency(db2);
  document.getElementById('kpi-margin').textContent = formatNumber(margin, 1) + '%';
}

// ==========================================
// CALCULATION
// ==========================================

window.calculateServiceForecast = function() {
  const artikel = window._currentArtikel;
  if (!artikel) return;
  
  // Collect input data
  const data = {
    release_date: document.getElementById('svc-date')?.value || '2025-01',
    time_horizon: parseInt(document.querySelector('.btn-horizon.active')?.dataset.years) || 5,
    
    fte_year1: parseFloat(document.getElementById('svc-fte')?.value) || 0,
    utilization_rate: parseFloat(document.getElementById('svc-utilization')?.value) || 0,
    working_days: parseFloat(document.getElementById('svc-workdays')?.value) || 0,
    day_rate: parseFloat(document.getElementById('svc-day-rate')?.value) || 0,
    fte_cost: parseFloat(document.getElementById('svc-fte-cost')?.value) || 0,
    overhead_rate: parseFloat(document.getElementById('svc-overhead')?.value) || 0,
    
    fte_model: document.querySelector('input[name="svc-fte-model"]:checked')?.value || 'konstant',
    rate_model: document.querySelector('input[name="svc-rate-model"]:checked')?.value || 'konstant',
    utilization_model: document.querySelector('input[name="svc-util-model"]:checked')?.value || 'konstant'
  };
  
 // Validate
  if (!data.fte_year1) {
    console.log('⚠️ Waiting for complete input...');
    return;
  }
  
  // ✅ WICHTIG: Speichere aktuelle Werte zurück in artikel.service_model_data
  Object.assign(artikel.service_model_data, data);
  
  // Calculate forecast
  const forecast = calculateForecast(data);
  
  // Render forecast table
  renderForecastTable(forecast, 'forecast-table-container');
  
  // Save to artikel
  artikel.service_model_data = {
    ...artikel.service_model_data,
    ...data,
    calculated: true,
    forecast: forecast
  };
};

function calculateForecast(data) {
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    name: window._currentArtikel?.name || 'Services',
    type: 'services',
    years: [],
    volume: [],
    price: [],
    cost: [],
    revenue: [],
    totalCost: [],
    db2: [],
    db2Margin: []
  };
  
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    forecast.years.push(year);
    
    // Calculate FTE
    const fte = calculateFTE(data.fte_year1, data.fte_model, i);
    
    // Calculate Utilization
    const utilization = calculateUtilization(data.utilization_rate, data.utilization_model, i);
    
    // Calculate Day Rate
    const dayRate = calculateDayRate(data.day_rate, data.rate_model, i);
    
    // Revenue calculation
    const billableDays = data.working_days * (utilization / 100);
    const revPerFTE = billableDays * dayRate;
    const revenue = fte * revPerFTE;
    
    // Cost calculation
    const personnelCost = fte * data.fte_cost;
    const overheadCost = personnelCost * (data.overhead_rate / 100);
    const totalCost = personnelCost + overheadCost;
    const costPerFTE = totalCost / fte;
    
    // DB2
    const db2 = revenue - totalCost;
    const db2Margin = revenue > 0 ? (db2 / revenue) * 100 : 0;
    
    forecast.volume.push(fte);
    forecast.price.push(revPerFTE);
    forecast.cost.push(costPerFTE);
    forecast.revenue.push(revenue);
    forecast.totalCost.push(totalCost);
    forecast.db2.push(db2);
    forecast.db2Margin.push(db2Margin);
  }
  
  return forecast;
}

function calculateFTE(startFTE, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return startFTE;
    case 'moderat':
      return startFTE * Math.pow(1.10, yearIndex);
    case 'wachstum':
      return startFTE * Math.pow(1.20, yearIndex);
    case 'aggressiv':
      return startFTE * Math.pow(1.30, yearIndex);
    default:
      return startFTE;
  }
}

function calculateDayRate(startRate, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return startRate;
    case 'inflation':
      return startRate * Math.pow(1.02, yearIndex);
    case 'premium':
      return startRate * Math.pow(1.05, yearIndex);
    default:
      return startRate;
  }
}

function calculateUtilization(startUtil, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return startUtil;
    case 'steigend':
      // Max 90%
      const newUtil = startUtil + (yearIndex * 2);
      return Math.min(newUtil, 90);
    case 'optimierung':
      // Reach 85% by year 3
      const target = 85;
      const increase = (target - startUtil) / 3;
      return Math.min(startUtil + (increase * yearIndex), target);
    default:
      return startUtil;
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
      .service-model-compact {
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
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
      
      /* Inline KPIs */
      .kpis-inline {
        display: flex;
        gap: 16px;
        padding: 8px 0;
        margin-top: 8px;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        flex-wrap: wrap;
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
        min-width: 160px;
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
        
        .model-label-compact {
          min-width: auto;
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
      
      .btn-save-forecast-modern:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
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
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderServiceModel
};
