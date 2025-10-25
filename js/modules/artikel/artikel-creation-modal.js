/**
 * Intelligent Artikel Creation Modal WITH CLAUDE AI
 * PRODUCTION VERSION - Direct Supabase access for scalability
 * 
 * ARCHITECTURE:
 * - Always loads fresh data from Supabase (no cache issues)
 * - Scalable for future RAG integration
 * - Ready for vector database similarity search
 */

import { analyzeGeschaeftsmodellWithClaude } from './artikel-ai-complete.js';
import { state } from '../../state.js';
import * as api from '../../api.js';

// ==========================================
// MAIN ENTRY POINT
// ==========================================

/**
 * Open artikel creation modal with Claude AI analysis
 * Loads fresh data from Supabase for accurate analysis
 */
export async function openArtikelCreationModal(projektId) {
  console.log('🤖 Opening intelligent artikel creation modal...');
  console.log('projektId:', projektId);
  
  // Show loading modal
  showLoadingModal();
  
  try {
    // ✅ LOAD PROJECT DIRECTLY FROM SUPABASE
    // This ensures we always have the latest data
    // (Important for future RAG integration!)
    console.log('📊 Loading projekt from Supabase...');
    
    const projekt = await loadProjektFromDatabase(projektId);
    
    if (!projekt) {
      throw new Error('Projekt nicht gefunden in Datenbank');
    }
    
    console.log('✅ Projekt loaded:', projekt.name);
    
    // Extract geschaeftsmodell from projekt
    const geschaeftsmodell = extractGeschaeftsmodell(projekt);
    
    console.log('📋 Extracted Geschäftsmodell:', geschaeftsmodell);
    console.log('📋 Section 5:', geschaeftsmodell.section5);
    
    // ============================================
    // FUTURE: RAG INTEGRATION POINT
    // ============================================
    // const similarCases = await findSimilarCases(geschaeftsmodell);
    // const enrichedPrompt = enrichPromptWithRAG(geschaeftsmodell, similarCases);
    // const analysis = await analyzeWithClaude(enrichedPrompt);
    // ============================================
    
    // Call Claude AI for intelligent analysis
    console.log('🤖 Starting Claude AI analysis...');
    const analysis = await analyzeGeschaeftsmodellWithClaude(geschaeftsmodell);
    
    console.log('✅ Analysis complete:', analysis);
    
    // Show modal with results
    showArtikelModal(projektId, geschaeftsmodell, analysis);
    
  } catch (error) {
    console.error('❌ Error in modal:', error);
    showErrorModal(projektId, error.message);
  }
}

// ==========================================
// DATABASE ACCESS
// ==========================================

/**
 * Load projekt from Supabase with ALL fields
 * @param {string} projektId - Project ID
 * @returns {Promise<Object>} Complete project data
 */
async function loadProjektFromDatabase(projektId) {
  try {
    // Get Supabase client (initialized in api.js)
    const supabase = window.supabase;
    
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    // ✅ CLEAN UP PROJECT ID
    // Remove any prefix like "projekt-db-" to get pure UUID
    let cleanProjektId = projektId;
    if (projektId.includes('-db-')) {
      cleanProjektId = projektId.split('-db-')[1];
      console.log('🔧 Cleaned projekt ID:', projektId, '→', cleanProjektId);
    }
    
    console.log('🔍 Querying Supabase for projekt:', cleanProjektId);
    
    // Load projekt basic info
    const { data: projekt, error: projektError } = await supabase
      .from('ALBO_Projects')
      .select('*')
      .eq('id', cleanProjektId)
      .single();
    
    if (projektError) {
      console.error('❌ Projekt error:', projektError);
      throw new Error(`Fehler beim Laden des Projekts: ${projektError.message}`);
    }
    
    if (!projekt) {
      throw new Error('Projekt nicht gefunden');
    }
    
    console.log('✅ Projekt loaded:', projekt.name);
    
    // ✅ Load geschaeftsmodell data SEPARATELY using projekt_id
    const { data: gmData, error: gmError } = await supabase
      .from('geschaeftsmodell')
      .select('*')
      .eq('projekt_id', cleanProjektId)
      .maybeSingle();  // Use maybeSingle instead of single (allows null)
    
    if (gmError) {
      console.error('❌ Geschaeftsmodell error:', gmError);
      throw new Error(`Fehler beim Laden der Geschäftsmodell-Daten: ${gmError.message}`);
    }
    
    console.log('📊 Geschaeftsmodell data loaded:', gmData);
    console.log('📊 Revenue streams from DB:', gmData?.revenue_streams);
    console.log('📊 Custom streams from DB:', gmData?.custom_streams);
    console.log('📊 Revenue erklaerung:', gmData?.revenue_erklaerung?.substring(0, 100));
    
    // Merge both into one object
    const mergedData = { 
      ...projekt, 
      ...(gmData || {})  // Merge geschaeftsmodell fields into projekt
    };
    
    console.log('✅ Merged data ready for analysis');
    
    return mergedData;
    
  } catch (error) {
    console.error('❌ Error loading from database:', error);
    throw error;
  }
}

