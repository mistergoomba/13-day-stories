import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mainButton } from '../theme/buttons';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { incrementMayanDate, decrementMayanDate } from '../utils/calendarUtils';

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

const NAWALES = [
  'Imox',
  "Iq'",
  "Aq'ab'al",
  "K'at",
  'Kan',
  'Kame',
  'Kej',
  "Q'anil",
  'Toj',
  "Tz'i'",
  "B'atz'",
  "E'",
  'Aj',
  'Ix',
  "Tz'ikin",
  'Ajmaq',
  "No'j",
  'Tijax',
  'Kawoq',
  'Ajpu',
];

const TONES = Array.from({ length: 13 }, (_, i) => i + 1);

export default function DevDatePickerPanel({
  visible,
  onClose,
  onDateSave,
  onMayanSave,
  initialDate,
  initialTone,
  initialNawal,
}) {
  const insets = useSafeAreaInsets();// Gregorian date picker state
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Mayan date picker state
  const [selectedTone, setSelectedTone] = useState(null);
  const [selectedNawal, setSelectedNawal] = useState(null);
  const [showTonePickerModal, setShowTonePickerModal] = useState(false);
  const [showNawalPickerModal, setShowNawalPickerModal] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Initialize with initial values when modal opens
  useEffect(() => {
    if (visible) {
      // Initialize Gregorian date
      if (initialDate) {
        const parts = initialDate.split('-');
        if (parts.length === 3) {
          setSelectedYear(parseInt(parts[0], 10));
          setSelectedMonth(parseInt(parts[1], 10) - 1); // Month is 0-indexed
          setSelectedDay(parseInt(parts[2], 10));
        }
      } else {
        setSelectedMonth(null);
        setSelectedDay(null);
        setSelectedYear(null);
      }

      // Initialize Mayan date
      setSelectedTone(initialTone || null);
      setSelectedNawal(initialNawal || null);

      setIsClosing(false);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [visible, initialDate, initialTone, initialNawal, slideAnim]);

  const handleClose = () => {
    setIsClosing(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start(() => {
      setIsClosing(false);
      if (onClose) {
        onClose();
      }
    });
  };

  const daysInMonth = (month, year) => {
    if (month === 1) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    }
    const days31 = [0, 2, 4, 6, 7, 9, 11];
    return days31.includes(month) ? 31 : 30;
  };

  const getDaysArray = () => {
    if (selectedMonth === null) {
      return Array.from({ length: 31 }, (_, i) => i + 1);
    }
    const yearForCalculation = selectedYear || new Date().getFullYear();
    const daysCount = daysInMonth(selectedMonth, yearForCalculation);
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };

  const getYearsArray = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 1900;
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
  };

  const handleDateSave = () => {
    if (selectedMonth === null || selectedDay === null || selectedYear === null) {
      return;
    }

    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const dayStr = String(selectedDay).padStart(2, '0');
    const dateString = `${selectedYear}-${monthStr}-${dayStr}`;

    if (onDateSave) {
      onDateSave(dateString);
    }
    handleClose();
  };

  const handleMayanSave = () => {
    // If nothing selected, use defaults
    const tone = selectedTone !== null ? selectedTone : 1;
    const nawal = selectedNawal || 'Imox';

    if (onMayanSave) {
      onMayanSave({ tone, nawal });
    }
    handleClose();
  };

  const handleMayanIncrement = () => {
    // If nothing selected, start with 1 Imox
    if (selectedTone === null || !selectedNawal) {
      setSelectedTone(1);
      setSelectedNawal('Imox');
      return;
    }
    try {
      const next = incrementMayanDate(selectedTone, selectedNawal);
      setSelectedTone(next.tone);
      setSelectedNawal(next.sign);
    } catch (error) {
      console.error('Error incrementing Mayan date:', error);
    }
  };

  const handleMayanDecrement = () => {
    // If nothing selected, start with 13 Ajpu
    if (selectedTone === null || !selectedNawal) {
      setSelectedTone(13);
      setSelectedNawal('Ajpu');
      return;
    }
    try {
      const prev = decrementMayanDate(selectedTone, selectedNawal);
      setSelectedTone(prev.tone);
      setSelectedNawal(prev.sign);
    } catch (error) {
      console.error('Error decrementing Mayan date:', error);
    }
  };

  const isDateValid = selectedMonth !== null && selectedDay !== null && selectedYear !== null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
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
              <Text style={styles.modalTitle}>Dev: Date Override Panel</Text>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Gregorian Date Picker Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gregorian Date Override</Text>
                <Text style={styles.sectionDescription}>
                  Sets both "today" date and birthday date. Clears Mayan override.
                </Text>

                <View style={styles.datePickerRow}>
                  <Pressable
                    style={styles.datePickerButton}
                    onPress={() => setShowMonthPicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {selectedMonth !== null ? months[selectedMonth] : 'Month'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.datePickerButton}
                    onPress={() => setShowDayPicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {selectedDay !== null ? selectedDay : 'Day'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.datePickerButton}
                    onPress={() => setShowYearPicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {selectedYear || 'Year'}
                    </Text>
                  </Pressable>
                </View>

                <Pressable style={[mainButton.button, styles.saveButton]} onPress={handleDateSave}>
                  <Text style={[mainButton.text, styles.saveButtonText]}>
                    Set Date & Clear Mayan Override
                  </Text>
                </Pressable>
              </View>

              {/* Padding */}
              <View style={styles.padding} />

              {/* Mayan Date Picker Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mayan Date Override</Text>
                <Text style={styles.sectionDescription}>
                  Sets tone and nawal directly. Clears Gregorian override.
                </Text>

                {/* Number/Nawal Picker with Arrows */}
                <View style={styles.mayanPickerRow}>
                  {/* Previous Arrow */}
                  <Pressable style={styles.arrowButton} onPress={handleMayanDecrement}>
                    <Text style={styles.arrowText}>←</Text>
                  </Pressable>

                  {/* Tone Picker */}
                  <Pressable
                    style={styles.datePickerButton}
                    onPress={() => setShowTonePickerModal(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {selectedTone !== null ? selectedTone : 'Number'}
                    </Text>
                  </Pressable>

                  {/* Nawal Picker */}
                  <Pressable
                    style={styles.datePickerButton}
                    onPress={() => setShowNawalPickerModal(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {selectedNawal || 'Nawal'}
                    </Text>
                  </Pressable>

                  {/* Next Arrow */}
                  <Pressable style={styles.arrowButton} onPress={handleMayanIncrement}>
                    <Text style={styles.arrowText}>→</Text>
                  </Pressable>
                </View>

                <Pressable style={[mainButton.button, styles.saveButton]} onPress={handleMayanSave}>
                  <Text style={[mainButton.text, styles.saveButtonText]}>
                    Set Mayan Date & Clear Gregorian Override
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <Pressable style={styles.pickerModalOverlay} onPress={() => setShowMonthPicker(false)}>
          <View style={styles.pickerModalContent}>
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
              {months.map((month, index) => (
                <Pressable
                  key={index}
                  style={styles.pickerModalOption}
                  onPress={() => {
                    setSelectedMonth(index);
                    setShowMonthPicker(false);
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
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
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
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
              {getYearsArray().map((year) => (
                <Pressable
                  key={year}
                  style={styles.pickerModalOption}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
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

      {/* Tone Picker Modal */}
      <Modal
        visible={showTonePickerModal}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowTonePickerModal(false)}
      >
        <Pressable style={styles.pickerModalOverlay} onPress={() => setShowTonePickerModal(false)}>
          <View style={styles.pickerModalContent}>
            <ScrollView>
              {TONES.map((tone) => (
                <Pressable
                  key={tone}
                  style={styles.pickerModalOption}
                  onPress={() => {
                    setSelectedTone(tone);
                    setShowTonePickerModal(false);
                  }}
                >
                  <Text style={styles.pickerModalOptionText}>{tone}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Nawal Picker Modal */}
      <Modal
        visible={showNawalPickerModal}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowNawalPickerModal(false)}
      >
        <Pressable style={styles.pickerModalOverlay} onPress={() => setShowNawalPickerModal(false)}>
          <View style={styles.pickerModalContent}>
            <ScrollView>
              {NAWALES.map((nawal) => (
                <Pressable
                  key={nawal}
                  style={styles.pickerModalOption}
                  onPress={() => {
                    setSelectedNawal(nawal);
                    setShowNawalPickerModal(false);
                  }}
                >
                  <Text style={styles.pickerModalOptionText}>{nawal}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    ...type.body,
    color: colors.textDim,
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    ...type.body,
    color: colors.textDim,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    marginTop: 24,
  },
  saveButtonText: {
    ...type.subtitle,
    ...mainButton.text,
    fontSize: 18,
    fontWeight: '600',
  },
  padding: {
    height: 24,
  },
  mayanPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  arrowButton: {
    ...mainButton.button,
    width: 60,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  arrowText: {
    ...type.subtitle,
    ...mainButton.text,
    fontSize: 24,
    fontWeight: '600',
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
    paddingBottom: 20,
  },
  pickerModalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerModalOptionText: {
    ...type.body,
    color: colors.text,
    fontSize: 16,
  },
});
