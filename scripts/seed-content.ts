/**
 * Seed content manifest — every intranet page ported into the Hub
 * (addendum Part C / §13.3), plus dashboards and campaigns.
 *
 * Grounding rule: pages whose substance appears in the addendum carry
 * that real content. Pages whose intranet content was NOT supplied get
 * the correct title/slug/nav position and a clearly-marked
 * "content to be added by an admin" callout — nothing is invented.
 */

/* Lexical builders + seed types live in ./lexical (shared with the
   seed-parts/ modules); re-exported here for backwards compatibility. */
import {
  bold,
  callout,
  doc,
  h2,
  link,
  ol,
  p,
  rt,
  text,
  ul,
  type RichTextDoc,
  type SeedPage,
} from "./lexical";
import { CAMPAIGN_OVERRIDES, EXTRA_PAGES, GUIDE_OVERRIDES } from "./seed-parts";

export * from "./lexical";
export { ANNOUNCEMENTS, KNOWN_ISSUES } from "./seed-parts";

/* ── shared stub wording ──────────────────────────────────────────── */

const STUB = doc(
  p(
    bold("Content to be added. "),
    text(
      "This page was created from the intranet structure so links and navigation work, but its content wasn't in the export the Hub was built from. An admin can paste the real content in the admin area. Nothing here was auto-written.",
    ),
  ),
);

/* ── pages (addendum Part C + full intranet port) ─────────────────── */

