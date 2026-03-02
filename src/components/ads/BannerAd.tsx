import React from 'react';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useAuthStore } from '@stores/authStore';

interface BannerAdProps {
  size?: string;
}

// Detect if running inside Expo Go (no native ad modules available)
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function BannerAd({ size }: BannerAdProps) {
  const { profile } = useAuthStore();

  // Don't show ads for premium users
  if (profile?.adsRemoved || profile?.isPremium) return null;

  // Expo Go can't load native ad SDKs
  if (isExpoGo) return null;

  try {
    const {
      BannerAd: AdMobBanner,
      BannerAdSize,
      TestIds,
    } = require('react-native-google-mobile-ads');

    const adUnitId = __DEV__
      ? TestIds.BANNER
      : (Constants.expoConfig?.extra?.admob?.bannerAdUnitId ?? TestIds.BANNER);

    const adSize =
      size === 'large'
        ? BannerAdSize.MEDIUM_RECTANGLE
        : BannerAdSize.BANNER;

    return (
      <AdMobBanner
        unitId={adUnitId}
        size={adSize}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => {
          // Silently fail — ad not critical
        }}
      />
    );
  } catch {
    // Native module unavailable — render nothing
    return null;
  }
}
