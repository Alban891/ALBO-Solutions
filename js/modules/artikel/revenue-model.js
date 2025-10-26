/**
 * ALBO Solutions - Revenue Models
 * 
 * Comprehensive revenue model configurations for all artikel types
 * Integrates with existing config.js and state.js
 * 
 * ARCHITECTURE:
 * - 7 Single-Type Models (Hardware, Software, Services)
 * - 3 Hybrid-Type Models (Multi-stream revenue)
 * - Type-specific metrics and calculations
 * - Universal development models for Price/Cost
 */

// No external dependencies needed

// ============================================
// SINGLE-TYPE REVENUE MODELS
// ============================================

export const REVENUE_MODELS = {
  
  // ==========================================
  // 1. HARDWARE (Stückbasiert)
  // ==========================================
  'Hardware': {
    id: 'hardware',
    name: 'Hardware',
    icon: '🔧',
    description: 'Physische Produkte mit Stückzahl-basiertem Verkauf',
    
    metriken: [
      {
        id: 'menge',
        label: 'Menge',
        einheit: 'Stück',
        placeholder: 'z.B. 1.000',
        beispiel: 1000,
        typ: 'number',
        required: true,
        tooltip: 'Anzahl verkaufter Einheiten'
      },
      {
        id: 'preis',
        label: 'Verkaufspreis',
        einheit: '€/Stück',
        placeholder: 'z.B. 5.000',
        beispiel: 5000,
        typ: 'currency',
        required: true,
        tooltip: 'Preis pro Einheit'
      },
      {
        id: 'hk',
        label: 'Herstellkosten',
        einheit: '€/Stück',
        placeholder: 'z.B. 2.000',
        beispiel: 2000,
        typ: 'currency',
        required: true,
        tooltip: 'Material + Fertigungskosten pro Einheit'
      }
    ],
    
    // Type-specific volume development models
    mengenentwicklung: [
      { 
        id: 'konservativ', 
        name: 'Konservativ (+15% p.a.)', 
        factor: 1.15,
        icon: '📉',
        description: 'Langsames, stetiges Wachstum'
      },
      { 
        id: 'realistisch', 
        name: 'Realistisch (S-Kurve)', 
        icon: '📊',
        description: 'Typische Produktadoption: langsam → schnell → Sättigung',
        calculate: (baseVolume, year) => {
          // S-Curve: Jahre 1-2 langsam, 3-4 schnell, 5+ Sättigung
          const multipliers = [1, 1.2, 1.6, 2.2, 2.6, 2.9, 3.0];
          return baseVolume * (multipliers[year] || multipliers[multipliers.length - 1]);
        }
      },
      { 
        id: 'optimistisch', 
        name: 'Optimistisch (Hockey-Stick)', 
        icon: '🚀',
        description: 'Explosives Wachstum nach Marktdurchbruch',
        calculate: (baseVolume, year) => {
          // Hockey-Stick: Jahre 1-2 flach, dann explosiv
          const multipliers = [1, 1.1, 1.5, 2.5, 4.5, 7.5, 12.0];
          return baseVolume * (multipliers[year] || multipliers[multipliers.length - 1]);
        }
      },
      { 
        id: 'manuell', 
        name: 'Manuell', 
        icon: '✏️',
        description: 'Individuelle Eingabe für jedes Jahr'
      }
    ],
    
    calculate: (data, year) => ({
      revenue: data.menge[year] * data.preis[year],
      cogs: data.menge[year] * data.hk[year],
      db2: (data.menge[year] * data.preis[year]) - (data.menge[year] * data.hk[year]),
      db2_percent: ((data.menge[year] * data.preis[year]) - (data.menge[year] * data.hk[year])) / (data.menge[year] * data.preis[year]) * 100
    })
  },
  
  // ==========================================
  // 2. SOFTWARE - PERPETUAL LICENSE
  // ==========================================
  'Software-Perpetual': {
    id: 'software-perpetual',
    name: 'Software (Perpetual)',
    icon: '💿',
    description: 'Einmalverkauf von Software-Lizenzen',
    
    metriken: [
      {
        id: 'lizenzen',
        label: 'Lizenzen',
        einheit: 'Anzahl',
        placeholder: 'z.B. 500',
        beispiel: 500,
        typ: 'number',
        required: true,
        tooltip: 'Anzahl verkaufter Lizenzen'
      },
      {
        id: 'preis',
        label: 'Lizenzpreis',
        einheit: '€/Lizenz',
        placeholder: 'z.B. 499',
        beispiel: 499,
        typ: 'currency',
        required: true,
        tooltip: 'Einmaliger Verkaufspreis pro Lizenz'
      },
      {
        id: 'cogs',
        label: 'COGS',
        einheit: '€/Lizenz',
        placeholder: 'z.B. 50',
        beispiel: 50,
        typ: 'currency',
        required: true,
        tooltip: 'Support & Distribution Kosten pro Lizenz'
      }
    ],
    
    mengenentwicklung: [
      { 
        id: 'konservativ', 
        name: 'Konservativ (+10% p.a.)', 
        factor: 1.10,
        icon: '📉'
      },
      { 
        id: 'linear', 
        name: 'Linear (+25% p.a.)', 
        factor: 1.25,
        icon: '📊'
      },
      { 
        id: 'decline', 
        name: 'Auslaufend (-20% p.a.)', 
        factor: 0.80,
        icon: '📉',
        description: 'Für Übergang zu Subscription-Modell'
      },
      { 
        id: 'manuell', 
        name: 'Manuell', 
        icon: '✏️'
      }
    ],
    
    calculate: (data, year) => ({
      revenue: data.lizenzen[year] * data.preis[year],
      cogs: data.lizenzen[year] * data.cogs[year],
      db2: (data.lizenzen[year] * data.preis[year]) - (data.lizenzen[year] * data.cogs[year]),
      db2_percent: ((data.lizenzen[year] * data.preis[year]) - (data.lizenzen[year] * data.cogs[year])) / (data.lizenzen[year] * data.preis[year]) * 100
    })
  },
  
  // ==========================================
  // 3. SOFTWARE - SUBSCRIPTION (SaaS)
  // ==========================================
  'Software-Subscription': {
    id: 'software-subscription',
    name: 'Software (SaaS)',
    icon: '☁️',
    description: 'Recurring Revenue durch monatliche/jährliche Subscriptions',
    
    metriken: [
      {
        id: 'users',
        label: 'Active Users',
        einheit: 'User',
        placeholder: 'z.B. 5.000',
        beispiel: 5000,
        typ: 'number',
        required: true,
        tooltip: 'Anzahl aktiver zahlender User'
      },
      {
        id: 'mrr',
        label: 'MRR pro User',
        einheit: '€/Monat',
        placeholder: 'z.B. 29',
        beispiel: 29,
        typ: 'currency',
        required: true,
        tooltip: 'Monthly Recurring Revenue pro User'
      },
      {
        id: 'cogs',
        label: 'COGS pro User',
        einheit: '€/Monat',
        placeholder: 'z.B. 12',
        beispiel: 12,
        typ: 'currency',
        required: true,
        tooltip: 'Cloud-Hosting & Support Kosten pro User/Monat'
      },
      {
        id: 'cac',
        label: 'CAC',
        einheit: '€',
        placeholder: 'z.B. 150',
        beispiel: 150,
        typ: 'currency',
        required: false,
        tooltip: 'Customer Acquisition Cost (optional für Analyse)'
      },
      {
        id: 'churn',
        label: 'Churn Rate',
        einheit: '%',
        placeholder: 'z.B. 5',
        beispiel: 5,
        typ: 'percent',
        required: false,
        tooltip: 'Monatliche Abwanderungsrate (optional)'
      }
    ],
    
    mengenentwicklung: [
      { 
        id: 'saas-growth', 
        name: 'SaaS Growth (T2D3)', 
        icon: '🚀',
        description: 'Triple-Triple-Double-Double-Double',
        calculate: (baseUsers, year) => {
          const multipliers = [1, 3, 9, 18, 36, 72, 144];
          return baseUsers * (multipliers[year] || multipliers[multipliers.length - 1]);
        }
      },
      { 
        id: 'viral', 
        name: 'Viral (exponentiell)', 
        icon: '📈',
        description: 'Exponentielles Wachstum durch Viralität',
        calculate: (baseUsers, year) => baseUsers * Math.pow(2, year)
      },
      { 
        id: 'freemium', 
        name: 'Freemium Conversion', 
        icon: '🎯',
        description: 'Stetige Conversion von Free zu Paid',
        calculate: (baseUsers, year) => baseUsers * (1 + year * 0.5)
      },
      { 
        id: 'linear', 
        name: 'Linear (+50% p.a.)', 
        factor: 1.50,
        icon: '📊'
      },
      { 
        id: 'manuell', 
        name: 'Manuell', 
        icon: '✏️'
      }
    ],
    
    calculate: (data, year) => {
      const arr = data.users[year] * data.mrr[year] * 12; // Annual Recurring Revenue
      const cogs_annual = data.users[year] * data.cogs[year] * 12;
      return {
        revenue: arr,
        cogs: cogs_annual,
        db2: arr - cogs_annual,
        db2_percent: (arr - cogs_annual) / arr * 100,
        arr: arr,
        mrr: data.users[year] * data.mrr[year]
      };
    }
  },
  
  // ==========================================
  // 4. BERATUNG (Zeitbasiert)
  // ==========================================
  'Beratung': {
    id: 'beratung',
    name: 'Beratung',
    icon: '💼',
    description: 'Zeitbasierte Beratungsleistungen (Tagessätze)',
    
    metriken: [
      {
        id: 'personentage',
        label: 'Personentage',
        einheit: 'PT',
        placeholder: 'z.B. 500',
        beispiel: 500,
        typ: 'number',
        required: true,
        tooltip: 'Anzahl verkaufbarer Personentage pro Jahr'
      },
      {
        id: 'tagessatz',
        label: 'Tagessatz',
        einheit: '€/Tag',
        placeholder: 'z.B. 1.200',
        beispiel: 1200,
        typ: 'currency',
        required: true,
        tooltip: 'Durchschnittlicher Tagessatz'
      },
      {
        id: 'kostensatz',
        label: 'Kostensatz',
        einheit: '€/Tag',
        placeholder: 'z.B. 400',
        beispiel: 400,
        typ: 'currency',
        required: true,
        tooltip: 'Kosten pro Tag (Gehalt + Overhead)'
      },
      {
        id: 'auslastung',
        label: 'Auslastung',
        einheit: '%',
        placeholder: 'z.B. 75',
        beispiel: 75,
        typ: 'percent',
        required: false,
        tooltip: 'Durchschnittliche Berater-Auslastung (optional)'
      }
    ],
    
    mengenentwicklung: [
      { 
        id: 'konstant', 
        name: 'Konstant (Kapazität)', 
        icon: '➡️',
        description: 'Gleiche Anzahl Berater = gleiche PT',
        calculate: (basePT, year) => basePT
      },
      { 
        id: 'team-scaling', 
        name: 'Team Scaling (+20% p.a.)', 
        icon: '👥',
        description: 'Mehr Berater = mehr Kapazität',
        factor: 1.20
      },
      { 
        id: 'projekt-basiert', 
        name: 'Projekt-basiert', 
        icon: '📋',
        description: 'Schwankende Auslastung durch Projekte',
        calculate: (basePT, year) => {
          const pattern = [1.0, 1.3, 0.9, 1.5, 1.1, 1.4, 1.2];
          return basePT * (pattern[year] || 1.2);
        }
      },
      { 
        id: 'manuell', 
        name: 'Manuell', 
        icon: '✏️'
      }
    ],
    
    calculate: (data, year) => ({
      revenue: data.personentage[year] * data.tagessatz[year],
      cogs: data.personentage[year] * data.kostensatz[year],
      db2: (data.personentage[year] * data.tagessatz[year]) - (data.personentage[year] * data.kostensatz[year]),
      db2_percent: ((data.personentage[year] * data.tagessatz[year]) - (data.personentage[year] * data.kostensatz[year])) / (data.personentage[year] * data.tagessatz[year]) * 100
    })
  },
  
  // ==========================================
  // 5. SERVICE (Projektbasiert)
  // ==========================================
  'Service': {
    id: 'service',
    name: 'Service',
    icon: '🛠️',
    description: 'Projektbasierte Services & Implementation',
    
    metriken: [
      {
        id: 'projekte',
        label: 'Projekte',
        einheit: 'Anzahl',
        placeholder: 'z.B. 25',
        beispiel: 25,
        typ: 'number',
        required: true,
        tooltip: 'Anzahl Service-Projekte pro Jahr'
      },
      {
        id: 'projektpreis',
        label: 'Ø Projektpreis',
        einheit: '€/Projekt',
        placeholder: 'z.B. 50.000',
        beispiel: 50000,
        typ: 'currency',
        required: true,
        tooltip: 'Durchschnittlicher Umsatz pro Projekt'
      },
      {
        id: 'projektkosten',
        label: 'Ø Projektkosten',
        einheit: '€/Projekt',
        placeholder: 'z.B. 30.000',
        beispiel: 30000,
        typ: 'currency',
        required: true,
        tooltip: 'Durchschnittliche Kosten pro Projekt'
      }
    ],
    
    mengenentwicklung: [
      { 
        id: 'konstant', 
        name: 'Konstant', 
        icon: '➡️',
        calculate: (baseProjekte, year) => baseProjekte
      },
      { 
        id: 'wachstum', 
        name: 'Wachstum (+30% p.a.)', 
        icon: '📈',
        factor: 1.30
      },
      { 
        id: 'manuell', 
        name: 'Manuell', 
        icon: '✏️'
      }
    ],
    
    calculate: (data, year) => ({
      revenue: data.projekte[year] * data.projektpreis[year],
      cogs: data.projekte[year] * data.projektkosten[year],
      db2: (data.projekte[year] * data.projektpreis[year]) - (data.projekte[year] * data.projektkosten[year]),
      db2_percent: ((data.projekte[year] * data.projektpreis[year]) - (data.projekte[year] * data.projektkosten[year])) / (data.projekte[year] * data.projektpreis[year]) * 100
    })
  },
  
  // ==========================================
  // 6. WARTUNG (Vertragsbasiert)
  // ==========================================
  'Wartung': {
    id: 'wartung',
    name: 'Wartung',
    icon: '🔧',
    description: 'Recurring Wartungsverträge',
    
    metriken: [
      {
        id: 'vertraege',
        label: 'Wartungsverträge',
        einheit: 'Anzahl',
        placeholder: 'z.B. 100',
        beispiel: 100,
        typ: 'number',
        required: true,
        tooltip: 'Anzahl aktiver Wartungsverträge'
      },
      {
        id: 'jahrespreis',
        label: 'Preis/Jahr',
        einheit: '€/Jahr',
        placeholder: 'z.B. 12.000',
        beispiel: 12000,
        typ: 'currency',
        required: true,
        tooltip: 'Jährlicher Vertragspreis'
      },
      {
        id: 'kosten',
        label: 'Kosten/Jahr',
        einheit: '€/Jahr',
        placeholder: 'z.B. 3.000',
        beispiel: 3000,
        typ: 'currency',
        required: true,
        tooltip: 'Jährliche Kosten pro Vertrag (Personal + Material)'
      },
      {
        id: 'renewal_rate',
        label: 'Renewal Rate',
        einheit: '%',
        placeholder: 'z.B. 95',
        beispiel: 95,
        typ: 'percent',
        required: false,
        tooltip: 'Verlängerungsrate (optional)'
      }
    ],
    
    mengenentwicklung: [
      { 
        id: 'installed-base', 
        name: 'Installed Base Growth', 
        icon: '📈',
        description: 'Wächst mit verkaufter Hardware',
        factor: 1.15
      },
      { 
        id: 'konstant', 
        name: 'Konstant (Saturiert)', 
        icon: '➡️',
        calculate: (baseVertraege, year) => baseVertraege
      },
      { 
        id: 'manuell', 
        name: 'Manuell', 
        icon: '✏️'
      }
    ],
    
    calculate: (data, year) => ({
      revenue: data.vertraege[year] * data.jahrespreis[year],
      cogs: data.vertraege[year] * data.kosten[year],
      db2: (data.vertraege[year] * data.jahrespreis[year]) - (data.vertraege[year] * data.kosten[year]),
      db2_percent: ((data.vertraege[year] * data.jahrespreis[year]) - (data.vertraege[year] * data.kosten[year])) / (data.vertraege[year] * data.jahrespreis[year]) * 100
    })
  },
  
  // ==========================================
  // 7. TRAINING (Teilnehmerbasiert)
  // ==========================================
  'Training': {
    id: 'training',
    name: 'Training',
    icon: '🎓',
    description: 'Schulungen & Weiterbildung',
    
    metriken: [
      {
        id: 'teilnehmer',
        label: 'Teilnehmer',
        einheit: 'Anzahl',
        placeholder: 'z.B. 200',
        beispiel: 200,
        typ: 'number',
        required: true,
        tooltip: 'Anzahl Schulungsteilnehmer pro Jahr'
      },
      {
        id: 'preis',
        label: 'Preis/Teilnehmer',
        einheit: '€/Person',
        placeholder: 'z.B. 1.100',
        beispiel: 1100,
        typ: 'currency',
        required: true,
        tooltip: 'Schulungspreis pro Teilnehmer'
      },
      {
        id: 'kosten',
        label: 'Kosten/Teilnehmer',
        einheit: '€/Person',
        placeholder: 'z.B. 300',
        beispiel: 300,
        typ: 'currency',
        required: true,
        tooltip: 'Kosten pro Teilnehmer (Trainer + Material)'
      }
    ],
    
    mengenentwicklung: [
      { 
        id: 'produkt-basiert', 
        name: 'Produkt-basiert', 
        icon: '🔗',
        description: 'Wächst mit Produktverkäufen',
        factor: 1.25
      },
      { 
        id: 'konstant', 
        name: 'Konstant', 
        icon: '➡️',
        calculate: (baseTeilnehmer, year) => baseTeilnehmer
      },
      { 
        id: 'manuell', 
        name: 'Manuell', 
        icon: '✏️'
      }
    ],
    
    calculate: (data, year) => ({
      revenue: data.teilnehmer[year] * data.preis[year],
      cogs: data.teilnehmer[year] * data.kosten[year],
      db2: (data.teilnehmer[year] * data.preis[year]) - (data.teilnehmer[year] * data.kosten[year]),
      db2_percent: ((data.teilnehmer[year] * data.preis[year]) - (data.teilnehmer[year] * data.kosten[year])) / (data.teilnehmer[year] * data.preis[year]) * 100
    })
  }
};

