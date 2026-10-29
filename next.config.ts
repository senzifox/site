import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const gitSha = () => {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
};

const pageExtensions = ["tsx", "ts"];

const config = (phase: string): NextConfig => ({
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    BUILD_SHA: process.env.GIT_SHA || gitSha(),
    BUILD_TIME: new Date().toISOString(),
  },
  images: {
    remotePatterns: [new URL("https://raw.githubusercontent.com/senzifox/**")],
    formats: ["image/avif", "image/webp"],
    unoptimized: phase === PHASE_DEVELOPMENT_SERVER,
  },
  experimental: { isrFlushToDisk: false },
  pageExtensions: phase === PHASE_DEVELOPMENT_SERVER ? ["dev.ts", ...pageExtensions] : pageExtensions,
});

export default config;
