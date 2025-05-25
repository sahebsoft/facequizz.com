/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'res.cloudinary.com',
      'facequizz.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable RTL support
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
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
    ];
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
    ];
  },
};

module.exports = nextConfig;