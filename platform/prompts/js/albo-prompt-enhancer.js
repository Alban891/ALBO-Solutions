/**
 * ALBO Prompt Enhancer
 * Fügt JSON-Strukturanweisungen zu Prompts hinzu für strukturierte AI-Outputs
 */

class ALBOPromptEnhancer {
    constructor() {
        // Modul-Definitionen (welche Module gibt es?)
        this.moduleDefinitions = {
            validation_table: {
                id: 'validation_table',
                title: 'Validierungsstatus-Tabelle',
                icon: '📊',
                description: 'Excel-like table mit 4 Validierungsstufen',
                requiredFields: ['stufe', 'stage_name', 'zielfrage', 'validiert', 'status_percent', 'cfo_risiko']
            },
            scorecard: {
                id: 'scorecard',
                title: 'CFO-Bewertung & Entscheidung',
                icon: '💰',
                description: 'Executive Summary mit Empfehlung',
                requiredFields: ['overall_status', 'validated_stages', 'cfo_recommendation', 'key_findings']
            },
            capital_structure: {
                id: 'capital_structure',
                title: 'Kapitalstruktur & Stufenbudget',
                icon: '📈',
                description: 'Finanzierungsplan mit WACC-Optimierung',
                requiredFields: ['stages', 'total_committed', 'funding_recommendation']
            },
            timeline: {
                id: 'timeline',
                title: 'Validierungs-Timeline',
                icon: '⏱️',
                description: 'Zeitplan mit Meilensteinen',
                requiredFields: ['milestones', 'critical_path']
            },
            documentation: {
                id: 'documentation',
                title: 'Dokumentation & Quellen',
                icon: '📄',
                description: 'Strukturierte Referenzen',
                requiredFields: ['sources', 'assumptions']
            }
        };

        // Prompt-zu-Module Mapping (welcher Prompt braucht welche Module?)
        this.promptModuleMapping = {
            'business_case_4_validierung': ['validation_table', 'scorecard', 'capital_structure', 'timeline', 'documentation'],
            'cfo_7': ['validation_table', 'scorecard', 'capital_structure'],
            'default': ['scorecard', 'documentation']
        };

        console.log('✅ ALBOPromptEnhancer initialized');
    }

    /**
     * Hauptmethode: Enhanced Prompt mit JSON-Struktur
     */
    enhancePromptForModules(originalPrompt, promptId = 'default') {
        // 1. Bestimme welche Module dieser Prompt braucht
        const requiredModules = this.getRequiredModules(promptId);
        
        // 2. Generiere JSON-Struktur
        const jsonStructure = this.buildJsonStructure(requiredModules);
        
        // 3. Baue Enhanced Prompt
        const enhancedPrompt = this.buildEnhancedPrompt(originalPrompt, jsonStructure, requiredModules);
        
        console.log('✨ Prompt enhanced with modules:', requiredModules);
        
        return enhancedPrompt;
    }

    /**
     * Bestimme welche Module ein Prompt braucht
     */
    getRequiredModules(promptId) {
        // Suche nach Prompt-spezifischem Mapping
        for (const [key, modules] of Object.entries(this.promptModuleMapping)) {
            if (promptId.includes(key) || key.includes(promptId)) {
                return modules;
            }
        }
        
        // Fallback: Standard-Module
        return this.promptModuleMapping.default;
    }

