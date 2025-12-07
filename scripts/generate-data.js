#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DATA_IMAGES_DIR = path.join(__dirname, '..', 'data', 'images-hd');
const API_DIR = path.join(__dirname, '..', 'assets', 'api');
const DATA_DIR = path.join(__dirname, '..', 'data');
const TARGET_WIDTH = 800;
const WEBP_QUALITY = 85;

// Wide images that should be resized to 800px width (maintaining aspect ratio)
const WIDE_IMAGES = ['story_wide_1', 'story_wide_2'];

// Image types to extract colors from
const IMAGE_TYPES = ['horoscope', 'affirmation', 'story_primary', 'birthday'];

// Statistics
const stats = {
  converted: 0,
  failed: 0,
  colorsExtracted: 0,
  colorsFailed: 0,
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
 * Convert a PNG file to WebP and extract colors
 */
async function convertImageToWebP(pngPath, outputPath) {
  try {
    const image = sharp(pngPath);
    const metadata = await image.metadata();

    let resizeOptions;

    if (isWideImage(pngPath)) {
      // Wide images: resize to 800px width, maintain aspect ratio
      resizeOptions = {
        width: TARGET_WIDTH,
        height: undefined, // Let sharp calculate based on aspect ratio
        fit: 'inside',
      };
    } else {
      // Square images: resize to 800x800
      resizeOptions = {
        width: TARGET_WIDTH,
        height: TARGET_WIDTH,
        fit: 'cover', // Cover ensures square, may crop if not perfectly square
      };
    }

    await image.resize(resizeOptions).webp({ quality: WEBP_QUALITY }).toFile(outputPath);

    stats.converted++;
    console.log(`✓ Converted: ${path.relative(DATA_IMAGES_DIR, pngPath)} → ${path.relative(API_DIR, outputPath)}`);
    return true;
  } catch (error) {
    stats.failed++;
    console.error(`✗ Failed: ${path.relative(DATA_IMAGES_DIR, pngPath)} - ${error.message}`);
    return false;
  }
}

/**
 * Process all PNG files in a directory recursively
 */
async function processDirectory(dirPath, trecenaName, dayNumber) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      await processDirectory(fullPath, trecenaName, dayNumber);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      // Process PNG files
      const basename = path.basename(entry.name, '.png');
      const outputDir = path.join(API_DIR, trecenaName, dayNumber.toString());
      const outputPath = path.join(outputDir, `${basename}.webp`);

      // Ensure output directory exists
      fs.mkdirSync(outputDir, { recursive: true });

      // Extract colors if this is one of the image types we care about
      if (IMAGE_TYPES.includes(basename)) {
        const extractedColors = await extractDominantColors(fullPath, 3);
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
          console.log(`  Colors: ${colorData.primary}, ${colorData.secondary}, ${colorData.accent}`);
        } else {
          stats.colorsFailed++;
          console.log(`  ⚠ Failed to extract colors from ${basename}`);
        }
      }

      // Convert to WebP
      await convertImageToWebP(fullPath, outputPath);
    }
  }
}

/**
 * Load trecena data from JS module
 */
async function loadTrecenaData(trecenaName) {
  try {
    const modulePath = path.join(DATA_DIR, `trecena-${trecenaName}.js`);
    
    if (!fs.existsSync(modulePath)) {
      return null;
    }

    // Dynamic import of ES module
    const fileUrl = `file://${modulePath}`;
    const module = await import(fileUrl);
    
    // Find the exported trecena object (pattern: {name}Trecena)
    const exportName = `${trecenaName}Trecena`;
    const trecenaData = module[exportName] || module.default || Object.values(module)[0];
    
    return trecenaData;
  } catch (error) {
    console.error(`Error loading trecena data for ${trecenaName}:`, error.message);
    return null;
  }
}

/**
 * Transform trecena data to JSON format
 */
function transformTrecenaData(trecenaData, trecenaName) {
  if (!trecenaData) {
    return null;
  }

  const transformed = {
    trecena: trecenaData.trecena,
    prologue: trecenaData.prologue,
    epilogue: trecenaData.epilogue,
    days: trecenaData.days.map((day) => {
      const dayColors = colors[trecenaName]?.[day.day] || {};
      
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
        energy_of_the_day: day.energy_of_the_day,
        horoscope: day.horoscope,
        affirmation: day.affirmation,
        meditation: day.meditation,
        birthday: day.birthday,
        colors: dayColorsObj,
      };
    }),
  };

  return transformed;
}

/**
 * Main function
 */
async function main() {
  console.log('Starting data generation...\n');
  console.log(`Source images: ${DATA_IMAGES_DIR}`);
  console.log(`Data modules: ${DATA_DIR}`);
  console.log(`Output directory: ${API_DIR}\n`);

  // Clear and recreate API directory
  if (fs.existsSync(API_DIR)) {
    console.log('Clearing existing API directory...');
    fs.rmSync(API_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(API_DIR, { recursive: true });

  // Find all trecena-*.js files in data directory
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Error: Data directory does not exist: ${DATA_DIR}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
  const trecenaModules = entries
    .filter((entry) => entry.isFile() && entry.name.startsWith('trecena-') && entry.name.endsWith('.js'))
    .map((entry) => {
      // Extract trecena name from filename (e.g., "trecena-aqabal.js" -> "aqabal")
      const name = entry.name.replace('trecena-', '').replace('.js', '');
      return { name, filename: entry.name };
    });

  if (trecenaModules.length === 0) {
    console.log('No trecena-*.js files found in data directory.');
    return;
  }

  console.log(`Found ${trecenaModules.length} trecena module(s):`);
  trecenaModules.forEach((module) => {
    console.log(`  - ${module.filename}`);
  });
  console.log('');

  // Process each trecena module
  for (const { name: trecenaKey, filename } of trecenaModules) {
    const trecenaName = `trecena-${trecenaKey}`;
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
        await processDirectory(dayFolder, trecenaName, dayNumber);
      }
    } else {
      console.log(`\nNo images folder found for ${trecenaName}, skipping image processing`);
    }

    // Load trecena data and generate JSON
    console.log(`\nGenerating data.json for ${trecenaName}...`);
    const trecenaData = await loadTrecenaData(trecenaKey);

    if (!trecenaData) {
      console.log(`⚠ Skipping ${trecenaName} - data file could not be loaded`);
      continue;
    }

    const transformedData = transformTrecenaData(trecenaData, trecenaName);
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
  console.log(`  ✗ Images failed: ${stats.failed}`);
  console.log(`  ✓ Colors extracted: ${stats.colorsExtracted}`);
  console.log(`  ✗ Colors failed: ${stats.colorsFailed}`);
  console.log('='.repeat(60));

  if (stats.failed > 0) {
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

