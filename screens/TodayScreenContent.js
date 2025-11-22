import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import HoroscopeSection from '../components/HoroscopeSection';
import EnergyOfTheDay from '../components/EnergyOfTheDay';
import DayNavigationHeader from '../components/DayNavigationHeader';
import {
  getTodayMayanDate,
  getDayData,
  getImageSource,
  isDayAvailable,
} from '../utils/mayanCalendar';

export default function TodayScreenContent({ setCurrentView, setSelectedDay, scrollViewRef }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const [currentDay, setCurrentDay] = useState(today.day);
  const dayData = getDayData(currentDay);
  const horoscopeImage = getImageSource(currentDay, 'horoscope');

  // Scroll to top helper function
  const scrollToTop = () => {
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

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
      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <DayNavigationHeader
          title='Energy of the Day'
          currentDay={currentDay}
          todayDay={today.day}
          onPrevious={handlePreviousDay}
          onNext={handleNextDay}
          onToday={handleResetToToday}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
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
            <EnergyOfTheDay dayData={dayData} energyOfTheDay={energy_of_the_day} />
          </View>

          {/* Bottom Day Navigation (mimics top) */}
          <View style={styles.contentSection}>
            <View style={styles.bottomDayNavigationContainer}>
              <Pressable
                onPress={handlePreviousDay}
                disabled={!canGoPrevious}
                style={styles.bottomArrowButton}
              >
                <Text style={[styles.bottomArrow, !canGoPrevious && styles.bottomArrowDisabled]}>
                  ←
                </Text>
              </Pressable>
              <Pressable onPress={handleResetToToday}>
                <Text style={styles.bottomDayIndicator}>
                  {isToday ? 'today' : `Day ${currentDay} of 13`}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleNextDay}
                disabled={!canGoNext}
                style={styles.bottomArrowButton}
              >
                <Text style={[styles.bottomArrow, !canGoNext && styles.bottomArrowDisabled]}>
                  →
                </Text>
              </Pressable>
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
                <Text style={styles.navLinkText}>Join the Story in Progress</Text>
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
  },
  bottomArrowButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  bottomArrow: {
    ...type.body,
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  bottomArrowDisabled: {
    color: colors.textDim,
    opacity: 0.3,
  },
  bottomDayIndicator: {
    ...type.body,
    color: colors.textDim,
    fontSize: 16,
    minWidth: 120,
    textAlign: 'center',
  },
  navigationContainer: {
    marginTop: 0,
  },
  navLink: {
    backgroundColor: colors.accent2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    marginBottom: 12,
  },
  navLinkText: {
    ...type.subtitle,
    color: colors.text,
    fontWeight: '600',
  },
  errorText: {
    ...type.body,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 32,
  },
});

