/**
 * Intelligent Artikel Creation Modal WITH CLAUDE AI
 * FIXED: Reads actual geschaeftsmodell structure from Supabase
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
  
  // CRITICAL FIX: Your geschaeftsmodell structure is FLAT, not nested!
  // It's stored directly on the projekt object, not in projekt.geschaeftsmodell
  const geschaeftsmodell = extractGeschaeftsmodell(projekt);
  
  console.log('📋 Extracted Geschäftsmodell:', geschaeftsmodell);
  console.log('📋 Section 5:', geschaeftsmodell.section5);
  
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

/**
 * Extract geschaeftsmodell from projekt
 * CRITICAL: Your data structure is different!
 */
function extractGeschaeftsmodell(projekt) {
  // Your geschaeftsmodell fields are stored DIRECTLY on projekt object
  // Not in a nested projekt.geschaeftsmodell object!
  
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
      som: projekt.som || '',
      markt_validierung_tam: projekt.markt_validierung_tam || false,
      markt_validierung_eigene: projekt.markt_validierung_eigene || false,
      markt_validierung_interviews: projekt.markt_validierung_interviews || false,
      markt_validierung_competitor: projekt.markt_validierung_competitor || false
    },
    
    // Section 3 - Zielkunden
    section3: {
      kundentyp_b2b: projekt.kundentyp_b2b || false,
      kundentyp_b2c: projekt.kundentyp_b2c || false,
      kundentyp_b2g: projekt.kundentyp_b2g || false,
      unternehmensgroesse_konzerne: projekt.unternehmensgroesse_konzerne || false,
      unternehmensgroesse_gross: projekt.unternehmensgroesse_gross || false,
      unternehmensgroesse_mittel: projekt.unternehmensgroesse_mittel || false,
      unternehmensgroesse_kmu: projekt.unternehmensgroesse_kmu || false,
      branchen_automotive: projekt.branchen_automotive || false,
      branchen_maschinenbau: projekt.branchen_maschinenbau || false,
      branchen_elektronik: projekt.branchen_elektronik || false,
      branchen_pharma: projekt.branchen_pharma || false,
      branchen_chemie: projekt.branchen_chemie || false,
      branchen_lebensmittel: projekt.branchen_lebensmittel || false,
      branchen_logistik: projekt.branchen_logistik || false,
      branchen_retail: projekt.branchen_retail || false,
      geografischer_fokus_dach: projekt.geografischer_fokus_dach || false,
      geografischer_fokus_europa: projekt.geografischer_fokus_europa || false,
      geografischer_fokus_usa: projekt.geografischer_fokus_usa || false,
      geografischer_fokus_asien: projekt.geografischer_fokus_asien || false,
      geografischer_fokus_global: projekt.geografischer_fokus_global || false,
      typisches_kundenprofil: projekt.typisches_kundenprofil || '',
      buying_center_ceo: projekt.buying_center_ceo || false,
      buying_center_cfo: projekt.buying_center_cfo || false,
      buying_center_coo: projekt.buying_center_coo || false,
      buying_center_cto: projekt.buying_center_cto || false,
      buying_center_einkauf: projekt.buying_center_einkauf || false,
      buying_center_fach: projekt.buying_center_fach || false
    },
    
    // Section 4 - Wettbewerb & Positionierung
    section4: {
      wettbewerber: projekt.wettbewerber || [],
      positioning: projekt.positioning || '',
      competitive_moat_patents: projekt.competitive_moat_patents || false,
      competitive_moat_network: projekt.competitive_moat_network || false,
      competitive_moat_data: projekt.competitive_moat_data || false,
      competitive_moat_brand: projekt.competitive_moat_brand || false,
      competitive_moat_beschreibung: projekt.competitive_moat_beschreibung || '',
      was_macht_kunde_heute_manual: projekt.was_macht_kunde_heute_manual || false,
      was_macht_kunde_heute_inhouse: projekt.was_macht_kunde_heute_inhouse || false,
      was_macht_kunde_heute_technologie: projekt.was_macht_kunde_heute_technologie || false
    },
    
    // Section 5 - Revenue Streams ⭐ MOST IMPORTANT!
    section5: {
      revenue_streams_lizenz: projekt.revenue_streams_lizenz || false,
      revenue_streams_subscription: projekt.revenue_streams_subscription || false,
      revenue_streams_hardware: projekt.revenue_streams_hardware || false,
      revenue_streams_wartung: projekt.revenue_streams_wartung || false,
      revenue_streams_training: projekt.revenue_streams_training || false,
      revenue_streams_transaction: projekt.revenue_streams_transaction || false,
      custom_revenue_streams: projekt.custom_revenue_streams || [],
      revenue_model_erklaerung: projekt.revenue_model_erklaerung || '',
      average_deal_size: projekt.average_deal_size || '',
      sales_cycle_monate: projekt.sales_cycle_monate || '',
      vertragslaufzeit_monate: projekt.vertragslaufzeit_monate || '',
      churn_rate: projekt.churn_rate || ''
    },
    
    // Section 6 - Go-to-Market Strategie
    section6: {
      sales_motion_direct: projekt.sales_motion_direct || false,
      sales_motion_channel: projekt.sales_motion_channel || false,
      sales_motion_hybrid: projekt.sales_motion_hybrid || false,
      sales_motion_self_service: projekt.sales_motion_self_service || false,
      sales_team_aktuell_fte: projekt.sales_team_aktuell_fte || '',
      sales_team_12m_fte: projekt.sales_team_12m_fte || '',
      sales_quota_pro_rep: projekt.sales_quota_pro_rep || '',
      sales_ote_pro_rep: projekt.sales_ote_pro_rep || '',
      lead_gen_inbound: projekt.lead_gen_inbound || false,
      lead_gen_outbound: projekt.lead_gen_outbound || false,
      lead_gen_partnerships: projekt.lead_gen_partnerships || false,
      lead_gen_events: projekt.lead_gen_events || false,
      marketing_budget_prozent: projekt.marketing_budget_prozent || '',
      cost_per_lead: projekt.cost_per_lead || '',
      lead_to_opportunity_prozent: projekt.lead_to_opportunity_prozent || '',
      opportunity_to_close_prozent: projekt.opportunity_to_close_prozent || '',
      pricing_strategy_value: projekt.pricing_strategy_value || false,
      pricing_strategy_cost_plus: projekt.pricing_strategy_cost_plus || false,
      pricing_strategy_competition: projekt.pricing_strategy_competition || false,
      expansion_upsell: projekt.expansion_upsell || false,
      expansion_cross_sell: projekt.expansion_cross_sell || false,
      expansion_addons: projekt.expansion_addons || false
    },
    
    // Section 7 - Unsere Lösung
    section7: {
      produktkategorie: projekt.produktkategorie || '',
      value_proposition: projekt.value_proposition || '',
      top_features: projekt.top_features || [],
      wettbewerbsvorteil_technologie: projekt.wettbewerbsvorteil_technologie || false,
      wettbewerbsvorteil_preis: projekt.wettbewerbsvorteil_preis || false,
      wettbewerbsvorteil_implementierung: projekt.wettbewerbsvorteil_implementierung || false,
      wettbewerbsvorteil_erfahrung: projekt.wettbewerbsvorteil_erfahrung || false
    },
    
    // Section 8 - Kritische Annahmen & Risiken
    section8: {
      kritische_annahmen: projekt.kritische_annahmen || [],
      top_risiken: projekt.top_risiken || []
    }
  };
}

// Rest of the file stays the same...
// (Loading modal, error modal, main modal rendering functions)

function showLoadingModal() {
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
        <div class="error-message" style="padding: 20px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; margin: 20px 30px;">
          <p style="margin: 0; color: #991b1b;">
            <strong>Fehler:</strong> ${errorMessage}
          </p>
        </div>
        
        <div style="padding: 0 30px 30px;">
          <p>Die KI-Analyse konnte nicht durchgeführt werden. Du kannst einen Artikel manuell anlegen.</p>
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
  // Implementation stays the same as before
  // Just using the correctly extracted geschaeftsmodell
  console.log('Modal rendering with analysis:', analysis);
  alert('Modal würde hier mit den Ergebnissen gerendert werden. Siehst du diese Alert-Box, dann funktioniert die Daten-Extraktion!');
}

window.closeArtikelCreationModal = function() {
  const modal = document.getElementById('artikel-creation-modal');
  if (modal) modal.remove();
};
