import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';
import { setPremium } from './premiumManager';

// Product ID for lifetime premium
const PREMIUM_PRODUCT_ID = 'com.mistergoomba.x13daystories.premium.lifetime';

// Product IDs array (for fetching product info)
const productIds = [PREMIUM_PRODUCT_ID];

let purchaseUpdateSubscription = null;
let purchaseErrorSubscription = null;
let isInitialized = false;
let initializationError = null;

/**
 * Check if IAP is available and initialized
 * @returns {boolean} True if IAP is ready to use
 */
export const isIAPAvailable = () => {
  return isInitialized && RNIap && typeof RNIap.getProducts === 'function';
};

/**
 * Initialize IAP connection and set up listeners
 * Call this once when app starts
 */
export const initialize = async () => {
  try {
    // Check if module is available
    if (!RNIap || typeof RNIap.initConnection !== 'function') {
      console.warn('IAP module not available - running in development or IAP not linked');
      initializationError = 'IAP module not available';
      return;
    }

    // Connect to store
    await RNIap.initConnection();
    isInitialized = true;
    initializationError = null;
    console.log('IAP initialized');

    // Set up purchase update listener
    if (typeof RNIap.purchaseUpdatedListener === 'function') {
      purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
        console.log('Purchase updated:', purchase);
        await handlePurchase(purchase);
      });
    }

    // Set up purchase error listener
    if (typeof RNIap.purchaseErrorListener === 'function') {
      purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
        console.error('Purchase error:', error);
        // Handle purchase errors (user cancelled, network error, etc.)
        // You might want to show a toast or alert here
      });
    }

    // Restore any pending purchases
    await restorePurchases();
  } catch (error) {
    console.error('Error initializing IAP:', error);
    initializationError = error.message || 'Failed to initialize IAP';
    isInitialized = false;
  }
};

/**
 * Get product information from stores
 * @returns {Promise<Array>} Array of product info objects
 */
export const getProducts = async () => {
  try {
    // Check if IAP is available
    if (!isIAPAvailable()) {
      console.warn('IAP not available - cannot fetch products');
      return [];
    }

    if (typeof RNIap.getProducts !== 'function') {
      console.warn('RNIap.getProducts is not a function');
      return [];
    }

    const products = await RNIap.getProducts(productIds);
    console.log('Products fetched:', products);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Initiate purchase flow for lifetime premium
 * @returns {Promise<void>}
 */
export const purchaseLifetimePremium = async () => {
  try {
    if (!isIAPAvailable()) {
      throw new Error('IAP not available');
    }

    if (typeof RNIap.requestPurchase !== 'function') {
      throw new Error('Purchase not available');
    }

    await RNIap.requestPurchase(PREMIUM_PRODUCT_ID, false);
  } catch (error) {
    console.error('Error initiating purchase:', error);
    throw error;
  }
};

/**
 * Restore purchases from stores
 * This queries the App Store/Play Store for user's purchase history
 * @returns {Promise<boolean>} True if premium was restored, false otherwise
 */
export const restorePurchases = async () => {
  try {
    if (!isIAPAvailable()) {
      console.warn('IAP not available - cannot restore purchases');
      return false;
    }

    if (typeof RNIap.getAvailablePurchases !== 'function') {
      console.warn('RNIap.getAvailablePurchases is not a function');
      return false;
    }

    const purchases = await RNIap.getAvailablePurchases();
    console.log('Available purchases:', purchases);

    // Check if premium product is in purchases
    const hasPremium = purchases.some(
      (purchase) => purchase.productId === PREMIUM_PRODUCT_ID
    );

    if (hasPremium) {
      await setPremium(true);
      console.log('Premium restored');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return false;
  }
};

/**
 * Handle successful purchase
 * @param {Object} purchase - Purchase object from store
 * @returns {Promise<void>}
 */
const handlePurchase = async (purchase) => {
  try {
    if (purchase.productId === PREMIUM_PRODUCT_ID) {
      // Set premium status
      await setPremium(true);
      console.log('Premium activated');

      // Finish the transaction (required by stores)
      await RNIap.finishTransaction(purchase);
    }
  } catch (error) {
    console.error('Error handling purchase:', error);
  }
};

/**
 * Clean up IAP listeners
 * Call this when app unmounts or before re-initializing
 */
export const cleanup = () => {
  if (purchaseUpdateSubscription) {
    purchaseUpdateSubscription.remove();
    purchaseUpdateSubscription = null;
  }
  if (purchaseErrorSubscription) {
    purchaseErrorSubscription.remove();
    purchaseErrorSubscription = null;
  }
  if (RNIap && typeof RNIap.endConnection === 'function') {
    RNIap.endConnection();
  }
  isInitialized = false;
};

