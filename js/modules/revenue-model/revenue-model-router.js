/**
 * REVENUE MODEL ROUTER
 * Horvath & Partners Implementation
 * 
 * Intelligente Weiche für verschiedene Artikel-Typen
 * Lädt das passende Revenue Model basierend auf artikel_mode:
 * 
 * - standard → hardware-model.js ✅
 * - package → package-model.js (TODO)
 * - hybrid → hybrid-model.js (TODO)
 * - subscription → subscription-model.js (TODO)
 * - services → services-model.js (TODO)
 * 
 * USAGE:
 * import { renderRevenueModel } from './js/modules/revenue-model/revenue-model-router.js';
 * renderRevenueModel(artikel, 'revenue-model-content');
 */

// Single-Artikel View
import { renderHardwareModel } from './hardware-model.js';

// Multi-Artikel View
import { renderMultiArtikelPlanning } from './hardware-model-multi.js';

// Enhanced Sidebar
import { renderArtikelSidebarWithMultiSelect } from './artikel-sidebar-multi.js';

// Make available globally
window.renderHardwareModel = renderHardwareModel;
window.renderMultiArtikelPlanning = renderMultiArtikelPlanning;

// ==========================================
// MAIN ROUTER
// ==========================================

/**
 * Render appropriate revenue model based on artikel type
 * @param {Object} artikel - Artikel from state
 * @param {string} containerId - DOM container ID
 */
