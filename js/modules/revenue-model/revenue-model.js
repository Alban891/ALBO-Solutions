// js/modules/revenue-model/revenue-model.js

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
            
            <!-- LINKE SEITE: ARTIKEL-BAUM -->
            <div style="width: 380px; background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background: #1e3a8a; color: white; padding: 16px;">
                    <h3 style="margin: 0; font-size: 16px;">📋 Artikel-Struktur</h3>
                </div>
                <div id="artikel-tree" style="padding: 16px; overflow-y: auto; max-height: calc(100% - 60px);">
                    ${renderCleanHierarchy(hierarchy)}
                </div>
            </div>
            
            <!-- RECHTE SEITE: DETAIL-ANSICHT -->
            <div style="flex: 1; background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow-y: auto;">
                <div id="detail-container" style="padding: 24px;">
                    <div style="text-align: center; padding: 80px 40px; color: #9ca3af;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <p style="font-size: 18px; font-weight: 500;">Wählen Sie einen Artikel aus</p>
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
// RENDER SAUBERE HIERARCHIE
// ============================================

function renderCleanHierarchy(hierarchy) {
    return hierarchy.map(node => {
        if (node.type === 'package-system') {
            return `
                <div style="margin-bottom: 24px;">
                    <!-- Hauptpackage mit blauem Hintergrund -->
                    <div onclick="selectArtikel('${node.main.id}')" 
                         style="padding: 12px; background: #1e3a8a; color: white; border-radius: 8px; cursor: pointer; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>📦</span>
                            <strong>${node.main.name}</strong>
                            <span style="background: white; color: #1e3a8a; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: auto;">
                                PACKAGE
                            </span>
                        </div>
                    </div>
                    
                    <!-- Package Varianten eingerückt -->
                    <div style="margin-left: 20px;">
                        ${node.variants.map(v => `
                            <div style="margin-bottom: 12px;">
                                <!-- Variante (S/M/L) -->
                                <div onclick="selectArtikel('${v.variant.id}')"
                                     style="padding: 10px; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; cursor: pointer; margin-bottom: 6px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span>📦</span>
                                        <strong>${v.variant.name.split(' - ').pop()}</strong>
                                    </div>
                                </div>
                                
                                <!-- Komponenten der Variante -->
                                ${v.components.length > 0 ? `
                                    <div style="margin-left: 20px;">
                                        ${v.components.map(comp => `
                                            <div onclick="selectArtikel('${comp.id}')"
                                                 style="padding: 8px 12px; background: #fafafa; border-left: 2px solid #e5e7eb; margin-bottom: 2px; cursor: pointer; font-size: 14px;"
                                                 onmouseover="this.style.background='#f3f4f6'"
                                                 onmouseout="this.style.background='#fafafa'">
                                                <div style="display: flex; align-items: center; gap: 6px;">
                                                    <span style="color: #9ca3af; font-size: 12px;">└</span>
                                                    <span>${comp.name || 'Komponente'}</span>
                                                    <span style="background: ${getTypeColor(comp.typ)}; color: white; padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: auto;">
                                                        ${comp.typ || 'Service'}
                                                    </span>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : '<div style="margin-left:40px; color:#9ca3af; font-size:12px;">Keine Komponenten definiert</div>'}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            // Einzelner Artikel (Robotor, Sensor, etc.)
            return `
                <div onclick="selectArtikel('${node.artikel.id}')"
                     style="padding: 12px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; margin-bottom: 8px;"
                     onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#fafafa'"
                     onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='white'">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>📦</span>
                        <strong>${node.artikel.name}</strong>
                        <span style="background: ${getTypeColor(node.artikel.typ)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: auto;">
                            ${node.artikel.typ || 'Standard'}
                        </span>
                    </div>
                </div>
            `;
        }
    }).join('');
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

window.selectArtikel = function(artikelId) {
    const artikel = window.revenueModelArtikel.find(a => a.id === artikelId);
    if (!artikel) return;
    
    // Highlight selected
    document.querySelectorAll('#artikel-tree > div div').forEach(el => {
        el.style.outline = 'none';
    });
    event.currentTarget.style.outline = '2px solid #3b82f6';
    event.currentTarget.style.outlineOffset = '2px';
    
    const container = document.getElementById('detail-container');
    container.innerHTML = `
        <h2>${artikel.name}</h2>
        <span style="background: ${getTypeColor(artikel.typ)}; color: white; padding: 4px 12px; border-radius: 6px;">
            ${artikel.typ}
        </span>
        <p style="margin-top: 20px;">Details werden geladen...</p>
    `;
};
