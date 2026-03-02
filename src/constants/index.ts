export * from './theme';
export * from './game';

export const AFFILIATE = {
  TAG: 'pricepop-20', // Replace with your actual Amazon affiliate tag
  BASE_URL: 'https://www.amazon.com/dp/',
  DISCLOSURE: 'PricePop earns a small commission from qualifying Amazon purchases at no extra cost to you.',
} as const;

export const ADMOB = {
  // Test IDs — swap for real IDs before production
  BANNER_ANDROID: 'ca-app-pub-3940256099942544/6300978111',
  BANNER_IOS: 'ca-app-pub-3940256099942544/2934735716',
  REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917',
  REWARDED_IOS: 'ca-app-pub-3940256099942544/1712485313',
  INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712',
  INTERSTITIAL_IOS: 'ca-app-pub-3940256099942544/4411468910',
} as const;

export const STORAGE_KEYS = {
  USER_PROFILE: '@pricepop/user_profile',
  SEEN_PRODUCTS: '@pricepop/seen_products',
  ONBOARDING_COMPLETE: '@pricepop/onboarding_complete',
  SETTINGS: '@pricepop/settings',
  PENDING_SCORE: '@pricepop/pending_score',
} as const;

export const FIRESTORE = {
  USERS: 'users',
  PRODUCTS: 'products',
  SESSIONS: 'sessions',
  LEADERBOARD_DAILY: 'leaderboard_daily',
  LEADERBOARD_WEEKLY: 'leaderboard_weekly',
  LEADERBOARD_ALL_TIME: 'leaderboard_all_time',
  DAILY_CHALLENGES: 'daily_challenges',
} as const;
