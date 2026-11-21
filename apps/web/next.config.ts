import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@huquqi/core"],
  experimental: { serverActions: { bodySizeLimit: "11mb" } },
};

export default nextConfig;
