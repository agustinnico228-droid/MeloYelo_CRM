import "server-only";
import { unstable_cache } from "next/cache";
import type {
  Announcement,
  Campaign,
  Dashboard,
  Guide,
  KnownIssue,
  Page,
} from "@/payload-types";
import { DEFAULT_NAV, filterNav, navAudiencesFor, type NavNode } from "./nav";
import type { Role } from "./roles";

/**
 * Read-side access to Payload content. Every call degrades gracefully:
 * no DATABASE_URI (or a down database) means empty content, never a
 * broken page — the CRM works without the CMS.
 *
 * Reads are served from the Next data cache: the tags line up with the
 * publish-time hooks in src/payload/revalidate.ts, so an editor's save
 * appears instantly while ordinary page views cost zero database
 * round-trips (the database is a ~300ms round trip from NZ). The TTL is
 * only a safety net. Draft reads (admin live preview) bypass the cache.
 */

const cmsCache = <A extends unknown[], R>(
  key: string,
  tags: string[],
  revalidate: number,
  fn: (...args: A) => Promise<R>,
): ((...args: A) => Promise<R>) =>
  unstable_cache(fn, [key], { tags, revalidate });

export function isCmsConfigured(): boolean {
  return Boolean(process.env.DATABASE_URI);
}

async function payloadClient() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

/** Content audiences a hub role may see. */
function audiencesFor(role: Role | null): string[] {
  if (role === "manager" || role === "admin")
    return ["all", "managers", "agents"];
  return ["all", "agents"];
}

async function fetchActiveAnnouncements(
  role: Role | null,
): Promise<Announcement[]> {
  if (!isCmsConfigured()) return [];
  try {
    const payload = await payloadClient();
    const now = new Date().toISOString();
    const res = await payload.find({
      collection: "announcements",
      where: {
        and: [
          { published: { equals: true } },
          {
            or: [
              { startsAt: { exists: false } },
              { startsAt: { less_than_equal: now } },
            ],
          },
          {
            or: [
              { endsAt: { exists: false } },
              { endsAt: { greater_than_equal: now } },
            ],
          },
        ],
      },
      sort: "-createdAt",
      limit: 20,
    });
    const allowed = audiencesFor(role);
    return res.docs.filter((a) => allowed.includes(a.audience));
  } catch {
    return [];
  }
}

export const getActiveAnnouncements = cmsCache(
  "announcements",
  ["cms:announcements"],
  60,
  fetchActiveAnnouncements,
);

async function fetchGuides(role: Role | null): Promise<Guide[]> {
  if (!isCmsConfigured()) return [];
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "guides",
      where: { _status: { equals: "published" } },
      limit: 100,
    });
    const allowed = audiencesFor(role);
    return res.docs.filter((g) => allowed.includes(g.audience));
  } catch {
    return [];
  }
}

export const getGuides = cmsCache("guides", ["cms:guides"], 60, fetchGuides);

async function fetchGuide(
  slug: string,
  role: Role | null,
  opts: { draft?: boolean } = {},
): Promise<Guide | null> {
  if (!isCmsConfigured()) return null;
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "guides",
      where: opts.draft
        ? { slug: { equals: slug } }
        : {
            and: [
              { slug: { equals: slug } },
              { _status: { equals: "published" } },
            ],
          },
      draft: opts.draft ?? false,
      limit: 1,
    });
    const guide = res.docs[0] ?? null;
    if (!guide) return null;
    return audiencesFor(role).includes(guide.audience) ? guide : null;
  } catch {
    return null;
  }
}

const cachedGuide = cmsCache(
  "guide",
  ["cms:guides"],
  60,
  (slug: string, role: Role | null) => fetchGuide(slug, role),
);

export async function getGuide(
  slug: string,
  role: Role | null,
  opts: { draft?: boolean } = {},
): Promise<Guide | null> {
  return opts.draft
    ? fetchGuide(slug, role, { draft: true })
    : cachedGuide(slug, role);
}

async function fetchKnownIssues(): Promise<KnownIssue[]> {
  if (!isCmsConfigured()) return [];
  try {
    const payload = await payloadClient();
    const res = await payload.find({ collection: "knownIssues", limit: 100 });
    return res.docs;
  } catch {
    return [];
  }
}

export const getKnownIssues = cmsCache(
  "known-issues",
  ["cms:knownIssues"],
  60,
  fetchKnownIssues,
);

async function fetchOpenKnownIssueCount(): Promise<number> {
  if (!isCmsConfigured()) return 0;
  try {
    const payload = await payloadClient();
    const res = await payload.count({
      collection: "knownIssues",
      where: { status: { not_equals: "fixed" } },
    });
    return res.totalDocs;
  } catch {
    return 0;
  }
}

export const getOpenKnownIssueCount = cmsCache(
  "known-issue-count",
  ["cms:knownIssues"],
  60,
  fetchOpenKnownIssueCount,
);

/** Nav tree: CMS global when populated, intranet-mirroring fallback otherwise. */
async function fetchNavigation(role: Role | null): Promise<NavNode[]> {
  const allowed = navAudiencesFor(role);
  if (!isCmsConfigured()) return filterNav(DEFAULT_NAV, allowed);
  try {
    const payload = await payloadClient();
    const nav = await payload.findGlobal({ slug: "navigation" });
    const items = nav.items ?? [];
    if (items.length === 0) return filterNav(DEFAULT_NAV, allowed);
    const nodes: NavNode[] = items.map((i) => ({
      label: i.label,
      url: i.url ?? undefined,
      audience: i.audience,
      children: (i.children ?? []).map((c) => ({
        label: c.label,
        url: c.url,
        audience: c.audience,
      })),
    }));
    return filterNav(nodes, allowed);
  } catch {
    return filterNav(DEFAULT_NAV, allowed);
  }
}

