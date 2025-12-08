import React from 'react';
import { View, StyleSheet, Text, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { getTodayMayanDateSync } from '../utils/calendarUtils';

export default function SimpleBottomToolbar({
  currentView,
  setCurrentView,
  setSelectedDay,
  scrollViewRef,
  meditationScrollViewRef,
  setResetToTodayTrigger,
  setResetMeditationTrigger,
}) {
  const insets = useSafeAreaInsets();

  const scrollToTop = (ref) => {
    if (ref?.current) {
      ref.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleHome = () => {
    console.log('Home button pressed');
    scrollToTop(scrollViewRef);
    setCurrentView('Home');
  };

  const handleMeditation = () => {
    console.log('Meditation button pressed');
    scrollToTop(meditationScrollViewRef);
    // Reset meditation screen to today when clicking meditate tab (similar to how today tab resets Day screen)
    if (setResetMeditationTrigger) {
      setResetMeditationTrigger((prev) => prev + 1);
    }
    setCurrentView('Meditation');
  };

  const handleToday = () => {
    console.log('Today button pressed');
    scrollToTop(scrollViewRef);

    // Reset to today when clicking the today tab (similar to how journey tab resets to current chapter)
    if (setResetToTodayTrigger) {
      setResetToTodayTrigger((prev) => prev + 1);
    }
    setCurrentView('Today');
  };

  const handleJourney = () => {
    console.log('Journey button pressed');
    scrollToTop(scrollViewRef);
    // Set to current chapter when navigating to Journey from toolbar
    if (setSelectedDay) {
      setSelectedDay(getTodayMayanDateSync());
    }
    setCurrentView('Journey');
  };

  const handlePersonalize = () => {
    console.log('Personalize button pressed');
    scrollToTop(scrollViewRef);
    setCurrentView('Personal');
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['transparent', colors.bg]}
        style={styles.gradient}
        pointerEvents='none'
      />
      <View style={[styles.toolbar, { zIndex: 1 }]}>
        {/* Home */}
        <Pressable
          style={[styles.tabButton, currentView === 'Home' && styles.activeTabButton]}
          onPress={handleHome}
        >
          <View style={styles.iconContainer}>
            <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
              <Path
                d='M3 11L12 3L21 11V20H14V14H10V20H3V11Z'
                stroke={currentView === 'Home' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinejoin='round'
              />
            </Svg>
            {currentView === 'Home' && <Text style={styles.iconLabel}>home</Text>}
          </View>
        </Pressable>

        {/* Meditation */}
        <Pressable
          style={[styles.tabButton, currentView === 'Meditation' && styles.activeTabButton]}
          onPress={handleMeditation}
        >
          <View style={styles.iconContainer}>
            <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
              {/* Head */}
              <Circle
                cx={12}
                cy={5}
                r={3}
                stroke={currentView === 'Meditation' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                fill='none'
              />
              {/* Torso - U-shaped, filled */}
              <Path
                d='M18 14C18 10 16 8 12 8C8 8 6 10 6 14'
                stroke={currentView === 'Meditation' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                fill='none'
              />
              {/* Cross-legged legs - left leg (crosses over right, carrot-shaped) */}
              <Path
                d='M4 14C3 14 3 17 4 17L19 21L4 14Z'
                stroke={currentView === 'Meditation' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                fill='none'
              />
              {/* Right leg (under left, carrot-shaped) */}
              <Path
                d='M20 14C21 14 21 17 20 17L5 21L20 14Z'
                stroke={currentView === 'Meditation' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                fill='none'
              />
            </Svg>
            {currentView === 'Meditation' && <Text style={styles.iconLabel}>meditate</Text>}
          </View>
        </Pressable>

        {/* Today - Big center tab */}
        <Pressable
          style={[
            styles.todayTabButton,
            currentView !== 'Today' && { backgroundColor: colors.bg },
            currentView === 'Today' && styles.activeTabButton,
          ]}
          onPress={handleToday}
        >
          <View style={styles.iconContainer}>
            <Svg width={32} height={32} viewBox='0 0 24 24' fill='none'>
              <Circle
                cx={12}
                cy={10}
                r={6}
                stroke={currentView === 'Today' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
              />
              <Path
                d='M6 20H18'
                stroke={currentView === 'Today' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinecap='round'
              />
              <Path
                d='M8 16H16'
                stroke={currentView === 'Today' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinecap='round'
              />
            </Svg>
            <Text
              style={[
                styles.iconLabel,
                { color: currentView === 'Today' ? 'currentColor' : '#FFFFFF' },
              ]}
            >
              today
            </Text>
          </View>
        </Pressable>

        {/* Journey */}
        <Pressable
          style={[styles.tabButton, currentView === 'Journey' && styles.activeTabButton]}
          onPress={handleJourney}
        >
          <View style={styles.iconContainer}>
            <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
              {/* Left page, angled */}
              <Path
                d='M4 12.5L11.5 14V22L4 21.5V12.5Z'
                stroke={currentView === 'Journey' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinejoin='round'
              />
              {/* Right page, angled */}
              <Path
                d='M20 12.5L12.5 14V22L20 21.5V12.5Z'
                stroke={currentView === 'Journey' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinejoin='round'
              />
              {/* Heart floating above the book */}
              <Path
                d='M8 3C8 1.7 9.1 0.6 10.5 0.6C11.2 0.6 11.9 1 12.3 1.6C12.7 1 13.4 0.6 14.1 0.6C15.5 0.6 16.6 1.7 16.6 3C16.6 5.2 14.7 6.8 12.3 8.4C9.9 6.8 8 5.2 8 3Z'
                stroke={currentView === 'Journey' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinejoin='round'
              />
            </Svg>
            {currentView === 'Journey' && <Text style={styles.iconLabel}>journey</Text>}
          </View>
        </Pressable>

        {/* Personalize */}
        <Pressable
          style={[styles.tabButton, currentView === 'Personal' && styles.activeTabButton]}
          onPress={handlePersonalize}
        >
          <View style={styles.iconContainer}>
            <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
              <Circle
                cx={12}
                cy={8}
                r={4}
                stroke={currentView === 'Personal' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
              />
              <Path
                d='M6 21C6 17 9 14 12 14C15 14 18 17 18 21'
                stroke={currentView === 'Personal' ? 'currentColor' : '#FFFFFF'}
                strokeWidth={2}
                strokeLinecap='round'
              />
            </Svg>
            {currentView === 'Personal' && <Text style={styles.iconLabel}>personalize</Text>}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    overflow: 'visible',
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: -16,
    left: 0,
    right: 0,
    height: 16,
    zIndex: 0,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 40,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 4,
    minHeight: 40,
  },
  tabLabel: {
    ...type.caption,
    color: colors.textDim,
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
  },
  todayTabButton: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 4,
    minHeight: 40,
  },
  todayTabLabel: {
    ...type.caption,
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Active state styles - filled with purple, extends upward
  activeTabButton: {
    backgroundColor: colors.accent,
    marginTop: -12,
    paddingTop: 5,
    paddingBottom: 5,
    minHeight: 52,
    zIndex: 2,
  },
  activeTabLabel: {
    color: colors.text,
    fontWeight: '700',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    ...type.caption,
    color: 'currentColor',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
});
