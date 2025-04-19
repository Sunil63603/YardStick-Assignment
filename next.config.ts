import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ not recommended for production
  },
};

export default nextConfig;
