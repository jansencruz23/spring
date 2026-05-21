# Spring

A warm, gentle wellness companion for iOS and Android. Onboarding → daily energy/macros/hydration → meal plans with AI swap → guided workouts → a streaming AI coach ("Ask Spring") that knows your day.

Built on Expo SDK 54, React Native 0.81, NativeWind v4, Supabase, and NVIDIA NIM.

---

## Stack at a glance

| Layer            | Pick                                                      |
|------------------|-----------------------------------------------------------|
| App framework    | Expo SDK 54 (managed, New Architecture on) + Expo Router  |
| UI               | NativeWind v4 (Tailwind on RN), Reanimated v4, lucide-react-native |
| Client state     | Zustand                                                   |
| Server cache     | TanStack Query + MMKV persister                           |
| Backend          | Supabase (Postgres + Auth + Storage + Edge Functions)     |
| AI               | NVIDIA NIM via OpenAI-compatible API, called from an Edge Function, streamed as SSE |
| Fonts            | Fraunces (display) + Plus Jakarta Sans (body)             |

---

## Quick start (≈ 20 min)

If you just want to clone and run, do these in order. The detailed sections below explain each step.

```powershell
# 1. install
git clone <repo-url>
cd Spring
npm install

# 2. environment
cp .env.example .env       # then edit .env — see "Environment variables"

# 3. supabase project (one-time)
$env:SUPABASE_ACCESS_TOKEN = "<personal-access-token>"
npx supabase link --project-ref <your-ref>
npx supabase db push
npx supabase secrets set NIM_API_KEY=<your-nvidia-key>
npx supabase functions deploy chat
npx supabase functions deploy meal-swap

# 4. run on a real device build (NOT Expo Go — see "Why a dev client")
npx expo run:android       # or run:ios
```

You're done when the app boots to onboarding, you can finish onboarding, log a meal, and "Ask Spring" streams a reply.

---

## Prerequisites

- **Node 20+** (LTS). `node -v` to check.
- **A package manager.** npm ships with Node; the project's lockfile is `package-lock.json`.
- **Git.**
- **Mobile dev environment** for whichever platform you target:
  - **Android:** Android Studio with an emulator OR a physical device with USB debugging.
  - **iOS:** Xcode 15+ (macOS only) OR a physical iPhone + Apple Developer account for a dev build.
- A **Supabase account** (free tier is fine) — https://supabase.com.
- An **NVIDIA NIM API key** (free tier) — https://build.nvidia.com → any model card → "Get API Key".

On Windows, all the commands below assume PowerShell. Replace `$env:NAME = "value"` with `export NAME=value` on macOS / Linux.

---

## Environment variables

Spring reads two `.env`-style files:

### 1. `.env` (project root) — client-side, bundled into the app

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

Both come from **Supabase dashboard → Project Settings → API**. The `EXPO_PUBLIC_` prefix tells Expo to bundle them into the client. **Anon key is safe to bundle** — it only grants access through RLS.

> ⚠️ **Never** put `NIM_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` here. Both must stay server-side.

### 2. Supabase secrets — server-side, lives on the Edge Function runtime

These are read by `Deno.env.get(...)` inside `supabase/functions/`. They are **not** your local `.env`. Set them on the project:

```powershell
npx supabase secrets set NIM_API_KEY=<your-nvidia-key>
# optional overrides
npx supabase secrets set NIM_MODEL=meta/llama-3.1-70b-instruct
npx supabase secrets set NIM_BASE_URL=https://integrate.api.nvidia.com/v1
```

Or via dashboard: **Project Settings → Edge Functions → Secrets**. Either way, **redeploy** the functions afterward so the new env propagates.

---

## Supabase setup (one-time)

### 1. Create and link the project

