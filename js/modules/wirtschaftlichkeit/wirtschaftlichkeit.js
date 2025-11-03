/**
 * CFO Dashboard - Wirtschaftlichkeit Module
 * UI Layer - Presentation & User Interaction
 * 
 * @module wirtschaftlichkeit
 * @description Complete profitability analysis with contribution margin scheme
 * @author Senior Development Team
 * @version 2.0.0
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';
import { calculateProjektWirtschaftlichkeit } from './calculator.js';
import { renderSzenarioSelector } from './szenario-ui.js';
import './szenario-window-functions.js';
import { analyzeKostenblockKategorisierung } from './ki-integration.js';
import {
    HK_DEFAULTS,
    OVERHEAD_DEFAULTS,
    UI_LABELS,
    BRANCHEN_BENCHMARKS
} from './constants.js';

// ========================================
// ✅ NEU: HELPER FUNCTIONS
// ========================================

/**
 * Get display name for scenario ID
 * 
 * @param {string} szenarioId - Scenario ID
 * @returns {string} Display name
 * 
 * @private
 */
function getSzenarioDisplayName(szenarioId) {
    const displayNames = {
        'base': 'Base',
        'best-organic': 'Best',
        'best-investment': 'Best+',
        'worst-conservative': 'Worst',
        'worst-aggressive': 'Worst-',
        'custom': 'Custom'
    };
    
    return displayNames[szenarioId] || 'Base';
}

// ========================================
// PROJEKT-WIRTSCHAFTLICHKEIT (Aggregiert)
// ========================================

/**
 * Render aggregated profitability view for entire project
 * Shows DB1-DB5 contribution margin scheme with all articles combined
 * 
 * @public
 */
