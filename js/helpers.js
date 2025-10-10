/**
 * CFO Dashboard - Helper Functions
 * Professional formatting, parsing, and utility functions
 * Production-ready with extensive error handling
 * 
 * FIXES: formatCurrency() nun mit korrektem deutschen Format ohne Nachkommastellen
 */

// ==========================================
// SECURITY & HTML ESCAPING
// ==========================================

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  
  const text = String(str);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ==========================================
// NUMBER FORMATTING
// ==========================================

/**
 * Format number with thousands separator (German style)
 * @param {number|string} num - Number to format
 * @returns {string} Formatted number (e.g., "1.234.567")
 */
export function formatThousands(num) {
  if (num === null || num === undefined || num === '') return '0';
  
  try {
    const numValue = typeof num === 'string' ? parseFloat(num.replace(/\./g, '').replace(',', '.')) : num;
    if (isNaN(numValue)) return '0';
    
    return Math.round(numValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } catch (error) {
    console.error('formatThousands error:', error);
    return '0';
  }
}

/**
 * Format decimal number (German style with comma)
 * @param {number|string} num - Number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number (e.g., "123,45")
 */
export function formatDecimal(num, decimals = 2) {
  if (num === null || num === undefined || num === '') return '0,00';
  
  try {
    const numValue = typeof num === 'string' ? parseFloat(num.replace(/\./g, '').replace(',', '.')) : num;
    if (isNaN(numValue)) return '0,00';
    
    return numValue.toFixed(decimals).replace('.', ',');
  } catch (error) {
    console.error('formatDecimal error:', error);
    return '0,00';
  }
}

/**
 * Format revenue/large numbers with k€ or M€
 * @param {number} value - Value to format (in thousands)
 * @returns {string} Formatted value (e.g., "1.5M€" or "234k€")
 */
export function formatRevenue(value) {
  if (!value || isNaN(value)) return '0€';
  
  try {
    // If >= 1000k (= 1M), show in M€
    if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1).replace('.', ',') + 'M€';
    }
    
    // If >= 1k, show in k€
    if (Math.abs(value) >= 1) {
      return value.toFixed(0) + 'k€';
    }
    
    // Otherwise show in €
    return (value * 1000).toFixed(0) + '€';
  } catch (error) {
    console.error('formatRevenue error:', error);
    return '0€';
  }
}

/**
 * Format currency (always in €) - Deutsches Format
 * @param {number} value - Value to format
 * @param {boolean} showDecimals - Show decimal places (default: false für ganze Euros)
 * @returns {string} Formatted currency (e.g., "120.000€" oder "1.234,56€")
 */
