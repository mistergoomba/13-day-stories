import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import Card from '../components/Card';
import DayNavigationHeader from '../components/DayNavigationHeader';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import {
  getTodayMayanDate,
  getDayData,
  getTrecenaData,
  getAllDays,
  isDayAvailable,
  getImageSource,
} from '../utils/mayanCalendar';
import { TODAY_DAY } from '../utils/mayanCalendar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Component to render day detail view (story chapter only)
function DayDetailView({ dayNumber, onBack, setSelectedDay, scrollViewRef }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const dayData = getDayData(dayNumber);
  const storyPrimaryImage = getImageSource(dayNumber, 'story_primary');
  const storyWide1Image = getImageSource(dayNumber, 'story_wide_1');
  const storyWide2Image = getImageSource(dayNumber, 'story_wide_2');

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

  // Render chapter with inline images
  const renderChapterContent = () => {
    const elements = [];

    paragraphs.forEach((paragraph, index) => {
      // Add paragraph text (preserve line breaks within paragraph)
      elements.push(
        <Text key={`para-${index}`} style={styles.chapterText}>
          {paragraph}
        </Text>
      );

      // Insert story_wide_1.png after 2nd paragraph
      if (index === 1 && storyWide1Image) {
        elements.push(
          <Image
            key={`img-wide-1`}
            source={storyWide1Image}
            style={styles.storyWideImage}
            resizeMode='contain'
          />
        );
      }

      // Insert story_wide_2.png before last paragraph
      if (index === paragraphs.length - 2 && storyWide2Image) {
        elements.push(
          <Image
            key={`img-wide-2`}
            source={storyWide2Image}
            style={styles.storyWideImage}
            resizeMode='contain'
          />
        );
      }
    });

    return elements;
  };

  const canGoPrevious = dayNumber > 1;
  const canGoNext = dayNumber < 13 && isDayAvailable(dayNumber + 1);

  const handlePreviousDay = () => {
    scrollToTop();
    if (canGoPrevious) {
      setSelectedDay(dayNumber - 1);
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
      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <DayNavigationHeader
          title='Journey'
          currentDay={dayNumber}
          todayDay={today.day}
          onPrevious={handlePreviousDay}
          onNext={() => {
            scrollToTop();
            if (canGoNext) {
              setSelectedDay(dayNumber + 1);
            }
          }}
          onToday={handleGoToToday}
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
          {/* Story Primary Image */}
          {storyPrimaryImage && (
            <Image
              source={storyPrimaryImage}
              style={[styles.storyPrimaryImage, { height: SCREEN_WIDTH }]}
              resizeMode='cover'
            />
          )}

          {/* Chapter Header */}
          <View style={styles.contentSection}>
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

            {/* Chapter Text with Inline Images */}
            <Card>
              <View style={styles.chapterContainer}>{renderChapterContent()}</View>
            </Card>
          </View>

          {/* Bottom Day Navigation (mimics top) */}
          <View style={styles.contentSection}>
            <View style={styles.bottomDayNavigationContainer}>
              <Pressable onPress={handlePreviousDay} style={styles.bottomArrowButton}>
                <Text style={styles.bottomArrow}>←</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onBack();
                  scrollToTop();
                }}
              >
                <Text style={styles.bottomDayIndicator}>Day {dayNumber} of 13</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (canGoNext) {
                    setSelectedDay(dayNumber + 1);
                    scrollToTop();
                  }
                }}
                disabled={!canGoNext}
                style={styles.bottomArrowButton}
              >
                <Text style={[styles.bottomArrow, !canGoNext && styles.bottomArrowDisabled]}>
                  →
                </Text>
              </Pressable>
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
}) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const trecenaData = getTrecenaData();
  const allDays = getAllDays();
  const [prologueExpanded, setPrologueExpanded] = useState(false);

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // Default to current chapter on initial load if no day is selected
  useEffect(() => {
    if (selectedDay === null && setSelectedDay) {
      setSelectedDay(TODAY_DAY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - intentionally not including selectedDay in deps

  // If a day is selected, show detail view
  if (selectedDay !== null) {
    return (
      <DayDetailView
        dayNumber={selectedDay}
        onBack={() => setSelectedDay(null)}
        setSelectedDay={setSelectedDay}
        scrollViewRef={scrollViewRef}
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
  const firstAvailableDay = allDays.find((day) => isDayAvailable(day.day))?.day || 1;
  const lastAvailableDay =
    allDays
      .filter((day) => isDayAvailable(day.day))
      .map((day) => day.day)
      .pop() || today.day;

  const handleGoToFirstDay = () => {
    scrollToTop();
    if (firstAvailableDay) {
      setSelectedDay(firstAvailableDay);
    }
  };

  const handleGoToLastDay = () => {
    scrollToTop();
    if (lastAvailableDay) {
      setSelectedDay(lastAvailableDay);
    }
  };

  // List view
  const handleGoToToday = () => {
    scrollToTop();
    if (today.day && isDayAvailable(today.day)) {
      setSelectedDay(today.day);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <DayNavigationHeader
          title='Journey'
          currentDay={today.day}
          todayDay={today.day}
          onPrevious={handleGoToFirstDay}
          onNext={handleGoToLastDay}
          onToday={handleGoToToday}
          canGoPrevious={!!firstAvailableDay}
          canGoNext={!!lastAvailableDay}
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
                const available = isDayAvailable(day.day);
                const isToday = day.day === today.day;

                return (
                  <Pressable
                    key={day.day}
                    style={[
                      styles.dayCard,
                      available ? styles.availableDay : styles.unavailableDay,
                      isToday && styles.todayCard,
                    ]}
                    onPress={() => available && setSelectedDay(day.day)}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: 'transparent',
  },
  fullStoryIcon: {
    marginRight: 6,
  },
  fullStoryText: {
    ...type.caption,
    color: colors.accent,
    fontWeight: '600',
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
    backgroundColor: colors.accent2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  navLinkText: {
    ...type.subtitle,
    color: colors.text,
    fontWeight: '600',
  },
  dayNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },
  dayNavButton: {
    flex: 1,
    backgroundColor: colors.accent2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  dayNavButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    opacity: 0.5,
  },
  dayNavButtonText: {
    ...type.subtitle,
    color: colors.text,
    fontWeight: '600',
  },
  dayNavButtonTextDisabled: {
    color: colors.textDim,
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
