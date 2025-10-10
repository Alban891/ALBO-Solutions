/**
 * CFO Dashboard - Wirtschaftlichkeit Module
 * Type Definitions & JSDoc Annotations
 * 
 * @module wirtschaftlichkeit/types
 * @description Comprehensive type definitions for contribution margin calculations
 * @author Senior Development Team
 * @version 2.0.0
 */

/**
 * @typedef {Object} HKAufteilung
 * @property {number} material_prozent - Material cost percentage of total HK (0-100)
 * @property {number} fertigung_prozent - Direct labour percentage of total HK (0-100)
 * @property {number} overhead_prozent - Manufacturing overhead percentage of total HK (0-100)
 * @property {string} [quelle='user'] - Source of the split: 'user', 'ki-default', 'branche'
 * @property {string} [letzteAenderung] - ISO timestamp of last modification
 */

/**
 * @typedef {Object} ArtikelExtended
 * @property {string} id - Unique article identifier
 * @property {string} name - Article name
 * @property {string} typ - Article type: 'Hardware', 'Software', 'Service'
 * @property {number} hk_gesamt - Total manufacturing cost per unit (Herstellkosten)
 * @property {HKAufteilung} hk_aufteilung - Cost structure breakdown
 * @property {Object.<string, number>} mengen - Quantities per year {jahr: menge}
 * @property {Object.<string, number>} preise - Prices per year {jahr: preis}
 */

/**
 * @typedef {Object} KostenblockKategorie
 * @property {('development'|'selling_marketing'|'admin_distribution')} kategorie - DB category assignment
 * @property {number} konfidenz - AI confidence score (0-100)
 * @property {string} rechtsgrundlage - Legal basis (e.g., "HGB § 275 Abs. 2 Nr. 5")
 * @property {string} begründung - Detailed reasoning for categorization
 * @property {KostenblockAlternative} [alternative] - Alternative categorization if applicable
 * @property {string} [praxis_tipp] - Practical implementation advice
 */

/**
 * @typedef {Object} KostenblockAlternative
 * @property {('development'|'selling_marketing'|'admin_distribution')} kategorie - Alternative category
 * @property {string} bedingung - Condition under which alternative applies
 * @property {number} konfidenz - Confidence score for alternative (0-100)
 * @property {string} rechtsgrundlage - Legal basis for alternative
 */

/**
 * @typedef {Object} Kostenblock
 * @property {string} id - Unique cost block identifier
 * @property {string} name - Cost block name
 * @property {string} icon - Emoji icon for display
 * @property {boolean} isActive - Whether cost block is currently active
 * @property {Object.<string, number>} kostenWerte - Cost values per year {jahr: wert}
 * @property {KostenblockKategorie} kategorisierung - Category assignment with reasoning
 */

/**
 * @typedef {Object} JahresWirtschaftlichkeit
 * @property {number} sales_revenue - Total sales revenue
 * @property {number} material_costs - Direct material costs
 * @property {number} direct_labour - Direct labour costs
 * @property {number} db1 - Contribution Margin I
 * @property {number} material_overhead - Material handling overhead
 * @property {number} manufacturing_overhead - Manufacturing overhead
 * @property {number} db2 - Contribution Margin II (Manufacturing Margin)
 * @property {number} db2_margin_prozent - DB2 as percentage of sales
 * @property {number} development_overhead - R&D costs from project costs
 * @property {number} db3 - Contribution Margin III
 * @property {number} selling_overhead - Sales costs
 * @property {number} marketing_overhead - Marketing costs
 * @property {number} db4 - Contribution Margin IV
 * @property {number} distribution_overhead - Distribution costs
 * @property {number} admin_overhead - Administrative costs
 * @property {number} db5 - Contribution Margin V
 * @property {number} ebit - Earnings Before Interest and Taxes
 * @property {number} ebit_margin_prozent - EBIT as percentage of sales
 */

/**
 * @typedef {Object} WirtschaftlichkeitResult
 * @property {Object.<string, JahresWirtschaftlichkeit>} jahre - Results per year
 * @property {WirtschaftlichkeitTotals} totals - Aggregated totals across all years
 * @property {WirtschaftlichkeitKPIs} kpis - Key Performance Indicators
 * @property {WirtschaftlichkeitMetadata} metadata - Calculation metadata
 */

/**
 * @typedef {Object} WirtschaftlichkeitTotals
 * @property {number} sales_revenue_total
 * @property {number} db1_total
 * @property {number} db2_total
 * @property {number} db3_total
 * @property {number} ebit_total
 */

