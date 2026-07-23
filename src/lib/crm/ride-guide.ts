import { parseCrmDate } from "./dates";
import { parseNotes } from "./notes";
import type { Lead } from "./types";

/**
 * Ride Guide rules (addendum §14). Hard rule from the intranet: the
 * Ride Guide works ONLY Source = Website Form leads — agent-entered
 * leads stay with their agent and never appear in the queue.
 */

export function isRideGuideLead(lead: Lead): boolean {
  return lead.source === "Website Form";
}

/**
 * Has the assigned agent already made contact? Parsed from the notes
 * timeline: any attributed entry counts. Emma skips these (with the
 * indicator visible, per the chosen queue behaviour).
 */
export function agentHasMadeContact(lead: Lead): boolean {
  return parseNotes(lead.notes).some((e) => e.author !== null);
}

function touchedTime(lead: Lead): number {
  return (
    parseCrmDate(lead.stageUpdatedAt)?.getTime() ??
    parseCrmDate(lead.dateAdded)?.getTime() ??
    0
  );
}

/** Queue order: never-contacted first, then longest since last change. */
export function queueOrder(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const aNever = a.stage === "Lead" ? 0 : 1;
    const bNever = b.stage === "Lead" ? 0 : 1;
    if (aNever !== bNever) return aNever - bNever;
    return touchedTime(a) - touchedTime(b);
  });
}

const DORMANT_MS = 14 * 24 * 60 * 60 * 1000;
const EARLY_STAGES = ["Lead", "Made contact", "Contact Failed"];

/** Older leads that never progressed — the Ride Guide works these too. */
export function isDormant(lead: Lead, now: Date = new Date()): boolean {
  if (!EARLY_STAGES.includes(lead.stage)) return false;
  const touched = touchedTime(lead);
  if (touched === 0) return true; // unparseable age: surface, don't hide
  return now.getTime() - touched > DORMANT_MS;
}
