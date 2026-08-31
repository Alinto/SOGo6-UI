import { isBrokenPrecacheUrl } from '@/app/sw-runtime'
import { getLocales } from '@/lib/i18n/config'
import { createSerwistRoute } from '@serwist/turbopack'
import { spawnSync } from 'node:child_process'

function swPrecacheRevision(): string {
  const fromEnv =
    process.env.SOURCE_VERSION?.trim() ||
    process.env.GIT_COMMIT?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim()
  if (fromEnv) return fromEnv
  const git = spawnSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf-8',
  })
  const sha = git.stdout?.trim()
  return sha || 'dev'
}

const revision = swPrecacheRevision()

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
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
