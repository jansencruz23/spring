import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field } from '../../components/primitives/Field';
import { SpringMark } from '../../components/primitives/SpringMark';
import { requestPasswordReset } from '../../lib/auth';
import { ResetRequestSchema } from '../../lib/schemas/auth';
import { useTheme } from '../../lib/theme';
import { formatAuthError } from './_error';

export default function ForgotPassword() {
  const { palette } = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    if (busy) return;
    setSubmitError(null);
    setEmailError(undefined);

    const parsed = ResetRequestSchema.safeParse({ email: email.trim() });
    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => i.path[0] === 'email');
      setEmailError(issue?.message);
      return;
    }

    setBusy(true);
    try {
      await requestPasswordReset(parsed.data.email);
      setSent(true);
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
              Reset your{' '}
              <Text style={{ fontStyle: 'italic', color: palette.coralDeep }}>password</Text>
            </Text>
            <Text className="font-sans text-bark text-center" style={{ fontSize: 14, lineHeight: 20 }}>
              We'll email you a link to set a new one.
            </Text>
          </View>

          {sent ? (
            <View
              className="bg-ivory rounded-card"
              style={{
                marginTop: 28,
                padding: 20,
                gap: 10,
                borderWidth: 1,
                borderColor: palette.coralWhisper,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: palette.sageSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mail size={20} color={palette.sageDeep} />
              </View>
              <Text className="font-display-medium text-espresso text-center" style={{ fontSize: 20 }}>
                Check your inbox
              </Text>
              <Text className="font-sans text-bark text-center" style={{ fontSize: 13, lineHeight: 19 }}>
                If an account exists for {email.trim()}, we sent a link to reset your password.
              </Text>
              <Pressable
                onPress={() => router.replace('/(auth)/sign-in')}
                className="flex-row items-center justify-center rounded-full h-12 bg-coral active:opacity-80"
                style={{ gap: 8, alignSelf: 'stretch', marginTop: 6 }}
              >
                <Text className="font-sans-semibold text-cream text-base">Back to sign in</Text>
              </Pressable>
            </View>
          ) : (
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
                returnKeyType="go"
                onSubmitEditing={onSubmit}
                error={emailError}
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
                    <Text className="font-sans-semibold text-cream text-base">Send reset link</Text>
                    <ArrowRight size={18} color={palette.cream} strokeWidth={2.2} />
                  </>
                )}
              </Pressable>

              <View className="flex-row justify-center" style={{ marginTop: 4, gap: 6 }}>
                <Text className="font-sans text-ink-soft" style={{ fontSize: 13 }}>
                  Remember it?
                </Text>
                <Link href="/(auth)/sign-in" asChild>
                  <Pressable hitSlop={8}>
                    <Text className="font-sans-semibold text-coral-deep" style={{ fontSize: 13 }}>
                      Sign in
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
