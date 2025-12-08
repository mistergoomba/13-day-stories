import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type, headerFontFamily } from '../theme/typography';
import { mainButton, getButtonStyleFromColors } from '../theme/buttons';
import Card from '../components/Card';
import SectionCard from '../components/SectionCard';
import SectionHeader from '../components/SectionHeader';
import DynamicBackground from '../components/DynamicBackground';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import { getTodayMayanDateSync } from '../utils/calendarUtils';
// Home screen doesn't need Mayan date - removed unused import

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreenContent({
  setCurrentView,
  scrollViewRef,
  onPersonalPress,
  handlePersonalNavigation,
  setSelectedDay,
}) {
  const insets = useSafeAreaInsets();

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // Background colors extracted from main-image.webp
  const defaultBackgroundColors = {
    primary: '#130f1c',
    secondary: '#55325c',
    accent: '#cd95c8',
  };

  // Generate button styles from the extracted colors
  const buttonStyle = getButtonStyleFromColors(defaultBackgroundColors);

  // Create a lighter button style for secondary buttons
  const lighterButtonStyle = {
    ...buttonStyle,
    backgroundColor: defaultBackgroundColors.secondary,
    opacity: 0.7,
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={defaultBackgroundColors} />

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 0 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image - Flush with top and sides, square */}
        <ImageWithPlaceholder
          source={require('../assets/main-image.webp')}
          type='square'
          flushTop={true}
          flushBottom={true}
          resizeMode='cover'
        />

        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          <Card style={{ marginBottom: 50 }}>
            <Text style={[styles.body, { marginBottom: 0 }]}>
              Welcome to 13-Day Stories, a journey through the sacred cycles of the Mayan calendar.
              {'\n\n'}
              This app is deeply influenced by ancient Mayan wisdom—a timekeeping system that has
              guided indigenous communities for thousands of years. The Mayan calendar is not just a
              way to mark time, but a sacred framework for understanding the rhythms of life, the
              cycles of nature, and the patterns that shape our personal and collective journeys.
            </Text>
          </Card>

          <SectionCard headerText='Daily Energy'>
            <Text style={styles.body}>
              Every day carries a unique energy, guided by a combination of a number (1-13) and a
              nawal, or day sign, creating a distinct vibrational quality that offers insight,
              guidance, and reflection.
            </Text>

            <Pressable
              style={[buttonStyle, styles.energyButton]}
              onPress={() => setCurrentView && setCurrentView('Today')}
            >
              <Text style={styles.energyButtonText}>Read Today's Energy</Text>
              <Svg width={25} height={25} viewBox='0 0 24 24' fill='none'>
                <Path d='M8 4L18 12L8 20V4Z' fill={colors.text} />
              </Svg>
            </Pressable>
          </SectionCard>

          <SectionCard headerText='The 13 Day Cycle'>
            <Text style={styles.body}>
              A trecena is a 13-day cycle in the Mayan calendar. The energy of the cycle is guided
              by the nawal sign of the first day. This journey guides you through all 13 days,
              revealing the story and wisdom that unfolds as the cycle progresses.
            </Text>

            <Pressable
              style={[buttonStyle, styles.energyButton]}
              onPress={() => {
                if (setSelectedDay && setCurrentView) {
                  const todayMayan = getTodayMayanDateSync();
                  setSelectedDay(todayMayan);
                  setCurrentView('Journey');
                }
              }}
            >
              <Text style={styles.energyButtonText}>Read Today's Chapter</Text>
              <Svg width={25} height={25} viewBox='0 0 24 24' fill='none'>
                <Path d='M8 4L18 12L8 20V4Z' fill={colors.text} />
              </Svg>
            </Pressable>

            <Pressable
              style={[lighterButtonStyle, styles.secondaryStoryButton]}
              onPress={() => {
                if (setSelectedDay && setCurrentView) {
                  setSelectedDay(null);
                  if (scrollViewRef?.current) {
                    scrollViewRef.current.scrollTo({ y: 0, animated: false });
                  }
                  setCurrentView('Journey');
                }
              }}
            >
              <Text style={styles.secondaryStoryButtonText}>Read From the Start</Text>
            </Pressable>
          </SectionCard>

          <SectionCard headerText='Find Your Mayan Birthday'>
            <Text style={styles.body}>
              Each person has a unique Mayan birthday—the combination of a number (1-13) and a nawal
              sign that corresponds to your birth date. This combination reveals your personal
              energy, offering insight into your character, strengths, and the path you walk through
              life.
            </Text>

            <Pressable
              style={[buttonStyle, styles.energyButton]}
              onPress={() => handlePersonalNavigation && handlePersonalNavigation()}
            >
              <Text style={styles.energyButtonText}>Convert Your Birth Date</Text>
              <Svg width={25} height={25} viewBox='0 0 24 24' fill='none'>
                <Path d='M8 4L18 12L8 20V4Z' fill={colors.text} />
              </Svg>
            </Pressable>
          </SectionCard>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
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
  mainButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    width: '100%',
    paddingHorizontal: 20,
  },
  mainButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    minHeight: 140,
  },
  mainButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flex: 1,
    padding: 16,
  },
  mainButtonText: {
    ...type.body,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  energyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 16,
  },
  energyButtonText: {
    ...type.body,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
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
    padding: 18,
    marginBottom: 12,
  },
  storyButtonText: {
    ...type.subtitle,
    ...mainButton.text,
  },
  secondaryStoryButton: {
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryStoryButtonText: {
    ...type.body,
    ...mainButton.text,
  },
});
