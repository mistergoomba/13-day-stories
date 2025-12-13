import React, { useState, useEffect } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { shouldShowAds, getBannerAdUnitId } from '../utils/adManager';
import colors from '../theme/colors';

export default function AdBanner() {
  const [showAd, setShowAd] = useState(false);
  const [adUnitId, setAdUnitId] = useState(null);

  // Check premium status and update ad visibility
  const checkPremiumStatus = async () => {
    const shouldShow = await shouldShowAds();
    const unitId = getBannerAdUnitId();
    setShowAd(shouldShow);
    setAdUnitId(unitId);
  };

  // Check on mount
  useEffect(() => {
    checkPremiumStatus();
  }, []);

  // Re-check when app comes to foreground (in case premium was purchased)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPremiumStatus();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Don't render if user has premium or ad unit ID not ready
  if (!showAd || !adUnitId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

