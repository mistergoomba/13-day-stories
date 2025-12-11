import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Path } from 'react-native-svg';
import Card from '../components/Card';
import SimpleHeader from '../components/SimpleHeader';
import DynamicBackground from '../components/DynamicBackground';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import colors from '../theme/colors';
import { type, headerFontFamily } from '../theme/typography';
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
import { getButtonStyleFromColors } from '../theme/buttons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Component to render day detail view (story chapter only)
function DayDetailView({
  mayanDate,
  onBack,
  setSelectedDay,
  scrollViewRef,
  setCurrentView,
  onPersonalPress,
}) {
  const insets = useSafeAreaInsets();
  const [dayData, setDayData] = useState(null);
  const [storyPrimaryColors, setStoryPrimaryColors] = useState({
    primary: '#12091A',
    secondary: '#1C0F29',
    accent: '#6E45CF',
  });
  const [previousDay, setPreviousDay] = useState(null);
  const [nextDay, setNextDay] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // Load day data when mayanDate changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadData = async () => {
      try {
        const [day, colors, prev, next] = await Promise.all([
          getDayData(mayanDate),
          getBackgroundColors(mayanDate, 'story_primary'),
          getPreviousDay(mayanDate),
          getNextDay(mayanDate),
        ]);

        if (!cancelled) {
          setDayData(day);
          setStoryPrimaryColors(colors);
          setPreviousDay(prev);
          setNextDay(next);
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
  }, [mayanDate]);

  // Scroll to top helper function
  const scrollToTop = () => {
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  if (loading || !dayData) {
    return (
      <View style={styles.container}>
        <DynamicBackground backgroundColors={storyPrimaryColors} />
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Part of scroll flow */}
          <View style={{ paddingTop: insets.top }}>
            <SimpleHeader title='Journey' />
          </View>
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            <Text style={styles.errorText}>
              {loading ? 'Loading...' : 'Unable to load chapter data'}
            </Text>
            <Pressable
              style={[
                styles.backButton,
                storyPrimaryColors && getButtonStyleFromColors(storyPrimaryColors),
              ]}
              onPress={onBack}
            >
              <Text style={styles.backButtonText}>Back to Journey</Text>
            </Pressable>
          </View>
        </ScrollView>
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

  const handleNextDay = () => {
    scrollToTop();
    if (nextDay) {
      setSelectedDay(nextDay);
    }
  };

  const handleFullStory = () => {
    scrollToTop();
    onBack();
  };

  const handleCurrentChapter = () => {
    scrollToTop();
    const todayMayan = getTodayMayanDateSync();
    setSelectedDay(todayMayan);
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={storyPrimaryColors} />

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Part of scroll flow */}
        <View style={{ paddingTop: insets.top }}>
          <SimpleHeader title='Journey' />
        </View>

        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          {/* Story Primary Image */}
          <ImageWithPlaceholder
            source={dayData?.images?.story_primary}
            type='square'
            flushTop={true}
          />

          {/* Chapter Header */}
          <View style={[styles.contentSection, styles.contentSectionBeforeImage]}>
            <View style={styles.chapterTitleRow}>
              <Text style={styles.chapterTitle}>Chapter {dayNumber}</Text>
              <Pressable
                onPress={onBack}
                style={[
                  styles.fullStoryButton,
                  storyPrimaryColors && getButtonStyleFromColors(storyPrimaryColors),
                ]}
              >
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
              type='wide'
              contentWidth={SCREEN_WIDTH}
              resizeMode='cover'
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
              type='wide'
              contentWidth={SCREEN_WIDTH}
              resizeMode='cover'
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

          {/* Bottom Chapter Navigation */}
          <View style={styles.contentSection}>
            <View style={styles.navigationContainer}>
              {/* Previous/Next Chapter Links */}
              <View style={styles.chapterNavigationRow}>
                <Pressable
                  onPress={handlePreviousDay}
                  disabled={!canGoPrevious}
                  style={styles.chapterLink}
                >
                  <Text
                    style={[
                      styles.chapterLinkText,
                      !canGoPrevious && styles.chapterLinkTextDisabled,
                    ]}
                  >
                    ← Chapter {previousDay?.tone || dayNumber - 1}
                  </Text>
                </Pressable>
                <View style={styles.iconCircle}>
                  <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
                    {/* Left page, angled */}
                    <Path
                      d='M4 12.5L11.5 14V22L4 21.5V12.5Z'
                      stroke='currentColor'
                      strokeWidth={2}
                      strokeLinejoin='round'
                    />
                    {/* Right page, angled */}
                    <Path
                      d='M20 12.5L12.5 14V22L20 21.5V12.5Z'
                      stroke='currentColor'
                      strokeWidth={2}
                      strokeLinejoin='round'
                    />
                    {/* Heart floating above the book */}
                    <Path
                      d='M8 3C8 1.7 9.1 0.6 10.5 0.6C11.2 0.6 11.9 1 12.3 1.6C12.7 1 13.4 0.6 14.1 0.6C15.5 0.6 16.6 1.7 16.6 3C16.6 5.2 14.7 6.8 12.3 8.4C9.9 6.8 8 5.2 8 3Z'
                      stroke='currentColor'
                      strokeWidth={2}
                      strokeLinejoin='round'
                    />
                  </Svg>
                </View>
                <Pressable onPress={handleNextDay} disabled={!canGoNext} style={styles.chapterLink}>
                  <Text
                    style={[styles.chapterLinkText, !canGoNext && styles.chapterLinkTextDisabled]}
                  >
                    Chapter {nextDay?.tone || dayNumber + 1} →
                  </Text>
                </Pressable>
              </View>

              {/* Full Story and Current Chapter Links */}
              <View style={styles.storyLinksRow}>
                <Pressable onPress={handleFullStory} style={styles.storyLink}>
                  <Text style={styles.storyLinkText}>full story</Text>
                </Pressable>
                <Pressable onPress={handleCurrentChapter} style={styles.storyLink}>
                  <Text style={styles.storyLinkText}>current chapter</Text>
                </Pressable>
              </View>
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
  // Memoize todayMayan to prevent infinite loops - only recalculate if date actually changes
  const todayMayan = useMemo(() => getTodayMayanDateSync(), []);
  const [allDays, setAllDays] = useState([]);
  const [trecenaData, setTrecenaData] = useState(null);
  const [prologueExpanded, setPrologueExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load trecena data on mount - use trecena name as dependency to avoid infinite loops
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [days, data] = await Promise.all([
          getAllDaysInTrecena(todayMayan),
          getTrecenaData(todayMayan.trecena),
        ]);

        if (!cancelled) {
          setAllDays(days);
          setTrecenaData(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading trecena data:', error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [todayMayan.trecena]); // Only depend on trecena name, not the whole object

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
    const mayanDate =
      typeof selectedDay === 'number'
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
      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Part of scroll flow */}
        <View style={{ paddingTop: insets.top }}>
          <SimpleHeader title='Journey' />
        </View>
        {loading || !trecenaData ? (
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            <Text style={styles.errorText}>
              {loading ? 'Loading...' : 'Unable to load trecena data'}
            </Text>
          </View>
        ) : (
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            <View style={styles.contentSection}>
              <Card>
                <Text style={styles.trecenaTitle}>{trecenaData.trecena} Trecena</Text>
                <Text style={styles.trecenaSubtitle}>
                  {trecenaData.days[0]?.energy_of_the_day?.nawal?.content || ''}
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
        )}
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
    ...mainButton.button,
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
    fontFamily: headerFontFamily,
    color: colors.text,
    fontSize: 28,
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
  chapterNavText: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
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
  navigationContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  chapterNavigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  chapterLink: {
    flex: 1,
    alignItems: 'center',
  },
  chapterLinkText: {
    ...type.body,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  chapterLinkTextDisabled: {
    color: colors.textDim,
    opacity: 0.5,
  },
  chapterNavText: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  storyLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  storyLink: {
    paddingVertical: 8,
  },
  storyLinkText: {
    ...type.body,
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
