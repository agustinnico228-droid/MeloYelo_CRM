import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Media, Page } from "@/payload-types";

/** Renders the §12 page-builder blocks in reading order. */

type Block = NonNullable<Page["layout"]>[number];

function mediaDoc(value: number | Media | null | undefined): Media | null {
  return value && typeof value === "object" ? value : null;
}

const CALLOUT_CLASSES: Record<string, string> = {
  info: "border-my-line bg-my-paper",
  success: "border-my-green/40 bg-my-green/10",
  warning: "border-my-warn/40 bg-my-warn/10",
  alert: "border-my-alert/40 bg-my-alert/5",
};

export default function PageBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case "richText":
            return (
              <div key={i} className="rich-text">
                <RichText data={block.content} />
              </div>
            );
          case "image": {
            const img = mediaDoc(block.image);
            if (!img?.url) return null;
            return (
              <figure key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="max-w-full rounded-card"
                />
                {block.caption ? (
                  <figcaption className="mt-2 text-sm text-my-slate">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          }
          case "fileDownload": {
            const file = mediaDoc(block.file);
            if (!file?.url) return null;
            return (
              <a
                key={i}
                href={file.url}
                download
                className="flex min-h-12 items-center gap-2 rounded-control border border-my-line bg-my-surface px-4 font-medium shadow-card transition-colors hover:bg-my-paper"
              >
                ⬇ {block.label}
              </a>
            );
          }
          case "callout":
            return (
              <div
                key={i}
                className={`rich-text rounded-card border p-4 ${CALLOUT_CLASSES[block.tone] ?? CALLOUT_CLASSES.info}`}
              >
                <RichText data={block.content} />
              </div>
            );
          case "linkCards":
            return (
              <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(block.cards ?? []).map((card, j) => (
                  <a
                    key={j}
                    href={card.url}
                    className="block rounded-card border border-my-line bg-my-surface p-4 shadow-card transition-colors hover:bg-my-paper"
                  >
                    <span className="font-bold">{card.label}</span>
                    {card.description ? (
                      <span className="mt-1 block text-sm text-my-slate">
                        {card.description}
                      </span>
                    ) : null}
                  </a>
                ))}
              </div>
            );
          case "embed":
            return (
              <div
                key={i}
                className="overflow-hidden rounded-card border border-my-line"
              >
                <iframe
                  src={block.url}
                  title={block.title ?? "Embedded content"}
                  className="aspect-video w-full"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            );
          case "accordion":
            return (
              <div key={i} className="space-y-2">
                {(block.items ?? []).map((item, j) => (
                  <details
                    key={j}
                    className="rounded-card border border-my-line bg-my-surface shadow-card"
                  >
                    <summary className="min-h-12 cursor-pointer px-4 py-3 font-bold">
                      {item.title}
                    </summary>
                    <div className="rich-text px-4 pb-4">
                      <RichText data={item.content} />
                    </div>
                  </details>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

interface LexicalHeading {
  type?: string;
  tag?: string;
  children?: { text?: string }[];
}

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Pull h2/h3s out of every richText block, in order, for the TOC. */
export function extractToc(blocks: Block[]): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const block of blocks) {
    if (block.blockType !== "richText" && block.blockType !== "callout") continue;
    const children =
      (block.content as { root?: { children?: LexicalHeading[] } })?.root
        ?.children ?? [];
    for (const node of children) {
      if (node.type !== "heading") continue;
      if (node.tag !== "h2" && node.tag !== "h3") continue;
      const text = (node.children ?? [])
        .map((c) => c.text ?? "")
        .join("")
        .trim();
      if (text === "") continue;
      entries.push({
        id: `${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${entries.length}`,
        text,
        level: node.tag === "h2" ? 2 : 3,
      });
    }
  }
  return entries;
}
