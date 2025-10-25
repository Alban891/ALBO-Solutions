/**
 * Market Sizing - Simple Templates
 * Einfacher Zugang zu professionellen Berechnungsmethoden
 * Panel öffnet sich von rechts (wie Projektkosten-Detail)
 */

// ==========================================
// PANEL STATE
// ==========================================

let panelState = {
  isOpen: false,
  currentType: null, // 'tam', 'sam', 'som'
  currentMethod: null, // 'topdown', 'bottomup', 'valuetheory'
  data: {}
};

// ==========================================
// MAIN FUNCTIONS
// ==========================================

/**
 * Open TAM Calculator Panel
 */
function openTAMCalculator() {
  panelState.currentType = 'tam';
  showMethodSelection('tam');
}

/**
 * Open SAM Calculator Panel
 */
function openSAMCalculator() {
  const tamValue = document.getElementById('gm-tam')?.value;
  if (!tamValue || parseFloat(tamValue.replace(/[^0-9.-]/g, '')) === 0) {
    alert('Bitte berechnen Sie zuerst den TAM.');
    return;
  }
  panelState.currentType = 'sam';
  showSAMCalculator();
}

/**
 * Open SOM Calculator Panel
 */
function openSOMCalculator() {
  const samValue = document.getElementById('gm-sam')?.value;
  if (!samValue || parseFloat(samValue.replace(/[^0-9.-]/g, '')) === 0) {
    alert('Bitte berechnen Sie zuerst SAM.');
    return;
  }
  panelState.currentType = 'som';
  showSOMCalculator();
}

// ==========================================
// METHOD SELECTION
// ==========================================

function showMethodSelection(type) {
  const title = type === 'tam' ? 'TAM Berechnung' : 
                type === 'sam' ? 'SAM Berechnung' : 'SOM Berechnung';
  
  const content = `
    <div class="panel-header">
      <h3>${title}</h3>
      <button class="btn-close" onclick="closePanel()">✕</button>
    </div>
    
    <div class="panel-body">
      <div class="method-selection">
        <h4>Wie möchten Sie ${type.toUpperCase()} berechnen?</h4>
        <p class="subtitle">Wählen Sie eine Methode:</p>
        
        <div class="method-cards">
          
          <!-- Top-Down -->
          <div class="method-card" onclick="selectMethod('topdown')">
            <div class="method-icon">📊</div>
            <div class="method-content">
              <h5>Top-Down Ansatz</h5>
              <p>Ausgehend von Marktforschungsdaten</p>
              <div class="method-tags">
                <span class="tag tag-blue">Schnell</span>
                <span class="tag tag-yellow">Weniger präzise</span>
              </div>
            </div>
          </div>
          
          <!-- Bottom-Up -->
          <div class="method-card" onclick="selectMethod('bottomup')">
            <div class="method-icon">🧮</div>
            <div class="method-content">
              <h5>Bottom-Up Ansatz</h5>
              <p>Hochrechnung von Kundensegmenten</p>
              <div class="method-tags">
                <span class="tag tag-green">Präzise</span>
                <span class="tag tag-yellow">Aufwendig</span>
              </div>
            </div>
          </div>
          
          <!-- Value-Theory -->
          <div class="method-card" onclick="selectMethod('valuetheory')">
            <div class="method-icon">💡</div>
            <div class="method-content">
              <h5>Value-Theory Ansatz</h5>
              <p>Basierend auf Kundennutzen</p>
              <div class="method-tags">
                <span class="tag tag-purple">Innovativ</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `;
  
  showPanel(content);
}

// ==========================================
// METHOD TEMPLATES
// ==========================================

function selectMethod(method) {
  panelState.currentMethod = method;
  
  let content = '';
  if (method === 'topdown') {
    content = renderTopDownTemplate();
  } else if (method === 'bottomup') {
    content = renderBottomUpTemplate();
  } else if (method === 'valuetheory') {
    content = renderValueTheoryTemplate();
  }
  
  updatePanelContent(content);
}

/**
 * TOP-DOWN TEMPLATE
 */
