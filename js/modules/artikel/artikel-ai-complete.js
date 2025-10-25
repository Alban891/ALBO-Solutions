/**
 * KI-Artikel-Vorschläge - COMPLETE VERSION
 * Analysiert ALLE 8 Sections des Geschäftsmodells
 * Section 5 ist der Hauptindikator für Artikel
 * 
 * STANDALONE VERSION - Keine externen Dependencies außer state
 */

// ==========================================
// HAUPTFUNKTION: ARTIKEL VORSCHLAGEN
// ==========================================

/**
 * Analysiert Geschäftsmodell und generiert Artikel-Vorschläge
 * @param {Object} geschaeftsmodell - Geschäftsmodell mit allen 8 Sections
 * @returns {Object} { context, suggestions, reasoning }
 */
export async function suggestArtikelFromGeschaeftsmodell(geschaeftsmodell) {
  console.log('🤖 KI analysiert vollständiges Geschäftsmodell...');
  
  // Validierung
  if (!geschaeftsmodell) {
    console.warn('⚠️ Kein Geschäftsmodell vorhanden');
    return {
      context: {},
      suggestions: [],
      reasoning: {
        summary: 'Kein Geschäftsmodell gefunden',
        breakdown: { from_section5: 0, from_custom: 0, from_ai: 0 }
      }
    };
  }
  
  // STUFE 1: Extrahiere Kontext aus allen 8 Sections
  const context = extractFullContext(geschaeftsmodell);
  
  // STUFE 2: Generiere Vorschläge basierend auf Section 5
  const suggestions = generateArticleSuggestions(context);
  
  // STUFE 3: Priorisiere & Sortiere
  const prioritized = prioritizeSuggestions(suggestions, context);
  
  console.log(`✅ ${prioritized.length} Artikel-Vorschläge generiert`);
  
  return {
    context: context,
    suggestions: prioritized,
    reasoning: generateReasoning(context, prioritized)
  };
}

// ==========================================
// KONTEXT EXTRAKTION (ALLE 8 SECTIONS)
// ==========================================

function extractFullContext(gm) {
  return {
    // Section 1: Kundenproblem
    problem: {
      description: gm.kundenproblem,
      cost: gm.problemkosten,
      urgency: gm.urgency // critical/high/medium/low
    },
    
    // Section 2: Marktgröße
    market: {
      tam: parseFloat(gm.tam) || 0,
      sam: parseFloat(gm.sam) || 0,
      som: parseFloat(gm.som) || 0,
      validated: gm.market_validation || []
    },
    
    // Section 3: Zielkunden
    customers: {
      type: gm.kundentyp || [], // ['b2b', 'b2c', 'b2g']
      size: gm.unternehmensgroesse || [], // ['konzerne', 'mittelstand', etc.]
      industries: gm.branchen || [], // ['automotive', 'maschinenbau', etc.]
      geography: gm.geografie || [], // ['dach', 'europa', etc.]
      buyingCenter: gm.buying_center || []
    },
    
    // Section 4: Wettbewerb
    competition: {
      competitors: gm.competitors || [],
      positioning: gm.positioning, // premium/midmarket/budget
      statusQuo: gm.status_quo || [],
      moat: gm.competitive_moat || []
    },
    
    // Section 5: REVENUE STREAMS ✅ HAUPTINDIKATOR!
    revenue: {
      streams: gm.revenue_streams || [], // Checkboxen
      customStreams: gm.custom_streams || [], // User-added
      explanation: gm.revenue_erklaerung, // Freitext
      dealSize: parseFloat(gm.deal_size) || 0,
      salesCycle: parseFloat(gm.sales_cycle) || 0,
      contractLength: parseFloat(gm.contract_length) || 0,
      churnRate: parseFloat(gm.churn_rate) || 0
    },
    
    // Section 6: Go-to-Market
    gtm: {
      salesMotion: gm.sales_motion,
      expansionStrategy: gm.expansion_strategy || [], // upsell/crosssell/addons
      pricingStrategy: gm.pricing_strategy
    },
    
    // Section 7: Lösung
    solution: {
      category: gm.produktkategorie,
      valueProposition: gm.value_proposition,
      features: gm.features || [],
      advantages: gm.wettbewerbsvorteil || []
    },
    
    // Section 8: Risiken
    risks: {
      assumptions: gm.assumptions || [],
      risks: gm.risks || [],
      successFactors: gm.success_factors || []
    }
  };
}

