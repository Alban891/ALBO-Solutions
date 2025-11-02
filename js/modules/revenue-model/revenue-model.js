// js/modules/revenue-model/revenue-model.js

import { renderRevenueModel } from './revenue-model-router.js';
import { renderMultiArtikelPlanning } from './hardware-model-multi.js';
import { renderArtikelDropdown } from './artikel-dropdown-selector.js';

console.log('💰 Revenue Model Module initialisiert');

// Tab-Switch erweitern
if (window.switchProjektTab) {
    const original = window.switchProjektTab;
    window.switchProjektTab = function(tab) {
        original(tab);
        if (tab === 'revenue-model') {
            initRevenueModel();
        }
    };
}

function initRevenueModel() {
    const container = document.getElementById('projekt-tab-revenue-model');
    if (!container) return;
    
    // Multi-Mode State initialisieren
    if (!window.selectedArtikelIds) {
        window.selectedArtikelIds = [];
    }
    if (typeof window.isMultiPlanningMode === 'undefined') {
        window.isMultiPlanningMode = false;
    }
    
    const state = window.state || window.projektState;
    const projektId = window.cfoDashboard?.currentProjekt;
    
    if (!state || !projektId) return;
    
    const artikel = state.getArtikelByProjekt(projektId);
    if (!artikel || artikel.length === 0) {
        container.innerHTML = '<div style="padding:40px; text-align:center;"><h3>Keine Artikel vorhanden</h3></div>';
        return;
    }
    
    // Debug
    console.log('Alle Artikel:', artikel.map(a => ({
        name: a.name,
        typ: a.typ,
        parent: a.parent_package_id
    })));
    
    // Baue saubere Hierarchie
    const hierarchy = buildCleanHierarchy(artikel);
    
    container.innerHTML = `
        <div style="padding: 24px;">
            
            <!-- DROPDOWN SELECTOR (oben) -->
            <div id="artikel-dropdown-container"></div>
            
            <!-- DETAIL-ANSICHT (Mitte - Inputs für Hardware/Software/Package) -->
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow-y: auto; margin-top: 16px; margin-bottom: 16px;">
                <div id="detail-container" style="padding: 24px;">
                    <div style="text-align: center; padding: 40px 40px; color: #9ca3af;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <p style="font-size: 18px; font-weight: 500;">Wählen Sie einen Artikel aus</p>
                        <p style="font-size: 14px; color: #d1d5db; margin-top: 8px;">
                            Konfigurieren Sie die Parameter, um die Forecast-Tabelle zu befüllen
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- FORECAST-TABELLE (unten - IMMER SICHTBAR!) -->
            <div style="background: white; border: 2px solid #2563eb; border-radius: 12px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">
                        📊 Revenue Forecast
                    </h3>
                    <span style="padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        Basis für PnL & Dashboard
                    </span>
                </div>
                <div id="forecast-table-container">
                    ${renderEmptyForecastTable()}
                </div>
            </div>
            
        </div>
    `;

    window.revenueModelArtikel = artikel;

    // Render Dropdown mit Artikel-Liste
    renderArtikelDropdown(artikel, 'artikel-dropdown-container');

    // ✅ NEU: Auto-restore letzten Artikel beim Tab-Switch
if (window._lastSelectedArtikelId) {
    const lastArtikel = state.getArtikel(window._lastSelectedArtikelId);
    if (lastArtikel) {
        console.log('🔄 Restore letzten Artikel:', lastArtikel.name);
        
        // Set dropdown value
        setTimeout(() => {
            const dropdown = document.getElementById('artikel-dropdown');
            if (dropdown) {
                dropdown.value = lastArtikel.id;
            }
            
            // Auto-load model
            renderRevenueModel(lastArtikel, 'detail-container');
        }, 100);
    }
}

    // ============================================
    // DROPDOWN CALLBACK
    // ============================================

    window.onLoadRevenueModel = async function(artikelList, isMulti) {
    console.log('📊 Dropdown Callback:', isMulti ? 'Multi-Mode' : 'Single-Mode', artikelList);
    
    if (isMulti) {
        // Multi-Artikel Planung
        const artikelIds = artikelList.map(a => a.id);
        renderMultiArtikelPlanning(artikelIds, 'detail-container');
    } else {
        // ✅ FIX: Hole vollständiges Artikel-Objekt aus STATE
        const state = window.state || window.projektState;
        const artikel = state ? state.getArtikel(artikelList[0].id) : null;
        
        if (artikel) {
            console.log('✅ Verwende Artikel aus State:', {
            name: artikel.name,
            typ: artikel.typ,
            hardware: !!artikel.hardware_model_data,
            software: !!artikel.software_model_data,
            service: !!artikel.service_model_data,
            package: !!artikel.package_model_data
        });

        // ✅ Speichere für Auto-Restore beim Tab-Switch
        window._lastSelectedArtikelId = artikel.id;

            await renderRevenueModel(artikel, 'detail-container');
        } else {
            console.error('❌ Artikel nicht im State gefunden:', artikelList[0].id);
        }
    }
    };
    
}  // ← Schließt initRevenueModel()