export async function renderProjektWirtschaftlichkeit() {
    const projektId = window.cfoDashboard.currentProjekt;
    const projekt = state.getProjekt(projektId);
    const container = document.getElementById('projekt-tab-wirtschaftlichkeit');
    
    if (!container) {
        console.error('Container #projekt-tab-wirtschaftlichkeit not found');
        return;
    }
    
    // Show loading state
    container.innerHTML = createLoadingState();
    
    try {
        // ✨ NEU: Initialize Szenario-Analyse
        await window.initializeSzenarioAnalysis();
        
        // Get article list
        let artikelListe = state.getArtikelByProjekt(projektId);
        console.log('📋 All articles:', artikelListe.map(a => ({id: a.id, name: a.name})));
        
        // ✅ CRITICAL: Apply article filter if active
        const activeFilter = window.cfoDashboard?.artikelFilter;
        if (activeFilter) {
            console.log('🔍 Active filter:', activeFilter);
            artikelListe = artikelListe.filter(a => a.id === activeFilter);
            console.log('📋 Filtered articles:', artikelListe.map(a => ({id: a.id, name: a.name})));
            
            if (artikelListe.length === 0) {
                console.error('❌ No articles after filter!');
            }
        }
        
       // ✨ KORRIGIERT: Check if filter changed, re-calculate if needed
        let result;
        const isFilterActive = activeFilter !== null;

        // ✅ WICHTIG: Re-calculate if:
        // 1. No cached result exists, OR
        // 2. Filter state changed
        if (!window.currentSzenarioResult || 
            window.lastFilterState !== activeFilter) {
            
            console.log(`🔄 Recalculating (filter: ${activeFilter || 'ALLE'})`);
            
            // Calculate with filtered articles
            result = await calculateProjektWirtschaftlichkeit(projektId, {
                wacc: 0.08,
                validateInputs: true,
                filteredArtikel: artikelListe  // Pass filtered list
            });
            
            // ✅ Cache result and filter state
            window.currentSzenarioResult = result;
            window.lastFilterState = activeFilter;
            
            console.log(`✅ Calculated: ${helpers.formatCurrency(result.totals.sales_revenue)}`);
        } else {
            result = window.currentSzenarioResult;
            console.log('✅ Using cached result');
        }
        
        console.log('💰 Calculated sales revenue:', result.totals?.sales_revenue);
        console.log('📊 Full result:', result);
        
        // Get FULL article list for display (unfiltered)
        const allArtikelListe = state.getArtikelByProjekt(projektId);
        
   // Render complete UI
    container.innerHTML = `
        <div style="padding: 20px;">
            ${renderHeader(projekt, allArtikelListe)}
            
            <!-- ✅ GEÄNDERT: Nur noch 2 Balken (Szenario + Filter) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                
                <!-- Szenario Selector -->
                <div style="background: linear-gradient(135deg, #f0f9ff, #e0e7ff); padding: 10px 12px; border-radius: 8px; border: 1px solid #dbeafe;">
                   <div style="font-size: 11px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">
                        📊 Szenario: <strong>${getSzenarioDisplayName(window.currentActiveSzenarioId || 'base')}</strong>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                        <button id="szenario-base" class="szenario-btn"
                                style="padding: 6px; background: ${window.currentActiveSzenarioId === 'base' ? '#1e3a8a' : 'white'}; 
                                    color: ${window.currentActiveSzenarioId === 'base' ? 'white' : '#374151'}; 
                                    border: 1px solid ${window.currentActiveSzenarioId === 'base' ? '#1e3a8a' : '#e5e7eb'};
                                    border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 500;">
                            Base
                        </button>
                        <button id="szenario-best" class="szenario-btn"
                                style="padding: 6px; background: ${window.currentActiveSzenarioId === 'best-organic' ? '#059669' : 'white'}; 
                                    color: ${window.currentActiveSzenarioId === 'best-organic' ? 'white' : '#374151'}; 
                                    border: 1px solid ${window.currentActiveSzenarioId === 'best-organic' ? '#059669' : '#e5e7eb'};
                                    border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 500;">
                            ✓ Best
                        </button>
                        <button id="szenario-worst" class="szenario-btn"
                                style="padding: 6px; background: ${window.currentActiveSzenarioId === 'worst-conservative' ? '#dc2626' : 'white'}; 
                                    color: ${window.currentActiveSzenarioId === 'worst-conservative' ? 'white' : '#374151'}; 
                                    border: 1px solid ${window.currentActiveSzenarioId === 'worst-conservative' ? '#dc2626' : '#e5e7eb'};
                                    border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 500;">
                            ✗ Worst
                        </button>
                        <button id="szenario-custom" class="szenario-btn"
                                style="padding: 6px; background: white; color: #374151; 
                                    border: 1px solid #e5e7eb; border-radius: 4px; 
                                    font-size: 10px; cursor: pointer; font-weight: 500;">
                            ⚙️ Custom
                        </button>
                    </div>
                </div>
                
                <!-- Artikel Filter -->
                <div style="background: linear-gradient(135deg, #f0f9ff, #e0e7ff); padding: 10px 12px; border-radius: 8px; border: 1px solid #dbeafe;">
                    <div style="font-size: 11px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">
                        📦 Filter: <strong>${window.cfoDashboard?.artikelFilter ? 'Einzelprodukt' : 'Alle'}</strong>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        <button id="filter-alle" data-artikel-id="null" class="artikel-filter-btn active"
                                style="padding: 6px 10px; background: #1e3a8a; color: white; border: 2px solid #1e3a8a;
                                    border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 600;">
                            📊 Alle
                        </button>
                        ${allArtikelListe.map(artikel => `
                            <button id="filter-${artikel.id}" data-artikel-id="${artikel.id}" class="artikel-filter-btn"
                                    style="padding: 6px 10px; background: white; color: #374151; border: 1px solid #e5e7eb;
                                        border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 500;">
                                <span style="color: ${getTypeColor(artikel.typ)};">●</span> ${artikel.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- ✅ NEU: Base Case Info Panel (Collapsible) -->
            <div id="base-case-panel" style="background: white; padding: 12px; border-radius: 8px; 
                                            margin-bottom: 16px; border: 1px solid var(--border); 
                                            display: ${window.currentActiveSzenarioId === 'base' ? 'block' : 'none'};">
                <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                    onclick="window.toggleBaseCaseDetails()">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 12px; font-weight: 600; color: var(--primary);">
                            📊 Base Case Annahmen
                        </span>
                        <span id="base-case-toggle-icon" style="font-size: 10px; color: var(--gray);">
                            ▼ Details anzeigen
                        </span>
                    </div>
                    <button onclick="event.stopPropagation(); window.saveBaseCase();" 
                            class="btn btn-primary btn-sm"
                            style="padding: 4px 10px; font-size: 10px;">
                        💾 Base Case speichern
                    </button>
                </div>
                
                <!-- Collapsible Content -->
                <div id="base-case-details" style="display: none; margin-top: 12px; padding-top: 12px; 
                                                border-top: 1px solid var(--border);">
                    ${renderBaseCaseDetails(projekt, result)}
                </div>
            </div>

             <!-- ✅ NEU: Best Case Inline Panel -->
            <div id="best-inline-panel" style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); 
                                                padding: 12px; border-radius: 8px; margin-bottom: 16px; 
                                                border: 1px solid #10b981; 
                                                display: ${window.currentActiveSzenarioId === 'best-organic' ? 'block' : 'none'};">
                <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                     onclick="window.toggleBestInlineDetails()">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 12px; font-weight: 600; color: #065f46;">
                            ✓ Best Case Anpassungen
                        </span>
                        <span id="best-inline-toggle-icon" style="font-size: 10px; color: #6b7280;">
                            ▼ Details anzeigen
                        </span>
                    </div>
                    <button onclick="event.stopPropagation(); window.applyBestInline();" 
                            class="btn btn-sm"
                            style="padding: 4px 10px; font-size: 10px; background: #10b981; color: white; border: none;">
                        ✅ Anwenden
                    </button>
                </div>
                
                <!-- Collapsible Content -->
                <div id="best-inline-details" style="display: none; margin-top: 12px; padding-top: 12px; 
                                                     border-top: 1px solid #10b981;">
                    ${renderBestWorstInlineControls('best', projekt, result)}
                </div>
            </div>
            
            <!-- ✅ NEU: Worst Case Inline Panel -->
            <div id="worst-inline-panel" style="background: linear-gradient(135deg, #fee2e2, #fecaca); 
                                                 padding: 12px; border-radius: 8px; margin-bottom: 16px; 
                                                 border: 1px solid #ef4444; 
                                                 display: ${window.currentActiveSzenarioId === 'worst-conservative' ? 'block' : 'none'};">
                <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                     onclick="window.toggleWorstInlineDetails()">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 12px; font-weight: 600; color: #991b1b;">
                            ✗ Worst Case Anpassungen
                        </span>
                        <span id="worst-inline-toggle-icon" style="font-size: 10px; color: #6b7280;">
                            ▼ Details anzeigen
                        </span>
                    </div>
                    <button onclick="event.stopPropagation(); window.applyWorstInline();" 
                            class="btn btn-sm"
                            style="padding: 4px 10px; font-size: 10px; background: #ef4444; color: white; border: none;">
                        ✅ Anwenden
                    </button>
                </div>
                
                <!-- Collapsible Content -->
                <div id="worst-inline-details" style="display: none; margin-top: 12px; padding-top: 12px; 
                                                      border-top: 1px solid #ef4444;">
                    ${renderBestWorstInlineControls('worst', projekt, result)}
                </div>
            </div>
            
            <!-- Rest of UI -->
            ${renderContributionMarginTable(result)}
            ${renderKPIDashboard(result, result.kpis, allArtikelListe[0]?.typ)}
            ${renderActionButtons()}
        </div>
    `;
        
        // Initialize interactivity
        initializeEventHandlers();
        
        // Re-apply graying if filter is active
        if (activeFilter) {
            grayOutProjectCostRows(true);
            const infoBox = document.getElementById('artikel-filter-info');
            if (infoBox) {
                infoBox.style.display = 'block';
                const artikel = state.getArtikel(activeFilter);
                const nameSpan = document.getElementById('filtered-artikel-name');
                if (nameSpan && artikel) {
                    nameSpan.textContent = artikel.name || 'Unbenannt';
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Rendern der Wirtschaftlichkeit:', error);
        console.error('Stack:', error.stack);
        container.innerHTML = renderErrorState(error);
    }
}

// ========================================
// ARTIKEL-WIRTSCHAFTLICHKEIT (Einzeln)
// ========================================

/**
 * Render profitability view for single article
 * 
 * @public
 */
export async function renderWirtschaftlichkeit() {
    const artikelId = window.cfoDashboard.currentArtikel;
    const artikel = state.getArtikel(artikelId);
    const container = document.getElementById('artikel-tab-wirtschaftlichkeit');
    
    if (!container) {
        console.error('Container #artikel-tab-wirtschaftlichkeit not found');
        return;
    }
    
    // Show loading state
    container.innerHTML = createLoadingState();
    
    try {
        // For single article, we need to calculate on project level
        // but filter to show only this article
        const projektId = artikel?.projekt_id;
        if (!projektId) {
            throw new Error('Artikel hat keine Projekt-Zuordnung');
        }
        
        const result = await calculateProjektWirtschaftlichkeit(projektId, {
            wacc: 0.08,
            validateInputs: true
        });
        
        // Render UI
        container.innerHTML = `
            <div style="padding: 20px;">
                ${renderArtikelHeader(artikel)}
                ${renderHKConfigSection(artikel)}
                ${renderContributionMarginTable(result, artikel)}
                ${renderKPIDashboard(result, result.kpis, artikel.typ)}
                ${renderActionButtons()}
            </div>
        `;
        
        // Initialize interactivity
        initializeEventHandlers();
        
    } catch (error) {
        console.error('Fehler beim Rendern der Artikel-Wirtschaftlichkeit:', error);
        container.innerHTML = renderErrorState(error);
    }
}

// ========================================
// RENDERING FUNCTIONS
// ========================================

/**
 * Render header section with project info
 * KOMPAKTE VERSION - Alles in einer Zeile
 * 
 * @param {Object} projekt - Project data
 * @param {Array} artikelListe - List of articles
 * @returns {string} HTML
 * 
 * @private
 */
function renderHeader(projekt, artikelListe) {
    return `
        <div style="background: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; 
                    border: 1px solid var(--border); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
                <!-- Left: Title -->
                <div style="flex-shrink: 0;">
                    <h3 style="margin: 0; font-size: 16px; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                        📊 Projekt-Wirtschaftlichkeit
                        <span style="font-size: 12px; font-weight: 400; color: var(--gray);">
                            ${projekt?.name || 'Projekt'} • ${artikelListe?.length || 0} Artikel
                        </span>
                    </h3>
                </div>
                
                <!-- Right: Controls -->
                <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
                    <button onclick="window.exportWirtschaftlichkeit()" 
                            class="btn btn-secondary btn-sm"
                            style="display: flex; align-items: center; gap: 4px; padding: 6px 10px; font-size: 11px;">
                        <span>📥</span>
                        <span>Export</span>
                    </button>
                    <select id="view-level" onchange="window.updateViewLevel()" 
                            style="padding: 6px 10px; border: 1px solid var(--border); 
                                   border-radius: 4px; font-size: 11px; background: white;">
                        <option value="all" selected>Alle Stufen</option>
                        <option value="db2">Bis DB2</option>
                        <option value="db5">Bis DB5</option>
                        <option value="ebit">Nur EBIT</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Base Case details with fallback sliders
 * Shows current values from Revenue Model + Projektkosten
 * Editable fallback percentages when Projektkosten are missing
 * 
 * @param {Object} projekt - Project data
 * @param {Object} result - Calculation result (for current values)
 * @returns {string} HTML
 * 
 * @private
 */
function renderBaseCaseDetails(projekt, result) {
    // Get current values from calculation
    const totalRevenue = result.totals?.sales_revenue_total || 0;
    
    // Get projektkosten aktive blocks
    const projektkosten = projekt?.kostenWerte || {};
    const aktiveBlöcke = projekt?.aktiveKostenblöcke || [];
    
    // Check which categories have actual Projektkosten
    const hasDevCosts = aktiveBlöcke.some(id => ['personal', 'cloud', 'lizenzen'].includes(id));
    const hasSellingCosts = aktiveBlöcke.some(id => ['marketing', 'vertrieb'].includes(id));
    const hasAdminCosts = aktiveBlöcke.some(id => ['verwaltung', 'it'].includes(id));
    
    // Get fallback settings (or defaults)
    const fallbackSettings = projekt?.baseCaseFallbacks || {
        development_percent: 15,
        selling_percent: 10,
        marketing_percent: 5,
        admin_percent: 5,
        distribution_percent: 3
    };
    
    return `
        <div style="display: grid; gap: 16px;">
            
            <!-- Revenue Section -->
            <div style="background: #f0f9ff; padding: 12px; border-radius: 6px;">
                <div style="font-size: 11px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">
                    💰 Revenue (aus Revenue Model)
                </div>
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center;">
                    <span style="font-size: 10px; color: var(--gray);">Total Sales Revenue:</span>
                    <strong style="font-size: 13px; color: var(--primary);">
                        ${helpers.formatCurrency(totalRevenue)}
                    </strong>
                </div>
                <div style="font-size: 9px; color: var(--gray); margin-top: 6px;">
                    ℹ️ Wird automatisch aus Artikel-Forecasts berechnet
                </div>
            </div>
            
            <!-- Cost Section -->
            <div style="background: #fef3c7; padding: 12px; border-radius: 6px;">
                <div style="font-size: 11px; font-weight: 600; color: #92400e; margin-bottom: 8px;">
                    💼 Projektkosten & Fallback
                </div>
                
                <!-- Development -->
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #fde68a;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 10px; font-weight: 600; color: var(--gray);">
                            🔬 Development
                        </span>
                        ${hasDevCosts ? `
                            <span style="font-size: 9px; padding: 2px 6px; background: #10b981; color: white; 
                                         border-radius: 3px;">✓ Projektkosten</span>
                        ` : `
                            <span style="font-size: 9px; padding: 2px 6px; background: #f59e0b; color: white; 
                                         border-radius: 3px;">⚠️ Fallback aktiv</span>
                        `}
                    </div>
                    
                    ${!hasDevCosts ? `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range" 
                                   id="fallback-development" 
                                   class="fallback-slider"
                                   min="0" max="50" step="0.5" 
                                   value="${fallbackSettings.development_percent}"
                                   oninput="window.updateFallbackValue('development', this.value)"
                                   style="flex: 1;">
                            <input type="number" 
                                   id="fallback-development-value"
                                   value="${fallbackSettings.development_percent}"
                                   min="0" max="50" step="0.5"
                                   oninput="window.updateFallbackSlider('development', this.value)"
                                   style="width: 60px; padding: 4px; border: 1px solid var(--border); 
                                          border-radius: 3px; font-size: 11px; font-weight: 600;">
                            <span style="font-size: 10px; color: var(--gray);">%</span>
                        </div>
                        <div style="font-size: 9px; color: var(--gray); margin-top: 4px;">
                            = ${helpers.formatCurrency(totalRevenue * fallbackSettings.development_percent / 100)}
                        </div>
                    ` : `
                        <div style="font-size: 10px; color: var(--gray);">
                            Werte aus Projektkosten-Tab
                        </div>
                    `}
                </div>
                
                <!-- Selling -->
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #fde68a;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 10px; font-weight: 600; color: var(--gray);">
                            📢 Selling
                        </span>
                        ${hasSellingCosts ? `
                            <span style="font-size: 9px; padding: 2px 6px; background: #10b981; color: white; 
                                         border-radius: 3px;">✓ Projektkosten</span>
                        ` : `
                            <span style="font-size: 9px; padding: 2px 6px; background: #f59e0b; color: white; 
                                         border-radius: 3px;">⚠️ Fallback aktiv</span>
                        `}
                    </div>
                    
                    ${!hasSellingCosts ? `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range" 
                                   id="fallback-selling" 
                                   class="fallback-slider"
                                   min="0" max="30" step="0.5" 
                                   value="${fallbackSettings.selling_percent}"
                                   oninput="window.updateFallbackValue('selling', this.value)"
                                   style="flex: 1;">
                            <input type="number" 
                                   id="fallback-selling-value"
                                   value="${fallbackSettings.selling_percent}"
                                   min="0" max="30" step="0.5"
                                   oninput="window.updateFallbackSlider('selling', this.value)"
                                   style="width: 60px; padding: 4px; border: 1px solid var(--border); 
                                          border-radius: 3px; font-size: 11px; font-weight: 600;">
                            <span style="font-size: 10px; color: var(--gray);">%</span>
                        </div>
                        <div style="font-size: 9px; color: var(--gray); margin-top: 4px;">
                            = ${helpers.formatCurrency(totalRevenue * fallbackSettings.selling_percent / 100)}
                        </div>
                    ` : `
                        <div style="font-size: 10px; color: var(--gray);">
                            Werte aus Projektkosten-Tab
                        </div>
                    `}
                </div>
                
                <!-- Marketing -->
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #fde68a;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 10px; font-weight: 600; color: var(--gray);">
                            🎯 Marketing
                        </span>
                        ${hasSellingCosts ? `
                            <span style="font-size: 9px; padding: 2px 6px; background: #10b981; color: white; 
                                         border-radius: 3px;">✓ Projektkosten</span>
                        ` : `
                            <span style="font-size: 9px; padding: 2px 6px; background: #f59e0b; color: white; 
                                         border-radius: 3px;">⚠️ Fallback aktiv</span>
                        `}
                    </div>
                    
                    ${!hasSellingCosts ? `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range" 
                                   id="fallback-marketing" 
                                   class="fallback-slider"
                                   min="0" max="30" step="0.5" 
                                   value="${fallbackSettings.marketing_percent}"
                                   oninput="window.updateFallbackValue('marketing', this.value)"
                                   style="flex: 1;">
                            <input type="number" 
                                   id="fallback-marketing-value"
                                   value="${fallbackSettings.marketing_percent}"
                                   min="0" max="30" step="0.5"
                                   oninput="window.updateFallbackSlider('marketing', this.value)"
                                   style="width: 60px; padding: 4px; border: 1px solid var(--border); 
                                          border-radius: 3px; font-size: 11px; font-weight: 600;">
                            <span style="font-size: 10px; color: var(--gray);">%</span>
                        </div>
                        <div style="font-size: 9px; color: var(--gray); margin-top: 4px;">
                            = ${helpers.formatCurrency(totalRevenue * fallbackSettings.marketing_percent / 100)}
                        </div>
                    ` : `
                        <div style="font-size: 10px; color: var(--gray);">
                            Werte aus Projektkosten-Tab
                        </div>
                    `}
                </div>
                
                <!-- Admin + Distribution combined -->
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 10px; font-weight: 600; color: var(--gray);">
                            🏢 Admin & Distribution
                        </span>
                        ${hasAdminCosts ? `
                            <span style="font-size: 9px; padding: 2px 6px; background: #10b981; color: white; 
                                         border-radius: 3px;">✓ Projektkosten</span>
                        ` : `
                            <span style="font-size: 9px; padding: 2px 6px; background: #f59e0b; color: white; 
                                         border-radius: 3px;">⚠️ Fallback aktiv</span>
                        `}
                    </div>
                    
                    ${!hasAdminCosts ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <!-- Admin -->
                            <div>
                                <div style="font-size: 9px; color: var(--gray); margin-bottom: 4px;">Admin:</div>
                                <div style="display: flex; align-items: center; gap: 4px;">
                                    <input type="range" 
                                           id="fallback-admin" 
                                           class="fallback-slider"
                                           min="0" max="20" step="0.5" 
                                           value="${fallbackSettings.admin_percent}"
                                           oninput="window.updateFallbackValue('admin', this.value)"
                                           style="flex: 1;">
                                    <input type="number" 
                                           id="fallback-admin-value"
                                           value="${fallbackSettings.admin_percent}"
                                           min="0" max="20" step="0.5"
                                           oninput="window.updateFallbackSlider('admin', this.value)"
                                           style="width: 50px; padding: 2px; border: 1px solid var(--border); 
                                                  border-radius: 3px; font-size: 10px;">
                                    <span style="font-size: 9px;">%</span>
                                </div>
                            </div>
                            
                            <!-- Distribution -->
                            <div>
                                <div style="font-size: 9px; color: var(--gray); margin-bottom: 4px;">Distribution:</div>
                                <div style="display: flex; align-items: center; gap: 4px;">
                                    <input type="range" 
                                           id="fallback-distribution" 
                                           class="fallback-slider"
                                           min="0" max="20" step="0.5" 
                                           value="${fallbackSettings.distribution_percent}"
                                           oninput="window.updateFallbackValue('distribution', this.value)"
                                           style="flex: 1;">
                                    <input type="number" 
                                           id="fallback-distribution-value"
                                           value="${fallbackSettings.distribution_percent}"
                                           min="0" max="20" step="0.5"
                                           oninput="window.updateFallbackSlider('distribution', this.value)"
                                           style="width: 50px; padding: 2px; border: 1px solid var(--border); 
                                                  border-radius: 3px; font-size: 10px;">
                                    <span style="font-size: 9px;">%</span>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div style="font-size: 10px; color: var(--gray);">
                            Werte aus Projektkosten-Tab
                        </div>
                    `}
                </div>
            </div>
            
            <!-- Info Box -->
            <div style="padding: 10px; background: #e0f2fe; border-left: 3px solid #0ea5e9; 
                        border-radius: 4px; font-size: 10px; color: #0c4a6e; line-height: 1.5;">
                💡 <strong>Base Case</strong> = Ihre Planungsgrundlage<br>
                • Revenue aus Forecasts (unveränderlich)<br>
                • Kosten aus Projektkosten-Tab (wenn vorhanden)<br>
                • Fallback-% für fehlende Kostenblöcke (editierbar)<br>
                <br>
                Alle Szenarien (Best/Worst/Custom) bauen auf diesem Base Case auf!
            </div>
        </div>
    `;
}

/**
 * Render Best/Worst inline controls
 * Shows cost adjustments with mode switchers and sliders
 * 
 * @param {string} scenario - 'best' or 'worst'
 * @param {Object} projekt - Project data
 * @param {Object} result - Calculation result
 * @returns {string} HTML
 * 
 * @private
 */
function renderBestWorstInlineControls(scenario, projekt, result) {
    const totalRevenue = result.totals?.sales_revenue_total || 0;
    const colorScheme = scenario === 'best' ? {
        bg: '#d1fae5',
        border: '#10b981',
        text: '#065f46'
    } : {
        bg: '#fee2e2',
        border: '#ef4444',
        text: '#991b1b'
    };
    
    // Cost categories to show
    const categories = [
        { key: 'development', label: '🔬 Development', defaultPercent: 0 },
        { key: 'selling', label: '🤝 Selling', defaultPercent: 0 },
        { key: 'marketing', label: '📢 Marketing', defaultPercent: 0 },
        { key: 'admin', label: '🏢 Admin', defaultPercent: 0 },
        { key: 'distribution', label: '🚚 Distribution', defaultPercent: 0 }
    ];
    
    return `
        <div style="display: grid; gap: 12px;">
            
            <!-- Info Box -->
            <div style="padding: 10px; background: ${colorScheme.bg}; border-left: 3px solid ${colorScheme.border}; 
                        border-radius: 4px; font-size: 10px; color: ${colorScheme.text}; line-height: 1.5;">
                💡 <strong>${scenario === 'best' ? 'Best Case' : 'Worst Case'}</strong><br>
                • Revenue: ${scenario === 'best' ? '+30%' : '-20%'} (automatisch)<br>
                • Variable Kosten: Folgen automatisch<br>
                • Fixed Kosten: ${scenario === 'best' ? 'Bleiben stabil oder steigen leicht' : 'Reduktionspotenzial nutzen'}<br>
                <br>
                <strong>Anpassbare Parameter:</strong>
            </div>
            
            ${categories.map(cat => `
                <!-- ${cat.label} -->
                <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 11px; font-weight: 600; color: var(--gray);">
                            ${cat.label}
                        </span>
                        
                        <!-- Mode Buttons -->
                        <div data-scenario="${scenario}" data-category="${cat.key}" style="display: flex; gap: 4px;">
                            <button class="mode-btn" data-mode="fixed"
                                    onclick="window.changeSzenarioInlineMode('${scenario}', '${cat.key}', 'fixed')"
                                    style="padding: 3px 8px; font-size: 9px; border: 1px solid var(--primary);
                                           background: var(--primary); color: white; border-radius: 3px; cursor: pointer;">
                                Fixed
                            </button>
                            <button class="mode-btn" data-mode="auto"
                                    onclick="window.changeSzenarioInlineMode('${scenario}', '${cat.key}', 'auto')"
                                    style="padding: 3px 8px; font-size: 9px; border: 1px solid var(--border);
                                           background: white; color: var(--text); border-radius: 3px; cursor: pointer;">
                                Auto
                            </button>
                            <button class="mode-btn" data-mode="manual"
                                    onclick="window.changeSzenarioInlineMode('${scenario}', '${cat.key}', 'manual')"
                                    style="padding: 3px 8px; font-size: 9px; border: 1px solid var(--border);
                                           background: white; color: var(--text); border-radius: 3px; cursor: pointer;">
                                Manual
                            </button>
                        </div>
                    </div>
                    
                    <!-- Slider (initially hidden) -->
                    <div id="${scenario}-${cat.key}-slider-container" style="display: none; margin-top: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range" 
                                   id="${scenario}-${cat.key}-slider"
                                   class="inline-slider"
                                   min="-50" max="100" step="1" 
                                   value="${cat.defaultPercent}"
                                   oninput="window.updateSzenarioSlider('${scenario}', '${cat.key}', this.value)"
                                   style="flex: 1;">
                            <input type="number" 
                                   id="${scenario}-${cat.key}-value"
                                   value="${cat.defaultPercent}"
                                   min="-50" max="100" step="1"
                                   oninput="window.updateSzenarioSliderFromInput('${scenario}', '${cat.key}', this.value)"
                                   style="width: 50px; padding: 3px; border: 1px solid var(--border); 
                                          border-radius: 3px; font-size: 10px; text-align: right;">
                            <span style="font-size: 10px;">%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 4px; 
                                    font-size: 9px; color: var(--gray);">
                            <span>-50%</span>
                            <span>0%</span>
                            <span>+100%</span>
                        </div>
                    </div>
                    
                    <!-- Mode Info -->
                    <div id="${scenario}-${cat.key}-mode-info" style="margin-top: 6px; font-size: 9px; color: var(--gray);">
                        💡 Bleibt unverändert (0%)
                    </div>
                </div>
            `).join('')}
            
        </div>
    `;
}

/**
 * Render article header for single article view
 * 
 * @param {Object} artikel - Article data
 * @returns {string} HTML
 * 
 * @private
 */
function renderArtikelHeader(artikel) {
    return `
        <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; 
                    border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0 0 8px 0; font-size: 18px; color: var(--primary);">
                        📊 Artikel-Wirtschaftlichkeit
                    </h3>
                    <div style="font-size: 13px; color: var(--gray);">
                        ${artikel?.name || 'Artikel'} • ${artikel?.typ || 'Typ unbekannt'}
                    </div>
                </div>
                <button onclick="window.openHKConfig()" 
                        class="btn btn-primary btn-sm"
                        style="display: flex; align-items: center; gap: 6px;">
                    <span>⚙️</span>
                    <span>HK-Struktur anpassen</span>
                </button>
            </div>
        </div>
    `;
}

/**
 * Render article overview section with filter buttons
 * 
 * @param {Array} artikelListe - List of articles
 * @returns {string} HTML
 * 
 * @private
 */
function renderArtikelOverview(artikelListe) {
    if (!artikelListe || artikelListe.length === 0) {
        return '';
    }
    
    return `
        <div style="background: linear-gradient(135deg, #f0f9ff, #e0e7ff); padding: 10px 16px; 
                    border-radius: 8px; margin-bottom: 16px; border: 1px solid #dbeafe;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <span style="font-size: 11px; font-weight: 600; color: var(--primary);">📦 Filter:</span>
                    
                    <!-- "Alle" Button -->
                    <button 
                        id="filter-alle"
                        data-artikel-id="null"
                        class="artikel-filter-btn active"
                        style="padding: 6px 12px; background: #1e3a8a; color: white; border: 2px solid #1e3a8a;
                               border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 600;">
                        📊 Alle (Projekt-Gesamt)
                    </button>
                    
                    ${artikelListe.map(artikel => `
                        <button 
                            id="filter-${artikel.id}"
                            data-artikel-id="${artikel.id}"
                            class="artikel-filter-btn"
                            style="padding: 6px 12px; background: white; color: #374151; border: 1px solid #e5e7eb;
                                   border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 500;">
                            <span style="color: ${getTypeColor(artikel.typ)};">●</span> ${artikel.name}
                        </button>
                    `).join('')}
                </div>
                
                <div style="font-size: 10px; color: var(--gray); white-space: nowrap;">
                    Produkt-Analyse (bis DB2)
                </div>
            </div>
            
            <!-- Info-Box (initially hidden) -->
            <div id="artikel-filter-info" style="display: none; margin-top: 10px; padding: 10px; 
                                                  background: #fef3c7; border-left: 3px solid #f59e0b;
                                                  border-radius: 4px;">
                <div style="font-size: 11px; color: #78350f; line-height: 1.4;">
                    <strong id="filtered-artikel-name"></strong> | 
                    Angezeigt: DB1 & DB2 | 
                    Ausgegraut: DB3-EBIT (nicht zuordenbar) |
                    <button id="back-to-all-btn" data-artikel-id="null" class="artikel-filter-btn"
                            style="margin-left: 8px; padding: 4px 10px; background: white; 
                                   border: 1px solid #f59e0b; border-radius: 4px; 
                                   font-size: 10px; cursor: pointer;">
                        ← Zurück
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render HK configuration section for article
 * 
 * @param {Object} artikel - Article data
 * @returns {string} HTML
 * 
 * @private
 */
function renderHKConfigSection(artikel) {
    const aufteilung = artikel.hk_aufteilung || getDefaultHKAufteilung(artikel.typ);
    
    return `
        <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; 
                    border: 1px solid var(--border);">
            <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">
                🔧 Herstellkosten-Struktur
            </h4>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 12px;">
                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 6px;">
                    <div style="font-size: 10px; color: var(--gray); margin-bottom: 4px;">MATERIAL</div>
                    <div style="font-size: 20px; font-weight: bold; color: var(--primary);">
                        ${aufteilung.material_prozent}%
                    </div>
                </div>
                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 6px;">
                    <div style="font-size: 10px; color: var(--gray); margin-bottom: 4px;">FERTIGUNG</div>
                    <div style="font-size: 20px; font-weight: bold; color: var(--success);">
                        ${aufteilung.fertigung_prozent}%
                    </div>
                </div>
                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 6px;">
                    <div style="font-size: 10px; color: var(--gray); margin-bottom: 4px;">OVERHEAD</div>
                    <div style="font-size: 20px; font-weight: bold; color: var(--warning);">
                        ${aufteilung.overhead_prozent}%
                    </div>
                </div>
            </div>
            
            <div style="font-size: 11px; color: var(--gray); padding: 10px; 
                        background: #f0f9ff; border-radius: 4px;">
                💡 <strong>Quelle:</strong> ${aufteilung.quelle === 'ki-default' 
                    ? 'KI-Default basierend auf Artikel-Typ' 
                    : 'Benutzer-definiert'}
                ${aufteilung.quelle === 'ki-default' 
                    ? ` • <a href="#" onclick="window.openHKConfig()" style="color: var(--primary);">Anpassen</a>`
                    : ''}
            </div>
        </div>
    `;
}

/**
 * Render main contribution margin table
 * 
 * @param {Object} result - Calculation result
 * @param {Object} [filterArtikel] - Optional: Filter to single article
 * @returns {string} HTML
 * 
 * @private
 */
function renderContributionMarginTable(result, filterArtikel = null) {
    const jahre = Object.keys(result.jahre).sort();
    
    if (jahre.length === 0) {
        return renderEmptyDataState();
    }
    
    return `
        <div style="background: white; border-radius: 8px; overflow: hidden; 
                    border: 1px solid var(--border); margin-bottom: 20px;">
            <table id="profitability-table" style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                    <tr style="background: linear-gradient(to right, #1e40af, #3730a3); color: white;">
                        <th style="padding: 12px; text-align: left; width: 280px; position: sticky; left: 0; background: inherit;">
                            Position
                        </th>
                        ${jahre.map(jahr => `
                            <th style="padding: 12px; text-align: center; min-width: 120px;">
                                ${jahr}
                            </th>
                        `).join('')}
                        <th style="padding: 12px; text-align: center; background: #1e293b; min-width: 120px;">
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${renderTableRows(result, jahre)}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Render table rows for contribution margin scheme
 * 
 * @param {Object} result - Calculation result
 * @param {Array} jahre - Years
 * @returns {string} HTML
 * 
 * @private
 */
function renderTableRows(result, jahre) {
    return `
        <!-- Sales Revenue -->
        <tr style="background: #f0f9ff;" class="sales-row">
            <td style="padding: 10px; font-weight: 600; position: sticky; left: 0; background: #f0f9ff;">
                📈 Sales Revenue (Gesamt)
            </td>
            ${renderValueCells(result, jahre, 'sales_revenue', 'primary')}
        </tr>
        
        <!-- Material Costs -->
        <tr class="cost-row">
            <td style="padding: 8px 8px 8px 24px; color: var(--gray);">
                └─ Material Costs
            </td>
            ${renderValueCells(result, jahre, 'material_costs', 'danger', true)}
        </tr>
        
        <!-- Direct Labour -->
        <tr class="cost-row">
            <td style="padding: 8px 8px 8px 24px; color: var(--gray);">
                └─ Direct Labour
            </td>
            ${renderValueCells(result, jahre, 'direct_labour', 'danger', true)}
        </tr>
        
        <!-- DB1 -->
        <tr style="background: #e0e7ff; font-weight: 600;" class="db1-row">
            <td style="padding: 10px; position: sticky; left: 0; background: #e0e7ff;">
                = ${UI_LABELS.db_stufen.db1}
            </td>
            ${renderValueCells(result, jahre, 'db1', 'primary')}
        </tr>
        <tr style="font-size: 10px; color: var(--gray);" class="db1-margin-row">
            <td style="padding: 4px 8px 4px 32px;">DB1 Margin %</td>
            ${renderMarginCells(result, jahre, 'db1')}
        </tr>
        
        <!-- Material Overhead -->
        <tr class="cost-row db2-section">
            <td style="padding: 8px 8px 8px 24px; color: var(--gray);">
                └─ Material Overhead
            </td>
            ${renderValueCells(result, jahre, 'material_overhead', 'danger', true)}
        </tr>
        
        <!-- Manufacturing Overhead -->
        <tr class="cost-row db2-section">
            <td style="padding: 8px 8px 8px 24px; color: var(--gray);">
                └─ Manufacturing Overhead
            </td>
            ${renderValueCells(result, jahre, 'manufacturing_overhead', 'danger', true)}
        </tr>
        
        <!-- DB2 - WICHTIG! -->
        <tr style="background: #dbeafe; font-weight: 600;" class="db2-row">
            <td style="padding: 10px; position: sticky; left: 0; background: #dbeafe;">
                = ${UI_LABELS.db_stufen.db2}
            </td>
            ${renderValueCells(result, jahre, 'db2', 'success')}
        </tr>
        <tr style="font-size: 10px; color: var(--gray);" class="db2-margin-row">
            <td style="padding: 4px 8px 4px 32px;">Manufacturing Margin %</td>
            ${renderMarginCells(result, jahre, 'db2')}
        </tr>
        
        <!-- Development Overhead -->
        <tr class="cost-row db3-section">
            <td style="padding: 8px 8px 8px 24px; color: var(--gray);">
                └─ Development Overhead
                <a href="#projekt-tab-projektkosten" 
                   style="font-size: 10px; color: var(--primary); margin-left: 6px;">
                    [aus Projektkosten]
                </a>
            </td>
            ${renderValueCells(result, jahre, 'development_overhead', 'danger', true)}
        </tr>
        
        <!-- DB3 -->
        <tr style="background: #fef3c7; font-weight: 600;" class="db3-row">
            <td style="padding: 10px; position: sticky; left: 0; background: #fef3c7;">
                = ${UI_LABELS.db_stufen.db3}
            </td>
            ${renderValueCells(result, jahre, 'db3', 'warning')}
        </tr>
        
        <!-- Selling Overhead -->
        <tr class="cost-row db4-section">
            <td style="padding: 8px 8px 8px 24px; color: var(--gray);">
                └─ Selling Overhead
            </td>
            ${renderValueCells(result, jahre, 'selling_overhead', 'danger', true)}
        </tr>
        
        <!-- Marketing Overhead -->
        <tr class="cost-row db4-section">
            <td style="padding: 8px 8px 8px 24px; color: var(--gray);">
                └─ Marketing Overhead
            </td>
            ${renderValueCells(result, jahre, 'marketing_overhead', 'danger', true)}
        </tr>
        
        <!-- DB4 -->
        <tr style="background: #f3e8ff; font-weight: 600;" class="db4-row">
            <td style="padding: 10px; position: sticky; left: 0; background: #f3e8ff;">
                = ${UI_LABELS.db_stufen.db4}
            </td>
            ${renderValueCells(result, jahre, 'db4', 'purple')}
        </tr>
        
        <!-- Distribution Overhead -->
        <tr class="cost-row db5-section">
            <td style="padding: 8px 8px 8px 24px; color: var(--gray);">
                └─ Distribution Overhead
            </td>
            ${renderValueCells(result, jahre, 'distribution_overhead', 'danger', true)}
        </tr>
        
        <!-- Administration Overhead -->
        <tr class="cost-row db5-section">
            <td style="padding: 8px 8px 8px 24px; color: var(--gray);">
                └─ Administration Overhead
            </td>
            ${renderValueCells(result, jahre, 'admin_overhead', 'danger', true)}
        </tr>
        
<!-- DB5 -->
        <tr style="background: #e0f2fe; font-weight: 600;" class="db5-row">
            <td style="padding: 10px; position: sticky; left: 0; background: #e0f2fe;">
                = ${UI_LABELS.db_stufen.db5}
            </td>
            ${renderValueCells(result, jahre, 'db5', 'info')}
        </tr>
        
        <!-- ========================================== -->
        <!-- ✅ NEU: Other Operating Items -->
        <!-- ========================================== -->
        
        <!-- Other Operating Income -->
        <tr style="background: #d1fae5;" class="other-income-row">
            <td style="padding: 10px; font-weight: 600; position: sticky; left: 0; background: #d1fae5;">
                + ${UI_LABELS.kostenarten.other_operating_income}
                <a href="#projekt-tab-projektkosten" 
                   style="font-size: 10px; color: var(--primary); margin-left: 6px;">
                    [aus Projektkosten]
                </a>
            </td>
            ${renderValueCells(result, jahre, 'other_operating_income', 'success', false)}
        </tr>
        
        <!-- Other Operating Expenses -->
        <tr class="other-expenses-row">
            <td style="padding: 8px 8px 8px 24px; color: var(--gray);">
                └─ ${UI_LABELS.kostenarten.other_operating_expenses}
                <a href="#projekt-tab-projektkosten" 
                   style="font-size: 10px; color: var(--primary); margin-left: 6px;">
                    [aus Projektkosten]
                </a>
            </td>
            ${renderValueCells(result, jahre, 'other_operating_expenses', 'danger', true)}
        </tr>
        
        <!-- EBIT - FINALE ZEILE -->
        <tr style="background: linear-gradient(to right, #10b981, #059669); color: white; font-weight: 600;" 
            class="ebit-row">
            <td style="padding: 12px; position: sticky; left: 0; 
                       background: linear-gradient(to right, #10b981, #059669);">
                = ${UI_LABELS.db_stufen.ebit}
            </td>
            ${renderValueCells(result, jahre, 'ebit', 'white')}
        </tr>
        <tr style="font-size: 10px; color: var(--gray); background: #f0fdf4;" class="ebit-margin-row">
            <td style="padding: 4px 8px 4px 32px;">EBIT Margin %</td>
            ${renderMarginCells(result, jahre, 'ebit')}
        </tr>
    `;
}

/**
 * Render value cells for a specific field
 * 
 * @param {Object} result - Calculation result
 * @param {Array} jahre - Years
 * @param {string} field - Field name
 * @param {string} color - Color class
 * @param {boolean} isNegative - Whether to show as negative (red)
 * @returns {string} HTML
 * 
 * @private
 */
function renderValueCells(result, jahre, field, color = 'inherit', isNegative = false) {
    let total = 0;
    const colorStyle = isNegative ? 'color: var(--danger);' : '';
    
    let html = jahre.map(jahr => {
        const value = result.jahre[jahr]?.[field] || 0;
        total += value;
        return `
            <td style="padding: 10px; text-align: right; ${colorStyle}">
                ${helpers.formatCurrency(value)}
            </td>
        `;
    }).join('');
    
    html += `
        <td style="padding: 10px; text-align: right; font-weight: bold; 
                   background: #f1f5f9; ${colorStyle}">
            ${helpers.formatCurrency(total)}
        </td>
    `;
    
    return html;
}

/**
 * Render margin percentage cells
 * 
 * @param {Object} result - Calculation result
 * @param {Array} jahre - Years
 * @param {string} baseField - Base field (db1, db2, ebit)
 * @returns {string} HTML
 * 
 * @private
 */
function renderMarginCells(result, jahre, baseField) {
    let totalRevenue = 0;
    let totalBase = 0;
    
    let html = jahre.map(jahr => {
        const revenue = result.jahre[jahr]?.sales_revenue || 0;
        const value = result.jahre[jahr]?.[baseField] || 0;
        const margin = revenue > 0 ? (value / revenue * 100) : 0;
        
        totalRevenue += revenue;
        totalBase += value;
        
        const color = margin >= 0 ? 'var(--success)' : 'var(--danger)';
        
        return `
            <td style="padding: 4px 8px; text-align: right; color: ${color};">
                ${margin.toFixed(1)}%
            </td>
        `;
    }).join('');
    
    const avgMargin = totalRevenue > 0 ? (totalBase / totalRevenue * 100) : 0;
    const avgColor = avgMargin >= 0 ? 'var(--success)' : 'var(--danger)';
    
    html += `
        <td style="padding: 4px 8px; text-align: right; background: #f1f5f9; 
                   font-weight: 600; color: ${avgColor};">
            ${avgMargin.toFixed(1)}%
        </td>
    `;
    
    return html;
}

/**
 * Render KPI dashboard
 * 
 * @param {Object} kpis - KPI data
 * @param {string} artikelTyp - Article type for benchmarking
 * @returns {string} HTML
 * 
 * @private
 */
function renderKPIDashboard(result, kpis, artikelTyp) {
    const benchmark = BRANCHEN_BENCHMARKS[artikelTyp] || BRANCHEN_BENCHMARKS['Software'];
    
    // Check if we're in filter mode
    const isFiltered = window.cfoDashboard?.artikelFilter;
    
    return `
        ${!isFiltered ? renderProduktVergleich(result) : ''}
        
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="font-size: 14px; font-weight: 600; margin: 0;">
                    📊 Key Performance Indicators ${isFiltered ? '(Einzelprodukt - nur DB2 relevant)' : '(Projekt-Gesamt)'}
                </h4>
                <div style="font-size: 11px; color: var(--gray);">
                    Benchmark: ${artikelTyp || 'Software'} Industrie
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
                ${renderKPICard(
                    'Manufacturing Margin Ø',
                    kpis.avg_manufacturing_margin,
                    '%',
                    benchmark.manufacturing_margin,
                    'primary'
                )}
                ${!isFiltered ? renderKPICard(
                    'EBIT Margin Ø',
                    kpis.avg_ebit_margin,
                    '%',
                    benchmark.ebit_margin,
                    'success'
                ) : `<div style="background: #f3f4f6; padding: 14px; border-radius: 6px; 
                                 border: 1px dashed #d1d5db; opacity: 0.5;">
                    <div style="font-size: 10px; color: var(--gray); margin-bottom: 6px; 
                                text-transform: uppercase; letter-spacing: 0.5px;">
                        EBIT MARGIN Ø
                    </div>
                    <div style="font-size: 16px; font-weight: bold; color: var(--gray);">
                        N/A
                    </div>
                    <div style="font-size: 9px; color: var(--gray); margin-top: 4px;">
                        Nur in Projekt-Sicht
                    </div>
                </div>`}
                ${!isFiltered ? renderKPICard(
                    'Break-Even',
                    kpis.break_even_year || 'N/A',
                    '',
                    null,
                    'warning'
                ) : `<div style="background: #f3f4f6; padding: 14px; border-radius: 6px; 
                                 border: 1px dashed #d1d5db; opacity: 0.5;">
                    <div style="font-size: 10px; color: var(--gray); margin-bottom: 6px;">
                        BREAK-EVEN
                    </div>
                    <div style="font-size: 16px; font-weight: bold; color: var(--gray);">
                        N/A
                    </div>
                    <div style="font-size: 9px; color: var(--gray); margin-top: 4px;">
                        Nur in Projekt-Sicht
                    </div>
                </div>`}
                ${!isFiltered ? renderKPICard(
                    'NPV (8% WACC)',
                    kpis.npv / 1000000,
                    'M€',
                    null,
                    'info'
                ) : `<div style="background: #f3f4f6; padding: 14px; border-radius: 6px; 
                                 border: 1px dashed #d1d5db; opacity: 0.5;">
                    <div style="font-size: 10px; color: var(--gray); margin-bottom: 6px;">
                        NPV (8% WACC)
                    </div>
                    <div style="font-size: 16px; font-weight: bold; color: var(--gray);">
                        N/A
                    </div>
                    <div style="font-size: 9px; color: var(--gray); margin-top: 4px;">
                        Nur in Projekt-Sicht
                    </div>
                </div>`}
                ${!isFiltered ? renderKPICard(
                    'IRR',
                    kpis.irr,
                    '%',
                    null,
                    'purple'
                ) : `<div style="background: #f3f4f6; padding: 14px; border-radius: 6px; 
                                 border: 1px dashed #d1d5db; opacity: 0.5;">
                    <div style="font-size: 10px; color: var(--gray); margin-bottom: 6px;">
                        IRR
                    </div>
                    <div style="font-size: 16px; font-weight: bold; color: var(--gray);">
                        N/A
                    </div>
                    <div style="font-size: 9px; color: var(--gray); margin-top: 4px;">
                        Nur in Projekt-Sicht
                    </div>
                </div>`}
            </div>
        </div>
    `;
}

/**
 * Render product comparison table (DB2 focus)
 * Shows all articles side-by-side for profitability comparison
 * 
 * @param {Object} result - Calculation result
 * @returns {string} HTML
 * 
 * @private
 */
function renderProduktVergleich(result) {
    const projektId = window.cfoDashboard.currentProjekt;
    const artikelListe = state.getArtikelByProjekt(projektId);
    
    if (!artikelListe || artikelListe.length === 0) {
        return '';
    }
    
    // Calculate per-article metrics
    const artikelMetrics = artikelListe.map(artikel => {
        const jahre = Object.keys(result.jahre).sort();
        let totalRevenue = 0;
        let totalHK = 0;
        
        jahre.forEach(jahr => {
            const yearNum = parseInt(jahr);
            const menge = artikel.volumes?.[yearNum] || 0;
            const preis = artikel.prices?.[yearNum] || 0;
            const hk = artikel.hk || 0;
            
            totalRevenue += menge * preis;
            totalHK += menge * hk;
        });
        
        const db2 = totalRevenue - totalHK;
        const db2_prozent = totalRevenue > 0 ? (db2 / totalRevenue * 100) : 0;
        
        return {
            id: artikel.id,
            name: artikel.name,
            typ: artikel.typ,
            revenue: totalRevenue,
            hk: totalHK,
            db2: db2,
            db2_prozent: db2_prozent
        };
    });
    
    // Sort by DB2 absolute
    artikelMetrics.sort((a, b) => b.db2 - a.db2);
    
    return `
        <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; 
                    border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-size: 14px; font-weight: 600; margin: 0;">
                    🏆 Produkt-Profitabilität (DB2-Vergleich)
                </h4>
                <div style="font-size: 11px; color: var(--gray);">
                    Sortiert nach DB2 absolut
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 10px; text-align: left; font-weight: 600;">Artikel</th>
                        <th style="padding: 10px; text-align: right; font-weight: 600;">Umsatz</th>
                        <th style="padding: 10px; text-align: right; font-weight: 600;">HK</th>
                        <th style="padding: 10px; text-align: right; font-weight: 600;">DB2</th>
                        <th style="padding: 10px; text-align: right; font-weight: 600;">DB2 %</th>
                        <th style="padding: 10px; text-align: center; font-weight: 600;">Bewertung</th>
                    </tr>
                </thead>
                <tbody>
                    ${artikelMetrics.map((artikel, index) => {
                        const isTop = index === 0;
                        const rowColor = isTop ? '#f0fdf4' : 'white';
                        const badge = artikel.db2_prozent >= 60 ? '🌟 Exzellent' :
                                     artikel.db2_prozent >= 40 ? '✅ Gut' :
                                     artikel.db2_prozent >= 20 ? '⚠️ Okay' : '❌ Kritisch';
                        
                        return `
                            <tr style="background: ${rowColor}; border-bottom: 1px solid #f3f4f6;">
                                <td style="padding: 12px;">
                                    ${isTop ? '<span style="color: #f59e0b; margin-right: 6px;">🏆</span>' : ''}
                                    <span style="font-weight: 500;">${artikel.name}</span>
                                    <div style="font-size: 10px; color: var(--gray); margin-top: 2px;">
                                        <span style="color: ${getTypeColor(artikel.typ)};">●</span> ${artikel.typ}
                                    </div>
                                </td>
                                <td style="padding: 12px; text-align: right; font-weight: 500;">
                                    ${helpers.formatCurrency(artikel.revenue)}
                                </td>
                                <td style="padding: 12px; text-align: right; color: var(--danger);">
                                    ${helpers.formatCurrency(artikel.hk)}
                                </td>
                                <td style="padding: 12px; text-align: right; font-weight: 600; color: var(--success);">
                                    ${helpers.formatCurrency(artikel.db2)}
                                </td>
                                <td style="padding: 12px; text-align: right; font-weight: 600; font-size: 14px; 
                                           color: ${artikel.db2_prozent >= 40 ? 'var(--success)' : 'var(--warning)'};">
                                    ${artikel.db2_prozent.toFixed(1)}%
                                </td>
                                <td style="padding: 12px; text-align: center; font-size: 11px;">
                                    ${badge}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                    <tr style="background: #1e3a8a; color: white; font-weight: 600;">
                        <td style="padding: 12px;">SUMME (Projekt-Gesamt)</td>
                        <td style="padding: 12px; text-align: right;">
                            ${helpers.formatCurrency(artikelMetrics.reduce((sum, a) => sum + a.revenue, 0))}
                        </td>
                        <td style="padding: 12px; text-align: right;">
                            ${helpers.formatCurrency(artikelMetrics.reduce((sum, a) => sum + a.hk, 0))}
                        </td>
                        <td style="padding: 12px; text-align: right;">
                            ${helpers.formatCurrency(artikelMetrics.reduce((sum, a) => sum + a.db2, 0))}
                        </td>
                        <td style="padding: 12px; text-align: right;">
                            ${((artikelMetrics.reduce((sum, a) => sum + a.db2, 0) / 
                               artikelMetrics.reduce((sum, a) => sum + a.revenue, 0)) * 100).toFixed(1)}%
                        </td>
                        <td style="padding: 12px;"></td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 12px; padding: 10px; background: #f0f9ff; border-radius: 4px; 
                        font-size: 11px; color: var(--text);">
                💡 <strong>Hinweis:</strong> DB2 (Manufacturing Margin) ist die letzte sinnvolle Vergleichsebene 
                für Produktentscheidungen, da Projektkosten (Entwicklung, Marketing, Vertrieb) nicht 
                eindeutig einzelnen Produkten zuordenbar sind.
            </div>
        </div>
    `;
}

/**
 * Render single KPI card
 * 
 * @param {string} label - KPI label
 * @param {number} value - KPI value
 * @param {string} unit - Unit (%, €, etc.)
 * @param {Object} benchmark - Optional benchmark data
 * @param {string} color - Color theme
 * @returns {string} HTML
 * 
 * @private
 */
function renderKPICard(label, value, unit, benchmark, color) {
    const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
    
    let benchmarkHTML = '';
    if (benchmark) {
        const comparison = value >= benchmark.median ? '↑' : '↓';
        const comparisonColor = value >= benchmark.median ? 'var(--success)' : 'var(--danger)';
        benchmarkHTML = `
            <div style="font-size: 10px; color: var(--gray); margin-top: 4px;">
                Median: ${benchmark.median}${unit}
                <span style="color: ${comparisonColor}; margin-left: 4px;">${comparison}</span>
            </div>
        `;
    }
    
    return `
        <div style="background: white; padding: 14px; border-radius: 6px; 
                    border: 1px solid var(--border); position: relative;">
            <div style="font-size: 10px; color: var(--gray); margin-bottom: 6px; 
                        text-transform: uppercase; letter-spacing: 0.5px;">
                ${label}
            </div>
            <div style="font-size: 24px; font-weight: bold; color: var(--${color});">
                ${displayValue}${unit}
            </div>
            ${benchmarkHTML}
        </div>
    `;
}

/**
 * Render action buttons
 * 
 * @returns {string} HTML
 * 
 * @private
 */
function renderActionButtons() {
    return `
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button onclick="window.analyzeWirtschaftlichkeit()" 
                    class="btn btn-secondary"
                    style="display: flex; align-items: center; gap: 8px;">
                <span>🤖</span>
                <span>KI-Analyse starten</span>
            </button>
            <button onclick="window.saveProjektWirtschaftlichkeit()" 
                    class="btn btn-primary"
                    style="display: flex; align-items: center; gap: 8px;">
                <span>💾</span>
                <span>Speichern</span>
            </button>
        </div>
    `;
}

// ========================================
// STATE FUNCTIONS
// ========================================

/**
 * Get default HK-Aufteilung based on article type
 * 
 * @param {string} typ - Article type
 * @returns {Object} HK split
 * 
 * @private
 */
function getDefaultHKAufteilung(typ) {
    const defaults = HK_DEFAULTS[typ] || HK_DEFAULTS['Default'];
    
    return {
        material_prozent: defaults.material,
        fertigung_prozent: defaults.fertigung,
        overhead_prozent: defaults.overhead,
        quelle: 'ki-default',
        letzteAenderung: new Date().toISOString()
    };
}

/**
 * Get color for article type
 * 
 * @param {string} typ - Article type
 * @returns {string} Color
 * 
 * @private
 */
function getTypeColor(typ) {
    const colors = {
        'Hardware': '#3b82f6',
        'Software': '#8b5cf6',
        'Service': '#10b981',
        'Default': '#6b7280'
    };
    return colors[typ] || colors['Default'];
}

// ========================================
// LOADING & ERROR STATES
// ========================================

/**
 * Create loading state
 * 
 * @returns {string} HTML
 * 
 * @private
 */
function createLoadingState() {
    return `
        <div style="display: flex; align-items: center; justify-content: center; 
                    padding: 60px; background: white; border-radius: 8px;">
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 14px; color: var(--gray);">
                    Berechne Wirtschaftlichkeit...
                </div>
            </div>
        </div>
    `;
}

/**
 * Render empty data state
 * 
 * @returns {string} HTML
 * 
 * @private
 */
function renderEmptyDataState() {
    return `
        <div style="background: white; padding: 40px; border-radius: 8px; 
                    text-align: center; border: 1px solid var(--border);">
            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                Keine Daten vorhanden
            </div>
            <div style="font-size: 13px; color: var(--gray); margin-bottom: 20px;">
                Bitte legen Sie zunächst Artikel mit Mengen und Preisen an.
            </div>
            <button onclick="window.location.hash='#artikel'" 
                    class="btn btn-primary">
                Zu den Artikeln
            </button>
        </div>
    `;
}

/**
 * Render error state
 * 
 * @param {Error} error - Error object
 * @returns {string} HTML
 * 
 * @private
 */
function renderErrorState(error) {
    return `
        <div style="background: #fee; padding: 20px; border-radius: 8px; border: 1px solid #f00;">
            <div style="font-size: 18px; font-weight: 600; color: var(--danger); margin-bottom: 8px;">
                ❌ Fehler beim Laden der Wirtschaftlichkeit
            </div>
            <div style="font-size: 13px; color: var(--gray); margin-bottom: 16px;">
                ${error.message}
            </div>
            <button onclick="location.reload()" class="btn btn-secondary">
                Seite neu laden
            </button>
        </div>
    `;
}

// ========================================
// EVENT HANDLERS
// ========================================

/**
 * Initialize event handlers
 * 
 * @private
 */
function initializeEventHandlers() {
    // View level filter
    const viewLevel = document.getElementById('view-level');
    if (viewLevel) {
        viewLevel.addEventListener('change', handleViewLevelChange);
    }
    
    // Article filter buttons
    const filterButtons = document.querySelectorAll('.artikel-filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const artikelId = this.getAttribute('data-artikel-id');
            window.filterArtikel(artikelId === 'null' ? null : artikelId);
        });
    });
    
    // ✅ NEU: Szenario buttons
const szenarioButtons = document.querySelectorAll('.szenario-btn');
szenarioButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const buttonId = this.id.replace('szenario-', '');
        console.log('🎯 Szenario button clicked:', buttonId);
        
        // ✅ MAP button ID to preset ID
        const szenarioMapping = {
            'base': 'base',
            'best': 'best-organic',
            'worst': 'worst-conservative',
            'custom': 'custom'
        };
        
        const szenarioId = szenarioMapping[buttonId];
        console.log('📊 Mapped to preset:', szenarioId);
        
        if (buttonId === 'custom') {
            // Open custom builder
            if (typeof window.openSzenarioBuilder === 'function') {
                window.openSzenarioBuilder();
            } else {
                console.warn('⚠️ window.openSzenarioBuilder not found');
                alert('Custom Builder wird noch implementiert');
            }
        } else {
            // Switch to scenario
            if (typeof window.selectSzenario === 'function') {
                window.selectSzenario(szenarioId);  // ✅ Verwendet gemappte ID
            } else {
                console.warn('⚠️ window.selectSzenario not found');
                alert(`Szenario "${szenarioId}" wird geladen...`);
            }
        }
    });
});
    
    // Restore active filter button state after re-render
    const activeFilter = window.cfoDashboard?.artikelFilter;
    if (activeFilter) {
        // Update button states
        document.querySelectorAll('.artikel-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'white';
            btn.style.color = '#374151';
            btn.style.border = '1px solid #e5e7eb';
            btn.style.fontWeight = '500';
        });
        
        const targetBtn = document.getElementById(`filter-${activeFilter}`);
        if (targetBtn) {
            targetBtn.classList.add('active');
            targetBtn.style.background = '#1e3a8a';
            targetBtn.style.color = 'white';
            targetBtn.style.border = '2px solid #1e3a8a';
            targetBtn.style.fontWeight = '600';
        }
    } else {
        // Ensure "Alle" is active
        const alleBtn = document.getElementById('filter-alle');
        if (alleBtn) {
            alleBtn.classList.add('active');
            alleBtn.style.background = '#1e3a8a';
            alleBtn.style.color = 'white';
            alleBtn.style.border = '2px solid #1e3a8a';
            alleBtn.style.fontWeight = '600';
        }
    }
    
    // ✅ Overhead config toggle
    const toggleBtn = document.getElementById('toggle-overhead-config');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const content = document.getElementById('overhead-config-content');
            const icon = document.getElementById('toggle-icon');
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.textContent = '▲';
            } else {
                content.style.display = 'none';
                icon.textContent = '▼';
            }
        });
    }
    
    console.log('✅ Event handlers initialized');
}

