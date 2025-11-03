/**
 * CFO Dashboard - Szenario-Analyse Module
 * Window Functions - UI Interactivity Layer
 * 
 * @module wirtschaftlichkeit/szenario-window-functions
 * @description Global window functions for scenario builder interactions
 * @author Senior Development Team
 * @version 1.0.0
 */

import { state } from '../../state.js';
import { calculateProjektWirtschaftlichkeit } from './calculator.js';
import { renderProjektWirtschaftlichkeit } from './wirtschaftlichkeit.js';
import { 
    renderSzenarioBuilder, 
    renderSzenarioSelector,
    renderSensitivityAnalysis,
    renderSzenarioComparison,
    getSzenarioFromBuilder 
} from './szenario-ui.js';
import szenarioCalculatorModule from './szenario-calculator.js';
import { 
    SZENARIO_PRESETS,
    SZENARIO_TEMPLATE,
    SENSITIVITY_PARAMS 
} from './szenario-constants.js';

// Destructure functions from module
const { applySzenario, calculateSensitivity, compareScenarios } = szenarioCalculatorModule;

// Global state
let activeSzenarioId = 'base';
let baseCalculationResult = null;
let customSzenarios = [];

/**
 * Initialize scenario analysis
 * Called when Wirtschaftlichkeit tab is loaded
 * 
 * @public
 */
window.initializeSzenarioAnalysis = async function() {
    const projektId = window.cfoDashboard.currentProjekt;
    
    try {
        // Calculate base case
        console.log('🔄 Calculating base case...');
        baseCalculationResult = await calculateProjektWirtschaftlichkeit(projektId, {
            wacc: 0.08,
            validateInputs: true
        });
        
        console.log('✅ Base case calculated:', baseCalculationResult);
        
        // Select base scenario by default
        activeSzenarioId = 'base';
        
    } catch (error) {
        console.error('❌ Error initializing scenario analysis:', error);
        alert('Fehler beim Initialisieren der Szenario-Analyse: ' + error.message);
    }
};

/**
 * Select and apply a scenario
 * 
 * @param {string} szenarioId - Scenario ID
 * 
 * @public
 */
window.selectSzenario = async function(szenarioId) {
    console.log('🎯 Selecting scenario:', szenarioId);
    
    const projektId = window.cfoDashboard.currentProjekt;
    const activeFilter = window.cfoDashboard?.artikelFilter;
    
    activeSzenarioId = szenarioId;
    
    try {
        let result;
        
        // ✅ WICHTIG: Calculate base case WITH current filter
        let baseForSzenario;
        
        if (activeFilter) {
            // Filter active: Calculate base ONLY for this article
            console.log(`🔍 Calculating base for filtered article: ${activeFilter}`);
            const artikelListe = state.getArtikelByProjekt(projektId);
            const filteredListe = artikelListe.filter(a => a.id === activeFilter);
            
            baseForSzenario = await calculateProjektWirtschaftlichkeit(projektId, {
                wacc: 0.08,
                validateInputs: true,
                filteredArtikel: filteredListe
            });
        } else {
            // No filter: Use cached base or calculate new
            if (!baseCalculationResult) {
                await window.initializeSzenarioAnalysis();
            }
            baseForSzenario = baseCalculationResult;
        }
        
        if (szenarioId === 'base') {
            // Use base calculation
            result = baseForSzenario;
        } else {
            // Apply scenario adjustments
            const preset = SZENARIO_PRESETS[szenarioId];
            if (!preset) {
                throw new Error(`Szenario ${szenarioId} nicht gefunden`);
            }
            
            console.log('⚙️ Applying scenario:', preset.name);
            result = applySzenario(baseForSzenario, preset.config);
        }
        
        // Update UI
        updateWirtschaftlichkeitWithSzenario(result);
        updateSzenarioSelector(szenarioId);
        
        console.log('✅ Scenario applied successfully');
        
    } catch (error) {
        console.error('❌ Error applying scenario:', error);
        alert('Fehler beim Anwenden des Szenarios: ' + error.message);
    }
};

