import { View } from 'react-native';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';

export default function Today() {
  return (
    <Screen scroll>
      <View className="pt-6 gap-2">
        <Heading level="eyebrow">Today</Heading>
        <Heading level="display">Good morning</Heading>
        <Body className="mt-2">Energy ring, macro bars, hydration, supplements — wired in M1.</Body>
      </View>
    </Screen>
  );
}
