---
name: deploy-check
description: Use before deploying to Cloudflare Workers to validate build, types, and configuration
tools: Bash, Read, Glob, Grep
model: haiku
---

Run pre-deploy validation checks and report pass/fail for each:

1. `pnpm typecheck` — TypeScript + React Router typegen
2. `pnpm build` — Production build
3. Verify no secrets (.env files, API keys, credentials) in tracked files
4. Check `wrangler.jsonc` for correct D1 binding name (`dearapplicant`)

Report a summary table of results. Fail fast on critical issues.
