import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  BannerAd as AdMobBanner,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useAuthStore } from '@stores/authStore';
import { ADMOB, COLORS } from '@constants/index';

interface BannerAdProps {
  size?: BannerAdSize;
}

/**
 * Non-intrusive banner ad.
 * Automatically hidden for premium users (adsRemoved = true).
 * Uses test IDs in dev, real IDs in production.
 */
export function BannerAd({ size = BannerAdSize.BANNER }: BannerAdProps) {
  const { profile } = useAuthStore();

  // Don't show ads to premium users
  if (profile?.adsRemoved || profile?.isPremium) return null;

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : Platform.OS === 'ios'
    ? ADMOB.BANNER_IOS
    : ADMOB.BANNER_ANDROID;

  return (
    <View style={styles.container}>
      <AdMobBanner
        unitId={adUnitId}
        size={size}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={(error) => {
          // Silent fail — don't crash the app if ads fail
          if (__DEV__) console.warn('Banner ad failed:', error.message);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
