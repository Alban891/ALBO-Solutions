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

        // 🆕 Inject Split-Screen CSS
        this.injectSplitScreenCSS();
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
                    {"id": "zwecke_grundsaetze", "name": "📋 Zwecke und Grundsätze der ...", "keywords": ["Zwecke des Jahresabschlusses", "Grundsatz der Richtigkeit", "Grundsatz der Vergleichbarkeit", "Grundsatz der Klarheit", "Grundsatz der Vollständigkeit", "Bilanzstichtagsprinzip – Werterhellend", "Periodisierungsprinzip", "Realisationsprinzip", "Imparitätsprinzip", "Vorsichtsprinzip"]},
                    {"id": "allgemeine_ansatz", "name": "⚖️ Allgemeine Ansatzregeln", "keywords": ["Aktivierungsfähigkeit nach HGB – abstrakt & konkret", "Aktivierungsverbot nach § 248 Abs. 2", "Aktivierungswahlrechte – Entwicklungskosten und Disagio", "Aktivierungsgebote bei Nicht-Vermögensgegenständen – z.B. RAP", "Zurechnung von Vermögensgegenständen – wirtschaftliches vs. rechtliches", "Passivierungsfähigkeit – Drei Kriterien", "Abgrenzung: Rückstellung oder Eventualverbindlichkeit", "Ansatzgrundsätze in der Steuerbilanz – Maßgeblichkeitsprinzip", "Ansatzvorschriften nach IFRS – Unterschiede zu HGB"]},
                    {"id": "allgemeine_bewertung", "name": "💰 Allgemeine Bewertungsregeln", "keywords": ["Grundprinzipien der Bewertung – Überblick", "Zugangsbewertung von Vermögensgegenständen – Anschaffung", "Folgebewertung – Niederstwertprinzip und Zuschreibungspflicht", "Bewertung von Schulden – Erfüllungsbetrag", "Bewertungsvereinfachungsverfahren – FIFO, LIFO", "Bewertungseinheiten und Sicherungsbeziehungen – § 254", "Währungsumrechnung bei Bilanzansatz – § 256a", "IFRS-Bewertungskonzepte im Vergleich", "Wertaufhellung vs. Wertbegründung – Bilanzstichtagsprinzip richtig"]},
                    {"id": "anlagevermoegen", "name": "🏭 Bilanzierung des Anlagevermögens", "keywords": ["Aktivierung von Sachanlagen – Anschaffungsnebenkosten & nachträgliche AK", "Nachträgliche Anschaffungskosten – Erweiterungen und Erneuerungen", "Erweiterungen und Erneuerungen an Anlagen", "Abgrenzung aktivierungspflichtiger, -fähiger und -verbotener Posten", "Aktivierung selbst erstellter immaterieller Vermögenswerte bei teilweise", "Abgrenzung Anlagevermögen vs. Umlaufvermögen – Zurechnung", "Zurechnung von Wirtschaftsgütern bei abweichender zivilrechtlicher", "Bilanzierung von Anlagen im Bau", "Bilanzierung geringwertiger Wirtschaftsgüter – GWG", "Originärer Geschäfts- oder Firmenwert"]},
                    {"id": "vorratsvermoegen", "name": "📦 Bilanzierung des Vorratsvermögens", "keywords": ["Definition & Abgrenzung: Was gehört zum Vorratsvermögen", "Zugangsbewertung von Vorräten gemäß § 255 Abs", "Folgebewertung von Vorräten nach dem Niederstwertprinzip – § 253 Abs. 4", "Bewertungsvereinfachungsverfahren bei Vorräten – FIFO", "Teilwertabschreibung bei Vorräten – steuerliche Bewertung", "Bewertung von Roh-, Hilfs- und Betriebsstoffen – Zugangs", "Bewertung unfertiger Erzeugnisse – Herstellungskosten", "Bewertung fertiger Erzeugnisse – Niederstwertprinzip", "Bewertung von Handelswaren – Strenges Niederstwertprinzip", "Bewertung des Vorratsvermögens nach IFRS", "Bewertung des Vorratsvermögens nach US GAAP"]},
                    {"id": "forderungen", "name": "📄 Bilanzierung der Forderungen", "keywords": ["Bilanzierung von Forderungen aus Lieferungen und Leistungen nach HGB", "Zweifelhafte Forderungen: Teilwertabschreibung und Pauschalwertberichtigung", "Pauschalwertberichtigung auf Forderungen nach HGB und ESTG", "Bilanzierung uneinbringlicher Forderungen – Vollwertabschreibung", "Pauschalwertberichtigung auf Forderungen – Einzel- & Gruppenrisiken", "Umsatzsteuerliche Korrekturen bei uneinbringlichen Forderungen – § 17 UStG", "Bilanzierung von Forderungen nach IFRS – Klassifikation", "Bilanzierung nach IFRS 9 – Expected Credit Loss Model"]},
                    {"id": "finanzinstrumente", "name": "💼 Bilanzierungen von Finanzinstrumenten", "keywords": ["Klassifizierung von Finanzinstrumenten (HGB)", "Bewertung börsennotierter Wertpapiere (Umlaufvermögen, HGB)", "Bilanzierung nicht börsennotierter Beteiligungen (Finanzanlagevermögen, HGB)", "Zuschreibungen bei Wertaufholung (§ 253 Abs. 5 HGB)", "Abgrenzung derivativer Finanzinstrumente (z.B. Optionen, Swaps, Futures) – Hedging", "Hedging & Bewertung von Sicherungsgeschäften nach HGB", "Verkauf und Ausbuchung von Finanzinstrumenten (HGB)", "Bilanzierung von Finanzinstrumenten bei Kreditinstituten (RechKredV)", "Vergleich HGB vs. IFRS bei der Bilanzierung von Finanzinstrumenten", "Vergleich HGB vs. US GAAP bei der Bilanzierung von Finanzinstrumenten"]},
                    {"id": "eigenkapital", "name": "💎 Bilanzierung des Eigenkapitals", "keywords": ["Funktion, Gliederung und Bedeutung des Eigenkapitals nach HGB", "Bilanzierung des gezeichneten Kapitals – Zugang, Bewertung, Handelsregistereintrag", "Ausstehende Einlagen auf das gezeichnete Kapital nach § 272 Abs", "Kapitalerhöhung – Bilanzierung des gezeichneten Kapitals und der Kapitalrücklage", "Kapitalherabsetzung – Bilanzielle Behandlung und Ausweis", "Kapitalzuschuss nach § 272 Abs. 2 HGB – Bilanzierung", "Gewinnrücklagen nach § 272 Abs. 3-5 HGB – Bildung", "Gewinn-/Verlustvortrag – Bilanzierung und Ausweis in Jahresabschluss", "Jahresüberschuss / Jahresfehlbetrag – Ausweis, Verrechnung", "Sonder- & Ergänzungskapitalkonten bei Personengesellschaften – Bilanzierung", "Inkongruente Gewinnausschüttung – Steuerlich zulässige Gestaltung", "Disquotalen Einzahlung in die Kapitalrücklage bei GmbHs"]},
                    {"id": "verbindlichkeiten", "name": "🔗 Bilanzierung von Verbindlichkeiten", "keywords": ["Begriff und Arten von Verbindlichkeiten – Abgrenzung, Systematik, Ausweis", "Ansatz und Bewertung von Verbindlichkeiten – Grundsätze nach § 253 HGB", "Verbindlichkeiten mit Differenz zwischen Auszahlung und Rückzahlung – Abzinsung", "Unverzinsliche Verbindlichkeiten aus Rentenverpflichtungen – Barwert", "Verbindlichkeiten mit Skonto – Bewertung zum Erfüllungsbetrag", "Fremdwährungsverbindlichkeiten – Zugang, Umrechnung & Bewertung nach § 256a", "Bilanzierung von Verbindlichkeiten nach IFRS – Klassifikation, Bewertung", "Verbindlichkeiten nach US GAAP – Klassifikation, Bewertung, Debt Modification", "Verbindlichkeiten im Vergleich – HGB, IFRS & US GAAP"]},
                    {"id": "rueckstellungen", "name": "📊 Bilanzierung der Rückstellungen", "keywords": ["Rückstellungen – Begriff, Zweck & Abgrenzung zu Verbindlichkeiten – § 249 HGB", "Rückstellungen in der Steuerbilanz – Maßgeblichkeit & Rückstellungsverbot", "Rückstellungen für ungewisse Verbindlichkeiten – Ansatz, Nachweis", "Rückstellungen für unterlassene Instandhaltung und Abraumbeseitigung", "Rückstellungen für Gewährleistungen ohne rechtliche Verpflichtungen und Kulanz", "Rückstellungen für Steuern", "Bewertung von Rückstellungen – Erfüllungsbetrag, Abzinsung und Erfahrungswerte – § 253", "Bilanzierung von Drohverlustrückstellungen bei schwebenden Geschäften", "Rückstellungen für Pensionen und ähnliche Verpflichtungen", "Rückstellungen für Altersversorgungsverpflichtungen – BilMoG-Regeln & Abzinsung", "Anhangangaben zu Rückstellungen gemäß § 285 Nr. 12 HGB", "Rückstellungen nach IFRS (IAS 37) – Ansatz, Bewertung", "Rückstellungen nach US GAAP (ASC 450) – Contingencies & Probabilities", "Vergleich Rückstellungen HGB – IFRS – US GAAP", "Rückstellungen für Dienstjubiläen"]},
                    {"id": "besondere_posten", "name": "📌 Besondere Bilanzposten", "keywords": ["Begriff & Funktion von Rechnungsabgrenzungsposten – § 250 HGB", "Active Rechnungsabgrenzungsposten – Voraussetzungen, Abgrenzung, Beispiele", "Passive Rechnungsabgrenzungsposten – Voraussetzungen, Besonderheiten", "Abgrenzung RAP zu Verbindlichkeiten & Rückstellungen", "Latente Steuern – Grundlagen & gesetzliche Vorgaben – § 274 HGB", "Active latente Steuern – Ansatz, Bewertung, Verlustvorträge", "Passive latente Steuern – Entstehung, Abgrenzung, Beispiel", "Latente Steuern im IFRS-Abschluss (IAS 12)", "Eventualverbindlichkeiten & Haftungsverhältnisse – § 251 HGB", "Bürgschaften, Patronatserklärungen, Sicherheiten – Bilanzierung und Offenlegung", "Angabepflichten bei nicht bilanzierungsfähigen Verpflichtungen"]},
                    {"id": "guv", "name": "📈 Gewinn- und Verlustrechnung", "keywords": ["Aufbau, Gliederung und Bedeutung der GuV nach § 275 HGB", "Gliederung der Gesamtkosten- und Umsatzkostenverfahren – Wahlrecht", "Umsatzerlöse nach § 277 Abs. 1 HGB und IFRS 15", "Bestandsveränderungen und aktivierte Eigenleistungen – § 275 Abs. 2 Nr. 2-3", "Sonstige betriebliche Erträge & Aufwendungen", "Personalaufwand – § 275 Abs. 2 Nr. 6 HGB", "Abschreibungen auf immaterielle Vermögensgegenstände und Sachanlagen – § 275 Abs. 2", "Erträge und Aufwendungen aus Beteiligungen, Wertpapieren und Finanzinstrumenten", "Zinserträge und Zinsaufwendungen – handelsrechtlicher Ausweis und IFRS", "Ergebnis aus Währungsumrechnung und Kurssicherung – GuV-Ausweis", "Außerordentliche Erträge & Aufwendungen – handelsrechtliche Bedeutung", "Jahresüberschuss und Bilanzgewinn – Ableitung, Einflussgrößen", "Ergebnisverwendung im Einzelabschluss vs. Konzernabschluss"]},
                    {"id": "anhang", "name": "📝 Anhang", "keywords": ["Zweck, Funktion und Struktur des Anhangs – §§ 284–285 HGB", "Bilanzierungs- und Bewertungsmethoden im Anhang – § 284 Abs. 2 HGB", "Verbindlichkeiten, Sicherheiten und Restlaufzeiten im Anhang – § 285 Nr. 1-3", "Anhangangaben zu Anteilseignern, Beteiligungen und Organen – § 285 Nr. 10-11a", "Angaben zur Ergebnisverwendung und Ausschüttung im Anhang – § 285 Nr. 13", "Freiwillige Angaben & Best Practices im Anhang – z.B. ESG", "Größenabhängige Erleichterungen – Wegfasslisten nach § 288 HGB", "Haftungsverhältnisse & Eventualverbindlichkeiten – § 251 HGB & § 285 Nr. 3", "Nachtragsberichterstattung – Ereignisse nach dem Bilanzstichtag – § 285 Abs. 33", "Angaben zu Beteiligungen & Tochterunternehmen – § 285 Nr. 11 & § 313", "Exklusiv: Vollständiger Anhang"]},
                    {"id": "lagebericht", "name": "📄 Lagebericht", "keywords": ["Grundlagen des Lageberichts: Funktionen, Zielsetzung & gesetzliche Grundlagen – § 289", "Inhalt des Lageberichts: Pflichtbestandteile nach § 289 Abs. 1 HGB", "Forschungs- und Entwicklungsaktivitäten im Lagebericht – § 289 Abs. 2 Nr. 1", "Darstellung des Geschäftsverlaufs im Lagebericht – § 289 Abs. 1 HGB", "Prognose-, Chancen- und Risikobericht – § 289 Abs. 1 S. 4 HGB inkl. Ausblick", "Risikomanagementsystem & IKS im Lagebericht – § 289 Abs. 4 HGB", "Darstellung der Vermögens-, Finanz- und Ertragslage (VFE-Lage)", "Darstellung der Ertragslage im Lagebericht gemäß § 289 HGB und DRS 20", "Nachtragsbericht im Lagebericht – Ereignisse nach dem Bilanzstichtag – § 285 Nr. 33", "Finanzielle Leistungsindikatoren im Lagebericht – § 289 Abs. 1 S. 4 HGB", "Nichtfinanzielle Leistungsindikatoren im Lagebericht – § 289 Abs. 3 HGB", "Erklärung zur Unternehmensführung – § 289f HGB", "Gesamtbild und Vollständigkeitserklärung im Lagebericht"]},
                    {"id": "kapitalflussrechnung", "name": "💵 Kapitalflussrechnung", "keywords": ["Zweck und Rechtsgrundlagen der Kapitalflussrechnung nach HGB – §§ 264, 297 HGB und IFRS", "Grundstruktur und Gliederung der Kapitalflussrechnung nach DRS 21 und IAS 7", "Cashflow aus laufender Geschäftstätigkeit", "Cashflow aus Investitionstätigkeit", "Cashflow aus Finanzierungstätigkeit", "Ableitung der Kapitalflussrechnung aus Bilanz und GuV", "Definition & Abgrenzung Finanzmittelfonds", "Kapitalflussrechnung im Konzern", "Kapitalflussrechnung nach IFRS (IAS 7) – Pflichten, Gliederung", "Sonderfragen in der Kapitalflussrechnung – Leasing, Factoring", "Prüfung und Plausibilisierung der Kapitalflussrechnung", "Erstellung einer vollständigen Kapitalflussrechnung durch die KI"]},
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

    const extractedQuestions = this.extractQuestionsFromPrompt(prompt);
    let fullPromptText = prompt.fullPromptText || this.buildPromptText(prompt, extractedQuestions);

    container.innerHTML = `
        <!-- Back Navigation -->
        <div class="breadcrumb-nav">
            <button onclick="window.promptsEngine.goBackToPrompts()" class="breadcrumb-back">
                ← Zurück
            </button>
        </div>

        <!-- Prompt Header -->
        <div class="prompt-header-bar" style="background: white; padding: 16px 24px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <div class="prompt-header-info" style="display: flex; align-items: center; gap: 12px;">
                <div class="prompt-icon" style="font-size: 24px;">${prompt.icon || '📄'}</div>
                <div>
                    <h2 style="margin: 0; font-size: 20px; font-weight: 600;">${prompt.name}</h2>
                    <div class="prompt-meta" style="font-size: 12px; color: #64748b;">${prompt.category} • ⏱️ ${prompt.duration || 30} Min</div>
                </div>
            </div>
        </div>

        <!-- CLEAN SPLITSCREEN - Kompakter -->
        <div class="clean-split-container" style="display: grid; grid-template-columns: 45% 55%; gap: 2px; height: calc(100vh - 240px); width: 100%; max-width: 100%; margin: 0 auto; background: #e2e8f0; overflow: hidden;">
            
            <!-- LEFT: Questions Panel - Schmaler & kompakter -->
            <div class="questions-panel" style="background: #ffffff; padding: 20px; overflow-y: auto; height: 100%;">
                <div class="panel-header" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0;">
                    <div class="panel-title" style="font-size: 15px; font-weight: 600; color: #1e293b;">📝 Deine Eingaben</div>
                    <div class="panel-subtitle" style="font-size: 11px; color: #64748b;">${extractedQuestions.length} Fragen für optimalen Output</div>
                </div>

                ${extractedQuestions.map((q, idx) => `
                    <div class="question-item" style="margin-bottom: 20px; padding: 14px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
                        <div class="question-label" style="font-size: 13px; font-weight: 500; color: #1e293b; margin-bottom: 8px; display: flex; align-items: center;">
                            <span class="question-number" style="display: inline-block; width: 22px; height: 22px; background: #3b82f6; color: white; border-radius: 50%; text-align: center; line-height: 22px; font-weight: 600; font-size: 11px; margin-right: 10px;">${idx + 1}</span>
                            ${this.escapeHtml(q.question)}
                        </div>
                        <input 
                            type="text" 
                            class="question-input"
                            style="width: 100%; padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 4px; font-size: 12px; background: white;"
                            id="input-${prompt.id}-${idx}"
                            placeholder="${q.example ? this.escapeHtml(q.example) : 'Deine Antwort...'}"
                            oninput="window.promptsEngine.updateCleanPreview('${prompt.id}', ${idx}, this.value)"
                        />
                        ${q.example ? `<div class="question-example" style="font-size: 10px; color: #64748b; margin-top: 4px; padding-left: 32px; font-style: italic;">💡 Beispiel: ${this.escapeHtml(q.example)}</div>` : ''}
                    </div>
                `).join('')}

                <!-- Additional Context - Kompakter -->
                <div class="additional-context" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                    <div class="question-label" style="font-size: 13px; font-weight: 500; color: #1e293b; margin-bottom: 8px; display: flex; align-items: center;">
                        <span class="question-number" style="display: inline-block; width: 22px; height: 22px; background: #3b82f6; color: white; border-radius: 50%; text-align: center; line-height: 22px; font-weight: 600; font-size: 11px; margin-right: 10px;">+</span>
                        Zusätzliche Hinweise (optional)
                    </div>
                    <textarea
                        class="additional-textarea"
                        style="width: 100%; min-height: 80px; padding: 10px; border: 1.5px solid #e2e8f0; border-radius: 4px; font-size: 12px; font-family: inherit; resize: vertical;"
                        id="additional-${prompt.id}"
                        placeholder="Weitere Details, spezifische Anforderungen, Kontext..."
                        oninput="window.promptsEngine.updateAdditionalClean('${prompt.id}', this.value)"
                    ></textarea>
                </div>
            </div>

            <!-- RIGHT: Code Panel - Kompakter -->
            <div class="code-panel" style="background: #1e293b; padding: 20px; overflow-y: auto; height: 100%;">
                <div class="panel-header" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #334155;">
                    <div class="panel-title" style="font-size: 15px; font-weight: 600; color: #f1f5f9;">💻 Live Prompt Preview</div>
                    <div class="panel-subtitle" style="font-size: 11px; color: #94a3b8;">Echtzeit-Vorschau deines fertigen Prompts</div>
                </div>
                <div class="code-preview" style="font-family: 'Fira Code', 'Monaco', monospace; font-size: 12px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; word-wrap: break-word;" id="code-preview-${prompt.id}">
                    ${this.renderCleanPreview(prompt, fullPromptText, extractedQuestions)}
                </div>
            </div>
        </div>

        <!-- Action Bar - Kompakter -->
        <div class="action-bar" style="position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 2px solid #e2e8f0; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 100;">
            <div class="action-info">
                <div id="completion-status-${prompt.id}" class="completion-badge" style="padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 500; background: #fef3c7; color: #92400e;">
                    0/${extractedQuestions.length} Fragen beantwortet
                </div>
            </div>
            <div class="action-buttons" style="display: flex; gap: 8px;">
                <button class="btn-action btn-copy" style="padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 500; cursor: pointer; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e0;" onclick="window.promptsEngine.copyPrompt('${prompt.id}')">
                    📋 Kopieren
                </button>
                <button class="btn-action btn-execute" 
                    style="padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 500; cursor: pointer; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; opacity: 0.5;" 
                    id="execute-btn-${prompt.id}" 
                    onclick="window.promptsEngine.showExecuteModal('${prompt.id}')"
                    disabled>
                    ⚡ Ausführen
                </button>
            </div>
        </div>
    `;

    this.updateProgress(prompt.id, extractedQuestions.length);

    // Add click event listener to execute button AFTER DOM is ready
