/**
 * CFO Dashboard - Wirtschaftlichkeit Module
 * Constants & Configuration
 * 
 * @module wirtschaftlichkeit/constants
 * @description Central repository for all constants, defaults, and mappings
 * @author Senior Development Team
 * @version 2.0.0
 */

/**
 * HK-Aufteilungs-Defaults nach Artikel-Typ
 * Basierend auf Branchenstandards und VDMA-Richtlinien
 * 
 * @type {Object.<string, import('./types').HKDefaultProfile>}
 * @constant
 */
export const HK_DEFAULTS = {
    'Hardware': {
        typ: 'Hardware',
        material: 60,
        fertigung: 25,
        overhead: 15,
        beschreibung: 'Typisch für Hardware-Produkte mit hohem Materialeinsatz. ' +
                     'Basiert auf VDMA-Branchenstudie 2024 für Maschinenbau und Elektronik.',
        quelle: 'VDMA Branchenstudie 2024',
        benchmark: {
            median: 60,
            p25: 55,
            p75: 65,
            quelle: 'VDMA Maschinenbau-Statistik',
            jahr: '2024'
        }
    },
    'Software': {
        typ: 'Software',
        material: 5,
        fertigung: 75,
        overhead: 20,
        beschreibung: 'Software-Entwicklung mit minimalen Materialkosten (Lizenzen, Tools). ' +
                     'Hauptanteil sind Personalkosten. Basiert auf Bitkom IT-Kostenrechnung 2024.',
        quelle: 'Bitkom IT-Kostenrechnung 2024',
        benchmark: {
            median: 5,
            p25: 3,
            p75: 8,
            quelle: 'Bitkom Software-Entwicklung',
            jahr: '2024'
        }
    },
    'Service': {
        typ: 'Service',
        material: 10,
        fertigung: 70,
        overhead: 20,
        beschreibung: 'Dienstleistungen mit Fokus auf Personaleinsatz. ' +
                     'Geringe Materialkosten (Verbrauchsmaterial, Dokumentation).',
        quelle: 'BDU Beraterbenchmark 2024',
        benchmark: {
            median: 10,
            p25: 5,
            p75: 15,
            quelle: 'BDU Consulting Costs',
            jahr: '2024'
        }
    },
    'Default': {
        typ: 'Default',
        material: 50,
        fertigung: 30,
        overhead: 20,
        beschreibung: 'Standard-Aufteilung für nicht-klassifizierte Artikel. ' +
                     'Empfohlen: Individuelle Anpassung nach Produktionsverfahren.',
        quelle: 'Industriestandard',
        benchmark: null
    }
};

/**
 * Kostenblock-Mapping zu DB-Stufen
 * Nach HGB § 275 Abs. 2 und IAS 1
 * 
 * @type {import('./types').KostenMapping}
 * @constant
 */
export const KOSTEN_MAPPING = {
    // DB3: Forschungs- und Entwicklungskosten (HGB § 275 Abs. 2 Nr. 5)
    development: [
        'personal',           // Entwicklungspersonal
        'cloud',             // Cloud-Entwicklungsumgebung
        'lizenzen',          // Entwicklungs-Tools & IDEs
        'testing',           // QA & Testing
        'compute',           // GPU/Compute Resources (AI/ML)
        'daten'              // Daten-Beschaffung & Labeling
    ],
    
    // DB4: Vertriebskosten (HGB § 275 Abs. 2 Nr. 6)
    selling_marketing: [
        'schulung',          // Kundenschulungen (Vertriebsunterstützung)
        'marketing',         // Marketing-Kampagnen
        'vertrieb',          // Vertriebskosten
        'reise'             // Reisekosten Vertrieb
    ],
    
    // DB5: Allgemeine Verwaltungskosten (HGB § 275 Abs. 2 Nr. 7)
    admin_distribution: [
        'compliance',        // Compliance & Legal
        'admin',            // Verwaltung
        'material',         // Materialverwaltung (nicht Produktion)
        'werkzeuge',        // Allgemeine Betriebsmittel
        'zertifizierung'    // Zertifizierungskosten (falls nicht F&E)
    ]
};

/**
 * Mehrdeutige Kostenblöcke mit Kontextabhängigkeit
 * Erfordern KI-Analyse oder manuelle Zuordnung
 * 
 * @constant
 */