/**
 * Extract geschaeftsmodell from projekt data
 * Maps database fields to structured sections
 */
function extractGeschaeftsmodell(projekt) {
  // ✅ FIX: Handle revenue_streams as array instead of individual booleans
  const revenueStreamsArray = projekt.revenue_streams || [];
  const customStreamsArray = projekt.custom_streams || [];
  
  console.log('🔍 Raw revenue_streams from DB:', revenueStreamsArray);
  console.log('🔍 Raw custom_streams from DB:', customStreamsArray);
  
  return {
    // Section 1 - Kundenproblem & Kontext
    section1: {
      kundenproblem: projekt.kundenproblem || '',
      problemkosten: projekt.problemkosten || '',
      urgency: projekt.urgency || '',
      problemkosten_quantifiziert: projekt.problemkosten_quantifiziert || ''
    },
    
    // Section 2 - Marktgröße & Opportunity
    section2: {
      tam: projekt.tam || '',
      sam: projekt.sam || '',
      som: projekt.som || ''
    },
    
    // Section 3 - Zielkunden
    section3: {
      kundentyp_b2b: projekt.kundentyp_b2b || false,
      kundentyp_b2c: projekt.kundentyp_b2c || false,
      unternehmensgroesse_konzerne: projekt.unternehmensgroesse_konzerne || false,
      unternehmensgroesse_gross: projekt.unternehmensgroesse_gross || false,
      unternehmensgroesse_mittel: projekt.unternehmensgroesse_mittel || false,
      branchen_automotive: projekt.branchen_automotive || false,
      branchen_maschinenbau: projekt.branchen_maschinenbau || false,
      branchen_elektronik: projekt.branchen_elektronik || false,
      branchen_chemie: projekt.branchen_chemie || false,
      geografischer_fokus_dach: projekt.geografischer_fokus_dach || false,
      geografischer_fokus_europa: projekt.geografischer_fokus_europa || false,
      buying_center_ceo: projekt.buying_center_ceo || false,
      buying_center_coo: projekt.buying_center_coo || false
    },
    
    // Section 4 - Wettbewerb & Positionierung
    section4: {
      positioning: projekt.positioning || '',
      competitive_moat_patents: projekt.competitive_moat_patents || false,
      competitive_moat_brand: projekt.competitive_moat_brand || false
    },
    
    // Section 5 - Revenue Streams ⭐ MOST IMPORTANT!
    // ✅ FIX: Convert array to boolean flags
    section5: {
      revenue_streams_hardware: revenueStreamsArray.includes('hardware'),
      revenue_streams_wartung: revenueStreamsArray.includes('wartung'),
      revenue_streams_training: revenueStreamsArray.includes('training'),
      revenue_streams_lizenz: revenueStreamsArray.includes('lizenz'),
      revenue_streams_subscription: revenueStreamsArray.includes('subscription'),
      custom_revenue_streams: customStreamsArray,
      revenue_model_erklaerung: projekt.revenue_erklaerung || '',  // ✅ Different field name!
      average_deal_size: projekt.average_deal_size || '',
      sales_cycle_monate: projekt.sales_cycle_monate || '',
      vertragslaufzeit_monate: projekt.vertragslaufzeit_monate || ''
    },
    
    // Section 6 - Go-to-Market
    section6: {
      sales_motion_direct: projekt.sales_motion_direct || false,
      sales_motion_channel: projekt.sales_motion_channel || false,
      expansion_cross_sell: projekt.expansion_cross_sell || false
    },
    
    // Section 7 - Unsere Lösung
    section7: {
      produktkategorie: projekt.produktkategorie || '',
      value_proposition: projekt.value_proposition || '',
      top_features: projekt.top_features || []
    },
    
    // Section 8 - Kritische Annahmen
    section8: {
      kritische_annahmen: projekt.kritische_annahmen || []
    }
  };
}

