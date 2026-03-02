import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView } from 'moti';
import { COLORS, FONT_SIZES, SPACING, RADIUS, STORAGE_KEYS } from '@constants/index';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  bg: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    emoji: '🏷️',
    title: 'Can You Guess\nThe Price?',
    subtitle: 'Test your shopping instincts against real Amazon products.',
    bg: COLORS.primary,
  },
  {
    id: '2',
    emoji: '🔥',
    title: 'Build Your\nStreak',
    subtitle: 'Chain correct answers for massive bonus points and fire streaks.',
    bg: COLORS.secondary,
  },
  {
    id: '3',
    emoji: '🏆',
    title: 'Climb The\nLeaderboard',
    subtitle: 'Compete daily, weekly, and all-time against players worldwide.',
    bg: '#1A6B4A',
  },
  {
    id: '4',
    emoji: '🛒',
    title: 'Spot A Deal?\nBuy It.',
    subtitle: 'Found something you love? Grab it on Amazon right from the game.',
    bg: '#2B4A8A',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    router.replace('/(auth)/welcome');
  };

  const renderSlide: ListRenderItem<Slide> = ({ item }) => (
    <View style={[styles.slide, { width, backgroundColor: item.bg }]}>
      <MotiView
        from={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 100 }}
        style={styles.emojiContainer}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
      </MotiView>
      <MotiView
        from={{ translateY: 30, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 200 }}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </MotiView>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
      <TouchableOpacity
        style={[styles.skipBtn, { top: insets.top + 16 }]}
        onPress={finishOnboarding}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.nextText}>
          {activeIndex === SLIDES.length - 1 ? "Let's Go! 🚀" : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  emojiContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 46,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 26,
  },
  skipBtn: {
    position: 'absolute',
    right: SPACING.md,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONT_SIZES.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.textPrimary,
  },
  nextBtn: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
