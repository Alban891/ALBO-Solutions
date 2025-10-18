/**
 * Section 8: Kritische Annahmen & Risiken
 */

function renderAssumptions(assumptions) {
  if (!assumptions || assumptions.length === 0) {
    return `
      <div class="assumption-item" style="border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-bottom: 12px;">
        <div style="margin-bottom: 8px;">
          <label style="font-size: 13px; color: var(--gray);">Annahme</label>
          <input type="text" class="assumption-text" placeholder="z.B. Kunden zahlen 150k€" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px;">
          <div>
            <label style="font-size: 13px; color: var(--gray);">Status</label>
            <select class="assumption-status">
              <option value="">Wählen...</option>
              <option value="validated">✅ Validiert</option>
              <option value="partial">⚠️ Teilweise</option>
              <option value="assumption">❌ Annahme</option>
            </select>
          </div>
          <div>
            <label style="font-size: 13px; color: var(--gray);">Risiko</label>
            <select class="assumption-risk">
              <option value="">Wählen...</option>
              <option value="critical">Kritisch</option>
              <option value="high">Hoch</option>
              <option value="medium">Mittel</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom: 8px;">
          <label style="font-size: 13px; color: var(--gray);">Validierung</label>
          <textarea class="assumption-validation" rows="2" placeholder="Wie validiert?"></textarea>
        </div>
        <div style="display: flex; justify-content: flex-end;">
          <button type="button" class="btn-icon btn-danger" onclick="this.closest('.assumption-item').remove()">🗑️</button>
        </div>
      </div>
    `;
  }

  return assumptions.map(assumption => `
    <div class="assumption-item" style="border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-bottom: 12px;">
      <div style="margin-bottom: 8px;">
        <label style="font-size: 13px; color: var(--gray);">Annahme</label>
        <input type="text" class="assumption-text" value="${assumption.text || ''}" />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px;">
        <div>
          <label style="font-size: 13px; color: var(--gray);">Status</label>
          <select class="assumption-status">
            <option value="">Wählen...</option>
            <option value="validated" ${assumption.status === 'validated' ? 'selected' : ''}>✅ Validiert</option>
            <option value="partial" ${assumption.status === 'partial' ? 'selected' : ''}>⚠️ Teilweise</option>
            <option value="assumption" ${assumption.status === 'assumption' ? 'selected' : ''}>❌ Annahme</option>
          </select>
        </div>
        <div>
          <label style="font-size: 13px; color: var(--gray);">Risiko</label>
          <select class="assumption-risk">
            <option value="">Wählen...</option>
            <option value="critical" ${assumption.risk === 'critical' ? 'selected' : ''}>Kritisch</option>
            <option value="high" ${assumption.risk === 'high' ? 'selected' : ''}>Hoch</option>
            <option value="medium" ${assumption.risk === 'medium' ? 'selected' : ''}>Mittel</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-size: 13px; color: var(--gray);">Validierung</label>
        <textarea class="assumption-validation" rows="2">${assumption.validation || ''}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <button type="button" class="btn-icon btn-danger" onclick="this.closest('.assumption-item').remove()">🗑️</button>
      </div>
    </div>
  `).join('');
}

