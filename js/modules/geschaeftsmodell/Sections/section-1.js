/**
 * Section 1: Kundenproblem & Kontext
 */

export function renderSection1(geschaeftsmodell) {
  return `
    <!-- ========================================== -->
    <!-- 1. KUNDENPROBLEM & KONTEXT -->
    <!-- ========================================== -->
    <div class="form-section gm-section" data-section="1" id="section-1">
      <div class="section-header-small">
        <h4>1️⃣ Kundenproblem & Kontext</h4>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 Warum ist das wichtig? Ein CFO fragt: "Welches Problem lösen wir wirklich?"
        </small>
      </div>

      <div class="form-group">
        <label>🎯 Kundenproblem *</label>
        <textarea 
          id="gm-kundenproblem" 
          rows="4" 
          placeholder="Beschreiben Sie das konkrete Problem des Kunden. z.B. 'Fertigungsunternehmen verlieren 400k€/Jahr durch manuelle Qualitätskontrolle...'"
          required
        >${geschaeftsmodell.kundenproblem || ''}</textarea>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 Tipp: Je konkreter, desto besser. Quantifizieren Sie wenn möglich.
        </small>
      </div>

      <div class="form-group">
        <label>💰 Problemkosten (quantifiziert)</label>
        <textarea 
          id="gm-problemkosten" 
          rows="3" 
          placeholder="z.B. '400k€ Verlust durch Ausschuss, 200k€ durch Nacharbeit, 150k€ durch Verzögerungen = 750k€/Jahr'"
        >${geschaeftsmodell.problemkosten || ''}</textarea>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 Wichtig für ROI-Berechnung: Was kostet das Problem den Kunden aktuell?
        </small>
      </div>

      <div class="form-group">
        <label>⚡ Urgency - Wie dringend ist das Problem?</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="urgency" value="critical" ${geschaeftsmodell.urgency === 'critical' ? 'checked' : ''}>
            <span><strong>🔴 Kritisch</strong> - Muss sofort gelöst werden (drohende Verluste, Compliance)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="urgency" value="high" ${geschaeftsmodell.urgency === 'high' ? 'checked' : ''}>
            <span><strong>🟠 Hoch</strong> - Dringend, aber nicht kritisch (nächste 3-6 Monate)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="urgency" value="medium" ${geschaeftsmodell.urgency === 'medium' ? 'checked' : ''}>
            <span><strong>🟡 Mittel</strong> - Wichtig, aber nicht dringend (6-12 Monate)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="urgency" value="low" ${geschaeftsmodell.urgency === 'low' ? 'checked' : ''}>
            <span><strong>🟢 Niedrig</strong> - Nice to have (>12 Monate)</span>
          </label>
        </div>
        <small style="color: var(--gray); display: block; margin-top: 8px;">
          💡 Urgency beeinflusst Sales Cycle: Critical = kurzer Cycle, Low = langer Cycle
        </small>
      </div>

      <!-- Section Completion -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
        <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(1)">
          Abschnitt 1 abschließen & KI-Analyse →
        </button>
      </div>

      <!-- Inline Badge -->
      <div id="section-1-badge"></div>
    </div>
  `;
}