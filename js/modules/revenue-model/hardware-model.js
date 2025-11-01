/**
 * HARDWARE MODEL - COMPACT VERSION
 * Kompaktes Design, Auto-Calculate, Always-Visible Forecast
 * ✅ MIT SPEICHERN-FUNKTION
 */

import { renderForecastTable } from './forecast-table.js';
import * as api from '../../api.js';

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
                type="text" 
                id="hw-volume" 
                value="${formatNumberWithThousands(data.volume_year1)}"
                class="input-compact"
                onfocus="handleInputFocus(this)"
                onblur="handleInputBlur(this, 'number')"
            >
          </div>
          <div class="input-group-compact">
            <label>Preis (€/Stück)</label>
            <input 
            type="text" 
            id="hw-price" 
            value="${formatNumberWithDecimals(data.price_year1, 2)}"
            class="input-compact"
            onfocus="handleInputFocus(this)"
            onblur="handleInputBlur(this, 'decimal')"
            >
          </div>
          <div class="input-group-compact">
            <label>HK (€/Stück)</label>
            <input 
            type="text" 
            id="hw-cost" 
            value="${formatNumberWithDecimals(data.cost_year1, 2)}"
            class="input-compact"
            onfocus="handleInputFocus(this)"
            onblur="handleInputBlur(this, 'decimal')"
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
      
      <!-- Entwicklungsmodelle (3-Spalten) -->
        <div class="section-compact">
        <h3 class="section-title-compact">📈 ENTWICKLUNGSMODELLE</h3>
        
        <div class="models-grid">
            
            <!-- Spalte 1: Mengenentwicklung -->
            <div class="model-column">
            <div class="model-header">MENGENENTWICKLUNG</div>
            <label class="model-option">
                <input type="radio" name="volume-model" value="konstant" ${data.volume_model === 'konstant' ? 'checked' : ''}>
                <span>Konstant <small>(+0% p.a.)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="volume-model" value="konservativ" ${data.volume_model === 'konservativ' ? 'checked' : ''}>
                <span>Konservativ <small>(+15% p.a.)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="volume-model" value="realistisch" ${data.volume_model === 'realistisch' ? 'checked' : ''}>
                <span>Realistisch <small>(S-Kurve)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="volume-model" value="optimistisch" ${data.volume_model === 'optimistisch' ? 'checked' : ''}>
                <span>Optimistisch <small>(Hockey-Stick)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="volume-model" value="manuell" ${data.volume_model === 'manuell' ? 'checked' : ''}>
                <span style="color: #6b7280;">Manuell</span>
            </label>
            </div>
            
            <!-- Spalte 2: Preisentwicklung -->
            <div class="model-column">
            <div class="model-header">PREISENTWICKLUNG</div>
            <label class="model-option">
                <input type="radio" name="price-model" value="konstant" ${data.price_model === 'konstant' ? 'checked' : ''}>
                <span>Konstant <small>(0% p.a.)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="price-model" value="inflation" ${data.price_model === 'inflation' ? 'checked' : ''}>
                <span>Inflation <small>(+2% p.a.)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="price-model" value="premium" ${data.price_model === 'premium' ? 'checked' : ''}>
                <span>Premium <small>(+5% p.a.)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="price-model" value="deflation" ${data.price_model === 'deflation' ? 'checked' : ''}>
                <span>Deflation <small>(-3% p.a.)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="price-model" value="manuell" ${data.price_model === 'manuell' ? 'checked' : ''}>
                <span style="color: #6b7280;">Manuell</span>
            </label>
            </div>
            
            <!-- Spalte 3: Kostenentwicklung -->
            <div class="model-column">
            <div class="model-header">KOSTENENTWICKLUNG</div>
            <label class="model-option">
                <input type="radio" name="cost-model" value="konstant" ${data.cost_model === 'konstant' ? 'checked' : ''}>
                <span>Konstant <small>(0% p.a.)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="cost-model" value="inflation" ${data.cost_model === 'inflation' ? 'checked' : ''}>
                <span>Inflation <small>(+2% p.a.)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="cost-model" value="learning" ${data.cost_model === 'learning' ? 'checked' : ''}>
                <span>Lernkurve <small>(-5% bei 2x)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="cost-model" value="steigend" ${data.cost_model === 'steigend' ? 'checked' : ''}>
                <span>Steigend <small>(+5% p.a.)</small></span>
            </label>
            <label class="model-option">
                <input type="radio" name="cost-model" value="manuell" ${data.cost_model === 'manuell' ? 'checked' : ''}>
                <span style="color: #6b7280;">Manuell</span>
            </label>
            </div>
            
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

    <!-- ✅ FORECAST TABLE CONTAINER -->
    <div id="forecast-table-container" style="margin-top: 16px;">
    <!-- Forecast wird hier dynamisch eingefügt -->
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
      window.calculateHardwareForecast();
    });
  });
  
  // Real-time KPI updates
  const volumeInput = document.getElementById('hw-volume');
  const priceInput = document.getElementById('hw-price');
  const costInput = document.getElementById('hw-cost');
  
  // ✅ NEU: Helper für formatierte Inputs (INNERHALB der Funktion!)
  const parseFormattedValue = (input) => {
    const value = input.value.replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(value) || 0;
  };
  
  // ✅ VERBESSERT: Nutzt parseFormattedValue
  const updateKPIs = () => {
    const volume = parseFormattedValue(volumeInput);  // ✅ Funktioniert jetzt!
    const price = parseFormattedValue(priceInput);
    const cost = parseFormattedValue(costInput);
    
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
  
  // Auto-recalculate on blur
  volumeInput.addEventListener('blur', () => window.calculateHardwareForecast());
  priceInput.addEventListener('blur', () => window.calculateHardwareForecast());
  costInput.addEventListener('blur', () => window.calculateHardwareForecast());
  
  // Radio buttons
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      window.calculateHardwareForecast();
    });
  });
  
  // Save button
  const saveButton = document.getElementById('btn-save-hardware-forecast');
  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      await saveHardwareForecast();
    });
  }
}


