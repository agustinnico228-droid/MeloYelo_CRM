import "server-only";
import type { Announcement, Guide, KnownIssue } from "@/payload-types";
import type { Role } from "./roles";

/**
 * Read-side access to Payload content. Every call degrades gracefully:
 * no DATABASE_URI (or a down database) means empty content, never a
 * broken page — the CRM works without the CMS.
 */

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
  if (role === "manager" || role === "admin") return ["all", "managers", "agents"];
  return ["all", "agents"];
}

export async function getActiveAnnouncements(
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

export async function getGuides(role: Role | null): Promise<Guide[]> {
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

export async function getGuide(
  slug: string,
  role: Role | null,
): Promise<Guide | null> {
  if (!isCmsConfigured()) return null;
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "guides",
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
      },
      limit: 1,
    });
    const guide = res.docs[0] ?? null;
    if (!guide) return null;
    return audiencesFor(role).includes(guide.audience) ? guide : null;
  } catch {
    return null;
  }
}

export async function getKnownIssues(): Promise<KnownIssue[]> {
  if (!isCmsConfigured()) return [];
  try {
    const payload = await payloadClient();
    const res = await payload.find({ collection: "knownIssues", limit: 100 });
    return res.docs;
  } catch {
    return [];
  }
}

export async function getOpenKnownIssueCount(): Promise<number> {
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

export interface LookerUrls {
  agent: string;
  manager: string;
  growth: string;
}

/** Looker embed URLs: Settings global first, env fallback (§11). */
export async function getLookerUrls(): Promise<LookerUrls> {
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

export async function getQuickLinks(role: Role | null) {
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
