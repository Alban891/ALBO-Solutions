/**
 * CFO Dashboard - Kosten Module
 * Project cost management with intelligent cost blocks,
 * KI-based recommendations, and timeline calculations
 */

import CONFIG from '../config.js';
import { state } from '../state.js';
import * as helpers from '../helpers.js';

// ==========================================
// COST BLOCK MANAGEMENT
// ==========================================

/**
 * Add new cost block to project
 */
window.addKostenBlock = function() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) {
    alert('Bitte zuerst ein Projekt auswählen!');
    return;
  }

  console.log('➕ Adding cost block to projekt:', projektId);

  const container = document.getElementById('kosten-bloecke-container');
  if (!container) return;

  // Get next block ID
  const existingBlocks = container.querySelectorAll('.kosten-block');
  const blockId = 'block-' + Date.now();

  const blockHTML = `
    <div class="kosten-block" id="${blockId}" data-block-id="${blockId}">
      <div class="kosten-block-header">
        <div class="kosten-block-title">
          <span class="kosten-icon">💰</span>
          <input type="text" class="kosten-block-name" 
                 placeholder="Kostenblock-Name (z.B. Personal, Material)" 
                 value="Kostenblock ${existingBlocks.length + 1}">
        </div>
        <div class="kosten-block-actions">
          <button class="btn-icon" onclick="duplicateKostenBlock('${blockId}')" title="Duplizieren">
            📋
          </button>
          <button class="btn-icon btn-danger" onclick="removeKostenBlock('${blockId}')" title="Löschen">
            🗑️
          </button>
        </div>
      </div>

      <div class="kosten-block-body">
        <div class="form-row">
          <div class="form-group">
            <label>Gesamtkosten (€)</label>
            <input type="text" class="kosten-betrag" 
                   placeholder="0" 
                   onblur="formatKostenInput(this)">
          </div>

          <div class="form-group">
            <label>Verteilungsart</label>
            <select class="kosten-verteilung" onchange="updateKostenVerteilung('${blockId}')">
              <option value="gleichmaessig">Gleichmäßig</option>
              <option value="front-loaded">Front-Loaded (70% Anfang)</option>
              <option value="back-loaded">Back-Loaded (70% Ende)</option>
              <option value="manuell">Manuell</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Vorlaufzeit (Monate vor Release)</label>
            <input type="number" class="kosten-vorlauf" 
                   value="12" min="0" max="60" 
                   onchange="berechneProjektkosten()">
          </div>

          <div class="form-group">
            <label>Nachlaufzeit (Monate nach Release)</label>
            <input type="number" class="kosten-nachlauf" 
                   value="24" min="0" max="120" 
                   onchange="berechneProjektkosten()">
          </div>
        </div>

        <div class="kosten-timeline" id="timeline-${blockId}">
          <!-- Timeline wird dynamisch generiert -->
        </div>

        <div class="kosten-details" style="display: none;">
          <label>Monatliche Verteilung (für manuelle Anpassung)</label>
          <div class="kosten-monate-grid" id="monate-${blockId}">
            <!-- Wird bei Bedarf generiert -->
          </div>
        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', blockHTML);

  // Initialize timeline
  updateKostenVerteilung(blockId);

  // AI Feedback
  if (window.cfoDashboard.aiController) {
    window.cfoDashboard.aiController.addAIMessage({
      level: 'info',
      title: '➕ Kostenblock hinzugefügt',
      text: 'Neuer Kostenblock erstellt. Bitte Details eingeben.',
      timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
    });
  }
};

/**
 * Remove cost block
 */
window.removeKostenBlock = function(blockId) {
  const confirmed = confirm('Kostenblock wirklich löschen?');
  if (!confirmed) return;

  const block = document.getElementById(blockId);
  if (block) {
    block.remove();
    berechneProjektkosten();

    console.log('🗑️ Cost block removed:', blockId);
  }
};

/**
 * Duplicate cost block
 */
window.duplicateKostenBlock = function(blockId) {
  const sourceBlock = document.getElementById(blockId);
  if (!sourceBlock) return;

  const newBlockId = 'block-' + Date.now();
  const clonedBlock = sourceBlock.cloneNode(true);

  // Update IDs
  clonedBlock.id = newBlockId;
  clonedBlock.dataset.blockId = newBlockId;

  // Update onclick handlers
  const nameInput = clonedBlock.querySelector('.kosten-block-name');
  if (nameInput) {
    nameInput.value = nameInput.value + ' (Kopie)';
  }

  // Update timeline ID
  const timeline = clonedBlock.querySelector('.kosten-timeline');
  if (timeline) {
    timeline.id = 'timeline-' + newBlockId;
  }

  // Update month grid ID
  const monateGrid = clonedBlock.querySelector('.kosten-monate-grid');
  if (monateGrid) {
    monateGrid.id = 'monate-' + newBlockId;
  }

  // Insert after source
  sourceBlock.insertAdjacentElement('afterend', clonedBlock);

  console.log('📋 Cost block duplicated:', blockId, '→', newBlockId);
};

// ==========================================
// COST DISTRIBUTION
// ==========================================

/**
 * Update cost distribution based on type
 */
window.updateKostenVerteilung = function(blockId) {
  const block = document.getElementById(blockId);
  if (!block) return;

  const betrag = helpers.parseFormattedNumber(
    block.querySelector('.kosten-betrag')?.value || '0'
  );
  const verteilung = block.querySelector('.kosten-verteilung')?.value || 'gleichmaessig';
  const vorlauf = parseInt(block.querySelector('.kosten-vorlauf')?.value || '12');
  const nachlauf = parseInt(block.querySelector('.kosten-nachlauf')?.value || '24');

  const totalMonths = vorlauf + nachlauf;
  const monthlyDistribution = calculateDistribution(betrag, verteilung, vorlauf, nachlauf);

  // Render timeline
  renderKostenTimeline(blockId, monthlyDistribution, vorlauf, nachlauf);

  // Recalculate total
  berechneProjektkosten();
};

/**
 * Calculate distribution based on type
 */
function calculateDistribution(totalBetrag, type, vorlauf, nachlauf) {
  const totalMonths = vorlauf + nachlauf;
  const distribution = new Array(totalMonths).fill(0);

  switch(type) {
    case 'gleichmaessig':
      // Equal distribution
      const monthlyAmount = totalBetrag / totalMonths;
      distribution.fill(monthlyAmount);
      break;

    case 'front-loaded':
      // 70% in first 30% of timeline
      const frontMonths = Math.ceil(totalMonths * 0.3);
      const frontAmount = (totalBetrag * 0.7) / frontMonths;
      const backAmount = (totalBetrag * 0.3) / (totalMonths - frontMonths);

      for (let i = 0; i < totalMonths; i++) {
        distribution[i] = i < frontMonths ? frontAmount : backAmount;
      }
      break;

    case 'back-loaded':
      // 70% in last 30% of timeline
      const backStartMonth = Math.floor(totalMonths * 0.7);
      const backMonthsCount = totalMonths - backStartMonth;
      const backLoadedAmount = (totalBetrag * 0.7) / backMonthsCount;
      const frontLoadedAmount = (totalBetrag * 0.3) / backStartMonth;

      for (let i = 0; i < totalMonths; i++) {
        distribution[i] = i >= backStartMonth ? backLoadedAmount : frontLoadedAmount;
      }
      break;

    case 'manuell':
      // Manual - equal for now, user can adjust
      distribution.fill(totalBetrag / totalMonths);
      break;
  }

  return distribution;
}

/**
 * Render cost timeline visualization
 */
function renderKostenTimeline(blockId, distribution, vorlauf, nachlauf) {
  const timeline = document.getElementById('timeline-' + blockId);
  if (!timeline) return;

  const maxValue = Math.max(...distribution);
  const totalMonths = distribution.length;

  // Create timeline bars
  let timelineHTML = '<div class="timeline-bars">';

  distribution.forEach((value, index) => {
    const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
    const isVorlauf = index < vorlauf;
    const barClass = isVorlauf ? 'timeline-bar-vorlauf' : 'timeline-bar-nachlauf';

    timelineHTML += `
      <div class="timeline-bar ${barClass}" 
           style="height: ${heightPercent}%" 
           title="Monat ${index + 1}: ${helpers.formatCurrency(value, false)}">
      </div>
    `;
  });

  timelineHTML += '</div>';

  // Add legend
  timelineHTML += `
    <div class="timeline-legend">
      <div class="timeline-legend-item">
        <span class="timeline-legend-color" style="background: var(--warning);"></span>
        <span>Vorlauf (${vorlauf} Mon.)</span>
      </div>
      <div class="timeline-legend-item">
        <span class="timeline-legend-color" style="background: var(--primary);"></span>
        <span>Nachlauf (${nachlauf} Mon.)</span>
      </div>
    </div>
  `;

  timeline.innerHTML = timelineHTML;
}

// ==========================================
// PROJECT COST CALCULATION
// ==========================================

/**
 * Calculate total project costs across all blocks
 */
window.berechneProjektkosten = function() {
  const container = document.getElementById('kosten-bloecke-container');
  if (!container) return;

  const blocks = container.querySelectorAll('.kosten-block');
  let totalKosten = 0;

  blocks.forEach(block => {
    const betrag = helpers.parseFormattedNumber(
      block.querySelector('.kosten-betrag')?.value || '0'
    );
    totalKosten += betrag;
  });

  // Update total display
  const totalElement = document.getElementById('total-projektkosten');
  if (totalElement) {
    totalElement.textContent = helpers.formatCurrency(totalKosten, false);
  }

  console.log('💰 Total project costs calculated:', totalKosten);

  return totalKosten;
};

/**
 * Get cost distribution per year
 */
export function getProjektkostenPerYear(projektId) {
  const projekt = state.getProjekt(projektId);
  if (!projekt) return {};

  // This would aggregate all cost blocks by year
  // For now, return placeholder data
  const yearCosts = {};

  CONFIG.years.forEach(year => {
    yearCosts[year] = 2500; // Placeholder: 2.5k€ per year
  });

  return yearCosts;
}

// ==========================================
// KI-BASED RECOMMENDATIONS
// ==========================================

/**
 * Generate KI cost recommendations based on article type
 */
window.generateKostenEmpfehlungen = function() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) return;

  const projekt = state.getProjekt(projektId);
  if (!projekt) return;

  // Get article types in this project
  const artikel = state.getArtikelByProjekt(projektId);
  const artikelTypes = [...new Set(artikel.map(a => a.typ).filter(t => t))];

  console.log('🤖 Generating cost recommendations for types:', artikelTypes);

  // Determine dominant type
  let dominantType = 'hybrid';
  if (artikelTypes.includes('Software')) dominantType = 'software';
  else if (artikelTypes.includes('Hardware')) dominantType = 'hardware';
  else if (artikelTypes.includes('Service')) dominantType = 'service';

  const recommendations = CONFIG.projektKostenRegeln[dominantType];
  if (!recommendations) return;

  // Show modal with recommendations
  showKostenEmpfehlungenModal(recommendations, dominantType);
};

/**
 * Show cost recommendations modal
 */
function showKostenEmpfehlungenModal(recommendations, type) {
  const modalHTML = `
    <div id="kosten-empfehlungen-modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>🤖 KI-Kostenempfehlungen</h2>
          <button class="btn-close" onclick="closeKostenEmpfehlungenModal()">✕</button>
        </div>

        <div class="modal-body">
          <div class="ki-recommendation-header">
            <div class="ki-recommendation-icon">🎯</div>
            <div>
              <h3>${recommendations.titel}</h3>
              <p>Basierend auf Ihren Artikeln empfehlen wir folgende Kostenstruktur:</p>
            </div>
          </div>

          <div class="kosten-empfehlung-liste">
            ${recommendations.empfohleneBlöcke.map(block => `
              <div class="kosten-empfehlung-item">
                <div class="empfehlung-header">
                  <span class="empfehlung-icon">${block.icon}</span>
                  <span class="empfehlung-name">${block.name}</span>
                </div>
                <div class="empfehlung-anteil">
                  <div class="empfehlung-bar" style="width: ${block.anteil}%"></div>
                  <span class="empfehlung-percent">${block.anteil}%</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="ki-recommendation-details">
            <div class="detail-item">
              <span class="detail-label">📅 Empfohlene Vorlaufzeit:</span>
              <span class="detail-value">${recommendations.vorlaufzeit} Monate</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">📅 Empfohlene Nachlaufzeit:</span>
              <span class="detail-value">${recommendations.nachlaufzeit} Monate</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeKostenEmpfehlungenModal()">
            Schließen
          </button>
          <button class="btn btn-primary" onclick="applyKostenEmpfehlungen('${type}')">
            ✅ Empfehlungen übernehmen
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Close recommendations modal
 */
window.closeKostenEmpfehlungenModal = function() {
  const modal = document.getElementById('kosten-empfehlungen-modal');
  if (modal) modal.remove();
};

/**
 * Apply KI recommendations
 */
window.applyKostenEmpfehlungen = function(type) {
  const recommendations = CONFIG.projektKostenRegeln[type];
  if (!recommendations) return;

  console.log('✅ Applying cost recommendations for type:', type);

  // Clear existing blocks
  const container = document.getElementById('kosten-bloecke-container');
  if (container) {
    container.innerHTML = '';
  }

  // Get total budget (placeholder - should come from user input)
  const totalBudget = 100000; // 100k€ default

  // Create blocks based on recommendations
  recommendations.empfohleneBlöcke.forEach(block => {
    addKostenBlock();

    // Get the last added block
    const blocks = document.querySelectorAll('.kosten-block');
    const newBlock = blocks[blocks.length - 1];

    if (newBlock) {
      // Set name
      const nameInput = newBlock.querySelector('.kosten-block-name');
      if (nameInput) {
        nameInput.value = block.name;
      }

      // Set amount
      const betragInput = newBlock.querySelector('.kosten-betrag');
      if (betragInput) {
        const amount = (totalBudget * block.anteil) / 100;
        betragInput.value = helpers.formatThousands(amount);
      }

      // Set timeline
      const vorlaufInput = newBlock.querySelector('.kosten-vorlauf');
      const nachlaufInput = newBlock.querySelector('.kosten-nachlauf');
      if (vorlaufInput) vorlaufInput.value = recommendations.vorlaufzeit;
      if (nachlaufInput) nachlaufInput.value = recommendations.nachlaufzeit;

      // Update visualization
      const blockId = newBlock.dataset.blockId;
      if (blockId) {
        updateKostenVerteilung(blockId);
      }
    }
  });

  // Close modal
  closeKostenEmpfehlungenModal();

  // AI Feedback
  if (window.cfoDashboard.aiController) {
    window.cfoDashboard.aiController.addAIMessage({
      level: 'success',
      title: '✅ Empfehlungen übernommen',
      text: `${recommendations.empfohleneBlöcke.length} Kostenblöcke basierend auf KI-Analyse erstellt.`,
      timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
    });
  }
};

// ==========================================
// PERSONAL COST CALCULATOR
// ==========================================

/**
 * Open personal cost detail calculator
 */
window.openPersonalKostenDetail = function(blockId) {
  console.log('👥 Opening personal cost calculator for block:', blockId);

  const modalHTML = `
    <div id="personal-kosten-modal" class="modal">
      <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
          <h2>👥 Personalkosten-Rechner</h2>
          <button class="btn-close" onclick="closePersonalKostenModal()">✕</button>
        </div>

        <div class="modal-body">
          <div class="personal-kosten-calculator">
            <div class="form-group">
              <label>Anzahl Mitarbeiter</label>
              <input type="number" id="personal-anzahl" value="5" min="1" max="100">
            </div>

            <div class="form-group">
              <label>Durchschnittliches Jahresgehalt (€)</label>
              <input type="text" id="personal-gehalt" value="80.000" onblur="formatKostenInput(this)">
            </div>

            <div class="form-group">
              <label>Arbeitgeberanteil (%)</label>
              <input type="number" id="personal-arbeitgeber" value="20" min="0" max="50">
            </div>

            <div class="form-group">
              <label>Zusatzkosten (Equipment, Schulung etc.) (€/Jahr)</label>
              <input type="text" id="personal-zusatz" value="5.000" onblur="formatKostenInput(this)">
            </div>

            <div class="personal-ergebnis">
              <h3>📊 Berechnung</h3>
              <div id="personal-berechnung-details"></div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closePersonalKostenModal()">
            Schließen
          </button>
          <button class="btn btn-primary" onclick="applyPersonalKosten('${blockId}')">
            ✅ Übernehmen
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Calculate on load
  calculatePersonalKosten();

  // Add event listeners
  ['personal-anzahl', 'personal-gehalt', 'personal-arbeitgeber', 'personal-zusatz'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', calculatePersonalKosten);
    }
  });
};

