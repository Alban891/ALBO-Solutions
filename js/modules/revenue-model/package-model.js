/**
 * PACKAGE MODEL
 * Good/Better/Best Package-Varianten mit Komponenten
 * 
 * Use Case: Cyber Security Consulting Small/Medium/Large
 * 
 * Features:
 * - Mehrere Package-Varianten (S/M/L)
 * - Mix-Planung (z.B. 50% Small, 30% Medium, 20% Large)
 * - Komponenten-Attach Rates
 * - Aggregierte Revenue-Berechnung
 */

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export function renderPackageModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('📦 Rendering Package Model for:', artikel.name);
  
  // Initialize package data
  if (!artikel.package_model_data) {
    artikel.package_model_data = initializePackageData(artikel);
  }
  
  const data = artikel.package_model_data;
  
  container.innerHTML = `
    <div class="package-model-container">
      
      <!-- Header -->
      <div class="package-header">
        <div>
          <h2 class="package-title">📦 ${artikel.name}</h2>
          <p class="package-subtitle">Good/Better/Best Package Revenue Model</p>
        </div>
        <div class="package-badge">Package Model</div>
      </div>
      
      <!-- Zeitrahmen -->
      <div class="section-card">
        <h3 class="section-title">⏱️ Zeitrahmen</h3>
        <div class="input-row">
          <div class="input-group">
            <label class="input-label">Startdatum</label>
            <input 
              type="month" 
              id="pkg-date" 
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
      
      <!-- Package Varianten -->
      <div class="section-card">
        <h3 class="section-title">📊 Package Varianten & Mix</h3>
        <p class="section-hint">Definiere die drei Varianten und ihre Verteilung</p>
        
        <div class="variants-grid">
          ${renderVariantCard('small', 'Small', data.variants.small, '#10b981')}
          ${renderVariantCard('medium', 'Medium', data.variants.medium, '#3b82f6')}
          ${renderVariantCard('large', 'Large', data.variants.large, '#8b5cf6')}
        </div>
        
        <!-- Mix Verteilung -->
        <div class="mix-section">
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #1f2937;">Mix-Verteilung (Jahr 1)</h4>
          <div class="mix-sliders">
            ${renderMixSlider('small', 'Small', data.mix.small, '#10b981')}
            ${renderMixSlider('medium', 'Medium', data.mix.medium, '#3b82f6')}
            ${renderMixSlider('large', 'Large', data.mix.large, '#8b5cf6')}
          </div>
          <div class="mix-total" id="mix-total">
            Gesamt: <span id="mix-sum">${data.mix.small + data.mix.medium + data.mix.large}</span>%
          </div>
        </div>
      </div>
      
      <!-- Komponenten-Attach Rates -->
      ${renderComponentsSection(artikel, data)}
      
      <!-- Volumenentwicklung -->
      <div class="section-card">
        <h3 class="section-title">📈 Volumenentwicklung</h3>
        <div class="input-row">
          <div class="input-group">
            <label class="input-label">Gesamtvolumen Jahr 1</label>
            <input 
              type="number" 
              id="pkg-total-volume" 
              value="${data.total_volume_year1}"
              class="form-input"
              placeholder="100"
            >
            <span class="input-hint">Anzahl verkaufter Packages</span>
          </div>
          <div class="input-group">
            <label class="input-label">Wachstumsmodell</label>
            <select id="pkg-growth-model" class="form-select">
              <option value="konservativ" ${data.growth_model === 'konservativ' ? 'selected' : ''}>Konservativ (+5% p.a.)</option>
              <option value="realistisch" ${data.growth_model === 'realistisch' ? 'selected' : ''}>Realistisch (S-Kurve)</option>
              <option value="optimistisch" ${data.growth_model === 'optimistisch' ? 'selected' : ''}>Optimistisch (+15% p.a.)</option>
              <option value="hockey-stick" ${data.growth_model === 'hockey-stick' ? 'selected' : ''}>Hockey-Stick</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="action-buttons">
        <button class="btn btn-secondary" onclick="window.resetPackageModel()">
          🔄 Zurücksetzen
        </button>
        <button class="btn btn-primary" onclick="window.calculatePackageModel()">
          📊 Berechnen & Vorschau
        </button>
      </div>
      
      <!-- Preview -->
      <div id="package-preview" class="preview-container"></div>
      
    </div>
    
    ${renderPackageStyles()}
  `;
  
  // Attach event listeners
  attachPackageEventListeners(artikel);
}

