import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  const requiredEnvVars = {
    // Add your required environment variables here
    // 'DATABASE_URL': process.env.DATABASE_URL,
    // 'API_KEY': process.env.API_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
  }
};

// Run validation
validateEnv();

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const ENABLE_BUNDLE_ANALYZER = process.env.ANALYZE === 'true';

// Site URL for metadata and redirects
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jxcobcreations.com';

// ============================================================================
// WEBPACK CONFIGURATION
// ============================================================================

const webpackConfig = (config: Configuration, { isServer }: { isServer: boolean }) => {
  // Bundle analyzer for development
  if (ENABLE_BUNDLE_ANALYZER && !isServer) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    config.plugins?.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: true,
        generateStatsFile: true,
        statsFilename: '../analyze/stats.json',
        reportFilename: '../analyze/bundle-report.html',
      })
    );
  }

  // Optimize bundle size
  if (IS_PRODUCTION) {
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Framework chunk (React, Next.js)
          framework: {
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
        },
      },
    };
  }

  return config;
};

// ============================================================================
// NEXT.JS CONFIGURATION
// ============================================================================

const nextConfig: NextConfig = {
  // ==================== CORE SETTINGS ====================

  /**
   * Enable React Strict Mode for highlighting potential problems
   */
  reactStrictMode: true,

  /**
   * Configure standalone output for Docker deployments
   * Generates a standalone folder with minimal dependencies
   */
  output: IS_PRODUCTION ? 'standalone' : undefined,

  /**
   * Enable source maps in production for debugging
   * Can be disabled after initial deployment for security
   */
  productionBrowserSourceMaps: false, // Set to true for debugging

  // ==================== IMAGE OPTIMIZATION ====================

  images: {
    /**
     * Use remotePatterns instead of deprecated domains
     * Add all external image sources here
     */
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.jxcobcreations.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      // Add your CDN domains here
      // {
      //   protocol: 'https',
      //   hostname: 'your-cdn.com',
      //   pathname: '/images/**',
      // },
    ],

    /**
     * Supported image formats in order of preference
     * AVIF provides better compression than WebP
     */
    formats: ['image/avif', 'image/webp'],

    /**
     * Device sizes for responsive images
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    /**
     * Image sizes for different layouts
     */
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    /**
     * Minimize layout shift with proper sizing
     */
    minimumCacheTTL: 60,

    /**
     * Disable static imports from public directory
     * Forces explicit Image component usage
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ==================== COMPILER OPTIMIZATIONS ====================

  compiler: {
    /**
     * Remove console logs in production
     * Preserves console.error and console.warn
     */
    removeConsole: IS_PRODUCTION
      ? {
          exclude: ['error', 'warn', 'info'],
        }
      : false,

    /**
     * Enable React compiler optimizations
     */
    reactRemoveProperties: IS_PRODUCTION,
  },

  // ==================== EXPERIMENTAL FEATURES ====================

  experimental: {
    /**
     * Optimize CSS extraction and minification
     */
    optimizeCss: true,

    /**
     * Enable optimized package imports
     */
    optimizePackageImports: ['framer-motion', 'lodash', 'date-fns'],
  },

  // ==================== WEBPACK CONFIGURATION ====================

  webpack: webpackConfig,

  // ==================== TURBOPACK CONFIGURATION ====================

  /**
   * Turbopack configuration (Next.js 15 stable)
   */
  turbopack: IS_DEVELOPMENT
    ? {
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
          },
        },
      }
    : undefined,

  // ==================== SECURITY HEADERS ====================

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // ========== Prevent Clickjacking ==========
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },

          // ========== Prevent MIME Type Sniffing ==========
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },

          // ========== XSS Protection ==========
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },

          // ========== DNS Prefetch Control ==========
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },

          // ========== Strict Transport Security ==========
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },

          // ========== Referrer Policy ==========
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },

          // ========== Permissions Policy ==========
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },

          // ========== Content Security Policy ==========
          {
            key: 'Content-Security-Policy',
            value: IS_PRODUCTION
              ? [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                  "font-src 'self' https://fonts.gstatic.com",
                  "img-src 'self' data: https: blob:",
                  "media-src 'self' https:",
                  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com",
                  "frame-src 'self' https:",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-ancestors 'none'",
                  'upgrade-insecure-requests',
                ].join('; ')
              : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:;",
          },
        ],
      },

      // ========== Static Asset Caching ==========
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // ========== API Route Headers ==========
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },

  // ==================== REDIRECTS ====================

  async redirects() {
    return [
      // ========== WWW to Non-WWW ==========
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.jxcobcreations.com',
          },
        ],
        destination: `${SITE_URL}/:path*`,
        permanent: true,
      },

      // ========== Old Routes (Add as needed) ==========
      // {
      //   source: '/old-route',
      //   destination: '/new-route',
      //   permanent: true,
      // },
    ];
  },

  // ==================== REWRITES ====================

  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite rules that should be checked before Next.js pages/public files
      ],
      afterFiles: [
        // Rewrite rules that should be checked after Next.js pages/public files
        // {
        //   source: '/blog/:slug',
        //   destination: '/news/:slug',
        // },
      ],
      fallback: [
        // Rewrite rules that should be checked after both pages/public files and dynamic routes
      ],
    };
  },

  // ==================== INTERNATIONALIZATION ====================

  // i18n: {
  //   locales: ['en', 'ms', 'zh'],
  //   defaultLocale: 'en',
  //   localeDetection: true,
  // },

  // ==================== TYPESCRIPT ====================

  typescript: {
    /**
     * Enable strict type checking
     */
    ignoreBuildErrors: false,
  },

  // ==================== ESLINT ====================

  eslint: {
    /**
     * Run ESLint during builds
     */
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'context'],
  },

  // ==================== LOGGING ====================

  logging: {
    fetches: {
      fullUrl: IS_DEVELOPMENT,
    },
  },

  // ==================== COMPRESSION ====================

  compress: true, // Enable gzip compression

  // ==================== TRAILING SLASH ====================

  trailingSlash: false,

  // ==================== PAGE EXTENSIONS ====================

  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // ==================== POWERED BY HEADER ====================

  poweredByHeader: false, // Remove X-Powered-By header for security
};

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

export default nextConfig;
