/**
 * ALBO Solutions - Widgets (Horváth Edition)
 * Professional UI components for executive dashboard
 * 
 * Widget Types:
 * - KPI Cards (Executive Summary)
 * - Breakdown Bars (Artikel-specific)
 * - Insights Boxes (AI-powered)
 * - Recommendations (Controller Actions)
 * - Status Badges
 * - Loading/Error States
 */

import { state } from '../../state.js';
import * as helpers from '../../helpers.js';

// ==========================================
// HORVÁTH COLOR SYSTEM (same as charts)
// ==========================================

const HORVATH_COLORS = {
    navy: '#003366',
    blue: '#0066CC',
    success: '#00A651',
    warning: '#FF6600',
    danger: '#DC0032',
    neutral: '#8C9BA5'
};

// ==========================================
// LOADING & ERROR WIDGETS
// ==========================================

/**
 * Render loading widget
 */
export function renderLoadingWidget() {
    return `
        <div class="loading-widget">
            <div class="spinner"></div>
            <div class="loading-text">Lade Dashboard...</div>
        </div>
    `;
}

/**
 * Render error widget
 */
export function renderErrorWidget(error) {
    return `
        <div class="error-widget">
            <div class="error-icon">⚠️</div>
            <div class="error-title">Dashboard-Fehler</div>
            <div class="error-message">${helpers.escapeHtml(error.message || 'Unbekannter Fehler')}</div>
            <button class="btn btn-secondary" onclick="window.refreshDashboard()">
                🔄 Neu laden
            </button>
        </div>
    `;
}

/**
 * Render "no data" widget
 */
export function renderNoDataWidget(message = 'Keine Daten vorhanden') {
    return `
        <div class="no-data-widget">
            <div class="no-data-icon">📊</div>
            <div class="no-data-title">${helpers.escapeHtml(message)}</div>
            <div class="no-data-subtitle">Bitte legen Sie Artikel und Projektkosten an.</div>
        </div>
    `;
}

// ==========================================
// KPI CARDS (Executive Summary)
// ==========================================

/**
 * Render KPI Card
 * Used in Executive Summary section
 */
export function renderKPICard(config) {
    const {
        icon,
        label,
        value,
        unit,
        subtitle,
        trend,
        trendLabel,
        sparklineId,
        statusClass = ''
    } = config;
    
    return `
        <div class="kpi-card ${statusClass}">
            <div class="kpi-icon">${icon}</div>
            <div class="kpi-label">${label}</div>
            <div class="kpi-value">
                ${value}${unit ? `<span class="kpi-unit">${unit}</span>` : ''}
            </div>
            ${subtitle ? `<div class="kpi-subtitle">${subtitle}</div>` : ''}
            ${trend ? renderTrend(trend, trendLabel) : ''}
            ${sparklineId ? `<div class="kpi-sparkline" id="${sparklineId}"></div>` : ''}
        </div>
    `;
}

/**
 * Render trend indicator
 */
function renderTrend(trendValue, trendLabel) {
    const isPositive = trendValue > 0;
    const isNegative = trendValue < 0;
    const arrow = isPositive ? '↗️' : isNegative ? '↘️' : '→';
    const className = isPositive ? 'trend-positive' : isNegative ? 'trend-negative' : 'trend-neutral';
    
    return `
        <div class="kpi-trend ${className}">
            ${arrow} ${trendLabel || Math.abs(trendValue).toFixed(1) + '%'}
        </div>
    `;
}

// ==========================================
// BREAKDOWN BARS
// ==========================================

/**
 * Render Breakdown Bar
 * Horizontal bar with label, progress, and value
 */
