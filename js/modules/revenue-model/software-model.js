/**
 * SOFTWARE MODEL
 * Software-Lizenzen (Perpetual & Subscription) mit Maintenance
 * 
 * Use Cases:
 * - Perpetual License + jährliche Maintenance (18-22%)
 * - Subscription/SaaS (monatlich/jährlich)
 * - Hybrid (Mix aus beiden)
 * 
 * Features:
 * - License Types (Named, Concurrent, Site)
 * - Maintenance Revenue
 * - Upgrade Cycles
 * - Renewal Rates
 */

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export function renderSoftwareModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('💿 Rendering Software Model for:', artikel.name);
  
  // Initialize software data
  if (!artikel.software_model_data) {
    artikel.software_model_data = initializeSoftwareData(artikel);
  }
  
  const data = artikel.software_model_data;
  
  container.innerHTML = `
    <div class="software-model-container">
      
      <!-- Header -->
      <div class="software-header">
        <div>
          <h2 class="software-title">💿 ${artikel.name}</h2>
          <p class="software-subtitle">Software License Revenue Model</p>
        </div>
        <div class="software-badge">${data.license_type === 'perpetual' ? 'Perpetual' : 'Subscription'}</div>
      </div>
      
      <!-- Zeitrahmen -->
      <div class="section-card">
        <h3 class="section-title">⏱️ Zeitrahmen</h3>
        <div class="input-row">
          <div class="input-group">
            <label class="input-label">Startdatum</label>
            <input 
              type="month" 
              id="sw-date" 
              value="${data.release_date}"
              class="form-input"
            >
          </div>
          <div class="input-group">
            <label class="input-label">Planungshorizont</label>
            <div class="horizon-buttons">
              <button class="horizon-btn ${data.time_horizon === 3 ? 'active' : ''}" data-years="3">3 Jahre</button>
              <button class="horizon-btn ${data.time_horizon === 5 ? 'active' : ''}" data-years="5">5 Jahre</button>
              <button class="horizon-btn ${data.time_horizon === 7 ? 'active' : ''}" data-years="7">7 Jahre</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- License Type Selection -->
      <div class="section-card">
        <h3 class="section-title">📜 Lizenzmodell</h3>
        <div class="license-type-selector">
          <div 
            class="license-type-card ${data.license_type === 'perpetual' ? 'active' : ''}" 
            onclick="window.selectLicenseType('perpetual')"
          >
            <div class="license-type-icon">📦</div>
            <div class="license-type-name">Perpetual License</div>
            <div class="license-type-desc">Einmalzahlung + jährliche Maintenance</div>
          </div>
          <div 
            class="license-type-card ${data.license_type === 'subscription' ? 'active' : ''}" 
            onclick="window.selectLicenseType('subscription')"
          >
            <div class="license-type-icon">🔄</div>
            <div class="license-type-name">Subscription/SaaS</div>
            <div class="license-type-desc">Wiederkehrende monatliche/jährliche Zahlung</div>
          </div>
        </div>
      </div>
      
      <!-- Perpetual License Settings -->
      <div id="perpetual-settings" style="display: ${data.license_type === 'perpetual' ? 'block' : 'none'};">
        ${renderPerpetualSettings(data)}
      </div>
      
      <!-- Subscription Settings -->
      <div id="subscription-settings" style="display: ${data.license_type === 'subscription' ? 'block' : 'none'};">
        ${renderSubscriptionSettings(data)}
      </div>
      
      <!-- Actions -->
      <div class="action-buttons">
        <button class="btn btn-secondary" onclick="window.resetSoftwareModel()">
          🔄 Zurücksetzen
        </button>
        <button class="btn btn-primary" onclick="window.calculateSoftwareModel()">
          📊 Berechnen & Vorschau
        </button>
      </div>
      
      <!-- Preview -->
      <div id="software-preview" class="preview-container"></div>
      
    </div>
    
    ${renderSoftwareStyles()}
  `;
  
  // Attach event listeners
  attachSoftwareEventListeners(artikel);
}

// ==========================================
// PERPETUAL LICENSE SETTINGS
// ==========================================