// ============================================
// UNIVERSAL DEVELOPMENT MODELS
// ============================================

/**
 * Universal Price Development Models
 * Work for ALL artikel types
 */
export const UNIVERSAL_PRICE_MODELS = [
  {
    id: 'konstant',
    name: 'Konstant (0% p.a.)',
    icon: '➡️',
    description: 'Preis bleibt über die Jahre unverändert',
    default: true,
    calculate: (basePrice, year) => basePrice
  },
  {
    id: 'inflation',
    name: 'Inflation (+2% p.a.)',
    icon: '📈',
    description: 'Preis steigt jährlich um Inflationsrate',
    calculate: (basePrice, year) => basePrice * Math.pow(1.02, year)
  },
  {
    id: 'premium',
    name: 'Premium (+5% p.a.)',
    icon: '💎',
    description: 'Preis steigt durch Wert-Steigerung/Premium-Positioning',
    calculate: (basePrice, year) => basePrice * Math.pow(1.05, year)
  },
  {
    id: 'competitive',
    name: 'Competitive Pressure (-3% p.a.)',
    icon: '📉',
    description: 'Preis sinkt durch Wettbewerbsdruck',
    calculate: (basePrice, year) => basePrice * Math.pow(0.97, year)
  },
  {
    id: 'manuell',
    name: 'Manuell',
    icon: '✏️',
    description: 'Individuelle Eingabe für jedes Jahr',
    calculate: null
  }
];