// ============================================
// LEERE FORECAST-TABELLE (PLATZHALTER)
// ============================================

function renderEmptyForecastTable() {
    return `
        <div style="text-align: center; padding: 60px 40px;">
            <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.2;">📊</div>
            <p style="margin: 0 0 8px; color: #9ca3af; font-size: 16px; font-weight: 500;">
                Keine Forecast-Daten vorhanden
            </p>
            <p style="margin: 0; color: #d1d5db; font-size: 14px;">
                Wählen Sie einen Artikel aus und klicken Sie auf "Revenue Model laden", um die Tabelle zu befüllen
            </p>
            
            <div style="margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px dashed #d1d5db;">
                <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    💡 Diese Tabelle ist die Grundlage für:
                </p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: left;">
                    <div style="padding: 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <div style="font-size: 20px; margin-bottom: 4px;">📈</div>
                        <div style="font-size: 12px; font-weight: 600; color: #374151;">PnL-Kalkulation</div>
                    </div>
                    <div style="padding: 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <div style="font-size: 20px; margin-bottom: 4px;">📊</div>
                        <div style="font-size: 12px; font-weight: 600; color: #374151;">Dashboard-Charts</div>
                    </div>
                    <div style="padding: 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <div style="font-size: 20px; margin-bottom: 4px;">💰</div>
                        <div style="font-size: 12px; font-weight: 600; color: #374151;">Wirtschaftlichkeit</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SAUBERE HIERARCHIE OHNE DUPLIKATE
// ============================================

function buildCleanHierarchy(artikel) {
    const hierarchy = [];
    const processed = new Set();
    
    // Identifiziere Package-System
    // Cyber Security Consulting (ohne " - ") ist das Hauptpackage
    const mainPackage = artikel.find(a => 
        a.name === 'Cyber Security Consulting' && 
        a.typ === 'Package'
    );
    
    if (mainPackage) {
        // Finde die Varianten (die mit " - Small/Medium/Large")
        const variants = artikel.filter(a => 
            a.name && 
            a.name.startsWith('Cyber Security Consulting - ') &&
            a.typ === 'Package'
        );
        
        // Für jede Variante, hole ihre Komponenten basierend auf parent_package_id
        const variantsWithComponents = variants.map(variant => {
            // Bereinige die ID für den Vergleich
            const variantIdClean = variant.id.replace('artikel-db-', '');
            
            // Finde Komponenten dieser Variante
            const components = artikel.filter(comp => 
                comp.parent_package_id === variantIdClean || 
                comp.parent_package_id === variant.id
            );
            
            return {
                variant: variant,
                components: components
            };
        });
        
        // Füge das Package-System zur Hierarchie hinzu
        hierarchy.push({
            type: 'package-system',
            main: mainPackage,
            variants: variantsWithComponents
        });
        
        // Markiere alle als verarbeitet
        processed.add(mainPackage.id);
        variants.forEach(v => processed.add(v.id));
        variantsWithComponents.forEach(vc => {
            vc.components.forEach(c => processed.add(c.id));
        });
    }
    
    // Füge alle anderen nicht-verarbeiteten Artikel hinzu
    artikel.filter(a => !processed.has(a.id) && !a.parent_package_id).forEach(art => {
        hierarchy.push({
            type: 'single',
            artikel: art
        });
    });
    
    return hierarchy;
}

// ============================================
// RENDER SAUBERE HIERARCHIE MIT CHECKBOXEN
// (Diese Funktionen werden aktuell nicht mehr verwendet,
//  können aber für spätere Features behalten werden)
// ============================================

function renderCleanHierarchy(hierarchy) {
    const isMultiMode = window.isMultiPlanningMode || false;
    
    return hierarchy.map(node => {
        if (node.type === 'package-system') {
            return renderPackageSystem(node, isMultiMode);
        } else {
            return renderSingleArtikel(node.artikel, isMultiMode);
        }
    }).join('');
}

function renderPackageSystem(node, isMultiMode) {
    return `
        <div style="margin-bottom: 24px;">
            <!-- Hauptpackage -->
            ${renderArtikelItem(node.main, isMultiMode, 'package-main')}
            
            <!-- Package Varianten eingerückt -->
            <div style="margin-left: 20px;">
                ${node.variants.map(v => `
                    <div style="margin-bottom: 12px;">
                        <!-- Variante (S/M/L) -->
                        ${renderArtikelItem(v.variant, isMultiMode, 'package-variant')}
                        
                        <!-- Komponenten der Variante -->
                        ${v.components.length > 0 ? `
                            <div style="margin-left: 20px;">
                                ${v.components.map(comp => renderArtikelItem(comp, isMultiMode, 'component')).join('')}
                            </div>
                        ` : '<div style="margin-left:40px; color:#9ca3af; font-size:12px;">Keine Komponenten definiert</div>'}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderSingleArtikel(artikel, isMultiMode) {
    return renderArtikelItem(artikel, isMultiMode, 'single');
}

function renderArtikelItem(artikel, isMultiMode, itemType) {
    const isSelected = (window.selectedArtikelIds || []).includes(artikel.id);
    
    // Styling basierend auf Typ
    const styles = {
        'package-main': {
            padding: '12px',
            background: '#1e3a8a',
            color: 'white',
            borderRadius: '8px',
            marginBottom: '8px',
            border: 'none'
        },
        'package-variant': {
            padding: '10px',
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            marginBottom: '6px',
            color: '#1e3a8a'
        },
        'component': {
            padding: '8px 12px',
            background: '#fafafa',
            borderLeft: '2px solid #e5e7eb',
            marginBottom: '2px',
            fontSize: '14px',
            color: '#374151',
            border: 'none'
        },
        'single': {
            padding: '12px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '8px',
            color: '#1f2937'
        }
    };
    
    const style = styles[itemType] || styles['single'];
    const styleStr = Object.entries(style).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';');
    
    const hoverStyle = itemType === 'package-main' ? '' : 
        `onmouseover="if (!${isMultiMode}) { this.style.opacity='0.8'; }"
         onmouseout="if (!${isMultiMode}) { this.style.opacity='1'; }"`;
    
    return `
        <div 
            data-artikel-id="${artikel.id}"
            style="${styleStr}; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;"
            onclick="${isMultiMode ? '' : `selectArtikel('${artikel.id}')`}"
            ${hoverStyle}
        >
            <!-- Checkbox (nur im Multi-Mode) -->
            ${isMultiMode ? `
                <input 
                    type="checkbox" 
                    id="cb-${artikel.id}"
                    ${isSelected ? 'checked' : ''}
                    onclick="window.toggleArtikelSelection('${artikel.id}'); event.stopPropagation();"
                    style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0;"
                >
            ` : ''}
            
            <!-- Artikel Info -->
            <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: ${itemType === 'component' ? '12px' : '16px'};">
                    ${itemType === 'component' ? '└' : '📦'}
                </span>
                <strong style="flex: 1;">
                    ${itemType === 'package-variant' ? artikel.name.split(' - ').pop() : artikel.name}
                </strong>
                ${itemType !== 'package-main' ? `
                    <span style="background: ${getTypeColor(artikel.typ)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; white-space: nowrap;">
                        ${artikel.typ || 'Standard'}
                    </span>
                ` : `
                    <span style="background: white; color: #1e3a8a; padding: 2px 8px; border-radius: 4px; font-size: 11px; white-space: nowrap;">
                        PACKAGE
                    </span>
                `}
            </div>
        </div>
    `;
}

// Helper für Typ-Farben
function getTypeColor(typ) {
    const colors = {
        'Hardware': '#ef4444',
        'Software': '#3b82f6',
        'Software-Perpetual': '#6366f1',
        'Service': '#10b981',
        'Beratung': '#14b8a6',
        'Package': '#8b5cf6'
    };
    return colors[typ] || '#6b7280';
}

// ============================================
// ARTIKEL SELECTION (SINGLE MODE)
// (Diese Funktion wird aktuell nicht verwendet,
//  da wir jetzt den Dropdown nutzen)
// ============================================

window.selectArtikel = function(artikelId) {
    const artikel = window.revenueModelArtikel.find(a => a.id === artikelId);
    if (!artikel) return;
    
    console.log('📊 Artikel ausgewählt:', artikel.name);
    
    // Render single artikel view via router
    renderRevenueModel(artikel, 'detail-container');
};

// ============================================
// MULTI-MODE FUNCTIONS
// (Werden vom Dropdown verwendet)
// ============================================

window.toggleMultiMode = function() {
    window.isMultiPlanningMode = !window.isMultiPlanningMode;
    
    if (!window.isMultiPlanningMode) {
        // Exit multi mode - clear selections
        window.selectedArtikelIds = [];
    }
    
    console.log('Multi-Planning Mode:', window.isMultiPlanningMode ? 'AKTIV' : 'INAKTIV');
    
    // Re-render complete view
    initRevenueModel();
};

window.toggleArtikelSelection = function(artikelId) {
    if (!window.selectedArtikelIds) {
        window.selectedArtikelIds = [];
    }
    
    const index = window.selectedArtikelIds.indexOf(artikelId);
    
    if (index > -1) {
        // Remove from selection
        window.selectedArtikelIds.splice(index, 1);
        console.log('❌ Abgewählt:', artikelId);
    } else {
        // Add to selection
        window.selectedArtikelIds.push(artikelId);
        console.log('✅ Ausgewählt:', artikelId);
    }
    
    console.log('Aktuell ausgewählt:', window.selectedArtikelIds.length, 'Artikel');
    
    // Update UI
    updateMultiActionBar();
};

window.startMultiPlanning = function() {
    const selectedIds = window.selectedArtikelIds || [];
    
    if (selectedIds.length === 0) {
        alert('⚠️ Bitte wähle mindestens einen Artikel aus!');
        return;
    }
    
    if (selectedIds.length > 10) {
        const confirmed = confirm(`Du hast ${selectedIds.length} Artikel ausgewählt. Das kann unübersichtlich werden. Trotzdem fortfahren?`);
        if (!confirmed) return;
    }
    
    console.log('🚀 Starte Multi-Artikel Planung für:', selectedIds.map(id => {
        const a = window.revenueModelArtikel.find(art => art.id === id);
        return a ? a.name : id;
    }));
    
    // Render multi-artikel view
    renderMultiArtikelPlanning(selectedIds, 'detail-container');
};

function updateMultiActionBar() {
    const bar = document.getElementById('multi-action-bar');
    const count = document.getElementById('selection-count');
    
    if (bar) {
        bar.style.display = window.selectedArtikelIds.length > 0 ? 'flex' : 'none';
    }
    
    if (count) {
        count.textContent = window.selectedArtikelIds.length;
    }
}
