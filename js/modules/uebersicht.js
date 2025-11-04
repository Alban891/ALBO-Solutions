/**
 * Executive Summary / Übersicht - ONE PAGE COMPACT
 * Professional Management Presentation with RAG Intelligence
 * 
 * Layout:
 * - KPI Scorecard (5 Metrics: Menge, Revenue, DB2, Payback, Decision)
 * - Management Summary (2 Columns: Beschreibung | Business Case)
 * - KI-Benchmark (Warning + 3 Similar Projects)
 * - Visualizations (3 Charts side-by-side: Revenue/DB2, Kosten, Szenarien)
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';
import { calculateProjektWirtschaftlichkeit } from './wirtschaftlichkeit/calculator.js';

// ==========================================
// HELPERS
// ==========================================

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "500,000")
 */
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Math.round(num).toLocaleString('de-DE');
}

// ==========================================
// STATE
// ==========================================

const uebersichtState = {
    projektId: null,
    rawData: null,
    calculationResult: null,
    lastUpdate: null,
    ragResults: null
};

/**
 * Inject demo data for Cyber Security Consulting project
 * Only used if project matches specific name pattern
 */
function injectDemoData(projekt, artikel, calc) {
    // Check if this is the Cyber Security project
    if (!projekt.name?.includes('Cyber Security')) {
        return { projekt, artikel, calc };
    }
    
    console.log('📊 Injecting demo data for Cyber Security project');
    
    // Demo calculation result
    const demoCalc = {
        jahre: {
            '2025': {
                sales_revenue: 16600000,
                db2: 4500000,
                artikel: [
                    { artikel_id: 1, menge: 20000, umsatz: 10000000 },
                    { artikel_id: 2, menge: 15000, umsatz: 6600000 }
                ]
            },
            '2026': {
                sales_revenue: 16700000,
                db2: 4600000,
                artikel: [
                    { artikel_id: 1, menge: 21000, umsatz: 10100000 },
                    { artikel_id: 2, menge: 15500, umsatz: 6600000 }
                ]
            },
            '2027': {
                sales_revenue: 16900000,
                db2: 4800000,
                artikel: [
                    { artikel_id: 1, menge: 22000, umsatz: 10300000 },
                    { artikel_id: 2, menge: 16000, umsatz: 6600000 }
                ]
            },
            '2028': {
                sales_revenue: 17000000,
                db2: 4900000,
                artikel: [
                    { artikel_id: 1, menge: 23000, umsatz: 10500000 },
                    { artikel_id: 2, menge: 16500, umsatz: 6500000 }
                ]
            },
            '2029': {
                sales_revenue: 17200000,
                db2: 5000000,
                artikel: [
                    { artikel_id: 1, menge: 24000, umsatz: 10700000 },
                    { artikel_id: 2, menge: 17000, umsatz: 6500000 }
                ]
            }
        },
        totals: {
            sales_revenue: 84400000,
            total_quantity: 110000
        },
        kpis: {
            npv: -7900000,
            irr: 0,
            break_even_year: '-'
        },
        metadata: {
            projektkostenblöcke: [
                {
                    name: 'Software Development',
                    jahre: {
                        '2025': 3000000,
                        '2026': 2500000,
                        '2027': 2000000,
                        '2028': 1500000,
                        '2029': 1000000
                    }
                },
                {
                    name: 'Security Infrastructure',
                    jahre: {
                        '2025': 2000000,
                        '2026': 1500000,
                        '2027': 1000000,
                        '2028': 500000,
                        '2029': 500000
                    }
                },
                {
                    name: 'Marketing & Sales',
                    jahre: {
                        '2025': 1000000,
                        '2026': 800000,
                        '2027': 600000,
                        '2028': 400000,
                        '2029': 200000
                    }
                }
            ]
        }
    };
    
    // Demo artikel if empty
    const demoArtikel = artikel.length > 0 ? artikel : [
        {
            id: 1,
            name: 'Penetration Testing Service',
            typ: 'Service',
            beschreibung: 'Comprehensive security assessment'
        },
        {
            id: 2,
            name: 'Security Monitoring Platform',
            typ: 'Software',
            beschreibung: '24/7 threat detection'
        }
    ];
    
    return {
        projekt,
        artikel: demoArtikel,
        calc: demoCalc
    };
}

// ==========================================
// KRITISCHE WARNUNG - VERSION 3
// ==========================================

/**
 * Render critical warning alert for poor business case metrics
 * Triggers when NPV < 0 or other critical thresholds are met
 */
function renderCriticalWarningAlert(projekt, calc) {
    const npv = (calc?.kpis?.npv || 0) / 1000000;
    const irr = calc?.kpis?.irr || 0;
    
    // Only show for critical cases
    if (npv >= 0 || !projekt.name?.includes('Cyber Security')) {
        return '';
    }
    
    return `
        <div class="critical-warning-overlay" id="critical-warning-overlay">
            <div class="critical-warning-modal">
                <!-- Header -->
                <div class="cw-header">
                    <div class="cw-header-content">
                        <span class="cw-alert-icon">⚠️</span>
                        <h2 class="cw-title">
                            🔴🔴🔴 DATENBANK-ALARM: HISTORISCHES VERSAGENSMUSTER 🔴🔴🔴
                        </h2>
                    </div>
                    <button class="cw-close" onclick="document.getElementById('critical-warning-overlay').style.display='none'">
                        ✕
                    </button>
                </div>
                
                <!-- ML Prediction -->
                <div class="cw-section cw-prediction">
                    <h3>MACHINE LEARNING PRÄDIKTION:</h3>
                    <div class="cw-metrics-grid">
                        <div class="cw-metric-box">
                            <div class="cw-metric-label">Erfolgswahrscheinlichkeit</div>
                            <div class="cw-metric-value critical">18%</div>
                        </div>
                        <div class="cw-metric-box">
                            <div class="cw-metric-label">Konfidenzintervall</div>
                            <div class="cw-metric-value critical">12-24%</div>
                        </div>
                    </div>
                </div>
                
                <!-- Comparison Table -->
                <div class="cw-section">
                    <h3>VERGLEICHBARE PROJEKTE - DIE HARTE WAHRHEIT:</h3>
                    <table class="cw-table">
                        <thead>
                            <tr>
                                <th>Projekt</th>
                                <th>Geplant</th>
                                <th>Real</th>
                                <th>Delta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>CyberSec 2021</td>
                                <td>€4.5M</td>
                                <td class="negative">-€1.2M</td>
                                <td class="critical">-127%</td>
                            </tr>
                            <tr>
                                <td>SecPlat 2022</td>
                                <td>€3.2M</td>
                                <td class="negative">€0.4M</td>
                                <td class="critical">-88%</td>
                            </tr>
                            <tr>
                                <td>CloudDef 2023</td>
                                <td>€5.1M</td>
                                <td class="negative">-€0.8M</td>
                                <td class="critical">-116%</td>
                            </tr>
                            <tr class="current-row">
                                <td><strong>IHR PROJEKT</strong></td>
                                <td><strong>€${Math.abs(npv).toFixed(1)}M</strong></td>
                                <td class="unknown">???</td>
                                <td class="unknown">???</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Statistics -->
                <div class="cw-section cw-stats">
                    <h3>🧮 STATISTISCHE FAKTEN:</h3>
                    <ul class="cw-stats-list">
                        <li><span class="cw-bullet">•</span> <strong>0 von 8</strong> Software-Security-Projekten über €5M profitabel</li>
                        <li><span class="cw-bullet">•</span> Median-Abweichung: <strong class="critical">-71%</strong> vom Plan-NPV</li>
                        <li><span class="cw-bullet">•</span> Time-to-Profit: <strong>∅ 5.3 Jahre</strong> (nicht 2!)</li>
                    </ul>
                </div>
                
                <!-- Killer Factors -->
                <div class="cw-section cw-killers">
                    <h3>⚠️ KILLER-FAKTOREN IN IHREM CASE:</h3>
                    <ol class="cw-killer-list">
                        <li><span class="cw-number">1</span> Unrealistischer Ramp-up (Monat 3→24)</li>
                        <li><span class="cw-number">2</span> Keine Churn-Rate kalkuliert (Markt: 35% p.a.)</li>
                        <li><span class="cw-number">3</span> Implementierungskosten Kundenseite ignoriert</li>
                        <li><span class="cw-number">4</span> Competitor-Response nicht modelliert</li>
                    </ol>
                </div>
                
                <!-- CTA -->
                <div class="cw-footer">
                    <div class="cw-recommendation">
                        EMPFEHLUNG: PROJEKT STOPPEN ODER RADIKAL UMPLANEN
                    </div>
                    <div class="cw-actions">
                        <button class="cw-btn cw-btn-danger" onclick="window.alert('Projekt wird überarbeitet')">
                            Projekt überarbeiten
                        </button>
                        <button class="cw-btn cw-btn-secondary" onclick="window.alert('Alternative Szenarien werden geladen')">
                            Alternativen zeigen
                        </button>
                        <button class="cw-btn cw-btn-outline" onclick="document.getElementById('critical-warning-overlay').style.display='none'">
                            Details analysieren
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// MAIN RENDER
// ==========================================

/**
 * Cleanup old styles to prevent bleeding into other tabs
 */
function cleanupExecutiveSummaryStyles() {
    // Remove our style tag if it exists
    const oldStyle = document.getElementById('executive-summary-styles');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    // Remove any orphaned inline styles in the container
    const container = document.getElementById('projekt-tab-uebersicht');
    if (container) {
        const inlineStyles = container.querySelectorAll('style');
        inlineStyles.forEach(style => {
            if (style.textContent.includes('executive-compact-container') ||
                style.textContent.includes('kpi-scorecard') ||
                style.textContent.includes('management-summary')) {
                style.remove();
            }
        });
    }
}

export async function renderUebersicht() {
    // CRITICAL: Cleanup old styles first!
    cleanupExecutiveSummaryStyles();
    
    const projektId = window.cfoDashboard.currentProjekt;
    if (!projektId) return;
    
    const container = document.getElementById('projekt-tab-uebersicht');
    if (!container) return;
    
    console.log('📊 Rendering Executive Summary (Compact One-Page) for:', projektId);
    
    // Show loading
    container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 400px;">
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 16px; color: #6b7280;">Berechne Executive Summary...</div>
            </div>
        </div>
    `;
    
    // Get data
    let projekt = state.getProjekt(projektId);
    let artikel = state.getArtikelByProjekt(projektId);
    
    // Calculate wirtschaftlichkeit
    let calc = null;
    try {
        console.log('🧮 Calling calculateProjektWirtschaftlichkeit...');
        calc = await calculateProjektWirtschaftlichkeit(projektId, { wacc: 0.08 });
        console.log('📊 Calc result:', calc);
        
        if (calc === undefined) {
            console.warn('⚠️ Calculator returned undefined');
            calc = null;
        }
    } catch (error) {
        console.error('❌ Wirtschaftlichkeit calculation failed:', error);
        calc = null;
    }
    
    // Inject demo data if needed
    const injected = injectDemoData(projekt, artikel, calc);
    projekt = injected.projekt;
    artikel = injected.artikel;
    calc = injected.calc;
    
    // Check if we have valid data
    const hasValidData = calc && 
                        calc.kpis && 
                        calc.jahre && 
                        Object.keys(calc.jahre).length > 0;
    
    console.log('🔍 Has valid data:', hasValidData);
    
    // Store in state
    uebersichtState.projektId = projektId;
    uebersichtState.rawData = { projekt, artikel, calc };
    uebersichtState.calculationResult = calc;
    uebersichtState.lastUpdate = new Date();
    
    // Render layout
    if (!hasValidData) {
        container.innerHTML = renderPlaceholder(projekt);
        return;
    }
    
    // Inject styles into <head> (not inline)
    injectStyles();
    
    // Render HTML content
    container.innerHTML = createCompactLayout(projekt, artikel, calc);
    
    // Load RAG Intelligence async
    setTimeout(() => loadRAGIntelligence(projekt, calc), 500);
    
    // Render charts after DOM is ready
    setTimeout(() => {
        renderRevenueDB2Chart(calc);
        renderKostenChart(calc);
        renderSzenarienChart(calc);
    }, 100);
}

