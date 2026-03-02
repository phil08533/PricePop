import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@constants/index';

export type RewardType = 'extra_life' | 'double_xp' | 'streak_save';

interface RewardedAdModalProps {
  visible: boolean;
  rewardType: RewardType;
  onRewardEarned: (type: RewardType) => void;
  onDismiss: () => void;
}

const REWARD_COPY: Record<RewardType, { title: string; desc: string; emoji: string }> = {
  extra_life: {
    title: 'Get a Free Life',
    desc: 'Watch a short ad to earn an extra life and keep your streak alive!',
    emoji: '❤️',
  },
  double_xp: {
    title: '2x XP Boost',
    desc: 'Watch a short ad to double your XP earnings for this game!',
    emoji: '⚡',
  },
  streak_save: {
    title: 'Save Your Streak',
    desc: 'Watch a short ad to protect your winning streak!',
    emoji: '🔥',
  },
};

// Detect if we're running inside Expo Go (no native ad modules available)
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function RewardedAdModal({
  visible,
  rewardType,
  onRewardEarned,
  onDismiss,
}: RewardedAdModalProps) {
  const copy = REWARD_COPY[rewardType];
  const [isLoading, setIsLoading] = useState(false);
  // Keep a ref to cleanup ad listeners on unmount
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const handleWatchAd = async () => {
    // In Expo Go there are no native ad modules — grant reward directly
    if (isExpoGo) {
      onRewardEarned(rewardType);
      onDismiss();
      return;
    }

    setIsLoading(true);

    try {
      // Dynamically require the ads SDK so the app doesn't crash if the
      // module is somehow unavailable at runtime (e.g. during bare RN dev)
      const {
        RewardedAd,
        RewardedAdEventType,
        AdEventType,
        TestIds,
      } = require('react-native-google-mobile-ads');

      const adUnitId = __DEV__
        ? TestIds.REWARDED
        : (Constants.expoConfig?.extra?.admob?.rewardedAdUnitId ?? TestIds.REWARDED);

      const rewarded = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
        keywords: ['shopping', 'deals', 'products'],
      });

      const unsubs: (() => void)[] = [];

      const cleanup = () => {
        unsubs.forEach((fn) => fn());
        cleanupRef.current = null;
      };
      cleanupRef.current = cleanup;

      unsubs.push(
        rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
          setIsLoading(false);
          rewarded.show();
        })
      );

      unsubs.push(
        rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          cleanup();
          onRewardEarned(rewardType);
          onDismiss();
        })
      );

      unsubs.push(
        rewarded.addAdEventListener(AdEventType.ERROR, () => {
          // Ad failed to load — grant the reward as a fallback so the user
          // isn't penalised for an ad network issue
          cleanup();
          setIsLoading(false);
          onRewardEarned(rewardType);
          onDismiss();
        })
      );

      rewarded.load();
    } catch {
      // Native module unavailable — grant reward directly
      setIsLoading(false);
      onRewardEarned(rewardType);
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.emoji}>{copy.emoji}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.desc}>{copy.desc}</Text>

          <TouchableOpacity
            style={styles.watchBtn}
            onPress={handleWatchAd}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.watchBtnText}>▶ Watch Short Ad</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.noBtn} onPress={onDismiss} disabled={isLoading}>
            <Text style={styles.noBtnText}>No thanks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 40,
  },
  emoji: { fontSize: 56 },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  desc: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  watchBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  watchBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: FONT_SIZES.lg,
  },
  noBtn: { padding: SPACING.sm },
  noBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
});
