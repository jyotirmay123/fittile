# Fitile

Fitile is a user-owned fitness and nutrition companion delivered as an installable PWA and Android app. It combines adaptive home-gym programming, set logging, muscle recovery estimates, activity tracking, barcode/photo food logging, progress views, email/password sign-in, automatic cross-device sync, and complete JSON/CSV export.

**Live app:** https://jyotirmay123.github.io/fittile/

The deterministic coach is the default. An optional AI coach can propose variety, but every AI result is validated against the same equipment, recovery, and safety constraints before it is shown.

## Included in V1

- Push/pull/legs, upper/lower, full-body, and fresh-muscle workout generation
- Adjustable dumbbells (5–25 kg), adjustable bench, bench cables, twister, and treadmill catalog; custom equipment is supported
- In-workout weight/repetition/set logging, rest timer, and progressive-overload guidance
- Muscle readiness and recovery visualization with soreness constraints
- Meals, calories, macros, micronutrient-ready data, Open Food Facts barcodes, and editable photo estimates
- Walking/running/manual activities, estimated energy expenditure, and weekly progress
- Offline-first IndexedDB storage, a synchronization outbox, conflict handling, Supabase RLS, and email/password auth
- Cross-device restore: signing in on a new device pulls the account back down before the app decides you are a new user
- Versioned JSON restore/export and readable CSV exports
- Installable PWA, generated service worker, Android Capacitor wrapper, and camera integration

## Run locally

```bash
make install
cp .env.example .env      # add your Supabase URL + publishable key
make dev                  # http://localhost:5173
```

`make` on its own lists every command (run, build, test, deploy, APK, database
and account management). `make dev-local` runs without a cloud account if you
just want to poke at the app.

Without Supabase values Fitile runs in local-only mode: everything works, but data
stays on that device. Anything prefixed `VITE_` is bundled into the browser, so
server secrets must never carry that prefix. See [setup](docs/setup.md) for cloud
sync, server functions, PWA hosting, and Android builds.

### Deploying

```bash
BASE_PATH=/fittile/ npm run deploy   # builds and publishes to the gh-pages branch
```

`VITE_BASE_PATH` keeps the router, manifest, and service worker correct when the
app is served from a project subpath.

### Single-owner deployments

The published build ships the Supabase publishable key, which is expected: Row
Level Security scopes every row to its owner. To keep a public deployment usable
by only you, `supabase/migrations/202608290001_signup_allowlist.sql` adds a
trigger that refuses to create any account whose email is not in
`public.allowed_signups`. Add an address to that table to let someone else in.

## Quality gates

```bash
npm run verify      # unit tests, typecheck, lint, production build
npm run test:e2e    # desktop + mobile browser journeys
```

Browser journeys run against local-only mode (`.env.e2e`) so they never touch a
live account.

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
