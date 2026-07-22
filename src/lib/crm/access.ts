import "server-only";
import type { SessionUser } from "../session";
import { canSeeAllLeads } from "../roles";
import type { Lead } from "./types";

/**
 * Row-level filtering happens HERE, on the server (§13, §14). An agent's
 * browser must never receive another agent's records. A user with no
 * role sees nothing.
 */
export function visibleLeads(user: SessionUser, leads: Lead[]): Lead[] {
  if (user.role === null) return [];
  if (canSeeAllLeads(user.role)) return leads;
  return leads.filter((l) => l.agentEmail === user.email);
}

export function canViewLead(user: SessionUser, lead: Lead): boolean {
  if (user.role === null) return false;
  if (canSeeAllLeads(user.role)) return true;
  return lead.agentEmail === user.email;
}
