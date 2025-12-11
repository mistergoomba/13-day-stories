import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type, headerFontFamily } from '../theme/typography';
import Card from '../components/Card';
import SectionCard from '../components/SectionCard';
import EnergyOfTheDay from '../components/EnergyOfTheDay';
import DynamicBackground from '../components/DynamicBackground';
import SimpleHeader from '../components/SimpleHeader';
import BirthdayDatePickerModal from '../components/BirthdayDatePickerModal';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import { convertDateToMayan, getDayData, getBackgroundColors } from '../utils/calendarUtils';
import { formatDateReadable } from '../utils/dateToMayan';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIRTHDAY_DATE_KEY = '@birthday_date';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BirthdayScreenContent({
  scrollViewRef,
  setCurrentView,
  birthdayDate,
  setBirthdayDate,
  onPersonalPress,
  onHeaderPress,
}) {
  const insets = useSafeAreaInsets();
  const bottomPadding = 50 + insets.bottom + 20;
  const [showEditModal, setShowEditModal] = useState(false);
  const [mayanDate, setMayanDate] = useState(null);
  const [dayData, setDayData] = useState(null);
  const [birthdayColors, setBirthdayColors] = useState({
    primary: '#12091A',
    secondary: '#1C0F29',
    accent: '#6E45CF',
  });
  const [loading, setLoading] = useState(false);

  // Convert birthday date to Mayan date and load data
  useEffect(() => {
    let cancelled = false;

    const loadBirthdayData = async () => {
      if (!birthdayDate) {
        setMayanDate(null);
        setDayData(null);
        setBirthdayColors({
          primary: '#12091A',
          secondary: '#1C0F29',
          accent: '#6E45CF',
        });
        return;
      }

      try {
        setLoading(true);
        const mayan = convertDateToMayan(birthdayDate);
        setMayanDate(mayan);

        const [day, colors] = await Promise.all([
          getDayData(mayan),
          getBackgroundColors(mayan, 'birthday'),
        ]);

        if (!cancelled) {
          setDayData(day);
          setBirthdayColors(colors);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading birthday data:', error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBirthdayData();

    return () => {
      cancelled = true;
    };
  }, [birthdayDate]);

  // Format the Gregorian date for display
  const formattedGregorianDate = birthdayDate ? formatDateReadable(birthdayDate) : '';

  // Handle birthday update
  const handleBirthdayUpdate = async (newDateString) => {
    await AsyncStorage.setItem(BIRTHDAY_DATE_KEY, newDateString);
    if (setBirthdayDate) {
      setBirthdayDate(newDateString);
    }
  };

  // If day data is not found or loading, show just the formatted Mayan date
  if (loading || !dayData) {
    return (
      <View style={styles.container}>
        <DynamicBackground backgroundColors={birthdayColors} />
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header - Part of scroll flow */}
          <View style={{ paddingTop: insets.top }}>
            <SimpleHeader title='PROFILE' onHeaderPress={onHeaderPress} />
          </View>

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
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header - Part of scroll flow */}
          <View style={{ paddingTop: insets.top }}>
            <SimpleHeader title='PROFILE' onHeaderPress={onHeaderPress} />
          </View>

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

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Part of scroll flow */}
        <View style={{ paddingTop: insets.top }}>
          <SimpleHeader
            title='PROFILE'
            onAccountPress={() => setCurrentView && setCurrentView('Settings')}
            showSettingsIcon={true}
            onHeaderPress={onHeaderPress}
          />
        </View>

        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          {/* Birthday Image - always show, uses fallback if specific image not found */}
          <ImageWithPlaceholder source={dayData?.images?.birthday} type='square' flushTop={true} />

          {/* Birthday Title and Content */}
          <View style={[styles.contentSection, { paddingBottom: 0 }]}>
            <SectionCard headerText={birthday.title} style={{ marginBottom: 0 }}>
              <Text style={styles.birthdayContent}>{birthday.content}</Text>
            </SectionCard>
          </View>

          {/* Date Display Section */}
          <View style={[styles.contentSection, { paddingBottom: 50 }]}>
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
