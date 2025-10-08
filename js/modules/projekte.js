/**
 * CFO Dashboard - Projekte Module
 * Complete project lifecycle: Create, Read, Update, Delete, Render
 * Enterprise-grade with filtering, sorting, and bulk operations
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';
import * as api from '../api.js';
import { renderArtikelListByProjekt } from './artikel.js';

// ==========================================
// PROJECT RENDERING
// ==========================================

/**
 * Render project overview table
 */
export function renderProjektOverview() {
  console.log('📊 Rendering project overview');

  const tbody = document.getElementById('projekt-list-tbody');
  if (!tbody) return;

  const projekte = state.getAllProjekte();

  if (projekte.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--gray);">
          <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
          <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">
            Noch keine Projekte vorhanden
          </div>
          <div style="font-size: 14px;">
            Erstelle dein erstes Projekt
          </div>
        </td>
      </tr>
    `;
    updateProjektStats();
    return;
  }

  tbody.innerHTML = projekte.map(projekt => {
    const artikelCount = projekt.artikel?.length || 0;
    const statusClass = (projekt.status || 'aktiv').toLowerCase().replace(/\s/g, '-');

    return `
      <tr class="projekt-row" data-projekt-id="${projekt.id}">
        <td>
          <input type="checkbox" class="projekt-checkbox" value="${projekt.id}" 
                 onchange="updateBulkActions()">
        </td>
        <td>
          <div style="font-weight: 500; color: var(--text); cursor: pointer;" 
               onclick="openProjektArtikel('${projekt.id}')">
            ${helpers.escapeHtml(projekt.name)}
          </div>
          <div style="font-size: 12px; color: var(--gray); margin-top: 4px;">
            ${helpers.escapeHtml(projekt.beschreibung || '-')}
          </div>
        </td>
        <td>${helpers.escapeHtml(projekt.division || '-')}</td>
        <td>
          <span class="status-badge status-${statusClass}">
            ${helpers.escapeHtml(projekt.status || 'aktiv')}
          </span>
        </td>
        <td>${helpers.escapeHtml(projekt.owner || '-')}</td>
        <td>${artikelCount}</td>
        <td>
          ${helpers.formatDateSafe(projekt.startDatum)} - 
          ${helpers.formatDateSafe(projekt.endDatum)}
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" onclick="openProjektArtikel('${projekt.id}')" title="Artikel anzeigen">
              📦
            </button>
            <button class="btn-icon" onclick="editProjekt('${projekt.id}')" title="Bearbeiten">
              ✏️
            </button>
            <button class="btn-icon btn-danger" onclick="deleteProjekt('${projekt.id}')" title="Löschen">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  updateProjektStats();
}

/**
 * Update project statistics
 */
export function updateProjektStats() {
  const projekte = state.getAllProjekte();

  const total = projekte.length;
  const aktiv = projekte.filter(p => p.status?.toLowerCase() === 'aktiv').length;
  const onHold = projekte.filter(p => p.status?.toLowerCase().includes('hold')).length;
  const abgeschlossen = projekte.filter(p => p.status?.toLowerCase() === 'abgeschlossen').length;

  // Update UI
  helpers.setInputValue('stat-total-projects', total);
  helpers.setInputValue('stat-active-projects', aktiv);
  helpers.setInputValue('stat-onhold-projects', onHold);
  helpers.setInputValue('stat-completed-projects', abgeschlossen);

  console.log('📈 Project stats updated:', { total, aktiv, onHold, abgeschlossen });
}

// ==========================================
// PROJECT NAVIGATION
// ==========================================

/**
 * Open projekt artikel view
 */
window.openProjektArtikel = async function(projektId) {
  const projekt = state.getProjekt(projektId);
  if (!projekt) {
    console.error('Projekt not found:', projektId);
    return;
  }

  console.log('📂 Opening projekt:', projekt.name);

  // Set current projekt
  window.cfoDashboard.currentProjekt = projektId;
  state.currentProjekt = projektId;

  // Load artikel for this projekt
  await api.loadArticles(projektId);

  // Switch to artikel view
  const projektOverview = document.getElementById('projekt-overview');
  const artikelOverview = document.getElementById('artikel-overview');

  if (projektOverview) projektOverview.style.display = 'none';
  if (artikelOverview) artikelOverview.style.display = 'block';

  // Update breadcrumb/title
  const projektTitle = document.getElementById('current-projekt-name');
  if (projektTitle) {
    projektTitle.textContent = projekt.name;
  }

  // Render artikel list
  renderArtikelListByProjekt();

  // Save navigation state
  if (window.saveNavigationState) {
    window.saveNavigationState();
  }

  // AI Feedback
  if (window.cfoDashboard.aiController) {
    window.cfoDashboard.aiController.addAIMessage({
      level: 'info',
      title: '📂 Projekt geöffnet',
      text: `"${projekt.name}" - ${projekt.artikel?.length || 0} Artikel geladen.`,
      timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
    });
  }
};

