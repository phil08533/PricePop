import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useAuthStore } from '@stores/authStore';
import { COLORS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '@constants/index';
import type { GameMode } from '@types/index';

interface ModeCard {
  mode: GameMode;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string];
  badge?: string;
}

const MODES: ModeCard[] = [
  {
    mode: 'classic',
    title: 'Classic',
    subtitle: '10 products · 4 choices · No timer',
    emoji: '🎯',
    gradient: [COLORS.primary, COLORS.primaryDark],
  },
  {
    mode: 'timed',
    title: 'Speed Round',
    subtitle: '15 products · 8 seconds each · Rapid fire',
    emoji: '⚡',
    gradient: [COLORS.secondary, '#5A1F9E'],
    badge: 'HOT',
  },
  {
    mode: 'closest',
    title: 'Price Is Right',
    subtitle: '8 products · Slider guess · Closest wins',
    emoji: '🎰',
    gradient: ['#1A6B4A', '#0D4A32'],
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();

  const startGame = (mode: GameMode) => {
    router.push({ pathname: '/game/play', params: { mode } });
  };

  const startDaily = () => {
    router.push({ pathname: '/game/play', params: { mode: 'classic', isDaily: 'true' } });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hey {profile?.displayName?.split(' ')[0] ?? 'Player'} 👋
          </Text>
          <Text style={styles.headerSub}>Ready to pop some prices?</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpLevel}>Lvl {profile?.level ?? 1}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="High Score" value={String(profile?.highScore ?? 0)} emoji="🏆" />
        <StatCard label="Streak" value={`${profile?.longestStreak ?? 0}x`} emoji="🔥" />
        <StatCard label="Games" value={String(profile?.totalGamesPlayed ?? 0)} emoji="🎮" />
      </View>

      {/* Daily Challenge */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 100 }}
      >
        <TouchableOpacity
          style={styles.dailyCard}
          onPress={startDaily}
          activeOpacity={0.85}
        >
          <Text style={styles.dailyEmoji}>📅</Text>
          <View style={styles.dailyText}>
            <Text style={styles.dailyTitle}>Daily Challenge</Text>
            <Text style={styles.dailySub}>+50 bonus XP · Refreshes at midnight</Text>
          </View>
          <Text style={styles.dailyArrow}>→</Text>
        </TouchableOpacity>
      </MotiView>

      {/* Game Modes */}
      <Text style={styles.sectionTitle}>Game Modes</Text>
      {MODES.map((card, i) => (
        <MotiView
          key={card.mode}
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 150 + i * 80 }}
        >
          <TouchableOpacity
            style={[styles.modeCard, { backgroundColor: card.gradient[0] }]}
            onPress={() => startGame(card.mode)}
            activeOpacity={0.88}
          >
            {card.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{card.badge}</Text>
              </View>
            )}
            <Text style={styles.modeEmoji}>{card.emoji}</Text>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>{card.title}</Text>
              <Text style={styles.modeSub}>{card.subtitle}</Text>
            </View>
            <Text style={styles.modeArrow}>→</Text>
          </TouchableOpacity>
        </MotiView>
      ))}
    </ScrollView>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { paddingHorizontal: SPACING.md, gap: SPACING.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  greeting: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  headerSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  xpBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  xpLevel: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONT_SIZES.sm },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  dailyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
    ...SHADOWS.md,
  },
  dailyEmoji: { fontSize: 32 },
  dailyText: { flex: 1 },
  dailyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  dailySub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  dailyArrow: { fontSize: FONT_SIZES.xl, color: COLORS.accent },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  modeCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.md,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '900', color: COLORS.textInverse },
  modeEmoji: { fontSize: 36 },
  modeInfo: { flex: 1 },
  modeTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary },
  modeSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  modeArrow: { fontSize: FONT_SIZES.xl, color: 'rgba(255,255,255,0.8)' },
});
