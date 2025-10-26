/**
 * ALBO Solutions - Artikel Calculator
 * 
 * Type-specific revenue, cost, and margin calculations
 * Applies development models and generates forecasts
 */

import RevenueModels from './revenue-models.js';
import * as helpers from '../../helpers.js';

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate forecast for artikel based on type
 * Returns array of year data: [year1, year2, ...]
 */
export function calculateArtikelForecast(artikel) {
  const typ = artikel.typ || 'Hardware';
  const model = RevenueModels.getRevenueModel(typ);
  
  if (!model) {
    console.error('Unknown artikel type for calculation:', typ);
    return [];
  }
  
  const zeitraum = artikel.zeitraum || 5;
  const startYear = artikel.release_datum ? 
    parseInt(artikel.release_datum.split('-')[0]) : 
    new Date().getFullYear();
  
  console.log('🧮 Calculating forecast for:', artikel.name, '(Type:', typ, ')');
  
  // Get start values
  const startValues = extractStartValues(artikel, model);
  
  // Get selected models
  const mengenModell = artikel.mengen_modell || model.mengenentwicklung[0]?.id;
  const preisModell = artikel.preis_modell || 'konstant';
  const kostenModell = artikel.kosten_modell || 'konstant';
  
  console.log('📊 Selected models:', { mengenModell, preisModell, kostenModell });
  
  // Calculate year by year
  const forecast = [];
  
  for (let i = 0; i < zeitraum; i++) {
    const year = startYear + i;
    const yearData = calculateYear(
      i,
      year,
      startValues,
      mengenModell,
      preisModell,
      kostenModell,
      model,
      artikel
    );
    forecast.push(yearData);
  }
  
  console.log('✅ Forecast calculated:', forecast);
  
  return forecast;
}

// ============================================
// EXTRACT START VALUES
// ============================================

function extractStartValues(artikel, model) {
  const values = {};
  
  model.metriken.forEach(metrik => {
    const key = `start_${metrik.id}`;
    values[metrik.id] = artikel[key] || metrik.beispiel || 0;
  });
  
  console.log('📝 Extracted start values:', values);
  
  return values;
}

// ============================================
// CALCULATE SINGLE YEAR
// ============================================

function calculateYear(
  yearIndex, 
  year, 
  startValues, 
  mengenModell, 
  preisModell, 
  kostenModell, 
  model,
  artikel
) {
  // Get metriken IDs
  const metriken = model.metriken;
  const metrik1Id = metriken[0].id; // e.g. 'menge', 'users', 'personentage'
  const metrik2Id = metriken[1].id; // e.g. 'preis', 'mrr', 'tagessatz'
  const metrik3Id = metriken[2].id; // e.g. 'hk', 'cogs', 'kostensatz'
  
  // Calculate Metrik 1 (Volume) - Type-specific
  const volume = calculateVolume(
    startValues[metrik1Id],
    yearIndex,
    mengenModell,
    model,
    artikel
  );
  
  // Calculate Metrik 2 (Price) - Universal
  const price = calculatePrice(
    startValues[metrik2Id],
    yearIndex,
    preisModell
  );
  
  // Calculate Metrik 3 (Cost) - Universal
  const cost = calculateCost(
    startValues[metrik3Id],
    yearIndex,
    kostenModell,
    volume,
    startValues[metrik1Id]
  );
  
  // Build data object for model calculation
  const data = {
    [metrik1Id]: { [year]: volume },
    [metrik2Id]: { [year]: price },
    [metrik3Id]: { [year]: cost }
  };
  
  // Use model's calculate function
  const result = model.calculate(data, year);
  
  return {
    year,
    yearIndex,
    volume,
    price,
    cost,
    revenue: result.revenue || 0,
    cogs: result.cogs || 0,
    db2: result.db2 || 0,
    db2_percent: result.db2_percent || 0,
    // Additional metrics for SaaS
    arr: result.arr || null,
    mrr: result.mrr || null
  };
}

