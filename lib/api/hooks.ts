import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, upsertProfileFromDraft, type Profile } from './profiles';
import {
  getHydrationForDate,
  setHydrationCups,
  type HydrationLog,
} from './hydration';
import {
  getSupplementsForDate,
  setSupplementTaken,
  type Supplement,
  type SupplementLog,
} from './supplements';
import { getMealTotalsForDate } from './meals';
import { isoToday } from '../util/time';
import type { OnboardingDraftValid } from '../schemas/profile';
import { storage } from '../storage';

export const ONBOARDED_KEY = 'spring.onboarded';

export function readOnboardedFlag(): boolean {
  return storage.getString(ONBOARDED_KEY) === '1';
}

export function writeOnboardedFlag(value: boolean) {
  if (value) storage.set(ONBOARDED_KEY, '1');
  else storage.delete(ONBOARDED_KEY);
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpsertProfile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draft: OnboardingDraftValid) => {
      if (!userId) throw new Error('no session');
      return upsertProfileFromDraft(userId, draft);
    },
    onSuccess: (profile: Profile) => {
      qc.setQueryData(['profile', userId], profile);
      writeOnboardedFlag(true);
    },
  });
}

export function useHydration(userId: string | undefined, date = isoToday()) {
  return useQuery({
    queryKey: ['hydration', userId, date],
    queryFn: () => getHydrationForDate(userId!, date),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useSetHydration(userId: string | undefined, date = isoToday()) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cups: number) => {
      if (!userId) throw new Error('no session');
      return setHydrationCups(userId, cups, date);
    },
    onMutate: async (cups) => {
      await qc.cancelQueries({ queryKey: ['hydration', userId, date] });
      const previous = qc.getQueryData<HydrationLog>(['hydration', userId, date]);
      qc.setQueryData<HydrationLog>(['hydration', userId, date], {
        user_id: userId ?? '',
        date,
        cups,
      });
      return { previous };
    },
    onError: (_e, _cups, ctx) => {
      if (ctx?.previous) qc.setQueryData(['hydration', userId, date], ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['hydration', userId, date] });
    },
  });
}

export function useSupplements(userId: string | undefined, date = isoToday()) {
  return useQuery({
    queryKey: ['supplements', userId, date],
    queryFn: () => getSupplementsForDate(userId!, date),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useToggleSupplement(userId: string | undefined, date = isoToday()) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, taken }: { name: Supplement['id']; taken: boolean }) => {
      if (!userId) throw new Error('no session');
      return setSupplementTaken(userId, name, taken, date);
    },
    onMutate: async ({ name, taken }) => {
      await qc.cancelQueries({ queryKey: ['supplements', userId, date] });
      const previous = qc.getQueryData<SupplementLog[]>(['supplements', userId, date]);
      const next = (previous ?? []).filter((s) => s.name !== name);
      next.push({
        id: `optimistic-${name}`,
        user_id: userId ?? '',
        date,
        name,
        taken,
      });
      qc.setQueryData<SupplementLog[]>(['supplements', userId, date], next);
      return { previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['supplements', userId, date], ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['supplements', userId, date] });
    },
  });
}

export function useMealTotals(userId: string | undefined, date = isoToday()) {
  return useQuery({
    queryKey: ['mealTotals', userId, date],
    queryFn: () => getMealTotalsForDate(userId!, date),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}
