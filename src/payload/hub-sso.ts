import crypto from "node:crypto";
import type { AuthStrategy } from "payload";
import { decode } from "next-auth/jwt";
import { resolveRole } from "../lib/roles";

/**
 * Single sign-on for the admin panel: accept the hub's Google session
 * (the Auth.js JWT cookie) so a manager or admin who is already signed
 * in never sees a second login screen when they hit /admin.
 *
 * Only hub roles from the env override lists qualify (admin → admin,
 * manager → manager); agents get no CMS access (§12). A matching
 * Payload user is auto-provisioned on first entry with an unguessable
 * password — the local email/password login remains as a fallback for
 * accounts outside the Workspace (e.g. the seed admin).
 */

const COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
] as const;

function sessionCookie(headers: Headers): { name: string; value: string } | null {
  const raw = headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if ((COOKIE_NAMES as readonly string[]).includes(name)) {
      return { name, value: part.slice(eq + 1).trim() };
    }
  }
  return null;
}

export const hubSsoStrategy: AuthStrategy = {
  name: "hub-sso",
  authenticate: async ({ payload, headers }) => {
    try {
      const cookie = sessionCookie(headers);
      const secret = process.env.AUTH_SECRET;
      if (!cookie || !secret) return { user: null };

      // The salt is the cookie name — Auth.js v5's derivation scheme.
      const token = await decode({
        token: cookie.value,
        secret,
        salt: cookie.name,
      });
      const email = token?.email?.toLowerCase();
      if (!email) return { user: null };

      // Hub role from the env override lists only — CMS access is
      // admin/manager (§12); agents and ride guide stay out.
      const hubRole = resolveRole(email, new Set());
      if (hubRole !== "admin" && hubRole !== "manager") return { user: null };

      const existing = await payload.find({
        collection: "users",
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
      });

      let user = existing.docs[0] ?? null;
      if (!user) {
        user = await payload.create({
          collection: "users",
          data: {
            email,
            // Never used — SSO is the entry; local login stays possible
            // only if an admin later sets a real password.
            password: crypto.randomBytes(32).toString("base64url"),
            role: hubRole,
          },
          overrideAccess: true,
        });
      }

      return {
        user: {
          ...user,
          collection: "users",
          // The strategy that authenticated this request, for Payload's
          // logout handling.
          _strategy: "hub-sso",
        },
      };
    } catch {
      // Any decode/lookup hiccup falls back to the normal login screen.
      return { user: null };
    }
  },
};
