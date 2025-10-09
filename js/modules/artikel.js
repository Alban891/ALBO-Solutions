/**
 * CFO Dashboard - Artikel Module
 * Complete article lifecycle: Create, Read, Update, Delete, Render
 * Enterprise-grade with validation and error handling
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';
import * as api from '../api.js';
import * as charts from '../charts.js';

// ==========================================
// ARTIKEL RENDERING
// ==========================================

/**
 * Render artikel list for current project
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
  state.currentArtikel = artikelId;

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
  // Basic Info
  helpers.setInputValue('artikel-name', artikel.name);
  helpers.setInputValue('artikel-typ', artikel.typ);
  helpers.setInputValue('kategorie', artikel.kategorie);
  helpers.setInputValue('geschaeftsmodell', artikel.geschaeftsmodell);
  helpers.setInputValue('zielmarkt', artikel.zielmarkt);
  helpers.setInputValue('strategie', artikel.strategie);
  helpers.setInputValue('investment-typ', artikel.investment_typ);
  helpers.setInputValue('artikel-beschreibung', artikel.beschreibung);
  helpers.setInputValue('release-datum', artikel.release_datum);
  helpers.setInputValue('annahmen', artikel.annahmen);

  // Start values
  helpers.setInputValue('start-menge', helpers.formatThousands(artikel.start_menge || 0));
  helpers.setInputValue('start-preis', helpers.formatDecimal(artikel.start_preis || 0));
  helpers.setInputValue('start-hk', helpers.formatDecimal(artikel.start_hk || 0));

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

  // Zeitraum
  if (artikel.zeitraum) {
    const zeitraumBtn = document.querySelector(`button[onclick*="${artikel.zeitraum}"]`);
    if (zeitraumBtn) {
      document.querySelectorAll('.zeitraum-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      zeitraumBtn.classList.add('active');
    }
  }

  // Load year data into table
  loadYearDataIntoTable(artikel);

  console.log('✅ Artikel loaded into form');
}

/**
 * Load year data (volumes, prices) into table
 */
function loadYearDataIntoTable(artikel) {
  const startYear = artikel.tableStartYear || parseInt((artikel.release_datum || '2025-01').split('-')[0]);
  const zeitraum = artikel.zeitraum || 5;

  for (let i = 1; i <= zeitraum; i++) {
    const year = startYear + i - 1;

    // Menge
    const mengeInput = document.getElementById(`menge-jahr-${i}`);
    if (mengeInput && artikel.volumes && artikel.volumes[year]) {
      mengeInput.value = helpers.formatThousands(artikel.volumes[year]);
    }

    // Preis
    const preisInput = document.getElementById(`preis-jahr-${i}`);
    if (preisInput && artikel.prices && artikel.prices[year]) {
      preisInput.value = helpers.formatDecimal(artikel.prices[year]);
    }

    // HK
    const hkInput = document.getElementById(`hk-jahr-${i}`);
    if (hkInput && artikel.hk) {
      hkInput.value = helpers.formatDecimal(artikel.hk);
    }
  }

  console.log('✅ Year data loaded into table');
}

// ==========================================
// ARTIKEL SAVE
// ==========================================

/**
 * Save artikel changes to database
 */
window.saveArtikelChanges = async function() {
  const artikelId = window.cfoDashboard.currentArtikel;
  if (!artikelId) {
    console.error('No artikel selected');
    return;
  }

  console.log('💾 Saving artikel:', artikelId);

  try {
    // Collect form data
    const artikelData = collectArtikelFormData();

    // Validate
    if (!artikelData.name || artikelData.name.trim() === '') {
      alert('Bitte Artikelname eingeben!');
      return;
    }

    // Get existing artikel
    const existingArtikel = state.getArtikel(artikelId);
    if (!existingArtikel) {
      console.error('Artikel not found');
      return;
    }

    // Merge data
    const updatedArtikel = {
      ...existingArtikel,
      ...artikelData
    };

    // Update in database
    const success = await api.updateArticle(artikelId, updatedArtikel);

    if (success) {
      console.log('✅ Artikel saved');

      // Update charts
      charts.updateAllCharts();

      // Show success message
      if (window.cfoDashboard.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
          level: 'success',
          title: '✅ Artikel gespeichert',
          text: `"${artikelData.name}" wurde erfolgreich aktualisiert.`,
          timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
      }

      // Return to list
      closeArtikelDetail();
    } else {
      alert('Fehler beim Speichern. Bitte erneut versuchen.');
    }

  } catch (error) {
    console.error('❌ Save failed:', error);
    alert('Fehler beim Speichern: ' + error.message);
  }
};

/**
 * Collect form data into artikel object
 */
