import type { CollectionConfig, GlobalConfig } from "payload";

/**
 * Publish-time cache invalidation. CMS reads are served from the Next
 * data cache (see src/lib/cms.ts); these hooks blow the matching tag the
 * moment an editor saves, so published changes appear instantly while
 * every ordinary page view costs zero database round-trips.
 *
 * The dynamic import + catch keeps the hooks harmless when Payload runs
 * outside Next (seed and parity scripts via `payload run`).
 */
const revalidate = (tag: string) => async () => {
  try {
    const { revalidateTag } = await import("next/cache");
    revalidateTag(tag);
  } catch {
    // Not inside a Next server (e.g. payload run script) — nothing cached.
  }
};

export const collectionRevalidation = (
  tag: string,
): Pick<CollectionConfig, "hooks"> => ({
  hooks: {
    afterChange: [revalidate(tag)],
    afterDelete: [revalidate(tag)],
  },
});

export const globalRevalidation = (
  tag: string,
): Pick<GlobalConfig, "hooks"> => ({
  hooks: { afterChange: [revalidate(tag)] },
});
