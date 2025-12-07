import { StyleSheet, Platform } from 'react-native';
import colors from './colors';

/**
 * Helper function to convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 110, g: 69, b: 207 }; // Default purple
}

/**
 * Helper function to convert RGB to rgba string
 */
function rgbToRgba(rgb, alpha) {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Helper function to create shadow styles that work on both web and native
 */
function createShadowStyle(shadowColor, shadowOffset = { width: 4, height: 4 }, shadowOpacity = 0.3, shadowRadius = 12) {
  const isWeb = Platform.OS === 'web';
  
  if (isWeb) {
    // Convert shadowColor hex to rgba for boxShadow
    const rgb = hexToRgb(shadowColor);
    const rgba = rgbToRgba(rgb, shadowOpacity);
    
    // Create CSS boxShadow string
    const boxShadow = `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${rgba}`;
    
    return {
      boxShadow,
    };
  } else {
    // Native shadow properties
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation: 10,
    };
  }
}

/**
 * Generate button styles from background colors
 * @param {Object} backgroundColors - Object with primary, secondary, accent colors
 * @returns {Object} Button style object
 */
export function getButtonStyleFromColors(backgroundColors) {
  if (!backgroundColors || !backgroundColors.primary) {
    return mainButton.button;
  }

  const primaryRgb = hexToRgb(backgroundColors.primary);
  const accentRgb = hexToRgb(backgroundColors.accent || backgroundColors.primary);
  const shadowColor = backgroundColors.accent || backgroundColors.primary;

  return {
    backgroundColor: backgroundColors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Beveled/3D effect - light from top-left, shadow on bottom-right
    borderTopWidth: 2,
    borderTopColor: rgbToRgba(accentRgb, 0.5), // Lighter top edge
    borderLeftWidth: 2,
    borderLeftColor: rgbToRgba(accentRgb, 0.4), // Lighter left edge
    borderBottomWidth: 2,
    borderBottomColor: rgbToRgba(primaryRgb, 0.15), // Darker bottom edge
    borderRightWidth: 2,
    borderRightColor: rgbToRgba(primaryRgb, 0.2), // Darker right edge
    // Outer shadow for depth - platform-specific
    ...createShadowStyle(shadowColor),
  };
}

/**
 * Main button style - 3D beveled look with purple border and black background
 * Use this for all primary buttons across the app
 * Note: Using plain objects (not StyleSheet) to allow spreading with dynamic shadow styles
 */
export const mainButton = {
  button: {
    backgroundColor: '#000000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Beveled/3D effect - light from top-left, shadow on bottom-right
    borderTopWidth: 2,
    borderTopColor: 'rgba(164, 118, 255, 0.5)', // Lighter top edge
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(164, 118, 255, 0.4)', // Lighter left edge
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(164, 118, 255, 0.15)', // Darker bottom edge
    borderRightWidth: 2,
    borderRightColor: 'rgba(164, 118, 255, 0.2)', // Darker right edge
    // Outer shadow for depth - platform-specific
    ...createShadowStyle(colors.accent),
  },
  text: {
    color: colors.text,
    fontWeight: '600',
  },
};

