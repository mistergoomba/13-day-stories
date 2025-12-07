/**
 * Simplified Calendar Utilities
 * Single source of truth for all Mayan calendar date and data operations
 */

import { convertToMayan } from './dateToMayan';
import { getActualDate, getActualDateSync } from './getActualDate';
import { aqabalTrecena } from '../data/trecena-aqabal';
import { imoxTrecena } from '../data/trecena-imox';
import { iqTrecena } from '../data/trecena-iq';
import { katTrecena } from '../data/trecena-kat';
import { tojTrecena } from '../data/trecena-toj';
import { tzikinTrecena } from '../data/trecena-tzikin';
import imageColors from '../data/image-colors.json';
import { getImageSource } from './imageLoader';

// Trecena mapping
const TRECENA_MAP = {
  aqabal: aqabalTrecena,
  imox: imoxTrecena,
  iq: iqTrecena,
  kat: katTrecena,
  toj: tojTrecena,
  tzikin: tzikinTrecena,
};

// Cache for trecena data only (not date-related)
const trecenaCache = new Map();

/**
 * Normalize trecena name to match TRECENA_MAP key
 * @param {string} trecenaName - Trecena name (e.g., "Q'anil", "Aq'ab'al")
 * @returns {string} Normalized key
 */
function normalizeTrecenaName(trecenaName) {
  if (!trecenaName) return null;
  return trecenaName.replace(/'/g, '').replace(/'/g, '').toLowerCase();
}


/**
 * Get trecena data (with caching)
 * @param {string} trecenaName - Trecena name
 * @returns {Object|null} Trecena data object
 */
export function getTrecenaData(trecenaName) {
  const normalizedKey = normalizeTrecenaName(trecenaName);
  if (!normalizedKey) return null;

  // Check cache first
  if (trecenaCache.has(normalizedKey)) {
    return trecenaCache.get(normalizedKey);
  }

  // Load from TRECENA_MAP
  const trecenaData = TRECENA_MAP[normalizedKey];
  if (!trecenaData) {
    console.warn(`Trecena '${trecenaName}' (${normalizedKey}) not found in TRECENA_MAP`);
    return null;
  }

  // Cache it
  trecenaCache.set(normalizedKey, trecenaData);
  return trecenaData;
}

/**
 * Get image source for a day and image type
 * Returns require() result for local images
 * @param {string} trecenaKey - Normalized trecena key (e.g., "toj", "aqabal")
 * @param {number} tone - Tone number (1-13)
 * @param {string} imageType - Image type
 * @returns {Object|null} Image source (require() result) or null if not found
 */
function getImagePath(trecenaKey, tone, imageType) {
  return getImageSource(trecenaKey, tone, imageType);
}

/**
 * Convert a date to Mayan date object
 * For string dates (birthdays), uses UTC normalization
 * For Date objects (today/navigation), uses local normalization
 * @param {Date|string} date - Gregorian date (Date object or YYYY-MM-DD string)
 * @returns {Object} Mayan date object with { tone, sign, trecena, formatted }
 */
export function convertDateToMayan(date) {
  const isString = typeof date === 'string';
  const useUTC = isString; // Use UTC for strings (birthdays), local for Date objects
  return convertToMayan(date, useUTC);
}

/**
 * Get today's Mayan date
 * Uses device date, converts to Mayan
 * @returns {Object} Mayan date object with { tone, sign, trecena, formatted }
 */
export async function getTodayMayanDate() {
  // Get actual date and convert (use local normalization for today)
  const actualDate = await getActualDate();
  const mayanDate = convertToMayan(actualDate, false);
  return mayanDate;
}

/**
 * Get today's Mayan date synchronously (uses device date)
 * @returns {Object} Mayan date object
 */
export function getTodayMayanDateSync() {
  // Use device date (use local normalization for today)
  const deviceDate = getActualDateSync();
  return convertToMayan(deviceDate, false);
}

