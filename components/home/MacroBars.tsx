import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';

type MacroProps = {
  protein: { value: number; target: number };
  carbs: { value: number; target: number };
  fat: { value: number; target: number };
};

export function MacroBars({ protein, carbs, fat }: MacroProps) {
  const { palette } = useTheme();
  const macros = [
    { label: 'Protein', value: protein.value, target: protein.target, color: palette.coral, deep: palette.coralDeep },
    { label: 'Carbs', value: carbs.value, target: carbs.target, color: palette.butter, deep: palette.butterDeep },
    { label: 'Fat', value: fat.value, target: fat.target, color: palette.sage, deep: palette.sageDeep },
  ];

  return (
    <View className="flex-row" style={{ gap: 10 }}>
      {macros.map((m, i) => (
        <MacroBar
          key={m.label}
          label={m.label}
          value={m.value}
          target={m.target}
          color={m.color}
          deep={m.deep}
          delayMs={i * 80}
        />
      ))}
    </View>
  );
}

function MacroBar({
  label,
  value,
  target,
  color,
  deep,
  delayMs,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  deep: string;
  delayMs: number;
}) {
  const { palette } = useTheme();
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delayMs,
      withTiming(pct, { duration: 900, easing: Easing.bezier(0.2, 0.7, 0.3, 1) }),
    );
  }, [pct, scale, delayMs]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scale.value }],
  }));

  return (
    <View style={{ flex: 1 }}>
      <View className="flex-row items-baseline justify-between" style={{ marginBottom: 5 }}>
        <Text className="font-sans-semibold text-ink-soft" style={{ fontSize: 11 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 11, color: palette.bark }} className="font-sans-semibold">
          {value}
          <Text style={{ color: palette.stone }} className="font-sans-medium">
            /{target}g
          </Text>
        </Text>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: palette.cream,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              width: '100%',
              backgroundColor: color,
              borderRadius: 3,
              transformOrigin: 'left',
            },
            fillStyle,
          ]}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: deep,
              opacity: 0.4,
            }}
          />
        </Animated.View>
      </View>
    </View>
  );
}
