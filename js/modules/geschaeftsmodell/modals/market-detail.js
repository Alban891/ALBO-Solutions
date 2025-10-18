/**
 * Market Detail Modal
 * Handles TAM/SAM/SOM calculation modals
 */

import * as helpers from '../../../helpers.js';

// Modal state
let currentModalType = null;
let modalData = {
  tam: {},
  sam: {},
  som: {}
};

/**
 * Open market detail modal
 */
export function openModal(type) {
  currentModalType = type;
  
  let content = '';
  
  if (type === 'tam') {
    content = renderTAMModal();
  } else if (type === 'sam') {
    content = renderSAMModal();
  } else if (type === 'som') {
    content = renderSOMModal();
  }
  
  showModal(content);
}

/**
 * Close modal
 */
export function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) overlay.remove();
}

/**
 * Show modal overlay
 */
function showModal(content) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  overlay.innerHTML = `
    <div class="modal-content" style="background: white; border-radius: 12px; padding: 24px; max-width: 800px; max-height: 90vh; overflow-y: auto;">
      ${content}
    </div>
  `;
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  
  document.body.appendChild(overlay);
}

/**
 * Render TAM modal
 */
function renderTAMModal() {
  return `
    <div>
      <h3>📊 TAM Berechnung</h3>
      <p style="color: var(--gray); margin-bottom: 24px;">
        Total Addressable Market - Gesamtmarkt
      </p>
      
      <div class="form-group">
        <label>Gesamtmarkt (€)</label>
        <input type="number" id="modal-tam-value" placeholder="z.B. 2300000000" style="width: 100%;" />
      </div>
      
      <div class="form-group">
        <label>Quelle</label>
        <input type="text" id="modal-tam-source" placeholder="z.B. Statista 2024" style="width: 100%;" />
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border);">
        <button class="btn btn-secondary" onclick="geschaeftsmodellModule.closeMarketModal()">Abbrechen</button>
        <button class="btn btn-primary" onclick="geschaeftsmodellModule.saveTAMCalculation()">Übernehmen</button>
      </div>
    </div>
  `;
}

/**
 * Render SAM modal
 */
function renderSAMModal() {
  const tamValue = document.getElementById('gm-tam')?.value || 0;
  
  return `
    <div>
      <h3>🎯 SAM Berechnung</h3>
      <p style="color: var(--gray); margin-bottom: 16px;">
        Serviceable Addressable Market - Erreichbarer Markt
      </p>
      
      <div style="padding: 12px; background: var(--gray-50); border-radius: 8px; margin-bottom: 24px;">
        <div style="font-size: 13px; color: var(--gray);">Ausgangspunkt: TAM</div>
        <div style="font-size: 20px; font-weight: 600;">${helpers.formatCurrency(tamValue)}</div>
      </div>
      
      <div class="form-group">
        <label>SAM (€) - nach Filtern</label>
        <input type="number" id="modal-sam-value" placeholder="z.B. 450000000" style="width: 100%;" />
      </div>
      
      <div class="form-group">
        <label>Filter / Begründung</label>
        <textarea id="modal-sam-reasoning" rows="3" placeholder="z.B. Nur DACH (30% von TAM), nur Mittelstand (50%)..." style="width: 100%;"></textarea>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border);">
        <button class="btn btn-secondary" onclick="geschaeftsmodellModule.closeMarketModal()">Abbrechen</button>
        <button class="btn btn-primary" onclick="geschaeftsmodellModule.saveSAMCalculation()">Übernehmen</button>
      </div>
    </div>
  `;
}

/**
 * Render SOM modal
 */
function renderSOMModal() {
  const samValue = document.getElementById('gm-sam')?.value || 0;
  
  return `
    <div>
      <h3>🚀 SOM Berechnung</h3>
      <p style="color: var(--gray); margin-bottom: 16px;">
        Serviceable Obtainable Market - In 3 Jahren erreichbar
      </p>
      
      <div style="padding: 12px; background: var(--gray-50); border-radius: 8px; margin-bottom: 24px;">
        <div style="font-size: 13px; color: var(--gray);">Ausgangspunkt: SAM</div>
        <div style="font-size: 20px; font-weight: 600;">${helpers.formatCurrency(samValue)}</div>
      </div>
      
      <div class="form-group">
        <label>SOM Jahr 3 (€)</label>
        <input type="number" id="modal-som-value" placeholder="z.B. 12000000" style="width: 100%;" />
      </div>
      
      <div class="form-group">
        <label>Annahmen / Planung</label>
        <textarea id="modal-som-reasoning" rows="3" placeholder="z.B. Jahr 1: 5 Kunden, Jahr 2: 15 Kunden, Jahr 3: 40 Kunden @ 150k€..." style="width: 100%;"></textarea>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border);">
        <button class="btn btn-secondary" onclick="geschaeftsmodellModule.closeMarketModal()">Abbrechen</button>
        <button class="btn btn-primary" onclick="geschaeftsmodellModule.saveSOMCalculation()">Übernehmen</button>
      </div>
    </div>
  `;
}

/**
 * Save TAM calculation
 */
export function saveTAM() {
  const value = document.getElementById('modal-tam-value')?.value;
  const source = document.getElementById('modal-tam-source')?.value;
  
  if (value) {
    document.getElementById('gm-tam').value = value;
    modalData.tam = { value, source };
    window.geschaeftsmodellMarketData = modalData;
  }
  
  closeModal();
}

/**
 * Save SAM calculation
 */
export function saveSAM() {
  const value = document.getElementById('modal-sam-value')?.value;
  const reasoning = document.getElementById('modal-sam-reasoning')?.value;
  
  if (value) {
    document.getElementById('gm-sam').value = value;
    modalData.sam = { value, reasoning };
    window.geschaeftsmodellMarketData = modalData;
  }
  
  closeModal();
}

/**
 * Save SOM calculation
 */
export function saveSOM() {
  const value = document.getElementById('modal-som-value')?.value;
  const reasoning = document.getElementById('modal-som-reasoning')?.value;
  
  if (value) {
    document.getElementById('gm-som').value = value;
    modalData.som = { value, reasoning };
    window.geschaeftsmodellMarketData = modalData;
  }
  
  closeModal();
}

// Stub functions for advanced calculations (to be implemented)
export function switchTAMMethod(method) {
  console.log('Switch TAM method:', method);
  // TODO: Implement method switching
}

export function calculateTAM() {
  console.log('Calculate TAM');
  // TODO: Implement calculation
}

export function calculateSAM() {
  console.log('Calculate SAM');
  // TODO: Implement calculation
}

export function calculateSOM() {
  console.log('Calculate SOM');
  // TODO: Implement calculation
}