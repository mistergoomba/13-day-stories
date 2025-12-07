import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { mainButton, getButtonStyleFromColors } from '../theme/buttons';

export default function DayNavigationButton({ direction, dayNumber, onPress, disabled, backgroundColors }) {
  if (disabled) {
    return <View style={styles.placeholder} />;
  }

  const isPrevious = direction === 'prev';
  const buttonStyle = backgroundColors
    ? [styles.buttonBase, getButtonStyleFromColors(backgroundColors)]
    : styles.button;

  return (
    <Pressable onPress={onPress} style={buttonStyle}>
      <View style={styles.content}>
        {isPrevious ? (
          <>
            <Svg width={28} height={28} viewBox='0 0 16 16' fill='none'>
              <Path d='M10 12L6 8L10 4' fill={colors.text} />
            </Svg>
            <Text style={styles.dayNumber}>{dayNumber}</Text>
          </>
        ) : (
          <>
            <Text style={styles.dayNumber}>{dayNumber}</Text>
            <Svg width={28} height={28} viewBox='0 0 16 16' fill='none'>
              <Path d='M6 12L10 8L6 4' fill={colors.text} />
            </Svg>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 80,
  },
  button: {
    ...mainButton.button,
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 80,
  },
  placeholder: {
    height: 48,
    minWidth: 80,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dayNumber: {
    ...type.body,
    ...mainButton.text,
    fontSize: 14,
  },
});

