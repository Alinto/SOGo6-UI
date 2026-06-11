import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="list-form-dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}))

import type { VCard } from '../../address-books-types'
import DistributionListForm from '../distribution-list-form'

const bookContacts: VCard[] = [
  {
    id: 'c1',
    version: '4.0',
    firstName: 'Alice',
    lastName: 'Smith',
    emails: ['alice@example.com'],
  },
]

const list: VCard = {
  id: 'list-1',
  version: '4.0',
  kind: 'group',
  firstName: 'Sales Team',
  lastName: '',
  members: [{ contactId: 'c1', email: 'alice@example.com', displayName: 'Alice Smith' }],
}

describe('DistributionListForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders create form when open', () => {
      render(
        <DistributionListForm
          open
          bookContacts={bookContacts}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByTestId('list-form-dialog')).toBeInTheDocument()
      expect(screen.getByText('DISTRIBUTION_LIST_FORM.new_list.string')).toBeInTheDocument()
    })

    it('shows loading state', () => {
      render(
        <DistributionListForm
          open
          isLoading
          bookContacts={bookContacts}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByTestId('list-form-loading')).toBeInTheDocument()
    })

    it('shows load error state', () => {
      render(
        <DistributionListForm
          open
          loadError
          bookContacts={bookContacts}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByTestId('list-form-load-error')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('shows edit title and prefills list data', async () => {
      render(
        <DistributionListForm
          open
          list={list}
          bookContacts={bookContacts}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )

      expect(screen.getByText('DISTRIBUTION_LIST_FORM.edit_list.string')).toBeInTheDocument()
      await waitFor(() => {
        expect(screen.getByDisplayValue('Sales Team')).toBeInTheDocument()
      })
    })

    it('lists individual contacts in scroll area', () => {
      render(
        <DistributionListForm
          open
          bookContacts={bookContacts}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('calls onClose when cancel is clicked', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      render(
        <DistributionListForm
          open
          bookContacts={bookContacts}
          onClose={onClose}
          onSubmit={jest.fn()}
        />
      )

      await user.click(screen.getByRole('button', { name: 'DISTRIBUTION_LIST_FORM.cancel.string' }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
