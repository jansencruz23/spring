import { z } from 'zod';

export const SpringGoalSchema = z.enum([
  'feel_good',
  'lose_weight',
  'build_strength',
  'eat_better',
  'sleep_deeper',
]);
export type SpringGoal = z.infer<typeof SpringGoalSchema>;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const HHMMSS = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
export const TimeOfDaySchema = z.string().regex(HHMM, 'expected HH:MM');

export const OnboardingDraftSchema = z.object({
  name: z.string().trim().min(1, 'name required').max(80),
  goal: SpringGoalSchema,
  wakeTime: TimeOfDaySchema,
  sleepTime: TimeOfDaySchema,
});
export type OnboardingDraftValid = z.infer<typeof OnboardingDraftSchema>;

export const ProfileMacrosSchema = z.object({
  kcal_target: z.number().int().min(800).max(6000),
  protein_g: z.number().int().min(20).max(400),
  carbs_g: z.number().int().min(20).max(800),
  fat_g: z.number().int().min(10).max(300),
  water_ml_target: z.number().int().min(500).max(8000),
});
export type ProfileMacros = z.infer<typeof ProfileMacrosSchema>;

/** Maps the HH:MM the app uses to Postgres `time` (HH:MM:SS). */
export function toPgTime(hhmm: string): string {
  if (HHMMSS.test(hhmm)) return hhmm;
  return `${hhmm}:00`;
}

/** Maps Postgres `time` (HH:MM:SS) back to HH:MM. */
export function fromPgTime(t: string): string {
  return t.slice(0, 5);
}
