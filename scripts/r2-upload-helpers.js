#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CDN_DIR = path.join(__dirname, '..', 'cdn');
const BUCKET_NAME = '13daystories-assets';

// Cache control headers (kept here for future use)
const CACHE_HEADERS = {
  '.webp': 'public, max-age=22464000', // 260 days
  '.jpg': 'public, max-age=22464000', // 260 days
  '.jpeg': 'public, max-age=22464000', // 260 days
  '.json': 'public, max-age=86400', // 1 day
};

// Content types
const CONTENT_TYPES = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json',
};

function checkWrangler() {
  try {
    execSync('wrangler --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

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

function checkLogin() {
  try {
    execSync('wrangler whoami', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

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

function getRelativePath(filePath) {
  return path.relative(CDN_DIR, filePath).replace(/\\/g, '/');
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

function getCacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CACHE_HEADERS[ext] || 'public, max-age=3600';
}

async function uploadFile(filePath) {
  const relativePath = getRelativePath(filePath);
  const contentType = getContentType(filePath);

  // Wrangler expects: wrangler r2 object put <bucket>/<object-key> --file <file>
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
    '--env',
    'production',
    '--remote',
  ];

  try {
    return new Promise((resolve) => {
      const child = spawn('wrangler', args, {
        stdio: ['ignore', 'pipe', 'pipe'],
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

        // Debug: log the actual output for troubleshooting
        if (process.env.DEBUG_UPLOAD) {
          console.log(`\n[DEBUG] Upload result for ${relativePath}:`);
          console.log(`  Exit code: ${code}`);
          console.log(`  Stdout: ${stdout}`);
          console.log(`  Stderr: ${stderr}`);
          console.log(`  All output: ${allOutput}`);
        }

        // More strict success detection
        const successIndicators = [
          'Upload complete',
          'Creating object',
          'uploaded successfully',
          'successfully uploaded',
        ];
        
        const hasSuccessIndicator = successIndicators.some((indicator) =>
          allOutput.toLowerCase().includes(indicator.toLowerCase())
        );

        if (hasSuccessIndicator && code === 0) {
          resolve({ success: true, path: relativePath });
        } else if (code === 0 && !allOutput) {
          // Exit code 0 with no output might be success, but log it
          if (process.env.DEBUG_UPLOAD) {
            console.log(`  Warning: Exit code 0 but no output - treating as success`);
          }
          resolve({ success: true, path: relativePath });
        } else {
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

module.exports = {
  CDN_DIR,
  BUCKET_NAME,
  ensureWrangler,
  checkLogin,
  promptLogin,
  getAllFiles,
  getRelativePath,
  getContentType,
  getCacheControl,
  uploadFile,
};
