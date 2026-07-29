import {
  bold,
  callout,
  doc,
  h2,
  h3,
  link,
  p,
  rt,
  text,
  ul,
  type SeedPage,
} from "../lexical";

/**
 * Gab / Greg CRM development working notes — the shared working space
 * for the next stage of CRM development, from Greg's document
 * (July 2026). Managers-only: it contains the agreed rate and budget.
 * Both of them edit it live in /admin as decisions land.
 */

export const CRM_DEVELOPMENT_PAGE: SeedPage = {
  title: "CRM Development: Gab / Greg Working Notes",
  slug: "crm-development",
  section: "crm",
  showToc: true,
  audience: "managers",
  grounded: true,
  blocks: [
    rt(
      doc(
        p(
          bold("Purpose: "),
          "our shared working space for the next stage of MeloYelo CRM development: list the main developments required, agree priorities, capture questions from Gab, add context and notes, keep a simple record of decisions, and break each development into clear, manageable steps. A practical working document, not a polished one. Edit it in the admin area as things progress.",
        ),
        p(
          bold("Background: "),
          "the CRM is built on Google Sheets, Google Forms, Apps Script, Zapier, Campaign Monitor and Looker Studio. The Customer Data - master sheet is the source of truth. It now works well enough to start adding more data sources and improving how leads, customers and warranty registrations are captured and reported.",
        ),
        p(
          link(
            "Greg's CRM overview video for Gab",
            "https://cloud.digimark.co.nz/2hPpFWT4",
          ),
        ),
        h2("Working arrangement"),
        ul(
          "Gab handles CRM development work separately from his existing Data Analyst work, invoiced separately (separate CRM development budget approved by Rob).",
          "Current agreed rate: US$10/hour. Initial estimate: around 30 hours.",
          "Likely to become an ongoing development and improvement project rather than a one-off task.",
        ),
      ),
    ),

    rt(
      doc(
        h2("Priority 1: Call Centre leads into the CRM"),
        p(
          bold("Objective: "),
          "bring Call Centre leads into the CRM in a structured, trackable way.",
        ),
        p(
          "The Call Centre generates a cumulative sheet each morning with all calls handled so far this month. Only type ",
          bold('BIKE - "VIEW OR TEST RIDE"'),
          " is added to the CRM (Greg will reiterate accurate Type selection to the call centre).",
        ),
        ul(
          "Map to CRM fields: First Name, Last Name, Phone Number, Email Address, Post Code.",
          "'Message / Description' and 'Call Logs' both go into the Notes field.",
          "Source = 'Call Centre'.",
          [
            bold("Intake is into New contact submissions"),
            text(
              ": the same intake process as Website Form leads, assigned by postcode.",
            ),
          ],
          "New Zap triggered when a lead with Source = Call Centre lands in All data.",
        ),
        h3("Questions from Gab (drafted, edit freely)"),
        ul(
          "Where does the daily Call Centre sheet live (link), and are its headers stable? Please add the sample to this page.",
          "The sheet is cumulative: what's the dedupe key so a row is only imported once (a call ID, or phone + call date)?",
          'Is the Type value exactly "BIKE - VIEW OR TEST RIDE", and can casing/spacing vary?',
          "'Call Centre' already exists as a Source value on some rows. Reuse it, or does this pipeline need distinguishing from the old daily-report imports?",
          "Calls with a missing or unknown postcode will land unassigned on the managers' list. Acceptable, or should there be a default owner?",
          "What should the new Zap do: the same agent notification email as Website Form leads? Built in your Zapier account?",
          "What time does the morning sheet land (NZ time), so the import runs right after it?",
        ),
        h3("Greg's notes / answers"),
        p("To be filled in."),
        h3("Agreed next steps"),
        p("To be filled in."),
      ),
    ),

    rt(
      doc(
        h2("Priority 2: Zoomin test ride requests and leads"),
        p(
          bold("Objective: "),
          "bring test ride requests and leads from the Zoomin Bikes website (separate site, Contact Form 7) into the CRM.",
        ),
        ul(
          "How Zoomin form submissions are currently stored or emailed.",
          "Whether the form captures all required CRM fields. It may not capture postcode, which affects agent assignment.",
          "Whether Zoomin leads get a Source value such as 'Zoomin Website Form'.",
          "How these records are assigned to agents, and whether they flow into New contact submissions or a separate intake path.",
          "How duplicates are handled if the person already exists in the CRM.",
        ),
        h3("Questions from Gab (drafted, edit freely)"),
        ul(
          "Where do CF7 submissions go today: email only, or stored (e.g. Flamingo)? Can I get WordPress admin access?",
          "Can we add a required postcode field to the Zoomin form? If not, what's the assignment fallback?",
          "A new Source value ('Zoomin Website Form') ripples into Looker filters and Campaign Monitor segments. Confirm before first import.",
          "Should Zoomin leads enter the Ride Guide queue like Website Form leads, or stay agent-only?",
          "Duplicate rule: match by email against All data before creating a new record?",
        ),
        h3("Greg's notes / answers"),
        p("To be filled in."),
        h3("Agreed next steps"),
        p("To be filled in."),
      ),
    ),

    rt(
      doc(
        h2("Priority 3: Historic warranty registrations"),
        p(
          bold("Objective: "),
          "import or match historic warranty registrations against existing CRM contacts.",
        ),
        ul(
          "Match primarily by email address.",
          "Email exists in both -> update the CRM record; matched records automatically become MY Customer.",
          "Email not in the CRM -> create a new contact. May surface customers who bought directly through agents and bypassed the lead flow.",
          "Preserve useful warranty fields: model, serial number, purchase date, delivery date, agent.",
          "Duplicates: for discussion.",
        ),
        h3("Questions from Gab (drafted, edit freely)"),
        ul(
          "Where is the historic warranty data (sheet or export)? Please link it here.",
          "If an email matches two or more CRM records, should those go to a manual review list rather than auto-updating?",
          "Stage jump to MY Customer is forward-only compatible, but if a matched record is mid-pipeline (e.g. Test Ride Booked), jump it anyway or flag for review?",
          "All data has Model and Serial columns, but no purchase-date or delivery-date columns, and we never add columns to All data. Keep those in the Notes entry, or in a separate linked sheet keyed by Unique ID?",
          "For newly created contacts: Source = 'Warranty Registration', and assignment by the registration's agent field or by postcode?",
        ),
        h3("Greg's notes / answers"),
        p("To be filled in."),
        h3("Agreed next steps"),
        p("To be filled in."),
      ),
    ),

    rt(
      doc(
        h2("Priority 4: Ongoing warranty registrations"),
        p(
          bold("Objective: "),
          "an ongoing process so new warranty registrations are captured, matched and reflected in the CRM from now on.",
        ),
        ul(
          "Where new warranty registrations currently land.",
          "Whether to manage the whole process from the CRM, including the EDMs (instead of WordPress).",
          "Separate warranty sheet, pulled into the CRM, or both; automatic CRM update on registration.",
          "Duplicate matching; updating existing records when a lead becomes a customer.",
          "Whether warranty details sit in All data, a separate linked sheet, or both, and the effect on new-rider reporting.",
        ),
        h3("Questions from Gab (drafted, edit freely)"),
        ul(
          "What receives a registration today (WordPress form -> where)?",
          "If EDMs move to the CRM, does Campaign Monitor remain the sender, and what's in that sequence today?",
          "Automatic CRM update: run through the same New contact submissions batch (consistent IDs and assignment) or a dedicated warranty intake tab?",
        ),
        h3("Greg's notes / answers"),
        p("To be filled in."),
        h3("Agreed next steps"),
        p("To be filled in."),
      ),
    ),

    rt(
      doc(
        h2("General CRM development principles"),
        ul(
          "The Customer Data - master file is the source of truth.",
          "Don't change the structure of All data without checking script dependencies; don't rename columns without checking scripts, forms, Zaps and dashboards.",
          "Test changes on a copy before touching the live CRM. Keep notes on all changes.",
          "Be careful with duplicate contacts; email address is the main matching field.",
          "Stage changes are important and must be logged properly.",
          "Source values must stay consistent: they drive reporting.",
          "New development should make the CRM easier to maintain, not more fragile.",
        ),
      ),
    ),

    callout(
      "info",
      doc(
        p(
          bold("How this connects to the Hub: "),
          "Call Centre and (if confirmed) Zoomin sources will appear automatically in the Hub's lead filters and intake stats once they land in All data; unassigned imports surface on the managers' unassigned list; and warranty stage jumps flow through the same forward-only, audited stage logic. The Hub never writes to the sheet directly. Everything goes through the Apps Script endpoint.",
        ),
      ),
    ),
  ],
};
