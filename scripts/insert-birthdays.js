const fs = require('fs');
const path = require('path');
const { getPool, closePool } = require('../database/connection');

const INPUT_DIR = path.join(__dirname, '..', 'database', 'input');

/**
 * Normalize trecena name (e.g., "Aj" -> "aj", "Tz'ikin" -> "tz'ikin")
 */
function normalizeTrecenaName(name) {
  return name.toLowerCase();
}

/**
 * Extract trecena name from filename (e.g., "birthdays-aj.json" -> "aj")
 */
function extractTrecenaFromFilename(filename) {
  const match = filename.match(/^birthdays-(.+)\.json$/);
  if (!match) {
    throw new Error(`Invalid filename format: ${filename}. Expected format: birthdays-*.json`);
  }
  return match[1];
}

/**
 * Extract nawal name from image_prompts.birthday field
 * Pattern: "Mayan glyph for Aj (Cornstalk/Cane)" -> "Aj"
 */
function extractNawalFromImagePrompt(birthdayPrompt) {
  if (!birthdayPrompt || typeof birthdayPrompt !== 'string') {
    return null;
  }

  // Try to extract from "Mayan glyph for [Nawal] (description)"
  const match = birthdayPrompt.match(/Mayan glyph for ([A-Za-z' ]+?)\s*\(/);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: try to find nawal name in the content
  // This is a less reliable method but can work as fallback
  const nawalNames = [
    'Aj',
    'Ix',
    "Tz'ikin",
    'Ajmaq',
    "No'j",
    'Tijax',
    'Kawoq',
    'Ajpu',
    'Imox',
    "Iq'",
    "Aq'ab'al",
    "K'at",
    'Kan',
    'Kej',
    'E',
    'Batz',
    'Toj',
    'Qanil',
    'Tzi',
    'Tzikin',
    'Kame',
    'Aqabal',
  ];

  for (const nawal of nawalNames) {
    if (birthdayPrompt.includes(`glyph for ${nawal}`) || birthdayPrompt.includes(`for ${nawal} `)) {
      return nawal;
    }
  }

  return null;
}

/**
 * Process a single birthdays JSON file
 */
async function processBirthdaysFile(pool, filePath) {
  const filename = path.basename(filePath);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing ${filename}...`);
  console.log('='.repeat(60));

  // Extract trecena name from filename
  let trecenaName;
  try {
    trecenaName = extractTrecenaFromFilename(filename);
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

  // Look up trecena in database
  const normalizedTrecenaName = normalizeTrecenaName(trecenaName);
  const trecenaQuery = `
    SELECT id, name, display_name
    FROM trecenas
    WHERE LOWER(name) = $1
  `;

  let trecenaResult;
  try {
    trecenaResult = await pool.query(trecenaQuery, [normalizedTrecenaName]);
  } catch (error) {
    console.error(`❌ Database error: ${error.message}`);
    return { success: false, error: `Database error: ${error.message}` };
  }

  if (trecenaResult.rows.length === 0) {
    const errorMsg = `Trecena '${trecenaName}' not found in database. Please ensure the trecena exists before inserting birthday data.`;
    console.error(`❌ Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const trecenaRow = trecenaResult.rows[0];
  console.log(`✓ Found trecena: ${trecenaRow.display_name} (id: ${trecenaRow.id})`);

  // Process each day
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const dayData of jsonData.days) {
    try {
      // Handle both day_index (0-12) and day_number (1-13) formats
      let day;
      let number;

      if (dayData.day_number !== undefined) {
        // New format: day_number is already 1-13
        day = dayData.day_number;
        number = dayData.day_number;
      } else if (dayData.day_index !== undefined) {
        // Old format: day_index is 0-12, convert to 1-13
        day = dayData.day_index + 1;
        number = dayData.day_index + 1;
      } else {
        throw new Error('Day data must have either day_number (1-13) or day_index (0-12)');
      }

      // Extract nawal from image_prompts.birthday
      const birthdayPrompt = dayData.image_prompts?.birthday;
      const nawal = extractNawalFromImagePrompt(birthdayPrompt);

      if (!nawal) {
        const error = `Day ${day}: Could not extract nawal name from image_prompts.birthday`;
        console.error(`⚠ ${error}`);
        errors.push(error);
        errorCount++;
        continue;
      }

      // Prepare JSONB data
      const energyOfTheDay = JSON.stringify(dayData.energy_of_the_day || {});
      const birthday = JSON.stringify(dayData.birthday || {});
      const imagePrompts = JSON.stringify(dayData.image_prompts || {});

      // Insert or update day data
      // Smart merge for image_prompts: preserve existing fields, only update/add birthday
      const insertQuery = `
        INSERT INTO days (trecena_id, day, number, nawal, energy_of_the_day, birthday, image_prompts)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb)
        ON CONFLICT (trecena_id, day) 
        DO UPDATE SET
          number = EXCLUDED.number,
          nawal = EXCLUDED.nawal,
          energy_of_the_day = EXCLUDED.energy_of_the_day,
          birthday = EXCLUDED.birthday,
          image_prompts = CASE
            WHEN days.image_prompts IS NULL OR days.image_prompts = '{}'::jsonb THEN
              EXCLUDED.image_prompts
            ELSE
              days.image_prompts || jsonb_build_object('birthday', EXCLUDED.image_prompts->>'birthday')
          END,
          updated_at = NOW()
      `;

      await pool.query(insertQuery, [
        trecenaRow.id,
        day,
        number,
        nawal,
        energyOfTheDay,
        birthday,
        imagePrompts,
      ]);

      successCount++;
    } catch (error) {
      const dayNum =
        dayData.day_number || (dayData.day_index !== undefined ? dayData.day_index + 1 : '?');
      const errorMsg = `Day ${dayNum}: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
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
    trecena: trecenaRow.display_name,
    successCount,
    errorCount,
    errors,
  };
}

/**
 * Main function
 */
async function main() {
  console.log('Starting birthday data insertion...\n');
  console.log(`Input directory: ${INPUT_DIR}\n`);

  // Check if input directory exists
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Error: Input directory does not exist: ${INPUT_DIR}`);
    process.exit(1);
  }

  // Find all birthdays-*.json files
  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((file) => file.startsWith('birthdays-') && file.endsWith('.json'))
    .map((file) => path.join(INPUT_DIR, file))
    .sort();

  if (files.length === 0) {
    console.log('No birthdays-*.json files found in input directory.');
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
        const result = await processBirthdaysFile(pool, filePath);
        results.push(result);
        if (result.success) {
          totalSuccess++;
        } else {
          totalErrors++;
        }
      } catch (error) {
        // Fatal error (like trecena not found) - stop immediately
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
