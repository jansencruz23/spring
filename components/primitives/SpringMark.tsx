import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../lib/theme';

type Props = {
  size?: number;
  color?: string;
  secondary?: string;
};

export function SpringMark({ size = 24, color, secondary }: Props) {
  const { palette } = useTheme();
  const primary = color ?? palette.coralDeep;
  const accent = secondary ?? palette.sageDeep;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z"
        fill={primary}
        opacity={0.18}
      />
      <Path
        d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z"
        stroke={primary}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M5 19l9-9" stroke={primary} strokeWidth={1.75} strokeLinecap="round" />
      <Circle cx={16.5} cy={7.5} r={1.4} fill={accent} />
    </Svg>
  );
}

export function SpringWordmark({ size = 22 }: { size?: number }) {
  return (
    <View className="flex-row items-center" style={{ gap: 6 }}>
      <SpringMark size={size} />
      <SpringWord size={size} />
    </View>
  );
}

function SpringWord({ size }: { size: number }) {
  // Imported lazily here to avoid a circular import — components/primitives/Heading
  // is intentionally minimal.
  const { Text } = require('react-native') as typeof import('react-native');
  return (
    <Text
      style={{
        fontFamily: 'Fraunces_500Medium',
        fontSize: size,
        letterSpacing: -0.4,
      }}
      className="text-espresso"
    >
      Spring
    </Text>
  );
}
