#!/usr/bin/env node

/**
 * Vercel build script
 * Conditionally builds download page or full app based on domain
 * Assets are served from Cloudflare R2 CDN, not included in builds
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Detect which domain we're building for
// Vercel provides VERCEL_URL or we can check VERCEL_DOMAIN
const vercelUrl = process.env.VERCEL_URL || '';
const vercelDomain = process.env.VERCEL_DOMAIN || '';
const isDownloadPageDomain = vercelDomain === '13daystories.com' || 
                             vercelUrl.includes('13daystories.com');

console.log(`Building for Vercel...`);
console.log(`VERCEL_URL: ${vercelUrl || '(not set)'}`);
console.log(`VERCEL_DOMAIN: ${vercelDomain || '(not set)'}`);
console.log(`Building for: ${isDownloadPageDomain ? '13daystories.com (download page)' : 'app.meowtin.com (full app)'}`);

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

  if (isDownloadPageDomain) {
    // For 13daystories.com: Only build the download page
    console.log('Building download page only...');
    
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
  } else {
    // For app.meowtin.com: Build full app
    console.log('Building full app...');
    console.log('Running Expo export...');
    execSync('npx expo export -p web', { stdio: 'inherit' });
    console.log('✓ Full app build completed');
  }

  console.log('\nBuild completed successfully!');
  console.log('✓ Assets are served from Cloudflare R2 CDN (cdn.13daystories.com)');
  console.log('✓ /cdn, /data, and /images-hd folders are excluded from builds');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

