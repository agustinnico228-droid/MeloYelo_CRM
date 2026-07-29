import { parseCrmDate } from "./dates";
import { speedToLeadStats, type SpeedToLeadStats } from "./speed-to-lead";
import type { Lead, StageHistoryEntry } from "./types";

/**
 * Managers Dashboard metrics (Phase 17 Part B), reproducing the
 * verified Looker scorecard formulas natively.
 *
 * Scope: leads where Source = "Website Form" — stated on the Looker
 * page itself and verified against the export (six of seven scorecards
 * match within ~2%, the drift being export-date lag).
 *
 * B3: "booked (currently)" counts leads sitting at a stage TODAY and
 * understates the commercial truth — the moment a ride completes, the
 * lead leaves the figure. "Booked (ever)" counts distinct leads that
 * ever reached the stage, from the Stage history tab (with the current
 * stage as a floor for records whose history rows predate logging).
 * Never present the current-state number as the booking rate.
 */

export const MANAGER_METRICS_SOURCE = "Website Form";

export interface MetricFilters {
  from?: Date | null;
  to?: Date | null;
  agentEmail?: string;
}

export function websiteFormLeads(
  leads: Lead[],
  filters: MetricFilters = {},
): Lead[] {
  return leads.filter((l) => {
    if (l.source !== MANAGER_METRICS_SOURCE) return false;
    if (
      filters.agentEmail &&
      l.agentEmail !== filters.agentEmail.toLowerCase()
    ) {
      return false;
    }
    if (filters.from || filters.to) {
      const added = parseCrmDate(l.dateAdded);
      if (!added) return false;
      if (filters.from && added < filters.from) return false;
      if (filters.to && added > filters.to) return false;
    }
    return true;
  });
}

const pct = (n: number, total: number): number | null =>
  total === 0 ? null : (n / total) * 100;

export interface Scorecard {
  /** null when the denominator is empty */
  percent: number | null;
  count: number;
  total: number;
}

function scorecard(leads: Lead[], match: (l: Lead) => boolean): Scorecard {
  const count = leads.filter(match).length;
  return { percent: pct(count, leads.length), count, total: leads.length };
}

/** B1 — flag ÷ total */
export function alertRate(
  leads: Lead[],
  flag: "alert48Sent" | "alert5DaySent" | "finalFollowUpSent",
): Scorecard {
  return scorecard(leads, (l) => l[flag] !== "");
}

/** B1 — current stage ÷ total (the existing dashboard's basis) */
export function currentStageRate(leads: Lead[], stage: string): Scorecard {
  return scorecard(leads, (l) => l.stage === stage);
}

/**
 * B3 — distinct leads that EVER reached a stage, from Stage history,
 * with the current stage as a floor for missing history rows.
 */
export function everReachedRate(
  leads: Lead[],
  history: StageHistoryEntry[],
  stage: string,
): Scorecard {
  const inScope = new Set(leads.map((l) => l.uniqueId));
  const ever = new Set<string>();
  for (const h of history) {
    if (h.to === stage && inScope.has(h.uniqueId)) ever.add(h.uniqueId);
  }
  for (const l of leads) {
    if (l.stage === stage) ever.add(l.uniqueId);
  }
  return {
    percent: pct(ever.size, leads.length),
    count: ever.size,
    total: leads.length,
  };
}

export interface AgentCount {
  agent: string;
  agentEmail: string;
  count: number;
}

/** B1 — the agent table: leads grouped by Agent, largest first. */
export function leadsByAgent(leads: Lead[]): AgentCount[] {
  const map = new Map<string, AgentCount>();
  for (const l of leads) {
    const key = l.agent || "Unassigned";
    const entry = map.get(key) ?? {
      agent: key,
      agentEmail: l.agentEmail,
      count: 0,
    };
    entry.count += 1;
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export interface AgentSpeed extends SpeedToLeadStats {
  agent: string;
}

/** B4 — median speed-to-lead per agent (Phase 4 outlier exclusion). */
export function speedToLeadByAgent(leads: Lead[]): AgentSpeed[] {
  const groups = new Map<string, (number | null)[]>();
  for (const l of leads) {
    const key = l.agent || "Unassigned";
    groups.set(key, [...(groups.get(key) ?? []), l.speedToLeadMinutes]);
  }
  return [...groups.entries()]
    .map(([agent, values]) => ({ agent, ...speedToLeadStats(values) }))
    .filter((g) => g.medianMinutes !== null)
    .sort((a, b) => (a.medianMinutes ?? 0) - (b.medianMinutes ?? 0));
}