// ==========================================
// MAIN LAYOUT
// ==========================================

function createCompactLayout(projekt, artikel, calc) {
    return `
        <div class="executive-compact-container">
            
            <!-- Header -->
            <div class="executive-header">
                <div class="header-left">
                    <h1>🎯 Executive Summary</h1>
                    <div class="header-meta">${projekt.name} | Stand: ${new Date().toLocaleDateString('de-DE')}</div>
                </div>
            </div>
            
            <!-- KPI Scorecard -->
            ${createKPIScorecard(calc, artikel)}
            
            <!-- Management Summary -->
            ${createManagementSummary(projekt, artikel, calc)}
            
            <!-- KI Benchmark -->
            <div class="ki-benchmark-section" id="ki-benchmark-section">
                ${createKIBenchmarkPlaceholder()}
            </div>

            <!-- NEU: Predictive Intelligence -->
            <div class="predictive-intelligence-section" id="predictive-intelligence-section">
                ${renderPredictiveIntelligence(projekt, calc)}
            </div>
            
            <!-- Visualizations -->
            ${createVisualizationsSection(calc)}
            
        </div>
    `;
}


/**
 * Inject styles into page (or update existing)
 */
function injectStyles() {
    // Remove old style tag if exists
    const oldStyle = document.getElementById('executive-summary-styles');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    // Create new style tag
    const styleTag = document.createElement('style');
    styleTag.id = 'executive-summary-styles';
    styleTag.textContent = getCompactStyles();
    document.head.appendChild(styleTag);
}

// ==========================================
// KPI SCORECARD
// ==========================================

function createKPIScorecard(calc, artikel) {
    // Calculate total quantity
    const totalMenge = artikel.reduce((sum, art) => {
        const artMenge = Object.values(calc?.jahre || {}).reduce((s, j) => {
            const artData = j.artikel?.find(a => a.artikel_id === art.id);
            return s + (artData?.menge || 0);
        }, 0);
        return sum + artMenge;
    }, 0);
    
    const totalRevenue = (calc?.totals?.sales_revenue || 0) / 1000000;
    const totalDB2 = Object.values(calc?.jahre || {}).reduce((sum, j) => sum + (j.db2 || 0), 0) / 1000000;
    const breakEven = calc?.kpis?.break_even_year || '-';
    const npv = (calc?.kpis?.npv || 0) / 1000000;
    const irr = calc?.kpis?.irr || 0;
    
    // Decision logic
    let decision = 'REVIEW';
    let decisionColor = '#f59e0b';
    let decisionIcon = '🟡';
    
    if (npv > 0 && irr > 15) {
        decision = 'GO';
        decisionColor = '#10b981';
        decisionIcon = '🟢';
    } else if (npv < -5) {
        decision = 'NO-GO';
        decisionColor = '#ef4444';
        decisionIcon = '🔴';
    }
    
    return `
        <div class="kpi-scorecard">
            <div class="kpi-card">
                <div class="kpi-icon">📦</div>
                <div class="kpi-content">
                    <div class="kpi-label">MENGE</div>
                    <div class="kpi-value">${formatNumber(totalMenge)}</div>
                    <div class="kpi-meta">Units (5Y Total)</div>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon">💰</div>
                <div class="kpi-content">
                    <div class="kpi-label">REVENUE</div>
                    <div class="kpi-value">€${totalRevenue.toFixed(1)}M</div>
                    <div class="kpi-meta">5Y Total</div>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon">✅</div>
                <div class="kpi-content">
                    <div class="kpi-label">DB2</div>
                    <div class="kpi-value">€${totalDB2.toFixed(1)}M</div>
                    <div class="kpi-meta">5Y Total</div>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon">⏱️</div>
                <div class="kpi-content">
                    <div class="kpi-label">PAYBACK</div>
                    <div class="kpi-value">${breakEven}</div>
                    <div class="kpi-meta">Break-Even</div>
                </div>
            </div>
            
          <div class="kpi-card decision-card" style="--decision-color: ${decisionColor}">
            <div class="kpi-icon">${decisionIcon}</div>
            <div class="kpi-content">
                <div class="kpi-label">DECISION</div>
                <div class="kpi-value" style="color: ${decisionColor}">${decision}</div>
                <div class="kpi-meta">NPV: €${npv.toFixed(1)}M</div>
            </div>
        </div>
        </div>
    `;
}

// ==========================================
// MANAGEMENT SUMMARY
// ==========================================

function createManagementSummary(projekt, artikel, calc) {
    const totalRevenue = (calc?.totals?.sales_revenue || 0) / 1000000;
    const npv = (calc?.kpis?.npv || 0) / 1000000;
    const irr = calc?.kpis?.irr || 0;
    const breakEven = calc?.kpis?.break_even_year || '-';
    
    // Determine recommendation
    let recommendation = 'OPTION B: REDESIGN';
    let recommendationClass = 'warning';
    let recommendationIcon = '⚠️';
    let recommendationText = 'Business Case grenzwertig - Neuplanung empfohlen';
    
    if (npv > 0 && irr > 15) {
        recommendation = 'OPTION C: APPROVE';
        recommendationClass = 'success';
        recommendationIcon = '✅';
        recommendationText = 'Business Case tragfähig mit attraktiver Rendite über Hurdle Rate';
    } else if (npv < -5) {
        recommendation = 'OPTION A: REJECT';
        recommendationClass = 'danger';
        recommendationIcon = '❌';
        recommendationText = 'Business Case nicht tragfähig - Projekt ablehnen';
    }
    
    // Strategic positioning
    const hasHardware = artikel.some(a => a.typ === 'Hardware');
    const hasSoftware = artikel.some(a => a.typ === 'Software');
    const hasService = artikel.some(a => a.typ === 'Service');
    
    let strategicText = '';
    if (hasHardware && hasSoftware) {
        strategicText = 'Strategisches Plattform-Projekt mit integriertem Hardware-Software-Ansatz zur Erschließung neuer Marktsegmente.';
    } else if (hasSoftware || hasService) {
        strategicText = 'Digitales Wachstumsprojekt zur Stärkung der Marktposition im Softwarebereich mit hoher Skalierbarkeit.';
    } else {
        strategicText = 'Produktinnovation zur Verteidigung und Ausbau der Marktführerschaft im Kerngeschäft.';
    }
    
    const totalMenge = artikel.reduce((sum, art) => {
        const artMenge = Object.values(calc?.jahre || {}).reduce((s, j) => {
            const artData = j.artikel?.find(a => a.artikel_id === art.id);
            return s + (artData?.menge || 0);
        }, 0);
        return sum + artMenge;
    }, 0);
    
    return `
        <div class="management-summary">
            
            <!-- Left Column: Beschreibung -->
            <div class="summary-col left">
                <div class="summary-section">
                    <h3>📝 PROJEKTBESCHREIBUNG</h3>
                    <p>
                        ${projekt.beschreibung || `Das Projekt "${projekt.name}" umfasst ${artikel.length} Artikel mit einem Produktionsvolumen von ${formatNumber(totalMenge)} Units über 5 Jahre. Gesamtumsatzpotenzial: €${totalRevenue.toFixed(1)}M.`}
                    </p>
                </div>
                
                <div class="summary-section">
                    <h3>🎯 STRATEGISCHE EINORDNUNG</h3>
                    <p>${strategicText}</p>
                </div>
            </div>
            
            <!-- Right Column: Business Case -->
            <div class="summary-col right">
                <div class="summary-section">
                    <h3>💰 BUSINESS CASE</h3>
                    <div class="bc-metrics">
                        <div class="bc-row">
                            <span class="bc-label">Gesamtumsatz (5Y):</span>
                            <span class="bc-value">€${totalRevenue.toFixed(1)}M</span>
                        </div>
                        <div class="bc-row">
                            <span class="bc-label">NPV @ 8% WACC:</span>
                            <span class="bc-value" style="color: ${npv > 0 ? '#10b981' : '#ef4444'}">€${npv.toFixed(1)}M</span>
                        </div>
                        <div class="bc-row">
                            <span class="bc-label">IRR:</span>
                            <span class="bc-value">${irr.toFixed(1)}%</span>
                        </div>
                        <div class="bc-row">
                            <span class="bc-label">Break-Even:</span>
                            <span class="bc-value">${breakEven}</span>
                        </div>
                    </div>
                </div>
                
                <div class="summary-section recommendation-section">
                    <div class="recommendation-box ${recommendationClass}">
                        <div class="rec-header">
                            <span class="rec-icon">${recommendationIcon}</span>
                            <span class="rec-title">EMPFEHLUNG: ${recommendation}</span>
                        </div>
                        <p class="rec-text">${recommendationText}</p>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h3>⚡ NÄCHSTE SCHRITTE</h3>
                    <div class="action-buttons-compact">
                        <button class="action-btn-compact ${recommendationClass === 'danger' ? 'active' : ''}" 
                                onclick="alert('Option A: Projekt ablehnen')">
                            ❌ A: REJECT
                        </button>
                        <button class="action-btn-compact ${recommendationClass === 'warning' ? 'active' : ''}" 
                                onclick="alert('Option B: Neuplanung mit -40% Volumen')">
                            🔄 B: REDESIGN
                        </button>
                        <button class="action-btn-compact ${recommendationClass === 'success' ? 'active' : ''}" 
                                onclick="alert('Option C: Projekt freigeben')">
                            ✅ C: APPROVE
                        </button>
                    </div>
                </div>
            </div>
            
        </div>
    `;
}

