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
 * Baue JSON-Struktur Template mit KONKRETEN Beispielen
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
                overall_score: 68,
                recommendation: '💡 Pilotfreigabe mit verstärktem Fokus auf Business Model Validierung. Problem & Solution sind validiert, Product-Entwicklung kann starten, aber Business Model benötigt deutlich mehr Validierung bevor größere Investments freigegeben werden.',
                data: [
                    {
                        stufe: 1,
                        stage_name: 'Problem',
                        zielfrage: 'Gibt es ein echtes Kundenproblem beim Schaltschrankbau?',
                        hypothese_test: 'Interviews mit 45 Unternehmen durchgeführt. Umfrage bei 180 Betrieben im DACH-Raum. Arbeitsmarktanalysen ausgewertet: Fachkräftemangel nachweislich vorhanden, 73% der Betriebe berichten von Lieferverzug durch Personalmangel.',
                        validiert: 'validated',
                        status_percent: 95,
                        cfo_risiko: 'NIEDRIG',
                        kapitalbedarf: 15000,
                        details: 'Sehr klare Problem-Validierung durch umfangreiche Marktforschung. Fachkräftemangel ist nachweislich vorhanden und wird sich laut Prognosen weiter verschärfen.',
                        next_steps: ['Monatliches Update zu Marktentwicklung etablieren', 'Wettbewerberanalyse vertiefen', 'Regulatorische Änderungen monitoren']
                    },
                    {
                        stufe: 2,
                        stage_name: 'Solution',
                        zielfrage: 'Wird unser Roboter-Lösungsansatz als sinnvoll und praktikabel erlebt?',
                        hypothese_test: 'Mockups und Wireframes bei 30 potenziellen Kunden getestet. Landing Page mit Erklärungsvideo generierte 2.000 Interessenten-Leads. Design Thinking Workshop mit 12 Anwendern durchgeführt.',
                        validiert: 'warning',
                        status_percent: 75,
                        cfo_risiko: 'NIEDRIG',
                        kapitalbedarf: 25000,
                        details: 'Positive Resonanz auf den Lösungsansatz, aber konkrete Preisbereitschaft noch unklar. Einige Kunden zeigen Bedenken bzgl. Integration in bestehende Systeme.',
                        next_steps: ['A/B-Test verschiedener Pricing-Modelle', 'Beta-Programm mit 10 Pilotkunden aufsetzen', 'Integrations-Dokumentation erstellen']
                    },
                    {
                        stufe: 3,
                        stage_name: 'Product',
                        zielfrage: 'Können wir ein funktionierendes, zuverlässiges Roboter-System liefern?',
                        hypothese_test: 'MVP ist in Entwicklung (60% fertig). Beta-Tests mit 5 Partnern für Q2 geplant. Technische Machbarkeitsstudien durchgeführt, Prototyp funktioniert im Labor.',
                        validiert: 'warning',
                        status_percent: 45,
                        cfo_risiko: 'MITTEL',
                        kapitalbedarf: 350000,
                        details: 'Technische Machbarkeit grundsätzlich gegeben, aber Skalierbarkeit und industrielle Zuverlässigkeit (99,5% Uptime) müssen noch bewiesen werden. Hardware-Sourcing noch nicht final geklärt.',
                        next_steps: ['MVP bis Q2 2025 fertigstellen', 'Beta-Test mit 5-10 Industriekunden starten', 'Technische Dokumentation und Wartungskonzept ausarbeiten', 'Supply Chain für Hardware aufbauen']
                    },
                    {
                        stufe: 4,
                        stage_name: 'Business',
                        zielfrage: 'Lässt sich daraus ein profitables, skalierbares Geschäft aufbauen?',
                        hypothese_test: 'Zahlungsbereitschaft muss noch durch echte Verträge validiert werden. CAC/LTV Ratio ist theoretisch berechnet, aber nicht durch Markterfahrung bestätigt. Skalierungsmodell (SaaS vs. Hardware-Verkauf vs. Hybrid) noch nicht final entschieden.',
                        validiert: 'critical',
                        status_percent: 20,
                        cfo_risiko: 'HOCH',
                        kapitalbedarf: 200000,
                        details: 'Geschäftsmodell noch nicht ausreichend validiert. Kritische offene Fragen: Pricing-Struktur (Lizenz vs. Miete?), Kundenakquisitionskosten in der Praxis, Churn-Rate, Support-Aufwand. Break-Even unklar.',
                        next_steps: ['Detaillierte Finanzmodellierung mit Sensitivitätsanalyse', 'Mindestens 3 Pilotverträge mit echten Zahlungen abschließen', 'Break-Even-Analyse erstellen', 'Skalierungsstrategie definieren']
                    }
                ]
            };
        }

        if (moduleId === 'scorecard') {
            structure.modules.scorecard = {
                type: 'scorecard',
                title: 'CFO Scorecard & Gesamtbewertung',
                overall_status: 'yellow',
                validated_stages: 2,
                cfo_recommendation: '💡 Pilotfreigabe mit Auflagen: Budget für MVP-Entwicklung (Stufe 3) freigeben mit 350.000 €, aber größere Investments in Skalierung (Stufe 4) erst nach erfolgreicher Product-Validierung und ersten zahlenden Pilotkunden. Go/No-Go-Entscheidung nach Q3 2025.',
                recommendation_amount: 350000,
                risk_assessment: 'MITTEL - Problem & Solution sind validiert (starke Basis), aber erhebliche Business Model Unsicherheit bleibt. Technische Delivery ist möglich, aber Wirtschaftlichkeit noch nicht bewiesen.',
                key_findings: [
                    '✅ Klare Problemvalidierung mit 95% Confidence - Markt ist real',
                    '✅ Hohe Marktnachfrage durch 180 Betriebe nachgewiesen',
                    '✅ Solution-Fit durch Mockups und Workshops bestätigt - Ansatz wird verstanden',
                    '✅ Technische Machbarkeit durch Prototyp demonstriert'
                ],
                key_concerns: [
                    '❌ Business Model noch nicht validiert (nur 20% Confidence)',
                    '⚠️ Zahlungsbereitschaft in der Theorie, aber noch keine realen Verträge',
                    '⚠️ CAC/LTV Ratio nicht durch Markterfahrung bestätigt',
                    '⚠️ Skalierbarkeit der technischen Lösung für Industrieeinsatz ungetestet',
                    '⚠️ Wettbewerb (3 identifizierte Player) könnte schneller sein'
                ],
                next_milestones: [
                    {
                        title: 'MVP Beta-Launch mit 5 Pilotkunden',
                        due: 'Q2 2025 (Ende Juni)',
                        owner: 'Product Team (Lead: CTO)'
                    },
                    {
                        title: 'Erste 3 zahlende Verträge abschließen',
                        due: 'Q3 2025 (bis September)',
                        owner: 'Sales Team (Lead: VP Sales)'
                    },
                    {
                        title: 'Business Model Validierung & Break-Even-Analyse',
                        due: 'Q4 2025 (bis Dezember)',
                        owner: 'CFO Team + Finance Controlling'
                    },
                    {
                        title: 'Go/No-Go Entscheidung für Skalierung',
                        due: 'Q4 2025 (Dezember Board Meeting)',
                        owner: 'CFO + CEO + Board'
                    }
                ]
            };
        }

        if (moduleId === 'capital_structure') {
            structure.modules.capital_structure = {
                type: 'capital_optimizer',
                title: 'Kapitalstruktur & Stufenbudget',
                total_committed: 40000,
                total_required: 590000,
                funding_recommendation: {
                    immediate: 350000,
                    contingent: 200000,
                    equity_ratio: 60,
                    debt_ratio: 40,
                    wacc: 8.5,
                    savings_vs_baseline: 15000,
                    structure_rationale: '60/40 Equity/Debt Mix optimiert Kapitalkosten bei vertretbarem Risiko. Eigenkapitalquote hoch genug für Flexibilität, Fremdkapitalanteil senkt WACC. Bei erfolgreicher Product-Validierung kann Fremdkapitalanteil erhöht werden.'
                },
                stages: [
                    {
                        stage: 1,
                        stage_name: 'Problem',
                        budget: 15000,
                        status: 'spent',
                        roi_expectation: '✅ Validierung abgeschlossen - Investition hat sich gelohnt'
                    },
                    {
                        stage: 2,
                        stage_name: 'Solution',
                        budget: 25000,
                        status: 'allocated',
                        roi_expectation: '⏳ Tests laufen - erste Ergebnisse vielversprechend'
                    },
                    {
                        stage: 3,
                        stage_name: 'Product',
                        budget: 350000,
                        status: 'pending',
                        roi_expectation: '📋 Freigabe empfohlen: MVP + Beta-Test bis Q3 2025. Break-Even nach 18 Monaten erwartet.'
                    },
                    {
                        stage: 4,
                        stage_name: 'Business',
                        budget: 200000,
                        status: 'not_approved',
                        roi_expectation: '⏸️ Abhängig von Stufe 3 Ergebnis. Investment nur bei erfolgreicher Validierung von Product & ersten Kunden.'
                    }
                ]
            };
        }

        if (moduleId === 'timeline') {
            structure.modules.timeline = {
                type: 'gantt',
                title: 'Validierungsprozess-Timeline',
                milestones: [
                    {
                        title: 'Problem Validation abgeschlossen',
                        start: '2024-09',
                        end: '2024-12',
                        status: 'completed',
                        owner: 'Market Research Team',
                        progress: 100
                    },
                    {
                        title: 'Solution Testing & Mockups',
                        start: '2024-11',
                        end: '2025-01',
                        status: 'completed',
                        owner: 'UX Team',
                        progress: 100
                    },
                    {
                        title: 'MVP Entwicklung',
                        start: '2025-01',
                        end: '2025-06',
                        status: 'in-progress',
                        owner: 'Engineering Team',
                        progress: 60
                    },
                    {
                        title: 'Beta-Test mit Pilotkunden',
                        start: '2025-06',
                        end: '2025-09',
                        status: 'planned',
                        owner: 'Product Team + Sales',
                        progress: 0
                    },
                    {
                        title: 'Business Model Validierung',
                        start: '2025-09',
                        end: '2025-12',
                        status: 'planned',
                        owner: 'CFO Team',
                        progress: 0
                    }
                ],
                delays: [
                    '⚠️ MVP-Entwicklung könnte sich um 4 Wochen verzögern wenn Hardware-Lieferanten nicht liefern',
                    '⚠️ Beta-Test-Phase benötigt mindestens 3 Monate für valide Daten'
                ]
            };
        }

        if (moduleId === 'documentation') {
            structure.modules.documentation = {
                type: 'document',
                title: 'CFO-Freigabe Vorlage',
                content: {
                    executive_summary: 'Zusammenfassung hier...',
                    recommendation: 'CFO empfiehlt...',
                    conditions: ['Bedingung 1', 'Bedingung 2'],
                    capital_structure: 'Kapitalstruktur Details...',
                    risk_assessment: 'Risikobewertung Details...',
                    approval_required_from: ['CFO', 'CEO', 'Board']
                }
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
