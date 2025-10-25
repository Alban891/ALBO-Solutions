/**
 * Intelligent Artikel Creation Modal WITH CLAUDE AI
 * Analyzes complete business model and provides intelligent suggestions
 */

import { analyzeGeschaeftsmodellWithClaude } from './artikel-ai-complete.js';
import { state } from '../../state.js';
import * as api from '../../api.js';

// ==========================================
// MAIN ENTRY POINT
// ==========================================

/**
 * Open artikel creation modal with Claude AI analysis
 */
export async function openArtikelCreationModal(projektId) {
  console.log('🤖 Opening intelligent artikel creation modal...');
  console.log('projektId:', projektId);
  
  // Get projekt
  const projekt = window.cfoDashboard?.projektData?.[projektId];
  
  if (!projekt) {
    console.error('❌ Projekt not found:', projektId);
    alert('Projekt nicht gefunden!');
    return;
  }
  
  console.log('✅ Projekt found:', projekt.name);
  
  const geschaeftsmodell = projekt.geschaeftsmodell || {};
  console.log('Geschäftsmodell:', geschaeftsmodell);
  
  // Show loading modal first
  showLoadingModal();
  
  try {
    // Call Claude AI for intelligent analysis
    console.log('🤖 Starting Claude AI analysis...');
    const analysis = await analyzeGeschaeftsmodellWithClaude(geschaeftsmodell);
    
    console.log('✅ Analysis complete:', analysis);
    
    // Show modal with results
    showArtikelModal(projektId, geschaeftsmodell, analysis);
    
  } catch (error) {
    console.error('❌ Error in AI analysis:', error);
    
    // Show error and offer manual creation
    showErrorModal(projektId, error.message);
  }
}

// ==========================================
// LOADING MODAL
// ==========================================

