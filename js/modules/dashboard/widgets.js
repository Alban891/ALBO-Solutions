/**
 * CFO Dashboard - Widgets
 * KPI boxes, tables, and custom components
 * Reusable UI elements for dashboard
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';

// ==========================================
// KPI WIDGETS
// ==========================================

/**
 * Render Projektkosten KPI Box
 * Large blue box showing cumulative project costs
 * READS DIRECTLY FROM STATE - bypasses data-processor!
 */
export function renderProjektkostenKPI(data) {
    console.log('📦 renderProjektkostenKPI called');
    
    // Get projekt ID
    const projektId = window.cfoDashboard?.currentProjekt;
    
    if (!projektId) {
        return '<div style="color: var(--gray); text-align: center;">Kein Projekt</div>';
    }
    
    // DIRECT STATE ACCESS - bypassing data-processor entirely!
    let total = 0;
    
    if (state.projektKostenData) {
        const allBlocks = Object.values(state.projektKostenData);
        const projektBlocks = allBlocks.filter(block => block.projektId === projektId);
        
        console.log(`  Found ${projektBlocks.length} cost blocks for projekt ${projektId}`);
        
        // Sum ALL years from ALL blocks
        projektBlocks.forEach(block => {
            if (block.kostenWerte) {
                Object.values(block.kostenWerte).forEach(value => {
                    const numValue = parseFloat(value) || 0;
                    total += numValue;
                });
            }
        });
        
        console.log(`  Total from STATE: ${total.toLocaleString('de-DE')}€`);
    } else {
        console.warn('  No projektKostenData in state - using fallback');
        // Fallback to data-processor if state unavailable
        if (data?.projektkostenData?.total) {
            total = data.projektkostenData.total * 1000000; // Convert from Mio to €
        }
    }
    
    const totalMio = total / 1000000;
    
    return `
        <div style="
            border: 3px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            background: #eff6ff;
            text-align: center;
            width: 80%;
        ">
            <div style="font-size: 36px; font-weight: bold; color: #1e40af;">
                ${totalMio.toFixed(1)}
            </div>
            <div style="font-size: 12px; color: #3b82f6; margin-top: 4px;">
                Mio. € kumuliert
            </div>
        </div>
    `;
}

/**
 * Render Amortisation KPI Widget
 * Shows break-even year, NPV, and IRR
 */
export function renderAmortisationKPI(data) {
    if (!data || !data.kpis) {
        return '<div style="color: var(--gray); text-align: center;">Keine Daten</div>';
    }
    
    const { breakEven, npv, irr } = data.kpis;
    const hasBreakEven = breakEven !== null && breakEven !== 'N/A';
    
    // Format break-even text
    let breakEvenText = '∞';
    let breakEvenLabel = 'Kein Break-Even';
    
    if (hasBreakEven) {
        breakEvenText = breakEven;
        breakEvenLabel = breakEven === 1 ? 'Jahr bis Break-Even' : 'Jahre bis Break-Even';
    }
    
    return `
        <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
            <!-- Break-Even Year -->
            <div style="font-size: 48px; font-weight: bold; 
                        color: ${hasBreakEven ? '#059669' : '#6b7280'}; 
                        margin-bottom: 8px;">
                ${breakEvenText}
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                ${breakEvenLabel}
            </div>
            
            <!-- Additional KPIs -->
            <div style="font-size: 9px; color: #6b7280; margin-top: 8px; text-align: center; line-height: 1.5;">
                <div><strong>NPV:</strong> ${helpers.formatCurrency(npv / 1000)}</div>
                <div><strong>IRR:</strong> ${irr.toFixed(1)}%</div>
            </div>
            
            <!-- Status Badge -->
            <div style="margin-top: 12px;">
                ${renderBreakEvenBadge(hasBreakEven, breakEven)}
            </div>
        </div>
    `;
}

/**
 * Render break-even status badge
 */
function renderBreakEvenBadge(hasBreakEven, breakEven) {
    if (!hasBreakEven) {
        return `
            <span style="
                padding: 4px 8px;
                background: #fef2f2;
                color: #991b1b;
                border-radius: 4px;
                font-size: 9px;
                font-weight: 600;
            ">
                ⚠️ Nicht rentabel
            </span>
        `;
    }
    
    // Good: <5 years, Medium: 5-7 years, Poor: >7 years
    const color = breakEven < 5 ? '#059669' : breakEven < 8 ? '#f59e0b' : '#ef4444';
    const bg = breakEven < 5 ? '#f0fdf4' : breakEven < 8 ? '#fffbeb' : '#fef2f2';
    const label = breakEven < 5 ? '✓ Exzellent' : breakEven < 8 ? '⚡ Gut' : '⏰ Lang';
    
    return `
        <span style="
            padding: 4px 8px;
            background: ${bg};
            color: ${color};
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
        ">
            ${label}
        </span>
    `;
}

