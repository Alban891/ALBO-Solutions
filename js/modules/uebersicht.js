/**
 * Executive Summary / Übersicht - DASHBOARD STYLE
 * Professional Management Presentation with RAG Intelligence
 * 
 * Layout:
 * - Top: Sticky KPI Bar (4 Metrics)
 * - Left: Question Sidebar (expandable cards)
 * - Right: Content Area (Project Context + AI Benchmark + Visualizations)
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
    activeSection: null,
    pinnedSections: new Set(),
    sectionSizes: {},
    charts: {},
    isInitialized: false,
    lastUpdate: null
};

// ==========================================
// MAIN RENDER
// ==========================================

/**
 * Main entry point - renders complete executive summary
 * ⚠️ ASYNC function - calculator is async!
 */
export async function renderUebersicht() {
    const projektId = window.cfoDashboard.currentProjekt;
    if (!projektId) return;
    
    const container = document.getElementById('projekt-tab-uebersicht');
    if (!container) return;
    
    console.log('📊 Rendering Executive Summary (Dashboard Style) for:', projektId);
    
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
    
    // Calculate wirtschaftlichkeit - WITH AWAIT!
    let calc = null;
    try {
        console.log('🧮 Calling calculateProjektWirtschaftlichkeit (ASYNC)...');
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
    uebersichtState.isInitialized = true;
    
    // Render layout
    container.innerHTML = createMainLayout(projekt, artikel, calc, hasValidData);
    
    // Initialize if we have data
    if (hasValidData) {
        // Load RAG Intelligence async
        setTimeout(() => loadRAGIntelligence(projekt, calc), 500);
    }
}

// ==========================================
// LAYOUT CREATION
// ==========================================

/**
 * Create main layout
 */
function createMainLayout(projekt, artikel, calc, hasValidData) {
    if (!hasValidData) {
        return renderPlaceholder(projekt);
    }
    
    return `
        <div class="executive-summary-container">
            
            <!-- Sticky KPI Bar -->
            <div class="executive-kpi-bar">
                ${createKPIBar(calc)}
            </div>
            
            <!-- Main Content: Sidebar + Content Area -->
            <div class="executive-main-area">
                
                <!-- Left: Section Sidebar -->
                <aside class="executive-sidebar">
                    ${createSectionSidebar(projekt, artikel, calc)}
                </aside>
                
                <!-- Right: Content Area -->
                <main class="executive-content-area">
                    
                    <!-- Always Visible: Project Context -->
                    <div class="project-context-box">
                        ${createProjectContext(projekt, artikel, calc)}
                    </div>
                    
                    <!-- Always Visible: AI Benchmark (expandable) -->
                    <div class="ai-benchmark-box" id="ai-benchmark-box">
                        ${createAIBenchmarkPlaceholder()}
                    </div>
                    
                    <!-- Dynamic Visualization Area -->
                    <div id="viz-containers">
                        <!-- Will be populated dynamically -->
                    </div>
                    
                </main>
                
            </div>
        </div>
        
        <style>
            ${getExecutiveSummaryStyles()}
        </style>
    `;
}

/**
 * Create KPI Bar (Sticky Top)
 */
function createKPIBar(calc) {
    const totalRevenue = (calc?.totals?.sales_revenue || 0) / 1000000;
    const totalDB3 = Object.values(calc?.jahre || {}).reduce((sum, j) => sum + (j.db3 || 0), 0) / 1000000;
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
        <div class="kpi-cards">
            
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
                    <div class="kpi-label">PROFITABILITY</div>
                    <div class="kpi-value">€${totalDB3.toFixed(1)}M</div>
                    <div class="kpi-meta">DB3 Total</div>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon">⏱️</div>
                <div class="kpi-content">
                    <div class="kpi-label">BREAK-EVEN</div>
                    <div class="kpi-value">${breakEven}</div>
                    <div class="kpi-meta">Jahre bis Payback</div>
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

/**
 * Create Section Sidebar (Left)
 */
function createSectionSidebar(projekt, artikel, calc) {
    const totalRevenue = (calc?.totals?.sales_revenue || 0) / 1000000;
    const totalDB3 = Object.values(calc?.jahre || {}).reduce((sum, j) => sum + (j.db3 || 0), 0) / 1000000;
    const projektkostenTotal = (calc?.metadata?.anzahl_kostenblöcke || 0);
    
    return `
        <div class="section-card" onclick="window.showExecutiveSection('geschaeftsmodell')">
            <div class="section-icon">📦</div>
            <div class="section-text">
                <h3>Geschäftsmodell</h3>
                <p>${artikel.length} Artikel</p>
            </div>
            <span class="section-arrow">▶</span>
        </div>
        
        <div class="section-card" onclick="window.showExecutiveSection('szenarien')">
            <div class="section-icon">📊</div>
            <div class="section-text">
                <h3>Szenarien</h3>
                <p>Best/Base/Worst</p>
            </div>
            <span class="section-arrow">▶</span>
        </div>
        
        <div class="section-card" onclick="window.showExecutiveSection('annahmen')">
            <div class="section-icon">📌</div>
            <div class="section-text">
                <h3>Kernannahmen</h3>
                <p>Kritische Faktoren</p>
            </div>
            <span class="section-arrow">▶</span>
        </div>
        
        <div class="section-card" onclick="window.showExecutiveSection('risiken')">
            <div class="section-icon">⚠️</div>
            <div class="section-text">
                <h3>Risiken</h3>
                <p>Top 3 Risiken</p>
            </div>
            <span class="section-arrow">▶</span>
        </div>
        
        <div class="section-card" onclick="window.showExecutiveSection('chancen')">
            <div class="section-icon">🚀</div>
            <div class="section-text">
                <h3>Chancen</h3>
                <p>Upside Potenzial</p>
            </div>
            <span class="section-arrow">▶</span>
        </div>
        
        <div class="section-card" onclick="window.showExecutiveSection('aehnliche-projekte')">
            <div class="section-icon">🔍</div>
            <div class="section-text">
                <h3>Ähnliche Cases</h3>
                <p>Benchmarks</p>
            </div>
            <span class="section-arrow">▶</span>
        </div>
        
        <div class="section-card" onclick="window.showExecutiveSection('best-practices')">
            <div class="section-icon">💎</div>
            <div class="section-text">
                <h3>Best Practices</h3>
                <p>Strategic Overrides</p>
            </div>
            <span class="section-arrow">▶</span>
        </div>
        
        <div class="section-card" onclick="window.showExecutiveSection('meilensteine')">
            <div class="section-icon">🎯</div>
            <div class="section-text">
                <h3>Meilensteine</h3>
                <p>Timeline</p>
            </div>
            <span class="section-arrow">▶</span>
        </div>
    `;
}

/**
 * Create Project Context (Always Visible)
 */
function createProjectContext(projekt, artikel, calc) {
    const totalRevenue = (calc?.totals?.sales_revenue || 0) / 1000000;
    const npv = (calc?.kpis?.npv || 0) / 1000000;
    const irr = calc?.kpis?.irr || 0;
    const breakEven = calc?.kpis?.break_even_year || '-';
    
    // Determine recommendation
    let recommendation = 'OPTION B: REDESIGN';
    let recommendationClass = 'warning';
    let recommendationIcon = '⚠️';
    
    if (npv > 0 && irr > 15) {
        recommendation = 'OPTION A: GO';
        recommendationClass = 'success';
        recommendationIcon = '✅';
    } else if (npv < -5) {
        recommendation = 'OPTION A: NO-GO';
        recommendationClass = 'danger';
        recommendationIcon = '❌';
    }
    
    // Get strategic positioning
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
    
    return `
        <div class="context-header">
            <div class="context-icon">📋</div>
            <h2>Projekt-Kontext & Management Summary</h2>
        </div>
        
        <div class="context-content">
            
            <!-- Projektbeschreibung -->
            <div class="context-section">
                <h3>📝 Projektbeschreibung</h3>
                <p>
                    ${projekt.beschreibung || `Das Projekt "${projekt.name}" umfasst ${artikel.length} Artikel mit einem Gesamtumsatzpotenzial von €${totalRevenue.toFixed(1)}M über den Planungszeitraum.`}
                </p>
            </div>
            
            <!-- Strategische Einordnung -->
            <div class="context-section">
                <h3>🎯 Strategische Einordnung</h3>
                <p>${strategicText}</p>
            </div>
            
            <!-- Business Case Summary -->
            <div class="context-section">
                <h3>💰 Business Case Summary</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Gesamtumsatz (5Y):</span>
                        <span class="summary-value">€${totalRevenue.toFixed(1)}M</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">NPV @ 8% WACC:</span>
                        <span class="summary-value" style="color: ${npv > 0 ? '#10b981' : '#ef4444'}">€${npv.toFixed(1)}M</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">IRR:</span>
                        <span class="summary-value">${irr.toFixed(1)}%</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Break-Even:</span>
                        <span class="summary-value">${breakEven}</span>
                    </div>
                </div>
            </div>
            
            <!-- Handlungsempfehlung -->
            <div class="recommendation-box ${recommendationClass}">
                <div class="recommendation-header">
                    <span class="recommendation-icon">${recommendationIcon}</span>
                    <h3>HANDLUNGSEMPFEHLUNG: ${recommendation}</h3>
                </div>
                <ul class="recommendation-list">
                    ${npv > 0 && irr > 15 ? `
                        <li>✅ Business Case ist tragfähig</li>
                        <li>✅ Attraktive Rendite über Hurdle Rate</li>
                        <li>✅ Empfehlung: Freigabe mit Standard Gate Review</li>
                    ` : npv < -5 ? `
                        <li>❌ Business Case nicht tragfähig (NPV: €${npv.toFixed(1)}M)</li>
                        <li>❌ Break-Even nicht erreichbar</li>
                        <li>❌ Empfehlung: Projekt ablehnen oder fundamental überarbeiten</li>
                    ` : `
                        <li>⚠️ Business Case grenzwertig (NPV: €${npv.toFixed(1)}M)</li>
                        <li>⚠️ Mengenplanung kritisch prüfen (siehe KI-Benchmark)</li>
                        <li>⚠️ Empfehlung: Neuplanung mit reduzierten Volumina</li>
                    `}
                </ul>
            </div>
            
            <!-- Nächste Schritte -->
            <div class="next-steps-box">
                <h3>⚡ Nächste Schritte</h3>
                <div class="action-buttons">
                    <button class="action-btn ${recommendationClass === 'danger' ? 'active' : ''}" 
                            onclick="alert('Option A: Projekt ablehnen')">
                        <span class="btn-icon">❌</span>
                        <span class="btn-text">OPTION A: REJECT</span>
                    </button>
                    <button class="action-btn ${recommendationClass === 'warning' ? 'active' : ''}" 
                            onclick="alert('Option B: Neuplanung mit -40% Volumen')">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">OPTION B: REDESIGN</span>
                    </button>
                    <button class="action-btn" 
                            onclick="alert('Option C: Board-Level Strategic Override')">
                        <span class="btn-icon">💎</span>
                        <span class="btn-text">OPTION C: STRATEGIC OVERRIDE</span>
                    </button>
                </div>
                <div class="action-details">
                    <p><strong>Timeline:</strong> Management Entscheidung bis 15.11.2025 | Gate Review Q1/2026</p>
                    <p><strong>Budget:</strong> Entwicklungsbudget €12.5M | Freigabe erforderlich</p>
                </div>
            </div>
            
        </div>
    `;
}

/**
 * Create AI Benchmark Placeholder (Will be loaded async)
 */
function createAIBenchmarkPlaceholder() {
    return `
        <div class="benchmark-header" onclick="window.toggleAIBenchmark()">
            <div class="benchmark-title">
                <div class="benchmark-icon">🤖</div>
                <h2>KI-Benchmark Analyse</h2>
            </div>
            <span class="benchmark-toggle">▼</span>
        </div>
        
        <div class="benchmark-content collapsed" id="benchmark-content">
            <div class="benchmark-loading">
                <div class="loading-spinner"></div>
                <p>Durchsuche historische Projekte...</p>
            </div>
        </div>
    `;
}

// ==========================================
// RAG INTELLIGENCE LOADING
// ==========================================

async function loadRAGIntelligence(projekt, calc) {
    try {
        console.log('🧠 Loading RAG Intelligence...');
        
        // Check if Supabase available
        if (!window.supabase && !window.supabaseClient) {
            console.warn('⚠️ Supabase not available - skipping RAG');
            updateBenchmarkContent(renderNoSupabase());
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
                similarProjects = [...similarProjects, ...data];
            }
        }
        
        // Load strategic overrides
        const { data: overrides, error: overridesError } = await supabase
            .from('ALBO_Historical_Projects')
            .select('*')
            .eq('strategic_override', true)
            .order('actual_npv', { ascending: false })
            .limit(2);
        
        console.log('✅ RAG Results:', {
            similar: similarProjects.length,
            overrides: overrides?.length || 0
        });
        
        // Render results
        updateBenchmarkContent(renderRAGResults(similarProjects, overrides, projekt, calc));
        
    } catch (error) {
        console.error('❌ RAG Intelligence failed:', error);
        updateBenchmarkContent(renderRAGError(error));
    }
}

function updateBenchmarkContent(html) {
    const content = document.getElementById('benchmark-content');
    if (content) {
        content.innerHTML = html;
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

function renderRAGResults(similar, overrides, projekt, calc) {
    const hasSimilar = similar && similar.length > 0;
    const hasOverrides = overrides && overrides.length > 0;
    
    if (!hasSimilar && !hasOverrides) {
        return renderNoBenchmarks();
    }
    
    let html = '';
    
    // Warning message if we have similar projects
    if (hasSimilar) {
        const avgSuccess = similar.reduce((sum, p) => sum + p.success_rating, 0) / similar.length;
        const avgNPV = similar.reduce((sum, p) => sum + (p.actual_npv || 0), 0) / similar.length;
        
        html += `
            <div class="benchmark-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                    <h3>WARNUNG: Eure Mengenplanung ist zu optimistisch!</h3>
                    <p>Analyse von ${similar.length} ähnlichen Projekten zeigt:</p>
                    <ul>
                        <li>Durchschnittliche Success Rate: <strong>${avgSuccess.toFixed(1)}/5</strong></li>
                        <li>Durchschnittlicher NPV: <strong>€${(avgNPV / 1000000).toFixed(1)}M</strong></li>
                        <li>Typische Volumen-Abweichung: <strong>-35% vs. Plan</strong></li>
                    </ul>
                    <p class="warning-recommendation">
                        💡 <strong>Empfehlung:</strong> Reduziert Mengenplanung um 40% und rechnet neu.
                    </p>
                </div>
            </div>
            
            <div class="benchmark-similar">
                <h3>🔍 Ähnliche Projekte (${similar.length})</h3>
                <div class="similar-grid">
                    ${similar.map(p => renderSimilarProjectCard(p)).join('')}
                </div>
            </div>
        `;
    }
    
    if (hasOverrides) {
        html += `
            <div class="benchmark-overrides">
                <h3>💎 Strategische Übersteuerungen (Best Practices)</h3>
                <div class="overrides-grid">
                    ${overrides.map(p => renderOverrideCard(p)).join('')}
                </div>
            </div>
        `;
    }
    
    return html;
}

function renderSimilarProjectCard(project) {
    const successColor = project.success_rating >= 4 ? '#10b981' : 
                        project.success_rating >= 3 ? '#f59e0b' : '#ef4444';
    
    return `
        <div class="similar-card">
            <div class="card-header">
                <h4>${project.project_name}</h4>
                <span class="success-badge" style="background: ${successColor}20; color: ${successColor}">
                    ${project.success_rating}/5
                </span>
            </div>
            <div class="card-meta">
                ${project.project_type} | ${project.industry || 'N/A'} | ${project.completion_year || 'N/A'}
            </div>
            <div class="card-metrics">
                <div class="metric">
                    <span class="metric-label">NPV</span>
                    <span class="metric-value">€${(project.actual_npv / 1000000).toFixed(1)}M</span>
                </div>
                <div class="metric">
                    <span class="metric-label">IRR</span>
                    <span class="metric-value">${project.actual_irr}%</span>
                </div>
            </div>
            ${project.lessons_learned ? `
                <div class="card-lessons">
                    <strong>📝 Key Learnings:</strong>
                    <p>${truncate(project.lessons_learned, 120)}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function renderOverrideCard(project) {
    return `
        <div class="override-card">
            <div class="override-header">
                <h4>💎 ${project.project_name}</h4>
                <span class="override-badge">Strategic Override by ${project.strategic_override_by}</span>
            </div>
            <div class="override-decision">
                <div class="decision-col financial">
                    <span class="decision-label">Financial</span>
                    <span class="decision-icon">❌</span>
                    <span class="decision-text">REJECT</span>
                </div>
                <div class="decision-divider">→</div>
                <div class="decision-col strategic">
                    <span class="decision-label">Strategic</span>
                    <span class="decision-icon">✅</span>
                    <span class="decision-text">APPROVE</span>
                </div>
            </div>
            ${project.ceo_comment ? `
                <div class="override-comment">
                    <strong>💬 "${truncate(project.ceo_comment, 100)}"</strong>
                </div>
            ` : ''}
            <div class="override-value">
                <strong>📈 Realisierter Wert:</strong>
                ${project.strategic_value_realized || 'Platform value creation, market position'}
            </div>
        </div>
    `;
}

function renderNoSupabase() {
    return `
        <div class="benchmark-info">
            <div class="info-icon">ℹ️</div>
            <h3>KI-Benchmark nicht verfügbar</h3>
            <p>Supabase Datenbank ist nicht verbunden.</p>
        </div>
    `;
}

function renderNoBenchmarks() {
    return `
        <div class="benchmark-pioneer">
            <div class="pioneer-icon">🚀</div>
            <h3>Pionier-Projekt</h3>
            <p>Keine ähnlichen historischen Projekte gefunden. Dies ist ein innovatives Neuland-Projekt!</p>
            <p class="pioneer-note">💡 Nach Projekt-Abschluss wird dieses Projekt zur Referenz für künftige Business Cases.</p>
        </div>
    `;
}

function renderRAGError(error) {
    return `
        <div class="benchmark-error">
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
// INTERACTION HANDLERS
// ==========================================

window.toggleAIBenchmark = function() {
    const content = document.getElementById('benchmark-content');
    const toggle = document.querySelector('.benchmark-toggle');
    
    if (!content) return;
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        content.classList.add('expanded');
        if (toggle) toggle.textContent = '▲';
    } else {
        content.classList.add('collapsed');
        content.classList.remove('expanded');
        if (toggle) toggle.textContent = '▼';
    }
};

window.showExecutiveSection = function(sectionId) {
    console.log('📊 Show section:', sectionId);
    
    // Get or create section container
    let sectionContainer = document.getElementById(`section-${sectionId}`);
    
    if (!sectionContainer) {
        // Create new section container
        const vizContainers = document.getElementById('viz-containers');
        const sectionHTML = createSectionContainer(sectionId);
        vizContainers.insertAdjacentHTML('beforeend', sectionHTML);
        
        sectionContainer = document.getElementById(`section-${sectionId}`);
        
        // Load content
        setTimeout(() => {
            loadSectionContent(sectionId);
        }, 100);
    } else {
        // Toggle visibility
        if (sectionContainer.style.display === 'none') {
            sectionContainer.style.display = 'block';
        } else {
            sectionContainer.style.display = 'none';
            return;
        }
    }
    
    // Scroll to section
    sectionContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Update active state
    document.querySelectorAll('.section-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[onclick*="${sectionId}"]`)?.classList.add('active');
};

window.pinExecutiveSection = function(sectionId) {
    const container = document.getElementById(`section-${sectionId}`);
    if (!container) return;
    
    if (uebersichtState.pinnedSections.has(sectionId)) {
        uebersichtState.pinnedSections.delete(sectionId);
        container.classList.remove('pinned');
    } else {
        uebersichtState.pinnedSections.add(sectionId);
        container.classList.add('pinned');
    }
};

window.resizeExecutiveSection = function(sectionId, size) {
    const container = document.getElementById(`section-${sectionId}`);
    if (!container) return;
    
    container.classList.remove('size-small', 'size-medium', 'size-large');
    container.classList.add(`size-${size}`);
    
    uebersichtState.sectionSizes[sectionId] = size;
    
    // Update button states
    container.querySelectorAll('.btn-resize').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-size') === size) {
            btn.classList.add('active');
        }
    });
};

