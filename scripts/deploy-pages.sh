#!/usr/bin/env bash
# Publishes the production build to the gh-pages branch of `origin`.
# Usage: BASE_PATH=/fittile/ ./scripts/deploy-pages.sh
set -euo pipefail

BASE_PATH="${BASE_PATH:-/fittile/}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VITE_BASE_PATH="$BASE_PATH" npm run build

# GitHub Pages serves 404.html for unknown paths; the SPA shell handles routing.
cp dist/index.html dist/404.html
# Stop Pages from stripping files that begin with an underscore.
touch dist/.nojekyll

WORKTREE="$(mktemp -d)"
git fetch origin gh-pages --quiet 2>/dev/null || true
if git show-ref --verify --quiet refs/remotes/origin/gh-pages; then
  git worktree add --quiet "$WORKTREE" -B gh-pages origin/gh-pages
else
  git worktree add --quiet --detach "$WORKTREE"
  git -C "$WORKTREE" checkout --orphan gh-pages
  git -C "$WORKTREE" rm -rq --cached . 2>/dev/null || true
fi

find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R dist/. "$WORKTREE"/
git -C "$WORKTREE" add -A
if git -C "$WORKTREE" diff --cached --quiet; then
  echo "gh-pages already up to date"
else
  git -C "$WORKTREE" commit -qm "deploy: publish Fitile build $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  git -C "$WORKTREE" push -q origin gh-pages
  echo "published to gh-pages"
fi

git worktree remove --force "$WORKTREE"
