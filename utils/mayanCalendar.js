import { aqabalTrecena } from '../data/trecena-aqabal';

// Hardcoded for now: Today is 11/13/2024 = Day 8, Tz'i', Number 8 in Aq'ab'al trecena
// This will be replaced with real Mayan calendar calculation later
const TODAY_DAY = 8;
const TODAY_TRECENA = "Aq'ab'al";

/**
 * Get today's Mayan calendar date information
 * @returns {Object} Today's Mayan date data
 */
export function getTodayMayanDate() {
  const dayData = getDayData(TODAY_DAY);
  return {
    trecena: TODAY_TRECENA,
    day: TODAY_DAY,
    nawal: dayData.nawal,
    number: dayData.number,
    gregorianDate: new Date('2024-11-13'), // 11/13/2024
  };
}

/**
 * Get full day data for a specific day number
 * @param {number} dayNumber - Day number (1-13)
 * @returns {Object|null} Day data object or null if not found
 */
export function getDayData(dayNumber) {
  const day = aqabalTrecena.days.find((d) => d.day === dayNumber);
  return day || null;
}

// Image mapping - React Native requires static require() paths
// Add more days as images become available
// This can be easily switched to remote URLs later by changing the return value in getImageSource()
const IMAGE_MAP = {
  // Day 1 images
  1: {
    story_primary: require('../assets/trecena-aqabal/1/story_primary.png'),
    story_wide_1: require('../assets/trecena-aqabal/1/story_wide_1.png'),
    story_wide_2: require('../assets/trecena-aqabal/1/story_wide_2.png'),
    horoscope: require('../assets/trecena-aqabal/1/horoscope.png'),
    affirmation: require('../assets/trecena-aqabal/1/affirmation.png'),
  },
  // Day 2 images
  2: {
    story_primary: require('../assets/trecena-aqabal/2/story_primary.png'),
    story_wide_1: require('../assets/trecena-aqabal/2/story_wide_1.png'),
    story_wide_2: require('../assets/trecena-aqabal/2/story_wide_2.png'),
    horoscope: require('../assets/trecena-aqabal/2/horoscope.png'),
    affirmation: require('../assets/trecena-aqabal/2/affirmation.png'),
  },
  // Day 3 images
  3: {
    story_primary: require('../assets/trecena-aqabal/3/story_primary.png'),
    story_wide_1: require('../assets/trecena-aqabal/3/story_wide_1.png'),
    story_wide_2: require('../assets/trecena-aqabal/3/story_wide_2.png'),
    horoscope: require('../assets/trecena-aqabal/3/horoscope.png'),
    affirmation: require('../assets/trecena-aqabal/3/affirmation.png'),
  },
  // Day 4 images
  4: {
    story_primary: require('../assets/trecena-aqabal/4/story_primary.png'),
    story_wide_1: require('../assets/trecena-aqabal/4/story_wide_1.png'),
    story_wide_2: require('../assets/trecena-aqabal/4/story_wide_2.png'),
    horoscope: require('../assets/trecena-aqabal/4/horoscope.png'),
    affirmation: require('../assets/trecena-aqabal/4/affirmation.png'),
  },
  // Day 5 images
  5: {
    story_primary: require('../assets/trecena-aqabal/5/story_primary.png'),
    story_wide_1: require('../assets/trecena-aqabal/5/story_wide_1.png'),
    story_wide_2: require('../assets/trecena-aqabal/5/story_wide_2.png'),
    horoscope: require('../assets/trecena-aqabal/5/horoscope.png'),
    affirmation: require('../assets/trecena-aqabal/5/affirmation.png'),
  },
  // Day 6 images
  6: {
    story_primary: require('../assets/trecena-aqabal/6/story_primary.png'),
    story_wide_1: require('../assets/trecena-aqabal/6/story_wide_1.png'),
    story_wide_2: require('../assets/trecena-aqabal/6/story_wide_2.png'),
    horoscope: require('../assets/trecena-aqabal/6/horoscope.png'),
    affirmation: require('../assets/trecena-aqabal/6/affirmation.png'),
  },
  // Day 7 images
  7: {
    story_primary: require('../assets/trecena-aqabal/7/story_primary.png'),
    story_wide_1: require('../assets/trecena-aqabal/7/story_wide_1.png'),
    story_wide_2: require('../assets/trecena-aqabal/7/story_wide_2.png'),
    horoscope: require('../assets/trecena-aqabal/7/horoscope.png'),
    affirmation: require('../assets/trecena-aqabal/7/affirmation.png'),
  },
  // Day 8 images
  8: {
    story_primary: require('../assets/trecena-aqabal/8/story_primary.png'),
    story_wide_1: require('../assets/trecena-aqabal/8/story_wide_1.png'),
    story_wide_2: require('../assets/trecena-aqabal/8/story_wide_2.png'),
    horoscope: require('../assets/trecena-aqabal/8/horoscope.png'),
    affirmation: require('../assets/trecena-aqabal/8/affirmation.png'),
    meditation: require('../assets/trecena-aqabal/8/meditation.png'),
  },
  // Add other days (9-13) here as images become available
};

/**
 * Get image source for a specific day and image type
 * Returns format compatible with both local require() and remote URLs
 * @param {number} dayNumber - Day number (1-13)
 * @param {string} imageType - Type: 'story_primary', 'story_wide_1', 'story_wide_2', 'horoscope', 'affirmation', 'meditation'
 * @returns {Object} Image source object { uri: ... } or require() result
 *
 * Note: To switch to remote URLs later, change this function to return:
 * { uri: `https://your-domain.com/images/trecena-aqabal/${dayNumber}/${imageType}.png` }
 */
export function getImageSource(dayNumber, imageType) {
  const dayImages = IMAGE_MAP[dayNumber];
  if (!dayImages) {
    console.warn(`No images found for day ${dayNumber}`);
    return null;
  }

  const image = dayImages[imageType];
  if (!image) {
    console.warn(`Image type ${imageType} not found for day ${dayNumber}`);
    return null;
  }

  return image;
}

/**
 * Get full trecena data
 * @returns {Object} Full aqabalTrecena object
 */
export function getTrecenaData() {
  return aqabalTrecena;
}

/**
 * Check if a day is available (not in the future)
 * @param {number} dayNumber - Day number to check
 * @returns {boolean} True if day is available (dayNumber <= today)
 */
export function isDayAvailable(dayNumber) {
  return dayNumber <= TODAY_DAY;
}

/**
 * Get all days in the current trecena
 * @returns {Array} Array of day objects sorted by day number
 */
export function getAllDays() {
  return [...aqabalTrecena.days].sort((a, b) => a.day - b.day);
}
