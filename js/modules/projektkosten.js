/**
 * CFO Dashboard - Projektkosten Module
 * KI-gestützte Kostenplanung mit Timeline und Personal-Detailplanung
 * 
 * FIXES in dieser Version:
 * - Doppelte €-Zeichen behoben
 * - Korrekte Summenübertragung von Personal Detail zu Haupttabelle
 * - Verbesserte Formatierung und Parsing
 * - Dynamische Jahre-Berechnung optimiert
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';
import * as api from '../api.js';

// Render Projektkosten Tab Content
export async function renderProjektkosten() {
    const projektId = window.cfoDashboard.currentProjekt;
    if (!projektId) return;
    
    const container = document.getElementById('projekt-tab-projektkosten');
    if (!container) return;
    
    // 🆕 SUPABASE: Lade gespeicherte Kostenblöcke aus DB ZUERST!
    if (projektId.startsWith('projekt-db-')) {
        console.log('📥 DB-Projekt erkannt - lade Kostenblöcke aus Supabase...');
        await loadKostenbloeckeFromDB(projektId);
        await loadPersonalPositionenFromDB(projektId);
    }
    
    // JETZT ERST Projekt und Artikel holen (NACH dem Laden!)
    const projekt = state.getProjekt(projektId);
    const artikel = state.getArtikelByProjekt(projektId);
    
    // Generiere KI-Empfehlung mit verbesserter Analyse
    const empfehlung = generiereKostenEmpfehlung(artikel, projekt);
    
    // Hole gespeicherte aktive Kostenblöcke oder nutze Defaults
    const aktiveBlöcke = projekt.aktiveKostenblöcke || empfehlung.kostenblöcke.map(b => b.id);
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <!-- Header mit Speichern-Button -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">💰 Projektkosten</h3>
                <button class="btn btn-primary" onclick="window.saveProjektkostenToDB()" 
                        style="display: flex; align-items: center; gap: 8px;">
                    <span>💾</span>
                    <span>Alle Änderungen speichern</span>
                </button>
            </div>

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
                        ${empfehlung.kontext ? `
                            <div style="font-size: 11px; color: var(--gray); margin-top: 4px; font-style: italic;">
                                Basierend auf: ${empfehlung.kontext}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Projekt-Timeline -->
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--border);">
                <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">⏱️ Projekt-Timeline</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="font-size: 10px; color: var(--gray); text-transform: uppercase;">Projektstart</label>
                        <input type="month" id="projekt-start" value="2024-01" 
                            onchange="window.updateProjektZeitraum()"
                            style="width: 100%; padding: 6px; border: 1px solid var(--border); 
                                    border-radius: 4px; font-size: 12px;">
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
                                <input type="checkbox" 
                                       ${aktiveBlöcke.includes(block.id) ? 'checked' : ''} 
                                       id="block-${block.id}" 
                                       data-block-id="${block.id}"
                                       data-block-name="${block.name}"
                                       data-block-icon="${block.icon}"
                                       data-block-anteil="${block.anteil}"
                                       onchange="window.toggleKostenblock(this)"
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
                ${generateKostenTabelle(empfehlung.kostenblöcke.filter(b => aktiveBlöcke.includes(b.id)))}
            </div>
        </div>
    `;
    
    // Initialisiere Timeline
    initializeTimeline(empfehlung);

    // ✅ NEU: Nach dem Rendern die Werte aus dem State in die Inputs laden
    setTimeout(() => {
        restoreKostenwerteInInputs();
        window.updateKostenSumme();
    }, 100);
}

// Generiere KI-Empfehlung basierend auf Projekt-Kontext und Artikel-Typen
function generiereKostenEmpfehlung(artikel, projekt) {
    const beschreibung = (projekt?.beschreibung || '').toLowerCase();
    const projektName = (projekt?.name || '').toLowerCase();
    
    const hasHardware = artikel.some(a => a.typ === 'Hardware' || a.kategorie === 'Hardware');
    const hasSoftware = artikel.some(a => a.typ === 'Software' || a.kategorie === 'Software');
    const hasService = artikel.some(a => a.typ === 'Service' || a.kategorie === 'Service');
    const hasAI = beschreibung.includes('ki') || beschreibung.includes('ai') || 
                  beschreibung.includes('machine learning') || beschreibung.includes('künstliche intelligenz');
    const hasCloud = beschreibung.includes('cloud') || beschreibung.includes('saas') || 
                     beschreibung.includes('azure') || beschreibung.includes('aws');
    const hasSecurity = beschreibung.includes('security') || beschreibung.includes('cyber') || 
                        beschreibung.includes('sicherheit') || projektName.includes('security');
    
    let empfehlung = {
        titel: 'Standard-Projekt',
        vorlaufzeit: 6,
        nachlaufzeit: 12,
        kostenblöcke: [],
        kontext: ''
    };
    
    // Cyber Security Projekt (aus Beispiel)
    if (hasSecurity) {
        empfehlung = {
            titel: 'Cyber Security Consulting',
            vorlaufzeit: 3,
            nachlaufzeit: 24,
            kostenblöcke: [
                { id: 'personal', name: 'Personal', icon: '👥', anteil: 60 },
                { id: 'security-tools', name: 'Security Tools & Lizenzen', icon: '🔒', anteil: 15 },
                { id: 'audits', name: 'Audits & Pentesting', icon: '🔍', anteil: 10 },
                { id: 'schulung', name: 'Security Awareness Training', icon: '🎓', anteil: 10 },
                { id: 'compliance', name: 'Compliance & Zertifizierung', icon: '📋', anteil: 5 }
            ],
            kontext: 'Security-Fokus mit Beratungskomponenten erkannt'
        };
    }
    // Hardware-Projekt
    else if (hasHardware) {
        empfehlung = {
            titel: 'Hardware-Entwicklung',
            vorlaufzeit: 18,
            nachlaufzeit: 12,
            kostenblöcke: [
                { id: 'personal', name: 'Personal', icon: '👥', anteil: 40 },
                { id: 'material', name: 'Material & Prototypen', icon: '🔧', anteil: 30 },
                { id: 'werkzeuge', name: 'Werkzeuge & Formen', icon: '⚙️', anteil: 20 },
                { id: 'zertifizierung', name: 'Zertifizierung', icon: '📋', anteil: 10 }
            ],
            kontext: `${artikel.filter(a => a.typ === 'Hardware').length} Hardware-Artikel identifiziert`
        };
    }
    // AI/ML Projekt
    else if (hasAI) {
        empfehlung = {
            titel: 'AI/ML-Entwicklung',
            vorlaufzeit: 9,
            nachlaufzeit: 18,
            kostenblöcke: [
                { id: 'personal', name: 'Data Scientists & Engineers', icon: '👥', anteil: 50 },
                { id: 'compute', name: 'GPU/Compute Resources', icon: '🖥️', anteil: 25 },
                { id: 'daten', name: 'Daten-Beschaffung & Labeling', icon: '📊', anteil: 15 },
                { id: 'tools', name: 'ML-Tools & Frameworks', icon: '🤖', anteil: 10 }
            ],
            kontext: 'KI/ML-Komponenten in Projektbeschreibung gefunden'
        };
    }
    // Software-Projekt
    else if (hasSoftware || hasCloud) {
        empfehlung = {
            titel: hasCloud ? 'Cloud Software-Entwicklung' : 'Software-Entwicklung', 
            vorlaufzeit: 6,
            nachlaufzeit: 24,
            kostenblöcke: [
                { id: 'personal', name: 'Personal', icon: '👥', anteil: 60 },
                { id: 'cloud', name: 'Cloud & Infrastructure', icon: '☁️', anteil: 20 },
                { id: 'lizenzen', name: 'Software-Lizenzen', icon: '💿', anteil: 15 },
                { id: 'testing', name: 'Testing & QA', icon: '🧪', anteil: 5 }
            ],
            kontext: hasCloud ? 'Cloud-basierte Lösung erkannt' : 'Software-Entwicklungsprojekt'
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
            ],
            kontext: 'Dienstleistungsprojekt identifiziert'
        };
    }
    
    return empfehlung;
}

// Generiere Kostentabelle mit dynamischen Jahren
function generateKostenTabelle(kostenblöcke) {
    const startDatum = document.getElementById('projekt-start')?.value || '2024-01';
    const endeDatum = document.getElementById('projekt-ende')?.value || '2027-12';
    
    const startYear = parseInt(startDatum.split('-')[0]);
    const endeYear = parseInt(endeDatum.split('-')[0]);
    
    const jahre = [];
    for (let jahr = startYear; jahr <= endeYear; jahr++) {
        jahre.push(jahr.toString());
    }
    
    const projektId = window.cfoDashboard.currentProjekt;
    const projekt = state.getProjekt(projektId);
    const aktiveBlöcke = projekt?.aktiveKostenblöcke || kostenblöcke.map(b => b.id);
    
    const sichtbareBlöcke = kostenblöcke.filter(b => aktiveBlöcke.includes(b.id));
    
    return `
    <div style="background: white; border-radius: 8px; overflow-x: auto; border: 1px solid var(--border);">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed;">
            <thead>
                <tr style="background: #f8fafc;">
                    <th style="padding: 8px; text-align: left; width: 200px;">Kostenblock</th>
                    ${jahre.map(jahr => `
                        <th style="padding: 8px; text-align: center; width: 100px;">${jahr}</th>
                    `).join('')}
                    <th style="padding: 8px; text-align: center; font-weight: bold; width: 100px;">Gesamt</th>
                    <th style="padding: 8px; text-align: center; width: 80px;">Aktion</th>
                </tr>
            </thead>
            <tbody id="kosten-tbody">
                ${sichtbareBlöcke.map(block => `
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
                            <td style="padding: 8px; text-align: center;">
                                <input type="text" class="kosten-input" 
                                       id="kosten-${block.id}-${jahr}" 
                                       placeholder="0"
                                       value="${getSavedValue(block.id, jahr) || ''}"
                                       onfocus="window.handleKostenInputFocus(this)"
                                       onblur="window.handleKostenInputBlur(this)"
                                       onchange="window.updateKostenSumme(); window.saveKostenValue('${block.id}', '${jahr}', this.value)"
                                       style="width: 70px; padding: 2px; border: 1px solid var(--border); 
                                              border-radius: 2px; text-align: right;">
                            </td>
                        `).join('')}
                        <td style="padding: 8px; text-align: center; font-weight: bold;" id="summe-${block.id}">0</td>
                        <td style="padding: 8px; text-align: center;">
                            <button onclick="window.removeAndUncheckKostenblock('${block.id}')" 
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
                        <td style="padding: 10px; text-align: center;" id="gesamt-${jahr}">0</td>
                    `).join('')}
                    <td style="padding: 10px; text-align: center;" id="gesamt-total">0</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    </div>
`;
}

// Initialisiere Timeline mit KI-Empfehlung
function initializeTimeline(empfehlung) {
    const artikel = state.getArtikelByProjekt(window.cfoDashboard.currentProjekt);
    const releaseDate = artikel[0]?.release_datum || '2025-01';
    const [releaseYear, releaseMonth] = releaseDate.split('-');
    
    const startYear = parseInt(releaseYear) - Math.floor(empfehlung.vorlaufzeit / 12);
    const endYear = parseInt(releaseYear) + Math.floor(empfehlung.nachlaufzeit / 12);
    
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
    renderProjektkosten();
};

// Formatierungs-Handler für Kosten-Inputs
window.handleKostenInputFocus = function(input) {
    // Beim Focus: Entferne Formatierung für einfacheres Editieren
    if (input.value) {
        const numValue = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
        input.value = numValue;
    }
};

window.handleKostenInputBlur = function(input) {
    // Beim Blur: Formatiere wieder (deutsch, ohne €)
    if (input.value) {
        const numValue = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
        if (numValue > 0) {
            input.value = numValue.toLocaleString('de-DE', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        }
    }
};

window.updateKostenSumme = function() {
    // Stelle sicher dass wir nur die sichtbare Tabelle verwenden
    const container = document.getElementById('kosten-tabelle-container');
    if (!container) return;
    
    const table = container.querySelector('table');
    if (!table) return;
    
    const headerCells = table.querySelectorAll('thead th');
    const jahre = [];
    
    for (let i = 1; i < headerCells.length - 2; i++) {
        const jahr = headerCells[i].textContent.trim();
        if (jahr && !isNaN(jahr)) {
            jahre.push(jahr);
        }
    }
    
    const jahresSummen = {};
    
    // Berechne Spalten-Summen (über alle Blöcke)
    jahre.forEach(jahr => {
        jahresSummen[jahr] = 0;
        
        // Nutze nur Inputs innerhalb dieser spezifischen Tabelle
        table.querySelectorAll(`input[id^="kosten-"][id$="-${jahr}"]`).forEach(input => {
            const value = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
            jahresSummen[jahr] += value;
        });
        
        const cell = document.getElementById(`gesamt-${jahr}`);
        if (cell) cell.textContent = helpers.formatCurrency(jahresSummen[jahr]);
    });
    
    // Berechne Zeilen-Summen (pro Block über alle Jahre)
    table.querySelectorAll('tbody tr[data-block-id]').forEach(row => {
        const blockId = row.dataset.blockId;
        let zeileSumme = 0;
        
        jahre.forEach(jahr => {
            // Nutze querySelector innerhalb der Row um sicherzustellen dass wir den richtigen Input haben
            const input = row.querySelector(`#kosten-${blockId}-${jahr}`);
            if (input) {
                const value = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
                zeileSumme += value;
            }
        });
        
        const sumCell = document.getElementById(`summe-${blockId}`);
        if (sumCell) sumCell.textContent = helpers.formatCurrency(zeileSumme);
    });
    
    // Berechne Gesamt-Summe
    const total = Object.values(jahresSummen).reduce((a, b) => a + b, 0);
    const totalCell = document.getElementById('gesamt-total');
    if (totalCell) totalCell.textContent = helpers.formatCurrency(total);
};

window.openPersonalDetail = function(blockId) {
    const startDatum = document.getElementById('projekt-start')?.value || '2024-01';
    const endeDatum = document.getElementById('projekt-ende')?.value || '2027-12';
    const startYear = parseInt(startDatum.split('-')[0]);
    const endeYear = parseInt(endeDatum.split('-')[0]);
    
    const jahre = [];
    for (let jahr = startYear; jahr <= endeYear; jahr++) {
        jahre.push(jahr);
    }
    
    const jahreHeaders = jahre.map(jahr => 
        `<th style="padding: 10px; text-align: center;">${jahr}<br><span style="font-size: 10px; font-weight: normal;">FTE</span></th>`
    ).join('');
    
    const jahreFooterCells = jahre.map(jahr =>
        `<td style="padding: 10px; text-align: center;" id="personal-sum-${jahr}">0</td>`
    ).join('');
    
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
            
            <!-- Kostenfaktoren Toggle -->
            <div style="padding: 16px; background: #f8fafc; border-bottom: 1px solid var(--border);">
                <div style="font-size: 12px; font-weight: 600; margin-bottom: 12px;">
                    💰 Kostenfaktoren einbeziehen:
                </div>
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
                        <input type="checkbox" id="toggle-nebenkosten" checked 
                               onchange="window.updatePersonalBerechnung()">
                        <span>Nebenkosten (+30%)</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
                        <input type="checkbox" id="toggle-gehaltssteigerung" checked 
                               onchange="window.updatePersonalBerechnung()">
                        <span>Gehaltssteigerung (2,5% p.a.)</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
                        <input type="checkbox" id="toggle-fluktuation" 
                               onchange="window.updatePersonalBerechnung()">
                        <span>Fluktuationsreserve (+10%)</span>
                    </label>
                </div>
                <div style="font-size: 10px; color: var(--gray); margin-top: 8px; font-style: italic;">
                    Nebenkosten = AG-Anteil SV, Arbeitsplatz, IT-Ausstattung, Benefits
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
                            <th style="padding: 10px; text-align: center;">Basis-Gehalt<br><span style="font-size: 10px; font-weight: normal;">(Brutto p.a.)</span></th>
                            <th style="padding: 10px; text-align: center;">Vollkosten<br><span style="font-size: 10px; font-weight: normal;">(inkl. NK)</span></th>
                            ${jahreHeaders}
                            <th style="padding: 10px; text-align: center;">Gesamt</th>
                            <th style="padding: 10px; text-align: center;">Aktion</th>
                        </tr>
                    </thead>
                    <tbody id="personal-detail-tbody">
                        ${generatePersonalPositionsVollkostenDynamic(jahre)}
                    </tbody>
                    <tfoot>
                        <tr style="background: var(--primary); color: white; font-weight: bold;">
                            <td style="padding: 10px;" colspan="3">SUMME</td>
                            ${jahreFooterCells}
                            <td style="padding: 10px; text-align: center;" id="personal-sum-total">0</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
                
                <!-- Berechnungshinweis -->
                <div style="margin-top: 12px; padding: 12px; background: #f0f9ff; border-radius: 6px;">
                    <div style="font-size: 10px; color: var(--gray);">
                        <strong>Berechnungsformel:</strong><br>
                        <span id="formel-anzeige">
                            Kosten = Basis-Gehalt × 1,3 (NK) × FTE × Steigerungsfaktor
                        </span>
                    </div>
                </div>
                
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
    
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
    
    setTimeout(() => {
        document.getElementById('personal-detail-sidebar').style.right = '0';
    }, 10);
    
    window.updatePersonalBerechnung();
    window.checkPersonalPlausibilityVollkosten();
};

// Generiere Personal-Positionen mit Vollkosten und dynamischen Jahren
function generatePersonalPositionsVollkostenDynamic(jahre) {
    const artikel = state.getArtikelByProjekt(window.cfoDashboard.currentProjekt);
    const hasSoftware = artikel.some(a => a.typ === 'Software');
    const hasHardware = artikel.some(a => a.typ === 'Hardware');
    const hasService = artikel.some(a => a.typ === 'Service');
    
    const projektDauer = jahre.length;
    let positions = [];
    
    if (hasSoftware) {
        positions = [
            { 
                id: 'senior-dev', 
                name: 'Senior Developer', 
                gehalt: 120000,
                ftePattern: generateFTEPattern('entwicklung', projektDauer, [0.5, 2.0, 3.0, 2.0, 1.0, 0.5])
            },
            { 
                id: 'junior-dev', 
                name: 'Junior Developer', 
                gehalt: 70000,
                ftePattern: generateFTEPattern('entwicklung', projektDauer, [1.0, 2.0, 2.0, 1.5, 0.5, 0])
            },
            { 
                id: 'pm', 
                name: 'Projektleiter', 
                gehalt: 130000,
                ftePattern: generateFTEPattern('management', projektDauer, [0.5, 1.0, 1.0, 1.0, 0.5, 0.5])
            },
            { 
                id: 'qa', 
                name: 'QA Engineer', 
                gehalt: 85000,
                ftePattern: generateFTEPattern('testing', projektDauer, [0, 1.0, 2.0, 2.0, 1.0, 0.5])
            },
            { 
                id: 'devops', 
                name: 'DevOps Engineer', 
                gehalt: 110000,
                ftePattern: generateFTEPattern('infrastruktur', projektDauer, [0.5, 1.0, 1.5, 1.0, 1.0, 0.5])
            }
        ];
    } 
    else if (hasHardware) {
        positions = [
            { 
                id: 'hw-engineer', 
                name: 'Hardware Engineer', 
                gehalt: 110000,
                ftePattern: generateFTEPattern('entwicklung', projektDauer, [1.0, 2.0, 2.0, 1.5, 1.0, 0.5])
            },
            { 
                id: 'mech-engineer', 
                name: 'Mechanical Engineer', 
                gehalt: 95000,
                ftePattern: generateFTEPattern('entwicklung', projektDauer, [0.5, 2.0, 2.0, 1.0, 0.5, 0])
            },
            { 
                id: 'pm', 
                name: 'Projektleiter', 
                gehalt: 130000,
                ftePattern: generateFTEPattern('management', projektDauer, [0.5, 1.0, 1.0, 1.0, 0.5, 0.5])
            },
            { 
                id: 'technician', 
                name: 'Techniker', 
                gehalt: 65000,
                ftePattern: generateFTEPattern('produktion', projektDauer, [1.0, 2.0, 3.0, 2.0, 1.0, 0.5])
            },
            { 
                id: 'quality', 
                name: 'Qualitätsingenieur', 
                gehalt: 90000,
                ftePattern: generateFTEPattern('testing', projektDauer, [0, 0.5, 1.0, 1.5, 1.0, 0.5])
            }
        ];
    } 
    else {
        positions = [
            { 
                id: 'consultant', 
                name: 'Senior Consultant', 
                gehalt: 140000,
                ftePattern: generateFTEPattern('beratung', projektDauer, [1.0, 2.0, 2.0, 1.0, 0.5, 0])
            },
            { 
                id: 'analyst', 
                name: 'Business Analyst', 
                gehalt: 85000,
                ftePattern: generateFTEPattern('analyse', projektDauer, [1.0, 2.0, 3.0, 2.0, 1.0, 0.5])
            },
            { 
                id: 'pm', 
                name: 'Projektleiter', 
                gehalt: 130000,
                ftePattern: generateFTEPattern('management', projektDauer, [0.5, 1.0, 1.0, 0.5, 0.5, 0])
            },
            { 
                id: 'trainer', 
                name: 'Trainer/Coach', 
                gehalt: 95000,
                ftePattern: generateFTEPattern('schulung', projektDauer, [0, 0.5, 1.0, 1.5, 1.0, 0.5])
            }
        ];
    }
    
    return positions.map(pos => {
        let fteValues = adjustFTEToProjectLength(pos.ftePattern, projektDauer);
        
        return `
            <tr data-position-id="${pos.id}">
                <td style="padding: 8px;">
                    <input type="text" value="${pos.name}" class="position-name"
                           style="width: 100%; padding: 4px; border: 1px solid var(--border); 
                                  border-radius: 3px; font-size: 11px;">
                </td>
                <td style="padding: 8px; text-align: right;">
                    <input type="text" value="${helpers.formatCurrency(pos.gehalt)}" class="position-gehalt"
                        onchange="window.updatePersonalBerechnung();"
                        placeholder="0"
                        style="width: 90px; padding: 4px; border: 1px solid var(--border); 
                                border-radius: 3px; text-align: right;">
                </td>
                <td style="padding: 8px; text-align: right; background: #f8fafc; font-weight: 600;" 
                    class="position-vollkosten">
                    ${helpers.formatCurrency(pos.gehalt * 1.3)}
                </td>
                ${jahre.map((jahr, index) => `
                    <td style="padding: 8px;">
                        <input type="number" min="0" max="10" step="0.1" 
                               class="position-fte-${jahr}"
                               value="${fteValues[index]}"
                               onchange="window.updatePersonalBerechnung();"
                               style="width: 50px; padding: 4px; border: 1px solid var(--border); 
                                      border-radius: 3px; text-align: center; font-size: 11px;">
                    </td>
                `).join('')}
                <td style="padding: 8px; text-align: right; font-weight: bold;" 
                    class="position-summe">0</td>
                <td style="padding: 8px; text-align: center;">
                    <button onclick="window.removePersonalPosition('${pos.id}')"
                            class="btn btn-danger btn-sm"
                            style="padding: 2px 6px; font-size: 10px;">✕</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Hilfsfunktion: Generiere FTE-Pattern basierend auf Rolle und Projektdauer
function generateFTEPattern(rolle, projektDauer, idealPattern) {
    if (projektDauer <= 2) {
        switch(rolle) {
            case 'entwicklung':
                return [1.5, 1.0];
            case 'management':
                return [1.0, 0.5];
            case 'testing':
                return [0.5, 1.0];
            case 'infrastruktur':
                return [0.5, 0.5];
            case 'beratung':
                return [2.0, 1.0];
            case 'analyse':
                return [1.5, 1.0];
            case 'produktion':
                return [1.0, 2.0];
            case 'schulung':
                return [0, 1.0];
            default:
                return [1.0, 0.5];
        }
    } else if (projektDauer === 3) {
        switch(rolle) {
            case 'entwicklung':
                return [1.0, 2.5, 1.0];
            case 'management':
                return [0.5, 1.0, 0.5];
            case 'testing':
                return [0, 1.5, 1.0];
            case 'infrastruktur':
                return [0.5, 1.0, 0.5];
            case 'beratung':
                return [1.0, 2.0, 0.5];
            case 'analyse':
                return [1.5, 2.0, 1.0];
            case 'produktion':
                return [0.5, 2.0, 1.5];
            case 'schulung':
                return [0, 1.0, 0.5];
            default:
                return [0.5, 1.0, 0.5];
        }
    } else if (projektDauer === 4) {
        return idealPattern.slice(0, 4);
    } else {
        if (projektDauer <= 6) {
            return idealPattern.slice(0, projektDauer);
        } else {
            let extended = [...idealPattern];
            while (extended.length < projektDauer) {
                extended.push(0.25);
            }
            return extended;
        }
    }
}

// Hilfsfunktion: Passe FTE-Array an Projektlänge an
function adjustFTEToProjectLength(ftePattern, targetLength) {
    if (!ftePattern || ftePattern.length === 0) {
        return Array(targetLength).fill(0.5);
    }
    
    if (ftePattern.length === targetLength) {
        return ftePattern;
    } else if (ftePattern.length > targetLength) {
        return ftePattern.slice(0, targetLength);
    } else {
        let extended = [...ftePattern];
        while (extended.length < targetLength) {
            extended.push(0);
        }
        return extended;
    }
}

// Update Personal-Berechnung mit Vollkosten - KORRIGIERT
window.updatePersonalBerechnung = function() {
    const tbody = document.getElementById('personal-detail-tbody');
    if (!tbody) return;
    
    const mitNebenkosten = document.getElementById('toggle-nebenkosten')?.checked;
    const mitGehaltssteigerung = document.getElementById('toggle-gehaltssteigerung')?.checked;
    const mitFluktuation = document.getElementById('toggle-fluktuation')?.checked;
    
    const nkFaktor = mitNebenkosten ? 1.3 : 1.0;
    const fluktuationsFaktor = mitFluktuation ? 1.1 : 1.0;
    
    const startDatum = document.getElementById('projekt-start')?.value || '2024-01';
    const endeDatum = document.getElementById('projekt-ende')?.value || '2027-12';
    const startYear = parseInt(startDatum.split('-')[0]);
    const endeYear = parseInt(endeDatum.split('-')[0]);
    const jahre = [];
    for (let jahr = startYear; jahr <= endeYear; jahr++) {
        jahre.push(jahr.toString());
    }
    const jahresSummen = {};
    jahre.forEach(jahr => jahresSummen[jahr] = 0);
    
    let gesamtSumme = 0;
    
    const formelAnzeige = document.getElementById('formel-anzeige');
    if (formelAnzeige) {
        let formel = 'Kosten = Basis-Gehalt';
        if (mitNebenkosten) formel += ' × 1,3 (NK)';
        formel += ' × FTE';
        if (mitGehaltssteigerung) formel += ' × Steigerung';
        if (mitFluktuation) formel += ' × 1,1 (Flukt.)';
        formelAnzeige.textContent = formel;
    }
    
    tbody.querySelectorAll('tr').forEach(row => {
        const gehaltInput = row.querySelector('.position-gehalt');
        let gehaltValue = gehaltInput?.value || '0';
        gehaltValue = gehaltValue.replace(/\./g, '').replace(',', '.').replace('€', '').trim();
        const gehalt = parseFloat(gehaltValue) || 0;
        
        // FIX: Vollkosten-Anzeige OHNE doppeltes €
        const vollkostenCell = row.querySelector('.position-vollkosten');
        if (vollkostenCell) {
            vollkostenCell.textContent = helpers.formatCurrency(gehalt * nkFaktor);
        }
        
        let positionsSumme = 0;
        
        jahre.forEach((jahr, index) => {
            const fteInput = row.querySelector(`.position-fte-${jahr}`);
            const fte = parseFloat(fteInput?.value) || 0;
            
            const steigerungsFaktor = mitGehaltssteigerung ? Math.pow(1.025, index) : 1.0;
            
            const jahresKosten = gehalt * nkFaktor * fte * steigerungsFaktor * fluktuationsFaktor;
            jahresSummen[jahr] += jahresKosten;
            positionsSumme += jahresKosten;
        });
        
        // FIX: Update Positionssumme OHNE doppeltes €
        const sumCell = row.querySelector('.position-summe');
        if (sumCell) {
            sumCell.textContent = helpers.formatCurrency(positionsSumme);
        }
        
        gesamtSumme += positionsSumme;
    });
    
    // FIX: Update Footer-Summen OHNE doppeltes €
    jahre.forEach(jahr => {
        const cell = document.getElementById(`personal-sum-${jahr}`);
        if (cell) {
            cell.textContent = helpers.formatCurrency(jahresSummen[jahr]);
        }
    });
    
    const totalCell = document.getElementById('personal-sum-total');
    if (totalCell) {
        totalCell.textContent = helpers.formatCurrency(gesamtSumme);
    }
    
    window.checkPersonalPlausibilityVollkosten();
};

// Erweiterte KI-Plausibilitätsprüfung mit Vollkosten
window.checkPersonalPlausibilityVollkosten = function() {
    const feedback = document.getElementById('ki-feedback');
    if (!feedback) return;
    
    const warnings = [];
    const tbody = document.getElementById('personal-detail-tbody');
    
    const startDatum = document.getElementById('projekt-start')?.value || '2024-01';
    const endeDatum = document.getElementById('projekt-ende')?.value || '2027-12';
    const startYear = parseInt(startDatum.split('-')[0]);
    const endeYear = parseInt(endeDatum.split('-')[0]);
    const jahre = [];
    for (let jahr = startYear; jahr <= endeYear; jahr++) {
        jahre.push(jahr.toString());
    }
    
    const fteTotals = {};
    jahre.forEach(jahr => {
        fteTotals[jahr] = [...tbody.querySelectorAll(`.position-fte-${jahr}`)]
            .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
    });
    
    if (jahre.length >= 2) {
        const firstYear = jahre[0];
        const lastYear = jahre[jahre.length - 1];
        
        if (fteTotals[firstYear] < 2) {
            warnings.push(`⚠️ ${firstYear}: Nur ${fteTotals[firstYear].toFixed(1)} FTE - Zu wenig für Projektstart?`);
        }
        
        for (let i = 0; i < jahre.length - 1; i++) {
            const currentYear = jahre[i];
            const nextYear = jahre[i + 1];
            
            if (fteTotals[nextYear] > fteTotals[currentYear] * 1.5 && fteTotals[currentYear] > 0) {
                warnings.push(`📈 Starker Anstieg ${currentYear}→${nextYear} - Recruiting rechtzeitig planen!`);
            }
        }
        
        if (jahre.length >= 2) {
            const secondLastYear = jahre[jahre.length - 2];
            if (fteTotals[lastYear] > fteTotals[secondLastYear] * 0.5) {
                warnings.push(`💡 ${lastYear}: Hohe Nachbetreuung - Support-Vertrag prüfen`);
            }
        }
    }
    
    tbody.querySelectorAll('tr').forEach(row => {
        const nameInput = row.querySelector('.position-name');
        const gehaltInput = row.querySelector('.position-gehalt');
        
        const position = nameInput?.value.toLowerCase() || '';
        let gehaltValue = gehaltInput?.value || '0';
        gehaltValue = gehaltValue.replace(/\./g, '').replace(',', '.').replace('€', '').trim();
        const gehalt = parseFloat(gehaltValue) || 0;
        
        if (position.includes('senior') && gehalt < 100000) {
            warnings.push(`⚠️ ${nameInput.value}: Gehalt unter Markt (< 100k€)`);
        }
        if (position.includes('junior') && gehalt > 80000) {
            warnings.push(`💰 ${nameInput.value}: Gehalt über Junior-Niveau`);
        }
    });
    
    const mitNebenkosten = document.getElementById('toggle-nebenkosten')?.checked;
    if (!mitNebenkosten) {
        warnings.push(`🚨 Nebenkosten deaktiviert - Kalkulation ~30% zu niedrig!`);
    }
    
    if (warnings.length > 0) {
        feedback.innerHTML = warnings.join('<br>');
        feedback.parentElement.style.background = '#fef3c7';
    } else {
        const avgFTE = Object.values(fteTotals).reduce((a, b) => a + b, 0) / jahre.length;
        feedback.innerHTML = '✅ Teamplanung sieht plausibel aus<br>' +
                             `📊 Durchschnitt: ${avgFTE.toFixed(1)} FTE/Jahr`;
        feedback.parentElement.style.background = '#d1fae5';
    }
};

window.closePersonalDetail = function() {
    const sidebar = document.getElementById('personal-detail-sidebar');
    if (sidebar) {
        sidebar.style.right = '-50%';
        setTimeout(() => sidebar.remove(), 300);
    }
};

// FIX: Save Personal Detail - Korrekte Übertragung OHNE Formatierung
window.savePersonalDetail = async function() {
    const startDatum = document.getElementById('projekt-start')?.value || '2024-01';
    const endeDatum = document.getElementById('projekt-ende')?.value || '2027-12';
    const startYear = parseInt(startDatum.split('-')[0]);
    const endeYear = parseInt(endeDatum.split('-')[0]);
    
    const jahre = [];
    for (let jahr = startYear; jahr <= endeYear; jahr++) {
        jahre.push(jahr.toString());
    }
    
    // FIX: Schreibe UNFORMATIERTE Zahlen in die Inputs
    // Die Inputs enthalten unformatierte Werte, formatierung erfolgt nur in Anzeige-Zellen
    jahre.forEach(jahr => {
        const sumCell = document.getElementById(`personal-sum-${jahr}`);
        const mainInput = document.getElementById(`kosten-personal-${jahr}`);
        
        if (sumCell && mainInput) {
            let value = sumCell.textContent;
            value = value.replace(/\./g, '').replace(',', '.').replace('€', '').trim();
            const numValue = parseFloat(value) || 0;
            
            // Schreibe unformatierte Zahl ins Input-Feld
            mainInput.value = Math.round(numValue);
            
            // Trigger Blur Event für Formatierung
            window.handleKostenInputBlur(mainInput);
        }
    });
    
    window.updateKostenSumme();
    
    // 🆕 SUPABASE: Speichere Personal-Positionen nach DB
    const projektId = window.cfoDashboard.currentProjekt;
    if (projektId && projektId.startsWith('projekt-db-')) {
        await savePersonalDetailToDB(projektId, jahre);
    }
    
    window.closePersonalDetail();
    
    if (window.cfoDashboard?.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
            level: 'success',
            title: '✅ Personalkosten übernommen',
            text: 'Die detaillierten Personalkosten wurden in die Haupttabelle übertragen und gespeichert.',
            timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
    }
};

/**
 * Speichere Personal-Detail nach Supabase
 */