// ==========================================
// ARTIKEL-VORSCHLÄGE GENERIEREN
// ==========================================

function generateArticleSuggestions(context) {
  const suggestions = [];
  
  // PRIORITÄT 1: AUS SECTION 5 CHECKBOXEN
  // =========================================
  
  if (context.revenue.streams.includes('lizenz')) {
    suggestions.push(createLizenzArtikel(context));
  }
  
  if (context.revenue.streams.includes('subscription')) {
    suggestions.push(createSubscriptionArtikel(context));
  }
  
  if (context.revenue.streams.includes('hardware')) {
    suggestions.push(createHardwareArtikel(context));
  }
  
  if (context.revenue.streams.includes('wartung')) {
    suggestions.push(createWartungArtikel(context));
  }
  
  if (context.revenue.streams.includes('training')) {
    suggestions.push(createTrainingArtikel(context));
  }
  
  if (context.revenue.streams.includes('transaction')) {
    suggestions.push(createTransactionArtikel(context));
  }
  
  // PRIORITÄT 2: AUS CUSTOM STREAMS
  // =========================================
  
  if (context.revenue.customStreams && context.revenue.customStreams.length > 0) {
    context.revenue.customStreams.forEach(stream => {
      suggestions.push(createCustomStreamArtikel(stream, context));
    });
  }
  
  // PRIORITÄT 3: CROSS-SELLING DETECTION
  // =========================================
  
  // Erkenne aus Expansion Strategy
  if (context.gtm.expansionStrategy.includes('crosssell')) {
    suggestions.push(createCrossSellingArtikel(context));
  }
  
  // Erkenne aus Freitext in revenue_erklaerung
  if (detectCrossSellingInText(context.revenue.explanation)) {
    suggestions.push(createCrossSellingArtikel(context));
  }
  
  // PRIORITÄT 4: INTELLIGENTE ADD-ONS
  // =========================================
  
  // Wenn Hardware + Wartung → Spare Parts vorschlagen
  if (hasHardware(context) && hasWartung(context)) {
    suggestions.push({
      id: 'addon-spare-parts',
      name: 'Ersatzteil-Paket',
      typ: 'Hardware-Add-On',
      source: 'ai-intelligent',
      confidence: 0.75,
      reasoning: 'Hardware + Wartung erkannt → Ersatzteile als Cross-Selling',
      optional: true,
      priority: 4
    });
  }
  
  // Wenn Training → Advanced Training vorschlagen
  if (context.revenue.streams.includes('training')) {
    suggestions.push({
      id: 'addon-advanced-training',
      name: 'Advanced Training',
      typ: 'Service-Add-On',
      source: 'ai-intelligent',
      confidence: 0.70,
      reasoning: 'Basis-Training erkannt → Advanced als Upsell',
      optional: true,
      priority: 5
    });
  }
  
  // PRIORITÄT 5: BRANCHEN-SPEZIFISCH
  // =========================================
  
  if (context.customers.industries.length > 2) {
    // Wenn mehr als 2 Branchen → Pro Branche eine Variante?
    suggestions.push({
      id: 'suggestion-industry-variant',
      name: 'Branchen-spezifische Varianten',
      typ: 'Variante',
      source: 'ai-intelligent',
      confidence: 0.65,
      reasoning: `Mehrere Branchen (${context.customers.industries.join(', ')}) → Varianten prüfen`,
      optional: true,
      priority: 6,
      note: 'Optional: Separate Artikel pro Branche anlegen'
    });
  }
  
  return suggestions;
}

// ==========================================
// ARTIKEL-CREATOR FUNCTIONS
// ==========================================

function createLizenzArtikel(context) {
  const price = estimatePriceFromContext(context, 'lizenz');
  const volume = estimateVolume(context, price);
  
  return {
    id: 'stream-lizenz',
    name: 'Software-Lizenz',
    typ: 'Lizenz',
    source: 'section5-checkbox',
    confidence: 0.95,
    reasoning: 'Aus Section 5: Lizenzgebühr angekreuzt',
    priority: 1,
    suggested_values: {
      start_menge: Math.round(volume * 0.1), // Jahr 1: 10%
      start_preis: price,
      start_hk: Math.round(price * 0.1), // 90% Marge für Software
      mengen_modell: 'realistisch',
      preis_modell: 'konstant',
      kosten_modell: 'konstant',
      zeitraum: 5
    }
  };
}

