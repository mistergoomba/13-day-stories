import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated } from 'react-native';
import { mainButton } from '../theme/buttons';
import colors from '../theme/colors';
import { type } from '../theme/typography';

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

export default function NawalNumberPicker({
  visible,
  onClose,
  onSave,
  initialTone,
  initialNawal,
  title = 'Select Mayan Date',
  buttonText = 'Set Mayan Date',
}) {
  const [selectedTone, setSelectedTone] = useState(null);
  const [selectedNawal, setSelectedNawal] = useState(null);
  const [showTonePicker, setShowTonePicker] = useState(false);
  const [showNawalPicker, setShowNawalPicker] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Initialize with initial values when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedTone(initialTone || null);
      setSelectedNawal(initialNawal || null);
      setShowTonePicker(false);
      setShowNawalPicker(false);
      setIsClosing(false);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [visible, initialTone, initialNawal, slideAnim]);

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

  const handleSave = () => {
    if (selectedTone === null || !selectedNawal) {
      return;
    }

    if (onSave) {
      onSave({ tone: selectedTone, nawal: selectedNawal });
    }
    handleClose();
  };

  const isDateValid = selectedTone !== null && selectedNawal !== null;

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
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Tone Picker Section */}
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Number (Tone)</Text>
                <Pressable
                  style={[styles.pickerButton, showTonePicker && styles.pickerButtonActive]}
                  onPress={() => {
                    setShowTonePicker(!showTonePicker);
                    setShowNawalPicker(false);
                  }}
                >
                  <Text style={styles.pickerButtonText}>
                    {selectedTone !== null ? selectedTone : 'Select Number'}
                  </Text>
                  <Text style={styles.pickerButtonArrow}>{showTonePicker ? '▲' : '▼'}</Text>
                </Pressable>

                {showTonePicker && (
                  <View style={styles.pickerOptions}>
                    {TONES.map((tone) => (
                      <Pressable
                        key={tone}
                        style={[
                          styles.pickerOption,
                          selectedTone === tone && styles.pickerOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedTone(tone);
                          setShowTonePicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            selectedTone === tone && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {tone}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* Nawal Picker Section */}
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Nawal (Sign)</Text>
                <Pressable
                  style={[styles.pickerButton, showNawalPicker && styles.pickerButtonActive]}
                  onPress={() => {
                    setShowNawalPicker(!showNawalPicker);
                    setShowTonePicker(false);
                  }}
                >
                  <Text style={styles.pickerButtonText}>{selectedNawal || 'Select Nawal'}</Text>
                  <Text style={styles.pickerButtonArrow}>{showNawalPicker ? '▲' : '▼'}</Text>
                </Pressable>

                {showNawalPicker && (
                  <View style={styles.pickerOptions}>
                    {NAWALES.map((nawal) => (
                      <Pressable
                        key={nawal}
                        style={[
                          styles.pickerOption,
                          selectedNawal === nawal && styles.pickerOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedNawal(nawal);
                          setShowNawalPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            selectedNawal === nawal && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {nawal}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* Selected Display */}
              {isDateValid && (
                <View style={styles.selectedDisplay}>
                  <Text style={styles.selectedLabel}>Selected:</Text>
                  <Text style={styles.selectedValue}>
                    {selectedTone} {selectedNawal}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  mainButton.button,
                  styles.saveButton,
                  !isDateValid && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!isDateValid}
              >
                <Text style={[mainButton.text, styles.saveButtonText]}>{buttonText}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
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
    maxHeight: '80%',
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
    maxHeight: 400,
  },
  pickerSection: {
    padding: 20,
    paddingBottom: 10,
  },
  pickerLabel: {
    ...type.body,
    color: colors.textDim,
    fontSize: 14,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    minHeight: 50,
  },
  pickerButtonActive: {
    borderColor: colors.accent,
  },
  pickerButtonText: {
    ...type.body,
    color: colors.text,
    fontSize: 16,
    flex: 1,
  },
  pickerButtonArrow: {
    ...type.body,
    color: colors.textDim,
    fontSize: 12,
    marginLeft: 8,
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    maxHeight: 200,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: colors.accent + '20',
  },
  pickerOptionText: {
    ...type.body,
    color: colors.text,
    fontSize: 16,
  },
  pickerOptionTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  selectedDisplay: {
    padding: 20,
    backgroundColor: colors.bgSecondary,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedLabel: {
    ...type.body,
    color: colors.textDim,
    fontSize: 14,
    marginBottom: 4,
  },
  selectedValue: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  saveButton: {
    width: '100%',
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
