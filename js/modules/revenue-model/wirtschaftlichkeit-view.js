/**
 * WIRTSCHAFTLICHKEITS-VIEW
 * Eigenständiger Tab: Zeigt aggregierte Forecast-Tabelle aller Artikel
 * Basis für weitere Analysen (Szenario, Cash Flow, Break-Even)
 */

import { subscribeToStateChanges, getAggregatedForecast, getForecastSummary, getAllForecasts } from './revenue-state-manager.js';

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

/**
 * Render Wirtschaftlichkeits-View
 * @param {string} containerId - DOM container ID
 */
export function renderWirtschaftlichkeitsView(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('📊 Rendering Wirtschaftlichkeits-View');
  
  container.innerHTML = `
    <div class="wirtschaftlichkeit-view">
      
      <!-- Header -->
      <div class="view-header">
        <div class="view-title-section">
          <h2 class="view-title">📊 Wirtschaftlichkeit</h2>
          <p class="view-subtitle">Revenue Forecast aller Artikel</p>
        </div>
        <div class="view-actions">
          <button class="btn-action" onclick="window.exportWirtschaftlichkeit()">
            📥 Export Excel
          </button>
          <button class="btn-action" onclick="window.copyWirtschaftlichkeit()">
            📋 Kopieren
          </button>
          <button class="btn-action" onclick="window.refreshWirtschaftlichkeit()">
            🔄 Aktualisieren
          </button>
        </div>
      </div>
      
      <!-- Summary Cards -->
      <div id="summary-cards-container">
        ${renderSummaryCards()}
      </div>
      
      <!-- Forecast Table -->
      <div id="forecast-table-container">
        ${renderForecastTable()}
      </div>
      
    </div>
    
    ${renderWirtschaftlichkeitStyles()}
  `;
  
  // Subscribe to state changes
  subscribeToStateChanges(() => {
    updateView();
  });
  
  console.log('✅ Wirtschaftlichkeits-View rendered');
}

// ==========================================
// UPDATE VIEW
// ==========================================

function updateView() {
  console.log('🔄 Updating Wirtschaftlichkeits-View');
  
  // Update summary cards
  const summaryContainer = document.getElementById('summary-cards-container');
  if (summaryContainer) {
    summaryContainer.innerHTML = renderSummaryCards();
  }
  
  // Update forecast table
  const tableContainer = document.getElementById('forecast-table-container');
  if (tableContainer) {
    tableContainer.innerHTML = renderForecastTable();
  }
}

// ==========================================
// SUMMARY CARDS
// ==========================================

