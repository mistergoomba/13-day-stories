#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const TARGET_WIDTH = 800;
const WEBP_QUALITY = 85;

// Wide images that should be resized to 800px width (maintaining aspect ratio)
const WIDE_IMAGES = ['story_wide_1', 'story_wide_2'];

// Statistics
const stats = {
  converted: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

/**
 * Check if a filename is a wide image
 */
function isWideImage(filename) {
  const basename = path.basename(filename, path.extname(filename));
  return WIDE_IMAGES.includes(basename);
}

/**
 * Convert a PNG file to WebP
 */
async function convertImageToWebP(pngPath) {
  const dir = path.dirname(pngPath);
  const basename = path.basename(pngPath, '.png');
  const webpPath = path.join(dir, `${basename}.webp`);

  try {
    const image = sharp(pngPath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

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

    await image
      .resize(resizeOptions)
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    // Delete the original PNG file
    fs.unlinkSync(pngPath);

    stats.converted++;
    console.log(`✓ Converted: ${path.relative(ASSETS_DIR, pngPath)} → ${path.relative(ASSETS_DIR, webpPath)}`);
    return true;
  } catch (error) {
    stats.failed++;
    stats.errors.push({ file: pngPath, error: error.message });
    console.error(`✗ Failed: ${path.relative(ASSETS_DIR, pngPath)} - ${error.message}`);
    return false;
  }
}

/**
 * Process all PNG files in a directory
 */
async function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      await processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      // Process PNG files
      await convertImageToWebP(fullPath);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting PNG to WebP conversion...\n');
  console.log(`Assets directory: ${ASSETS_DIR}\n`);

  // Find all trecena-* folders
  const entries = fs.readdirSync(ASSETS_DIR, { withFileTypes: true });
  const trecenaFolders = entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith('trecena-'))
    .map(entry => path.join(ASSETS_DIR, entry.name));

  if (trecenaFolders.length === 0) {
    console.log('No trecena-* folders found in assets directory.');
    return;
  }

  console.log(`Found ${trecenaFolders.length} trecena folder(s):`);
  trecenaFolders.forEach(folder => {
    console.log(`  - ${path.basename(folder)}`);
  });
  console.log('');

  // Process each trecena folder
  for (const trecenaFolder of trecenaFolders) {
    console.log(`Processing ${path.basename(trecenaFolder)}...`);
    await processDirectory(trecenaFolder);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Conversion Summary:');
  console.log(`  ✓ Converted: ${stats.converted}`);
  console.log(`  ✗ Failed: ${stats.failed}`);
  console.log(`  ⊘ Skipped: ${stats.skipped}`);
  console.log('='.repeat(60));

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${path.relative(ASSETS_DIR, file)}: ${error}`);
    });
  }

  if (stats.failed > 0) {
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