/**
 * Handle view level change (show/hide DB sections)
 * 
 * @param {Event} event - Change event
 * 
 * @private
 */
function handleViewLevelChange(event) {
    const level = event.target.value;
    
    const sections = {
        'db2': ['.db3-section', '.db4-section', '.db5-section', '.ebit-row', '.ebit-margin-row'],
        'db5': ['.ebit-row', '.ebit-margin-row'],
        'ebit': ['.db1-row', '.db1-margin-row', '.db2-section', '.db2-row', '.db2-margin-row',
                 '.db3-section', '.db3-row', '.db4-section', '.db4-row', 
                 '.db5-section', '.db5-row'],
        'all': []
    };
    
    // Reset all
    document.querySelectorAll('.db2-section, .db3-section, .db4-section, .db5-section, ' +
                              '.db1-row, .db1-margin-row, .db2-row, .db2-margin-row, ' +
                              '.db3-row, .db4-row, .db5-row, .ebit-row, .ebit-margin-row')
        .forEach(el => el.style.display = '');
    
    // Hide selected sections
    if (sections[level]) {
        sections[level].forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.style.display = 'none');
        });
    }
}

// ========================================
// WINDOW FUNCTIONS
// ========================================

/**
 * Open HK configuration modal
 * 
 * @public
 */
