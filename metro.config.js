const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure TTF and other font files are handled as assets
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

// Exclude development-only folders from bundling
// These folders should never be included in the app bundle
config.resolver.blockList = [
  // Block the cdn folder at project root - assets are served from cdn.13daystories.com
  /cdn\/.*/,
  // Block the public/cdn symlink folder (used for dev mode)
  /public\/cdn\/.*/,
  // Block images-hd folder - high-res source images, not used in app
  /images-hd\/.*/,
  // Block database folder - PostgreSQL connection code only used in build scripts
  /database\/.*/,
];

// Configure server to serve static files from public directory
config.server = config.server || {};
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // Serve static files from public/cdn directory (symlinked in dev mode)
    if (req.url.startsWith('/cdn/')) {
      const fs = require('fs');
      const publicPath = path.join(__dirname, 'public', req.url);
      
      // Check if file exists
      if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
        const ext = path.extname(publicPath).toLowerCase();
        const mimeTypes = {
          '.json': 'application/json',
          '.webp': 'image/webp',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
        };
        
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        
        const fileContent = fs.readFileSync(publicPath);
        res.end(fileContent);
        return;
      }
    }
    
    // Continue with normal middleware
    return middleware(req, res, next);
  };
};

module.exports = config;

