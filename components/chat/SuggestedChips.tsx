import { Pressable, ScrollView, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';

export const SUGGESTED_PROMPTS = [
  'How am I tracking this week?',
  'Suggest dinner under 600 cal',
  'Why am I tired today?',
  'Did I drink enough water on run days?',
];

type Props = {
  onPick: (prompt: string) => void;
  disabled?: boolean;
};

export function SuggestedChips({ onPick, disabled }: Props) {
  const { mode, palette } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 8,
        gap: 8,
      }}
    >
      {SUGGESTED_PROMPTS.map((p) => (
        <Pressable
          key={p}
          onPress={disabled ? undefined : () => onPick(p)}
          disabled={disabled}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            height: 32,
            paddingHorizontal: 14,
            borderRadius: 16,
            backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
            borderWidth: 1,
            borderColor: palette.coralWhisper,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Sparkles size={11} color={palette.coralDeep} strokeWidth={2.2} />
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_500Medium',
              fontSize: 12,
              color: palette.bark,
            }}
          >
            {p}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
