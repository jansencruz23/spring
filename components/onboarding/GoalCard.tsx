import { Pressable, View, Text } from 'react-native';
import { Bolt, Check, Leaf, Flame, Moon, UtensilsCrossed } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { useTheme } from '../../lib/theme';
import type { SpringGoal } from '../../lib/schemas/profile';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

export const GOAL_OPTIONS: { id: SpringGoal; label: string; sub: string; Icon: ComponentType<IconProps> }[] = [
  { id: 'feel_good',      label: 'Just feel good',  sub: 'Build steadier habits',         Icon: Leaf },
  { id: 'lose_weight',    label: 'Lose a little',   sub: 'Sustainable, not severe',       Icon: Flame },
  { id: 'build_strength', label: 'Build strength',  sub: 'Train smarter, recover better', Icon: Bolt },
  { id: 'eat_better',     label: 'Eat better',      sub: 'More plants, less guesswork',   Icon: UtensilsCrossed },
  { id: 'sleep_deeper',   label: 'Sleep deeper',    sub: 'A calmer wind-down',            Icon: Moon },
];

type Props = {
  goal: SpringGoal;
  label: string;
  sub: string;
  Icon: ComponentType<IconProps>;
  selected: boolean;
  onPress: () => void;
};

export function GoalCard({ goal, label, sub, Icon, selected, onPress }: Props) {
  const { palette, mode } = useTheme();
  const bg = selected
    ? palette.coralSoft
    : mode === 'dark'
      ? palette.ivory
      : '#FFFFFF';
  const borderColor = selected
    ? palette.coralDeep
    : mode === 'dark'
      ? palette.sand
      : palette.coralWhisper;

  return (
    <Pressable
      testID={`goal-${goal}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}. ${sub}`}
      onPress={onPress}
      className="flex-row items-center rounded-card active:opacity-90"
      style={{
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: bg,
        borderColor,
        borderWidth: 1.5,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: selected ? palette.coral : palette.coralWhisper,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={18} color={selected ? '#FFFFFF' : palette.coralDeep} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-espresso text-base">{label}</Text>
        <Text className="font-sans text-ink-soft text-xs" style={{ marginTop: 1 }}>
          {sub}
        </Text>
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: selected ? palette.coralDeep : 'transparent',
          borderColor: selected ? palette.coralDeep : palette.sand,
          borderWidth: 1.5,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? <Check size={13} color="#FFFFFF" strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}
