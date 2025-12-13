/**
 * Simplified Calendar Utilities
 * Single source of truth for all Mayan calendar date and data operations
 * Also handles all URL generation for data and images
 */

import { convertToMayan } from './dateToMayan';
import { getActualDate, getActualDateSync, getDevMayanOverrideSync } from './getActualDate';
import { getImageSource } from './imageLoader';
import { getCachedImagePath, downloadAndCacheImage } from './imageCache';

// CDN domain for assets
const CDN_DOMAIN = 'https://cdn.13daystories.com';

// Cache for trecena data with expiration (1 hour)
// Structure: Map<key, { data: Object, timestamp: number }>
const trecenaCache = new Map();

// Track ongoing fetch requests to avoid duplicate requests
const fetchPromises = new Map();

// Cache expiration: 1 hour in milliseconds
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Get API base URL (CDN domain)
 * @returns {string} CDN domain URL
 */
export function getApiBaseUrl() {
  return CDN_DOMAIN;
}

/**
 * Normalize trecena name to match TRECENA_MAP key
 * @param {string} trecenaName - Trecena name (e.g., "Q'anil", "Aq'ab'al")
 * @returns {string} Normalized key
 */
export function normalizeTrecenaName(trecenaName) {
  if (!trecenaName) return null;
  return trecenaName.replace(/[^a-zA-Z]/g, '').toLowerCase();
}

/**
 * Get the full URL for a trecena data file
 * @param {string} trecenaKey - Normalized trecena key (e.g., "toj", "aqabal")
 * @returns {string} Full URL to data.json
 */
function getTrecenaDataUrl(trecenaKey) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/trecena-${trecenaKey}/data.json`;
}

/**
 * Get the full URL for an image (webp format)
 * @param {string} trecenaKey - Normalized trecena key (e.g., "toj", "aqabal")
 * @param {number} day - Day number (1-13)
 * @param {string} imageType - Image type (e.g., "horoscope", "affirmation")
 * @returns {string} Full URL to image
 */
function getImageUrl(trecenaKey, day, imageType) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/trecena-${trecenaKey}/${day}/${imageType}.webp`;
}

/**
 * Get the full URL for a share image (jpg format)
 * @param {string} trecenaKey - Normalized trecena key (e.g., "toj", "aqabal")
 * @param {number} day - Day number (1-13)
 * @param {string} imageType - Image type (e.g., "horoscope", "affirmation", "story_primary", "birthday")
 * @returns {string} Full URL to share image
 */
export function getShareImageUrl(trecenaKey, day, imageType) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/trecena-${trecenaKey}/${day}/${imageType}.jpg`;
}

/**
 * Get trecena data from API (with 1-hour caching)
 * @param {string} trecenaName - Trecena name
 * @returns {Promise<Object|null>} Trecena data object
 */
export async function getTrecenaData(trecenaName) {
  const normalizedKey = normalizeTrecenaName(trecenaName);
  if (!normalizedKey) return null;

  // Check cache first
  if (trecenaCache.has(normalizedKey)) {
    const cached = trecenaCache.get(normalizedKey);
    const now = Date.now();

    // Check if cache is still valid (within 1 hour)
    if (now - cached.timestamp < CACHE_EXPIRY_MS) {
      return cached.data;
    } else {
      // Cache expired, remove it
      trecenaCache.delete(normalizedKey);
    }
  }

  // Check if there's already a fetch in progress
  if (fetchPromises.has(normalizedKey)) {
    return fetchPromises.get(normalizedKey);
  }

  // Fetch from API
  const fetchPromise = (async () => {
    try {
      const url = getTrecenaDataUrl(normalizedKey);
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch trecena data for ${trecenaName}: ${response.status}`);
        return null;
      }

      const trecenaData = await response.json();

      // Cache it with timestamp
      trecenaCache.set(normalizedKey, {
        data: trecenaData,
        timestamp: Date.now(),
      });

      return trecenaData;
    } catch (error) {
      console.error(`Error fetching trecena data for ${trecenaName}:`, error);
      return null;
    } finally {
      // Remove from fetch promises once done
      fetchPromises.delete(normalizedKey);
    }
  })();

  // Store the promise to avoid duplicate requests
  fetchPromises.set(normalizedKey, fetchPromise);

  return fetchPromise;
}

