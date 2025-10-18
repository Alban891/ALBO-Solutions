/**
 * Assumptions Component
 * Handles assumptions, risks, and success factors
 */

/**
 * Add new assumption
 */
export function addAssumption() {
  const container = document.getElementById('gm-assumptions-container');
  if (!container) return;

  const html = `
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
  
  container.insertAdjacentHTML('beforeend', html);
}

/**
 * Add new risk
 */
export function addRisk() {
  const container = document.getElementById('gm-risks-container');
  if (!container) return;

  const html = `
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
  
  container.insertAdjacentHTML('beforeend', html);
}

/**
 * Add success factor
 */
export function addSuccessFactor() {
  const container = document.getElementById('gm-success-factors-container');
  if (!container) return;

  const count = container.querySelectorAll('.success-factor-item').length + 1;
  const html = `
    <div class="success-factor-item" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
      <span style="font-weight: 600; color: var(--primary);">${count}.</span>
      <input type="text" class="success-factor-input" placeholder="z.B. Pilot erfolgreich" style="flex: 1;" />
      <button type="button" class="btn-icon btn-danger" onclick="this.closest('.success-factor-item').remove()">🗑️</button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', html);
}