import { Pressable, Text, View } from 'react-native';
import { Check, Pill } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '../../lib/theme';
import { SpringCard } from '../primitives/SpringCard';
import { SUPPLEMENTS_V1, type Supplement } from '../../lib/api';
import { useSupplements, useToggleSupplement } from '../../lib/api/hooks';

type Props = {
  userId: string | undefined;
};

export function SupplementList({ userId }: Props) {
  const { mode, palette } = useTheme();
  const supplements = useSupplements(userId);
  const toggle = useToggleSupplement(userId);

  const takenMap = new Map<string, boolean>();
  for (const row of supplements.data ?? []) {
    takenMap.set(row.name, row.taken);
  }

  return (
    <SpringCard padding="s">
      {SUPPLEMENTS_V1.map((s, i) => {
        const taken = takenMap.get(s.id) ?? false;
        const isLast = i === SUPPLEMENTS_V1.length - 1;
        return (
          <View
            key={s.id}
            className="flex-row items-center"
            style={{
              paddingVertical: 12,
              paddingHorizontal: 12,
              gap: 12,
              borderBottomWidth: isLast ? 0 : 1,
              borderBottomColor: palette.coralWhisper,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: tintBg(s.tint, palette, mode),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pill size={16} color={tintFg(s.tint, palette, mode)} />
            </View>
            <View className="flex-1">
              <Text
                className="text-espresso font-sans-semibold"
                style={{
                  fontSize: 14,
                  textDecorationLine: taken ? 'line-through' : 'none',
                  textDecorationColor: palette.stone,
                }}
              >
                {s.name}
              </Text>
              <Text className="text-ink-soft font-sans" style={{ fontSize: 11, marginTop: 1 }}>
                {s.sub}
              </Text>
            </View>
            <ToggleCheck
              taken={taken}
              disabled={!userId}
              accessibilityLabel={`${s.name}, ${taken ? 'taken' : 'not taken'}`}
              testID={`supplement-toggle-${s.id}`}
              onPress={() => userId && toggle.mutate({ name: s.id, taken: !taken })}
            />
          </View>
        );
      })}
    </SpringCard>
  );
}

function ToggleCheck({
  taken,
  onPress,
  disabled,
  accessibilityLabel,
  testID,
}: {
  taken: boolean;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const { palette } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (taken) {
      scale.value = withSequence(
        withTiming(0.6, { duration: 90 }),
        withTiming(1.08, { duration: 180 }),
        withTiming(1, { duration: 120 }),
      );
    }
  }, [taken, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={8}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: taken, disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={[
          {
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: taken ? palette.sageDeep : 'transparent',
            borderColor: taken ? palette.sageDeep : palette.sand,
            borderWidth: 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : 1,
          },
          animatedStyle,
        ]}
      >
        {taken ? <Check size={13} color="#FFFFFF" strokeWidth={3} /> : null}
      </Animated.View>
    </Pressable>
  );
}

function tintBg(
  tint: Supplement['tint'],
  palette: { butterSoft: string; coralSoft: string; sageSoft: string },
  mode: 'light' | 'dark',
): string {
  switch (tint) {
    case 'butter': return palette.butterSoft;
    case 'coral':  return palette.coralSoft;
    case 'sage':   return palette.sageSoft;
    case 'plum':   return mode === 'dark' ? '#3D3759' : '#E5DDF0';
  }
}

function tintFg(
  tint: Supplement['tint'],
  palette: { butterDeep: string; coralDeep: string; sageDeep: string },
  mode: 'light' | 'dark',
): string {
  switch (tint) {
    case 'butter': return palette.butterDeep;
    case 'coral':  return palette.coralDeep;
    case 'sage':   return palette.sageDeep;
    case 'plum':   return mode === 'dark' ? '#C8B8E0' : '#7A6FA0';
  }
}
