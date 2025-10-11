/**
 * Vercel Serverless Function: Claude Proxy
 * Endpoint: /api/claude
 */

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        console.log('📨 Claude Request received');
        
        // Get API key from environment variable
        const apiKey = process.env.ANTHROPIC_API_KEY;
        
        if (!apiKey) {
            return res.status(401).json({ 
                error: { message: 'Anthropic API Key not configured' }
            });
        }
        
        // Forward to Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ Claude API Error:', data);
            return res.status(response.status).json(data);
        }
        
        console.log('✅ Claude Response:', {
            tokens: data.usage,
            stop_reason: data.stop_reason
        });
        
        res.status(200).json(data);
        
    } catch (error) {
        console.error('❌ Claude Proxy Error:', error);
        res.status(500).json({ 
            error: { message: error.message }
        });
    }
}