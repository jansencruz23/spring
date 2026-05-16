// Resolves the authenticated user from a request's Authorization header.
// Edge Functions are deployed with `verify_jwt = true` (see config.toml), so
// Supabase will reject unsigned requests at the gateway — this is a defensive
// second check that also yields the user_id we use to scope DB queries.

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export type AuthedUser = { id: string; email?: string | null };

export function createServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function resolveUser(
  req: Request,
  supabase: SupabaseClient,
): Promise<AuthedUser | null> {
  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}
