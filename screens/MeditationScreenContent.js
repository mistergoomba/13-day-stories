import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import Card from '../components/Card';
import {
  getTodayMayanDate,
  getDayData,
  getImageSource,
  isDayAvailable,
} from '../utils/mayanCalendar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MeditationScreenContent({ scrollViewRef }) {
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Meditation</Text>
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
                <Text style={styles.headerDate}>
                  {isToday ? 'today' : `Day ${currentDay} of 13`}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleNextDay}
                disabled={!canGoNext}
                style={styles.headerArrowButton}
              >
                <Text style={[styles.headerArrow, !canGoNext && styles.headerArrowDisabled]}>→</Text>
              </Pressable>
            </View>
          </View>

          {/* Affirmation Image */}
          {affirmationImage && (
            <Image source={affirmationImage} style={styles.affirmationImage} resizeMode='contain' />
          )}

          {/* Meditation Card */}
          <Card style={styles.meditationCard}>
            <Text style={styles.meditationTitle}>Meditation</Text>
            <Text style={styles.meditationText}>{dayData.meditation}</Text>
          </Card>

          {/* Bottom Day Navigation (mimics top) */}
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
            <Pressable onPress={handleNextDay} disabled={!canGoNext} style={styles.bottomArrowButton}>
              <Text style={[styles.bottomArrow, !canGoNext && styles.bottomArrowDisabled]}>→</Text>
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
});
