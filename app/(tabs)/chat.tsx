import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import {
  streamChat,
  useChatMessages,
  useChatThread,
  type ChatMessage,
  type ChatThread,
  ChatStreamError,
} from '../../lib/api';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { Composer } from '../../components/chat/Composer';
import { SpringAvatar } from '../../components/chat/SpringAvatar';
import { SuggestedChips } from '../../components/chat/SuggestedChips';
import { TrendCard } from '../../components/chat/TrendCard';
import { TypingDots } from '../../components/chat/TypingDots';

type DisplayMessage = {
  id: string; // server uuid OR client-generated id while streaming
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
};

function toDisplay(m: ChatMessage): DisplayMessage {
  return {
    id: m.id,
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  };
}

export default function Chat() {
  const { mode, palette } = useTheme();
  const { session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();

  const threadQuery = useChatThread(userId);
  const threadId = threadQuery.data?.id ?? null;
  const messagesQuery = useChatMessages(threadId);

  // Local overlay for streaming. We seed from the server list, then append a
  // pending user + assistant pair while streaming so the UI updates per token
  // without round-tripping through React Query.
  const [pending, setPending] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Whenever the server message list updates (e.g. after we get the meta
  // event with a new threadId), reset the pending overlay because the server
  // now has the canonical record.
  const serverMessages = useMemo<DisplayMessage[]>(
    () => (messagesQuery.data ?? []).map(toDisplay),
    [messagesQuery.data],
  );

  const messages = useMemo<DisplayMessage[]>(
    () => [...serverMessages, ...pending],
    [serverMessages, pending],
  );

  const isEmpty = messages.length === 0;

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, scrollToEnd]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const send = useCallback(
    async (rawText?: string) => {
      const text = (rawText ?? input).trim();
      if (!text || sending || !userId) return;
      setErrorMessage(null);
      setInput('');
      setSending(true);

      const userMsg: DisplayMessage = {
        id: `local-user-${Date.now()}`,
        role: 'user',
        content: text,
      };
      const assistantId = `local-assistant-${Date.now()}`;
      setPending([userMsg, { id: assistantId, role: 'assistant', content: '', streaming: true }]);
      scrollToEnd();

      const controller = new AbortController();
      abortRef.current = controller;

      let streamedThreadId: string | null = threadId;
      let assistantText = '';

      try {
        await streamChat(
          { threadId, userMessage: text, signal: controller.signal },
          (event) => {
            if (event.kind === 'meta') {
              streamedThreadId = event.threadId;
            } else if (event.kind === 'delta') {
              assistantText += event.token;
              setPending((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantText } : m,
                ),
              );
              scrollToEnd();
            } else if (event.kind === 'error') {
              setErrorMessage(event.message);
            }
          },
        );
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // intentional cancel — leave the assistant bubble with whatever
          // tokens arrived so the user can read partials.
        } else if (err instanceof ChatStreamError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage(err instanceof Error ? err.message : String(err));
        }
      } finally {
        setSending(false);
        abortRef.current = null;
      }

      // Optimistically write to the React Query cache so clearing `pending`
      // doesn't flash an empty list while the messages query refetches.
      const finalThreadId = streamedThreadId ?? threadId;
      const nowIso = new Date().toISOString();

      if (finalThreadId) {
        if (finalThreadId !== threadId) {
          qc.setQueryData<ChatThread>(['chatThread', userId], {
            id: finalThreadId,
            user_id: userId,
            title: null,
            created_at: nowIso,
          });
        }
        qc.setQueryData<ChatMessage[]>(['chatMessages', finalThreadId], (old) => {
          const base = old ?? [];
          const next: ChatMessage[] = [
            ...base,
            {
              id: `local-${Date.now()}-user`,
              user_id: userId,
              thread_id: finalThreadId,
              role: 'user',
              content: text,
              created_at: nowIso,
            },
          ];
          if (assistantText.length > 0) {
            next.push({
              id: `local-${Date.now()}-asst`,
              user_id: userId,
              thread_id: finalThreadId,
              role: 'assistant',
              content: assistantText,
              created_at: nowIso,
            });
          }
          return next;
        });
      }

      setPending([]);

      // Background refresh to pick up canonical UUIDs/timestamps.
      if (finalThreadId !== threadId) {
        void qc.invalidateQueries({ queryKey: ['chatThread', userId] });
      }
      if (finalThreadId) {
        void qc.invalidateQueries({ queryKey: ['chatMessages', finalThreadId] });
      }
    },
    [input, sending, userId, threadId, qc, scrollToEnd],
  );

  const composerDisabled = !userId || sending;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-cream">
      <LinearGradient
        colors={[palette.coralWhisper, palette.cream]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={{ flex: 1 }}
      >
        <Header palette={palette} mode={mode} />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 4,
            paddingBottom: 8,
            flexGrow: 1,
          }}
          onContentSizeChange={scrollToEnd}
          keyboardShouldPersistTaps="handled"
        >
          {messagesQuery.isLoading && !!threadId ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator color={palette.coralDeep} />
            </View>
          ) : null}

          {isEmpty && !messagesQuery.isLoading ? (
            <StarterView />
          ) : (
            messages.map((m, i) => (
              <ChatBubble
                key={m.id}
                role={m.role}
                content={m.content}
                index={i}
              />
            ))
          )}

          {sending && !pending.some((m) => m.role === 'assistant' && m.content.length > 0) ? (
            <TypingDots />
          ) : null}

          {errorMessage ? (
            <View
              style={{
                marginTop: 4,
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
                {errorMessage}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={{
            paddingTop: 6,
            paddingBottom: Platform.OS === 'ios' ? 4 : 14,
            backgroundColor: palette.cream,
            borderTopWidth: 1,
            borderTopColor: palette.coralWhisper,
          }}
        >
          <SuggestedChips onPick={send} disabled={composerDisabled} />
          <View style={{ paddingHorizontal: 16, paddingTop: 2 }}>
            <Composer
              value={input}
              onChange={setInput}
              onSubmit={() => send()}
              disabled={composerDisabled}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header({
  palette,
  mode,
}: {
  palette: ReturnType<typeof useTheme>['palette'];
  mode: ReturnType<typeof useTheme>['mode'];
}) {
  return (
    <View
      style={{
        paddingHorizontal: 18,
        paddingTop: 6,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <SpringAvatar size={38} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'Fraunces_500Medium',
            fontSize: 19,
            color: palette.espresso,
            letterSpacing: -0.2,
          }}
        >
          Ask Spring
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: palette.sageDeep,
            }}
          />
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_500Medium',
              fontSize: 11,
              color: palette.sageDeep,
            }}
          >
            here & listening
          </Text>
        </View>
      </View>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
          borderWidth: 1,
          borderColor: palette.coralWhisper,
        }}
      />
    </View>
  );
}

function StarterView() {
  const { palette } = useTheme();
  return (
    <View style={{ paddingTop: 4 }}>
      <ChatBubble
        role="assistant"
        index={0}
        content="Welcome — I'm here whenever you want to think out loud. Ask me about your sleep, meals, or how today's feeling."
      />
      <TrendCard index={1} />
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_500Medium',
          fontSize: 11,
          color: palette.inkSoft,
          textAlign: 'center',
          marginTop: 6,
          marginBottom: 10,
        }}
      >
        Try a suggestion below or type your own.
      </Text>
    </View>
  );
}
