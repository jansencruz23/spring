import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../storage';

export type Goal = 'feel_good' | 'lose_weight' | 'build_strength' | 'eat_better' | 'sleep_deeper';

export type OnboardingDraft = {
  name: string;
  goal: Goal | null;
  wakeTime: string;  // HH:mm
  sleepTime: string; // HH:mm
};

const initialDraft: OnboardingDraft = {
  name: '',
  goal: null,
  wakeTime: '07:00',
  sleepTime: '23:00',
};

type OnboardingState = {
  draft: OnboardingDraft;
  setField: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void;
  reset: () => void;
};

const mmkvJsonStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

export const useOnboardingDraft = create<OnboardingState>()(
  persist(
    (set) => ({
      draft: initialDraft,
      setField: (key, value) =>
        set((s) => ({ draft: { ...s.draft, [key]: value } })),
      reset: () => set({ draft: initialDraft }),
    }),
    {
      name: 'spring.onboarding-draft',
      storage: createJSONStorage(() => mmkvJsonStorage),
    },
  ),
);
