/**
 * Image loader utility
 * Returns fallback images (local) for when remote images fail
 * Main images are now loaded via remote URLs from the API
 */

// Fallback images (always local)
const FALLBACK_IMAGES = {
  story_primary: require('../assets/fallback-images/story_primary.png'),
  story_wide_1: require('../assets/fallback-images/story_wide_1.png'),
  story_wide_2: require('../assets/fallback-images/story_wide_2.png'),
  horoscope: require('../assets/fallback-images/horoscope.png'),
  affirmation: require('../assets/fallback-images/affirmation.png'),
  birthday: require('../assets/fallback-images/birthday.png'),
  meditation: require('../assets/fallback-images/affirmation.png'),
};

/**
 * Get fallback image source for a specific image type
 * Used when remote images fail to load
 * @param {string} imageType - Image type
 * @returns {Object|null} Image source (require() result) or null if not found
 */
export function getImageSource(trecenaKey, tone, imageType) {
  // Return fallback if available
  if (FALLBACK_IMAGES[imageType]) {
    return FALLBACK_IMAGES[imageType];
  }
  
  return null;
}

