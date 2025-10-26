/**
 * CFO Dashboard - Artikel Module
 * Complete article lifecycle: Create, Read, Update, Delete, Render
 * Enterprise-grade with validation and error handling
 * 
 * VERSION 2.0: Mit hierarchischer Package-Ansicht
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';
import * as api from '../../api.js';
import * as charts from '../../charts.js';
import { openArtikelCreationModal as openArtikelCreationModalCore } from './artikel-creation-modal.js';

// ==========================================
// ARTIKEL RENDERING
// ==========================================

/**
 * Render artikel list for current project (ALTE VERSION - bleibt für Kompatibilität)
 */
export function renderArtikelListByProjekt() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) {
    console.warn('No projekt selected');
    return;
  }

  const projekt = state.getProjekt(projektId);
  if (!projekt) {
    console.error('Projekt not found:', projektId);
    return;
  }

  console.log('📋 Rendering artikel for projekt:', projekt.name);

  const tbody = document.getElementById('artikel-list-tbody');
  if (!tbody) return;

  const artikel = state.getArtikelByProjekt(projektId);

  if (artikel.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--gray);">
          <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
          <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">
            Noch keine Artikel vorhanden
          </div>
          <div style="font-size: 14px;">
            Erstelle den ersten Artikel für dieses Projekt
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = artikel.map(art => {
    const revenue = calculateArtikelRevenue(art.id);
    const db2 = calculateArtikelDB2(art.id);
    
    // Formatiere das Update-Datum
    const updatedAt = art.updatedAt ? new Date(art.updatedAt).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '-';
    
    return `
      <tr class="artikel-row" data-artikel-id="${art.id}">
        <td>
          <input type="checkbox" class="artikel-checkbox" value="${art.id}" 
                 onchange="updateArtikelBulkActions()">
        </td>
        <td>
          <div style="font-weight: 500; color: var(--text);">${helpers.escapeHtml(art.name)}</div>
          <div style="font-size: 12px; color: var(--gray); margin-top: 4px;">
            ${helpers.escapeHtml(art.typ || '-')}
          </div>
        </td>
        <td>${helpers.escapeHtml(art.kategorie || '-')}</td>
        <td>${helpers.formatDateSafe(art.release_datum)}</td>
        <td style="text-align: right; font-weight: 500;">
          ${helpers.formatRevenue(revenue)}
        </td>
        <td style="text-align: right;">
          ${helpers.formatPercentage(db2)}
        </td>
        <td>
          <div style="font-size: 11px; color: var(--text-light);">
            ${updatedAt}
          </div>
        </td>
        <td>
          <span class="status-badge status-${(art.status || 'aktiv').toLowerCase()}">
            ${helpers.escapeHtml(art.status || 'aktiv')}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" onclick="openArtikelDetail('${art.id}')" title="Details">
              📝
            </button>
            <button class="btn-icon" onclick="duplicateArtikel('${art.id}')" title="Duplizieren">
              📋
            </button>
            <button class="btn-icon btn-danger" onclick="deleteArtikel('${art.id}')" title="Löschen">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// HIERARCHISCHE ARTIKEL-LISTE (NEU)
// ==========================================

// STATE FÜR EXPANDED PACKAGES
if (!window.expandedPackages) {
  window.expandedPackages = new Set();
}

/**
 * Render artikel list WITH HIERARCHY (NEUE VERSION)
 * Zeigt Package-Parents mit expandierbaren Children
 */
export function renderArtikelHierarchy() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) {
    console.warn('No projekt selected');
    return;
  }

  const projekt = state.getProjekt(projektId);
  if (!projekt) {
    console.error('Projekt not found:', projektId);
    return;
  }

  console.log('📦 Rendering artikel hierarchy for projekt:', projekt.name);

  const tbody = document.getElementById('artikel-list-tbody');
  if (!tbody) return;

  const alleArtikel = state.getArtikelByProjekt(projektId);

  if (alleArtikel.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--gray);">
          <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
          <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">
            Noch keine Artikel vorhanden
          </div>
          <div style="font-size: 14px;">
            Erstelle den ersten Artikel für dieses Projekt
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // ==========================================
  // GRUPPIERE IN HIERARCHIE
  // ==========================================
  
  const hierarchy = [];
  const processedIds = new Set();

  alleArtikel.forEach(artikel => {
    // Package-Parents und Standalone-Artikel (haben keinen parent_package_id)
    if (!artikel.parent_package_id) {
      const children = alleArtikel.filter(a => a.parent_package_id === artikel.id);
      
      hierarchy.push({
        parent: artikel,
        children: children,
        isPackage: artikel.artikel_mode === 'package-parent',
        hasChildren: children.length > 0
      });
      
      processedIds.add(artikel.id);
      children.forEach(c => processedIds.add(c.id));
    }
  });

  // Orphaned Children (sollte nicht vorkommen)
  alleArtikel.forEach(artikel => {
    if (!processedIds.has(artikel.id)) {
      console.warn('⚠️ Orphaned child artikel found:', artikel.name);
      hierarchy.push({
        parent: artikel,
        children: [],
        isPackage: false,
        hasChildren: false,
        isOrphaned: true
      });
    }
  });

  console.log('✅ Artikel hierarchy built:', hierarchy.length, 'groups');

  // ==========================================
  // RENDER HIERARCHIE
  // ==========================================
  
  tbody.innerHTML = hierarchy.map(item => {
    const { parent, children, hasChildren } = item;
    const isExpanded = window.expandedPackages.has(parent.id);
    
    let html = '';
    
    // Parent Row
    html += renderArtikelRowHierarchical(parent, {
      hasChildren: hasChildren,
      isExpanded: isExpanded,
      isParent: true,
      isChild: false
    });
    
    // Children Rows (wenn expanded)
    if (isExpanded && children.length > 0) {
      html += children.map((child, index) => {
        return renderArtikelRowHierarchical(child, {
          hasChildren: false,
          isExpanded: false,
          isParent: false,
          isChild: true,
          isLastChild: index === children.length - 1,
          childIndex: index + 1,
          totalChildren: children.length
        });
      }).join('');
    }
    
    return html;
  }).join('');
}

/**
 * Render single artikel row with hierarchy support
 */
function renderArtikelRowHierarchical(artikel, options = {}) {
  const { hasChildren, isExpanded, isParent, isChild, isLastChild, childIndex, totalChildren } = options;
  
  // Calculate values
  const revenue = calculateArtikelRevenue(artikel.id);
  const db2 = calculateArtikelDB2(artikel.id);
  
  // Format update date
  const updatedAt = artikel.updatedAt ? new Date(artikel.updatedAt).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : '-';
  
  // Icon basierend auf Artikel-Typ
  const icon = artikel.artikel_mode === 'package-parent' ? '📦' : 
               artikel.artikel_mode === 'package-child' ? '📄' :
               artikel.artikel_mode === 'hybrid' ? '🔀' : '📦';
  
  // Expand/Collapse Button (nur für Parents mit Children)
  const expandButton = hasChildren && isParent ? `
    <button 
      onclick="window.togglePackageExpand('${artikel.id}')"
      style="
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        padding: 4px 8px;
        margin-right: 4px;
        color: var(--primary);
        transition: transform 0.2s;
        ${isExpanded ? 'transform: rotate(90deg);' : ''}
      "
      title="${isExpanded ? 'Zuklappen' : 'Aufklappen'}"
    >
      ▶
    </button>
  ` : '<span style="width: 32px; display: inline-block;"></span>';
  
  // Visual Tree Line für Children
  const treeLine = isChild ? `
    <span style="
      position: absolute;
      left: 40px;
      top: 0;
      bottom: ${isLastChild ? '50%' : '0'};
      width: 1px;
      background: #d1d5db;
    "></span>
    <span style="
      position: absolute;
      left: 40px;
      top: 50%;
      width: 20px;
      height: 1px;
      background: #d1d5db;
    "></span>
  ` : '';
  
  // Einrückung für Children
  const indent = isChild ? 'padding-left: 60px !important;' : '';
  
  // Background für Children
  const childBackground = isChild ? 'background: #f9fafb;' : '';
  
  // Package Badge
  const packageBadge = artikel.artikel_mode === 'package-parent' ? `
    <span style="
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 8px;
    ">
      PACKAGE
    </span>
  ` : '';
  
  // Mix Percentage Badge (nur für Children)
  const mixBadge = isChild && artikel.mix_percentage ? `
    <span style="
      background: #f3f4f6;
      color: #6b7280;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-left: 8px;
    ">
      ${artikel.mix_percentage}% Mix
    </span>
  ` : '';
  
  // Child Index Badge
  const childIndexBadge = isChild ? `
    <span style="
      background: #e5e7eb;
      color: #6b7280;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 600;
      margin-left: 4px;
    ">
      ${childIndex}/${totalChildren}
    </span>
  ` : '';
  
  // Render Row
  return `
    <tr class="artikel-row" data-artikel-id="${artikel.id}" style="
      position: relative;
      ${childBackground}
      transition: background 0.15s;
    ">
      <td>
        <input type="checkbox" class="artikel-checkbox" value="${artikel.id}" 
               onchange="updateArtikelBulkActions()">
      </td>
      <td style="${indent}">
        ${treeLine}
        ${isParent ? expandButton : ''}
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 18px;">${icon}</span>
          <span style="font-weight: ${isChild ? '400' : '500'}; color: var(--text);">
            ${helpers.escapeHtml(artikel.name)}
          </span>
          ${packageBadge}
          ${mixBadge}
          ${childIndexBadge}
        </div>
        <div style="font-size: 12px; color: var(--gray); margin-top: 4px; ${isChild ? 'padding-left: 32px;' : ''}">
          ${helpers.escapeHtml(artikel.typ || '-')}
        </div>
      </td>
      <td>${helpers.escapeHtml(artikel.kategorie || '-')}</td>
      <td>${helpers.formatDateSafe(artikel.release_datum)}</td>
      <td style="text-align: right; font-weight: 500;">
        ${helpers.formatRevenue(revenue)}
      </td>
      <td style="text-align: right;">
        ${helpers.formatPercentage(db2)}
      </td>
      <td>
        <div style="font-size: 11px; color: var(--text-light);">
          ${updatedAt}
        </div>
      </td>
      <td>
        <span class="status-badge status-${(artikel.status || 'aktiv').toLowerCase()}">
          ${helpers.escapeHtml(artikel.status || 'aktiv')}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" onclick="openArtikelDetail('${artikel.id}')" title="Details">
            📝
          </button>
          <button class="btn-icon" onclick="duplicateArtikel('${artikel.id}')" title="Duplizieren">
            📋
          </button>
          <button class="btn-icon btn-danger" onclick="deleteArtikel('${artikel.id}')" title="Löschen">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Toggle package expand/collapse
 */
window.togglePackageExpand = function(packageId) {
  console.log('📦 Toggle expand for package:', packageId);
  
  if (window.expandedPackages.has(packageId)) {
    window.expandedPackages.delete(packageId);
    console.log('📦 Collapsed:', packageId);
  } else {
    window.expandedPackages.add(packageId);
    console.log('📦 Expanded:', packageId);
  }
  
  // Re-render mit neuer Hierarchie-Funktion
  renderArtikelHierarchy();
};

/**
 * Expand all packages
 */
window.expandAllPackages = function() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) return;
  
  const alleArtikel = state.getArtikelByProjekt(projektId);
  
  alleArtikel.forEach(artikel => {
    if (artikel.artikel_mode === 'package-parent') {
      window.expandedPackages.add(artikel.id);
    }
  });
  
  renderArtikelHierarchy();
  console.log('📦 Expanded all packages');
};

