import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, AppState } from 'react-native';
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
import { isPremium } from '../utils/premiumManager';
import { getProducts, purchaseLifetimePremium, restorePurchases } from '../utils/iapManager';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { mainButton } from '../theme/buttons';

const BIRTHDAY_DATE_KEY = '@birthday_date';

export default function SettingsScreenContent({
  scrollViewRef,
  setCurrentView,
  setBirthdayDate,
  birthdayDate,
  onPersonalPress,
  onHeaderPress,
}) {
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

  // Premium states
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [premiumProduct, setPremiumProduct] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Check premium status and fetch product info on mount
  useEffect(() => {
    const checkPremiumStatus = async () => {
      const premium = await isPremium();
      setIsPremiumUser(premium);
    };

    const fetchProductInfo = async () => {
      try {
        const products = await getProducts();
        if (products.length > 0) {
          setPremiumProduct(products[0]);
        }
      } catch (error) {
        console.error('Error fetching product info:', error);
      }
    };

    checkPremiumStatus();
    fetchProductInfo();
  }, []);

  // Re-check premium status when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        const premium = await isPremium();
        setIsPremiumUser(premium);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleUpdateBirthday = async (newDateString) => {
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

  const handlePurchasePremium = async () => {
    if (isPurchasing) return;

    setIsPurchasing(true);
    try {
      await purchaseLifetimePremium();
      // Purchase will be handled by IAP listener, which will update premium status
      // We'll check status again when app comes to foreground
    } catch (error) {
      console.error('Error purchasing premium:', error);
      Alert.alert('Purchase Error', 'Unable to complete purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (isRestoring) return;

    setIsRestoring(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        setIsPremiumUser(true);
        Alert.alert('Success', 'Your premium purchase has been restored!');
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Restore Error', 'Unable to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const getPremiumPrice = () => {
    if (premiumProduct && premiumProduct.localizedPrice) {
      return premiumProduct.localizedPrice;
    }
    return '$4.99';
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <DynamicBackground backgroundColors={defaultBackgroundColors} />

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Part of scroll flow */}
        <SimpleHeader title='Settings' onHeaderPress={onHeaderPress} />

        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          {/* Premium Card - Only show if IAP product is found or user has premium */}
          {(premiumProduct || isPremiumUser) && (
            <Card>
              <Text style={styles.sectionTitle}>Premium</Text>
              {isPremiumUser ? (
                <>
                  <View style={styles.premiumActiveContainer}>
                    <Text style={styles.premiumActiveText}>✓ Premium Active</Text>
                    <Text style={styles.premiumBenefitsText}>
                      • Ad-free experience
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Pressable
                    style={[mainButton.button, styles.purchaseButton]}
                    onPress={handlePurchasePremium}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator color={colors.text} />
                    ) : (
                      <Text style={[mainButton.text, styles.purchaseButtonText]}>
                        Unlock Premium - {getPremiumPrice()}
                      </Text>
                    )}
                  </Pressable>
                  <Text style={styles.premiumBenefitsText}>
                    • Remove all ads
                  </Text>
                  <Pressable
                    style={styles.restoreButton}
                    onPress={handleRestorePurchases}
                    disabled={isRestoring}
                  >
                    {isRestoring ? (
                      <ActivityIndicator color={colors.textDim} size="small" />
                    ) : (
                      <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                    )}
                  </Pressable>
                </>
              )}
            </Card>
          )}

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
      <PrivacyModal visible={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />

      {/* Terms of Service Modal */}
      <TermsOfServiceModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  premiumActiveContainer: {
    marginTop: 8,
  },
  premiumActiveText: {
    ...type.body,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: 8,
  },
  premiumBenefitsText: {
    ...type.body,
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  purchaseButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  purchaseButtonText: {
    fontSize: 16,
  },
  restoreButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  restoreButtonText: {
    ...type.body,
    color: colors.textDim,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
