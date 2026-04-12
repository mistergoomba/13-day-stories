const { getPool, closePool } = require('./connection');
const { normalizeTrecenaName } = require('./normalize');

/**
 * Check database for Q'anil/Qanil entries
 */
async function checkQanil() {
  const pool = getPool();

  try {
    console.log('\n' + '='.repeat(60));
    console.log('CHECKING DATABASE FOR Q\'ANIL TRECENA');
    console.log('='.repeat(60) + '\n');

    // Check for normalized name (qanil - no apostrophe)
    const normalizedName = normalizeTrecenaName("Q'anil");
    console.log(`Normalized name (for database lookup): "${normalizedName}"\n`);

    // Query for trecena by normalized name
    const trecenaQuery = `
      SELECT id, name, display_name, 
             LENGTH(prologue) as prologue_length,
             LENGTH(epilogue) as epilogue_length,
             created_at, updated_at
      FROM trecenas
      WHERE name = $1 OR LOWER(name) = $1
    `;

    const trecenaResult = await pool.query(trecenaQuery, [normalizedName]);

    if (trecenaResult.rows.length === 0) {
      console.log('❌ No trecena found with normalized name:', normalizedName);
      
      // Also check for any variations
      const allVariationsQuery = `
        SELECT id, name, display_name
        FROM trecenas
        WHERE LOWER(name) LIKE '%qanil%' 
           OR LOWER(display_name) LIKE '%qanil%'
           OR LOWER(name) LIKE '%q\'anil%'
           OR LOWER(display_name) LIKE '%q\'anil%'
      `;
      const variationsResult = await pool.query(allVariationsQuery);
      
      if (variationsResult.rows.length > 0) {
        console.log('\n⚠️  Found potential matches with variations:');
        variationsResult.rows.forEach(row => {
          console.log(`   - ID: ${row.id}, name: "${row.name}", display_name: "${row.display_name}"`);
        });
      }
    } else {
      const trecena = trecenaResult.rows[0];
      const correctDisplayName = "Q'anil";
      let needsUpdate = false;
      const updates = [];

      console.log('✓ Found trecena:');
      console.log(`   ID: ${trecena.id}`);
      
      // Check and fix name
      if (trecena.name !== normalizedName) {
        console.log(`   name: "${trecena.name}" ⚠️  (incorrect - should be "${normalizedName}")`);
        needsUpdate = true;
        updates.push(`name = '${normalizedName}'`);
      } else {
        console.log(`   name: "${trecena.name}" ✓ (correct)`);
      }

      // Check and fix display_name
      if (trecena.display_name !== correctDisplayName) {
        console.log(`   display_name: "${trecena.display_name}" ⚠️  (incorrect - should be "${correctDisplayName}")`);
        needsUpdate = true;
        updates.push(`display_name = '${correctDisplayName}'`);
      } else {
        console.log(`   display_name: "${trecena.display_name}" ✓ (correct)`);
      }

      console.log(`   prologue: ${trecena.prologue_length || 0} characters`);
      console.log(`   epilogue: ${trecena.epilogue_length || 0} characters`);
      console.log(`   created_at: ${trecena.created_at}`);
      console.log(`   updated_at: ${trecena.updated_at}`);

      // Fix incorrect values
      if (needsUpdate) {
        console.log('\n   🔧 Fixing incorrect values...');
        
        // Build update query with parameterized values
        const updateParams = [];
        const updateParts = [];
        let paramIndex = 1;

        if (trecena.name !== normalizedName) {
          updateParts.push(`name = $${paramIndex++}`);
          updateParams.push(normalizedName);
        }
        
        if (trecena.display_name !== correctDisplayName) {
          updateParts.push(`display_name = $${paramIndex++}`);
          updateParams.push(correctDisplayName);
        }

        updateParts.push('updated_at = NOW()');
        const whereParamIndex = paramIndex;
        updateParams.push(trecena.id);

        const updateQuery = `
          UPDATE trecenas
          SET ${updateParts.join(', ')}
          WHERE id = $${whereParamIndex}
          RETURNING name, display_name
        `;
        
        try {
          const updateResult = await pool.query(updateQuery, updateParams);
          const updated = updateResult.rows[0];
          console.log(`   ✓ Updated successfully:`);
          console.log(`     name: "${updated.name}"`);
          console.log(`     display_name: "${updated.display_name}"`);
        } catch (error) {
          console.error(`   ❌ Error updating: ${error.message}`);
        }
      }

      // Check days
      const daysQuery = `
        SELECT day, number, nawal, 
               LENGTH(chapter) as chapter_length,
               LENGTH(horoscope) as horoscope_length,
               LENGTH(affirmation) as affirmation_length,
               LENGTH(meditation) as meditation_length
        FROM days
        WHERE trecena_id = $1
        ORDER BY day ASC
      `;
      const daysResult = await pool.query(daysQuery, [trecena.id]);

      console.log(`\n   Days: ${daysResult.rows.length}/13`);
      if (daysResult.rows.length > 0) {
        console.log('\n   Day | Nawal | Chapter | Horoscope | Affirmation | Meditation');
        console.log('   ' + '-'.repeat(70));
        daysResult.rows.forEach(day => {
          const chapter = day.chapter_length > 0 ? `✓ (${day.chapter_length})` : '✗';
          const horoscope = day.horoscope_length > 0 ? `✓ (${day.horoscope_length})` : '✗';
          const affirmation = day.affirmation_length > 0 ? `✓ (${day.affirmation_length})` : '✗';
          const meditation = day.meditation_length > 0 ? `✓ (${day.meditation_length})` : '✗';
          console.log(`   ${String(day.day).padStart(3)} | ${(day.nawal || '').padEnd(6)} | ${chapter.padEnd(8)} | ${horoscope.padEnd(10)} | ${affirmation.padEnd(11)} | ${meditation}`);
        });
      }

      // Check image prompts
      const imagePromptsQuery = `
        SELECT d.day, 
               LENGTH(ip.story_primary) as story_primary_length,
               LENGTH(ip.story_wide_1) as story_wide_1_length,
               LENGTH(ip.story_wide_2) as story_wide_2_length
        FROM days d
        LEFT JOIN image_prompts ip ON d.id = ip.day_id
        WHERE d.trecena_id = $1
        ORDER BY d.day ASC
      `;
      const imagePromptsResult = await pool.query(imagePromptsQuery, [trecena.id]);

      const daysWithPrompts = imagePromptsResult.rows.filter(row => 
        row.story_primary_length > 0 || row.story_wide_1_length > 0 || row.story_wide_2_length > 0
      ).length;

      console.log(`\n   Image Prompts: ${daysWithPrompts}/13 days have prompts`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('CHECK COMPLETE');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await closePool();
  }
}

// Run the check
checkQanil();
