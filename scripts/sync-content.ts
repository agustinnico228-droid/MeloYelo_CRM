/**
 * Full intranet-port sync: pushes the current seed-content manifest into
 * the live CMS. Unlike seed.ts (create-only, idempotent), this UPDATES
 * existing documents so the Hub matches the intranet exactly.
 *
 *   npx payload run ./scripts/sync-content.ts
 *
 * Covers: pages (upsert + full layout overwrite), campaign snapshots,
 * guide overrides, known issues (upsert by title), announcements
 * (create-if-missing), dashboard Looker IDs, and the navigation global.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { DEFAULT_NAV } from "../src/lib/nav";
import { toLayout } from "./lexical";
import {
  ANNOUNCEMENTS,
  KNOWN_ISSUES,
  SEED_CAMPAIGNS,
  SEED_GUIDES,
  SEED_PAGES,
} from "./seed-content";

/** Looker Studio report IDs supplied by Greg/Gab (July 2026). */
const DASHBOARD_REPORT_IDS: Record<string, string> = {
  analytics: "8ee08062-a4ad-4898-b2bb-f996ab8c5dcd",
  growth: "815f5d0b-2b3b-47da-8faf-0dc6cea77488",
  "crm-legacy": "398e86d7-edb0-4a60-ad38-6bf556da9bec",
  // manager + ads: report IDs still needed from the team
};

const payload = await getPayload({ config });
let pagesCreated = 0;
let pagesUpdated = 0;

for (const page of SEED_PAGES) {
  const data = {
    title: page.title,
    slug: page.slug,
    section: page.section,
    showToc: page.showToc ?? false,
    audience: page.audience ?? ("all" as const),
    _status: "published" as const,
    layout: toLayout(page.blocks),
  };
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: page.slug } },
    limit: 1,
  });
  if (existing.docs[0]) {
    await payload.update({
      collection: "pages",
      id: existing.docs[0].id,
      data,
    });
    pagesUpdated++;
  } else {
    await payload.create({ collection: "pages", data });
    pagesCreated++;
  }
}
console.log(`pages: ${pagesUpdated} updated, ${pagesCreated} created`);

for (const g of SEED_GUIDES) {
  const existing = await payload.find({
    collection: "guides",
    where: { slug: { equals: g.slug } },
    limit: 1,
  });
  if (existing.docs[0]) {
    await payload.update({
      collection: "guides",
      id: existing.docs[0].id,
      data: {
        title: g.title,
        summary: g.summary,
        audience: g.audience,
        _status: "published",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: g.content as any,
      },
    });
  }
}
console.log(`guides: ${SEED_GUIDES.length} synced`);

for (const c of SEED_CAMPAIGNS) {
  const existing = await payload.find({
    collection: "campaigns",
    where: { slug: { equals: c.slug } },
    limit: 1,
  });
  if (existing.docs[0]) {
    await payload.update({
      collection: "campaigns",
      id: existing.docs[0].id,
      data: {
        title: c.title,
        code: c.code,
        status: c.status,
        statusNote: c.statusNote,
        channel: c.channel,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        budget: c.budget,
        landingPageUrl: c.landingPageUrl,
        utmCampaign: c.code,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snapshot: c.snapshot as any,
      },
    });
  }
}
console.log(`campaigns: ${SEED_CAMPAIGNS.length} synced`);

for (const issue of KNOWN_ISSUES) {
  const existing = await payload.find({
    collection: "knownIssues",
    where: { title: { equals: issue.title } },
    limit: 1,
  });
  if (existing.docs[0]) {
    await payload.update({
      collection: "knownIssues",
      id: existing.docs[0].id,
      data: issue,
    });
  } else {
    await payload.create({ collection: "knownIssues", data: issue });
  }
}
console.log(`known issues: ${KNOWN_ISSUES.length} synced`);

for (const a of ANNOUNCEMENTS) {
  const existing = await payload.find({
    collection: "announcements",
    where: { title: { equals: a.title } },
    limit: 1,
  });
  if (!existing.docs[0]) {
    await payload.create({
      collection: "announcements",
      data: { ...a, published: true },
    });
  }
}
console.log(`announcements: ${ANNOUNCEMENTS.length} ensured`);

for (const [slug, reportId] of Object.entries(DASHBOARD_REPORT_IDS)) {
  const existing = await payload.find({
    collection: "dashboards",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  if (existing.docs[0]) {
    await payload.update({
      collection: "dashboards",
      id: existing.docs[0].id,
      data: { lookerReportId: reportId },
    });
    console.log(`dashboard ${slug}: report ${reportId}`);
  }
}

// Navigation global: refresh from DEFAULT_NAV (mirrors the intranet tree).
await payload.updateGlobal({
  slug: "navigation",
  data: {
    items: DEFAULT_NAV.map((n) => ({
      label: n.label,
      url: n.url ?? "",
      audience: n.audience,
      children: (n.children ?? []).map((c) => ({
        label: c.label,
        url: c.url ?? "",
        audience: c.audience,
      })),
    })),
  },
});
console.log("navigation: refreshed from the intranet structure");

console.log("Sync complete");
process.exit(0);
