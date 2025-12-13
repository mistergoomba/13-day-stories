import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated, Switch, Platform, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { scheduleAllNotifications } from '../utils/notificationScheduler';
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

  // Generate time options (every hour from 6 AM to 10 PM)
  const timeOptions = [];
  for (let hour = 6; hour <= 22; hour++) {
    const timeStr = `${String(hour).padStart(2, '0')}:00`;
    timeOptions.push(timeStr);
  }
  
  // Also generate 30-minute options for more granularity
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
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.timeScrollView}
                        contentContainerStyle={styles.timeScrollContent}
                      >
                        {detailedTimeOptions.map((time) => (
                          <Pressable
                            key={time}
                            style={[
                              styles.timeButton,
                              morningTime === time && styles.timeButtonActive,
                              !morningEnabled && styles.timeButtonDisabled,
                            ]}
                            onPress={() => handleMorningTimeChange(time)}
                            disabled={!morningEnabled}
                          >
                            <Text
                              style={[
                                styles.timeButtonText,
                                morningTime === time && styles.timeButtonTextActive,
                                !morningEnabled && styles.timeButtonTextDisabled,
                              ]}
                            >
                              {formatTime(time)}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
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
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.timeScrollView}
                        contentContainerStyle={styles.timeScrollContent}
                      >
                        {detailedTimeOptions.map((time) => (
                          <Pressable
                            key={time}
                            style={[
                              styles.timeButton,
                              eveningTime === time && styles.timeButtonActive,
                              !eveningEnabled && styles.timeButtonDisabled,
                            ]}
                            onPress={() => handleEveningTimeChange(time)}
                            disabled={!eveningEnabled}
                          >
                            <Text
                              style={[
                                styles.timeButtonText,
                                eveningTime === time && styles.timeButtonTextActive,
                                !eveningEnabled && styles.timeButtonTextDisabled,
                              ]}
                            >
                              {formatTime(time)}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
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
            </View>
          </ScrollView>
        </Animated.View>
      </View>
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
  timeScrollView: {
    flex: 1,
    marginHorizontal: -20,
  },
  timeScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  timeButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '20',
  },
  timeButtonText: {
    ...type.body,
    color: colors.textDim,
    fontSize: 16,
  },
  timeButtonTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  timeButtonDisabled: {
    opacity: 0.5,
  },
  timeButtonTextDisabled: {
    opacity: 0.5,
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
});

