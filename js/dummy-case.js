/**
 * ALBO Dummy Controlling Cases
 * Kompatibel mit ALBO_Projects Struktur
 * Realistische Cases für Demo/Testing
 * 
 * CFO-FRAGEN:
 * - Welche Cases hatten ähnliche ROI-Erwartungen?
 * - Wo lagen wir mit der Prognose richtig/falsch?
 * - Welche Projekte wurden abgebrochen und warum?
 * - Welche Kostenüberschreitungen traten auf?
 * 
 * HORVÁTH BERATER-FRAGEN:
 * - Welche Annahmen waren kritisch?
 * - Wie sensitiv war der Business Case?
 * - Welche Erfolgsfaktoren identifizierbar?
 * - Lessons Learned für künftige Cases?
 */

const ALBO_DUMMY_CASES = [
  // ========== CASE 1: ERFOLGREICHER DIGITAL-CASE ==========
  {
    // ALBO_Projects kompatibel
    case_name: 'ERP-Digitalisierung Rechnungswesen',
    description: 'Vollständige Digitalisierung des Rechnungswesens durch cloud-basierte ERP-Lösung mit RPA-Integration',
    business_unit: 'digitalization',
    project_owner: 'Osmani',
    
    // Status & Timeline
    status: 'abgeschlossen',
    start_date: '2023-01-15',
    planned_end_date: '2023-12-31',
    actual_end_date: '2024-01-31',
    duration_variance_days: 31, // 1 Monat Verzögerung
    
    // Financial Data
    revenue_planned: 600000, // Investment
    revenue_actual: 680000,
    costs_planned: 360000, // Savings
    costs_actual: 340000,
    db2_planned: 0.35,
    db2_actual: 0.28,
    roi_planned: 0.35,
    roi_actual: 0.28,
    npv_planned: 185000,
    npv_actual: 142000,
    payback_months_planned: 28,
    payback_months_actual: 35,
    
    // Complete Case Data (JSON)
    case_data: {
      business_model: {
        beschreibung: 'Cloud-ERP mit Automatisierung von Kreditorenbuchhaltung, Mahnwesen und Reporting',
        ziele: [
          'Reduktion manueller Buchungen um 70%',
          'Monatsabschluss von 10 auf 3 Tage',
          'Fehlerquote < 1%',
          'Echtzeit-Reporting'
        ],
        scope: 'Kreditorenbuchhaltung, Debitorenbuchhaltung, Reporting',
        out_of_scope: 'Anlagenbuchhaltung, Lohnbuchhaltung'
      },
      
      financials: {
        investment: {
          software_licenses: 250000,
          implementation: 210000, // +30k Overrun
          hardware: 55000,
          training: 50000,
          pm: 95000,
          contingency: 20000,
          total: 680000
        },
        savings_annual: {
          fte_reduction: 3.0, // Nur 3 statt 3,5
          personnel_saved: 240000,
          process_efficiency: 60000,
          error_reduction: 40000,
          total: 340000
        }
      },
      
      kpis: {
        monatsabschluss_tage_vorher: 10,
        monatsabschluss_tage_nachher: 4, // Target 3
        fehlerquote_vorher: 0.05,
        fehlerquote_nachher: 0.012, // Target 0.01
        automatisierungsgrad: 0.78 // Target 0.80
      }
    },
    
    // Learnings (GOLD für RAG!)
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
      },
      {
        assumption: 'Prozesse 1:1 abbildbar (Lift & Shift)',
        actual_outcome: 'Prozess-Redesign erforderlich',
        deviation_reason: 'Legacy nicht 1:1 abbildbar',
        impact: '+2 Monate, aber bessere Prozesse'
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
        'Change Management Budget zu knapp (7% statt 10%)',
        'Vendor-Preisstrategie nicht vertraglich fixiert'
      ],
      what_to_do_differently: [
        'Datenmigration: +30% Buffer einplanen',
        'Change Management: 10-15% Budget',
        'FTE-Reduktion: Konservativ (70-80% erreichen)',
        'Vendor-Verträge: 3 Jahre Preisstabilität'
      ]
    },
    
    critical_decisions: [
      {
        decision: 'Go nach Business Case',
        rationale: 'ROI 35%, Payback <3 Jahre',
        outcome: 'Richtig - Projekt erfolgreich',
        alternatives: ['Inhouse-Entwicklung', 'Status Quo']
      },
      {
        decision: 'Prozess-Redesign statt Lift & Shift',
        rationale: 'Chance für echte Verbesserung',
        outcome: 'Richtig - +10k Efficiency vs Plan',
        cost_impact: '+30k, +2 Monate'
      }
    ],
    
    success_factors: [
      'Executive Sponsorship (CFO aktiv)',
      'Agile 2-Wochen-Sprints',
      'Externe Expertise für kritische Phasen'
    ],
    
    failure_factors: [],
    
    // Metadata
    industry: 'Manufacturing',
    complexity: 'mittel',
    project_size: 'mittel',
    rating: 3.5,
    tags: ['erp', 'digitalisierung', 'automation', 'rpa', 'erfolg'],
    
    // Searchable Summary
    searchable_summary: `
      ERP-Digitalisierung Rechnungswesen Manufacturing. 
      Cloud-ERP mit 3,0 FTE Reduktion (Plan: 3,5). 
      ROI 28% (Plan: 35%), Payback 35 Monate (Plan: 28).
      Hauptherausforderungen: Datenmigration, Change Management.
      Lessons: Konservative FTE-Annahmen, +30% Migrationsbuffer,
      10-15% Change Budget. Erfolgreicher Abschluss mit strategischem
      Wert für Digitalisierungsroadmap.
    `.trim()
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
    actual_end_date: '2023-11-15', // Nach 8,5 Monaten abgebrochen
    abort_reason: 'Technische Machbarkeit & ROI-Zweifel. Forecast-Genauigkeit nur 78% statt 90% erreicht.',
    
    revenue_planned: 950000,
    revenue_actual: 835000, // Write-off
    costs_planned: 510000,
    costs_actual: 0,
    roi_planned: 0.65,
    roi_actual: -1.0, // Total Loss
    npv_planned: 620000,
    npv_actual: -835000,
    
    case_data: {
      business_model: {
        beschreibung: 'KI-ML Forecasting für präzisere Umsatz- und Kostenprognosen',
        ziele: [
          'Forecast-Genauigkeit 75% → 90%',
          'Forecast-Zeit 5 Tage → 1 Tag',
          'Automatische Ausreißer-Erkennung',
          'Szenario-Modellierung Echtzeit'
        ]
      },
      
      financials: {
        investment: {
          software_dev: 380000,
          data_science: 170000,
          cloud_infra: 60000,
          data_prep: 140000, // Mehr als geplant
          pm: 85000,
          total: 835000
        }
      },
      
      kpis_pilot: {
        forecast_accuracy_vorher: 0.75,
        forecast_accuracy_pilot: 0.78, // NUR marginal besser!
        forecast_time_vorher: 5,
        forecast_time_pilot: 3.5
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
      },
      {
        assumption: 'Modell-Training in 6 Monaten',
        actual_outcome: 'Nach 8 Monaten nicht produktionsreif',
        deviation_reason: 'Feature Engineering komplex',
        impact: 'KRITISCH'
      },
      {
        assumption: 'Controller akzeptieren KI',
        actual_outcome: 'Massiver Widerstand',
        deviation_reason: 'Black Box, keine Erklärbarkeit',
        impact: 'KRITISCH'
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
        'Soft Benefits nicht quantifizierbar',
        'Explainability/Trust unterschätzt',
        'Sunk Cost Fallacy: Zu lange weitergemacht'
      ],
      what_to_do_differently: [
        'IMMER PoC mit echten Daten BEVOR Business Case',
        'Data Quality Assessment als Phase 0',
        'Nur HARD Benefits, keine Soft Benefits',
        'Kill-Kriterien: Accuracy <85% nach 6 Monaten → Stop',
        'Explainability von Anfang an',
        'Alternative: Kaufen statt bauen'
      ]
    },
    
    critical_decisions: [
      {
        decision: 'Go nach Business Case',
        rationale: 'ROI 65%, strategisch (KI-Vorreiter)',
        outcome: 'FALSCH - Business Case zu optimistisch',
        alternatives: ['Kleinerer Pilot', 'Externe Lösung kaufen']
      },
      {
        decision: 'Weitermachen nach Pilot-Enttäuschung',
        rationale: 'Bereits 600k investiert (Sunk Cost)',
        outcome: 'FALSCH - Sunk Cost Fallacy',
        cost_impact: '+200k verschwendet'
      },
      {
        decision: 'Projekt abbrechen',
        rationale: '78% nicht ausreichend, kein Verbesserung absehbar',
        outcome: 'RICHTIG - Weitermachen = mehr Geld vernichtet',
        total_loss: 835000
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
    
    searchable_summary: `
      KI-Forecasting Retail nach 8,5 Monaten abgebrochen.
      Plan: 90% Accuracy, 65% ROI. Erreicht: 78% Accuracy, -100% ROI.
      Hauptgründe: Datenqualität, optimistische Annahmen, Soft Benefits.
      Lessons: IMMER PoC erst, Data Assessment Phase 0, nur Hard Benefits,
      Kill-Kriterien definieren. Total Loss 835k. Wertvolle Learnings.
    `.trim()
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
    duration_variance_days: 122, // 4 Monate Verzögerung
    
    revenue_planned: 2200000,
    revenue_actual: 3060000, // +39% Overrun
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
          'Service Level verbessern',
          'Enabler für Automatisierung'
        ],
        scope: 'A/R, A/P, G/L Accounting, Reporting'
      },
      
      financials: {
        investment: {
          location_setup: 550000,
          recruitment: 480000,
          process_design: 400000, // Scope-Change
          it_systems: 380000,
          transition: 650000, // 4 Monate Dual Run
          pm: 280000,
          severance: 320000, // Nicht geplant!
          total: 3060000
        },
        savings_annual: {
          personnel: 1250000, // 80→55 statt 85→60
          efficiency: 280000,
          procurement: 50000,
          total: 1580000
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
        assumption: 'SSC-Löhne 40k/FTE',
        actual_outcome: '43k/FTE (Fachkräftemangel)',
        deviation_reason: 'Arbeitsmarkt angespannt',
        impact: '+13% OpEx'
      },
      {
        assumption: 'Transition in 12 Monaten',
        actual_outcome: '16 Monate',
        deviation_reason: 'Scope-Change, Change-Widerstand',
        impact: '+4 Monate, +500k Dual Run'
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
        'SSC-Team motiviert',
        'Plattform für Automatisierung geschaffen'
      ],
      what_went_wrong: [
        'Scope Creep: Legal Entity separate halten',
        'Severance-Kosten nicht eingeplant (320k)',
        'Prozess-Komplexität unterschätzt',
        'Fachkräftemangel unterschätzt',
        'Change Management zu spät'
      ],
      what_to_do_differently: [
        'Scope-Freeze nach Approval',
        'Severance immer einplanen (5-10%)',
        'Process Assessment: 3 Monate Phase 0',
        'Retention-Strategie von Tag 1',
        'Change Management 6 Monate vor Transition',
        'Contingency: 20% für SSC (statt 10%)'
      ]
    },
    
    critical_decisions: [
      {
        decision: 'Legal Entity Accounting inkludieren (Scope-Change)',
        rationale: 'Business Druck, "Jetzt oder nie"',
        outcome: 'Teuer - +15 FTE, +2 Monate, Business Case schlechter',
        cost_impact: '+400k Investment, +600k/Jahr OpEx',
        roi_impact: '-15 Prozentpunkte'
      },
      {
        decision: 'Weitermachen trotz 4 Monaten Verzögerung',
        rationale: 'Sunk Cost 2,5M, SSC strategisch wichtig',
        outcome: 'Richtig - erfolgreich abgeschlossen, reduzierter ROI',
        alternatives: ['Abbruch', 'Pause']
      }
    ],
    
    success_factors: [
      'Executive Sponsorship auf Country-Level',
      'Dediziertes Transition-Team',
      'Aggressives Scope Management (ab jetzt)',
      'Frühzeitiges Recruiting'
    ],
    
    failure_factors: [],
    
    industry: 'Pharma',
    complexity: 'sehr_hoch',
    project_size: 'sehr_groß',
    rating: 3.0,
    tags: ['ssc', 'shared_services', 'offshore', 'scope_change', 'teilerfolg'],
    
    searchable_summary: `
      Finance SSC Osteuropa, 12 Länder. 80→55 FTE (Plan: 85→60).
      ROI 22% (Plan: 45%). Scope Creep (Legal Entity), Severance 320k,
      Fachkräftemangel. 4 Monate Verzögerung, 39% Overrun.
      Lessons: Scope Freeze, Severance einplanen, +30% Zeit-Buffer.
      Langfristig erfolgreich - Automatisierungs-Plattform.
    `.trim()
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
    duration_variance_days: -6, // Früher fertig!
    
    revenue_planned: 85000,
    revenue_actual: 79000, // Under Budget
    costs_planned: 120000,
    costs_actual: 133000, // Besser als geplant
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
          '1,5 FTE entlasten',
          'Fehlerquote senken'
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
          efficiency: 28000, // Besser als Plan
          error_reduction: 15000,
          total: 133000
        }
      },
      
      kpis: {
        automatisierungsgrad: 0.84, // Target 0.80
        durchlaufzeit: 1.8, // Target 2
        fehlerquote: 0.008, // Target 0.01
        skonto_nutzung: 0.72 // vs 0.45 vorher
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
      },
      {
        assumption: 'Implementation 3 Monate',
        actual_outcome: '6 Tage früher',
        deviation_reason: 'Standard-Prozess, gutes Team',
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
      what_went_wrong: [
        'Eigentlich nichts - seltener Fall!'
      ],
      what_to_do_differently: [
        'Noch mehr kommunizieren',
        'Früher weitere Use Cases identifizieren'
      ]
    },
    
    critical_decisions: [
      {
        decision: 'Go nach Business Case',
        rationale: 'ROI 145%, niedriges Risiko, Quick Win',
        outcome: 'RICHTIG - großer Erfolg',
        alternatives: []
      },
      {
        decision: 'Scope-Ausweitung auf Reisekosten',
        rationale: 'RPA-Erfolg, weitere Quick Wins',
        outcome: 'Follow-up genehmigt (Mai 2024)',
        alternatives: []
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
    rating: 5.0, // Perfect!
    tags: ['rpa', 'automation', 'quick_win', 'erfolg', 'best_practice'],
    
    searchable_summary: `
      RPA-Automatisierung Rechnungsfreigabe Logistics.
      Großer Erfolg: ROI 168% (Plan: 145%), 84% Automatisierung,
      Durchlaufzeit 1,8 Tage (Plan: 2), unter Budget (-7%),
      vor Zeitplan (-6 Tage). Lessons: Fokussierter Scope,
      Standard-Prozess, klarer ROI, Quick Win, User Buy-In.
      Musterprojekt 5/5.
    `.trim()
  }
];

// Export
export { ALBO_DUMMY_CASES };

/**
 * USAGE:
 * 
 * import { ALBO_DUMMY_CASES } from './albo-dummy-cases.js';
 * 
 * // Für Ingestion via API:
 * for (const case of ALBO_DUMMY_CASES) {
 *   await fetch('/api/cases/ingest', {
 *     method: 'POST',
 *     body: JSON.stringify(case)
 *   });
 * }
 */