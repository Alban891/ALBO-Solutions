/**
 * CFO Dashboard - Geschäftsmodell KI-Analyse
 * Business Logic Rules & Validation
 * 
 * Funktionen:
 * - analyzeSection() - Analysiert einzelne Abschnitte
 * - validateGeschaeftsmodell() - Validiert gesamtes Modell
 * - Enthält alle Business-Regeln
 */

// ==========================================
// BUSINESS RULES
// ==========================================

/**
 * Extract cost amount from text (in k€)
 */
function extractCost(text) {
  if (!text) return 0;
  
  // Match patterns like "400k€" or "400.000€" or "400 tausend"
  const patterns = [
    /(\d+(?:\.\d+)?)\s*k€/i,
    /(\d+(?:\.\d+)?)\s*tausend/i,
    /(\d{1,3}(?:\.\d{3})+)\s*€/  // 400.000€
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let amount = parseFloat(match[1].replace(/\./g, ''));
      // If pattern 3 (400.000€), convert to k
      if (pattern.source.includes('{1,3}')) {
        amount = amount / 1000;
      }
      return amount;
    }
  }
  
  return 0;
}

/**
 * Extract price from text (in k€)
 */
function extractPrice(text) {
  if (!text) return 0;
  
  const patterns = [
    /(\d+(?:\.\d+)?)\s*k€/i,
    /(\d+(?:\.\d+)?)\s*tausend/i,
    /(\d{1,3}(?:\.\d{3})+)\s*€/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let amount = parseFloat(match[1].replace(/\./g, ''));
      if (pattern.source.includes('{1,3}')) {
        amount = amount / 1000;
      }
      return amount;
    }
  }
  
  return 0;
}

// ==========================================
// SECTION 1: KUNDENPROBLEM ANALYSE
// ==========================================

function analyzeSection1(data) {
  const issues = [];
  const tips = [];
  let score = 10;

  // Check 1: Kundenproblem quantifiziert?
  if (data.kundenproblem && data.kundenproblem.length > 20) {
    const hasNumbers = /\d+/.test(data.kundenproblem);
    if (!hasNumbers) {
      tips.push({
        title: 'Quantifizierung fehlt',
        message: 'Versuchen Sie, das Problem mit Zahlen zu belegen (z.B. "30% Produktivitätsverlust", "15 Stunden/Woche").'
      });
      score -= 1;
    }
  } else {
    issues.push({
      title: 'Problembeschreibung zu kurz',
      message: 'Ein Senior Controller würde das Problem detaillierter beschreiben. Minimum 3-4 Sätze mit konkreten Auswirkungen.'
    });
    score -= 2;
  }

  // Check 2: Kosten vs. Urgency Konsistenz
  const cost = extractCost(data.problemkosten);
  const urgency = data.urgency;

  if (cost > 0 && urgency) {
    // High cost but low urgency
    if (cost >= 300 && urgency === 'niedrig') {
      issues.push({
        title: 'Inkonsistenz: Kosten vs. Urgency',
        message: `Das Problem kostet ~${Math.round(cost)}k€/Jahr, aber die Urgency ist "niedrig". Ein Senior Controller würde fragen: "Warum ist die Urgency niedrig bei solchen Kosten? Gibt es Budget-Zyklen, Change-Management-Herausforderungen oder andere Prioritäten?"`
      });
      score -= 2;
    }
    
    // High cost but medium urgency
    if (cost >= 500 && urgency === 'mittel') {
      tips.push({
        title: 'Urgency überprüfen',
        message: `Bei ${Math.round(cost)}k€/Jahr Problemkosten wäre typischerweise eine höhere Urgency zu erwarten. Prüfen Sie: Gibt es technische, organisatorische oder finanzielle Gründe für die moderate Urgency?`
      });
      score -= 1;
    }

    // Low cost but high urgency
    if (cost < 50 && (urgency === 'akut' || urgency === 'hoch')) {
      tips.push({
        title: 'Urgency vs. Kosten prüfen',
        message: 'Die Urgency ist hoch, aber die Problemkosten scheinen niedrig. Gibt es nicht-monetäre Faktoren (Compliance, Reputation, strategische Bedeutung)?'
      });
    }
  }

  // Check 3: Keine Urgency gewählt
  if (!urgency) {
    issues.push({
      title: 'Urgency fehlt',
      message: 'Die Dringlichkeit des Problems ist ein kritischer Faktor für die Zahlungsbereitschaft.'
    });
    score -= 2;
  }

  // Check 4: Problemkosten fehlen
  if (!data.problemkosten || data.problemkosten.trim() === '') {
    tips.push({
      title: 'Problemkosten quantifizieren',
      message: 'Versuchen Sie, die aktuellen Kosten des Problems zu quantifizieren. Das hilft bei der Argumentation für ROI und Payback.'
    });
    score -= 1;
  }

  return {
    section: 1,
    issues,
    tips,
    quality_score: Math.max(0, score)
  };
}

