/**
 * PACKAGE EDITOR - SAVE FUNCTION
 * 
 * ADD TO: package-editor-main.js
 */

/**
 * Save Package Artikel to Database
 */
async function savePackageArtikel() {
  const state = window.packageEditorState;
  
  console.log('💾 Saving package artikel...');
  
  // Validate one more time
  if (getMixTotal() !== 100) {
    alert('❌ Mix-Verteilung muss 100% ergeben!');
    state.currentStep = 4;
    renderCurrentStep();
    return;
  }
  
  // Collect final data
  collectStep4Data();
  
  // Clean projekt ID
  let cleanProjektId = state.projektId;
  if (typeof state.projektId === 'string' && state.projektId.includes('projekt-db-')) {
    cleanProjektId = state.projektId.replace('projekt-db-', '');
  }
  
  // Build package config
  const packageConfig = {
    package_count: state.packageCount,
    package_names: state.packageNames,
    packages: state.packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      short: pkg.short,
      description: pkg.description || '',
      components: pkg.components,
      total_setup: pkg.components
        .filter(c => c.pricing_type === 'one-time')
        .reduce((sum, c) => sum + c.price, 0),
      total_monthly: pkg.components
        .filter(c => c.pricing_type === 'monthly')
        .reduce((sum, c) => sum + c.price, 0),
      total_annual: pkg.components
        .filter(c => c.pricing_type === 'annual')
        .reduce((sum, c) => sum + c.price, 0)
    })),
    mix_distribution: state.mixDistribution,
    new_customers_year1: state.newCustomersYear1,
    new_customers_growth: state.customerGrowth,
    upsell_rates: state.upsellRates,
    churn_rates: state.churnRates,
    forecast_cache: state.forecast
  };
  
  // Build artikel data
  const artikelData = {
    name: state.artikelName,
    typ: state.artikelTyp,
    projektId: state.projektId,
    projekt_id: cleanProjektId,
    
    // Package-specific
    artikel_mode: 'package',
    package_config: packageConfig,
    
    // Standard fields (for compatibility)
    release_datum: '2025-01',
    zeitraum: 5,
    volumes: {},
    prices: {},
    hk: 0,
    start_menge: state.newCustomersYear1,
    start_preis: 0,
    start_hk: 0,
    mengen_modell: 'realistisch',
    preis_modell: 'konstant',
    kosten_modell: 'konstant'
  };
  
  console.log('📦 Package artikel data:', artikelData);
  
  try {
    // Show loading
    const nextBtn = document.getElementById('package-next-btn');
    const originalText = nextBtn.textContent;
    nextBtn.textContent = 'Speichere...';
    nextBtn.disabled = true;
    
    // Save to database
    const result = await saveArticle(artikelData);
    
    console.log('✅ Package artikel saved:', result);
    
    // Close modal
    closePackageEditor();
    
    // Show success message
    alert('✅ Package-Artikel erfolgreich erstellt!');
    
    // Reload page
    setTimeout(() => {
      window.location.reload();
    }, 500);
    
  } catch (error) {
    console.error('❌ Error saving package artikel:', error);
    alert('Fehler beim Speichern: ' + error.message);
    
    // Re-enable button
    const nextBtn = document.getElementById('package-next-btn');
    nextBtn.disabled = false;
    nextBtn.textContent = '✓ Artikel erstellen';
  }
}