# Claude Code conventions for evalmedia-playground

This file is consumed by Claude Code on every run. Keep it short, keep it
accurate, and update it when conventions change.

## What this repo is

A Next.js 16 (App Router) self-hostable web app for comparing AI-generated
media across models. Open source, AGPL-3.0. Companion to the evalmedia
Python SDK.

Primary working folder: the repo root. Entry point: `src/app/page.tsx`.

## Stack

- Next.js (App Router) + React 19, TypeScript strict
- Tailwind CSS v4 (CSS variables in `src/app/globals.css`)
- Zustand for client state (`src/store/`)
- SQLite via better-sqlite3 + Drizzle ORM (`src/db/`)
- fal via `@fal-ai/client` (server-side only)
- pnpm for package management

## Architecture rules

- **The fal API key never touches the browser.** All provider calls go
  through API routes in `src/app/api/`.
- **UI never imports a specific provider directly.** It calls the provider
  registry or hits an API route. New backends implement the `Provider`
  interface in `src/providers/types.ts`.
- **Media type is an enum (image | video | audio).** It lives in the data
  model and provider interface even though only image is implemented.
- **Prefer editing the curated model list over auto-discovery.** fal has
  no public listing endpoint. Add entries to `src/providers/fal/models.ts`.

## Style rules

- No em dashes in user-facing text (README, UI copy, error messages). This
  is a public open-source repo and em dashes read as AI-generated signal.
  In code comments they are fine.
- TypeScript strict; avoid `any`. If unavoidable, add a short comment
  explaining why.
- Keep dependencies minimal. No Redux. No full shadcn/ui install; copy
  the handful of primitives we actually use into `src/components/ui/`.
- Conventional commit messages, one logical change per commit.

## Self-hosting is the primary surface

The success criterion for any change is: someone clones the repo, copies
`.env.example` to `.env`, adds `FAL_KEY`, runs `docker compose up`, and
it works. Don't add steps that break this flow.

## Out of scope for v0

- Video and audio comparison. Architect for them; don't build them.
- Authentication. Self-hosted means the operator is the user. Network-
  level restriction (VPN, Cloudflare Access) is how multi-user works
  today. Auth lands with the managed cloud version.
- Automated scoring (VLM judges, CLIP). Leave a UI slot but don't wire
  it up.

## Running common commands

- `pnpm dev`: local dev server
- `pnpm build`: production build (also used by the Dockerfile)
- `pnpm exec drizzle-kit generate --name <name>`: generate a new SQL migration from schema.ts
- Migrations in `drizzle/` apply automatically on first DB access
