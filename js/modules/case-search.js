/**
 * ALBO Case Search Module
 * Semantic Search für historische Cases
 * Style: Vanilla JS (wie cockpit.js)
 */

import { state } from '../state.js';
import * as helpers from '../helpers.js';

/**
 * Render Case Search Panel (AI Sidebar)
 * @param {object} currentProject - Aktuelles Projekt für Auto-Search
 */
export function renderCaseSearch(currentProject = null) {
    console.log('🔍 Rendering Case Search Panel...');
    
    const container = document.querySelector('#case-search-panel');
    if (!container) {
        console.error('Case Search container not found');
        return;
    }
    
    // Render HTML
    container.innerHTML = renderCaseSearchHTML(currentProject);
    
    // Attach Event Handlers
    attachCaseSearchHandlers(currentProject);
    
    // Auto-search if current project exists
    if (currentProject) {
        setTimeout(() => autoSearchSimilar(currentProject), 500);
    }
    
    console.log('✅ Case Search Panel rendered');
}

/**
 * Render Case Search HTML
 */
function renderCaseSearchHTML(currentProject) {
    return `
        <div class="case-search-container">
            <!-- Header -->
            <div class="case-search-header">
                <div class="case-search-title">
                    <span class="case-search-icon">🔍</span>
                    <h3>Ähnliche Cases</h3>
                </div>
                <p class="case-search-subtitle">Lerne aus vergangenen Projekten</p>
            </div>

            <!-- Search Form -->
            <div class="case-search-form">
                <div class="case-search-input-group">
                    <input 
                        type="text" 
                        id="case-search-query"
                        class="case-search-input"
                        placeholder="z.B.: ERP-Projekte mit ROI > 30%"
                        value="${currentProject ? `Finde Cases wie: ${currentProject.name}` : ''}"
                    />
                    <button id="case-search-button" class="case-search-button">
                        🔍
                    </button>
                </div>

                <!-- Filters (collapsible) -->
                <details class="case-search-filters">
                    <summary class="case-search-filters-summary">Filter anwenden</summary>
                    <div class="case-search-filters-grid">
                        <div class="case-search-filter-group">
                            <label class="case-search-filter-label">Business Unit</label>
                            <select id="filter-business-unit" class="case-search-filter-select">
                                <option value="">Alle</option>
                                <option value="automation">Automation</option>
                                <option value="digitalization">Digitalization</option>
                                <option value="Entwicklung">Entwicklung</option>
                            </select>
                        </div>

                        <div class="case-search-filter-group">
                            <label class="case-search-filter-label">Status</label>
                            <select id="filter-status" class="case-search-filter-select">
                                <option value="">Alle</option>
                                <option value="abgeschlossen">Abgeschlossen</option>
                                <option value="abgebrochen">Abgebrochen</option>
                                <option value="aktiv">Aktiv</option>
                            </select>
                        </div>

                        <div class="case-search-filter-group">
                            <label class="case-search-filter-label">Min. ROI (%)</label>
                            <input 
                                type="number" 
                                id="filter-roi-min"
                                class="case-search-filter-input"
                                placeholder="z.B. 20"
                            />
                        </div>

                        <div class="case-search-filter-group">
                            <label class="case-search-filter-label">Max. ROI (%)</label>
                            <input 
                                type="number" 
                                id="filter-roi-max"
                                class="case-search-filter-input"
                                placeholder="z.B. 80"
                            />
                        </div>
                    </div>
                </details>
            </div>

            <!-- Results Container -->
            <div id="case-search-results" class="case-search-results">
                <div class="case-search-initial">
                    <div class="case-search-initial-icon">💡</div>
                    <p class="case-search-initial-text">
                        Suche nach ähnlichen Cases um aus vergangenen Projekten zu lernen
                    </p>
                    <p class="case-search-initial-hint">
                        Tipp: Beschreibe was du suchst, z.B. "ERP-Projekte mit ROI > 30%"
                    </p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach Event Handlers
 */
function attachCaseSearchHandlers(currentProject) {
    // Search Button
    const searchButton = document.getElementById('case-search-button');
    const searchInput = document.getElementById('case-search-query');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            handleSearch();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
}

/**
 * Handle Search
 */
async function handleSearch() {
    const query = document.getElementById('case-search-query')?.value;
    
    if (!query || query.trim() === '') {
        showError('Bitte gib eine Suchanfrage ein');
        return;
    }
    
    // Get Filters
    const filters = {
        business_unit: document.getElementById('filter-business-unit')?.value || null,
        status: document.getElementById('filter-status')?.value || null,
        roi_min: document.getElementById('filter-roi-min')?.value 
            ? parseFloat(document.getElementById('filter-roi-min').value) / 100 
            : null,
        roi_max: document.getElementById('filter-roi-max')?.value 
            ? parseFloat(document.getElementById('filter-roi-max').value) / 100 
            : null
    };
    
    // Clean null filters
    Object.keys(filters).forEach(key => {
        if (filters[key] === null || filters[key] === '') {
            delete filters[key];
        }
    });
    
    await searchCases(query, filters);
}

/**
 * Auto-Search for similar cases based on current project
 */
async function autoSearchSimilar(project) {
    if (!project) return;
    
    const query = `
        Finde ähnliche Cases wie: ${project.name}.
        Business Unit: ${project.division || 'N/A'}.
        Beschreibung: ${project.description || project.geschaeftsmodell || 'N/A'}
    `.trim();
    
    const filters = {
        business_unit: project.division,
        status: 'abgeschlossen' // Nur abgeschlossene für Learnings
    };
    
    await searchCases(query, filters, true);
}

/**
 * Search Cases via API
 */
async function searchCases(query, filters = {}, isAutoSearch = false) {
    const resultsContainer = document.getElementById('case-search-results');
    if (!resultsContainer) return;
    
    // Show Loading
    resultsContainer.innerHTML = renderLoading();
    
    try {
        // TODO: Get customer ID from auth/state
        const customerId = 'demo_customer'; // Replace with actual customer ID
        
        const response = await fetch('/api/cases/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': state.getCurrentUserId?.() || 'anonymous' // If available
            },
            body: JSON.stringify({
                query,
                filters,
                limit: 5,
                customerId
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Search failed');
        }
        
        const data = await response.json();
        
        // Render Results
        if (data.results && data.results.length > 0) {
            resultsContainer.innerHTML = renderResults(data.results, isAutoSearch);
            attachResultHandlers();
        } else {
            resultsContainer.innerHTML = renderNoResults(query);
        }
        
    } catch (error) {
        console.error('❌ Case Search Error:', error);
        resultsContainer.innerHTML = renderError(error.message);
    }
}

/**
 * Render Loading State
 */
function renderLoading() {
    return `
        <div class="case-search-loading">
            <div class="case-search-spinner"></div>
            <p>Durchsuche Cases...</p>
        </div>
    `;
}

/**
 * Render Results
 */
function renderResults(results, isAutoSearch = false) {
    return `
        <div class="case-search-results-header">
            ${isAutoSearch ? '🎯 ' : ''}${results.length} ähnliche Cases gefunden
        </div>
        <div class="case-search-results-list">
            ${results.map((result, idx) => renderResultCard(result, idx + 1)).join('')}
        </div>
    `;
}

/**
 * Render Single Result Card
 */
function renderResultCard(result, rank) {
    const similarityPercent = result.similarity;
    const roiPercent = result.roi_actual ? Math.round(result.roi_actual * 100) : null;
    
    // Status Colors
    const statusColors = {
        'abgeschlossen': '#10b981',
        'abgebrochen': '#ef4444',
        'aktiv': '#f59e0b',
        'konzept': '#64748b'
    };
    const statusColor = statusColors[result.status] || '#64748b';
    
    // Similarity Color
    const similarityColor = similarityPercent >= 80 ? '#10b981' : 
                           similarityPercent >= 70 ? '#f59e0b' : '#64748b';
    
    return `
        <div class="case-result-card" data-case-id="${result.case_id}">
            <!-- Header -->
            <div class="case-result-header">
                <span class="case-result-rank">#${rank}</span>
                <span class="case-result-similarity" style="background: ${similarityColor}">
                    ${similarityPercent}% Match
                </span>
            </div>
            
            <!-- Title -->
            <h4 class="case-result-title">${helpers.escapeHtml(result.case_name)}</h4>
            
            <!-- Meta -->
            <div class="case-result-meta">
                <span class="case-result-status" style="background: ${statusColor}">
                    ${helpers.escapeHtml(result.status)}
                </span>
                ${result.business_unit ? `
                    <span class="case-result-unit">${helpers.escapeHtml(result.business_unit)}</span>
                ` : ''}
            </div>
            
            <!-- KPIs -->
            <div class="case-result-kpis">
                ${roiPercent !== null ? `
                    <div class="case-result-kpi">
                        <span class="case-result-kpi-label">ROI:</span>
                        <span class="case-result-kpi-value" style="color: ${roiPercent >= 30 ? '#10b981' : roiPercent >= 0 ? '#f59e0b' : '#ef4444'}">
                            ${roiPercent}%
                        </span>
                    </div>
                ` : ''}
                
                ${result.db2_actual ? `
                    <div class="case-result-kpi">
                        <span class="case-result-kpi-label">DB2:</span>
                        <span class="case-result-kpi-value">
                            ${helpers.formatRevenue(result.db2_actual)}
                        </span>
                    </div>
                ` : ''}
                
                ${result.rating ? `
                    <div class="case-result-kpi">
                        <span class="case-result-kpi-label">Rating:</span>
                        <span class="case-result-kpi-value">
                            ${'⭐'.repeat(Math.round(result.rating))}
                        </span>
                    </div>
                ` : ''}
            </div>
            
            <!-- Summary -->
            ${result.summary ? `
                <p class="case-result-summary">${helpers.escapeHtml(result.summary)}</p>
            ` : ''}
            
            <!-- Tags -->
            ${result.tags && result.tags.length > 0 ? `
                <div class="case-result-tags">
                    ${result.tags.slice(0, 3).map(tag => `
                        <span class="case-result-tag">${helpers.escapeHtml(tag)}</span>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- Action -->
            <button class="case-result-action" data-case-id="${result.case_id}">
                Details ansehen →
            </button>
        </div>
    `;
}

/**
 * Attach Result Handlers
 */
function attachResultHandlers() {
    const actionButtons = document.querySelectorAll('.case-result-action');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const caseId = button.getAttribute('data-case-id');
            loadCaseDetails(caseId);
        });
    });
    
    const cards = document.querySelectorAll('.case-result-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('case-result-action')) {
                const caseId = card.getAttribute('data-case-id');
                loadCaseDetails(caseId);
            }
        });
    });
}

/**
 * Load Case Details
 */
async function loadCaseDetails(caseId) {
    console.log('📄 Loading case details:', caseId);
    
    // TODO: Implement Case Detail Modal
    // For now: Alert
    alert(`Case Details für ${caseId} wird geladen...\n\nTODO: Implementiere Case Detail Modal`);
    
    // Example implementation:
    /*
    try {
        const response = await fetch(`/api/cases/${caseId}`);
        const caseData = await response.json();
        
        // Open Modal with case details
        openCaseDetailModal(caseData);
        
    } catch (error) {
        console.error('Failed to load case:', error);
    }
    */
}

/**
 * Render No Results
 */
function renderNoResults(query) {
    return `
        <div class="case-search-no-results">
            <div class="case-search-no-results-icon">📭</div>
            <p class="case-search-no-results-text">
                Keine ähnlichen Cases für "${helpers.escapeHtml(query)}" gefunden
            </p>
            <p class="case-search-no-results-hint">
                Versuche andere Suchbegriffe oder ändere die Filter
            </p>
        </div>
    `;
}

/**
 * Render Error
 */
function renderError(message) {
    return `
        <div class="case-search-error">
            <div class="case-search-error-icon">⚠️</div>
            <p class="case-search-error-text">
                Fehler bei der Suche
            </p>
            <p class="case-search-error-detail">
                ${helpers.escapeHtml(message)}
            </p>
        </div>
    `;
}

/**
 * Show Error Toast
 */
function showError(message) {
    // TODO: Implement toast notification system
    console.error('Case Search Error:', message);
    alert(message);
}

// Export
export default {
    renderCaseSearch
};