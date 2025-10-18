/**
 * Form Handler
 * Handles form data collection, validation, progress tracking
 */

import { state } from '../../state.js';

// ==========================================
// DATA COLLECTION
// ==========================================

/**
 * Collect all form data or specific section data
 */
export function collectFormData(sectionNumber = null) {
  const form = document.getElementById('geschaeftsmodell-form');
  if (!form) return {};

  if (sectionNumber) {
    return collectSectionData(sectionNumber);
  }

  // Collect all sections
  const data = {};
  for (let i = 1; i <= 8; i++) {
    Object.assign(data, collectSectionData(i));
  }
  
  return data;
}

/**
 * Collect data for specific section
 */
function collectSectionData(sectionNumber) {
  const form = document.getElementById('geschaeftsmodell-form');
  if (!form) return {};

  const getCheckboxValues = (name) => {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`))
      .map(cb => cb.value);
  };

  const getRadioValue = (name) => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
  };

  const getInputValue = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };

  switch (sectionNumber) {
    case 1: // Kundenproblem
      return {
        kundenproblem: getInputValue('gm-kundenproblem'),
        problemkosten: getInputValue('gm-problemkosten'),
        urgency: getRadioValue('urgency')
      };
    
    case 2: // Marktgröße
      return {
        tam: getInputValue('gm-tam'),
        sam: getInputValue('gm-sam'),
        som: getInputValue('gm-som'),
        market_validation: getCheckboxValues('market_validation'),
        market_data: getCurrentMarketData() // From market modal
      };
    
    case 3: // Zielkunden
      return {
        kundentyp: getCheckboxValues('kundentyp'),
        unternehmensgroesse: getCheckboxValues('unternehmensgroesse'),
        branchen: getCheckboxValues('branchen'),
        geografie: getCheckboxValues('geografie'),
        kundenprofil: getInputValue('gm-kundenprofil'),
        buying_center: getCheckboxValues('buying_center')
      };
    
    case 4: // Wettbewerb
      const competitors = collectCompetitors();
      return {
        competitors: competitors,
        status_quo: getCheckboxValues('status_quo'),
        do_nothing_cost: getInputValue('gm-do-nothing-cost'),
        positioning: getRadioValue('positioning'),
        competitive_moat: getCheckboxValues('competitive_moat'),
        moat_description: getInputValue('gm-moat-description')
      };
    
    case 5: // Revenue Model
      const customStreams = Array.from(document.querySelectorAll('.custom-stream-input'))
        .map(input => input.value.trim())
        .filter(val => val !== '');
      
      return {
        revenue_streams: getCheckboxValues('revenue_streams'),
        custom_streams: customStreams,
        revenue_erklaerung: getInputValue('gm-revenue-erklaerung'),
        deal_size: getInputValue('gm-deal-size'),
        sales_cycle: getInputValue('gm-sales-cycle'),
        contract_length: getInputValue('gm-contract-length'),
        churn_rate: getInputValue('gm-churn-rate')
      };
    
    case 6: // GTM
      return {
        sales_motion: getRadioValue('sales_motion'),
        sales_team_current: getInputValue('gm-sales-team-current'),
        sales_team_future: getInputValue('gm-sales-team-future'),
        quota_per_rep: getInputValue('gm-quota-per-rep'),
        ote_per_rep: getInputValue('gm-ote-per-rep'),
        lead_gen_channels: getCheckboxValues('lead_gen_channels'),
        marketing_budget_pct: getInputValue('gm-marketing-budget-pct'),
        cost_per_lead: getInputValue('gm-cost-per-lead'),
        lead_to_opp: getInputValue('gm-lead-to-opp'),
        opp_to_close: getInputValue('gm-opp-to-close'),
        pricing_strategy: getRadioValue('pricing_strategy'),
        max_discount: getInputValue('gm-max-discount'),
        early_adopter_discount: getInputValue('gm-early-adopter-discount'),
        onboarding_duration: getInputValue('gm-onboarding-duration'),
        support_level: getInputValue('gm-support-level'),
        expansion_strategy: getCheckboxValues('expansion_strategy')
      };
    
    case 7: // Unsere Lösung
      const features = Array.from(document.querySelectorAll('.feature-input'))
        .map(input => input.value.trim())
        .filter(val => val !== '');
      
      return {
        produktkategorie: getInputValue('gm-produktkategorie'),
        value_proposition: getInputValue('gm-value-proposition'),
        features: features,
        wettbewerbsvorteil: getCheckboxValues('wettbewerbsvorteil')
      };
    
    case 8: // Kritische Annahmen
      const assumptions = collectAssumptions();
      const risks = collectRisks();
      const successFactors = collectSuccessFactors();

      return {
        assumptions: assumptions,
        risks: risks,
        success_factors: successFactors
      };
    
    default:
      return {};
  }
}

/**
 * Collect competitors from DOM
 */
function collectCompetitors() {
  return Array.from(document.querySelectorAll('.competitor-item')).map(item => ({
    name: item.querySelector('.competitor-name')?.value || '',
    share: item.querySelector('.competitor-share')?.value || '',
    strengths: item.querySelector('.competitor-strengths')?.value || '',
    weaknesses: item.querySelector('.competitor-weaknesses')?.value || ''
  }));
}

/**
 * Collect assumptions from DOM
 */
function collectAssumptions() {
  return Array.from(document.querySelectorAll('.assumption-item')).map(item => ({
    text: item.querySelector('.assumption-text')?.value || '',
    status: item.querySelector('.assumption-status')?.value || '',
    risk: item.querySelector('.assumption-risk')?.value || '',
    validation: item.querySelector('.assumption-validation')?.value || ''
  }));
}

/**
 * Collect risks from DOM
 */
function collectRisks() {
  return Array.from(document.querySelectorAll('.risk-item')).map(item => ({
    text: item.querySelector('.risk-text')?.value || '',
    likelihood: item.querySelector('.risk-likelihood')?.value || '',
    impact: item.querySelector('.risk-impact')?.value || '',
    mitigation: item.querySelector('.risk-mitigation')?.value || ''
  }));
}

/**
 * Collect success factors from DOM
 */
function collectSuccessFactors() {
  return Array.from(document.querySelectorAll('.success-factor-input'))
    .map(input => input.value.trim())
    .filter(val => val !== '');
}

/**
 * Get current market data from modal state
 */
function getCurrentMarketData() {
  // This will be set by market-detail.js modal
  return window.geschaeftsmodellMarketData || { tam: {}, sam: {}, som: {} };
}

// ==========================================
// PROGRESS TRACKING
// ==========================================

/**
 * Update progress bar based on filled fields
 */
export function updateProgress() {
  const form = document.getElementById('geschaeftsmodell-form');
  if (!form) return;

  // Count total fields and filled fields
  const allInputs = form.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), textarea, select');
  const allCheckboxGroups = new Set(Array.from(form.querySelectorAll('input[type="checkbox"]')).map(cb => cb.name));
  const allRadioGroups = new Set(Array.from(form.querySelectorAll('input[type="radio"]')).map(r => r.name));
  
  const totalFields = allInputs.length + allCheckboxGroups.size + allRadioGroups.size;
  
  let filledFields = 0;
  
  // Count filled text inputs
  allInputs.forEach(input => {
    if (input.value && input.value.trim() !== '') {
      filledFields++;
    }
  });
  
  // Count filled checkbox groups (at least one checked)
  allCheckboxGroups.forEach(groupName => {
    const checked = form.querySelectorAll(`input[name="${groupName}"]:checked`);
    if (checked.length > 0) filledFields++;
  });
  
  // Count filled radio groups
  allRadioGroups.forEach(groupName => {
    const checked = form.querySelector(`input[name="${groupName}"]:checked`);
    if (checked) filledFields++;
  });
  
  const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  
  // Update UI
  const progressBar = document.getElementById('gm-progress-bar');
  const progressText = document.getElementById('gm-progress-text');
  
  if (progressBar) progressBar.style.width = `${progress}%`;
  if (progressText) progressText.textContent = `${progress}%`;
}

// ==========================================
// EVENT LISTENERS
// ==========================================

/**
 * Initialize all event listeners
 */
export function initializeEventListeners() {
  const form = document.getElementById('geschaeftsmodell-form');
  if (!form) return;

  // Auto-update progress on any change
  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);
  
  console.log('✅ Event listeners initialized');
}

// ==========================================
// RESET
// ==========================================

/**
 * Reset form state
 */
export function resetFormState() {
  const projektId = window.cfoDashboard.currentProjekt;
  if (!projektId) return;
  
  state.updateGeschaeftsmodell(projektId, {});
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Validate required fields for a section
 */
export function validateSection(sectionNumber) {
  const sectionData = collectSectionData(sectionNumber);
  const warnings = [];
  
  // Section-specific validation rules
  switch (sectionNumber) {
    case 1:
      if (!sectionData.kundenproblem) {
        warnings.push('Kundenproblem ist ein Pflichtfeld');
      }
      break;
    
    case 2:
      if (!sectionData.tam && !sectionData.sam) {
        warnings.push('Mindestens TAM oder SAM sollte ausgefüllt werden');
      }
      break;
    
    case 3:
      if (!sectionData.kundentyp || sectionData.kundentyp.length === 0) {
        warnings.push('Bitte wählen Sie mindestens einen Kundentyp');
      }
      break;
    
    // Add more validation rules as needed
  }
  
  return {
    valid: warnings.length === 0,
    warnings: warnings
  };
}