1. Create a project at https://supabase.com (free tier).
2. Generate a CLI access token at https://supabase.com/dashboard/account/tokens.
3. Link this repo to the project:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "<paste-token>"
npx supabase link --project-ref <your-project-ref>
```

> The browser-based `supabase login` flow sometimes fails with "Unable to create CLI sign-in session." The env-var path above skips that handshake entirely.

### 2. Apply migrations

```powershell
npx supabase db push
```

This applies every file under `supabase/migrations/` in order:

- `0001_initial.sql` — full v1 schema, RLS policies, indexes
- `0002_atomic_rate_limit.sql` — `increment_rate_limit()` Postgres function

> ⚠️ **The chat / meal-swap functions will return `429` until `0002` is applied.** The rate limiter calls `increment_rate_limit` and fails closed if the RPC doesn't exist.

### 3. Generate typed database client

```powershell
npm run supabase:types
git add lib/database.types.ts
```

Commit the result — `lib/supabase.ts` depends on it.

### 4. Deploy Edge Functions

```powershell
npx supabase functions deploy chat
npx supabase functions deploy meal-swap
```

Verify with:

```powershell
npx supabase functions list
npx supabase secrets list
```

---

## NVIDIA NIM setup

1. Sign up at https://build.nvidia.com (free).
2. On any model card (e.g. Llama 3.1 70B Instruct), click **Get API Key**. The free tier gives ~40 req/min — Spring's per-user rate limit (30/hr) is well inside that.
3. Set it as a Supabase secret (see [Environment variables](#environment-variables) above):

```powershell
npx supabase secrets set NIM_API_KEY=nvapi-xxxx
```

4. Redeploy the chat function so the worker re-reads env:

```powershell
npx supabase functions deploy chat
```

To swap models without changing code, set the `NIM_MODEL` secret. Defaults to `meta/llama-3.1-70b-instruct`. Other good picks: `meta/llama-3.3-70b-instruct`, `nvidia/llama-3.1-nemotron-70b-instruct`.

---

## Running the app

### Why a dev client (not Expo Go)

Spring uses **`expo/fetch`** for streaming SSE (the chat). Expo Go on recent releases ships without the streaming native module, so `response.body` is `null` and chat shows "chat response missing body". You need a real dev client:

```powershell
npx expo install expo-dev-client      # one-time
npx expo run:android                  # builds the dev client and installs on device/emulator
# or
npx expo run:ios
```

After the first build, day-to-day dev is just:

```powershell
npx expo start --dev-client
```

### iOS-specific

Requires macOS + Xcode. On first run:

```bash
npx expo run:ios
```

This generates `ios/` if absent and builds onto the simulator. Subsequent runs can use `npx expo start --dev-client` and press `i`.

### Android-specific

Need either an emulator running or a physical device with USB debugging on. First run:

```powershell
npx expo run:android
```

If the build fails with Gradle/JDK errors, ensure `JAVA_HOME` points at JDK 17 and Android Studio's SDK Manager has the build-tools for API 34 installed.

---

## Scripts

```
npm start                  # expo start
npm run android            # expo run:android (builds dev client)
npm run ios                # expo run:ios (builds dev client)
npm run typecheck          # tsc --noEmit — strict + noUncheckedIndexedAccess
npm run supabase:types     # regenerate lib/database.types.ts from the linked project
npm run supabase:migrate   # supabase db push
```

---

## Project layout

```
app/                  # Expo Router file-based routing
  _layout.tsx         # ThemeProvider, QueryClient, auth gate, font load
  (auth)/             # Sign-in / sign-up / forgot-password
  (onboarding)/       # 5-step onboarding flow
  (tabs)/             # Today, Meals, Workout, Chat, Settings

components/
  primitives/         # SpringCard, Heading, Icon, Field, ...
  home/               # EnergyRing, MacroBars, HydrationTracker, ...
  meals/              # MealCard, WeekSelector, SwapSheet
  workout/            # RestTimer, SetRow
  chat/               # ChatBubble, Composer, TrendCard, TypingDots
  onboarding/         # GoalCard, OnbStep, RhythmRow, ...

lib/
  supabase.ts         # typed Supabase client
  database.types.ts   # generated — do not edit
  api/                # query wrappers + TanStack Query hooks
  auth/               # session hook + helpers
  theme/              # palette + ThemeProvider + useTheme
  schemas/            # Zod schemas (shared with Edge Functions where possible)
  store/              # Zustand stores (onboarding draft, UI)
  workouts/           # default routine
  util/               # date helpers, etc.

supabase/
  config.toml         # local-dev project config
  migrations/         # numbered SQL migrations
  functions/
    _shared/          # auth, CORS, rate limiter, NIM client, context builder
    chat/             # streaming chat (SSE)
    meal-swap/        # one-shot JSON meal alternative

