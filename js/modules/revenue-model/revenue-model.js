// js/modules/revenue-model/revenue-model.js

import { renderRevenueModel } from './revenue-model-router.js';
import { renderMultiArtikelPlanning } from './hardware-model-multi.js';

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
        <div style="display: flex; height: calc(100vh - 300px); gap: 24px; padding: 24px;">
            
            <!-- LINKE SEITE: ARTIKEL-BAUM MIT MULTI-MODE -->
            <div style="width: 380px; background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                
                <!-- Header mit Multi-Toggle -->
                <div style="background: #1e3a8a; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 16px;">📋 Artikel-Struktur</h3>
                    
                    <!-- Multi-Mode Toggle Button -->
                    <button 
                        id="multi-mode-toggle"
                        onclick="window.toggleMultiMode()"
                        style="padding: 6px 12px; border: 2px solid white; border-radius: 6px; background: ${window.isMultiPlanningMode ? 'white' : 'transparent'}; color: ${window.isMultiPlanningMode ? '#1e3a8a' : 'white'}; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                        title="Multi-Artikel Planung aktivieren"
                        onmouseover="if (!${window.isMultiPlanningMode}) { this.style.background='rgba(255,255,255,0.2)'; }"
                        onmouseout="if (!${window.isMultiPlanningMode}) { this.style.background='transparent'; }"
                    >
                        ${window.isMultiPlanningMode ? '☑️ Multi' : '☐ Multi'}
                    </button>
                </div>
                
                <!-- Artikel Tree -->
                <div id="artikel-tree" style="flex: 1; padding: 16px; overflow-y: auto;">
                    ${renderCleanHierarchy(hierarchy)}
                </div>
                
                <!-- Multi-Action Bar (nur sichtbar wenn Artikel ausgewählt) -->
                <div id="multi-action-bar" style="display: ${window.selectedArtikelIds.length > 0 ? 'flex' : 'none'}; flex-direction: column; gap: 10px; padding: 16px; background: #f9fafb; border-top: 2px solid #e5e7eb;">
                    <div style="padding: 8px; background: #dbeafe; border: 2px solid #3b82f6; border-radius: 6px; text-align: center; font-size: 12px; font-weight: 600; color: #1e40af;">
                        <span id="selection-count">${window.selectedArtikelIds.length}</span> ausgewählt
                    </div>
                    <button 
                        onclick="window.startMultiPlanning()"
                        style="width: 100%; padding: 12px; border: none; border-radius: 6px; background: #2563eb; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                        onmouseover="this.style.background='#1d4ed8'; this.style.transform='translateY(-1px)'"
                        onmouseout="this.style.background='#2563eb'; this.style.transform='translateY(0)'"
                    >
                        📊 Kombiniert planen
                    </button>
                </div>
            </div>
            
            <!-- RECHTE SEITE: DETAIL-ANSICHT -->
            <div style="flex: 1; background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow-y: auto;">
                <div id="detail-container" style="padding: 24px;">
                    <div style="text-align: center; padding: 80px 40px; color: #9ca3af;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <p style="font-size: 18px; font-weight: 500;">Wählen Sie einen Artikel aus</p>
                        <p style="font-size: 14px; color: #d1d5db; margin-top: 8px;">
                            Oder aktivieren Sie den Multi-Mode für kombinierte Planung
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    window.revenueModelArtikel = artikel;
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
// ============================================

window.selectArtikel = function(artikelId) {
    const artikel = window.revenueModelArtikel.find(a => a.id === artikelId);
    if (!artikel) return;
    
    console.log('📊 Artikel ausgewählt:', artikel.name);
    
    // Highlight selected in tree
    document.querySelectorAll('#artikel-tree [data-artikel-id]').forEach(el => {
        el.style.outline = 'none';
    });
    
    const currentElement = document.querySelector(`[data-artikel-id="${artikelId}"]`);
    if (currentElement) {
        currentElement.style.outline = '2px solid #3b82f6';
        currentElement.style.outlineOffset = '2px';
    }
    
    // Render single artikel view via router
    renderRevenueModel(artikel, 'detail-container');
};

// ============================================
// MULTI-MODE FUNCTIONS
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
