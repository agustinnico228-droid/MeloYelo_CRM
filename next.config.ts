import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run runs the standalone server.js from the build output.
  output: "standalone",
};

export default nextConfig;
