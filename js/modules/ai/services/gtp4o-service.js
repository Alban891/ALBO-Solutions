/**
 * GPT-4o Service (OpenAI)
 * Implements AIServiceInterface for GPT-4o
 * Used for: Quick queries, structured data extraction, conversational UI
 */

import { AIServiceInterface } from './base/ai-service-interface.js';
import { MODEL_CONFIG } from '../config/ai-config.js';

export class GPT4oService extends AIServiceInterface {
    constructor() {
        super(MODEL_CONFIG.gpt4o);
        this.name = 'gpt4o';
        this.endpoint = '/api/openai';
    }
    
    async initialize() {
        console.log('🤖 Initializing GPT-4o Service...');
        
        this.isAvailable = await this.healthCheck();
        
        if (this.isAvailable) {
            console.log('✅ GPT-4o Service ready!');
        } else {
            console.error('❌ GPT-4o Service unavailable');
        }
        
        return this.isAvailable;
    }
    
    async healthCheck() {
        try {
            const response = await this.query('Hi', {}, { max_tokens: 5 });
            return response.success;
        } catch (error) {
            console.error('GPT-4o health check failed:', error);
            return false;
        }
    }
    
    async query(query, context = {}, options = {}) {
        const startTime = Date.now();
        
        try {
            // Build messages
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
                content: this.buildPrompt(query, context)
            });
            
            // Request body
            const requestBody = {
                model: this.config.model,
                messages: messages,
                max_tokens: options.max_tokens || this.config.max_tokens,
                temperature: options.temperature || this.config.temperature
            };
            
            // JSON mode if requested
            if (options.json_mode) {
                requestBody.response_format = { type: 'json_object' };
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
                throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            // Extract response
            const content = data.choices[0].message.content;
            const inputTokens = data.usage.prompt_tokens;
            const outputTokens = data.usage.completion_tokens;
            const cost = this.estimateCost(inputTokens, outputTokens);
            const latency = Date.now() - startTime;
            
            return this.formatResponse(content, {
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                cost: cost,
                latency: latency,
                finish_reason: data.choices[0].finish_reason
            });
            
        } catch (error) {
            console.error('❌ GPT-4o query failed:', error);
            return this.formatError(error);
        }
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