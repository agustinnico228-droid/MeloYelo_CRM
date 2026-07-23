/**
 * Content parity check (§16.1) — run before cutover:
 *
 *   npm run parity     (needs DATABASE_URI)
 *
 * Compares the intranet page manifest against what's actually in the
 * CMS and reports anything missing or unpublished. Exit code 1 when
 * gaps exist, so it can gate a deploy.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import {
  SEED_CAMPAIGNS,
  SEED_DASHBOARDS,
  SEED_GUIDES,
  SEED_PAGES,
} from "./seed-content";

async function main() {
  const payload = await getPayload({ config });
  const problems: string[] = [];

  const pages = await payload.find({ collection: "pages", limit: 500 });
  for (const expected of SEED_PAGES) {
    const doc = pages.docs.find((d) => d.slug === expected.slug);
    if (!doc) problems.push(`MISSING page: /${expected.slug}`);
    else if (doc._status !== "published")
      problems.push(`UNPUBLISHED page: /${expected.slug}`);
  }

  const guides = await payload.find({ collection: "guides", limit: 500 });
  for (const expected of SEED_GUIDES) {
    const doc = guides.docs.find((d) => d.slug === expected.slug);
    if (!doc) problems.push(`MISSING guide: /guides/${expected.slug}`);
    else if (doc._status !== "published")
      problems.push(`UNPUBLISHED guide: /guides/${expected.slug}`);
  }

  const dashboards = await payload.find({ collection: "dashboards", limit: 100 });
  for (const expected of SEED_DASHBOARDS) {
    const doc = dashboards.docs.find((d) => d.slug === expected.slug);
    if (!doc) problems.push(`MISSING dashboard: /dashboards/${expected.slug}`);
    else if (!doc.lookerReportId)
      problems.push(
        `NOT CONNECTED dashboard: /dashboards/${expected.slug} (no Looker report ID yet)`,
      );
  }

  const campaigns = await payload.find({ collection: "campaigns", limit: 100 });
  for (const expected of SEED_CAMPAIGNS) {
    if (!campaigns.docs.some((d) => d.slug === expected.slug)) {
      problems.push(`MISSING campaign: /campaigns/${expected.slug}`);
    }
  }

  const nav = await payload.findGlobal({ slug: "navigation" });
  if ((nav.items ?? []).length === 0) {
    problems.push("EMPTY navigation global — run npm run seed");
  }

  // Stub audit: pages still carrying the "content to be added" marker.
  const stubMarker = "Content to be added";
  const stubs = pages.docs.filter((d) =>
    JSON.stringify(d.layout ?? []).includes(stubMarker),
  );
  for (const s of stubs) {
    console.log(`stub (needs real content pasted): /${s.slug}`);
  }

  if (problems.length === 0) {
    console.log(
      `Parity OK — ${SEED_PAGES.length} pages, ${SEED_GUIDES.length} guides, ${SEED_DASHBOARDS.length} dashboards, ${SEED_CAMPAIGNS.length} campaigns present. ${stubs.length} stub(s) still need content.`,
    );
    process.exit(0);
  }

  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
