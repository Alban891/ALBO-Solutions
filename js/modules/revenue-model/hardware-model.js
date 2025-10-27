/**
 * HARDWARE MODEL - COMPACT VERSION
 * Kompaktes Design, Auto-Calculate, Always-Visible Forecast
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
  
  console.log('📦 Rendering Hardware Model (Compact) for:', artikel.name);
  
  // Initialize data
  if (!artikel.hardware_model_data) {
    artikel.hardware_model_data = initializeHardwareData(artikel);
  }
  
  const data = artikel.hardware_model_data;
  
  container.innerHTML = `
    <div class="hardware-model-compact">
      
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
            <strong>Marge:</strong> 
            <span id="kpi-margin">${formatNumber(((data.price_year1 - data.cost_year1) / data.price_year1) * 100, 1)}%</span>
          </span>
        </div>
      </div>
      
      <!-- Entwicklungsmodelle (ultra-kompakt) -->
      <div class="section-compact">
        <h3 class="section-title-compact">📈 Entwicklungsmodelle</h3>
        
        <div class="models-compact">
          <!-- Menge -->
          <div class="model-row">
            <label class="model-label-compact">Mengenentwicklung</label>
            <div class="model-radios">
              <label><input type="radio" name="volume-model" value="konstant" ${data.volume_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="volume-model" value="konservativ" ${data.volume_model === 'konservativ' ? 'checked' : ''}> Konservativ</label>
              <label><input type="radio" name="volume-model" value="realistisch" ${data.volume_model === 'realistisch' ? 'checked' : ''}> Realistisch</label>
              <label><input type="radio" name="volume-model" value="optimistisch" ${data.volume_model === 'optimistisch' ? 'checked' : ''}> Optimistisch</label>
            </div>
          </div>
          
          <!-- Preis -->
          <div class="model-row">
            <label class="model-label-compact">Preisentwicklung</label>
            <div class="model-radios">
              <label><input type="radio" name="price-model" value="konstant" ${data.price_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="price-model" value="inflation" ${data.price_model === 'inflation' ? 'checked' : ''}> Inflation</label>
              <label><input type="radio" name="price-model" value="premium" ${data.price_model === 'premium' ? 'checked' : ''}> Premium</label>
              <label><input type="radio" name="price-model" value="deflation" ${data.price_model === 'deflation' ? 'checked' : ''}> Deflation</label>
            </div>
          </div>
          
          <!-- Kosten -->
          <div class="model-row">
            <label class="model-label-compact">Kostenentwicklung</label>
            <div class="model-radios">
              <label><input type="radio" name="cost-model" value="konstant" ${data.cost_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="cost-model" value="inflation" ${data.cost_model === 'inflation' ? 'checked' : ''}> Inflation</label>
              <label><input type="radio" name="cost-model" value="learning" ${data.cost_model === 'learning' ? 'checked' : ''}> Learning</label>
              <label><input type="radio" name="cost-model" value="steigend" ${data.cost_model === 'steigend' ? 'checked' : ''}> Steigend</label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Forecast Table Container (always visible) -->
      <div id="forecast-table-container"></div>
      
    </div>
    
    ${renderCompactStyles()}
  `;
  
  // Attach event listeners
  attachHardwareEventListeners(artikel);
  
  // Store artikel reference
  window._currentArtikel = artikel;
  
  // AUTO-CALCULATE: Render initial forecast
  autoCalculateForecast();
}

// ==========================================
// AUTO-CALCULATE
// ==========================================

function autoCalculateForecast() {
  console.log('🔄 Auto-calculating initial forecast...');
  
  // Wait for DOM to be ready
  setTimeout(() => {
    window.calculateHardwareForecast();
  }, 100);
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
// CALCULATION
// ==========================================

window.calculateHardwareForecast = function() {
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
  
  // Save to artikel
  artikel.hardware_model_data = {
    ...artikel.hardware_model_data,
    ...data,
    calculated: true,
    forecast: forecast
  };
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
// COMPACT STYLES
// ==========================================

function renderCompactStyles() {
  return `
    <style>
      .hardware-model-compact {
        padding: 12px;
        background: #f9fafb;
      }
      
      /* Compact Sections */
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
      
      /* Compact Inputs */
      .input-row-compact {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
