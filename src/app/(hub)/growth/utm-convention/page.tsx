import type { Metadata } from "next";
import PageBlocks from "@/components/PageBlocks";
import UtmBuilder, { type UtmCampaignOption } from "@/components/UtmBuilder";
import { getCampaigns, getPageBySlug } from "@/lib/cms";
import { requireEffectiveUser } from "@/lib/view-as";

export const metadata: Metadata = { title: "Campaign Naming & UTM Convention" };
export const dynamic = "force-dynamic";

/** Known campaign codes, for environments without the CMS connected. */
const FALLBACK_CAMPAIGNS: UtmCampaignOption[] = [
  { title: "SuperGold Card", code: "supergold-card", status: "live" },
  { title: "2604 Fuel Crisis", code: "2604-fuel-crisis", status: "paused" },
  {
    title: "2606 Supertrail Champagne",
    code: "2606-supertrail-champagne",
    status: "live",
  },
  {
    title: "2607 Find Your Perfect E-Bike",
    code: "2607-find-your-perfect-e-bike",
    status: "planned",
  },
];

export default async function UtmConventionPage() {
  await requireEffectiveUser();

  const [page, cmsCampaigns] = await Promise.all([
    getPageBySlug("growth/utm-convention"),
    getCampaigns(),
  ]);

  const campaigns: UtmCampaignOption[] =
    cmsCampaigns.length > 0
      ? cmsCampaigns
          .filter((c) => c.status !== "ended")
          .map((c) => ({
            title: c.title,
            code: c.utmCampaign || c.code || c.slug,
            landingPageUrl: c.landingPageUrl ?? undefined,
            status: c.status,
          }))
      : FALLBACK_CAMPAIGNS;

  return (
    <main className="mx-auto max-w-[72ch] space-y-6 p-4 sm:p-6">
      <h1 className="text-h2">{page?.title ?? "Campaign Naming & UTM Convention"}</h1>

      {page?.layout && page.layout.length > 0 ? (
        <div id="page-content">
          <PageBlocks blocks={page.layout} />
        </div>
      ) : (
        <div className="rich-text rounded-card border border-my-line bg-my-surface p-5 shadow-card">
          <p>
            <strong>The convention:</strong> campaigns are named{" "}
            <code>YYMM-shortname</code> (e.g. <code>2604-fuel-crisis</code>).
            Every tagged link carries at least <code>utm_source</code>,{" "}
            <code>utm_medium</code> and <code>utm_campaign</code> — and{" "}
            <strong>
              utm_campaign must exactly match the official campaign name.
            </strong>
          </p>
        </div>
      )}

      <UtmBuilder campaigns={campaigns} />
    </main>
  );
}
