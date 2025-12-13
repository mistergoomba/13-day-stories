import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_STATUS_KEY = '@premium_status';

/**
 * Check if user has premium status
 * @returns {Promise<boolean>} True if user has premium, false otherwise
 */
export const isPremium = async () => {
  try {
    const status = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
    return status === 'true';
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

/**
 * Set premium status
 * @param {boolean} premium - True to set premium, false to remove premium
 * @returns {Promise<void>}
 */
export const setPremium = async (premium) => {
  try {
    if (premium) {
      await AsyncStorage.setItem(PREMIUM_STATUS_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(PREMIUM_STATUS_KEY);
    }
  } catch (error) {
    console.error('Error setting premium status:', error);
    throw error;
  }
};

/**
 * Clear premium status (useful for testing or logout)
 * @returns {Promise<void>}
 */
export const clearPremium = async () => {
  try {
    await AsyncStorage.removeItem(PREMIUM_STATUS_KEY);
  } catch (error) {
    console.error('Error clearing premium status:', error);
    throw error;
  }
};