/**
 * Collapse all packages
 */
window.collapseAllPackages = function() {
  window.expandedPackages.clear();
  renderArtikelHierarchy();
  console.log('📦 Collapsed all packages');
};

console.log('✅ Artikel Hierarchy Extension loaded');

// ==========================================
// ARTIKEL DETAIL VIEW
// ==========================================

/**
 * Open artikel detail editor
 */
window.openArtikelDetail = function(artikelId) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) {
    console.error('Artikel not found:', artikelId);
    return;
  }

  console.log('📝 Opening artikel detail:', artikel.name);

  // Set current artikel
  window.cfoDashboard.currentArtikel = artikelId;
  
  // ✓ CRITICAL: Save complete navigation state
  state.currentArtikel = artikelId;
  state.artikelViewMode = 'detail';
  state.saveState();
  
  console.log('💾 Saved artikel detail state');

  // ⚠️ CRITICAL: Hide ALL views except artikel-detail
  const projektOverview = document.getElementById('projekt-overview');
  const projektDetail = document.getElementById('projekt-detail-view');
  const artikelOverview = document.getElementById('artikel-overview');
  const artikelDetail = document.getElementById('artikel-detail-view');

  // Hide everything
  if (projektOverview) projektOverview.style.display = 'none';
  if (projektDetail) projektDetail.style.display = 'none';
  if (artikelOverview) artikelOverview.style.display = 'none';

  // Show ONLY artikel detail
  if (artikelDetail) artikelDetail.style.display = 'block';

  // Load artikel data into form
  loadArtikelIntoForm(artikel);

  // Update navigation (breadcrumb, buttons, position)
  if (window.updateArtikelNavigation) {
    window.updateArtikelNavigation();
  }

  // Save navigation state
  if (window.saveNavigationState) {
    window.saveNavigationState();
  }
};

