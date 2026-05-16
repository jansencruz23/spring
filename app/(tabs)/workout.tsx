import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Dumbbell, Pause, Play } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SpringCard } from '../../components/primitives/SpringCard';
import { RestTimer } from '../../components/workout/RestTimer';
import { SetRow } from '../../components/workout/SetRow';
import { useSession } from '../../lib/auth';
import {
  useActiveWorkoutSession,
  useEndWorkoutSession,
  useLogWorkoutSet,
  useStartWorkoutSession,
  useWorkoutSets,
} from '../../lib/api/hooks';
import { DEFAULT_ROUTINE, TOTAL_TARGET_SETS } from '../../lib/workouts/routine';
import { useTheme } from '../../lib/theme';
import type { SpringPalette } from '../../lib/theme/palette';

function formatElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Workout() {
  const { palette, mode } = useTheme();
  const { session } = useSession();
  const userId = session?.user.id;

  const activeSession = useActiveWorkoutSession(userId);
  const sessionId = activeSession.data?.id;
  const setsQuery = useWorkoutSets(userId, sessionId);
  const startMut = useStartWorkoutSession(userId);
  const endMut = useEndWorkoutSession(userId);
  const logSetMut = useLogWorkoutSet(userId, sessionId);

  const [elapsedSec, setElapsedSec] = useState(0);
  const [paused, setPaused] = useState(false);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);

  const completedByExercise = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of setsQuery.data ?? []) {
      map.set(s.exercise, (map.get(s.exercise) ?? 0) + 1);
    }
    return map;
  }, [setsQuery.data]);

  const totalCompleted = (setsQuery.data ?? []).length;
  const allDone = totalCompleted >= TOTAL_TARGET_SETS && sessionId != null;

  // First exercise where completed < target is "current"; everything before
  // is done, everything after is upcoming. Undefined when all are done.
  const currentExerciseIdx = useMemo(() => {
    for (let i = 0; i < DEFAULT_ROUTINE.exercises.length; i++) {
      const ex = DEFAULT_ROUTINE.exercises[i]!;
      const done = completedByExercise.get(ex.id) ?? 0;
      if (done < ex.targetSets) return i;
    }
    return -1;
  }, [completedByExercise]);

  const currentExercise =
    currentExerciseIdx >= 0 ? DEFAULT_ROUTINE.exercises[currentExerciseIdx] : null;
  const currentDone = currentExercise
    ? (completedByExercise.get(currentExercise.id) ?? 0)
    : 0;

  useEffect(() => {
    if (!activeSession.data || activeSession.data.ended_at) {
      setElapsedSec(0);
      return;
    }
    if (paused) return;
    const startedMs = new Date(activeSession.data.started_at).getTime();
    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - startedMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeSession.data, paused]);

  // Auto-clear restEndsAt when the timer hits zero — the JS timeout fires
  // exactly when the rest is over so the card transitions to "Ready" cleanly.
  useEffect(() => {
    if (restEndsAt == null) return;
    const ms = restEndsAt - Date.now();
    if (ms <= 0) {
      setRestEndsAt(null);
      return;
    }
    const t = setTimeout(() => setRestEndsAt(null), ms);
    return () => clearTimeout(t);
  }, [restEndsAt]);

  const handleStart = () => {
    if (!userId) return;
    setElapsedSec(0);
    setPaused(false);
    setRestEndsAt(null);
    startMut.mutate(DEFAULT_ROUTINE.name);
  };

  const handleLogSet = () => {
    if (!currentExercise || paused) return;
    logSetMut.mutate({
      exercise: currentExercise.id,
      reps: currentExercise.targetReps,
      weightKg: currentExercise.targetWeightKg ?? 0,
    });
    setRestEndsAt(Date.now() + DEFAULT_ROUTINE.restSeconds * 1000);
  };

  const handleEnd = () => {
    if (!sessionId) return;
    endMut.mutate(sessionId);
    setRestEndsAt(null);
    setPaused(false);
  };

  const restMessage = currentExercise
    ? `Set ${Math.min(currentDone + 1, currentExercise.targetSets)} of ${currentExercise.name.toLowerCase()} next.`
    : 'Nice work — session complete.';

  const isAuthLoading = activeSession.isLoading && !!userId;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-cream">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <Header
          palette={palette}
          mode={mode}
          elapsedSec={elapsedSec}
          isLive={!!activeSession.data && !paused}
          paused={paused}
        />

        {isAuthLoading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator color={palette.coralDeep} />
          </View>
        ) : activeSession.data ? (
          <ActiveLayout
            palette={palette}
            allDone={allDone}
            restEndsAt={restEndsAt}
            restMessage={restMessage}
            onAddRestTime={() =>
              setRestEndsAt((prev) =>
                prev == null ? null : prev + 15_000,
              )
            }
            onSkipRest={() => setRestEndsAt(null)}
            completedByExercise={completedByExercise}
            currentExerciseIdx={currentExerciseIdx}
            totalCompleted={totalCompleted}
            paused={paused}
            onTogglePause={() => setPaused((p) => !p)}
            onLogSet={handleLogSet}
            onEnd={handleEnd}
            logBusy={logSetMut.isPending}
            endBusy={endMut.isPending}
          />
        ) : (
          <IdleLayout
            palette={palette}
            onStart={handleStart}
            starting={startMut.isPending}
            disabled={!userId}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────

function Header({
  palette,
  mode,
  elapsedSec,
  isLive,
  paused,
}: {
  palette: SpringPalette;
  mode: 'light' | 'dark';
  elapsedSec: number;
  isLive: boolean;
  paused: boolean;
}) {
  return (
    <View style={{ position: 'relative', paddingHorizontal: 22, paddingTop: 14, paddingBottom: 22 }}>
      <LinearGradient
        colors={[`${palette.coralWhisper}`, palette.cream]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="flex-row items-center justify-between" style={{ marginBottom: 18 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: palette.coralWhisper,
          }}
        >
          <Dumbbell size={16} color={palette.bark} strokeWidth={1.8} />
        </View>
        {isLive ? (
          <View
            className="flex-row items-center"
            style={{
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: palette.sageSoft,
            }}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: palette.sageDeep,
              }}
            />
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 11,
                color: palette.sageDeep,
                letterSpacing: 0.3,
              }}
            >
              Live · {formatElapsed(elapsedSec)}
            </Text>
          </View>
        ) : paused ? (
          <View
            className="flex-row items-center"
            style={{
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: palette.butterSoft,
            }}
          >
            <Pause size={11} color={palette.butterDeep} strokeWidth={2.4} />
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 11,
                color: palette.butterDeep,
                letterSpacing: 0.3,
              }}
            >
              Paused · {formatElapsed(elapsedSec)}
            </Text>
          </View>
        ) : (
          <View style={{ width: 36, height: 36 }} />
        )}
        <View style={{ width: 36 }} />
      </View>

      <Text
        style={{
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize: 11,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: palette.coralDeep,
          marginBottom: 4,
        }}
      >
        {DEFAULT_ROUTINE.eyebrow}
      </Text>
      <Text
        style={{
          fontFamily: 'Fraunces_500Medium',
          fontSize: 26,
          color: palette.espresso,
          letterSpacing: -0.3,
          lineHeight: 30,
        }}
      >
        <Text style={{ fontStyle: 'italic' }}>{DEFAULT_ROUTINE.titleEmphasis}</Text>
        {'\n'}
        {DEFAULT_ROUTINE.titleRest}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Idle (no active session)