function createSubscriptionArtikel(context) {
  const price = estimatePriceFromContext(context, 'subscription');
  const volume = estimateVolume(context, price * 12); // Jahrespreis
  
  return {
    id: 'stream-subscription',
    name: 'SaaS Subscription',
    typ: 'Subscription',
    source: 'section5-checkbox',
    confidence: 0.95,
    reasoning: 'Aus Section 5: Subscription/SaaS angekreuzt',
    priority: 1,
    suggested_values: {
      start_menge: Math.round(volume * 0.1),
      start_preis: price * 12, // Jahrespreis
      start_hk: Math.round(price * 12 * 0.2), // 80% Marge
      mengen_modell: 'realistisch',
      preis_modell: 'inflation',
      kosten_modell: 'konstant',
      zeitraum: 5
    }
  };
}

function createHardwareArtikel(context) {
  const price = estimatePriceFromContext(context, 'hardware');
  const volume = estimateVolume(context, price);
  
  // Check if Premium positioning
  const isPremium = context.competition.positioning === 'premium';
  
  return {
    id: 'stream-hardware',
    name: isPremium ? 'Premium Hardware-System' : 'Hardware-System',
    typ: 'Hardware',
    source: 'section5-checkbox',
    confidence: 0.95,
    reasoning: 'Aus Section 5: Hardware-Verkauf angekreuzt',
    priority: 1,
    suggested_values: {
      start_menge: Math.round(volume * 0.1),
      start_preis: price,
      start_hk: Math.round(price * (isPremium ? 0.5 : 0.6)), // Premium = bessere Marge
      mengen_modell: 'realistisch',
      preis_modell: isPremium ? 'premium' : 'lernkurve',
      kosten_modell: 'lernkurve',
      zeitraum: 5
    }
  };
}

function createWartungArtikel(context) {
  const baseHardwarePrice = estimatePriceFromContext(context, 'hardware');
  const price = Math.round(baseHardwarePrice * 0.15); // 15% von Hardware
  const volume = estimateVolume(context, price);
  
  return {
    id: 'stream-wartung',
    name: 'Wartung & Support',
    typ: 'Service',
    source: 'section5-checkbox',
    confidence: 0.90,
    reasoning: 'Aus Section 5: Wartung & Support angekreuzt',
    priority: 2,
    suggested_values: {
      start_menge: Math.round(volume * 0.1),
      start_preis: price,
      start_hk: Math.round(price * 0.5), // 50% Marge
      mengen_modell: 'realistisch',
      preis_modell: 'inflation',
      kosten_modell: 'konstant',
      zeitraum: 5
    }
  };
}

function createTrainingArtikel(context) {
  const price = estimatePriceFromContext(context, 'training');
  const volume = estimateVolume(context, price);
  
  return {
    id: 'stream-training',
    name: 'Training & Consulting',
    typ: 'Service',
    source: 'section5-checkbox',
    confidence: 0.85,
    reasoning: 'Aus Section 5: Training & Consulting angekreuzt',
    priority: 3,
    suggested_values: {
      start_menge: Math.round(volume * 0.1),
      start_preis: price,
      start_hk: Math.round(price * 0.4), // 60% Marge
      mengen_modell: 'konservativ',
      preis_modell: 'konstant',
      kosten_modell: 'konstant',
      zeitraum: 5
    }
  };
}

function createTransactionArtikel(context) {
  const price = estimatePriceFromContext(context, 'transaction');
  const volume = estimateVolume(context, price);
  
  return {
    id: 'stream-transaction',
    name: 'Transaction-based Revenue',
    typ: 'Transaction',
    source: 'section5-checkbox',
    confidence: 0.80,
    reasoning: 'Aus Section 5: Transaction-basiert angekreuzt',
    priority: 3,
    suggested_values: {
      start_menge: Math.round(volume * 0.1),
      start_preis: price,
      start_hk: Math.round(price * 0.3), // 70% Marge
      mengen_modell: 'optimistisch',
      preis_modell: 'konstant',
      kosten_modell: 'skaleneffekte',
      zeitraum: 5
    }
  };
}