/**
 * Universal Cost Development Models
 * Work for ALL artikel types
 */
export const UNIVERSAL_COST_MODELS = [
  {
    id: 'konstant',
    name: 'Konstant (0% p.a.)',
    icon: '➡️',
    description: 'Kosten bleiben über die Jahre unverändert',
    default: true,
    calculate: (baseCost, year) => baseCost
  },
  {
    id: 'inflation',
    name: 'Inflation (+3% p.a.)',
    icon: '📈',
    description: 'Kosten steigen durch Lohn- und Material-Inflation',
    calculate: (baseCost, year) => baseCost * Math.pow(1.03, year)
  },
  {
    id: 'effizienz',
    name: 'Effizienzgewinne (-5% p.a.)',
    icon: '⚡',
    description: 'Kosten sinken durch Prozess-Optimierung und Automatisierung',
    calculate: (baseCost, year) => baseCost * Math.pow(0.95, year)
  },
  {
    id: 'skalen',
    name: 'Skaleneffekte',
    icon: '⚙️',
    description: 'Kosten sinken bei steigendem Volumen (Experience Curve)',
    calculate: (baseCost, year, volume, baseVolume) => {
      const volumeRatio = volume / baseVolume;
      // Experience curve: Kosten sinken um 20% bei Verdopplung
      const experienceFactor = Math.pow(volumeRatio, Math.log(0.8) / Math.log(2));
      return baseCost * experienceFactor;
    }
  },
  {
    id: 'manuell',
    name: 'Manuell',
    icon: '✏️',
    description: 'Individuelle Eingabe für jedes Jahr',
    calculate: null
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get revenue model by type
 */
export function getRevenueModel(type) {
  return REVENUE_MODELS[type] || REVENUE_MODELS['Hardware'];
}

/**
 * Get all available types
 */
export function getAllTypes() {
  return Object.keys(REVENUE_MODELS);
}

/**
 * Check if type is valid
 */
export function isValidType(type) {
  return REVENUE_MODELS.hasOwnProperty(type);
}

/**
 * Get metric configuration for a type
 */
export function getMetriken(type) {
  const model = getRevenueModel(type);
  return model.metriken;
}

/**
 * Get volume development models for a type
 */
export function getMengenentwicklung(type) {
  const model = getRevenueModel(type);
  return model.mengenentwicklung;
}

/**
 * Calculate revenue for a specific type and year
 */
export function calculateRevenue(type, data, year) {
  const model = getRevenueModel(type);
  return model.calculate(data, year);
}

export default {
  REVENUE_MODELS,
  UNIVERSAL_PRICE_MODELS,
  UNIVERSAL_COST_MODELS,
  getRevenueModel,
  getAllTypes,
  isValidType,
  getMetriken,
  getMengenentwicklung,
  calculateRevenue
};
