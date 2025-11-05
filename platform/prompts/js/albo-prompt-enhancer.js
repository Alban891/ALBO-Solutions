// ═══════════════════════════════════════════════════════════════════
// ALBO MODULE ENGINE - PHASE 1: PROMPT ENHANCEMENT
// Wandelt normale Prompts in strukturierte JSON Module um
// ═══════════════════════════════════════════════════════════════════

/**
 * Phase 1: Enhance Prompt für strukturierte Module-Outputs
 * 
 * Fügt dem User-Prompt automatisch JSON-Struktur-Anforderungen hinzu
 * basierend auf den Output-Formaten die im Prompt definiert sind
 */

class ALBOPromptEnhancer {
    
    constructor() {
        this.moduleDefinitions = this.getModuleDefinitions();
        console.log('✅ ALBO Prompt Enhancer initialized');
    }

    /**
     * Hauptmethode: Enhanced einen Prompt für Module-Output
     */
    enhancePromptForModules(originalPrompt, promptId) {
        console.log('🔧 Enhancing prompt for module output...');
        
        // 1. Erkenne welche Module der Prompt generieren soll
        const detectedModules = this.detectRequiredModules(originalPrompt);
        console.log('📊 Detected modules:', detectedModules);
        
        // 2. Baue JSON-Struktur
        const jsonStructure = this.buildJSONStructure(detectedModules);
        
        // 3. Füge System-Instruction hinzu
        const enhancedPrompt = this.buildEnhancedPrompt(originalPrompt, jsonStructure, detectedModules);
        
        return enhancedPrompt;
    }

    /**
     * Erkenne welche Module basierend auf Output-Format Keywords
     */
    detectRequiredModules(promptText) {
        const modules = [];
        const text = promptText.toLowerCase();
        
        // Validierungstabelle
        if (text.includes('validierungsstatus') || 
            text.includes('4 stufen') || 
            text.includes('stage') ||
            text.includes('validierung')) {
            modules.push('validation_table');
        }
        
        // Scorecard
        if (text.includes('scorecard') || 
            text.includes('cfo-bewertung') || 
            text.includes('empfehlung')) {
            modules.push('scorecard');
        }
        
        // Kapitalstruktur
        if (text.includes('kapitalstruktur') || 
            text.includes('kapitalbedarf') || 
            text.includes('finanzierung') ||
            text.includes('budget')) {
            modules.push('capital_structure');
        }
        
        // Timeline
        if (text.includes('timeline') || 
            text.includes('zeitlinie') || 
            text.includes('meilenstein')) {
            modules.push('timeline');
        }
        
        // Template/Dokument
        if (text.includes('template') || 
            text.includes('vorlage') || 
            text.includes('freigabe')) {
            modules.push('approval_template');
        }
        
        // Fallback: Wenn keine Module erkannt, nimm mindestens validation + scorecard
        if (modules.length === 0) {
            modules.push('validation_table', 'scorecard');
        }
        
        return modules;
    }

    /**
     * Baue JSON-Struktur basierend auf erkannten Modulen
     */
    buildJSONStructure(modules) {
        const structure = {
            modules: {}
        };
        
        modules.forEach(moduleId => {
            const definition = this.moduleDefinitions[moduleId];
            if (definition) {
                structure.modules[moduleId] = definition.structure;
            }
        });
        
        return structure;
    }

