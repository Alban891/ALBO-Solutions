// js/modules/revenue-model/revenue-model.js

console.log('💰 Revenue Model Module initialisiert');

// ============================================
// CALCULATOR LADEN
// ============================================

// Lade den Calculator dynamisch
const calculatorScript = document.createElement('script');
calculatorScript.type = 'module';
calculatorScript.textContent = `
    import { calculateArtikelForecast } from '../artikel/artikel-calculator.js';
    window.calculateArtikelForecast = calculateArtikelForecast;
    console.log('✅ Calculator verfügbar');
`;
document.head.appendChild(calculatorScript);

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

// ============================================
// HAUPTFUNKTION
// ============================================

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
    
    // Store artikel data globally for calculator
    window.revenueModelArtikel = artikel;
    
    container.innerHTML = `
        <div style="padding: 24px;">
            <h2 style="margin:0 0 24px;">💰 Revenue Model - Detailkalkulation</h2>
            
            <!-- Artikel Details -->
            <div id="artikel-details">
                ${artikel.map(art => renderArtikelDetail(art)).join('')}
            </div>
            
            <!-- Konsolidierte Tabelle -->
            ${renderConsolidatedResults(artikel)}
        </div>
    `;
}

// ============================================
// RENDER ARTIKEL DETAIL (WIE IM SCREENSHOT)
// ============================================

function renderArtikelDetail(art) {
    // Bestimme Typ-spezifische Labels
    const labels = getLabelsForType(art.typ);
    
    return `
        <div class="artikel-detail-card" data-artikel-id="${art.id}" 
             style="background:white; border:2px solid #e5e7eb; border-radius:12px; margin-bottom:24px; overflow:hidden;">
            
            <!-- Header -->
            <div style="background:#f9fafb; padding:20px; border-bottom:1px solid #e5e7eb;">
                <h3 style="margin:0; font-size:18px;">
                    📦 ${art.name || 'Unbenannt'}
                    <span style="background:#dbeafe; color:#1e40af; padding:4px 12px; border-radius:4px; font-size:14px; margin-left:12px;">
                        ${art.typ || 'Hardware'}
                    </span>
                </h3>
            </div>
            
            <!-- Content -->
            <div style="padding:24px;">
                
                <!-- Finanz-Parameter Section -->
                <div style="background:#fafafa; border-radius:8px; padding:20px; margin-bottom:20px;">
                    <h4 style="margin:0 0 20px; font-size:16px; color:#1e3a8a;">
                        💰 Finanz-Parameter & Entwicklungsmodelle
                    </h4>
                    
                    <!-- Release & Zeithorizont -->
                    <div style="display:grid; grid-template-columns:1fr 2fr; gap:16px; margin-bottom:24px;">
                        <div>
                            <label style="font-size:11px; color:#6b7280; display:block; margin-bottom:6px; font-weight:600;">
                                📅 RELEASE / STARTDATUM
                            </label>
                            <input type="month" 
                                   value="${art.release_datum || '2025-01'}" 
                                   id="release-${art.id}"
                                   onchange="updateArtikelData('${art.id}', 'release_datum', this.value)"
                                   style="width:100%; padding:8px; border:1px solid #e5e7eb; border-radius:4px;">
                        </div>
                        <div>
                            <label style="font-size:11px; color:#6b7280; display:block; margin-bottom:6px; font-weight:600;">
                                ZEITHORIZONT
                            </label>
                            <div style="display:flex; gap:8px;">
                                <button class="zeit-btn" onclick="setZeitraum('${art.id}', 3)" 
                                        style="flex:1; padding:8px; border:1px solid #e5e7eb; background:white; border-radius:4px; cursor:pointer;">
                                    3 Jahre
                                </button>
                                <button class="zeit-btn active" onclick="setZeitraum('${art.id}', 5)"
                                        style="flex:1; padding:8px; border:1px solid #e5e7eb; background:#1e3a8a; color:white; border-radius:4px; cursor:pointer;">
                                    5 Jahre
                                </button>
                                <button class="zeit-btn" onclick="setZeitraum('${art.id}', 7)"
                                        style="flex:1; padding:8px; border:1px solid #e5e7eb; background:white; border-radius:4px; cursor:pointer;">
                                    7 Jahre
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Startwerte -->
                    <div style="margin-bottom:24px;">
                        <h5 style="margin:0 0 12px; font-size:14px;">📊 Startwerte (Jahr 1)</h5>
                        
                        <div style="background:#fffbeb; border:1px solid #f59e0b; border-radius:6px; padding:10px; margin-bottom:12px;">
                            <p style="margin:0; font-size:12px; color:#92400e;">
                                💡 Tipp: Tragen Sie hier Ihre Annahmen für das erste Jahr ein.
                            </p>
                        </div>
                        
                        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px;">
                            <div>
                                <label style="font-size:11px; color:#6b7280; font-weight:600;">
                                    ${labels.metrik1.toUpperCase()}
                                </label>
                                <input type="text" 
                                       value="${art.start_menge || 'z.B. 1.000'}"
                                       onfocus="clearPlaceholder(this)"
                                       onblur="updateStartValue('${art.id}', 'menge', this.value)"
                                       style="width:100%; padding:8px; border:1px solid #e5e7eb; border-radius:4px; margin-top:4px;">
                            </div>
                            <div>
                                <label style="font-size:11px; color:#6b7280; font-weight:600;">
                                    ${labels.metrik2.toUpperCase()}
                                </label>
                                <input type="text"
                                       value="${art.start_preis || 'z.B. 50,00'}"
                                       onfocus="clearPlaceholder(this)"
                                       onblur="updateStartValue('${art.id}', 'preis', this.value)"
                                       style="width:100%; padding:8px; border:1px solid #e5e7eb; border-radius:4px; margin-top:4px;">
                            </div>
                            <div>
                                <label style="font-size:11px; color:#6b7280; font-weight:600;">
                                    ${labels.metrik3.toUpperCase()}
                                </label>
                                <input type="text"
                                       value="${art.start_hk || 'z.B. 20,00'}"
                                       onfocus="clearPlaceholder(this)"
                                       onblur="updateStartValue('${art.id}', 'hk', this.value)"
                                       style="width:100%; padding:8px; border:1px solid #e5e7eb; border-radius:4px; margin-top:4px;">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Entwicklungsmodelle -->
                    <div style="margin-bottom:24px;">
                        <h5 style="margin:0 0 12px; font-size:14px;">📈 ENTWICKLUNGSMODELLE</h5>
                        
                        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px;">
                            <!-- Mengenentwicklung -->
                            <div style="background:white; border:1px solid #e5e7eb; padding:12px; border-radius:6px;">
                                <label style="font-size:11px; color:#6b7280; font-weight:600;">MENGENENTWICKLUNG</label>
                                <select onchange="updateModel('${art.id}', 'mengen_modell', this.value)"
                                        style="width:100%; padding:6px; margin-top:6px; border:1px solid #e5e7eb; border-radius:4px;">
                                    <option value="konservativ">Konservativ (+15% p.a.)</option>
                                    <option value="realistisch" selected>Realistisch (S-Kurve)</option>
                                    <option value="optimistisch">Optimistisch (Hockey-Stick)</option>
                                    <option value="manuell">Manuell</option>
                                </select>
                            </div>
                            
                            <!-- Preisentwicklung -->
                            <div style="background:white; border:1px solid #e5e7eb; padding:12px; border-radius:6px;">
                                <label style="font-size:11px; color:#6b7280; font-weight:600;">PREISENTWICKLUNG</label>
                                <select onchange="updateModel('${art.id}', 'preis_modell', this.value)"
                                        style="width:100%; padding:6px; margin-top:6px; border:1px solid #e5e7eb; border-radius:4px;">
                                    <option value="konstant" selected>Konstant (0% p.a.)</option>
                                    <option value="inflation">Inflation (+2% p.a.)</option>
                                    <option value="premium">Premium (+5% p.a.)</option>
                                    <option value="skimming">Skimming (-3% p.a.)</option>
                                    <option value="manuell">Manuell</option>
                                </select>
                            </div>
                            
                            <!-- Kostenentwicklung -->
                            <div style="background:white; border:1px solid #e5e7eb; padding:12px; border-radius:6px;">
                                <label style="font-size:11px; color:#6b7280; font-weight:600;">KOSTENENTWICKLUNG</label>
                                <select onchange="updateModel('${art.id}', 'kosten_modell', this.value)"
                                        style="width:100%; padding:6px; margin-top:6px; border:1px solid #e5e7eb; border-radius:4px;">
                                    <option value="konstant">Konstant (0% p.a.)</option>
                                    <option value="lernkurve" selected>Lernkurve (-5% bei 2x)</option>
                                    <option value="inflation">Inflation (+3% p.a.)</option>
                                    <option value="skaleneffekte">Skaleneffekte (Stufen)</option>
                                    <option value="manuell">Manuell</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Berechnen Button -->
                    <div style="text-align:center;">
                        <button onclick="calculateAndUpdate('${art.id}')"
                                style="padding:12px 32px; background:#1e3a8a; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px; font-weight:600;">
                            Berechnen & Vorschau aktualisieren
                        </button>
                    </div>
                </div>
                
                <!-- Ergebnis-Vorschau -->
                <div id="preview-${art.id}">
                    <!-- Wird nach Berechnung gefüllt -->
                </div>
            </div>
        </div>
    `;
}

