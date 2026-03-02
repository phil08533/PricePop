export const COLORS = {
  // Brand
  primary: '#FF6B35',       // Vibrant orange — game-show energy
  primaryDark: '#E55A25',
  primaryLight: '#FF8C5A',
  secondary: '#7B2FBE',     // Deep purple — premium feel
  secondaryLight: '#9B4FDE',
  accent: '#FFD700',        // Gold — rewards & streaks

  // Backgrounds
  bgDark: '#0F0F1A',        // Near-black
  bgCard: '#1A1A2E',        // Card background
  bgCardAlt: '#1E1E35',
  bgSurface: '#252540',     // Surface / input fields

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0CC',
  textMuted: '#6B6B8A',
  textInverse: '#0F0F1A',

  // Game states
  correct: '#2ECC71',
  correctLight: '#A8F0C6',
  incorrect: '#E74C3C',
  incorrectLight: '#F5A09B',
  timeout: '#F39C12',
  neutral: '#3D3D5C',

  // Utility
  border: '#2A2A45',
  borderLight: '#3A3A55',
  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.4)',

  // Leaderboard ranks
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
} as const;

export const FONTS = {
  bold: 'System',
  semiBold: 'System',
  regular: 'System',
  mono: 'System',
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 38,
  '5xl': 48,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
