import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import Card from '../components/Card';
import { getTodayMayanDate, getDayData, getImageSource } from '../utils/mayanCalendar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MeditationScreenContent({ scrollViewRef }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const dayData = getDayData(today.day);
  const meditationImage = getImageSource(today.day, 'meditation');
  const affirmationImage = getImageSource(today.day, 'affirmation');

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

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

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 64) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          {/* Affirmation Image */}
          {affirmationImage && (
            <Image source={affirmationImage} style={styles.affirmationImage} resizeMode='contain' />
          )}

          {/* Meditation Card */}
          <Card style={styles.meditationCard}>
            <Text style={styles.meditationTitle}>Today's Meditation</Text>
            <Text style={styles.meditationText}>{dayData.meditation}</Text>
          </Card>
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
    minHeight: SCREEN_HEIGHT,
  },
  affirmationImage: {
    width: '100%',
    height: 400,
    marginBottom: 16,
    borderRadius: 8,
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
});
