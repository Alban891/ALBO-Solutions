/**
 * HARDWARE MODEL - COMPACT VERSION WITH DATABASE INTEGRATION
 * Kompaktes Design, Auto-Calculate, Always-Visible Forecast
 * 
 * @version 2.0.0 - Database Integration
 * 
 * ✅ NEUE FEATURES:
 * - Auto-save to database after calculations
 * - Load existing forecasts on open
 * - Save status indicator
 * - Error handling with user feedback
 */

import { renderForecastTable } from './forecast-table.js';
import { saveForecast, loadForecast } from '../../api.js';

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export function renderHardwareModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('📦 Rendering Hardware Model (Compact) for:', artikel.name);
  
  // Store artikel globally for access in event handlers
  window._currentArtikel = artikel;
  
  // Initialize data
  if (!artikel.hardware_model_data) {
    artikel.hardware_model_data = initializeHardwareData(artikel);
  }
  
  const data = artikel.hardware_model_data;
  
  container.innerHTML = `
    <div class="hardware-model-compact">
      
      <!-- Save Status Indicator (NEW) -->
      <div id="save-status" class="save-status" style="display: none;">
        <span class="status-icon">✓</span>
        <span class="status-text">Gespeichert</span>
        <span class="status-time"></span>
      </div>
      
      <!-- Zeitliche Rahmendaten (kompakt) -->
      <div class="section-compact">
        <h3 class="section-title-compact">📅 Zeitliche Rahmendaten</h3>
        <div class="input-row-compact">
          <div class="input-group-compact">
            <label>Release / Startdatum</label>
            <input 
              type="month" 
              id="hw-date" 
              value="${data.release_date}"
              class="input-compact"
            >
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
      
      <!-- Startwerte (kompakt) -->
      <div class="section-compact">
        <h3 class="section-title-compact">📊 Startwerte (Jahr 1)</h3>
        <div class="input-row-compact">
          <div class="input-group-compact">
            <label>Menge (Stück)</label>
            <input 
              type="number" 
              id="hw-volume" 
              value="${data.volume_year1}"
              class="input-compact"
            >
          </div>
          <div class="input-group-compact">
            <label>Preis (€/Stück)</label>
            <input 
              type="number" 
              id="hw-price" 
              value="${data.price_year1}"
              class="input-compact"
              step="0.01"
            >
          </div>
          <div class="input-group-compact">
            <label>HK (€/Stück)</label>
            <input 
              type="number" 
              id="hw-cost" 
              value="${data.cost_year1}"
              class="input-compact"
              step="0.01"
            >
          </div>
        </div>
        
        <!-- Quick KPIs (inline) -->
        <div class="kpis-inline">
          <span class="kpi-inline">
            <strong>Umsatz J1:</strong> 
            <span id="kpi-revenue">${formatCurrency(data.volume_year1 * data.price_year1)}</span>
          </span>
          <span class="kpi-inline">
            <strong>DB2 J1:</strong> 
            <span id="kpi-db2" class="kpi-positive">${formatCurrency(data.volume_year1 * (data.price_year1 - data.cost_year1))}</span>
          </span>
          <span class="kpi-inline">
            <strong>Marge J1:</strong> 
            <span id="kpi-margin" class="kpi-positive">${formatNumber((data.price_year1 - data.cost_year1) / data.price_year1 * 100, 1)}%</span>
          </span>
        </div>
      </div>
      
      <!-- Wachstumsmodelle (ultra-kompakt) -->
      <div class="section-compact">
        <h3 class="section-title-compact">📈 Entwicklungsmodelle (Zeitraum)</h3>
        <div class="models-compact">
          
          <!-- Mengenmodell -->
          <div class="model-row">
            <div class="model-label-compact">Mengenentwicklung:</div>
            <div class="model-radios">
              <label><input type="radio" name="volume-model" value="konstant" ${data.volume_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="volume-model" value="konservativ" ${data.volume_model === 'konservativ' ? 'checked' : ''}> +5%/J</label>
              <label><input type="radio" name="volume-model" value="realistisch" ${data.volume_model === 'realistisch' ? 'checked' : ''}> S-Kurve</label>
              <label><input type="radio" name="volume-model" value="optimistisch" ${data.volume_model === 'optimistisch' ? 'checked' : ''}> +15%/J</label>
            </div>
          </div>
          
          <!-- Preismodell -->
          <div class="model-row">
            <div class="model-label-compact">Preisentwicklung:</div>
            <div class="model-radios">
              <label><input type="radio" name="price-model" value="konstant" ${data.price_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="price-model" value="konservativ" ${data.price_model === 'konservativ' ? 'checked' : ''}> +2%/J</label>
              <label><input type="radio" name="price-model" value="realistisch" ${data.price_model === 'realistisch' ? 'checked' : ''}> -3%/J</label>
              <label><input type="radio" name="price-model" value="optimistisch" ${data.price_model === 'optimistisch' ? 'checked' : ''}> -1%/J</label>
            </div>
          </div>
          
          <!-- Kostenmodell -->
          <div class="model-row">
            <div class="model-label-compact">Kostenentwicklung:</div>
            <div class="model-radios">
              <label><input type="radio" name="cost-model" value="konstant" ${data.cost_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="cost-model" value="konservativ" ${data.cost_model === 'konservativ' ? 'checked' : ''}> +3%/J</label>
              <label><input type="radio" name="cost-model" value="realistisch" ${data.cost_model === 'realistisch' ? 'checked' : ''}> -5%/J</label>
              <label><input type="radio" name="cost-model" value="optimistisch" ${data.cost_model === 'optimistisch' ? 'checked' : ''}> -10%/J</label>
            </div>
          </div>
          
        </div>
      </div>
      
      <!-- Forecast Tabelle (immer sichtbar) -->
      <div class="section-compact">
        <h3 class="section-title-compact">📊 Prognose-Tabelle</h3>
        <div id="forecast-table-container"></div>
      </div>
      
    </div>
    ${getHardwareStyles()}
  `;
  
  // Attach event listeners
  attachHardwareEventListeners(artikel);
  
  // ✅ NEW: Load existing forecast from database
  loadExistingForecast(artikel);
  
  // Initial calculation
  window.calculateHardwareForecast();
}

