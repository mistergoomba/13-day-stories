import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import colors from '../theme/colors';

export default function DayPill({ label, sublabel, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pill, active && styles.active, pressed && { opacity: 0.85 }]}
    >
      <Text style={[styles.label, active && styles.activeText]}>{label}</Text>
      {sublabel ? (
        <Text style={[styles.sublabel, active && styles.activeText]}>{sublabel}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    marginRight: 10,
  },
  active: {
    backgroundColor: 'rgba(164,118,255,0.16)',
    borderColor: colors.accent,
    // Use modern shadow syntax for web compatibility
    ...(Platform.OS === 'web'
      ? {
          boxShadow: `0 0 8px ${colors.accent}60`,
        }
      : {
          shadowColor: colors.accent,
          shadowOpacity: 0.6,
          shadowRadius: 8,
        }),
  },
  label: { color: colors.text, fontWeight: '700' },
  sublabel: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  activeText: { color: colors.text },
});
