/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'files.47industries.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
