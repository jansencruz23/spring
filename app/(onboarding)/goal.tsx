import { router } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OnbStep } from '../../components/onboarding/OnbStep';
import { GOAL_OPTIONS, GoalCard } from '../../components/onboarding/GoalCard';
import { useOnboardingDraft } from '../../lib/store/onboardingDraft';

const TOTAL = 5;

export default function OnboardingGoal() {
  const goal = useOnboardingDraft((s) => s.draft.goal);
  const setField = useOnboardingDraft((s) => s.setField);

  return (
    <OnbStep
      step={2}
      total={TOTAL}
      title="What brings you to Spring?"
      disabled={!goal}
      onContinue={() => router.push('/(onboarding)/rhythm')}
    >
      <View style={{ gap: 10 }}>
        {GOAL_OPTIONS.map((opt, i) => (
          <Animated.View
            key={opt.id}
            entering={FadeInDown.duration(350).delay(100 + i * 50)}
          >
            <GoalCard
              goal={opt.id}
              label={opt.label}
              sub={opt.sub}
              Icon={opt.Icon}
              selected={goal === opt.id}
              onPress={() => setField('goal', opt.id)}
            />
          </Animated.View>
        ))}
      </View>
    </OnbStep>
  );
}
