import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,  // apunta a fintrack-web/
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://fintrack-api-wawb.onrender.com/:path*',
      },
    ];
  },
};

export default nextConfig;
