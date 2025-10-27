/**
 * COMPACT SIDEBAR - Artikel-Liste
 * Kleinere Schrift, weniger Padding, kompaktes Design
 */

/* ==========================================
   SIDEBAR CONTAINER
   ========================================== */

.artikel-sidebar-compact {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  height: 100vh;
}

/* ==========================================
   HEADER
   ========================================== */

.sidebar-header-compact {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.sidebar-title-compact {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.sidebar-subtitle-compact {
  margin: 0;
  font-size: 11px;
  color: #6b7280;
}

/* ==========================================
   ARTIKEL LISTE
   ========================================== */

.artikel-list-compact {
  padding: 8px;
}

.artikel-item-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.artikel-item-compact:hover {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.artikel-item-compact.active {
  background: #eff6ff;
  border-color: #3b82f6;
}

/* ==========================================
   ARTIKEL ICON
   ========================================== */

.artikel-icon-compact {
  font-size: 16px;
  flex-shrink: 0;
}

/* ==========================================
   ARTIKEL INFO
   ========================================== */

.artikel-info-compact {
  flex: 1;
  min-width: 0;
}

.artikel-name-compact {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 2px;
}

.artikel-type-compact {
  font-size: 10px;
  color: #6b7280;
  margin: 0;
}

/* ==========================================
   MULTI-MODE CHECKBOX
   ========================================== */

.artikel-checkbox-compact {
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

/* ==========================================
   MULTI-MODE BUTTON
   ========================================== */

.multi-toggle-compact {
  display: flex;
  justify-content: center;
  padding: 8px;
  border-top: 1px solid #e5e7eb;
}

.btn-multi-compact {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-multi-compact:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.btn-multi-compact.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* ==========================================
   SELECTED BADGE
   ========================================== */

.selected-badge-compact {
  display: inline-block;
  padding: 4px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
}

/* ==========================================
   ACTIONS
   ========================================== */

.sidebar-actions-compact {
  padding: 8px;
  border-top: 1px solid #e5e7eb;
}

.btn-action-compact {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.btn-action-compact:last-child {
  margin-bottom: 0;
}

.btn-action-compact:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.btn-action-primary-compact {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.btn-action-primary-compact:hover {
  background: #1d4ed8;
}

/* ==========================================
   SCROLL STYLING
   ========================================== */

.artikel-list-compact::-webkit-scrollbar {
  width: 6px;
}

.artikel-list-compact::-webkit-scrollbar-track {
  background: #f9fafb;
}

.artikel-list-compact::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.artikel-list-compact::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* ==========================================
   FOCUS STATES (Accessibility)
   ========================================== */

.artikel-item-compact:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.btn-multi-compact:focus,
.btn-action-compact:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* ==========================================
   LOADING STATE
   ========================================== */

.artikel-list-loading {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 12px;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==========================================
   EMPTY STATE
   ========================================== */

.artikel-list-empty {
  padding: 32px 16px;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px;
}

.empty-subtitle {
  font-size: 11px;
  color: #6b7280;
  margin: 0;
}

/* ==========================================
   STATUS BADGES
   ========================================== */

.artikel-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-left: 4px;
}

.badge-new {
  background: #dbeafe;
  color: #1e40af;
}

.badge-draft {
  background: #fef3c7;
  color: #92400e;
}

.badge-active {
  background: #dcfce7;
  color: #166534;
}

.badge-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

/* ==========================================
   ARTIKEL COUNT
   ========================================== */

.artikel-count {
  display: inline-block;
  padding: 2px 6px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  margin-left: auto;
}

/* ==========================================
   DIVIDER
   ========================================== */

.artikel-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 12px;
}

.artikel-divider-label {
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ==========================================
   RESPONSIVE
   ========================================== */

@media (max-width: 1024px) {
  .artikel-sidebar-compact {
    width: 200px;
  }
  
  .artikel-name-compact {
    font-size: 11px;
  }
  
  .artikel-badge {
    display: none; /* Hide badges on smaller screens */
  }
}

@media (max-width: 768px) {
  .artikel-sidebar-compact {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .artikel-list-compact {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
  }
  
  .artikel-type-compact {
    display: none; /* Hide type label on mobile */
  }
}

/* ==========================================
   EXAMPLE HTML STRUCTURES
   ========================================== */

/*
===========================================
EXAMPLE 1: BASIC SIDEBAR
===========================================

<div class="artikel-sidebar-compact">
  <!-- Header -->
  <div class="sidebar-header-compact">
    <h3 class="sidebar-title-compact">
      📦 Artikel-Filter
      <span class="artikel-count">8</span>
    </h3>
    <p class="sidebar-subtitle-compact">Wählen Sie einen Artikel</p>
  </div>
  
  <!-- Multi-Mode Toggle -->
  <div class="multi-toggle-compact">
    <button class="btn-multi-compact" onclick="toggleMultiMode()">
      ☐ Multi
      <span class="selected-badge-compact" style="display: none;">0 ausgewählt</span>
    </button>
  </div>
  
  <!-- Artikel Liste -->
  <div class="artikel-list-compact">
    <!-- Item with Badge -->
    <div class="artikel-item-compact active" onclick="selectArtikel('artikel-1')">
      <span class="artikel-icon-compact">📦</span>
      <div class="artikel-info-compact">
        <p class="artikel-name-compact">
          Maschine 1
          <span class="artikel-badge badge-new">Neu</span>
        </p>
        <p class="artikel-type-compact">Hardware</p>
      </div>
    </div>
    
    <!-- Item with Status -->
    <div class="artikel-item-compact" onclick="selectArtikel('artikel-2')">
      <span class="artikel-icon-compact">💿</span>
      <div class="artikel-info-compact">
        <p class="artikel-name-compact">
          BMS Software
          <span class="artikel-badge badge-active">Aktiv</span>
        </p>
        <p class="artikel-type-compact">Software</p>
      </div>
    </div>
    
    <!-- Divider with Label -->
    <div class="artikel-divider-label">Archive</div>
    
    <!-- Inactive Item -->
    <div class="artikel-item-compact" onclick="selectArtikel('artikel-3')">
      <span class="artikel-icon-compact">📊</span>
      <div class="artikel-info-compact">
        <p class="artikel-name-compact">
          Old Package
          <span class="artikel-badge badge-inactive">Inaktiv</span>
        </p>
        <p class="artikel-type-compact">Package</p>
      </div>
    </div>
  </div>
  
  <!-- Actions -->
  <div class="sidebar-actions-compact">
    <button class="btn-action-compact btn-action-primary-compact">
      📊 Kombiniert planen
    </button>
  </div>
</div>

===========================================
EXAMPLE 2: LOADING STATE
===========================================

<div class="artikel-sidebar-compact">
  <div class="sidebar-header-compact">
    <h3 class="sidebar-title-compact">📦 Artikel-Filter</h3>
  </div>
  
  <div class="artikel-list-loading">
    <div class="loading-spinner"></div>
    <p>Artikel werden geladen...</p>
  </div>
</div>

===========================================
EXAMPLE 3: EMPTY STATE
===========================================

<div class="artikel-sidebar-compact">
  <div class="sidebar-header-compact">
    <h3 class="sidebar-title-compact">📦 Artikel-Filter</h3>
  </div>
  
  <div class="artikel-list-empty">
    <div class="empty-icon">📦</div>
    <p class="empty-title">Keine Artikel vorhanden</p>
    <p class="empty-subtitle">Erstellen Sie einen neuen Artikel</p>
  </div>
  
  <div class="sidebar-actions-compact">
    <button class="btn-action-compact btn-action-primary-compact">
      ➕ Artikel erstellen
    </button>
  </div>
</div>

===========================================
EXAMPLE 4: MULTI-MODE WITH CHECKBOXES
===========================================

<div class="artikel-sidebar-compact">
  <div class="sidebar-header-compact">
    <h3 class="sidebar-title-compact">📦 Artikel-Filter</h3>
  </div>
  
  <div class="multi-toggle-compact">
    <button class="btn-multi-compact active" onclick="toggleMultiMode()">
      ☑ Multi
      <span class="selected-badge-compact">3 ausgewählt</span>
    </button>
  </div>
  
  <div class="artikel-list-compact">
    <div class="artikel-item-compact active">
      <input type="checkbox" class="artikel-checkbox-compact" checked>
      <span class="artikel-icon-compact">📦</span>
      <div class="artikel-info-compact">
        <p class="artikel-name-compact">Maschine 1</p>
        <p class="artikel-type-compact">Hardware</p>
      </div>
    </div>
    
    <div class="artikel-item-compact active">
      <input type="checkbox" class="artikel-checkbox-compact" checked>
      <span class="artikel-icon-compact">💿</span>
      <div class="artikel-info-compact">
        <p class="artikel-name-compact">BMS Software</p>
        <p class="artikel-type-compact">Software</p>
      </div>
    </div>
    
    <div class="artikel-item-compact">
      <input type="checkbox" class="artikel-checkbox-compact">
      <span class="artikel-icon-compact">📊</span>
      <div class="artikel-info-compact">
        <p class="artikel-name-compact">Cyber Premium</p>
        <p class="artikel-type-compact">Package</p>
      </div>
    </div>
  </div>
  
  <div class="sidebar-actions-compact">
    <button class="btn-action-compact btn-action-primary-compact">
      📊 3 Artikel kombiniert planen
    </button>
  </div>
</div>
*/