// ==========================================
// SECTION 2: ZIELKUNDEN ANALYSE
// ==========================================

function analyzeSection2(data) {
  const issues = [];
  const tips = [];
  let score = 10;

  // Check 1: Kundentyp gewählt?
  if (!data.kundentyp || data.kundentyp.length === 0) {
    issues.push({
      title: 'Kundentyp fehlt',
      message: 'B2B, B2C oder B2G? Die Wahl beeinflusst GTM-Strategie, Sales Cycle und Pricing.'
    });
    score -= 3;
  }

  // Check 2: Unternehmensgröße gewählt?
  if (!data.unternehmensgroesse || data.unternehmensgroesse.length === 0) {
    tips.push({
      title: 'Unternehmensgröße definieren',
      message: 'Die Größe der Zielkunden beeinflusst Deal Size, Decision Maker und Sales Complexity.'
    });
    score -= 1;
  }

  // Check 3: Buying Center plausibel?
  if (data.unternehmensgroesse && data.buying_center) {
    const isKMU = data.unternehmensgroesse.includes('kmu');
    const onlyEinkauf = data.buying_center.length === 1 && data.buying_center.includes('einkauf');
    
    if (isKMU && onlyEinkauf) {
      tips.push({
        title: 'Buying Center überprüfen',
        message: 'Bei KMUs ist oft die Geschäftsführung direkt in Kaufentscheidungen involviert, nicht nur der Einkauf.'
      });
      score -= 1;
    }

    const isKonzern = data.unternehmensgroesse.includes('konzerne');
    const noCFO = !data.buying_center.includes('cfo');
    
    if (isKonzern && noCFO) {
      tips.push({
        title: 'CFO im Buying Center?',
        message: 'Bei Konzernen ist der CFO oft im Buying Center für größere Investments (>100k€).'
      });
    }
  }

  // Check 4: Zu breiter geografischer Fokus?
  if (data.geografie && data.geografie.length >= 3) {
    tips.push({
      title: 'Geografischer Fokus zu breit?',
      message: 'Sie haben einen sehr breiten geografischen Fokus gewählt. Als Senior Controller würden Sie fragen: "Haben wir die Ressourcen für diese Expansion? Sollten wir uns initial fokussieren?"'
    });
    score -= 0.5;
  }

  // Check 5: Buying Center fehlt komplett
  if (!data.buying_center || data.buying_center.length === 0) {
    issues.push({
      title: 'Buying Center unklar',
      message: 'Wer entscheidet über den Kauf? Das ist kritisch für die Sales-Strategie und Forecasting.'
    });
    score -= 2;
  }

  // Check 6: Kundenprofil zu generisch?
  if (data.kundenprofil && data.kundenprofil.length > 0) {
    if (data.kundenprofil.length < 50) {
      tips.push({
        title: 'Kundenprofil detaillierter',
        message: 'Versuchen Sie, das Kundenprofil spezifischer zu beschreiben: Umsatz, Mitarbeiteranzahl, typische Pain Points, Budget-Verfügbarkeit.'
      });
      score -= 0.5;
    }
  }

  return {
    section: 2,
    issues,
    tips,
    quality_score: Math.max(0, score)
  };
}

// ==========================================
// SECTION 3: REVENUE MODEL ANALYSE
// ==========================================