function renderPerpetualSettings(data) {
  return `
    <div class="section-card">
      <h3 class="section-title">💰 Perpetual License Preise</h3>
      
      <div class="input-row">
        <div class="input-group">
          <label class="input-label">License-Preis (€)</label>
          <input 
            type="number" 
            id="sw-license-price" 
            value="${data.perpetual.license_price}"
            class="form-input"
            placeholder="5000"
            step="100"
          >
          <span class="input-hint">Einmaliger Kaufpreis pro Lizenz</span>
        </div>
        
        <div class="input-group">
          <label class="input-label">Herstellkosten (€)</label>
          <input 
            type="number" 
            id="sw-license-cost" 
            value="${data.perpetual.license_cost}"
            class="form-input"
            placeholder="500"
            step="50"
          >
          <span class="input-hint">Einmalige Kosten (Verpackung, Medium, etc.)</span>
        </div>
      </div>
      
      <div class="kpi-display">
        <span class="kpi-label">License DB2:</span>
        <span class="kpi-value" id="license-db2">
          ${formatCurrency(data.perpetual.license_price - data.perpetual.license_cost)}
        </span>
      </div>
    </div>
    
    <div class="section-card">
      <h3 class="section-title">🔧 Maintenance/Support</h3>
      
      <div class="input-row">
        <div class="input-group">
          <label class="input-label">Maintenance Rate (%)</label>
          <input 
            type="number" 
            id="sw-maintenance-rate" 
            value="${data.perpetual.maintenance_rate}"
            class="form-input"
            placeholder="20"
            min="0"
            max="100"
            step="1"
          >
          <span class="input-hint">Standard: 18-22% vom License-Preis p.a.</span>
        </div>
        
        <div class="input-group">
          <label class="input-label">Renewal Rate (%)</label>
          <input 
            type="number" 
            id="sw-renewal-rate" 
            value="${data.perpetual.renewal_rate}"
            class="form-input"
            placeholder="95"
            min="0"
            max="100"
            step="1"
          >
          <span class="input-hint">Wie viele Kunden erneuern jährlich?</span>
        </div>
      </div>
      
      <div class="maintenance-calc">
        <span class="calc-label">Jährliche Maintenance pro Lizenz:</span>
        <span class="calc-value" id="maintenance-annual">
          ${formatCurrency(data.perpetual.license_price * (data.perpetual.maintenance_rate / 100))}
        </span>
      </div>
    </div>
    
    <div class="section-card">
      <h3 class="section-title">📦 Volumen & Entwicklung</h3>
      
      <div class="input-row">
        <div class="input-group">
          <label class="input-label">Neue Lizenzen Jahr 1</label>
          <input 
            type="number" 
            id="sw-volume-year1" 
            value="${data.volume_year1}"
            class="form-input"
            placeholder="100"
          >
          <span class="input-hint">Anzahl verkaufter Lizenzen</span>
        </div>
        
        <div class="input-group">
          <label class="input-label">Wachstumsmodell</label>
          <select id="sw-growth-model" class="form-select">
            <option value="konstant" ${data.growth_model === 'konstant' ? 'selected' : ''}>Konstant (0%)</option>
            <option value="konservativ" ${data.growth_model === 'konservativ' ? 'selected' : ''}>Konservativ (+5%)</option>
            <option value="realistisch" ${data.growth_model === 'realistisch' ? 'selected' : ''}>Realistisch (S-Kurve)</option>
            <option value="optimistisch" ${data.growth_model === 'optimistisch' ? 'selected' : ''}>Optimistisch (+20%)</option>
          </select>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// SUBSCRIPTION SETTINGS
// ==========================================

function renderSubscriptionSettings(data) {
  return `
    <div class="section-card">
      <h3 class="section-title">💰 Subscription Preise</h3>
      
      <div class="input-row">
        <div class="input-group">
          <label class="input-label">Billing Frequency</label>
          <select id="sw-billing-freq" class="form-select">
            <option value="monthly" ${data.subscription.billing_frequency === 'monthly' ? 'selected' : ''}>Monatlich</option>
            <option value="annual" ${data.subscription.billing_frequency === 'annual' ? 'selected' : ''}>Jährlich</option>
          </select>
        </div>
        
        <div class="input-group">
          <label class="input-label">Preis pro Lizenz (€)</label>
          <input 
            type="number" 
            id="sw-sub-price" 
            value="${data.subscription.price_per_license}"
            class="form-input"
            placeholder="50"
            step="1"
          >
          <span class="input-hint" id="billing-hint">
            ${data.subscription.billing_frequency === 'monthly' ? 'Pro Monat' : 'Pro Jahr'}
          </span>
        </div>
      </div>
      
      <div class="revenue-calc">
        <span class="calc-label">ARR pro Lizenz:</span>
        <span class="calc-value" id="arr-per-license">
          ${formatCurrency(data.subscription.billing_frequency === 'monthly' 
            ? data.subscription.price_per_license * 12 
            : data.subscription.price_per_license)}
        </span>
      </div>
    </div>
    
    <div class="section-card">
      <h3 class="section-title">📊 SaaS Metriken</h3>
      
      <div class="input-row">
        <div class="input-group">
          <label class="input-label">Neue Kunden Jahr 1</label>
          <input 
            type="number" 
            id="sw-new-customers-year1" 
            value="${data.volume_year1}"
            class="form-input"
            placeholder="1200"
          >
          <span class="input-hint">Anzahl neuer Subscriptions</span>
        </div>
        
        <div class="input-group">
          <label class="input-label">Churn Rate (%)</label>
          <input 
            type="number" 
            id="sw-churn-rate" 
            value="${data.subscription.churn_rate}"
            class="form-input"
            placeholder="15"
            min="0"
            max="100"
            step="0.5"
          >
          <span class="input-hint">Jährliche Kündigungsrate</span>
        </div>
      </div>
      
      <div class="input-row">
        <div class="input-group">
          <label class="input-label">Wachstumsrate Neukunden</label>
          <select id="sw-growth-model" class="form-select">
            <option value="konstant" ${data.growth_model === 'konstant' ? 'selected' : ''}>Konstant (0%)</option>
            <option value="konservativ" ${data.growth_model === 'konservativ' ? 'selected' : ''}>Konservativ (+5%)</option>
            <option value="realistisch" ${data.growth_model === 'realistisch' ? 'selected' : ''}>Realistisch (S-Kurve)</option>
            <option value="optimistisch" ${data.growth_model === 'optimistisch' ? 'selected' : ''}>Optimistisch (+20%)</option>
          </select>
        </div>
        
        <div class="input-group">
          <label class="input-label">Expansion Revenue (%)</label>
          <input 
            type="number" 
            id="sw-expansion-rate" 
            value="${data.subscription.expansion_rate}"
            class="form-input"
            placeholder="5"
            min="0"
            max="50"
            step="0.5"
          >
          <span class="input-hint">Jährliches Upselling existierender Kunden</span>
        </div>
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
    license_type: artikel.typ === 'Software-Perpetual' ? 'perpetual' : 'subscription',
    
    perpetual: {
      license_price: 5000,
      license_cost: 500,
      maintenance_rate: 20,
      renewal_rate: 95
    },
    
    subscription: {
      billing_frequency: 'monthly',
      price_per_license: 50,
      churn_rate: 15,
      expansion_rate: 5
    },
    
    volume_year1: 100,
    growth_model: 'realistisch',
    
    calculated: false,
    forecast: null
  };
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachSoftwareEventListeners(artikel) {
  // Horizon buttons
  document.querySelectorAll('.horizon-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.horizon-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Real-time calculations for perpetual
  const licensePrice = document.getElementById('sw-license-price');
  const licenseCost = document.getElementById('sw-license-cost');
  const maintenanceRate = document.getElementById('sw-maintenance-rate');
  
  if (licensePrice && licenseCost) {
    const updateDB2 = () => {
      const price = parseFloat(licensePrice.value) || 0;
      const cost = parseFloat(licenseCost.value) || 0;
      const db2 = price - cost;
      const db2Element = document.getElementById('license-db2');
      if (db2Element) {
        db2Element.textContent = formatCurrency(db2);
      }
      
      // Update maintenance calculation
      if (maintenanceRate) {
        const rate = parseFloat(maintenanceRate.value) || 0;
        const maintenance = price * (rate / 100);
        const maintenanceElement = document.getElementById('maintenance-annual');
        if (maintenanceElement) {
          maintenanceElement.textContent = formatCurrency(maintenance);
        }
      }
    };
    
    licensePrice.addEventListener('input', updateDB2);
    licenseCost.addEventListener('input', updateDB2);
    if (maintenanceRate) {
      maintenanceRate.addEventListener('input', updateDB2);
    }
  }
  
  // Real-time calculations for subscription
  const subPrice = document.getElementById('sw-sub-price');
  const billingFreq = document.getElementById('sw-billing-freq');
  
  if (subPrice && billingFreq) {
    const updateARR = () => {
      const price = parseFloat(subPrice.value) || 0;
      const freq = billingFreq.value;
      const arr = freq === 'monthly' ? price * 12 : price;
      const arrElement = document.getElementById('arr-per-license');
      if (arrElement) {
        arrElement.textContent = formatCurrency(arr);
      }
      
      // Update hint
      const hintElement = document.getElementById('billing-hint');
      if (hintElement) {
        hintElement.textContent = freq === 'monthly' ? 'Pro Monat' : 'Pro Jahr';
      }
    };
    
    subPrice.addEventListener('input', updateARR);
    billingFreq.addEventListener('change', updateARR);
  }
}

// ==========================================
// LICENSE TYPE SELECTION
// ==========================================

window.selectLicenseType = function(type) {
  console.log('Switching to license type:', type);
  
  // Update active state
  document.querySelectorAll('.license-type-card').forEach(card => {
    card.classList.remove('active');
  });
  event.target.closest('.license-type-card').classList.add('active');
  
  // Show/hide settings
  const perpetualSettings = document.getElementById('perpetual-settings');
  const subscriptionSettings = document.getElementById('subscription-settings');
  
  if (type === 'perpetual') {
    perpetualSettings.style.display = 'block';
    subscriptionSettings.style.display = 'none';
  } else {
    perpetualSettings.style.display = 'none';
    subscriptionSettings.style.display = 'block';
  }
};

// ==========================================
// CALCULATION
// ==========================================

window.calculateSoftwareModel = function() {
  console.log('📊 Calculating Software Model...');
  
  const licenseType = document.querySelector('.license-type-card.active')?.dataset?.type || 
                      (document.getElementById('perpetual-settings').style.display !== 'none' ? 'perpetual' : 'subscription');
  
  let data;
  
  if (licenseType === 'perpetual') {
    data = collectPerpetualData();
  } else {
    data = collectSubscriptionData();
  }
  
  // Validate
  if (!data.volume_year1 || data.volume_year1 <= 0) {
    alert('⚠️ Bitte Volumen eingeben!');
    return;
  }
  
  // Calculate forecast
  const forecast = licenseType === 'perpetual' 
    ? calculatePerpetualForecast(data)
    : calculateSubscriptionForecast(data);
  
  // Render preview
  renderSoftwarePreview(forecast, data, licenseType);
  
  console.log('✅ Software Model berechnet');
};

function collectPerpetualData() {
  return {
    license_type: 'perpetual',
    release_date: document.getElementById('sw-date').value,
    time_horizon: parseInt(document.querySelector('.horizon-btn.active')?.dataset.years) || 5,
    license_price: parseFloat(document.getElementById('sw-license-price').value) || 0,
    license_cost: parseFloat(document.getElementById('sw-license-cost').value) || 0,
    maintenance_rate: parseFloat(document.getElementById('sw-maintenance-rate').value) || 0,
    renewal_rate: parseFloat(document.getElementById('sw-renewal-rate').value) || 0,
    volume_year1: parseInt(document.getElementById('sw-volume-year1').value) || 0,
    growth_model: document.getElementById('sw-growth-model').value
  };
}

function collectSubscriptionData() {
  return {
    license_type: 'subscription',
    release_date: document.getElementById('sw-date').value,
    time_horizon: parseInt(document.querySelector('.horizon-btn.active')?.dataset.years) || 5,
    billing_frequency: document.getElementById('sw-billing-freq').value,
    price_per_license: parseFloat(document.getElementById('sw-sub-price').value) || 0,
    churn_rate: parseFloat(document.getElementById('sw-churn-rate').value) || 0,
    expansion_rate: parseFloat(document.getElementById('sw-expansion-rate').value) || 0,
    volume_year1: parseInt(document.getElementById('sw-new-customers-year1').value) || 0,
    growth_model: document.getElementById('sw-growth-model').value
  };
}

function calculatePerpetualForecast(data) {
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    years: [],
    new_licenses: [],
    installed_base: [],
    license_revenue: [],
    maintenance_revenue: [],
    total_revenue: [],
    db2: []
  };
  
  let installedBase = 0;
  
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    forecast.years.push(year);
    
    // New licenses
    const newLicenses = calculateVolume(data.volume_year1, data.growth_model, i);
    forecast.new_licenses.push(newLicenses);
    
    // Installed base (cumulative with churn from maintenance)
    installedBase += newLicenses;
    if (i > 0) {
      installedBase *= (data.renewal_rate / 100); // Apply renewal rate
    }
    forecast.installed_base.push(installedBase);
    
    // License revenue (only from new licenses)
    const licenseRev = newLicenses * data.license_price;
    forecast.license_revenue.push(licenseRev);
    
    // Maintenance revenue (from installed base)
    const maintenanceRev = installedBase * data.license_price * (data.maintenance_rate / 100);
    forecast.maintenance_revenue.push(maintenanceRev);
    
    // Total revenue
    const totalRev = licenseRev + maintenanceRev;
    forecast.total_revenue.push(totalRev);
    
    // DB2 (simple approximation: license margin on new sales + 80% margin on maintenance)
    const licenseDB2 = newLicenses * (data.license_price - data.license_cost);
    const maintenanceDB2 = maintenanceRev * 0.8;
    forecast.db2.push(licenseDB2 + maintenanceDB2);
  }
  
  return forecast;
}

