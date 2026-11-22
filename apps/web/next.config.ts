import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@huquqi/core"],
  // Local-disk uploads pass through a server action (and the middleware), so both limits are raised.
  experimental: { serverActions: { bodySizeLimit: "210mb" }, middlewareClientMaxBodySize: "210mb" },
};

export default nextConfig;
