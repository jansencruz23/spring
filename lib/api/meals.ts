import { supabase } from '../supabase';
import type { Database } from '../database.types';
import { isoToday } from '../util/time';

export type MealPlan = Database['public']['Tables']['meal_plans']['Row'];
export type MealLog = Database['public']['Tables']['meal_logs']['Row'];

export type MealTotals = {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

const MEAL_SLOT_ORDER: Record<MealPlan['slot'], number> = {
  breakfast: 0,
  lunch: 1,
  snack: 2,
  dinner: 3,
};

/** All `meal_plans` rows for the user on `date`, sorted by slot then time. */
export async function getMealPlansForDate(
  userId: string,
  date: string = isoToday(),
): Promise<MealPlan[]> {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);
  if (error) throw error;
  const rows = data ?? [];
  rows.sort((a, b) => {
    const slotDiff = MEAL_SLOT_ORDER[a.slot] - MEAL_SLOT_ORDER[b.slot];
    if (slotDiff !== 0) return slotDiff;
    return (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? '');
  });
  return rows;
}

/**
 * `meal_logs` rows for `date`, keyed by `meal_plan_id` for fast O(1) lookup in
 * the UI ("is this plan checked off?"). Freeform logs (plan_id null) are dropped
 * from the map — they're not used in M2.
 */
export async function getMealLogsForDate(
  userId: string,
  date: string = isoToday(),
): Promise<Map<string, MealLog>> {
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59.999`;
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('eaten_at', start)
    .lte('eaten_at', end);
  if (error) throw error;
  const map = new Map<string, MealLog>();
  for (const row of data ?? []) {
    if (row.meal_plan_id) map.set(row.meal_plan_id, row);
  }
  return map;
}

/**
 * Inserts a `meal_logs` row tied to a plan. Caller passes the plan so we can
 * snapshot kcal + protein at log time — `meal_logs` only stores those two
 * columns at the SQL level; carbs/fat are derived back from the plan on read.
 */
export async function logMealFromPlan(
  userId: string,
  plan: MealPlan,
): Promise<MealLog> {
  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: userId,
      meal_plan_id: plan.id,
      freeform_name: null,
      kcal: plan.kcal,
      protein_g: plan.protein_g,
      eaten_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function unlogMeal(userId: string, logId: string): Promise<void> {
  const { error } = await supabase
    .from('meal_logs')
    .delete()
    .eq('user_id', userId)
    .eq('id', logId);
  if (error) throw error;
}

/**
 * Sum macros from `meal_logs` for the date. Carbs + fat are derived by joining
 * to `meal_plans` (the schema only stores kcal + protein on the log). Freeform
 * logs without a linked plan contribute 0 carbs / 0 fat — acceptable for v1
 * since freeform logging isn't part of the M2 surface.
 */
export async function getMealTotalsForDate(
  userId: string,
  date: string = isoToday(),
): Promise<MealTotals> {
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59.999`;
  const { data, error } = await supabase
    .from('meal_logs')
    .select('kcal, protein_g, meal_plans(carbs_g, fat_g)')
    .eq('user_id', userId)
    .gte('eaten_at', start)
    .lte('eaten_at', end);
  if (error) throw error;

  type Row = {
    kcal: number;
    protein_g: number;
    meal_plans: { carbs_g: number; fat_g: number } | { carbs_g: number; fat_g: number }[] | null;
  };

  return ((data ?? []) as Row[]).reduce<MealTotals>(
    (acc, row) => {
      const plan = Array.isArray(row.meal_plans) ? row.meal_plans[0] : row.meal_plans;
      return {
        kcal: acc.kcal + row.kcal,
        protein_g: acc.protein_g + row.protein_g,
        carbs_g: acc.carbs_g + (plan?.carbs_g ?? 0),
        fat_g: acc.fat_g + (plan?.fat_g ?? 0),
      };
    },
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
}
