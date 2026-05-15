import { View } from 'react-native';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';

export default function Meals() {
  return (
    <Screen>
      <View className="pt-6 gap-2">
        <Heading level="eyebrow">Meals</Heading>
        <Heading level="display">This week</Heading>
        <Body className="mt-2">Weekly selector + meal cards wired in M2.</Body>
      </View>
    </Screen>
  );
}
