/**
 * Configuration Template
 * 
 * SETUP INSTRUCTIONS:
 * 1. Rename this file to: config.js
 * 2. Replace the placeholder values with your actual Supabase credentials
 * 3. Get your credentials from: https://supabase.com/dashboard
 */

export default {
  // Supabase Configuration
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY_HERE',

  // Years for analysis
  years: [2024, 2025, 2026, 2027, 2028, 2029, 2030],

  // Chart Colors
  colors: {
    primary: '#2563eb',
    secondary: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gray: '#6b7280'
  },

  // Database Tables
  tables: {
    projekte: 'projekte',
    artikel: 'artikel'
  },

  // Cost Rules by Project Type
  projektKostenRegeln: {
    software: {
      titel: 'Software-Projekt',
      empfohleneBlöcke: [
        { name: 'Personal (Entwicklung)', anteil: 60, icon: '👨‍💻' },
        { name: 'Infrastruktur & Cloud', anteil: 15, icon: '☁️' },
        { name: 'Lizenzen & Tools', anteil: 10, icon: '🔧' },
        { name: 'Marketing & Vertrieb', anteil: 10, icon: '📢' },
        { name: 'Sonstiges', anteil: 5, icon: '📊' }
      ],
      vorlaufzeit: 6,
      nachlaufzeit: 36
    },
    hardware: {
      titel: 'Hardware-Projekt',
      empfohleneBlöcke: [
        { name: 'Entwicklung & Engineering', anteil: 40, icon: '⚙️' },
        { name: 'Produktion & Fertigung', anteil: 30, icon: '🏭' },
        { name: 'Material & Komponenten', anteil: 15, icon: '📦' },
        { name: 'Qualitätssicherung', anteil: 10, icon: '✅' },
        { name: 'Sonstiges', anteil: 5, icon: '📊' }
      ],
      vorlaufzeit: 12,
      nachlaufzeit: 24
    },
    service: {
      titel: 'Service-Projekt',
      empfohleneBlöcke: [
        { name: 'Personal (Service)', anteil: 70, icon: '👥' },
        { name: 'Training & Schulung', anteil: 15, icon: '📚' },
        { name: 'Marketing & Akquise', anteil: 10, icon: '📢' },
        { name: 'Sonstiges', anteil: 5, icon: '📊' }
      ],
      vorlaufzeit: 3,
      nachlaufzeit: 24
    },
    hybrid: {
      titel: 'Hybrid-Projekt',
      empfohleneBlöcke: [
        { name: 'Entwicklung (HW+SW)', anteil: 45, icon: '💻' },
        { name: 'Produktion', anteil: 25, icon: '🏭' },
        { name: 'Service & Support', anteil: 15, icon: '🛠️' },
        { name: 'Marketing', anteil: 10, icon: '📢' },
        { name: 'Sonstiges', anteil: 5, icon: '📊' }
      ],
      vorlaufzeit: 9,
      nachlaufzeit: 30
    }
  }
};