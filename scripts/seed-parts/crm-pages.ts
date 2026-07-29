/**
 * CRM-area intranet port: Conference 2026, The Confidence to Win, the
 * full "Introducing The Ride Guide" page, the Ride Guide Call Flow
 * document, and the guide-content override for the CRM introduction.
 */
import {
  bold,
  callout,
  doc,
  embed,
  h2,
  h3,
  link,
  linkCards,
  ol,
  p,
  rt,
  text,
  ul,
  type RichTextDoc,
  type SeedPage,
} from "../lexical";

const CONFIDENCE_DRIVE_URL =
  "https://drive.google.com/drive/folders/1Lzq6O8INJ1OQ2P7_c8hIxl_KE2RDBZOn";

export const CRM_PAGES: SeedPage[] = [
  /* ── Conference 2026 ────────────────────────────────────────────── */
  {
    title: "Conference 2026",
    slug: "conference",
    section: "top",
    grounded: true,
    blocks: [
      rt(
        doc(
          p(bold("NEXT LEVEL SERVICE")),
          p(bold("Dates: "), text("August 14-16")),
          p(
            bold("Venue: "),
            text("Lakeland Resort, 282 Lake Terrace, Two Mile Bay, Taupō"),
          ),
          p(
            bold("Accommodation also available at the venue, call "),
            link("0800 378 389", "tel:0800378389"),
            text(" and use booking code #98332"),
          ),
        ),
      ),
      rt(
        doc(
          h2("Agenda - overview"),
          h3("Friday"),
          ul(
            "12:00 - 17:00 Workshop Sessions @ MeloYelo Warehouse",
            "18:00 - Team building @ TBC",
          ),
          h3("Saturday"),
          ul(
            "09:00 - 17:00 Conference @ Lakeland",
            "19:00 - Dinner and Awards @ Lakeland",
          ),
          h3("Sunday"),
          ul("09:00 - 12:00 MeloYelo Warehouse"),
        ),
      ),
      rt(
        doc(
          h2("RSVP"),
          p(
            "Could you please let us know whether you'll be attending this year's conference, and which days you plan to attend.",
          ),
        ),
      ),
      embed(
        "https://docs.google.com/forms/d/e/1FAIpQLSflTZC9Q4dZWONpLTueks3gdB8Y-wu_UsjZfmPu6JhQouWCew/viewform?embedded=true",
        "MeloYelo Conference 2026 RSVP",
      ),
      callout(
        "info",
        doc(
          p(
            bold("Venue photo: "),
            text(
              "the Lakeland Resort photo on the intranet wasn't in the export. An admin can upload it here.",
            ),
          ),
        ),
      ),
    ],
  },

  /* ── The Confidence to Win ──────────────────────────────────────── */
  {
    title: "The Confidence to Win",
    slug: "confidence-to-win",
    section: "top",
    grounded: true,
    blocks: [
      rt(
        doc(
          p(
            "The Confidence to Win - agent secrets to success. Interviews with MeloYelo agents about what works: building customer confidence, test rides, and closing with care.",
          ),
        ),
      ),
      linkCards([
        {
          label: "Alistair interview",
          url: CONFIDENCE_DRIVE_URL,
          description: "Video interview",
        },
        {
          label: "Graham interview",
          url: CONFIDENCE_DRIVE_URL,
          description: "Video interview",
        },
        {
          label: "Juergen interview",
          url: CONFIDENCE_DRIVE_URL,
          description: "Video interview",
        },
        {
          label: "Shane interview",
          url: CONFIDENCE_DRIVE_URL,
          description: "Video interview",
        },
      ]),
      callout(
        "info",
        doc(
          p(
            bold("Videos: "),
            text(
              "the four interview videos are hosted in the team Drive folder linked above; open them there until they're uploaded into the Hub media library.",
            ),
          ),
        ),
      ),
    ],
  },

  /* ── Ride Guide (Introducing The Ride Guide, verbatim) ──────────── */
  {
    title: "Ride Guide",
    slug: "ride-guide",
    section: "crm",
    grounded: true,
    blocks: [
      rt(
        doc(
          h2("The Ride Guide is a new central booking point for test rides."),
          p(
            "The aim is simple: when a new test ride booking request comes in, the Ride Guide will support you by contacting that person as soon as possible and working to schedule a test ride. In some cases, if the CRM shows that you have already been in touch, the Ride Guide may not need to call at all.",
          ),
          p(
            text(
              "The Ride Guide will only work with leads that come in through the website and are marked in the CRM as ",
            ),
            bold("Source = Website Form"),
            text(
              ". If a lead has been added by you or another agent, it remains yours to manage.",
            ),
          ),
          p(
            bold(
              "You can think of the Ride Guide as a concierge service for test rides. Its purpose is to help customers get booked in quickly and help you convert more enquiries into booked test rides and, ultimately, more bikes sold.",
            ),
          ),
          p(
            "The Ride Guide will also work through dormant leads to see if they can still be converted into a test ride booking, and will help with follow-up after a test ride where needed.",
          ),
          p(
            text(
              "For the pilot period, the Ride Guide will be handled by Emma using ",
            ),
            link("rideguide@meloyelo.nz", "mailto:rideguide@meloyelo.nz"),
            text(
              ". This is a new idea, and we're delighted Emma has agreed to take on the role for this trial.",
            ),
          ),
          h3("What this means for you"),
          ol(
            "The Ride Guide will have access to your MeloYelo calendar. (Here's how that works).",
            "You need to keep your calendar up to date and block out any times you are not available for test rides.",
            "You also need to decide, if you have not already, on your preferred location for test rides.",
            "If a time is not blocked out, the Ride Guide will treat it as available and may book a customer in.",
            "Once a booking has been made, it is then up to you to contact the customer if the date or time needs to be changed.",
            "The Ride Guide will only handle leads with Source = Website Form.",
            "Leads entered by you or another agent will remain with that agent.",
            "The Ride Guide will update the contact record in the CRM when contact is made.",
            "You will be able to see what is happening through the Notes field and any Stage changes.",
          ),
          p(
            "The idea is to make test ride booking quicker, simpler, and more consistent, while giving you better support in turning new enquiries into confirmed test rides.",
          ),
        ),
      ),
      rt(
        doc(
          h2("Next Step"),
          p(
            text(
              "Check out how the Ride Guide will collaborate with you, your calendar, and your preferred test ride locations. ",
            ),
            link("Read more here.", "/ride-guide/booking-protocol"),
          ),
        ),
      ),
      rt(
        doc(
          h2("Tools"),
          ul(
            [
              link("Ride Guide queue", "/ride-guide/queue"),
              text(": the website leads to work, most urgent first"),
            ],
            [
              link("Ride Guide Call Flow", "/ride-guide/call-flow"),
              text(": steps, outcomes and exact wording"),
            ],
            [
              link(
                "Test Ride Times, Calendar Bookings and Locations",
                "/ride-guide/booking-protocol",
              ),
            ],
          ),
        ),
      ),
    ],
  },

  /* ── Ride Guide Call Flow (full document, verbatim) ─────────────── */
  {
    title: "Ride Guide Call Flow",
    slug: "ride-guide/call-flow",
    section: "crm",
    showToc: true,
    grounded: true,
    blocks: [
      rt(
        doc(
          h2("Purpose of each call"),
          p("Each call should aim to:"),
          ul(
            "confirm whether the lead is still interested in an e-bike",
            "find out whether they have already bought one",
            "where interest remains, try to secure a test ride booking",
            "if the timing is not right, agree a clear follow-up point",
            "if they are not ready for a test ride, ask whether they would like to stay in touch by email",
            "update the CRM so the lead's Stage and Notes reflect the outcome properly",
          ),
        ),
      ),
      rt(
        doc(
          h2("Simple call flow"),
          h3("1. Confirm current interest"),
          p(
            "Start by checking whether they are still interested in getting an e-bike.",
          ),
          h3("2. Confirm whether they have already bought"),
          p(
            "If they are unsure, no longer interested, or hesitant, ask whether they have already bought one.",
          ),
          h3("3. Where interest remains, aim to book a test ride"),
          p(
            "If they are still interested and have not yet bought, the main objective is to book a test ride.",
          ),
          h3("4. If they are not ready, agree the next best step"),
          p("If they are interested but not ready to book now:"),
          ul(
            "agree a suitable time to follow up again, or",
            "ask whether they would like to receive occasional email updates",
          ),
          h3("5. Always leave the call with a clear outcome"),
          p("Every call should result in one of the following:"),
          ul(
            "a test ride booked",
            "a follow-up plan",
            "a clearly recorded outcome",
          ),
        ),
      ),
      rt(
        doc(
          h2("Stage update guide"),
          p(
            "The Stage should reflect where the lead now sits in the sales journey. It should not try to capture every detail of the conversation.",
          ),
          h3("Update to Made contact when:"),
          ul(
            "a genuine conversation has taken place",
            "the lead is still considering an e-bike but no test ride is booked yet",
            "the lead asks to be contacted again later",
            "the lead does not want a test ride now but is happy to stay in touch by email",
          ),
          h3("Update to Test ride booked when:"),
          ul(
            "a test ride is successfully booked during or immediately following the call",
          ),
          h3("Update to Test ride declined when:"),
          ul(
            "the lead says they are no longer interested in progressing further",
            "the lead clearly does not want a test ride",
            "the lead has decided not to proceed with MeloYelo",
            "the lead has bought elsewhere and does not want further contact",
            "the lead should no longer receive follow-up emails or marketing contact",
          ),
          p(
            text("Where Stage is updated to "),
            bold("Test ride declined"),
            text(
              ", the record should also be marked for unsubscribe in Campaign Monitor unless the person specifically asks to remain on the email list.",
            ),
          ),
          h3("Update to Contact Failed when:"),
          ul(
            "reasonable attempts have been made but no meaningful contact is achieved",
            "the lead is clearly uncontactable and is not progressing",
          ),
        ),
      ),
      rt(
        doc(
          h2("Recording the call outcome in Notes"),
          p(
            "The specific result of the call should be recorded in the Notes field using a consistent format.",
          ),
          p("Examples:"),
          ul(
            "Call outcome: Test ride booked",
            "Call outcome: Follow up later - requested contact again in 2 months",
            "Call outcome: Email nurture only - not ready for a test ride",
            "Call outcome: Test ride declined - no longer interested",
            "Call outcome: Test ride declined - bought elsewhere",
            "Call outcome: No answer after 3 attempts",
          ),
          p(
            "This keeps the Stage clean while still recording the practical result of the call.",
          ),
        ),
      ),
      rt(
        doc(
          h2("Operating principle"),
          p("The Ride Guide is not expected to force a sale on the call."),
          p("The role is to:"),
          ul(
            "make warm, useful contact",
            "understand where the lead is at",
            "move them to the next sensible step",
            "leave a clear and accurate record for the wider team",
          ),
        ),
      ),
      rt(
        doc(
          h2("At the end of each call"),
          p("Emma should be able to answer these two questions:"),
          h3("1. What is the correct Stage now?"),
          p("Usually this will be one of:"),
          ul(
            "Made contact",
            "Test ride booked",
            "Test ride declined",
            "Contact Failed",
          ),
          h3("2. What exactly happened on the call?"),
          p("This should be recorded clearly in Notes."),
        ),
      ),
      rt(
        doc(
          p(
            text("Work a live call with the interactive version: "),
            link("Ride Guide queue", "/ride-guide/queue"),
            text("."),
          ),
        ),
      ),
    ],
  },
];

