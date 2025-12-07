import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import Card from '../components/Card';
import SimpleHeader from '../components/SimpleHeader';
import DayNavigationButton from '../components/DayNavigationButton';
import DynamicBackground from '../components/DynamicBackground';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { mainButton } from '../theme/buttons';
import {
  getTodayMayanDateSync,
  getDayData,
  getAllDaysInTrecena,
  getPreviousDay,
  getNextDay,
  isDayAvailable,
  getBackgroundColors,
  getTrecenaData,
} from '../utils/calendarUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Component to render day detail view (story chapter only)
function DayDetailView({ mayanDate, onBack, setSelectedDay, scrollViewRef, setCurrentView, onPersonalPress }) {
  const insets = useSafeAreaInsets();
  const dayData = getDayData(mayanDate);
  const storyPrimaryColors = getBackgroundColors(mayanDate, 'story_primary');

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // Scroll to top helper function
  const scrollToTop = () => {
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  if (!dayData) {
    return (
      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        <Text style={styles.errorText}>Unable to load chapter data</Text>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back to Journey</Text>
        </Pressable>
      </View>
    );
  }

  // Split chapter text by paragraphs (\n\n)
  const paragraphs = dayData.chapter.split(/\n\n/).filter((p) => p.trim().length > 0);

  // Split paragraphs into three groups for the new structure
  // Group 1: First 2 paragraphs (before first image)
  // Group 2: Middle paragraphs (between images)
  // Group 3: Last 2 paragraphs (after second image)
  const textBeforeImage1 = paragraphs.slice(0, 2);
  const textBetweenImages = paragraphs.slice(2, paragraphs.length - 2);
  const textAfterImage2 = paragraphs.slice(paragraphs.length - 2);

  // Render text block helper
  const renderTextBlock = (paragraphs, keyPrefix) => {
    return paragraphs.map((paragraph, index) => (
      <Text key={`${keyPrefix}-para-${index}`} style={styles.chapterText}>
        {paragraph}
      </Text>
    ));
  };

  const previousDay = getPreviousDay(mayanDate);
  const nextDay = getNextDay(mayanDate);
  const canGoPrevious = previousDay !== null && isDayAvailable(previousDay);
  const canGoNext = nextDay !== null && isDayAvailable(nextDay);
  const dayNumber = dayData?.day || mayanDate.tone;

  const handlePreviousDay = () => {
    scrollToTop();
    if (canGoPrevious && previousDay) {
      setSelectedDay(previousDay);
    } else {
      // If on Day 1, go to journey page
      onBack();
    }
  };

  const handleGoToToday = () => {
    scrollToTop();
    onBack();
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={storyPrimaryColors} />

      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <SimpleHeader
          title='Journey'
          onAccountPress={onPersonalPress}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding, paddingTop: insets.top + 56 }]}>
          {/* Story Primary Image */}
          <ImageWithPlaceholder
            source={dayData?.images?.story_primary}
            type="square"
            flushTop={true}
          />

          {/* Chapter Header */}
          <View style={[styles.contentSection, styles.contentSectionBeforeImage]}>
            <View style={styles.chapterTitleRow}>
              <Text style={styles.chapterTitle}>Chapter {dayNumber}</Text>
              <Pressable onPress={onBack} style={styles.fullStoryButton}>
                <Svg
                  width={16}
                  height={16}
                  viewBox='0 0 24 24'
                  fill='none'
                  style={styles.fullStoryIcon}
                >
                  {/* Bulleted list icon - 4 rows with bullets and lines */}
                  {/* Row 1 */}
                  <Rect x='3' y='5' width='3' height='3' fill={colors.accent} />
                  <Rect x='8' y='6' width='11' height='1.5' fill={colors.accent} />
                  {/* Row 2 */}
                  <Rect x='3' y='9' width='3' height='3' fill={colors.accent} />
                  <Rect x='8' y='10' width='11' height='1.5' fill={colors.accent} />
                  {/* Row 3 */}
                  <Rect x='3' y='13' width='3' height='3' fill={colors.accent} />
                  <Rect x='8' y='14' width='11' height='1.5' fill={colors.accent} />
                  {/* Row 4 */}
                  <Rect x='3' y='17' width='3' height='3' fill={colors.accent} />
                  <Rect x='8' y='18' width='11' height='1.5' fill={colors.accent} />
                </Svg>
                <Text style={styles.fullStoryText}>Full story</Text>
              </Pressable>
            </View>

            {/* Chapter Text - Block 1 (before first image) */}
            <Card style={styles.cardBeforeImage}>
              <View style={styles.chapterContainer}>
                {renderTextBlock(textBeforeImage1, 'block1')}
              </View>
            </Card>
          </View>

          {/* Story Wide Image 1 - Full Width (outside contentSection) */}
          {dayData?.images?.story_wide_1 && (
            <ImageWithPlaceholder
              source={dayData.images.story_wide_1}
              type="wide"
              contentWidth={SCREEN_WIDTH}
              resizeMode="cover"
            />
          )}

          {/* Chapter Text - Block 2 (between images) */}
          {textBetweenImages.length > 0 && (
            <View style={[styles.contentSection, styles.contentSectionBeforeImage]}>
              <Card style={styles.cardBeforeImage}>
                <View style={styles.chapterContainer}>
                  {renderTextBlock(textBetweenImages, 'block2')}
                </View>
              </Card>
            </View>
          )}

          {/* Story Wide Image 2 - Full Width (outside contentSection) */}
          {dayData?.images?.story_wide_2 && (
            <ImageWithPlaceholder
              source={dayData.images.story_wide_2}
              type="wide"
              contentWidth={SCREEN_WIDTH}
              resizeMode="cover"
            />
          )}

          {/* Chapter Text - Block 3 (after second image) */}
          <View style={styles.contentSection}>
            <Card>
              <View style={styles.chapterContainer}>
                {renderTextBlock(textAfterImage2, 'block3')}
              </View>
            </Card>
          </View>

          {/* Bottom Day Navigation */}
          <View style={styles.contentSection}>
            <View style={styles.bottomDayNavigationContainer}>
              <DayNavigationButton
                direction='prev'
                dayNumber={previousDay?.tone || dayNumber - 1}
                onPress={handlePreviousDay}
                disabled={!canGoPrevious}
              />
              <Pressable
                onPress={() => {
                  onBack();
                  scrollToTop();
                }}
                style={styles.bottomDayButtonCenter}
              >
                <Text style={styles.bottomDayButtonText}>Day {dayNumber}</Text>
              </Pressable>
              <DayNavigationButton
                direction='next'
                dayNumber={nextDay?.tone || dayNumber + 1}
                onPress={() => {
                  if (nextDay) {
                    setSelectedDay(nextDay);
                    scrollToTop();
                  }
                }}
                disabled={!canGoNext}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function JourneyScreenContent({
  selectedDay,
  setSelectedDay,
  setCurrentView,
  scrollViewRef,
  onPersonalPress,
}) {
  const insets = useSafeAreaInsets();
  const todayMayan = getTodayMayanDateSync();
  const allDays = getAllDaysInTrecena(todayMayan);
  const trecenaData = getTrecenaData(todayMayan.trecena);
  const [prologueExpanded, setPrologueExpanded] = useState(false);

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // Default to current chapter on initial load if no day is selected
  useEffect(() => {
    if (selectedDay === null && setSelectedDay) {
      setSelectedDay(todayMayan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - intentionally not including selectedDay in deps

  // If a day is selected, show detail view
  // selectedDay can be a Mayan date object or null
  if (selectedDay !== null) {
    // Handle legacy case where selectedDay might be a number
    const mayanDate = typeof selectedDay === 'number' 
      ? todayMayan // Fallback - shouldn't happen but handle gracefully
      : selectedDay;
    
    return (
      <DayDetailView
        mayanDate={mayanDate}
        onBack={() => setSelectedDay(null)}
        setSelectedDay={setSelectedDay}
        scrollViewRef={scrollViewRef}
        setCurrentView={setCurrentView}
        onPersonalPress={onPersonalPress}
      />
    );
  }

  // Scroll to top helper function
  const scrollToTop = () => {
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Find first and last available days
  const firstAvailableDayData = allDays.find((day) => {
    const dayMayanDate = { ...todayMayan, tone: day.number };
    return isDayAvailable(dayMayanDate);
  });
  const firstAvailableDay = firstAvailableDayData 
    ? { ...todayMayan, tone: firstAvailableDayData.number }
    : { ...todayMayan, tone: 1 };

  const lastAvailableDayData = allDays
    .filter((day) => {
      const dayMayanDate = { ...todayMayan, tone: day.number };
      return isDayAvailable(dayMayanDate);
    })
    .pop();
  const lastAvailableDay = lastAvailableDayData
    ? { ...todayMayan, tone: lastAvailableDayData.number }
    : todayMayan;

  const handleGoToFirstDay = () => {
    scrollToTop();
    setSelectedDay(firstAvailableDay);
  };

  const handleGoToLastDay = () => {
    scrollToTop();
    setSelectedDay(lastAvailableDay);
  };

  // List view
  const handleGoToToday = () => {
    scrollToTop();
    if (isDayAvailable(todayMayan)) {
      setSelectedDay(todayMayan);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <SimpleHeader
          title='Journey'
          onAccountPress={onPersonalPress}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          <View style={styles.contentSection}>
            <Card>
              <Text style={styles.trecenaTitle}>{trecenaData.trecena} Trecena</Text>
              <Text style={styles.trecenaSubtitle}>
                {trecenaData.days[0].energy_of_the_day.nawal.content}
              </Text>
            </Card>
          </View>

          {/* Prologue Section */}
          <View style={styles.contentSection}>
            <Card>
              <Text style={styles.sectionTitle}>Prologue</Text>
              <Text
                style={styles.prologueText}
                numberOfLines={prologueExpanded ? undefined : 2}
                ellipsizeMode='tail'
              >
                {trecenaData.prologue}
              </Text>
              <Pressable
                style={styles.readMoreButton}
                onPress={() => setPrologueExpanded(!prologueExpanded)}
              >
                <Text style={styles.readMoreText}>
                  {prologueExpanded ? 'Read less' : 'Read more'}
                </Text>
              </Pressable>
            </Card>
          </View>

          {/* Days List */}
          <View style={styles.contentSection}>
            <Card>
              <Text style={styles.sectionTitle}>Chapters</Text>
              {allDays.map((day) => {
                const dayMayanDate = { ...todayMayan, tone: day.number };
                const available = isDayAvailable(dayMayanDate);
                const isToday = day.number === todayMayan.tone;

                return (
                  <Pressable
                    key={day.day}
                    style={[
                      styles.dayCard,
                      available ? styles.availableDay : styles.unavailableDay,
                      isToday && styles.todayCard,
                    ]}
                    onPress={() => available && setSelectedDay(dayMayanDate)}
                    disabled={!available}
                  >
                    <View style={styles.dayCardHeader}>
                      <Text
                        style={[
                          styles.dayNumber,
                          available ? styles.availableText : styles.unavailableText,
                          isToday && styles.todayText,
                        ]}
                      >
                        Chapter {day.day}
                      </Text>
                      <Text
                        style={[
                          styles.dayNawal,
                          available ? styles.availableText : styles.unavailableText,
                        ]}
                      >
                        {day.nawal} {day.number}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </Card>
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
    paddingBottom: 20,
    paddingTop: 0,
    width: '100%',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contentSectionBeforeImage: {
    paddingBottom: 0,
  },
  cardBeforeImage: {
    marginBottom: 0,
  },
  trecenaTitle: {
    ...type.title,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  trecenaSubtitle: {
    ...type.body,
    color: colors.textDim,
    textAlign: 'center',
  },
  sectionTitle: {
    ...type.subtitle,
    color: colors.text,
    marginBottom: 12,
  },
  prologueText: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  readMoreButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  readMoreText: {
    ...type.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  dayCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  availableDay: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  unavailableDay: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  todayCard: {
    borderColor: colors.accent,
    shadowColor: colors.glow,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayNumber: {
    ...type.subtitle,
    fontWeight: '700',
  },
  dayNawal: {
    ...type.body,
    fontWeight: '600',
  },
  availableText: {
    color: colors.text,
  },
  unavailableText: {
    color: 'rgba(255,255,255,0.3)',
  },
  todayText: {
    color: colors.text,
  },
  // Detail view styles
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    ...type.body,
    color: colors.accent,
    fontWeight: '600',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent2,
    borderWidth: 1,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    opacity: 0.3,
  },
  arrowText: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  arrowTextDisabled: {
    color: colors.textDim,
  },
  dayIndicator: {
    ...type.subtitle,
    color: colors.text,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
    opacity: 0.3,
  },
  chapterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  chapterTitle: {
    ...type.title,
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
  },
  journeyIconButton: {
    padding: 8,
    marginLeft: 16,
  },
  fullStoryButton: {
    ...mainButton.button,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 16,
  },
  fullStoryIcon: {
    marginRight: 6,
  },
  fullStoryText: {
    ...type.caption,
    ...mainButton.text,
    textTransform: 'lowercase',
  },
  storyPrimaryImage: {
    width: '100%',
    marginBottom: 0,
  },
  chapterContainer: {
    marginTop: 8,
  },
  chapterText: {
    ...type.body,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 20,
  },
  storyWideImage: {
    width: '100%',
    height: 200,
    marginVertical: 20,
    borderRadius: 8,
  },
  explanationText: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  navigationContainer: {
    marginTop: 24,
  },
  navLink: {
    ...mainButton.button,
    padding: 16,
  },
  navLinkText: {
    ...type.subtitle,
    ...mainButton.text,
  },
  dayNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },
  dayNavButton: {
    ...mainButton.button,
    flex: 1,
    padding: 16,
    marginHorizontal: 6,
  },
  dayNavButtonDisabled: {
    ...mainButton.button,
    flex: 1,
    padding: 16,
    marginHorizontal: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    opacity: 0.5,
  },
  dayNavButtonText: {
    ...type.subtitle,
    ...mainButton.text,
  },
  dayNavButtonTextDisabled: {
    ...type.subtitle,
    ...mainButton.text,
    opacity: 0.5,
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
});