async function savePersonalDetailToDB(projektId, jahre) {
    try {
        const tbody = document.getElementById('personal-detail-tbody');
        if (!tbody) return;
        
        const positionen = [];
        
        // Sammle alle Positionen aus der Tabelle
        tbody.querySelectorAll('tr[data-position-id]').forEach(row => {
            const positionId = row.dataset.positionId;
            const nameInput = row.querySelector('.position-name');
            const gehaltInput = row.querySelector('.position-gehalt');
            
            const name = nameInput?.value || 'Unbenannt';
            let gehaltValue = gehaltInput?.value || '0';
            gehaltValue = gehaltValue.replace(/\./g, '').replace(',', '.').replace('€', '').trim();
            const basisGehalt = parseFloat(gehaltValue) || 0;
            
            // Nebenkosten-Faktor (1.3 = 30%)
            const mitNebenkosten = document.getElementById('toggle-nebenkosten')?.checked;
            const nkFaktor = mitNebenkosten ? 1.3 : 1.0;
            const vollkosten = basisGehalt * nkFaktor;
            
            // Sammle FTE-Werte für alle Jahre
            const fteWerte = {};
            jahre.forEach(jahr => {
                const fteInput = row.querySelector(`.position-fte-${jahr}`);
                const fte = parseFloat(fteInput?.value) || 0;
                if (fte > 0) {
                    fteWerte[jahr] = fte;
                }
            });
            
            // Nur speichern wenn FTE-Werte vorhanden
            if (Object.keys(fteWerte).length > 0) {
                positionen.push({
                    id: positionId,
                    name: name,
                    basisGehalt: basisGehalt,
                    vollkosten: vollkosten,
                    fteWerte: fteWerte,
                    nebenkostenFaktor: nkFaktor,
                    gehaltssteigerung: 0.025 // 2.5% Standard
                });
            }
        });
        
        if (positionen.length > 0) {
            await savePersonalPositionenToDB(projektId, positionen);
            console.log('✅ Personal-Positionen nach DB gespeichert:', positionen.length);
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern der Personal-Positionen:', error);
    }
}

window.addPersonalPosition = function() {
    const tbody = document.getElementById('personal-detail-tbody');
    if (!tbody) return;
    
    const startDatum = document.getElementById('projekt-start')?.value || '2024-01';
    const endeDatum = document.getElementById('projekt-ende')?.value || '2027-12';
    const startYear = parseInt(startDatum.split('-')[0]);
    const endeYear = parseInt(endeDatum.split('-')[0]);
    const jahre = [];
    for (let jahr = startYear; jahr <= endeYear; jahr++) {
        jahre.push(jahr);
    }
    
    const newId = 'pos-' + Date.now();
    const newRow = document.createElement('tr');
    newRow.dataset.positionId = newId;
    
    newRow.innerHTML = `
        <td style="padding: 8px;">
            <input type="text" value="Neue Position" class="position-name"
                   style="width: 100%; padding: 4px; border: 1px solid var(--border); 
                          border-radius: 3px; font-size: 11px;">
        </td>
        <td style="padding: 8px; text-align: right;">
            <input type="text" value="${helpers.formatCurrency(80000)}" class="position-gehalt"
                onchange="window.updatePersonalBerechnung();"
                placeholder="0"
                style="width: 90px; padding: 4px; border: 1px solid var(--border); 
                        border-radius: 3px; text-align: right;">
        </td>
        <td style="padding: 8px; text-align: right; background: #f8fafc; font-weight: 600;" 
            class="position-vollkosten">
            ${helpers.formatCurrency(80000 * 1.3)}
        </td>
        ${jahre.map(jahr => `
            <td style="padding: 8px;">
                <input type="number" min="0" max="10" step="0.1" 
                       class="position-fte-${jahr}"
                       value="1"
                       onchange="window.updatePersonalBerechnung();"
                       style="width: 50px; padding: 4px; border: 1px solid var(--border); 
                              border-radius: 3px; text-align: center; font-size: 11px;">
            </td>
        `).join('')}
        <td style="padding: 8px; text-align: right; font-weight: bold;" 
            class="position-summe">0</td>
        <td style="padding: 8px; text-align: center;">
            <button onclick="window.removePersonalPosition('${newId}')"
                    class="btn btn-danger btn-sm"
                    style="padding: 2px 6px; font-size: 10px;">✕</button>
        </td>
    `;
    
    tbody.appendChild(newRow);
    window.updatePersonalBerechnung();
};

window.removePersonalPosition = function(posId) {
    const row = document.querySelector(`[data-position-id="${posId}"]`);
    if (row) {
        row.remove();
        window.updatePersonalBerechnung();
        window.checkPersonalPlausibilityVollkosten();
    }
};

window.applyPersonalTemplate = function(template) {
    const tbody = document.getElementById('personal-detail-tbody');
    if (!tbody) return;
    
    const startDatum = document.getElementById('projekt-start')?.value || '2024-01';
    const endeDatum = document.getElementById('projekt-ende')?.value || '2027-12';
    const startYear = parseInt(startDatum.split('-')[0]);
    const endeYear = parseInt(endeDatum.split('-')[0]);
    const jahre = [];
    for (let jahr = startYear; jahr <= endeYear; jahr++) {
        jahre.push(jahr);
    }
    
    let positions = [];
    
    switch(template) {
        case 'scrum':
            positions = [
                { name: 'Product Owner', gehalt: 140000, fte: 1 },
                { name: 'Scrum Master', gehalt: 110000, fte: 1 },
                { name: 'Senior Developer', gehalt: 120000, fte: 3 },
                { name: 'Developer', gehalt: 85000, fte: 2 },
                { name: 'QA Engineer', gehalt: 85000, fte: 1 }
            ];
            break;
        case 'startup':
            positions = [
                { name: 'Tech Lead', gehalt: 130000, fte: 1 },
                { name: 'Full-Stack Developer', gehalt: 95000, fte: 2 }
            ];
            break;
        case 'enterprise':
            positions = [
                { name: 'Program Manager', gehalt: 160000, fte: 1 },
                { name: 'Projektleiter', gehalt: 130000, fte: 2 },
                { name: 'Senior Developer', gehalt: 120000, fte: 4 },
                { name: 'Developer', gehalt: 85000, fte: 4 },
                { name: 'QA Lead', gehalt: 100000, fte: 1 },
                { name: 'QA Engineer', gehalt: 85000, fte: 2 },
                { name: 'Business Analyst', gehalt: 95000, fte: 1 }
            ];
            break;
    }
    
    tbody.innerHTML = positions.map((pos, index) => {
        const id = template + '-' + index;
        return `
            <tr data-position-id="${id}">
                <td style="padding: 8px;">
                    <input type="text" value="${pos.name}" class="position-name"
                           style="width: 100%; padding: 4px; border: 1px solid var(--border); 
                                  border-radius: 3px; font-size: 11px;">
                </td>
                <td style="padding: 8px; text-align: right;">
                    <input type="text" value="${helpers.formatCurrency(pos.gehalt)}" class="position-gehalt"
                        onchange="window.updatePersonalBerechnung();"
                        placeholder="0"
                        style="width: 90px; padding: 4px; border: 1px solid var(--border); 
                                border-radius: 3px; text-align: right;">
                </td>
                <td style="padding: 8px; text-align: right; background: #f8fafc; font-weight: 600;" 
                    class="position-vollkosten">
                    ${helpers.formatCurrency(pos.gehalt * 1.3)}
                </td>
                ${jahre.map(jahr => `
                    <td style="padding: 8px;">
                        <input type="number" min="0" max="10" step="0.1" 
                               class="position-fte-${jahr}"
                               value="${pos.fte}"
                               onchange="window.updatePersonalBerechnung();"
                               style="width: 50px; padding: 4px; border: 1px solid var(--border); 
                                      border-radius: 3px; text-align: center; font-size: 11px;">
                    </td>
                `).join('')}
                <td style="padding: 8px; text-align: right; font-weight: bold;" 
                    class="position-summe">0</td>
                <td style="padding: 8px; text-align: center;">
                    <button onclick="window.removePersonalPosition('${id}')"
                            class="btn btn-danger btn-sm"
                            style="padding: 2px 6px; font-size: 10px;">✕</button>
                </td>
            </tr>
        `;
    }).join('');
    
    window.updatePersonalBerechnung();
    window.checkPersonalPlausibilityVollkosten();
};

window.addKostenblock = function() {
    openKostenblockModal();
};

window.removeKostenblock = function(blockId) {
    const row = document.querySelector(`[data-block-id="${blockId}"]`);
    if (row) {
        row.remove();
        window.updateKostenSumme();
        
        const checkbox = document.getElementById(`block-${blockId}`);
        if (checkbox) {
            checkbox.checked = false;
            saveAktiveKostenblöcke();
        }
    }
};

window.toggleKostenblock = async function(checkbox) {
    const projektId = window.cfoDashboard.currentProjekt;
    
    console.log('🔧 toggleKostenblock called:', {
        projektId,
        cfoDashboard: window.cfoDashboard,
        checkbox: checkbox?.id
    });
    
    // Validierung: Prüfe ob projektId existiert
    if (!projektId) {
        console.error('❌ Kein Projekt ausgewählt! window.cfoDashboard.currentProjekt ist:', projektId);
        alert('Fehler: Kein Projekt ausgewählt. Bitte wählen Sie erst ein Projekt aus.');
        return;
    }
    
    const aktiveBlöcke = [];
    document.querySelectorAll('#empfohlene-kostenblöcke input[type="checkbox"]:checked').forEach(cb => {
        aktiveBlöcke.push(cb.dataset.blockId);
    });
    
    const projekt = state.getProjekt(projektId);
    if (projekt) {
        projekt.aktiveKostenblöcke = aktiveBlöcke;
        state.setProjekt(projektId, projekt);
        state.saveState();
    } else {
        console.error('❌ Projekt nicht gefunden:', projektId);
        return;
    }
    
    // 🆕 SUPABASE: Beim ersten Mal ALLE Blöcke initialisieren
    if (projektId.startsWith('projekt-db-')) {
        // Sammle ALLE Checkbox-Daten (auch inaktive)
        const alleBlöcke = [];
        document.querySelectorAll('#empfohlene-kostenblöcke input[type="checkbox"]').forEach(cb => {
            const blockId = cb.dataset.blockId;
            const blockName = cb.dataset.blockName || blockId;
            const blockIcon = cb.dataset.blockIcon || '📦';
            const blockAnteil = parseInt(cb.dataset.blockAnteil) || 0;
            
            alleBlöcke.push({
                id: blockId,
                name: blockName,
                icon: blockIcon,
                anteil: blockAnteil,
                isActive: cb.checked, // TRUE wenn checked
                kostenWerte: projekt.kostenWerte?.[blockId] || {}
            });
        });
        
        console.log('💾 Initialisiere Kostenblöcke für Projekt:', projektId, 'Anzahl:', alleBlöcke.length);
        
        // Speichere ALLE Blöcke (damit sie in DB existieren)
        await saveAllKostenbloeckeToDB(projektId, alleBlöcke);
    }
    
    renderProjektkosten();
}

window.removeAndUncheckKostenblock = function(blockId) {
    const checkbox = document.getElementById(`block-${blockId}`);
    if (checkbox) {
        checkbox.checked = false;
    }
    
    const aktiveBlöcke = [];
    document.querySelectorAll('#empfohlene-kostenblöcke input[type="checkbox"]:checked').forEach(cb => {
        aktiveBlöcke.push(cb.dataset.blockId);
    });
    
    const projektId = window.cfoDashboard.currentProjekt;
    const projekt = state.getProjekt(projektId);
    if (projekt) {
        projekt.aktiveKostenblöcke = aktiveBlöcke;
        state.setProjekt(projektId, projekt);
        state.saveState();
    }
    
    renderProjektkosten();
}

function saveAktiveKostenblöcke() {
    const projektId = window.cfoDashboard.currentProjekt;
    const projekt = state.getProjekt(projektId);
    if (!projekt) return;
    
    const aktiveBlöcke = [];
    document.querySelectorAll('#empfohlene-kostenblöcke input[type="checkbox"]:checked').forEach(cb => {
        aktiveBlöcke.push(cb.dataset.blockId);
    });
    
    projekt.aktiveKostenblöcke = aktiveBlöcke;
    state.setProjekt(projektId, projekt);
    state.saveState();
}

window.saveKostenValue = function(blockId, jahr, value) {
    const projektId = window.cfoDashboard.currentProjekt;
    const projekt = state.getProjekt(projektId);
    if (!projekt) return;
    
    if (!projekt.kostenWerte) projekt.kostenWerte = {};
    if (!projekt.kostenWerte[blockId]) projekt.kostenWerte[blockId] = {};
    
    projekt.kostenWerte[blockId][jahr] = parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
    
    state.setProjekt(projektId, projekt);
    state.saveState();
    
    // 🆕 SUPABASE: Speichere nach DB (mit Debouncing)
    if (projektId.startsWith('projekt-db-')) {
        debouncedSaveKostenblockToDB(projektId, blockId, jahr, projekt.kostenWerte[blockId][jahr]);
    }
}

function getSavedValue(blockId, jahr) {
    const projektId = window.cfoDashboard.currentProjekt;
    const projekt = state.getProjekt(projektId);
    
    if (projekt?.kostenWerte?.[blockId]?.[jahr]) {
        // Gebe formatierte Zahl zurück für bessere UX (deutsch formatiert, ohne €)
        const value = projekt.kostenWerte[blockId][jahr];
        
        // Wenn Wert eine Zahl ist, formatiere sie
        if (typeof value === 'number' && value > 0) {
            return value.toLocaleString('de-DE', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        }
        
        return value.toString();
    }
    return '';
}

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
    
    const headerCells = document.querySelectorAll('thead th');
    const jahre = [];
    
    for (let i = 1; i < headerCells.length - 2; i++) {
        const jahr = headerCells[i].textContent.trim();
        if (jahr && !isNaN(jahr)) {
            jahre.push(jahr);
        }
    }
    
    const tbody = document.getElementById('kosten-tbody');
    if (tbody) {
        const newBlockId = 'custom-' + Date.now();
        
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
                           style="width: 70px; padding: 2px; border: 1px solid var(--border); 
                                  border-radius: 2px; text-align: right;">
                </td>
            `).join('')}
            <td style="padding: 8px; font-weight: bold;" id="summe-${newBlockId}">0</td>
            <td style="padding: 8px; text-align: center;">
                <button onclick="window.removeKostenblock('${newBlockId}')" 
                        class="btn btn-danger btn-sm"
                        style="padding: 2px 8px; font-size: 10px;">
                    ✕
                </button>
            </td>
        `;
        
        tbody.appendChild(newRow);
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

/**
     * Restore Kostenwerte from State into Input fields
     * Called after rendering to populate inputs with saved data
     */
    function restoreKostenwerteInInputs() {
        const projektId = window.cfoDashboard.currentProjekt;
        const projekt = state.getProjekt(projektId);
        
        if (!projekt || !projekt.kostenWerte) {
            console.log('ℹ️ Keine gespeicherten Kostenwerte vorhanden');
            return;
        }
        
        console.log('🔄 Lade Kostenwerte in Input-Felder:', projekt.kostenWerte);
        
        // Durchlaufe alle Kostenblöcke
        Object.keys(projekt.kostenWerte).forEach(blockId => {
            const jahreWerte = projekt.kostenWerte[blockId];
            
            // Durchlaufe alle Jahre
            Object.keys(jahreWerte).forEach(jahr => {
                const wert = jahreWerte[jahr];
                const input = document.getElementById(`kosten-${blockId}-${jahr}`);
                
                if (input && wert) {
                    // Formatiere den Wert (deutsch, ohne €)
                    input.value = wert.toLocaleString('de-DE', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    });
                    console.log(`  ✓ ${blockId} ${jahr}: ${wert}`);
                }
            });
        });
        
        console.log('✅ Kostenwerte in Inputs geladen');
    }

export default {
    renderProjektkosten
};

// ==========================================
// SUPABASE INTEGRATION (NEU)
// ==========================================

/**
 * Lade Kostenblöcke aus Supabase
 * @param {string} projektId - Project ID
 */
async function loadKostenbloeckeFromDB(projektId) {
    try {
        console.log('📥 Lade Kostenblöcke aus Supabase für', projektId);
        
        const dbBlocks = await api.loadKostenblöcke(projektId);
        
        console.log(`✅ Loaded ${dbBlocks.length} Kostenblöcke from Supabase`);
        
        // Wenn keine Daten in DB, dann OK - Projekt ist neu
        if (!dbBlocks || dbBlocks.length === 0) {
            console.log('ℹ️ Keine Kostenblöcke in DB - Projekt ist möglicherweise neu');
            return;
        }
        
        const projekt = state.getProjekt(projektId);
        if (!projekt) return;
        
        // Initialisiere kostenWerte und aktiveKostenblöcke
        projekt.kostenWerte = {};
        projekt.aktiveKostenblöcke = [];
        
        // Übertrage Daten aus DB in State
        dbBlocks.forEach(dbBlock => {
            const blockId = dbBlock.block_id;
            
            // Kostenblöcke als aktiv markieren
            if (dbBlock.is_active) {
                projekt.aktiveKostenblöcke.push(blockId);
            }
            
            // Kosten-Werte übernehmen
            if (dbBlock.kosten_werte && Object.keys(dbBlock.kosten_werte).length > 0) {
                projekt.kostenWerte[blockId] = dbBlock.kosten_werte;
                console.log(`  ✓ Kostenblock "${blockId}" geladen:`, Object.keys(dbBlock.kosten_werte).length, 'Jahre');
            }
        });
        
        // State aktualisieren
        state.setProjekt(projektId, projekt);
        state.saveState(); // Wichtig: Auch in localStorage speichern!
        
        console.log('✅ Kostenblöcke in State übernommen:', {
            aktiveBlöcke: projekt.aktiveKostenblöcke.length,
            kostenWerte: Object.keys(projekt.kostenWerte).length
        });
        
    } catch (error) {
        console.error('❌ Fehler beim Laden der Kostenblöcke:', error);
    }
}

/**
 * Speichere Kostenblock-Wert nach Supabase (debounced)
 */
const debouncedSaveKostenblockToDB = helpers.debounce(async (projektId, blockId, jahr, wert) => {
    try {
        console.log('💾 Speichere Kostenblock nach Supabase:', blockId, jahr, wert);
        
        // Prüfe erst ob Block existiert, sonst erstelle ihn
        const success = await api.updateKostenblockWert(projektId, blockId, jahr, wert);
        
        if (success) {
            console.log('✅ Kostenblock gespeichert');
        } else {
            console.warn('⚠️ Konnte Kostenblock nicht speichern - versuche Initialisierung...');
            
            // Fallback: Initialisiere alle Blöcke
            const projekt = state.getProjekt(projektId);
            if (projekt) {
                const checkbox = document.querySelector(`input[data-block-id="${blockId}"]`);
                if (checkbox) {
                    const alleBloecke = [];
                    document.querySelectorAll('#empfohlene-kostenblöcke input[type="checkbox"]').forEach(cb => {
                        alleBloecke.push({
                            id: cb.dataset.blockId,
                            name: cb.dataset.blockName || cb.dataset.blockId,
                            icon: cb.dataset.blockIcon || '📦',
                            anteil: parseInt(cb.dataset.blockAnteil) || 0,
                            isActive: cb.checked,
                            kostenWerte: projekt.kostenWerte?.[cb.dataset.blockId] || {}
                        });
                    });
                    
                    await saveAllKostenbloeckeToDB(projektId, alleBloecke);
                    console.log('✅ Alle Blöcke initialisiert - versuche erneut...');
                    
                    // Versuche nochmal
                    await api.updateKostenblockWert(projektId, blockId, jahr, wert);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern des Kostenblocks:', error);
    }
}, 1000); // 1 Sekunde Debounce

/**
 * Speichere alle Kostenblöcke nach Supabase
 * @param {string} projektId - Project ID
 * @param {Array} alleBloecke - Alle Blöcke (inkl. inaktive)
 */
async function saveAllKostenbloeckeToDB(projektId, alleBloecke) {
    try {
        const projekt = state.getProjekt(projektId);
        if (!projekt) return;
        
        console.log(`💾 Speichere ${alleBloecke.length} Kostenblöcke nach Supabase...`);
        
        const success = await api.saveKostenblöcke(projektId, alleBloecke);
        
        if (success) {
            console.log('✅ Alle Kostenblöcke erfolgreich gespeichert');
        } else {
            console.error('❌ Speichern fehlgeschlagen');
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern der Kostenblöcke:', error);
    }
}

/**
 * Lade Personal-Positionen aus Supabase
 * @param {string} projektId - Project ID
 */
async function loadPersonalPositionenFromDB(projektId) {
    try {
        console.log('📥 Lade Personal-Positionen aus Supabase für', projektId);
        
        const dbPositionen = await api.loadPersonalPositionen(projektId);
        
        console.log(`✅ Loaded ${dbPositionen.length} Personal-Positionen from Supabase`);
        
        if (!dbPositionen || dbPositionen.length === 0) {
            console.log('ℹ️ Keine Personal-Positionen in DB');
            return;
        }
        
        const projekt = state.getProjekt(projektId);
        if (!projekt) return;
        
        // Konvertiere DB-Format zu App-Format
        projekt.personalPositionen = dbPositionen.map(dbPos => ({
            id: dbPos.position_id,
            name: dbPos.position_name,
            basisGehalt: dbPos.basis_gehalt || 0,
            vollkosten: dbPos.vollkosten || 0,
            fteWerte: dbPos.fte_werte || {},
            nebenkostenFaktor: dbPos.nebenkosten_faktor || 1.30,
            gehaltssteigerung: dbPos.gehaltssteigerung || 0.025
        }));
        
        // ✅ NEU: Berechne und speichere die Summen in kostenWerte['personal']
        if (!projekt.kostenWerte) projekt.kostenWerte = {};
        if (!projekt.kostenWerte['personal']) projekt.kostenWerte['personal'] = {};
        
        // Sammle alle Jahre aus allen Positionen
        const alleJahre = new Set();
        projekt.personalPositionen.forEach(pos => {
            Object.keys(pos.fteWerte || {}).forEach(jahr => alleJahre.add(jahr));
        });
        
        // Berechne Summen pro Jahr
        alleJahre.forEach(jahr => {
            let jahresSumme = 0;
            
            projekt.personalPositionen.forEach(pos => {
                const fte = pos.fteWerte?.[jahr] || 0;
                const nkFaktor = pos.nebenkostenFaktor || 1.3;
                const gehalt = pos.basisGehalt || 0;
                const steigerung = pos.gehaltssteigerung || 0.025;
                
                // Berechne Index (Jahr - erstes Jahr)
                const sortedJahre = Array.from(alleJahre).sort();
                const jahrIndex = sortedJahre.indexOf(jahr);
                const steigerungsFaktor = Math.pow(1 + steigerung, jahrIndex);
                
                const kosten = gehalt * nkFaktor * fte * steigerungsFaktor;
                jahresSumme += kosten;
            });
            
            projekt.kostenWerte['personal'][jahr] = Math.round(jahresSumme);
            console.log(`  ✓ Personal ${jahr}: ${Math.round(jahresSumme)}`);
        });
        
        // State aktualisieren
        state.setProjekt(projektId, projekt);
        state.saveState();
        
        console.log('✅ Personal-Positionen UND Summen in State übernommen:', projekt.personalPositionen.length);
        
    } catch (error) {
        console.error('❌ Fehler beim Laden der Personal-Positionen:', error);
    }
}

/**
 * Speichere Personal-Positionen nach Supabase
 * @param {string} projektId - Project ID
 * @param {Array} positionen - Array of positions
 */
async function savePersonalPositionenToDB(projektId, positionen) {
    try {
        console.log('💾 Speichere Personal-Positionen nach Supabase:', positionen.length);
        
        await api.savePersonalPositionen(projektId, positionen);
        
        console.log('✅ Personal-Positionen gespeichert');
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern der Personal-Positionen:', error);
    }
}

/**
 * Globale Speichern-Funktion - Speichert ALLE Projektkosten-Daten
 * Aufgerufen vom "Alle Änderungen speichern" Button
 */
window.saveProjektkostenToDB = async function() {
    const projektId = window.cfoDashboard.currentProjekt;
    
    if (!projektId) {
        alert('❌ Kein Projekt ausgewählt!');
        return;
    }
    
    if (!projektId.startsWith('projekt-db-')) {
        console.log('ℹ️ Lokales Projekt - keine DB-Speicherung nötig');
        return;
    }
    
    try {
        console.log('💾 Starte Speicherung aller Projektkosten...');
        
        // Zeige Loading-Indikator
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span>⏳</span><span>Speichere...</span>';
        
        const projekt = state.getProjekt(projektId);
        
        // 1. Sammle ALLE aktiven Kostenblöcke mit ihren Werten
        const alleBlöcke = [];
        document.querySelectorAll('#empfohlene-kostenblöcke input[type="checkbox"]').forEach(cb => {
            const blockId = cb.dataset.blockId;
            const blockName = cb.dataset.blockName || blockId;
            const blockIcon = cb.dataset.blockIcon || '📦';
            const blockAnteil = parseInt(cb.dataset.blockAnteil) || 0;
            
            alleBlöcke.push({
                id: blockId,
                name: blockName,
                icon: blockIcon,
                anteil: blockAnteil,
                isActive: cb.checked,
                kostenWerte: projekt.kostenWerte?.[blockId] || {}
            });
        });
        
        console.log('📦 Speichere Kostenblöcke:', alleBlöcke.length);
        await api.saveKostenblöcke(projektId, alleBlöcke);
        
        // 2. Sammle alle Personal-Positionen
        if (projekt.personalPositionen && projekt.personalPositionen.length > 0) {
            console.log('👥 Speichere Personal-Positionen:', projekt.personalPositionen.length);
            await api.savePersonalPositionen(projektId, projekt.personalPositionen);
        }
        
        // Erfolgs-Feedback
        btn.innerHTML = '<span>✅</span><span>Gespeichert!</span>';
        btn.style.background = 'var(--success)';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            btn.style.background = '';
        }, 2000);
        
        console.log('✅ Alle Projektkosten erfolgreich gespeichert!');
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern:', error);
        alert('❌ Fehler beim Speichern: ' + error.message);
        
        // Reset Button
        const btn = event.target.closest('button');
        btn.disabled = false;
        btn.innerHTML = '<span>💾</span><span>Alle Änderungen speichern</span>';
    }
};
