#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getPool, closePool } = require('../database/connection');
const { normalizeTrecenaName } = require('../database/normalize');

const INPUT_DIR = path.join(__dirname, '..', 'database', 'input');

/**
 * Extract trecena name from filename (e.g., "trecena-story-qanil.json" -> "qanil")
 */
function extractTrecenaFromFilename(filename) {
  const match = filename.match(/^trecena-story-(.+)\.json$/);
  if (!match) {
    throw new Error(`Invalid filename format: ${filename}. Expected format: trecena-story-*.json`);
  }
  return match[1];
}

/**
 * Process a single trecena story JSON file
 */
async function processStoryFile(pool, filePath) {
  const filename = path.basename(filePath);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing ${filename}...`);
  console.log('='.repeat(60));

  // Extract trecena name from filename
  let trecenaNameFromFile;
  try {
    trecenaNameFromFile = extractTrecenaFromFilename(filename);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }

  // Read and parse JSON file
  let jsonData;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    jsonData = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Error reading/parsing JSON file: ${error.message}`);
    return { success: false, error: `JSON parse error: ${error.message}` };
  }

  // Validate JSON structure
  if (!jsonData.trecena || !jsonData.days || !Array.isArray(jsonData.days)) {
    console.error(`❌ Error: Invalid JSON structure. Expected 'trecena' and 'days' array.`);
    return { success: false, error: 'Invalid JSON structure' };
  }

  if (jsonData.days.length !== 13) {
    console.error(`❌ Error: Expected 13 days, found ${jsonData.days.length}`);
    return { success: false, error: `Expected 13 days, found ${jsonData.days.length}` };
  }

  // Extract trecena info (handle both object and string formats)
  let displayName;
  if (typeof jsonData.trecena === 'string') {
    displayName = jsonData.trecena;
  } else if (jsonData.trecena && typeof jsonData.trecena === 'object') {
    displayName = jsonData.trecena.title || jsonData.trecena.nawal || jsonData.trecena.name || 'Unknown';
  } else {
    displayName = 'Unknown';
  }
  const normalizedName = normalizeTrecenaName(displayName);

  // Extract prologue and epilogue (handle both structures)
  const prologue = jsonData.prologue?.content || jsonData.prologue || '';
  const epilogue = jsonData.epilogue?.content || jsonData.epilogue || '';

  console.log(`\nTrecena Info:`);
  console.log(`  Display Name: "${displayName}"`);
  console.log(`  Normalized Name: "${normalizedName}"`);
  console.log(`  Prologue: ${prologue.length} characters`);
  console.log(`  Epilogue: ${epilogue.length} characters`);

  // Insert or update trecena
  const insertTrecenaQuery = `
    INSERT INTO trecenas (name, display_name, prologue, epilogue, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (name) 
    DO UPDATE SET
      display_name = EXCLUDED.display_name,
      prologue = EXCLUDED.prologue,
      epilogue = EXCLUDED.epilogue,
      updated_at = NOW()
    RETURNING id
  `;

  let trecenaResult;
  try {
    trecenaResult = await pool.query(insertTrecenaQuery, [
      normalizedName,
      displayName,
      prologue,
      epilogue,
    ]);
  } catch (error) {
    console.error(`❌ Database error inserting trecena: ${error.message}`);
    return { success: false, error: `Database error: ${error.message}` };
  }

  const trecenaId = trecenaResult.rows[0].id;
  console.log(`✓ Trecena inserted/updated: ID ${trecenaId}`);

  // Process each day
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const dayData of jsonData.days) {
    try {
      // Handle day_number field
      const day = dayData.day_number || dayData.day || dayData.day_index + 1;
      const number = day;

      if (!day || day < 1 || day > 13) {
        throw new Error(`Invalid day number: ${day}. Must be 1-13.`);
      }

      // Extract nawal
      const nawal = dayData.nawal || null;
      if (!nawal) {
        console.warn(`⚠ Day ${day}: No nawal specified`);
      }

      // Extract chapter
      const chapter = dayData.chapter || '';

      // Insert or update day data
      const insertDayQuery = `
        INSERT INTO days (trecena_id, day, number, nawal, chapter, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (trecena_id, day) 
        DO UPDATE SET
          number = EXCLUDED.number,
          nawal = EXCLUDED.nawal,
          chapter = EXCLUDED.chapter,
          updated_at = NOW()
        RETURNING id
      `;

      const dayResult = await pool.query(insertDayQuery, [
        trecenaId,
        day,
        number,
        nawal,
        chapter,
      ]);

      const dayId = dayResult.rows[0].id;

      // Insert or update image_prompts in separate table
      const imagePrompts = dayData.image_prompts || {};
      const storyPrimary = imagePrompts.story_primary || null;
      const storyWide1 = imagePrompts.story_wide_1 || null;
      const storyWide2 = imagePrompts.story_wide_2 || null;

      // Only insert/update if we have at least one prompt
      if (storyPrimary || storyWide1 || storyWide2) {
        const insertImagePromptsQuery = `
          INSERT INTO image_prompts (
            day_id, story_primary, story_wide_1, story_wide_2, updated_at
          )
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (day_id)
          DO UPDATE SET
            story_primary = COALESCE(EXCLUDED.story_primary, image_prompts.story_primary),
            story_wide_1 = COALESCE(EXCLUDED.story_wide_1, image_prompts.story_wide_1),
            story_wide_2 = COALESCE(EXCLUDED.story_wide_2, image_prompts.story_wide_2),
            updated_at = NOW()
        `;

        await pool.query(insertImagePromptsQuery, [
          dayId,
          storyPrimary,
          storyWide1,
          storyWide2,
        ]);
      }

      successCount++;
      console.log(`  ✓ Day ${day}: ${nawal || 'no nawal'} - Chapter: ${chapter.length} chars, Prompts: ${(storyPrimary ? 1 : 0) + (storyWide1 ? 1 : 0) + (storyWide2 ? 1 : 0)}`);
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

/**
 * Main function
 */
async function main() {
  console.log('Starting trecena story data insertion...\n');
  console.log(`Input directory: ${INPUT_DIR}\n`);

  // Check if input directory exists
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Error: Input directory does not exist: ${INPUT_DIR}`);
    process.exit(1);
  }

  // Find all trecena-story-*.json files
  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((file) => file.startsWith('trecena-story-') && file.endsWith('.json'))
    .map((file) => path.join(INPUT_DIR, file))
    .sort();

  if (files.length === 0) {
    console.log('No trecena-story-*.json files found in input directory.');
    return;
  }

  console.log(`Found ${files.length} file(s) to process:`);
  files.forEach((file) => console.log(`  - ${path.basename(file)}`));

  // Initialize database connection
  const pool = getPool();

  try {
    const results = [];
    let totalSuccess = 0;
    let totalErrors = 0;

    // Process each file
    for (const filePath of files) {
      try {
        const result = await processStoryFile(pool, filePath);
        results.push(result);
        if (result.success) {
          totalSuccess++;
        } else {
          totalErrors++;
        }
      } catch (error) {
        // Fatal error - stop immediately
        console.error(`\n❌ Fatal error processing ${path.basename(filePath)}: ${error.message}`);
        console.error('Stopping execution.');
        process.exit(1);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('Insertion Summary:');
    console.log('='.repeat(60));
    console.log(`  ✓ Files processed successfully: ${totalSuccess}`);
    if (totalErrors > 0) {
      console.log(`  ✗ Files with errors: ${totalErrors}`);
    }

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

    if (totalErrors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
