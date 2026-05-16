import { AuthError } from '@supabase/supabase-js';

/**
 * Maps Supabase auth errors (and generic throwables) to a single user-facing
 * line. Supabase returns errors as `AuthError` instances with a `.message`
 * that is already friendly enough for most cases — we only rewrite a few
 * well-known messages and pass everything else through.
 */
export function formatAuthError(err: unknown): string {
  if (err instanceof AuthError || err instanceof Error) {
    const msg = err.message;
    if (/invalid login credentials/i.test(msg)) {
      return 'That email and password don’t match. Try again.';
    }
    if (/user already registered/i.test(msg) || /already been registered/i.test(msg)) {
      return 'An account with that email already exists. Try signing in.';
    }
    if (/email not confirmed/i.test(msg)) {
      return 'Confirm your email first — check your inbox.';
    }
    if (/password should be at least/i.test(msg)) {
      return msg;
    }
    if (/network/i.test(msg) || /fetch/i.test(msg)) {
      return 'Couldn’t reach Spring just now. Check your connection and try again.';
    }
    return msg;
  }
  return 'Something went wrong. Try again in a moment.';
}