    /**
     * Baue den enhanced Prompt
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

⚠️ WICHTIG: Antworte AUSSCHLIESSLICH im folgenden JSON-Format.
⚠️ KEIN anderer Text außerhalb der JSON-Struktur!
⚠️ KEINE Markdown-Formatierung (keine \`\`\`json)!
⚠️ NUR pures, valides JSON!

📦 ERFORDERLICHE MODULE:
${moduleDescriptions}

🎯 JSON-STRUKTUR:

${JSON.stringify(jsonStructure, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VALIDIERUNGS-CHECKLISTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bevor du antwortest, stelle sicher:
☐ Response ist NUR JSON (keine Erklärung davor/danach)
☐ Alle Felder sind ausgefüllt (keine leeren Arrays/Objekte)
☐ Zahlen sind Zahlen (nicht Strings): z.B. 95 statt "95"
☐ Status-Werte verwenden exakte Enums: "validated" | "warning" | "critical"
☐ Alle Datums-Strings im ISO-Format: "2024-01-15"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 JETZT ANTWORTE NUR MIT DEM JSON (START MIT "{")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    }

    /**
     * Modul-Definitionen mit JSON-Strukturen
     */
    getModuleDefinitions() {
        return {
            validation_table: {
                id: 'validation_table',
                icon: '📊',
                title: 'Validierungsstatus-Tabelle',
                type: 'datagrid',
                structure: {
                    type: 'datagrid',
                    title: 'Validierungsstatus-Tabelle (4 Stufen)',
                    overall_score: 0,
                    overall_status: 'green',
                    recommendation: '',
                    data: [
                        {
                            stufe: 1,
                            stage_name: 'Problem Validation',
                            zielfrage: 'Gibt es ein echtes Kundenproblem?',
                            hypothese_test: 'Interviews, Umfragen, Marktanalyse',
                            validiert: 'validated',
                            status_percent: 95,
                            cfo_risiko: 'NIEDRIG',
                            kapitalbedarf: '15000',
                            details: 'Detaillierte Beschreibung der Validierung',
                            next_steps: ['Action 1', 'Action 2']
                        }
                    ]
                }
            },
            
            scorecard: {
                id: 'scorecard',
                icon: '💰',
                title: 'Scorecard & CFO-Bewertung',
                type: 'scorecard',
                structure: {
                    type: 'scorecard',
                    title: 'CFO-Bewertung & Entscheidung',
                    overall_status: 'green',
                    validated_stages: 3,
                    cfo_recommendation: 'Pilotfreigabe empfohlen',
                    recommendation_amount: 350000,
                    risk_assessment: 'MITTEL - Stage 2 benötigt Nachvalidierung',
                    key_concerns: [
                        'Concern 1',
                        'Concern 2'
                    ],
                    key_findings: [
                        'Finding 1',
                        'Finding 2'
                    ],
                    next_milestones: [
                        {
                            title: 'Milestone 1',
                            due: '2 Wochen',
                            owner: 'PM'
                        }
                    ]
                }
            },
            
            capital_structure: {
                id: 'capital_structure',
                icon: '📈',
                title: 'Kapitalstruktur & Stufenbudget',
                type: 'capital_optimizer',
                structure: {
                    type: 'capital_optimizer',
                    title: 'Kapitalstruktur & Stufenbudget',
                    stages: [
                        {
                            stage: 1,
                            stage_name: 'Problem Validation',
                            budget: 15000,
                            status: 'spent',
                            roi_expectation: 'Information gain'
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
                        structure_rationale: 'Optimale Balance zwischen Kosteneffizienz und Flexibilität'
                    }
                }
            },
            
            timeline: {
                id: 'timeline',
                icon: '⏱️',
                title: 'Validierungsprozess-Timeline',
                type: 'gantt',
                structure: {
                    type: 'gantt',
                    title: 'Validierungsprozess-Timeline',
                    milestones: [
                        {
                            id: 1,
                            title: 'Problem Validation',
                            start: '2024-01-01',
                            end: '2024-02-15',
                            status: 'completed',
                            owner: 'Research Team',
                            progress: 100
                        }
                    ],
                    critical_path: [2, 3],
                    delays: [],
                    risks: []
                }
            },
            
            approval_template: {
                id: 'approval_template',
                icon: '📄',
                title: 'CFO-Freigabe Template',
                type: 'document',
                structure: {
                    type: 'document',
                    title: 'CFO-Freigabe Vorlage',
                    format: 'structured_text',
                    content: {
                        executive_summary: 'Zusammenfassung des Business Case...',
                        recommendation: 'Freigabe von X€ unter folgenden Auflagen...',
                        conditions: [
                            'Bedingung 1',
                            'Bedingung 2'
                        ],
                        capital_structure: 'Empfohlene Kapitalstruktur...',
                        risk_assessment: 'Gesamtrisiko und Bewertung...',
                        approval_required_from: ['CFO', 'Steering Committee'],
                        next_steps: []
                    }
                }
            }
        };
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    window.ALBOPromptEnhancer = ALBOPromptEnhancer;
    console.log('✅ ALBOPromptEnhancer loaded');
}