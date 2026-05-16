import { supabase } from '../supabase';
import { isoToday } from '../util/time';

export type HydrationLog = { user_id: string; date: string; cups: number };

export async function getHydrationForDate(userId: string, date = isoToday()): Promise<HydrationLog> {
  const { data, error } = await supabase
    .from('hydration_logs')
    .select('user_id, date, cups')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data ?? { user_id: userId, date, cups: 0 };
}

export async function setHydrationCups(
  userId: string,
  cups: number,
  date = isoToday(),
): Promise<HydrationLog> {
  const safeCups = Math.max(0, Math.floor(cups));
  const { data, error } = await supabase
    .from('hydration_logs')
    .upsert({ user_id: userId, date, cups: safeCups }, { onConflict: 'user_id,date' })
    .select('user_id, date, cups')
    .single();
  if (error) throw error;
  return data;
}
