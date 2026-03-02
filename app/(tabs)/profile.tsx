import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@stores/authStore';
import { COLORS, FONT_SIZES, SPACING, RADIUS, ACHIEVEMENTS } from '@constants/index';
import { xpForNextLevel } from '@services/userService';

// Replace these with your hosted URLs before shipping to production
const LEGAL_URLS = {
  privacyPolicy: 'https://YOUR_DOMAIN/privacy-policy',
  affiliateDisclosure: 'https://YOUR_DOMAIN/affiliate-disclosure',
  termsOfService: 'https://YOUR_DOMAIN/terms-of-service',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  if (!profile) return null;

  const { progress, nextLevelXP } = xpForNextLevel(profile.xp);
  const accuracy =
    profile.totalAnswered > 0
      ? Math.round((profile.totalCorrect / profile.totalAnswered) * 100)
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + Name */}
      <View style={styles.heroSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>
            {profile.displayName?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.displayName}>{profile.displayName}</Text>
        <Text style={styles.levelBadge}>Level {profile.level}</Text>
      </View>

      {/* XP Bar */}
      <View style={styles.xpCard}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>XP Progress</Text>
          <Text style={styles.xpValue}>{profile.xp.toLocaleString()} XP</Text>
        </View>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <Text style={styles.xpNext}>
          {Math.round((1 - progress) * (nextLevelXP - profile.xp))} XP to Level {profile.level + 1}
        </Text>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsGrid}>
        <StatTile emoji="🏆" label="High Score" value={profile.highScore.toLocaleString()} />
        <StatTile emoji="🎮" label="Games" value={String(profile.totalGamesPlayed)} />
        <StatTile emoji="🎯" label="Accuracy" value={`${accuracy}%`} />
        <StatTile emoji="🔥" label="Best Streak" value={`${profile.longestStreak}x`} />
        <StatTile emoji="📅" label="Daily Streak" value={`${profile.dailyChallengeStreak}d`} />
        <StatTile emoji="✅" label="Correct" value={String(profile.totalCorrect)} />
      </View>

      {/* Achievements */}
      <Text style={styles.sectionTitle}>
        Achievements ({profile.achievements.length}/{ACHIEVEMENTS.length})
      </Text>
      <View style={styles.achievementsGrid}>
        {ACHIEVEMENTS.map((a) => {
          const unlocked = profile.achievements.includes(a.id);
          return (
            <View
              key={a.id}
              style={[styles.achievementCard, !unlocked && styles.achievementLocked]}
            >
              <Text style={[styles.achievementEmoji, !unlocked && styles.lockedEmoji]}>
                {unlocked ? a.icon : '🔒'}
              </Text>
              <Text style={[styles.achievementTitle, !unlocked && styles.lockedText]}>
                {a.title}
              </Text>
              <Text style={styles.achievementDesc} numberOfLines={2}>
                {unlocked ? a.description : '???'}
              </Text>
              {unlocked && (
                <Text style={styles.achievementXP}>+{a.xpReward} XP</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsCard}>
        <SettingsRow
          label="Privacy Policy"
          onPress={() => router.push({ pathname: '/legal', params: { title: 'Privacy Policy', url: LEGAL_URLS.privacyPolicy } })}
        />
        <SettingsRow
          label="Affiliate Disclosure"
          onPress={() => router.push({ pathname: '/legal', params: { title: 'Affiliate Disclosure', url: LEGAL_URLS.affiliateDisclosure } })}
        />
        <SettingsRow
          label="Terms of Service"
          onPress={() => router.push({ pathname: '/legal', params: { title: 'Terms of Service', url: LEGAL_URLS.termsOfService } })}
        />
        <SettingsRow
          label="Sign Out"
          onPress={handleSignOut}
          destructive
        />
      </View>
    </ScrollView>
  );
}

function StatTile({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingsRow({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.settingsLabel, destructive && styles.destructive]}>{label}</Text>
      <Text style={styles.settingsArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { paddingHorizontal: SPACING.md, gap: SPACING.md },
  heroSection: { alignItems: 'center', paddingVertical: SPACING.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarEmoji: { fontSize: 40, fontWeight: '700', color: COLORS.textPrimary },
  displayName: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', color: COLORS.textPrimary },
  levelBadge: {
    marginTop: 4,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    overflow: 'hidden',
  },
  xpCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  xpValue: { color: COLORS.accent, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  xpBarBg: {
    height: 10,
    backgroundColor: COLORS.bgSurface,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  xpNext: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs, textAlign: 'right' },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statTile: {
    width: '30.5%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center' },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  achievementCard: {
    width: '47%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  achievementLocked: { opacity: 0.5 },
  achievementEmoji: { fontSize: 28 },
  lockedEmoji: { opacity: 0.4 },
  achievementTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  lockedText: { color: COLORS.textMuted },
  achievementDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  achievementXP: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent,
    fontWeight: '700',
  },
  settingsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsLabel: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  destructive: { color: COLORS.incorrect },
  settingsArrow: { fontSize: FONT_SIZES.xl, color: COLORS.textMuted },
});
