/**
 * PACKAGE MODEL - COMPACT VERSION
 * Kompaktes Design, Auto-Calculate, Always-Visible Forecast
 */

import { renderForecastTable } from './forecast-table.js';

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export function renderPackageModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('📊 Rendering Package Model (Compact) for:', artikel.name);
  
  // Initialize data
  if (!artikel.package_model_data) {
    artikel.package_model_data = initializePackageData(artikel);
  }
  
  const data = artikel.package_model_data;
  
  container.innerHTML = `
    <div class="package-model-compact">
      
      <!-- Zeitliche Rahmendaten -->
      <div class="section-compact">
        <h3 class="section-title-compact">📅 Zeitliche Rahmendaten</h3>
        <div class="input-row-compact">
          <div class="input-group-compact">
            <label>Release / Startdatum</label>
            <input type="month" id="pkg-date" value="${data.release_date}" class="input-compact">
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
      
      <!-- Package Varianten -->
      <div class="section-compact">
        <h3 class="section-title-compact">📦 Package Varianten</h3>
        
        <div class="variants-grid">
          <!-- Small -->
          <div class="variant-card">
            <label class="variant-label">Small Package</label>
            <input type="number" id="pkg-small-price" value="${data.price_small}" class="input-compact" placeholder="5000">
            <span class="input-hint">Preis (€)</span>
            <input type="number" id="pkg-small-cost" value="${data.cost_small}" class="input-compact" placeholder="2000">
            <span class="input-hint">HK (€)</span>
          </div>
          
          <!-- Medium -->
          <div class="variant-card">
            <label class="variant-label">Medium Package</label>
            <input type="number" id="pkg-medium-price" value="${data.price_medium}" class="input-compact" placeholder="10000">
            <span class="input-hint">Preis (€)</span>
            <input type="number" id="pkg-medium-cost" value="${data.cost_medium}" class="input-compact" placeholder="4000">
            <span class="input-hint">HK (€)</span>
          </div>
          
          <!-- Large -->
          <div class="variant-card">
            <label class="variant-label">Large Package</label>
            <input type="number" id="pkg-large-price" value="${data.price_large}" class="input-compact" placeholder="20000">
            <span class="input-hint">Preis (€)</span>
            <input type="number" id="pkg-large-cost" value="${data.cost_large}" class="input-compact" placeholder="8000">
            <span class="input-hint">HK (€)</span>
          </div>
        </div>
      </div>
      
      <!-- Mengen & Mix -->
      <div class="section-compact">
        <h3 class="section-title-compact">📊 Startwerte (Jahr 1)</h3>
        <div class="input-row-compact">
          <div class="input-group-compact">
            <label>Gesamt-Volumen</label>
            <input type="number" id="pkg-volume" value="${data.volume_year1}" class="input-compact" placeholder="100">
          </div>
          <div class="input-group-compact">
            <label>Mix Small (%)</label>
            <input type="number" id="pkg-mix-small" value="${data.mix_small}" class="input-compact" placeholder="50" max="100">
          </div>
          <div class="input-group-compact">
            <label>Mix Medium (%)</label>
            <input type="number" id="pkg-mix-medium" value="${data.mix_medium}" class="input-compact" placeholder="30" max="100">
          </div>
          <div class="input-group-compact">
            <label>Mix Large (%)</label>
            <input type="number" id="pkg-mix-large" value="${data.mix_large}" class="input-compact" placeholder="20" max="100">
          </div>
        </div>
        
        <!-- Quick KPIs -->
        <div class="kpis-inline">
          <span class="kpi-inline">
            <strong>Umsatz J1:</strong> 
            <span id="kpi-revenue">-</span>
          </span>
          <span class="kpi-inline">
            <strong>DB2 J1:</strong> 
            <span id="kpi-db2" class="kpi-positive">-</span>
          </span>
          <span class="kpi-inline">
            <strong>Ø Marge:</strong> 
            <span id="kpi-margin">-</span>
          </span>
        </div>
      </div>
      
      <!-- Entwicklungsmodelle -->
      <div class="section-compact">
        <h3 class="section-title-compact">📈 Entwicklungsmodelle</h3>
        
        <div class="models-compact">
          <!-- Mengenentwicklung -->
          <div class="model-row">
            <label class="model-label-compact">Mengenentwicklung</label>
            <div class="model-radios">
              <label><input type="radio" name="pkg-volume-model" value="konstant" ${data.volume_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="pkg-volume-model" value="konservativ" ${data.volume_model === 'konservativ' ? 'checked' : ''}> Konservativ</label>
              <label><input type="radio" name="pkg-volume-model" value="realistisch" ${data.volume_model === 'realistisch' ? 'checked' : ''}> Realistisch</label>
              <label><input type="radio" name="pkg-volume-model" value="optimistisch" ${data.volume_model === 'optimistisch' ? 'checked' : ''}> Optimistisch</label>
            </div>
          </div>
          
          <!-- Preisentwicklung -->
          <div class="model-row">
            <label class="model-label-compact">Preisentwicklung</label>
            <div class="model-radios">
              <label><input type="radio" name="pkg-price-model" value="konstant" ${data.price_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="pkg-price-model" value="inflation" ${data.price_model === 'inflation' ? 'checked' : ''}> Inflation</label>
              <label><input type="radio" name="pkg-price-model" value="premium" ${data.price_model === 'premium' ? 'checked' : ''}> Premium</label>
            </div>
          </div>
          
          <!-- Kostenentwicklung -->
          <div class="model-row">
            <label class="model-label-compact">Kostenentwicklung</label>
            <div class="model-radios">
              <label><input type="radio" name="pkg-cost-model" value="konstant" ${data.cost_model === 'konstant' ? 'checked' : ''}> Konstant</label>
              <label><input type="radio" name="pkg-cost-model" value="inflation" ${data.cost_model === 'inflation' ? 'checked' : ''}> Inflation</label>
              <label><input type="radio" name="pkg-cost-model" value="learning" ${data.cost_model === 'learning' ? 'checked' : ''}> Learning</label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Forecast Table Container -->
      <div id="forecast-table-container"></div>
      
    </div>
    
    ${renderCompactStyles()}
  `;
  
  // Attach event listeners
  attachPackageEventListeners(artikel);
  
  // Store artikel reference
  window._currentArtikel = artikel;
  
  // AUTO-CALCULATE
  autoCalculateForecast();
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializePackageData(artikel) {
  return {
    release_date: artikel.release_datum || new Date().toISOString().slice(0, 7),
    time_horizon: artikel.zeitraum || 5,
    
    price_small: 5000,
    price_medium: 10000,
    price_large: 20000,
    cost_small: 2000,
    cost_medium: 4000,
    cost_large: 8000,
    
    volume_year1: 100,
    mix_small: 50,
    mix_medium: 30,
    mix_large: 20,
    
    volume_model: 'konservativ',
    price_model: 'konstant',
    cost_model: 'konstant',
    
    calculated: false
  };
}

