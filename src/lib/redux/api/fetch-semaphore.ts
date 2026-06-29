/** Max concurrent RTK fetch calls to avoid browser HTTP/1.1 connection queue saturation (prod). */
export const API_FETCH_MAX_CONCURRENT = 5

/** Dev bypass: same-origin proxy already shares :3000 budget with RSC/HMR; queuing here causes starvation. */
export const API_FETCH_DEV_BYPASS =
  process.env.NODE_ENV === 'development'

const QUEUE_WARN_MS = 500

type QueueEntry = {
  resolve: () => void
  queuedAt: number
}

let maxConcurrent = API_FETCH_MAX_CONCURRENT
let activeCount = 0
const waitQueue: QueueEntry[] = []

function drainQueue(): void {
  while (activeCount < maxConcurrent && waitQueue.length > 0) {
    const entry = waitQueue.shift()
    if (!entry) break

    if (process.env.NODE_ENV === 'development') {
      const waitedMs = Date.now() - entry.queuedAt
      if (waitedMs >= QUEUE_WARN_MS) {
        console.debug(
          `[api] fetch semaphore: waited ${waitedMs}ms (active=${activeCount}, queued=${waitQueue.length})`
        )
      }
    }

    activeCount += 1
    entry.resolve()
  }
}

function acquireSlot(): Promise<void> {
  if (activeCount < maxConcurrent) {
    activeCount += 1
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    waitQueue.push({ resolve, queuedAt: Date.now() })
  })
}

function releaseSlot(): void {
  activeCount = Math.max(0, activeCount - 1)
  drainQueue()
}

/** Run an async task with global API fetch concurrency limiting (skipped in development). */
export async function withApiFetchSemaphore<T>(
  task: () => T | Promise<T>
): Promise<Awaited<T>> {
  if (API_FETCH_DEV_BYPASS) {
    return await task()
  }

  await acquireSlot()
  try {
    return await task()
  } finally {
    releaseSlot()
  }
}

/** Test-only: reset semaphore state and optionally override max concurrency. */
export function resetApiFetchSemaphore(options?: { maxConcurrent?: number }): void {
  activeCount = 0
  waitQueue.length = 0
  if (options?.maxConcurrent !== undefined) {
    maxConcurrent = options.maxConcurrent
  } else {
    maxConcurrent = API_FETCH_MAX_CONCURRENT
  }
}
