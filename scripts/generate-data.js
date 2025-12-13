#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { getPool, closePool } = require('../database/connection');

const DATA_IMAGES_DIR = path.join(__dirname, '..', 'images-hd');
const API_DIR = path.join(__dirname, '..', 'cdn');
const TARGET_WIDTH = 1080;
const WEBP_QUALITY = 85;
const JPEG_QUALITY = 85;

// Wide images that should be resized to 1080px width (maintaining aspect ratio)
const WIDE_IMAGES = ['story_wide_1', 'story_wide_2'];

// Image types to extract colors from
const IMAGE_TYPES = ['horoscope', 'affirmation', 'story_primary', 'birthday'];

// Image types that should also have JPEG versions with watermark
const JPEG_IMAGE_TYPES = ['horoscope', 'affirmation', 'story_primary', 'birthday'];

// Font path for watermark - try .ttf first, then .otf
const FONT_DIR = path.join(__dirname, '..', 'assets', 'fonts', 'bromolek');
const FONT_PATH_TTF = path.join(FONT_DIR, 'bromolek.ttf');
const FONT_PATH_OTF = path.join(FONT_DIR, 'bromolek.otf');
const FONT_PATH = fs.existsSync(FONT_PATH_TTF) ? FONT_PATH_TTF : FONT_PATH_OTF;

/**
 * Read font file and convert to base64 data URI for SVG embedding
 */
function getFontDataURI() {
  if (!fs.existsSync(FONT_PATH)) {
    return null;
  }
  try {
    const fontBuffer = fs.readFileSync(FONT_PATH);
    const base64 = fontBuffer.toString('base64');
    const mimeType = FONT_PATH.endsWith('.ttf') ? 'font/truetype' : 'font/opentype';
    return `data:${mimeType};charset=utf-8;base64,${base64}`;
  } catch (error) {
    console.warn(`Warning: Could not read font file ${FONT_PATH}: ${error.message}`);
    return null;
  }
}

// Statistics
const stats = {
  converted: 0,
  skipped: 0,
  failed: 0,
  colorsExtracted: 0,
  colorsFailed: 0,
  jpegConverted: 0,
  jpegSkipped: 0,
  jpegFailed: 0,
};

// Color data storage: colors[trecena][day][imageType] = { primary, secondary, accent }
const colors = {};

/**
 * Extract dominant colors from an image using k-means clustering
 * Returns an array of color hex values
 */
async function extractDominantColors(imagePath, numColors = 3) {
  try {
    // Resize image to small size for faster processing
    const image = sharp(imagePath);
    const resized = await image
      .resize(100, 100, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = resized;
    const pixels = [];

    // Extract RGB values from pixel data
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      pixels.push({ r, g, b });
    }

    // Simple k-means clustering to find dominant colors
    const colorCentroids = kMeansClustering(pixels, numColors);

    // Convert to hex and sort by brightness
    const hexColors = colorCentroids.map((color) => {
      const hex = rgbToHex(color.r, color.g, color.b);
      const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
      return { hex, brightness, r: color.r, g: color.g, b: color.b };
    });

    // Sort by brightness (darkest to lightest)
    hexColors.sort((a, b) => a.brightness - b.brightness);

    return hexColors.map((c) => c.hex);
  } catch (error) {
    console.error(`Error extracting colors from ${imagePath}:`, error.message);
    return null;
  }
}

/**
 * Simple k-means clustering implementation
 */
