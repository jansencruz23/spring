# M2 Wiring — manual steps

M2 builds on M0 + M1. The same `.env` and Supabase project keep working —
there are **no new tables**, no new secrets, and no new dashboard toggles to
flip. Just install + boot.

## 1. No new migrations

The M0 schema already has both tables M2 needs:

- `meal_plans` — populated by the new in-app seeder (see below)
- `meal_logs` — the existing kcal + protein columns are enough; carbs + fat are
  derived by joining `meal_plans` on `meal_logs.meal_plan_id` at read time, per
  the M1 deferral note.

If you've already run `supabase db push` for M0, nothing else is needed.

## 2. The Mediterranean week is auto-seeded

On the first visit to the **Meals** tab in a calendar week, the app checks
`meal_plans` for the current Mon→Sun range. If empty, it inserts the seven-day
Mediterranean rotation defined in [`lib/api/seeds.ts`](lib/api/seeds.ts).

- Idempotent — re-tapping the tab is a no-op.
- One week at a time — next Monday, the next week gets seeded on first visit.
- Per user — RLS scopes the check to the signed-in user.

> **If you want a fresh seed:** delete this week's rows in Supabase Studio
> → Table editor → `meal_plans`, then re-open the Meals tab.

## 3. (Optional) Regenerate types

Nothing in the schema changed, so [`lib/database.types.ts`](lib/database.types.ts)
still matches. If you've since linked a real project and want the official
generator output:

```pwsh
npm run supabase:types
```

---

## Verifying M2

Boot:

```pwsh
npx expo start
```

Press **i** or **a**. The expected flow:

1. Open the **Meals** tab. On first visit this week, seeding kicks off — you'll
   see the spinner briefly, then 4 meals for today.
2. The **week selector** shows Mon–Sun with today's chip outlined in coral.
   Tap any day — the meals list switches to that day's plan with a fade-in
   stagger.
3. Tap the empty circle on any meal card. The check fills sage-green
   instantly (optimistic), the meal name gets a strike-through, and the
   "Logged 0 / 4" chip increments. Tap again to unlog.
4. Switch to the **Today** tab. The energy ring + macro bars now reflect the
   logged meal — carbs and fat are non-zero because the totals query joins
   `meal_plans` for the macros that aren't on `meal_logs`.
5. **Persistence check**: log a meal, kill the app (swipe away), relaunch.
   The check survives.
6. **Offline check**: turn airplane mode on, tap a check. The UI updates
   instantly. Turn airplane mode off — the mutation flushes (TanStack Query
   retries on reconnect via the persisted cache).

## Known M2 notes / deferred

- **Swap button** — the prototype's circular `swap` button on each card is
  intentionally absent. Per the plan it moves to M4 (it's an AI feature).
- **Shopping list** — the bottom CTA is a labeled stub. Real list generation
  is v1.1.
- **Custom meal planning / freeform logs** — Users can't add or edit meals in
  v1; only logging from the seeded plan is supported. Adding/editing belongs
  in a later milestone.
- **Carbs / fat for freeform logs** — `meal_logs` rows with `meal_plan_id`
  null contribute 0 carbs / 0 fat to the daily totals. Not a concern in v1
  (no freeform path). If/when we add freeform logging, either extend the
  schema or surface a "carbs unknown" treatment.
- **Week navigation** — the selector is the current week only. Prev/next
  week arrows can land in M5 polish if useful.
