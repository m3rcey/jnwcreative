import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
