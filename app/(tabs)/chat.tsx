import { View } from 'react-native';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';

export default function Chat() {
  return (
    <Screen>
      <View className="pt-6 gap-2">
        <Heading level="eyebrow">Spring</Heading>
        <Heading level="display">Ask anything</Heading>
        <Body className="mt-2">SSE-streamed chat against NVIDIA NIM wired in M4.</Body>
      </View>
    </Screen>
  );
}
