import { parseCrmDate } from "./dates";
import type { Lead } from "./types";

/**
 * "Needs action now" (§11 Today): a lead qualifies if it's untouched
 * (Stage = Lead), stuck at Made contact with no stage change in 48h,
 * or the 48-hour alert flag is set.
 */

const STALE_MS = 48 * 60 * 60 * 1000;

export function needsActionNow(lead: Lead, now: Date = new Date()): boolean {
  if (lead.stage === "Lead") return true;
  if (lead.alert48Sent !== "") return true;
  if (lead.stage === "Made contact") {
    const changed =
      parseCrmDate(lead.stageUpdatedAt) ?? parseCrmDate(lead.dateAdded);
    // Unparseable = unknown age; treat as stale rather than hiding it.
    if (!changed) return true;
    return now.getTime() - changed.getTime() > STALE_MS;
  }
  return false;
}

/** Longest-waiting first — oldest arrival at the top of the list. */
export function sortByWaiting(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const at = parseCrmDate(a.dateAdded)?.getTime() ?? 0;
    const bt = parseCrmDate(b.dateAdded)?.getTime() ?? 0;
    return at - bt;
  });
}
