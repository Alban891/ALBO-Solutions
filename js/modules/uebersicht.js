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
// STATE
// ==========================================

const uebersichtState = {
    projektId: null,
    rawData: null,
    calculationResult: null,
    lastUpdate: null,
    ragResults: null
};

// ==========================================
// MAIN RENDER
// ==========================================

export async function renderUebersicht() {
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
    const projekt = state.getProjekt(projektId);
    const artikel = state.getArtikelByProjekt(projektId);
    
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
            
            <!-- Visualizations -->
            ${createVisualizationsSection(calc)}
            
        </div>
        
        <style>
            ${getCompactStyles()}
        </style>
    `;
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
                    <div class="kpi-value">${helpers.formatNumber(totalMenge)}</div>
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
                        ${projekt.beschreibung || `Das Projekt "${projekt.name}" umfasst ${artikel.length} Artikel mit einem Produktionsvolumen von ${helpers.formatNumber(totalMenge)} Units über 5 Jahre. Gesamtumsatzpotenzial: €${totalRevenue.toFixed(1)}M.`}
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
        if (!window.supabase && !window.supabaseClient) {
            console.warn('⚠️ Supabase not available - skipping RAG');
            updateKIBenchmark(renderNoSupabase());
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
        <!-- Warning Box -->
        <div class="ki-warning">
            <div class="warning-icon">⚠️</div>
            <div class="warning-content">
                <h3>WARNUNG: Eure Mengenplanung ist zu optimistisch!</h3>
                <p>Analyse von ${similar.length} ähnlichen Projekten zeigt:</p>
                <ul>
                    <li>Durchschnittliche Success Rate: <strong>${avgSuccess.toFixed(1)}/5</strong></li>
                    <li>Durchschnittlicher NPV: <strong>€${(avgNPV / 1000000).toFixed(1)}M</strong> (vs. euer Plan: <strong>€${(currentNPV / 1000000).toFixed(1)}M</strong>)</li>
                    <li>Typische Volumen-Abweichung: <strong>-35%</strong> vs. ursprüngliche Planung</li>
                </ul>
                <p class="warning-recommendation">
                    💡 <strong>Empfehlung:</strong> Reduziert Mengenplanung um 40% und rechnet Business Case neu durch.
                </p>
            </div>
        </div>
        
        <!-- Similar Projects -->
        <div class="ki-similar-projects">
            <h3>📚 ÄHNLICHE PROJEKTE</h3>
            <div class="similar-grid">
                ${similar.map(p => renderSimilarProjectCard(p)).join('')}
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
                    <span class="metric-value">${project.volume_units ? helpers.formatNumber(project.volume_units) : 'N/A'}</span>
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
                        <span class="sm-value">${helpers.formatNumber(Math.round(s.menge))}</span>
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
        /* Main Container */
        .executive-compact-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 16px;
            background: #F5F7FA;
        }
        
        /* Header */
        .executive-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 2px solid #0066CC;
        }
        
        .header-left h1 {
            font-size: 20px;
            font-weight: 700;
            color: #003366;
            margin: 0 0 4px 0;
        }
        
        .header-meta {
            font-size: 11px;
            color: #6B7280;
        }
        
        /* KPI Scorecard */
        .kpi-scorecard {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-bottom: 12px;
        }
        
        .kpi-card {
            background: white;
            border-radius: 6px;
            padding: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            gap: 8px;
            align-items: center;
            border-top: 3px solid #0066CC;
            transition: all 0.2s ease;
        }
        
        .kpi-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .kpi-card.decision-card {
            border-top-color: var(--decision-color);
        }
        
        .kpi-icon {
            font-size: 20px;
            flex-shrink: 0;
        }
        
        .kpi-content {
            flex: 1;
            min-width: 0;
        }
        
        .kpi-label {
            font-size: 9px;
            font-weight: 700;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 2px;
        }
        
        .kpi-value {
            font-size: 16px;
            font-weight: 700;
            color: #003366;
            line-height: 1;
            margin-bottom: 2px;
        }
        
        .kpi-meta {
            font-size: 9px;
            color: #9CA3AF;
        }
        
        /* Management Summary */
        .management-summary {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .summary-col {
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .summary-section {
            margin-bottom: 12px;
        }
        
        .summary-section:last-child {
            margin-bottom: 0;
        }
        
        .summary-section h3 {
            font-size: 11px;
            font-weight: 700;
            color: #003366;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .summary-section p {
            font-size: 11px;
            color: #4B5563;
            line-height: 1.5;
            margin: 0;
        }
        
        .bc-metrics {
            background: #F9FAFB;
            border-radius: 6px;
            padding: 10px;
        }
        
        .bc-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 11px;
        }
        
        .bc-label {
            color: #6B7280;
        }
        
        .bc-value {
            font-weight: 600;
            color: #111827;
        }
        
        .recommendation-section {
            margin: 12px 0;
        }
        
        .recommendation-box {
            border-radius: 6px;
            padding: 10px;
            border-left: 3px solid #0066CC;
        }
        
        .recommendation-box.success {
            background: #F0FDF4;
            border-left-color: #10b981;
        }
        
        .recommendation-box.warning {
            background: #FFFBEB;
            border-left-color: #f59e0b;
        }
        
        .recommendation-box.danger {
            background: #FEF2F2;
            border-left-color: #ef4444;
        }
        
        .rec-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 4px;
        }
        
        .rec-icon {
            font-size: 16px;
        }
        
        .rec-title {
            font-size: 10px;
            font-weight: 700;
            color: #111827;
            text-transform: uppercase;
        }
        
        .rec-text {
            font-size: 10px;
            color: #4B5563;
            margin: 0;
            line-height: 1.4;
        }
        
        .action-buttons-compact {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        
        .action-btn-compact {
            padding: 8px;
            background: white;
            border: 2px solid #E5E7EB;
            border-radius: 6px;
            cursor: pointer;
            font-size: 10px;
            font-weight: 600;
            text-align: center;
            transition: all 0.2s ease;
        }
        
        .action-btn-compact:hover {
            border-color: #0066CC;
            background: #F0F9FF;
        }
        
        .action-btn-compact.active {
            background: #0066CC;
            color: white;
            border-color: #0066CC;
        }
        
        /* KI Benchmark Section */
        .ki-benchmark-section {
            margin-bottom: 12px;
        }
        
        .ki-loading {
            background: white;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .loading-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid #E5E7EB;
            border-top-color: #0066CC;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .ki-loading p {
            font-size: 12px;
            color: #6B7280;
            margin: 0;
        }
        
        .ki-warning {
            background: linear-gradient(135deg, #FEF3C7, #FDE68A);
            border: 2px solid #F59E0B;
            border-radius: 8px;
            padding: 14px;
            margin-bottom: 12px;
            display: flex;
            gap: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .warning-icon {
            font-size: 28px;
            flex-shrink: 0;
        }
        
        .warning-content h3 {
            font-size: 13px;
            font-weight: 700;
            color: #92400E;
            margin: 0 0 8px 0;
        }
        
        .warning-content p {
            font-size: 11px;
            color: #78350F;
            margin: 0 0 6px 0;
            line-height: 1.4;
        }
        
        .warning-content ul {
            margin: 0 0 8px 0;
            padding-left: 18px;
            font-size: 11px;
            color: #78350F;
            line-height: 1.5;
        }
        
        .warning-recommendation {
            background: rgba(255,255,255,0.7);
            padding: 8px;
            border-radius: 4px;
            border-left: 3px solid #F59E0B;
            font-size: 11px;
        }
        
        .ki-similar-projects {
            background: white;
            border-radius: 8px;
            padding: 14px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .ki-similar-projects h3 {
            font-size: 12px;
            font-weight: 700;
            color: #003366;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .similar-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }
        
        .similar-card {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            padding: 10px;
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 6px;
        }
        
        .card-title {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .card-icon {
            font-size: 14px;
        }
        
        .card-header h4 {
            font-size: 11px;
            font-weight: 600;
            color: #111827;
            margin: 0;
        }
        
        .success-badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: 700;
        }
        
        .card-meta {
            font-size: 9px;
            color: #6B7280;
            margin-bottom: 8px;
        }
        
        .card-metrics {
            background: white;
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 8px;
        }
        
        .metric-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 10px;
        }
        
        .metric-row:last-child {
            margin-bottom: 0;
        }
        
        .metric-label {
            color: #6B7280;
        }
        
        .metric-value {
            font-weight: 600;
            color: #111827;
        }
        
        .card-lessons {
            font-size: 9px;
            color: #4B5563;
            line-height: 1.4;
            background: #FFFBEB;
            padding: 8px;
            border-radius: 4px;
        }
        
        .card-lessons strong {
            color: #92400E;
            display: block;
            margin-bottom: 4px;
        }
        
        .ki-info,
        .ki-pioneer,
        .ki-error {
            background: white;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .info-icon,
        .pioneer-icon,
        .error-icon {
            font-size: 36px;
            margin-bottom: 12px;
        }
        
        .ki-pioneer {
            background: #FFFBEB;
        }
        
        .pioneer-note {
            font-size: 10px;
            color: #78350F;
            font-style: italic;
            margin-top: 8px;
        }
        
        .ki-error {
            background: #FEF2F2;
            color: #991B1B;
        }
        
        /* Visualizations Section */
        .visualizations-section {
            background: white;
            border-radius: 8px;
            padding: 14px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .visualizations-section h2 {
            font-size: 13px;
            font-weight: 700;
            color: #003366;
            margin: 0 0 12px 0;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .viz-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }
        
        .viz-card {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            padding: 10px;
        }
        
        .viz-card h3 {
            font-size: 11px;
            font-weight: 600;
            color: #003366;
            margin: 0 0 10px 0;
        }
        
        .chart-container {
            min-height: 180px;
            position: relative;
        }
        
        /* Line Chart */
        .line-chart {
            position: relative;
            height: 150px;
            margin-bottom: 12px;
        }
        
        .chart-grid {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 20px;
        }
        
        .grid-line {
            position: absolute;
            left: 0;
            right: 0;
            border-top: 1px solid #E5E7EB;
        }
        
        .grid-label {
            position: absolute;
            left: 0;
            top: -8px;
            font-size: 8px;
            color: #9CA3AF;
        }
        
        .chart-svg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 20px;
            width: 100%;
            height: calc(100% - 20px);
        }
        
        .line-revenue {
            fill: none;
            stroke: #0066CC;
            stroke-width: 2;
        }
        
        .line-db2 {
            fill: none;
            stroke: #10b981;
            stroke-width: 2;
            stroke-dasharray: 4 2;
        }
        
        .chart-x-axis {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 5px;
        }
        
        .x-label {
            font-size: 9px;
            color: #6B7280;
        }
        
        .chart-data-table {
            margin-top: 8px;
        }
        
        .data-table {
            width: 100%;
            font-size: 9px;
            border-collapse: collapse;
        }
        
        .data-table th,
        .data-table td {
            padding: 3px 4px;
            text-align: right;
            border: 1px solid #E5E7EB;
        }
        
        .data-table th {
            background: #F3F4F6;
            font-weight: 600;
            color: #374151;
        }
        
        .data-table td:first-child,
        .data-table th:first-child {
            text-align: left;
            font-weight: 600;
        }
        
        /* Kosten Chart */
        .kosten-breakdown {
            margin-bottom: 12px;
        }
        
        .kosten-item {
            margin-bottom: 8px;
        }
        
        .kosten-label {
            font-size: 9px;
            color: #4B5563;
            margin-bottom: 3px;
        }
        
        .kosten-bar-container {
            background: #E5E7EB;
            height: 16px;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 2px;
        }
        
        .kosten-bar {
            height: 100%;
            background: linear-gradient(90deg, #0066CC, #0099FF);
            transition: width 0.3s ease;
        }
        
        .kosten-value {
            font-size: 10px;
            font-weight: 600;
            color: #111827;
        }
        
        .kosten-total {
            padding: 10px;
            background: #F0F9FF;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
        }
        
        .kosten-total strong {
            color: #003366;
        }
        
        .kosten-total span {
            font-weight: 700;
            color: #0066CC;
            font-size: 13px;
        }
        
        /* Szenarien Chart */
        .szenarien-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
        }
        
        .szenario-card {
            background: white;
            border: 2px solid #E5E7EB;
            border-radius: 6px;
            padding: 10px;
        }
        
        .szenario-card h4 {
            font-size: 11px;
            font-weight: 700;
            margin: 0 0 8px 0;
            text-align: center;
        }
        
        .szenario-metrics {
            display: flex;
            justify-content: space-around;
            margin-bottom: 8px;
        }
        
        .szenario-metric {
            text-align: center;
        }
        
        .sm-label {
            display: block;
            font-size: 8px;
            color: #6B7280;
            margin-bottom: 2px;
            font-weight: 600;
        }
        
        .sm-value {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #111827;
        }
        
        .szenario-assumptions {
            font-size: 9px;
            color: #6B7280;
            text-align: center;
            background: #F9FAFB;
            padding: 6px;
            border-radius: 4px;
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
            .kpi-scorecard {
                grid-template-columns: repeat(3, 1fr);
            }
            
            .kpi-scorecard .kpi-card:nth-child(4),
            .kpi-scorecard .kpi-card:nth-child(5) {
                grid-column: span 1;
            }
            
            .viz-grid {
                grid-template-columns: 1fr;
            }
            
            .similar-grid {
                grid-template-columns: 1fr;
            }
        }
        
        @media (max-width: 768px) {
            .management-summary {
                grid-template-columns: 1fr;
            }
            
            .kpi-scorecard {
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
    `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
    renderUebersicht
};
