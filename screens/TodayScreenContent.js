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
  getTodayMayanDateSync,
  getDayData,
  getPreviousDay,
  getNextDay,
  isDayAvailable,
  getBackgroundColors,
  convertDateToMayan,
} from '../utils/calendarUtils';
import { getActualDateSync } from '../utils/getActualDate';

export default function TodayScreenContent({
  setCurrentView,
  setSelectedDay,
  scrollViewRef,
  resetToTodayTrigger,
  onPersonalPress,
}) {
  const insets = useSafeAreaInsets();
  const todayMayan = getTodayMayanDateSync();
  const [currentMayanDate, setCurrentMayanDate] = useState(todayMayan);
  const dayData = getDayData(currentMayanDate);
  const backgroundColors = getBackgroundColors(currentMayanDate, 'horoscope');

  // Get Gregorian date for current Mayan date (for display)
  // Calculate days difference from today based on tone difference within same trecena
  const getGregorianDate = () => {
    const todayDate = getActualDateSync();
    if (isToday) {
      return todayDate;
    }

    // If same trecena, calculate day difference
    if (currentMayanDate.trecena === todayMayan.trecena) {
      const dayDiff = currentMayanDate.tone - todayMayan.tone;
      const resultDate = new Date(todayDate);
      resultDate.setDate(resultDate.getDate() + dayDiff);
      return resultDate;
    }

    // Different trecena - for now return today's date
    // TODO: Calculate proper date when crossing trecena boundaries
    return todayDate;
  };

  // Scroll to top helper function
  const scrollToTop = () => {
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Reset to today when resetToTodayTrigger changes (triggered by clicking today tab)
  useEffect(() => {
    if (resetToTodayTrigger > 0) {
      setCurrentMayanDate(todayMayan);
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

  const { horoscope, energy_of_the_day, images } = dayData || {};

  // Handle navigation to Journey with current day selected
  const handleJoinStory = () => {
    if (setSelectedDay && setCurrentView && currentMayanDate) {
      // Pass the Mayan date object instead of day number
      setSelectedDay(currentMayanDate);
      setCurrentView('Journey');
    }
  };

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
  const isToday =
    currentMayanDate.tone === todayMayan.tone && currentMayanDate.trecena === todayMayan.trecena;

  // Get day number for display (from dayData)
  const currentDayNumber = dayData?.day || currentMayanDate.tone;

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={backgroundColors} />

      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <SimpleHeader title='Energy of the Day' onAccountPress={onPersonalPress} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.content, { paddingBottom: bottomPadding, paddingTop: insets.top + 56 }]}
        >
          {/* Horoscope Section */}
          <HoroscopeSection
            horoscopeImage={
              images?.horoscope
                ? typeof images.horoscope === 'string'
                  ? { uri: images.horoscope }
                  : images.horoscope
                : null
            }
            horoscopeText={horoscope}
            date={getGregorianDate()}
            flushTop={true}
          />

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
                dayNumber={previousDay?.tone || currentDayNumber - 1}
                onPress={handlePreviousDay}
                disabled={!canGoPrevious}
              />
              <Pressable onPress={handleResetToToday} style={styles.bottomDayButtonCenter}>
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
