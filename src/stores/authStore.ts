import { create } from 'zustand';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@services/firebase';
import { fetchUserProfile, clearLocalProfile } from '@services/userService';
import { logout } from '@services/authService';
import type { UserProfile } from '@types/index';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setProfile: (profile: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  error: null,

  setProfile: (profile) => set({ profile }),

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const profile = await fetchUserProfile(user.uid);
      set({ profile });
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  },

  signOut: async () => {
    try {
      await logout();
      await clearLocalProfile();
      set({ user: null, profile: null });
    } catch (error) {
      set({ error: 'Failed to sign out' });
    }
  },

  clearError: () => set({ error: null }),
}));

// ─── Auth Observer (singleton) ────────────────────────────────────────────────

let unsubscribe: (() => void) | null = null;

export function initAuthObserver(): void {
  if (unsubscribe) return; // already initialized

  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      useAuthStore.setState({ user, isLoading: true });
      try {
        const profile = await fetchUserProfile(user.uid);
        useAuthStore.setState({ profile, isLoading: false, isInitialized: true });
      } catch {
        useAuthStore.setState({ isLoading: false, isInitialized: true });
      }
    } else {
      useAuthStore.setState({
        user: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  });
}
