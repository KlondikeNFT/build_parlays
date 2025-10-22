/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['a.espncdn.com', 'static.www.nfl.com', 's3-us-west-2.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.espncdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.nfl.com',
      },
      {
        protocol: 'https',
        hostname: 's3-us-west-2.amazonaws.com',
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Removed SportsDataIO API key
}

module.exports = nextConfig

