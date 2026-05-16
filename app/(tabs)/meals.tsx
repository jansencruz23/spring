import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBasket } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MealCard } from '../../components/meals/MealCard';
import { WeekSelector } from '../../components/meals/WeekSelector';
import { useSession } from '../../lib/auth';
import {
  useEnsureWeekSeeded,
  useMealLogs,
  useMealPlans,
  useToggleMealLog,
} from '../../lib/api/hooks';
import { isoToday } from '../../lib/util/time';
import { useTheme } from '../../lib/theme';

export default function Meals() {
  const { palette, mode } = useTheme();
  const { session } = useSession();
  const userId = session?.user.id;

  const [selectedDate, setSelectedDate] = useState<string>(isoToday());

  // Seed once per week — fire on every mount, idempotent server-side.
  useEnsureWeekSeeded(userId);

  const plans = useMealPlans(userId, selectedDate);
  const logs = useMealLogs(userId, selectedDate);
  const toggle = useToggleMealLog(userId, selectedDate);

  const summary = useMemo(() => {
    const all = plans.data ?? [];
    if (all.length === 0) return { kcal: 0, planned: 0, logged: 0 };
    const kcal = all.reduce((acc, p) => acc + p.kcal, 0);
    const logged = all.filter((p) => logs.data?.has(p.id)).length;
    return { kcal, planned: all.length, logged };
  }, [plans.data, logs.data]);

  const isLoading = plans.isLoading || logs.isLoading;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-cream">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ position: 'relative', paddingHorizontal: 22, paddingTop: 14, paddingBottom: 18 }}>
          <LinearGradient
            colors={[`${palette.sageSoft}88`, palette.cream]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View
            className="flex-row items-end justify-between"
            style={{ marginBottom: 18 }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  fontSize: 11,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  color: palette.sageDeep,
                }}
              >
                This week
              </Text>
              <Text
                style={{
                  fontFamily: 'Fraunces_500Medium',
                  fontSize: 26,
                  color: palette.espresso,
                  letterSpacing: -0.3,
                  marginTop: 2,
                  lineHeight: 30,
                }}
              >
                <Text style={{ fontStyle: 'italic' }}>Mediterranean</Text> rhythm
              </Text>
            </View>
          </View>
          <WeekSelector selectedDate={selectedDate} onSelect={setSelectedDate} />
        </View>

        {/* Day summary chips */}
        <View style={{ paddingHorizontal: 18, marginBottom: 8 }}>
          <View
            className="flex-row items-center"
            style={{ gap: 10, paddingHorizontal: 4 }}
          >
            <SummaryChip
              label="Planned"
              value={`${summary.kcal.toLocaleString()} kcal`}
              tint={palette.coral}
              palette={palette}
            />
            <SummaryChip
              label="Logged"
              value={`${summary.logged} / ${summary.planned}`}
              tint={palette.sageDeep}
              palette={palette}
            />
          </View>
        </View>

        {/* Meals */}
        <View style={{ paddingHorizontal: 18, gap: 12, marginTop: 6 }}>
          {isLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator color={palette.coralDeep} />
            </View>
          ) : (plans.data ?? []).length === 0 ? (
            <EmptyState palette={palette} />
          ) : (
            (plans.data ?? []).map((plan, i) => {
              const existing = logs.data?.get(plan.id) ?? null;
              return (
                <Animated.View
                  key={plan.id}
                  entering={FadeInDown.duration(420).delay(i * 60)}
                >
                  <MealCard
                    plan={plan}
                    logged={!!existing}
                    disabled={!userId || toggle.isPending}
                    onToggle={() => toggle.mutate({ plan, existing })}
                  />
                </Animated.View>
              );
            })
          )}

          {/* Shopping list — UI-only stub (deferred to v1.1 per plan) */}
          {(plans.data ?? []).length > 0 ? (
            <View
              style={{
                marginTop: 4,
                paddingVertical: 14,
                borderRadius: 18,
                backgroundColor: palette.sageSoft,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                opacity: 0.7,
              }}
            >
              <ShoppingBasket size={16} color={palette.sageDeep} />
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  fontSize: 13,
                  color: palette.sageDeep,
                }}
              >
                Shopping list — coming in v1.1
              </Text>
            </View>
          ) : null}

          {toggle.isError ? (
            <View
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 12,
                backgroundColor: mode === 'dark' ? '#3D2A22' : '#FBF1EA',
              }}
            >
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_500Medium',
                  fontSize: 12,
                  color: palette.danger,
                }}
              >
                Couldn't sync that change — we'll retry on the next tap.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryChip({
  label,
  value,
  tint,
  palette,
}: {
  label: string;
  value: string;
  tint: string;
  palette: { ivory: string; inkSoft: string; espresso: string };
}) {
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: palette.ivory,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tint }} />
      <View>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 10,
            color: palette.inkSoft,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 13,
            color: palette.espresso,
            marginTop: 1,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ palette }: { palette: { inkSoft: string; bark: string } }) {
  return (
    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
      <Text
        style={{
          fontFamily: 'Fraunces_400Regular',
          fontStyle: 'italic',
          fontSize: 16,
          color: palette.bark,
          textAlign: 'center',
          marginBottom: 6,
        }}
      >
        Nothing planned for this day.
      </Text>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_400Regular',
          fontSize: 13,
          color: palette.inkSoft,
          textAlign: 'center',
          paddingHorizontal: 30,
          lineHeight: 18,
        }}
      >
        Custom meal planning lands later in v1 — Spring will suggest swaps once chat is wired.
      </Text>
    </View>
  );
}