/**
 * Get image source for a day and image type
 * Returns cached local path if available, otherwise downloads and caches
 * Falls back to remote URL if caching fails, then to local fallback
 * @param {string} trecenaKey - Normalized trecena key (e.g., "toj", "aqabal")
 * @param {number} tone - Tone number (1-13)
 * @param {string} imageType - Image type
 * @returns {Promise<Object|null>} Image source ({ uri: string }) or null if not found
 */
async function getImagePath(trecenaKey, tone, imageType) {
  const imageUrl = getImageUrl(trecenaKey, tone, imageType);
  if (!imageUrl) {
    // Fallback to local images if remote URL fails
    return getImageSource(trecenaKey, tone, imageType);
  }

  try {
    // Try to get cached image first
    const cachedPath = await getCachedImagePath(trecenaKey, tone, imageType);
    if (cachedPath) {
      return { uri: cachedPath };
    }

    // If not cached, download and cache it
    const localPath = await downloadAndCacheImage(imageUrl, trecenaKey, tone, imageType);
    return { uri: localPath };
  } catch (error) {
    console.warn(
      `Failed to cache image ${imageType} for ${trecenaKey}/${tone}, using remote URL:`,
      error
    );
    // Fallback to remote URL if caching fails
    return { uri: imageUrl };
  }
}

/**
 * Convert a date to Mayan date object
 * For string dates (birthdays), uses UTC normalization
 * For Date objects (today/navigation), uses local normalization
 * In dev mode, checks for Mayan override first
 * @param {Date|string} date - Gregorian date (Date object or YYYY-MM-DD string)
 * @returns {Object} Mayan date object with { tone, sign, trecena, formatted }
 */
export function convertDateToMayan(date) {
  // Check for dev Mayan override first (affects all dates including birthdays)
  const mayanOverride = getDevMayanOverrideSync();
  if (mayanOverride && mayanOverride.tone && mayanOverride.nawal) {
    try {
      return createMayanDateFromToneAndNawal(mayanOverride.tone, mayanOverride.nawal);
    } catch (error) {
      console.error('Error creating Mayan date from override:', error);
      // Fall through to date-based calculation
    }
  }

  const isString = typeof date === 'string';
  const useUTC = isString; // Use UTC for strings (birthdays), local for Date objects
  return convertToMayan(date, useUTC);
}

/**
 * Get today's Mayan date
 * Uses device date, converts to Mayan
 * Checks for dev Mayan override first
 * @returns {Object} Mayan date object with { tone, sign, trecena, formatted }
 */
export async function getTodayMayanDate() {
  // Check for dev Mayan override first (tone/nawal override)
  const { getDevMayanOverride } = require('./getActualDate');
  const mayanOverride = await getDevMayanOverride();
  if (mayanOverride && mayanOverride.tone && mayanOverride.nawal) {
    try {
      return createMayanDateFromToneAndNawal(mayanOverride.tone, mayanOverride.nawal);
    } catch (error) {
      console.error('Error creating Mayan date from override:', error);
      // Fall through to date-based calculation
    }
  }

  // Get actual date and convert (use local normalization for today)
  // This will use dev date override if set, otherwise actual device date
  const actualDate = await getActualDate();
  const mayanDate = convertToMayan(actualDate, false);
  return mayanDate;
}

/**
 * Increment a Mayan date by one day
 * @param {number} tone - Current tone (1-13)
 * @param {string} nawal - Current nawal
 * @returns {Object} Next Mayan date object with { tone, sign, trecena, formatted }
 */
