# MeloYelo CRM Hub

The one app where the MeloYelo team does all their CRM work: leads arrive,
get assigned, get called, get updated and get reported on — from a single
interface. The Google Sheet stays as the storage engine behind the scenes;
Apps Script keeps owning the business rules; Zapier and Looker keep running
and are reached from inside the app.

## Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · Payload CMS 3 +
Postgres (CMS content and audit log only — never customer data) ·
Google Sheets API v4 (read) · Apps Script Web App (write) ·
Docker → Cloud Run, `asia-southeast1`.

## Develop

```bash
npm install
cp .env.example .env.local   # fill in what the current phase needs
npm run dev
```

## Deploy

```bash
docker build -t meloyelo-hub .
# deploy the image to Cloud Run (asia-southeast1), PORT 8080
```

## Notes

- Display font is Heebo 700 pending a Bikys Heading web licence — see
  `public/fonts/README.md`.
- Build and test against the **working copy** sheet until sign-off; the
  production sheet ID is in `.env.example` but must not be used before then.
