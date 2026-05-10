# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — local dev server on :3000
- `npm run build` — production build (also runs type-check + lint during the "Linting and checking validity of types" step)
- `npm run start` — serve the built app
- `npm run lint` — ESLint (`next/core-web-vitals`)
- `npx tsc --noEmit` — TypeScript-only check, faster than a full build when iterating on types

There's no test runner configured — don't invent one. If you add tests, choose the stack first and update this file.

## Environment

Works without env vars — `src/lib/redis.ts` transparently falls back to a process-local `Map`. That fallback is **not** shared across serverless invocations, so any deployment must set:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

When changing persistence behavior, test both paths (with and without the env vars set locally).

## Architecture

Single Next.js 14 App Router app. Three concerns worth knowing up front:

**1. The "time machine" pipeline (`src/lib/wayback.ts` → `src/app/api/random/route.ts` → `src/components/TimeMachine.tsx`).**
`randomArchivedPage` shuffles `SEED_DOMAINS` from `src/lib/seeds.ts`, then iterates up to 8 domains calling the Internet Archive CDX server. The CDX query requires **multiple `filter=` parameters**, which `URLSearchParams` would coalesce — `wayback.ts` builds the query string by hand. Don't "clean that up" by reverting to `URLSearchParams` unless you also handle the multi-value filters.
Individual domain failures are swallowed; only if every attempt fails does the route return 503. The client retries by asking the user to click again.

**2. Persistence layer (`src/lib/redis.ts`).**
Exports a `store()` function returning a narrow `StoreLike` interface (`incr`, `get`, `lpush`, `lrange`, `llen`). Two implementations: real Upstash client when env vars are present; in-memory `Map` stashed on `globalThis` otherwise. All API routes go through this — **never import `@upstash/redis` directly from route handlers**, because that breaks the dev fallback. If you need a new Redis op, add it to `StoreLike` and implement both variants.

**3. CRT visual system (`src/app/globals.css` + `src/components/CrtOverlay.tsx`).**
The retro look is entirely CSS/SVG — no images. `CrtOverlay` renders a fixed, `pointer-events: none` stack (fringe → noise → scanlines → vignette) once in `layout.tsx`. Reusable styles live in `globals.css` as classes (`retro-button`, `retro-panel`, `retro-input`, `pixel-title`, `name-glitch`, `digit-reel`) — prefer those over re-implementing the bevels in Tailwind utilities. The `@media (max-width: 640px)` block drops the heaviest layer on mobile; respect that when adding new effects.

## Runtime

All three API routes (`/api/visit`, `/api/random`, `/api/names`) declare `runtime = "edge"`. `@upstash/redis` and `fetch`-based CDX calls both work on Edge; if you need Node-only APIs (filesystem, `crypto.createHash`, etc.), switch that specific route to `runtime = "nodejs"` rather than breaking the others.

The Hall page (`src/app/hall/page.tsx`) is a **server component** that pre-fetches entries through `store()` and passes them as `fallback` to the client `NameSky`. `NameSky` then re-fetches from `/api/names` to pick up anything submitted after the page was rendered. That dual-path is intentional — server render gives a populated first paint, client refresh stays live.

## Fonts

Loaded via `next/font/google` in `layout.tsx` — `Press Start 2P` (`--font-press-start`) for pixel titles, `VT323` (`--font-vt323`) for body terminal text. Both are exposed as CSS variables so Tailwind's `font-pixel` / `font-terminal` classes resolve to them. Don't add a second font loader or link tag — `next/font` self-hosts these to avoid CLS and the Google Fonts network call.

## Data model

Only two keys in Redis, defined in `src/lib/redis.ts` as `KEYS`:
- `edgewander:visitors` — string counter (`INCR`)
- `edgewander:names` — list of JSON-stringified `{name, message, at}` (`LPUSH` newest to the front)

`src/lib/names.ts` sanitizes inputs by stripping ASCII control characters (preserving CJK and emoji) and capping lengths. Apply the same sanitization anywhere new user input enters the store.

## Conventions

- Path alias: `@/*` → `src/*` (configured in `tsconfig.json`)
- Client components must start with `"use client"`. Server components do Redis reads directly; client components go through `fetch("/api/...")`.
- The Chinese and English labels in the UI are intentional bilingual — keep both when editing copy.
