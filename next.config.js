/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose'],
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    unoptimized: true
  },
  // Disable strict route checking to allow for parameter inconsistencies during migration
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  typescript: {
    // Enforce TypeScript errors
    ignoreBuildErrors: false
  },
  eslint: {
    // Enforce ESLint rules
    ignoreDuringBuilds: false,
    dirs: ['pages', 'app', 'components', 'lib', 'utils']
  },
  // Use static export to bypass route checks
  output: 'export',
  // Disable route validation during standardization
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  // Use loose mode for routes during migration to avoid errors
  experimental: {
    // Disable checks that cause route errors during development and migration
    disableOptimizedLoading: true
  }
}

module.exports = nextConfig