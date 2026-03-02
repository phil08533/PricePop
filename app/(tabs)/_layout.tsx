import { Tabs } from 'expo-router';
import { COLORS } from '@constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Play', tabBarIcon: ({ color }) => <TabIcon emoji="🎮" color={color} /> }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{ title: 'Ranks', tabBarIcon: ({ color }) => <TabIcon emoji="🏆" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22, opacity: color === COLORS.primary ? 1 : 0.5 }}>{emoji}</Text>;
}