export const MEHRDEUTIGE_BLOECKE = {
    'security-tools': {
        default_kategorie: 'admin_distribution',
        alternativen: [
            {
                kategorie: 'development',
                bedingung: 'Wenn Security-Tools in Entwicklungsphase für Security-by-Design',
                konfidenz_schwelle: 60,
                indikatoren: ['entwicklung', 'dev', 'design', 'architecture']
            }
        ],
        hinweis: 'Zeiterfassung durchführen: >50% Entwicklung → Development, sonst → Admin',
        rechtsgrundlagen: {
            development: 'HGB § 275 Abs. 2 Nr. 5 - F&E-Aufwendungen',
            admin: 'HGB § 275 Abs. 2 Nr. 7 - Allgemeine Verwaltung'
        }
    },
    'schulung': {
        default_kategorie: 'selling_marketing',
        alternativen: [
            {
                kategorie: 'development',
                bedingung: 'Interne Mitarbeiterschulung für Produktentwicklung',
                konfidenz_schwelle: 70,
                indikatoren: ['mitarbeiter', 'team', 'intern', 'entwickler']
            }
        ],
        differenzierung: {
            'kundenschulung': 'selling_marketing',
            'mitarbeiterschulung_entwicklung': 'development',
            'allgemeine_weiterbildung': 'admin_distribution'
        },
        hinweis: 'Kostenstellen-Mapping führen: Schulungen durch Vertrieb → Vertrieb, durch F&E → F&E',
        rechtsgrundlage: 'IDW RS HFA 13 - Zuordnung nach organisatorischer Verantwortung'
    },
    'audits': {
        default_kategorie: 'admin_distribution',
        alternativen: [
            {
                kategorie: 'selling_marketing',
                bedingung: 'Wenn Audits zur Kundenakquise (ISO-Zertifizierung für Tender)',
                konfidenz_schwelle: 50,
                indikatoren: ['tender', 'ausschreibung', 'kunde', 'vertrieb']
            }
        ],
        hinweis: 'ISO-Audits für Vertriebszwecke können Vertriebskosten sein',
        rechtsgrundlage: 'HGB § 275 Abs. 2 Nr. 6/7 - je nach Zweck'
    }
};

/**
 * Rechtsdatenbank für Kategorisierungs-Begründungen
 * Umfassende Referenzen zu HGB, IFRS, und Kommentierungen
 * 
 * @constant
 */
