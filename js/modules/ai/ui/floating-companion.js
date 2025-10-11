/**
 * Floating AI Companion
 * Dynamic AI assistant that follows context and provides proactive suggestions
 */

import { AIRouter } from '../router/ai-router.js';
import { getSystemPrompt } from '../prompts/system-prompts.js';

export class FloatingCompanion {
    constructor() {
        this.router = new AIRouter();
        this.isVisible = false;
        this.isExpanded = false;
        this.currentContext = null;
        this.position = { x: 0, y: 0 };
        this.messages = [];
        
        // DOM Elements (will be created)
        this.container = null;
        this.bubble = null;
        this.content = null;
        
        // Settings
        this.settings = {
            enabled: true,
            proactive: true,
            followCursor: true,
            autoMinimize: true,
            minimizeDelay: 10000 // 10 seconds
        };
        
        // State
        this.lastInteraction = Date.now();
        this.activeField = null;
        this.isThinking = false;
    }
    
    /**
     * Initialize the companion
     */
    async initialize() {
        console.log('🤖 Initializing Floating Companion...');
        
        // Initialize AI Router
        await this.router.initialize();
        
        // Create UI
        this.createUI();
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Start context monitoring
        this.startContextMonitoring();
        
        console.log('✅ Floating Companion ready!');
    }
    
    /**
     * Create UI elements
     */
    createUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'ai-companion';
        this.container.className = 'ai-companion minimized';
        
