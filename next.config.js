/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable turbopack to fix workspace root inference issue
  experimental: {
    turbo: false,
  },
};

module.exports = nextConfig;