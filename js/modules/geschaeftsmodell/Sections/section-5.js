/**
 * Section 5: Geschäftsmodell & Revenue
 */

function renderCustomStreams(customStreams) {
  if (!customStreams || customStreams.length === 0) {
    return `
      <div class="custom-stream" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
        <input type="text" class="custom-stream-input" placeholder="z.B. Professional Services" style="flex: 1;" />
        <button type="button" class="btn-icon btn-danger" onclick="this.closest('.custom-stream').remove()">🗑️</button>
      </div>
    `;
  }

  return customStreams.map(stream => `
    <div class="custom-stream" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
      <input type="text" class="custom-stream-input" value="${stream}" style="flex: 1;" />
      <button type="button" class="btn-icon btn-danger" onclick="this.closest('.custom-stream').remove()">🗑️</button>
    </div>
  `).join('');
}

export function renderSection5(geschaeftsmodell) {
  return `
    <!-- ========================================== -->
    <!-- 5. GESCHÄFTSMODELL & REVENUE -->
    <!-- ========================================== -->
    <div class="form-section gm-section" data-section="5" id="section-5">
      <div class="section-header-small">
        <h4>5️⃣ Geschäftsmodell & Revenue</h4>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 Wie verdienen wir Geld? Was ist unser Pricing Model?
        </small>
      </div>

      <div class="form-group">
        <label>💰 Revenue Streams *</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="revenue_streams" value="lizenz" ${geschaeftsmodell.revenue_streams?.includes('lizenz') ? 'checked' : ''}>
            <span>Lizenzgebühr (einmalig oder jährlich)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="revenue_streams" value="subscription" ${geschaeftsmodell.revenue_streams?.includes('subscription') ? 'checked' : ''}>
            <span>Subscription / SaaS (monatlich/jährlich wiederkehrend)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="revenue_streams" value="hardware" ${geschaeftsmodell.revenue_streams?.includes('hardware') ? 'checked' : ''}>
            <span>Hardware-Verkauf (einmalig)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="revenue_streams" value="wartung" ${geschaeftsmodell.revenue_streams?.includes('wartung') ? 'checked' : ''}>
            <span>Wartung & Support (jährlich wiederkehrend)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="revenue_streams" value="training" ${geschaeftsmodell.revenue_streams?.includes('training') ? 'checked' : ''}>
            <span>Training & Consulting</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="revenue_streams" value="transaction" ${geschaeftsmodell.revenue_streams?.includes('transaction') ? 'checked' : ''}>
            <span>Transaction-basiert (pro Nutzung)</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>➕ Weitere Revenue Streams (Custom)</label>
        <div id="custom-streams-container">
          ${renderCustomStreams(geschaeftsmodell.custom_streams)}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="geschaeftsmodellModule.addCustomStream()" style="margin-top: 8px;">
          ➕ Revenue Stream hinzufügen
        </button>
      </div>

      <div class="form-group">
        <label>📝 Revenue Model Erklärung</label>
        <textarea 
          id="gm-revenue-erklaerung" 
          rows="3" 
          placeholder="z.B. 'Hauptumsatz durch Hardware-Verkauf (150k€), dann jährliche Wartung (20k€) und optionale Trainings (10k€)...'"
        >${geschaeftsmodell.revenue_erklaerung || ''}</textarea>
      </div>

      <div class="form-group">
        <label>💵 Key Metriken</label>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 8px;">
          <div>
            <label style="font-size: 13px; color: var(--gray); display: block; margin-bottom: 4px;">
              Average Deal Size (€)
            </label>
            <input 
              type="number" 
              id="gm-deal-size" 
              placeholder="z.B. 150000"
              value="${geschaeftsmodell.deal_size || ''}"
              style="width: 100%;"
            />
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              Durchschnittlicher Auftragswert pro Kunde
            </small>
          </div>

          <div>
            <label style="font-size: 13px; color: var(--gray); display: block; margin-bottom: 4px;">
              Sales Cycle (Monate)
            </label>
            <input 
              type="number" 
              id="gm-sales-cycle" 
              placeholder="z.B. 6"
              value="${geschaeftsmodell.sales_cycle || ''}"
              style="width: 100%;"
            />
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              Von erstem Kontakt bis Vertragsabschluss
            </small>
          </div>

          <div>
            <label style="font-size: 13px; color: var(--gray); display: block; margin-bottom: 4px;">
              Vertragslaufzeit (Monate)
            </label>
            <input 
              type="number" 
              id="gm-contract-length" 
              placeholder="z.B. 12"
              value="${geschaeftsmodell.contract_length || ''}"
              style="width: 100%;"
            />
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              Typische Vertragsdauer
            </small>
          </div>

          <div>
            <label style="font-size: 13px; color: var(--gray); display: block; margin-bottom: 4px;">
              Churn Rate (% p.a.)
            </label>
            <input 
              type="number" 
              id="gm-churn-rate" 
              placeholder="z.B. 8"
              value="${geschaeftsmodell.churn_rate || ''}"
              style="width: 100%;"
            />
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              Wie viele Kunden kündigen jährlich?
            </small>
          </div>
        </div>
      </div>

      <!-- Section Completion -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
        <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(5)">
          Abschnitt 5 abschließen & KI-Analyse →
        </button>
      </div>

      <!-- Inline Badge -->
      <div id="section-5-badge"></div>
    </div>
  `;
}

/**
 * Add custom revenue stream
 */
export function addCustomStream() {
  const container = document.getElementById('custom-streams-container');
  if (!container) return;

  const html = `
    <div class="custom-stream" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
      <input type="text" class="custom-stream-input" placeholder="z.B. Professional Services" style="flex: 1;" />
      <button type="button" class="btn-icon btn-danger" onclick="this.closest('.custom-stream').remove()">🗑️</button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', html);
}