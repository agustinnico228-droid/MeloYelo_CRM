/**
 * Add any DEFAULT_NAV items missing from the live navigation global,
 * without touching items or ordering an admin has customised.
 * Idempotent: run any time a code release introduces a nav entry.
 *
 *   npm run sync-nav   (needs DATABASE_URI)
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { DEFAULT_NAV } from "../src/lib/nav";

async function main() {
  const payload = await getPayload({ config });
  const nav = await payload.findGlobal({ slug: "navigation" });
  const items = nav.items ?? [];
  if (items.length === 0) {
    console.log("navigation global is empty — run npm run seed instead");
    process.exit(0);
  }

  let added = 0;
  for (const def of DEFAULT_NAV) {
    const live = items.find((i) => i.label === def.label);
    if (!live) {
      items.push({
        label: def.label,
        url: def.url ?? "",
        audience: def.audience,
        children: (def.children ?? []).map((c) => ({
          label: c.label,
          url: c.url ?? "",
          audience: c.audience,
        })),
      });
      console.log(`added top-level: ${def.label}`);
      added++;
      continue;
    }
    for (const child of def.children ?? []) {
      const children = live.children ?? [];
      if (!children.some((c) => c.label === child.label)) {
        children.push({
          label: child.label,
          url: child.url ?? "",
          audience: child.audience,
        });
        live.children = children;
        console.log(`added under ${def.label}: ${child.label} → ${child.url}`);
        added++;
      }
    }
  }

  if (added === 0) {
    console.log("navigation already up to date");
  } else {
    await payload.updateGlobal({ slug: "navigation", data: { items } });
    console.log(`navigation updated (${added} item(s) added)`);
  }
  process.exit(0);
}

// Top-level await — `payload run` exits when module evaluation finishes.
try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
