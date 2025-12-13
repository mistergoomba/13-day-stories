import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';

/**
 * ShareButton Component
 * Reusable share button that can be used in headers or content areas
 * 
 * @param {Function} onShare - Function to call when share button is pressed
 * @param {string} style - Optional style override ('icon' | 'text' | 'fab')
 * @param {Object} buttonStyle - Optional custom button style
 * @param {Object} iconStyle - Optional custom icon style
 */
export default function ShareButton({ onShare, style = 'icon', buttonStyle, iconStyle }) {
  if (!onShare) {
    return null;
  }

  const renderIcon = () => (
    <Svg width={24} height={24} viewBox='0 0 24 24' fill='none' style={iconStyle}>
      <Path
        d='M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z'
        stroke={colors.text}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  );

  if (style === 'text') {
    return (
      <Pressable onPress={onShare} style={[styles.textButton, buttonStyle]}>
        {renderIcon()}
        <View style={styles.textButtonSpacer} />
        <Text style={styles.textButtonText}>Share</Text>
      </Pressable>
    );
  }

  if (style === 'fab') {
    return (
      <Pressable onPress={onShare} style={[styles.fabButton, buttonStyle]}>
        {renderIcon()}
      </Pressable>
    );
  }

  // Default: icon only
  return (
    <Pressable onPress={onShare} style={[styles.iconButton, buttonStyle]}>
      {renderIcon()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  textButtonSpacer: {
    width: 6,
  },
  textButtonText: {
    ...type.body,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.glow,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});