// ==========================================
// ✅ NEW: LOAD EXISTING FORECAST FROM DATABASE
// ==========================================

/**
 * Load existing forecast from database when opening the model
 * 
 * @param {Object} artikel - Article object
 */
async function loadExistingForecast(artikel) {
  try {
    console.log('📥 Loading existing Hardware forecast for:', artikel.name);
    
    const existingForecast = await loadForecast(artikel.id, 'hardware', 'base');
    
    if (existingForecast) {
      console.log('✅ Found existing forecast:', existingForecast);
      
      // Populate inputs with saved parameters
      if (existingForecast.parameters) {
        const params = existingForecast.parameters;
        
        // Set inputs if they exist
        if (params.startMenge && document.getElementById('hw-volume')) {
          document.getElementById('hw-volume').value = params.startMenge;
        }
        if (params.startPreis && document.getElementById('hw-price')) {
          document.getElementById('hw-price').value = params.startPreis;
        }
        if (params.startHK && document.getElementById('hw-cost')) {
          document.getElementById('hw-cost').value = params.startHK;
        }
        
        // Set models if they exist
        if (params.volume_model) {
          const volumeRadio = document.querySelector(`input[name="volume-model"][value="${params.volume_model}"]`);
          if (volumeRadio) volumeRadio.checked = true;
        }
        if (params.price_model) {
          const priceRadio = document.querySelector(`input[name="price-model"][value="${params.price_model}"]`);
          if (priceRadio) priceRadio.checked = true;
        }
        if (params.cost_model) {
          const costRadio = document.querySelector(`input[name="cost-model"][value="${params.cost_model}"]`);
          if (costRadio) costRadio.checked = true;
        }
        
        // Set time horizon
        if (params.zeitraumJahre) {
          const horizonBtn = document.querySelector(`.btn-horizon[data-years="${params.zeitraumJahre}"]`);
          if (horizonBtn) {
            document.querySelectorAll('.btn-horizon').forEach(b => b.classList.remove('active'));
            horizonBtn.classList.add('active');
          }
        }
        
        // Show last saved timestamp
        if (existingForecast.updated_at) {
          showSaveStatus('success', existingForecast.updated_at);
        }
      }
      
      // Render existing forecast table
      if (existingForecast.forecast_data) {
        renderForecastTable(existingForecast.forecast_data, 'forecast-table-container');
      }
      
    } else {
      console.log('ℹ️ No existing forecast found - starting fresh');
    }
    
  } catch (error) {
    console.error('❌ Error loading existing forecast:', error);
    // Don't show error to user - just start fresh
  }
}

