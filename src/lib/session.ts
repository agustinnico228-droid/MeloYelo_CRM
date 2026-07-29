import { redirect } from "next/navigation";
import { auth, isAuthConfigured } from "@/auth";
import { getAgentEmailSet } from "./directory";
import { resolveRole, type Role } from "./roles";

export interface SessionUser {
  email: string;
  name: string;
  /** null = valid Workspace account but no CRM role assigned. */
  role: Role | null;
}

const ROLES: readonly Role[] = ["agent", "ride_guide", "manager", "admin"];

/**
 * Dev-only stand-in while OAuth credentials are not yet provisioned.
 * Never active in production, and never active once real credentials exist.
 * Set DEV_FAKE_USER_EMAIL / DEV_FAKE_USER_ROLE in .env.local.
 */
function devFakeUser(): SessionUser | null {
  if (process.env.NODE_ENV === "production" || isAuthConfigured) return null;
  const email = process.env.DEV_FAKE_USER_EMAIL;
  if (!email) return null;
  const role = process.env.DEV_FAKE_USER_ROLE as Role | undefined;
  return {
    email: email.toLowerCase(),
    name: email.split("@")[0],
    role: role && ROLES.includes(role) ? role : "agent",
  };
}

/** The signed-in user with their server-resolved role, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return devFakeUser();
  // Role is resolved fresh per request from env overrides + Agents tab —
  // never from anything the client sent.
  const role = resolveRole(email, await getAgentEmailSet());
  return { email, name: session?.user?.name ?? email, role };
}

/** For pages: redirects to sign-in when anonymous. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/signin");
  return user;
}

/**
 * For pages behind a role gate. Callers should render a plain explanation
 * for users without the role (§11 /dashboards) — this helper only answers
 * the question.
 */
export function hasRole(user: SessionUser, ...roles: readonly Role[]): boolean {
  return user.role !== null && roles.includes(user.role);
}