setTimeout(() => {
    const executeBtn = document.getElementById('execute-btn-' + prompt.id);
    if (executeBtn) {
        // Remove any existing listeners first
        executeBtn.replaceWith(executeBtn.cloneNode(true));
        const newBtn = document.getElementById('execute-btn-' + prompt.id);
        
        newBtn.addEventListener('click', function() {
            console.log('Execute button clicked for prompt:', prompt.id);
            window.promptsEngine.executePrompt(prompt.id);
        });
    }
}, 100);
}

// Clean Preview Rendering
renderCleanPreview(prompt, fullPromptText, extractedQuestions) {
    let preview = this.escapeHtml(fullPromptText);
    
    extractedQuestions.forEach((q, idx) => {
        const questionText = this.escapeHtml(q.question);
        const placeholder = `<span style="color: #64748b; font-style: italic;" id="placeholder-${prompt.id}-${idx}">[Antwort ausstehend]</span>`;
        
        const patterns = [
            `${idx + 1}. ${questionText}`,
            questionText
        ];
        
        for (const pattern of patterns) {
            if (preview.includes(pattern)) {
                preview = preview.replace(
                    pattern,
                    `${pattern}\n→ ${placeholder}`
                );
                break;
            }
        }
    });
    
    if (extractedQuestions.length > 0) {
        const additionalPlaceholder = `<span style="color: #64748b; font-style: italic;" id="additional-placeholder-${prompt.id}">[Keine zusätzlichen Hinweise]</span>`;
        preview += `\n\n<strong>Zusätzliche Hinweise:</strong>\n${additionalPlaceholder}`;
    }
    
    return preview;
}

