import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { format, subDays } from 'date-fns';

admin.initializeApp();
const db = admin.firestore();

// ─── Daily Challenge Generator ────────────────────────────────────────────────
// Runs at midnight UTC every day

export const generateDailyChallenge = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const ref = db.collection('daily_challenges').doc(today);

    // Don't overwrite if already exists
    const existing = await ref.get();
    if (existing.exists) {
      console.log(`Daily challenge for ${today} already exists`);
      return;
    }

    // Pick 10 random active products
    const productsSnap = await db
      .collection('products')
      .where('isActive', '==', true)
      .limit(100)
      .get();

    if (productsSnap.empty) {
      console.warn('No products found for daily challenge');
      return;
    }

    const allIds = productsSnap.docs.map((d) => d.id);
    const shuffled = allIds.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);

    const tomorrow = new Date();
    tomorrow.setUTCHours(23, 59, 59, 999);

    await ref.set({
      date: today,
      productIds: selected,
      bonusMultiplier: 1.5,
      expiresAt: tomorrow.getTime(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Daily challenge created for ${today}: ${selected.join(', ')}`);
  });

// ─── Leaderboard Cleanup ─────────────────────────────────────────────────────
// Runs weekly — removes daily leaderboard entries older than 30 days

export const cleanupLeaderboards = functions.pubsub
  .schedule('0 1 * * 0')  // Every Sunday at 1am UTC
  .timeZone('UTC')
  .onRun(async () => {
    const cutoff = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const snap = await db.collection('leaderboard_daily').get();

    const batch = db.batch();
    let count = 0;

    for (const doc of snap.docs) {
      if (doc.id < cutoff) {
        batch.delete(doc.ref);
        count++;
      }
    }

    if (count > 0) await batch.commit();
    console.log(`Cleaned up ${count} old daily leaderboard entries`);
  });

// ─── Score Validation Trigger ─────────────────────────────────────────────────
// Server-side anti-cheat: verify score on session write

export const validateSession = functions.firestore
  .document('sessions/{sessionId}')
  .onCreate(async (snap) => {
    const session = snap.data();
    const MAX_SCORE = 5000;
    const MIN_ROUND_TIME_MS = 400;

    if (!session) return;

    let flagged = false;
    const reasons: string[] = [];

    // Check score ceiling
    if (session.score > MAX_SCORE) {
      flagged = true;
      reasons.push(`Score ${session.score} exceeds ceiling ${MAX_SCORE}`);
    }

    // Check for impossibly fast answers
    const suspiciousRounds = (session.rounds ?? []).filter(
      (r: { timeTaken: number }) => r.timeTaken > 0 && r.timeTaken < MIN_ROUND_TIME_MS
    );
    if (suspiciousRounds.length > 2) {
      flagged = true;
      reasons.push(`${suspiciousRounds.length} rounds answered impossibly fast`);
    }

    if (flagged) {
      await snap.ref.update({
        flaggedForCheat: true,
        flagReasons: reasons,
        flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.warn(`Session ${snap.id} flagged:`, reasons);
    }
  });

// ─── Admin: Add Product ───────────────────────────────────────────────────────
// HTTPS endpoint — call with admin credentials to seed products

export const addProduct = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Must be an admin to add products'
    );
  }

  const required = ['name', 'asin', 'realPrice', 'imageUrl', 'category'];
  for (const field of required) {
    if (!data[field]) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Missing required field: ${field}`
      );
    }
  }

  const AFFILIATE_TAG = 'pricepop-20';
  const affiliateUrl = `https://www.amazon.com/dp/${data.asin}?tag=${AFFILIATE_TAG}&linkCode=ll1&language=en_US`;

  const product = {
    name: data.name,
    description: data.description ?? '',
    imageUrl: data.imageUrl,
    category: data.category,
    realPrice: Number(data.realPrice),
    affiliateUrl,
    asin: data.asin,
    brand: data.brand ?? '',
    difficultyRating: data.difficultyRating ?? 3,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    timesShown: 0,
    timesCorrect: 0,
  };

  const ref = await db.collection('products').add(product);
  return { id: ref.id, ...product };
});

// ─── Admin: Bulk Add Products ─────────────────────────────────────────────────

export const bulkAddProducts = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }

  const products: unknown[] = data.products ?? [];
  if (!Array.isArray(products) || products.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'products array required');
  }

  const AFFILIATE_TAG = 'pricepop-20';
  const batch = db.batch();
  const ids: string[] = [];

  for (const p of products as Record<string, unknown>[]) {
    const ref = db.collection('products').doc();
    ids.push(ref.id);
    batch.set(ref, {
      ...p,
      affiliateUrl: `https://www.amazon.com/dp/${p['asin']}?tag=${AFFILIATE_TAG}&linkCode=ll1`,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      timesShown: 0,
      timesCorrect: 0,
    });
  }

  await batch.commit();
  return { added: ids.length, ids };
});
