import { API_FETCH_MAX_CONCURRENT } from '../fetch-semaphore'

async function importFetchSemaphore(nodeEnv: 'production' | 'development' | 'test') {
  const originalEnv = process.env.NODE_ENV
  process.env.NODE_ENV = nodeEnv
  jest.resetModules()
  const mod = await import('../fetch-semaphore')
  return {
    mod,
    restore: () => {
      process.env.NODE_ENV = originalEnv
      jest.resetModules()
    },
  }
}

describe('withApiFetchSemaphore', () => {
  it('exports default max concurrent of 5', () => {
    expect(API_FETCH_MAX_CONCURRENT).toBe(5)
  })

  describe('production limiting', () => {
    let restoreEnv: () => void
    let resetApiFetchSemaphore: (options?: { maxConcurrent?: number }) => void
    let withApiFetchSemaphore: <T>(task: () => T | Promise<T>) => Promise<Awaited<T>>

    beforeAll(async () => {
      const loaded = await importFetchSemaphore('production')
      restoreEnv = loaded.restore
      resetApiFetchSemaphore = loaded.mod.resetApiFetchSemaphore
      withApiFetchSemaphore = loaded.mod.withApiFetchSemaphore
    })

    afterAll(() => {
      restoreEnv()
    })

    beforeEach(() => {
      resetApiFetchSemaphore()
    })

    afterEach(() => {
      resetApiFetchSemaphore()
    })

    it('runs tasks and returns their result', async () => {
      const result = await withApiFetchSemaphore(async () => 42)
      expect(result).toBe(42)
    })

    it('limits concurrent executions', async () => {
      resetApiFetchSemaphore({ maxConcurrent: 2 })

      let running = 0
      let maxRunning = 0

      const task = async () => {
        running += 1
        maxRunning = Math.max(maxRunning, running)
        await new Promise((resolve) => setTimeout(resolve, 20))
        running -= 1
      }

      await Promise.all([
        withApiFetchSemaphore(task),
        withApiFetchSemaphore(task),
        withApiFetchSemaphore(task),
        withApiFetchSemaphore(task),
      ])

      expect(maxRunning).toBeLessThanOrEqual(2)
    })

    it('releases slot when task throws', async () => {
      resetApiFetchSemaphore({ maxConcurrent: 1 })

      await expect(
        withApiFetchSemaphore(async () => {
          throw new Error('fail')
        })
      ).rejects.toThrow('fail')

      const result = await withApiFetchSemaphore(async () => 'ok')
      expect(result).toBe('ok')
    })
  })

  describe('development bypass', () => {
    let restoreEnv: () => void

    afterEach(() => {
      restoreEnv?.()
    })

    it('bypasses limiting in development', async () => {
      const loaded = await importFetchSemaphore('development')
      restoreEnv = loaded.restore
      const { withApiFetchSemaphore: withDevBypass } = loaded.mod

      let running = 0
      let maxRunning = 0
      const task = async () => {
        running += 1
        maxRunning = Math.max(maxRunning, running)
        await new Promise((resolve) => setTimeout(resolve, 20))
        running -= 1
      }

      await Promise.all([
        withDevBypass(task),
        withDevBypass(task),
        withDevBypass(task),
        withDevBypass(task),
      ])

      expect(maxRunning).toBe(4)
    })
  })
})
