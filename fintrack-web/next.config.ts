import type { NextConfig } from "next";

// Standalone output is required for the Electron self-hosted server.
// On Vercel (and CI) we skip it so the platform can manage its own output.
const isElectronBuild = !process.env.VERCEL && !process.env.CI;

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
