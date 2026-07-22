import "server-only";
import { z } from "zod";
import type { Lead } from "../crm/types";
import { LEAD_HEADERS } from "./mappers";

/**
 * Row validation (§13): tolerant by design. Live data is dirty (§9) — a
 * lead with an odd phone or postcode is still a lead. A row is invalid
 * only when structurally unusable (no Unique ID). One bad row must never
 * break a page: invalid rows are skipped and listed on /system.
 */

const str = z.string().default("");

/**
 * speed_to_lead_minutes has artefacts like "306,447" — parse tolerantly,
 * null when blank or unparseable. Outlier handling is domain logic (§9.3),
 * not the reader's job.
 */
const speedToLead = z
  .string()
  .default("")
  .transform((v) => {
    const cleaned = v.replace(/,/g, "").trim();
    if (cleaned === "") return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  });

export const leadSchema = z.object({
  uniqueId: z.string().trim().min(1, "Unique ID is required"),
  dateAdded: str,
  firstName: str,
  lastName: str,
  email: str,
  phone: str,
  postCode: str,
  stage: str,
  agentManual: str,
  agent: str,
  agentEmail: z
    .string()
    .default("")
    .transform((v) => v.trim().toLowerCase()),
  notes: str,
  city: str,
  model: str,
  serial: str,
  viewUpdateUrl: str,
  regMatchKey: str,
  stageUpdatedAt: str,
  stageUpdateFrom: str,
  stageUpdateTo: str,
  alert48Sent: str,
  alert5DaySent: str,
  finalFollowUpSent: str,
  speedToLeadMinutes: speedToLead,
  source: str,
  liveUpdateLink: str,
  trackingDetails: str,
});

export interface InvalidRow {
  /** 1-based row number in the sheet (header = row 1) */
  rowNumber: number;
  reason: string;
}

export function parseLeadRecords(records: Record<string, string>[]): {
  leads: Lead[];
  invalid: InvalidRow[];
} {
  const leads: Lead[] = [];
  const invalid: InvalidRow[] = [];

  records.forEach((rec, i) => {
    // Skip fully blank trailing rows silently.
    if (Object.values(rec).every((v) => v === "")) return;

    const candidate: Record<string, string> = {};
    for (const [field, header] of Object.entries(LEAD_HEADERS)) {
      candidate[field] = rec[header] ?? "";
    }

    const result = leadSchema.safeParse(candidate);
    if (result.success) {
      leads.push(result.data);
    } else {
      invalid.push({
        rowNumber: i + 2,
        reason: result.error.issues.map((iss) => iss.message).join("; "),
      });
    }
  });

  return { leads, invalid };
}