function showLoadingModal() {
  // Remove existing modal
  const existing = document.getElementById('artikel-creation-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'artikel-creation-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-container">
      <div class="modal-body" style="text-align: center; padding: 60px 40px;">
        <div class="loading-spinner" style="margin: 0 auto 30px;">
          <div class="spinner"></div>
        </div>
        <h3 style="margin: 0 0 15px; color: #1f2937;">🤖 KI analysiert dein Geschäftsmodell...</h3>
        <p style="margin: 0; color: #6b7280;">
          Claude liest alle Sections und schlägt intelligente Artikel vor.<br>
          Dies dauert 5-10 Sekunden.
        </p>
      </div>
    </div>
    
    <style>
      .loading-spinner {
        width: 60px;
        height: 60px;
        position: relative;
      }
      
      .spinner {
        width: 100%;
        height: 100%;
        border: 4px solid #e5e7eb;
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  
  document.body.appendChild(modal);
}

// ==========================================
// ERROR MODAL
// ==========================================

function showErrorModal(projektId, errorMessage) {
  const modal = document.getElementById('artikel-creation-modal');
  if (!modal) return;
  
  modal.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title">
          <span class="modal-icon">⚠️</span>
          <h2>KI-Analyse fehlgeschlagen</h2>
        </div>
        <button class="modal-close" onclick="closeArtikelCreationModal()">×</button>
      </div>
      
      <div class="modal-body">
        <div class="error-message" style="padding: 20px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #991b1b;">
            <strong>Fehler:</strong> ${errorMessage}
          </p>
        </div>
        
        <p>Die KI-Analyse konnte nicht durchgeführt werden. Du kannst einen Artikel manuell anlegen:</p>
        
        ${renderManualTab(projektId)}
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeArtikelCreationModal()">
          Abbrechen
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// MAIN MODAL WITH RESULTS
// ==========================================

function showArtikelModal(projektId, geschaeftsmodell, analysis) {
  console.log('🎨 Rendering modal with analysis...');
  
  // Remove loading modal
  const existing = document.getElementById('artikel-creation-modal');
  if (existing) existing.remove();
  
  // Store analysis globally for later use
  window.currentArtikelAnalysis = analysis;
  
  const modal = document.createElement('div');
  modal.id = 'artikel-creation-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-container large">
      <div class="modal-header">
        <div class="modal-title">
          <span class="modal-icon">🤖</span>
          <h2>KI-Powered Artikel-Erstellung</h2>
        </div>
        <button class="modal-close" onclick="closeArtikelCreationModal()">×</button>
      </div>
      
      <!-- AI Summary Banner -->
      ${renderAISummary(analysis)}
      
      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-button active" data-tab="ai-suggestions">
          ⚡ KI-Vorschläge (${analysis.suggested_articles?.length || 0})
        </button>
        <button class="tab-button" data-tab="manual">
          ✏️ Manuell
        </button>
      </div>
      
      <!-- Tab Contents -->
      <div class="modal-body">
        
        <!-- AI SUGGESTIONS TAB -->
        <div class="tab-content active" id="tab-ai-suggestions">
          ${renderAISuggestionsTab(analysis)}
        </div>
        
        <!-- MANUAL TAB -->
        <div class="tab-content" id="tab-manual">
          ${renderManualTab(projektId)}
        </div>
        
      </div>
      
      <!-- Footer -->
      <div class="modal-footer">
        <div class="footer-info">
          <span id="selected-count">0 Artikel ausgewählt</span>
        </div>
        <div class="footer-actions">
          <button class="btn btn-secondary" onclick="closeArtikelCreationModal()">
            Abbrechen
          </button>
          <button class="btn btn-primary" onclick="createSelectedArtikel('${projektId}')">
            <span class="btn-icon">🚀</span>
            <span id="create-btn-text">0 Artikel anlegen</span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Setup interactions
  setupTabSwitching();
  setupArticleSelection();
  
  console.log('✅ Modal rendered');
}

// ==========================================
// AI SUMMARY BANNER
// ==========================================

function renderAISummary(analysis) {
  if (!analysis.analysis_summary) return '';
  
  const fallbackWarning = analysis.fallback_used ? `
    <div class="warning-badge" style="display: inline-block; padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 12px; font-size: 13px; margin-left: 10px;">
      ⚠️ Regelbasierte Analyse (Claude API nicht verfügbar)
    </div>
  ` : '';
  
  return `
    <div class="ai-summary-banner" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; margin: -1px -1px 0; border-radius: 12px 12px 0 0;">
      <div style="display: flex; align-items: start; gap: 15px;">
        <div style="font-size: 32px;">🤖</div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Claude AI Analyse</h3>
            ${fallbackWarning}
          </div>
          <p style="margin: 0; opacity: 0.95; line-height: 1.6;">
            ${analysis.analysis_summary}
          </p>
          <div style="margin-top: 12px; display: flex; gap: 20px; font-size: 14px; opacity: 0.9;">
            <div>📊 ${analysis.total_articles || 0} Artikel vorgeschlagen</div>
            <div>🎯 Ø ${Math.round((analysis.confidence_score || 0) * 100)}% Confidence</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// AI SUGGESTIONS TAB
// ==========================================

function renderAISuggestionsTab(analysis) {
  const suggestions = analysis.suggested_articles || [];
  
  if (suggestions.length === 0) {
    return `
      <div class="empty-state" style="padding: 60px 40px; text-align: center;">
        <div class="empty-icon" style="font-size: 64px; margin-bottom: 20px;">📋</div>
        <h3 style="margin: 0 0 10px; color: #1f2937;">Keine Vorschläge generiert</h3>
        <p style="margin: 0 0 30px; color: #6b7280;">
          Die KI konnte keine Artikel aus dem Geschäftsmodell ableiten.<br>
          Bitte fülle mehr Sections aus oder erstelle einen Artikel manuell.
        </p>
        <button class="btn btn-secondary" onclick="document.querySelector('[data-tab=\\'manual\\']')?.click()">
          Manuell erstellen →
        </button>
      </div>
    `;
  }
  
  return `
    <div class="suggestions-container">
      <div class="suggestions-header" style="padding: 20px 30px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 8px; font-size: 18px; color: #1f2937;">
          🎯 Intelligente Artikel-Vorschläge
        </h3>
        <p style="margin: 0; color: #6b7280;">
          Claude hat dein gesamtes Geschäftsmodell analysiert und diese Artikel vorgeschlagen. 
          Wähle aus, welche du anlegen möchtest:
        </p>
      </div>
      
      <div class="suggestions-list" style="padding: 20px 30px; max-height: 500px; overflow-y: auto;">
        ${suggestions.map((artikel, index) => renderSuggestionCard(artikel, index)).join('')}
      </div>
      
      <div class="suggestions-footer" style="padding: 15px 30px; border-top: 1px solid #e5e7eb; display: flex; gap: 15px;">
        <button class="btn btn-text" onclick="selectAllSuggestions(true)">
          ✓ Alle auswählen
        </button>
        <button class="btn btn-text" onclick="selectAllSuggestions(false)">
          ✗ Auswahl aufheben
        </button>
      </div>
    </div>
  `;
}

function renderSuggestionCard(artikel, index) {
  const confidenceBadge = getConfidenceBadge(artikel.confidence);
  const priorityEmoji = getPriorityEmoji(artikel.priority);
  const isAutoSelected = artikel.confidence >= 0.85 && artikel.priority <= 3;
  
  return `
    <div class="suggestion-card" style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 15px; background: white; transition: all 0.2s;">
      <div class="suggestion-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
        <label class="checkbox-label" style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1;">
          <input type="checkbox" 
                 class="artikel-checkbox" 
                 data-index="${index}"
                 ${isAutoSelected ? 'checked' : ''}
                 style="width: 20px; height: 20px; cursor: pointer;">
          <div>
            <div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">
              ${priorityEmoji} ${artikel.name}
            </div>
            <div style="font-size: 13px; color: #6b7280;">
              ${artikel.typ} • ${formatSource(artikel.source)}
            </div>
          </div>
        </label>
        ${confidenceBadge}
      </div>
      
      <div class="suggestion-reasoning" style="padding: 15px; background: #f9fafb; border-radius: 8px; margin-bottom: 15px;">
        <div style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">
          💡 Begründung:
        </div>
        <div style="font-size: 14px; color: #4b5563; line-height: 1.6;">
          ${artikel.reasoning}
        </div>
      </div>
      
      <div class="suggestion-values" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
        <div class="value-item" style="padding: 12px; background: #f9fafb; border-radius: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Start-Menge</div>
          <div style="font-size: 16px; font-weight: 600; color: #1f2937;">
            ${artikel.suggested_values.start_menge} Einheiten
          </div>
        </div>
        <div class="value-item" style="padding: 12px; background: #f9fafb; border-radius: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Start-Preis</div>
          <div style="font-size: 16px; font-weight: 600; color: #059669;">
            ${formatCurrency(artikel.suggested_values.start_preis)}
          </div>
        </div>
        <div class="value-item" style="padding: 12px; background: #f9fafb; border-radius: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Herstellkosten</div>
          <div style="font-size: 16px; font-weight: 600; color: #dc2626;">
            ${formatCurrency(artikel.suggested_values.start_hk)}
          </div>
        </div>
        <div class="value-item" style="padding: 12px; background: #f9fafb; border-radius: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">DB2 Marge</div>
          <div style="font-size: 16px; font-weight: 600; color: #2563eb;">
            ${calculateMargin(artikel.suggested_values.start_preis, artikel.suggested_values.start_hk)}%
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// MANUAL TAB
// ==========================================

function renderManualTab(projektId) {
  return `
    <div class="manual-form" style="padding: 30px;">
      <div class="form-section" style="margin-bottom: 30px;">
        <h3 style="margin: 0 0 8px; font-size: 18px; color: #1f2937;">✏️ Artikel manuell erstellen</h3>
        <p style="margin: 0; color: #6b7280;">
          Erstelle einen einzelnen Artikel mit individuellen Werten.
        </p>
      </div>
      
      <div class="form-grid" style="display: grid; gap: 20px;">
        <div class="form-group">
          <label class="form-label" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
            Artikel-Bezeichnung *
            <span style="font-weight: 400; color: #6b7280; font-size: 13px;">
              z.B. Smart Sensor System
            </span>
          </label>
          <input 
            type="text" 
            class="form-input" 
            id="manual-name"
            placeholder="z.B. Smart Sensor System"
            style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"
            required>
        </div>
        
        <div class="form-group">
          <label class="form-label" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
            Typ *
          </label>
          <select class="form-select" id="manual-typ" required style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
            <option value="">-- Bitte wählen --</option>
            <option value="Neu-Produkt">Neu-Produkt</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Service">Service / Wartung</option>
            <option value="Consulting">Consulting / Training</option>
            <option value="License">Lizenz</option>
            <option value="Subscription">Subscription</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
            Release-Datum *
          </label>
          <input 
            type="month" 
            class="form-input" 
            id="manual-release"
            value="2025-10"
            style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"
            required>
        </div>
      </div>
      
      <div class="form-actions" style="margin-top: 30px;">
        <button class="btn btn-primary" onclick="createManualArtikel('${projektId}')" style="padding: 12px 24px; font-size: 15px;">
          <span class="btn-icon">➕</span>
          Artikel anlegen
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getConfidenceBadge(confidence) {
  const percentage = Math.round(confidence * 100);
  
  let color, icon;
  if (confidence >= 0.9) {
    color = '#059669';
    icon = '🎯';
  } else if (confidence >= 0.75) {
    color = '#2563eb';
    icon = '✓';
  } else {
    color = '#f59e0b';
    icon = '~';
  }
  
  return `
    <div style="padding: 6px 14px; background: ${color}22; color: ${color}; border-radius: 20px; font-size: 13px; font-weight: 600; white-space: nowrap;">
      ${icon} ${percentage}% sicher
    </div>
  `;
}

function getPriorityEmoji(priority) {
  if (priority === 1) return '⭐';
  if (priority === 2) return '🔷';
  if (priority === 3) return '🔸';
  return '•';
}

function formatSource(source) {
  const sourceMap = {
    'section5-checkbox': 'Section 5 Checkbox',
    'section5-text': 'Section 5 Text',
    'section1-product': 'Section 1 Produkt',
    'ai-inferred': 'KI-Ableitung',
    'inferred': 'Logische Ableitung'
  };
  return sourceMap[source] || source;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function calculateMargin(preis, hk) {
  if (!preis || preis === 0) return 0;
  return Math.round(((preis - hk) / preis) * 100);
}

// ==========================================
// INTERACTION HANDLERS
// ==========================================

function setupTabSwitching() {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = 'tab-' + btn.dataset.tab;
      document.getElementById(tabId)?.classList.add('active');
    });
  });
}

function setupArticleSelection() {
  document.querySelectorAll('.artikel-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', updateSelectedCount);
  });
  updateSelectedCount();
}

function updateSelectedCount() {
  const checkboxes = document.querySelectorAll('.artikel-checkbox');
  const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
  
  const countEl = document.getElementById('selected-count');
  const btnTextEl = document.getElementById('create-btn-text');
  
  if (countEl) countEl.textContent = `${checkedCount} Artikel ausgewählt`;
  if (btnTextEl) btnTextEl.textContent = `${checkedCount} Artikel anlegen`;
}

window.selectAllSuggestions = function(select) {
  document.querySelectorAll('.artikel-checkbox').forEach(cb => {
    cb.checked = select;
  });
  updateSelectedCount();
};

window.closeArtikelCreationModal = function() {
  const modal = document.getElementById('artikel-creation-modal');
  if (modal) modal.remove();
};

// ==========================================
// ARTIKEL CREATION
// ==========================================

window.createSelectedArtikel = async function(projektId) {
  const checkboxes = document.querySelectorAll('.artikel-checkbox:checked');
  
  if (checkboxes.length === 0) {
    alert('Bitte wähle mindestens einen Artikel aus!');
    return;
  }
  
  console.log(`Creating ${checkboxes.length} articles...`);
  
  const analysis = window.currentArtikelAnalysis;
  const articlesToCreate = Array.from(checkboxes).map(cb => {
    const index = parseInt(cb.dataset.index);
    return analysis.suggested_articles[index];
  });
  
  try {
    for (const artikel of articlesToCreate) {
      await createArtikelFromSuggestion(projektId, artikel);
    }
    
    window.closeArtikelCreationModal();
    window.location.reload();
    
  } catch (error) {
    console.error('Error creating articles:', error);
    alert('Fehler beim Erstellen der Artikel: ' + error.message);
  }
};

window.createManualArtikel = async function(projektId) {
  const name = document.getElementById('manual-name')?.value;
  const typ = document.getElementById('manual-typ')?.value;
  const release = document.getElementById('manual-release')?.value;
  
  if (!name || !typ || !release) {
    alert('Bitte fülle alle Pflichtfelder aus!');
    return;
  }
  
  try {
    const artikelData = {
      name: name,
      typ: typ,
      projektId: projektId,
      release: release,
      status: 'aktiv',
      volumes: {},
      prices: {},
      hk: 0
    };
    
    await api.saveArtikel(artikelData);
    
    window.closeArtikelCreationModal();
    window.location.reload();
    
  } catch (error) {
    console.error('Error creating manual article:', error);
    alert('Fehler beim Erstellen: ' + error.message);
  }
};

async function createArtikelFromSuggestion(projektId, suggestion) {
  const artikelData = {
    name: suggestion.name,
    typ: suggestion.typ,
    projektId: projektId,
    release: '2025-01',
    status: 'aktiv',
    volumes: {},
    prices: {},
    hk: suggestion.suggested_values.start_hk,
    mengen_modell: suggestion.suggested_values.mengen_modell,
    preis_modell: suggestion.suggested_values.preis_modell,
    kosten_modell: suggestion.suggested_values.kosten_modell
  };
  
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < suggestion.suggested_values.zeitraum; i++) {
    const year = currentYear + i;
    artikelData.volumes[year] = suggestion.suggested_values.start_menge;
    artikelData.prices[year] = suggestion.suggested_values.start_preis;
  }
  
  return await api.saveArtikel(artikelData);
}
