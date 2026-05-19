/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.orvix.io' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000', 'orvix.io'] },
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev",
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' fonts.gstatic.com",
            "connect-src 'self' https: wss:",
            "media-src 'self' blob: https:",
          ].join('; '),
        },
      ],
    },
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, net: false, tls: false }
    }
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
      use: { loader: 'file-loader', options: { publicPath: '/_next/static/media/', outputPath: 'static/media/', name: '[name].[hash].[ext]' } },
    })
    return config
  },
}

module.exports = nextConfig
