/**
 * CFO Dashboard - Artikel Module
 * Complete article lifecycle: Create, Read, Update, Delete, Render
 * Enterprise-grade with validation and error handling
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

  // Zeitraum - MIT KORREKTER BUTTON-AKTIVIERUNG
  const zeitraum = artikel.zeitraum || 5;  // Default: 5 Jahre
  
  // Alle Buttons zurücksetzen
  document.querySelectorAll('.zeitraum-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = 'white';
    btn.style.color = '#374151';
    btn.style.border = '1px solid #e5e7eb';
    btn.style.fontWeight = '500';
  });
  
  // Den korrekten Button aktivieren
  const targetBtn = document.getElementById(`zeitraum-btn-${zeitraum}`);
  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.style.background = '#1e3a8a';
    targetBtn.style.color = 'white';
    targetBtn.style.border = '2px solid #1e3a8a';
    targetBtn.style.fontWeight = '600';
  }
  
  // Tabellen-Spalten anpassen
  if (window.updateTabellenSpalten) {
    window.updateTabellenSpalten(zeitraum);
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

      // 🆕 ALBO Event: Artikel gespeichert
      document.dispatchEvent(new CustomEvent('artikel-saved', {
        detail: {
          artikel: updatedArtikel,
          artikelId: artikelId
        }
      }));
  
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

  // Start values - Beispielwerte ignorieren
  const mengeValue = helpers.getInputValue('start-menge');
  const preisValue = helpers.getInputValue('start-preis');
  const hkValue = helpers.getInputValue('start-hk');
  
  data.start_menge = (mengeValue && !mengeValue.startsWith('z.B.')) 
    ? helpers.parseFormattedNumber(mengeValue) || 0 
    : 0;
  data.start_preis = (preisValue && !preisValue.startsWith('z.B.')) 
    ? helpers.parseFormattedNumber(preisValue) || 0 
    : 0;
  data.start_hk = (hkValue && !hkValue.startsWith('z.B.')) 
    ? helpers.parseFormattedNumber(hkValue) || 0 
    : 0;

  // Models
  const mengenModell = document.querySelector('input[name="mengen-modell"]:checked');
  const preisModell = document.querySelector('input[name="preis-modell"]:checked');
  const kostenModell = document.querySelector('input[name="kosten-modell"]:checked');

  data.mengen_modell = mengenModell?.value || 'realistisch';
  data.preis_modell = preisModell?.value || 'konstant';
  data.kosten_modell = kostenModell?.value || 'lernkurve';

  // Zeitraum - FIX: Aus Button-Text extrahieren
  const zeitraumBtn = document.querySelector('.zeitraum-btn.active');
  if (zeitraumBtn) {
    const btnText = zeitraumBtn.textContent;
    const match = btnText.match(/(\d+)/);
    data.zeitraum = match ? parseInt(match[1]) : 5;
  } else {
    data.zeitraum = 5; // Default
  }

  // Year data - sicherer
  const releaseDatum = data.release_datum || new Date().toISOString().substring(0, 7);
  const startYear = parseInt(releaseDatum.split('-')[0]);
  
  data.volumes = {};
  data.prices = {};

  // Nur Felder sammeln die existieren
  for (let i = 1; i <= 7; i++) { // Bis zu 7 Jahre möglich
    const mengeInput = document.getElementById(`menge-jahr-${i}`);
    const preisInput = document.getElementById(`preis-jahr-${i}`);
    
    if (mengeInput && mengeInput.value) {
      const year = startYear + i - 1;
      data.volumes[year] = helpers.parseFormattedNumber(mengeInput.value) || 0;
    }
    
    if (preisInput && preisInput.value) {
      const year = startYear + i - 1;
      data.prices[year] = helpers.parseFormattedNumber(preisInput.value) || 0;
    }
  }

  // HK und table_start_year
  data.hk = data.start_hk || 0;
  data.table_start_year = startYear;

  console.log('📊 Collected data:', data);
  return data;
}

// ==========================================
// WIRTSCHAFTLICHKEIT HELPERS
// ==========================================

/**
 * Set planning horizon (3, 5, or 7 years)
 */
