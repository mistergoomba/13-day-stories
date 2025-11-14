import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import HoroscopeSection from '../components/HoroscopeSection';
import MayanCalendarExplanation from '../components/MayanCalendarExplanation';
import EnergyOfTheDay from '../components/EnergyOfTheDay';
import MeditationSection from '../components/MeditationSection';
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

// Component to render day detail view (story chapter only)
function DayDetailView({ dayNumber, onBack, setSelectedDay, scrollViewRef }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const dayData = getDayData(dayNumber);
  const storyPrimaryImage = getImageSource(dayNumber, 'story_primary');
  const storyWide1Image = getImageSource(dayNumber, 'story_wide_1');
  const storyWide2Image = getImageSource(dayNumber, 'story_wide_2');
  const horoscopeImage = getImageSource(dayNumber, 'horoscope');
  const affirmationImage = getImageSource(dayNumber, 'affirmation');

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // Scroll to top helper function
  const scrollToTop = () => {
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Render day navigation buttons (previous, index, next)
  const renderDayNavigation = () => {
    const canGoPrevious = dayNumber > 1;
    const canGoNext = dayNumber < 13 && isDayAvailable(dayNumber + 1);

    return (
      <View style={styles.dayNavigationContainer}>
        <Pressable
          style={[styles.dayNavButton, !canGoPrevious && styles.dayNavButtonDisabled]}
          onPress={() => {
            if (canGoPrevious) {
              setSelectedDay(dayNumber - 1);
              scrollToTop();
            }
          }}
          disabled={!canGoPrevious}
        >
          <Text
            style={[styles.dayNavButtonText, !canGoPrevious && styles.dayNavButtonTextDisabled]}
          >
            Day {dayNumber - 1}
          </Text>
        </Pressable>
        <Pressable
          style={styles.dayNavButton}
          onPress={() => {
            onBack();
            scrollToTop();
          }}
        >
          <Text style={styles.dayNavButtonText}>Index</Text>
        </Pressable>
        <Pressable
          style={[styles.dayNavButton, !canGoNext && styles.dayNavButtonDisabled]}
          onPress={() => {
            if (canGoNext) {
              setSelectedDay(dayNumber + 1);
              scrollToTop();
            }
          }}
          disabled={!canGoNext}
        >
          <Text style={[styles.dayNavButtonText, !canGoNext && styles.dayNavButtonTextDisabled]}>
            Day {dayNumber + 1}
          </Text>
        </Pressable>
      </View>
    );
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

  return (
    <View style={[styles.content, { paddingBottom: bottomPadding }]}>
      {/* Top Day Navigation */}
      <View style={[styles.dayNavigationContainer, { marginTop: 0, marginBottom: 24 }]}>
        <Pressable
          style={[styles.dayNavButton, dayNumber <= 1 && styles.dayNavButtonDisabled]}
          onPress={() => {
            if (dayNumber > 1) {
              setSelectedDay(dayNumber - 1);
              scrollToTop();
            }
          }}
          disabled={dayNumber <= 1}
        >
          <Text
            style={[styles.dayNavButtonText, dayNumber <= 1 && styles.dayNavButtonTextDisabled]}
          >
            Day {dayNumber - 1}
          </Text>
        </Pressable>
        <Pressable
          style={styles.dayNavButton}
          onPress={() => {
            onBack();
            scrollToTop();
          }}
        >
          <Text style={styles.dayNavButtonText}>Index</Text>
        </Pressable>
        <Pressable
          style={[
            styles.dayNavButton,
            (dayNumber >= 13 || !isDayAvailable(dayNumber + 1)) && styles.dayNavButtonDisabled,
          ]}
          onPress={() => {
            if (dayNumber < 13 && isDayAvailable(dayNumber + 1)) {
              setSelectedDay(dayNumber + 1);
              scrollToTop();
            }
          }}
          disabled={dayNumber >= 13 || !isDayAvailable(dayNumber + 1)}
        >
          <Text
            style={[
              styles.dayNavButtonText,
              (dayNumber >= 13 || !isDayAvailable(dayNumber + 1)) &&
                styles.dayNavButtonTextDisabled,
            ]}
          >
            Day {dayNumber + 1}
          </Text>
        </Pressable>
      </View>

      {/* Chapter Header */}
      <Text style={styles.chapterTitle}>Chapter {dayNumber}</Text>

      {/* Story Primary Image */}
      {storyPrimaryImage && (
        <Image source={storyPrimaryImage} style={styles.storyPrimaryImage} resizeMode='contain' />
      )}

      {/* Chapter Text with Inline Images */}
      <Card>
        <View style={styles.chapterContainer}>{renderChapterContent()}</View>
      </Card>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Horoscope Section */}
      {dayData && (
        <>
          <HoroscopeSection horoscopeImage={horoscopeImage} horoscopeText={dayData.horoscope} />

          {/* Separator */}
          <View style={styles.separator} />

          {/* Mayan Calendar Explanation */}
          <MayanCalendarExplanation />

          {/* Energy of the Day Section */}
          <EnergyOfTheDay dayData={dayData} energyOfTheDay={dayData.energy_of_the_day} />

          {/* Separator */}
          <View style={styles.separator} />

          {/* Meditation Section */}
          <MeditationSection
            affirmationImage={affirmationImage}
            meditationText={dayData.meditation}
            dayNumber={dayNumber}
          />
        </>
      )}

      {/* Bottom Day Navigation */}
      {renderDayNavigation()}
    </View>
  );
}

export default function IndexScreenContent({
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

  // Default to Chapter 8 on initial load if no day is selected
  useEffect(() => {
    if (selectedDay === null && setSelectedDay) {
      setSelectedDay(8);
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

  // List view
  return (
    <View style={[styles.content, { paddingBottom: bottomPadding }]}>
      <SectionHeader title='Journey' />

      <Card>
        <Text style={styles.trecenaTitle}>{trecenaData.trecena} Trecena</Text>
        <Text style={styles.trecenaSubtitle}>Select a day to explore</Text>
      </Card>

      {/* Prologue Section */}
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
          <Text style={styles.readMoreText}>{prologueExpanded ? 'Read less' : 'Read more'}</Text>
        </Pressable>
      </Card>

      {/* Days List */}
      <Card>
        <Text style={styles.sectionTitle}>Days</Text>
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
                  Day {day.day}
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
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
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
  chapterTitle: {
    ...type.title,
    color: colors.text,
    marginBottom: 16,
    fontSize: 28,
    fontWeight: '700',
  },
  storyPrimaryImage: {
    width: '100%',
    height: 300,
    marginBottom: 16,
    borderRadius: 8,
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
});
