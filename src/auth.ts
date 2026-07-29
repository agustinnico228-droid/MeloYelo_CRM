import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Google Workspace OAuth restricted to the meloyelo.nz domain (§14).
 * True once real OAuth credentials are provisioned; until then, development
 * runs with the dev fake user (see src/lib/session.ts) and production
 * refuses every route.
 */
export const isAuthConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const allowedDomain =
  process.env.AUTH_ALLOWED_DOMAIN ??
  process.env.ALLOWED_EMAIL_DOMAIN ?? // Phase 17 E3 alias
  "meloyelo.nz";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Production Auth.js refuses hosts it hasn't been told to trust
  // (UntrustedHost). We always run behind infrastructure that sets the
  // Host header trustworthily — localhost in testing, Google's load
  // balancer on Cloud Run — so trusting it is the documented setting
  // for self-hosted deployments.
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV !== "production"
      ? "dev-only-secret-not-for-production"
      : undefined),
  providers: [
    Google({
      authorization: {
        params: { hd: allowedDomain, prompt: "select_account" },
      },
    }),
  ],
  pages: { signIn: "/signin" },
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ profile }) {
      // The hd param above is only a UI hint — verify server-side, twice:
      // the hd claim Google returns AND the email suffix itself.
      const email = profile?.email?.toLowerCase() ?? "";
      return (
        profile?.hd === allowedDomain && email.endsWith(`@${allowedDomain}`)
      );
    },
    authorized({ auth: session }) {
      return Boolean(session?.user?.email);
    },
  },
});