function calculateSubscriptionForecast(data) {
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  // Calculate ARR per license
  const arrPerLicense = data.billing_frequency === 'monthly' 
    ? data.price_per_license * 12 
    : data.price_per_license;
  
  const forecast = {
    years: [],
    new_customers: [],
    total_customers: [],
    churned_customers: [],
    arr: [],
    expansion_arr: [],
    total_arr: [],
    db2: []
  };
  
  let totalCustomers = 0;
  
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    forecast.years.push(year);
    
    // New customers
    const newCustomers = calculateVolume(data.volume_year1, data.growth_model, i);
    forecast.new_customers.push(newCustomers);
    
    // Churn
    const churned = i === 0 ? 0 : totalCustomers * (data.churn_rate / 100);
    forecast.churned_customers.push(churned);
    
    // Total customers
    totalCustomers = totalCustomers - churned + newCustomers;
    forecast.total_customers.push(totalCustomers);
    
    // Base ARR
    const baseARR = totalCustomers * arrPerLicense;
    forecast.arr.push(baseARR);
    
    // Expansion ARR (upsells from existing customers)
    const expansionARR = i === 0 ? 0 : baseARR * (data.expansion_rate / 100);
    forecast.expansion_arr.push(expansionARR);
    
    // Total ARR
    const totalARR = baseARR + expansionARR;
    forecast.total_arr.push(totalARR);
    
    // DB2 (SaaS typically has 80-85% gross margin)
    const db2 = totalARR * 0.82;
    forecast.db2.push(db2);
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
      const t = yearIndex;
      const multiplier = 1 + Math.sin(t / 5 * Math.PI / 2) * 0.5;
      return startVolume * multiplier;
    case 'optimistisch':
      return startVolume * Math.pow(1.20, yearIndex);
    default:
      return startVolume;
  }
}