// ============================================
// CALCULATE VOLUME (Type-specific)
// ============================================

function calculateVolume(baseVolume, yearIndex, mengenModell, model, artikel) {
  // Year 0 = base value
  if (yearIndex === 0) {
    return baseVolume;
  }
  
  // Check if manual values exist
  const manualKey = `${model.metriken[0].id}_jahr_${yearIndex + 1}`;
  if (artikel[manualKey] !== undefined && artikel[manualKey] !== null) {
    return artikel[manualKey];
  }
  
  // Find model in type-specific mengenentwicklung
  const modelConfig = model.mengenentwicklung.find(m => m.id === mengenModell);
  
  if (!modelConfig) {
    console.warn('Volume model not found:', mengenModell);
    return baseVolume;
  }
  
  // Use custom calculate function if available
  if (modelConfig.calculate) {
    return modelConfig.calculate(baseVolume, yearIndex);
  }
  
  // Use simple factor
  if (modelConfig.factor) {
    return baseVolume * Math.pow(modelConfig.factor, yearIndex);
  }
  
  return baseVolume;
}

// ============================================
// CALCULATE PRICE (Universal)
// ============================================

function calculatePrice(basePrice, yearIndex, preisModell) {
  // Year 0 = base value
  if (yearIndex === 0) {
    return basePrice;
  }
  
  // Find model in universal price models
  const modelConfig = RevenueModels.UNIVERSAL_PRICE_MODELS.find(
    m => m.id === preisModell
  );
  
  if (!modelConfig || !modelConfig.calculate) {
    return basePrice;
  }
  
  return modelConfig.calculate(basePrice, yearIndex);
}

// ============================================
// CALCULATE COST (Universal)
// ============================================

function calculateCost(baseCost, yearIndex, kostenModell, currentVolume, baseVolume) {
  // Year 0 = base value
  if (yearIndex === 0) {
    return baseCost;
  }
  
  // Find model in universal cost models
  const modelConfig = RevenueModels.UNIVERSAL_COST_MODELS.find(
    m => m.id === kostenModell
  );
  
  if (!modelConfig || !modelConfig.calculate) {
    return baseCost;
  }
  
  // Special handling for scale model (needs volume)
  if (kostenModell === 'skalen') {
    return modelConfig.calculate(baseCost, yearIndex, currentVolume, baseVolume);
  }
  
  return modelConfig.calculate(baseCost, yearIndex);
}

// ============================================
// UPDATE UI WITH FORECAST
// ============================================

/**
 * Update Ergebnis-Vorschau table with calculated forecast
 */
export function updateErgebnisVorschauUI(forecast, model) {
  if (!forecast || forecast.length === 0) {
    console.warn('No forecast data to display');
    return;
  }
  
  console.log('📊 Updating UI with forecast:', forecast);
  
  const metriken = model.metriken;
  const metrik1Id = metriken[0].id;
  const metrik2Id = metriken[1].id;
  const metrik3Id = metriken[2].id;
  
  forecast.forEach((yearData, index) => {
    const jahrNr = index + 1;
    
    // Update metric inputs
    const volumeInput = document.getElementById(`${metrik1Id}-jahr-${jahrNr}`);
    const priceInput = document.getElementById(`${metrik2Id}-jahr-${jahrNr}`);
    const costInput = document.getElementById(`${metrik3Id}-jahr-${jahrNr}`);
    
    if (volumeInput) {
      volumeInput.value = helpers.formatThousands(Math.round(yearData.volume));
    }
    if (priceInput) {
      priceInput.value = helpers.formatDecimal(yearData.price, 2);
    }
    if (costInput) {
      costInput.value = helpers.formatDecimal(yearData.cost, 2);
    }
    
    // Update calculated rows
    const revenueSpan = document.getElementById(`revenue-jahr-${jahrNr}`);
    const cogsSpan = document.getElementById(`cogs-jahr-${jahrNr}`);
    const db2Span = document.getElementById(`db2-jahr-${jahrNr}`);
    const db2PercentSpan = document.getElementById(`db2-percent-jahr-${jahrNr}`);
    
    if (revenueSpan) {
      revenueSpan.textContent = helpers.formatRevenue(yearData.revenue);
      revenueSpan.style.fontWeight = '600';
    }
    if (cogsSpan) {
      cogsSpan.textContent = helpers.formatRevenue(yearData.cogs);
      cogsSpan.style.fontWeight = '600';
    }
    if (db2Span) {
      db2Span.textContent = helpers.formatRevenue(yearData.db2);
      db2Span.style.fontWeight = '600';
    }
    if (db2PercentSpan) {
      db2PercentSpan.textContent = helpers.formatPercentage(yearData.db2_percent);
      db2PercentSpan.style.fontWeight = '600';
      
      // Color coding
      if (yearData.db2_percent >= 50) {
        db2PercentSpan.style.color = '#059669'; // Green
      } else if (yearData.db2_percent >= 30) {
        db2PercentSpan.style.color = '#f59e0b'; // Yellow
      } else {
        db2PercentSpan.style.color = '#dc2626'; // Red
      }
    }
  });
}