/**
 * Open scenario builder modal
 * 
 * @public
 */
window.openSzenarioBuilder = function() {
    console.log('🏗️ Opening scenario builder...');
    
    // Render builder modal
    const builderHTML = renderSzenarioBuilder(SZENARIO_TEMPLATE);
    
    // Insert into DOM
    let modalContainer = document.getElementById('szenario-builder-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'szenario-builder-container';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = builderHTML;
    
    // Add CSS if not exists
    injectSzenarioCSS();
};

/**
 * Close scenario builder modal
 * 
 * @public
 */
window.closeSzenarioBuilder = function() {
    console.log('❌ Closing scenario builder...');
    
    const modalContainer = document.getElementById('szenario-builder-container');
    if (modalContainer) {
        modalContainer.remove();
    }
};

/**
 * Apply scenario from builder
 * 
 * @public
 */
window.applySzenarioFromBuilder = async function() {
    console.log('✅ Applying custom scenario from builder...');
    
    if (!baseCalculationResult) {
        await window.initializeSzenarioAnalysis();
    }
    
    try {
        // Get configuration from UI
        const customConfig = getSzenarioFromBuilder();
        
        console.log('⚙️ Custom config:', customConfig);
        
        // Apply scenario
        const result = applySzenario(baseCalculationResult, customConfig);
        
        // Update UI
        updateWirtschaftlichkeitWithSzenario(result);
        
        // Close builder
        window.closeSzenarioBuilder();
        
        // Update active scenario info
        activeSzenarioId = 'custom';
        updateSzenarioSelector('custom');
        
        console.log('✅ Custom scenario applied');
        
    } catch (error) {
        console.error('❌ Error applying custom scenario:', error);
        alert('Fehler beim Anwenden des Custom Szenarios: ' + error.message);
    }
};

/**
 * Save custom scenario
 * 
 * @public
 */
window.saveSzenario = function() {
    console.log('💾 Saving custom scenario...');
    
    try {
        const customConfig = getSzenarioFromBuilder();
        
        // Add to custom scenarios
        customSzenarios.push({
            id: `custom-${Date.now()}`,
            name: customConfig.name,
            config: customConfig,
            created: new Date().toISOString()
        });
        
        // Store in localStorage
        localStorage.setItem('albo_custom_scenarios', JSON.stringify(customSzenarios));
        
        alert(`Szenario "${customConfig.name}" erfolgreich gespeichert!`);
        
    } catch (error) {
        console.error('❌ Error saving scenario:', error);
        alert('Fehler beim Speichern: ' + error.message);
    }
};

/**
 * Reset scenario builder to defaults
 * 
 * @public
 */
window.resetSzenarioBuilder = function() {
    console.log('🔄 Resetting scenario builder...');
    
    if (confirm('Möchten Sie wirklich alle Anpassungen zurücksetzen?')) {
        window.closeSzenarioBuilder();
        window.openSzenarioBuilder();
    }
};

/**
 * Change mode for a parameter
 * 
 * @param {string} paramKey - Parameter key
 * @param {string} mode - New mode
 * 
 * @public
 */
window.changeSzenarioMode = function(paramKey, mode) {
    console.log(`🔧 Changing mode for ${paramKey} to ${mode}`);
    
    // Update button states
    const paramControl = document.querySelector(`[data-param-key="${paramKey}"]`);
    if (!paramControl) {
        return;
    }
    
    // Update mode buttons
    paramControl.querySelectorAll('.mode-btn').forEach(btn => {
        const btnMode = btn.dataset.mode;
        const isActive = btnMode === mode;
        
        btn.style.border = `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`;
        btn.style.background = isActive ? 'var(--primary)' : 'white';
        btn.style.color = isActive ? 'white' : 'var(--text)';
        btn.style.fontWeight = isActive ? '600' : '400';
    });
    
    // Show/hide slider
    const slider = document.getElementById(`slider-${paramKey}`);
    if (slider) {
        slider.style.display = mode === 'manual' ? 'block' : 'none';
    }
    
    // Update mode info
    const modeInfo = document.getElementById(`mode-info-${paramKey}`);
    if (modeInfo) {
        const infoTexts = {
            'fixed': '💡 Kosten bleiben unverändert',
            'auto': '🤖 Kosten folgen automatisch der Revenue-Entwicklung',
            'manual': '✏️ Manuelle Anpassung möglich'
        };
        modeInfo.textContent = infoTexts[mode] || '';
    }
};

/**
 * Update slider value from input
 * 
 * @param {string} paramKey - Parameter key
 * @param {string|number} value - New value
 * 
 * @public
 */
window.updateSliderValue = function(paramKey, value) {
    const valueInput = document.getElementById(`slider-value-${paramKey}`);
    if (valueInput) {
        valueInput.value = value;
    }
};

/**
 * Update slider from number input
 * 
 * @param {string} paramKey - Parameter key
 * @param {string|number} value - New value
 * 
 * @public
 */
window.updateSliderFromInput = function(paramKey, value) {
    const sliderInput = document.getElementById(`slider-input-${paramKey}`);
    if (sliderInput) {
        sliderInput.value = value;
    }
};

/**
 * Show sensitivity analysis
 * 
 * @public
 */
window.showSensitivityAnalysis = async function() {
    console.log('📊 Calculating sensitivity analysis...');
    
    if (!baseCalculationResult) {
        await window.initializeSzenarioAnalysis();
    }
    
    try {
        const baseConfig = SZENARIO_PRESETS['base'].config;
        const sensitivityData = calculateSensitivity(
            baseCalculationResult, 
            baseConfig, 
            SENSITIVITY_PARAMS
        );
        
        console.log('✅ Sensitivity data:', sensitivityData);
        
        // Render in modal or separate section
        const html = renderSensitivityAnalysis(sensitivityData);
        
        // Insert into wirtschaftlichkeit container
        const container = document.getElementById('projekt-tab-wirtschaftlichkeit');
        if (container) {
            const sensitivityContainer = document.createElement('div');
            sensitivityContainer.innerHTML = html;
            container.appendChild(sensitivityContainer);
        }
        
    } catch (error) {
        console.error('❌ Error calculating sensitivity:', error);
        alert('Fehler bei Sensitivitätsanalyse: ' + error.message);
    }
};

/**
 * Show scenario comparison
 * 
 * @public
 */
window.showSzenarioComparison = async function() {
    console.log('📈 Showing scenario comparison...');
    
    if (!baseCalculationResult) {
        await window.initializeSzenarioAnalysis();
    }
    
    try {
        const scenarios = [
            SZENARIO_PRESETS['base'],
            SZENARIO_PRESETS['best-organic'],
            SZENARIO_PRESETS['worst-conservative']
        ];
        
        const comparisonData = compareScenarios(baseCalculationResult, scenarios);
        
        console.log('✅ Comparison data:', comparisonData);
        
        // Render comparison
        const html = renderSzenarioComparison(comparisonData);
        
        // Insert into wirtschaftlichkeit container
        const container = document.getElementById('projekt-tab-wirtschaftlichkeit');
        if (container) {
            const comparisonContainer = document.createElement('div');
            comparisonContainer.innerHTML = html;
            container.appendChild(comparisonContainer);
            
            // Render chart using Chart.js
            renderComparisonChart(comparisonData);
        }
        
    } catch (error) {
        console.error('❌ Error showing comparison:', error);
        alert('Fehler beim Szenario-Vergleich: ' + error.message);
    }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Update Wirtschaftlichkeit display with scenario result
 * 
 * @param {Object} result - Calculation result
 * 
 * @private
 */
function updateWirtschaftlichkeitWithSzenario(result) {
    // Store result temporarily
    window.currentSzenarioResult = result;
    
    // WICHTIG: Speichere auch die aktive Szenario-ID
    window.currentActiveSzenarioId = activeSzenarioId;
    
    // Re-render wirtschaftlichkeit tab with new data
    renderProjektWirtschaftlichkeit();
}

/**
 * Update scenario selector UI
 * 
 * @param {string} activeSzenarioId - Active scenario ID
 * 
 * @private
 */
function updateSzenarioSelector(activeSzenarioId) {
    // Update button states
    document.querySelectorAll('.szenario-selector-btn').forEach(btn => {
        const szenarioId = btn.dataset.szenarioId;
        const isActive = szenarioId === activeSzenarioId;
        
        // Reset all buttons first
        btn.style.background = 'white';
        btn.style.color = '#374151';
        btn.style.border = '2px solid #e5e7eb';
        btn.style.fontWeight = '500';
        
        if (isActive) {
            const preset = SZENARIO_PRESETS[szenarioId];
            if (preset) {
                btn.style.border = `2px solid ${preset.color}`;
                btn.style.background = preset.color;
                btn.style.color = 'white';
                btn.style.fontWeight = '600';
            }
        }
    });
    
    // Update active scenario info
    const infoBox = document.getElementById('active-szenario-info');
    if (infoBox) {
        const preset = SZENARIO_PRESETS[activeSzenarioId];
        const name = preset?.name || 'Custom Szenario';
        const description = preset?.description || '';
        
        infoBox.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">ℹ️</span>
                <div style="flex: 1;">
                    <span style="font-size: 10px; color: #64748b;">Aktiv:</span>
                    <strong style="font-size: 12px; color: #1e40af; margin-left: 4px;">
                        ${name}
                    </strong>
                    ${description ? `
                        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                            ${description}
                        </div>
                    ` : ''}
                </div>
                ${activeSzenarioId !== 'base' ? `
                    <button onclick="window.selectSzenario('base')" 
                            style="padding: 6px 12px; font-size: 10px; background: white; 
                                   border: 1px solid #3b82f6; border-radius: 4px; cursor: pointer;
                                   transition: all 0.2s;">
                        ← Zurück zu Base
                    </button>
                ` : ''}
            </div>
        `;
    }
}

/**
 * Render comparison chart using Chart.js
 * 
 * @param {Object} comparisonData - Comparison data
 * 
 * @private
 */
function renderComparisonChart(comparisonData) {
    const canvas = document.getElementById('szenario-comparison-chart');
    if (!canvas) {
        return;
    }
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not available, skipping chart rendering');
        return;
    }
    
    const jahre = Object.keys(comparisonData.scenarios[0].result.jahre).sort();
    
    const datasets = comparisonData.scenarios.map(scenario => {
        const data = jahre.map(jahr => {
            return scenario.result.jahre[jahr].ebit / 1000000; // Convert to M€
        });
        
        return {
            label: scenario.name,
            data: data,
            borderColor: scenario.color,
            backgroundColor: scenario.color + '20',
            borderWidth: 2,
            tension: 0.1
        };
    });
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: jahre,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' M€';
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'EBIT (M€)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Jahr'
                    }
                }
            }
        }
    });
}

/**
 * Inject CSS for scenario builder
 * 
 * @private
 */
function injectSzenarioCSS() {
    if (document.getElementById('szenario-builder-css')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'szenario-builder-css';
    style.textContent = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        }
        
        .modal-content {
            position: relative;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 10000;
        }
        
        .parameter-slider {
            -webkit-appearance: none;
            appearance: none;
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            outline: none;
        }
        
        .parameter-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: var(--primary);
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .parameter-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: var(--primary);
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .szenario-selector-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .mode-btn:hover {
            opacity: 0.8;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Export initialization function
 */
export default {
    initializeSzenarioAnalysis
};
