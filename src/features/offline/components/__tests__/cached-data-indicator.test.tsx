/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import CachedDataIndicator from '../cached-data-indicator'

let mockIsOnline = false
let mockMailCache = true

jest.mock('next-intl', () => ({
  useTranslations:
    () =>
    (
      key: string,
      values?: { folder?: string; time?: string; used?: string; quota?: string }
    ) => {
      if (values?.folder && values.time)
        return `${values.folder} as of ${values.time}`
      if (values?.time) return `Cached as of ${values.time}`
      if (values?.used && values.quota)
        return `${values.used} / ${values.quota}`
      return key
    },
  useLocale: () => 'en',
}))

jest.mock('../../flags', () => ({
  isPwaMailCacheEnabled: () => mockMailCache,
}))

jest.mock('../../network/use-network-status', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline, isProbing: false }),
}))

jest.mock('../../storage/quota', () => ({
  estimateStorage: async () => ({
    usage: 12 * 1024 * 1024,
    quota: 50 * 1024 * 1024,
  }),
  formatBytes: (bytes: number) => `${Math.round(bytes / (1024 * 1024))} MB`,
}))

jest.mock('../../utils/cache-clock', () => ({
  formatCacheClock: () => '14:32',
}))

describe('CachedDataIndicator', () => {
  beforeEach(() => {
    mockIsOnline = false
    mockMailCache = true
  })

  it('renders folder as of time when asOf is provided', async () => {
    render(<CachedDataIndicator asOf={1_700_000_000_000} folder="INBOX" />)
    expect(screen.getByRole('status')).toHaveTextContent('INBOX as of 14:32')
    expect(await screen.findByText('12 MB / 50 MB')).toBeInTheDocument()
  })

  it('renders without a folder name', async () => {
    render(<CachedDataIndicator asOf={1_700_000_000_000} />)
    expect(screen.getByRole('status')).toHaveTextContent('Cached as of 14:32')
    expect(await screen.findByText('12 MB / 50 MB')).toBeInTheDocument()
  })

  it('renders nothing while online', () => {
    mockIsOnline = true
    const { container } = render(
      <CachedDataIndicator asOf={1_700_000_000_000} folder="INBOX" />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
