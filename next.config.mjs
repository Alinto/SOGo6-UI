import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    reactStrictMode: false, // Disable because of trigger several components remounts
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    // Production optimizations for minimal bundle size
    output: 'standalone',
    compress: true,
    productionBrowserSourceMaps: false,
    poweredByHeader: false,
    // Aggressive image optimization
    images: {
        unoptimized: false,
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 31536000, // 1 year
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    // Enable incremental static generation
    onDemandEntries: {
        maxInactiveAge: 60 * 1000, // Keep pages for 60s
        pagesBufferLength: 5,
    },
    // Webpack optimizations
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Client-side optimizations
            config.optimization = {
                ...config.optimization,
                minimize: true,
                moduleIds: 'deterministic',
                runtimeChunk: 'single',
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // React and core libraries
                        react: {
                            name: 'react-vendors',
                            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
                            priority: 100,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                        // UI components library
                        radix: {
                            name: 'radix-ui',
                            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                            priority: 90,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                        // Redux and state management
                        redux: {
                            name: 'redux',
                            test: /[\\/]node_modules[\\/](@reduxjs|react-redux)[\\/]/,
                            priority: 80,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                        // Form libraries
                        forms: {
                            name: 'forms',
                            test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
                            priority: 70,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                        // Other common libraries
                        common: {
                            name: 'common',
                            minChunks: 2,
                            priority: 10,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                    },
                },
            };
        }
        return config;
    },
    // Prevent search engine scraping
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex, nofollow',
                    },
                ],
            },
        ];
    },
};

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

export default withNextIntl(nextConfig);
