const { getPool, closePool } = require('./connection');

/**
 * Format a cell value for table display
 */
function formatCell(value, maxLength = 8) {
  if (value) {
    const len = typeof value === 'number' ? value.toString().length : value.length;
    return len > 0 ? `✓ (${len})` : '✗';
  }
  return '✗';
}

/**
 * Check if energy_of_the_day has content
 */
function hasEnergyContent(energy) {
  if (!energy) return false;
  const hasNumber = energy.number && (energy.number.title || energy.number.content);
  const hasNawal = energy.nawal && (energy.nawal.title || energy.nawal.content);
  const hasCombined =
    energy.combined_energy && (energy.combined_energy.title || energy.combined_energy.content);
  return hasNumber || hasNawal || hasCombined;
}

/**
 * Check if birthday has content
 */
function hasBirthdayContent(birthday) {
  if (!birthday) return false;
  return !!(birthday.title || birthday.content);
}

/**
 * Check if colors has content
 */
function hasColorsContent(colors) {
  if (!colors) return false;
  return Object.keys(colors).length > 0;
}

/**
 * Get content status for a day
 */
function getDayContentStatus(day) {
  return {
    chapter: formatCell(day.chapter),
    horoscope: formatCell(day.horoscope),
    affirmation: formatCell(day.affirmation),
    meditation: formatCell(day.meditation),
    energy: hasEnergyContent(day.energy_of_the_day) ? '✓' : '✗',
    birthday: hasBirthdayContent(day.birthday) ? '✓' : '✗',
    colors: hasColorsContent(day.colors) ? '✓' : '✗',
  };
}

/**
 * Print a table for a trecena
 */
function printTrecenaTable(trecenaName, days) {
  console.log(`\n${'='.repeat(100)}`);
  console.log(`TRECENA: ${trecenaName.toUpperCase()}`);
  console.log(`${'='.repeat(100)}`);

  // Header
  const header = [
    'Day',
    'Nawal',
    'Chapter',
    'Horoscope',
    'Affirmation',
    'Meditation',
    'Energy',
    'Birthday',
    'Colors',
  ];

  // Calculate column widths
  const colWidths = [4, 12, 10, 10, 12, 12, 8, 9, 7];
  const totalWidth = colWidths.reduce((sum, w) => sum + w + 3, 0) - 3;

  // Print header
  let headerRow = '';
  header.forEach((col, i) => {
    headerRow += col.padEnd(colWidths[i]) + ' | ';
  });
  console.log(headerRow);
  console.log('-'.repeat(totalWidth));

  // Print rows
  days.forEach((day) => {
    const status = getDayContentStatus(day);
    const row = [
      day.day.toString(),
      day.nawal || '',
      status.chapter,
      status.horoscope,
      status.affirmation,
      status.meditation,
      status.energy,
      status.birthday,
      status.colors,
    ];

    let rowStr = '';
    row.forEach((cell, i) => {
      rowStr += cell.padEnd(colWidths[i]) + ' | ';
    });
    console.log(rowStr);
  });
}

/**
 * Main function to check all trecenas
 */
async function checkAllTrecenas() {
  const pool = getPool();

  try {
    // Get all trecenas
    const trecenasQuery = `
      SELECT id, name, display_name
      FROM trecenas
      ORDER BY name ASC
    `;
    const trecenasResult = await pool.query(trecenasQuery);

    if (trecenasResult.rows.length === 0) {
      console.log('❌ No trecenas found in database');
      return;
    }

    console.log(`\n📊 DATABASE STATUS REPORT`);
    console.log(`Found ${trecenasResult.rows.length} trecena(s) in database\n`);

    // Process each trecena
    for (const trecenaRow of trecenasResult.rows) {
      // Get all days for this trecena
      const daysQuery = `
        SELECT day, number, nawal, chapter, horoscope, affirmation, meditation,
               energy_of_the_day, birthday, colors
        FROM days
        WHERE trecena_id = $1
        ORDER BY day ASC
      `;
      const daysResult = await pool.query(daysQuery, [trecenaRow.id]);

      if (daysResult.rows.length === 0) {
        console.log(`\n⚠️  ${trecenaRow.display_name}: No days found`);
        continue;
      }

      // Print table for this trecena
      printTrecenaTable(trecenaRow.display_name, daysResult.rows);
    }

    // Summary
    console.log(`\n${'='.repeat(100)}`);
    console.log('SUMMARY');
    console.log(`${'='.repeat(100)}`);
    console.log(`Total trecenas: ${trecenasResult.rows.length}`);
    console.log(`\nLegend:`);
    console.log(`  ✓ = Has content`);
    console.log(`  ✗ = Empty`);
    console.log(`  ✓ (N) = Has content with N characters`);
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await closePool();
  }
}

checkAllTrecenas();
