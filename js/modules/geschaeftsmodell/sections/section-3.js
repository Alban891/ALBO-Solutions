/**
 * Section 3: Zielkunden
 */

export function renderSection3(geschaeftsmodell) {
  return `
    <!-- ========================================== -->
    <!-- 3. ZIELKUNDEN -->
    <!-- ========================================== -->
    <div class="form-section gm-section" data-section="3" id="section-3">
      <div class="section-header-small">
        <h4>3️⃣ Zielkunden</h4>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 Klar definierte Zielgruppe = fokussierte GTM-Strategie
        </small>
      </div>

      <div class="form-group">
        <label>👥 Kundentyp *</label>
        <div style="display: flex; gap: 16px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="kundentyp" value="b2b" ${geschaeftsmodell.kundentyp?.includes('b2b') ? 'checked' : ''}>
            <span>B2B</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="kundentyp" value="b2c" ${geschaeftsmodell.kundentyp?.includes('b2c') ? 'checked' : ''}>
            <span>B2C</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="kundentyp" value="b2g" ${geschaeftsmodell.kundentyp?.includes('b2g') ? 'checked' : ''}>
            <span>B2G (Government)</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>📊 Unternehmensgröße (Zielkunden)</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="unternehmensgroesse" value="konzerne" ${geschaeftsmodell.unternehmensgroesse?.includes('konzerne') ? 'checked' : ''}>
            <span>Konzerne (>5000 MA)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="unternehmensgroesse" value="grossmittelstand" ${geschaeftsmodell.unternehmensgroesse?.includes('grossmittelstand') ? 'checked' : ''}>
            <span>Großer Mittelstand (500-5000 MA)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="unternehmensgroesse" value="mittelstand" ${geschaeftsmodell.unternehmensgroesse?.includes('mittelstand') ? 'checked' : ''}>
            <span>Mittelstand (50-500 MA)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="unternehmensgroesse" value="kmu" ${geschaeftsmodell.unternehmensgroesse?.includes('kmu') ? 'checked' : ''}>
            <span>KMU (<50 MA)</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>🏭 Branchen</label>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="branchen" value="automotive" ${geschaeftsmodell.branchen?.includes('automotive') ? 'checked' : ''}>
            <span>Automotive</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="branchen" value="maschinenbau" ${geschaeftsmodell.branchen?.includes('maschinenbau') ? 'checked' : ''}>
            <span>Maschinenbau</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="branchen" value="elektronik" ${geschaeftsmodell.branchen?.includes('elektronik') ? 'checked' : ''}>
            <span>Elektronik</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="branchen" value="pharma" ${geschaeftsmodell.branchen?.includes('pharma') ? 'checked' : ''}>
            <span>Pharma</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="branchen" value="lebensmittel" ${geschaeftsmodell.branchen?.includes('lebensmittel') ? 'checked' : ''}>
            <span>Lebensmittel</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="branchen" value="chemie" ${geschaeftsmodell.branchen?.includes('chemie') ? 'checked' : ''}>
            <span>Chemie</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="branchen" value="logistik" ${geschaeftsmodell.branchen?.includes('logistik') ? 'checked' : ''}>
            <span>Logistik</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="branchen" value="retail" ${geschaeftsmodell.branchen?.includes('retail') ? 'checked' : ''}>
            <span>Retail</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>🌍 Geografischer Fokus</label>
        <div style="display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="geografie" value="dach" ${geschaeftsmodell.geografie?.includes('dach') ? 'checked' : ''}>
            <span>DACH</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="geografie" value="europa" ${geschaeftsmodell.geografie?.includes('europa') ? 'checked' : ''}>
            <span>Europa</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="geografie" value="usa" ${geschaeftsmodell.geografie?.includes('usa') ? 'checked' : ''}>
            <span>USA</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="geografie" value="asien" ${geschaeftsmodell.geografie?.includes('asien') ? 'checked' : ''}>
            <span>Asien</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="geografie" value="global" ${geschaeftsmodell.geografie?.includes('global') ? 'checked' : ''}>
            <span>Global</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>💬 Typisches Kundenprofil (Beschreibung)</label>
        <textarea 
          id="gm-kundenprofil" 
          rows="3" 
          placeholder="z.B. 'Mittelständischer Automobilzulieferer, 200-800 Mitarbeiter, 30-80M€ Umsatz, eigene Fertigung, Qualitätsprobleme durch manuelle Prüfung...'"
        >${geschaeftsmodell.kundenprofil || ''}</textarea>
      </div>

      <div class="form-group">
        <label>🎯 Buying Center - Wer entscheidet?</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="buying_center" value="geschaeftsfuehrung" ${geschaeftsmodell.buying_center?.includes('geschaeftsfuehrung') ? 'checked' : ''}>
            <span>Geschäftsführung / CEO</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="buying_center" value="cfo" ${geschaeftsmodell.buying_center?.includes('cfo') ? 'checked' : ''}>
            <span>CFO / Finanzvorstand</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="buying_center" value="coo" ${geschaeftsmodell.buying_center?.includes('coo') ? 'checked' : ''}>
            <span>COO / Produktionsleiter</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="buying_center" value="cto" ${geschaeftsmodell.buying_center?.includes('cto') ? 'checked' : ''}>
            <span>CTO / IT-Leiter</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="buying_center" value="einkauf" ${geschaeftsmodell.buying_center?.includes('einkauf') ? 'checked' : ''}>
            <span>Einkauf / Procurement</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="buying_center" value="fachabteilung" ${geschaeftsmodell.buying_center?.includes('fachabteilung') ? 'checked' : ''}>
            <span>Fachabteilung (z.B. Qualitätssicherung)</span>
          </label>
        </div>
        <small style="color: var(--gray); display: block; margin-top: 8px;">
          💡 Tipp: Bei Investments >100k€ ist typischerweise GF/CFO-Ebene involviert
        </small>
      </div>

      <!-- Section Completion -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
        <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(3)">
          Abschnitt 3 abschließen & KI-Analyse →
        </button>
      </div>

      <!-- Inline Badge -->
      <div id="section-3-badge"></div>
    </div>
  `;
}