/**
 * ALBO Solutions - Portfolio Cockpit Module
 * Horváth & Partners Style BCG Portfolio Management
 * 
 * Features:
 * - BCG Matrix (Bubble Chart)
 * - Portfolio KPIs
 * - Strategic Recommendations
 */

import { state } from '../state.js';

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

/**
 * Render Portfolio Cockpit
 * @public
 */
export function renderCockpit() {
    console.log('📊 Rendering Horváth Portfolio Cockpit...');
    
    // 1. Render Portfolio KPIs
    renderPortfolioKPIs();
    
    // 2. Render BCG Matrix
    renderBCGMatrix();
    
    // 3. Render Strategic Recommendations
    renderStrategicRecommendations();
}

// ==========================================
// PORTFOLIO KPIs
// ==========================================

/**
 * Calculate Portfolio-Level KPIs
 */
function calculatePortfolioKPIs() {
    const projects = state.getAllProjekte();
    
    if (!projects || projects.length === 0) {
        return {
            totalProjects: 0,
            activeProjects: 0,
            totalRevenue: 0,
            avgDB3: 0,
            riskProjects: 0
        };
    }
    
    let totalRevenue = 0;
    let totalDB3 = 0;
    
    projects.forEach(projekt => {
        const artikel = state.getArtikelByProjekt(projekt.id);
        
        artikel.forEach(art => {
            for (let year = 2025; year <= 2031; year++) {
                const volume = art.volumes?.[year] || 0;
                const price = art.prices?.[year] || 0;
                const hk = art.hk || 0;
                
                const revenue = volume * price;
                const costs = volume * hk;
                
                totalRevenue += revenue;
                totalDB3 += (revenue - costs);
            }
        });
    });
    
    const avgDB3Percent = totalRevenue > 0 ? (totalDB3 / totalRevenue * 100) : 0;
    
    return {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'Aktiv').length,
        totalRevenue: totalRevenue / 1000000, // Convert to M€
        avgDB3: avgDB3Percent,
        riskProjects: projects.filter(p => p.status === 'On Hold').length
    };
}

/**
 * Render Portfolio KPI Cards
 */
