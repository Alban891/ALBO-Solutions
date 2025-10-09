/**
 * CFO Dashboard - Wirtschaftlichkeit Module
 * Profitability calculation with contribution margin scheme
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';

// ========================================
// PROJEKT-WIRTSCHAFTLICHKEIT (Aggregiert)
// ========================================
export function renderProjektWirtschaftlichkeit() {
    const projektId = window.cfoDashboard.currentProjekt;
    const projekt = state.getProjekt(projektId);
    const container = document.getElementById('projekt-tab-wirtschaftlichkeit');
    
    if (!container) return;
    
    // Hole alle Artikel des Projekts
    const artikelListe = state.getArtikelByProjekt(projektId);
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <!-- Header -->
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 16px;">📊 Projekt-Wirtschaftlichkeit: ${projekt?.name || 'Projekt'}</h3>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <span style="font-size: 12px; color: var(--gray);">
                            ${artikelListe?.length || 0} Artikel aggregiert
                        </span>
                        <select id="view-level" onchange="window.updateViewLevel()" 
                                style="padding: 6px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 12px;">
                            <option value="db2">Manufacturing Margin (DB2)</option>
                            <option value="db5">DB5 (vor Trading Profit)</option>
                            <option value="ebit">Operating Profit (EBIT)</option>
                            <option value="all" selected>Alle Stufen anzeigen</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Artikel-Übersicht -->
            <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px;">Enthaltene Artikel:</div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${artikelListe?.map(artikel => `
                        <span style="padding: 4px 12px; background: white; border-radius: 4px; font-size: 11px;">
                            ${artikel.name || 'Unbenannt'}
                        </span>
                    `).join('') || '<span style="color: var(--gray);">Keine Artikel vorhanden</span>'}
                </div>
            </div>

            <!-- Contribution Margin Scheme -->
            <div style="background: white; border-radius: 8px; overflow: hidden; border: 1px solid var(--border);">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr style="background: linear-gradient(to right, #1e40af, #3730a3); color: white;">
                            <th style="padding: 10px; text-align: left; width: 280px;">Position</th>
                            ${generateYearHeaders()}
                            <th style="padding: 10px; text-align: center; background: #1e293b;">Total</th>
                        </tr>
                    </thead>
                    <tbody id="profitability-tbody">
                        ${generateAggregatedProfitabilityRows(artikelListe)}
                    </tbody>
                </table>
            </div>

            <!-- KPI Dashboard -->
            <div style="margin-top: 20px;">
                <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">📊 Key Performance Indicators</h4>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                        <div style="font-size: 10px; color: var(--gray);">Manufacturing Margin Ø</div>
                        <div style="font-size: 20px; font-weight: bold; color: var(--primary);">
                            ${calculateAvgMarginForProjekt(artikelListe)}%
                        </div>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                        <div style="font-size: 10px; color: var(--gray);">EBIT Margin Ø</div>
                        <div style="font-size: 20px; font-weight: bold; color: var(--success);">
                            ${calculateEBITMarginForProjekt(artikelListe)}%
                        </div>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                        <div style="font-size: 10px; color: var(--gray);">Break-Even</div>
                        <div style="font-size: 20px; font-weight: bold; color: var(--warning);">
                            ${calculateBreakEvenForProjekt(artikelListe)}
                        </div>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                        <div style="font-size: 10px; color: var(--gray);">NPV (8% WACC)</div>
                        <div style="font-size: 20px; font-weight: bold; color: var(--info);">
                            ${calculateNPVForProjekt(artikelListe)}€
                        </div>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                        <div style="font-size: 10px; color: var(--gray);">IRR</div>
                        <div style="font-size: 20px; font-weight: bold; color: var(--purple);">
                            ${calculateIRRForProjekt(artikelListe)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initial calculation
    updateWirtschaftlichkeit();
}

// ========================================
// ARTIKEL-WIRTSCHAFTLICHKEIT (Einzeln)
// ========================================
export function renderWirtschaftlichkeit() {
    const artikelId = window.cfoDashboard.currentArtikel;
    const artikel = state.getArtikel(artikelId);
    const container = document.getElementById('artikel-tab-wirtschaftlichkeit');
    
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <!-- Header -->
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 16px;">📊 Artikel-Wirtschaftlichkeit: ${artikel?.name || 'Artikel'}</h3>
                    <select id="view-level" onchange="window.updateViewLevel()" 
                            style="padding: 6px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 12px;">
                        <option value="db2">Manufacturing Margin (DB2)</option>
                        <option value="db5">DB5 (vor Trading Profit)</option>
                        <option value="ebit">Operating Profit (EBIT)</option>
                        <option value="all" selected>Alle Stufen anzeigen</option>
                    </select>
                </div>
            </div>

            <!-- Contribution Margin Scheme -->
            <div style="background: white; border-radius: 8px; overflow: hidden; border: 1px solid var(--border);">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr style="background: linear-gradient(to right, #1e40af, #3730a3); color: white;">
                            <th style="padding: 10px; text-align: left; width: 280px;">Position</th>
                            ${generateYearHeaders()}
                            <th style="padding: 10px; text-align: center; background: #1e293b;">Total</th>
                        </tr>
                    </thead>
                    <tbody id="profitability-tbody">
                        ${generateProfitabilityRows(artikel)}
                    </tbody>
                </table>
            </div>

            <!-- KPI Dashboard -->
            <div style="margin-top: 20px;">
                <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">📊 Key Performance Indicators</h4>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                        <div style="font-size: 10px; color: var(--gray);">Manufacturing Margin Ø</div>
                        <div id="avg-manufacturing-margin" style="font-size: 20px; font-weight: bold; color: var(--primary);">
                            ${calculateAvgMargin(artikel)}%
                        </div>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                        <div style="font-size: 10px; color: var(--gray);">EBIT Margin Ø</div>
                        <div id="avg-ebit-margin" style="font-size: 20px; font-weight: bold; color: var(--success);">
                            ${calculateEBITMargin(artikel)}%
                        </div>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                        <div style="font-size: 10px; color: var(--gray);">Break-Even</div>
                        <div id="break-even-year" style="font-size: 20px; font-weight: bold; color: var(--warning);">
                            ${calculateBreakEven(artikel)}
                        </div>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                        <div style="font-size: 10px; color: var(--gray);">NPV (8% WACC)</div>
                        <div id="npv-result" style="font-size: 20px; font-weight: bold; color: var(--info);">
                            ${calculateNPV(artikel)}€
                        </div>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                        <div style="font-size: 10px; color: var(--gray);">IRR</div>
                        <div id="irr-result" style="font-size: 20px; font-weight: bold; color: var(--purple);">
                            ${calculateIRR(artikel)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initial calculation
    updateWirtschaftlichkeit();
}

// ========================================
// SHARED FUNCTIONS
// ========================================

function generateYearHeaders() {
    const jahre = getYearRange();
    return jahre.map(jahr => 
        `<th style="padding: 10px; text-align: center;">${jahr}</th>`
    ).join('');
}

function generateProfitabilityRows(artikel) {
    return `
        <!-- Sales Revenue -->
        <tr style="background: #f0f9ff;">
            <td style="padding: 8px; font-weight: bold;">📈 Sales Revenue</td>
            ${generateRevenueRow(artikel)}
        </tr>
        
        <!-- DB1 Calculation -->
        <tr>
            <td style="padding: 6px 20px;">
                ./. Material Costs
                <input type="number" id="material-cost-rate" value="35" min="0" max="100" step="0.5"
                       onchange="window.updateWirtschaftlichkeit()" 
                       style="width: 40px; margin-left: 8px; padding: 2px; border: 1px solid var(--border); 
                              border-radius: 2px; font-size: 10px;">%
            </td>
            ${generateCostRow('material-costs')}
        </tr>
        <tr>
            <td style="padding: 6px 20px;">
                ./. Direct Labour
                <input type="number" id="direct-labour-rate" value="15" min="0" max="100" step="0.5"
                       onchange="window.updateWirtschaftlichkeit()"
                       style="width: 40px; margin-left: 8px; padding: 2px; border: 1px solid var(--border); 
                              border-radius: 2px; font-size: 10px;">%
            </td>
            ${generateCostRow('direct-labour')}
        </tr>
        <tr style="background: #e0e7ff; font-weight: bold;">
            <td style="padding: 8px;">= Contribution Margin I (DB1)</td>
            ${generateResultRow('db1')}
        </tr>
        <tr style="font-size: 10px; color: var(--gray);">
            <td style="padding: 4px 20px;">DB1 Margin %</td>
            ${generatePercentageRow('db1-margin')}
        </tr>
        
        <!-- DB2 Calculation -->
        <tr class="db2-section">
            <td style="padding: 6px 20px;">
                ./. Material Overhead
                <input type="number" id="material-overhead-rate" value="8" min="0" max="100" step="0.5"
                       onchange="window.updateWirtschaftlichkeit()"
                       style="width: 40px; margin-left: 8px; padding: 2px; border: 1px solid var(--border); 
                              border-radius: 2px; font-size: 10px;">%
            </td>
            ${generateCostRow('material-overhead')}
        </tr>
        <tr class="db2-section">
            <td style="padding: 6px 20px;">
                ./. Manufacturing Overhead
                <input type="number" id="manufacturing-overhead-rate" value="12" min="0" max="100" step="0.5"
                       onchange="window.updateWirtschaftlichkeit()"
                       style="width: 40px; margin-left: 8px; padding: 2px; border: 1px solid var(--border); 
                              border-radius: 2px; font-size: 10px;">%
            </td>
            ${generateCostRow('manufacturing-overhead')}
        </tr>
        <tr style="background: #dbeafe; font-weight: bold;">
            <td style="padding: 8px;">= Manufacturing Margin (DB2)</td>
            ${generateResultRow('db2')}
        </tr>
        <tr style="font-size: 10px; color: var(--gray);">
            <td style="padding: 4px 20px;">Manufacturing Margin %</td>
            ${generatePercentageRow('db2-margin')}
        </tr>
        
        <!-- DB3 with Project Costs -->
        <tr class="db3-section">
            <td style="padding: 6px 20px;">
                ./. Development Overhead
                <span style="font-size: 10px; color: var(--primary);">[aus Projektkosten-Tab]</span>
            </td>
            ${generateProjectCostRow('development')}
        </tr>
        <tr style="background: #fef3c7; font-weight: bold;">
            <td style="padding: 8px;">= Contribution Margin III (DB3)</td>
            ${generateResultRow('db3')}
        </tr>
        
        <!-- Continue to EBIT -->
        ${generateRemainingRows()}
    `;
}

function generateAggregatedProfitabilityRows(artikelListe) {
    // Ähnlich wie generateProfitabilityRows, aber summiert über alle Artikel
    return `
        <!-- Sales Revenue (Aggregated) -->
        <tr style="background: #f0f9ff;">
            <td style="padding: 8px; font-weight: bold;">📈 Sales Revenue (Gesamt)</td>
            ${generateAggregatedRevenueRow(artikelListe)}
        </tr>
        
        <!-- Rest der Tabelle wie oben... -->
        ${generateProfitabilityRows(null)} <!-- Temporär, bis aggregierte Logik implementiert -->
    `;
}

function generateRevenueRow(artikel) {
    const jahre = getYearRange();
    let html = '';
    let total = 0;
    
    jahre.forEach(jahr => {
        const value = getRevenueForYear(artikel, jahr);
        total += value;
        // Nutze formatRevenue statt formatCurrency für k€-Werte
        html += `<td style="padding: 8px; text-align: right; font-weight: bold;">
                    <span id="revenue-${jahr}">${helpers.formatRevenue(value)}</span>
                 </td>`;
    });
    
    html += `<td style="padding: 8px; text-align: right; font-weight: bold; background: #f1f5f9;">
                <span id="revenue-total">${helpers.formatRevenue(total)}</span>
             </td>`;
    return html;
}

function generateAggregatedRevenueRow(artikelListe) {
    const jahre = getYearRange();
    let html = '';
    let total = 0;
    
    jahre.forEach(jahr => {
        let yearSum = 0;
        artikelListe?.forEach(artikel => {
            yearSum += getRevenueForYear(artikel, jahr);
        });
        total += yearSum;
        html += `<td style="padding: 8px; text-align: right; font-weight: bold;">
                    <span id="revenue-${jahr}">${helpers.formatCurrency(yearSum)}</span>
                 </td>`;
    });
    
    html += `<td style="padding: 8px; text-align: right; font-weight: bold; background: #f1f5f9;">
                <span id="revenue-total">${helpers.formatCurrency(total)}</span>
             </td>`;
    return html;
}

function generateCostRow(prefix) {
    const jahre = getYearRange();
    let html = '';
    
    jahre.forEach(jahr => {
        html += `<td style="padding: 6px; text-align: right; color: var(--danger);">
                    <span id="${prefix}-${jahr}">0</span>
                 </td>`;
    });
    
    html += `<td style="padding: 6px; text-align: right; background: #f1f5f9; color: var(--danger);">
                <span id="${prefix}-total">0</span>
             </td>`;
    return html;
}

function generateResultRow(prefix, color = 'inherit') {
    const jahre = getYearRange();
    let html = '';
    
    jahre.forEach(jahr => {
        html += `<td style="padding: 8px; text-align: right; font-weight: bold; color: ${color};">
                    <span id="${prefix}-${jahr}">0</span>
                 </td>`;
    });
    
    html += `<td style="padding: 8px; text-align: right; font-weight: bold; background: #1e293b; color: white;">
                <span id="${prefix}-total">0</span>
             </td>`;
    return html;
}

function generatePercentageRow(prefix) {
    const jahre = getYearRange();
    let html = '';
    
    jahre.forEach(jahr => {
        html += `<td style="padding: 4px 8px; text-align: right; font-size: 10px; color: var(--gray);">
                    <span id="${prefix}-${jahr}">0%</span>
                 </td>`;
    });
    
    html += `<td style="padding: 4px 8px; text-align: right; background: #f1f5f9;">
                <span id="${prefix}-avg">0%</span>
             </td>`;
    return html;
}

function generateProjectCostRow(type) {
    const jahre = getYearRange();
    let html = '';
    
    jahre.forEach(jahr => {
        html += `<td style="padding: 6px; text-align: right; color: var(--danger);">
                    <span id="${type}-${jahr}">0</span>
                 </td>`;
    });
    
    html += `<td style="padding: 6px; text-align: right; background: #f1f5f9; color: var(--danger);">
                <span id="${type}-total">0</span>
             </td>`;
    return html;
}

function generateRemainingRows() {
    return `
        <!-- DB4 Calculation -->
        <tr class="db4-section">
            <td style="padding: 6px 20px;">
                ./. Selling Overhead
                <input type="number" id="selling-overhead-rate" value="6" min="0" max="100" step="0.5"
                       onchange="window.updateWirtschaftlichkeit()"
                       style="width: 40px; margin-left: 8px; padding: 2px; border: 1px solid var(--border); 
                              border-radius: 2px; font-size: 10px;">%
            </td>
            ${generateCostRow('selling-overhead')}
        </tr>
        <tr class="db4-section">
            <td style="padding: 6px 20px;">
                ./. Marketing Overhead
                <input type="number" id="marketing-overhead-rate" value="4" min="0" max="100" step="0.5"
                       onchange="window.updateWirtschaftlichkeit()"
                       style="width: 40px; margin-left: 8px; padding: 2px; border: 1px solid var(--border); 
                              border-radius: 2px; font-size: 10px;">%
            </td>
            ${generateCostRow('marketing-overhead')}
        </tr>
        <tr style="background: #f3e8ff; font-weight: bold;" class="db4-section">
            <td style="padding: 8px;">= Contribution Margin IV (DB4)</td>
            ${generateResultRow('db4')}
        </tr>
        
        <!-- DB5 Calculation -->
        <tr class="db5-section">
            <td style="padding: 6px 20px;">
                ./. Distribution Overhead
                <input type="number" id="distribution-overhead-rate" value="3" min="0" max="100" step="0.5"
                       onchange="window.updateWirtschaftlichkeit()"
                       style="width: 40px; margin-left: 8px; padding: 2px; border: 1px solid var(--border); 
                              border-radius: 2px; font-size: 10px;">%
            </td>
            ${generateCostRow('distribution-overhead')}
        </tr>
        <tr class="db5-section">
            <td style="padding: 6px 20px;">
                ./. Administration Overhead
                <input type="number" id="admin-overhead-rate" value="5" min="0" max="100" step="0.5"
                       onchange="window.updateWirtschaftlichkeit()"
                       style="width: 40px; margin-left: 8px; padding: 2px; border: 1px solid var(--border); 
                              border-radius: 2px; font-size: 10px;">%
            </td>
            ${generateCostRow('admin-overhead')}
        </tr>
        <tr style="background: #e0f2fe; font-weight: bold;" class="db5-section">
            <td style="padding: 8px;">= Contribution Margin V (DB5)</td>
            ${generateResultRow('db5')}
        </tr>
        
        <!-- EBIT -->
        <tr style="background: #10b981; color: white; font-weight: bold;" class="ebit-section">
            <td style="padding: 10px;">= Operating Profit (EBIT)</td>
            ${generateResultRow('ebit', 'white')}
        </tr>
    `;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function getYearRange() {
    return [2024, 2025, 2026, 2027, 2028];
}

function getRevenueForYear(artikel, jahr) {
    if (!artikel) return 0;
    
    const yearData = artikel[`jahr_${jahr - 2023}`];
    if (!yearData) return 0;
    
    const menge = parseFloat(yearData?.menge) || 0;
    const preis = parseFloat(yearData?.preis) || 0;
    
    return menge * preis;
}

// KPI Calculations for single Artikel
function calculateAvgMargin(artikel) {
    return 34; // Placeholder
}

function calculateEBITMargin(artikel) {
    return 12; // Placeholder
}

function calculateBreakEven(artikel) {
    return "2026"; // Placeholder
}

function calculateNPV(artikel) {
    return "12.5M"; // Placeholder
}

function calculateIRR(artikel) {
    return 28; // Placeholder
}

// KPI Calculations for Projekt (aggregated)
function calculateAvgMarginForProjekt(artikelListe) {
    return 36; // Placeholder - später: Durchschnitt über alle Artikel
}

function calculateEBITMarginForProjekt(artikelListe) {
    return 14; // Placeholder
}

function calculateBreakEvenForProjekt(artikelListe) {
    return "2025"; // Placeholder
}

function calculateNPVForProjekt(artikelListe) {
    return "44.7M"; // Placeholder
}

function calculateIRRForProjekt(artikelListe) {
    return 32; // Placeholder
}

// ========================================
// WINDOW FUNCTIONS
// ========================================

window.updateWirtschaftlichkeit = function() {
    console.log('Updating profitability calculation...');
    
    // Hole alle Rates
    const materialRate = parseFloat(document.getElementById('material-cost-rate')?.value) || 0;
    const labourRate = parseFloat(document.getElementById('direct-labour-rate')?.value) || 0;
    const materialOverheadRate = parseFloat(document.getElementById('material-overhead-rate')?.value) || 0;
    const manufacturingOverheadRate = parseFloat(document.getElementById('manufacturing-overhead-rate')?.value) || 0;
    
    const jahre = getYearRange();
    let totals = {
        revenue: 0,
        materialCosts: 0,
        labourCosts: 0,
        db1: 0,
        materialOverhead: 0,
        manufacturingOverhead: 0,
        db2: 0
    };
    
    jahre.forEach(jahr => {
        // Hole Revenue
        const revenueEl = document.getElementById(`revenue-${jahr}`);
        const revenue = parseFloat(revenueEl?.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
        
        // Berechne Costs
        const materialCost = revenue * (materialRate / 100);
        const labourCost = revenue * (labourRate / 100);
        const materialOverhead = revenue * (materialOverheadRate / 100);
        const manufacturingOverhead = revenue * (manufacturingOverheadRate / 100);
        
        // Update UI
        const materialEl = document.getElementById(`material-costs-${jahr}`);
        const labourEl = document.getElementById(`direct-labour-${jahr}`);
        const materialOHEl = document.getElementById(`material-overhead-${jahr}`);
        const manufacturingOHEl = document.getElementById(`manufacturing-overhead-${jahr}`);
        
        if (materialEl) materialEl.textContent = helpers.formatCurrency(materialCost);
        if (labourEl) labourEl.textContent = helpers.formatCurrency(labourCost);
        if (materialOHEl) materialOHEl.textContent = helpers.formatCurrency(materialOverhead);
        if (manufacturingOHEl) manufacturingOHEl.textContent = helpers.formatCurrency(manufacturingOverhead);
        
        // Berechne DBs
        const db1 = revenue - materialCost - labourCost;
        const db2 = db1 - materialOverhead - manufacturingOverhead;
        
        const db1El = document.getElementById(`db1-${jahr}`);
        const db2El = document.getElementById(`db2-${jahr}`);
        
        if (db1El) db1El.textContent = helpers.formatCurrency(db1);
        if (db2El) db2El.textContent = helpers.formatCurrency(db2);
        
        // Margins
        const db1Margin = revenue > 0 ? (db1 / revenue * 100) : 0;
        const db2Margin = revenue > 0 ? (db2 / revenue * 100) : 0;
        
        const db1MarginEl = document.getElementById(`db1-margin-${jahr}`);
        const db2MarginEl = document.getElementById(`db2-margin-${jahr}`);
        
        if (db1MarginEl) db1MarginEl.textContent = db1Margin.toFixed(1) + '%';
        if (db2MarginEl) db2MarginEl.textContent = db2Margin.toFixed(1) + '%';
        
        // Update totals
        totals.revenue += revenue;
        totals.materialCosts += materialCost;
        totals.labourCosts += labourCost;
        totals.db1 += db1;
        totals.materialOverhead += materialOverhead;
        totals.manufacturingOverhead += manufacturingOverhead;
        totals.db2 += db2;
    });
    
    // Update total columns
    const totalElements = {
        'material-costs-total': totals.materialCosts,
        'direct-labour-total': totals.labourCosts,
        'db1-total': totals.db1,
        'material-overhead-total': totals.materialOverhead,
        'manufacturing-overhead-total': totals.manufacturingOverhead,
        'db2-total': totals.db2
    };
    
    Object.entries(totalElements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = helpers.formatCurrency(value);
    });
    
    // Average margins
    const avgDB1Margin = totals.revenue > 0 ? (totals.db1 / totals.revenue * 100) : 0;
    const avgDB2Margin = totals.revenue > 0 ? (totals.db2 / totals.revenue * 100) : 0;
    
    const avgDB1El = document.getElementById('db1-margin-avg');
    const avgDB2El = document.getElementById('db2-margin-avg');
    
    if (avgDB1El) avgDB1El.textContent = avgDB1Margin.toFixed(1) + '%';
    if (avgDB2El) avgDB2El.textContent = avgDB2Margin.toFixed(1) + '%';
};

window.updateViewLevel = function() {
    const level = document.getElementById('view-level')?.value;
    
    const sections = {
        'db2': ['.db3-section', '.db4-section', '.db5-section', '.trading-section', '.ebit-section'],
        'db5': ['.trading-section', '.ebit-section'],
        'ebit': [],
        'all': []
    };
    
    // Reset all
    document.querySelectorAll('.db2-section, .db3-section, .db4-section, .db5-section, .trading-section, .ebit-section')
        .forEach(el => el.style.display = '');
    
    // Hide selected sections
    if (sections[level]) {
        sections[level].forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.style.display = 'none');
        });
    }
};

// ========================================
// EXPORTS
// ========================================

export default {
    renderWirtschaftlichkeit,
    renderProjektWirtschaftlichkeit
};
