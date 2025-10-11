/**
 * Query Classifier
 * Determines which AI should handle a query based on content and context
 */

export class QueryClassifier {
    
    /**
     * Classify query and determine best AI
     * @param {string} query - User query
     * @param {Object} context - Context information
     * @returns {string} - AI name: 'claude' | 'gpt4o' | 'perplexity'
     */
    classify(query, context = {}) {
        const queryLower = query.toLowerCase();
        const queryLength = query.length;
        
        // PERPLEXITY PATTERNS
        if (this.isMarketResearch(queryLower)) {
            return 'perplexity';
        }
        
        // GPT-4O PATTERNS (Quick & Structured)
        if (this.isQuickQuery(queryLower, queryLength)) {
            return 'gpt4o';
        }
        
        if (this.isDataExtraction(queryLower)) {
            return 'gpt4o';
        }
        
        // CLAUDE PATTERNS (Deep Reasoning)
        if (this.isFinancialAnalysis(queryLower)) {
            return 'claude';
        }
        
        if (this.isComplexReasoning(queryLower, queryLength)) {
            return 'claude';
        }
        
        // DEFAULT: Claude for safety
        return 'claude';
    }
    
    /**
     * Market Research indicators
     */
    isMarketResearch(query) {
        const patterns = [
            /benchmark/,
            /markt/,
            /wettbewerb/,
            /konkurrenz/,
            /industrie/,
            /branche/,
            /vdma/,
            /bitkom/,
            /gehalt/,
            /preis.*vergleich/,
            /aktuelle.*trend/,
            /wie viel kostet/
        ];
        
        return patterns.some(pattern => pattern.test(query));
    }
    
    /**
     * Quick query indicators
     */
    isQuickQuery(query, length) {
        // Short queries (< 50 chars) usually quick lookups
        if (length < 50) {
            const quickPatterns = [
                /^zeige/,
                /^was ist/,
                /^wie viele/,
                /^liste/,
                /^wann/,
                /^wo/
            ];
            
            return quickPatterns.some(pattern => pattern.test(query));
        }
        
        return false;
    }
    
    /**
     * Data extraction indicators
     */
    isDataExtraction(query) {
        const patterns = [
            /erstelle.*artikel/,
            /parse/,
            /extrahiere/,
            /konvertiere/,
            /strukturiere/
        ];
        
        return patterns.some(pattern => pattern.test(query));
    }
    
    /**
     * Financial analysis indicators
     */
    isFinancialAnalysis(query) {
        const patterns = [
            /profitabilität/,
            /ebit/,
            /db2|db3/,
            /deckungsbeitrag/,
            /break.*even/,
            /wirtschaftlichkeit/,
            /npv|irr/,
            /amortisation/,
            /business case/
        ];
        
        return patterns.some(pattern => pattern.test(query));
    }
    
    /**
     * Complex reasoning indicators
     */
    isComplexReasoning(query, length) {
        // Long queries (> 200 chars) often need deep reasoning
        if (length > 200) return true;
        
        const patterns = [
            /warum/,
            /erkläre/,
            /analysiere/,
            /bewerte/,
            /vergleiche.*mit/,
            /empfehlung/,
            /strategie/,
            /optimiere/
        ];
        
        return patterns.some(pattern => pattern.test(query));
    }
}