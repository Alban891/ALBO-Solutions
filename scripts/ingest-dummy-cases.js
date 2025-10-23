/**
 * Ingest Dummy Cases to Supabase
 * Standalone Version (No ES Modules)
 * 
 * USAGE:
 * 1. Replace API_URL with your Vercel URL
 * 2. Run: node scripts/ingest-dummy-cases.js
 */

// ========================================
// CONFIGURATION
// ========================================

const API_URL = 'https://albo-solutions.vercel.app'; // ← CHANGE THIS!

// ========================================
// DUMMY CASES DATA
// ========================================

const ALBO_DUMMY_CASES = [
  // ========== CASE 1: ERFOLGREICHER DIGITAL-CASE ==========
  {
    case_name: 'ERP-Digitalisierung Rechnungswesen',
    description: 'Vollständige Digitalisierung des Rechnungswesens durch cloud-basierte ERP-Lösung mit RPA-Integration',
    business_unit: 'digitalization',
    project_owner: 'Osmani',
    
    status: 'abgeschlossen',
    start_date: '2023-01-15',
    planned_end_date: '2023-12-31',
    actual_end_date: '2024-01-31',
    duration_variance_days: 31,
    
    revenue_planned: 600000,
    revenue_actual: 680000,
    costs_planned: 360000,
    costs_actual: 340000,
    db2_planned: 0.35,
    db2_actual: 0.28,
    roi_planned: 0.35,
    roi_actual: 0.28,
    npv_planned: 185000,
    npv_actual: 142000,
    payback_months_planned: 28,
    payback_months_actual: 35,
    
    case_data: {
      business_model: {
        beschreibung: 'Cloud-ERP mit Automatisierung von Kreditorenbuchhaltung, Mahnwesen und Reporting',
        ziele: [
          'Reduktion manueller Buchungen um 70%',
          'Monatsabschluss von 10 auf 3 Tage',
          'Fehlerquote < 1%',
          'Echtzeit-Reporting'
        ],
        scope: 'Kreditorenbuchhaltung, Debitorenbuchhaltung, Reporting'
      },
      financials: {
        investment: {
          software_licenses: 250000,
          implementation: 210000,
          hardware: 55000,
          training: 50000,
          pm: 95000,
          contingency: 20000,
          total: 680000
        },
        savings_annual: {
          fte_reduction: 3.0,
          personnel_saved: 240000,
          process_efficiency: 60000,
          error_reduction: 40000,
          total: 340000
        }
      }
    },
    
    key_assumptions: [
      {
        assumption: 'FTE-Reduktion von 3,5 erreichbar',
        actual_outcome: 'Nur 3,0 erreicht',
        deviation_reason: 'Widerstand im Team, 2 Mitarbeiter nicht abbaubar',
        impact: 'ROI -7 Prozentpunkte'
      },
      {
        assumption: 'Implementation in 12 Monaten',
        actual_outcome: '13 Monate benötigt',
        deviation_reason: 'Datenmigration komplexer, Legacy-Schnittstellen',
        impact: '+1 Monat Verzögerung, +30k Kosten'
      }
    ],
    
    lessons_learned: {
      what_went_well: [
        'Prozess-Redesign führte zu +20% Effizienz',
        'Software-Auswahl war richtig',
        'Early Adopter Programm erfolgreich'
      ],
      what_went_wrong: [
        'Datenmigration um 50% unterschätzt',
        'Change Management Budget zu knapp',
        'Vendor-Preisstrategie nicht vertraglich fixiert'
      ],
      what_to_do_differently: [
        'Datenmigration: +30% Buffer einplanen',
        'Change Management: 10-15% Budget',
        'FTE-Reduktion: Konservativ (70-80% erreichen)'
      ]
    },
    
    critical_decisions: [
      {
        decision: 'Go nach Business Case',
        rationale: 'ROI 35%, Payback <3 Jahre',
        outcome: 'Richtig - Projekt erfolgreich'
      }
    ],
    
    success_factors: [
      'Executive Sponsorship (CFO aktiv)',
      'Agile 2-Wochen-Sprints',
      'Externe Expertise für kritische Phasen'
    ],
    
    failure_factors: [],
    
    industry: 'Manufacturing',
    complexity: 'mittel',
    project_size: 'mittel',
    rating: 3.5,
    tags: ['erp', 'digitalisierung', 'automation', 'rpa', 'erfolg'],
    
    searchable_summary: 'ERP-Digitalisierung Rechnungswesen Manufacturing. Cloud-ERP mit 3,0 FTE Reduktion (Plan: 3,5). ROI 28% (Plan: 35%), Payback 35 Monate (Plan: 28). Hauptherausforderungen: Datenmigration, Change Management. Lessons: Konservative FTE-Annahmen, +30% Migrationsbuffer, 10-15% Change Budget. Erfolgreicher Abschluss mit strategischem Wert für Digitalisierungsroadmap.'
  },

  // ========== CASE 2: ABGEBROCHENER KI-CASE ==========
  {
    case_name: 'KI-gestützte Forecast-Plattform',
    description: 'Machine Learning Plattform zur Verbesserung der Umsatz- und Kostenprognosen',
    business_unit: 'Entwicklung',
    project_owner: 'Günther',
    
    status: 'abgebrochen',
    start_date: '2023-03-01',
    planned_end_date: '2024-02-29',
    actual_end_date: '2023-11-15',
    abort_reason: 'Technische Machbarkeit & ROI-Zweifel. Forecast-Genauigkeit nur 78% statt 90% erreicht.',
    
    revenue_planned: 950000,
    revenue_actual: 835000,
    costs_planned: 510000,
    costs_actual: 0,
    roi_planned: 0.65,
    roi_actual: -1.0,
    npv_planned: 620000,
    npv_actual: -835000,
    
    case_data: {
      business_model: {
        beschreibung: 'KI-ML Forecasting für präzisere Umsatz- und Kostenprognosen',
        ziele: [
          'Forecast-Genauigkeit 75% → 90%',
          'Forecast-Zeit 5 Tage → 1 Tag',
          'Automatische Ausreißer-Erkennung'
        ]
      },
      financials: {
        investment: {
          software_dev: 380000,
          data_science: 170000,
          cloud_infra: 60000,
          data_prep: 140000,
          pm: 85000,
          total: 835000
        }
      }
    },
    
    key_assumptions: [
      {
        assumption: 'KI-Modell erreicht 90% Genauigkeit',
        actual_outcome: 'FALSCH - nur 78% erreicht',
        deviation_reason: 'Historische Daten unzureichend, Retail-Volatilität',
        impact: 'PROJEKT-KILLER'
      },
      {
        assumption: 'Historische Daten ausreichend',
        actual_outcome: 'FALSCH - Datenqualität unzureichend',
        deviation_reason: 'Daten-Lücken, inkonsistente Erfassung',
        impact: 'PROJEKT-KILLER'
      }
    ],
    
    lessons_learned: {
      what_went_well: [
        'Team hat viel über KI/ML gelernt',
        'Datenqualitätsprobleme identifiziert',
        'Frühzeitiges Stoppen verhinderte größeren Schaden'
      ],
      what_went_wrong: [
        'Business Case zu optimistisch (90% Accuracy)',
        'Kein echtes PoC vor Full Commitment',
        'Data Assessment unzureichend',
        'Explainability/Trust unterschätzt'
      ],
      what_to_do_differently: [
        'IMMER PoC mit echten Daten BEVOR Business Case',
        'Data Quality Assessment als Phase 0',
        'Nur HARD Benefits, keine Soft Benefits',
        'Kill-Kriterien: Accuracy <85% nach 6 Monaten → Stop'
      ]
    },
    
    critical_decisions: [
      {
        decision: 'Projekt abbrechen',
        rationale: '78% nicht ausreichend, kein Verbesserung absehbar',
        outcome: 'RICHTIG - Weitermachen = mehr Geld vernichtet'
      }
    ],
    
    success_factors: [],
    failure_factors: [
      'Zu optimistische Annahmen (90% vs 78%)',
      'Unzureichendes Data Assessment',
      'Soft Benefits als Haupttreiber',
      'Keine PoC-Phase',
      'Sunk Cost Fallacy'
    ],
    
    industry: 'Retail',
    complexity: 'sehr_hoch',
    project_size: 'groß',
    rating: 1.5,
    tags: ['ki', 'ml', 'forecasting', 'misserfolg', 'abbruch', 'data_quality'],
    
    searchable_summary: 'KI-Forecasting Retail nach 8,5 Monaten abgebrochen. Plan: 90% Accuracy, 65% ROI. Erreicht: 78% Accuracy, -100% ROI. Hauptgründe: Datenqualität, optimistische Annahmen, Soft Benefits. Lessons: IMMER PoC erst, Data Assessment Phase 0, nur Hard Benefits, Kill-Kriterien definieren. Total Loss 835k. Wertvolle Learnings.'
  },

  // ========== CASE 3: SCOPE-CHANGE CASE ==========
  {
    case_name: 'Shared Service Center Aufbau',
    description: 'Finance SSC in Osteuropa für 12 Länder-Konsolidierung',
    business_unit: 'digitalization',
    project_owner: 'Osmani',
    
    status: 'abgeschlossen',
    start_date: '2022-06-01',
    planned_end_date: '2023-05-31',
    actual_end_date: '2023-09-30',
    duration_variance_days: 122,
    
    revenue_planned: 2200000,
    revenue_actual: 3060000,
    costs_planned: 1700000,
    costs_actual: 1580000,
    roi_planned: 0.45,
    roi_actual: 0.22,
    npv_planned: 1200000,
    npv_actual: 450000,
    payback_months_planned: 32,
    payback_months_actual: 52,
    
    case_data: {
      business_model: {
        beschreibung: 'Finance SSC Osteuropa, Konsolidierung 85 → 60 FTE',
        ziele: [
          'Kostenreduktion 30%',
          'Prozessstandardisierung 12 Länder',
          'Service Level verbessern'
        ]
      },
      financials: {
        investment: {
          location_setup: 550000,
          recruitment: 480000,
          process_design: 400000,
          it_systems: 380000,
          transition: 650000,
          pm: 280000,
          severance: 320000,
          total: 3060000
        }
      }
    },
    
    key_assumptions: [
      {
        assumption: 'FTE-Reduktion 85 → 60',
        actual_outcome: 'Nur 80 → 55',
        deviation_reason: 'Scope-Ausweitung: Legal Entity doch inkl.',
        impact: 'ROI -15 Prozentpunkte'
      },
      {
        assumption: 'Kein Severance nötig',
        actual_outcome: '320k Abfindungen',
        deviation_reason: 'Lokale Arbeitsgesetze, Betriebsräte',
        impact: '+320k Investment'
      }
    ],
    
    lessons_learned: {
      what_went_well: [
        'Prozess-Standardisierung funktioniert',
        'Service Quality verbessert sich',
        'SSC-Team motiviert'
      ],
      what_went_wrong: [
        'Scope Creep: Legal Entity separate halten',
        'Severance-Kosten nicht eingeplant (320k)',
        'Prozess-Komplexität unterschätzt',
        'Fachkräftemangel unterschätzt'
      ],
      what_to_do_differently: [
        'Scope-Freeze nach Approval',
        'Severance immer einplanen (5-10%)',
        'Process Assessment: 3 Monate Phase 0',
        'Contingency: 20% für SSC (statt 10%)'
      ]
    },
    
    critical_decisions: [
      {
        decision: 'Legal Entity Accounting inkludieren (Scope-Change)',
        rationale: 'Business Druck, "Jetzt oder nie"',
        outcome: 'Teuer - +15 FTE, +2 Monate, Business Case schlechter'
      }
    ],
    
    success_factors: [
      'Executive Sponsorship auf Country-Level',
      'Dediziertes Transition-Team',
      'Aggressives Scope Management (ab jetzt)'
    ],
    
    failure_factors: [],
    
    industry: 'Pharma',
    complexity: 'sehr_hoch',
    project_size: 'sehr_groß',
    rating: 3.0,
    tags: ['ssc', 'shared_services', 'offshore', 'scope_change', 'teilerfolg'],
    
    searchable_summary: 'Finance SSC Osteuropa, 12 Länder. 80→55 FTE (Plan: 85→60). ROI 22% (Plan: 45%). Scope Creep (Legal Entity), Severance 320k, Fachkräftemangel. 4 Monate Verzögerung, 39% Overrun. Lessons: Scope Freeze, Severance einplanen, +30% Zeit-Buffer. Langfristig erfolgreich - Automatisierungs-Plattform.'
  },

  // ========== CASE 4: QUICK WIN RPA ==========
  {
    case_name: 'RPA - Automatisierung Rechnungsfreigabe',
    description: 'RPA-Bot für automatisierte Rechnungsfreigabe-Workflows',
    business_unit: 'automation',
    project_owner: 'Meiser',
    
    status: 'abgeschlossen',
    start_date: '2024-01-10',
    planned_end_date: '2024-03-31',
    actual_end_date: '2024-03-25',
    duration_variance_days: -6,
    
    revenue_planned: 85000,
    revenue_actual: 79000,
    costs_planned: 120000,
    costs_actual: 133000,
    roi_planned: 1.45,
    roi_actual: 1.68,
    npv_planned: 165000,
    npv_actual: 215000,
    payback_months_planned: 12,
    payback_months_actual: 10,
    
    case_data: {
      business_model: {
        beschreibung: 'RPA-Bot für Rechnungsfreigabe: Routing, Status, Erinnerungen',
        ziele: [
          '80% Standard-Freigaben automatisieren',
          'Durchlaufzeit 7 → 2 Tage',
          '1,5 FTE entlasten'
        ]
      },
      financials: {
        investment: {
          rpa_license: 25000,
          implementation: 38000,
          internal: 12000,
          training: 4000,
          total: 79000
        },
        savings_annual: {
          fte_entlastung: 1.5,
          personnel: 90000,
          efficiency: 28000,
          error_reduction: 15000,
          total: 133000
        }
      }
    },
    
    key_assumptions: [
      {
        assumption: '80% automatisierbar',
        actual_outcome: 'ÜBERTROFFEN - 84%',
        deviation_reason: 'Standardisierung besser als gedacht',
        impact: 'POSITIV'
      },
      {
        assumption: 'Durchlaufzeit 7 → 2 Tage',
        actual_outcome: 'ÜBERTROFFEN - 1,8 Tage',
        deviation_reason: 'Bot arbeitet 24/7',
        impact: 'POSITIV'
      }
    ],
    
    lessons_learned: {
      what_went_well: [
        'Fokussierter Scope (nicht zu viel)',
        'Standard-Prozess (keine Komplexität)',
        'Pilot-Phase half Fehler zu finden',
        'Team sah Bot als Entlastung',
        'Vendor-Auswahl richtig'
      ],
      what_went_wrong: [],
      what_to_do_differently: [
        'Noch mehr kommunizieren',
        'Früher weitere Use Cases identifizieren'
      ]
    },
    
    critical_decisions: [
      {
        decision: 'Go nach Business Case',
        rationale: 'ROI 145%, niedriges Risiko, Quick Win',
        outcome: 'RICHTIG - großer Erfolg'
      }
    ],
    
    success_factors: [
      'Standard-Prozess',
      'Klarer ROI (kein Soft Benefits)',
      'Niedriges Investment (85k)',
      'Quick Win (3 Monate)',
      'User Buy-In'
    ],
    
    failure_factors: [],
    
    industry: 'Logistics',
    complexity: 'niedrig',
    project_size: 'klein',
    rating: 5.0,
    tags: ['rpa', 'automation', 'quick_win', 'erfolg', 'best_practice'],
    
    searchable_summary: 'RPA-Automatisierung Rechnungsfreigabe Logistics. Großer Erfolg: ROI 168% (Plan: 145%), 84% Automatisierung, Durchlaufzeit 1,8 Tage (Plan: 2), unter Budget (-7%), vor Zeitplan (-6 Tage). Lessons: Fokussierter Scope, Standard-Prozess, klarer ROI, Quick Win, User Buy-In. Musterprojekt 5/5.'
  }
];

