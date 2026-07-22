export default function Home() {
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
          One place for leads, pipeline and reporting.
        </p>
        <p className="mt-8 rounded-control border border-my-line bg-my-paper px-4 py-3 text-sm text-my-slate">
          Sign-in with your MeloYelo account arrives in the next build phase.
        </p>
      </div>
    </main>
  );
}
