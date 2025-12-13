import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated, Switch, Platform, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { scheduleAllNotifications, testNotification } from '../utils/notificationScheduler';
import { NOTIFICATION_CONFIG } from '../utils/notificationConfig';

const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';
const MORNING_ENABLED_KEY = '@morning_notifications_enabled';
const EVENING_ENABLED_KEY = '@evening_notifications_enabled';
const MORNING_TIME_KEY = '@morning_notification_time';
const EVENING_TIME_KEY = '@evening_notification_time';

// Lazy load notifications module
let Notifications = null;
try {
  Notifications = require('expo-notifications');
  // Configure notification handler
  if (Notifications && Notifications.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (error) {
  console.log('expo-notifications not available:', error);
}

export default function NotificationsModal({ visible, onClose }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState('08:00'); // Default 8 AM
  const [eveningTime, setEveningTime] = useState('20:00'); // Default 8 PM
  const [hasPermission, setHasPermission] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showMorningTimePicker, setShowMorningTimePicker] = useState(false);
  const [showEveningTimePicker, setShowEveningTimePicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Load saved notification settings and check permission
  useEffect(() => {
    if (visible) {
      const initializeSettings = async () => {
        await checkPermission();
        await loadNotificationSettings();
      };
      initializeSettings();
    }
  }, [visible]);

  // Animate modal content slide up/down
  useEffect(() => {
    if (visible && !isClosing) {
      setIsClosing(false);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else if (!visible) {
      slideAnim.setValue(0);
      setIsClosing(false);
    }
  }, [visible, slideAnim, isClosing]);

  const loadNotificationSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      const morningEnabledValue = await AsyncStorage.getItem(MORNING_ENABLED_KEY);
      const eveningEnabledValue = await AsyncStorage.getItem(EVENING_ENABLED_KEY);
      const morningTimeValue = await AsyncStorage.getItem(MORNING_TIME_KEY);
      const eveningTimeValue = await AsyncStorage.getItem(EVENING_TIME_KEY);
      
      if (enabled === 'true') {
        setNotificationsEnabled(true);
      }
      if (morningEnabledValue === 'true') {
        setMorningEnabled(true);
      } else if (morningEnabledValue === 'false') {
        setMorningEnabled(false);
      }
      if (eveningEnabledValue === 'true') {
        setEveningEnabled(true);
      } else if (eveningEnabledValue === 'false') {
        setEveningEnabled(false);
      }
      if (morningTimeValue) {
        setMorningTime(morningTimeValue);
      } else {
        // Set default
        const defaultTime = `${String(NOTIFICATION_CONFIG.defaultMorningTime.hour).padStart(2, '0')}:${String(NOTIFICATION_CONFIG.defaultMorningTime.minute).padStart(2, '0')}`;
        setMorningTime(defaultTime);
      }
      if (eveningTimeValue) {
        setEveningTime(eveningTimeValue);
      } else {
        // Set default
        const defaultTime = `${String(NOTIFICATION_CONFIG.defaultEveningTime.hour).padStart(2, '0')}:${String(NOTIFICATION_CONFIG.defaultEveningTime.minute).padStart(2, '0')}`;
        setEveningTime(defaultTime);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const checkPermission = async () => {
    if (!Notifications) {
      setHasPermission(false);
      return;
    }
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking notification permission:', error);
      setHasPermission(false);
    }
  };

  const requestPermission = async () => {
    if (!Notifications) {
      Alert.alert(
        'Notifications Not Available',
        'Notification support is not available in this environment.',
        [{ text: 'OK' }]
      );
      return false;
    }
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.',
          [{ text: 'OK' }]
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const handleMasterToggle = async (value) => {
    if (value && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return; // Don't enable if permission not granted
      }
    }

    setNotificationsEnabled(value);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, value ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }

    // Schedule or cancel notifications
    if (value) {
      await scheduleAllNotifications();
    } else {
      if (Notifications && Notifications.cancelAllScheduledNotificationsAsync) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    }
  };

  const handleMorningToggle = async (value) => {
    if (value && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return; // Don't enable if permission not granted
      }
    }

    setMorningEnabled(value);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(MORNING_ENABLED_KEY, value ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving morning notification setting:', error);
    }

    // Reschedule notifications
    if (notificationsEnabled) {
      await scheduleAllNotifications();
    }
  };

  const handleEveningToggle = async (value) => {
    if (value && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return; // Don't enable if permission not granted
      }
    }

    setEveningEnabled(value);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(EVENING_ENABLED_KEY, value ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving evening notification setting:', error);
    }

    // Reschedule notifications
    if (notificationsEnabled) {
      await scheduleAllNotifications();
    }
  };

  const handleMorningTimeChange = async (newTime) => {
    setMorningTime(newTime);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(MORNING_TIME_KEY, newTime);
    } catch (error) {
      console.error('Error saving morning notification time:', error);
    }

    // Reschedule notifications if enabled
    if (notificationsEnabled && morningEnabled) {
      await scheduleAllNotifications();
    }
  };

  const handleEveningTimeChange = async (newTime) => {
    setEveningTime(newTime);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(EVENING_TIME_KEY, newTime);
    } catch (error) {
      console.error('Error saving evening notification time:', error);
    }

    // Reschedule notifications if enabled
    if (notificationsEnabled && eveningEnabled) {
      await scheduleAllNotifications();
    }
  };

  const handleTestNotification = async () => {
    if (!Notifications) {
      Alert.alert(
        'Notifications Not Available',
        'Notification support is not available in this environment. Please use a development build or production build.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await testNotification();
    if (result.success) {
      Alert.alert(
        'Test Notification Scheduled',
        result.message,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Test Failed',
        result.error || 'Failed to schedule test notification',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsClosing(false);
      onClose();
    });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  // Generate 30-minute time options (from 6 AM to 10 PM)
  const detailedTimeOptions = [];
  for (let hour = 6; hour <= 22; hour++) {
    detailedTimeOptions.push(`${String(hour).padStart(2, '0')}:00`);
    detailedTimeOptions.push(`${String(hour).padStart(2, '0')}:30`);
  }

  return (
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
            <Text style={styles.modalTitle}>Notifications</Text>
            <Pressable onPress={handleClose}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.modalBody}>
              {/* Master Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive daily reminders to check your Mayan calendar reading
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleMasterToggle}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={notificationsEnabled ? colors.text : colors.textDim}
                />
              </View>

              {notificationsEnabled && (
                <>
                  {/* Morning Notifications */}
                  <View style={styles.notificationSection}>
                    <Text style={styles.sectionLabel}>Morning Notifications</Text>
                    <View style={styles.toggleTimeRow}>
                      <Switch
                        value={morningEnabled}
                        onValueChange={handleMorningToggle}
                        trackColor={{ false: colors.border, true: colors.accent }}
                        thumbColor={morningEnabled ? colors.text : colors.textDim}
                      />
                      <Pressable
                        style={[
                          styles.timeSelector,
                          !morningEnabled && styles.timeSelectorDisabled,
                        ]}
                        onPress={() => morningEnabled && setShowMorningTimePicker(true)}
                        disabled={!morningEnabled}
                      >
                        <Text
                          style={[
                            styles.timeSelectorText,
                            !morningEnabled && styles.timeSelectorTextDisabled,
                          ]}
                        >
                          {formatTime(morningTime)}
                        </Text>
                        <Text style={styles.timeSelectorArrow}>▼</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Evening Notifications */}
                  <View style={styles.notificationSection}>
                    <Text style={styles.sectionLabel}>Evening Notifications</Text>
                    <View style={styles.toggleTimeRow}>
                      <Switch
                        value={eveningEnabled}
                        onValueChange={handleEveningToggle}
                        trackColor={{ false: colors.border, true: colors.accent }}
                        thumbColor={eveningEnabled ? colors.text : colors.textDim}
                      />
                      <Pressable
                        style={[
                          styles.timeSelector,
                          !eveningEnabled && styles.timeSelectorDisabled,
                        ]}
                        onPress={() => eveningEnabled && setShowEveningTimePicker(true)}
                        disabled={!eveningEnabled}
                      >
                        <Text
                          style={[
                            styles.timeSelectorText,
                            !eveningEnabled && styles.timeSelectorTextDisabled,
                          ]}
                        >
                          {formatTime(eveningTime)}
                        </Text>
                        <Text style={styles.timeSelectorArrow}>▼</Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              )}

              {!hasPermission && notificationsEnabled && (
                <View style={styles.permissionWarning}>
                  <Text style={styles.permissionWarningText}>
                    Notification permission is required. Please enable it in your device settings.
                  </Text>
                </View>
              )}

              {/* Test Notification Button */}
              {notificationsEnabled && hasPermission && (
                <View style={styles.testButtonContainer}>
                  <Pressable
                    style={styles.testButton}
                    onPress={handleTestNotification}
                  >
                    <Text style={styles.testButtonText}>🧪 Send Test Notification</Text>
                  </Pressable>
                  <Text style={styles.testButtonDescription}>
                    Sends a test notification in 5 seconds
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>

      {/* Morning Time Picker Modal */}
      <Modal
        visible={showMorningTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMorningTimePicker(false)}
      >
        <View style={styles.timePickerOverlay}>
          <Pressable 
            style={styles.timePickerBackdrop}
            onPress={() => setShowMorningTimePicker(false)}
          />
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>Select Morning Time</Text>
              <Pressable onPress={() => setShowMorningTimePicker(false)}>
                <Text style={styles.timePickerClose}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.timePickerList}>
              {detailedTimeOptions.map((time) => (
                <Pressable
                  key={time}
                  style={[
                    styles.timePickerItem,
                    morningTime === time && styles.timePickerItemActive,
                  ]}
                  onPress={() => {
                    handleMorningTimeChange(time);
                    setShowMorningTimePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timePickerItemText,
                      morningTime === time && styles.timePickerItemTextActive,
                    ]}
                  >
                    {formatTime(time)}
                  </Text>
                  {morningTime === time && (
                    <Text style={styles.timePickerCheckmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Evening Time Picker Modal */}
      <Modal
        visible={showEveningTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEveningTimePicker(false)}
      >
        <View style={styles.timePickerOverlay}>
          <Pressable 
            style={styles.timePickerBackdrop}
            onPress={() => setShowEveningTimePicker(false)}
          />
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>Select Evening Time</Text>
              <Pressable onPress={() => setShowEveningTimePicker(false)}>
                <Text style={styles.timePickerClose}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.timePickerList}>
              {detailedTimeOptions.map((time) => (
                <Pressable
                  key={time}
                  style={[
                    styles.timePickerItem,
                    eveningTime === time && styles.timePickerItemActive,
                  ]}
                  onPress={() => {
                    handleEveningTimeChange(time);
                    setShowEveningTimePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timePickerItemText,
                      eveningTime === time && styles.timePickerItemTextActive,
                    ]}
                  >
                    {formatTime(time)}
                  </Text>
                  {eveningTime === time && (
                    <Text style={styles.timePickerCheckmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

function formatTime(time24) {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    ...type.body,
    color: colors.textDim,
    fontSize: 14,
  },
  notificationSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionLabel: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  toggleTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  timeSelectorDisabled: {
    opacity: 0.5,
  },
  timeSelectorText: {
    ...type.body,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  timeSelectorTextDisabled: {
    opacity: 0.5,
  },
  timeSelectorArrow: {
    color: colors.textDim,
    fontSize: 12,
    marginLeft: 8,
  },
  timePickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timePickerModal: {
    backgroundColor: colors.bg,
    borderRadius: 20,
    width: '80%',
    maxWidth: 400,
    maxHeight: SCREEN_HEIGHT * 0.7,
    overflow: 'hidden',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timePickerTitle: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  timePickerClose: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '300',
  },
  timePickerList: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  timePickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timePickerItemActive: {
    backgroundColor: colors.accent + '15',
  },
  timePickerItemText: {
    ...type.body,
    color: colors.text,
    fontSize: 16,
  },
  timePickerItemTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  timePickerCheckmark: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionWarning: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.accent + '15',
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  permissionWarningText: {
    ...type.body,
    color: colors.textDim,
    fontSize: 14,
  },
  testButtonContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  testButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    ...type.subtitle,
    color: colors.bg,
    fontSize: 16,
    fontWeight: '600',
  },
  testButtonDescription: {
    ...type.body,
    color: colors.textDim,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

