import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { mainButton } from '../theme/buttons';

const HAS_OPENED_APP_KEY = '@has_opened_app';
const BIRTHDAY_DATE_KEY = '@birthday_date';
const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';
const NOTIFICATION_TIME_KEY = '@notification_time';

export default function DataStorageModal({ visible, onClose, onDataCleared }) {
  const insets = useSafeAreaInsets();
  const [isClosing, setIsClosing] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Animate modal content slide up/down
  React.useEffect(() => {
    if (visible && !isClosing) {
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

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all stored data including your birthday, notification settings, and cached content. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get all keys
              const allKeys = await AsyncStorage.getAllKeys();
              
              // Filter to only app data keys (keep system keys if any)
              const appKeys = allKeys.filter(key => 
                key.startsWith('@') && 
                (key === HAS_OPENED_APP_KEY ||
                 key === BIRTHDAY_DATE_KEY ||
                 key === NOTIFICATIONS_ENABLED_KEY ||
                 key === NOTIFICATION_TIME_KEY ||
                 key.startsWith('@today_') ||
                 key.startsWith('@trecena_') ||
                 key.startsWith('@image_'))
              );

              // Remove all app data keys
              await AsyncStorage.multiRemove(appKeys);

              // Cancel any scheduled notifications
              try {
                const Notifications = require('expo-notifications');
                if (Notifications && Notifications.cancelAllScheduledNotificationsAsync) {
                  await Notifications.cancelAllScheduledNotificationsAsync();
                }
              } catch (error) {
                // Notifications might not be available, ignore
                console.log('Could not cancel notifications:', error);
              }

              // Callback to notify parent
              if (onDataCleared) {
                onDataCleared();
              }

              Alert.alert(
                'Data Cleared',
                'All app data has been cleared successfully.',
                [{ text: 'OK', onPress: handleClose }]
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert(
                'Error',
                'Failed to clear data. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

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
            <Text style={styles.modalTitle}>Data & Storage</Text>
            <Pressable onPress={handleClose}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView 
            style={styles.modalScrollView} 
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalBody}>
              <Text style={styles.description}>
                Manage your app data and storage. Clearing data will remove all stored information including your birthday, notification settings, and cached content.
              </Text>

              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ This action cannot be undone. You will need to set up your profile again after clearing data.
                </Text>
              </View>

              <Pressable
                style={[styles.clearButton, mainButton.button]}
                onPress={handleClearData}
              >
                <Text style={[styles.clearButtonText, mainButton.text]}>
                  Clear All Data
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
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
  description: {
    ...type.body,
    color: colors.textDim,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  warningBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.accent + '15',
    borderWidth: 1,
    borderColor: colors.accent + '30',
    marginBottom: 24,
  },
  warningText: {
    ...type.body,
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
  },
  clearButton: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4444',
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    ...type.subtitle,
    fontSize: 18,
    fontWeight: '600',
    color: '#ff4444',
  },
});

