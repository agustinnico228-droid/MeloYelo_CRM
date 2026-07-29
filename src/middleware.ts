import { NextResponse } from "next/server";
import { auth, isAuthConfigured } from "@/auth";

/**
 * Every route requires a session except the static sign-in page and the
 * auth endpoints (§14). While OAuth credentials are not yet provisioned,
 * development passes through so the app can be built and demoed — in
 * production an unconfigured deployment refuses everything.
 */
export default auth((req) => {
  if (req.auth?.user?.email) return NextResponse.next();

  if (!isAuthConfigured && process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const signin = new URL("/signin", req.nextUrl.origin);
  if (req.nextUrl.pathname !== "/") {
    signin.searchParams.set("callbackUrl", req.nextUrl.pathname);
  }
  return NextResponse.redirect(signin);
});

export const config = {
  // /admin and /api/* belong to Payload, which enforces its own auth and
  // per-collection access control — the hub's middleware must not
  // intercept the CMS login flow. /api/auth stays with Auth.js.
  // Public image assets (logo, icons) are brand files, never customer
  // data — they stay reachable without a session.
  matcher: [
    "/((?!signin|api/|admin|_next/static|_next/image|favicon.ico|fonts/|media/|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
