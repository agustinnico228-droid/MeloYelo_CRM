import type { Metadata } from "next";
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
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-card bg-my-yellow">
          <span className="font-display text-2xl font-bold text-my-ink">
            MY
          </span>
        </div>
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
            <button
              type="submit"
              className="min-h-12 w-full rounded-control bg-my-yellow px-6 font-bold text-my-ink transition-opacity hover:opacity-90"
            >
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
    </main>
  );
}
