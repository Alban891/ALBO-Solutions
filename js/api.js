/**
 * CFO Dashboard - API Layer (EXTENDED v2.0)
 * Enterprise-grade Supabase wrapper with error handling,
 * retry logic, and data validation
 * 
 * ERWEITERT um: 
 * - Projektkosten (Kostenblöcke + Personal-Positionen)
 * - Revenue Forecasts (ALBO_Revenue_Forecasts)
 * 
 * @version 2.0.0
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
// ✅ NEUE FUNKTIONEN: REVENUE FORECASTS
// ==========================================

/**
 * Save a new revenue forecast to database
 * 
 * @param {string} artikelId - Article ID (format: "artikel-db-XXX")
 * @param {string} modelType - Model type: 'hardware', 'software', 'service', 'package'
 * @param {Object} forecastData - Forecast data
 * @param {Array<number>} forecastData.years - Years [2025, 2026, ...]
 * @param {Array<number>} forecastData.revenue - Revenue per year
 * @param {Array<number>} forecastData.totalCost - Total cost per year
 * @param {Array<number>} forecastData.db2 - DB2 per year
 * @param {Array<number>} forecastData.db2Margin - DB2 margin % per year
 * @param {Object} parameters - Input parameters
 * @param {string} [scenario='base'] - Scenario: 'base', 'best', 'worst', 'custom'
 * @param {string} [notes=''] - Optional notes
 * @returns {Promise<Object|null>} Saved forecast or null
 * 
 * @example
 * const forecast = await saveForecast('artikel-db-123', 'hardware', {
 *   years: [2025, 2026, 2027],
 *   revenue: [50000, 52500, 55125],
 *   totalCost: [17000, 17850, 18742.5],
 *   db2: [30000, 31500, 33075],
 *   db2Margin: [60, 60, 60]
 * }, {
 *   startMenge: 100,
 *   startPreis: 500,
 *   startHK: 170
 * });
 */
