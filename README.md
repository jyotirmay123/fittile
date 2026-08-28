# Fitile

Fitile is a user-owned fitness and nutrition companion delivered as an installable PWA and Android app. It combines adaptive home-gym programming, set logging, muscle recovery estimates, activity tracking, barcode/photo food logging, progress views, Google sign-in, automatic cross-device sync, and complete JSON/CSV export.

The deterministic coach is the default. An optional AI coach can propose variety, but every AI result is validated against the same equipment, recovery, and safety constraints before it is shown.

## Included in V1

- Push/pull/legs, upper/lower, full-body, and fresh-muscle workout generation
- Adjustable dumbbells (5–25 kg), adjustable bench, bench cables, twister, and treadmill catalog; custom equipment is supported
- In-workout weight/repetition/set logging, rest timer, and progressive-overload guidance
- Muscle readiness and recovery visualization with soreness constraints
- Meals, calories, macros, micronutrient-ready data, Open Food Facts barcodes, and editable photo estimates
- Walking/running/manual activities, estimated energy expenditure, and weekly progress
- Offline-first IndexedDB storage, synchronization outbox, conflict handling, Supabase RLS, and Google OAuth
- Versioned JSON restore/export and readable CSV exports
- Installable PWA, generated service worker, Android Capacitor wrapper, and camera integration

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Supabase environment values, Fitile intentionally starts in local demo mode. See [setup](docs/setup.md) for cloud sync, Google sign-in, server functions, PWA hosting, and Android builds.

## Quality gates

```bash
npm run verify
npm run test:e2e
```

The ready-to-install development APK is at [releases/Fitile-debug.apk](releases/Fitile-debug.apk). It is debug-signed for personal testing; Play Store distribution needs a release keystore and an Android App Bundle.

## Data and safety

Fitile’s recovery, calorie, and nutrition values are estimates—not medical advice or measurements. Users can edit source data and export all records. See [privacy and data ownership](docs/privacy.md).

## Architecture

- React + TypeScript + Vite PWA
- Dexie/IndexedDB local source of truth and outbox sync
- Supabase Auth/Postgres/Edge Functions with row-level security
- Capacitor Android shell and native camera
- Open Food Facts for EAN product lookup
- Optional OpenAI Responses API for constrained workout alternatives and food-photo estimation

The approved product design and implementation plan are retained under `docs/superpowers/`.
