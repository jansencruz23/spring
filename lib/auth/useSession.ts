import type { Session, User } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../supabase';

type SessionState = {
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
};

const useSessionStore = create<SessionState>((set) => ({
  session: null,
  loading: true,
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
}));

let subscribed = false;

function ensureSubscribed() {
  if (subscribed) return;
  subscribed = true;

  void supabase.auth.getSession().then(({ data }) => {
    useSessionStore.setState({ session: data.session, loading: false });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    useSessionStore.setState({ session, loading: false });
  });
}

export function useSession() {
  useEffect(() => {
    ensureSubscribed();
  }, []);
  // Two atomic selectors instead of one returning a new object literal — that
  // pattern triggers React's "getSnapshot should be cached" warning + an
  // infinite render loop, because `{ session, loading }` is a fresh reference
  // every call and Zustand compares snapshots by Object.is.
  const session = useSessionStore((s) => s.session);
  const loading = useSessionStore((s) => s.loading);
  return { session, loading };
}

/** Anonymous users carry `is_anonymous: true` on the JWT app_metadata. */
export function isAnonymous(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.is_anonymous === true;
}

export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function requestPasswordReset(email: string) {
  // The redirect deep-link is handled at the app level (spring://). The
  // recovery screen is not implemented in v1 — users complete the reset on
  // Supabase's hosted page. Wire `redirectTo` here when we add the in-app
  // recovery flow.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'spring://auth/reset-password',
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data.user;
}

/**
 * Converts the current anonymous session into a permanent account by attaching
 * an email and password. Existing user_id (and all RLS-scoped data) is
 * preserved. With `auth.email.enable_confirmations = false` in supabase
 * config, the change takes effect immediately.
 */
export async function linkEmailPasswordToAnon(email: string, password: string) {
  const { data, error } = await supabase.auth.updateUser({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}