/**
 * Go back to projekt overview
 */
window.backToProjektOverview = function() {
  console.log('🔙 Back to projekt overview');

  const projektOverview = document.getElementById('projekt-overview');
  const artikelOverview = document.getElementById('artikel-overview');

  if (projektOverview) projektOverview.style.display = 'block';
  if (artikelOverview) artikelOverview.style.display = 'none';

  // Clear current projekt
  window.cfoDashboard.currentProjekt = null;
  state.currentProjekt = null;

  // Re-render projekt list
  renderProjektOverview();

  // Save state
  if (window.saveNavigationState) {
    window.saveNavigationState();
  }
};

// ==========================================
// PROJECT CREATE
// ==========================================

/**
 * Open create projekt modal
 */
window.openCreateProjektModal = function() {
  console.log('➕ Opening create projekt modal');

  const modalHTML = `
    <div id="create-projekt-modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>📁 Neues Projekt erstellen</h2>
          <button class="btn-close" onclick="closeCreateProjektModal()">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Projektname *</label>
            <input type="text" id="new-projekt-name" placeholder="z.B. Smart Home Platform" required>
          </div>
          
          <div class="form-group">
            <label>Beschreibung</label>
            <textarea id="new-projekt-beschreibung" rows="3" 
                      placeholder="Kurze Projektbeschreibung..."></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Business Unit *</label>
              <select id="new-projekt-division">
                <option value="Entwicklung">Entwicklung</option>
                <option value="Produktion">Produktion</option>
                <option value="Vertrieb">Vertrieb</option>
                <option value="Service">Service</option>
                <option value="Innovation">Innovation</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Status</label>
              <select id="new-projekt-status">
                <option value="Planung">Planung</option>
                <option value="Aktiv" selected>Aktiv</option>
                <option value="On Hold">On Hold</option>
                <option value="Abgeschlossen">Abgeschlossen</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Projektleiter</label>
            <input type="text" id="new-projekt-owner" placeholder="z.B. Max Mustermann">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Startdatum</label>
              <input type="month" id="new-projekt-start" value="${helpers.getCurrentDate().substring(0, 7)}">
            </div>
            
            <div class="form-group">
              <label>Enddatum</label>
              <input type="month" id="new-projekt-end">
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeCreateProjektModal()">
            Abbrechen
          </button>
          <button class="btn btn-primary" onclick="createProjekt()">
            ✅ Projekt erstellen
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Focus name input
  setTimeout(() => {
    const nameInput = document.getElementById('new-projekt-name');
    if (nameInput) nameInput.focus();
  }, 100);
};

/**
 * Close create projekt modal
 */
window.closeCreateProjektModal = function() {
  const modal = document.getElementById('create-projekt-modal');
  if (modal) modal.remove();
};

/**
 * Create new projekt
 */
window.createProjekt = async function() {
  console.log('💾 Creating projekt...');

  try {
    // Collect form data
    const projektData = {
      name: helpers.getInputValue('new-projekt-name'),
      beschreibung: helpers.getInputValue('new-projekt-beschreibung'),
      division: helpers.getInputValue('new-projekt-division'),
      status: helpers.getInputValue('new-projekt-status'),
      owner: helpers.getInputValue('new-projekt-owner'),
      startDatum: helpers.getInputValue('new-projekt-start'),
      endDatum: helpers.getInputValue('new-projekt-end')
    };

    // Validate
    if (!projektData.name || projektData.name.trim() === '') {
      alert('Bitte Projektname eingeben!');
      return;
    }

    // Save to database
    const saved = await api.saveProject(projektData);

    if (saved) {
      console.log('✅ Projekt created');

      // Close modal
      closeCreateProjektModal();

      // Re-render list
      renderProjektOverview();

      // AI Feedback
      if (window.cfoDashboard.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
          level: 'success',
          title: '✅ Projekt erstellt',
          text: `"${projektData.name}" wurde erfolgreich angelegt.`,
          timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
      }
    }

  } catch (error) {
    console.error('❌ Create failed:', error);
    alert('Fehler beim Erstellen: ' + error.message);
  }
};

// ==========================================
// PROJECT EDIT
// ==========================================

/**
 * Edit projekt
 */
window.editProjekt = function(projektId) {
  const projekt = state.getProjekt(projektId);
  if (!projekt) return;

  console.log('✏️ Editing projekt:', projekt.name);

  const modalHTML = `
    <div id="edit-projekt-modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>✏️ Projekt bearbeiten</h2>
          <button class="btn-close" onclick="closeEditProjektModal()">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Projektname *</label>
            <input type="text" id="edit-projekt-name" value="${helpers.escapeHtml(projekt.name)}" required>
          </div>
          
          <div class="form-group">
            <label>Beschreibung</label>
            <textarea id="edit-projekt-beschreibung" rows="3">${helpers.escapeHtml(projekt.beschreibung || '')}</textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Business Unit</label>
              <select id="edit-projekt-division">
                <option value="Entwicklung" ${projekt.division === 'Entwicklung' ? 'selected' : ''}>Entwicklung</option>
                <option value="Produktion" ${projekt.division === 'Produktion' ? 'selected' : ''}>Produktion</option>
                <option value="Vertrieb" ${projekt.division === 'Vertrieb' ? 'selected' : ''}>Vertrieb</option>
                <option value="Service" ${projekt.division === 'Service' ? 'selected' : ''}>Service</option>
                <option value="Innovation" ${projekt.division === 'Innovation' ? 'selected' : ''}>Innovation</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Status</label>
              <select id="edit-projekt-status">
                <option value="Planung" ${projekt.status === 'Planung' ? 'selected' : ''}>Planung</option>
                <option value="Aktiv" ${projekt.status === 'Aktiv' ? 'selected' : ''}>Aktiv</option>
                <option value="On Hold" ${projekt.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                <option value="Abgeschlossen" ${projekt.status === 'Abgeschlossen' ? 'selected' : ''}>Abgeschlossen</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Projektleiter</label>
            <input type="text" id="edit-projekt-owner" value="${helpers.escapeHtml(projekt.owner || '')}">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Startdatum</label>
              <input type="month" id="edit-projekt-start" value="${projekt.startDatum || ''}">
            </div>
            
            <div class="form-group">
              <label>Enddatum</label>
              <input type="month" id="edit-projekt-end" value="${projekt.endDatum || ''}">
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeEditProjektModal()">
            Abbrechen
          </button>
          <button class="btn btn-primary" onclick="updateProjekt('${projektId}')">
            ✅ Speichern
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

/**
 * Close edit modal
 */
window.closeEditProjektModal = function() {
  const modal = document.getElementById('edit-projekt-modal');
  if (modal) modal.remove();
};

/**
 * Update projekt
 */
window.updateProjekt = async function(projektId) {
  console.log('💾 Updating projekt:', projektId);

  try {
    const updates = {
      name: helpers.getInputValue('edit-projekt-name'),
      beschreibung: helpers.getInputValue('edit-projekt-beschreibung'),
      division: helpers.getInputValue('edit-projekt-division'),
      status: helpers.getInputValue('edit-projekt-status'),
      owner: helpers.getInputValue('edit-projekt-owner'),
      startDatum: helpers.getInputValue('edit-projekt-start'),
      endDatum: helpers.getInputValue('edit-projekt-end')
    };

    // Validate
    if (!updates.name || updates.name.trim() === '') {
      alert('Bitte Projektname eingeben!');
      return;
    }

    // Update in database
    const success = await api.updateProject(projektId, updates);

    if (success) {
      console.log('✅ Projekt updated');

      // Close modal
      closeEditProjektModal();

      // Re-render list
      renderProjektOverview();

      // AI Feedback
      if (window.cfoDashboard.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
          level: 'success',
          title: '✅ Projekt aktualisiert',
          text: `"${updates.name}" wurde gespeichert.`,
          timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
      }
    }

  } catch (error) {
    console.error('❌ Update failed:', error);
    alert('Fehler beim Speichern: ' + error.message);
  }
};

// ==========================================
// PROJECT DELETE
// ==========================================

/**
 * Delete projekt with confirmation
 */
window.deleteProjekt = function(projektId) {
  const projekt = state.getProjekt(projektId);
  if (!projekt) return;

  const artikelCount = projekt.artikel?.length || 0;

  const modalHTML = `
    <div id="delete-projekt-modal" class="modal">
      <div class="modal-content" style="max-width: 450px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="font-size: 32px;">⚠️</div>
          <h2 style="margin: 0; color: var(--danger);">Projekt löschen?</h2>
        </div>
        
        <p style="margin: 0 0 16px 0;">
          Möchten Sie <strong>"${helpers.escapeHtml(projekt.name)}"</strong> wirklich löschen?
        </p>
        
        ${artikelCount > 0 ? `
          <div style="background: #fef2f2; border-left: 3px solid var(--danger); 
               padding: 12px; margin-bottom: 20px; border-radius: 4px;">
            <div style="font-size: 12px; font-weight: 600; color: var(--danger); margin-bottom: 4px;">
              ⚠️ Achtung
            </div>
            <div style="font-size: 12px;">
              Alle zugehörigen Artikel (${artikelCount}) werden ebenfalls gelöscht.
            </div>
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="closeDeleteProjektModal()">
            Abbrechen
          </button>
          <button class="btn btn-danger" onclick="confirmDeleteProjekt('${projektId}')">
            Endgültig löschen
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

/**
 * Confirm projekt deletion
 */
window.confirmDeleteProjekt = async function(projektId) {
  console.log('🗑️ Deleting projekt:', projektId);

  const projekt = state.getProjekt(projektId);
  const projektName = projekt?.name || 'Projekt';

  const success = await api.deleteProject(projektId);

  if (success) {
    console.log('✅ Projekt deleted');

    // Close modal
    closeDeleteProjektModal();

    // Re-render list
    renderProjektOverview();

    // AI Feedback
    if (window.cfoDashboard.aiController) {
      window.cfoDashboard.aiController.addAIMessage({
        level: 'info',
        title: '🗑️ Projekt gelöscht',
        text: `"${projektName}" wurde erfolgreich entfernt.`,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  }
};

/**
 * Close delete modal
 */
window.closeDeleteProjektModal = function() {
  const modal = document.getElementById('delete-projekt-modal');
  if (modal) modal.remove();
};

// ==========================================
// FILTERING & SORTING
// ==========================================

/**
 * Filter projects
 */
window.filterProjekte = function() {
  const searchTerm = helpers.getInputValue('projekt-search').toLowerCase();
  const statusFilter = helpers.getInputValue('projekt-filter-status');

  const rows = document.querySelectorAll('.projekt-row');

  rows.forEach(row => {
    const projektId = row.dataset.projektId;
    const projekt = state.getProjekt(projektId);

    if (!projekt) {
      row.style.display = 'none';
      return;
    }

    // Search filter
    const nameMatch = projekt.name?.toLowerCase().includes(searchTerm);
    const ownerMatch = projekt.owner?.toLowerCase().includes(searchTerm);
    const divisionMatch = projekt.division?.toLowerCase().includes(searchTerm);

    const searchMatch = searchTerm === '' || nameMatch || ownerMatch || divisionMatch;

    // Status filter
    const projektStatus = projekt.status?.toLowerCase().replace(/\s/g, '-') || 'aktiv';
    const statusMatch = statusFilter === 'alle' || projektStatus === statusFilter;

    // Show/hide row
    row.style.display = (searchMatch && statusMatch) ? '' : 'none';
  });

  updateFilteredStats();
};

/**
 * Sort projects
 */
window.sortProjekte = function() {
  const sortBy = helpers.getInputValue('projekt-sort');
  const tbody = document.getElementById('projekt-list-tbody');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('.projekt-row'));

  rows.sort((a, b) => {
    const projektA = state.getProjekt(a.dataset.projektId);
    const projektB = state.getProjekt(b.dataset.projektId);

    if (!projektA || !projektB) return 0;

    switch(sortBy) {
      case 'name':
        return (projektA.name || '').localeCompare(projektB.name || '');
      case 'start':
        return new Date(projektA.startDatum || '2099-12-31') - new Date(projektB.startDatum || '2099-12-31');
      case 'status':
        return (projektA.status || '').localeCompare(projektB.status || '');
      case 'owner':
        return (projektA.owner || '').localeCompare(projektB.owner || '');
      default:
        return 0;
    }
  });

  rows.forEach(row => tbody.appendChild(row));
};

/**
 * Update filtered stats
 */
function updateFilteredStats() {
  const visibleRows = document.querySelectorAll('.projekt-row:not([style*="display: none"])');

  let aktiv = 0, onHold = 0, abgeschlossen = 0;

  visibleRows.forEach(row => {
    const projekt = state.getProjekt(row.dataset.projektId);
    if (!projekt) return;

    const status = projekt.status?.toLowerCase() || '';
    if (status === 'aktiv') aktiv++;
    else if (status.includes('hold')) onHold++;
    else if (status === 'abgeschlossen') abgeschlossen++;
  });

  const total = visibleRows.length;

  // Update stats
  helpers.setInputValue('stat-total-projects', total);
  helpers.setInputValue('stat-active-projects', aktiv);
  helpers.setInputValue('stat-onhold-projects', onHold);
  helpers.setInputValue('stat-completed-projects', abgeschlossen);
}

// ==========================================
// BULK ACTIONS
// ==========================================

/**
 * Toggle all projekt checkboxes
 */
window.toggleAllProjects = function(checkbox) {
  const checkboxes = document.querySelectorAll('.projekt-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = checkbox.checked;
  });
  updateBulkActions();
};

/**
 * Update bulk actions bar
 */
window.updateBulkActions = function() {
  const checkedBoxes = document.querySelectorAll('.projekt-checkbox:checked');
  const bulkBar = document.getElementById('bulk-actions-bar');

  if (bulkBar) {
    bulkBar.style.display = checkedBoxes.length > 0 ? 'flex' : 'none';

    const countElement = document.getElementById('bulk-count');
    if (countElement) {
      countElement.textContent = checkedBoxes.length;
    }
  }
};

/**
 * Bulk status change
 */
window.bulkStatusChange = async function() {
  const newStatus = helpers.getInputValue('bulk-status-change');
  if (!newStatus) {
    alert('Bitte Status auswählen!');
    return;
  }

  const checkedBoxes = document.querySelectorAll('.projekt-checkbox:checked');
  const projektIds = Array.from(checkedBoxes).map(cb => cb.value);

  if (projektIds.length === 0) return;

  console.log(`🔄 Bulk updating ${projektIds.length} projects to status: ${newStatus}`);

  const updatedCount = await api.updateMultipleProjectsStatus(projektIds, newStatus);

  // Reset checkboxes
  checkedBoxes.forEach(cb => cb.checked = false);
  document.getElementById('select-all-projects').checked = false;

  // Re-render
  renderProjektOverview();
  updateBulkActions();

  // AI Feedback
  if (window.cfoDashboard.aiController) {
    window.cfoDashboard.aiController.addAIMessage({
      level: 'success',
      title: '✅ Status aktualisiert',
      text: `${updatedCount} Projekt(e) auf "${newStatus}" gesetzt.`,
      timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
    });
  }
};

/**
 * Bulk delete projects
 */
window.bulkDeleteProjekte = function() {
  const checkedBoxes = document.querySelectorAll('.projekt-checkbox:checked');
  const projektIds = Array.from(checkedBoxes).map(cb => cb.value);

  if (projektIds.length === 0) return;

  const confirmed = confirm(`${projektIds.length} Projekte wirklich löschen?\n\nAlle zugehörigen Artikel werden ebenfalls gelöscht.`);
  if (!confirmed) return;

  console.log(`🗑️ Bulk deleting ${projektIds.length} projects`);

  api.deleteMultipleProjects(projektIds).then(deletedCount => {
    // Reset checkboxes
    checkedBoxes.forEach(cb => cb.checked = false);
    document.getElementById('select-all-projects').checked = false;

    // Re-render
    renderProjektOverview();
    updateBulkActions();

    // AI Feedback
    if (window.cfoDashboard.aiController) {
      window.cfoDashboard.aiController.addAIMessage({
        level: 'info',
        title: '🗑️ Projekte gelöscht',
        text: `${deletedCount} Projekt(e) erfolgreich entfernt.`,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  });
};

// ==========================================
// EXPORTS
// ==========================================

export default {
  renderProjektOverview,
  updateProjektStats
};