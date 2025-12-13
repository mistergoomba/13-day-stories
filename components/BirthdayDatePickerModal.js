import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated, Dimensions } from 'react-native';
import { mainButton } from '../theme/buttons';
import colors from '../theme/colors';
import { type } from '../theme/typography';

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

export default function BirthdayDatePickerModal({
  visible,
  onClose,
  onSave,
  initialDate, // YYYY-MM-DD format
  title = 'Update Your Birthday',
  buttonText = 'Update Your Birthday',
}) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Initialize date picker with initial date when modal opens
  useEffect(() => {
    if (visible && initialDate) {
      const parts = initialDate.split('-');
      if (parts.length === 3) {
        setSelectedYear(parseInt(parts[0], 10));
        setSelectedMonth(parseInt(parts[1], 10) - 1); // Month is 0-indexed
        setSelectedDay(parseInt(parts[2], 10));
      }
    } else if (visible) {
      // Reset if no initial date
      setSelectedMonth(null);
      setSelectedDay(null);
      setSelectedYear(null);
    }
  }, [initialDate, visible]);

  // Animate modal content slide up/down
  useEffect(() => {
    if (visible && !isClosing) {
      // Reset closing state when modal opens
      setIsClosing(false);
      // Slide up
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else if (!visible) {
      // Reset animation when modal closes
      slideAnim.setValue(0);
      setIsClosing(false);
    }
  }, [visible, slideAnim, isClosing]);

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

  const handleClose = () => {
    if (isClosing) return; // Prevent multiple close calls
    setIsClosing(true);
    // Animate down before closing
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsClosing(false);
      onClose();
    });
  };

  const handleSave = () => {
    if (!selectedMonth || selectedDay === null || !selectedYear) {
      // Show error or validation message
      return;
    }

    // Create date string in YYYY-MM-DD format
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const dayStr = String(selectedDay).padStart(2, '0');
    const dateString = `${selectedYear}-${monthStr}-${dayStr}`;

    if (onSave) {
      onSave(dateString);
    }
    handleClose();
  };

  const isDateValid = selectedMonth !== null && selectedDay !== null && selectedYear !== null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0], // Start from 600px below, slide to 0
  });

  return (
    <>
      <Modal
        visible={visible || isClosing}
        transparent={true}
        animationType='none'
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleClose} />
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Pressable onPress={handleClose}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
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

                {/* Save Button */}
                <Pressable
                  style={[styles.saveButton, !isDateValid && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={!isDateValid}
                >
                  <Text
                    style={[styles.saveButtonText, !isDateValid && styles.saveButtonTextDisabled]}
                  >
                    {buttonText}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </View>

        {/* Month Picker Modal */}
        <Modal
          visible={showMonthPicker}
          transparent={true}
          animationType='slide'
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <Pressable style={styles.pickerModalOverlay} onPress={() => setShowMonthPicker(false)}>
            <View style={styles.pickerModalContent}>
              <ScrollView>
                {months.map((month, index) => (
                  <Pressable
                    key={index}
                    style={styles.pickerModalOption}
                    onPress={() => {
                      setSelectedMonth(index);
                      setShowMonthPicker(false);
                      // Reset day if it's invalid for the new month
                      if (selectedDay !== null) {
                        const yearForValidation = selectedYear || new Date().getFullYear();
                        const maxDays = daysInMonth(index, yearForValidation);
                        if (selectedDay > maxDays) {
                          setSelectedDay(null);
                        }
                      }
                    }}
                  >
                    <Text style={styles.pickerModalOptionText}>{month}</Text>
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
          <Pressable style={styles.pickerModalOverlay} onPress={() => setShowDayPicker(false)}>
            <View style={styles.pickerModalContent}>
              <ScrollView>
                {getDaysArray().map((day) => (
                  <Pressable
                    key={day}
                    style={styles.pickerModalOption}
                    onPress={() => {
                      setSelectedDay(day);
                      setShowDayPicker(false);
                    }}
                  >
                    <Text style={styles.pickerModalOptionText}>{day}</Text>
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
          <Pressable style={styles.pickerModalOverlay} onPress={() => setShowYearPicker(false)}>
            <View style={styles.pickerModalContent}>
              <ScrollView>
                {getYearsArray().map((year) => (
                  <Pressable
                    key={year}
                    style={styles.pickerModalOption}
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
                    <Text style={styles.pickerModalOptionText}>{year}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </Modal>
    </>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8, // 80% of screen height
    minHeight: 300, // Ensure minimum height so content is visible
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...type.title,
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '300',
  },
  modalScrollView: {
    // Calculate height: modal max height minus header height and padding
    maxHeight: SCREEN_HEIGHT * 0.8 - 100, // Account for header and padding
  },
  modalBody: {
    padding: 20,
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
  saveButton: {
    ...mainButton.button,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...type.subtitle,
    ...mainButton.text,
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: colors.textDim,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingTop: 20,
  },
  pickerModalOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerModalOptionText: {
    ...type.body,
    color: colors.text,
    fontSize: 18,
  },
});

