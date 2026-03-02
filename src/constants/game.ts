export const GAME = {
  // Rounds per game
  ROUNDS_CLASSIC: 10,
  ROUNDS_TIMED: 15,
  ROUNDS_CLOSEST: 8,
  ROUNDS_DAILY: 10,

  // Lives
  STARTING_LIVES: 3,
  MAX_LIVES: 3,

  // Timing (ms)
  TIMED_SECONDS_PER_ROUND: 8,
  ANSWER_REVEAL_DELAY: 1200,
  NEXT_ROUND_DELAY: 2000,

  // Scoring — Classic & Timed
  POINTS_CORRECT: 100,
  POINTS_TIMED_BONUS_MAX: 50,   // extra for answering fast
  POINTS_STREAK_MULTIPLIER: 0.1, // +10% per streak level

  // Scoring — Closest Guess
  CLOSEST_EXACT: 250,           // within 1%
  CLOSEST_GREAT: 150,           // within 5%
  CLOSEST_GOOD: 75,             // within 15%
  CLOSEST_CLOSE: 25,            // within 30%
  CLOSEST_MISS: 0,

  // Streak thresholds for UI changes
  STREAK_FIRE_THRESHOLD: 3,
  STREAK_INFERNO_THRESHOLD: 7,

  // XP
  XP_PER_CORRECT: 10,
  XP_PER_GAME: 20,
  XP_DAILY_BONUS: 50,
  XP_STREAK_BONUS: 5,           // per streak level

  // Anti-cheat
  MAX_SCORE_PER_SESSION: 5000,
  MIN_ROUND_TIME_MS: 400,       // fastest a human can answer

  // Product pool
  RECENTLY_SEEN_BUFFER: 50,     // don't repeat last N products
  OPTIONS_COUNT: 4,
  PRICE_OPTION_SPREAD: 0.5,     // options range ±50% of real price
} as const;

export const LEVELS = [
  { level: 1,  xpRequired: 0,    title: 'Bargain Hunter' },
  { level: 2,  xpRequired: 200,  title: 'Price Scout' },
  { level: 3,  xpRequired: 500,  title: 'Deal Finder' },
  { level: 4,  xpRequired: 1000, title: 'Value Seeker' },
  { level: 5,  xpRequired: 1800, title: 'Price Detective' },
  { level: 6,  xpRequired: 2800, title: 'Savvy Shopper' },
  { level: 7,  xpRequired: 4000, title: 'Market Expert' },
  { level: 8,  xpRequired: 5500, title: 'Price Master' },
  { level: 9,  xpRequired: 7500, title: 'Grand Appraiser' },
  { level: 10, xpRequired: 10000, title: 'Price Pop Legend' },
] as const;

export const ACHIEVEMENTS = [
  {
    id: 'first_win',
    title: 'First Pop!',
    description: 'Complete your first game',
    icon: '🎉',
    xpReward: 50,
  },
  {
    id: 'streak_5',
    title: 'On Fire',
    description: 'Get a 5x streak',
    icon: '🔥',
    xpReward: 100,
  },
  {
    id: 'streak_10',
    title: 'Inferno',
    description: 'Get a 10x streak',
    icon: '🌋',
    xpReward: 250,
  },
  {
    id: 'perfect_game',
    title: 'Perfect Eye',
    description: 'Get every answer right in a Classic game',
    icon: '👁️',
    xpReward: 300,
  },
  {
    id: 'daily_7',
    title: 'Daily Devotee',
    description: 'Complete 7 daily challenges in a row',
    icon: '📅',
    xpReward: 200,
  },
  {
    id: 'games_50',
    title: 'Veteran',
    description: 'Play 50 games',
    icon: '🎖️',
    xpReward: 150,
  },
  {
    id: 'games_100',
    title: 'Centurion',
    description: 'Play 100 games',
    icon: '💯',
    xpReward: 300,
  },
  {
    id: 'score_1000',
    title: 'Four Figures',
    description: 'Score 1,000 in a single game',
    icon: '💰',
    xpReward: 200,
  },
  {
    id: 'level_5',
    title: 'Detective',
    description: 'Reach Level 5',
    icon: '🔍',
    xpReward: 100,
  },
  {
    id: 'level_10',
    title: 'Legend',
    description: 'Reach Level 10',
    icon: '👑',
    xpReward: 500,
  },
] as const;
