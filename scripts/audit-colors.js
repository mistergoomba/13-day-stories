#!/usr/bin/env node

/**
 * Audit and rebuild color schemes from existing WebP files
 * Reads all WebP files in cdn/ directory and extracts colors,
 * then updates the database with complete color data
 */

const fs = require('fs');
const path = require('path');
const { normalizeTrecenaName } = require('../database/normalize');
const sharp = require('sharp');
const { getPool, closePool } = require('../database/connection');

const CDN_DIR = path.join(__dirname, '..', 'cdn');
const IMAGE_TYPES = ['horoscope', 'affirmation', 'story_primary', 'birthday'];

// Statistics
const stats = {
  processed: 0,
  extracted: 0,
  failed: 0,
  updated: 0,
};

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

const { normalizeTrecenaName } = require('../database/normalize');

/**
 * Process all WebP files in a trecena directory
 */
async function processTrecena(trecenaDir, pool) {
  const trecenaName = path.basename(trecenaDir);
  const normalizedName = normalizeTrecenaName(trecenaName.replace('trecena-', ''));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing ${trecenaName}...`);
  console.log('='.repeat(60));

  // Get trecena ID from database
  const trecenaQuery = `
    SELECT id, display_name
    FROM trecenas
    WHERE name = $1
  `;
  const trecenaResult = await pool.query(trecenaQuery, [normalizedName]);

  if (trecenaResult.rows.length === 0) {
    console.log(`⚠ Trecena '${normalizedName}' not found in database, skipping...`);
    return;
  }

  const trecenaId = trecenaResult.rows[0].id;
  const trecenaDisplayName = trecenaResult.rows[0].display_name;

  // Process each day directory (1-13)
  for (let dayNumber = 1; dayNumber <= 13; dayNumber++) {
    const dayDir = path.join(trecenaDir, dayNumber.toString());
    if (!fs.existsSync(dayDir)) {
      continue;
    }

    const dayColors = {};

    // Process each WebP file in the day directory
    const files = fs.readdirSync(dayDir);
    for (const file of files) {
      if (!file.toLowerCase().endsWith('.webp')) {
        continue;
      }

      const basename = path.basename(file, '.webp');
      if (!IMAGE_TYPES.includes(basename)) {
        continue;
      }

      const filePath = path.join(dayDir, file);
      stats.processed++;

      try {
        const extractedColors = await extractDominantColors(filePath, 3);
        if (extractedColors && extractedColors.length >= 2) {
          dayColors[basename] = {
            primary: extractedColors[0] || '#12091A',
            secondary: extractedColors[1] || extractedColors[0] || '#1C0F29',
            accent: extractedColors[2] || extractedColors[1] || extractedColors[0] || '#6E45CF',
          };
          stats.extracted++;
          console.log(
            `  Day ${dayNumber} ${basename}: ${dayColors[basename].primary}, ${dayColors[basename].secondary}, ${dayColors[basename].accent}`
          );
        } else {
          stats.failed++;
          console.log(`  ⚠ Failed to extract colors from day ${dayNumber} ${basename}`);
        }
      } catch (error) {
        stats.failed++;
        console.error(`  ✗ Error processing day ${dayNumber} ${basename}: ${error.message}`);
      }
    }

    // Update database with colors for this day
    if (Object.keys(dayColors).length > 0) {
      const updateQuery = `
        UPDATE days
        SET colors = $1, updated_at = NOW()
        WHERE trecena_id = $2 AND day = $3
      `;
      await pool.query(updateQuery, [JSON.stringify(dayColors), trecenaId, dayNumber]);
      stats.updated++;
      console.log(`  ✓ Updated colors for day ${dayNumber}`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🎨 Color Audit Script');
  console.log('='.repeat(60));
  console.log(`Scanning directory: ${CDN_DIR}\n`);

  if (!fs.existsSync(CDN_DIR)) {
    console.error(`✗ CDN directory not found: ${CDN_DIR}`);
    process.exit(1);
  }

  const pool = getPool();

  try {
    // Get all trecena directories
    const entries = fs.readdirSync(CDN_DIR, { withFileTypes: true });
    const trecenaDirs = entries
      .filter((entry) => entry.isDirectory() && entry.name.startsWith('trecena-'))
      .map((entry) => path.join(CDN_DIR, entry.name))
      .sort();

    if (trecenaDirs.length === 0) {
      console.log('No trecena directories found in CDN folder.');
      return;
    }

    console.log(`Found ${trecenaDirs.length} trecena(s) to process\n`);

    // Process each trecena
    for (const trecenaDir of trecenaDirs) {
      await processTrecena(trecenaDir, pool);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('Audit Summary:');
    console.log('='.repeat(60));
    console.log(`  ✓ Files processed: ${stats.processed}`);
    console.log(`  ✓ Colors extracted: ${stats.extracted}`);
    console.log(`  ✗ Colors failed: ${stats.failed}`);
    console.log(`  ✓ Days updated: ${stats.updated}`);
    console.log('='.repeat(60));
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