function renderTopDownTemplate() {
  return `
    <div class="panel-header">
      <div>
        <h3>📊 Top-Down Berechnung</h3>
        <small>Marktforschungsdaten</small>
      </div>
      <button class="btn-close" onclick="closePanel()">✕</button>
    </div>
    
    <div class="panel-body">
      
      <div class="info-box">
        <strong>Formel:</strong> TAM = Gesamtmarkt × Geografischer Faktor
      </div>
      
      <div class="form-section">
        
        <div class="form-group">
          <label>Gesamtmarkt (€)</label>
          <input 
            type="number" 
            id="td-market-size" 
            placeholder="z.B. 5000000000"
            class="form-input"
            oninput="calculateTopDown()"
          />
          <small>Quelle: Statista, Gartner, etc.</small>
        </div>
        
        <div class="form-group">
          <label>Geografischer Fokus</label>
          <select id="td-geo-factor" class="form-input" onchange="calculateTopDown()">
            <option value="1">Global (100%)</option>
            <option value="0.35">Europa (35%)</option>
            <option value="0.12" selected>DACH (12%)</option>
            <option value="0.08">Deutschland (8%)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Quelle</label>
          <input 
            type="text" 
            id="td-source" 
            placeholder="z.B. Statista 2024"
            class="form-input"
          />
        </div>
        
      </div>
      
      <!-- RESULT -->
      <div class="result-card">
        <div class="result-label">TAM (Top-Down):</div>
        <div id="td-result" class="result-value">0 €</div>
      </div>
      
      <!-- ACTIONS -->
      <div class="panel-actions">
        <button class="btn btn-secondary" onclick="showMethodSelection('tam')">
          ← Andere Methode
        </button>
        <button class="btn btn-primary" onclick="saveTAM()">
          ✓ Übernehmen
        </button>
      </div>
      
    </div>
  `;
}

/**
 * BOTTOM-UP TEMPLATE
 */
function renderBottomUpTemplate() {
  return `
    <div class="panel-header">
      <div>
        <h3>🧮 Bottom-Up Berechnung</h3>
        <small>Kundensegmente</small>
      </div>
      <button class="btn-close" onclick="closePanel()">✕</button>
    </div>
    
    <div class="panel-body">
      
      <div class="info-box">
        <strong>Formel:</strong> TAM = Σ (Anzahl × Deal Size × Addressable %)
      </div>
      
      <div id="segments-container" class="form-section">
        
        <!-- Initial Segment -->
        <div class="segment-card" data-segment="1">
          <div class="segment-header">
            <h5>Segment 1</h5>
            <button class="btn-icon" onclick="removeSegment(1)">🗑️</button>
          </div>
          
          <div class="form-group">
            <label>Segment-Name</label>
            <input type="text" class="segment-name form-input" placeholder="z.B. Mittelstand" />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Anzahl Unternehmen</label>
              <input 
                type="number" 
                class="segment-count form-input" 
                placeholder="z.B. 5000"
                oninput="calculateBottomUp()"
              />
            </div>
            <div class="form-group">
              <label>Deal Size (€)</label>
              <input 
                type="number" 
                class="segment-deal form-input" 
                placeholder="z.B. 150000"
                oninput="calculateBottomUp()"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label>Addressierbar (%)</label>
            <input 
              type="number" 
              class="segment-addressable form-input" 
              placeholder="z.B. 30"
              min="0"
              max="100"
              oninput="calculateBottomUp()"
            />
          </div>
          
          <div class="segment-result">
            Segment-Potential: <strong class="segment-value">0 €</strong>
          </div>
        </div>
        
      </div>
      
      <button class="btn btn-secondary btn-block" onclick="addSegment()">
        ➕ Segment hinzufügen
      </button>
      
      <!-- RESULT -->
      <div class="result-card">
        <div class="result-label">TAM (Bottom-Up):</div>
        <div id="bu-result" class="result-value">0 €</div>
      </div>
      
      <!-- ACTIONS -->
      <div class="panel-actions">
        <button class="btn btn-secondary" onclick="showMethodSelection('tam')">
          ← Andere Methode
        </button>
        <button class="btn btn-primary" onclick="saveTAM()">
          ✓ Übernehmen
        </button>
      </div>
      
    </div>
  `;
}

/**
 * VALUE-THEORY TEMPLATE
 */
