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
import {
  applyMealSwap,
  getMealLogsForDate,
  getMealPlansForDate,
  getMealTotalsForDate,
  logMealFromPlan,
  unlogMeal,
  type MealLog,
  type MealPlan,
  type SwapInput,
} from './meals';
import {
  endSession,
  getActiveSession,
  getSessionSets,
  logSet,
  startSession,
  type LogSetInput,
  type WorkoutSession,
  type WorkoutSet,
} from './workouts';
import {
  getLatestThread,
  getMessages,
  requestMealSwap,
  type ChatMessage,
  type ChatThread,
} from './chat';
import { ensureWeekSeeded } from './seeds';
import { isoToday } from '../util/time';
import type { OnboardingDraftValid } from '../schemas/profile';
import type { MealSwapPlanInput, MealSwapSuggestion } from '../schemas/chat';
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

export function useMealPlans(userId: string | undefined, date: string) {
  return useQuery({
    queryKey: ['mealPlans', userId, date],
    queryFn: () => getMealPlansForDate(userId!, date),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMealLogs(userId: string | undefined, date: string) {
  return useQuery({
    queryKey: ['mealLogs', userId, date],
    queryFn: () => getMealLogsForDate(userId!, date),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

/**
 * Toggles a planned meal as logged / unlogged. Optimistic — the UI reflects
 * the new state instantly; on failure the previous map is restored. Always
 * invalidates `mealTotals` so the Today screen's macro bars reanimate.
 */
export function useToggleMealLog(userId: string | undefined, date: string) {
  const qc = useQueryClient();
  const today = isoToday();

  return useMutation({
    mutationFn: async ({ plan, existing }: { plan: MealPlan; existing: MealLog | null }) => {
      if (!userId) throw new Error('no session');
      if (existing) {
        await unlogMeal(userId, existing.id);
        return { logged: null, planId: plan.id };
      }
      const log = await logMealFromPlan(userId, plan);
      return { logged: log, planId: plan.id };
    },
    onMutate: async ({ plan, existing }) => {
      await qc.cancelQueries({ queryKey: ['mealLogs', userId, date] });
      const previous = qc.getQueryData<Map<string, MealLog>>(['mealLogs', userId, date]);
      const next = new Map(previous ?? []);
      if (existing) {
        next.delete(plan.id);
      } else {
        next.set(plan.id, {
          id: `optimistic-${plan.id}`,
          user_id: userId ?? '',
          meal_plan_id: plan.id,
          freeform_name: null,
          eaten_at: new Date().toISOString(),
          kcal: plan.kcal,
          protein_g: plan.protein_g,
          created_at: new Date().toISOString(),
        });
      }
      qc.setQueryData<Map<string, MealLog>>(['mealLogs', userId, date], next);
      return { previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['mealLogs', userId, date], ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['mealLogs', userId, date] });
      // Logging happens "today" — the Today screen pulls today's totals only,
      // so only invalidate when the toggled date is today.
      if (date === today) {
        void qc.invalidateQueries({ queryKey: ['mealTotals', userId, today] });
      }
    },
  });
}

export function useActiveWorkoutSession(userId: string | undefined) {
  return useQuery({
    queryKey: ['workoutActiveSession', userId],
    queryFn: () => getActiveSession(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useWorkoutSets(userId: string | undefined, sessionId: string | undefined) {
  return useQuery({
    queryKey: ['workoutSets', userId, sessionId],
    queryFn: () => getSessionSets(userId!, sessionId!),
    enabled: !!userId && !!sessionId,
    staleTime: 1000 * 30,
  });
}

export function useStartWorkoutSession(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => {
      if (!userId) throw new Error('no session');
      return startSession(userId, name);
    },
    onSuccess: (session: WorkoutSession) => {
      qc.setQueryData<WorkoutSession | null>(['workoutActiveSession', userId], session);
      qc.setQueryData<WorkoutSet[]>(['workoutSets', userId, session.id], []);
    },
  });
}

export function useEndWorkoutSession(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => {
      if (!userId) throw new Error('no session');
      return endSession(userId, sessionId);
    },
    onSuccess: () => {
      qc.setQueryData<WorkoutSession | null>(['workoutActiveSession', userId], null);
      void qc.invalidateQueries({ queryKey: ['workoutActiveSession', userId] });
    },
  });
}

/**
 * Logs a single set against the active session. Optimistic — the set appears
 * in the cached list instantly so the routine row updates without waiting for
 * the round-trip. On failure the previous list is restored.
 */
export function useLogWorkoutSet(userId: string | undefined, sessionId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LogSetInput) => {
      if (!userId) throw new Error('no session');
      if (!sessionId) throw new Error('no active workout session');
      return logSet(userId, sessionId, input);
    },
    onMutate: async (input) => {
      if (!sessionId) return { previous: undefined };
      await qc.cancelQueries({ queryKey: ['workoutSets', userId, sessionId] });
      const previous = qc.getQueryData<WorkoutSet[]>(['workoutSets', userId, sessionId]);
      const optimistic: WorkoutSet = {
        id: `optimistic-${Date.now()}`,
        user_id: userId ?? '',
        session_id: sessionId,
        exercise: input.exercise,
        reps: input.reps,
        weight_kg: input.weightKg,
        completed_at: new Date().toISOString(),
      };
      qc.setQueryData<WorkoutSet[]>(
        ['workoutSets', userId, sessionId],
        [...(previous ?? []), optimistic],
      );
      return { previous };
    },
    onError: (_e, _vars, ctx) => {
      if (sessionId && ctx?.previous) {
        qc.setQueryData(['workoutSets', userId, sessionId], ctx.previous);
      }
    },
    onSettled: () => {
      if (sessionId) {
        void qc.invalidateQueries({ queryKey: ['workoutSets', userId, sessionId] });
      }
    },
  });
}

// ────────────────────────────────────────────────────────────────────────
// Chat
// ────────────────────────────────────────────────────────────────────────

export function useChatThread(userId: string | undefined) {
  return useQuery({
    queryKey: ['chatThread', userId],
    queryFn: () => getLatestThread(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useChatMessages(threadId: string | undefined | null) {
  return useQuery({
    queryKey: ['chatMessages', threadId],
    queryFn: () => getMessages(threadId!),
    enabled: !!threadId,
    staleTime: 1000 * 30,
  });
}

/**
 * Optimistically apply a meal swap and update the cached meal-plan list.
 * Invalidates meal totals when applying to today's plan so the Today screen
 * macro bars reanimate.
 */
export function useApplyMealSwap(userId: string | undefined, date: string) {
  const qc = useQueryClient();
  const today = isoToday();

  return useMutation({
    mutationFn: ({ planId, swap }: { planId: string; swap: SwapInput }) => {
      if (!userId) throw new Error('no session');
      return applyMealSwap(userId, planId, swap);
    },
    onMutate: async ({ planId, swap }) => {
      await qc.cancelQueries({ queryKey: ['mealPlans', userId, date] });
      const previous = qc.getQueryData<MealPlan[]>(['mealPlans', userId, date]);
      if (previous) {
        const next = previous.map((p) =>
          p.id === planId
            ? {
                ...p,
                food_name: swap.food_name,
                kcal: swap.kcal,
                protein_g: swap.protein_g,
                carbs_g: swap.carbs_g,
                fat_g: swap.fat_g,
                tags: swap.tags,
              }
            : p,
        );
        qc.setQueryData<MealPlan[]>(['mealPlans', userId, date], next);
      }
      return { previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['mealPlans', userId, date], ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['mealPlans', userId, date] });
      if (date === today) {
        void qc.invalidateQueries({ queryKey: ['mealTotals', userId, today] });
      }
    },
  });
}

export function useMealSwap() {
  return useMutation<MealSwapSuggestion, Error, MealSwapPlanInput>({
    mutationFn: (plan) => requestMealSwap(plan),
  });
}

/**
 * Fire-and-forget seed: if `meal_plans` is empty for this week, seed the
 * Mediterranean rotation. Used as a backstop on the Meals tab so existing
 * (pre-seed) users get content on first visit. Errors are silent — the empty
 * state in the UI is acceptable if seeding fails.
 */
export function useEnsureWeekSeeded(userId: string | undefined, reference: Date = new Date()) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['ensureWeekSeeded', userId, isoToday(reference)],
    queryFn: async () => {
      if (!userId) return { seeded: false };
      const result = await ensureWeekSeeded(userId, reference);
      if (result.seeded) {
        void qc.invalidateQueries({ queryKey: ['mealPlans', userId] });
      }
      return result;
    },
    enabled: !!userId,
    staleTime: Infinity, // Once seeded for the week, don't retry.
    retry: false,
  });
}
