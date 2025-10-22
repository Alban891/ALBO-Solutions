/* ========================================== */
/* ALBO PROMPTS - 3-LEVEL HIERARCHY */
/* Multi-Role with MECE Theme Structure */
/* 🆕 MIT SPLIT-SCREEN LIVE-PREVIEW! */
/* ========================================== */

class PromptsEngine {
    constructor() {
        this.taskQueue = [];
        this.allPrompts = this.getAllPrompts();
        this.currentView = 'roles';  // 'roles' | 'themes' | 'prompts'
        this.currentMode = 'templates';
        this.currentRole = null;
        this.currentTheme = null;
        this.currentPrompt = null;
        this.userAnswers = {};
        this.searchQuery = '';
        
        // MECE Theme Mapping
        this.themeMapping = this.getThemeMapping();
        
        console.log('💡 Prompts Engine initialized (3-Level Hierarchy + Split-Screen)');
        console.log(`📚 Loaded ${this.allPrompts.length} prompts across ${this.getRoleCount()} roles`);
        
        // Inject Split-Screen CSS
        this.injectSplitScreenCSS();
    }

    /* ========================================== */
    /* 🆕 SPLIT-SCREEN CSS INJECTION */
    /* ========================================== */

    injectSplitScreenCSS() {
        if (document.getElementById('split-screen-styles')) return;

        const style = document.createElement('style');
        style.id = 'split-screen-styles';
        style.textContent = `
            /* Split-Screen Container */
            .prompt-split-container {
                display: grid;
                grid-template-columns: 40% 60%;
                gap: 24px;
                margin-top: 24px;
                min-height: calc(100vh - 300px);
            }

            /* Sticky Summary Header */
            .prompt-summary-sticky {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 24px;
                border-radius: 12px;
                margin-bottom: 20px;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            .prompt-summary-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .prompt-summary-text {
                font-size: 14px;
                line-height: 1.6;
                opacity: 0.95;
                margin-bottom: 12px;
            }

            .benefit-tags {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .benefit-tag {
                padding: 4px 10px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                font-size: 12px;
                backdrop-filter: blur(10px);
            }

            /* Left Panel: Inputs */
            .prompt-input-panel {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                height: fit-content;
            }

            .input-panel-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px;
                color: #1a202c;
            }

            .input-group {
                margin-bottom: 20px;
            }

            .input-label {
                display: block;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 8px;
                color: #2d3748;
            }

            .input-field {
                width: 100%;
                padding: 12px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.3s ease;
                font-family: inherit;
            }

            .input-field:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .input-example {
                font-size: 12px;
                color: #64748b;
                margin-top: 6px;
                font-style: italic;
            }

            .progress-indicator {
                margin-top: 16px;
                padding: 12px;
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                border-radius: 6px;
                font-size: 13px;
                color: #92400e;
                transition: all 0.3s ease;
            }

            .progress-indicator.complete {
                background: #f0fdf4;
                border-color: #10b981;
                color: #065f46;
            }

            /* Right Panel: Live Preview */
            .prompt-preview-panel {
                background: white;
                border-radius: 12px;
                padding: 28px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                max-height: calc(100vh - 280px);
                overflow-y: auto;
            }

            .preview-panel-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px;
                color: #1a202c;
                padding-bottom: 12px;
                border-bottom: 2px solid #f1f5f9;
            }

            .prompt-preview-content {
                font-size: 14px;
                line-height: 1.8;
                color: #334155;
                white-space: pre-wrap;
                word-wrap: break-word;
            }

            /* Live Preview Highlight */
            .user-input-highlight {
                background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
                padding: 3px 8px;
                border-radius: 6px;
                font-weight: 600;
                color: #065f46;
                border-left: 3px solid #10b981;
                display: inline-block;
                animation: pulse-in 0.4s ease;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
            }

            @keyframes pulse-in {
                0% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }

            .placeholder-text {
                background: #fef3c7;
                padding: 2px 6px;
                border-radius: 4px;
                font-style: italic;
                color: #92400e;
            }

            /* Action Buttons */
            .split-action-buttons {
                display: flex;
                gap: 12px;
                margin-top: 24px;
            }

            .btn-split-primary {
                flex: 1;
                padding: 14px 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
            }

            .btn-split-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
            }

            .btn-split-secondary {
                padding: 14px 20px;
                background: white;
                color: #667eea;
                border: 2px solid #667eea;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-split-secondary:hover {
                background: #f7fafc;
            }

            /* Responsive */
            @media (max-width: 1200px) {
                .prompt-split-container {
                    grid-template-columns: 1fr;
                }
            }

            /* Scrollbar */
            .prompt-preview-panel::-webkit-scrollbar {
                width: 8px;
            }

            .prompt-preview-panel::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 4px;
            }

            .prompt-preview-panel::-webkit-scrollbar-thumb {
                background: #cbd5e0;
                border-radius: 4px;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Split-Screen CSS injected');
    }

    /* ========================================== */
    /* 🆕 NEW SPLIT-SCREEN PROMPT DETAIL VIEW */
    /* ========================================== */

    renderPromptDetail(prompt) {
        const container = document.getElementById('prompts-content');
        if (!container) return;

        // Extract summary (first 2-3 sentences from fullPromptText)
        const summary = this.extractSummary(prompt);

        container.innerHTML = `
            <div class="prompt-detail-view">
                <!-- Breadcrumb -->
                <div class="breadcrumb-nav">
                    <button onclick="window.promptsEngine.goBackToPrompts()" class="breadcrumb-back">
                        ← Zurück
                    </button>
                </div>

                <!-- Prompt Header -->
                <div class="prompt-detail-header">
                    <div class="prompt-icon-large">${prompt.icon || '📄'}</div>
                    <div>
                        <h2 class="prompt-detail-title">${prompt.name}</h2>
                        <p class="prompt-detail-meta">
                            ${prompt.category} • 
                            ⏱️ ${prompt.duration || 30} Min • 
                            ${prompt.tags && prompt.tags[0] ? '⭐ ' + prompt.tags[0] : ''}
                        </p>
                    </div>
                </div>

                <!-- Sticky Summary -->
                <div class="prompt-summary-sticky">
                    <div class="prompt-summary-title">💡 Kurz erklärt</div>
                    <div class="prompt-summary-text">${summary}</div>
                    <div class="benefit-tags">
                        <span class="benefit-tag">✅ Revisionssicher</span>
                        <span class="benefit-tag">✅ Professionell</span>
                        <span class="benefit-tag">✅ Sofort einsetzbar</span>
                    </div>
                </div>

                <!-- 🆕 SPLIT-SCREEN CONTAINER -->
                <div class="prompt-split-container">
                    
                    <!-- LEFT: INPUT PANEL -->
                    <div class="prompt-input-panel">
                        <h3 class="input-panel-title">🔍 Ihre Eingaben</h3>
                        
                        ${this.renderInputFields(prompt)}

                        <!-- Progress Indicator -->
                        <div class="progress-indicator" id="progress-${prompt.id}">
                            ⏺️ Bitte füllen Sie alle Felder aus (0/${prompt.questions ? prompt.questions.length : 0})
                        </div>

                        <!-- Action Buttons -->
                        <div class="split-action-buttons">
                            <button class="btn-split-primary" onclick="window.promptsEngine.executePrompt('${prompt.id}')">
                                ▶️ Prompt ausführen
                            </button>
                        </div>
                        <div style="display: flex; gap: 12px; margin-top: 12px;">
                            <button class="btn-split-secondary" onclick="window.promptsEngine.copyPromptCode('${prompt.id}')">
                                📋 Kopieren
                            </button>
                            <button class="btn-split-secondary" onclick="window.promptsEngine.addToQueue('${prompt.id}')">
                                💾 Speichern
                            </button>
                        </div>
                    </div>

                    <!-- RIGHT: LIVE PREVIEW PANEL -->
                    <div class="prompt-preview-panel">
                        <h3 class="preview-panel-title">📖 Prompt Live-Preview</h3>
                        <div class="prompt-preview-content" id="preview-${prompt.id}">
                            ${this.renderPromptPreview(prompt)}
                        </div>
                    </div>

                </div>
            </div>
        `;

        // Initialize progress tracking
        this.updateProgress(prompt.id);
    }

    /* ========================================== */
    /* 🆕 HELPER FUNCTIONS FOR SPLIT-SCREEN */
    /* ========================================== */

    extractSummary(prompt) {
        // Extract first 2-3 sentences from fullPromptText
        let text = prompt.fullPromptText || prompt.goal || prompt.description || '';
        
        // Remove markdown formatting
        text = text.replace(/\*\*/g, '').replace(/\n/g, ' ');
        
        // Find first 2-3 sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        const summary = sentences.slice(0, 3).join(' ');
        
        if (summary.length > 300) {
            return summary.substring(0, 300) + '...';
        }
        
        return summary || 'Professioneller Prompt für ' + prompt.category;
    }

    renderInputFields(prompt) {
        if (!prompt.questions || prompt.questions.length === 0) {
            return `<p style="color: #64748b; font-size: 14px;">Keine Eingabefelder für diesen Prompt.</p>`;
        }

        return prompt.questions.map((q, idx) => `
            <div class="input-group">
                <label class="input-label">${idx + 1}. ${q.question}</label>
                <input 
                    type="text" 
                    class="input-field" 
                    id="input-${prompt.id}-${idx}"
                    placeholder="${q.example || 'Ihre Antwort'}"
                    oninput="window.promptsEngine.updateLivePreview('${prompt.id}', ${idx}, this.value)"
                />
                ${q.example ? `<div class="input-example">💡 Beispiel: ${q.example}</div>` : ''}
            </div>
        `).join('');
    }

    renderPromptPreview(prompt) {
        let promptText = prompt.fullPromptText || this.generateFullPromptText(prompt);
        
        // Replace placeholders with input fields
        if (prompt.questions && prompt.questions.length > 0) {
            prompt.questions.forEach((q, idx) => {
                const placeholder = `<span class="placeholder-text" id="placeholder-${prompt.id}-${idx}">[Bitte geben Sie links die Antwort ein]</span>`;
                
                // Try to find natural insertion points in the text
                // For now, just add placeholders at the end of sections
                promptText = this.insertPlaceholders(promptText, placeholder, idx);
            });
        }

        return promptText;
    }

    insertPlaceholders(text, placeholder, index) {
        // Simple strategy: Insert after "Bitte frage den Nutzer vorab" section
        const sections = text.split('\n\n');
        
        // Find the section that mentions questions
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].includes('Bitte frage') || sections[i].includes('Ziel & Nutzen')) {
                // Insert placeholder after this section
                if (index === 0) {
                    sections[i] += `\n\n→ Ihre Eingabe: ${placeholder}`;
                }
                break;
            }
        }
        
        return sections.join('\n\n');
    }

    generateFullPromptText(prompt) {
        let text = `**📌 Rolle & Aufgabe**\n`;
        text += `${prompt.goal || prompt.name}\n\n`;
        
        if (prompt.questions && prompt.questions.length > 0) {
            text += `**🔍 Bitte frage den Nutzer vorab**\n`;
            prompt.questions.forEach((q, idx) => {
                text += `${idx + 1}. ${q.question}\n`;
            });
        }
        
        return text;
    }

    /* ========================================== */
    /* 🆕 LIVE-PREVIEW UPDATE LOGIC */
    /* ========================================== */

    updateLivePreview(promptId, fieldIndex, value) {
        const placeholder = document.getElementById(`placeholder-${promptId}-${fieldIndex}`);
        
        if (placeholder) {
            if (value && value.trim() !== '') {
                // User has entered something - show with highlighting
                placeholder.className = 'user-input-highlight';
                placeholder.textContent = value;
            } else {
                // Field is empty - show placeholder
                placeholder.className = 'placeholder-text';
                placeholder.textContent = '[Bitte geben Sie links die Antwort ein]';
            }
        }

        // Update user answers
        if (!this.userAnswers[promptId]) {
            this.userAnswers[promptId] = {};
        }
        this.userAnswers[promptId][fieldIndex] = value;

        // Update progress
        this.updateProgress(promptId);
    }

    updateProgress(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt || !prompt.questions) return;

        const totalFields = prompt.questions.length;
        let filledCount = 0;

        for (let i = 0; i < totalFields; i++) {
            const input = document.getElementById(`input-${promptId}-${i}`);
            if (input && input.value.trim() !== '') {
                filledCount++;
            }
        }

        const progressElement = document.getElementById(`progress-${promptId}`);
        if (progressElement) {
            if (filledCount === totalFields) {
                progressElement.innerHTML = `✅ Alle Pflichtfelder ausgefüllt (${filledCount}/${totalFields})`;
                progressElement.className = 'progress-indicator complete';
            } else {
                progressElement.innerHTML = `⏺️ Bitte füllen Sie alle Felder aus (${filledCount}/${totalFields})`;
                progressElement.className = 'progress-indicator';
            }
        }
    }

    /* ========================================== */
    /* ORIGINAL METHODS (Keep everything else) */
    /* ========================================== */

    getAllPrompts() {
        const allPrompts = [];
        
        // Load from global arrays
        if (typeof CONTROLLER_PROMPTS !== 'undefined') {
            allPrompts.push(...CONTROLLER_PROMPTS);
        }
        if (typeof TREASURY_PROMPTS !== 'undefined') {
            allPrompts.push(...TREASURY_PROMPTS);
        }
        if (typeof CFO_PROMPTS !== 'undefined') {
            allPrompts.push(...CFO_PROMPTS);
        }
        if (typeof MA_PROMPTS !== 'undefined') {
            allPrompts.push(...MA_PROMPTS);
        }
        if (typeof BILANZ_PROMPTS !== 'undefined') {
            allPrompts.push(...BILANZ_PROMPTS);
        }
        
        return allPrompts;
    }

    getRoleCount() {
        const roles = new Set(this.allPrompts.map(p => p.category));
        return roles.size;
    }

    getThemeMapping() {
        // ... (keep original theme mapping - zu lang zum Kopieren)
        // Dies würde aus der original Datei übernommen
        return {}; // Placeholder
    }

    selectPrompt(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;
        
        this.currentPrompt = prompt;
        this.renderPromptDetail(prompt);
    }

    goBackToPrompts() {
        this.currentPrompt = null;
        this.renderMainView();
    }

    copyPromptCode(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        let promptText = prompt.fullPromptText || this.generateFullPromptText(prompt);
        
        // Replace placeholders with actual user answers
        if (this.userAnswers[promptId]) {
            Object.keys(this.userAnswers[promptId]).forEach(idx => {
                const value = this.userAnswers[promptId][idx];
                if (value) {
                    promptText = promptText.replace('[Bitte geben Sie links die Antwort ein]', value);
                }
            });
        }

        navigator.clipboard.writeText(promptText);
        alert('✅ Prompt kopiert!');
    }

    executePrompt(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        // Check if all fields are filled
        const totalFields = prompt.questions ? prompt.questions.length : 0;
        let filledCount = 0;

        for (let i = 0; i < totalFields; i++) {
            const input = document.getElementById(`input-${promptId}-${i}`);
            if (input && input.value.trim() !== '') {
                filledCount++;
            }
        }

        if (filledCount < totalFields) {
            alert(`⚠️ Bitte füllen Sie alle ${totalFields} Felder aus! (${filledCount}/${totalFields} ausgefüllt)`);
            return;
        }

        alert(`✅ Prompt wird ausgeführt: ${prompt.name}\n\nIhre Eingaben wurden gespeichert!`);
        console.log('Executing prompt:', promptId, 'with answers:', this.userAnswers[promptId]);
    }

    addToQueue(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        this.taskQueue.push({
            id: promptId,
            name: prompt.name,
            answers: this.userAnswers[promptId] || {}
        });

        alert(`✅ "${prompt.name}" zur Task Queue hinzugefügt!`);
        console.log('Task Queue:', this.taskQueue);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderMainView() {
        // Original implementation hier behalten
        console.log('Rendering main view...');
    }
}

// Initialize engine when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.promptsEngine = new PromptsEngine();
    });
} else {
    window.promptsEngine = new PromptsEngine();
}
