import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@deploymedic/core"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
