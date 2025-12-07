#!/usr/bin/env node

/**
 * Vercel build script
 * Conditionally blocks web access in production based on config
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import the config (we need to read it as a module)
// Since this runs in Node.js, we'll read the file directly
const apiConfigPath = path.join(__dirname, '..', 'utils', 'apiConfig.js');
const apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');

// Extract BLOCK_WEB_IN_PRODUCTION value using regex
// This is a simple approach - we're looking for: export const BLOCK_WEB_IN_PRODUCTION = true/false;
const blockWebMatch = apiConfigContent.match(/export const BLOCK_WEB_IN_PRODUCTION = (true|false);/);
const BLOCK_WEB_IN_PRODUCTION = blockWebMatch ? blockWebMatch[1] === 'true' : false;

console.log(`Building for Vercel...`);
console.log(`BLOCK_WEB_IN_PRODUCTION: ${BLOCK_WEB_IN_PRODUCTION}`);

try {
  // Always run Expo export
  console.log('Running Expo export...');
  execSync('npx expo export -p web', { stdio: 'inherit' });

  // Conditionally copy download page
  if (BLOCK_WEB_IN_PRODUCTION) {
    console.log('Blocking web access - copying download page...');
    const downloadPagePath = path.join(__dirname, '..', 'vercel', 'index.html');
    const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
    
    if (fs.existsSync(downloadPagePath)) {
      fs.copyFileSync(downloadPagePath, distIndexPath);
      console.log('Download page copied successfully');
    } else {
      console.warn(`Warning: Download page not found at ${downloadPagePath}`);
    }
  } else {
    console.log('Web access enabled - using Expo-generated index.html');
  }

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