export function renderBreakdownBar(config) {
    const {
        label,
        value,
        total,
        color = HORVATH_COLORS.blue,
        showPercent = true,
        showValue = true,
        status = null
    } = config;
    
    const percent = total > 0 ? (value / total * 100) : 0;
    const statusIcon = status === 'positive' ? '✅' : status === 'warning' ? '⚠️' : status === 'negative' ? '❌' : '';
    
    return `
        <div class="breakdown-bar">
            <div class="breakdown-bar-header">
                <span class="breakdown-bar-label">${helpers.escapeHtml(label)}</span>
                <span class="breakdown-bar-value">
                    ${showPercent ? `${percent.toFixed(0)}%` : ''}
                    ${showValue ? `(${helpers.formatCurrency(value / 1000000)}M)` : ''}
                    ${statusIcon}
                </span>
            </div>
            <div class="breakdown-bar-track">
                <div class="breakdown-bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
            </div>
        </div>
    `;
}

/**
 * Render multiple breakdown bars
 */
export function renderBreakdownBars(items) {
    if (!items || items.length === 0) {
        return '<div class="no-data-text">Keine Daten verfügbar</div>';
    }
    
    const total = items.reduce((sum, item) => sum + item.value, 0);
    
    return items.map(item => renderBreakdownBar({
        ...item,
        total: item.total || total
    })).join('');
}

// ==========================================
// INSIGHTS BOXES
// ==========================================

/**
 * Render Insight Item
 */
export function renderInsightItem(insight) {
    const {
        type = 'info',
        icon,
        title,
        text,
        action
    } = insight;
    
    const typeClass = `insight-${type}`; // insight-positive, insight-warning, insight-action
    
    return `
        <div class="insight-item ${typeClass}">
            <div class="insight-icon">${icon}</div>
            <div class="insight-content">
                <div class="insight-title">${title}</div>
                <div class="insight-text">${text}</div>
                ${action ? `<div class="insight-action">→ ${action}</div>` : ''}
            </div>
        </div>
    `;
}

/**
 * Render Insights Box
 */
export function renderInsightsBox(config) {
    const {
        title = '💡 KEY INSIGHTS',
        insights = []
    } = config;
    
    if (insights.length === 0) {
        return `
            <div class="insights-box">
                <div class="insights-header">${title}</div>
                <div class="insights-empty">Keine Insights verfügbar</div>
            </div>
        `;
    }
    
    return `
        <div class="insights-box">
            <div class="insights-header">${title}</div>
            <div class="insights-list">
                ${insights.map(insight => renderInsightItem(insight)).join('')}
            </div>
        </div>
    `;
}

// ==========================================
// CONTROLLER RECOMMENDATIONS
// ==========================================

/**
 * Render Recommendation Item
 */
