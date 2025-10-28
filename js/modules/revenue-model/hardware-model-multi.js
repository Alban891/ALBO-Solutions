/**
 * MULTI-ARTIKEL PLANNING - SMART VERSION
 * Verwendet bestehende Model-Dateien für jeden Artikel-Typ
 */

import { renderHardwareModel } from './hardware-model.js';
import { renderSoftwareModel } from './software-model.js';
import { renderServiceModel } from './service-model.js';
import { renderPackageModel } from './package-model.js';
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
          <span class="artikel-count">${artikelList.length} Artikel</span>
        </div>
        <button class="btn-update-portfolio" id="btn-update-portfolio">
          🔄 Portfolio aktualisieren
        </button>
      </div>
      
      <!-- Info Box -->
      <div class="info-box">
        <div class="info-icon">💡</div>
        <div class="info-content">
          <strong>Portfolio-Planung:</strong> Jeder Artikel verwendet sein spezifisches Model. Änderungen aktualisieren automatisch die Portfolio-Tabelle unten.
        </div>
      </div>
      
      <!-- Artikel Model Blocks -->
      <div class="artikel-models">
        ${artikelList.map((artikel, index) => renderArtikelModelBlock(artikel, index)).join('')}
      </div>
      
    </div>
    
    ${renderMultiStyles()}
  `;
  
  // Store artikel references
  window._multiArtikelList = artikelList;
  
  // Render each artikel's model
  artikelList.forEach((artikel, index) => {
    renderArtikelModel(artikel, `model-content-${artikel.id}`);
  });
  
  // Attach event listeners
  attachEventListeners();
  
  // Auto-calculate portfolio
  setTimeout(() => {
    updatePortfolioForecast();
  }, 500);
}

// ==========================================
// RENDER ARTIKEL MODEL BLOCK
// ==========================================

function renderArtikelModelBlock(artikel, index) {
  const icon = getArtikelIcon(artikel.typ);
  const isExpanded = index === 0; // First artikel expanded by default
  
  return `
    <div class="artikel-model-block" data-artikel-id="${artikel.id}">
      
      <!-- Artikel Header -->
      <div class="artikel-model-header" onclick="window.toggleArtikelModel('${artikel.id}')">
        <div class="artikel-model-title">
          <span class="model-icon">${icon}</span>
          <span class="model-name">${artikel.name}</span>
          <span class="model-type-badge">${artikel.typ}</span>
        </div>
        <button class="btn-collapse-model">
          <span id="collapse-icon-${artikel.id}">${isExpanded ? '▼' : '▶'}</span>
        </button>
      </div>
      
      <!-- Artikel Model Content -->
      <div class="artikel-model-content" id="content-${artikel.id}" style="display: ${isExpanded ? 'block' : 'none'};">
        <div id="model-content-${artikel.id}" class="model-container"></div>
      </div>
      
    </div>
  `;
}

// ==========================================
// RENDER ARTIKEL MODEL (TYPE-SPECIFIC)
// ==========================================

function renderArtikelModel(artikel, containerId) {
  console.log(`🎨 Rendering ${artikel.typ} model for:`, artikel.name);
  
  const typ = artikel.typ;
  
  // Route to correct model based on type
  try {
    switch (typ) {
      case 'Hardware':
        renderHardwareModel(artikel, containerId);
        break;
        
      case 'Software':
      case 'Software-Perpetual':
        if (typeof renderSoftwareModel === 'function') {
          renderSoftwareModel(artikel, containerId);
        } else {
          console.warn('⚠️ Software model not available, using fallback');
          renderFallbackModel(artikel, containerId);
        }
        break;
        
      case 'Service':
      case 'Beratung':
        if (typeof renderServiceModel === 'function') {
          renderServiceModel(artikel, containerId);
        } else {
          console.warn('⚠️ Service model not available, using fallback');
          renderFallbackModel(artikel, containerId);
        }
        break;
        
      case 'Package':
        if (typeof renderPackageModel === 'function') {
          renderPackageModel(artikel, containerId);
        } else {
          console.warn('⚠️ Package model not available, using fallback');
          renderFallbackModel(artikel, containerId);
        }
        break;
        
      default:
        console.warn(`⚠️ Unknown type: ${typ}, using Hardware model as fallback`);
        renderHardwareModel(artikel, containerId);
    }
    
    // Attach update listener to this model
    attachModelUpdateListener(artikel.id);
    
  } catch (error) {
    console.error(`❌ Error rendering model for ${artikel.name}:`, error);
    renderFallbackModel(artikel, containerId);
  }
}

// ==========================================
// FALLBACK MODEL (wenn Model nicht verfügbar)
// ==========================================

function renderFallbackModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div style="padding: 40px; text-align: center; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px;">
      <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
      <h3 style="margin: 0 0 8px; color: #92400e;">Model nicht verfügbar</h3>
      <p style="margin: 0; color: #78350f; font-size: 14px;">
        Das ${artikel.typ}-Model konnte nicht geladen werden.<br>
        Verwenden Sie das Hardware-Model als Alternative.
      </p>
      <button onclick="window.renderHardwareModelFallback('${artikel.id}', '${containerId}')" 
              style="margin-top: 16px; padding: 8px 16px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer;">
        Hardware-Model laden
      </button>
    </div>
  `;
}