window.setzeZeitraum = function(jahre) {
  console.log('📅 Setting Zeitraum to:', jahre);
  
  // Alle Buttons zurücksetzen
  document.querySelectorAll('.zeitraum-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = 'white';
    btn.style.color = '#374151';
    btn.style.border = '1px solid #e5e7eb';
    btn.style.fontWeight = '500';
  });
  
  // Den korrekten Button aktivieren
  const targetBtn = document.getElementById(`zeitraum-btn-${jahre}`);
  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.style.background = '#1e3a8a';
    targetBtn.style.color = 'white';
    targetBtn.style.border = '2px solid #1e3a8a';
    targetBtn.style.fontWeight = '600';
  }
  
  // Zeitraum speichern
  const artikelId = window.cfoDashboard.currentArtikel;
  if (artikelId) {
    const artikel = state.getArtikel(artikelId);
    if (artikel) {
      artikel.zeitraum = jahre;
      state.setArtikel(artikelId, artikel);
      state.saveState();
    }
  }

  // Prüfe und aktualisiere Projekt-Ende wenn nötig
  const releaseDatum = document.getElementById('release-datum')?.value || '2025-01';
  const releaseYear = parseInt(releaseDatum.split('-')[0]);
  const artikelEnde = releaseYear + jahre - 1;
  
  // Hole aktuelles Projekt-Ende
  const projektEndeInput = document.getElementById('projekt-ende');
  if (projektEndeInput) {
    const projektEndeYear = parseInt(projektEndeInput.value.split('-')[0]);
    
    // Wenn Artikel länger läuft als Projekt, erweitere Projekt
    if (artikelEnde > projektEndeYear) {
      projektEndeInput.value = `${artikelEnde}-12`;
      
      // Zeige Info-Message
      if (window.cfoDashboard?.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
          level: 'info',
          title: '📅 Projektzeitraum angepasst',
          text: `Projektende wurde auf ${artikelEnde} erweitert, um den Artikel-Zeitraum abzudecken.`,
          timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
      }
    }
  }
  
  // Tabellen-Spalten anpassen
  updateTabellenSpalten(jahre);
}  // <- HIER war die schließende Klammer an der falschen Stelle

/**
 * Tabellen-Spalten basierend auf Zeitraum anzeigen/verstecken
 */
window.updateTabellenSpalten = function(jahre) {
  const zeitraum = jahre || getCurrentZeitraum();
  
  // Alle Jahr-Spalten durchgehen
  for (let i = 1; i <= 7; i++) {
    const cols = document.querySelectorAll('.jahr-col.jahr-' + i);
    cols.forEach(col => {
      col.style.display = i <= zeitraum ? '' : 'none';
    });
  }
  
  // Jahr-Header mit tatsächlichen Jahren aktualisieren
  const releaseDatum = document.getElementById('release-datum')?.value || '2025-01';
  const startYear = parseInt(releaseDatum.split('-')[0]);
  
  for (let i = 1; i <= zeitraum; i++) {
    const header = document.querySelector('.jahr-header-' + i);
    if (header) {
      // Jahr 1 bekommt speziellen Hinweis
      if (i === 1) {
        header.textContent = (startYear + i - 1) + ' (Start)';
      } else {
        header.textContent = startYear + i - 1;
      }
    }
  }
  
  // Nach Update auch Startwerte in Jahr 1 setzen
  updateErsteZeile();
}

/**
 * Aktuellen Zeitraum ermitteln
 */
function getCurrentZeitraum() {
  const activeBtn = document.querySelector('.zeitraum-btn.active');
  if (activeBtn) {
    const text = activeBtn.textContent;
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 5;
  }
  return 5; // Default
}

/**
 * Update erste Zeile der Tabelle mit Startwerten
 */
/**
 * Update erste Zeile der Tabelle mit Startwerten
 * Startwerte werden IMMER in Jahr 1 übernommen
 */
