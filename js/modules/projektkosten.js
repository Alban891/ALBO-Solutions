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
    const jahre = ['2024', '2025', '2026', '2027', '2028'];
    const jahresSummen = {};
    
    jahre.forEach(jahr => {
        jahresSummen[jahr] = 0;
        
        document.querySelectorAll(`[id^="kosten-"][id$="-${jahr}"]`).forEach(input => {
            const value = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
            jahresSummen[jahr] += value;
        });
        
        const cell = document.getElementById(`gesamt-${jahr}`);
        if (cell) cell.textContent = helpers.formatCurrency(jahresSummen[jahr]) + '€';
    });
    
    // Zeilen-Summen berechnen
    document.querySelectorAll('[data-block-id]').forEach(row => {
        const blockId = row.dataset.blockId;
        let zeileSumme = 0;
        
        jahre.forEach(jahr => {
            const input = document.getElementById(`kosten-${blockId}-${jahr}`);
            if (input) {
                const value = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
                zeileSumme += value;
            }
        });
        
        const sumCell = document.getElementById(`summe-${blockId}`);
        if (sumCell) sumCell.textContent = helpers.formatCurrency(zeileSumme) + '€';
    });
    
    // Gesamt-Summe
    const total = Object.values(jahresSummen).reduce((a, b) => a + b, 0);
    const totalCell = document.getElementById('gesamt-total');
    if (totalCell) totalCell.textContent = helpers.formatCurrency(total) + '€';
};

window.openPersonalDetail = function(blockId) {
    // Öffne Personal-Detail Sidebar (wie in deinem alten Code)
    alert('Personal-Detailplanung kommt als nächstes!');
};

window.addKostenblock = function() {
    openKostenblockModal();
};

window.removeKostenblock = function(blockId) {
    const row = document.querySelector(`[data-block-id="${blockId}"]`);
    if (row) {
        row.remove();
        window.updateKostenSumme();
    }
};

