import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@stores/authStore';
import { STORAGE_KEYS, COLORS } from '@constants/index';

/**
 * Entry point — decides where to route the user:
 * 1. Not initialized → loading spinner
 * 2. No auth → check onboarding → onboarding or welcome
 * 3. Authed → home tabs
 */
export default function Index() {
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    const route = async () => {
      if (user) {
        router.replace('/(tabs)');
        return;
      }

      const onboardingDone = await AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETE
      );
      if (onboardingDone) {
        router.replace('/(auth)/welcome');
      } else {
        router.replace('/onboarding');
      }
    };

    route();
  }, [isInitialized, user]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgDark, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}
