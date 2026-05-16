import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpringMark } from '../../components/primitives/SpringMark';
import { SpringBtn } from '../../components/primitives/SpringBtn';
import { useTheme } from '../../lib/theme';

export default function OnboardingWelcome() {
  const { palette } = useTheme();
  const bloom = useSharedValue(0.6);
  const bloomOpacity = useSharedValue(0);
  const titleOffset = useSharedValue(8);
  const titleOpacity = useSharedValue(0);
  const subOffset = useSharedValue(8);
  const subOpacity = useSharedValue(0);
  const ctaOffset = useSharedValue(8);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    // spring-bloom: scale 0.6 → 1.08 → 1, opacity 0 → 1 over ~900ms
    bloom.value = withSequence(
      withTiming(1.08, { duration: 540, easing: Easing.bezier(0.2, 1.4, 0.3, 1) }),
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );
    bloomOpacity.value = withTiming(1, { duration: 500 });

    // spring-fadeup, staggered
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    titleOffset.value = withDelay(200, withTiming(0, { duration: 500 }));

    subOpacity.value = withDelay(350, withTiming(1, { duration: 500 }));
    subOffset.value = withDelay(350, withTiming(0, { duration: 500 }));

    ctaOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    ctaOffset.value = withDelay(500, withTiming(0, { duration: 500 }));
  }, []);

  const bloomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bloom.value }],
    opacity: bloomOpacity.value,
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleOffset.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
    transform: [{ translateY: subOffset.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaOffset.value }],
  }));

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[palette.coralSoft, palette.cream]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={{ ...StyleAbsoluteFill }}
      />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-7">
          <Animated.View style={[{ marginBottom: 28 }, bloomStyle]}>
            <SpringMark size={92} color={palette.coral} secondary={palette.sageDeep} />
          </Animated.View>
          <Animated.Text
            style={[
              {
                fontFamily: 'Fraunces_500Medium',
                fontSize: 40,
                color: palette.espresso,
                letterSpacing: -1,
                textAlign: 'center',
                lineHeight: 44,
                marginBottom: 14,
              },
              titleStyle,
            ]}
          >
            Welcome to{' '}
            <Text style={{ fontStyle: 'italic', color: palette.coralDeep }}>Spring</Text>
          </Animated.Text>
          <Animated.Text
            style={[
              {
                fontFamily: 'PlusJakartaSans_400Regular',
                fontSize: 16,
                color: palette.bark,
                textAlign: 'center',
                lineHeight: 24,
                maxWidth: 300,
              },
              subStyle,
            ]}
          >
            A gentler way to look after yourself. Eat, move, rest — all in one calm place.
          </Animated.Text>
        </View>
        <Animated.View style={[{ paddingHorizontal: 24, paddingBottom: 24, gap: 12 }, ctaStyle]}>
          <SpringBtn onPress={() => router.push('/(onboarding)/name')}>
            <Text className="text-cream font-sans-semibold text-base">Let's begin</Text>
            <ArrowRight size={18} color={palette.cream} strokeWidth={2.2} />
          </SpringBtn>
          <Pressable
            onPress={() => router.push('/(auth)/sign-in')}
            className="items-center"
            style={{ paddingVertical: 8 }}
          >
            <Text className="font-sans text-ink-soft text-sm">I already have an account</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const StyleAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
