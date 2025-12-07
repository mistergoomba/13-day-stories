import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import colors from '../theme/colors';
import { type, headerTextFontFamily } from '../theme/typography';

export default function SimpleHeader({ title, onAccountPress, showSettingsIcon = false }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <Text style={styles.title}>{title}</Text>
      {onAccountPress && (
        <Pressable onPress={onAccountPress} style={styles.accountButton}>
          {showSettingsIcon ? (
            <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
              <Circle cx={14} cy={12} r={3} stroke={colors.text} strokeWidth={2} />
              <Path
                d='M19.4 15A7.96 7.96 0 0020 12c0-.7-.1-1.4-.3-2l2-1-2-3-2 1a8.13 8.13 0 00-1.7-1l-.3-2h-4l-.3 2a8.13 8.13 0 00-1.7 1l-2-1-2 3 2 1c-.2.6-.3 1.3-.3 2 0 .7.1 1.4.3 2l-2 1 2 3 2-1c.5.4 1.1.7 1.7 1l.3 2h4l.3-2c.6-.3 1.2-.6 1.7-1l2 1 2-3-2-1z'
                stroke={colors.text}
                strokeWidth={2}
                strokeLinejoin='round'
              />
            </Svg>
          ) : (
            <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
              <Circle cx={12} cy={8} r={4} stroke={colors.text} strokeWidth={2} />
              <Path
                d='M6 21C6 17 9 14 12 14C15 14 18 17 18 21'
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap='round'
              />
            </Svg>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  title: {
    ...type.subtitle,
    fontFamily: headerTextFontFamily,
    color: colors.text,
    fontSize: 26,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    paddingBottom: 6,
  },
  accountButton: {
    position: 'absolute',
    right: 8,
    padding: 8,
    paddingBottom: 6,
  },
});
