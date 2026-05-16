import { Pressable, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Send } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

/**
 * Composer matches the prototype: a pill input with mic stub + send. The mic
 * button is intentionally a stub in v1 — voice input is post-v1.
 */
export function Composer({ value, onChange, onSubmit, disabled }: Props) {
  const { mode, palette } = useTheme();
  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !disabled;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
        borderWidth: 1.5,
        borderColor: palette.coralWhisper,
        borderRadius: 26,
        paddingLeft: 18,
        paddingRight: 6,
        paddingVertical: 6,
        shadowColor: mode === 'dark' ? 'transparent' : '#8B5A3C',
        shadowOpacity: mode === 'dark' ? 0 : 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <TextInput
        testID="chat-input"
        accessibilityLabel="Message Spring"
        accessibilityHint="Type a question for Spring"
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        placeholder="Ask anything about your day…"
        placeholderTextColor={palette.stone}
        multiline
        style={{
          flex: 1,
          fontFamily: 'PlusJakartaSans_400Regular',
          fontSize: 14,
          color: palette.espresso,
          paddingVertical: 10,
          maxHeight: 96,
        }}
      />
      <Pressable
        disabled
        style={{
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.5,
        }}
        accessibilityLabel="Voice input (coming soon)"
      >
        <Mic size={18} color={palette.inkSoft} strokeWidth={1.8} />
      </Pressable>
      <Pressable
        onPress={canSend ? onSubmit : undefined}
        disabled={!canSend}
        accessibilityLabel="Send message"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          overflow: 'hidden',
          opacity: canSend ? 1 : 0.6,
        }}
      >
        {canSend ? (
          <LinearGradient
            colors={[palette.coral, palette.coralDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={17} color="#FFFFFF" strokeWidth={2.2} />
          </LinearGradient>
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: palette.sand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={17} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        )}
      </Pressable>
    </View>
  );
}