function renderValueTheoryTemplate() {
  return `
    <div class="panel-header">
      <div>
        <h3>💡 Value-Theory Berechnung</h3>
        <small>Kundennutzen</small>
      </div>
      <button class="btn-close" onclick="closePanel()">✕</button>
    </div>
    
    <div class="panel-body">
      
      <div class="info-box">
        <strong>Formel:</strong> TAM = (Problem Costs × Savings %) × Kunden
      </div>
      
      <div class="form-section">
        
        <!-- Problem Costs -->
        <div class="subsection">
          <h5>Problemkosten pro Kunde/Jahr</h5>
          
          <div id="costs-container">
            <div class="cost-item">
              <input type="text" class="cost-label form-input" placeholder="z.B. Ausschuss" />
              <input 
                type="number" 
                class="cost-value form-input" 
                placeholder="€"
                oninput="calculateValueTheory()"
              />
              <button class="btn-icon" onclick="this.parentElement.remove(); calculateValueTheory()">🗑️</button>
            </div>
          </div>
          
          <button class="btn btn-secondary btn-sm" onclick="addCostItem()">
            ➕ Kostenposition
          </button>
          
          <div class="subtotal">
            Gesamt: <strong id="vt-total-cost">0 €</strong>
          </div>
        </div>
        
        <!-- Solution Savings -->
        <div class="subsection">
          <h5>Einsparung durch Lösung</h5>
          
          <div class="form-row">
            <div class="form-group">
              <label>Einsparung (%)</label>
              <input 
                type="number" 
                id="vt-savings-pct" 
                placeholder="z.B. 80"
                min="0"
                max="100"
                class="form-input"
                oninput="calculateValueTheory()"
              />
            </div>
            <div class="form-group">
              <label>Einsparung (€)</label>
              <div id="vt-savings-value" class="form-input-readonly">0 €</div>
            </div>
          </div>
        </div>
        
        <!-- Market Size -->
        <div class="subsection">
          <h5>Marktgröße</h5>
          
          <div class="form-row">
            <div class="form-group">
              <label>Potenzielle Kunden</label>
              <input 
                type="number" 
                id="vt-customers" 
                placeholder="z.B. 5000"
                class="form-input"
                oninput="calculateValueTheory()"
              />
            </div>
            <div class="form-group">
              <label>Mit diesem Problem (%)</label>
              <input 
                type="number" 
                id="vt-problem-pct" 
                placeholder="z.B. 20"
                min="0"
                max="100"
                class="form-input"
                oninput="calculateValueTheory()"
              />
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- RESULT -->
      <div class="result-card">
        <div class="result-label">TAM (Value-Theory):</div>
        <div id="vt-result" class="result-value">0 €</div>
      </div>
      
      <!-- ACTIONS -->
      <div class="panel-actions">
        <button class="btn btn-secondary" onclick="showMethodSelection('tam')">
          ← Andere Methode
        </button>
        <button class="btn btn-primary" onclick="saveTAM()">
          ✓ Übernehmen
        </button>
      </div>
      
    </div>
  `;
}

// ==========================================
// SAM CALCULATOR
// ==========================================

function showSAMCalculator() {
  const tamValue = parseFloat(document.getElementById('gm-tam').value.replace(/[^0-9.-]/g, ''));
  
  const content = `
    <div class="panel-header">
      <div>
        <h3>🎯 SAM Berechnung</h3>
        <small>Serviceable Addressable Market</small>
      </div>
      <button class="btn-close" onclick="closePanel()">✕</button>
    </div>
    
    <div class="panel-body">
      
      <div class="info-box">
        <strong>Ausgangspunkt:</strong> TAM = ${formatCurrency(tamValue)}<br>
        <strong>Formel:</strong> SAM = TAM × Geografische Filter × Weitere Filter
      </div>
      
      <div class="form-section">
        
        <div class="filter-section">
          <h5>Filter anwenden:</h5>
          
          <div class="filter-item">
            <label>
              <input type="checkbox" class="sam-filter" data-factor="0.5" onchange="calculateSAM()">
              Nur Unternehmen >50 Mitarbeiter (50%)
            </label>
          </div>
          
          <div class="filter-item">
            <label>
              <input type="checkbox" class="sam-filter" data-factor="0.6" onchange="calculateSAM()">
              Mit entsprechendem Budget (60%)
            </label>
          </div>
          
          <div class="filter-item">
            <label>
              <input type="checkbox" class="sam-filter" data-factor="0.7" onchange="calculateSAM()">
              Mit akutem Problem (70%)
            </label>
          </div>
          
          <div class="filter-item">
            <label>
              <input type="checkbox" class="sam-filter" data-factor="0.8" onchange="calculateSAM()">
              Technologie-affin (80%)
            </label>
          </div>
          
        </div>
        
      </div>
      
      <!-- RESULT -->
      <div class="result-card">
        <div class="result-label">SAM:</div>
        <div id="sam-result" class="result-value">${formatCurrency(tamValue)}</div>
        <small style="margin-top: 8px; opacity: 0.7;">
          = TAM × <span id="sam-factor">100</span>%
        </small>
      </div>
      
      <!-- ACTIONS -->
      <div class="panel-actions">
        <button class="btn btn-secondary" onclick="closePanel()">
          Abbrechen
        </button>
        <button class="btn btn-primary" onclick="saveSAM()">
          ✓ Übernehmen
        </button>
      </div>
      
    </div>
  `;
  
  showPanel(content);
}