window.updateErsteZeile = function() {
  // Werte aus Inputs holen, aber Beispielwerte ignorieren
  const mengeValue = helpers.getInputValue('start-menge');
  const preisValue = helpers.getInputValue('start-preis');
  const hkValue = helpers.getInputValue('start-hk');
  
  let startMenge = 0;
  let startPreis = 0;
  let startHK = 0;
  
  // Nur übernehmen wenn kein Beispielwert
  if (mengeValue && !mengeValue.startsWith('z.B.')) {
    startMenge = helpers.parseFormattedNumber(mengeValue) || 0;
  }
  if (preisValue && !preisValue.startsWith('z.B.')) {
    startPreis = helpers.parseFormattedNumber(preisValue) || 0;
  }
  if (hkValue && !hkValue.startsWith('z.B.')) {
    startHK = helpers.parseFormattedNumber(hkValue) || 0;
  }
  
  // IMMER in erste Spalte (Jahr 1) der Ergebnis-Vorschau übernehmen
  const mengeInput = document.getElementById('menge-jahr-1');
  const preisInput = document.getElementById('preis-jahr-1');
  const hkInput = document.getElementById('hk-jahr-1');
  
  if (mengeInput) {
    mengeInput.value = startMenge > 0 ? helpers.formatThousands(startMenge) : '';
    mengeInput.readOnly = true; // Jahr 1 ist immer readonly
    mengeInput.style.background = '#f9fafb'; // Grauer Hintergrund
  }
  if (preisInput) {
    preisInput.value = startPreis > 0 ? helpers.formatDecimal(startPreis) : '';
    preisInput.readOnly = true;
    preisInput.style.background = '#f9fafb';
  }
  if (hkInput) {
    hkInput.value = startHK > 0 ? helpers.formatDecimal(startHK) : '';
    hkInput.readOnly = true;
    hkInput.style.background = '#f9fafb';
  }
  // 🆕 ALBO Event: Basisannahmen komplett (wenn alle 3 Werte > 0)
  if (startMenge > 0 && startPreis > 0 && startHK > 0) {
    document.dispatchEvent(new CustomEvent('basisannahmen-complete', {
      detail: {
        menge: startMenge,
        preis: startPreis,
        hk: startHK,
        artikel: window.cfoDashboard.currentArtikel,
        projekt: window.cfoDashboard.currentProjekt
      }
    }));
  }
}

/**
 * Berechne Modelle basierend auf gewählten Einstellungen
 */
/**
 * Berechne Modelle basierend auf gewählten Einstellungen
 * Jahr 1 = Startwerte (immer identisch)
 * Modelle greifen erst ab Jahr 2
 */
