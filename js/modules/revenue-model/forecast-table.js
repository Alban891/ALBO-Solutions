/**
 * FORECAST TABLE - COMPACT VERSION
 * Kompakteres Design, keine Summary Cards, immer sichtbar
 */

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export function renderForecastTable(forecastData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  container.innerHTML = `
    <div class="forecast-table-compact">
      <div class="forecast-header-compact">
        <h3 class="forecast-title-compact">📊 Revenue Forecast</h3>
        <div class="forecast-actions-compact">
          <button class="btn-action-compact" onclick="window.copyForecastToClipboard()" title="In Zwischenablage kopieren">
            📋 Kopieren
          </button>
        </div>
      </div>
      
      <div class="forecast-table-wrapper">
        <table class="forecast-table">
          <thead>
            <tr>
              <th class="col-position">Position</th>
              ${forecastData.years.map(year => `<th class="col-year">${year}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <!-- Input Metrics -->
            <tr class="row-input">
              <td class="col-label">Menge (Stück)</td>
              ${forecastData.volume.map(v => `<td class="col-value">${formatNumber(v, 0)}</td>`).join('')}
            </tr>
            <tr class="row-input">
              <td class="col-label">Preis (€/Stück)</td>
              ${forecastData.price.map(p => `<td class="col-value">${formatNumber(p, 2)}</td>`).join('')}
            </tr>
            <tr class="row-input">
              <td class="col-label">HK (€/Stück)</td>
              ${forecastData.cost.map(c => `<td class="col-value">${formatNumber(c, 2)}</td>`).join('')}
            </tr>
            
            <!-- Separator -->
            <tr class="separator-row">
              <td colspan="${forecastData.years.length + 1}"></td>
            </tr>
            
            <!-- Output Metrics -->
            <tr class="row-output row-revenue">
              <td class="col-label">Umsatz (T€)</td>
              ${forecastData.revenue.map(r => `<td class="col-value">${formatNumber(r / 1000, 0)}</td>`).join('')}
            </tr>
            <tr class="row-output row-costs">
              <td class="col-label">Kosten (T€)</td>
              ${forecastData.totalCost.map(c => `<td class="col-value col-negative">${formatNumber(c / 1000, 0)}</td>`).join('')}
            </tr>
            <tr class="row-output row-db2">
              <td class="col-label">DB2 (T€)</td>
              ${forecastData.db2.map(db => `<td class="col-value col-positive">${formatNumber(db / 1000, 0)}</td>`).join('')}
            </tr>
            <tr class="row-output row-margin">
              <td class="col-label">DB2 Marge (%)</td>
              ${forecastData.db2Margin.map(m => `<td class="col-value col-percentage">${formatNumber(m, 1)}%</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    ${renderCompactTableStyles()}
  `;
  
  // Store data for export
  window._currentForecastData = forecastData;
}

// ==========================================
// MULTI-ARTIKEL FORECAST TABLE
// ==========================================

export function renderMultiForecastTable(artikelForecasts, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  const years = artikelForecasts[0].years;
  const totals = calculateTotals(artikelForecasts, years);
  
  container.innerHTML = `
    <div class="forecast-table-compact">
      <div class="forecast-header-compact">
        <h3 class="forecast-title-compact">📊 Kombinierte Revenue Forecast (${artikelForecasts.length} Artikel)</h3>
        <div class="forecast-actions-compact">
          <button class="btn-action-compact" onclick="window.copyForecastToClipboard()">
            📋 Kopieren
          </button>
        </div>
      </div>
      
      <div class="forecast-table-wrapper">
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
    </div>
    
    ${renderCompactTableStyles()}
  `;
  
  window._currentMultiForecastData = artikelForecasts;
}

// ==========================================
// MULTI-ARTIKEL ROWS
// ==========================================

function renderMultiArtikelRows(artikelForecasts, years) {
  let html = '';
  
  artikelForecasts.forEach((forecast, index) => {
    const icon = getArtikelIcon(forecast.type);
    
    html += `
      <tr class="row-artikel-header">
        <td class="col-label" colspan="${years.length + 1}">
          ${icon} ${forecast.name}
        </td>
      </tr>
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

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

window.copyForecastToClipboard = function() {
  const data = window._currentForecastData;
  if (!data) {
    alert('Keine Daten zum Kopieren verfügbar!');
    return;
  }
  
  let text = 'Position\t' + data.years.join('\t') + '\n';
  text += 'Menge\t' + data.volume.map(v => formatNumber(v, 0)).join('\t') + '\n';
  text += 'Preis\t' + data.price.map(p => formatNumber(p, 2)).join('\t') + '\n';
  text += 'HK\t' + data.cost.map(c => formatNumber(c, 2)).join('\t') + '\n';
  text += '\n';
  text += 'Umsatz (T€)\t' + data.revenue.map(r => formatNumber(r/1000, 0)).join('\t') + '\n';
  text += 'Kosten (T€)\t' + data.totalCost.map(c => formatNumber(c/1000, 0)).join('\t') + '\n';
  text += 'DB2 (T€)\t' + data.db2.map(db => formatNumber(db/1000, 0)).join('\t') + '\n';
  text += 'DB2 Marge %\t' + data.db2Margin.map(m => formatNumber(m, 1) + '%').join('\t') + '\n';
  
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Forecast in Zwischenablage kopiert!\n\nJetzt in Excel einfügen (Strg+V)');
  }).catch(err => {
    console.error('Clipboard error:', err);
    alert('❌ Fehler beim Kopieren');
  });
};

// ==========================================
// COMPACT STYLES
// ==========================================

function renderCompactTableStyles() {
  return `
    <style>
      .forecast-table-compact {
        margin-top: 12px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
      }
      
      .forecast-header-compact {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      
      .forecast-title-compact {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .forecast-actions-compact {
        display: flex;
        gap: 6px;
      }
      
      .btn-action-compact {
        padding: 4px 10px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-action-compact:hover {
        background: #f3f4f6;
        border-color: #3b82f6;
      }
      
      /* Table Wrapper */
      .forecast-table-wrapper {
        overflow-x: auto;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
      }
      
      .forecast-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      
      .forecast-table th {
        padding: 8px 10px;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
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
        padding: 6px 10px;
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
        height: 4px;
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
        padding: 10px 10px 6px;
        background: #f9fafb;
        font-weight: 700;
        font-size: 13px;
        color: #1f2937;
        border-bottom: none;
      }
      
      .row-artikel-data {
        background: white;
      }
      
      .row-artikel-data .col-label {
        padding-left: 24px;
        color: #6b7280;
        font-weight: 500;
      }
      
      .spacer-row {
        height: 2px;
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
        padding: 8px 10px;
        font-weight: 700;
        font-size: 13px;
        color: white;
        border-top: 2px solid #1e3a8a;
        border-bottom: none;
      }
      
      .row-total-data {
        background: #dbeafe;
        font-weight: 600;
      }
      
      .row-total-data .col-label {
        padding-left: 24px;
      }
      
      .col-bold {
        font-weight: 700;
      }
      
      .indent {
        padding-left: 24px;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .forecast-table {
          font-size: 11px;
        }
        
        .forecast-table th,
        .forecast-table td {
          padding: 6px 8px;
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
