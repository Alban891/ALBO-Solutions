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
    
    // Verwende window.cfoDashboard.state statt import
    const state = window.cfoDashboard?.state;
    if (!state) {
        container.innerHTML = '<p style="text-align:center; padding:40px;">State nicht verfügbar</p>';
        return;
    }
    
    const projektId = window.cfoDashboard?.currentProjekt;
    if (!projektId) {
        container.innerHTML = '<p style="text-align:center; padding:40px;">Kein Projekt ausgewählt</p>';
        return;
    }
    
    // Artikel aus State laden
    const artikel = state.getArtikelByProjekt(projektId);
    
    if (!artikel || artikel.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h3>Keine Artikel vorhanden</h3>
                <p>Bitte erstelle zuerst Artikel im Artikel-Tab</p>
            </div>
        `;
        return;
    }
    
    // HTML mit Artikel-Daten generieren
    container.innerHTML = `
        <div style="padding: 24px;">
            <h3>💰 Revenue Model - ${artikel.length} Artikel</h3>
            
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
