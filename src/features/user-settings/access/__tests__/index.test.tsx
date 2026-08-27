import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import GlobalAccessSettings from '../index'
import { useGetGlobalAccessQuery } from '../store/access-api'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('../store/access-api', () => ({
  useGetGlobalAccessQuery: jest.fn(),
}))

jest.mock('../components/global-access-user-row', () => ({
  __esModule: true,
  default: ({
    entry,
    onRemovePending,
  }: {
    entry: { key: string; uid: string }
    onRemovePending?: () => void
  }) => (
    <div data-testid="global-access-user-row">
      {entry.uid}
      {onRemovePending && (
        <button onClick={onRemovePending}>remove-{entry.uid}</button>
      )}
    </div>
  ),
}))

jest.mock('../components/global-access-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="global-access-skeleton" />,
}))

jest.mock('../components/add-user-dialog', () => ({
  __esModule: true,
  default: ({
    open,
    existingKeys,
    onAdd,
  }: {
    open: boolean
    existingKeys: Set<string>
    onAdd: (email: string) => void
  }) =>
    open ? (
      <div data-testid="add-user-dialog">
        <span data-testid="existing-keys">{Array.from(existingKeys).join(',')}</span>
        <button onClick={() => onAdd('newuser@example.com')}>confirm-add</button>
      </div>
    ) : null,
}))

describe('GlobalAccessSettings', () => {
  const mockTranslate = jest.fn((key: string) => key)

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
  })

  it('renders page title and description', () => {
    ;(useGetGlobalAccessQuery as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    })

    render(<GlobalAccessSettings />)

    expect(screen.getByText('title.string')).toBeInTheDocument()
    expect(screen.getByText('page.description.string')).toBeInTheDocument()
  })

  it('shows skeleton while loading', () => {
    ;(useGetGlobalAccessQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(<GlobalAccessSettings />)

    expect(screen.getByTestId('global-access-skeleton')).toBeInTheDocument()
  })

  it('renders one row per user entry', () => {
    ;(useGetGlobalAccessQuery as jest.Mock).mockReturnValue({
      data: [
        { key: 'alice@example.com', uid: 'alice', grants: [] },
        { key: 'bob@example.com', uid: 'bob', grants: [] },
      ],
      error: undefined,
      isLoading: false,
    })

    render(<GlobalAccessSettings />)

    expect(screen.getAllByTestId('global-access-user-row')).toHaveLength(2)
  })

  it('shows empty state when nobody has access to anything', () => {
    ;(useGetGlobalAccessQuery as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    })

    render(<GlobalAccessSettings />)

    expect(screen.getByText('empty.string')).toBeInTheDocument()
  })

  it('shows generic load error for failures', () => {
    ;(useGetGlobalAccessQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: { status: 500 },
      isLoading: false,
    })

    render(<GlobalAccessSettings />)

    expect(screen.getByText('errors_api.load_failed.string')).toBeInTheDocument()
  })

  describe('adding a pending user', () => {
    beforeEach(() => {
      ;(useGetGlobalAccessQuery as jest.Mock).mockReturnValue({
        data: [{ key: 'alice@example.com', uid: 'alice', c_email: 'alice@example.com', grants: [] }],
        error: undefined,
        isLoading: false,
      })
    })

    it('opens the add-user dialog from the Add button', async () => {
      const user = userEvent.setup()
      render(<GlobalAccessSettings />)

      expect(screen.queryByTestId('add-user-dialog')).not.toBeInTheDocument()
      await user.click(screen.getByText('addUser.button.string'))
      expect(screen.getByTestId('add-user-dialog')).toBeInTheDocument()
    })

    it('passes the current entries as existing keys to dedupe against', async () => {
      const user = userEvent.setup()
      render(<GlobalAccessSettings />)

      await user.click(screen.getByText('addUser.button.string'))
      expect(screen.getByTestId('existing-keys')).toHaveTextContent('alice@example.com')
    })

    it('adds a grant-less row for the newly added email, without duplicating an existing one', async () => {
      const user = userEvent.setup()
      render(<GlobalAccessSettings />)

      expect(screen.getAllByTestId('global-access-user-row')).toHaveLength(1)

      await user.click(screen.getByText('addUser.button.string'))
      await user.click(screen.getByText('confirm-add'))

      const rows = screen.getAllByTestId('global-access-user-row')
      expect(rows).toHaveLength(2)
      expect(rows.some((row) => row.textContent?.includes('newuser@example.com'))).toBe(true)
    })

    it('removes a pending row when its onRemovePending callback fires', async () => {
      const user = userEvent.setup()
      render(<GlobalAccessSettings />)

      await user.click(screen.getByText('addUser.button.string'))
      await user.click(screen.getByText('confirm-add'))
      expect(screen.getAllByTestId('global-access-user-row')).toHaveLength(2)

      await user.click(screen.getByText('remove-newuser@example.com'))
      expect(screen.getAllByTestId('global-access-user-row')).toHaveLength(1)
    })
  })
})