prototype/            # original web prototype (reference only)
```

---

## Common gotchas

These are the ones you're most likely to hit on first run. Each has bitten us during M0–M4.

### "chat response missing body"

You're using Expo Go or a stale dev client without the `expo/fetch` native module. Switch to a fresh dev client build: `npx expo run:android` / `run:ios`. The chat client imports `fetch` from `expo/fetch` for SSE streaming — RN's stock fetch returns `null` body.

### Chat returns `503 — chat unavailable: NIM_API_KEY not configured`

The key is in your **local** `.env`, but Edge Functions run on Supabase's servers and read **their** env. Set it as a Supabase secret:

```powershell
npx supabase secrets set NIM_API_KEY=<your-key>
npx supabase functions deploy chat
```

### Every chat returns `429` on the first try

You haven't applied migration `0002_atomic_rate_limit.sql`. Either run `npx supabase db push`, or paste the file into the dashboard SQL editor and click Run.

If you have a stale `rate_limits` row stuck at 30 from earlier testing, clear it:

```sql
delete from public.rate_limits where user_id = auth.uid();
```

### `supabase login` opens a browser that says "Unable to create CLI sign-in"

Known flake. Use a personal access token instead:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "<token from https://supabase.com/dashboard/account/tokens>"
```

Now `link`, `db push`, `secrets set`, etc. all work without `login`.

### `npm install` warns about peer dependencies / New Arch / react-native-mmkv

Expected. `react-native-mmkv` 3.x is New-Arch-only and `app.json` has `newArchEnabled: true`. As long as `npm run typecheck` is clean, you're fine.

### TypeScript can't find `expo/fetch` types

Make sure `node_modules/expo/fetch.d.ts` exists. If not, `npm install` again. The types are part of the `expo` package on SDK 50+.

### iOS / Android build fails on first `expo run:*`

Usually missing native toolchain:
- **iOS:** Xcode 15+, CocoaPods, run `cd ios && pod install`.
- **Android:** JDK 17, Android SDK 34 build-tools, accept SDK licenses (`sdkmanager --licenses`).

---

## Verifying everything works

After you've finished setup, a complete smoke test:

1. `npm run typecheck` → exit 0, no errors.
2. `npx expo run:android` (or `run:ios`) → app builds and installs.
3. App opens to **Welcome** → finish onboarding → land on **Today** tab.
4. Tap **Settings** → toggle dark mode → entire UI re-tints. Pick a different accent swatch → coral channels live-update.
5. **Meals** tab → tap a meal → confirm it logs and the macro bars on **Today** update.
6. **Train** tab → start a session → log a set → rest timer counts down → pause → wait 10s → resume; timer should resume from where it paused (not from 10s earlier).
7. **Spring** tab → tap a suggested chip OR type a message → tokens stream in within ~1s → reply appears as a coral bubble → message persists across app reload.

If any step fails, jump to the matching section in [Common gotchas](#common-gotchas).

---

## What's where in the milestones

| Milestone | Surface                                       | Status |
|-----------|-----------------------------------------------|--------|
| M0        | Scaffold, theme, nav, migrations              | ✅ done |
| M1        | Onboarding + Today + EnergyRing + Hydration   | ✅ done |
| M2        | Meals (weekly selector, log toggle)           | ✅ done |
| M3        | Workout (active session, rest timer)          | ✅ done |
| M4        | AI chat (SSE) + meal swap                     | ✅ done |
| M5        | Polish, dark-mode QA, accent picker, EAS prod | ⏳ next |

Per-milestone wiring notes live in `M0-WIRING.md`, `M1-WIRING.md`, `M2-WIRING.md`. The architecture & open trade-offs are in the original plan.

---

## Contributing

- Work on a branch — `main` is protected by convention.
- Run `npm run typecheck` before pushing.
- Edge Function changes need a redeploy: `npx supabase functions deploy <name>`.
- Migrations are numbered (`0003_*.sql`, `0004_*.sql`, …) and always additive — never edit a migration that's been pushed.
- After schema changes, regenerate `lib/database.types.ts` and commit it in the same PR.

---

## License

TBD.
