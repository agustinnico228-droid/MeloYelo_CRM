import "server-only";

/**
 * Header-name based mapping (§13 — never bind to column index).
 * The `All data` headers are exact per §8; lookup tabs use tolerant
 * aliases until verified against the live sheet, and unmapped headers
 * are surfaced on /system rather than silently dropped.
 */

/** Exact `All data` headers, columns A→AA (§8). */
export const LEAD_HEADERS = {
  uniqueId: "Unique ID",
  dateAdded: "Date added",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  postCode: "Post Code",
  stage: "Stage",
  agentManual: "Agent (Manual)",
  agent: "Agent",
  agentEmail: "Agent Email",
  notes: "Notes",
  city: "City",
  model: "Model",
  serial: "Serial",
  viewUpdateUrl: "View / Update",
  regMatchKey: "Reg Match Key",
  stageUpdatedAt: "Stage Updated At",
  stageUpdateFrom: "Stage Update From",
  stageUpdateTo: "Stage Update To",
  alert48Sent: "48 hour alert sent",
  alert5DaySent: "5 day alert sent",
  finalFollowUpSent: "Final follow up sent",
  speedToLeadMinutes: "speed_to_lead_minutes",
  source: "Source",
  liveUpdateLink: "Live Update Link",
  trackingDetails: "Tracking Details",
} as const;

export function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Turn a raw tab (header row + data rows) into keyed records. */
export function rowsToRecords(
  rows: string[][],
): { headers: string[]; records: Record<string, string>[] } {
  if (rows.length === 0) return { headers: [], records: [] };
  const headers = rows[0].map((h) => (h ?? "").trim());
  const records = rows.slice(1).map((row) => {
    const rec: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (h) rec[h] = (row[i] ?? "").trim();
    });
    return rec;
  });
  return { headers, records };
}

/**
 * Pick a field from a record by normalized header aliases, first match
 * wins. Used for lookup tabs whose exact headers aren't pinned by §8.
 */
export function pickByAlias(
  rec: Record<string, string>,
  aliases: readonly string[],
): string {
  for (const key of Object.keys(rec)) {
    if (aliases.includes(normalizeHeader(key))) return rec[key];
  }
  return "";
}
