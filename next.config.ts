import type { NextConfig } from "next";

const isStandalone = process.env.NEXT_OUTPUT_MODE === "standalone";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_BASE_PATH,
  output: isStandalone ? "standalone" : undefined,
};

export default nextConfig;
