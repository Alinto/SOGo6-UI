'use client'

import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import React from 'react'
import MailViewToggle from '../list/mail-view-toggle'
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'

const mockUpdatePreferences = jest.fn()
const mockPush = jest.fn()

let mockUseUpdatePreferencesMutation: jest.Mock
let mockUseGetPreferencesQuery: jest.Mock

jest.mock('@/features/app-data/store/user-preferences-api', () => ({
  useGetPreferencesQuery: jest.fn(),
  useUpdatePreferencesMutation: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
  useParams: jest.fn(),
}))

jest.mock('@/components/ui/tooltip', () => ({
  TooltipWrapper: ({ children }: any) => <div>{children}</div>,
}))

const mockUseRouter = useRouter as jest.Mock
const mockUsePathname = usePathname as jest.Mock
const mockUseSearchParams = useSearchParams as jest.Mock
const mockUseParams = useParams as jest.Mock

describe('MailViewToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const prefsApi = require('@/features/app-data/store/user-preferences-api')
    mockUseUpdatePreferencesMutation = prefsApi.useUpdatePreferencesMutation
    mockUseGetPreferencesQuery = prefsApi.useGetPreferencesQuery
    mockUseUpdatePreferencesMutation.mockReturnValue([
      mockUpdatePreferences,
      { isLoading: false },
    ])
    mockUseGetPreferencesQuery.mockReturnValue({
      data: { mailDisplayMode: 'modern' },
    })
    mockUseRouter.mockReturnValue({ push: mockPush })
    mockUsePathname.mockReturnValue('/u/account/INBOX')
    mockUseSearchParams.mockReturnValue({ toString: () => '' })
    mockUseParams.mockReturnValue({ account: 'account', folder: 'INBOX' })
  })

  it('renders LayoutList icon when modern mode', () => {
    render(<MailViewToggle />)
    expect(screen.getByTestId('mail-view-toggle-layout-list')).toBeInTheDocument()
  })

  it('renders Columns2 icon when classic mode', () => {
    mockUseGetPreferencesQuery.mockReturnValue({
      data: { mailDisplayMode: 'classic' },
    })
    render(<MailViewToggle />)
    expect(screen.getByTestId('mail-view-toggle-columns')).toBeInTheDocument()
  })

  it('navigates to classic route when toggled on', async () => {
    const user = userEvent.setup()
    render(<MailViewToggle />)
    const button = screen.getByRole('button', { name: 'Mail view toggle' })
    await user.click(button)
    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      mailDisplayMode: 'classic',
    })
    expect(mockPush).toHaveBeenCalled()
  })

  it('navigates back to modern route with query preserved', async () => {
    mockUseGetPreferencesQuery.mockReturnValue({
      data: { mailDisplayMode: 'classic' },
    })
    mockUsePathname.mockReturnValue(
      '/u/account/INBOX/@classic/@visualization/123'
    )
    mockUseSearchParams.mockReturnValue({
      toString: () => 'scroll=1&filter=unread',
    })
    const user = userEvent.setup()
    render(<MailViewToggle />)
    const button = screen.getByRole('button', { name: 'Mail view toggle' })
    await user.click(button)
    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      mailDisplayMode: 'modern',
    })
    expect(mockPush).toHaveBeenCalledWith(
      '/u/account/INBOX/@classic/@visualization/123?scroll=1&filter=unread'
    )
  })

  it('disables button while mutation is loading', () => {
    mockUseUpdatePreferencesMutation.mockReturnValue([
      mockUpdatePreferences,
      { isLoading: true },
    ])
    render(<MailViewToggle />)
    const button = screen.getByRole('button', { name: 'Mail view toggle' })
    expect(button).toBeDisabled()
  })
})
