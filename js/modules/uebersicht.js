/**
 * Executive Summary / Übersicht
 * Professional 1-pager for Management Presentation
 * Horváth & Partners Style
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';
import { calculateProjektWirtschaftlichkeit } from './wirtschaftlichkeit/calculator.js';

/**
 * Render Executive Summary
 * @public
 */
export async function renderUebersicht() {
    const projektId = window.cfoDashboard.currentProjekt;
    if (!projektId) return;
    
    const container = document.getElementById('projekt-tab-uebersicht');
    if (!container) return;
    
    console.log('📊 Rendering Executive Summary for:', projektId);
    
    // Get data
    const projekt = state.getProjekt(projektId);
    const artikel = state.getArtikelByProjekt(projektId);
    
    // Calculate wirtschaftlichkeit - WITH ERROR HANDLING
    let calc = null;
    try {
        calc = calculateProjektWirtschaftlichkeit(projektId, { wacc: 0.08 });
    } catch (error) {
        console.warn('⚠️ Wirtschaftlichkeit calculation failed:', error);
    }
    
    // If no wirtschaftlichkeit data, show placeholder
    if (!calc || !calc.kpis || !calc.jahre || Object.keys(calc.jahre).length === 0) {
        container.innerHTML = `
            <div style="background: white; padding: 32px; max-width: 1200px; margin: 0 auto;">
                
                <!-- Header -->
                <div style="margin-bottom: 32px; border-bottom: 3px solid #003E7E; padding-bottom: 16px;">
                    <h2 style="margin: 0; font-size: 24px; color: #003E7E; font-weight: 600;">
                        Executive Summary
                    </h2>
                    <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
                        ${projekt.name} | Stand: ${new Date().toLocaleDateString('de-DE')}
                    </div>
                </div>
                
                <!-- Info Box -->
                <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 32px;">⚠️</span>
                        <div>
                            <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px; color: #92400e;">
                                Keine Wirtschaftlichkeitsdaten verfügbar
                            </div>
                            <div style="font-size: 14px; color: #78350f;">
                                Um die Executive Summary zu generieren, müssen Sie zuerst:
                            </div>
                            <ul style="margin: 12px 0 0 20px; font-size: 14px; color: #78350f;">
                                <li>Artikel mit Finanzplanungsdaten anlegen</li>
                                <li>Projektkosten erfassen</li>
                                <li>Wirtschaftlichkeitsberechnung durchführen</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <button onclick="window.switchProjektTab('artikel')" 
                            style="padding: 20px; background: white; border: 2px solid #3b82f6; border-radius: 8px; 
                                   cursor: pointer; text-align: left; transition: all 0.2s;">
                        <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                        <div style="font-weight: 600; margin-bottom: 4px;">Artikel anlegen</div>
                        <div style="font-size: 12px; color: #6b7280;">Produktartikel mit Finanzplanung</div>
                    </button>
                    
                    <button onclick="window.switchProjektTab('projektkosten')" 
                            style="padding: 20px; background: white; border: 2px solid #3b82f6; border-radius: 8px; 
                                   cursor: pointer; text-align: left; transition: all 0.2s;">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-weight: 600; margin-bottom: 4px;">Projektkosten</div>
                        <div style="font-size: 12px; color: #6b7280;">Entwicklungskosten erfassen</div>
                    </button>
                    
                    <button onclick="window.switchProjektTab('wirtschaftlichkeit')" 
                            style="padding: 20px; background: white; border: 2px solid #3b82f6; border-radius: 8px; 
                                   cursor: pointer; text-align: left; transition: all 0.2s;">
                        <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
                        <div style="font-weight: 600; margin-bottom: 4px;">Wirtschaftlichkeit</div>
                        <div style="font-size: 12px; color: #6b7280;">Business Case berechnen</div>
                    </button>
                </div>
                
            </div>
        `;
        return;
    }
    
    // Determine recommendation
    const recommendation = getRecommendation(calc);
    const projectStatus = getProjectStatus(calc);
    
    container.innerHTML = `
        <div style="background: white; padding: 32px; max-width: 1200px; margin: 0 auto;">
            
            <!-- Header -->
            <div style="margin-bottom: 32px; border-bottom: 3px solid #003E7E; padding-bottom: 16px;">
                <h2 style="margin: 0; font-size: 24px; color: #003E7E; font-weight: 600;">
                    Executive Summary
                </h2>
                <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
                    ${projekt.name} | Stand: ${new Date().toLocaleDateString('de-DE')}
                </div>
            </div>
            
            <!-- Section 1: Management Summary -->
            ${renderManagementSummary(projekt, artikel, calc)}
            
            <!-- Section 2: Empfehlung & Status -->
            ${renderRecommendationStatus(recommendation, projectStatus)}
            
            <!-- Section 3: Business Case Highlights -->
            ${renderKPIGrid(calc)}
            
            <!-- Section 4: Kernannahmen & Sensitivitäten -->
            ${renderAssumptionsSensitivities(calc, artikel)}
            
            <!-- Section 5: Risiken & Chancen -->
            ${renderRisksOpportunities(calc, projekt)}
            
            <!-- Section 6: Meilensteine -->
            ${renderMilestones(projekt)}
            
            <!-- Section 7: Mini Dashboard -->
            ${renderMiniDashboard(calc)}
            
            <!-- Export Button -->
            <div style="margin-top: 32px; text-align: right;">
                <button onclick="window.exportExecutiveSummaryPDF()" 
                        class="btn btn-primary"
                        style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;">
                    <span>📄</span>
                    <span>Als PDF exportieren</span>
                </button>
            </div>
            
        </div>
    `;
    
    // Initialize mini charts
    setTimeout(() => initializeMiniCharts(calc), 100);
}

