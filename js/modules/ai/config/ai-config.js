/**
 * AI System Configuration
 * Central configuration for AI behavior, routing, and features
 */

export const AI_CONFIG = {
    // Feature Flags
    features: {
        companion_enabled: true,          // Floating AI Companion
        voice_output_enabled: true,       // Text-to-Speech
        voice_input_enabled: false,       // Speech-to-Text (Phase 2)
        proactive_mode: true,             // Proactive suggestions
        context_following: true,          // Follow cursor/context
        playbook_validation: true         // Validate against playbooks
    },
    
    // UI Settings
    ui: {
        default_position: 'bottom-right',  // Initial position
        default_size: 'compact',           // minimized | compact | standard | expanded
        animation_duration: 300,           // ms
        follow_cursor_delay: 200,          // ms
        auto_minimize_delay: 10000         // ms (10s)
    },
    
    // Voice Settings
    voice: {
        default_enabled: true,
        default_voice: 'alloy',            // OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
        default_speed: 1.0,                // 0.25 - 4.0
        default_language: 'de',
        auto_speak_threshold: 100,         // Min characters to auto-speak
        highlight_words: true              // Word-by-word highlighting
    },
    
    // AI Routing
    routing: {
        default_ai: 'claude',              // claude | gpt4o | perplexity
        enable_hybrid: true,               // Use multiple AIs for complex queries
        enable_fallback: true,             // Fallback to alternative AI on error
        max_retries: 2
    },
    
    // Performance
    performance: {
        cache_enabled: true,
        cache_ttl: 3600,                   // seconds (1 hour)
        debounce_input: 500,               // ms
        max_concurrent_requests: 3
    },
    
    // Cost Management
    cost: {
        max_tokens_per_request: 4096,
        track_usage: true,
        daily_budget_warning: 10.00        // USD
    }
};

// Model Configuration
export const MODEL_CONFIG = {
    claude: {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: 0.7,
        cost_per_1m_input: 3.00,           // USD
        cost_per_1m_output: 15.00
    },
    
    gpt4o: {
        model: 'gpt-4o',
        max_tokens: 4096,
        temperature: 0.7,
        cost_per_1m_input: 2.50,
        cost_per_1m_output: 10.00
    },
    
    perplexity: {
        model: 'llama-3.1-sonar-large-128k-online',
        max_tokens: 4096,
        temperature: 0.2,                  // Lower for factual research
        cost_per_request: 0.005            // Flat rate
    }
};