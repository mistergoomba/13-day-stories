import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { mainButton } from '../theme/buttons';
import Card from '../components/Card';
import SimpleHeader from '../components/SimpleHeader';
import DynamicBackground from '../components/DynamicBackground';

export default function PersonalScreenContent({ scrollViewRef, setCurrentView, setBirthdayDate }) {
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
    if (!selectedMonth || selectedDay === null || !selectedYear) {
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

      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <SimpleHeader
          title='Personal'
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          <View style={styles.contentSection}>
            <Card>
              <Text style={styles.title}>Find Your Mayan Birthday</Text>
              <Text style={styles.introText}>
                The Mayan calendar is a sacred 260-day cycle that combines 13 tones (numbers 1-13)
                with 20 day signs (nawales). Each day represents a unique combination of tone and
                sign, creating a distinct energetic quality.
              </Text>
              <Text style={styles.introText}>
                The tones cycle from 1 to 13, while the signs cycle through 20 different nawales.
                Together, they create a complete cycle of 260 days. Each 13-day period is called a
                trecena, named after the sign on Day 1.
              </Text>
              <Text style={styles.introText}>
                Enter your birthday below to discover your Mayan calendar day sign and receive
                personalized insights based on your birth energy.
              </Text>
            </Card>

            {/* Date Picker */}
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel}>Select Your Birthday</Text>

              <View style={styles.datePickerRow}>
                {/* Month Picker */}
                <Pressable
                  style={[styles.datePickerButton, !selectedMonth && styles.datePickerButtonEmpty]}
                  onPress={() => setShowMonthPicker(true)}
                >
                  <Text
                    style={[
                      styles.datePickerButtonText,
                      !selectedMonth && styles.datePickerButtonTextEmpty,
                    ]}
                  >
                    {selectedMonth !== null ? months[selectedMonth] : 'Month'}
                  </Text>
                </Pressable>

                {/* Day Picker */}
                <Pressable
                  style={[
                    styles.datePickerButton,
                    selectedDay === null && styles.datePickerButtonEmpty,
                  ]}
                  onPress={() => setShowDayPicker(true)}
                >
                  <Text
                    style={[
                      styles.datePickerButtonText,
                      selectedDay === null && styles.datePickerButtonTextEmpty,
                    ]}
                  >
                    {selectedDay !== null ? selectedDay : 'Day'}
                  </Text>
                </Pressable>

                {/* Year Picker */}
                <Pressable
                  style={[styles.datePickerButton, !selectedYear && styles.datePickerButtonEmpty]}
                  onPress={() => setShowYearPicker(true)}
                >
                  <Text
                    style={[
                      styles.datePickerButtonText,
                      !selectedYear && styles.datePickerButtonTextEmpty,
                    ]}
                  >
                    {selectedYear || 'Year'}
                  </Text>
                </Pressable>
              </View>

              {/* Find Birthday Button */}
              <Pressable
                style={[styles.findButton, !isDateValid && styles.findButtonDisabled]}
                onPress={handleFindBirthday}
                disabled={!isDateValid}
              >
                <Text
                  style={[styles.findButtonText, !isDateValid && styles.findButtonTextDisabled]}
                >
                  Find Your Mayan Birthday
                </Text>
              </Pressable>
            </View>
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
            <ScrollView>
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
            <ScrollView>
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
            <ScrollView>
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
    marginTop: 24,
  },
  datePickerLabel: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  datePickerButton: {
    ...mainButton.button,
    flex: 1,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  datePickerButtonEmpty: {
    // No opacity change - buttons should always look enabled
  },
  datePickerButtonText: {
    ...type.subtitle,
    ...mainButton.text,
    fontSize: 16,
  },
  datePickerButtonTextEmpty: {
    color: colors.textDim,
  },
  findButton: {
    ...mainButton.button,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findButtonDisabled: {
    opacity: 0.5,
  },
  findButtonText: {
    ...type.subtitle,
    ...mainButton.text,
    fontSize: 18,
    fontWeight: '600',
  },
  findButtonTextDisabled: {
    color: colors.textDim,
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
