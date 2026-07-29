import type { Metadata } from "next";
import Link from "next/link";
import EditPencil from "@/components/EditPencil";
import { getDashboards, getLookerUrls, isCmsConfigured } from "@/lib/cms";
import { visibleLeads } from "@/lib/crm/access";
import { formatMinutes, speedToLeadStats } from "@/lib/crm/speed-to-lead";
import { hasRole } from "@/lib/session";
import { getCoreData } from "@/lib/sheets";
import { requireEffectiveUser } from "@/lib/view-as";

export const metadata: Metadata = { title: "Dashboards" };
export const dynamic = "force-dynamic";

function StlTile({
  label,
  median,
  excluded,
  sample,
}: {
  label: string;
  median: number | null;
  excluded: number;
  sample: number;
}) {
  return (
    <div className="rounded-card border border-my-line bg-my-surface p-4 shadow-card">
      <p className="text-sm text-my-slate">{label}</p>
      <p className="mt-1 text-h2 font-bold">
        {median === null ? "-" : formatMinutes(median)}
      </p>
      <p className="text-sm text-my-slate">
        median of {sample}
        {excluded > 0
          ? ` - ${excluded} outlier${excluded === 1 ? "" : "s"} excluded`
          : ""}
      </p>
    </div>
  );
}

export default async function DashboardsPage() {
  const { effective: user } = await requireEffectiveUser();
  const isManager = hasRole(user, "manager", "admin");

  const [core, cmsDashboards, legacyUrls] = await Promise.all([
    getCoreData(),
    getDashboards(user.role),
    getLookerUrls(),
  ]);

  // §15.3 — the Phase 4 median with 14-day outlier exclusion.
  const mine = visibleLeads(user, core.leads);
  const you = speedToLeadStats(mine.map((l) => l.speedToLeadMinutes));
  const all = speedToLeadStats(core.leads.map((l) => l.speedToLeadMinutes));

  const embeds =
    cmsDashboards.length > 0
      ? cmsDashboards.map((d) => ({
          slug: d.slug,
          title: d.title,
          description: d.description ?? "",
          connected: Boolean(d.lookerReportId),
        }))
      : // No CMS yet: fall back to env-configured reports
        [
          {
            slug: "analytics",
            title: "Website & Email Analytics",
            description: "",
            connected: Boolean(legacyUrls.agent),
          },
          ...(isManager
            ? [
                {
                  slug: "manager",
                  title: "Managers Dashboard",
                  description: "",
                  connected: Boolean(legacyUrls.manager),
                },
                {
                  slug: "growth",
                  title: "Growth Dashboard",
                  description: "",
                  connected: Boolean(legacyUrls.growth),
                },
              ]
            : []),
        ];

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <h1 className="text-h3">Dashboards</h1>

      <section>
        <h2 className="text-h3">Speed to lead</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StlTile
            label="You"
            median={you.medianMinutes}
            excluded={you.excludedCount}
            sample={you.sampleSize}
          />
          <StlTile
            label="All agents"
            median={all.medianMinutes}
            excluded={all.excludedCount}
            sample={all.sampleSize}
          />
        </div>
        <p className="mt-2 text-sm text-my-slate">
          Values over 14 days are excluded as data artefacts, so these medians
          can differ from the old Looker tiles, which include them.
        </p>
      </section>

      <section>
        <h2 className="text-h3">Reports</h2>
        {embeds.length === 0 ? (
          <div className="mt-3 rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
            <p className="font-medium">No reports configured yet.</p>
            <p className="mt-2 text-sm text-my-slate">
              {isCmsConfigured()
                ? "An admin can add dashboards in the admin area, no deploy needed."
                : "The content database isn't connected in this environment."}
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {embeds.map((d) => (
              <Link
                key={d.slug}
                href={`/dashboards/${d.slug}`}
                className="block rounded-card border border-my-line bg-my-surface p-4 shadow-card transition-colors hover:bg-my-paper"
              >
                <span className="font-bold">{d.title}</span>
                {d.description ? (
                  <span className="mt-1 block text-sm text-my-slate">
                    {d.description}
                  </span>
                ) : null}
                {!d.connected ? (
                  <span className="mt-2 inline-block rounded-full border border-my-warn/40 bg-my-warn/10 px-2.5 py-0.5 text-sm">
                    Report not connected yet
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        )}
        <p className="mt-3 text-sm text-my-slate">
          Your day-to-day numbers live on Today and Leads. This hub replaces the
          old agent Looker view.{" "}
          <Link href="/dashboards/analytics" className="underline">
            Open the old Looker dashboard
          </Link>{" "}
          (kept during the transition).
        </p>
      </section>

      <EditPencil
        href="/admin/collections/dashboards"
        label="Edit dashboards"
      />
    </main>
  );
}
