import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { FIRESTORE, STORAGE_KEYS, ACHIEVEMENTS, LEVELS } from '@constants/index';
import type { UserProfile } from '@types/index';

// ─── Create Profile ───────────────────────────────────────────────────────────

export async function createUserProfile(
  user: User,
  isOAuth = false
): Promise<UserProfile> {
  const ref = doc(db, FIRESTORE.USERS, user.uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    const profile = existing.data() as UserProfile;
    await cacheProfileLocally(profile);
    return profile;
  }

  const newProfile: UserProfile = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? 'Player',
    photoURL: user.photoURL,
    createdAt: Date.now(),
    lastSeen: Date.now(),
    xp: 0,
    level: 1,
    highScore: 0,
    totalGamesPlayed: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    currentStreak: 0,
    longestStreak: 0,
    isPremium: false,
    adsRemoved: false,
    lastDailyChallengeDate: null,
    dailyChallengeStreak: 0,
    achievements: [],
    lastScoreSubmittedAt: 0,
  };

  await setDoc(ref, newProfile);
  await cacheProfileLocally(newProfile);
  return newProfile;
}

// ─── Fetch Profile ────────────────────────────────────────────────────────────

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  // Try local cache first for instant load
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (cached) {
      const parsed = JSON.parse(cached) as UserProfile;
      if (parsed.uid === uid) {
        // Background refresh
        refreshProfileFromFirestore(uid).catch(() => {});
        return parsed;
      }
    }
  } catch {}

  return refreshProfileFromFirestore(uid);
}

async function refreshProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, FIRESTORE.USERS, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const profile = snap.data() as UserProfile;
  await cacheProfileLocally(profile);
  return profile;
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, FIRESTORE.USERS, uid);
  await updateDoc(ref, { ...updates, lastSeen: Date.now() });

  // Update local cache
  const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (cached) {
    const profile = JSON.parse(cached) as UserProfile;
    await cacheProfileLocally({ ...profile, ...updates });
  }
}

// ─── XP + Level ───────────────────────────────────────────────────────────────

export function calculateLevel(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) return LEVELS[i].level;
  }
  return 1;
}

export function xpForNextLevel(currentXP: number): {
  nextLevelXP: number;
  progress: number; // 0–1
} {
  const currentLevelIndex = LEVELS.findIndex(
    (l) => calculateLevel(currentXP) === l.level
  );
  const nextLevel = LEVELS[currentLevelIndex + 1];
  if (!nextLevel) return { nextLevelXP: currentXP, progress: 1 };

  const currentLevelXP = LEVELS[currentLevelIndex].xpRequired;
  const range = nextLevel.xpRequired - currentLevelXP;
  const progress = (currentXP - currentLevelXP) / range;
  return { nextLevelXP: nextLevel.xpRequired, progress: Math.min(progress, 1) };
}

export async function addXP(uid: string, xpToAdd: number): Promise<{
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
}> {
  const profile = await fetchUserProfile(uid);
  if (!profile) throw new Error('Profile not found');

  const newXP = profile.xp + xpToAdd;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > profile.level;

  await updateUserProfile(uid, { xp: newXP, level: newLevel });
  return { newXP, newLevel, leveledUp };
}

// ─── Game Stats ───────────────────────────────────────────────────────────────

export async function submitGameStats(
  uid: string,
  score: number,
  correct: number,
  answered: number,
  streak: number,
  xpEarned: number
): Promise<void> {
  const profile = await fetchUserProfile(uid);
  if (!profile) return;

  const updates: Partial<UserProfile> = {
    totalGamesPlayed: profile.totalGamesPlayed + 1,
    totalCorrect: profile.totalCorrect + correct,
    totalAnswered: profile.totalAnswered + answered,
    highScore: Math.max(profile.highScore, score),
    longestStreak: Math.max(profile.longestStreak, streak),
    lastScoreSubmittedAt: Date.now(),
  };

  await updateUserProfile(uid, updates);
  await addXP(uid, xpEarned);
  await checkAndUnlockAchievements(uid);
}

// ─── Achievements ────────────────────────────────────────────────────────────

export async function checkAndUnlockAchievements(uid: string): Promise<string[]> {
  const profile = await fetchUserProfile(uid);
  if (!profile) return [];

  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (profile.achievements.includes(achievement.id)) continue;

    const conditionMet = evaluateAchievement(achievement.id, profile);
    if (conditionMet) {
      newlyUnlocked.push(achievement.id);
    }
  }

  if (newlyUnlocked.length > 0) {
    const updatedAchievements = [...profile.achievements, ...newlyUnlocked];
    const bonusXP = newlyUnlocked.reduce((sum, id) => {
      const a = ACHIEVEMENTS.find((a) => a.id === id);
      return sum + (a?.xpReward ?? 0);
    }, 0);

    await updateUserProfile(uid, { achievements: updatedAchievements });
    if (bonusXP > 0) await addXP(uid, bonusXP);
  }

  return newlyUnlocked;
}

function evaluateAchievement(id: string, profile: UserProfile): boolean {
  switch (id) {
    case 'first_win': return profile.totalGamesPlayed >= 1;
    case 'streak_5': return profile.longestStreak >= 5;
    case 'streak_10': return profile.longestStreak >= 10;
    case 'games_50': return profile.totalGamesPlayed >= 50;
    case 'games_100': return profile.totalGamesPlayed >= 100;
    case 'score_1000': return profile.highScore >= 1000;
    case 'level_5': return profile.level >= 5;
    case 'level_10': return profile.level >= 10;
    case 'daily_7': return profile.dailyChallengeStreak >= 7;
    default: return false;
  }
}

// ─── Local Cache ──────────────────────────────────────────────────────────────

async function cacheProfileLocally(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch {}
}

export async function clearLocalProfile(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
}
