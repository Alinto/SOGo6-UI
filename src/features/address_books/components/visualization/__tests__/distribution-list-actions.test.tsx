import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { VCard } from '../../../address-books-types'

const mockDispatch = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}))

jest.mock('../../../store/address-books-api', () => ({
  useDeleteVCardFromAddressBookMutation: () => [
    jest.fn().mockReturnValue({ unwrap: () => Promise.resolve() }),
  ],
}))

import DistributionListActions from '../distribution-list-actions'
import { openEditListForm } from '../../../store/address-books-ui-slice'

const list: VCard = {
  id: 'list-1',
  version: '4.0',
  kind: 'group',
  firstName: 'Sales Team',
  lastName: '',
  members: [{ email: 'a@example.com', displayName: 'Alice' }],
}

describe('DistributionListActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('dispatches openEditListForm on edit', async () => {
    const user = userEvent.setup()
    render(<DistributionListActions list={list} bookId="work" />)

    await user.click(screen.getByTestId('edit-list-button'))

    expect(mockDispatch).toHaveBeenCalledWith(
      openEditListForm({ listId: 'list-1', bookId: 'work' })
    )
  })

  it('dispatches createDraft on write message', async () => {
    const user = userEvent.setup()
    render(<DistributionListActions list={list} bookId="work" />)

    await user.click(screen.getByTestId('write-to-list-button'))

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('createDraft'),
      })
    )
  })
})