// ==========================================
// ✅ NEW: SAVE FORECAST TO DATABASE
// ==========================================

/**
 * Save forecast to database
 * 
 * @param {Object} forecast - Calculated forecast data
 * @param {Object} parameters - Input parameters
 * @returns {Promise<boolean>} Success status
 */
async function saveForecastToDatabase(forecast, parameters) {
  const artikel = window._currentArtikel;
  if (!artikel) {
    console.error('❌ No artikel available');
    return false;
  }
  
  try {
    console.log('💾 Saving Hardware forecast to database...');
    
    // Show saving status
    showSaveStatus('saving');
    
    // Save to database
    const result = await saveForecast(
      artikel.id,
      'hardware',
      forecast,
      parameters,
      'base', // scenario
      'Auto-saved from Hardware Model' // notes
    );
    
    if (result) {
      console.log('✅ Forecast saved successfully:', result.id);
      showSaveStatus('success');
      return true;
    } else {
      console.error('❌ Failed to save forecast');
      showSaveStatus('error');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error saving forecast:', error);
    showSaveStatus('error', null, error.message);
    return false;
  }
}

/**
 * Show save status indicator
 * 
 * @param {string} status - 'saving', 'success', 'error'
 * @param {string} timestamp - ISO timestamp (optional)
 * @param {string} errorMsg - Error message (optional)
 */
function showSaveStatus(status, timestamp = null, errorMsg = null) {
  const statusEl = document.getElementById('save-status');
  if (!statusEl) return;
  
  const iconEl = statusEl.querySelector('.status-icon');
  const textEl = statusEl.querySelector('.status-text');
  const timeEl = statusEl.querySelector('.status-time');
  
  // Reset classes
  statusEl.className = 'save-status';
  statusEl.style.display = 'flex';
  
  switch (status) {
    case 'saving':
      statusEl.classList.add('status-saving');
      iconEl.textContent = '⏳';
      textEl.textContent = 'Speichert...';
      timeEl.textContent = '';
      break;
      
    case 'success':
      statusEl.classList.add('status-success');
      iconEl.textContent = '✓';
      textEl.textContent = 'Gespeichert';
      
      if (timestamp) {
        const date = new Date(timestamp);
        const timeStr = date.toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        timeEl.textContent = timeStr;
      } else {
        timeEl.textContent = 'gerade eben';
      }
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);
      break;
      
    case 'error':
      statusEl.classList.add('status-error');
      iconEl.textContent = '⚠';
      textEl.textContent = 'Fehler beim Speichern';
      timeEl.textContent = errorMsg || '';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
      break;
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializeHardwareData(artikel) {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  
  return {
    release_date: `${currentYear}-${currentMonth}`,
    time_horizon: 5,
    volume_year1: artikel.start_menge || 100,
    price_year1: artikel.start_preis || 500,
    cost_year1: artikel.start_hk || 170,
    volume_model: 'konservativ',
    price_model: 'realistisch',
    cost_model: 'realistisch',
    calculated: false
  };
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachHardwareEventListeners(artikel) {
  // Horizon buttons
  document.querySelectorAll('.btn-horizon').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.btn-horizon').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      // Auto-recalculate
      window.calculateHardwareForecast();
    });
  });
  
  // Real-time KPI updates
  const volumeInput = document.getElementById('hw-volume');
  const priceInput = document.getElementById('hw-price');
  const costInput = document.getElementById('hw-cost');
  
  const updateKPIs = () => {
    const volume = parseFloat(volumeInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const cost = parseFloat(costInput.value) || 0;
    
    const revenue = volume * price;
    const db2 = volume * (price - cost);
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
    
    document.getElementById('kpi-revenue').textContent = formatCurrency(revenue);
    document.getElementById('kpi-db2').textContent = formatCurrency(db2);
    document.getElementById('kpi-margin').textContent = formatNumber(margin, 1) + '%';
  };
  
  volumeInput.addEventListener('input', updateKPIs);
  priceInput.addEventListener('input', updateKPIs);
  costInput.addEventListener('input', updateKPIs);
  
  // Auto-recalculate on blur (when user finishes editing)
  volumeInput.addEventListener('blur', () => window.calculateHardwareForecast());
  priceInput.addEventListener('blur', () => window.calculateHardwareForecast());
  costInput.addEventListener('blur', () => window.calculateHardwareForecast());
  
  // Radio buttons - auto-recalculate
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      window.calculateHardwareForecast();
    });
  });
}

