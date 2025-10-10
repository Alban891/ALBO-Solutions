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

  // Start values - MIT BEISPIELWERTEN ALS FALLBACK
  const startMenge = artikel.start_menge || 1000;  // Fallback: 1000
  const startPreis = artikel.start_preis || 50;    // Fallback: 50
  const startHK = artikel.start_hk || 20;          // Fallback: 20
  
  helpers.setInputValue('start-menge', helpers.formatThousands(startMenge));
  helpers.setInputValue('start-preis', helpers.formatDecimal(startPreis, 2));
  helpers.setInputValue('start-hk', helpers.formatDecimal(startHK, 2));

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
  
  // Richtigen Button finden und aktivieren
  const buttons = document.querySelectorAll('.zeitraum-btn');
  let targetBtn;
  
  if (zeitraum === 3) targetBtn = buttons[0];
  else if (zeitraum === 5) targetBtn = buttons[1];
  else if (zeitraum === 7) targetBtn = buttons[2];
  
  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.style.background = '#3b82f6';
    targetBtn.style.color = 'white';
    targetBtn.style.border = '2px solid #3b82f6';
    targetBtn.style.fontWeight = '600';
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

  // Start values - mit Fallback auf 0
  data.start_menge = helpers.parseFormattedNumber(helpers.getInputValue('start-menge')) || 0;
  data.start_preis = helpers.parseFormattedNumber(helpers.getInputValue('start-preis')) || 0;
  data.start_hk = helpers.parseFormattedNumber(helpers.getInputValue('start-hk')) || 0;
  data.mengen_modell = helpers.getInputValue('mengen-modell');
  data.preis_modell = helpers.getInputValue('preis-modell');
  data.kosten_modell = helpers.getInputValue('kosten-modell');

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
    // Alle Buttons zurücksetzen
    document.querySelectorAll('.zeitraum-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'white';
        btn.style.color = '#374151';
        btn.style.border = '1px solid #e5e7eb';
        btn.style.fontWeight = '500';
    });
    
    // Den richtigen Button finden basierend auf dem Jahre-Parameter
    const buttons = document.querySelectorAll('.zeitraum-btn');
    let targetBtn;
    
    // Button nach Position auswählen (sicherer als nach Text)
    if (jahre === 3) targetBtn = buttons[0];
    else if (jahre === 5) targetBtn = buttons[1];
    else if (jahre === 7) targetBtn = buttons[2];
    
    if (targetBtn) {
        targetBtn.classList.add('active');
        targetBtn.style.background = '#3b82f6';
        targetBtn.style.color = 'white';
        targetBtn.style.border = '2px solid #3b82f6';
        targetBtn.style.fontWeight = '600';
    }
    
    // Store the selected zeitraum
    const artikelId = window.cfoDashboard.currentArtikel;
    if (artikelId) {
        const artikel = state.getArtikel(artikelId);
        if (artikel) {
            artikel.zeitraum = jahre;
            state.saveState();  // WICHTIG: State speichern
        }
    }
    
    // Optional: Jahr-Tabelle mit neuer Anzahl Jahre neu rendern
    // updateJahresTabelle(jahre);
}

/**
 * Berechne Modelle basierend auf Startwerten und gewählten Modellen
 */
