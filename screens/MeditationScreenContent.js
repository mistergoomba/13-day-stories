import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import Card from '../components/Card';
import SimpleHeader from '../components/SimpleHeader';
import DayNavigationButton from '../components/DayNavigationButton';
import {
  getTodayMayanDate,
  getDayData,
  getImageSource,
  isDayAvailable,
} from '../utils/mayanCalendar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MeditationScreenContent({ scrollViewRef, resetMeditationTrigger, setCurrentView }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const [currentDay, setCurrentDay] = useState(today.day);
  const dayData = getDayData(currentDay);
  const meditationImage = getImageSource(currentDay, 'meditation');
  const affirmationImage = getImageSource(currentDay, 'affirmation');

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
      setCurrentDay(today.day);
      scrollToTop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetMeditationTrigger]);

  // Navigation handlers
  const handlePreviousDay = () => {
    scrollToTop();
    if (currentDay > 1 && isDayAvailable(currentDay - 1)) {
      setCurrentDay(currentDay - 1);
    }
  };

  const handleNextDay = () => {
    scrollToTop();
    if (currentDay < today.day && isDayAvailable(currentDay + 1)) {
      setCurrentDay(currentDay + 1);
    }
  };

  const handleResetToToday = () => {
    scrollToTop();
    setCurrentDay(today.day);
  };

  const canGoPrevious = currentDay > 1 && isDayAvailable(currentDay - 1);
  const canGoNext = currentDay < today.day && isDayAvailable(currentDay + 1);
  const isToday = currentDay === today.day;

  if (!dayData) {
    return (
      <View style={styles.container}>
        {meditationImage && (
          <Image source={meditationImage} style={styles.backgroundImage} resizeMode='cover' />
        )}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 64) }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            {affirmationImage && (
              <Image
                source={affirmationImage}
                style={styles.affirmationImage}
                resizeMode='contain'
              />
            )}
            <Text style={styles.errorText}>Unable to load meditation data</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Background Image */}
      {meditationImage && (
        <Image source={meditationImage} style={styles.backgroundImage} resizeMode='cover' />
      )}

      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <SimpleHeader
          title='Meditation'
          onAccountPress={() => setCurrentView && setCurrentView('Personal')}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          {/* Affirmation Image */}
          {affirmationImage && (
            <Image
              source={affirmationImage}
              style={[styles.affirmationImage, { height: SCREEN_WIDTH }]}
              resizeMode='cover'
            />
          )}

          {/* Meditation Card */}
          <View style={styles.contentSection}>
            <Card style={styles.meditationCard}>
              <Text style={styles.meditationTitle}>Meditation</Text>
              <Text style={styles.meditationText}>{dayData.meditation}</Text>
            </Card>
          </View>

          {/* Bottom Day Navigation */}
          <View style={styles.contentSection}>
            <View style={styles.bottomDayNavigationContainer}>
              <DayNavigationButton
                direction='prev'
                dayNumber={currentDay - 1}
                onPress={handlePreviousDay}
                disabled={!canGoPrevious}
              />
              <Pressable
                onPress={handleResetToToday}
                style={styles.bottomDayButtonCenter}
              >
                <Text style={styles.bottomDayButtonText}>
                  {isToday ? 'TODAY' : `Day ${currentDay}`}
                </Text>
              </Pressable>
              <DayNavigationButton
                direction='next'
                dayNumber={currentDay + 1}
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
  },
  backgroundImage: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 2, // Make it tall enough to cover scrolling
    left: 0,
    top: 0,
    zIndex: 0,
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
  meditationCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background for readability
    padding: 20,
  },
  meditationTitle: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
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
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#000000',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomDayButtonText: {
    ...type.body,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