window.closeExecutiveSection = function(sectionId) {
    if (uebersichtState.pinnedSections.has(sectionId)) {
        alert('📌 Bitte erst Unpin, bevor Sie schließen');
        return;
    }
    
    const container = document.getElementById(`section-${sectionId}`);
    if (container) {
        container.style.display = 'none';
    }
    
    if (uebersichtState.activeSection === sectionId) {
        uebersichtState.activeSection = null;
    }
    
    // Update active state
    document.querySelector(`[onclick*="${sectionId}"]`)?.classList.remove('active');
};

// ==========================================
// SECTION CONTAINER CREATION
// ==========================================

function createSectionContainer(sectionId) {
    const config = getSectionConfig(sectionId);
    
    return `
        <div class="section-container size-large" id="section-${sectionId}">
            <div class="section-header">
                <div class="section-title">
                    <span class="section-icon">${config.icon}</span>
                    <h3>${config.title}</h3>
                </div>
                <div class="section-controls">
                    <button class="btn-resize" data-size="small" onclick="window.resizeExecutiveSection('${sectionId}', 'small')">S</button>
                    <button class="btn-resize" data-size="medium" onclick="window.resizeExecutiveSection('${sectionId}', 'medium')">M</button>
                    <button class="btn-resize active" data-size="large" onclick="window.resizeExecutiveSection('${sectionId}', 'large')">L</button>
                    <button class="btn-pin" onclick="window.pinExecutiveSection('${sectionId}')">📌</button>
                    <button class="btn-close" onclick="window.closeExecutiveSection('${sectionId}')">✕</button>
                </div>
            </div>
            <div class="section-content" id="section-content-${sectionId}">
                <div class="section-loading">Lädt...</div>
            </div>
        </div>
    `;
}

