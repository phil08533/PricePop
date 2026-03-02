import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { ADMOB, COLORS, FONT_SIZES, SPACING, RADIUS } from '@constants/index';

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

export function RewardedAdModal({
  visible,
  rewardType,
  onRewardEarned,
  onDismiss,
}: RewardedAdModalProps) {
  const adRef = useRef<RewardedAd | null>(null);
  const copy = REWARD_COPY[rewardType];

  const adUnitId = __DEV__
    ? TestIds.REWARDED
    : Platform.OS === 'ios'
    ? ADMOB.REWARDED_IOS
    : ADMOB.REWARDED_ANDROID;

  useEffect(() => {
    if (!visible) return;

    const ad = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    const rewardListener = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        onRewardEarned(rewardType);
      }
    );

    const closeListener = ad.addAdEventListener(
      RewardedAdEventType.CLOSED,
      () => {
        onDismiss();
      }
    );

    ad.load();
    adRef.current = ad;

    return () => {
      rewardListener();
      closeListener();
    };
  }, [visible]);

  const handleWatchAd = () => {
    if (adRef.current?.loaded) {
      adRef.current.show();
    } else {
      // Ad not loaded yet — grant reward anyway to not frustrate user
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

          <TouchableOpacity style={styles.watchBtn} onPress={handleWatchAd} activeOpacity={0.85}>
            <Text style={styles.watchBtnText}>▶ Watch Short Ad</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.noBtn} onPress={onDismiss}>
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
  },
  watchBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: FONT_SIZES.lg,
  },
  noBtn: { padding: SPACING.sm },
  noBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
});