// ==========================================
// CALCULATION (ENHANCED WITH DATABASE SAVE)
// ==========================================

window.calculateHardwareForecast = async function() {
  const artikel = window._currentArtikel;
  if (!artikel) return;
  
  // Collect input data
  const data = {
    release_date: document.getElementById('hw-date')?.value || '2025-01',
    time_horizon: parseInt(document.querySelector('.btn-horizon.active')?.dataset.years) || 5,
    
    volume_year1: parseFloat(document.getElementById('hw-volume')?.value) || 0,
    price_year1: parseFloat(document.getElementById('hw-price')?.value) || 0,
    cost_year1: parseFloat(document.getElementById('hw-cost')?.value) || 0,
    
    volume_model: document.querySelector('input[name="volume-model"]:checked')?.value || 'konstant',
    price_model: document.querySelector('input[name="price-model"]:checked')?.value || 'konstant',
    cost_model: document.querySelector('input[name="cost-model"]:checked')?.value || 'konstant'
  };
  
  // Validate
  if (!data.volume_year1 || !data.price_year1 || !data.cost_year1) {
    console.log('⚠️ Waiting for complete input...');
    return;
  }
  
  // Calculate forecast
  const forecast = calculateForecast(data);
  
  // Render forecast table
  renderForecastTable(forecast, 'forecast-table-container');
  
  // Save to artikel (local)
  artikel.hardware_model_data = {
    ...artikel.hardware_model_data,
    ...data,
    calculated: true,
    forecast: forecast
  };
  
  // ✅ NEW: Prepare parameters for database
  const parameters = {
    startMenge: data.volume_year1,
    startPreis: data.price_year1,
    startHK: data.cost_year1,
    mengenWachstum: data.volume_model,
    preisWachstum: data.price_model,
    hkWachstum: data.cost_model,
    zeitraumJahre: data.time_horizon,
    startJahr: parseInt(data.release_date.split('-')[0]),
    release_date: data.release_date,
    volume_model: data.volume_model,
    price_model: data.price_model,
    cost_model: data.cost_model
  };
  
  // ✅ NEW: Save to database (async - non-blocking)
  saveForecastToDatabase(forecast, parameters);
};

