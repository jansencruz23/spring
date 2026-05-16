import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpringMark } from '../../components/primitives/SpringMark';
import { signInAnonymously } from '../../lib/auth';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useTheme } from '../../lib/theme';

export default function SignIn() {
  const { palette } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onStart = async () => {
    setBusy(true);
    setError(null);
    try {
      if (isSupabaseConfigured) {
        await signInAnonymously();
      }
      router.replace('/(onboarding)/welcome');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not start a session. Try again in a moment.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-cream">
      <View className="flex-1 px-7 items-center justify-center" style={{ gap: 18 }}>
        <SpringMark size={72} color={palette.coral} secondary={palette.sageDeep} />
        <Text
          className="text-espresso text-center"
          style={{
            fontFamily: 'Fraunces_500Medium',
            fontSize: 36,
            letterSpacing: -0.6,
            lineHeight: 40,
          }}
        >
          Welcome to{' '}
          <Text style={{ fontStyle: 'italic', color: palette.coralDeep }}>Spring</Text>
        </Text>
        <Text className="font-sans text-bark text-center" style={{ fontSize: 15, lineHeight: 22 }}>
          Your warm, gentle wellness companion.
        </Text>
        {!isSupabaseConfigured ? (
          <Text className="font-sans text-stone text-center text-xs" style={{ marginTop: 4 }}>
            Demo mode — data won't be saved across launches. See M0-WIRING.md.
          </Text>
        ) : null}
        {error ? (
          <Text className="font-sans text-danger text-center text-xs">{error}</Text>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <Pressable
          onPress={busy ? undefined : onStart}
          disabled={busy}
          className={`flex-row items-center justify-center rounded-full h-14 bg-coral ${busy ? 'opacity-60' : 'active:opacity-80'}`}
          style={{ gap: 8 }}
        >
          {busy ? (
            <ActivityIndicator color={palette.cream} />
          ) : (
            <>
              <Text className="font-sans-semibold text-cream text-base">Get started</Text>
              <ArrowRight size={18} color={palette.cream} strokeWidth={2.2} />
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
