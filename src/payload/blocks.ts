import type { Block } from "payload";

/** §12 pages: block-based builder; blocks reorder by dragging. */

export const richTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Rich text", plural: "Rich text" },
  fields: [{ name: "content", type: "richText", required: true }],
};

export const imageBlock: Block = {
  slug: "image",
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "caption", type: "text" },
  ],
};

export const fileDownloadBlock: Block = {
  slug: "fileDownload",
  labels: { singular: "File download", plural: "File downloads" },
  fields: [
    { name: "file", type: "upload", relationTo: "media", required: true },
    { name: "label", type: "text", required: true },
  ],
};

export const calloutBlock: Block = {
  slug: "callout",
  fields: [
    {
      name: "tone",
      type: "select",
      defaultValue: "info",
      options: ["info", "success", "warning", "alert"],
      required: true,
    },
    { name: "content", type: "richText", required: true },
  ],
};

export const linkCardsBlock: Block = {
  slug: "linkCards",
  labels: { singular: "Link cards", plural: "Link cards" },
  fields: [
    {
      name: "cards",
      type: "array",
      minRows: 1,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
        { name: "description", type: "text" },
      ],
    },
  ],
};

export const embedBlock: Block = {
  slug: "embed",
  fields: [
    { name: "url", type: "text", required: true },
    { name: "title", type: "text" },
  ],
};

export const accordionBlock: Block = {
  slug: "accordion",
  fields: [
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "content", type: "richText", required: true },
      ],
    },
  ],
};

export const pageBlocks: Block[] = [
  richTextBlock,
  imageBlock,
  fileDownloadBlock,
  calloutBlock,
  linkCardsBlock,
  embedBlock,
  accordionBlock,
];
