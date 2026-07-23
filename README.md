# MeloYelo CRM Hub

One app where the MeloYelo team does all their CRM work. Leads arrive, get
assigned, get called, get updated and get reported on — from a single
interface with MeloYelo branding. The Google Sheet keeps being the storage
engine behind the scenes, Apps Script keeps owning the business rules, and
Zapier and Looker keep running — reached from inside the app.

**If this app goes down, nothing breaks.** The CRM keeps running on its
existing rails. That's a feature.

## What's inside

| Page | What it does |
|---|---|
| **Today** (`/`) | Announcements, leads needing action now (one tap to call), pipeline bar, month stats |
| **Leads** (`/leads`) | Cards on the phone, spreadsheet-style editable grid on the laptop; search, filters, CSV export |
| **Lead record** (`/leads/…`) | Call/email, forward-only stage changer, add note, inline edits, timelines, reassign (managers) |
| **Add lead** (`/leads/new`) | Replaces the Google Form; shows which agent the postcode routes to |
| **Pipeline** (`/pipeline`) | Nine-stage board (read-only in v1) |
| **Dashboards** (`/dashboards`) | Looker Studio embedded, role-gated |
| **Guides / Known issues** | Written in the admin, no developer needed |
| **Ride Guide queue** (`/ride-guide/queue`) | Emma's calling list: website leads only, guided call flow with one-tap outcomes |
| **View as agent** (`/view-as`) | Managers see exactly what an agent sees — read-only, banner always visible, audited |
| **Content pages** (`/news`, `/conference`, `/campaigns`, `/growth/…`) | The whole intranet, ported into the CMS and editable without a developer |
| **System** (`/system`) | Managers' "where is everything" page: intake, Zapier, Apps Script, data health, pending unsubscribes |
| **Admin** (`/admin`) | Payload CMS — pages, guides, dashboards, campaigns, announcements, media, navigation, audit log |

## Running it on your machine

You need Node 22+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

With an empty `.env.local` plus a `DEV_FAKE_USER_EMAIL`, the app runs on
**built-in sample data** — no Google account, sheet or database needed.
That's on purpose: every screen can be tried before any credentials exist.

```bash
npm test             # unit tests for the business rules
npm run build        # production build (also the type check)
```

## Connecting the real things (one at a time, any order)

Everything is configured in `.env.local` (development) or Secret Manager
(Cloud Run). `.env.example` documents every variable. Each integration
lights up when its variables are set; until then the app degrades
gracefully.

1. **Google sign-in** — create an OAuth client for the meloyelo.nz
   Workspace, set `AUTH_GOOGLE_ID/SECRET/AUTH_SECRET`, list managers in
   `MANAGER_EMAILS` etc. Only `@meloyelo.nz` accounts can sign in.
2. **The sheet (read)** — create a service account, share the **working
   copy** sheet with it as Viewer, set `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64`
   (the key JSON, base64-encoded). Agents' roles then resolve from the
   Agents tab.
3. **The write endpoint** — follow `apps-script/README.md` to add
   `HubApi.gs` to the sheet's bound script project and set
   `HUB_API_URL` + `HUB_API_SECRET`. Until then, dev writes go to the
   in-memory sample data.
4. **The CMS** — a Postgres database (`DATABASE_URI`) + `PAYLOAD_SECRET`
   turns on `/admin`, announcements, guides, known issues and the audit
   log. `npm run seed` creates the first admin user and starter content.
   Media uploads go to GCS when `GCS_BUCKET` is set.
5. **Dashboards** — paste the Looker report URLs into Admin → Settings
   (or the `LOOKER_*` env vars).

## Deploying

```bash
docker build -t meloyelo-hub .
gcloud run deploy meloyelo-hub --image … --region asia-southeast1
```

The container listens on port 8080. Point secrets at Secret Manager —
the Sheets key and Hub API secret must never be build-time values.

## Before production — read this

- Everything is built against the **working copy** sheet. Switch
  `SHEETS_SPREADSHEET_ID` to production only after sign-off, and deploy a
  second `HubApi.gs` (with a different secret) on the production sheet.
- ⚠ **Privacy (NZ Privacy Act 2020):** the working copy is currently
  shared "anyone with the link can view", exposing customer names, emails
  and phones. Restrict it to named accounts before launch. Raised in the
  build spec (§14) — do not treat link-sharing as an access model.
- The audit trail needs the Postgres database in production (the dev
  file fallback does not survive Cloud Run restarts).
- Display font is Heebo 700 pending a Bikys Heading web licence
  (`public/fonts/README.md` explains the swap when it arrives).

## For the next developer

- Hard rules live in `CLAUDE.md` (forward-only stages, append-only notes,
  never touch sheet columns, all writes via Apps Script).
- Business rules are pure, unit-tested modules in `src/lib/crm/`.
- The Sheets read layer (`src/lib/sheets/`) validates every row and never
  lets one bad row break a page.
- The old Vite prototype this repo replaced is on the
  `archive/vite-prototype` branch.
