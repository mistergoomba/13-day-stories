import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { mainButton } from '../theme/buttons';
import HoroscopeSection from '../components/HoroscopeSection';
import EnergyOfTheDay from '../components/EnergyOfTheDay';
import SimpleHeader from '../components/SimpleHeader';
import DayNavigationButton from '../components/DayNavigationButton';
import DynamicBackground from '../components/DynamicBackground';
import {
  getTodayMayanDate,
  getDayData,
  getImageSource,
  isDayAvailable,
  getBackgroundColors,
} from '../utils/mayanCalendar';

export default function TodayScreenContent({
  setCurrentView,
  setSelectedDay,
  scrollViewRef,
  resetToTodayTrigger,
}) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const [currentDay, setCurrentDay] = useState(today.day);
  const dayData = getDayData(currentDay);
  const horoscopeImage = getImageSource(currentDay, 'horoscope');
  const backgroundColors = getBackgroundColors(currentDay);

  // Scroll to top helper function
  const scrollToTop = () => {
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Reset to today when resetToTodayTrigger changes (triggered by clicking today tab)
  useEffect(() => {
    if (resetToTodayTrigger > 0) {
      setCurrentDay(today.day);
      scrollToTop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToTodayTrigger]);

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  if (!dayData) {
    return (
      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        <Text style={styles.errorText}>Unable to load chapter data</Text>
      </View>
    );
  }

  const { horoscope, energy_of_the_day } = dayData;

  // Format today's date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle navigation to Journey with current day selected
  const handleJoinStory = () => {
    if (setSelectedDay && setCurrentView) {
      setSelectedDay(currentDay);
      setCurrentView('Journey');
    }
  };

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

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={backgroundColors} />

      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <SimpleHeader
          title='Energy of the Day'
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
          {/* Horoscope Section */}
          <HoroscopeSection horoscopeImage={horoscopeImage} horoscopeText={horoscope} />

          {/* Separator */}
          <View style={styles.contentSection}>
            <View style={styles.separator} />
          </View>

          {/* Energy of the Day Section */}
          <View style={styles.contentSection}>
            <EnergyOfTheDay
              dayData={dayData}
              energyOfTheDay={energy_of_the_day}
              tagColor={backgroundColors?.primary}
            />
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
              <Pressable onPress={handleResetToToday} style={styles.bottomDayButtonCenter}>
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

          {/* Bottom Navigation Links */}
          <View style={styles.contentSection}>
            <View style={styles.navigationContainer}>
              <Pressable
                style={styles.navLink}
                onPress={() => setCurrentView && setCurrentView('Meditation')}
              >
                <Text style={styles.navLinkText}>View Meditation / Affirmation</Text>
              </Pressable>
              <Pressable style={styles.navLink} onPress={handleJoinStory}>
                <Text style={styles.navLinkText}>Read Today's Chapter</Text>
              </Pressable>
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 16,
    paddingTop: 0,
    width: '100%',
  },
  contentSection: {
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
    opacity: 0.3,
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
  navigationContainer: {
    marginTop: 0,
  },
  navLink: {
    ...mainButton.button,
    padding: 16,
    marginBottom: 12,
  },
  navLinkText: {
    ...type.subtitle,
    ...mainButton.text,
  },
  errorText: {
    ...type.body,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 32,
  },
});
