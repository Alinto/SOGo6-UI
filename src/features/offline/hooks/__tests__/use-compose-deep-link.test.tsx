/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react'
import { useComposeDeepLink } from '../use-compose-deep-link'

const mockDispatch = jest.fn()
const mockReplace = jest.fn()
let mockSearch = new URLSearchParams('compose=1')

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => '/u/0/INBOX',
  useRouter: () => ({ replace: mockReplace }),
}))

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearch,
}))

jest.mock('@/lib/utils/create-client-id', () => ({
  createClientId: () => 'draft-test',
}))

jest.mock('../../share/pending-share', () => ({
  consumePendingShare: async () => null,
}))

function Probe() {
  useComposeDeepLink()
  return null
}

describe('useComposeDeepLink', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockReplace.mockClear()
    mockSearch = new URLSearchParams('compose=1')
  })

  it('opens a compose draft and strips the shortcut param', async () => {
    render(<Probe />)
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
    expect(String(mockDispatch.mock.calls[0]?.[0]?.type ?? '')).toContain(
      'createDraft'
    )
    expect(mockReplace).toHaveBeenCalledWith('/u/0/INBOX')
  })
})
