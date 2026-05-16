// Fixed-window rate limiter backed by `public.rate_limits`. The increment is
// performed by the `public.increment_rate_limit` SQL function so two concurrent
// requests cannot both read the same pre-increment count and bypass the limit.
// Service-role only — RLS blocks client writes; the RPC is granted to
// service_role only.

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.45.4';

const DEFAULT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function windowStartIso(windowMs: number): string {
  const now = Date.now();
  const start = Math.floor(now / windowMs) * windowMs;
  return new Date(start).toISOString();
}

export async function checkAndIncrementRateLimit(
  supabase: SupabaseClient,
  userId: string,
  bucket: string,
  max: number,
  windowMs: number = DEFAULT_WINDOW_MS,
): Promise<{ limited: boolean; remaining: number }> {
  const window_start = windowStartIso(windowMs);

  const { data, error } = await supabase.rpc('increment_rate_limit', {
    p_user_id: userId,
    p_bucket: bucket,
    p_window_start: window_start,
  });

  if (error) {
    // Fail closed: if the limiter is broken, treat the request as limited so a
    // bug here can't open the floodgates.
    console.error(JSON.stringify({
      event: 'rate_limit.rpc_error',
      bucket,
      userId,
      message: error.message,
    }));
    return { limited: true, remaining: 0 };
  }

  const count = typeof data === 'number' ? data : Number(data ?? 0);
  const limited = count > max;
  return { limited, remaining: Math.max(0, max - count) };
}
