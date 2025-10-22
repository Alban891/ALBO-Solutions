/**
 * Vercel Serverless Function: Case Ingest
 * Endpoint: /api/cases/ingest
 * 
 * Speichert Cases + generiert Embeddings
 * Kompatibel mit ALBO State Management
 */

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('📥 Case Ingest Request received');

        // 1. Parse Case Data
        const caseData = req.body;

        if (!caseData.case_name) {
            return res.status(400).json({ error: 'case_name required' });
        }

        // Get user/customer ID
        const userId = req.headers['x-user-id'] || 'demo_user';
        const customerId = caseData.customer_id || 'demo_customer';

        console.log(`💾 Ingesting case: ${caseData.case_name} for customer: ${customerId}`);

        // 2. Prepare Case for Database
        const dbCase = {
            case_name: caseData.case_name,
            description: caseData.description,
            business_unit: caseData.business_unit,
            project_owner: caseData.project_owner,
            status: caseData.status,
            start_date: caseData.start_date,
            planned_end_date: caseData.planned_end_date,
            actual_end_date: caseData.actual_end_date,
            duration_variance_days: caseData.duration_variance_days,
            abort_reason: caseData.abort_reason,
            
            // Financial Data
            revenue_planned: caseData.revenue_planned,
            revenue_actual: caseData.revenue_actual,
            costs_planned: caseData.costs_planned,
            costs_actual: caseData.costs_actual,
            db2_planned: caseData.db2_planned,
            db2_actual: caseData.db2_actual,
            roi_planned: caseData.roi_planned,
            roi_actual: caseData.roi_actual,
            npv_planned: caseData.npv_planned,
            npv_actual: caseData.npv_actual,
            payback_months_planned: caseData.payback_months_planned,
            payback_months_actual: caseData.payback_months_actual,
            
            // Complete Data
            case_data: caseData.case_data,
            
            // Learnings
            key_assumptions: caseData.key_assumptions,
            lessons_learned: caseData.lessons_learned,
            critical_decisions: caseData.critical_decisions,
            success_factors: caseData.success_factors,
            failure_factors: caseData.failure_factors,
            
            // Metadata
            industry: caseData.industry,
            complexity: caseData.complexity,
            project_size: caseData.project_size,
            rating: caseData.rating,
            tags: caseData.tags,
            searchable_summary: caseData.searchable_summary,
            
            // Multi-Tenant
            user_id: userId,
            customer_id: customerId
        };

        // 3. Insert into Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: 'Supabase not configured' });
        }

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/controlling_cases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(dbCase)
        });

        if (!insertResponse.ok) {
            const error = await insertResponse.text();
            console.error('❌ Supabase Insert Error:', error);
            throw new Error(`Supabase Error: ${error}`);
        }

        const insertedCase = await insertResponse.json();
        const caseId = insertedCase[0].id;

        console.log(`✅ Case inserted with ID: ${caseId}`);

        // 4. Generate Embeddings
        const chunks = createCaseChunks(caseData);
        console.log(`🔄 Generating ${chunks.length} embeddings...`);

        const embeddingPromises = chunks.map(chunk => 
            generateAndStoreEmbedding(chunk, caseId, userId, customerId, supabaseUrl, supabaseKey)
        );

        await Promise.all(embeddingPromises);

        console.log(`✅ ${chunks.length} embeddings created`);

        // 5. Return Success
        return res.status(200).json({
            success: true,
            case_id: caseId,
            embeddings_created: chunks.length,
            message: 'Case ingested successfully'
        });

    } catch (error) {
        console.error('❌ Case Ingest Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

/**
 * Create searchable chunks from case
 */
function createCaseChunks(caseData) {
    const chunks = [];

    // 1. Full Summary (MOST IMPORTANT)
    chunks.push({
        type: 'full_summary',
        content: caseData.searchable_summary || `
            ${caseData.case_name} in ${caseData.industry || 'N/A'}.
            Business Unit: ${caseData.business_unit || 'N/A'}.
            Status: ${caseData.status}.
            ROI: ${caseData.roi_actual || 'N/A'}.
            ${caseData.description || ''}
        `.trim()
    });

    // 2. Business Model
    if (caseData.case_data?.business_model) {
        const bm = caseData.case_data.business_model;
        chunks.push({
            type: 'business_model',
            content: `
                ${bm.beschreibung || ''}
                Ziele: ${bm.ziele?.join(', ') || ''}
                Scope: ${bm.scope || ''}
            `.trim()
        });
    }

    // 3. Financials
    if (caseData.roi_planned || caseData.roi_actual) {
        chunks.push({
            type: 'financials',
            content: `
                ROI geplant: ${caseData.roi_planned || 'N/A'}
                ROI tatsächlich: ${caseData.roi_actual || 'N/A'}
                NPV geplant: ${caseData.npv_planned || 'N/A'}
                NPV tatsächlich: ${caseData.npv_actual || 'N/A'}
                Investment: ${caseData.revenue_planned || 'N/A'}
                Savings: ${caseData.costs_planned || 'N/A'}
            `.trim()
        });
    }

    // 4. Assumptions (CRITICAL!)
    if (caseData.key_assumptions && caseData.key_assumptions.length > 0) {
        const assumptionsText = caseData.key_assumptions
            .map(a => `${a.assumption} - ${a.actual_outcome} - ${a.deviation_reason}`)
            .join('\n');
        chunks.push({
            type: 'assumptions',
            content: assumptionsText
        });
    }

    // 5. Lessons Learned (GOLD!)
    if (caseData.lessons_learned) {
        const ll = caseData.lessons_learned;
        chunks.push({
            type: 'lessons',
            content: `
                Was gut lief: ${ll.what_went_well?.join(', ') || 'N/A'}
                Was schlecht lief: ${ll.what_went_wrong?.join(', ') || 'N/A'}
                Was anders machen: ${ll.what_to_do_differently?.join(', ') || 'N/A'}
            `.trim()
        });
    }

    // 6. Decisions
    if (caseData.critical_decisions && caseData.critical_decisions.length > 0) {
        const decisionsText = caseData.critical_decisions
            .map(d => `${d.decision}: ${d.rationale} - ${d.outcome}`)
            .join('\n');
        chunks.push({
            type: 'decisions',
            content: decisionsText
        });
    }

    return chunks;
}

/**
 * Generate embedding and store
 */
async function generateAndStoreEmbedding(chunk, caseId, userId, customerId, supabaseUrl, supabaseKey) {
    try {
        // 1. Generate Embedding via OpenAI
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            throw new Error('OpenAI API Key not configured');
        }

        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: chunk.content
            })
        });

        if (!embeddingResponse.ok) {
            throw new Error('OpenAI Embedding failed');
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // 2. Store in Supabase
        const storeResponse = await fetch(`${supabaseUrl}/rest/v1/case_embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                case_id: caseId,
                embedding: `[${embedding.join(',')}]`,
                chunk_type: chunk.type,
                content: chunk.content,
                user_id: userId,
                customer_id: customerId
            })
        });

        if (!storeResponse.ok) {
            throw new Error(`Failed to store embedding: ${await storeResponse.text()}`);
        }

        console.log(`✅ Embedding stored for chunk type: ${chunk.type}`);
        return true;

    } catch (error) {
        console.error(`❌ Embedding generation failed for ${chunk.type}:`, error);
        throw error;
    }
}