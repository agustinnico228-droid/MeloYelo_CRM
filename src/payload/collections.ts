import type { CollectionConfig } from "payload";
import { anyone, isAdmin, isAdminOrManager, nobody } from "./access";
import { pageBlocks } from "./blocks";
import { hubSsoStrategy } from "./hub-sso";
import { collectionRevalidation } from "./revalidate";

const audienceField = {
  name: "audience",
  type: "select" as const,
  defaultValue: "all",
  options: ["all", "agents", "managers"],
  required: true,
};

/** Payload admin accounts. Content roles only — never CRM data access. */
export const Users: CollectionConfig = {
  slug: "users",
  // Hub-session SSO first (a signed-in manager/admin goes straight into
  // /admin); the local email/password strategy remains as fallback.
  auth: {
    strategies: [hubSsoStrategy],
  },
  admin: { useAsTitle: "email" },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "role",
      type: "select",
      defaultValue: "manager",
      options: ["admin", "manager"],
      required: true,
    },
  ],
};

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    staticDir: "media",
    imageSizes: [
      { name: "thumbnail", width: 300 },
      { name: "card", width: 640 },
      { name: "hero", width: 1400 },
    ],
    mimeTypes: ["image/*", "application/pdf"],
  },
  fields: [
    // §12: alt text required by validation
    { name: "alt", type: "text", required: true },
  ],
};

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: { useAsTitle: "title", defaultColumns: ["title", "slug", "_status"] },
  versions: { drafts: { autosave: true } },
  ...collectionRevalidation("cms:pages"),
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    // Path-style slugs allowed, e.g. "ride-guide/call-flow"
    { name: "slug", type: "text", required: true, unique: true },
    {
      name: "section",
      type: "select",
      defaultValue: "top",
      options: ["top", "crm", "growth", "campaigns", "resources"],
      required: true,
    },
    { name: "showToc", type: "checkbox", defaultValue: false },
    // Who may view the page in the hub — enforced in the catch-all
    // route. Working documents (rates, budgets) are managers-only.
    audienceField,
    // Surfaced as "Last reviewed {date}" so stale docs are visible
    { name: "lastReviewed", type: "date" },
    { name: "layout", type: "blocks", blocks: pageBlocks },
  ],
};

/** §13.1: embedded Looker reports, addable without a deploy. */
export const Dashboards: CollectionConfig = {
  slug: "dashboards",
  orderable: true,
  admin: { useAsTitle: "title", defaultColumns: ["title", "audience"] },
  ...collectionRevalidation("cms:dashboards"),
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "description", type: "textarea" },
    { name: "lookerReportId", type: "text" },
    { name: "lookerPageId", type: "text" },
    audienceField,
    { name: "lastReviewed", type: "date" },
  ],
};

/** §13.1: campaign pages — live first, ended collapsed on /campaigns. */
export const Campaigns: CollectionConfig = {
  slug: "campaigns",
  orderable: true,
  admin: { useAsTitle: "title", defaultColumns: ["title", "code", "status"] },
  ...collectionRevalidation("cms:campaigns"),
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    // §17 C1 key rule: utm_campaign must EXACTLY match this code
    { name: "code", type: "text" },
    {
      name: "status",
      type: "select",
      defaultValue: "planned",
      options: ["planned", "live", "paused", "ended"],
      required: true,
    },
    // Shown on /campaigns when paused ("paused with the reason visible")
    { name: "statusNote", type: "text" },
    {
      name: "channel",
      type: "select",
      options: ["google-ads", "meta", "print", "email", "multi"],
    },
    { name: "startsAt", type: "date" },
    { name: "endsAt", type: "date" },
    { name: "budget", type: "number" },
    { name: "snapshot", type: "richText" },
    { name: "landingPageUrl", type: "text" },
    // Defaults to code — chosen, not typed, in the UTM builder
    { name: "utmCampaign", type: "text" },
    {
      name: "assets",
      type: "array",
      fields: [
        { name: "file", type: "upload", relationTo: "media", required: true },
      ],
    },
    {
      name: "reportLinks",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
  ],
};

export const Guides: CollectionConfig = {
  slug: "guides",
  orderable: true,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "audience", "_status"],
  },
  versions: { drafts: { autosave: true } },
  ...collectionRevalidation("cms:guides"),
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "summary", type: "textarea" },
    { name: "content", type: "richText", required: true },
    audienceField,
    { name: "tags", type: "array", fields: [{ name: "tag", type: "text" }] },
  ],
};

export const KnownIssues: CollectionConfig = {
  slug: "knownIssues",
  orderable: true,
  admin: { useAsTitle: "title", defaultColumns: ["title", "status"] },
  ...collectionRevalidation("cms:knownIssues"),
  access: {
    read: anyone,
    create: isAdminOrManager,
    update: isAdminOrManager,
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      defaultValue: "open",
      options: ["open", "investigating", "fixed"],
      required: true,
    },
    { name: "affects", type: "text" },
    { name: "workaround", type: "textarea" },
    { name: "reportedAt", type: "date" },
    { name: "fixedAt", type: "date" },
  ],
};

export const Announcements: CollectionConfig = {
  slug: "announcements",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "severity", "published"],
  },
  ...collectionRevalidation("cms:announcements"),
  access: {
    read: anyone,
    create: isAdminOrManager,
    update: isAdminOrManager,
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "body", type: "richText" },
    {
      name: "severity",
      type: "select",
      defaultValue: "info",
      // §11: critical announcements are non-dismissible in the hub
      options: ["info", "warning", "critical"],
      required: true,
    },
    { name: "startsAt", type: "date" },
    { name: "endsAt", type: "date" },
    { name: "published", type: "checkbox", defaultValue: false },
    audienceField,
  ],
};

export const QuickLinks: CollectionConfig = {
  slug: "quickLinks",
  orderable: true,
  admin: { useAsTitle: "label", defaultColumns: ["label", "group"] },
  ...collectionRevalidation("cms:quickLinks"),
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: "label", type: "text", required: true },
    { name: "url", type: "text", required: true },
    { name: "icon", type: "text" },
    { name: "group", type: "text" },
    audienceField,
  ],
};

/** §10.5/§12: every CRM write, written by the server via local API only. */
export const AuditLog: CollectionConfig = {
  slug: "auditLog",
  admin: {
    useAsTitle: "summary",
    defaultColumns: ["actorEmail", "action", "uniqueId", "field", "createdAt"],
  },
  access: {
    read: isAdmin,
    create: nobody,
    update: nobody,
    delete: nobody,
  },
  fields: [
    { name: "summary", type: "text" },
    { name: "actorEmail", type: "text", required: true },
    { name: "action", type: "text", required: true },
    { name: "uniqueId", type: "text" },
    { name: "field", type: "text" },
    { name: "oldValue", type: "textarea" },
    { name: "newValue", type: "textarea" },
  ],
};

export const collections: CollectionConfig[] = [
  Users,
  Media,
  Pages,
  Dashboards,
  Campaigns,
  Guides,
  KnownIssues,
  Announcements,
  QuickLinks,
  AuditLog,
];
