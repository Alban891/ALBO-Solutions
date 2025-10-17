  /**
   * CFO Dashboard - Projekte Module
   * Complete project lifecycle: Create, Read, Update, Delete, Render
   * Enterprise-grade with filtering, sorting, and bulk operations
   * NOW WITH: Liste, Karten, and Kompakt views
   */

  import { state } from '../state.js';
  import * as helpers from '../helpers.js';
  import * as api from '../api.js';
  import { renderArtikelListByProjekt } from './artikel.js';

  // ==========================================
  // VIEW STATE
  // ==========================================

  let currentView = 'liste'; // 'liste', 'karten', 'kompakt'

  // ==========================================
  // PROJECT RENDERING - MAIN DISPATCHER
  // ==========================================

  /**
   * Render project overview based on current view
   */
  export function renderProjektOverview() {
    console.log('📊 Rendering project overview - View:', currentView);

    const projekte = state.getAllProjekte();

    if (projekte.length === 0) {
      renderEmptyState();
      updateProjektStats();
      return;
    }

    // Dispatch to appropriate renderer
    switch(currentView) {
      case 'karten':
        renderKartenView(projekte);
        break;
      case 'kompakt':
        renderKompaktView(projekte);
        break;
      case 'liste':
      default:
        renderListeView(projekte);
        break;
    }

    updateProjektStats();
  }

  // ==========================================
  // LISTE VIEW (Original Table)
  // ==========================================

  /**
   * Render liste view (table)
   */
  function renderListeView(projekte) {
    const container = document.getElementById('projekt-list-container');
    if (!container) {
      console.error('projekt-list-container not found');
      return;
    }

    const tableHTML = `
      <table class="data-table" id="projekt-table">
        <thead>
          <tr>
            <th style="width: 40px;">
              <input type="checkbox" id="select-all-projects" onchange="toggleAllProjects(this)">
            </th>
            <th>PROJEKT</th>
            <th>DIVISION</th>
            <th>OWNER</th>
            <th>START</th>
            <th>END</th>
            <th>STATUS</th>
            <th style="width: 100px;">AKTIONEN</th>
          </tr>
        </thead>
        <tbody id="projekt-list-tbody">
          ${projekte.map(projekt => {
            const statusClass = (projekt.status || 'aktiv').toLowerCase().replace(/\s/g, '-');

            return `
              <tr class="projekt-row" data-projekt-id="${projekt.id}">
                <td>
                  <input type="checkbox" class="projekt-checkbox" value="${projekt.id}" 
                        onchange="updateBulkActions()">
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">📁</span>
                    <div>
                      <div style="font-weight: 500; color: var(--text-primary); cursor: pointer;" 
                          onclick="openProjektDetail('${projekt.id}')">
                        ${helpers.escapeHtml(projekt.name)}
                      </div>
                    </div>
                  </div>
                </td>
                <td style="color: var(--text-secondary);">${helpers.escapeHtml(projekt.division || '-')}</td>
                <td style="color: var(--text-secondary);">${helpers.escapeHtml(projekt.owner || '-')}</td>
                <td style="color: var(--text-secondary); font-size: 12px;">
                  ${projekt.startDatum ? projekt.startDatum : '-'}
                </td>
                <td style="color: var(--text-secondary); font-size: 12px;">
                  ${projekt.endDatum ? projekt.endDatum : '-'}
                </td>
                <td>
                  <span class="status-badge status-${statusClass}">
                    ${helpers.escapeHtml(projekt.status || 'aktiv')}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" onclick="openProjektDetail('${projekt.id}')" title="Öffnen">
                      👁️
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteProjekt('${projekt.id}')" title="Löschen">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = tableHTML;
  }

  // ==========================================
  // KARTEN VIEW (Card Grid)
  // ==========================================

  /**
   * Render karten view (cards)
   */
  function renderKartenView(projekte) {
    const container = document.getElementById('projekt-list-container');
    if (!container) {
      console.error('projekt-list-container not found');
      return;
    }

    const cardsHTML = `
      <div class="projekt-karten-grid">
        ${projekte.map(projekt => renderProjektCard(projekt)).join('')}
      </div>
    `;

    container.innerHTML = cardsHTML;
  }

  /**
   * Render single project card
   */
  function renderProjektCard(projekt) {
    const statusClass = (projekt.status || 'aktiv').toLowerCase().replace(/\s/g, '-');
    const artikelCount = projekt.artikel?.length || 0;

    return `
      <div class="projekt-card" data-projekt-id="${projekt.id}">
        <div class="projekt-card-header">
          <div class="projekt-card-checkbox">
            <input type="checkbox" class="projekt-checkbox" value="${projekt.id}" 
                  onchange="updateBulkActions()">
          </div>
          <div class="projekt-card-icon">📁</div>
          <div class="projekt-card-status">
            <span class="status-badge status-${statusClass}">
              ${helpers.escapeHtml(projekt.status || 'aktiv')}
            </span>
          </div>
        </div>
        
        <div class="projekt-card-body" onclick="openProjektDetail('${projekt.id}')">
          <h3 class="projekt-card-title">${helpers.escapeHtml(projekt.name)}</h3>
          
          <div class="projekt-card-info">
            <div class="projekt-card-info-item">
              <span class="info-label">Division:</span>
              <span class="info-value">${helpers.escapeHtml(projekt.division || '-')}</span>
            </div>
            <div class="projekt-card-info-item">
              <span class="info-label">Owner:</span>
              <span class="info-value">${helpers.escapeHtml(projekt.owner || '-')}</span>
            </div>
            <div class="projekt-card-info-item">
              <span class="info-label">Zeitraum:</span>
              <span class="info-value">${projekt.startDatum || '-'} bis ${projekt.endDatum || '-'}</span>
            </div>
            <div class="projekt-card-info-item">
              <span class="info-label">Artikel:</span>
              <span class="info-value">${artikelCount} Artikel</span>
            </div>
          </div>
        </div>
        
        <div class="projekt-card-footer">
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openProjektDetail('${projekt.id}')">
            👁️ Öffnen
          </button>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteProjekt('${projekt.id}')">
            🗑️ Löschen
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // KOMPAKT VIEW (Compact List)
  // ==========================================

  /**
   * Render kompakt view (compact list)
   */
  function renderKompaktView(projekte) {
    const container = document.getElementById('projekt-list-container');
    if (!container) {
      console.error('projekt-list-container not found');
      return;
    }

    const kompaktHTML = `
      <div class="projekt-kompakt-list">
        ${projekte.map(projekt => renderProjektKompakt(projekt)).join('')}
      </div>
    `;

    container.innerHTML = kompaktHTML;
  }

  /**
   * Render single compact project item
   */
  function renderProjektKompakt(projekt) {
    const statusClass = (projekt.status || 'aktiv').toLowerCase().replace(/\s/g, '-');
    const artikelCount = projekt.artikel?.length || 0;

    return `
      <div class="projekt-kompakt-item" data-projekt-id="${projekt.id}">
        <div class="kompakt-checkbox">
          <input type="checkbox" class="projekt-checkbox" value="${projekt.id}" 
                onchange="updateBulkActions()">
        </div>
        
        <div class="kompakt-icon">📁</div>
        
        <div class="kompakt-main" onclick="openProjektDetail('${projekt.id}')">
          <div class="kompakt-title">${helpers.escapeHtml(projekt.name)}</div>
          <div class="kompakt-meta">
            ${helpers.escapeHtml(projekt.division || '-')} • 
            ${helpers.escapeHtml(projekt.owner || '-')} • 
            ${artikelCount} Artikel
          </div>
        </div>
        
        <div class="kompakt-status">
          <span class="status-badge status-${statusClass}">
            ${helpers.escapeHtml(projekt.status || 'aktiv')}
          </span>
        </div>
        
        <div class="kompakt-actions">
          <button class="btn-icon" onclick="openProjektDetail('${projekt.id}')" title="Öffnen">
            👁️
          </button>
          <button class="btn-icon btn-danger" onclick="deleteProjekt('${projekt.id}')" title="Löschen">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // EMPTY STATE
  // ==========================================

  /**
   * Render empty state
   */
  function renderEmptyState() {
    const container = document.getElementById('projekt-list-container');
    if (!container) return;

    container.innerHTML = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40px;"></th>
              <th>PROJEKT</th>
              <th>DIVISION</th>
              <th>OWNER</th>
              <th>START</th>
              <th>END</th>
              <th>STATUS</th>
              <th style="width: 100px;">AKTIONEN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">📁</div>
                <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">
                  Noch keine Projekte vorhanden
                </div>
                <div style="font-size: 14px;">
                  Erstelle dein erstes Projekt
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // VIEW SWITCHING
  // ==========================================

  /**
   * Switch project view (called from index.html)
   */
  window.switchProjectView = function(viewType) {
    console.log('🔄 Switching project view to:', viewType);

    currentView = viewType;
    
    // ✓ CRITICAL: Save list view preference
    state.projektListView = viewType;
    state.saveState();

    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.view-btn[data-view="${viewType}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Re-render with new view
    renderProjektOverview();

    // AI Feedback
    if (window.cfoDashboard.aiController) {
      window.cfoDashboard.aiController.addAIMessage({
        level: 'info',
        title: '👁️ Ansicht gewechselt',
        text: `${viewType.charAt(0).toUpperCase() + viewType.slice(1)}-Ansicht aktiviert.`,
        timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
      });
    }
  };

  // ==========================================
  // PROJECT STATISTICS
  // ==========================================

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
window.openProjektDetail = async function(projektId) {
  console.log('📂 Opening projekt detail:', projektId);
  
  const projekt = state.getProjekt(projektId);
  if (!projekt) {
    console.error('Projekt not found:', projektId);
    return;
  }

  console.log('📂 Opening projekt:', projekt.name);

  // Set current projekt
  window.cfoDashboard.currentProjekt = projektId;
  state.currentProjekt = projektId;
  state.projektViewMode = 'detail';  // 🆕 NEU HINZUGEFÜGT

  // Load artikel for this projekt
  await api.loadArticles(projektId);

  // 🔴 KRITISCHE ÄNDERUNG START
  // ERST: Alle anderen Haupt-Tabs ausblenden
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
    content.classList.remove('active');
  });
  
  // DANN: Nur den Projekte-Tab zeigen
  const projekteTab = document.getElementById('tab-projekte');
  if (projekteTab) {
    projekteTab.style.display = 'block';
    projekteTab.classList.add('active');
  }
  
  // Tab-Button aktivieren (falls nicht schon aktiv)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const projekteBtn = document.querySelector('[onclick="switchTab(\'projekte\')"]');
  if (projekteBtn) {
    projekteBtn.classList.add('active');
  }
  // 🔴 KRITISCHE ÄNDERUNG ENDE
  
  // INNERHALB des Projekte-Tabs: projekt-overview ausblenden, artikel-overview zeigen
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
  renderArtikelListByProjekt();  // 🆕 Kein "if" mehr nötig

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
      const projektDetail = document.getElementById('projekt-detail-view');
      const artikelOverview = document.getElementById('artikel-overview');
      const artikelDetail = document.getElementById('artikel-detail-view');

      // Show only projekt overview
      if (projektOverview) projektOverview.style.display = 'block';
      if (projektDetail) projektDetail.style.display = 'none';
      if (artikelOverview) artikelOverview.style.display = 'none';
      if (artikelDetail) artikelDetail.style.display = 'none';

      // ✓ CRITICAL: Clear ALL deep navigation state
      window.cfoDashboard.currentProjekt = null;
      window.cfoDashboard.currentArtikel = null;
      
      window.state.currentProjekt = null;
      window.state.projektViewMode = 'overview';
      window.state.currentProjektTab = null;
      window.state.currentArtikel = null;
      window.state.artikelViewMode = 'list';
      window.state.artikelDetailScroll = 0;
      window.state.saveState();
      
      console.log('💾 Cleared all navigation state - back to overview');

      // Re-render projekt list
      if (window.renderProjektOverview) {
          window.renderProjektOverview();
      }
      if (window.updateProjektStats) {
          window.updateProjektStats();
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
            
            <div class="form-group">
              <label>Division *</label>
              <select id="new-projekt-division" onchange="window.checkCustomDivision(this)">
                <option value="Entwicklung">Entwicklung</option>
                <option value="Produktion">Produktion</option>
                <option value="Vertrieb">Vertrieb</option>
                <option value="Service">Service</option>
                <option value="Innovation">Innovation</option>
                <option value="Consulting">Consulting</option>
                <option value="Automation">Automation</option>
                <option value="Digitalization">Digitalization</option>
                <option value="custom">➕ Andere (manuell eingeben)...</option>
              </select>
              <input type="text" id="new-projekt-division-custom" 
                    placeholder="Division eingeben..." 
                    style="display: none; margin-top: 8px; width: 100%; padding: 8px; 
                            border: 1px solid var(--border); border-radius: 4px;">
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
  }

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

        // 🆕 ALBO Event: Projekt aktualisiert
        document.dispatchEvent(new CustomEvent('projekt-updated', {
          detail: {
            projektId: projektId,
            updates: updates
          }
        }));

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

      // 🆕 ALBO Event: Projekt gelöscht
      document.dispatchEvent(new CustomEvent('projekt-deleted', {
        detail: {
          projektId: projektId,
          projektName: projektName
        }
      }));

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

    const rows = document.querySelectorAll('.projekt-row, .projekt-card, .projekt-kompakt-item');

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
    
    // Get all projekte and sort
    const projekte = state.getAllProjekte();
    
    projekte.sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'start':
          return new Date(a.startDatum || '2099-12-31') - new Date(b.startDatum || '2099-12-31');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'owner':
          return (a.owner || '').localeCompare(b.owner || '');
        default:
          return 0;
      }
    });

    // Re-render with sorted data
    renderProjektOverview();
  };

  /**
   * Update filtered stats
   */
  function updateFilteredStats() {
    const visibleItems = document.querySelectorAll('.projekt-row:not([style*="display: none"]), .projekt-card:not([style*="display: none"]), .projekt-kompakt-item:not([style*="display: none"])');

    let aktiv = 0, onHold = 0, abgeschlossen = 0;

    visibleItems.forEach(item => {
      const projekt = state.getProjekt(item.dataset.projektId);
      if (!projekt) return;

      const status = projekt.status?.toLowerCase() || '';
      if (status === 'aktiv') aktiv++;
      else if (status.includes('hold')) onHold++;
      else if (status === 'abgeschlossen') abgeschlossen++;
    });

    const total = visibleItems.length;

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
    const selectAll = document.getElementById('select-all-projects');
    if (selectAll) selectAll.checked = false;

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
      const selectAll = document.getElementById('select-all-projects');
      if (selectAll) selectAll.checked = false;

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
  // CUSTOM DIVISION HANDLER
  // ==========================================

  /**
   * Check if custom division input should be shown
   */
  window.checkCustomDivision = function(select) {
    const customInput = document.getElementById('new-projekt-division-custom');
    if (!customInput) return;
    
    if (select.value === 'custom') {
      customInput.style.display = 'block';
      customInput.focus();
    } else {
      customInput.style.display = 'none';
      customInput.value = '';
    }
  };

  // ==========================================
  // EXPORTS
  // ==========================================

  export default {
    renderProjektOverview,
    updateProjektStats
  };
