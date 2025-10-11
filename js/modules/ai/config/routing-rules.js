/**
 * AI Routing Rules
 * Defines rules for which AI should handle which type of query
 */

export const ROUTING_RULES = {
    
    // ═══════════════════════════════════════════════════════
    // CLAUDE - Deep Reasoning & Financial Analysis
    // ═══════════════════════════════════════════════════════
    claude: {
        keywords: [
            // Financial Keywords
            'wirtschaftlichkeit',
            'profitabilität',
            'rentabilität',
            'ebit',
            'db1', 'db2', 'db3',
            'deckungsbeitrag',
            'break-even',
            'break even',
            'amortisation',
            'payback',
            'npv',
            'irr',
            'kapitalwert',
            'business case',
            'roi',
            'return on investment',
            
            // Analysis Keywords
            'analysiere',
            'bewerte',
            'evaluiere',
            'prüfe',
            'erkläre',
            'warum',
            'begründe',
            'einschätze',
            'empfehle',
            'strategie',
            'optimiere',
            
            // Playbook Keywords
            'playbook',
            'benchmark',
            'plausibilität',
            'validiere',
            'realistic',
            'unrealistisch'
        ],
        
        patterns: [
            /warum.*?/i,
            /erkläre.*?/i,
            /analysiere.*?/i,
            /wie.*?funktioniert/i,
            /vergleiche.*?mit/i,
            /unterschied.*?zwischen/i
        ],
        
        contexts: [
            'financial_analysis',
            'business_case',
            'playbook_validation',
            'cost_optimization',
            'strategic_planning'
        ]
    },
    
    // ═══════════════════════════════════════════════════════
    // GPT-4O - Quick Queries & Structured Data
    // ═══════════════════════════════════════════════════════
    gpt4o: {
        keywords: [
            // Quick Actions
            'zeige',
            'liste',
            'erstelle',
            'generiere',
            'formatiere',
            'konvertiere',
            'parse',
            'extrahiere',
            
            // UI Actions
            'artikel',
            'projekt',
            'kostenblock',
            'übersicht',
            
            // Simple Questions
            'was ist',
            'wie viele',
            'wann',
            'wo',
            'wer'
        ],
        
        patterns: [
            /^zeige/i,
            /^liste/i,
            /^erstelle/i,
            /^was ist/i,
            /^wie viele/i
        ],
        
        contexts: [
            'article_creation',
            'data_extraction',
            'quick_lookup',
            'ui_interaction',
            'simple_query'
        ]
    },
    
    // ═══════════════════════════════════════════════════════
    // PERPLEXITY - Market Research & Real-Time Data
    // ═══════════════════════════════════════════════════════
    perplexity: {
        keywords: [
            // Market Research
            'benchmark',
            'markt',
            'wettbewerb',
            'konkurrenz',
            'competitor',
            'industrie',
            'branche',
            'trend',
            
            // Data Sources
            'vdma',
            'bitkom',
            'statistik',
            'studie',
            'bericht',
            
            // Pricing
            'preis',
            'kosten',
            'gehalt',
            'tarif',
            'durchschnitt',
            
            // Current Info
            'aktuell',
            'neueste',
            'latest',
            '2024',
            '2025'
        ],
        
        patterns: [
            /benchmark.*?/i,
            /markt.*?/i,
            /wettbewerb.*?/i,
            /wie viel.*?kostet/i,
            /durchschnitt.*?preis/i,
            /aktuelle.*?trend/i
        ],
        
        contexts: [
            'market_research',
            'competitor_analysis',
            'pricing_research',
            'industry_benchmarks',
            'current_data'
        ]
    }
};

/**
 * Priority Rules
 * Higher priority = checked first
 */
export const PRIORITY_ORDER = [
    'perplexity',  // Check market research first
    'gpt4o',       // Then quick queries
    'claude'       // Default for everything else
];

/**
 * Fallback Chain
 * If primary AI fails, try these in order
 */
export const FALLBACK_CHAIN = {
    claude: ['gpt4o', 'perplexity'],
    gpt4o: ['claude', 'perplexity'],
    perplexity: ['gpt4o', 'claude']
};

/**
 * Query Length Rules
 * Route based on query complexity/length
 */
export const LENGTH_RULES = {
    // Very short queries (< 50 chars) → GPT-4o
    short_threshold: 50,
    short_ai: 'gpt4o',
    
    // Very long queries (> 200 chars) → Claude
    long_threshold: 200,
    long_ai: 'claude'
};

/**
 * Context-Based Routing
 * Route based on where user is in the app
 */
export const CONTEXT_ROUTING = {
    // User is in Artikel Tab
    artikel_tab: {
        default: 'gpt4o',
        triggers: {
            'mengenplanung': 'claude',      // Complex planning
            'preisgestaltung': 'perplexity' // Market research
        }
    },
    
    // User is in Projektkosten Tab
    projektkosten_tab: {
        default: 'claude',
        triggers: {
            'kostenblock kategorisieren': 'claude',
            'typische kosten': 'perplexity'
        }
    },
    
    // User is in Wirtschaftlichkeit Tab
    wirtschaftlichkeit_tab: {
        default: 'claude',
        triggers: {
            'plausibilität': 'claude',
            'benchmark': 'perplexity'
        }
    },
    
    // User is in Dashboard
    dashboard_tab: {
        default: 'gpt4o',
        triggers: {
            'analyse': 'claude',
            'vergleich': 'perplexity'
        }
    }
};