export function incrementMayanDate(tone, nawal) {
  const NAWALES = [
    'Imox',
    "Iq'",
    "Aq'ab'al",
    "K'at",
    'Kan',
    'Kame',
    'Kej',
    "Q'anil",
    'Toj',
    "Tz'i'",
    "B'atz'",
    "E'",
    'Aj',
    'Ix',
    "Tz'ikin",
    'Ajmaq',
    "No'j",
    'Tijax',
    'Kawoq',
    'Ajpu',
  ];

  // Increment tone (wraps from 13 to 1)
  const nextTone = (tone % 13) + 1;

  // Increment nawal (wraps from last to first)
  const currentNawalIndex = NAWALES.indexOf(nawal);
  if (currentNawalIndex === -1) {
    throw new Error(`Invalid nawal: ${nawal}`);
  }
  const nextNawalIndex = (currentNawalIndex + 1) % 20;
  const nextNawal = NAWALES[nextNawalIndex];

  // Calculate trecena
  const { getTrecenaFromDate } = require('./dateToMayan');
  const trecena = getTrecenaFromDate({ tone: nextTone, sign: nextNawal });

  return {
    tone: nextTone,
    sign: nextNawal,
    trecena,
    formatted: `${nextTone} ${nextNawal}`,
  };
}

/**
 * Decrement a Mayan date by one day
 * @param {number} tone - Current tone (1-13)
 * @param {string} nawal - Current nawal
 * @returns {Object} Previous Mayan date object with { tone, sign, trecena, formatted }
 */
export function decrementMayanDate(tone, nawal) {
  const NAWALES = [
    'Imox',
    "Iq'",
    "Aq'ab'al",
    "K'at",
    'Kan',
    'Kame',
    'Kej',
    "Q'anil",
    'Toj',
    "Tz'i'",
    "B'atz'",
    "E'",
    'Aj',
    'Ix',
    "Tz'ikin",
    'Ajmaq',
    "No'j",
    'Tijax',
    'Kawoq',
    'Ajpu',
  ];

  // Decrement tone (wraps from 1 to 13)
  const prevTone = ((tone - 2 + 13) % 13) + 1;

  // Decrement nawal (wraps from first to last)
  const currentNawalIndex = NAWALES.indexOf(nawal);
  if (currentNawalIndex === -1) {
    throw new Error(`Invalid nawal: ${nawal}`);
  }
  const prevNawalIndex = (currentNawalIndex - 1 + 20) % 20;
  const prevNawal = NAWALES[prevNawalIndex];

  // Calculate trecena
  const { getTrecenaFromDate } = require('./dateToMayan');
  const trecena = getTrecenaFromDate({ tone: prevTone, sign: prevNawal });

  return {
    tone: prevTone,
    sign: prevNawal,
    trecena,
    formatted: `${prevTone} ${prevNawal}`,
  };
}

/**
 * Create a Mayan date object directly from tone and nawal
 * @param {number} tone - Tone (1-13)
 * @param {string} nawal - Nawal name
 * @returns {Object} Mayan date object with { tone, sign, trecena, formatted }
 */
function createMayanDateFromToneAndNawal(tone, nawal) {
  // Import getTrecenaFromDate from dateToMayan
  const { getTrecenaFromDate } = require('./dateToMayan');
  const NAWALES = [
    'Imox',
    "Iq'",
    "Aq'ab'al",
    "K'at",
    'Kan',
    'Kame',
    'Kej',
    "Q'anil",
    'Toj',
    "Tz'i'",
    "B'atz'",
    "E'",
    'Aj',
    'Ix',
    "Tz'ikin",
    'Ajmaq',
    "No'j",
    'Tijax',
    'Kawoq',
    'Ajpu',
  ];

  // Validate tone
  if (tone < 1 || tone > 13) {
    throw new Error(`Invalid tone: ${tone}. Must be between 1 and 13.`);
  }

  // Validate nawal
  if (!NAWALES.includes(nawal)) {
    throw new Error(`Invalid nawal: ${nawal}. Must be one of: ${NAWALES.join(', ')}`);
  }

  // Calculate trecena
  const trecena = getTrecenaFromDate({ tone, sign: nawal });

  return {
    tone,
    sign: nawal,
    trecena,
    formatted: `${tone} ${nawal}`,
  };
}

/**
 * Get today's Mayan date synchronously (uses device date)
 * Checks for dev Mayan override first, then dev date override, then device date
 * @returns {Object} Mayan date object
 */
