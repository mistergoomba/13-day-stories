#!/usr/bin/env node

/**
 * Upload CDN assets to Cloudflare R2
 * Uploads all files from /cdn directory to R2 bucket root
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CDN_DIR = path.join(__dirname, '..', 'cdn');
const BUCKET_NAME = '13daystories-assets';

// Cache control headers
const CACHE_HEADERS = {
  '.webp': 'public, max-age=22464000', // 260 days
  '.jpg': 'public, max-age=22464000',   // 260 days
  '.jpeg': 'public, max-age=22464000',  // 260 days
  '.json': 'public, max-age=86400',     // 1 day
};

// Content types
const CONTENT_TYPES = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json',
};

/**
 * Check if wrangler is installed
 */
function checkWrangler() {
  try {
    execSync('wrangler --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Install wrangler globally or prompt user
 */
async function ensureWrangler() {
  if (checkWrangler()) {
    console.log('✓ Wrangler is installed');
    return true;
  }

  console.log('⚠ Wrangler CLI not found');
  console.log('Installing wrangler...');
  
  try {
    execSync('npm install -g wrangler', { stdio: 'inherit' });
    console.log('✓ Wrangler installed successfully');
    return true;
  } catch (error) {
    console.error('✗ Failed to install wrangler');
    console.error('Please install manually: npm install -g wrangler');
    return false;
  }
}

/**
 * Check if user is logged in to Cloudflare
 */
function checkLogin() {
  try {
    execSync('wrangler whoami', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Prompt user to login
 */
async function promptLogin() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('You need to log in to Cloudflare. Open browser to login? (y/n): ', (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('Opening browser for Cloudflare login...');
        try {
          execSync('wrangler login', { stdio: 'inherit' });
          resolve(true);
        } catch (error) {
          console.error('✗ Login failed');
          resolve(false);
        }
      } else {
        console.log('Please run "wrangler login" manually and try again');
        resolve(false);
      }
    });
  });
}

/**
 * Get all files recursively from a directory
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Get relative path from cdn directory
 */
function getRelativePath(filePath) {
  return path.relative(CDN_DIR, filePath).replace(/\\/g, '/'); // Use forward slashes
}

/**
 * Get content type for file
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

/**
 * Get cache control header for file
 */
function getCacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CACHE_HEADERS[ext] || 'public, max-age=3600';
}

/**
 * Upload a single file to R2
 */
async function uploadFile(filePath) {
  const relativePath = getRelativePath(filePath);
  const contentType = getContentType(filePath);

  // Wrangler command format: wrangler r2 object put {bucket}/{key} --file <file-path> --remote
  // The object path must include the bucket name
  // --remote flag ensures uploads go to the actual R2 bucket, not local storage
  const objectPath = `${BUCKET_NAME}/${relativePath}`;
  
  const args = [
    'r2',
    'object',
    'put',
    objectPath,
    '--file',
    filePath,
    '--content-type',
    contentType,
    '--remote', // Upload to remote R2 bucket, not local storage
  ];

  try {
    // Wrangler outputs to stderr, so we need to capture both stdout and stderr
    // Use spawn-like approach or capture stderr properly
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
      const child = spawn('wrangler', args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        const allOutput = (stdout + stderr).trim();
        
        // Check for success indicators
        if (allOutput.includes('Upload complete') || allOutput.includes('Creating object')) {
          resolve({ success: true, path: relativePath });
        } else if (code === 0 && allOutput) {
          // Exit code 0 but no success message - might still be success
          resolve({ success: true, path: relativePath });
        } else {
          // Failure
          const errorMsg = allOutput || `Process exited with code ${code}`;
          resolve({ success: false, path: relativePath, error: errorMsg });
        }
      });
      
      child.on('error', (error) => {
        resolve({ success: false, path: relativePath, error: error.message });
      });
    });
  } catch (error) {
    return { success: false, path: relativePath, error: error.message };
  }
}

/**
 * Main upload function
 */
async function main() {
  console.log('🚀 Cloudflare R2 Upload Script\n');
  console.log(`Bucket: ${BUCKET_NAME}`);
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
    allFiles = allFiles.filter(file => {
      const relativePath = path.relative(CDN_DIR, file).replace(/\\/g, '/');
      return relativePath.startsWith(TEST_TRECENA + '/');
    });
    console.log(`⚠️  TEST MODE: Only uploading ${TEST_TRECENA} (${allFiles.length} of ${originalCount} files)\n`);
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

