import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SpringCard } from '../primitives/SpringCard';
import { useTheme } from '../../lib/theme';
import type { SpringPalette } from '../../lib/theme/palette';
import type { MealPlan } from '../../lib/api';
import { formatHourLabel } from '../../lib/util/time';

type Props = {
  plan: MealPlan;
  logged: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

type SlotStyle = { label: string; hue: string; hueDeep: string; hueSoft: string };

function slotStyle(slot: MealPlan['slot'], palette: SpringPalette): SlotStyle {
  switch (slot) {
    case 'breakfast':
      return { label: 'Breakfast', hue: palette.butter, hueDeep: palette.butterDeep, hueSoft: palette.butterSoft };
    case 'lunch':
      return { label: 'Lunch', hue: palette.sage, hueDeep: palette.sageDeep, hueSoft: palette.sageSoft };
    case 'snack':
      return { label: 'Snack', hue: palette.coral, hueDeep: palette.coralDeep, hueSoft: palette.coralSoft };
    case 'dinner':
      return { label: 'Dinner', hue: palette.coral, hueDeep: palette.coralDeep, hueSoft: palette.coralSoft };
  }
}

/**
 * Time label split across two lines: "7:30" + "am". Falls back to the slot
 * label when `scheduled_time` is null (defensive — seeded data always has one).
 */
function splitTimeLabel(scheduled: string | null): { value: string; period: string } {
  if (!scheduled) return { value: '—', period: '' };
  const hhmm = scheduled.slice(0, 5); // 'HH:MM' (trims any seconds)
  const full = formatHourLabel(hhmm); // e.g. '7:30 am'
  const [value, period] = full.split(' ');
  return { value: value ?? hhmm, period: period ?? '' };
}

export function MealCard({ plan, logged, disabled, onToggle }: Props) {
  const { palette } = useTheme();
  const s = slotStyle(plan.slot, palette);
  const time = splitTimeLabel(plan.scheduled_time);

  return (
    <SpringCard padding="s" style={{ padding: 0, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row' }}>
        {/* Left rail — slot + time */}
        <View style={{ width: 90 }}>
          <LinearGradient
            colors={[s.hueSoft, `${s.hue}33`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              paddingHorizontal: 8,
            }}
          >
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 10,
                color: s.hueDeep,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {s.label}
            </Text>
            <Text
              style={{
                fontFamily: 'Fraunces_500Medium',
                fontSize: 16,
                color: palette.espresso,
                marginTop: 2,
              }}
            >
              {time.value}
            </Text>
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_400Regular',
                fontSize: 9,
                color: palette.inkSoft,
              }}
            >
              {time.period}
            </Text>
          </LinearGradient>
        </View>

        {/* Body — name, macros, tags, log toggle */}
        <View style={{ flex: 1, padding: 14 }}>
          <Text
            style={{
              fontFamily: 'Fraunces_500Medium',
              fontSize: 16,
              color: palette.espresso,
              lineHeight: 20,
              letterSpacing: -0.2,
              textDecorationLine: logged ? 'line-through' : 'none',
              textDecorationColor: palette.stone,
            }}
            numberOfLines={2}
          >
            {plan.food_name}
          </Text>

          <View className="flex-row" style={{ gap: 14, marginTop: 6 }}>
            <Macro value={`${plan.kcal}`} unit="kcal" palette={palette} />
            <Macro value={`${plan.protein_g}g`} unit="protein" palette={palette} />
          </View>

          <View
            className="flex-row items-center"
            style={{ marginTop: 8, gap: 6, justifyContent: 'space-between' }}
          >
            <View className="flex-row" style={{ gap: 5, flex: 1, flexWrap: 'wrap' }}>
              {plan.tags.slice(0, 3).map((tag) => (
                <View
                  key={tag}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    backgroundColor: s.hueSoft,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      fontSize: 10,
                      color: s.hueDeep,
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>

            <LogToggle
              logged={logged}
              disabled={disabled}
              onPress={onToggle}
              palette={palette}
            />
          </View>
        </View>
      </View>
    </SpringCard>
  );
}

function Macro({ value, unit, palette }: { value: string; unit: string; palette: SpringPalette }) {
  return (
    <View className="flex-row items-baseline">
      <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: palette.bark }}>
        {value}
      </Text>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_500Medium',
          fontSize: 12,
          color: palette.inkSoft,
          marginLeft: 4,
        }}
      >
        {unit}
      </Text>
    </View>
  );
}

function LogToggle({
  logged,
  onPress,
  disabled,
  palette,
}: {
  logged: boolean;
  onPress: () => void;
  disabled?: boolean;
  palette: SpringPalette;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (logged) {
      scale.value = withSequence(
        withTiming(0.6, { duration: 90 }),
        withTiming(1.08, { duration: 180 }),
        withTiming(1, { duration: 120 }),
      );
    }
  }, [logged, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPress={disabled ? undefined : onPress} hitSlop={8}>
      <Animated.View
        style={[
          {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: logged ? palette.sageDeep : 'transparent',
            borderColor: logged ? palette.sageDeep : palette.sand,
            borderWidth: 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : 1,
          },
          animatedStyle,
        ]}
      >
        {logged ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
      </Animated.View>
    </Pressable>
  );
}
