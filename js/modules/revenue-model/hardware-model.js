/**
 * HARDWARE MODEL - UPDATED WITH FORECAST TABLE
 * Standard Hardware Revenue Model mit integrierter Forecast-Tabelle
 */

import { renderForecastTable } from './forecast-table.js';

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export function renderHardwareModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('📦 Rendering Hardware Model for:', artikel.name);
  
  // Initialize data
  if (!artikel.hardware_model_data) {
    artikel.hardware_model_data = initializeHardwareData(artikel);
  }
  
  const data = artikel.hardware_model_data;
  
  container.innerHTML = `
    <div class="hardware-model-container">
      
      <!-- Zeitliche Rahmendaten -->
      <div class="section-card">
        <h3 class="section-title">📅 Zeitliche Rahmendaten</h3>
        <div class="input-row">
          <div class="input-group">
            <label class="input-label">Release / Startdatum</label>
            <input 
              type="month" 
              id="hw-date" 
              value="${data.release_date}"
              class="form-input"
            >
          </div>
          <div class="input-group">
            <label class="input-label">Zeithorizont</label>
            <div class="horizon-buttons">
              <button class="horizon-btn ${data.time_horizon === 3 ? 'active' : ''}" data-years="3">3 Jahre</button>
              <button class="horizon-btn ${data.time_horizon === 5 ? 'active' : ''}" data-years="5">5 Jahre</button>
              <button class="horizon-btn ${data.time_horizon === 7 ? 'active' : ''}" data-years="7">7 Jahre</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Startwerte (Jahr 1) -->
      <div class="section-card">
        <h3 class="section-title">📊 Startwerte (Jahr 1)</h3>
        <div class="input-row">
          <div class="input-group">
            <label class="input-label">Menge (Stück)</label>
            <input 
              type="number" 
              id="hw-volume" 
              value="${data.volume_year1}"
              class="form-input"
              placeholder="1000"
            >
          </div>
          <div class="input-group">
            <label class="input-label">Preis (€/Stück)</label>
            <input 
              type="number" 
              id="hw-price" 
              value="${data.price_year1}"
              class="form-input"
              placeholder="50"
              step="0.01"
            >
          </div>
          <div class="input-group">
            <label class="input-label">HK (€/Stück)</label>
            <input 
              type="number" 
              id="hw-cost" 
              value="${data.cost_year1}"
              class="form-input"
              placeholder="20"
              step="0.01"
            >
          </div>
        </div>
        
        <!-- Quick KPIs -->
        <div class="quick-kpis">
          <div class="kpi-item">
            <span class="kpi-label">Umsatz J1</span>
            <span class="kpi-value" id="kpi-revenue">${formatCurrency(data.volume_year1 * data.price_year1)}</span>
          </div>
          <div class="kpi-item">
            <span class="kpi-label">DB2 J1</span>
            <span class="kpi-value kpi-positive" id="kpi-db2">${formatCurrency(data.volume_year1 * (data.price_year1 - data.cost_year1))}</span>
          </div>
          <div class="kpi-item">
            <span class="kpi-label">Marge</span>
            <span class="kpi-value" id="kpi-margin">${formatNumber(((data.price_year1 - data.cost_year1) / data.price_year1) * 100, 1)}%</span>
          </div>
        </div>
      </div>
      
      <!-- Entwicklungsmodelle -->
      <div class="section-card">
        <h3 class="section-title">📈 Entwicklungsmodelle</h3>
        
        <div class="development-models">
          <!-- Mengenentwicklung -->
          <div class="model-group">
            <label class="model-label">Mengenentwicklung</label>
            <div class="model-options">
              <label class="model-option">
                <input type="radio" name="volume-model" value="konstant" ${data.volume_model === 'konstant' ? 'checked' : ''}>
                <span>Konstant (0%)</span>
              </label>
              <label class="model-option">
                <input type="radio" name="volume-model" value="konservativ" ${data.volume_model === 'konservativ' ? 'checked' : ''}>
                <span>Konservativ (+5% p.a.)</span>
              </label>
              <label class="model-option">
                <input type="radio" name="volume-model" value="realistisch" ${data.volume_model === 'realistisch' ? 'checked' : ''}>
                <span>Realistisch (S-Kurve)</span>
              </label>
              <label class="model-option">
                <input type="radio" name="volume-model" value="optimistisch" ${data.volume_model === 'optimistisch' ? 'checked' : ''}>
                <span>Optimistisch (+15% p.a.)</span>
              </label>
            </div>
          </div>
          
          <!-- Preisentwicklung -->
          <div class="model-group">
            <label class="model-label">Preisentwicklung</label>
            <div class="model-options">
              <label class="model-option">
                <input type="radio" name="price-model" value="konstant" ${data.price_model === 'konstant' ? 'checked' : ''}>
                <span>Konstant (0%)</span>
              </label>
              <label class="model-option">
                <input type="radio" name="price-model" value="inflation" ${data.price_model === 'inflation' ? 'checked' : ''}>
                <span>Inflation (+2% p.a.)</span>
              </label>
              <label class="model-option">
                <input type="radio" name="price-model" value="premium" ${data.price_model === 'premium' ? 'checked' : ''}>
                <span>Premium (+5% p.a.)</span>
              </label>
              <label class="model-option">
                <input type="radio" name="price-model" value="deflation" ${data.price_model === 'deflation' ? 'checked' : ''}>
                <span>Deflation (-3% p.a.)</span>
              </label>
            </div>
          </div>
          
          <!-- Kostenentwicklung -->
          <div class="model-group">
            <label class="model-label">Kostenentwicklung</label>
            <div class="model-options">
              <label class="model-option">
                <input type="radio" name="cost-model" value="konstant" ${data.cost_model === 'konstant' ? 'checked' : ''}>
                <span>Konstant (0%)</span>
              </label>
              <label class="model-option">
                <input type="radio" name="cost-model" value="inflation" ${data.cost_model === 'inflation' ? 'checked' : ''}>
                <span>Inflation (+2% p.a.)</span>
              </label>
              <label class="model-option">
                <input type="radio" name="cost-model" value="learning" ${data.cost_model === 'learning' ? 'checked' : ''}>
                <span>Learning Curve (-5% p.a.)</span>
              </label>
              <label class="model-option">
                <input type="radio" name="cost-model" value="steigend" ${data.cost_model === 'steigend' ? 'checked' : ''}>
                <span>Steigend (+5% p.a.)</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Calculate Button -->
        <div class="action-buttons">
          <button class="btn btn-primary" onclick="window.calculateHardwareForecast()">
            📊 Forecast berechnen
          </button>
        </div>
      </div>
      
      <!-- Forecast Table Container -->
      <div id="forecast-table-container"></div>
      
    </div>
    
    ${renderHardwareStyles()}
  `;
  
  // Attach event listeners
  attachHardwareEventListeners(artikel);
  
  // Store artikel reference globally for calculation
  window._currentArtikel = artikel;
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializeHardwareData(artikel) {
  return {
    release_date: artikel.release_datum || new Date().toISOString().slice(0, 7),
    time_horizon: artikel.zeitraum || 5,
    
    volume_year1: 1000,
    price_year1: 50,
    cost_year1: 20,
    
    volume_model: 'konservativ',
    price_model: 'konstant',
    cost_model: 'konstant',
    
    calculated: false
  };
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachHardwareEventListeners(artikel) {
  // Horizon buttons
  document.querySelectorAll('.horizon-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.horizon-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
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
}

// ==========================================
// CALCULATION
// ==========================================

window.calculateHardwareForecast = function() {
  console.log('📊 Calculating Hardware Forecast...');
  
  const artikel = window._currentArtikel;
  if (!artikel) {
    alert('❌ Artikel nicht gefunden!');
    return;
  }
  
  // Collect input data
  const data = {
    release_date: document.getElementById('hw-date').value,
    time_horizon: parseInt(document.querySelector('.horizon-btn.active')?.dataset.years) || 5,
    
    volume_year1: parseFloat(document.getElementById('hw-volume').value) || 0,
    price_year1: parseFloat(document.getElementById('hw-price').value) || 0,
    cost_year1: parseFloat(document.getElementById('hw-cost').value) || 0,
    
    volume_model: document.querySelector('input[name="volume-model"]:checked')?.value || 'konstant',
    price_model: document.querySelector('input[name="price-model"]:checked')?.value || 'konstant',
    cost_model: document.querySelector('input[name="cost-model"]:checked')?.value || 'konstant'
  };
  
  // Validate
  if (!data.volume_year1 || !data.price_year1 || !data.cost_year1) {
    alert('⚠️ Bitte alle Startwerte eingeben (Menge, Preis, HK)!');
    return;
  }
  
  // Calculate forecast
  const forecast = calculateForecast(data);
  
  // Render forecast table
  renderForecastTable(forecast, 'forecast-table-container');
  
  // Save to artikel
  artikel.hardware_model_data = {
    ...artikel.hardware_model_data,
    ...data,
    calculated: true,
    forecast: forecast
  };
  
  console.log('✅ Hardware Forecast berechnet!');
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
    case 'inflation':
      return startPrice * Math.pow(1.02, yearIndex);
    case 'premium':
      return startPrice * Math.pow(1.05, yearIndex);
    case 'deflation':
      return startPrice * Math.pow(0.97, yearIndex);
    default:
      return startPrice;
  }
}

function calculateCost(startCost, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return startCost;
    case 'inflation':
      return startCost * Math.pow(1.02, yearIndex);
    case 'learning':
      return startCost * Math.pow(0.95, yearIndex);
    case 'steigend':
      return startCost * Math.pow(1.05, yearIndex);
    default:
      return startCost;
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

function renderHardwareStyles() {
  return `
    <style>
      .hardware-model-container {
        padding: 24px;
        background: #f9fafb;
      }
      
      .section-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
      }
      
      .section-title {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .input-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      }
      
      .input-group {
        display: flex;
        flex-direction: column;
      }
      
      .input-label {
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }
      
      .form-input {
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
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
        padding: 10px;
        border: 2px solid #d1d5db;
        border-radius: 6px;
        background: white;
        font-size: 14px;
        font-weight: 600;
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
      
      /* Quick KPIs */
      .quick-kpis {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
      }
      
      .kpi-item {
        text-align: center;
      }
      
      .kpi-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 6px;
      }
      
      .kpi-value {
        display: block;
        font-size: 20px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .kpi-positive {
        color: #059669;
      }
      
      /* Development Models */
      .development-models {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      
      .model-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .model-label {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }
      
      .model-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 8px;
      }
      
      .model-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .model-option:hover {
        background: #f9fafb;
        border-color: #3b82f6;
      }
      
      .model-option input[type="radio"] {
        cursor: pointer;
      }
      
      .model-option input[type="radio"]:checked + span {
        font-weight: 600;
        color: #2563eb;
      }
      
      .model-option span {
        font-size: 13px;
        color: #1f2937;
      }
      
      /* Action Buttons */
      .action-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 20px;
      }
      
      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
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
      
      @media (max-width: 768px) {
        .quick-kpis {
          grid-template-columns: 1fr;
        }
        
        .model-options {
          grid-template-columns: 1fr;
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
