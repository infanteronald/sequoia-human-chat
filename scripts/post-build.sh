#!/bin/bash
# Post-build: auto commit & push changes
cd /var/www/sequoiaspeed.com.co || exit 1

# Check if there are changes
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "[post-build] No changes to commit"
  exit 0
fi

# Stage tracked + new src files (never .env or uploads)
git add src/ next.config.ts package.json prisma/ public/*.xml 2>/dev/null
git add -u 2>/dev/null

TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
git commit -m "build: auto-commit after successful build — $TIMESTAMP

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push origin main 2>&1 && echo "[post-build] ✅ Pushed to GitHub" || echo "[post-build] ⚠️ Push failed"