export async function saveForecast(artikelId, modelType, forecastData, parameters, scenario = 'base', notes = '') {
  const client = getClient();
  if (!client) return null;

  try {
    console.log(`💾 Saving ${modelType} forecast for artikel ${artikelId}`);

    // Extract DB ID from artikel ID
    const dbId = artikelId.replace('artikel-db-', '');

    // Validate model type
    const validModelTypes = ['hardware', 'software', 'service', 'package'];
    if (!validModelTypes.includes(modelType)) {
      throw new Error(`Invalid model type: ${modelType}. Must be one of: ${validModelTypes.join(', ')}`);
    }

    // Validate forecast data
    if (!forecastData.years || !Array.isArray(forecastData.years)) {
      throw new Error('forecast_data.years must be an array');
    }
    if (!forecastData.revenue || !Array.isArray(forecastData.revenue)) {
      throw new Error('forecast_data.revenue must be an array');
    }

    // Prepare data for database
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
      created_by: 'user', // TODO: Add actual user tracking
      updated_by: 'user'
    };

    console.log('📦 Data to save:', dataToSave);

    // Insert into database
    const { data, error } = await client
      .from('ALBO_Revenue_Forecasts')
      .insert([dataToSave])
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
 * Update an existing revenue forecast
 * 
 * @param {string} forecastId - Forecast ID (UUID)
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 * 
 * @example
 * const success = await updateForecast('forecast-uuid-123', {
 *   forecast_data: { ... },
 *   parameters: { ... },
 *   notes: 'Updated with new data'
 * });
 */
export async function updateForecast(forecastId, updates) {
  const client = getClient();
  if (!client) return false;

  try {
    console.log(`💾 Updating forecast ${forecastId}`);

    // Prepare updates
    const dataToUpdate = {
      ...updates,
      updated_by: 'user', // TODO: Add actual user tracking
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from('ALBO_Revenue_Forecasts')
      .update(dataToUpdate)
      .eq('id', forecastId);

    if (error) throw error;

    console.log('✅ Forecast updated successfully');
    return true;

  } catch (error) {
    console.error('❌ Failed to update forecast:', error);
    state.setError('updateForecast', error);
    return false;
  }
}

/**
 * Load a specific revenue forecast
 * 
 * @param {string} artikelId - Article ID
 * @param {string} modelType - Model type
 * @param {string} [scenario='base'] - Scenario
 * @returns {Promise<Object|null>} Forecast data or null
 * 
 * @example
 * const forecast = await loadForecast('artikel-db-123', 'hardware');
 * if (forecast) {
 *   console.log(forecast.forecast_data.revenue);
 * }
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
 * 
 * @param {string} artikelId - Article ID
 * @param {boolean} [activeOnly=true] - Load only active forecasts
 * @returns {Promise<Array>} Array of forecasts
 * 
 * @example
 * const forecasts = await loadAllForecasts('artikel-db-123');
 * forecasts.forEach(f => {
 *   console.log(`${f.model_type}: ${f.forecast_data.revenue}`);
 * });
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

/**
 * Delete a revenue forecast
 * 
 * @param {string} forecastId - Forecast ID (UUID)
 * @returns {Promise<boolean>} Success status
 * 
 * @example
 * const success = await deleteForecast('forecast-uuid-123');
 */
export async function deleteForecast(forecastId) {
  const client = getClient();
  if (!client) return false;

  try {
    console.log(`🗑️ Deleting forecast ${forecastId}`);

    const { error } = await client
      .from('ALBO_Revenue_Forecasts')
      .delete()
      .eq('id', forecastId);

    if (error) throw error;

    console.log('✅ Forecast deleted successfully');
    return true;

  } catch (error) {
    console.error('❌ Failed to delete forecast:', error);
    state.setError('deleteForecast', error);
    return false;
  }
}

/**
 * Deactivate old forecasts (mark as inactive instead of deleting)
 * 
 * @param {string} artikelId - Article ID
 * @param {string} modelType - Model type
 * @param {string} scenario - Scenario
 * @returns {Promise<boolean>} Success status
 * 
 * @example
 * const success = await deactivateOldForecasts('artikel-db-123', 'hardware', 'base');
 */
export async function deactivateOldForecasts(artikelId, modelType, scenario = 'base') {
  const client = getClient();
  if (!client) return false;

  try {
    const dbId = artikelId.replace('artikel-db-', '');

    console.log(`🔄 Deactivating old ${modelType} forecasts for artikel ${artikelId}`);

    const { error } = await client
      .from('ALBO_Revenue_Forecasts')
      .update({ is_active: false })
      .eq('artikel_id', dbId)
      .eq('model_type', modelType)
      .eq('scenario', scenario);

    if (error) throw error;

    console.log('✅ Old forecasts deactivated');
    return true;

  } catch (error) {
    console.error('❌ Failed to deactivate forecasts:', error);
    state.setError('deactivateOldForecasts', error);
    return false;
  }
}

/**
 * Load all forecasts for a project (across all articles)
 * Useful for Wirtschaftlichkeit calculations
 * 
 * @param {string} projektId - Project ID
 * @param {boolean} [activeOnly=true] - Load only active forecasts
 * @returns {Promise<Array>} Array of forecasts with article names
 * 
 * @example
 * const forecasts = await loadProjectForecasts('projekt-db-123');
 */
export async function loadProjectForecasts(projektId, activeOnly = true) {
  const client = getClient();
  if (!client) return [];

  try {
    const dbProjektId = projektId.replace('projekt-db-', '');

    console.log(`📥 Loading all forecasts for projekt ${projektId}`);

    // Query with JOIN to get artikel names
    let query = client
      .from('v_active_forecasts') // Use the view we created
      .select('*')
      .eq('artikel_id', dbProjektId);

    if (!activeOnly) {
      // If not using view, use raw table
      query = client
        .from('ALBO_Revenue_Forecasts')
        .select(`
          *,
          ALBO_Artikel!inner (
            name,
            typ,
            project_id
          )
        `)
        .eq('ALBO_Artikel.project_id', dbProjektId);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log(`✅ Loaded ${data.length} project forecast(s)`);
    return data;

  } catch (error) {
    console.error('❌ Failed to load project forecasts:', error);
    state.setError('loadProjectForecasts', error);
    return [];
  }
}

/**
 * Check if a forecast exists for an article
 * 
 * @param {string} artikelId - Article ID
 * @param {string} modelType - Model type
 * @param {string} [scenario='base'] - Scenario
 * @returns {Promise<boolean>} True if forecast exists
 * 
 * @example
 * const exists = await forecastExists('artikel-db-123', 'hardware');
 * if (!exists) {
 *   console.log('No forecast found, create one');
 * }
 */
export async function forecastExists(artikelId, modelType, scenario = 'base') {
  const client = getClient();
  if (!client) return false;

  try {
    const dbId = artikelId.replace('artikel-db-', '');

    const { count, error } = await client
      .from('ALBO_Revenue_Forecasts')
      .select('id', { count: 'exact', head: true })
      .eq('artikel_id', dbId)
      .eq('model_type', modelType)
      .eq('scenario', scenario)
      .eq('is_active', true);

    if (error) throw error;

    return count > 0;

  } catch (error) {
    console.error('❌ Failed to check forecast existence:', error);
    return false;
  }
}

// ==========================================
// PROJEKT API (existing code - keeping as reference)
// ==========================================

// ... [Keep all existing functions: loadProjects, saveProject, etc.] ...

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

// ==========================================
// EXPORT - UPDATED WITH NEW FUNCTIONS
// ==========================================

export default {
  // Initialization
  initializeSupabase,
  isSupabaseReady,
  getConnectionStatus,
  
  // Projects
  loadProjects,
  saveProject,
  updateProject,
  deleteProject,
  deleteMultipleProjects,
  updateMultipleProjectsStatus,
  
  // Articles
  loadArticles,
  saveArticle,
  updateArticle,
  deleteArticle,
  
  // Projektkosten
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
  updateForecast,
  loadForecast,
  loadAllForecasts,
  deleteForecast,
  deactivateOldForecasts,
  loadProjectForecasts,
  forecastExists
};
