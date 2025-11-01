/**
 * FORECAST TABLE - CONTROLLER VERSION
 * Single-Artikel: Input-Parameter + Output-Metriken
 * Multi-Artikel: Pro Artikel + Portfolio-Aggregation
 */

// ==========================================
// SINGLE-ARTIKEL FORECAST TABLE
// ==========================================

export function renderForecastTable(forecastData, containerId, isManualMode = false) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  // Check if manual mode is active
  const manualVolume = forecastData.volume_model === 'manuell';
  const manualPrice = forecastData.price_model === 'manuell';
  const manualCost = forecastData.cost_model === 'manuell';
  
  container.innerHTML = `
    <div class="forecast-table-controller">
      
      <!-- Header -->
      <div class="forecast-header">
        <div class="forecast-title">
          <span class="title-icon">📊</span>
          <span class="title-text">Revenue Forecast - ${forecastData.name}</span>
        </div>
        ${(manualVolume || manualPrice || manualCost) ? `
          <div style="padding: 4px 12px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; font-size: 12px; font-weight: 600; color: #92400e;">
            ✏️ Manuell-Modus aktiv
          </div>
        ` : ''}
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
                <strong>INPUT-PARAMETER</strong> <span style="font-size: 11px; color: #6b7280;">(${(manualVolume || manualPrice || manualCost) ? 'Editierbar' : 'Grau hinterlegt'})</span>
              </td>
            </tr>
            
            <!-- Menge -->
            <tr class="row-input ${manualVolume ? 'row-editable' : ''}">
              <td class="col-label">Menge (${getUnitLabel(forecastData.type)})</td>
              ${forecastData.volume.map((v, i) => `
                <td class="col-value">
                  ${manualVolume ? 
                    `<input 
                      type="text" 
                      class="editable-input" 
                      data-type="volume" 
                      data-year="${i}"
                      value="${formatNumber(v, 0)}"
                      style="width: 100%; text-align: right; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;"
                    >` 
                    : formatNumber(v, 0)
                  }
                </td>
              `).join('')}
            </tr>
            
            <!-- Preis -->
            <tr class="row-input ${manualPrice ? 'row-editable' : ''}">
              <td class="col-label">Preis (€/${getUnitLabel(forecastData.type)})</td>
              ${forecastData.price.map((p, i) => `
                <td class="col-value">
                  ${manualPrice ? 
                    `<input 
                      type="text" 
                      class="editable-input" 
                      data-type="price" 
                      data-year="${i}"
                      value="${formatNumber(p, 2)}"
                      style="width: 100%; text-align: right; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;"
                    >` 
                    : formatNumber(p, 2)
                  }
                </td>
              `).join('')}
            </tr>
            
            <!-- HK -->
            <tr class="row-input ${manualCost ? 'row-editable' : ''}">
              <td class="col-label">HK (€/${getUnitLabel(forecastData.type)})</td>
              ${forecastData.cost.map((c, i) => `
                <td class="col-value">
                  ${manualCost ? 
                    `<input 
                      type="text" 
                      class="editable-input" 
                      data-type="cost" 
                      data-year="${i}"
                      value="${formatNumber(c, 2)}"
                      style="width: 100%; text-align: right; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;"
                    >` 
                    : formatNumber(c, 2)
                  }
                </td>
              `).join('')}
            </tr>
            
            <!-- Separator -->
            <tr class="separator-row">
              <td colspan="${forecastData.years.length + 1}"></td>
            </tr>
            
            <!-- OUTPUT-METRIKEN -->
            <tr class="section-header">
              <td colspan="${forecastData.years.length + 1}">
                <strong>OUTPUT-METRIKEN</strong> <span style="font-size: 11px; color: #6b7280;">(Automatisch berechnet)</span>
              </td>
            </tr>
            
            <tr class="row-output">
              <td class="col-label">Umsatz (T€)</td>
              ${forecastData.revenue.map((r, i) => `<td class="col-value" id="output-revenue-${i}">${formatNumber(r / 1000, 0)}</td>`).join('')}
            </tr>
            
            <tr class="row-output">
              <td class="col-label">Kosten (T€)</td>
              ${forecastData.totalCost.map((c, i) => `<td class="col-value col-negative" id="output-cost-${i}">${formatNumber(c / 1000, 0)}</td>`).join('')}
            </tr>
            
            <tr class="row-output row-db2">
              <td class="col-label"><strong>DB2 (T€)</strong></td>
              ${forecastData.db2.map((db, i) => `<td class="col-value col-positive" id="output-db2-${i}"><strong>${formatNumber(db / 1000, 0)}</strong></td>`).join('')}
            </tr>
            
            <tr class="row-output row-margin">
              <td class="col-label">DB2 Marge (%)</td>
              ${forecastData.db2Margin.map((m, i) => `<td class="col-value col-percentage" id="output-margin-${i}">${formatNumber(m, 1)}%</td>`).join('')}
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
  
  // Attach event listeners for manual mode
  if (manualVolume || manualPrice || manualCost) {
    attachManualModeListeners();
  }
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
// MANUAL MODE EVENT LISTENERS
// ==========================================

function attachManualModeListeners() {
  const inputs = document.querySelectorAll('.editable-input');
  
  inputs.forEach(input => {
    // Format on focus (remove formatting)
    input.addEventListener('focus', function() {
      const value = this.value.replace(/\./g, '').replace(/,/g, '.');
      this.value = value;
      this.select();
    });
    
    // Format on blur and recalculate
    input.addEventListener('blur', function() {
      const type = this.dataset.type;
      const value = parseFloat(this.value.replace(/\./g, '').replace(/,/g, '.')) || 0;
      
      // Format based on type
      if (type === 'volume') {
        this.value = formatNumber(value, 0);
      } else {
        this.value = formatNumber(value, 2);
      }
      
      // Recalculate outputs
      recalculateOutputs();
    });
    
    // Recalculate on input (real-time)
    input.addEventListener('input', debounce(() => {
      recalculateOutputs();
    }, 500));
  });
}

function recalculateOutputs() {
  const forecastData = window._currentForecastData;
  if (!forecastData) return;
  
  const years = forecastData.years.length;
  
  for (let i = 0; i < years; i++) {
    // Get current values from inputs
    const volumeInput = document.querySelector(`[data-type="volume"][data-year="${i}"]`);
    const priceInput = document.querySelector(`[data-type="price"][data-year="${i}"]`);
    const costInput = document.querySelector(`[data-type="cost"][data-year="${i}"]`);
    
    const volume = volumeInput ? parseFloat(volumeInput.value.replace(/\./g, '').replace(/,/g, '.')) || 0 : forecastData.volume[i];
    const price = priceInput ? parseFloat(priceInput.value.replace(/\./g, '').replace(/,/g, '.')) || 0 : forecastData.price[i];
    const cost = costInput ? parseFloat(costInput.value.replace(/\./g, '').replace(/,/g, '.')) || 0 : forecastData.cost[i];
    
    // Calculate outputs
    const revenue = volume * price;
    const totalCost = volume * cost;
    const db2 = revenue - totalCost;
    const db2Margin = revenue > 0 ? (db2 / revenue) * 100 : 0;
    
    // Update display
    const revenueEl = document.getElementById(`output-revenue-${i}`);
    const costEl = document.getElementById(`output-cost-${i}`);
    const db2El = document.getElementById(`output-db2-${i}`);
    const marginEl = document.getElementById(`output-margin-${i}`);
    
    if (revenueEl) revenueEl.textContent = formatNumber(revenue / 1000, 0);
    if (costEl) costEl.textContent = formatNumber(totalCost / 1000, 0);
    if (db2El) db2El.innerHTML = `<strong>${formatNumber(db2 / 1000, 0)}</strong>`;
    if (marginEl) marginEl.textContent = formatNumber(db2Margin, 1) + '%';
    
    // Update stored data
    forecastData.volume[i] = volume;
    forecastData.price[i] = price;
    forecastData.cost[i] = cost;
    forecastData.revenue[i] = revenue;
    forecastData.totalCost[i] = totalCost;
    forecastData.db2[i] = db2;
    forecastData.db2Margin[i] = db2Margin;
  }
  
  // Update artikel data
  if (window._currentArtikel && window._currentArtikel.hardware_model_data) {
    window._currentArtikel.hardware_model_data.forecast = forecastData;
  }
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
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

      /* Editable Input Rows */
        .row-input.editable {
        background: #fffbeb !important;
        }

        .input-editable {
        width: 100%;
        padding: 4px 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 13px;
        text-align: right;
        background: #fffbeb;
        font-weight: 600;
        color: #92400e;
        font-variant-numeric: tabular-nums;
        }

        .input-editable:focus {
        outline: none;
        border-color: #f59e0b;
        box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
        background: white;
        color: #1f2937;
        }

        .input-editable:hover {
        border-color: #f59e0b;
        background: #fef3c7;
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
      
      /* ✅ MANUAL MODE STYLES */
      .row-editable {
        background: #fef3c7 !important;
      }
      
      .editable-input {
        font-family: inherit;
        font-size: 13px;
        font-variant-numeric: tabular-nums;
      }
      
      .editable-input:focus {
        outline: none;
        border-color: #f59e0b !important;
        box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
        background: white;
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
