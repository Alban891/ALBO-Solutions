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
import { saveArticle } from '../../api.js';  // ✅ BACK TO STATIC IMPORT!
import { openPackageEditor } from './package-editor.js';

// ==========================================
// MAIN ENTRY POINT
// ==========================================

/**
 * Open artikel creation modal with user choice
 */
export async function openArtikelCreationModal(projektId) {
  console.log('🤖 Opening artikel creation modal...');
  console.log('projektId:', projektId);
  
  // Show choice modal first
  showChoiceModal(projektId);
}

/**
 * Show choice modal: AI Analysis vs Manual Creation
 */
function showChoiceModal(projektId) {
  console.log('🎯 showChoiceModal received projektId:', projektId);
  console.log('   Type:', typeof projektId);
  console.log('   Has prefix?', projektId?.includes?.('projekt-db-'));
  
  const existing = document.getElementById('artikel-creation-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'artikel-creation-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title">
          <span class="modal-icon">📦</span>
          <h2>Neuer Artikel</h2>
        </div>
        <button class="modal-close" onclick="closeArtikelCreationModal()">×</button>
      </div>
      
      <div class="modal-body" style="padding: 40px 30px;">
        <h3 style="margin: 0 0 20px; text-align: center; color: #1f2937;">
          Wie möchtest du vorgehen?
        </h3>
        
        <!-- AI Option -->
        <div class="choice-card" onclick="startAIAnalysis('${projektId}')" style="
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 20px;
          cursor: pointer;
          transition: all 0.2s;
          background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%);
        " onmouseover="this.style.borderColor='#667eea'; this.style.transform='translateY(-2px)'" 
           onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'">
          <div style="display: flex; align-items: start; gap: 20px;">
            <div style="font-size: 48px;">🤖</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 10px; font-size: 18px; color: #1f2937;">
                KI-gestützte Analyse
              </h4>
              <p style="margin: 0 0 15px; color: #6b7280; line-height: 1.6;">
                Claude analysiert dein komplettes Geschäftsmodell und schlägt passende Artikel vor.
              </p>
              <div style="display: flex; gap: 15px; font-size: 13px; color: #6b7280;">
                <div>⏱️ 5-10 Sekunden</div>
                <div>🎯 Intelligente Vorschläge</div>
                <div>📊 Mit Begründungen</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Manual Option -->
        <div class="choice-card" onclick="startManualCreation('${projektId}')" style="
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 30px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        " onmouseover="this.style.borderColor='#2563eb'; this.style.transform='translateY(-2px)'" 
           onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'">
          <div style="display: flex; align-items: start; gap: 20px;">
            <div style="font-size: 48px;">✏️</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 10px; font-size: 18px; color: #1f2937;">
                Manuell anlegen
              </h4>
              <p style="margin: 0 0 15px; color: #6b7280; line-height: 1.6;">
                Erstelle einen Artikel direkt mit deinen eigenen Eingaben.
              </p>
              <div style="display: flex; gap: 15px; font-size: 13px; color: #6b7280;">
                <div>⚡ Sofort</div>
                <div>🎨 Volle Kontrolle</div>
                <div>📝 Einfach</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeArtikelCreationModal()">
          Abbrechen
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

/**
 * Start AI Analysis (original flow)
 */
window.startAIAnalysis = async function(projektId) {
  console.log('🤖 User chose AI analysis');
  
  showLoadingModal();
  
  try {
    const projekt = await loadProjektFromDatabase(projektId);
    
    if (!projekt) {
      throw new Error('Projekt nicht gefunden in Datenbank');
    }
    
    console.log('✅ Projekt loaded:', projekt.name);
    
    const geschaeftsmodell = extractGeschaeftsmodell(projekt);
    
    console.log('📋 Extracted Geschäftsmodell:', geschaeftsmodell);
    console.log('📋 Section 5:', geschaeftsmodell.section5);
    
    console.log('🤖 Starting Claude AI analysis...');
    const analysis = await analyzeGeschaeftsmodellWithClaude(geschaeftsmodell);
    
    console.log('✅ Analysis complete:', analysis);
    
    showArtikelModal(projektId, geschaeftsmodell, analysis);
    
  } catch (error) {
    console.error('❌ Error in AI analysis:', error);
    showErrorModal(projektId, error.message);
  }
};

/**
 * Start Manual Creation (skip AI)
 */
window.startManualCreation = function(projektId) {
  console.log('✏️ User chose manual creation');
  
  const existing = document.getElementById('artikel-creation-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'artikel-creation-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title">
          <span class="modal-icon">✏️</span>
          <h2>Artikel manuell anlegen</h2>
        </div>
        <button class="modal-close" onclick="closeArtikelCreationModal()">×</button>
      </div>
      
      <div class="modal-body">
        ${renderManualTab(projektId)}
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeArtikelCreationModal()">
          Abbrechen
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

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
  // Store projektId for later use
  window.currentProjektId = projektId;
  
  setTimeout(() => {
    // Add event listeners after render
    document.querySelectorAll('.artikel-type-option').forEach(option => {
      option.addEventListener('click', function() {
        const type = this.getAttribute('data-type');
        selectArtikelTypeManual(type);
      });
    });
  }, 100);
  
  return `
    <div style="padding: 30px;">
      <h3 style="margin: 0 0 20px;">✏️ Artikel manuell anlegen</h3>
      
      <!-- SCHRITT 1: ARTIKEL-TYP -->
      <div id="artikel-type-selection" style="margin-bottom: 30px;">
        <label style="display: block; margin-bottom: 12px; font-weight: 600; font-size: 15px;">
          Schritt 1: Artikel-Typ wählen
        </label>
        <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
          Wähle den passenden Typ für deinen Artikel
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          
          <!-- Standard -->
          <div class="artikel-type-option" data-type="standard" style="
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
          ">
            <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
            <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">Standard</div>
            <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
              Ein Produkt, ein Revenue Stream
            </div>
          </div>
          
          <!-- Hybrid -->
          <div class="artikel-type-option" data-type="hybrid" style="
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
          ">
            <div style="font-size: 32px; margin-bottom: 8px;">🔀</div>
            <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">Hybrid</div>
            <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
              Mehrere Revenue Streams
            </div>
          </div>
          
          <!-- Package -->
          <div class="artikel-type-option" data-type="package" style="
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
          ">
            <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
            <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">Package</div>
            <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
              Varianten (S/M/L, Basic/Pro)
            </div>
          </div>
          
        </div>
      </div>
      
      <!-- SCHRITT 2: ARTIKEL DETAILS -->
      <div id="artikel-details-section" style="display: none;">
        <label style="display: block; margin-bottom: 12px; font-weight: 600; font-size: 15px;">
          Schritt 2: Artikel Details
        </label>
        
        <!-- Hidden field for artikel_mode -->
        <input type="hidden" id="manual-artikel-mode" value="standard">
        
        <!-- Dynamic content based on type -->
        <div id="artikel-details-content">
          <!-- Will be filled by selectArtikelTypeManual() -->
        </div>
      </div>
    </div>
    
    <style>
      .artikel-type-option:hover {
        border-color: #3b82f6 !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
      }
      
      .artikel-type-option.selected {
        border-color: #2563eb !important;
        background: #eff6ff !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
      
      .revenue-stream-checkbox {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
      }
      
      .revenue-stream-checkbox:hover {
        border-color: #d1d5db;
        background: #f9fafb;
      }
    </style>
  `;
}

/**
 * Select Artikel Type and show form
 */
function selectArtikelTypeManual(type) {
  console.log('🎯 User selected artikel type:', type);
  
  // Update visual selection
  document.querySelectorAll('.artikel-type-option').forEach(option => {
    option.classList.remove('selected');
    option.style.borderColor = '#e5e7eb';
    option.style.background = 'white';
  });
  
  const selectedOption = document.querySelector(`.artikel-type-option[data-type="${type}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
    selectedOption.style.borderColor = '#2563eb';
    selectedOption.style.background = '#eff6ff';
  }
  
  // Store selected type
  const hiddenField = document.getElementById('manual-artikel-mode');
  if (hiddenField) {
    hiddenField.value = type;
  }
  
  // Show details section
  const detailsSection = document.getElementById('artikel-details-section');
  if (detailsSection) {
    detailsSection.style.display = 'block';
  }
  
  // Render type-specific content
  const contentDiv = document.getElementById('artikel-details-content');
  if (contentDiv) {
    if (type === 'standard') {
      contentDiv.innerHTML = renderStandardArtikelForm();
    } else if (type === 'hybrid') {
      contentDiv.innerHTML = renderHybridArtikelForm();
    } else if (type === 'package') {
      contentDiv.innerHTML = renderPackageArtikelForm();
    }
  }
  
  // Scroll to details
  setTimeout(() => {
    detailsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

/**
 * Reset selection and go back to type selection
 */
window.resetArtikelTypeSelection = function() {
  console.log('🔙 Reset artikel type selection');
  
  // Hide details section
  const detailsSection = document.getElementById('artikel-details-section');
  if (detailsSection) {
    detailsSection.style.display = 'none';
  }
  
  // Clear selection
  document.querySelectorAll('.artikel-type-option').forEach(option => {
    option.classList.remove('selected');
    option.style.borderColor = '#e5e7eb';
    option.style.background = 'white';
  });
  
  // Scroll to top
  const typeSelection = document.getElementById('artikel-type-selection');
  if (typeSelection) {
    typeSelection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Standard Artikel Form
 */
function renderStandardArtikelForm() {
  const projektId = window.currentProjektId || '';
  
  return `
    <div style="display: grid; gap: 24px;">
      
      <!-- Name -->
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Artikel-Name *</label>
        <input 
          type="text" 
          id="manual-name" 
          placeholder="z.B. WAGO SR-3000 Roboter" 
          style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;"
        >
      </div>
      
      <!-- Kategorie -->
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Kategorie *</label>
        <select 
          id="manual-typ" 
          onchange="toggleCustomKategorie(this.value)"
          style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;"
        >
          <option value="">-- Bitte wählen --</option>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Service">Service</option>
          <option value="Consulting">Consulting</option>
          <option value="Subscription">Subscription</option>
          <option value="License">License</option>
          <option value="custom">➕ Eigene Kategorie</option>
        </select>
        
        <input 
          type="text" 
          id="manual-typ-custom" 
          placeholder="Eigene Kategorie eingeben..." 
          style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px; margin-top: 12px; display: none;"
        >
      </div>
      
      <!-- Artikel-Strategie -->
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Artikel-Strategie *</label>
        <div style="display: grid; gap: 12px;">
          
          <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer;">
            <input type="radio" name="artikel-strategie" value="neu-produkt" checked style="width: 18px; height: 18px;">
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 2px;">Neu-Produkt</div>
              <div style="font-size: 13px; color: #6b7280;">Neues Produkt für neuen Markt</div>
            </div>
          </label>
          
          <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer;">
            <input type="radio" name="artikel-strategie" value="kannibalisierung" style="width: 18px; height: 18px;">
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 2px;">Kannibalisierung</div>
              <div style="font-size: 13px; color: #6b7280;">Ersetzt bestehendes Produkt</div>
            </div>
          </label>
          
          <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer;">
            <input type="radio" name="artikel-strategie" value="cross-selling" style="width: 18px; height: 18px;">
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 2px;">Cross-Selling</div>
              <div style="font-size: 13px; color: #6b7280;">Ergänzung zu bestehendem Produkt</div>
            </div>
          </label>
          
        </div>
      </div>
      
      <!-- Info Box -->
      <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 16px;">
        <div style="display: flex; gap: 12px; align-items: start;">
          <div style="font-size: 20px;">💡</div>
          <div style="font-size: 14px; color: #1e40af; line-height: 1.6;">
            <strong>Hinweis:</strong> Preise, Mengen und Modelle konfigurierst du später im Wirtschaftlichkeits-Tab.
          </div>
        </div>
      </div>
      
      <!-- Buttons -->
      <div style="display: flex; gap: 12px;">
        <button 
          class="btn btn-secondary" 
          onclick="resetArtikelTypeSelection()"
          style="padding: 14px 24px; font-size: 16px;"
        >
          ← Zurück
        </button>
        <button 
          class="btn btn-primary" 
          onclick="createManualArtikel('${projektId}')"
          style="flex: 1; padding: 14px; font-size: 16px;"
        >
          ✓ Artikel anlegen
        </button>
      </div>
      
    </div>
  `;
}

/**
 * Hybrid Artikel Form
 */
function renderHybridArtikelForm() {
  const projektId = window.currentProjektId || '';
  
  return `
    <div style="display: grid; gap: 24px;">
      
      <!-- Name -->
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Artikel-Name *</label>
        <input 
          type="text" 
          id="manual-name" 
          placeholder="z.B. Software-Lösung mit Support" 
          style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;"
        >
      </div>
      
      <!-- Basis-Kategorie -->
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Basis-Kategorie *</label>
        <select 
          id="manual-typ" 
          onchange="toggleCustomKategorie(this.value)"
          style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;"
        >
          <option value="">-- Bitte wählen --</option>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Service">Service</option>
          <option value="Consulting">Consulting</option>
          <option value="custom">➕ Eigene Kategorie</option>
        </select>
        
        <input 
          type="text" 
          id="manual-typ-custom" 
          placeholder="Eigene Kategorie..." 
          style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px; margin-top: 12px; display: none;"
        >
      </div>
      
      <!-- Revenue Streams -->
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Revenue Streams * (mehrere möglich)</label>
        <p style="margin: 0 0 12px; font-size: 13px; color: #6b7280;">
          Welche Umsatzströme hat dieser Artikel?
        </p>
        
        <div style="display: grid; gap: 10px;">
          
          <label class="revenue-stream-checkbox">
            <input type="checkbox" name="revenue-stream" value="one-time" style="width: 18px; height: 18px;">
            <div style="flex: 1;">
              <div style="font-weight: 500;">One-Time Sale</div>
              <div style="font-size: 12px; color: #6b7280;">Einmaliger Verkauf</div>
            </div>
          </label>
          
          <label class="revenue-stream-checkbox">
            <input type="checkbox" name="revenue-stream" value="subscription" style="width: 18px; height: 18px;">
            <div style="flex: 1;">
              <div style="font-weight: 500;">Subscription</div>
              <div style="font-size: 12px; color: #6b7280;">Wiederkehrend</div>
            </div>
          </label>
          
          <label class="revenue-stream-checkbox">
            <input type="checkbox" name="revenue-stream" value="service" style="width: 18px; height: 18px;">
            <div style="flex: 1;">
              <div style="font-weight: 500;">Service/Wartung</div>
              <div style="font-size: 12px; color: #6b7280;">Laufender Support</div>
            </div>
          </label>
          
          <label class="revenue-stream-checkbox">
            <input type="checkbox" name="revenue-stream" value="consulting" style="width: 18px; height: 18px;">
            <div style="flex: 1;">
              <div style="font-weight: 500;">Consulting/Training</div>
              <div style="font-size: 12px; color: #6b7280;">Beratung und Schulungen</div>
            </div>
          </label>
          
        </div>
      </div>
      
      <!-- Artikel-Strategie -->
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Artikel-Strategie *</label>
        <div style="display: grid; gap: 12px;">
          
          <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer;">
            <input type="radio" name="artikel-strategie" value="neu-produkt" checked style="width: 18px; height: 18px;">
            <div style="flex: 1;">
              <div style="font-weight: 600;">Neu-Produkt</div>
            </div>
          </label>
          
          <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer;">
            <input type="radio" name="artikel-strategie" value="kannibalisierung" style="width: 18px; height: 18px;">
            <div style="flex: 1;">
              <div style="font-weight: 600;">Kannibalisierung</div>
            </div>
          </label>
          
          <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer;">
            <input type="radio" name="artikel-strategie" value="cross-selling" style="width: 18px; height: 18px;">
            <div style="flex: 1;">
              <div style="font-weight: 600;">Cross-Selling</div>
            </div>
          </label>
          
        </div>
      </div>
      
      <!-- Info Box -->
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px;">
        <div style="display: flex; gap: 12px; align-items: start;">
          <div style="font-size: 20px;">💡</div>
          <div style="font-size: 14px; color: #92400e; line-height: 1.6;">
            <strong>Hybrid-Artikel:</strong> Mehrere Revenue Streams werden als separate Komponenten gespeichert.
          </div>
        </div>
      </div>
      
      <!-- Buttons -->
      <div style="display: flex; gap: 12px;">
        <button 
          class="btn btn-secondary" 
          onclick="resetArtikelTypeSelection()"
          style="padding: 14px 24px; font-size: 16px;"
        >
          ← Zurück
        </button>
        <button 
          class="btn btn-primary" 
          onclick="createManualArtikel('${projektId}')"
          style="flex: 1; padding: 14px; font-size: 16px;"
        >
          ✓ Artikel anlegen
        </button>
      </div>
      
    </div>
  `;
}

/**
 * Package Artikel Form - SIMPLIFIED
 * Only ask for Package Name (umbrella term like project name)
 */
function renderPackageArtikelForm() {
  const projektId = window.currentProjektId || '';
  
  // Try to get project name as default
  const projektName = window.state?.currentProjekt?.name || '';
  
  return `
    <div style="display: grid; gap: 24px;">
      
      <!-- Package Name (Oberbegriff) -->
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Package-Bezeichnung *</label>
        <input 
          type="text" 
          id="manual-name" 
          value="${projektName}"
          placeholder="z.B. Cyber Security Consulting" 
          style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;"
        >
        <div style="margin-top: 6px; font-size: 13px; color: #6b7280;">
          💡 Dies ist der Oberbegriff für alle Pakete (z.B. Projektname). Die einzelnen Pakete (S/M/L) definierst du im nächsten Schritt.
        </div>
      </div>
      
      <!-- Hidden Kategorie (wird automatisch gesetzt) -->
      <input type="hidden" id="manual-typ" value="Package">
      
      <!-- Info Box -->
      <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px;">
        <div style="display: flex; gap: 12px; align-items: start;">
          <div style="font-size: 32px;">📦</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 8px; color: #1e40af;">Package-Editor</div>
            <div style="font-size: 14px; color: #1e40af; line-height: 1.6; margin-bottom: 12px;">
              Im nächsten Schritt öffnet sich der Package-Editor, wo du:
            </div>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af; line-height: 1.8; font-size: 14px;">
              <li>Anzahl der Pakete festlegst (z.B. 3: Small, Medium, Large)</li>
              <li>Komponenten pro Paket definierst</li>
              <li>Pricing & Customer Journey konfigurierst</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Buttons -->
      <div style="display: flex; gap: 12px;">
        <button 
          class="btn btn-secondary" 
          onclick="resetArtikelTypeSelection()"
          style="padding: 14px 24px; font-size: 16px;"
        >
          ← Zurück
        </button>
        <button 
          class="btn btn-primary" 
          onclick="createManualArtikel('${projektId}')"
          style="flex: 1; padding: 14px; font-size: 16px;"
        >
          📦 Package-Editor öffnen →
        </button>
      </div>
      
    </div>
  `;
}

/**
 * Toggle Custom Kategorie Input
 */
window.toggleCustomKategorie = function(value) {
  const customInput = document.getElementById('manual-typ-custom');
  if (customInput) {
    customInput.style.display = value === 'custom' ? 'block' : 'none';
    if (value === 'custom') {
      customInput.focus();
    }
  }
};

window.selectArtikelTypeManual = function(type) {
  console.log('🎯 User selected artikel type:', type);
  
  // Update visual selection
  document.querySelectorAll('.artikel-type-option').forEach(option => {
    option.classList.remove('selected');
  });
  document.querySelector(`.artikel-type-option[data-type="${type}"]`)?.classList.add('selected');
  
  // Store selected type
  const hiddenField = document.getElementById('manual-artikel-mode');
  if (hiddenField) {
    hiddenField.value = type;
  }
  
  // Show details section
  const detailsSection = document.getElementById('artikel-details-section');
  if (detailsSection) {
    detailsSection.style.display = 'block';
    
    // Smooth scroll to details
    detailsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  // Log for debugging
  console.log('  ✅ Type stored:', type);
  console.log('  ✅ Details section shown');
};

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
  
  console.log(`📦 Creating ${checkboxes.length} articles...`);
  
  // ✅ CREATE PERSISTENT LOG
  window.artikelCreationLog = [];
  const log = (msg) => {
    console.log(msg);
    window.artikelCreationLog.push(msg);
    localStorage.setItem('lastArtikelCreationLog', JSON.stringify(window.artikelCreationLog));
  };
  
  log(`📦 Creating ${checkboxes.length} articles...`);
  
  const analysis = window.currentArtikelAnalysis;
  const articlesToCreate = Array.from(checkboxes).map(cb => {
    const index = parseInt(cb.dataset.index);
    return analysis.suggested_articles[index];
  });
  
  log('📋 Articles to create: ' + articlesToCreate.map(a => a.name).join(', '));
  
  // Show progress
  const button = document.querySelector('#create-btn-text');
  const originalText = button?.textContent;
  if (button) button.textContent = 'Erstelle Artikel...';
  
  try {
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < articlesToCreate.length; i++) {
      const artikel = articlesToCreate[i];
      log(`\n📝 Creating article ${i+1}/${articlesToCreate.length}: ${artikel.name}`);
      
      try {
        const result = await createArtikelFromSuggestion(projektId, artikel);
        log(`✅ Article created: ${result ? result.name : 'null returned'}`);
        successCount++;
        
        if (button) button.textContent = `${successCount}/${articlesToCreate.length} erstellt...`;
      } catch (error) {
        log(`❌ Failed to create "${artikel.name}": ${error.message}`);
        log(`   Stack: ${error.stack}`);
        failCount++;
      }
    }
    
    log(`\n📊 Summary: ${successCount} success, ${failCount} failed`);
    
    if (failCount > 0) {
      alert(`⚠️ ${successCount} Artikel erstellt, ${failCount} fehlgeschlagen.\n\nNach Reload: Gib in Console ein:\nJSON.parse(localStorage.getItem('lastArtikelCreationLog'))`);
    } else {
      log('✅ All articles created successfully!');
    }
    
    // Close and reload
    window.closeArtikelCreationModal();
    
    // Wait a bit before reload to ensure DB is updated
    setTimeout(() => {
      log('🔄 Reloading page...');
      window.location.reload();
    }, 500);
    
  } catch (error) {
    log(`❌ Error in createSelectedArtikel: ${error.message}`);
    alert('Fehler beim Erstellen der Artikel: ' + error.message);
    if (button) button.textContent = originalText;
  }
};

window.createManualArtikel = async function(projektId) {
  const name = document.getElementById('manual-name')?.value;
  const typ = document.getElementById('manual-typ')?.value;
  const artikelMode = document.getElementById('manual-artikel-mode')?.value;  // ← NEU!
  
  if (!name || !typ) {
    alert('Bitte fülle alle Felder aus!');
    return;
  }
  
  // ✅ CHECK FOR PACKAGE MODE
  if (artikelMode === 'package') {
    console.log('📦 Opening Package Editor...');
    
    // Close current modal
    closeArtikelCreationModal();
    
    // Open package editor with initial data
    openPackageEditor(projektId, {
      artikel_name: name,
      artikel_typ: typ
    });
    
    return;  // ← STOP HERE, Package Editor takes over
  }
  
  // Clean projekt ID
  let cleanProjektId = projektId;
  if (typeof projektId === 'string' && projektId.includes('projekt-db-')) {
    cleanProjektId = projektId.replace('projekt-db-', '');
  }
  
  console.log('✏️ Creating manual article');
  console.log('  projektId (with prefix):', projektId);
  console.log('  projekt_id (clean):', cleanProjektId);
  console.log('  name:', name);
  console.log('  typ:', typ);
  
  try {
    const artikelData = {
      name: name,
      typ: typ,
      projektId: projektId,  // ✅ For validation (with prefix!)
      projekt_id: cleanProjektId,  // ✅ For database (without prefix!)
      release_datum: '2025-01',
      volumes: {},
      prices: {},
      hk: 0,
      start_menge: 0,
      start_preis: 0,
      start_hk: 0
    };
    
    console.log('  💾 Calling saveArticle...');
    
    // ✅ USE STATIC IMPORT (imported at top of file)
    const result = await saveArticle(artikelData);
    
    console.log('  ✅ Article created:', result);
    
    window.closeArtikelCreationModal();
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
    
  } catch (error) {
    console.error('  ❌ Error:', error);
    alert('Fehler: ' + error.message);
  }
};

async function createArtikelFromSuggestion(projektId, suggestion) {
  console.log('📝 createArtikelFromSuggestion called');
  console.log('  projektId (raw):', projektId);
  console.log('  suggestion:', suggestion);
  
  // Clean projekt ID - but check if it's already a UUID first!
  let cleanProjektId = projektId;
  
  // If it has 'projekt-db-' prefix, remove it
  if (typeof projektId === 'string' && projektId.includes('projekt-db-')) {
    cleanProjektId = projektId.replace('projekt-db-', '');
    console.log('  🔧 Removed prefix: projekt-db-xxx → ', cleanProjektId);
  } 
  // If it already looks like a UUID, use as-is
  else if (typeof projektId === 'string' && projektId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    console.log('  ✅ Already a valid UUID:', cleanProjektId);
  }
  // Otherwise it might be wrong format
  else {
    console.warn('  ⚠️ Unexpected projektId format:', projektId);
  }
  
  const artikelData = {
    name: suggestion.name,
    typ: suggestion.typ,
    projektId: projektId,  // ✅ For validation (with prefix!)
    projekt_id: cleanProjektId,  // ✅ For database (without prefix!)
    release_datum: '2025-01',
    volumes: {},
    prices: {},
    hk: suggestion.suggested_values?.start_hk || 0,
    start_menge: suggestion.suggested_values?.start_menge || 0,
    start_preis: suggestion.suggested_values?.start_preis || 0,
    start_hk: suggestion.suggested_values?.start_hk || 0,
    mengen_modell: suggestion.suggested_values?.mengen_modell,
    preis_modell: suggestion.suggested_values?.preis_modell,
    kosten_modell: suggestion.suggested_values?.kosten_modell,
    zeitraum: suggestion.suggested_values?.zeitraum || 5
  };
  
  // Set volumes and prices for each year
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < (artikelData.zeitraum || 5); i++) {
    const year = currentYear + i;
    artikelData.volumes[year] = suggestion.suggested_values?.start_menge || 0;
    artikelData.prices[year] = suggestion.suggested_values?.start_preis || 0;
  }
  
  console.log('  📋 Artikel data prepared:');
  console.log('    projektId (for validation):', artikelData.projektId);
  console.log('    projekt_id (for DB):', artikelData.projekt_id);
  console.log('    name:', artikelData.name);
  console.log('    typ:', artikelData.typ);
  
  try {
    // ✅ USE STATIC IMPORT (imported at top of file)
    console.log('  💾 Calling saveArticle...');
    const result = await saveArticle(artikelData);
    console.log('  ✅ saveArticle returned:', result);
    
    return result;
  } catch (error) {
    console.error('  ❌ Error in createArtikelFromSuggestion:', error);
    console.error('  Stack:', error.stack);
    throw error;
  }
}