window.openHKConfig = function() {
    const artikelId = window.cfoDashboard.currentArtikel;
    const artikel = state.getArtikel(artikelId);
    
    if (!artikel) {
        alert('Kein Artikel ausgewählt');
        return;
    }
    
    // TODO: Implement HK config modal
    console.log('Opening HK config for', artikel.name);
    alert('HK-Konfiguration wird noch implementiert');
};

/**
 * Show article details modal
 * 
 * @public
 */
window.showArtikelDetails = function() {
    const projektId = window.cfoDashboard.currentProjekt;
    const artikelListe = state.getArtikelByProjekt(projektId);
    
    // TODO: Implement details modal
    console.log('Showing details for', artikelListe.length, 'articles');
    alert(`${artikelListe.length} Artikel vorhanden`);
};

/**
 * Export profitability to Excel
 * 
 * @public
 */
window.exportWirtschaftlichkeit = function() {
    // TODO: Implement Excel export
    alert('Excel-Export wird noch implementiert');
};

/**
 * Run AI analysis on profitability
 * 
 * @public
 */
window.analyzeWirtschaftlichkeit = async function() {
    // TODO: Implement AI analysis
    alert('KI-Analyse wird noch implementiert');
};

/**
 * Save profitability data
 * 
 * @public
 */
