import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { useGameStore } from '@stores/gameStore';
import { RewardedAdModal } from '@components/ads/RewardedAdModal';
import { COLORS, FONT_SIZES, SPACING, RADIUS, GAME } from '@constants/index';
import type { GameMode, PriceOption } from '@types/index';

const { width } = Dimensions.get('window');

export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode: GameMode; isDaily?: string }>();
  const mode = params.mode ?? 'classic';
  const isDaily = params.isDaily === 'true';

  const {
    status,
    currentProduct,
    currentOptions,
    session,
    currentRoundIndex,
    timeRemaining,
    lastResult,
    isDoubleXP,
    showRewardedAdPrompt,
    startGame,
    submitAnswer,
    nextRound,
    useLife,
    resetGame,
    decrementTimer,
  } = useGameStore();

  const [adModalVisible, setAdModalVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideAnim = useSharedValue(0);

  // Start game on mount
  useEffect(() => {
    startGame(mode, isDaily);
    return () => {
      resetGame();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer for timed mode
  useEffect(() => {
    if (mode !== 'timed' || status !== 'playing') return;
    if (lastResult !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => decrementTimer(), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, status, lastResult, currentRoundIndex]);

  // Auto-advance after answer
  useEffect(() => {
    if (lastResult === null) return;
    const delay = setTimeout(() => {
      if (session && currentRoundIndex >= session.products.length - 1) {
        handleGameEnd();
      } else {
        nextRound();
      }
    }, GAME.NEXT_ROUND_DELAY);
    return () => clearTimeout(delay);
  }, [lastResult]);

  // Game over
  useEffect(() => {
    if (status === 'finished' && session) {
      router.replace({ pathname: '/game/results', params: { sessionId: session.id } });
    }
  }, [status]);

  const handleAnswer = (option: PriceOption) => {
    if (lastResult !== null) return;
    submitAnswer(option.value);
  };

  const handleGameEnd = useCallback(() => {
    useGameStore.getState().endGame();
  }, []);

  const handleRewardedAdLife = () => {
    setAdModalVisible(true);
  };

  const handleAdRewardEarned = () => {
    useLife();
    setAdModalVisible(false);
  };

  const handleAdDismiss = () => {
    setAdModalVisible(false);
  };

  const handleSkipAd = () => {
    handleGameEnd();
  };

  if (status === 'loading') {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (!currentProduct || !session) return null;

  const roundTotal = session.products.length;
  const progressPct = ((currentRoundIndex + 1) / roundTotal) * 100;
  const streakColor =
    session.streak >= GAME.STREAK_INFERNO_THRESHOLD
      ? COLORS.incorrect
      : session.streak >= GAME.STREAK_FIRE_THRESHOLD
      ? COLORS.primary
      : COLORS.accent;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          Alert.alert('Quit?', 'Your progress will be lost.', [
            { text: 'Keep Playing', style: 'cancel' },
            { text: 'Quit', style: 'destructive', onPress: () => { resetGame(); router.back(); } },
          ]);
        }} style={styles.quitBtn}>
          <Text style={styles.quitText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.roundText}>{currentRoundIndex + 1}/{roundTotal}</Text>
        </View>

        <View style={styles.scoreArea}>
          <Text style={styles.scoreValue}>{session.score}</Text>
        </View>
      </View>

      {/* Timer bar — timed mode */}
      {mode === 'timed' && (
        <View style={styles.timerBarBg}>
          <Animated.View
            style={[
              styles.timerBarFill,
              {
                width: `${(timeRemaining / GAME.TIMED_SECONDS_PER_ROUND) * 100}%`,
                backgroundColor: timeRemaining <= 3 ? COLORS.incorrect : COLORS.primary,
              },
            ]}
          />
        </View>
      )}

      {/* Streak + lives */}
      <View style={styles.statsRow}>
        <View style={styles.lives}>
          {Array.from({ length: GAME.MAX_LIVES }).map((_, i) => (
            <Text key={i} style={{ fontSize: 18, opacity: i < session.lives ? 1 : 0.2 }}>❤️</Text>
          ))}
        </View>
        {session.streak >= GAME.STREAK_FIRE_THRESHOLD && (
          <MotiView
            from={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <View style={[styles.streakBadge, { borderColor: streakColor }]}>
              <Text style={[styles.streakText, { color: streakColor }]}>
                {session.streak}x 🔥
              </Text>
            </View>
          </MotiView>
        )}
        {isDoubleXP && (
          <View style={styles.doubleXPBadge}>
            <Text style={styles.doubleXPText}>2x XP</Text>
          </View>
        )}
      </View>

      {/* Product Image */}
      <MotiView
        key={currentProduct.id}
        from={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={styles.imageCard}
      >
        <Image
          source={{ uri: currentProduct.imageUrl }}
          style={styles.productImage}
          resizeMode="contain"
        />
        {lastResult !== null && (
          <View style={[
            styles.resultOverlay,
            lastResult === 'correct' ? styles.correctOverlay : styles.incorrectOverlay,
          ]}>
            <Text style={styles.resultEmoji}>
              {lastResult === 'correct' ? '✓' : lastResult === 'timeout' ? '⏱' : '✗'}
            </Text>
          </View>
        )}
      </MotiView>

      {/* Product info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {currentProduct.name}
        </Text>
        <Text style={styles.productDesc} numberOfLines={1}>
          {currentProduct.description}
        </Text>
        {lastResult !== null && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 250 }}
          >
            <Text style={styles.realPrice}>
              Actual price: <Text style={styles.realPriceValue}>
                ${currentProduct.realPrice.toFixed(2)}
              </Text>
            </Text>
          </MotiView>
        )}
      </View>

      {/* Answer options */}
      <View style={styles.options}>
        {currentOptions.map((option, i) => {
          const isSelected = lastResult !== null && option.value === session.rounds[session.rounds.length - 1]?.playerAnswer;
          const isCorrect = option.value === currentProduct.realPrice;
          const showCorrect = lastResult !== null && isCorrect;
          const showWrong = isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.optionBtn,
                showCorrect && styles.optionCorrect,
                showWrong && styles.optionWrong,
                lastResult !== null && !showCorrect && !showWrong && styles.optionDim,
              ]}
              onPress={() => handleAnswer(option)}
              disabled={lastResult !== null}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.optionText,
                showCorrect && styles.optionTextCorrect,
                showWrong && styles.optionTextWrong,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* No lives left — rewarded ad prompt */}
      {showRewardedAdPrompt && (
        <View style={styles.adPrompt}>
          <Text style={styles.adPromptTitle}>Out of lives!</Text>
          <Text style={styles.adPromptSub}>Watch a short ad to get a free life</Text>
          <TouchableOpacity style={styles.watchAdBtn} onPress={handleRewardedAdLife}>
            <Text style={styles.watchAdText}>▶ Watch Ad (+1 life)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.noThanksBtn} onPress={handleSkipAd}>
            <Text style={styles.noThanksText}>End Game</Text>
          </TouchableOpacity>
        </View>
      )}

      <RewardedAdModal
        visible={adModalVisible}
        rewardType="extra_life"
        onRewardEarned={handleAdRewardEarned}
        onDismiss={handleAdDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  quitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md, fontWeight: '700' },
  progressContainer: { flex: 1, gap: 4 },
  progressBg: {
    height: 6,
    backgroundColor: COLORS.bgSurface,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  roundText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'right' },
  scoreArea: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    minWidth: 60,
    alignItems: 'center',
  },
  scoreValue: { color: COLORS.accent, fontWeight: '900', fontSize: FONT_SIZES.md },
  timerBarBg: {
    height: 4,
    backgroundColor: COLORS.bgSurface,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  timerBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  lives: { flexDirection: 'row', gap: 4, flex: 1 },
  streakBadge: {
    borderWidth: 2,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  streakText: { fontSize: FONT_SIZES.sm, fontWeight: '900' },
  doubleXPBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  doubleXPText: { fontSize: FONT_SIZES.xs, fontWeight: '900', color: COLORS.textInverse },
  imageCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    aspectRatio: 1,
    maxHeight: 240,
    alignSelf: 'stretch',
  },
  productImage: { width: '100%', height: '100%' },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctOverlay: { backgroundColor: COLORS.correct + '70' },
  incorrectOverlay: { backgroundColor: COLORS.incorrect + '70' },
  resultEmoji: { fontSize: 72 },
  productInfo: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 4,
  },
  productName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  productDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  realPrice: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
  realPriceValue: { color: COLORS.correct, fontWeight: '700' },
  options: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    alignContent: 'flex-end',
  },
  optionBtn: {
    width: '47.5%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionCorrect: {
    backgroundColor: COLORS.correct + '25',
    borderColor: COLORS.correct,
  },
  optionWrong: {
    backgroundColor: COLORS.incorrect + '25',
    borderColor: COLORS.incorrect,
  },
  optionDim: { opacity: 0.4 },
  optionText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  optionTextCorrect: { color: COLORS.correct },
  optionTextWrong: { color: COLORS.incorrect },
  adPrompt: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  adPromptTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  adPromptSub: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  watchAdBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    padding: SPACING.md,
    alignItems: 'center',
  },
  watchAdText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONT_SIZES.md },
  noThanksBtn: { padding: SPACING.sm },
  noThanksText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
});
