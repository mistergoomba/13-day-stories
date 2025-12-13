import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { mainButton } from '../theme/buttons';
import HoroscopeSection from '../components/HoroscopeSection';
import EnergyOfTheDay from '../components/EnergyOfTheDay';
import SimpleHeader from '../components/SimpleHeader';
import DynamicBackground from '../components/DynamicBackground';
import SharePrompt from '../components/SharePrompt';
import { getTodayMayanDateSync, getDayData, getBackgroundColors } from '../utils/calendarUtils';
import { getActualDateSync } from '../utils/getActualDate';
import { getButtonStyleFromColors } from '../theme/buttons';
import { shareHoroscope } from '../utils/shareUtils';

export default function TodayScreenContent({
  setCurrentView,
  setSelectedDay,
  scrollViewRef,
  onPersonalPress,
  onHeaderPress,
  resetToTodayTrigger,
}) {
  const insets = useSafeAreaInsets();
  const [dayData, setDayData] = useState(null);
  const [backgroundColors, setBackgroundColors] = useState({
    primary: '#12091A',
    secondary: '#1C0F29',
    accent: '#6E45CF',
  });
  const [loading, setLoading] = useState(true);

  // Load today's data - recalculate when reset trigger changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Recalculate today's Mayan date inside useEffect to get latest dev override
    const todayMayan = getTodayMayanDateSync();

    const loadData = async () => {
      try {
        const [day, colors] = await Promise.all([
          getDayData(todayMayan),
          getBackgroundColors(todayMayan, 'horoscope'),
        ]);

        if (!cancelled) {
          setDayData(day);
          setBackgroundColors(colors);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading day data:', error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToTodayTrigger]); // Reload when reset trigger changes

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  if (loading || !dayData) {
    return (
      <View style={[styles.content, { paddingBottom: bottomPadding, paddingTop: insets.top + 56 }]}>
        <Text style={styles.errorText}>
          {loading ? 'Loading...' : 'Unable to load chapter data'}
        </Text>
      </View>
    );
  }

  const { horoscope, energy_of_the_day, images } = dayData || {};

  // Handle navigation to Journey with today selected
  const handleJoinStory = () => {
    if (setSelectedDay && setCurrentView) {
      const todayMayan = getTodayMayanDateSync();
      setSelectedDay(todayMayan);
      setCurrentView('Journey');
    }
  };

  // Handle share
  const handleShare = async () => {
    const todayMayan = getTodayMayanDateSync();
    await shareHoroscope(dayData, todayMayan);
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={backgroundColors} />

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Part of scroll flow */}
        <SimpleHeader title='Energy of the Day' onHeaderPress={onHeaderPress} onSharePress={handleShare} />

        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
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
            date={getActualDateSync()}
            flushTop={true}
          />

          {/* Share Prompt */}
          <View style={styles.contentSection}>
            <SharePrompt
              microCopy="Align your tribe."
              buttonText="Sync the Squad"
              onShare={handleShare}
            />
          </View>

          {/* Energy of the Day Section */}
          <View style={styles.contentSection}>
            <EnergyOfTheDay
              dayData={dayData}
              energyOfTheDay={energy_of_the_day}
              tagColor={backgroundColors?.primary}
            />
          </View>

          {/* Bottom Navigation Link */}
          <View style={styles.contentSection}>
            <Pressable
              style={[
                styles.navLink,
                backgroundColors && getButtonStyleFromColors(backgroundColors),
              ]}
              onPress={handleJoinStory}
            >
              <Text style={styles.navLinkText}>Read Today's Chapter</Text>
              <Svg width={25} height={25} viewBox='0 0 24 24' fill='none'>
                <Path d='M8 4L18 12L8 20V4Z' fill={colors.text} />
              </Svg>
            </Pressable>
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
  navLink: {
    ...mainButton.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 24,
  },
  navLinkText: {
    ...type.body,
    ...mainButton.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  errorText: {
    ...type.body,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 32,
  },
});
