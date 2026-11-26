/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'

const mockReadBodyEntry = jest.fn()

jest.mock('../../flags', () => ({
  isPwaMailCacheEnabled: () => true,
}))

jest.mock('../use-mail-cache', () => ({
  useMailCache: () => ({ readBodyEntry: mockReadBodyEntry }),
}))

import { useOfflineMailBody } from '../use-offline-mail-body'

describe('useOfflineMailBody', () => {
  afterEach(() => {
    mockReadBodyEntry.mockReset()
  })

  it('returns the cached body with its storage time', async () => {
    mockReadBodyEntry.mockResolvedValue({
      payload: { subject: 'Hi' },
      cachedAt: 1_000,
    })
    const { result } = renderHook(() =>
      useOfflineMailBody<{ subject: string }>({
        accountId: '0',
        folderPath: 'INBOX',
        mailId: '1',
        active: true,
      })
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual({ subject: 'Hi' })
    expect(result.current.cachedAt).toBe(1_000)
  })

  it('stops loading when the IndexedDB read fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockReadBodyEntry.mockRejectedValue(new Error('IDB closed'))
    const { result } = renderHook(() =>
      useOfflineMailBody({
        accountId: '0',
        folderPath: 'INBOX',
        mailId: '1',
        active: true,
      })
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBeNull()
    warn.mockRestore()
  })
})
