import { isAuthConfigured, signOut } from "@/auth";
import { getSessionUser } from "@/lib/session";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-card bg-my-yellow">
          <span className="font-display text-2xl font-bold text-my-ink">
            MY
          </span>
        </div>
        <h1 className="text-h3">MeloYelo CRM Hub</h1>

        {user ? (
          <>
            <p className="mt-3 text-sm text-my-slate">
              Signed in as <span className="text-my-ink">{user.email}</span>
              {user.role ? (
                <>
                  {" — "}
                  <span className="capitalize">
                    {user.role.replace("_", " ")}
                  </span>
                </>
              ) : null}
            </p>
            {user.role === null ? (
              <p className="mt-6 rounded-control border border-my-warn/40 bg-my-warn/10 px-4 py-3 text-sm text-my-ink">
                Your account doesn&apos;t have a CRM role yet. Ask a manager
                to add you to the Agents list.
              </p>
            ) : (
              <p className="mt-6 rounded-control border border-my-line bg-my-paper px-4 py-3 text-sm text-my-slate">
                Your leads and pipeline arrive in the next build phases.
              </p>
            )}
            {isAuthConfigured ? (
              <form
                className="mt-6"
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/signin" });
                }}
              >
                <button
                  type="submit"
                  className="min-h-12 w-full rounded-control border border-my-line bg-my-surface px-6 font-medium text-my-ink transition-colors hover:bg-my-paper"
                >
                  Sign out
                </button>
              </form>
            ) : null}
          </>
        ) : (
          <p className="mt-6 rounded-control border border-my-line bg-my-paper px-4 py-3 text-sm text-my-slate">
            Not signed in. Go to /signin, or set DEV_FAKE_USER_EMAIL in
            .env.local during development.
          </p>
        )}
      </div>
    </main>
  );
}