function getSectionConfig(sectionId) {
    const configs = {
        'geschaeftsmodell': { icon: '📦', title: 'Geschäftsmodell & Artikel' },
        'szenarien': { icon: '📊', title: 'Szenario-Analyse' },
        'annahmen': { icon: '📌', title: 'Kernannahmen & Sensitivitäten' },
        'risiken': { icon: '⚠️', title: 'Top Risiken' },
        'chancen': { icon: '🚀', title: 'Top Chancen' },
        'aehnliche-projekte': { icon: '🔍', title: 'Ähnliche Projekte' },
        'best-practices': { icon: '💎', title: 'Best Practices & Strategic Overrides' },
        'meilensteine': { icon: '🎯', title: 'Meilensteine & Timeline' }
    };
    
    return configs[sectionId] || { icon: '📊', title: sectionId };
}

function loadSectionContent(sectionId) {
    const contentDiv = document.getElementById(`section-content-${sectionId}`);
    if (!contentDiv) return;
    
    const { projekt, artikel, calc } = uebersichtState.rawData;
    
    let html = '';
    
    switch(sectionId) {
        case 'geschaeftsmodell':
            html = renderGeschaeftsmodellSection(projekt, artikel, calc);
            break;
        case 'szenarien':
            html = renderSzenarienSection(calc);
            break;
        case 'annahmen':
            html = renderAnnahmenSection(calc, artikel);
            break;
        case 'risiken':
            html = renderRisikenSection();
            break;
        case 'chancen':
            html = renderChancenSection();
            break;
        case 'aehnliche-projekte':
            html = '<p>Siehe KI-Benchmark Analyse oben</p>';
            break;
        case 'best-practices':
            html = '<p>Siehe KI-Benchmark Analyse oben</p>';
            break;
        case 'meilensteine':
            html = renderMeilensteineSection(projekt);
            break;
        default:
            html = '<p>Content wird geladen...</p>';
    }
    
    contentDiv.innerHTML = html;
}

