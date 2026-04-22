# Design decisions

Short log of non-obvious choices made while scaffolding v0. Future contributors should feel free to overturn anything here, but please add an entry explaining why.

## Next.js 16, not 15

`create-next-app@latest` scaffolds Next.js 16.2 as of this writing. The original plan specified 15. 16 is the current stable release, keeps the App Router, and carries the Turbopack improvements we want anyway. The rest of the stack is unchanged.

## AGPL-3.0 over MIT

Self-host is the primary surface from day one, and we want to keep that surface open without losing the option of a managed cloud offering later. AGPL requires anyone hosting a modified version as a service to share their changes back, which protects the cloud offering while still allowing the typical "clone, add API key, run locally" workflow for everyone else. Same pattern Plausible and early Mattermost used.

## SQLite + Drizzle, not Postgres

A self-hosted playground for a single operator does not need a full Postgres install. SQLite is a single file, zero setup, and survives a container restart with a volume mount. Drizzle keeps the schema in TypeScript and generates migrations we ship as plain SQL.

Migrations are applied on first DB access rather than as a separate step, so `docker compose up` is all a user runs. This trades a tiny startup cost for one fewer step in the README.

## No full shadcn/ui install

Only Button, Checkbox, and Toggle are needed for v0. Copying them directly into `src/components/ui/` keeps the dependency surface small (just `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`) and avoids carrying a pile of unused primitives.

## Curated model list, not auto-discovery

fal does not expose a public model listing endpoint. We could scrape `fal.ai/models`, but it is brittle. A curated list in `src/providers/fal/models.ts` gives us honest defaults for my team's FERASET workflow (Nano Banana 2, Nano Banana Pro, FLUX variants) and is one file to edit when a new model ships. Self-hosters can fork or edit the list in-place.

## Synchronized viewport as a normalized `{x, y, scale}`

Images from different models often come back at different aspect ratios. Using absolute pixel offsets for zoom / pan would drift them relative to each other. Storing the viewport as normalized fractions of the image dimensions and clamping so edges never leave the container means all panes stay visually aligned on the same region of the subject.

## Parallel generation on the server, synchronous response

Generations are kicked off in parallel server-side and the response waits for all of them before returning. This keeps the API shape simple (no streaming / SSE / polling in v0) and matches how fal's SDK is used. The cost is one model stalling the whole response. If this becomes a real pain point, move to per-output streaming.

## No auth

Self-hosted v0 assumes one operator. Multi-user auth lands with the managed cloud version and will need its own schema migration on the sessions table. Flagged in `CLAUDE.md` so this does not get bolted on casually.

## Migrations applied at runtime, not at build

SQLite is created in the mounted `./data` volume, which only exists at runtime. Applying migrations at first-access means we do not need a separate migrate command in the Dockerfile or docker-compose.
