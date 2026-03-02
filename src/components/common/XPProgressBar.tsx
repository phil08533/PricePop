import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@constants/index';
import { xpForNextLevel } from '@services/userService';

interface XPProgressBarProps {
  xp: number;
  level: number;
  compact?: boolean;
}

export function XPProgressBar({ xp, level, compact = false }: XPProgressBarProps) {
  const { progress, nextLevelXP } = xpForNextLevel(xp);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactLevel}>Lv{level}</Text>
        <View style={styles.compactBarBg}>
          <Animated.View style={[styles.barFill, animatedStyle]} />
        </View>
        <Text style={styles.compactXP}>{xp.toLocaleString()}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.levelLabel}>Level {level}</Text>
        <Text style={styles.xpLabel}>
          {xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
        </Text>
      </View>
      <View style={styles.barBg}>
        <Animated.View style={[styles.barFill, animatedStyle]} />
      </View>
      <Text style={styles.nextLevel}>
        {Math.round((1 - progress) * (nextLevelXP - xp))} XP to Level {level + 1}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  xpLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  barBg: {
    height: 10,
    backgroundColor: COLORS.bgSurface,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  nextLevel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  compactLevel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    width: 28,
  },
  compactBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.bgSurface,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  compactXP: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    width: 40,
    textAlign: 'right',
  },
});
