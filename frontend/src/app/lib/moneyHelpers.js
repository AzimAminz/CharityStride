/**
 * Money Helper Functions
 * Converts between Ringgit (RM) and cents for exact precision
 */

/**
 * Convert ringgit to cents (integer)
 * @param {number|string} ringgit - Amount in ringgit (e.g., 50.00, "50", "50.5")
 * @returns {number} Amount in cents (e.g., 5000)
 */
export function ringgitToCents(ringgit) {
  const amount = parseFloat(ringgit) || 0;
  return Math.round(amount * 100);
}

/**
 * Convert cents to ringgit (decimal)
 * @param {number} cents - Amount in cents (e.g., 5000)
 * @returns {number} Amount in ringgit (e.g., 50.00)
 */
export function centsToRinggit(cents) {
  return (parseInt(cents) || 0) / 100;
}

/**
 * Format cents as ringgit string with RM prefix
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted string (e.g., "RM 50.00")
 */
export function formatCentsAsRinggit(cents) {
  const ringgit = centsToRinggit(cents);
  return `RM ${ringgit.toFixed(2)}`;
}

/**
 * Format ringgit as display string
 * @param {number} ringgit - Amount in ringgit
 * @returns {string} Formatted string (e.g., "RM 50.00")
 */
export function formatRinggit(ringgit) {
  const amount = parseFloat(ringgit) || 0;
  return `RM ${amount.toFixed(2)}`;
}

/**
 * Validate decimal input for money
 * @param {string} value - Input value
 * @returns {boolean} True if valid money format
 */
export function isValidMoneyInput(value) {
  // Allow empty, numbers, and up to 2 decimal places
  return /^\d*\.?\d{0,2}$/.test(value);
}
