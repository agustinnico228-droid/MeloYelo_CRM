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
  matcher: [
    "/((?!signin|api/auth|_next/static|_next/image|favicon.ico|fonts/).*)",
  ],
};
