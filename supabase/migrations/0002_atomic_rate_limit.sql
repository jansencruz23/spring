-- Atomic rate-limit increment.
--
-- The previous JS implementation did a read-then-upsert which was racy:
-- two concurrent requests could both read count=N, both compute N+1, and
-- both upsert — bypassing the limit.
--
-- This RPC performs the increment atomically inside Postgres. The row is
-- INSERT-ed on first hit in a window, or its count is incremented on
-- conflict. The RETURNING clause yields the post-increment count so the
-- caller can decide whether to admit the request.
--
-- Note: the RPC bumps count *even when over the limit* so subsequent
-- callers also see a high count. That's fine — limits are evaluated
-- against `max`, not the raw count.

create or replace function public.increment_rate_limit(
  p_user_id      uuid,
  p_bucket       text,
  p_window_start timestamptz
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.rate_limits (user_id, bucket, window_start, count)
    values (p_user_id, p_bucket, p_window_start, 1)
  on conflict (user_id, bucket, window_start)
    do update set count = public.rate_limits.count + 1
  returning count into new_count;

  return new_count;
end;
$$;

-- Service role calls this from Edge Functions; never callable by anon/auth.
revoke all on function public.increment_rate_limit(uuid, text, timestamptz) from public;
revoke all on function public.increment_rate_limit(uuid, text, timestamptz) from anon;
revoke all on function public.increment_rate_limit(uuid, text, timestamptz) from authenticated;
grant execute on function public.increment_rate_limit(uuid, text, timestamptz) to service_role;
