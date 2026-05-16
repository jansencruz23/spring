import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field } from '../../components/primitives/Field';
import { SpringMark } from '../../components/primitives/SpringMark';
import { signUpWithEmail } from '../../lib/auth';
import { SignUpSchema } from '../../lib/schemas/auth';
import { useTheme } from '../../lib/theme';
import { formatAuthError } from './_error';

export default function SignUp() {
  const { palette } = useTheme();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (busy) return;
    setSubmitError(null);
    setFieldErrors({});

    const parsed = SignUpSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      const errs: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0];
        if (k === 'email' || k === 'password') errs[k] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setBusy(true);
    try {
      const session = await signUpWithEmail(parsed.data.email, parsed.data.password);
      if (session) {
        // Email confirmation disabled in supabase config — user is signed in.
        // AuthGate forwards them to onboarding.
        router.replace('/(onboarding)/welcome');
      } else {
        // Email confirmation enabled — Supabase returned no session. Bounce
        // back to sign-in with a notice.
        router.replace({
          pathname: '/(auth)/sign-in',
          params: { notice: 'Check your inbox to confirm your email, then sign in.' },
        });
      }
    } catch (e) {
      setSubmitError(formatAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-cream">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row" style={{ paddingTop: 8 }}>
            <Pressable onPress={() => router.back()} hitSlop={12} className="active:opacity-60">
              <ArrowLeft size={22} color={palette.bark} />
            </Pressable>
          </View>

          <View className="items-center" style={{ paddingTop: 16, gap: 12 }}>
            <SpringMark size={56} color={palette.coral} secondary={palette.sageDeep} />
            <Text
              className="text-espresso text-center"
              style={{
                fontFamily: 'Fraunces_500Medium',
                fontSize: 30,
                letterSpacing: -0.5,
                lineHeight: 34,
              }}
            >
              Plant your{' '}
              <Text style={{ fontStyle: 'italic', color: palette.coralDeep }}>Spring</Text>
            </Text>
            <Text className="font-sans text-bark text-center" style={{ fontSize: 14, lineHeight: 20 }}>
              Create an account to save your rhythm.
            </Text>
          </View>

          <View style={{ marginTop: 28, gap: 14 }}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={fieldErrors.email}
              editable={!busy}
            />
            <Field
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
              error={fieldErrors.password}
              editable={!busy}
            />

            {submitError ? (
              <Text className="font-sans text-danger text-center" style={{ fontSize: 13, lineHeight: 18 }}>
                {submitError}
              </Text>
            ) : null}

            <Pressable
              onPress={busy ? undefined : onSubmit}
              disabled={busy}
              className={`flex-row items-center justify-center rounded-full h-14 bg-coral ${busy ? 'opacity-60' : 'active:opacity-80'}`}
              style={{ gap: 8, marginTop: 4 }}
            >
              {busy ? (
                <ActivityIndicator color={palette.cream} />
              ) : (
                <>
                  <Text className="font-sans-semibold text-cream text-base">Create account</Text>
                  <ArrowRight size={18} color={palette.cream} strokeWidth={2.2} />
                </>
              )}
            </Pressable>
          </View>

          <View className="flex-row justify-center" style={{ marginTop: 24, gap: 6 }}>
            <Text className="font-sans text-ink-soft" style={{ fontSize: 13 }}>
              Already have one?
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable hitSlop={8}>
                <Text className="font-sans-semibold text-coral-deep" style={{ fontSize: 13 }}>
                  Sign in
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
