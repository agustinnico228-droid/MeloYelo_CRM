import { parseCrmDate } from "./dates";
import type { Lead } from "./types";

/**
 * Server-side list filtering for /leads (§11). Filter state lives in the
 * URL so views can be shared; this module turns those params into a
 * filtered, sorted list. Pure — unit-testable.
 */

export type LeadSort = "newest" | "oldest" | "untouched";

export interface LeadFilters {
  q?: string;
  stage?: string;
  source?: string;
  agentEmail?: string;
  unassigned?: boolean;
  sort?: LeadSort;
}

function digits(s: string): string {
  return s.replace(/\D/g, "");
}

export function matchesQuery(lead: Lead, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (needle === "") return true;
  const haystack = [
    lead.firstName,
    lead.lastName,
    `${lead.firstName} ${lead.lastName}`,
    lead.email,
    lead.postCode,
    lead.city,
  ]
    .join("\n")
    .toLowerCase();
  if (haystack.includes(needle)) return true;
  const qDigits = digits(needle);
  return qDigits.length >= 3 && digits(lead.phone).includes(qDigits);
}

function addedTime(lead: Lead): number {
  return parseCrmDate(lead.dateAdded)?.getTime() ?? 0;
}

/** Last movement of any kind — stage change if present, else arrival. */
function touchedTime(lead: Lead): number {
  return (
    parseCrmDate(lead.stageUpdatedAt)?.getTime() ??
    parseCrmDate(lead.dateAdded)?.getTime() ??
    0
  );
}

export function filterAndSortLeads(
  leads: Lead[],
  f: LeadFilters,
): Lead[] {
  let out = leads;

  if (f.q) out = out.filter((l) => matchesQuery(l, f.q!));
  if (f.stage) out = out.filter((l) => l.stage === f.stage);
  if (f.source) out = out.filter((l) => l.source === f.source);
  if (f.agentEmail) {
    out = out.filter((l) => l.agentEmail === f.agentEmail!.toLowerCase());
  }
  if (f.unassigned) out = out.filter((l) => l.agentEmail === "");

  const sort = f.sort ?? "newest";
  return [...out].sort((a, b) => {
    if (sort === "oldest") return addedTime(a) - addedTime(b);
    if (sort === "untouched") return touchedTime(a) - touchedTime(b);
    return addedTime(b) - addedTime(a);
  });
}
