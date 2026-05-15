import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';

export default function OnboardingGoal() {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <Heading level="eyebrow">Step 3 of 5</Heading>
        <Heading level="display">What's drawing you here?</Heading>
        <Body>(5 goal cards wired in M1.)</Body>
      </View>
      <Pressable
        onPress={() => router.push('/(onboarding)/rhythm')}
        className="bg-coral rounded-full h-14 items-center justify-center mb-4 active:opacity-80"
      >
        <Body className="text-cream font-sans-semibold">Next</Body>
      </Pressable>
    </Screen>
  );
}
