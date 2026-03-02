import * as Haptics from 'expo-haptics';

/**
 * Centralized haptic feedback hook.
 * All haptics go through here so we can easily disable them for accessibility.
 */
export function useHaptics() {
  const tap = () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const select = () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  const success = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  const error = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  const warning = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

  const heavy = () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

  return { tap, select, success, error, warning, heavy };
}
