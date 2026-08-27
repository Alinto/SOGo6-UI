/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import CachedDataIndicator from '../cached-data-indicator'

let mockIsOnline = false
let mockMailCache = true

jest.mock('next-intl', () => ({
  useTranslations:
    () => (key: string, values?: { folder?: string; time?: string }) => {
      if (values?.folder && values.time)
        return `${values.folder} as of ${values.time}`
      if (values?.time) return `Cached as of ${values.time}`
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

jest.mock('../../utils/cache-clock', () => ({
  formatCacheClock: () => '14:32',
}))

describe('CachedDataIndicator', () => {
  beforeEach(() => {
    mockIsOnline = false
    mockMailCache = true
  })

  it('renders folder as of time when asOf is provided', () => {
    render(<CachedDataIndicator asOf={1_700_000_000_000} folder="INBOX" />)
    expect(screen.getByRole('status')).toHaveTextContent('INBOX as of 14:32')
  })

  it('renders without a folder name', () => {
    render(<CachedDataIndicator asOf={1_700_000_000_000} />)
    expect(screen.getByRole('status')).toHaveTextContent('Cached as of 14:32')
  })

  it('renders nothing while online', () => {
    mockIsOnline = true
    const { container } = render(
      <CachedDataIndicator asOf={1_700_000_000_000} folder="INBOX" />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
