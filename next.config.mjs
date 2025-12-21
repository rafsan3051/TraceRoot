import path from 'path'

const USE_REAL_BLOCKCHAIN = process.env.USE_REAL_BLOCKCHAIN === 'true'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  typescript: {
    // !! WARN !!
    // This is for demonstration only - type checking is recommended in production
    ignoreBuildErrors: true,
  },
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
  // Empty turbopack config to use defaults but avoid symlink issues
  turbopack: {},
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // map '@' to project root absolute path
      '@': path.resolve(process.cwd()),
      ...(USE_REAL_BLOCKCHAIN ? {} : { ethers: path.resolve(process.cwd(), 'lib/shims/ethers-shim.js') }),
    };
    // Add support for importing .tsx files without extension
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', ...config.resolve.extensions || []];
    
    // Externalize ethers for server-side to avoid bundling when used
    if (isServer && USE_REAL_BLOCKCHAIN) {
      config.externals = [...(config.externals || []), 'ethers'];
    }
    
    return config;
  },
};

export default nextConfig;
