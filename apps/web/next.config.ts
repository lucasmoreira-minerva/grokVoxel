import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Monorepo: allow reading skills/ and data/ outside apps/web
  outputFileTracingRoot: path.join(__dirname, "../.."),
  experimental: {
    // serverComponentsExternalPackages if needed later
  },
};

export default nextConfig;
