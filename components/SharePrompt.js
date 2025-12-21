import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';

/**
 * SharePrompt Component
 * Displays micro-copy text and a share button to encourage sharing
 *
 * @param {string} microCopy - The psychological trigger text above the button
 * @param {string} buttonText - The action button text
 * @param {Function} onShare - Function to call when share button is pressed
 */
export default function SharePrompt({ microCopy, buttonText, onShare }) {
  if (!onShare) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Micro-copy text */}
      <Text style={styles.microCopy}>{microCopy}</Text>

      {/* Share button */}
      <Pressable onPress={onShare} style={styles.shareButton}>
        <Svg width={20} height={20} viewBox='0 0 24 24' fill='none' style={styles.shareIcon}>
          <Path
            d='M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z'
            stroke={colors.text}
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </Svg>
        <Text style={styles.shareButtonText}>{buttonText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  microCopy: {
    ...type.body,
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
    fontWeight: '800',
    // Dark shadow/glow for better visibility and pop
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 160,
    // Dark outer glow/shadow to help button pop
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  shareIcon: {
    marginRight: 8,
  },
  shareButtonText: {
    ...type.body,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
