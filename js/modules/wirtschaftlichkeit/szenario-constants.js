/**
 * CFO Dashboard - Szenario-Analyse Module
 * Constants & Presets
 * 
 * @module wirtschaftlichkeit/szenario-constants
 * @description Szenario-Templates, Presets und Konfigurationen
 * @author Senior Development Team
 * @version 1.0.0
 */

/**
 * Szenario-Modi für Kostenblöcke
 * @constant
 */
export const SZENARIO_MODES = {
    FIXED: 'fixed',           // Keine Änderung (typisch für Fixed Costs)
    AUTO: 'auto',             // Folgt Revenue-Entwicklung (typisch für Variable Costs)
    MANUAL: 'manual'          // User-definierter Prozentsatz
};

/**
 * Template für Custom Szenario
 * @constant
 */
export const SZENARIO_TEMPLATE = {
    name: 'Custom Szenario',
    description: 'Individuell konfiguriertes Szenario',
    isCustom: true,
    
    // Revenue (immer manual)
    revenue: { 
        mode: SZENARIO_MODES.MANUAL, 
        adjustment: 0.0,
        label: 'Sales Revenue',
        category: 'revenue',
        icon: '💰',
        min: -50,
        max: 100
    },
    
    // Variable Costs (default: auto)
    material_costs: { 
        mode: SZENARIO_MODES.AUTO, 
        adjustment: 0.0,
        label: 'Material Costs',
        category: 'variable',
        icon: '📦',
        min: -30,
        max: 30
    },
    direct_labour: { 
        mode: SZENARIO_MODES.AUTO, 
        adjustment: 0.0,
        label: 'Direct Labour',
        category: 'variable',
        icon: '👷',
        min: -30,
        max: 30
    },
    
    // Semi-Variable Costs (default: fixed)
    material_overhead: { 
        mode: SZENARIO_MODES.FIXED, 
        adjustment: 0.0,
        label: 'Material Overhead',
        category: 'semi-variable',
        icon: '📦',
        min: -20,
        max: 20
    },
    manufacturing_overhead: { 
        mode: SZENARIO_MODES.FIXED, 
        adjustment: 0.0,
        label: 'Manufacturing Overhead',
        category: 'semi-variable',
        icon: '🏭',
        min: -20,
        max: 20
    },
    
    // Fixed Costs (default: fixed)
    development_overhead: { 
        mode: SZENARIO_MODES.FIXED, 
        adjustment: 0.0,
        label: 'Development Overhead',
        category: 'fixed',
        icon: '🔬',
        min: -30,
        max: 50
    },
    selling_overhead: { 
        mode: SZENARIO_MODES.FIXED, 
        adjustment: 0.0,
        label: 'Selling Overhead',
        category: 'fixed',
        icon: '🤝',
        min: -30,
        max: 50
    },
    marketing_overhead: { 
        mode: SZENARIO_MODES.FIXED, 
        adjustment: 0.0,
        label: 'Marketing Overhead',
        category: 'fixed',
        icon: '📢',
        min: -30,
        max: 100
    },
    distribution_overhead: { 
        mode: SZENARIO_MODES.FIXED, 
        adjustment: 0.0,
        label: 'Distribution Overhead',
        category: 'fixed',
        icon: '🚚',
        min: -20,
        max: 30
    },
    admin_overhead: { 
        mode: SZENARIO_MODES.FIXED, 
        adjustment: 0.0,
        label: 'Administration Overhead',
        category: 'fixed',
        icon: '🏢',
        min: -20,
        max: 30
    }
};

/**
 * Vordefinierte Szenario-Presets
 * @constant
 */
