#!/usr/bin/env node

/**
 * CLI script to convert a Gregorian date to Mayan Tzolk'in calendar date
 * 
 * Usage:
 *   node scripts/convert-date-to-mayan.js YYYY-MM-DD
 * 
 * Example:
 *   node scripts/convert-date-to-mayan.js 1979-10-16
 *   Output: 8 Tz'i'
 */

import { convertToMayan } from '../utils/dateToMayan.js';

// Get date from command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Error: Please provide a date in YYYY-MM-DD format');
  console.error('Usage: node scripts/convert-date-to-mayan.js YYYY-MM-DD');
  console.error('Example: node scripts/convert-date-to-mayan.js 1979-10-16');
  process.exit(1);
}

const dateString = args[0];

// Validate date format (basic check)
if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
  console.error(`Error: Invalid date format: ${dateString}`);
  console.error('Expected format: YYYY-MM-DD (e.g., 1979-10-16)');
  process.exit(1);
}

try {
  const mayanDate = convertToMayan(dateString);
  console.log(mayanDate.formatted);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

