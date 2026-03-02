import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchLeaderboard, getUserRank } from '@services/leaderboardService';
import { useAuthStore } from '@stores/authStore';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@constants/index';
import type { LeaderboardEntry } from '@types/index';
import type { LeaderboardPeriod } from '@services/leaderboardService';

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: 'Week' },
  { key: 'allTime', label: 'All Time' },
];

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<LeaderboardPeriod>('daily');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [period]);

  const load = async () => {
    setLoading(true);
    try {
      const [data, rank] = await Promise.all([
        fetchLeaderboard(period, 50),
        user ? getUserRank(user.uid, period) : Promise.resolve(null),
      ]);
      setEntries(data);
      setUserRank(rank);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderEntry = ({ item }: { item: LeaderboardEntry }) => {
    const isMe = item.uid === user?.uid;
    const rankColor =
      item.rank === 1 ? COLORS.gold
      : item.rank === 2 ? COLORS.silver
      : item.rank === 3 ? COLORS.bronze
      : COLORS.textMuted;

    return (
      <View style={[styles.entry, isMe && styles.entryMe]}>
        <Text style={[styles.rank, { color: rankColor }]}>
          {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
        </Text>
        <View style={styles.avatar}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarEmoji}>
              {item.displayName?.[0]?.toUpperCase() ?? '?'}
            </Text>
          )}
        </View>
        <View style={styles.nameArea}>
          <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
            {item.displayName ?? 'Player'} {isMe ? '(you)' : ''}
          </Text>
          <Text style={styles.level}>Level {item.level}</Text>
        </View>
        <Text style={styles.score}>{item.score.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Leaderboard 🏆</Text>

      {/* Period Tabs */}
      <View style={styles.tabs}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.tab, period === p.key && styles.tabActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.tabText, period === p.key && styles.tabTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Your Rank Banner */}
      {userRank !== null && (
        <View style={styles.rankBanner}>
          <Text style={styles.rankBannerText}>
            Your rank: <Text style={styles.rankBannerNum}>#{userRank}</Text>
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.uid}
          renderItem={renderEntry}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No scores yet — be the first!</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '900',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.md,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: COLORS.textPrimary },
  rankBanner: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.primary + '20',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  rankBannerText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, textAlign: 'center' },
  rankBannerNum: { color: COLORS.primary, fontWeight: '900' },
  list: { paddingHorizontal: SPACING.md, paddingBottom: 80, gap: SPACING.xs },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  entryMe: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  rank: { width: 36, fontSize: FONT_SIZES.md, fontWeight: '900', textAlign: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 40, height: 40 },
  avatarEmoji: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  nameArea: { flex: 1 },
  name: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  nameMe: { color: COLORS.primary },
  level: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  score: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: COLORS.accent },
  empty: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    marginTop: 60,
  },
});