function collectArtikelFormData() {
  // Basic info
  const data = {
    name: helpers.getInputValue('artikel-name'),
    typ: helpers.getInputValue('artikel-typ'),
    kategorie: helpers.getInputValue('kategorie'),
    geschaeftsmodell: helpers.getInputValue('geschaeftsmodell'),
    zielmarkt: helpers.getInputValue('zielmarkt'),
    strategie: helpers.getInputValue('strategie'),
    investment_typ: helpers.getInputValue('investment-typ'),
    beschreibung: helpers.getInputValue('artikel-beschreibung'),
    release_datum: helpers.getInputValue('release-datum'),
    annahmen: helpers.getInputValue('annahmen')
  };

  // Start values
  data.start_menge = helpers.parseFormattedNumber(helpers.getInputValue('start-menge'));
  data.start_preis = helpers.parseFormattedNumber(helpers.getInputValue('start-preis'));
  data.start_hk = helpers.parseFormattedNumber(helpers.getInputValue('start-hk'));

  // Models
  const mengenModell = document.querySelector('input[name="mengen-modell"]:checked');
  const preisModell = document.querySelector('input[name="preis-modell"]:checked');
  const kostenModell = document.querySelector('input[name="kosten-modell"]:checked');

  data.mengen_modell = mengenModell?.value || 'realistisch';
  data.preis_modell = preisModell?.value || 'konstant';
  data.kosten_modell = kostenModell?.value || 'lernkurve';

  // Zeitraum
  const zeitraumBtn = document.querySelector('.zeitraum-btn.active');
  data.zeitraum = parseInt(zeitraumBtn?.dataset?.jahre || '5');

  // Year data (volumes, prices)
  const startYear = parseInt((data.release_datum || '2025-01').split('-')[0]);
  data.volumes = {};
  data.prices = {};

  for (let i = 1; i <= data.zeitraum; i++) {
    const year = startYear + i - 1;

    const mengeValue = helpers.getInputValue(`menge-jahr-${i}`);
    const preisValue = helpers.getInputValue(`preis-jahr-${i}`);

    if (mengeValue) {
      data.volumes[year] = helpers.parseFormattedNumber(mengeValue);
    }

    if (preisValue) {
      data.prices[year] = helpers.parseFormattedNumber(preisValue);
    }
  }

  data.hk = data.start_hk; // For now, use start HK for all years

  return data;
}

/**
 * Close artikel detail view
 */
window.closeArtikelDetail = function() {
  console.log('🔙 Closing artikel detail');

  const artikelDetail = document.getElementById('artikel-detail-view');
  const projektDetail = document.getElementById('projekt-detail-view');

  // Hide artikel detail
  if (artikelDetail) artikelDetail.style.display = 'none';

  // Show projekt detail
  if (projektDetail) projektDetail.style.display = 'block';

  // Switch to artikel tab
  if (window.switchProjektTab) {
    window.switchProjektTab('artikel');
  }

  // Clear current artikel
  window.cfoDashboard.currentArtikel = null;
  state.currentArtikel = null;

  // Re-render list
  renderArtikelListByProjekt();

  // Save state
  if (window.saveNavigationState) {
    window.saveNavigationState();
  }
};

// ==========================================
// ARTIKEL CREATE
// ==========================================

/**
 * Create new artikel
 */
window.createNewArtikel = async function() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) {
    alert('Bitte zuerst ein Projekt auswählen!');
    return;
  }

  const artikelName = prompt('Artikelname:');
  if (!artikelName || artikelName.trim() === '') return;

  console.log('➕ Creating new artikel:', artikelName);

  try {
    const newArtikel = {
      name: artikelName,
      projektId: projektId,
      typ: 'Hardware',
      kategorie: '',
      geschaeftsmodell: '',
      zielmarkt: '',
      strategie: '',
      investment_typ: '',
      beschreibung: '',
      release_datum: helpers.getCurrentDate().substring(0, 7), // YYYY-MM
      annahmen: '',
      start_menge: 100,
      start_preis: 1000,
      start_hk: 600,
      mengen_modell: 'realistisch',
      preis_modell: 'konstant',
      kosten_modell: 'lernkurve',
      zeitraum: 5,
      volumes: {},
      prices: {},
      hk: 600
    };

    // Save to database
    const saved = await api.saveArticle(newArtikel);

    if (saved) {
      console.log('✅ Artikel created');

      // Re-render list
      renderArtikelListByProjekt();

      // Update charts
      charts.updateAllCharts();

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
      renderArtikelListByProjekt();

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
      renderArtikelListByProjekt();

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
  renderArtikelListByProjekt,
  calculateArtikelRevenue,
  calculateArtikelDB2
};