export const getNavigation = cmsCache(
  "navigation",
  ["cms:navigation"],
  300,
  fetchNavigation,
);

/**
 * Resolve a content page by its full path slug (§13.2). Pass
 * `{ draft: true }` (admin live preview only) to see the newest
 * autosaved draft instead of the published version.
 */
async function fetchPageBySlug(
  path: string,
  opts: { draft?: boolean } = {},
): Promise<Page | null> {
  if (!isCmsConfigured()) return null;
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "pages",
      where: opts.draft
        ? { slug: { equals: path } }
        : {
            and: [
              { slug: { equals: path } },
              { _status: { equals: "published" } },
            ],
          },
      draft: opts.draft ?? false,
      limit: 1,
    });
    return res.docs[0] ?? null;
  } catch {
    return null;
  }
}

const cachedPageBySlug = cmsCache(
  "page-by-slug",
  ["cms:pages"],
  60,
  (path: string) => fetchPageBySlug(path),
);

export async function getPageBySlug(
  path: string,
  opts: { draft?: boolean } = {},
): Promise<Page | null> {
  return opts.draft
    ? fetchPageBySlug(path, { draft: true })
    : cachedPageBySlug(path);
}

async function fetchDashboards(role: Role | null): Promise<Dashboard[]> {
  if (!isCmsConfigured()) return [];
  try {
    const payload = await payloadClient();
    const res = await payload.find({ collection: "dashboards", limit: 50 });
    const allowed = audiencesFor(role);
    return res.docs.filter((d) => allowed.includes(d.audience));
  } catch {
    return [];
  }
}

export const getDashboards = cmsCache(
  "dashboards",
  ["cms:dashboards"],
  300,
  fetchDashboards,
);

async function fetchDashboard(
  slug: string,
  role: Role | null,
): Promise<Dashboard | null> {
  if (!isCmsConfigured()) return null;
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "dashboards",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    const doc = res.docs[0] ?? null;
    if (!doc) return null;
    return audiencesFor(role).includes(doc.audience) ? doc : null;
  } catch {
    return null;
  }
}

export const getDashboard = cmsCache(
  "dashboard",
  ["cms:dashboards"],
  300,
  fetchDashboard,
);

async function fetchCampaigns(): Promise<Campaign[]> {
  if (!isCmsConfigured()) return [];
  try {
    const payload = await payloadClient();
    const res = await payload.find({ collection: "campaigns", limit: 100 });
    return res.docs;
  } catch {
    return [];
  }
}

export const getCampaigns = cmsCache(
  "campaigns",
  ["cms:campaigns"],
  60,
  fetchCampaigns,
);

async function fetchCampaign(slug: string): Promise<Campaign | null> {
  if (!isCmsConfigured()) return null;
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "campaigns",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    return res.docs[0] ?? null;
  } catch {
    return null;
  }
}

export const getCampaign = cmsCache(
  "campaign",
  ["cms:campaigns"],
  60,
  fetchCampaign,
);

export interface LookerUrls {
  agent: string;
  manager: string;
  growth: string;
}

/** Looker embed URLs: Settings global first, env fallback (§11). */
async function fetchLookerUrls(): Promise<LookerUrls> {
  const fromEnv: LookerUrls = {
    agent: process.env.LOOKER_AGENT_REPORT_URL ?? "",
    manager: process.env.LOOKER_MANAGER_REPORT_URL ?? "",
    growth: process.env.LOOKER_GROWTH_REPORT_URL ?? "",
  };
  if (!isCmsConfigured()) return fromEnv;
  try {
    const payload = await payloadClient();
    const settings = await payload.findGlobal({ slug: "settings" });
    return {
      agent: settings.looker?.agentReportUrl || fromEnv.agent,
      manager: settings.looker?.managerReportUrl || fromEnv.manager,
      growth: settings.looker?.growthReportUrl || fromEnv.growth,
    };
  } catch {
    return fromEnv;
  }
}

export const getLookerUrls = cmsCache(
  "looker-urls",
  ["cms:settings"],
  300,
  fetchLookerUrls,
);

async function fetchQuickLinks(role: Role | null) {
  if (!isCmsConfigured()) return [];
  try {
    const payload = await payloadClient();
    const res = await payload.find({ collection: "quickLinks", limit: 100 });
    const allowed = audiencesFor(role);
    return res.docs.filter((q) => allowed.includes(q.audience));
  } catch {
    return [];
  }
}

export const getQuickLinks = cmsCache(
  "quick-links",
  ["cms:quickLinks"],
  300,
  fetchQuickLinks,
);

/** Server-side audit sink (§10.5). Throws on failure so callers can fall back. */
export async function createAuditEntry(data: {
  summary: string;
  actorEmail: string;
  action: string;
  uniqueId: string;
  field: string;
  oldValue: string;
  newValue: string;
}): Promise<void> {
  const payload = await payloadClient();
  await payload.create({
    collection: "auditLog",
    data,
    overrideAccess: true,
  });
}
