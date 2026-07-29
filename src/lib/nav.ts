/**
 * Navigation tree. The CMS `navigation` global is the source of truth
 * (drag-reorderable in /admin); this constant is the fallback when the
 * database isn't connected AND the seed source — it mirrors the real
 * intranet structure exactly (addendum Part C).
 */

export type NavAudience = "all" | "agents" | "managers";

export interface NavNode {
  label: string;
  /** Empty/absent = group heading */
  url?: string;
  audience: NavAudience;
  children?: NavNode[];
}

export const DEFAULT_NAV: NavNode[] = [
  { label: "Home", url: "/", audience: "all" },
  { label: "News from HQ", url: "/news", audience: "all" },
  { label: "Conference 2026", url: "/conference", audience: "all" },
  {
    label: "The Confidence to Win",
    url: "/confidence-to-win",
    audience: "all",
  },
  {
    label: "CRM",
    audience: "all",
    children: [
      {
        label: "Website & Email Analytics",
        url: "/dashboards/analytics",
        audience: "all",
      },
      { label: "Ride Guide", url: "/ride-guide", audience: "all" },
      {
        label: "Test Ride Times & Locations",
        url: "/ride-guide/booking-protocol",
        audience: "all",
      },
      {
        label: "Ride Guide Call Flow",
        url: "/ride-guide/call-flow",
        audience: "all",
      },
      { label: "CRM Dashboard", url: "/dashboards", audience: "all" },
      {
        label: "Managers Dashboard",
        url: "/dashboards/manager",
        audience: "all",
      },
      { label: "CRM Glitches", url: "/known-issues", audience: "all" },
      { label: "CRM Info & Instructions", url: "/guides", audience: "all" },
      {
        label: "Marketing Reports",
        url: "/reports/marketing",
        audience: "all",
      },
      {
        label: "CRM Development Notes",
        url: "/crm-development",
        audience: "managers",
      },
    ],
  },
  {
    label: "Current Campaigns",
    url: "/campaigns",
    audience: "all",
    children: [
      {
        label: "SuperGold Card",
        url: "/campaigns/supergold-card",
        audience: "all",
      },
      {
        label: "2604-fuel-crisis",
        url: "/campaigns/2604-fuel-crisis",
        audience: "all",
      },
      {
        label: "2606-supertrail-champagne",
        url: "/campaigns/2606-supertrail-champagne",
        audience: "all",
      },
    ],
  },
  {
    label: "Growth & Marketing",
    audience: "all",
    children: [
      {
        label: "Growth Dashboard",
        url: "/dashboards/growth",
        audience: "all",
      },
      {
        label: "Growth targets Q1",
        url: "/growth/targets-q1",
        audience: "all",
      },
      {
        label: "Growth Team Meetings",
        url: "/growth/meetings",
        audience: "all",
      },
      {
        label: "Ad Performance",
        url: "/dashboards/ads",
        audience: "all",
      },
      {
        label: "Google Ads Analysis",
        url: "/growth/google-ads",
        audience: "all",
      },
      {
        label: "Meta Ads Analysis",
        url: "/growth/meta-ads",
        audience: "all",
      },
      {
        label: "Metrics definitions",
        url: "/growth/metrics",
        audience: "all",
      },
      {
        label: "Campaign Naming & UTM Convention",
        url: "/growth/utm-convention",
        audience: "all",
      },
    ],
  },
  {
    label: "Resources",
    url: "/resources",
    audience: "all",
    children: [
      {
        label: "Agent Interviews",
        url: "/resources/agent-interviews",
        audience: "all",
      },
      { label: "Support", url: "/resources/support", audience: "all" },
      {
        label: "Product catalogue",
        url: "/resources/product-catalogue",
        audience: "all",
      },
      {
        label: "Test ride checklist",
        url: "/resources/test-ride-checklist",
        audience: "all",
      },
      {
        label: "Knowledge Base",
        url: "/resources/knowledge-base",
        audience: "all",
      },
    ],
  },
];

/** Which nav audiences a hub role sees. */
export function navAudiencesFor(
  role: "agent" | "ride_guide" | "manager" | "admin" | null,
): NavAudience[] {
  if (role === "manager" || role === "admin")
    return ["all", "agents", "managers"];
  return ["all", "agents"];
}

export function filterNav(nodes: NavNode[], allowed: NavAudience[]): NavNode[] {
  return nodes
    .filter((n) => allowed.includes(n.audience))
    .map((n) => ({
      ...n,
      children: n.children ? filterNav(n.children, allowed) : undefined,
    }))
    .filter((n) => n.url || (n.children && n.children.length > 0));
}