function analyzeSection3(data) {
  const issues = [];
  const tips = [];
  let score = 10;

  // Check 1: Mindestens ein Revenue Stream?
  if (!data.revenue_streams || data.revenue_streams.length === 0) {
    issues.push({
      title: 'Revenue Streams fehlen',
      message: 'Wählen Sie mindestens einen Revenue Stream aus. Das ist die Basis Ihres Geschäftsmodells.'
    });
    score -= 3;
    return { section: 3, issues, tips, quality_score: Math.max(0, score) };
  }

  // Check 2: Nur Subscription ohne Details?
  const hasSubscription = data.revenue_streams.includes('subscription');
  const hasVertragslaufzeit = data.revenue_erklaerung && 
    (data.revenue_erklaerung.includes('Laufzeit') || 
     data.revenue_erklaerung.includes('Monat') || 
     data.revenue_erklaerung.includes('Jahr'));

  if (hasSubscription && !hasVertragslaufzeit) {
    issues.push({
      title: 'Subscription-Details fehlen',
      message: 'Bei Subscription-Modellen ist die Vertragslaufzeit kritisch für LTV/CAC-Berechnung. Ein Senior Controller würde fragen: "Welche Mindestlaufzeit? Welche Kündigungsfrist? Erwartete Churn-Rate?"'
    });
    score -= 2;
  }

  // Check 3: Contract Length bei Subscription
  if (hasSubscription && data.contract_length) {
    const length = parseInt(data.contract_length);
    if (length < 12) {
      tips.push({
        title: 'Kurze Vertragslaufzeit',
        message: `${length} Monate Vertragslaufzeit ist relativ kurz für B2B SaaS. Typischerweise 12-36 Monate. Kürzere Laufzeiten erhöhen Churn-Risk und reduzieren LTV.`
      });
      score -= 0.5;
    }
  }

  // Check 4: Churn Rate bei Subscription
  if (hasSubscription && data.churn_rate) {
    const churn = parseFloat(data.churn_rate);
    if (churn > 20) {
      issues.push({
        title: 'Hohe Churn-Rate',
        message: `${churn}% Churn ist sehr hoch für B2B. Typischerweise 5-15% jährlich. Ein Senior Controller würde fragen: "Was sind die Gründe? Wie verbessern wir Retention?"`
      });
      score -= 2;
    }
  }

  // Check 5: Mix aus One-Time + Recurring = gut!
  const hasOneTime = data.revenue_streams.some(s => 
    ['software_license', 'hardware'].includes(s)
  );
  const hasRecurring = data.revenue_streams.some(s => 
    ['subscription', 'maintenance', 'usage_based'].includes(s)
  );

  if (hasOneTime && hasRecurring) {
    tips.push({
      title: 'Starkes Hybrid-Modell ✅',
      message: 'Exzellent! Sie kombinieren einmalige und wiederkehrende Umsätze. Das erhöht Planbarkeit und reduziert CAC-Payback-Period.'
    });
    score += 1; // Bonus!
  }

  // Check 6: Nur One-Time = Warnung
  if (hasOneTime && !hasRecurring) {
    tips.push({
      title: 'Nur einmalige Umsätze',
      message: 'Ihr Modell basiert auf einmaligen Umsätzen. Ein Senior Controller würde fragen: "Können wir wiederkehrende Revenue Streams hinzufügen (Wartung, Support, Updates) für höhere Bewertung?"'
    });
    score -= 1;
  }

  // Check 7: Revenue Erklärung zu kurz?
  if (!data.revenue_erklaerung || data.revenue_erklaerung.length < 50) {
    issues.push({
      title: 'Revenue Model unzureichend beschrieben',
      message: 'Beschreiben Sie das Revenue Model konkret: Was kostet was? Welche Laufzeiten? Welche Kombinationen? Ein Senior Controller braucht diese Details für Forecasting.'
    });
    score -= 2;
  }

  // Check 8: Deal Size vorhanden?
  if (data.deal_size && parseInt(data.deal_size) > 0) {
    const dealSize = parseInt(data.deal_size);
    
    // Plausibility: Deal Size vs. Buying Center
    // (Cross-check mit Section 2 - später wenn alle Daten zusammen)
    
    if (dealSize > 200) {
      tips.push({
        title: 'Großer Deal Size',
        message: `${dealSize}k€ Average Deal Size ist sehr attraktiv. Stellen Sie sicher, dass Ihr Sales Cycle realistisch ist (typisch 6-18 Monate bei dieser Größe).`
      });
    }
  }

  // Check 9: Sales Cycle realistisch?
  if (data.sales_cycle && parseInt(data.sales_cycle) > 0) {
    const cycle = parseInt(data.sales_cycle);
    const dealSize = data.deal_size ? parseInt(data.deal_size) : 0;
    
    // Plausibility
    if (dealSize > 100 && cycle < 3) {
      issues.push({
        title: 'Sales Cycle unrealistisch kurz',
        message: `${cycle} Monate Sales Cycle bei ${dealSize}k€ Deal Size ist sehr optimistisch. Typischerweise 6-12 Monate bei solchen Deal Sizes im B2B.`
      });
      score -= 1;
    }
  }

  return {
    section: 3,
    issues,
    tips,
    quality_score: Math.max(0, Math.min(10, score))
  };
}

