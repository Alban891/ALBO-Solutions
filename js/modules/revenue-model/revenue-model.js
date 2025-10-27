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
    
    // Analysiere Struktur
    const tree = buildArtikelTree(artikel);
    
    container.innerHTML = `
        <div style="display: flex; height: calc(100vh - 300px); gap: 24px; padding: 24px;">
            
            <!-- LINKE SEITE: ARTIKEL-BAUM -->
            <div style="width: 350px; background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow-y: auto;">
                <div style="background: #1e3a8a; color: white; padding: 16px; position: sticky; top: 0; z-index: 10;">
                    <h3 style="margin: 0; font-size: 16px;">📋 Artikel-Struktur</h3>
                </div>
                <div id="artikel-tree" style="padding: 16px;">
                    ${renderArtikelTree(tree)}
                </div>
            </div>
            
            <!-- RECHTE SEITE: DETAIL-ANSICHT -->
            <div style="flex: 1; background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow-y: auto;">
                <div id="detail-container" style="padding: 24px;">
                    <div style="text-align: center; padding: 80px 40px; color: #9ca3af;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <p style="font-size: 18px; font-weight: 500;">Wählen Sie einen Artikel aus</p>
                        <p style="font-size: 14px;">Klicken Sie links auf einen Artikel, um die Details zu bearbeiten</p>
                    </div>
                </div>
            </div>
            
        </div>
        
        <!-- KONSOLIDIERTE TABELLE UNTEN -->
        <div style="padding: 24px;">
            <div id="consolidated-table" style="margin-top: 24px;">
                ${renderConsolidatedTable(artikel)}
            </div>
        </div>
    `;
    
    // Store artikel globally
    window.revenueModelArtikel = artikel;
}

// ============================================
// BAUM-STRUKTUR AUFBAUEN
// ============================================

function buildArtikelTree(artikel) {
    const tree = [];
    const processed = new Set();
    
    // 1. Finde Packages (Parent-Child)
    artikel.forEach(art => {
        if (!art.parent_package_id && !processed.has(art.id)) {
            const children = artikel.filter(a => 
                a.parent_package_id === art.id || 
                a.parent_package_id === art.id.replace('artikel-db-', '')
            );
            
            if (children.length > 0) {
                // Es ist ein Package
                tree.push({
                    type: 'package',
                    artikel: art,
                    children: children
                });
                processed.add(art.id);
                children.forEach(c => processed.add(c.id));
            }
        }
    });
    
    // 2. Finde Hybrid-Artikel (mit mehreren Streams)
    artikel.forEach(art => {
        if (!processed.has(art.id)) {
            if (art.geschaeftsmodell === 'Hybrid' || art.revenue_streams?.length > 1) {
                tree.push({
                    type: 'hybrid',
                    artikel: art,
                    streams: art.revenue_streams || [
                        { name: 'Lizenzverkauf', type: 'one-time' },
                        { name: 'Wartung', type: 'recurring' }
                    ]
                });
                processed.add(art.id);
            }
        }
    });
    
    // 3. Rest als Standard
    artikel.forEach(art => {
        if (!processed.has(art.id)) {
            tree.push({
                type: 'standard',
                artikel: art
            });
        }
    });
    
    return tree;
}

// ============================================
// RENDER BAUM
// ============================================

