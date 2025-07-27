// next.config.ts
const nextConfig = {
  experimental: {
    // turbo: {}, // Uncomment if you want to enable turbo with default settings
  },
  // Ensure assets are served correctly
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // Add some debugging
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  typescript: {
    ignoreBuildErrors: true, // ⛔ disables typechecking in `next build`
  },
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('http://', '') || 'lypsundaqtyyzgicraxm.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('http://', '') || 'lypsundaqtyyzgicraxm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