// ==========================================
// SOM CALCULATOR
// ==========================================

function showSOMCalculator() {
  const samValue = parseFloat(document.getElementById('gm-sam').value.replace(/[^0-9.-]/g, ''));
  
  const content = `
    <div class="panel-header">
      <div>
        <h3>🚀 SOM Berechnung</h3>
        <small>Serviceable Obtainable Market</small>
      </div>
      <button class="btn-close" onclick="closePanel()">✕</button>
    </div>
    
    <div class="panel-body">
      
      <div class="info-box">
        <strong>Ausgangspunkt:</strong> SAM = ${formatCurrency(samValue)}<br>
        <strong>Formel:</strong> SOM = Realistische Marktdurchdringung in 3 Jahren
      </div>
      
      <div class="form-section">
        
        <div class="year-section">
          <h5>Jahr-für-Jahr Planung:</h5>
          
          <!-- Jahr 1 -->
          <div class="year-card">
            <div class="year-header">Jahr 1</div>
            <div class="form-row">
              <div class="form-group">
                <label>Kunden</label>
                <input 
                  type="number" 
                  id="som-y1-customers" 
                  placeholder="5"
                  class="form-input"
                  oninput="calculateSOM()"
                />
              </div>
              <div class="form-group">
                <label>Ø Deal (€)</label>
                <input 
                  type="number" 
                  id="som-y1-deal" 
                  placeholder="150000"
                  class="form-input"
                  oninput="calculateSOM()"
                />
              </div>
            </div>
            <div class="year-result">
              = <strong id="som-y1-result">0 €</strong>
            </div>
          </div>
          
          <!-- Jahr 2 -->
          <div class="year-card">
            <div class="year-header">Jahr 2</div>
            <div class="form-row">
              <div class="form-group">
                <label>Kunden</label>
                <input 
                  type="number" 
                  id="som-y2-customers" 
                  placeholder="15"
                  class="form-input"
                  oninput="calculateSOM()"
                />
              </div>
              <div class="form-group">
                <label>Ø Deal (€)</label>
                <input 
                  type="number" 
                  id="som-y2-deal" 
                  placeholder="150000"
                  class="form-input"
                  oninput="calculateSOM()"
                />
              </div>
            </div>
            <div class="year-result">
              = <strong id="som-y2-result">0 €</strong>
            </div>
          </div>
          
          <!-- Jahr 3 -->
          <div class="year-card">
            <div class="year-header">Jahr 3</div>
            <div class="form-row">
              <div class="form-group">
                <label>Kunden</label>
                <input 
                  type="number" 
                  id="som-y3-customers" 
                  placeholder="40"
                  class="form-input"
                  oninput="calculateSOM()"
                />
              </div>
              <div class="form-group">
                <label>Ø Deal (€)</label>
                <input 
                  type="number" 
                  id="som-y3-deal" 
                  placeholder="160000"
                  class="form-input"
                  oninput="calculateSOM()"
                />
              </div>
            </div>
            <div class="year-result">
              = <strong id="som-y3-result">0 €</strong>
            </div>
          </div>
          
        </div>
        
      </div>
      
      <!-- RESULT -->
      <div class="result-card">
        <div class="result-label">SOM (Jahr 3):</div>
        <div id="som-result" class="result-value">0 €</div>
        <small style="margin-top: 8px; opacity: 0.7;">
          Kumuliert = <span id="som-cumulative">0 €</span>
        </small>
      </div>
      
      <!-- ACTIONS -->
      <div class="panel-actions">
        <button class="btn btn-secondary" onclick="closePanel()">
          Abbrechen
        </button>
        <button class="btn btn-primary" onclick="saveSOM()">
          ✓ Übernehmen
        </button>
      </div>
      
    </div>
  `;
  
  showPanel(content);
}

