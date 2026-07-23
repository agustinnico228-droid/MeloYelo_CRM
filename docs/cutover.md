# Cutover plan — intranet → CRM Hub

For Greg. The Hub replaces the Google Sites intranet ("mY Hub") and the
two Google Forms — but nothing gets switched off until the steps below
are done, in order. Everything keeps working if the Hub goes down.

## Before the trial

1. **Run the parity check**: `npm run parity`. It confirms every
   intranet page exists in the Hub and lists the stub pages that still
   need their content pasted in `/admin` (the export didn't include
   everything — nothing was auto-written).
2. Paste the **Looker report IDs** into Admin → Dashboards (analytics,
   manager, growth, ads). Until then those pages say "not connected".
3. Confirm the **Stages explained** correction: the Hub lists all nine
   stages including `Contact Failed`; the old intranet page had eight.

## The trial (§16.3)

1. Hub runs **in parallel** with the intranet — nothing switched off.
2. Two or three agents trial it for a week.
3. Fix what they report (CRM Glitches page catches it too).
4. Announce via the announcement banner **on both** the Hub and the
   intranet.
5. Intranet home gets a "We've moved" notice; keep the intranet live
   **30 days**.
6. Retire the Google Forms **only** after the native Add lead and
   record editing have run clean for **two weeks**.

## Links that must keep working

Old intranet URLs redirect automatically (configured in
`next.config.ts`), including the three most-linked pages from
notification emails:

| Old | New | Email links |
|---|---|---|
| `/crm/crm-info-instructions/introduction-for-pilot-program-agents` | `/guides/introduction` | 54 |
| `/crm/crm-glitches` | `/known-issues` | 16 |
| `/growth-marketing/campaign-naming-and-utm-convention` | `/growth/utm-convention` | 15 |

If another old link surfaces, add one line to `INTRANET_REDIRECTS` in
`next.config.ts`.

## Decisions still open (ask-before-building leftovers)

- **Domain**: does the Hub take over `myhub.meloyelo.nz`, or run at
  `hub.meloyelo.nz` during the trial? (Redirects work either way.)
- **Old agent Looker report**: it stays reachable at
  `/dashboards/analytics` during the transition — retire after
  cutover, or keep?
- **Emma / Ride Guide**: confirm the role continues post-pilot.
- **Conference 2026 agenda + campaign offer copy**: paste into the
  stub pages in `/admin` when confirmed.

## One warning worth repeating

Do **not** turn off "Filter by email address" on the old agent Looker
report to make data appear — that filter is the only thing keeping 24
agents out of each other's customer lists. Managers who need cross-agent
visibility use the Managers Dashboard, or this Hub (which enforces the
same rule server-side and adds a safe, audited "View as agent").
