# M0 Wiring — manual steps

The M0 scaffold is in place, but three cloud accounts need a human at the
keyboard. These are one-time setups; once done, the app boots end-to-end.

## 1. Install dependencies

```pwsh
npm install
```

If `react-native-mmkv` complains about New Architecture, that's expected — MMKV 3.x is
New-Arch-only and the app is configured for it (`newArchEnabled: true` in `app.json`).

## 2. Supabase (account → project → migrations → types)

1. Create a free Supabase account at https://supabase.com.
2. Create a new project (region: closest to you).
3. From the project settings page, copy:
   - **Project URL** → put in `.env` as `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public key** → put in `.env` as `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Install the Supabase CLI: https://supabase.com/docs/guides/cli/getting-started
5. Link this repo to your project:
   ```pwsh
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
6. Push the migrations:
   ```pwsh
   supabase db push
   ```
7. Regenerate types and commit the result:
   ```pwsh
   npm run supabase:types
   git add lib/database.types.ts
   ```

## 3. NVIDIA NIM (chat — needed at M4, not M0)

1. Sign up at https://build.nvidia.com.
2. Create an API key.
3. Stash it as a Supabase secret (NOT a client env — never bundle it):
   ```pwsh
   supabase secrets set NIM_API_KEY=<your-key>
   ```

You can skip this entirely until M4. The chat tab is a stub in M0.

## 4. EAS (build — needed before shipping, not M0)

1. Install: `npm i -g eas-cli`
2. `eas login`
3. `eas init` — accept the slug, this writes the project ID into `app.json`.

You can skip this until you need a real device build (M5).

---

## Verifying M0

After steps 1 and 2 above:

```pwsh
npx expo start
```

Then press **i** (iOS sim) or **a** (Android emulator). The expected flow:

1. Splash screen (cream background) shows
2. Fonts load behind the splash
3. Splash hides, app boots into the **Today** tab
4. Bottom tab bar shows: Today / Meals / Train / Spring / Settings
5. Tap **Settings** → toggle dark mode → entire app re-colors (warm brown → cream)
6. Pick an accent swatch → coral channels re-tint live

If `npx expo start` works but the simulator fails:
- iOS: `npx expo run:ios` (one-time native build).
- Android: `npx expo run:android` (needs an emulator running or device plugged in).

---

## Known M0 notes / deferred decisions

- **Wellness/Sleep tab**: the prototype `NAV_ITEMS` lists a 4th "Wellness" tab (sleep
  icon) that the M0 plan replaced with "Settings". Decision deferred to M1 — either
  reinstate the Wellness tab and move Settings to a non-tab modal, or keep Settings
  as a tab and surface sleep on the Today screen.
- **`lib/database.types.ts`**: stub. Regenerate after `supabase link` (step 2.7).
- **Auth gate**: not wired in M0. The root layout drops straight into `(tabs)`.
  M1 adds the gate (no user → /(auth)/sign-in; user but no profile → /(onboarding)).
- **Live accent picker**: works for M0's purposes via `vars()` + CSS variables. If
  perf is bad at M5, swap to Unistyles per the plan's open trade-off.
