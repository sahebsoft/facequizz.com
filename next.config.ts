import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'facequizz.com',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable experimental features
  experimental: {
    typedRoutes: true,
  },
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  // Custom headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/id/:id',
        destination: '/quiz/:id',
        permanent: true,
      },
      {
        source: '/start/:id',
        destination: '/quiz/:id',
        permanent: true,
      },
    ]
  },
}

export default nextConfig