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
      { url: '/en/~offline', revision },
    ],
    swSrc: 'src/app/sw.ts',
    useNativeEsbuild: true,
  })