// Update Clean Preview
updateCleanPreview(promptId, fieldIndex, value) {
    const placeholder = document.getElementById(`placeholder-${promptId}-${fieldIndex}`);
    
    if (placeholder) {
        if (value && value.trim() !== '') {
            placeholder.style.color = '#22d3ee';
            placeholder.style.fontStyle = 'normal';
            placeholder.style.fontWeight = '600';
            placeholder.textContent = value;
        } else {
            placeholder.style.color = '#64748b';
            placeholder.style.fontStyle = 'italic';
            placeholder.style.fontWeight = 'normal';
            placeholder.textContent = '[Antwort ausstehend]';
        }
    }

    if (!this.userAnswers[promptId]) {
        this.userAnswers[promptId] = {};
    }
    this.userAnswers[promptId][fieldIndex] = value;

    const prompt = this.allPrompts.find(p => p.id === promptId);
    if (prompt) {
        const extractedQuestions = this.extractQuestionsFromPrompt(prompt);
        this.updateProgress(promptId, extractedQuestions.length);
    }
}

// Update Progress
updateProgress(promptId, totalQuestions) {
    let filledCount = 0;
    
    // Count filled questions
    for (let i = 0; i < totalQuestions; i++) {
        const input = document.getElementById(`input-${promptId}-${i}`);
        if (input && input.value.trim() !== '') {
            filledCount++;
        }
    }
    
    // Update completion status text
    const completionStatus = document.getElementById(`completion-status-${promptId}`);
    if (completionStatus) {
        completionStatus.textContent = `${filledCount}/${totalQuestions} Fragen beantwortet`;
        
        if (filledCount === totalQuestions) {
            completionStatus.style.background = '#d1fae5';
            completionStatus.style.color = '#065f46';
        } else {
            completionStatus.style.background = '#fef3c7';
            completionStatus.style.color = '#92400e';
        }
    }
    
    // Enable/Disable execute button
    const executeBtn = document.getElementById(`execute-btn-${promptId}`);
    if (executeBtn) {
        if (filledCount === totalQuestions) {
            executeBtn.disabled = false;
            executeBtn.style.opacity = '1';
            executeBtn.style.cursor = 'pointer';
        } else {
            executeBtn.disabled = true;
            executeBtn.style.opacity = '0.5';
            executeBtn.style.cursor = 'not-allowed';
        }
    }
}

// Update Additional Clean
updateAdditionalClean(promptId, value) {
    const placeholder = document.getElementById(`additional-placeholder-${promptId}`);
    
    if (placeholder) {
        if (value && value.trim() !== '') {
            placeholder.style.color = '#22d3ee';
            placeholder.style.fontStyle = 'normal';
            placeholder.style.fontWeight = '600';
            placeholder.textContent = value;
        } else {
            placeholder.style.color = '#64748b';
            placeholder.style.fontStyle = 'italic';
            placeholder.style.fontWeight = 'normal';
            placeholder.textContent = '[Keine zusätzlichen Hinweise]';
        }
    }

    if (!this.userAnswers[promptId]) {
        this.userAnswers[promptId] = {};
    }
    this.userAnswers[promptId]['additional'] = value;
}

// Helper: Build Prompt Text
buildPromptText(prompt, questions) {
    let text = prompt.goal || prompt.name || '';
    if (questions && questions.length > 0) {
        text += '\n\n**🔍 Bitte frage den Nutzer vorab**\n\n';
        questions.forEach((q, idx) => {
            text += `${idx + 1}. ${q.question}\n`;
            if (q.example) text += `   → z.B.: ${q.example}\n`;
            text += '\n';
        });
    }
    return text;
}

/**
 * 2. Smarte Placeholders generieren
 */
getSmartPlaceholder(question, example) {
    const questionLower = question.toLowerCase();
    
    // Wenn Beispiel vorhanden, verwende es
    if (example && example.length > 5) {
        return this.escapeHtml(example);
    }
    
    // Intelligente Placeholders basierend auf Frage
    if (questionLower.includes('entwicklung') && (questionLower.includes('guv') || questionLower.includes('bilanz'))) {
        return 'z.B.: Umsatz +15% auf 5,6 Mio €, EBIT -3% auf 820 T€ durch Personalkostenanstieg';
    }
    if (questionLower.includes('einflüsse') && questionLower.includes('finanzierung')) {
        return 'z.B.: Zinserträge +250 T€ aus Festgeldanlage, außerplanmäßige Abschreibung -180 T€';
    }
    if (questionLower.includes('kennzahlen')) {
        return 'z.B.: EBIT-Marge 14,6%, Cashflow 1,2 Mio €, EK-Quote 45%';
    }
    if (questionLower.includes('vorjahreswerte') || questionLower.includes('benchmark')) {
        return 'z.B.: Ja, Branchendurchschnitt EBIT-Marge 12%, wir liegen bei 14,6%';
    }
    if (questionLower.includes('kosten')) {
        return 'z.B.: Personalkosten 2,1 Mio € (+8%), Materialkosten 1,8 Mio € (+12%)';
    }
    if (questionLower.includes('liquidität')) {
        return 'z.B.: Aktuell 850 T€, mindestens 500 T€ erforderlich, 13-Wochen-Forecast positiv';
    }
    
    // Default
    return 'Ihre Antwort - je detaillierter, desto besser';
}

