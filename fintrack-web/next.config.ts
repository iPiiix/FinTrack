import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,  // apunta a fintrack-web/
  },
  async rewrites() {
    return [
      {
        // Proxy all backend routes, excluding 'quote' which is handled locally
        source: '/api/:path((?!quote).*)',
        destination: 'https://fintrack-api-wawb.onrender.com/:path*',
      },
    ];
  },
};

export default nextConfig;
