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
      zeitraum: artikelData.zeitraum || 5
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
 * Load Personal-Positionen für ein Projekt
 * @param {string} projektId - Project ID
 * @returns {Promise<Array>} Array of Personal-Positionen
 */
export async function loadPersonalPositionen(projektId) {
  const client = getClient();
  if (!client) return [];

  try {
    const dbId = parseInt(projektId.replace('projekt-db-', '')); // WICHTIG: als Number

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

    const dbId = parseInt(projektId.replace('projekt-db-', ''));
    
    // Validierung: Prüfe ob dbId eine gültige Zahl ist
    if (isNaN(dbId) || dbId <= 0) {
      console.error('❌ Ungültige dbId nach Parsing:', dbId, 'von projektId:', projektId);
      return false;
    }
    
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
  deleteKostenblock
};