/**
 * 3. Live Preview mit Validation
 */
updateLivePreviewWithValidation(promptId, fieldIndex, value, questionText) {
    // Update Placeholder (wie vorher)
    const placeholder = document.getElementById(`placeholder-${promptId}-${fieldIndex}`);
    
    if (placeholder) {
        if (value && value.trim() !== '') {
            placeholder.className = 'user-input-highlight';
            placeholder.textContent = value;
        } else {
            placeholder.className = 'placeholder-text';
            placeholder.textContent = '[Eingabe erforderlich]';
        }
    }

    // Update Answers
    if (!this.userAnswers[promptId]) {
        this.userAnswers[promptId] = {};
    }
    this.userAnswers[promptId][fieldIndex] = value;

    // 🆕 VALIDATION & FEEDBACK
    const feedback = document.getElementById(`feedback-${promptId}-${fieldIndex}`);
    if (feedback && value && value.trim() !== '') {
        const validationResult = this.validateInput(value, questionText);
        
        if (validationResult.score >= 80) {
            feedback.innerHTML = `<span style="color: #10b981;">✅ ${validationResult.message}</span>`;
        } else if (validationResult.score >= 50) {
            feedback.innerHTML = `<span style="color: #f59e0b;">💡 ${validationResult.message}</span>`;
        } else {
            feedback.innerHTML = `<span style="color: #ef4444;">⚠️ ${validationResult.message}</span>`;
        }
    }

    // Update Progress & Quality Score
    const prompt = this.allPrompts.find(p => p.id === promptId);
    if (prompt) {
        const extractedQuestions = this.extractQuestionsFromPrompt(prompt);
        this.updateProgress(promptId, extractedQuestions.length);
        this.updateQualityScore(promptId, extractedQuestions.length);
        
        // 🆕 Update Preview Panel Progress
        this.updatePreviewProgress(promptId, extractedQuestions.length);
    }
}

/**
 * 4. Input Validation
 */
validateInput(value, questionText) {
    const questionLower = questionText.toLowerCase();
    let score = 50; // Basis-Score
    let message = 'Eingabe erhalten';
    
    // Längen-Check
    if (value.length < 10) {
        return { score: 20, message: 'Zu kurz! Bitte detaillierter (mindestens 10 Zeichen).' };
    }
    if (value.length >= 20) score += 10;
    if (value.length >= 50) score += 10;
    
    // Zahlen/Prozente für quantitative Fragen
    if (questionLower.includes('entwicklung') || questionLower.includes('kennzahlen') || questionLower.includes('kosten')) {
        if (value.match(/\d/) && (value.includes('%') || value.includes('€') || value.includes('Mio') || value.includes('T€'))) {
            score += 20;
            message = 'Sehr gut! Konkrete Zahlen angegeben.';
        } else {
            score -= 10;
            message = 'Tipp: Fügen Sie Zahlen/Prozente hinzu (z.B. "+15%" oder "2,5 Mio €")';
        }
    }
    
    // Struktur-Check (Kommas, Stichpunkte)
    if (value.includes(',') || value.includes(';') || value.includes('•')) {
        score += 10;
    }
    
    // Final Message
    if (score >= 80) {
        message = 'Exzellent! Sehr detaillierte und strukturierte Eingabe.';
    } else if (score >= 60) {
        message = 'Gut! Eingabe ist ausreichend detailliert.';
    }
    
    return { score: Math.min(score, 100), message };
}

/**
 * 5. Quality Score initialisieren
 */
initializeQualityScore(promptId, totalFields) {
    if (!totalFields) return;
    
    // Initial auf 0
    this.updateQualityScore(promptId, totalFields);
}

/**
 * 6. Quality Score aktualisieren
 */
updateQualityScore(promptId, totalFields) {
    if (!totalFields) return;
    
    let totalScore = 0;
    let filledCount = 0;
    
    // Berechne Score für jedes Feld
    for (let i = 0; i < totalFields; i++) {
        const input = document.getElementById(`input-${promptId}-${i}`);
        if (input && input.value.trim() !== '') {
            filledCount++;
            
            // Einfacher Score: Länge + Zahlen
            let fieldScore = Math.min(input.value.length, 100);
            if (input.value.match(/\d/) && (input.value.includes('%') || input.value.includes('€'))) {
                fieldScore += 20;
            }
            totalScore += Math.min(fieldScore, 100);
        }
    }
    
    // Zusätzliche Hinweise bonus
    const additional = document.getElementById(`additional-${promptId}`);
    if (additional && additional.value.trim() !== '') {
        totalScore += Math.min(additional.value.length / 2, 50);
    }
    
    // Durchschnitt
    const maxScore = totalFields * 100 + 50; // +50 für additional
    const percentScore = Math.round((totalScore / maxScore) * 100);
    
    // Update UI
    const bar = document.getElementById(`quality-bar-${promptId}`);
    const percent = document.getElementById(`quality-percent-${promptId}`);
    const tips = document.getElementById(`quality-tips-${promptId}`);
    
    if (bar) bar.style.width = percentScore + '%';
    if (percent) percent.textContent = percentScore + '%';
    
    if (tips) {
        if (percentScore >= 80) {
            tips.innerHTML = '<span style="color: #10b981;">✅ Exzellente Prompt-Qualität! Bereit für optimale AI-Ergebnisse.</span>';
        } else if (percentScore >= 60) {
            tips.innerHTML = '<span style="color: #f59e0b;">💡 Gute Qualität. Fügen Sie mehr Details hinzu für noch bessere Ergebnisse.</span>';
        } else if (percentScore >= 30) {
            tips.innerHTML = '<span style="color: #ef4444;">⚠️ Basis-Qualität. Mehr Details = besserer Output!</span>';
        } else {
            tips.innerHTML = '<span style="color: #64748b;">Füllen Sie die Felder aus, um die Prompt-Qualität zu erhöhen</span>';
        }
    }
}