export const RECHTSGRUNDLAGEN_DB = {
    'HGB § 275': {
        titel: 'Gliederung der Gewinn- und Verlustrechnung',
        link: 'https://www.gesetze-im-internet.de/hgb/__275.html',
        relevante_absätze: {
            'Abs. 2 Nr. 5': {
                text: 'Forschungs- und Entwicklungskosten',
                anwendung: 'Alle Aufwendungen für F&E, die nicht aktivierungspflichtig sind',
                praxis: 'Development Overhead (DB3)'
            },
            'Abs. 2 Nr. 6': {
                text: 'Vertriebskosten',
                anwendung: 'Kosten zur Absatzförderung und Kundenakquise',
                praxis: 'Selling & Marketing Overhead (DB4)'
            },
            'Abs. 2 Nr. 7': {
                text: 'Allgemeine Verwaltungskosten',
                anwendung: 'Nicht zuordenbare Verwaltungskosten',
                praxis: 'Administration Overhead (DB5)'
            }
        },
        kommentierung: 'Beck\'scher Bilanz-Kommentar, 13. Auflage 2024'
    },
    
    'HGB § 255': {
        titel: 'Bewertungsmaßstäbe',
        link: 'https://www.gesetze-im-internet.de/hgb/__255.html',
        relevante_absätze: {
            'Abs. 2': {
                text: 'Herstellungskosten',
                anwendung: 'Definition Material-, Fertigungs- und Sonderkosten',
                praxis: 'Basis für HK-Aufteilung (Material/Fertigung/Overhead)'
            },
            'Abs. 2a': {
                text: 'Entwicklungskosten',
                anwendung: 'Aktivierungspflicht für Entwicklungskosten',
                praxis: 'Wichtig für Abgrenzung aktivierbare vs. sofort aufwandswirksame Kosten'
            }
        }
    },
    
    'IAS 38': {
        titel: 'Intangible Assets',
        link: 'https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/',
        relevante_paragraphen: {
            '38.54': {
                text: 'Forschungskosten sind sofort aufwandswirksam',
                anwendung: 'Research Phase: Keine Aktivierung'
            },
            '38.57': {
                text: 'Entwicklungskosten sind aktivierungspflichtig bei 6 Kriterien',
                anwendung: 'Development Phase: Aktivierungspflicht wenn Kriterien erfüllt'
            },
            '38.66': {
                text: 'Direkt zurechenbare Kosten bei interner Entwicklung',
                anwendung: 'Cloud-Kosten für Dev-Umgebungen sind aktivierbar'
            }
        },
        praxis: 'Bei IFRS-Anwendung: Strengere Aktivierungsregeln als HGB'
    },
    
    'IAS 1': {
        titel: 'Presentation of Financial Statements',
        link: 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
        relevante_paragraphen: {
            '1.103': {
                text: 'Gliederung nach Funktionen',
                anwendung: 'Cost of Sales Method - ähnlich Deckungsbeitragsrechnung',
                praxis: 'Vertriebskosten = Selling & Marketing'
            }
        }
    },
    
    'Beck Bilanzkommentar': {
        titel: 'Beck\'scher Bilanz-Kommentar',
        ausgabe: '13. Auflage 2024',
        relevante_stellen: {
            '§ 275 Rn. 182': {
                thema: 'IT-Sicherheitskosten',
                empfehlung: 'Zuordnung zu F&E während Entwicklung, danach Verwaltung',
                zitat: 'Bei Cyber-Security-Projekten ist die Zuordnung zu F&E sachgerecht, ' +
                       'solange die Tools aktiv zur Produktentwicklung beitragen.'
            },
            '§ 275 Rn. 201': {
                thema: 'Schulungskosten',
                empfehlung: 'Differenzierung nach Zweck und Zielgruppe',
                zitat: 'Kundenschulungen sind Vertriebskosten, Mitarbeiterschulungen ' +
                       'je nach Abteilung F&E oder Verwaltung.'
            }
        }
    },
    
    'IDW RS HFA 13': {
        titel: 'IDW Rechnungslegungs-Standard - Herstellungskosten',
        jahr: '2022',
        kernaussagen: [
            'Kostenstellen-Mapping ist entscheidend für Zuordnung',
            'Organisatorische Verantwortung bestimmt Kostenzuordnung',
            'Bei Mehrfachnutzung: Schlüsselung nach Zeiterfassung'
        ]
    }
};

/**
 * Branchen-Benchmarks für KPIs
 * Datenquellen: Bundesbank, VDMA, Bitkom, BDU
 * 
 * @constant
 */
export const BRANCHEN_BENCHMARKS = {
    'Hardware': {
        manufacturing_margin: {
            median: 36,
            p25: 28,
            p75: 42,
            top_quartile: 48,
            quelle: 'VDMA Maschinenbau 2024'
        },
        ebit_margin: {
            median: 14,
            p25: 8,
            p75: 18,
            top_quartile: 24,
            quelle: 'Bundesbank Unternehmensabschlüsse'
        }
    },
    'Software': {
        manufacturing_margin: {
            median: 65,
            p25: 55,
            p75: 75,
            top_quartile: 82,
            quelle: 'Bitkom Software-Industrie 2024'
        },
        ebit_margin: {
            median: 22,
            p25: 12,
            p75: 32,
            top_quartile: 45,
            quelle: 'Bitkom SaaS-Benchmark'
        }
    },
    'Service': {
        manufacturing_margin: {
            median: 45,
            p25: 35,
            p75: 55,
            top_quartile: 65,
            quelle: 'BDU Consulting Benchmark 2024'
        },
        ebit_margin: {
            median: 18,
            p25: 10,
            p75: 25,
            top_quartile: 35,
            quelle: 'BDU Professional Services'
        }
    }
};

/**
 * Default-Prozentsätze für Overhead-Kostenarten
 * Basierend auf Durchschnittswerten deutscher Industrieunternehmen
 * 
 * @constant
 */