// ==========================================
// FUTURE: RAG INTEGRATION PLACEHOLDER
// ==========================================

/**
 * Find similar cases in vector database (FUTURE)
 * 
 * @param {Object} geschaeftsmodell - Current business model
 * @returns {Promise<Array>} Similar cases
 */
async function findSimilarCases(geschaeftsmodell) {
  // TODO: Implement vector similarity search
  // 
  // 1. Create embedding of current geschaeftsmodell
  // const embedding = await createEmbedding(geschaeftsmodell);
  // 
  // 2. Query pgvector/Pinecone for similar cases
  // const { data } = await supabase.rpc('match_geschaeftsmodelle', {
  //   query_embedding: embedding,
  //   match_threshold: 0.8,
  //   match_count: 5
  // });
  // 
  // 3. Return enriched cases with artikel data
  // return data.map(case => ({
  //   projekt_name: case.name,
  //   similarity_score: case.similarity,
  //   artikel_created: case.artikel,
  //   success_metrics: case.metrics
  // }));
  
  return [];
}

/**
 * Enrich prompt with RAG context (FUTURE)
 */
function enrichPromptWithRAG(geschaeftsmodell, similarCases) {
  // TODO: Add similar cases to prompt
  // 
  // const ragContext = `
  // ÄHNLICHE CASES AUS DATENBANK:
  // ${similarCases.map(c => `
  //   - ${c.projekt_name} (${Math.round(c.similarity * 100)}% ähnlich)
  //     Artikel: ${c.artikel_created.length}
  //     Durchschnittlicher Deal: ${c.success_metrics.avg_deal_size}
  // `).join('\n')}
  // `;
  
  return geschaeftsmodell;
}

// ==========================================
// UI COMPONENTS (Same as before)
// ==========================================

