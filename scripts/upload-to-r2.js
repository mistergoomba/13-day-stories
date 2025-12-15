#!/usr/bin/env node

/**
 * Upload CDN assets to Cloudflare R2
 * Uploads all files from /cdn directory to R2 bucket root
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
  console.log('🚀 Cloudflare R2 Upload Script\n');
  console.log('Bucket: 13daystories-assets');
  console.log(`Source: ${CDN_DIR}\n`);

  // Check if cdn directory exists
  if (!fs.existsSync(CDN_DIR)) {
    console.error(`✗ CDN directory not found: ${CDN_DIR}`);
    console.error('Please run "npm run generate:data" first to create assets');
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

  // Get all files
  console.log('\n📁 Scanning files...');
  let allFiles = getAllFiles(CDN_DIR);

  // TESTING HACK: Only upload trecena-ajpu for testing
  // TODO: Remove this filter when uploads are working correctly
  const TEST_MODE = false; // Set to false to upload all files
  const TEST_TRECENA = 'trecena-ajpu';

  if (TEST_MODE) {
    const originalCount = allFiles.length;
    allFiles = allFiles.filter((file) => {
      const relativePath = path.relative(CDN_DIR, file).replace(/\\/g, '/');
      return relativePath.startsWith(TEST_TRECENA + '/');
    });
    console.log(
      `⚠️  TEST MODE: Only uploading ${TEST_TRECENA} (${allFiles.length} of ${originalCount} files)\n`
    );
  }

  console.log(`Found ${allFiles.length} files to upload\n`);

  if (allFiles.length === 0) {
    console.log('No files to upload');
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
  console.log('Make sure you have configured cache rules in Cloudflare dashboard.');
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
