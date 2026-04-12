/**
 * Normalize trecena name to database key format
 * Strips all non-letter characters and converts to lowercase
 * This ensures consistency across all database scripts
 * 
 * Examples:
 *   "Q'anil" -> "qanil"
 *   "Aq'ab'al" -> "aqabal"
 *   "Tz'ikin" -> "tzikin"
 * 
 * @param {string} trecenaName - Trecena name (e.g., "Q'anil", "Aq'ab'al")
 * @returns {string|null} Normalized key or null if input is invalid
 */
function normalizeTrecenaName(trecenaName) {
  if (!trecenaName) return null;
  return trecenaName.replace(/[^a-zA-Z]/g, '').toLowerCase();
}

module.exports = {
  normalizeTrecenaName,
};
