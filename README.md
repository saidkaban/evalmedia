# evalmedia playground

A self-hostable web app for comparing AI-generated media across models. Pick two or more image models, enter a prompt, and see the outputs side by side with synchronized zoom, blind A/B voting, and persistent history.

Part of the [evalmedia](https://github.com/saidkaban/evalmedia) project. The sister repo ships a Python SDK for programmatic evaluation; this repo is the interactive playground you run in a browser.

## What it does

- Compare N image models on the same prompt in parallel.
- Synchronized zoom and pan across all outputs so you can compare detail at full resolution.
- Blind A/B mode: model names are hidden while you vote, then revealed.
- Re-run a prompt with a new seed to test consistency.
- Session history and aggregate vote tallies across every comparison you have ever run, stored locally in SQLite.
- Provider-agnostic. Today it supports fal. Adding another backend means implementing one TypeScript interface.

Image generation is the only surface in v0. Video and audio comparison are on the roadmap, and the data model is already media-type aware.

## Self-host in three steps

You need [Docker](https://docs.docker.com/get-docker/) and a [fal.ai API key](https://fal.ai/dashboard/keys).

```bash
git clone https://github.com/saidkaban/evalmedia-playground
cd evalmedia-playground
cp .env.example .env   # then edit .env and paste your FAL_KEY
docker compose up -d
```

Open http://localhost:3000. The SQLite database lives in `./data/evalmedia.db` on the host and persists across restarts.

### Develop locally without Docker

```bash
pnpm install
cp .env.example .env   # add FAL_KEY
pnpm dev
```

## Getting a fal API key

1. Sign up at [fal.ai](https://fal.ai).
2. Go to [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) and create a key.
3. Paste it into the `FAL_KEY` field in your `.env` file.

Image generations are billed per call by fal; check current pricing on each model's page at [fal.ai/models](https://fal.ai/models).

## Adding or removing models

Models are a curated list in [src/providers/fal/models.ts](src/providers/fal/models.ts). Edit that file to add any model ID from [fal.ai/models](https://fal.ai/models), then rebuild the Docker image or restart the dev server.

## Adding a new provider

Implement the `Provider` interface in [src/providers/types.ts](src/providers/types.ts) and register it in [src/providers/registry.ts](src/providers/registry.ts). UI components never talk to a specific backend directly, so a new provider is self-contained.

## Project layout

```
src/
  app/            Next.js App Router: pages and API routes
  components/    React components (comparison view, sync viewport, UI primitives)
  providers/     Provider interface and implementations (FalProvider today)
  db/            Drizzle schema, SQLite client, and queries
  store/         Zustand client state
drizzle/          Generated SQL migrations, applied automatically on startup
```

## Where evalmedia-python fits in

[evalmedia (Python SDK)](https://github.com/saidkaban/evalmedia) is the programmatic surface: run scripted evaluations against a batch of prompts, score outputs against a reference set, integrate into a CI job. This playground is the interactive surface for the same problem. They share the evalmedia name and roadmap, but the two repos are independent.

A future version will let you surface Python-side scores (VLM judging, CLIP similarity, custom metrics) next to each output in the comparison grid. The UI already has a slot for it.

## Contributing

Issues and pull requests welcome. Please open an issue first for anything larger than a small fix so we can align on direction.

Commit style: [Conventional Commits](https://www.conventionalcommits.org). TypeScript strict mode, no `any` unless justified.

## License

[AGPL-3.0](LICENSE). Self-host freely. If you run a modified version as a hosted service, share your changes back under the same license.
