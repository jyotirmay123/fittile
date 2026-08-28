# Fitile setup and operating costs

## 1. Web and PWA

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

For production, run `npm run build` and publish the `dist/` directory on any HTTPS static host. HTTPS is required for production service workers and install prompts. Configure the host to fall back unknown routes to `index.html`.

## 2. Supabase synchronization and Google sign-in

1. Create a Supabase project in the EU region if German/EU data residency is preferred.
2. Install the Supabase CLI, authenticate, and link this repository to the project.
3. Apply `supabase/migrations/202608280001_core_schema.sql`, `202608280002_rls.sql`, and `202608280003_reference_catalog.sql` in order (or run `supabase db push`).
4. Copy the Project URL and publishable/anon key into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Never put the service-role key in a browser or APK.
5. In Google Cloud Console, create an OAuth consent screen and OAuth web client. Add the Supabase callback URL shown under Authentication → Providers → Google to Google’s authorized redirect URIs.
6. Add the Google client ID and secret to Supabase’s Google provider. Add the deployed Fitile URL and `/auth/callback` to Supabase’s site and redirect URL allow-list.

Fitile uses PKCE, persistent sessions, row-level-security policies tied to `auth.uid()`, a local operation outbox, retries, and conflict copies. A signed-in user’s records are therefore synchronized privately between laptop PWA and Android app whenever connectivity returns.

For an Android production release, register the final package/signing SHA configuration required by your Google OAuth setup and test the deep-link callback `app.fittile.health://auth/callback` on a physical device.

## 3. Edge functions and optional AI

Deploy `food-lookup`, `ai-workout`, and `analyze-food-photo` from `supabase/functions/`. Set secrets on the server, never as `VITE_` client values:

```bash
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set OPENAI_MODEL=gpt-5.6-luna
supabase functions deploy food-lookup
supabase functions deploy ai-workout
supabase functions deploy analyze-food-photo
```

The OpenAI key is optional. Deterministic recommendations remain the default and require no AI fee. AI workout output is schema-validated and rejected when it violates equipment or recovery constraints. Food-photo output is itemized, confidence-labelled, editable, and saved only after confirmation.

`USDA_API_KEY` is reserved in `.env.example` for a future FoodData Central fallback and is not required by V1.

## 4. Food barcodes

EAN lookup uses the free, crowdsourced Open Food Facts API. Product values can be incomplete, so Fitile makes them editable. For production, replace the placeholder contact in the function’s `User-Agent` with a monitored project contact and submit Open Food Facts’ API usage form.

The official API currently limits direct product reads to 15 requests/minute/IP and search to 10 requests/minute/IP. Fitile caches product reads for 14 days. See [Open Food Facts API guidance](https://openfoodfacts.github.io/openfoodfacts-server/api/).

## 5. Android APK

Requirements: Android SDK API 36/build-tools 35 and JDK 21.

```bash
npm run android:sync
JAVA_HOME=/path/to/jdk-21 npm run android:apk
```

The debug APK is produced at `android/app/build/outputs/apk/debug/app-debug.apk`. Install it with Android Studio or `adb install -r <apk>`. Camera permissions are requested only when needed. Health Connect has a typed import boundary and deterministic deduplication in V1; connecting that boundary to a production Health Connect permission screen remains device-specific release configuration.

For Play Store distribution, generate a private release keystore, keep it outside Git, configure release signing, build an `.aab`, and complete Play Console privacy/data-safety declarations. The committed debug APK must not be submitted to the store.

## 6. Cost expectations (checked 28 August 2026)

| Component | V1 choice | Expected starting cost |
|---|---|---|
| Local PWA/APK | Browser + device storage | Free |
| Supabase | Auth, Postgres, Edge Functions | Free tier includes 50,000 MAU, 500 MB database, 1 GB storage, 5 GB egress, and 500,000 function calls; Pro starts at $25/month. [Official billing](https://supabase.com/docs/guides/platform/billing-on-supabase) |
| Google OAuth | Sign-in identity | No per-login application fee; Google Cloud project/configuration is required |
| Open Food Facts | Barcode nutrition | Free/open data, subject to attribution, identification, and rate limits |
| OpenAI | Optional AI coach/photo estimates | Usage-based; the configured cost-sensitive `gpt-5.6-luna` is currently listed at $0.20/M input tokens and $1.20/M output tokens. [Official models](https://platform.openai.com/docs/models) |
| Hosting/domain | Static PWA | Many hosts have free tiers; a custom domain is optional and separately priced |
| Google Play | Store distribution | Developer registration/signing requirements are separate from this source build |

Prices and quotas change; verify linked official pages before budgeting a public launch.