// ==========================================
// CALCULATION FUNCTIONS
// ==========================================

function calculateTopDown() {
  const marketSize = parseFloat(document.getElementById('td-market-size')?.value) || 0;
  const geoFactor = parseFloat(document.getElementById('td-geo-factor')?.value) || 0;
  
  const tam = marketSize * geoFactor;
  
  document.getElementById('td-result').textContent = formatCurrency(tam);
  panelState.data.tam = tam;
}

function calculateBottomUp() {
  let total = 0;
  
  document.querySelectorAll('.segment-card').forEach(card => {
    const count = parseFloat(card.querySelector('.segment-count')?.value) || 0;
    const deal = parseFloat(card.querySelector('.segment-deal')?.value) || 0;
    const addressable = parseFloat(card.querySelector('.segment-addressable')?.value) || 0;
    
    const segmentValue = count * deal * (addressable / 100);
    card.querySelector('.segment-value').textContent = formatCurrency(segmentValue);
    
    total += segmentValue;
  });
  
  document.getElementById('bu-result').textContent = formatCurrency(total);
  panelState.data.tam = total;
}

function calculateValueTheory() {
  // Total problem costs
  let totalCost = 0;
  document.querySelectorAll('.cost-value').forEach(input => {
    totalCost += parseFloat(input.value) || 0;
  });
  document.getElementById('vt-total-cost').textContent = formatCurrency(totalCost);
  
  // Savings
  const savingsPct = parseFloat(document.getElementById('vt-savings-pct')?.value) || 0;
  const savingsValue = totalCost * (savingsPct / 100);
  document.getElementById('vt-savings-value').textContent = formatCurrency(savingsValue);
  
  // TAM
  const customers = parseFloat(document.getElementById('vt-customers')?.value) || 0;
  const problemPct = parseFloat(document.getElementById('vt-problem-pct')?.value) || 0;
  const addressableCustomers = customers * (problemPct / 100);
  
  const tam = savingsValue * addressableCustomers;
  document.getElementById('vt-result').textContent = formatCurrency(tam);
  panelState.data.tam = tam;
}

function calculateSAM() {
  const tamValue = parseFloat(document.getElementById('gm-tam').value.replace(/[^0-9.-]/g, ''));
  let factor = 1;
  
  document.querySelectorAll('.sam-filter:checked').forEach(checkbox => {
    factor *= parseFloat(checkbox.dataset.factor);
  });
  
  const sam = tamValue * factor;
  
  document.getElementById('sam-result').textContent = formatCurrency(sam);
  document.getElementById('sam-factor').textContent = Math.round(factor * 100);
  panelState.data.sam = sam;
}

function calculateSOM() {
  const y1Customers = parseFloat(document.getElementById('som-y1-customers')?.value) || 0;
  const y1Deal = parseFloat(document.getElementById('som-y1-deal')?.value) || 0;
  const y1 = y1Customers * y1Deal;
  document.getElementById('som-y1-result').textContent = formatCurrency(y1);
  
  const y2Customers = parseFloat(document.getElementById('som-y2-customers')?.value) || 0;
  const y2Deal = parseFloat(document.getElementById('som-y2-deal')?.value) || 0;
  const y2 = y2Customers * y2Deal;
  document.getElementById('som-y2-result').textContent = formatCurrency(y2);
  
  const y3Customers = parseFloat(document.getElementById('som-y3-customers')?.value) || 0;
  const y3Deal = parseFloat(document.getElementById('som-y3-deal')?.value) || 0;
  const y3 = y3Customers * y3Deal;
  document.getElementById('som-y3-result').textContent = formatCurrency(y3);
  
  const cumulative = y1 + y2 + y3;
  
  document.getElementById('som-result').textContent = formatCurrency(y3);
  document.getElementById('som-cumulative').textContent = formatCurrency(cumulative);
  panelState.data.som = y3;
}

// ==========================================
// SAVE FUNCTIONS
// ==========================================

function saveTAM() {
  if (!panelState.data.tam || panelState.data.tam === 0) {
    alert('Bitte füllen Sie die Felder aus.');
    return;
  }
  
  document.getElementById('gm-tam').value = panelState.data.tam;
  closePanel();
  
  // Show success
  showToast('✓ TAM gespeichert: ' + formatCurrency(panelState.data.tam));
}

