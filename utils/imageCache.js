/**
 * Image Cache Utility
 * Caches images to disk with expiration:
 * - Regular images (webp): 1 hour
 * - Share images (jpg): 1 hour
 * - Birthday images (webp): 1 month
 */

import * as FileSystem from 'expo-file-system/legacy';

const CACHE_DIR = `${FileSystem.cacheDirectory}images/`;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Get file extension from URL or default to webp
 * @param {string} imageUrl - Image URL
 * @returns {string} File extension (webp or jpg)
 */
function getFileExtension(imageUrl) {
  if (imageUrl && imageUrl.endsWith('.jpg')) {
    return 'jpg';
  }
  return 'webp';
}

/**
 * Get cache key for an image
 * @param {string} trecenaKey - Normalized trecena key
 * @param {number} day - Day number (1-13)
 * @param {string} imageType - Image type
 * @param {string} extension - File extension (webp or jpg)
 * @returns {string} Cache key
 */
function getCacheKey(trecenaKey, day, imageType, extension = 'webp') {
  return `${trecenaKey}_${day}_${imageType}.${extension}`;
}

/**
 * Get cached image path
 * @param {string} cacheKey - Cache key
 * @returns {string} Full path to cached file
 */
function getCachedFilePath(cacheKey) {
  return `${CACHE_DIR}${cacheKey}`;
}

/**
 * Check if cache is valid based on file modification time and image type
 * @param {string} filePath - Path to cached file
 * @param {string} imageType - Image type
 * @returns {Promise<boolean>} True if cache is valid
 */
async function isCacheValid(filePath, imageType) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      return false;
    }

    // Check if file is within expiration time
    const fileModTime = fileInfo.modificationTime * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // File is valid if it was modified after (now - cache duration)
    // i.e., if it's newer than the expiry threshold
    const cacheDuration = imageType === 'birthday' ? ONE_MONTH_MS : ONE_HOUR_MS;
    const minModTime = now - cacheDuration;
    
    return fileModTime >= minModTime;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Error ensuring cache directory:', error);
  }
}

/**
 * Get cached image path if valid, otherwise return null
 * @param {string} trecenaKey - Normalized trecena key
 * @param {number} day - Day number
 * @param {string} imageType - Image type
 * @param {string} [extension] - File extension (webp or jpg), auto-detected if not provided
 * @returns {Promise<string|null>} Cached file path or null
 */
export async function getCachedImagePath(trecenaKey, day, imageType, extension = 'webp') {
  const cacheKey = getCacheKey(trecenaKey, day, imageType, extension);
  const filePath = getCachedFilePath(cacheKey);
  
  const isValid = await isCacheValid(filePath, imageType);
  if (isValid) {
    return filePath;
  }
  
  return null;
}

/**
 * Download and cache an image
 * @param {string} imageUrl - URL to download from
 * @param {string} trecenaKey - Normalized trecena key
 * @param {number} day - Day number
 * @param {string} imageType - Image type
 * @param {string} [extension] - File extension (webp or jpg), auto-detected from URL if not provided
 * @returns {Promise<string>} Local file path to cached image
 */
export async function downloadAndCacheImage(imageUrl, trecenaKey, day, imageType, extension = null) {
  await ensureCacheDir();
  
  // Auto-detect extension from URL if not provided
  const fileExtension = extension || getFileExtension(imageUrl);
  const cacheKey = getCacheKey(trecenaKey, day, imageType, fileExtension);
  const filePath = getCachedFilePath(cacheKey);
  
  try {
    // Check if already cached and valid
    const cachedPath = await getCachedImagePath(trecenaKey, day, imageType, fileExtension);
    if (cachedPath) {
      return cachedPath;
    }
    
    // Download image
    const downloadResult = await FileSystem.downloadAsync(imageUrl, filePath);
    
    if (downloadResult.status === 200) {
      return downloadResult.uri;
    } else {
      throw new Error(`Download failed with status ${downloadResult.status}`);
    }
  } catch (error) {
    console.error('Error downloading and caching image:', error);
    throw error;
  }
}