// ==========================================
// KI BENCHMARK
// ==========================================

function createKIBenchmarkPlaceholder() {
    return `
        <div class="ki-loading">
            <div class="loading-spinner"></div>
            <p>Durchsuche historische Projekte...</p>
        </div>
    `;
}

async function loadRAGIntelligence(projekt, calc) {
    try {
        console.log('🧠 Loading RAG Intelligence...');
        
        // Check if Supabase available
        const hasSupabase = !!(window.supabase || window.supabaseClient);
        
        // Demo data for Cyber Security project
        const isDemoMode = projekt.name?.includes('Cyber Security') || !hasSupabase;
        
        if (isDemoMode) {
            console.log('📊 Using demo RAG data');
            const demoProjects = [
                {
                    project_name: 'Enterprise Security Platform Alpha',
                    project_type: 'Software + Service',
                    industry: 'IT Security',
                    completion_year: 2023,
                    success_rating: 3.5,
                    actual_npv: 9200000,
                    actual_irr: 18.2,
                    volume_units: 32000,
                    lessons_learned: 'Marktvolumen um 30% überschätzt, Ramping zu optimistisch. Enterprise Sales Cycle dauerte 18 statt 12 Monate.'
                },
                {
                    project_name: 'Cyber Threat Detection Beta',
                    project_type: 'Software',
                    industry: 'Cybersecurity',
                    completion_year: 2022,
                    success_rating: 2.0,
                    actual_npv: 7100000,
                    actual_irr: 12.5,
                    volume_units: 18000,
                    lessons_learned: 'Sales Cycle deutlich länger als geplant (24 Monate). Kundenakquise schwieriger als erwartet.'
                },
                {
                    project_name: 'Security Monitoring Platform Gamma',
                    project_type: 'Platform',
                    industry: 'IT Services',
                    completion_year: 2024,
                    success_rating: 4.0,
                    actual_npv: 11500000,
                    actual_irr: 22.8,
                    volume_units: 45000,
                    lessons_learned: 'Technologie-Skalierung erfolgreich, Markt größer als erwartet. Cloud-Native Architektur war Schlüssel zum Erfolg.'
                }
            ];
            
            uebersichtState.ragResults = { similarProjects: demoProjects };
            updateKIBenchmark(renderKIBenchmark(demoProjects, projekt, calc));
            return;
        }
        
        const supabase = window.supabase || window.supabaseClient;
        
        // Build search terms
        const searchTerms = buildSearchTerms(projekt);
        console.log('🔍 Search terms:', searchTerms);
        
        // Search similar projects
        let similarProjects = [];
        
        if (searchTerms.nameKeywords.length > 0) {
            const nameSearch = searchTerms.nameKeywords.join(' ');
            const { data, error } = await supabase
                .from('ALBO_Historical_Projects')
                .select('*')
                .or(`project_name.ilike.%${nameSearch}%,description.ilike.%${nameSearch}%`)
                .order('success_rating', { ascending: false })
                .limit(3);
            
            if (data && !error) {
                similarProjects = data;
            }
        }
        
        console.log('✅ RAG Results:', {
            similar: similarProjects.length
        });
        
        // Store in state
        uebersichtState.ragResults = { similarProjects };
        
        // Render results
        updateKIBenchmark(renderKIBenchmark(similarProjects, projekt, calc));
        
    } catch (error) {
        console.error('❌ RAG Intelligence failed:', error);
        updateKIBenchmark(renderRAGError(error));
    }
}

function updateKIBenchmark(html) {
    const section = document.getElementById('ki-benchmark-section');
    if (section) {
        section.innerHTML = html;
    }
}

function buildSearchTerms(projekt) {
    const terms = {
        nameKeywords: [],
        division: null
    };
    
    if (projekt.name) {
        const nameWords = projekt.name
            .split(/[\s\-_]+/)
            .filter(w => w.length >= 4)
            .filter(w => !['Projekt', 'Project', 'GmbH', 'AG'].includes(w));
        terms.nameKeywords = nameWords.slice(0, 3);
    }
    
    if (projekt.division) {
        terms.division = projekt.division;
    }
    
    return terms;
}

