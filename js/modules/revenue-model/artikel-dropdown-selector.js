/**
 * ARTIKEL DROPDOWN SELECTOR
 * Kompakter Ersatz für große Sidebar
 * Mit Multi-Mode Support
 */

// ==========================================
// RENDER DROPDOWN SELECTOR
// ==========================================

export function renderArtikelDropdown(artikelList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  container.innerHTML = `
    <div class="artikel-selector">
      
      <!-- Single Mode: Dropdown -->
      <div class="selector-single" id="selector-single">
        <label class="selector-label">📦 Artikel auswählen</label>
        <select class="artikel-dropdown" id="artikel-dropdown">
          <option value="">-- Bitte wählen --</option>
          ${artikelList.map(artikel => `
            <option value="${artikel.id}" data-type="${artikel.typ}">
              ${getArtikelIcon(artikel.typ)} ${artikel.name}
            </option>
          `).join('')}
        </select>
      </div>
      
      <!-- Multi Mode Toggle -->
      <div class="selector-multi-toggle">
        <label class="checkbox-label">
          <input type="checkbox" id="multi-mode-checkbox" class="checkbox-input">
          <span class="checkbox-text">☑ Multi-Mode</span>
          <span class="checkbox-hint">(Mehrere Artikel kombiniert planen)</span>
        </label>
      </div>
      
      <!-- Multi Mode: Checkboxen -->
      <div class="selector-multi" id="selector-multi" style="display: none;">
        <label class="selector-label">📦 Artikel auswählen (mehrere möglich)</label>
        <div class="artikel-checkboxes">
          ${artikelList.map(artikel => `
            <label class="artikel-checkbox-item">
              <input type="checkbox" 
                     class="artikel-checkbox" 
                     value="${artikel.id}" 
                     data-name="${artikel.name}"
                     data-type="${artikel.typ}">
              <span class="checkbox-content">
                <span class="checkbox-icon">${getArtikelIcon(artikel.typ)}</span>
                <span class="checkbox-name">${artikel.name}</span>
                <span class="checkbox-badge">${getTypeName(artikel.typ)}</span>
              </span>
            </label>
          `).join('')}
        </div>
        
        <!-- Selected Counter -->
        <div class="selected-counter" id="selected-counter" style="display: none;">
          <span class="counter-text">
            <strong id="selected-count">0</strong> Artikel ausgewählt
          </span>
          <button class="btn-clear" onclick="window.clearArtikelSelection()">
            ✕ Alle abwählen
          </button>
        </div>
      </div>
      
      <!-- Action Button -->
      <div class="selector-actions">
        <button class="btn-load-model" id="btn-load-model" disabled>
          📊 Revenue Model laden
        </button>
      </div>
      
    </div>
    
    ${renderDropdownStyles()}
  `;
  
  // Attach event listeners
  attachDropdownEventListeners();
  
  console.log('✅ Artikel Dropdown rendered');
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachDropdownEventListeners() {
  // Multi-Mode Toggle
  const multiModeCheckbox = document.getElementById('multi-mode-checkbox');
  if (multiModeCheckbox) {
    multiModeCheckbox.addEventListener('change', toggleMultiMode);
  }
  
  // Single Mode Dropdown
  const dropdown = document.getElementById('artikel-dropdown');
  if (dropdown) {
    dropdown.addEventListener('change', onSingleArtikelChange);
  }
  
  // Multi Mode Checkboxes
  document.querySelectorAll('.artikel-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', onMultiArtikelChange);
  });
  
  // Load Model Button
  const loadBtn = document.getElementById('btn-load-model');
  if (loadBtn) {
    loadBtn.addEventListener('click', loadRevenueModel);
  }
}

// ==========================================
// MULTI-MODE TOGGLE
// ==========================================

function toggleMultiMode(event) {
  const isMulti = event.target.checked;
  
  const singleSelector = document.getElementById('selector-single');
  const multiSelector = document.getElementById('selector-multi');
  
  if (isMulti) {
    // Switch to Multi Mode
    singleSelector.style.display = 'none';
    multiSelector.style.display = 'block';
    
    // Clear single selection
    document.getElementById('artikel-dropdown').value = '';
    
    console.log('🔄 Switched to Multi-Mode');
  } else {
    // Switch to Single Mode
    singleSelector.style.display = 'block';
    multiSelector.style.display = 'none';
    
    // Clear multi selection
    document.querySelectorAll('.artikel-checkbox').forEach(cb => cb.checked = false);
    updateSelectedCounter();
    
    console.log('🔄 Switched to Single-Mode');
  }
  
  // Disable load button
  document.getElementById('btn-load-model').disabled = true;
}

// ==========================================
// SINGLE MODE
// ==========================================

function onSingleArtikelChange(event) {
  const selectedId = event.target.value;
  const loadBtn = document.getElementById('btn-load-model');
  
  if (selectedId) {
    loadBtn.disabled = false;
    console.log('📦 Selected artikel:', selectedId);
  } else {
    loadBtn.disabled = true;
  }
}

// ==========================================
// MULTI MODE
// ==========================================

function onMultiArtikelChange() {
  updateSelectedCounter();
  
  const selectedCount = document.querySelectorAll('.artikel-checkbox:checked').length;
  const loadBtn = document.getElementById('btn-load-model');
  
  loadBtn.disabled = selectedCount === 0;
}

