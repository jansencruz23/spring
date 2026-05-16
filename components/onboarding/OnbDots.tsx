import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '../../lib/theme';

type Props = {
  total: number;
  current: number;
};

export function OnbDots({ total, current }: Props) {
  return (
    <View className="flex-row items-center" style={{ gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} index={i} current={current} />
      ))}
    </View>
  );
}

function Dot({ index, current }: { index: number; current: number }) {
  const { palette } = useTheme();
  const isActive = index === current;
  const isFilled = index <= current;
  const width = useSharedValue(isActive ? 28 : 8);

  useEffect(() => {
    width.value = withTiming(isActive ? 28 : 8, { duration: 350 });
  }, [isActive, width]);

  const style = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Animated.View
      style={[
        {
          height: 4,
          borderRadius: 2,
          backgroundColor: isFilled ? palette.coralDeep : palette.sand,
        },
        style,
      ]}
    />
  );
}
