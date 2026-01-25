import path from 'path'
import { fileURLToPath } from 'url'

// Resolve __dirname in ESM context
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const USE_REAL_BLOCKCHAIN = process.env.USE_REAL_BLOCKCHAIN === 'true'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Silence monorepo/workspace root inference warning by explicitly setting the root
  outputFileTracingRoot: path.resolve(__dirname, '..'),
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
      // Vercel Blob public URLs
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
      },
      // Common S3 public URL patterns
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
    ],
  },
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
    
    // Externalize heavy Fabric SDK deps so Next doesn't try to bundle .proto assets
    if (isServer && USE_REAL_BLOCKCHAIN) {
      config.externals = [
        ...(config.externals || []),
        'ethers',
        'fabric-network',
        'fabric-ca-client',
        'fabric-protos',
        '@grpc/grpc-js',
        '@grpc/proto-loader'
      ];
    }
    
    return config;
  },
};

export default nextConfig;
