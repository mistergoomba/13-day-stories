import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import colors from '../theme/colors';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
    // Use modern shadow syntax for web compatibility
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 8px 14px rgba(0, 0, 0, 0.25)',
        }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
        }),
  },
});
