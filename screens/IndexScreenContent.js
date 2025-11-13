import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
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

// Component to render day detail view (same structure as TODAY screen)
function DayDetailView({ dayNumber, onBack, setSelectedDay }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const dayData = getDayData(dayNumber);
  const horoscopeImage = getImageSource(dayNumber, 'horoscope');
  const storyPrimaryImage = getImageSource(dayNumber, 'story_primary');
  const storyWide1Image = getImageSource(dayNumber, 'story_wide_1');
  const storyWide2Image = getImageSource(dayNumber, 'story_wide_2');

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // Navigation logic
  const canGoPrevious = dayNumber > 1;
  const canGoNext = dayNumber < 13 && dayNumber < today.day; // Can't go to future days

  const handlePrevious = () => {
    if (canGoPrevious) {
      setSelectedDay(dayNumber - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setSelectedDay(dayNumber + 1);
    }
  };

  if (!dayData) {
    return (
      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        <Text style={styles.errorText}>Unable to load chapter data</Text>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back to Index</Text>
        </Pressable>
      </View>
    );
  }

  const { horoscope, energy_of_the_day } = dayData;

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
            resizeMode="contain"
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
            resizeMode="contain"
          />
        );
      }
    });

    return elements;
  };

  return (
    <View style={[styles.content, { paddingBottom: bottomPadding }]}>
      {/* Navigation Header */}
      <View style={styles.navigationHeader}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        {/* Navigation Arrows */}
        <View style={styles.arrowContainer}>
          <Pressable
            style={[styles.arrowButton, !canGoPrevious && styles.arrowButtonDisabled]}
            onPress={handlePrevious}
            disabled={!canGoPrevious}
          >
            <Text style={[styles.arrowText, !canGoPrevious && styles.arrowTextDisabled]}>←</Text>
          </Pressable>

          <Text style={[styles.dayIndicator, { marginHorizontal: 16 }]}>Day {dayNumber}</Text>

          <Pressable
            style={[styles.arrowButton, !canGoNext && styles.arrowButtonDisabled]}
            onPress={handleNext}
            disabled={!canGoNext}
          >
            <Text style={[styles.arrowText, !canGoNext && styles.arrowTextDisabled]}>→</Text>
          </Pressable>
        </View>
      </View>

      {/* Horoscope Image */}
      {horoscopeImage && (
        <Image source={horoscopeImage} style={styles.horoscopeImage} resizeMode="contain" />
      )}

      {/* Horoscope Text */}
      <Card>
        <Text style={styles.horoscopeText}>{horoscope}</Text>
      </Card>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Chapter Header */}
      <Text style={styles.chapterTitle}>Chapter {dayNumber}</Text>

      {/* Story Primary Image */}
      {storyPrimaryImage && (
        <Image
          source={storyPrimaryImage}
          style={styles.storyPrimaryImage}
          resizeMode="contain"
        />
      )}

      {/* Chapter Text with Inline Images */}
      <Card>
        <View style={styles.chapterContainer}>{renderChapterContent()}</View>
      </Card>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Mayan Calendar Explanation */}
      <Card>
        <Text style={styles.explanationText}>
          The energies and stories presented here are based on the Mayan calendar, a sacred
          timekeeping system that has guided indigenous communities for thousands of years. Each day
          carries unique combinations of number and nawal (day sign) energies that offer insight,
          guidance, and reflection.
        </Text>
      </Card>

      {/* Energy of the Day Section */}
      <Card>
        <Text style={styles.energySectionTitle}>Energy of the Day</Text>

        {/* Number Energy */}
        <View style={styles.energyBlock}>
          <Text style={styles.energyTitle}>
            {dayData.number}: {energy_of_the_day.number.title}
          </Text>
          <Text style={styles.energyContent}>{energy_of_the_day.number.content}</Text>
          <View style={styles.keywordsContainer}>
            {energy_of_the_day.number.keywords.map((keyword, index) => (
              <View key={index} style={styles.keywordTag}>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nawal Energy */}
        <View style={styles.energyBlock}>
          <Text style={styles.energyTitle}>
            {dayData.nawal}: {energy_of_the_day.nawal.title}
          </Text>
          <Text style={styles.energyContent}>{energy_of_the_day.nawal.content}</Text>
          <View style={styles.keywordsContainer}>
            {energy_of_the_day.nawal.keywords.map((keyword, index) => (
              <View key={index} style={styles.keywordTag}>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Combined Energy */}
        <View style={styles.energyBlock}>
          <Text style={styles.energyTitle}>
            {dayData.number} {dayData.nawal}: {energy_of_the_day.combined_energy.title}
          </Text>
          <Text style={styles.energyContent}>{energy_of_the_day.combined_energy.content}</Text>
          {energy_of_the_day.combined_energy.notes && (
            <View style={styles.notesContainer}>
              {energy_of_the_day.combined_energy.notes.map((note, index) => (
                <View key={index} style={styles.noteItem}>
                  <Text style={styles.noteBullet}>•</Text>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Card>

      {/* Bottom Link - Back to Index Only */}
      <View style={styles.navigationContainer}>
        <Pressable style={styles.navLink} onPress={onBack}>
          <Text style={styles.navLinkText}>Back to Index</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function IndexScreenContent({ selectedDay, setSelectedDay, setCurrentView }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const trecenaData = getTrecenaData();
  const allDays = getAllDays();
  const [prologueExpanded, setPrologueExpanded] = useState(false);

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // If a day is selected, show detail view
  if (selectedDay !== null) {
    return (
      <DayDetailView
        dayNumber={selectedDay}
        onBack={() => setSelectedDay(null)}
        setSelectedDay={setSelectedDay}
      />
    );
  }

  // List view
  return (
    <View style={[styles.content, { paddingBottom: bottomPadding }]}>
      <SectionHeader title="Index" />

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
          ellipsizeMode="tail"
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
  horoscopeImage: {
    width: '100%',
    height: 400,
    marginBottom: 16,
    borderRadius: 8,
  },
  horoscopeText: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
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
  energySectionTitle: {
    ...type.subtitle,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 20,
    fontSize: 20,
  },
  energyBlock: {
    marginBottom: 24,
  },
  energyTitle: {
    ...type.subtitle,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 12,
  },
  energyContent: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordTag: {
    backgroundColor: colors.accent2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  keywordText: {
    ...type.caption,
    color: colors.text,
    fontSize: 12,
  },
  notesContainer: {
    marginTop: 12,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  noteBullet: {
    ...type.body,
    color: colors.accent,
    marginRight: 8,
    fontSize: 16,
  },
  noteText: {
    ...type.body,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
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
  errorText: {
    ...type.body,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 32,
  },
});

