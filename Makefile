# Fitile — common commands. Run `make` (or `make help`) to see everything.
#
# Server-side targets read .env, which is git-ignored. Anything prefixed VITE_
# is bundled into the browser; server secrets must NOT carry that prefix.

SHELL := /bin/bash
.DEFAULT_GOAL := help
.PHONY: help install dev dev-local preview build build-pages deploy \
        verify typecheck lint test test-watch e2e e2e-report \
        apk apk-install android-open \
        db-migrate db-seed db-status db-reset \
        users allow-signup revoke-signup set-password \
        clean

# Loads .env into the recipe shell without letting make parse the values.
ENV := set -a; [ -f .env ] && . ./.env; set +a
DB_URL = postgresql://postgres@db.$$(echo "$$VITE_SUPABASE_URL" | sed -E 's\#https://([^.]+)\..*\#\1\#').supabase.co:5432/postgres?sslmode=require
PSQL = $(ENV); PGPASSWORD="$$SUPABASE_PROJECT_PASSWORD" psql "$(DB_URL)"

help: ## Show this help
	@echo ""
	@echo "  Fitile — make targets"
	@echo ""
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[1m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  Live app:  https://jyotirmay123.github.io/fittile/"
	@echo "  Sign in:   make users   (shows the allowed account)"
	@echo ""

# ---------------------------------------------------------------- setup / run

install: ## Install dependencies
	npm install

dev: ## Run locally against your Supabase account (real sign-in + sync)
	npm run dev

dev-local: ## Run with no cloud account: data stays in this browser only
	npm run dev -- --mode e2e

preview: build ## Serve the production build locally
	npx vite preview --port 4173

# ------------------------------------------------------------ build / deploy

build: ## Production PWA build (served from the domain root)
	npm run build

build-pages: ## Production build for the /fittile/ GitHub Pages subpath
	npm run build:pages

deploy: ## Publish the build to GitHub Pages (gh-pages branch)
	BASE_PATH=/fittile/ ./scripts/deploy-pages.sh

# ---------------------------------------------------------------- quality

verify: ## Full gate: unit tests, typecheck, lint, production build
	npm run verify

typecheck: ## TypeScript only
	npm run typecheck

lint: ## ESLint only
	npm run lint

test: ## Unit and component tests
	npm run test:run

test-watch: ## Unit tests in watch mode
	npm run test

e2e: ## Desktop + mobile browser journeys (runs in local-only mode)
	npm run test:e2e

e2e-report: ## Open the last Playwright report
	npx playwright show-report

# ---------------------------------------------------------------- android

apk: ## Build the debug APK and copy it to releases/
	npm run android:apk
	cp android/app/build/outputs/apk/debug/app-debug.apk releases/Fitile-debug.apk
	@echo "APK ready: releases/Fitile-debug.apk"

apk-install: ## Install the APK on a connected phone (needs adb + USB debugging)
	adb install -r releases/Fitile-debug.apk

android-open: ## Open the project in Android Studio
	npx cap open android

# ---------------------------------------------------------------- database

db-migrate: ## Apply every SQL migration to your Supabase project
	@$(ENV); PGPASSWORD="$$SUPABASE_PROJECT_PASSWORD" bash -c ' \
	  for m in supabase/migrations/*.sql; do \
	    echo "applying $$(basename $$m)"; \
	    psql "$(DB_URL)" -v ON_ERROR_STOP=1 -q -f "$$m" || exit 1; \
	  done; echo "migrations applied"'

db-seed: ## Seed the exercise catalog into Supabase
	@$(ENV); PGPASSWORD="$$SUPABASE_PROJECT_PASSWORD" bash -c ' \
	  node scripts/seed-exercises.ts | psql "$(DB_URL)" -v ON_ERROR_STOP=1 -q && echo "exercises seeded"'

db-status: ## Show row counts for your account
	@$(PSQL) -tAc " \
	  select 'profile:          ' || count(*) from public.profiles; \
	  select 'equipment:        ' || count(*) from public.user_equipment; \
	  select 'workouts:         ' || count(*) from public.workout_sessions; \
	  select 'sets logged:      ' || count(*) from public.set_logs; \
	  select 'recovery events:  ' || count(*) from public.recovery_events; \
	  select 'meals:            ' || count(*) from public.meal_entries; \
	  select 'activities:       ' || count(*) from public.activities; \
	  select 'exercises (ref):  ' || count(*) from public.exercises;"

db-reset: ## DANGER: erase all your logged data (keeps your login)
	@read -p "Erase all workouts, meals and activities? [y/N] " ok; \
	  [ "$$ok" = "y" ] || { echo "cancelled"; exit 1; }
	@$(PSQL) -q -c "truncate public.set_logs, public.recovery_events, \
	  public.soreness_checkins, public.workout_sessions, public.meal_entries, \
	  public.hydration_logs, public.activities, public.body_measurements, \
	  public.user_equipment, public.profiles cascade;"
	@echo "cleared — the app will start at onboarding again"
	@echo "note: also clear the site's browser data, which holds a local copy"

# ---------------------------------------------------------------- accounts

users: ## Show who can sign in, and who is allowed to register
	@$(PSQL) -tAc " \
	  select 'registered: ' || email || '   (confirmed: ' || \
	    coalesce(email_confirmed_at::date::text,'no') || ')' from auth.users; \
	  select 'allowed to sign up: ' || email from public.allowed_signups;"

allow-signup: ## Let an address register: make allow-signup EMAIL=you@example.com
	@[ -n "$(EMAIL)" ] || { echo "usage: make allow-signup EMAIL=you@example.com"; exit 1; }
	@$(PSQL) -q -c "insert into public.allowed_signups (email) values ('$(EMAIL)') on conflict do nothing;"
	@echo "$(EMAIL) may now create an account"

revoke-signup: ## Stop an address registering: make revoke-signup EMAIL=...
	@[ -n "$(EMAIL)" ] || { echo "usage: make revoke-signup EMAIL=you@example.com"; exit 1; }
	@$(PSQL) -q -c "delete from public.allowed_signups where lower(email) = lower('$(EMAIL)');"
	@echo "$(EMAIL) can no longer create an account"

set-password: ## Change your password: make set-password EMAIL=... PASSWORD=...
	@[ -n "$(EMAIL)" ] && [ -n "$(PASSWORD)" ] || \
	  { echo "usage: make set-password EMAIL=you@example.com PASSWORD=NewPass123!"; exit 1; }
	@$(ENV); bash -c ' \
	  id=$$(curl -s "$$VITE_SUPABASE_URL/auth/v1/admin/users?page=1&per_page=200" \
	        -H "apikey: $$SUPABASE_SECRET_KEY" -H "Authorization: Bearer $$SUPABASE_SECRET_KEY" \
	      | python3 -c "import sys,json;us=json.load(sys.stdin).get(\"users\",[]);print(next((u[\"id\"] for u in us if u[\"email\"].lower()==\"$(EMAIL)\".lower()),\"\"))"); \
	  [ -n "$$id" ] || { echo "no such user: $(EMAIL)"; exit 1; }; \
	  curl -s -X PUT "$$VITE_SUPABASE_URL/auth/v1/admin/users/$$id" \
	    -H "apikey: $$SUPABASE_SECRET_KEY" -H "Authorization: Bearer $$SUPABASE_SECRET_KEY" \
	    -H "Content-Type: application/json" \
	    -d "{\"password\":\"$(PASSWORD)\",\"email_confirm\":true}" >/dev/null; \
	  echo "password updated for $(EMAIL)"'

# ---------------------------------------------------------------- misc

clean: ## Remove build output and test artifacts
	rm -rf dist test-results playwright-report *.tsbuildinfo
	@echo "cleaned"
