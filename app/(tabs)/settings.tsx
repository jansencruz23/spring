import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, LogOut, Mail, ShieldCheck, UserPlus } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Body, Heading } from '../../components/primitives/Heading';
import { Field } from '../../components/primitives/Field';
import { Screen } from '../../components/primitives/Screen';
import { useTheme } from '../../lib/theme';
import {
  isAnonymous,
  linkEmailPasswordToAnon,
  signOut,
  updatePassword,
  useSession,
} from '../../lib/auth';
import { useProfile, writeOnboardedFlag } from '../../lib/api';
import { useOnboardingDraft } from '../../lib/store/onboardingDraft';
import {
  ChangePasswordSchema,
  CredentialsSchema,
} from '../../lib/schemas/auth';
import { formatAuthError } from '../(auth)/_error';

export default function Settings() {
  const { mode, toggleMode, palette, accent, setAccent } = useTheme();
  const { session } = useSession();
  const profile = useProfile(session?.user.id);
  const qc = useQueryClient();
  const resetDraft = useOnboardingDraft((s) => s.reset);
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user ?? null;
  const anon = isAnonymous(user);
  const email = user?.email ?? null;

  const swatches: { coral: string; coralDeep: string; coralSoft: string; label: string }[] = [
    { coral: '#EFA890', coralDeep: '#D8866A', coralSoft: '#FCE5D9', label: 'Peach (default)' },
    { coral: '#9BB89A', coralDeep: '#6E8E73', coralSoft: '#E3ECDF', label: 'Sage' },
    { coral: '#F4D27A', coralDeep: '#D9B257', coralSoft: '#FAEFCB', label: 'Butter' },
    { coral: '#C8A8D6', coralDeep: '#A487B8', coralSoft: '#EEE0F4', label: 'Lavender' },
  ];

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      writeOnboardedFlag(false);
      resetDraft();
      qc.clear();
      router.replace('/(auth)/sign-in');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Screen scroll>
      <View className="pt-6" style={{ gap: 24 }}>
        <View style={{ gap: 8 }}>
          <Heading level="eyebrow">Tweaks</Heading>
          <Heading level="display">Make Spring yours</Heading>
        </View>

        {profile.data ? (
          <View className="bg-ivory rounded-card p-5">
            <Body className="font-sans-semibold text-espresso">{profile.data.name || 'Friend'}</Body>
            <Body className="text-ink-soft text-sm">
              Goal: {labelForGoal(profile.data.goal)} · {profile.data.kcal_target} kcal/day
            </Body>
          </View>
        ) : null}

        {/* ─────── Account ─────── */}
        <View style={{ gap: 8 }}>
          <Heading level="eyebrow">Account</Heading>
        </View>

        {user ? (
          anon ? (
            <UpgradeAnonymousCard />
          ) : (
            <RegisteredAccountCard email={email} />
          )
        ) : null}

        {/* ─────── Appearance ─────── */}
        <View style={{ gap: 8 }}>
          <Heading level="eyebrow">Appearance</Heading>
        </View>

        <View className="bg-ivory rounded-card p-5" style={{ gap: 12 }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Body className="font-sans-semibold text-espresso">Dark mode</Body>
              <Body className="text-ink-soft text-sm">Currently: {mode}</Body>
            </View>
            <Switch
              testID="dark-mode-toggle"
              accessibilityLabel="Dark mode"
              accessibilityRole="switch"
              accessibilityState={{ checked: mode === 'dark' }}
              value={mode === 'dark'}
              onValueChange={toggleMode}
              trackColor={{ false: palette.sand, true: palette.coralDeep }}
              thumbColor={palette.cream}
            />
          </View>
        </View>

        <View className="bg-ivory rounded-card p-5" style={{ gap: 12 }}>
          <Body className="font-sans-semibold text-espresso">Accent color</Body>
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {swatches.map((s) => {
              const active = accent?.coral === s.coral || (!accent && s.label.startsWith('Peach'));
              return (
                <Pressable
                  key={s.label}
                  testID={`accent-${s.label.split(' ')[0]?.toLowerCase() ?? 'unknown'}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${s.label} accent`}
                  accessibilityState={{ selected: active }}
                  onPress={() =>
                    s.label.startsWith('Peach')
                      ? setAccent(null)
                      : setAccent({ coral: s.coral, coralDeep: s.coralDeep, coralSoft: s.coralSoft })
                  }
                  style={{ backgroundColor: s.coral }}
                  className={`h-12 w-12 rounded-full ${active ? 'border-2 border-espresso' : ''}`}
                />
              );
            })}
          </View>
          <Body className="text-ink-soft text-xs">Live accent picker — verified at M5.</Body>
        </View>

        <Pressable
          testID="sign-out"
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          accessibilityState={{ busy: signingOut, disabled: signingOut }}
          onPress={signingOut ? undefined : onSignOut}
          className="flex-row items-center justify-center rounded-full bg-ivory active:opacity-80"
          style={{
            height: 48,
            borderWidth: 1,
            borderColor: palette.coralWhisper,
            gap: 8,
          }}
        >
          {signingOut ? (
            <ActivityIndicator color={palette.bark} />
          ) : (
            <>
              <LogOut size={16} color={palette.bark} />
              <Text className="font-sans-semibold text-bark">Sign out</Text>
            </>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

function UpgradeAnonymousCard() {
  const { palette } = useTheme();
  const qc = useQueryClient();
  const passwordRef = useRef<TextInput>(null);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (busy) return;
    setError(null);
    setFieldErrors({});

    const parsed = CredentialsSchema.safeParse({ email: email.trim(), password });
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
      await linkEmailPasswordToAnon(parsed.data.email, parsed.data.password);
      // onAuthStateChange will refresh the session — settings re-renders into
      // the RegisteredAccountCard automatically. Clear stale profile cache so
      // it re-fetches under the now-permanent user_id (which is the same).
      void qc.invalidateQueries({ queryKey: ['profile'] });
      setOpen(false);
      setEmail('');
      setPassword('');
    } catch (e) {
      setError(formatAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <View
        className="bg-ivory rounded-card p-5"
        style={{ gap: 10, borderWidth: 1, borderColor: palette.coralWhisper }}
      >
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: palette.coralSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserPlus size={18} color={palette.coralDeep} />
          </View>
          <View className="flex-1">
            <Body className="font-sans-semibold text-espresso">Save your progress</Body>
            <Body className="text-ink-soft text-sm">
              You're signed in as a guest. Add an email so your rhythm syncs across devices.
            </Body>
          </View>
        </View>
        <Pressable
          onPress={() => setOpen(true)}
          className="flex-row items-center justify-center rounded-full h-12 bg-coral active:opacity-80"
          style={{ gap: 8 }}
        >
          <Text className="font-sans-semibold text-cream text-base">Create account</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      className="bg-ivory rounded-card p-5"
      style={{ gap: 12, borderWidth: 1, borderColor: palette.coralWhisper }}
    >
      <Body className="font-sans-semibold text-espresso">Create your account</Body>
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
      {error ? (
        <Text className="font-sans text-danger" style={{ fontSize: 13, lineHeight: 18 }}>
          {error}
        </Text>
      ) : null}
      <View className="flex-row" style={{ gap: 10 }}>
        <Pressable
          onPress={busy ? undefined : () => setOpen(false)}
          disabled={busy}
          className="flex-1 flex-row items-center justify-center rounded-full h-12 bg-cream active:opacity-80"
          style={{ borderWidth: 1, borderColor: palette.coralWhisper, opacity: busy ? 0.6 : 1 }}
        >
          <Text className="font-sans-semibold text-bark">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={busy ? undefined : onSubmit}
          disabled={busy}
          className={`flex-1 flex-row items-center justify-center rounded-full h-12 bg-coral ${busy ? 'opacity-60' : 'active:opacity-80'}`}
          style={{ gap: 8 }}
        >
          {busy ? (
            <ActivityIndicator color={palette.cream} />
          ) : (
            <Text className="font-sans-semibold text-cream">Save</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function RegisteredAccountCard({ email }: { email: string | null }) {
  const { palette } = useTheme();

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const onSubmit = async () => {
    if (busy) return;
    setError(null);
    setPasswordError(undefined);

    const parsed = ChangePasswordSchema.safeParse({ password });
    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => i.path[0] === 'password');
      setPasswordError(issue?.message);
      return;
    }

    setBusy(true);
    try {
      await updatePassword(parsed.data.password);
      setPassword('');
      setOpen(false);
      setSavedAt(Date.now());
    } catch (e) {
      setError(formatAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View
      className="bg-ivory rounded-card p-5"
      style={{ gap: 12, borderWidth: 1, borderColor: palette.coralWhisper }}
    >
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: palette.sageSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mail size={18} color={palette.sageDeep} />
        </View>
        <View className="flex-1">
          <Body className="font-sans-semibold text-espresso">{email ?? 'Signed in'}</Body>
          <Body className="text-ink-soft text-sm">Your account is saved.</Body>
        </View>
      </View>

      {savedAt && !open ? (
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Check size={14} color={palette.sageDeep} />
          <Text className="font-sans-semibold text-sage-deep" style={{ fontSize: 12 }}>
            Password updated
          </Text>
        </View>
      ) : null}

      {!open ? (
        <Pressable
          onPress={() => {
            setOpen(true);
            setSavedAt(null);
          }}
          className="flex-row items-center justify-center rounded-full h-11 bg-cream active:opacity-80"
          style={{ borderWidth: 1, borderColor: palette.coralWhisper, gap: 8 }}
        >
          <ShieldCheck size={16} color={palette.bark} />
          <Text className="font-sans-semibold text-bark">Change password</Text>
        </Pressable>
      ) : (
        <View style={{ gap: 12 }}>
          <Field
            label="New password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            error={passwordError}
            editable={!busy}
          />
          {error ? (
            <Text className="font-sans text-danger" style={{ fontSize: 13, lineHeight: 18 }}>
              {error}
            </Text>
          ) : null}
          <View className="flex-row" style={{ gap: 10 }}>
            <Pressable
              onPress={busy ? undefined : () => {
                setOpen(false);
                setPassword('');
                setError(null);
                setPasswordError(undefined);
              }}
              disabled={busy}
              className="flex-1 flex-row items-center justify-center rounded-full h-11 bg-cream active:opacity-80"
              style={{ borderWidth: 1, borderColor: palette.coralWhisper, opacity: busy ? 0.6 : 1 }}
            >
              <Text className="font-sans-semibold text-bark">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={busy ? undefined : onSubmit}
              disabled={busy}
              className={`flex-1 flex-row items-center justify-center rounded-full h-11 bg-coral ${busy ? 'opacity-60' : 'active:opacity-80'}`}
            >
              {busy ? (
                <ActivityIndicator color={palette.cream} />
              ) : (
                <Text className="font-sans-semibold text-cream">Update</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function labelForGoal(goal: string | null): string {
  switch (goal) {
    case 'feel_good':      return 'Feel good';
    case 'lose_weight':    return 'Lose a little';
    case 'build_strength': return 'Build strength';
    case 'eat_better':     return 'Eat better';
    case 'sleep_deeper':   return 'Sleep deeper';
    default:               return 'Just started';
  }
}
