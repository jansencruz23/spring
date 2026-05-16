import { supabase } from '../supabase';
import type { Database } from '../database.types';
import {
  OnboardingDraftSchema,
  toPgTime,
  type OnboardingDraftValid,
  type ProfileMacros,
  type SpringGoal,
} from '../schemas/profile';

export type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

/**
 * Gentle macro defaults per goal. These are starting suggestions — the prototype
 * copy explicitly frames them as "we'll adjust as we learn your rhythm."
 */
export function macrosForGoal(goal: SpringGoal): ProfileMacros {
  switch (goal) {
    case 'lose_weight':
      return { kcal_target: 1700, protein_g: 130, carbs_g: 180, fat_g: 55, water_ml_target: 2400 };
    case 'build_strength':
      return { kcal_target: 2400, protein_g: 160, carbs_g: 270, fat_g: 75, water_ml_target: 2800 };
    case 'eat_better':
      return { kcal_target: 2000, protein_g: 120, carbs_g: 240, fat_g: 70, water_ml_target: 2400 };
    case 'sleep_deeper':
      return { kcal_target: 2000, protein_g: 120, carbs_g: 230, fat_g: 70, water_ml_target: 2200 };
    case 'feel_good':
    default:
      return { kcal_target: 2000, protein_g: 120, carbs_g: 230, fat_g: 70, water_ml_target: 2000 };
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function upsertProfileFromDraft(
  userId: string,
  draft: OnboardingDraftValid,
): Promise<Profile> {
  const macros = macrosForGoal(draft.goal);
  const payload: ProfileInsert = {
    user_id: userId,
    name: draft.name,
    goal: draft.goal,
    wake_time: toPgTime(draft.wakeTime),
    sleep_time: toPgTime(draft.sleepTime),
    kcal_target: macros.kcal_target,
    protein_g: macros.protein_g,
    carbs_g: macros.carbs_g,
    fat_g: macros.fat_g,
    water_ml_target: macros.water_ml_target,
  };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export { OnboardingDraftSchema };
