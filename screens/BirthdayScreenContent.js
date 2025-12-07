import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type, headerFontFamily } from '../theme/typography';
import Card from '../components/Card';
import EnergyOfTheDay from '../components/EnergyOfTheDay';
import DynamicBackground from '../components/DynamicBackground';
import SimpleHeader from '../components/SimpleHeader';
import BirthdayDatePickerModal from '../components/BirthdayDatePickerModal';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import { convertDateToMayan, getDayData, getBackgroundColors } from '../utils/calendarUtils';
import { formatDateReadable } from '../utils/dateToMayan';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIRTHDAY_KEY = '@user_birthday';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BirthdayScreenContent({
  scrollViewRef,
  setCurrentView,
  birthdayDate,
  setBirthdayDate,
  onPersonalPress,
}) {
  const insets = useSafeAreaInsets();
  const bottomPadding = 50 + insets.bottom + 20;
  const [showEditModal, setShowEditModal] = useState(false);

  // Convert birthday date to Mayan date
  let mayanDate = null;
  let dayData = null;
  let birthdayColors = null;

  if (birthdayDate) {
    try {
      mayanDate = convertDateToMayan(birthdayDate);
      dayData = getDayData(mayanDate);

      if (dayData) {
        // Get background colors for birthday
        birthdayColors = getBackgroundColors(mayanDate, 'birthday');
      }
    } catch (error) {
      console.error('Error converting birthday date:', error);
    }
  }

  // Format the Gregorian date for display
  const formattedGregorianDate = birthdayDate ? formatDateReadable(birthdayDate) : '';

  // Handle birthday update
  const handleBirthdayUpdate = async (newDateString) => {
    await AsyncStorage.setItem(BIRTHDAY_KEY, newDateString);
    if (setBirthdayDate) {
      setBirthdayDate(newDateString);
    }
  };

  // Default background colors
  if (!birthdayColors) {
    birthdayColors = {
      primary: '#12091A',
      secondary: '#1C0F29',
      accent: '#6E45CF',
    };
  }

  // If day data is not found, show just the formatted Mayan date
  if (!dayData) {
    return (
      <View style={styles.container}>
        <DynamicBackground backgroundColors={birthdayColors} />
        <View style={styles.headerContainer}>
          <SimpleHeader title='Your Birthday' />
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
        >
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            {/* Birthday Image - always show, uses fallback if not found */}
            <ImageWithPlaceholder
              source={dayData?.images?.birthday}
              type='square'
              flushTop={true}
            />

            {/* Date Display Section */}
            <View style={styles.contentSection}>
              <Card>
                {/* Gregorian Date with Edit Icon */}
                <View style={styles.dateRow}>
                  <Text style={styles.gregorianDate}>{formattedGregorianDate}</Text>
                  <Pressable onPress={() => setShowEditModal(true)} style={styles.editButton}>
                    <Svg width={20} height={20} viewBox='0 0 24 24' fill='none'>
                      <Path
                        d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'
                        stroke={colors.textDim}
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <Path
                        d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'
                        stroke={colors.textDim}
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </Svg>
                  </Pressable>
                </View>

                {/* Formatted Mayan Date */}
                {mayanDate && <Text style={styles.mayanDateDisplay}>{mayanDate.formatted}</Text>}
              </Card>
            </View>

            <Card>
              <Text style={styles.mayanDateTitle}>Your Mayan Birthday</Text>
              {mayanDate ? (
                <>
                  <Text style={styles.mayanDateDetails}>Trecena: {mayanDate.trecena}</Text>
                  <Text style={styles.fallbackText}>
                    Detailed birthday information for this trecena is not yet available.
                  </Text>
                </>
              ) : (
                <Text style={styles.errorText}>Unable to calculate Mayan date</Text>
              )}
            </Card>
          </View>
        </ScrollView>
      </View>
    );
  }

  const { birthday, energy_of_the_day } = dayData;

  if (!birthday) {
    return (
      <View style={styles.container}>
        <DynamicBackground backgroundColors={birthdayColors} />
        <View style={styles.headerContainer}>
          <SimpleHeader title='Your Birthday' />
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
        >
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            {/* Birthday Image - always show, uses fallback if not found */}
            <ImageWithPlaceholder
              source={dayData?.images?.birthday}
              type='square'
              flushTop={true}
            />

            {/* Date Display Section */}
            <View style={styles.contentSection}>
              <Card>
                {/* Gregorian Date with Edit Icon */}
                <View style={styles.dateRow}>
                  <Text style={styles.gregorianDate}>{formattedGregorianDate}</Text>
                  <Pressable onPress={() => setShowEditModal(true)} style={styles.editButton}>
                    <Svg width={20} height={20} viewBox='0 0 24 24' fill='none'>
                      <Path
                        d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'
                        stroke={colors.textDim}
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <Path
                        d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'
                        stroke={colors.textDim}
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </Svg>
                  </Pressable>
                </View>

                {/* Formatted Mayan Date */}
                {mayanDate && <Text style={styles.mayanDateDisplay}>{mayanDate.formatted}</Text>}
              </Card>
            </View>

            <Card>
              <Text style={styles.mayanDateTitle}>Your Mayan Birthday</Text>
              <Text style={styles.mayanDateDetails}>Trecena: {mayanDate.trecena}</Text>
              <Text style={styles.fallbackText}>
                Birthday information for this day is not yet available.
              </Text>
            </Card>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={birthdayColors} />

      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <SimpleHeader title='Your Birthday' />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          {/* Birthday Image - always show, uses fallback if specific image not found */}
          <ImageWithPlaceholder source={dayData?.images?.birthday} type='square' flushTop={true} />

          {/* Birthday Title and Content */}
          <View style={styles.contentSection}>
            <Text style={[styles.birthdayTitle, { paddingTop: 0 }]}>{birthday.title}</Text>
            <Card>
              <Text style={styles.birthdayContent}>{birthday.content}</Text>
            </Card>
          </View>

          {/* Date Display Section */}
          <View style={styles.contentSection}>
            <Card>
              {/* Gregorian Date with Edit Icon */}
              <View style={styles.dateRow}>
                <Text style={styles.gregorianDate}>{formattedGregorianDate}</Text>
                <Pressable onPress={() => setShowEditModal(true)} style={styles.editButton}>
                  <Svg width={20} height={20} viewBox='0 0 24 24' fill='none'>
                    <Path
                      d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'
                      stroke={colors.textDim}
                      strokeWidth={2}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <Path
                      d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'
                      stroke={colors.textDim}
                      strokeWidth={2}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </Svg>
                </Pressable>
              </View>

              {/* Formatted Mayan Date */}
              {mayanDate && <Text style={styles.mayanDateDisplay}>{mayanDate.formatted}</Text>}
            </Card>
          </View>

          {/* Energy of the Day Section */}
          <View style={styles.contentSection}>
            <EnergyOfTheDay
              dayData={dayData}
              energyOfTheDay={energy_of_the_day}
              tagColor={birthdayColors?.primary}
            />
          </View>
        </View>
      </ScrollView>

      {/* Birthday Edit Modal */}
      <BirthdayDatePickerModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleBirthdayUpdate}
        initialDate={birthdayDate}
        title='Update Your Birthday'
        buttonText='Update Your Birthday'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    fontFamily: headerFontFamily,
    color: colors.text,
    fontSize: 28,
    marginBottom: 16,
    paddingTop: 35,
    textAlign: 'center',
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
  mayanDateTitle: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  mayanDateFormatted: {
    ...type.title,
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  mayanDateDetails: {
    ...type.body,
    color: colors.textDim,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackText: {
    ...type.body,
    color: colors.textDim,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gregorianDate: {
    ...type.body,
    color: colors.textDim,
    fontSize: 16,
    flex: 1,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  mayanDateDisplay: {
    ...type.title,
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
});
