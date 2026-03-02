// ─── User Types ──────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: number;
  lastSeen: number;
  // Progression
  xp: number;
  level: number;
  // Game stats
  highScore: number;
  totalGamesPlayed: number;
  totalCorrect: number;
  totalAnswered: number;
  currentStreak: number;
  longestStreak: number;
  // Monetization
  isPremium: boolean;
  adsRemoved: boolean;
  // Daily
  lastDailyChallengeDate: string | null;
  dailyChallengeStreak: number;
  // Achievements
  achievements: string[];
  // Anti-cheat
  lastScoreSubmittedAt: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  level: number;
  rank?: number;
}

// ─── Product Types ────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'electronics'
  | 'fashion'
  | 'home'
  | 'beauty'
  | 'sports'
  | 'toys'
  | 'food'
  | 'tools'
  | 'automotive'
  | 'books'
  | 'misc';

export type DifficultyRating = 1 | 2 | 3 | 4 | 5;

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: ProductCategory;
  realPrice: number;
  affiliateUrl: string; // raw ASIN-based URL, tag injected at runtime
  asin: string;
  difficultyRating: DifficultyRating;
  brand: string;
  isActive: boolean;
  createdAt: number;
  timesShown: number;
  timesCorrect: number;
}

// ─── Game Types ───────────────────────────────────────────────────────────────

export type GameMode = 'classic' | 'closest' | 'timed';
export type GameStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'finished';
export type AnswerResult = 'correct' | 'incorrect' | 'timeout' | null;

export interface PriceOption {
  value: number;
  label: string; // formatted "$12.99"
}

export interface GameRound {
  product: Product;
  options: PriceOption[]; // 4 options for classic/timed; empty for closest
  correctIndex: number; // index in options array
  playerAnswer: number | null; // chosen price value
  result: AnswerResult;
  pointsEarned: number;
  timeTaken: number; // ms
  bonusApplied: boolean;
}

export interface GameSession {
  id: string;
  uid: string;
  mode: GameMode;
  rounds: GameRound[];
  score: number;
  streak: number;
  maxStreak: number;
  lives: number;
  startedAt: number;
  finishedAt: number | null;
  dailyChallengeDate: string | null; // "2024-01-15" if daily
  products: Product[]; // products shown this session (for affiliate display)
}

export interface GameState {
  session: GameSession | null;
  status: GameStatus;
  currentRoundIndex: number;
  currentProduct: Product | null;
  currentOptions: PriceOption[];
  timeRemaining: number; // seconds
  lastResult: AnswerResult;
  isDoubleXP: boolean;
  showRewardedAdPrompt: boolean;
}

// ─── Achievement Types ────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or image key
  condition: (profile: UserProfile) => boolean;
  xpReward: number;
}

// ─── Daily Challenge Types ────────────────────────────────────────────────────

export interface DailyChallenge {
  date: string; // "2024-01-15"
  productIds: string[];
  bonusMultiplier: number;
  expiresAt: number;
}

// ─── Navigation Types ────────────────────────────────────────────────────────

export type RootStackParamList = {
  '/(tabs)': undefined;
  '/onboarding': undefined;
  '/(auth)/welcome': undefined;
  '/(auth)/login': undefined;
  '/(auth)/register': undefined;
  '/game/play': { mode: GameMode; isDaily?: boolean };
  '/game/results': { sessionId: string };
  '/game/product-reveal': { asin: string; affiliateUrl: string; productName: string };
};
