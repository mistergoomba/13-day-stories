import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';
import { setPremium } from './premiumManager';

// Product ID for lifetime premium
const PREMIUM_PRODUCT_ID = 'com.mistergoomba.x13daystories.premium.lifetime';

// Product IDs array (for fetching product info)
const productIds = [PREMIUM_PRODUCT_ID];

let purchaseUpdateSubscription = null;
let purchaseErrorSubscription = null;

/**
 * Initialize IAP connection and set up listeners
 * Call this once when app starts
 */
export const initialize = async () => {
  try {
    // Connect to store
    await RNIap.initConnection();
    console.log('IAP initialized');

    // Set up purchase update listener
    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
      console.log('Purchase updated:', purchase);
      await handlePurchase(purchase);
    });

    // Set up purchase error listener
    purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
      console.error('Purchase error:', error);
      // Handle purchase errors (user cancelled, network error, etc.)
      // You might want to show a toast or alert here
    });

    // Restore any pending purchases
    await restorePurchases();
  } catch (error) {
    console.error('Error initializing IAP:', error);
  }
};

/**
 * Get product information from stores
 * @returns {Promise<Array>} Array of product info objects
 */
export const getProducts = async () => {
  try {
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
  RNIap.endConnection();
};

