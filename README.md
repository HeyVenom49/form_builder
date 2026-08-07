# Form Builder

A TypeScript monorepo for building, sharing, and collecting responses from dynamic forms — similar in spirit to Typeform / Google Forms.

Package manager: **Bun**. Monorepo tooling: **Turborepo**.

## What's inside?

### Apps

| App | Role |
|-----|------|
| `apps/web` | Next.js frontend |
| `apps/api` | API server |

### Packages

| Package | Role |
|---------|------|
| `@repo/database` | PostgreSQL schema (Drizzle ORM), migrations, DB client |
| `@repo/trpc` | Shared tRPC setup |
| `@repo/services` | Domain services — **WIP / incomplete** |
| `@repo/eslint-config` | Shared ESLint config |
| `@repo/typescript-config` | Shared TypeScript config |

---

## Database (`@repo/database`)

Schema, enums, relations, and the first migration are in place.

### Stack

- **Drizzle ORM** + **drizzle-kit**
- **PostgreSQL** (`pg`)
- Soft deletes, timezone-aware timestamps, and Drizzle relational queries

### Setup

1. Copy / set root `.env` with `DATABASE_URL`.
2. From `packages/database`:

```sh
bun db:generate   # generate SQL from schema
bun db:migrate    # apply migrations
bun run dev       # Drizzle Studio
```

> **Note (external volumes / macOS):** AppleDouble `._*` files can break `db:generate` (`"Ma"... is not valid JSON`). Clean them first:

```sh
./cleanDotFile.sh packages/database
```

### Schema overview

```
users
 ├── accounts          (CREDENTIALS / GOOGLE / GITHUB)
 ├── sessions
 ├── auth_tokens        (EMAIL_VERIFICATION / PASSWORD_RESET)
 ├── themes
 └── forms
      ├── form_settings
      ├── form_collaborators   (EDITOR / VIEWER)
      ├── sections
      │    └── questions
      │         ├── question_options
      │         └── (logic source / target)
      ├── logic_rules
      ├── responses
      │    └── answers
      ├── files
      ├── analytics_events
      ├── share_links
      ├── webhooks
      │    └── webhook_deliveries
      └── templates (snapshot JSON + optional sourceFormId)
```

### Tables (20)

| Area | Tables |
|------|--------|
| Auth | `users`, `accounts`, `sessions`, `auth_tokens` |
| Forms | `forms`, `form_settings`, `form_collaborators`, `sections`, `questions`, `question_options`, `logic_rules` |
| Responses | `responses`, `answers`, `files` |
| Product | `themes`, `templates`, `share_links` |
| Ops | `analytics_events`, `webhooks`, `webhook_deliveries` |

### Key design choices

- **Auth split:** identity on `users`; passwords / OAuth tokens on `accounts`
- **Templates:** store a **JSON snapshot** (not a live form FK that cascades away)
- **Logic rules:** typed targets (`QUESTION` / `SECTION` / `FORM_END`) with a DB `CHECK` constraint
- **Answers:** unique `(responseId, questionId)`; question delete is `RESTRICT` to protect history
- **Soft-delete-safe uniques:** active email / username indexes on `users`
- **Relations:** full Drizzle `relations()` graph in `schema/relations.ts` for `db.query.*`

### Enums (selected)

| Enum | Values (summary) |
|------|------------------|
| `form_status` | `DRAFT`, `PUBLISHED`, `ARCHIVED`, `CLOSED` |
| `question_type` | text, choice, upload, rating, grids, … |
| `response_status` | `STARTED`, `COMPLETED`, `ABANDONED`, `PARTIAL` |
| `logic_operator` / `logic_action` | equals/contains/… · show/hide/jump/require/skip |
| `analytics_event` | form/question lifecycle + `FOCUS` / `BLUR` |
| `file_provider` | `LOCAL`, `S3`, `R2`, `CLOUDINARY`, `SUPABASE` |
| `theme_mode` | `LIGHT`, `DARK`, `SYSTEM` (on `users`) |
| `webhook_status` | `ACTIVE`, `DISABLED` |
| `collaborator_role` | `EDITOR`, `VIEWER` |
| `auth_token_type` | `EMAIL_VERIFICATION`, `PASSWORD_RESET` |
| `webhook_delivery_status` | `PENDING`, `SUCCESS`, `FAILED` |

Source of truth: `packages/database/schema/` · barrel: `packages/database/schema.ts`  
Initial migration: `packages/database/drizzle/0000_silent_triathlon.sql`

### Intentionally deferred

- Audit log table
- In-app notifications table  
  (add when collab / alerts UI starts; email + webhooks cover MVP)

---

## Monorepo scripts

From the repo root:

```sh
bun install
bun run dev          # turbo dev
bun run build
bun run lint
bun run check-types
bun run format
```

Filter an app/package:

```sh
bun exec turbo dev --filter=web
bun exec turbo check-types --filter=@repo/database
```

---

## Status

| Area | Status |
|------|--------|
| Database schema + relations + migration | Done |
| Services layer | Incomplete — not documented yet |
| API / web product features | In progress |

---

## Useful links

- [Drizzle ORM](https://orm.drizzle.team/)
- [Turborepo](https://turborepo.dev/docs)
- [Bun](https://bun.sh/docs)
