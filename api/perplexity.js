/**
 * Vercel Serverless Function: Perplexity Proxy
 * Endpoint: /api/perplexity
 */

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        console.log('📨 Perplexity Request received');
        
        // Get API key from environment variable
        const apiKey = process.env.PERPLEXITY_API_KEY;
        
        if (!apiKey) {
            console.error('⚠️ PERPLEXITY_API_KEY not configured');
            return res.status(500).json({ 
                error: { 
                    message: 'Perplexity API Key not configured in Vercel environment variables' 
                }
            });
        }
        
        // Forward to Perplexity API
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ Perplexity API Error:', data);
            return res.status(response.status).json(data);
        }
        
        console.log('✅ Perplexity Response');
        
        res.status(200).json(data);
        
    } catch (error) {
        console.error('❌ Perplexity Proxy Error:', error);
        res.status(500).json({ 
            error: { message: error.message }
        });
    }
}