// ==========================================
// ✅ SAVE FORECAST FUNCTION
// ==========================================

async function saveHardwareForecast() {
  const artikel = window._currentArtikel;
  if (!artikel) {
    showSaveError('Kein Artikel ausgewählt');
    return;
  }
  
  // Check if forecast exists
  if (!artikel.hardware_model_data || !artikel.hardware_model_data.forecast) {
    showSaveError('Bitte zuerst Forecast berechnen');
    return;
  }
  
  const forecast = artikel.hardware_model_data.forecast;
  const data = artikel.hardware_model_data;
  
  // Prepare parameters
  const parameters = {
    release_date: data.release_date,
    time_horizon: data.time_horizon,
    volume_year1: data.volume_year1,
    price_year1: data.price_year1,
    cost_year1: data.cost_year1,
    volume_model: data.volume_model,
    price_model: data.price_model,
    cost_model: data.cost_model
  };
  
  // Prepare forecast data
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
  
  console.log('💾 Speichere Hardware Forecast:', {
    artikelId: artikel.id,
    parameters,
    forecastData
  });
  
  // Show loading state
  const saveButton = document.getElementById('btn-save-hardware-forecast');
  const originalText = saveButton.innerHTML;
  saveButton.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Speichert...</span>';
  saveButton.disabled = true;
  
try {
  // Call API to save forecast
  await api.saveForecast(artikel.id, 'hardware', forecastData, parameters);
    
    // Show success
    showSaveSuccess();
    
    console.log('✅ Hardware Forecast erfolgreich gespeichert');
    
  } catch (error) {
    console.error('❌ Fehler beim Speichern:', error);
    showSaveError(error.message || 'Unbekannter Fehler');
  } finally {
    // Reset button
    saveButton.innerHTML = originalText;
    saveButton.disabled = false;
  }
}

function showSaveSuccess() {
  const successDiv = document.getElementById('save-status-hardware');
  const errorDiv = document.getElementById('save-error-hardware');
  
  if (successDiv) {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'flex';
    
    // Hide after 3 seconds
    setTimeout(() => {
      successDiv.style.display = 'none';
    }, 3000);
  }
}

function showSaveError(message) {
  const successDiv = document.getElementById('save-status-hardware');
  const errorDiv = document.getElementById('save-error-hardware');
  
  if (errorDiv) {
    successDiv.style.display = 'none';
    
    const errorText = errorDiv.querySelector('.error-text');
    if (errorText) {
      errorText.textContent = message;
    }
    
    errorDiv.style.display = 'flex';
    
    // Hide after 5 seconds
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }
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
    
    volume_year1: parseFormattedNumber(document.getElementById('hw-volume')?.value),
    price_year1: parseFormattedNumber(document.getElementById('hw-price')?.value),
    cost_year1: parseFormattedNumber(document.getElementById('hw-cost')?.value),
    
    volume_model: document.querySelector('input[name="volume-model"]:checked')?.value || 'konstant',
    price_model: document.querySelector('input[name="price-model"]:checked')?.value || 'konstant',
    cost_model: document.querySelector('input[name="cost-model"]:checked')?.value || 'konstant'
  };

  // Check if any manual mode is active
    const isManualMode = data.volume_model === 'manuell' || 
                     data.price_model === 'manuell' || 
                     data.cost_model === 'manuell';
  
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
// INPUT FORMATTING HELPERS
// ==========================================

function formatNumberWithThousands(value) {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumberWithDecimals(value, decimals) {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

function handleInputFocus(input) {
  // Remove formatting on focus (1.000 → 1000 oder 50,00 → 50)
  const value = input.value.replace(/\./g, '').replace(/,/g, '.');
  input.value = value;
  input.select();
}

function handleInputBlur(input, type) {
  // Re-apply formatting on blur
  const value = parseFloat(input.value.replace(/\./g, '').replace(/,/g, '.')) || 0;
  
  if (type === 'number') {
    input.value = formatNumberWithThousands(value);
  } else if (type === 'decimal') {
    input.value = formatNumberWithDecimals(value, 2);
  }
}

function parseFormattedNumber(value) {
  if (!value) return 0;
  const cleaned = value.toString().replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(cleaned) || 0;
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
      /* Models Grid (3 Spalten) */
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

        /* Responsive */
        @media (max-width: 768px) {
        .models-grid {
            grid-template-columns: 1fr;
        }
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
      
      .btn-save-forecast {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
      }
      
      .btn-save-forecast:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(37, 99, 235, 0.4);
      }
      
      .btn-save-forecast:active {
        transform: translateY(0);
      }
      
      .btn-save-forecast:disabled {
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
        
        .save-button-container {
          flex-direction: column;
          align-items: stretch;
        }
        
        .btn-save-forecast {
          width: 100%;
          justify-content: center;
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