window.berechneModelle = function() {
  console.log('📊 Berechne Modelle...');
  
  // Werte aus Inputs holen, aber Beispielwerte ignorieren
  let startMenge = 0;
  let startPreis = 0;
  let startHK = 0;
  
  const mengeValue = helpers.getInputValue('start-menge');
  const preisValue = helpers.getInputValue('start-preis');
  const hkValue = helpers.getInputValue('start-hk');
  
  // Nur übernehmen wenn kein Beispielwert und nicht leer
  if (mengeValue && !mengeValue.startsWith('z.B.')) {
    startMenge = helpers.parseFormattedNumber(mengeValue) || 0;
  }
  if (preisValue && !preisValue.startsWith('z.B.')) {
    startPreis = helpers.parseFormattedNumber(preisValue) || 0;
  }
  if (hkValue && !hkValue.startsWith('z.B.')) {
    startHK = helpers.parseFormattedNumber(hkValue) || 0;
  }
  
  // Wenn keine Startwerte, abbrechen
  if (startMenge === 0 && startPreis === 0 && startHK === 0) {
    console.log('⚠️ Keine Startwerte vorhanden');
    return;
  }
  
  const mengenModell = document.querySelector('input[name="mengen-modell"]:checked')?.value || 'realistisch';
  const preisModell = document.querySelector('input[name="preis-modell"]:checked')?.value || 'konstant';
  const kostenModell = document.querySelector('input[name="kosten-modell"]:checked')?.value || 'lernkurve';
  
  const zeitraum = getCurrentZeitraum();
  
  console.log('Startwerte:', { startMenge, startPreis, startHK });
  console.log('Modelle:', { mengenModell, preisModell, kostenModell });
  
  // IMMER Jahr 1 mit Startwerten setzen
  updateErsteZeile();
  
  // Berechne ab Jahr 2 basierend auf den Modellen
  for (let jahr = 2; jahr <= zeitraum; jahr++) {
    // Mengenberechnung (ab Jahr 2)
    let menge = startMenge;
    if (mengenModell !== 'manuell') {
      switch(mengenModell) {
        case 'konservativ':
          // +15% p.a.
          menge = startMenge * Math.pow(1.15, jahr - 1);
          break;
        case 'realistisch': 
          // S-Kurve
          const t = (jahr - 1) / (zeitraum - 1);
          menge = startMenge * (1 + 4 * (1 / (1 + Math.exp(-10 * (t - 0.5)))));
          break;
        case 'optimistisch': 
          // Hockey-Stick
          if (jahr <= 3) {
            menge = startMenge * (1 + 0.5 * (jahr - 1));
          } else {
            menge = startMenge * Math.pow(2.5, jahr - 3) * 2;
          }
          break;
      }
      
      const mengeInput = document.getElementById(`menge-jahr-${jahr}`);
      if (mengeInput) {
        mengeInput.value = helpers.formatThousands(Math.round(menge));
        mengeInput.readOnly = false;
        mengeInput.style.background = 'white';
      }
    }
    
    // Preisberechnung (ab Jahr 2)
    let preis = startPreis;
    if (preisModell !== 'manuell') {
      switch(preisModell) {
        case 'konstant':
          preis = startPreis;
          break;
        case 'inflation':
          // +2% p.a.
          preis = startPreis * Math.pow(1.02, jahr - 1);
          break;
        case 'premium':
          // +5% p.a.
          preis = startPreis * Math.pow(1.05, jahr - 1);
          break;
        case 'skimming':
          // -3% p.a.
          preis = startPreis * Math.pow(0.97, jahr - 1);
          break;
      }
      
      const preisInput = document.getElementById(`preis-jahr-${jahr}`);
      if (preisInput) {
        preisInput.value = helpers.formatDecimal(preis);
        preisInput.readOnly = false;
        preisInput.style.background = 'white';
      }
    }
    
    // Kostenberechnung (ab Jahr 2)
    let hk = startHK;
    if (kostenModell !== 'manuell') {
      switch(kostenModell) {
        case 'konstant':
          hk = startHK;
          break;
        case 'lernkurve':
          // -5% bei Verdopplung der kumulierten Menge
          let kumulierteMenge = startMenge;
          for (let j = 2; j <= jahr; j++) {
            kumulierteMenge += startMenge * Math.pow(1.15, j - 1);
          }
          const verdopplungen = Math.log2(kumulierteMenge / startMenge);
          hk = startHK * Math.pow(0.95, verdopplungen);
          break;
        case 'inflation':
          // +3% p.a.
          hk = startHK * Math.pow(1.03, jahr - 1);
          break;
        case 'skaleneffekte':
          // Stufenweise Reduktion basierend auf aktueller Menge
          if (menge > 10000) hk = startHK * 0.7;
          else if (menge > 5000) hk = startHK * 0.8;
          else if (menge > 2000) hk = startHK * 0.9;
          else hk = startHK;
          break;
      }
      
      const hkInput = document.getElementById(`hk-jahr-${jahr}`);
      if (hkInput) {
        hkInput.value = helpers.formatDecimal(hk);
        hkInput.readOnly = false;
        hkInput.style.background = 'white';
      }
    }
  }
  
  console.log('✅ Modelle berechnet (Jahr 1 = Startwerte, ab Jahr 2 = Modelle)');
  
  // 🆕 ALBO Event: Modelle berechnet
  document.dispatchEvent(new CustomEvent('modelle-berechnet', {
    detail: {
      artikel: window.cfoDashboard.currentArtikel,
      projekt: window.cfoDashboard.currentProjekt,
      mengenModell: mengenModell,
      preisModell: preisModell,
      kostenModell: kostenModell,
      zeitraum: zeitraum,
      startwerte: {
        menge: startMenge,
        preis: startPreis,
        hk: startHK
      }
    }
  }));
}

/**
 * Reset alle Modelle auf Standardwerte
 */
window.resetModelle = function() {
  console.log('🔄 Reset Modelle...');
  
  // Reset Radio Buttons auf Defaults
  const mengenRadio = document.querySelector('input[name="mengen-modell"][value="realistisch"]');
  const preisRadio = document.querySelector('input[name="preis-modell"][value="konstant"]');
  const kostenRadio = document.querySelector('input[name="kosten-modell"][value="lernkurve"]');
  
  if (mengenRadio) mengenRadio.checked = true;
  if (preisRadio) preisRadio.checked = true;
  if (kostenRadio) kostenRadio.checked = true;
  
  // Reset Startwerte auf Beispielwerte
  const startMengeInput = document.getElementById('start-menge');
  const startPreisInput = document.getElementById('start-preis');
  const startHKInput = document.getElementById('start-hk');
  
  if (startMengeInput) {
    startMengeInput.value = 'z.B. 1.000';
    startMengeInput.style.color = '#6b7280';
  }
  if (startPreisInput) {
    startPreisInput.value = 'z.B. 50,00';
    startPreisInput.style.color = '#6b7280';
  }
  if (startHKInput) {
    startHKInput.value = 'z.B. 20,00';
    startHKInput.style.color = '#6b7280';
  }
  
  // Zeitraum auf 5 Jahre
  setzeZeitraum(5);
  
  // Berechne neu
  berechneModelle();
}