// ========================================
// INGESTION FUNCTION
// ========================================

async function ingestDummyCases() {
    console.log('🚀 Starting dummy case ingestion...');
    console.log(`📍 Target API: ${API_URL}\n`);
    
    if (API_URL === 'https://albo-solutions.vercel.app') {
        console.error('❌ ERROR: Please update API_URL in the script!');
        console.error('   Line 10: const API_URL = "https://albo-solutions.vercel.app";\n');
        return;
    }
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < ALBO_DUMMY_CASES.length; i++) {
        const caseData = ALBO_DUMMY_CASES[i];
        console.log(`\n📥 [${i + 1}/${ALBO_DUMMY_CASES.length}] Ingesting: ${caseData.case_name}...`);
        
        try {
            const response = await fetch(`${API_URL}/api/cases/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': 'admin'
                },
                body: JSON.stringify(caseData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log(`   ✅ Success!`);
            console.log(`   📊 Case ID: ${result.case_id}`);
            console.log(`   🔢 Embeddings: ${result.embeddings_created}`);
            success++;
            
            // Wait 3 seconds between requests (OpenAI rate limiting)
            if (i < ALBO_DUMMY_CASES.length - 1) {
                console.log(`   ⏳ Waiting 3 seconds before next case...`);
                await new Promise(r => setTimeout(r, 3000));
            }
            
        } catch (error) {
            console.error(`   ❌ FAILED!`);
            console.error(`   Error: ${error.message}`);
            failed++;
        }
    }
    
    console.log('\n========================================');
    console.log('📊 INGESTION COMPLETE');
    console.log('========================================');
    console.log(`✅ Successful: ${success} / ${ALBO_DUMMY_CASES.length}`);
    console.log(`❌ Failed: ${failed} / ${ALBO_DUMMY_CASES.length}`);
    
    if (success === ALBO_DUMMY_CASES.length) {
        console.log('\n🎉 ALL CASES INGESTED SUCCESSFULLY!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Open your app in browser');
        console.log('   2. Try searching: "ERP Projekte"');
        console.log('   3. Should see 2 results!\n');
    } else if (failed > 0) {
        console.log('\n⚠️  Some cases failed. Check errors above.');
        console.log('   Common issues:');
        console.log('   - Wrong API_URL');
        console.log('   - Missing Environment Variables in Vercel');
        console.log('   - OpenAI API Key not working\n');
    }
}

// ========================================
// RUN
// ========================================

ingestDummyCases().catch(error => {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
});