window.berechneModelle = function() {
    console.log('📊 Berechne Modelle...');
    
    const startMenge = helpers.parseFormattedNumber(helpers.getInputValue('start-menge')) || 0;
    const startPreis = helpers.parseFormattedNumber(helpers.getInputValue('start-preis')) || 0;
    const startHK = helpers.parseFormattedNumber(helpers.getInputValue('start-hk')) || 0;
    
    const mengenModell = document.querySelector('input[name="mengen-modell"]:checked')?.value || 'realistisch';
    const preisModell = document.querySelector('input[name="preis-modell"]:checked')?.value || 'konstant';
    const kostenModell = document.querySelector('input[name="kosten-modell"]:checked')?.value || 'lernkurve';
    
    console.log('Startwerte:', { startMenge, startPreis, startHK });
    console.log('Modelle:', { mengenModell, preisModell, kostenModell });
    
    // TODO: Implementiere die Berechnungslogik für die verschiedenen Modelle
    // Aktualisiere die Ergebnis-Tabelle basierend auf den Modellen
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
    
    // Reset Startwerte
    helpers.setInputValue('start-menge', '20');
    helpers.setInputValue('start-preis', '10,00');
    helpers.setInputValue('start-hk', '5,00');
    
    // Berechne neu
    window.berechneModelle();
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
/**
 * Setze Zeithorizont und aktualisiere Tabelle
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
        targetBtn.style.background = '#3b82f6';
        targetBtn.style.color = 'white';
        targetBtn.style.border = '2px solid #3b82f6';
        targetBtn.style.fontWeight = '600';
    }
    
    // Zeitraum speichern
    const artikelId = window.cfoDashboard.currentArtikel;
    if (artikelId) {
        const artikel = state.getArtikel(artikelId);
        if (artikel) {
            artikel.zeitraum = jahre;
            state.setArtikel(artikelId, artikel);
        }
    }
    
    // Tabellen-Spalten anpassen
    updateTabellenSpalten(jahre);
}

/**
 * Tabellen-Spalten basierend auf Zeitraum anzeigen/verstecken
 */
window.updateTabellenSpalten = function(jahre) {
    const zeitraum = jahre || getCurrentZeitraum();
    
    // Alle Jahr-Spalten durchgehen
    for (let i = 1; i <= 7; i++) {
        const cols = document.querySelectorAll(`.jahr-col.jahr-${i}`);
        cols.forEach(col => {
            col.style.display = i <= zeitraum ? '' : 'none';
        });
    }
    
    // Jahr-Header mit tatsächlichen Jahren aktualisieren
    const releaseDatum = document.getElementById('release-datum')?.value || '2025-01';
    const startYear = parseInt(releaseDatum.split('-')[0]);
    
    for (let i = 1; i <= zeitraum; i++) {
        const header = document.querySelector(`.jahr-header-${i}`);
        if (header) {
            header.textContent = startYear + i - 1;
        }
    }
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
window.updateErsteZeile = function() {
    const startMenge = helpers.parseFormattedNumber(helpers.getInputValue('start-menge')) || 0;
    const startPreis = helpers.parseFormattedNumber(helpers.getInputValue('start-preis')) || 0;
    const startHK = helpers.parseFormattedNumber(helpers.getInputValue('start-hk')) || 0;
    
    // Erste Spalte mit Startwerten füllen
    const mengeInput = document.getElementById('menge-jahr-1');
    const preisInput = document.getElementById('preis-jahr-1');
    const hkInput = document.getElementById('hk-jahr-1');
    
    if (mengeInput) mengeInput.value = helpers.formatThousands(startMenge);
    if (preisInput) preisInput.value = helpers.formatDecimal(startPreis);
    if (hkInput) hkInput.value = helpers.formatDecimal(startHK);
}

/**
 * Berechne Modelle basierend auf gewählten Einstellungen
 */
window.berechneModelle = function() {
    console.log('📊 Berechne Modelle...');
    
    const startMenge = helpers.parseFormattedNumber(helpers.getInputValue('start-menge')) || 1000;
    const startPreis = helpers.parseFormattedNumber(helpers.getInputValue('start-preis')) || 50;
    const startHK = helpers.parseFormattedNumber(helpers.getInputValue('start-hk')) || 20;
    
    const mengenModell = document.querySelector('input[name="mengen-modell"]:checked')?.value || 'realistisch';
    const preisModell = document.querySelector('input[name="preis-modell"]:checked')?.value || 'konstant';
    const kostenModell = document.querySelector('input[name="kosten-modell"]:checked')?.value || 'lernkurve';
    
    const zeitraum = getCurrentZeitraum();
    
    // Erste Zeile setzen
    updateErsteZeile();
    
    // Berechne für alle Jahre
    for (let jahr = 2; jahr <= zeitraum; jahr++) {
        // Mengenberechnung
        let menge = startMenge;
        switch(mengenModell) {
            case 'konservativ':
                menge = startMenge * Math.pow(1.15, jahr - 1);
                break;
            case 'realistisch': // S-Kurve
                const t = (jahr - 1) / (zeitraum - 1);
                menge = startMenge * (1 + 4 / (1 + Math.exp(-10 * (t - 0.5))));
                break;
            case 'optimistisch': // Hockey-Stick
                if (jahr <= 2) {
                    menge = startMenge * (1 + 0.2 * (jahr - 1));
                } else {
                    menge = startMenge * Math.pow(2, jahr - 2);
                }
                break;
            case 'manuell':
                // Behalte vorhandene Werte
                continue;
        }
        
        // Preisberechnung
        let preis = startPreis;
        switch(preisModell) {
            case 'konstant':
                preis = startPreis;
                break;
            case 'inflation':
                preis = startPreis * Math.pow(1.02, jahr - 1);
                break;
            case 'premium':
                preis = startPreis * Math.pow(1.05, jahr - 1);
                break;
            case 'skimming':
                preis = startPreis * Math.pow(0.97, jahr - 1);
                break;
            case 'manuell':
                // Behalte vorhandene Werte
                continue;
        }
        
        // Kostenberechnung
        let hk = startHK;
        switch(kostenModell) {
            case 'konstant':
                hk = startHK;
                break;
            case 'lernkurve':
                // -5% bei Verdopplung der kumulierten Menge
                const kumulierteMenge = startMenge * ((Math.pow(1.5, jahr) - 1) / 0.5);
                const verdopplungen = Math.log2(kumulierteMenge / startMenge);
                hk = startHK * Math.pow(0.95, verdopplungen);
                break;
            case 'inflation':
                hk = startHK * Math.pow(1.03, jahr - 1);
                break;
            case 'skaleneffekte':
                // Stufenweise Reduktion
                if (menge > 10000) hk = startHK * 0.7;
                else if (menge > 5000) hk = startHK * 0.8;
                else if (menge > 2000) hk = startHK * 0.9;
                else hk = startHK;
                break;
            case 'manuell':
                // Behalte vorhandene Werte
                continue;
        }
        
        // Werte in Tabelle eintragen
        const mengeInput = document.getElementById(`menge-jahr-${jahr}`);
        const preisInput = document.getElementById(`preis-jahr-${jahr}`);
        const hkInput = document.getElementById(`hk-jahr-${jahr}`);
        
        if (mengeInput) mengeInput.value = helpers.formatThousands(Math.round(menge));
        if (preisInput) preisInput.value = helpers.formatDecimal(preis);
        if (hkInput) hkInput.value = helpers.formatDecimal(hk);
    }
    
    console.log('✅ Modelle berechnet');
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
    helpers.setInputValue('start-menge', '1.000');
    helpers.setInputValue('start-preis', '50,00');
    helpers.setInputValue('start-hk', '20,00');
    
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
    
    let value = input.value.replace(/\./g, '').replace(',', '.');
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
        input.value = helpers.formatDecimal(numValue, decimals);
    }
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
                    <h2 style="margin: 0; color: #3b82f6; font-size: 18px;">➕ Neuen Artikel anlegen - Quick Create</h2>
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
                            style="padding: 10px 20px; background: #3b82f6; color: white; 
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
          projektId: projektId,  // Für state.js Validierung
          projekt_id: projektId,  // Für API
          typ: '',  // Bleibt leer, User wählt später
          kategorie: effektTyp,  // Hier speichern wir Neu-Produkt/Cross-Selling/etc.
          geschaeftsmodell: '',
          zielmarkt: '',
          strategie: '',
          investment_typ: '',
          beschreibung: '',
          release_datum: releaseDatum,
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
// EXPORTS
// ==========================================

export default {
  renderArtikelListByProjekt,
  calculateArtikelRevenue,
  calculateArtikelDB2
};
