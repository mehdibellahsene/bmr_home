import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
  // Enable static optimization
  output: 'standalone',
  // Enable compression
  compress: true,
  // External packages optimization
  serverExternalPackages: ['mongoose'],
};

export default nextConfig;
