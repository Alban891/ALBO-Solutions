/**
 * FORECAST TABLE - CONTROLLER VERSION
 * Single-Artikel: Input-Parameter + Output-Metriken
 * Multi-Artikel: Pro Artikel + Portfolio-Aggregation
 */

// ==========================================
// SINGLE-ARTIKEL FORECAST TABLE
// ==========================================

export function renderForecastTable(forecastData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  container.innerHTML = `
    <div class="forecast-table-controller">
      
      <!-- Header -->
      <div class="forecast-header">
        <div class="forecast-title">
          <span class="title-icon">📊</span>
          <span class="title-text">Revenue Forecast - ${forecastData.name}</span>
        </div>
      </div>
      
      <!-- Table -->
      <div class="forecast-table-wrapper">
        <table class="forecast-table">
          <thead>
            <tr>
              <th class="col-position">Position</th>
              ${forecastData.years.map(year => `<th class="col-year">${year}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            
            <!-- INPUT-PARAMETER -->
            <tr class="section-header">
              <td colspan="${forecastData.years.length + 1}">
                <strong>INPUT-PARAMETER</strong> <span style="font-size: 11px; color: #6b7280;">(Grau hinterlegt)</span>
              </td>
            </tr>
            
            <tr class="row-input">
              <td class="col-label">Menge (${getUnitLabel(forecastData.type)})</td>
              ${forecastData.volume.map(v => `<td class="col-value">${formatNumber(v, 0)}</td>`).join('')}
            </tr>
            
            <tr class="row-input">
              <td class="col-label">Preis (€/${getUnitLabel(forecastData.type)})</td>
              ${forecastData.price.map(p => `<td class="col-value">${formatNumber(p, 2)}</td>`).join('')}
            </tr>
            
            <tr class="row-input">
              <td class="col-label">HK (€/${getUnitLabel(forecastData.type)})</td>
              ${forecastData.cost.map(c => `<td class="col-value">${formatNumber(c, 2)}</td>`).join('')}
            </tr>
            
            <!-- Separator -->
            <tr class="separator-row">
              <td colspan="${forecastData.years.length + 1}"></td>
            </tr>
            
            <!-- OUTPUT-METRIKEN -->
            <tr class="section-header">
              <td colspan="${forecastData.years.length + 1}">
                <strong>OUTPUT-METRIKEN</strong> <span style="font-size: 11px; color: #6b7280;">(Berechnet)</span>
              </td>
            </tr>
            
            <tr class="row-output">
              <td class="col-label">Umsatz (T€)</td>
              ${forecastData.revenue.map(r => `<td class="col-value">${formatNumber(r / 1000, 0)}</td>`).join('')}
            </tr>
            
            <tr class="row-output">
              <td class="col-label">Kosten (T€)</td>
              ${forecastData.totalCost.map(c => `<td class="col-value col-negative">${formatNumber(c / 1000, 0)}</td>`).join('')}
            </tr>
            
            <tr class="row-output row-db2">
              <td class="col-label"><strong>DB2 (T€)</strong></td>
              ${forecastData.db2.map(db => `<td class="col-value col-positive"><strong>${formatNumber(db / 1000, 0)}</strong></td>`).join('')}
            </tr>
            
            <tr class="row-output row-margin">
              <td class="col-label">DB2 Marge (%)</td>
              ${forecastData.db2Margin.map(m => `<td class="col-value col-percentage">${formatNumber(m, 1)}%</td>`).join('')}
            </tr>
            
          </tbody>
        </table>
      </div>
      
      <!-- Copy Button -->
      <div class="forecast-actions">
        <button class="btn-copy" onclick="window.copyForecastToClipboard()">
          📋 In Zwischenablage kopieren
        </button>
      </div>
      
    </div>
    
    ${renderForecastStyles()}
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
  const totals = calculatePortfolioTotals(artikelForecasts, years);
  
  container.innerHTML = `
    <div class="forecast-table-controller">
      
      <!-- Header -->
      <div class="forecast-header">
        <div class="forecast-title">
          <span class="title-icon">📊</span>
          <span class="title-text">Revenue Forecast - Multi-Artikel (${artikelForecasts.length} Artikel)</span>
        </div>
      </div>
      
      <!-- Table -->
      <div class="forecast-table-wrapper">
        <table class="forecast-table forecast-table-multi">
          <thead>
            <tr>
              <th class="col-position">Position</th>
              ${years.map(year => `<th class="col-year">${year}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            
            ${renderMultiArtikelBlocks(artikelForecasts, years)}
            
            <!-- Portfolio Aggregation -->
            <tr class="portfolio-header">
              <td colspan="${years.length + 1}">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 20px;">💰</span>
                  <strong style="font-size: 15px;">GESAMT (PORTFOLIO-AGGREGATION)</strong>
                </div>
              </td>
            </tr>
            
            <tr class="row-portfolio">
              <td class="col-label"><strong>Umsatz (T€)</strong></td>
              ${totals.revenue.map(r => `<td class="col-value col-bold">${formatNumber(r / 1000, 0)}</td>`).join('')}
            </tr>
            
            <tr class="row-portfolio">
              <td class="col-label"><strong>Kosten (T€)</strong></td>
              ${totals.totalCost.map(c => `<td class="col-value col-bold col-negative">${formatNumber(c / 1000, 0)}</td>`).join('')}
            </tr>
            
            <tr class="row-portfolio row-db2">
              <td class="col-label"><strong>DB2 (T€)</strong></td>
              ${totals.db2.map(db => `<td class="col-value col-bold col-positive">${formatNumber(db / 1000, 0)}</td>`).join('')}
            </tr>
            
            <tr class="row-portfolio row-margin">
              <td class="col-label"><strong>DB2 Marge (%)</strong></td>
              ${totals.db2Margin.map(m => `<td class="col-value col-bold col-percentage">${formatNumber(m, 1)}%</td>`).join('')}
            </tr>
            
          </tbody>
        </table>
      </div>
      
      <!-- Copy Button -->
      <div class="forecast-actions">
        <button class="btn-copy" onclick="window.copyMultiForecastToClipboard()">
          📋 In Zwischenablage kopieren
        </button>
      </div>
      
    </div>
    
    ${renderForecastStyles()}
  `;
  
  // Store data for export
  window._currentMultiForecastData = artikelForecasts;
}

// ==========================================
// MULTI-ARTIKEL BLOCKS
// ==========================================

function renderMultiArtikelBlocks(artikelForecasts, years) {
  return artikelForecasts.map((forecast, index) => {
    const icon = getArtikelIcon(forecast.type);
    const unitLabel = getUnitLabel(forecast.type);
    
    return `
      <!-- Artikel ${index + 1}: ${forecast.name} -->
      <tr class="artikel-header">
        <td colspan="${years.length + 1}">
          <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
            <span style="font-size: 18px;">${icon}</span>
            <strong style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${forecast.name}</strong>
          </div>
        </td>
      </tr>
      
      <!-- Input-Parameter -->
      <tr class="row-input">
        <td class="col-label">Menge (${unitLabel})</td>
        ${forecast.volume.map(v => `<td class="col-value">${formatNumber(v, 0)}</td>`).join('')}
      </tr>
      
      <tr class="row-input">
        <td class="col-label">Preis (€/${unitLabel})</td>
        ${forecast.price.map(p => `<td class="col-value">${formatNumber(p, 2)}</td>`).join('')}
      </tr>
      
      <tr class="row-input">
        <td class="col-label">HK (€/${unitLabel})</td>
        ${forecast.cost.map(c => `<td class="col-value">${formatNumber(c, 2)}</td>`).join('')}
      </tr>
      
      <!-- Separator -->
      <tr class="separator-thin">
        <td colspan="${years.length + 1}"></td>
      </tr>
      
      <!-- Output-Metriken -->
      <tr class="row-output">
        <td class="col-label">Umsatz (T€)</td>
        ${forecast.revenue.map(r => `<td class="col-value">${formatNumber(r / 1000, 0)}</td>`).join('')}
      </tr>
      
      <tr class="row-output">
        <td class="col-label">Kosten (T€)</td>
        ${forecast.totalCost.map(c => `<td class="col-value col-negative">${formatNumber(c / 1000, 0)}</td>`).join('')}
      </tr>
      
      <tr class="row-output">
        <td class="col-label">DB2 (T€)</td>
        ${forecast.db2.map(db => `<td class="col-value col-positive">${formatNumber(db / 1000, 0)}</td>`).join('')}
      </tr>
      
      ${index < artikelForecasts.length - 1 ? `
        <tr class="spacer-row">
          <td colspan="${years.length + 1}"></td>
        </tr>
      ` : ''}
    `;
  }).join('');
}

// ==========================================
// PORTFOLIO TOTALS CALCULATION
// ==========================================

function calculatePortfolioTotals(artikelForecasts, years) {
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
  
  // Gewichtete DB2-Marge
  totals.db2Margin = totals.revenue.map((rev, i) => {
    return rev > 0 ? (totals.db2[i] / rev) * 100 : 0;
  });
  
  return totals;
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

function getUnitLabel(type) {
  const units = {
    'hardware': 'Stück',
    'software': 'Lizenzen',
    'subscription': 'Lizenzen',
    'services': 'Tage',
    'package': 'Stück'
  };
  return units[type] || 'Stück';
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
    alert('❌ Keine Daten zum Kopieren verfügbar!');
    return;
  }
  
  const unitLabel = getUnitLabel(data.type);
  
  let text = 'Position\t' + data.years.join('\t') + '\n';
  text += '\n=== INPUT-PARAMETER ===\n';
  text += `Menge (${unitLabel})\t` + data.volume.map(v => formatNumber(v, 0)).join('\t') + '\n';
  text += `Preis (€/${unitLabel})\t` + data.price.map(p => formatNumber(p, 2)).join('\t') + '\n';
  text += `HK (€/${unitLabel})\t` + data.cost.map(c => formatNumber(c, 2)).join('\t') + '\n';
  text += '\n=== OUTPUT-METRIKEN ===\n';
  text += 'Umsatz (T€)\t' + data.revenue.map(r => formatNumber(r/1000, 0)).join('\t') + '\n';
  text += 'Kosten (T€)\t' + data.totalCost.map(c => formatNumber(c/1000, 0)).join('\t') + '\n';
  text += 'DB2 (T€)\t' + data.db2.map(db => formatNumber(db/1000, 0)).join('\t') + '\n';
  text += 'DB2 Marge (%)\t' + data.db2Margin.map(m => formatNumber(m, 1) + '%').join('\t') + '\n';
  
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Forecast in Zwischenablage kopiert!\n\nJetzt in Excel einfügen (Strg+V)');
  }).catch(err => {
    console.error('Clipboard error:', err);
    alert('❌ Fehler beim Kopieren');
  });
};

window.copyMultiForecastToClipboard = function() {
  const data = window._currentMultiForecastData;
  if (!data || data.length === 0) {
    alert('❌ Keine Daten zum Kopieren verfügbar!');
    return;
  }
  
  const years = data[0].years;
  let text = 'Position\t' + years.join('\t') + '\n\n';
  
  data.forEach((forecast, index) => {
    const unitLabel = getUnitLabel(forecast.type);
    text += `=== ${forecast.name.toUpperCase()} ===\n`;
    text += `Menge (${unitLabel})\t` + forecast.volume.map(v => formatNumber(v, 0)).join('\t') + '\n';
    text += `Preis (€/${unitLabel})\t` + forecast.price.map(p => formatNumber(p, 2)).join('\t') + '\n';
    text += `HK (€/${unitLabel})\t` + forecast.cost.map(c => formatNumber(c, 2)).join('\t') + '\n';
    text += 'Umsatz (T€)\t' + forecast.revenue.map(r => formatNumber(r/1000, 0)).join('\t') + '\n';
    text += 'Kosten (T€)\t' + forecast.totalCost.map(c => formatNumber(c/1000, 0)).join('\t') + '\n';
    text += 'DB2 (T€)\t' + forecast.db2.map(db => formatNumber(db/1000, 0)).join('\t') + '\n\n';
  });
  
  const totals = calculatePortfolioTotals(data, years);
  text += '=== GESAMT (PORTFOLIO) ===\n';
  text += 'Umsatz (T€)\t' + totals.revenue.map(r => formatNumber(r/1000, 0)).join('\t') + '\n';
  text += 'Kosten (T€)\t' + totals.totalCost.map(c => formatNumber(c/1000, 0)).join('\t') + '\n';
  text += 'DB2 (T€)\t' + totals.db2.map(db => formatNumber(db/1000, 0)).join('\t') + '\n';
  text += 'DB2 Marge (%)\t' + totals.db2Margin.map(m => formatNumber(m, 1) + '%').join('\t') + '\n';
  
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Multi-Forecast in Zwischenablage kopiert!\n\nJetzt in Excel einfügen (Strg+V)');
  }).catch(err => {
    console.error('Clipboard error:', err);
    alert('❌ Fehler beim Kopieren');
  });
};

// ==========================================
// STYLES
// ==========================================

function renderForecastStyles() {
  return `
    <style>
      .forecast-table-controller {
        background: white;
        border-radius: 8px;
      }
      
      /* Header */
      .forecast-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      
      .forecast-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .title-icon {
        font-size: 20px;
      }
      
      .title-text {
        font-size: 16px;
        font-weight: 700;
        color: #1f2937;
      }
      
      /* Table Wrapper */
      .forecast-table-wrapper {
        overflow-x: auto;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      
      .forecast-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      
      .forecast-table th {
        padding: 10px 12px;
        background: #f9fafb;
        border-bottom: 2px solid #e5e7eb;
        font-weight: 700;
        text-align: left;
        color: #374151;
        white-space: nowrap;
      }
      
      .forecast-table .col-year {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      
      .forecast-table td {
        padding: 8px 12px;
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
      
      /* Section Headers */
      .section-header td {
        padding: 12px 12px 6px;
        background: #f9fafb;
        font-weight: 700;
        font-size: 12px;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: none;
      }
      
      /* Input Rows */
      .row-input {
        background: #fafafa;
      }
      
      .row-input td {
        color: #4b5563;
      }
      
      /* Output Rows */
      .row-output {
        background: white;
      }
      
      .row-db2 {
        background: #dcfce7 !important;
      }
      
      .row-margin {
        background: #dbeafe !important;
      }
      
      /* Separators */
      .separator-row {
        height: 8px;
        background: transparent;
      }
      
      .separator-row td {
        padding: 0;
        border: none;
      }
      
      .separator-thin {
        height: 4px;
        background: transparent;
      }
      
      .separator-thin td {
        padding: 0;
        border: none;
      }
      
      /* Value Colors */
      .col-negative {
        color: #dc2626;
      }
      
      .col-positive {
        color: #059669;
      }
      
      .col-percentage {
        color: #2563eb;
      }
      
      .col-bold {
        font-weight: 700;
      }
      
      /* Multi-Artikel Specific */
      .artikel-header td {
        padding: 16px 12px 8px;
        background: #eff6ff;
        border-top: 2px solid #3b82f6;
        border-bottom: none;
        font-weight: 700;
        color: #1e40af;
      }
      
      .spacer-row {
        height: 12px;
        background: white;
      }
      
      .spacer-row td {
        padding: 0;
        border: none;
      }
      
      /* Portfolio Aggregation */
      .portfolio-header td {
        padding: 16px 12px 8px;
        background: #1e3a8a;
        border-top: 3px solid #1e3a8a;
        border-bottom: none;
        color: white;
        font-weight: 700;
        font-size: 14px;
      }
      
      .row-portfolio {
        background: #dbeafe;
      }
      
      .row-portfolio td {
        font-weight: 600;
        font-size: 14px;
      }
      
      .row-portfolio.row-db2 {
        background: #86efac !important;
      }
      
      .row-portfolio.row-margin {
        background: #bfdbfe !important;
      }
      
      /* Actions */
      .forecast-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
      }
      
      .btn-copy {
        padding: 8px 16px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-copy:hover {
        background: #f3f4f6;
        border-color: #3b82f6;
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
