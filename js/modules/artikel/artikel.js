/**
 * ALBO Solutions - Artikel Module (COMPLETE REWRITE)
 * Part 3: Entwicklungsmodelle, Ergebnis-Vorschau, Calculations, Save, Helper Functions
 * 
 * @version 4.0.0
 */

// ==========================================
// ENTWICKLUNGSMODELLE
// ==========================================

function renderEntwicklungsmodelle(artikel) {
  return `
    <div class="form-section" style="background: white; padding: 24px; border-radius: 12px; margin: 20px;">
      <h3>📈 Entwicklungsmodelle</h3>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
        <!-- Mengen-Modell -->
        <div>
          <label style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 8px; display: block;">
            📊 Mengen-Entwicklung
          </label>
          <div class="radio-group">
            <label>
              <input type="radio" name="mengen-modell" value="konstant">
              Konstant (0% Wachstum)
            </label><br>
            <label>
              <input type="radio" name="mengen-modell" value="konservativ" checked>
              Konservativ (+15% p.a.)
            </label><br>
            <label>
              <input type="radio" name="mengen-modell" value="realistisch">
              Realistisch (S-Kurve)
            </label><br>
            <label>
              <input type="radio" name="mengen-modell" value="optimistisch">
              Optimistisch (Hockey-Stick)
            </label><br>
            <label>
              <input type="radio" name="mengen-modell" value="manuell">
              Manuell eingeben
            </label>
          </div>
        </div>
        
        <!-- Preis-Modell -->
        <div>
          <label style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 8px; display: block;">
            💰 Preis-Entwicklung
          </label>
          <div class="radio-group">
            <label>
              <input type="radio" name="preis-modell" value="konstant" checked>
              Konstant (0% Änderung)
            </label><br>
            <label>
              <input type="radio" name="preis-modell" value="inflation">
              Inflation (+2% p.a.)
            </label><br>
            <label>
              <input type="radio" name="preis-modell" value="premium">
              Premium (+5% p.a.)
            </label><br>
            <label>
              <input type="radio" name="preis-modell" value="preisdruck">
              Preisdruck (-5% p.a.)
            </label><br>
            <label>
              <input type="radio" name="preis-modell" value="aggressiv">
              Aggressiv (-10% p.a.)
            </label>
          </div>
        </div>
        
        <!-- Kosten-Modell -->
        <div>
          <label style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 8px; display: block;">
            📉 Kosten-Entwicklung
          </label>
          <div class="radio-group">
            <label>
              <input type="radio" name="kosten-modell" value="konstant">
              Konstant (0% Änderung)
            </label><br>
            <label>
              <input type="radio" name="kosten-modell" value="lernkurve" checked>
              Lernkurve (-10% p.a.)
            </label><br>
            <label>
              <input type="radio" name="kosten-modell" value="moderat">
              Moderat (-5% p.a.)
            </label><br>
            <label>
              <input type="radio" name="kosten-modell" value="inflation">
              Inflation (+3% p.a.)
            </label><br>
            <label>
              <input type="radio" name="kosten-modell" value="skalen">
              Skaleneffekte (volumenbasiert)
            </label>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <button type="button" onclick="berechneModelle()" class="btn btn-primary" 
          style="padding: 14px 32px; font-size: 16px;">
          📊 Berechnen & Vorschau aktualisieren
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// ERGEBNIS-VORSCHAU
// ==========================================

function renderErgebnisVorschau(artikel, config) {
  const zeitraum = artikel.zeitraum || 5;
  const startYear = artikel.release_datum ? parseInt(artikel.release_datum.split('-')[0]) : new Date().getFullYear();
  
  let yearHeaders = '';
  for (let i = 1; i <= 7; i++) {
    const year = startYear + i - 1;
    const display = i <= zeitraum ? '' : 'display: none;';
    yearHeaders += `<th class="jahr-col jahr-${i}" style="${display}">${year}</th>`;
  }
  
  return `
    <div class="form-section" style="background: white; padding: 24px; border-radius: 12px; margin: 20px;">
      <h3>📊 Ergebnis-Vorschau</h3>
      
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px; font-weight: 600;">Kennzahl</th>
              ${yearHeaders}
            </tr>
          </thead>
          <tbody>
            <!-- Menge -->
            <tr>
              <td style="padding: 10px; font-weight: 600; background: #f8fafc;" id="label-menge">
                ${config.labels.menge}
              </td>
              ${generateInputRow('menge', zeitraum)}
            </tr>
            
            <!-- Preis -->
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; font-weight: 600;" id="label-preis">
                ${config.labels.preis}
              </td>
              ${generateInputRow('preis', zeitraum)}
            </tr>
            
            <!-- HK -->
            <tr>
              <td style="padding: 10px; font-weight: 600; background: #f8fafc;" id="label-hk">
                ${config.labels.hk}
              </td>
              ${generateInputRow('hk', zeitraum)}
            </tr>
            
            <!-- Umsatz -->
            <tr style="background: #fffbeb;">
              <td style="padding: 10px; font-weight: 600;">UMSATZ (T€)</td>
              ${generateCalculatedRow('umsatz', zeitraum)}
            </tr>
            
            <!-- Kosten -->
            <tr style="background: #fef2f2;">
              <td style="padding: 10px; font-weight: 600;">KOSTEN (T€)</td>
              ${generateCalculatedRow('kosten', zeitraum)}
            </tr>
            
            <!-- DB2 -->
            <tr style="background: #eff6ff;">
              <td style="padding: 10px; font-weight: 700;">DB2 (T€)</td>
              ${generateCalculatedRow('db2', zeitraum)}
            </tr>
            
            <!-- DB2 % -->
            <tr style="background: #eff6ff;">
              <td style="padding: 10px; font-weight: 700;">DB2-MARGE (%)</td>
              ${generateCalculatedRow('db2-prozent', zeitraum)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function generateInputRow(field, zeitraum) {
  let cells = '';
  for (let i = 1; i <= 7; i++) {
    const display = i <= zeitraum ? '' : 'display: none;';
    cells += `
      <td class="jahr-col jahr-${i}" style="padding: 10px; text-align: center; ${display}">
        <input type="text" id="${field}-jahr-${i}" 
          onchange="formatNumberInput(this)"
          style="width: 70px; padding: 4px; border: 1px solid #e5e7eb; border-radius: 3px; text-align: center;">
      </td>
    `;
  }
  return cells;
}

function generateCalculatedRow(field, zeitraum) {
  let cells = '';
  for (let i = 1; i <= 7; i++) {
    const display = i <= zeitraum ? '' : 'display: none;';
    cells += `
      <td class="jahr-col jahr-${i}" style="padding: 10px; text-align: center; font-weight: 600; ${display}">
        <span id="${field}-jahr-${i}">0</span>
      </td>
    `;
  }
  return cells;
}

// ==========================================
// LOAD DATA INTO FORM
// ==========================================

function loadArtikelIntoForm(artikel, config) {
  // Update info
  if (artikel.updatedAt) {
    const updateInfo = document.getElementById('artikel-update-info');
    if (updateInfo) {
      const dateStr = new Date(artikel.updatedAt).toLocaleString('de-DE');
      updateInfo.innerHTML = `✅ Zuletzt gespeichert: ${dateStr}`;
      updateInfo.style.display = 'block';
    }
  }

  // Basic Info (already in rendered HTML via value attributes)
  
  // Startwerte
  const startMengeInput = document.getElementById('start-menge');
  const startPreisInput = document.getElementById('start-preis');
  const startHKInput = document.getElementById('start-hk');
  
  if (startMengeInput && artikel.start_menge) {
    startMengeInput.value = helpers.formatThousands(artikel.start_menge);
    startMengeInput.style.color = '#111827';
  }
  if (startPreisInput && artikel.start_preis) {
    startPreisInput.value = helpers.formatDecimal(artikel.start_preis, 2);
    startPreisInput.style.color = '#111827';
  }
  if (startHKInput && artikel.start_hk) {
    startHKInput.value = helpers.formatDecimal(artikel.start_hk, 2);
    startHKInput.style.color = '#111827';
  }

  // Models
  if (artikel.mengen_modell) {
    const radio = document.querySelector(`input[name="mengen-modell"][value="${artikel.mengen_modell}"]`);
    if (radio) radio.checked = true;
  }
  if (artikel.preis_modell) {
    const radio = document.querySelector(`input[name="preis-modell"][value="${artikel.preis_modell}"]`);
    if (radio) radio.checked = true;
  }
  if (artikel.kosten_modell) {
    const radio = document.querySelector(`input[name="kosten-modell"][value="${artikel.kosten_modell}"]`);
    if (radio) radio.checked = true;
  }

  // Zeitraum
  const zeitraum = artikel.zeitraum || 5;
  document.querySelectorAll('.zeitraum-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = 'white';
    btn.style.color = '#374151';
    btn.style.border = '1px solid #e5e7eb';
  });
  
  const activeBtn = document.getElementById(`zeitraum-btn-${zeitraum}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.background = '#1e3a8a';
    activeBtn.style.color = 'white';
    activeBtn.style.border = '2px solid #1e3a8a';
  }

  // Load year data
  loadYearDataIntoTable(artikel);
}

function loadYearDataIntoTable(artikel) {
  const startYear = artikel.table_start_year || parseInt((artikel.release_datum || '2025-01').split('-')[0]);
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
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupDetailEventListeners(artikel) {
  // Type change
  const typSelect = document.getElementById('artikel-typ');
  if (typSelect) {
    typSelect.addEventListener('change', (e) => {
      const newType = e.target.value;
      artikel.typ = newType;
      renderArtikelDetailForm(artikel); // Re-render with new type
    });
  }
  
  // Model changes
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const modell = radio.name.replace('-modell', '');
      if (radio.value !== 'manuell') {
        berechneModelle();
      }
    });
  });
}

// ==========================================
// CALCULATIONS
// ==========================================

window.berechneModelle = function() {
  console.log('📊 Berechne Modelle...');
  
  const artikelId = window.cfoDashboard.currentArtikel;
  if (!artikelId) return;
  
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return;
  
  const config = TYPE_CONFIGS[artikel.typ || 'Hardware'];
  
  // Get values
  const startMenge = helpers.parseFormattedNumber(document.getElementById('start-menge')?.value || '0');
  const startPreis = helpers.parseFormattedNumber(document.getElementById('start-preis')?.value || '0');
  const startHK = helpers.parseFormattedNumber(document.getElementById('start-hk')?.value || '0');
  
  // Get models
  const mengenModell = document.querySelector('input[name="mengen-modell"]:checked')?.value || 'konservativ';
  const preisModell = document.querySelector('input[name="preis-modell"]:checked')?.value || 'konstant';
  const kostenModell = document.querySelector('input[name="kosten-modell"]:checked')?.value || 'lernkurve';
  
  const zeitraum = artikel.zeitraum || 5;
  const startYear = parseInt((artikel.release_datum || '2025-01').split('-')[0]);
  
  // Calculate for each year
  for (let i = 1; i <= zeitraum; i++) {
    const year = startYear + i - 1;
    let menge = startMenge;
    let preis = startPreis;
    let hk = startHK;
    
    // Apply models (if not year 1)
    if (i > 1) {
      // Mengen-Entwicklung
      if (mengenModell === 'konservativ') {
        menge = startMenge * Math.pow(1.15, i - 1);
      } else if (mengenModell === 'realistisch') {
        const multipliers = [1, 1.2, 1.6, 2.2, 2.6, 2.9, 3.0];
        menge = startMenge * (multipliers[i - 1] || 3.0);
      } else if (mengenModell === 'optimistisch') {
        const multipliers = [1, 1.1, 1.5, 2.5, 4.5, 7.5, 12.0];
        menge = startMenge * (multipliers[i - 1] || 12.0);
      }
      
      // Preis-Entwicklung
      if (preisModell === 'inflation') {
        preis = startPreis * Math.pow(1.02, i - 1);
      } else if (preisModell === 'preisdruck') {
        preis = startPreis * Math.pow(0.95, i - 1);
      }
      
      // Kosten-Entwicklung
      if (kostenModell === 'lernkurve') {
        hk = startHK * Math.pow(0.90, i - 1);
      } else if (kostenModell === 'inflation') {
        hk = startHK * Math.pow(1.03, i - 1);
      }
    }
    
    // Update inputs
    document.getElementById(`menge-jahr-${i}`).value = helpers.formatThousands(Math.round(menge));
    document.getElementById(`preis-jahr-${i}`).value = helpers.formatDecimal(preis);
    document.getElementById(`hk-jahr-${i}`).value = helpers.formatDecimal(hk);
    
    // Calculate revenue (type-specific)
    const revenue = config.calculate(menge, preis);
    const costs = menge * hk;
    const db2 = revenue - costs;
    const db2Percent = revenue > 0 ? (db2 / revenue * 100) : 0;
    
    // Update calculated fields
    document.getElementById(`umsatz-jahr-${i}`).textContent = helpers.formatRevenue(revenue);
    document.getElementById(`kosten-jahr-${i}`).textContent = helpers.formatRevenue(costs);
    document.getElementById(`db2-jahr-${i}`).textContent = helpers.formatRevenue(db2);
    document.getElementById(`db2-prozent-jahr-${i}`).textContent = helpers.formatPercentage(db2Percent);
    
    // Store in artikel for wirtschaftlichkeit
    if (!artikel.volumes) artikel.volumes = {};
    if (!artikel.prices) artikel.prices = {};
    artikel.volumes[year] = menge;
    artikel.prices[year] = preis;
  }
  
  artikel.hk = startHK;
  artikel.start_menge = startMenge;
  artikel.start_preis = startPreis;
  artikel.start_hk = startHK;
};

// ==========================================
// SAVE CHANGES
// ==========================================

window.saveArtikelChanges = async function() {
  const artikelId = window.cfoDashboard.currentArtikel;
  if (!artikelId) return;
  
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return;
  
  console.log('💾 Saving artikel:', artikelId);
  
  // Collect all data
  const formData = collectArtikelFormData();
  
  // Merge with existing artikel
  Object.assign(artikel, formData);
  
  // Update timestamp
  artikel.updatedAt = new Date().toISOString();
  
  // Save to state
  state.setArtikel(artikelId, artikel);
  state.saveState();
  
  // Save to Supabase
  if (api.updateArticle) {
    try {
      await api.updateArticle(artikelId, artikel);
      console.log('✅ Saved to Supabase');
    } catch (err) {
      console.error('❌ Supabase save failed:', err);
    }
  }
  
  // Show success
  const updateInfo = document.getElementById('artikel-update-info');
  if (updateInfo) {
    const dateStr = new Date(artikel.updatedAt).toLocaleString('de-DE');
    updateInfo.innerHTML = `✅ Gespeichert: ${dateStr}`;
    updateInfo.style.display = 'block';
  }
};

function collectArtikelFormData() {
  const data = {};
  
  // Basic info
  data.name = helpers.getInputValue('artikel-name');
  data.typ = helpers.getInputValue('artikel-typ') || 'Hardware';
  data.kategorie = helpers.getInputValue('kategorie');
  data.geschaeftsmodell = helpers.getInputValue('geschaeftsmodell');
  data.beschreibung = helpers.getInputValue('artikel-beschreibung');
  data.release_datum = helpers.getInputValue('release-datum');
  
  // Start values
  data.start_menge = helpers.parseFormattedNumber(helpers.getInputValue('start-menge'));
  data.start_preis = helpers.parseFormattedNumber(helpers.getInputValue('start-preis'));
  data.start_hk = helpers.parseFormattedNumber(helpers.getInputValue('start-hk'));
  
  // Models
  data.mengen_modell = document.querySelector('input[name="mengen-modell"]:checked')?.value;
  data.preis_modell = document.querySelector('input[name="preis-modell"]:checked')?.value;
  data.kosten_modell = document.querySelector('input[name="kosten-modell"]:checked')?.value;
  
  // Zeitraum
  const zeitraumBtn = document.querySelector('.zeitraum-btn.active');
  if (zeitraumBtn) {
    const btnText = zeitraumBtn.textContent;
    const match = btnText.match(/(\d+)/);
    data.zeitraum = match ? parseInt(match[1]) : 5;
  }
  
  // Year data
  const releaseDatum = data.release_datum || new Date().toISOString().substring(0, 7);
  const startYear = parseInt(releaseDatum.split('-')[0]);
  
  data.volumes = {};
  data.prices = {};
  
  for (let i = 1; i <= 7; i++) {
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
  
  // HK
  const hkInput = document.getElementById('start-hk');
  data.hk = helpers.parseFormattedNumber(hkInput?.value) || 0;
  data.table_start_year = startYear;
  
  return data;
}

// ==========================================
// REVENUE CALCULATIONS (for Wirtschaftlichkeit)
// ==========================================

function calculateArtikelRevenue(artikelId) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return 0;

  let totalRevenue = 0;
  const config = TYPE_CONFIGS[artikel.typ || 'Hardware'];

  Object.keys(artikel.volumes || {}).forEach(year => {
    const volume = artikel.volumes[year] || 0;
    const price = artikel.prices[year] || 0;
    const revenue = config.calculate(volume, price);
    totalRevenue += revenue / 1000; // Convert to k€
  });

  return totalRevenue;
}

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
// HELPER FUNCTIONS  
// ==========================================

window.setzeZeitraum = function(jahre) {
  console.log('📅 Setting Zeitraum to:', jahre);
  
  document.querySelectorAll('.zeitraum-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = 'white';
    btn.style.color = '#374151';
    btn.style.border = '1px solid #e5e7eb';
  });
  
  const targetBtn = document.getElementById(`zeitraum-btn-${jahre}`);
  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.style.background = '#1e3a8a';
    targetBtn.style.color = 'white';
    targetBtn.style.border = '2px solid #1e3a8a';
  }
  
  // Update table columns
  for (let i = 1; i <= 7; i++) {
    const cols = document.querySelectorAll(`.jahr-col.jahr-${i}`);
    cols.forEach(col => {
      col.style.display = i <= jahre ? '' : 'none';
    });
  }
  
  const artikelId = window.cfoDashboard.currentArtikel;
  if (artikelId) {
    const artikel = state.getArtikel(artikelId);
    if (artikel) {
      artikel.zeitraum = jahre;
    }
  }
  
  berechneModelle();
};

window.updateErsteZeile = function() {
  // Update first year with start values
  const menge = helpers.parseFormattedNumber(document.getElementById('start-menge')?.value || '0');
  const preis = helpers.parseFormattedNumber(document.getElementById('start-preis')?.value || '0');
  const hk = helpers.parseFormattedNumber(document.getElementById('start-hk')?.value || '0');
  
  const mengeInput = document.getElementById('menge-jahr-1');
  const preisInput = document.getElementById('preis-jahr-1');
  const hkInput = document.getElementById('hk-jahr-1');
  
  if (mengeInput) mengeInput.value = helpers.formatThousands(Math.round(menge));
  if (preisInput) preisInput.value = helpers.formatDecimal(preis);
  if (hkInput) hkInput.value = helpers.formatDecimal(hk);
};

window.handleInputFocus = function(input) {
  if (input.value.startsWith('z.B.')) {
    input.value = '';
  }
  input.style.color = '#111827';
};

window.handleInputBlur = function(input, type) {
  if (!input.value) {
    input.value = input.placeholder;
    input.style.color = '#6b7280';
  } else {
    if (type === 'menge') {
      input.value = helpers.formatThousands(helpers.parseFormattedNumber(input.value));
    } else {
      input.value = helpers.formatDecimal(helpers.parseFormattedNumber(input.value));
    }
  }
};

window.formatNumberInput = function(input) {
  const value = helpers.parseFormattedNumber(input.value);
  input.value = helpers.formatThousands(value);
};

window.formatDecimalInput = function(input) {
  const value = helpers.parseFormattedNumber(input.value);
  input.value = helpers.formatDecimal(value);
};

window.backToArtikelList = function() {
  document.getElementById('artikel-detail-view').style.display = 'none';
  document.getElementById('artikel-overview').style.display = 'block';
  state.artikelViewMode = 'list';
  state.currentArtikel = null;
  state.saveState();
};

window.backToProjektDetail = function() {
  document.getElementById('artikel-detail-view').style.display = 'none';
  document.getElementById('artikel-overview').style.display = 'none';
  document.getElementById('projekt-detail-view').style.display = 'block';
  state.artikelViewMode = null;
  state.currentArtikel = null;
  state.saveState();
};

// Additional functions for delete, duplicate, etc. would go here...

console.log('✅ Artikel Module v4.0.0 loaded - Complete integration achieved');

// ==========================================
// REVENUE CALCULATIONS (für Wirtschaftlichkeit)
// ==========================================

function calculateArtikelRevenue(artikelId) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return 0;

  let totalRevenue = 0;
  const config = getTypeConfig(artikel.typ || 'Hardware');

  Object.keys(artikel.volumes || {}).forEach(year => {
    const volume = artikel.volumes[year] || 0;
    const price = artikel.prices[year] || 0;
    const revenue = config.calculate(volume, price);
    totalRevenue += revenue / 1000; // Convert to k€
  });

  return totalRevenue;
}

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

// FORTSETZUNG AB ZEILE 691
// ==========================================
// HELPER FUNCTIONS (Fortsetzung)
// ==========================================

window.updateZeithorizont = function() {
  // Placeholder for compatibility
  console.log('updateZeithorizont called');
};

window.updateTabellenSpalten = function() {
  // Placeholder for compatibility  
  console.log('updateTabellenSpalten called');
};

window.handleInputFocus = function(input) {
  if (input.value.startsWith('z.B.')) {
    input.value = '';
  }
  input.style.color = '#111827';
};

window.handleInputBlur = function(input, type) {
  if (!input.value) {
    input.value = input.placeholder;
    input.style.color = '#6b7280';
  } else {
    if (type === 'menge') {
      input.value = helpers.formatThousands(helpers.parseFormattedNumber(input.value));
    } else {
      input.value = helpers.formatDecimal(helpers.parseFormattedNumber(input.value));
    }
  }
};

window.formatNumberInput = function(input) {
  const value = helpers.parseFormattedNumber(input.value);
  input.value = helpers.formatThousands(value);
};

window.formatDecimalInput = function(input) {
  const value = helpers.parseFormattedNumber(input.value);
  input.value = helpers.formatDecimal(value);
};

window.backToArtikelList = function() {
  document.getElementById('artikel-detail-view').style.display = 'none';
  document.getElementById('artikel-overview').style.display = 'block';
  state.artikelViewMode = 'list';
  state.currentArtikel = null;
  state.saveState();
};

window.backToProjektDetail = function() {
  document.getElementById('artikel-detail-view').style.display = 'none';
  document.getElementById('artikel-overview').style.display = 'none';
  document.getElementById('projekt-detail-view').style.display = 'block';
  state.artikelViewMode = null;
  state.currentArtikel = null;
  state.saveState();
};

// ==========================================
// BULK ACTIONS
// ==========================================

window.updateArtikelBulkActions = function() {
  const checkboxes = document.querySelectorAll('.artikel-checkbox:checked');
  const bulkActionsDiv = document.getElementById('artikel-bulk-actions');
  const selectedCountSpan = document.getElementById('artikel-selected-count');
  
  if (checkboxes.length > 0) {
    if (bulkActionsDiv) bulkActionsDiv.style.display = 'block';
    if (selectedCountSpan) selectedCountSpan.textContent = checkboxes.length;
  } else {
    if (bulkActionsDiv) bulkActionsDiv.style.display = 'none';
  }
  
  console.log(`${checkboxes.length} artikel selected`);
};

window.selectAllArtikel = function() {
  const checkboxes = document.querySelectorAll('.artikel-checkbox');
  const allChecked = document.querySelectorAll('.artikel-checkbox:checked').length === checkboxes.length;
  
  checkboxes.forEach(cb => {
    cb.checked = !allChecked;
  });
  
  updateArtikelBulkActions();
};

window.bulkDeleteArtikel = async function() {
  const checkboxes = document.querySelectorAll('.artikel-checkbox:checked');
  const artikelIds = Array.from(checkboxes).map(cb => cb.value);
  
  if (artikelIds.length === 0) return;
  
  if (!confirm(`Wirklich ${artikelIds.length} Artikel löschen?`)) return;
  
  for (const artikelId of artikelIds) {
    await api.deleteArticle(artikelId);
    state.deleteArtikel(artikelId);
  }
  
  renderArtikelListByProjekt();
  updateArtikelBulkActions();
};

window.bulkUpdateArtikelStatus = function(status) {
  const checkboxes = document.querySelectorAll('.artikel-checkbox:checked');
  const artikelIds = Array.from(checkboxes).map(cb => cb.value);
  
  if (artikelIds.length === 0) return;
  
  artikelIds.forEach(artikelId => {
    const artikel = state.getArtikel(artikelId);
    if (artikel) {
      artikel.status = status;
      artikel.updatedAt = new Date().toISOString();
      state.setArtikel(artikelId, artikel);
      api.updateArticle(artikelId, artikel);
    }
  });
  
  renderArtikelListByProjekt();
  updateArtikelBulkActions();
};

// ==========================================
// DELETE ARTIKEL
// ==========================================

window.deleteArtikel = async function(artikelId) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return;
  
  if (!confirm(`Artikel "${artikel.name}" wirklich löschen?`)) return;
  
  try {
    // Delete from Supabase
    if (api.deleteArticle) {
      const success = await api.deleteArticle(artikelId);
      if (!success) {
        console.error('Failed to delete from Supabase');
        return;
      }
    }
    
    // Delete from local state
    state.deleteArtikel(artikelId);
    state.saveState();
    
    // Update UI
    renderArtikelListByProjekt();
    
    // Show success message
    if (window.cfoDashboard?.aiController) {
      window.cfoDashboard.aiController.addAIMessage({
        level: 'success',
        title: '✅ Artikel gelöscht',
        text: `"${artikel.name}" wurde erfolgreich gelöscht.`,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  } catch (err) {
    console.error('Delete failed:', err);
    alert('Fehler beim Löschen: ' + err.message);
  }
};

// ==========================================
// DUPLICATE ARTIKEL
// ==========================================

window.duplicateArtikel = async function(artikelId) {
  const original = state.getArtikel(artikelId);
  if (!original) {
    console.error('Original artikel not found');
    return;
  }
  
  try {
    // Create duplicate
    const duplicate = {
      ...original,
      id: `artikel-db-${helpers.generateId()}`,
      name: original.name + ' (Kopie)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Remove parent package info for duplicate
    delete duplicate.parent_package_id;
    delete duplicate.artikel_mode;
    
    // Save to Supabase
    if (api.saveArticle) {
      const saved = await api.saveArticle(duplicate);
      if (saved && saved.id) {
        duplicate.id = saved.id;
      }
    }
    
    // Save to local state
    state.setArtikel(duplicate.id, duplicate);
    state.saveState();
    
    // Update UI
    renderArtikelListByProjekt();
    
    // Show success
    if (window.cfoDashboard?.aiController) {
      window.cfoDashboard.aiController.addAIMessage({
        level: 'success',
        title: '✅ Artikel dupliziert',
        text: `"${duplicate.name}" wurde erfolgreich erstellt.`,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  } catch (err) {
    console.error('Duplicate failed:', err);
    alert('Fehler beim Duplizieren: ' + err.message);
  }
};

// ==========================================
// CREATE ARTIKEL
// ==========================================

window.openArtikelCreationModal = function() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) {
    console.error('No projekt selected');
    return;
  }
  
  // Use imported function if available
  if (openArtikelCreationModalCore) {
    openArtikelCreationModalCore(projektId);
  } else {
    // Fallback: Create simple modal
    createSimpleArtikelModal(projektId);
  }
};

function createSimpleArtikelModal(projektId) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
  
  modal.innerHTML = `
    <div style="background:white;padding:30px;border-radius:12px;width:500px;max-width:90%;">
      <h2 style="margin:0 0 20px;">📦 Neuen Artikel erstellen</h2>
      
      <div style="margin-bottom:20px;">
        <label>Name *</label>
        <input type="text" id="new-artikel-name" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:4px;" />
      </div>
      
      <div style="margin-bottom:20px;">
        <label>Typ</label>
        <select id="new-artikel-typ" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:4px;">
          <option value="Hardware">🔧 Hardware</option>
          <option value="Software">💿 Software</option>
          <option value="Software-SaaS">☁️ Software-SaaS</option>
          <option value="Consulting">👔 Consulting</option>
          <option value="Service">🔧 Service</option>
        </select>
      </div>
      
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button onclick="this.closest('.modal').remove()" style="padding:10px 20px;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;">
          Abbrechen
        </button>
        <button onclick="createNewArtikel('${projektId}')" style="padding:10px 20px;border:none;border-radius:6px;background:#3b82f6;color:white;cursor:pointer;">
          Erstellen
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus name input
  setTimeout(() => {
    document.getElementById('new-artikel-name')?.focus();
  }, 100);
}

window.createNewArtikel = async function(projektId) {
  const nameInput = document.getElementById('new-artikel-name');
  const typInput = document.getElementById('new-artikel-typ');
  
  if (!nameInput?.value) {
    alert('Bitte Namen eingeben');
    return;
  }
  
  const newArtikel = {
    id: `artikel-db-${helpers.generateId()}`,
    name: nameInput.value,
    typ: typInput?.value || 'Hardware',
    projekt_id: projektId,
    status: 'aktiv',
    kategorie: '',
    beschreibung: '',
    geschaeftsmodell: 'Einmalverkauf',
    release_datum: new Date().toISOString().substring(0, 7) + '-01',
    start_menge: 100,
    start_preis: 1000,
    start_hk: 500,
    zeitraum: 5,
    mengen_modell: 'konservativ',
    preis_modell: 'konstant',
    kosten_modell: 'lernkurve',
    volumes: {},
    prices: {},
    hk: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    // Save to Supabase
    if (api.saveArticle) {
      const saved = await api.saveArticle(newArtikel);
      if (saved && saved.id) {
        newArtikel.id = saved.id;
      }
    }
    
    // Save to local state
    state.setArtikel(newArtikel.id, newArtikel);
    state.saveState();
    
    // Close modal
    document.querySelector('.modal')?.remove();
    
    // Open detail view
    openArtikelDetail(newArtikel.id);
    
  } catch (err) {
    console.error('Create failed:', err);
    alert('Fehler beim Erstellen: ' + err.message);
  }
};

// ==========================================
// PACKAGE FUNCTIONS
// ==========================================

window.toggleArtikelAsPackage = function(artikelId) {
  const artikel = state.getArtikel(artikelId);
  if (!artikel) return;
  
  if (artikel.artikel_mode === 'package-parent') {
    // Remove package mode
    delete artikel.artikel_mode;
    
    // Unlink all children
    const children = state.getArtikelByProjekt(artikel.projekt_id)
      .filter(a => a.parent_package_id === artikelId.replace('artikel-db-', ''));
    
    children.forEach(child => {
      delete child.parent_package_id;
      state.setArtikel(child.id, child);
      api.updateArticle(child.id, child);
    });
  } else {
    // Set as package
    artikel.artikel_mode = 'package-parent';
  }
  
  artikel.updatedAt = new Date().toISOString();
  state.setArtikel(artikelId, artikel);
  api.updateArticle(artikelId, artikel);
  
  renderArtikelListByProjekt();
};

window.addArtikelToPackage = function(childId, parentId) {
  const child = state.getArtikel(childId);
  const parent = state.getArtikel(parentId);
  
  if (!child || !parent) return;
  
  // Set parent as package if not already
  if (parent.artikel_mode !== 'package-parent') {
    parent.artikel_mode = 'package-parent';
    parent.updatedAt = new Date().toISOString();
    state.setArtikel(parentId, parent);
    api.updateArticle(parentId, parent);
  }
  
  // Link child to parent
  child.parent_package_id = parentId.replace('artikel-db-', '');
  child.updatedAt = new Date().toISOString();
  state.setArtikel(childId, child);
  api.updateArticle(childId, child);
  
  renderArtikelListByProjekt();
};

// ==========================================
// NAVIGATION STATE
// ==========================================

window.updateArtikelNavigation = function() {
  // Update breadcrumb
  const artikelNameEl = document.getElementById('breadcrumb-artikel-name');
  if (artikelNameEl) {
    const artikel = state.getArtikel(state.currentArtikel);
    if (artikel) {
      artikelNameEl.textContent = artikel.name;
    }
  }
  
  const projektNameEl = document.getElementById('breadcrumb-projekt-name');
  if (projektNameEl) {
    const projekt = state.getProjekt(state.currentProjekt);
    if (projekt) {
      projektNameEl.textContent = projekt.name;
    }
  }
};

window.saveNavigationState = function() {
  // Save current navigation state
  const navState = {
    view: 'artikel-detail',
    projektId: state.currentProjekt,
    artikelId: state.currentArtikel,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('albo-nav-state', JSON.stringify(navState));
};

// ==========================================
// EXPORTS
// ==========================================

window.renderArtikelListByProjekt = renderArtikelListByProjekt;

console.log('✅ Artikel Module v5.0.0 loaded - Complete integration achieved');

export default {
  renderArtikelListByProjekt,
  calculateArtikelRevenue,
  calculateArtikelDB2,
  openArtikelDetail,
  deleteArtikel,
  duplicateArtikel,
  openArtikelCreationModal,
  togglePackageExpand,
  toggleArtikelAsPackage,
  addArtikelToPackage
};
