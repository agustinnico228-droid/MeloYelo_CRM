"use client";

export default function HubError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-[60svh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
        <h1 className="text-h3">Something went wrong</h1>
        <p className="mt-3 text-sm text-my-slate">
          The page hit an error. Your data is safe. The CRM keeps running on its
          existing rails even when the hub has a bad moment.
        </p>
        <button type="button" onClick={reset} className="btn-brand mt-6">
          Try again
        </button>
      </div>
    </main>
  );
}
