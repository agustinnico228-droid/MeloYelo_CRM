# HubApi.gs — deployment

The hub never writes cells to the sheet directly (hard rule 1). All writes
go through this Apps Script Web App, which lives **inside the existing
bound script project** so it can reuse the business-rule functions that
already own unique IDs, agent assignment, stage history and speed-to-lead.

## Install (working copy first — always)

1. Open the **working copy** sheet
   (`17xpNY8t5GVAikMQRMc-MpnxJAqk6-JU4G2zAkacFG6I`) →
   Extensions → Apps Script.
2. Add a new script file named `HubApi` and paste in `HubApi.gs`.
   **Do not modify any existing file.**
3. Work through the `[EXISTING]` markers at the top of the file — confirm
   the four reused function names/signatures match the project
   (`getConfig_`, `logStageHistory_`, `assignAgentByPostcode`,
   `writeUpdateLinkForRow_`) and adjust the call sites if they differ.
4. Add a row to the `Config` tab: key `HUB_API_SECRET`, value a long
   random string (e.g. `openssl rand -hex 32`).
5. Deploy → New deployment → **Web app** → execute as **Me**, who has
   access: **Anyone**. Copy the web app URL.
6. In the hub's environment (Secret Manager in production, `.env.local`
   in dev) set:
   - `HUB_API_URL` = the web app URL
   - `HUB_API_SECRET` = the same value as the Config row
7. Test with `curl` before pointing the app at it:

   ```bash
   curl -L -X POST "$HUB_API_URL" \
     -H 'Content-Type: application/json' \
     -d '{"secret":"…","action":"updateLead","uniqueId":"10103",
          "noteText":"HubApi smoke test","actorEmail":"you@meloyelo.nz",
          "actorName":"You"}'
   ```

   Then confirm on the sheet: the note appended (not overwritten), the
   `Logs` tab has a `HUB` row, and nothing else changed.

## Production

Only after sign-off (§8): repeat the same steps on the production sheet's
bound project, with a **different** secret.
