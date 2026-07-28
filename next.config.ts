import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  serverExternalPackages: ["cheerio"],
};

export default nextConfig;
