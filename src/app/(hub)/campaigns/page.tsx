import type { Metadata } from "next";
import Link from "next/link";
import { getCampaigns, isCmsConfigured } from "@/lib/cms";
import { requireUser } from "@/lib/session";
import type { Campaign } from "@/payload-types";

export const metadata: Metadata = { title: "Current campaigns" };
export const dynamic = "force-dynamic";

const STATUS_CLASSES: Record<string, string> = {
  live: "border-my-green/40 bg-my-green/10",
  planned: "border-my-line bg-my-paper",
  ended: "border-my-line bg-my-paper text-my-slate",
};

function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="block rounded-card border border-my-line bg-my-surface p-4 shadow-card transition-colors hover:bg-my-paper"
    >
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-h3">{campaign.title}</span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-sm font-medium capitalize ${STATUS_CLASSES[campaign.status]}`}
        >
          {campaign.status}
        </span>
      </span>
      {campaign.code ? (
        <span className="mt-1 block text-sm text-my-slate">
          {campaign.code}
        </span>
      ) : null}
    </Link>
  );
}

export default async function CampaignsPage() {
  await requireUser();
  const campaigns = await getCampaigns();

  const live = campaigns.filter((c) => c.status === "live");
  const planned = campaigns.filter((c) => c.status === "planned");
  const ended = campaigns.filter((c) => c.status === "ended");

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <h1 className="text-h3">Current campaigns</h1>

      {campaigns.length === 0 ? (
        <div className="rounded-card border border-my-line bg-my-surface p-8 text-center shadow-card">
          <p className="font-medium">No campaigns yet.</p>
          <p className="mt-2 text-sm text-my-slate">
            {isCmsConfigured()
              ? "An admin can add campaigns from the admin area."
              : "The content database isn't connected in this environment."}
          </p>
        </div>
      ) : (
        <>
          {[...live, ...planned].map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
          {ended.length > 0 ? (
            <details className="rounded-card border border-my-line bg-my-surface shadow-card">
              <summary className="min-h-12 cursor-pointer px-4 py-3 font-bold">
                Ended campaigns ({ended.length})
              </summary>
              <div className="space-y-3 p-4 pt-0">
                {ended.map((c) => (
                  <CampaignCard key={c.id} campaign={c} />
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}
    </main>
  );
}
