import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import AttendeeInput from '../attendee-input'

const mockUseSearchUsersQuery = jest.fn(() => ({
  data: [] as { uid: string; email: string; name: string; department?: string }[],
  isFetching: false,
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useSearchUsersQuery: (...args: unknown[]) => mockUseSearchUsersQuery(...args),
}))

jest.mock('next-intl', () => {
  const { calendarsMessagesT } = require('../../calendars-intl-mock')
  return {
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useLocale: () => 'en',
    useTranslations: (namespace?: string) => {
      if (namespace === 'CALENDARS') {
        return (key: string, values?: Record<string, string | number | boolean | Date>) =>
          calendarsMessagesT(key, values)
      }
      return (key: string) => key
    },
  }
})

describe('AttendeeInput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSearchUsersQuery.mockReturnValue({
      data: [],
      isFetching: false,
    })
  })

  describe('basic rendering', () => {
    it('renders the search combobox', () => {
      render(<AttendeeInput value={[]} onChange={jest.fn()} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders existing attendees as badges', () => {
      render(
        <AttendeeInput
          value={[{ email: 'john@example.com', name: 'John' }]}
          onChange={jest.fn()}
        />
      )
      expect(screen.getByText('John')).toBeInTheDocument()
    })
  })

  describe('keyboard and direct add', () => {
    it('adds a valid email on Enter', () => {
      const onChange = jest.fn()
      render(<AttendeeInput value={[]} onChange={onChange} />)
      const input = screen.getByRole('combobox')
      fireEvent.change(input, { target: { value: 'test@example.com' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).toHaveBeenCalledWith([{ email: 'test@example.com' }])
    })

    it('shows error for invalid email on Enter', () => {
      render(<AttendeeInput value={[]} onChange={jest.fn()} />)
      const input = screen.getByRole('combobox')
      fireEvent.change(input, { target: { value: 'notanemail' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument()
    })
  })

  describe('removal', () => {
    it('removes an attendee when remove control is activated', () => {
      const onChange = jest.fn()
      render(
        <AttendeeInput
          value={[{ email: 'john@example.com' }]}
          onChange={onChange}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /remove/i }))
      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('suggestions', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })
    afterEach(() => {
      jest.useRealTimers()
    })

    it('shows suggestion rows when API returns matches', async () => {
      mockUseSearchUsersQuery.mockReturnValue({
        data: [
          {
            uid: 'u1',
            email: 'suggest@example.com',
            name: 'Suggest User',
            department: 'Eng',
          },
        ],
        isFetching: false,
      })
      render(<AttendeeInput value={[]} onChange={jest.fn()} />)
      const input = screen.getByRole('combobox')
      fireEvent.change(input, { target: { value: 'sug' } })
      await act(async () => {
        jest.advanceTimersByTime(300)
      })
      await waitFor(() => {
        expect(screen.getByText('Suggest User')).toBeInTheDocument()
      })
      expect(screen.getByText('suggest@example.com')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('exposes combobox semantics on the input', () => {
      render(<AttendeeInput value={[]} onChange={jest.fn()} />)
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-expanded', 'false')
      expect(input).toHaveAttribute('aria-autocomplete', 'list')
    })
  })
})