function calculateForecast(data) {
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    name: window._currentArtikel?.name || 'Hardware',
    type: 'hardware',
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
    
    // Calculate volume
    const volume = calculateVolume(data.volume_year1, data.volume_model, i);
    forecast.volume.push(volume);
    
    // Calculate price
    const price = calculatePrice(data.price_year1, data.price_model, i);
    forecast.price.push(price);
    
    // Calculate cost
    const cost = calculateCost(data.cost_year1, data.cost_model, i);
    forecast.cost.push(cost);
    
    // Calculate outputs
    const revenue = volume * price;
    const totalCost = volume * cost;
    const db2 = revenue - totalCost;
    const db2Margin = revenue > 0 ? (db2 / revenue) * 100 : 0;
    
    forecast.revenue.push(revenue);
    forecast.totalCost.push(totalCost);
    forecast.db2.push(db2);
    forecast.db2Margin.push(db2Margin);
  }
  
  return forecast;
}

function calculateVolume(startVolume, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return startVolume;
    case 'konservativ':
      return startVolume * Math.pow(1.05, yearIndex);
    case 'realistisch':
      const t = yearIndex / 5;
      const multiplier = 1 / (1 + Math.exp(-10 * (t - 0.5)));
      return startVolume * (1 + multiplier * 0.5);
    case 'optimistisch':
      return startVolume * Math.pow(1.15, yearIndex);
    default:
      return startVolume;
  }
}

function calculatePrice(startPrice, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return startPrice;
    case 'konservativ':
      return startPrice * Math.pow(1.02, yearIndex);
    case 'realistisch':
      return startPrice * Math.pow(0.97, yearIndex);
    case 'optimistisch':
      return startPrice * Math.pow(0.99, yearIndex);
    default:
      return startPrice;
  }
}

function calculateCost(startCost, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return startCost;
    case 'konservativ':
      return startCost * Math.pow(1.03, yearIndex);
    case 'realistisch':
      return startCost * Math.pow(0.95, yearIndex);
    case 'optimistisch':
      return startCost * Math.pow(0.90, yearIndex);
    default:
      return startCost;
  }
}

// ==========================================
// FORMATTING
// ==========================================

function formatCurrency(value) {
  if (!value && value !== 0) return '€0';
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value, decimals = 0) {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// ==========================================
// STYLES (ENHANCED WITH SAVE STATUS)
// ==========================================

function getHardwareStyles() {
  return `
    <style>
      /* Hardware Model Compact Styles */
      .hardware-model-compact {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        background: white;
      }
      
      /* ✅ NEW: Save Status Styles */
      .save-status {
        position: fixed;
        top: 80px;
        right: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 13px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .save-status.status-saving {
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #fbbf24;
      }
      
      .save-status.status-success {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #10b981;
      }
      
      .save-status.status-error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #ef4444;
      }
      
      .status-icon {
        font-size: 16px;
      }
      
      .status-time {
        font-size: 11px;
        opacity: 0.7;
        margin-left: 4px;
      }
      
      /* Section Compact */
      .section-compact {
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 12px;
        background: #fafafa;
      }
      
      .section-title-compact {
        font-size: 13px;
        font-weight: 700;
        color: #1e3a8a;
        margin: 0 0 10px 0;
      }
      
      .input-row-compact {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
      }
      
      .input-group-compact {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .input-group-compact label {
        font-size: 11px;
        font-weight: 600;
        color: #4b5563;
        text-transform: uppercase;
        letter-spacing: 0.3px;
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
      
      /* Horizon Buttons (compact) */
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
      }
      
      .kpi-inline strong {
        color: #6b7280;
        font-weight: 600;
      }
      
      .kpi-positive {
        color: #059669;
        font-weight: 600;
      }
      
      /* Models (ultra-compact) */
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
      
      /* Responsive */
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
        
        .save-status {
          top: 60px;
          right: 10px;
          font-size: 12px;
          padding: 10px 12px;
        }
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderHardwareModel
};
