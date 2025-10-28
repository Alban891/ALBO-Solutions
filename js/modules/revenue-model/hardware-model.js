/**
 * HARDWARE MODEL - CLEAN VERSION (Like Software Model)
 * Nur Forecast-Tabelle, keine Input-Felder sichtbar
 * 
 * @version 3.0.0 - Clean Table View
 * 
 * ✅ FEATURES:
 * - Simple table view (like Software Model)
 * - Manual save button
 * - Load existing forecasts from database
 * - Edit button (opens modal with inputs - future feature)
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
  
  console.log('📦 Rendering Hardware Model (Clean) for:', artikel.name);
  
  // Store artikel globally for access in event handlers
  window._currentArtikel = artikel;
  
  // Initialize data
  if (!artikel.hardware_model_data) {
    artikel.hardware_model_data = initializeHardwareData(artikel);
  }
  
  // ✅ Load existing forecast from database
  loadExistingForecast(artikel, container);
}

// ==========================================
// ✅ LOAD EXISTING FORECAST FROM DATABASE
// ==========================================

async function loadExistingForecast(artikel, container) {
  try {
    console.log('📥 Loading existing Hardware forecast for:', artikel.name);
    
    const existingForecast = await loadForecast(artikel.id, 'hardware', 'base');
    
    if (existingForecast && existingForecast.forecast_data) {
      console.log('✅ Found existing forecast:', existingForecast);
      
      // Render with existing data
      renderCleanView(container, artikel, existingForecast);
      
    } else {
      console.log('ℹ️ No existing forecast found - showing empty state');
      
      // Show empty state with "Create Forecast" button
      renderEmptyState(container, artikel);
    }
    
  } catch (error) {
    console.error('❌ Error loading existing forecast:', error);
    renderEmptyState(container, artikel);
  }
}

// ==========================================
// RENDER CLEAN VIEW (WITH TABLE)
// ==========================================

function renderCleanView(container, artikel, forecastData) {
  const lastSaved = forecastData.updated_at 
    ? new Date(forecastData.updated_at).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Unbekannt';
  
  container.innerHTML = `
    <div class="hardware-model-clean">
      
      <!-- Header with Save Button -->
      <div class="model-header">
        <div class="header-left">
          <h2 class="model-title">📦 Hardware Revenue Forecast</h2>
          <p class="last-saved">Zuletzt gespeichert: ${lastSaved}</p>
        </div>
        <div class="header-right">
          <button id="btn-edit-forecast" class="btn btn-secondary">
            ✏️ Bearbeiten
          </button>
          <button id="btn-save-forecast" class="btn btn-primary">
            💾 Speichern
          </button>
        </div>
      </div>
      
      <!-- Save Status Indicator -->
      <div id="save-status" class="save-status" style="display: none;">
        <span class="status-icon">✓</span>
        <span class="status-text">Gespeichert</span>
        <span class="status-time"></span>
      </div>
      
      <!-- Forecast Table Container -->
      <div id="forecast-table-container" class="forecast-table-wrapper">
        <!-- Table will be rendered here by forecast-table.js -->
      </div>
      
      <!-- Hidden: Input Data for Editing (collapsed by default) -->
      <div id="input-section" class="input-section" style="display: none;">
        ${renderInputSection(artikel.hardware_model_data, forecastData.parameters)}
      </div>
      
    </div>
    ${getCleanStyles()}
  `;
  
  // Render the actual forecast table
  if (forecastData.forecast_data) {
    renderForecastTable(forecastData.forecast_data, 'forecast-table-container');
  }
  
  // Attach event listeners
  attachEventListeners(artikel, forecastData.parameters);
}

// ==========================================
// RENDER EMPTY STATE
// ==========================================

function renderEmptyState(container, artikel) {
  container.innerHTML = `
    <div class="hardware-model-clean">
      
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>Noch kein Hardware Forecast erstellt</h3>
        <p>Erstellen Sie einen Forecast mit Startwerten und Wachstumsmodellen.</p>
        <button id="btn-create-forecast" class="btn btn-primary btn-large">
          ✨ Forecast erstellen
        </button>
      </div>
      
      <!-- Hidden: Input Data for Creating -->
      <div id="input-section" class="input-section" style="display: none;">
        ${renderInputSection(artikel.hardware_model_data, {})}
      </div>
      
    </div>
    ${getCleanStyles()}
  `;
  
  // Attach event listeners
  document.getElementById('btn-create-forecast')?.addEventListener('click', () => {
    showInputSection();
  });
}

// ==========================================
// RENDER INPUT SECTION (COLLAPSED)
// ==========================================

function renderInputSection(data, savedParams = {}) {
  // Use saved parameters if available, otherwise use data
  const params = {
    release_date: savedParams.release_date || data.release_date || '2025-10',
    time_horizon: savedParams.zeitraumJahre || data.time_horizon || 5,
    volume_year1: savedParams.startMenge || data.volume_year1 || 1000,
    price_year1: savedParams.startPreis || data.price_year1 || 50,
    cost_year1: savedParams.startHK || data.cost_year1 || 20,
    volume_model: savedParams.volume_model || data.volume_model || 'konservativ',
    price_model: savedParams.price_model || data.price_model || 'realistisch',
    cost_model: savedParams.cost_model || data.cost_model || 'realistisch'
  };
  
  return `
    <div class="input-content">
      
      <div class="input-header">
        <h3>⚙️ Forecast-Parameter bearbeiten</h3>
        <button id="btn-close-inputs" class="btn-icon">✕</button>
      </div>
      
      <!-- Zeitliche Rahmendaten -->
      <div class="section-compact">
        <h4 class="section-title-small">📅 Zeitliche Rahmendaten</h4>
        <div class="input-row-compact">
          <div class="input-group-compact">
            <label>Release / Startdatum</label>
            <input 
              type="month" 
              id="hw-date" 
              value="${params.release_date}"
              class="input-compact"
            >
          </div>
          <div class="input-group-compact">
            <label>Zeithorizont</label>
            <div class="horizon-compact">
              <button class="btn-horizon ${params.time_horizon === 3 ? 'active' : ''}" data-years="3">3J</button>
              <button class="btn-horizon ${params.time_horizon === 5 ? 'active' : ''}" data-years="5">5J</button>
              <button class="btn-horizon ${params.time_horizon === 7 ? 'active' : ''}" data-years="7">7J</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Startwerte -->
      <div class="section-compact">
        <h4 class="section-title-small">📊 Startwerte (Jahr 1)</h4>
        <div class="input-row-compact">
          <div class="input-group-compact">
            <label>Menge (Stück)</label>
            <input 
              type="number" 
              id="hw-volume" 
              value="${params.volume_year1}"
              class="input-compact"
            >
          </div>
          <div class="input-group-compact">
            <label>Preis (€/Stück)</label>
            <input 
              type="number" 
              id="hw-price" 
              value="${params.price_year1}"
              class="input-compact"
              step="0.01"
            >
          </div>
          <div class="input-group-compact">
            <label>HK (€/Stück)</label>
            <input 
              type="number" 
              id="hw-cost" 
              value="${params.cost_year1}"
              class="input-compact"
              step="0.01"
            >
          </div>
        </div>
      </div>
      
      <!-- Entwicklungsmodelle -->
      <div class="section-compact">
        <h4 class="section-title-small">📈 Entwicklungsmodelle (Zeitraum)</h4>
        <div class="models-compact">
          
          <!-- Mengenmodell -->
          <div class="model-row">
            <div class="model-label-compact">Mengenentwicklung:</div>
            <div class="model-radios">
              <label><input type="radio" name="volume-model" value="konstant" ${params.volume_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="volume-model" value="konservativ" ${params.volume_model === 'konservativ' ? 'checked' : ''}> +5%/J</label>
              <label><input type="radio" name="volume-model" value="realistisch" ${params.volume_model === 'realistisch' ? 'checked' : ''}> S-Kurve</label>
              <label><input type="radio" name="volume-model" value="optimistisch" ${params.volume_model === 'optimistisch' ? 'checked' : ''}> +15%/J</label>
            </div>
          </div>
          
          <!-- Preismodell -->
          <div class="model-row">
            <div class="model-label-compact">Preisentwicklung:</div>
            <div class="model-radios">
              <label><input type="radio" name="price-model" value="konstant" ${params.price_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="price-model" value="konservativ" ${params.price_model === 'konservativ' ? 'checked' : ''}> +2%/J</label>
              <label><input type="radio" name="price-model" value="realistisch" ${params.price_model === 'realistisch' ? 'checked' : ''}> -3%/J</label>
              <label><input type="radio" name="price-model" value="optimistisch" ${params.price_model === 'optimistisch' ? 'checked' : ''}> -1%/J</label>
            </div>
          </div>
          
          <!-- Kostenmodell -->
          <div class="model-row">
            <div class="model-label-compact">Kostenentwicklung:</div>
            <div class="model-radios">
              <label><input type="radio" name="cost-model" value="konstant" ${params.cost_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="cost-model" value="konservativ" ${params.cost_model === 'konservativ' ? 'checked' : ''}> +3%/J</label>
              <label><input type="radio" name="cost-model" value="realistisch" ${params.cost_model === 'realistisch' ? 'checked' : ''}> -5%/J</label>
              <label><input type="radio" name="cost-model" value="optimistisch" ${params.cost_model === 'optimistisch' ? 'checked' : ''}> -10%/J</label>
            </div>
          </div>
          
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="input-actions">
        <button id="btn-cancel-edit" class="btn btn-secondary">
          Abbrechen
        </button>
        <button id="btn-calculate-forecast" class="btn btn-primary">
          ✨ Forecast berechnen
        </button>
      </div>
      
    </div>
  `;
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function attachEventListeners(artikel, savedParams) {
  // Edit button - show input section
  document.getElementById('btn-edit-forecast')?.addEventListener('click', () => {
    showInputSection();
  });
  
  // Save button - save current forecast to database
  document.getElementById('btn-save-forecast')?.addEventListener('click', async () => {
    await saveCurrentForecast();
  });
  
  // Close inputs button
  document.getElementById('btn-close-inputs')?.addEventListener('click', () => {
    hideInputSection();
  });
  
  // Cancel edit button
  document.getElementById('btn-cancel-edit')?.addEventListener('click', () => {
    hideInputSection();
  });
  
  // Calculate forecast button
  document.getElementById('btn-calculate-forecast')?.addEventListener('click', () => {
    calculateAndRenderForecast();
  });
  
  // Horizon buttons
  document.querySelectorAll('.btn-horizon').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.btn-horizon').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function showInputSection() {
  const inputSection = document.getElementById('input-section');
  if (inputSection) {
    inputSection.style.display = 'block';
    inputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function hideInputSection() {
  const inputSection = document.getElementById('input-section');
  if (inputSection) {
    inputSection.style.display = 'none';
  }
}

// ==========================================
// CALCULATION & SAVE
// ==========================================

function calculateAndRenderForecast() {
  const artikel = window._currentArtikel;
  if (!artikel) return;
  
  // Collect input data
  const data = {
    release_date: document.getElementById('hw-date')?.value || '2025-10',
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
    alert('Bitte alle Startwerte ausfüllen!');
    return;
  }
  
  // Calculate forecast
  const forecast = calculateForecast(data);
  
  // Render forecast table
  renderForecastTable(forecast, 'forecast-table-container');
  
  // Update last saved indicator
  document.querySelector('.last-saved')?.textContent = 'Zuletzt gespeichert: Noch nicht gespeichert';
  
  // Hide input section
  hideInputSection();
  
  // Store in artikel for later save
  artikel.hardware_model_data = {
    ...artikel.hardware_model_data,
    ...data,
    calculated: true,
    forecast: forecast
  };
  
  console.log('✅ Forecast calculated successfully');
}

async function saveCurrentForecast() {
  const artikel = window._currentArtikel;
  if (!artikel || !artikel.hardware_model_data || !artikel.hardware_model_data.forecast) {
    alert('Kein Forecast zum Speichern vorhanden!');
    return;
  }
  
  try {
    showSaveStatus('saving');
    
    const data = artikel.hardware_model_data;
    const forecast = data.forecast;
    
    // Prepare parameters
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
    
    // Save to database
    const result = await saveForecast(
      artikel.id,
      'hardware',
      forecast,
      parameters,
      'base',
      'Manuell gespeichert'
    );
    
    if (result) {
      console.log('✅ Forecast saved successfully:', result.id);
      showSaveStatus('success');
      
      // Update last saved time
      const now = new Date().toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      document.querySelector('.last-saved').textContent = `Zuletzt gespeichert: ${now}`;
      
    } else {
      console.error('❌ Failed to save forecast');
      showSaveStatus('error');
    }
    
  } catch (error) {
    console.error('❌ Error saving forecast:', error);
    showSaveStatus('error', null, error.message);
  }
}

function showSaveStatus(status, timestamp = null, errorMsg = null) {
  const statusEl = document.getElementById('save-status');
  if (!statusEl) return;
  
  const iconEl = statusEl.querySelector('.status-icon');
  const textEl = statusEl.querySelector('.status-text');
  const timeEl = statusEl.querySelector('.status-time');
  
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
      textEl.textContent = 'Erfolgreich gespeichert!';
      timeEl.textContent = timestamp || 'gerade eben';
      setTimeout(() => statusEl.style.display = 'none', 3000);
      break;
      
    case 'error':
      statusEl.classList.add('status-error');
      iconEl.textContent = '⚠';
      textEl.textContent = 'Fehler beim Speichern';
      timeEl.textContent = errorMsg || '';
      setTimeout(() => statusEl.style.display = 'none', 5000);
      break;
  }
}

// ==========================================
// FORECAST CALCULATION
// ==========================================

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
    
    const volume = calculateVolume(data.volume_year1, data.volume_model, i);
    forecast.volume.push(volume);
    
    const price = calculatePrice(data.price_year1, data.price_model, i);
    forecast.price.push(price);
    
    const cost = calculateCost(data.cost_year1, data.cost_model, i);
    forecast.cost.push(cost);
    
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
// INITIALIZATION
// ==========================================

function initializeHardwareData(artikel) {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  
  return {
    release_date: `${currentYear}-${currentMonth}`,
    time_horizon: 5,
    volume_year1: artikel.start_menge || 1000,
    price_year1: artikel.start_preis || 50,
    cost_year1: artikel.start_hk || 20,
    volume_model: 'konservativ',
    price_model: 'realistisch',
    cost_model: 'realistisch',
    calculated: false
  };
}

// ==========================================
// STYLES
// ==========================================

function getCleanStyles() {
  return `
    <style>
      /* Hardware Model - Clean Version Styles */
      .hardware-model-clean {
        padding: 20px;
        background: white;
      }
      
      /* Header with Save Button */
      .model-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .header-left {
        flex: 1;
      }
      
      .model-title {
        margin: 0 0 4px 0;
        font-size: 20px;
        font-weight: 700;
        color: #1e3a8a;
      }
      
      .last-saved {
        margin: 0;
        font-size: 12px;
        color: #6b7280;
      }
      
      .header-right {
        display: flex;
        gap: 12px;
      }
      
      /* Buttons */
      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
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
      
      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }
      
      .btn-secondary:hover {
        background: #e5e7eb;
      }
      
      .btn-large {
        padding: 14px 28px;
        font-size: 16px;
      }
      
      .btn-icon {
        background: none;
        border: none;
        font-size: 20px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
      }
      
      .btn-icon:hover {
        color: #374151;
      }
      
      /* Save Status */
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
      
      /* Forecast Table Wrapper */
      .forecast-table-wrapper {
        margin: 20px 0;
      }
      
      /* Empty State */
      .empty-state {
        text-align: center;
        padding: 60px 20px;
      }
      
      .empty-icon {
        font-size: 64px;
        margin-bottom: 20px;
        opacity: 0.5;
      }
      
      .empty-state h3 {
        font-size: 20px;
        color: #374151;
        margin: 0 0 8px 0;
      }
      
      .empty-state p {
        font-size: 14px;
        color: #6b7280;
        margin: 0 0 24px 0;
      }
      
      /* Input Section (Collapsed) */
      .input-section {
        margin-top: 30px;
        padding: 20px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      
      .input-content {
        max-width: 900px;
        margin: 0 auto;
      }
      
      .input-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .input-header h3 {
        margin: 0;
        font-size: 18px;
        color: #1e3a8a;
      }
      
      /* Compact Sections */
      .section-compact {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 16px;
      }
      
      .section-title-small {
        font-size: 14px;
        font-weight: 700;
        color: #1e3a8a;
        margin: 0 0 12px 0;
      }
      
      .input-row-compact {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }
      
      .input-group-compact {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .input-group-compact label {
        font-size: 12px;
        font-weight: 600;
        color: #4b5563;
      }
      
      .input-compact {
        padding: 8px 10px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .input-compact:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }
      
      /* Horizon Buttons */
      .horizon-compact {
        display: flex;
        gap: 6px;
      }
      
      .btn-horizon {
        flex: 1;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        font-size: 13px;
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
      
      /* Models */
      .models-compact {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .model-row {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .model-label-compact {
        min-width: 160px;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }
      
      .model-radios {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
      
      .model-radios label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #1f2937;
        cursor: pointer;
      }
      
      .model-radios input[type="radio"] {
        cursor: pointer;
      }
      
      /* Input Actions */
      .input-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .model-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        
        .header-right {
          width: 100%;
        }
        
        .btn {
          flex: 1;
        }
        
        .input-row-compact {
          grid-template-columns: 1fr;
        }
        
        .model-row {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .model-label-compact {
          min-width: auto;
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
