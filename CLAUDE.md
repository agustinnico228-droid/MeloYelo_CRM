# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

The **MeloYelo CRM Hub** — a Next.js 15 (App Router, TypeScript) app that
consolidates the MeloYelo team's CRM work into one interface. The full build
specification (v2) is the authoritative brief; the previous Vite mock-data
prototype is preserved on the `archive/vite-prototype` branch.

## Commands

- `npm run dev` — Vite-free: Next dev server with Turbopack
- `npm run build` — production build (also the type-check gate)
- `npm test` — unit tests (Vitest, added in Phase 4; domain logic only)

## Hard rules (from the spec — never break these)

1. **All writes go through the Apps Script `HubApi.gs` endpoint.** Never
   write cells to the Google Sheet directly from this app.
2. **Never rename, reorder, add or remove a column in `All data`** — Zapier,
   Looker and Apps Script bind to exact header names. Map by header name,
   not column index.
3. **Stage changes are forward-only** in the canonical nine-stage order.
4. **Notes are append-only** — timestamped, attributed entries.
5. Existing Apps Script functions are never modified; new server behaviour
   is added alongside them.
6. Build and test against the **working copy** sheet
   (`17xpNY8t5GVAikMQRMc-MpnxJAqk6-JU4G2zAkacFG6I`), never production,
   until sign-off.

## Architecture

- **Read path**: Google Sheets API v4 via a read-only service account,
  server-side only, cached (60s `All data`, 10min lookups), validated with
  zod row-by-row. Row-level filtering by `Agent Email` happens on the
  server — an agent's browser never receives another agent's records.
- **Write path**: Next.js server → Apps Script Web App (`HubApi.gs`), shared
  secret from Secret Manager. Every write is also audited in Postgres.
- **CMS**: Payload 3 on Postgres (content + audit log only, never customer
  data), media on GCS.
- **Auth**: Google OAuth restricted to `@meloyelo.nz`; roles (`agent`,
  `ride_guide`, `manager`, `admin`) resolve server-side from the `Agents`
  tab plus env override lists.

## Brand

Tokens live in `src/app/globals.css` (`@theme`). Yellow `#FFDE00` is a
surface/accent only — text on yellow is always ink `#14161A`, never white.
16px is the hard floor for text; touch targets ≥ 48px; one shadow
(`shadow-card`). Display font is Heebo 700 pending a Bikys Heading licence
(see `public/fonts/README.md`).

## Decisions already made

- Hub-created leads use `Source = AgentForm` (existing value; §18.4).
- No Bikys licence yet → Heebo 700 display fallback, flagged (§18.1).
- Credentials are wired via `.env.local` / Secret Manager as phases need
  them; `.env.example` documents every variable.
