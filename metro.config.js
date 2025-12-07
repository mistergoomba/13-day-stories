const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure TTF and other font files are handled as assets
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

module.exports = config;

