import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** Wall-clock ms when the current rest ends. null = idle (no active rest). */
  endsAt: number | null;
  /** Total prescribed rest in ms — sets the ring's 100% mark. */
  totalMs: number;
  onAddTime: () => void;
  onSkip: () => void;
  /** Optional copy under the "Resting" eyebrow ("Set 2 of squats next…"). */
  message?: string;
};

const SIZE = 88;
const STROKE = 7;
const RADIUS = SIZE / 2 - STROKE - 1;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Coral-gradient hero card that drives the smooth-ring + numeric countdown
 * between sets. Animation lives on the UI thread (Reanimated worklet); the JS
 * number display is updated via `useAnimatedReaction` at 1Hz max.
 */
export function RestTimer({ endsAt, totalMs, onAddTime, onSkip, message }: Props) {
  const { palette } = useTheme();
  const progress = useSharedValue(0); // 0..1 — 1 = full duration remaining
  const [remainingSec, setRemainingSec] = useState(0);
  const totalSec = Math.max(1, Math.round(totalMs / 1000));

  useEffect(() => {
    cancelAnimation(progress);
    if (endsAt == null) {
      progress.value = 0;
      setRemainingSec(0);
      return;
    }
    const remainingMs = Math.max(0, endsAt - Date.now());
    progress.value = Math.min(1, remainingMs / totalMs);
    setRemainingSec(Math.ceil(remainingMs / 1000));
    if (remainingMs > 0) {
      progress.value = withTiming(0, {
        duration: remainingMs,
        easing: Easing.linear,
      });
    }
  }, [endsAt, totalMs, progress]);

  useAnimatedReaction(
    () => Math.max(0, Math.ceil(progress.value * totalSec)),
    (curr, prev) => {
      if (curr !== prev) {
        runOnJS(setRemainingSec)(curr);
      }
    },
    [totalSec],
  );

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const isResting = endsAt != null && remainingSec > 0;

  return (
    <View
      style={{
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: palette.coralDeep,
        shadowOpacity: 0.25,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      }}
    >
      <LinearGradient
        colors={[palette.coral, palette.coralDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        <View className="flex-row items-center" style={{ gap: 18 }}>
          <View style={{ width: SIZE, height: SIZE }}>
            <Svg
              width={SIZE}
              height={SIZE}
              style={{ transform: [{ rotate: '-90deg' }] }}
            >
              <Circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={STROKE}
                fill="none"
              />
              <AnimatedCircle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="#FFFFFF"
                strokeWidth={STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                animatedProps={animatedProps}
              />
            </Svg>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Fraunces_600SemiBold',
                  fontSize: 22,
                  color: '#FFFFFF',
                }}
              >
                {isResting ? `${remainingSec}s` : '—'}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 11,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.78)',
              }}
            >
              {isResting ? 'Resting' : 'Ready'}
            </Text>
            <Text
              style={{
                fontFamily: 'Fraunces_500Medium',
                fontSize: 18,
                color: '#FFFFFF',
                lineHeight: 22,
                marginTop: 2,
              }}
              numberOfLines={2}
            >
              {message ?? (isResting ? 'Catch your breath.' : 'Tap log set when you finish.')}
            </Text>
          </View>
        </View>

        <View className="flex-row" style={{ gap: 8, marginTop: 14 }}>
          <Pressable
            onPress={onAddTime}
            disabled={!isResting}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 19,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isResting ? 1 : 0.5,
            }}
          >
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 13,
                color: '#FFFFFF',
              }}
            >
              +15s
            </Text>
          </Pressable>
          <Pressable
            onPress={onSkip}
            disabled={!isResting}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 19,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isResting ? 1 : 0.5,
            }}
          >
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 13,
                color: palette.coralDeep,
              }}
            >
              Skip rest
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
