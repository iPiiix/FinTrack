import type { NextConfig } from "next";

// Standalone output is required for the Electron self-hosted server.
// ELECTRON_BUILD=1 forces standalone even in CI (used by GitHub Actions).
const isElectronBuild =
  process.env.ELECTRON_BUILD === '1' || (!process.env.VERCEL && !process.env.CI);

const nextConfig: NextConfig = {
  ...(isElectronBuild && { output: "standalone" }),
  turbopack: {},
  serverExternalPackages: ["better-sqlite3"],
  webpack: (config) => {
    config.externals = [...(config.externals ?? []), "better-sqlite3"];
    return config;
  },
};

export default nextConfig;
