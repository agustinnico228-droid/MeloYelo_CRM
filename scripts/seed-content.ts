/**
 * Seed content manifest — every intranet page ported into the Hub
 * (addendum Part C / §13.3), plus dashboards and campaigns.
 *
 * Grounding rule: pages whose substance appears in the addendum carry
 * that real content. Pages whose intranet content was NOT supplied get
 * the correct title/slug/nav position and a clearly-marked
 * "content to be added by an admin" callout — nothing is invented.
 */

/* ── minimal lexical builders ─────────────────────────────────────── */

interface LexNode {
  [key: string]: unknown;
}

export const text = (t: string): LexNode => ({
  type: "text",
  version: 1,
  text: t,
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
});

export const bold = (t: string): LexNode => ({ ...text(t), format: 1 });

export const p = (...children: (string | LexNode)[]): LexNode => ({
  type: "paragraph",
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  textFormat: 0,
  children: children.map((c) => (typeof c === "string" ? text(c) : c)),
});

export const h2 = (t: string): LexNode => ({
  type: "heading",
  tag: "h2",
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: [text(t)],
});

const listItem = (t: string, value: number): LexNode => ({
  type: "listitem",
  version: 1,
  value,
  direction: "ltr",
  format: "",
  indent: 0,
  children: [text(t)],
});

export const ul = (...items: string[]): LexNode => ({
  type: "list",
  listType: "bullet",
  tag: "ul",
  version: 1,
  start: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: items.map((t, i) => listItem(t, i + 1)),
});

export const ol = (...items: string[]): LexNode => ({
  type: "list",
  listType: "number",
  tag: "ol",
  version: 1,
  start: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: items.map((t, i) => listItem(t, i + 1)),
});

export const doc = (...children: LexNode[]) => ({
  root: {
    type: "root",
    version: 1,
    direction: "ltr",
    format: "",
    indent: 0,
    children,
  },
});

/* ── shared stub wording ──────────────────────────────────────────── */

const STUB = doc(
  p(
    bold("Content to be added. "),
    text(
      "This page was created from the intranet structure so links and navigation work, but its content wasn't in the export the Hub was built from. An admin can paste the real content in the admin area — nothing here was auto-written.",
    ),
  ),
);

/* ── pages (addendum Part C) ──────────────────────────────────────── */

type RichTextDoc = ReturnType<typeof doc>;

export interface SeedBlock {
  blockType: "richText" | "callout";
  tone?: "info" | "success" | "warning" | "alert";
  content: RichTextDoc;
}

export interface SeedPage {
  title: string;
  slug: string;
  section: "top" | "crm" | "growth" | "campaigns" | "resources";
  showToc?: boolean;
  /** true = grounded content from the addendum; false = marked stub */
  grounded: boolean;
  blocks: SeedBlock[];
}

const rt = (content: RichTextDoc): SeedBlock => ({
  blockType: "richText",
  content,
});
const callout = (
  tone: "info" | "warning",
  content: RichTextDoc,
): SeedBlock => ({ blockType: "callout", tone, content });

