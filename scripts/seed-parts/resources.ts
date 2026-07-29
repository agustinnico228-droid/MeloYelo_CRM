/**
 * Resources section pages + CRM Glitches history (known issues) +
 * announcement seed, ported verbatim from the MeloYelo intranet.
 */
import {
  bold,
  callout,
  doc,
  linkCards,
  p,
  rt,
  type SeedPage,
} from "../lexical";

export const RESOURCE_PAGES: SeedPage[] = [
  {
    title: "Resources",
    slug: "resources",
    section: "resources",
    grounded: true,
    blocks: [
      rt(doc(p("Shared resources for the MeloYelo team."))),
      linkCards([
        { label: "Agent Interviews", url: "/resources/agent-interviews" },
        { label: "Support", url: "/resources/support" },
        { label: "Product catalogue", url: "/resources/product-catalogue" },
        {
          label: "Test ride checklist",
          url: "/resources/test-ride-checklist",
        },
        { label: "Knowledge Base", url: "/resources/knowledge-base" },
      ]),
    ],
  },
  {
    title: "Agent Interviews",
    slug: "resources/agent-interviews",
    section: "resources",
    grounded: true,
    blocks: [
      rt(doc(p("Recorded interviews with MeloYelo agents."))),
      linkCards([
        {
          label: "Agent interview videos (Drive)",
          url: "https://drive.google.com/drive/folders/1Lzq6O8INJ1OQ2P7_c8hIxl_KE2RDBZOn",
          description: "Alistair, Graham, Juergen and Shane",
        },
      ]),
      callout(
        "info",
        doc(
          p(
            bold("Note: "),
            "the intranet page is currently empty apart from the videos. Content will grow here.",
          ),
        ),
      ),
    ],
  },
  {
    title: "Support",
    slug: "resources/support",
    section: "resources",
    grounded: true,
    blocks: [
      rt(doc(p("Support resources for agents."))),
      callout(
        "info",
        doc(
          p(
            bold("Content to come. "),
            "The intranet's Support page is currently empty. An admin can add content here.",
          ),
        ),
      ),
    ],
  },
  {
    title: "Product catalogue",
    slug: "resources/product-catalogue",
    section: "resources",
    grounded: true,
    blocks: [
      rt(doc(p("The MeloYelo product catalogue."))),
      callout(
        "info",
        doc(
          p(
            bold("Content to come. "),
            "The intranet's Product catalogue page is currently empty. An admin can add content here.",
          ),
        ),
      ),
    ],
  },
  {
    title: "Test ride checklist",
    slug: "resources/test-ride-checklist",
    section: "resources",
    grounded: true,
    blocks: [
      rt(doc(p("The checklist agents run through on every test ride."))),
      callout(
        "info",
        doc(
          p(
            bold("Content to come. "),
            "The intranet's Test ride checklist page is currently empty. An admin can add content here.",
          ),
        ),
      ),
    ],
  },
  {
    title: "Knowledge Base",
    slug: "resources/knowledge-base",
    section: "resources",
    grounded: true,
    blocks: [
      rt(doc(p("The MeloYelo knowledge base."))),
      callout(
        "info",
        doc(
          p(
            bold("Content to come. "),
            "The intranet's Knowledge Base page is currently empty. An admin can add content here.",
          ),
        ),
      ),
    ],
  },
];

/** CRM Glitches history, ported verbatim from the intranet (newest first). */
export const KNOWN_ISSUE_SEED: {
  title: string;
  description: string;
  status: "open" | "investigating" | "fixed";
  affects?: string;
  workaround?: string;
  reportedAt?: string;
  fixedAt?: string;
}[] = [
  {
    title: "Test ride notifications now going to the right agent",
    status: "fixed",
    reportedAt: "2026-07-21",
    fixedAt: "2026-07-21",
    description:
      'Lead notification emails have been arriving as "Hi ," with no agent name, and without the agent in the To field. This is now fixed for the main test ride booking form. Notifications show the agent\'s name and go directly to that agent.',
  },
  {
    title: "CRM update form is now fixed and can be updated on mobile devices",
    status: "fixed",
    reportedAt: "2026-06-30",
    fixedAt: "2026-07-03",
    description:
      "The issue with the form not updating when being accessed from a mobile (reported on the 30th) has now been resolved and you should be fine to access and update the CRM from the email notifications on your mobile phone.",
  },
  {
    title: "Greg away 4th-24th July. Please report any CRM issues to Andy",
    status: "open",
    reportedAt: "2026-07-02",
    description:
      "Greg's on leave from the 4th to the 24th July. During this time please report any issues with the CRM to Andy and he'll ask our tech team to look into it.",
  },
  {
    title: "CRM update form not responding on mobile devices",
    status: "fixed",
    reportedAt: "2026-06-30",
    fixedAt: "2026-07-03",
    affects: "CRM update form on mobile phones",
    workaround:
      "While you can view it on your mobile, please use a desktop or laptop to update CRM records.",
    description:
      "We've identified an issue affecting the CRM update form when it is opened on a mobile phone. The form opens and displays the correct customer information, but the fields, checkboxes and other controls do not respond to touch. The page can still be scrolled. The form continues to work normally on a desktop or laptop.",
  },
  {
    title: "Link in the email notification now fixed",
    status: "fixed",
    reportedAt: "2026-06-15",
    fixedAt: "2026-06-15",
    description:
      "The glitch has been found and fixed and the blue button on the email notification works once again and from both desktop and mobile devices. We'll continue to monitor as new leads come in.",
  },
];

export const ANNOUNCEMENT_SEED: {
  title: string;
  severity: "info" | "warning" | "critical";
  audience: "all" | "agents" | "managers";
}[] = [
  {
    title:
      "21st July, 1:17pm Test ride notifications now going to the right agent",
    severity: "info",
    audience: "all",
  },
];
