import { supabase } from '../supabase';
import type { Database } from '../database.types';
import { addDays, startOfMondayWeek, isoToday } from '../util/time';

type MealPlanInsert = Database['public']['Tables']['meal_plans']['Insert'];

type SeedMeal = {
  slot: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  scheduled_time: string;
  food_name: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  tags: string[];
};

/**
 * A 7-day Mediterranean rotation used to seed `meal_plans` for new users so the
 * Meals tab has something to render in v1. Macros stay in the ballpark of the
 * `feel_good` default daily target (~2000 kcal / 120 g protein). Lightly varied
 * day-to-day so the week selector feels meaningful.
 */
const MEDITERRANEAN_WEEK: SeedMeal[][] = [
  // Monday
  [
    { slot: 'breakfast', scheduled_time: '07:30', food_name: 'Greek yogurt, berries & honey', kcal: 320, protein_g: 22, carbs_g: 42, fat_g: 7,  tags: ['high-protein', 'quick'] },
    { slot: 'lunch',     scheduled_time: '12:45', food_name: 'Lentil & roasted veg bowl',     kcal: 510, protein_g: 28, carbs_g: 70, fat_g: 14, tags: ['vegetarian', 'fiber'] },
    { slot: 'snack',     scheduled_time: '16:00', food_name: 'Almonds & a small pear',         kcal: 210, protein_g: 8,  carbs_g: 26, fat_g: 11, tags: ['light'] },
    { slot: 'dinner',    scheduled_time: '19:30', food_name: 'Lemon herb salmon, farro',       kcal: 620, protein_g: 42, carbs_g: 58, fat_g: 22, tags: ['omega-3', 'iron'] },
  ],
  // Tuesday
  [
    { slot: 'breakfast', scheduled_time: '07:30', food_name: 'Spinach & feta omelette',        kcal: 340, protein_g: 26, carbs_g: 12, fat_g: 22, tags: ['high-protein', 'low-carb'] },
    { slot: 'lunch',     scheduled_time: '12:45', food_name: 'Chickpea tabbouleh',             kcal: 480, protein_g: 22, carbs_g: 64, fat_g: 16, tags: ['vegetarian'] },
    { slot: 'snack',     scheduled_time: '16:00', food_name: 'Apple & nut butter',             kcal: 220, protein_g: 6,  carbs_g: 28, fat_g: 11, tags: ['quick'] },
    { slot: 'dinner',    scheduled_time: '19:30', food_name: 'Grilled chicken & couscous',     kcal: 580, protein_g: 44, carbs_g: 56, fat_g: 18, tags: ['high-protein'] },
  ],
  // Wednesday
  [
    { slot: 'breakfast', scheduled_time: '07:30', food_name: 'Overnight oats with figs',       kcal: 350, protein_g: 14, carbs_g: 58, fat_g: 9,  tags: ['fiber'] },
    { slot: 'lunch',     scheduled_time: '12:45', food_name: 'Tuna nicoise salad',              kcal: 520, protein_g: 36, carbs_g: 32, fat_g: 24, tags: ['omega-3', 'high-protein'] },
    { slot: 'snack',     scheduled_time: '16:00', food_name: 'Hummus & cucumber',               kcal: 200, protein_g: 8,  carbs_g: 24, fat_g: 9,  tags: ['vegetarian'] },
    { slot: 'dinner',    scheduled_time: '19:30', food_name: 'White bean & kale stew',         kcal: 540, protein_g: 28, carbs_g: 70, fat_g: 14, tags: ['vegetarian', 'fiber'] },
  ],
  // Thursday
  [
    { slot: 'breakfast', scheduled_time: '07:30', food_name: 'Smoked salmon avocado toast',    kcal: 380, protein_g: 24, carbs_g: 32, fat_g: 18, tags: ['omega-3'] },
    { slot: 'lunch',     scheduled_time: '12:45', food_name: 'Quinoa stuffed peppers',          kcal: 500, protein_g: 22, carbs_g: 66, fat_g: 14, tags: ['vegetarian'] },
    { slot: 'snack',     scheduled_time: '16:00', food_name: 'Greek yogurt & walnuts',          kcal: 230, protein_g: 14, carbs_g: 14, fat_g: 14, tags: ['high-protein'] },
    { slot: 'dinner',    scheduled_time: '19:30', food_name: 'Turkey meatballs & pasta',        kcal: 610, protein_g: 42, carbs_g: 58, fat_g: 20, tags: ['high-protein'] },
  ],
  // Friday
  [
    { slot: 'breakfast', scheduled_time: '07:30', food_name: 'Banana protein smoothie',         kcal: 340, protein_g: 30, carbs_g: 44, fat_g: 6,  tags: ['high-protein', 'quick'] },
    { slot: 'lunch',     scheduled_time: '12:45', food_name: 'Falafel & tahini wrap',           kcal: 540, protein_g: 24, carbs_g: 64, fat_g: 22, tags: ['vegetarian'] },
    { slot: 'snack',     scheduled_time: '16:00', food_name: 'Dark chocolate & almonds',        kcal: 200, protein_g: 6,  carbs_g: 18, fat_g: 14, tags: ['light'] },
    { slot: 'dinner',    scheduled_time: '19:30', food_name: 'Garlic shrimp & orzo',            kcal: 590, protein_g: 38, carbs_g: 60, fat_g: 18, tags: ['high-protein'] },
  ],
  // Saturday
  [
    { slot: 'breakfast', scheduled_time: '08:30', food_name: 'Shakshuka with sourdough',       kcal: 410, protein_g: 22, carbs_g: 38, fat_g: 20, tags: ['vegetarian'] },
    { slot: 'lunch',     scheduled_time: '13:00', food_name: 'Mediterranean grain bowl',        kcal: 530, protein_g: 24, carbs_g: 70, fat_g: 16, tags: ['fiber'] },
    { slot: 'snack',     scheduled_time: '16:30', food_name: 'Olives & feta',                   kcal: 210, protein_g: 10, carbs_g: 6,  fat_g: 16, tags: ['low-carb'] },
    { slot: 'dinner',    scheduled_time: '19:30', food_name: 'Roast lamb, rosemary potatoes',   kcal: 650, protein_g: 46, carbs_g: 50, fat_g: 26, tags: ['high-protein', 'iron'] },
  ],
  // Sunday
  [
    { slot: 'breakfast', scheduled_time: '09:00', food_name: 'Ricotta hotcakes & berries',     kcal: 420, protein_g: 22, carbs_g: 52, fat_g: 14, tags: ['weekend'] },
    { slot: 'lunch',     scheduled_time: '13:00', food_name: 'Roasted veg & halloumi salad',    kcal: 490, protein_g: 26, carbs_g: 36, fat_g: 24, tags: ['vegetarian'] },
    { slot: 'snack',     scheduled_time: '16:30', food_name: 'Roasted chickpeas',              kcal: 190, protein_g: 10, carbs_g: 24, fat_g: 6,  tags: ['vegetarian'] },
    { slot: 'dinner',    scheduled_time: '19:00', food_name: 'Baked cod, ratatouille',         kcal: 540, protein_g: 40, carbs_g: 40, fat_g: 18, tags: ['omega-3', 'light'] },
  ],
];