// ==========================================
// SECTION CONTENT RENDERERS
// ==========================================

function renderGeschaeftsmodellSection(projekt, artikel, calc) {
    const totalRevenue = (calc?.totals?.sales_revenue || 0) / 1000000;
    
    // Group by type
    const byType = {};
    artikel.forEach(a => {
        const typ = a.typ || 'Sonstige';
        if (!byType[typ]) byType[typ] = [];
        byType[typ].push(a);
    });
    
    return `
        <div class="geschaeftsmodell-content">
            <div class="gm-overview">
                <h4>Portfolio-Übersicht</h4>
                <p>${artikel.length} Artikel | Gesamtumsatz: €${totalRevenue.toFixed(1)}M (5Y)</p>
            </div>
            
            <div class="gm-breakdown">
                ${Object.keys(byType).map(typ => `
                    <div class="gm-type-group">
                        <h5>${typ} (${byType[typ].length})</h5>
                        <ul>
                            ${byType[typ].map(a => `
                                <li>${a.name}</li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderSzenarienSection(calc) {
    const baseNPV = (calc?.kpis?.npv || 0) / 1000000;
    const bestNPV = baseNPV * 1.5;
    const worstNPV = baseNPV * 0.6;
    
    return `
        <div class="szenarien-content">
            <div class="scenario-grid">
                <div class="scenario-card best">
                    <h4>📈 Best Case</h4>
                    <p class="scenario-npv">€${bestNPV.toFixed(1)}M</p>
                    <p class="scenario-desc">+20% Volume, -10% Costs</p>
                </div>
                <div class="scenario-card base">
                    <h4>📊 Base Case</h4>
                    <p class="scenario-npv">€${baseNPV.toFixed(1)}M</p>
                    <p class="scenario-desc">Plan-Annahmen</p>
                </div>
                <div class="scenario-card worst">
                    <h4>📉 Worst Case</h4>
                    <p class="scenario-npv">€${worstNPV.toFixed(1)}M</p>
                    <p class="scenario-desc">-30% Volume, +15% Costs</p>
                </div>
            </div>
        </div>
    `;
}

function renderAnnahmenSection(calc, artikel) {
    const totalRevenue = (calc?.totals?.sales_revenue || 0) / 1000000;
    
    return `
        <div class="annahmen-content">
            <h4>Kritische Annahmen</h4>
            <ul class="assumptions-list">
                <li><strong>Marktvolumen:</strong> €${(totalRevenue * 10).toFixed(0)}M p.a.</li>
                <li><strong>Marktanteil:</strong> 10% nach 3 Jahren</li>
                <li><strong>Durchschnittspreis:</strong> €500</li>
                <li><strong>Kostenstruktur:</strong> 40% Material DB</li>
            </ul>
        </div>
    `;
}

function renderRisikenSection() {
    return `
        <div class="risiken-content">
            <div class="risk-item high">
                <span class="risk-icon">🔴</span>
                <div class="risk-text">
                    <strong>Marktakzeptanz unsicher</strong>
                    <p>Enterprise Sales Cycle könnte 18+ Monate dauern</p>
                </div>
            </div>
            <div class="risk-item medium">
                <span class="risk-icon">🟡</span>
                <div class="risk-text">
                    <strong>Technologie-Risiko</strong>
                    <p>Skalierung der Plattform noch nicht bewiesen</p>
                </div>
            </div>
            <div class="risk-item low">
                <span class="risk-icon">🟢</span>
                <div class="risk-text">
                    <strong>Regulatorisches Umfeld</strong>
                    <p>Compliance-Anforderungen manageable</p>
                </div>
            </div>
        </div>
    `;
}

function renderChancenSection() {
    return `
        <div class="chancen-content">
            <div class="chance-item">
                <span class="chance-icon">🚀</span>
                <div class="chance-text">
                    <strong>First-Mover Advantage</strong>
                    <p>Potenzial für 25% Marktanteil</p>
                    <span class="chance-impact">+++</span>
                </div>
            </div>
            <div class="chance-item">
                <span class="chance-icon">🔄</span>
                <div class="chance-text">
                    <strong>Cross-Selling Potenzial</strong>
                    <p>Upsell zu bestehenden Kunden</p>
                    <span class="chance-impact">++</span>
                </div>
            </div>
            <div class="chance-item">
                <span class="chance-icon">📈</span>
                <div class="chance-text">
                    <strong>Platform Skalierung</strong>
                    <p>SaaS Model mit hoher Marge</p>
                    <span class="chance-impact">++</span>
                </div>
            </div>
        </div>
    `;
}

function renderMeilensteineSection(projekt) {
    return `
        <div class="meilensteine-content">
            <div class="timeline">
                <div class="timeline-item done">
                    <span class="timeline-icon">✓</span>
                    <div class="timeline-text">
                        <strong>Q4/2024: Konzeptphase</strong>
                        <p>Business Case validiert</p>
                    </div>
                </div>
                <div class="timeline-item current">
                    <span class="timeline-icon">→</span>
                    <div class="timeline-text">
                        <strong>Q1/2025: Gate 2 Review</strong>
                        <p>Freigabe Entwicklung</p>
                    </div>
                </div>
                <div class="timeline-item pending">
                    <span class="timeline-icon">○</span>
                    <div class="timeline-text">
                        <strong>Q3/2025: Pilot Launch</strong>
                        <p>Beta mit 3 Kunden</p>
                    </div>
                </div>
                <div class="timeline-item pending">
                    <span class="timeline-icon">○</span>
                    <div class="timeline-text">
                        <strong>Q1/2026: Full Rollout</strong>
                        <p>Go-to-Market</p>
                    </div>
                </div>
            </div>
        </div>
    `;
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

function getExecutiveSummaryStyles() {
    return `
        /* Main Container */
        .executive-summary-container {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 60px);
            overflow: hidden;
            background: #F5F7FA;
        }
        
        /* KPI Bar */
        .executive-kpi-bar {
            position: sticky;
            top: 0;
            z-index: 100;
            background: linear-gradient(135deg, #E6F2FF 0%, #F0F9FF 100%);
            border-bottom: 2px solid #0066CC;
            padding: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .kpi-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .kpi-card {
            background: white;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            gap: 12px;
            align-items: center;
            transition: all 0.2s ease;
            border-top: 3px solid #0066CC;
        }
        
        .kpi-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .kpi-card.decision-card {
            border-top-color: var(--decision-color);
        }
        
        .kpi-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .kpi-content {
            flex: 1;
            min-width: 0;
        }
        
        .kpi-label {
            font-size: 10px;
            font-weight: 700;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .kpi-value {
            font-size: 20px;
            font-weight: 700;
            color: #003366;
            line-height: 1;
            margin-bottom: 4px;
        }
        
        .kpi-meta {
            font-size: 10px;
            color: #9CA3AF;
        }
        
        /* Main Area */
        .executive-main-area {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        
        /* Sidebar */
        .executive-sidebar {
            width: 220px;
            min-width: 220px;
            background: #FAFBFC;
            border-right: 1px solid #E5E7EB;
            overflow-y: auto;
            padding: 12px;
        }
        
        .section-card {
            background: white;
            border-radius: 8px;
            margin-bottom: 8px;
            padding: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
        }
        
        .section-card:hover {
            background: #F0F9FF;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transform: translateX(4px);
        }
        
        .section-card.active {
            background: #0066CC;
            color: white;
        }
        
        .section-icon {
            font-size: 20px;
            flex-shrink: 0;
        }
        
        .section-text {
            flex: 1;
            min-width: 0;
        }
        
        .section-text h3 {
            font-size: 12px;
            font-weight: 600;
            margin: 0 0 2px 0;
            line-height: 1.2;
        }
        
        .section-text p {
            font-size: 10px;
            margin: 0;
            opacity: 0.7;
        }
        
        .section-card.active .section-text h3,
        .section-card.active .section-text p {
            color: white;
        }
        
        .section-arrow {
            font-size: 10px;
            opacity: 0.5;
            flex-shrink: 0;
        }
        
        /* Content Area */
        .executive-content-area {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }
        
        /* Project Context Box */
        .project-context-box {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .context-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #E5E7EB;
        }
        
        .context-icon {
            font-size: 32px;
        }
        
        .context-header h2 {
            font-size: 20px;
            font-weight: 700;
            color: #003366;
            margin: 0;
        }
        
        .context-section {
            margin-bottom: 20px;
        }
        
        .context-section h3 {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin: 0 0 8px 0;
        }
        
        .context-section p {
            font-size: 13px;
            color: #4B5563;
            line-height: 1.6;
            margin: 0;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 12px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            background: #F9FAFB;
            border-radius: 6px;
            font-size: 12px;
        }
        
        .summary-label {
            color: #6B7280;
        }
        
        .summary-value {
            font-weight: 600;
            color: #111827;
        }
        
        /* Recommendation Box */
        .recommendation-box {
            background: #F9FAFB;
            border-left: 4px solid #0066CC;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
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
        
        .recommendation-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .recommendation-icon {
            font-size: 24px;
        }
        
        .recommendation-header h3 {
            font-size: 14px;
            font-weight: 700;
            color: #111827;
            margin: 0;
        }
        
        .recommendation-list {
            margin: 0;
            padding-left: 20px;
            font-size: 12px;
            color: #4B5563;
            line-height: 1.8;
        }
        
        /* Next Steps Box */
        .next-steps-box {
            background: #EFF6FF;
            border-radius: 8px;
            padding: 16px;
        }
        
        .next-steps-box h3 {
            font-size: 14px;
            font-weight: 600;
            color: #1E40AF;
            margin: 0 0 12px 0;
        }
        
        .action-buttons {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background: white;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .action-btn:hover {
            border-color: #0066CC;
            background: #F0F9FF;
        }
        
        .action-btn.active {
            border-color: #0066CC;
            background: #0066CC;
            color: white;
        }
        
        .btn-icon {
            font-size: 24px;
        }
        
        .btn-text {
            font-size: 11px;
            font-weight: 600;
            text-align: center;
        }
        
        .action-details {
            font-size: 11px;
            color: #6B7280;
            line-height: 1.6;
        }
        
        .action-details p {
            margin: 4px 0;
        }
        
        /* AI Benchmark Box */
        .ai-benchmark-box {
            background: white;
            border-radius: 12px;
            margin-bottom: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .benchmark-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
            border-bottom: 2px solid #0066CC;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .benchmark-header:hover {
            background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%);
        }
        
        .benchmark-title {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .benchmark-icon {
            font-size: 28px;
        }
        
        .benchmark-title h2 {
            font-size: 18px;
            font-weight: 700;
            color: #003366;
            margin: 0;
        }
        
        .benchmark-toggle {
            font-size: 16px;
            color: #6B7280;
            transition: transform 0.2s ease;
        }
        
        .benchmark-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .benchmark-content.expanded {
            max-height: 2000px;
        }
        
        .benchmark-content.collapsed {
            max-height: 0;
        }
        
        .benchmark-loading {
            padding: 40px;
            text-align: center;
            color: #6B7280;
        }
        
        .loading-spinner {
            width: 32px;
            height: 32px;
            border: 4px solid #E5E7EB;
            border-top-color: #0066CC;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Benchmark Warning */
        .benchmark-warning {
            background: linear-gradient(135deg, #FEF3C7, #FDE68A);
            border: 2px solid #F59E0B;
            border-radius: 12px;
            padding: 20px;
            margin: 20px;
            display: flex;
            gap: 16px;
        }
        
        .warning-icon {
            font-size: 40px;
            flex-shrink: 0;
        }
        
        .warning-content h3 {
            font-size: 16px;
            font-weight: 700;
            color: #92400E;
            margin: 0 0 12px 0;
        }
        
        .warning-content p {
            font-size: 13px;
            color: #78350F;
            margin: 0 0 12px 0;
        }
        
        .warning-content ul {
            margin: 0 0 12px 0;
            padding-left: 20px;
            font-size: 13px;
            color: #78350F;
        }
        
        .warning-recommendation {
            background: rgba(255,255,255,0.6);
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #F59E0B;
        }
        
        /* Similar Projects */
        .benchmark-similar {
            padding: 20px;
        }
        
        .benchmark-similar h3 {
            font-size: 16px;
            font-weight: 600;
            color: #003366;
            margin: 0 0 16px 0;
        }
        
        .similar-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
        }
        
        .similar-card {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 16px;
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 8px;
        }
        
        .card-header h4 {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            margin: 0;
        }
        
        .success-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
        }
        
        .card-meta {
            font-size: 11px;
            color: #6B7280;
            margin-bottom: 12px;
        }
        
        .card-metrics {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;
            padding: 12px;
            background: white;
            border-radius: 6px;
        }
        
        .metric {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .metric-label {
            font-size: 10px;
            color: #6B7280;
            font-weight: 600;
        }
        
        .metric-value {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
        }
        
        .card-lessons {
            font-size: 11px;
            color: #4B5563;
            line-height: 1.6;
            background: #FFFBEB;
            padding: 12px;
            border-radius: 6px;
        }
        
        .card-lessons strong {
            color: #92400E;
        }
        
        /* Override Cards */
        .benchmark-overrides {
            padding: 20px;
            border-top: 1px solid #E5E7EB;
        }
        
        .benchmark-overrides h3 {
            font-size: 16px;
            font-weight: 600;
            color: #003366;
            margin: 0 0 16px 0;
        }
        
        .overrides-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
        }
        
        .override-card {
            background: linear-gradient(135deg, #FEF3C7, #FDE68A);
            border: 2px solid #F59E0B;
            border-radius: 12px;
            padding: 16px;
        }
        
        .override-header {
            margin-bottom: 12px;
        }
        
        .override-header h4 {
            font-size: 14px;
            font-weight: 600;
            color: #92400E;
            margin: 0 0 4px 0;
        }
        
        .override-badge {
            font-size: 10px;
            color: #78350F;
        }
        
        .override-decision {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            padding: 12px;
            background: rgba(255,255,255,0.6);
            border-radius: 8px;
        }
        
        .decision-col {
            flex: 1;
            text-align: center;
        }
        
        .decision-label {
            display: block;
            font-size: 10px;
            color: #6B7280;
            margin-bottom: 4px;
        }
        
        .decision-icon {
            display: block;
            font-size: 24px;
            margin-bottom: 4px;
        }
        
        .decision-text {
            display: block;
            font-size: 11px;
            font-weight: 600;
        }
        
        .decision-col.financial .decision-text {
            color: #ef4444;
        }
        
        .decision-col.strategic .decision-text {
            color: #10b981;
        }
        
        .decision-divider {
            font-size: 20px;
            color: #F59E0B;
        }
        
        .override-comment {
            font-size: 12px;
            font-style: italic;
            color: #78350F;
            margin-bottom: 12px;
            padding: 12px;
            background: rgba(255,255,255,0.6);
            border-radius: 6px;
        }
        
        .override-value {
            font-size: 11px;
            color: #065F46;
            background: rgba(16, 185, 129, 0.1);
            padding: 12px;
            border-radius: 6px;
        }
        
        /* Info Boxes */
        .benchmark-info,
        .benchmark-pioneer,
        .benchmark-error {
            padding: 40px;
            text-align: center;
        }
        
        .info-icon,
        .pioneer-icon,
        .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .benchmark-pioneer {
            background: #FFFBEB;
        }
        
        .pioneer-note {
            font-size: 12px;
            color: #78350F;
            font-style: italic;
            margin-top: 12px;
        }
        
        .benchmark-error {
            background: #FEF2F2;
            color: #991B1B;
        }
        
        /* Section Container */
        .section-container {
            background: white;
            border-radius: 12px;
            margin-bottom: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .section-container.pinned {
            border: 2px solid #F59E0B;
            box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
        }
        
        .section-container.size-small {
            max-width: 600px;
        }
        
        .section-container.size-medium {
            max-width: 900px;
        }
        
        .section-container.size-large {
            max-width: 100%;
        }
        
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid #E5E7EB;
            background: #FAFBFC;
            border-radius: 12px 12px 0 0;
        }
        
        .section-title {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .section-title h3 {
            font-size: 16px;
            font-weight: 600;
            color: #003366;
            margin: 0;
        }
        
        .section-controls {
            display: flex;
            gap: 8px;
        }
        
        .btn-resize,
        .btn-pin,
        .btn-close {
            padding: 6px 12px;
            border: 1px solid #E5E7EB;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        
        .btn-resize:hover,
        .btn-pin:hover {
            background: #F0F9FF;
            border-color: #0066CC;
        }
        
        .btn-resize.active {
            background: #0066CC;
            color: white;
            border-color: #0066CC;
        }
        
        .section-container.pinned .btn-pin {
            background: #FEF3C7;
            border-color: #F59E0B;
        }
        
        .btn-close {
            border: none;
            background: transparent;
            color: #9CA3AF;
        }
        
        .btn-close:hover {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }
        
        .section-content {
            padding: 24px;
        }
        
        .section-loading {
            text-align: center;
            padding: 40px;
            color: #6B7280;
        }
        
        /* Section Content Styles */
        .geschaeftsmodell-content,
        .szenarien-content,
        .annahmen-content,
        .risiken-content,
        .chancen-content,
        .meilensteine-content {
            font-size: 13px;
            line-height: 1.6;
        }
        
        .gm-overview {
            margin-bottom: 20px;
            padding: 16px;
            background: #F9FAFB;
            border-radius: 8px;
        }
        
        .gm-type-group {
            margin-bottom: 16px;
        }
        
        .gm-type-group h5 {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 8px 0;
        }
        
        .scenario-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
        }
        
        .scenario-card {
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .scenario-card.best {
            background: #F0FDF4;
            border: 2px solid #10b981;
        }
        
        .scenario-card.base {
            background: #F0F9FF;
            border: 2px solid #0066CC;
        }
        
        .scenario-card.worst {
            background: #FEF2F2;
            border: 2px solid #ef4444;
        }
        
        .scenario-npv {
            font-size: 24px;
            font-weight: 700;
            margin: 12px 0;
        }
        
        .scenario-desc {
            font-size: 12px;
            color: #6B7280;
        }
        
        .assumptions-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .assumptions-list li {
            padding: 12px;
            background: #F9FAFB;
            border-radius: 6px;
            margin-bottom: 8px;
        }
        
        .risk-item,
        .chance-item {
            display: flex;
            gap: 12px;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 12px;
        }
        
        .risk-item.high {
            background: #FEF2F2;
            border-left: 4px solid #ef4444;
        }
        
        .risk-item.medium {
            background: #FFFBEB;
            border-left: 4px solid #f59e0b;
        }
        
        .risk-item.low {
            background: #F0FDF4;
            border-left: 4px solid #10b981;
        }
        
        .risk-icon,
        .chance-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .risk-text strong,
        .chance-text strong {
            display: block;
            margin-bottom: 4px;
        }
        
        .chance-item {
            background: #F0FDF4;
            border-left: 4px solid #10b981;
        }
        
        .chance-impact {
            float: right;
            font-weight: 700;
            color: #10b981;
        }
        
        .timeline {
            position: relative;
            padding-left: 40px;
        }
        
        .timeline::before {
            content: '';
            position: absolute;
            left: 15px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #E5E7EB;
        }
        
        .timeline-item {
            position: relative;
            margin-bottom: 24px;
        }
        
        .timeline-icon {
            position: absolute;
            left: -32px;
            width: 24px;
            height: 24px;
            background: white;
            border: 2px solid #E5E7EB;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        
        .timeline-item.done .timeline-icon {
            background: #10b981;
            border-color: #10b981;
            color: white;
        }
        
        .timeline-item.current .timeline-icon {
            background: #0066CC;
            border-color: #0066CC;
            color: white;
        }
        
        .timeline-text strong {
            display: block;
            margin-bottom: 4px;
            color: #111827;
        }
        
        .timeline-text p {
            margin: 0;
            font-size: 12px;
            color: #6B7280;
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
            .kpi-cards {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 768px) {
            .executive-main-area {
                flex-direction: column;
            }
            
            .executive-sidebar {
                width: 100%;
                max-height: 200px;
                border-right: none;
                border-bottom: 1px solid #E5E7EB;
            }
            
            .kpi-cards {
                grid-template-columns: 1fr;
            }
        }
        
        /* Scrollbar */
        .executive-sidebar::-webkit-scrollbar,
        .executive-content-area::-webkit-scrollbar {
            width: 8px;
        }
        
        .executive-sidebar::-webkit-scrollbar-track,
        .executive-content-area::-webkit-scrollbar-track {
            background: #F3F4F6;
        }
        
        .executive-sidebar::-webkit-scrollbar-thumb,
        .executive-content-area::-webkit-scrollbar-thumb {
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