// ==========================================
// AUTO-CALCULATE
// ==========================================

function autoCalculateForecast() {
  setTimeout(() => {
    window.calculatePackageForecast();
  }, 100);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachPackageEventListeners(artikel) {
  // Horizon buttons
  document.querySelectorAll('.btn-horizon').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.btn-horizon').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      window.calculatePackageForecast();
    });
  });
  
  // Real-time KPI updates
  const inputs = [
    'pkg-volume', 'pkg-small-price', 'pkg-medium-price', 'pkg-large-price',
    'pkg-small-cost', 'pkg-medium-cost', 'pkg-large-cost',
    'pkg-mix-small', 'pkg-mix-medium', 'pkg-mix-large'
  ];
  
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', updateKPIs);
      input.addEventListener('blur', () => window.calculatePackageForecast());
    }
  });
  
  // Radio buttons - auto-recalculate
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => window.calculatePackageForecast());
  });
  
  // Initial KPI update
  updateKPIs();
}

function updateKPIs() {
  const volume = parseFloat(document.getElementById('pkg-volume')?.value) || 0;
  const mixSmall = parseFloat(document.getElementById('pkg-mix-small')?.value) || 0;
  const mixMedium = parseFloat(document.getElementById('pkg-mix-medium')?.value) || 0;
  const mixLarge = parseFloat(document.getElementById('pkg-mix-large')?.value) || 0;
  
  const priceSmall = parseFloat(document.getElementById('pkg-small-price')?.value) || 0;
  const priceMedium = parseFloat(document.getElementById('pkg-medium-price')?.value) || 0;
  const priceLarge = parseFloat(document.getElementById('pkg-large-price')?.value) || 0;
  
  const costSmall = parseFloat(document.getElementById('pkg-small-cost')?.value) || 0;
  const costMedium = parseFloat(document.getElementById('pkg-medium-cost')?.value) || 0;
  const costLarge = parseFloat(document.getElementById('pkg-large-cost')?.value) || 0;
  
  // Calculate volumes
  const volSmall = volume * (mixSmall / 100);
  const volMedium = volume * (mixMedium / 100);
  const volLarge = volume * (mixLarge / 100);
  
  // Calculate revenue & costs
  const revSmall = volSmall * priceSmall;
  const revMedium = volMedium * priceMedium;
  const revLarge = volLarge * priceLarge;
  const revenue = revSmall + revMedium + revLarge;
  
  const costSmallTotal = volSmall * costSmall;
  const costMediumTotal = volMedium * costMedium;
  const costLargeTotal = volLarge * costLarge;
  const totalCost = costSmallTotal + costMediumTotal + costLargeTotal;
  
  const db2 = revenue - totalCost;
  const margin = revenue > 0 ? (db2 / revenue) * 100 : 0;
  
  document.getElementById('kpi-revenue').textContent = formatCurrency(revenue);
  document.getElementById('kpi-db2').textContent = formatCurrency(db2);
  document.getElementById('kpi-margin').textContent = formatNumber(margin, 1) + '%';
}

