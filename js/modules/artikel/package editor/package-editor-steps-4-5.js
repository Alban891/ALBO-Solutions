/**
 * PACKAGE EDITOR - STEPS 4-5
 * Pricing configuration and preview
 * 
 * ADD TO: package-editor-main.js (or import)
 */

// ==========================================
// STEP 4: PRICING & CUSTOMER JOURNEY
// ==========================================

function renderStep4_Pricing() {
  const state = window.packageEditorState;
  
  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <h3 style="margin: 0 0 8px;">💰 Pricing & Customer Journey</h3>
      <p style="margin: 0 0 32px; color: #6b7280;">
        Konfiguriere Kundenzahlen, Mix-Verteilung und Upsell-Raten
      </p>
      
      <!-- Customer Base -->
      <div class="package-config-card">
        <h4 style="margin: 0 0 16px;">👥 Kundenbasis</h4>
        
        <div style="display: grid; gap: 20px;">
          
          <!-- New Customers Year 1 -->
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">
              Neukunden im ersten Jahr
            </label>
            <input 
              type="number" 
              id="new-customers-year1" 
              value="${state.newCustomersYear1}"
              min="10"
              max="10000"
              style="width: 200px; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px;"
            >
            <div style="margin-top: 6px; font-size: 13px; color: #6b7280;">
              💡 Wie viele Neukunden erwartest du im ersten Jahr?
            </div>
          </div>
          
          <!-- Growth Model -->
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">
              Wachstums-Modell
            </label>
            <select 
              id="customer-growth" 
              style="width: 300px; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px;"
            >
              <option value="constant" ${state.customerGrowth === 'constant' ? 'selected' : ''}>Konstant (gleiche Anzahl jedes Jahr)</option>
              <option value="linear-10" ${state.customerGrowth === 'linear-10' ? 'selected' : ''}>Linear +10% pro Jahr</option>
              <option value="linear-20" ${state.customerGrowth === 'linear-20' ? 'selected' : ''}>Linear +20% pro Jahr</option>
              <option value="linear-30" ${state.customerGrowth === 'linear-30' ? 'selected' : ''}>Linear +30% pro Jahr</option>
            </select>
          </div>
          
        </div>
      </div>
      
      <!-- Mix Distribution -->
      <div class="package-config-card">
        <h4 style="margin: 0 0 16px;">🎯 Mix-Verteilung</h4>
        <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">
          Wie verteilen sich die Neukunden auf die Pakete?
        </p>
        
        <div style="display: grid; gap: 16px;">
          ${state.packages.map((pkg, index) => `
            <div>
              <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                <label style="font-weight: 500;">${pkg.name}</label>
                <span id="mix-${index}-value" style="font-weight: 600; color: #2563eb;">
                  ${state.mixDistribution[index] || 0}%
                </span>
              </div>
              <input 
                type="range" 
                id="mix-${index}" 
                min="0" 
                max="100" 
                value="${state.mixDistribution[index] || 0}"
                oninput="updateMixDistribution(${index}, this.value)"
                style="width: 100%;"
              >
            </div>
          `).join('')}
          
          <!-- Total -->
          <div style="padding: 12px; background: #f9fafb; border-radius: 8px; display: flex; justify-content: space-between; font-weight: 600;">
            <span>Gesamt:</span>
            <span id="mix-total" style="color: ${getMixTotal() === 100 ? '#16a34a' : '#dc2626'};">
              ${getMixTotal()}%
            </span>
          </div>
        </div>
        
        ${getMixTotal() !== 100 ? `
          <div style="margin-top: 12px; padding: 12px; background: #fee2e2; border-radius: 8px; color: #dc2626; font-size: 14px;">
            ⚠️ Die Summe muss 100% ergeben!
          </div>
        ` : ''}
      </div>
      
      <!-- Upsell Rates -->
      <div class="package-config-card">
        <h4 style="margin: 0 0 16px;">📈 Upsell-Raten</h4>
        <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">
          Wie viele Kunden wechseln pro Jahr auf ein höheres Paket?
        </p>
        
        <div style="display: grid; gap: 16px;">
          ${generateUpsellInputs()}
        </div>
      </div>
      
      <!-- Churn Rates -->
      <div class="package-config-card">
        <h4 style="margin: 0 0 16px;">📉 Churn-Raten</h4>
        <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">
          Wie viele Kunden verlierst du pro Jahr (in %)?
        </p>
        
        <div style="display: grid; gap: 16px;">
          ${state.packages.map((pkg, index) => `
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                ${pkg.name} Churn-Rate
              </label>
              <div style="display: flex; gap: 12px; align-items: center;">
                <input 
                  type="number" 
                  id="churn-${index}" 
                  value="${state.churnRates[index] || 10}"
                  min="0" 
                  max="50"
                  step="1"
                  style="width: 100px; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px;"
                >
                <span style="color: #6b7280;">% pro Jahr</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 12px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 13px; color: #92400e;">
          💡 Typische Churn-Raten: Small 15-20%, Medium 8-12%, Large 3-8%
        </div>
      </div>
      
    </div>
  `;
}

function getMixTotal() {
  const state = window.packageEditorState;
  return state.mixDistribution.reduce((sum, val) => sum + (val || 0), 0);
}

function generateUpsellInputs() {
  const state = window.packageEditorState;
  const count = state.packages.length;
  
  if (count < 2) return '';
  
  const inputs = [];
  for (let i = 0; i < count - 1; i++) {
    const fromPkg = state.packages[i].name;
    const toPkg = state.packages[i + 1].name;
    const key = `${i}_to_${i + 1}`;
    
    inputs.push(`
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">
          ${fromPkg} → ${toPkg}
        </label>
        <div style="display: flex; gap: 12px; align-items: center;">
          <input 
            type="number" 
            id="upsell-${key}" 
            value="${state.upsellRates[key] || 15}"
            min="0" 
            max="50"
            step="1"
            style="width: 100px; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px;"
          >
          <span style="color: #6b7280;">% pro Jahr</span>
        </div>
      </div>
    `);
  }
  
  return inputs.join('');
}

window.updateMixDistribution = function(index, value) {
  const state = window.packageEditorState;
  state.mixDistribution[index] = parseInt(value);
  
  // Update display
  document.getElementById(`mix-${index}-value`).textContent = value + '%';
  
  // Update total
  const total = getMixTotal();
  const totalEl = document.getElementById('mix-total');
  if (totalEl) {
    totalEl.textContent = total + '%';
    totalEl.style.color = total === 100 ? '#16a34a' : '#dc2626';
  }
};

// ==========================================
// STEP 5: PREVIEW & SAVE
// ==========================================

function renderStep5_Preview() {
  const state = window.packageEditorState;
  
  return `
    <div style="max-width: 900px; margin: 0 auto;">
      <h3 style="margin: 0 0 8px;">📊 Vorschau & Zusammenfassung</h3>
      <p style="margin: 0 0 32px; color: #6b7280;">
        Überprüfe deine Konfiguration vor dem Speichern
      </p>
      
      <!-- Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
        
        <!-- Total Packages -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px;">
          <div style="font-size: 32px; font-weight: 700;">${state.packages.length}</div>
          <div style="opacity: 0.9; font-size: 14px;">Pakete</div>
        </div>
        
        <!-- Total Components -->
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px;">
          <div style="font-size: 32px; font-weight: 700;">${getTotalComponents()}</div>
          <div style="opacity: 0.9; font-size: 14px;">Komponenten</div>
        </div>
        
        <!-- New Customers Y1 -->
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 12px;">
          <div style="font-size: 32px; font-weight: 700;">${state.newCustomersYear1}</div>
          <div style="opacity: 0.9; font-size: 14px;">Neukunden Jahr 1</div>
        </div>
        
      </div>
      
      <!-- Package Details -->
      <div class="package-config-card">
        <h4 style="margin: 0 0 16px;">📦 Packages im Detail</h4>
        
        <div style="display: grid; gap: 16px;">
          ${state.packages.map((pkg, index) => `
            <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div>
                  <div style="font-weight: 600; font-size: 16px;">${pkg.name}</div>
                  <div style="font-size: 13px; color: #6b7280;">${pkg.components.length} Komponenten • ${state.mixDistribution[index]}% Mix</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 600; color: #2563eb;">${calculatePackagePrice(pkg)}</div>
                  <div style="font-size: 12px; color: #6b7280;">Gesamt-Preis</div>
                </div>
              </div>
              
              <div style="font-size: 13px; color: #6b7280;">
                ${pkg.components.map(c => `• ${c.name} (${formatCurrency(c.price)})`).join('<br>')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Forecast Loading -->
      <div id="forecast-preview" style="margin-top: 24px;">
        <div style="text-align: center; padding: 40px; color: #6b7280;">
          <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
          <div>Berechne 5-Jahres-Forecast...</div>
        </div>
      </div>
      
    </div>
  `;
}

function getTotalComponents() {
  const state = window.packageEditorState;
  return state.packages.reduce((sum, pkg) => sum + pkg.components.length, 0);
}

function calculatePackagePrice(pkg) {
  const oneTime = pkg.components
    .filter(c => c.pricing_type === 'one-time')
    .reduce((sum, c) => sum + c.price, 0);
  
  const monthly = pkg.components
    .filter(c => c.pricing_type === 'monthly')
    .reduce((sum, c) => sum + c.price, 0);
  
  const annual = pkg.components
    .filter(c => c.pricing_type === 'annual')
    .reduce((sum, c) => sum + c.price, 0);
  
  if (monthly > 0) {
    return `${formatCurrency(oneTime)} + ${formatCurrency(monthly)}/Mo`;
  } else if (annual > 0) {
    return `${formatCurrency(oneTime)} + ${formatCurrency(annual)}/Jahr`;
  } else {
    return formatCurrency(oneTime);
  }
}

function calculateAndShowForecast() {
  // Collect all data
  collectStep4Data();
  
  // Calculate forecast
  setTimeout(() => {
    const state = window.packageEditorState;
    
    // Simple forecast calculation
    const forecast = {
      years: [],
      total_revenue_5y: 0,
      arr_year5: 0
    };
    
    let customers = state.newCustomersYear1;
    
    for (let year = 1; year <= 5; year++) {
      // Simple calculation - can be replaced with full calculation
      const yearRevenue = customers * 10000; // Placeholder
      forecast.years.push({
        year: 2025 + year - 1,
        total_customers: customers,
        total_revenue: yearRevenue
      });
      forecast.total_revenue_5y += yearRevenue;
      
      // Growth
      if (state.customerGrowth === 'linear-10') {
        customers = Math.round(customers * 1.1);
      } else if (state.customerGrowth === 'linear-20') {
        customers = Math.round(customers * 1.2);
      }
    }
    
    forecast.arr_year5 = forecast.years[4].total_revenue;
    
    state.forecast = forecast;
    
    // Show forecast
    const container = document.getElementById('forecast-preview');
    if (container) {
      container.innerHTML = renderForecast(forecast);
    }
  }, 500);
}

function renderForecast(forecast) {
  return `
    <div class="package-config-card" style="background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%);">
      <h4 style="margin: 0 0 16px;">📈 5-Jahres-Forecast</h4>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;">
        <div style="background: white; padding: 20px; border-radius: 12px;">
          <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Gesamt-Umsatz (5 Jahre)</div>
          <div style="font-size: 28px; font-weight: 700; color: #2563eb;">${formatCurrency(forecast.total_revenue_5y)}</div>
        </div>
        <div style="background: white; padding: 20px; border-radius: 12px;">
          <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">ARR Jahr 5</div>
          <div style="font-size: 28px; font-weight: 700; color: #16a34a;">${formatCurrency(forecast.arr_year5)}</div>
        </div>
      </div>
      
      <div style="background: white; padding: 16px; border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 8px; font-size: 13px; color: #6b7280;">Jahr</th>
              <th style="text-align: right; padding: 8px; font-size: 13px; color: #6b7280;">Kunden</th>
              <th style="text-align: right; padding: 8px; font-size: 13px; color: #6b7280;">Umsatz</th>
            </tr>
          </thead>
          <tbody>
            ${forecast.years.map(year => `
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 8px; font-weight: 500;">${year.year}</td>
                <td style="padding: 12px 8px; text-align: right;">${year.total_customers}</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: 600;">${formatCurrency(year.total_revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 13px; color: #92400e;">
        💡 Dies ist eine vereinfachte Vorschau. Nach dem Speichern wird der vollständige Forecast berechnet.
      </div>
    </div>
  `;
}

function collectStep4Data() {
  const state = window.packageEditorState;
  
  // Collect customer data
  state.newCustomersYear1 = parseInt(document.getElementById('new-customers-year1')?.value) || 100;
  state.customerGrowth = document.getElementById('customer-growth')?.value || 'linear-10';
  
  // Collect upsell rates
  for (let i = 0; i < state.packages.length - 1; i++) {
    const key = `${i}_to_${i + 1}`;
    const value = parseInt(document.getElementById(`upsell-${key}`)?.value) || 15;
    state.upsellRates[key] = value;
  }
  
  // Collect churn rates
  for (let i = 0; i < state.packages.length; i++) {
    const value = parseInt(document.getElementById(`churn-${i}`)?.value) || 10;
    state.churnRates[i] = value;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(value);
}