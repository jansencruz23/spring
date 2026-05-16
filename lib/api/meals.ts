import { supabase } from '../supabase';
import { isoToday } from '../util/time';

export type MealTotals = {
  kcal: number;
  protein_g: number;
};

/**
 * Sum kcal + protein from `meal_logs` for the given date (00:00 → 24:00 local).
 * M1 returns zeros for new users; M2 fills it in when meal logging lands.
 */
export async function getMealTotalsForDate(
  userId: string,
  date = isoToday(),
): Promise<MealTotals> {
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59.999`;
  const { data, error } = await supabase
    .from('meal_logs')
    .select('kcal, protein_g')
    .eq('user_id', userId)
    .gte('eaten_at', start)
    .lte('eaten_at', end);
  if (error) throw error;
  return (data ?? []).reduce(
    (acc, row) => ({ kcal: acc.kcal + row.kcal, protein_g: acc.protein_g + row.protein_g }),
    { kcal: 0, protein_g: 0 },
  );
}
