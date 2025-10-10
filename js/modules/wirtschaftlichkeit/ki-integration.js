/**
 * CFO Dashboard - Wirtschaftlichkeit Module  
 * AI Integration - Legal Cost Categorization
 * 
 * @module wirtschaftlichkeit/ki-integration
 * @description AI-powered cost block categorization with HGB/IFRS reasoning
 * @author Senior Development Team
 * @version 2.0.0
 */

import {
    KOSTEN_MAPPING,
    MEHRDEUTIGE_BLOECKE,
    RECHTSGRUNDLAGEN_DB
} from './wirtschaftlichkeit-constants.js';

/**
 * Analyze cost block and provide intelligent categorization
 * Uses Claude AI for legal reasoning based on HGB § 275
 * 
 * @param {import('./types').AIKategorisierungsRequest} request - Categorization request
 * @returns {Promise<import('./types').AIKategorisierungsResponse>} AI response with reasoning
 * 
 * @example
 * const result = await analyzeKostenblockKategorisierung({
 *   blockName: 'Security Tools',
 *   projektKontext: 'Cyber Security Consulting Project',
 *   branche: 'IT-Security'
 * });
 * console.log(result.begründung);
 */
export async function analyzeKostenblockKategorisierung(request) {
    const {
        blockName,
        blockBeschreibung = '',
        projektKontext = '',
        branche = ''
    } = request;
    
    try {
        // Check if block has predefined mapping
        const predefinedCategory = checkPredefinedMapping(blockName);
        if (predefinedCategory && !isAmbiguous(blockName)) {
            return createPredefinedResponse(blockName, predefinedCategory);
        }
        
        // For ambiguous blocks or unknown, use AI
        const aiResponse = await callClaudeAPI(request);
        
        // Validate and enrich response
        return enrichAIResponse(aiResponse, blockName);
        
    } catch (error) {
        console.error('Fehler bei KI-Kategorisierung:', error);
        return createFallbackResponse(blockName, error.message);
    }
}

/**
 * Check if block has predefined mapping in KOSTEN_MAPPING
 * 
 * @param {string} blockName - Block name to check
 * @returns {string|null} Category ('development', 'selling_marketing', 'admin_distribution') or null
 * 
 * @private
 */
function checkPredefinedMapping(blockName) {
    const blockId = blockName.toLowerCase().replace(/\s+/g, '-');
    
    for (const [category, blockIds] of Object.entries(KOSTEN_MAPPING)) {
        if (blockIds.includes(blockId) || blockIds.includes(blockName)) {
            return category;
        }
    }
    
    return null;
}

/**
 * Check if block is marked as ambiguous
 * 
 * @param {string} blockName - Block name
 * @returns {boolean} True if ambiguous
 * 
 * @private
 */
function isAmbiguous(blockName) {
    const blockId = blockName.toLowerCase().replace(/\s+/g, '-');
    return Object.keys(MEHRDEUTIGE_BLOECKE).includes(blockId);
}

/**
 * Create response for predefined (non-ambiguous) blocks
 * 
 * @param {string} blockName - Block name
 * @param {string} kategorie - Predefined category
 * @returns {import('./types').AIKategorisierungsResponse} Response
 * 
 * @private
 */
function createPredefinedResponse(blockName, kategorie) {
    const mapping = {
        development: {
            begründung: 'Nach HGB § 275 Abs. 2 Nr. 5 sind Aufwendungen für Forschung und Entwicklung gesondert auszuweisen.',
            rechtsgrundlage: 'HGB § 275 Abs. 2 Nr. 5',
            konfidenz: 95
        },
        selling_marketing: {
            begründung: 'Nach HGB § 275 Abs. 2 Nr. 6 sind Vertriebskosten gesondert auszuweisen. ' +
                       'Dazu gehören alle Kosten zur Absatzförderung und Kundenbetreuung.',
            rechtsgrundlage: 'HGB § 275 Abs. 2 Nr. 6',
            konfidenz: 95
        },
        admin_distribution: {
            begründung: 'Nach HGB § 275 Abs. 2 Nr. 7 sind allgemeine Verwaltungskosten gesondert auszuweisen. ' +
                       'Dazu gehören nicht direkt zurechenbare Kosten.',
            rechtsgrundlage: 'HGB § 275 Abs. 2 Nr. 7',
            konfidenz: 95
        }
    };
    
    return {
        kategorie,
        ...mapping[kategorie],
        praxis_tipp: `Dieser Kostenblock ist eindeutig der Kategorie "${kategorie}" zugeordnet.`
    };
}

