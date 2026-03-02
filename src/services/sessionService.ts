import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FIRESTORE, GAME } from '@constants/index';
import type { GameSession, GameMode } from '@types/index';
import { nanoid } from 'nanoid/non-secure';

// ─── Create Session ───────────────────────────────────────────────────────────

export function createNewSession(
  uid: string,
  mode: GameMode,
  dailyChallengeDate: string | null = null
): GameSession {
  return {
    id: nanoid(),
    uid,
    mode,
    rounds: [],
    score: 0,
    streak: 0,
    maxStreak: 0,
    lives: GAME.STARTING_LIVES,
    startedAt: Date.now(),
    finishedAt: null,
    dailyChallengeDate,
    products: [],
  };
}

// ─── Persist Session ──────────────────────────────────────────────────────────

export async function saveSession(session: GameSession): Promise<void> {
  // Anti-cheat: enforce score ceiling
  const cappedScore = Math.min(session.score, GAME.MAX_SCORE_PER_SESSION);
  const ref = doc(db, FIRESTORE.SESSIONS, session.id);
  await setDoc(ref, { ...session, score: cappedScore });
}

export async function finalizeSession(sessionId: string): Promise<void> {
  const ref = doc(db, FIRESTORE.SESSIONS, sessionId);
  await updateDoc(ref, { finishedAt: Date.now() });
}

export async function fetchSession(sessionId: string): Promise<GameSession | null> {
  const ref = doc(db, FIRESTORE.SESSIONS, sessionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as GameSession;
}
