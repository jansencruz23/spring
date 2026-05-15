import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';

export default function OnboardingSummary() {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <Heading level="eyebrow">Step 5 of 5</Heading>
        <Heading level="display">Here's your starting place</Heading>
        <Body>(Macro summary + wind-down preview wired in M1, commits draft to profiles.)</Body>
      </View>
      <Pressable
        onPress={() => router.replace('/(tabs)')}
        className="bg-coral rounded-full h-14 items-center justify-center mb-4 active:opacity-80"
      >
        <Body className="text-cream font-sans-semibold">Open Spring</Body>
      </Pressable>
    </Screen>
  );
}