window.saveProjektWirtschaftlichkeit = function() {
    const projektId = window.cfoDashboard.currentProjekt;
    
    // Data is already saved in calculator
    // This is more for explicit user confirmation
    
    alert('Wirtschaftlichkeits-Daten gespeichert');
};

/**
 * Filter artikel and gray out DB3-EBIT when single article selected
 * 
 * @param {string|null} artikelId - Article ID to filter, or null for all
 * 
 * @public
 */
window.filterArtikel = function(artikelId) {
    console.log('🔍 Filtering to artikel:', artikelId || 'ALLE');
    
    // Store filter state
    window.cfoDashboard = window.cfoDashboard || {};
    window.cfoDashboard.artikelFilter = artikelId;
    
    // ✅ WICHTIG: Clear scenario cache when filter changes
    window.currentSzenarioResult = null;
    window.currentActiveSzenarioId = 'base';  // Reset to base
    
    // Re-render with filter applied
    renderProjektWirtschaftlichkeit();
};

/**
 * Gray out or restore DB3-EBIT rows
 * 
 * @param {boolean} shouldGray - True to gray out, false to restore
 * 
 * @private
 */
function grayOutProjectCostRows(shouldGray) {
    const rowsToGray = [
        '.db3-section',
        '.db3-row',
        '.db4-section',
        '.db4-row',
        '.db5-section',
        '.db5-row',
        '.other-income-row',      // ✅ NEU
        '.other-expenses-row',    // ✅ NEU
        '.ebit-row',
        '.ebit-margin-row'
    ];
    
    rowsToGray.forEach(selector => {
        document.querySelectorAll(selector).forEach(row => {
            if (shouldGray) {
                row.style.opacity = '0.3';
                row.style.pointerEvents = 'none';
                row.style.position = 'relative';
                
                // Add overlay tooltip
                if (!row.querySelector('.gray-overlay')) {
                    const overlay = document.createElement('div');
                    overlay.className = 'gray-overlay';
                    overlay.style.cssText = `
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        cursor: not-allowed;
                    `;
                    overlay.title = 'Projektkosten sind nicht artikelspezifisch zuordenbar. Wechseln Sie zur Projekt-Gesamtsicht.';
                    row.appendChild(overlay);
                }
            } else {
                row.style.opacity = '1';
                row.style.pointerEvents = 'auto';
                
                // Remove overlay
                const overlay = row.querySelector('.gray-overlay');
                if (overlay) {
                    overlay.remove();
                }
            }
        });
    });
}

