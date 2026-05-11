import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import React from 'react'
import MailViewToggle from '../mail-view-toggle'

const mockPush = jest.fn()

jest.mock('@/features/app-data/store/user-preferences-api', () => ({
  useGetPreferencesQuery: jest.fn(() => ({ data: { mailDisplayMode: 'modern' } })),
  useUpdatePreferencesMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/u/account/INBOX'),
  useRouter: jest.fn(() => ({ push: mockPush })),
  useSearchParams: jest.fn(() => ({ toString: () => '' })),
  useParams: jest.fn(() => ({ account: 'account', folder: 'INBOX' })),
}))

jest.mock('@/components/ui/tooltip', () => ({
  TooltipWrapper: ({ children }: any) => <div>{children}</div>,
}))

const mockUpdatePreferences = jest.fn()

describe('MailViewToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { useGetPreferencesQuery, useUpdatePreferencesMutation } = require(
      '@/features/app-data/store/user-preferences-api'
    )
    useGetPreferencesQuery.mockReturnValue({ data: { mailDisplayMode: 'modern' } })
    useUpdatePreferencesMutation.mockReturnValue([mockUpdatePreferences, { isLoading: false }])
  })

  describe('basic rendering', () => {
    it('renders LayoutList icon when modern mode', () => {
      render(<MailViewToggle />)
      expect(screen.getByTestId('mail-view-toggle-layout-list')).toBeInTheDocument()
    })

    it('renders Columns2 icon when classic mode', () => {
      const { useGetPreferencesQuery } = require('@/features/app-data/store/user-preferences-api')
      useGetPreferencesQuery.mockReturnValue({ data: { mailDisplayMode: 'classic' } })
      render(<MailViewToggle />)
      expect(screen.getByTestId('mail-view-toggle-columns')).toBeInTheDocument()
    })

    it('renders button with aria-label', () => {
      render(<MailViewToggle />)
      expect(screen.getByRole('button', { name: 'Mail view toggle' })).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('calls updatePreferences and push when toggled from modern', async () => {
      const user = userEvent.setup()
      render(<MailViewToggle />)
      const button = screen.getByRole('button', { name: 'Mail view toggle' })
      await user.click(button)
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ mailDisplayMode: 'classic' })
      expect(mockPush).toHaveBeenCalled()
    })

    it('disables button when mutation is loading', () => {
      const { useUpdatePreferencesMutation } = require(
        '@/features/app-data/store/user-preferences-api'
      )
      useUpdatePreferencesMutation.mockReturnValue([mockUpdatePreferences, { isLoading: true }])
      render(<MailViewToggle />)
      const button = screen.getByRole('button', { name: 'Mail view toggle' })
      expect(button).toBeDisabled()
    })
  })
})