function saveSAM() {
  if (!panelState.data.sam || panelState.data.sam === 0) {
    alert('Bitte wählen Sie Filter aus.');
    return;
  }
  
  document.getElementById('gm-sam').value = panelState.data.sam;
  closePanel();
  
  showToast('✓ SAM gespeichert: ' + formatCurrency(panelState.data.sam));
}

function saveSOM() {
  if (!panelState.data.som || panelState.data.som === 0) {
    alert('Bitte füllen Sie die Jahresplanung aus.');
    return;
  }
  
  document.getElementById('gm-som').value = panelState.data.som;
  closePanel();
  
  showToast('✓ SOM gespeichert: ' + formatCurrency(panelState.data.som));
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

let segmentCounter = 1;

function addSegment() {
  segmentCounter++;
  const container = document.getElementById('segments-container');
  
  const html = `
    <div class="segment-card" data-segment="${segmentCounter}">
      <div class="segment-header">
        <h5>Segment ${segmentCounter}</h5>
        <button class="btn-icon" onclick="removeSegment(${segmentCounter})">🗑️</button>
      </div>
      
      <div class="form-group">
        <label>Segment-Name</label>
        <input type="text" class="segment-name form-input" placeholder="z.B. Großkonzerne" />
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Anzahl Unternehmen</label>
          <input 
            type="number" 
            class="segment-count form-input" 
            placeholder="z.B. 200"
            oninput="calculateBottomUp()"
          />
        </div>
        <div class="form-group">
          <label>Deal Size (€)</label>
          <input 
            type="number" 
            class="segment-deal form-input" 
            placeholder="z.B. 800000"
            oninput="calculateBottomUp()"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label>Addressierbar (%)</label>
        <input 
          type="number" 
          class="segment-addressable form-input" 
          placeholder="z.B. 50"
          min="0"
          max="100"
          oninput="calculateBottomUp()"
        />
      </div>
      
      <div class="segment-result">
        Segment-Potential: <strong class="segment-value">0 €</strong>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', html);
}

function removeSegment(id) {
  document.querySelector(`.segment-card[data-segment="${id}"]`)?.remove();
  calculateBottomUp();
}

function addCostItem() {
  const container = document.getElementById('costs-container');
  
  const html = `
    <div class="cost-item">
      <input type="text" class="cost-label form-input" placeholder="Kostenposition" />
      <input 
        type="number" 
        class="cost-value form-input" 
        placeholder="€"
        oninput="calculateValueTheory()"
      />
      <button class="btn-icon" onclick="this.parentElement.remove(); calculateValueTheory()">🗑️</button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', html);
}

function formatCurrency(value) {
  if (!value || isNaN(value)) return '0 €';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function showToast(message) {
  // Simple alert for now - can be enhanced with proper toast notification
  alert(message);
}

// ==========================================
// PANEL MANAGEMENT
// ==========================================

function showPanel(content) {
  closePanel(); // Close existing panel first
  
  const panel = document.createElement('div');
  panel.id = 'market-sizing-panel';
  panel.className = 'market-panel';
  panel.innerHTML = `
    <div class="panel-overlay" onclick="closePanel()"></div>
    <div class="panel-container">
      ${content}
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // Trigger animation
  setTimeout(() => {
    panel.classList.add('active');
  }, 10);
  
  panelState.isOpen = true;
}

function updatePanelContent(content) {
  const container = document.querySelector('.panel-container');
  if (container) {
    container.innerHTML = content;
  }
}

function closePanel() {
  const panel = document.getElementById('market-sizing-panel');
  if (panel) {
    panel.classList.remove('active');
    setTimeout(() => {
      panel.remove();
    }, 300);
  }
  panelState.isOpen = false;
}

// ==========================================
// EXPORT TO WINDOW
// ==========================================

window.marketSizing = {
  openTAMCalculator,
  openSAMCalculator,
  openSOMCalculator,
  closePanel
};

// Make helper functions globally available
window.selectMethod = selectMethod;
window.calculateTopDown = calculateTopDown;
window.calculateBottomUp = calculateBottomUp;
window.calculateValueTheory = calculateValueTheory;
window.calculateSAM = calculateSAM;
window.calculateSOM = calculateSOM;
window.saveTAM = saveTAM;
window.saveSAM = saveSAM;
window.saveSOM = saveSOM;
window.addSegment = addSegment;
window.removeSegment = removeSegment;
window.addCostItem = addCostItem;
window.showMethodSelection = showMethodSelection;

console.log('✅ Market Sizing Calculator loaded');
