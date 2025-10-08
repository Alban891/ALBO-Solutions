/**
 * CFO Dashboard - Central Configuration
 * All constants, benchmarks, rules, and settings
 */

// Supabase Configuration with Environment Variables
export const supabaseConfig = {
  url: 'https://oibmbhkmqkjumtteysvi.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYm1iaGttcWtqdW10dGV5c3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODIyNzMsImV4cCI6MjA3NTE1ODI3M30.ePL5g9d1xcZH3ClX4fA9txuu9l8UmHnaBiBF8nRnL2A'
};

// Application Configuration
export const appConfig = {
  appName: 'ALBO Solutions',
  version: '1.0.0',
  environment: import.meta.env.MODE || 'production'
};

// Main Configuration Object
export const CONFIG = {
  // Dashboard Benchmarks
  benchmarks: {
    db2Margin: {
      excellent: 40,
      good: 35,
      target: 30,
      warning: 25,
      critical: 20
    },
    payback: {
      excellent: 2,
      good: 3,
      acceptable: 4,
      critical: 5
    },
    npv: {
      excellent: 50,
      good: 30,
      acceptable: 10,
      warning: 0
    }
  },

  // Development Models
  models: {
    volume: {
      konservativ: { label: 'Konservativ', growth: 0.15, icon: '📉' },
      realistisch: { label: 'Realistisch (S-Curve)', growth: 0.25, icon: '📊' },
      optimistisch: { label: 'Optimistisch', growth: 0.40, icon: '📈' },
      rogers: { label: 'Rogers Adoption', growth: 0.30, icon: '👥' },
      bass: { label: 'Bass Diffusion', growth: 0.35, icon: '🌊' },
      manuell: { label: 'Manuell', growth: 0, icon: '✏️' }
    },
    price: {
      konstant: { label: 'Konstant', change: 0, icon: '➡️' },
      inflation: { label: 'Inflation (+2%)', change: 0.02, icon: '📈' },
      premium: { label: 'Premium (+5%)', change: 0.05, icon: '💎' },
      skimming: { label: 'Price Skimming (-3%)', change: -0.03, icon: '📉' },
      manuell: { label: 'Manuell', change: 0, icon: '✏️' }
    },
    cost: {
      konstant: { label: 'Konstant', change: 0, icon: '➡️' },
      lernkurve: { label: 'Lernkurve (-5%)', change: -0.05, icon: '📚' },
      inflation: { label: 'Inflation (+3%)', change: 0.03, icon: '📈' },
      skaleneffekte: { label: 'Skaleneffekte', change: -0.10, icon: '⚙️' },
      manuell: { label: 'Manuell', change: 0, icon: '✏️' }
    }
  },

  // Project Cost Rules (KI-Engine)
  projektKostenRegeln: {
    software: {
      titel: 'Software-Entwicklung',
      empfohleneBlöcke: [
        { id: 'personal', name: 'Personal', icon: '👥', anteil: 70 },
        { id: 'cloud', name: 'Cloud & Infrastructure', icon: '☁️', anteil: 15 },
        { id: 'lizenzen', name: 'Software-Lizenzen', icon: '💿', anteil: 10 },
        { id: 'testing', name: 'Testing & QA', icon: '🧪', anteil: 5 }
      ],
      vorlaufzeit: 12,
      nachlaufzeit: 24
    },
    hardware: {
      titel: 'Hardware-Entwicklung',
      empfohleneBlöcke: [
        { id: 'personal', name: 'Personal', icon: '👥', anteil: 40 },
        { id: 'material', name: 'Material & Prototypen', icon: '🔧', anteil: 30 },
        { id: 'werkzeuge', name: 'Werkzeuge & Formen', icon: '⚙️', anteil: 20 },
        { id: 'zertifizierung', name: 'Zertifizierung', icon: '📋', anteil: 10 }
      ],
      vorlaufzeit: 18,
      nachlaufzeit: 12
    },
    service: {
      titel: 'Service/Beratung',
      empfohleneBlöcke: [
        { id: 'personal', name: 'Personal', icon: '👥', anteil: 80 },
        { id: 'schulung', name: 'Schulungen', icon: '🎓', anteil: 15 },
        { id: 'reise', name: 'Reisekosten', icon: '✈️', anteil: 5 }
      ],
      vorlaufzeit: 3,
      nachlaufzeit: 36
    },
    hybrid: {
      titel: 'Hybrid-Lösung',
      empfohleneBlöcke: [
        { id: 'personal', name: 'Personal', icon: '👥', anteil: 50 },
        { id: 'hardware', name: 'Hardware-Komponenten', icon: '🖥️', anteil: 20 },
        { id: 'software', name: 'Software-Lizenzen', icon: '💿', anteil: 15 },
        { id: 'beratung', name: 'Consulting & Setup', icon: '💼', anteil: 10 },
        { id: 'schulung', name: 'Schulung & Support', icon: '🎓', anteil: 5 }
      ],
      vorlaufzeit: 12,
      nachlaufzeit: 24
    }
  },

  // Chart Colors
  colors: {
    primary: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gray: '#6b7280',
    purple: '#8b5cf6'
  },

  // Date Range
  years: [2024, 2025, 2026, 2027, 2028, 2029, 2030],

  // Default Values
  defaults: {
    zeitraum: 5,
    marketVolume: 100,
    pricePremium: 100,
    capexRisk: 100,
    wacc: 0.08
  }
};

export default CONFIG;
