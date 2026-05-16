import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowRight, Droplet, Flame, Moon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnbDots } from '../../components/onboarding/OnbDots';
import { SpringCard } from '../../components/primitives/SpringCard';
import { useOnboardingDraft } from '../../lib/store/onboardingDraft';
import { useSession } from '../../lib/auth';
import { macrosForGoal } from '../../lib/api';
import { useUpsertProfile, writeOnboardedFlag } from '../../lib/api/hooks';
import { OnboardingDraftSchema } from '../../lib/schemas/profile';
import { formatSleepDuration, sleepDurationMinutes, timeToMinutes, minutesToTime } from '../../lib/util/time';
import { useTheme } from '../../lib/theme';

const TOTAL = 5;

export default function OnboardingSummary() {
  const { palette } = useTheme();
  const draft = useOnboardingDraft((s) => s.draft);
  const resetDraft = useOnboardingDraft((s) => s.reset);
  const { session } = useSession();
  const userId = session?.user.id;
  const upsert = useUpsertProfile(userId);

  const macros = useMemo(() => macrosForGoal(draft.goal ?? 'feel_good'), [draft.goal]);
  const sleepMinutes = sleepDurationMinutes(draft.sleepTime, draft.wakeTime);
  // Wind-down = sleep time minus 30 minutes (gentle pre-bed buffer).
  const windDown = minutesToTime(timeToMinutes(draft.sleepTime) - 30);

  const onFinish = async () => {
    const parsed = OnboardingDraftSchema.safeParse(draft);
    if (!parsed.success) {
      // The earlier steps gated this — should not happen. Bail out to start.
      router.replace('/(onboarding)/welcome');
      return;
    }

    try {
      if (userId) {
        await upsert.mutateAsync(parsed.data);
      } else {
        // Demo / Supabase-not-configured path: skip remote write but mark local.
        writeOnboardedFlag(true);
      }
      resetDraft();
      router.replace('/(tabs)');
    } catch (e) {
      // Mutation error is surfaced via `upsert.error` below — stay on screen.
      // Logging it as well so it shows up in Metro for debugging schema /
      // RLS / network issues that the toast doesn't capture in full.
      // eslint-disable-next-line no-console
      console.warn('[onboarding] profile upsert failed:', e);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[palette.coralWhisper, palette.cream]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View
          className="flex-row items-center justify-center"
          style={{ paddingVertical: 18 }}
        >
          <OnbDots total={TOTAL} current={4} />
        </View>

        <View style={{ paddingHorizontal: 24, flex: 1 }}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text
              className="font-sans-semibold text-coral-deep"
              style={{
                fontSize: 12,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Your fresh start
            </Text>
            <Text
              className="text-espresso"
              style={{
                fontFamily: 'Fraunces_500Medium',
                fontSize: 30,
                letterSpacing: -0.5,
                lineHeight: 34,
                marginBottom: 6,
              }}
            >
              Hello, {draft.name.trim() || 'friend'} —{'\n'}
              <Text style={{ fontStyle: 'italic', color: palette.coralDeep }}>
                here's your starting place.
              </Text>
            </Text>
            <Text className="font-sans text-ink-soft" style={{ fontSize: 14, lineHeight: 22, marginBottom: 22 }}>
              Numbers are gentle suggestions — we'll adjust as we learn your rhythm.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(150)} style={{ gap: 12 }}>
            <SpringCard padding="l">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-sans-semibold text-ink-soft" style={{ fontSize: 12 }}>
                    Daily energy
                  </Text>
                  <View className="flex-row items-baseline">
                    <Text
                      className="text-espresso"
                      style={{
                        fontFamily: 'Fraunces_500Medium',
                        fontSize: 32,
                        lineHeight: 36,
                      }}
                    >
                      {macros.kcal_target.toLocaleString()}
                    </Text>
                    <Text className="font-sans-medium text-ink-soft" style={{ fontSize: 14, marginLeft: 6 }}>
                      kcal
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: palette.coralSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Flame size={22} color={palette.coralDeep} />
                </View>
              </View>
              <View className="flex-row" style={{ gap: 8, marginTop: 14 }}>
                {[
                  { label: 'Protein', value: `${macros.protein_g}g`, color: palette.coral },
                  { label: 'Carbs', value: `${macros.carbs_g}g`, color: palette.butter },
                  { label: 'Fat', value: `${macros.fat_g}g`, color: palette.sage },
                ].map((m) => (
                  <View
                    key={m.label}
                    style={{
                      flex: 1,
                      backgroundColor: palette.cream,
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <Text className="font-sans-semibold text-ink-soft" style={{ fontSize: 10 }}>
                      {m.label}
                    </Text>
                    <Text className="font-sans-semibold text-espresso" style={{ fontSize: 14 }}>
                      {m.value}
                    </Text>
                    <View
                      style={{
                        height: 3,
                        borderRadius: 2,
                        backgroundColor: m.color,
                        marginTop: 5,
                        opacity: 0.7,
                      }}
                    />
                  </View>
                ))}
              </View>
            </SpringCard>

            <SpringCard>
              <View className="flex-row items-center" style={{ gap: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: palette.sageSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Moon size={18} color={palette.sageDeep} />
                </View>
                <View className="flex-1">
                  <Text className="font-sans-semibold text-espresso" style={{ fontSize: 14 }}>
                    Wind down by {formatHourLabel(windDown)}
                  </Text>
                  <Text className="font-sans text-ink-soft" style={{ fontSize: 12 }}>
                    For {formatSleepDuration(sleepMinutes)} of sleep before {formatHourLabel(draft.wakeTime)}
                  </Text>
                </View>
              </View>
            </SpringCard>

            <SpringCard>
              <View className="flex-row items-center" style={{ gap: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: palette.butterSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Droplet size={18} color={palette.butterDeep} />
                </View>
                <View className="flex-1">
                  <Text className="font-sans-semibold text-espresso" style={{ fontSize: 14 }}>
                    {(macros.water_ml_target / 1000).toFixed(1)} L of water
                  </Text>
                  <Text className="font-sans text-ink-soft" style={{ fontSize: 12 }}>
                    About {Math.round(macros.water_ml_target / 250)} glasses through the day
                  </Text>
                </View>
              </View>
            </SpringCard>
          </Animated.View>

          {upsert.isError ? (
            <View style={{ marginTop: 12, gap: 4 }}>
              <Text className="font-sans-semibold text-danger text-xs">
                Couldn't save just now.
              </Text>
              <Text className="font-sans text-danger text-xs" style={{ lineHeight: 16 }}>
                {formatUpsertError(upsert.error)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
          <Pressable
            onPress={upsert.isPending ? undefined : onFinish}
            disabled={upsert.isPending}
            className={`flex-row items-center justify-center rounded-full h-14 bg-coral ${upsert.isPending ? 'opacity-60' : 'active:opacity-80'}`}
            style={{ gap: 8 }}
          >
            {upsert.isPending ? (
              <ActivityIndicator color={palette.cream} />
            ) : (
              <>
                <Text className="font-sans-semibold text-cream text-base">Take me home</Text>
                <ArrowRight size={18} color={palette.cream} strokeWidth={2.2} />
              </>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function formatHourLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const hh = h ?? 0;
  const mm = m ?? 0;
  const period = hh >= 12 ? 'pm' : 'am';
  const display = ((hh + 11) % 12) + 1;
  return `${display}:${String(mm).padStart(2, '0')} ${period}`;
}

/**
 * Supabase / postgrest returns plain `{ message, code, details, hint }` objects,
 * not Error instances — so `String(err)` yields "[object Object]". Pull out the
 * useful fields, fall back to JSON for anything else.
 */
function formatUpsertError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>;
    const msg = typeof o.message === 'string' ? o.message : '';
    const code = typeof o.code === 'string' ? ` [${o.code}]` : '';
    const hint = typeof o.hint === 'string' && o.hint ? ` — ${o.hint}` : '';
    if (msg) return `${msg}${code}${hint}`;
    try {
      return JSON.stringify(err);
    } catch {
      return '(unknown error)';
    }
  }
  return String(err);
}
