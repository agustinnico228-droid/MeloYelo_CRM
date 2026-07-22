import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Cloud Run runs the standalone server.js from the build output.
  output: "standalone",
};

export default withPayload(nextConfig);
