/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/about', destination: '/' },
      { source: '/login', destination: '/' },
      { source: '/signup', destination: '/' },
    ]
  },
}

export default nextConfig
