/**
 * Utility to get the current date from device time
 * Always returns the current device time (no caching)
 */

/**
 * Get the current date from device time
 * @returns {Promise<Date>} Current date
 */
export async function getActualDate() {
  return new Date();
}

/**
 * Get the current date synchronously from device time
 * @returns {Date} Current date
 */
export function getActualDateSync() {
  return new Date();
}
