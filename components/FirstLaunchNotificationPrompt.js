import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { mainButton } from '../theme/buttons';
import { scheduleAllNotifications } from '../utils/notificationScheduler';
import { NOTIFICATION_CONFIG } from '../utils/notificationConfig';
import { recordDismissal } from '../utils/notificationPromptManager';

const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';
const MORNING_ENABLED_KEY = '@morning_notifications_enabled';
const EVENING_ENABLED_KEY = '@evening_notifications_enabled';
const MORNING_TIME_KEY = '@morning_notification_time';
const EVENING_TIME_KEY = '@evening_notification_time';

// Lazy load notifications module
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('expo-notifications not available:', error);
}

export default function FirstLaunchNotificationPrompt({ visible, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Animate modal appearance
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, fadeAnim, scaleAnim]);

  const handleEnableNotifications = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Check if notifications are available
      if (!Notifications) {
        Alert.alert(
          'Notifications Not Available',
          'Notification support is not available in this environment.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsProcessing(false);
                onComplete(false);
              },
            },
          ]
        );
        return;
      }

      // Request permission
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        // Set notification defaults
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
        await AsyncStorage.setItem(MORNING_ENABLED_KEY, 'true');
        await AsyncStorage.setItem(EVENING_ENABLED_KEY, 'true');

        // Set default times
        const morningTime = `${String(NOTIFICATION_CONFIG.defaultMorningTime.hour).padStart(
          2,
          '0'
        )}:${String(NOTIFICATION_CONFIG.defaultMorningTime.minute).padStart(2, '0')}`;
        const eveningTime = `${String(NOTIFICATION_CONFIG.defaultEveningTime.hour).padStart(
          2,
          '0'
        )}:${String(NOTIFICATION_CONFIG.defaultEveningTime.minute).padStart(2, '0')}`;
        await AsyncStorage.setItem(MORNING_TIME_KEY, morningTime);
        await AsyncStorage.setItem(EVENING_TIME_KEY, eveningTime);

        // Schedule notifications
        await scheduleAllNotifications();

        setIsProcessing(false);
        onComplete(true);
      } else {
        // Permission denied
        Alert.alert(
          'Permission Required',
          'To receive daily reminders, please enable notifications in your device settings.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsProcessing(false);
                onComplete(false);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      Alert.alert('Error', 'Failed to enable notifications. Please try again later.', [
        {
          text: 'OK',
          onPress: () => {
            setIsProcessing(false);
            onComplete(false);
          },
        },
      ]);
    }
  };

  const handleMaybeLater = async () => {
    if (isProcessing) return;
    // Record dismissal for retry logic
    await recordDismissal();
    onComplete(false);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='none'
      onRequestClose={() => {}} // Prevent closing with back button
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Image source={require('../assets/book-icon.png')} style={styles.icon} />
            <Text style={styles.title}>Your Daily Spirit Guide</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.description}>
              Let the wisdom of the Mayan Calendar guide your morning intention and evening
              reflection.
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>☀️</Text>
                <Text style={styles.benefitText}>
                  Morning Alignment: Receive your Daily Energy & Meditation.
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>🌙</Text>
                <Text style={styles.benefitText}>
                  Evening Wisdom: Close your day with the evolving 13-Day Story.
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>✨</Text>
                <Text style={styles.benefitText}>
                  Stay Tuned: Never miss a shift in the cosmic energy.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttons}>
            <Pressable
              style={[
                mainButton.button,
                styles.enableButton,
                isProcessing && styles.buttonDisabled,
              ]}
              onPress={handleEnableNotifications}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={[mainButton.text, styles.enableButtonText]}>
                  Connect to the Energy
                </Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.maybeLaterButton, isProcessing && styles.buttonDisabled]}
              onPress={handleMaybeLater}
              disabled={isProcessing}
            >
              <Text style={styles.maybeLaterText}>Maybe Later</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  icon: {
    width: 128,
    height: 100,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  title: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  description: {
    ...type.body,
    color: colors.textDim,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitBullet: {
    fontSize: 20,
    lineHeight: 22,
  },
  benefitText: {
    ...type.body,
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  buttons: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  enableButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  maybeLaterButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  maybeLaterText: {
    ...type.body,
    color: colors.textDim,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
