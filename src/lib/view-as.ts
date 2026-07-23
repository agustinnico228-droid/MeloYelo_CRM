import "server-only";
import { cookies } from "next/headers";
import { canReassign } from "./roles";
import { requireUser, type SessionUser } from "./session";
import { getLookupData } from "./sheets";

/**
 * "View as agent" (addendum A5): a manager sees exactly what an agent
 * sees, without weakening any filter or logging in as anyone. Enforced
 * server-side, read-only while active, audited on entry and exit.
 */

export const VIEW_AS_COOKIE = "myhub-view-as";

export interface ViewAsTarget {
  email: string;
  name: string;
}

/** Active only for manager/admin sessions with a valid agent target. */
export async function getViewAs(
  realUser: SessionUser | null,
): Promise<ViewAsTarget | null> {
  if (!realUser || realUser.role === null || !canReassign(realUser.role)) {
    return null;
  }
  const value = (await cookies()).get(VIEW_AS_COOKIE)?.value?.toLowerCase();
  if (!value) return null;
  try {
    const { agents } = await getLookupData();
    const agent = agents.find((a) => a.crmEmail === value);
    return agent ? { email: agent.crmEmail, name: agent.name } : null;
  } catch {
    return null;
  }
}

export interface EffectiveSession {
  /** The real signed-in user — writes and audit always use this. */
  user: SessionUser;
  viewingAs: ViewAsTarget | null;
  /** The lens pages render through: the agent when view-as is active. */
  effective: SessionUser;
}

export async function requireEffectiveUser(): Promise<EffectiveSession> {
  const user = await requireUser();
  const viewingAs = await getViewAs(user);
  const effective: SessionUser = viewingAs
    ? { email: viewingAs.email, name: viewingAs.name, role: "agent" }
    : user;
  return { user, viewingAs, effective };
}
