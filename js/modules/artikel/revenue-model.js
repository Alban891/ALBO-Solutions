/**
 * ALBO Solutions - Revenue Models (SAFE VERSION)
 * No template literals, simple strings only
 */

// ============================================
// SINGLE-TYPE REVENUE MODELS
// ============================================

export const REVENUE_MODELS = {
  
  'Hardware': {
    id: 'hardware',
    name: 'Hardware',
    icon: '🔧',
    description: 'Physische Produkte mit Stueckzahl-basiertem Verkauf',
    
    metriken: [
      {
        id: 'menge',
        label: 'Menge',
        einheit: 'Stueck',
        placeholder: 'z.B. 1.000',
        beispiel: 1000,
        typ: 'number',
        required: true,
        tooltip: 'Anzahl verkaufter Einheiten'
      },
      {
        id: 'preis',
        label: 'Verkaufspreis',
        einheit: 'Euro/Stueck',
        placeholder: 'z.B. 5.000',
        beispiel: 5000,
        typ: 'currency',
        required: true,
        tooltip: 'Preis pro Einheit'
      },
      {
        id: 'hk',
        label: 'Herstellkosten',
        einheit: 'Euro/Stueck',
        placeholder: 'z.B. 2.000',
        beispiel: 2000,
        typ: 'currency',
        required: true,
        tooltip: 'Material + Fertigungskosten pro Einheit'
      }
    ],
    
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
        description: 'Typische Produktadoption',
        calculate: function(baseVolume, year) {
          const multipliers = [1, 1.2, 1.6, 2.2, 2.6, 2.9, 3.0];
          return baseVolume * (multipliers[year] || multipliers[multipliers.length - 1]);
        }
      },
      { 
        id: 'optimistisch', 
        name: 'Optimistisch (Hockey-Stick)', 
        icon: '🚀',
        description: 'Explosives Wachstum nach Marktdurchbruch',
        calculate: function(baseVolume, year) {
          const multipliers = [1, 1.1, 1.5, 2.5, 4.5, 7.5, 12.0];
          return baseVolume * (multipliers[year] || multipliers[multipliers.length - 1]);
        }
      },
      { 
        id: 'manuell', 
        name: 'Manuell', 
        icon: '✏️',
        description: 'Individuelle Eingabe fuer jedes Jahr'
      }
    ],
    
    calculate: function(data, year) {
      return {
        revenue: data.menge[year] * data.preis[year],
        cogs: data.menge[year] * data.hk[year],
        db2: (data.menge[year] * data.preis[year]) - (data.menge[year] * data.hk[year]),
        db2_percent: ((data.menge[year] * data.preis[year]) - (data.menge[year] * data.hk[year])) / (data.menge[year] * data.preis[year]) * 100
      };
    }
  },
  
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
        einheit: 'Euro/Lizenz',
        placeholder: 'z.B. 499',
        beispiel: 499,
        typ: 'currency',
        required: true,
        tooltip: 'Einmaliger Verkaufspreis pro Lizenz'
      },
      {
        id: 'cogs',
        label: 'COGS',
        einheit: 'Euro/Lizenz',
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
        description: 'Fuer Uebergang zu Subscription-Modell'
      },
      { 
        id: 'manuell', 
        name: 'Manuell', 
        icon: '✏️'
      }
    ],
    
    calculate: function(data, year) {
      return {
        revenue: data.lizenzen[year] * data.preis[year],
        cogs: data.lizenzen[year] * data.cogs[year],
        db2: (data.lizenzen[year] * data.preis[year]) - (data.lizenzen[year] * data.cogs[year]),
        db2_percent: ((data.lizenzen[year] * data.preis[year]) - (data.lizenzen[year] * data.cogs[year])) / (data.lizenzen[year] * data.preis[year]) * 100
      };
    }
  },
  
  'Software-Subscription': {
    id: 'software-subscription',
    name: 'Software (SaaS)',
    icon: '☁️',
    description: 'Recurring Revenue durch monatliche/jaehrliche Subscriptions',
    
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
        einheit: 'Euro/Monat',
        placeholder: 'z.B. 29',
        beispiel: 29,
        typ: 'currency',
        required: true,
        tooltip: 'Monthly Recurring Revenue pro User'
      },
      {
        id: 'cogs',
        label: 'COGS pro User',
        einheit: 'Euro/Monat',
        placeholder: 'z.B. 12',
        beispiel: 12,
        typ: 'currency',
        required: true,
        tooltip: 'Cloud-Hosting & Support Kosten pro User/Monat'
      },
      {
        id: 'cac',
        label: 'CAC',
        einheit: 'Euro',
        placeholder: 'z.B. 150',
        beispiel: 150,
        typ: 'currency',
        required: false,
        tooltip: 'Customer Acquisition Cost (optional)'
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
        calculate: function(baseUsers, year) {
          const multipliers = [1, 3, 9, 18, 36, 72, 144];
          return baseUsers * (multipliers[year] || multipliers[multipliers.length - 1]);
        }
      },
      { 
        id: 'viral', 
        name: 'Viral (exponentiell)', 
        icon: '📈',
        description: 'Exponentielles Wachstum durch Viralitaet',
        calculate: function(baseUsers, year) {
          return baseUsers * Math.pow(2, year);
        }
      },
      { 
        id: 'freemium', 
        name: 'Freemium Conversion', 
        icon: '🎯',
        description: 'Stetige Conversion von Free zu Paid',
        calculate: function(baseUsers, year) {
          return baseUsers * (1 + year * 0.5);
        }
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
    
    calculate: function(data, year) {
      const arr = data.users[year] * data.mrr[year] * 12;
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
  
  'Beratung': {
    id: 'beratung',
    name: 'Beratung',
    icon: '💼',
    description: 'Zeitbasierte Beratungsleistungen (Tagessaetze)',
    
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
        einheit: 'Euro/Tag',
        placeholder: 'z.B. 1.200',
        beispiel: 1200,
        typ: 'currency',
        required: true,
        tooltip: 'Durchschnittlicher Tagessatz'
      },
      {
        id: 'kostensatz',
        label: 'Kostensatz',
        einheit: 'Euro/Tag',
        placeholder: 'z.B. 400',
        beispiel: 400,
        typ: 'currency',
        required: true,
        tooltip: 'Kosten pro Tag (Gehalt + Overhead)'
      }
    ],
    
    mengenentwicklung: [
      { 
        id: 'konstant', 
        name: 'Konstant (Kapazitaet)', 
        icon: '➡️',
        description: 'Gleiche Anzahl Berater',
        calculate: function(basePT, year) {
          return basePT;
        }
      },
      { 
        id: 'team-scaling', 
        name: 'Team Scaling (+20% p.a.)', 
        icon: '👥',
        description: 'Mehr Berater',
        factor: 1.20
      },
      { 
        id: 'projekt-basiert', 
        name: 'Projekt-basiert', 
        icon: '📋',
        description: 'Schwankende Auslastung',
        calculate: function(basePT, year) {
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
    
    calculate: function(data, year) {
      return {
        revenue: data.personentage[year] * data.tagessatz[year],
        cogs: data.personentage[year] * data.kostensatz[year],
        db2: (data.personentage[year] * data.tagessatz[year]) - (data.personentage[year] * data.kostensatz[year]),
        db2_percent: ((data.personentage[year] * data.tagessatz[year]) - (data.personentage[year] * data.kostensatz[year])) / (data.personentage[year] * data.tagessatz[year]) * 100
      };
    }
  }
};

// ============================================
// UNIVERSAL PRICE MODELS
// ============================================

export const UNIVERSAL_PRICE_MODELS = [
  {
    id: 'konstant',
    name: 'Konstant (0% p.a.)',
    icon: '➡️',
    description: 'Preis bleibt unveraendert',
    default: true,
    calculate: function(basePrice, year) {
      return basePrice;
    }
  },
  {
    id: 'inflation',
    name: 'Inflation (+2% p.a.)',
    icon: '📈',
    description: 'Preis steigt um Inflationsrate',
    calculate: function(basePrice, year) {
      return basePrice * Math.pow(1.02, year);
    }
  },
  {
    id: 'premium',
    name: 'Premium (+5% p.a.)',
    icon: '💎',
    description: 'Preis steigt durch Premium-Positioning',
    calculate: function(basePrice, year) {
      return basePrice * Math.pow(1.05, year);
    }
  },
  {
    id: 'competitive',
    name: 'Competitive Pressure (-3% p.a.)',
    icon: '📉',
    description: 'Preis sinkt durch Wettbewerb',
    calculate: function(basePrice, year) {
      return basePrice * Math.pow(0.97, year);
    }
  },
  {
    id: 'manuell',
    name: 'Manuell',
    icon: '✏️',
    description: 'Individuelle Eingabe',
    calculate: null
  }
];

// ============================================
// UNIVERSAL COST MODELS
// ============================================

export const UNIVERSAL_COST_MODELS = [
  {
    id: 'konstant',
    name: 'Konstant (0% p.a.)',
    icon: '➡️',
    description: 'Kosten bleiben unveraendert',
    default: true,
    calculate: function(baseCost, year) {
      return baseCost;
    }
  },
  {
    id: 'inflation',
    name: 'Inflation (+3% p.a.)',
    icon: '📈',
    description: 'Kosten steigen durch Inflation',
    calculate: function(baseCost, year) {
      return baseCost * Math.pow(1.03, year);
    }
  },
  {
    id: 'effizienz',
    name: 'Effizienzgewinne (-5% p.a.)',
    icon: '⚡',
    description: 'Kosten sinken durch Optimierung',
    calculate: function(baseCost, year) {
      return baseCost * Math.pow(0.95, year);
    }
  },
  {
    id: 'skalen',
    name: 'Skaleneffekte',
    icon: '⚙️',
    description: 'Kosten sinken bei steigendem Volumen',
    calculate: function(baseCost, year, volume, baseVolume) {
      const volumeRatio = volume / baseVolume;
      const experienceFactor = Math.pow(volumeRatio, Math.log(0.8) / Math.log(2));
      return baseCost * experienceFactor;
    }
  },
  {
    id: 'manuell',
    name: 'Manuell',
    icon: '✏️',
    description: 'Individuelle Eingabe',
    calculate: null
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getRevenueModel(type) {
  return REVENUE_MODELS[type] || REVENUE_MODELS['Hardware'];
}

export function getAllTypes() {
  return Object.keys(REVENUE_MODELS);
}

export function isValidType(type) {
  return REVENUE_MODELS.hasOwnProperty(type);
}

export function getMetriken(type) {
  const model = getRevenueModel(type);
  return model.metriken;
}

export function getMengenentwicklung(type) {
  const model = getRevenueModel(type);
  return model.mengenentwicklung;
}

export function calculateRevenue(type, data, year) {
  const model = getRevenueModel(type);
  return model.calculate(data, year);
}

export default {
  REVENUE_MODELS: REVENUE_MODELS,
  UNIVERSAL_PRICE_MODELS: UNIVERSAL_PRICE_MODELS,
  UNIVERSAL_COST_MODELS: UNIVERSAL_COST_MODELS,
  getRevenueModel: getRevenueModel,
  getAllTypes: getAllTypes,
  isValidType: isValidType,
  getMetriken: getMetriken,
  getMengenentwicklung: getMengenentwicklung,
  calculateRevenue: calculateRevenue
};
