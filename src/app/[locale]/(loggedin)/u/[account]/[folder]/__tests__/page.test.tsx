import { useGetFolderMessagesQuery } from '@/features/mails/store/mails-api'
import { render, screen, waitFor } from '@testing-library/react'
import { useParams, useSearchParams } from 'next/navigation'
import Page from '../page'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFolderMessagesQuery: jest.fn(),
}))

jest.mock('@/features/mails/components/skeletons/list-skeleton', () => {
  return function MockListSkeleton() {
    return <div data-testid="list-skeleton">Loading...</div>
  }
})

jest.mock('@/features/mails/components/list', () => {
  return function MockMessagesList({
    items,
    page,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading,
  }: any) {
    return (
      <div data-testid="messages-list">
        <div data-testid="items-count">{items.length}</div>
        <div data-testid="current-page">{page}</div>
        <div data-testid="total">{total}</div>
        <div data-testid="total-pages">{totalPages}</div>
        <div data-testid="has-next">{hasNextPage ? 'true' : 'false'}</div>
        <div data-testid="has-previous">
          {hasPreviousPage ? 'true' : 'false'}
        </div>
        <div data-testid="is-loading">{isLoading ? 'true' : 'false'}</div>
      </div>
    )
  }
})

describe('Mail Folder Page', () => {
  const mockSearchParams = new URLSearchParams()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({
      locale: 'en',
      account: 'test@example.com',
      folder: 'INBOX',
    })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
  })

  it('should render the page component', () => {
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: {
        mails: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      refetch: jest.fn(),
    })

    render(<Page />)
    expect(screen.getByTestId('messages-list')).toBeInTheDocument()
  })

  it('should show loading skeleton while fetching messages', () => {
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: jest.fn(),
    })

    render(<Page />)
    expect(screen.getByTestId('list-skeleton')).toBeInTheDocument()
  })

  it('should render messages list with data', async () => {
    const mockMessages = [
      { id: '1', subject: 'Test 1', from: 'sender1@example.com' },
      { id: '2', subject: 'Test 2', from: 'sender2@example.com' },
    ]

    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: {
        mails: mockMessages,
        page: 1,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      refetch: jest.fn(),
    })

    render(<Page />)

    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('2')
    })
  })

  it('should pass correct page information to MessagesList', () => {
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: {
        mails: [],
        page: 2,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      },
      isLoading: false,
      refetch: jest.fn(),
    })

    render(<Page />)

    expect(screen.getByTestId('current-page')).toHaveTextContent('2')
    expect(screen.getByTestId('total')).toHaveTextContent('50')
    expect(screen.getByTestId('total-pages')).toHaveTextContent('5')
    expect(screen.getByTestId('has-next')).toHaveTextContent('true')
    expect(screen.getByTestId('has-previous')).toHaveTextContent('true')
  })

  it('should extract folder from params correctly', () => {
    const mockRefetch = jest.fn()
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: {
        mails: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      refetch: mockRefetch,
    })
    ;(useParams as jest.Mock).mockReturnValue({
      folder: 'Sent',
    })

    render(<Page />)

    expect(useGetFolderMessagesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: 'Sent',
      })
    )
  })

  it('should handle array folder param', () => {
    const mockRefetch = jest.fn()
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: {
        mails: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      refetch: mockRefetch,
    })
    ;(useParams as jest.Mock).mockReturnValue({
      folder: ['Archive', 'Old'],
    })

    render(<Page />)

    expect(useGetFolderMessagesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: 'Archive/Old',
      })
    )
  })

  it('should pass search parameters to the query', () => {
    const mockRefetch = jest.fn()
    const searchParams = new URLSearchParams([
      ['sort', 'date'],
      ['order', 'desc'],
    ])

    ;(useSearchParams as jest.Mock).mockReturnValue(searchParams)
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: {
        mails: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      refetch: mockRefetch,
    })

    render(<Page />)

    expect(useGetFolderMessagesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {
          sort: 'date',
          order: 'desc',
        },
      })
    )
  })

  it('should handle empty messages array', () => {
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: {
        mails: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      refetch: jest.fn(),
    })

    render(<Page />)

    expect(screen.getByTestId('items-count')).toHaveTextContent('0')
  })

  it('should handle undefined data gracefully', () => {
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      refetch: jest.fn(),
    })

    render(<Page />)

    expect(screen.getByTestId('items-count')).toHaveTextContent('0')
    expect(screen.getByTestId('current-page')).toHaveTextContent('1')
    expect(screen.getByTestId('total')).toHaveTextContent('0')
  })

  it('should call useGetFolderMessagesQuery with new folder when folder changes', async () => {
    ;(useParams as jest.Mock).mockReturnValue({
      folder: 'INBOX',
    })
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: {
        mails: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      refetch: jest.fn(),
    })

    const { rerender } = render(<Page />)

    // Verify that the hook was called with INBOX
    expect(useGetFolderMessagesQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        folder: 'INBOX',
      })
    )

    // Change the folder to Drafts
    ;(useParams as jest.Mock).mockReturnValue({
      folder: 'Drafts',
    })

    // Re-render the component (simulate the route change)
    rerender(<Page />)

    // Verify that the hook was called with Drafts
    await waitFor(() => {
      expect(useGetFolderMessagesQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({
          folder: 'Drafts',
        })
      )
    })
  })

  it('should not call refetch while loading', () => {
    const mockRefetch = jest.fn()

    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: mockRefetch,
    })

    render(<Page />)

    // refetch should not be called immediately when isLoading is true
    expect(mockRefetch).not.toHaveBeenCalled()
  })

  it('should handle null folder param', () => {
    ;(useParams as jest.Mock).mockReturnValue({
      folder: null,
    })
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: {
        mails: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      refetch: jest.fn(),
    })

    render(<Page />)

    expect(useGetFolderMessagesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: '',
      })
    )
  })

  it('should show loading skeleton when data is loading', () => {
    ;(useGetFolderMessagesQuery as jest.Mock).mockReturnValue({
      data: {
        mails: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: true,
      refetch: jest.fn(),
    })

    render(<Page />)

    // When isLoading is true, the skeleton is shown regardless of data
    expect(screen.getByTestId('list-skeleton')).toBeInTheDocument()
  })
})
