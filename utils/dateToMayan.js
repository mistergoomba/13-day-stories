/**
 * Utility to convert Gregorian dates to Mayan Tzolk'in calendar dates
 *
 * The Mayan calendar consists of:
 * - 13 Tones (numbers 1-13) that cycle
 * - 20 Signs (nawales) that cycle independently
 * - Full cycle: 260 days (13 × 20)
 *
 * Reference date: December 6, 2025 = 5 Aj
 */

// The 20 nawales in their cycling order
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

// Reference date: December 6, 2025 = 5 Aj
// Create as UTC date to avoid timezone issues
const REFERENCE_DATE = new Date(Date.UTC(2025, 11, 6)); // Month is 0-indexed, so 11 = December
const REFERENCE_TONE = 5;
const REFERENCE_SIGN = 'Aj';

/**
 * Calculate the number of days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @param {boolean} useUTC - If true, normalize to UTC midnight; if false, normalize to local midnight
 * @returns {number} Number of days (positive if date2 is after date1, negative if before)
 */
function daysBetween(date1, date2, useUTC = false) {
  let d1, d2;
  
  if (useUTC) {
    // Normalize both dates to midnight UTC (for birthdays - consistent across timezones)
    d1 = new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()));
    d2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()));
  } else {
    // Normalize both dates to local midnight (for today/navigation - respects user's timezone)
    // Both dates should be normalized to local midnight for comparison
    // date1 (REFERENCE_DATE) is UTC, so we need to get its UTC components and create a local date
    // Actually, we want to compare calendar days in the user's local timezone
    // So we convert REFERENCE_DATE to what it represents in local timezone, then normalize to local midnight
    // And normalize date2 to local midnight
    
    // For REFERENCE_DATE (UTC Dec 6, 2025 00:00), we want to know what calendar day that is in local time
    // Then normalize both to local midnight of that calendar day
    const refYear = date1.getUTCFullYear();
    const refMonth = date1.getUTCMonth();
    const refDay = date1.getUTCDate();
    // Create a date at local midnight for the reference date (treating it as a calendar date, not UTC)
    d1 = new Date(refYear, refMonth, refDay);
    
    // For current date, normalize to local midnight
    d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  }

  // Calculate difference in milliseconds and convert to days
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get the trecena name from a Mayan date
 * The trecena is determined by finding Day 1 of the current 13-day cycle
 * by going backwards (tone - 1) days from the given date
 * @param {Object} mayanDate - Mayan date object with tone and sign
 * @param {number} mayanDate.tone - Tone number (1-13)
 * @param {string} mayanDate.sign - Sign name
 * @returns {string} Trecena name (the sign on Day 1)
 * @example
 * getTrecenaFromDate({ tone: 13, sign: 'Ajpu' })
 * // Returns: "Q'anil"
 */
export function getTrecenaFromDate(mayanDate) {
  const { tone, sign } = mayanDate;

  if (!tone || !sign) {
    throw new Error('Mayan date must have both tone and sign');
  }

  // Find the index of the current sign
  const currentSignIndex = NAWALES.indexOf(sign);
  if (currentSignIndex === -1) {
    throw new Error(`Sign '${sign}' not found in nawales array`);
  }

  // To find Day 1, we go backwards (tone - 1) days
  // For example, if tone is 13, we go back 12 days
  const daysToGoBack = tone - 1;

  // Calculate the sign index for Day 1 (going backwards in the array)
  const day1SignIndex = (((currentSignIndex - daysToGoBack) % 20) + 20) % 20;
  const trecena = NAWALES[day1SignIndex];

  return trecena;
}

/**
 * Convert a Gregorian date to a Mayan Tzolk'in date
 * @param {Date|string} date - Gregorian date (Date object or YYYY-MM-DD string)
 * @param {boolean} useUTC - If true, use UTC normalization (for birthdays); if false, use local normalization (for today/navigation)
 * @returns {Object} Mayan date object with tone, sign, and trecena
 * @example
 * convertToMayan('1979-10-16', true) // Birthday - uses UTC
 * convertToMayan(new Date(), false) // Today - uses local timezone
 */
export function convertToMayan(date, useUTC = false) {
  // Parse input date
  let inputDate;
  if (typeof date === 'string') {
    // Expect YYYY-MM-DD format
    // For strings (birthdays), always use UTC to ensure consistency
    const parts = date.split('-');
    if (parts.length !== 3) {
      throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    inputDate = new Date(Date.UTC(year, month, day));
    if (isNaN(inputDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }
    // For string dates (birthdays), always use UTC normalization
    useUTC = true;
  } else if (date instanceof Date) {
    inputDate = date;
    // For Date objects, use the provided useUTC parameter (defaults to false for local)
  } else {
    throw new Error('Date must be a Date object or YYYY-MM-DD string');
  }

  // Calculate day difference from reference date
  const dayDiff = daysBetween(REFERENCE_DATE, inputDate, useUTC);

  // Find the index of the reference sign (Aj)
  const referenceSignIndex = NAWALES.indexOf(REFERENCE_SIGN);
  if (referenceSignIndex === -1) {
    throw new Error(`Reference sign '${REFERENCE_SIGN}' not found in nawales array`);
  }

  // Calculate tone (1-13, cycles)
  // Reference tone is 5, so we start from 4 (0-indexed: 5-1=4)
  // Add dayDiff and use modulo to cycle, handling negatives
  const tone = ((((REFERENCE_TONE - 1 + dayDiff) % 13) + 13) % 13) + 1;

  // Calculate sign index (0-19, cycles)
  // Add dayDiff to reference sign index and use modulo to cycle, handling negatives
  const signIndex = (((referenceSignIndex + dayDiff) % 20) + 20) % 20;
  const sign = NAWALES[signIndex];

  // Calculate trecena by finding Day 1 of the current cycle
  const trecena = getTrecenaFromDate({ tone, sign });

  return {
    tone,
    sign,
    trecena,
    // Also return formatted string for convenience
    formatted: `${tone} ${sign}`,
  };
}

/**
 * Format a YYYY-MM-DD date string to a readable format (e.g., "October 16, 1979")
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
export function formatDateReadable(dateString) {
  if (!dateString) return '';
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Get today's Mayan date
 * @returns {Object} Mayan date object with tone, sign, and trecena
 */
export function getTodayMayan() {
  return convertToMayan(new Date());
}