        this.container.innerHTML = `
            <div class="ai-companion-bubble">
                <div class="ai-avatar">🤖</div>
                <div class="ai-pulse"></div>
                <div class="ai-badge hidden">0</div>
            </div>
            
            <div class="ai-companion-window hidden">
                <div class="ai-companion-header">
                    <div class="ai-title">
                        <span class="ai-avatar-small">🤖</span>
                        KI-Assistent
                    </div>
                    <div class="ai-controls">
                        <button class="ai-minimize" title="Minimieren">─</button>
                        <button class="ai-close" title="Schließen">✕</button>
                    </div>
                </div>
                
                <div class="ai-companion-messages">
                    <!-- Messages will be added here -->
                </div>
                
                <div class="ai-companion-input">
                    <textarea 
                        placeholder="Frage stellen..."
                        rows="1"
                    ></textarea>
                    <button class="ai-send">→</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.container);
        
        // Store references
        this.bubble = this.container.querySelector('.ai-companion-bubble');
        this.window = this.container.querySelector('.ai-companion-window');
        this.messagesContainer = this.container.querySelector('.ai-companion-messages');
        this.input = this.container.querySelector('textarea');
        this.sendButton = this.container.querySelector('.ai-send');
        
        // Add CSS
        this.injectStyles();
    }
    
    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('ai-companion-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ai-companion-styles';
        style.textContent = `
            .ai-companion {
                position: fixed;
                z-index: 9999;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .ai-companion.minimized {
                bottom: 20px;
                right: 20px;
            }
            
            .ai-companion-bubble {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                transition: transform 0.2s;
            }
            
            .ai-companion-bubble:hover {
                transform: scale(1.1);
            }
            
            .ai-avatar {
                font-size: 28px;
                animation: float 3s ease-in-out infinite;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
            }
            
            .ai-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 2px solid #667eea;
                animation: pulse 2s infinite;
                opacity: 0;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(1.3); opacity: 0; }
            }
            
            .ai-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 600;
            }
            
            .ai-badge.hidden {
                display: none;
            }
            
            .ai-companion-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 400px;
                max-height: 600px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                animation: expandWindow 0.3s ease-out;
            }
            
            @keyframes expandWindow {
                from {
                    opacity: 0;
                    transform: scale(0.8) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            
            .ai-companion-window.hidden {
                display: none;
            }
            
            .ai-companion-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .ai-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
            }
            
            .ai-avatar-small {
                font-size: 20px;
            }
            
            .ai-controls button {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 6px;
                cursor: pointer;
                margin-left: 4px;
                font-size: 14px;
            }
            
            .ai-controls button:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .ai-companion-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background: #f9fafb;
                max-height: 400px;
            }
            
            .ai-message {
                display: flex;
                gap: 10px;
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .ai-message.user {
                flex-direction: row-reverse;
            }
            
            .ai-message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .ai-message.user .ai-message-avatar {
                background: #3b82f6;
                color: white;
            }
            
            .ai-message-content {
                max-width: 75%;
                background: white;
                padding: 12px 16px;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                font-size: 14px;
                line-height: 1.5;
            }
            
            .ai-message.user .ai-message-content {
                background: #3b82f6;
                color: white;
            }
            
            .ai-thinking {
                display: flex;
                gap: 4px;
                padding: 8px;
            }
            
            .ai-thinking-dot {
                width: 8px;
                height: 8px;
                background: #667eea;
                border-radius: 50%;
                animation: thinking 1.4s infinite;
            }
            
            .ai-thinking-dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .ai-thinking-dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes thinking {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }
            
            .ai-companion-input {
                padding: 16px;
                background: white;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 8px;
            }
            
            .ai-companion-input textarea {
                flex: 1;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 10px 12px;
                font-size: 14px;
                font-family: inherit;
                resize: none;
                max-height: 100px;
            }
            
            .ai-companion-input textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            
            .ai-send {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                width: 44px;
                height: 44px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ai-send:hover {
                transform: scale(1.05);
            }
            
            .ai-send:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Click bubble to expand
        this.bubble.addEventListener('click', () => this.expand());
        
        // Minimize button
        this.container.querySelector('.ai-minimize').addEventListener('click', () => this.minimize());
        
        // Close button
        this.container.querySelector('.ai-close').addEventListener('click', () => this.hide());
        
        // Send message
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter to send (Shift+Enter for new line)
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = this.input.scrollHeight + 'px';
        });
    }
    
    /**
     * Start monitoring context (which field user is in, etc.)
     */
    startContextMonitoring() {
        // Monitor focus events on input fields
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.onFieldFocus(e.target);
            }
        });
        
        // Monitor value changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.onFieldInput(e.target);
            }
        });
        
        // Monitor which tab user is on
        this.monitorTabChanges();
    }
    
    /**
     * Monitor tab changes
     */
    monitorTabChanges() {
        // This depends on your existing tab system
        // Hook into your tab switching logic
        const observer = new MutationObserver(() => {
            this.detectCurrentContext();
        });
        
        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class', 'data-active']
        });
    }
    
    /**
     * Detect current context (which tab, which field)
     */
    detectCurrentContext() {
        // Detect current tab
        const activeTab = document.querySelector('[data-tab].active') || 
                         document.querySelector('.tab-button.active');
        
        if (activeTab) {
            const tabName = activeTab.dataset.tab || activeTab.textContent.toLowerCase();
            this.currentContext = {
                tab: tabName,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * Handle field focus
     */
    async onFieldFocus(field) {
        this.activeField = field;
        
        // Get field context
        const fieldName = field.name || field.id || field.placeholder;
        const fieldValue = field.value;
        
        console.log(`🎯 User focused: ${fieldName}`);
        
        // Show proactive suggestion based on field
        if (this.settings.proactive) {
            await this.provideContextualHelp(field, fieldName, fieldValue);
        }
    }
    
    /**
     * Handle field input
     */
    async onFieldInput(field) {
        const fieldName = field.name || field.id;
        const fieldValue = field.value;
        
        // Validate input against playbook (if applicable)
        if (this.shouldValidate(fieldName, fieldValue)) {
            await this.validateInput(fieldName, fieldValue);
        }
    }
    
    /**
     * Provide contextual help
     */
    async provideContextualHelp(field, fieldName, fieldValue) {
        // Don't overwhelm user
        if (Date.now() - this.lastInteraction < 5000) return;
        
        // Detect what kind of field this is
        let helpType = this.detectFieldType(fieldName);
        
        if (!helpType) return;
        
        // Show companion if hidden
        this.show();
        
        // Add AI message with suggestion
        const suggestion = await this.getFieldSuggestion(helpType, fieldName, fieldValue);
        
        if (suggestion) {
            this.addMessage(suggestion, 'ai');
            this.lastInteraction = Date.now();
        }
    }
    
    /**
     * Detect field type
     */
    detectFieldType(fieldName) {
        const lowerName = fieldName.toLowerCase();
        
        if (lowerName.includes('menge') || lowerName.includes('quantity')) {
            return 'mengenplanung';
        }
        if (lowerName.includes('preis') || lowerName.includes('price')) {
            return 'preisgestaltung';
        }
        if (lowerName.includes('kosten') || lowerName.includes('cost')) {
            return 'projektkosten';
        }
        if (lowerName.includes('zeithorizont') || lowerName.includes('horizon')) {
            return 'zeithorizont';
        }
        
        return null;
    }
    
    /**
     * Get suggestion for field
     */
    async getFieldSuggestion(fieldType, fieldName, currentValue) {
        // Get current project context
        const projektName = this.getCurrentProjektName();
        const branche = this.getCurrentBranche();
        
        const context = {
            type: fieldType,
            projektName: projektName,
            branche: branche,
            fieldName: fieldName,
            currentValue: currentValue
        };
        
        const systemPrompt = getSystemPrompt('claude', context);
        
        let query = '';
        switch(fieldType) {
            case 'mengenplanung':
                query = `Ich plane Mengen für "${fieldName}". Gib mir 2-3 Tipps basierend auf der Branche.`;
                break;
            case 'zeithorizont':
                query = `Was ist ein typischer Planungshorizont für diese Branche?`;
                break;
            case 'preisgestaltung':
                query = `Wie sollte ich Preise für diese Branche kalkulieren?`;
                break;
            default:
                return null;
        }
        
        try {
            const response = await this.router.query(query, { systemPrompt, ...context });
            return response.content;
        } catch (error) {
            console.error('Failed to get suggestion:', error);
            return null;
        }
    }
    
    /**
     * Validate input
     */
    async validateInput(fieldName, fieldValue) {
        // Only validate numeric fields with values
        if (!fieldValue || isNaN(fieldValue)) return;
        
        const value = parseFloat(fieldValue);
        
        // Check if value is suspiciously high or low
        if (fieldName.includes('menge') && (value > 100000 || value < 10)) {
            this.addMessage(
                `⚠️ ${value} erscheint ${value > 100000 ? 'sehr hoch' : 'sehr niedrig'}. Ist das korrekt?`,
                'ai'
            );
        }
    }
    
    /**
     * Should validate this field?
     */
    shouldValidate(fieldName, fieldValue) {
        const validatableFields = ['menge', 'preis', 'kosten', 'cost', 'quantity', 'price'];
        return validatableFields.some(f => fieldName.toLowerCase().includes(f));
    }
    
    /**
     * Send user message
     */
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.input.value = '';
        this.input.style.height = 'auto';
        
        // Show thinking
        this.showThinking();
        
        // Get AI response
        try {
            const context = {
                projektName: this.getCurrentProjektName(),
                branche: this.getCurrentBranche(),
                currentTab: this.currentContext?.tab
            };
            
            const response = await this.router.query(message, context);
            
            // Hide thinking
            this.hideThinking();
            
            // Add AI response
            this.addMessage(response.content, 'ai');
            
        } catch (error) {
            this.hideThinking();
            this.addMessage('Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es erneut.', 'ai');
            console.error('AI query failed:', error);
        }
    }
    
    /**
     * Add message to chat
     */
    addMessage(content, sender = 'ai') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        
        messageDiv.innerHTML = `
            <div class="ai-message-avatar">${sender === 'ai' ? '🤖' : '👤'}</div>
            <div class="ai-message-content">${this.formatMessage(content)}</div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        // Store message
        this.messages.push({ content, sender, timestamp: Date.now() });
    }
    
    /**
     * Format message content (markdown, links, etc.)
     */
    formatMessage(content) {
        // Simple formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }
    
    /**
     * Show thinking indicator
     */
    showThinking() {
        this.isThinking = true;
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'ai-message ai';
        thinkingDiv.innerHTML = `
            <div class="ai-message-avatar">🤖</div>
            <div class="ai-message-content">
                <div class="ai-thinking">
                    <div class="ai-thinking-dot"></div>
                    <div class="ai-thinking-dot"></div>
                    <div class="ai-thinking-dot"></div>
                </div>
            </div>
        `;
        thinkingDiv.id = 'ai-thinking-indicator';
        this.messagesContainer.appendChild(thinkingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    /**
     * Hide thinking indicator
     */
    hideThinking() {
        this.isThinking = false;
        const thinking = document.getElementById('ai-thinking-indicator');
        if (thinking) thinking.remove();
    }
    
    /**
     * Show companion
     */
    show() {
        this.isVisible = true;
        this.container.classList.remove('hidden');
    }
    
    /**
     * Hide companion
     */
    hide() {
        this.isVisible = false;
        this.container.classList.add('hidden');
    }
    
    /**
     * Expand to window
     */
    expand() {
        this.isExpanded = true;
        this.window.classList.remove('hidden');
        this.bubble.style.display = 'none';
        this.input.focus();
    }
    
    /**
     * Minimize to bubble
     */
    minimize() {
        this.isExpanded = false;
        this.window.classList.add('hidden');
        this.bubble.style.display = 'flex';
    }
    
    /**
     * Get current projekt name from UI
     */
    getCurrentProjektName() {
        // This depends on your existing UI structure
        const projektSelect = document.querySelector('#projekt-select');
        return projektSelect?.options[projektSelect.selectedIndex]?.text || 'Unbekanntes Projekt';
    }
    
    /**
     * Get current branche from UI
     */
    getCurrentBranche() {
        // This depends on your existing data structure
        return window.state?.currentProjekt?.branche || 'Unbekannte Branche';
    }
}

// Export singleton instance
export const aiCompanion = new FloatingCompanion();