function createCustomStreamArtikel(streamName, context) {
  // Analysiere Custom Stream Namen
  const isCrossSelling = streamName.toLowerCase().includes('cross') || 
                         streamName.toLowerCase().includes('additional');
  
  const price = estimatePriceFromContext(context, 'custom');
  const volume = estimateVolume(context, price);
  
  return {
    id: `custom-${streamName.toLowerCase().replace(/\s+/g, '-')}`,
    name: streamName,
    typ: isCrossSelling ? 'Cross-Selling' : 'Custom',
    source: 'section5-custom',
    confidence: 0.85,
    reasoning: `Aus Section 5 Custom Streams: "${streamName}"`,
    priority: isCrossSelling ? 2 : 3,
    suggested_values: {
      start_menge: Math.round(volume * 0.1),
      start_preis: price,
      start_hk: Math.round(price * 0.4),
      mengen_modell: 'realistisch',
      preis_modell: 'konstant',
      kosten_modell: 'konstant',
      zeitraum: 5
    }
  };
}

function createCrossSellingArtikel(context) {
  const price = estimatePriceFromContext(context, 'hardware') * 0.3;
  const volume = estimateVolume(context, price);
  
  return {
    id: 'crosssell-detected',
    name: 'Cross-Selling Artikel',
    typ: 'Cross-Selling',
    source: 'ai-detected',
    confidence: 0.75,
    reasoning: 'Cross-Selling erkannt in Expansion Strategy oder Freitext',
    priority: 4,
    optional: true,
    suggested_values: {
      start_menge: Math.round(volume * 0.05), // Niedrigere Adoption
      start_preis: price,
      start_hk: Math.round(price * 0.5),
      mengen_modell: 'konservativ',
      preis_modell: 'konstant',
      kosten_modell: 'konstant',
      zeitraum: 5
    }
  };
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function estimatePriceFromContext(context, type) {
  const dealSize = context.revenue.dealSize || 100000;
  
  // Schätze Preis basierend auf Typ
  const priceMap = {
    'lizenz': dealSize * 0.3,      // 30% von Deal Size
    'subscription': dealSize * 0.05, // 5% monatlich
    'hardware': dealSize * 0.7,     // 70% von Deal Size
    'wartung': dealSize * 0.15,     // 15% von Deal Size
    'training': dealSize * 0.1,     // 10% von Deal Size
    'transaction': dealSize * 0.02, // 2% pro Transaction
    'custom': dealSize * 0.2        // 20% default
  };
  
  return Math.round(priceMap[type] || dealSize * 0.2);
}

function estimateVolume(context, price) {
  if (price === 0) return 100; // Fallback
  const som = context.market.som || 1000000;
  return Math.round(som / price);
}

function hasHardware(context) {
  return context.revenue.streams.includes('hardware');
}

function hasWartung(context) {
  return context.revenue.streams.includes('wartung');
}

function detectCrossSellingInText(text) {
  if (!text) return false;
  const keywords = ['cross', 'zusätzlich', 'add-on', 'ergänzung', 'upsell'];
  return keywords.some(keyword => text.toLowerCase().includes(keyword));
}

// ==========================================
// PRIORISIERUNG
// ==========================================

function prioritizeSuggestions(suggestions, context) {
  // Sortiere nach Priorität und Confidence
  return suggestions.sort((a, b) => {
    // Erst nach Priorität
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // Dann nach Confidence
    return b.confidence - a.confidence;
  });
}

function generateReasoning(context, suggestions) {
  const mandatory = suggestions.filter(s => !s.optional);
  const optional = suggestions.filter(s => s.optional);
  
  return {
    summary: `Aus deinem Geschäftsmodell habe ich ${suggestions.length} Artikel-Vorschläge generiert`,
    breakdown: {
      from_section5: mandatory.filter(s => s.source === 'section5-checkbox').length,
      from_custom: mandatory.filter(s => s.source === 'section5-custom').length,
      from_ai: optional.filter(s => s.source.includes('ai')).length
    },
    context_highlights: {
      positioning: context.competition.positioning,
      som: formatCurrency(context.market.som),
      dealSize: formatCurrency(context.revenue.dealSize),
      salesCycle: `${context.revenue.salesCycle} Monate`
    }
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// ==========================================
// EXPORT
// ==========================================

export default {
  suggestArtikelFromGeschaeftsmodell
};