export const SEED_PAGES: SeedPage[] = [
  {
    title: "News from HQ",
    slug: "news",
    section: "top",
    grounded: false,
    blocks: [callout("info", STUB)],
  },
  {
    title: "Conference 2026",
    slug: "conference",
    section: "top",
    grounded: true,
    blocks: [
      rt(
        doc(
          p(
            "The MeloYelo Conference 2026 runs ",
            bold("14–16 August"),
            text(" at "),
            bold("Lakeland Resort Taupō"),
            text("."),
          ),
          p("When booking your accommodation, quote booking code ", bold("#98332"), text(".")),
        ),
      ),
      callout(
        "info",
        doc(
          p(
            bold("Three-day agenda: "),
            text(
              "the agenda exists on the intranet but wasn't part of the export — an admin can paste it here.",
            ),
          ),
        ),
      ),
    ],
  },
  {
    title: "The Confidence to Win",
    slug: "confidence-to-win",
    section: "top",
    grounded: false,
    blocks: [callout("info", STUB)],
  },
  {
    title: "Ride Guide",
    slug: "ride-guide",
    section: "crm",
    grounded: true,
    blocks: [
      rt(
        doc(
          p(
            "The Ride Guide is Emma (rideguide@meloyelo.nz). She calls website leads to get them booked onto a test ride, working alongside — never instead of — the regional agent.",
          ),
          p(
            bold("The Ride Guide handles ONLY leads with Source = Website Form. "),
            text(
              "Leads an agent entered themselves always stay with that agent and never enter the Ride Guide queue.",
            ),
          ),
          p(
            "Before calling, the Ride Guide checks the lead's notes — if the agent has already made contact, the lead is skipped.",
          ),
        ),
      ),
      callout(
        "info",
        doc(
          p(
            bold("What this means for you (eight points): "),
            text(
              "the intranet lists eight points for agents; they weren't in the export. An admin can paste them here.",
            ),
          ),
        ),
      ),
      rt(
        doc(
          h2("Tools"),
          p("The Ride Guide queue in this hub lists the website leads to work, most urgent first: /ride-guide/queue"),
          p("The call flow — steps, outcomes and exact wording: /ride-guide/call-flow"),
          p("Booking hours, calendar rules and locations: /ride-guide/booking-protocol"),
        ),
      ),
    ],
  },
  {
    title: "Test Ride Times, Calendar & Locations",
    slug: "ride-guide/booking-protocol",
    section: "crm",
    grounded: true,
    blocks: [
      rt(
        doc(
          h2("Standard hours"),
          ul(
            "Autumn / winter: 9:00 – 18:00",
            "Spring / summer: 9:00 – 19:30",
          ),
          h2("Locations"),
          p(
            "Three location options are offered when booking. Confirm the location with the rider and record it on the booking.",
          ),
          p(
            "Test-ride location form: https://forms.gle/f9AnpMZP8ojKqqwX7",
          ),
          p(
            "Public booking page: https://meloyelo.nz/book-ebike-test-ride/",
          ),
        ),
      ),
      callout(
        "info",
        doc(
          p(
            bold("Calendar rules: "),
            text(
              "the detailed calendar rules from the intranet weren't in the export — an admin can paste them here.",
            ),
          ),
        ),
      ),
    ],
  },
  {
    title: "Ride Guide Call Flow",
    slug: "ride-guide/call-flow",
    section: "crm",
    showToc: true,
    grounded: true,
    blocks: [
      rt(
        doc(
          p(
            "The five steps of every Ride Guide call. In the hub, the guided call panel on each lead walks through these and records the outcome in one action.",
          ),
          h2("The five steps"),
          ol(
            "Still interested in an e-bike?",
            "Already bought one?",
            "If still interested — aim to book a test ride",
            "If not ready — agree a follow-up, or offer email updates",
            "Always end with a clear outcome",
          ),
          h2("Outcomes and what they record"),
          ul(
            "Test ride booked → Stage: Test Ride Booked · note “Call outcome: Test ride booked”",
            "Follow up later → Stage: Made contact · note “Call outcome: Follow up later - requested contact again in {n} {unit}”",
            "Email nurture only → Stage: Made contact · note “Call outcome: Email nurture only - not ready for a test ride”",
            "Declined — not interested → Stage: Test Ride Declined · note “Call outcome: Test ride declined - no longer interested”",
            "Declined — bought elsewhere → Stage: Test Ride Declined · note “Call outcome: Test ride declined - bought elsewhere”",
            "No answer → Stage: Contact Failed · note “Call outcome: No answer after {n} attempts”",
          ),
          h2("Unsubscribes"),
          p(
            "When a test ride is declined, the record is flagged for unsubscribe from marketing emails unless the person asks to stay on the list. Flags land on the Pending unsubscribes list on the System page and are actioned manually in Campaign Monitor — nothing is unsubscribed automatically.",
          ),
        ),
      ),
    ],
  },
  {
    title: "Marketing Reports",
    slug: "reports/marketing",
    section: "crm",
    grounded: false,
    blocks: [callout("info", STUB)],
  },
  {
    title: "Growth targets Q1",
    slug: "growth/targets-q1",
    section: "growth",
    grounded: false,
    blocks: [callout("info", STUB)],
  },
  {
    title: "Growth Team Meetings",
    slug: "growth/meetings",
    section: "growth",
    grounded: false,
    blocks: [callout("info", STUB)],
  },
  {
    title: "Google Ads Analysis",
    slug: "growth/google-ads",
    section: "growth",
    grounded: false,
    blocks: [callout("info", STUB)],
  },
  {
    title: "Meta Ads Analysis",
    slug: "growth/meta-ads",
    section: "growth",
    grounded: false,
    blocks: [callout("info", STUB)],
  },
  {
    title: "Metrics definitions",
    slug: "growth/metrics",
    section: "growth",
    grounded: true,
    blocks: [
      rt(
        doc(
          p(
            "One set of definitions so every report means the same thing. The four unified metrics:",
          ),
          ul("Link click", "CTR (click-through rate)", "CPC (cost per click)", "Spend"),
        ),
      ),
      callout(
        "warning",
        doc(
          p(
            bold("Exact definitions to paste: "),
            text(
              "the intranet's precise wording for each metric wasn't in the export. An admin should paste the agreed definitions here so Google and Meta reporting stay comparable.",
            ),
          ),
        ),
      ),
    ],
  },
  {
    title: "Campaign Naming & UTM Convention",
    slug: "growth/utm-convention",
    section: "growth",
    grounded: true,
    blocks: [
      rt(
        doc(
          h2("The convention"),
          ul(
            "Campaign naming format: YYMM-shortname (example: 2604-fuel-crisis)",
            "Minimum UTMs on every tagged link: utm_source, utm_medium, utm_campaign",
            "Values are lowercase and hyphen-separated — no spaces",
          ),
          p(
            bold("The key rule: "),
            text(
              "utm_campaign must EXACTLY match the official campaign name. A typo splits the campaign's reporting in two, silently.",
            ),
          ),
          p(
            "Use the builder below this page — it picks utm_campaign from the live campaign list so it can't be mistyped, and corrects formatting as you type.",
          ),
          h2("A/B variants"),
          p(
            "Variants of one campaign are distinguished by utm_content (for example no-incentive vs incentive), never by inventing a second campaign name — that keeps them comparable under one utm_campaign while remaining separate ad-platform campaigns for budget control.",
          ),
        ),
      ),
    ],
  },
  {
    title: "Resources",
    slug: "resources",
    section: "resources",
    grounded: false,
    blocks: [callout("info", STUB)],
  },
];

