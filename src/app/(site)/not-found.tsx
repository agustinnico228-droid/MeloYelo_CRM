import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
        <h1 className="text-h3">That page isn&apos;t here</h1>
        <p className="mt-3 text-sm text-my-slate">
          The link may be old, or the record may not be one of yours.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-control bg-my-yellow px-6 font-bold text-my-ink transition-opacity hover:opacity-90"
        >
          Back to Today
        </Link>
      </div>
    </main>
  );
}
