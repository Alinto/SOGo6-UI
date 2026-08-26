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
  isPwaEnabled: () => mockMailCache,
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
  const {
    view,
    openFolder,
    openOutbox,
    openMail,
    navigateApp,
    folderPathOverride,
  } = useOfflineNav()
  const target = view.kind === 'unavailable' ? view.target : ''
  const label = view.kind === 'unavailable' ? (view.label ?? '') : ''
  return (
    <div>
      <span data-testid="kind">{view.kind}</span>
      <span data-testid="target">{target}</span>
      <span data-testid="label">{label}</span>
      <span data-testid="override">{folderPathOverride ?? ''}</span>
      <button
        type="button"
        onClick={() => void openFolder('0', 'Sent', 'Sent')}
      >
        folder
      </button>
      <button
        type="button"
        onClick={() => void openFolder('0', 'INBOX', 'Inbox')}
      >
        inbox-miss
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
      <button type="button" onClick={() => navigateApp('/calendars')}>
        calendars
      </button>
      <button
        type="button"
        onClick={() => navigateApp('/user_settings/profile')}
      >
        settings
      </button>
      <button type="button" onClick={() => navigateApp('/notes')}>
        notes
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
    expect(screen.getByTestId('target')).toHaveTextContent('folder')
    expect(screen.getByTestId('label')).toHaveTextContent('Sent')
    expect(screen.getByTestId('override')).toHaveTextContent('Sent')
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
    expect(screen.getByTestId('override')).toHaveTextContent('Sent')
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
    expect(screen.getByTestId('override')).toHaveTextContent('INBOX')
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
    expect(screen.getByTestId('target')).toHaveTextContent('mail')
    expect(screen.getByTestId('override')).toHaveTextContent('INBOX')
  })

  it('replaces the empty state when another uncached folder is opened', async () => {
    mockIsOnline = false
    mockReadHeaders.mockResolvedValue([])
    const user = userEvent.setup()
    render(
      <OfflineNavProvider>
        <Probe />
      </OfflineNavProvider>
    )

    await user.click(screen.getByRole('button', { name: 'folder' }))
    await user.click(screen.getByRole('button', { name: 'inbox-miss' }))

    expect(screen.getByTestId('kind')).toHaveTextContent('unavailable')
    expect(screen.getByTestId('target')).toHaveTextContent('folder')
    expect(screen.getByTestId('label')).toHaveTextContent('Inbox')
    expect(screen.getByTestId('override')).toHaveTextContent('INBOX')
  })

  it('opens an in-app overlay for calendar instead of navigating when offline', async () => {
    mockIsOnline = false
    const user = userEvent.setup()
    render(
      <OfflineNavProvider>
        <Probe />
      </OfflineNavProvider>
    )

    await user.click(screen.getByRole('button', { name: 'calendars' }))

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByTestId('kind')).toHaveTextContent('unavailable')
    expect(screen.getByTestId('target')).toHaveTextContent('calendar')
    expect(screen.getByTestId('override')).toHaveTextContent('')
  })

  it('opens an in-app overlay for settings instead of navigating when offline', async () => {
    mockIsOnline = false
    const user = userEvent.setup()
    render(
      <OfflineNavProvider>
        <Probe />
      </OfflineNavProvider>
    )

    await user.click(screen.getByRole('button', { name: 'settings' }))

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByTestId('target')).toHaveTextContent('settings')
  })

  it('opens an in-app overlay for notes instead of navigating when offline', async () => {
    mockIsOnline = false
    const user = userEvent.setup()
    render(
      <OfflineNavProvider>
        <Probe />
      </OfflineNavProvider>
    )

    await user.click(screen.getByRole('button', { name: 'notes' }))

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByTestId('kind')).toHaveTextContent('unavailable')
    expect(screen.getByTestId('target')).toHaveTextContent('notes')
  })
})