function renderPortfolioKPIs() {
    const kpis = calculatePortfolioKPIs();
    
    const container = document.querySelector('.portfolio-kpis');
    if (!container) return;
    
    container.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-icon">📁</div>
            <div class="kpi-content">
                <div class="kpi-value">${kpis.totalProjects}</div>
                <div class="kpi-label">Projekte im Portfolio</div>
                <div class="kpi-sub">${kpis.activeProjects} aktiv</div>
            </div>
        </div>

        <div class="kpi-card">
            <div class="kpi-icon">💰</div>
            <div class="kpi-content">
                <div class="kpi-value">${kpis.totalRevenue.toFixed(1)}M€</div>
                <div class="kpi-label">Gesamt-Umsatz</div>
                <div class="kpi-sub">Portfolio 2025-2031</div>
            </div>
        </div>

        <div class="kpi-card">
            <div class="kpi-icon">📊</div>
            <div class="kpi-content">
                <div class="kpi-value">${kpis.avgDB3.toFixed(1)}%</div>
                <div class="kpi-label">Ø DB3-Marge</div>
                <div class="kpi-sub ${kpis.avgDB3 > 30 ? 'positive' : 'neutral'}">
                    ${kpis.avgDB3 > 30 ? 'Exzellent' : 'Solide'}
                </div>
            </div>
        </div>

        <div class="kpi-card ${kpis.riskProjects > 0 ? 'warning' : ''}">
            <div class="kpi-icon">${kpis.riskProjects > 0 ? '⚠️' : '✅'}</div>
            <div class="kpi-content">
                <div class="kpi-value">${kpis.activeProjects}/${kpis.totalProjects}</div>
                <div class="kpi-label">Portfolio Status</div>
                <div class="kpi-sub ${kpis.riskProjects > 0 ? 'warning' : 'positive'}">
                    ${kpis.riskProjects > 0 ? `${kpis.riskProjects} Risiko` : 'On Track'}
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// BCG MATRIX
// ==========================================

/**
 * Calculate BCG Position for each project
 */
function calculateBCGPositions() {
    const projects = state.getAllProjekte();
    
    return projects.map(projekt => {
        const artikel = state.getArtikelByProjekt(projekt.id);
        
        // Calculate revenue
        let revenue = 0;
        let db3 = 0;
        
        artikel.forEach(art => {
            for (let year = 2025; year <= 2031; year++) {
                const volume = art.volumes?.[year] || 0;
                const price = art.prices?.[year] || 0;
                const hk = art.hk || 0;
                
                const yearRevenue = volume * price;
                const yearCosts = volume * hk;
                
                revenue += yearRevenue;
                db3 += (yearRevenue - yearCosts);
            }
        });
        
        const db3Margin = revenue > 0 ? (db3 / revenue * 100) : 0;
        
        // BCG Parameters (can be configured per project)
        const marketGrowth = projekt.marketGrowth || getRandomGrowth();
        const relativeMarketShare = projekt.relativeMarketShare || getRandomMarketShare();
        
        return {
            id: projekt.id,
            name: projekt.name,
            x: relativeMarketShare,  // Relative Market Share (0-2)
            y: marketGrowth,          // Market Growth % (0-20)
            r: Math.sqrt(revenue) / 800, // Bubble size
            revenue: revenue / 1000000,   // M€
            db3Margin: db3Margin,
            status: projekt.status,
            quadrant: getQuadrant(relativeMarketShare, marketGrowth)
        };
    });
}

/**
 * Get BCG Quadrant
 */
function getQuadrant(x, y) {
    const isHighMarketShare = x >= 1.0;
    const isHighGrowth = y >= 10;
    
    if (isHighMarketShare && isHighGrowth) return 'star';
    if (!isHighMarketShare && isHighGrowth) return 'question';
    if (isHighMarketShare && !isHighGrowth) return 'cash-cow';
    return 'dog';
}

/**
 * Get bubble color based on DB3 margin
 */
function getBubbleColor(db3Margin, quadrant) {
    // High margin
    if (db3Margin > 30) return 'rgba(16, 185, 129, 0.8)'; // Green
    // Medium margin
    if (db3Margin > 15) return 'rgba(59, 130, 246, 0.8)'; // Blue
    // Low margin
    if (db3Margin > 0) return 'rgba(245, 158, 11, 0.8)'; // Yellow
    // Negative margin
    return 'rgba(239, 68, 68, 0.8)'; // Red
}

/**
 * Render BCG Matrix (Chart.js Bubble)
 */
function renderBCGMatrix() {
    const canvas = document.getElementById('bcg-chart');
    if (!canvas) {
        console.warn('BCG canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const positions = calculateBCGPositions();
    
    // Destroy existing chart
    if (window.bcgChart) {
        window.bcgChart.destroy();
    }
    
    // Create BCG Matrix
    window.bcgChart = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Portfolio',
                data: positions,
                backgroundColor: positions.map(p => getBubbleColor(p.db3Margin, p.quadrant)),
                borderColor: positions.map(p => getBubbleColor(p.db3Margin, p.quadrant).replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'BCG Portfolio Matrix',
                    font: { size: 18, weight: 'bold' },
                    padding: 20
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return [
                                `${point.name}`,
                                `Revenue: €${point.revenue.toFixed(1)}M`,
                                `DB3 Marge: ${point.db3Margin.toFixed(1)}%`,
                                `Marktanteil: ${point.x.toFixed(2)}x`,
                                `Wachstum: ${point.y.toFixed(1)}%`,
                                `Quadrant: ${getQuadrantName(point.quadrant)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Relativer Marktanteil',
                        font: { size: 14, weight: 'bold' }
                    },
                    min: 0,
                    max: 2,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + 'x';
                        }
                    },
                    grid: {
                        color: function(context) {
                            return context.tick.value === 1.0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: function(context) {
                            return context.tick.value === 1.0 ? 2 : 1;
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Marktwachstum (%)',
                        font: { size: 14, weight: 'bold' }
                    },
                    min: 0,
                    max: 20,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: function(context) {
                            return context.tick.value === 10 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: function(context) {
                            return context.tick.value === 10 ? 2 : 1;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const projektId = positions[elements[0].index].id;
                    console.log('BCG Click: Opening projekt', projektId);
                    if (window.openProjektDetail) {
                        window.openProjektDetail(projektId);
                    }
                }
            }
        }
    });
    
    // Add quadrant labels
    addQuadrantLabels(canvas);
}

/**
 * Add quadrant labels to canvas
 */
function addQuadrantLabels(canvas) {
    const container = canvas.parentElement;
    
    // Remove existing labels
    container.querySelectorAll('.bcg-label').forEach(el => el.remove());
    
    const labels = [
        { text: '⭐ STARS', top: '15%', left: '75%', color: '#10b981' },
        { text: '❓ QUESTION MARKS', top: '15%', left: '25%', color: '#f59e0b' },
        { text: '💰 CASH COWS', top: '85%', left: '75%', color: '#3b82f6' },
        { text: '🐕 POOR DOGS', top: '85%', left: '25%', color: '#ef4444' }
    ];
    
    labels.forEach(label => {
        const div = document.createElement('div');
        div.className = 'bcg-label';
        div.textContent = label.text;
        div.style.cssText = `
            position: absolute;
            top: ${label.top};
            left: ${label.left};
            transform: translate(-50%, -50%);
            font-size: 14px;
            font-weight: 700;
            color: ${label.color};
            text-shadow: 0 0 4px white;
            pointer-events: none;
            z-index: 10;
        `;
        container.appendChild(div);
    });
}

/**
 * Get quadrant display name
 */
function getQuadrantName(quadrant) {
    const names = {
        'star': '⭐ Stars',
        'question': '❓ Question Marks',
        'cash-cow': '💰 Cash Cows',
        'dog': '🐕 Poor Dogs'
    };
    return names[quadrant] || quadrant;
}

// ==========================================
// STRATEGIC RECOMMENDATIONS
// ==========================================

/**
 * Render Strategic Recommendations
 */
function renderStrategicRecommendations() {
    const positions = calculateBCGPositions();
    
    // Group by quadrant
    const byQuadrant = {
        star: positions.filter(p => p.quadrant === 'star'),
        question: positions.filter(p => p.quadrant === 'question'),
        'cash-cow': positions.filter(p => p.quadrant === 'cash-cow'),
        dog: positions.filter(p => p.quadrant === 'dog')
    };
    
    const container = document.querySelector('.strategic-recommendations');
    if (!container) return;
    
    container.innerHTML = `
        <div class="recommendations-header">
            <h2>📋 Strategische Handlungsempfehlungen</h2>
            <p>BCG-basierte Portfolio-Steuerung nach Horváth-Methodik</p>
        </div>

        <div class="recommendations-grid">
            <!-- STARS -->
            <div class="recommendation-card star">
                <div class="rec-header">
                    <div class="rec-icon">⭐</div>
                    <div>
                        <h3>STARS → Investieren & Ausbauen</h3>
                        <div class="rec-count">${byQuadrant.star.length} Projekte</div>
                    </div>
                </div>
                <div class="rec-content">
                    ${byQuadrant.star.length > 0 ? `
                        <div class="rec-projects">
                            ${byQuadrant.star.map(p => `
                                <div class="rec-project">
                                    <strong>${p.name}</strong>
                                    <span>€${p.revenue.toFixed(1)}M • ${p.db3Margin.toFixed(1)}% DB3</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="rec-action">
                            <strong>💡 Empfehlung:</strong> Marktführerschaft verteidigen durch kontinuierliche Innovation und Skalierung
                        </div>
                    ` : `
                        <div class="rec-empty">Keine Projekte in diesem Quadranten</div>
                    `}
                </div>
            </div>

            <!-- QUESTION MARKS -->
            <div class="recommendation-card question">
                <div class="rec-header">
                    <div class="rec-icon">❓</div>
                    <div>
                        <h3>QUESTION MARKS → Prüfen & Entscheiden</h3>
                        <div class="rec-count">${byQuadrant.question.length} Projekte</div>
                    </div>
                </div>
                <div class="rec-content">
                    ${byQuadrant.question.length > 0 ? `
                        <div class="rec-projects">
                            ${byQuadrant.question.map(p => `
                                <div class="rec-project">
                                    <strong>${p.name}</strong>
                                    <span>€${p.revenue.toFixed(1)}M • ${p.db3Margin.toFixed(1)}% DB3</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="rec-action">
                            <strong>💡 Empfehlung:</strong> Go/No-Go Entscheidung treffen - entweder massiv investieren oder divest
                        </div>
                    ` : `
                        <div class="rec-empty">Keine Projekte in diesem Quadranten</div>
                    `}
                </div>
            </div>

            <!-- CASH COWS -->
            <div class="recommendation-card cash-cow">
                <div class="rec-header">
                    <div class="rec-icon">💰</div>
                    <div>
                        <h3>CASH COWS → Abschöpfen</h3>
                        <div class="rec-count">${byQuadrant['cash-cow'].length} Projekte</div>
                    </div>
                </div>
                <div class="rec-content">
                    ${byQuadrant['cash-cow'].length > 0 ? `
                        <div class="rec-projects">
                            ${byQuadrant['cash-cow'].map(p => `
                                <div class="rec-project">
                                    <strong>${p.name}</strong>
                                    <span>€${p.revenue.toFixed(1)}M • ${p.db3Margin.toFixed(1)}% DB3</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="rec-action">
                            <strong>💡 Empfehlung:</strong> Cashflows nutzen um Stars zu finanzieren, keine großen Neuinvestitionen
                        </div>
                    ` : `
                        <div class="rec-empty">Keine Projekte in diesem Quadranten</div>
                    `}
                </div>
            </div>

            <!-- POOR DOGS -->
            <div class="recommendation-card dog">
                <div class="rec-header">
                    <div class="rec-icon">🐕</div>
                    <div>
                        <h3>POOR DOGS → Divest oder Restrukturieren</h3>
                        <div class="rec-count">${byQuadrant.dog.length} Projekte</div>
                    </div>
                </div>
                <div class="rec-content">
                    ${byQuadrant.dog.length > 0 ? `
                        <div class="rec-projects">
                            ${byQuadrant.dog.map(p => `
                                <div class="rec-project warning">
                                    <strong>${p.name}</strong>
                                    <span>€${p.revenue.toFixed(1)}M • ${p.db3Margin.toFixed(1)}% DB3</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="rec-action warning">
                            <strong>⚠️ Empfehlung:</strong> Exit-Strategie entwickeln oder fundamentale Restrukturierung prüfen
                        </div>
                    ` : `
                        <div class="rec-empty positive">Keine Projekte in diesem Quadranten - Portfolio ist gesund!</div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get random market growth (for demo)
 */
function getRandomGrowth() {
    return 3 + Math.random() * 15; // 3-18%
}

/**
 * Get random market share (for demo)
 */
function getRandomMarketShare() {
    return 0.3 + Math.random() * 1.5; // 0.3-1.8x
}

// ==========================================
// EXPORTS
// ==========================================

export default {
    renderCockpit
};
