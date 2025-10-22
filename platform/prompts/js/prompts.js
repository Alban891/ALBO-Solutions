/* ========================================== */
/* ALBO PROMPTS - 3-LEVEL HIERARCHY */
/* Multi-Role with MECE Theme Structure */
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
        
        console.log('💡 Prompts Engine initialized (3-Level Hierarchy)');
        console.log(`📚 Loaded ${this.allPrompts.length} prompts across ${this.getRoleCount()} roles`);
    }

    getThemeMapping() {
        return {
    "Controller": {
        "icon": "📊",
        "themes": [
            {"id": "kostenrechnung", "name": "💰 Kostenrechnung", "keywords": ["Kostenartenrechnung", "Materialkostenanalyse", "Personalkostenanalyse", "Kostenstellenrechnung", "Gemeinkosten", "Kostenstellenstruktur", "Ineffiziente Kostenstellen", "Kostenträgerrechnung", "Einstufige Deckungsbeitragsrechnung", "Mehrstufige Deckungsbeitragsrechnung", "Deckungsbeitragsanalyse", "Prozesskostenrechnung", "Activity-Based"]},
            {"id": "kalkulation", "name": "📐 Kalkulation", "keywords": ["Zuschlagskalkulation", "Angebotspreis", "Maschinenstundensatz", "Verrechnung", "Herstellkosten je Einheit", "Variantenprodukte", "Komplexität sauber", "Vertriebs-/Preiskalkulation", "Zielmarge", "Deckungsbeitragskalkulation", "Produktlinien", "Nachkalkulation", "Plankalkulation", "Abweichungen", "Kalkulation für Projektgeschäft", "Zeit, Material, Overhead", "Kostentägerzeitrechnung", "Für komplexe Aufträge", "Kalkulationssimulation", "Preis-/Kosten-/Mengenänderungen"]},
            {"id": "budgetierung", "name": "📈 Budgetierung & Forecasting", "keywords": ["Integrierte Budgetierung", "Abteilungsübergreifend", "Szenariobasierte Budgetierung", "Marketing-Budgetierung", "ROI", "Budgetierung von Fixkosten und variablen", "Kurzfrist-Forecasting", "bis 6 Monate", "Rolling Forecast", "Long-Term Forecast", "Treiberbasierte Planung", "Echtzeit-Monitoring von Budgetabweichungen", "Ursachenanalyse von Budgetabweichungen", "Agile Forecasting", "Planning"]},
            {"id": "investition", "name": "💼 Investitionsplanung", "keywords": ["Kostenvergleichsrechnung", "Gewinnvergleichsrechnung", "Rentabilitätsvergleichsrechnung", "Amortisationsrechnung", "Kapitalwertmethode", "Interne Zinsfuß-Methode", "Annuitätenmethode", "Dynamische Amortisationsrechnung", "Optimale Nutzungsdauer", "Ersatzzeitpunkt", "Investitionsplanung inkl. Risiko-", "Sensitivitätsanalyse"]},
            {"id": "kennzahlen", "name": "📊 Kennzahlensysteme", "keywords": ["Analyse der Vermögensstruktur", "Kapitalstruktur-Analyse", "Liquiditätskennzahlen", "Cash Management Optimierung", "Rentabilitätskennzahlen", "Performance bewerten", "steuern", "Cashflow-Kennzahlen", "Innenfinanzierungskraft", "Kosten- und Ergebnisstruktur", "Material-, Personal-", "Fixkostenanalyse", "Case - Vertriebs-", "Marketingkostenanalyse", "Kennzahlensysteme", "DuPont", "Value-based KPIs", "Balanced Scorecard", "Frühwarn-", "Krisenkennzahlen", "Branchen-", "Benchmark-Kennzahlen", "KPI-Storytelling", "Management-Kommunikation"]},
            {"id": "berichterstattung", "name": "📄 Finanzberichterstattung", "keywords": ["Monats-, Quartals-", "Jahresabschlüsse professionell", "Abweichungsanalyse mit Handlungsempfehlung", "Konzernreporting", "Konsolidierung", "Forecasting", "Rolling Forecasts", "Kennzahlen-Reporting", "KPIs", "Financial Ratios", "Management Reporting", "Visualisierung", "Storytelling im Reporting", "Sonderanalysen", "Ad-hoc-Reporting", "Berichtskommentierung", "Ableitung von Handlungsempfehlungen", "Automatisierung und KI im Reporting"]},
            {"id": "konzern", "name": "🏢 Konzerncontrolling", "keywords": ["Konzernreporting", "GuV, Bilanz, Cashflow", "KPI-Analyse", "Intercompany-Abstimmung", "Konsolidierungsvorbereitung", "Kapitalkonsolidierung", "Analyse", "Darstellung", "Aufwands-", "Ertragskonsolidierung", "Zwischenergebniseliminierung", "Konzern-Cashflow-Rechnung", "automatisiert", "interpretierbar", "Segment-", "Spartenreporting", "Benchmark", "Handlungsempfehlungen", "Konzern-Kennzahlenanalyse", "Konzern-Prognose", "Forecast", "Szenario-Logik", "Kommentierung von Konzernabschlüssen", "KPI-Storytelling auf Konzernebene"]},
            {"id": "projekt", "name": "🎯 Projektcontrolling", "keywords": ["Projektkostenplanung", "Bottom-up", "Top-down", "Projektstruktur-", "Meilensteinplanung", "Projektbudget-Controlling", "Mittelabruf", "Projektstatusbericht", "Ampellogik", "Maßnahmen", "Projekt-Deckungsbeitragsrechnung", "Forecast", "Szenarien im Projektverlauf", "Projektrisiken identifizieren", "managen", "Projektkommunikation", "Entscheidungsvorlagen", "Projektabschlussanalyse", "Abweichungen, Learnings", "Erfolgsfaktoren", "Erfolgsfaktoren-Profil", "Benchmarking", "Was gute Projekte ausmacht"]},
            {"id": "businesscase", "name": "💡 Business Case Controlling", "keywords": ["Klassischer Business Case für Produktinvestitionen", "Ganzheitlicher Investitions-Business-Case", "produktionsnahe Industrien", "Business Case für Software", "Digitalisierung", "Effizienz-", "Skalierungslogik", "Make-or-Buy Business Case", "wirtschaftlichem und strategischem Vergleich", "Business Case in Krisensituationen", "Turnaround, Standortschließung, Rettungsszenarien", "Szenario-basierter Business Case", "Base / Best / Stress", "ESG-", "Nachhaltigkeits-Business Case", "Impact-Logik", "nicht-monetäre Bewertung", "Kunden-/Marktbasierter Business Case", "Neukundengewinnung, CLV, Vertriebspotenzial", "Interner Business Case für Transformation", "Change", "Prozesse, Kultur, Organisation", "Branchenvergleich: Industrie vs. Software", "Business Case Logik, KPIs, Steuerung", "Business Case One-Pager", "Management Summary für Investitionsentscheidung"]},
            {"id": "digital", "name": "🚀 Digitale Geschäftsmodelle", "keywords": ["KPI-Entwicklung für digitale Geschäftsmodelle", "Planung", "Forecasting für digitale Geschäftsmodelle", "Break-Even-Analyse", "Skalierung digitaler Geschäftsmodelle", "Performance-Measurement digitaler Geschäftsmodelle", "Value", "Customer Metrics", "Szenario-Analyse", "Risikobewertung für digitale Geschäftsmodelle", "Business Case", "Investitionsrechnung für digitale Geschäftsmodelle", "KPI-Dashboard", "Reporting für digitale Geschäftsmodelle", "Storytelling für digitale Geschäftsmodelle", "Prozesskostenrechnung", "Operating Leverage im Controlling digitaler Geschäftsmodelle"]},
            {"id": "startup", "name": "🌱 Controlling für Start-ups", "keywords": ["Wie behalte ich als Gründer den Überblick", "Einnahmen", "Ausgaben verstehen", "Mini-GuV für Start-ups", "Fixkosten erkennen", "reduzieren", "Wo geht mein Geld hin", "Break-even berechnen", "Wann ist mein Unternehmen profitabel", "Finanzplan fürs 1. Jahr", "Für Banken, Förderstellen", "dich selbst", "Umsatzplanung mit wenig Daten", "Szenarien für unsichere Startphasen", "Einfache Kennzahlen", "Frühwarnsystem", "Die 3 wichtigsten Zahlen für dein Business", "Reporting für Investoren", "Förderstellen", "Monatsbericht in einfach", "Liquiditätsplanung ohne Finanzprofi", "90-Tage-Vorschau einfach gemacht", "Vorbereitung auf das erste Mitarbeitergespräch", "Personalkosten", "Planung verstehen"]},
            {"id": "kalkulation_gruender", "name": "🧮 Kalkulation für Gründer", "keywords": ["Einfach kalkulieren", "Was soll ich für diesen Auftrag verlangen", "Kostenvoranschlag erstellen", "Einfach, verständlich", "professionell", "Stundensatz richtig berechnen", "Was kostet 1 Stunde wirklich", "Angebotskalkulation mit Material", "Zeit", "Für Handwerk, Dienstleistung, Bau", "Was bleibt übrig", "Deinen Gewinn je Auftrag berechnen", "Preisidee vs. echte Kosten", "Ich dachte, ich verdiene mehr", "Rabatte", "Nachlässe richtig kalkulieren", "Was kostet dich ein 10 % Rabatt wirklich", "Preiserhöhung erklären", "begründen", "Für Stammkunden oder Preisverhandlungen", "Neue Leistungen kalkulieren", "Was kann ich für mein neues Produkt/Angebot verlangen", "Verkalkuliert", "So berechnest du unerwartete Zusatzkosten richtig", "Auftrag abgebrochen", "Was bleibt dir", "Kannst du geltend machen"]}
        ]
    },
    "Treasury": {
        "icon": "🏦",
        "themes": [
            {"id": "cash_liquiditaet", "name": "💵 Cash- & Liquiditätsplanung", "keywords": ["Tagesbasierte Liquiditätsvorschau", "13-Wochen Rolling Forecast", "Liquiditätsplanung auf Wochenbasis", "Szenarioanalyse - Normal, Stress, Worst Case", "Liquiditätsplanung", "Liquiditätskennzahlen-Dashboard", "Steuerung durch KPIs", "Kapitaldienstfähigkeitsprüfung", "Liquiditätsbasierte Analyse", "Rückzahlungsfähigkeit", "Liquiditätsauswirkungen einer Investition simulieren", "Kapitalbindung richtig abschätzen", "Frühwarnindikator für Liquiditätsengpässe", "automatisiert, flexibel, präventiv", "Analyse von Zahlungszielen", "Liquidität durch Working Capital Steuerung verbessern", "FX-basierte Liquiditätsplanung", "Liquiditätsreporting für Bankgespräch", "bankfähig, belastbar, vorausschauend"]},
            {"id": "finanzplanung_budgetierung", "name": "📈 Finanzplanung & Budgetierung", "keywords": ["Treasury-Budget für das kommende Geschäftsjahr", "Integration der Liquiditätsplanung in den Gesamtfinanzplan", "Simulation des Free Cashflows nach Investitionen und Finanzierung", "Szenariobasierte Finanzplanung", "Absicherung gegen Markt- und Planungsunsicherheiten", "Abgleich Forecast vs. Budget", "Abweichungsanalyse und Ursachenbewertung", "Planung der Zinsaufwendungen bei variablen Kreditlinien", "Finanzplanung unter Berücksichtigung saisonaler Schwankungen", "Working Capital Effekte in die Finanzplanung integrieren", "Treasury-Kostenstellenbudgetierung inkl. TMS und Banken", "Planung der Treasury-KPIs im Jahreszielsystem"]},
            {"id": "finanzierung_kapitalbeschaffung", "name": "💰 Finanzierung & Kapitalbeschaffung", "keywords": ["Strukturierung eines optimalen Finanzierungsmixes", "Kapazitätsanalyse bestehender Kreditlinien", "Simulationsmodell für Covenant-Entwicklung", "Liquiditätswirksamkeit von Finanzierungsvorhaben simulieren", "Bankfähiges Finanzierungskonzept erstellen", "Vergleich Kredit- vs. Leasing-Finanzierung", "Vorbereitung auf Refinanzierungsgespräche", "Einsatz von Förderkrediten prüfen und strukturieren", "Ermittlung des Fremdkapitalbedarfs aus Investitionsplanung", "Finanzierungsstrategie im Geschäftsmodell verankern"]},
            {"id": "banking_zahlungsverkehr", "name": "🏦 Banking & Zahlungsverkehr", "keywords": ["Optimierung der Kontostruktur im Unternehmen", "Benchmark der Bankgebühren und Verhandlungsstrategie", "Entwicklung eines zentralen Zahlungsverkehrskonzepts", "Cash Pooling", "Konzeption und Umsetzungsplan", "Einführung einer globalen Zahlungsrichtlinie", "Analyse der Bankbeziehungen und Bankpartnerstrategie", "Instant Payment Integration im Unternehmen", "SEPA- und SWIFT-Konformitätscheck für Zahlungsprozesse", "Zahlungsverkehrssicherheit", "Fraud-Risiken erkennen und minimieren", "Einführung eines zentralen Payment Hubs"]},
            {"id": "hedging_absicherung", "name": "🛡️ Hedging & Absicherungsstrategien", "keywords": ["Entwicklung einer Hedging-Strategie für Währungsrisiken", "Simulation der Hedging-Wirkung bei FX-Schwankungen", "Bewertung bestehender Zinsderivate auf Effektivität", "Entscheidungsmatrix für den Einsatz von FX-Hedging-Instrumenten", "Cashflow-Hedge Accounting vorbereiten", "Rohstoffpreisabsicherung systematisch aufbauen", "Sensitivitätsanalyse für Zinssicherungsbedarf", "Bewertung der Hedge-Quote in FX-Exposures", "Optimale Nutzungsdauer", "Ersatzzeitpunkt", "Aufbau eines internen Hedging-Reportings mit Frühwarnsystem", "Use Case: Donald Trump und die Strafzölle"]},
            {"id": "compliance_regulatory", "name": "⚖️ Compliance & Regulatorische ...", "keywords": ["Überprüfung der Einhaltung von EMIR- und MiFIR-Pflichten", "Bewertung von Sanktionsrisiken bei internationalen Zahlungspartnern", "Einführung eines internen IKS für Treasury-Prozesse", "Check regulatorischer Anforderungen bei TMS-Auswahl und -Einführung", "Meldepflichten bei grenzüberschreitenden Finanztransaktionen", "AWV, Z4 etc.", "Bewertung von Treasury-Prozessen auf BAIT-/MaRisk-Konformität", "Entwicklung eines KYC-Checks für neue Banken oder Zahlungspartner", "Erstellung eines Compliance-Reports für das Treasury", "Aufbau eines Notfallplans bei regulatorischen Verstößen oder Datenverlust", "Regulatorische Vorprüfung bei internationalen Cash Pooling-Strukturen"]},
            {"id": "treasury_strategie", "name": "🎯 Treasury Strategie & Governance", "keywords": ["Entwicklung einer konzernweiten Treasury Governance", "Aufbau einer Treasury-Vision", "strategischen Zielbildes", "Festlegung eines Rollen- und Verantwortungsmodells im Treasury", "Strategische Bewertung zentraler vs. dezentraler Treasury-Organisation", "Entwicklung einer Treasury Scorecard mit KPIs und Zielwerten", "Entwicklung eines Treasury Operating Models", "Prozesse, Systeme, Struktur", "Benchmark des Treasury-Reifegrads mit Branchenvergleich", "Entwicklung einer Strategie zur Treasury-Digitalisierung", "Ableitung einer Personalstrategie für die Treasury-Funktion", "Bewertung der Positionierung des Treasury gegenüber CFO, Business", "Banken"]},
            {"id": "finanzierung_kapitalstruktur", "name": "💼 Finanzierung & Kapitalstruktur", "keywords": ["Optimierung des Finanzierungsmix", "kurz-/langfristig", "Vorbereitung auf Kreditgespräche und Bankenauswahl", "Liquiditätsbasierte Kreditlinienplanung", "Projektstatusbericht", "KPIs, Ampellogik", "Maßnahmen", "Entwicklung einer Covenant-Strategie zur Risikosteuerung", "Aufbau einer Kapitalbedarfsplanung für Wachstums- und Krisenszenarien", "Strategische Planung der Eigen-/Fremdkapitalquote", "Kapitalmarktfähigkeit und Rating-Vorbereitung", "Finanzierung internationaler Gesellschaften", "Planung und Durchführung von Refinanzierungen"]},
            {"id": "esg_sustainable", "name": "🌱 ESG & Sustainable Finance im Treasury", "keywords": ["Entwicklung einer ESG-Finanzierungsstrategie im Treasury", "ESG-Kriterien in Kreditverträge integrieren und steuern", "Green Bond oder Schuldschein strukturiert vorbereiten", "ESG-Scoring im Treasury einführen und operationalisieren", "Nachhaltigkeitskriterien in Cash- und Bankmanagement verankern", "CSRD-Reporting vorbereiten", "Beitrag des Treasury zur ESG-Berichterstattung", "Entwicklung eines ESG-Treasury-Leitbilds", "Abgleich von ESG-Anforderungen in Kreditverträgen vs. Nachhaltigkeitsstrategie", "Entwicklung eines ESG-Bankenrankings", "Treasury-gestützte CO₂-Reduktionsstrategie über Finanzinstrumente"]},
            {"id": "treasury_operating", "name": "🔧 Treasury Operating Model & ...", "keywords": ["Entwicklung einer Innovationsstrategie für das Treasury", "Planung", "Forecasting für digitale Geschäftsmodelle", "Strategische Planung einer API-fähigen Treasury-Systemarchitektur", "Aufbau einer Treasury-KI-Strategie zur Entscheidungsunterstützung", "Cyber- und IT-Sicherheitsstrategie für Treasury-Systeme", "Erstellung einer digitalen Treasury-Roadmap bis 2030", "Einführung eines Treasury-KPI- und Benchmarksystems", "Aufbau eines Skill- und Rollenmodells für das Treasury der Zukunft", "Einführung eines Process-Mining-Ansatzes zur Analyse von Treasury-Prozessen", "Positionierung des Treasurys als Innovationstreiber im Unternehmen"]}
        ]
    },
    "CFO": {
        "icon": "📈",
        "themes": [
            {"id": "strategie_vision", "name": "🎯 Strategie & Vision", "keywords": ["Finanzielle Vision 2030 formulieren", "verankern", "Zukunftsanalyse", "3 Szenarien für Umsatz, Risiko, Kapitalbedarf", "Werttreiber-Modell des Unternehmens entwickeln", "Strategische Frühindikatoren", "CFO-Kennzahlensystem", "CFO-Radar: Strategiegespräche intelligent vorbereiten", "Portfolio-Readiness: Geschäftsfelder strategisch bewerten", "CFO-Strategiepapier: 3-Jahres-Roadmap für Finance", "Wachstumsarchitektur mit Finanzlogik unterlegen", "Strategie-Kompetenzmodell für das CFO-Team aufbauen", "CFO-Zielbild", "Führungsrolle der Zukunft"]},
            {"id": "global_strategy", "name": "🌍 Global Strategy", "keywords": ["Länderscoring-Modell zur internationalen Expansion", "Break-even-Analyse für internationale Rollouts", "Rollout-Reifegradmodell für internationale Märkte", "Go-to-Market-Modell für internationale Expansion", "KPI-Mastermodell für internationale Expansion", "Expansions-Risikomodell für internationale Märkte", "Insight Asia 2025 - Geopolitisch-strategisch", "Insight India 2025 - Standortbewertung- und Investitionsbewertung", "Wachstumsstrategie systematisch bewerten und steuern", "Use Case - Globale Marktexpansion"]},
            {"id": "ki_entscheidung", "name": "🤖 KI & Entscheidungsintelligenz", "keywords": ["Forecasting mit generativer KI strukturieren", "CFO Control Tower", "Echtzeitsteuerung mit KI-Modellen", "KI-Readiness-Check im CFO-Bereich", "KI-gestützte Investitionsbewertung", "ROI-Prognose", "Prompt-Design für Finanzabteilungen standardisieren", "Use Case-Matrix für KI im CFO-Bereich", "Explainable AI", "CFO-Verständnis", "Regulatorik absichern", "KI im Monats- und Quartalsreporting einbinden", "Zusammenarbeit von CFO", "KI-Produktteam strukturieren", "Entscheidungsarchitektur für CFOs mit KI"]},
            {"id": "transformation_operating", "name": "🔄 Transformation & Operating Model", "keywords": ["Target Operating Model (TOM) CFO-kompatibel ausgestalten", "CFO-Steuerungsmodell für Transformationen entwickeln", "Shared Services Operating Model der nächsten Generation entwickeln", "Rollenveränderung im CFO-Bereich gestalten", "Transformationsprojekte systematisch priorisieren", "Agiles Operating Model im CFO-Bereich entwickeln", "Kostenführungsmodell entwickeln", "ohne Qualitätsverlust", "Transformation Enablement Scorecard entwickeln", "Governance-Struktur für Transformationen entwickeln", "Finance Shared Services der Zukunft entwickeln", "The Leader in ESG Change Management"]},
            {"id": "digitale_transformation", "name": "💻 Digitale Transformation", "keywords": ["Digitale Vision als CFO mitgestalten", "Finanzielle Bewertung strategisch relevanter Digital-Probleme", "Business Case SSC", "Business Case: 4 Validierungsstufen", "Steuerungsmodell für skalierbares digitales Wachstum", "Investitionsstrategie für Tech, Talent", "Kulturaufbau", "Transformation Roadmap erstellen", "Talent Bench aufbauen", "Neues Operating Model adaptieren", "Technologie-Infrastruktur für Innovation aufbauen", "Datenorganisation", "-kultur etablieren", "Adoption", "Skalierung absichern"]},
            {"id": "finance_excellence", "name": "⭐ Finance Excellence & Steuerung", "keywords": ["Finance Operating Model bewerten und weiterentwickeln", "Shared Services vs. dezentrale Steuerung", "Modell bewerten und ausrichten", "Reifegradmodell für den CFO-Bereich entwickeln", "Performance Management System aufbauen", "Steuerungsarchitektur für Business Partnering im Controlling entwickeln", "Planungsprozess auf Effektivität", "Relevanz prüfen", "Effizienzpotenziale im Finanzbereich identifizieren und heben", "Kostenrechnungssysteme auf Aktualität", "Steuerungslogik prüfen", "Governance-", "Kontrollsystem im CFO-Bereich stärken", "Exzellenzinitiative im CFO-Team entwickeln"]},
            {"id": "finanzierung_kapitalstruktur_cfo", "name": "💼 Finanzierung & Kapitalstruktur", "keywords": ["Kapitalstruktur analysieren", "Zielstruktur definieren", "Finanzierungsstrategie kurz- und langfristig entwickeln", "Kreditportfolio", "Bankenstrategie steuern", "Leverage-Ratio", "Zinsdeckungsgrad im Szenario prüfen", "Alternative Finanzierungsquellen bewerten", "Cash Conversion Cycle", "Working Capital gezielt steuern", "Finanzierung von M&A-Transaktionen strukturieren", "Eigenkapitalinstrumente für Wachstumsphasen gestalten", "Zinsmanagement", "Refinanzierungsstrategie aktiv gestalten", "Kapitaldienstfähigkeit im Planungsmodell simulieren"]},
            {"id": "ma_beteiligung", "name": "🤝 M&A & Beteiligungsstrategie", "keywords": ["Ist der geplante Deal strategisch kapitalgerecht", "Freigabeentscheidung für einen M&A-Deal", "Ja oder Nein", "Beteiligungsstrategie auf Gruppenebene entwickeln", "Zielrendite und Wertsteigerungshebel bei Beteiligungen definieren", "Welche Rolle spielt der CFO in M&A-Freigabeprozess", "Werttreiberlogik in Buy-&-Build-Strategien bewerten", "Vorschlag für Divestment oder Carve-Out strategisch bewerten", "Post-Merger-Zielsteuerung aus CFO-Sicht definieren", "Beteiligung in der Krise", "Sanierungsentscheidung treffen", "Szenariobasierte Bewertung der M&A-Finanzierung", "Kapitalbindung"]},
            {"id": "strategisches_kostenmanagement", "name": "📊 Strategisches Kostenmanagement", "keywords": ["Strategische Prinzipien für ein gruppenweites Effizienzprogramm", "Versteckte Kosten- und Komplexitätstreiber identifizieren", "Zero-Based Budgeting (ZBB) intelligent umsetzen", "ohne operative Lähmung", "KPI-Logik für Cost-Reduction-Initiativen aufsetzen", "Kostensenkung bewerten: Wirkung, Nachhaltigkeit, Nebenwirkung", "Target Operating Model (TOM) auf Kostenlogik prüfen", "Kostenbewusstsein in den Business Units verankern", "ohne Micromanagement", "Cost Transformation Program aufsetzen", "Struktur, Rollen, KPI", "Synergieziele aus M&A in der GuV verankern", "nachhalten", "Capex-Einsparungen entscheidungsfähig aufbereiten"]},
            {"id": "capital_allocation", "name": "💡 Capital Allocation & Investment Logic", "keywords": ["Capital Allocation Strategy entwickeln", "Wachstum, Risiko und Rendite balancieren", "Investitionsprojekte vergleichbar bewerten und priorisieren", "CFO-Freigabe im Investment Committee definieren", "Cash-zu-Wachstum-Logik optimieren", "Capex, M&A, Dividende, Buybacks", "Innovations-", "Technologieinvestitionen bewerten", "aus CFO-Perspektive", "Scoring-Modell für Investitionsentscheidungen entwickeln", "Kapitalallokation über Regionen", "Business Units steuern", "Capital Turnover", "Asset Efficiency steuern", "Wirkung auf RoCE", "Wertschöpfung verstehen", "Post-Investment Review aufsetzen", "Wirkung und Lernprozesse sicherstellen", "Investment Governance verankern", "Entscheidungsrahmen und Reifegrad sichern"]},
            {"id": "geopolitische_resilienz", "name": "🌍 Geopolitische Resilienz & ...", "keywords": ["Integriertes Enterprise Risk Management (ERM)", "Risikosteuerung im Forecast-", "Planungsprozess verankern", "Cyber-Risiken finanziell bewerten und CFO-wirksam steuern", "Technologische Abhängigkeit", "Legacy-Risiken bewerten", "Regulatorische ESG-Risiken systematisch identifizieren", "finanziell bewerten", "Reputationsrisiken frühzeitig identifizieren", "absichern", "ESG-Risikobewertung in Investitionsentscheidungen verankern", "Standortrisiken", "Handelsabhängigkeiten systematisch bewerten", "Geopolitische Szenarien in der Finanzplanung berücksichtigen", "Sanktions-", "Exportkontrollrisiken strategisch absichern", "Zinsrisiken erkennen, bewerten", "strategisch steuern"]}
        ]
    },
    "M&A": {
        "icon": "🤝",
        "themes": [
            {"id": "prozesse_rollen", "name": "⚙️ M&A Prozesse & Rollen", "keywords": ["M&A Prozessüberblick für die Sell-Side", "M&A Prozessüberblick für die Buy-Side", "Bieterverfahren vs. Exklusivprozess", "Sell-Side Perspektive", "Bieterverfahren vs. Exklusivprozess", "Buy-Side Perspektive", "Erstellung einer M&A Stakeholder Map", "Erstellung einer typischen M&A-Transaktionstimeline", "Übersicht der Beraterrollen im M&A-Prozess", "Maßnahmen zur Transaktionsvorbereitung", "Sell-Side"]},
            {"id": "gestaltungsformen", "name": "📋 Gestaltungsformen und ...", "keywords": ["Share Deal Überblick", "Asset Deal Überblick", "Kombinationsmodelle: Share Deal + Asset Deal", "Carve-Outs", "Internationale M&A-Transaktionen", "Cross-Border Deals", "Strategische Investoren vs. Finanzinvestoren", "Unterschiede und Auswirkungen", "Public M&A vs. Private M&A", "Unterschiede, Ablauf und Besonderheiten", "Besondere Transaktionsformen: MBO, MBI, Joint Venture, Merger"]},
            {"id": "pre_deal", "name": "🎯 Pre-Deal Phase", "keywords": ["Durchführung einer professionellen Marktanalyse", "Erstellung einer Target-Liste und Target Screening", "Deal Sourcing: Strategien und Kanäle für die Identifikation von Targets", "Bieterverfahren vs. Exklusivprozess", "Buy-Side Perspektive", "Erstansprache potenzieller Targets", "Erstellung eines Teasers und Information Memorandum", "Erstellung eines NDA", "Non-Disclosure Agreement", "Erstellung eines Letter of Intent", "LOI", "Maßnahmen zur Transaktionsvorbereitung", "Sell-Side"]},
            {"id": "strategic_dd", "name": "🔍 Strategic FIT Due Diligence", "keywords": ["Notwendigkeit einer Strategic Due Diligence", "Inhalte einer Strategic Due Diligence", "Ablauf einer Strategic Due Diligence", "Ermittlung und Quantifizierung von Synergiepotenzialen", "Advanced Prompt", "Synergie Scoring Modell / Business Model Canvas für Strategic Due Diligence"]},
            {"id": "commercial_dd", "name": "💼 Commercial FIT Due Diligence", "keywords": ["Grundlagen", "Zielsetzung der Commercial DD", "Markt- und Branchenanalyse", "Kunden- und Wettbewerbsanalyse", "Geschäftsmodellanalyse", "Positionierung", "Validierung der Business-Planung", "Risikoanalyse", "Verknüpfung der CDD mit der Unternehmensbewertung"]},
            {"id": "financial_dd", "name": "💰 Financial Due Diligence", "keywords": ["Erstellung einer vollständigen Financial Due Diligence Checkliste", "Durchführung einer Quality of Earnings", "QoE", "Analyse", "Normalisierung von Erträgen und Aufwendungen", "Durchführung einer Working Capital Analyse", "Durchführung einer Net Debt Analyse", "Analyse und Plausibilisierung des Business Plans", "Red Flag Analyse", "Aufbau eines vollständigen Financial Due Diligence Reports", "Case-Prompt: Quality of Earnings Analyse mit konkreten Zahlen"]},
            {"id": "tax_dd", "name": "📊 Tax Due Diligence", "keywords": ["Erstellung einer vollständigen Tax Due Diligence Checkliste", "Identifikation typischer steuerlicher Risiken", "Red Flags", "Körperschaftsteuer Due Diligence", "Gewerbesteuer Due Diligence", "Umsatzsteuer Due Diligence", "Lohnsteuer Due Diligence", "Tax Compliance", "Betriebsprüfungsrisiken", "Internationale Steuerfragen in der Tax Due Diligence", "Steuerliche Themen im SPA"]},
            {"id": "legal_dd", "name": "⚖️ Legal Due Diligence", "keywords": ["Erstellung einer vollständigen Legal Due Diligence Checkliste", "Gesellschaftsrechtliche Prüfung", "Prüfung gewerblicher Schutzrechte", "Miet-, Pacht- und Leasingverträge", "Vertrags- und Vertriebsrecht", "Arbeitsrechtliche Due Diligence", "Compliance, Litigation", "behördliche Verfahren", "Change-of-Control-Klauseln", "M&A-relevante Vertragsregelungen", "Red Flag Analyse", "Advanced Prompt", "Software-", "Quellcode-Eigentumsanalyse", "Advanced Prompt", "Open Source", "Compliance"]},
            {"id": "bewertung", "name": "📈 Unternehmensbewertung", "keywords": ["Unternehmensbewertung nach IDW S1", "Plausibilisierung der Planungsrechnung", "Unternehmensbewertung mittels DCF-Verfahren", "Durchführung einer Quality of Earnings", "QoE", "Analyse", "Durchführung einer Working Capital Analyse", "Durchführung einer Net Debt Analyse", "Analyse und Plausibilisierung des Business Plans", "Red Flag Analyse", "Bewertungsfallen", "Aufbau eines vollständigen Financial Due Diligence Reports", "Case prompt", "Sensitivitätsanalyse zur Unternehmensbewertung", "Case prompt", "Unternehmensbewertung", "DCF-Entity Approach"]},
            {"id": "kaufvertrag", "name": "📄 Kaufvertragsgestaltung", "keywords": ["Erstellung eines vollständigen SPA-Grundgerüsts", "Kaufpreisgestaltung im SPA", "Garantien", "Freistellungen", "Warranties", "Indemnities", "Covenants", "Pre-Closing-Verpflichtungen", "Closing Conditions", "Vollzugsbedingungen im SPA", "Haftungsregelungen im SPA", "Haftungshöhe, Dauer, Cap, Basket", "Streitbeilegung", "Gerichtsstand", "Schiedsgericht, ordentliche Gerichtsbarkeit, Rechtswahl", "Strukturierung einer W&I Insurance im M&A-Prozess"]},
            {"id": "pmi", "name": "🔄 Post-Merger-Integration", "keywords": ["Grundlagen und Zielsetzung", "PMI", "PMI-Planung und Governance", "Entwicklung der Integrationsstrategie", "Synergieplanung und Synergietracking", "Kommunikationsstrategie", "intern", "extern", "Integration der Organisation", "HR, Kultur, Change-Management", "Operative Integration", "Prozesse, IT, Controlling, Einkauf, Vertrieb", "Advanced M&A Controlling", "Monitoring inkl. Synergietracking, KPI-System", "Risiko-Reporting", "Lessons Learned", "Optimierung nach der PMI"]},
            {"id": "finanzierung_ma", "name": "💵 Finanzierung", "keywords": ["Strukturierung der Akquisitionsfinanzierung", "Debt / Equity", "Bestimmung der optimalen Eigenkapitalquote und Leverage im M&A-Deal", "Strukturierung von Senior Debt, Mezzanine und Equity im Rahmen der Akquisitionsfinanzierung", "Covenants und Finanzierungsbedingungen im M&A-Deal", "Planung der Schuldendienstfähigkeit und Cashflow-Sicherheit", "Simulation von Leverage-Effekten inkl. Eigenkapitalrendite und Value Creation", "Bankprozess", "Debt Advisory", "Banken, Unterlagen, Verhandlungen", "Vertragswerke im Finanzierungsprozess", "Term Sheet, Kreditvertrag, Intercreditor Agreement", "Besonderheiten bei Private Equity, Leveraged Buy-Outs", "LBO", "Management Buy-Outs", "MBO", "Integration der Debt-Finanzierung in SPA und Unternehmensbewertung", "Post-Deal-Finanzierung und Refinanzierung", "Working Capital Facilities, Umschuldung, Optimierung"]},
            {"id": "distressed", "name": "🆘 Distressed M&A", "keywords": ["Besonderheiten und Grundzüge von Distressed M&A", "Ablauf einer typischen Distressed M&A Transaktion", "Prüfung der insolvenzrechtlichen Situation", "Kaufgegenstand", "Deal-Struktur", "Erstellung einer M&A Stakeholder Map", "Digital Due Diligence in der Krise", "Schutzmechanismen im Kaufvertrag bei Distressed M&A", "Kaufpreisfindung und Earn-Outs im Distressed M&A", "Finanzierung von Distressed M&A-Transaktionen", "Stakeholder-Management im Distressed M&A", "Arbeitsrecht und Personal im Distressed M&A", "Betriebsübergang, § 613a BGB, Sozialplan", "Post-Deal-Phase im Distressed M&A"]},
            {"id": "vc_growth", "name": "🚀 Venture Capital & Growth Equity", "keywords": ["Grundlagen", "Besonderheiten von VC- und Growth Equity-Transaktionen", "Deal-Strukturen im VC", "Growth Equity", "Unternehmensbewertung in VC", "Due Diligence im VC-Umfeld", "Financial, Legal, IP, Commercial", "Term Sheet in VC-Deals", "Cap Table Management", "Verwässerung", "vor und nach der Finanzierungsrunde", "Gesellschaftervereinbarung", "Investor Rights Agreement", "Exit-Szenarien und Beteiligungscontrolling", "IPO, Trade Sale, Secondary", "Growth Equity Besonderheiten", "Praxisfall: Investment in ein SaaS-Start-up"]},
            {"id": "verhandlung", "name": "🤝 Verhandlungsführung & Deal Tactics", "keywords": ["Verhandlungsvorbereitung", "Zieldefinition, BATNA, Verhandlungsstrategie", "Integrative vs. Distributive Verhandlungsansätze wie z.B. Win-Win vs. Harvard-Konzept angewendet", "Verhandlungstaktiken", "Typische Verhaltensweisen von Käufer und Verkäufer", "Priorisierung der Verhandlungsgegenstände", "inkl. Konfliktintensitätsmatrix", "Nutzung von Verhandlungsmacht, Deal Timing und taktischen Deadlines", "Kommunikations- und Verhandlungstechniken", "Signale, Sprache, Körpersprache", "Buy-Side Verhandlungstaktik", "Optimale Vorbereitung und Umsetzung", "Sell-Side Verhandlungstaktik", "Deal Protection und Kaufpreismaximierung", "Umgang mit schwierigen Verhandlungen und Deadlocks", "Negotiation Playbook", "Checklisten, Templates", "Deal Scoring"]}
        ]
    },
    "Bilanzbuchhalter": {
        "icon": "📚",
        "themes": [
            {"id": "zwecke_grundsaetze", "name": "📋 Zwecke und Grundsätze der ...", "keywords": ["Zwecke des Jahresabschlusses", "Grundsatz der Richtigkeit", "Grundsatz der Vergleichbarkeit", "Grundsatz der Klarheit", "Grundsatz der Vollständigkeit", "Bilanzstichtagsprinzip", "Werterhellend vs. Wertbegründet", "Periodisierungsprinzip", "Realisationsprinzip", "Imparitätsprinzip", "Vorsichtsprinzip"]},
            {"id": "allgemeine_ansatz", "name": "⚖️ Allgemeine Ansatzregeln", "keywords": ["Kalkulationssimulation", "Was passiert bei Preis-, Kosten- oder Mengenänderungen", "Aktivierungsfähigkeit nach HGB", "abstrakt", "konkret", "Aktivierungsverbot nach § 248 Abs. 2 HGB", "Aktivierungswahlrechte", "Entwicklungskosten und Disagio", "Aktivierungsgebote bei Nicht-Vermögensgegenständen", "z.B. RAP", "Disagio", "Zurechnung von Vermögensgegenständen", "wirtschaftliches vs. rechtliches Eigentum", "Passivierungsfähigkeit", "Drei Kriterien für Schulden", "Abgrenzung: Rückstellung oder Eventualverbindlichkeit", "Ansatzgrundsätze in der Steuerbilanz", "Maßgeblichkeitsprinzip", "Abweichungen zum HGB", "Ansatzvorschriften nach IFRS", "Unterschiede zu HGB und ESTG systematisch darstellen"]},
            {"id": "allgemeine_bewertung", "name": "💰 Allgemeine Bewertungsregeln", "keywords": ["Grundprinzipien der Bewertung", "Überblick", "GoB-Anbindung", "Zugangsbewertung von Vermögensgegenständen", "Anschaffung, Herstellung, Bewertung", "Folgebewertung", "Niederstwertprinzip und Zuschreibungspflicht", "Bewertung von Schulden", "Erfüllungsbetrag und Rückstellungen", "Bewertungsvereinfachungsverfahren", "FIFO, LIFO, Durchschnittsmethode", "Bewertungseinheiten und Sicherungsbeziehungen", "§ 254 HGB richtig anwenden", "Währungsumrechnung bei Bilanzansatz", "§ 256a HGB richtig anwenden", "IFRS-Bewertungskonzepte im Vergleich", "Fair Value vs. Anschaffungs-/Herstellungskosten", "Wertaufhellung vs. Wertbegründung", "Bilanzstichtagsprinzip richtig anwenden", "Bewertungsmaßstäbe in der Steuerbilanz", "Unterschiede", "Einschränkungen nach ESTG"]},
            {"id": "anlagevermoegen", "name": "🏭 Bilanzierung des Anlagevermögens", "keywords": ["Aktivierung von Sachanlagen", "Anschaffungsnebenkosten", "nachträgliche AK", "richtig erfassen", "Nachträgliche Anschaffungskosten", "Erweiterungen und Erneuerungen an Anlagen", "Abgrenzung aktivierungspflichtiger, -fähiger und -verbotener Posten", "Aktivierung selbst erstellter immaterieller Vermögenswerte bei teilweise Fremdvergabe", "z.B. Software", "Abgrenzung Anlagevermögen vs. Umlaufvermögen", "Zurechnung von Vermögensgegenständen", "Bilanzierung von Finanzanlagen", "Herstellungskosten", "§ 255 Abs. 2 und 3 HGB", "Abgrenzung", "Zurechnung von Wirtschaftsgütern bei abweichender zivilrechtlicher und wirtschaftlicher Zugehörigkeit", "HGB, IFRS, ESTG", "Bewertung börsennotierter Wertpapiere", "Umlaufvermögen, HGB", "Bilanzierung nicht börsennotierter Beteiligungen", "Finanzanlagevermögen, HGB", "Zuschreibungen bei Wertaufholung", "§ 253 Abs. 5 HGB", "Abgrenzung derivativer Finanzinstrumente", "z.B. Optionen, Swaps, Futures", "Hedging", "Bewertung von Sicherungsgeschäften nach HGB", "Verkauf und Ausbuchung von Finanzinstrumenten", "HGB", "Bilanzierung von Finanzinstrumenten bei Kreditinstituten", "RechKredV", "Vergleich HGB vs. IFRS bei der Bilanzierung von Finanzinstrumenten", "Vergleich HGB vs. US GAAP bei der Bilanzierung von Finanzinstrumenten"]},
            {"id": "vorratsvermoegen", "name": "📦 Bilanzierung des Vorratsvermögens", "keywords": ["Definition", "Abgrenzung: Was gehört zum Vorratsvermögen", "Zugangsbewertung von Vorräten gemäß § 255 Abs. 1 und Abs. 2 HGB", "Folgebewertung von Vorräten nach dem Niederstwertprinzip", "§ 253 Abs. 4 HGB", "Bewertungsvereinfachungsverfahren bei Vorräten", "Teilwertabschreibung bei Vorräten", "steuerliche Bewertung bei dauerhafter Wertminderung", "Bewertung von Roh-, Hilfs- und Betriebsstoffen", "Zugangs- und Stichtagsbewertung nach HGB", "Bewertung unfertiger Erzeugnisse", "Herstellungskosten, Teilwert und Bilanzierungswahlrechte", "Bewertung fertiger Erzeugnisse", "Niederstwertprinzip, Marktpreis und Teilwert", "Bewertung von Handelswaren", "Strenges Niederstwertprinzip und Teilwertprüfung", "Bewertung des Vorratsvermögens nach IFRS", "Bewertung des Vorratsvermögens nach US GAAP"]},
            {"id": "forderungen", "name": "📄 Bilanzierung der Forderungen", "keywords": ["Bilanzierung von Forderungen aus Lieferungen und Leistungen nach HGB und ESTG", "Zweifelhafte Forderungen: Teilwertabschreibung und Pauschalwertberichtigung", "Pauschalwertberichtigung auf Forderungen nach HGB und ESTG", "Bilanzierung uneinbringlicher Forderungen", "Vollwertabschreibung", "Pauschalwertberichtigung auf Forderungen", "Einzel-", "Gruppenrisiken", "Umsatzsteuerliche Korrekturen bei uneinbringlichen Forderungen", "§17 UStG", "Ausweis", "Erläuterungspflichten zu Verbindlichkeiten", "§ 266", "§ 285 HGB", "Bilanzierung von Forderungen nach IFRS", "Klassifikation, Bewertung", "Ausweis", "Verbindlichkeiten nach US GAAP", "Klassifikation, Bewertung", "Debt Modification", "Verbindlichkeiten im Vergleich", "HGB, IFRS", "US GAAP gegenüberstellen", "bewerten"]},
            {"id": "finanzinstrumente", "name": "💼 Bilanzierungen von Finanzinstrumenten", "keywords": ["Klassifizierung von Finanzinstrumenten", "HGB", "Bewertung börsennotierter Wertpapiere", "Umlaufvermögen, HGB", "Bilanzierung nicht börsennotierter Beteiligungen", "Finanzanlagevermögen, HGB", "Zuschreibungen bei Wertaufholung", "§ 253 Abs. 5 HGB", "Abgrenzung derivativer Finanzinstrumente", "z.B. Optionen, Swaps, Futures", "Hedging", "Bewertung von Sicherungsgeschäften nach HGB", "Verkauf und Ausbuchung von Finanzinstrumenten", "HGB", "Bilanzierung von Finanzinstrumenten bei Kreditinstituten", "RechKredV", "Vergleich HGB vs. IFRS bei der Bilanzierung von Finanzinstrumenten", "Vergleich HGB vs. US GAAP bei der Bilanzierung von Finanzinstrumenten"]},
            {"id": "eigenkapital", "name": "💎 Bilanzierung des Eigenkapitals", "keywords": ["Funktion, Gliederung und Bedeutung des Eigenkapitals nach HGB", "Bilanzierung des gezeichneten Kapitals", "Zugang, Bewertung, Handelsregistereintrag", "Ausstehende Einlagen auf das gezeichnete Kapital nach § 272 Abs. 1 HGB", "Kapitalerhöhung", "Bilanzierung des gezeichneten Kapitals und der Kapitalrücklage", "Kapitalherabsetzung", "Bilanzielle Behandlung und Ausweis", "Kapitalzuschuss nach § 272 Abs. 2 HGB", "Bilanzierung, Arten und Ausweis", "Gewinnrücklagen nach § 272 Abs. 3-5 HGB", "Bildung, Ausweis", "Gewinn-/Verlustvortrag", "Bilanzierung und Ausweis in Jahresabschluss", "Jahresüberschuss / Jahresfehlbetrag", "Ausweis, Verrechnung und Dokumentation", "Sonder-", "Ergänzungskapitalkonten bei Personengesellschaften", "Bilanzierung", "Ausweis", "Inkongruente Gewinnausschüttung", "Steuerlich zulässige Gestaltung und Bilanzwirkung", "Disquotalen Einzahlung in die Kapitalrücklage bei GmbHs"]},
            {"id": "verbindlichkeiten", "name": "🔗 Bilanzierung von Verbindlichkeiten", "keywords": ["Begriff und Arten von Verbindlichkeiten", "Abgrenzung, Systematik", "Ausweis", "Ansatz und Bewertung von Verbindlichkeiten", "Grundsätze nach § 253 HGB", "Verbindlichkeiten mit Differenz zwischen Auszahlung und Rückzahlung", "Abzinsung, Disagio", "Unverzinsliche Verbindlichkeiten aus Rentenverpflichtungen", "Barwert, Laufzeit", "Bewertung", "Verbindlichkeiten mit Skonto", "Bewertung zum Erfüllungsbetrag", "Behandlung von Skonto", "Fremdwährungsverbindlichkeiten", "Zugang, Umrechnung", "Bewertung nach § 256a HGB", "Ausweis", "Erläuterungspflichten zu Verbindlichkeiten", "§ 266", "§ 285 HGB", "Bilanzierung von Verbindlichkeiten nach IFRS", "Klassifikation, Bewertung", "Ausweis", "Verbindlichkeiten nach US GAAP", "Klassifikation, Bewertung", "Debt Modification", "Verbindlichkeiten im Vergleich", "HGB, IFRS", "US GAAP gegenüberstellen", "bewerten"]},
            {"id": "rueckstellungen", "name": "📊 Bilanzierung der Rückstellungen", "keywords": ["Rückstellungen", "Begriff, Zweck", "Abgrenzung zu Verbindlichkeiten", "§ 249 HGB", "Rückstellungen in der Steuerbilanz", "Maßgeblichkeit", "Rückstellungsverbot", "§ 5 Abs. 1 und 4 AO", "Rückstellungen für ungewisse Verbindlichkeiten", "Ansatz, Nachweis", "Dokumentation", "Rückstellungen für unterlassene Instandhaltung und Abraumbeseitigung", "Rückstellungen für Gewährleistungen ohne rechtliche Verpflichtungen und Kulanz", "Rückstellungen für Steuern", "Bewertung von Rückstellungen", "Erfüllungsbetrag, Abzinsung und Erfahrungswerte", "§ 253", "Bilanzierung von Drohverlustrückstellungen bei schwebenden Geschäften", "Rückstellungen für Pensionen und ähnliche Verpflichtungen", "Rückstellungen für Altersversorgungsverpflichtungen", "BilMoG-Regeln", "Abzinsung", "Anhangangaben zu Rückstellungen gemäß § 285 Nr. 12 HGB", "Rückstellungen nach IFRS", "IAS 37", "Ansatz, Bewertung, Unterschiede zum HGB", "Rückstellungen nach US GAAP", "ASC 450", "Contingencies", "Probabilities", "Vergleich Rückstellungen HGB", "IFRS", "US GAAP", "Ansatz, Bewertung, Offenlegung", "Rückstellungen für Dienstjubiläen"]},
            {"id": "besondere_posten", "name": "📌 Besondere Bilanzposten", "keywords": ["Begriff", "Funktion von Rechnungsabgrenzungsposten", "§ 250 HGB", "Active Rechnungsabgrenzungsposten", "Voraussetzungen, Abgrenzung, Beispiele", "Passive Rechnungsabgrenzungsposten", "Voraussetzungen, Besonderheiten bei Anzahlungen", "Abgrenzung RAP zu Verbindlichkeiten", "Rückstellungen", "Latente Steuern", "Grundlagen", "gesetzliche Vorgaben", "§ 274 HGB, IFRS", "Active latente Steuern", "Ansatz, Bewertung, Verlustvorträge", "Passive latente Steuern", "Entstehung, Abgrenzung, Beispiel", "Latente Steuern im IFRS-Abschluss", "IAS 12", "Angabe-", "Ausweisvorschriften zu latenten Steuern", "§ 274 HGB, IFRS", "Eventualverbindlichkeiten", "Haftungsverhältnisse", "§ 251 HGB", "Bürgschaften, Patronatserklärungen, Sicherheiten", "Bilanzierung und Offenlegung", "Angabepflichten bei nicht bilanzierungsfähigen Verpflichtungen", "Vergleich", "Bilanzierung und Angabe besonderer Posten nach HGB, IFRS und US GAAP"]},
            {"id": "guv", "name": "📈 Gewinn- und Verlustrechnung", "keywords": ["Aufbau, Gliederung und Bedeutung der GuV nach § 275 HGB", "Gliederung der Gesamtkosten- und Umsatzkostenverfahren", "Wahlrecht, Aufbau und Unterschiede", "Umsatzerlöse nach § 277 Abs. 1 HGB und IFRS 15", "Abgrenzung, Bewertung, zeitliche Zuordnung", "Bestandsveränderungen und aktivierte Eigenleistungen", "§ 275 Abs. 2 Nr. 2-3 HGB", "Sonstige betriebliche Erträge", "Aufwendungen", "Personalaufwand", "§ 275 Abs. 2 Nr. 6 HGB", "Abschreibungen auf immaterielle Vermögensgegenstände und Sachanlagen", "§ 275 Abs. 2", "Erträge und Aufwendungen aus Beteiligungen, Wertpapieren und Finanzinstrumenten", "Zinserträge und Zinsaufwendungen", "handelsrechtlicher Ausweis und IFRS-Abgrenzung", "§ 275", "Ergebnis aus Währungsumrechnung und Kurssicherung", "GuV-Ausweis und Bewertung nach HGB", "Außerordentliche Erträge", "Aufwendungen", "handelsrechtliche Bedeutung und praktische Anwendung", "Jahresüberschuss und Bilanzgewinn", "Ableitung, Einflussgrößen und Gestaltungsspielräume", "Ergebnisverwendung im Einzelabschluss vs. Konzernabschluss", "handelsrechtliche Unterschiede"]},
            {"id": "anhang", "name": "📝 Anhang", "keywords": ["Zweck, Funktion und Struktur des Anhangs", "§§ 284–285 HGB", "Bilanzierungs- und Bewertungsmethoden im Anhang", "§ 284 Abs. 2 HGB", "Anhangangaben zu Rückstellungen gemäß § 285 Nr. 12 HGB", "Verbindlichkeiten, Sicherheiten und Restlaufzeiten im Anhang", "§ 285 Nr. 1-3 HGB", "Anhangangaben zu Anteilseignern, Beteiligungen und Organen", "§ 285 Nr. 10-11a HGB", "Angaben zur Ergebnisverwendung und Ausschüttung im Anhang", "§ 285 Nr. 13 HGB, § 158", "Freiwillige Angaben", "Best Practices im Anhang", "z.B. ESG, Kennzahlen, Risikoangaben", "Größenabhängige Erleichterungen", "Wegfasslisten nach § 288 HGB", "Haftungsverhältnisse", "Eventualverbindlichkeiten", "§ 251 HGB", "§ 285 Nr. 3 HGB", "Nachtragsberichterstattung", "Ereignisse nach dem Bilanzstichtag", "§ 285 Abs. 33 HGB", "Angaben zu Beteiligungen", "Tochterunternehmen", "§ 285 Nr. 11", "§ 313 HGB", "Exklusiv: Vollständiger Anhang"]},
            {"id": "lagebericht", "name": "📄 Lagebericht", "keywords": ["Grundlagen des Lageberichts: Funktionen, Zielsetzung", "gesetzliche Grundlagen", "§ 289", "Inhalt des Lageberichts: Pflichtbestandteile nach § 289 Abs. 1 HGB", "Forschungs- und Entwicklungsaktivitäten im Lagebericht", "§ 289 Abs. 2 Nr. 1 HGB", "Darstellung des Geschäftsverlaufs im Lagebericht", "§ 289 Abs. 1 HGB", "Prognose-, Chancen- und Risikobericht", "§ 289 Abs. 1 S. 4 HGB", "inkl. Ausblick", "Risikomanagementsystem", "IKS im Lagebericht", "§ 289 Abs. 4 HGB", "für kapitalmarktorientierte Unternehmen", "Darstellung der Vermögens-, Finanz- und Ertragslage", "VFE-Lage", "Darstellung der Ertragslage im Lagebericht gemäß § 289 HGB und DRS 20", "Nachtragsbericht im Lagebericht", "Ereignisse nach dem Bilanzstichtag", "§ 285 Nr. 33 HGB", "Finanzielle Leistungsindikatoren im Lagebericht", "§ 289 Abs. 1 S. 4 HGB", "Nichtfinanzielle Leistungsindikatoren im Lagebericht", "§ 289 Abs. 3 HGB", "Erklärung zur Unternehmensführung", "§ 289f HGB", "Gesamtbild und Vollständigkeitserklärung im Lagebericht"]},
            {"id": "kapitalflussrechnung", "name": "💵 Kapitalflussrechnung", "keywords": ["Zweck und Rechtsgrundlagen der Kapitalflussrechnung nach HGB", "§§ 264, 297 HGB", "und IFRS", "Grundstruktur und Gliederung der Kapitalflussrechnung nach DRS 21 und IAS 7", "Cashflow aus laufender Geschäftstätigkeit", "Cashflow aus Investitionstätigkeit", "Cashflow aus Finanzierungstätigkeit", "Ableitung der Kapitalflussrechnung aus Bilanz und GuV", "Definition", "Abgrenzung Finanzmittelfonds", "Kapitalflussrechnung im Konzern", "Kapitalflussrechnung nach IFRS", "IAS 7", "Pflichten, Gliederung, Vergleich zu HGB/DRS", "Sonderfragen in der Kapitalflussrechnung", "Leasing, Factoring, Sale-and-Lease-Back", "Prüfung und Plausibilisierung der Kapitalflussrechnung", "Erstellung einer vollständigen Kapitalflussrechnung durch die KI", "Prompt zur automatisierten Aufstellung"]},
        ]
    },
    "Business Developer": {
        "icon": "🚀",
        "themes": [
            {"id": "executive_summary", "name": "📋 Executive Summary", "keywords": ["Zielbild", "Alleinstellungsmerkmal klar kommunizieren", "Geschäftsmodell", "Monetarisierung verständlich darstelle", "Marktpotenzial und Timing überzeugend formulieren", "Vision", "Langfriststrategie inspirierend formulieren", "Relevante Kennzahlen klar", "überzeugend darstellen", "Zielgruppe und Kundennutzen prägnant beschreiben", "Teamkompetenz", "Gründerprofil wirkungsvoll darstellen", "Herausforderung", "Lösung als Story formulieren", "Nutzenversprechen in einem starken Einstiegssatz formulieren", "Elevator Pitch für mündliche Vorstellung generieren", "Executive Summary für ein Bauunternehmen mit Wachstumsvorhaben"]},
            {"id": "unternehmensbeschreibung", "name": "🏢 Unternehmensbeschreibung", "keywords": ["Gründungsidee", "Entstehungsgeschichte überzeugend darstellen", "Geschäftszweck", "Zielsetzung klar formulieren", "Rechtsformwahl", "Gründungsstruktur verständlich erklären", "USP", "Alleinstellungsmerkmal professionell herausarbeiten", "Standortwahl", "regionale Positionierung fundiert begründen", "Unternehmensstruktur", "Rollenverteilung übersichtlich darstellen", "Entwicklung seit Gründung", "wichtige Meilensteine darstellen", "Vision, Leitbild", "langfristige Ausrichtung klar formulieren", "Brancheneinordnung", "Marktumfeld realistisch beschreiben", "Zielgruppen", "Kundensegmente systematisch beschreiben", "Unternehmensprofil für ein wachsendes Bauunternehmen prägnant beschreiben"]},
            {"id": "produkte_leistungen", "name": "📦 Produkte & Leistungen", "keywords": ["Angebot klar und verständlich beschreiben", "Leistungsumfang", "Abgrenzung zu anderen Anbietern darstellen", "Leistungstiefe", "Wertschöpfung verständlich erläutern", "Angebot modular oder als Paketstruktur darstellen", "Besonderheiten", "Spezialisierungen wirkungsvoll darstellen", "Preislogik", "Angebotskalkulation transparent erklären", "Materialeinsatz", "Qualitätsanspruch überzeugend darstellen", "Serviceleistungen", "After-Sales-Angebote professionell beschreiben", "Innovationsgrad", "Entwicklungspotenzial des Angebots darstellen", "Referenzprojekte oder Musteranwendungen professionell darstellen", "Bauunternehmen: Leistungsprofil der zwei Brüder systematisch beschreiben"]},
            {"id": "markt_wettbewerb", "name": "🎯 Markt & Wettbewerb", "keywords": ["Marktanalyse: Größe, Struktur", "Trends klar darstellen", "Zielregion", "regionale Besonderheiten nachvollziehbar beschreiben", "Wettbewerbsanalyse", "eigene Positionierung professionell darstellen", "Zielgruppenspezifisches Marktpotenzial realistisch einschätzen", "Marktbedürfnisse", "Kundenverhalten gezielt analysieren", "Eintrittsbarrieren", "Marktzugang realistisch einschätzen", "Wettbewerbsvorteile", "Alleinstellungsmerkmale gezielt herausarbeiten", "SWOT-Analyse: Stärken, Schwächen, Chancen", "Risiken systematisch darstellen", "Marktstrategie: Wie du den Markt systematisch bearbeitest", "Referenzprojekte oder Musteranwendungen professionell darstellen", "Bauunternehmen: Markt", "Wettbewerbslage der zwei Brüder professionell darstellen"]},
            {"id": "marketing_vertrieb", "name": "📢 Marketing & Vertrieb", "keywords": ["Marketingstrategie gezielt formulieren", "Online-", "Offline-Marketing konkret planen", "Vertriebswege", "Angebotsprozess klar darstellen", "Preisstrategie", "Argumentation überzeugend darstellen", "Sichtbarkeit", "Bekanntheit gezielt steigern", "Kundenreaktionen", "Empfehlungsquote gezielt analysieren", "Kooperationen", "Multiplikatoren im Vertrieb gezielt nutzen", "Vertrieb mit kleinem Team oder wenig Zeit effizient gestalten", "Vertriebsstärken", "persönliche Wirkung bewusst einsetzen", "Vertriebsausblick", "Skalierungspotenzial realistisch beschreiben", "Bauunternehmen: Marketing-", "Vertriebsstrategie der zwei Brüder überzeugend darstellen"]},
            {"id": "geschaeftsmodell", "name": "🏗️ Geschäftsmodell & Organisation", "keywords": ["Geschäftsmodell kompakt beschreiben", "Was", "Für wen", "Wie", "Warum es funktioniert", "Online-", "Offline-Marketing konkret planen", "Vertriebswege", "Angebotsprozess klar darstellen", "Preisstrategie", "Argumentation überzeugend darstellen", "Sichtbarkeit", "Bekanntheit gezielt steigern", "Kundenreaktionen", "Empfehlungsquote gezielt analysieren", "Kooperationen", "Multiplikatoren im Vertrieb gezielt nutzen", "Vertrieb mit kleinem Team oder wenig Zeit effizient gestalten", "Vertriebsstärken", "persönliche Wirkung bewusst einsetzen", "Vertriebsausblick", "Skalierungspotenzial realistisch beschreiben", "Bauunternehmen: Marketing-", "Vertriebsstrategie der zwei Brüder überzeugend darstellen"]},
            {"id": "finanzierung_foerderung", "name": "💰 Finanzierung & Förderung", "keywords": ["Kapitalbedarf realistisch und strukturiert ermitteln", "Finanzierungsmix", "Mittelherkunft verständlich darstellen", "Investitionsplanung sinnvoll", "stufenweise darstellen", "Betriebsmittelbedarf", "Anlaufkosten realistisch kalkulieren", "Fördermittel gezielt einsetzen", "überzeugend begründen", "Rückzahlungsfähigkeit", "Kapitaldienst nachvollziehbar erklären", "Mittelverwendung transparent und bankfähig erklären", "Finanzierung bei Teilzeit- oder Nebenerwerbs­gründung realistisch darstellen", "Finanzierung bei Unternehmens­übernahme, Beteiligung oder Management-Buy-out", "MBO", "Finanzierungssicherheit", "Rücklagenstrategie überzeugend darstellen", "Bauunternehmen: Kapitalbedarf realistisch ermitteln", "für Zwei-Brüder-Team im Garten-", "Tiefbau"]},
            {"id": "finanzplanung_wirtschaftlichkeit", "name": "📊 Finanzplanung & Wirtschaftlichkeit", "keywords": ["Umsatzplanung realistisch", "marktgerecht entwickeln", "Kostenstruktur klar aufbauen", "bewerten", "Deckungsbeitragsrechnung strategisch nutzen", "Break-even-Analyse systematisch herleiten", "Wirtschaftlichkeit", "Rentabilität überzeugend argumentieren", "Liquiditätsplanung", "Zahlungsfähigkeit sichern", "Finanzkennzahlen plausibel berechnen", "darstellen", "Wirkung von Preisgestaltung", "Marge verstehen", "Sensitivitätsanalyse", "Szenariorechnung vorbereiten", "Planung für Reinvestition, Wachstum", "Skalierung", "Bauunternehmen: Finanzplanung", "Wirtschaftlichkeit der zwei Brüder strategisch darstellen"]},
            {"id": "steuern_formalitaeten", "name": "📄 Steuern & Formalitäten", "keywords": ["Rechtsformwahl begründet darstellen", "Steuerarten", "-pflichten richtig einordnen", "Umsatzsteuer-Pflichten und Optionen verstehen", "Gewinnermittlungsart begründen und planen", "Buchhaltung", "Aufzeichnungspflichten systematisch darstellen", "Rechnungserstellung korrekt", "professionell planen", "Steuerliche Registrierung", "Startpflichten", "Fragebogen zur steuerlichen Erfassung", "Abgabefristen, Zuständigkeiten", "Steuertermine im Griff", "Zusammenarbeit mit Steuerberater:in oder externem Dienstleister", "Bauunternehmen: Steuerliche Pflichten", "Gründungsformalitäten im Überblick", "Zwei-Brüder-Team"]},
            {"id": "businessplaene", "name": "💼 Business Pläne", "keywords": ["Professionelle Gliederung", "Aufbau eines Businessplans entwickeln", "Businessplan-Zusammenfassung", "1–2 Seiten", "für Bank, Zuschuss oder Pitch", "Businessplan gezielt auf Zielgruppen anpassen", "Checkliste: „Bin ich bereit zur Abgabe", "Businessplan als internes Steuerungsinstrument nutzen", "Anhang", "Nachweise strukturiert zusammenstellen", "Businessplan digital", "visuell ansprechend gestalten", "Pitchfähige Präsentation aus dem Businessplan ableiten", "Wiederverwendbare Textbausteine für Zuschüsse", "Bewerbungen erstellen", "Nutzung", "Iteration: Wie du deinen Businessplan regelmäßig aktualisierst", "Zwei-Brüder-Bauunternehmen: Kompakte Zusammenfassung", "Einstiegslogik des Businessplans"]},
        ]
    },
    "Fachanwalt Gesellschaftsrecht": {
        "icon": "⚖️",
        "themes": [
            {"id": "rechtsformen_haftung", "name": "⚖️ Rechtsformen & Haftungsstruktur", "keywords": ["Vergleich der Gesellschaftsformen", "Haftung, Gründung", "Investorenfähigkeit", "Rechtsform", "Bonität", "wie die Wahl der Gesellschaftsform die Finanzierung beeinflusst", "Was ist eine GbR", "und was muss ich als Nichtjurist:in beachten", "Innen- und Außenverhältnis in der GbR, oHG", "KG einfach erklärt", "Die oHG in der Praxis", "Chancen, Risiken", "Anwendung für kleine Unternehmen", "GmbH vs. UG", "Entscheidungshilfe für Gründer:innen", "Haftungsrisiken in der GmbH", "Co. KG", "und wie man sie begrenzt", "Die GmbH", "Co. KG im Überblick", "wie sie funktioniert und wann sie sich lohnt", "Die AG im Mittelstand", "sinnvoll oder überdimensioniert", "Steuerliche Transparenz vs. Körperschaftsbesteuerung", "eine strategische Analyse"]},
            {"id": "gruendung_registrierung", "name": "📝 Gründung & Registrierung", "keywords": ["Was braucht man zur Gründung einer GmbH", "Handelsregisteranmeldung verständlich", "praxisnah erklärt", "Achtung bei Handelsregister-Rechnungen", "wie erkenne ich betrügerische Schreiben", "UG oder GmbH gründen", "was ist günstiger, schneller, sicherer", "Häufige Fehler bei Gesellschaftsgründungen", "und wie man sie vermeidet", "GmbH gegründet", "und jetzt? Die To-do-Liste nach der Eintragung", "Muster-Check: Gesellschaftsvertrag", "was muss wirklich rein", "Der Gründungsprozess bei der GmbH", "Co. KG", "Schritt für Schritt", "Gesellschafterwechsel vor oder nach Eintragung", "was ist zu beachten", "Vorratsgesellschaft kaufen oder selbst gründen", "Entscheidungshilfe für Geschäftsführer:innen"]},
            {"id": "einzelunternehmen", "name": "👤 Einzelunternehmen", "keywords": ["Was ist ein Einzelunternehmen", "und für wen eignet es sich", "Wie gründe ich ein Einzelunternehmen", "Schritt für Schritt erklärt", "Wie läuft die Gewerbeanmeldung für Einzelunternehmer:innen ab", "Haftung im Einzelunternehmen", "was bedeutet das konkret", "Freiberuf oder Gewerbe", "Was bin ich eigentlich, und warum ist das so wichtig", "Wie beende ich ein Einzelunternehmen", "und was muss ich beachten", "Was muss auf Rechnungen eines Einzelunternehmens stehen", "Vom Einzelunternehmen zur GmbH", "wie funktioniert der Wechsel", "Was muss ich als Einzelunternehmer:in auf Social Media beachten", "Die AG im Mittelstand", "sinnvoll oder überdimensioniert"]},
            {"id": "gbr", "name": "🏢 GbR - Gesellschaft bürgerlichen Rechts", "keywords": ["Begriff und Wesen der GbR - Anwendungsbereiche", "Die Gründung einer GbR", "Voraussetzungen, Ablauf und Formerfordernisse", "Das Innenverhältnis der GbR", "Geschäftsführung, Entscheidungsfindung und interne Haftung", "Das Außenverhältnis der GbR", "Vertretung und externe Haftung", "Inhalte und Struktur eines GbR-Gesellschaftsvertrags", "Regelungsbereiche und Gestaltungsspielräume", "Auftritt und Außenwahrnehmung der GbR", "Namensführung, Impressum und Unternehmensauftritt", "GbR, oHG oder eGbR?", "Rechtsformwahl, Abgrenzung und Schwellenprüfung", "Gesellschafterwechsel in der GbR", "Eintritt, Austritt und Nachfolgeregelung rechtskonform", "Wie beende ich eine GbR", "und worauf muss ich achten", "Haftung richtig begrenzen", "Vertragsgestaltung", "Risikovorsorge in der GbR"]},
            {"id": "ohg", "name": "🏪 OHG - offene Handelsgesellschaft", "keywords": ["Begriff und Rechtsnatur der oHG", "Abgrenzung zur GbR und Bedeutung als Handelsgesellschaft", "Gründung einer oHG", "Schritte, Anmeldung und Handelsregistereintrag", "Gesellschaftsvertrag der oHG", "gesetzliche Vorgaben und empfohlene Regelungen", "Innenverhältnis der oHG", "Geschäftsführung, Stimmrechte und Beschlussfassung", "Beschlussfassung in der oHG", "Mehrheiten, Vetorechte und Sonderregelungen", "Außenverhältnis der oHG", "Vertretungsmacht, Vertragsbindung und Publizitätspflichten", "Pflichten als Kaufleute", "Buchführung, Wettbewerbsverbot, Offenlegung", "Haftung der Gesellschafter", "Umfang, Besonderheiten und Begrenzungsmöglichkeiten", "Gesellschafterwechsel in der oHG", "Eintritt, Austritt, Tod und Fortsetzung", "Beendigung und Liquidation der oHG", "Ablauf, Haftung, Nachschlusspflicht"]},
            {"id": "kg", "name": "🤝 KG - Kommanditgesellschaft", "keywords": ["Begriff, Wesen und Rechtsnatur der KG", "Aufbau, Beteiligungs­formen und Abgrenzung zur oHG", "Gründung einer KG", "Ablauf, Handelsregister, typische Fehler", "Gesellschaftsvertrag der KG", "Mindestanforderungen und Gestaltungs­spielräume", "Innenverhältnis der KG", "Rechte, Pflichten und Kontrollmechanismen", "Außenverhältnis und Vertretung", "wer handelt wie für die KG", "Haftung von Kommanditist:innen und Komplementär:innen", "Risiken", "Schutzmechanismen", "Beschlussfassung in der KG", "Stimmrechte, Sonderrechte, Vetoregeln", "Eintritt, Austritt und Nachfolge", "Gesellschafterwechsel in der KG", "Beendigung und Liquidation der KG", "Ablauf, Sonderfragen, Nachhaftung", "Die KG im Unternehmensverbund", "Holdingstrukturen, GmbH", "Co. KG, steuerliche Optimierung", "Die oHG im Konzern und Unternehmensverbund", "Kooperationsformen und Vertragskonstellationen"]},
            {"id": "gmbh_cokg", "name": "🏢 GmbH & Co. KG", "keywords": ["Begriff, Struktur und Besonderheiten der GmbH", "Co. KG", "Trennung von Haftung", "Führung", "Gründung einer GmbH", "Co. KG", "Ablauf, Anforderungen und typische Fehlerquellen", "Gesellschaftsverträge in der GmbH", "Co. KG", "doppelte Vertragsstruktur rechtssicher gestalten", "Innenverhältnis", "Zusammenspiel von GmbH, Kommanditist:innen und Geschäftsführung", "Haftungsstruktur in der GmbH", "Co. KG", "wer haftet wie wofür", "Haftung von Kommanditist:innen und Komplementär:innen", "Risiken", "Schutzmechanismen", "Steuerliche Besonderheiten", "Mitunternehmerschaft, § 15 EStG, Verlustverrechnung", "Beteiligung von Familienmitgliedern", "Dritten", "Gesellschafterstrategie", "Vermögensnachfolge", "Exit, Umwandlung", "Auflösung", "rechtssichere Beendigung der GmbH", "Co. KG", "Die GmbH", "Co. KG im Konzern", "Holdingstrukturen, Vertragsmodelle, Investoreneinstieg"]},
            {"id": "gmbh_beschraenkt", "name": "💼 GmbH - Gesellschaft mit beschränkter...", "keywords": ["Begriff, Struktur und Rechtsnatur der GmbH", "Kapitalgesellschaft mit Personen­element", "Gründung der GmbH", "Schritte, Kosten, Handelsregister", "Musterprotokoll", "Gesellschaftsvertrag der GmbH", "Pflichtbestandteile", "Gestaltungs­spielräume", "Disquotale Einzahlungen in die Kapitalrücklage, Förderung", "Finanzierung", "Gesellschaftsformstellung", "Geschäftsführung und Vertretung der GmbH", "Rechte, Pflichten", "Haftung", "Pflichten der Gesellschafter in der GmbH", "Kapital, Weisungen", "Treuepflicht", "Gesellschafterwechsel in der GmbH", "Übertragung, Abtretung, Vinkulierung", "Einziehung", "Auflösung, Liquidation", "Löschung der GmbH", "Ablauf, Pflichten", "Nachhaftung", "Exit", "Umwandlung der GmbH", "Verschmelzung, Formwechsel", "Strukturwandel nach UmwG", "Die GmbH im Konzern", "Holdingstruktur, Organschaft", "Ergebnisabführungsvertrag"]},
            {"id": "geschaeftsfuehrer", "name": "👔 GmbH Geschäftsführer", "keywords": ["Bestellung GF", "Voraussetzungen, Verfahren", "Praxishinweise", "Bestellung GF", "Besondere Bestellungsfälle", "Satzungsbestellung, Sonderrechte", "Bestellung GF", "Bestellung mehrerer Geschäftsführer:innen", "Vertretungsregelung, § 181 BGB Befreiung", "Vertretungsmacht GF", "Einzelvertretung, Gesamtvertretung", "Zeichnungsberechtigung", "Abberufung GF", "Rechtslage, Verfahren und Grenzen", "Abberufung GF - Trennung von Organstellung", "Anstellungsverhältnis", "was endet wann", "Vertragsverhältnis GF - Zustandekommen, Mindest­inhalte", "Risiken ohne Vertrag", "Vertragsverhältnis GF - Bei einer Konzern­gesellschaft oder KG bei GmbH", "Co. KG", "Pflichten GF - Arbeitskraft", "Dienstort - Präsenzpflicht, Arbeitszeit", "Gesundheitsprüfung", "Pflichten GF - Nebentätigkeiten", "Pflichten GF - Verschwiegenheit und Vertraulichkeit während und nach der Tätigkeit"]},
            {"id": "ag", "name": "📊 AG - Aktiengesellschaft", "keywords": ["Begriff", "Wesen der Aktiengesellschaft", "Struktur, Abgrenzung", "Besonderheiten", "Gründung einer Aktiengesellschaft", "Voraussetzungen, Ablauf", "Besonderheiten", "Satzung", "Grundkapital der AG", "Anforderungen, Gestaltung", "Kapitalbindung", "Aktienarten", "Übertragung", "Namensaktien, Inhaberaktien", "Vinkulierung in der AG", "Organe der AG", "Vorstand, Aufsichtsrat", "Hauptversammlung im Überblick", "Bestellung", "Abberufung des Vorstands", "Verfahren, Voraussetzungen", "Mitbestimmung", "Rechte", "Pflichten des Vorstands", "Legalitätspflicht, Vertretung", "Haftung", "§§ 93 AktG", "Aufgaben des Aufsichtsrats", "Überwachung, Bestellung", "Berichtspflichten", "Hauptversammlung", "Ablauf, Beschlussfassung", "Rechte der Aktionäre", "§§ 118–147 AktG", "Kapitalmaßnahmen in der AG", "Kapitalerhöhung, -herabsetzung", "Bezugsrechte", "§§ 182–240 AktG", "Investor Relations", "Börseneinführung", "Kommunikation, IPO", "Kapitalmarkt­anforderungen", "Besonderheiten börsennotierter AGs", "Governance-Kodex", "Kapitalmarktrecht", "Beendigung", "Liquidation der AG", "Auflösung, Abwicklung", "Löschung", "§§ 262–274 AktG"]},
            {"id": "transparenzregister", "name": "📋 Transparenzregister", "keywords": ["Eintragungspflicht prüfen", "Wer muss ins Transparenz­register", "Ermittlung wirtschaftlich Berechtigter", "Schritt für Schritt nach § 3 GwG", "Eintragungsverfahren", "Registermeldung bis zur Registermeldung", "§ 19 GwG", "Mehrstufige Beteiligungs­ketten", "Wer gilt als wirtschaftlich Berechtigter", "Sonderfälle", "Stiftung, Trust, GbR", "Vereine im Transparenz­register", "Registereinträge aktualisieren", "Welche Änderungen müssen gemeldet werden", "Umsatzsteuerliche Korrekturen bei uneinbringlichen Forderungen", "§17 UStG", "Ausländische Gesellschaft mit Immobilien­eigentum in Deutschland", "Eintragungs­pflicht", "Unstimmigkeits­meldungen", "Bußgelder vermeiden", "Pflichten", "Praxistipps", "§ 23a, § 56 GwG", "Checkliste für Berater", "Wann besteht Handlungs­bedarf im Transparenz­register"]},
        ]
    }
}
    }

    // Map prompt to theme based on keywords
    getPromptTheme(prompt, role) {
        const roleThemes = this.themeMapping[role];
        if (!roleThemes) return null;

        for (const theme of roleThemes.themes) {
            for (const keyword of theme.keywords) {
                if (prompt.name.toLowerCase().includes(keyword.toLowerCase())) {
                    return theme.id;
                }
            }
        }
        
        // Fallback: return first theme
        return roleThemes.themes[0].id;
    }

    // Get prompts for a specific theme
    getPromptsForTheme(role, themeId) {
        return this.allPrompts.filter(p => {
            if (p.category !== role) return false;
            const promptTheme = this.getPromptTheme(p, role);
            return promptTheme === themeId;
        });
    }

    // Get theme statistics
    getThemeStats(role, themeId) {
        const prompts = this.getPromptsForTheme(role, themeId);
        return {
            total: prompts.length,
            fundamental: prompts.filter(p => p.tags?.includes('Fundamental')).length,
            erweitert: prompts.filter(p => p.tags?.includes('Erweitert')).length,
            premium: prompts.filter(p => p.tags?.includes('Premium')).length
        };
    }

    getRoleCount() {
        const roles = new Set(this.allPrompts.map(p => p.category));
        return roles.size;
    }

    init(context = null) {
        if (context) {
            this.addTaskFromCommandCenter(context);
        }
        this.renderMainView();
        console.log('✅ Prompts Engine ready (3-Level)');
    }

    addTaskFromCommandCenter(context) {
        const task = {
            id: Date.now(),
            title: context.task,
            agent: this.getAgentName(context.agentId),
            agentId: context.agentId,
            matchScore: context.matchScore || 98,
            source: context.email ? 'email' : 'manual',
            email: context.email,
            attachments: context.attachments || [],
            timestamp: new Date().toISOString()
        };
        
        const exists = this.taskQueue.find(t => 
            t.title === task.title && t.agentId === task.agentId
        );
        
        if (!exists) {
            this.taskQueue.push(task);
            console.log('✅ Task added to queue:', task);
        }
    }

    /* ========================================== */
    /* MAIN VIEW RENDERING */
    /* ========================================== */

    renderMainView() {
        const container = document.getElementById('prompts-content');
        if (!container) return;
        
        container.innerHTML = `
            <!-- Mode Switcher -->
            <div class="mode-switcher">
                <button 
                    class="mode-btn ${this.currentMode === 'templates' ? 'active' : ''}"
                    onclick="window.promptsEngine.switchMode('templates')"
                >
                    📚 Expert Templates
                </button>
                <button 
                    class="mode-btn ${this.currentMode === 'freeform' ? 'active' : ''}"
                    onclick="window.promptsEngine.switchMode('freeform')"
                >
                    🆓 Custom Builder
                </button>
            </div>
            
            ${this.currentMode === 'templates' ? this.renderTemplateMode() : this.renderFreeFormMode()}
        `;
        
        this.setupEventListeners();
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.currentView = 'roles';
        this.currentRole = null;
        this.currentTheme = null;
        this.currentPrompt = null;
        this.renderMainView();
    }

    renderTemplateMode() {
        // Render based on current view
        if (this.currentView === 'roles') {
            return this.renderRolesView();
        } else if (this.currentView === 'themes') {
            return this.renderThemesView();
        } else if (this.currentView === 'prompts') {
            return this.renderPromptsView();
        }
    }

    /* ========================================== */
    /* LEVEL 1: ROLES VIEW */
    /* ========================================== */

    renderRolesView() {
        const roles = this.getRoles();
        
        return `
            <div class="prompts-template-section">
                <h2 class="section-title">💼 Wähle deine Rolle</h2>
                <p class="section-subtitle">${this.allPrompts.length} Prompts in ${roles.length} Rollen verfügbar</p>
                
                <div class="roles-grid">
                    ${roles.map(role => this.renderRoleCard(role)).join('')}
                </div>
            </div>
        `;
    }

    renderRoleCard(role) {
        const roleIcon = this.getRoleIcon(role.name);
        return `
            <div class="role-card" onclick="window.promptsEngine.selectRole('${role.name}')">
                <div class="role-icon">${roleIcon}</div>
                <div class="role-info">
                    <h3 class="role-name">${role.name}</h3>
                    <p class="role-count">${role.count} Prompts verfügbar</p>
                </div>
                <div class="role-arrow">→</div>
            </div>
        `;
    }

    /* ========================================== */
    /* LEVEL 2: THEMES VIEW */
    /* ========================================== */

    renderThemesView() {
        const roleData = this.themeMapping[this.currentRole];
        if (!roleData) return '';

        const roleIcon = this.getRoleIcon(this.currentRole);
        const totalPrompts = this.allPrompts.filter(p => p.category === this.currentRole).length;

        return `
            <div class="prompts-template-section">
                <!-- Breadcrumb Navigation -->
                <div class="breadcrumb-nav">
                    <button onclick="window.promptsEngine.goBackToRoles()" class="breadcrumb-back">
                        ← Zurück zu Rollen
                    </button>
                </div>

                <h2 class="section-title">${roleIcon} ${this.currentRole}</h2>
                <p class="section-subtitle">${totalPrompts} Prompts in ${roleData.themes.length} Hauptthemen</p>
                
                <div class="themes-grid">
                    ${roleData.themes.map(theme => this.renderThemeCard(theme)).join('')}
                </div>
            </div>
        `;
    }

    renderThemeCard(theme) {
        const stats = this.getThemeStats(this.currentRole, theme.id);
        
        return `
            <div class="theme-card" onclick="window.promptsEngine.selectTheme('${theme.id}')">
                <div class="theme-header">
                    <h3 class="theme-name">${theme.name}</h3>
                    <div class="theme-arrow">→</div>
                </div>
                <div class="theme-stats">
                    <span class="theme-count">${stats.total} Prompts</span>
                    ${stats.fundamental > 0 ? `<span class="badge badge-fundamental">${stats.fundamental} Fundamental</span>` : ''}
                    ${stats.erweitert > 0 ? `<span class="badge badge-erweitert">${stats.erweitert} Erweitert</span>` : ''}
                    ${stats.premium > 0 ? `<span class="badge badge-premium">${stats.premium} Premium</span>` : ''}
                </div>
            </div>
        `;
    }

    /* ========================================== */
    /* LEVEL 3: PROMPTS VIEW */
    /* ========================================== */

    renderPromptsView() {
        const prompts = this.getPromptsForTheme(this.currentRole, this.currentTheme);
        const roleData = this.themeMapping[this.currentRole];
        const theme = roleData.themes.find(t => t.id === this.currentTheme);
        
        if (!theme) return '';

        return `
            <div class="prompts-template-section">
                <!-- Breadcrumb Navigation -->
                <div class="breadcrumb-nav">
                    <button onclick="window.promptsEngine.goBackToThemes()" class="breadcrumb-back">
                        ← Zurück zu ${this.currentRole}
                    </button>
                </div>

                <h2 class="section-title">${theme.name}</h2>
                <p class="section-subtitle">${prompts.length} Prompts verfügbar</p>
                
                <!-- Prompt List -->
                <div class="prompt-list-simple">
                    ${prompts.map(prompt => this.renderPromptListItem(prompt)).join('')}
                </div>
            </div>
        `;
    }

    renderPromptListItem(prompt) {
        const impactClass = prompt.tags?.includes('Premium') ? 'premium' : 
                          prompt.tags?.includes('Erweitert') ? 'erweitert' : 'fundamental';
        
        return `
            <div class="prompt-list-item" onclick="window.promptsEngine.selectPrompt('${prompt.id}')">
                <div class="prompt-icon">${prompt.icon || '📄'}</div>
                <div class="prompt-details">
                    <h4 class="prompt-name">${prompt.name}</h4>
                    <div class="prompt-meta">
                        <span class="badge badge-${impactClass}">${prompt.tags?.[0] || 'Standard'}</span>
                        <span class="prompt-duration">⏱️ ${prompt.duration || 30} Min</span>
                    </div>
                </div>
                <div class="prompt-arrow">→</div>
            </div>
        `;
    }

    /* ========================================== */
    /* NAVIGATION METHODS */
    /* ========================================== */

    selectRole(roleName) {
        this.currentRole = roleName;
        this.currentView = 'themes';
        this.currentTheme = null;
        this.currentPrompt = null;
        this.renderMainView();
    }

    selectTheme(themeId) {
        this.currentTheme = themeId;
        this.currentView = 'prompts';
        this.currentPrompt = null;
        this.renderMainView();
    }

    selectPrompt(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;
        
        this.currentPrompt = prompt;
        this.renderPromptDetail(prompt);
    }

    goBackToRoles() {
        this.currentView = 'roles';
        this.currentRole = null;
        this.currentTheme = null;
        this.currentPrompt = null;
        this.renderMainView();
    }

    goBackToThemes() {
        this.currentView = 'themes';
        this.currentTheme = null;
        this.currentPrompt = null;
        this.renderMainView();
    }

    goBackToPrompts() {
        this.currentPrompt = null;
        this.renderMainView();
    }

    /* ========================================== */
    /* PROMPT DETAIL VIEW */
    /* ========================================== */

    renderPromptDetail(prompt) {
        const container = document.getElementById('prompts-content');
        if (!container) return;

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
                        <p class="prompt-detail-meta">${prompt.category} • ⏱️ ${prompt.duration || 30} Min</p>
                    </div>
                </div>

                <!-- Goal -->
                <div class="prompt-section">
                    <h3 class="prompt-section-title">🎯 Ziel</h3>
                    <p class="prompt-section-content">${prompt.goal || prompt.name}</p>
                </div>

                <!-- Full Prompt -->
                <div class="prompt-section">
                    <h3 class="prompt-section-title">📋 Vollständiger Prompt</h3>
                    <div class="prompt-code-box">
                        <button class="copy-btn" onclick="window.promptsEngine.copyPromptCode('${prompt.id}')">
                            📋 Kopieren
                        </button>
                        <pre class="prompt-code" id="prompt-code-${prompt.id}">${this.escapeHtml(prompt.fullPromptText || 'Kein Prompt-Text verfügbar')}</pre>
                    </div>
                    <p class="prompt-transparency-note">💡 <strong>100% Transparenz:</strong> Das ist exakt der Prompt, der an die AI gesendet wird.</p>
                </div>

                <!-- Questions/Inputs -->
                ${prompt.questions && prompt.questions.length > 0 ? `
                <div class="prompt-section">
                    <h3 class="prompt-section-title">🔍 Deine Eingaben</h3>
                    <div class="prompt-questions">
                        ${prompt.questions.map((q, idx) => `
                            <div class="question-group">
                                <label class="question-label">
                                    ${idx + 1}. ${q.question}
                                </label>
                                <input 
                                    type="text" 
                                    class="question-input"
                                    placeholder="${q.example || 'Ihre Antwort'}"
                                    id="answer-${prompt.id}-${idx}"
                                    onchange="window.promptsEngine.updateAnswer('${prompt.id}', ${idx}, this.value)"
                                />
                                <p class="question-example">💡 Beispiel: ${q.example}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Actions -->
                <div class="prompt-actions">
                    <button class="btn btn-primary" onclick="window.promptsEngine.executePrompt('${prompt.id}')">
                        ▶️ Prompt ausführen
                    </button>
                    <button class="btn btn-secondary" onclick="window.promptsEngine.addToQueue('${prompt.id}')">
                        ➕ Zur Task Queue
                    </button>
                </div>
            </div>
        `;
    }

    updateAnswer(promptId, questionIndex, value) {
        if (!this.userAnswers[promptId]) {
            this.userAnswers[promptId] = {};
        }
        this.userAnswers[promptId][questionIndex] = value;
    }

    copyPromptCode(promptId) {
        const codeElement = document.getElementById(`prompt-code-${promptId}`);
        if (codeElement) {
            navigator.clipboard.writeText(codeElement.textContent);
            alert('✅ Prompt kopiert!');
        }
    }

    executePrompt(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        // Get user answers
        const answers = this.userAnswers[promptId] || {};
        
        console.log('🚀 Executing prompt:', prompt.name);
        console.log('📝 User answers:', answers);
        
        // TODO: Integrate with AI execution
        alert(`✅ Prompt "${prompt.name}" wird ausgeführt!\n\n(AI-Integration folgt)`);
    }

    addToQueue(promptId) {
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        const task = {
            id: Date.now(),
            title: prompt.name,
            agent: prompt.role || prompt.category,
            agentId: prompt.id,
            matchScore: 100,
            source: 'manual',
            timestamp: new Date().toISOString()
        };

        this.taskQueue.push(task);
        console.log('✅ Added to queue:', task);
        alert(`✅ "${prompt.name}" zur Task Queue hinzugefügt!`);
    }

    /* ========================================== */
    /* FREE-FORM MODE */
    /* ========================================== */

    renderFreeFormMode() {
        return `
            <div class="prompts-freeform-section">
                <h2 class="section-title">🆓 Custom Prompt Builder</h2>
                <p class="section-subtitle">Erstelle deinen eigenen Prompt</p>
                
                <div class="freeform-builder">
                    <div class="form-group">
                        <label>Rolle / Agent</label>
                        <select class="form-control" id="freeform-role">
                            <option>Controller</option>
                            <option>Treasury</option>
                            <option>CFO</option>
                            <option>M&A</option>
                            <option>Bilanzbuchhalter</option>
                            <option>Business Developer</option>
                            <option>Fachanwalt</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Aufgabe / Ziel</label>
                        <textarea 
                            class="form-control" 
                            id="freeform-task" 
                            rows="3"
                            placeholder="Was möchtest du erreichen?"
                        ></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Context / Details</label>
                        <textarea 
                            class="form-control" 
                            id="freeform-context" 
                            rows="5"
                            placeholder="Gib relevante Details und Kontext..."
                        ></textarea>
                    </div>
                    
                    <button class="btn btn-primary" onclick="window.promptsEngine.executeFreeForm()">
                        ▶️ Prompt ausführen
                    </button>
                </div>
            </div>
        `;
    }

    executeFreeForm() {
        const role = document.getElementById('freeform-role')?.value;
        const task = document.getElementById('freeform-task')?.value;
        const context = document.getElementById('freeform-context')?.value;

        if (!task) {
            alert('⚠️ Bitte gib eine Aufgabe ein');
            return;
        }

        console.log('🚀 Executing custom prompt:', { role, task, context });
        alert(`✅ Custom Prompt wird ausgeführt!\n\n(AI-Integration folgt)`);
    }

    /* ========================================== */
    /* HELPER METHODS */
    /* ========================================== */

    getRoles() {
        const roleMap = new Map();
        
        this.allPrompts.forEach(prompt => {
            const role = prompt.category;
            if (!roleMap.has(role)) {
                roleMap.set(role, { name: role, count: 0 });
            }
            roleMap.get(role).count++;
        });
        
        return Array.from(roleMap.values()).sort((a, b) => b.count - a.count);
    }

    getRoleIcon(role) {
        const icons = {
            'Controller': '📊',
            'Treasury': '🏦',
            'Tax': '💰',
            'CFO': '📈',
            'M&A': '🤝',
            'Bilanzbuchhalter': '📚',
            'Business Developer': '🚀',
            'Fachanwalt Gesellschaftsrecht': '⚖️',
            'Accountant': '💼',
            'Finance Manager': '💵',
            'Auditor': '🔍'
        };
        return icons[role] || '💼';
    }

    getAgentName(agentId) {
        const agents = {
            'controller': 'Controller',
            'treasury': 'Treasury Manager',
            'cfo': 'CFO',
            'ma': 'M&A Specialist',
            'accountant': 'Bilanzbuchhalter'
        };
        return agents[agentId] || 'Finance Expert';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupEventListeners() {
        // Event listeners können hier hinzugefügt werden
    }

    /* ========================================== */
    /* DATA LOADING */
    /* ========================================== */

    getAllPrompts() {
        const builtinPrompts = [];

        // Load Controller Prompts
        const controllerPrompts = (typeof NOTION_PROMPTS !== 'undefined' && Array.isArray(NOTION_PROMPTS)) 
            ? NOTION_PROMPTS 
            : [];

        // Load Treasury Prompts
        const treasuryPrompts = (typeof TREASURY_PROMPTS !== 'undefined' && Array.isArray(TREASURY_PROMPTS)) 
            ? TREASURY_PROMPTS 
            : [];

        // Load CFO Prompts
        const cfoPrompts = (typeof CFO_PROMPTS !== 'undefined' && Array.isArray(CFO_PROMPTS)) 
            ? CFO_PROMPTS 
            : [];

        // Load M&A Prompts
        const maPrompts = (typeof MA_PROMPTS !== 'undefined' && Array.isArray(MA_PROMPTS)) 
            ? MA_PROMPTS 
            : [];

        // Load Bilanzbuchhalter Prompts
        const bilanzPrompts = (typeof BILANZ_PROMPTS !== 'undefined' && Array.isArray(BILANZ_PROMPTS)) 
            ? BILANZ_PROMPTS 
            : [];

        // Load Business Developer Prompts
        const bizdevPrompts = (typeof BIZDEV_PROMPTS !== 'undefined' && Array.isArray(BIZDEV_PROMPTS)) 
            ? BIZDEV_PROMPTS 
            : [];

        // Load Fachanwalt Prompts
        const lawyerPrompts = (typeof LAWYER_PROMPTS !== 'undefined' && Array.isArray(LAWYER_PROMPTS)) 
            ? LAWYER_PROMPTS 
            : [];

        console.log(`📦 Loaded ${controllerPrompts.length} Controller prompts`);
        console.log(`🏦 Loaded ${treasuryPrompts.length} Treasury prompts`);
        console.log(`📈 Loaded ${cfoPrompts.length} CFO prompts`);
        console.log(`🤝 Loaded ${maPrompts.length} M&A prompts`);
        console.log(`📚 Loaded ${bilanzPrompts.length} Bilanzbuchhalter prompts`);
        console.log(`🚀 Loaded ${bizdevPrompts.length} Business Developer prompts`);
        console.log(`⚖️ Loaded ${lawyerPrompts.length} Fachanwalt prompts`);

        return [...builtinPrompts, ...controllerPrompts, ...treasuryPrompts, ...cfoPrompts, ...maPrompts, ...bilanzPrompts, ...bizdevPrompts, ...lawyerPrompts];
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.PromptsEngine = PromptsEngine;
    console.log('✅ PromptsEngine (3-Level) class loaded');
    
    // Global init function for navigation
    window.initPromptsTab = function() {
        console.log('🎯 initPromptsTab() called');
        
        if (!window.promptsEngine) {
            console.log('📦 Creating new PromptsEngine instance...');
            window.promptsEngine = new PromptsEngine();
        }
        
        window.promptsEngine.init();
        console.log('✅ Prompts Engine initialized and rendered');
    };
    
    // Auto-initialize when prompts container exists
    document.addEventListener('DOMContentLoaded', function() {
        const promptsContainer = document.getElementById('prompts-content');
        if (promptsContainer) {
            console.log('🎯 Auto-initializing Prompts Engine (DOMContentLoaded)...');
            window.initPromptsTab();
        }
    });
    
    // Also check after a short delay (for dynamic content loading)
    setTimeout(function() {
        if (!window.promptsEngine) {
            const promptsContainer = document.getElementById('prompts-content');
            if (promptsContainer) {
                console.log('🎯 Auto-initializing Prompts Engine (delayed)...');
                window.initPromptsTab();
            }
        }
    }, 500);
}
