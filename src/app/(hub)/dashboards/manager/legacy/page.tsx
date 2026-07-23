import type { Metadata } from "next";
import Link from "next/link";
import LookerAccessNote from "@/components/LookerAccessNote";
import { getDashboard, getLookerUrls } from "@/lib/cms";
import { hasRole } from "@/lib/session";
import { requireEffectiveUser } from "@/lib/view-as";

export const metadata: Metadata = { title: "Managers Dashboard (Looker)" };
export const dynamic = "force-dynamic";

/** The old Looker embed, kept during the transition (§17 B4). */
export default async function LegacyManagerDashboardPage() {
  const { effective: user } = await requireEffectiveUser();

  if (!hasRole(user, "manager", "admin")) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-h3">Managers Dashboard</h1>
        <p className="mt-4 rounded-card border border-my-line bg-my-surface p-6 text-my-slate shadow-card">
          This dashboard is for managers.
        </p>
      </main>
    );
  }

  const doc = await getDashboard("manager", user.role);
  let embedUrl = "";
  let openUrl = "";
  if (doc?.lookerReportId) {
    embedUrl = `https://lookerstudio.google.com/embed/reporting/${doc.lookerReportId}${
      doc.lookerPageId ? `/page/${doc.lookerPageId}` : ""
    }`;
    openUrl = `https://lookerstudio.google.com/reporting/${doc.lookerReportId}`;
  } else {
    const urls = await getLookerUrls();
    embedUrl = urls.manager;
    openUrl = urls.manager;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-h3">Managers Dashboard — old Looker version</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboards/manager"
            className="flex min-h-12 items-center rounded-control bg-my-yellow px-4 font-bold text-my-ink transition-opacity hover:opacity-90"
          >
            Use the native version
          </Link>
          {openUrl ? (
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center rounded-control border border-my-line bg-my-surface px-4 font-medium transition-colors hover:bg-my-paper"
            >
              Open in Looker
            </a>
          ) : null}
        </div>
      </div>

      {embedUrl ? (
        <>
          <div className="overflow-hidden rounded-card border border-my-line shadow-card">
            <iframe
              src={embedUrl}
              title="Managers Dashboard (Looker)"
              className="aspect-[4/3] w-full sm:aspect-video"
              loading="lazy"
              allowFullScreen
            />
          </div>
          <LookerAccessNote />
        </>
      ) : (
        <div className="rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
          <p className="font-medium">The Looker report isn&apos;t connected.</p>
          <p className="mt-2 text-sm text-my-slate">
            The native version above needs no Looker at all — this page only
            exists for comparison during the transition.
          </p>
        </div>
      )}
    </main>
  );
}
