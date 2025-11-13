import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import Card from '../components/Card';
import { getTodayMayanDate, getDayData, getImageSource } from '../utils/mayanCalendar';

export default function DayScreenContent({ setCurrentView }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();
  const dayData = getDayData(today.day);
  const horoscopeImage = getImageSource(today.day, 'horoscope');
  const storyPrimaryImage = getImageSource(today.day, 'story_primary');
  const storyWide1Image = getImageSource(today.day, 'story_wide_1');
  const storyWide2Image = getImageSource(today.day, 'story_wide_2');

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  if (!dayData) {
    return (
      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        <Text style={styles.errorText}>Unable to load chapter data</Text>
      </View>
    );
  }

  const { horoscope, energy_of_the_day } = dayData;

  // Format today's date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Energy of the Day</Text>
        <Text style={styles.headerDate}>{formatDate(today.gregorianDate)}</Text>
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

      {/* Chapter Header with Index Link */}
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterTitle}>Chapter {today.day}</Text>
        <Pressable
          style={styles.indexLink}
          onPress={() => setCurrentView && setCurrentView('Index')}
        >
          <Text style={styles.indexLinkText}>index</Text>
        </Pressable>
      </View>

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

      {/* Bottom Link to Meditation */}
      <View style={styles.navigationContainer}>
        <Pressable
          style={styles.navLink}
          onPress={() => setCurrentView && setCurrentView('Meditation')}
        >
          <Text style={styles.navLinkText}>View Meditation / Affirmation</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
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
  headerDate: {
    ...type.body,
    color: colors.textDim,
    fontSize: 16,
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
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chapterTitle: {
    ...type.title,
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  indexLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  indexLinkText: {
    ...type.body,
    color: colors.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
