import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  runTransaction,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from './firebase';
import { FIRESTORE } from '@constants/index';
import type { LeaderboardEntry } from '@types/index';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'allTime';

function collectionForPeriod(period: LeaderboardPeriod): string {
  switch (period) {
    case 'daily': return FIRESTORE.LEADERBOARD_DAILY;
    case 'weekly': return FIRESTORE.LEADERBOARD_WEEKLY;
    case 'allTime': return FIRESTORE.LEADERBOARD_ALL_TIME;
  }
}

function periodDocId(period: LeaderboardPeriod): string {
  const now = new Date();
  if (period === 'daily') return format(now, 'yyyy-MM-dd');
  if (period === 'weekly') {
    // ISO week
    const jan1 = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7
    );
    return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }
  return 'all_time';
}

// ─── Submit Score ─────────────────────────────────────────────────────────────

/**
 * Only updates if the new score beats the existing one (anti-inflation).
 */
export async function submitScore(
  uid: string,
  score: number,
  displayName: string,
  photoURL: string | null,
  level: number,
  periods: LeaderboardPeriod[] = ['daily', 'weekly', 'allTime']
): Promise<void> {
  await Promise.all(
    periods.map((period) =>
      submitScoreForPeriod(uid, score, displayName, photoURL, level, period)
    )
  );
}

async function submitScoreForPeriod(
  uid: string,
  score: number,
  displayName: string,
  photoURL: string | null,
  level: number,
  period: LeaderboardPeriod
): Promise<void> {
  const colId = collectionForPeriod(period);
  const docId = periodDocId(period);
  const ref = doc(db, colId, docId, 'scores', uid);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(ref);
    if (existing.exists() && existing.data().score >= score) return; // only improve

    tx.set(ref, {
      uid,
      score,
      displayName,
      photoURL,
      level,
      updatedAt: Date.now(),
    });
  });
}

// ─── Fetch Leaderboard ────────────────────────────────────────────────────────

export async function fetchLeaderboard(
  period: LeaderboardPeriod,
  topN = 50
): Promise<LeaderboardEntry[]> {
  const colId = collectionForPeriod(period);
  const docId = periodDocId(period);

  const q = query(
    collection(db, colId, docId, 'scores'),
    orderBy('score', 'desc'),
    limit(topN)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({
    ...(d.data() as LeaderboardEntry),
    rank: i + 1,
  }));
}

// ─── Get User Rank ────────────────────────────────────────────────────────────

export async function getUserRank(
  uid: string,
  period: LeaderboardPeriod
): Promise<number | null> {
  const entries = await fetchLeaderboard(period, 200);
  const index = entries.findIndex((e) => e.uid === uid);
  return index >= 0 ? index + 1 : null;
}
