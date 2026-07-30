# Putting the Hub online

The code on GitHub is the whole app, but GitHub only **stores** it. To get a
working URL the code has to run on a host that can execute a server.

**GitHub Pages cannot host this app.** Pages serves static files only, and the
Hub needs a live server for sign-in, the database, and the Google Sheets read
(whose private key must never reach a browser). Pointing Pages at this repo
only ever renders `README.md`.

Pick one host below. Both read straight from this GitHub repo, so every push
to `main` redeploys automatically.

---

## Option A: Vercel (fastest, all in the browser)

1. Go to **vercel.com** and click **Sign up** (choose *Continue with GitHub*).
2. Click **Add New... > Project**.
3. Find **MeloYelo_CRM** in the list and click **Import**.
4. Leave every build setting on its default. Vercel detects Next.js.
5. Open **Environment Variables**. Open your local `.env.local` file, copy the
   whole contents, and paste it into the first variable box. Vercel bulk-imports
   every line.
6. **Before deploying, fix these three:**
   - delete the `DEV_FAKE_USER_EMAIL` line (it must never exist in production)
   - add `AUTH_TRUST_HOST` = `true`
   - add `NEXT_PUBLIC_SERVER_URL` = your Vercel URL, e.g.
     `https://meloyelo-crm.vercel.app`
7. Click **Deploy** and wait about three minutes.

### Then tell Google about the new address (required, or sign-in fails)

1. Open **console.cloud.google.com** > **APIs & Services** > **Credentials**.
2. Click the OAuth client used by the Hub.
3. Under **Authorised redirect URIs**, click **Add URI** and paste:
   `https://YOUR-VERCEL-URL/api/auth/callback/google`
4. Save. Sign-in now works for `@meloyelo.nz` accounts.

---

## Option B: Google Cloud Run (keeps everything in MeloYelo's GCP)

The `Dockerfile` in this repo is already written for Cloud Run: standalone
output, port 8080, non-root user. Cloud Build compiles the image in the cloud,
so Docker does not need to be installed locally.

```bash
gcloud auth login                          # sign in as a meloyelo.nz owner
gcloud config set project meloyelo-495205
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
gcloud run deploy meloyelo-hub \
  --source . \
  --region australia-southeast1 \
  --allow-unauthenticated
```

`--allow-unauthenticated` lets the request reach the app; the app itself still
enforces Google sign-in restricted to `@meloyelo.nz`, so the site is not public.

Set the environment variables on the service (Cloud Run console >
**Edit & deploy new revision** > **Variables & Secrets**), using the same list
as Option A. Secrets such as `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64`,
`AUTH_GOOGLE_SECRET`, `HUB_API_SECRET` and `DATABASE_URI` belong in **Secret
Manager**, referenced from the service rather than pasted as plain values.

Then add the Cloud Run URL to the OAuth redirect URIs exactly as in Option A.

---

## Environment variables the app reads

| Variable | Needed for |
|---|---|
| `SHEETS_SPREADSHEET_ID` | which CRM sheet to read |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Sheets read access |
| `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64` | Sheets read access |
| `AUTH_SECRET` | session signing |
| `AUTH_TRUST_HOST` | required outside Vercel; harmless on Vercel |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google sign-in |
| `AUTH_ALLOWED_DOMAIN` | locks sign-in to `meloyelo.nz` |
| `ADMIN_EMAILS` / `MANAGER_EMAILS` / `RIDE_GUIDE_EMAILS` | role overrides |
| `HUB_API_URL` / `HUB_API_SECRET` | writing back to the sheet |
| `DATABASE_URI` | CMS content and the audit log |
| `PAYLOAD_SECRET` | CMS session signing |
| `NEXT_PUBLIC_SERVER_URL` | admin live preview |
| `GCS_BUCKET` / `GCS_PROJECT_ID` | media uploads (optional) |
| `LOOKER_*_REPORT_URL` | dashboard embeds (optional) |

`DEV_FAKE_USER_EMAIL` and `DEV_FAKE_USER_ROLE` are development only. The code
ignores them in production, and they should not be set on a host.

---

## After the first deploy

- Sign in at the new URL with a `@meloyelo.nz` account.
- Content lives in the database, so every page ported from the intranet is
  already there. Nothing needs reseeding.
- Editing still works the same way: the pencil button on any page, or
  **Edit site** in the sidebar.
- Every later `git push` to `main` redeploys on its own.
