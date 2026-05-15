import { View } from 'react-native';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';

export default function Workout() {
  return (
    <Screen>
      <View className="pt-6 gap-2">
        <Heading level="eyebrow">Train</Heading>
        <Heading level="display">Today's session</Heading>
        <Body className="mt-2">Session timer + set rows + rest timer wired in M3.</Body>
      </View>
    </Screen>
  );
}