/**
 * Modell anwenden (wird von Radio-Buttons aufgerufen)
 */
window.applyModell = function(typ, modell) {
  console.log(`Applying ${modell} model for ${typ}`);
  // Berechnung wird durch berechneModelle() ausgeführt
}

/**
 * Update Zeithorizont basierend auf Release-Datum
 */
window.updateZeithorizont = function() {
  const releaseDatum = document.getElementById('release-datum')?.value;
  if (releaseDatum) {
    updateTabellenSpalten();
  }
}

/**
 * Format number input helper
 */
window.formatNumberInput = function(input) {
  if (!input || !input.value) return;
  
  // Beispielwert nicht formatieren
  if (input.value.startsWith('z.B.')) return;
  
  let value = input.value.replace(/\./g, '').replace(',', '.');
  const numValue = parseFloat(value);
  
  if (!isNaN(numValue)) {
    input.value = helpers.formatThousands(numValue);
  }
}

/**
 * Format decimal input helper
 */
window.formatDecimalInput = function(input, decimals = 2) {
  if (!input || !input.value) return;
  
  // Beispielwert nicht formatieren
  if (input.value.startsWith('z.B.')) return;
  
  let value = input.value.replace(/\./g, '').replace(',', '.');
  const numValue = parseFloat(value);
  
  if (!isNaN(numValue)) {
    input.value = helpers.formatDecimal(numValue, decimals);
  }
}

// ==========================================
// PLACEHOLDER & BEISPIELWERT HANDLING
// ==========================================

/**
 * Handle input focus - clear placeholder if it's a default value
 */
window.handleInputFocus = function(input) {
  if (input.value === 'z.B. 1.000' || 
      input.value === 'z.B. 50,00' || 
      input.value === 'z.B. 20,00') {
    input.value = '';
    input.style.color = '#111827';
  }
}

/**
 * Handle input blur - restore placeholder if empty
 */