/* ── guides (addendum §13.3) ──────────────────────────────────────── */

export interface SeedGuide {
  title: string;
  slug: string;
  summary: string;
  audience: "all" | "agents" | "managers";
  grounded: boolean;
  content: RichTextDoc;
}

export const SEED_GUIDES: SeedGuide[] = [
  {
    title: "Getting started with the hub",
    slug: "getting-started",
    summary:
      "Sign in, find your leads, make your first call and update a stage.",
    audience: "all",
    grounded: true,
    content: doc(
      p(
        "Open Today to see the leads that need action. Tap Call to ring them, then Update to change the stage and add a note — that's the whole loop.",
      ),
    ),
  },
  {
    title: "Stages explained",
    slug: "stages-explained",
    summary: "The nine stages every lead moves through, in order.",
    audience: "all",
    grounded: true,
    content: doc(
      p("Every lead moves through nine stages, in this order:"),
      ol(
        "Lead — new, not yet touched",
        "Made contact — conversation started",
        "Contact Failed — tried, couldn't reach them; needs attention",
        "Test Ride Booked — the key commercial moment",
        "Test Ride Completed — progressing",
        "Test Ride Declined — closed",
        "Offer Accepted — winning",
        "Offer Declined — closed",
        "MY Customer — won",
      ),
      p(
        bold("Stages move forward only, but you may skip. "),
        text(
          "You can jump a lead straight from Lead to Test Ride Booked, but never move one backwards. The CRM records the time of every stage change automatically — you never need to note the date yourself.",
        ),
      ),
      p(
        bold("Editor's note: "),
        text(
          "the old intranet version of this page listed eight stages and omitted Contact Failed. The CRM data and every other document use all nine, so it has been corrected here. Flagged to Greg.",
        ),
      ),
    ),
  },
  {
    title: "How postcodes are assigned",
    slug: "postcode-assignment",
    summary: "How a postcode decides which agent gets a lead.",
    audience: "all",
    grounded: true,
    content: doc(
      p(
        "Marketing and website leads are routed by postcode: the CRM looks the postcode up in the routing table and assigns the matching agent. Regions are covered either by a caretaker agent or a franchise owner.",
      ),
      p(
        "If a lead arrives with a missing or malformed postcode, routing fails and the lead lands on the managers' unassigned list. Fixing the postcode on the record routes it automatically — no manual assignment needed.",
      ),
      p(
        bold("Note: "),
        text(
          "the intranet's detail on caretaker vs franchise territories and the three-step postcode update process wasn't in the export — an admin can paste it here.",
        ),
      ),
    ),
  },
  {
    title: "How new leads are assigned",
    slug: "lead-assignment",
    summary: "Postcode routing for marketing leads; agent-entered leads stay put.",
    audience: "all",
    grounded: true,
    content: doc(
      p(
        "Two rules cover every new lead:",
      ),
      ul(
        "Marketing and website leads are assigned by postcode, using the routing table.",
        "Leads an agent enters themselves always belong to that agent, regardless of postcode.",
      ),
      p(
        "That second rule is why a lead you add through Add lead never gets re-routed away from you, even if the postcode belongs to another region.",
      ),
    ),
  },
  {
    title: "Warranty Registrations in the CRM",
    slug: "warranty-registrations",
    summary: "Why MY Customer counts jumped in June 2026, and why stage accuracy matters.",
    audience: "all",
    grounded: true,
    content: doc(
      p(
        "In June 2026, warranty registrations were imported into the CRM. Every registered owner became a record at the MY Customer stage — which is why MY Customer counts jumped sharply that month.",
      ),
      p(
        bold("Why stage accuracy now matters more: "),
        text(
          "email campaigns target people by stage. If a record sits at the wrong stage, that person gets the wrong emails. Keeping stages current is what keeps the marketing list honest.",
        ),
      ),
    ),
  },
  {
    title: "The new test ride booking form",
    slug: "new-test-ride-form",
    summary: "What the public booking form now collects.",
    audience: "all",
    grounded: true,
    content: doc(
      p(
        "The public test-ride form (https://meloyelo.nz/book-ebike-test-ride/) now collects more than contact details. New fields:",
      ),
      ul(
        "Model interest",
        "Riding distance",
        "Preferred days",
        "Preferred time",
        "Whether a partner will ride too",
        "Campaign",
      ),
      p(
        "Use these on the first call — they tell you which bike to bring and when to offer.",
      ),
    ),
  },
  {
    title: "Introduction for pilot program agents",
    slug: "introduction",
    summary: "The pilot-program introduction, ported from the intranet.",
    audience: "agents",
    grounded: false,
    content: doc(
      p(
        "“Your MeloYelo Google account ensures you have automatic and secure access.”",
      ),
      p(
        bold("Content to be added. "),
        text(
          "The full introduction wasn't in the export the Hub was built from — an admin can paste it in the admin area. This is the most-linked page in notification emails, so the old intranet URL redirects here.",
        ),
      ),
    ),
  },
];

