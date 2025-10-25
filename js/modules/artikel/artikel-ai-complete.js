/**
 * INTELLIGENT ARTIKEL SUGGESTIONS WITH CLAUDE AI
 * Analyzes complete business model and suggests articles
 */

// ==========================================
// CLAUDE API INTEGRATION
// ==========================================

/**
 * Analyze geschaeftsmodell with Claude AI
 * Returns intelligent article suggestions based on complete business context
 */
export async function analyzeGeschaeftsmodellWithClaude(geschaeftsmodell) {
  console.log('🤖 Starting Claude AI analysis...');
  console.log('Input geschaeftsmodell:', geschaeftsmodell);
  
  try {
    // Build intelligent prompt
    const prompt = buildAnalysisPrompt(geschaeftsmodell);
    
    console.log('📝 Sending prompt to Claude...');
    
    // Call Claude API via Vercel endpoint
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Claude API Error:', error);
      throw new Error(`Claude API Error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('✅ Claude response received:', data);
    
    // Parse Claude's response
    const analysis = parseClaudeResponse(data);
    
    console.log('✅ Analysis complete:', analysis);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error in Claude analysis:', error);
    
    // Fallback to rule-based suggestions if API fails
    console.log('⚠️ Falling back to rule-based suggestions...');
    return getFallbackSuggestions(geschaeftsmodell);
  }
}

/**
 * Build intelligent analysis prompt for Claude
 */
function buildAnalysisPrompt(geschaeftsmodell) {
  // Extract all sections
  const sections = {
    section1: geschaeftsmodell.section1 || {},
    section2: geschaeftsmodell.section2 || {},
    section3: geschaeftsmodell.section3 || {},
    section4: geschaeftsmodell.section4 || {},
    section5: geschaeftsmodell.section5 || {},
    section6: geschaeftsmodell.section6 || {}
  };
  
  const prompt = `Du bist ein Experte für Business Case Analysen und Financial Modeling. Analysiere das folgende Geschäftsmodell und schlage konkrete Artikel (Produkte/Services) vor, die daraus abgeleitet werden können.

# GESCHÄFTSMODELL

## SECTION 1 - PRODUKT/SERVICE
${formatSection(sections.section1)}

## SECTION 2 - VALUE PROPOSITION & CUSTOMER NEEDS
${formatSection(sections.section2)}

## SECTION 3 - KUNDENSEGMENTE & MARKT
${formatSection(sections.section3)}

## SECTION 4 - WETTBEWERB & POSITIONIERUNG
${formatSection(sections.section4)}

## SECTION 5 - REVENUE STREAMS
${formatSection(sections.section5)}

## SECTION 6 - KOSTENSTRUKTUR
${formatSection(sections.section6)}

# DEINE AUFGABE

Analysiere dieses Geschäftsmodell GANZHEITLICH und schlage 3-7 konkrete Artikel vor.

## ANALYSIERE:

1. **PRODUKT-KONTEXT**
   - Was ist das Hauptprodukt/Service?
   - Ist es Hardware, Software, Service oder Hybrid?
   - Welche Komplexität hat das Produkt?

2. **KUNDEN-KONTEXT**
   - B2B oder B2C?
   - Welches Segment (Enterprise, SMB, Consumer)?
   - Kaufkraft und Zahlungsbereitschaft?

3. **POSITIONIERUNG**
   - Premium, Standard oder Budget?
   - Unique Value Proposition?
   - Wettbewerbsvorteile?

4. **REVENUE STREAMS**
   - Welche Revenue Streams sind explizit genannt?
   - Welche Checkboxen sind angekreuzt?
   - Welche Textfelder enthalten wichtige Informationen?

5. **ZUSAMMENHÄNGE**
   - Welche Folgeprodukte/Services ergeben sich logisch?
   - Hardware → braucht Wartung?
   - Komplexe Systeme → brauchen Training?
   - Cross-Selling Möglichkeiten?

6. **TEXTFELD-ANALYSE**
   - Parse ALLE Textfelder nach konkreten Produkten/Preisen
   - Beispiel: "100.000 EUR Reihenklemmen" → Artikel vorschlagen!
   - Beispiel: "Cross-Selling Software-Lizenzen" → Artikel vorschlagen!

## FÜR JEDEN ARTIKEL SCHLAGE VOR:

1. **name** (string): Spezifischer, präziser Name (nicht generisch!)
2. **typ** (string): Hardware | Software | Service | License | Subscription | Consulting
3. **preis** (number): Realistischer Preis in EUR (basierend auf Positioning & Markt)
4. **menge** (number): Geschätzte Start-Menge pro Jahr (realistisch!)
5. **hk** (number): Geschätzte Herstellkosten in EUR
6. **reasoning** (string): AUSFÜHRLICHE Begründung (2-3 Sätze!) warum dieser Artikel Sinn macht
7. **confidence** (number): 0.0-1.0 wie sicher bist du?
8. **priority** (number): 1=wichtigster, 2=zweitwichtigster, etc.
9. **source** (string): Woher kommt der Vorschlag? (z.B. "section5-checkbox", "section5-text", "inferred")

## PREIS-SCHÄTZUNG:

- **Premium Positioning**: 2-3x höhere Preise als Standard
- **B2B Enterprise**: Höhere Preise als SMB/Consumer
- **Hardware**: Typisch 10k-500k EUR
- **Software Licenses**: Typisch 500-50k EUR
- **Subscription/SaaS**: Typisch 50-5k EUR/Monat
- **Services/Wartung**: Typisch 10-20% vom Hardware-Preis
- **Consulting/Training**: Typisch 1-10k EUR pro Tag/Session

## WICHTIGE REGELN:

1. **CONTEXT MATTERS**: Verstehe den gesamten Business Context
2. **BE SPECIFIC**: "Premium Montage-Roboter" nicht "Hardware-System"
3. **PARSE TEXT**: Lies ALLE Textfelder nach konkreten Hinweisen
4. **LOGICAL CHAINS**: Hardware → Wartung → Training → Ersatzteile
5. **REALISTIC PRICES**: Basierend auf Positioning und Markt
6. **EXPLAIN WHY**: Gib ausführliche Begründungen

## OUTPUT FORMAT:

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt (kein Markdown, kein Text davor/danach):

{
  "suggested_articles": [
    {
      "name": "Spezifischer Produkt-Name",
      "typ": "Hardware",
      "preis": 50000,
      "menge": 100,
      "hk": 30000,
      "reasoning": "Ausführliche Begründung warum dieser Artikel basierend auf dem Geschäftsmodell Sinn macht. Beziehe dich auf konkrete Sections.",
      "confidence": 0.95,
      "priority": 1,
      "source": "section5-checkbox"
    }
  ],
  "analysis_summary": "2-3 Sätze Zusammenfassung der Analyse: Was ist das Business Model? Welche Artikel-Strategie macht Sinn?",
  "total_articles": 5,
  "confidence_score": 0.92
}

WICHTIG: Gib NUR das JSON zurück, keinen anderen Text!`;

  return prompt;
}

/**
 * Format section for prompt
 */
function formatSection(section) {
  if (!section || Object.keys(section).length === 0) {
    return '(Nicht ausgefüllt)';
  }
  
  let formatted = '';
  
  for (const [key, value] of Object.entries(section)) {
    if (value === null || value === undefined || value === '') continue;
    
    // Format booleans nicely
    if (typeof value === 'boolean') {
      formatted += `- ${key}: ${value ? '✅ JA' : '❌ NEIN'}\n`;
    }
    // Format objects/arrays
    else if (typeof value === 'object') {
      formatted += `- ${key}: ${JSON.stringify(value, null, 2)}\n`;
    }
    // Format strings/numbers
    else {
      formatted += `- ${key}: ${value}\n`;
    }
  }
  
  return formatted || '(Keine Daten)';
}

/**
 * Parse Claude's JSON response
 */
function parseClaudeResponse(claudeData) {
  try {
    // Extract text content from Claude response
    const content = claudeData.content[0].text;
    
    console.log('📖 Claude raw response:', content);
    
    // Try to extract JSON from response
    // Claude might wrap it in markdown code blocks
    let jsonText = content;
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '');
    jsonText = jsonText.replace(/```\n?/g, '');
    jsonText = jsonText.trim();
    
    // Try to find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate response structure
    if (!analysis.suggested_articles || !Array.isArray(analysis.suggested_articles)) {
      throw new Error('Invalid response structure: missing suggested_articles array');
    }
    
    // Ensure all articles have required fields
    analysis.suggested_articles = analysis.suggested_articles.map(article => ({
      id: article.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: article.name,
      typ: article.typ || 'Hardware',
      source: article.source || 'ai-inferred',
      confidence: article.confidence || 0.8,
      reasoning: article.reasoning || 'Von KI vorgeschlagen',
      priority: article.priority || 99,
      suggested_values: {
        start_menge: article.menge || 100,
        start_preis: article.preis || 10000,
        start_hk: article.hk || 5000,
        mengen_modell: inferMengenModell(article.typ),
        preis_modell: inferPreisModell(article.typ),
        kosten_modell: 'lernkurve',
        zeitraum: 5
      }
    }));
    
    // Sort by priority
    analysis.suggested_articles.sort((a, b) => a.priority - b.priority);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error parsing Claude response:', error);
    throw error;
  }
}

