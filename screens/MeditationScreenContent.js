import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type, headerFontFamily } from '../theme/typography';
import Card from '../components/Card';
import SectionCard from '../components/SectionCard';
import SimpleHeader from '../components/SimpleHeader';
import DynamicBackground from '../components/DynamicBackground';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import SharePrompt from '../components/SharePrompt';
import { getTodayMayanDateSync, getDayData, getBackgroundColors } from '../utils/calendarUtils';
import { shareMeditationAffirmation } from '../utils/shareUtils';

export default function MeditationScreenContent({
  scrollViewRef,
  onPersonalPress,
  onHeaderPress,
  resetMeditationTrigger,
}) {
  const insets = useSafeAreaInsets();
  const [dayData, setDayData] = useState(null);
  const [affirmationColors, setAffirmationColors] = useState({
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
          getDayData(todayMayan, 'affirmation'), // Priority: affirmation image
          getBackgroundColors(todayMayan, 'affirmation'),
        ]);

        if (!cancelled) {
          setDayData(day);
          setAffirmationColors(colors);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading meditation data:', error);
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
  }, [resetMeditationTrigger]); // Reload when reset trigger changes

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // Handle share
  const handleShare = async () => {
    const todayMayan = getTodayMayanDateSync();
    await shareMeditationAffirmation(dayData, todayMayan);
  };

  if (loading || !dayData) {
    return (
      <View style={styles.container}>
        <DynamicBackground backgroundColors={affirmationColors} />
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Part of scroll flow */}
          <SimpleHeader title='Meditation' onHeaderPress={onHeaderPress} />

          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            <Text style={styles.errorText}>
              {loading ? 'Loading...' : 'Unable to load meditation data'}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={affirmationColors} />

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Part of scroll flow */}
        <SimpleHeader title='Meditation' onHeaderPress={onHeaderPress} onSharePress={handleShare} />

        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          {/* Affirmation Image */}
          <ImageWithPlaceholder
            source={dayData?.images?.affirmation}
            type='square'
            flushTop={true}
          />

          {/* Share Prompt */}
          <View style={styles.contentSection}>
            <SharePrompt
              microCopy='Someone needs to hear this today.'
              buttonText='Share the Light'
              onShare={handleShare}
            />
          </View>

          {/* Meditation Title and Content */}
          <View style={styles.contentSection}>
            <SectionCard headerText='Meditation'>
              <Text style={styles.meditationText}>{dayData.meditation}</Text>
            </SectionCard>
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
  scrollView: {
    flex: 1,
    zIndex: 1,
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
    paddingBottom: 16,
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
});