window.openKostenblockModal = function() {
    const modalHTML = `
        <div id="kostenblock-modal" class="modal" style="display: flex; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); align-items: center; justify-content: center;">
            <div class="modal-content" style="background: white; border-radius: 8px; max-width: 500px; width: 90%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <h2 style="margin: 0; color: #1e3a8a; font-size: 18px;">➕ Eigenen Kostenblock hinzufügen</h2>
                </div>
                
                <div class="modal-body" style="padding: 20px;">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Bezeichnung *</label>
                        <input type="text" id="kostenblock-name" 
                               placeholder="z.B. Externe Beratung" 
                               style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; 
                                      border-radius: 4px; font-size: 14px;">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Icon (Emoji)</label>
                        <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; margin-bottom: 8px;">
                            <button type="button" onclick="selectKostenblockIcon('💼')" class="icon-btn" style="padding: 8px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; font-size: 20px;">💼</button>
                            <button type="button" onclick="selectKostenblockIcon('🏭')" class="icon-btn" style="padding: 8px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; font-size: 20px;">🏭</button>
                            <button type="button" onclick="selectKostenblockIcon('🚀')" class="icon-btn" style="padding: 8px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; font-size: 20px;">🚀</button>
                            <button type="button" onclick="selectKostenblockIcon('💡')" class="icon-btn" style="padding: 8px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; font-size: 20px;">💡</button>
                            <button type="button" onclick="selectKostenblockIcon('🛠️')" class="icon-btn" style="padding: 8px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; font-size: 20px;">🛠️</button>
                            <button type="button" onclick="selectKostenblockIcon('📊')" class="icon-btn" style="padding: 8px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; font-size: 20px;">📊</button>
                            <button type="button" onclick="selectKostenblockIcon('🎯')" class="icon-btn" style="padding: 8px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; font-size: 20px;">🎯</button>
                            <button type="button" onclick="selectKostenblockIcon('📈')" class="icon-btn" style="padding: 8px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer; font-size: 20px;">📈</button>
                        </div>
                        <input type="text" id="kostenblock-icon" 
                               placeholder="💼" 
                               value="💼"
                               maxlength="2"
                               style="width: 60px; padding: 10px; border: 1px solid #e5e7eb; 
                                      border-radius: 4px; font-size: 20px; text-align: center;">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Kategorie</label>
                        <select id="kostenblock-kategorie" 
                                style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; 
                                       border-radius: 4px; font-size: 14px; background: white;">
                            <option value="einmalig">Einmalig</option>
                            <option value="laufend">Laufend</option>
                            <option value="variabel">Variabel</option>
                        </select>
                    </div>
                </div>
                
                <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                    <button onclick="closeKostenblockModal()" 
                            style="padding: 10px 20px; border: 1px solid #e5e7eb; background: white; 
                                   border-radius: 6px; cursor: pointer;">
                        Abbrechen
                    </button>
                    <button onclick="saveKostenblock()" 
                            style="padding: 10px 20px; background: #1e3a8a; color: white; 
                                   border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Hinzufügen
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        document.getElementById('kostenblock-name')?.focus();
    }, 100);
};

window.selectKostenblockIcon = function(icon) {
    document.getElementById('kostenblock-icon').value = icon;
    
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.style.background = btn.textContent === icon ? '#dbeafe' : 'white';
        btn.style.border = btn.textContent === icon ? '2px solid #1e3a8a' : '1px solid #e5e7eb';
    });
};

window.closeKostenblockModal = function() {
    const modal = document.getElementById('kostenblock-modal');
    if (modal) modal.remove();
};

window.saveKostenblock = function() {
    const name = document.getElementById('kostenblock-name')?.value;
    const icon = document.getElementById('kostenblock-icon')?.value || '💼';
    const kategorie = document.getElementById('kostenblock-kategorie')?.value;
    
    if (!name || name.trim() === '') {
        alert('Bitte Bezeichnung eingeben!');
        return;
    }
    
    const tbody = document.getElementById('kosten-tbody');
    if (tbody) {
        const newBlockId = 'custom-' + Date.now();
        const jahre = ['2024', '2025', '2026', '2027', '2028'];
        
        const newRow = document.createElement('tr');
        newRow.dataset.blockId = newBlockId;
        newRow.innerHTML = `
            <td style="padding: 8px; font-weight: 600;">
                ${icon} ${name}
                ${kategorie === 'variabel' ? `
                    <span style="font-size: 10px; color: #6b7280; margin-left: 8px;">
                        (${kategorie})
                    </span>
                ` : ''}
            </td>
            ${jahre.map(jahr => `
                <td style="padding: 8px;">
                    <input type="text" class="kosten-input" 
                           id="kosten-${newBlockId}-${jahr}" 
                           placeholder="0"
                           onchange="window.updateKostenSumme()"
                           style="width: 60px; padding: 2px; border: 1px solid #e5e7eb; 
                                  border-radius: 2px; text-align: right;">
                </td>
            `).join('')}
            <td style="padding: 8px; font-weight: bold;" id="summe-${newBlockId}">0€</td>
            <td style="padding: 8px; text-align: center;">
                <button onclick="window.removeKostenblock('${newBlockId}')" 
                        class="btn btn-danger btn-sm"
                        style="padding: 2px 8px; font-size: 10px;">
                    ✕
                </button>
            </td>
        `;
        
        // Füge neue Zeile vor der Footer-Zeile ein
        const tfoot = tbody.parentElement.querySelector('tfoot');
        if (tfoot) {
            tbody.appendChild(newRow);
        }
    }
    
    closeKostenblockModal();
    
    if (window.cfoDashboard?.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
            level: 'success',
            title: '✅ Kostenblock hinzugefügt',
            text: `"${name}" wurde erfolgreich angelegt.`,
            timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
    }
};

// Personal-Detail Sidebar öffnen
window.openPersonalDetail = function(blockId) {
    const sidebarHTML = `
        <div id="personal-detail-sidebar" style="position: fixed; top: 0; right: -50%; bottom: 0; 
             width: 50%; background: white; box-shadow: -2px 0 10px rgba(0,0,0,0.1); 
             z-index: 9998; transition: right 0.3s ease-in-out; overflow-y: auto;">
            
            <!-- Header -->
            <div style="padding: 20px; background: linear-gradient(135deg, #dbeafe, #e0e7ff); 
                        border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 16px; color: var(--primary);">
                        👥 Personalkosten - Detailplanung
                    </h3>
                    <button onclick="window.closePersonalDetail()" 
                            style="background: transparent; border: none; font-size: 20px; 
                                   cursor: pointer; color: var(--gray);">✕</button>
                </div>
            </div>
            
            <!-- KI-Hinweise -->
            <div id="ki-hints" style="padding: 16px; background: #fef3c7; border-left: 4px solid var(--warning); 
                                       margin: 16px;">
                <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px;">
                    🤖 KI-Analyse:
                </div>
                <div id="ki-feedback" style="font-size: 11px; line-height: 1.5;">
                    Analysiere Teamzusammensetzung...
                </div>
            </div>
            
            <!-- Positions-Tabelle -->
            <div style="padding: 20px;">
                <h4 style="font-size: 14px; margin-bottom: 16px;">Team-Zusammensetzung</h4>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid var(--border);">
                            <th style="padding: 10px; text-align: left;">Position</th>
                            <th style="padding: 10px; text-align: center;">Anzahl</th>
                            <th style="padding: 10px; text-align: center;">Gehalt/Jahr</th>
                            <th style="padding: 10px; text-align: center;">2024</th>
                            <th style="padding: 10px; text-align: center;">2025</th>
                            <th style="padding: 10px; text-align: center;">2026</th>
                            <th style="padding: 10px; text-align: center;">2027</th>
                            <th style="padding: 10px; text-align: center;">Gesamt</th>
                            <th style="padding: 10px; text-align: center;">Aktion</th>
                        </tr>
                    </thead>
                    <tbody id="personal-detail-tbody">
                        ${generatePersonalPositions()}
                    </tbody>
                    <tfoot>
                        <tr style="background: var(--primary); color: white; font-weight: bold;">
                            <td style="padding: 10px;" colspan="3">SUMME</td>
                            <td style="padding: 10px; text-align: center;" id="personal-sum-2024">0€</td>
                            <td style="padding: 10px; text-align: center;" id="personal-sum-2025">0€</td>
                            <td style="padding: 10px; text-align: center;" id="personal-sum-2026">0€</td>
                            <td style="padding: 10px; text-align: center;" id="personal-sum-2027">0€</td>
                            <td style="padding: 10px; text-align: center;" id="personal-sum-total">0€</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
                
                <button onclick="window.addPersonalPosition()" 
                        class="btn btn-primary btn-sm"
                        style="margin-top: 16px;">
                    + Position hinzufügen
                </button>
                
                <!-- Vorlagen -->
                <div style="margin-top: 20px; padding: 16px; background: #f0f9ff; border-radius: 8px;">
                    <h5 style="font-size: 13px; margin-bottom: 12px;">🎯 Schnell-Vorlagen</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <button onclick="window.applyPersonalTemplate('scrum')" 
                                class="btn btn-secondary btn-sm">
                            Scrum Team (8 Personen)
                        </button>
                        <button onclick="window.applyPersonalTemplate('startup')" 
                                class="btn btn-secondary btn-sm">
                            Startup Team (3 Personen)
                        </button>
                        <button onclick="window.applyPersonalTemplate('enterprise')" 
                                class="btn btn-secondary btn-sm">
                            Enterprise Team (15 Personen)
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Footer mit Aktionen -->
            <div style="position: sticky; bottom: 0; padding: 20px; background: white; 
                        border-top: 1px solid var(--border); display: flex; justify-content: space-between;">
                <button onclick="window.closePersonalDetail()" 
                        class="btn btn-secondary">
                    Abbrechen
                </button>
                <button onclick="window.savePersonalDetail()" 
                        class="btn btn-primary">
                    Übernehmen & Schließen
                </button>
            </div>
        </div>
    `;
    
    // Füge Sidebar zum DOM hinzu
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
    
    // Slide-in Animation
    setTimeout(() => {
        document.getElementById('personal-detail-sidebar').style.right = '0';
    }, 10);
    
    // Initial-Berechnung
    window.calculatePersonalSums();
    window.checkPersonalPlausibility();
};

// Generiere Standard-Positionen basierend auf Projekt-Typ
function generatePersonalPositions() {
    // Hole Artikel um Projekt-Typ zu bestimmen
    const artikel = state.getArtikelByProjekt(window.cfoDashboard.currentProjekt);
    const hasSoftware = artikel.some(a => a.typ === 'Software');
    const hasHardware = artikel.some(a => a.typ === 'Hardware');
    
    let positions = [];
    
    if (hasSoftware) {
        positions = [
            { id: 'senior-dev', name: 'Senior Developer', anzahl: 3, gehalt: 120000 },
            { id: 'junior-dev', name: 'Junior Developer', anzahl: 2, gehalt: 70000 },
            { id: 'pm', name: 'Projektleiter', anzahl: 1, gehalt: 130000 },
            { id: 'qa', name: 'QA Engineer', anzahl: 2, gehalt: 85000 }
        ];
    } else if (hasHardware) {
        positions = [
            { id: 'hw-engineer', name: 'Hardware Engineer', anzahl: 2, gehalt: 110000 },
            { id: 'mech-engineer', name: 'Mechanical Engineer', anzahl: 2, gehalt: 95000 },
            { id: 'pm', name: 'Projektleiter', anzahl: 1, gehalt: 130000 },
            { id: 'technician', name: 'Techniker', anzahl: 3, gehalt: 65000 }
        ];
    } else {
        positions = [
            { id: 'consultant', name: 'Senior Consultant', anzahl: 2, gehalt: 140000 },
            { id: 'analyst', name: 'Business Analyst', anzahl: 3, gehalt: 85000 },
            { id: 'pm', name: 'Projektleiter', anzahl: 1, gehalt: 130000 }
        ];
    }
    
    return positions.map(pos => `
        <tr data-position-id="${pos.id}">
            <td style="padding: 8px;">
                <input type="text" value="${pos.name}" class="position-name"
                       style="width: 100%; padding: 4px; border: 1px solid var(--border); 
                              border-radius: 3px; font-size: 11px;">
            </td>
            <td style="padding: 8px; text-align: center;">
                <input type="number" value="${pos.anzahl}" min="0" step="0.5" class="position-anzahl"
                       onchange="window.calculatePersonalSums(); window.checkPersonalPlausibility();"
                       style="width: 60px; padding: 4px; border: 1px solid var(--border); 
                              border-radius: 3px; text-align: center;">
            </td>
            <td style="padding: 8px;">
                <input type="number" value="${pos.gehalt}" step="1000" class="position-gehalt"
                       onchange="window.calculatePersonalSums(); window.checkPersonalPlausibility();"
                       style="width: 80px; padding: 4px; border: 1px solid var(--border); 
                              border-radius: 3px; text-align: right;">€
            </td>
            ${['2024', '2025', '2026', '2027'].map((jahr, index) => `
                <td style="padding: 8px;">
                    <input type="number" min="0" max="${pos.anzahl}" step="0.5" 
                           class="position-fte-${jahr}"
                           value="${pos.anzahl}"
                           onchange="window.calculatePersonalSums();"
                           style="width: 50px; padding: 4px; border: 1px solid var(--border); 
                                  border-radius: 3px; text-align: center;">
                </td>
            `).join('')}
            <td style="padding: 8px; text-align: right; font-weight: bold;" 
                class="position-summe">0€</td>
            <td style="padding: 8px; text-align: center;">
                <button onclick="window.removePersonalPosition('${pos.id}')"
                        class="btn btn-danger btn-sm"
                        style="padding: 2px 6px; font-size: 10px;">✕</button>
            </td>
        </tr>
    `).join('');
}

// Berechne Personal-Summen
window.calculatePersonalSums = function() {
    const tbody = document.getElementById('personal-detail-tbody');
    if (!tbody) return;
    
    const jahre = ['2024', '2025', '2026', '2027'];
    const jahresSummen = {};
    jahre.forEach(jahr => jahresSummen[jahr] = 0);
    
    let gesamtSumme = 0;
    
    // Durchlaufe alle Positionen
    tbody.querySelectorAll('tr').forEach(row => {
        const anzahl = parseFloat(row.querySelector('.position-anzahl')?.value) || 0;
        const gehalt = parseFloat(row.querySelector('.position-gehalt')?.value) || 0;
        
        let positionsSumme = 0;
        
        // Berechne für jedes Jahr
        jahre.forEach(jahr => {
            const fteInput = row.querySelector(`.position-fte-${jahr}`);
            const fte = parseFloat(fteInput?.value) || anzahl;
            const jahresKosten = fte * gehalt;
            jahresSummen[jahr] += jahresKosten;
            positionsSumme += jahresKosten;
        });
        
        // Update Positionssumme
        const sumCell = row.querySelector('.position-summe');
        if (sumCell) {
            sumCell.textContent = helpers.formatCurrency(positionsSumme / 1000) + 'k€';
        }
        
        gesamtSumme += positionsSumme;
    });
    
    // Update Footer-Summen
    jahre.forEach(jahr => {
        const cell = document.getElementById(`personal-sum-${jahr}`);
        if (cell) {
            cell.textContent = helpers.formatCurrency(jahresSummen[jahr] / 1000) + 'k€';
        }
    });
    
    const totalCell = document.getElementById('personal-sum-total');
    if (totalCell) {
        totalCell.textContent = helpers.formatCurrency(gesamtSumme / 1000) + 'k€';
    }
};

// KI-Plausibilitätsprüfung
window.checkPersonalPlausibility = function() {
    const feedback = document.getElementById('ki-feedback');
    if (!feedback) return;
    
    const warnings = [];
    const tbody = document.getElementById('personal-detail-tbody');
    
    // Prüfe Gehälter
    tbody.querySelectorAll('tr').forEach(row => {
        const nameInput = row.querySelector('.position-name');
        const gehaltInput = row.querySelector('.position-gehalt');
        
        const position = nameInput?.value.toLowerCase() || '';
        const gehalt = parseFloat(gehaltInput?.value) || 0;
        
        // Plausibilitätsprüfungen
        if (position.includes('praktikant') && gehalt > 30000) {
            warnings.push(`⚠️ Praktikanten-Gehalt (${gehalt}€) ungewöhnlich hoch`);
        }
        if (position.includes('senior') && gehalt < 80000) {
            warnings.push(`⚠️ Senior-Position unter Marktdurchschnitt`);
        }
        if (position.includes('junior') && gehalt > 100000) {
            warnings.push(`⚠️ Junior-Gehalt über Marktdurchschnitt`);
        }
    });
    
    // Team-Zusammensetzung prüfen
    const devCount = [...tbody.querySelectorAll('.position-name')]
        .filter(i => i.value.toLowerCase().includes('developer')).length;
    const qaCount = [...tbody.querySelectorAll('.position-name')]
        .filter(i => i.value.toLowerCase().includes('qa') || i.value.toLowerCase().includes('test')).length;
    
    if (devCount > 3 && qaCount === 0) {
        warnings.push(`💡 Empfehlung: QA-Ressourcen für ${devCount} Entwickler fehlen`);
    }
    
    // Update KI-Feedback
    if (warnings.length > 0) {
        feedback.innerHTML = warnings.join('<br>');
        feedback.parentElement.style.background = '#fef3c7';
    } else {
        feedback.innerHTML = '✅ Teamzusammensetzung sieht plausibel aus';
        feedback.parentElement.style.background = '#d1fae5';
    }
};

// Weitere Personal-Funktionen
window.closePersonalDetail = function() {
    const sidebar = document.getElementById('personal-detail-sidebar');
    if (sidebar) {
        sidebar.style.right = '-50%';
        setTimeout(() => sidebar.remove(), 300);
    }
};

window.savePersonalDetail = function() {
    // Übertrage Summen in Haupttabelle
    const jahre = ['2024', '2025', '2026', '2027'];
    jahre.forEach(jahr => {
        const sumValue = document.getElementById(`personal-sum-${jahr}`);
        const mainInput = document.getElementById(`kosten-personal-${jahr}`);
        if (sumValue && mainInput) {
            const value = sumValue.textContent.replace('k€', '').replace(',', '.');
            mainInput.value = parseFloat(value) || 0;
        }
    });
    
    // Update Haupttabelle
    window.updateKostenSumme();
    
    // Schließe Sidebar
    window.closePersonalDetail();
};

window.addPersonalPosition = function() {
    const tbody = document.getElementById('personal-detail-tbody');
    if (!tbody) return;
    
    const newId = 'pos-' + Date.now();
    const newRow = document.createElement('tr');
    newRow.dataset.positionId = newId;
    
    newRow.innerHTML = `
        <td style="padding: 8px;">
            <input type="text" value="Neue Position" class="position-name"
                   style="width: 100%; padding: 4px; border: 1px solid var(--border); 
                          border-radius: 3px; font-size: 11px;">
        </td>
        <td style="padding: 8px; text-align: center;">
            <input type="number" value="1" min="0" step="0.5" class="position-anzahl"
                   onchange="window.calculatePersonalSums(); window.checkPersonalPlausibility();"
                   style="width: 60px; padding: 4px; border: 1px solid var(--border); 
                          border-radius: 3px; text-align: center;">
        </td>
        <td style="padding: 8px;">
            <input type="number" value="80000" step="1000" class="position-gehalt"
                   onchange="window.calculatePersonalSums(); window.checkPersonalPlausibility();"
                   style="width: 80px; padding: 4px; border: 1px solid var(--border); 
                          border-radius: 3px; text-align: right;">€
        </td>
        ${['2024', '2025', '2026', '2027'].map(jahr => `
            <td style="padding: 8px;">
                <input type="number" min="0" max="1" step="0.5" 
                       class="position-fte-${jahr}"
                       value="1"
                       onchange="window.calculatePersonalSums();"
                       style="width: 50px; padding: 4px; border: 1px solid var(--border); 
                              border-radius: 3px; text-align: center;">
            </td>
        `).join('')}
        <td style="padding: 8px; text-align: right; font-weight: bold;" 
            class="position-summe">0€</td>
        <td style="padding: 8px; text-align: center;">
            <button onclick="window.removePersonalPosition('${newId}')"
                    class="btn btn-danger btn-sm"
                    style="padding: 2px 6px; font-size: 10px;">✕</button>
        </td>
    `;
    
    tbody.appendChild(newRow);
    window.calculatePersonalSums();
};

window.removePersonalPosition = function(posId) {
    const row = document.querySelector(`[data-position-id="${posId}"]`);
    if (row) {
        row.remove();
        window.calculatePersonalSums();
        window.checkPersonalPlausibility();
    }
};

window.applyPersonalTemplate = function(template) {
    const tbody = document.getElementById('personal-detail-tbody');
    if (!tbody) return;
    
    let positions = [];
    
    switch(template) {
        case 'scrum':
            positions = [
                { name: 'Product Owner', anzahl: 1, gehalt: 140000 },
                { name: 'Scrum Master', anzahl: 1, gehalt: 110000 },
                { name: 'Senior Developer', anzahl: 3, gehalt: 120000 },
                { name: 'Developer', anzahl: 2, gehalt: 85000 },
                { name: 'QA Engineer', anzahl: 1, gehalt: 85000 }
            ];
            break;
        case 'startup':
            positions = [
                { name: 'Tech Lead', anzahl: 1, gehalt: 130000 },
                { name: 'Full-Stack Developer', anzahl: 2, gehalt: 95000 }
            ];
            break;
        case 'enterprise':
            positions = [
                { name: 'Program Manager', anzahl: 1, gehalt: 160000 },
                { name: 'Projektleiter', anzahl: 2, gehalt: 130000 },
                { name: 'Senior Developer', anzahl: 4, gehalt: 120000 },
                { name: 'Developer', anzahl: 4, gehalt: 85000 },
                { name: 'QA Lead', anzahl: 1, gehalt: 100000 },
                { name: 'QA Engineer', anzahl: 2, gehalt: 85000 },
                { name: 'Business Analyst', anzahl: 1, gehalt: 95000 }
            ];
            break;
    }
    
    // Clear table and add template positions
    tbody.innerHTML = positions.map((pos, index) => {
        const id = template + '-' + index;
        return `
            <tr data-position-id="${id}">
                <td style="padding: 8px;">
                    <input type="text" value="${pos.name}" class="position-name"
                           style="width: 100%; padding: 4px; border: 1px solid var(--border); 
                                  border-radius: 3px; font-size: 11px;">
                </td>
                <td style="padding: 8px; text-align: center;">
                    <input type="number" value="${pos.anzahl}" min="0" step="0.5" class="position-anzahl"
                           onchange="window.calculatePersonalSums(); window.checkPersonalPlausibility();"
                           style="width: 60px; padding: 4px; border: 1px solid var(--border); 
                                  border-radius: 3px; text-align: center;">
                </td>
                <td style="padding: 8px;">
                    <input type="number" value="${pos.gehalt}" step="1000" class="position-gehalt"
                           onchange="window.calculatePersonalSums(); window.checkPersonalPlausibility();"
                           style="width: 80px; padding: 4px; border: 1px solid var(--border); 
                                  border-radius: 3px; text-align: right;">€
                </td>
                ${['2024', '2025', '2026', '2027'].map(jahr => `
                    <td style="padding: 8px;">
                        <input type="number" min="0" max="${pos.anzahl}" step="0.5" 
                               class="position-fte-${jahr}"
                               value="${pos.anzahl}"
                               onchange="window.calculatePersonalSums();"
                               style="width: 50px; padding: 4px; border: 1px solid var(--border); 
                                      border-radius: 3px; text-align: center;">
                    </td>
                `).join('')}
                <td style="padding: 8px; text-align: right; font-weight: bold;" 
                    class="position-summe">0€</td>
                <td style="padding: 8px; text-align: center;">
                    <button onclick="window.removePersonalPosition('${id}')"
                            class="btn btn-danger btn-sm"
                            style="padding: 2px 6px; font-size: 10px;">✕</button>
                </td>
            </tr>
        `;
    }).join('');
    
    window.calculatePersonalSums();
    window.checkPersonalPlausibility();
};

export default {
    renderProjektkosten
};
