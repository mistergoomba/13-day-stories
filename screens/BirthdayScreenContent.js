import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import Card from '../components/Card';
import EnergyOfTheDay from '../components/EnergyOfTheDay';
import { getDayData, getImageSource } from '../utils/mayanCalendar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BirthdayScreenContent({ scrollViewRef, setCurrentView, birthdayDay }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = 50 + insets.bottom + 20;
  const dayData = getDayData(birthdayDay);
  const birthdayImage = getImageSource(birthdayDay, 'birthday');

  if (!dayData || !dayData.birthday) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable
            onPress={() => setCurrentView && setCurrentView('Personal')}
            style={styles.backButton}
          >
            <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
              <Path
                d='M15 18L9 12L15 6'
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </Svg>
          </Pressable>
          <Text style={styles.headerTitle}>Birthday</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 48 }]}
        >
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            <Card>
              <Text style={styles.errorText}>Unable to load birthday data</Text>
            </Card>
          </View>
        </ScrollView>
      </View>
    );
  }

  const { birthday, energy_of_the_day } = dayData;

  return (
    <View style={styles.container}>
      {/* Header - Fixed at top */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => setCurrentView && setCurrentView('Personal')}
          style={styles.backButton}
        >
          <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
            <Path
              d='M15 18L9 12L15 6'
              stroke={colors.text}
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Birthday</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          {/* Birthday Image */}
          {birthdayImage && (
            <Image
              source={birthdayImage}
              style={[styles.birthdayImage, { height: SCREEN_WIDTH }]}
              resizeMode='cover'
            />
          )}

          {/* Birthday Title and Content */}
          <View style={styles.contentSection}>
            <Card>
              <Text style={styles.birthdayTitle}>{birthday.title}</Text>
              <Text style={styles.birthdayContent}>{birthday.content}</Text>
            </Card>
          </View>

          {/* Separator */}
          <View style={styles.contentSection}>
            <View style={styles.separator} />
          </View>

          {/* Energy of the Day Section */}
          <View style={styles.contentSection}>
            <EnergyOfTheDay dayData={dayData} energyOfTheDay={energy_of_the_day} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
    paddingTop: 5,
    minHeight: 56,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    paddingBottom: 6,
  },
  headerTitle: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 16,
    paddingTop: 0,
    width: '100%',
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  birthdayImage: {
    width: '100%',
    marginBottom: 16,
  },
  birthdayTitle: {
    ...type.title,
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  birthdayContent: {
    ...type.body,
    color: colors.text,
    lineHeight: 26,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
    opacity: 0.3,
  },
  errorText: {
    ...type.body,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 32,
  },
});