function renderRisks(risks) {
  if (!risks || risks.length === 0) {
    return `
      <div class="risk-item" style="border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-bottom: 12px;">
        <div style="margin-bottom: 8px;">
          <label style="font-size: 13px; color: var(--gray);">Risiko</label>
          <input type="text" class="risk-text" placeholder="z.B. Wettbewerber kopiert Lösung" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px;">
          <div>
            <label style="font-size: 13px; color: var(--gray);">Wahrscheinlichkeit</label>
            <select class="risk-likelihood">
              <option value="">Wählen...</option>
              <option value="low">Niedrig</option>
              <option value="medium">Mittel</option>
              <option value="high">Hoch</option>
            </select>
          </div>
          <div>
            <label style="font-size: 13px; color: var(--gray);">Impact</label>
            <select class="risk-impact">
              <option value="">Wählen...</option>
              <option value="low">Niedrig</option>
              <option value="medium">Mittel</option>
              <option value="high">Hoch</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom: 8px;">
          <label style="font-size: 13px; color: var(--gray);">Mitigation</label>
          <textarea class="risk-mitigation" rows="2" placeholder="Wie begegnen?"></textarea>
        </div>
        <div style="display: flex; justify-content: flex-end;">
          <button type="button" class="btn-icon btn-danger" onclick="this.closest('.risk-item').remove()">🗑️</button>
        </div>
      </div>
    `;
  }

  return risks.map(risk => `
    <div class="risk-item" style="border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-bottom: 12px;">
      <div style="margin-bottom: 8px;">
        <label style="font-size: 13px; color: var(--gray);">Risiko</label>
        <input type="text" class="risk-text" value="${risk.text || ''}" />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px;">
        <div>
          <label style="font-size: 13px; color: var(--gray);">Wahrscheinlichkeit</label>
          <select class="risk-likelihood">
            <option value="">Wählen...</option>
            <option value="low" ${risk.likelihood === 'low' ? 'selected' : ''}>Niedrig</option>
            <option value="medium" ${risk.likelihood === 'medium' ? 'selected' : ''}>Mittel</option>
            <option value="high" ${risk.likelihood === 'high' ? 'selected' : ''}>Hoch</option>
          </select>
        </div>
        <div>
          <label style="font-size: 13px; color: var(--gray);">Impact</label>
          <select class="risk-impact">
            <option value="">Wählen...</option>
            <option value="low" ${risk.impact === 'low' ? 'selected' : ''}>Niedrig</option>
            <option value="medium" ${risk.impact === 'medium' ? 'selected' : ''}>Mittel</option>
            <option value="high" ${risk.impact === 'high' ? 'selected' : ''}>Hoch</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-size: 13px; color: var(--gray);">Mitigation</label>
        <textarea class="risk-mitigation" rows="2">${risk.mitigation || ''}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <button type="button" class="btn-icon btn-danger" onclick="this.closest('.risk-item').remove()">🗑️</button>
      </div>
    </div>
  `).join('');
}

function renderSuccessFactors(factors) {
  if (!factors || factors.length === 0) {
    return `
      <div class="success-factor-item" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
        <span style="font-weight: 600; color: var(--primary);">1.</span>
        <input type="text" class="success-factor-input" placeholder="z.B. Pilot erfolgreich" style="flex: 1;" />
        <button type="button" class="btn-icon btn-danger" onclick="this.closest('.success-factor-item').remove()">🗑️</button>
      </div>
    `;
  }

  return factors.map((factor, index) => `
    <div class="success-factor-item" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
      <span style="font-weight: 600; color: var(--primary);">${index + 1}.</span>
      <input type="text" class="success-factor-input" value="${factor}" style="flex: 1;" />
      <button type="button" class="btn-icon btn-danger" onclick="this.closest('.success-factor-item').remove()">🗑️</button>
    </div>
  `).join('');
}

export function renderSection8(geschaeftsmodell) {
  return `
    <!-- ========================================== -->
    <!-- 8. KRITISCHE ANNAHMEN & RISIKEN -->
    <!-- ========================================== -->
    <div class="form-section gm-section" data-section="8" id="section-8">
      <div class="section-header-small">
        <h4>8️⃣ Kritische Annahmen & Risiken</h4>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 Jede Annahme ist ein Risiko, bis sie validiert ist.
        </small>
      </div>

      <div class="form-group">
        <label>📋 Kritische Annahmen (Die MÜSSEN stimmen!)</label>
        <div id="gm-assumptions-container">
          ${renderAssumptions(geschaeftsmodell.assumptions)}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="geschaeftsmodellModule.addAssumption()" style="margin-top: 8px;">
          ➕ Annahme hinzufügen
        </button>
        <small style="color: var(--gray); display: block; margin-top: 8px;">
          💡 Beispiele: "Kunden zahlen 150k€", "Sales Cycle 6 Monate", "Kunden kaufen Software von uns"
        </small>
      </div>

      <div class="form-group">
        <label>⚠️ Top 3-5 Risiken</label>
        <div id="gm-risks-container">
          ${renderRisks(geschaeftsmodell.risks)}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="geschaeftsmodellModule.addRisk()" style="margin-top: 8px;">
          ➕ Risiko hinzufügen
        </button>
      </div>

      <div class="form-group">
        <label>🎯 Kritische Erfolgs-Faktoren (Top 3 - was MUSS klappen?)</label>
        <div id="gm-success-factors-container">
          ${renderSuccessFactors(geschaeftsmodell.success_factors)}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="geschaeftsmodellModule.addSuccessFactor()" style="margin-top: 8px;">
          ➕ Erfolgs-Faktor hinzufügen
        </button>
      </div>

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
        <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(8)">
          Abschnitt 8 abschließen & KI-Analyse →
        </button>
      </div>

      <div id="section-8-badge"></div>
    </div>
  `;
}