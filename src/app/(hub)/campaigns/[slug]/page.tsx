import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getCampaign } from "@/lib/cms";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Campaign" };
export const dynamic = "force-dynamic";

function dateLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireUser();
  const campaign = await getCampaign(slug);
  if (!campaign) notFound();

  const starts = dateLabel(campaign.startsAt);
  const ends = dateLabel(campaign.endsAt);

  return (
    <main className="mx-auto max-w-[72ch] p-4 sm:p-6">
      <Link href="/campaigns" className="text-sm text-my-slate underline">
        ← All campaigns
      </Link>
      <article className="mt-3 rounded-card border border-my-line bg-my-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-h2">{campaign.title}</h1>
          <span className="rounded-full border border-my-line bg-my-paper px-2.5 py-0.5 text-sm font-medium capitalize">
            {campaign.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-my-slate">
          {[
            campaign.code,
            campaign.channel ? campaign.channel.replace("-", " ") : null,
            starts && ends
              ? `${starts} – ${ends}`
              : (starts ?? (ends ? `until ${ends}` : null)),
            typeof campaign.budget === "number"
              ? `budget $${campaign.budget.toLocaleString("en-NZ")}`
              : null,
            campaign.utmCampaign ? `UTM: ${campaign.utmCampaign}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {campaign.statusNote ? (
          <p className="mt-4 rounded-control border border-my-warn/40 bg-my-warn/10 px-4 py-3 text-sm">
            {campaign.statusNote}
          </p>
        ) : null}

        {campaign.snapshot ? (
          <div className="rich-text mt-6">
            <RichText data={campaign.snapshot} />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {campaign.landingPageUrl ? (
            <a
              href={campaign.landingPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center rounded-control bg-my-yellow px-4 font-bold text-my-ink transition-opacity hover:opacity-90"
            >
              Open landing page
            </a>
          ) : null}
          {(campaign.reportLinks ?? []).map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center rounded-control border border-my-line bg-my-surface px-4 font-medium transition-colors hover:bg-my-paper"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </article>
    </main>
  );
}
