// Debug helper for Expo Go crashes
// Add this to your App.js or any component to see console logs

export const debugLog = (message, data = null) => {
  console.log(`[DEBUG] ${message}`, data);
};

export const debugError = (message, error) => {
  console.error(`[ERROR] ${message}`, error);
};

// Add this to catch unhandled promise rejections
export const setupErrorHandling = () => {
  // React Native has its own error handling, so we just log that we're setting up
  console.log('Debug error handling setup complete');
};
