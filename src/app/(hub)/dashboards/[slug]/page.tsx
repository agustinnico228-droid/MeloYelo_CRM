import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDashboard, getLookerUrls } from "@/lib/cms";
import { requireEffectiveUser } from "@/lib/view-as";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

/** Legacy env fallback while the CMS dashboards collection is empty. */
const LEGACY_SLUG_TO_ENV: Record<string, "agent" | "manager" | "growth"> = {
  analytics: "agent",
  manager: "manager",
  growth: "growth",
};

export default async function DashboardEmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { effective: user } = await requireEffectiveUser();

  const doc = await getDashboard(slug, user.role);

  let title = doc?.title ?? "";
  let description = doc?.description ?? "";
  let embedUrl = "";
  let openUrl = "";

  if (doc?.lookerReportId) {
    embedUrl = `https://lookerstudio.google.com/embed/reporting/${doc.lookerReportId}${
      doc.lookerPageId ? `/page/${doc.lookerPageId}` : ""
    }`;
    openUrl = `https://lookerstudio.google.com/reporting/${doc.lookerReportId}`;
  } else if (!doc && slug in LEGACY_SLUG_TO_ENV) {
    const urls = await getLookerUrls();
    const legacy = urls[LEGACY_SLUG_TO_ENV[slug]];
    if (legacy) {
      embedUrl = legacy;
      openUrl = legacy;
      title = slug.charAt(0).toUpperCase() + slug.slice(1);
    }
  }

  if (!doc && !embedUrl) notFound();

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-h3">{title || "Dashboard"}</h1>
          {description ? (
            <p className="mt-1 text-sm text-my-slate">{description}</p>
          ) : null}
          {doc?.lastReviewed ? (
            <p className="mt-1 text-sm text-my-slate">
              Last reviewed{" "}
              {new Date(doc.lastReviewed).toLocaleDateString("en-NZ", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboards"
            className="flex min-h-12 items-center rounded-control border border-my-line bg-my-surface px-4 font-medium transition-colors hover:bg-my-paper"
          >
            All dashboards
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
        <div className="overflow-hidden rounded-card border border-my-line shadow-card">
          <iframe
            src={embedUrl}
            title={`${title || "Dashboard"} report`}
            className="aspect-[4/3] w-full sm:aspect-video"
            loading="lazy"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
          <p className="font-medium">This report isn&apos;t connected yet.</p>
          <p className="mt-2 text-sm text-my-slate">
            An admin can paste the Looker report ID into this dashboard in
            the admin area — no deploy needed.
          </p>
        </div>
      )}
    </main>
  );
}