/**
 * Update view level (legacy compatibility)
 * 
 * @public
 */
window.updateViewLevel = function() {
    const viewLevel = document.getElementById('view-level');
    if (viewLevel) {
        handleViewLevelChange({ target: viewLevel });
    }
};

// ==========================================
// ✅ NEU: Overhead Settings Functions
// ==========================================

/**
 * Save overhead settings to projekt
 * 
 * @public
 */
window.saveOverheadSettings = function() {
    const projektId = window.cfoDashboard.currentProjekt;
    const projekt = state.getProjekt(projektId);
    
    if (!projekt) {
        alert('Kein Projekt ausgewählt');
        return;
    }
    
    // Get values from inputs
    const settings = {
        development_percent: parseFloat(document.getElementById('overhead-development').value) || 15,
        selling_marketing_percent: parseFloat(document.getElementById('overhead-selling-marketing').value) || 15,
        admin_distribution_percent: parseFloat(document.getElementById('overhead-admin-distribution').value) || 8,
        other_expenses_percent: parseFloat(document.getElementById('overhead-other-expenses').value) || 2
    };
    
    // Validate
    if (settings.development_percent < 0 || settings.development_percent > 50) {
        alert('Development Overhead muss zwischen 0% und 50% liegen');
        return;
    }
    if (settings.selling_marketing_percent < 0 || settings.selling_marketing_percent > 50) {
        alert('Sales & Marketing Overhead muss zwischen 0% und 50% liegen');
        return;
    }
    if (settings.admin_distribution_percent < 0 || settings.admin_distribution_percent > 30) {
        alert('Admin & Distribution Overhead muss zwischen 0% und 30% liegen');
        return;
    }
    if (settings.other_expenses_percent < 0 || settings.other_expenses_percent > 10) {
        alert('Other Expenses muss zwischen 0% und 10% liegen');
        return;
    }
    
    // Save to projekt
    projekt.overheadSettings = settings;

    // ✅ Korrekte Save-Funktion
    if (typeof state.updateProjekt === 'function') {
        state.updateProjekt(projektId, projekt);
    } else if (typeof state.saveProjekt === 'function') {
        state.saveProjekt(projekt);
    } else {
        // Fallback: Direct assignment (für lokale Tests)
        console.warn('⚠️ Keine Save-Funktion gefunden - using direct assignment');
        const allProjects = state.getAllProjekte();
        const index = allProjects.findIndex(p => p.id === projektId);
        if (index !== -1) {
            allProjects[index] = projekt;
        }
    }
    
    alert('✅ Overhead-Einstellungen gespeichert! Die Änderungen werden beim nächsten Neuberechnen verwendet.');
    
    // Re-calculate and re-render
    renderProjektWirtschaftlichkeit();
};

