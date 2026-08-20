/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OfflineNavProvider, useOfflineNav } from '../offline-nav-context'

const mockPush = jest.fn()
const mockReadHeaders = jest.fn()
const mockReadBody = jest.fn()
let mockIsOnline = true
let mockMailCache = true
let mockOutbox = true

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next/navigation', () => ({
  useParams: () => ({ account: '0', folder: 'INBOX' }),
}))

jest.mock('../flags', () => ({
  isPwaMailCacheEnabled: () => mockMailCache,
  isPwaOutboxEnabled: () => mockOutbox,
}))

jest.mock('../network/use-network-status', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline, isProbing: false }),
}))

jest.mock('../hooks/use-mail-cache', () => ({
  useMailCache: () => ({
    readHeaders: mockReadHeaders,
    readBody: mockReadBody,
  }),
}))

jest.mock('../auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

function Probe() {
  const { view, openFolder, openOutbox, openMail } = useOfflineNav()
  return (
    <div>
      <span data-testid="kind">{view.kind}</span>
      <button type="button" onClick={() => void openFolder('0', 'Sent')}>
        folder
      </button>
      <button type="button" onClick={() => openOutbox('0')}>
        outbox
      </button>
      <button
        type="button"
        onClick={() => void openMail('0', 'INBOX', 'inbox_003')}
      >
        mail
      </button>
    </div>
  )
}

describe('OfflineNavProvider', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockReadHeaders.mockReset()
    mockReadBody.mockReset()
    mockIsOnline = true
    mockMailCache = true
    mockOutbox = true
  })

  it('navigates to a folder when online', async () => {
    const user = userEvent.setup()
    render(
      <OfflineNavProvider>
        <Probe />
      </OfflineNavProvider>
    )

    await user.click(screen.getByRole('button', { name: 'folder' }))

    expect(mockPush).toHaveBeenCalledWith('/u/0/Sent')
    expect(screen.getByTestId('kind')).toHaveTextContent('route')
  })

  it('stays on the current page when the folder was never cached', async () => {
    mockIsOnline = false
    mockReadHeaders.mockResolvedValue([])
    const user = userEvent.setup()
    render(
      <OfflineNavProvider>
        <Probe />
      </OfflineNavProvider>
    )

    await user.click(screen.getByRole('button', { name: 'folder' }))

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByTestId('kind')).toHaveTextContent('unavailable')
  })

  it('opens a cached folder without a Next.js navigation', async () => {
    mockIsOnline = false
    mockReadHeaders.mockResolvedValue([{ mailId: '1' }])
    const user = userEvent.setup()
    render(
      <OfflineNavProvider>
        <Probe />
      </OfflineNavProvider>
    )

    await user.click(screen.getByRole('button', { name: 'folder' }))

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByTestId('kind')).toHaveTextContent('folder')
  })

  it('opens the outbox panel without a Next.js navigation when offline', async () => {
    mockIsOnline = false
    const user = userEvent.setup()
    render(
      <OfflineNavProvider>
        <Probe />
      </OfflineNavProvider>
    )

    await user.click(screen.getByRole('button', { name: 'outbox' }))

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByTestId('kind')).toHaveTextContent('outbox')
  })

  it('opens a cached mail without a Next.js navigation when offline', async () => {
    mockIsOnline = false
    mockReadBody.mockResolvedValue({ id: 'inbox_003' })
    const user = userEvent.setup()
    render(
      <OfflineNavProvider>
        <Probe />
      </OfflineNavProvider>
    )

    await user.click(screen.getByRole('button', { name: 'mail' }))

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByTestId('kind')).toHaveTextContent('mail')
  })

  it('does not navigate to an uncached mail when offline', async () => {
    mockIsOnline = false
    mockReadBody.mockResolvedValue(null)
    const user = userEvent.setup()
    render(
      <OfflineNavProvider>
        <Probe />
      </OfflineNavProvider>
    )

    await user.click(screen.getByRole('button', { name: 'mail' }))

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByTestId('kind')).toHaveTextContent('unavailable')
  })
})