window.renderHardwareModelFallback = function(artikelId, containerId) {
  const artikel = window._multiArtikelList.find(a => a.id === artikelId);
  if (artikel) {
    renderHardwareModel(artikel, containerId);
    attachModelUpdateListener(artikelId);
  }
};

// ==========================================
// MODEL UPDATE LISTENER
// ==========================================

function attachModelUpdateListener(artikelId) {
  // Override calculate functions to trigger portfolio update
  const originalCalculate = window.calculateHardwareForecast;
  
  // Wrap calculation with portfolio update
  window[`calculateFor_${artikelId}`] = function() {
    // Call original calculate
    if (typeof originalCalculate === 'function') {
      originalCalculate();
    }
    
    // Update portfolio after a short delay
    setTimeout(() => {
      updatePortfolioForecast();
    }, 100);
  };
  
  // Monitor inputs in this model's container
  const modelContainer = document.getElementById(`model-content-${artikelId}`);
  if (modelContainer) {
    // Add change listeners to all inputs
    modelContainer.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', () => {
        setTimeout(() => {
          updatePortfolioForecast();
        }, 100);
      });
    });
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachEventListeners() {
  // Update portfolio button
  const updateBtn = document.getElementById('btn-update-portfolio');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      updatePortfolioForecast();
    });
  }
}

// ==========================================
// UPDATE PORTFOLIO FORECAST
// ==========================================

function updatePortfolioForecast() {
  console.log('📊 Updating Portfolio Forecast...');
  
  const artikelList = window._multiArtikelList;
  if (!artikelList || artikelList.length === 0) return;
  
  // Collect forecasts from all artikel
  const forecasts = [];
  
  artikelList.forEach(artikel => {
    let forecast = null;
    
    // Try to get forecast from artikel data
    if (artikel.hardware_model_data && artikel.hardware_model_data.forecast) {
      forecast = artikel.hardware_model_data.forecast;
    }
    
    // Fallback: Create default forecast if none exists
    if (!forecast) {
      console.warn(`⚠️ No forecast for ${artikel.name}, creating default...`);
      forecast = createDefaultForecast(artikel);
    }
    
    forecasts.push(forecast);
  });
  
  if (forecasts.length === 0) {
    console.warn('⚠️ No forecasts available');
    return;
  }
  
  console.log(`✅ Collected ${forecasts.length} forecasts`);
  
  // Render combined forecast table
  renderMultiForecastTable(forecasts, 'forecast-table-container');
}

// ==========================================
// CREATE DEFAULT FORECAST
// ==========================================

function createDefaultForecast(artikel) {
  const startYear = new Date().getFullYear();
  const years = 5;
  const defaults = getDefaultValues(artikel.typ);
  
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
  
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    forecast.years.push(year);
    
    const volume = defaults.volume * Math.pow(1.05, i);
    const price = defaults.price;
    const cost = defaults.cost * Math.pow(0.95, i);
    
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
// COLLAPSE/EXPAND
// ==========================================

window.toggleArtikelModel = function(artikelId) {
  const content = document.getElementById(`content-${artikelId}`);
  const icon = document.getElementById(`collapse-icon-${artikelId}`);
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '▼';
  } else {
    content.style.display = 'none';
    icon.textContent = '▶';
  }
};

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

function getDefaultValues(typ) {
  const defaults = {
    'Hardware': { volume: 1000, price: 50, cost: 20 },
    'Software': { volume: 100, price: 800, cost: 200 },
    'Software-Perpetual': { volume: 50, price: 2000, cost: 400 },
    'Service': { volume: 50, price: 1500, cost: 500 },
    'Beratung': { volume: 10, price: 250000, cost: 100000 },
    'Package': { volume: 20, price: 5000, cost: 2000 }
  };
  return defaults[typ] || defaults['Hardware'];
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
      
      .btn-update-portfolio {
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
      
      .btn-update-portfolio:hover {
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
      
      /* Artikel Model Blocks */
      .artikel-models {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .artikel-model-block {
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        background: white;
        overflow: hidden;
      }
      
      .artikel-model-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .artikel-model-header:hover {
        background: linear-gradient(135deg, #5568d3 0%, #6a3e8e 100%);
      }
      
      .artikel-model-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .model-icon {
        font-size: 24px;
      }
      
      .model-name {
        font-size: 16px;
        font-weight: 700;
      }
      
      .model-type-badge {
        padding: 4px 10px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }
      
      .btn-collapse-model {
        padding: 6px 12px;
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-collapse-model:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .artikel-model-content {
        padding: 0;
      }
      
      .model-container {
        /* Models render their own styling */
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .multi-header {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
        
        .btn-update-portfolio {
          width: 100%;
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
