export default function HubLoading() {
  return (
    <main
      className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="h-8 w-40 animate-pulse rounded-control bg-my-line" />
      <div className="h-32 animate-pulse rounded-card bg-my-line/60" />
      <div className="h-32 animate-pulse rounded-card bg-my-line/40" />
    </main>
  );
}
