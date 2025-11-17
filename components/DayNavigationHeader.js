import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function DayNavigationHeader({
  title,
  currentDay,
  todayDay,
  onPrevious,
  onNext,
  onToday,
  canGoPrevious,
  canGoNext,
}) {
  const insets = useSafeAreaInsets();
  const isToday = currentDay === todayDay;

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {/* Left: Title */}
      <View style={styles.leftSection}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Right: Navigation Triangles with Day Number in Middle */}
      <View style={styles.rightSection}>
        <Pressable onPress={onPrevious} disabled={!canGoPrevious} style={styles.triangleButton}>
          <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
            <Path
              d='M12 15L7 10L12 5'
              stroke={canGoPrevious ? colors.text : colors.textDim}
              strokeWidth={2.5}
              strokeLinecap='round'
              strokeLinejoin='round'
              opacity={canGoPrevious ? 1 : 0.3}
            />
          </Svg>
        </Pressable>
        <Pressable onPress={onToday} style={styles.dayNumberButton}>
          {isToday ? (
            <View style={styles.todayCircle}>
              <Text style={styles.todayDayText}>{currentDay}</Text>
            </View>
          ) : (
            <Text style={styles.dayText}>{currentDay}</Text>
          )}
        </Pressable>
        <Pressable onPress={onNext} disabled={!canGoNext} style={styles.triangleButton}>
          <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
            <Path
              d='M8 15L13 10L8 5'
              stroke={canGoNext ? colors.text : colors.textDim}
              strokeWidth={2.5}
              strokeLinecap='round'
              strokeLinejoin='round'
              opacity={canGoNext ? 1 : 0.3}
            />
          </Svg>
        </Pressable>
      </View>
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
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    paddingBottom: 6,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  title: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
  },
  dayNumberButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  dayText: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  todayCircle: {
    width: 30,
    height: 30,
    borderRadius: 18,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayDayText: {
    ...type.subtitle,
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  triangleButton: {
    padding: 8,
  },
});
