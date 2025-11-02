/**
 * CFO Dashboard - API Layer (EXTENDED)
 * Enterprise-grade Supabase wrapper with error handling,
 * retry logic, and data validation
 * 
 * ERWEITERT um: Projektkosten (Kostenblöcke + Personal-Positionen)
 */

import CONFIG from './config.js';
import { state } from './state.js';

// ==========================================
// SUPABASE CLIENT INITIALIZATION
// ==========================================

let supabaseClient = null;

/**
 * Initialize Supabase client
 * @returns {Promise<boolean>} Success status
 */
export async function initializeSupabase() {
  try {
    // Wait for Supabase library to load
    if (!window.supabase) {
      console.error('❌ Supabase library not loaded');
      return false;
    }

    // Create client
    supabaseClient = window.supabase.createClient(
      CONFIG.supabase.url,
      CONFIG.supabase.key
    );

    // Set global reference (for backward compatibility)
    window.supabaseClient = supabaseClient;
    window.supabase = supabaseClient;

    console.log('✅ Supabase initialized successfully');

    // Test connection
    const connectionTest = await testConnection();
    return connectionTest;

  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
    state.setError('supabase', error);
    return false;
  }
}

/**
 * Test Supabase connection
 * @returns {Promise<boolean>} Connection status
 */
