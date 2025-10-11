/**
 * Voice Controller
 * Handles Text-to-Speech output for AI responses
 * Uses Web Speech API and optional OpenAI TTS
 */

export class VoiceController {
    constructor() {
        this.isEnabled = false;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.queue = [];
        
        // Settings
        this.settings = {
            enabled: true,
            voice: null,
            rate: 1.0,        // 0.1 - 10
            pitch: 1.0,       // 0 - 2
            volume: 1.0,      // 0 - 1
            language: 'de-DE',
            autoSpeak: false, // Auto-speak AI responses
            autoSpeakThreshold: 100, // Min characters to auto-speak
            highlightWords: true
        };
        
        // Voice options
        this.availableVoices = [];
        this.selectedVoice = null;
        
        // Check browser support
        this.isSupported = 'speechSynthesis' in window;
        
        if (this.isSupported) {
            this.initializeSpeechSynthesis();
        } else {
            console.warn('⚠️ Speech Synthesis not supported in this browser');
        }
    }
    
    /**
     * Initialize Speech Synthesis
     */
    initializeSpeechSynthesis() {
        // Load voices (sometimes takes a moment)
        this.loadVoices();
        
        // Voices might load async
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
        
        console.log('🎤 Voice Controller initialized');
    }
    
    /**
     * Load available voices
     */
    loadVoices() {
        this.availableVoices = speechSynthesis.getVoices();
        
        // Filter German voices
        const germanVoices = this.availableVoices.filter(voice => 
            voice.lang.startsWith('de')
        );
        
        // Select default voice
        if (germanVoices.length > 0) {
            // Prefer Google voices if available
            this.selectedVoice = germanVoices.find(v => v.name.includes('Google')) || germanVoices[0];
        } else {
            // Fallback to any voice
            this.selectedVoice = this.availableVoices[0];
        }
        
        console.log(`🎤 ${this.availableVoices.length} voices available`);
        if (this.selectedVoice) {
            console.log(`🎤 Selected voice: ${this.selectedVoice.name}`);
        }
    }
    
