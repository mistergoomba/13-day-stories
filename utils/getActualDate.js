/**
 * Utility to get the current date from device time
 * In dev mode, can be overridden with a dev date override
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const DEV_DATE_OVERRIDE_KEY = '@dev_date_override';
const DEV_MAYAN_OVERRIDE_KEY = '@dev_mayan_override'; // Stores {tone: 1-13, nawal: string}

// Check if we're in dev mode (web dev server)
const isDevMode = () => {
  return typeof __DEV__ !== 'undefined' && __DEV__;
};

/**
 * Get the current date from device time
 * In dev mode, returns override date if set, otherwise device date
 * @returns {Promise<Date>} Current date
 */
export async function getActualDate() {
  if (isDevMode()) {
    try {
      const overrideDate = await AsyncStorage.getItem(DEV_DATE_OVERRIDE_KEY);
      if (overrideDate) {
        // Parse YYYY-MM-DD format and return as Date
        const parts = overrideDate.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const day = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      }
    } catch (error) {
      console.error('Error reading dev date override:', error);
    }
  }
  return new Date();
}

/**
 * Get the current date synchronously from device time
 * In dev mode, returns override date if set, otherwise device date
 * Note: This is synchronous, so it reads from a cached value or device time
 * @returns {Date} Current date
 */
export function getActualDateSync() {
  if (isDevMode()) {
    try {
      // For sync version, we need to read synchronously
      // Since AsyncStorage is async, we'll use a module-level cache
      // that gets updated when the override changes
      if (global.__devDateOverride) {
        const parts = global.__devDateOverride.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const day = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      }
    } catch (error) {
      console.error('Error reading dev date override (sync):', error);
    }
  }
  return new Date();
}

/**
 * Set the dev date override (dev mode only)
 * @param {string|null} dateString - Date in YYYY-MM-DD format, or null to clear
 */
export async function setDevDateOverride(dateString) {
  if (!isDevMode()) {
    return;
  }
  try {
    if (dateString) {
      await AsyncStorage.setItem(DEV_DATE_OVERRIDE_KEY, dateString);
      global.__devDateOverride = dateString;
    } else {
      await AsyncStorage.removeItem(DEV_DATE_OVERRIDE_KEY);
      global.__devDateOverride = null;
    }
  } catch (error) {
    console.error('Error setting dev date override:', error);
  }
}

/**
 * Get the dev date override (dev mode only)
 * @returns {Promise<string|null>} Date in YYYY-MM-DD format, or null
 */
export async function getDevDateOverride() {
  if (!isDevMode()) {
    return null;
  }
  try {
    const override = await AsyncStorage.getItem(DEV_DATE_OVERRIDE_KEY);
    if (override) {
      global.__devDateOverride = override;
    }
    return override;
  } catch (error) {
    console.error('Error getting dev date override:', error);
    return null;
  }
}

/**
 * Set the dev Mayan override (tone and nawal) - dev mode only
 * @param {Object|null} mayanOverride - {tone: 1-13, nawal: string} or null to clear
 */
export async function setDevMayanOverride(mayanOverride) {
  if (!isDevMode()) {
    return;
  }
  try {
    if (mayanOverride && mayanOverride.tone && mayanOverride.nawal) {
      const overrideString = JSON.stringify(mayanOverride);
      await AsyncStorage.setItem(DEV_MAYAN_OVERRIDE_KEY, overrideString);
      global.__devMayanOverride = mayanOverride;
    } else {
      await AsyncStorage.removeItem(DEV_MAYAN_OVERRIDE_KEY);
      global.__devMayanOverride = null;
    }
  } catch (error) {
    console.error('Error setting dev Mayan override:', error);
  }
}

/**
 * Get the dev Mayan override (dev mode only)
 * @returns {Promise<Object|null>} {tone: 1-13, nawal: string} or null
 */
export async function getDevMayanOverride() {
  if (!isDevMode()) {
    return null;
  }
  try {
    const overrideString = await AsyncStorage.getItem(DEV_MAYAN_OVERRIDE_KEY);
    if (overrideString) {
      const override = JSON.parse(overrideString);
      global.__devMayanOverride = override;
      return override;
    }
    return null;
  } catch (error) {
    console.error('Error getting dev Mayan override:', error);
    return null;
  }
}

/**
 * Get the dev Mayan override synchronously (dev mode only)
 * @returns {Object|null} {tone: 1-13, nawal: string} or null
 */
export function getDevMayanOverrideSync() {
  if (!isDevMode()) {
    return null;
  }
  return global.__devMayanOverride || null;
}
