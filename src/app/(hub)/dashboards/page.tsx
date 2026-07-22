import type { Metadata } from "next";
import { getLookerUrls } from "@/lib/cms";
import { hasRole, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboards" };
export const dynamic = "force-dynamic";

function ReportCard({ title, url }: { title: string; url: string }) {
  return (
    <section className="rounded-card border border-my-line bg-my-surface p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-h3">{title}</h2>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center rounded-control border border-my-line bg-my-surface px-4 font-medium transition-colors hover:bg-my-paper"
        >
          Open in Looker
        </a>
      </div>
      <div className="mt-3 overflow-hidden rounded-control border border-my-line">
        <iframe
          src={url}
          title={`${title} dashboard`}
          className="aspect-[4/3] w-full sm:aspect-video"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </section>
  );
}

export default async function DashboardsPage() {
  const user = await requireUser();
  const isManager = hasRole(user, "manager", "admin");
  const urls = await getLookerUrls();

  // §11: a non-manager sees a plain explanation, not a 403.
  const reports = isManager
    ? [
        { title: "Agent performance", url: urls.agent },
        { title: "Manager overview", url: urls.manager },
        { title: "Growth", url: urls.growth },
      ]
    : [{ title: "My performance", url: urls.agent }];

  const configured = reports.filter((r) => r.url !== "");

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <h1 className="text-h3">Dashboards</h1>

      {!isManager ? (
        <p className="rounded-card border border-my-line bg-my-surface p-4 text-sm text-my-slate shadow-card">
          Managers see the full set of dashboards here. You get the agent
          view — everything about your own pipeline is also on Today.
        </p>
      ) : null}

      {configured.length === 0 ? (
        <div className="rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
          <p className="font-medium">Dashboards aren&apos;t connected yet.</p>
          <p className="mt-2 text-sm text-my-slate">
            An admin can set the Looker report URLs in the admin area
            (Settings), or via environment variables.
          </p>
        </div>
      ) : (
        configured.map((r) => (
          <ReportCard key={r.title} title={r.title} url={r.url} />
        ))
      )}
    </main>
  );
}
