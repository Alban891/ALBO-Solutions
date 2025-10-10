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
export function renderProjektkosten() {
    const projektId = window.cfoDashboard.currentProjekt;
    if (!projektId) return;
    
    const container = document.getElementById('projekt-tab-projektkosten');
    if (!container) return;
    
    // Hole Projekt und Artikel für KI-Analyse
    const projekt = state.getProjekt(projektId);
    const artikel = state.getArtikelByProjekt(projektId);
    
    // Generiere KI-Empfehlung mit verbesserter Analyse
    const empfehlung = generiereKostenEmpfehlung(artikel, projekt);
    
    // Hole gespeicherte aktive Kostenblöcke oder nutze Defaults
    const aktiveBlöcke = projekt.aktiveKostenblöcke || empfehlung.kostenblöcke.map(b => b.id);
    
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

window.updateKostenSumme = function() {
    const headerCells = document.querySelectorAll('thead th');
    const jahre = [];
    
    for (let i = 1; i < headerCells.length - 2; i++) {
        const jahr = headerCells[i].textContent.trim();
        if (jahr && !isNaN(jahr)) {
            jahre.push(jahr);
        }
    }
    
    const jahresSummen = {};
    
    jahre.forEach(jahr => {
        jahresSummen[jahr] = 0;
        
        document.querySelectorAll(`[id^="kosten-"][id$="-${jahr}"]`).forEach(input => {
            const value = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
            jahresSummen[jahr] += value;
        });
        
        const cell = document.getElementById(`gesamt-${jahr}`);
        if (cell) cell.textContent = helpers.formatCurrency(jahresSummen[jahr]);
    });
    
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
        if (sumCell) sumCell.textContent = helpers.formatCurrency(zeileSumme);
    });
    
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
window.savePersonalDetail = function() {
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
        }
    });
    
    window.updateKostenSumme();
    window.closePersonalDetail();
    
    if (window.cfoDashboard?.aiController) {
        window.cfoDashboard.aiController.addAIMessage({
            level: 'success',
            title: '✅ Personalkosten übernommen',
            text: 'Die detaillierten Personalkosten wurden in die Haupttabelle übertragen.',
            timestamp: new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
        });
    }
};

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

window.toggleKostenblock = function(checkbox) {
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
}

function getSavedValue(blockId, jahr) {
    const projektId = window.cfoDashboard.currentProjekt;
    const projekt = state.getProjekt(projektId);
    
    if (projekt?.kostenWerte?.[blockId]?.[jahr]) {
        // Gebe UNFORMATIERTE Zahl zurück - Formatierung erfolgt nur zur Anzeige
        return projekt.kostenWerte[blockId][jahr];
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

export default {
    renderProjektkosten
};
