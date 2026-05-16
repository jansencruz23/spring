import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  consumed: number;
  target: number;
  size?: number;
  stroke?: number;
};

export function EnergyRing({ consumed, target, size = 88, stroke = 7 }: Props) {
  const { palette } = useTheme();
  const radius = size / 2 - stroke - 1;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct, {
      duration: 900,
      easing: Easing.bezier(0.2, 0.7, 0.3, 1),
    });
  }, [pct, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const percentLabel = Math.round(pct * 100);

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Defs>
          <LinearGradient id="energyRingGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={palette.coral} />
            <Stop offset="100%" stopColor={palette.coralDeep} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.coralWhisper}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#energyRingGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
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
        <View className="flex-row items-baseline">
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 22,
              color: palette.espresso,
              lineHeight: 24,
            }}
          >
            {percentLabel}
          </Text>
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_500Medium',
              fontSize: 12,
              color: palette.inkSoft,
              marginLeft: 1,
            }}
          >
            %
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 9,
            color: palette.inkSoft,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginTop: 1,
          }}
        >
          fueled
        </Text>
      </View>
    </View>
  );
}
