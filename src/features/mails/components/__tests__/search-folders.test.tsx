import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockFolders = [
  {
    name: 'INBOX',
    path: 'INBOX',
    type: 'INBOX' as const,
    unseen_count: 0,
    messages: 1,
    flags: [],
    delimiter: '/',
    readOnly: false,
    selectable: true,
    subfolders: [
      {
        name: 'Work',
        path: 'INBOX/Work',
        type: 'NORMAL' as const,
        unseen_count: 0,
        messages: 0,
        flags: [],
        delimiter: '/',
        readOnly: false,
        selectable: true,
      },
    ],
  },
  {
    name: 'Archive',
    path: 'Archive',
    type: 'NORMAL' as const,
    unseen_count: 0,
    messages: 0,
    flags: [],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
]

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(() => ({ data: mockFolders })),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('react-virtualized', () => ({
  AutoSizer: ({ children }: { children: (size: { height: number; width: number }) => React.ReactNode }) =>
    children({ height: 384, width: 288 }),
  List: ({ rowCount, rowRenderer }: { rowCount: number; rowRenderer: (args: { index: number; key: string; style: object }) => React.ReactNode }) => (
    <div data-testid="virtual-list">
      {Array.from({ length: rowCount }, (_, index) =>
        rowRenderer({ index, key: String(index), style: {} })
      )}
    </div>
  ),
}))

jest.mock('lucide-react/dynamic', () => ({
  DynamicIcon: () => <span data-testid="folder-icon" />,
}))

import SearchFolders from '../search-folders'

describe('SearchFolders', () => {
  it('renders trigger button with translation key when nothing is selected', () => {
    render(<SearchFolders value="all" onValueChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'search.others.string' })).toBeInTheDocument()
  })

  it('shows the selected folder name on the trigger button', () => {
    render(<SearchFolders value="INBOX/Work" onValueChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Work' })).toBeInTheDocument()
  })

  it('stays inert when the selected value is a pinned quick-select folder', () => {
    render(
      <SearchFolders
        value="INBOX"
        onValueChange={jest.fn()}
        pinnedPaths={['INBOX']}
      />
    )
    expect(
      screen.getByRole('button', { name: 'search.others.string' })
    ).toBeInTheDocument()
  })

  it('filters folder list when typing in search input', async () => {
    const user = userEvent.setup()
    render(<SearchFolders value="all" onValueChange={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: 'search.others.string' }))
    await user.type(screen.getByPlaceholderText('search.folders.string'), 'Work')

    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('INBOX')).toBeInTheDocument()
    expect(screen.queryByText('Archive')).not.toBeInTheDocument()
  })

  it('calls onValueChange with the folder path when a folder is picked', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()
    render(<SearchFolders value="all" onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'search.others.string' }))
    await user.click(screen.getByText('Archive'))

    expect(onValueChange).toHaveBeenCalledWith('Archive')
  })
})
