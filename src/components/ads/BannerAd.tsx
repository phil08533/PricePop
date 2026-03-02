import React from 'react';
import { useAuthStore } from '@stores/authStore';

interface BannerAdProps {
  size?: string;
}

export function BannerAd({ size }: BannerAdProps) {
  const { profile } = useAuthStore();

  if (profile?.adsRemoved || profile?.isPremium) return null;

  // Ads not supported in Expo Go — renders nothing
  return null;
}