/**
 * Load artikel data into detail form
 */
function loadArtikelIntoForm(artikel) {
  // Zeige "Zuletzt gespeichert" Info wenn vorhanden
  if (artikel.updatedAt) {
    const updateInfo = document.getElementById('artikel-update-info');
    if (updateInfo) {
      const dateStr = new Date(artikel.updatedAt).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      updateInfo.innerHTML = `<span style="color: var(--success);">✓</span> Zuletzt gespeichert: ${dateStr}`;
      updateInfo.style.display = 'block';
    }
  }

  // Basic Info
  helpers.setInputValue('artikel-name', artikel.name);
  helpers.setInputValue('artikel-typ', artikel.typ || '');
  helpers.setInputValue('kategorie', artikel.kategorie || artikel.effekt_typ || '');
  helpers.setInputValue('geschaeftsmodell', artikel.geschaeftsmodell);
  helpers.setInputValue('zielmarkt', artikel.zielmarkt);
  helpers.setInputValue('strategie', artikel.strategie);
  helpers.setInputValue('investment-typ', artikel.investment_typ);
  helpers.setInputValue('artikel-beschreibung', artikel.beschreibung);
  helpers.setInputValue('release-datum', artikel.release_datum ? artikel.release_datum.substring(0, 7) : '');

  // Start values - MIT BEISPIELWERTEN ALS PLACEHOLDER
  const startMengeInput = document.getElementById('start-menge');
  const startPreisInput = document.getElementById('start-preis');
  const startHKInput = document.getElementById('start-hk');
  
  if (startMengeInput) {
    if (artikel.start_menge !== undefined && artikel.start_menge !== null && artikel.start_menge !== 0) {
      startMengeInput.value = helpers.formatThousands(artikel.start_menge);
      startMengeInput.style.color = '#111827'; // Schwarze Schrift
    } else {
      startMengeInput.value = 'z.B. 1.000';
      startMengeInput.style.color = '#6b7280'; // Graue Schrift
    }
  }
  
  if (startPreisInput) {
    if (artikel.start_preis !== undefined && artikel.start_preis !== null && artikel.start_preis !== 0) {
      startPreisInput.value = helpers.formatDecimal(artikel.start_preis, 2);
      startPreisInput.style.color = '#111827';
    } else {
      startPreisInput.value = 'z.B. 50,00';
      startPreisInput.style.color = '#6b7280';
    }
  }
  
  if (startHKInput) {
    if (artikel.start_hk !== undefined && artikel.start_hk !== null && artikel.start_hk !== 0) {
      startHKInput.value = helpers.formatDecimal(artikel.start_hk, 2);
      startHKInput.style.color = '#111827';
    } else {
      startHKInput.value = 'z.B. 20,00';
      startHKInput.style.color = '#6b7280';
    }
  }

  // Models
  if (artikel.mengen_modell) {
    const mengenRadio = document.querySelector(`input[name="mengen-modell"][value="${artikel.mengen_modell}"]`);
    if (mengenRadio) mengenRadio.checked = true;
  }
  if (artikel.preis_modell) {
    const preisRadio = document.querySelector(`input[name="preis-modell"][value="${artikel.preis_modell}"]`);
    if (preisRadio) preisRadio.checked = true;
  }
  if (artikel.kosten_modell) {
    const kostenRadio = document.querySelector(`input[name="kosten-modell"][value="${artikel.kosten_modell}"]`);
    if (kostenRadio) kostenRadio.checked = true;
  }

  // Growth rates
  helpers.setInputValue('mengen-wachstum', artikel.mengen_wachstum || 0);
  helpers.setInputValue('preis-wachstum', artikel.preis_wachstum || 0);
  helpers.setInputValue('kosten-wachstum', artikel.kosten_wachstum || 0);

  // Load forecast table
  loadArtikelForecastTable(artikel);
}

