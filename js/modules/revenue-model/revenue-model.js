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
    
    // Baue Hierarchie basierend auf parent_package_id
    const hierarchy = buildHierarchyFromParentIds(artikel);
    
    container.innerHTML = `
        <div style="display: flex; height: calc(100vh - 300px); gap: 24px; padding: 24px;">
            
            <!-- LINKE SEITE: ARTIKEL-BAUM -->
            <div style="width: 380px; background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background: #1e3a8a; color: white; padding: 16px;">
                    <h3 style="margin: 0; font-size: 16px;">📋 Artikel-Struktur</h3>
                </div>
                <div id="artikel-tree" style="padding: 16px; overflow-y: auto; max-height: calc(100% - 60px);">
                    ${renderHierarchy(hierarchy)}
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
// HIERARCHIE AUS PARENT_PACKAGE_ID AUFBAUEN
// ============================================

function buildHierarchyFromParentIds(artikel) {
    const hierarchy = [];
    const processed = new Set();
    
    // Schritt 1: Finde alle Top-Level Artikel (keine parent_package_id)
    const topLevel = artikel.filter(a => !a.parent_package_id);
    
    topLevel.forEach(parent => {
        // Prüfe ob es ein Package-System ist (hat Children)
        const parentIdVariants = [
            parent.id,
            parent.id.replace('artikel-db-', ''),
            'artikel-db-' + parent.id
        ];
        
        const children = artikel.filter(child => 
            child.parent_package_id && 
            parentIdVariants.includes(child.parent_package_id)
        );
        
        if (children.length > 0) {
            // Es ist ein Package mit Kindern
            // Prüfe ob die Kinder selbst auch Kinder haben (nested packages)
            const enrichedChildren = children.map(child => {
                const childIdVariants = [
                    child.id,
                    child.id.replace('artikel-db-', ''),
                    'artikel-db-' + child.id
                ];
                
                const grandChildren = artikel.filter(gc => 
                    gc.parent_package_id && 
                    childIdVariants.includes(gc.parent_package_id)
                );
                
                return {
                    artikel: child,
                    children: grandChildren
                };
            });
            
            hierarchy.push({
                type: 'package',
                artikel: parent,
                children: enrichedChildren
            });
            
            processed.add(parent.id);
            children.forEach(c => processed.add(c.id));
            enrichedChildren.forEach(ec => {
                ec.children.forEach(gc => processed.add(gc.id));
            });
            
        } else if (parent.name && parent.name.includes('Consulting') && !parent.name.includes(' - ')) {
            // Spezialfall: Hauptpackage ohne direkte Kinder (Varianten sind separate Artikel)
            const variants = topLevel.filter(v => 
                v.name && v.name.startsWith(parent.name) && 
                (v.name.includes(' - Small') || v.name.includes(' - Medium') || v.name.includes(' - Large'))
            );
            
            const variantsWithChildren = variants.map(v => {
                const vIdVariants = [
                    v.id,
                    v.id.replace('artikel-db-', ''),
                    'artikel-db-' + v.id
                ];
                
                const vChildren = artikel.filter(child => 
                    child.parent_package_id && 
                    vIdVariants.includes(child.parent_package_id)
                );
                
                return {
                    artikel: v,
                    children: vChildren
                };
            });
            
            if (variants.length > 0) {
                hierarchy.push({
                    type: 'package-system',
                    artikel: parent,
                    children: variantsWithChildren
                });
                
                processed.add(parent.id);
                variants.forEach(v => processed.add(v.id));
                variantsWithChildren.forEach(vc => {
                    vc.children.forEach(c => processed.add(c.id));
                });
            } else {
                // Einzelner Artikel
                hierarchy.push({
                    type: 'single',
                    artikel: parent
                });
                processed.add(parent.id);
            }
        } else {
            // Einzelner Artikel ohne Kinder
            hierarchy.push({
                type: 'single',
                artikel: parent
            });
            processed.add(parent.id);
        }
    });
    
    // Füge nicht verarbeitete Artikel hinzu
    artikel.filter(a => !processed.has(a.id)).forEach(a => {
        if (!a.parent_package_id) {
            hierarchy.push({
                type: 'single',
                artikel: a
            });
        }
    });
    
    return hierarchy;
}

// ============================================
// RENDER HIERARCHIE
// ============================================

function renderHierarchy(hierarchy) {
    return hierarchy.map(node => {
        if (node.type === 'package-system') {
            // Package mit Varianten (S/M/L)
            return `
                <div style="margin-bottom: 24px;">
                    <!-- Hauptpackage -->
                    <div onclick="selectArtikel('${node.artikel.id}')" 
                         style="padding: 12px; background: #1e3a8a; color: white; border-radius: 8px; cursor: pointer; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>📦</span>
                            <strong>${node.artikel.name}</strong>
                            <span style="background: white; color: #1e3a8a; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: auto;">
                                PACKAGE
                            </span>
                        </div>
                    </div>
                    
                    <!-- Varianten -->
                    ${node.children.map(variant => `
                        <div style="margin-left: 20px; margin-bottom: 12px;">
                            <!-- Variante (S/M/L) -->
                            <div onclick="selectArtikel('${variant.artikel.id}')"
                                 style="padding: 10px; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; cursor: pointer; margin-bottom: 6px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span>📦</span>
                                    <strong>${variant.artikel.name.split(' - ').pop()}</strong>
                                </div>
                            </div>
                            
                            <!-- Komponenten der Variante -->
                            ${variant.children.length > 0 ? `
                                <div style="margin-left: 20px;">
                                    ${variant.children.map(comp => `
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
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (node.type === 'package') {
            // Einfaches Package mit direkten Kindern
            return `
                <div style="margin-bottom: 16px;">
                    <div onclick="selectArtikel('${node.artikel.id}')"
                         style="padding: 12px; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; cursor: pointer; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>📦</span>
                            <strong>${node.artikel.name}</strong>
                            <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: auto;">
                                PACKAGE
                            </span>
                        </div>
                    </div>
                    
                    ${node.children.map(child => `
                        <div style="margin-left: 20px;">
                            <div onclick="selectArtikel('${child.artikel.id}')"
                                 style="padding: 8px 12px; background: #fafafa; border-left: 2px solid #e5e7eb; margin-bottom: 2px; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span style="color: #9ca3af;">└</span>
                                    <span>${child.artikel.name}</span>
                                    <span style="background: ${getTypeColor(child.artikel.typ)}; color: white; padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: auto;">
                                        ${child.artikel.typ || 'Standard'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            // Einzelner Artikel
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
    
    const container = document.getElementById('detail-container');
    container.innerHTML = `
        <h2>${artikel.name}</h2>
        <p>Details werden geladen...</p>
    `;
};