export function renderRecommendationItem(recommendation) {
    const {
        priority = 'medium',
        title,
        description,
        impact,
        effort
    } = recommendation;
    
    const priorityIcon = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
    
    return `
        <div class="recommendation-item priority-${priority}">
            <div class="recommendation-priority">${priorityIcon}</div>
            <div class="recommendation-content">
                <div class="recommendation-title">${title}</div>
                <div class="recommendation-description">${description}</div>
                ${impact || effort ? `
                    <div class="recommendation-meta">
                        ${impact ? `<span class="meta-tag">Impact: ${impact}</span>` : ''}
                        ${effort ? `<span class="meta-tag">Effort: ${effort}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Render Recommendations Box
 */
export function renderRecommendationsBox(recommendations) {
    if (!recommendations || recommendations.length === 0) {
        return `
            <div class="recommendations-box">
                <div class="recommendations-header">🎯 CONTROLLER RECOMMENDATIONS</div>
                <div class="recommendations-empty">Keine Empfehlungen verfügbar</div>
            </div>
        `;
    }
    
    return `
        <div class="recommendations-box">
            <div class="recommendations-header">🎯 CONTROLLER RECOMMENDATIONS</div>
            <div class="recommendations-list">
                ${recommendations.map(rec => renderRecommendationItem(rec)).join('')}
            </div>
        </div>
    `;
}

// ==========================================
// STATUS BADGES
// ==========================================

/**
 * Render Status Badge
 */
export function renderStatusBadge(status, label = null) {
    const statusConfig = {
        'go': { icon: '🟢', text: label || 'GO', color: HORVATH_COLORS.success },
        'review': { icon: '🟡', text: label || 'REVIEW', color: HORVATH_COLORS.warning },
        'no-go': { icon: '🔴', text: label || 'NO-GO', color: HORVATH_COLORS.danger },
        'excellent': { icon: '✅', text: label || 'Exzellent', color: HORVATH_COLORS.success },
        'good': { icon: '⚡', text: label || 'Gut', color: HORVATH_COLORS.warning },
        'warning': { icon: '⚠️', text: label || 'Achtung', color: HORVATH_COLORS.warning },
        'critical': { icon: '❌', text: label || 'Kritisch', color: HORVATH_COLORS.danger }
    };
    
    const config = statusConfig[status] || { icon: '⚫', text: status, color: HORVATH_COLORS.neutral };
    
    return `
        <span class="status-badge status-${status}" style="background-color: ${config.color}20; color: ${config.color};">
            ${config.icon} ${config.text}
        </span>
    `;
}

// ==========================================
// METRIC COMPARISON
// ==========================================

/**
 * Render Metric Comparison (Actual vs Target)
 */
export function renderMetricComparison(config) {
    const {
        label,
        actual,
        target,
        unit = '%',
        showDelta = true
    } = config;
    
    const delta = actual - target;
    const deltaPercent = target !== 0 ? ((actual - target) / Math.abs(target) * 100) : 0;
    const status = delta >= 0 ? 'positive' : 'negative';
    const icon = delta >= 0 ? '✅' : '⚠️';
    
    return `
        <div class="metric-comparison">
            <div class="metric-label">${label}</div>
            <div class="metric-values">
                <div class="metric-actual">
                    <span class="metric-value">${actual.toFixed(1)}${unit}</span>
                    <span class="metric-sublabel">Ist</span>
                </div>
                <div class="metric-separator">vs</div>
                <div class="metric-target">
                    <span class="metric-value">${target.toFixed(1)}${unit}</span>
                    <span class="metric-sublabel">Ziel</span>
                </div>
            </div>
            ${showDelta ? `
                <div class="metric-delta metric-delta-${status}">
                    ${icon} ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}${unit} 
                    (${deltaPercent >= 0 ? '+' : ''}${deltaPercent.toFixed(0)}%)
                </div>
            ` : ''}
        </div>
    `;
}

// ==========================================
// DATA TABLE
// ==========================================

/**
 * Render Simple Data Table
 */
export function renderDataTable(config) {
    const {
        headers,
        rows,
        className = ''
    } = config;
    
    if (!rows || rows.length === 0) {
        return '<div class="no-data-text">Keine Daten verfügbar</div>';
    }
    
    return `
        <table class="data-table ${className}">
            <thead>
                <tr>
                    ${headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${rows.map(row => `
                    <tr>
                        ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ==========================================
// INFO BOX
// ==========================================

/**
 * Render Info Box (blue background, info icon)
 */
export function renderInfoBox(config) {
    const {
        title,
        text,
        icon = 'ℹ️'
    } = config;
    
    return `
        <div class="info-box">
            <div class="info-box-icon">${icon}</div>
            <div class="info-box-content">
                ${title ? `<div class="info-box-title">${title}</div>` : ''}
                <div class="info-box-text">${text}</div>
            </div>
        </div>
    `;
}

// ==========================================
// WARNING BOX
// ==========================================

/**
 * Render Warning Box (orange background, warning icon)
 */
export function renderWarningBox(config) {
    const {
        title,
        text,
        icon = '⚠️'
    } = config;
    
    return `
        <div class="warning-box">
            <div class="warning-box-icon">${icon}</div>
            <div class="warning-box-content">
                ${title ? `<div class="warning-box-title">${title}</div>` : ''}
                <div class="warning-box-text">${text}</div>
            </div>
        </div>
    `;
}

// ==========================================
// SUCCESS BOX
// ==========================================

/**
 * Render Success Box (green background, check icon)
 */
export function renderSuccessBox(config) {
    const {
        title,
        text,
        icon = '✅'
    } = config;
    
    return `
        <div class="success-box">
            <div class="success-box-icon">${icon}</div>
            <div class="success-box-content">
                ${title ? `<div class="success-box-title">${title}</div>` : ''}
                <div class="success-box-text">${text}</div>
            </div>
        </div>
    `;
}

// ==========================================
// PROGRESS BAR
// ==========================================

/**
 * Render Progress Bar
 */
export function renderProgressBar(config) {
    const {
        label,
        current,
        target,
        unit = '',
        showPercent = true
    } = config;
    
    const percent = target > 0 ? (current / target * 100) : 0;
    const cappedPercent = Math.min(percent, 100);
    const color = percent >= 100 ? HORVATH_COLORS.success : 
                  percent >= 75 ? HORVATH_COLORS.warning : 
                  HORVATH_COLORS.neutral;
    
    return `
        <div class="progress-bar-widget">
            <div class="progress-bar-header">
                <span class="progress-bar-label">${label}</span>
                <span class="progress-bar-value">
                    ${current}${unit} / ${target}${unit}
                    ${showPercent ? ` (${cappedPercent.toFixed(0)}%)` : ''}
                </span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${cappedPercent}%; background-color: ${color};"></div>
            </div>
        </div>
    `;
}

// ==========================================
// CARD CONTAINER
// ==========================================

/**
 * Render Card Container (generic wrapper)
 */
export function renderCard(config) {
    const {
        title,
        subtitle,
        content,
        footer,
        className = ''
    } = config;
    
    return `
        <div class="card-container ${className}">
            ${title ? `
                <div class="card-header">
                    <div class="card-title">${title}</div>
                    ${subtitle ? `<div class="card-subtitle">${subtitle}</div>` : ''}
                </div>
            ` : ''}
            <div class="card-body">
                ${content}
            </div>
            ${footer ? `<div class="card-footer">${footer}</div>` : ''}
        </div>
    `;
}

// ==========================================
// MINI STATS
// ==========================================

/**
 * Render Mini Stat (small metric display)
 */
export function renderMiniStat(config) {
    const {
        label,
        value,
        unit,
        trend,
        icon
    } = config;
    
    return `
        <div class="mini-stat">
            ${icon ? `<div class="mini-stat-icon">${icon}</div>` : ''}
            <div class="mini-stat-content">
                <div class="mini-stat-label">${label}</div>
                <div class="mini-stat-value">
                    ${value}${unit ? `<span class="mini-stat-unit">${unit}</span>` : ''}
                </div>
                ${trend ? `<div class="mini-stat-trend">${trend}</div>` : ''}
            </div>
        </div>
    `;
}

// ==========================================
// EMPTY STATE
// ==========================================

/**
 * Render Empty State (placeholder)
 */
export function renderEmptyState(config) {
    const {
        icon = '📊',
        title = 'Keine Daten',
        description = 'Es sind noch keine Daten vorhanden.',
        actionLabel,
        actionOnClick
    } = config;
    
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">${title}</div>
            <div class="empty-state-description">${description}</div>
            ${actionLabel ? `
                <button class="btn btn-primary" onclick="${actionOnClick}">
                    ${actionLabel}
                </button>
            ` : ''}
        </div>
    `;
}

// ==========================================
// EXPORT ALL
// ==========================================

export default {
    // Loading & Errors
    renderLoadingWidget,
    renderErrorWidget,
    renderNoDataWidget,
    
    // KPI Cards
    renderKPICard,
    
    // Breakdown Bars
    renderBreakdownBar,
    renderBreakdownBars,
    
    // Insights & Recommendations
    renderInsightItem,
    renderInsightsBox,
    renderRecommendationItem,
    renderRecommendationsBox,
    
    // Status & Badges
    renderStatusBadge,
    renderMetricComparison,
    
    // Tables
    renderDataTable,
    
    // Boxes
    renderInfoBox,
    renderWarningBox,
    renderSuccessBox,
    
    // Progress
    renderProgressBar,
    
    // Cards
    renderCard,
    
    // Mini Stats
    renderMiniStat,
    
    // Empty State
    renderEmptyState,
    
    // Colors
    HORVATH_COLORS
};