// ==========================================
// CALCULATION
// ==========================================

window.calculatePackageForecast = function() {
  const artikel = window._currentArtikel;
  if (!artikel) return;
  
  // Collect input data
  const data = {
    release_date: document.getElementById('pkg-date')?.value || '2025-01',
    time_horizon: parseInt(document.querySelector('.btn-horizon.active')?.dataset.years) || 5,
    
    price_small: parseFloat(document.getElementById('pkg-small-price')?.value) || 0,
    price_medium: parseFloat(document.getElementById('pkg-medium-price')?.value) || 0,
    price_large: parseFloat(document.getElementById('pkg-large-price')?.value) || 0,
    
    cost_small: parseFloat(document.getElementById('pkg-small-cost')?.value) || 0,
    cost_medium: parseFloat(document.getElementById('pkg-medium-cost')?.value) || 0,
    cost_large: parseFloat(document.getElementById('pkg-large-cost')?.value) || 0,
    
    volume_year1: parseFloat(document.getElementById('pkg-volume')?.value) || 0,
    mix_small: parseFloat(document.getElementById('pkg-mix-small')?.value) || 0,
    mix_medium: parseFloat(document.getElementById('pkg-mix-medium')?.value) || 0,
    mix_large: parseFloat(document.getElementById('pkg-mix-large')?.value) || 0,
    
    volume_model: document.querySelector('input[name="pkg-volume-model"]:checked')?.value || 'konstant',
    price_model: document.querySelector('input[name="pkg-price-model"]:checked')?.value || 'konstant',
    cost_model: document.querySelector('input[name="pkg-cost-model"]:checked')?.value || 'konstant'
  };
  
  // Validate
  if (!data.volume_year1) {
    console.log('⚠️ Waiting for complete input...');
    return;
  }
  
  // Calculate forecast
  const forecast = calculateForecast(data);
  
  // Render forecast table
  renderForecastTable(forecast, 'forecast-table-container');
  
  // Save to artikel
  artikel.package_model_data = {
    ...artikel.package_model_data,
    ...data,
    calculated: true,
    forecast: forecast
  };
};

function calculateForecast(data) {
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    name: window._currentArtikel?.name || 'Package',
    type: 'package',
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
    
    // Calculate total volume
    const baseVolume = data.volume_year1;
    const volume = calculateVolume(baseVolume, data.volume_model, i);
    
    // Calculate volumes per variant
    const volSmall = volume * (data.mix_small / 100);
    const volMedium = volume * (data.mix_medium / 100);
    const volLarge = volume * (data.mix_large / 100);
    
    // Calculate prices (apply price model)
    const priceSmall = calculatePrice(data.price_small, data.price_model, i);
    const priceMedium = calculatePrice(data.price_medium, data.price_model, i);
    const priceLarge = calculatePrice(data.price_large, data.price_model, i);
    
    // Calculate costs (apply cost model)
    const costSmall = calculateCost(data.cost_small, data.cost_model, i);
    const costMedium = calculateCost(data.cost_medium, data.cost_model, i);
    const costLarge = calculateCost(data.cost_large, data.cost_model, i);
    
    // Weighted average price & cost
    const avgPrice = (volSmall * priceSmall + volMedium * priceMedium + volLarge * priceLarge) / volume;
    const avgCost = (volSmall * costSmall + volMedium * costMedium + volLarge * costLarge) / volume;
    
    // Calculate outputs
    const revenue = volSmall * priceSmall + volMedium * priceMedium + volLarge * priceLarge;
    const totalCost = volSmall * costSmall + volMedium * costMedium + volLarge * costLarge;
    const db2 = revenue - totalCost;
    const db2Margin = revenue > 0 ? (db2 / revenue) * 100 : 0;
    
    forecast.volume.push(volume);
    forecast.price.push(avgPrice);
    forecast.cost.push(avgCost);
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

function renderCompactStyles() {
  return `
    <style>
      .package-model-compact {
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
      
      /* Variants Grid */
      .variants-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
      }
      
      .variant-card {
        padding: 10px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .variant-label {
        font-size: 12px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .input-hint {
        font-size: 10px;
        color: #6b7280;
        margin-top: -4px;
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
        
        .variants-grid {
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
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderPackageModel
};
