import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* output: "standalone" — only for Docker/Node; Vercel handles this automatically */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
