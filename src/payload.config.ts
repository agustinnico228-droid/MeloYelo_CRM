import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { gcsStorage } from "@payloadcms/storage-gcs";
import sharp from "sharp";
import { collections } from "./payload/collections";
import { globals } from "./payload/globals";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Payload holds CMS content and the audit log ONLY — never customer
 * data (§6). Postgres via Cloud SQL in production; media on GCS when
 * a bucket is configured, local disk otherwise.
 */
export default buildConfig({
  admin: {
    user: "users",
    meta: { titleSuffix: " - MeloYelo CRM Hub" },
    // Google-Sites-style editing: the admin shows the real page in a live
    // preview pane while you edit, with device-width toggles. Draft-enabled
    // collections (pages, guides) preview unsaved changes via ?preview=1.
    livePreview: {
      url: ({ data, collectionConfig }) => {
        const base =
          process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
        const slug = typeof data?.slug === "string" ? data.slug : "";
        switch (collectionConfig?.slug) {
          case "pages":
            return `${base}/${slug}?preview=1`;
          case "guides":
            return `${base}/guides/${slug}?preview=1`;
          case "campaigns":
            return `${base}/campaigns/${slug}`;
          case "dashboards":
            return `${base}/dashboards/${slug}`;
          default:
            return base;
        }
      },
      collections: ["pages", "guides", "campaigns", "dashboards"],
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 390, height: 844 },
        { label: "Tablet", name: "tablet", width: 834, height: 1194 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
    },
  },
  editor: lexicalEditor(),
  collections,
  globals,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? "",
    },
  }),
  secret:
    process.env.PAYLOAD_SECRET ??
    (process.env.NODE_ENV !== "production" ? "dev-only-payload-secret" : ""),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  plugins: [
    ...(process.env.GCS_BUCKET
      ? [
          gcsStorage({
            collections: { media: true },
            bucket: process.env.GCS_BUCKET,
            options: {
              projectId: process.env.GCS_PROJECT_ID,
            },
          }),
        ]
      : []),
  ],
});
