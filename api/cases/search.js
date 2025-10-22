/**
 * Vercel Serverless Function: Case Search
 * Endpoint: /api/cases/search
 * 
 * Semantic Search für historische Controlling Cases
 * Kompatibel mit ALBO State Management
 */

export default async function handler(req, res) {
    // CORS Headers
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
        console.log('🔍 Case Search Request received');

        // 1. Parse Request
        const { query, filters = {}, limit = 5, customerId } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query string required' });
        }

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID required' });
        }

        console.log(`📊 Search: "${query}" for customer: ${customerId}`);

        // 2. Generate Embedding via OpenAI
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            return res.status(500).json({ error: 'OpenAI API Key not configured' });
        }

        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: query
            })
        });

        if (!embeddingResponse.ok) {
            const error = await embeddingResponse.json();
            throw new Error(`OpenAI Embedding Error: ${error.error?.message}`);
        }

        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding;

        console.log(`✅ Embedding generated: ${queryEmbedding.length} dimensions`);

        // 3. Search via Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: 'Supabase not configured' });
        }

        // Call search function
        const searchResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/search_similar_cases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                query_embedding: `[${queryEmbedding.join(',')}]`,
                filter_customer_id: customerId,
                filter_business_unit: filters.business_unit || null,
                filter_status: filters.status || null,
                filter_roi_min: filters.roi_min || null,
                filter_roi_max: filters.roi_max || null,
                match_threshold: filters.threshold || 0.65,
                match_count: limit
            })
        });

        if (!searchResponse.ok) {
            const error = await searchResponse.text();
            console.error('❌ Supabase Search Error:', error);
            throw new Error(`Supabase Error: ${error}`);
        }

        const results = await searchResponse.json();

        console.log(`✅ Found ${results.length} similar cases`);

        // 4. Format Results
        const formattedResults = results.map(r => ({
            case_id: r.case_id,
            similarity: Math.round(r.similarity * 100),
            case_name: r.case_name,
            description: r.description,
            business_unit: r.business_unit,
            status: r.status,
            roi_actual: r.roi_actual,
            db2_actual: r.db2_actual,
            revenue_actual: r.revenue_actual,
            rating: r.rating,
            tags: r.tags || [],
            summary: r.content ? r.content.substring(0, 200) + '...' : ''
        }));

        // 5. Log Search (Analytics)
        try {
            await fetch(`${supabaseUrl}/rest/v1/case_search_history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    user_id: req.headers['x-user-id'] || 'anonymous',
                    customer_id: customerId,
                    query: query,
                    filters: filters,
                    results_count: results.length,
                    top_result_id: results[0]?.case_id || null,
                    search_duration_ms: Date.now() - req.timestamp || 0
                })
            });
        } catch (logError) {
            console.warn('⚠️ Failed to log search history:', logError);
        }

        // 6. Return Results
        return res.status(200).json({
            success: true,
            results: formattedResults,
            count: formattedResults.length,
            query: query,
            filters: filters
        });

    } catch (error) {
        console.error('❌ Case Search Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}