/**
 * Call Claude API for AI-powered categorization
 * 
 * @param {import('./types').AIKategorisierungsRequest} request - Request
 * @returns {Promise<import('./types').AIKategorisierungsResponse>} AI response
 * 
 * @private
 */
async function callClaudeAPI(request) {
    const {
        blockName,
        blockBeschreibung,
        projektKontext,
        branche
    } = request;
    
    const prompt = buildAIPrompt(blockName, blockBeschreibung, projektKontext, branche);
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2500,
            temperature: 0.3,  // Lower temperature for more consistent legal reasoning
            messages: [
                { role: "user", content: prompt }
            ]
        })
    });
    
    if (!response.ok) {
        throw new Error(`Claude API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    let responseText = data.content[0].text;
    
    // Strip markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    try {
        return JSON.parse(responseText);
    } catch (parseError) {
        console.error('Failed to parse AI response:', responseText);
        throw new Error('AI response is not valid JSON');
    }
}

/**
 * Build comprehensive AI prompt for categorization
 * 
 * @param {string} blockName - Block name
 * @param {string} blockBeschreibung - Block description
 * @param {string} projektKontext - Project context
 * @param {string} branche - Industry sector
 * @returns {string} Complete prompt
 * 
 * @private
 */
function buildAIPrompt(blockName, blockBeschreibung, projektKontext, branche) {
    return `Du bist ein Experte für deutsches Bilanzrecht (HGB), internationale Rechnungslegung (IFRS) und Controller-Kostenrechnung.

**AUFGABE:**
Analysiere den folgenden Kostenblock und ordne ihn der korrekten Kategorie in der Deckungsbeitragsrechnung zu.

**KOSTENBLOCK:**
- Name: "${blockName}"
${blockBeschreibung ? `- Beschreibung: "${blockBeschreibung}"` : ''}
${projektKontext ? `- Projekt-Kontext: "${projektKontext}"` : ''}
${branche ? `- Branche: "${branche}"` : ''}

**KATEGORIEN ZUR AUSWAHL:**
1. **development** → DB3 (Forschungs- und Entwicklungskosten)
   - HGB § 275 Abs. 2 Nr. 5: Aufwendungen für Forschung und Entwicklung
   - Beispiele: Entwicklungspersonal, Dev-Infrastruktur, Prototyping

2. **selling_marketing** → DB4 (Vertriebs- und Marketingkosten)
   - HGB § 275 Abs. 2 Nr. 6: Vertriebskosten
   - Beispiele: Vertriebspersonal, Marketing-Kampagnen, Kundenschulungen

3. **admin_distribution** → DB5 (Verwaltungs- und Verteilungskosten)
   - HGB § 275 Abs. 2 Nr. 7: Allgemeine Verwaltungskosten
   - Beispiele: Buchhaltung, HR, IT-Administration, Logistik

**DEINE AUFGABE:**
1. Wähle die passendste Kategorie (development, selling_marketing, admin_distribution)
2. Begründe detailliert mit Verweis auf HGB § 275 oder andere Rechtsgrundlagen
3. Gib eine Konfidenz (0-100%) an
4. Falls mehrdeutig: Nenne alternative Kategorisierung mit Bedingung
5. Füge einen Praxis-Tipp hinzu (z.B. Zeiterfassung, Kostenstellen-Mapping)
6. Optional: Steuerliche Hinweise (z.B. FZulG bei F&E)

**WICHTIGE HINWEISE:**
- Beck'scher Bilanz-Kommentar § 275 Rn. 182: IT-Security während Entwicklung = F&E
- IDW RS HFA 13: Kostenstellen-Mapping ist entscheidend für Zuordnung
- Bei Schulungen: Kundenschulung = Vertrieb, Mitarbeiterschulung = je nach Abteilung
- Cloud-Kosten: Dev-Environment = F&E, Production = Verwaltung
- Bei Mehrdeutigkeit: Zeiterfassung durchführen (>50% = Hauptkategorie)

**ANTWORTFORMAT (ZWINGEND JSON):**
{
  "kategorie": "development" | "selling_marketing" | "admin_distribution",
  "konfidenz": 85,
  "begründung": "Nach HGB § 275 Abs. 2 Nr. X sind...",
  "rechtsgrundlage": "HGB § 275 Abs. 2 Nr. X",
  "alternative": {
    "kategorie": "admin_distribution",
    "bedingung": "Falls die Nutzung primär für...",
    "konfidenz": 35,
    "rechtsgrundlage": "HGB § 275 Abs. 2 Nr. Y"
  },
  "praxis_tipp": "Führen Sie eine Zeiterfassung durch...",
  "steuerlicher_hinweis": "Beachten Sie: F&E-Kosten können...",
  "differenzierung": {
    "entwicklungsphase": "development",
    "produktionsphase": "admin_distribution"
  }
}

**ANTWORTE NUR MIT DEM JSON-OBJEKT, OHNE ZUSÄTZLICHEN TEXT!**`;
}

/**
 * Enrich and validate AI response
 * 
 * @param {any} aiResponse - Raw AI response
 * @param {string} blockName - Original block name
 * @returns {import('./types').AIKategorisierungsResponse} Enriched response
 * 
 * @private
 */
function enrichAIResponse(aiResponse, blockName) {
    // Validate required fields
    if (!aiResponse.kategorie || !aiResponse.begründung) {
        throw new Error('AI response missing required fields');
    }
    
    // Ensure kategorie is valid
    const validCategories = ['development', 'selling_marketing', 'admin_distribution'];
    if (!validCategories.includes(aiResponse.kategorie)) {
        throw new Error(`Invalid category: ${aiResponse.kategorie}`);
    }
    
    // Add legal reference details if available
    if (aiResponse.rechtsgrundlage && RECHTSGRUNDLAGEN_DB[aiResponse.rechtsgrundlage]) {
        const legalRef = RECHTSGRUNDLAGEN_DB[aiResponse.rechtsgrundlage];
        aiResponse._rechtsgrundlage_details = {
            titel: legalRef.titel,
            link: legalRef.link
        };
    }
    
    // Add timestamp
    aiResponse._timestamp = new Date().toISOString();
    
    // Add source
    aiResponse._quelle = 'Claude AI (Sonnet 4)';
    
    return aiResponse;
}

/**
 * Create fallback response in case of error
 * 
 * @param {string} blockName - Block name
 * @param {string} errorMessage - Error message
 * @returns {import('./types').AIKategorisierungsResponse} Fallback response
 * 
 * @private
 */
function createFallbackResponse(blockName, errorMessage) {
    console.warn(`Fallback response for ${blockName}: ${errorMessage}`);
    
    // Try to guess category based on name
    const blockLower = blockName.toLowerCase();
    let kategorie = 'admin_distribution';  // Default
    let begründung = 'Automatische Zuordnung aufgrund des Namens. Bitte manuell prüfen.';
    
    if (blockLower.includes('dev') || blockLower.includes('entwicklung') || 
        blockLower.includes('f&e') || blockLower.includes('forschung')) {
        kategorie = 'development';
        begründung = 'Der Name deutet auf Entwicklungskosten hin (HGB § 275 Abs. 2 Nr. 5). Bitte manuell bestätigen.';
    } else if (blockLower.includes('vertrieb') || blockLower.includes('marketing') || 
               blockLower.includes('verkauf') || blockLower.includes('sales')) {
        kategorie = 'selling_marketing';
        begründung = 'Der Name deutet auf Vertriebs-/Marketingkosten hin (HGB § 275 Abs. 2 Nr. 6). Bitte manuell bestätigen.';
    }
    
    return {
        kategorie,
        konfidenz: 40,
        begründung,
        rechtsgrundlage: 'HGB § 275 Abs. 2',
        praxis_tipp: 'Diese Zuordnung basiert auf einer automatischen Analyse. ' +
                     'Bitte prüfen Sie die Kategorisierung manuell und passen Sie sie bei Bedarf an.',
        _error: errorMessage,
        _fallback: true
    };
}

/**
 * Batch categorize multiple cost blocks
 * More efficient than calling individually
 * 
 * @param {import('./types').AIKategorisierungsRequest[]} requests - Array of requests
 * @returns {Promise<import('./types').AIKategorisierungsResponse[]>} Array of responses
 * 
 * @example
 * const results = await batchAnalyzeKostenblöcke([
 *   { blockName: 'Security Tools', projektKontext: '...' },
 *   { blockName: 'Cloud Infrastructure', projektKontext: '...' }
 * ]);
 */
export async function batchAnalyzeKostenblöcke(requests) {
    const results = [];
    
    // Process in parallel with limit to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(req => analyzeKostenblockKategorisierung(req))
        );
        results.push(...batchResults);
        
        // Small delay between batches
        if (i + batchSize < requests.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    return results;
}

/**
 * Get detailed legal reference information
 * 
 * @param {string} rechtsgrundlage - Legal reference (e.g., "HGB § 275")
 * @returns {Object|null} Detailed legal information or null
 * 
 * @example
 * const info = getLegalReferenceDetails('HGB § 275');
 * console.log(info.titel); // "Gliederung der Gewinn- und Verlustrechnung"
 */
export function getLegalReferenceDetails(rechtsgrundlage) {
    // Try to find in RECHTSGRUNDLAGEN_DB
    for (const [key, value] of Object.entries(RECHTSGRUNDLAGEN_DB)) {
        if (rechtsgrundlage.includes(key)) {
            return value;
        }
    }
    
    return null;
}

/**
 * Validate categorization result
 * Check if categorization is plausible based on business rules
 * 
 * @param {import('./types').AIKategorisierungsResponse} result - Categorization result
 * @returns {Object} Validation result {isValid: boolean, warnings: string[]}
 * 
 * @example
 * const validation = validateKategorisierung(aiResult);
 * if (!validation.isValid) {
 *   console.warn('Categorization warnings:', validation.warnings);
 * }
 */
export function validateKategorisierung(result) {
    const warnings = [];
    
    // Check confidence threshold
    if (result.konfidenz < 60) {
        warnings.push(`Niedrige Konfidenz (${result.konfidenz}%) - Manuelle Prüfung empfohlen`);
    }
    
    // Check if alternative exists with high confidence
    if (result.alternative && result.alternative.konfidenz > 40) {
        warnings.push(`Alternative Kategorisierung mit ${result.alternative.konfidenz}% möglich`);
    }
    
    // Check if legal reference is provided
    if (!result.rechtsgrundlage) {
        warnings.push('Keine Rechtsgrundlage angegeben');
    }
    
    // Check if this is a fallback response
    if (result._fallback) {
        warnings.push('Dies ist eine automatische Fallback-Kategorisierung');
    }
    
    return {
        isValid: warnings.length === 0 || result.konfidenz >= 70,
        warnings
    };
}

/**
 * Create audit trail entry for categorization
 * For documentation and compliance
 * 
 * @param {string} kostenblockId - Cost block ID
 * @param {import('./types').AIKategorisierungsResponse} result - Categorization result
 * @param {string} [benutzerEntscheidung='accepted'] - User decision ('accepted', 'modified', 'rejected')
 * @param {string} [bemerkung=''] - User comment
 * @returns {Object} Audit trail entry
 */
export function createAuditTrailEntry(kostenblockId, result, benutzerEntscheidung = 'accepted', bemerkung = '') {
    return {
        kostenblock_id: kostenblockId,
        kategorie: result.kategorie,
        zeitpunkt: new Date().toISOString(),
        begründung: result.begründung,
        rechtsgrundlage: result.rechtsgrundlage,
        ki_konfidenz: result.konfidenz,
        ki_quelle: result._quelle || 'Claude AI',
        benutzer_entscheidung: benutzerEntscheidung,
        bemerkung: bemerkung,
        alternative_kategorie: result.alternative?.kategorie || null,
        praxis_tipp: result.praxis_tipp
    };
}

/**
 * Export public API
 */
export default {
    analyzeKostenblockKategorisierung,
    batchAnalyzeKostenblöcke,
    getLegalReferenceDetails,
    validateKategorisierung,
    createAuditTrailEntry
};