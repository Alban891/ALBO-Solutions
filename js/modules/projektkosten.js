/**
 * CFO Dashboard - Projektkosten Module
 * KI-gestützte Kostenplanung mit Timeline und Personal-Detailplanung
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';
import * as api from '../api.js';

// Render Projektkosten Tab Content
export function renderProjektkosten() {
    const projektId = window.cfoDashboard.currentProjekt;
    if (!projektId) return;
    
    const container = document.getElementById('projekt-tab-projektkosten');
    if (!container) return;
    
    // Hole Projekt und Artikel für KI-Analyse
    const projekt = state.getProjekt(projektId);
    const artikel = state.getArtikelByProjekt(projektId);
    
    // Generiere KI-Empfehlung basierend auf Artikel-Typen
    const empfehlung = generiereKostenEmpfehlung(artikel);
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <!-- KI-Analyse Header -->
            <div style="background: linear-gradient(135deg, #dbeafe, #e0e7ff); 
                        padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">
                            🤖 KI-Projektkosten-Assistent
                        </h4>
                        <div style="font-size: 12px; color: var(--text);">
                            Erkannt: <strong>${empfehlung.titel}</strong> | 
                            Empfohlene Vorlaufzeit: <strong>${empfehlung.vorlaufzeit} Monate</strong> | 
                            Nachlaufzeit: <strong>${empfehlung.nachlaufzeit} Monate</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Projekt-Timeline -->
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--border);">
                <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">⏱️ Projekt-Timeline</h4>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <div>
                        <label style="font-size: 10px; color: var(--gray); text-transform: uppercase;">Projektstart</label>
                        <input type="month" id="projekt-start" value="2024-01" 
                               onchange="window.updateProjektZeitraum()"
                               style="width: 100%; padding: 6px; border: 1px solid var(--border); 
                                      border-radius: 4px; font-size: 12px;">
                    </div>
                    
                    <div>
                        <label style="font-size: 10px; color: var(--gray); text-transform: uppercase;">
                            Release (aus Artikel)
                        </label>
                        <div style="padding: 6px; background: var(--gray-100); border-radius: 4px; 
                                    font-size: 12px; font-weight: 600;">
                            ${artikel[0]?.release_datum || '2025-01'}
                        </div>
                    </div>
                    
                    <div>
                        <label style="font-size: 10px; color: var(--gray); text-transform: uppercase;">Projektende</label>
                        <input type="month" id="projekt-ende" value="2027-12" 
                               onchange="window.updateProjektZeitraum()"
                               style="width: 100%; padding: 6px; border: 1px solid var(--border); 
                                      border-radius: 4px; font-size: 12px;">
                    </div>
                </div>
            </div>

            <!-- Kostenblöcke konfigurieren -->
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; 
                        border: 1px solid var(--border);">
                <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">
                    📊 Kostenblöcke konfigurieren
                </h4>
                
                <div style="background: #f0f9ff; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">
                        ✨ KI-Empfehlung für ${empfehlung.titel}:
                    </div>
                    <div id="empfohlene-kostenblöcke" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${empfehlung.kostenblöcke.map(block => `
                            <div class="kostenblock-item" style="display: inline-flex; align-items: center; 
                                 padding: 6px 10px; background: white; border: 1px solid var(--primary); 
                                 border-radius: 4px;">
                                <input type="checkbox" checked id="block-${block.id}" 
                                       onchange="window.updateKostentabelle()"
                                       style="margin-right: 6px;">
                                <label for="block-${block.id}" style="font-size: 11px; cursor: pointer;">
                                    ${block.icon} ${block.name} (${block.anteil}%)
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <button onclick="window.addKostenblock()" class="btn btn-primary btn-sm">
                    + Eigenen Kostenblock hinzufügen
                </button>
            </div>

            <!-- Kostentabelle -->
            <div id="kosten-tabelle-container">
                ${generateKostenTabelle(empfehlung.kostenblöcke)}
            </div>
        </div>
    `;
    
    // Initialisiere Timeline
    initializeTimeline(empfehlung);
}

// Generiere KI-Empfehlung basierend auf Artikel-Typen
function generiereKostenEmpfehlung(artikel) {
    // Analysiere Artikel-Typen
    const hasHardware = artikel.some(a => a.typ === 'Hardware');
    const hasSoftware = artikel.some(a => a.typ === 'Software');
    const hasService = artikel.some(a => a.typ === 'Service');
    
    let empfehlung = {
        titel: 'Standard-Projekt',
        vorlaufzeit: 6,
        nachlaufzeit: 12,
        kostenblöcke: []
    };
    
    // Hardware-Projekt
    if (hasHardware) {
        empfehlung = {
            titel: 'Hardware-Entwicklung',
            vorlaufzeit: 18,
            nachlaufzeit: 12,
            kostenblöcke: [
                { id: 'personal', name: 'Personal', icon: '👥', anteil: 40 },
                { id: 'material', name: 'Material & Prototypen', icon: '🔧', anteil: 30 },
                { id: 'werkzeuge', name: 'Werkzeuge & Formen', icon: '⚙️', anteil: 20 },
                { id: 'zertifizierung', name: 'Zertifizierung', icon: '📋', anteil: 10 }
            ]
        };
    }
    // Software-Projekt
    else if (hasSoftware) {
        empfehlung = {
            titel: 'Software-Entwicklung', 
            vorlaufzeit: 6,
            nachlaufzeit: 24,
            kostenblöcke: [
                { id: 'personal', name: 'Personal', icon: '👥', anteil: 60 },
                { id: 'cloud', name: 'Cloud & Infrastructure', icon: '☁️', anteil: 20 },
                { id: 'lizenzen', name: 'Software-Lizenzen', icon: '💿', anteil: 15 },
                { id: 'testing', name: 'Testing & QA', icon: '🧪', anteil: 5 }
            ]
        };
    }
    // Service-Projekt
    else if (hasService) {
        empfehlung = {
            titel: 'Service & Beratung',
            vorlaufzeit: 3,
            nachlaufzeit: 6,
            kostenblöcke: [
                { id: 'personal', name: 'Personal', icon: '👥', anteil: 70 },
                { id: 'schulung', name: 'Schulungen', icon: '🎓', anteil: 15 },
                { id: 'reise', name: 'Reisekosten', icon: '✈️', anteil: 10 },
                { id: 'material', name: 'Unterlagen', icon: '📚', anteil: 5 }
            ]
        };
    }
    
    return empfehlung;
}

// Generiere Kostentabelle
function generateKostenTabelle(kostenblöcke) {
    const jahre = ['2024', '2025', '2026', '2027', '2028'];
    
    return `
        <div style="background: white; border-radius: 8px; overflow-x: auto; border: 1px solid var(--border);">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="padding: 8px; text-align: left;">Kostenblock</th>
                        ${jahre.map(jahr => `
                            <th style="padding: 8px; text-align: center;">${jahr}</th>
                        `).join('')}
                        <th style="padding: 8px; text-align: center; font-weight: bold;">Gesamt</th>
                        <th style="padding: 8px; text-align: center;">Aktion</th>
                    </tr>
                </thead>
                <tbody id="kosten-tbody">
                    ${kostenblöcke.map(block => `
                        <tr data-block-id="${block.id}">
                            <td style="padding: 8px; font-weight: 600;">
                                ${block.icon} ${block.name}
                                ${block.id === 'personal' ? `
                                    <button onclick="window.openPersonalDetail('${block.id}')"
                                            class="btn btn-primary btn-sm"
                                            style="margin-left: 8px; padding: 2px 6px; font-size: 9px;">
                                        📊 Details
                                    </button>
                                ` : ''}
                            </td>
                            ${jahre.map(jahr => `
                                <td style="padding: 8px;">
                                    <input type="text" class="kosten-input" 
                                           id="kosten-${block.id}-${jahr}" 
                                           placeholder="0"
                                           onchange="window.updateKostenSumme()"
                                           style="width: 60px; padding: 2px; border: 1px solid var(--border); 
                                                  border-radius: 2px; text-align: right;">
                                </td>
                            `).join('')}
                            <td style="padding: 8px; font-weight: bold;" id="summe-${block.id}">0€</td>
                            <td style="padding: 8px; text-align: center;">
                                <button onclick="window.removeKostenblock('${block.id}')" 
                                        class="btn btn-danger btn-sm"
                                        style="padding: 2px 8px; font-size: 10px;">
                                    ✕
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr style="background: var(--primary); color: white; font-weight: bold;">
                        <td style="padding: 10px;">GESAMT</td>
                        ${jahre.map(jahr => `
                            <td style="padding: 10px; text-align: center;" id="gesamt-${jahr}">0€</td>
                        `).join('')}
                        <td style="padding: 10px; text-align: center;" id="gesamt-total">0€</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

// Initialisiere Timeline mit KI-Empfehlung
function initializeTimeline(empfehlung) {
    // Hole erstes Release-Datum aus Artikeln
    const artikel = state.getArtikelByProjekt(window.cfoDashboard.currentProjekt);
    const releaseDate = artikel[0]?.release_datum || '2025-01';
    const [releaseYear, releaseMonth] = releaseDate.split('-');
    
    // Berechne Start und Ende
    const startYear = parseInt(releaseYear) - Math.floor(empfehlung.vorlaufzeit / 12);
    const endYear = parseInt(releaseYear) + Math.floor(empfehlung.nachlaufzeit / 12);
    
    // Setze Werte
    const startInput = document.getElementById('projekt-start');
    const endeInput = document.getElementById('projekt-ende');
    
    if (startInput) startInput.value = `${startYear}-01`;
    if (endeInput) endeInput.value = `${endYear}-12`;
}

// Window Functions für Event Handler
window.updateKostentabelle = function() {
    renderProjektkosten();
};

window.updateProjektZeitraum = function() {
    // Tabelle mit neuen Jahren neu rendern
    renderProjektkosten();
};

window.updateKostenSumme = function() {
    // Berechne Summen
    const jahre = ['2024', '2025', '2026', '2027', '2028'];
    const jahresSummen = {};
    
    jahre.forEach(jahr => {
        jahresSummen[jahr] = 0;
        
        document.querySelectorAll(`[id^="kosten-"][id$="-${jahr}"]`).forEach(input => {
            const value = parseFloat(input.value) || 0;
            jahresSummen[jahr] += value;
        });
        
        const cell = document.getElementById(`gesamt-${jahr}`);
        if (cell) cell.textContent = helpers.formatCurrency(jahresSummen[jahr]);
    });
    
    // Gesamt-Summe
    const total = Object.values(jahresSummen).reduce((a, b) => a + b, 0);
    const totalCell = document.getElementById('gesamt-total');
    if (totalCell) totalCell.textContent = helpers.formatCurrency(total);
};

window.openPersonalDetail = function(blockId) {
    // Öffne Personal-Detail Sidebar (wie in deinem alten Code)
    alert('Personal-Detailplanung kommt als nächstes!');
};

window.addKostenblock = function() {
    alert('Kostenblock hinzufügen Dialog kommt!');
};

window.removeKostenblock = function(blockId) {
    const row = document.querySelector(`[data-block-id="${blockId}"]`);
    if (row) {
        row.remove();
        window.updateKostenSumme();
    }
};

export default {
    renderProjektkosten
};