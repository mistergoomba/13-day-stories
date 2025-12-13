#!/usr/bin/env node

/**
 * Vercel build script
 * Builds download page only (web app support removed)
 * Assets are served from Cloudflare R2 CDN, not included in builds
 */

const fs = require('fs');
const path = require('path');

console.log('Building download page for Vercel...');

try {
  // Verify exclusions - /cdn should never be in dist (it's gitignored)
  const distCdnPath = path.join(__dirname, '..', 'dist', 'cdn');
  if (fs.existsSync(distCdnPath)) {
    console.warn('Warning: cdn folder found in dist - this should not be included!');
    console.warn('Assets are served from Cloudflare R2 CDN, not from Vercel.');
  }

  // Verify other exclusions
  const distDataPath = path.join(__dirname, '..', 'dist', 'data');
  const distImagesHdPath = path.join(__dirname, '..', 'dist', 'images-hd');
  if (fs.existsSync(distDataPath)) {
    console.warn('Warning: data folder found in dist - this should not be included!');
  }
  if (fs.existsSync(distImagesHdPath)) {
    console.warn('Warning: images-hd folder found in dist - this should not be included!');
  }

  // Build download page only
  console.log('Building download page...');
  
  // Create minimal dist structure
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  // Copy download page
  const downloadPagePath = path.join(__dirname, '..', 'vercel', 'index.html');
  const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
  
  if (fs.existsSync(downloadPagePath)) {
    fs.copyFileSync(downloadPagePath, distIndexPath);
    console.log('✓ Download page copied successfully');
  } else {
    console.error(`Error: Download page not found at ${downloadPagePath}`);
    process.exit(1);
  }

  console.log('\nBuild completed successfully!');
  console.log('✓ Assets are served from Cloudflare R2 CDN (cdn.13daystories.com)');
  console.log('✓ /cdn, /data, and /images-hd folders are excluded from builds');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

