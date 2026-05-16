import { Text, View } from 'react-native';
import { ChevronRight, Dumbbell, Moon } from 'lucide-react-native';
import { SpringCard } from '../primitives/SpringCard';
import { useTheme } from '../../lib/theme';

/**
 * Two side-by-side cards: "Today's workout" + "Last night's sleep".
 * M1 shows empty/placeholder copy — both data sources land in later milestones
 * (workouts in M3, sleep is post-v1 per the plan).
 */
export function PlannedCards() {
  const { palette } = useTheme();
  return (
    <View className="flex-row" style={{ gap: 12 }}>
      <SpringCard padding="m" style={{ flex: 1 }}>
        <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: palette.sageSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Dumbbell size={15} color={palette.sageDeep} />
          </View>
          <Text
            className="font-sans-semibold text-ink-soft"
            style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Today
          </Text>
        </View>
        <Text
          className="text-espresso"
          style={{ fontFamily: 'Fraunces_500Medium', fontSize: 18, lineHeight: 22 }}
        >
          Plan a session{'\n'}
          <Text style={{ color: palette.sageDeep }}>in Train</Text>
        </Text>
        <Text className="font-sans text-ink-soft" style={{ fontSize: 11, marginTop: 8 }}>
          Workouts arrive next milestone.
        </Text>
        <View
          className="flex-row items-center justify-end"
          style={{ marginTop: 12 }}
        >
          <ChevronRight size={16} color={palette.stone} />
        </View>
      </SpringCard>

      <SpringCard padding="m" style={{ flex: 1 }}>
        <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#3D3759',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Moon size={15} color="#E0DBF5" />
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
          <Text style={{ color: '#7A6FA0' }}>tuned in soon</Text>
        </Text>
        <Text className="font-sans text-ink-soft" style={{ fontSize: 11, marginTop: 8 }}>
          Sleep tracking lands post-v1.
        </Text>
      </SpringCard>
    </View>
  );
}
