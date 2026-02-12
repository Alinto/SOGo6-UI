import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const withPWA = withPWAInit({
    dest: 'public',
    disable: isDev, 
    register: true,
    skipWaiting: true,
    buildExcludes: [
        /app-build-manifest\.json$/,
        /middleware-manifest\.json$/,
        /build-manifest\.json$/,
    ],
    fallbacks: {
        document: '/offline',
    },
    disableDevLogs: true,
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
            },
        },
        {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'static-images',
                expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
            },
        },
        {
            urlPattern: /\.(?:js|css|woff2?)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-assets',
                expiration: { maxEntries: 60, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: /^https?.*\.(html|htm)$/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'pages-cache',
                networkTimeoutSeconds: 10,
                expiration: { 
                    maxEntries: 50, 
                    maxAgeSeconds: 7 * 24 * 60 * 60
                },
            },
        },
        {
            urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'next-data',
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60
                },
            },
        },
        {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60
                },
            },
        },
    ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    reactStrictMode: false,
    typescript: {
        ignoreBuildErrors: true,
    },
    output: 'standalone',
    compress: true,
    productionBrowserSourceMaps: false,
    poweredByHeader: false,
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    images: {
        unoptimized: false,
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 31536000,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    onDemandEntries: {
        maxInactiveAge: 60 * 1000,
        pagesBufferLength: 5,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
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
                        react: {
                            name: 'react-vendors',
                            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
                            priority: 100,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                        radix: {
                            name: 'radix-ui',
                            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                            priority: 90,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                        redux: {
                            name: 'redux',
                            test: /[\\/]node_modules[\\/](@reduxjs|react-redux)[\\/]/,
                            priority: 80,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                        forms: {
                            name: 'forms',
                            test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
                            priority: 70,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
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

export default withPWA(withNextIntl(nextConfig));
