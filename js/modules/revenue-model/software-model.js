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

// ✅ Determine which modes to show
const data = artikel.software_model_data;

// Check revenue streams
const revenueStreams = artikel.revenue_streams || [];
const hasOneTimeSale = revenueStreams.includes('one_time_sale');
const hasSubscription = revenueStreams.includes('subscription');

// Check artikel name/typ for indicators
const artikelName = (artikel.name || '').toLowerCase();
const artikelTyp = (artikel.typ || '').toLowerCase();

console.log('📊 Software Article:', artikel.name);
console.log('   Revenue Streams:', revenueStreams);
console.log('   Name contains "subscription":', artikelName.includes('subscription'));
console.log('   Name contains "one time":', artikelName.includes('one time'));

// Determine mode
if (revenueStreams.length === 0) {
  // NO STREAMS → Check name for indicators
  
  if (artikelName.includes('subscription') || artikelName.includes('saas')) {
    // Name indicates subscription
    data.license_mode = 'saas';
    data.show_toggle = false;
    console.log('   → Detected SUBSCRIPTION from name');
    
  } else if (artikelName.includes('one time') || artikelName.includes('perpetual')) {
    // Name indicates one-time
    data.license_mode = 'perpetual';
    data.show_toggle = false;
    console.log('   → Detected ONE-TIME from name');
    
  } else {
    // Standard software → Perpetual only
    data.license_mode = 'perpetual';
    data.show_toggle = false;
    console.log('   → No streams, default to PERPETUAL only');
  }
  
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
  // FALLBACK
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
  // Initialize COGS mode if not set
  if (!data.cogs_mode) data.cogs_mode = 'percent';
  
  return `
    <!-- Perpetual Mode -->
    <div class="section-compact">
      <h3 class="section-title-compact">📊 Startwerte (Jahr 1)</h3>
      
      <!-- License Inputs -->
      <div class="input-row-compact">
        <div class="input-group-compact">
          <label>
            New License Units
            <span class="tooltip-icon" title="Anzahl verkaufter Lizenzen im ersten Jahr">ℹ️</span>
          </label>
          <input type="text" id="sw-licenses" value="${formatNumberWithDots(data.licenses_year1)}" class="input-compact" placeholder="100">
        </div>
        
        <div class="input-group-compact">
          <label>
            License Price (€)
            <span class="tooltip-icon" title="Verkaufspreis pro Lizenz">ℹ️</span>
          </label>
          <input type="text" id="sw-price" value="${formatNumberWithDots(data.license_price)}" class="input-compact" placeholder="5000">
        </div>
        
        <div class="input-group-compact">
          <label>
            License COGS
            <span class="tooltip-icon" title="Herstellkosten pro Lizenz (Cloud, Onboarding, Support)">ℹ️</span>
          </label>
          
          <!-- COGS Mode Toggle -->
          <div class="cogs-mode-toggle">
            <button class="cogs-mode-btn ${data.cogs_mode === 'percent' ? 'active' : ''}" data-mode="percent">
              %
            </button>
            <button class="cogs-mode-btn ${data.cogs_mode === 'absolute' ? 'active' : ''}" data-mode="absolute">
              €
            </button>
          </div>
          
          ${data.cogs_mode === 'percent' ? `
            <!-- Percentage Input -->
            <input type="number" id="sw-cogs-percent" value="${data.license_cogs_percent || 10}" 
                   class="input-compact" placeholder="10" max="100" step="0.1">
            <small style="font-size: 10px; color: #6b7280; margin-top: 2px;">
              Standard: 8-12% | Bei 5.000€ → ${formatCurrency((data.license_price || 5000) * 0.1)}
            </small>
          ` : `
            <!-- Absolute Input -->
           <input type="text" id="sw-cogs-absolute" value="${formatNumberWithDots(data.license_cogs_absolute || 500)}" 
       class="input-compact" placeholder="500">
            <small style="font-size: 10px; color: #6b7280; margin-top: 2px;">
              Direkte Kosten in € pro Lizenz
            </small>
          `}
        </div>
      </div>
      
      <!-- Quick KPIs -->
      <div class="kpis-inline">
        <span class="kpi-inline">
          <strong>License Rev J1:</strong> 
          <span id="kpi-license-revenue">-</span>
        </span>
        <span class="kpi-inline">
          <strong>License COGS J1:</strong> 
          <span id="kpi-license-cogs">-</span>
        </span>
        <span class="kpi-inline">
          <strong>DB2 J1:</strong> 
          <span id="kpi-db2" class="kpi-positive">-</span>
        </span>
        <span class="kpi-inline">
          <strong>Marge J1:</strong> 
          <span id="kpi-margin" class="kpi-positive">-</span>
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
        <span>Konservativ <small>(+5% p.a.)</small></span>
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
          <input type="text" id="saas-customers" value="${formatNumberWithDots(data.saas_customers_start)}" class="input-compact" placeholder="1.000">
        </div>
        <div class="input-group-compact">
          <label>ARR per Customer (€)</label>
          <input type="text" id="saas-arr" value="${formatNumberWithDots(data.saas_arr)}" class="input-compact" placeholder="600">
        </div>
        <div class="input-group-compact">
          <label>Cost per Customer (€)</label>
          <input type="text" id="saas-cost" value="${formatNumberWithDots(data.saas_cost)}" class="input-compact" placeholder="108">
        </div>
      </div>
      
      <div class="input-row-compact" style="margin-top: 10px;">
        <div class="input-group-compact">
          <label>New Customers p.a.</label>
          <input type="text" id="saas-new" value="${formatNumberWithDots(data.saas_new_customers)}" class="input-compact" placeholder="800">
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
    
<!-- Entwicklungsmodelle (3-Spalten) -->
<div class="section-compact">
  <h3 class="section-title-compact">📈 ENTWICKLUNGSMODELLE</h3>
  
  <div class="models-grid">
    
    <!-- Spalte 1: Customer Growth (New Customers) -->
    <div class="model-column">
      <div class="model-header">NEW CUSTOMERS</div>
      <label class="model-option">
        <input type="radio" name="saas-new-model" value="konstant" ${data.saas_new_model === 'konstant' ? 'checked' : ''}>
        <span>Konstant <small>(+0% p.a.)</small></span>
      </label>
      <label class="model-option">
        <input type="radio" name="saas-new-model" value="linear" ${data.saas_new_model === 'linear' ? 'checked' : ''}>
        <span>Linear <small>(gleich)</small></span>
      </label>
      <label class="model-option">
        <input type="radio" name="saas-new-model" value="degressiv" ${data.saas_new_model === 'degressiv' ? 'checked' : ''}>
        <span>Degressiv <small>(-10% p.a.)</small></span>
      </label>
      <label class="model-option">
        <input type="radio" name="saas-new-model" value="aggressiv" ${data.saas_new_model === 'aggressiv' ? 'checked' : ''}>
        <span>Aggressiv <small>(+20% p.a.)</small></span>
      </label>
      <label class="model-option">
        <input type="radio" name="saas-new-model" value="manuell" ${data.saas_new_model === 'manuell' ? 'checked' : ''}>
        <span style="color: #6b7280;">Manuell</span>
      </label>
      ${data.saas_new_model === 'manuell' ? `
        <button class="btn-manual-edit" id="btn-edit-new-manual" style="margin-top: 8px;">
            ✏️ Neue Kunden bearbeiten
        </button>
        ` : ''}
    </div>
    
    <!-- Spalte 2: ARR Development -->
    <div class="model-column">
      <div class="model-header">ARR ENTWICKLUNG</div>
      <label class="model-option">
        <input type="radio" name="saas-arr-model" value="konstant" ${data.saas_arr_model === 'konstant' ? 'checked' : ''}>
        <span>Konstant <small>(0% p.a.)</small></span>
      </label>
      <label class="model-option">
        <input type="radio" name="saas-arr-model" value="expansion" ${data.saas_arr_model === 'expansion' ? 'checked' : ''}>
        <span>Expansion <small>(+5% p.a.)</small></span>
      </label>
      <label class="model-option">
        <input type="radio" name="saas-arr-model" value="premium" ${data.saas_arr_model === 'premium' ? 'checked' : ''}>
        <span>Premium <small>(+10% p.a.)</small></span>
      </label>
      <label class="model-option">
        <input type="radio" name="saas-arr-model" value="manuell" ${data.saas_arr_model === 'manuell' ? 'checked' : ''}>
        <span style="color: #6b7280;">Manuell</span>
      </label>
      ${data.saas_arr_model === 'manuell' ? `
    <button class="btn-manual-edit" id="btn-edit-arr-manual" style="margin-top: 8px;">
        ✏️ ARR-Werte bearbeiten
    </button>
    ` : ''}
    </div>
    
    <!-- Spalte 3: Churn Rate -->
    <div class="model-column">
    <div class="model-header">CHURN RATE</div>
    <label class="model-option">
        <input type="radio" name="saas-churn-model" value="konstant" ${data.saas_churn_model === 'konstant' ? 'checked' : ''}>
        <span>Konstant <small>(gleich)</small></span>
    </label>
    <label class="model-option">
        <input type="radio" name="saas-churn-model" value="verbesserung" ${data.saas_churn_model === 'verbesserung' ? 'checked' : ''}>
        <span>Verbesserung <small>(-2% p.a.)</small></span>
    </label>
    <label class="model-option">
        <input type="radio" name="saas-churn-model" value="manuell" ${data.saas_churn_model === 'manuell' ? 'checked' : ''}>
        <span style="color: #6b7280;">Manuell</span>
    </label>
    
    ${data.saas_churn_model === 'manuell' ? `
        <button class="btn-manual-edit" id="btn-edit-churn-manual" style="margin-top: 8px;">
        ✏️ Churn-Raten bearbeiten
        </button>
    ` : ''}
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
    license_mode: 'perpetual',
    
    // Perpetual Mode
   licenses_year1: 100,
    license_price: 5000,
    cogs_mode: 'percent',              // ✅ NEU: 'percent' oder 'absolute'
    license_cogs_percent: 10,          // ✅ Für % Mode
    license_cogs_absolute: 500,        // ✅ Für € Mode
    volume_model: 'konservativ',
    price_model: 'konstant',
    cost_model: 'konstant',
    
    // SaaS Mode
    saas_customers_start: 1000,
    saas_arr: 600,
    saas_cost: 108,
    saas_new_customers: 800,
    saas_churn_rate: 15,
    saas_expansion_rate: 5,
    saas_new_model: 'linear',
    saas_arr_model: 'expansion',
    saas_churn_model: 'konstant',
    
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
  // COGS Mode Toggle
  document.querySelectorAll('.cogs-mode-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const mode = this.dataset.mode;
      const artikel = window._currentArtikel;
      
      if (!artikel) return;
      
      // Update mode
      artikel.software_model_data.cogs_mode = mode;
      
      // Re-render perpetual content
      const modeContentContainer = document.getElementById('sw-mode-content');
      if (modeContentContainer) {
        modeContentContainer.innerHTML = renderPerpetualContent(artikel.software_model_data);
        
        // Re-attach listeners
        attachPerpetualListeners();
        
        // Recalculate
        window.calculateSoftwareForecast();
      }
    });
  });
  
  // ✅ Number formatting for integer inputs
  attachNumberFormatting('sw-licenses');
  attachNumberFormatting('sw-price');
  
  // Input listeners
  const artikel = window._currentArtikel;
  const cogsMode = artikel?.software_model_data?.cogs_mode || 'percent';
  
  // ✅ Format absolute COGS if in absolute mode
  if (cogsMode === 'absolute') {
    attachNumberFormatting('sw-cogs-absolute');
  }
  
  const inputs = [
    'sw-licenses', 
    'sw-price', 
    cogsMode === 'percent' ? 'sw-cogs-percent' : 'sw-cogs-absolute'
  ];
  
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
  // ✅ Attach number formatting for INTEGER inputs
  attachNumberFormatting('saas-customers');
  attachNumberFormatting('saas-arr');
  attachNumberFormatting('saas-cost');
  attachNumberFormatting('saas-new');
  
  // Input listeners
  const inputs = [
    'saas-customers', 
    'saas-arr', 
    'saas-cost', 
    'saas-new', 
    'saas-churn', 
    'saas-expansion'
  ];
  
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
  const artikel = window._currentArtikel;
  if (!artikel) return;
  
  const cogsMode = artikel.software_model_data.cogs_mode || 'percent';
  
  // ✅ Get raw numbers (remove thousand separators)
  const licenses = getRawNumberFromInput(document.getElementById('sw-licenses'));
  const price = getRawNumberFromInput(document.getElementById('sw-price'));
  
// Calculate COGS based on mode
  let cogs;
  if (cogsMode === 'percent') {
    const cogsPercent = parseFloat(document.getElementById('sw-cogs-percent')?.value) || 10;
    cogs = (licenses * price) * (cogsPercent / 100);
  } else {
    // ✅ Get raw number for absolute COGS
    const cogsAbsolute = getRawNumberFromInput(document.getElementById('sw-cogs-absolute'));
    cogs = licenses * cogsAbsolute;
  }
  
  // Revenue
  const licenseRev = licenses * price;
  
  // DB2
  const db2 = licenseRev - cogs;
  const margin = licenseRev > 0 ? (db2 / licenseRev) * 100 : 0;
  
  // Update KPIs
  document.getElementById('kpi-license-revenue').textContent = formatCurrency(licenseRev);
  document.getElementById('kpi-license-cogs').textContent = formatCurrency(cogs);
  document.getElementById('kpi-db2').textContent = formatCurrency(db2);
  document.getElementById('kpi-margin').textContent = formatNumber(margin, 1) + '%';
}

function updateSaaSKPIs() {
  // ✅ Get raw numbers (remove thousand separators)
  const customers = getRawNumberFromInput(document.getElementById('saas-customers'));
  const arr = getRawNumberFromInput(document.getElementById('saas-arr'));
  const cost = getRawNumberFromInput(document.getElementById('saas-cost'));
  
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
    forecast.volume_model = artikel.software_model_data.volume_model;  // ✅ RICHTIG
    forecast.price_model = artikel.software_model_data.price_model;
    forecast.cost_model = artikel.software_model_data.cost_model; 
    
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
    parameters.license_cogs_percent = data.license_cogs_percent;
    parameters.license_cogs_absolute = data.license_cogs_absolute;
    parameters.cogs_mode = data.cogs_mode;
    parameters.volume_model = data.volume_model;  // ✅ RICHTIG
    parameters.price_model = data.price_model;
    parameters.cost_model = data.cost_model;      // ✅ NEU!
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
    licenses_year1: getRawNumberFromInput(document.getElementById('sw-licenses')),
    license_price: getRawNumberFromInput(document.getElementById('sw-price')),
    license_cogs_percent: parseFloat(document.getElementById('sw-cogs-percent')?.value) || 10,
    license_cogs_absolute: getRawNumberFromInput(document.getElementById('sw-cogs-absolute')),
    cogs_mode: artikel.software_model_data.cogs_mode || 'percent',
    volume_model: document.querySelector('input[name="volume-model"]:checked')?.value || 'konstant',
    price_model: document.querySelector('input[name="price-model"]:checked')?.value || 'konstant',
    cost_model: document.querySelector('input[name="cost-model"]:checked')?.value || 'konstant'
  };
  
  // ✅ WICHTIG: Speichere aktuelle Werte zurück in artikel.software_model_data
  Object.assign(artikel.software_model_data, data);
  
  if (!data.licenses_year1) return null;
  
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    name: artikel.name || 'Software',
    type: 'software',
    volume_model: data.volume_model,  // ✅ RICHTIG
    price_model: data.price_model,    // ✅ OK
    cost_model: data.cost_model,      // ✅ RICHTIG
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
    forecast.years.push(startYear + i);
    
    // New licenses
    const newLicenses = calculateLicenses(data.licenses_year1, data.volume_model, i);
    const licensePrice = calculatePrice(data.license_price, data.price_model, i);
    const unitCost = calculateCost(data.license_cogs_absolute || 500, data.cost_model, i);
    
    // License revenue
    const licenseRevenue = newLicenses * licensePrice;
    
   // Total revenue (no maintenance in single mode)
    const totalRevenue = licenseRevenue;
    
   // Costs - based on COGS mode
    let licenseCost;
    if (data.cogs_mode === 'percent') {
    licenseCost = licenseRevenue * (data.license_cogs_percent / 100);
    } else {
    licenseCost = newLicenses * data.license_cogs_absolute;
    }

    const totalCost = licenseCost;
    
    // DB2
    const db2 = totalRevenue - totalCost;
    const db2Margin = totalRevenue > 0 ? (db2 / totalRevenue) * 100 : 0;
    
    forecast.volume.push(newLicenses);
    forecast.price.push(licensePrice);
    forecast.cost.push(licenseCost / newLicenses);  // ← COGS pro Einheit
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
    
    // ✅ Get formatted inputs
    saas_customers_start: getRawNumberFromInput(document.getElementById('saas-customers')),
    saas_arr: getRawNumberFromInput(document.getElementById('saas-arr')),
    saas_cost: getRawNumberFromInput(document.getElementById('saas-cost')),
    saas_new_customers: getRawNumberFromInput(document.getElementById('saas-new')),
    
    // ✅ Percentages stay as number inputs
    saas_churn_rate: parseFloat(document.getElementById('saas-churn')?.value) || 0,
    saas_expansion_rate: parseFloat(document.getElementById('saas-expansion')?.value) || 0,
    
    // ✅ NEW: Read model selections
    saas_new_model: document.querySelector('input[name="saas-new-model"]:checked')?.value || 'linear',
    saas_arr_model: document.querySelector('input[name="saas-arr-model"]:checked')?.value || 'expansion',
    saas_churn_model: document.querySelector('input[name="saas-churn-model"]:checked')?.value || 'konstant'
  };
  
  // ✅ WICHTIG: Speichere aktuelle Werte zurück in artikel.software_model_data
  Object.assign(artikel.software_model_data, data);
  
  if (!data.saas_customers_start) return null;
  
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    name: artikel.name || 'SaaS',
    type: 'subscription',
    volume_model: data.saas_new_model,     // ✅ NEW
    price_model: data.saas_arr_model,      // ✅ NEW
    cost_model: data.saas_churn_model,     // ✅ NEW (Churn in cost_model speichern)
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
  const initialARR = data.saas_arr;
  
for (let i = 0; i < years; i++) {
  forecast.years.push(startYear + i);
  
  // ✅ Jahr 1 = Start (keine New Customers, kein Churn)
  if (i === 0) {
    // Jahr 1: Nur Startwerte
    const currentARR = calculateARRModel(initialARR, data.saas_arr_model, 0);
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
    
    continue;  // Skip to next year
  }
  
  // ✅ Ab Jahr 2: Growth Modelle anwenden
  const newCustomers = calculateNewCustomersModel(data.saas_new_customers, data.saas_new_model, i - 1);
  const currentARR = calculateARRModel(initialARR, data.saas_arr_model, i);
  const churnRate = calculateChurnModel(data.saas_churn_rate, data.saas_churn_model, i - 1);
  
  // Churn calculation
  const churnedCustomers = totalCustomers * (churnRate / 100);
  
  // Net new customers
  totalCustomers = totalCustomers + newCustomers - churnedCustomers;
    
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
    case 'realistisch':
      // S-Kurve: Sigmoid function
      const t = yearIndex / 5;
      const multiplier = 1 / (1 + Math.exp(-10 * (t - 0.5)));
      return startLicenses * (1 + multiplier * 0.5);
    case 'optimistisch':
      // Hockey-Stick: Exponentielles Wachstum
      return startLicenses * Math.pow(1.15, yearIndex);
    case 'manuell':
      // TODO: Manuelle Werte implementieren
      return startLicenses;
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
    case 'deflation':
      return startPrice * Math.pow(0.97, yearIndex);
    case 'manuell':
      // TODO: Manuelle Werte implementieren
      return startPrice;
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
      // Lernkurve: -5% bei Verdopplung
      return startCost * Math.pow(0.95, yearIndex);
    case 'steigend':
      return startCost * Math.pow(1.05, yearIndex);
    case 'manuell':
      // TODO: Manuelle Werte implementieren
      return startCost;
    default:
      return startCost;
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
// SAAS MODEL CALCULATIONS
// ==========================================

function calculateNewCustomersModel(baseNew, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return baseNew;
    case 'linear':
      return baseNew;  // Gleich wie konstant
    case 'degressiv':
      return baseNew * Math.pow(0.9, yearIndex);  // -10% p.a.
    case 'aggressiv':
      return baseNew * Math.pow(1.2, yearIndex);  // +20% p.a.
    case 'manuell':
      // TODO: Manuelle Werte implementieren
      return baseNew;
    default:
      return baseNew;
  }
}

function calculateARRModel(baseARR, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return baseARR;
    case 'expansion':
      return baseARR * Math.pow(1.05, yearIndex);  // +5% p.a.
    case 'premium':
      return baseARR * Math.pow(1.10, yearIndex);  // +10% p.a.
    case 'manuell':
      // TODO: Manuelle Werte implementieren
      return baseARR;
    default:
      return baseARR;
  }
}

function calculateChurnModel(baseChurn, model, yearIndex) {
  switch (model) {
    case 'konstant':
      return baseChurn;
    case 'verbesserung':
      // Churn Rate sinkt um 2 Prozentpunkte pro Jahr
      // z.B. 15% → 13% → 11% → 9%...
      const newChurn = baseChurn - (2 * yearIndex);
      return Math.max(newChurn, 2);  // Minimum 2%
    case 'manuell':
      // TODO: Manuelle Werte implementieren
      return baseChurn;
    default:
      return baseChurn;
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

function formatNumberWithDots(value) {
  if (!value || value === 0) return '0';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ==========================================
// INPUT FORMATTING HELPERS
// ==========================================

/**
 * Format number input with thousand separators (German format)
 */
function formatNumberInput(input) {
  if (!input) return;
  
  // Get raw value (remove all dots and commas)
  let value = input.value.replace(/[.,]/g, '');
  
  // If empty, return
  if (value === '') {
    input.value = '';
    return;
  }
  
  // Parse as number
  let num = parseInt(value, 10);
  
  // If not a valid number, return
  if (isNaN(num)) {
    input.value = '';
    return;
  }
  
  // Format with DOT as thousand separator (German style: 4.000)
  input.value = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Get raw number from formatted input
 */
function getRawNumberFromInput(input) {
  if (!input) return 0;
  
  // Remove thousand separators and parse
  const value = input.value.replace(/\./g, '');
  const num = parseInt(value, 10);
  
  return isNaN(num) ? 0 : num;
}

/**
 * Attach number formatting to input field
 */
function attachNumberFormatting(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  // Format on blur (when user leaves field)
  input.addEventListener('blur', function() {
    formatNumberInput(this);
  });
  
  // Allow only digits and dots while typing
  input.addEventListener('input', function(e) {
    // Remove any non-digit characters except dots
    let value = this.value.replace(/[^\d.]/g, '');
    this.value = value;
  });
  
  // Format initial value if it exists
  if (input.value) {
    formatNumberInput(input);
  }
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

    /* COGS Mode Toggle */
.cogs-mode-toggle {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px;
  background: #f9fafb;
}

.cogs-mode-btn {
  flex: 1;
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  background: transparent;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.cogs-mode-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.cogs-mode-btn.active {
  background: #3b82f6;
  color: white;
}

.cogs-mode-btn.active {
  background: #3b82f6;
  color: white;
}

/* Manual Edit Button */
.btn-manual-edit {
  width: 100%;
  padding: 6px 10px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-manual-edit:hover {
  background: #e5e7eb;
  border-color: #3b82f6;
  color: #1e40af;
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