// ==========================================
// VARIANT CARD
// ==========================================

function renderVariantCard(variantKey, variantName, variantData, color) {
  return `
    <div class="variant-card" style="border-color: ${color};">
      <div class="variant-header" style="background: ${color};">
        <h4 class="variant-title">${variantName}</h4>
      </div>
      <div class="variant-body">
        <div class="variant-input-group">
          <label class="variant-label">Preis (€)</label>
          <input 
            type="number" 
            id="pkg-price-${variantKey}" 
            value="${variantData.price}"
            class="variant-input"
            placeholder="0"
            step="100"
          >
        </div>
        <div class="variant-input-group">
          <label class="variant-label">Herstellkosten (€)</label>
          <input 
            type="number" 
            id="pkg-cost-${variantKey}" 
            value="${variantData.cost}"
            class="variant-input"
            placeholder="0"
            step="100"
          >
        </div>
        <div class="variant-kpi">
          <span class="variant-kpi-label">DB2:</span>
          <span class="variant-kpi-value" id="db2-${variantKey}" style="color: ${color};">
            ${formatCurrency(variantData.price - variantData.cost)}
          </span>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// MIX SLIDER
// ==========================================

function renderMixSlider(variantKey, variantName, value, color) {
  return `
    <div class="mix-slider-group">
      <div class="mix-slider-header">
        <label class="mix-label">${variantName}</label>
        <span class="mix-value" id="mix-value-${variantKey}">${value}%</span>
      </div>
      <input 
        type="range" 
        id="mix-slider-${variantKey}" 
        min="0" 
        max="100" 
        value="${value}"
        class="mix-slider"
        style="--slider-color: ${color};"
      >
    </div>
  `;
}

// ==========================================
// COMPONENTS SECTION
// ==========================================

function renderComponentsSection(artikel, data) {
  // Check if artikel has components
  const components = artikel.components || [];
  
  if (components.length === 0) {
    return `
      <div class="section-card">
        <h3 class="section-title">🔧 Komponenten</h3>
        <div style="padding: 20px; text-align: center; color: #9ca3af;">
          <p>Keine Komponenten definiert</p>
          <p style="font-size: 12px; margin-top: 8px;">Komponenten können in den Artikel-Stammdaten hinzugefügt werden</p>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="section-card">
      <h3 class="section-title">🔧 Komponenten-Attach Rates</h3>
      <p class="section-hint">Wie oft wird jede Komponente zusätzlich zum Package verkauft?</p>
      
      <div class="components-grid">
        ${components.map((comp, idx) => `
          <div class="component-card">
            <div class="component-header">
              <span class="component-icon">📦</span>
              <span class="component-name">${comp.name || `Komponente ${idx + 1}`}</span>
            </div>
            <div class="component-body">
              <label class="component-label">Attach Rate (%)</label>
              <input 
                type="number" 
                id="attach-rate-${idx}" 
                value="${data.attach_rates[idx] || 50}"
                class="component-input"
                min="0"
                max="100"
                placeholder="50"
              >
              <span class="component-hint">z.B. 80% = bei 80% der Packages dabei</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializePackageData(artikel) {
  return {
    release_date: artikel.release_datum || new Date().toISOString().slice(0, 7),
    time_horizon: artikel.zeitraum || 5,
    
    variants: {
      small: { price: 5000, cost: 2000 },
      medium: { price: 10000, cost: 4000 },
      large: { price: 20000, cost: 8000 }
    },
    
    mix: {
      small: 50,
      medium: 30,
      large: 20
    },
    
    total_volume_year1: 100,
    growth_model: 'realistisch',
    
    attach_rates: (artikel.components || []).map(() => 50),
    
    calculated: false,
    forecast: null
  };
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachPackageEventListeners(artikel) {
  // Horizon buttons
  document.querySelectorAll('.horizon-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.horizon-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Variant prices - real-time DB2 update
  ['small', 'medium', 'large'].forEach(variant => {
    const priceInput = document.getElementById(`pkg-price-${variant}`);
    const costInput = document.getElementById(`pkg-cost-${variant}`);
    
    if (priceInput && costInput) {
      const updateDB2 = () => {
        const price = parseFloat(priceInput.value) || 0;
        const cost = parseFloat(costInput.value) || 0;
        const db2 = price - cost;
        const db2Element = document.getElementById(`db2-${variant}`);
        if (db2Element) {
          db2Element.textContent = formatCurrency(db2);
        }
      };
      
      priceInput.addEventListener('input', updateDB2);
      costInput.addEventListener('input', updateDB2);
    }
  });
  
  // Mix sliders - enforce 100% total
  ['small', 'medium', 'large'].forEach(variant => {
    const slider = document.getElementById(`mix-slider-${variant}`);
    if (slider) {
      slider.addEventListener('input', function() {
        updateMixValues();
      });
    }
  });
}

function updateMixValues() {
  const small = parseInt(document.getElementById('mix-slider-small').value) || 0;
  const medium = parseInt(document.getElementById('mix-slider-medium').value) || 0;
  const large = parseInt(document.getElementById('mix-slider-large').value) || 0;
  
  const total = small + medium + large;
  
  // Update displays
  document.getElementById('mix-value-small').textContent = `${small}%`;
  document.getElementById('mix-value-medium').textContent = `${medium}%`;
  document.getElementById('mix-value-large').textContent = `${large}%`;
  document.getElementById('mix-sum').textContent = total;
  
  // Visual feedback if not 100%
  const totalElement = document.getElementById('mix-total');
  if (total !== 100) {
    totalElement.style.color = '#ef4444';
    totalElement.style.fontWeight = '700';
  } else {
    totalElement.style.color = '#10b981';
    totalElement.style.fontWeight = '600';
  }
}

// ==========================================
// CALCULATION
// ==========================================

window.calculatePackageModel = function() {
  console.log('📊 Calculating Package Model...');
  
  // Collect data
  const data = {
    release_date: document.getElementById('pkg-date').value,
    time_horizon: parseInt(document.querySelector('.horizon-btn.active')?.dataset.years) || 5,
    
    variants: {
      small: {
        price: parseFloat(document.getElementById('pkg-price-small').value) || 0,
        cost: parseFloat(document.getElementById('pkg-cost-small').value) || 0
      },
      medium: {
        price: parseFloat(document.getElementById('pkg-price-medium').value) || 0,
        cost: parseFloat(document.getElementById('pkg-cost-medium').value) || 0
      },
      large: {
        price: parseFloat(document.getElementById('pkg-price-large').value) || 0,
        cost: parseFloat(document.getElementById('pkg-cost-large').value) || 0
      }
    },
    
    mix: {
      small: parseInt(document.getElementById('mix-slider-small').value) || 0,
      medium: parseInt(document.getElementById('mix-slider-medium').value) || 0,
      large: parseInt(document.getElementById('mix-slider-large').value) || 0
    },
    
    total_volume_year1: parseInt(document.getElementById('pkg-total-volume').value) || 0,
    growth_model: document.getElementById('pkg-growth-model').value
  };
  
  // Validate
  const mixTotal = data.mix.small + data.mix.medium + data.mix.large;
  if (mixTotal !== 100) {
    alert(`⚠️ Mix muss 100% ergeben (aktuell: ${mixTotal}%)`);
    return;
  }
  
  if (!data.total_volume_year1) {
    alert('⚠️ Bitte Gesamtvolumen eingeben!');
    return;
  }
  
  // Calculate forecast
  const forecast = calculatePackageForecast(data);
  
  // Render preview
  renderPackagePreview(forecast, data);
  
  console.log('✅ Package Model berechnet');
};

function calculatePackageForecast(data) {
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    years: [],
    volumes: { total: [], small: [], medium: [], large: [] },
    revenues: { total: [], small: [], medium: [], large: [] },
    costs: { total: [], small: [], medium: [], large: [] },
    db2: { total: [], small: [], medium: [], large: [] }
  };
  
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    forecast.years.push(year);
    
    // Calculate total volume for this year
    const totalVolume = calculateVolume(data.total_volume_year1, data.growth_model, i);
    forecast.volumes.total.push(totalVolume);
    
    // Distribute by variant
    const volumeSmall = totalVolume * (data.mix.small / 100);
    const volumeMedium = totalVolume * (data.mix.medium / 100);
    const volumeLarge = totalVolume * (data.mix.large / 100);
    
    forecast.volumes.small.push(volumeSmall);
    forecast.volumes.medium.push(volumeMedium);
    forecast.volumes.large.push(volumeLarge);
    
    // Calculate revenues
    const revSmall = volumeSmall * data.variants.small.price;
    const revMedium = volumeMedium * data.variants.medium.price;
    const revLarge = volumeLarge * data.variants.large.price;
    
    forecast.revenues.small.push(revSmall);
    forecast.revenues.medium.push(revMedium);
    forecast.revenues.large.push(revLarge);
    forecast.revenues.total.push(revSmall + revMedium + revLarge);
    
    // Calculate costs
    const costSmall = volumeSmall * data.variants.small.cost;
    const costMedium = volumeMedium * data.variants.medium.cost;
    const costLarge = volumeLarge * data.variants.large.cost;
    
    forecast.costs.small.push(costSmall);
    forecast.costs.medium.push(costMedium);
    forecast.costs.large.push(costLarge);
    forecast.costs.total.push(costSmall + costMedium + costLarge);
    
    // Calculate DB2
    forecast.db2.small.push(revSmall - costSmall);
    forecast.db2.medium.push(revMedium - costMedium);
    forecast.db2.large.push(revLarge - costLarge);
    forecast.db2.total.push((revSmall - costSmall) + (revMedium - costMedium) + (revLarge - costLarge));
  }
  
  return forecast;
}

function calculateVolume(startVolume, model, yearIndex) {
  switch (model) {
    case 'konservativ':
      return startVolume * Math.pow(1.05, yearIndex);
    
    case 'realistisch':
      const t = yearIndex;
      const maxYears = 5;
      const growthPhase = Math.min(t / (maxYears * 0.4), 1);
      const maturePhase = t > (maxYears * 0.4) ? (t - maxYears * 0.4) / (maxYears * 0.3) : 0;
      const declinePhase = t > (maxYears * 0.7) ? (t - maxYears * 0.7) / (maxYears * 0.3) : 0;
      
      let multiplier = 1;
      if (growthPhase < 1) {
        multiplier = 1 + growthPhase * 0.5;
      } else if (maturePhase < 1) {
        multiplier = 1.5 + maturePhase * 0.3;
      } else {
        multiplier = 1.8 - declinePhase * 0.2;
      }
      return startVolume * multiplier;
    
    case 'optimistisch':
      return startVolume * Math.pow(1.15, yearIndex);
    
    case 'hockey-stick':
      if (yearIndex <= 1) {
        return startVolume * Math.pow(1.10, yearIndex);
      } else {
        return startVolume * 1.10 * Math.pow(1.40, yearIndex - 1);
      }
    
    default:
      return startVolume;
  }
}

// ==========================================
// PREVIEW RENDERING
// ==========================================

function renderPackagePreview(forecast, data) {
  const container = document.getElementById('package-preview');
  if (!container) return;
  
  container.innerHTML = `
    <div class="preview-section">
      <h3 class="preview-title">📊 Package Revenue Forecast</h3>
      
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card" style="border-color: #10b981;">
          <div class="summary-label">Small Packages (${data.mix.small}%)</div>
          <div class="summary-value" style="color: #10b981;">
            ${formatCurrency(forecast.revenues.small.reduce((a, b) => a + b, 0))}
          </div>
          <div class="summary-hint">Gesamt über ${forecast.years.length} Jahre</div>
        </div>
        
        <div class="summary-card" style="border-color: #3b82f6;">
          <div class="summary-label">Medium Packages (${data.mix.medium}%)</div>
          <div class="summary-value" style="color: #3b82f6;">
            ${formatCurrency(forecast.revenues.medium.reduce((a, b) => a + b, 0))}
          </div>
          <div class="summary-hint">Gesamt über ${forecast.years.length} Jahre</div>
        </div>
        
        <div class="summary-card" style="border-color: #8b5cf6;">
          <div class="summary-label">Large Packages (${data.mix.large}%)</div>
          <div class="summary-value" style="color: #8b5cf6;">
            ${formatCurrency(forecast.revenues.large.reduce((a, b) => a + b, 0))}
          </div>
          <div class="summary-hint">Gesamt über ${forecast.years.length} Jahre</div>
        </div>
        
        <div class="summary-card" style="border-color: #1e3a8a; background: #eff6ff;">
          <div class="summary-label">GESAMT Revenue</div>
          <div class="summary-value" style="color: #1e3a8a; font-size: 28px;">
            ${formatCurrency(forecast.revenues.total.reduce((a, b) => a + b, 0))}
          </div>
          <div class="summary-hint">Über ${forecast.years.length} Jahre</div>
        </div>
      </div>
      
      <!-- Forecast Table -->
      <div class="forecast-table-container">
        <table class="forecast-table">
          <thead>
            <tr>
              <th>Jahr</th>
              ${forecast.years.map(year => `<th>${year}</th>`).join('')}
              <th style="background: #f3f4f6;">Σ</th>
            </tr>
          </thead>
          <tbody>
            <!-- Volumen -->
            <tr style="background: #fafafa;">
              <td colspan="${forecast.years.length + 2}" style="font-weight: 600; padding: 8px;">Volumen (Anzahl Packages)</td>
            </tr>
            <tr>
              <td>Small</td>
              ${forecast.volumes.small.map(v => `<td>${formatNumber(v, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(forecast.volumes.small.reduce((a, b) => a + b, 0), 0)}</td>
            </tr>
            <tr>
              <td>Medium</td>
              ${forecast.volumes.medium.map(v => `<td>${formatNumber(v, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(forecast.volumes.medium.reduce((a, b) => a + b, 0), 0)}</td>
            </tr>
            <tr>
              <td>Large</td>
              ${forecast.volumes.large.map(v => `<td>${formatNumber(v, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(forecast.volumes.large.reduce((a, b) => a + b, 0), 0)}</td>
            </tr>
            <tr style="background: #f9fafb; font-weight: 600;">
              <td>GESAMT</td>
              ${forecast.volumes.total.map(v => `<td>${formatNumber(v, 0)}</td>`).join('')}
              <td style="font-weight: 700;">${formatNumber(forecast.volumes.total.reduce((a, b) => a + b, 0), 0)}</td>
            </tr>
            
            <!-- Revenue -->
            <tr style="background: #fafafa;">
              <td colspan="${forecast.years.length + 2}" style="font-weight: 600; padding: 8px;">Umsatz (T€)</td>
            </tr>
            <tr>
              <td>Small</td>
              ${forecast.revenues.small.map(r => `<td>${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(forecast.revenues.small.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            <tr>
              <td>Medium</td>
              ${forecast.revenues.medium.map(r => `<td>${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(forecast.revenues.medium.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            <tr>
              <td>Large</td>
              ${forecast.revenues.large.map(r => `<td>${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(forecast.revenues.large.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            <tr style="background: #dbeafe; font-weight: 600;">
              <td>GESAMT</td>
              ${forecast.revenues.total.map(r => `<td>${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 700; color: #1e3a8a;">${formatNumber(forecast.revenues.total.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            
            <!-- DB2 -->
            <tr style="background: #fafafa;">
              <td colspan="${forecast.years.length + 2}" style="font-weight: 600; padding: 8px;">DB2 (T€)</td>
            </tr>
            <tr>
              <td>Small</td>
              ${forecast.db2.small.map(db => `<td style="color: #10b981;">${formatNumber(db / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600; color: #10b981;">${formatNumber(forecast.db2.small.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            <tr>
              <td>Medium</td>
              ${forecast.db2.medium.map(db => `<td style="color: #3b82f6;">${formatNumber(db / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600; color: #3b82f6;">${formatNumber(forecast.db2.medium.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            <tr>
              <td>Large</td>
              ${forecast.db2.large.map(db => `<td style="color: #8b5cf6;">${formatNumber(db / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600; color: #8b5cf6;">${formatNumber(forecast.db2.large.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            <tr style="background: #dcfce7; font-weight: 600;">
              <td>GESAMT</td>
              ${forecast.db2.total.map(db => `<td style="color: #059669;">${formatNumber(db / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 700; color: #059669;">${formatNumber(forecast.db2.total.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.resetPackageModel = function() {
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

function renderPackageStyles() {
  return `
    <style>
      .package-model-container {
        padding: 24px;
        background: #f9fafb;
        min-height: 600px;
      }
      
      .package-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .package-title {
        margin: 0;
        font-size: 24px;
        color: #1f2937;
      }
      
      .package-subtitle {
        margin: 4px 0 0;
        color: #6b7280;
        font-size: 14px;
      }
      
      .package-badge {
        padding: 8px 16px;
        background: #8b5cf6;
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
      
      /* Variants Grid */
      .variants-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .variant-card {
        border: 2px solid;
        border-radius: 12px;
        overflow: hidden;
      }
      
      .variant-header {
        padding: 12px;
        color: white;
        text-align: center;
      }
      
      .variant-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .variant-body {
        padding: 16px;
      }
      
      .variant-input-group {
        margin-bottom: 12px;
      }
      
      .variant-label {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
      }
      
      .variant-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
      }
      
      .variant-input:focus {
        outline: none;
        border-color: #3b82f6;
      }
      
      .variant-kpi {
        padding: 12px;
        background: #f9fafb;
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .variant-kpi-label {
        font-size: 12px;
        color: #6b7280;
        font-weight: 600;
      }
      
      .variant-kpi-value {
        font-size: 18px;
        font-weight: 700;
      }
      
      /* Mix Section */
      .mix-section {
        padding: 20px;
        background: #f9fafb;
        border-radius: 8px;
      }
      
      .mix-sliders {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 16px;
      }
      
      .mix-slider-group {
        display: flex;
        flex-direction: column;
      }
      
      .mix-slider-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      
      .mix-label {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }
      
      .mix-value {
        font-size: 13px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .mix-slider {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        outline: none;
        -webkit-appearance: none;
        background: #e5e7eb;
      }
      
      .mix-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--slider-color, #3b82f6);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .mix-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--slider-color, #3b82f6);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .mix-total {
        padding: 12px;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
        color: #6b7280;
      }
      
      /* Components */
      .components-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
      }
      
      .component-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .component-header {
        padding: 10px 12px;
        background: #f9fafb;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .component-icon {
        font-size: 16px;
      }
      
      .component-name {
        font-size: 13px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .component-body {
        padding: 12px;
      }
      
      .component-label {
        display: block;
        margin-bottom: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
      }
      
      .component-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
      }
      
      .component-hint {
        display: block;
        margin-top: 4px;
        font-size: 11px;
        color: #9ca3af;
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
        background: white;
        border: 2px solid;
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
        .variants-grid {
          grid-template-columns: 1fr;
        }
        
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
  renderPackageModel
};
