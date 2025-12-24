#!/usr/bin/env node

/**
 * Upload specific trecena directories to Cloudflare R2
 * Usage: node scripts/upload-specific-trecenas.js trecena-iq trecena-tzikin
 */

const fs = require('fs');
const path = require('path');
const {
  CDN_DIR,
  ensureWrangler,
  checkLogin,
  promptLogin,
  getAllFiles,
  getRelativePath,
  uploadFile,
} = require('./r2-upload-helpers');

/**
 * Main upload function
 */
async function main() {
  // Get trecena names from command line args
  const trecenaNames = process.argv.slice(2);
  
  if (trecenaNames.length === 0) {
    console.error('Usage: node scripts/upload-specific-trecenas.js <trecena1> <trecena2> ...');
    console.error('Example: node scripts/upload-specific-trecenas.js trecena-iq trecena-tzikin');
    process.exit(1);
  }

  console.log('🚀 Cloudflare R2 Upload Script (Specific Trecenas)\n');
  console.log('Bucket: 13daystories-assets');
  console.log(`Source: ${CDN_DIR}`);
  console.log(`Trecenas: ${trecenaNames.join(', ')}\n`);

  // Check if cdn directory exists
  if (!fs.existsSync(CDN_DIR)) {
    console.error(`✗ CDN directory not found: ${CDN_DIR}`);
    process.exit(1);
  }

  // Ensure wrangler is installed
  const wranglerInstalled = await ensureWrangler();
  if (!wranglerInstalled) {
    process.exit(1);
  }

  // Check login status
  if (!checkLogin()) {
    console.log('⚠ Not logged in to Cloudflare');
    const loggedIn = await promptLogin();
    if (!loggedIn) {
      process.exit(1);
    }
  } else {
    console.log('✓ Logged in to Cloudflare');
  }

  // Get all files and filter for specified trecenas
  console.log('\n📁 Scanning files...');
  let allFiles = getAllFiles(CDN_DIR);
  
  const originalCount = allFiles.length;
  allFiles = allFiles.filter((file) => {
    const relativePath = path.relative(CDN_DIR, file).replace(/\\/g, '/');
    return trecenaNames.some(trecena => relativePath.startsWith(trecena + '/'));
  });
  
  console.log(`Found ${allFiles.length} files to upload (from ${originalCount} total)\n`);

  if (allFiles.length === 0) {
    console.log('No files found for the specified trecenas');
    process.exit(0);
  }

  // Upload files
  console.log('📤 Uploading files...\n');
  let successCount = 0;
  let failCount = 0;
  const failedFiles = [];

  // Test upload first file to verify it works
  if (allFiles.length > 0) {
    const testFile = allFiles[0];
    const testRelativePath = getRelativePath(testFile);
    console.log(`🧪 Testing upload with first file: ${testRelativePath}`);
    const testResult = await uploadFile(testFile);
    if (testResult.success) {
      console.log(`✓ Test upload succeeded for ${testRelativePath}`);
      console.log('   Continuing with all files...\n');
    } else {
      console.log(`✗ Test upload FAILED for ${testRelativePath}`);
      console.log(`   Error: ${testResult.error}`);
      console.log('\n⚠️  Stopping - fix the upload issue before continuing');
      process.exit(1);
    }
  }

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const relativePath = getRelativePath(file);
    const progress = `[${i + 1}/${allFiles.length}]`;

    process.stdout.write(`${progress} ${relativePath}... `);

    const result = await uploadFile(file);
    if (result.success) {
      console.log('✓');
      successCount++;
    } else {
      console.log('✗');
      console.error(`  Error: ${result.error}`);
      failCount++;
      failedFiles.push(relativePath);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Upload Summary:');
  console.log('='.repeat(60));
  console.log(`✓ Successfully uploaded: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);

  if (failedFiles.length > 0) {
    console.log('\nFailed files:');
    failedFiles.forEach((file) => console.log(`  - ${file}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Note: Cache headers are set via Cloudflare Cache Rules.');
  console.log('='.repeat(60));

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

