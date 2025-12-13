/**
 * Share Image Cache Utility
 * Caches share images until midnight to avoid re-downloading
 */

import * as FileSystem from 'expo-file-system/legacy';

const CACHE_DIR = `${FileSystem.cacheDirectory}share-images/`;

/**
 * Get cache expiry timestamp (midnight of current day)
 * @returns {number} Timestamp for midnight
 */
function getCacheExpiry() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

/**
 * Get cache key for an image
 * @param {string} trecenaKey - Normalized trecena key
 * @param {number} day - Day number (1-13)
 * @param {string} imageType - Image type
 * @returns {string} Cache key
 */
function getCacheKey(trecenaKey, day, imageType) {
  return `share_${trecenaKey}_${day}_${imageType}.jpg`;
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
 * Check if cache is valid (file was created today, before midnight)
 * @param {string} filePath - Path to cached file
 * @returns {Promise<boolean>} True if cache is valid (created today)
 */
async function isCacheValid(filePath) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      return false;
    }

    // Check if file was created today (before midnight)
    const fileModTime = fileInfo.modificationTime * 1000; // Convert to milliseconds
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayStartTime = todayStart.getTime();
    
    // File is valid if it was created today (after midnight today, before midnight tomorrow)
    return fileModTime >= todayStartTime && fileModTime < getCacheExpiry();
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
 * @returns {Promise<string|null>} Cached file path or null
 */
export async function getCachedImagePath(trecenaKey, day, imageType) {
  const cacheKey = getCacheKey(trecenaKey, day, imageType);
  const filePath = getCachedFilePath(cacheKey);
  
  const isValid = await isCacheValid(filePath);
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
 * @returns {Promise<string>} Local file path to cached image
 */
export async function downloadAndCacheImage(imageUrl, trecenaKey, day, imageType) {
  await ensureCacheDir();
  
  const cacheKey = getCacheKey(trecenaKey, day, imageType);
  const filePath = getCachedFilePath(cacheKey);
  
  try {
    // Check if already cached and valid
    const cachedPath = await getCachedImagePath(trecenaKey, day, imageType);
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

