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
import { useEffect, useState, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../lib/theme';
import { queryClient, queryPersister } from '../lib/query';
import { isSupabaseConfigured } from '../lib/supabase';
import { signInAnonymously, useSession } from '../lib/auth';
import { readOnboardedFlag, useProfile } from '../lib/api';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden in dev fast refresh — non-fatal.
});

function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading: sessionLoading } = useSession();
  const profileQuery = useProfile(session?.user.id);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (sessionLoading) return;

    if (!session) {
      if (signingIn) return;
      setSigningIn(true);
      signInAnonymously()
        .catch(() => {
          // Leave session null — gate will idle. The /(auth)/sign-in screen
          // gives the user a retry path.
        })
        .finally(() => setSigningIn(false));
      return;
    }

    if (profileQuery.isLoading) return;

    const hasProfile = !!profileQuery.data && profileQuery.data.name.length > 0;
    const onboarded = hasProfile || readOnboardedFlag();
    const seg = segments[0];

    if (!onboarded && seg !== '(onboarding)') {
      router.replace('/(onboarding)/welcome');
    } else if (onboarded && (seg === '(auth)' || seg === '(onboarding)')) {
      router.replace('/(tabs)');
    }
  }, [
    sessionLoading,
    session,
    signingIn,
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
