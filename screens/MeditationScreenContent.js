import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type, headerFontFamily } from '../theme/typography';
import { mainButton } from '../theme/buttons';
import Card from '../components/Card';
import SimpleHeader from '../components/SimpleHeader';
import DayNavigationButton from '../components/DayNavigationButton';
import DynamicBackground from '../components/DynamicBackground';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import {
  getTodayMayanDateSync,
  getDayData,
  getPreviousDay,
  getNextDay,
  isDayAvailable,
  getBackgroundColors,
} from '../utils/calendarUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MeditationScreenContent({ scrollViewRef, resetMeditationTrigger, setCurrentView, onPersonalPress }) {
  const insets = useSafeAreaInsets();
  const todayMayan = getTodayMayanDateSync();
  const [currentMayanDate, setCurrentMayanDate] = useState(todayMayan);
  const dayData = getDayData(currentMayanDate);
  const affirmationColors = getBackgroundColors(currentMayanDate, 'affirmation');

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // Scroll to top helper function
  const scrollToTop = () => {
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Reset to today when resetMeditationTrigger changes (triggered by clicking meditate tab)
  useEffect(() => {
    if (resetMeditationTrigger > 0) {
      setCurrentMayanDate(todayMayan);
      scrollToTop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetMeditationTrigger]);

  // Navigation handlers
  const handlePreviousDay = () => {
    scrollToTop();
    const previousDay = getPreviousDay(currentMayanDate);
    if (previousDay && isDayAvailable(previousDay)) {
      setCurrentMayanDate(previousDay);
    }
  };

  const handleNextDay = () => {
    scrollToTop();
    const nextDay = getNextDay(currentMayanDate);
    if (nextDay && isDayAvailable(nextDay)) {
      setCurrentMayanDate(nextDay);
    }
  };

  const handleResetToToday = () => {
    scrollToTop();
    setCurrentMayanDate(todayMayan);
  };

  const previousDay = getPreviousDay(currentMayanDate);
  const nextDay = getNextDay(currentMayanDate);
  const canGoPrevious = previousDay !== null && isDayAvailable(previousDay);
  const canGoNext = nextDay !== null && isDayAvailable(nextDay);
  const isToday = currentMayanDate.tone === todayMayan.tone && currentMayanDate.trecena === todayMayan.trecena;
  const currentDayNumber = dayData?.day || currentMayanDate.tone;

  if (!dayData) {
    return (
      <View style={styles.container}>
        <DynamicBackground backgroundColors={affirmationColors} />
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            <ImageWithPlaceholder
              source={dayData?.images?.affirmation}
              type="square"
              />
            <Text style={styles.errorText}>Unable to load meditation data</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={affirmationColors} />

      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <SimpleHeader
          title='Meditation'
          onAccountPress={onPersonalPress}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding, paddingTop: insets.top + 56 }]}>
          {/* Affirmation Image */}
          <ImageWithPlaceholder
            source={dayData?.images?.affirmation}
            type="square"
            flushTop={true}
          />

          {/* Meditation Title and Content */}
          <View style={styles.contentSection}>
            <Text style={styles.meditationTitle}>Meditation</Text>
            <Card>
              <Text style={styles.meditationText}>{dayData.meditation}</Text>
            </Card>
          </View>

          {/* Bottom Day Navigation */}
          <View style={styles.contentSection}>
            <View style={styles.bottomDayNavigationContainer}>
              <DayNavigationButton
                direction='prev'
                dayNumber={previousDay?.tone || currentDayNumber - 1}
                onPress={handlePreviousDay}
                disabled={!canGoPrevious}
              />
              <Pressable
                onPress={handleResetToToday}
                style={styles.bottomDayButtonCenter}
              >
                <Text style={styles.bottomDayButtonText}>
                  {isToday ? 'TODAY' : `Day ${currentDayNumber}`}
                </Text>
              </Pressable>
              <DayNavigationButton
                direction='next'
                dayNumber={nextDay?.tone || currentDayNumber + 1}
                onPress={handleNextDay}
                disabled={!canGoNext}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 16,
    minHeight: SCREEN_HEIGHT,
    paddingTop: 0,
    width: '100%',
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  affirmationImage: {
    width: '100%',
    marginBottom: 16,
  },
  meditationTitle: {
    ...type.title,
    fontFamily: headerFontFamily,
    color: colors.text,
    fontSize: 28,
    marginBottom: 16,
    paddingTop: 35,
    textAlign: 'center',
  },
  meditationText: {
    ...type.body,
    color: colors.text,
    lineHeight: 26,
  },
  errorText: {
    ...type.body,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 32,
  },
  bottomDayNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
    gap: 12,
  },
  bottomDayButtonCenter: {
    ...mainButton.button,
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 80,
  },
  bottomDayButtonText: {
    ...type.body,
    ...mainButton.text,
    fontSize: 14,
  },
});
