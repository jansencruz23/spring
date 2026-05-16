import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';

type Props = { size?: number };

export function SpringAvatar({ size = 28 }: Props) {
  const { palette } = useTheme();
  const icon = Math.round(size * 0.5);
  return (
    <LinearGradient
      colors={[palette.butter, palette.coral]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View>
        <Sparkles size={icon} color="#FFFFFF" strokeWidth={2.2} />
      </View>
    </LinearGradient>
  );
}