// ============================================
// HILFSFUNKTIONEN
// ============================================

function getLabelsForType(typ) {
    // Typ-spezifische Labels
    const typeLabels = {
        'Hardware': { metrik1: 'Menge (Stück)', metrik2: 'Preis (€/Stück)', metrik3: 'HK (€/Stück)' },
        'Software': { metrik1: 'Lizenzen', metrik2: 'Preis (€/Lizenz)', metrik3: 'Kosten (€/Lizenz)' },
        'Service': { metrik1: 'Personentage', metrik2: 'Tagessatz (€/Tag)', metrik3: 'Kosten (€/Tag)' },
        'Beratung': { metrik1: 'Beratertage', metrik2: 'Tagessatz (€/Tag)', metrik3: 'Kostensatz (€/Tag)' }
    };
    
    return typeLabels[typ] || typeLabels['Hardware'];
}

function renderConsolidatedResults(artikel) {
    // Placeholder für konsolidierte Tabelle
    return `
        <div style="margin-top:40px; border-top:3px solid #1e3a8a; padding-top:40px;">
            <h3>📊 Konsolidierte Ergebnisse</h3>
            <div id="consolidated-results">
                <!-- Wird nach Berechnungen gefüllt -->
            </div>
        </div>
    `;
}

// Global Functions
window.clearPlaceholder = function(input) {
    if (input.value.startsWith('z.B.')) {
        input.value = '';
    }
};

window.calculateAndUpdate = function(artikelId) {
    console.log('Berechne für Artikel:', artikelId);
    // Hier Calculator aufrufen
    if (window.calculateArtikelForecast) {
        const artikel = window.revenueModelArtikel.find(a => a.id === artikelId);
        if (artikel) {
            const forecast = window.calculateArtikelForecast(artikel);
            console.log('Forecast:', forecast);
            // Update UI mit Ergebnissen
        }
    }
};