async function testConnection() {
  try {
    const { data, error } = await supabaseClient
      .from('ALBO_Projects')
      .select('id')
      .limit(1);

    if (error) {
      console.warn('⚠️ Connection test warning:', error);
      return false;
    }

    console.log('✅ Database connection verified');
    return true;

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

/**
 * Get Supabase client (with safety check)
 * @returns {object|null} Supabase client
 */
function getClient() {
  if (!supabaseClient) {
    console.error('❌ Supabase client not initialized');
    return null;
  }
  return supabaseClient;
}

// ==========================================
// PROJEKT API
// ==========================================

/**
 * Load all projects from database
 * @returns {Promise<Array>} Array of projects
 */
export async function loadProjects() {
  const client = getClient();
  if (!client) return [];

  try {
    state.setLoading('projekte', true);

    const { data, error } = await client
      .from('ALBO_Projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Loaded ${data.length} projects from database`);

    // Transform and store in state
    data.forEach(dbProjekt => {
      const projektId = 'projekt-db-' + dbProjekt.id;
      
      state.setProjekt(projektId, {
        id: projektId,
        name: dbProjekt.project_name,
        beschreibung: dbProjekt.description || '',
        division: dbProjekt.business_unit || '-',
        status: dbProjekt.project_status || 'aktiv',
        owner: dbProjekt.project_owner || '-',
        startDatum: dbProjekt.start_date,
        endDatum: dbProjekt.end_date,
        artikel: [],
        isDemo: false
      });
    });

    return data;

  } catch (error) {
    console.error('❌ Failed to load projects:', error);
    state.setError('loadProjects', error);
    return [];

  } finally {
    state.setLoading('projekte', false);
  }
}

/**
 * Save project to database
 * @param {object} projektData - Project data
 * @returns {Promise<object|null>} Saved project or null
 */
export async function saveProject(projektData) {
  const client = getClient();
  if (!client) return null;

  try {
    // Validate data
    state.validateProjektData(projektData);

    // Helper: Convert month format (YYYY-MM) to full date (YYYY-MM-01)
    const formatDateForDB = (monthString) => {
      if (!monthString) return null;
      
      // If already full date format (YYYY-MM-DD), return as-is
      if (monthString.includes('-') && monthString.split('-').length === 3) {
        return monthString;
      }
      
      // Convert month format (YYYY-MM) to first day of month (YYYY-MM-01)
      return monthString + '-01';
    };

    const dataToSave = {
      project_name: projektData.name,
      description: projektData.beschreibung || '',
      business_unit: projektData.division,
      project_status: projektData.status,
      project_owner: projektData.owner,
      start_date: formatDateForDB(projektData.startDatum),
      end_date: formatDateForDB(projektData.endDatum)
    };

    console.log('💾 Saving to database:', dataToSave);

    const { data, error } = await client
      .from('ALBO_Projects')
      .insert([dataToSave])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Project saved:', data.project_name);

    // Add to state
    const projektId = 'projekt-db-' + data.id;
    state.setProjekt(projektId, {
      ...projektData,
      id: projektId,
      artikel: []
    });

    return data;

  } catch (error) {
    console.error('❌ Failed to save project:', error);
    state.setError('saveProject', error);
    return null;
  }
}

/**
 * Update project in database
 * @param {string} projektId - Project ID
 * @param {object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateProject(projektId, updates) {
  const client = getClient();
  if (!client) return false;

  try {
    const dbId = projektId.replace('projekt-db-', '');

    // Helper: Convert month format (YYYY-MM) to full date (YYYY-MM-01)
    const formatDateForDB = (monthString) => {
      if (!monthString) return null;
      
      // If already full date format (YYYY-MM-DD), return as-is
      if (monthString.includes('-') && monthString.split('-').length === 3) {
        return monthString;
      }
      
      // Convert month format (YYYY-MM) to first day of month (YYYY-MM-01)
      return monthString + '-01';
    };

    const dataToUpdate = {
      project_name: updates.name,
      description: updates.beschreibung,
      business_unit: updates.division,
      project_status: updates.status,
      project_owner: updates.owner,
      start_date: formatDateForDB(updates.startDatum),
      end_date: formatDateForDB(updates.endDatum)
    };

    console.log('💾 Updating project in database:', dataToUpdate);

    const { error } = await client
      .from('ALBO_Projects')
      .update(dataToUpdate)
      .eq('id', dbId);

    if (error) throw error;

    console.log('✅ Project updated:', updates.name);

    // Update state
    state.setProjekt(projektId, {
      ...state.getProjekt(projektId),
      ...updates
    });

    return true;

  } catch (error) {
    console.error('❌ Failed to update project:', error);
    state.setError('updateProject', error);
    return false;
  }
}

/**
 * Delete project from database
 * @param {string} projektId - Project ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteProject(projektId) {
  const client = getClient();
  if (!client) return false;

  try {
    const dbId = projektId.replace('projekt-db-', '');

    // Delete all articles first
    await client
      .from('ALBO_Artikel')
      .delete()
      .eq('project_id', dbId);

    // Delete project
    const { error } = await client
      .from('ALBO_Projects')
      .delete()
      .eq('id', dbId);

    if (error) throw error;

    console.log('✅ Project deleted:', projektId);

    // Remove from state
    state.deleteProjekt(projektId);

    return true;

  } catch (error) {
    console.error('❌ Failed to delete project:', error);
    state.setError('deleteProject', error);
    return false;
  }
}

// ==========================================
// ARTIKEL API
// ==========================================

/**
 * Load articles for a project
 * @param {string} projektId - Project ID
 * @returns {Promise<Array>} Array of articles
 */
export async function loadArticles(projektId) {
  const client = getClient();
  if (!client) return [];

  try {
    state.setLoading('artikel', true);

    const cleanProjektId = projektId.replace('projekt-db-', '');

    const { data, error } = await client
      .from('ALBO_Artikel')
      .select('*')
      .eq('project_id', cleanProjektId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Loaded ${data.length} articles for project ${projektId}`);

    // Transform and store in state
    const projekt = state.getProjekt(projektId);
    if (projekt) {
      projekt.artikel = []; // Reset array
    }

    data.forEach(dbArtikel => {
      const artikelId = 'artikel-db-' + dbArtikel.id;

      state.setArtikel(artikelId, {
        id: artikelId,
        projektId: projektId,
        name: dbArtikel.name || 'Unbenannt',
        typ: dbArtikel.typ || '-',
        kategorie: dbArtikel.kategorie,
        geschaeftsmodell: dbArtikel.geschaeftsmodell,
        zielmarkt: dbArtikel.zielmarkt,
        strategie: dbArtikel.strategie,
        investment_typ: dbArtikel.investment_typ,
        beschreibung: dbArtikel.beschreibung,
        release_datum: dbArtikel.release_datum,
        annahmen: dbArtikel.annahmen,
        volumes: dbArtikel.volumes || {},
        prices: dbArtikel.prices || {},
        hk: dbArtikel.hk || 0,
        start_menge: dbArtikel.start_menge || 0,
        start_preis: dbArtikel.start_preis || 0,
        start_hk: dbArtikel.start_hk || 0,
        mengen_modell: dbArtikel.mengen_modell,
        preis_modell: dbArtikel.preis_modell,
        kosten_modell: dbArtikel.kosten_modell,
        zeitraum: dbArtikel.zeitraum || 5,
        tableStartYear: dbArtikel.table_start_year
      });
    });

    return data;

  } catch (error) {
    console.error('❌ Failed to load articles:', error);
    state.setError('loadArticles', error);
    return [];

  } finally {
    state.setLoading('artikel', false);
  }
}

/**
 * Save article to database
 * @param {object} artikelData - Article data
 * @returns {Promise<object|null>} Saved article or null
 */
export async function saveArticle(artikelData) {
  const client = getClient();
  if (!client) return null;

  try {
    // Validate data
    state.validateArtikelData(artikelData);

    const cleanProjektId = (artikelData.projekt_id || artikelData.projektId || '').replace('projekt-db-', '');
    
    const dataToSave = {
  project_id: cleanProjektId,
  name: artikelData.name,
  typ: artikelData.typ,
  kategorie: artikelData.kategorie,
  geschaeftsmodell: artikelData.geschaeftsmodell,
  zielmarkt: artikelData.zielmarkt,
  strategie: artikelData.strategie,
  investment_typ: artikelData.investment_typ,
  beschreibung: artikelData.beschreibung,
  release_datum: artikelData.release_datum ?
    (artikelData.release_datum.length === 7 ? artikelData.release_datum + '-01' : artikelData.release_datum) :
    null,
  annahmen: artikelData.annahmen,
  volumes: artikelData.volumes || {},
  prices: artikelData.prices || {},
  hk: artikelData.hk || 0,
  start_menge: artikelData.start_menge || 0,
  start_preis: artikelData.start_preis || 0,
  start_hk: artikelData.start_hk || 0,
  mengen_modell: artikelData.mengen_modell,
  preis_modell: artikelData.preis_modell,
  kosten_modell: artikelData.kosten_modell,
  zeitraum: artikelData.zeitraum || 5,
  
  // Package & Hierarchy fields
  artikel_mode: artikelData.artikel_mode || null,
  parent_package_id: artikelData.parent_package_id || null,
  package_name: artikelData.package_name || null,
  package_index: artikelData.package_index !== undefined ? artikelData.package_index : null,
  mix_percentage: artikelData.mix_percentage || null,
  package_config: artikelData.package_config || null,
  
  // Hybrid/Revenue Stream fields
  revenue_streams: artikelData.revenue_streams || null,
  components: artikelData.components || null,
  churn_rate: artikelData.churn_rate || null
};

    const { data, error } = await client
      .from('ALBO_Artikel')
      .insert([dataToSave])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Article saved:', data.name);

    // Add to state
    const artikelId = 'artikel-db-' + data.id;
    state.setArtikel(artikelId, {
      ...artikelData,
      id: artikelId
    });

    return data;

  } catch (error) {
    console.error('❌ Failed to save article:', error);
    state.setError('saveArticle', error);
    return null;
  }
}

/**
 * Update article in database
 * @param {string} artikelId - Article ID
 * @param {object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateArticle(artikelId, updates) {
  const client = getClient();
  if (!client) return false;

  try {
    const dbId = artikelId.replace('artikel-db-', '');

    // FIX: Konvertiere release_datum zu vollständigem Datum
    const dataToUpdate = {
      name: updates.name,
      typ: updates.typ,
      kategorie: updates.kategorie,
      geschaeftsmodell: updates.geschaeftsmodell,
      zielmarkt: updates.zielmarkt,
      strategie: updates.strategie,
      investment_typ: updates.investment_typ,
      beschreibung: updates.beschreibung,
      release_datum: updates.release_datum ? 
        (updates.release_datum.length === 7 ? updates.release_datum + '-01' : updates.release_datum) : 
        null,
      annahmen: updates.annahmen,
      volumes: updates.volumes,
      prices: updates.prices,
      hk: updates.hk,
      start_menge: updates.start_menge,
      start_preis: updates.start_preis,
      start_hk: updates.start_hk,
      mengen_modell: updates.mengen_modell,
      preis_modell: updates.preis_modell,
      kosten_modell: updates.kosten_modell,
      zeitraum: updates.zeitraum
    };

    const { error } = await client
      .from('ALBO_Artikel')
      .update(dataToUpdate)
      .eq('id', dbId);

    if (error) throw error;

    console.log('✅ Article updated:', updates.name);

    // Update state
    const currentArtikel = state.getArtikel(artikelId);
    state.setArtikel(artikelId, {
      ...currentArtikel,
      ...updates
    });

    return true;

  } catch (error) {
    console.error('❌ Failed to update article:', error);
    state.setError('updateArticle', error);
    return false;
  }
}

/**
 * Delete article from database
 * @param {string} artikelId - Article ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteArticle(artikelId) {
  const client = getClient();
  if (!client) return false;

  try {
    const dbId = artikelId.replace('artikel-db-', '');

    const { error } = await client
      .from('ALBO_Artikel')
      .delete()
      .eq('id', dbId);

    if (error) throw error;

    console.log('✅ Article deleted:', artikelId);

    // Remove from state
    state.deleteArtikel(artikelId);

    return true;

  } catch (error) {
    console.error('❌ Failed to delete article:', error);
    state.setError('deleteArticle', error);
    return false;
  }
}

// ==========================================
// ✅ NEUE FUNKTIONEN: REVENUE FORECASTS
// ==========================================

/**
 * Save a new revenue forecast to database
 */
export async function saveForecast(artikelId, modelType, forecastData, parameters, scenario = 'base', notes = '') {
  const client = getClient();
  if (!client) return null;

  try {
    console.log(`💾 Saving ${modelType} forecast for artikel ${artikelId}`);

    const dbId = artikelId.replace('artikel-db-', '');

    const validModelTypes = ['hardware', 'software', 'service', 'package'];
    if (!validModelTypes.includes(modelType)) {
      throw new Error(`Invalid model type: ${modelType}. Must be one of: ${validModelTypes.join(', ')}`);
    }

    if (!forecastData.years || !Array.isArray(forecastData.years)) {
      throw new Error('forecast_data.years must be an array');
    }
    if (!forecastData.revenue || !Array.isArray(forecastData.revenue)) {
      throw new Error('forecast_data.revenue must be an array');
    }

    const dataToSave = {
      artikel_id: dbId,
      model_type: modelType,
      scenario: scenario,
      forecast_data: {
        years: forecastData.years,
        revenue: forecastData.revenue,
        totalCost: forecastData.totalCost || [],
        db2: forecastData.db2 || [],
        db2Margin: forecastData.db2Margin || []
      },
      parameters: parameters || {},
      is_active: true,
      notes: notes || null,
      created_by: 'user',
      updated_by: 'user'
    };

   const { data, error } = await client
    .from('ALBO_Revenue_Forecasts')
    .upsert(dataToSave, {
      onConflict: 'artikel_id,model_type,scenario,is_active',
      ignoreDuplicates: false
    })
    .select()
    .single();

    if (error) throw error;

    console.log('✅ Forecast saved successfully:', data.id);
    return data;

  } catch (error) {
    console.error('❌ Failed to save forecast:', error);
    state.setError('saveForecast', error);
    return null;
  }
}

/**
 * Load a specific revenue forecast
 */
export async function loadForecast(artikelId, modelType, scenario = 'base') {
  const client = getClient();
  if (!client) return null;

  try {
    const dbId = artikelId.replace('artikel-db-', '');

    console.log(`📥 Loading ${modelType} forecast for artikel ${artikelId} (scenario: ${scenario})`);

    const { data, error } = await client
      .from('ALBO_Revenue_Forecasts')
      .select('*')
      .eq('artikel_id', dbId)
      .eq('model_type', modelType)
      .eq('scenario', scenario)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      console.log(`ℹ️ No active forecast found for ${modelType}`);
      return null;
    }

    console.log(`✅ Forecast loaded: ${data.id}`);
    return data;

  } catch (error) {
    console.error('❌ Failed to load forecast:', error);
    state.setError('loadForecast', error);
    return null;
  }
}

/**
 * Load all revenue forecasts for an article
 */
export async function loadAllForecasts(artikelId, activeOnly = true) {
  const client = getClient();
  if (!client) return [];

  try {
    const dbId = artikelId.replace('artikel-db-', '');

    console.log(`📥 Loading all forecasts for artikel ${artikelId} (active only: ${activeOnly})`);

    let query = client
      .from('ALBO_Revenue_Forecasts')
      .select('*')
      .eq('artikel_id', dbId)
      .order('model_type', { ascending: true })
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log(`✅ Loaded ${data.length} forecast(s)`);
    return data;

  } catch (error) {
    console.error('❌ Failed to load forecasts:', error);
    state.setError('loadAllForecasts', error);
    return [];
  }
}

// ==========================================
// PROJEKTKOSTEN API (NEU)
// ==========================================

/**
 * Load Kostenblöcke für ein Projekt
 * @param {string} projektId - Project ID
 * @returns {Promise<Array>} Array of Kostenblöcke
 */
export async function loadKostenblöcke(projektId) {
  const client = getClient();
  if (!client) return [];

  try {
    const dbId = projektId.replace('projekt-db-', ''); // UUID als String

    const { data, error } = await client
      .from('albo_kostenblöcke')
      .select('*')
      .eq('project_id', dbId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log(`✅ Loaded ${data.length} Kostenblöcke for project ${projektId}`);
    return data;

  } catch (error) {
    console.error('❌ Failed to load Kostenblöcke:', error);
    state.setError('loadKostenblöcke', error);
    return [];
  }
}

/**
 * Save/Update Kostenblöcke für ein Projekt
 * @param {string} projektId - Project ID
 * @param {Array} kostenblöcke - Array of Kostenblöcke
 * @returns {Promise<boolean>} Success status
 */
export async function saveKostenblöcke(projektId, kostenblöcke) {
  const client = getClient();
  if (!client) return false;

  try {
    // Validierung: Prüfe ob projektId gültig ist
    if (!projektId || !projektId.startsWith('projekt-db-')) {
      console.error('❌ Ungültige projektId:', projektId);
      return false;
    }

    // Extrahiere UUID (nicht als INT parsen!)
    const dbId = projektId.replace('projekt-db-', '');
    
    console.log('💾 Speichere Kostenblöcke:', {
      projektId,
      dbId,
      dbIdType: typeof dbId,
      blockCount: kostenblöcke.length
    });

    // Delete alte Kostenblöcke
    const { error: deleteError } = await client
      .from('albo_kostenblöcke')
      .delete()
      .eq('project_id', dbId);

    if (deleteError) {
      console.warn('⚠️ Delete warning:', deleteError);
    }

    // Insert neue Kostenblöcke
    const blocksToInsert = kostenblöcke.map(block => ({
      project_id: dbId, // UUID als String
      block_id: block.id,
      block_name: block.name,
      block_icon: block.icon || '📦',
      block_anteil: block.anteil || 0,
      is_active: block.isActive !== false,
      kosten_werte: block.kostenWerte || {}
    }));
    
    console.log('📦 Blocks to insert:', JSON.stringify(blocksToInsert, null, 2));

    const { data, error } = await client
      .from('albo_kostenblöcke')
      .insert(blocksToInsert)
      .select();

    if (error) {
      console.error('❌ Insert error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log(`✅ Saved ${data.length} Kostenblöcke for project ${projektId}`);
    return true;

  } catch (error) {
    console.error('❌ Failed to save Kostenblöcke:', error);
    console.error('❌ Full error object:', error);
    state.setError('saveKostenblöcke', error);
    return false;
  }
}

/**
 * Update einzelnen Kostenblock-Wert
 * @param {string} projektId - Project ID
 * @param {string} blockId - Block ID
 * @param {string} jahr - Jahr (z.B. "2025")
 * @param {number} wert - Wert in €
 * @returns {Promise<boolean>} Success status
 */
export async function updateKostenblockWert(projektId, blockId, jahr, wert) {
  const client = getClient();
  if (!client) return false;

  try {
    const dbId = projektId.replace('projekt-db-', ''); // UUID als String
    
    console.log('💾 Update Kostenblock:', {
      projektId,
      dbId,
      blockId,
      jahr,
      wert
    });

    // Prüfe ob Block existiert
    const { data: existingBlock, error: fetchError } = await client
      .from('albo_kostenblöcke')
      .select('*')
      .eq('project_id', dbId)
      .eq('block_id', blockId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Fetch error:', fetchError);
      throw fetchError;
    }

    const kostenWerte = existingBlock?.kosten_werte || {};
    kostenWerte[jahr] = wert;

    if (existingBlock) {
      // Block existiert → UPDATE
      const { error: updateError } = await client
        .from('albo_kostenblöcke')
        .update({ kosten_werte: kostenWerte })
        .eq('project_id', dbId)
        .eq('block_id', blockId);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }
      
      console.log(`✅ Updated Kostenblock ${blockId} for ${jahr}: ${wert}€`);
    } else {
      // Block existiert NICHT → INSERT
      console.log(`ℹ️ Block ${blockId} nicht gefunden, erstelle neu...`);
      
      const { error: insertError } = await client
        .from('albo_kostenblöcke')
        .insert([{
          project_id: dbId,
          block_id: blockId,
          block_name: blockId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          block_icon: '📦',
          is_active: true,
          kosten_werte: kostenWerte
        }]);

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw insertError;
      }
      
      console.log(`✅ Created and updated Kostenblock ${blockId} for ${jahr}: ${wert}€`);
    }

    return true;

  } catch (error) {
    console.error('❌ Failed to update Kostenblock:', error);
    state.setError('updateKostenblockWert', error);
    return false;
  }
}

/**
 * Delete Kostenblock
 * @param {string} projektId - Project ID
 * @param {string} blockId - Block ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteKostenblock(projektId, blockId) {
  const client = getClient();
  if (!client) return false;

  try {
    const dbId = projektId.replace('projekt-db-', ''); // UUID als String

    const { error } = await client
      .from('albo_kostenblöcke')
      .delete()
      .eq('project_id', dbId)
      .eq('block_id', blockId);

    if (error) throw error;

    console.log(`✅ Deleted Kostenblock ${blockId}`);
    return true;

  } catch (error) {
    console.error('❌ Failed to delete Kostenblock:', error);
    state.setError('deleteKostenblock', error);
    return false;
  }
}

// ==========================================
// PERSONAL POSITIONEN
// ==========================================

/**
 * Load Personal-Positionen für ein Projekt
 * @param {string} projektId - Project ID
 * @returns {Promise<Array>} Array of Personal-Positionen
 */
export async function loadPersonalPositionen(projektId) {
  const client = getClient();
  if (!client) return [];

  try {
    const dbId = projektId.replace('projekt-db-', ''); // UUID als String

    const { data, error } = await client
      .from('albo_personal_positionen')
      .select('*')
      .eq('project_id', dbId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log(`✅ Loaded ${data.length} Personal-Positionen for project ${projektId}`);
    return data;

  } catch (error) {
    console.error('❌ Failed to load Personal-Positionen:', error);
    state.setError('loadPersonalPositionen', error);
    return [];
  }
}

/**
 * Save/Update Personal-Positionen für ein Projekt
 * @param {string} projektId - Project ID
 * @param {Array} positionen - Array of Personal-Positionen
 * @returns {Promise<boolean>} Success status
 */
export async function savePersonalPositionen(projektId, positionen) {
  const client = getClient();
  if (!client) return false;

  try {
    // Validierung: Prüfe ob projektId gültig ist
    if (!projektId || !projektId.startsWith('projekt-db-')) {
      console.error('❌ Ungültige projektId:', projektId);
      return false;
    }

    const dbId = projektId.replace('projekt-db-', ''); // UUID als String
    
    console.log('💾 Speichere Personal-Positionen:', {
      projektId,
      dbId,
      dbIdType: typeof dbId,
      positionCount: positionen.length
    });

    // Delete alte Positionen
    const { error: deleteError } = await client
      .from('albo_personal_positionen')
      .delete()
      .eq('project_id', dbId);

    if (deleteError) {
      console.warn('⚠️ Delete warning:', deleteError);
    }

    // Insert neue Positionen
    const positionenToInsert = positionen.map(pos => ({
      project_id: dbId,
      position_id: pos.id,
      position_name: pos.name,
      basis_gehalt: pos.basisGehalt || 0,
      vollkosten: pos.vollkosten || 0,
      fte_werte: pos.fteWerte || {},
      nebenkosten_faktor: pos.nebenkostenFaktor || 1.30,
      gehaltssteigerung: pos.gehaltssteigerung || 0.025
    }));
    
    console.log('👥 Positionen to insert:', JSON.stringify(positionenToInsert, null, 2));

    const { data, error } = await client
      .from('albo_personal_positionen')
      .insert(positionenToInsert)
      .select();

    if (error) {
      console.error('❌ Insert error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log(`✅ Saved ${data.length} Personal-Positionen for project ${projektId}`);
    return true;

  } catch (error) {
    console.error('❌ Failed to save Personal-Positionen:', error);
    state.setError('savePersonalPositionen', error);
    return false;
  }
}

// ==========================================
// BATCH OPERATIONS
// ==========================================

/**
 * Delete multiple projects
 * @param {string[]} projektIds - Array of project IDs
 * @returns {Promise<number>} Number of deleted projects
 */
export async function deleteMultipleProjects(projektIds) {
  let deletedCount = 0;

  for (const projektId of projektIds) {
    const success = await deleteProject(projektId);
    if (success) deletedCount++;
  }

  return deletedCount;
}

/**
 * Update multiple projects status
 * @param {string[]} projektIds - Array of project IDs
 * @param {string} newStatus - New status
 * @returns {Promise<number>} Number of updated projects
 */
export async function updateMultipleProjectsStatus(projektIds, newStatus) {
  let updatedCount = 0;

  for (const projektId of projektIds) {
    const projekt = state.getProjekt(projektId);
    if (projekt) {
      const success = await updateProject(projektId, {
        ...projekt,
        status: newStatus
      });
      if (success) updatedCount++;
    }
  }

  return updatedCount;
}

// ==========================================
// GESCHÄFTSMODELL API
// ==========================================

/**
 * Load Geschäftsmodell for a project
 * @param {string} projektId - Project UUID
 * @returns {Promise<object|null>} Geschäftsmodell data or null
 */
export async function loadGeschaeftsmodell(projektId) {
  const client = getClient();
  if (!client) return null;

  try {
    console.log(`📥 Loading Geschäftsmodell for projekt: ${projektId}`);

    const { data, error } = await client
      .from('geschaeftsmodell')
      .select('*')
      .eq('projekt_id', projektId)
      .maybeSingle();  // ← ÄNDERUNG: single() → maybeSingle()

    if (error) {
      console.error('❌ Load error:', error);
      throw error;
    }

    if (!data) {
      console.log('ℹ️ No Geschäftsmodell found for this projekt');
      return null;
    }

    console.log('✅ Geschäftsmodell loaded successfully');
    
    // Flatten the data structure for easier use
    return flattenGeschaeftsmodell(data);

  } catch (error) {
    console.error('❌ Load Geschäftsmodell error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    state.setError('load_geschaeftsmodell', error);
    return null;
  }
}

/**
 * Save Geschäftsmodell for a project
 * @param {string} projektId - Project UUID
 * @param {object} geschaeftsmodellData - Complete Geschäftsmodell data
 * @returns {Promise<boolean>} Success status
 */
export async function saveGeschaeftsmodell(projektId, geschaeftsmodellData) {
  const client = getClient();
  if (!client) return false;

  try {
    console.log(`💾 Saving Geschäftsmodell for projekt: ${projektId}`);

    // Prepare data for database
    const dbData = prepareGeschaeftsmodellForDB(projektId, geschaeftsmodellData);

    // Upsert (insert or update)
    const { error } = await client
      .from('geschaeftsmodell')
      .upsert(dbData, {
        onConflict: 'projekt_id',
        ignoreDuplicates: false
      });

    if (error) throw error;

    console.log('✅ Geschäftsmodell saved successfully');
    
    // Update state
    state.updateGeschaeftsmodell(projektId, geschaeftsmodellData);
    
    return true;

  } catch (error) {
    console.error('❌ Save Geschäftsmodell error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      full: error
    });
    state.setError('save_geschaeftsmodell', error);
    return false;
  }
}

/**
 * Delete Geschäftsmodell for a project
 * @param {string} projektId - Project UUID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteGeschaeftsmodell(projektId) {
  const client = getClient();
  if (!client) return false;

  try {
    console.log(`🗑️ Deleting Geschäftsmodell for projekt: ${projektId}`);

    const { error } = await client
      .from('geschaeftsmodell')
      .delete()
      .eq('projekt_id', projektId);

    if (error) throw error;

    console.log('✅ Geschäftsmodell deleted successfully');
    
    // Update state
    state.deleteGeschaeftsmodell(projektId);
    
    return true;

  } catch (error) {
    console.error('❌ Delete Geschäftsmodell error:', error);
    state.setError('delete_geschaeftsmodell', error);
    return false;
  }
}

/**
 * Calculate progress for Geschäftsmodell
 * @param {object} geschaeftsmodellData - Geschäftsmodell data
 * @returns {number} Progress percentage (0-100)
 */
export function calculateGeschaeftsmodellProgress(geschaeftsmodellData) {
  if (!geschaeftsmodellData) return 0;

  const importantFields = [
    'kundenproblem',
    'problemkosten',
    'urgency',
    'tam',
    'sam',
    'som',
    'kundentyp',
    'unternehmensgroesse',
    'branchen',
    'geografie',
    'kundenprofil',
    'buying_center',
    'competitors',
    'positioning',
    'competitive_moat',
    'revenue_streams',
    'deal_size',
    'sales_cycle',
    'sales_motion',
    'sales_team_current',
    'lead_gen_channels',
    'pricing_strategy',
    'produktkategorie',
    'value_proposition',
    'features',
    'assumptions'
  ];

  let filledCount = 0;
  const totalCount = importantFields.length;

  importantFields.forEach(field => {
    const value = geschaeftsmodellData[field];
    
    // Check if field is filled
    if (value !== null && value !== undefined && value !== '') {
      // For arrays, check if not empty
      if (Array.isArray(value) && value.length > 0) {
        filledCount++;
      } 
      // For objects (JSONB), check if not empty
      else if (typeof value === 'object' && Object.keys(value).length > 0) {
        filledCount++;
      }
      // For numbers, check if > 0
      else if (typeof value === 'number' && value > 0) {
        filledCount++;
      }
      // For strings, check if not empty
      else if (typeof value === 'string' && value.trim() !== '') {
        filledCount++;
      }
    }
  });

  return Math.round((filledCount / totalCount) * 100);
}

/**
 * Get completed sections
 * @param {object} geschaeftsmodellData - Geschäftsmodell data
 * @returns {string[]} Array of completed section numbers as strings
 */
export function getCompletedSections(geschaeftsmodellData) {
  if (!geschaeftsmodellData) return [];

  const sections = {
    '1': ['kundenproblem', 'problemkosten', 'urgency'],
    '2': ['tam', 'sam', 'som'],
    '3': ['kundentyp', 'unternehmensgroesse', 'branchen', 'geografie'],
    '4': ['competitors', 'positioning', 'competitive_moat'],
    '5': ['revenue_streams', 'deal_size', 'sales_cycle'],
    '6': ['sales_motion', 'sales_team_current', 'lead_gen_channels', 'pricing_strategy'],
    '7': ['produktkategorie', 'value_proposition', 'features'],
    '8': ['assumptions']
  };

  const completed = [];

  Object.entries(sections).forEach(([sectionNum, fields]) => {
    const allFilled = fields.every(field => {
      const value = geschaeftsmodellData[field];
      
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && Object.keys(value).length === 0) return false;
      
      return true;
    });

    if (allFilled) {
      completed.push(sectionNum);
    }
  });

  return completed;
}

// ==========================================
// HELPER FUNCTIONS (INTERNAL)
// ==========================================

/**
 * Flatten Geschäftsmodell from DB format to UI format
 */
function flattenGeschaeftsmodell(dbData) {
  if (!dbData) return null;

  return {
    // Section 1
    kundenproblem: dbData.kundenproblem,
    problemkosten: dbData.problemkosten,
    urgency: dbData.urgency,

    // Section 2
    tam: dbData.tam,
    tam_source: dbData.tam_source,
    tam_calculation: dbData.tam_calculation,
    sam: dbData.sam,
    sam_reasoning: dbData.sam_reasoning,
    sam_calculation: dbData.sam_calculation,
    som: dbData.som,
    som_reasoning: dbData.som_reasoning,
    som_calculation: dbData.som_calculation,
    market_validation: dbData.market_validation,

    // Section 3
    kundentyp: dbData.kundentyp,
    unternehmensgroesse: dbData.unternehmensgroesse,
    branchen: dbData.branchen,
    geografie: dbData.geografie,
    kundenprofil: dbData.kundenprofil,
    buying_center: dbData.buying_center,

    // Section 4
    competitors: dbData.competitors,
    status_quo: dbData.status_quo,
    do_nothing_cost: dbData.do_nothing_cost,
    positioning: dbData.positioning,
    competitive_moat: dbData.competitive_moat,
    moat_description: dbData.moat_description,

    // Section 5
    revenue_streams: dbData.revenue_streams,
    custom_streams: dbData.custom_streams,
    revenue_erklaerung: dbData.revenue_erklaerung,
    deal_size: dbData.deal_size,
    sales_cycle: dbData.sales_cycle,
    contract_length: dbData.contract_length,
    churn_rate: dbData.churn_rate,

    // Section 6
    sales_motion: dbData.sales_motion,
    sales_team_current: dbData.sales_team_current,
    sales_team_future: dbData.sales_team_future,
    quota_per_rep: dbData.quota_per_rep,
    ote_per_rep: dbData.ote_per_rep,
    lead_gen_channels: dbData.lead_gen_channels,
    marketing_budget_pct: dbData.marketing_budget_pct,
    cost_per_lead: dbData.cost_per_lead,
    lead_to_opp: dbData.lead_to_opp,
    opp_to_close: dbData.opp_to_close,
    pricing_strategy: dbData.pricing_strategy,
    max_discount: dbData.max_discount,
    early_adopter_discount: dbData.early_adopter_discount,
    onboarding_duration: dbData.onboarding_duration,
    support_level: dbData.support_level,
    expansion_strategy: dbData.expansion_strategy,

    // Section 7
    produktkategorie: dbData.produktkategorie,
    value_proposition: dbData.value_proposition,
    features: dbData.features,
    wettbewerbsvorteil: dbData.wettbewerbsvorteil,

    // Section 8
    assumptions: dbData.assumptions,
    risks: dbData.risks,
    success_factors: dbData.success_factors,

    // Meta
    notizen: dbData.notizen,
    progress: dbData.progress,
    completed_sections: dbData.completed_sections,
    created_at: dbData.created_at,
    updated_at: dbData.updated_at
  };
}

/**
 * Prepare Geschäftsmodell data for database
 */
function prepareGeschaeftsmodellForDB(projektId, formData) {
  const progress = calculateGeschaeftsmodellProgress(formData);
  const completedSections = getCompletedSections(formData);

  // Start with minimal required data
  const dbData = {
    projekt_id: projektId,
    updated_at: new Date().toISOString(),
    progress: progress,
    completed_sections: completedSections
  };

  // Only add fields that are NOT null/undefined/empty
  const addIfExists = (key, value) => {
    if (value !== null && value !== undefined && value !== '') {
      // For arrays, only add if not empty
      if (Array.isArray(value) && value.length === 0) return;
      dbData[key] = value;
    }
  };

  // Section 1
  addIfExists('kundenproblem', formData.kundenproblem);
  addIfExists('problemkosten', formData.problemkosten);
  addIfExists('urgency', formData.urgency);

  // Section 2
  addIfExists('tam', formData.tam);
  addIfExists('tam_source', formData.tam_source);
  addIfExists('tam_calculation', formData.tam_calculation);
  addIfExists('sam', formData.sam);
  addIfExists('sam_reasoning', formData.sam_reasoning);
  addIfExists('sam_calculation', formData.sam_calculation);
  addIfExists('som', formData.som);
  addIfExists('som_reasoning', formData.som_reasoning);
  addIfExists('som_calculation', formData.som_calculation);
  addIfExists('market_validation', formData.market_validation);

  // Section 3
  addIfExists('kundentyp', formData.kundentyp);
  addIfExists('unternehmensgroesse', formData.unternehmensgroesse);
  addIfExists('branchen', formData.branchen);
  addIfExists('geografie', formData.geografie);
  addIfExists('kundenprofil', formData.kundenprofil);
  addIfExists('buying_center', formData.buying_center);

  // Section 4
  addIfExists('competitors', formData.competitors);
  addIfExists('status_quo', formData.status_quo);
  addIfExists('do_nothing_cost', formData.do_nothing_cost);
  addIfExists('positioning', formData.positioning);
  addIfExists('competitive_moat', formData.competitive_moat);
  addIfExists('moat_description', formData.moat_description);

  // Section 5
  addIfExists('revenue_streams', formData.revenue_streams);
  addIfExists('custom_streams', formData.custom_streams);
  addIfExists('revenue_erklaerung', formData.revenue_erklaerung);
  addIfExists('deal_size', formData.deal_size);
  addIfExists('sales_cycle', formData.sales_cycle);
  addIfExists('contract_length', formData.contract_length);
  addIfExists('churn_rate', formData.churn_rate);

  // Section 6
  addIfExists('sales_motion', formData.sales_motion);
  addIfExists('sales_team_current', formData.sales_team_current);
  addIfExists('sales_team_future', formData.sales_team_future);
  addIfExists('quota_per_rep', formData.quota_per_rep);
  addIfExists('ote_per_rep', formData.ote_per_rep);
  addIfExists('lead_gen_channels', formData.lead_gen_channels);
  addIfExists('marketing_budget_pct', formData.marketing_budget_pct);
  addIfExists('cost_per_lead', formData.cost_per_lead);
  addIfExists('lead_to_opp', formData.lead_to_opp);
  addIfExists('opp_to_close', formData.opp_to_close);
  addIfExists('pricing_strategy', formData.pricing_strategy);
  addIfExists('max_discount', formData.max_discount);
  addIfExists('early_adopter_discount', formData.early_adopter_discount);
  addIfExists('onboarding_duration', formData.onboarding_duration);
  addIfExists('support_level', formData.support_level);
  addIfExists('expansion_strategy', formData.expansion_strategy);

  // Section 7
  addIfExists('produktkategorie', formData.produktkategorie);
  addIfExists('value_proposition', formData.value_proposition);
  addIfExists('features', formData.features);
  addIfExists('wettbewerbsvorteil', formData.wettbewerbsvorteil);

  // Section 8
  addIfExists('assumptions', formData.assumptions);
  addIfExists('risks', formData.risks);
  addIfExists('success_factors', formData.success_factors);

  // Meta
  addIfExists('notizen', formData.notizen);

  console.log('📦 Prepared DB Data (only non-null):', dbData);
  
  return dbData;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Check if Supabase is ready
 * @returns {boolean} Ready status
 */
export function isSupabaseReady() {
  return supabaseClient !== null;
}

/**
 * Get connection status
 * @returns {object} Status object
 */
export function getConnectionStatus() {
  return {
    isConnected: supabaseClient !== null,
    hasErrors: state.getErrors().length > 0,
    errors: state.getErrors()
  };
}

// Export default object
export default {
  initializeSupabase,
  loadProjects,
  saveProject,
  updateProject,
  deleteProject,
  loadArticles,
  saveArticle,
  updateArticle,
  deleteArticle,
  deleteMultipleProjects,
  updateMultipleProjectsStatus,
  isSupabaseReady,
  getConnectionStatus,
  // Neue Projektkosten-Funktionen
  loadKostenblöcke,
  saveKostenblöcke,
  updateKostenblockWert,
  loadPersonalPositionen,
  savePersonalPositionen,
  deleteKostenblock,
   // Geschäftsmodell
  loadGeschaeftsmodell,
  saveGeschaeftsmodell,
  deleteGeschaeftsmodell,
  calculateGeschaeftsmodellProgress,
  getCompletedSections,
  // ✅ NEW: Revenue Forecasts
  saveForecast,
  loadForecast,
  loadAllForecasts
};
