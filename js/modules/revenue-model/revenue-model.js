// js/modules/revenue-model/revenue-model.js

import { state } from '../../../state.js';
import * as helpers from '../../../helpers.js';

// ============================================
// AUTO-REGISTRIERUNG & INITIALISIERUNG
// ============================================

(function() {
    // Erweitere Tab-Switch für Revenue Model
    const originalSwitch = window.switchProjektTab;
    window.switchProjektTab = function(tab) {
        if (originalSwitch) originalSwitch.apply(this, arguments);
        
        if (tab === 'revenue-model') {
            initRevenueModel();
        }
    };
    
    console.log('💰 Revenue Model Module registered');
})();

// ============================================
// HAUPTFUNKTION
// ============================================

function initRevenueModel() {
    const container = document.getElementById('projekt-tab-revenue-model');
    if (!container) return;
    
    const projektId = window.cfoDashboard.currentProjekt;
    if (!projektId) {
        container.innerHTML = '<p style="text-align:center; padding:40px;">Kein Projekt ausgewählt</p>';
        return;
    }
    
    // Lade Artikel aus State
    const artikel = state.getArtikelByProjekt(projektId);
    
    container.innerHTML = `
        <div class="revenue-model-wrapper" style="padding: 24px;">
            
            <!-- HEADER -->
            <div style="margin-bottom: 32px;">
                <h3 style="margin: 0 0 8px;">💰 Revenue Model - Gesamtübersicht</h3>
                <p style="color: #6b7280;">Konsolidierte Umsatz- und Ergebnisplanung aller Artikel</p>
            </div>
            
            <!-- ARTIKEL KALKULATIONEN -->
            <div id="artikel-calculations">
                ${renderArtikelCalculations(artikel)}
            </div>
            
            <!-- DIVIDER -->
            <div style="border-top: 3px solid #1e3a8a; margin: 40px 0;"></div>
            
            <!-- KONSOLIDIERTE TABELLE -->
            <div id="consolidated-table">
                ${renderConsolidatedTable(artikel)}
            </div>
            
        </div>
    `;
    
    // Event Listener für Modell-Änderungen
    attachEventListeners();
}

// ============================================
// ARTIKEL-EINZELKALKULATIONEN
// ============================================

function renderArtikelCalculations(artikel) {
    if (!artikel || artikel.length === 0) {
        return '<p style="text-align:center; padding:20px; color:#999;">Keine Artikel vorhanden</p>';
    }
    
    return artikel.map((art, index) => `
        <div class="artikel-calc-card" style="background:white; border:2px solid #e5e7eb; border-radius:12px; padding:20px; margin-bottom:20px;">
            
            <!-- Artikel Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h4 style="margin:0; display:flex; align-items:center; gap:8px;">
                    <span style="color:#6b7280;">#${index + 1}</span>
                    ${art.name || 'Artikel'}
                    <span style="background:#eff6ff; color:#2563eb; padding:2px 8px; border-radius:4px; font-size:12px;">
                        ${art.typ || 'Hardware'}
                    </span>
                </h4>
                <button onclick="toggleArtikelDetail('${art.id}')" style="background:none; border:none; cursor:pointer; font-size:20px;">
                    ⚙️
                </button>
            </div>
            
            <!-- Entwicklungsmodelle -->
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px;">
                
                <!-- Mengenmodell -->
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <label style="font-size:12px; color:#6b7280; display:block; margin-bottom:4px;">
                        Mengenentwicklung
                    </label>
                    <select id="mengen-${art.id}" onchange="updateArtikelModel('${art.id}', 'mengen', this.value)"
                            style="width:100%; padding:6px; border:1px solid #e5e7eb; border-radius:4px;">
                        <option value="konstant">Konstant</option>
                        <option value="linear" ${art.mengen_modell === 'linear' ? 'selected' : ''}>Linear +15%</option>
                        <option value="s-kurve" ${art.mengen_modell === 's-kurve' ? 'selected' : ''}>S-Kurve</option>
                        <option value="hockey" ${art.mengen_modell === 'hockey' ? 'selected' : ''}>Hockey-Stick</option>
                    </select>
                </div>
                
                <!-- Preismodell -->
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <label style="font-size:12px; color:#6b7280; display:block; margin-bottom:4px;">
                        Preisentwicklung
                    </label>
                    <select id="preis-${art.id}" onchange="updateArtikelModel('${art.id}', 'preis', this.value)"
                            style="width:100%; padding:6px; border:1px solid #e5e7eb; border-radius:4px;">
                        <option value="konstant">Konstant</option>
                        <option value="inflation" ${art.preis_modell === 'inflation' ? 'selected' : ''}>Inflation +2%</option>
                        <option value="premium" ${art.preis_modell === 'premium' ? 'selected' : ''}>Premium +5%</option>
                        <option value="skimming" ${art.preis_modell === 'skimming' ? 'selected' : ''}>Skimming -3%</option>
                    </select>
                </div>
                
                <!-- Kostenmodell -->
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <label style="font-size:12px; color:#6b7280; display:block; margin-bottom:4px;">
                        Kostenentwicklung
                    </label>
                    <select id="kosten-${art.id}" onchange="updateArtikelModel('${art.id}', 'kosten', this.value)"
                            style="width:100%; padding:6px; border:1px solid #e5e7eb; border-radius:4px;">
                        <option value="konstant">Konstant</option>
                        <option value="lernkurve" ${art.kosten_modell === 'lernkurve' ? 'selected' : ''}>Lernkurve -5%</option>
                        <option value="inflation" ${art.kosten_modell === 'inflation' ? 'selected' : ''}>Inflation +3%</option>
                    </select>
                </div>
            </div>
            
            <!-- Mini-Tabelle für diesen Artikel -->
            ${renderArtikelMiniTable(art)}
            
        </div>
    `).join('');
}

