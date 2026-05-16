import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';
import { SpringAvatar } from './SpringAvatar';

// Direct port of the prototype's `spring-pulse` keyframes (1.2s ease-in-out,
// scaling 1 → 1.35 with opacity 0.4 → 1). Three dots staggered by 0.15s.

function Dot({ delay }: { delay: number }) {
  const { palette } = useTheme();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(t);
  }, [t, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.4 + t.value * 0.6,
    transform: [{ scale: 1 + t.value * 0.35 }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: palette.coralDeep,
        },
        style,
      ]}
    />
  );
}

export function TypingDots() {
  const { mode, palette } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 14,
      }}
    >
      <SpringAvatar />
      <View
        style={{
          backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
          borderRadius: 20,
          borderBottomLeftRadius: 6,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderWidth: 1,
          borderColor: palette.coralWhisper,
          flexDirection: 'row',
          gap: 4,
        }}
      >
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}
