# Supabase

This directory holds Spring's Supabase project config, migrations, and Edge Functions.

## Layout

- `config.toml` — local-dev project config (port assignments, auth settings, function flags).
- `migrations/` — SQL migrations applied in order. `0001_initial.sql` creates the full v1 schema + RLS policies.
- `functions/_shared/` — Auth, rate-limit, NIM client, and context-builder shared between Edge Functions.
- `functions/chat/` — Streaming chat Edge Function (NIM via OpenAI SDK → SSE).
- `functions/meal-swap/` — Meal-swap suggestion Edge Function (NIM JSON).

## First-time setup

See [../M0-WIRING.md](../M0-WIRING.md) for the manual steps to create the cloud project and link it to this repo.

## Regenerating types

```
npm run supabase:types
```

This writes `lib/database.types.ts`. **Commit the result** — the typed `supabase` client depends on it.

## Schema overview

| Table             | Notes                                   |
|-------------------|-----------------------------------------|
| profiles          | One row per user                        |
| meal_plans        | Planned meals per day/slot              |
| meal_logs         | Actual logged meals                     |
| hydration_logs    | Cups per day (composite PK)             |
| supplement_logs   | One row per supplement per day          |
| workout_sessions  | Workout sessions with start/end times   |
| workout_sets      | Sets within sessions                    |
| sleep_logs        | Duration + score per day                |
| chat_threads      | Chat conversation roots                 |
| chat_messages     | Individual chat turns (server-write)    |
| rate_limits       | Per-user buckets (server-write)         |

All tables have RLS enabled with `auth.uid() = user_id`. `chat_messages` and `rate_limits` are server-write only (Edge Function uses the service role key).