/* ── dashboards (§13.1) ───────────────────────────────────────────── */

export interface SeedDashboard {
  title: string;
  slug: string;
  description: string;
  audience: "all" | "agents" | "managers";
}

export const SEED_DASHBOARDS: SeedDashboard[] = [
  {
    title: "Website & Email Analytics",
    slug: "analytics",
    description:
      "The Looker Studio analytics report. Also where the old MY Dashboard - agent lives during the transition.",
    audience: "all",
  },
  {
    title: "Managers Dashboard",
    slug: "manager",
    description:
      "Cross-agent visibility — the report built without the per-agent email filter.",
    audience: "managers",
  },
  {
    title: "Growth Dashboard",
    slug: "growth",
    description: "Growth & marketing performance.",
    audience: "managers",
  },
  {
    title: "Ad Performance",
    slug: "ads",
    description: "Paid advertising performance across platforms.",
    audience: "managers",
  },
];

/* ── campaigns ────────────────────────────────────────────────────── */

export interface SeedCampaign {
  title: string;
  slug: string;
  code: string;
  status: "planned" | "live" | "paused" | "ended";
  statusNote?: string;
  channel?: "google-ads" | "meta" | "print" | "email" | "multi";
  startsAt?: string;
  budget?: number;
  snapshot: RichTextDoc;
}

const CAMPAIGN_STUB = doc(
  p(
    bold("Snapshot to be added. "),
    text(
      "The campaign exists on the intranet but its snapshot copy wasn't in the export — an admin can paste it here.",
    ),
  ),
);

/** The four real campaigns from the intranet (Phase 17 C2). */
export const SEED_CAMPAIGNS: SeedCampaign[] = [
  {
    title: "SuperGold Card",
    slug: "supergold-card",
    code: "supergold-card",
    status: "live",
    statusNote:
      "Offer listed as expiring 18 June 2026 — check with Greg whether it has lapsed.",
    snapshot: doc(
      p("$500 off SuperLite and SuperTrail for SuperGold Card holders."),
      p(bold("Expiry on the intranet: 18 June 2026.")),
    ),
  },
  {
    title: "2604 Fuel Crisis",
    slug: "2604-fuel-crisis",
    code: "2604-fuel-crisis",
    status: "paused",
    statusNote:
      "Paused 28 May awaiting finance options (Qcard, FinanceNow).",
    channel: "google-ads",
    startsAt: "2026-04-24",
    budget: 6000,
    snapshot: doc(
      p(
        "Google Ads only. Started Friday 24 April 2026, planned to run 60 days with a $6,000 budget.",
      ),
      p("Paused 28 May awaiting finance options (Qcard, FinanceNow)."),
    ),
  },
  {
    title: "2606 Supertrail Champagne",
    slug: "2606-supertrail-champagne",
    code: "2606-supertrail-champagne",
    status: "live",
    snapshot: CAMPAIGN_STUB,
  },
  {
    title: "2607 Find Your Perfect E-Bike",
    slug: "2607-find-your-perfect-e-bike",
    code: "2607-find-your-perfect-e-bike",
    status: "planned",
    channel: "meta",
    snapshot: doc(
      p(
        bold("The quiz pilot campaign. "),
        text(
          "The campaign name already exists in the Drive folder. For the Meta A/B test, version A and B are distinguished by utm_content (no-incentive / incentive) — never by inventing two campaign names — so both variants stay comparable under this one utm_campaign while remaining separate Meta campaigns for budget control.",
        ),
      ),
    ),
  },
];
