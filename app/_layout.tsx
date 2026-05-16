import '../global.css';

import {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  useFonts as useFraunces,
} from '@expo-google-fonts/fraunces';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts as useJakarta,
} from '@expo-google-fonts/plus-jakarta-sans';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../lib/theme';
import { queryClient, queryPersister } from '../lib/query';
import { isSupabaseConfigured } from '../lib/supabase';
import { useSession } from '../lib/auth';
import { readOnboardedFlag, useProfile } from '../lib/api';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden in dev fast refresh — non-fatal.
});

function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading: sessionLoading } = useSession();
  const profileQuery = useProfile(session?.user.id);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (sessionLoading) return;

    const seg = segments[0];

    // No session — user must choose sign-in / sign-up / guest before
    // continuing. Anonymous sessions are now opt-in via the sign-in screen
    // rather than auto-created at boot.
    if (!session) {
      if (seg !== '(auth)') {
        router.replace('/(auth)/sign-in');
      }
      return;
    }

    if (profileQuery.isLoading) return;

    const hasProfile = !!profileQuery.data && profileQuery.data.name.length > 0;
    const onboarded = hasProfile || readOnboardedFlag();

    if (!onboarded && seg !== '(onboarding)') {
      router.replace('/(onboarding)/welcome');
    } else if (onboarded && (seg === '(auth)' || seg === '(onboarding)')) {
      router.replace('/(tabs)');
    }
  }, [
    sessionLoading,
    session,
    profileQuery.isLoading,
    profileQuery.data,
    segments,
    router,
  ]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fraunces] = useFraunces({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
  });

  const [jakarta] = useJakarta({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const fontsReady = fraunces && jakarta;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister, maxAge: 1000 * 60 * 60 * 24 * 7 }}
        >
          <ThemeProvider>
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </AuthGate>
          </ThemeProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
