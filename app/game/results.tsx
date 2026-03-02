import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { fetchSession } from '@services/sessionService';
import { openProductOnAmazon } from '@services/affiliateService';
import { useAuthStore } from '@stores/authStore';
import { COLORS, FONT_SIZES, SPACING, RADIUS, AFFILIATE } from '@constants/index';
import type { GameSession, Product } from '@types/index';

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { profile, refreshProfile } = useAuthStore();
  const [session, setSession] = useState<GameSession | null>(null);

  useEffect(() => {
    if (sessionId) loadSession();
    refreshProfile();
  }, [sessionId]);

  const loadSession = async () => {
    const s = await fetchSession(sessionId!);
    setSession(s);
  };

  const handleShare = async () => {
    if (!session) return;
    const correct = session.rounds.filter((r) => r.result === 'correct').length;
    const accuracy = Math.round((correct / session.rounds.length) * 100);
    await Share.share({
      message:
        `🏷️ PricePop Score\n` +
        `Score: ${session.score.toLocaleString()} pts\n` +
        `Accuracy: ${accuracy}% (${correct}/${session.rounds.length})\n` +
        `Best streak: ${session.maxStreak}x 🔥\n\n` +
        `Can you beat me? Download PricePop!`,
    });
  };

  const handleBuyProduct = async (product: Product) => {
    await openProductOnAmazon(product, 'results');
  };

  if (!session) return (
    <View style={styles.loading}>
      <Text style={styles.loadingText}>Loading results...</Text>
    </View>
  );

  const correct = session.rounds.filter((r) => r.result === 'correct').length;
  const accuracy = Math.round((correct / session.rounds.length) * 100);
  const modeLabel =
    session.mode === 'classic' ? 'Classic'
    : session.mode === 'timed' ? 'Speed Round'
    : 'Price Is Right';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Score hero */}
      <MotiView
        from={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 100 }}
        style={styles.scoreHero}
      >
        <Text style={styles.scoreLabel}>{modeLabel} · Final Score</Text>
        <Text style={styles.scoreValue}>{session.score.toLocaleString()}</Text>
        <Text style={styles.scoreEmoji}>
          {accuracy >= 80 ? '🔥' : accuracy >= 60 ? '👍' : accuracy >= 40 ? '😅' : '💪'}
        </Text>
      </MotiView>

      {/* Stats row */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 300 }}
        style={styles.statsRow}
      >
        <MiniStat label="Correct" value={`${correct}/${session.rounds.length}`} />
        <MiniStat label="Accuracy" value={`${accuracy}%`} />
        <MiniStat label="Best Streak" value={`${session.maxStreak}x`} />
      </MotiView>

      {/* Action buttons */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 450 }}
        style={styles.actions}
      >
        <TouchableOpacity style={styles.playAgainBtn} onPress={() => router.replace({ pathname: '/game/play', params: { mode: session.mode } })}>
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareText}>📤 Share Score</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.homeText}>Home</Text>
        </TouchableOpacity>
      </MotiView>

      {/* Products from this session — affiliate section */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500, delay: 600 }}
      >
        <Text style={styles.sectionTitle}>🛒 See Products on Amazon</Text>
        <Text style={styles.disclosure}>{AFFILIATE.DISCLOSURE}</Text>

        {session.products.map((product, i) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productRow}
            onPress={() => handleBuyProduct(product)}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productThumb}
              resizeMode="contain"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.realPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.amazonBtn}>
              <Text style={styles.amazonBtnText}>View →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </MotiView>
    </ScrollView>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { paddingHorizontal: SPACING.md, gap: SPACING.lg },
  loading: { flex: 1, backgroundColor: COLORS.bgDark, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textSecondary },
  scoreHero: {
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  scoreValue: {
    fontSize: FONT_SIZES['5xl'],
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: -2,
  },
  scoreEmoji: { fontSize: 48 },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  miniStat: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniStatValue: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary },
  miniStatLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  actions: { gap: SPACING.sm },
  playAgainBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    padding: SPACING.md,
    alignItems: 'center',
  },
  playAgainText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONT_SIZES.lg },
  shareBtn: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONT_SIZES.md },
  homeBtn: {
    padding: SPACING.sm,
    alignItems: 'center',
  },
  homeText: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  disclosure: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgSurface,
  },
  productInfo: { flex: 1 },
  productName: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '600' },
  productPrice: { fontSize: FONT_SIZES.md, color: COLORS.accent, fontWeight: '700', marginTop: 2 },
  amazonBtn: {
    backgroundColor: '#FF9900',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  amazonBtnText: { color: '#000', fontWeight: '700', fontSize: FONT_SIZES.sm },
});