const BASE_PAGES: SeedPage[] = [
  {
    title: "News from HQ",
    slug: "news",
    section: "top",
    grounded: true,
    // Ported verbatim from sites.google.com/meloyelo.nz/intranet/news-from-hq.
    // Each monthly update links straight to its Campaign Monitor web
    // version (createsend.com), same as the intranet page does.
    blocks: [
      rt(
        doc(
          p(
            "We publish monthly updates and news and email these to every MeloYelo agent. From April 2026 we're also putting links on this page to each update.",
          ),
          p(
            bold("April 2026: "),
            link(
              "to view the update please click here.",
              "https://createsend.com/t/i-8EFDAB70DDFAE17F2540EF23F30FEDED",
            ),
          ),
          p(
            bold("May 2026: "),
            link(
              "to view the update please click here.",
              "https://createsend.com/t/i-7D8398EAE5EC9F0C2540EF23F30FEDED",
            ),
          ),
        ),
      ),
    ],
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
            bold("14-16 August"),
            text(" at "),
            bold("Lakeland Resort Taupō"),
            text("."),
          ),
          p(
            "When booking your accommodation, quote booking code ",
            bold("#98332"),
            text("."),
          ),
        ),
      ),
      callout(
        "info",
        doc(
          p(
            bold("Three-day agenda: "),
            text(
              "the agenda exists on the intranet but wasn't part of the export. An admin can paste it here.",
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
            "The Ride Guide is Emma (rideguide@meloyelo.nz). She calls website leads to get them booked onto a test ride, working alongside, never instead of, the regional agent.",
          ),
          p(
            bold(
              "The Ride Guide handles ONLY leads with Source = Website Form. ",
            ),
            text(
              "Leads an agent entered themselves always stay with that agent and never enter the Ride Guide queue.",
            ),
          ),
          p(
            "Before calling, the Ride Guide checks the lead's notes: if the agent has already made contact, the lead is skipped.",
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
          p(
            "The Ride Guide queue in this hub lists the website leads to work, most urgent first: /ride-guide/queue",
          ),
          p(
            "The call flow (steps, outcomes and exact wording): /ride-guide/call-flow",
          ),
          p(
            "Booking hours, calendar rules and locations: /ride-guide/booking-protocol",
          ),
        ),
      ),
    ],
  },
  {
    title: "Ride Guide: Test Ride Times, Calendar Bookings and Locations",
    slug: "ride-guide/booking-protocol",
    section: "crm",
    grounded: true,
    // Ported verbatim from the intranet page.
    blocks: [
      rt(
        doc(
          p(
            "To help Ride Guide and agents work from the same base, we're introducing a simple set of booking protocols for test rides booked by Ride Guide.",
          ),
          h2("Standard test ride times"),
          p(
            "Test rides will be booked by the Ride Guide within the following hours:",
          ),
          ul(
            [bold("Autumn and winter: "), text("9.00am to 6.00pm")],
            [bold("Spring and summer: "), text("9.00am to 7.30pm")],
          ),
          p(
            "Ride Guide will only book test rides for you within these hours and only into times and days that are not already blocked out or booked in your MeloYelo Google Calendar. If the customer is wanting to book a test ride within the next 24 hours the Ride Guide will first try and conference you in on the call to set a time, if you can't be contacted the ride will be booked into the next available time in your Calendar.",
          ),
          p(
            "Test rides will also only be booked at one of your approved test ride locations.",
          ),
          h2("Why we are using Google Calendar"),
          p(
            "We will use each agent's Google Calendar to manage test ride bookings.",
          ),
          p("This has some clear benefits:"),
          ul(
            "both you and the customer can receive a calendar booking and reminder",
            "all your test rides are visible in one place",
            "you can see them in the context of your other appointments and commitments",
            "it reduces back-and-forth and helps avoid double-booking",
            "it gives Ride Guide a simple and reliable way to confirm a booking while the customer is on the phone",
          ),
          h2("What this means for you"),
          p(
            "For this to work well, you will need to actively manage your calendar.",
          ),
          p(
            "That means blocking out times (or days) when you are not available for test rides, including:",
          ),
          ul(
            "holidays or leave",
            "other work or personal commitments",
            "times that are already spoken for",
            "any periods when you simply do not want test rides to be booked",
          ),
          p(
            "If a time is not blocked out in your calendar, Ride Guide will treat it as available.",
          ),
          h2("Test ride locations"),
          p(
            "As a starting point, we would like to be able to offer customers a choice of:",
          ),
          ul("their place", "your place", "a nearby park"),
          p(
            link(
              "Please use this form to confirm the three locations that apply for your area.",
              "https://forms.gle/f9AnpMZP8ojKqqwX7",
            ),
            text(
              " Once these are confirmed, the Ride Guide (Emma) will be able to offer those options to the customer when speaking with them on the phone.",
            ),
          ),
          p(
            "The aim is to keep the booking process simple and consistent, while still giving customers some flexibility and making test rides easier to arrange.",
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
            "If still interested, aim to book a test ride",
            "If not ready, agree a follow-up or offer email updates",
            "Always end with a clear outcome",
          ),
          h2("Outcomes and what they record"),
          ul(
            'Test ride booked -> Stage: Test Ride Booked - note "Call outcome: Test ride booked"',
            'Follow up later -> Stage: Made contact - note "Call outcome: Follow up later - requested contact again in {n} {unit}"',
            'Email nurture only -> Stage: Made contact - note "Call outcome: Email nurture only - not ready for a test ride"',
            'Declined (not interested) -> Stage: Test Ride Declined - note "Call outcome: Test ride declined - no longer interested"',
            'Declined (bought elsewhere) -> Stage: Test Ride Declined - note "Call outcome: Test ride declined - bought elsewhere"',
            'No answer -> Stage: Contact Failed - note "Call outcome: No answer after {n} attempts"',
          ),
          h2("Unsubscribes"),
          p(
            "When a test ride is declined, the record is flagged for unsubscribe from marketing emails unless the person asks to stay on the list. Flags land on the Pending unsubscribes list on the System page and are actioned manually in Campaign Monitor. Nothing is unsubscribed automatically.",
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
          ul(
            "Link click",
            "CTR (click-through rate)",
            "CPC (cost per click)",
            "Spend",
          ),
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
            "Values are lowercase and hyphen-separated, no spaces",
          ),
          p(
            bold("The key rule: "),
            text(
              "utm_campaign must EXACTLY match the official campaign name. A typo splits the campaign's reporting in two, silently.",
            ),
          ),
          p(
            "Use the builder below this page. It picks utm_campaign from the live campaign list so it can't be mistyped, and corrects formatting as you type.",
          ),
          h2("A/B variants"),
          p(
            "Variants of one campaign are distinguished by utm_content (for example no-incentive vs incentive), never by inventing a second campaign name. That keeps them comparable under one utm_campaign while remaining separate ad-platform campaigns for budget control.",
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
        "Open Today to see the leads that need action. Tap Call to ring them, then Update to change the stage and add a note. That's the whole loop.",
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
        "Lead: new, not yet touched",
        "Made contact: conversation started",
        "Contact Failed: tried, couldn't reach them; needs attention",
        "Test Ride Booked: the key commercial moment",
        "Test Ride Completed: progressing",
        "Test Ride Declined: closed",
        "Offer Accepted: winning",
        "Offer Declined: closed",
        "MY Customer: won",
      ),
      p(
        bold("Stages move forward only, but you may skip. "),
        text(
          "You can jump a lead straight from Lead to Test Ride Booked, but never move one backwards. The CRM records the time of every stage change automatically, so you never need to note the date yourself.",
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
        "If a lead arrives with a missing or malformed postcode, routing fails and the lead lands on the managers' unassigned list. Fixing the postcode on the record routes it automatically. No manual assignment needed.",
      ),
      p(
        bold("Note: "),
        text(
          "the intranet's detail on caretaker vs franchise territories and the three-step postcode update process wasn't in the export. An admin can paste it here.",
        ),
      ),
    ),
  },
  {
    title: "How new leads are assigned",
    slug: "lead-assignment",
    summary:
      "Postcode routing for marketing leads; agent-entered leads stay put.",
    audience: "all",
    grounded: true,
    content: doc(
      p("Two rules cover every new lead:"),
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
    summary:
      "Why MY Customer counts jumped in June 2026, and why stage accuracy matters.",
    audience: "all",
    grounded: true,
    content: doc(
      p(
        "In June 2026, warranty registrations were imported into the CRM. Every registered owner became a record at the MY Customer stage, which is why MY Customer counts jumped sharply that month.",
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
        "Use these on the first call. They tell you which bike to bring and when to offer.",
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
        '"Your MeloYelo Google account ensures you have automatic and secure access."',
      ),
      p(
        bold("Content to be added. "),
        text(
          "The full introduction wasn't in the export the Hub was built from. An admin can paste it in the admin area. This is the most-linked page in notification emails, so the old intranet URL redirects here.",
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
    description: "The Looker Studio website & email analytics report.",
    audience: "all",
  },
  {
    title: "CRM Dashboard (legacy)",
    slug: "crm-legacy",
    description:
      "The original Data Studio agent dashboard (MY Dashboard - agent). Kept during the transition. The Hub's native Leads, Pipeline and Today screens replace it.",
    audience: "all",
  },
  {
    title: "Managers Dashboard",
    slug: "manager",
    description:
      "Cross-agent visibility: the report built without the per-agent email filter.",
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
  endsAt?: string;
  budget?: number;
  landingPageUrl?: string;
  snapshot: RichTextDoc;
}

const CAMPAIGN_STUB = doc(
  p(
    bold("Snapshot to be added. "),
    text(
      "The campaign exists on the intranet but its snapshot copy wasn't in the export. An admin can paste it here.",
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
      "Offer listed as expiring 18 June 2026. Check with Greg whether it has lapsed.",
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
    statusNote: "Paused 28 May awaiting finance options (Qcard, FinanceNow).",
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
          "The campaign name already exists in the Drive folder. For the Meta A/B test, version A and B are distinguished by utm_content (no-incentive / incentive), never by inventing two campaign names, so both variants stay comparable under this one utm_campaign while remaining separate Meta campaigns for budget control.",
        ),
      ),
    ),
  },
];

/* ── merge in the full intranet port (seed-parts/) ────────────────── */

const overriddenSlugs = new Set(EXTRA_PAGES.map((pg) => pg.slug));

/** Base structure pages, with full-port pages replacing their stubs. */
export const SEED_PAGES: SeedPage[] = [
  ...BASE_PAGES.filter((pg) => !overriddenSlugs.has(pg.slug)),
  ...EXTRA_PAGES,
];

for (const o of GUIDE_OVERRIDES) {
  const g = SEED_GUIDES.find((gd) => gd.slug === o.slug);
  if (g) {
    g.content = o.content;
    if (o.summary) g.summary = o.summary;
    g.grounded = true;
  }
}

for (const o of CAMPAIGN_OVERRIDES) {
  const c = SEED_CAMPAIGNS.find((cp) => cp.slug === o.slug);
  if (c) {
    c.snapshot = o.snapshot;
    if (o.statusNote !== undefined) c.statusNote = o.statusNote;
    if (o.landingPageUrl) c.landingPageUrl = o.landingPageUrl;
    if (o.endsAt) c.endsAt = o.endsAt;
  }
}
