# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc`) then build for production
- `npm run preview` — serve the production build locally

There is no test runner or linter configured. `tsc` (via `npm run build`) is the only automated check.

## Architecture

A client-only CRM SPA: Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router v7. There is no backend and no state management library.

- **Data layer**: all data is static mock data in [src/data/mock.json](src/data/mock.json), loaded and typed in [src/data/index.ts](src/data/index.ts). That module is the single access point — pages import `contacts`, `deals`, and helpers (`getContact`, `getDealsForContact`, `formatCurrency`) from `../data` rather than touching the JSON directly. Nothing is persisted; there are no mutations.
- **Domain types**: `Contact`, `Deal`, and `DealStage` live in [src/types.ts](src/types.ts). Contacts and deals are linked by `Deal.contactId`.
- **Routing**: routes are declared in [src/App.tsx](src/App.tsx), all nested under [src/components/Layout.tsx](src/components/Layout.tsx) (sidebar nav + `<Outlet />`). Pages live in [src/pages/](src/pages/), one component per route; `/contacts/:id` is the only parameterized route.
- **Styling**: Tailwind v4 via the `@tailwindcss/vite` plugin — there is no `tailwind.config.js`; [src/index.css](src/index.css) is just `@import "tailwindcss"`. The UI convention is a slate palette with indigo as the accent color.
- **Currency**: amounts are EUR, formatted through `formatCurrency` in the data module.