/**
 * Infer mengen modell based on typ
 */
function inferMengenModell(typ) {
  const modellMap = {
    'Hardware': 'realistisch',
    'Software': 'optimistisch',
    'Service': 'realistisch',
    'License': 'optimistisch',
    'Subscription': 'rogers',
    'Consulting': 'konservativ'
  };
  return modellMap[typ] || 'realistisch';
}

/**
 * Infer preis modell based on typ
 */
function inferPreisModell(typ) {
  const modellMap = {
    'Hardware': 'lernkurve',
    'Software': 'konstant',
    'Service': 'inflation',
    'License': 'konstant',
    'Subscription': 'konstant',
    'Consulting': 'inflation'
  };
  return modellMap[typ] || 'konstant';
}

/**
 * Fallback suggestions if Claude API fails
 */
function getFallbackSuggestions(geschaeftsmodell) {
  console.log('⚠️ Using fallback rule-based suggestions');
  
  const articles = [];
  const section5 = geschaeftsmodell.section5 || {};
  
  // Check for common revenue streams
  if (section5.hardware_sale) {
    articles.push({
      id: 'hardware-product',
      name: 'Hardware-Produkt',
      typ: 'Hardware',
      source: 'section5-checkbox',
      confidence: 0.90,
      reasoning: 'Hardware-Verkauf in Section 5 angekreuzt',
      priority: 1,
      suggested_values: {
        start_menge: 100,
        start_preis: 50000,
        start_hk: 30000,
        mengen_modell: 'realistisch',
        preis_modell: 'lernkurve',
        kosten_modell: 'lernkurve',
        zeitraum: 5
      }
    });
  }
  
  if (section5.maintenance) {
    articles.push({
      id: 'maintenance-contract',
      name: 'Wartungsvertrag',
      typ: 'Service',
      source: 'section5-checkbox',
      confidence: 0.88,
      reasoning: 'Wartung & Support in Section 5 angekreuzt',
      priority: 2,
      suggested_values: {
        start_menge: 80,
        start_preis: 5000,
        start_hk: 2000,
        mengen_modell: 'realistisch',
        preis_modell: 'inflation',
        kosten_modell: 'inflation',
        zeitraum: 5
      }
    });
  }
  
  if (section5.training) {
    articles.push({
      id: 'training-service',
      name: 'Training & Consulting',
      typ: 'Consulting',
      source: 'section5-checkbox',
      confidence: 0.85,
      reasoning: 'Training & Consulting in Section 5 angekreuzt',
      priority: 3,
      suggested_values: {
        start_menge: 50,
        start_preis: 2000,
        start_hk: 800,
        mengen_modell: 'realistisch',
        preis_modell: 'inflation',
        kosten_modell: 'inflation',
        zeitraum: 5
      }
    });
  }
  
  if (section5.subscription) {
    articles.push({
      id: 'subscription-saas',
      name: 'Subscription / SaaS',
      typ: 'Subscription',
      source: 'section5-checkbox',
      confidence: 0.87,
      reasoning: 'Subscription/SaaS in Section 5 angekreuzt',
      priority: 2,
      suggested_values: {
        start_menge: 150,
        start_preis: 500,
        start_hk: 50,
        mengen_modell: 'rogers',
        preis_modell: 'konstant',
        kosten_modell: 'skaleneffekte',
        zeitraum: 5
      }
    });
  }
  
  if (section5.license) {
    articles.push({
      id: 'software-license',
      name: 'Software-Lizenz',
      typ: 'License',
      source: 'section5-checkbox',
      confidence: 0.86,
      reasoning: 'Lizenzgebühr in Section 5 angekreuzt',
      priority: 2,
      suggested_values: {
        start_menge: 200,
        start_preis: 1000,
        start_hk: 100,
        mengen_modell: 'optimistisch',
        preis_modell: 'konstant',
        kosten_modell: 'konstant',
        zeitraum: 5
      }
    });
  }
  
  return {
    suggested_articles: articles,
    analysis_summary: 'Regelbasierte Vorschläge auf Basis von Section 5 Checkboxen. Für intelligentere Analyse bitte Geschäftsmodell vollständig ausfüllen.',
    total_articles: articles.length,
    confidence_score: 0.80,
    fallback_used: true
  };
}

// ==========================================
// EXPORTS
// ==========================================

export default {
  analyzeGeschaeftsmodellWithClaude,
  getFallbackSuggestions
};
