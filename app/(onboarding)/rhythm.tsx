import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';

export default function OnboardingRhythm() {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <Heading level="eyebrow">Step 4 of 5</Heading>
        <Heading level="display">Your daily rhythm</Heading>
        <Body>(Wake / sleep time pickers wired in M1.)</Body>
      </View>
      <Pressable
        onPress={() => router.push('/(onboarding)/summary')}
        className="bg-coral rounded-full h-14 items-center justify-center mb-4 active:opacity-80"
      >
        <Body className="text-cream font-sans-semibold">Next</Body>
      </Pressable>
    </Screen>
  );
}
