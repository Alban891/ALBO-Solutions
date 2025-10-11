/**
 * AI Router
 * Central orchestrator for all AI services
 * Routes queries to appropriate AI based on classification
 */

import { ClaudeService } from '../services/claude-service.js';
import { GPT4oService } from '../services/gpt4o-service.js';
import { PerplexityService } from '../services/perplexity-service.js';
import { QueryClassifier } from './query-classifier.js';
import { AI_CONFIG } from '../config/ai-config.js';

export class AIRouter {
    constructor() {
        this.services = {
            claude: new ClaudeService(),
            gpt4o: new GPT4oService(),
            perplexity: new PerplexityService()
        };
        
        this.classifier = new QueryClassifier();
        this.isInitialized = false;
    }
    
    /**
     * Initialize all AI services
     */
    async initialize() {
        console.log('🚀 Initializing AI Router...');
        
        // Initialize all services in parallel
        const results = await Promise.allSettled([
            this.services.claude.initialize(),
            this.services.gpt4o.initialize(),
            this.services.perplexity.initialize()
        ]);
        
        // Log results
        results.forEach((result, index) => {
            const serviceName = ['Claude', 'GPT-4o', 'Perplexity'][index];
            if (result.status === 'fulfilled' && result.value) {
                console.log(`✅ ${serviceName} initialized`);
            } else {
                console.warn(`⚠️ ${serviceName} unavailable`);
            }
        });
        
        this.isInitialized = true;
        console.log('✅ AI Router ready!');
        
        return true;
    }
    
    /**
     * Route query to appropriate AI
     * @param {string} query - User query
     * @param {Object} context - Context data
     * @param {Object} options - Additional options
     * @returns {Promise<Object>}
     */
    async query(query, context = {}, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        // Determine which AI to use
        let aiName = options.forceAI || this.classifier.classify(query, context);
        
        console.log(`🎯 Routing to: ${aiName}`);
        console.log(`📝 Query: "${query.substring(0, 100)}..."`);
        
        // Get service
        const service = this.services[aiName];
        
        if (!service || !service.isAvailable) {
            console.warn(`⚠️ ${aiName} unavailable, falling back...`);
            aiName = this.findFallback(aiName);
            
            if (!aiName) {
                return {
                    success: false,
                    error: true,
                    message: 'No AI services available',
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        // Execute query
        const response = await this.services[aiName].query(query, context, options);
        
        // Add routing metadata
        response.routing = {
            selected_ai: aiName,
            classification: this.classifier.classify(query, context),
            forced: !!options.forceAI
        };
        
        return response;
    }
    
    /**
     * Find fallback AI if primary unavailable
     */
    findFallback(primaryAI) {
        const fallbackChain = {
            claude: ['gpt4o', 'perplexity'],
            gpt4o: ['claude', 'perplexity'],
            perplexity: ['gpt4o', 'claude']
        };
        
        const fallbacks = fallbackChain[primaryAI] || [];
        
        for (const fallbackAI of fallbacks) {
            if (this.services[fallbackAI]?.isAvailable) {
                console.log(`✅ Fallback to: ${fallbackAI}`);
                return fallbackAI;
            }
        }
        
        return null;
    }
    
    /**
     * Get service by name
     */
    getService(name) {
        return this.services[name];
    }
    
    /**
     * Check which services are available
     */
    getAvailableServices() {
        return Object.entries(this.services)
            .filter(([_, service]) => service.isAvailable)
            .map(([name, _]) => name);
    }
}