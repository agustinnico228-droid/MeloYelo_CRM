import type { GlobalConfig } from "payload";
import { anyone, isAdmin } from "./access";

/** §12 navigation: drag-and-drop tree with per-item audience. */
export const Navigation: GlobalConfig = {
  slug: "navigation",
  access: { read: anyone, update: isAdmin },
  fields: [
    {
      name: "items",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        // Empty URL = a group heading whose children hold the links
        { name: "url", type: "text" },
        {
          name: "audience",
          type: "select",
          defaultValue: "all",
          options: ["all", "agents", "managers"],
          required: true,
        },
        {
          name: "children",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "url", type: "text", required: true },
            {
              name: "audience",
              type: "select",
              defaultValue: "all",
              options: ["all", "agents", "managers"],
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

export const Settings: GlobalConfig = {
  slug: "settings",
  access: { read: anyone, update: isAdmin },
  fields: [
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "supportContact", type: "text" },
    {
      name: "looker",
      type: "group",
      fields: [
        { name: "agentReportUrl", type: "text" },
        { name: "managerReportUrl", type: "text" },
        { name: "growthReportUrl", type: "text" },
      ],
    },
    {
      name: "features",
      type: "group",
      fields: [
        { name: "showDashboards", type: "checkbox", defaultValue: true },
        { name: "showGuides", type: "checkbox", defaultValue: true },
        { name: "showKnownIssues", type: "checkbox", defaultValue: true },
      ],
    },
  ],
};

export const globals: GlobalConfig[] = [Navigation, Settings];
