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
  // Block images-hd folder - high-res source images, not used in app
  /images-hd\/.*/,
  // Block database folder - PostgreSQL connection code only used in build scripts
  /database\/.*/,
];

// Optimize bundle size
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    // Remove console statements in production
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
    },
  },
};

module.exports = config;
