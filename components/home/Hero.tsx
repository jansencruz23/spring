import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Bell } from 'lucide-react-native';
import { SpringWordmark } from '../primitives/SpringMark';
import { useTheme } from '../../lib/theme';
import { greetingForHour } from '../../lib/util/time';

type Props = {
  name: string;
};

const FULL_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function Hero({ name }: Props) {
  const { palette, mode } = useTheme();
  const now = new Date();
  const hour = now.getHours();
  const greeting = greetingForHour(hour);
  const eyebrow = `${FULL_WEEKDAYS[now.getDay()]} · ${greetingLabel(hour)}`;
  const display = name.trim() || 'friend';
  const initial = display.charAt(0).toUpperCase();

  return (
    <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 22 }}>
      <View className="flex-row items-center justify-between" style={{ marginBottom: 22 }}>
        <SpringWordmark size={20} />
        <View className="flex-row" style={{ gap: 8 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={18} color={palette.bark} />
          </View>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: palette.coral,
            }}
          >
            <Text className="font-sans-bold" style={{ color: '#FFFFFF', fontSize: 13 }}>
              {initial}
            </Text>
          </View>
        </View>
      </View>

      <Animated.View entering={FadeIn.duration(420)}>
        <Text
          className="font-sans-semibold text-coral-deep"
          style={{
            fontSize: 13,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {eyebrow}
        </Text>
        <Text
          className="text-espresso"
          style={{
            fontFamily: 'Fraunces_500Medium',
            fontSize: 30,
            letterSpacing: -0.4,
            lineHeight: 34,
          }}
        >
          {greeting},{'\n'}
          <Text style={{ fontStyle: 'italic', color: palette.coralDeep }}>{display}.</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

function greetingLabel(hour: number): string {
  if (hour < 6) return 'Quiet hours';
  if (hour < 12) return 'Bright morning';
  if (hour < 14) return 'Midday';
  if (hour < 18) return 'Soft afternoon';
  if (hour < 21) return 'Calm evening';
  return 'Wind-down';
}
