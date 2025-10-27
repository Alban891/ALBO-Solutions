/**
 * ARTIKEL SIDEBAR WITH MULTI-SELECTION
 * Enables combining multiple articles for joint planning
 */

// ==========================================
// RENDER ARTIKEL SIDEBAR WITH CHECKBOXES
// ==========================================

export function renderArtikelSidebarWithMultiSelect(artikelData) {
  const selectedIds = window.selectedArtikelIds || [];
  const isMultiMode = window.isMultiPlanningMode || false;
  
  return `
    <div class="artikel-sidebar-enhanced">
      
      <!-- Header with Mode Toggle -->
      <div class="sidebar-header">
        <h3 class="sidebar-title">📋 Artikel-Struktur</h3>
        
        <!-- Multi-Planning Toggle -->
        <button 
          class="mode-toggle ${isMultiMode ? 'active' : ''}"
          onclick="window.toggleMultiPlanningMode()"
          title="Multi-Artikel Planung aktivieren"
        >
          ${isMultiMode ? '☑️ Multi' : '☐ Multi'}
        </button>
      </div>
      
      <!-- Artikel List -->
      <div class="artikel-list-enhanced">
        ${artikelData.map(artikel => renderArtikelItemWithCheckbox(artikel)).join('')}
      </div>
      
      <!-- Multi-Planning Action -->
      ${selectedIds.length > 0 ? `
        <div class="multi-action-bar">
          <div class="selection-badge">
            ${selectedIds.length} ausgewählt
          </div>
          <button 
            class="btn-plan-multi"
            onclick="window.startMultiPlanning()"
          >
            📊 Kombiniert planen
          </button>
        </div>
      ` : ''}
      
    </div>
    
    ${renderSidebarStyles()}
  `;
}

function renderArtikelItemWithCheckbox(artikel) {
  const isMultiMode = window.isMultiPlanningMode || false;
  const isSelected = (window.selectedArtikelIds || []).includes(artikel.id);
  const isActive = window.currentArtikelId === artikel.id;
  
  const categoryColors = {
    'Software': '#3b82f6',
    'Package': '#8b5cf6',
    'Hardware': '#dc2626',
    'Service': '#10b981'
  };
  
  const categoryColor = categoryColors[artikel.category] || '#6b7280';
  
  return `
    <div class="artikel-item-enhanced ${isActive ? 'active' : ''}" data-artikel-id="${artikel.id}">
      
      <!-- Checkbox (only visible in multi-mode) -->
      ${isMultiMode ? `
        <div class="artikel-checkbox">
          <input 
            type="checkbox" 
            id="cb-${artikel.id}"
            ${isSelected ? 'checked' : ''}
            onclick="window.toggleArtikelSelection('${artikel.id}')"
          >
        </div>
      ` : ''}
      
      <!-- Artikel Info (clickable) -->
      <div 
        class="artikel-info"
        onclick="${isMultiMode ? '' : `window.selectSingleArtikel('${artikel.id}')`}"
        style="${isMultiMode ? 'cursor: default;' : 'cursor: pointer;'}"
      >
        <div class="artikel-icon-name">
          <span class="artikel-icon">${getArtikelIcon(artikel.category)}</span>
          <span class="artikel-name">${artikel.name}</span>
        </div>
        <span 
          class="artikel-badge" 
          style="background: ${categoryColor};"
        >
          ${artikel.category}
        </span>
      </div>
      
    </div>
  `;
}

function getArtikelIcon(category) {
  const icons = {
    'Hardware': '📦',
    'Software': '💿',
    'Package': '📦',
    'Service': '🔧'
  };
  return icons[category] || '📋';
}

// ==========================================
// WINDOW FUNCTIONS
// ==========================================

window.toggleMultiPlanningMode = function() {
  window.isMultiPlanningMode = !window.isMultiPlanningMode;
  
  if (!window.isMultiPlanningMode) {
    // Exit multi mode - clear selections
    window.selectedArtikelIds = [];
  }
  
  // Re-render sidebar
  refreshArtikelSidebar();
  
  console.log('Multi-Planning Mode:', window.isMultiPlanningMode);
};

