import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, isAuthConfigured, signIn } from "@/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const session = await auth();
  if (session?.user?.email) redirect(callbackUrl ?? "/");

  return (
    // Black backdrop like the site's header/footer — the card is the only light
    <main className="flex min-h-svh items-center justify-center bg-my-ink p-6">
      <div className="w-full max-w-md rounded-card bg-my-surface text-center shadow-card">
        {/* Site header in miniature: black bar, yellow logo, yellow strip */}
        <div className="border-b-4 border-my-yellow bg-my-ink px-8 py-7">
          <Image
            src="/meloyelo-logo.png"
            alt="MeloYelo: just mad about ebikes"
            width={2560}
            height={452}
            priority
            className="mx-auto h-10 w-auto"
          />
        </div>
        <div className="p-8">
          <h1 className="text-h3">MeloYelo CRM Hub</h1>
          <p className="mt-3 text-sm text-my-slate">
            Sign in with your MeloYelo Google account.
          </p>

          {error ? (
            <p className="mt-6 rounded-control border border-my-alert/30 bg-my-alert/5 px-4 py-3 text-sm text-my-alert">
              That account can&apos;t access the hub. Use your @meloyelo.nz
              account, or contact support if you think this is wrong.
            </p>
          ) : null}

          {isAuthConfigured ? (
            <form
              className="mt-8"
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl ?? "/" });
              }}
            >
              <button type="submit" className="btn-brand w-full">
                Sign in with Google
              </button>
            </form>
          ) : (
            <p className="mt-8 rounded-control border border-my-line bg-my-paper px-4 py-3 text-sm text-my-slate">
              Google sign-in isn&apos;t configured in this environment yet. In
              development, set DEV_FAKE_USER_EMAIL in .env.local to work on the
              app.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
