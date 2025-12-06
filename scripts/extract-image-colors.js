#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

/**
 * Extract dominant colors from an image using k-means clustering
 * Returns an array of color objects with hex values
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
    const width = info.width;
    const height = info.height;

    // Extract RGB values from pixel data
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      pixels.push({ r, g, b });
    }

    // Simple k-means clustering to find dominant colors
    const colors = kMeansClustering(pixels, numColors);

    // Convert to hex and sort by frequency/brightness
    const hexColors = colors.map((color) => {
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
 * Image types to extract colors from
 */
const IMAGE_TYPES = ['horoscope', 'affirmation', 'story_primary', 'birthday'];

/**
 * Find all images of specified types in trecena folders
 */
function findImages() {
  const images = [];
  const entries = fs.readdirSync(ASSETS_DIR, { withFileTypes: true });
  const trecenaFolders = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('trecena-'))
    .map((entry) => path.join(ASSETS_DIR, entry.name));

  for (const trecenaFolder of trecenaFolders) {
    const dayFolders = fs
      .readdirSync(trecenaFolder, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(trecenaFolder, entry.name));

    for (const dayFolder of dayFolders) {
      const trecenaName = path.basename(trecenaFolder);
      const dayNumber = parseInt(path.basename(dayFolder));

      // Check for each image type
      for (const imageType of IMAGE_TYPES) {
        const imagePath = path.join(dayFolder, `${imageType}.webp`);
        if (fs.existsSync(imagePath)) {
          images.push({
            path: imagePath,
            trecena: trecenaName,
            day: dayNumber,
            imageType: imageType,
          });
        }
      }
    }
  }

  return images;
}

/**
 * Main function
 */
async function main() {
  console.log('Extracting colors from images...\n');
  console.log(`Image types: ${IMAGE_TYPES.join(', ')}\n`);

  const images = findImages();
  console.log(`Found ${images.length} images total\n`);

  // Structure: groupedResults[trecena][day][imageType] = { primary, secondary, accent }
  const groupedResults = {};

  for (const image of images) {
    console.log(`Processing ${image.trecena}/day-${image.day}/${image.imageType}...`);
    const colors = await extractDominantColors(image.path, 3);

    if (colors && colors.length >= 2) {
      // Initialize structure if needed
      if (!groupedResults[image.trecena]) {
        groupedResults[image.trecena] = {};
      }
      if (!groupedResults[image.trecena][image.day]) {
        groupedResults[image.trecena][image.day] = {};
      }

      // Store colors for this image type
      groupedResults[image.trecena][image.day][image.imageType] = {
        primary: colors[0] || '#12091A', // Darkest color
        secondary: colors[1] || colors[0] || '#1C0F29',
        accent: colors[2] || colors[1] || colors[0] || '#6E45CF',
      };

      const colorData = groupedResults[image.trecena][image.day][image.imageType];
      console.log(`  ✓ Primary: ${colorData.primary}`);
      console.log(`    Secondary: ${colorData.secondary}`);
      console.log(`    Accent: ${colorData.accent}`);
    } else {
      console.log(`  ✗ Failed to extract colors`);
    }
  }

  // Output JSON file
  const outputPath = path.join(__dirname, '..', 'data', 'image-colors.json');
  fs.writeFileSync(outputPath, JSON.stringify(groupedResults, null, 2));
  console.log(`\n✓ Color data saved to ${outputPath}`);

  // Also output a formatted summary for manual review
  console.log('\n' + '='.repeat(60));
  console.log('Color Extraction Summary:');
  console.log('='.repeat(60));
  for (const trecena in groupedResults) {
    console.log(`\n${trecena}:`);
    const days = Object.keys(groupedResults[trecena])
      .map(Number)
      .sort((a, b) => a - b);
    for (const day of days) {
      const dayData = groupedResults[trecena][day];
      console.log(`  Day ${day}:`);
      for (const imageType of IMAGE_TYPES) {
        if (dayData[imageType]) {
          const colors = dayData[imageType];
          console.log(`    ${imageType}:`);
          console.log(`      primary: '${colors.primary}',`);
          console.log(`      secondary: '${colors.secondary}',`);
          console.log(`      accent: '${colors.accent}',`);
        }
      }
    }
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
