import { isBrokenPrecacheUrl } from '@/app/sw-runtime'
import { getLocales } from '@/lib/i18n/config'
import { createSerwistRoute } from '@serwist/turbopack'
import { spawnSync } from 'node:child_process'

const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf-8',
  }).stdout?.trim() || crypto.randomUUID()

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [
      { url: '/~offline', revision },
      ...getLocales().map((locale) => ({
        url: `/${locale}/~offline`,
        revision,
      })),
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
