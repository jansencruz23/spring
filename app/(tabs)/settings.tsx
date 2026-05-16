import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';
import { useTheme } from '../../lib/theme';
import { signOut, useSession } from '../../lib/auth';
import { useProfile, writeOnboardedFlag } from '../../lib/api';
import { useOnboardingDraft } from '../../lib/store/onboardingDraft';

export default function Settings() {
  const { mode, toggleMode, palette, accent, setAccent } = useTheme();
  const { session } = useSession();
  const profile = useProfile(session?.user.id);
  const qc = useQueryClient();
  const resetDraft = useOnboardingDraft((s) => s.reset);
  const [signingOut, setSigningOut] = useState(false);

  const swatches: { coral: string; coralDeep: string; coralSoft: string; label: string }[] = [
    { coral: '#EFA890', coralDeep: '#D8866A', coralSoft: '#FCE5D9', label: 'Peach (default)' },
    { coral: '#9BB89A', coralDeep: '#6E8E73', coralSoft: '#E3ECDF', label: 'Sage' },
    { coral: '#F4D27A', coralDeep: '#D9B257', coralSoft: '#FAEFCB', label: 'Butter' },
    { coral: '#C8A8D6', coralDeep: '#A487B8', coralSoft: '#EEE0F4', label: 'Lavender' },
  ];

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      writeOnboardedFlag(false);
      resetDraft();
      qc.clear();
      router.replace('/(auth)/sign-in');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Screen scroll>
      <View className="pt-6" style={{ gap: 24 }}>
        <View style={{ gap: 8 }}>
          <Heading level="eyebrow">Tweaks</Heading>
          <Heading level="display">Make Spring yours</Heading>
        </View>

        {profile.data ? (
          <View className="bg-ivory rounded-card p-5">
            <Body className="font-sans-semibold text-espresso">{profile.data.name || 'Friend'}</Body>
            <Body className="text-ink-soft text-sm">
              Goal: {labelForGoal(profile.data.goal)} · {profile.data.kcal_target} kcal/day
            </Body>
          </View>
        ) : null}

        <View className="bg-ivory rounded-card p-5" style={{ gap: 12 }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Body className="font-sans-semibold text-espresso">Dark mode</Body>
              <Body className="text-ink-soft text-sm">Currently: {mode}</Body>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleMode}
              trackColor={{ false: palette.sand, true: palette.coralDeep }}
              thumbColor={palette.cream}
            />
          </View>
        </View>

        <View className="bg-ivory rounded-card p-5" style={{ gap: 12 }}>
          <Body className="font-sans-semibold text-espresso">Accent color</Body>
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {swatches.map((s) => {
              const active = accent?.coral === s.coral || (!accent && s.label.startsWith('Peach'));
              return (
                <Pressable
                  key={s.label}
                  onPress={() =>
                    s.label.startsWith('Peach')
                      ? setAccent(null)
                      : setAccent({ coral: s.coral, coralDeep: s.coralDeep, coralSoft: s.coralSoft })
                  }
                  style={{ backgroundColor: s.coral }}
                  className={`h-12 w-12 rounded-full ${active ? 'border-2 border-espresso' : ''}`}
                />
              );
            })}
          </View>
          <Body className="text-ink-soft text-xs">Live accent picker — verified at M5.</Body>
        </View>

        <Pressable
          onPress={signingOut ? undefined : onSignOut}
          className="flex-row items-center justify-center rounded-full bg-ivory active:opacity-80"
          style={{
            height: 48,
            borderWidth: 1,
            borderColor: palette.coralWhisper,
            gap: 8,
          }}
        >
          {signingOut ? (
            <ActivityIndicator color={palette.bark} />
          ) : (
            <>
              <LogOut size={16} color={palette.bark} />
              <Text className="font-sans-semibold text-bark">Sign out</Text>
            </>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

function labelForGoal(goal: string | null): string {
  switch (goal) {
    case 'feel_good':      return 'Feel good';
    case 'lose_weight':    return 'Lose a little';
    case 'build_strength': return 'Build strength';
    case 'eat_better':     return 'Eat better';
    case 'sleep_deeper':   return 'Sleep deeper';
    default:               return 'Just started';
  }
}
