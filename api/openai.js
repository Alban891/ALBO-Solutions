/**
 * Vercel Serverless Function: OpenAI Proxy
 * Endpoint: /api/openai
 */

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        console.log('📨 OpenAI Request received');
        
        // Get API key from environment variable
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            console.error('⚠️ OPENAI_API_KEY not configured');
            return res.status(500).json({ 
                error: { 
                    message: 'OpenAI API Key not configured in Vercel environment variables' 
                }
            });
        }
        
        // Forward to OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ OpenAI API Error:', data);
            return res.status(response.status).json(data);
        }
        
        console.log('✅ OpenAI Response:', {
            tokens: data.usage,
            finish_reason: data.choices[0]?.finish_reason
        });
        
        res.status(200).json(data);
        
    } catch (error) {
        console.error('❌ OpenAI Proxy Error:', error);
        res.status(500).json({ 
            error: { message: error.message }
        });
    }
}