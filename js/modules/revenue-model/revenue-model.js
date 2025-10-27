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
    
    // Debug: Finde den State
    console.log('Suche State...');
    console.log('window.state:', window.state);
    console.log('window.projektState:', window.projektState);
    console.log('window.cfoDashboard:', window.cfoDashboard);
    
    // Versuche verschiedene State-Locations
    const state = window.state || window.projektState || window.cfoDashboard?.state;
    
    if (!state) {
        container.innerHTML = '<p style="text-align:center; padding:40px;">State nicht gefunden. Check Console für Debug-Info.</p>';
        return;
    }
    
    const projektId = window.cfoDashboard?.currentProjekt;
    if (!projektId) {
        container.innerHTML = '<p style="text-align:center; padding:40px;">Kein Projekt ausgewählt</p>';
        return;
    }
    
    console.log('Projekt ID:', projektId);
    
    // Versuche Artikel zu laden
    let artikel = null;
    
    // Probiere verschiedene Methoden
    if (typeof state.getArtikelByProjekt === 'function') {
        artikel = state.getArtikelByProjekt(projektId);
    } else if (state.artikel) {
        // Falls direkter Zugriff
        artikel = Object.values(state.artikel).filter(a => a.projekt_id === projektId);
    }
    
    console.log('Gefundene Artikel:', artikel);
    
    if (!artikel || artikel.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h3>Keine Artikel vorhanden</h3>
                <p>Bitte erstelle zuerst Artikel im Artikel-Tab</p>
                <small style="color:#999;">Debug: ProjektID = ${projektId}</small>
            </div>
        `;
        return;
    }
    
    // HTML mit Artikel-Daten generieren
    container.innerHTML = `
        <div style="padding: 24px;">
            <h3>💰 Revenue Model - ${artikel.length} Artikel gefunden</h3>
            
            <!-- Artikel-Liste -->
            <div style="margin-top: 24px;">
                ${artikel.map((art, idx) => `
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                        <h4>#${idx + 1}: ${art.name || 'Unbenannt'}</h4>
                        <p>Typ: ${art.typ || 'Hardware'}</p>
                        <p>Status: ${art.status || 'Aktiv'}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
