/**
 * Perplexity Service
 * Implements AIServiceInterface for Perplexity AI
 * Used for: Market research, competitor analysis, real-time data
 */

import { AIServiceInterface } from './base/ai-service-interface.js';
import { MODEL_CONFIG } from '../config/ai-config.js';

export class PerplexityService extends AIServiceInterface {
    constructor() {
        super(MODEL_CONFIG.perplexity);
        this.name = 'perplexity';
        this.endpoint = '/api/perplexity';
    }
    
    async initialize() {
        console.log('🔍 Initializing Perplexity Service...');
        
        this.isAvailable = await this.healthCheck();
        
        if (this.isAvailable) {
            console.log('✅ Perplexity Service ready!');
        } else {
            console.error('❌ Perplexity Service unavailable');
        }
        
        return this.isAvailable;
    }
    
    async healthCheck() {
        try {
            const response = await this.query('Test', {}, { max_tokens: 10 });
            return response.success;
        } catch (error) {
            console.error('Perplexity health check failed:', error);
            return false;
        }
    }
    
    async query(query, context = {}, options = {}) {
        const startTime = Date.now();
        
        try {
            const messages = [];
            
            // System message
            if (context.systemPrompt || options.systemPrompt) {
                messages.push({
                    role: 'system',
                    content: context.systemPrompt || options.systemPrompt
                });
            }
            
            // User message
            messages.push({
                role: 'user',
                content: query
            });
            
            const requestBody = {
                model: this.config.model,
                messages: messages
            };
            
            // API Call to Vercel Function
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Perplexity API Error: ${error.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            const content = data.choices[0].message.content;
            const latency = Date.now() - startTime;
            
            return this.formatResponse(content, {
                cost: this.config.cost_per_request,
                latency: latency,
                citations: data.citations || []
            });
            
        } catch (error) {
            console.error('❌ Perplexity query failed:', error);
            return this.formatError(error);
        }
    }
    
    estimateCost(inputTokens, outputTokens) {
        return this.config.cost_per_request;
    }
}