export function formatCurrency(value, showDecimals = false) {
  if (value === null || value === undefined) return '0€';
  
  try {
    // Parse string to number if needed
    const numValue = typeof value === 'string' 
      ? parseFloat(value.replace(/\./g, '').replace(',', '.')) 
      : value;
    
    if (isNaN(numValue)) return '0€';
    
    // OHNE Nachkommastellen (Standard für CFO Dashboard)
    if (!showDecimals) {
      const rounded = Math.round(numValue);
      return rounded.toLocaleString('de-DE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + '€';
    }
    
    // MIT Nachkommastellen (falls explizit gewünscht)
    return numValue.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '€';
    
  } catch (error) {
    console.error('formatCurrency error:', error);
    return '0€';
  }
}

/**
 * Format percentage
 * @param {number} value - Value to format (0-100)
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage (e.g., "12,5%")
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '0%';
  
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0%';
    
    return numValue.toFixed(decimals).replace('.', ',') + '%';
  } catch (error) {
    console.error('formatPercentage error:', error);
    return '0%';
  }
}

// ==========================================
// NUMBER PARSING
// ==========================================

/**
 * Parse formatted number string to float
 * Handles German format: "1.234,56" → 1234.56
 * @param {string} str - Formatted number string
 * @returns {number} Parsed number
 */
export function parseFormattedNumber(str) {
  if (!str || str === '') return 0;
  
  try {
    // Remove all non-numeric characters except comma and minus
    let cleaned = str.toString().replace(/[^\d,-]/g, '');
    
    // Replace comma with dot
    cleaned = cleaned.replace(',', '.');
    
    const result = parseFloat(cleaned);
    return isNaN(result) ? 0 : result;
  } catch (error) {
    console.error('parseFormattedNumber error:', error);
    return 0;
  }
}

// ==========================================
// INPUT FORMATTING (Real-time)
// ==========================================

/**
 * Format input field with thousands separator (real-time)
 * @param {HTMLInputElement} input - Input element
 */
export function formatNumberInput(input) {
  if (!input) return;
  
  try {
    let value = input.value.trim();
    if (value === '') return;
    
    // Parse and reformat
    const numValue = parseFormattedNumber(value);
    input.value = formatThousands(numValue);
  } catch (error) {
    console.error('formatNumberInput error:', error);
  }
}

/**
 * Format input field with decimal (real-time)
 * @param {HTMLInputElement} input - Input element
 * @param {number} decimals - Decimal places
 */
export function formatDecimalInput(input, decimals = 2) {
  if (!input) return;
  
  try {
    let value = input.value.trim();
    if (value === '') return;
    
    // Parse and reformat
    const numValue = parseFormattedNumber(value);
    input.value = formatDecimal(numValue, decimals);
  } catch (error) {
    console.error('formatDecimalInput error:', error);
  }
}

/**
 * Format cost input (thousands with optional decimals)
 * @param {HTMLInputElement} input - Input element
 */
export function formatKostenInput(input) {
  if (!input) return;
  
  try {
    let value = input.value.trim();
    if (value === '') return;
    
    // Remove all non-numeric except comma/dot
    value = value.replace(/[^\d,.-]/g, '');
    value = value.replace(',', '.');
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      input.value = Math.round(numValue).toString();
    }
  } catch (error) {
    console.error('formatKostenInput error:', error);
  }
}

// ==========================================
// DATE FORMATTING
// ==========================================

/**
 * Format date safely (handles various input formats)
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date (e.g., "Jan 2025") or "-"
 */
export function formatDateSafe(dateString) {
  if (!dateString || dateString === '-') return '-';
  
  try {
    let dateToFormat = String(dateString).trim();
    
    // Handle "2026-01" format (without day)
    if (dateToFormat.length === 7 && dateToFormat.includes('-')) {
      dateToFormat = dateToFormat + '-01';
    }
    
    const date = new Date(dateToFormat);
    
    // Check if valid date
    if (isNaN(date.getTime())) {
      return dateString; // Return original if can't parse
    }
    
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch (error) {
    console.error('formatDateSafe error:', error, dateString);
    return '-';
  }
}

/**
 * Format date for input[type="month"]
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (e.g., "2025-01")
 */
export function formatDateForInput(date) {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    
    return `${year}-${month}`;
  } catch (error) {
    console.error('formatDateForInput error:', error);
    return '';
  }
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date
 */
export function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate number in range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Is valid
 */
export function isInRange(value, min, max) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(numValue) && numValue >= min && numValue <= max;
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} Is valid (not empty)
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

// ==========================================
// DOM UTILITIES
// ==========================================

/**
 * Get element by ID safely (with null check)
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} Element or null
 */
export function getElement(id) {
  try {
    return document.getElementById(id);
  } catch (error) {
    console.error('getElement error:', error, id);
    return null;
  }
}

/**
 * Get input value safely
 * @param {string} id - Input ID
 * @returns {string} Value or empty string
 */
export function getInputValue(id) {
  const element = getElement(id);
  return element ? element.value : '';
}

/**
 * Set input value safely
 * @param {string} id - Input ID
 * @param {any} value - Value to set
 */
export function setInputValue(id, value) {
  const element = getElement(id);
  if (element) {
    element.value = value !== null && value !== undefined ? value : '';
  }
}

/**
 * Show/hide element
 * @param {string} id - Element ID
 * @param {boolean} show - Show or hide
 */
export function toggleElement(id, show) {
  const element = getElement(id);
  if (element) {
    element.style.display = show ? 'block' : 'none';
  }
}

