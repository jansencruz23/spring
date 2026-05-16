import { memo } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';
import { SpringAvatar } from './SpringAvatar';

type Props = {
  role: 'user' | 'assistant';
  content: string;
  index?: number;
};

function ChatBubbleImpl({ role, content, index = 0 }: Props) {
  const { mode, palette } = useTheme();
  const delay = Math.min(index, 6) * 50;

  if (role === 'user') {
    return (
      <Animated.View
        entering={FadeInDown.duration(360).delay(delay)}
        style={{
          alignSelf: 'flex-end',
          maxWidth: '80%',
          marginBottom: 14,
          borderRadius: 20,
          borderBottomRightRadius: 6,
          overflow: 'hidden',
          shadowColor: palette.coralDeep,
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <LinearGradient
          colors={[palette.coral, palette.coralDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingVertical: 12, paddingHorizontal: 16 }}
        >
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_500Medium',
              fontSize: 14,
              lineHeight: 20,
              color: '#FFFFFF',
            }}
          >
            {content}
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(360).delay(delay)}
      style={{
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-end',
        marginBottom: 14,
      }}
    >
      <SpringAvatar />
      <View
        style={{
          maxWidth: '80%',
          backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
          borderRadius: 20,
          borderBottomLeftRadius: 6,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: palette.coralWhisper,
        }}
      >
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_400Regular',
            fontSize: 14,
            lineHeight: 21,
            color: palette.bark,
          }}
        >
          {content || ' '}
        </Text>
      </View>
    </Animated.View>
  );
}

// Memoize so the streaming token loop in chat.tsx — which rebuilds the
// `pending` array on every delta — only re-renders the one bubble whose
// `content` actually changed, not every bubble in the thread.
export const ChatBubble = memo(ChatBubbleImpl);
