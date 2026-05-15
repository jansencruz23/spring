import { Tabs } from 'expo-router';
import { Dumbbell, Home, Settings, Sparkles, UtensilsCrossed } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';

export default function TabsLayout() {
  const { palette, mode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.coralDeep,
        tabBarInactiveTintColor: palette.inkSoft,
        tabBarStyle: {
          backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
          borderTopColor: mode === 'dark' ? palette.sand : palette.coralWhisper,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_500Medium',
          fontSize: 10.5,
          letterSpacing: 0.1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Today', tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} strokeWidth={1.75} /> }}
      />
      <Tabs.Screen
        name="meals"
        options={{ title: 'Meals', tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size - 2} strokeWidth={1.75} /> }}
      />
      <Tabs.Screen
        name="workout"
        options={{ title: 'Train', tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size - 2} strokeWidth={1.75} /> }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: 'Spring', tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size - 2} strokeWidth={1.75} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size - 2} strokeWidth={1.75} /> }}
      />
    </Tabs>
  );
}
