/**
 * Executive Summary / Übersicht - WITH RAG INTELLIGENCE
 * Professional 1-pager for Management Presentation
 * Horváth & Partners Style + Finance Intelligence
 * 
 * 🆕 RAG Features:
 * - Searches historical projects in Supabase
 * - Shows similar cases with learnings
 * - Displays strategic overrides (CEO decisions)
 * - Generates AI-powered recommendations
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';
import { calculateProjektWirtschaftlichkeit } from './wirtschaftlichkeit/calculator.js';

/**
 * Render Executive Summary WITH RAG
 * @public
 * 
 * ⚠️ ASYNC function - calculator is async!
 */
export async function renderUebersicht() {
    const projektId = window.cfoDashboard.currentProjekt;
    if (!projektId) return;
    
    const container = document.getElementById('projekt-tab-uebersicht');
    if (!container) return;
    
    console.log('📊 Rendering Executive Summary with RAG Intelligence for:', projektId);
    
    // Get data
    const projekt = state.getProjekt(projektId);
    const artikel = state.getArtikelByProjekt(projektId);
    
    // Calculate wirtschaftlichkeit - WITH ERROR HANDLING AND AWAIT!
    let calc = null;
    try {
        console.log('🧮 Calling calculateProjektWirtschaftlichkeit (ASYNC)...');
        
        // ✅ KRITISCH: await hinzugefügt!
        calc = await calculateProjektWirtschaftlichkeit(projektId, { wacc: 0.08 });
        
        console.log('📊 Calc result:', calc);
        
        if (calc === undefined) {
            console.warn('⚠️ Calculator returned undefined - check calculator.js export and return statement');
            calc = null;
        }
        
        if (calc) {
            console.log('✅ Calc data:', {
                hasKpis: !!calc.kpis,
                hasJahre: !!calc.jahre,
                jahreCount: Object.keys(calc.jahre || {}).length
            });
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
    
    // If no wirtschaftlichkeit data, show placeholder
    if (!hasValidData) {
        console.warn('⚠️ Showing placeholder - missing wirtschaftlichkeit data');
        container.innerHTML = renderPlaceholder(projekt);
        return;
    }
    
    console.log('✅ Rendering full executive summary with RAG intelligence');
    
    // Determine recommendation
    const recommendation = getRecommendation(calc);
    const projectStatus = getProjectStatus(calc);
    
    // Render initial HTML (RAG section will be loaded async)
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
            
            <!-- 🆕 RAG INTELLIGENCE SECTION - LOADING STATE -->
            <div id="rag-intelligence-section" style="margin-bottom: 24px;">
                <div style="background: #f0f9ff; border: 2px solid #bae6fd; border-radius: 12px; padding: 24px; text-align: center;">
                    <div style="display: inline-block; width: 32px; height: 32px; border: 4px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <div style="margin-top: 16px; font-size: 16px; color: #0369a1; font-weight: 600;">
                        🔍 Durchsuche historische Projekte...
                    </div>
                    <div style="margin-top: 8px; font-size: 13px; color: #0369a1;">
                        Analysiere ähnliche Business Cases aus der Datenbank
                    </div>
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
        
        <!-- Spinner Animation -->
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    
    // Initialize mini charts
    setTimeout(() => initializeMiniCharts(calc), 100);
    
    // 🆕 LOAD RAG INTELLIGENCE ASYNC
    setTimeout(() => loadRAGIntelligence(projekt, calc), 500);
}

// ==========================================
// 🆕 RAG INTELLIGENCE LOADER
// ==========================================

async function loadRAGIntelligence(projekt, calc) {
    try {
        console.log('🧠 Loading RAG Intelligence...');
        
        // Check if Supabase available
        if (!window.supabase && !window.supabaseClient) {
            console.warn('⚠️ Supabase not available - skipping RAG');
            const ragSection = document.getElementById('rag-intelligence-section');
            if (ragSection) {
                ragSection.innerHTML = renderNoSupabase();
            }
            return;
        }
        
        const supabase = window.supabase || window.supabaseClient;
        
        // Build search text from projekt data
        const searchTerms = buildSearchTerms(projekt);
        console.log('🔍 Search terms:', searchTerms);
        
        // Search similar projects with multiple strategies
        let similarProjects = [];
        
        // Strategy 1: Search by project name keywords
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
        
        // Strategy 2: Search by division/industry
        if (searchTerms.division && similarProjects.length < 3) {
            const { data, error } = await supabase
                .from('ALBO_Historical_Projects')
                .select('*')
                .ilike('industry', `%${searchTerms.division}%`)
                .order('success_rating', { ascending: false })
                .limit(3);
            
            if (data && !error) {
                similarProjects = [...similarProjects, ...data];
            }
        }
        
        // Remove duplicates and limit to 3
        const uniqueProjects = Array.from(
            new Map(similarProjects.map(p => [p.id, p])).values()
        ).slice(0, 3);
        
        console.log('✅ Found similar projects:', uniqueProjects.length);
        
        // Load strategic overrides
        const { data: overrides, error: overridesError } = await supabase
            .from('ALBO_Historical_Projects')
            .select('*')
            .eq('strategic_override', true)
            .order('actual_npv', { ascending: false })
            .limit(2);
        
        if (overridesError) {
            console.error('❌ Strategic overrides error:', overridesError);
        }
        
        console.log('✅ Found strategic overrides:', overrides?.length || 0);
        
        // Render RAG Intelligence
        const ragSection = document.getElementById('rag-intelligence-section');
        if (ragSection) {
            ragSection.innerHTML = renderRAGIntelligence({
                similar: uniqueProjects || [],
                overrides: overrides || [],
                projekt: projekt,
                calc: calc
            });
        }
        
    } catch (error) {
        console.error('❌ RAG Intelligence failed:', error);
        const ragSection = document.getElementById('rag-intelligence-section');
        if (ragSection) {
            ragSection.innerHTML = renderRAGError(error);
        }
    }
}

/**
 * Build search terms from projekt data
 */
function buildSearchTerms(projekt) {
    const terms = {
        nameKeywords: [],
        division: null,
        description: []
    };
    
    // Extract keywords from projekt name (min 4 chars)
    if (projekt.name) {
        const nameWords = projekt.name
            .split(/[\s\-_]+/)
            .filter(w => w.length >= 4)
            .filter(w => !['Projekt', 'Project', 'GmbH', 'AG'].includes(w));
        terms.nameKeywords = nameWords.slice(0, 3);
    }
    
    // Add division
    if (projekt.division) {
        terms.division = projekt.division;
    }
    
    // Extract from beschreibung (first 100 chars)
    if (projekt.beschreibung) {
        const descWords = projekt.beschreibung
            .substring(0, 100)
            .split(/[\s,\.]+/)
            .filter(w => w.length >= 5);
        terms.description = descWords.slice(0, 2);
    }
    
    return terms;
}

// ==========================================
// 🆕 RAG INTELLIGENCE RENDERING
// ==========================================

function renderRAGIntelligence({ similar, overrides, projekt, calc }) {
    const hasSimilar = similar && similar.length > 0;
    const hasOverrides = overrides && overrides.length > 0;
    
    if (!hasSimilar && !hasOverrides) {
        return renderNoSimilarProjects();
    }
    
    return `
        <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 3px solid #3b82f6; border-radius: 16px; padding: 28px; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
            
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #3b82f6;">
                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #3b82f6, #1e40af); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                    🤖
                </div>
                <div style="flex: 1;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #1e40af;">
                        KI-Intelligence aus historischen Projekten
                    </h3>
                    <div style="font-size: 14px; color: #0369a1; margin-top: 4px; font-weight: 500;">
                        Finance Intelligence in Action – Lernende Systeme für bessere Entscheidungen
                    </div>
                </div>
            </div>
            
            ${hasSimilar ? `
                <!-- Similar Projects -->
                <div style="margin-bottom: 24px;">
                    <h4 style="font-size: 15px; font-weight: 700; color: #1e40af; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">🔍</span>
                        Ähnliche Projekte gefunden: ${similar.length}
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
                        ${similar.map(p => renderSimilarProjectCard(p)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${hasOverrides ? `
                <!-- Strategic Overrides -->
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 15px; font-weight: 700; color: #1e40af; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">💎</span>
                        Strategische Übersteuerungen (Best Practices)
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
                        ${overrides.map(p => renderStrategicOverrideCard(p)).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- AI Recommendation -->
            ${renderAIRecommendation(projekt, calc, similar)}
            
        </div>
    `;
}

function renderSimilarProjectCard(project) {
    const successIcon = getSuccessIcon(project.success_rating);
    const successColor = getSuccessColor(project.success_rating);
    
    return `
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 18px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 14px;">
                <div style="font-size: 36px; line-height: 1;">${successIcon}</div>
                <div style="flex: 1;">
                    <h5 style="margin: 0; font-size: 15px; font-weight: 700; color: #111827; line-height: 1.3;">
                        ${project.project_name}
                    </h5>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 3px;">
                        ${project.project_type} | ${project.industry || 'N/A'} | ${project.completion_year || 'N/A'}
                    </div>
                </div>
            </div>
            
            <!-- Metrics -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; padding: 14px; background: #f9fafb; border-radius: 8px;">
                <div style="text-align: center;">
                    <div style="font-size: 10px; color: #6b7280; margin-bottom: 3px; font-weight: 600;">NPV</div>
                    <div style="font-size: 14px; font-weight: 700; color: ${project.actual_npv >= 0 ? '#10b981' : '#ef4444'};">
                        €${formatNumberShort(project.actual_npv)}
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 10px; color: #6b7280; margin-bottom: 3px; font-weight: 600;">IRR</div>
                    <div style="font-size: 14px; font-weight: 700; color: ${project.actual_irr >= 15 ? '#10b981' : '#f59e0b'};">
                        ${project.actual_irr}%
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 10px; color: #6b7280; margin-bottom: 3px; font-weight: 600;">Success</div>
                    <div style="font-size: 14px; font-weight: 700; color: ${successColor};">
                        ${project.success_rating}/5
                    </div>
                </div>
            </div>
            
            ${project.lessons_learned ? `
                <!-- Lessons Learned -->
                <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <div style="font-size: 10px; font-weight: 700; color: #92400e; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                        📝 Key Learnings
                    </div>
                    <div style="font-size: 12px; color: #78350f; line-height: 1.6;">
                        ${truncate(project.lessons_learned, 140)}
                    </div>
                </div>
            ` : ''}
            
            ${project.failure_factors && project.failure_factors.length > 0 ? `
                <!-- Risks -->
                <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px;">
                    <div style="font-size: 10px; font-weight: 700; color: #991b1b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                        ⚠️ Kritische Risiken
                    </div>
                    <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #7f1d1d; line-height: 1.7;">
                        ${project.failure_factors.slice(0, 2).map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
        </div>
    `;
}

function renderStrategicOverrideCard(project) {
    return `
        <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 3px solid #f59e0b; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);">
            
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
                <div style="font-size: 28px;">💎</div>
                <div>
                    <h5 style="margin: 0; font-size: 15px; font-weight: 700; color: #92400e;">
                        ${project.project_name}
                    </h5>
                    <div style="font-size: 10px; color: #78350f; margin-top: 3px; font-weight: 600;">
                        Strategic Override by ${project.strategic_override_by || 'CEO'}
                    </div>
                </div>
            </div>
            
            <!-- Decision Split -->
            <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; margin-bottom: 14px;">
                <div style="background: rgba(239, 68, 68, 0.15); padding: 12px; border-radius: 8px; text-align: center; border: 2px solid rgba(239, 68, 68, 0.3);">
                    <div style="font-size: 10px; color: #991b1b; margin-bottom: 4px; font-weight: 700;">Financial</div>
                    <div style="font-size: 20px; font-weight: 600;">❌</div>
                    <div style="font-size: 10px; color: #991b1b; font-weight: 600; margin-top: 2px;">REJECT</div>
                </div>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <div style="width: 3px; height: 100%; background: #d97706; border-radius: 2px;"></div>
                </div>
                <div style="background: rgba(16, 185, 129, 0.15); padding: 12px; border-radius: 8px; text-align: center; border: 2px solid rgba(16, 185, 129, 0.3);">
                    <div style="font-size: 10px; color: #065f46; margin-bottom: 4px; font-weight: 700;">Strategic</div>
                    <div style="font-size: 20px; font-weight: 600;">✅</div>
                    <div style="font-size: 10px; color: #065f46; font-weight: 600; margin-top: 2px;">APPROVE</div>
                </div>
            </div>
            
            <!-- Leadership Comment -->
            ${project.ceo_comment || project.cto_comment || project.board_comment ? `
                <div style="background: rgba(255, 255, 255, 0.9); padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #f59e0b;">
                    <div style="font-size: 10px; font-weight: 700; color: #92400e; margin-bottom: 6px; text-transform: uppercase;">
                        💬 Leadership Comment
                    </div>
                    <div style="font-size: 12px; color: #78350f; font-style: italic; line-height: 1.6;">
                        "${truncate(project.ceo_comment || project.cto_comment || project.board_comment, 120)}"
                    </div>
                </div>
            ` : ''}
            
            <!-- Metrics -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <div style="background: rgba(255, 255, 255, 0.7); padding: 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 9px; color: #92400e; font-weight: 600;">NPV</div>
                    <div style="font-size: 13px; font-weight: 700; color: #ef4444;">
                        €${formatNumberShort(project.actual_npv)}
                    </div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.7); padding: 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 9px; color: #92400e; font-weight: 600;">IRR</div>
                    <div style="font-size: 13px; font-weight: 700; color: ${project.actual_irr >= 0 ? '#f59e0b' : '#ef4444'};">
                        ${project.actual_irr}%
                    </div>
                </div>
            </div>
            
            <!-- Value Realized -->
            ${project.strategic_value_realized ? `
                <div style="background: rgba(16, 185, 129, 0.15); padding: 12px; border-radius: 8px; border: 2px solid rgba(16, 185, 129, 0.3);">
                    <div style="font-size: 10px; font-weight: 700; color: #065f46; margin-bottom: 6px; text-transform: uppercase;">
                        📈 Realisierter Wert
                    </div>
                    <div style="font-size: 11px; color: #047857; line-height: 1.6; font-weight: 500;">
                        ${truncate(project.strategic_value_realized, 120)}
                    </div>
                </div>
            ` : ''}
            
        </div>
    `;
}

function renderAIRecommendation(projekt, calc, similar) {
    if (!similar || similar.length === 0) {
        return '';
    }
    
    // Calculate benchmarks
    const avgNPV = similar.reduce((sum, p) => sum + (p.actual_npv || 0), 0) / similar.length;
    const avgIRR = similar.reduce((sum, p) => sum + (p.actual_irr || 0), 0) / similar.length;
    const avgSuccess = similar.reduce((sum, p) => sum + p.success_rating, 0) / similar.length;
    
    const projektNPV = (calc?.kpis?.npv || 0) / 1000000;
    const projektIRR = calc?.kpis?.irr || 0;
    
    // Determine recommendation logic
    let recommendation = 'KRITISCHE PRÜFUNG';
    let recommendationColor = '#f59e0b';
    let recommendationIcon = '⚠️';
    
    if (avgSuccess >= 4 && projektNPV > avgNPV * 0.8) {
        recommendation = 'GO MIT AUFLAGEN';
        recommendationColor = '#10b981';
        recommendationIcon = '✅';
    } else if (avgSuccess >= 3.5 && projektNPV > 0) {
        recommendation = 'GO MIT AUFLAGEN';
        recommendationColor = '#10b981';
        recommendationIcon = '✅';
    } else if (avgSuccess < 2.5 || projektNPV < 0) {
        recommendation = 'NO-GO EMPFOHLEN';
        recommendationColor = '#ef4444';
        recommendationIcon = '❌';
    }
    
    return `
        <div style="background: white; border: 3px solid ${recommendationColor}; border-radius: 12px; padding: 20px; margin-top: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; background: ${recommendationColor}; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 6px ${recommendationColor}40;">
                    🎯
                </div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">
                        KI-Investment Empfehlung
                    </h4>
                    <div style="font-size: 12px; color: #6b7280; font-weight: 500;">
                        Basierend auf ${similar.length} vergleichbaren Projekten
                    </div>
                </div>
            </div>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 10px; margin-bottom: 14px; border-left: 4px solid ${recommendationColor};">
                <div style="font-size: 18px; font-weight: 700; color: ${recommendationColor}; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    ${recommendationIcon} ${recommendation}
                </div>
                <ul style="margin: 0; padding-left: 24px; font-size: 13px; color: #374151; line-height: 2;">
                    <li>Durchschnittlicher NPV ähnlicher Projekte: <strong style="color: #111827;">€${formatNumberShort(avgNPV)}</strong></li>
                    <li>Durchschnittlicher IRR: <strong style="color: #111827;">${avgIRR.toFixed(1)}%</strong></li>
                    <li>Durchschnittliche Success Rate: <strong style="color: #111827;">${avgSuccess.toFixed(1)}/5</strong></li>
                    <li style="margin-top: 10px; color: #1e40af; font-weight: 600; font-size: 14px;">
                        ${recommendation === 'GO MIT AUFLAGEN' 
                            ? '✅ Projekt liegt im erfolgreichen Segment, kritische Erfolgsfaktoren beachten'
                            : recommendation === 'NO-GO EMPFOHLEN'
                            ? '❌ Projekt zeigt kritische Risikofaktoren - detaillierte Prüfung erforderlich'
                            : '⚠️ Kritische Prüfung empfohlen - Risikofaktoren genau analysieren'
                        }
                    </li>
                </ul>
            </div>
            
            <!-- Comparison Bar -->
            <div style="margin-bottom: 14px;">
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 6px; font-weight: 600;">
                    NPV Vergleich: Aktuelles Projekt vs. Historischer Durchschnitt
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <div style="flex: 1; background: #e5e7eb; border-radius: 8px; height: 24px; position: relative; overflow: hidden;">
                        <div style="position: absolute; left: 0; top: 0; height: 100%; background: ${projektNPV >= avgNPV ? '#10b981' : '#f59e0b'}; width: ${Math.min((projektNPV / (avgNPV || 1)) * 100, 100)}%; border-radius: 8px; transition: width 0.5s;"></div>
                        <div style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 11px; font-weight: 700; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                            €${formatNumberShort(projektNPV)}
                        </div>
                    </div>
                    <div style="font-size: 12px; font-weight: 700; color: #6b7280; min-width: 60px; text-align: right;">
                        Ø €${formatNumberShort(avgNPV)}
                    </div>
                </div>
            </div>
            
            <div style="font-size: 11px; color: #6b7280; font-style: italic; padding: 10px; background: #f9fafb; border-radius: 6px;">
                💡 Diese Empfehlung basiert auf historischen Vergleichsprojekten und sollte durch weitere Analysen ergänzt werden.
            </div>
        </div>
    `;
}

// ==========================================
// HELPER: NO RAG STATES
// ==========================================

function renderNoSupabase() {
    return `
        <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">ℹ️</div>
            <div style="font-size: 16px; color: #374151; font-weight: 600; margin-bottom: 6px;">
                RAG Intelligence nicht verfügbar
            </div>
            <div style="font-size: 13px; color: #6b7280;">
                Supabase Datenbank ist nicht verbunden
            </div>
        </div>
    `;
}

function renderNoSimilarProjects() {
    return `
        <div style="background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 3px solid #fde047; border-radius: 16px; padding: 28px; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="font-size: 48px;">🚀</div>
                <div>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #854d0e;">
                        Pionier-Projekt
                    </h3>
                    <div style="font-size: 14px; color: #a16207; margin-top: 6px; line-height: 1.6;">
                        Keine ähnlichen historischen Projekte gefunden. Dies ist ein innovatives Neuland-Projekt!
                    </div>
                    <div style="font-size: 12px; color: #a16207; margin-top: 10px; font-style: italic; padding: 10px; background: rgba(255,255,255,0.5); border-radius: 6px;">
                        💡 Nach Projekt-Abschluss wird dieses Projekt zur Referenz für künftige Business Cases.
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRAGError(error) {
    return `
        <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 24px;">
            <div style="font-size: 16px; color: #991b1b; font-weight: 600; margin-bottom: 6px;">
                ⚠️ Fehler beim Laden der Intelligence
            </div>
            <div style="font-size: 13px; color: #7f1d1d;">
                ${error.message || 'Unbekannter Fehler'}
            </div>
        </div>
    `;
}

// ==========================================
// RAG HELPER FUNCTIONS
// ==========================================

function getSuccessIcon(rating) {
    if (rating >= 4) return '✅';
    if (rating >= 3) return '⚠️';
    if (rating >= 2) return '🔶';
    return '❌';
}

function getSuccessColor(rating) {
    if (rating >= 4) return '#10b981';
    if (rating >= 3) return '#f59e0b';
    if (rating >= 2) return '#f97316';
    return '#ef4444';
}

function formatNumberShort(num) {
    if (!num && num !== 0) return '0';
    const absNum = Math.abs(num);
    if (absNum >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    } else if (absNum >= 1000) {
        return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toFixed(0);
}

function truncate(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ==========================================
// EXISTING RENDERING FUNCTIONS
// ==========================================

function renderPlaceholder(projekt) {
    return `
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
}

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

function renderKPIGrid(calc) {
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

function renderAssumptionsSensitivities(calc, artikel) {
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
                    <div style="position: relative; height: 120px;">
                        <canvas id="mini-chart-revenue"></canvas>
                    </div>
                </div>
                
                <!-- DB-Entwicklung -->
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">
                        Deckungsbeitrag 3
                    </div>
                    <div style="position: relative; height: 120px;">
                        <canvas id="mini-chart-db"></canvas>
                    </div>
                </div>
                
                <!-- Break-Even -->
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">
                        Kumulierter DB3
                    </div>
                    <div style="position: relative; height: 120px;">
                        <canvas id="mini-chart-cumulative"></canvas>
                    </div>
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
        maintainAspectRatio: true,
        aspectRatio: 2.5,
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
                ticks: { 
                    font: { size: 9 }, 
                    color: '#6b7280',
                    maxTicksLimit: 5
                }
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