// ============================================
// GLOBAL FUNCTION FOR BUTTON
// ============================================

/**
 * Called by "Berechnen & Vorschau" button
 */
window.berechneErgebnisVorschau = function() {
  console.log('🔄 Recalculating Ergebnis-Vorschau...');
  
  // Get current artikel
  const artikelId = window.cfoDashboard?.currentArtikel;
  if (!artikelId) {
    console.error('No artikel selected');
    return;
  }
  
  // Get artikel from state
  const artikel = window.cfoDashboard.state?.getArtikel?.(artikelId);
  if (!artikel) {
    console.error('Artikel not found:', artikelId);
    return;
  }
  
  // Get model
  const model = RevenueModels.getRevenueModel(artikel.typ || 'Hardware');
  
  // Collect current input values
  collectInputValues(artikel, model);
  
  // Calculate forecast
  const forecast = calculateArtikelForecast(artikel);
  
  // Update UI
  updateErgebnisVorschauUI(forecast, model);
  
  // Show success message
  if (window.cfoDashboard?.aiController) {
    window.cfoDashboard.aiController.addAIMessage({
      level: 'success',
      title: '✅ Berechnung abgeschlossen',
      text: `Forecast für ${forecast.length} Jahre wurde erfolgreich berechnet.`,
      timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
    });
  }
};

// ============================================
// COLLECT INPUT VALUES
// ============================================

function collectInputValues(artikel, model) {
  // Collect start values
  model.metriken.forEach(metrik => {
    const input = document.getElementById(`start-${metrik.id}`);
    if (input && input.value && !input.value.startsWith('z.B.')) {
      artikel[`start_${metrik.id}`] = helpers.parseFormattedNumber(input.value);
    }
  });
  
  // Collect selected models
  const mengenRadio = document.querySelector('input[name="mengen-modell"]:checked');
  if (mengenRadio) artikel.mengen_modell = mengenRadio.value;
  
  const preisRadio = document.querySelector('input[name="preis-modell"]:checked');
  if (preisRadio) artikel.preis_modell = preisRadio.value;
  
  const kostenRadio = document.querySelector('input[name="kosten-modell"]:checked');
  if (kostenRadio) artikel.kosten_modell = kostenRadio.value;
  
  // Collect zeitraum
  const zeitraumBtn = document.querySelector('.zeitraum-btn.active');
  if (zeitraumBtn) {
    const text = zeitraumBtn.textContent;
    const match = text.match(/(\d+)/);
    if (match) artikel.zeitraum = parseInt(match[1]);
  }
  
  console.log('📝 Collected input values:', artikel);
}

export default {
  calculateArtikelForecast,
  updateErgebnisVorschauUI
};