function kMeansClustering(pixels, k, maxIterations = 10) {
  // Initialize centroids randomly
  const centroids = [];
  for (let i = 0; i < k; i++) {
    const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
    centroids.push({ r: randomPixel.r, g: randomPixel.g, b: randomPixel.b });
  }

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Assign pixels to nearest centroid
    const clusters = Array(k)
      .fill(null)
      .map(() => []);

    for (const pixel of pixels) {
      let minDistance = Infinity;
      let nearestCentroid = 0;

      for (let i = 0; i < centroids.length; i++) {
        const distance = euclideanDistance(pixel, centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCentroid = i;
        }
      }

      clusters[nearestCentroid].push(pixel);
    }

    // Update centroids
    let converged = true;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;

      const avgR = clusters[i].reduce((sum, p) => sum + p.r, 0) / clusters[i].length;
      const avgG = clusters[i].reduce((sum, p) => sum + p.g, 0) / clusters[i].length;
      const avgB = clusters[i].reduce((sum, p) => sum + p.b, 0) / clusters[i].length;

      const oldCentroid = centroids[i];
      centroids[i] = { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) };

      if (euclideanDistance(oldCentroid, centroids[i]) > 1) {
        converged = false;
      }
    }

    if (converged) break;
  }

  return centroids;
}

/**
 * Calculate Euclidean distance between two RGB colors
 */
