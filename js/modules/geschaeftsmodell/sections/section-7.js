/**
 * Section 7: Unsere Lösung
 */

function renderFeatures(features) {
  if (!features || features.length === 0) {
    return `
      <div class="feature-item" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
        <span style="font-weight: 600; color: var(--primary);">1.</span>
        <input type="text" class="feature-input" placeholder="z.B. KI-basierte Fehlerkennung" style="flex: 1;" />
        <button type="button" class="btn-icon btn-danger" onclick="this.closest('.feature-item').remove()">🗑️</button>
      </div>
    `;
  }

  return features.map((feature, index) => `
    <div class="feature-item" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
      <span style="font-weight: 600; color: var(--primary);">${index + 1}.</span>
      <input type="text" class="feature-input" value="${feature}" style="flex: 1;" />
      <button type="button" class="btn-icon btn-danger" onclick="this.closest('.feature-item').remove()">🗑️</button>
    </div>
  `).join('');
}

export function renderSection7(geschaeftsmodell) {
  return `
    <!-- ========================================== -->
    <!-- 7. UNSERE LÖSUNG -->
    <!-- ========================================== -->
    <div class="form-section gm-section" data-section="7" id="section-7">
      <div class="section-header-small">
        <h4>7️⃣ Unsere Lösung</h4>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 Was bauen wir und warum ist es besser?
        </small>
      </div>

      <div class="form-group">
        <label>📦 Produktkategorie</label>
        <input 
          type="text" 
          id="gm-produktkategorie" 
          placeholder="z.B. 'KI-basierte Qualitätssicherung', 'Roboter-Automatisierung', 'SaaS-Platform'"
          value="${geschaeftsmodell.produktkategorie || ''}"
        />
      </div>

      <div class="form-group">
        <label>🎯 Value Proposition *</label>
        <textarea 
          id="gm-value-proposition" 
          rows="4" 
          placeholder="Was ist unser Hauptnutzen? z.B. 'Wir reduzieren Ausschuss um 80% und sparen dem Kunden 400k€/Jahr durch KI-basierte Echtzeit-Fehlerkennung...'"
          required
        >${geschaeftsmodell.value_proposition || ''}</textarea>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 Fokus auf Kundennutzen, nicht auf Features!
        </small>
      </div>

      <div class="form-group">
        <label>⭐ Top Features / Capabilities</label>
        <div id="features-container">
          ${renderFeatures(geschaeftsmodell.features)}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="geschaeftsmodellModule.addFeature()" style="margin-top: 8px;">
          ➕ Feature hinzufügen
        </button>
        <small style="color: var(--gray); display: block; margin-top: 8px;">
          💡 Weniger ist mehr: Fokussieren Sie auf 3-7 Kern-Features
        </small>
      </div>

      <div class="form-group">
        <label>🛡️ Wettbewerbsvorteil</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="wettbewerbsvorteil" value="technologie" ${geschaeftsmodell.wettbewerbsvorteil?.includes('technologie') ? 'checked' : ''}>
            <span>Überlegene Technologie</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="wettbewerbsvorteil" value="preis" ${geschaeftsmodell.wettbewerbsvorteil?.includes('preis') ? 'checked' : ''}>
            <span>Besseres Preis-Leistungs-Verhältnis</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="wettbewerbsvorteil" value="speed" ${geschaeftsmodell.wettbewerbsvorteil?.includes('speed') ? 'checked' : ''}>
            <span>Schnellere Implementierung</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="wettbewerbsvorteil" value="ux" ${geschaeftsmodell.wettbewerbsvorteil?.includes('ux') ? 'checked' : ''}>
            <span>Bessere User Experience</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="wettbewerbsvorteil" value="service" ${geschaeftsmodell.wettbewerbsvorteil?.includes('service') ? 'checked' : ''}>
            <span>Überlegener Service</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="wettbewerbsvorteil" value="integration" ${geschaeftsmodell.wettbewerbsvorteil?.includes('integration') ? 'checked' : ''}>
            <span>Bessere Integration in bestehende Systeme</span>
          </label>
        </div>
      </div>

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
        <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(7)">
          Abschnitt 7 abschließen & KI-Analyse →
        </button>
      </div>

      <div id="section-7-badge"></div>
    </div>
  `;
}

/**
 * Add feature
 */
export function addFeature() {
  const container = document.getElementById('features-container');
  if (!container) return;

  const count = container.querySelectorAll('.feature-item').length + 1;
  const html = `
    <div class="feature-item" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
      <span style="font-weight: 600; color: var(--primary);">${count}.</span>
      <input type="text" class="feature-input" placeholder="z.B. KI-basierte Fehlerkennung" style="flex: 1;" />
      <button type="button" class="btn-icon btn-danger" onclick="this.closest('.feature-item').remove()">🗑️</button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', html);
}