function renderSummaryCards() {
  const summary = getForecastSummary();
  
  if (summary.artikelCount === 0) {
    return `
      <div class="summary-empty">
        <div class="empty-icon">📊</div>
        <p class="empty-title">Noch keine Forecasts</p>
        <p class="empty-subtitle">Wählen Sie einen Artikel und erstellen Sie einen Forecast</p>
      </div>
    `;
  }
  
  return `
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon">📦</div>
        <div class="card-content">
          <div class="card-label">Artikel</div>
          <div class="card-value">${summary.artikelCount}</div>
          <div class="card-hint">Geplant</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <div class="card-label">Gesamt-Umsatz</div>
          <div class="card-value">${formatCurrency(summary.totalRevenue)}</div>
          <div class="card-hint">Kumuliert</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <div class="card-label">Gesamt-DB2</div>
          <div class="card-value card-positive">${formatCurrency(summary.totalDB2)}</div>
          <div class="card-hint">Kumuliert</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">%</div>
        <div class="card-content">
          <div class="card-label">Ø DB2 Marge</div>
          <div class="card-value">${formatNumber(summary.avgMargin, 1)}%</div>
          <div class="card-hint">Gewichtet</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">🎯</div>
        <div class="card-content">
          <div class="card-label">Peak Revenue</div>
          <div class="card-value">${formatCurrency(summary.peakRevenue)}</div>
          <div class="card-hint">Jahr ${summary.peakYear || '-'}</div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// FORECAST TABLE
// ==========================================

function renderForecastTable() {
  const forecasts = getAllForecasts();
  const artikelArray = Object.values(forecasts);
  
  if (artikelArray.length === 0) {
    return `
      <div class="table-empty">
        <div class="empty-icon">📊</div>
        <p class="empty-title">Keine Forecast-Daten</p>
        <p class="empty-subtitle">Erstellen Sie Forecasts für Ihre Artikel</p>
      </div>
    `;
  }
  
  const aggregated = getAggregatedForecast();
  const years = aggregated.years;
  
  return `
    <div class="forecast-table-section">
      <h3 class="table-title">📊 Detaillierte Übersicht</h3>
      
      <div class="forecast-table-wrapper">
        <table class="forecast-table">
          <thead>
            <tr>
              <th class="col-position">Position</th>
              ${years.map(year => `<th class="col-year">${year}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <!-- Einzelne Artikel -->
            ${renderArtikelRows(artikelArray, years)}
            
            <!-- Separator -->
            <tr class="separator-row">
              <td colspan="${years.length + 1}"></td>
            </tr>
            
            <!-- Gesamt-Summen -->
            ${renderTotalRows(aggregated, years)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// ARTIKEL ROWS
// ==========================================

function renderArtikelRows(artikelArray, years) {
  let html = '';
  
  artikelArray.forEach((forecast, index) => {
    const icon = getArtikelIcon(forecast.type);
    
    html += `
      <!-- Artikel ${index + 1} -->
      <tr class="row-artikel-header">
        <td class="col-label" colspan="${years.length + 1}">
          ${icon} <strong>${forecast.name}</strong>
          <span class="artikel-type-badge">${getTypeName(forecast.type)}</span>
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
      
      <tr class="row-artikel-data">
        <td class="col-label indent">└─ DB2 Marge (%)</td>
        ${forecast.db2Margin.map(m => `<td class="col-value col-percentage">${formatNumber(m, 1)}%</td>`).join('')}
      </tr>
      
      ${index < artikelArray.length - 1 ? `<tr class="spacer-row"><td colspan="${years.length + 1}"></td></tr>` : ''}
    `;
  });
  
  return html;
}

// ==========================================
// TOTAL ROWS
// ==========================================

function renderTotalRows(aggregated, years) {
  return `
    <tr class="row-total">
      <td class="col-label">💰 = GESAMT</td>
      <td colspan="${years.length}"></td>
    </tr>
    
    <tr class="row-total-data">
      <td class="col-label indent">└─ Umsatz (T€)</td>
      ${aggregated.totalRevenue.map(r => `<td class="col-value col-bold">${formatNumber(r / 1000, 0)}</td>`).join('')}
    </tr>
    
    <tr class="row-total-data">
      <td class="col-label indent">└─ Kosten (T€)</td>
      ${aggregated.totalCost.map(c => `<td class="col-value col-bold col-negative">${formatNumber(c / 1000, 0)}</td>`).join('')}
    </tr>
    
    <tr class="row-total-data">
      <td class="col-label indent">└─ DB2 (T€)</td>
      ${aggregated.totalDB2.map(db => `<td class="col-value col-bold col-positive">${formatNumber(db / 1000, 0)}</td>`).join('')}
    </tr>
    
    <tr class="row-total-data">
      <td class="col-label indent">└─ DB2 Marge (%)</td>
      ${aggregated.avgDB2Margin.map(m => `<td class="col-value col-bold col-percentage">${formatNumber(m, 1)}%</td>`).join('')}
    </tr>
  `;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

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

function getTypeName(type) {
  const names = {
    'hardware': 'Hardware',
    'package': 'Package',
    'software': 'Software',
    'services': 'Services',
    'subscription': 'SaaS'
  };
  return names[type] || type;
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

window.exportWirtschaftlichkeit = function() {
  console.log('📥 Export Wirtschaftlichkeit to Excel');
  alert('Excel Export wird in der nächsten Version implementiert!');
};

window.copyWirtschaftlichkeit = function() {
  const forecasts = getAllForecasts();
  const artikelArray = Object.values(forecasts);
  
  if (artikelArray.length === 0) {
    alert('⚠️ Keine Daten zum Kopieren!');
    return;
  }
  
  const aggregated = getAggregatedForecast();
  const years = aggregated.years;
  
  // Build tab-separated text
  let text = 'Position\t' + years.join('\t') + '\n\n';
  
  // Einzelne Artikel
  artikelArray.forEach(forecast => {
    text += `${forecast.name}\n`;
    text += 'Umsatz (T€)\t' + forecast.revenue.map(r => formatNumber(r/1000, 0)).join('\t') + '\n';
    text += 'Kosten (T€)\t' + forecast.totalCost.map(c => formatNumber(c/1000, 0)).join('\t') + '\n';
    text += 'DB2 (T€)\t' + forecast.db2.map(db => formatNumber(db/1000, 0)).join('\t') + '\n';
    text += 'DB2 Marge %\t' + forecast.db2Margin.map(m => formatNumber(m, 1) + '%').join('\t') + '\n';
    text += '\n';
  });
  
  // Gesamt
  text += '= GESAMT\n';
  text += 'Umsatz (T€)\t' + aggregated.totalRevenue.map(r => formatNumber(r/1000, 0)).join('\t') + '\n';
  text += 'Kosten (T€)\t' + aggregated.totalCost.map(c => formatNumber(c/1000, 0)).join('\t') + '\n';
  text += 'DB2 (T€)\t' + aggregated.totalDB2.map(db => formatNumber(db/1000, 0)).join('\t') + '\n';
  text += 'DB2 Marge %\t' + aggregated.avgDB2Margin.map(m => formatNumber(m, 1) + '%').join('\t') + '\n';
  
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Wirtschaftlichkeits-Daten in Zwischenablage kopiert!\n\nJetzt in Excel einfügen (Strg+V)');
  }).catch(err => {
    console.error('Clipboard error:', err);
    alert('❌ Fehler beim Kopieren');
  });
};

window.refreshWirtschaftlichkeit = function() {
  updateView();
  alert('✅ View aktualisiert!');
};

// ==========================================
// STYLES
// ==========================================

function renderWirtschaftlichkeitStyles() {
  return `
    <style>
      .wirtschaftlichkeit-view {
        padding: 20px;
        background: #f9fafb;
        min-height: 100vh;
      }
      
      /* Header */
      .view-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding: 20px;
        background: white;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
      }
      
      .view-title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .view-subtitle {
        margin: 4px 0 0;
        font-size: 14px;
        color: #6b7280;
      }
      
      .view-actions {
        display: flex;
        gap: 8px;
      }
      
      .btn-action {
        padding: 10px 16px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-action:hover {
        background: #f3f4f6;
        border-color: #3b82f6;
        transform: translateY(-1px);
      }
      
      /* Summary Cards */
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .summary-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        transition: all 0.2s;
      }
      
      .summary-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        transform: translateY(-2px);
      }
      
      .card-icon {
        font-size: 32px;
        flex-shrink: 0;
      }
      
      .card-content {
        flex: 1;
      }
      
      .card-label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }
      
      .card-value {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .card-positive {
        color: #059669;
      }
      
      .card-hint {
        font-size: 11px;
        color: #9ca3af;
      }
      
      /* Empty States */
      .summary-empty,
      .table-empty {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border: 2px dashed #e5e7eb;
        border-radius: 12px;
      }
      
      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      .empty-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 8px;
      }
      
      .empty-subtitle {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
      }
      
      /* Forecast Table */
      .forecast-table-section {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
      }
      
      .table-title {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .forecast-table-wrapper {
        overflow-x: auto;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      
      .forecast-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
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
      .row-artikel-header td {
        padding: 16px 16px 8px;
        background: #f9fafb;
        font-weight: 700;
        font-size: 14px;
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
      
      .separator-row {
        height: 8px;
        background: #f9fafb;
      }
      
      .separator-row td {
        padding: 0;
        border: none;
      }
      
      .row-total {
        background: #1e3a8a;
        color: white;
      }
      
      .row-total td {
        padding: 14px 16px;
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
      
      .col-bold {
        font-weight: 700;
      }
      
      .indent {
        padding-left: 32px;
      }
      
      /* Badges */
      .artikel-type-badge {
        display: inline-block;
        padding: 2px 8px;
        background: #e0e7ff;
        color: #3730a3;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-left: 8px;
      }
      
      /* Responsive */
      @media (max-width: 1024px) {
        .view-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
        
        .summary-cards {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @media (max-width: 768px) {
        .wirtschaftlichkeit-view {
          padding: 12px;
        }
        
        .view-header {
          padding: 16px;
        }
        
        .view-title {
          font-size: 20px;
        }
        
        .summary-cards {
          grid-template-columns: 1fr;
        }
        
        .forecast-table {
          font-size: 12px;
        }
        
        .forecast-table th,
        .forecast-table td {
          padding: 8px 12px;
        }
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderWirtschaftlichkeitsView
};
