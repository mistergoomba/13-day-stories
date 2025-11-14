import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import HoroscopeSection from '../components/HoroscopeSection';
import EnergyOfTheDay from '../components/EnergyOfTheDay';
import {
  getTodayMayanDate,
  getDayData,
  getImageSource,
  isDayAvailable,
} from '../utils/mayanCalendar';

export default function DayScreenContent({ setCurrentView, setSelectedDay, scrollViewRef }) {
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
      setCurrentView('Index');
    }
  };

  // Navigation handlers
  const handlePreviousDay = () => {
    if (currentDay > 1 && isDayAvailable(currentDay - 1)) {
      setCurrentDay(currentDay - 1);
      scrollToTop();
    }
  };

  const handleNextDay = () => {
    if (currentDay < today.day && isDayAvailable(currentDay + 1)) {
      setCurrentDay(currentDay + 1);
      scrollToTop();
    }
  };

  const handleResetToToday = () => {
    setCurrentDay(today.day);
    scrollToTop();
  };

  const canGoPrevious = currentDay > 1 && isDayAvailable(currentDay - 1);
  const canGoNext = currentDay < today.day && isDayAvailable(currentDay + 1);
  const isToday = currentDay === today.day;

  return (
    <View style={[styles.content, { paddingBottom: bottomPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Energy of the Day</Text>
        <View style={styles.headerDateContainer}>
          <Pressable
            onPress={handlePreviousDay}
            disabled={!canGoPrevious}
            style={styles.headerArrowButton}
          >
            <Text style={[styles.headerArrow, !canGoPrevious && styles.headerArrowDisabled]}>
              ←
            </Text>
          </Pressable>
          <Pressable onPress={handleResetToToday}>
            <Text style={styles.headerDate}>{isToday ? 'today' : `Day ${currentDay} of 13`}</Text>
          </Pressable>
          <Pressable onPress={handleNextDay} disabled={!canGoNext} style={styles.headerArrowButton}>
            <Text style={[styles.headerArrow, !canGoNext && styles.headerArrowDisabled]}>→</Text>
          </Pressable>
        </View>
      </View>

      {/* Horoscope Section */}
      <HoroscopeSection horoscopeImage={horoscopeImage} horoscopeText={horoscope} />

      {/* Separator */}
      <View style={styles.separator} />

      {/* Energy of the Day Section */}
      <EnergyOfTheDay dayData={dayData} energyOfTheDay={energy_of_the_day} />

      {/* Bottom Day Navigation (mimics top) */}
      <View style={styles.bottomDayNavigationContainer}>
        <Pressable
          onPress={handlePreviousDay}
          disabled={!canGoPrevious}
          style={styles.bottomArrowButton}
        >
          <Text style={[styles.bottomArrow, !canGoPrevious && styles.bottomArrowDisabled]}>←</Text>
        </Pressable>
        <Pressable onPress={handleResetToToday}>
          <Text style={styles.bottomDayIndicator}>
            {isToday ? 'today' : `Day ${currentDay} of 13`}
          </Text>
        </Pressable>
        <Pressable onPress={handleNextDay} disabled={!canGoNext} style={styles.bottomArrowButton}>
          <Text style={[styles.bottomArrow, !canGoNext && styles.bottomArrowDisabled]}>→</Text>
        </Pressable>
      </View>

      {/* Bottom Navigation Links */}
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
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    ...type.title,
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDate: {
    ...type.body,
    color: colors.textDim,
    fontSize: 16,
    minWidth: 120,
    textAlign: 'center',
  },
  headerArrowButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  headerArrow: {
    ...type.body,
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  headerArrowDisabled: {
    color: colors.textDim,
    opacity: 0.3,
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
