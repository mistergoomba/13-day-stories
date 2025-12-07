import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated, Switch, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../theme/colors';
import { type } from '../theme/typography';

const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';
const NOTIFICATION_TIME_KEY = '@notification_time';

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
  const [notificationTime, setNotificationTime] = useState('09:00'); // Default 9 AM
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
      const time = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
      
      if (enabled === 'true') {
        setNotificationsEnabled(true);
      }
      if (time) {
        setNotificationTime(time);
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

  const scheduleDailyNotification = async () => {
    if (!Notifications) {
      return;
    }
    try {
      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!notificationsEnabled) {
        return;
      }

      // Parse time (HH:MM format)
      const [hours, minutes] = notificationTime.split(':').map(Number);

      // Schedule daily notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Your Daily Story',
          body: 'Check your daily Mayan calendar reading',
          sound: true,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const handleToggle = async (value) => {
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
      await scheduleDailyNotification();
    } else {
      if (Notifications && Notifications.cancelAllScheduledNotificationsAsync) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    }
  };

  const handleTimeChange = async (newTime) => {
    setNotificationTime(newTime);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, newTime);
    } catch (error) {
      console.error('Error saving notification time:', error);
    }

    // Reschedule notification if enabled
    if (notificationsEnabled) {
      await scheduleDailyNotification();
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
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Daily Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive a daily reminder to check your Mayan calendar reading
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggle}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={notificationsEnabled ? colors.text : colors.textDim}
                />
              </View>

              {notificationsEnabled && (
                <View style={styles.timeSection}>
                  <Text style={styles.timeLabel}>Notification Time</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.timeScrollView}
                    contentContainerStyle={styles.timeScrollContent}
                  >
                    {timeOptions.map((time) => (
                      <Pressable
                        key={time}
                        style={[
                          styles.timeButton,
                          notificationTime === time && styles.timeButtonActive,
                        ]}
                        onPress={() => handleTimeChange(time)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            notificationTime === time && styles.timeButtonTextActive,
                          ]}
                        >
                          {formatTime(time)}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
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
    maxHeight: '80%',
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
    flex: 1,
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
  timeSection: {
    marginTop: 8,
  },
  timeLabel: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeScrollView: {
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

