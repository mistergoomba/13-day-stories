import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';

/**
 * Convert hex color to rgba string
 */
function hexToRgba(hex, alpha = 0.25) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function DynamicBackground({ backgroundColors }) {
  // Use provided colors or fall back to default
  const primary = backgroundColors?.primary || colors.bg;
  const secondary = backgroundColors?.secondary || '#1C0F29';
  const accent = backgroundColors?.accent || '#6E45CF';

  // Convert accent color to rgba for overlay
  const accentWithOpacity = hexToRgba(accent, 0.25);

  return (
    <View style={[StyleSheet.absoluteFill, styles.background]}>
      <LinearGradient
        colors={[primary, secondary, primary]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 1 }}
      />
      <LinearGradient
        colors={[accentWithOpacity, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.7, y: 0 }}
        end={{ x: 0.2, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    zIndex: 0,
  },
});