    /**
     * Speak text
     * @param {string} text - Text to speak
     * @param {Object} options - Override settings
     * @returns {Promise}
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.isSupported) {
                console.warn('Speech not supported');
                return resolve();
            }
            
            if (!text || text.trim().length === 0) {
                return resolve();
            }
            
            // Stop current speech if any
            if (this.isSpeaking) {
                this.stop();
            }
            
            // Clean text
            const cleanText = this.cleanText(text);
            
            // Create utterance
            const utterance = new SpeechSynthesisUtterance(cleanText);
            
            // Apply settings
            utterance.voice = this.selectedVoice;
            utterance.rate = options.rate || this.settings.rate;
            utterance.pitch = options.pitch || this.settings.pitch;
            utterance.volume = options.volume || this.settings.volume;
            utterance.lang = options.language || this.settings.language;
            
            // Event handlers
            utterance.onstart = () => {
                this.isSpeaking = true;
                this.currentUtterance = utterance;
                console.log('🎤 Started speaking');
                
                if (this.settings.highlightWords) {
                    this.startWordHighlighting(cleanText);
                }
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                console.log('✅ Finished speaking');
                
                if (this.settings.highlightWords) {
                    this.stopWordHighlighting();
                }
                
                resolve();
            };
            
            utterance.onerror = (event) => {
                console.error('❌ Speech error:', event);
                this.isSpeaking = false;
                this.currentUtterance = null;
                reject(event);
            };
            
            // Boundary event for word highlighting
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    this.onWordBoundary(event);
                }
            };
            
            // Speak
            speechSynthesis.speak(utterance);
        });
    }
    
    /**
     * Clean text for speech
     */
    cleanText(text) {
        return text
            // Remove markdown
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            // Remove emojis (they sound weird)
            .replace(/[🤖⚠️✅❌📊💡🎯]/g, '')
            // Remove special chars
            .replace(/[#\*\[\]]/g, '')
            // Clean up spaces
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    /**
     * Stop speaking
     */
    stop() {
        if (this.isSupported && this.isSpeaking) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            
            if (this.settings.highlightWords) {
                this.stopWordHighlighting();
            }
            
            console.log('⏹️ Speech stopped');
        }
    }
    
    /**
     * Pause speaking
     */
    pause() {
        if (this.isSupported && this.isSpeaking) {
            speechSynthesis.pause();
            console.log('⏸️ Speech paused');
        }
    }
    
    /**
     * Resume speaking
     */
    resume() {
        if (this.isSupported && speechSynthesis.paused) {
            speechSynthesis.resume();
            console.log('▶️ Speech resumed');
        }
    }
    
    /**
     * Toggle speaking on/off
     */
    toggle() {
        if (this.isSpeaking) {
            this.stop();
        } else if (speechSynthesis.paused) {
            this.resume();
        }
    }
    
    /**
     * Set voice by name or index
     */
    setVoice(voiceIdentifier) {
        if (typeof voiceIdentifier === 'number') {
            this.selectedVoice = this.availableVoices[voiceIdentifier];
        } else if (typeof voiceIdentifier === 'string') {
            this.selectedVoice = this.availableVoices.find(v => 
                v.name === voiceIdentifier || v.lang === voiceIdentifier
            );
        }
        
        if (this.selectedVoice) {
            console.log(`🎤 Voice changed to: ${this.selectedVoice.name}`);
        }
    }
    
    /**
     * Get list of voices for UI
     */
    getVoices() {
        return this.availableVoices.map((voice, index) => ({
            index: index,
            name: voice.name,
            lang: voice.lang,
            default: voice.default,
            localService: voice.localService
        }));
    }
    
    /**
     * Get German voices only
     */
    getGermanVoices() {
        return this.availableVoices
            .filter(voice => voice.lang.startsWith('de'))
            .map((voice, index) => ({
                index: this.availableVoices.indexOf(voice),
                name: voice.name,
                lang: voice.lang
            }));
    }
    
    /**
     * Update settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        console.log('🎤 Voice settings updated:', newSettings);
    }
    
    /**
     * Should auto-speak this text?
     */
    shouldAutoSpeak(text) {
        if (!this.settings.autoSpeak) return false;
        if (!text) return false;
        
        const cleanText = this.cleanText(text);
        return cleanText.length >= this.settings.autoSpeakThreshold;
    }
    
    /**
     * Speak AI response (if enabled)
     */
    async speakAIResponse(response) {
        if (!this.settings.enabled) return;
        
        const text = typeof response === 'string' ? response : response.content;
        
        if (this.shouldAutoSpeak(text)) {
            try {
                await this.speak(text);
            } catch (error) {
                console.error('Failed to speak AI response:', error);
            }
        }
    }
    
    /**
     * Word boundary handler for highlighting
     */
    onWordBoundary(event) {
        if (!this.settings.highlightWords) return;
        
        // Get current word
        const charIndex = event.charIndex;
        const text = event.utterance.text;
        
        // Find word boundaries
        const words = text.split(/\s+/);
        let currentCharCount = 0;
        let currentWord = '';
        
        for (let word of words) {
            if (charIndex >= currentCharCount && charIndex < currentCharCount + word.length) {
                currentWord = word;
                break;
            }
            currentCharCount += word.length + 1; // +1 for space
        }
        
        // Dispatch event for UI to handle highlighting
        document.dispatchEvent(new CustomEvent('voice-word-highlight', {
            detail: { word: currentWord, charIndex: charIndex }
        }));
    }
    
    /**
     * Start word highlighting
     */
    startWordHighlighting(text) {
        document.dispatchEvent(new CustomEvent('voice-start', {
            detail: { text: text }
        }));
    }
    
    /**
     * Stop word highlighting
     */
    stopWordHighlighting() {
        document.dispatchEvent(new CustomEvent('voice-end'));
    }
    
    /**
     * Create voice control UI
     */
    createVoiceControls() {
        const container = document.createElement('div');
        container.id = 'voice-controls';
        container.className = 'voice-controls';
        
        container.innerHTML = `
            <div class="voice-control-panel">
                <button class="voice-btn" id="voice-toggle" title="Sprachausgabe ein/aus">
                    🎤
                </button>
                
                <div class="voice-settings hidden">
                    <label>
                        Stimme:
                        <select id="voice-select">
                            ${this.getGermanVoices().map(v => 
                                `<option value="${v.index}">${v.name}</option>`
                            ).join('')}
                        </select>
                    </label>
                    
                    <label>
                        Geschwindigkeit:
                        <input type="range" id="voice-rate" 
                               min="0.5" max="2" step="0.1" 
                               value="${this.settings.rate}">
                        <span id="voice-rate-value">${this.settings.rate}x</span>
                    </label>
                    
                    <label>
                        Lautstärke:
                        <input type="range" id="voice-volume" 
                               min="0" max="1" step="0.1" 
                               value="${this.settings.volume}">
                        <span id="voice-volume-value">${Math.round(this.settings.volume * 100)}%</span>
                    </label>
                    
                    <label>
                        <input type="checkbox" id="voice-auto-speak" 
                               ${this.settings.autoSpeak ? 'checked' : ''}>
                        Automatisch vorlesen
                    </label>
                </div>
                
                <button class="voice-btn" id="voice-settings-toggle" title="Einstellungen">
                    ⚙️
                </button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(container);
        
        // Add event listeners
        this.attachVoiceControlListeners();
        
        // Add CSS
        this.injectVoiceStyles();
    }
    
    /**
     * Attach event listeners to voice controls
     */
    attachVoiceControlListeners() {
        // Toggle voice on/off
        const toggleBtn = document.getElementById('voice-toggle');
        toggleBtn?.addEventListener('click', () => {
            this.settings.enabled = !this.settings.enabled;
            toggleBtn.classList.toggle('active', this.settings.enabled);
            console.log(`🎤 Voice ${this.settings.enabled ? 'enabled' : 'disabled'}`);
        });
        
        // Toggle settings panel
        const settingsBtn = document.getElementById('voice-settings-toggle');
        const settingsPanel = document.querySelector('.voice-settings');
        settingsBtn?.addEventListener('click', () => {
            settingsPanel?.classList.toggle('hidden');
        });
        
        // Voice selection
        const voiceSelect = document.getElementById('voice-select');
        voiceSelect?.addEventListener('change', (e) => {
            this.setVoice(parseInt(e.target.value));
        });
        
        // Rate control
        const rateInput = document.getElementById('voice-rate');
        const rateValue = document.getElementById('voice-rate-value');
        rateInput?.addEventListener('input', (e) => {
            this.settings.rate = parseFloat(e.target.value);
            rateValue.textContent = `${this.settings.rate}x`;
        });
        
        // Volume control
        const volumeInput = document.getElementById('voice-volume');
        const volumeValue = document.getElementById('voice-volume-value');
        volumeInput?.addEventListener('input', (e) => {
            this.settings.volume = parseFloat(e.target.value);
            volumeValue.textContent = `${Math.round(this.settings.volume * 100)}%`;
        });
        
        // Auto-speak toggle
        const autoSpeakCheckbox = document.getElementById('voice-auto-speak');
        autoSpeakCheckbox?.addEventListener('change', (e) => {
            this.settings.autoSpeak = e.target.checked;
        });
    }
    
    /**
     * Inject CSS for voice controls
     */
    injectVoiceStyles() {
        if (document.getElementById('voice-control-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'voice-control-styles';
        style.textContent = `
            .voice-controls {
                position: fixed;
                bottom: 100px;
                right: 20px;
                z-index: 9998;
            }
            
            .voice-control-panel {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 8px;
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .voice-btn {
                width: 44px;
                height: 44px;
                border: none;
                background: #f3f4f6;
                border-radius: 8px;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .voice-btn:hover {
                background: #e5e7eb;
                transform: scale(1.05);
            }
            
            .voice-btn.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .voice-settings {
                position: absolute;
                bottom: 60px;
                right: 0;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                padding: 16px;
                min-width: 280px;
                animation: slideUp 0.2s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .voice-settings.hidden {
                display: none;
            }
            
            .voice-settings label {
                display: block;
                margin-bottom: 12px;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
            }
            
            .voice-settings select,
            .voice-settings input[type="range"] {
                width: 100%;
                margin-top: 6px;
            }
            
            .voice-settings input[type="checkbox"] {
                width: auto;
                margin-right: 8px;
            }
            
            .voice-settings select {
                padding: 8px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .voice-settings input[type="range"] {
                -webkit-appearance: none;
                height: 6px;
                border-radius: 3px;
                background: #e5e7eb;
                outline: none;
            }
            
            .voice-settings input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #667eea;
                cursor: pointer;
            }
            
            .voice-settings span {
                display: inline-block;
                margin-left: 8px;
                color: #6b7280;
                font-size: 13px;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Check if currently speaking
     */
    get speaking() {
        return this.isSpeaking;
    }
    
    /**
     * Check if voice is enabled
     */
    get enabled() {
        return this.settings.enabled;
    }
}

// Export singleton instance
export const voiceController = new VoiceController();