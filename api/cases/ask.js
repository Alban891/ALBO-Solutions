/**
 * Vercel Serverless Function: RAG-powered Case Analysis
 * Endpoint: /api/cases/ask
 * 
 * Full RAG Pipeline:
 * 1. RETRIEVAL: Vector search für relevante Cases
 * 2. AUGMENTATION: Context in Prompt einbauen
 * 3. GENERATION: Claude generiert Antwort
 */

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('🤖 RAG Ask Request received');

        const { question, customerId, includeContext = true } = req.body;

        if (!question || typeof question !== 'string') {
            return res.status(400).json({ error: 'Question required' });
        }

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID required' });
        }

        console.log(`💬 Question: "${question}"`);

        // ========================================
        // STEP 1: RETRIEVAL
        // ========================================

        console.log('🔍 Step 1: Retrieving similar cases...');

        const searchResponse = await fetch(`${req.headers.host.includes('localhost') ? 'http' : 'https'}://${req.headers.host}/api/cases/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': req.headers['x-user-id'] || 'anonymous'
            },
            body: JSON.stringify({
                query: question,
                customerId: customerId,
                filters: {},
                limit: 3
            })
        });

        if (!searchResponse.ok) {
            throw new Error('Failed to retrieve similar cases');
        }

        const searchResults = await searchResponse.json();
        console.log(`✅ Retrieved ${searchResults.count} similar cases`);

        // ========================================
        // STEP 2: AUGMENTATION
        // ========================================

        console.log('📝 Step 2: Building context from cases...');

        let contextSection = '';

        if (includeContext && searchResults.results.length > 0) {
            contextSection = `
RELEVANTE HISTORISCHE BUSINESS CASES:
${searchResults.results.map((c, i) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASE ${i + 1}: ${c.case_name} (${c.similarity}% Match)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PROJEKT-ÜBERSICHT:
• Status: ${c.status}
• Business Unit: ${c.business_unit}
• Rating: ${c.rating}/5

💰 FINANZKENNZAHLEN:
• ROI Actual: ${c.roi_actual ? (c.roi_actual * 100).toFixed(1) + '%' : 'N/A'}
• DB2 Actual: ${c.db2_actual ? (c.db2_actual * 100).toFixed(1) + '%' : 'N/A'}
• Revenue Actual: ${c.revenue_actual ? '€' + c.revenue_actual.toLocaleString() : 'N/A'}

📝 ZUSAMMENFASSUNG:
${c.summary}

🏷️ TAGS: ${c.tags.join(', ')}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
        } else {
            contextSection = '\n⚠️ HINWEIS: Keine ähnlichen historischen Cases gefunden.\n';
        }

        // ========================================
        // STEP 3: GENERATION
        // ========================================

        console.log('🎯 Step 3: Generating Claude response...');

        const systemPrompt = `Du bist ein erfahrener **CFO-Advisor und Finance Controller** mit über 20 Jahren Erfahrung in Business Case Management, M&A, Treasury und strategischer Finanzplanung.

DEINE ROLLE:
• Analysiere Business Cases basierend auf historischen Daten
• Identifiziere Risiken und Erfolgsfaktoren aus Past Cases
• Gib konkrete, datenbasierte Empfehlungen
• Zitiere Zahlen und Lessons Learned aus ähnlichen Projekten

ANTWORTSTIL:
• Strukturiert und prägnant
• Nutze Emojis für Übersichtlichkeit (⚠️ 🎯 ✅ 📊 💡)
• Beginne mit einer Executive Summary (2-3 Sätze)
• Dann detaillierte Analyse
• Schließe mit konkreten Handlungsempfehlungen

WICHTIG:
• Beziehe dich IMMER auf die bereitgestellten historischen Cases
• Zitiere konkrete Zahlen (ROI, Varianzen, etc.)
• Wenn keine ähnlichen Cases existieren, kommuniziere das klar
• Bleibe objektiv und datengetrieben`;

        const userPrompt = `${contextSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER FRAGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${question}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bitte analysiere die Frage basierend auf den historischen Cases und gib eine fundierte Antwort.`;

        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            return res.status(500).json({ error: 'Anthropic API Key not configured' });
        }

        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2000,
                temperature: 0.7,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: userPrompt
                }]
            })
        });

        if (!claudeResponse.ok) {
            const error = await claudeResponse.json();
            console.error('❌ Claude API Error:', error);
            throw new Error(`Claude API Error: ${error.error?.message || 'Unknown error'}`);
        }

        const claudeData = await claudeResponse.json();
        const answer = claudeData.content[0].text;

        console.log('✅ Claude response generated');

        // ========================================
        // RETURN RESPONSE
        // ========================================

        return res.status(200).json({
            success: true,
            answer: answer,
            sources: searchResults.results.map(r => ({
                case_id: r.case_id,
                case_name: r.case_name,
                similarity: r.similarity,
                status: r.status,
                roi_actual: r.roi_actual,
                rating: r.rating
            })),
            metadata: {
                question: question,
                sources_count: searchResults.count,
                model: 'claude-sonnet-4-20250514',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ RAG Ask Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}