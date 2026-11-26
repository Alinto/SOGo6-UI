import { NextResponse } from 'next/server'
import { spawnSync } from 'node:child_process'

type EnvSource = Record<string, string | undefined>

function readGitSha(): string {
  try {
    const git = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' })
    return git.stdout?.trim() ?? ''
  } catch {
    return ''
  }
}

/**
 * Revision of the precached HTML documents (`/~offline`, login). It must
 * change on every deploy or installed workers keep serving HTML that points
 * to deleted chunks. Docker builds have no `.git`: pass `SOURCE_VERSION`, and
 * without it fall back to a value unique to this build (the SW route is
 * `force-static`, so it is evaluated once at build time).
 */
export function swPrecacheRevision(
  env: EnvSource = process.env,
  gitSha: () => string = readGitSha,
  now: () => number = Date.now,
  random: () => number = Math.random
): string {
  const fromEnv =
    env.SOURCE_VERSION?.trim() ||
    env.GIT_COMMIT?.trim() ||
    env.VERCEL_GIT_COMMIT_SHA?.trim()
  if (fromEnv) return fromEnv
  const sha = gitSha()
  if (sha) return sha
  return `build-${now().toString(36)}-${random().toString(36).slice(2, 10)}`
}

/**
 * Worker served at `/serwist/sw.js` when the PWA flag is off: browsers that
 * installed the real worker update to this one, which wipes Cache Storage and
 * unregisters itself (no fetch handler, so requests go to the network).
 */
export const KILL_SWITCH_SW_SOURCE = `self.addEventListener('install', () => {
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
      } catch (e) {}
      await self.registration.unregister()
    })()
  )
})
`

interface SerwistRouteContext {
  params: Promise<{ path: string }>
}

/** Same shape as `createSerwistRoute()`, serving only the kill-switch worker. */
export function createKillSwitchRoute() {
  const dynamic = 'force-static' as const
  const dynamicParams = false
  const revalidate = false as const
  const generateStaticParams = async () => [{ path: 'sw.js' }]
  const GET = async (_: Request, { params }: SerwistRouteContext) => {
    const { path } = await params
    if (path !== 'sw.js') return new NextResponse(null, { status: 404 })
    return new NextResponse(KILL_SWITCH_SW_SOURCE, {
      headers: {
        'Content-Type': 'application/javascript',
        'Service-Worker-Allowed': '/',
      },
    })
  }
  return { dynamic, dynamicParams, revalidate, generateStaticParams, GET }
}
