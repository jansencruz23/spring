import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { OnbStep } from '../../components/onboarding/OnbStep';
import { TimePickerRow } from '../../components/onboarding/TimePickerRow';
import { useOnboardingDraft } from '../../lib/store/onboardingDraft';
import { useTheme } from '../../lib/theme';
import { formatSleepDuration, sleepDurationMinutes } from '../../lib/util/time';

const TOTAL = 5;

export default function OnboardingRhythm() {
  const { palette } = useTheme();
  const wake = useOnboardingDraft((s) => s.draft.wakeTime);
  const sleep = useOnboardingDraft((s) => s.draft.sleepTime);
  const setField = useOnboardingDraft((s) => s.setField);

  const duration = sleepDurationMinutes(sleep, wake);

  return (
    <OnbStep
      step={3}
      total={TOTAL}
      title="When does your day begin?"
      onContinue={() => router.push('/(onboarding)/summary')}
    >
      <Text className="font-sans text-ink-soft text-sm" style={{ marginBottom: 22, lineHeight: 22 }}>
        We'll plan meals, training, and reminders around your natural rhythm.
      </Text>

      <TimePickerRow
        label="Wake up around"
        value={wake}
        tint="coral"
        onChange={(v) => setField('wakeTime', v)}
      />
      <TimePickerRow
        label="Wind down around"
        value={sleep}
        tint="sage"
        onChange={(v) => setField('sleepTime', v)}
      />

      <View
        className="flex-row"
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 14,
          backgroundColor: palette.butterSoft,
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <Sparkles size={16} color={palette.butterDeep} strokeWidth={2} />
        <Text className="flex-1 font-sans text-bark text-xs" style={{ lineHeight: 18 }}>
          That's about <Text className="font-sans-bold">{formatSleepDuration(duration)}</Text> of
          sleep — well within the gentle sweet spot.
        </Text>
      </View>
    </OnbStep>
  );
}
