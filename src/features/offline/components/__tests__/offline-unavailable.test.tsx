/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import OfflineUnavailable from '../offline-unavailable'

let mockMailCache = true
let mockIsOnline = false

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { folder?: string }) =>
    values?.folder ? `${key}:${values.folder}` : key,
}))

jest.mock('../../flags', () => ({
  isPwaMailCacheEnabled: () => mockMailCache,
  isPwaEnabled: () => mockMailCache,
}))

jest.mock('../../network/use-network-status', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline, isProbing: false }),
}))

describe('OfflineUnavailable', () => {
  beforeEach(() => {
    mockMailCache = true
    mockIsOnline = false
  })

  it('renders a mail empty state', () => {
    render(<OfflineUnavailable force target="mail" />)

    expect(screen.getByTestId('offline-unavailable')).toHaveAttribute(
      'data-target',
      'mail'
    )
    expect(
      screen.getByText('offline_unavailable_mail_title.string')
    ).toBeInTheDocument()
    expect(
      screen.getByText('offline_unavailable_mail_body.string')
    ).toBeInTheDocument()
  })

  it('renders a folder empty state with the folder label', () => {
    render(<OfflineUnavailable force target="folder" label="Sent" />)

    expect(screen.getByTestId('offline-unavailable')).toHaveAttribute(
      'data-target',
      'folder'
    )
    expect(
      screen.getByText('offline_unavailable_folder_title.string:Sent')
    ).toBeInTheDocument()
    expect(
      screen.getByText('offline_unavailable_folder_body.string')
    ).toBeInTheDocument()
  })

  it('uses an unnamed folder title when the label is missing', () => {
    render(<OfflineUnavailable force target="folder" />)

    expect(
      screen.getByText('offline_unavailable_folder_unnamed_title.string')
    ).toBeInTheDocument()
  })

  it('renders a calendar empty state', () => {
    render(<OfflineUnavailable force target="calendar" />)

    expect(screen.getByTestId('offline-unavailable')).toHaveAttribute(
      'data-target',
      'calendar'
    )
    expect(
      screen.getByText('offline_unavailable_calendar_title.string')
    ).toBeInTheDocument()
  })

  it('renders a settings empty state', () => {
    render(<OfflineUnavailable force target="settings" />)

    expect(screen.getByTestId('offline-unavailable')).toHaveAttribute(
      'data-target',
      'settings'
    )
    expect(
      screen.getByText('offline_unavailable_settings_title.string')
    ).toBeInTheDocument()
  })

  it('renders a notes empty state', () => {
    render(<OfflineUnavailable force target="notes" />)

    expect(screen.getByTestId('offline-unavailable')).toHaveAttribute(
      'data-target',
      'notes'
    )
    expect(
      screen.getByText('offline_unavailable_notes_title.string')
    ).toBeInTheDocument()
    expect(
      screen.getByText('offline_unavailable_notes_body.string')
    ).toBeInTheDocument()
  })
})