function buildWeekPayload(userId: string, weekStart: Date): MealPlanInsert[] {
  const rows: MealPlanInsert[] = [];
  for (let i = 0; i < 7; i++) {
    const date = isoToday(addDays(weekStart, i));
    for (const meal of MEDITERRANEAN_WEEK[i]!) {
      rows.push({
        user_id: userId,
        date,
        slot: meal.slot,
        food_name: meal.food_name,
        kcal: meal.kcal,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        tags: meal.tags,
        scheduled_time: meal.scheduled_time,
      });
    }
  }
  return rows;
}

/**
 * Ensures the user has meal plans for the current Mon→Sun week. Idempotent —
 * if any plans exist in the range, this is a no-op. Safe to call on every
 * Meals-tab mount as a backstop for users who onboarded before seeding existed.
 */
export async function ensureWeekSeeded(
  userId: string,
  reference: Date = new Date(),
): Promise<{ seeded: boolean }> {
  const weekStart = startOfMondayWeek(reference);
  const firstIso = isoToday(weekStart);
  const lastIso = isoToday(addDays(weekStart, 6));

  const { data: existing, error: checkErr } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('user_id', userId)
    .gte('date', firstIso)
    .lte('date', lastIso)
    .limit(1);
  if (checkErr) throw checkErr;
  if (existing && existing.length > 0) return { seeded: false };

  const payload = buildWeekPayload(userId, weekStart);
  const { error: insertErr } = await supabase.from('meal_plans').insert(payload);
  if (insertErr) throw insertErr;
  return { seeded: true };
}
