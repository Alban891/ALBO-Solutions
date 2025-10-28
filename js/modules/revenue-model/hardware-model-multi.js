/**
 * MULTI-ARTIKEL PLANNING
 * Portfolio-Ansicht mit allen Artikel-Forecasts
 */

import { renderMultiForecastTable } from './forecast-table.js';

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export function renderMultiArtikelPlanning(artikelIds, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('📊 Rendering Multi-Artikel Planning for:', artikelIds);
  
  // Validate
  if (!artikelIds || artikelIds.length === 0) {
    renderEmptyState(container);
    return;
  }
  
  // Get artikel data
  const artikelList = artikelIds.map(id => {
    return window.revenueModelArtikel.find(a => a.id === id);
  }).filter(a => a !== undefined);
  
  if (artikelList.length === 0) {
    renderEmptyState(container);
    return;
  }
  
  // Render interface
  container.innerHTML = `
    <div class="multi-artikel-planning">
      
      <!-- Header -->
      <div class="multi-header">
        <div class="multi-title">
          <span class="title-icon">📊</span>
          <span class="title-text">Multi-Artikel Planung</span>
          <span class="artikel-count">${artikelList.length} Artikel ausgewählt</span>
        </div>
        <button class="btn-calculate" id="btn-calculate-multi">
          🔄 Portfolio berechnen
        </button>
      </div>
      
      <!-- Info Box -->
      <div class="info-box">
        <div class="info-icon">💡</div>
        <div class="info-content">
          <strong>Portfolio-Analyse:</strong> Die Forecast-Tabelle unten zeigt alle ausgewählten Artikel mit ihren individuellen Parametern und die aggregierte Portfolio-Sicht.
        </div>
      </div>
      
      <!-- Artikel Overview -->
      <div class="artikel-overview">
        <h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #374151;">Ausgewählte Artikel:</h4>
        <div class="artikel-chips">
          ${artikelList.map(artikel => `
            <div class="artikel-chip">
              <span class="chip-icon">${getArtikelIcon(artikel.typ)}</span>
              <span class="chip-name">${artikel.name}</span>
              <span class="chip-type">${artikel.typ}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Status Message -->
      <div id="multi-status" class="status-message" style="display: none;"></div>
      
    </div>
    
    ${renderMultiStyles()}
  `;
  
  // Store artikel references
  window._multiArtikelList = artikelList;
  
  // Attach event listeners
  attachMultiEventListeners();
  
  // Auto-calculate
  autoCalculateMultiForecast();
}

// ==========================================
// AUTO-CALCULATE
// ==========================================

function autoCalculateMultiForecast() {
  console.log('🔄 Auto-calculating multi-artikel forecast...');
  
  setTimeout(() => {
    calculateMultiForecast();
  }, 100);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachMultiEventListeners() {
  const calculateBtn = document.getElementById('btn-calculate-multi');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateMultiForecast);
  }
}

// ==========================================
// CALCULATE MULTI-FORECAST
// ==========================================

function calculateMultiForecast() {
  console.log('📊 Calculating Multi-Artikel Forecast...');
  
  const artikelList = window._multiArtikelList;
  if (!artikelList || artikelList.length === 0) {
    showStatus('❌ Keine Artikel verfügbar!', 'error');
    return;
  }
  
  // Collect forecasts from all artikel
  const forecasts = [];
  let hasErrors = false;
  
  artikelList.forEach(artikel => {
    // Check if artikel has forecast data
    if (!artikel.hardware_model_data || !artikel.hardware_model_data.forecast) {
      console.warn(`⚠️ Artikel "${artikel.name}" hat keine Forecast-Daten. Erstelle Default-Forecast...`);
      
      // Create default forecast
      const defaultForecast = createDefaultForecast(artikel);
      forecasts.push(defaultForecast);
    } else {
      // Use existing forecast
      forecasts.push(artikel.hardware_model_data.forecast);
    }
  });
  
  if (forecasts.length === 0) {
    showStatus('❌ Keine Forecasts verfügbar!', 'error');
    return;
  }
  
  console.log('✅ Collected', forecasts.length, 'forecasts');
  
  // Render combined forecast table
  renderMultiForecastTable(forecasts, 'forecast-table-container');
  
  showStatus(`✅ Portfolio berechnet: ${forecasts.length} Artikel`, 'success');
}

// ==========================================
// CREATE DEFAULT FORECAST
// ==========================================

function createDefaultForecast(artikel) {
  console.log('🔧 Creating default forecast for:', artikel.name);
  
  const startYear = new Date().getFullYear();
  const years = 5;
  
  const forecast = {
    name: artikel.name,
    type: getArtikelType(artikel.typ),
    years: [],
    volume: [],
    price: [],
    cost: [],
    revenue: [],
    totalCost: [],
    db2: [],
    db2Margin: []
  };
  
  // Default values based on type
  const defaults = getDefaultValues(artikel.typ);
  
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    forecast.years.push(year);
    
    // Simple growth model
    const volume = defaults.volume * Math.pow(1.05, i);
    const price = defaults.price;
    const cost = defaults.cost * Math.pow(0.95, i); // Learning curve
    
    forecast.volume.push(volume);
    forecast.price.push(price);
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

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getArtikelType(typ) {
  const typeMapping = {
    'Hardware': 'hardware',
    'Software': 'software',
    'Software-Perpetual': 'software',
    'Service': 'services',
    'Beratung': 'services',
    'Package': 'package'
  };
  return typeMapping[typ] || 'hardware';
}

function getDefaultValues(typ) {
  const defaults = {
    'Hardware': { volume: 1000, price: 50, cost: 20 },
    'Software': { volume: 100, price: 800, cost: 200 },
    'Software-Perpetual': { volume: 50, price: 2000, cost: 400 },
    'Service': { volume: 50, price: 1500, cost: 500 },
    'Beratung': { volume: 50, price: 1500, cost: 500 },
    'Package': { volume: 20, price: 5000, cost: 2000 }
  };
  return defaults[typ] || defaults['Hardware'];
}

function getArtikelIcon(typ) {
  const icons = {
    'Hardware': '📦',
    'Software': '💿',
    'Software-Perpetual': '💿',
    'Service': '👔',
    'Beratung': '👔',
    'Package': '📊'
  };
  return icons[typ] || '📈';
}

function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('multi-status');
  if (!statusEl) return;
  
  const colors = {
    'success': { bg: '#dcfce7', border: '#059669', text: '#065f46' },
    'error': { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
    'info': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
  };
  
  const color = colors[type] || colors['info'];
  
  statusEl.style.display = 'block';
  statusEl.style.padding = '12px 16px';
  statusEl.style.background = color.bg;
  statusEl.style.border = `2px solid ${color.border}`;
  statusEl.style.borderRadius = '8px';
  statusEl.style.color = color.text;
  statusEl.style.fontSize = '14px';
  statusEl.style.fontWeight = '600';
  statusEl.style.marginTop = '16px';
  statusEl.textContent = message;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

function renderEmptyState(container) {
  container.innerHTML = `
    <div style="padding: 60px 40px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;">📊</div>
      <h3 style="margin: 0 0 12px; font-size: 20px; color: #1f2937;">Keine Artikel ausgewählt</h3>
      <p style="margin: 0; color: #6b7280; font-size: 15px;">
        Bitte wählen Sie mindestens einen Artikel aus, um die Multi-Artikel Planung zu starten.
      </p>
    </div>
  `;
}

// ==========================================
// STYLES
// ==========================================

function renderMultiStyles() {
  return `
    <style>
      .multi-artikel-planning {
        padding: 20px;
        background: white;
        border-radius: 8px;
      }
      
      /* Header */
      .multi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .multi-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .title-icon {
        font-size: 24px;
      }
      
      .title-text {
        font-size: 20px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .artikel-count {
        padding: 4px 12px;
        background: #dbeafe;
        color: #1e40af;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
      }
      
      .btn-calculate {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-calculate:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }
      
      /* Info Box */
      .info-box {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: #eff6ff;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      
      .info-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      
      .info-content {
        font-size: 14px;
        line-height: 1.5;
        color: #1e40af;
      }
      
      /* Artikel Overview */
      .artikel-overview {
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      
      .artikel-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .artikel-chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      
      .chip-icon {
        font-size: 18px;
      }
      
      .chip-name {
        font-size: 13px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .chip-type {
        padding: 2px 6px;
        background: #e0e7ff;
        color: #3730a3;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
      }
      
      /* Status Message */
      .status-message {
        animation: slideDown 0.3s ease-out;
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .multi-header {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
        
        .btn-calculate {
          width: 100%;
        }
        
        .artikel-chips {
          flex-direction: column;
        }
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderMultiArtikelPlanning
};
