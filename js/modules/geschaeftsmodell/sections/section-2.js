/**
 * Section 2: Marktgröße & Opportunity
 * UPDATED: Simple Calculator mit McKinsey Templates
 */

export function renderSection2(geschaeftsmodell) {
  return `
    <div class="form-section gm-section" data-section="2" id="section-2">
      <div class="section-header-small">
        <h4>2️⃣ Marktgröße & Opportunity</h4>
        <small style="color: var(--gray); display: block; margin-top: 4px;">
          💡 Ein Senior Controller fragt: "Ist der Markt groß genug, um unser Wachstumsziel zu erreichen?"
        </small>
      </div>

      <div class="form-group">
        <label>🌍 Total Addressable Market (TAM)</label>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="flex: 1;">
            <input 
              type="text" 
              id="gm-tam" 
              placeholder="z.B. 2.300.000.000"
              value="${geschaeftsmodell.tam || ''}"
              readonly
              style="background: var(--gray-50); cursor: pointer;"
              onclick="marketSizing.openTAMCalculator()"
            />
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              Gesamtmarkt in € - Klick für Template
            </small>
          </div>
          <button 
            type="button" 
            class="btn btn-secondary" 
            onclick="marketSizing.openTAMCalculator()"
            style="white-space: nowrap;"
            title="TAM berechnen"
          >
            📊 Details
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>🎯 Serviceable Addressable Market (SAM)</label>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="flex: 1;">
            <input 
              type="text" 
              id="gm-sam" 
              placeholder="z.B. 450.000.000"
              value="${geschaeftsmodell.sam || ''}"
              readonly
              style="background: var(--gray-50); cursor: pointer;"
              onclick="marketSizing.openSAMCalculator()"
            />
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              Realistisch erreichbarer Markt - Filter auf TAM
            </small>
          </div>
          <button 
            type="button" 
            class="btn btn-secondary" 
            onclick="marketSizing.openSAMCalculator()"
            style="white-space: nowrap;"
            title="SAM berechnen"
          >
            📊 Details
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>🚀 Serviceable Obtainable Market (SOM)</label>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="flex: 1;">
            <input 
              type="text" 
              id="gm-som" 
              placeholder="z.B. 12.000.000"
              value="${geschaeftsmodell.som || ''}"
              readonly
              style="background: var(--gray-50); cursor: pointer;"
              onclick="marketSizing.openSOMCalculator()"
            />
            <small style="color: var(--gray); display: block; margin-top: 4px;">
              Realistisch in 3 Jahren - Jahr-für-Jahr Planung
            </small>
          </div>
          <button 
            type="button" 
            class="btn btn-secondary" 
            onclick="marketSizing.openSOMCalculator()"
            style="white-space: nowrap;"
            title="SOM berechnen"
          >
            📊 Details
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>🔍 Markt-Validierung</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="market_validation" value="external_source" ${geschaeftsmodell.market_validation?.includes('external_source') ? 'checked' : ''}>
            <span>TAM durch externe Quellen validiert (Statista, Gartner, etc.)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="market_validation" value="own_research" ${geschaeftsmodell.market_validation?.includes('own_research') ? 'checked' : ''}>
            <span>Eigene Marktforschung durchgeführt</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="market_validation" value="expert_interviews" ${geschaeftsmodell.market_validation?.includes('expert_interviews') ? 'checked' : ''}>
            <span>Experteninterviews geführt</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" name="market_validation" value="competitor_research" ${geschaeftsmodell.market_validation?.includes('competitor_research') ? 'checked' : ''}>
            <span>Competitor-Umsätze recherchiert</span>
          </label>
        </div>
      </div>

      <!-- Section Completion -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
        <button type="button" class="btn btn-primary" onclick="geschaeftsmodellModule.completeSection(2)">
          Abschnitt 2 abschließen & KI-Analyse →
        </button>
      </div>

      <!-- Inline Badge -->
      <div id="section-2-badge"></div>
    </div>
  `;
}
