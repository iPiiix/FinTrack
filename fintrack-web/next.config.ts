import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,  // apunta a fintrack-web/
  },
};

export default nextConfig;
