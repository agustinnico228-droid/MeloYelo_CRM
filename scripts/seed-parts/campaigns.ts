/**
 * Campaign snapshot copy ported verbatim from the intranet campaign pages.
 *
 * Note: campaign snapshots are a single RichTextDoc (not a block list), so
 * the "Creative samples" note that would be a callout block on a page is
 * rendered here as a Lexical quote node instead.
 */
import {
  bold,
  doc,
  h2,
  h3,
  link,
  ol,
  p,
  text,
  ul,
  type LexNode,
  type RichTextDoc,
} from "../lexical";

/** Blockquote-style note (snapshot docs can't contain callout blocks). */
const quoteNote = (...children: LexNode[]): LexNode => ({
  type: "quote",
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children,
});

export const CAMPAIGN_SNAPSHOT_OVERRIDES: {
  slug: string;
  snapshot: RichTextDoc;
  statusNote?: string;
  landingPageUrl?: string;
  endsAt?: string;
}[] = [
  /* ── SuperGold Card ─────────────────────────────────────────────── */
  {
    slug: "supergold-card",
    landingPageUrl: "https://meloyelo.nz/supergold/",
    snapshot: doc(
      p(
        bold(
          "MeloYelo offers an exclusive benefit to holders of the SuperGold Card. We change the benefit every few months.",
        ),
      ),
      p(
        "The latest benefit and it's details will be shown on a dedicated landing page on the MeloYelo website. We're building that page now so here's a preview. We'll update mYHub with a link to that page as soon as it's published.",
      ),
      p(
        text("SuperGold Card also provide the details of the offer on "),
        link("their website here", "https://supergold.govt.nz/"),
        text("."),
      ),
      h2("Current SuperGold benefit"),
      p(
        "Receive $500 off the standard (non-sale) price of any new MeloYelo SuperLite or SuperTrail ebike purchased from your local agent by June 18, 2026.",
      ),
      p(
        "Present your SuperGold card when you purchase a new MeloYelo SuperLite or SuperTrail ebike in stock by June 18, 2026, to receive $500 off the standard (non-sale) purchase price. This offer may not be combined with any other promotional offer from MeloYelo. Discount applies to bikes at regular RRP, not sale prices. Ex-demo, used bikes and older models are not eligible. Offer expires June 18, 2026.",
      ),
    ),
  },

  /* ── 2604 Fuel Crisis ───────────────────────────────────────────── */
  {
    slug: "2604-fuel-crisis",
    landingPageUrl: "https://meloyelo.nz/beat-the-fuel-crisis/",
    snapshot: doc(
      p("Last updated: 22 April 2026"),
      h2("Campaign snapshot"),
      p(text("Campaign name: "), bold("2604-fuel-crisis")),
      h3("Channel"),
      p("Google Ads only"),
      h3("Campaign start date"),
      p("Friday 24 April 2026"),
      h3("Campaign period"),
      p("From Friday 24 April 2026"),
      p(
        "End date to be confirmed but we plan to run this campaign for 60 days",
      ),
      p(
        bold(
          "Update 28th May; Campaign paused while we wait for finance options to be finalised so we can include the Qcard and FinanceNow options in the offer.",
        ),
      ),
      h3("Total budget"),
      p(
        "We review this as ads start running but the estimated total budget for ads in this campaign is $6,000",
      ),
      h3("Primary objective"),
      p(
        "Generate qualified traffic and enquiries by positioning MeloYelo e-bikes as a practical response to rising fuel costs.",
      ),
      h3("Landing page"),
      p(
        text("Beat the Fuel Crisis landing page: "),
        link(
          "https://meloyelo.nz/beat-the-fuel-crisis/",
          "https://meloyelo.nz/beat-the-fuel-crisis/",
        ),
      ),
      h2("What this campaign is about"),
      p(
        "This campaign is built around a timely and highly relatable message: fuel costs are hurting household budgets, and more New Zealanders may be open to alternatives for everyday transport.",
      ),
      p(
        "The creative theme is Beat the Fuel Crisis. The campaign is designed to put MeloYelo in front of people who are actively researching transport options, looking for ways to reduce fuel spend, or showing interest in e-bikes and commuting alternatives prompted by the very high fuel costs.",
      ),
      p(
        "The purpose is not just awareness. It is intended to drive relevant visitors to the website and help move suitable prospects further into the enquiry and test ride journey.",
      ),
      p("The campaign also ties into two important website updates."),
      ol(
        "The SuperGold Card offer is now being referenced more clearly across the MeloYelo website. Relevant product pages will show the SuperGold Card graphic, and a dedicated landing page explaining the offer will be live by the time these ads start running.",
        "The Zoomin bike has now been included on the MeloYelo website. This gives us a lower lead-in price for the campaign, with messaging from $2,695. People who click through wanting to buy or enquire about the Zoomin will be directed first to a dedicated product page on the MeloYelo website and then ultimately to the Zoomin website, where they can either buy online or arrange for their bike to be assembled by their nearest agent.",
      ),
      p(
        "These additional pages are not live yet, so links to them will be inserted prior to launch.",
      ),
      h2("Where these ads will appear"),
      p("This campaign is running on Google Ads only at this stage."),
      p("Ads may appear across selected Google placements such as:"),
      ul(
        "Google Search",
        "Google Display placements",
        "YouTube placements, if included in the campaign setup",
        "Other Google inventory relevant to the campaign format and targeting",
      ),
      p(
        "This means customers may encounter MeloYelo messaging while actively searching, browsing relevant content, or consuming online video content within Google's advertising network.",
      ),
      h2("Who we are trying to reach"),
      p(
        "The campaign is aimed at people who are more likely to respond to the message of fuel savings, practical mobility, and everyday value.",
      ),
      p("Target audiences may include:"),
      ul(
        "adults researching alternatives to petrol-powered transport",
        "people interested in e-bikes, cycling, commuting, and cost-effective travel",
        "people responding to cost-of-living pressure, including fuel prices",
        "warm audiences who have already engaged with the MeloYelo website or advertising",
        "people in priority regions where demand and lead opportunities are strongest",
      ),
      p(
        "The intent is to place MeloYelo in front of people for whom the message is immediately relevant, rather than broadcasting too broadly.",
      ),
      h2("Creative approach"),
      p(
        "The campaign uses bold, high-contrast creative built around fuel-price headlines and commuter pain points.",
      ),
      p("The visual direction includes:"),
      ul(
        "newspaper-style headline treatments",
        "strong references to rising fuel costs",
        "clear, direct commuter messaging",
        "prominent MeloYelo branding",
        "pricing-led creative such as Ebikes from $2,695",
        "a consistent yellow, orange, red and black palette that stands out strongly online",
      ),
      p("Example headline angles used in the creative include:"),
      ul(
        "Beat the Fuel Crisis",
        "Time to Consider an Ebike?",
        "Fuel Prices Out of Control",
        "Driving Now Costs a Fortune",
        "Ditch Petrol - Ebikes from $2,695",
      ),
      h3("Sample creative elements"),
      p(
        "The current asset set includes a mix of formats suited to Google placements, including:",
      ),
      ul(
        "square display assets",
        "portrait assets",
        "landscape assets",
        "logo assets",
        "motion/video concept variations",
      ),
      p(
        "Creative examples from the 2604-fuel-crisis campaign are shown below. These are representative samples of the current visual direction and may appear in different sizes and combinations depending on placement.",
      ),
      quoteNote(
        bold("Creative samples: "),
        text(
          "the ad creative image grid lives on the intranet page and in the campaign Drive folder. It wasn't in the export. An admin can upload the images here.",
        ),
      ),
      h2("Supporting content"),
      p(
        "To support the campaign, we have also prepared related content that helps reinforce the message and extend its reach beyond paid advertising to organic search and AI enquiries.",
      ),
      p(
        text("Landing page : "),
        link(
          "https://meloyelo.nz/beat-the-fuel-crisis/",
          "https://meloyelo.nz/beat-the-fuel-crisis/",
        ),
      ),
      p(
        text("Supporting blog post: "),
        link(
          "https://meloyelo.nz/blog/why-more-kiwis-are-turning-to-electric-bikes-as-fuel-prices-soar/",
          "https://meloyelo.nz/blog/why-more-kiwis-are-turning-to-electric-bikes-as-fuel-prices-soar/",
        ),
      ),
      p(
        "The blog post will also be shared through social media to help broaden visibility of the campaign theme and support additional traffic back to the website.",
      ),
      p(
        "The campaign also links to broader website content updates. The SuperGold Card offer is now being mentioned more clearly, relevant product pages will display the SuperGold Card graphic, and a dedicated landing page explaining that offer will be live by the time the ads begin.",
      ),
      p(
        "We have also added the Zoomin bike to the MeloYelo website. This supports the price-led message in the campaign and gives us a genuine entry point from $2,695. A dedicated Zoomin product page on the MeloYelo website will direct interested customers through to the Zoomin website, where they can buy online or choose to have the bike assembled by their nearest agent.",
      ),
      p(
        "Links to these new pages will be inserted before launch once they are live.",
      ),
      h2("What agents should know"),
      p(
        "Customers may come through already familiar with the fuel-cost message or with the idea that an e-bike could be a sensible alternative to car use for some trips.",
      ),
      p("This campaign is intended to support agent conversations by:"),
      ul(
        "creating timely awareness",
        "reinforcing MeloYelo as a practical real-world option",
        "bringing in prospects already thinking about transport costs",
        "helping more suitable prospects reach the website and enquiry stage",
      ),
      p(
        bold(
          "Agents should also note that test ride requests generated from this campaign will include the campaign code 2604-fuel-crisis in the Notes field. This will help identify leads that have come through this advertising activity.",
        ),
      ),
      p(
        "In some cases, leads may also reference fuel prices, commuting savings, or the advertised entry-level pricing when making contact.",
      ),
      p(
        "Agents may also hear prospects refer to the SuperGold Card offer or the Zoomin entry price when enquiring, as both are now being incorporated into the website journey that supports this campaign.",
      ),
      h2("Notes"),
      ul(
        "This is a Google Ads only campaign at this stage. No Facebook or Instagram advertising is planned for this campaign currently.",
        "The ads are set to start running from Friday 24 April 2026.",
        "Creative may be refreshed, rotated, or refined during the campaign period depending on performance.",
        "Budget, dates, and targeting details can be updated on this page as required.",
      ),
      h2("Questions or feedback"),
      p(
        text(
          "If agents receive useful comments from customers about this campaign, or hear recurring questions linked to the fuel-cost message, please pass that feedback on. It may help refine future creative, targeting, and follow-up. Email your feedback to: ",
        ),
        link("andy@meloyelo.nz", "mailto:andy@meloyelo.nz"),
      ),
      p(
        link(
          "PMAX and Meta Copy Generator",
          "https://drive.google.com/drive/folders/1gDETKCtPwUHQ40OSVVYgH26hth9gedhG",
        ),
      ),
    ),
  },

  /* ── 2606 SuperTrail Champagne ──────────────────────────────────── */
  {
    slug: "2606-supertrail-champagne",
    statusNote: "Runs to 30 June 2026, then reviewed.",
    endsAt: "2026-06-30",
    landingPageUrl: "https://meloyelo.nz/product/supertrail/",
    snapshot: doc(
      p("Last updated: 11 June 2026"),
      h2("Campaign snapshot"),
      p(text("Campaign name: "), bold("2606-supertrail-champagne")),
      h3("Channel"),
      p("Google Ads and Meta Ads, ChatGPT ad and Emails"),
      h3("Campaign start date"),
      p("Friday 12 June 2026"),
      h3("Campaign period"),
      p("From Friday 12 June 2026"),
      p("Planned end date: Tuesday 30 June 2026"),
      p(
        "Campaign to be reviewed at the end of the month before any decision is made to extend, pause, or adapt the offer.",
      ),
      h3("Total budget"),
      p(
        "Budget to be confirmed and reviewed once ads are live and early performance data is available.",
      ),
      h3("Primary objective"),
      p(
        "Generate qualified traffic, enquiries and test ride bookings for the Champagne coloured MeloYelo SuperTrail, with the immediate commercial aim of moving available Champagne SuperTrail stock.",
      ),
      h3("Landing pages"),
      p(
        text("Primary SuperTrail product page: "),
        link(
          "https://meloyelo.nz/product/supertrail/",
          "https://meloyelo.nz/product/supertrail/",
        ),
      ),
      p(
        text("Northland agent landing page: "),
        link(
          "https://meloyelo.nz/dealers/whangarei/",
          "https://meloyelo.nz/dealers/whangarei/",
        ),
      ),
      p(
        text("SuperGold offer page: "),
        link(
          "https://meloyelo.nz/supergold/",
          "https://meloyelo.nz/supergold/",
        ),
      ),
      h2("What this campaign is about"),
      p(
        "This campaign is built around a clear offer on the Champagne coloured MeloYelo SuperTrail. The SuperTrail is a full-suspension step-through e-bike suited to riders who want comfort and confidence around town, while still having the capability to ride light trails, rougher paths and mixed local terrain.",
      ),
      p(
        "The headline offer is that eligible SuperGold Card holders can save $1,000 on the Champagne SuperTrail. For everyone else, the advertised saving is $750. Agents also have a discretionary discount available, allowing them to extend the full $1,000 saving to non-SuperGold customers where that helps close a suitable sale.",
      ),
      p(
        "The campaign is offer-led, but it should not feel like a clearance sale. The SuperTrail remains one of MeloYelo's most capable and versatile models. The role of the discount is to create urgency around the Champagne colourway and give agents a timely reason to re-engage prospects who may already be considering a full-suspension or trail-capable step-through e-bike.",
      ),
      h2("Offer summary"),
      ul(
        [
          bold("SuperGold Card holders: "),
          text("$1,000 off the Champagne SuperTrail."),
        ],
        [bold("General offer: "), text("$750 off the Champagne SuperTrail.")],
        [
          bold("Agent discretion: "),
          text(
            "agents may extend the $1,000 saving to non-SuperGold customers if needed to help complete the sale.",
          ),
        ],
        [
          bold("Campaign focus: "),
          text("Champagne coloured SuperTrail stock."),
        ],
        [
          bold("Timing: "),
          text(
            "starts 11 June 2026 and runs to 30 June 2026, then will be reviewed.",
          ),
        ],
      ),
      h2("Where these ads will appear"),
      p("This campaign will run across three paid advertising streams:"),
      ul(
        [
          bold("Google Search ads nationwide: "),
          text(
            "to reach people actively searching for e-bikes, full-suspension e-bikes, step-through e-bikes, trail e-bikes and related buying terms.",
          ),
        ],
        [
          bold("Google Shopping ads nationwide: "),
          text(
            "to show the SuperTrail product in relevant product-led shopping results and support price-led comparison behaviour.",
          ),
        ],
        [
          bold("Meta ads in Northland: "),
          text(
            "to test Meta activity against Google activity in a defined regional market and to drive traffic to the new Northland agent landing page being trialled there.",
          ),
        ],
      ),
      p(
        "The Google component is nationwide. The Meta component is deliberately regional and will be used as a test of whether Facebook and Instagram can generate useful traffic and enquiry activity for a local agent-focused campaign.",
      ),
      p(
        bold("ChatGPT ads: "),
        text(
          "this is a first for us. We're running a trial campaign on ChatGPT. Ads will appear in front of people in NZ using the free ChatGPT plan.",
        ),
      ),
      p(
        bold(
          "The campaign will also include email marketing and social media support",
        ),
      ),
      p(
        "We will email the offer to relevant parts of the MeloYelo database and publish supporting posts through Facebook and Instagram.",
      ),
      p(
        "The email activity will be segmented so that people receive the most relevant version of the offer, rather than sending one generic campaign email to the entire database.",
      ),
      p("Email segments include:"),
      ul(
        "People who have requested a test ride but have not yet booked or converted, and who previously expressed interest in the SuperTrail or SuperLite.",
        "People who requested a test ride during 2026 but have not yet booked or converted.",
        "People who requested a test ride prior to 2026 but have not yet booked or converted.",
        "Existing MeloYelo owners who purchased more than 12 months ago and may be interested in upgrading to the SuperTrail Champagne.",
      ),
      p(
        text(
          "The existing-owner segment gives us an opportunity to present the SuperTrail Champagne as an upgrade offer. As current MeloYelo customers, they can be offered the full $1,000 discount on the Champagne SuperTrail as a loyalty-style upgrade opportunity, whether or not they personally hold a SuperGold Card. This message could also reference the ",
        ),
        link("secondhandbikes.co.nz", "https://secondhandbikes.co.nz/"),
        text(" website as a practical option for selling their existing bike."),
      ),
      p("The social media activity will include:"),
      ul(
        "A Facebook and Instagram post promoting the mainstream SuperGold Card offer.",
        "A post in the MeloYelo Customer Community Group positioning the offer as an upgrade opportunity for existing MeloYelo owners.",
      ),
      p(
        "This gives the campaign broader reach beyond paid search and shopping activity, while allowing the messaging to be tailored to people at different stages of the MeloYelo customer journey.",
      ),
      h2("Who we are trying to reach"),
      p(
        "The campaign is aimed at people who are already interested in e-bikes, considering a more capable and comfortable model, or likely to respond to a strong limited-time offer.",
      ),
      p("Target audiences may include:"),
      ul(
        "people searching for e-bikes in New Zealand",
        "people comparing step-through e-bikes and full-suspension e-bikes",
        "older riders who want comfort, stability and confidence",
        "SuperGold Card holders who may be eligible for the strongest saving",
        "people considering riding on trails, gravel paths, shared paths and around town",
        "warm audiences who have already visited the MeloYelo website or engaged with MeloYelo advertising",
        "Northland prospects who may respond to a local agent-led message and landing page",
      ),
      p(
        "The campaign should be practical and confidence-building rather than performance-bike oriented. The SuperTrail should be positioned as comfortable, versatile and reassuring, not as a technical mountain bike.",
      ),
      h2("Creative approach"),
      p(
        "The creative direction should make the offer easy to understand while still reinforcing the product strengths of the SuperTrail.",
      ),
      p(
        "Core message: Save up to $1,000 on the MeloYelo SuperTrail Champagne - a full-suspension step-through e-bike that is comfortable around town and capable on trails.",
      ),
      p("Creative and copy should emphasise:"),
      ul(
        "save up to $1,000 on the Champagne SuperTrail",
        "full-suspension comfort",
        "easy step-through frame",
        "suited to trails and around town",
        "720Wh battery",
        "air shocks and dropper seat post",
        "throttle support to 0km/h",
        "guided local test rides",
        "local MeloYelo agent support",
      ),
      p(
        'Care should be taken with pricing language. The broad public offer is $750 off, while the $1,000 saving is available to SuperGold Card holders and may also be extended by agents at their discretion. Ads can safely use "save up to $1,000" provided the landing page and agent communications clearly explain the eligibility and discretion around the offer.',
      ),
      h2("Sample creative angles"),
      ul(
        "Save up to $1,000 on SuperTrail",
        "SuperTrail Champagne Sale",
        "Full-suspension comfort for town and trails",
        "A step-through e-bike with real trail capability",
        "SuperGold Card holders save $1,000",
        "Book a guided test ride with your local agent",
        "Comfort, confidence and capability in one e-bike",
      ),
      h2("Supporting content"),
      p(
        "The campaign will be supported by the EDM promoting the Champagne SuperTrail offer and by relevant website pages explaining the SuperTrail, the SuperGold offer, local agents and test rides.",
      ),
      p(
        "For Northland, the Meta ads will also support the new agent landing page being trialled in that region. This gives us a chance to assess whether a more localised Meta campaign can generate useful traffic and enquiries compared with the nationwide Google Search and Shopping activity.",
      ),
      h2("What agents should know"),
      p(
        'Agents should be aware that prospects may come through having seen the $1,000 saving message, the $750 general saving message, or the "save up to $1,000" wording.',
      ),
      p("The key points for agents are:"),
      ul(
        "The campaign is focused on the Champagne coloured SuperTrail.",
        "SuperGold Card holders are eligible for $1,000 off.",
        "Other customers are eligible for $750 off.",
        "Agents have discretion to extend the $1,000 saving to non-SuperGold customers if needed.",
        "The offer is intended to help move Champagne SuperTrail stock during June.",
        "The campaign runs until 30 June 2026, then will be reviewed.",
        "Google Search and Shopping activity is nationwide.",
        "Meta activity is being tested in Northland and will help drive traffic to the new Northland agent landing page.",
      ),
      p(
        "Agents should be ready to explain the SuperTrail as a comfortable, confidence-inspiring, full-suspension step-through e-bike suited to a mix of around-town riding and light trail riding. The ideal next step for most prospects remains a guided local test ride.",
      ),
      h2("Campaign tracking and review"),
      p(
        text(
          "Leads and enquiries generated from this campaign will be tagged with the campaign code ",
        ),
        bold("2606-supertrail-champagne"),
        text(
          " wherever possible. This will help us compare response and lead quality across Google Search, Google Shopping and the Northland Meta test.",
        ),
      ),
      p("At the end of June, the campaign should be reviewed against:"),
      ul(
        "traffic volume by channel",
        "test ride enquiries and bookings",
        "lead quality and sales-stage progression",
        "Champagne SuperTrail sales or strong purchase intent",
        "Northland Meta performance versus Google activity",
        "feedback from agents about customer questions and offer clarity",
      ),
      h2("Notes"),
      ul(
        "Campaign starts Thursday 11 June 2026.",
        "Planned review date is after Tuesday 30 June 2026.",
        "Google Search and Google Shopping ads will run nationwide.",
        "Meta ads will run in the Northland region only as a controlled test.",
        "The campaign is designed to move Champagne SuperTrail stock.",
        "Creative, copy and targeting may be refined during the campaign period depending on early performance.",
        "Pricing and discount language must remain clear so customers understand the SuperGold offer, general offer and agent discretion.",
      ),
      h2("Questions or feedback"),
      p(
        "If agents receive useful comments from customers about this campaign, or hear recurring questions linked to the SuperTrail, the Champagne colourway, the SuperGold saving or the Northland landing page trial, please pass that feedback on. It may help refine the campaign during June and inform future regional advertising tests.",
      ),
      p(
        text("Email feedback to: "),
        link("andy@meloyelo.nz", "mailto:andy@meloyelo.nz"),
      ),
    ),
  },
];