window.toggleArtikelSelection = function(artikelId) {
  if (!window.selectedArtikelIds) {
    window.selectedArtikelIds = [];
  }
  
  const index = window.selectedArtikelIds.indexOf(artikelId);
  
  if (index > -1) {
    // Remove
    window.selectedArtikelIds.splice(index, 1);
  } else {
    // Add
    window.selectedArtikelIds.push(artikelId);
  }
  
  console.log('Selected IDs:', window.selectedArtikelIds);
  
  // Re-render sidebar to show updated selection
  refreshArtikelSidebar();
};

window.selectSingleArtikel = function(artikelId) {
  window.currentArtikelId = artikelId;
  
  const artikel = window.revenueModelArtikel?.find(a => a.id === artikelId);
  if (!artikel) return;
  
  // Render single artikel view
  if (window.renderHardwareModel) {
    window.renderHardwareModel(artikel, 'detail-container');
  }
  
  // Update active state in sidebar
  document.querySelectorAll('.artikel-item-enhanced').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.querySelector(`.artikel-item-enhanced[data-artikel-id="${artikelId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
};

window.startMultiPlanning = function() {
  const selectedIds = window.selectedArtikelIds || [];
  
  if (selectedIds.length === 0) {
    alert('Bitte wähle mindestens einen Artikel aus!');
    return;
  }
  
  console.log('Starting multi-planning for:', selectedIds);
  
  // Render multi-artikel view
  if (window.renderMultiArtikelPlanning) {
    window.renderMultiArtikelPlanning(selectedIds, 'detail-container');
  }
};

function refreshArtikelSidebar() {
  // This should be called from main app to re-render sidebar
  // For now, just log
  console.log('Sidebar refresh needed');
  
  // Trigger custom event that main app can listen to
  window.dispatchEvent(new CustomEvent('revenuemodel:refreshSidebar'));
}

// ==========================================
// STYLES
// ==========================================

function renderSidebarStyles() {
  return `
    <style>
      /* ===== ENHANCED SIDEBAR ===== */
      .artikel-sidebar-enhanced {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: white;
      }
      
      .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .sidebar-title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .mode-toggle {
        padding: 6px 12px;
        border: 2px solid #d1d5db;
        border-radius: 6px;
        background: white;
        font-size: 11px;
        font-weight: 600;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .mode-toggle:hover {
        border-color: #3b82f6;
        background: #eff6ff;
        color: #2563eb;
      }
      
      .mode-toggle.active {
        border-color: #2563eb;
        background: #2563eb;
        color: white;
      }
      
      /* ===== ARTIKEL LIST ===== */
      .artikel-list-enhanced {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }
      
      .artikel-item-enhanced {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px;
        margin-bottom: 6px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        transition: all 0.2s;
      }
      
      .artikel-item-enhanced:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .artikel-item-enhanced.active {
        border-color: #2563eb;
        background: #dbeafe;
      }
      
      .artikel-checkbox {
        display: flex;
        align-items: center;
        padding-left: 4px;
      }
      
      .artikel-checkbox input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
      
      .artikel-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      
      .artikel-icon-name {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .artikel-icon {
        font-size: 18px;
      }
      
      .artikel-name {
        font-size: 13px;
        font-weight: 500;
        color: #1f2937;
      }
      
      .artikel-badge {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
        color: white;
        white-space: nowrap;
      }
      
      /* ===== MULTI-ACTION BAR ===== */
      .multi-action-bar {
        padding: 16px;
        background: #f9fafb;
        border-top: 2px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .selection-badge {
        padding: 8px;
        background: #dbeafe;
        border: 2px solid #3b82f6;
        border-radius: 6px;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: #1e40af;
      }
      
      .btn-plan-multi {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 6px;
        background: #2563eb;
        color: white;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-plan-multi:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
      }
      
      .btn-plan-multi:active {
        transform: translateY(0);
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderArtikelSidebarWithMultiSelect
};
