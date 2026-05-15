# Spring

A warm, gentle wellness companion. Cross-platform (iOS + Android) React Native app
built on Expo, NativeWind, Supabase, and NVIDIA NIM.

See the original prototype in [`prototype/`](./prototype) and the full plan at
`C:\Users\ADMIN\.claude\plans\hi-can-you-convert-zazzy-eclipse.md`.

## Status

- **M0** (Foundation) — in progress. Scaffolding + theme + nav skeleton + Supabase migrations.
- M1–M5 — to come.

## First-time setup

See [M0-WIRING.md](./M0-WIRING.md) for the cloud accounts (Supabase, NIM, EAS) and
the commands to wire them up.

## Stack

- Expo SDK 52 (New Architecture on), Expo Router (file-based)
- NativeWind v4 (Tailwind on RN)
- Zustand (client state), TanStack Query + MMKV (server cache)
- Supabase (Postgres + Auth + Storage + Edge Functions)
- NVIDIA NIM via OpenAI-compatible endpoint inside an Edge Function (M4)
- Reanimated v3, Gesture Handler, react-native-svg, lucide-react-native
- Fonts: Fraunces (display) + Plus Jakarta Sans (body)

## Scripts

```
npm start              # expo start
npm run android        # expo run:android
npm run ios            # expo run:ios
npm run typecheck      # tsc --noEmit
npm run supabase:types # regenerate lib/database.types.ts
npm run supabase:migrate # supabase db push
```
