import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';

export default function SignIn() {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-6">
        <View className="gap-2">
          <Heading level="eyebrow">Welcome to</Heading>
          <Heading level="display">Spring</Heading>
          <Body className="mt-2">Your warm, gentle wellness companion.</Body>
        </View>

        <Pressable
          onPress={() => router.replace('/(onboarding)/welcome')}
          className="bg-coral rounded-full h-14 items-center justify-center active:opacity-80"
        >
          <Body className="text-cream font-sans-semibold">Get started</Body>
        </Pressable>
      </View>
    </Screen>
  );
}
