// js/modules/revenue-model/revenue-model.js

function buildCleanHierarchy(artikel) {
    const hierarchy = [];
    const processed = new Set();
    
    // Packages identifizieren: NUR die mit " - Small/Medium/Large" sind echte Packages
    const realPackages = artikel.filter(a => 
        a.typ === 'Package' && 
        (a.name.includes(' - Small') || 
         a.name.includes(' - Medium') || 
         a.name.includes(' - Large'))
    );
    
    if (realPackages.length > 0) {
        // Gruppiere nach Basis-Name (vor dem " - ")
        const packageGroups = {};
        
        realPackages.forEach(pkg => {
            const baseName = pkg.name.split(' - ')[0]; // "Cyber Security Consulting"
            
            if (!packageGroups[baseName]) {
                packageGroups[baseName] = {
                    name: baseName,
                    packages: []
                };
            }
            
            // Hole Komponenten für dieses Package
            const pkgIdClean = pkg.id.replace('artikel-db-', '');
            const components = artikel.filter(comp => 
                comp.parent_package_id === pkgIdClean || 
                comp.parent_package_id === pkg.id
            );
            
            packageGroups[baseName].packages.push({
                package: pkg,
                components: components
            });
            
            processed.add(pkg.id);
            components.forEach(c => processed.add(c.id));
        });
        
        // Füge Package-Gruppen zur Hierarchie hinzu
        Object.values(packageGroups).forEach(group => {
            hierarchy.push({
                type: 'package-group',
                name: group.name,
                packages: group.packages.sort((a, b) => {
                    // Sortiere: Small, Medium, Large
                    const order = ['Small', 'Medium', 'Large'];
                    const aIndex = order.findIndex(o => a.package.name.includes(o));
                    const bIndex = order.findIndex(o => b.package.name.includes(o));
                    return aIndex - bIndex;
                })
            });
        });
    }
    
    // Ignoriere "Parent" Packages (ohne - Small/Medium/Large)
    const parentPackages = artikel.filter(a => 
        a.typ === 'Package' && 
        !a.name.includes(' - Small') && 
        !a.name.includes(' - Medium') && 
        !a.name.includes(' - Large')
    );
    parentPackages.forEach(p => processed.add(p.id));
    
    // Füge alle anderen nicht-verarbeiteten Top-Level Artikel hinzu
    artikel.filter(a => 
        !processed.has(a.id) && 
        !a.parent_package_id
    ).forEach(art => {
        hierarchy.push({
            type: 'single',
            artikel: art
        });
    });
    
    return hierarchy;
}

function renderCleanHierarchy(hierarchy) {
    return hierarchy.map(node => {
        if (node.type === 'package-group') {
            return `
                <div style="margin-bottom: 24px;">
                    <!-- Package Gruppe Header -->
                    <div style="padding: 12px; background: #1e3a8a; color: white; border-radius: 8px; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>📦</span>
                            <strong>${node.name}</strong>
                            <span style="background: white; color: #1e3a8a; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: auto;">
                                PACKAGE GROUP
                            </span>
                        </div>
                    </div>
                    
                    <!-- Packages (S/M/L) -->
                    <div style="margin-left: 20px;">
                        ${node.packages.map(pkg => `
                            <div style="margin-bottom: 12px;">
                                <!-- Package Variante -->
                                <div onclick="selectArtikel('${pkg.package.id}')"
                                     style="padding: 10px; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; cursor: pointer; margin-bottom: 6px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span>📦</span>
                                        <strong>${pkg.package.name.split(' - ').pop()}</strong>
                                    </div>
                                </div>
                                
                                <!-- Komponenten -->
                                ${pkg.components.length > 0 ? `
                                    <div style="margin-left: 20px;">
                                        ${pkg.components.map(comp => `
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
