// Import all trecenas - React Native requires static imports
import { aqabalTrecena } from '../data/trecena-aqabal';
import { imoxTrecena } from '../data/trecena-imox';
import { iqTrecena } from '../data/trecena-iq';
import { katTrecena } from '../data/trecena-kat';
import { tojTrecena } from '../data/trecena-toj';
import { tzikinTrecena } from '../data/trecena-tzikin';

// Trecena mapping - maps CURRENT_TRECENA to the imported trecena object
const TRECENA_MAP = {
  aqabal: aqabalTrecena,
  imox: imoxTrecena,
  iq: iqTrecena,
  kat: katTrecena,
  toj: tojTrecena,
  tzikin: tzikinTrecena,
};

// Hardcoded for now: Today is 11/13/2024 = Day 13, Number 13 in Toj trecena
// This will be replaced with real Mayan calendar calculation later
export const TODAY_DAY = 13;
const TODAY_TRECENA = 'Toj';
const CURRENT_TRECENA = 'toj';

// Get the current trecena based on CURRENT_TRECENA
function getCurrentTrecena() {
  const trecena = TRECENA_MAP[CURRENT_TRECENA];
  if (!trecena) {
    console.warn(`Trecena '${CURRENT_TRECENA}' not found, falling back to 'toj'`);
    return TRECENA_MAP.toj;
  }
  return trecena;
}

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
  const currentTrecena = getCurrentTrecena();
  const day = currentTrecena.days.find((d) => d.day === dayNumber);
  return day || null;
}

// Fallback images - used when a specific image is not found
const FALLBACK_IMAGES = {
  story_primary: require('../assets/fallback-images/story_primary.png'),
  story_wide_1: require('../assets/fallback-images/story_wide_1.png'),
  story_wide_2: require('../assets/fallback-images/story_wide_2.png'),
  horoscope: require('../assets/fallback-images/horoscope.png'),
  affirmation: require('../assets/fallback-images/affirmation.png'),
  birthday: require('../assets/fallback-images/birthday.png'),
  meditation: require('../assets/fallback-images/affirmation.png'), // Using affirmation as fallback for meditation
};