// ==========================================
// TABLE WIDGETS
// ==========================================

/**
 * Render Projekte Table
 * Shows project name and top cost blocks
 */
export function renderProjekteTable(data) {
    const projektId = window.cfoDashboard?.currentProjekt;
    const projekt = state.getProjekt(projektId);
    
    if (!projekt) {
        return '<div style="color: var(--gray); text-align: center;">Kein Projekt</div>';
    }
    
    // Get Kostenblöcke
    const kostenBloecke = Object.values(state.projektKostenData || {})
        .filter(k => k.projektId === projektId)
        .slice(0, 3); // Max 3 for space
    
    const totalKosten = kostenBloecke.reduce((sum, block) => {
        const blockTotal = Object.values(block.kostenWerte || {})
            .reduce((s, v) => s + (parseFloat(v) || 0), 0);
        return sum + blockTotal;
    }, 0);
    
    return `
        <div style="width: 100%; font-size: 10px; overflow-y: auto; max-height: 100%;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <th style="text-align: left; padding: 4px; font-weight: 600;">Kostenblock</th>
                        <th style="text-align: right; padding: 4px; font-weight: 600;">Kosten [k€]</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Project Header -->
                    <tr>
                        <td colspan="2" style="padding: 8px 4px; font-weight: 600; background: #f9fafb;">
                            ${helpers.escapeHtml(projekt.name || 'Projekt')}
                        </td>
                    </tr>
                    
                    <!-- Cost Blocks -->
                    ${kostenBloecke.length > 0 ? kostenBloecke.map(block => `
                        <tr style="color: #6b7280;">
                            <td style="padding: 2px 4px; font-size: 9px;">
                                ${helpers.escapeHtml(block.name || 'Unbenannt')}
                            </td>
                            <td style="text-align: right; padding: 2px 4px;">
                                ${helpers.formatCurrency(Object.values(block.kostenWerte || {})
                                    .reduce((s, v) => s + (parseFloat(v) || 0), 0))}
                            </td>
                        </tr>
                    `).join('') : `
                        <tr style="color: #9ca3af;">
                            <td colspan="2" style="padding: 8px 4px; text-align: center; font-size: 9px;">
                                Keine Kostenblöcke vorhanden
                            </td>
                        </tr>
                    `}
                    
                    <!-- Total -->
                    <tr style="border-top: 1px solid #e5e7eb; font-weight: 600; background: #f9fafb;">
                        <td style="padding: 4px; font-size: 9px;">GESAMT</td>
                        <td style="text-align: right; padding: 4px;">
                            ${helpers.formatCurrency(totalKosten)}
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <!-- Project Meta Info -->
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; 
                        font-size: 9px; color: #6b7280;">
                <div style="display: flex; justify-content: space-between; padding: 2px 4px;">
                    <span>Start:</span>
                    <span>${helpers.formatDateSafe(projekt.start_datum)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 4px;">
                    <span>Ende:</span>
                    <span>${helpers.formatDateSafe(projekt.ende_datum)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 4px;">
                    <span>Artikel:</span>
                    <span>${data.artikelListe?.length || 0}</span>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// INTERACTIVE WIDGETS
// ==========================================

/**
 * Render Szenario-Analyse Widget
 * Interactive inputs for sensitivity analysis
 */
export function renderSzenarioWidget(data) {
    return `
        <div style="width: 100%; display: flex; flex-direction: column; align-items: center; padding: 10px;">
            <div style="font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 12px;">
                Szenario-Analyse****
            </div>
            
            <table style="width: 100%; max-width: 200px; font-size: 10px;">
                <tr>
                    <td style="padding: 3px;">Preise</td>
                    <td style="text-align: right; padding: 3px;">
                        <input type="text" 
                               id="scenario-preis" 
                               value="+/-0%" 
                               style="width: 60px; text-align: right; border: 1px solid #d1d5db; 
                                      border-radius: 2px; padding: 2px; font-size: 10px;"
                               onchange="window.updateSzenario('preis', this.value)">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 3px;">Mengen</td>
                    <td style="text-align: right; padding: 3px;">
                        <input type="text" 
                               id="scenario-menge" 
                               value="+/-0%" 
                               style="width: 60px; text-align: right; border: 1px solid #d1d5db; 
                                      border-radius: 2px; padding: 2px; font-size: 10px;"
                               onchange="window.updateSzenario('menge', this.value)">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 3px;">HK</td>
                    <td style="text-align: right; padding: 3px;">
                        <input type="text" 
                               id="scenario-hk" 
                               value="+/-0%" 
                               style="width: 60px; text-align: right; border: 1px solid #d1d5db; 
                                      border-radius: 2px; padding: 2px; font-size: 10px;"
                               onchange="window.updateSzenario('hk', this.value)">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 3px;">Projektkosten</td>
                    <td style="text-align: right; padding: 3px;">
                        <input type="text" 
                               id="scenario-kosten" 
                               value="+/-0%" 
                               style="width: 60px; text-align: right; border: 1px solid #d1d5db; 
                                      border-radius: 2px; padding: 2px; font-size: 10px;"
                               onchange="window.updateSzenario('kosten', this.value)">
                    </td>
                </tr>
            </table>
            
            <button onclick="window.applySzenario()" 
                    style="margin-top: 10px; padding: 4px 12px; background: #3b82f6; color: white; 
                           border: none; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 500;">
                🔄 Neu berechnen
            </button>
            
            <button onclick="window.resetSzenario()" 
                    style="margin-top: 6px; padding: 3px 10px; background: white; color: #6b7280; 
                           border: 1px solid #d1d5db; border-radius: 4px; font-size: 9px; cursor: pointer;">
                Zurücksetzen
            </button>
        </div>
    `;
}

// ==========================================
// MINI WIDGETS
// ==========================================

/**
 * Render loading spinner
 */
export function renderLoadingWidget() {
    return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; 
                    padding: 40px; color: #6b7280;">
            <div style="
                border: 3px solid #f3f4f6;
                border-top: 3px solid #3b82f6;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            "></div>
            <div style="margin-top: 12px; font-size: 12px;">
                Berechne Dashboard...
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
}

/**
 * Render error widget
 */
export function renderErrorWidget(error) {
    return `
        <div style="padding: 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
            <div style="font-size: 14px; font-weight: 600; color: #dc2626; margin-bottom: 8px;">
                Dashboard-Fehler
            </div>
            <div style="font-size: 11px; color: #6b7280;">
                ${helpers.escapeHtml(error.message || 'Unbekannter Fehler')}
            </div>
        </div>
    `;
}

/**
 * Render "no data" widget
 */
export function renderNoDataWidget(message = 'Keine Daten vorhanden') {
    return `
        <div style="padding: 30px; text-align: center; color: #9ca3af;">
            <div style="font-size: 36px; margin-bottom: 12px;">📊</div>
            <div style="font-size: 12px; font-weight: 500;">
                ${helpers.escapeHtml(message)}
            </div>
            <div style="font-size: 10px; margin-top: 8px;">
                Bitte legen Sie Artikel und Projektkosten an.
            </div>
        </div>
    `;
}

// ==========================================
// UTILITY WIDGETS
// ==========================================

/**
 * Render chart canvas element
 */
export function renderChartCanvas(chartId) {
    return `<canvas id="canvas-${chartId}" style="max-width: 100%; max-height: 100%;"></canvas>`;
}

/**
 * Render widget container
 */
export function renderWidgetContainer(id, title, subtitle, content) {
    return `
        <div id="widget-${id}" style="
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        ">
            <!-- Header -->
            <div style="margin-bottom: 8px;">
                <div style="font-size: 11px; font-weight: 600; color: #111827;">
                    ${title}
                </div>
                ${subtitle ? `
                    <div style="font-size: 9px; color: #6b7280; margin-top: 1px;">
                        ${subtitle}
                    </div>
                ` : ''}
            </div>
            
            <!-- Content -->
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                ${content}
            </div>
        </div>
    `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
    renderProjektkostenKPI,
    renderAmortisationKPI,
    renderProjekteTable,
    renderSzenarioWidget,
    renderLoadingWidget,
    renderErrorWidget,
    renderNoDataWidget,
    renderChartCanvas,
    renderWidgetContainer
};
