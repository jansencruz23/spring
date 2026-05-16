import { Pressable, Text, View } from 'react-native';
import { Droplet, Plus } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { SpringCard } from '../primitives/SpringCard';
import { useHydration, useSetHydration } from '../../lib/api/hooks';

const GOAL_CUPS = 8;
const ML_PER_CUP = 250;
// Allow logging a couple over goal — the prototype caps at goal+2.
const MAX_CUPS = GOAL_CUPS + 2;

type Props = {
  userId: string | undefined;
};

export function HydrationTracker({ userId }: Props) {
  const { palette } = useTheme();
  const hydration = useHydration(userId);
  const setHydration = useSetHydration(userId);
  const cups = Math.min(MAX_CUPS, hydration.data?.cups ?? 0);

  const increment = () => {
    if (!userId) return;
    setHydration.mutate(Math.min(MAX_CUPS, cups + 1));
  };

  return (
    <SpringCard
      padding="l"
      accessibilityLabel={`Hydration. ${cups} of ${GOAL_CUPS} cups logged today.`}
    >
      <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: palette.butterSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Droplet size={16} color={palette.butterDeep} />
          </View>
          <View>
            <Text className="font-sans-semibold text-espresso text-base">Hydration</Text>
            <Text className="font-sans text-ink-soft text-xs">
              {cups * ML_PER_CUP}ml of {GOAL_CUPS * ML_PER_CUP}ml
            </Text>
          </View>
        </View>
        <Pressable
          testID="hydration-plus"
          accessibilityRole="button"
          accessibilityLabel="Log one cup of water"
          accessibilityState={{ disabled: !userId || cups >= MAX_CUPS }}
          accessibilityHint={cups >= MAX_CUPS ? 'Daily goal reached' : undefined}
          onPress={increment}
          disabled={!userId || cups >= MAX_CUPS}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: palette.coralDeep,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !userId || cups >= MAX_CUPS ? 0.4 : 1,
            shadowColor: palette.coralDeep,
            shadowOpacity: 0.35,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>
      <View className="flex-row" style={{ gap: 5 }}>
        {Array.from({ length: GOAL_CUPS }).map((_, i) => {
          const filled = i < cups;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: 30,
                borderRadius: 6,
                backgroundColor: filled ? palette.butter : palette.cream,
                borderColor: filled ? 'transparent' : palette.sand,
                borderWidth: 1,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {filled ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: palette.butterDeep,
                    opacity: 0.45,
                  }}
                />
              ) : null}
              {filled ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: '50%',
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(255,255,255,0.55)',
                    transform: [{ translateX: -2.5 }],
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </SpringCard>
  );
}
