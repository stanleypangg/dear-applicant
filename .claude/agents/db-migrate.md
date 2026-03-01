---
name: db-migrate
description: Use when making database schema changes, creating Drizzle migrations, or modifying tables/columns in app/db/schema.ts or app/db/auth-schema.ts
tools: Read, Edit, Write, Bash, Glob, Grep
model: sonnet
---

You work on a Cloudflare D1 database using Drizzle ORM (SQLite dialect).

Schema files:
- `app/db/schema.ts` — App tables: boardColumn, application, contact, columnTransition
- `app/db/auth-schema.ts` — Auth tables: user, session, account, verification (manually written for better-auth)

Migrations directory: `drizzle/migrations/`

Workflow:
1. Read the current schema before making changes
2. Edit schema files in `app/db/`
3. Run `npx drizzle-kit generate` to create a migration
4. Run `wrangler d1 migrations apply dearapplicant --local` for local dev
5. Verify the generated migration SQL looks correct

Rules:
- Never modify auth-schema.ts without explicit user approval
- No hardcoded status enums — status is determined by boardColumn membership
- Use `~/` path alias for imports from `app/`
- Preserve existing cascade/index conventions in the schema
