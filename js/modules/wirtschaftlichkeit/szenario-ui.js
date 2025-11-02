/**
 * CFO Dashboard - Szenario-Analyse Module
 * UI Renderer
 * 
 * @module wirtschaftlichkeit/szenario-ui
 * @description UI components for scenario analysis
 * @author Senior Development Team
 * @version 1.0.0
 */

import * as helpers from '../../helpers.js';
import {
    SZENARIO_TEMPLATE,
    SZENARIO_PRESETS,
    COST_CATEGORIES,
    SZENARIO_LABELS,
    SZENARIO_MODES,
    CHART_CONFIG
} from './szenario-constants.js';

// Global state for current scenario
let currentSzenario = null;
let customSzenarios = [];

/**
 * Render scenario selector buttons
 * 
 * @param {string} activeSzenarioId - Currently active scenario
 * @returns {string} HTML
 * 
 * @public
 */
export function renderSzenarioSelector(activeSzenarioId = 'base') {
    return `
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
                    padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; 
                    border: 1px solid #bae6fd;">
            
            <!-- Compact Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">📊</span>
                    <span style="font-size: 12px; font-weight: 600; color: #0c4a6e;">
                        Szenario-Analyse
                    </span>
                </div>
                <div style="font-size: 10px; color: #64748b;">
                    Wählen Sie ein Szenario oder erstellen Sie ein individuelles
                </div>
            </div>
            
            <!-- Compact Buttons Row -->
            <div style="display: flex; gap: 8px; align-items: center;">
                
                <!-- Base Button -->
                <button 
                    class="szenario-selector-btn"
                    data-szenario-id="base"
                    onclick="window.selectSzenario('base')"
                    style="flex: 0 0 auto; padding: 8px 16px; background: white; 
                           border: 2px solid ${activeSzenarioId === 'base' ? '#3b82f6' : '#e5e7eb'}; 
                           border-radius: 6px; cursor: pointer; transition: all 0.2s;
                           display: flex; align-items: center; gap: 6px; font-size: 11px;
                           font-weight: ${activeSzenarioId === 'base' ? '600' : '500'};
                           color: ${activeSzenarioId === 'base' ? '#1e40af' : '#64748b'};">
                    <span style="font-size: 14px;">📊</span>
                    <span>Base</span>
                </button>
                
                <!-- Best Button -->
                <button 
                    class="szenario-selector-btn"
                    data-szenario-id="best-organic"
                    onclick="window.selectSzenario('best-organic')"
                    style="flex: 0 0 auto; padding: 8px 16px; background: white; 
                           border: 2px solid ${activeSzenarioId === 'best-organic' ? '#10b981' : '#e5e7eb'}; 
                           border-radius: 6px; cursor: pointer; transition: all 0.2s;
                           display: flex; align-items: center; gap: 6px; font-size: 11px;
                           font-weight: ${activeSzenarioId === 'best-organic' ? '600' : '500'};
                           color: ${activeSzenarioId === 'best-organic' ? '#047857' : '#64748b'};">
                    <span style="font-size: 14px;">📈</span>
                    <span>Best</span>
                </button>
                
                <!-- Worst Button -->
                <button 
                    class="szenario-selector-btn"
                    data-szenario-id="worst-conservative"
                    onclick="window.selectSzenario('worst-conservative')"
                    style="flex: 0 0 auto; padding: 8px 16px; background: white; 
                           border: 2px solid ${activeSzenarioId === 'worst-conservative' ? '#ef4444' : '#e5e7eb'}; 
                           border-radius: 6px; cursor: pointer; transition: all 0.2s;
                           display: flex; align-items: center; gap: 6px; font-size: 11px;
                           font-weight: ${activeSzenarioId === 'worst-conservative' ? '600' : '500'};
                           color: ${activeSzenarioId === 'worst-conservative' ? '#dc2626' : '#64748b'};">
                    <span style="font-size: 14px;">📉</span>
                    <span>Worst</span>
                </button>
                
                <!-- Custom Builder Button -->
                <button 
                    class="szenario-selector-btn"
                    onclick="window.openSzenarioBuilder()"
                    style="flex: 0 0 auto; padding: 8px 16px; background: white; 
                           border: 2px dashed #94a3b8; border-radius: 6px; cursor: pointer; 
                           transition: all 0.2s; display: flex; align-items: center; gap: 6px; 
                           font-size: 11px; font-weight: 500; color: #64748b;">
                    <span style="font-size: 14px;">⚙️</span>
                    <span>Custom Builder</span>
                </button>
                
                <!-- Active Scenario Info -->
                <div id="active-szenario-info" 
                     style="flex: 1; display: flex; align-items: center; gap: 8px; 
                            padding: 6px 12px; background: white; border-radius: 6px; 
                            border: 1px solid #e5e7eb; margin-left: 8px;">
                    <span style="font-size: 14px;">ℹ️</span>
                    <div style="flex: 1;">
                        <span style="font-size: 10px; color: #64748b;">Aktiv:</span>
                        <strong style="font-size: 11px; color: #1e40af; margin-left: 4px;">
                            ${SZENARIO_PRESETS[activeSzenarioId]?.name || 'Base Case'}
                        </strong>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render scenario builder modal
 * 
 * @param {Object} [initialConfig] - Initial configuration (optional)
 * @returns {string} HTML
 * 
 * @public
 */
export function renderSzenarioBuilder(initialConfig = null) {
    const config = initialConfig || SZENARIO_TEMPLATE;
    
    return `
        <div id="szenario-builder-modal" class="modal" style="display: flex;">
            <div class="modal-overlay" onclick="window.closeSzenarioBuilder()"></div>
            <div class="modal-content" style="width: 900px; max-width: 95vw; max-height: 90vh; overflow-y: auto;">
                
                <!-- Header -->
                <div style="position: sticky; top: 0; background: white; z-index: 10; 
                            padding: 20px; border-bottom: 2px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: var(--primary);">
                                ${SZENARIO_LABELS.builder_title}
                            </h3>
                            <div style="font-size: 12px; color: var(--gray);">
                                Passen Sie einzelne Parameter individuell an
                            </div>
                        </div>
                        <button onclick="window.closeSzenarioBuilder()" 
                                style="background: none; border: none; font-size: 24px; 
                                       cursor: pointer; color: var(--gray);">
                            ×
                        </button>
                    </div>
                </div>
                
                <!-- Content -->
                <div style="padding: 20px;">
                    
                    <!-- Scenario Name -->
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; 
                                      margin-bottom: 8px; color: var(--text);">
                            Szenario-Name
                        </label>
                        <input 
                            type="text" 
                            id="szenario-name-input"
                            value="${config.name}"
                            placeholder="Mein Custom Szenario"
                            style="width: 100%; padding: 10px; border: 1px solid var(--border); 
                                   border-radius: 6px; font-size: 13px;">
                    </div>
                    
                    ${renderCategorySection('revenue', config)}
                    ${renderCategorySection('variable', config)}
                    ${renderCategorySection('semi-variable', config)}
                    ${renderCategorySection('fixed', config)}
                    
                </div>
                
                <!-- Footer -->
                <div style="position: sticky; bottom: 0; background: white; z-index: 10; 
                            padding: 20px; border-top: 2px solid var(--border);">
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button onclick="window.resetSzenarioBuilder()" 
                                class="btn btn-secondary"
                                style="display: flex; align-items: center; gap: 6px;">
                            <span>🔄</span>
                            <span>${SZENARIO_LABELS.buttons.reset}</span>
                        </button>
                        <button onclick="window.saveSzenario()" 
                                class="btn btn-secondary"
                                style="display: flex; align-items: center; gap: 6px;">
                            <span>💾</span>
                            <span>${SZENARIO_LABELS.buttons.save}</span>
                        </button>
                        <button onclick="window.applySzenarioFromBuilder()" 
                                class="btn btn-primary"
                                style="display: flex; align-items: center; gap: 6px;">
                            <span>✅</span>
                            <span>${SZENARIO_LABELS.buttons.apply}</span>
                        </button>
                    </div>
                </div>
                
            </div>
        </div>
    `;
}

/**
 * Render category section in builder
 * 
 * @param {string} categoryKey - Category key
 * @param {Object} config - Configuration
 * @returns {string} HTML
 * 
 * @private
 */
function renderCategorySection(categoryKey, config) {
    const category = COST_CATEGORIES[categoryKey];
    
    // Get all items in this category
    const items = Object.entries(config).filter(([key, value]) => {
        return value.category === categoryKey;
    });
    
    if (items.length === 0) {
        return '';
    }
    
    return `
        <div style="margin-bottom: 32px;">
            <div style="padding: 12px 16px; background: ${category.color}10; 
                        border-left: 4px solid ${category.color}; border-radius: 6px; margin-bottom: 16px;">
                <div style="font-weight: 600; font-size: 13px; color: var(--text); margin-bottom: 4px;">
                    ${category.label}
                </div>
                <div style="font-size: 11px; color: var(--gray);">
                    ${category.description}
                </div>
            </div>
            
            ${items.map(([key, itemConfig]) => renderParameterControl(key, itemConfig)).join('')}
        </div>
    `;
}

/**
 * Render parameter control
 * 
 * @param {string} key - Parameter key
 * @param {Object} itemConfig - Item configuration
 * @returns {string} HTML
 * 
 * @private
 */
function renderParameterControl(key, itemConfig) {
    const currentMode = itemConfig.mode || SZENARIO_MODES.FIXED;
    const currentValue = Math.round((itemConfig.adjustment || 0) * 100);
    
    return `
        <div class="parameter-control" data-param-key="${key}" 
             style="background: white; padding: 16px; border: 1px solid var(--border); 
                    border-radius: 6px; margin-bottom: 12px;">
            
            <!-- Parameter Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">${itemConfig.icon}</span>
                    <span style="font-size: 13px; font-weight: 500;">${itemConfig.label}</span>
                </div>
                
                <!-- Mode Selector -->
                <div style="display: flex; gap: 6px;">
                    ${renderModeButton(key, SZENARIO_MODES.FIXED, currentMode)}
                    ${itemConfig.category !== 'revenue' ? renderModeButton(key, SZENARIO_MODES.AUTO, currentMode) : ''}
                    ${renderModeButton(key, SZENARIO_MODES.MANUAL, currentMode)}
                </div>
            </div>
            
            <!-- Adjustment Slider (only visible for MANUAL mode) -->
            <div id="slider-${key}" style="display: ${currentMode === SZENARIO_MODES.MANUAL ? 'block' : 'none'};">
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 12px;">
                    <input 
                        type="range" 
                        id="slider-input-${key}"
                        class="parameter-slider"
                        min="${itemConfig.min}"
                        max="${itemConfig.max}"
                        value="${currentValue}"
                        step="1"
                        style="flex: 1;"
                        oninput="window.updateSliderValue('${key}', this.value)">
                    
                    <div style="display: flex; align-items: center; gap: 8px; min-width: 100px;">
                        <input 
                            type="number" 
                            id="slider-value-${key}"
                            value="${currentValue}"
                            min="${itemConfig.min}"
                            max="${itemConfig.max}"
                            step="1"
                            oninput="window.updateSliderFromInput('${key}', this.value)"
                            style="width: 60px; padding: 6px; border: 1px solid var(--border); 
                                   border-radius: 4px; text-align: right; font-size: 12px;">
                        <span style="font-size: 12px; font-weight: 600; color: var(--primary);">%</span>
                    </div>
                </div>
                
                <!-- Slider Scale -->
                <div style="display: flex; justify-content: space-between; margin-top: 4px; 
                            font-size: 10px; color: var(--gray);">
                    <span>${itemConfig.min}%</span>
                    <span>0%</span>
                    <span>${itemConfig.max}%</span>
                </div>
            </div>
            
            <!-- Mode Info -->
            <div id="mode-info-${key}" style="margin-top: 8px; padding: 8px; background: #f8fafc; 
                                               border-radius: 4px; font-size: 11px; color: var(--gray);">
                ${getModeInfoText(currentMode)}
            </div>
            
        </div>
    `;
}

/**
 * Render mode button
 * 
 * @param {string} paramKey - Parameter key
 * @param {string} mode - Mode
 * @param {string} currentMode - Currently active mode
 * @returns {string} HTML
 * 
 * @private
 */
function renderModeButton(paramKey, mode, currentMode) {
    const isActive = mode === currentMode;
    const labels = SZENARIO_LABELS.mode_labels;
    
    return `
        <button 
            class="mode-btn"
            data-param="${paramKey}"
            data-mode="${mode}"
            onclick="window.changeSzenarioMode('${paramKey}', '${mode}')"
            style="padding: 4px 12px; font-size: 11px; border: 1px solid ${isActive ? 'var(--primary)' : 'var(--border)'};
                   background: ${isActive ? 'var(--primary)' : 'white'}; 
                   color: ${isActive ? 'white' : 'var(--text)'}; border-radius: 4px; cursor: pointer;
                   transition: all 0.2s; font-weight: ${isActive ? '600' : '400'};">
            ${labels[mode]}
        </button>
    `;
}

/**
 * Get mode info text
 * 
 * @param {string} mode - Mode
 * @returns {string} Info text
 * 
 * @private
 */
function getModeInfoText(mode) {
    const info = SZENARIO_LABELS.info;
    
    switch (mode) {
        case SZENARIO_MODES.FIXED:
            return `💡 ${info.fixed}`;
        case SZENARIO_MODES.AUTO:
            return `🤖 ${info.auto}`;
        case SZENARIO_MODES.MANUAL:
            return `✏️ ${info.manual}`;
        default:
            return '';
    }
}

/**
 * Render sensitivity analysis (Tornado Chart)
 * 
 * @param {Array} sensitivityData - Sensitivity data
 * @returns {string} HTML
 * 
 * @public
 */
export function renderSensitivityAnalysis(sensitivityData) {
    if (!sensitivityData || sensitivityData.length === 0) {
        return '';
    }
    
    const maxImpact = Math.max(...sensitivityData.map(d => Math.abs(d.positiveImpact)));
    
    return `
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; 
                    border: 1px solid var(--border);">
            <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 16px 0; color: var(--primary);">
                📊 Sensitivitäts-Analyse
            </h4>
            <div style="font-size: 11px; color: var(--gray); margin-bottom: 16px;">
                Welcher Parameter hat den größten EBIT-Impact? (±20% Änderung)
            </div>
            
            ${sensitivityData.map(item => {
                const positiveWidth = Math.abs(item.positiveImpact / maxImpact) * 100;
                const negativeWidth = Math.abs(item.negativeImpact / maxImpact) * 100;
                
                return `
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 12px; font-weight: 500; margin-bottom: 6px;">
                            ${item.parameter}
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <!-- Negative Impact -->
                            <div style="flex: 1; text-align: right;">
                                <div style="display: inline-block; width: ${negativeWidth}%; height: 24px; 
                                            background: #ef4444; border-radius: 4px 0 0 4px;"></div>
                            </div>
                            <div style="min-width: 60px; text-align: center; font-size: 11px; 
                                        font-weight: 600; color: var(--gray);">
                                0%
                            </div>
                            <!-- Positive Impact -->
                            <div style="flex: 1;">
                                <div style="display: inline-block; width: ${positiveWidth}%; height: 24px; 
                                            background: #10b981; border-radius: 0 4px 4px 0;"></div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 4px; 
                                    font-size: 10px; color: var(--gray);">
                            <span>${item.negativeImpact.toFixed(1)}%</span>
                            <span>${item.positiveImpact.toFixed(1)}%</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Render scenario comparison chart
 * 
 * @param {Object} comparisonData - Comparison data
 * @returns {string} HTML
 * 
 * @public
 */
export function renderSzenarioComparison(comparisonData) {
    if (!comparisonData || !comparisonData.scenarios || comparisonData.scenarios.length === 0) {
        return '';
    }
    
    // Extract years from first scenario
    const jahre = Object.keys(comparisonData.scenarios[0].result.jahre).sort();
    
    return `
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; 
                    border: 1px solid var(--border);">
            <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 16px 0; color: var(--primary);">
                📈 Szenario-Vergleich
            </h4>
            
            <!-- Chart Canvas -->
            <canvas id="szenario-comparison-chart" style="max-height: 400px;"></canvas>
            
            <!-- Legend -->
            <div style="display: flex; gap: 20px; justify-content: center; margin-top: 16px; flex-wrap: wrap;">
                ${comparisonData.scenarios.map(scenario => `
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="width: 20px; height: 3px; background: ${scenario.color}; border-radius: 2px;"></div>
                        <span style="font-size: 11px; color: var(--text);">${scenario.name}</span>
                    </div>
                `).join('')}
            </div>
            
            <!-- Summary Table -->
            <div style="margin-top: 20px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid var(--border);">
                            <th style="padding: 10px; text-align: left; font-weight: 600;">Szenario</th>
                            <th style="padding: 10px; text-align: right; font-weight: 600;">Ø EBIT Margin</th>
                            <th style="padding: 10px; text-align: right; font-weight: 600;">Total EBIT</th>
                            <th style="padding: 10px; text-align: right; font-weight: 600;">NPV</th>
                            <th style="padding: 10px; text-align: right; font-weight: 600;">IRR</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisonData.scenarios.map(scenario => `
                            <tr style="border-bottom: 1px solid #f3f4f6;">
                                <td style="padding: 10px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="width: 4px; height: 20px; background: ${scenario.color}; 
                                                    border-radius: 2px;"></div>
                                        <span style="font-weight: 500;">${scenario.name}</span>
                                    </div>
                                </td>
                                <td style="padding: 10px; text-align: right; font-weight: 500;">
                                    ${scenario.summary.avg_ebit_margin.toFixed(1)}%
                                </td>
                                <td style="padding: 10px; text-align: right; font-weight: 500;">
                                    ${helpers.formatCurrency(scenario.summary.total_ebit)}
                                </td>
                                <td style="padding: 10px; text-align: right;">
                                    ${helpers.formatCurrency(scenario.summary.npv)}
                                </td>
                                <td style="padding: 10px; text-align: right;">
                                    ${scenario.summary.irr.toFixed(1)}%
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Get current scenario configuration from builder UI
 * 
 * @returns {Object} Scenario configuration
 * 
 * @public
 */
export function getSzenarioFromBuilder() {
    const config = JSON.parse(JSON.stringify(SZENARIO_TEMPLATE));
    const name = document.getElementById('szenario-name-input')?.value || 'Custom Szenario';
    
    config.name = name;
    
    // Read all parameter values
    Object.keys(config).forEach(key => {
        if (key === 'name' || key === 'description' || key === 'isCustom') {
            return;
        }
        
        const paramControl = document.querySelector(`[data-param-key="${key}"]`);
        if (!paramControl) {
            return;
        }
        
        // Get active mode
        const activeModeBtn = paramControl.querySelector('.mode-btn[style*="var(--primary)"]');
        const mode = activeModeBtn?.dataset.mode || SZENARIO_MODES.FIXED;
        
        // Get adjustment value
        const sliderInput = document.getElementById(`slider-input-${key}`);
        const adjustment = sliderInput ? parseFloat(sliderInput.value) / 100 : 0;
        
        config[key].mode = mode;
        config[key].adjustment = adjustment;
    });
    
    return config;
}

/**
 * Export public API
 */
export default {
    renderSzenarioSelector,
    renderSzenarioBuilder,
    renderSensitivityAnalysis,
    renderSzenarioComparison,
    getSzenarioFromBuilder
};
