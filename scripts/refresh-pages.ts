/**
 * Force-refresh specific CMS pages from the seed manifest.
 *
 * The seed is deliberately skip-if-exists so it never clobbers admin
 * edits — which means a page whose seed content improved later (like
 * /news gaining its real update links) stays stale in the database.
 * This script overwrites ONLY the slugs it's told to, from
 * seed-content.ts, and publishes them.
 *
 *   REFRESH_SLUGS=news npm run refresh-pages     (default: news)
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { toLayout } from "./lexical";
import { SEED_PAGES, type SeedPage } from "./seed-content";

const slugs = (process.env.REFRESH_SLUGS ?? "news")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function pageData(def: SeedPage) {
  return {
    title: def.title,
    slug: def.slug,
    section: def.section,
    showToc: def.showToc ?? false,
    audience: def.audience ?? ("all" as const),
    _status: "published" as const,
    layout: toLayout(def.blocks),
  };
}

async function main() {
  const payload = await getPayload({ config });

  for (const slug of slugs) {
    const def = SEED_PAGES.find((p) => p.slug === slug);
    if (!def) {
      console.error(`No seed definition for "${slug}" — skipped`);
      continue;
    }
    const existing = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (existing.docs[0]) {
      await payload.update({
        collection: "pages",
        id: existing.docs[0].id,
        data: pageData(def),
      });
      console.log(`updated: /${slug}`);
    } else {
      await payload.create({ collection: "pages", data: pageData(def) });
      console.log(`created: /${slug}`);
    }

    // Read back and prove the result, don't assume it.
    const check = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    const json = JSON.stringify(check.docs[0]?.layout ?? []);
    const links = json.match(/https:\/\/[^"\\]+/g) ?? [];
    console.log(
      `  /${slug} now contains ${links.length} link(s):${links.map((l) => `\n    ${l}`).join("")}`,
    );
  }

  process.exit(0);
}

// Top-level await, not a floating promise — `payload run` exits as soon
// as module evaluation finishes, which would kill the refresh silently.
try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
