import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/user-settings/store/user-preferences-api', () => ({
  useGetUserPreferencesQuery: () => ({ data: undefined }),
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="contact-form-dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import type { VCard } from '../../address-books-types'
import ContactForm from '../contact-form'

const contact: VCard = {
  id: 'c1',
  version: '4.0',
  firstName: 'John',
  lastName: 'Doe',
  emails: ['john@example.com'],
  phoneNumbers: ['+33123456789'],
}

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders create form when open', () => {
      render(
        <ContactForm open onClose={jest.fn()} onSubmit={jest.fn()} />
      )
      expect(screen.getByTestId('contact-form-dialog')).toBeInTheDocument()
      expect(screen.getByText('new_contact.string')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <ContactForm open={false} onClose={jest.fn()} onSubmit={jest.fn()} />
      )
      expect(screen.queryByTestId('contact-form-dialog')).not.toBeInTheDocument()
    })

    it('shows loading state', () => {
      render(
        <ContactForm
          open
          isLoading
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByTestId('contact-form-loading')).toBeInTheDocument()
    })

    it('shows load error state', () => {
      render(
        <ContactForm
          open
          loadError
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByTestId('contact-form-load-error')).toBeInTheDocument()
      expect(screen.getByText('load_error.title.string')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('shows edit title and prefills contact data', async () => {
      render(
        <ContactForm
          open
          contact={contact}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )

      expect(screen.getByText('edit_contact.string')).toBeInTheDocument()
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('calls onClose when cancel is clicked', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      render(
        <ContactForm open onClose={onClose} onSubmit={jest.fn()} />
      )

      await user.click(screen.getByRole('button', { name: 'cancel.string' }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
