# M1 Wiring — manual steps

M1 builds on M0 — the same `.env` + Supabase project keep working. Two new
things need a one-time human action:

## 1. Enable anonymous sign-in in Supabase

The auth gate auto-signs each new visitor in as an anonymous user so they can
own a `profiles` row before they ever pick an email/password. This needs to be
flipped on in the project.

1. Open your Supabase project dashboard.
2. **Authentication → Providers → Anonymous Sign-Ins**.
3. Toggle **Allow anonymous sign-ins** ON. Save.

If it's off, the `/(auth)/sign-in` screen surfaces the underlying error — the
app won't progress past sign-in until it's enabled.

> **Why anonymous, not email/password?** The plan ("Open questions / risks")
> recommends letting users complete onboarding without an account and prompting
> for credentials later. Anonymous sessions give us a real `auth.users.id` that
> RLS policies use, with zero friction. v1.1 can chain `linkIdentity()` to
> upgrade the account.

## 2. Re-push migrations (no-op if you already did)

Nothing new in `supabase/migrations/` since M0 — the M0 schema already includes
everything M1 reads/writes (`profiles`, `hydration_logs`, `supplement_logs`,
`meal_logs`). If you haven't yet:

```pwsh
supabase db push
npm run supabase:types   # commits a fresh lib/database.types.ts
```

> **Note:** `lib/database.types.ts` is currently a hand-typed mirror that adds
> the `Relationships: []` field postgrest-js requires for typed queries. Once
> you've run `supabase gen types typescript --linked`, the generated file is a
> drop-in replacement — keep the import path the same.

---

## Verifying M1

Boot:

```pwsh
npx expo start
```

Press **i** or **a**. The expected flow:

1. Splash → font load → sign-in screen (or directly into welcome if you already
   onboarded on this device).
2. Tap **Get started**. An anonymous Supabase session is created behind the
   scenes (visible in Supabase Studio → Authentication → Users as an anon row).
3. Step through onboarding: name → goal (5 cards) → rhythm (wake/sleep wheel
   pickers, live sleep-duration chip).
4. Summary shows calculated kcal + macros + wind-down + water. Tap **Take me
   home**.
5. A row appears in `public.profiles` (check Supabase Studio → Table editor).
   `lib/store/onboardingDraft` is reset; the `spring.onboarded` MMKV flag is
   written.
6. **Today** renders:
   - Hero with day-of-week + greeting + your name.
   - Energy ring animates from 0 → current intake (0% on day one, since no
     meals are logged yet — that lands in M2).
   - Macro bars animate (staggered).
   - Workout / sleep two-up cards show "coming soon" placeholders.
   - Hydration tap-to-increment writes to `hydration_logs`. **Kill the app and
     relaunch** — the cup count persists.
   - Supplements tap-to-check writes to `supplement_logs`.
7. **Settings → Sign out** signs out, clears local state, drops you back at
   sign-in. Tapping "Get started" again gives you a fresh anonymous user (and
   onboarding plays from the top).

## Known M1 notes / deferred

- **Carbs / fat consumed:** `meal_logs` only tracks kcal + protein at the SQL
  level (see migration). The macro bars for carbs/fat will stay at 0 until M2
  either extends the schema or derives values from `meal_plans` joined on
  `meal_logs.meal_plan_id`. Decide in M2.
- **Real sign-in (email/password):** the `(auth)/sign-in` screen only kicks
  off anonymous sign-in for now. v1.1 (post-M5) wires real credentials and
  identity linking — out of scope for the milestone plan.
- **Time picker on Android:** the in-house wheel picker uses `FlatList` with
  `snapToInterval`. On older Android devices, the first-render `initialScroll`
  can land off by one row — re-scroll snaps it. If that becomes a usability
  issue, swap for `@react-native-community/datetimepicker`.
- **Sleep card:** the prototype's "last night" sleep card is stubbed because
  `sleep_logs` has no data source until we wire HealthKit / Google Fit in
  post-v1.
- **Workout card:** stubbed until M3 lands the workout session schema.