function renderArtikelTree(tree) {
    return tree.map((node, idx) => {
        if (node.type === 'package') {
            return `
                <div class="tree-node" style="margin-bottom: 16px;">
                    <div class="tree-package" onclick="selectArtikel('${node.artikel.id}')" 
                         style="padding: 12px; background: #eff6ff; border: 1px solid #2563eb; border-radius: 8px; cursor: pointer; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>📦</span>
                            <strong>${node.artikel.name || 'Package'}</strong>
                            <span style="background: #fbbf24; color: #78350f; padding: 2px 6px; border-radius: 4px; font-size: 11px;">PACKAGE</span>
                        </div>
                    </div>
                    <div style="margin-left: 24px;">
                        ${node.children.map(child => `
                            <div onclick="selectArtikel('${child.id}')" 
                                 style="padding: 8px 12px; background: #f9fafb; border-left: 2px solid #e5e7eb; margin-bottom: 4px; cursor: pointer; transition: all 0.2s;"
                                 onmouseover="this.style.background='#f3f4f6'" 
                                 onmouseout="this.style.background='#f9fafb'">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="color: #9ca3af;">└</span>
                                    <span>${child.name || 'Komponente'}</span>
                                    <span style="font-size: 11px; color: #6b7280;">${child.typ || ''}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (node.type === 'hybrid') {
            return `
                <div class="tree-node" style="margin-bottom: 16px;">
                    <div onclick="selectArtikel('${node.artikel.id}')"
                         style="padding: 12px; background: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; cursor: pointer; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>🔄</span>
                            <strong>${node.artikel.name || 'Hybrid'}</strong>
                            <span style="background: #4ade80; color: #14532d; padding: 2px 6px; border-radius: 4px; font-size: 11px;">HYBRID</span>
                        </div>
                    </div>
                    <div style="margin-left: 24px;">
                        ${node.streams.map((stream, i) => `
                            <div onclick="selectStream('${node.artikel.id}', ${i})"
                                 style="padding: 8px 12px; background: #f9fafb; border-left: 2px solid #e5e7eb; margin-bottom: 4px; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="color: #9ca3af;">└</span>
                                    <span>💰 ${stream.name}</span>
                                    <span style="font-size: 11px; color: #6b7280;">${stream.type}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="tree-node" onclick="selectArtikel('${node.artikel.id}')"
                     style="padding: 12px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; margin-bottom: 8px; transition: all 0.2s;"
                     onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#fafafa'" 
                     onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='white'">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>📦</span>
                        <strong>${node.artikel.name || 'Artikel'}</strong>
                        <span style="background: #e5e7eb; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
                            ${node.artikel.typ || 'STANDARD'}
                        </span>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// ============================================
// ARTIKEL AUSWÄHLEN UND DETAILS ANZEIGEN
// ============================================

window.selectArtikel = function(artikelId) {
    const artikel = window.revenueModelArtikel.find(a => a.id === artikelId);
    if (!artikel) return;
    
    // Highlight selected in tree
    document.querySelectorAll('.tree-node > div').forEach(el => {
        el.style.outline = 'none';
    });
    event.currentTarget.style.outline = '2px solid #3b82f6';
    event.currentTarget.style.outlineOffset = '2px';
    
    // Show details
    const container = document.getElementById('detail-container');
    container.innerHTML = renderArtikelDetails(artikel);
};

// ============================================
// DETAIL-ANSICHT (wie vorher, aber kompakter)
// ============================================

function renderArtikelDetails(art) {
    return `
        <div>
            <!-- Header -->
            <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0; font-size: 24px;">
                    ${art.name || 'Unbenannt'}
                    <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 6px; font-size: 14px; margin-left: 12px;">
                        ${art.typ || 'Standard'}
                    </span>
                </h2>
            </div>
            
            <!-- Finanz-Parameter (wie im Screenshot) -->
            ${renderFinanzParameter(art)}
        </div>
    `;
}

function renderFinanzParameter(art) {
    // Hier den Code von vorher wiederverwenden
    // aber kompakter
    return `
        <div style="background: #fafafa; padding: 20px; border-radius: 8px;">
            <!-- Inhalt wie vorher -->
            ... Release, Zeithorizont, Startwerte, Entwicklungsmodelle ...
        </div>
    `;
}

function renderConsolidatedTable(artikel) {
    // Tabelle am Ende
    return `
        <div style="background: white; border: 2px solid #1e3a8a; border-radius: 12px; overflow: hidden;">
            <div style="background: #1e3a8a; color: white; padding: 16px;">
                <h3 style="margin: 0;">📊 Konsolidierte Ergebnisse</h3>
            </div>
            <div style="padding: 16px;">
                <!-- Tabelle -->
            </div>
        </div>
    `;
}
