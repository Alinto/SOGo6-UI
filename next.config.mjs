import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
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