// ==========================================
// PREVIEW RENDERING
// ==========================================

function renderSoftwarePreview(forecast, data, licenseType) {
  const container = document.getElementById('software-preview');
  if (!container) return;
  
  if (licenseType === 'perpetual') {
    container.innerHTML = renderPerpetualPreview(forecast, data);
  } else {
    container.innerHTML = renderSubscriptionPreview(forecast, data);
  }
}

function renderPerpetualPreview(forecast, data) {
  const totalLicenseRev = forecast.license_revenue.reduce((a, b) => a + b, 0);
  const totalMaintenanceRev = forecast.maintenance_revenue.reduce((a, b) => a + b, 0);
  const totalRev = forecast.total_revenue.reduce((a, b) => a + b, 0);
  const totalDB2 = forecast.db2.reduce((a, b) => a + b, 0);
  
  return `
    <div class="preview-section">
      <h3 class="preview-title">📊 Perpetual License Forecast</h3>
      
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">License Revenue</div>
          <div class="summary-value">${formatCurrency(totalLicenseRev)}</div>
          <div class="summary-hint">Über ${forecast.years.length} Jahre</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Maintenance Revenue</div>
          <div class="summary-value" style="color: #10b981;">${formatCurrency(totalMaintenanceRev)}</div>
          <div class="summary-hint">Wiederkehrend</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Gesamt Revenue</div>
          <div class="summary-value" style="color: #2563eb;">${formatCurrency(totalRev)}</div>
          <div class="summary-hint">License + Maintenance</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">DB2</div>
          <div class="summary-value" style="color: #059669;">${formatCurrency(totalDB2)}</div>
          <div class="summary-hint">Marge: ${((totalDB2/totalRev)*100).toFixed(1)}%</div>
        </div>
      </div>
      
      <!-- Forecast Table -->
      <div class="forecast-table-container">
        <table class="forecast-table">
          <thead>
            <tr>
              <th>Metrik</th>
              ${forecast.years.map(year => `<th>${year}</th>`).join('')}
              <th style="background: #f3f4f6;">Σ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Neue Lizenzen</td>
              ${forecast.new_licenses.map(v => `<td>${formatNumber(v, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(forecast.new_licenses.reduce((a, b) => a + b, 0), 0)}</td>
            </tr>
            <tr>
              <td>Installed Base</td>
              ${forecast.installed_base.map(v => `<td>${formatNumber(v, 0)}</td>`).join('')}
              <td style="font-weight: 600;">-</td>
            </tr>
            <tr style="background: #fafafa;">
              <td>License Revenue (T€)</td>
              ${forecast.license_revenue.map(r => `<td>${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(totalLicenseRev / 1000, 0)}</td>
            </tr>
            <tr style="background: #f0fdf4;">
              <td>Maintenance Revenue (T€)</td>
              ${forecast.maintenance_revenue.map(r => `<td style="color: #10b981;">${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600; color: #10b981;">${formatNumber(totalMaintenanceRev / 1000, 0)}</td>
            </tr>
            <tr style="background: #dbeafe; font-weight: 600;">
              <td>GESAMT Revenue (T€)</td>
              ${forecast.total_revenue.map(r => `<td>${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 700;">${formatNumber(totalRev / 1000, 0)}</td>
            </tr>
            <tr style="background: #dcfce7;">
              <td>DB2 (T€)</td>
              ${forecast.db2.map(db => `<td style="color: #059669;">${formatNumber(db / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 700; color: #059669;">${formatNumber(totalDB2 / 1000, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSubscriptionPreview(forecast, data) {
  const totalARR = forecast.total_arr.reduce((a, b) => a + b, 0);
  const totalDB2 = forecast.db2.reduce((a, b) => a + b, 0);
  const avgChurn = (forecast.churned_customers.reduce((a, b) => a + b, 0) / 
                    forecast.total_customers.reduce((a, b) => a + b, 0) * 100);
  
  return `
    <div class="preview-section">
      <h3 class="preview-title">📊 Subscription/SaaS Forecast</h3>
      
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">Total ARR</div>
          <div class="summary-value" style="color: #2563eb;">${formatCurrency(totalARR)}</div>
          <div class="summary-hint">Über ${forecast.years.length} Jahre</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Peak Customers</div>
          <div class="summary-value">${formatNumber(Math.max(...forecast.total_customers), 0)}</div>
          <div class="summary-hint">Höchster Stand</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Avg. Churn</div>
          <div class="summary-value" style="color: #ef4444;">${formatNumber(avgChurn, 1)}%</div>
          <div class="summary-hint">Jährlich</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">DB2</div>
          <div class="summary-value" style="color: #059669;">${formatCurrency(totalDB2)}</div>
          <div class="summary-hint">Marge: ${((totalDB2/totalARR)*100).toFixed(1)}%</div>
        </div>
      </div>
      
      <!-- Forecast Table -->
      <div class="forecast-table-container">
        <table class="forecast-table">
          <thead>
            <tr>
              <th>Metrik</th>
              ${forecast.years.map(year => `<th>${year}</th>`).join('')}
              <th style="background: #f3f4f6;">Avg/Σ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Neue Kunden</td>
              ${forecast.new_customers.map(v => `<td>${formatNumber(v, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(forecast.new_customers.reduce((a, b) => a + b, 0), 0)}</td>
            </tr>
            <tr style="color: #ef4444;">
              <td>Gekündigte Kunden</td>
              ${forecast.churned_customers.map(v => `<td>${formatNumber(v, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(forecast.churned_customers.reduce((a, b) => a + b, 0), 0)}</td>
            </tr>
            <tr style="background: #fafafa; font-weight: 600;">
              <td>Total Kunden</td>
              ${forecast.total_customers.map(v => `<td>${formatNumber(v, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(Math.max(...forecast.total_customers), 0)}</td>
            </tr>
            <tr style="background: #f0fdf4;">
              <td>Base ARR (T€)</td>
              ${forecast.arr.map(r => `<td>${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(forecast.arr.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            <tr style="background: #f0fdf4;">
              <td>Expansion ARR (T€)</td>
              ${forecast.expansion_arr.map(r => `<td style="color: #10b981;">${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600; color: #10b981;">${formatNumber(forecast.expansion_arr.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            <tr style="background: #dbeafe; font-weight: 600;">
              <td>Total ARR (T€)</td>
              ${forecast.total_arr.map(r => `<td>${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 700;">${formatNumber(totalARR / 1000, 0)}</td>
            </tr>
            <tr style="background: #dcfce7;">
              <td>DB2 (T€)</td>
              ${forecast.db2.map(db => `<td style="color: #059669;">${formatNumber(db / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 700; color: #059669;">${formatNumber(totalDB2 / 1000, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.resetSoftwareModel = function() {
  const confirmed = confirm('Möchten Sie alle Eingaben zurücksetzen?');
  if (!confirmed) return;
  
  location.reload();
};

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

function renderSoftwareStyles() {
  return `
    <style>
      .software-model-container {
        padding: 24px;
        background: #f9fafb;
        min-height: 600px;
      }
      
      .software-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .software-title {
        margin: 0;
        font-size: 24px;
        color: #1f2937;
      }
      
      .software-subtitle {
        margin: 4px 0 0;
        color: #6b7280;
        font-size: 14px;
      }
      
      .software-badge {
        padding: 8px 16px;
        background: #3b82f6;
        color: white;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
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
      
      .section-hint {
        margin: -8px 0 16px;
        color: #6b7280;
        font-size: 13px;
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
      
      .form-input, .form-select {
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
      }
      
      .form-input:focus, .form-select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .input-hint {
        margin-top: 4px;
        font-size: 11px;
        color: #9ca3af;
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
      
      /* License Type Selector */
      .license-type-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      
      .license-type-card {
        padding: 20px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .license-type-card:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .license-type-card.active {
        border-color: #2563eb;
        background: #dbeafe;
      }
      
      .license-type-icon {
        font-size: 40px;
        margin-bottom: 12px;
      }
      
      .license-type-name {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
      }
      
      .license-type-desc {
        font-size: 12px;
        color: #6b7280;
      }
      
      /* KPI Display */
      .kpi-display, .maintenance-calc, .revenue-calc {
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
      }
      
      .kpi-label, .calc-label {
        font-size: 14px;
        color: #6b7280;
        font-weight: 600;
      }
      
      .kpi-value, .calc-value {
        font-size: 20px;
        font-weight: 700;
        color: #059669;
      }
      
      /* Action Buttons */
      .action-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-bottom: 24px;
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
      
      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
      }
      
      .btn-secondary:hover {
        background: #e5e7eb;
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
      
      /* Preview */
      .preview-container {
        margin-top: 24px;
      }
      
      .preview-section {
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 12px;
        padding: 24px;
      }
      
      .preview-title {
        margin: 0 0 24px;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .summary-card {
        padding: 16px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-align: center;
      }
      
      .summary-label {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
        font-weight: 600;
      }
      
      .summary-value {
        font-size: 22px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .summary-hint {
        font-size: 11px;
        color: #9ca3af;
      }
      
      /* Forecast Table */
      .forecast-table-container {
        overflow-x: auto;
      }
      
      .forecast-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      
      .forecast-table th {
        padding: 10px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        font-weight: 600;
        text-align: center;
        font-size: 12px;
      }
      
      .forecast-table td {
        padding: 8px;
        border: 1px solid #e5e7eb;
        text-align: right;
      }
      
      .forecast-table td:first-child {
        text-align: left;
        font-weight: 500;
        background: #fafafa;
      }
      
      @media (max-width: 1200px) {
        .summary-cards {
          grid-template-columns: repeat(2, 1fr);
        }
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