/* ── Guide content overrides ──────────────────────────────────────── */

export const GUIDE_CONTENT_OVERRIDES: {
  slug: string;
  summary?: string;
  content: RichTextDoc;
}[] = [
  {
    slug: "introduction",
    summary: "How to find the CRM, how to log in, and your video introduction.",
    content: doc(
      p("Last updated: 20th October 2025"),
      h2("How to find the CRM"),
      p(
        text("The CRM lives inside "),
        bold("mY Hub"),
        text(" - the central source of all MeloYelo knowledge: "),
        link("https://myhub.meloyelo.nz", "https://myhub.meloyelo.nz"),
      ),
      p(
        "All notification emails you receive will also include a link direct the CRM",
      ),
      h2("How to log in"),
      p(
        "Your MeloYelo Google account ensures you have automatic and secure access (just ensure you're logged in to your MeloYelo Google account in the browser).",
      ),
      h2("Your Introduction to the CRM ( video)"),
      p(
        text("Watch the introduction video: "),
        link(
          "cloud.digimark.co.nz/yBWLNzm3",
          "https://cloud.digimark.co.nz/yBWLNzm3",
        ),
      ),
      h2("Next Steps:"),
      ul(
        'Please go ahead and add any of your own contacts. You\'ll see the "Add New Contact" button. While this has been tested it would be super helpful to hear how you get on and to know you find it simple to use (or not!). New contacts that you add are automatically assigned to you regardless of their post code.',
        "Please try updating an existing contact. Just click on the link alongside the relevant Contact.",
        "Have a go at searching for an existing contact by Last Name or Email.",
      ),
    ),
  },
];