function updateSelectedCounter() {
  const selectedCheckboxes = document.querySelectorAll('.artikel-checkbox:checked');
  const count = selectedCheckboxes.length;
  
  const counter = document.getElementById('selected-counter');
  const countDisplay = document.getElementById('selected-count');
  
  if (count > 0) {
    counter.style.display = 'flex';
    countDisplay.textContent = count;
  } else {
    counter.style.display = 'none';
  }
}

window.clearArtikelSelection = function() {
  document.querySelectorAll('.artikel-checkbox').forEach(cb => cb.checked = false);
  updateSelectedCounter();
  document.getElementById('btn-load-model').disabled = true;
};

// ==========================================
// LOAD REVENUE MODEL
// ==========================================

function loadRevenueModel() {
  const isMulti = document.getElementById('multi-mode-checkbox').checked;
  
  if (isMulti) {
    // Multi Mode
    const selected = Array.from(document.querySelectorAll('.artikel-checkbox:checked'))
      .map(cb => ({
        id: cb.value,
        name: cb.dataset.name,
        type: cb.dataset.type
      }));
    
    console.log('📊 Loading Revenue Model for:', selected);
    
    if (window.onLoadRevenueModel) {
      window.onLoadRevenueModel(selected, true);
    }
  } else {
    // Single Mode
    const dropdown = document.getElementById('artikel-dropdown');
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    
    if (selectedOption.value) {
      const artikel = {
        id: selectedOption.value,
        name: selectedOption.text.trim().substring(2), // Remove emoji
        type: selectedOption.dataset.type
      };
      
      console.log('📊 Loading Revenue Model for:', artikel);
      
      if (window.onLoadRevenueModel) {
        window.onLoadRevenueModel([artikel], false);
      }
    }
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getArtikelIcon(typ) {
  const icons = {
    'Hardware': '📦',
    'Software': '💿',
    'Software-Perpetual': '💿',
    'Service': '👔',
    'Beratung': '👔',
    'Package': '📊'
  };
  return icons[typ] || '📈';
}

function getTypeName(typ) {
  const names = {
    'Hardware': 'Hardware',
    'Software': 'Software',
    'Software-Perpetual': 'Software',
    'Service': 'Service',
    'Beratung': 'Beratung',
    'Package': 'Package'
  };
  return names[typ] || typ;
}

// ==========================================
// STYLES
// ==========================================

function renderDropdownStyles() {
  return `
    <style>
      .artikel-selector {
        padding: 16px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 16px;
      }
      
      /* Labels */
      .selector-label {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }
      
      /* Dropdown */
      .artikel-dropdown {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .artikel-dropdown:hover {
        border-color: #3b82f6;
      }
      
      .artikel-dropdown:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      /* Multi-Mode Toggle */
      .selector-multi-toggle {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
      }
      
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      
      .checkbox-input {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
      
      .checkbox-text {
        font-size: 13px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .checkbox-hint {
        font-size: 11px;
        color: #6b7280;
        margin-left: 4px;
      }
      
      /* Multi Mode Checkboxes */
      .selector-multi {
        margin-top: 12px;
      }
      
      .artikel-checkboxes {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 8px;
        max-height: 300px;
        overflow-y: auto;
        padding: 8px;
        background: #f9fafb;
        border-radius: 6px;
      }
      
      .artikel-checkbox-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .artikel-checkbox-item:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .artikel-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
        flex-shrink: 0;
      }
      
      .checkbox-content {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }
      
      .checkbox-icon {
        font-size: 18px;
        flex-shrink: 0;
      }
      
      .checkbox-name {
        font-size: 13px;
        font-weight: 600;
        color: #1f2937;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .checkbox-badge {
        padding: 2px 6px;
        background: #e0e7ff;
        color: #3730a3;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        flex-shrink: 0;
      }
      
      /* Selected Counter */
      .selected-counter {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        padding: 10px 12px;
        background: #dbeafe;
        border-radius: 6px;
      }
      
      .counter-text {
        font-size: 13px;
        color: #1e3a8a;
      }
      
      .btn-clear {
        padding: 6px 12px;
        border: 1px solid #3b82f6;
        border-radius: 4px;
        background: white;
        font-size: 12px;
        font-weight: 600;
        color: #2563eb;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-clear:hover {
        background: #eff6ff;
      }
      
      /* Action Button */
      .selector-actions {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
      }
      
      .btn-load-model {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 6px;
        background: #2563eb;
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-load-model:hover:not(:disabled) {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }
      
      .btn-load-model:disabled {
        background: #d1d5db;
        cursor: not-allowed;
        opacity: 0.6;
      }
      
      /* Scrollbar */
      .artikel-checkboxes::-webkit-scrollbar {
        width: 6px;
      }
      
      .artikel-checkboxes::-webkit-scrollbar-track {
        background: #f3f4f6;
        border-radius: 3px;
      }
      
      .artikel-checkboxes::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }
      
      .artikel-checkboxes::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .artikel-checkboxes {
          grid-template-columns: 1fr;
        }
        
        .selected-counter {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
        }
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderArtikelDropdown
};
