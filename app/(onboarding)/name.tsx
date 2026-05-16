import { router } from 'expo-router';
import { TextInput, Text, View } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { OnbStep } from '../../components/onboarding/OnbStep';
import { useOnboardingDraft } from '../../lib/store/onboardingDraft';
import { useTheme } from '../../lib/theme';

const TOTAL = 5;

export default function OnboardingName() {
  const { palette } = useTheme();
  const name = useOnboardingDraft((s) => s.draft.name);
  const setField = useOnboardingDraft((s) => s.setField);

  return (
    <OnbStep
      step={1}
      total={TOTAL}
      title="What should we call you?"
      disabled={name.trim().length === 0}
      onContinue={() => router.push('/(onboarding)/goal')}
    >
      <Text className="font-sans text-ink-soft text-sm" style={{ marginBottom: 22, lineHeight: 22 }}>
        Just a first name is fine — we'll use it to greet you each morning.
      </Text>

      <View style={{ borderBottomColor: palette.coralDeep, borderBottomWidth: 2, paddingBottom: 8 }}>
        <TextInput
          value={name}
          onChangeText={(v) => setField('name', v)}
          placeholder="Type your name"
          placeholderTextColor={palette.stone}
          autoFocus
          maxLength={80}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (name.trim().length > 0) router.push('/(onboarding)/goal');
          }}
          style={{
            fontFamily: 'Fraunces_500Medium',
            fontSize: 30,
            color: palette.espresso,
            letterSpacing: -0.4,
          }}
        />
      </View>

      <View
        className="flex-row items-center"
        style={{ marginTop: 16, gap: 6 }}
      >
        <Leaf size={13} color={palette.sageDeep} strokeWidth={2} />
        <Text className="font-sans text-stone text-xs">
          We'll never share your name with anyone.
        </Text>
      </View>
    </OnbStep>
  );
}