/**
 * Load forecast table with artikel data
 */
function loadArtikelForecastTable(artikel) {
  const years = Array.from({ length: 10 }, (_, i) => 2025 + i);
  const tbody = document.getElementById('artikel-forecast-tbody');
  
  if (!tbody) return;

  tbody.innerHTML = years.map(year => {
    const volume = artikel.volumes?.[year] || 0;
    const price = artikel.prices?.[year] || 0;
    const revenue = (volume * price) / 1000;
    const hk = artikel.hk || 0;
    const costs = (volume * hk) / 1000;
    const db = revenue - costs;

    return `
      <tr>
        <td>${year}</td>
        <td>
          <input 
            type="text" 
            class="input-field input-sm text-right" 
            value="${helpers.formatThousands(volume)}"
            onchange="updateArtikelForecast('${artikel.id}', ${year}, 'volume', this.value)"
            placeholder="0"
          >
        </td>
        <td>
          <input 
            type="text" 
            class="input-field input-sm text-right" 
            value="${helpers.formatDecimal(price, 2)}"
            onchange="updateArtikelForecast('${artikel.id}', ${year}, 'price', this.value)"
            placeholder="0,00"
          >
        </td>
        <td class="text-right font-medium">${helpers.formatRevenue(revenue)}</td>
        <td class="text-right">${helpers.formatRevenue(costs)}</td>
        <td class="text-right font-medium ${db < 0 ? 'text-red-600' : 'text-green-600'}">
          ${helpers.formatRevenue(db)}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Update forecast value
 */
window.updateArtikelForecast = function(artikelId, year, type, value) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return;

  const numValue = helpers.parseGermanNumber(value);

  if (type === 'volume') {
    if (!artikel.volumes) artikel.volumes = {};
    artikel.volumes[year] = numValue;
  } else if (type === 'price') {
    if (!artikel.prices) artikel.prices = {};
    artikel.prices[year] = numValue;
  }

  // Save to database
  api.saveArticle(artikel).then(() => {
    // Reload table
    loadArtikelForecastTable(artikel);
    
    // Update charts
    if (window.updateAllCharts) {
      window.updateAllCharts();
    }
  });
};

/**
 * Save artikel changes
 */
window.saveArtikelChanges = async function() {
  const artikelId = window.cfoDashboard.currentArtikel;
  const artikel = state.getArtikel(artikelId);
  
  if (!artikel) {
    console.error('No artikel selected');
    return;
  }

  console.log('💾 Saving artikel:', artikel.name);

  // Collect form values
  artikel.name = helpers.getInputValue('artikel-name');
  artikel.typ = helpers.getInputValue('artikel-typ');
  artikel.kategorie = helpers.getInputValue('kategorie');
  artikel.geschaeftsmodell = helpers.getInputValue('geschaeftsmodell');
  artikel.zielmarkt = helpers.getInputValue('zielmarkt');
  artikel.strategie = helpers.getInputValue('strategie');
  artikel.investment_typ = helpers.getInputValue('investment-typ');
  artikel.beschreibung = helpers.getInputValue('artikel-beschreibung');
  artikel.release_datum = helpers.getInputValue('release-datum');

  // Start values
  const startMengeValue = helpers.getInputValue('start-menge');
  artikel.start_menge = startMengeValue && startMengeValue !== 'z.B. 1.000' 
    ? helpers.parseGermanNumber(startMengeValue) 
    : 0;

  const startPreisValue = helpers.getInputValue('start-preis');
  artikel.start_preis = startPreisValue && startPreisValue !== 'z.B. 50,00'
    ? helpers.parseGermanNumber(startPreisValue)
    : 0;

  const startHKValue = helpers.getInputValue('start-hk');
  artikel.start_hk = startHKValue && startHKValue !== 'z.B. 20,00'
    ? helpers.parseGermanNumber(startHKValue)
    : 0;

  artikel.hk = artikel.start_hk;

  // Models
  const mengenModell = document.querySelector('input[name="mengen-modell"]:checked');
  if (mengenModell) artikel.mengen_modell = mengenModell.value;

  const preisModell = document.querySelector('input[name="preis-modell"]:checked');
  if (preisModell) artikel.preis_modell = preisModell.value;

  const kostenModell = document.querySelector('input[name="kosten-modell"]:checked');
  if (kostenModell) artikel.kosten_modell = kostenModell.value;

  // Growth rates
  artikel.mengen_wachstum = parseFloat(helpers.getInputValue('mengen-wachstum')) || 0;
  artikel.preis_wachstum = parseFloat(helpers.getInputValue('preis-wachstum')) || 0;
  artikel.kosten_wachstum = parseFloat(helpers.getInputValue('kosten-wachstum')) || 0;

  // Update timestamp
  artikel.updatedAt = new Date().toISOString();

  // Save to database
  const saved = await api.saveArticle(artikel);

  if (saved) {
    console.log('✅ Artikel saved');

    // Show success message
    const updateInfo = document.getElementById('artikel-update-info');
    if (updateInfo) {
      const dateStr = new Date(artikel.updatedAt).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      updateInfo.innerHTML = `<span style="color: var(--success);">✓</span> Zuletzt gespeichert: ${dateStr}`;
      updateInfo.style.display = 'block';
    }

    // Update charts
    charts.updateAllCharts();

    // AI Feedback
    if (window.cfoDashboard.aiController) {
      window.cfoDashboard.aiController.addAIMessage({
        level: 'success',
        title: '✅ Artikel gespeichert',
        text: `Änderungen an "${artikel.name}" wurden gespeichert.`,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  }
};

/**
 * Apply forecast model to artikel
 */
window.applyArtikelForecastModel = function() {
  const artikelId = window.cfoDashboard.currentArtikel;
  const artikel = state.getArtikel(artikelId);
  
  if (!artikel) return;

  console.log('📊 Applying forecast model to:', artikel.name);

  const startYear = parseInt(artikel.release_datum?.substring(0, 4)) || 2025;
  const years = Array.from({ length: 10 }, (_, i) => startYear + i);

  // Initialize if not exists
  if (!artikel.volumes) artikel.volumes = {};
  if (!artikel.prices) artikel.prices = {};

  // Apply models
  years.forEach((year, index) => {
    // Volume model
    if (artikel.mengen_modell === 'konstant') {
      artikel.volumes[year] = artikel.start_menge || 0;
    } else if (artikel.mengen_modell === 'linear') {
      const growth = artikel.mengen_wachstum || 0;
      artikel.volumes[year] = (artikel.start_menge || 0) * (1 + (growth / 100) * index);
    } else if (artikel.mengen_modell === 'exponentiell') {
      const growth = artikel.mengen_wachstum || 0;
      artikel.volumes[year] = (artikel.start_menge || 0) * Math.pow(1 + growth / 100, index);
    }

    // Price model
    if (artikel.preis_modell === 'konstant') {
      artikel.prices[year] = artikel.start_preis || 0;
    } else if (artikel.preis_modell === 'linear') {
      const growth = artikel.preis_wachstum || 0;
      artikel.prices[year] = (artikel.start_preis || 0) * (1 + (growth / 100) * index);
    } else if (artikel.preis_modell === 'exponentiell') {
      const growth = artikel.preis_wachstum || 0;
      artikel.prices[year] = (artikel.start_preis || 0) * Math.pow(1 + growth / 100, index);
    }
  });

  // Save to database
  api.saveArticle(artikel).then(() => {
    console.log('✅ Forecast model applied');

    // Reload table
    loadArtikelForecastTable(artikel);

    // Update charts
    charts.updateAllCharts();

    // AI Feedback
    if (window.cfoDashboard.aiController) {
      window.cfoDashboard.aiController.addAIMessage({
        level: 'success',
        title: '📊 Forecast-Modell angewendet',
        text: `Prognose für "${artikel.name}" wurde aktualisiert.`,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  });
};

// ==========================================
// ARTIKEL NAVIGATION
// ==========================================

/**
 * Navigate to previous artikel
 */
window.navigateToPreviousArtikel = function() {
  const projektId = window.cfoDashboard.currentProjekt;
  const currentArtikelId = window.cfoDashboard.currentArtikel;
  
  const alleArtikel = state.getArtikelByProjekt(projektId);
  const currentIndex = alleArtikel.findIndex(a => a.id === currentArtikelId);
  
  if (currentIndex > 0) {
    const previousArtikel = alleArtikel[currentIndex - 1];
    openArtikelDetail(previousArtikel.id);
  }
};

/**
 * Navigate to next artikel
 */
window.navigateToNextArtikel = function() {
  const projektId = window.cfoDashboard.currentProjekt;
  const currentArtikelId = window.cfoDashboard.currentArtikel;
  
  const alleArtikel = state.getArtikelByProjekt(projektId);
  const currentIndex = alleArtikel.findIndex(a => a.id === currentArtikelId);
  
  if (currentIndex < alleArtikel.length - 1) {
    const nextArtikel = alleArtikel[currentIndex + 1];
    openArtikelDetail(nextArtikel.id);
  }
};

/**
 * Back to artikel overview
 */
window.backToArtikelOverview = function() {
  console.log('⬅️ Back to artikel overview');

  // Clear current artikel
  window.cfoDashboard.currentArtikel = null;
  state.currentArtikel = null;
  state.artikelViewMode = 'overview';
  state.saveState();

  // Show artikel overview
  const artikelOverview = document.getElementById('artikel-overview');
  const artikelDetail = document.getElementById('artikel-detail-view');

  if (artikelOverview) artikelOverview.style.display = 'block';
  if (artikelDetail) artikelDetail.style.display = 'none';

  // Refresh list
  renderArtikelHierarchy();
};

// ==========================================
// ARTIKEL CREATION
// ==========================================

/**
 * Open quick create modal (ALTE VERSION - bleibt für Kompatibilität)
 */
window.openArtikelQuickCreate = function() {
  const projektId = window.cfoDashboard.currentProjekt;
  
  if (!projektId) {
    alert('Bitte erst Projekt auswählen!');
    return;
  }

  console.log('➕ Opening artikel quick create');

  const modal = document.createElement('div');
  modal.id = 'artikel-quick-create-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h2>➕ Neuer Artikel</h2>
        <button class="btn-close" onclick="closeArtikelQuickCreate()">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Artikel-Name *</label>
          <input type="text" id="quick-artikel-name" class="input-field" placeholder="z.B. Premium Package">
        </div>
        <div class="form-group">
          <label>Typ</label>
          <select id="quick-artikel-typ" class="input-field">
            <option value="">-- Auswählen --</option>
            <option value="Package">Package</option>
            <option value="Consulting">Consulting</option>
            <option value="Software">Software</option>
            <option value="Hardware">Hardware</option>
            <option value="Service">Service</option>
          </select>
        </div>
        <div class="form-group">
          <label>Release-Datum</label>
          <input type="month" id="quick-release-datum" class="input-field">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeArtikelQuickCreate()">Abbrechen</button>
        <button class="btn btn-primary" onclick="createArtikelQuick()">Erstellen</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  // Focus name field
  setTimeout(() => {
    document.getElementById('quick-artikel-name')?.focus();
  }, 100);
};

/**
 * Create artikel from quick modal
 */
window.createArtikelQuick = async function() {
  const projektId = window.cfoDashboard.currentProjekt;
  const artikelName = document.getElementById('quick-artikel-name')?.value?.trim();
  
  if (!artikelName) {
    alert('Bitte Artikel-Name eingeben!');
    return;
  }

  console.log('➕ Creating artikel:', artikelName);

  try {
    const newArtikel = {
      id: helpers.generateId('artikel'),
      project_id: projektId,
      name: artikelName,
      typ: document.getElementById('quick-artikel-typ')?.value || '',
      release_datum: document.getElementById('quick-release-datum')?.value || '2025-01',
      status: 'aktiv',
      geschaeftsmodell: 'B2B',
      zielmarkt: 'DACH',
      strategie: 'wachstum',
      investment_typ: 'maintainer',
      kategorie: '',
      beschreibung: '',
      start_menge: 0,
      start_preis: 0,
      start_hk: 0,
      mengen_modell: 'konstant',
      preis_modell: 'konstant',
      kosten_modell: 'konstant',
      mengen_wachstum: 0,
      preis_wachstum: 0,
      kosten_wachstum: 0,
      volumes: {},
      prices: {},
      hk: 20  // Geändert von 600 zu 20
    };

    // Save to database
    const saved = await api.saveArticle(newArtikel);

    if (saved) {
      console.log('✅ Artikel created');
      
      // Close modal
      closeArtikelQuickCreate();
      
      // WICHTIG: Lade Artikel neu aus der Datenbank
      await api.loadArticles(projektId);
      
      // Dann erst re-render
      renderArtikelHierarchy();
      
      // Alternativ: Direkt den neuen Artikel zum State hinzufügen
      const artikelId = 'artikel-db-' + saved.id;
      state.setArtikel(artikelId, {
        ...newArtikel,
        id: artikelId
      });
      
      // Force re-render der Tabelle
      const tbody = document.getElementById('projekt-artikel-list-tbody');
      if (tbody && window.renderArtikelHierarchy) {
        window.renderArtikelHierarchy();
        const sourceBody = document.getElementById('artikel-list-tbody');
        if (sourceBody) {
          tbody.innerHTML = sourceBody.innerHTML;
        }
      }
      
      // AI Feedback
      if (window.cfoDashboard.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
          level: 'success',
          title: '✅ Artikel erstellt',
          text: `"${artikelName}" wurde erfolgreich angelegt.`,
          timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
      }
    }
  } catch (error) {
    console.error('❌ Create failed:', error);
    alert('Fehler beim Erstellen: ' + error.message);
  }
};

window.closeArtikelQuickCreate = function() {
  const modal = document.getElementById('artikel-quick-create-modal');
  if (modal) modal.remove();
};

// ==========================================
// ARTIKEL DELETE
// ==========================================

/**
 * Delete artikel with confirmation
 */
window.deleteArtikel = function(artikelId) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return;

  const confirmed = confirm(`Artikel "${artikel.name}" wirklich löschen?`);
  if (!confirmed) return;

  console.log('🗑️ Deleting artikel:', artikelId);

  api.deleteArticle(artikelId).then(success => {
    if (success) {
      console.log('✅ Artikel deleted');

      // Re-render list
      renderArtikelHierarchy();

      // Update charts
      charts.updateAllCharts();

      // AI Feedback
      if (window.cfoDashboard.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
          level: 'info',
          title: '🗑️ Artikel gelöscht',
          text: `"${artikel.name}" wurde entfernt.`,
          timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
      }
    }
  });
};

// ==========================================
// ARTIKEL DUPLICATE
// ==========================================

/**
 * Duplicate artikel
 */
window.duplicateArtikel = async function(artikelId) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return;

  const newName = prompt('Name für Duplikat:', artikel.name + ' (Kopie)');
  if (!newName || newName.trim() === '') return;

  console.log('📋 Duplicating artikel:', artikelId);

  try {
    const duplicateData = {
      ...artikel,
      name: newName,
      id: undefined // Remove ID so new one is generated
    };

    const saved = await api.saveArticle(duplicateData);

    if (saved) {
      console.log('✅ Artikel duplicated');

      // Re-render list
      renderArtikelHierarchy();

      // AI Feedback
      if (window.cfoDashboard.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
          level: 'success',
          title: '📋 Artikel dupliziert',
          text: `"${newName}" wurde erstellt.`,
          timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
      }
    }

  } catch (error) {
    console.error('❌ Duplicate failed:', error);
    alert('Fehler beim Duplizieren: ' + error.message);
  }
};

// ==========================================
// CALCULATIONS
// ==========================================

/**
 * Calculate total revenue for artikel
 */
function calculateArtikelRevenue(artikelId) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return 0;

  let totalRevenue = 0;

  Object.keys(artikel.volumes || {}).forEach(year => {
    const volume = artikel.volumes[year] || 0;
    const price = artikel.prices[year] || 0;
    totalRevenue += (volume * price) / 1000; // Convert to k€
  });

  return totalRevenue;
}

/**
 * Calculate DB2 margin for artikel
 */
function calculateArtikelDB2(artikelId) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return 0;

  const revenue = calculateArtikelRevenue(artikelId);
  if (revenue === 0) return 0;

  let totalCosts = 0;

  Object.keys(artikel.volumes || {}).forEach(year => {
    const volume = artikel.volumes[year] || 0;
    const hk = artikel.hk || 0;
    totalCosts += (volume * hk) / 1000;
  });

  const db2 = revenue - totalCosts;
  return (db2 / revenue) * 100;
}

// ==========================================
// BULK ACTIONS
// ==========================================

/**
 * Update bulk actions bar visibility
 */
window.updateArtikelBulkActions = function() {
  const checkedBoxes = document.querySelectorAll('.artikel-checkbox:checked');
  const bulkBar = document.getElementById('artikel-bulk-actions-bar');

  if (bulkBar) {
    bulkBar.style.display = checkedBoxes.length > 0 ? 'flex' : 'none';
    
    const countElement = document.getElementById('artikel-bulk-count');
    if (countElement) {
      countElement.textContent = checkedBoxes.length;
    }
  }
};

// ==========================================
// EXPORTS
// ==========================================

export default {
  renderArtikelListByProjekt,      // ← ALT (bleibt für Kompatibilität)
  renderArtikelHierarchy,          // ← NEU ✅
  calculateArtikelRevenue,
  calculateArtikelDB2
};

// ==========================================
// INTELLIGENT ARTIKEL CREATION (NEW)
// ==========================================

/**
 * Wrapper function for intelligent artikel creation modal
 * Uses window.cfoDashboard directly since state.projektData may be undefined
 */
window.openArtikelCreationModal = function() {
  const projektId = window.cfoDashboard.currentProjekt;
  
  if (!projektId) {
    alert('Bitte erst Projekt auswählen!');
    return;
  }
  
  // Get projekt from window.cfoDashboard.projektData (NOT from state!)
  const projekt = window.cfoDashboard.projektData[projektId];
  
  if (!projekt) {
    console.error('Projekt not found:', projektId);
    console.log('Available projects:', Object.keys(window.cfoDashboard.projektData || {}));
    alert('Projekt nicht gefunden!');
    return;
  }
  
  console.log('🤖 Opening intelligent artikel creation for:', projekt.name);
  
  // Call the actual modal function with projektId
  openArtikelCreationModalCore(projektId);
};
