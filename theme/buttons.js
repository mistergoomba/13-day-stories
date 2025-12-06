import { StyleSheet } from 'react-native';
import colors from './colors';

/**
 * Main button style - 3D beveled look with purple border and black background
 * Use this for all primary buttons across the app
 */
export const mainButton = StyleSheet.create({
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
    // Outer shadow for depth
    shadowColor: colors.accent,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  text: {
    color: colors.text,
    fontWeight: '600',
  },
});

