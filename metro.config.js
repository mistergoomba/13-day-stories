const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure TTF and other font files are handled as assets
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

// Configure server to serve static files from public directory
config.server = config.server || {};
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // Serve static files from public directory
    if (req.url.startsWith('/assets/api/')) {
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