export function renderRevenueModel(artikel, containerId) {
  console.log('🎯 Revenue Model Router called');
  console.log('   Artikel:', artikel.name);
  console.log('   artikel_mode:', artikel.artikel_mode);
  console.log('   typ:', artikel.typ);
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  // Validate artikel
  if (!artikel || !artikel.id) {
    console.error('❌ Invalid artikel object');
    renderErrorState(containerId, 'Ungültiges Artikel-Objekt');
    return;
  }
  
  // Determine which model to use
  const modelType = determineModelType(artikel);
  
  console.log('   → Model Type:', modelType);
  
  // Route to appropriate model
  try {
    switch (modelType) {
      case 'hardware':
        console.log('   → Loading Hardware Model...');
        renderHardwareModel(artikel, containerId);
        break;
      
      case 'package':
        console.log('   → Loading Package Model (Placeholder)...');
        renderPackageModelPlaceholder(artikel, containerId);
        // TODO: import { renderPackageModel } from './package-model.js';
        // renderPackageModel(artikel, containerId);
        break;
      
      case 'hybrid':
        console.log('   → Loading Hybrid Model (Placeholder)...');
        renderHybridModelPlaceholder(artikel, containerId);
        // TODO: import { renderHybridModel } from './hybrid-model.js';
        // renderHybridModel(artikel, containerId);
        break;
      
      case 'subscription':
        console.log('   → Loading Subscription Model (Placeholder)...');
        renderSubscriptionModelPlaceholder(artikel, containerId);
        // TODO: import { renderSubscriptionModel } from './subscription-model.js';
        // renderSubscriptionModel(artikel, containerId);
        break;
      
      case 'services':
        console.log('   → Loading Services Model (Placeholder)...');
        renderServicesModelPlaceholder(artikel, containerId);
        // TODO: import { renderServicesModel } from './services-model.js';
        // renderServicesModel(artikel, containerId);
        break;
      
      default:
        console.warn('   → No model found, using default');
        renderDefaultModel(artikel, containerId);
    }
  } catch (error) {
    console.error('❌ Error rendering revenue model:', error);
    renderErrorState(containerId, error.message);
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get display name for model type
 */
export function getModelTypeName(modelType) {
  const names = {
    'hardware': 'Standard (Hardware)',
    'package': 'Package (Good/Better/Best)',
    'hybrid': 'Hybrid (Multi-Stream)',
    'subscription': 'Subscription (SaaS)',
    'services': 'Services/Consulting'
  };
  return names[modelType] || 'Unbekannt';
}

/**
 * Get icon for model type
 */
export function getModelTypeIcon(modelType) {
  const icons = {
    'hardware': '📦',
    'package': '📊',
    'hybrid': '🔀',
    'subscription': '🔄',
    'services': '👔'
  };
  return icons[modelType] || '📈';
}

/**
 * Check if model is implemented
 */
export function isModelImplemented(modelType) {
  return modelType === 'hardware'; // Only hardware is implemented so far
}

/**
 * Get all available model types
 */
export function getAvailableModelTypes() {
  return [
    { value: 'hardware', label: 'Standard (Hardware)', icon: '📦', implemented: true },
    { value: 'subscription', label: 'Subscription (SaaS)', icon: '🔄', implemented: false },
    { value: 'package', label: 'Package (Varianten)', icon: '📊', implemented: false },
    { value: 'hybrid', label: 'Hybrid (Multi-Stream)', icon: '🔀', implemented: false },
    { value: 'services', label: 'Services/Consulting', icon: '👔', implemented: false }
  ];
}

// ==========================================
// MODEL TYPE DETERMINATION
// ==========================================

/**
 * Determine which revenue model to use
 * Priority: artikel_mode > typ inference > default
 */
function determineModelType(artikel) {
  console.log('   🔍 Determining model type...');
  
  // Priority 1: Explicit artikel_mode
  if (artikel.artikel_mode) {
    console.log('      artikel_mode found:', artikel.artikel_mode);
    
    switch (artikel.artikel_mode) {
      case 'package':
      case 'package-parent':
      case 'package-child':
        return 'package';
      
      case 'hybrid':
      case 'hybrid-parent':
      case 'hybrid-child':
        return 'hybrid';
      
      case 'subscription':
      case 'saas':
        return 'subscription';
      
      case 'services':
      case 'consulting':
        return 'services';
      
      case 'standard':
      case 'hardware':
        return 'hardware';
      
      default:
        console.log('      Unknown artikel_mode, falling back to typ inference');
        // Fall through to typ-based detection
        break;
    }
  }
  
  // Priority 2: Infer from typ
  const typ = (artikel.typ || '').toLowerCase();
  console.log('      Inferring from typ:', typ);
  
  // Subscription indicators
  if (typ.includes('saas') || 
      typ.includes('subscription') || 
      typ.includes('recurring') ||
      typ.includes('software-subscription')) {
    console.log('      → Detected: subscription');
    return 'subscription';
  }
  
  // Services indicators
  if (typ.includes('consulting') || 
      typ.includes('service') || 
      typ.includes('beratung') ||
      typ.includes('wartung')) {
    console.log('      → Detected: services');
    return 'services';
  }
  
  // Package indicators
  if (typ.includes('package') || 
      typ.includes('paket') ||
      typ.includes('bundle')) {
    console.log('      → Detected: package');
    return 'package';
  }
  
  // Software (could be subscription or one-time)
  if (typ.includes('software') || typ.includes('license')) {
    // Check if there's recurring revenue config
    if (artikel.revenue_model_data?.recurring) {
      console.log('      → Detected: subscription (via config)');
      return 'subscription';
    }
    console.log('      → Detected: hardware (one-time software)');
    return 'hardware'; // Treat as one-time sale
  }
  
  // Default: Hardware model (works for most one-time sales)
  console.log('      → Default: hardware');
  return 'hardware';
}

/**
 * Validate artikel object
 */
function validateArtikel(artikel) {
  if (!artikel) {
    throw new Error('Artikel object is null or undefined');
  }
  if (!artikel.id) {
    throw new Error('Artikel has no ID');
  }
  if (!artikel.name) {
    console.warn('⚠️ Artikel has no name');
  }
  return true;
}

// ==========================================
// ERROR HANDLING
// ==========================================

function renderErrorState(containerId, errorMessage) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div style="padding: 60px 40px; text-align: center; background: white; border-radius: 12px;">
      <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
      <h3 style="margin: 0 0 10px; font-size: 24px; color: #991b1b;">Fehler beim Laden</h3>
      <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px;">
        Das Revenue Model konnte nicht geladen werden
      </p>
      <div style="padding: 20px; background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; display: inline-block; max-width: 600px;">
        <p style="margin: 0; color: #991b1b; font-weight: 500; text-align: left;">
          <strong>Fehlermeldung:</strong><br>
          ${errorMessage}
        </p>
      </div>
      <div style="margin-top: 30px;">
        <button 
          class="btn btn-secondary" 
          onclick="window.location.reload()"
          style="padding: 12px 24px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; font-size: 15px; font-weight: 600; cursor: pointer;"
        >
          🔄 Seite neu laden
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// PLACEHOLDER RENDERS (TODO - Future Models)
// ==========================================

function renderPackageModelPlaceholder(artikel, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div style="padding: 60px 40px; background: white; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">📊</div>
        <h3 style="margin: 0 0 10px; font-size: 24px; color: #1f2937;">Package Model</h3>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
          Customer Journey basiertes Revenue Model für Package-Artikel
        </p>
      </div>
      
      <div style="padding: 20px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; margin-bottom: 40px; text-align: center;">
        <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 15px;">
          🚧 In Entwicklung - Wird als nächstes implementiert
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 40px;">
        <div style="padding: 24px; background: #f9fafb; border-radius: 12px;">
          <h4 style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">📈 Revenue Planning</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8; font-size: 14px;">
            <li>Customer Journey Planung</li>
            <li>Neukunden-Akquisition</li>
            <li>Wachstumsmodelle</li>
            <li>Package Mix Entwicklung</li>
          </ul>
        </div>
        
        <div style="padding: 24px; background: #f9fafb; border-radius: 12px;">
          <h4 style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">🎯 Retention & Upsell</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8; font-size: 14px;">
            <li>Churn-Raten pro Package</li>
            <li>Upsell-Matrix (S→M→L)</li>
            <li>Net Revenue Retention</li>
            <li>Kohortenbasierte Analyse</li>
          </ul>
        </div>
      </div>
      
      <div style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
        <h4 style="margin: 0 0 12px; font-size: 16px;">💡 Beispiel-Anwendung</h4>
        <p style="margin: 0; line-height: 1.6; font-size: 14px; opacity: 0.95;">
          <strong>Use Case:</strong> Cyber Security Consulting mit Paketen Basic, Professional, Enterprise.<br>
          Neue Kunden starten bei Basic, 15% upgraden jährlich auf Professional, 10% von Professional auf Enterprise.
        </p>
      </div>
    </div>
  `;
}

function renderHybridModelPlaceholder(artikel, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div style="padding: 60px 40px; background: white; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">🔀</div>
        <h3 style="margin: 0 0 10px; font-size: 24px; color: #1f2937;">Hybrid Model</h3>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
          Multi-Stream Revenue Model für komplexe Produkte
        </p>
      </div>
      
      <div style="padding: 20px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; margin-bottom: 40px; text-align: center;">
        <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 15px;">
          🚧 In Entwicklung - Kommt nach Package Model
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 40px;">
        <div style="padding: 24px; background: #f9fafb; border-radius: 12px;">
          <h4 style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">💰 Revenue Streams</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8; font-size: 14px;">
            <li>One-Time Sale (Hardware)</li>
            <li>Subscription (Software)</li>
            <li>Maintenance Contracts</li>
            <li>Professional Services</li>
            <li>Spare Parts/Consumables</li>
          </ul>
        </div>
        
        <div style="padding: 24px; background: #f9fafb; border-radius: 12px;">
          <h4 style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">📊 Analytics</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8; font-size: 14px;">
            <li>Stream-spezifische Modelle</li>
            <li>Cross-Stream Dependencies</li>
            <li>Attach Rates</li>
            <li>Lifetime Value Berechnung</li>
          </ul>
        </div>
      </div>
      
      <div style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
        <h4 style="margin: 0 0 12px; font-size: 16px;">💡 Beispiel-Anwendung</h4>
        <p style="margin: 0; line-height: 1.6; font-size: 14px; opacity: 0.95;">
          <strong>Use Case:</strong> Roboter-Verkauf @ 50k€ + Software License @ 5k€/Jahr + Maintenance @ 18% + Implementation Service @ 15k€.<br>
          Jeder Stream hat eigene Entwicklungslogik, aber sie sind voneinander abhängig (z.B. Maintenance hängt von Installed Base ab).
        </p>
      </div>
    </div>
  `;
}

function renderSubscriptionModelPlaceholder(artikel, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div style="padding: 60px 40px; background: white; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">🔄</div>
        <h3 style="margin: 0 0 10px; font-size: 24px; color: #1f2937;">Subscription Model</h3>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
          SaaS/Subscription Revenue Model mit Churn & Expansion
        </p>
      </div>
      
      <div style="padding: 20px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; margin-bottom: 40px; text-align: center;">
        <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 15px;">
          🚧 In Entwicklung
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 40px;">
        <div style="padding: 24px; background: #f9fafb; border-radius: 12px;">
          <h4 style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">📈 SaaS Metriken</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8; font-size: 14px;">
            <li>MRR/ARR Tracking</li>
            <li>New/Expansion/Churned MRR</li>
            <li>Net Revenue Retention</li>
            <li>ARPU Development</li>
          </ul>
        </div>
        
        <div style="padding: 24px; background: #f9fafb; border-radius: 12px;">
          <h4 style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">💸 Unit Economics</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8; font-size: 14px;">
            <li>CAC/LTV Ratio</li>
            <li>CAC Payback Period</li>
            <li>Rule of 40</li>
            <li>Kohortenanalyse</li>
          </ul>
        </div>
      </div>
      
      <div style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
        <h4 style="margin: 0 0 12px; font-size: 16px;">💡 Beispiel-Anwendung</h4>
        <p style="margin: 0; line-height: 1.6; font-size: 14px; opacity: 0.95;">
          <strong>Use Case:</strong> SaaS Platform mit 50€/Monat ARPU, 1.200 Neukunden in Jahr 1, 15% Churn, CAC von 500€.<br>
          Modell berechnet MRR-Entwicklung, Net Retention und wann Unit Economics profitabel werden (CAC Payback).
        </p>
      </div>
    </div>
  `;
}

function renderServicesModelPlaceholder(artikel, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div style="padding: 60px 40px; background: white; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">👔</div>
        <h3 style="margin: 0 0 10px; font-size: 24px; color: #1f2937;">Services/Consulting Model</h3>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
          Utilization-basiertes Revenue Model für Beratung & Services
        </p>
      </div>
      
      <div style="padding: 20px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; margin-bottom: 40px; text-align: center;">
        <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 15px;">
          🚧 In Entwicklung
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 40px;">
        <div style="padding: 24px; background: #f9fafb; border-radius: 12px;">
          <h4 style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">👥 Kapazitätsplanung</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8; font-size: 14px;">
            <li>FTE Planung (Hiring Plan)</li>
            <li>Utilization Rate</li>
            <li>Bench Time Management</li>
            <li>Tagessatz/Stundensatz</li>
          </ul>
        </div>
        
        <div style="padding: 24px; background: #f9fafb; border-radius: 12px;">
          <h4 style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">💰 Profitabilität</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8; font-size: 14px;">
            <li>Gross Margin Berechnung</li>
            <li>Revenue per Consultant</li>
            <li>Realization Rate</li>
            <li>Overhead Allocation</li>
          </ul>
        </div>
      </div>
      
      <div style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
        <h4 style="margin: 0 0 12px; font-size: 16px;">💡 Beispiel-Anwendung</h4>
        <p style="margin: 0; line-height: 1.6; font-size: 14px; opacity: 0.95;">
          <strong>Use Case:</strong> Consulting Firm mit 10 Beratern, 220 verfügbare Tage, 75% Utilization, 1.500€ Tagessatz.<br>
          Modell plant Team-Wachstum, Auslastungsentwicklung und berechnet Gross Margin bei Personalkosten von 120k€/FTE.
        </p>
      </div>
    </div>
  `;
}

function renderDefaultModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  const modelType = determineModelType(artikel);
  const suggestedModel = getModelTypeName(modelType);
  
  container.innerHTML = `
    <div style="padding: 60px 40px; background: white; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">📊</div>
        <h3 style="margin: 0 0 10px; font-size: 24px; color: #1f2937;">Revenue Model nicht konfiguriert</h3>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
          Für diesen Artikel wurde noch kein Revenue Model ausgewählt
        </p>
      </div>
      
      <div style="padding: 20px; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; margin-bottom: 40px;">
        <div style="display: flex; gap: 12px; align-items: start;">
          <div style="font-size: 24px;">💡</div>
          <div>
            <p style="margin: 0 0 8px; color: #1e40af; font-weight: 600; font-size: 15px;">
              Empfehlung: ${suggestedModel}
            </p>
            <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
              Basierend auf dem Artikel-Typ "${artikel.typ}" empfehlen wir das ${suggestedModel} Model.
            </p>
          </div>
        </div>
      </div>
      
      <div style="padding: 30px; background: #f9fafb; border-radius: 12px; margin-bottom: 30px;">
        <h4 style="margin: 0 0 16px; color: #1f2937;">Artikel-Informationen</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; font-weight: 500; color: #6b7280; width: 180px;">Name:</td>
            <td style="padding: 12px; color: #1f2937;">${artikel.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; font-weight: 500; color: #6b7280;">Typ:</td>
            <td style="padding: 12px; color: #1f2937;">${artikel.typ || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; font-weight: 500; color: #6b7280;">artikel_mode:</td>
            <td style="padding: 12px; color: #1f2937;">${artikel.artikel_mode || '(nicht gesetzt)'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: 500; color: #6b7280;">Empfohlenes Model:</td>
            <td style="padding: 12px; color: #2563eb; font-weight: 600;">${suggestedModel}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center;">
        <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">
          Um fortzufahren, setzen Sie bitte <code style="padding: 2px 6px; background: #f3f4f6; border-radius: 4px; font-family: monospace;">artikel_mode = '${modelType}'</code> in den Artikel-Stammdaten.
        </p>
        <button 
          class="btn btn-primary" 
          onclick="window.location.reload()"
          style="padding: 12px 24px; border: none; border-radius: 8px; background: #2563eb; color: white; font-size: 15px; font-weight: 600; cursor: pointer;"
        >
          🔄 Seite neu laden
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderRevenueModel,
  determineModelType,
  getModelTypeName,
  getModelTypeIcon,
  isModelImplemented,
  getAvailableModelTypes
};
