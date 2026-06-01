// file: web-generator/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // add if needed
  },
  // Disable x-powered-by header for security
  poweredByHeader: false,
  experimental: {
    // Ensure app router is used
    appDir: true,
  },
};

export default nextConfig;
