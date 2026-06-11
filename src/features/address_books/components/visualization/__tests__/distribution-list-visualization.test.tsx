import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => ({ book_id: 'work' }),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}))

jest.mock('../distribution-list-actions', () => ({
  __esModule: true,
  default: () => <div data-testid="distribution-list-actions" />,
}))

import type { VCard } from '../../../address-books-types'
import DistributionListVisualization from '../distribution-list-visualization'

const list: VCard = {
  id: 'list-1',
  version: '4.0',
  kind: 'group',
  firstName: 'Sales Team',
  lastName: '',
  note: 'Internal distribution list',
  members: [
    { contactId: 'c1', email: 'alice@example.com', displayName: 'Alice Smith' },
    { email: 'bob@example.com', displayName: 'Bob Jones' },
  ],
}

describe('DistributionListVisualization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders list name, badge and member count', () => {
      render(<DistributionListVisualization data={list} />)

      expect(screen.getByText('Sales Team')).toBeInTheDocument()
      expect(screen.getByText('DISTRIBUTION_LIST_FORM.list_badge.string')).toBeInTheDocument()
      expect(screen.getByText('DISTRIBUTION_LIST_FORM.member_count.string')).toBeInTheDocument()
      expect(screen.getByTestId('distribution-list-actions')).toBeInTheDocument()
    })

    it('renders note section when present', () => {
      render(<DistributionListVisualization data={list} />)
      expect(screen.getByText('Internal distribution list')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('navigates to member contact when clickable', async () => {
      const user = userEvent.setup()
      render(<DistributionListVisualization data={list} />)

      await user.click(screen.getByRole('button', { name: /Alice Smith/i }))
      expect(mockPush).toHaveBeenCalledWith('/address_books/work/c1')
    })

    it('does not navigate for manual email members', async () => {
      const user = userEvent.setup()
      render(<DistributionListVisualization data={list} />)

      await user.click(screen.getByRole('button', { name: /Bob Jones/i }))
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('configuration', () => {
    it('shows no members message when list is empty', () => {
      render(
        <DistributionListVisualization
          data={{ ...list, members: [] }}
        />
      )
      expect(screen.getByText('DISTRIBUTION_LIST_FORM.no_members.string')).toBeInTheDocument()
    })
  })
})