/**
 * Toggle custom input field for select dropdowns with "custom" option
 * @param {HTMLSelectElement} selectElement - The select element
 * @param {string} customInputId - ID of the custom input field
 */
export function toggleCustomInput(selectElement, customInputId) {
  const customInput = document.getElementById(customInputId);
  if (!customInput) return;
  
  if (selectElement.value === 'custom') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
    customInput.value = '';
  }
}

/**
 * Get value from select with custom option support
 * @param {string} selectId - ID of the select element
 * @param {string} customInputId - ID of the custom input field
 * @returns {string} The selected or custom value
 */
export function getSelectOrCustomValue(selectId, customInputId) {
  const selectValue = getInputValue(selectId);
  if (selectValue === 'custom') {
    return getInputValue(customInputId);
  }
  return selectValue;
}

// ==========================================
// CALCULATION HELPERS
// ==========================================

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 * @param {number} startValue - Starting value
 * @param {number} endValue - Ending value
 * @param {number} years - Number of years
 * @returns {number} CAGR percentage
 */
export function calculateCAGR(startValue, endValue, years) {
  if (!startValue || !endValue || !years || startValue <= 0) return 0;
  
  try {
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  } catch (error) {
    console.error('calculateCAGR error:', error);
    return 0;
  }
}

/**
 * Calculate NPV (Net Present Value)
 * @param {number[]} cashFlows - Array of cash flows
 * @param {number} discountRate - Discount rate (e.g., 0.08 for 8%)
 * @returns {number} NPV
 */
export function calculateNPV(cashFlows, discountRate) {
  if (!cashFlows || cashFlows.length === 0) return 0;
  
  try {
    return cashFlows.reduce((npv, cashFlow, year) => {
      return npv + cashFlow / Math.pow(1 + discountRate, year);
    }, 0);
  } catch (error) {
    console.error('calculateNPV error:', error);
    return 0;
  }
}

/**
 * Calculate payback period
 * @param {number[]} cashFlows - Array of cash flows
 * @returns {number} Payback period in years
 */
export function calculatePayback(cashFlows) {
  if (!cashFlows || cashFlows.length === 0) return 0;
  
  try {
    let cumulative = 0;
    
    for (let i = 0; i < cashFlows.length; i++) {
      cumulative += cashFlows[i];
      if (cumulative >= 0) {
        return i + 1;
      }
    }
    
    return cashFlows.length;
  } catch (error) {
    console.error('calculatePayback error:', error);
    return 0;
  }
}

// ==========================================
// ARRAY UTILITIES
// ==========================================

/**
 * Sum array of numbers
 * @param {number[]} arr - Array of numbers
 * @returns {number} Sum
 */
export function sumArray(arr) {
  if (!arr || arr.length === 0) return 0;
  
  return arr.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
}

/**
 * Average of array
 * @param {number[]} arr - Array of numbers
 * @returns {number} Average
 */
export function averageArray(arr) {
  if (!arr || arr.length === 0) return 0;
  
  return sumArray(arr) / arr.length;
}

/**
 * Get max value from array
 * @param {number[]} arr - Array of numbers
 * @returns {number} Max value
 */
export function maxArray(arr) {
  if (!arr || arr.length === 0) return 0;
  
  return Math.max(...arr.map(val => parseFloat(val) || 0));
}

// ==========================================
// DEBOUNCE & THROTTLE
// ==========================================

/**
 * Debounce function (prevents rapid firing)
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone object (safe copy)
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('deepClone error:', error);
    return obj;
  }
}

// Export all as default object
export default {
  escapeHtml,
  formatThousands,
  formatDecimal,
  formatRevenue,
  formatCurrency,
  formatPercentage,
  parseFormattedNumber,
  formatNumberInput,
  formatDecimalInput,
  formatKostenInput,
  formatDateSafe,
  formatDateForInput,
  getCurrentDate,
  isValidEmail,
  isInRange,
  isRequired,
  getElement,
  getInputValue,
  setInputValue,
  toggleElement,
  calculateCAGR,
  calculateNPV,
  calculatePayback,
  sumArray,
  averageArray,
  maxArray,
  debounce,
  deepClone,
  toggleCustomInput,
  getSelectOrCustomValue
};
