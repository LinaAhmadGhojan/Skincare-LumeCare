import type { NextConfig } from "next";

// Static export: `npm run build` writes plain files to /out that run on any hosting.
// If the demo is uploaded to a sub-folder (e.g. example.com/demo), build with
// NEXT_PUBLIC_BASE_PATH=/demo so asset and page links point to the right place.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  devIndicators: false,
  agentRules: false,
};

export default nextConfig;