/**
 * Section 1: Management Summary (Text Block)
 */
function renderManagementSummary(projekt, artikel, calc) {
    const totalRevenue = calc.totals.sales_revenue / 1000000;
    const artikelCount = artikel.length;
    
    return `
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #003E7E; margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 600; color: #003E7E; margin: 0 0 12px 0;">
                📋 Management Summary
            </h3>
            <div style="font-size: 13px; line-height: 1.8; color: #374151;">
                <p style="margin: 0 0 12px 0;">
                    <strong>Projektbeschreibung:</strong> 
                    ${projekt.beschreibung || `Das Projekt "${projekt.name}" umfasst ${artikelCount} Artikel mit einem Gesamtumsatzpotenzial von €${totalRevenue.toFixed(1)}M über den Planungszeitraum.`}
                </p>
                <p style="margin: 0 0 12px 0;">
                    <strong>Strategische Einordnung:</strong> 
                    ${getStrategicPositioning(artikel, calc)}
                </p>
                <p style="margin: 0;">
                    <strong>Kernnutzen:</strong> 
                    ${getValueProposition(calc)}
                </p>
            </div>
        </div>
    `;
}

/**
 * Section 2: Empfehlung & Status
 */
function renderRecommendationStatus(recommendation, status) {
    const recommendationConfig = {
        'GO': { color: '#10b981', icon: '✓', label: 'GO - Freigabe empfohlen' },
        'HOLD': { color: '#f59e0b', icon: '⚠', label: 'HOLD - Weitere Prüfung erforderlich' },
        'NO-GO': { color: '#ef4444', icon: '✕', label: 'NO-GO - Nicht empfohlen' }
    };
    
    const statusConfig = {
        'GREEN': { color: '#10b981', icon: '🟢', label: 'Grün - On Track' },
        'YELLOW': { color: '#f59e0b', icon: '🟡', label: 'Gelb - Risiken vorhanden' },
        'RED': { color: '#ef4444', icon: '🔴', label: 'Rot - Kritisch' }
    };
    
    const rec = recommendationConfig[recommendation.status];
    const sta = statusConfig[status.status];
    
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            
            <!-- Management-Empfehlung -->
            <div style="background: white; border: 2px solid ${rec.color}; border-radius: 8px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">
                    📍 Management-Empfehlung
                </div>
                <div style="font-size: 18px; font-weight: bold; color: ${rec.color}; margin-bottom: 4px;">
                    ${rec.icon} ${recommendation.status}
                </div>
                <div style="font-size: 12px; color: #6b7280;">
                    ${recommendation.reasoning}
                </div>
            </div>
            
            <!-- Projekt-Status -->
            <div style="background: white; border: 2px solid ${sta.color}; border-radius: 8px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">
                    📊 Projekt-Status
                </div>
                <div style="font-size: 18px; font-weight: bold; color: ${sta.color}; margin-bottom: 4px;">
                    ${sta.icon} ${status.status}
                </div>
                <div style="font-size: 12px; color: #6b7280;">
                    ${status.reasoning}
                </div>
            </div>
            
            <!-- Entscheidungsbedarf -->
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">
                    📅 Entscheidungsbedarf
                </div>
                <div style="font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 4px;">
                    Gate Review
                </div>
                <div style="font-size: 12px; color: #6b7280;">
                    Freigabe Entwicklungsbudget erforderlich bis Q1/2025
                </div>
            </div>
            
        </div>
    `;
}

/**
 * Section 3: Business Case Highlights (KPI Grid)
 */
/**
 * Section 3: Business Case Highlights (KPI Grid)
 */
function renderKPIGrid(calc) {
    // ✅ SAFE NULL CHECKS
    const npv = (calc?.kpis?.npv ?? 0) / 1000000;
    const irr = calc?.kpis?.irr ?? 0;
    const payback = calc?.kpis?.break_even_year || 'N/A';
    const ebitMargin = calc?.kpis?.avg_ebit_margin ?? 0;
    const breakEven = calc?.kpis?.break_even_year ? `Jahr ${calc.kpis.break_even_year}` : 'Nicht erreicht';
    const totalRevenue = (calc?.totals?.sales_revenue ?? 0) / 1000000;
    const roi = totalRevenue > 0 ? ((npv / (totalRevenue * 0.3)) * 100) : 0;
    
    const kpis = [
        { label: 'NPV', value: `€${npv.toFixed(1)}M`, status: npv > 0 ? 'good' : 'bad', tooltip: 'Net Present Value @ 8% WACC' },
        { label: 'IRR', value: `${irr.toFixed(1)}%`, status: irr > 15 ? 'good' : 'medium', tooltip: 'Internal Rate of Return' },
        { label: 'Payback', value: payback === 'N/A' ? payback : `${payback} Jahre`, status: (typeof payback === 'number' && payback <= 3) ? 'good' : 'medium', tooltip: 'Break-even in Jahren' },
        { label: 'EBIT-Marge', value: `${ebitMargin.toFixed(1)}%`, status: ebitMargin > 25 ? 'good' : 'medium', tooltip: 'Durchschnittliche EBIT-Marge' },
        { label: 'Break-Even', value: breakEven, status: (typeof payback === 'number' && payback <= 3) ? 'good' : 'medium', tooltip: 'Amortisationszeitpunkt' },
        { label: 'ROI', value: `${roi.toFixed(0)}%`, status: roi > 200 ? 'good' : 'medium', tooltip: 'Return on Investment' }
    ];
    
    const statusColors = {
        'good': { bg: '#f0fdf4', border: '#10b981', text: '#065f46' },
        'medium': { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
        'bad': { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }
    };
    
    return `
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 12px 0;">
                💰 Business Case Highlights
            </h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                ${kpis.map(kpi => {
                    const colors = statusColors[kpi.status];
                    return `
                        <div style="background: ${colors.bg}; border: 2px solid ${colors.border}; 
                                    border-radius: 8px; padding: 16px; position: relative;"
                             title="${kpi.tooltip}">
                            <div style="font-size: 11px; font-weight: 600; color: #6b7280; 
                                        text-transform: uppercase; margin-bottom: 8px;">
                                ${kpi.label}
                            </div>
                            <div style="font-size: 24px; font-weight: bold; color: ${colors.text};">
                                ${kpi.value}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * Section 4: Kernannahmen & Sensitivitäten
 */
function renderAssumptionsSensitivities(calc, artikel) {
    // ✅ SAFE NULL CHECKS
    const totalRevenue = (calc?.totals?.sales_revenue ?? 0) / 1000000;
    const totalVolume = artikel.reduce((sum, a) => sum + (a.volume ?? 0), 0);
    const avgPrice = totalVolume > 0 ? (totalRevenue * 1000000) / totalVolume : 0;
    const avgMargin = calc?.kpis?.avg_manufacturing_margin ?? 40;
    
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            
            <!-- Kernannahmen -->
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                <h4 style="font-size: 13px; font-weight: 600; color: #374151; margin: 0 0 12px 0;">
                    📌 Kritische Annahmen
                </h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #6b7280; line-height: 1.8;">
                    <li><strong>Marktvolumen:</strong> €${(totalRevenue * 10).toFixed(0)}M p.a. (Basis-Szenario)</li>
                    <li><strong>Marktanteil:</strong> ${totalRevenue > 0 ? ((totalRevenue / (totalRevenue * 10)) * 100).toFixed(1) : 0}% nach 3 Jahren</li>
                    <li><strong>Durchschnittspreis:</strong> €${avgPrice.toFixed(2)}</li>
                    <li><strong>Kostenstruktur:</strong> Material ${avgMargin.toFixed(0)}% DB</li>
                </ul>
            </div>
            
            <!-- Sensitivitäten -->
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                <h4 style="font-size: 13px; font-weight: 600; color: #374151; margin: 0 0 12px 0;">
                    📊 Sensitivitätsanalyse
                </h4>
                <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <th style="text-align: left; padding: 6px; color: #6b7280; font-weight: 600;">Parameter</th>
                            <th style="text-align: right; padding: 6px; color: #6b7280; font-weight: 600;">-20%</th>
                            <th style="text-align: right; padding: 6px; color: #6b7280; font-weight: 600;">Basis</th>
                            <th style="text-align: right; padding: 6px; color: #6b7280; font-weight: 600;">+20%</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 6px; color: #374151;">Umsatz</td>
                            <td style="padding: 6px; text-align: right; color: #ef4444;">€${(totalRevenue * 0.8).toFixed(1)}M</td>
                            <td style="padding: 6px; text-align: right; font-weight: 600;">€${totalRevenue.toFixed(1)}M</td>
                            <td style="padding: 6px; text-align: right; color: #10b981;">€${(totalRevenue * 1.2).toFixed(1)}M</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; color: #374151;">NPV</td>
                            <td style="padding: 6px; text-align: right; color: #ef4444;">€${((calc?.kpis?.npv ?? 0) / 1000000 * 0.7).toFixed(1)}M</td>
                            <td style="padding: 6px; text-align: right; font-weight: 600;">€${((calc?.kpis?.npv ?? 0) / 1000000).toFixed(1)}M</td>
                            <td style="padding: 6px; text-align: right; color: #10b981;">€${((calc?.kpis?.npv ?? 0) / 1000000 * 1.3).toFixed(1)}M</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
        </div>
    `;
}

/**
 * Section 5: Risiken & Chancen
 */
function renderRisksOpportunities(calc, projekt) {
    const risks = [
        { text: 'Marktakzeptanz unsicher', level: 'HOCH', color: '#ef4444' },
        { text: 'Technologie-Risiko (Skalierung)', level: 'MITTEL', color: '#f59e0b' },
        { text: 'Regulatorisches Umfeld', level: 'GERING', color: '#10b981' }
    ];
    
    const opportunities = [
        { text: 'First-Mover Advantage', impact: '+++' },
        { text: 'Cross-Selling Potenzial', impact: '++' },
        { text: 'Platform-Skalierung möglich', impact: '++' }
    ];
    
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            
            <!-- Risiken -->
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px;">
                <h4 style="font-size: 13px; font-weight: 600; color: #991b1b; margin: 0 0 12px 0;">
                    ⚠️ Top Risiken
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${risks.map(risk => `
                        <div style="display: flex; justify-content: space-between; align-items: center; 
                                    padding: 8px; background: white; border-radius: 4px;">
                            <span style="font-size: 12px; color: #374151;">• ${risk.text}</span>
                            <span style="font-size: 10px; font-weight: 600; padding: 2px 8px; 
                                         border-radius: 12px; background: ${risk.color}20; color: ${risk.color};">
                                ${risk.level}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Chancen -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px;">
                <h4 style="font-size: 13px; font-weight: 600; color: #065f46; margin: 0 0 12px 0;">
                    🚀 Top Chancen
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${opportunities.map(opp => `
                        <div style="display: flex; justify-content: space-between; align-items: center; 
                                    padding: 8px; background: white; border-radius: 4px;">
                            <span style="font-size: 12px; color: #374151;">• ${opp.text}</span>
                            <span style="font-size: 12px; font-weight: 600; color: #10b981;">
                                ${opp.impact}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
        </div>
    `;
}

/**
 * Section 6: Meilensteine & Timeline
 */
function renderMilestones(projekt) {
    const milestones = [
        { phase: 'Konzeptphase', status: 'done', date: 'Q4/2024', desc: 'Business Case validiert' },
        { phase: 'Gate 2 Review', status: 'current', date: 'Q1/2025', desc: 'Freigabe Entwicklung' },
        { phase: 'Pilot-Launch', status: 'pending', date: 'Q3/2025', desc: 'Beta mit 3 Kunden' },
        { phase: 'Full Rollout', status: 'pending', date: 'Q1/2026', desc: 'Go-to-Market' }
    ];
    
    return `
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 12px 0;">
                🎯 Meilensteine & Nächste Schritte
            </h3>
            
            <!-- Timeline -->
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; gap: 4px; margin-bottom: 16px;">
                    ${milestones.map((m, i) => `
                        <div style="flex: 1; text-align: center;">
                            <div style="width: 100%; height: 4px; background: ${m.status === 'done' ? '#10b981' : m.status === 'current' ? '#3b82f6' : '#e5e7eb'}; 
                                        border-radius: 2px; margin-bottom: 8px;"></div>
                            <div style="font-size: 10px; font-weight: 600; color: ${m.status === 'done' ? '#10b981' : m.status === 'current' ? '#3b82f6' : '#6b7280'};">
                                ${m.status === 'done' ? '✓' : m.status === 'current' ? '→' : '○'} ${m.phase}
                            </div>
                            <div style="font-size: 9px; color: #6b7280; margin-top: 2px;">${m.date}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Next Steps -->
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px;">
                <div style="font-size: 12px; font-weight: 600; color: #1e40af; margin-bottom: 8px;">
                    ⚡ Nächste Schritte
                </div>
                <ol style="margin: 0; padding-left: 20px; font-size: 11px; color: #374151; line-height: 1.8;">
                    <li>Freigabe Entwicklungsbudget (€12,5M)</li>
                    <li>Team-Aufbau (8 FTE - Product, Engineering, Sales)</li>
                    <li>Partner-Verträge finalisieren (3 strategische Partner)</li>
                </ol>
            </div>
        </div>
    `;
}

/**
 * Section 7: Mini Dashboard
 */
function renderMiniDashboard(calc) {
    return `
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 12px 0;">
                📈 Financial Overview
            </h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                
                <!-- Umsatz-Entwicklung -->
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">
                        Umsatz-Entwicklung
                    </div>
                    <canvas id="mini-chart-revenue" width="200" height="80"></canvas>
                </div>
                
                <!-- DB-Entwicklung -->
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">
                        Deckungsbeitrag 3
                    </div>
                    <canvas id="mini-chart-db" width="200" height="80"></canvas>
                </div>
                
                <!-- Break-Even -->
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">
                        Kumulierter DB3
                    </div>
                    <canvas id="mini-chart-cumulative" width="200" height="80"></canvas>
                </div>
                
            </div>
        </div>
    `;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getRecommendation(calc) {
    if (!calc || !calc.kpis) {
        return {
            status: 'HOLD',
            reasoning: 'Keine ausreichenden Daten für Bewertung'
        };
    }
    
    const npv = (calc.kpis.npv || 0) / 1000000;
    const irr = calc.kpis.irr || 0;
    const payback = calc.kpis.break_even_year;
    
    if (npv > 20 && irr > 20 && payback && payback <= 3) {
        return {
            status: 'GO',
            reasoning: 'Starker Business Case mit attraktivem ROI'
        };
    } else if (npv > 0 && irr > 10) {
        return {
            status: 'HOLD',
            reasoning: 'Positive aber moderate Rentabilität'
        };
    } else {
        return {
            status: 'NO-GO',
            reasoning: 'Business Case nicht tragfähig'
        };
    }
}

function getProjectStatus(calc) {
    if (!calc || !calc.kpis) {
        return {
            status: 'YELLOW',
            reasoning: 'Keine ausreichenden Daten'
        };
    }
    
    const npv = (calc.kpis.npv || 0) / 1000000;
    const payback = calc.kpis.break_even_year;
    
    if (npv > 30 && payback && payback <= 3) {
        return {
            status: 'GREEN',
            reasoning: 'Alle KPIs im Zielbereich'
        };
    } else if (npv > 10) {
        return {
            status: 'YELLOW',
            reasoning: 'Moderate Risiken identifiziert'
        };
    } else {
        return {
            status: 'RED',
            reasoning: 'Kritische Kennzahlen unter Plan'
        };
    }
}

function getStrategicPositioning(artikel, calc) {
    const hasHardware = artikel.some(a => a.typ === 'Hardware');
    const hasSoftware = artikel.some(a => a.typ === 'Software');
    const hasService = artikel.some(a => a.typ === 'Service');
    
    if (hasHardware && hasSoftware && hasService) {
        return 'Strategisches Plattform-Projekt mit integriertem Hardware-Software-Service-Ansatz zur Erschließung neuer Marktsegmente.';
    } else if (hasSoftware || hasService) {
        return 'Digitales Wachstumsprojekt zur Stärkung der Marktposition im Softwarebereich mit hoher Skalierbarkeit.';
    } else {
        return 'Produktinnovation zur Verteidigung und Ausbau der Marktführerschaft im Kerngeschäft.';
    }
}

function getValueProposition(calc) {
    const ebitMargin = calc.kpis.avg_ebit_margin;
    const totalRevenue = calc.totals.sales_revenue / 1000000;
    
    if (ebitMargin > 30 && totalRevenue > 100) {
        return 'Hochprofitables Wachstumsprojekt mit signifikantem Beitrag zu Konzernzielen (>€100M Umsatz, >30% EBIT-Marge).';
    } else if (ebitMargin > 20) {
        return 'Attraktives Projekt mit solider Profitabilität und Wachstumspotenzial im mittleren zweistelligen Bereich.';
    } else {
        return 'Strategisches Investitionsprojekt mit Fokus auf Markterschließung und langfristigem Wertbeitrag.';
    }
}

function initializeMiniCharts(calc) {
    if (!window.Chart) {
        console.warn('Chart.js not loaded - mini charts disabled');
        return;
    }
    
    const jahre = Object.keys(calc.jahre).sort();
    
    // Revenue Chart
    const revenueCanvas = document.getElementById('mini-chart-revenue');
    if (revenueCanvas) {
        new Chart(revenueCanvas, {
            type: 'line',
            data: {
                labels: jahre,
                datasets: [{
                    data: jahre.map(j => calc.jahre[j].sales_revenue / 1000000),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 3
                }]
            },
            options: getMiniChartOptions('€M')
        });
    }
    
    // DB3 Chart
    const dbCanvas = document.getElementById('mini-chart-db');
    if (dbCanvas) {
        new Chart(dbCanvas, {
            type: 'bar',
            data: {
                labels: jahre,
                datasets: [{
                    data: jahre.map(j => calc.jahre[j].db3 / 1000000),
                    backgroundColor: jahre.map(j => calc.jahre[j].db3 >= 0 ? '#10b981' : '#ef4444'),
                    borderRadius: 4
                }]
            },
            options: getMiniChartOptions('€M')
        });
    }
    
    // Cumulative Chart
    const cumulativeCanvas = document.getElementById('mini-chart-cumulative');
    if (cumulativeCanvas) {
        let cumulative = 0;
        new Chart(cumulativeCanvas, {
            type: 'line',
            data: {
                labels: jahre,
                datasets: [{
                    data: jahre.map(j => {
                        cumulative += calc.jahre[j].db3 / 1000000;
                        return cumulative;
                    }),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 3
                }]
            },
            options: getMiniChartOptions('€M')
        });
    }
}

function getMiniChartOptions(unit) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y.toFixed(1)} ${unit}`
                }
            }
        },
        scales: {
            x: {
                display: true,
                grid: { display: false },
                ticks: { font: { size: 9 }, color: '#6b7280' }
            },
            y: {
                display: true,
                grid: { color: '#f3f4f6' },
                ticks: { font: { size: 9 }, color: '#6b7280' }
            }
        }
    };
}

// ==========================================
// PDF EXPORT
// ==========================================

window.exportExecutiveSummaryPDF = function() {
    alert('PDF-Export Funktion wird implementiert.\n\nTipp: Nutzen Sie Cmd/Ctrl + P für Browser-PDF-Export.');
    window.print();
};

// ==========================================
// EXPORTS
// ==========================================

export default {
    renderUebersicht
};