// ==========================================
// SECTION 4: LÖSUNG ANALYSE
// ==========================================

function analyzeSection4(data) {
  const issues = [];
  const tips = [];
  let score = 10;

  // Check 1: Produktkategorie gewählt?
  if (!data.produktkategorie) {
    issues.push({
      title: 'Produktkategorie fehlt',
      message: 'Was bieten Sie an? Hardware, Software, Service?'
    });
    score -= 2;
  }

  // Check 2: Value Proposition quantifiziert?
  if (data.value_proposition && data.value_proposition.length > 20) {
    const hasNumbers = /\d+/.test(data.value_proposition);
    const hasPercent = /%/.test(data.value_proposition);
    
    if (!hasNumbers && !hasPercent) {
      tips.push({
        title: 'Value Proposition quantifizieren',
        message: 'Versuchen Sie, den Nutzen mit Zahlen zu belegen (z.B. "40% schneller", "70% Kostenreduktion"). Das stärkt die Argumentation.'
      });
      score -= 1;
    } else {
      tips.push({
        title: 'Starke Value Proposition ✅',
        message: 'Gut! Sie haben den Nutzen quantifiziert. Das ist überzeugend für Entscheider.'
      });
    }
  } else {
    issues.push({
      title: 'Value Proposition zu kurz',
      message: 'Beschreiben Sie den Nutzen klar und quantifiziert. Was genau ist der Vorteil für den Kunden?'
    });
    score -= 2;
  }

  // Check 3: Features dokumentiert?
  if (!data.features || data.features.length === 0) {
    tips.push({
      title: 'Features dokumentieren',
      message: 'Listen Sie die wichtigsten Features auf. Das hilft bei der Produktplanung und Artikel-Definition.'
    });
    score -= 1;
  } else if (data.features.length < 3) {
    tips.push({
      title: 'Mehr Features?',
      message: 'Sie haben nur wenige Features dokumentiert. Typischerweise 5-10 Key Features für ein komplexes Produkt.'
    });
  }

  // Check 4: Wettbewerbsvorteil definiert?
  if (!data.wettbewerbsvorteil || data.wettbewerbsvorteil.length === 0) {
    issues.push({
      title: 'Wettbewerbsvorteil unklar',
      message: 'Was differenziert Sie vom Wettbewerb? Ein Senior Controller würde fragen: "Warum sollten Kunden uns wählen statt Competitor X?"'
    });
    score -= 2;
  }

  // Check 5: Nur Preis als Differenzierung = Warnung
  if (data.wettbewerbsvorteil && 
      data.wettbewerbsvorteil.length === 1 && 
      data.wettbewerbsvorteil.includes('preis')) {
    tips.push({
      title: 'Nur Preis-Differenzierung?',
      message: 'Preis als einziger Wettbewerbsvorteil ist riskant (Race to the bottom). Ein Senior Controller würde fragen: "Können wir uns auch über Technologie, Service oder Speed differenzieren?"'
    });
    score -= 1;
  }

  return {
    section: 4,
    issues,
    tips,
    quality_score: Math.max(0, score)
  };
}