/**
 * Calculate personal costs
 */
function calculatePersonalKosten() {
  const anzahl = parseInt(helpers.getInputValue('personal-anzahl')) || 0;
  const gehalt = helpers.parseFormattedNumber(helpers.getInputValue('personal-gehalt'));
  const arbeitgeber = parseInt(helpers.getInputValue('personal-arbeitgeber')) || 0;
  const zusatz = helpers.parseFormattedNumber(helpers.getInputValue('personal-zusatz'));

  const jahresgehalt = gehalt * anzahl;
  const arbeitgeberkosten = jahresgehalt * (arbeitgeber / 100);
  const gesamtZusatz = zusatz * anzahl;
  const gesamt = jahresgehalt + arbeitgeberkosten + gesamtZusatz;

  const detailsContainer = document.getElementById('personal-berechnung-details');
  if (detailsContainer) {
    detailsContainer.innerHTML = `
      <div class="berechnung-zeile">
        <span>Jahresgehälter (${anzahl} MA):</span>
        <span>${helpers.formatCurrency(jahresgehalt, false)}</span>
      </div>
      <div class="berechnung-zeile">
        <span>Arbeitgeberanteil (${arbeitgeber}%):</span>
        <span>${helpers.formatCurrency(arbeitgeberkosten, false)}</span>
      </div>
      <div class="berechnung-zeile">
        <span>Zusatzkosten:</span>
        <span>${helpers.formatCurrency(gesamtZusatz, false)}</span>
      </div>
      <div class="berechnung-zeile berechnung-total">
        <span>Gesamtkosten pro Jahr:</span>
        <span>${helpers.formatCurrency(gesamt, false)}</span>
      </div>
    `;
  }

  return gesamt;
}

/**
 * Apply personal costs to block
 */
window.applyPersonalKosten = function(blockId) {
  const gesamt = calculatePersonalKosten();
  
  const block = document.getElementById(blockId);
  if (block) {
    const betragInput = block.querySelector('.kosten-betrag');
    if (betragInput) {
      betragInput.value = helpers.formatThousands(gesamt);
      updateKostenVerteilung(blockId);
    }
  }

  closePersonalKostenModal();
};

/**
 * Close personal cost modal
 */
window.closePersonalKostenModal = function() {
  const modal = document.getElementById('personal-kosten-modal');
  if (modal) modal.remove();
};

// ==========================================
// EXPORTS
// ==========================================

export default {
  getProjektkostenPerYear,
  calculateDistribution
};