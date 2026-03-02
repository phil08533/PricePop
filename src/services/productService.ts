import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  getDoc,
  orderBy,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { FIRESTORE, STORAGE_KEYS, GAME } from '@constants/index';
import type { Product, PriceOption, ProductCategory, GameMode } from '@types/index';

// ─── Fetch Products for a Game ───────────────────────────────────────────────

export async function fetchProductsForGame(
  mode: GameMode,
  count: number,
  category?: ProductCategory
): Promise<Product[]> {
  const seenIds = await getSeenProductIds();

  let q = query(
    collection(db, FIRESTORE.PRODUCTS),
    where('isActive', '==', true),
    limit(count + 20) // fetch extra to account for filtering
  );

  if (category) {
    q = query(
      collection(db, FIRESTORE.PRODUCTS),
      where('isActive', '==', true),
      where('category', '==', category),
      limit(count + 20)
    );
  }

  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));

  // Filter out recently seen, shuffle, take needed count
  const unseen = all.filter((p) => !seenIds.includes(p.id));
  const pool = unseen.length >= count ? unseen : all; // fallback to all if pool too small
  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, count);

  // Update seen buffer
  await addToSeenProducts(selected.map((p) => p.id));

  return selected;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const ref = doc(db, FIRESTORE.PRODUCTS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  const promises = ids.map(fetchProductById);
  const results = await Promise.all(promises);
  return results.filter((p): p is Product => p !== null);
}

// ─── Price Options Generator ─────────────────────────────────────────────────

export function generatePriceOptions(
  realPrice: number,
  count: number = GAME.OPTIONS_COUNT
): PriceOption[] {
  const options: number[] = [realPrice];
  const spread = GAME.PRICE_OPTION_SPREAD;

  while (options.length < count) {
    // Generate plausible wrong answers
    const multiplier = 1 + (Math.random() * spread * 2 - spread);
    let fake = realPrice * multiplier;

    // Round to realistic price endings
    fake = roundToRealisticPrice(fake);

    // Ensure no duplicates and minimum 10% difference from existing options
    const tooClose = options.some((o) => Math.abs(o - fake) / realPrice < 0.1);
    if (!tooClose && fake > 0) {
      options.push(fake);
    }
  }

  // Shuffle
  const shuffled = shuffleArray(options);

  return shuffled.map((value) => ({
    value,
    label: formatPrice(value),
  }));
}

export function getCorrectOptionIndex(
  options: PriceOption[],
  realPrice: number
): number {
  return options.findIndex((o) => o.value === realPrice);
}

// ─── Closest Guess Scoring ────────────────────────────────────────────────────

export function scoreClosestGuess(
  guessedPrice: number,
  realPrice: number
): { points: number; percentOff: number; label: string } {
  const diff = Math.abs(guessedPrice - realPrice);
  const percentOff = (diff / realPrice) * 100;

  if (percentOff <= 1) return { points: 250, percentOff, label: 'EXACT!' };
  if (percentOff <= 5) return { points: 150, percentOff, label: 'AMAZING!' };
  if (percentOff <= 15) return { points: 75, percentOff, label: 'CLOSE!' };
  if (percentOff <= 30) return { points: 25, percentOff, label: 'NICE TRY' };
  return { points: 0, percentOff, label: 'MISS' };
}

// ─── Recently Seen Buffer ────────────────────────────────────────────────────

async function getSeenProductIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SEEN_PRODUCTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function addToSeenProducts(ids: string[]): Promise<void> {
  try {
    const current = await getSeenProductIds();
    const updated = [...ids, ...current].slice(0, GAME.RECENTLY_SEEN_BUFFER);
    await AsyncStorage.setItem(STORAGE_KEYS.SEEN_PRODUCTS, JSON.stringify(updated));
  } catch {}
}

export async function clearSeenProducts(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.SEEN_PRODUCTS);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function roundToRealisticPrice(price: number): number {
  if (price < 10) return Math.round(price * 10) / 10; // $X.X0
  if (price < 100) return Math.round(price) - 0.01;   // $X.99
  return Math.round(price / 5) * 5 - 0.01;            // $X4.99
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
