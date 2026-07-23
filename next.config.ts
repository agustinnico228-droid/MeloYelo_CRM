import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/**
 * Old intranet URL → Hub equivalent (§16.2), so links in notification
 * emails and bookmarks keep working after cutover. The three listed
 * are the most-linked pages by email volume; add more here as they
 * surface (the old Google Sites paths were only partially documented).
 */
const INTRANET_REDIRECTS: { source: string; destination: string }[] = [
  {
    // 54 email links
    source: "/crm/crm-info-instructions/introduction-for-pilot-program-agents",
    destination: "/guides/introduction",
  },
  {
    // 16 email links
    source: "/crm/crm-glitches",
    destination: "/known-issues",
  },
  {
    // 15 email links
    source: "/growth-marketing/campaign-naming-and-utm-convention",
    destination: "/growth/utm-convention",
  },
  { source: "/crm/crm-info-instructions", destination: "/guides" },
  { source: "/crm/managers-dashboard", destination: "/dashboards/manager" },
  { source: "/crm/crm-dashboard", destination: "/dashboards" },
];

const nextConfig: NextConfig = {
  // Cloud Run runs the standalone server.js from the build output.
  output: "standalone",
  async redirects() {
    return INTRANET_REDIRECTS.map((r) => ({ ...r, permanent: false }));
  },
};

export default withPayload(nextConfig);
