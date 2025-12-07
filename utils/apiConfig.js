/**
 * API Configuration
 * Determines base URL for API calls based on environment
 */

// Production domain
const PRODUCTION_DOMAIN = 'https://app.meowtin.com';

// Deployment configuration
// Set to true to block web access in production and show download page instead
export const BLOCK_WEB_IN_PRODUCTION = false;

// Detect if we're in development (web) or production
function isDevelopment() {
  // Check if __DEV__ is available (React Native/Expo)
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__;
  }

  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost');
  }

  // Default to production if we can't determine
  return false;
}

// Determine API base URL
export function getApiBaseUrl() {
  if (isDevelopment()) {
    // In development, use localhost with the port Expo is running on
    // Default Expo web port is 8081, but we'll try to detect it
    if (typeof window !== 'undefined' && window.location.origin) {
      return `${window.location.origin}/assets/api`;
    }
    return 'http://localhost:8081/assets/api';
  }

  // Production: use the production domain
  return `${PRODUCTION_DOMAIN}/assets/api`;
}

/**
 * Get the full URL for a trecena data file
 * @param {string} trecenaKey - Normalized trecena key (e.g., "toj", "aqabal")
 * @returns {string} Full URL to data.json
 */
export function getTrecenaDataUrl(trecenaKey) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/trecena-${trecenaKey}/data.json`;
}

/**
 * Get the full URL for an image
 * @param {string} trecenaKey - Normalized trecena key (e.g., "toj", "aqabal")
 * @param {number} day - Day number (1-13)
 * @param {string} imageType - Image type (e.g., "horoscope", "affirmation")
 * @returns {string} Full URL to image
 */
export function getImageUrl(trecenaKey, day, imageType) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/trecena-${trecenaKey}/${day}/${imageType}.webp`;
}

/**
 * Check if we're in production environment
 * @returns {boolean}
 */
export function isProduction() {
  return !isDevelopment();
}
