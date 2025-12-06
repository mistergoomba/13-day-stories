import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function SimpleHeader({ title, onAccountPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Pressable onPress={onAccountPress} style={styles.accountButton}>
        <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
          <Circle
            cx={12}
            cy={8}
            r={4}
            stroke={colors.text}
            strokeWidth={2}
          />
          <Path
            d='M6 21C6 17 9 14 12 14C15 14 18 17 18 21'
            stroke={colors.text}
            strokeWidth={2}
            strokeLinecap='round'
          />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
    paddingTop: 5,
    minHeight: 56,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    paddingBottom: 6,
  },
  title: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
  },
  accountButton: {
    padding: 8,
    paddingBottom: 6,
  },
});

