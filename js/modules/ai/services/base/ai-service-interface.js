/**
 * AI Service Interface (Base Class)
 * All AI services must implement this interface
 */

export class AIServiceInterface {
    constructor(config) {
        this.config = config;
        this.name = 'base';
        this.isAvailable = false;
    }
    
    /**
     * Initialize the service
     * @returns {Promise<boolean>}
     */
    async initialize() {
        throw new Error('initialize() must be implemented by subclass');
    }
    
    /**
     * Check if service is healthy and available
     * @returns {Promise<boolean>}
     */
    async healthCheck() {
        throw new Error('healthCheck() must be implemented by subclass');
    }
    
    /**
     * Send a query to the AI
     * @param {string} query - User query
     * @param {Object} context - Context data
     * @param {Object} options - Additional options
     * @returns {Promise<Object>}
     */
    async query(query, context = {}, options = {}) {
        throw new Error('query() must be implemented by subclass');
    }
    
    /**
     * Stream a response (for long outputs)
     * @param {string} query
     * @param {Object} context
     * @param {Function} onChunk - Callback for each chunk
     * @returns {Promise<Object>}
     */
    async streamQuery(query, context = {}, onChunk = null) {
        throw new Error('streamQuery() must be implemented by subclass');
    }
    
    /**
     * Estimate cost of a query
     * @param {number} inputTokens
     * @param {number} outputTokens
     * @returns {number} - Cost in USD
     */
    estimateCost(inputTokens, outputTokens) {
        throw new Error('estimateCost() must be implemented by subclass');
    }
    
    /**
     * Count tokens in text (approximate)
     * @param {string} text
     * @returns {number}
     */
    countTokens(text) {
        // Simple approximation: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }
    
    /**
     * Format error response
     * @param {Error} error
     * @returns {Object}
     */
    formatError(error) {
        return {
            success: false,
            error: true,
            message: error.message,
            service: this.name,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Format success response
     * @param {string} content
     * @param {Object} metadata
     * @returns {Object}
     */
    formatResponse(content, metadata = {}) {
        return {
            success: true,
            error: false,
            content: content,
            service: this.name,
            timestamp: new Date().toISOString(),
            metadata: {
                model: this.config.model,
                tokens: {
                    input: metadata.input_tokens || 0,
                    output: metadata.output_tokens || 0
                },
                cost: metadata.cost || 0,
                latency: metadata.latency || 0,
                ...metadata
            }
        };
    }
}