function showLoadingModal() {
  const existing = document.getElementById('artikel-creation-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'artikel-creation-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-container">
      <div class="modal-body" style="text-align: center; padding: 60px 40px;">
        <div class="loading-spinner" style="margin: 0 auto 30px; width: 60px; height: 60px;">
          <div class="spinner" style="width: 100%; height: 100%; border: 4px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <h3 style="margin: 0 0 15px; color: #1f2937;">🤖 KI analysiert dein Geschäftsmodell...</h3>
        <p style="margin: 0; color: #6b7280;">
          Claude liest alle Sections aus der Datenbank<br>
          und schlägt intelligente Artikel vor.<br>
          Dies dauert 5-10 Sekunden.
        </p>
      </div>
    </div>
    
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  
  document.body.appendChild(modal);
}

function showErrorModal(projektId, errorMessage) {
  const modal = document.getElementById('artikel-creation-modal');
  if (!modal) return;
  
  modal.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title">
          <span class="modal-icon">⚠️</span>
          <h2>Fehler</h2>
        </div>
        <button class="modal-close" onclick="closeArtikelCreationModal()">×</button>
      </div>
      
      <div class="modal-body">
        <div style="padding: 20px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; margin: 20px;">
          <p style="margin: 0; color: #991b1b;">
            <strong>Fehler:</strong> ${errorMessage}
          </p>
        </div>
        
        <div style="padding: 0 30px 30px;">
          <p>Bitte versuche es erneut oder kontaktiere den Support.</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeArtikelCreationModal()">
          Schließen
        </button>
      </div>
    </div>
  `;
}

function showArtikelModal(projektId, geschaeftsmodell, analysis) {
  console.log('🎨 Rendering modal with analysis...');
  
  const existing = document.getElementById('artikel-creation-modal');
  if (existing) existing.remove();
  
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
      
      ${renderAISummary(analysis)}
      
      <div class="tabs">
        <button class="tab-button active" data-tab="ai-suggestions">
          ⚡ KI-Vorschläge (${analysis.suggested_articles?.length || 0})
        </button>
        <button class="tab-button" data-tab="manual">
          ✏️ Manuell
        </button>
      </div>
      
      <div class="modal-body">
        <div class="tab-content active" id="tab-ai-suggestions">
          ${renderAISuggestionsTab(analysis)}
        </div>
        
        <div class="tab-content" id="tab-manual">
          ${renderManualTab(projektId)}
        </div>
      </div>
      
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
  
  setupTabSwitching();
  setupArticleSelection();
  
  console.log('✅ Modal rendered');
}

// [Rest of the render functions - same as artikel-creation-modal-COMPLETE.js]
// (Copy all the render functions from the complete version)

function renderAISummary(analysis) {
  if (!analysis.analysis_summary) return '';
  
  const fallbackWarning = analysis.fallback_used ? `
    <div style="display: inline-block; padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 12px; font-size: 13px; margin-left: 10px;">
      ⚠️ Regelbasierte Analyse
    </div>
  ` : '';
  
  return `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px;">
      <div style="display: flex; gap: 15px;">
        <div style="font-size: 32px;">🤖</div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Claude AI Analyse</h3>
            ${fallbackWarning}
          </div>
          <p style="margin: 0; line-height: 1.6;">
            ${analysis.analysis_summary}
          </p>
          <div style="margin-top: 12px; display: flex; gap: 20px; font-size: 14px;">
            <div>📊 ${analysis.total_articles || 0} Artikel</div>
            <div>🎯 Ø ${Math.round((analysis.confidence_score || 0) * 100)}% Confidence</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAISuggestionsTab(analysis) {
  const suggestions = analysis.suggested_articles || [];
  
  if (suggestions.length === 0) {
    return `
      <div style="padding: 60px 40px; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 20px;">📋</div>
        <h3 style="margin: 0 0 10px;">Keine Vorschläge generiert</h3>
        <p style="margin: 0 0 30px; color: #6b7280;">
          Bitte fülle mehr Sections aus.
        </p>
      </div>
    `;
  }
  
  return `
    <div>
      <div style="padding: 20px 30px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 8px;">🎯 Intelligente Artikel-Vorschläge</h3>
        <p style="margin: 0; color: #6b7280;">
          Wähle aus, welche Artikel du anlegen möchtest:
        </p>
      </div>
      
      <div style="padding: 20px 30px; max-height: 500px; overflow-y: auto;">
        ${suggestions.map((artikel, index) => renderSuggestionCard(artikel, index)).join('')}
      </div>
      
      <div style="padding: 15px 30px; border-top: 1px solid #e5e7eb; display: flex; gap: 15px;">
        <button class="btn btn-text" onclick="selectAllSuggestions(true)">✓ Alle auswählen</button>
        <button class="btn btn-text" onclick="selectAllSuggestions(false)">✗ Abwählen</button>
      </div>
    </div>
  `;
}

function renderSuggestionCard(artikel, index) {
  const confidenceBadge = getConfidenceBadge(artikel.confidence);
  const priorityEmoji = getPriorityEmoji(artikel.priority);
  const isAutoSelected = artikel.confidence >= 0.85 && artikel.priority <= 3;
  
  return `
    <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1;">
          <input type="checkbox" class="artikel-checkbox" data-index="${index}" ${isAutoSelected ? 'checked' : ''}>
          <div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${priorityEmoji} ${artikel.name}
            </div>
            <div style="font-size: 13px; color: #6b7280;">
              ${artikel.typ}
            </div>
          </div>
        </label>
        ${confidenceBadge}
      </div>
      
      <div style="padding: 15px; background: #f9fafb; border-radius: 8px; margin-bottom: 15px;">
        <div style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">
          💡 Begründung:
        </div>
        <div style="font-size: 14px; color: #4b5563; line-height: 1.6;">
          ${artikel.reasoning}
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
        <div style="padding: 12px; background: #f9fafb; border-radius: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Start-Menge</div>
          <div style="font-size: 16px; font-weight: 600;">
            ${artikel.suggested_values.start_menge} Einheiten
          </div>
        </div>
        <div style="padding: 12px; background: #f9fafb; border-radius: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Start-Preis</div>
          <div style="font-size: 16px; font-weight: 600; color: #059669;">
            ${formatCurrency(artikel.suggested_values.start_preis)}
          </div>
        </div>
        <div style="padding: 12px; background: #f9fafb; border-radius: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Herstellkosten</div>
          <div style="font-size: 16px; font-weight: 600; color: #dc2626;">
            ${formatCurrency(artikel.suggested_values.start_hk)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderManualTab(projektId) {
  return `
    <div style="padding: 30px;">
      <h3 style="margin: 0 0 20px;">✏️ Artikel manuell anlegen</h3>
      
      <div style="display: grid; gap: 20px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Name *</label>
          <input type="text" id="manual-name" placeholder="z.B. Premium Roboter System" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Typ *</label>
          <select id="manual-typ" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px;">
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Service">Service</option>
          </select>
        </div>
        
        <button class="btn btn-primary" onclick="createManualArtikel('${projektId}')">
          ➕ Artikel anlegen
        </button>
      </div>
    </div>
  `;
}

function getConfidenceBadge(confidence) {
  const percentage = Math.round(confidence * 100);
  let color = confidence >= 0.9 ? '#059669' : confidence >= 0.75 ? '#2563eb' : '#f59e0b';
  let icon = confidence >= 0.9 ? '🎯' : confidence >= 0.75 ? '✓' : '~';
  
  return `
    <div style="padding: 6px 14px; background: ${color}22; color: ${color}; border-radius: 20px; font-size: 13px; font-weight: 600;">
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

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(value);
}

function setupTabSwitching() {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab)?.classList.add('active');
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
  const checkedCount = document.querySelectorAll('.artikel-checkbox:checked').length;
  
  const countEl = document.getElementById('selected-count');
  const btnTextEl = document.getElementById('create-btn-text');
  
  if (countEl) countEl.textContent = `${checkedCount} Artikel ausgewählt`;
  if (btnTextEl) btnTextEl.textContent = `${checkedCount} Artikel anlegen`;
}

window.selectAllSuggestions = function(select) {
  document.querySelectorAll('.artikel-checkbox').forEach(cb => cb.checked = select);
  updateSelectedCount();
};

window.closeArtikelCreationModal = function() {
  const modal = document.getElementById('artikel-creation-modal');
  if (modal) modal.remove();
};

window.createSelectedArtikel = async function(projektId) {
  const checkboxes = document.querySelectorAll('.artikel-checkbox:checked');
  
  if (checkboxes.length === 0) {
    alert('Bitte wähle mindestens einen Artikel aus!');
    return;
  }
  
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
    console.error('Error:', error);
    alert('Fehler: ' + error.message);
  }
};

window.createManualArtikel = async function(projektId) {
  const name = document.getElementById('manual-name')?.value;
  const typ = document.getElementById('manual-typ')?.value;
  
  if (!name || !typ) {
    alert('Bitte fülle alle Felder aus!');
    return;
  }
  
  try {
    await api.saveArtikel({
      name: name,
      typ: typ,
      projektId: projektId,
      release: '2025-01',
      status: 'aktiv',
      volumes: {},
      prices: {},
      hk: 0
    });
    
    window.closeArtikelCreationModal();
    window.location.reload();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Fehler: ' + error.message);
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
    hk: suggestion.suggested_values.start_hk
  };
  
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    const year = currentYear + i;
    artikelData.volumes[year] = suggestion.suggested_values.start_menge;
    artikelData.prices[year] = suggestion.suggested_values.start_preis;
  }
  
  return await api.saveArtikel(artikelData);
}
