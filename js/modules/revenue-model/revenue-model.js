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
    
    // Baue Package-Hierarchie auf
    const hierarchy = buildPackageHierarchy(artikel);
    
    container.innerHTML = `
        <div style="display: flex; height: calc(100vh - 300px); gap: 24px; padding: 24px;">
            
            <!-- LINKE SEITE: ARTIKEL-BAUM -->
            <div style="width: 380px; background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background: #1e3a8a; color: white; padding: 16px;">
                    <h3 style="margin: 0; font-size: 16px;">📋 Artikel-Struktur</h3>
                </div>
                <div id="artikel-tree" style="padding: 16px; overflow-y: auto; max-height: calc(100% - 60px);">
                    ${renderPackageHierarchy(hierarchy)}
                </div>
            </div>
            
            <!-- RECHTE SEITE: DETAIL-ANSICHT -->
            <div style="flex: 1; background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow-y: auto;">
                <div id="detail-container" style="padding: 24px;">
                    <div style="text-align: center; padding: 80px 40px; color: #9ca3af;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <p style="font-size: 18px; font-weight: 500;">Wählen Sie einen Artikel aus</p>
                        <p style="font-size: 14px;">Klicken Sie links auf einen Artikel oder Package</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    window.revenueModelArtikel = artikel;
}

// ============================================
// PACKAGE HIERARCHIE AUFBAUEN
// ============================================

function buildPackageHierarchy(artikel) {
    const hierarchy = [];
    const processed = new Set();
    
    // Finde alle Parent-Packages (die ohne parent_package_id)
    const parentPackages = artikel.filter(a => 
        a.artikel_mode === 'package-parent' || 
        (a.name && a.name.includes('Consulting') && !a.name.includes('-'))
    );
    
    parentPackages.forEach(parent => {
        // Finde die Package-Varianten (Small, Medium, Large)
        const variants = artikel.filter(a => 
            a.name && a.name.startsWith(parent.name.split(' - ')[0]) && 
            (a.name.includes('Small') || a.name.includes('Medium') || a.name.includes('Large'))
        );
        
        if (variants.length > 0) {
            // Es ist ein Package-System mit Varianten
            const node = {
                type: 'package-parent',
                artikel: parent,
                variants: variants.map(v => ({
                    artikel: v,
                    komponenten: getPackageKomponenten(v) // Diese müssten aus den Package-Definitionen kommen
                }))
            };
            hierarchy.push(node);
            processed.add(parent.id);
            variants.forEach(v => processed.add(v.id));
        } else {
            // Normales Package oder Standard-Artikel
            hierarchy.push({
                type: 'standard',
                artikel: parent
            });
            processed.add(parent.id);
        }
    });
    
    // Rest der Artikel (nicht in Packages)
    artikel.filter(a => !processed.has(a.id)).forEach(art => {
        hierarchy.push({
            type: 'standard',
            artikel: art
        });
    });
    
    return hierarchy;
}

// ============================================
// PACKAGE KOMPONENTEN (aus Package-Definition)
// ============================================

function getPackageKomponenten(packageArtikel) {
    // Hier würden normalerweise die Komponenten aus der Package-Definition kommen
    // Für Demo hardcoded basierend auf Package-Name
    if (packageArtikel.name.includes('Small')) {
        return [
            { name: 'Einmalige Risikoanalyse', typ: 'Service', beschreibung: 'Der Kunde erhält eine einmalige Risikoanalyse' }
        ];
    } else if (packageArtikel.name.includes('Medium')) {
        return [
            { name: 'Hardware-Verkauf', typ: 'Hardware', beschreibung: 'PFC Controller' },
            { name: 'Software-Verkauf', typ: 'Software', beschreibung: 'Lizenz für Datenanalyse' },
            { name: 'Consulting', typ: 'Service', beschreibung: 'Berater-Team für Umsetzung' }
        ];
    } else if (packageArtikel.name.includes('Large')) {
        return [
            { name: 'Hardware-Verkauf', typ: 'Hardware', beschreibung: 'PFC Controller Premium' },
            { name: 'Software-Verkauf', typ: 'Software', beschreibung: 'Enterprise Lizenz' },
            { name: 'Consulting', typ: 'Service', beschreibung: 'Dediziertes Berater-Team' },
            { name: 'Monatliche Risikoanalyse', typ: 'Service', beschreibung: 'Kontinuierliche Überwachung' }
        ];
    }
    return [];
}

// ============================================
// RENDER PACKAGE HIERARCHIE
// ============================================

function renderPackageHierarchy(hierarchy) {
    return hierarchy.map(node => {
        if (node.type === 'package-parent') {
            return `
                <div class="package-tree" style="margin-bottom: 20px;">
                    <!-- Parent Package -->
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
                    
                    <!-- Package Varianten -->
                    <div style="margin-left: 20px;">
                        ${node.variants.map(variant => `
                            <div style="margin-bottom: 12px;">
                                <!-- Variante (S/M/L) -->
                                <div onclick="selectArtikel('${variant.artikel.id}')"
                                     style="padding: 10px; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; cursor: pointer; margin-bottom: 4px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span>📦</span>
                                        <strong>${variant.artikel.name.split(' - ').pop()}</strong>
                                    </div>
                                </div>
                                
                                <!-- Komponenten der Variante -->
                                ${variant.komponenten.length > 0 ? `
                                    <div style="margin-left: 20px;">
                                        ${variant.komponenten.map(komp => `
                                            <div onclick="selectKomponente('${variant.artikel.id}', '${komp.name}')"
                                                 style="padding: 8px 12px; background: #fafafa; border-left: 2px solid #e5e7eb; margin-bottom: 2px; cursor: pointer; font-size: 14px;"
                                                 onmouseover="this.style.background='#f3f4f6'"
                                                 onmouseout="this.style.background='#fafafa'">
                                                <div style="display: flex; align-items: center; gap: 6px;">
                                                    <span style="color: #9ca3af; font-size: 12px;">└</span>
                                                    <span>${komp.name}</span>
                                                    <span style="background: #e5e7eb; color: #6b7280; padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: auto;">
                                                        ${komp.typ}
                                                    </span>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            // Standard-Artikel
            return `
                <div onclick="selectArtikel('${node.artikel.id}')"
                     style="padding: 12px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; margin-bottom: 8px;"
                     onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#fafafa'"
                     onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='white'">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>📦</span>
                        <strong>${node.artikel.name}</strong>
                        <span style="background: #e5e7eb; color: #374151; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: auto;">
                            ${node.artikel.typ || 'Standard'}
                        </span>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// ============================================
// SELECTION HANDLERS  
// ============================================

window.selectArtikel = function(artikelId) {
    const artikel = window.revenueModelArtikel.find(a => a.id === artikelId);
    if (!artikel) return;
    
    const container = document.getElementById('detail-container');
    container.innerHTML = `
        <h2 style="margin: 0 0 24px;">
            ${artikel.name}
            <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 6px; font-size: 14px; margin-left: 12px;">
                ${artikel.typ || 'Package'}
            </span>
        </h2>
        <p>... Release, Zeithorizont, Startwerte, Entwicklungsmodelle ...</p>
    `;
};

window.selectKomponente = function(packageId, komponentName) {
    const container = document.getElementById('detail-container');
    container.innerHTML = `
        <h2 style="margin: 0 0 24px;">Komponente: ${komponentName}</h2>
        <p>Detail-Konfiguration für diese Komponente...</p>
    `;
};