/**
 * Reset overhead settings to defaults
 * 
 * @public
 */
window.resetOverheadDefaults = function() {
    if (confirm('Möchten Sie wirklich alle Overhead-Einstellungen auf die Standardwerte zurücksetzen?')) {
        document.getElementById('overhead-development').value = 15;
        document.getElementById('overhead-selling-marketing').value = 15;
        document.getElementById('overhead-admin-distribution').value = 8;
        document.getElementById('overhead-other-expenses').value = 2;
        
        alert('✅ Werte wurden zurückgesetzt. Klicken Sie auf "Speichern" um zu übernehmen.');
    }
};

// ==========================================
// ✅ NEU: Base Case Management Functions
// ==========================================

/**
 * Toggle Base Case details panel
 * 
 * @public
 */
window.toggleBaseCaseDetails = function() {
    const detailsPanel = document.getElementById('base-case-details');
    const toggleIcon = document.getElementById('base-case-toggle-icon');
    
    if (!detailsPanel) return;
    
    if (detailsPanel.style.display === 'none') {
        detailsPanel.style.display = 'block';
        toggleIcon.textContent = '▲ Details ausblenden';
    } else {
        detailsPanel.style.display = 'none';
        toggleIcon.textContent = '▼ Details anzeigen';
    }
};

