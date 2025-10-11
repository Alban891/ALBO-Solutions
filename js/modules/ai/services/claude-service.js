/**
 * Claude Service (Anthropic)
 * Implements AIServiceInterface for Claude Sonnet 4
 */

import { AIServiceInterface } from './base/ai-service-interface.js';
import { MODEL_CONFIG } from '../config/ai-config.js';

export class ClaudeService extends AIServiceInterface {
    constructor() {
        super(MODEL_CONFIG.claude);
        this.name = 'claude';
        this.endpoint = '/api/claude';
    }
    
    async initialize() {
        console.log('🤖 Initializing Claude Service...');
        
        // Health check (API key wird in Vercel Function geprüft)
        this.isAvailable = await this.healthCheck();
        
        if (this.isAvailable) {
            console.log('✅ Claude Service ready!');
        } else {
            console.error('❌ Claude Service unavailable');
        }
        
        return this.isAvailable;
    }
    
    async healthCheck() {
        try {
            const response = await this.query('Hello', {}, { max_tokens: 10 });
            return response.success;
        } catch (error) {
            console.error('Claude health check failed:', error);
            return false;
        }
    }
    
    async query(query, context = {}, options = {}) {
        const startTime = Date.now();
        
        try {
            // Build request
            const requestBody = {
                model: this.config.model,
                max_tokens: options.max_tokens || this.config.max_tokens,
                temperature: options.temperature || this.config.temperature,
                messages: [
                    {
                        role: 'user',
                        content: this.buildPrompt(query, context)
                    }
                ]
            };
            
            // Add system prompt if provided
            if (context.systemPrompt || options.systemPrompt) {
                requestBody.system = context.systemPrompt || options.systemPrompt;
            }
            
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
                throw new Error(`Claude API Error: ${error.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            // Extract response
            const content = data.content[0].text;
            const inputTokens = data.usage.input_tokens;
            const outputTokens = data.usage.output_tokens;
            const cost = this.estimateCost(inputTokens, outputTokens);
            const latency = Date.now() - startTime;
            
            // Format response
            return this.formatResponse(content, {
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                cost: cost,
                latency: latency,
                stop_reason: data.stop_reason
            });
            
        } catch (error) {
            console.error('❌ Claude query failed:', error);
            return this.formatError(error);
        }
    }
    
    async streamQuery(query, context = {}, onChunk = null) {
        // TODO: Implement streaming in Phase 2
        console.warn('Streaming not yet implemented, falling back to regular query');
        return await this.query(query, context);
    }
    
    buildPrompt(query, context) {
        let prompt = query;
        
        if (context.projektName) {
            prompt = `Kontext: Projekt "${context.projektName}"\n\n${prompt}`;
        }
        
        if (context.branche) {
            prompt = `Branche: ${context.branche}\n\n${prompt}`;
        }
        
        return prompt;
    }
    
    estimateCost(inputTokens, outputTokens) {
        const inputCost = (inputTokens / 1000000) * this.config.cost_per_1m_input;
        const outputCost = (outputTokens / 1000000) * this.config.cost_per_1m_output;
        return inputCost + outputCost;
    }
}