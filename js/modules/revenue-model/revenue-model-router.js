/**
 * REVENUE MODEL ROUTER - UPDATED
 * Horvath & Partners Implementation
 * 
 * Intelligente Weiche für verschiedene Artikel-Typen
 * Lädt das passende Revenue Model basierend auf artikel_mode
 */

// ==========================================
// IMPORTS - ALL MODELS
// ==========================================

// Single-Artikel Views
import { renderHardwareModel } from './hardware-model.js';
import { renderPackageModel } from './package-model.js';
import { renderSoftwareModel } from './software-model.js';
import { renderServiceModel } from './service-model.js';

// Multi-Artikel View
import { renderMultiArtikelPlanning } from './hardware-model-multi.js';

// Make available globally
window.renderHardwareModel = renderHardwareModel;
window.renderPackageModel = renderPackageModel;
window.renderSoftwareModel = renderSoftwareModel;
window.renderServiceModel = renderServiceModel;
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
        console.log('   → Loading Package Model...');
        renderPackageModel(artikel, containerId);
        break;
      
      case 'software':
        console.log('   → Loading Software Model...');
        renderSoftwareModel(artikel, containerId);
        break;
      
      case 'services':
        console.log('   → Loading Service Model...');
        renderServiceModel(artikel, containerId);
        break;
      
      case 'hybrid':
        console.log('   → Loading Hybrid Model (Placeholder)...');
        renderHybridModelPlaceholder(artikel, containerId);
        // TODO: Hybrid model combines multiple revenue streams
        break;
      
      case 'subscription':
        console.log('   → Routing to Software Model (Subscription Mode)...');
        renderSoftwareModel(artikel, containerId);
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
    'software': 'Software (Perpetual/SaaS)',
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
    'software': '💿',
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
  return ['hardware', 'package', 'software', 'services'].includes(modelType);
}

/**
 * Get all available model types
 */
export function getAvailableModelTypes() {
  return [
    { value: 'hardware', label: 'Standard (Hardware)', icon: '📦', implemented: true },
    { value: 'package', label: 'Package (Varianten)', icon: '📊', implemented: true },
    { value: 'software', label: 'Software (Perpetual/SaaS)', icon: '💿', implemented: true },
    { value: 'services', label: 'Services/Consulting', icon: '👔', implemented: true },
    { value: 'subscription', label: 'Subscription (SaaS)', icon: '🔄', implemented: true },
    { value: 'hybrid', label: 'Hybrid (Multi-Stream)', icon: '🔀', implemented: false }
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
      case 'beratung':
        return 'services';
      
      case 'software':
        return 'software';
      
      case 'standard':
      case 'hardware':
        return 'hardware';
      
      default:
        console.log('      Unknown artikel_mode, falling back to typ');
    }
  }
  
  // Priority 2: Infer from typ
  if (artikel.typ) {
    console.log('      Inferring from typ:', artikel.typ);
    
    const typeLower = artikel.typ.toLowerCase();
    
    // Package detection
    if (typeLower.includes('package')) {
      return 'package';
    }
    
    // Software detection
    if (typeLower.includes('software')) {
      if (typeLower.includes('perpetual')) {
        return 'software';
      }
      if (typeLower.includes('saas') || typeLower.includes('subscription')) {
        return 'subscription';
      }
      return 'software';
    }
    
    // Service detection
    if (typeLower.includes('service') || 
        typeLower.includes('consulting') || 
        typeLower.includes('beratung') ||
        typeLower.includes('implementation')) {
      return 'services';
    }
    
    // Hardware detection (default for physical products)
    if (typeLower.includes('hardware') || 
        typeLower.includes('maschine') ||
        typeLower.includes('roboter') ||
        typeLower.includes('sensor') ||
        typeLower.includes('gerät')) {
      return 'hardware';
    }
  }
  
  // Priority 3: Default (Hardware Model)
  console.log('      No specific type found, defaulting to hardware');
  return 'hardware';
}

// ==========================================
// PLACEHOLDER RENDERS
// ==========================================

function renderHybridModelPlaceholder(artikel, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div style="padding: 60px 40px; background: white; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">🔀</div>
        <h3 style="margin: 0 0 10px; font-size: 24px; color: #1f2937;">Hybrid Model</h3>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
          Multi-Stream Revenue Model mit Cross-Dependencies
        </p>
      </div>
      
      <div style="padding: 20px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; margin-bottom: 40px; text-align: center;">
        <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 15px;">
          🚧 In Entwicklung
        </p>
      </div>
      
      <div style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
        <h4 style="margin: 0 0 12px; font-size: 16px;">💡 Beispiel-Anwendung</h4>
        <p style="margin: 0; line-height: 1.6; font-size: 14px; opacity: 0.95;">
          <strong>Use Case:</strong> Roboter-Verkauf @ 50k€ + Software License @ 5k€/Jahr + Maintenance @ 18% + Implementation Service @ 15k€.<br>
          Jeder Stream hat eigene Entwicklungslogik, aber sie sind voneinander abhängig.
        </p>
      </div>
      
      <div style="margin-top: 24px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px;">
          Für Hybrid-Modelle verwenden Sie aktuell bitte die Multi-Artikel Planung:<br>
          Aktivieren Sie den Multi-Mode und wählen Sie mehrere Artikel aus.
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

function renderErrorState(containerId, errorMessage) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div style="padding: 60px 40px; background: white; border-radius: 12px;">
      <div style="text-align: center;">
        <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
        <h3 style="margin: 0 0 10px; font-size: 24px; color: #ef4444;">Fehler beim Laden</h3>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
          ${errorMessage}
        </p>
        <button 
          onclick="window.location.reload()"
          style="margin-top: 24px; padding: 12px 24px; border: none; border-radius: 8px; background: #2563eb; color: white; font-size: 15px; font-weight: 600; cursor: pointer;"
        >
          🔄 Neu laden
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