export function getTodayMayanDateSync() {
  // Check for dev Mayan override first (tone/nawal override)
  const mayanOverride = getDevMayanOverrideSync();
  if (mayanOverride && mayanOverride.tone && mayanOverride.nawal) {
    try {
      return createMayanDateFromToneAndNawal(mayanOverride.tone, mayanOverride.nawal);
    } catch (error) {
      console.error('Error creating Mayan date from override:', error);
      // Fall through to date-based calculation
    }
  }

  // Use device date (use local normalization for today)
  // This will use dev date override if set, otherwise actual device date
  const deviceDate = getActualDateSync();
  return convertToMayan(deviceDate, false);
}

/**
 * Get day data for a specific Mayan date
 * Loads trecena data (cached), finds day by tone, returns data with image paths
 * @param {Object} mayanDate - Mayan date object with { tone, sign, trecena, formatted }
 * @returns {Promise<Object|null>} Day data object (without image_prompts, with image paths)
 */
export async function getDayData(mayanDate) {
  if (!mayanDate || !mayanDate.tone || !mayanDate.trecena) {
    console.error('Invalid mayanDate object:', mayanDate);
    return null;
  }

  // Get trecena data (cached, async)
  const trecenaData = await getTrecenaData(mayanDate.trecena);
  if (!trecenaData) {
    return null;
  }

  // Find day by tone (number property)
  const dayData = trecenaData.days.find((d) => d.number === mayanDate.tone);
  if (!dayData) {
    console.warn(`Day with tone ${mayanDate.tone} not found in trecena ${mayanDate.trecena}`);
    return null;
  }

  // Get normalized trecena key for image paths
  const trecenaKey = normalizeTrecenaName(mayanDate.trecena);

  // Create day data object with image paths (omit image_prompts)
  const { image_prompts, ...dayDataWithoutPrompts } = dayData;

  // Get image paths (async - cache images, fetch in parallel for better performance)
  const [horoscope, affirmation, meditation, birthday, story_primary, story_wide_1, story_wide_2] =
    await Promise.all([
      getImagePath(trecenaKey, mayanDate.tone, 'horoscope'),
      getImagePath(trecenaKey, mayanDate.tone, 'affirmation'),
      getImagePath(trecenaKey, mayanDate.tone, 'meditation'),
      getImagePath(trecenaKey, mayanDate.tone, 'birthday'),
      getImagePath(trecenaKey, mayanDate.tone, 'story_primary'),
      getImagePath(trecenaKey, mayanDate.tone, 'story_wide_1'),
      getImagePath(trecenaKey, mayanDate.tone, 'story_wide_2'),
    ]);

  const imagePaths = {
    horoscope,
    affirmation,
    meditation,
    birthday,
    story_primary,
    story_wide_1,
    story_wide_2,
  };

  return {
    ...dayDataWithoutPrompts,
    images: imagePaths,
  };
}

/**
 * Get background colors for a specific Mayan date and image type
 * Colors are now included in the trecena data from the API
 * @param {Object} mayanDate - Mayan date object
 * @param {string} imageType - Image type: 'horoscope', 'affirmation', 'story_primary', 'birthday'
 * @returns {Promise<Object>} Object with primary, secondary, and accent colors
 */
export async function getBackgroundColors(mayanDate, imageType = 'horoscope') {
  if (!mayanDate || !mayanDate.trecena || !mayanDate.tone) {
    return {
      primary: '#12091A',
      secondary: '#1C0F29',
      accent: '#6E45CF',
    };
  }

  // Get trecena data to access colors
  const trecenaData = await getTrecenaData(mayanDate.trecena);
  if (!trecenaData) {
    return {
      primary: '#12091A',
      secondary: '#1C0F29',
      accent: '#6E45CF',
    };
  }

  // Find day data
  const dayData = trecenaData.days.find((d) => d.number === mayanDate.tone);
  if (dayData && dayData.colors && dayData.colors[imageType]) {
    return dayData.colors[imageType];
  }

  // Fallback to default colors
  return {
    primary: '#12091A',
    secondary: '#1C0F29',
    accent: '#6E45CF',
  };
}

/**
 * Get previous day in the trecena
 * @param {Object} mayanDate - Current Mayan date object
 * @returns {Promise<Object|null>} Previous Mayan date object, or null if at day 1
 */
