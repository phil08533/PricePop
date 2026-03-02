import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import {
  fetchProductsForGame,
  generatePriceOptions,
  getCorrectOptionIndex,
  scoreClosestGuess,
} from '@services/productService';
import { createNewSession, saveSession, finalizeSession } from '@services/sessionService';
import { submitScore } from '@services/leaderboardService';
import { submitGameStats, addXP } from '@services/userService';
import { GAME } from '@constants/game';
import type {
  GameState,
  GameSession,
  GameMode,
  Product,
  PriceOption,
  AnswerResult,
  GameRound,
} from '@types/index';
import { useAuthStore } from './authStore';

interface GameStore extends GameState {
  // Setup
  startGame: (mode: GameMode, isDaily?: boolean) => Promise<void>;
  // Gameplay
  submitAnswer: (chosenPrice: number) => void;
  submitSliderGuess: (guessedPrice: number) => void;
  nextRound: () => void;
  useLife: () => void;
  // Power-ups
  activateDoubleXP: () => void;
  // End
  endGame: () => Promise<void>;
  // Utils
  resetGame: () => void;
  decrementTimer: () => void;
}

const initialState: GameState = {
  session: null,
  status: 'idle',
  currentRoundIndex: 0,
  currentProduct: null,
  currentOptions: [],
  timeRemaining: GAME.TIMED_SECONDS_PER_ROUND,
  lastResult: null,
  isDoubleXP: false,
  showRewardedAdPrompt: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // ─── Start Game ─────────────────────────────────────────────────────────────

  startGame: async (mode, isDaily = false) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ status: 'loading' });

    const roundCount =
      mode === 'classic'
        ? GAME.ROUNDS_CLASSIC
        : mode === 'timed'
        ? GAME.ROUNDS_TIMED
        : GAME.ROUNDS_CLOSEST;

    const products = await fetchProductsForGame(mode, roundCount);
    const session = createNewSession(user.uid, mode, isDaily ? new Date().toISOString().split('T')[0] : null);
    session.products = products;

    const firstProduct = products[0];
    const firstOptions =
      mode !== 'closest'
        ? generatePriceOptions(firstProduct.realPrice)
        : [];

    set({
      session,
      status: 'playing',
      currentRoundIndex: 0,
      currentProduct: firstProduct,
      currentOptions: firstOptions,
      timeRemaining: GAME.TIMED_SECONDS_PER_ROUND,
      lastResult: null,
    });
  },

  // ─── Submit Answer (Classic / Timed) ────────────────────────────────────────

  submitAnswer: (chosenPrice) => {
    const { session, currentProduct, currentOptions, currentRoundIndex, isDoubleXP } = get();
    if (!session || !currentProduct || session.status === 'finished') return;

    const isCorrect = chosenPrice === currentProduct.realPrice;
    const result: AnswerResult = isCorrect ? 'correct' : 'incorrect';

    // Haptics
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Calculate points
    const streakBonus = isCorrect
      ? Math.floor(session.streak * GAME.POINTS_STREAK_MULTIPLIER * GAME.POINTS_CORRECT)
      : 0;
    const basePoints = isCorrect ? GAME.POINTS_CORRECT : 0;
    let pointsEarned = basePoints + streakBonus;
    if (isDoubleXP && isCorrect) pointsEarned *= 2;

    const newStreak = isCorrect ? session.streak + 1 : 0;
    const newLives = isCorrect ? session.lives : session.lives - 1;
    const newScore = session.score + pointsEarned;

    const round: GameRound = {
      product: currentProduct,
      options: currentOptions,
      correctIndex: getCorrectOptionIndex(currentOptions, currentProduct.realPrice),
      playerAnswer: chosenPrice,
      result,
      pointsEarned,
      timeTaken: 0,
      bonusApplied: streakBonus > 0,
    };

    const updatedSession: GameSession = {
      ...session,
      rounds: [...session.rounds, round],
      score: newScore,
      streak: newStreak,
      maxStreak: Math.max(session.maxStreak, newStreak),
      lives: newLives,
    };

    // Show rewarded ad prompt when out of lives
    const showAdPrompt = newLives <= 0;

    set({
      session: updatedSession,
      lastResult: result,
      showRewardedAdPrompt: showAdPrompt,
    });
  },

  // ─── Submit Slider Guess (Closest Mode) ─────────────────────────────────────

  submitSliderGuess: (guessedPrice) => {
    const { session, currentProduct, currentOptions, isDoubleXP } = get();
    if (!session || !currentProduct) return;

    const { points, label } = scoreClosestGuess(guessedPrice, currentProduct.realPrice);
    const finalPoints = isDoubleXP ? points * 2 : points;
    const isGood = points > 0;

    Haptics.impactAsync(
      isGood ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );

    const newStreak = isGood ? session.streak + 1 : 0;
    const round: GameRound = {
      product: currentProduct,
      options: [],
      correctIndex: -1,
      playerAnswer: guessedPrice,
      result: isGood ? 'correct' : 'incorrect',
      pointsEarned: finalPoints,
      timeTaken: 0,
      bonusApplied: false,
    };

    const updatedSession: GameSession = {
      ...session,
      rounds: [...session.rounds, round],
      score: session.score + finalPoints,
      streak: newStreak,
      maxStreak: Math.max(session.maxStreak, newStreak),
    };

    set({ session: updatedSession, lastResult: isGood ? 'correct' : 'incorrect' });
  },

  // ─── Next Round ──────────────────────────────────────────────────────────────

  nextRound: () => {
    const { session, currentRoundIndex } = get();
    if (!session) return;

    const nextIndex = currentRoundIndex + 1;
    if (nextIndex >= session.products.length) {
      get().endGame();
      return;
    }

    const nextProduct = session.products[nextIndex];
    const nextOptions =
      session.mode !== 'closest'
        ? generatePriceOptions(nextProduct.realPrice)
        : [];

    set({
      currentRoundIndex: nextIndex,
      currentProduct: nextProduct,
      currentOptions: nextOptions,
      timeRemaining: GAME.TIMED_SECONDS_PER_ROUND,
      lastResult: null,
    });
  },

  // ─── Use Life ────────────────────────────────────────────────────────────────

  useLife: () => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, lives: session.lives + 1 }, showRewardedAdPrompt: false });
  },

  // ─── Power-ups ───────────────────────────────────────────────────────────────

  activateDoubleXP: () => set({ isDoubleXP: true }),

  // ─── End Game ────────────────────────────────────────────────────────────────

  endGame: async () => {
    const { session } = get();
    const { user, profile } = useAuthStore.getState();
    if (!session || !user || !profile) return;

    set({ status: 'finished' });

    try {
      // Cap score anti-cheat
      const finalScore = Math.min(session.score, GAME.MAX_SCORE_PER_SESSION);
      const correctCount = session.rounds.filter((r) => r.result === 'correct').length;
      const xpEarned =
        correctCount * GAME.XP_PER_CORRECT +
        GAME.XP_PER_GAME +
        (session.dailyChallengeDate ? GAME.XP_DAILY_BONUS : 0);

      await Promise.all([
        saveSession({ ...session, score: finalScore, finishedAt: Date.now() }),
        submitScore(
          user.uid,
          finalScore,
          profile.displayName,
          profile.photoURL,
          profile.level
        ),
        submitGameStats(
          user.uid,
          finalScore,
          correctCount,
          session.rounds.length,
          session.maxStreak,
          xpEarned
        ),
      ]);
    } catch (err) {
      console.error('Failed to save game results:', err);
    }
  },

  // ─── Timer ──────────────────────────────────────────────────────────────────

  decrementTimer: () => {
    const { timeRemaining, session, currentProduct, currentOptions } = get();
    if (timeRemaining <= 0) {
      // Timeout — count as wrong
      if (session && currentProduct) {
        const round: GameRound = {
          product: currentProduct,
          options: currentOptions,
          correctIndex: getCorrectOptionIndex(currentOptions, currentProduct.realPrice),
          playerAnswer: null,
          result: 'timeout',
          pointsEarned: 0,
          timeTaken: GAME.TIMED_SECONDS_PER_ROUND * 1000,
          bonusApplied: false,
        };
        const updatedSession: GameSession = {
          ...session,
          rounds: [...session.rounds, round],
          streak: 0,
          lives: session.lives - 1,
        };
        set({ session: updatedSession, lastResult: 'timeout' });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }
    set({ timeRemaining: timeRemaining - 1 });
  },

  // ─── Reset ──────────────────────────────────────────────────────────────────

  resetGame: () => set(initialState),
}));
