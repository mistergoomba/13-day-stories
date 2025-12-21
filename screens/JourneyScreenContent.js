import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Path } from 'react-native-svg';
import Card from '../components/Card';
import SectionCard from '../components/SectionCard';
import SimpleHeader from '../components/SimpleHeader';
import DynamicBackground from '../components/DynamicBackground';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import SharePrompt from '../components/SharePrompt';
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
import { getButtonStyleFromColors, homePrimaryButton } from '../theme/buttons';
import { shareStoryChapter } from '../utils/shareUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Component to render day detail view (story chapter only)
function DayDetailView({
  mayanDate,
  onBack,
  setSelectedDay,
  scrollViewRef,
  setCurrentView,
  onPersonalPress,
  onHeaderPress,
}) {
  const insets = useSafeAreaInsets();
  const [dayData, setDayData] = useState(null);
  const [trecenaData, setTrecenaData] = useState(null);
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
        const [day, colors, prev, next, trecena] = await Promise.all([
          getDayData(mayanDate, ['story_primary', 'story_wide_1', 'story_wide_2']), // Priority: all story images
          getBackgroundColors(mayanDate, 'story_primary'),
          getPreviousDay(mayanDate),
          getNextDay(mayanDate),
          getTrecenaData(mayanDate.trecena),
        ]);

        if (!cancelled) {
          setDayData(day);
          setTrecenaData(trecena);
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
          <SimpleHeader title='Journey' onHeaderPress={onHeaderPress} />
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
  const chapterText = dayData.chapter || '';
  const paragraphs = chapterText.split(/\n\n/).filter((p) => p.trim().length > 0);

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

  // Handle share
  const handleShare = async () => {
    await shareStoryChapter(dayData, mayanDate, trecenaData);
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
        <SimpleHeader title='Journey' onSharePress={handleShare} />

        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          {/* Story Primary Image */}
          <ImageWithPlaceholder
            source={dayData?.images?.story_primary}
            type='square'
            flushTop={true}
            flushBottom={true}
          />

          {/* Chapter Header */}
          <View style={[styles.contentSection, styles.contentSectionBeforeImage]}>
            <Text style={styles.chapterNumber}>Chapter {dayNumber}</Text>
            <Text style={styles.chapterTitle}>
              {dayData.energy_of_the_day?.combined_energy?.title || `Chapter ${dayNumber}`}
            </Text>

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

          {/* Share Prompt */}
          <View style={styles.contentSection}>
            <SharePrompt
              microCopy="Don't walk the path alone."
              buttonText='Invite to the Journey'
              onShare={handleShare}
            />
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
                    <Text style={styles.chapterArrow}>←</Text> Chapter{' '}
                    {previousDay?.tone || dayNumber - 1}
                  </Text>
                </Pressable>
                <Pressable onPress={handleFullStory} style={styles.iconCircle}>
                  <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
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
                </Pressable>
                <Pressable
                  onPress={handleNextDay}
                  disabled={!canGoNext}
                  style={[styles.chapterLink, !canGoNext && styles.chapterLinkHidden]}
                >
                  <Text
                    style={[styles.chapterLinkText, !canGoNext && styles.chapterLinkTextDisabled]}
                  >
                    Chapter {nextDay?.tone || dayNumber + 1}{' '}
                    <Text style={styles.chapterArrow}>→</Text>
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
  onHeaderPress,
  resetToTodayTrigger,
}) {
  const insets = useSafeAreaInsets();
  // Recalculate todayMayan when reset trigger changes (when dev date changes)
  const todayMayan = useMemo(() => getTodayMayanDateSync(), [resetToTodayTrigger]);
  const [allDays, setAllDays] = useState([]);
  const [trecenaData, setTrecenaData] = useState(null);
  const [prologueExpanded, setPrologueExpanded] = useState(false);
  const [trecenaExpanded, setTrecenaExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load trecena data - reload when todayMayan changes (via resetToTodayTrigger)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

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
  }, [todayMayan.trecena, resetToTodayTrigger]); // Reload when trecena changes or reset trigger changes

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
        onHeaderPress={onHeaderPress}
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
        <SimpleHeader title='Journey' />
        {loading || !trecenaData ? (
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            <Text style={styles.errorText}>
              {loading ? 'Loading...' : 'Unable to load trecena data'}
            </Text>
          </View>
        ) : (
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            {/* Trecena Section */}
            <View style={[styles.contentSection, styles.firstSection]}>
              <SectionCard headerText={`${trecenaData.trecena} Trecena`}>
                <Text
                  style={styles.trecenaSubtitle}
                  numberOfLines={trecenaExpanded ? undefined : 3}
                  ellipsizeMode='tail'
                >
                  {trecenaData.days[0]?.energy_of_the_day?.nawal?.content || ''}
                </Text>
                <Pressable
                  style={styles.readMoreButton}
                  onPress={() => setTrecenaExpanded(!trecenaExpanded)}
                >
                  <Text style={styles.readMoreText}>
                    {trecenaExpanded ? 'Read less' : 'Read more'}
                  </Text>
                </Pressable>
              </SectionCard>
            </View>

            {/* Prologue Section */}
            <View style={styles.contentSection}>
              <SectionCard headerText='Prologue'>
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
              </SectionCard>
            </View>

            {/* Days List - Timeline View */}
            <View style={styles.contentSection}>
              <SectionCard headerText='Chapters'>
                <View style={styles.timelineContainer}>
                  {/* Vertical Timeline Line */}
                  <View style={styles.timelineLine} />

                  {allDays.map((day, index) => {
                    const dayMayanDate = { ...todayMayan, tone: day.number };
                    const available = isDayAvailable(dayMayanDate);
                    const isToday = day.number === todayMayan.tone;
                    const isPast = available && day.number < todayMayan.tone;
                    const isFuture = !available || day.number > todayMayan.tone;

                    return (
                      <View key={day.day} style={styles.timelineItem}>
                        {/* Timeline Node */}
                        <View style={styles.timelineNodeContainer}>
                          {isPast ? (
                            <View style={styles.timelineNodePast}>
                              <Svg width={16} height={16} viewBox='0 0 24 24' fill='none'>
                                <Path
                                  d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'
                                  fill={colors.accent}
                                />
                              </Svg>
                            </View>
                          ) : isToday ? (
                            <View style={styles.timelineNodeActive}>
                              <View style={styles.timelineNodeActiveInner} />
                            </View>
                          ) : (
                            <View style={styles.timelineNodeFuture}>
                              <Svg width={16} height={16} viewBox='0 0 24 24' fill='none'>
                                <Path
                                  d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z'
                                  fill={colors.textDim}
                                  fillOpacity={0.5}
                                />
                              </Svg>
                            </View>
                          )}
                        </View>

                        {/* Chapter Card */}
                        <Pressable
                          style={[
                            styles.dayCard,
                            isPast && styles.pastDay,
                            isToday && styles.todayCard,
                            isFuture && styles.futureDay,
                          ]}
                          onPress={() => available && setSelectedDay(dayMayanDate)}
                          disabled={!available}
                        >
                          <View style={styles.dayCardContent}>
                            <View style={styles.dayCardLeft}>
                              <Text
                                style={[styles.dayNumberLarge, isToday && styles.todayNumberText]}
                              >
                                {day.number}
                              </Text>
                            </View>
                            <View style={styles.dayCardMiddle}>
                              <Text
                                style={[
                                  styles.dayNawalName,
                                  isToday && styles.todayNawalText,
                                  isFuture && styles.futureText,
                                ]}
                              >
                                {day.energy_of_the_day?.combined_energy?.title || day.nawal}
                              </Text>
                            </View>
                            <View style={styles.dayCardRight}>
                              {isPast && (
                                <Svg width={20} height={20} viewBox='0 0 24 24' fill='none'>
                                  <Path
                                    d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'
                                    fill={colors.accent}
                                    fillOpacity={0.7}
                                  />
                                </Svg>
                              )}
                              {isFuture && (
                                <Svg width={20} height={20} viewBox='0 0 24 24' fill='none'>
                                  <Path
                                    d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z'
                                    fill={colors.textDim}
                                    fillOpacity={0.5}
                                  />
                                </Svg>
                              )}
                            </View>
                          </View>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </SectionCard>
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
  firstSection: {
    paddingTop: 20,
  },
  contentSectionBeforeImage: {
    paddingBottom: 0,
  },
  cardBeforeImage: {
    marginBottom: 0,
  },
  trecenaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  trecenaHeaderContent: {
    flex: 1,
  },
  trecenaIconContainer: {
    paddingTop: 4,
  },
  trecenaTitle: {
    ...type.title,
    color: colors.text,
    textAlign: 'left',
    marginBottom: 4,
  },
  trecenaSubtitle: {
    ...type.body,
    color: colors.textDim,
    textAlign: 'left',
    lineHeight: 24,
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
  timelineContainer: {
    position: 'relative',
    paddingLeft: 24,
    marginTop: 8,
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 0,
    width: 2,
    backgroundColor: colors.border,
    opacity: 0.3,
    // Height will be calculated dynamically - using a large value to cover all chapters
    // (13 chapters * ~100px each = ~1300px, adding buffer)
    height: 1500,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  timelineNodeContainer: {
    position: 'absolute',
    left: -24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineNodePast: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNodeActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: homePrimaryButton.button.backgroundColor,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: homePrimaryButton.button.backgroundColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  timelineNodeActiveInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2D1B4E',
  },
  timelineNodeFuture: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
    opacity: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  pastDay: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    opacity: 0.6,
  },
  todayCard: {
    ...homePrimaryButton.button,
    borderWidth: 1,
  },
  futureDay: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    opacity: 0.5,
  },
  dayCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayCardLeft: {
    minWidth: 40,
  },
  dayNumberLarge: {
    ...type.title,
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  dayCardMiddle: {
    flex: 1,
  },
  dayNawalName: {
    ...type.subtitle,
    fontWeight: '600',
    color: colors.text,
  },
  dayCardRight: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayNumberText: {
    color: '#2D1B4E',
  },
  todayNawalText: {
    color: '#2D1B4E',
  },
  futureText: {
    color: 'rgba(255,255,255,0.3)',
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
  chapterNumber: {
    ...type.body,
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '800',
    // Dark shadow/glow for better visibility on lighter backgrounds
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  chapterTitle: {
    ...type.title,
    fontFamily: headerFontFamily,
    color: colors.text,
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
    // Dark shadow/glow for better visibility on lighter backgrounds
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    // On Android, remove fontWeight - BlackChancery font doesn't support explicit weights
    ...(Platform.OS === 'android' && { fontWeight: undefined }),
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
  chapterLinkHidden: {
    opacity: 0,
  },
  chapterLinkText: {
    ...type.body,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  chapterArrow: {
    fontSize: 24,
    fontWeight: '600',
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