export async function getPreviousDay(mayanDate) {
  if (!mayanDate || mayanDate.tone === undefined) return null;

  const trecenaData = await getTrecenaData(mayanDate.trecena);
  if (!trecenaData) return null;

  // Find current day in trecena
  const currentDay = trecenaData.days.find((d) => d.number === mayanDate.tone);
  if (!currentDay || currentDay.day === 1) {
    return null; // Already at day 1
  }

  // Get previous day
  const previousDay = trecenaData.days.find((d) => d.day === currentDay.day - 1);
  if (!previousDay) return null;

  // Calculate previous sign (go back 1 in the 20-sign cycle)
  const NAWALES = [
    'Imox',
    "Iq'",
    "Aq'ab'al",
    "K'at",
    'Kan',
    'Kame',
    'Kej',
    "Q'anil",
    'Toj',
    "Tz'i'",
    "B'atz'",
    "E'",
    'Aj',
    'Ix',
    "Tz'ikin",
    'Ajmaq',
    "No'j",
    'Tijax',
    'Kawoq',
    'Ajpu',
  ];
  const currentSignIndex = NAWALES.indexOf(mayanDate.sign);
  const previousSignIndex = (currentSignIndex - 1 + 20) % 20;
  const previousSign = NAWALES[previousSignIndex];

  return {
    tone: previousDay.number,
    sign: previousSign,
    trecena: mayanDate.trecena, // Same trecena
    formatted: `${previousDay.number} ${previousSign}`,
  };
}

/**
 * Get next day in the trecena
 * @param {Object} mayanDate - Current Mayan date object
 * @returns {Promise<Object|null>} Next Mayan date object, or null if at day 13
 */
export async function getNextDay(mayanDate) {
  if (!mayanDate || mayanDate.tone === undefined) return null;

  const trecenaData = await getTrecenaData(mayanDate.trecena);
  if (!trecenaData) return null;

  // Find current day in trecena
  const currentDay = trecenaData.days.find((d) => d.number === mayanDate.tone);
  if (!currentDay || currentDay.day === 13) {
    return null; // Already at day 13
  }

  // Get next day
  const nextDay = trecenaData.days.find((d) => d.day === currentDay.day + 1);
  if (!nextDay) return null;

  // Calculate next sign (go forward 1 in the 20-sign cycle)
  const NAWALES = [
    'Imox',
    "Iq'",
    "Aq'ab'al",
    "K'at",
    'Kan',
    'Kame',
    'Kej',
    "Q'anil",
    'Toj',
    "Tz'i'",
    "B'atz'",
    "E'",
    'Aj',
    'Ix',
    "Tz'ikin",
    'Ajmaq',
    "No'j",
    'Tijax',
    'Kawoq',
    'Ajpu',
  ];
  const currentSignIndex = NAWALES.indexOf(mayanDate.sign);
  const nextSignIndex = (currentSignIndex + 1) % 20;
  const nextSign = NAWALES[nextSignIndex];

  return {
    tone: nextDay.number,
    sign: nextSign,
    trecena: mayanDate.trecena, // Same trecena
    formatted: `${nextDay.number} ${nextSign}`,
  };
}

/**
 * Check if a Mayan date is available (not in the future)
 * @param {Object} mayanDate - Mayan date object to check
 * @returns {boolean} True if date is today or in the past
 */
export function isDayAvailable(mayanDate) {
  if (!mayanDate) return false;

  const today = getTodayMayanDateSync();
  if (!today) return false;

  // If different trecena, need to compare dates
  if (mayanDate.trecena !== today.trecena) {
    // For now, assume different trecena means it's a different time period
    // This is a simplification - in reality we'd need to convert back to Gregorian dates
    return false;
  }

  // Same trecena - compare tones
  return mayanDate.tone <= today.tone;
}

/**
 * Get all days in a trecena
 * @param {Object} mayanDate - Mayan date object (uses trecena from it)
 * @returns {Promise<Array>} Array of day objects sorted by day number
 */
export async function getAllDaysInTrecena(mayanDate) {
  if (!mayanDate || !mayanDate.trecena) return [];

  const trecenaData = await getTrecenaData(mayanDate.trecena);
  if (!trecenaData) return [];

  return [...trecenaData.days].sort((a, b) => a.day - b.day);
}
