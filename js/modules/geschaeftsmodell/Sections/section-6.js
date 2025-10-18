/**
 * Section 6: Go-to-Market Strategie
 */

export function renderSection6(geschaeftsmodell) {
  return `
    <!-- ========================================== -->
    <!-- 6. GO-TO-MARKET STRATEGIE -->
    <!-- ========================================== -->
    <div class="form-section gm-section" data-section="6" id="section-6">
      <div class="section-header-small">
        <h4>6️⃣ Go-to-Market Strategie</h4>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 Das beste Produkt nützt nichts, wenn Sie es nicht verkaufen können.
        </small>
      </div>

      <div class="form-group">
        <label>🎯 Sales Motion</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="sales_motion" value="direct" ${geschaeftsmodell.sales_motion === 'direct' ? 'checked' : ''}>
            <span>Direct Sales (eigenes Sales Team)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="sales_motion" value="channel" ${geschaeftsmodell.sales_motion === 'channel' ? 'checked' : ''}>
            <span>Channel Sales (Reseller, Distributoren)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="sales_motion" value="hybrid" ${geschaeftsmodell.sales_motion === 'hybrid' ? 'checked' : ''}>
            <span>Hybrid (Direct + Channel)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="sales_motion" value="selfservice" ${geschaeftsmodell.sales_motion === 'selfservice' ? 'checked' : ''}>
            <span>Self-Service (Online-Verkauf)</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>📈 Sales Team Planung</label>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 8px;">
          <div>
            <label style="font-size: 13px; color: var(--gray);">Aktuell (FTE)</label>
            <input type="number" id="gm-sales-team-current" placeholder="z.B. 2" value="${geschaeftsmodell.sales_team_current || ''}" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 13px; color: var(--gray);">In 12 Monaten (FTE)</label>
            <input type="number" id="gm-sales-team-future" placeholder="z.B. 5" value="${geschaeftsmodell.sales_team_future || ''}" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 13px; color: var(--gray);">Quota pro Rep (k€/Jahr)</label>
            <input type="number" id="gm-quota-per-rep" placeholder="z.B. 1200" value="${geschaeftsmodell.quota_per_rep || ''}" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 13px; color: var(--gray);">OTE pro Rep (k€/Jahr)</label>
            <input type="number" id="gm-ote-per-rep" placeholder="z.B. 120" value="${geschaeftsmodell.ote_per_rep || ''}" style="width: 100%;">
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>📢 Lead Generation Channels</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="lead_gen_channels" value="inbound" ${geschaeftsmodell.lead_gen_channels?.includes('inbound') ? 'checked' : ''}>
            <span>Inbound Marketing (Content, SEO, Events)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="lead_gen_channels" value="outbound" ${geschaeftsmodell.lead_gen_channels?.includes('outbound') ? 'checked' : ''}>
            <span>Outbound (Ads, Cold Outreach)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="lead_gen_channels" value="partnerships" ${geschaeftsmodell.lead_gen_channels?.includes('partnerships') ? 'checked' : ''}>
            <span>Partnerships / Channel</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="lead_gen_channels" value="events" ${geschaeftsmodell.lead_gen_channels?.includes('events') ? 'checked' : ''}>
            <span>Messen / Events</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="lead_gen_channels" value="referral" ${geschaeftsmodell.lead_gen_channels?.includes('referral') ? 'checked' : ''}>
            <span>Referral / Word-of-Mouth</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>💰 Marketing & Sales Metriken</label>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 8px;">
          <div>
            <label style="font-size: 13px; color: var(--gray);">Marketing Budget (% of Revenue)</label>
            <input type="number" id="gm-marketing-budget-pct" placeholder="z.B. 25" value="${geschaeftsmodell.marketing_budget_pct || ''}" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 13px; color: var(--gray);">Cost per Lead (€)</label>
            <input type="number" id="gm-cost-per-lead" placeholder="z.B. 200" value="${geschaeftsmodell.cost_per_lead || ''}" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 13px; color: var(--gray);">Lead-to-Opportunity (%)</label>
            <input type="number" id="gm-lead-to-opp" placeholder="z.B. 15" value="${geschaeftsmodell.lead_to_opp || ''}" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 13px; color: var(--gray);">Opportunity-to-Close (%)</label>
            <input type="number" id="gm-opp-to-close" placeholder="z.B. 30" value="${geschaeftsmodell.opp_to_close || ''}" style="width: 100%;">
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>💎 Pricing Strategy</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="pricing_strategy" value="value_based" ${geschaeftsmodell.pricing_strategy === 'value_based' ? 'checked' : ''}>
            <span>Value-Based (basierend auf Kundennutzen)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="pricing_strategy" value="cost_plus" ${geschaeftsmodell.pricing_strategy === 'cost_plus' ? 'checked' : ''}>
            <span>Cost-Plus (Kosten + Marge)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="pricing_strategy" value="competition_based" ${geschaeftsmodell.pricing_strategy === 'competition_based' ? 'checked' : ''}>
            <span>Competition-Based (Wettbewerbs-orientiert)</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>🤝 Customer Success</label>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 8px;">
          <div>
            <label style="font-size: 13px; color: var(--gray);">Onboarding-Dauer (Wochen)</label>
            <input type="number" id="gm-onboarding-duration" placeholder="z.B. 4" value="${geschaeftsmodell.onboarding_duration || ''}" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 13px; color: var(--gray);">Support-Level</label>
            <select id="gm-support-level" style="width: 100%;">
              <option value="">Wählen...</option>
              <option value="white_glove" ${geschaeftsmodell.support_level === 'white_glove' ? 'selected' : ''}>White Glove</option>
              <option value="standard" ${geschaeftsmodell.support_level === 'standard' ? 'selected' : ''}>Standard</option>
              <option value="selfservice" ${geschaeftsmodell.support_level === 'selfservice' ? 'selected' : ''}>Self-Service</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>📈 Expansion Strategy</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="expansion_strategy" value="upsell" ${geschaeftsmodell.expansion_strategy?.includes('upsell') ? 'checked' : ''}>
            <span>Upsell (höhere Tier)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="expansion_strategy" value="crosssell" ${geschaeftsmodell.expansion_strategy?.includes('crosssell') ? 'checked' : ''}>
            <span>Cross-sell (weitere Produkte)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="expansion_strategy" value="addons" ${geschaeftsmodell.expansion_strategy?.includes('addons') ? 'checked' : ''}>
            <span>Add-ons / Modules</span>
          </label>
        </div>
      </div>

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
        <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(6)">
          Abschnitt 6 abschließen & KI-Analyse →
        </button>
      </div>

      <div id="section-6-badge"></div>
    </div>
  `;
}