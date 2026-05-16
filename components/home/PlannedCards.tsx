import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Dumbbell, Moon } from 'lucide-react-native';
import { SpringCard } from '../primitives/SpringCard';
import { useTheme } from '../../lib/theme';
import { useSession } from '../../lib/auth';
import { useActiveWorkoutSession, useWorkoutSets } from '../../lib/api/hooks';
import { DEFAULT_ROUTINE, TOTAL_TARGET_SETS } from '../../lib/workouts/routine';

function formatElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Two side-by-side cards: "Today's workout" + "Last night's sleep".
 * Workout card mirrors active-session state — when a session is running it
 * shows the live elapsed time + how many sets are done. Tapping any state
 * routes to the Train tab. Sleep stays a v1-cut placeholder.
 */
export function PlannedCards() {
  const { mode, palette } = useTheme();
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user.id;
  const activeSession = useActiveWorkoutSession(userId);
  const sets = useWorkoutSets(userId, activeSession.data?.id);

  const [elapsedSec, setElapsedSec] = useState(0);
  const live = !!activeSession.data;

  // Sleep card uses a dedicated plum tint that isn't in the theme palette. Pick
  // values that read on cream and on the warm-dark cream so the card still feels
  // like "night" in both modes.
  const sleepTileBg = mode === 'dark' ? '#5A4F7A' : '#3D3759';
  const sleepIcon = mode === 'dark' ? '#F0EAFA' : '#E0DBF5';
  const sleepAccent = mode === 'dark' ? '#C8B8E0' : '#7A6FA0';

  useEffect(() => {
    if (!activeSession.data) {
      setElapsedSec(0);
      return;
    }
    const started = new Date(activeSession.data.started_at).getTime();
    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeSession.data]);

  const setsDone = sets.data?.length ?? 0;

  return (
    <View className="flex-row" style={{ gap: 12 }}>
      <Pressable
        onPress={() => router.push('/(tabs)/workout')}
        style={{ flex: 1 }}
      >
        <SpringCard padding="m">
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: live ? palette.coralSoft : palette.sageSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Dumbbell
                size={15}
                color={live ? palette.coralDeep : palette.sageDeep}
              />
            </View>
            <Text
              className="font-sans-semibold text-ink-soft"
              style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {live ? `Live · ${formatElapsed(elapsedSec)}` : 'Today'}
            </Text>
          </View>
          <Text
            className="text-espresso"
            style={{ fontFamily: 'Fraunces_500Medium', fontSize: 18, lineHeight: 22 }}
          >
            {DEFAULT_ROUTINE.titleEmphasis}
            {'\n'}
            <Text style={{ color: live ? palette.coralDeep : palette.sageDeep }}>
              {DEFAULT_ROUTINE.titleRest}
            </Text>
          </Text>
          <Text className="font-sans text-ink-soft" style={{ fontSize: 11, marginTop: 8 }}>
            {live
              ? `${setsDone} / ${TOTAL_TARGET_SETS} sets done`
              : `${DEFAULT_ROUTINE.exercises.length} exercises · ~${Math.round(DEFAULT_ROUTINE.exercises.length * 7)} min`}
          </Text>
          <View
            className="flex-row items-center justify-end"
            style={{ marginTop: 12 }}
          >
            <ChevronRight size={16} color={palette.stone} />
          </View>
        </SpringCard>
      </Pressable>

      <SpringCard padding="m" style={{ flex: 1 }}>
        <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: sleepTileBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Moon size={15} color={sleepIcon} />
          </View>
          <Text
            className="font-sans-semibold text-ink-soft"
            style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Last night
          </Text>
        </View>
        <Text
          className="text-espresso"
          style={{ fontFamily: 'Fraunces_500Medium', fontSize: 18, lineHeight: 22 }}
        >
          No data yet{'\n'}
          <Text style={{ color: sleepAccent }}>tuned in soon</Text>
        </Text>
        <Text className="font-sans text-ink-soft" style={{ fontSize: 11, marginTop: 8 }}>
          Sleep tracking lands post-v1.
        </Text>
      </SpringCard>
    </View>
  );
}
