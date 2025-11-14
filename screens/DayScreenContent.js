import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import HoroscopeSection from '../components/HoroscopeSection';
import MayanCalendarExplanation from '../components/MayanCalendarExplanation';
import EnergyOfTheDay from '../components/EnergyOfTheDay';
import { getTodayMayanDate, getDayData, getImageSource } from '../utils/mayanCalendar';

export default function DayScreenContent({ setCurrentView, setSelectedDay }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const dayData = getDayData(today.day);
  const horoscopeImage = getImageSource(today.day, 'horoscope');

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
      setSelectedDay(today.day);
      setCurrentView('Index');
    }
  };

  return (
    <View style={[styles.content, { paddingBottom: bottomPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Energy of the Day</Text>
        <Text style={styles.headerDate}>{formatDate(today.gregorianDate)}</Text>
      </View>

      {/* Horoscope Section */}
      <HoroscopeSection horoscopeImage={horoscopeImage} horoscopeText={horoscope} />

      {/* Separator */}
      <View style={styles.separator} />

      {/* Mayan Calendar Explanation */}
      <MayanCalendarExplanation />

      {/* Energy of the Day Section */}
      <EnergyOfTheDay dayData={dayData} energyOfTheDay={energy_of_the_day} />

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
  headerDate: {
    ...type.body,
    color: colors.textDim,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
    opacity: 0.3,
  },
  navigationContainer: {
    marginTop: 24,
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
