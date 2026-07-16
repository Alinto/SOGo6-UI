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
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode
    open?: boolean
  }) => (open ? <div data-testid="contact-form-dialog">{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
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
      render(<ContactForm open onClose={jest.fn()} onSubmit={jest.fn()} />)
      expect(screen.getByTestId('contact-form-dialog')).toBeInTheDocument()
      expect(screen.getByText('new_contact.string')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <ContactForm open={false} onClose={jest.fn()} onSubmit={jest.fn()} />
      )
      expect(
        screen.queryByTestId('contact-form-dialog')
      ).not.toBeInTheDocument()
    })

    it('shows loading state', () => {
      render(
        <ContactForm open isLoading onClose={jest.fn()} onSubmit={jest.fn()} />
      )
      expect(screen.getByTestId('contact-form-loading')).toBeInTheDocument()
    })

    it('shows load error state', () => {
      render(
        <ContactForm open loadError onClose={jest.fn()} onSubmit={jest.fn()} />
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
      render(<ContactForm open onClose={onClose} onSubmit={jest.fn()} />)

      await user.click(screen.getByRole('button', { name: 'cancel.string' }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('photo upload', () => {
    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-preview')
      global.URL.revokeObjectURL = jest.fn()

      class MockFileReader {
        result: string | null = null
        onload: (() => void) | null = null
        onerror: (() => void) | null = null

        readAsDataURL() {
          this.result = 'data:image/png;base64,ZmFrZS1pbWFnZQ=='
          this.onload?.()
        }
      }

      jest
        .spyOn(global, 'FileReader')
        .mockImplementation(() => new MockFileReader() as unknown as FileReader)
    })

    it('shows a preview after selecting an image without crashing the form', async () => {
      const user = userEvent.setup()
      const file = new File(['fake-image'], 'avatar.png', { type: 'image/png' })

      render(<ContactForm open onClose={jest.fn()} onSubmit={jest.fn()} />)

      expect(screen.getByTestId('contact-photo-input')).toBeInTheDocument()

      await user.upload(screen.getByTestId('contact-photo-input'), file)

      await waitFor(() => {
        expect(screen.getByTestId('contact-photo-preview')).toBeInTheDocument()
      })
      expect(screen.getByText('new_contact.string')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'create.string' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('textbox', { name: 'fields.first_name.string' })
      ).toBeInTheDocument()
    })

    it('passes the encoded photo on submit', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      const file = new File(['fake-image'], 'avatar.png', { type: 'image/png' })

      render(<ContactForm open onClose={jest.fn()} onSubmit={onSubmit} />)

      await user.type(
        screen.getByRole('textbox', { name: 'fields.first_name.string' }),
        'Jane'
      )
      await user.type(
        screen.getByRole('textbox', { name: 'fields.last_name.string' }),
        'Doe'
      )
      await user.upload(screen.getByTestId('contact-photo-input'), file)

      await waitFor(() => {
        expect(screen.getByTestId('contact-photo-preview')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'create.string' }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Jane',
            lastName: 'Doe',
            clearPhoto: false,
            photoDataUri: 'data:image/png;base64,ZmFrZS1pbWFnZQ==',
          }),
          undefined
        )
      })
    })
  })
})