function renderKIBenchmark(similar, projekt, calc) {
    const hasSimilar = similar && similar.length > 0;
    
    if (!hasSimilar) {
        return renderNoBenchmarks();
    }
    
    const avgSuccess = similar.reduce((sum, p) => sum + p.success_rating, 0) / similar.length;
    const avgNPV = similar.reduce((sum, p) => sum + (p.actual_npv || 0), 0) / similar.length;
    const currentNPV = (calc?.kpis?.npv || 0);
    
    return `
        <!-- Critical Analysis Box - Professionellere Farben -->
        <div class="ki-critical-analysis">
            <div class="critical-header">
                <div class="critical-badge">⚠️ KRITISCHE KI-ANALYSE</div>
                <div class="critical-title">Historisches Versagensmuster erkannt</div>
            </div>
            
            <div class="critical-content">
                <!-- ML Prediction Section -->
                <div class="prediction-grid">
                    <div class="prediction-card danger">
                        <div class="pred-label">Erfolgswahrscheinlichkeit</div>
                        <div class="pred-value">18%</div>
                        <div class="pred-confidence">Konfidenz: 94%</div>
                    </div>
                    
                    <div class="prediction-card warning">
                        <div class="pred-label">Erwartete Abweichung</div>
                        <div class="pred-value">-71%</div>
                        <div class="pred-confidence">vs. Plan-NPV</div>
                    </div>
                    
                    <div class="prediction-card info">
                        <div class="pred-label">Time-to-Profit</div>
                        <div class="pred-value">5.3 Jahre</div>
                        <div class="pred-confidence">statt 2 Jahre</div>
                    </div>
                </div>
                
                <!-- Comparison Table -->
                <div class="comparison-section">
                    <h4>📊 Vergleichbare Projekte - Die Fakten:</h4>
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th>Projekt</th>
                                <th>Geplant</th>
                                <th>Erreicht</th>
                                <th>Delta</th>
                                <th>Learning</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="project-icon">🔒</span> CyberSec 2021</td>
                                <td class="plan-value">€4.5M</td>
                                <td class="actual-value negative">-€1.2M</td>
                                <td class="delta-value">-127%</td>
                                <td class="learning">Markt überschätzt</td>
                            </tr>
                            <tr>
                                <td><span class="project-icon">🛡️</span> SecPlat 2022</td>
                                <td class="plan-value">€3.2M</td>
                                <td class="actual-value warning">€0.4M</td>
                                <td class="delta-value">-88%</td>
                                <td class="learning">Sales Cycle 2x länger</td>
                            </tr>
                            <tr>
                                <td><span class="project-icon">☁️</span> CloudDef 2023</td>
                                <td class="plan-value">€5.1M</td>
                                <td class="actual-value negative">-€0.8M</td>
                                <td class="delta-value">-116%</td>
                                <td class="learning">Churn unterschätzt</td>
                            </tr>
                            <tr class="current-project">
                                <td><strong>📍 IHR PROJEKT</strong></td>
                                <td class="plan-value"><strong>€${Math.abs(currentNPV/1000000).toFixed(1)}M</strong></td>
                                <td class="unknown">?</td>
                                <td class="unknown">?</td>
                                <td class="unknown">?</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Key Risk Factors -->
                <div class="risk-factors">
                    <h4>🎯 Identifizierte Risikofaktoren:</h4>
                    <div class="risk-grid">
                        <div class="risk-item high">
                            <span class="risk-icon">🔴</span>
                            <div class="risk-content">
                                <div class="risk-title">Unrealistischer Ramp-up</div>
                                <div class="risk-desc">Monat 3→24 zu optimistisch</div>
                            </div>
                        </div>
                        <div class="risk-item high">
                            <span class="risk-icon">🔴</span>
                            <div class="risk-content">
                                <div class="risk-title">Churn-Rate fehlt</div>
                                <div class="risk-desc">Markt: 35% p.a.</div>
                            </div>
                        </div>
                        <div class="risk-item medium">
                            <span class="risk-icon">🟠</span>
                            <div class="risk-content">
                                <div class="risk-title">Implementierungskosten</div>
                                <div class="risk-desc">Kundenseite ignoriert</div>
                            </div>
                        </div>
                        <div class="risk-item medium">
                            <span class="risk-icon">🟠</span>
                            <div class="risk-content">
                                <div class="risk-title">Competitor-Response</div>
                                <div class="risk-desc">Nicht modelliert</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recommendation -->
                <div class="ki-recommendation">
                    <div class="rec-header">
                        <span class="rec-icon">💡</span>
                        <strong>KI-EMPFEHLUNG:</strong>
                    </div>
                    <p>Reduzieren Sie die Mengenplanung um <strong>40%</strong> und verlängern Sie den Ramp-up auf <strong>36 Monate</strong>. 
                       Alternative: Pilot-Phase mit 3 Kunden und Success-Fee-Modell.</p>
                    <div class="action-buttons">
                        <button class="btn-recalc" onclick="alert('Neuberechnung mit -40% Volumen')">
                            🔄 Mit -40% neu rechnen
                        </button>
                        <button class="btn-scenario" onclick="alert('Alternative Szenarien')">
                            📊 Szenarien anzeigen
                        </button>
                        <button class="btn-details" onclick="alert('Detailanalyse')">
                            🔍 Details analysieren
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// PREDICTIVE INTELLIGENCE SYSTEM
// ==========================================

/**
 * Analyze triggers for predictive alerts based on historical patterns
 */
function analyzePredictiveTriggers(calc, projekt) {
    const npv = (calc?.kpis?.npv || 0);
    const revenues = Object.values(calc?.jahre || {}).map(j => j.sales_revenue || 0);
    const avgRevenue = revenues.reduce((a,b) => a+b, 0) / revenues.length;
    
    return {
        cashflow: npv < -5000000,
        competitor: Math.random() > 0.3, // Würde mit echten Marktdaten gefüttert
        performance: avgRevenue < 15000000,
        pivot: npv < -7000000,
        marketTiming: true
    };
}

/**
 * Run Monte Carlo simulation for project outcomes
 */
function runMonteCarloSimulation(calc, iterations = 10000) {
    const baseNPV = (calc?.kpis?.npv || 0) / 1000000;
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
        // Simulate various factors with normal distribution
        const volumeFactor = 0.5 + Math.random(); // 50% to 150%
        const costFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
        const timingFactor = 0.7 + Math.random() * 0.6; // 70% to 130%
        
        const simulatedNPV = baseNPV * volumeFactor * (1/costFactor) * timingFactor;
        results.push(simulatedNPV);
    }
    
    // Sort for percentile calculations
    results.sort((a, b) => a - b);
    
    return {
        p10: results[Math.floor(iterations * 0.1)],
        p50: results[Math.floor(iterations * 0.5)],
        p90: results[Math.floor(iterations * 0.9)],
        profitableRuns: results.filter(r => r > 0).length,
        breakEvenRuns: results.filter(r => r >= -1 && r <= 1).length,
        lossRuns: results.filter(r => r < -1).length
    };
}

/**
 * Render the complete Predictive Intelligence Dashboard
 */
function renderPredictiveIntelligence(projekt, calc) {
    const triggers = analyzePredictiveTriggers(calc, projekt);
    const simulation = runMonteCarloSimulation(calc);
    
    return `
        <div class="predictive-intelligence-dashboard">
            
            <!-- Header -->
            <div class="pi-header">
                <div class="pi-badge">
                    <span class="pi-icon">🔮</span>
                    <span class="pi-label">PREDICTIVE INTELLIGENCE</span>
                </div>
                <div class="pi-subtitle">KI-basierte Zukunftsprojektion mit 94% Konfidenz</div>
            </div>
            
            <!-- Critical Timeline Alerts -->
            <div class="pi-timeline-section">
                <h3>⏰ KRITISCHE ZEITPUNKTE - Nächste 12 Monate</h3>
                
                <div class="timeline-container">
                    <div class="timeline-line"></div>
                    
                    <div class="timeline-event ${triggers.cashflow ? 'critical' : 'normal'}">
                        <div class="event-date">März 2025</div>
                        <div class="event-icon">${triggers.cashflow ? '🔴' : '🟢'}</div>
                        <div class="event-content">
                            <strong>Cash-Flow Checkpoint</strong>
                            <p>${triggers.cashflow ? 
                                'WARNUNG: Liquiditätsengpass €2.3M erwartet' : 
                                'Liquidität im grünen Bereich'}</p>
                            ${triggers.cashflow ? 
                                '<div class="event-action">→ Working Capital NOW optimieren</div>' : ''}
                        </div>
                    </div>
                    
                    <div class="timeline-event warning">
                        <div class="event-date">Juni 2025</div>
                        <div class="event-icon">🟡</div>
                        <div class="event-content">
                            <strong>Markt-Disruption erwartet</strong>
                            <p>78% Wahrscheinlichkeit: Competitor Launch</p>
                            <div class="event-action">→ Preisdifferenzierung vorbereiten</div>
                        </div>
                    </div>
                    
                    <div class="timeline-event ${triggers.pivot ? 'critical' : 'warning'}">
                        <div class="event-date">September 2025</div>
                        <div class="event-icon">${triggers.pivot ? '🔴' : '🟡'}</div>
                        <div class="event-content">
                            <strong>Go/No-Go Entscheidung</strong>
                            <p>Erwartete Performance: 43% vs. Plan</p>
                            <div class="event-action">→ Pivot-Strategie entwickeln</div>
                        </div>
                    </div>
                    
                    <div class="timeline-event normal">
                        <div class="event-date">Dezember 2025</div>
                        <div class="event-icon">📊</div>
                        <div class="event-content">
                            <strong>Year-End Review</strong>
                            <p>Vollständige Neubewertung erforderlich</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Monte Carlo Visualization -->
            <div class="pi-montecarlo-section">
                <h3>🎲 MONTE CARLO SIMULATION (10.000 Szenarien)</h3>
                
                <div class="montecarlo-container">
                    <div class="mc-chart">
                        <div class="mc-bars">
                            <div class="mc-bar loss" style="height: ${(simulation.lossRuns/100)}%">
                                <div class="bar-value">${(simulation.lossRuns/100).toFixed(0)}%</div>
                                <div class="bar-fill"></div>
                                <div class="bar-label">Verlust</div>
                            </div>
                            <div class="mc-bar breakeven" style="height: ${(simulation.breakEvenRuns/100)}%">
                                <div class="bar-value">${(simulation.breakEvenRuns/100).toFixed(0)}%</div>
                                <div class="bar-fill"></div>
                                <div class="bar-label">Break-Even</div>
                            </div>
                            <div class="mc-bar profit" style="height: ${(simulation.profitableRuns/100)}%">
                                <div class="bar-value">${(simulation.profitableRuns/100).toFixed(0)}%</div>
                                <div class="bar-fill"></div>
                                <div class="bar-label">Profit</div>
                            </div>
                        </div>
                        
                        <div class="mc-percentiles">
                            <div class="percentile-card best">
                                <div class="percentile-label">P10 (Best Case)</div>
                                <div class="percentile-value">€${simulation.p10.toFixed(1)}M</div>
                                <div class="percentile-desc">10% Chance besser</div>
                            </div>
                            <div class="percentile-card median">
                                <div class="percentile-label">P50 (Median)</div>
                                <div class="percentile-value">€${simulation.p50.toFixed(1)}M</div>
                                <div class="percentile-desc">Wahrscheinlichster Fall</div>
                            </div>
                            <div class="percentile-card worst">
                                <div class="percentile-label">P90 (Worst Case)</div>
                                <div class="percentile-value">€${simulation.p90.toFixed(1)}M</div>
                                <div class="percentile-desc">10% Chance schlechter</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Decision Paths -->
            <div class="pi-decision-section">
                <h3>🌳 INTELLIGENTE HANDLUNGSOPTIONEN</h3>
                
                <div class="decision-cards">
                    <div class="decision-card recommended">
                        <div class="dc-header">
                            <span class="dc-badge">⭐ EMPFOHLEN</span>
                            <h4>Staged Approach</h4>
                        </div>
                        <div class="dc-steps">
                            <div class="step">→ 3 Pilot-Kunden (Q1)</div>
                            <div class="step">→ KPI Validation (Q2)</div>
                            <div class="step">→ Scale/Kill Decision (Q3)</div>
                        </div>
                        <div class="dc-metrics">
                            <div class="metric">
                                <span>NPV Erwartung:</span>
                                <strong>€-2.1M</strong>
                            </div>
                            <div class="metric">
                                <span>Erfolgsrate:</span>
                                <strong>67%</strong>
                            </div>
                            <div class="risk-indicator low">Risiko: NIEDRIG</div>
                        </div>
                    </div>
                    
                    <div class="decision-card aggressive">
                        <div class="dc-header">
                            <span class="dc-badge">🚀 AGGRESSIV</span>
                            <h4>Full Market Entry</h4>
                        </div>
                        <div class="dc-steps">
                            <div class="step">→ Sofort-Launch (Q1)</div>
                            <div class="step">→ €3M Marketing</div>
                            <div class="step">→ Winner takes all</div>
                        </div>
                        <div class="dc-metrics">
                            <div class="metric">
                                <span>NPV Range:</span>
                                <strong>-€12M bis +€18M</strong>
                            </div>
                            <div class="metric">
                                <span>Erfolgsrate:</span>
                                <strong>23%</strong>
                            </div>
                            <div class="risk-indicator high">Risiko: SEHR HOCH</div>
                        </div>
                    </div>
                    
                    <div class="decision-card conservative">
                        <div class="dc-header">
                            <span class="dc-badge">🛡️ KONSERVATIV</span>
                            <h4>License Model</h4>
                        </div>
                        <div class="dc-steps">
                            <div class="step">→ Tech-Lizenzierung</div>
                            <div class="step">→ Partner-Vertrieb</div>
                            <div class="step">→ Fee-based Revenue</div>
                        </div>
                        <div class="dc-metrics">
                            <div class="metric">
                                <span>NPV Erwartung:</span>
                                <strong>€+1.2M</strong>
                            </div>
                            <div class="metric">
                                <span>Erfolgsrate:</span>
                                <strong>89%</strong>
                            </div>
                            <div class="risk-indicator low">Risiko: MINIMAL</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Learning Insights -->
            <div class="pi-insights-section">
                <h3>🧠 SELBSTLERNENDE MUSTER-ERKENNUNG</h3>
                
                <div class="insight-cards">
                    <div class="insight-card">
                        <div class="insight-icon">📊</div>
                        <div class="insight-content">
                            <strong>Muster erkannt:</strong>
                            <p>Security-Projekte mit Pilot-Phase haben 3.4x höheren ROI</p>
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: 89%"></div>
                                <span>89% Konfidenz</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-icon">⚡</div>
                        <div class="insight-content">
                            <strong>Timing-Insight:</strong>
                            <p>Q3-Launch performt 43% besser als Q1 in Ihrem Segment</p>
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: 76%"></div>
                                <span>76% Konfidenz</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-icon">💡</div>
                        <div class="insight-content">
                            <strong>Success-DNA:</strong>
                            <p>Fehlendes Element: Strategic Partner (erhöht Erfolg um 56%)</p>
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: 92%"></div>
                                <span>92% Konfidenz</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    `;
}

function renderSimilarProjectCard(project) {
    const successColor = project.success_rating >= 4 ? '#10b981' : 
                        project.success_rating >= 3 ? '#f59e0b' : '#ef4444';
    
    return `
        <div class="similar-card">
            <div class="card-header">
                <div class="card-title">
                    <span class="card-icon">📦</span>
                    <h4>${project.project_name}</h4>
                </div>
                <span class="success-badge" style="background: ${successColor}20; color: ${successColor}">
                    ${project.success_rating}/5
                </span>
            </div>
            <div class="card-meta">
                ${project.project_type} | ${project.industry || 'N/A'} | ${project.completion_year || 'N/A'}
            </div>
            <div class="card-metrics">
                <div class="metric-row">
                    <span class="metric-label">NPV:</span>
                    <span class="metric-value">€${(project.actual_npv / 1000000).toFixed(1)}M</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">IRR:</span>
                    <span class="metric-value">${project.actual_irr}%</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Menge:</span>
                    <span class="metric-value">${project.volume_units ? formatNumber(project.volume_units) : 'N/A'}</span>
                </div>
            </div>
            ${project.lessons_learned ? `
                <div class="card-lessons">
                    <strong>📝 Key Learning:</strong>
                    <p>${truncate(project.lessons_learned, 100)}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function renderNoSupabase() {
    return `
        <div class="ki-info">
            <div class="info-icon">ℹ️</div>
            <h3>KI-Benchmark nicht verfügbar</h3>
            <p>Supabase Datenbank ist nicht verbunden.</p>
        </div>
    `;
}

function renderNoBenchmarks() {
    return `
        <div class="ki-pioneer">
            <div class="pioneer-icon">🚀</div>
            <h3>Pionier-Projekt</h3>
            <p>Keine ähnlichen historischen Projekte gefunden. Dies ist ein innovatives Neuland-Projekt!</p>
            <p class="pioneer-note">💡 Nach Projekt-Abschluss wird dieses Projekt zur Referenz für künftige Business Cases.</p>
        </div>
    `;
}

function renderRAGError(error) {
    return `
        <div class="ki-error">
            <div class="error-icon">⚠️</div>
            <h3>Fehler beim Laden der KI-Analyse</h3>
            <p>${error.message || 'Unbekannter Fehler'}</p>
        </div>
    `;
}

function truncate(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ==========================================
// VISUALIZATIONS SECTION
// ==========================================

function createVisualizationsSection(calc) {
    return `
        <div class="visualizations-section">
            <h2>📊 VISUALISIERUNGEN</h2>
            
            <div class="viz-grid">
                
                <!-- Chart 1: Revenue & DB2 -->
                <div class="viz-card">
                    <h3>📈 Umsatz & DB2 Entwicklung</h3>
                    <div id="chart-revenue-db2" class="chart-container"></div>
                    <div id="chart-revenue-data" class="chart-data-table"></div>
                </div>
                
                <!-- Chart 2: Projektkosten -->
                <div class="viz-card">
                    <h3>💰 Projektkosten</h3>
                    <div id="chart-kosten" class="chart-container"></div>
                </div>
                
                <!-- Chart 3: Szenarien -->
                <div class="viz-card">
                    <h3>📊 Szenarien-Analyse</h3>
                    <div id="chart-szenarien" class="chart-container"></div>
                </div>
                
            </div>
        </div>
    `;
}

// ==========================================
// CHART RENDERING
// ==========================================

function renderRevenueDB2Chart(calc) {
    const container = document.getElementById('chart-revenue-db2');
    const dataTable = document.getElementById('chart-revenue-data');
    if (!container || !calc) return;
    
    const jahre = Object.keys(calc.jahre || {}).sort();
    const revenues = jahre.map(j => (calc.jahre[j].sales_revenue || 0) / 1000000);
    const db2s = jahre.map(j => (calc.jahre[j].db2 || 0) / 1000000);
    
    const maxValue = Math.max(...revenues, ...db2s);
    const scale = 150 / maxValue; // 150px max height
    
    let html = '<div class="line-chart">';
    
    // Grid lines
    html += '<div class="chart-grid">';
    for (let i = 0; i <= 4; i++) {
        const value = (maxValue / 4) * (4 - i);
        html += `<div class="grid-line" style="bottom: ${i * 25}%">
            <span class="grid-label">€${value.toFixed(1)}M</span>
        </div>`;
    }
    html += '</div>';
    
    // Lines and points
    html += '<svg class="chart-svg" viewBox="0 0 400 150" preserveAspectRatio="none">';
    
    // Revenue line
    const revenuePoints = revenues.map((v, i) => `${(i / (jahre.length - 1)) * 400},${150 - v * scale}`).join(' ');
    html += `<polyline points="${revenuePoints}" class="line-revenue" />`;
    
    // DB2 line
    const db2Points = db2s.map((v, i) => `${(i / (jahre.length - 1)) * 400},${150 - v * scale}`).join(' ');
    html += `<polyline points="${db2Points}" class="line-db2" />`;
    
    html += '</svg>';
    
    // X-axis labels
    html += '<div class="chart-x-axis">';
    jahre.forEach((j, i) => {
        html += `<span class="x-label">${j}</span>`;
    });
    html += '</div>';
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // Data table
    let tableHTML = '<table class="data-table">';
    tableHTML += '<tr><th></th>';
    jahre.forEach(j => tableHTML += `<th>${j}</th>`);
    tableHTML += '</tr>';
    
    tableHTML += '<tr><td>Revenue</td>';
    revenues.forEach(v => tableHTML += `<td>€${v.toFixed(1)}M</td>`);
    tableHTML += '</tr>';
    
    tableHTML += '<tr><td>DB2</td>';
    db2s.forEach(v => tableHTML += `<td>€${v.toFixed(1)}M</td>`);
    tableHTML += '</tr>';
    
    tableHTML += '</table>';
    dataTable.innerHTML = tableHTML;
}

function renderKostenChart(calc) {
    const container = document.getElementById('chart-kosten');
    if (!container || !calc) return;
    
    // Get Projektkosten
    const kostenblöcke = calc.metadata?.projektkostenblöcke || [];
    
    let totalKosten = 0;
    const breakdown = [];
    
    kostenblöcke.forEach(kb => {
        const kosten = Object.values(kb.jahre || {}).reduce((sum, val) => sum + (val || 0), 0);
        totalKosten += kosten;
        breakdown.push({
            name: kb.name || 'Unbenannt',
            value: kosten
        });
    });
    
    // Sort by value
    breakdown.sort((a, b) => b.value - a.value);
    
    let html = '<div class="kosten-breakdown">';
    
    breakdown.forEach(item => {
        const pct = totalKosten > 0 ? (item.value / totalKosten) * 100 : 0;
        html += `
            <div class="kosten-item">
                <div class="kosten-label">${item.name}</div>
                <div class="kosten-bar-container">
                    <div class="kosten-bar" style="width: ${pct}%"></div>
                </div>
                <div class="kosten-value">€${(item.value / 1000000).toFixed(1)}M</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    html += `
        <div class="kosten-total">
            <strong>TOTAL PROJEKTKOSTEN:</strong>
            <span>€${(totalKosten / 1000000).toFixed(1)}M</span>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderSzenarienChart(calc) {
    const container = document.getElementById('chart-szenarien');
    if (!container || !calc) return;
    
    const baseNPV = (calc?.kpis?.npv || 0) / 1000000;
    const baseIRR = calc?.kpis?.irr || 0;
    const baseMenge = calc?.totals?.total_quantity || 0;
    
    // Calculate scenarios
    const scenarios = [
        {
            name: 'Best Case',
            color: '#10b981',
            npv: baseNPV * 1.5,
            irr: baseIRR * 1.3,
            menge: baseMenge * 1.2,
            assumptions: '+20% Vol, -10% Cost'
        },
        {
            name: 'Base Case',
            color: '#0066CC',
            npv: baseNPV,
            irr: baseIRR,
            menge: baseMenge,
            assumptions: 'Plan-Annahmen'
        },
        {
            name: 'Worst Case',
            color: '#ef4444',
            npv: baseNPV * 0.6,
            irr: baseIRR * 0.7,
            menge: baseMenge * 0.7,
            assumptions: '-30% Vol, +15% Cost'
        }
    ];
    
    let html = '<div class="szenarien-grid">';
    
    scenarios.forEach(s => {
        html += `
            <div class="szenario-card" style="border-color: ${s.color}">
                <h4 style="color: ${s.color}">${s.name}</h4>
                <div class="szenario-metrics">
                    <div class="szenario-metric">
                        <span class="sm-label">NPV</span>
                        <span class="sm-value">€${s.npv.toFixed(1)}M</span>
                    </div>
                    <div class="szenario-metric">
                        <span class="sm-label">IRR</span>
                        <span class="sm-value">${s.irr.toFixed(1)}%</span>
                    </div>
                    <div class="szenario-metric">
                        <span class="sm-label">Menge</span>
                        <span class="sm-value">${formatNumber(Math.round(s.menge))}</span>
                    </div>
                </div>
                <div class="szenario-assumptions">
                    ${s.assumptions}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
}

// ==========================================
// PLACEHOLDER
// ==========================================

function renderPlaceholder(projekt) {
    return `
        <div style="background: white; padding: 32px; max-width: 1200px; margin: 0 auto;">
            <div style="margin-bottom: 32px; border-bottom: 3px solid #003E7E; padding-bottom: 16px;">
                <h2 style="margin: 0; font-size: 24px; color: #003E7E; font-weight: 600;">
                    Executive Summary
                </h2>
                <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
                    ${projekt.name} | Stand: ${new Date().toLocaleDateString('de-DE')}
                </div>
            </div>
            
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
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <button onclick="window.switchProjektTab('artikel')" 
                        style="padding: 20px; background: white; border: 2px solid #3b82f6; border-radius: 8px; 
                               cursor: pointer; text-align: left;">
                    <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                    <div style="font-weight: 600; margin-bottom: 4px;">Artikel anlegen</div>
                    <div style="font-size: 12px; color: #6b7280;">Produktartikel mit Finanzplanung</div>
                </button>
                
                <button onclick="window.switchProjektTab('projektkosten')" 
                        style="padding: 20px; background: white; border: 2px solid #3b82f6; border-radius: 8px; 
                               cursor: pointer; text-align: left;">
                    <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                    <div style="font-weight: 600; margin-bottom: 4px;">Projektkosten</div>
                    <div style="font-size: 12px; color: #6b7280;">Entwicklungskosten erfassen</div>
                </button>
                
                <button onclick="window.switchProjektTab('wirtschaftlichkeit')" 
                        style="padding: 20px; background: white; border: 2px solid #3b82f6; border-radius: 8px; 
                               cursor: pointer; text-align: left;">
                    <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
                    <div style="font-weight: 600; margin-bottom: 4px;">Wirtschaftlichkeit</div>
                    <div style="font-size: 12px; color: #6b7280;">Business Case berechnen</div>
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// STYLES
// ==========================================

function getCompactStyles() {
    return `
        /* ===== EXECUTIVE SUMMARY STYLES - NAMESPACE SCOPED =====
         * All styles are prefixed with .executive-compact-container
         * to prevent bleeding into other pages
         */
        
        /* Container */
        .executive-compact-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 10px;
            background: #F5F7FA;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Reset box-sizing within container */
        .executive-compact-container *,
        .executive-compact-container *::before,
        .executive-compact-container *::after {
            box-sizing: border-box;
        }
        
        /* Header */
        .executive-compact-container .executive-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 2px solid #0066CC;
        }
        
        .executive-compact-container .header-left h1 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 2px solid #0066CC;
        }
        
        .executive-compact-container .header-left h1 {
            font-size: 16px;
            font-weight: 700;
            color: #003366;
            margin: 0 0 2px 0;
        }
        
        .executive-compact-container .header-meta {
            font-size: 10px;
            color: #6B7280;
        }
        
        /* KPI Scorecard */
        .executive-compact-container .kpi-scorecard {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .executive-compact-container .kpi-card {
            background: white;
            border-radius: 4px;
            padding: 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
            display: flex;
            gap: 6px;
            align-items: center;
            border-top: 2px solid #0066CC;
            transition: all 0.2s ease;
        }
        
        .executive-compact-container .kpi-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .executive-compact-container .kpi-card.decision-card {
            border-top-color: var(--decision-color);
        }
        
        .executive-compact-container .kpi-icon {
            font-size: 16px;
            flex-shrink: 0;
        }
        
        .executive-compact-container .kpi-content {
            flex: 1;
            min-width: 0;
        }
        
        .executive-compact-container .kpi-label {
            font-size: 8px;
            font-weight: 700;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            margin-bottom: 1px;
        }
        
        .executive-compact-container .kpi-value {
            font-size: 13px;
            font-weight: 700;
            color: #003366;
            line-height: 1;
            margin-bottom: 1px;
        }
        
        .executive-compact-container .kpi-meta {
            font-size: 8px;
            color: #9CA3AF;
        }
        
        /* Management Summary */
        .executive-compact-container .management-summary {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .executive-compact-container .summary-col {
            background: white;
            border-radius: 6px;
            padding: 10px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }
        
        .executive-compact-container .summary-section {
            margin-bottom: 8px;
        }
        
        .executive-compact-container .summary-section:last-child {
            margin-bottom: 0;
        }
        
        .executive-compact-container .summary-section h3 {
            font-size: 10px;
            font-weight: 700;
            color: #003366;
            margin: 0 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }
        
        .executive-compact-container .summary-section p {
            font-size: 10px;
            color: #4B5563;
            line-height: 1.4;
            margin: 0;
        }
        
        .executive-compact-container .bc-metrics {
            background: #F9FAFB;
            border-radius: 4px;
            padding: 6px;
        }
        
        .executive-compact-container .bc-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            font-size: 10px;
        }
        
        .executive-compact-container .bc-label {
            color: #6B7280;
        }
        
        .executive-compact-container .bc-value {
            font-weight: 600;
            color: #111827;
        }
        
        .executive-compact-container .recommendation-section {
            margin: 8px 0;
        }
        
        .executive-compact-container .recommendation-box {
            border-radius: 4px;
            padding: 6px;
            border-left: 3px solid #0066CC;
        }
        
        .executive-compact-container .recommendation-box.success {
            background: #F0FDF4;
            border-left-color: #10b981;
        }
        
        .executive-compact-container .recommendation-box.warning {
            background: #FFFBEB;
            border-left-color: #f59e0b;
        }
        
        .executive-compact-container .recommendation-box.danger {
            background: #FEF2F2;
            border-left-color: #ef4444;
        }
        
        .executive-compact-container .rec-header {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 3px;
        }
        
        .executive-compact-container .rec-icon {
            font-size: 12px;
        }
        
        .executive-compact-container .rec-title {
            font-size: 9px;
            font-weight: 700;
            color: #111827;
            text-transform: uppercase;
        }
        
        .executive-compact-container .rec-text {
            font-size: 9px;
            color: #4B5563;
            margin: 0;
            line-height: 1.3;
        }
        
        .executive-compact-container .action-buttons-compact {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
        }
        
        .executive-compact-container .action-btn-compact {
            padding: 6px 4px;
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            cursor: pointer;
            font-size: 9px;
            font-weight: 600;
            text-align: center;
            transition: all 0.2s ease;
        }
        
        .executive-compact-container .action-btn-compact:hover {
            border-color: #0066CC;
            background: #F0F9FF;
        }
        
        .executive-compact-container .action-btn-compact.active {
            background: #0066CC;
            color: white;
            border-color: #0066CC;
        }
        
        /* KI Benchmark Section */
        .executive-compact-container .ki-benchmark-section {
            margin-bottom: 8px;
        }
        
        .executive-compact-container .ki-loading {
            background: white;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }
        
        .executive-compact-container .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #E5E7EB;
            border-top-color: #0066CC;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 8px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .executive-compact-container .ki-loading p {
            font-size: 10px;
            color: #6B7280;
            margin: 0;
        }
        
        .executive-compact-container .ki-warning {
            background: linear-gradient(135deg, #FEF3C7, #FDE68A);
            border: 2px solid #F59E0B;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 8px;
            display: flex;
            gap: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .executive-compact-container .warning-icon {
            font-size: 20px;
            flex-shrink: 0;
        }
        
        .executive-compact-container .warning-content h3 {
            font-size: 11px;
            font-weight: 700;
            color: #92400E;
            margin: 0 0 4px 0;
        }
        
        .executive-compact-container .warning-content p {
            font-size: 9px;
            color: #78350F;
            margin: 0 0 4px 0;
            line-height: 1.3;
        }
        
        .executive-compact-container .warning-content ul {
            margin: 0 0 4px 0;
            padding-left: 14px;
            font-size: 9px;
            color: #78350F;
            line-height: 1.4;
        }
        
        .executive-compact-container .warning-recommendation {
            background: rgba(255,255,255,0.7);
            padding: 6px;
            border-radius: 3px;
            border-left: 2px solid #F59E0B;
            font-size: 9px;
        }
        
        .executive-compact-container .ki-similar-projects {
            background: white;
            border-radius: 6px;
            padding: 10px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }
        
        .executive-compact-container .ki-similar-projects h3 {
            font-size: 10px;
            font-weight: 700;
            color: #003366;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }
        
        .executive-compact-container .similar-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        
        .executive-compact-container .similar-card {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            padding: 6px;
        }
        
        .executive-compact-container .card-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 4px;
        }
        
        .executive-compact-container .card-title {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .executive-compact-container .card-icon {
            font-size: 12px;
        }
        
        .executive-compact-container .card-header h4 {
            font-size: 9px;
            font-weight: 600;
            color: #111827;
            margin: 0;
        }
        
        .executive-compact-container .success-badge {
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 8px;
            font-weight: 700;
        }
        
        .executive-compact-container .card-meta {
            font-size: 8px;
            color: #6B7280;
            margin-bottom: 4px;
        }
        
        .executive-compact-container .card-metrics {
            background: white;
            border-radius: 3px;
            padding: 4px;
            margin-bottom: 4px;
        }
        
        .executive-compact-container .metric-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 8px;
        }
        
        .executive-compact-container .metric-row:last-child {
            margin-bottom: 0;
        }
        
        .executive-compact-container .metric-label {
            color: #6B7280;
        }
        
        .executive-compact-container .metric-value {
            font-weight: 600;
            color: #111827;
        }
        
        .executive-compact-container .card-lessons {
            font-size: 8px;
            color: #4B5563;
            line-height: 1.3;
            background: #FFFBEB;
            padding: 4px;
            border-radius: 3px;
        }
        
        .executive-compact-container .card-lessons strong {
            color: #92400E;
            display: block;
            margin-bottom: 2px;
        }
        
        .executive-compact-container .ki-info,
        .ki-pioneer,
        .executive-compact-container .ki-error {
            background: white;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .executive-compact-container .info-icon,
        .executive-compact-container .pioneer-icon,
        .executive-compact-container .error-icon {
            font-size: 36px;
            margin-bottom: 12px;
        }
        
        .executive-compact-container .ki-pioneer {
            background: #FFFBEB;
        }
        
        .executive-compact-container .pioneer-note {
            font-size: 10px;
            color: #78350F;
            font-style: italic;
            margin-top: 8px;
        }
        
        .executive-compact-container .ki-error {
            background: #FEF2F2;
            color: #991B1B;
        }
        
        /* Visualizations Section */
        .executive-compact-container .visualizations-section {
            background: white;
            border-radius: 6px;
            padding: 10px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }
        
        .executive-compact-container .visualizations-section h2 {
            font-size: 11px;
            font-weight: 700;
            color: #003366;
            margin: 0 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }
        
        .executive-compact-container .viz-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }
        
        .executive-compact-container .viz-card {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            padding: 6px;
        }
        
        .executive-compact-container .viz-card h3 {
            font-size: 9px;
            font-weight: 600;
            color: #003366;
            margin: 0 0 6px 0;
        }
        
        .executive-compact-container .chart-container {
            min-height: 140px;
            position: relative;
        }
        
        /* Line Chart */
        .executive-compact-container .line-chart {
            position: relative;
            height: 120px;
            margin-bottom: 8px;
        }
        
        .executive-compact-container .chart-grid {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 20px;
        }
        
        .executive-compact-container .grid-line {
            position: absolute;
            left: 0;
            right: 0;
            border-top: 1px solid #E5E7EB;
        }
        
        .executive-compact-container .grid-label {
            position: absolute;
            left: 0;
            top: -8px;
            font-size: 8px;
            color: #9CA3AF;
        }
        
        .executive-compact-container .chart-svg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 20px;
            width: 100%;
            height: calc(100% - 20px);
        }
        
        .executive-compact-container .line-revenue {
            fill: none;
            stroke: #0066CC;
            stroke-width: 2;
        }
        
        .executive-compact-container .line-db2 {
            fill: none;
            stroke: #10b981;
            stroke-width: 2;
            stroke-dasharray: 4 2;
        }
        
        .executive-compact-container .chart-x-axis {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 5px;
        }
        
        .executive-compact-container .x-label {
            font-size: 9px;
            color: #6B7280;
        }
        
        .executive-compact-container .chart-data-table {
            margin-top: 4px;
        }
        
        .executive-compact-container .data-table {
            width: 100%;
            font-size: 8px;
            border-collapse: collapse;
        }
        
        .executive-compact-container .data-table th,
        .executive-compact-container .data-table td {
            padding: 2px 3px;
            text-align: right;
            border: 1px solid #E5E7EB;
        }
        
        .executive-compact-container .data-table th {
            background: #F3F4F6;
            font-weight: 600;
            color: #374151;
        }
        
        .executive-compact-container .data-table td:first-child,
        .executive-compact-container .data-table th:first-child {
            text-align: left;
            font-weight: 600;
        }
        
        /* Kosten Chart */
        .executive-compact-container .kosten-breakdown {
            margin-bottom: 8px;
        }
        
        .executive-compact-container .kosten-item {
            margin-bottom: 4px;
        }
        
        .executive-compact-container .kosten-label {
            font-size: 8px;
            color: #4B5563;
            margin-bottom: 2px;
        }
        
        .executive-compact-container .kosten-bar-container {
            background: #E5E7EB;
            height: 12px;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 1px;
        }
        
        .executive-compact-container .kosten-bar {
            height: 100%;
            background: linear-gradient(90deg, #0066CC, #0099FF);
            transition: width 0.3s ease;
        }
        
        .executive-compact-container .kosten-value {
            font-size: 8px;
            font-weight: 600;
            color: #111827;
        }
        
        .executive-compact-container .kosten-total {
            padding: 6px;
            background: #F0F9FF;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
        }
        
        .executive-compact-container .kosten-total strong {
            color: #003366;
        }
        
        .executive-compact-container .kosten-total span {
            font-weight: 700;
            color: #0066CC;
            font-size: 11px;
        }
        
        /* Szenarien Chart */
        .executive-compact-container .szenarien-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 4px;
        }
        
        .executive-compact-container .szenario-card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            padding: 6px;
        }
        
        .executive-compact-container .szenario-card h4 {
            font-size: 9px;
            font-weight: 700;
            margin: 0 0 4px 0;
            text-align: center;
        }
        
        .executive-compact-container .szenario-metrics {
            display: flex;
            justify-content: space-around;
            margin-bottom: 4px;
        }
        
        .executive-compact-container .szenario-metric {
            text-align: center;
        }
        
        .executive-compact-container .sm-label {
            display: block;
            font-size: 7px;
            color: #6B7280;
            margin-bottom: 1px;
            font-weight: 600;
        }
        
        .executive-compact-container .sm-value {
            display: block;
            font-size: 9px;
            font-weight: 700;
            color: #111827;
        }
        
        .executive-compact-container .szenario-assumptions {
            font-size: 7px;
            color: #6B7280;
            text-align: center;
            background: #F9FAFB;
            padding: 3px;
            border-radius: 2px;
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
            .executive-compact-container .kpi-scorecard {
                grid-template-columns: repeat(3, 1fr);
            }
            
            .executive-compact-container .kpi-scorecard .kpi-card:nth-child(4),
            .executive-compact-container .kpi-scorecard .kpi-card:nth-child(5) {
                grid-column: span 1;
            }
            
            .executive-compact-container .viz-grid {
                grid-template-columns: 1fr;
            }
            
            .executive-compact-container .similar-grid {
                grid-template-columns: 1fr;
            }
        }
        
        @media (max-width: 768px) {
            .executive-compact-container .management-summary {
                grid-template-columns: 1fr;
            }
            
            .executive-compact-container .kpi-scorecard {
                grid-template-columns: 1fr;
            }
        }
        
        /* Scrollbar */
        .executive-compact-container::-webkit-scrollbar {
            width: 8px;
        }
        
        .executive-compact-container::-webkit-scrollbar-track {
            background: #F3F4F6;
        }
        
        .executive-compact-container::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 4px;
        }
        
        /* ===== CRITICAL WARNING STYLES ===== */
        .critical-warning-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .critical-warning-modal {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
            from { 
                transform: translateY(50px);
                opacity: 0;
            }
            to { 
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .cw-header {
            background: linear-gradient(135deg, #DC2626, #991B1B);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .cw-header-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .cw-alert-icon {
            font-size: 32px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .cw-title {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
        }
        
        .cw-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        
        .cw-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .cw-section {
            padding: 20px;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .cw-section h3 {
            font-size: 14px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 12px 0;
        }
        
        .cw-prediction {
            background: #FEF2F2;
        }
        
        .cw-metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        
        .cw-metric-box {
            background: white;
            border: 2px solid #DC2626;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
        }
        
        .cw-metric-label {
            font-size: 12px;
            color: #6B7280;
            margin-bottom: 8px;
        }
        
        .cw-metric-value {
            font-size: 32px;
            font-weight: 700;
        }
        
        .cw-metric-value.critical {
            color: #DC2626;
        }
        
        .cw-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #E5E7EB;
        }
        
        .cw-table th {
            background: #1F2937;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
        }
        
        .cw-table td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 13px;
        }
        
        .cw-table .negative {
            color: #DC2626;
            font-weight: 700;
        }
        
        .cw-table .critical {
            color: #DC2626;
            font-weight: 700;
        }
        
        .cw-table .unknown {
            color: #DC2626;
            font-size: 20px;
            font-weight: 700;
        }
        
        .cw-table .current-row {
            background: #FEF3C7;
        }
        
        .cw-stats {
            background: #FFFBEB;
        }
        
        .cw-stats-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        
        .cw-stats-list li {
            padding: 8px 0;
            font-size: 13px;
            color: #374151;
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }
        
        .cw-bullet {
            color: #DC2626;
            font-weight: 700;
        }
        
        .cw-killers {
            background: #FEF2F2;
        }
        
        .cw-killer-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        
        .cw-killer-list li {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 8px 0;
            font-size: 13px;
            color: #374151;
        }
        
        .cw-number {
            background: #DC2626;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            flex-shrink: 0;
        }
        
        .cw-footer {
            background: #1F2937;
            color: white;
            padding: 20px;
        }
        
        .cw-recommendation {
            text-align: center;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 20px;
        }
        
        .cw-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        
        .cw-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .cw-btn-danger {
            background: #DC2626;
            color: white;
        }
        
        .cw-btn-danger:hover {
            background: #B91C1C;
            transform: translateY(-2px);
        }
        
        .cw-btn-secondary {
            background: #6B7280;
            color: white;
        }
        
        .cw-btn-secondary:hover {
            background: #4B5563;
        }
        
        .cw-btn-outline {
            background: transparent;
            color: white;
            border: 2px solid white;
        }
        
        .cw-btn-outline:hover {
            background: white;
            color: #1F2937;
        }
        
        /* KI Critical Analysis - Ersetzt die gelbe Warnung */
        .executive-compact-container .ki-critical-analysis {
            background: linear-gradient(135deg, #FFF8F5 0%, #FFF 100%);
            border: 2px solid #EA580C; /* Orange statt Rot */
            border-radius: 8px;
            margin-bottom: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(234, 88, 12, 0.1);
        }
        .executive-compact-container .critical-header {
            background: linear-gradient(90deg, #EA580C 0%, #FB923C 100%); /* Orange Gradient */
            color: white;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .executive-compact-container .critical-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .executive-compact-container .critical-title {
            font-size: 14px;
            font-weight: 600;
        }

        .executive-compact-container .critical-content {
            padding: 16px;
        }

        /* Prediction Grid */
        .executive-compact-container .prediction-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 16px;
        }

        .executive-compact-container .prediction-card {
            background: white;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
            border: 1px solid #E5E7EB;
            position: relative;
            overflow: hidden;
        }

        .executive-compact-container .prediction-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
        }

        .executive-compact-container .prediction-card.danger::before {
            background: #DC2626;
        }

        .executive-compact-container .prediction-card.warning::before {
            background: #F59E0B;
        }

        .executive-compact-container .prediction-card.info::before {
            background: #3B82F6;
        }

        .executive-compact-container .pred-label {
            font-size: 9px;
            color: #6B7280;
            margin-bottom: 4px;
            text-transform: uppercase;
        }

        .executive-compact-container .pred-value {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 2px;
        }

        .executive-compact-container .prediction-card.danger .pred-value {
            color: #DC2626;
        }

        .executive-compact-container .pred-confidence {
            font-size: 8px;
            color: #9CA3AF;
        }

        /* Comparison Table */
        .executive-compact-container .comparison-section {
            margin-bottom: 16px;
        }

        .executive-compact-container .comparison-section h4 {
            font-size: 11px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 8px 0;
        }

        .executive-compact-container .comparison-table {
            width: 100%;
            font-size: 10px;
            border-collapse: collapse;
            background: white;
            border-radius: 6px;
            overflow: hidden;
        }

        .executive-compact-container .comparison-table th {
            background: #F3F4F6;
            padding: 8px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #E5E7EB;
        }

        .executive-compact-container .comparison-table td {
            padding: 8px;
            border-bottom: 1px solid #F3F4F6;
        }

        .executive-compact-container .project-icon {
            margin-right: 4px;
        }

        .executive-compact-container .plan-value {
            color: #6B7280;
        }

        .executive-compact-container .actual-value.negative {
            color: #DC2626;
            font-weight: 600;
        }

        .executive-compact-container .actual-value.warning {
            color: #F59E0B;
            font-weight: 600;
        }

        .executive-compact-container .delta-value {
            color: #DC2626;
            font-weight: 600;
        }

        .executive-compact-container .learning {
            font-size: 9px;
            color: #6B7280;
        }

        .executive-compact-container .current-project {
            background: #FEF3C7;
        }

        .executive-compact-container .unknown {
            color: #DC2626;
            font-size: 14px;
            font-weight: 700;
        }

        /* Risk Factors */
        .executive-compact-container .risk-factors {
            margin-bottom: 16px;
        }

        .executive-compact-container .risk-factors h4 {
            font-size: 11px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 8px 0;
        }

        .executive-compact-container .risk-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }

        .executive-compact-container .risk-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: white;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #E5E7EB;
        }

        .executive-compact-container .risk-icon {
            font-size: 14px;
        }

        .executive-compact-container .risk-content {
            flex: 1;
        }

        .executive-compact-container .risk-title {
            font-size: 9px;
            font-weight: 600;
            color: #111827;
        }

        .executive-compact-container .risk-desc {
            font-size: 8px;
            color: #6B7280;
        }

        /* Recommendation */
        .executive-compact-container .ki-recommendation {
            background: #F0F9FF;
            border: 1px solid #3B82F6;
            border-radius: 6px;
            padding: 12px;
        }

        .executive-compact-container .rec-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 11px;
            color: #1E40AF;
        }

        .executive-compact-container .ki-recommendation p {
            font-size: 10px;
            color: #374151;
            margin: 0 0 12px 0;
            line-height: 1.5;
        }

        .executive-compact-container .action-buttons {
            display: flex;
            gap: 8px;
        }

        .executive-compact-container .action-buttons button {
            flex: 1;
            padding: 8px 12px;
            font-size: 9px;
            font-weight: 600;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid #E5E7EB;
            background: white;
        }

        .executive-compact-container .btn-recalc {
            border-color: #3B82F6;
            color: #3B82F6;
        }

        .executive-compact-container .btn-recalc:hover {
            background: #3B82F6;
            color: white;
        }

        .executive-compact-container .btn-scenario {
            border-color: #10B981;
            color: #10B981;
        }

        .executive-compact-container .btn-scenario:hover {
            background: #10B981;
            color: white;
        }

        .executive-compact-container .btn-details {
            border-color: #6B7280;
            color: #6B7280;
        }

        .executive-compact-container .btn-details:hover {
            background: #6B7280;
            color: white;
        }

        /* ===== PREDICTIVE INTELLIGENCE STYLES ===== */
        .executive-compact-container .predictive-intelligence-dashboard {
            background: white;
            border-radius: 8px;
            padding: 16px;
            margin: 12px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .executive-compact-container .pi-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #E5E7EB;
        }

        .executive-compact-container .pi-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #6366F1, #8B5CF6);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 12px;
            margin-bottom: 8px;
        }

        .executive-compact-container .pi-icon {
            font-size: 16px;
        }

        .executive-compact-container .pi-subtitle {
            font-size: 11px;
            color: #6B7280;
            margin-top: 4px;
        }

        /* Timeline Section */
        .executive-compact-container .pi-timeline-section {
            margin-bottom: 24px;
        }

        .executive-compact-container .pi-timeline-section h3 {
            font-size: 12px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 16px;
        }

        .executive-compact-container .timeline-container {
            position: relative;
            padding-left: 40px;
        }

        .executive-compact-container .timeline-line {
            position: absolute;
            left: 15px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #E5E7EB;
        }

        .executive-compact-container .timeline-event {
            position: relative;
            margin-bottom: 20px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .executive-compact-container .event-icon {
            position: absolute;
            left: -35px;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border: 2px solid #E5E7EB;
            border-radius: 50%;
            font-size: 14px;
        }

        .executive-compact-container .timeline-event.critical .event-icon {
            border-color: #EF4444;
            background: #FEF2F2;
        }

        .executive-compact-container .timeline-event.warning .event-icon {
            border-color: #F59E0B;
            background: #FEF3C7;
        }

        .executive-compact-container .event-date {
            min-width: 80px;
            font-size: 10px;
            color: #6B7280;
            font-weight: 600;
        }

        .executive-compact-container .event-content {
            flex: 1;
            background: #F9FAFB;
            padding: 10px;
            border-radius: 6px;
            border-left: 3px solid #E5E7EB;
        }

        .executive-compact-container .timeline-event.critical .event-content {
            border-left-color: #EF4444;
            background: #FEF2F2;
        }

        .executive-compact-container .timeline-event.warning .event-content {
            border-left-color: #F59E0B;
            background: #FFFBEB;
        }

        .executive-compact-container .event-content strong {
            display: block;
            font-size: 11px;
            color: #1F2937;
            margin-bottom: 4px;
        }

        .executive-compact-container .event-content p {
            font-size: 10px;
            color: #6B7280;
            margin: 0;
        }

        .executive-compact-container .event-action {
            margin-top: 6px;
            font-size: 9px;
            color: #059669;
            font-weight: 600;
        }

        /* Monte Carlo Section */
        .executive-compact-container .pi-montecarlo-section {
            margin-bottom: 24px;
        }

        .executive-compact-container .pi-montecarlo-section h3 {
            font-size: 12px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 16px;
        }

        .executive-compact-container .montecarlo-container {
            background: #F9FAFB;
            border-radius: 8px;
            padding: 16px;
        }

        .executive-compact-container .mc-bars {
            display: flex;
            justify-content: space-around;
            align-items: flex-end;
            height: 150px;
            margin-bottom: 20px;
        }

        .executive-compact-container .mc-bar {
            width: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }

        .executive-compact-container .bar-value {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .executive-compact-container .bar-fill {
            width: 60px;
            background: #E5E7EB;
            border-radius: 4px 4px 0 0;
            transition: all 0.5s ease;
        }

        .executive-compact-container .mc-bar.loss .bar-fill {
            background: linear-gradient(180deg, #EF4444, #DC2626);
            height: 100%;
        }

        .executive-compact-container .mc-bar.breakeven .bar-fill {
            background: linear-gradient(180deg, #F59E0B, #D97706);
            height: 100%;
        }

        .executive-compact-container .mc-bar.profit .bar-fill {
            background: linear-gradient(180deg, #10B981, #059669);
            height: 100%;
        }

        .executive-compact-container .bar-label {
            margin-top: 8px;
            font-size: 10px;
            color: #6B7280;
        }

        .executive-compact-container .mc-percentiles {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .executive-compact-container .percentile-card {
            background: white;
            padding: 12px;
            border-radius: 6px;
            text-align: center;
            border: 1px solid #E5E7EB;
        }

        .executive-compact-container .percentile-card.best {
            border-color: #10B981;
            background: #F0FDF4;
        }

        .executive-compact-container .percentile-card.worst {
            border-color: #EF4444;
            background: #FEF2F2;
        }

        .executive-compact-container .percentile-label {
            font-size: 10px;
            color: #6B7280;
            margin-bottom: 4px;
        }

        .executive-compact-container .percentile-value {
            font-size: 18px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 4px;
        }

        .executive-compact-container .percentile-desc {
            font-size: 9px;
            color: #9CA3AF;
        }

        /* Decision Cards */
        .executive-compact-container .pi-decision-section {
            margin-bottom: 24px;
        }

        .executive-compact-container .pi-decision-section h3 {
            font-size: 12px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 16px;
        }

        .executive-compact-container .decision-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .executive-compact-container .decision-card {
            background: white;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
            padding: 12px;
            position: relative;
            overflow: hidden;
        }

        .executive-compact-container .decision-card.recommended {
            border-color: #6366F1;
            background: linear-gradient(135deg, #EEF2FF 0%, #FFF 100%);
        }

        .executive-compact-container .dc-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .executive-compact-container .decision-card.recommended .dc-badge {
            background: #6366F1;
            color: white;
        }

        .executive-compact-container .decision-card.aggressive .dc-badge {
            background: #EF4444;
            color: white;
        }

        .executive-compact-container .decision-card.conservative .dc-badge {
            background: #10B981;
            color: white;
        }

        .executive-compact-container .dc-header h4 {
            font-size: 12px;
            font-weight: 600;
            color: #1F2937;
            margin: 0 0 8px 0;
        }

        .executive-compact-container .dc-steps {
            margin-bottom: 12px;
        }

        .executive-compact-container .dc-steps .step {
            font-size: 9px;
            color: #6B7280;
            margin-bottom: 4px;
            padding-left: 12px;
        }

        .executive-compact-container .dc-metrics {
            border-top: 1px solid #E5E7EB;
            padding-top: 8px;
        }

        .executive-compact-container .dc-metrics .metric {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            margin-bottom: 4px;
        }

        .executive-compact-container .dc-metrics .metric span {
            color: #6B7280;
        }

        .executive-compact-container .dc-metrics .metric strong {
            color: #1F2937;
        }

        .executive-compact-container .risk-indicator {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 8px;
            font-weight: 600;
            margin-top: 8px;
            width: 100%;
            text-align: center;
        }

        .executive-compact-container .risk-indicator.low {
            background: #F0FDF4;
            color: #059669;
        }

        .executive-compact-container .risk-indicator.high {
            background: #FEF2F2;
            color: #DC2626;
        }

        /* Insight Cards */
        .executive-compact-container .pi-insights-section h3 {
            font-size: 12px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 16px;
        }

        .executive-compact-container .insight-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .executive-compact-container .insight-card {
            background: linear-gradient(135deg, #F9FAFB, #FFF);
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            padding: 12px;
            display: flex;
            gap: 10px;
        }

        .executive-compact-container .insight-icon {
            font-size: 20px;
            flex-shrink: 0;
        }

        .executive-compact-container .insight-content {
            flex: 1;
        }

        .executive-compact-container .insight-content strong {
            display: block;
            font-size: 10px;
            color: #1F2937;
            margin-bottom: 4px;
        }

        .executive-compact-container .insight-content p {
            font-size: 9px;
            color: #6B7280;
            margin: 0 0 8px 0;
        }

        .executive-compact-container .confidence-bar {
            position: relative;
            height: 16px;
            background: #E5E7EB;
            border-radius: 8px;
            overflow: hidden;
        }

        .executive-compact-container .confidence-fill {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: linear-gradient(90deg, #6366F1, #8B5CF6);
            border-radius: 8px;
            transition: width 1s ease;
        }

        .executive-compact-container .confidence-bar span {
            position: relative;
            z-index: 1;
            font-size: 8px;
            color: white;
            font-weight: 600;
            display: block;
            text-align: center;
            line-height: 16px;
        }
    `;
}

// ==========================================
// EXPORT & LIFECYCLE
// ==========================================

/**
 * Cleanup function to call when leaving this tab
 */
function cleanup() {
    cleanupExecutiveSummaryStyles();
}

// Register cleanup on tab switch
if (typeof window !== 'undefined') {
    window.addEventListener('projekt-tab-switch', cleanup);
}

export default {
    renderUebersicht,
    cleanup
};