export const OVERHEAD_DEFAULTS = {
    material_overhead: {
        default: 8,
        beschreibung: 'Materialgemeinkosten (Lagerhaltung, Beschaffung, Logistik)',
        range: { min: 5, max: 15 },
        quelle: 'IHK Kostenrechnung-Standard'
    },
    manufacturing_overhead: {
        default: 12,
        beschreibung: 'Fertigungsgemeinkosten (Maschinenwartung, Energie, Hilfslöhne)',
        range: { min: 8, max: 20 },
        quelle: 'VDMA Fertigungskosten-Studie'
    },
    selling_overhead: {
        default: 6,
        beschreibung: 'Vertriebsgemeinkosten (Vertriebsorganisation, CRM)',
        range: { min: 3, max: 12 },
        quelle: 'Handelsverband Deutschland'
    },
    marketing_overhead: {
        default: 4,
        beschreibung: 'Marketingkosten (Werbung, Events, PR)',
        range: { min: 2, max: 10 },
        quelle: 'Marketing-Verband'
    },
    distribution_overhead: {
        default: 3,
        beschreibung: 'Verteilungskosten (Versand, Fulfillment, Lager)',
        range: { min: 2, max: 8 },
        quelle: 'Logistik-Benchmark'
    },
    admin_overhead: {
        default: 5,
        beschreibung: 'Verwaltungsgemeinkosten (Buchhaltung, HR, IT)',
        range: { min: 3, max: 10 },
        quelle: 'Bundesverband Verwaltungskosten'
    }
};

/**
 * Validation Rules für Input-Felder
 * 
 * @constant
 */
export const VALIDATION_RULES = {
    hk_aufteilung: {
        summe_muss_100_sein: true,
        einzelwerte: {
            min: 0,
            max: 100
        },
        error_messages: {
            summe_nicht_100: 'Die Summe aller HK-Anteile muss 100% ergeben',
            wert_ausserhalb_range: 'Wert muss zwischen 0% und 100% liegen'
        }
    },
    overhead_prozente: {
        min: 0,
        max: 100,
        empfohlene_summe_max: 50,
        warning_messages: {
            summe_sehr_hoch: 'Summe aller Overheads >50% - Prüfen Sie die Zuordnung'
        }
    },
    projekt_zeitraum: {
        min_jahre: 1,
        max_jahre: 10,
        empfohlene_jahre: 5
    }
};

/**
 * UI-Labels und Translations
 * Zentrale Verwaltung aller UI-Texte für einfache Mehrsprachigkeit
 * 
 * @constant
 */
export const UI_LABELS = {
    db_stufen: {
        db1: 'Contribution Margin I (DB1)',
        db2: 'Manufacturing Margin (DB2)',
        db3: 'Contribution Margin III (DB3)',
        db4: 'Contribution Margin IV (DB4)',
        db5: 'Contribution Margin V (DB5)',
        ebit: 'Operating Profit (EBIT)'
    },
    kostenarten: {
        material_costs: 'Material Costs',
        direct_labour: 'Direct Labour',
        material_overhead: 'Material Overhead',
        manufacturing_overhead: 'Manufacturing Overhead',
        development_overhead: 'Development Overhead',
        selling_overhead: 'Selling Overhead',
        marketing_overhead: 'Marketing Overhead',
        distribution_overhead: 'Distribution Overhead',
        admin_overhead: 'Administration Overhead'
    },
    kategorien: {
        development: '🔬 Development (DB3)',
        selling_marketing: '📢 Sales & Marketing (DB4)',
        admin_distribution: '🏢 Administration (DB5)'
    }
};

/**
 * Calculation Constants
 * 
 * @constant
 */
export const CALCULATION_CONSTANTS = {
    DEFAULT_WACC: 0.08,  // 8% Weighted Average Cost of Capital
    DEFAULT_TAX_RATE: 0.30,  // 30% Corporate Tax (Deutschland)
    IRR_MAX_ITERATIONS: 100,
    IRR_PRECISION: 0.0001,
    NPV_PRECISION: 2  // Decimal places for NPV
};

/**
 * Export all constants as named exports for tree-shaking
 */
export default {
    HK_DEFAULTS,
    KOSTEN_MAPPING,
    MEHRDEUTIGE_BLOECKE,
    RECHTSGRUNDLAGEN_DB,
    BRANCHEN_BENCHMARKS,
    OVERHEAD_DEFAULTS,
    VALIDATION_RULES,
    UI_LABELS,
    CALCULATION_CONSTANTS
};
