/** Roles per §4. Overrides come from env lists; agents from the Agents tab. */
export type Role = "agent" | "ride_guide" | "manager" | "admin";

function envList(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Resolve a role from a verified email. Override lists win over the Agents
 * tab so a manager who also appears as an agent gets manager powers.
 * Returns null for a signed-in Workspace user with no CRM role.
 */
export function resolveRole(
  email: string,
  agentEmails: ReadonlySet<string>,
): Role | null {
  const e = email.toLowerCase();
  if (envList(process.env.ADMIN_EMAILS).has(e)) return "admin";
  if (envList(process.env.MANAGER_EMAILS).has(e)) return "manager";
  if (envList(process.env.RIDE_GUIDE_EMAILS).has(e)) return "ride_guide";
  if (agentEmails.has(e)) return "agent";
  return null;
}

/** ride_guide, manager and admin see leads across all regions (§4). */
export function canSeeAllLeads(role: Role): boolean {
  return role !== "agent";
}

export function canReassign(role: Role): boolean {
  return role === "manager" || role === "admin";
}

export function canViewDashboards(role: Role): boolean {
  return role === "manager" || role === "admin";
}

export function canViewSystem(role: Role): boolean {
  return role === "manager" || role === "admin";
}