/**
 * Update fallback value from slider
 * 
 * @param {string} category - Cost category
 * @param {number} value - New value
 * 
 * @public
 */
window.updateFallbackValue = function(category, value) {
    const valueInput = document.getElementById(`fallback-${category}-value`);
    if (valueInput) {
        valueInput.value = value;
    }
    
    // TODO: Trigger live update of table
    console.log(`📊 Fallback ${category} updated to ${value}%`);
};

/**
 * Update fallback slider from input
 * 
 * @param {string} category - Cost category
 * @param {number} value - New value
 * 
 * @public
 */
window.updateFallbackSlider = function(category, value) {
    const slider = document.getElementById(`fallback-${category}`);
    if (slider) {
        slider.value = value;
    }
    
    // TODO: Trigger live update of table
    console.log(`📊 Fallback ${category} slider updated to ${value}%`);
};

/**
 * Save Base Case to database
 * 
 * @public
 */
window.saveBaseCase = async function() {
    const projektId = window.cfoDashboard.currentProjekt;
    const projekt = state.getProjekt(projektId);
    
    if (!projekt) {
        alert('❌ Kein Projekt ausgewählt');
        return;
    }
    
    // Collect fallback values
    const fallbackSettings = {
        development_percent: parseFloat(document.getElementById('fallback-development-value')?.value || 15),
        selling_percent: parseFloat(document.getElementById('fallback-selling-value')?.value || 10),
        marketing_percent: parseFloat(document.getElementById('fallback-marketing-value')?.value || 5),
        admin_percent: parseFloat(document.getElementById('fallback-admin-value')?.value || 5),
        distribution_percent: parseFloat(document.getElementById('fallback-distribution-value')?.value || 3)
    };
    
    // Save to projekt
    projekt.baseCaseFallbacks = fallbackSettings;
    projekt.baseCaseLastUpdated = new Date().toISOString();
    
    // Save via state
    try {
        if (typeof state.updateProjekt === 'function') {
            await state.updateProjekt(projektId, projekt);
        } else if (typeof state.saveProjekt === 'function') {
            await state.saveProjekt(projekt);
        }
        
        alert('✅ Base Case erfolgreich gespeichert!');
        
        // Re-render to apply changes
        renderProjektWirtschaftlichkeit();
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern:', error);
        alert('❌ Fehler beim Speichern des Base Case');
    }
};

// ==========================================
// ✅ NEU: BEST/WORST INLINE FUNCTIONS
// ==========================================

/**
 * Toggle Best inline details
 * 
 * @public
 */
window.toggleBestInlineDetails = function() {
    const detailsPanel = document.getElementById('best-inline-details');
    const toggleIcon = document.getElementById('best-inline-toggle-icon');
    
    if (!detailsPanel) return;
    
    if (detailsPanel.style.display === 'none') {
        detailsPanel.style.display = 'block';
        toggleIcon.textContent = '▲ Details ausblenden';
    } else {
        detailsPanel.style.display = 'none';
        toggleIcon.textContent = '▼ Details anzeigen';
    }
};

/**
 * Toggle Worst inline details
 * 
 * @public
 */
window.toggleWorstInlineDetails = function() {
    const detailsPanel = document.getElementById('worst-inline-details');
    const toggleIcon = document.getElementById('worst-inline-toggle-icon');
    
    if (!detailsPanel) return;
    
    if (detailsPanel.style.display === 'none') {
        detailsPanel.style.display = 'block';
        toggleIcon.textContent = '▲ Details ausblenden';
    } else {
        detailsPanel.style.display = 'none';
        toggleIcon.textContent = '▼ Details anzeigen';
    }
};

/**
 * Apply Best inline adjustments
 * 
 * @public
 */
window.applyBestInline = async function() {
    console.log('✅ Applying Best Case inline adjustments...');
    // TODO: Collect values and trigger recalculation
    alert('Best Case wird angewendet... (TODO: Live-Update)');
};

/**
 * Apply Worst inline adjustments
 * 
 * @public
 */
window.applyWorstInline = async function() {
    console.log('✅ Applying Worst Case inline adjustments...');
    // TODO: Collect values and trigger recalculation
    alert('Worst Case wird angewendet... (TODO: Live-Update)');
};


// ========================================
// EXPORTS
// ========================================

export default {
    renderWirtschaftlichkeit,
    renderProjektWirtschaftlichkeit
};
