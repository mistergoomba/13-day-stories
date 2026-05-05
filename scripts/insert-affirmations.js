#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getPool, closePool } = require('../database/connection');
const { normalizeTrecenaName } = require('../database/normalize');

const INPUT_DIR = path.join(__dirname, '..', 'database', 'input');

function extractTrecenaFromFilename(filename) {
  const match = filename.match(/^affirmations-(.+)\.json$/);
  if (!match) {
    throw new Error(`Invalid filename format: ${filename}. Expected format: affirmations-*.json`);
  }
  return match[1];
}

async function processAffirmationFile(pool, filePath) {
  const filename = path.basename(filePath);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing ${filename}...`);
  console.log('='.repeat(60));

  try {
    extractTrecenaFromFilename(filename);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }

  let jsonData;
  try {
    jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`❌ Error reading/parsing JSON file: ${error.message}`);
    return { success: false, error: `JSON parse error: ${error.message}` };
  }

  if (!jsonData.trecena || !jsonData.days || !Array.isArray(jsonData.days)) {
    console.error(`❌ Error: Invalid JSON structure. Expected 'trecena' and 'days' array.`);
    return { success: false, error: 'Invalid JSON structure' };
  }

  if (jsonData.days.length !== 13) {
    console.error(`❌ Error: Expected 13 days, found ${jsonData.days.length}`);
    return { success: false, error: `Expected 13 days, found ${jsonData.days.length}` };
  }

  let displayName;
  if (typeof jsonData.trecena === 'string') {
    displayName = jsonData.trecena;
  } else if (jsonData.trecena && typeof jsonData.trecena === 'object') {
    displayName = jsonData.trecena.title || jsonData.trecena.nawal || jsonData.trecena.name || 'Unknown';
  } else {
    displayName = 'Unknown';
  }
  const normalizedName = normalizeTrecenaName(displayName);

  const trecenaLookup = await pool.query(
    'SELECT id FROM trecenas WHERE name = $1',
    [normalizedName]
  );

  if (trecenaLookup.rows.length === 0) {
    const msg = `Trecena "${displayName}" (normalized: "${normalizedName}") not found. Run insert-trecena-story.js or insert-birthdays.js first.`;
    console.error(`❌ ${msg}`);
    return { success: false, error: msg };
  }

  const trecenaId = trecenaLookup.rows[0].id;
  console.log(`Trecena: "${displayName}" (id ${trecenaId})`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const dayData of jsonData.days) {
    try {
      const day = dayData.day_number || dayData.day || (dayData.day_index != null ? dayData.day_index + 1 : null);
      if (!day || day < 1 || day > 13) {
        throw new Error(`Invalid day number: ${day}. Must be 1-13.`);
      }

      const affirmation = dayData.affirmation || null;
      const affirmationPrompt = dayData.image_prompts?.affirmation || null;

      if (!affirmation && !affirmationPrompt) {
        console.log(`  - Day ${day}: nothing to insert (no affirmation or image_prompt.affirmation)`);
        continue;
      }

      const dayLookup = await pool.query(
        'SELECT id FROM days WHERE trecena_id = $1 AND day = $2',
        [trecenaId, day]
      );

      if (dayLookup.rows.length === 0) {
        throw new Error(`Day ${day} row not found for trecena ${normalizedName}. Run insert-trecena-story.js or insert-birthdays.js first.`);
      }

      const dayId = dayLookup.rows[0].id;

      if (affirmation) {
        await pool.query(
          `UPDATE days SET affirmation = $1, updated_at = NOW() WHERE id = $2`,
          [affirmation, dayId]
        );
      }

      if (affirmationPrompt) {
        await pool.query(
          `INSERT INTO image_prompts (day_id, affirmation, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (day_id)
           DO UPDATE SET
             affirmation = EXCLUDED.affirmation,
             updated_at = NOW()`,
          [dayId, affirmationPrompt]
        );
      }

      successCount++;
      console.log(`  ✓ Day ${day}: affirmation=${affirmation ? affirmation.length + ' chars' : 'skip'}, prompt=${affirmationPrompt ? 'yes' : 'skip'}`);
    } catch (error) {
      const dayNum = dayData.day_number || dayData.day || '?';
      const errorMsg = `Day ${dayNum}: ${error.message}`;
      console.error(`  ❌ ${errorMsg}`);
      errors.push(errorMsg);
      errorCount++;
    }
  }

  console.log(`\n✓ Successfully processed ${successCount} days`);
  if (errorCount > 0) {
    console.log(`⚠ Errors: ${errorCount}`);
  }

  return {
    success: errorCount === 0,
    trecena: displayName,
    trecenaId,
    successCount,
    errorCount,
    errors,
  };
}

async function main() {
  console.log('Starting affirmation data insertion...\n');
  console.log(`Input directory: ${INPUT_DIR}\n`);

  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Error: Input directory does not exist: ${INPUT_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((file) => file.startsWith('affirmations-') && file.endsWith('.json'))
    .map((file) => path.join(INPUT_DIR, file))
    .sort();

  if (files.length === 0) {
    console.log('No affirmations-*.json files found in input directory.');
    return;
  }

  console.log(`Found ${files.length} file(s) to process:`);
  files.forEach((file) => console.log(`  - ${path.basename(file)}`));

  const pool = getPool();
  try {
    const results = [];
    let totalSuccess = 0;
    let totalErrors = 0;

    for (const filePath of files) {
      try {
        const result = await processAffirmationFile(pool, filePath);
        results.push(result);
        if (result.success) totalSuccess++;
        else totalErrors++;
      } catch (error) {
        console.error(`\n❌ Fatal error processing ${path.basename(filePath)}: ${error.message}`);
        process.exit(1);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Insertion Summary:');
    console.log('='.repeat(60));
    console.log(`  ✓ Files processed successfully: ${totalSuccess}`);
    if (totalErrors > 0) console.log(`  ✗ Files with errors: ${totalErrors}`);
    results.forEach((result) => {
      if (result.trecena) {
        console.log(`  - ${result.trecena}: ${result.successCount} days inserted/updated`);
        if (result.errorCount > 0) {
          console.log(`    ⚠ ${result.errorCount} errors`);
          result.errors.forEach((err) => console.log(`      - ${err}`));
        }
      }
    });
    console.log('='.repeat(60));

    if (totalErrors > 0) process.exit(1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