/**
 * @typedef {Object} WirtschaftlichkeitKPIs
 * @property {number} avg_manufacturing_margin - Average DB2 margin across years
 * @property {number} avg_ebit_margin - Average EBIT margin across years
 * @property {string|null} break_even_year - Year when cumulative EBIT turns positive
 * @property {number} npv - Net Present Value at given WACC
 * @property {number} irr - Internal Rate of Return (percentage)
 * @property {number} payback_period - Years until investment is recovered
 */

/**
 * @typedef {Object} WirtschaftlichkeitMetadata
 * @property {string} berechnet_am - ISO timestamp of calculation
 * @property {string} artikel_id - Article ID (or 'projekt-aggregiert')
 * @property {string} projekt_id - Project ID
 * @property {number} anzahl_artikel - Number of articles included
 * @property {string[]} verwendete_kostenblöcke - List of cost block IDs used
 * @property {Object.<string, number>} hk_aufteilungs_faktoren - Applied HK split factors
 */

/**
 * @typedef {Object} HKDefaultProfile
 * @property {string} typ - Article type
 * @property {number} material - Default material percentage
 * @property {number} fertigung - Default direct labour percentage
 * @property {number} overhead - Default overhead percentage
 * @property {string} beschreibung - Description of typical use case
 * @property {string} quelle - Source of default values
 * @property {HKBenchmark} [benchmark] - Industry benchmark data
 */

/**
 * @typedef {Object} HKBenchmark
 * @property {number} median - Median value in industry
 * @property {number} p25 - 25th percentile
 * @property {number} p75 - 75th percentile
 * @property {string} quelle - Data source
 * @property {string} jahr - Reference year
 */

/**
 * @typedef {Object} KostenMapping
 * @property {string[]} development - Cost block IDs mapped to Development (DB3)
 * @property {string[]} selling_marketing - Cost block IDs mapped to Sales & Marketing (DB4)
 * @property {string[]} admin_distribution - Cost block IDs mapped to Admin & Distribution (DB5)
 */

/**
 * @typedef {Object} AIKategorisierungsRequest
 * @property {string} blockName - Name of cost block to categorize
 * @property {string} [blockBeschreibung] - Optional description
 * @property {string} [projektKontext] - Project context information
 * @property {string} [branche] - Industry sector
 */

/**
 * @typedef {Object} AIKategorisierungsResponse
 * @property {('development'|'selling_marketing'|'admin_distribution')} kategorie - Recommended category
 * @property {number} konfidenz - Confidence score (0-100)
 * @property {string} begründung - Detailed reasoning
 * @property {string} rechtsgrundlage - Legal reference (e.g., "HGB § 275")
 * @property {KostenblockAlternative} [alternative] - Alternative categorization
 * @property {string} [praxis_tipp] - Practical advice
 * @property {string} [steuerlicher_hinweis] - Tax considerations
 * @property {Object} [differenzierung] - Further differentiation if applicable
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {ValidationError[]} errors - List of validation errors
 * @property {ValidationWarning[]} warnings - List of validation warnings
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - Field that failed validation
 * @property {string} message - Error message
 * @property {string} code - Error code for i18n
 */

/**
 * @typedef {Object} ValidationWarning
 * @property {string} field - Field with warning
 * @property {string} message - Warning message
 * @property {string} recommendation - Recommended action
 */

/**
 * @typedef {Object} CalculationOptions
 * @property {boolean} [includeKI=true] - Whether to include AI-based categorizations
 * @property {boolean} [validateInputs=true] - Whether to validate inputs
 * @property {number} [wacc=0.08] - Weighted Average Cost of Capital for NPV (default 8%)
 * @property {boolean} [aggregated=false] - Whether to aggregate multiple articles
 * @property {string[]} [jahre] - Optional specific years to calculate
 */

/**
 * NPV Calculation Parameters
 * @typedef {Object} NPVParams
 * @property {number[]} cashflows - Array of cashflows per period
 * @property {number} discountRate - Discount rate (WACC)
 * @property {number} [initialInvestment=0] - Initial investment at t=0
 */

/**
 * IRR Calculation Result
 * @typedef {Object} IRRResult
 * @property {number} irr - Internal Rate of Return (percentage)
 * @property {number} iterations - Number of iterations to converge
 * @property {boolean} converged - Whether calculation converged
 */

// Export type definitions for IDE support
export default {};