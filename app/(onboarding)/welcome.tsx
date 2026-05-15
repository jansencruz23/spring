import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';

export default function OnboardingWelcome() {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <Heading level="eyebrow">Step 1 of 5</Heading>
        <Heading level="display">Let's bloom together</Heading>
        <Body>A gentle daily rhythm for the parts of you that matter most.</Body>
      </View>
      <Pressable
        onPress={() => router.push('/(onboarding)/name')}
        className="bg-coral rounded-full h-14 items-center justify-center mb-4 active:opacity-80"
      >
        <Body className="text-cream font-sans-semibold">Begin</Body>
      </Pressable>
    </Screen>
  );
}