// ==========================================
// MAIN ANALYZE FUNCTION
// ==========================================

/**
 * Analyze specific section
 */
export function analyzeSection(sectionNumber, data) {
  switch (sectionNumber) {
    case 1:
      return analyzeSection1(data);
    case 2:
      return analyzeSection2(data);
    case 3:
      return analyzeSection3(data);
    case 4:
      return analyzeSection4(data);
    default:
      return {
        section: sectionNumber,
        issues: [],
        tips: [],
        quality_score: 10
      };
  }
}

// ==========================================
// FULL VALIDATION
// ==========================================

/**
 * Validate complete Geschäftsmodell
 */
export function validateGeschaeftsmodell(data) {
  const critical_issues = [];
  const warnings = [];
  const tips = [];
  
  // Section 1 validation
  const s1 = analyzeSection1({
    kundenproblem: data.kundenproblem,
    problemkosten: data.problemkosten,
    urgency: data.urgency
  });
  critical_issues.push(...s1.issues);
  tips.push(...s1.tips);

  // Section 2 validation
  const s2 = analyzeSection2({
    kundentyp: data.kundentyp,
    unternehmensgroesse: data.unternehmensgroesse,
    branchen: data.branchen,
    geografie: data.geografie,
    kundenprofil: data.kundenprofil,
    buying_center: data.buying_center
  });
  critical_issues.push(...s2.issues);
  tips.push(...s2.tips);

  // Section 3 validation
  const s3 = analyzeSection3({
    revenue_streams: data.revenue_streams,
    custom_streams: data.custom_streams,
    revenue_erklaerung: data.revenue_erklaerung,
    deal_size: data.deal_size,
    sales_cycle: data.sales_cycle,
    contract_length: data.contract_length,
    churn_rate: data.churn_rate
  });
  critical_issues.push(...s3.issues);
  tips.push(...s3.tips);

  // Section 4 validation
  const s4 = analyzeSection4({
    produktkategorie: data.produktkategorie,
    value_proposition: data.value_proposition,
    features: data.features,
    wettbewerbsvorteil: data.wettbewerbsvorteil
  });
  critical_issues.push(...s4.issues);
  tips.push(...s4.tips);

  // Cross-section checks
  
  // Check: Buying Center vs. Deal Size
  if (data.buying_center && data.deal_size) {
    const dealSize = parseInt(data.deal_size);
    const hasGF = data.buying_center.includes('geschaeftsfuehrung');
    const hasCFO = data.buying_center.includes('cfo');
    const onlyEinkauf = data.buying_center.length === 1 && data.buying_center.includes('einkauf');
    
    if (dealSize > 100 && onlyEinkauf) {
      critical_issues.push({
        title: 'Cross-Check: Buying Center vs. Deal Size',
        message: `Bei ${dealSize}k€ Deal Size nur Einkauf im Buying Center ist unrealistisch. Typischerweise GF/CFO-Ebene bei >100k€.`
      });
    }
  }

  // Check: KMU vs. hoher Deal Size
  if (data.unternehmensgroesse && data.unternehmensgroesse.includes('kmu') && data.deal_size) {
    const dealSize = parseInt(data.deal_size);
    if (dealSize > 150) {
      warnings.push({
        title: 'Cross-Check: KMU vs. Deal Size',
        message: `KMUs mit ${dealSize}k€ Deal Size ist ambitioniert. Stellen Sie sicher, dass Budget-Verfügbarkeit realistisch ist.`
      });
    }
  }

  // Calculate overall score
  const avgScore = (s1.quality_score + s2.quality_score + s3.quality_score + s4.quality_score) / 4;
  const overall_score = Math.round(avgScore * 10) / 10;

  return {
    overall_score,
    critical_issues,
    warnings,
    tips,
    section_scores: {
      section_1: s1.quality_score,
      section_2: s2.quality_score,
      section_3: s3.quality_score,
      section_4: s4.quality_score
    }
  };
}

console.log('📦 Geschäftsmodell-KI module loaded');