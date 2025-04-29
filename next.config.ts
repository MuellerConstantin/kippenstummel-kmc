import type { NextConfig } from "next";

const isStandalone = process.env.NEXT_OUTPUT_MODE === "standalone";

const nextConfig: NextConfig = {
  output: isStandalone ? "standalone" : undefined,
};

export default nextConfig;