// ─────────────────────────────────────────────────────────────────────

function IdleLayout({
  palette,
  onStart,
  starting,
  disabled,
}: {
  palette: SpringPalette;
  onStart: () => void;
  starting: boolean;
  disabled: boolean;
}) {
  return (
    <View style={{ paddingHorizontal: 18 }}>
      <SpringCard padding="m">
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 11,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: palette.inkSoft,
            marginBottom: 6,
          }}
        >
          Today's routine
        </Text>
        <Text
          style={{
            fontFamily: 'Fraunces_500Medium',
            fontSize: 18,
            color: palette.espresso,
            lineHeight: 22,
          }}
        >
          {DEFAULT_ROUTINE.exercises.length} exercises · ~{Math.round(
            DEFAULT_ROUTINE.exercises.length * 7,
          )} min
        </Text>

        <View style={{ marginTop: 14, gap: 8 }}>
          {DEFAULT_ROUTINE.exercises.map((ex) => (
            <View
              key={ex.id}
              className="flex-row items-center justify-between"
              style={{ paddingVertical: 6 }}
            >
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  fontSize: 14,
                  color: palette.espresso,
                }}
              >
                {ex.name}
              </Text>
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_500Medium',
                  fontSize: 12,
                  color: palette.inkSoft,
                }}
              >
                {ex.targetSets} × {ex.targetReps} · {ex.detail}
              </Text>
            </View>
          ))}
        </View>
      </SpringCard>

      <View style={{ marginTop: 18 }}>
        <Pressable
          onPress={disabled ? undefined : onStart}
          disabled={disabled || starting}
          style={{
            borderRadius: 28,
            overflow: 'hidden',
            opacity: disabled ? 0.5 : 1,
            shadowColor: palette.coralDeep,
            shadowOpacity: 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={[palette.coral, palette.coralDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 56,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {starting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Play size={16} color="#FFFFFF" strokeWidth={2.4} fill="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_700Bold',
                    fontSize: 16,
                    color: '#FFFFFF',
                    letterSpacing: 0.1,
                  }}
                >
                  Start session
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>

      <Text
        style={{
          fontFamily: 'PlusJakartaSans_400Regular',
          fontSize: 12,
          color: palette.inkSoft,
          textAlign: 'center',
          marginTop: 12,
          paddingHorizontal: 20,
          lineHeight: 17,
        }}
      >
        Custom routines arrive in v1.1 — for now Spring guides you through this lower-body session.
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Active (session in progress)
// ─────────────────────────────────────────────────────────────────────

function ActiveLayout({
  palette,
  allDone,
  restEndsAt,
  restMessage,
  onAddRestTime,
  onSkipRest,
  completedByExercise,
  currentExerciseIdx,
  totalCompleted,
  paused,
  onTogglePause,
  onLogSet,
  onEnd,
  logBusy,
  endBusy,
}: {
  palette: SpringPalette;
  allDone: boolean;
  restEndsAt: number | null;
  restMessage: string;
  onAddRestTime: () => void;
  onSkipRest: () => void;
  completedByExercise: Map<string, number>;
  currentExerciseIdx: number;
  totalCompleted: number;
  paused: boolean;
  onTogglePause: () => void;
  onLogSet: () => void;
  onEnd: () => void;
  logBusy: boolean;
  endBusy: boolean;
}) {
  return (
    <View style={{ paddingHorizontal: 18, gap: 18 }}>
      <RestTimer
        endsAt={paused ? null : restEndsAt}
        totalMs={DEFAULT_ROUTINE.restSeconds * 1000}
        onAddTime={onAddRestTime}
        onSkip={onSkipRest}
        message={paused ? 'Session paused — resume to log the next set.' : restMessage}
      />

      <View>
        <View
          className="flex-row items-end justify-between"
          style={{ marginBottom: 12, paddingHorizontal: 4 }}
        >
          <Text
            style={{
              fontFamily: 'Fraunces_500Medium',
              fontSize: 22,
              color: palette.espresso,
              letterSpacing: -0.3,
            }}
          >
            Today's set
          </Text>
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_600SemiBold',
              fontSize: 12,
              color: palette.inkSoft,
            }}
          >
            {totalCompleted} / {TOTAL_TARGET_SETS} done
          </Text>
        </View>

        <SpringCard padding="s" style={{ padding: 6 }}>
          {DEFAULT_ROUTINE.exercises.map((ex, i) => {
            const done = completedByExercise.get(ex.id) ?? 0;
            const state: 'done' | 'current' | 'upcoming' =
              i < currentExerciseIdx || done >= ex.targetSets
                ? 'done'
                : i === currentExerciseIdx
                  ? 'current'
                  : 'upcoming';
            return (
              <Animated.View key={ex.id} entering={FadeInDown.duration(360).delay(i * 50)}>
                <SetRow
                  exercise={ex}
                  index={i + 1}
                  completedSets={done}
                  state={state}
                  isLast={i === DEFAULT_ROUTINE.exercises.length - 1}
                />
              </Animated.View>
            );
          })}
        </SpringCard>
      </View>

      {allDone ? (
        <Pressable
          onPress={endBusy ? undefined : onEnd}
          disabled={endBusy}
          style={{
            height: 56,
            borderRadius: 28,
            overflow: 'hidden',
            opacity: endBusy ? 0.6 : 1,
            shadowColor: palette.sageDeep,
            shadowOpacity: 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={[palette.sage, palette.sageDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {endBusy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                End session
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      ) : (
        <View className="flex-row" style={{ gap: 10 }}>
          <Pressable
            onPress={onTogglePause}
            style={{
              flex: 1,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: palette.sand,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
            }}
          >
            {paused ? (
              <Play size={15} color={palette.bark} strokeWidth={2.2} fill={palette.bark} />
            ) : (
              <Pause size={15} color={palette.bark} strokeWidth={2.2} />
            )}
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 15,
                color: palette.bark,
              }}
            >
              {paused ? 'Resume' : 'Pause'}
            </Text>
          </Pressable>
          <Pressable
            onPress={paused || logBusy ? undefined : onLogSet}
            disabled={paused || logBusy}
            style={{
              flex: 1.4,
              height: 56,
              borderRadius: 28,
              overflow: 'hidden',
              opacity: paused ? 0.5 : 1,
              shadowColor: palette.coralDeep,
              shadowOpacity: 0.35,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={[palette.coral, palette.coralDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {logBusy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_700Bold',
                      fontSize: 15,
                      color: '#FFFFFF',
                    }}
                  >
                    Log set
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.2} />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {allDone ? null : (
        <Pressable
          onPress={endBusy ? undefined : onEnd}
          disabled={endBusy}
          style={{ alignSelf: 'center', paddingVertical: 6 }}
        >
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_600SemiBold',
              fontSize: 12,
              color: palette.inkSoft,
              letterSpacing: 0.3,
            }}
          >
            End session early
          </Text>
        </Pressable>
      )}
    </View>
  );
}
