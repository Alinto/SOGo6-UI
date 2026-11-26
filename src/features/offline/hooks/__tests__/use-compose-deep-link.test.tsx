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

let mockPending: unknown = null
const mockToastError = jest.fn()

jest.mock('../../share/pending-share', () => ({
  consumePendingShare: async () => mockPending,
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}))

function draftData() {
  return mockDispatch.mock.calls[0]?.[0]?.payload?.initialData as {
    to: { email: string }[]
    subject: string
    body: string
  }
}

function Probe() {
  useComposeDeepLink()
  return null
}

describe('useComposeDeepLink', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockReplace.mockClear()
    mockSearch = new URLSearchParams('compose=1')
    mockPending = null
    mockToastError.mockClear()
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

  it('inserts mailto text as escaped HTML, subject as plain text', async () => {
    mockSearch = new URLSearchParams({
      compose: '1',
      mailto:
        'mailto:a@example.org?subject=%3Cb%3EHi&body=%3Cimg%20src%3Dx%3E%0D%0Aline2',
    })
    render(<Probe />)
    await waitFor(() => expect(mockDispatch).toHaveBeenCalled())
    expect(draftData()).toMatchObject({
      to: [{ email: 'a@example.org' }],
      subject: '<b>Hi',
      body: '<p>&lt;img src=x&gt;<br>line2</p>',
    })
  })

  it('escapes shared text and url', async () => {
    mockSearch = new URLSearchParams('share=1')
    mockPending = {
      to: '',
      subject: 'S',
      body: '<script>x</script>',
      url: 'https://e.example/?a=1&b=2',
      files: [],
    }
    render(<Probe />)
    await waitFor(() => expect(mockDispatch).toHaveBeenCalled())
    expect(draftData().body).toBe(
      '<p>&lt;script&gt;x&lt;/script&gt;<br>https://e.example/?a=1&amp;b=2</p>'
    )
  })

  it('reports a failed share import and strips the flag', async () => {
    mockSearch = new URLSearchParams('compose=1&share=1&share_error=1')
    render(<Probe />)
    await waitFor(() => expect(mockDispatch).toHaveBeenCalled())
    expect(mockToastError).toHaveBeenCalledWith('share_failed.string')
    expect(mockReplace).toHaveBeenCalledWith('/u/0/INBOX')
  })
})