renderPreview(prompt, fullPromptText) {
    let preview = this.escapeHtml(fullPromptText);
    
    if (prompt.questions && prompt.questions.length > 0) {
        prompt.questions.forEach((q, idx) => {
            const placeholder = `<span class="placeholder-text" id="placeholder-${prompt.id}-${idx}">[Eingabe erforderlich]</span>`;
            const questionText = this.escapeHtml(q.question);
            
            if (preview.includes(questionText)) {
                preview = preview.replace(questionText, questionText + '\n   → ' + placeholder);
            }
        });
    }
    
    return preview;
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

 async executePrompt(promptId) {
    console.log('executePrompt called with ID:', promptId);
    const previewContent = document.getElementById('code-preview-' + promptId) || document.getElementById('preview-content-' + promptId);
    
    if (!previewContent) {
        console.error('No preview content found!');
        return;
    }
    
    const promptText = previewContent.textContent;
    console.log('Found preview content, creating modal...');
    
    // Create execution modal
    const modal = document.createElement('div');
    modal.className = 'execution-modal';
    
    // Füge inline styles hinzu für den Fall, dass CSS nicht geladen ist
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 99999;';
    
    modal.innerHTML = `
        <div class="execution-modal-content" style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%;">
            <div class="modal-header">
                <h2 class="modal-title">⚡ Prompt ausführen</h2>
                <p class="modal-subtitle">Wähle deine Ausführungsmethode</p>
            </div>
            
            <div class="execution-options">
                <div class="execution-option" style="padding: 15px; margin: 10px 0; border: 1px solid #ccc; border-radius: 8px; cursor: pointer;" onclick="window.promptsEngine.executeWithAI('${promptId}', 'claude')">
                    <div class="option-icon">🤖</div>
                    <div class="option-content">
                        <div class="option-title">Claude AI (Opus)</div>
                        <div class="option-description">
                            Beste Qualität für komplexe Finance-Analysen
                        </div>
                        <span class="option-badge">~0.15€</span>
                    </div>
                </div>
                
                <div class="execution-option" style="padding: 15px; margin: 10px 0; border: 1px solid #ccc; border-radius: 8px; cursor: pointer;" onclick="window.promptsEngine.executeWithAI('${promptId}', 'gpt4')">
                    <div class="option-icon">💚</div>
                    <div class="option-content">
                        <div class="option-title">GPT-4 Turbo</div>
                        <div class="option-description">
                            Schnell und kosteneffizient
                        </div>
                        <span class="option-badge">~0.08€</span>
                    </div>
                </div>
                
                <div class="execution-option" style="padding: 15px; margin: 10px 0; border: 1px solid #ccc; border-radius: 8px; cursor: pointer;" onclick="window.promptsEngine.copyAndClose('${promptId}')">
                    <div class="option-icon">📋</div>
                    <div class="option-content">
                        <div class="option-title">Kopieren & selbst ausführen</div>
                        <div class="option-description">
                            In ChatGPT/Claude.ai einfügen (kostenlos)
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;" onclick="this.closest('.execution-modal').remove()">
                    Abbrechen
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('Modal appended to body!');
    console.log('Modal element:', modal);
    console.log('Modal is in DOM:', document.body.contains(modal));
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

showExecuteModal(promptId) {
    console.log('showExecuteModal called with:', promptId);
    
    // Erstelle das Modal direkt mit allen Styles inline
    const modalHTML = `
        <div id="execute-modal-${promptId}" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            ">
                <h2 style="margin-top: 0;">⚡ Prompt ausführen</h2>
                <p style="color: #666;">Wähle deine Ausführungsmethode:</p>
                
                <div style="margin: 20px 0;">
                    <div style="
                        padding: 15px;
                        margin: 10px 0;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.borderColor='#3b82f6'; this.style.backgroundColor='#f0f9ff';" 
                       onmouseout="this.style.borderColor='#e0e0e0'; this.style.backgroundColor='white';"
                       onclick="window.promptsEngine.executeWithAI('${promptId}', 'claude')">
                        <strong>🤖 Claude AI (Opus)</strong><br>
                        <small>Beste Qualität für komplexe Finance-Analysen (~0.15€)</small>
                    </div>
                    
                    <div style="
                        padding: 15px;
                        margin: 10px 0;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        cursor: pointer;
                    " onmouseover="this.style.borderColor='#3b82f6'; this.style.backgroundColor='#f0f9ff';" 
                       onmouseout="this.style.borderColor='#e0e0e0'; this.style.backgroundColor='white';"
                       onclick="window.promptsEngine.executeWithAI('${promptId}', 'gpt4')">
                        <strong>💚 GPT-4 Turbo</strong><br>
                        <small>Schnell und kosteneffizient (~0.08€)</small>
                    </div>
                    
                    <div style="
                        padding: 15px;
                        margin: 10px 0;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        cursor: pointer;
                    " onmouseover="this.style.borderColor='#3b82f6'; this.style.backgroundColor='#f0f9ff';" 
                       onmouseout="this.style.borderColor='#e0e0e0'; this.style.backgroundColor='white';"
                       onclick="window.promptsEngine.copyToClipboardAndClose('${promptId}')">
                        <strong>📋 Kopieren & selbst ausführen</strong><br>
                        <small>In ChatGPT/Claude.ai einfügen (kostenlos)</small>
                    </div>
                </div>
                
                <button style="
                    padding: 10px 20px;
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    cursor: pointer;
                    width: 100%;
                " onclick="document.getElementById('execute-modal-${promptId}').remove()">
                    Abbrechen
                </button>
            </div>
        </div>
    `;
    
    // Füge das Modal zum Body hinzu
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal inserted into DOM');
}

// Neue Hilfsmethode zum Kopieren und Schließen
copyToClipboardAndClose(promptId) {
    const previewContent = document.getElementById('code-preview-' + promptId);
    if (previewContent) {
        navigator.clipboard.writeText(previewContent.textContent).then(() => {
            alert('✅ Prompt wurde in die Zwischenablage kopiert!');
            document.getElementById('execute-modal-' + promptId).remove();
        });
    }
}

// AI Execution Method
async executeWithAI(promptId, provider) {
    const previewContent = document.getElementById(`code-preview-${promptId}`);
    const promptText = previewContent.textContent;
    const promptData = this.allPrompts.find(p => p.id === promptId);
    
    // Close modal
    const modal = document.querySelector('.execution-modal');
    if (modal) modal.remove();
    
    // Show loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'ai-loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="ai-loading-content">
            <div class="loading-spinner"></div>
            <h3>🤖 AI generiert Ihre Analyse...</h3>
            <p>Dies dauert etwa 15-30 Sekunden</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    try {
        let response;
        
        if (provider === 'claude') {
            response = await fetch('/api/claude', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',  // ✅ RICHTIGES MODELL
                    max_tokens: 4000,
                    messages: [{
                        role: 'user',
                        content: promptText
                    }]
                })
            });
        } else if (provider === 'gpt4') {
            response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4-turbo-preview',
                    messages: [{
                        role: 'user',
                        content: promptText
                    }],
                    max_tokens: 4000
                })
            });
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'API Error');
        }
        
        // Extract the response text
        let resultText;
        if (provider === 'claude') {
            resultText = data.content[0].text;
        } else {
            resultText = data.choices[0].message.content;
        }
        
        // Remove loading
        loadingOverlay.remove();
        
        // Show result
        this.showAIResult(resultText, promptData, provider);
        
    } catch (error) {
        console.error('AI Execution Error:', error);
        loadingOverlay.remove();
        
        alert(`❌ Fehler bei der AI-Ausführung:\n${error.message}\n\nBitte prüfen Sie Ihre API-Konfiguration in Vercel.`);
    }
}

// Show AI Result Method
showAIResult(result, promptData, provider) {
    const resultModal = document.createElement('div');
    resultModal.className = 'ai-result-modal';
    resultModal.innerHTML = `
        <div class="ai-result-container">
            <div class="result-header">
                <div class="result-title">
                    <h2>✨ AI-Analyse abgeschlossen</h2>
                    <span class="provider-badge">${provider === 'claude' ? '🤖 Claude' : '💚 GPT-4'}</span>
                </div>
                <button class="close-btn" onclick="this.closest('.ai-result-modal').remove()">✕</button>
            </div>
            
            <div class="result-meta">
                <div class="meta-item">📄 ${promptData.name}</div>
                <div class="meta-item">⏱️ ${new Date().toLocaleString('de-DE')}</div>
            </div>
            
            <div class="result-content">
                <pre>${result}</pre>
            </div>
            
            <div class="result-actions">
                <button onclick="navigator.clipboard.writeText(this.closest('.ai-result-modal').querySelector('pre').textContent).then(() => alert('✅ Kopiert!'))">
                    📋 Kopieren
                </button>
                <button class="btn-primary" onclick="this.closest('.ai-result-modal').remove()">
                    Schließen
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(resultModal);
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

    // 1. CSS Injection
    injectSplitScreenCSS() {
        if (document.getElementById('split-screen-styles')) return;

        const style = document.createElement('style');
        style.id = 'split-screen-styles';
        style.textContent = `
            .prompt-split-container {
                display: grid;
                grid-template-columns: 40% 60%;
                gap: 24px;
                margin-top: 24px;
            }
            .prompt-summary-sticky {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 24px;
                border-radius: 12px;
                margin-bottom: 20px;
            }
            .prompt-input-panel {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.06);
            }
            .prompt-preview-panel {
                background: white;
                border-radius: 12px;
                padding: 28px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                max-height: calc(100vh - 280px);
                overflow-y: auto;
            }
            .user-input-highlight {
                background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
                padding: 3px 8px;
                border-radius: 6px;
                font-weight: 600;
                color: #065f46;
                border-left: 3px solid #10b981;
                display: inline-block;
                animation: pulse-in 0.4s ease;
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
            .progress-indicator {
                padding: 12px;
                border-radius: 6px;
                font-size: 13px;
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                color: #92400e;
            }
            .progress-indicator.complete {
                background: #f0fdf4;
                border-color: #10b981;
                color: #065f46;
            }
            
            /* AI Loading Overlay */
            .ai-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .ai-loading-content {
                background: white;
                padding: 40px;
                border-radius: 16px;
                text-align: center;
            }
            .loading-spinner {
                width: 60px;
                height: 60px;
                margin: 0 auto 20px;
                border: 4px solid #f3f4f6;
                border-top-color: #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            /* AI Result Modal */
            .ai-result-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            }
            .ai-result-container {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 1200px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
            }
            .result-header {
                padding: 24px;
                border-bottom: 2px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .result-content {
                flex: 1;
                padding: 24px;
                overflow-y: auto;
                background: #f9fafb;
            }
            .result-content pre {
                white-space: pre-wrap;
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #1f2937;
            }
            .result-actions {
                padding: 20px;
                border-top: 2px solid #e5e7eb;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            @media (max-width: 1200px) {
                .prompt-split-container {
                    grid-template-columns: 1fr;
                }
            }
            @media (max-width: 1200px) {
                .prompt-split-container {
                    grid-template-columns: 1fr;
                }
            }
            
            /* Execution Modal */
            .execution-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .execution-modal-content {
                background: white;
                border-radius: 16px;
                padding: 32px;
                width: 90%;
                max-width: 600px;
            }
            .modal-header {
                margin-bottom: 24px;
            }
            .modal-title {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            .modal-subtitle {
                color: #6b7280;
                font-size: 14px;
            }
            .execution-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 24px;
            }
            .execution-option {
                display: flex;
                align-items: center;
                padding: 16px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .execution-option:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
            }
            .option-icon {
                font-size: 32px;
                margin-right: 16px;
            }
            .option-content {
                flex: 1;
            }
            .option-title {
                font-weight: 600;
                margin-bottom: 4px;
            }
            .option-description {
                font-size: 14px;
                color: #6b7280;
            }
            .option-badge {
                background: #fef3c7;
                color: #92400e;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Extract Questions from Prompt Text
        extractQuestionsFromPrompt(prompt) {
        const fullText = prompt.fullPromptText || '';
        
        // Suche nach dem Abschnitt mit den Fragen
        const frageMatch = fullText.match(/(?:🔍\s*Bitte beantworte vorab|💬\s*Bitte beantworte vorab)(?:\s*\(inkl\.\s*Beispielantworten\))?:?\s*\n([\s\S]*?)(?=\n\n(?:✅|📝|💡)|$)/);
        
        if (!frageMatch) {
            // Fallback: Versuche andere Pattern zu finden
            const lines = fullText.split('\n');
            const extractedQuestions = [];
            let inQuestionSection = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Erkenne Fragesektion
                if (line.includes('Bitte beantworte') || line.includes('Welche')) {
                    inQuestionSection = true;
                }
                
                // Extrahiere nummerierte Fragen
                const questionMatch = line.match(/^(\d+)\.\s+(.+?)$/);
                if (inQuestionSection && questionMatch) {
                    const question = {
                        number: parseInt(questionMatch[1]),
                        question: questionMatch[2],
                        example: ''
                    };
                    
                    // Suche nach Beispiel in der nächsten Zeile
                    if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1].trim();
                        if (nextLine.startsWith('→') || nextLine.includes('z.B.') || nextLine.includes('Beispiel:')) {
                            question.example = nextLine.replace(/^→\s*z\.\s*B\.\s*[„"]?|^→\s*|Beispiel:\s*/i, '').replace(/[""]$/, '');
                        }
                    }
                    
                    extractedQuestions.push(question);
                }
                
                // Beende bei Pflichtinhalten oder anderen Sektionen
                if (line.includes('Pflichtinhalte') || line.includes('✅') || (inQuestionSection && line.startsWith('**') && !line.includes('Bitte'))) {
                    break;
                }
            }
            
            return extractedQuestions;
        }
        
        // Parse die gefundenen Fragen
        const frageSection = frageMatch[1];
        const lines = frageSection.split('\n');
        const extractedQuestions = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const questionMatch = line.match(/^(\d+)\.\s+(.+?)$/);
            
            if (questionMatch) {
                const question = {
                    number: parseInt(questionMatch[1]),
                    question: questionMatch[2],
                    example: ''
                };
                
                // Suche nach Beispiel
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine.startsWith('→') || nextLine.includes('z.B.')) {
                        question.example = nextLine.replace(/^→\s*z\.\s*B\.\s*[„"]?|^→\s*/i, '').replace(/[""]$/, '');
                    }
                }
                
                extractedQuestions.push(question);
            }
        }
        
        return extractedQuestions;
    }

    // 3. Render Preview with Placeholders
    renderPreviewWithPlaceholders(prompt, fullPromptText, extractedQuestions) {
        let preview = this.escapeHtml(fullPromptText);
        
        extractedQuestions.forEach((q, idx) => {
            const questionText = this.escapeHtml(q.question);
            const placeholder = `<span class="placeholder-text" id="placeholder-${prompt.id}-${idx}">[Eingabe erforderlich]</span>`;
            
            const patterns = [
                `${q.number}. ${questionText}`,
                questionText
            ];
            
            for (const pattern of patterns) {
                if (preview.includes(pattern)) {
                    preview = preview.replace(
                        pattern,
                        `${pattern}\n   <strong style="color: #0ea5e9;">→ Ihre Eingabe:</strong> ${placeholder}`
                    );
                    break;
                }
            }
        });
        
        if (extractedQuestions.length > 0) {
            const additionalPlaceholder = `<span class="placeholder-text" id="additional-placeholder-${prompt.id}">[Keine zusätzlichen Hinweise]</span>`;
            preview += `\n\n<strong style="color: #0ea5e9;">➕ Zusätzliche Hinweise:</strong>\n${additionalPlaceholder}`;
        }
        
        return preview;
    }

    // 4. Extract Summary
    extractSummary(prompt) {
        let text = prompt.fullPromptText || prompt.goal || '';
        text = text.replace(/\*\*/g, '').replace(/\n/g, ' ');
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        const summary = sentences.slice(0, 2).join(' ');
        return summary.length > 250 ? summary.substring(0, 250) + '...' : summary;
    }

    // 5. Update Live Preview (ÜBERSCHREIBT ALTE METHODE)
    updateLivePreview(promptId, fieldIndex, value, questionText) {
        const placeholder = document.getElementById(`placeholder-${promptId}-${fieldIndex}`);
        
        if (placeholder) {
            if (value && value.trim() !== '') {
                placeholder.className = 'user-input-highlight';
                placeholder.textContent = value;
            } else {
                placeholder.className = 'placeholder-text';
                placeholder.textContent = '[Eingabe erforderlich]';
            }
        }

        if (!this.userAnswers[promptId]) {
            this.userAnswers[promptId] = {};
        }
        this.userAnswers[promptId][fieldIndex] = value;

        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (prompt) {
            const extractedQuestions = this.extractQuestionsFromPrompt(prompt);
            this.updateProgress(promptId, extractedQuestions.length);
        }
    }

    // 6. Update Additional Hints
    updateAdditionalHints(promptId, value) {
        const placeholder = document.getElementById(`additional-placeholder-${promptId}`);
        
        if (placeholder) {
            if (value && value.trim() !== '') {
                placeholder.className = 'user-input-highlight';
                placeholder.style.display = 'block';
                placeholder.style.padding = '12px';
                placeholder.style.marginTop = '8px';
                placeholder.textContent = value;
            } else {
                placeholder.className = 'placeholder-text';
                placeholder.style.display = 'inline';
                placeholder.style.padding = '2px 6px';
                placeholder.style.marginTop = '0';
                placeholder.textContent = '[Keine zusätzlichen Hinweise]';
            }
        }

        if (!this.userAnswers[promptId]) {
            this.userAnswers[promptId] = {};
        }
        this.userAnswers[promptId]['additional'] = value;
    }

    // 🆕 ========== ENDE NEUE METHODEN ==========

    // 🆕 Business Partner Context
    getQuestionContext(question, index, category) {
        const questionLower = question.toLowerCase();
        
        // ========== SPEZIFISCHE PATTERN (Bilanzbuchhalter) ==========
        if (category === 'Bilanzbuchhalter') {
            
            // Bilanzposten / Sachverhalt
            if (questionLower.includes('bilanzposten') || questionLower.includes('sachverhalt')) {
                return 'Präzise Angaben zum Bilanzposten sind essentiell für eine korrekte bilanzielle Behandlung. Je konkreter Ihre Beschreibung, desto besser kann die rechtssichere Einordnung und Dokumentation erfolgen.';
            }
            
            // Entwicklung / GuV / Bilanz
            if (questionLower.includes('entwicklung') || questionLower.includes('guv') || questionLower.includes('bilanz')) {
                return 'Die Entwicklungen in GuV und Bilanz sind das Herzstück Ihrer Finanzberichterstattung. Investoren, Banken und Wirtschaftsprüfer analysieren diese Kennzahlen, um Ihre Unternehmensentwicklung zu bewerten. Geben Sie konkrete Zahlen und Prozente an (z.B. "Umsatz +15%").';
            }
            
            // Standards / HGB / IFRS / US-GAAP
            if (questionLower.includes('standard') || questionLower.includes('hgb') || questionLower.includes('ifrs') || questionLower.includes('gaap') || questionLower.includes('rechnungslegung')) {
                return 'Die Wahl des Rechnungslegungsstandards bestimmt die Bilanzierungs- und Bewertungsmethoden. IFRS und HGB unterscheiden sich erheblich - eine klare Angabe ist für die rechtssichere Bearbeitung zwingend erforderlich.';
            }
            
            // Einflüsse / Finanzierung / Investition
            if (questionLower.includes('einflüsse') || questionLower.includes('einfluss') || questionLower.includes('finanzierung') || questionLower.includes('investition')) {
                return 'Außergewöhnliche Einflüsse aus Finanzierung oder Investitionen müssen separat ausgewiesen werden (§ 277 Abs. 4 HGB). Dies erhöht die Vergleichbarkeit und Transparenz. Nennen Sie konkrete Beträge und Ursachen.';
            }
            
            // Kennzahlen / EBIT / Cashflow / KPI
            if (questionLower.includes('kennzahlen') || questionLower.includes('ebit') || questionLower.includes('cashflow') || questionLower.includes('quote') || questionLower.includes('kpi')) {
                return 'Diese Kennzahlen sind entscheidend für die Beurteilung Ihrer Ertragskraft und Liquidität. Banken nutzen sie für Kreditentscheidungen, Investoren für Bewertungen. Wählen Sie die für Ihre Branche relevanten KPIs.';
            }
            
            // Vorjahreswerte / Benchmark / Vergleich
            if (questionLower.includes('vorjahres') || questionLower.includes('benchmark') || questionLower.includes('vergleich')) {
                return 'Der Vergleich mit Vorjahren oder externen Benchmarks zeigt Trends und positioniert Ihr Unternehmen im Wettbewerb. Dies ist besonders wichtig für Stakeholder-Kommunikation und strategische Entscheidungen.';
            }
            
            // Wirtschaftsgut / Vermögensgegenstand
            if (questionLower.includes('wirtschaftsgut') || questionLower.includes('vermögen')) {
                return 'Die korrekte Identifikation und Klassifizierung von Wirtschaftsgütern ist Basis für Abschreibung, Bewertung und steuerliche Behandlung. Beschreiben Sie Art, Zweck und geplante Nutzungsdauer.';
            }
            
            // Nutzung / Nutzungsdauer
            if (questionLower.includes('nutzung') || questionLower.includes('dauer')) {
                return 'Die voraussichtliche Nutzungsdauer bestimmt Abschreibungsmethode und -dauer. Sie ist relevant für Anlage- vs. Umlaufvermögen und beeinflusst GuV und Bilanz über mehrere Jahre.';
            }
            
            // Zeitraum / Zeitpunkt
            if (questionLower.includes('zeitraum') || questionLower.includes('zeitpunkt') || questionLower.includes('wann') || questionLower.includes('bis wann')) {
                return 'Zeitliche Angaben sind entscheidend für Periodisierung, Stichtagsbewertung und Vollständigkeit. Sie bestimmen in welchem Geschäftsjahr Aufwendungen und Erträge zu erfassen sind.';
            }
            
            // Aufwendungen / Kosten / Ausgaben
            if (questionLower.includes('aufwend') || questionLower.includes('kosten') || questionLower.includes('ausgab')) {
                return 'Detaillierte Aufwendungsanalyse ermöglicht korrekte Zuordnung, Aktivierungsfähigkeit und steuerliche Behandlung. Unterscheiden Sie zwischen Anschaffungs-, Herstellungs- und laufenden Kosten.';
            }
            
            // Abzinsung / Bewertung / Schätzung
            if (questionLower.includes('abzins') || questionLower.includes('bewert') || questionLower.includes('schätz') || questionLower.includes('zinssatz')) {
                return 'Bewertungsparameter wie Abzinsungssätze beeinflussen direkt den Bilanzausweis und haben GuV-Wirkung. Sie müssen sachgerecht begründet und dokumentiert werden (GoB, IAS 1).';
            }
            
            // Steuerliche Aspekte
            if (questionLower.includes('steuer') || questionLower.includes('finanzamt') || questionLower.includes('betriebsprüfung')) {
                return 'Steuerliche Aspekte können von der Handelsbilanz abweichen. Eine klare Dokumentation hilft bei Betriebsprüfungen und sichert steuerliche Anerkennung von Sachverhalten ab.';
            }
        }
        
        // ========== CONTROLLER ==========
        if (category === 'Controller') {
            
            // Kosten / Aufwand
            if (questionLower.includes('kosten') || questionLower.includes('aufwand')) {
                return 'Eine detaillierte Kostenanalyse ist die Basis für fundierte Managemententscheidungen. Unterscheiden Sie zwischen fixen und variablen Kosten, um Hebel für Effizienzsteigerungen zu identifizieren.';
            }
            
            // Budget / Planung / Forecast
            if (questionLower.includes('budget') || questionLower.includes('planung') || questionLower.includes('forecast') || questionLower.includes('plan')) {
                return 'Präzise Budgetierung und Forecasting sind Ihre Kernaufgaben als Business Partner. Managemententscheidungen basieren auf Ihren Zahlen - je besser die Datenqualität, desto besser die Entscheidungen.';
            }
            
            // Abweichung / Analyse / Variance
            if (questionLower.includes('abweichung') || questionLower.includes('analyse') || questionLower.includes('variance')) {
                return 'Abweichungsanalysen decken Potenziale und Risiken auf. Als Business Partner erklären Sie nicht nur "was" abweicht, sondern vor allem "warum" und "was zu tun ist".';
            }
            
            // KPI / Kennzahlen / Metrics
            if (questionLower.includes('kpi') || questionLower.includes('kennzahl') || questionLower.includes('metric')) {
                return 'KPIs sind Ihr Steuerungsinstrument. Wählen Sie Kennzahlen, die wirklich geschäftsrelevant sind und zum Handeln führen - nicht nur "nice to know".';
            }
        }
        
        // ========== TREASURY ==========
        if (category === 'Treasury') {
            
            // Liquidität / Cash
            if (questionLower.includes('liquidität') || questionLower.includes('cash') || questionLower.includes('zahlungsfähig')) {
                return 'Liquiditätssicherung ist Ihre Kernaufgabe. Banken und Management verlassen sich darauf, dass Sie Cashflow-Risiken frühzeitig erkennen und absichern.';
            }
            
            // Finanzierung / Kredit / Darlehen
            if (questionLower.includes('finanzierung') || questionLower.includes('kredit') || questionLower.includes('darlehen')) {
                return 'Die richtige Finanzierungsstruktur optimiert Ihre Kapitalkosten und sichert finanzielle Flexibilität. Berücksichtigen Sie sowohl Kosten als auch strategische Aspekte.';
            }
            
            // Risiko / Hedging / Währung
            if (questionLower.includes('risiko') || questionLower.includes('hedge') || questionLower.includes('währung') || questionLower.includes('zins')) {
                return 'Aktives Risikomanagement schützt vor unerwarteten Verlusten. Dokumentieren Sie Absicherungsstrategien transparent für Wirtschaftsprüfer und Management.';
            }
        }
        
        // ========== CFO ==========
        if (category === 'CFO') {
            
            // Strategie / Transformation
            if (questionLower.includes('strategie') || questionLower.includes('transformation') || questionLower.includes('vision')) {
                return 'Als CFO gestalten Sie die finanzielle Zukunft des Unternehmens. Ihre Antworten sollten strategische Überlegungen und langfristige Auswirkungen berücksichtigen.';
            }
            
            // Kapital / Investition / Allocation
            if (questionLower.includes('kapital') || questionLower.includes('investition') || questionLower.includes('allocation')) {
                return 'Capital Allocation ist eine Ihrer wichtigsten strategischen Entscheidungen. Sie bestimmt, wie Ihr Unternehmen Wert schafft und wächst.';
            }
            
            // M&A / Akquisition
            if (questionLower.includes('m&a') || questionLower.includes('akquisition') || questionLower.includes('übernahme')) {
                return 'M&A-Entscheidungen sind strategische Weichenstellungen. Eine gründliche finanzielle und strategische Bewertung ist entscheidend für den Transaktionserfolg.';
            }
        }
        
        // ========== M&A ==========
        if (category === 'M&A') {
            
            // Due Diligence
            if (questionLower.includes('due diligence') || questionLower.includes('prüfung') || questionLower.includes('dd')) {
                return 'Eine gründliche Due Diligence schützt vor bösen Überraschungen und liefert die Basis für Kaufpreis und Vertragsgestaltung. Je detaillierter, desto besser.';
            }
            
            // Bewertung / Valuation / Preis
            if (questionLower.includes('bewertung') || questionLower.includes('valuation') || questionLower.includes('preis') || questionLower.includes('wert')) {
                return 'Die Unternehmensbewertung ist oft Verhandlungsbasis und bestimmt den Deal-Erfolg. Nutzen Sie mehrere Methoden und Szenarien für Robustheit.';
            }
            
            // Synergien / Integration
            if (questionLower.includes('synergie') || questionLower.includes('integration') || questionLower.includes('pmi')) {
                return 'Synergien sind der Werttreiber vieler Deals. Quantifizieren Sie diese realistisch und planen Sie die Integration sorgfältig - 70% der Deals scheitern in der PMI.';
            }
        }
        
        // ========== GENERISCHE PATTERN (Fallback nach Keyword) ==========
        
        // Projekt / Initiative
        if (questionLower.includes('projekt') || questionLower.includes('initiative')) {
            return 'Klare Projektbeschreibungen ermöglichen bessere Einschätzung von Ressourcenbedarf, Timeline und Risiken. Beschreiben Sie Ziel, Scope und erwartete Ergebnisse.';
        }
        
        // Betrag / Summe / Höhe / Volumen
        if (questionLower.includes('betrag') || questionLower.includes('summe') || questionLower.includes('höhe') || questionLower.includes('volumen') || questionLower.includes('wie hoch') || questionLower.includes('wie viel')) {
            return 'Konkrete Beträge sind essentiell für finanzielle Bewertung und Entscheidungsfindung. Geben Sie Größenordnungen an (z.B. "ca. 250.000 €") für bessere Einordnung.';
        }
        
        // Grund / Ursache / Warum
        if (questionLower.includes('grund') || questionLower.includes('ursache') || questionLower.includes('warum') || questionLower.includes('weshalb')) {
            return 'Die Ursachenanalyse ist entscheidend für die Beurteilung von Einmaligkeit vs. Dauerhaftigkeit. Dies beeinflusst Prognosen, Planung und strategische Maßnahmen.';
        }
        
        // Wie lange / Dauer / Zeitraum
        if (questionLower.includes('wie lange') || questionLower.includes('dauer') || questionLower.includes('zeitraum') || questionLower.includes('frist')) {
            return 'Zeitliche Dimensionen sind wichtig für Planung, Periodisierung und Ressourcenallokation. Geben Sie realistische Zeitrahmen an.';
        }
        
        // Ja/Nein Fragen
        if (questionLower.includes('gibt es') || questionLower.includes('liegt vor') || questionLower.includes('existiert')) {
            return 'Diese Information hilft bei der Vollständigkeitsprüfung und Risikoeinschätzung. Geben Sie auch bei "Nein" eine kurze Begründung an.';
        }
        
        // ========== ULTIMATE FALLBACK ==========
        // Wenn GAR NICHTS matched, dann basierend auf Position
        
        if (index === 0) {
            return 'Diese erste Frage hilft uns, den Kontext und Scope Ihrer Anfrage zu verstehen. Je präziser Ihre Antwort, desto passgenauer wird der AI-Output auf Ihre Situation zugeschnitten.';
        }
        
        if (index === 1) {
            return 'Diese Angabe ergänzt den Kontext und ermöglicht eine differenziertere Bearbeitung. Fügen Sie Details hinzu, die für Ihre spezifische Situation relevant sind.';
        }
        
        // Generischer Fallback für alle anderen
        return `Diese Information ist wichtig für die Vollständigkeit und Qualität der Analyse. Je mehr relevante Details Sie angeben, desto präziser und wertvoller wird das Ergebnis für Ihre Business-Entscheidung. 
        
        💡 Tipp: Nutzen Sie konkrete Zahlen, Beispiele und Kontext aus Ihrer spezifischen Situation.`;
    }

    // 🆕 Smart Placeholders
    getSmartPlaceholder(question, example) {
        const questionLower = question.toLowerCase();
        
        // Wenn Beispiel vorhanden, verwende es
        if (example && example.length > 5) {
            return this.escapeHtml(example);
        }
        
        // Intelligente Placeholders basierend auf Frage
        if (questionLower.includes('entwicklung') && (questionLower.includes('guv') || questionLower.includes('bilanz'))) {
            return 'z.B.: Umsatz +15% auf 5,6 Mio €, EBIT -3% auf 820 T€ durch Personalkostenanstieg';
        }
        if (questionLower.includes('einflüsse') && questionLower.includes('finanzierung')) {
            return 'z.B.: Zinserträge +250 T€ aus Festgeldanlage, außerplanmäßige Abschreibung -180 T€';
        }
        if (questionLower.includes('kennzahlen')) {
            return 'z.B.: EBIT-Marge 14,6%, Cashflow 1,2 Mio €, EK-Quote 45%';
        }
        if (questionLower.includes('vorjahreswerte') || questionLower.includes('benchmark')) {
            return 'z.B.: Ja, Branchendurchschnitt EBIT-Marge 12%, wir liegen bei 14,6%';
        }
        if (questionLower.includes('kosten')) {
            return 'z.B.: Personalkosten 2,1 Mio € (+8%), Materialkosten 1,8 Mio € (+12%)';
        }
        if (questionLower.includes('liquidität')) {
            return 'z.B.: Aktuell 850 T€, mindestens 500 T€ erforderlich, 13-Wochen-Forecast positiv';
        }
        
        // Default
        return 'Ihre Antwort - je detaillierter, desto besser';
    }

    // 🆕 Validation
    updateLivePreviewWithValidation(promptId, fieldIndex, value, questionText) {
        // Update Placeholder (wie vorher)
        const placeholder = document.getElementById(`placeholder-${promptId}-${fieldIndex}`);
        
        if (placeholder) {
            if (value && value.trim() !== '') {
                placeholder.className = 'user-input-highlight';
                placeholder.textContent = value;
            } else {
                placeholder.className = 'placeholder-text';
                placeholder.textContent = '[Eingabe erforderlich]';
            }
        }
    
        // Update Answers
        if (!this.userAnswers[promptId]) {
            this.userAnswers[promptId] = {};
        }
        this.userAnswers[promptId][fieldIndex] = value;
    
        // 🆕 VALIDATION & FEEDBACK
        const feedback = document.getElementById(`feedback-${promptId}-${fieldIndex}`);
        if (feedback && value && value.trim() !== '') {
            const validationResult = this.validateInput(value, questionText);
            
            if (validationResult.score >= 80) {
                feedback.innerHTML = `<span style="color: #10b981;">✅ ${validationResult.message}</span>`;
            } else if (validationResult.score >= 50) {
                feedback.innerHTML = `<span style="color: #f59e0b;">💡 ${validationResult.message}</span>`;
            } else {
                feedback.innerHTML = `<span style="color: #ef4444;">⚠️ ${validationResult.message}</span>`;
            }
        }
    
        // Update Progress & Quality Score
        const prompt = this.allPrompts.find(p => p.id === promptId);
        if (prompt) {
            const extractedQuestions = this.extractQuestionsFromPrompt(prompt);
            this.updateProgress(promptId, extractedQuestions.length);
            this.updateQualityScore(promptId, extractedQuestions.length);
        }
    }

    // 🆕 Input Validation
    validateInput(value, questionText) {
        // ... siehe BUSINESS_PARTNER_UPGRADE.js
    }

    // 🆕 Quality Score Init
    initializeQualityScore(promptId, totalFields) {
        // ... siehe BUSINESS_PARTNER_UPGRADE.js
    }

    // 🆕 Quality Score Update
    updateQualityScore(promptId, totalFields) {
        // ... siehe BUSINESS_PARTNER_UPGRADE.js
    }

    /* ========================================== */
    /* 🆕 EXECUTE & COPY FUNKTIONEN */
    /* ========================================== */

    /**
     * Update Preview Panel Progress
     */
    updatePreviewProgress(promptId, totalQuestions) {
        // Count filled questions
        let filledCount = 0;
        for (let i = 0; i < totalQuestions; i++) {
            const input = document.getElementById(`input-${promptId}-${i}`);
            if (input && input.value.trim()) {
                filledCount++;
            }
        }

        // Update progress text
        const progressText = document.getElementById(`progress-text-${promptId}`);
        if (progressText) {
            progressText.textContent = `${filledCount}/${totalQuestions}`;
        }

        // Update progress bar
        const progressFill = document.getElementById(`progress-fill-${promptId}`);
        if (progressFill) {
            const percentage = (filledCount / totalQuestions) * 100;
            progressFill.style.width = `${percentage}%`;
        }

        // Update completion status and execute button
        const executeBtn = document.getElementById(`execute-btn-${promptId}`);
        const completionStatus = document.getElementById(`completion-status-${promptId}`);

        if (filledCount === totalQuestions) {
            if (executeBtn) executeBtn.disabled = false;
            if (completionStatus) {
                completionStatus.className = 'completion-status complete';
                completionStatus.textContent = '✅ Bereit zur Ausführung!';
            }
        } else {
            if (executeBtn) executeBtn.disabled = true;
            if (completionStatus) {
                completionStatus.className = 'completion-status incomplete';
                const remaining = totalQuestions - filledCount;
                completionStatus.textContent = `⚠️ Noch ${remaining} Frage${remaining > 1 ? 'n' : ''} offen`;
            }
        }
    }

    /**
     * Copy Prompt to Clipboard
     */
    copyPrompt(promptId) {
        const previewContent = document.getElementById(`code-preview-${promptId}`) || document.getElementById(`preview-content-${promptId}`);
        if (!previewContent) {
            console.error('Preview content not found');
            return;
        }

        const text = previewContent.textContent;

        navigator.clipboard.writeText(text).then(() => {
            // Success notification
            const btn = event.target.closest('.btn-preview-copy');
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅ Kopiert!';
                btn.style.background = '#d1fae5';
                btn.style.color = '#065f46';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 2000);
            }
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('❌ Kopieren fehlgeschlagen. Bitte manuell kopieren.');
        });
    }

    /**
     * Execute Prompt - Show Modal
     */
    executePrompt(promptId) {
        const previewContent = document.getElementById(`preview-content-${promptId}`);
        if (!previewContent) return;

        const prompt = previewContent.textContent;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'execution-modal';
        modal.innerHTML = `
            <div class="execution-modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">⚡ Prompt ausführen</h2>
                    <p class="modal-subtitle">Wähle deine Methode</p>
                </div>
                
                <div class="execution-options">
                    <div class="execution-option" onclick="window.promptsEngine.openInClaude('${promptId}')">
                        <div class="option-icon">🤖</div>
                        <div class="option-content">
                            <div class="option-title">In Claude.ai öffnen</div>
                            <div class="option-description">
                                Öffnet neuen Tab mit Claude - Prompt wird in Zwischenablage kopiert
                            </div>
                            <span class="option-badge recommended">Empfohlen</span>
                        </div>
                    </div>
                    
                    <div class="execution-option" onclick="window.promptsEngine.copyAndClose('${promptId}')">
                        <div class="option-icon">📋</div>
                        <div class="option-content">
                            <div class="option-title">Prompt kopieren</div>
                            <div class="option-description">
                                Für eigene AI-Umgebung (ChatGPT, etc.)
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancel" onclick="this.closest('.execution-modal').remove()">
                        Abbrechen
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Open in Claude.ai
     */
    openInClaude(promptId) {
        const previewContent = document.getElementById(`preview-content-${promptId}`);
        if (!previewContent) return;

        const prompt = previewContent.textContent;

        // Close modal
        const modal = document.querySelector('.execution-modal');
        if (modal) modal.remove();

        // Copy to clipboard
        navigator.clipboard.writeText(prompt).then(() => {
            // Open Claude.ai
            window.open('https://claude.ai/new', '_blank');
            
            // Show notification
            alert('✅ Prompt kopiert!\n\nFüge ihn in Claude ein mit Ctrl+V (oder Cmd+V auf Mac)');
        }).catch(err => {
            console.error('Copy failed:', err);
            // Still open Claude even if copy fails
            window.open('https://claude.ai/new', '_blank');
            alert('⚠️ Bitte kopiere den Prompt manuell');
        });
    }

    /**
     * Copy and Close Modal
     */
    copyAndClose(promptId) {
        this.copyPrompt(promptId);
        
        const modal = document.querySelector('.execution-modal');
        if (modal) {
            setTimeout(() => {
                modal.remove();
            }, 100);
        }
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
