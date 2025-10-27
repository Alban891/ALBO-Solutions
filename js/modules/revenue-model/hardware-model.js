/**
 * HARDWARE REVENUE MODEL - MULTI-ARTIKEL VERSION
 * Option A: Stacked Planning with Combined Summary
 * 
 * Features:
 * - Multi-Artikel Selection
 * - Kompakte Artikel-Cards
 * - Kombinierte Summary
 * - Combined Preview Table
 */

// ==========================================
// MULTI-ARTIKEL MAIN RENDERER
// ==========================================

/**
 * Render Multi-Artikel Planning View
 * @param {Array} artikelIds - Array of selected artikel IDs
 * @param {string} containerId - DOM container ID
 */
export function renderMultiArtikelPlanning(artikelIds, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('📦 Rendering Multi-Artikel Planning for:', artikelIds.length, 'articles');
  
  // Get artikel objects
  const artikelList = artikelIds.map(id => 
    window.revenueModelArtikel?.find(a => a.id === id)
  ).filter(a => a != null);
  
  if (artikelList.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #6b7280;">
        <h3>Keine Artikel ausgewählt</h3>
        <p>Wähle Artikel in der linken Sidebar aus, um mit der Planung zu beginnen.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="multi-artikel-container">
      
      <!-- Header -->
      <div class="multi-header">
        <h2>📊 Kombinierte Artikelplanung</h2>
        <div class="multi-badge">${artikelList.length} Artikel ausgewählt</div>
      </div>
      
      <!-- Artikel Cards (Stacked) -->
      <div class="artikel-stack">
        ${artikelList.map(artikel => renderArtikelCardCompact(artikel)).join('')}
      </div>
      
      <!-- Combined Summary -->
      ${renderCombinedSummary(artikelList)}
      
      <!-- Combined Action Buttons -->
      <div class="combined-actions">
        <button 
          class="btn btn-secondary-compact" 
          onclick="window.resetAllArtikel()"
        >
          🔄 Alle zurücksetzen
        </button>
        <button 
          class="btn btn-primary-compact" 
          onclick="window.calculateAllArtikel()"
        >
          📊 Alle berechnen & Gesamtvorschau
        </button>
      </div>
      
      <!-- Combined Preview Container -->
      <div id="combined-preview-container"></div>
      
    </div>
    
    ${renderMultiArtikelStyles()}
  `;
  
  // Attach event listeners for all artikel
  artikelList.forEach(artikel => {
    attachCompactEventListeners(artikel);
  });
}

// ==========================================
// COMPACT ARTIKEL CARD
// ==========================================

function renderArtikelCardCompact(artikel) {
  const modelData = artikel.revenue_model_data || initializeHardwareData(artikel);
  const isExpanded = modelData.expanded !== false; // Default: expanded
  
  const umsatzYear1 = modelData.start_menge * modelData.start_preis;
  const db2Year1 = umsatzYear1 - (modelData.start_menge * modelData.start_hk);
  const db2Percent = umsatzYear1 > 0 ? (db2Year1 / umsatzYear1 * 100).toFixed(1) : 0;
  
  return `
    <div class="artikel-card-compact" data-artikel-id="${artikel.id}">
      
      <!-- Collapse Header -->
      <div class="artikel-header-compact" onclick="window.toggleArtikelCard('${artikel.id}')">
        <div class="artikel-title-compact">
          <span class="artikel-icon">${getArtikelIcon(artikel.category)}</span>
          <strong>${artikel.name}</strong>
        </div>
        <div class="artikel-quick-stats">
          <span class="stat">Umsatz J1: ${formatCurrency(umsatzYear1)}</span>
          <span class="stat">DB2: ${formatCurrency(db2Year1)}</span>
          <span class="stat">Marge: ${db2Percent}%</span>
        </div>
        <button class="collapse-btn">${isExpanded ? '▼' : '▶'}</button>
      </div>
      
      <!-- Collapsible Content -->
      <div class="artikel-content-compact" style="display: ${isExpanded ? 'block' : 'none'};">
        
        <!-- Time Frame (Single Row) -->
        <div class="compact-row">
          <div class="compact-input-group">
            <label class="label-mini">Startdatum</label>
            <input 
              type="month" 
              id="hw-date-${artikel.id}" 
              value="${modelData.release_date}"
              class="form-input-mini"
            >
          </div>
          <div class="compact-input-group">
            <label class="label-mini">Zeithorizont</label>
            <div class="horizon-mini">
              <button class="horizon-btn-mini ${modelData.time_horizon === 3 ? 'active' : ''}" 
                      data-artikel="${artikel.id}" data-years="3">3J</button>
              <button class="horizon-btn-mini ${modelData.time_horizon === 5 ? 'active' : ''}" 
                      data-artikel="${artikel.id}" data-years="5">5J</button>
              <button class="horizon-btn-mini ${modelData.time_horizon === 7 ? 'active' : ''}" 
                      data-artikel="${artikel.id}" data-years="7">7J</button>
            </div>
          </div>
        </div>
        
        <!-- Start Values (Single Row) -->
        <div class="compact-row">
          <div class="compact-input-group">
            <label class="label-mini">Menge</label>
            <input 
              type="number" 
              id="hw-menge-${artikel.id}" 
              value="${modelData.start_menge}"
              class="form-input-mini"
              placeholder="1000"
            >
          </div>
          <div class="compact-input-group">
            <label class="label-mini">Preis (€)</label>
            <input 
              type="number" 
              id="hw-preis-${artikel.id}" 
              value="${modelData.start_preis}"
              class="form-input-mini"
              placeholder="50"
              step="0.01"
            >
          </div>
          <div class="compact-input-group">
            <label class="label-mini">HK (€)</label>
            <input 
              type="number" 
              id="hw-hk-${artikel.id}" 
              value="${modelData.start_hk}"
              class="form-input-mini"
              placeholder="20"
              step="0.01"
            >
          </div>
        </div>
        
        <!-- Development Models (3 Columns, Compact) -->
        <div class="compact-models-row">
          
          <!-- Menge -->
          <div class="model-mini">
            <label class="label-mini">Mengenentw.</label>
            <select id="hw-menge-model-${artikel.id}" class="select-mini">
              <option value="konservativ" ${modelData.mengen_modell === 'konservativ' ? 'selected' : ''}>Konservativ (+5%)</option>
              <option value="realistisch" ${modelData.mengen_modell === 'realistisch' ? 'selected' : ''}>Realistisch (S)</option>
              <option value="optimistisch" ${modelData.mengen_modell === 'optimistisch' ? 'selected' : ''}>Optimistisch (+20%)</option>
              <option value="hockey-stick" ${modelData.mengen_modell === 'hockey-stick' ? 'selected' : ''}>Hockey-Stick</option>
            </select>
          </div>
          
          <!-- Preis -->
          <div class="model-mini">
            <label class="label-mini">Preisentw.</label>
            <select id="hw-preis-model-${artikel.id}" class="select-mini">
              <option value="konstant" ${modelData.preis_modell === 'konstant' ? 'selected' : ''}>Konstant (0%)</option>
              <option value="inflation" ${modelData.preis_modell === 'inflation' ? 'selected' : ''}>Inflation (+2%)</option>
              <option value="premium" ${modelData.preis_modell === 'premium' ? 'selected' : ''}>Premium (+5%)</option>
              <option value="skimming" ${modelData.preis_modell === 'skimming' ? 'selected' : ''}>Skimming (-3%)</option>
            </select>
          </div>
          
          <!-- Kosten -->
          <div class="model-mini">
            <label class="label-mini">Kostenentw.</label>
            <select id="hw-kosten-model-${artikel.id}" class="select-mini">
              <option value="konstant" ${modelData.kosten_modell === 'konstant' ? 'selected' : ''}>Konstant (0%)</option>
              <option value="lernkurve" ${modelData.kosten_modell === 'lernkurve' ? 'selected' : ''}>Lernkurve (-5%)</option>
              <option value="inflation" ${modelData.kosten_modell === 'inflation' ? 'selected' : ''}>Inflation (+3%)</option>
              <option value="skaleneffekte" ${modelData.kosten_modell === 'skaleneffekte' ? 'selected' : ''}>Skaleneffekte</option>
            </select>
          </div>
          
        </div>
        
        <!-- Individual Calculate Button -->
        <div class="artikel-action-compact">
          <button 
            class="btn btn-mini btn-primary" 
            onclick="window.calculateSingleArtikel('${artikel.id}')"
          >
            📊 ${artikel.name} berechnen
          </button>
        </div>
        
        <!-- Individual Preview (if calculated) -->
        <div id="preview-${artikel.id}" class="individual-preview"></div>
        
      </div>
    </div>
  `;
}

function initializeHardwareData(artikel) {
  return {
    release_date: artikel.release_datum || '2025-01',
    time_horizon: artikel.zeitraum || 5,
    start_menge: artikel.start_menge || 0,
    start_preis: artikel.start_preis || 0,
    start_hk: artikel.start_hk || 0,
    mengen_modell: artikel.mengen_modell || 'realistisch',
    preis_modell: artikel.preis_modell || 'konstant',
    kosten_modell: artikel.kosten_modell || 'lernkurve',
    calculated: false,
    forecast: null,
    expanded: true
  };
}

function getArtikelIcon(category) {
  const icons = {
    'Hardware': '📦',
    'Software': '💿',
    'Package': '📦',
    'Service': '🔧'
  };
  return icons[category] || '📋';
}

// ==========================================
// COMBINED SUMMARY
// ==========================================

function renderCombinedSummary(artikelList) {
  // Calculate combined totals
  let totalUmsatzJ1 = 0;
  let totalDB2J1 = 0;
  let allCalculated = true;
  
  artikelList.forEach(artikel => {
    const data = artikel.revenue_model_data;
    if (data && data.calculated && data.forecast) {
      totalUmsatzJ1 += data.forecast.umsaetze[0] || 0;
      totalDB2J1 += data.forecast.db2_values[0] || 0;
    } else {
      allCalculated = false;
    }
  });
  
  const avgMarge = totalUmsatzJ1 > 0 ? (totalDB2J1 / totalUmsatzJ1 * 100).toFixed(1) : 0;
  
  return `
    <div class="combined-summary">
      <h3 class="summary-title">💰 Kombinierte Übersicht (Jahr 1)</h3>
      
      <div class="summary-kpis">
        <div class="summary-kpi">
          <div class="kpi-label">Gesamt-Umsatz</div>
          <div class="kpi-value-large">${formatCurrency(totalUmsatzJ1)}</div>
        </div>
        <div class="summary-kpi">
          <div class="kpi-label">Gesamt-DB2</div>
          <div class="kpi-value-large" style="color: #059669;">${formatCurrency(totalDB2J1)}</div>
        </div>
        <div class="summary-kpi">
          <div class="kpi-label">Ø Marge</div>
          <div class="kpi-value-large" style="color: #059669;">${avgMarge}%</div>
        </div>
      </div>
      
      ${!allCalculated ? `
        <div class="summary-hint">
          ⚠️ Nicht alle Artikel wurden berechnet. Klicke "Alle berechnen" für die Gesamtvorschau.
        </div>
      ` : ''}
    </div>
  `;
}

// ==========================================
// COMBINED PREVIEW TABLE
// ==========================================

function renderCombinedPreview(artikelList) {
  // Collect all forecasts
  const forecasts = artikelList.map(artikel => ({
    name: artikel.name,
    data: artikel.revenue_model_data?.forecast
  })).filter(f => f.data != null);
  
  if (forecasts.length === 0) {
    return '<div class="no-preview">Keine Berechnungen vorhanden.</div>';
  }
  
  // Calculate combined totals per year
  const years = forecasts[0].data.years;
  const combined = {
    years: years,
    umsaetze: Array(years.length).fill(0),
    db2_values: Array(years.length).fill(0),
    db2_percents: []
  };
  
  forecasts.forEach(f => {
    f.data.umsaetze.forEach((u, i) => combined.umsaetze[i] += u);
    f.data.db2_values.forEach((db, i) => combined.db2_values[i] += db);
  });
  
  // Calculate margins
  combined.db2_percents = combined.umsaetze.map((u, i) => 
    u > 0 ? (combined.db2_values[i] / u * 100) : 0
  );
  
  return `
    <div class="combined-preview-section">
      <h3 class="section-title-compact">📊 Kombinierte Ergebnis-Vorschau</h3>
      
      <div class="preview-table-container">
        <table class="preview-table">
          <thead>
            <tr>
              <th style="width: 140px;">Artikel</th>
              ${years.map(year => `<th style="text-align: center;">${year}</th>`).join('')}
              <th style="text-align: center;">Σ</th>
            </tr>
          </thead>
          <tbody>
            ${forecasts.map(f => `
              <tr>
                <td class="row-label">${f.name}</td>
                ${f.data.umsaetze.map(u => `<td>${formatNumber(u/1000, 0)}</td>`).join('')}
                <td style="font-weight: 600;">${formatNumber(f.data.umsaetze.reduce((a,b) => a+b, 0)/1000, 0)}</td>
              </tr>
            `).join('')}
            <tr class="separator-row">
              <td colspan="${years.length + 2}"></td>
            </tr>
            <tr class="highlight-row">
              <td class="row-label"><strong>GESAMT Umsatz (T€)</strong></td>
              ${combined.umsaetze.map(u => `<td><strong>${formatNumber(u/1000, 0)}</strong></td>`).join('')}
              <td style="font-weight: 700;">${formatNumber(combined.umsaetze.reduce((a,b) => a+b, 0)/1000, 0)}</td>
            </tr>
            <tr class="highlight-row">
              <td class="row-label"><strong>GESAMT DB2 (T€)</strong></td>
              ${combined.db2_values.map(db => `<td style="color: #059669;"><strong>${formatNumber(db/1000, 0)}</strong></td>`).join('')}
              <td style="font-weight: 700; color: #059669;">${formatNumber(combined.db2_values.reduce((a,b) => a+b, 0)/1000, 0)}</td>
            </tr>
            <tr>
              <td class="row-label">DB2-Marge (%)</td>
              ${combined.db2_percents.map(pct => `<td style="color: #059669;">${formatNumber(pct, 1)}%</td>`).join('')}
              <td style="color: #059669; font-weight: 600;">
                ${formatNumber((combined.db2_values.reduce((a,b) => a+b, 0) / combined.umsaetze.reduce((a,b) => a+b, 0) * 100), 1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function attachCompactEventListeners(artikel) {
  // Horizon buttons
  document.querySelectorAll(`.horizon-btn-mini[data-artikel="${artikel.id}"]`).forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll(`.horizon-btn-mini[data-artikel="${artikel.id}"]`).forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Real-time KPI update
  ['hw-menge', 'hw-preis', 'hw-hk'].forEach(prefix => {
    const input = document.getElementById(`${prefix}-${artikel.id}`);
    if (input) {
      input.addEventListener('input', () => updateArtikelQuickStats(artikel.id));
    }
  });
}

function updateArtikelQuickStats(artikelId) {
  const menge = parseFloat(document.getElementById(`hw-menge-${artikelId}`)?.value) || 0;
  const preis = parseFloat(document.getElementById(`hw-preis-${artikelId}`)?.value) || 0;
  const hk = parseFloat(document.getElementById(`hw-hk-${artikelId}`)?.value) || 0;
  
  const umsatz = menge * preis;
  const db2 = umsatz - (menge * hk);
  const marge = umsatz > 0 ? (db2 / umsatz * 100).toFixed(1) : 0;
  
  // Update quick stats in header
  const card = document.querySelector(`.artikel-card-compact[data-artikel-id="${artikelId}"]`);
  if (card) {
    const stats = card.querySelectorAll('.artikel-quick-stats .stat');
    if (stats.length >= 3) {
      stats[0].textContent = `Umsatz J1: ${formatCurrency(umsatz)}`;
      stats[1].textContent = `DB2: ${formatCurrency(db2)}`;
      stats[2].textContent = `Marge: ${marge}%`;
    }
  }
}

// ==========================================
// WINDOW FUNCTIONS
// ==========================================

window.toggleArtikelCard = function(artikelId) {
  const card = document.querySelector(`.artikel-card-compact[data-artikel-id="${artikelId}"]`);
  if (!card) return;
  
  const content = card.querySelector('.artikel-content-compact');
  const btn = card.querySelector('.collapse-btn');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    btn.textContent = '▼';
  } else {
    content.style.display = 'none';
    btn.textContent = '▶';
  }
};

window.calculateSingleArtikel = async function(artikelId) {
  console.log('📊 Calculating single artikel:', artikelId);
  
  const artikel = window.revenueModelArtikel?.find(a => a.id === artikelId);
  if (!artikel) return;
  
  // Collect data from form
  const data = {
    release_date: document.getElementById(`hw-date-${artikelId}`)?.value,
    time_horizon: parseInt(document.querySelector(`.horizon-btn-mini[data-artikel="${artikelId}"].active`)?.dataset.years) || 5,
    start_menge: parseFloat(document.getElementById(`hw-menge-${artikelId}`)?.value) || 0,
    start_preis: parseFloat(document.getElementById(`hw-preis-${artikelId}`)?.value) || 0,
    start_hk: parseFloat(document.getElementById(`hw-hk-${artikelId}`)?.value) || 0,
    mengen_modell: document.getElementById(`hw-menge-model-${artikelId}`)?.value || 'realistisch',
    preis_modell: document.getElementById(`hw-preis-model-${artikelId}`)?.value || 'konstant',
    kosten_modell: document.getElementById(`hw-kosten-model-${artikelId}`)?.value || 'lernkurve'
  };
  
  // Validate
  if (!data.start_menge || !data.start_preis) {
    alert(`Bitte Startwerte für ${artikel.name} eingeben!`);
    return;
  }
  
  // Calculate forecast (using same logic as single view)
  const forecast = calculateForecast(data);
  data.calculated = true;
  data.forecast = forecast;
  
  // Save to artikel
  artikel.revenue_model_data = data;
  
  // Render individual preview
  const previewContainer = document.getElementById(`preview-${artikelId}`);
  if (previewContainer) {
    previewContainer.innerHTML = renderIndividualPreview(artikel.name, forecast);
  }
  
  // Update combined summary
  updateCombinedSummary();
  
  console.log('✅ Artikel calculated:', artikel.name);
};

window.calculateAllArtikel = async function() {
  console.log('📊 Calculating all selected artikel');
  
  const selectedIds = window.selectedArtikelIds || [];
  
  for (const id of selectedIds) {
    await window.calculateSingleArtikel(id);
  }
  
  // Render combined preview
  const artikelList = selectedIds.map(id => 
    window.revenueModelArtikel?.find(a => a.id === id)
  ).filter(a => a != null);
  
  const previewContainer = document.getElementById('combined-preview-container');
  if (previewContainer) {
    previewContainer.innerHTML = renderCombinedPreview(artikelList);
  }
  
  console.log('✅ All artikel calculated');
};

window.resetAllArtikel = function() {
  const confirmed = confirm('Möchten Sie alle Eingaben zurücksetzen?');
  if (!confirmed) return;
  
  const selectedIds = window.selectedArtikelIds || [];
  selectedIds.forEach(id => {
    const artikel = window.revenueModelArtikel?.find(a => a.id === id);
    if (artikel) {
      artikel.revenue_model_data = null;
    }
  });
  
  // Re-render
  renderMultiArtikelPlanning(selectedIds, 'detail-container');
};

function updateCombinedSummary() {
  const selectedIds = window.selectedArtikelIds || [];
  const artikelList = selectedIds.map(id => 
    window.revenueModelArtikel?.find(a => a.id === id)
  ).filter(a => a != null);
  
  const summaryContainer = document.querySelector('.combined-summary');
  if (summaryContainer) {
    summaryContainer.outerHTML = renderCombinedSummary(artikelList);
  }
}

function renderIndividualPreview(artikelName, forecast) {
  if (!forecast) return '';
  
  return `
    <div class="individual-preview-table">
      <table class="preview-table-mini">
        <thead>
          <tr>
            <th>Jahr</th>
            ${forecast.years.map(y => `<th>${y}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Umsatz (T€)</td>
            ${forecast.umsaetze.map(u => `<td>${formatNumber(u/1000, 0)}</td>`).join('')}
          </tr>
          <tr>
            <td>DB2 (T€)</td>
            ${forecast.db2_values.map(db => `<td style="color: #059669;">${formatNumber(db/1000, 0)}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// ==========================================
// CALCULATION ENGINE (from original)
// ==========================================

function calculateForecast(data) {
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    years: [],
    mengen: [],
    preise: [],
    kosten: [],
    umsaetze: [],
    db2_values: [],
    db2_percents: []
  };
  
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    forecast.years.push(year);
    
    const menge = calculateMenge(data, i);
    forecast.mengen.push(menge);
    
    const preis = calculatePreis(data, i);
    forecast.preise.push(preis);
    
    const kosten = calculateKosten(data, i, menge);
    forecast.kosten.push(kosten);
    
    const umsatz = menge * preis;
    forecast.umsaetze.push(umsatz);
    
    const kostenTotal = menge * kosten;
    const db2 = umsatz - kostenTotal;
    forecast.db2_values.push(db2);
    
    const db2Percent = umsatz > 0 ? (db2 / umsatz * 100) : 0;
    forecast.db2_percents.push(db2Percent);
  }
  
  return forecast;
}

function calculateMenge(data, yearIndex) {
  const startMenge = data.start_menge;
  
  switch (data.mengen_modell) {
    case 'konservativ':
      return startMenge * Math.pow(1.05, yearIndex);
    
    case 'realistisch':
      const t = yearIndex;
      const maxYears = data.time_horizon;
      const growthPhase = Math.min(t / (maxYears * 0.4), 1);
      const maturePhase = t > (maxYears * 0.4) ? (t - maxYears * 0.4) / (maxYears * 0.3) : 0;
      const declinePhase = t > (maxYears * 0.7) ? (t - maxYears * 0.7) / (maxYears * 0.3) : 0;
      
      let multiplier = 1;
      if (growthPhase < 1) {
        multiplier = 1 + growthPhase * 0.8;
      } else if (maturePhase < 1) {
        multiplier = 1.8 + maturePhase * 0.2;
      } else {
        multiplier = 2.0 - declinePhase * 0.3;
      }
      return startMenge * multiplier;
    
    case 'optimistisch':
      return startMenge * Math.pow(1.20, yearIndex);
    
    case 'hockey-stick':
      if (yearIndex <= 1) {
        return startMenge * Math.pow(1.10, yearIndex);
      } else {
        return startMenge * 1.10 * Math.pow(1.50, yearIndex - 1);
      }
    
    default:
      return startMenge;
  }
}

function calculatePreis(data, yearIndex) {
  const startPreis = data.start_preis;
  
  switch (data.preis_modell) {
    case 'konstant':
      return startPreis;
    case 'inflation':
      return startPreis * Math.pow(1.02, yearIndex);
    case 'premium':
      return startPreis * Math.pow(1.05, yearIndex);
    case 'skimming':
      return startPreis * Math.pow(0.97, yearIndex);
    default:
      return startPreis;
  }
}

function calculateKosten(data, yearIndex, currentMenge) {
  const startHK = data.start_hk;
  const startMenge = data.start_menge;
  
  switch (data.kosten_modell) {
    case 'konstant':
      return startHK;
    case 'lernkurve':
      const doublings = Math.log2(currentMenge / startMenge);
      return startHK * Math.pow(0.95, doublings);
    case 'inflation':
      return startHK * Math.pow(1.03, yearIndex);
    case 'skaleneffekte':
      if (currentMenge < 5000) return startHK;
      else if (currentMenge < 10000) return startHK * 0.90;
      else return startHK * 0.80;
    default:
      return startHK;
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
// STYLES FOR MULTI-ARTIKEL VIEW
// ==========================================

function renderMultiArtikelStyles() {
  return `
    <style>
      /* ===== MULTI-ARTIKEL CONTAINER ===== */
      .multi-artikel-container {
        padding: 20px;
        background: #f9fafb;
        min-height: 600px;
      }
      
      .multi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .multi-header h2 {
        margin: 0;
        font-size: 20px;
        color: #1f2937;
      }
      
      .multi-badge {
        padding: 6px 16px;
        background: #2563eb;
        color: white;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
      }
      
      /* ===== ARTIKEL STACK ===== */
      .artikel-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .artikel-card-compact {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.2s;
      }
      
      .artikel-card-compact:hover {
        border-color: #3b82f6;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
      }
      
      /* ===== ARTIKEL HEADER (Collapsible) ===== */
      .artikel-header-compact {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        background: #f9fafb;
        cursor: pointer;
        user-select: none;
      }
      
      .artikel-header-compact:hover {
        background: #f3f4f6;
      }
      
      .artikel-title-compact {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        min-width: 180px;
      }
      
      .artikel-icon {
        font-size: 20px;
      }
      
      .artikel-quick-stats {
        display: flex;
        gap: 20px;
        flex: 1;
      }
      
      .artikel-quick-stats .stat {
        font-size: 12px;
        color: #6b7280;
      }
      
      .collapse-btn {
        padding: 4px 12px;
        background: #e5e7eb;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .collapse-btn:hover {
        background: #d1d5db;
      }
      
      /* ===== ARTIKEL CONTENT ===== */
      .artikel-content-compact {
        padding: 16px;
      }
      
      .compact-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-bottom: 12px;
      }
      
      .compact-input-group {
        display: flex;
        flex-direction: column;
      }
      
      .label-mini {
        font-size: 11px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 4px;
      }
      
      .form-input-mini {
        padding: 6px 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 13px;
      }
      
      .form-input-mini:focus {
        outline: none;
        border-color: #3b82f6;
      }
      
      .select-mini {
        padding: 6px 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 12px;
        background: white;
        cursor: pointer;
      }
      
      .select-mini:focus {
        outline: none;
        border-color: #3b82f6;
      }
      
      /* ===== HORIZON BUTTONS (Mini) ===== */
      .horizon-mini {
        display: flex;
        gap: 4px;
      }
      
      .horizon-btn-mini {
        flex: 1;
        padding: 6px 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .horizon-btn-mini:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .horizon-btn-mini.active {
        border-color: #2563eb;
        background: #2563eb;
        color: white;
      }
      
      /* ===== DEVELOPMENT MODELS (Compact) ===== */
      .compact-models-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 12px;
      }
      
      .model-mini {
        display: flex;
        flex-direction: column;
      }
      
      /* ===== ARTIKEL ACTION ===== */
      .artikel-action-compact {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
        border-top: 1px solid #e5e7eb;
      }
      
      .btn-mini {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-mini.btn-primary {
        background: #2563eb;
        color: white;
      }
      
      .btn-mini.btn-primary:hover {
        background: #1d4ed8;
      }
      
      /* ===== INDIVIDUAL PREVIEW ===== */
      .individual-preview {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
      }
      
      .individual-preview-table {
        overflow-x: auto;
      }
      
      .preview-table-mini {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }
      
      .preview-table-mini th,
      .preview-table-mini td {
        padding: 6px;
        border: 1px solid #e5e7eb;
        text-align: center;
      }
      
      .preview-table-mini th {
        background: #f9fafb;
        font-weight: 600;
      }
      
      /* ===== COMBINED SUMMARY ===== */
      .combined-summary {
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }
      
      .summary-title {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .summary-kpis {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      
      .summary-kpi {
        text-align: center;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
      }
      
      .kpi-label {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
      }
      
      .kpi-value-large {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .summary-hint {
        margin-top: 16px;
        padding: 12px;
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        border-radius: 4px;
        font-size: 13px;
        color: #92400e;
      }
      
      /* ===== COMBINED ACTIONS ===== */
      .combined-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-bottom: 20px;
      }
      
      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-secondary-compact {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
      }
      
      .btn-secondary-compact:hover {
        background: #e5e7eb;
      }
      
      .btn-primary-compact {
        background: #2563eb;
        color: white;
      }
      
      .btn-primary-compact:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
      }
      
      /* ===== COMBINED PREVIEW ===== */
      .combined-preview-section {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
      }
      
      .section-title-compact {
        margin: 0 0 12px;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .preview-table-container {
        overflow-x: auto;
      }
      
      .preview-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      
      .preview-table th {
        padding: 8px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        font-weight: 600;
        font-size: 11px;
      }
      
      .preview-table td {
        padding: 6px 8px;
        border: 1px solid #e5e7eb;
        text-align: right;
      }
      
      .preview-table .row-label {
        text-align: left;
        font-weight: 500;
        background: #f9fafb;
      }
      
      .preview-table .highlight-row {
        background: #fffbeb;
      }
      
      .preview-table .separator-row td {
        padding: 2px;
        border: none;
      }
      
      .no-preview {
        padding: 40px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderMultiArtikelPlanning,
  calculateForecast
};
