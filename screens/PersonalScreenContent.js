import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { mainButton, homePrimaryButton } from '../theme/buttons';
import Card from '../components/Card';
import SectionCard from '../components/SectionCard';
import SimpleHeader from '../components/SimpleHeader';
import DynamicBackground from '../components/DynamicBackground';

export default function PersonalScreenContent({
  scrollViewRef,
  setCurrentView,
  setBirthdayDate,
  onHeaderPress,
}) {
  const insets = useSafeAreaInsets();
  const bottomPadding = 50 + insets.bottom + 20;

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysInMonth = (month, year) => {
    // Handle February and leap years
    if (month === 1) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    }
    // Months with 31 days: Jan, Mar, May, Jul, Aug, Oct, Dec (0, 2, 4, 6, 7, 9, 11)
    const days31 = [0, 2, 4, 6, 7, 9, 11];
    return days31.includes(month) ? 31 : 30;
  };

  const getDaysArray = () => {
    // If no month is selected, show all 31 days
    if (selectedMonth === null) {
      return Array.from({ length: 31 }, (_, i) => i + 1);
    }
    // For February, we need a year to determine leap year. Use current year as default if not selected.
    // For other months, we don't need the year.
    const yearForCalculation = selectedYear || new Date().getFullYear();
    const daysCount = daysInMonth(selectedMonth, yearForCalculation);
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };

  const getYearsArray = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 1900;
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
  };

  const handleFindBirthday = () => {
    if (selectedMonth === null || selectedDay === null || selectedYear === null) {
      // Show error or validation message
      return;
    }

    // Create date string in YYYY-MM-DD format
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const dayStr = String(selectedDay).padStart(2, '0');
    const dateString = `${selectedYear}-${monthStr}-${dayStr}`;

    if (setBirthdayDate) {
      setBirthdayDate(dateString);
    }
    setCurrentView && setCurrentView('Birthday');
  };

  const isDateValid = selectedMonth !== null && selectedDay !== null && selectedYear !== null;

  // Default background colors for personal screen
  const defaultBackgroundColors = {
    primary: '#12091A',
    secondary: '#1C0F29',
    accent: '#6E45CF',
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={defaultBackgroundColors} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Part of scroll flow */}
        <SimpleHeader
          title='PROFILE'
          onAccountPress={() => setCurrentView && setCurrentView('Settings')}
          showSettingsIcon={true}
          onHeaderPress={onHeaderPress}
        />

        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          <View style={styles.contentSection}>
            {/* Date Picker - The Altar of Time */}
            <View style={styles.datePickerContainer}>
              {/* Mystical Icon */}
              <Text style={styles.mysticalIcon}>✦</Text>

              {/* Connected Date Input Container */}
              <View style={styles.dateInputContainer}>
                {/* Month Picker */}
                <Pressable style={styles.dateInputSegment} onPress={() => setShowMonthPicker(true)}>
                  <Text style={styles.dateInputLabel}>Month</Text>
                  <Text style={styles.dateInputValue}>
                    {selectedMonth !== null ? months[selectedMonth] : '—'}
                  </Text>
                </Pressable>

                {/* Vertical Divider */}
                <View style={styles.dateInputDivider} />

                {/* Day Picker */}
                <Pressable style={styles.dateInputSegment} onPress={() => setShowDayPicker(true)}>
                  <Text style={styles.dateInputLabel}>Day</Text>
                  <Text style={styles.dateInputValue}>
                    {selectedDay !== null ? selectedDay : '—'}
                  </Text>
                </Pressable>

                {/* Vertical Divider */}
                <View style={styles.dateInputDivider} />

                {/* Year Picker */}
                <Pressable style={styles.dateInputSegment} onPress={() => setShowYearPicker(true)}>
                  <Text style={styles.dateInputLabel}>Year</Text>
                  <Text style={styles.dateInputValue}>{selectedYear || '—'}</Text>
                </Pressable>
              </View>

              {/* Reveal Button */}
              <Pressable
                style={styles.revealButton}
                onPress={handleFindBirthday}
                disabled={!isDateValid}
              >
                <Text style={styles.revealButtonText}>Reveal My Sign</Text>
              </Pressable>
            </View>

            <SectionCard headerText='Your Cosmic Origin'>
              <Text style={styles.introText}>
                You were not born at a random moment. You arrived on a day with a specific energy, a
                "Nawal" that has influenced your character, your strengths, and your path since your
                first breath. Enter your date of birth to discover the ancient sign that guides your
                spirit.
              </Text>
            </SectionCard>

            <SectionCard headerText='What is a Mayan Birthday?'>
              <Text style={styles.introText}>
                Unlike the 365-day calendar we use to track the seasons, the Tzolkin (Sacred
                Calendar) is a 260-day cycle that tracks the rhythm of creation itself. It is not
                just about time; it is about energy.
                {'\n\n'}
                Your Mayan Sign is composed of two parts:
                {'\n\n'}• The Number (1-13): This represents your "tone" or potential—how you
                express power and intent.
                {'\n\n'}• The Nawal (Day Sign): One of 20 ancient archetypes (like the Rabbit, the
                Storm, or the Seed) that represents your character and spirit animal.
                {'\n\n'}
                Together, they form your Galactic Signature—a map of your soul’s purpose, your
                innate strengths, and the challenges you are here to master.
              </Text>
            </SectionCard>
          </View>
        </View>
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMonthPicker(false)}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
              {months.map((month, index) => (
                <Pressable
                  key={index}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedMonth(index);
                    setShowMonthPicker(false);
                    // Reset day if it's invalid for the new month
                    // Use current year as default if year not selected (for February leap year calculation)
                    if (selectedDay !== null) {
                      const yearForValidation = selectedYear || new Date().getFullYear();
                      const maxDays = daysInMonth(index, yearForValidation);
                      if (selectedDay > maxDays) {
                        setSelectedDay(null);
                      }
                    }
                  }}
                >
                  <Text style={styles.modalOptionText}>{month}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Day Picker Modal */}
      <Modal
        visible={showDayPicker}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowDayPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDayPicker(false)}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
              {getDaysArray().map((day) => (
                <Pressable
                  key={day}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedDay(day);
                    setShowDayPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{day}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowYearPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowYearPicker(false)}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
              {getYearsArray().map((year) => (
                <Pressable
                  key={year}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                    // Reset day if it's invalid for the new year
                    if (selectedMonth !== null && selectedDay) {
                      const maxDays = daysInMonth(selectedMonth, year);
                      if (selectedDay > maxDays) {
                        setSelectedDay(null);
                      }
                    }
                  }}
                >
                  <Text style={styles.modalOptionText}>{year}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  title: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  introText: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  datePickerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mysticalIcon: {
    fontSize: 32,
    color: 'rgba(249, 228, 183, 0.6)',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateInputContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(249, 228, 183, 0.25)',
    overflow: 'hidden',
    marginBottom: 24,
    minHeight: 80,
  },
  dateInputSegment: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInputDivider: {
    width: 1,
    backgroundColor: 'rgba(249, 228, 183, 0.2)',
    marginVertical: 12,
  },
  dateInputLabel: {
    ...type.body,
    fontSize: 11,
    color: 'rgba(249, 228, 183, 0.6)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateInputValue: {
    ...type.subtitle,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  dateInputValueEmpty: {
    color: 'rgba(249, 228, 183, 0.4)',
    fontSize: 18,
  },
  revealButton: {
    ...homePrimaryButton.button,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
  },
  revealButtonActive: {
    opacity: 1,
  },
  revealButtonDisabled: {
    opacity: 0.4,
  },
  revealButtonText: {
    ...type.subtitle,
    ...homePrimaryButton.text,
    fontSize: 18,
    fontWeight: '600',
  },
  revealButtonTextDisabled: {
    color: 'rgba(45, 27, 78, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingTop: 20,
  },
  modalOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    ...type.body,
    color: colors.text,
    fontSize: 18,
  },
});
