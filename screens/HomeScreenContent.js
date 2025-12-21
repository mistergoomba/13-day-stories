import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type, headerFontFamily } from '../theme/typography';
import { homePrimaryButton, homeSecondaryButton } from '../theme/buttons';
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

  // Use gold primary button and ghost secondary button for home screen
  const primaryButtonStyle = homePrimaryButton.button;
  const secondaryButtonStyle = homeSecondaryButton.button;

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={defaultBackgroundColors} />

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
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
              13-Day Stories is an invitation to step out of the linear rush and into the sacred
              cycles of the Mayan Calendar. Influenced by ancient wisdom, this framework helps you
              align with the rhythms of nature, understand the "weather" of your soul, and navigate
              your life with deeper intention.
            </Text>
          </Card>

          <SectionCard headerText='The Energy of Now'>
            <Text style={styles.body}>
              Just as the weather changes, so does the energetic vibration of each day. By knowing
              the Day Sign and Tone, you can move with the current rather than against it.
            </Text>

            <Pressable
              style={[primaryButtonStyle, styles.energyButton]}
              onPress={() => setCurrentView && setCurrentView('Today')}
            >
              <Text style={styles.energyButtonText}>Align with Today</Text>
              <Svg width={25} height={25} viewBox='0 0 24 24' fill='none'>
                <Path d='M8 4L18 12L8 20V4Z' fill='#2D1B4E' />
              </Svg>
            </Pressable>
          </SectionCard>

          <SectionCard headerText='The 13-Day Journey'>
            <Text style={styles.body}>
              Life unfolds in waves. This interactive story follows the current "Trecena" (13-day
              cycle), guiding you through a narrative of growth from seed to harvest.
            </Text>

            <Pressable
              style={[primaryButtonStyle, styles.energyButton]}
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
                <Path d='M8 4L18 12L8 20V4Z' fill='#2D1B4E' />
              </Svg>
            </Pressable>

            <Pressable
              style={[secondaryButtonStyle, styles.secondaryStoryButton]}
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
              <Text style={styles.secondaryStoryButtonText}>Start from Day 1</Text>
            </Pressable>
          </SectionCard>

          <SectionCard headerText='Your Soul Blueprint'>
            <Text style={styles.body}>
              You were born with a unique energetic signature. Discover your Mayan Birthday to
              reveal your strengths, your challenges, and the path you were destined to walk.
            </Text>

            <Pressable
              style={[primaryButtonStyle, styles.energyButton]}
              onPress={() => handlePersonalNavigation && handlePersonalNavigation()}
            >
              <Text style={styles.energyButtonText}>Reveal My Sign</Text>
              <Svg width={25} height={25} viewBox='0 0 24 24' fill='none'>
                <Path d='M8 4L18 12L8 20V4Z' fill='#2D1B4E' />
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  energyButtonText: {
    ...type.body,
    ...homePrimaryButton.text,
    fontSize: 16,
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
    color: colors.text,
    fontWeight: '600',
  },
  secondaryStoryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryStoryButtonText: {
    ...type.body,
    ...homeSecondaryButton.text,
  },
});
