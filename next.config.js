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
  // Removed SportsDataIO API key
}

module.exports = nextConfig

