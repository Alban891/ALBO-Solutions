/**
 * Section 4: Wettbewerb & Positionierung
 */

import * as helpers from '../../../helpers.js';

function renderCompetitors(competitors) {
  if (!competitors || competitors.length === 0) {
    return `
      <div class="competitor-item" style="border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-bottom: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px;">
          <div>
            <label style="font-size: 13px; color: var(--gray);">Name</label>
            <input type="text" class="competitor-name" placeholder="z.B. KUKA" />
          </div>
          <div>
            <label style="font-size: 13px; color: var(--gray);">Market Share (%)</label>
            <input type="number" class="competitor-share" placeholder="15" />
          </div>
        </div>
        <div style="margin-bottom: 8px;">
          <label style="font-size: 13px; color: var(--gray);">Stärken</label>
          <input type="text" class="competitor-strengths" placeholder="z.B. Marke, Service-Netz" />
        </div>
        <div style="margin-bottom: 8px;">
          <label style="font-size: 13px; color: var(--gray);">Schwächen</label>
          <input type="text" class="competitor-weaknesses" placeholder="z.B. Teuer, langsam" />
        </div>
        <div style="display: flex; justify-content: flex-end;">
          <button type="button" class="btn-icon btn-danger" onclick="this.closest('.competitor-item').remove()">🗑️</button>
        </div>
      </div>
    `;
  }

  return competitors.map(comp => `
    <div class="competitor-item" style="border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-bottom: 12px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px;">
        <div>
          <label style="font-size: 13px; color: var(--gray);">Name</label>
          <input type="text" class="competitor-name" value="${helpers.escapeHtml(comp.name || '')}" />
        </div>
        <div>
          <label style="font-size: 13px; color: var(--gray);">Market Share (%)</label>
          <input type="number" class="competitor-share" value="${comp.share || ''}" />
        </div>
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-size: 13px; color: var(--gray);">Stärken</label>
        <input type="text" class="competitor-strengths" value="${helpers.escapeHtml(comp.strengths || '')}" />
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-size: 13px; color: var(--gray);">Schwächen</label>
        <input type="text" class="competitor-weaknesses" value="${helpers.escapeHtml(comp.weaknesses || '')}" />
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <button type="button" class="btn-icon btn-danger" onclick="this.closest('.competitor-item').remove()">🗑️</button>
      </div>
    </div>
  `).join('');
}

export function renderSection4(geschaeftsmodell) {
  return `
    <!-- ========================================== -->
    <!-- 4. WETTBEWERB & POSITIONIERUNG -->
    <!-- ========================================== -->
    <div class="form-section gm-section" data-section="4" id="section-4">
      <div class="section-header-small">
        <h4>4️⃣ Wettbewerb & Positionierung</h4>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 "Wenn Sie den Wettbewerb nicht kennen, kennen Sie Ihre Gewinnchancen nicht."
        </small>
      </div>

      <div class="form-group">
        <label>🏆 Top 3-5 Direkte Wettbewerber</label>
        <div id="gm-competitors-container">
          ${renderCompetitors(geschaeftsmodell.competitors)}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="geschaeftsmodellModule.addCompetitor()" style="margin-top: 8px;">
          ➕ Wettbewerber hinzufügen
        </button>
      </div>

      <div class="form-group">
        <label>🔄 Was macht der Kunde HEUTE?</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="status_quo" value="manual" ${geschaeftsmodell.status_quo?.includes('manual') ? 'checked' : ''}>
            <span>Manuelle Prozesse</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="status_quo" value="inhouse" ${geschaeftsmodell.status_quo?.includes('inhouse') ? 'checked' : ''}>
            <span>In-house Lösung</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="status_quo" value="other_tech" ${geschaeftsmodell.status_quo?.includes('other_tech') ? 'checked' : ''}>
            <span>Andere Technologie</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>🎯 Unsere Positionierung</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="positioning" value="premium" ${geschaeftsmodell.positioning === 'premium' ? 'checked' : ''}>
            <span>Premium (teurer, beste Qualität)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="positioning" value="midmarket" ${geschaeftsmodell.positioning === 'midmarket' ? 'checked' : ''}>
            <span>Mid-Market (Best Value)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="positioning" value="budget" ${geschaeftsmodell.positioning === 'budget' ? 'checked' : ''}>
            <span>Budget (günstig)</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>🛡️ Competitive Moat</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="competitive_moat" value="patents" ${geschaeftsmodell.competitive_moat?.includes('patents') ? 'checked' : ''}>
            <span>Patents / IP</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="competitive_moat" value="network_effects" ${geschaeftsmodell.competitive_moat?.includes('network_effects') ? 'checked' : ''}>
            <span>Network Effects</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="competitive_moat" value="proprietary_data" ${geschaeftsmodell.competitive_moat?.includes('proprietary_data') ? 'checked' : ''}>
            <span>Proprietary Data / AI</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="competitive_moat" value="brand" ${geschaeftsmodell.competitive_moat?.includes('brand') ? 'checked' : ''}>
            <span>Brand / Reputation</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>📝 Beschreibung des Competitive Moat</label>
        <textarea 
          id="gm-moat-description" 
          rows="3" 
          placeholder="z.B. 'Patent läuft 15 Jahre. Daten von 500+ Kunden ermöglichen besseres ML-Modell...'"
        >${geschaeftsmodell.moat_description || ''}</textarea>
      </div>

      <!-- Section Completion -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
        <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(4)">
          Abschnitt 4 abschließen & KI-Analyse →
        </button>
      </div>

      <!-- Inline Badge -->
      <div id="section-4-badge"></div>
    </div>
  `;
}