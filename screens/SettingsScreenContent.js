import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import SimpleHeader from '../components/SimpleHeader';
import DynamicBackground from '../components/DynamicBackground';
import BirthdayDatePickerModal from '../components/BirthdayDatePickerModal';
import NotificationsModal from '../components/NotificationsModal';
import DataStorageModal from '../components/DataStorageModal';
import PrivacyModal from '../components/PrivacyModal';
import TermsOfServiceModal from '../components/TermsOfServiceModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../theme/colors';
import { type } from '../theme/typography';

const BIRTHDAY_KEY = '@user_birthday';
const BIRTHDAY_DATE_KEY = '@birthday_date';

export default function SettingsScreenContent({ scrollViewRef, setCurrentView, setBirthdayDate, birthdayDate, onPersonalPress }) {
  const insets = useSafeAreaInsets();
  
  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  // Default background colors for settings screen
  const defaultBackgroundColors = {
    primary: '#12091A',
    secondary: '#1C0F29',
    accent: '#6E45CF',
  };

  // Modal states
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showDataStorageModal, setShowDataStorageModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleUpdateBirthday = async (newDateString) => {
    await AsyncStorage.setItem(BIRTHDAY_KEY, newDateString);
    await AsyncStorage.setItem(BIRTHDAY_DATE_KEY, newDateString);
    if (setBirthdayDate) {
      setBirthdayDate(newDateString);
    }
  };

  const handleDataCleared = () => {
    // Reset birthday date in parent component
    if (setBirthdayDate) {
      setBirthdayDate(null);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={defaultBackgroundColors} />

      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <SimpleHeader
          title='Settings'
          onAccountPress={onPersonalPress}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          <Card>
            <Text style={styles.sectionTitle}>App Preferences</Text>
            <Pressable onPress={() => setShowBirthdayModal(true)}>
              <Text style={styles.settingItem}>Profile</Text>
            </Pressable>
            <Pressable onPress={() => setShowNotificationsModal(true)}>
              <Text style={styles.settingItem}>Notifications</Text>
            </Pressable>
            <Pressable onPress={() => setShowDataStorageModal(true)}>
              <Text style={styles.settingItem}>Data & Storage</Text>
            </Pressable>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.settingItem}>Version 1.0.0</Text>
            <Pressable onPress={() => setShowPrivacyModal(true)}>
              <Text style={styles.settingItem}>Privacy</Text>
            </Pressable>
            <Pressable onPress={() => setShowTermsModal(true)}>
              <Text style={styles.settingItem}>Terms of Service</Text>
            </Pressable>
          </Card>
        </View>
      </ScrollView>

      {/* Birthday Update Modal */}
      <BirthdayDatePickerModal
        visible={showBirthdayModal}
        onClose={() => setShowBirthdayModal(false)}
        onSave={handleUpdateBirthday}
        initialDate={birthdayDate}
        title='Update Your Birthday'
        buttonText='Update Your Birthday'
      />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />

      {/* Data & Storage Modal */}
      <DataStorageModal
        visible={showDataStorageModal}
        onClose={() => setShowDataStorageModal(false)}
        onDataCleared={handleDataCleared}
      />

      {/* Privacy Modal */}
      <PrivacyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
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
    padding: 20,
  },
  sectionTitle: {
    ...type.subtitle,
    color: colors.text,
    marginBottom: 12,
  },
  settingItem: {
    ...type.body,
    color: colors.textDim,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemPressable: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
