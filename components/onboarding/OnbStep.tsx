import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { OnbDots } from './OnbDots';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  step: number;
  total: number;
  title: string;
  children: ReactNode;
  ctaLabel?: string;
  onContinue: () => void;
  disabled?: boolean;
  showBack?: boolean;
};

export function OnbStep({
  step,
  total,
  title,
  children,
  ctaLabel = 'Continue',
  onContinue,
  disabled,
  showBack = true,
}: Props) {
  const { palette } = useTheme();

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-cream">
      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 18 }}
      >
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={{ padding: 6, marginLeft: -6 }}
          >
            <ArrowLeft size={20} color={palette.bark} />
          </Pressable>
        ) : (
          <View style={{ width: 32 }} />
        )}
        <OnbDots total={total} current={step} />
        <View style={{ width: 32 }} />
      </View>

      <Animated.View
        entering={FadeInDown.duration(350)}
        style={{ paddingHorizontal: 24, marginBottom: 28 }}
      >
        <Text
          className="text-stone font-sans-semibold"
          style={{
            fontSize: 12,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Step {step} of {total - 2}
        </Text>
        <Text
          className="text-espresso"
          style={{
            fontFamily: 'Fraunces_500Medium',
            fontSize: 28,
            letterSpacing: -0.4,
            lineHeight: 32,
          }}
        >
          {title}
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={{ paddingHorizontal: 24, flex: 1 }}
      >
        {children}
      </Animated.View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
        <Pressable
          onPress={disabled ? undefined : onContinue}
          disabled={disabled}
          className={`flex-row items-center justify-center rounded-full h-14 bg-coral ${disabled ? 'opacity-40' : 'active:opacity-80'}`}
          style={{ gap: 8 }}
        >
          <Text className="font-sans-semibold text-base text-cream">{ctaLabel}</Text>
          <ArrowRight size={18} color={palette.cream} strokeWidth={2.2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
