/**
 * SERVICE MODEL
 * Consulting/Beratung/Professional Services
 * 
 * Use Cases:
 * - Consulting Firm (Tages-/Stundensatz basiert)
 * - Professional Services (Projektbasiert)
 * - Implementation Services (bei Hardware/Software Verkauf)
 * 
 * Features:
 * - FTE Planung (Hiring Plan)
 * - Utilization Rate Tracking
 * - Tagessatz/Stundensatz
 * - Gross Margin Berechnung
 */

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export function renderServiceModel(artikel, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('👔 Rendering Service Model for:', artikel.name);
  
  // Initialize service data
  if (!artikel.service_model_data) {
    artikel.service_model_data = initializeServiceData(artikel);
  }
  
  const data = artikel.service_model_data;
  
  container.innerHTML = `
    <div class="service-model-container">
      
      <!-- Header -->
      <div class="service-header">
        <div>
          <h2 class="service-title">👔 ${artikel.name}</h2>
          <p class="service-subtitle">Consulting/Services Revenue Model</p>
        </div>
        <div class="service-badge">Service Model</div>
      </div>
      
      <!-- Zeitrahmen -->
      <div class="section-card">
        <h3 class="section-title">⏱️ Zeitrahmen</h3>
        <div class="input-row">
          <div class="input-group">
            <label class="input-label">Startdatum</label>
            <input 
              type="month" 
              id="svc-date" 
              value="${data.release_date}"
              class="form-input"
            >
          </div>
          <div class="input-group">
            <label class="input-label">Planungshorizont</label>
            <div class="horizon-buttons">
              <button class="horizon-btn ${data.time_horizon === 3 ? 'active' : ''}" data-years="3">3 Jahre</button>
              <button class="horizon-btn ${data.time_horizon === 5 ? 'active' : ''}" data-years="5">5 Jahre</button>
              <button class="horizon-btn ${data.time_horizon === 7 ? 'active' : ''}" data-years="7">7 Jahre</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Service Type -->
      <div class="section-card">
        <h3 class="section-title">💼 Service-Typ</h3>
        <div class="service-type-selector">
          <div 
            class="service-type-card ${data.service_type === 'time-based' ? 'active' : ''}" 
            onclick="window.selectServiceType('time-based')"
          >
            <div class="service-type-icon">⏱️</div>
            <div class="service-type-name">Zeit-basiert</div>
            <div class="service-type-desc">Tagessatz oder Stundensatz</div>
          </div>
          <div 
            class="service-type-card ${data.service_type === 'project-based' ? 'active' : ''}" 
            onclick="window.selectServiceType('project-based')"
          >
            <div class="service-type-icon">📋</div>
            <div class="service-type-name">Projekt-basiert</div>
            <div class="service-type-desc">Festpreis pro Projekt</div>
          </div>
        </div>
      </div>
      
      <!-- FTE Planung -->
      <div class="section-card">
        <h3 class="section-title">👥 Team-Kapazität (FTE)</h3>
        <p class="section-hint">Wie viele Berater/Mitarbeiter arbeiten im Service?</p>
        
        <div class="fte-planning">
          <div class="input-group">
            <label class="input-label">Start-Team Größe (FTE)</label>
            <input 
              type="number" 
              id="svc-start-fte" 
              value="${data.start_fte}"
              class="form-input"
              placeholder="10"
              step="0.5"
            >
            <span class="input-hint">z.B. 10 Vollzeit-Mitarbeiter</span>
          </div>
          
          <div class="input-group">
            <label class="input-label">Team-Wachstum</label>
            <select id="svc-team-growth" class="form-select">
              <option value="konstant" ${data.team_growth === 'konstant' ? 'selected' : ''}>Konstant (0 neue FTE/Jahr)</option>
              <option value="moderat" ${data.team_growth === 'moderat' ? 'selected' : ''}>Moderat (+2 FTE/Jahr)</option>
              <option value="schnell" ${data.team_growth === 'schnell' ? 'selected' : ''}>Schnell (+5 FTE/Jahr)</option>
              <option value="aggressiv" ${data.team_growth === 'aggressiv' ? 'selected' : ''}>Aggressiv (+10 FTE/Jahr)</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Pricing -->
      <div class="section-card">
        <h3 class="section-title">💰 Preisgestaltung</h3>
        
        <div class="input-row">
          <div class="input-group">
            <label class="input-label">
              ${data.service_type === 'time-based' ? 'Tagessatz (€)' : 'Projekt-Preis (€)'}
            </label>
            <input 
              type="number" 
              id="svc-rate" 
              value="${data.rate}"
              class="form-input"
              placeholder="${data.service_type === 'time-based' ? '1500' : '50000'}"
              step="50"
            >
            <span class="input-hint">
              ${data.service_type === 'time-based' ? 'Durchschnitt über alle Senioritäten' : 'Durchschnittlicher Projektumfang'}
            </span>
          </div>
          
          <div class="input-group" ${data.service_type === 'project-based' ? 'style="display:none;"' : ''}>
            <label class="input-label">Verfügbare Tage pro FTE</label>
            <input 
              type="number" 
              id="svc-available-days" 
              value="${data.available_days}"
              class="form-input"
              placeholder="220"
            >
            <span class="input-hint">Typisch: 220-230 Tage (52 Wochen - Urlaub - Feiertage)</span>
          </div>
        </div>
      </div>
      
      <!-- Utilization -->
      <div class="section-card">
        <h3 class="section-title">📊 Auslastung (Utilization)</h3>
        <p class="section-hint">
          ${data.service_type === 'time-based' 
            ? 'Wie viele der verfügbaren Tage werden verrechnet?' 
            : 'Wie viele Projekte werden pro FTE abgeschlossen?'}
        </p>
        
        <div class="utilization-section">
          <div class="input-group">
            <label class="input-label">
              ${data.service_type === 'time-based' ? 'Ziel-Utilization (%)' : 'Projekte pro FTE/Jahr'}
            </label>
            <input 
              type="number" 
              id="svc-utilization" 
              value="${data.utilization}"
              class="form-input"
              placeholder="${data.service_type === 'time-based' ? '75' : '4'}"
              min="${data.service_type === 'time-based' ? '0' : '1'}"
              max="${data.service_type === 'time-based' ? '100' : '20'}"
              step="${data.service_type === 'time-based' ? '1' : '0.5'}"
            >
            <span class="input-hint">
              ${data.service_type === 'time-based' 
                ? 'Benchmark: 70-85% (Rest: Bench Time, interne Projekte)' 
                : 'Wie viele Projekte kann ein Berater parallel/sequenziell betreuen?'}
            </span>
          </div>
          
          <div class="utilization-calc">
            <div class="calc-item">
              <span class="calc-label">Verrechenbare Tage (${data.service_type === 'time-based' ? 'pro FTE' : 'gesamt'})</span>
              <span class="calc-value" id="billable-days">
                ${data.service_type === 'time-based' 
                  ? Math.round(data.available_days * (data.utilization / 100)) 
                  : Math.round(data.start_fte * data.utilization)
                } ${data.service_type === 'time-based' ? 'Tage' : 'Projekte'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Kosten -->
      <div class="section-card">
        <h3 class="section-title">💸 Kostenstruktur</h3>
        
        <div class="input-row">
          <div class="input-group">
            <label class="input-label">Durchschn. Personalkosten pro FTE (€)</label>
            <input 
              type="number" 
              id="svc-cost-per-fte" 
              value="${data.cost_per_fte}"
              class="form-input"
              placeholder="80000"
              step="5000"
            >
            <span class="input-hint">Inkl. Gehalt, Sozialversicherung, Benefits</span>
          </div>
          
          <div class="input-group">
            <label class="input-label">Overhead & Sonstige Kosten (%)</label>
            <input 
              type="number" 
              id="svc-overhead" 
              value="${data.overhead_rate}"
              class="form-input"
              placeholder="30"
              min="0"
              max="100"
              step="5"
            >
            <span class="input-hint">Office, Marketing, Admin, etc. (% vom Umsatz)</span>
          </div>
        </div>
        
        <div class="margin-calc">
          <div class="margin-item">
            <span class="margin-label">Geschätzte Gross Margin:</span>
            <span class="margin-value" id="estimated-margin">
              ${calculateEstimatedMargin(data)}%
            </span>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="action-buttons">
        <button class="btn btn-secondary" onclick="window.resetServiceModel()">
          🔄 Zurücksetzen
        </button>
        <button class="btn btn-primary" onclick="window.calculateServiceModel()">
          📊 Berechnen & Vorschau
        </button>
      </div>
      
      <!-- Preview -->
      <div id="service-preview" class="preview-container"></div>
      
    </div>
    
    ${renderServiceStyles()}
  `;
  
  // Attach event listeners
  attachServiceEventListeners(artikel);
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializeServiceData(artikel) {
  return {
    release_date: artikel.release_datum || new Date().toISOString().slice(0, 7),
    time_horizon: artikel.zeitraum || 5,
    service_type: 'time-based', // time-based or project-based
    
    start_fte: 10,
    team_growth: 'moderat', // konstant, moderat, schnell, aggressiv
    
    rate: 1500, // Tagessatz oder Projektpreis
    available_days: 220,
    utilization: 75, // % for time-based, number for project-based
    
    cost_per_fte: 80000,
    overhead_rate: 30,
    
    calculated: false,
    forecast: null
  };
}

function calculateEstimatedMargin(data) {
  if (data.service_type === 'time-based') {
    const billableDays = data.available_days * (data.utilization / 100);
    const revenuePerFTE = billableDays * data.rate;
    const costPerFTE = data.cost_per_fte;
    const grossProfit = revenuePerFTE - costPerFTE;
    const margin = (grossProfit / revenuePerFTE * 100);
    return margin.toFixed(1);
  } else {
    const projectsPerFTE = data.utilization;
    const revenuePerFTE = projectsPerFTE * data.rate;
    const costPerFTE = data.cost_per_fte;
    const grossProfit = revenuePerFTE - costPerFTE;
    const margin = (grossProfit / revenuePerFTE * 100);
    return margin.toFixed(1);
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachServiceEventListeners(artikel) {
  // Horizon buttons
  document.querySelectorAll('.horizon-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.horizon-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Real-time calculations
  const rateInput = document.getElementById('svc-rate');
  const utilizationInput = document.getElementById('svc-utilization');
  const availableDaysInput = document.getElementById('svc-available-days');
  const costInput = document.getElementById('svc-cost-per-fte');
  const startFTEInput = document.getElementById('svc-start-fte');
  
  const updateCalculations = () => {
    const serviceType = document.querySelector('.service-type-card.active')?.dataset?.type || 'time-based';
    const rate = parseFloat(rateInput?.value) || 0;
    const utilization = parseFloat(utilizationInput?.value) || 0;
    const availableDays = parseFloat(availableDaysInput?.value) || 220;
    const costPerFTE = parseFloat(costInput?.value) || 0;
    const startFTE = parseFloat(startFTEInput?.value) || 0;
    
    // Update billable days/projects
    const billableDaysElement = document.getElementById('billable-days');
    if (billableDaysElement) {
      if (serviceType === 'time-based') {
        const billableDays = Math.round(availableDays * (utilization / 100));
        billableDaysElement.textContent = `${billableDays} Tage`;
      } else {
        const projects = Math.round(startFTE * utilization);
        billableDaysElement.textContent = `${projects} Projekte`;
      }
    }
    
    // Update estimated margin
    const marginElement = document.getElementById('estimated-margin');
    if (marginElement) {
      let revenuePerFTE;
      if (serviceType === 'time-based') {
        const billableDays = availableDays * (utilization / 100);
        revenuePerFTE = billableDays * rate;
      } else {
        revenuePerFTE = utilization * rate;
      }
      
      const grossProfit = revenuePerFTE - costPerFTE;
      const margin = revenuePerFTE > 0 ? (grossProfit / revenuePerFTE * 100) : 0;
      marginElement.textContent = `${margin.toFixed(1)}%`;
      
      // Color coding
      if (margin >= 50) {
        marginElement.style.color = '#059669';
      } else if (margin >= 30) {
        marginElement.style.color = '#d97706';
      } else {
        marginElement.style.color = '#ef4444';
      }
    }
  };
  
  if (rateInput) rateInput.addEventListener('input', updateCalculations);
  if (utilizationInput) utilizationInput.addEventListener('input', updateCalculations);
  if (availableDaysInput) availableDaysInput.addEventListener('input', updateCalculations);
  if (costInput) costInput.addEventListener('input', updateCalculations);
  if (startFTEInput) startFTEInput.addEventListener('input', updateCalculations);
}

// ==========================================
// SERVICE TYPE SELECTION
// ==========================================

window.selectServiceType = function(type) {
  console.log('Switching to service type:', type);
  
  // Update active state
  document.querySelectorAll('.service-type-card').forEach(card => {
    card.classList.remove('active');
  });
  event.target.closest('.service-type-card').classList.add('active');
  
  // Update labels and hints
  const rateLabel = document.querySelector('#svc-rate').closest('.input-group').querySelector('.input-label');
  const rateHint = document.querySelector('#svc-rate').closest('.input-group').querySelector('.input-hint');
  const utilizationLabel = document.querySelector('#svc-utilization').closest('.input-group').querySelector('.input-label');
  const utilizationHint = document.querySelector('#svc-utilization').closest('.input-group').querySelector('.input-hint');
  const utilizationCalcLabel = document.querySelector('.utilization-calc .calc-label');
  
  if (type === 'time-based') {
    rateLabel.textContent = 'Tagessatz (€)';
    rateHint.textContent = 'Durchschnitt über alle Senioritäten';
    utilizationLabel.textContent = 'Ziel-Utilization (%)';
    utilizationHint.textContent = 'Benchmark: 70-85% (Rest: Bench Time, interne Projekte)';
    utilizationCalcLabel.textContent = 'Verrechenbare Tage (pro FTE)';
    
    // Show available days input
    const availableDaysGroup = document.querySelector('#svc-available-days').closest('.input-group');
    if (availableDaysGroup) availableDaysGroup.style.display = 'flex';
  } else {
    rateLabel.textContent = 'Projekt-Preis (€)';
    rateHint.textContent = 'Durchschnittlicher Projektumfang';
    utilizationLabel.textContent = 'Projekte pro FTE/Jahr';
    utilizationHint.textContent = 'Wie viele Projekte kann ein Berater parallel/sequenziell betreuen?';
    utilizationCalcLabel.textContent = 'Verrechenbare Projekte (gesamt)';
    
    // Hide available days input
    const availableDaysGroup = document.querySelector('#svc-available-days').closest('.input-group');
    if (availableDaysGroup) availableDaysGroup.style.display = 'none';
  }
  
  // Trigger recalculation
  attachServiceEventListeners(null);
};

// ==========================================
// CALCULATION
// ==========================================

window.calculateServiceModel = function() {
  console.log('📊 Calculating Service Model...');
  
  // Collect data
  const serviceType = document.querySelector('.service-type-card.active')?.dataset?.type || 'time-based';
  
  const data = {
    release_date: document.getElementById('svc-date').value,
    time_horizon: parseInt(document.querySelector('.horizon-btn.active')?.dataset.years) || 5,
    service_type: serviceType,
    
    start_fte: parseFloat(document.getElementById('svc-start-fte').value) || 0,
    team_growth: document.getElementById('svc-team-growth').value,
    
    rate: parseFloat(document.getElementById('svc-rate').value) || 0,
    available_days: parseFloat(document.getElementById('svc-available-days')?.value) || 220,
    utilization: parseFloat(document.getElementById('svc-utilization').value) || 0,
    
    cost_per_fte: parseFloat(document.getElementById('svc-cost-per-fte').value) || 0,
    overhead_rate: parseFloat(document.getElementById('svc-overhead').value) || 0
  };
  
  // Validate
  if (!data.start_fte || data.start_fte <= 0) {
    alert('⚠️ Bitte Start-Team Größe eingeben!');
    return;
  }
  
  if (!data.rate || data.rate <= 0) {
    alert('⚠️ Bitte Tagessatz/Projektpreis eingeben!');
    return;
  }
  
  // Calculate forecast
  const forecast = calculateServiceForecast(data);
  
  // Render preview
  renderServicePreview(forecast, data);
  
  console.log('✅ Service Model berechnet');
};

function calculateServiceForecast(data) {
  const years = data.time_horizon;
  const startYear = parseInt(data.release_date.split('-')[0]);
  
  const forecast = {
    years: [],
    fte: [],
    billable_units: [], // Days or Projects
    revenue: [],
    personnel_costs: [],
    overhead_costs: [],
    total_costs: [],
    gross_profit: [],
    gross_margin: []
  };
  
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    forecast.years.push(year);
    
    // FTE development
    const fte = calculateFTE(data.start_fte, data.team_growth, i);
    forecast.fte.push(fte);
    
    // Billable units (days or projects)
    let billableUnits;
    let revenue;
    
    if (data.service_type === 'time-based') {
      const billableDaysPerFTE = data.available_days * (data.utilization / 100);
      billableUnits = fte * billableDaysPerFTE;
      revenue = billableUnits * data.rate;
    } else {
      billableUnits = fte * data.utilization;
      revenue = billableUnits * data.rate;
    }
    
    forecast.billable_units.push(billableUnits);
    forecast.revenue.push(revenue);
    
    // Costs
    const personnelCosts = fte * data.cost_per_fte;
    const overheadCosts = revenue * (data.overhead_rate / 100);
    const totalCosts = personnelCosts + overheadCosts;
    
    forecast.personnel_costs.push(personnelCosts);
    forecast.overhead_costs.push(overheadCosts);
    forecast.total_costs.push(totalCosts);
    
    // Gross Profit
    const grossProfit = revenue - totalCosts;
    const grossMargin = revenue > 0 ? (grossProfit / revenue * 100) : 0;
    
    forecast.gross_profit.push(grossProfit);
    forecast.gross_margin.push(grossMargin);
  }
  
  return forecast;
}

function calculateFTE(startFTE, growthModel, yearIndex) {
  switch (growthModel) {
    case 'konstant':
      return startFTE;
    case 'moderat':
      return startFTE + (yearIndex * 2);
    case 'schnell':
      return startFTE + (yearIndex * 5);
    case 'aggressiv':
      return startFTE + (yearIndex * 10);
    default:
      return startFTE;
  }
}

// ==========================================
// PREVIEW RENDERING
// ==========================================

function renderServicePreview(forecast, data) {
  const container = document.getElementById('service-preview');
  if (!container) return;
  
  const totalRevenue = forecast.revenue.reduce((a, b) => a + b, 0);
  const totalGrossProfit = forecast.gross_profit.reduce((a, b) => a + b, 0);
  const avgMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue * 100) : 0;
  const peakFTE = Math.max(...forecast.fte);
  const totalBillableUnits = forecast.billable_units.reduce((a, b) => a + b, 0);
  
  container.innerHTML = `
    <div class="preview-section">
      <h3 class="preview-title">📊 Service Revenue Forecast</h3>
      
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">Total Revenue</div>
          <div class="summary-value" style="color: #2563eb;">${formatCurrency(totalRevenue)}</div>
          <div class="summary-hint">Über ${forecast.years.length} Jahre</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Peak Team</div>
          <div class="summary-value">${formatNumber(peakFTE, 1)} FTE</div>
          <div class="summary-hint">Maximale Teamgröße</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Total ${data.service_type === 'time-based' ? 'Days' : 'Projects'}</div>
          <div class="summary-value">${formatNumber(totalBillableUnits, 0)}</div>
          <div class="summary-hint">Verrechenbar</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Gross Margin</div>
          <div class="summary-value" style="color: ${avgMargin >= 50 ? '#059669' : avgMargin >= 30 ? '#d97706' : '#ef4444'};">
            ${formatNumber(avgMargin, 1)}%
          </div>
          <div class="summary-hint">Durchschnitt</div>
        </div>
      </div>
      
      <!-- Forecast Table -->
      <div class="forecast-table-container">
        <table class="forecast-table">
          <thead>
            <tr>
              <th>Metrik</th>
              ${forecast.years.map(year => `<th>${year}</th>`).join('')}
              <th style="background: #f3f4f6;">Avg/Σ</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #fafafa;">
              <td>Team (FTE)</td>
              ${forecast.fte.map(fte => `<td>${formatNumber(fte, 1)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(peakFTE, 1)}</td>
            </tr>
            <tr>
              <td>${data.service_type === 'time-based' ? 'Billable Days' : 'Projects'}</td>
              ${forecast.billable_units.map(u => `<td>${formatNumber(u, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(totalBillableUnits, 0)}</td>
            </tr>
            <tr style="background: #f0fdf4;">
              <td>Revenue (T€)</td>
              ${forecast.revenue.map(r => `<td>${formatNumber(r / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(totalRevenue / 1000, 0)}</td>
            </tr>
            <tr style="background: #fef2f2;">
              <td>Personnel Costs (T€)</td>
              ${forecast.personnel_costs.map(c => `<td style="color: #ef4444;">${formatNumber(c / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600; color: #ef4444;">${formatNumber(forecast.personnel_costs.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            <tr style="background: #fef2f2;">
              <td>Overhead (T€)</td>
              ${forecast.overhead_costs.map(c => `<td style="color: #ef4444;">${formatNumber(c / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 600; color: #ef4444;">${formatNumber(forecast.overhead_costs.reduce((a, b) => a + b, 0) / 1000, 0)}</td>
            </tr>
            <tr style="background: #dcfce7; font-weight: 600;">
              <td>Gross Profit (T€)</td>
              ${forecast.gross_profit.map(gp => `<td style="color: #059669;">${formatNumber(gp / 1000, 0)}</td>`).join('')}
              <td style="font-weight: 700; color: #059669;">${formatNumber(totalGrossProfit / 1000, 0)}</td>
            </tr>
            <tr style="background: #dbeafe;">
              <td>Gross Margin (%)</td>
              ${forecast.gross_margin.map(gm => `<td style="color: ${gm >= 50 ? '#059669' : gm >= 30 ? '#d97706' : '#ef4444'};">${formatNumber(gm, 1)}%</td>`).join('')}
              <td style="font-weight: 600;">${formatNumber(avgMargin, 1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Key Metrics -->
      <div class="key-metrics">
        <h4 style="margin: 0 0 16px; font-size: 15px; color: #1f2937;">📈 Key Metrics</h4>
        <div class="metrics-grid">
          <div class="metric-item">
            <span class="metric-label">Revenue per FTE (Ø):</span>
            <span class="metric-value">${formatCurrency(totalRevenue / forecast.fte.reduce((a, b) => a + b, 0))}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Gross Profit per FTE (Ø):</span>
            <span class="metric-value">${formatCurrency(totalGrossProfit / forecast.fte.reduce((a, b) => a + b, 0))}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Total ${data.service_type === 'time-based' ? 'Days' : 'Projects'}:</span>
            <span class="metric-value">${formatNumber(totalBillableUnits, 0)}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Avg Team Growth:</span>
            <span class="metric-value">${formatNumber((peakFTE - data.start_fte) / forecast.years.length, 1)} FTE/Jahr</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.resetServiceModel = function() {
  const confirmed = confirm('Möchten Sie alle Eingaben zurücksetzen?');
  if (!confirmed) return;
  
  location.reload();
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// ==========================================
// STYLES
// ==========================================

function renderServiceStyles() {
  return `
    <style>
      .service-model-container {
        padding: 24px;
        background: #f9fafb;
        min-height: 600px;
      }
      
      .service-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .service-title {
        margin: 0;
        font-size: 24px;
        color: #1f2937;
      }
      
      .service-subtitle {
        margin: 4px 0 0;
        color: #6b7280;
        font-size: 14px;
      }
      
      .service-badge {
        padding: 8px 16px;
        background: #10b981;
        color: white;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
      }
      
      .section-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
      }
      
      .section-title {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .section-hint {
        margin: -8px 0 16px;
        color: #6b7280;
        font-size: 13px;
      }
      
      .input-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      }
      
      .input-group {
        display: flex;
        flex-direction: column;
      }
      
      .input-label {
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }
      
      .form-input, .form-select {
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
      }
      
      .form-input:focus, .form-select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .input-hint {
        margin-top: 4px;
        font-size: 11px;
        color: #9ca3af;
      }
      
      .horizon-buttons {
        display: flex;
        gap: 8px;
      }
      
      .horizon-btn {
        flex: 1;
        padding: 10px;
        border: 2px solid #d1d5db;
        border-radius: 6px;
        background: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .horizon-btn:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .horizon-btn.active {
        border-color: #2563eb;
        background: #2563eb;
        color: white;
      }
      
      /* Service Type Selector */
      .service-type-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      
      .service-type-card {
        padding: 20px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .service-type-card:hover {
        border-color: #10b981;
        background: #f0fdf4;
      }
      
      .service-type-card.active {
        border-color: #059669;
        background: #dcfce7;
      }
      
      .service-type-icon {
        font-size: 40px;
        margin-bottom: 12px;
      }
      
      .service-type-name {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
      }
      
      .service-type-desc {
        font-size: 12px;
        color: #6b7280;
      }
      
      /* Calculations */
      .utilization-calc, .margin-calc {
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
        margin-top: 16px;
      }
      
      .calc-item, .margin-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .calc-label, .margin-label {
        font-size: 14px;
        color: #6b7280;
        font-weight: 600;
      }
      
      .calc-value, .margin-value {
        font-size: 20px;
        font-weight: 700;
        color: #059669;
      }
      
      /* Action Buttons */
      .action-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-bottom: 24px;
      }
      
      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
      }
      
      .btn-secondary:hover {
        background: #e5e7eb;
      }
      
      .btn-primary {
        background: #2563eb;
        color: white;
      }
      
      .btn-primary:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }
      
      /* Preview */
      .preview-container {
        margin-top: 24px;
      }
      
      .preview-section {
        background: white;
        border: 2px solid #10b981;
        border-radius: 12px;
        padding: 24px;
      }
      
      .preview-title {
        margin: 0 0 24px;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .summary-card {
        padding: 16px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-align: center;
      }
      
      .summary-label {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
        font-weight: 600;
      }
      
      .summary-value {
        font-size: 22px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .summary-hint {
        font-size: 11px;
        color: #9ca3af;
      }
      
      /* Forecast Table */
      .forecast-table-container {
        overflow-x: auto;
        margin-bottom: 24px;
      }
      
      .forecast-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      
      .forecast-table th {
        padding: 10px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        font-weight: 600;
        text-align: center;
        font-size: 12px;
      }
      
      .forecast-table td {
        padding: 8px;
        border: 1px solid #e5e7eb;
        text-align: right;
      }
      
      .forecast-table td:first-child {
        text-align: left;
        font-weight: 500;
        background: #fafafa;
      }
      
      /* Key Metrics */
      .key-metrics {
        padding: 20px;
        background: #f9fafb;
        border-radius: 8px;
      }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      
      .metric-item {
        display: flex;
        justify-content: space-between;
        padding: 12px;
        background: white;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }
      
      .metric-label {
        font-size: 13px;
        color: #6b7280;
        font-weight: 600;
      }
      
      .metric-value {
        font-size: 14px;
        font-weight: 700;
        color: #1f2937;
      }
      
      @media (max-width: 1200px) {
        .summary-cards {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .metrics-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
}

// ==========================================
// EXPORT
// ==========================================

export default {
  renderServiceModel
};
