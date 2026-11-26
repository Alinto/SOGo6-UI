import { createKillSwitchRoute, swPrecacheRevision } from '@/app/sw-build'
import { isBrokenPrecacheUrl } from '@/app/sw-runtime'
import { isPwaEnabled } from '@/features/offline/flags'
import { getLocales } from '@/lib/i18n/config'
import { createSerwistRoute } from '@serwist/turbopack'

function createPwaRoute() {
  const revision = swPrecacheRevision()
  return createSerwistRoute({
    additionalPrecacheEntries: [
      { url: '/~offline', revision },
      ...getLocales().flatMap((locale) => [
        { url: `/${locale}/~offline`, revision },
        { url: `/${locale}/auth/login`, revision },
      ]),
    ],
    swSrc: 'src/app/sw.ts',
    useNativeEsbuild: true,
    globIgnores: ['**/robots.txt', '**/fonts/OpenDyslexic*'],
    manifestTransforms: [
      async (manifestEntries) => ({
        manifest: manifestEntries.filter(
          (entry) => !isBrokenPrecacheUrl(entry.url)
        ),
        warnings: [],
      }),
    ],
    esbuildOptions: {
      define: {
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV ?? 'production'
        ),
      },
    },
  })
}

// PWA off: serve a self-unregistering worker so installed clients clean up.
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  isPwaEnabled() ? createPwaRoute() : createKillSwitchRoute()
