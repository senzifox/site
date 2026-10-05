import { execSync } from "node:child_process";
import type { NextConfig } from "next";

const gitSha = () => {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
};

const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    BUILD_SHA: process.env.GIT_SHA || gitSha(),
    BUILD_TIME: new Date().toISOString(),
  },
};

export default config;
