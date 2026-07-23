/**
 * Seed starter CMS content — the full intranet port (§13.3).
 * Requires DATABASE_URI (and PAYLOAD_SECRET).
 *
 *   SEED_ADMIN_EMAIL=you@meloyelo.nz SEED_ADMIN_PASSWORD=… npm run seed
 *
 * Idempotent: every document is looked up by slug/title first and
 * skipped if it already exists, so re-running never duplicates.
 */
import { getPayload, type Payload } from "payload";
import config from "../src/payload.config";
import { DEFAULT_NAV } from "../src/lib/nav";
import {
  SEED_CAMPAIGNS,
  SEED_DASHBOARDS,
  SEED_GUIDES,
  SEED_PAGES,
} from "./seed-content";

async function seedAdminUser(payload: Payload) {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.log("SEED_ADMIN_EMAIL/PASSWORD not set — skipping admin user");
    return;
  }
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: adminEmail } },
    limit: 1,
  });
  if (existing.totalDocs === 0) {
    await payload.create({
      collection: "users",
      data: { email: adminEmail, password: adminPassword, role: "admin" },
    });
    console.log(`Created admin user ${adminEmail}`);
  }
}

async function seedGuides(payload: Payload) {
  for (const guide of SEED_GUIDES) {
    const existing = await payload.find({
      collection: "guides",
      where: { slug: { equals: guide.slug } },
      limit: 1,
    });
    if (existing.totalDocs > 0) continue;
    await payload.create({
      collection: "guides",
      data: {
        title: guide.title,
        slug: guide.slug,
        summary: guide.summary,
        audience: guide.audience,
        _status: "published",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: guide.content as any,
      },
    });
    console.log(`guide: ${guide.slug}${guide.grounded ? "" : " (stub)"}`);
  }
}

async function seedPages(payload: Payload) {
  for (const page of SEED_PAGES) {
    const existing = await payload.find({
      collection: "pages",
      where: { slug: { equals: page.slug } },
      limit: 1,
    });
    if (existing.totalDocs > 0) continue;
    await payload.create({
      collection: "pages",
      data: {
        title: page.title,
        slug: page.slug,
        section: page.section,
        showToc: page.showToc ?? false,
        _status: "published",
        layout: page.blocks.map((b) =>
          b.blockType === "callout"
            ? {
                blockType: "callout" as const,
                tone: b.tone ?? "info",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: b.content as any,
              }
            : {
                blockType: "richText" as const,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: b.content as any,
              },
        ),
      },
    });
    console.log(`page: ${page.slug}${page.grounded ? "" : " (stub)"}`);
  }
}

async function seedDashboards(payload: Payload) {
  for (const dash of SEED_DASHBOARDS) {
    const existing = await payload.find({
      collection: "dashboards",
      where: { slug: { equals: dash.slug } },
      limit: 1,
    });
    if (existing.totalDocs > 0) continue;
    await payload.create({
      collection: "dashboards",
      data: {
        title: dash.title,
        slug: dash.slug,
        description: dash.description,
        audience: dash.audience,
        // Report IDs are pasted in by an admin once Greg provides them
        lookerReportId: "",
      },
    });
    console.log(`dashboard: ${dash.slug}`);
  }
}

async function seedCampaigns(payload: Payload) {
  for (const c of SEED_CAMPAIGNS) {
    const existing = await payload.find({
      collection: "campaigns",
      where: { slug: { equals: c.slug } },
      limit: 1,
    });
    if (existing.totalDocs > 0) continue;
    await payload.create({
      collection: "campaigns",
      data: {
        title: c.title,
        slug: c.slug,
        code: c.code,
        status: c.status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        offer: c.offer as any,
      },
    });
    console.log(`campaign: ${c.slug}`);
  }
}

async function seedNavigation(payload: Payload) {
  const nav = await payload.findGlobal({ slug: "navigation" });
  if ((nav.items ?? []).length > 0) return;
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
  console.log("navigation: seeded from the intranet structure");
}

async function seedMisc(payload: Payload) {
  const announcements = await payload.count({ collection: "announcements" });
  if (announcements.totalDocs === 0) {
    await payload.create({
      collection: "announcements",
      data: {
        title: "Welcome to the new CRM Hub",
        severity: "info",
        published: true,
        audience: "all",
      },
    });
    console.log("announcement: welcome");
  }

  const links = await payload.count({ collection: "quickLinks" });
  if (links.totalDocs === 0) {
    await payload.create({
      collection: "quickLinks",
      data: {
        label: "MeloYelo website",
        url: "https://www.meloyelo.nz",
        group: "Company",
        audience: "all",
      },
    });
    console.log("quick link: website");
  }
}

async function seed() {
  const payload = await getPayload({ config });

  await seedAdminUser(payload);
  await seedGuides(payload);
  await seedPages(payload);
  await seedDashboards(payload);
  await seedCampaigns(payload);
  await seedNavigation(payload);
  await seedMisc(payload);

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
