# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This monorepo contains two parallel implementations of the same app plus shared backend infrastructure:

```
chopwise-react/     # Primary: Expo/React Native PWA (TypeScript)
chopwise-flutter/   # Experimental: Flutter prototype (local-only, no backend)
supabase/           # Backend: migrations + Edge Function
  migrations/       # SQL applied via Supabase CLI
  functions/scan-meal/  # Deno Edge Function (Gemini Vision)
website/            # Static landing page
```

The React app is the active codebase. The Flutter prototype uses local storage only (SharedPreferences) and has no Supabase integration.

## chopwise-react — commands

Work from inside `chopwise-react/`:

```bash
cd chopwise-react
npm install          # install deps
npm start            # Expo dev server (choose web/iOS/Android from menu)
npm run web          # launch directly in browser
npm run build:web    # export static site to dist/
npm run typecheck    # tsc --noEmit (no test suite exists)
```

Deploy to Vercel (preview): the project is already linked (`.vercel/project.json`).

## chopwise-react — architecture

**Routing**: Expo Router (file-based). `app/(tabs)/` holds the five main screens (Today, History, Analytics, Camera, Profile). `app/scan.tsx` and `app/manual-log.tsx` open as modals from the tab bar.

**State**: Single Zustand store at `src/store/useMealStore.ts`. On `init()` it attempts a Supabase anonymous auth session; on failure it falls back to AsyncStorage. All reads and writes go through this store — components never call Supabase directly.

**Auth flow**:
- App always has a session: anonymous sign-in happens automatically on first launch.
- Google OAuth upgrade is optional (web uses `signInWithOAuth`; native uses `expo-auth-session` ID token flow). Implemented in `src/lib/auth.ts`.
- Sign-out calls `supabase.auth.signOut()` then re-runs `init()` to get a fresh anonymous session.

**Meal scanning**: `src/lib/vision.ts` encodes a photo to base64 and POSTs it to the `scan-meal` Supabase Edge Function. The function calls Gemini 2.0 Flash with a Ghanaian-food-expert system prompt and returns a JSON array. Results are cross-referenced against the local `src/data/ghanaian_foods.ts` lookup to override AI-guessed macros with WAFCT-sourced values.

**Food database**: `src/data/ghanaian_foods.ts` is the client-side food list (West African Food Composition Table data). The same data is seeded into `supabase/migrations/002_seed_foods.sql` for server-side use. `FoodItem.source` can be `'wafct' | 'recipe' | 'ai' | 'user'`.

**Offline-first**: When Supabase is unreachable, meals and profile fall back to AsyncStorage keys `foodiegh_offline_meals` / `chopwise_offline_profile`. The store writes to AsyncStorage only when the Supabase upsert fails.

**PWA**: `public/sw.js` is the service worker registered in `app/_layout.tsx` (web only). Static assets are pre-cached; the manifest is at `public/manifest.webmanifest`.

**Web layout**: On web the app is capped at 520 px wide and centered with a shadow, mimicking a phone shell. Background color differs between web (`#E9EEEB`) and native (`#F5F6F8`).

## Supabase

- Project: `jnmrrksubjqrhnlbcatb.supabase.co`
- Credentials live in `chopwise-react/app.json` under `expo.extra` (anon key only — safe to commit).
- `GEMINI_API_KEY` must be set as a Supabase secret for the Edge Function.
- Apply migrations: `supabase db push` (requires Supabase CLI and `supabase link`).
- Deploy Edge Function: `supabase functions deploy scan-meal`.

## chopwise-flutter

Standalone Flutter app with no Supabase connection. Uses `provider` + `SharedPreferences`. Run with `flutter run` from `chopwise-flutter/`. Not actively developed.
