/**
 * Growth & Marketing intranet pages, ported verbatim into the CMS seed.
 */
import {
  bold,
  callout,
  doc,
  h2,
  h3,
  link,
  linkCards,
  p,
  rt,
  text,
  ul,
  type SeedPage,
} from "../lexical";

export const GROWTH_PAGES: SeedPage[] = [
  {
    title: "Growth targets Q1: Andy, Niki, Greg",
    slug: "growth/targets-q1",
    section: "growth",
    grounded: true,
    blocks: [
      rt(
        doc(
          h2("MeloYelo Q1 Goals"),
          h3("Consolidated Goals for Niki, Greg, and Andy"),
          p(
            link(
              "This document details the current Q1 goals for Niki, Greg, and Andy.",
              "https://docs.google.com/document/d/1P5SyNtHvpflSs1yUSqad0Bp7SNeZGQCop3BWEK63EOk/edit",
            ),
          ),
          p(
            text(
              "This worksheet breaks down the targets into measurable metrics. ",
            ),
            text("(Ask Andy for the worksheet link if you don't have access.)"),
          ),
        ),
      ),
    ],
  },
  {
    title: "Growth Team Meetings - notes and actions",
    slug: "growth/meetings",
    section: "growth",
    grounded: true,
    blocks: [
      rt(
        doc(
          p(
            "Meeting notes and actions live in the shared Google Doc. Access is restricted to the growth team (request access with your meloyelo.nz account if you need it).",
          ),
        ),
      ),
      linkCards([
        {
          label: "Growth Team Meetings - notes and actions",
          url: "https://sites.google.com/meloyelo.nz/intranet/growth-marketing/growth-team-meetings-notes-and-actions",
          description: "Opens the meeting notes (Drive access required)",
        },
      ]),
    ],
  },
  {
    title: "Google Ads Reports",
    slug: "growth/google-ads",
    section: "growth",
    grounded: true,
    blocks: [
      rt(
        doc(
          p(
            "Google Ads campaign analysis reports are added here as campaigns complete.",
          ),
        ),
      ),
      callout(
        "info",
        doc(
          p(
            bold("No reports yet. "),
            text(
              "The intranet page currently has no report entries. New analyses will appear here.",
            ),
          ),
        ),
      ),
    ],
  },
  {
    title: "Meta Ads Reports",
    slug: "growth/meta-ads",
    section: "growth",
    grounded: true,
    blocks: [
      rt(
        doc(
          h2("20260218 - No Brainer"),
          p(bold("Objective: "), text("Traffic - Town'n Trail page")),
          p(bold("Top KPI: "), text("CTR (All): 3.38%, CPC: $0.26")),
          p("Updated: 24 February 2026"),
        ),
      ),
      rt(
        doc(
          h2("20260203 - Confidence to Ride"),
          p(bold("Objective: "), text("Traffic - Book a Test Ride page")),
          p(bold("Top KPI: "), text("CTR (All): 3.64%, CPC: $0.34")),
          p("Updated: 24 February 2026"),
        ),
      ),
      callout(
        "info",
        doc(
          p(
            bold("Ad previews: "),
            text(
              "the Facebook ad preview images from the intranet page weren't in the export. An admin can upload them here.",
            ),
          ),
        ),
      ),
    ],
  },
  {
    title: "Metrics definitions",
    slug: "growth/metrics",
    section: "growth",
    grounded: true,
    blocks: [
      rt(
        doc(
          h2("Unified Metrics Defined"),
          p(
            bold("Link click"),
            text(" = outbound click from the ad to the MeloYelo website"),
          ),
          p(
            bold("CTR"),
            text(" = link clicks / impressions (expressed in %0.00)"),
          ),
          p(bold("CPC"), text(" = Spend / Link Clicks (expressed in $0.00)")),
          p(bold("Spend"), text(" = total spend for ad placement")),
          h2("Update Frequency"),
          p("Metrics to be updated every ?? days"),
        ),
      ),
    ],
  },
  {
    title: "Campaign Naming and UTM Convention",
    slug: "growth/utm-convention",
    section: "growth",
    showToc: true,
    grounded: true,
    blocks: [
      callout(
        "info",
        doc(
          p(bold("Quick reference:")),
          p(bold("Campaign naming format: "), text("YYMM-shortname")),
          p(bold("Example: "), text("2604-fuel-crisis")),
          p(
            bold("Minimum UTM requirement: "),
            text("utm_source, utm_medium, utm_campaign"),
          ),
          p(
            bold("Key rule: "),
            text(
              "The utm_campaign value must exactly match the official MeloYelo campaign name. Example: Campaign name: 2604-fuel-crisis -> UTM campaign: 2604-fuel-crisis",
            ),
          ),
        ),
      ),
      rt(
        doc(
          h2("Purpose"),
          p(
            "This document sets the standard naming convention for MeloYelo promotional campaigns and the UTM parameters used to track them.",
          ),
          p("The aim is to ensure consistency across:"),
          ul(
            "creative file naming",
            "Meta ads",
            "Google Ads",
            "EDMs",
            "internal reporting",
            "agency reporting",
          ),
          p(
            "Using one shared convention will make campaigns easier to identify, sort, track and report on across all platforms.",
          ),
        ),
      ),
      rt(
        doc(
          h2("1. Campaign naming convention"),
          h3("Standard format"),
          p("YYMM-shortname"),
          h3("Example"),
          p("2604-fuel-crisis"),
          h3("Rules"),
          ul(
            "YYMM = the year and month the campaign begins",
            "use a short descriptive campaign name after the hyphen",
            "use lowercase",
            "use hyphens instead of spaces",
            "keep the shortname concise and clear",
            "avoid punctuation or special characters unless genuinely necessary",
          ),
          h3("Examples"),
          p("2604-fuel-crisis"),
          p("2605-supergold-offer"),
          p("2606-zoomin-urban"),
          p("2607-auckland-test-rides"),
          h3("Why this format is used"),
          ul(
            "campaigns sort correctly in chronological order in Google Sheets and other systems",
            "the name is short and practical for use across ad platforms and file names",
            "one shared campaign name can be used consistently across reporting and tracking",
          ),
        ),
      ),
      rt(
        doc(
          h2("2. When the campaign name is assigned"),
          p(
            "The official campaign name must be assigned at the campaign briefing stage, before any creative files are produced, ads are built, or UTMs are created.",
          ),
          p(
            "This ensures one shared campaign name is used consistently from the outset across:",
          ),
          ul(
            "creative files",
            "Meta ads",
            "Google Ads",
            "EDMs",
            "reporting",
            "UTM tracking",
          ),
          p(
            "The campaign owner or campaign manager is responsible for assigning the official campaign name and ensuring it is used consistently.",
          ),
        ),
      ),
      rt(
        doc(
          h2("3. Where the campaign name should be used"),
          p("The standard campaign name should be used consistently in:"),
          ul(
            "Google Ads campaign naming",
            "Meta campaign naming",
            "creative file naming where relevant",
            "internal reports and tracking sheets",
            "agency reports",
            "utm_campaign",
          ),
          p(
            "This creates one shared campaign identifier across the whole marketing system.",
          ),
        ),
      ),
      rt(
        doc(
          h2("4. UTM naming convention"),
          h3("Minimum required UTM parameters"),
          p("All MeloYelo campaign links should include at minimum:"),
          ul("utm_source", "utm_medium", "utm_campaign"),
          h3("Standard approach"),
          ul(
            "use lowercase only",
            "use hyphens instead of spaces",
            "keep values clear and consistent",
            "use the exact campaign name in utm_campaign",
          ),
        ),
      ),
      rt(
        doc(
          h2("5. UTM definitions"),
          h3("utm_source"),
          p("Identifies the platform or sender."),
          p("Examples:"),
          ul("google", "meta", "campaign-monitor"),
          h3("utm_medium"),
          p("Identifies the traffic type."),
          p("Examples:"),
          ul("cpc", "paid-social", "email"),
          h3("utm_campaign"),
          p("Uses the MeloYelo campaign naming convention."),
          p("Example:"),
          ul("2604-fuel-crisis"),
        ),
      ),
      rt(
        doc(
          h2("6. Minimum UTM examples"),
          h3("Google Ads"),
          p("utm_source=google&utm_medium=cpc&utm_campaign=2604-fuel-crisis"),
          h3("Meta Ads"),
          p(
            "utm_source=meta&utm_medium=paid-social&utm_campaign=2604-fuel-crisis",
          ),
          h3("EDM"),
          p(
            "utm_source=campaign-monitor&utm_medium=email&utm_campaign=2604-fuel-crisis",
          ),
        ),
      ),
      rt(
        doc(
          h2("7. Optional UTM parameters"),
          p(
            "Additional parameters such as utm_content and utm_term may be used where helpful.",
          ),
          p("These are optional, not mandatory."),
          p(
            "Their use may be decided by the ad agency or campaign manager where more detailed tracking is useful, for example:",
          ),
          ul(
            "distinguishing between ad creatives",
            "distinguishing between multiple links within an EDM",
            "capturing keyword-level detail in search campaigns",
          ),
        ),
      ),
      rt(
        doc(
          h2("8. Policy summary"),
          p("MeloYelo promotional campaigns will use the following standard:"),
          h3("Campaign naming"),
          p("YYMM-shortname"),
          h3("Minimum UTM requirement"),
          p("utm_source, utm_medium, utm_campaign"),
          h3("Key rule"),
          p(
            "The utm_campaign value must exactly match the official MeloYelo campaign name.",
          ),
          p(
            "This standard applies across Google Ads, Meta ads, EDMs, creative naming and reporting.",
          ),
        ),
      ),
    ],
  },
  {
    title: "Marketing Reports",
    slug: "reports/marketing",
    section: "crm",
    grounded: true,
    blocks: [
      rt(doc(p("Marketing reports are published here as they're produced."))),
      callout(
        "info",
        doc(
          p(
            bold("No reports yet. "),
            text(
              "The intranet's Marketing Reports page is currently empty. New reports will appear here.",
            ),
          ),
        ),
      ),
    ],
  },
];
