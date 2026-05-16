// Server-side context assembly for chat + meal-swap. We deliberately never
// trust client-supplied context — all profile + log data is read from the
// database here, scoped to the authenticated user.

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.45.4';

export type UserContext = {
  name: string;
  goal: string | null;
  kcalTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  waterMlTarget: number;
  today: {
    date: string;
    kcal: number;
    protein_g: number;
    waterCups: number;
    supplements: { name: string; taken: boolean }[];
  };
  recentSleep: { date: string; duration_min: number; score: number | null }[];
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Sanitize free-text fields that originate from the user (profile.name,
// supplement.name, etc.) before they are interpolated into a model prompt.
// Strips newlines and angle brackets (so user content can't break out of the
// XML-style sentinel tags used in the system prompt) and caps length.
function sanitizeField(raw: unknown, maxLen = 80): string {
  const s = typeof raw === 'string' ? raw : String(raw ?? '');
  return s
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

export async function buildUserContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserContext> {
  const today = isoDate(new Date());
  const sevenDaysAgo = isoDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  const [{ data: profile }, mealLogsRes, hydrationRes, supplementsRes, sleepRes] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase
        .from('meal_logs')
        .select('kcal,protein_g')
        .eq('user_id', userId)
        .gte('eaten_at', `${today}T00:00:00`)
        .lte('eaten_at', `${today}T23:59:59.999`),
      supabase
        .from('hydration_logs')
        .select('cups')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle(),
      supabase
        .from('supplement_logs')
        .select('name,taken')
        .eq('user_id', userId)
        .eq('date', today),
      supabase
        .from('sleep_logs')
        .select('date,duration_min,score')
        .eq('user_id', userId)
        .gte('date', sevenDaysAgo)
        .order('date', { ascending: false }),
    ]);

  const todayKcal = (mealLogsRes.data ?? []).reduce<number>((a, r) => a + (r.kcal ?? 0), 0);
  const todayProtein = (mealLogsRes.data ?? []).reduce<number>((a, r) => a + (r.protein_g ?? 0), 0);

  return {
    name: profile?.name || 'friend',
    goal: (profile?.goal ?? null) as string | null,
    kcalTarget: profile?.kcal_target ?? 2000,
    proteinTarget: profile?.protein_g ?? 120,
    carbsTarget: profile?.carbs_g ?? 230,
    fatTarget: profile?.fat_g ?? 70,
    waterMlTarget: profile?.water_ml_target ?? 2000,
    today: {
      date: today,
      kcal: todayKcal,
      protein_g: todayProtein,
      waterCups: hydrationRes.data?.cups ?? 0,
      supplements: (supplementsRes.data ?? []) as { name: string; taken: boolean }[],
    },
    recentSleep: (sleepRes.data ?? []) as {
      date: string;
      duration_min: number;
      score: number | null;
    }[],
  };
}

export function goalLabel(goal: string | null): string {
  switch (goal) {
    case 'feel_good':      return 'feel good overall';
    case 'lose_weight':    return 'lose a little weight gently';
    case 'build_strength': return 'build strength';
    case 'eat_better':     return 'eat better';
    case 'sleep_deeper':   return 'sleep deeper';
    default:               return 'feel good overall';
  }
}

export function describeContext(ctx: UserContext): string {
  const supplementSummary = ctx.today.supplements.length
    ? ctx.today.supplements
        .map((s) => `${sanitizeField(s.name, 40)}=${s.taken ? 'taken' : 'pending'}`)
        .join(', ')
    : 'none logged';

  const sleepSummary = ctx.recentSleep.length
    ? ctx.recentSleep
        .slice(0, 7)
        .map((s) => {
          const h = (s.duration_min / 60).toFixed(1);
          return s.score != null ? `${s.date}: ${h}h (score ${s.score})` : `${s.date}: ${h}h`;
        })
        .join('; ')
    : 'no logs yet';

  // User-supplied free-text (name, supplement labels) is wrapped in sentinel
  // tags. The system prompt instructs the model to treat anything inside these
  // tags as data, not instructions — neutralizing "ignore previous
  // instructions"-style injections planted in a profile field.
  return [
    `User profile:`,
    `  name: <user_data>${sanitizeField(ctx.name)}</user_data>`,
    `  goal: ${goalLabel(ctx.goal)}`,
    `  daily targets — kcal ${ctx.kcalTarget}, protein ${ctx.proteinTarget}g, carbs ${ctx.carbsTarget}g, fat ${ctx.fatTarget}g, water ${ctx.waterMlTarget}ml`,
    ``,
    `Today (${ctx.today.date}):`,
    `  kcal eaten: ${ctx.today.kcal} / ${ctx.kcalTarget}`,
    `  protein eaten: ${ctx.today.protein_g}g / ${ctx.proteinTarget}g`,
    `  water cups: ${ctx.today.waterCups}`,
    `  supplements: <user_data>${supplementSummary}</user_data>`,
    ``,
    `Last 7 nights sleep: ${sleepSummary}`,
  ].join('\n');
}

export { sanitizeField };
