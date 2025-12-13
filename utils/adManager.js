import mobileAds from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { isPremium } from './premiumManager';

// AdMob App IDs
const ADMOB_APP_ID_IOS = 'ca-app-pub-8659681403454349~4462355075';
const ADMOB_APP_ID_ANDROID = 'ca-app-pub-8659681403454349~6082558501';

// Ad Unit IDs
// Test IDs for development (use these during testing)
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';

// Production Ad Unit IDs
const PRODUCTION_BANNER_IOS = 'ca-app-pub-8659681403454349/5392099843';
const PRODUCTION_BANNER_ANDROID = 'ca-app-pub-8659681403454349/1644426521';

// Use test ads in development, production in release builds
const USE_TEST_ADS = __DEV__;

/**
 * Initialize AdMob SDK
 * Call this once when app starts
 */
export const initialize = async () => {
  try {
    const appId = Platform.OS === 'ios' ? ADMOB_APP_ID_IOS : ADMOB_APP_ID_ANDROID;
    await mobileAds().initialize();
    console.log('AdMob initialized with App ID:', appId);
  } catch (error) {
    console.error('Error initializing AdMob:', error);
  }
};

/**
 * Get the banner ad unit ID for current platform
 * @returns {string} Ad unit ID
 */
export const getBannerAdUnitId = () => {
  if (USE_TEST_ADS) {
    return Platform.OS === 'ios' ? TEST_BANNER_IOS : TEST_BANNER_ANDROID;
  }
  return Platform.OS === 'ios' ? PRODUCTION_BANNER_IOS : PRODUCTION_BANNER_ANDROID;
};

/**
 * Check if ads should be shown
 * Returns false if user has premium
 * @returns {Promise<boolean>} True if ads should be shown, false otherwise
 */
export const shouldShowAds = async () => {
  const premium = await isPremium();
  return !premium;
};

