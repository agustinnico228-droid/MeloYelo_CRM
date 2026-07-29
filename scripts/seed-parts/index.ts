/**
 * Full intranet port, one module per area (authored in parallel).
 * Everything funnels back into seed-content.ts, which stays the single
 * source of truth the seed and sync scripts read.
 */
import type { RichTextDoc, SeedPage } from "../lexical";
import { CAMPAIGN_SNAPSHOT_OVERRIDES } from "./campaigns";
import { CRM_DEVELOPMENT_PAGE } from "./crm-development";
import { CRM_PAGES, GUIDE_CONTENT_OVERRIDES } from "./crm-pages";
import { GROWTH_PAGES } from "./growth-pages";
import {
  ANNOUNCEMENT_SEED,
  KNOWN_ISSUE_SEED,
  RESOURCE_PAGES,
} from "./resources";

export interface GuideOverride {
  slug: string;
  summary?: string;
  content: RichTextDoc;
}

export interface CampaignOverride {
  slug: string;
  snapshot: RichTextDoc;
  statusNote?: string;
  landingPageUrl?: string;
  endsAt?: string;
}

export interface SeedKnownIssue {
  title: string;
  description: string;
  status: "open" | "investigating" | "fixed";
  affects?: string;
  workaround?: string;
  reportedAt?: string;
  fixedAt?: string;
}

export interface SeedAnnouncement {
  title: string;
  severity: "info" | "warning" | "critical";
  audience: "all" | "agents" | "managers";
}

export const EXTRA_PAGES: SeedPage[] = [
  ...CRM_PAGES,
  ...GROWTH_PAGES,
  ...RESOURCE_PAGES,
  CRM_DEVELOPMENT_PAGE,
];

export const GUIDE_OVERRIDES: GuideOverride[] = GUIDE_CONTENT_OVERRIDES;
export const CAMPAIGN_OVERRIDES: CampaignOverride[] =
  CAMPAIGN_SNAPSHOT_OVERRIDES;
export const KNOWN_ISSUES: SeedKnownIssue[] = KNOWN_ISSUE_SEED;
export const ANNOUNCEMENTS: SeedAnnouncement[] = ANNOUNCEMENT_SEED;
