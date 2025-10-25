import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  typescript: {
    // !! WARN !!
    // This is for demonstration only - type checking is recommended in production
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  // Using default JSX transformation
  compiler: {
    styledComponents: false,
  },
  images: {
    // use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // map '@' to project root absolute path
      '@': path.resolve(process.cwd()),
    };
    // Add support for importing .tsx files without extension
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', ...config.resolve.extensions || []];
    return config;
  },
};

export default nextConfig;
