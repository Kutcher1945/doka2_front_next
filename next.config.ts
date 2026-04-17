import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.cybert.online' },
      { protocol: 'https', hostname: 'avatars.steamstatic.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/social-api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`,
      },
    ]
  },
}

export default nextConfig
