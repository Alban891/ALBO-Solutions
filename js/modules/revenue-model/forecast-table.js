/**
 * FORECAST TABLE COMPONENT
 * "Harte" Tabelle für Szenario-Analysen und Export
 * 
 * Zeigt pro Jahr:
 * - Menge, Preis, HK
 * - Umsatz, Kosten, DB2, Marge
 */

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

/**
 * Render forecast table for single artikel
 * @param {Object} forecastData - Calculated forecast data
 * @param {string} containerId - DOM container ID
 */
export function renderForecastTable(forecastData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('📊 Rendering Forecast Table');
  
  container.innerHTML = `
    <div class="forecast-table-section">
      <div class="forecast-table-header">
        <h3 class="forecast-table-title">📊 Revenue Forecast</h3>
        <div class="forecast-table-actions">
          <button class="btn-export" onclick="window.exportForecastToExcel()">
            📥 Export Excel
          </button>
          <button class="btn-export" onclick="window.copyForecastToClipboard()">
            📋 Kopieren
          </button>
        </div>
      </div>
      
      <div class="forecast-table-container">
        <table class="forecast-table">
          <thead>
            <tr>
              <th class="col-position">Position</th>
              ${forecastData.years.map(year => `<th class="col-year">${year}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <!-- Input Metrics -->
            ${renderInputMetrics(forecastData)}
            
            <!-- Separator -->
            <tr class="separator-row">
              <td colspan="${forecastData.years.length + 1}"></td>
            </tr>
            
            <!-- Output Metrics -->
            ${renderOutputMetrics(forecastData)}
          </tbody>
        </table>
      </div>
      
      <!-- Summary Cards -->
      ${renderSummaryCards(forecastData)}
    </div>
    
    ${renderForecastTableStyles()}
  `;
  
  // Store data for export
  window._currentForecastData = forecastData;
}

// ==========================================
// MULTI-ARTIKEL FORECAST TABLE
// ==========================================

/**
 * Render combined forecast table for multiple artikel
 * @param {Array} artikelForecasts - Array of forecast data objects
 * @param {string} containerId - DOM container ID
 */
export function renderMultiForecastTable(artikelForecasts, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('📊 Rendering Multi-Artikel Forecast Table');
  
  // Get common years (assume all have same years)
  const years = artikelForecasts[0].years;
  
  // Calculate totals
  const totals = calculateTotals(artikelForecasts, years);
  
  container.innerHTML = `
    <div class="forecast-table-section">
      <div class="forecast-table-header">
        <h3 class="forecast-table-title">📊 Kombinierte Revenue Forecast (${artikelForecasts.length} Artikel)</h3>
        <div class="forecast-table-actions">
          <button class="btn-export" onclick="window.exportMultiForecastToExcel()">
            📥 Export Excel
          </button>
        </div>
      </div>
      
      <div class="forecast-table-container">
        <table class="forecast-table forecast-table-multi">
          <thead>
            <tr>
              <th class="col-position">Position</th>
              ${years.map(year => `<th class="col-year">${year}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${renderMultiArtikelRows(artikelForecasts, years)}
            
            <!-- Separator -->
            <tr class="separator-row">
              <td colspan="${years.length + 1}"></td>
            </tr>
            
            <!-- Totals -->
            ${renderTotalRows(totals, years)}
          </tbody>
        </table>
      </div>
      
      <!-- Multi Summary -->
      ${renderMultiSummaryCards(totals)}
    </div>
    
    ${renderForecastTableStyles()}
  `;
  
  // Store data for export
  window._currentMultiForecastData = artikelForecasts;
}

// ==========================================
// INPUT METRICS RENDERING
// ==========================================

function renderInputMetrics(data) {
  return `
    <tr class="row-input">
      <td class="col-label">Menge (Stück)</td>
      ${data.volume.map(v => `<td class="col-value">${formatNumber(v, 0)}</td>`).join('')}
    </tr>
    <tr class="row-input">
      <td class="col-label">Preis (€/Stück)</td>
      ${data.price.map(p => `<td class="col-value">${formatNumber(p, 2)}</td>`).join('')}
    </tr>
    <tr class="row-input">
      <td class="col-label">HK (€/Stück)</td>
      ${data.cost.map(c => `<td class="col-value">${formatNumber(c, 2)}</td>`).join('')}
    </tr>
  `;
}

// ==========================================
// OUTPUT METRICS RENDERING
// ==========================================

function renderOutputMetrics(data) {
  return `
    <tr class="row-output row-revenue">
      <td class="col-label">Umsatz (T€)</td>
      ${data.revenue.map(r => `<td class="col-value">${formatNumber(r / 1000, 0)}</td>`).join('')}
    </tr>
    <tr class="row-output row-costs">
      <td class="col-label">Kosten (T€)</td>
      ${data.totalCost.map(c => `<td class="col-value col-negative">${formatNumber(c / 1000, 0)}</td>`).join('')}
    </tr>
    <tr class="row-output row-db2">
      <td class="col-label">DB2 (T€)</td>
      ${data.db2.map(db => `<td class="col-value col-positive">${formatNumber(db / 1000, 0)}</td>`).join('')}
    </tr>
    <tr class="row-output row-margin">
      <td class="col-label">DB2 Marge (%)</td>
      ${data.db2Margin.map(m => `<td class="col-value col-percentage">${formatNumber(m, 1)}%</td>`).join('')}
    </tr>
  `;
}

// ==========================================
// MULTI-ARTIKEL ROWS
// ==========================================

function renderMultiArtikelRows(artikelForecasts, years) {
  let html = '';
  
  artikelForecasts.forEach((forecast, index) => {
    const icon = getArtikelIcon(forecast.type);
    
    html += `
      <!-- Artikel ${index + 1} Header -->
      <tr class="row-artikel-header">
        <td class="col-label" colspan="${years.length + 1}">
          ${icon} ${forecast.name}
        </td>
      </tr>
      
      <!-- Artikel Metrics -->
      <tr class="row-artikel-data">
        <td class="col-label indent">└─ Umsatz (T€)</td>
        ${forecast.revenue.map(r => `<td class="col-value">${formatNumber(r / 1000, 0)}</td>`).join('')}
      </tr>
      <tr class="row-artikel-data">
        <td class="col-label indent">└─ Kosten (T€)</td>
        ${forecast.totalCost.map(c => `<td class="col-value col-negative">${formatNumber(c / 1000, 0)}</td>`).join('')}
      </tr>
      <tr class="row-artikel-data">
        <td class="col-label indent">└─ DB2 (T€)</td>
        ${forecast.db2.map(db => `<td class="col-value col-positive">${formatNumber(db / 1000, 0)}</td>`).join('')}
      </tr>
      
      ${index < artikelForecasts.length - 1 ? '<tr class="spacer-row"><td colspan="' + (years.length + 1) + '"></td></tr>' : ''}
    `;
  });
  
  return html;
}

// ==========================================
// TOTAL ROWS
// ==========================================

function renderTotalRows(totals, years) {
  return `
    <tr class="row-total">
      <td class="col-label">💰 = GESAMT</td>
      <td colspan="${years.length}"></td>
    </tr>
    <tr class="row-total-data">
      <td class="col-label indent">└─ Umsatz (T€)</td>
      ${totals.revenue.map(r => `<td class="col-value col-bold">${formatNumber(r / 1000, 0)}</td>`).join('')}
    </tr>
    <tr class="row-total-data">
      <td class="col-label indent">└─ Kosten (T€)</td>
      ${totals.totalCost.map(c => `<td class="col-value col-bold col-negative">${formatNumber(c / 1000, 0)}</td>`).join('')}
    </tr>
    <tr class="row-total-data">
      <td class="col-label indent">└─ DB2 (T€)</td>
      ${totals.db2.map(db => `<td class="col-value col-bold col-positive">${formatNumber(db / 1000, 0)}</td>`).join('')}
    </tr>
    <tr class="row-total-data">
      <td class="col-label indent">└─ DB2 Marge (%)</td>
      ${totals.db2Margin.map(m => `<td class="col-value col-bold col-percentage">${formatNumber(m, 1)}%</td>`).join('')}
    </tr>
  `;
}

// ==========================================
// SUMMARY CARDS
// ==========================================

function renderSummaryCards(data) {
  const totalRevenue = data.revenue.reduce((a, b) => a + b, 0);
  const totalDB2 = data.db2.reduce((a, b) => a + b, 0);
  const avgMargin = (totalDB2 / totalRevenue) * 100;
  const peakRevenue = Math.max(...data.revenue);
  
  return `
    <div class="forecast-summary-cards">
      <div class="summary-card">
        <div class="summary-label">Total Revenue</div>
        <div class="summary-value">${formatCurrency(totalRevenue)}</div>
        <div class="summary-hint">Über ${data.years.length} Jahre</div>
      </div>
      
      <div class="summary-card">
        <div class="summary-label">Total DB2</div>
        <div class="summary-value summary-positive">${formatCurrency(totalDB2)}</div>
        <div class="summary-hint">Gesamtbeitrag</div>
      </div>
      
      <div class="summary-card">
        <div class="summary-label">Avg. Marge</div>
        <div class="summary-value">${formatNumber(avgMargin, 1)}%</div>
        <div class="summary-hint">Durchschnitt</div>
      </div>
      
      <div class="summary-card">
        <div class="summary-label">Peak Revenue</div>
        <div class="summary-value">${formatCurrency(peakRevenue)}</div>
        <div class="summary-hint">Jahr ${data.years[data.revenue.indexOf(peakRevenue)]}</div>
      </div>
    </div>
  `;
}

function renderMultiSummaryCards(totals) {
  const totalRevenue = totals.revenue.reduce((a, b) => a + b, 0);
  const totalDB2 = totals.db2.reduce((a, b) => a + b, 0);
  const avgMargin = (totalDB2 / totalRevenue) * 100;
  
  return `
    <div class="forecast-summary-cards">
      <div class="summary-card">
        <div class="summary-label">Gesamt-Umsatz</div>
        <div class="summary-value">${formatCurrency(totalRevenue)}</div>
        <div class="summary-hint">Alle Artikel</div>
      </div>
      
      <div class="summary-card">
        <div class="summary-label">Gesamt-DB2</div>
        <div class="summary-value summary-positive">${formatCurrency(totalDB2)}</div>
        <div class="summary-hint">Kombiniert</div>
      </div>
      
      <div class="summary-card">
        <div class="summary-label">Ø Marge</div>
        <div class="summary-value">${formatNumber(avgMargin, 1)}%</div>
        <div class="summary-hint">Gewichtet</div>
      </div>
    </div>
  `;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function calculateTotals(artikelForecasts, years) {
  const totals = {
    revenue: new Array(years.length).fill(0),
    totalCost: new Array(years.length).fill(0),
    db2: new Array(years.length).fill(0),
    db2Margin: []
  };
  
  artikelForecasts.forEach(forecast => {
    forecast.revenue.forEach((value, i) => {
      totals.revenue[i] += value;
    });
    forecast.totalCost.forEach((value, i) => {
      totals.totalCost[i] += value;
    });
    forecast.db2.forEach((value, i) => {
      totals.db2[i] += value;
    });
  });
  
  // Calculate weighted average margin
  totals.db2Margin = totals.revenue.map((rev, i) => {
    return rev > 0 ? (totals.db2[i] / rev) * 100 : 0;
  });
  
  return totals;
}

function getArtikelIcon(type) {
  const icons = {
    'hardware': '📦',
    'package': '📊',
    'software': '💿',
    'services': '👔',
    'subscription': '🔄'
  };
  return icons[type] || '📈';
}

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
// EXPORT FUNCTIONS
// ==========================================

window.exportForecastToExcel = function() {
  const data = window._currentForecastData;
  if (!data) {
    alert('Keine Daten zum Export verfügbar!');
    return;
  }
  
  // TODO: Implement Excel export
  console.log('📥 Export to Excel:', data);
  alert('Excel Export wird in der nächsten Version implementiert!');
};

window.copyForecastToClipboard = function() {
  const data = window._currentForecastData;
  if (!data) {
    alert('Keine Daten zum Kopieren verfügbar!');
    return;
  }
  
  // Create tab-separated text
  let text = 'Position\t' + data.years.join('\t') + '\n';
  text += 'Menge\t' + data.volume.join('\t') + '\n';
  text += 'Preis\t' + data.price.map(p => p.toFixed(2)).join('\t') + '\n';
  text += 'HK\t' + data.cost.map(c => c.toFixed(2)).join('\t') + '\n';
  text += '\n';
  text += 'Umsatz (T€)\t' + data.revenue.map(r => (r/1000).toFixed(0)).join('\t') + '\n';
  text += 'Kosten (T€)\t' + data.totalCost.map(c => (c/1000).toFixed(0)).join('\t') + '\n';
  text += 'DB2 (T€)\t' + data.db2.map(db => (db/1000).toFixed(0)).join('\t') + '\n';
  text += 'DB2 Marge %\t' + data.db2Margin.map(m => m.toFixed(1) + '%').join('\t') + '\n';
  
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Forecast-Daten in Zwischenablage kopiert!\n\nJetzt in Excel einfügen (Strg+V)');
  }).catch(err => {
    console.error('Clipboard error:', err);
    alert('❌ Fehler beim Kopieren');
  });
};

window.exportMultiForecastToExcel = function() {
  const data = window._currentMultiForecastData;
  if (!data) {
    alert('Keine Daten zum Export verfügbar!');
    return;
  }
  
  // TODO: Implement Excel export for multi
  console.log('📥 Export Multi to Excel:', data);
  alert('Excel Export wird in der nächsten Version implementiert!');
};

// ==========================================
// STYLES
// ==========================================

function renderForecastTableStyles() {
  return `
    <style>
      .forecast-table-section {
        margin-top: 32px;
        padding: 24px;
        background: white;
        border: 2px solid #2563eb;
        border-radius: 12px;
      }
      
      .forecast-table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .forecast-table-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .forecast-table-actions {
        display: flex;
        gap: 8px;
      }
      
      .btn-export {
        padding: 8px 16px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-export:hover {
        background: #f3f4f6;
        border-color: #3b82f6;
      }
      
      /* Table Container */
      .forecast-table-container {
        overflow-x: auto;
        margin-bottom: 24px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      
      .forecast-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      
      .forecast-table th {
        padding: 12px 16px;
        background: #f9fafb;
        border-bottom: 2px solid #e5e7eb;
        font-weight: 600;
        text-align: left;
        color: #374151;
        white-space: nowrap;
      }
      
      .forecast-table .col-year {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      
      .forecast-table td {
        padding: 10px 16px;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .forecast-table .col-label {
        font-weight: 500;
        color: #1f2937;
        white-space: nowrap;
      }
      
      .forecast-table .col-value {
        text-align: right;
        font-variant-numeric: tabular-nums;
        color: #1f2937;
      }
      
      /* Row Styles */
      .row-input {
        background: #fafafa;
      }
      
      .row-output {
        background: white;
      }
      
      .row-revenue {
        background: #eff6ff;
      }
      
      .row-db2 {
        background: #dcfce7;
        font-weight: 600;
      }
      
      .row-margin {
        background: #dbeafe;
      }
      
      .separator-row {
        height: 8px;
        background: #f9fafb;
      }
      
      .separator-row td {
        padding: 0;
        border: none;
      }
      
      /* Value Colors */
      .col-negative {
        color: #ef4444;
      }
      
      .col-positive {
        color: #059669;
        font-weight: 600;
      }
      
      .col-percentage {
        color: #2563eb;
      }
      
      /* Multi-Artikel Styles */
      .row-artikel-header td {
        padding: 16px 16px 8px;
        background: #f9fafb;
        font-weight: 700;
        font-size: 15px;
        color: #1f2937;
        border-bottom: none;
      }
      
      .row-artikel-data {
        background: white;
      }
      
      .row-artikel-data .col-label {
        padding-left: 32px;
        color: #6b7280;
        font-weight: 500;
      }
      
      .spacer-row {
        height: 4px;
        background: transparent;
      }
      
      .spacer-row td {
        padding: 0;
        border: none;
      }
      
      .row-total {
        background: #1e3a8a;
        color: white;
      }
      
      .row-total td {
        padding: 12px 16px;
        font-weight: 700;
        font-size: 15px;
        color: white;
        border-top: 2px solid #1e3a8a;
        border-bottom: none;
      }
      
      .row-total-data {
        background: #dbeafe;
        font-weight: 600;
      }
      
      .row-total-data .col-label {
        padding-left: 32px;
      }
      
      .col-bold {
        font-weight: 700;
      }
      
      .indent {
        padding-left: 32px;
      }
      
      /* Summary Cards */
      .forecast-summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-top: 24px;
      }
      
      .summary-card {
        padding: 16px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      
      .summary-label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .summary-value {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .summary-value.summary-positive {
        color: #059669;
      }
      
      .summary-hint {
        font-size: 11px;
        color: #9ca3af;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .forecast-table-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        
        .forecast-table {
          font-size: 12px;
        }
        
        .forecast-table th,
        .forecast-table td {
          padding: 8px 12px;
        }
        
        .summary-value {
          font-size: 20px;
        }
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderForecastTable,
  renderMultiForecastTable
};