/**
 * Get day data for a specific Mayan date
 * Loads trecena data (cached), finds day by tone, returns data with image paths
 * @param {Object} mayanDate - Mayan date object with { tone, sign, trecena, formatted }
 * @returns {Object|null} Day data object (without image_prompts, with image paths)
 */
export function getDayData(mayanDate) {
  if (!mayanDate || !mayanDate.tone || !mayanDate.trecena) {
    console.error('Invalid mayanDate object:', mayanDate);
    return null;
  }

  // Get trecena data (cached)
  const trecenaData = getTrecenaData(mayanDate.trecena);
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

  // Get image paths
  const imagePaths = {
    horoscope: getImagePath(trecenaKey, mayanDate.tone, 'horoscope'),
    affirmation: getImagePath(trecenaKey, mayanDate.tone, 'affirmation'),
    meditation: getImagePath(trecenaKey, mayanDate.tone, 'meditation'),
    birthday: getImagePath(trecenaKey, mayanDate.tone, 'birthday'),
    story_primary: getImagePath(trecenaKey, mayanDate.tone, 'story_primary'),
    story_wide_1: getImagePath(trecenaKey, mayanDate.tone, 'story_wide_1'),
    story_wide_2: getImagePath(trecenaKey, mayanDate.tone, 'story_wide_2'),
  };

  return {
    ...dayDataWithoutPrompts,
    images: imagePaths,
  };
}

/**
 * Get background colors for a specific Mayan date and image type
 * @param {Object} mayanDate - Mayan date object
 * @param {string} imageType - Image type: 'horoscope', 'affirmation', 'story_primary', 'birthday'
 * @returns {Object} Object with primary, secondary, and accent colors
 */
export function getBackgroundColors(mayanDate, imageType = 'horoscope') {
  if (!mayanDate || !mayanDate.trecena || !mayanDate.tone) {
    return {
      primary: '#12091A',
      secondary: '#1C0F29',
      accent: '#6E45CF',
    };
  }

  const trecenaKey = normalizeTrecenaName(mayanDate.trecena);
  const trecenaColorKey = `trecena-${trecenaKey}`;
  const dayKey = String(mayanDate.tone);

  if (
    imageColors[trecenaColorKey] &&
    imageColors[trecenaColorKey][dayKey] &&
    imageColors[trecenaColorKey][dayKey][imageType]
  ) {
    return imageColors[trecenaColorKey][dayKey][imageType];
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
 * @returns {Object|null} Previous Mayan date object, or null if at day 1
 */
export function getPreviousDay(mayanDate) {
  if (!mayanDate || mayanDate.tone === undefined) return null;

  const trecenaData = getTrecenaData(mayanDate.trecena);
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
    'Imox', "Iq'", "Aq'ab'al", "K'at", 'Kan', 'Kame', 'Kej', "Q'anil", 'Toj',
    "Tz'i'", "B'atz'", "E'", 'Aj', 'Ix', "Tz'ikin", 'Ajmaq', "No'j", 'Tijax', 'Kawoq', 'Ajpu',
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
 * @returns {Object|null} Next Mayan date object, or null if at day 13
 */
export function getNextDay(mayanDate) {
  if (!mayanDate || mayanDate.tone === undefined) return null;

  const trecenaData = getTrecenaData(mayanDate.trecena);
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
    'Imox', "Iq'", "Aq'ab'al", "K'at", 'Kan', 'Kame', 'Kej', "Q'anil", 'Toj',
    "Tz'i'", "B'atz'", "E'", 'Aj', 'Ix', "Tz'ikin", 'Ajmaq', "No'j", 'Tijax', 'Kawoq', 'Ajpu',
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
 * @returns {Array} Array of day objects sorted by day number
 */
export function getAllDaysInTrecena(mayanDate) {
  if (!mayanDate || !mayanDate.trecena) return [];

  const trecenaData = getTrecenaData(mayanDate.trecena);
  if (!trecenaData) return [];

  return [...trecenaData.days].sort((a, b) => a.day - b.day);
}