export const SZENARIO_PRESETS = {
    'base': {
        id: 'base',
        name: 'Base Case',
        shortName: 'Base',
        description: 'Plan-Werte ohne Anpassungen',
        icon: '📊',
        color: '#3b82f6',
        isDefault: true,
        config: {
            revenue: { mode: SZENARIO_MODES.MANUAL, adjustment: 0.0 },
            material_costs: { mode: SZENARIO_MODES.AUTO, adjustment: 0.0 },
            direct_labour: { mode: SZENARIO_MODES.AUTO, adjustment: 0.0 },
            material_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            manufacturing_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            development_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            selling_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            marketing_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            distribution_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            admin_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 }
        }
    },
    
    'best-organic': {
        id: 'best-organic',
        name: 'Best Case (Organisch)',
        shortName: 'Best',
        description: 'Organisches Wachstum +30% ohne Kostenüberproportionalität',
        icon: '📈',
        color: '#10b981',
        config: {
            revenue: { mode: SZENARIO_MODES.MANUAL, adjustment: 0.30 },
            material_costs: { mode: SZENARIO_MODES.AUTO, adjustment: 0.0 },
            direct_labour: { mode: SZENARIO_MODES.AUTO, adjustment: 0.0 },
            material_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            manufacturing_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            development_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            selling_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            marketing_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            distribution_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            admin_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 }
        }
    },
    
    'best-investment': {
        id: 'best-investment',
        name: 'Best Case (Investment)',
        shortName: 'Best+',
        description: 'Wachstum +40% durch erhöhte Marketing-Investitionen',
        icon: '🚀',
        color: '#059669',
        config: {
            revenue: { mode: SZENARIO_MODES.MANUAL, adjustment: 0.40 },
            material_costs: { mode: SZENARIO_MODES.AUTO, adjustment: 0.0 },
            direct_labour: { mode: SZENARIO_MODES.AUTO, adjustment: 0.0 },
            material_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            manufacturing_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            development_overhead: { mode: SZENARIO_MODES.MANUAL, adjustment: 0.20 },
            selling_overhead: { mode: SZENARIO_MODES.MANUAL, adjustment: 0.30 },
            marketing_overhead: { mode: SZENARIO_MODES.MANUAL, adjustment: 0.50 },
            distribution_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            admin_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 }
        }
    },
    
    'worst-conservative': {
        id: 'worst-conservative',
        name: 'Worst Case (Konservativ)',
        shortName: 'Worst',
        description: 'Umsatzrückgang -20%, variable Kosten folgen automatisch',
        icon: '📉',
        color: '#ef4444',
        config: {
            revenue: { mode: SZENARIO_MODES.MANUAL, adjustment: -0.20 },
            material_costs: { mode: SZENARIO_MODES.AUTO, adjustment: 0.0 },
            direct_labour: { mode: SZENARIO_MODES.AUTO, adjustment: 0.0 },
            material_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            manufacturing_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            development_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            selling_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            marketing_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            distribution_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            admin_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 }
        }
    },
    
    'worst-aggressive': {
        id: 'worst-aggressive',
        name: 'Worst Case (Aggressiv)',
        shortName: 'Worst-',
        description: 'Krise: -30% Umsatz, Kostenreduktionsprogramm aktiv',
        icon: '⚠️',
        color: '#dc2626',
        config: {
            revenue: { mode: SZENARIO_MODES.MANUAL, adjustment: -0.30 },
            material_costs: { mode: SZENARIO_MODES.AUTO, adjustment: 0.0 },
            direct_labour: { mode: SZENARIO_MODES.MANUAL, adjustment: -0.20 },
            material_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            manufacturing_overhead: { mode: SZENARIO_MODES.MANUAL, adjustment: -0.15 },
            development_overhead: { mode: SZENARIO_MODES.MANUAL, adjustment: -0.20 },
            selling_overhead: { mode: SZENARIO_MODES.MANUAL, adjustment: -0.10 },
            marketing_overhead: { mode: SZENARIO_MODES.MANUAL, adjustment: -0.30 },
            distribution_overhead: { mode: SZENARIO_MODES.FIXED, adjustment: 0.0 },
            admin_overhead: { mode: SZENARIO_MODES.MANUAL, adjustment: -0.10 }
        }
    }
};

/**
 * Kategorie-Definitionen für UI-Gruppierung
 * @constant
 */
export const COST_CATEGORIES = {
    revenue: {
        label: '💰 REVENUE ASSUMPTIONS',
        description: 'Umsatzannahmen',
        color: '#3b82f6'
    },
    variable: {
        label: '📦 VARIABLE COSTS',
        description: 'Folgen automatisch der Mengenentwicklung',
        color: '#10b981'
    },
    'semi-variable': {
        label: '🏭 SEMI-VARIABLE COSTS',
        description: 'Teilweise fix, teilweise variabel',
        color: '#f59e0b'
    },
    fixed: {
        label: '🔒 FIXED COSTS',
        description: 'Typischerweise unabhängig vom Umsatz',
        color: '#6366f1'
    }
};

/**
 * Sensitivitäts-Parameter für Tornado-Chart
 * @constant
 */
export const SENSITIVITY_PARAMS = [
    { key: 'revenue', label: 'Sales Revenue', range: [-30, 30] },
    { key: 'material_costs', label: 'Material Costs', range: [-20, 20] },
    { key: 'direct_labour', label: 'Direct Labour', range: [-20, 20] },
    { key: 'development_overhead', label: 'Development OH', range: [-30, 30] },
    { key: 'marketing_overhead', label: 'Marketing OH', range: [-50, 50] }
];

/**
 * Chart-Konfiguration für Szenario-Vergleich
 * @constant
 */
export const CHART_CONFIG = {
    colors: {
        base: '#3b82f6',
        best: '#10b981',
        worst: '#ef4444',
        custom: '#8b5cf6'
    },
    lineStyles: {
        base: 'solid',
        best: 'dashed',
        worst: 'dotted'
    }
};

/**
 * UI-Labels für Szenario-Analyse
 * @constant
 */
export const SZENARIO_LABELS = {
    builder_title: '⚙️ Szenario-Builder - Granulare Kontrolle',
    mode_labels: {
        fixed: 'Fixed',
        auto: 'Auto',
        manual: 'Manual'
    },
    buttons: {
        save: '💾 Als Custom Szenario speichern',
        apply: '✅ Anwenden',
        reset: '🔄 Zurücksetzen',
        compare: '📊 Szenarien vergleichen'
    },
    info: {
        auto: 'Kosten folgen automatisch der Revenue-Entwicklung',
        fixed: 'Kosten bleiben unverändert',
        manual: 'Manuelle Anpassung möglich'
    }
};

/**
 * Validierungs-Regeln
 * @constant
 */
export const VALIDATION_RULES = {
    revenue: {
        min: -50,
        max: 100,
        step: 1
    },
    variable_costs: {
        min: -30,
        max: 30,
        step: 1
    },
    fixed_costs: {
        min: -30,
        max: 50,
        step: 1
    }
};

/**
 * Export all constants
 */
export default {
    SZENARIO_MODES,
    SZENARIO_TEMPLATE,
    SZENARIO_PRESETS,
    COST_CATEGORIES,
    SENSITIVITY_PARAMS,
    CHART_CONFIG,
    SZENARIO_LABELS,
    VALIDATION_RULES
};