import type { Session } from '@supabase/supabase-js';
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

export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}
