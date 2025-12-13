/**
 * Image loader utility
 * Returns fallback images (local) for when remote images fail
 * Main images are now loaded via remote URLs from the API
 * 
 * NOTE: Fallback images are currently unused since getImageUrl() always returns a URL.
 * Keeping this function for API compatibility, but not bundling the images to reduce size.
 */

/**
 * Get fallback image source for a specific image type
 * Used when remote images fail to load
 * @param {string} _trecenaKey - Unused (kept for API compatibility)
 * @param {number} _tone - Unused (kept for API compatibility)
 * @param {string} _imageType - Image type
 * @returns {Object|null} Always returns null (fallback images removed to reduce bundle size)
 */
export function getImageSource(_trecenaKey, _tone, _imageType) {
  // Fallback images removed - they were never used since getImageUrl() always returns a URL
  // This reduces bundle size by ~500KB
  return null;
}

