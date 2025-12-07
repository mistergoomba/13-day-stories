/**
 * Image loader utility
 * Returns require() statements for local images
 * Since React Native doesn't support dynamic requires, we use a mapping
 */

// Image mapping for available trecenas and days
// Format: trecena-day-imageType
const IMAGE_MAP = {
  // Trecena Toj
  'toj-1-horoscope': require('../assets/trecena-toj/1/horoscope.webp'),
  'toj-1-affirmation': require('../assets/trecena-toj/1/affirmation.webp'),
  'toj-1-meditation': require('../assets/trecena-toj/1/meditation.webp'),
  'toj-1-birthday': require('../assets/trecena-toj/1/birthday.webp'),
  'toj-1-story_primary': require('../assets/trecena-toj/1/story_primary.webp'),
  'toj-1-story_wide_1': require('../assets/trecena-toj/1/story_wide_1.webp'),
  'toj-1-story_wide_2': require('../assets/trecena-toj/1/story_wide_2.webp'),
  
  'toj-6-horoscope': require('../assets/trecena-toj/6/horoscope.webp'),
  'toj-6-affirmation': require('../assets/trecena-toj/6/affirmation.webp'),
  'toj-6-meditation': require('../assets/trecena-toj/6/meditation.webp'),
  'toj-6-birthday': require('../assets/trecena-toj/6/birthday.webp'),
  'toj-6-story_primary': require('../assets/trecena-toj/6/story_primary.webp'),
  'toj-6-story_wide_1': require('../assets/trecena-toj/6/story_wide_1.webp'),
  'toj-6-story_wide_2': require('../assets/trecena-toj/6/story_wide_2.webp'),
  
  'toj-7-horoscope': require('../assets/trecena-toj/7/horoscope.webp'),
  'toj-7-affirmation': require('../assets/trecena-toj/7/affirmation.webp'),
  'toj-7-meditation': require('../assets/trecena-toj/7/meditation.webp'),
  'toj-7-birthday': require('../assets/trecena-toj/7/birthday.webp'),
  'toj-7-story_primary': require('../assets/trecena-toj/7/story_primary.webp'),
  'toj-7-story_wide_1': require('../assets/trecena-toj/7/story_wide_1.webp'),
  'toj-7-story_wide_2': require('../assets/trecena-toj/7/story_wide_2.webp'),
  
  'toj-8-horoscope': require('../assets/trecena-toj/8/horoscope.webp'),
  'toj-8-affirmation': require('../assets/trecena-toj/8/affirmation.webp'),
  'toj-8-meditation': require('../assets/trecena-toj/8/meditation.webp'),
  'toj-8-birthday': require('../assets/trecena-toj/8/birthday.webp'),
  'toj-8-story_primary': require('../assets/trecena-toj/8/story_primary.webp'),
  'toj-8-story_wide_1': require('../assets/trecena-toj/8/story_wide_1.webp'),
  'toj-8-story_wide_2': require('../assets/trecena-toj/8/story_wide_2.webp'),
  
  'toj-9-horoscope': require('../assets/trecena-toj/9/horoscope.webp'),
  'toj-9-affirmation': require('../assets/trecena-toj/9/affirmation.webp'),
  'toj-9-meditation': require('../assets/trecena-toj/9/meditation.webp'),
  'toj-9-birthday': require('../assets/trecena-toj/9/birthday.webp'),
  'toj-9-story_primary': require('../assets/trecena-toj/9/story_primary.webp'),
  'toj-9-story_wide_1': require('../assets/trecena-toj/9/story_wide_1.webp'),
  'toj-9-story_wide_2': require('../assets/trecena-toj/9/story_wide_2.webp'),
  
  'toj-10-horoscope': require('../assets/trecena-toj/10/horoscope.webp'),
  'toj-10-affirmation': require('../assets/trecena-toj/10/affirmation.webp'),
  'toj-10-meditation': require('../assets/trecena-toj/10/meditation.webp'),
  'toj-10-birthday': require('../assets/trecena-toj/10/birthday.webp'),
  'toj-10-story_primary': require('../assets/trecena-toj/10/story_primary.webp'),
  'toj-10-story_wide_1': require('../assets/trecena-toj/10/story_wide_1.webp'),
  'toj-10-story_wide_2': require('../assets/trecena-toj/10/story_wide_2.webp'),
  
  'toj-11-horoscope': require('../assets/trecena-toj/11/horoscope.webp'),
  'toj-11-affirmation': require('../assets/trecena-toj/11/affirmation.webp'),
  'toj-11-meditation': require('../assets/trecena-toj/11/meditation.webp'),
  'toj-11-birthday': require('../assets/trecena-toj/11/birthday.webp'),
  'toj-11-story_primary': require('../assets/trecena-toj/11/story_primary.webp'),
  'toj-11-story_wide_1': require('../assets/trecena-toj/11/story_wide_1.webp'),
  'toj-11-story_wide_2': require('../assets/trecena-toj/11/story_wide_2.webp'),
  
  'toj-12-horoscope': require('../assets/trecena-toj/12/horoscope.webp'),
  'toj-12-affirmation': require('../assets/trecena-toj/12/affirmation.webp'),
  'toj-12-meditation': require('../assets/trecena-toj/12/meditation.webp'),
  'toj-12-birthday': require('../assets/trecena-toj/12/birthday.webp'),
  'toj-12-story_primary': require('../assets/trecena-toj/12/story_primary.webp'),
  'toj-12-story_wide_1': require('../assets/trecena-toj/12/story_wide_1.webp'),
  'toj-12-story_wide_2': require('../assets/trecena-toj/12/story_wide_2.webp'),
  
  'toj-13-horoscope': require('../assets/trecena-toj/13/horoscope.webp'),
  'toj-13-affirmation': require('../assets/trecena-toj/13/affirmation.webp'),
  'toj-13-meditation': require('../assets/trecena-toj/13/meditation.webp'),
  'toj-13-birthday': require('../assets/trecena-toj/13/birthday.webp'),
  'toj-13-story_primary': require('../assets/trecena-toj/13/story_primary.webp'),
  'toj-13-story_wide_1': require('../assets/trecena-toj/13/story_wide_1.webp'),
  'toj-13-story_wide_2': require('../assets/trecena-toj/13/story_wide_2.webp'),

  // Trecena Aqabal
  'aqabal-1-horoscope': require('../assets/trecena-aqabal/1/horoscope.webp'),
  'aqabal-1-affirmation': require('../assets/trecena-aqabal/1/affirmation.webp'),
  'aqabal-1-story_primary': require('../assets/trecena-aqabal/1/story_primary.webp'),
  'aqabal-1-story_wide_1': require('../assets/trecena-aqabal/1/story_wide_1.webp'),
  'aqabal-1-story_wide_2': require('../assets/trecena-aqabal/1/story_wide_2.webp'),
  
  'aqabal-2-horoscope': require('../assets/trecena-aqabal/2/horoscope.webp'),
  'aqabal-2-affirmation': require('../assets/trecena-aqabal/2/affirmation.webp'),
  'aqabal-2-story_primary': require('../assets/trecena-aqabal/2/story_primary.webp'),
  'aqabal-2-story_wide_1': require('../assets/trecena-aqabal/2/story_wide_1.webp'),
  'aqabal-2-story_wide_2': require('../assets/trecena-aqabal/2/story_wide_2.webp'),
  
  'aqabal-3-horoscope': require('../assets/trecena-aqabal/3/horoscope.webp'),
  'aqabal-3-affirmation': require('../assets/trecena-aqabal/3/affirmation.webp'),
  'aqabal-3-story_primary': require('../assets/trecena-aqabal/3/story_primary.webp'),
  'aqabal-3-story_wide_1': require('../assets/trecena-aqabal/3/story_wide_1.webp'),
  'aqabal-3-story_wide_2': require('../assets/trecena-aqabal/3/story_wide_2.webp'),
  
  'aqabal-4-horoscope': require('../assets/trecena-aqabal/4/horoscope.webp'),
  'aqabal-4-affirmation': require('../assets/trecena-aqabal/4/affirmation.webp'),
  'aqabal-4-story_primary': require('../assets/trecena-aqabal/4/story_primary.webp'),
  'aqabal-4-story_wide_1': require('../assets/trecena-aqabal/4/story_wide_1.webp'),
  'aqabal-4-story_wide_2': require('../assets/trecena-aqabal/4/story_wide_2.webp'),
  
  'aqabal-5-horoscope': require('../assets/trecena-aqabal/5/horoscope.webp'),
  'aqabal-5-affirmation': require('../assets/trecena-aqabal/5/affirmation.webp'),
  'aqabal-5-story_primary': require('../assets/trecena-aqabal/5/story_primary.webp'),
  'aqabal-5-story_wide_1': require('../assets/trecena-aqabal/5/story_wide_1.webp'),
  'aqabal-5-story_wide_2': require('../assets/trecena-aqabal/5/story_wide_2.webp'),
  
  'aqabal-6-horoscope': require('../assets/trecena-aqabal/6/horoscope.webp'),
  'aqabal-6-affirmation': require('../assets/trecena-aqabal/6/affirmation.webp'),
  'aqabal-6-story_primary': require('../assets/trecena-aqabal/6/story_primary.webp'),
  'aqabal-6-story_wide_1': require('../assets/trecena-aqabal/6/story_wide_1.webp'),
  'aqabal-6-story_wide_2': require('../assets/trecena-aqabal/6/story_wide_2.webp'),
  
  'aqabal-7-horoscope': require('../assets/trecena-aqabal/7/horoscope.webp'),
  'aqabal-7-affirmation': require('../assets/trecena-aqabal/7/affirmation.webp'),
  'aqabal-7-story_primary': require('../assets/trecena-aqabal/7/story_primary.webp'),
  'aqabal-7-story_wide_1': require('../assets/trecena-aqabal/7/story_wide_1.webp'),
  'aqabal-7-story_wide_2': require('../assets/trecena-aqabal/7/story_wide_2.webp'),
  
  'aqabal-8-horoscope': require('../assets/trecena-aqabal/8/horoscope.webp'),
  'aqabal-8-affirmation': require('../assets/trecena-aqabal/8/affirmation.webp'),
  'aqabal-8-meditation': require('../assets/trecena-aqabal/8/meditation.webp'),
  'aqabal-8-story_primary': require('../assets/trecena-aqabal/8/story_primary.webp'),
  'aqabal-8-story_wide_1': require('../assets/trecena-aqabal/8/story_wide_1.webp'),
  'aqabal-8-story_wide_2': require('../assets/trecena-aqabal/8/story_wide_2.webp'),
};

// Fallback images
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
 * Get image source for a specific trecena, day, and image type
 * @param {string} trecenaKey - Normalized trecena key (e.g., "toj", "aqabal")
 * @param {number} tone - Tone number (1-13)
 * @param {string} imageType - Image type
 * @returns {Object|null} Image source (require() result) or null if not found
 */
export function getImageSource(trecenaKey, tone, imageType) {
  const key = `${trecenaKey}-${tone}-${imageType}`;
  const image = IMAGE_MAP[key];
  
  if (image) {
    return image;
  }
  
  // Return fallback if available
  if (FALLBACK_IMAGES[imageType]) {
    return FALLBACK_IMAGES[imageType];
  }
  
  return null;
}

