/**
 * Minimal Lexical builders + seed types, shared by seed-content.ts and
 * the seed-parts/ content modules (one module per intranet area so the
 * port can be authored in parallel without merge conflicts).
 */

export interface LexNode {
  [key: string]: unknown;
}

export const text = (t: string): LexNode => ({
  type: "text",
  version: 1,
  text: t,
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
});

export const bold = (t: string): LexNode => ({ ...text(t), format: 1 });

export const link = (t: string, url: string): LexNode => ({
  type: "link",
  version: 2,
  direction: "ltr",
  format: "",
  indent: 0,
  fields: { linkType: "custom", newTab: true, url },
  children: [text(t)],
});

export const p = (...children: (string | LexNode)[]): LexNode => ({
  type: "paragraph",
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  textFormat: 0,
  children: children.map((c) => (typeof c === "string" ? text(c) : c)),
});

export const h2 = (t: string): LexNode => ({
  type: "heading",
  tag: "h2",
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: [text(t)],
});

export const h3 = (t: string): LexNode => ({
  type: "heading",
  tag: "h3",
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: [text(t)],
});

const listItem = (t: string | LexNode[], value: number): LexNode => ({
  type: "listitem",
  version: 1,
  value,
  direction: "ltr",
  format: "",
  indent: 0,
  children: typeof t === "string" ? [text(t)] : t,
});

export const ul = (...items: (string | LexNode[])[]): LexNode => ({
  type: "list",
  listType: "bullet",
  tag: "ul",
  version: 1,
  start: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: items.map((t, i) => listItem(t, i + 1)),
});

export const ol = (...items: (string | LexNode[])[]): LexNode => ({
  type: "list",
  listType: "number",
  tag: "ol",
  version: 1,
  start: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: items.map((t, i) => listItem(t, i + 1)),
});

export const doc = (...children: LexNode[]) => ({
  root: {
    type: "root",
    version: 1,
    direction: "ltr",
    format: "",
    indent: 0,
    children,
  },
});

export type RichTextDoc = ReturnType<typeof doc>;

/* ── seed block / page types ──────────────────────────────────────── */

export type SeedBlock =
  | { blockType: "richText"; content: RichTextDoc }
  | {
      blockType: "callout";
      tone: "info" | "success" | "warning" | "alert";
      content: RichTextDoc;
    }
  | { blockType: "embed"; url: string; title?: string }
  | {
      blockType: "linkCards";
      cards: { label: string; url: string; description?: string }[];
    };

export interface SeedPage {
  title: string;
  slug: string;
  section: "top" | "crm" | "growth" | "campaigns" | "resources";
  showToc?: boolean;
  /** viewer gate enforced in the catch-all route; default "all" */
  audience?: "all" | "agents" | "managers";
  /** true = grounded content from the intranet; false = marked stub */
  grounded: boolean;
  blocks: SeedBlock[];
}

export const rt = (content: RichTextDoc): SeedBlock => ({
  blockType: "richText",
  content,
});

export const callout = (
  tone: "info" | "success" | "warning" | "alert",
  content: RichTextDoc,
): SeedBlock => ({ blockType: "callout", tone, content });

export const embed = (url: string, title?: string): SeedBlock => ({
  blockType: "embed",
  url,
  title,
});

export const linkCards = (
  cards: { label: string; url: string; description?: string }[],
): SeedBlock => ({ blockType: "linkCards", cards });

/** Map seed blocks to a Payload `layout` array (shared by seed + sync). */
export const toLayout = (blocks: SeedBlock[]) =>
  blocks.map((b) => {
    switch (b.blockType) {
      case "callout":
        return {
          blockType: "callout" as const,
          tone: b.tone,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: b.content as any,
        };
      case "embed":
        return {
          blockType: "embed" as const,
          url: b.url,
          title: b.title,
        };
      case "linkCards":
        return { blockType: "linkCards" as const, cards: b.cards };
      default:
        return {
          blockType: "richText" as const,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: b.content as any,
        };
    }
  });
