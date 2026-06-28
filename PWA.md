# ChopWise PWA

The Expo Router app exports as a static, installable progressive web app.

## Local development

```bash
npm run web
```

## Production build

```bash
npm run typecheck
npm run build:web
```

The deployable output is written to `dist/`. Host that directory on an HTTPS
provider such as Vercel, Netlify, or Cloudflare Pages. HTTPS is required for
camera access and installation outside localhost.

## Secure meal scanning

Meal photos are sent to the Supabase Edge Function in:

```text
../supabase/functions/scan-meal/index.ts
```

Deploy it and configure the Gemini key as a server-side secret:

```bash
supabase secrets set GEMINI_API_KEY=your_key
supabase functions deploy scan-meal
```

Do not put the Gemini key in `app.json` or any `EXPO_PUBLIC_*` variable.
