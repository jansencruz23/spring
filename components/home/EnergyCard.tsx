import { Text, View } from 'react-native';
import { SpringCard } from '../primitives/SpringCard';
import { EnergyRing } from './EnergyRing';
import { MacroBars } from './MacroBars';
import type { Profile } from '../../lib/api';
import type { MealTotals } from '../../lib/api';
import { useTheme } from '../../lib/theme';

type Props = {
  profile: Profile | null | undefined;
  totals: MealTotals | undefined;
};

export function EnergyCard({ profile, totals }: Props) {
  const { palette } = useTheme();
  const kcalTarget = profile?.kcal_target ?? 2000;
  const kcalConsumed = totals?.kcal ?? 0;
  const kcalLeft = Math.max(0, kcalTarget - kcalConsumed);

  const proteinTarget = profile?.protein_g ?? 120;
  const carbsTarget = profile?.carbs_g ?? 230;
  const fatTarget = profile?.fat_g ?? 70;

  const proteinConsumed = totals?.protein_g ?? 0;
  // Carbs + fat are derived from the linked `meal_plans` row server-side (see
  // `getMealTotalsForDate` join). Freeform logs without a plan contribute 0,
  // which is fine — M2 only logs from planned meals.
  const carbsConsumed = totals?.carbs_g ?? 0;
  const fatConsumed = totals?.fat_g ?? 0;

  const subtitle =
    kcalConsumed === 0
      ? 'Log your first meal to start tracking.'
      : kcalLeft > 200
        ? 'Plenty of room for what comes next — you\'re tracking gently.'
        : kcalLeft > 0
          ? `${kcalLeft} kcal of headroom — finish softly.`
          : 'Target reached — anything more is bonus fuel.';

  return (
    <SpringCard padding="l">
      <View className="flex-row items-center" style={{ gap: 18 }}>
        <EnergyRing consumed={kcalConsumed} target={kcalTarget} />
        <View className="flex-1">
          <Text className="font-sans-semibold text-ink-soft" style={{ fontSize: 12 }}>
            Today's energy
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className="text-espresso"
              style={{
                fontFamily: 'Fraunces_500Medium',
                fontSize: 28,
                lineHeight: 32,
              }}
            >
              {kcalLeft.toLocaleString()}
            </Text>
            <Text className="font-sans-medium text-ink-soft" style={{ fontSize: 13, marginLeft: 6 }}>
              left
            </Text>
          </View>
          <Text
            className="font-sans text-bark"
            style={{ fontSize: 12, lineHeight: 18, marginTop: 8, color: palette.bark }}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 16 }}>
        <MacroBars
          protein={{ value: proteinConsumed, target: proteinTarget }}
          carbs={{ value: carbsConsumed, target: carbsTarget }}
          fat={{ value: fatConsumed, target: fatTarget }}
        />
      </View>
    </SpringCard>
  );
}