// ============================================
// MINI-TABELLE PRO ARTIKEL
// ============================================

function renderArtikelMiniTable(artikel) {
    const years = 5; // Oder aus artikel.zeitraum
    const startYear = new Date().getFullYear();
    
    return `
        <div style="overflow-x:auto;">
            <table style="width:100%; font-size:13px; border-collapse:collapse;">
                <thead>
                    <tr style="background:#f9fafb;">
                        <th style="text-align:left; padding:8px; border-bottom:2px solid #e5e7eb;">Metrik</th>
                        ${Array.from({length: years}, (_, i) => `
                            <th style="text-align:right; padding:8px; border-bottom:2px solid #e5e7eb;">${startYear + i}</th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding:8px; font-weight:500;">Menge</td>
                        ${renderYearValues(artikel, 'menge', years)}
                    </tr>
                    <tr style="background:#fafafa;">
                        <td style="padding:8px; font-weight:500;">Preis (€)</td>
                        ${renderYearValues(artikel, 'preis', years)}
                    </tr>
                    <tr>
                        <td style="padding:8px; font-weight:500;">Umsatz (€)</td>
                        ${renderYearValues(artikel, 'umsatz', years, true)}
                    </tr>
                    <tr style="background:#f0fdf4;">
                        <td style="padding:8px; font-weight:600;">DB2 (€)</td>
                        ${renderYearValues(artikel, 'db2', years, true)}
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// ============================================
// KONSOLIDIERTE GESAMTTABELLE
// ============================================

function renderConsolidatedTable(artikel) {
    const years = 5;
    const startYear = new Date().getFullYear();
    
    return `
        <div>
            <h3 style="margin:0 0 16px;">📊 Konsolidierte Ergebnistabelle</h3>
            
            <div style="background:white; border:2px solid #1e3a8a; border-radius:12px; overflow:hidden;">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="background:#1e3a8a; color:white;">
                            <th style="text-align:left; padding:12px; font-weight:600;">Position</th>
                            ${Array.from({length: years}, (_, i) => `
                                <th style="text-align:right; padding:12px; font-weight:600;">${startYear + i}</th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Pro Artikel eine Zeile -->
                        ${artikel.map((art, idx) => `
                            <tr style="background:${idx % 2 ? '#f9fafb' : 'white'};">
                                <td style="padding:12px; font-weight:500;">
                                    ${art.name || `Artikel ${idx + 1}`}
                                </td>
                                ${renderYearValues(art, 'umsatz', years, true)}
                            </tr>
                        `).join('')}
                        
                        <!-- Summen-Zeile -->
                        <tr style="background:#eff6ff; border-top:2px solid #1e3a8a;">
                            <td style="padding:12px; font-weight:600;">GESAMT UMSATZ</td>
                            ${calculateTotalRevenue(artikel, years)}
                        </tr>
                        
                        <!-- Kosten -->
                        <tr>
                            <td style="padding:12px;">- Herstellkosten</td>
                            ${calculateTotalCosts(artikel, years)}
                        </tr>
                        
                        <!-- DB2 -->
                        <tr style="background:#f0fdf4; border-top:2px solid #16a34a;">
                            <td style="padding:12px; font-weight:600;">= DECKUNGSBEITRAG II</td>
                            ${calculateTotalDB2(artikel, years)}
                        </tr>
                        
                        <!-- DB2 % -->
                        <tr>
                            <td style="padding:12px;">DB2-Marge %</td>
                            ${calculateDB2Percentage(artikel, years)}
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Export Button -->
            <div style="margin-top:16px; text-align:right;">
                <button onclick="exportRevenueModel()" style="padding:8px 16px; background:#059669; color:white; border:none; border-radius:6px; cursor:pointer;">
                    📥 Export als Excel
                </button>
            </div>
        </div>
    `;
}

// ============================================
// HILFSFUNKTIONEN
// ============================================

function renderYearValues(artikel, metric, years, isRevenue = false) {
    // Hier würdest du die tatsächlichen Werte berechnen
    // Basierend auf den Modellen
    return Array.from({length: years}, (_, i) => {
        const value = calculateMetricForYear(artikel, metric, i);
        const formatted = isRevenue ? helpers.formatRevenue(value) : helpers.formatThousands(value);
        return `<td style="text-align:right; padding:8px;">${formatted}</td>`;
    }).join('');
}

function calculateMetricForYear(artikel, metric, yearIndex) {
    // Placeholder - hier würde die echte Berechnung stattfinden
    const baseValues = {
        menge: 1000,
        preis: 5000,
        umsatz: 5000000,
        db2: 3000000
    };
    
    return baseValues[metric] || 0;
}

// ============================================
// EVENT HANDLER
// ============================================

window.updateArtikelModel = function(artikelId, modelType, value) {
    console.log(`Updating ${modelType} for artikel ${artikelId} to ${value}`);
    // Update im State
    // Neuberechnung triggern
    initRevenueModel(); // Re-render
};

window.toggleArtikelDetail = function(artikelId) {
    // Öffne Detail-Modal oder erweitere Ansicht
    console.log('Toggle detail for:', artikelId);
};

window.exportRevenueModel = function() {
    console.log('Exporting revenue model...');
    // Excel-Export Logik
};

// Export
export { initRevenueModel };