    /**
     * Baue JSON-Struktur Template
     */
    buildJsonStructure(modules) {
        const structure = {
            modules: {}
        };

        modules.forEach(moduleId => {
            const moduleDef = this.moduleDefinitions[moduleId];
            if (!moduleDef) return;

            if (moduleId === 'validation_table') {
                structure.modules.validation_table = {
                    type: 'datagrid',
                    title: 'Validierungsstatus-Tabelle (4 Stufen)',
                    overall_score: 0,
                    overall_status: 'green | yellow | red',
                    recommendation: 'CFO-Empfehlung hier',
                    data: [
                        {
                            stufe: 1,
                            stage_name: 'Problem Validation',
                            zielfrage: 'Frage hier',
                            hypothese_test: 'Wie wurde validiert',
                            validiert: 'validated | warning | critical',
                            status_percent: 95,
                            cfo_risiko: 'NIEDRIG | MITTEL | HOCH',
                            kapitalbedarf: '15000',
                            details: 'Details hier',
                            next_steps: ['Schritt 1', 'Schritt 2']
                        }
                    ]
                };
            }

            if (moduleId === 'scorecard') {
                structure.modules.scorecard = {
                    type: 'scorecard',
                    title: 'CFO-Bewertung & Entscheidung',
                    overall_status: 'green | yellow | red',
                    validated_stages: 3,
                    cfo_recommendation: 'Empfehlung hier',
                    recommendation_amount: 350000,
                    risk_assessment: 'Risikobewertung',
                    key_concerns: ['Concern 1', 'Concern 2'],
                    key_findings: ['Finding 1', 'Finding 2'],
                    next_milestones: [
                        {
                            title: 'Meilenstein',
                            due: '2 Wochen',
                            owner: 'Verantwortlicher'
                        }
                    ]
                };
            }

            if (moduleId === 'capital_structure') {
                structure.modules.capital_structure = {
                    type: 'capital_optimizer',
                    title: 'Kapitalstruktur & Stufenbudget',
                    stages: [
                        {
                            stage: 1,
                            stage_name: 'Stage Name',
                            budget: 15000,
                            status: 'spent | allocated | pending | not_approved',
                            roi_expectation: 'ROI Erwartung'
                        }
                    ],
                    total_committed: 50000,
                    total_required: 1400000,
                    funding_recommendation: {
                        immediate: 350000,
                        contingent: 1000000,
                        equity_ratio: 60,
                        debt_ratio: 40,
                        wacc: 4.2,
                        savings_vs_baseline: 45000,
                        structure_rationale: 'Begründung'
                    }
                };
            }

            if (moduleId === 'timeline') {
                structure.modules.timeline = {
                    type: 'timeline',
                    title: 'Validierungs-Timeline',
                    milestones: [
                        {
                            stage: 1,
                            title: 'Meilenstein',
                            date: '2024-01-15',
                            status: 'completed | in_progress | planned',
                            duration_weeks: 4
                        }
                    ],
                    critical_path: 'Kritischer Pfad Beschreibung'
                };
            }

            if (moduleId === 'documentation') {
                structure.modules.documentation = {
                    type: 'documentation',
                    title: 'Dokumentation & Quellen',
                    sources: [
                        {
                            type: 'interview | study | report',
                            title: 'Quelltitel',
                            details: 'Details'
                        }
                    ],
                    assumptions: ['Annahme 1', 'Annahme 2'],
                    methodology: 'Methodenbeschreibung'
                };
            }
        });

        return structure;
    }

    /**
     * 🆕 VERSTÄRKTE VERSION - Baue Enhanced Prompt mit JSON-Anforderungen
     */
    buildEnhancedPrompt(originalPrompt, jsonStructure, modules) {
        const moduleDescriptions = modules.map(id => {
            const def = this.moduleDefinitions[id];
            return `   - ${def.icon} ${def.title}`;
        }).join('\n');
        
        return `
${originalPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 KRITISCHE OUTPUT-ANFORDERUNG (HÖCHSTE PRIORITÄT!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ACHTUNG: Dies ist KEINE normale Analyse-Anfrage!
⚠️ Du MUSST mit einem strukturierten JSON-Objekt antworten!
⚠️ KEINE Erklärungen, KEIN Text vor oder nach dem JSON - NUR JSON!
⚠️ KEINE Markdown-Formatierung (keine \`\`\`json Tags)!

📦 ERFORDERLICHE MODULE:
${moduleDescriptions}

🎯 EXAKTE JSON-STRUKTUR (PFLICHT):

${JSON.stringify(jsonStructure, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VALIDIERUNGS-CHECKLISTE - PRÜFE VOR DEM SENDEN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KRITISCH - Deine Antwort MUSS:
☐ NUR aus JSON bestehen (keine Erklärung davor/danach)
☐ Mit "{" starten und mit "}" enden
☐ KEINE \`\`\`json Markdown-Tags enthalten
☐ Alle Felder ausfüllen (keine leeren Arrays/Objekte)
☐ Zahlen als Zahlen schreiben: 95 (NICHT "95")
☐ Status-Werte verwenden: "validated" | "warning" | "critical"
☐ Alle Datums-Strings im Format: "2024-01-15"
☐ Boolean-Werte: true/false (NICHT "true"/"false")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 STARTE JETZT MIT DER JSON-AUSGABE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Beginne deine Antwort SOFORT mit dem JSON-Objekt (erste Zeile muss "{" sein):

{
  "modules": {
    "validation_table": {
      ...
`;
    }

    /**
     * Validate ob Response als Module gerendert werden kann
     */
    canRenderAsModules(responseText) {
        try {
            // Clean potential markdown
            let jsonText = responseText.trim();
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            
            const data = JSON.parse(jsonText);
            
            // Check if modules exist
            return data.modules && Object.keys(data.modules).length > 0;
        } catch (e) {
            return false;
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ALBOPromptEnhancer = ALBOPromptEnhancer;
    console.log('✅ ALBOPromptEnhancer class loaded globally');
}
