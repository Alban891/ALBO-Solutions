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
    
    if (!state || !projektId) {
        container.innerHTML = '<p style="text-align:center; padding:40px;">Fehler beim Laden</p>';
        return;
    }
    
    const artikel = state.getArtikelByProjekt(projektId);
    
    if (!artikel || artikel.length === 0) {
        container.innerHTML = '<div style="padding:40px; text-align:center;"><h3>Keine Artikel vorhanden</h3></div>';
        return;
    }
    
    // Jahre für Forecast
    const years = 5;
    const startYear = new Date().getFullYear();
    
    container.innerHTML = `
        <div style="padding: 24px;">
            <h2 style="margin:0 0 24px;">💰 Revenue Model - ${artikel.length} Artikel</h2>
            
            <!-- EINZELNE ARTIKEL MIT MODELLEN -->
            ${artikel.map((art, idx) => renderArtikelCard(art, idx)).join('')}
            
            <!-- TRENNLINIE -->
            <div style="border-top: 3px solid #1e3a8a; margin: 40px 0;"></div>
            
            <!-- KONSOLIDIERTE TABELLE -->
            <div style="background: white; border: 2px solid #1e3a8a; border-radius: 12px; overflow: hidden;">
                <div style="background: #1e3a8a; color: white; padding: 16px;">
                    <h3 style="margin: 0;">📊 Konsolidierte Ergebnistabelle</h3>
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f3f4f6;">
                            <th style="padding: 12px; text-align: left;">Position</th>
                            ${Array.from({length: years}, (_, i) => 
                                `<th style="padding: 12px; text-align: right;">${startYear + i}</th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${artikel.map((art, idx) => `
                            <tr style="border-top: 1px solid #e5e7eb;">
                                <td style="padding: 12px; font-weight: 500;">
                                    ${art.name || 'Artikel ' + (idx + 1)}
                                </td>
                                ${Array.from({length: years}, (_, i) => 
                                    `<td style="padding: 12px; text-align: right;">
                                        ${formatNumber(calculateRevenue(art, i))}€
                                    </td>`
                                ).join('')}
                            </tr>
                        `).join('')}
                        
                        <!-- SUMMEN-ZEILE -->
                        <tr style="background: #eff6ff; border-top: 2px solid #1e3a8a; font-weight: 600;">
                            <td style="padding: 12px;">GESAMT UMSATZ</td>
                            ${Array.from({length: years}, (_, i) => {
                                const total = artikel.reduce((sum, art) => sum + calculateRevenue(art, i), 0);
                                return `<td style="padding: 12px; text-align: right;">${formatNumber(total)}€</td>`;
                            }).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- EXPORT BUTTON -->
            <div style="margin-top: 24px; text-align: right;">
                <button onclick="alert('Export kommt bald!')" 
                        style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    📥 Export als Excel
                </button>
            </div>
        </div>
    `;
}

function renderArtikelCard(art, idx) {
    return `
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <!-- HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">
                    #${idx + 1}: ${art.name || 'Unbenannt'}
                    <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 14px; margin-left: 8px;">
                        ${art.typ || 'Hardware'}
                    </span>
                </h3>
            </div>
            
            <!-- ENTWICKLUNGSMODELLE -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                <!-- Mengenmodell -->
                <div style="background: #f9fafb; padding: 12px; border-radius: 8px;">
                    <label style="font-size: 12px; color: #6b7280; display: block; margin-bottom: 6px;">
                        📈 Mengenentwicklung
                    </label>
                    <select style="width: 100%; padding: 6px; border: 1px solid #e5e7eb; border-radius: 4px;">
                        <option>Konstant</option>
                        <option>Linear +15%</option>
                        <option selected>S-Kurve</option>
                        <option>Hockey-Stick</option>
                    </select>
                </div>
                
                <!-- Preismodell -->
                <div style="background: #f9fafb; padding: 12px; border-radius: 8px;">
                    <label style="font-size: 12px; color: #6b7280; display: block; margin-bottom: 6px;">
                        💶 Preisentwicklung
                    </label>
                    <select style="width: 100%; padding: 6px; border: 1px solid #e5e7eb; border-radius: 4px;">
                        <option selected>Konstant</option>
                        <option>Inflation +2%</option>
                        <option>Premium +5%</option>
                        <option>Skimming -3%</option>
                    </select>
                </div>
                
                <!-- Kostenmodell -->
                <div style="background: #f9fafb; padding: 12px; border-radius: 8px;">
                    <label style="font-size: 12px; color: #6b7280; display: block; margin-bottom: 6px;">
                        📉 Kostenentwicklung
                    </label>
                    <select style="width: 100%; padding: 6px; border: 1px solid #e5e7eb; border-radius: 4px;">
                        <option>Konstant</option>
                        <option selected>Lernkurve -5%</option>
                        <option>Inflation +3%</option>
                    </select>
                </div>
            </div>
            
            <!-- MINI-PREVIEW -->
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px;">
                <div style="font-size: 12px; color: #6b7280;">
                    Basis: ${getBaseValues(art)}
                </div>
            </div>
        </div>
    `;
}

// HILFSFUNKTIONEN
function calculateRevenue(artikel, yearIndex) {
    // Placeholder - später echte Berechnung
    const baseRevenue = 100000;
    const growth = 1.15; // 15% Wachstum
    return Math.round(baseRevenue * Math.pow(growth, yearIndex));
}

function formatNumber(num) {
    return new Intl.NumberFormat('de-DE').format(num);
}

function getBaseValues(art) {
    if (art.typ === 'Service' || art.typ === 'Beratung') {
        return '1.200€/Tag × 220 Tage';
    } else if (art.typ === 'Software') {
        return '50€/User × 1000 User';
    } else {
        return '5.000€ × 100 Stück';
    }
}