function euclideanDistance(color1, color2) {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

/**
 * Check if a filename is a wide image
 */
function isWideImage(filename) {
  const basename = path.basename(filename, path.extname(filename));
  return WIDE_IMAGES.includes(basename);
}

/**
 * Check if an image type should have a JPEG version
 */
function shouldGenerateJPEG(basename) {
  return JPEG_IMAGE_TYPES.includes(basename);
}

/**
 * Create watermark SVG with embedded font
 */
function createWatermarkSVG(textColor, strokeColor, width, height) {
  const fontSize = Math.round(width * 0.04); // 4% of image width
  const padding = Math.round(width * 0.03); // 3% padding
  const strokeWidth = Math.round(fontSize * 0.15); // 15% of font size for stroke
  
  // Calculate text position (bottom right)
  const x = width - padding;
  const y = height - padding;
  
  // Try to get font data URI
  const fontDataURI = getFontDataURI();
  
  // Build SVG with optional embedded font
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Embed font if available
  if (fontDataURI) {
    svg += `
    <defs>
      <style>
        @font-face {
          font-family: 'Bromolek';
          src: url('${fontDataURI}') format('${FONT_PATH.endsWith('.ttf') ? 'truetype' : 'opentype'}');
        }
      </style>
    </defs>`;
  }
  
  // Add text with stroke and fill
  svg += `
    <text
      x="${x}"
      y="${y}"
      font-family="${fontDataURI ? 'Bromolek' : 'Arial, sans-serif'}"
      font-size="${fontSize}"
      fill="${textColor}"
      stroke="${strokeColor}"
      stroke-width="${strokeWidth}"
      text-anchor="end"
      dominant-baseline="text-before-edge"
      style="font-weight: normal; paint-order: stroke fill;"
    >@13DayStories</text>
  </svg>`;
  
  return Buffer.from(svg);
}

/**
 * Convert a PNG file to JPEG with watermark
 * Skips conversion if output file already exists and is newer than source
 */
async function convertImageToJPEG(pngPath, outputPath, extractedColors) {
  // Skip if output already exists and is newer than or equal to source
  if (fs.existsSync(outputPath)) {
    try {
      const sourceStats = fs.statSync(pngPath);
      const outputStats = fs.statSync(outputPath);

      // If output is newer than or equal to source, skip conversion
      if (outputStats.mtime >= sourceStats.mtime) {
        stats.jpegSkipped++;
        console.log(`⊘ JPEG skipped (already exists): ${path.relative(DATA_IMAGES_DIR, pngPath)}`);
        return true;
      } else {
        // Source is newer, need to reconvert
        console.log(`↻ Source updated, reconverting JPEG: ${path.relative(DATA_IMAGES_DIR, pngPath)}`);
      }
    } catch (error) {
      // If we can't check stats, proceed with conversion
      console.log(
        `⚠ Could not check file stats, converting JPEG: ${path.relative(DATA_IMAGES_DIR, pngPath)}`
      );
    }
  }

  try {
    const image = sharp(pngPath);
    const metadata = await image.metadata();

    // Square images: resize to 1080x1080
    const resizedImage = await image
      .resize({
        width: TARGET_WIDTH,
        height: TARGET_WIDTH,
        fit: 'cover', // Cover ensures square, may crop if not perfectly square
      })
      .toBuffer();

    // Get colors for watermark
    let lightestColor = '#FFFFFF'; // Default fallback
    let darkestColor = '#000000'; // Default fallback

    if (extractedColors && extractedColors.length > 0) {
      // Colors are already sorted by brightness (darkest to lightest)
      darkestColor = extractedColors[0]; // First is darkest
      lightestColor = extractedColors[extractedColors.length - 1]; // Last is lightest
    }

    // Create watermark SVG
    const watermarkSVG = createWatermarkSVG(
      lightestColor,
      darkestColor,
      TARGET_WIDTH,
      TARGET_WIDTH
    );

    // Composite watermark onto image
    await sharp(resizedImage)
      .composite([
        {
          input: watermarkSVG,
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(outputPath);

    stats.jpegConverted++;
    console.log(
      `✓ JPEG converted: ${path.relative(DATA_IMAGES_DIR, pngPath)} → ${path.relative(
        API_DIR,
        outputPath
      )}`
    );
    return true;
  } catch (error) {
    stats.jpegFailed++;
    console.error(`✗ JPEG failed: ${path.relative(DATA_IMAGES_DIR, pngPath)} - ${error.message}`);
    return false;
  }
}

/**
 * Convert a PNG file to WebP and extract colors
 * Skips conversion if output file already exists and is newer than source
 */
async function convertImageToWebP(pngPath, outputPath) {
  // Skip if output already exists and is newer than or equal to source
  if (fs.existsSync(outputPath)) {
    try {
      const sourceStats = fs.statSync(pngPath);
      const outputStats = fs.statSync(outputPath);

      // If output is newer than or equal to source, skip conversion
      if (outputStats.mtime >= sourceStats.mtime) {
        stats.skipped++;
        console.log(`⊘ Skipped (already exists): ${path.relative(DATA_IMAGES_DIR, pngPath)}`);
        return true;
      } else {
        // Source is newer, need to reconvert
        console.log(`↻ Source updated, reconverting: ${path.relative(DATA_IMAGES_DIR, pngPath)}`);
      }
    } catch (error) {
      // If we can't check stats, proceed with conversion
      console.log(
        `⚠ Could not check file stats, converting: ${path.relative(DATA_IMAGES_DIR, pngPath)}`
      );
    }
  }

  try {
    const image = sharp(pngPath);
    const metadata = await image.metadata();

    let resizeOptions;

    if (isWideImage(pngPath)) {
      // Wide images: resize to 1080px width, maintain aspect ratio
      resizeOptions = {
        width: TARGET_WIDTH,
        height: undefined, // Let sharp calculate based on aspect ratio
        fit: 'inside',
      };
    } else {
      // Square images: resize to 1080x1080
      resizeOptions = {
        width: TARGET_WIDTH,
        height: TARGET_WIDTH,
        fit: 'cover', // Cover ensures square, may crop if not perfectly square
      };
    }

    await image.resize(resizeOptions).webp({ quality: WEBP_QUALITY }).toFile(outputPath);

    stats.converted++;
    console.log(
      `✓ Converted: ${path.relative(DATA_IMAGES_DIR, pngPath)} → ${path.relative(
        API_DIR,
        outputPath
      )}`
    );
    return true;
  } catch (error) {
    stats.failed++;
    console.error(`✗ Failed: ${path.relative(DATA_IMAGES_DIR, pngPath)} - ${error.message}`);
    return false;
  }
}

/**
 * Update colors in database for a specific day
 */
async function updateDayColors(pool, trecenaId, dayNumber, dayColors) {
  const query = `
    UPDATE days
    SET colors = $1, updated_at = NOW()
    WHERE trecena_id = $2 AND day = $3
  `;

  await pool.query(query, [JSON.stringify(dayColors), trecenaId, dayNumber]);
}

/**
 * Process all PNG files in a directory recursively
 */
async function processDirectory(dirPath, trecenaName, dayNumber, pool, trecenaId) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      await processDirectory(fullPath, trecenaName, dayNumber, pool, trecenaId);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      // Process PNG files
      const basename = path.basename(entry.name, '.png');
      const outputDir = path.join(API_DIR, trecenaName, dayNumber.toString());
      const outputPath = path.join(outputDir, `${basename}.webp`);

      // Ensure output directory exists
      fs.mkdirSync(outputDir, { recursive: true });

      // Extract colors if this is one of the image types we care about
      // Extract if: (1) WebP doesn't exist (needed for WebP), OR (2) JPEG needs to be generated and colors aren't in cache
      let extractedColors = null;
      const webpExists = fs.existsSync(outputPath);
      const needsJPEG = shouldGenerateJPEG(basename);
      const jpegOutputPath = needsJPEG ? path.join(outputDir, `${basename}.jpg`) : null;
      const jpegExists = jpegOutputPath ? fs.existsSync(jpegOutputPath) : true;
      
      // Check if we need colors from cache/db first (for JPEG generation)
      if (needsJPEG && !jpegExists && !extractedColors) {
        // Try to get colors from in-memory cache or database
        const dayColors = colors[trecenaName]?.[dayNumber];
        if (dayColors && dayColors[basename]) {
          // Reconstruct color array from stored colors (darkest to lightest)
          const colorData = dayColors[basename];
          extractedColors = [
            colorData.primary,
            colorData.secondary,
            colorData.accent,
          ].filter(Boolean);
        }
      }
      
      // Extract colors if needed (WebP doesn't exist OR JPEG needs colors and we don't have them)
      if (IMAGE_TYPES.includes(basename) && (!webpExists || (needsJPEG && !jpegExists && !extractedColors))) {
        extractedColors = await extractDominantColors(fullPath, 3);
        if (extractedColors && extractedColors.length >= 2) {
          // Initialize structure if needed
          if (!colors[trecenaName]) {
            colors[trecenaName] = {};
          }
          if (!colors[trecenaName][dayNumber]) {
            colors[trecenaName][dayNumber] = {};
          }

          // Store colors for this image type
          colors[trecenaName][dayNumber][basename] = {
            primary: extractedColors[0] || '#12091A', // Darkest color
            secondary: extractedColors[1] || extractedColors[0] || '#1C0F29',
            accent: extractedColors[2] || extractedColors[1] || extractedColors[0] || '#6E45CF',
          };

          stats.colorsExtracted++;
          const colorData = colors[trecenaName][dayNumber][basename];
          console.log(
            `  Colors: ${colorData.primary}, ${colorData.secondary}, ${colorData.accent}`
          );
        } else {
          stats.colorsFailed++;
          console.log(`  ⚠ Failed to extract colors from ${basename}`);
        }
      }

      // Convert to WebP (will skip if already exists)
      await convertImageToWebP(fullPath, outputPath);

      // Convert to JPEG with watermark if this image type requires it
      // JPEG generation is independent - it checks if jpg exists separately
      if (needsJPEG) {
        await convertImageToJPEG(fullPath, jpegOutputPath, extractedColors);
      }
    }
  }

  // Update colors in database after processing all images for this day
  if (colors[trecenaName]?.[dayNumber] && pool && trecenaId) {
    await updateDayColors(pool, trecenaId, dayNumber, colors[trecenaName][dayNumber]);
  }
}

/**
 * Normalize trecena name to database key format
 * Strips all non-letter characters and converts to lowercase
 */
function normalizeTrecenaName(trecenaName) {
  if (!trecenaName) return null;
  return trecenaName.replace(/[^a-zA-Z]/g, '').toLowerCase();
}

/**
 * Load trecena data from PostgreSQL database
 */
async function loadTrecenaData(pool, trecenaName) {
  try {
    const normalizedName = normalizeTrecenaName(trecenaName);

    // Get trecena metadata
    const trecenaQuery = `
      SELECT id, name, display_name, prologue, epilogue
      FROM trecenas
      WHERE name = $1
    `;
    const trecenaResult = await pool.query(trecenaQuery, [normalizedName]);

    if (trecenaResult.rows.length === 0) {
      return null;
    }

    const trecenaRow = trecenaResult.rows[0];

    // Get all days for this trecena (exclude image_prompts - not needed for API output)
    const daysQuery = `
      SELECT day, number, nawal, chapter, horoscope, affirmation, meditation,
             energy_of_the_day, birthday, colors
      FROM days
      WHERE trecena_id = $1
      ORDER BY day ASC
    `;
    const daysResult = await pool.query(daysQuery, [trecenaRow.id]);

    // Transform database rows to match original structure
    const days = daysResult.rows.map((row) => ({
      day: row.day,
      number: row.number,
      nawal: row.nawal,
      chapter: row.chapter || '',
      horoscope: row.horoscope || '',
      affirmation: row.affirmation || '',
      meditation: row.meditation || '',
      energy_of_the_day: row.energy_of_the_day || {},
      birthday: row.birthday || {},
    }));

    return {
      id: trecenaRow.id,
      trecena: trecenaRow.display_name,
      prologue: trecenaRow.prologue || '',
      epilogue: trecenaRow.epilogue || '',
      days: days,
    };
  } catch (error) {
    console.error(`Error loading trecena data for ${trecenaName}:`, error.message);
    return null;
  }
}

/**
 * Get colors for a day from database or in-memory cache
 */
async function getDayColors(pool, trecenaId, dayNumber, trecenaName) {
  // First check in-memory cache (from current processing)
  if (colors[trecenaName]?.[dayNumber]) {
    return colors[trecenaName][dayNumber];
  }

  // Fall back to database
  if (pool && trecenaId) {
    const query = `
      SELECT colors
      FROM days
      WHERE trecena_id = $1 AND day = $2
    `;
    const result = await pool.query(query, [trecenaId, dayNumber]);
    if (result.rows.length > 0 && result.rows[0].colors) {
      return result.rows[0].colors;
    }
  }

  return {};
}

/**
 * Reorder energy_of_the_day fields to: number, nawal, combined_energy
 * With consistent field order: title, content, keywords/notes
 */
function reorderEnergyOfTheDay(energyOfTheDay) {
  if (!energyOfTheDay || typeof energyOfTheDay !== 'object') {
    return energyOfTheDay;
  }

  const reordered = {};

  // number: title, content, keywords
  if (energyOfTheDay.number) {
    reordered.number = {
      title: energyOfTheDay.number.title || '',
      content: energyOfTheDay.number.content || '',
      keywords: energyOfTheDay.number.keywords || [],
    };
  }

  // nawal: title, content, keywords
  if (energyOfTheDay.nawal) {
    reordered.nawal = {
      title: energyOfTheDay.nawal.title || '',
      content: energyOfTheDay.nawal.content || '',
      keywords: energyOfTheDay.nawal.keywords || [],
    };
  }

  // combined_energy: title, content, notes
  if (energyOfTheDay.combined_energy) {
    reordered.combined_energy = {
      title: energyOfTheDay.combined_energy.title || '',
      content: energyOfTheDay.combined_energy.content || '',
      notes: energyOfTheDay.combined_energy.notes || [],
    };
  }

  return reordered;
}

/**
 * Transform trecena data to JSON format
 */
async function transformTrecenaData(trecenaData, trecenaName, pool) {
  if (!trecenaData) {
    return null;
  }

  const transformed = {
    trecena: trecenaData.trecena,
    prologue: trecenaData.prologue,
    epilogue: trecenaData.epilogue,
    days: await Promise.all(
      trecenaData.days.map(async (day) => {
        const dayColors = await getDayColors(pool, trecenaData.id, day.day, trecenaName);

        // Build colors object for this day
        const dayColorsObj = {};
        for (const imageType of IMAGE_TYPES) {
          if (dayColors[imageType]) {
            dayColorsObj[imageType] = dayColors[imageType];
          }
        }

        return {
          day: day.day,
          number: day.number,
          nawal: day.nawal,
          chapter: day.chapter,
          energy_of_the_day: reorderEnergyOfTheDay(day.energy_of_the_day),
          horoscope: day.horoscope,
          affirmation: day.affirmation,
          meditation: day.meditation,
          birthday: day.birthday,
          colors: dayColorsObj,
        };
      })
    ),
  };

  return transformed;
}

/**
 * Main function
 */
async function main() {
  console.log('Starting data generation...\n');
  console.log(`Source images: ${DATA_IMAGES_DIR}`);
  console.log(`Output directory: ${API_DIR}\n`);

  // Initialize database connection
  const pool = getPool();

  try {
    // Get all trecenas from database
    const trecenasQuery = `
      SELECT id, name, display_name
      FROM trecenas
      ORDER BY name ASC
    `;
    const trecenasResult = await pool.query(trecenasQuery);

    if (trecenasResult.rows.length === 0) {
      console.log('No trecenas found in database.');
      console.log('Please run scripts/migrate-to-database.js first to import data.');
      return;
    }

    console.log(`Found ${trecenasResult.rows.length} trecena(s) in database:`);
    trecenasResult.rows.forEach((row) => {
      console.log(`  - ${row.display_name} (${row.name})`);
    });
    console.log('');

    // Ensure API directory exists (don't delete - preserve existing converted images)
    fs.mkdirSync(API_DIR, { recursive: true });

    // Process each trecena
    for (const trecenaRow of trecenasResult.rows) {
      const trecenaName = `trecena-${trecenaRow.name}`;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing ${trecenaName}...`);
      console.log('='.repeat(60));

      // Create API folder structure for this trecena
      const trecenaApiDir = path.join(API_DIR, trecenaName);
      fs.mkdirSync(trecenaApiDir, { recursive: true });

      // Create 13 day folders
      for (let day = 1; day <= 13; day++) {
        const dayDir = path.join(trecenaApiDir, day.toString());
        fs.mkdirSync(dayDir, { recursive: true });
      }

      // Process images if they exist
      const trecenaImageFolder = path.join(DATA_IMAGES_DIR, trecenaName);
      if (fs.existsSync(trecenaImageFolder)) {
        console.log(`\nFound images folder, processing images...`);
        const dayFolders = fs
          .readdirSync(trecenaImageFolder, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => path.join(trecenaImageFolder, entry.name));

        for (const dayFolder of dayFolders) {
          const dayNumber = parseInt(path.basename(dayFolder));
          if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 13) {
            console.log(`⚠ Skipping invalid day folder: ${path.basename(dayFolder)}`);
            continue;
          }

          console.log(`\nProcessing day ${dayNumber} images...`);
          await processDirectory(dayFolder, trecenaName, dayNumber, pool, trecenaRow.id);
        }
      } else {
        console.log(`\nNo images folder found for ${trecenaName}, skipping image processing`);
      }

      // Load trecena data and generate JSON
      console.log(`\nGenerating data.json for ${trecenaName}...`);
      const trecenaData = await loadTrecenaData(pool, trecenaRow.display_name);

      if (!trecenaData) {
        console.log(`⚠ Skipping ${trecenaName} - data could not be loaded from database`);
        continue;
      }

      const transformedData = await transformTrecenaData(trecenaData, trecenaName, pool);
      if (transformedData) {
        const jsonPath = path.join(trecenaApiDir, 'data.json');
        fs.writeFileSync(jsonPath, JSON.stringify(transformedData, null, 2));
        console.log(`✓ Created ${jsonPath}`);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('Generation Summary:');
    console.log('='.repeat(60));
    console.log(`  ✓ Images converted: ${stats.converted}`);
    console.log(`  ⊘ Images skipped (already exists): ${stats.skipped}`);
    console.log(`  ✗ Images failed: ${stats.failed}`);
    console.log(`  ✓ JPEG converted: ${stats.jpegConverted}`);
    console.log(`  ⊘ JPEG skipped (already exists): ${stats.jpegSkipped}`);
    console.log(`  ✗ JPEG failed: ${stats.jpegFailed}`);
    console.log(`  ✓ Colors extracted: ${stats.colorsExtracted}`);
    console.log(`  ✗ Colors failed: ${stats.colorsFailed}`);
    console.log('='.repeat(60));

    if (stats.failed > 0) {
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
