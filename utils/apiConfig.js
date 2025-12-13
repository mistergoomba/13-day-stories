/**
 * API Configuration
 * Always uses CDN domain for assets (web app support removed)
 */

// CDN domain for assets
const CDN_DOMAIN = 'https://cdn.13daystories.com';

// Determine API base URL
// Always uses CDN domain (web app support removed)
export function getApiBaseUrl() {
  return CDN_DOMAIN;
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