// Image mapping - React Native requires static require() paths
// Currently set to trecena-toj for testing
// TODO: Make this dynamic based on CURRENT_TRECENA when React Native supports dynamic requires
// This can be easily switched to remote URLs later by changing the return value in getImageSource()
const IMAGE_MAP = {
  // Day 1 images
  1: {
    story_primary: require('../assets/trecena-toj/1/story_primary.webp'),
    story_wide_1: require('../assets/trecena-toj/1/story_wide_1.webp'),
    story_wide_2: require('../assets/trecena-toj/1/story_wide_2.webp'),
    horoscope: require('../assets/trecena-toj/1/horoscope.webp'),
    affirmation: require('../assets/trecena-toj/1/affirmation.webp'),
    birthday: require('../assets/trecena-toj/1/birthday.webp'),
    meditation: require('../assets/trecena-toj/1/meditation.webp'),
  },
  5: {
    story_primary: require('../assets/trecena-toj/5/story_primary.webp'),
    story_wide_1: require('../assets/trecena-toj/5/story_wide_1.webp'),
    story_wide_2: require('../assets/trecena-toj/5/story_wide_2.webp'),
    horoscope: require('../assets/trecena-toj/5/horoscope.webp'),
    affirmation: require('../assets/trecena-toj/5/affirmation.webp'),
    birthday: require('../assets/trecena-toj/5/birthday.webp'),
    meditation: require('../assets/trecena-toj/5/meditation.webp'),
  },
  6: {
    story_primary: require('../assets/trecena-toj/6/story_primary.webp'),
    story_wide_1: require('../assets/trecena-toj/6/story_wide_1.webp'),
    story_wide_2: require('../assets/trecena-toj/6/story_wide_2.webp'),
    horoscope: require('../assets/trecena-toj/6/horoscope.webp'),
    affirmation: require('../assets/trecena-toj/6/affirmation.webp'),
    birthday: require('../assets/trecena-toj/6/birthday.webp'),
    meditation: require('../assets/trecena-toj/6/meditation.webp'),
  },
  7: {
    story_primary: require('../assets/trecena-toj/7/story_primary.webp'),
    story_wide_1: require('../assets/trecena-toj/7/story_wide_1.webp'),
    story_wide_2: require('../assets/trecena-toj/7/story_wide_2.webp'),
    horoscope: require('../assets/trecena-toj/7/horoscope.webp'),
    affirmation: require('../assets/trecena-toj/7/affirmation.webp'),
    birthday: require('../assets/trecena-toj/7/birthday.webp'),
    meditation: require('../assets/trecena-toj/7/meditation.webp'),
  },
  8: {
    story_primary: require('../assets/trecena-toj/8/story_primary.webp'),
    story_wide_1: require('../assets/trecena-toj/8/story_wide_1.webp'),
    story_wide_2: require('../assets/trecena-toj/8/story_wide_2.webp'),
    horoscope: require('../assets/trecena-toj/8/horoscope.webp'),
    affirmation: require('../assets/trecena-toj/8/affirmation.webp'),
    birthday: require('../assets/trecena-toj/8/birthday.webp'),
    meditation: require('../assets/trecena-toj/8/meditation.webp'),
  },
  9: {
    story_primary: require('../assets/trecena-toj/9/story_primary.webp'),
    story_wide_1: require('../assets/trecena-toj/9/story_wide_1.webp'),
    story_wide_2: require('../assets/trecena-toj/9/story_wide_2.webp'),
    horoscope: require('../assets/trecena-toj/9/horoscope.webp'),
    affirmation: require('../assets/trecena-toj/9/affirmation.webp'),
    birthday: require('../assets/trecena-toj/9/birthday.webp'),
    meditation: require('../assets/trecena-toj/9/meditation.webp'),
  },
  10: {
    story_primary: require('../assets/trecena-toj/10/story_primary.webp'),
    story_wide_1: require('../assets/trecena-toj/10/story_wide_1.webp'),
    story_wide_2: require('../assets/trecena-toj/10/story_wide_2.webp'),
    horoscope: require('../assets/trecena-toj/10/horoscope.webp'),
    affirmation: require('../assets/trecena-toj/10/affirmation.webp'),
    birthday: require('../assets/trecena-toj/10/birthday.webp'),
    meditation: require('../assets/trecena-toj/10/meditation.webp'),
  },
  11: {
    story_primary: require('../assets/trecena-toj/11/story_primary.webp'),
    story_wide_1: require('../assets/trecena-toj/11/story_wide_1.webp'),
    story_wide_2: require('../assets/trecena-toj/11/story_wide_2.webp'),
    horoscope: require('../assets/trecena-toj/11/horoscope.webp'),
    affirmation: require('../assets/trecena-toj/11/affirmation.webp'),
    birthday: require('../assets/trecena-toj/11/birthday.webp'),
    meditation: require('../assets/trecena-toj/11/meditation.webp'),
  },
  // Day 12 images
  12: {
    story_primary: require('../assets/trecena-toj/12/story_primary.webp'),
    story_wide_1: require('../assets/trecena-toj/12/story_wide_1.webp'),
    story_wide_2: require('../assets/trecena-toj/12/story_wide_2.webp'),
    horoscope: require('../assets/trecena-toj/12/horoscope.webp'),
    affirmation: require('../assets/trecena-toj/12/affirmation.webp'),
    birthday: require('../assets/trecena-toj/12/birthday.webp'),
    meditation: require('../assets/trecena-toj/12/meditation.webp'),
  },
  // Day 13 images
  13: {
    story_primary: require('../assets/trecena-toj/13/story_primary.webp'),
    story_wide_1: require('../assets/trecena-toj/13/story_wide_1.webp'),
    story_wide_2: require('../assets/trecena-toj/13/story_wide_2.webp'),
    horoscope: require('../assets/trecena-toj/13/horoscope.webp'),
    affirmation: require('../assets/trecena-toj/13/affirmation.webp'),
    birthday: require('../assets/trecena-toj/13/birthday.webp'),
    meditation: require('../assets/trecena-toj/13/meditation.webp'),
  },
};

/**
 * Get image source for a specific day and image type
 * Returns format compatible with both local require() and remote URLs
 * @param {number} dayNumber - Day number (1-13)
 * @param {string} imageType - Type: 'story_primary', 'story_wide_1', 'story_wide_2', 'horoscope', 'affirmation', 'meditation', 'birthday'
 * @returns {Object} Image source object { uri: ... } or require() result, or fallback if not found
 *
 * Note: To switch to remote URLs later, change this function to return:
 * { uri: `https://your-domain.com/images/trecena-${CURRENT_TRECENA}/${dayNumber}/${imageType}.png` }
 */
export function getImageSource(dayNumber, imageType) {
  const dayImages = IMAGE_MAP[dayNumber];
  if (!dayImages) {
    console.warn(`No images found for day ${dayNumber}, using fallback`);
    return FALLBACK_IMAGES[imageType] || FALLBACK_IMAGES.story_primary;
  }

  const image = dayImages[imageType];
  if (!image) {
    console.warn(`Image type ${imageType} not found for day ${dayNumber}, using fallback`);
    return FALLBACK_IMAGES[imageType] || FALLBACK_IMAGES.story_primary;
  }

  return image;
}

/**
 * Get full trecena data
 * @returns {Object} Full current trecena object based on CURRENT_TRECENA
 */
export function getTrecenaData() {
  return getCurrentTrecena();
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
  const currentTrecena = getCurrentTrecena();
  return [...currentTrecena.days].sort((a, b) => a.day - b.day);
}
