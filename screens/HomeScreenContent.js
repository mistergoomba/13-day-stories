import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { mainButton } from '../theme/buttons';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import { getTodayMayanDate } from '../utils/mayanCalendar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreenContent({ setCurrentView }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();

  // Format today's date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  return (
    <View style={[styles.content, { paddingBottom: bottomPadding }]}>
      <Image source={require('../assets/icon.png')} style={styles.icon} resizeMode='contain' />

      <Card>
        <Text style={styles.body}>
          Welcome to 13-Day Stories, a journey through the sacred cycles of the Mayan calendar.
          {'\n\n'}
          Every day carries a unique energy, guided through these 13-day stories known as trecenas.
          Each day combines a number (1-13) and a nawal, or day sign, creating a distinct
          vibrational quality that offers insight, guidance, and reflection.
        </Text>
      </Card>

      <Card>
        <Text style={styles.body}>
          This app is deeply influenced by ancient Mayan wisdom—a timekeeping system that has guided
          indigenous communities for thousands of years. The Mayan calendar is not just a way to
          mark time, but a sacred framework for understanding the rhythms of life, the cycles of
          nature, and the patterns that shape our personal and collective journeys.
        </Text>
      </Card>

      <Card>
        <Text style={styles.body}>
          Through daily stories, horoscopes, meditations, and energy readings, we invite you to
          explore how these ancient teachings can illuminate your path, offering both practical
          guidance and spiritual depth.
        </Text>
      </Card>

      {/* Navigation Links */}
      <View style={styles.navigationContainer}>
        {/* Main Primary Button */}
        <View style={styles.mainButtonContainer}>
          <Pressable
            style={styles.mainButton}
            onPress={() => setCurrentView && setCurrentView('Today')}
          >
            <View style={styles.mainButtonContent}>
              <Svg width={64} height={64} viewBox='0 0 24 24' fill='none'>
                <Circle cx={12} cy={10} r={6} stroke={colors.text} strokeWidth={2} />
                <Path d='M6 20H18' stroke={colors.text} strokeWidth={2} strokeLinecap='round' />
                <Path d='M8 16H16' stroke={colors.text} strokeWidth={2} strokeLinecap='round' />
              </Svg>
              <Text style={styles.mainButtonText}>Read the{'\n'}Energy of the Day</Text>
            </View>
          </Pressable>
        </View>

        {/* Story Section */}
        <View style={styles.storySection}>
          <Text style={styles.storySectionHeader}>Dive into the Story</Text>

          <Pressable
            style={styles.storyButton}
            onPress={() => setCurrentView && setCurrentView('Journey')}
          >
            <Text style={styles.storyButtonText}>Read Today's Chapter</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryStoryButton}
            onPress={() => setCurrentView && setCurrentView('Journey')}
          >
            <Text style={styles.secondaryStoryButtonText}>Start from the Beginning</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  icon: {
    width: '100%',
    height: 200,
    marginBottom: 24,
    alignSelf: 'center',
  },
  body: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  navigationContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  mainButtonContainer: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButton: {
    ...mainButton.button,
    width: '100%',
    height: '100%',
    borderRadius: 16, // Custom size for this specific button
  },
  mainButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  mainButtonText: {
    ...type.body,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  storySection: {
    marginTop: 8,
  },
  storySectionHeader: {
    ...type.subtitle,
    color: colors.textDim,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  storyButton: {
    ...mainButton.button,
    padding: 18,
    marginBottom: 12,
  },
  storyButtonText: {
    ...type.subtitle,
    ...mainButton.text,
  },
  secondaryStoryButton: {
    ...mainButton.button,
    padding: 16,
    marginBottom: 12,
  },
  secondaryStoryButtonText: {
    ...type.body,
    ...mainButton.text,
  },
});