window.handleInputBlur = function(input, type) {
  if (input.value.trim() === '') {
    switch(type) {
      case 'menge':
        input.value = 'z.B. 1.000';
        break;
      case 'preis':
        input.value = 'z.B. 50,00';
        break;
      case 'hk':
        input.value = 'z.B. 20,00';
        break;
    }
    input.style.color = '#6b7280';
  } else {
    if (type === 'menge') {
      formatNumberInput(input);
    } else {
      formatDecimalInput(input);
    }
    input.style.color = '#111827';
  }
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

  // ✓ CRITICAL: Update navigation state
  window.cfoDashboard.currentArtikel = null;
  state.currentArtikel = null;
  state.artikelViewMode = 'list';
  state.artikelDetailScroll = 0;
  state.saveState();
  
  console.log('💾 Cleared artikel from state');

  // Switch to artikel tab
  if (window.switchProjektTab) {
    window.switchProjektTab('artikel');
  }

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
window.createNewArtikel = function() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) {
    alert('Bitte zuerst ein Projekt auswählen!');
    return;
  }

  const modalHTML = `
    <div id="artikel-quick-create-modal" class="modal" style="display: flex; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); align-items: center; justify-content: center;">
      <div class="modal-content" style="background: white; border-radius: 8px; max-width: 500px; width: 90%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
          <h2 style="margin: 0; color: #1e3a8a; font-size: 18px;">➕ Neuen Artikel anlegen - Quick Create</h2>
        </div>
        
        <div class="modal-body" style="padding: 20px;">
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Artikel-Bezeichnung *</label>
            <input type="text" id="quick-artikel-name" 
                   placeholder="z.B. Smart Sensor System" 
                   style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; 
                          border-radius: 4px; font-size: 14px;">
          </div>
          
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Typ *</label>
            <select id="quick-artikel-typ" 
                    style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; 
                           border-radius: 4px; font-size: 14px; background: white;">
              <option value="Neu-Produkt">Neu-Produkt</option>
              <option value="Cross-Selling">Cross-Selling</option>
              <option value="Kannibalisierung">Kannibalisierung</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Release-Datum *</label>
            <input type="month" id="quick-artikel-release" 
                   value="${new Date().toISOString().substring(0,7)}"
                   style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; 
                          border-radius: 4px; font-size: 14px;">
          </div>
        </div>
        
        <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
          <button onclick="closeArtikelQuickCreate()" 
                  style="padding: 10px 20px; border: 1px solid #e5e7eb; background: white; 
                         border-radius: 6px; cursor: pointer;">
            Abbrechen
          </button>
          <button onclick="saveQuickArtikel()" 
                  style="padding: 10px 20px; background: #1e3a8a; color: white; 
                         border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
            🚀 Artikel anlegen
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Focus auf Name-Feld
  setTimeout(() => {
    document.getElementById('quick-artikel-name')?.focus();
  }, 100);
};

window.saveQuickArtikel = async function() {
  const projektId = window.cfoDashboard.currentProjekt;
  const artikelName = document.getElementById('quick-artikel-name')?.value;
  const effektTyp = document.getElementById('quick-artikel-typ')?.value;
  const releaseDatum = document.getElementById('quick-artikel-release')?.value;
  
  if (!artikelName || artikelName.trim() === '') {
    alert('Bitte Artikelname eingeben!');
    return;
  }
  
  console.log('💾 Creating artikel:', artikelName, effektTyp, releaseDatum);
  
  try {
    const newArtikel = {
      name: artikelName,
      projektId: projektId,
      projekt_id: projektId,
      typ: '',
      kategorie: effektTyp,
      geschaeftsmodell: '',
      zielmarkt: '',
      strategie: '',
      investment_typ: '',
      beschreibung: '',
      release_datum: releaseDatum,
      annahmen: '',
      // GEÄNDERTE BEISPIELWERTE
      start_menge: 1000,  // Geändert von 100 zu 1000
      start_preis: 50,    // Geändert von 1000 zu 50
      start_hk: 20,       // Geändert von 600 zu 20
      mengen_modell: 'realistisch',
      preis_modell: 'konstant',
      kosten_modell: 'lernkurve',
      zeitraum: 5,
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
      renderArtikelListByProjekt();
      
      // Alternativ: Direkt den neuen Artikel zum State hinzufügen
      const artikelId = 'artikel-db-' + saved.id;
      state.setArtikel(artikelId, {
        ...newArtikel,
        id: artikelId
      });
      
      // Force re-render der Tabelle
      const tbody = document.getElementById('projekt-artikel-list-tbody');
      if (tbody && window.renderArtikelListByProjekt) {
        window.renderArtikelListByProjekt();
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
// STATE
// ==========================================

window.expandedPackages = new Set();

// ==========================================
// DATEN LADEN & GRUPPIEREN
// ==========================================

async function loadArtikelHierarchy(projektId) {
  console.log('📦 Loading artikel hierarchy for projekt:', projektId);
  
  // Hole alle Artikel
  const { data: alleArtikel, error } = await window.supabase
    .from('ALBO_Artikel')  // ✅ KORREKT: ALBO_Artikel
    .select('*')
    .eq('project_id', projektId)  // ✅ KORREKT: project_id
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading artikel:', error);
    return [];
  }
  
  // Gruppiere in Hierarchie
  const hierarchy = [];
  const processedIds = new Set();
  
  alleArtikel.forEach(artikel => {
    // Package-Parents und Standalone-Artikel
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
  
  // Orphaned Children (Children ohne Parent) - sollte nicht vorkommen
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
  
  console.log('✅ Artikel hierarchy loaded:', hierarchy);
  return hierarchy;
}

// ==========================================
// RENDERING
// ==========================================

function renderArtikelHierarchy(hierarchy) {
  return hierarchy.map(item => {
    const { parent, children, hasChildren, isPackage } = item;
    const isExpanded = window.expandedPackages.has(parent.id);
    
    // Parent Row
    let html = renderArtikelRow(parent, {
      hasChildren: hasChildren,
      isExpanded: isExpanded,
      isParent: true
    });
    
    // Children Rows (wenn expanded)
    if (isExpanded && children.length > 0) {
      html += children.map((child, index) => {
        return renderArtikelRow(child, {
          isChild: true,
          isLastChild: index === children.length - 1
        });
      }).join('');
    }
    
    return html;
  }).join('');
}

// ==========================================
// ROW RENDERING
// ==========================================

function renderArtikelRow(artikel, options = {}) {
  const { hasChildren, isExpanded, isParent, isChild, isLastChild } = options;
  
  // Icon basierend auf Artikel-Typ
  const icon = artikel.artikel_mode === 'package-parent' ? '📦' : 
               artikel.artikel_mode === 'package-child' ? '📄' :
               artikel.artikel_mode === 'hybrid' ? '🔀' : '📦';
  
  // Expand/Collapse Button (nur für Parents mit Children)
  const expandButton = hasChildren ? `
    <button 
      onclick="togglePackageExpand('${artikel.id}')"
      style="
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
        margin-right: 8px;
      "
      title="${isExpanded ? 'Zuklappen' : 'Aufklappen'}"
    >
      ${isExpanded ? '▼' : '▶'}
    </button>
  ` : '<span style="width: 28px; display: inline-block;"></span>';
  
  // Einrückung für Children
  const indent = isChild ? 'padding-left: 48px;' : '';
  
  // Visual Tree Line
  const treeLine = isChild ? `
    <span style="
      position: absolute;
      left: 24px;
      top: 0;
      bottom: ${isLastChild ? '50%' : '0'};
      width: 2px;
      background: #d1d5db;
    "></span>
    <span style="
      position: absolute;
      left: 24px;
      top: 50%;
      width: 16px;
      height: 2px;
      background: #d1d5db;
    "></span>
  ` : '';
  
  return `
    <tr style="
      position: relative;
      ${isChild ? 'background: #f9fafb;' : ''}
    ">
      <td style="padding: 12px; ${indent}">
        ${treeLine}
        ${isParent ? expandButton : ''}
        <span style="
          display: inline-flex;
          align-items: center;
          gap: 8px;
        ">
          <span style="font-size: 20px;">${icon}</span>
          <span style="font-weight: ${isChild ? '400' : '600'};">
            ${artikel.name}
          </span>
          ${artikel.artikel_mode === 'package-parent' ? `
            <span style="
              background: #dbeafe;
              color: #1e40af;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
            ">
              PACKAGE
            </span>
          ` : ''}
          ${isChild && artikel.mix_percentage ? `
            <span style="
              background: #f3f4f6;
              color: #6b7280;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
            ">
              ${artikel.mix_percentage}% Mix
            </span>
          ` : ''}
        </span>
      </td>
      <td>${artikel.typ || '-'}</td>
      <td>${artikel.release_datum || '-'}</td>
      <td>${formatCurrency(artikel.start_preis || 0)}</td>
      <td>
        <span class="status-badge status-${artikel.status?.toLowerCase() || 'aktiv'}">
          ${artikel.status || 'AKTIV'}
        </span>
      </td>
      <td>
        <!-- Action buttons -->
        <button onclick="openArtikelDetails('${artikel.id}')">📊</button>
        <button onclick="editArtikel('${artikel.id}')">✏️</button>
        <button onclick="deleteArtikel('${artikel.id}')">🗑️</button>
      </td>
    </tr>
  `;
}

// ==========================================
// EXPAND/COLLAPSE
// ==========================================

window.togglePackageExpand = function(packageId) {
  if (window.expandedPackages.has(packageId)) {
    window.expandedPackages.delete(packageId);
  } else {
    window.expandedPackages.add(packageId);
  }
  
  // Re-render
  loadAndRenderArtikel();
};

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

async function loadAndRenderArtikel() {
  const projektId = window.state.currentProjekt.id;
  
  // Show loading
  document.getElementById('artikel-list').innerHTML = `
    <tr><td colspan="6" style="text-align: center; padding: 40px;">
      <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
      <div>Lade Artikel...</div>
    </td></tr>
  `;
  
  // Load hierarchy
  const hierarchy = await loadArtikelHierarchy(projektId);
  
  // Render
  const html = renderArtikelHierarchy(hierarchy);
  document.getElementById('artikel-list').innerHTML = html;
}

// ==========================================
// HELPER
// ==========================================

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(value);
}

// ==========================================
// EXPORTS
// ==========================================

export default {
  renderArtikelListByProjekt,
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
