import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for production deployments
  output: 'standalone',

  // Configure API base URL from environment variable
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
};

export default nextConfig;
